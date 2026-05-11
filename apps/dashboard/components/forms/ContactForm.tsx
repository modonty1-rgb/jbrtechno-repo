'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { submitContactMessage } from '@/actions/submitContactMessage';
import type { ContactMessageInput } from '@jbrtechno/shared';
import { Input } from '@jbrtechno/ui';
import { Textarea } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';

interface ContactFormCopy {
  fullName: string;
  fullNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  subject: string;
  subjectPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successDescription: string;
  errorTitle: string;
  errorDescription: string;
  requiredNote: string;
}

interface ContactSubjectOption {
  value: string;
  label: string;
}

interface ContactFormProps {
  locale: string;
  copy: ContactFormCopy;
  subjectOptions: ContactSubjectOption[];
}

interface FormStatus {
  success?: boolean;
  error?: string;
}

export function ContactForm({ locale, copy, subjectOptions }: ContactFormProps) {
  const [status, setStatus] = useState<FormStatus>({});
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    subjectOptions[0]?.value
  );
  const [messageValue, setMessageValue] = useState('');
  const [isPending, startTransition] = useTransition();

  const minMessageChars = 20;
  const messageLength = messageValue.trim().length;
  const charsRemaining = Math.max(minMessageChars - messageLength, 0);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload: ContactMessageInput = {
      fullName: formData.get('fullName')?.toString().trim() ?? '',
      email: formData.get('email')?.toString().trim() ?? '',
      phone: (() => {
        const raw = formData.get('phone')?.toString().trim() ?? '';
        return raw.length ? raw : undefined;
      })(),
      subject:
        formData.get('subject')?.toString().trim() ??
        (subjectOptions[0]?.value ?? ''),
      message: messageValue.trim(),
      locale,
    };

    setStatus({});

    startTransition(async () => {
      const result = await submitContactMessage(payload);

      if (result.success) {
        form.reset();
        setSelectedSubject(subjectOptions[0]?.value);
        setMessageValue('');
        setStatus({ success: true });
      } else {
        setStatus({ success: false, error: result.error });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            {copy.fullName} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder={copy.fullNamePlaceholder}
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            {copy.email} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={copy.emailPlaceholder}
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">{copy.phone}</Label>
          <Input
            id="phone"
            name="phone"
            placeholder={copy.phonePlaceholder}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">
            {copy.subject} <span className="text-destructive">*</span>
          </Label>
          <input type="hidden" name="subject" value={selectedSubject ?? ''} />
          <Select
            value={selectedSubject}
            onValueChange={setSelectedSubject}
            required
            disabled={isPending}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder={copy.subjectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          {copy.message} <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          placeholder={copy.messagePlaceholder}
          rows={6}
          required
          disabled={isPending}
          value={messageValue}
          onChange={(event) => setMessageValue(event.target.value)}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {charsRemaining > 0
              ? `${charsRemaining} أحرف متبقية للوصول للحد الأدنى`
              : 'تم استيفاء الحد الأدنى من الأحرف'}
          </span>
          <span>
            {messageLength} حرف
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-muted-foreground">{copy.requiredNote}</p>
        <Button type="submit" disabled={isPending}>
          {isPending ? copy.submitting : copy.submit}
        </Button>
      </div>

      {status.success && (
        <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">{copy.successTitle}</p>
            <p className="mt-1 text-muted-foreground">{copy.successDescription}</p>
          </div>
        </div>
      )}

      {status.success === false && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">{copy.errorTitle}</p>
            <p className="mt-1 text-muted-foreground">
              {status.error ?? copy.errorDescription}
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
















