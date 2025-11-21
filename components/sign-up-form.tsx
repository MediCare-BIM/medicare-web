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
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircleIcon, Circle, CheckCircle2 } from 'lucide-react';

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Password requirements
  const hasMinLength = password.length >= 8;
  const hasSpecialChar = /[(),.\-_]/.test(password);
  const isPasswordValid = hasMinLength && hasSpecialChar;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (!isPasswordValid) {
      setError('Parola nu îndeplinește cerințele minime.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/${REDIRECT_AFTER_LOGIN}`,
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      router.push('/auth/sign-up-success');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <h1 className="text-3xl font-bold mb-2">Bine ai venit la MediCare</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Platforma care aduce totul într-un singur loc.
      </p>
      <form onSubmit={handleSignUp} className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Înregistrare nereușită.</AlertTitle>
              <AlertDescription>
                <p>
                  Asigură-te că ai introdus corect informațiile și că parola
                  îndeplinește toate cerințele.
                </p>
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="fullName">Nume complet</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Ex: Ioan Vasile"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={error ? 'border-destructive' : ''}
            />
          </div>
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
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                {hasMinLength ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 fill-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">
                  Trebuie să conțină 8 caractere.
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {hasSpecialChar ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 fill-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">
                  Trebuie să conțină un caracter special. Ex:( ) , . - _
                </span>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isPasswordValid}
          >
            {isLoading ? 'Se înregistrează...' : 'Creează cont'}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Ai deja un cont?{' '}
          <Link href="/auth/login" className="text-primary font-medium">
            Autentifică-te
          </Link>
        </div>
      </form>
    </div>
  );
}
