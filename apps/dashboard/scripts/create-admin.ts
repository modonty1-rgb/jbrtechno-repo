import { PrismaClient, UserRole } from '@jbrtechno/database';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type Args = {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };

  const email = (get('--email') ?? process.env.JBRTECHNO_ADMIN_EMAIL ?? '').trim().toLowerCase();
  const password = (get('--password') ?? process.env.ADMIN_PASSWORD ?? '').trim();
  const name = get('--name') ?? process.env.ADMIN_NAME;
  const roleInput = (get('--role') ?? process.env.ADMIN_ROLE ?? 'SUPER_ADMIN').toUpperCase();

  if (!email || !password) {
    console.error('❌ Missing required args.');
    console.error('Usage: pnpm tsx scripts/create-admin.ts --email <email> --password <pwd> [--name <name>] [--role SUPER_ADMIN|STAFF]');
    process.exit(1);
  }

  if (roleInput !== 'SUPER_ADMIN' && roleInput !== 'STAFF') {
    console.error(`❌ Invalid role "${roleInput}". Must be SUPER_ADMIN or STAFF.`);
    process.exit(1);
  }

  return { email, password, name, role: roleInput as UserRole };
}

async function main() {
  const { email, password, name, role } = parseArgs();

  const dbUrl = process.env.JBRTECHNO_DATABASE_URL ?? '';
  const dbHost = dbUrl.replace(/.*@/, '').split('/')[0] || 'unknown';
  const dbName = dbUrl.split('/').pop()?.split('?')[0] || 'unknown';
  console.log(`🔌 Target DB: ${dbName} @ ${dbHost}`);

  const existing = await prisma.user.findUnique({ where: { email } });
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, name: name ?? undefined, role, isActive: true },
    create: { email, password: hashedPassword, name, role, isActive: true },
  });

  console.log(existing ? '🔄 Updated existing user:' : '✅ Created new user:');
  console.log({ id: user.id, email: user.email, name: user.name, role: user.role, isActive: user.isActive });
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
