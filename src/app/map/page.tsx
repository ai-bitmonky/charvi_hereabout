import type { Metadata } from 'next';
import MapView from '@/views/MapView';

export const metadata: Metadata = { title: 'Map · Hereabout' };

export default function Page() {
  return <MapView />;
}
