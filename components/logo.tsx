import { APP_NAME } from '@/lib/consts';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LogoProps {
  monochrome?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Logo({ size = 'md', className }: LogoProps) {
  // Split the APP_NAME into two parts:
  // The "second part" starts with the first capital letter after the first
  // For "MediCare", this will make "Medi" and "Care"
  const match = APP_NAME.match(/^([A-Z][a-z]+)([A-Z].*)$/);
  let firstPart = APP_NAME;
  let secondPart = '';

  if (match) {
    firstPart = match[1];
    secondPart = match[2];
  }

  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'font-semibold',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-md',
          size === 'lg' && 'text-lg',
          size === 'xl' && 'text-xl'
        )}
      >
        {firstPart}
        {secondPart && <span className="text-indigo-900">{secondPart}</span>}
      </span>
    </Link>
  );
}
