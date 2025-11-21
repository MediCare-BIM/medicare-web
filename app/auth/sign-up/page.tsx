import { Logo } from '@/components/logo';
import { Tips } from '@/components/tips';
import { tips } from '../login/page';
import { SignUpForm } from '@/components/sign-up-form';

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <Logo size="xl" className="mb-16" />
            <SignUpForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Tips tips={tips} />
      </div>
    </div>
  );
}
