import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/consts';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Bun venit la {APP_NAME}
        </h1>
        <p className="text-lg text-muted-foreground">{APP_DESCRIPTION}</p>
        <p className="text-muted-foreground">
          Gestionați-vă dosarele medicale în siguranță și eficient. Accesați
          informațiile despre sănătatea dvs. oricând, oriunde.
        </p>
        <div className="pt-4">
          <Button asChild size="lg">
            <Link href="/dashboard">Mergi la Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
