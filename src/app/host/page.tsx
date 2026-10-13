import type { Metadata } from 'next';
import Host from '@/views/Host';

export const metadata: Metadata = { title: 'Host dashboard · Hereabout' };

export default function Page() {
  return <Host />;
}
