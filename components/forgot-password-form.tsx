'use client';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';
import { Key, ArrowLeft, Mail } from 'lucide-react';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn('flex flex-col gap-6 items-start', className)}
      {...props}
    >
      {success ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-xl shadow flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold mb-2">
                Gata! Linkul de resetare e pe drum.
              </h1>
              <p className="text-sm text-muted-foreground">
                Am trimis către {email} un e-mail cu pașii necesari pentru a
                restabili parola.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-xl shadow flex items-center justify-center">
              <Key className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold mb-2">
                Ai uitat parola? Nicio grijă
              </h1>
              <p className="text-sm text-muted-foreground">
                Scrie e-mailul tău și îţi trimitem imediat instrucţiunile pentru
                resetare.
              </p>
            </div>
          </div>
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Adresă de email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: ioan.vasile@policlinica.ro"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Se trimite...' : 'Trimite instrucţiuni'}
            </Button>
            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Înapoi la autentificare
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
