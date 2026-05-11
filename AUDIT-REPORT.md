# JBRTECHNO — تقرير مراجعة معمارية شامل

> **تاريخ المراجعة:** 2026-05-10
> **النطاق:** `DataLayer/` · `Homepage/` · `dashboard/` (المونوليث القديم في `OldBeforeSpliting/` مرجع فقط)
> **الهدف:** توثيق الحالة الحالية وتحديد المشاكل قبل البدء في التاسكات.

---

## 📑 المحتويات

1. [خلاصة تنفيذية](#1-خلاصة-تنفيذية)
2. [المعمارية العامة](#2-المعمارية-العامة)
3. [DataLayer — الطبقة المشتركة](#3-datalayer--الطبقة-المشتركة)
4. [Homepage — الموقع العام](#4-homepage--الموقع-العام)
5. [Dashboard — لوحة الإدارة](#5-dashboard--لوحة-الإدارة)
6. [مشاكل حرجة (Critical Issues)](#6-مشاكل-حرجة-critical-issues)
7. [مصفوفة المخاطر الكاملة](#7-مصفوفة-المخاطر-الكاملة)
8. [خارطة طريق التاسكات المقترحة](#8-خارطة-طريق-التاسكات-المقترحة)

---

## 1. خلاصة تنفيذية

تم تقسيم المشروع من مونوليث (موجود في `OldBeforeSpliting/`) إلى ثلاث مجلدات منفصلة:

| المجلد | الدور | الحالة |
|---|---|---|
| **DataLayer** | طبقة Prisma مشتركة (MongoDB) | ⚠️ **هيكل ناقص** — مجرد schema بدون `package.json` |
| **Homepage** | موقع عام (Next.js 16) | ✅ يعمل، بدون auth |
| **Dashboard** | لوحة إدارة (Next.js 16 + NextAuth v5) | ⚠️ يعمل لكن فيه ثغرات أمنية حرجة |

**الحكم العام:** التقسيم **غير مكتمل**. كل تطبيق ينسخ schema لنفسه بدل ما يستهلك DataLayer كحزمة، وقد بدأ schema drift فعلاً. توجد ثلاث مشاكل أمنية حرجة (passwords plaintext، .env مكشوف، dashboard بدون middleware) يجب معالجتها قبل أي إنتاج.

---

## 2. المعمارية العامة

```
JBRTECHNO/
├── OldBeforeSpliting/   ← المونوليث القديم (مرجع فقط)
├── DataLayer/           ← Prisma schema + seed (بدون package.json)
│   └── prisma/
│       ├── schema.prisma   (15 model, 14 enum)
│       └── seed.ts          (يحتوي كلمة سر plaintext!)
├── Homepage/            ← Next.js 16, public site
│   ├── app/[locale]/...    (ar/en عبر next-intl)
│   ├── prisma/schema.prisma  ⚠️ نسخة من DataLayer
│   ├── lib/prisma.ts
│   └── actions/             (server actions)
└── dashboard/           ← Next.js 16, admin panel
    ├── app/...              (عربي فقط، بدون locale routing)
    ├── prisma/schema.prisma  ⚠️ نسخة مختلفة بدأ فيها drift
    ├── auth.config.ts        (NextAuth v5)
    ├── proxy.ts              (6.4KB — لكنه ليس Next.js middleware)
    └── actions/              (5732 LOC تقريباً)
```

### مشكلة التقسيم الجوهرية

- لا يوجد **workspace** (لا pnpm workspace، لا Turborepo، لا monorepo حقيقي).
- **DataLayer لا يُستخدم فعلياً** كمصدر مشترك. كل من Homepage و dashboard يحتفظ بنسخة كاملة من schema.prisma و يولّد `@prisma/client` خاص به في `node_modules`.
- النتيجة: ثلاث نسخ من schema يجب مزامنتها يدوياً — وهذا فشل بالفعل (drift بين dashboard و DataLayer).

---

## 3. DataLayer — الطبقة المشتركة

### 3.1 الهيكل
```
DataLayer/
└── prisma/
    ├── schema.prisma   (418 سطر)
    └── seed.ts          (227 سطر)
```

### 3.2 ما هو موجود
- `schema.prisma` كامل بـ 15 موديل و 14 enum.
- `seed.ts` ينشئ:
  - مستخدم SUPER_ADMIN واحد (`nadish` / `Leno_1972` plaintext 🔴)
  - 8 مهام تجريبية + 5 ملاحظات إدارية
  - Migration للـ `UserRoutePermission`

### 3.3 ما هو مفقود
- ❌ `package.json`
- ❌ `tsconfig.json`
- ❌ `index.ts` / exports
- ❌ `.env.example`
- ❌ مجلد migrations (يستخدم `prisma db push` فقط)
- ❌ README

### 3.4 موديلات Prisma (قائمة سريعة)

| الموديل | الوظيفة | حقول مهمة |
|---|---|---|
| `Application` | طلبات التوظيف | applicantName, position, status, scheduledInterviewDate, cvUrl |
| `Phase1Requirement` | متطلبات المرحلة 1 | category, priority, status |
| `Transaction` | حركات مالية | type (EXPENSE/REVENUE), amount, categoryId |
| `ContactMessage` | رسائل التواصل | locale, source |
| `InterviewResult` | نتائج المقابلات | rating, strengths[], weaknesses[] |
| `Staff` | الموظفون | trial dates, salary, ndaSignedDate, emergencyContact (JSON) |
| `User` | المستخدمون | email, password (plaintext!), role, isActive |
| `UserRoutePermission` | صلاحيات المسارات | userId + route (composite unique) |
| `Category` | شجرة الحسابات | parentId (self-referential), type |
| `Cost` | المصاريف | type (FIXED/VARIABLE), categoryId |
| `SourceOfIncome` | مصادر الدخل | type (SUBSCRIPTION/ONE_TIME/RECURRING) |
| `Task` | المهام | status, priority, assignedToUserId |
| `ManagementNote` | الملاحظات الإدارية | type, targetAudience, parentNoteId (threads) |

### 3.5 الـ Enums (14)
`ApplicationStatus`, `RequirementStatus`, `RequirementPriority`, `TransactionType`, `InterviewResultStatus`, `StaffStatus`, **`UserRole`** (SUPER_ADMIN/ADMIN/STAFF — لكن ADMIN محذوف في dashboard!), `CategoryType`, `CostType`, `SourceOfIncomeType`, `TaskStatus`, `TaskPriority`, `NoteType`, `TargetAudience`.

### 3.6 الـ Datasource
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
generator client { provider = "prisma-client-js" }
```
- لا توجد `previewFeatures`.
- لا يوجد `output` مخصص — كل تطبيق يولّد client في `node_modules` الخاص به.

---

## 4. Homepage — الموقع العام

### 4.1 الـ Stack
- Next.js **16.0.10** (App Router فقط)
- React 19.2.3
- Prisma 6.18.0 (MongoDB)
- next-intl 4.5.5 (ar/en)
- Tailwind 3.4.17 + shadcn/ui (Radix)
- Zod 4.1.12
- Cloudinary للصور والـCV

### 4.2 شجرة المسارات
```
app/
├── layout.tsx                          (root metadata)
├── not-found.tsx
└── [locale]/
    ├── layout.tsx                      (NextIntlClientProvider, Tajawal)
    ├── page.tsx                        (الصفحة الرئيسية)
    ├── careers/page.tsx
    ├── careers/apply/[position]/page.tsx
    ├── contact/page.tsx
    ├── interview/[token]/page.tsx      (use client)
    └── privacy/page.tsx

api/
├── upload/route.ts                     (POST → Cloudinary)
└── applications/[id]/route.ts          (موجود — يحتاج تحقق من التطبيق)
```

### 4.3 i18n
- **اللغات:** `ar` (default), `en`
- **الرسائل:** `messages/ar.json`, `messages/en.json` (static imports)
- **الإعداد:** `i18n/request.ts`, `i18n/routing.ts`
- **RTL:** `dir="rtl"` للعربي
- ⚠️ **لا يوجد middleware.ts** لإجبار locale prefix

### 4.4 Server Actions
| Action | الوظيفة |
|---|---|
| `submitApplication.ts` | إنشاء Application + إشعار WhatsApp |
| `submitContactMessage.ts` | إنشاء ContactMessage مع locale |
| `submitInterviewResponse.ts` | تحديث Application بإجابات المقابلة |
| `sendWhatsAppNotification.ts` | إرسال WhatsApp |

### 4.5 Auth
- ❌ **لا يوجد auth** على Homepage إطلاقاً.
- ⚠️ `.env` يحتوي `NEXTAUTH_SECRET` و `NEXTAUTH_URL` (مخلفات من المونوليث، غير مستخدمة).

### 4.6 Components
```
components/
├── ui/         (shadcn primitives)
├── forms/      (ContactForm, CVUpload, ProfileImageUpload)
├── layout/     (Navigation, PublicShell, WhatsAppButton)
├── common/     (CollapsibleCard, MetricCard, SuccessDialog, ThemeToggle, ...)
└── planning/   (PlanTimeline, TimelineView)
```

### 4.7 ملاحظات على Helpers/Lib
- `helpers/extractMetrics.ts` فيه **بيانات hardcoded** لمواقع الوظائف، الميزانية، الجدول الزمني — يجب نقلها لقاعدة البيانات أو CMS.
- `lib/cloudinary.ts` فيه paths hardcoded (`modonty/applications`, `modonty/applications/profiles`).
- `types/` مجلد فاضي.

### 4.8 Scripts المتوفرة
```json
"dev", "build" (= prisma generate && next build), "start", "lint",
"migrate:db", "migrate:db:direct",
"seed:categories", "seed:source-of-income", "seed"
```

---

## 5. Dashboard — لوحة الإدارة

### 5.1 الـ Stack
- Next.js 16.0.10, React 19.2.3, TypeScript 5.7.2
- **NextAuth 5.0.0-beta.30** (Credentials provider, JWT strategy)
- @auth/prisma-adapter 2.11.1
- Prisma 6.18.0 (schema منفصل)
- Tailwind 3.4.17 + shadcn/ui
- Zod 4.1.12
- Cloudinary, Resend (email)، Clockify (time tracking)
- next-intl 4.5.5 ⚠️ (مثبّت لكن غير مفعّل)

### 5.2 شجرة المسارات (35+ صفحة)
**عام:** `/login`
**محمي (يحتاج auth):**
`/`, `/accounting`, `/categories`, `/clockify-users`, `/contact-messages`, `/contracts`, `/costs`, `/customers`, `/my-time`, `/notes/[noteId]`, `/organizational-structure`, `/reports`, `/settings/profile`, `/source-of-income/[id]`, `/staff/[id]`, `/subscriptions`, `/tasks/[id]`, `/tasks/my-tasks`, `/time-tracking/[staffId]`, `/users/[userId]/permissions`, `/applications/[id]`, `/applications/interviews`, `/applications/position/[position]`, `/applications/interview-result/[applicationId]`, `/no-permissions`

**API Routes:**
- `/api/auth/[...nextauth]/route.ts`
- `/api/auth/reset-password` (⚠️ token بـbase64 — غير آمن)
- `/api/applications/[id]`, `/api/applications/interviews`
- `/api/upload`, `/api/send-whatsapp`, `/api/seed-requirements`

### 5.3 Auth (التفاصيل المهمة)

**ملف:** `dashboard/auth.config.ts` (125 سطر)

**Providers:** Credentials فقط (email/password).

**JWT Callback:** ينسخ `id`, `role`, `email`, `name` للـtoken — ✅ صحيح.

**Session Callback:** يعكس بيانات الـtoken للـsession — ✅ صحيح.

**🔴 الكارثة في `authorize()` (السطر 87):**
```ts
const dbPassword = user.password.trim();
if (dbPassword !== password) return null;   // ← مقارنة plaintext!
```
لا يوجد bcrypt، لا scrypt، لا أي hashing.

**Middleware:** ❌ غير موجود. الحماية client-side فقط عبر `<AdminAuth>` wrapper.

### 5.4 RBAC (الأدوار والصلاحيات)
- **الأدوار:** `SUPER_ADMIN`, `STAFF` (في dashboard) / `SUPER_ADMIN`, `ADMIN`, `STAFF` (في DataLayer — drift!).
- **Default routes** (لكل المستخدمين): `/`, `/settings/profile`, `/tasks/my-tasks`, `/my-time`, `/notes`, `/organizational-structure`.
- **Assignable routes:** 19 مسار يُمنح/يُسحب عبر `UserRoutePermission` (SUPER_ADMIN فقط).
- **التطبيق:** `dashboard/lib/auth/adminRoutes.ts` + `actions/userPermissions.ts`.

### 5.5 Server Actions (≈5732 LOC)
| الملف | LOC | الوظيفة |
|---|---:|---|
| `staff.ts` | 763 | إدارة موظفين، حسابات رواتب |
| `managementNotes.ts` | 641 | الملاحظات + threads + إشعارات |
| `users.ts` | 627 | إدارة مستخدمين |
| `categories.ts` | 485 | شجرة الحسابات |
| `costs.ts` | 430 | المصاريف |
| `sourceOfIncome.ts` | 419 | مصادر الدخل |
| `clockify.ts` | 379 | تكامل Clockify |
| `tasks.ts` | 349 | المهام |
| `accounting.ts` | 281 | ميزان مراجعة، تقارير |
| `createStaff.ts` | 181 | إنشاء موظف |
| `notifications.ts` | 162 | إشعارات داخلية |
| `interviewResult.ts` | 149 | نتائج المقابلات |
| `userPermissions.ts` | 146 | إدارة صلاحيات |
| `searchCandidateByPhone.ts` | 124 | بحث بالهاتف |
| `updateApplicationStatus.ts` | 123 | تغيير حالة الطلب |
| `sendInterviewResponseNotification.ts` | 116 | إشعار WhatsApp |
| `sendWhatsAppNotification.ts` | 114 | WhatsApp |
| `submitContactMessage.ts` | 93 | استقبال رسائل |
| `deleteInterviewResponse.ts` | 75 | حذف رد مقابلة |
| `auth.ts` | 42 | `getAccessibleRoutes` |
| `updateRequirementStatus.ts` | 28 | متطلبات Phase1 |
| `finance.ts` | 5 | stub |

### 5.6 i18n (ناقص جداً)
- مكتبة `next-intl` مثبّتة لكن **غير مفعّلة**.
- `messages/ar.json` فقط (لا يوجد en.json).
- لا يوجد `i18n/routing.ts` ولا `i18n/request.ts`.
- `app/page.tsx:15` فيه `const locale = 'ar'` hardcoded.
- Helper بديل: `helpers/messages.ts` يحمّل ar.json مباشرة.

### 5.7 Components
```
components/
├── admin/        (AdminAuth, AdminSidebar, StaffDashboard, ...)
├── accounting/   (CostsDashboard, AddExpenseDialog, BudgetTable)
├── ui/           (shadcn primitives)
├── layout/       (DashboardLayout, SessionProviderWrapper)
├── common/       (MetricCard, filters, badges)
└── feature dirs  (applications/, staff/, tasks/, notes/, ...)
```
≈140 ملف component، نمط feature-folder.

### 5.8 Helpers/Lib مهمة
- `lib/prisma.ts` — singleton ✅
- `lib/auth.ts` — يصدّر NextAuth + يتحقق من `AUTH_SECRET`
- `lib/auth/adminRoutes.ts` — تعريف المسارات والأدوار
- `lib/activityLog.ts` — ⚠️ **stub فقط**، يطبع للـconsole، الموديل غير موجود في schema
- `lib/clockify.ts` — تشفير + rate limiting (لكن بدون retry-after parsing)
- `lib/email.ts` — Resend wrapper

### 5.9 Scripts
- `create-admin.ts` — CLI لإنشاء SUPER_ADMIN تفاعلياً
- `migrate-routes.ts` — ملء `UserRoutePermission` من defaults
- `migrate-user-roles.ts` — تحويل ADMIN قديم → SUPER_ADMIN
- `check-admin-routes.ts`, `check-route-permission-collection.ts`, `check-routes.ts`
- `test-migration-logic.ts`

### 5.10 ملفات التوثيق على المستوى العلوي
| الملف | المحتوى | الحالة |
|---|---|---|
| `PROJECT-STATUS.md` | حالة البناء | ⚠️ قديم، يخلط بين Homepage و dashboard |
| `QUICKSTART.md` | تعليمات تشغيل | جيد لكن مضلل (يذكر bilingual وهو ليس كذلك) |
| `SETUP-APPLICATIONS.md` | دليل نظام التوظيف (286 سطر) | جيد، يذكر admin password hardcoded |
| `ENV_SETUP.md` | شرح env vars (140 سطر) | جيد |
| `README.md` | landing-page docs | ⚠️ يبدو منسوخ من Homepage |
| `REACT-NATIVE-*.md` (3 ملفات) | تحليل تطبيق موبايل | استراتيجي، خارج النطاق الحالي |
| `LOGO-DESIGN-PROMPT.md` | prompt لتصميم لوقو | غير ذي صلة بالكود |

---

## 6. مشاكل حرجة (Critical Issues)

### 🔴 حرج جداً — يجب الحل قبل أي إنتاج

#### CRIT-1: كلمات السر plaintext
- **المكان:** `dashboard/auth.config.ts:87-90`، `DataLayer/prisma/seed.ts:14`
- **الوصف:** المقارنة `dbPassword !== password` بدون أي hashing.
- **التأثير:** أي تسرّب لقاعدة البيانات = كل كلمات السر مكشوفة.
- **الحل المقترح:** إضافة bcrypt، migration script لتشفير الكلمات الموجودة، تحديث authorize().

#### CRIT-2: ملفات `.env` في git
- **المكان:** `Homepage/.env`, `dashboard/.env`
- **الوصف:** تحتوي DATABASE_URL، Cloudinary keys، Clockify, Resend, NEXTAUTH_SECRET كلها حقيقية.
- **التأثير:** أي شخص شاف الريبو عنده وصول كامل.
- **الحل المقترح:**
  1. تدوير (rotate) كل المفاتيح فوراً.
  2. حذف `.env` من git (`git rm --cached`).
  3. إنشاء `.env.example`.
  4. إضافة `.env` للـ`.gitignore` (تأكد فعلاً).

#### CRIT-3: لا يوجد middleware في dashboard
- **المكان:** dashboard root (لا يوجد `middleware.ts`)
- **الوصف:** الحماية client-side فقط عبر `<AdminAuth>`. API routes غير محمية على مستوى الطلب.
- **التأثير:** طلب API مباشر يتجاوز الـauth بسهولة.
- **ملاحظة:** يوجد `proxy.ts` بحجم 6.4KB لكنه **ليس** Next.js middleware — يحتاج تحويل أو إنشاء `middleware.ts` جديد.
- **الحل المقترح:** إنشاء `middleware.ts` يستخدم NextAuth ويحمي كل المسارات والـAPI ما عدا `/login` و `/api/auth/*`.

#### CRIT-4: schema drift بين 3 نسخ
- **المكان:** `DataLayer/prisma/schema.prisma`، `Homepage/prisma/schema.prisma`، `dashboard/prisma/schema.prisma`
- **الفروقات المعروفة:**
  - dashboard ناقص دور `ADMIN` في `UserRole`.
  - حقول Staff الـdeprecated مختلفة بين النسخ.
- **التأثير:** أي تغيير schema في مكان واحد = bugs غامضة في الآخر.
- **الحل المقترح خياران:**
  - **(أ) قصير المدى:** اختيار schema واحد كـsource of truth، نسخه يدوياً للآخرين عند كل تعديل، ووضع تعليق صريح في كل ملف.
  - **(ب) طويل المدى:** تحويل المشروع لـpnpm workspace، DataLayer يصبح `@jbrtechno/data` ويولّد client مشترك.

### 🟠 مهم لكن ليس حرجاً

#### HIGH-1: Activity log غير مكتمل
- `dashboard/lib/activityLog.ts` يطبع للـconsole، الموديل غير موجود.
- يجب إضافة `ActivityLog` model و persistence.

#### HIGH-2: i18n معطّل في dashboard
- `next-intl` مثبت بدون استخدام، عربي فقط hardcoded.
- يجب القرار: حذف المكتبة أو تفعيل الـ routing بالكامل.

#### HIGH-3: Reset password بـbase64
- `dashboard/app/api/auth/reset-password/route.ts` يستخدم base64 للـtoken (غير آمن، ليس HMAC).
- يجب استخدام JWT أو HMAC مع expiration حقيقي.

#### HIGH-4: لا يوجد middleware locale في Homepage
- المستخدم اللي يدخل `/careers` بدون `/ar/` أو `/en/` قد يحصل 404.
- يجب إضافة `middleware.ts` للـlocale routing.

#### HIGH-5: WhatsApp notification synchronous
- `Homepage/actions/submitApplication.ts:64-78` ينتظر إرسال WhatsApp قبل تأكيد الحفظ.
- إذا فشل WhatsApp = فشل الحفظ كله.
- يجب إما fire-and-forget أو queue.

---

## 7. مصفوفة المخاطر الكاملة

| # | الخطورة | المنطقة | الملف/المكان | الوصف |
|---:|---|---|---|---|
| 1 | 🔴 CRIT | Auth | `dashboard/auth.config.ts:87` | passwords plaintext |
| 2 | 🔴 CRIT | Secrets | `Homepage/.env`, `dashboard/.env` | credentials في git |
| 3 | 🔴 CRIT | Auth | dashboard (لا يوجد middleware.ts) | API غير محمي |
| 4 | 🔴 CRIT | DataLayer | DataLayer (لا يوجد package.json) | ليس حزمة فعلية |
| 5 | 🔴 CRIT | Schema | 3 نسخ من schema.prisma | drift بدأ |
| 6 | 🟠 HIGH | Auth | `DataLayer/prisma/seed.ts:14` | password 'Leno_1972' hardcoded |
| 7 | 🟠 HIGH | Schema | dashboard schema | ناقص ADMIN role |
| 8 | 🟠 HIGH | Schema | DataLayer Staff model | حقول deprecated غير منظفة |
| 9 | 🟠 HIGH | Logging | `dashboard/lib/activityLog.ts` | stub، الموديل ناقص |
| 10 | 🟠 HIGH | i18n | dashboard | next-intl مثبت غير مفعّل |
| 11 | 🟠 HIGH | Auth | `dashboard/api/auth/reset-password` | base64 token |
| 12 | 🟠 HIGH | Routing | Homepage (لا يوجد middleware) | locale routing هش |
| 13 | 🟠 HIGH | Server Action | `Homepage/actions/submitApplication.ts:64` | WhatsApp يعطل DB commit |
| 14 | 🟡 MED | Schema | `Category`/`Transaction` relations | onDelete: NoAction (orphan risk) |
| 15 | 🟡 MED | Schema | `emergencyContact1/2` JSON | بدون shape validation |
| 16 | 🟡 MED | Schema | array fields (skills, readBy, ...) | بدون type validation |
| 17 | 🟡 MED | Migrations | كل التطبيقات | `db push` فقط، لا migrations |
| 18 | 🟡 MED | Config | `Homepage/app/[locale]/layout.tsx:52` | Facebook Pixel ID hardcoded |
| 19 | 🟡 MED | Config | `Homepage/lib/cloudinary.ts:27,74` | folder paths hardcoded |
| 20 | 🟡 MED | Data | `Homepage/helpers/extractMetrics.ts` | بيانات الوظائف hardcoded |
| 21 | 🟡 MED | Routing | `Homepage/app/api/applications/[id]` | route stub، يحتاج تحقق |
| 22 | 🟡 MED | Auth | `dashboard/actions/searchCandidateByPhone.ts` | regex هش |
| 23 | 🟡 MED | Clockify | `dashboard/lib/clockify.ts` | بدون retry-after parsing |
| 24 | 🟡 MED | Sidebar | `dashboard/helpers/sidebarRoutes.ts:54-87` | labels إنجليزية في خريطة عربية |
| 25 | 🟢 LOW | i18n | `Homepage/i18n/routing.ts` | فقط 5 routes في pathnames |
| 26 | 🟢 LOW | Cleanup | `Homepage/.env` | NEXTAUTH_* غير مستخدم |
| 27 | 🟢 LOW | Cleanup | `Homepage/types/` | مجلد فاضي |
| 28 | 🟢 LOW | Docs | dashboard `README.md` | منسوخ من Homepage |
| 29 | 🟢 LOW | Docs | `dashboard/PROJECT-STATUS.md` | معلومات قديمة |
| 30 | 🟢 LOW | Code | `dashboard/actions/finance.ts` | stub بـ5 أسطر |

---

## 8. خارطة طريق التاسكات المقترحة

> **ملاحظة:** هذه اقتراحات ترتيب ذكي بناءً على المراجعة. الترتيب النهائي يحدده المستخدم.

### 🚨 المرحلة 0 — أمن عاجل (لا تأجيل)
- [ ] تدوير كل المفاتيح في `.env` (Cloudinary, MongoDB, Clockify, Resend, AUTH_SECRET).
- [ ] إزالة `.env` من git history وإضافة `.env.example`.
- [ ] إضافة bcrypt، script لتشفير كلمات السر الموجودة، تحديث `authorize()`.
- [ ] إنشاء `dashboard/middleware.ts` لحماية المسارات والـAPI.

### 🛠️ المرحلة 1 — توحيد البنية
- [ ] قرار: pnpm workspace أم schema-sync يدوي؟
- [ ] حل drift في schema (توحيد UserRole، حقول Staff).
- [ ] إنشاء `package.json` وبنية حقيقية لـ DataLayer (لو الخيار monorepo).
- [ ] فصل seed.ts عن المحتوى الحرج (إزالة plaintext password).

### 🌐 المرحلة 2 — i18n وUX
- [ ] قرار: تفعيل i18n كامل في dashboard أم إزالة next-intl؟
- [ ] إضافة middleware للـlocale في Homepage.
- [ ] تحويل WhatsApp notification لـfire-and-forget في Homepage.

### 📊 المرحلة 3 — تنظيف وتعزيز
- [ ] تطبيق `ActivityLog` model + persistence.
- [ ] تحسين password reset (HMAC token).
- [ ] نقل البيانات الـhardcoded (Pixel ID، Cloudinary folders، job positions) لـenv أو DB.
- [ ] تنظيف الملفات الفاضية والمجلدات غير المستخدمة.
- [ ] توحيد ملفات README الموجودة (dashboard README منسوخ من Homepage).

### 📱 المرحلة 4 — استراتيجية
- [ ] تقييم REACT-NATIVE-*.md docs والقرار على mobile app.
- [ ] إضافة proper Prisma migrations بدلاً من `db push`.
- [ ] إعداد CI/CD مع TypeScript checks وtests.

---

## 📌 ملاحظات ختامية

- **النقطة الإيجابية:** الكود في الـactions و components منظم ونظيف عموماً، نمط feature-folder متّسق، استخدام shadcn/ui موحّد.
- **النقطة السلبية الأهم:** التقسيم من المونوليث لم يكتمل، وتُركت الـschema و .env و auth في حالات نصف-مهجورة.
- **التوصية:** البدء بـ"المرحلة 0" قبل أي ميزة جديدة، لأن أي تطوير على أساس غير آمن هو دين تقني يتراكم.

---

> **آخر تحديث:** 2026-05-10
> **المراجع:** Claude (Opus 4.7)
