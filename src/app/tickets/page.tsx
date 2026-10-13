import type { Metadata } from 'next';
import Tickets from '@/views/Tickets';

export const metadata: Metadata = { title: 'Your tickets · Hereabout' };

export default function Page() {
  return <Tickets />;
}
