import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { byId, events } from '@/data/events';
import EventView from '@/views/EventView';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return events.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const e = byId[id];
  if (!e) return { title: 'Not found · Hereabout' };
  return {
    title: `${e.t} · Hereabout`,
    description: `${e.about[0]} ${e.area} · ${e.start}.`,
    openGraph: { title: e.t, description: e.about[0], images: [`/img/${e.photo}.jpg`] },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const e = byId[id];
  if (!e) notFound();
  return <EventView key={e.id} e={e} />;
}
