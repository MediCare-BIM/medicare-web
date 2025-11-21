import { OpenGraphText } from '@/components/og';
import { APP_DESCRIPTION, APP_NAME } from '@/lib/consts';

export const runtime = 'edge';

export default async function Image() {
  return OpenGraphText({
    title: APP_NAME,
    description: APP_DESCRIPTION,
  });
}
