import type { Metadata } from 'next';
import Create from '@/views/Create';

export const metadata: Metadata = { title: 'Create an event · Hereabout' };

export default function Page() {
  return <Create />;
}
