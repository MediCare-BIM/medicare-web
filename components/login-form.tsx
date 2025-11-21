'use client';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { REDIRECT_AFTER_LOGIN } from '@/lib/consts';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircleIcon } from 'lucide-react';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push(REDIRECT_AFTER_LOGIN);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <h1 className="text-3xl font-bold mb-2">Bine ai revenit!</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Ai totul pregătit pentru următorul pacient.
      </p>
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Autentificare nereușită.</AlertTitle>
              <AlertDescription>
                <p>
                  Asigură-te că ai introdus corect informațiile sau încearcă să
                  resetezi parola.
                </p>
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Adresă de email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Ex: ioan.vasile@policlinica.ro"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={error ? 'border-destructive' : ''}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Parolă</Label>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error ? 'border-destructive' : ''}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Checkbox id="remember" />
              <Label
                htmlFor="remember"
                className="text-sm font-medium text-muted-foreground"
              >
                Vreau să rămân autentificat/ă
              </Label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary font-medium"
            >
              Am uitat parola
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Se înregistrează...' : 'Intră în cont'}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Nu ai un cont?{' '}
          <Link href="/auth/sign-up" className="text-primary font-medium">
            Înregistrează-te
          </Link>
        </div>
      </form>
    </div>
  );
}
