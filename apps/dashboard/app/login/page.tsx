'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Input } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import { Lock, Loader2 } from 'lucide-react';
import { messages } from '@/helpers/messages';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Clear old adminToken cookie on mount (migration cleanup)
  useEffect(() => {
    // Delete old cookie if it exists
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.cookie = 'adminToken=; path=/admin; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError(messages.admin.invalidCredentials);
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: trimmedEmail,
        password: trimmedPassword,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError(messages.admin.invalidCredentials);
        setIsSubmitting(false);
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(messages.admin.invalidCredentials);
        setIsSubmitting(false);
      }
    } catch (err) {
      setError(messages.admin.invalidCredentials);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">{messages.admin.loginTitle}</CardTitle>
          <CardDescription>{messages.admin.loginDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{messages.admin.username}</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or username"
                required
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{messages.admin.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="off"
                autoFocus={false}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {messages.admin.loading}
                </>
              ) : (
                messages.admin.loginButton
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">{messages.admin.loginTitle}</CardTitle>
            <CardDescription>{messages.admin.loginDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

