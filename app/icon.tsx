import { FavIconSVG } from '@/components/favicon';
import { APP_NAME } from '@/lib/consts';

export const runtime = 'edge';

export default async function Image() {
  return FavIconSVG({
    icon: <>{APP_NAME.slice(0, 3)}</>,
  });
}
