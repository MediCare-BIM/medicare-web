import { LoginForm } from '@/components/login-form';
import { Logo } from '@/components/logo';
import { Tips } from '@/components/tips';

export const tips = [
  {
    title: 'Totul despre pacient într-un singur loc',
    description: [
      'Ai o imagine clară și completă la fiecare consultație.',
      'Rezultate, investigații, prescripții și documente — toate integrate într-un dashboard ușor de parcurs.',
    ],
    image: '/tips/doc-1.jpg',
  },
  {
    title: 'Programare ușoară și rapidă',
    description: [
      'Gestionează programările cu ușurință.',
      'Vei primi notificări pentru fiecare consultație importantă.',
    ],
    image: '/tips/doc-2.jpg',
  },
  {
    title: 'Comunicare eficientă cu pacienții',
    description: [
      'Trimite mesaje și confirmări rapid pacienților tăi.',
      'Ține legătura cu pacienții pentru actualizări importante.',
    ],
    image: '/tips/doc-3.png',
  },
  {
    title: 'Acces securizat la datele medicale',
    description: [
      'Datele pacienților tăi sunt în siguranță.',
      'Sistemul respectă cele mai noi standarde de securitate.',
    ],
    image: '/tips/doc-4.jpg',
  },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <Logo size="xl" className="mb-16" />
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Tips tips={tips} />
      </div>
    </div>
  );
}
