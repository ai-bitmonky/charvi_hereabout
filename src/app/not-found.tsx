import type { Metadata } from 'next';
import { NavLink } from '@/components/Bits';

export const metadata: Metadata = { title: 'Not found · Hereabout' };

export default function NotFound() {
  return (
    <div className="view">
      <div className="wrap" style={{ padding: 'calc(48px + var(--safe-t)) 16px 48px' }}>
        <div className="empty" style={{ maxWidth: 560, margin: '0 auto' }}>
          <svg viewBox="0 0 96 96" aria-hidden="true"><g fill="none" stroke="var(--teal)" strokeDasharray="2 4"><circle cx="48" cy="48" r="44" opacity=".4" /><circle cx="48" cy="48" r="30" opacity=".6" /></g><circle cx="48" cy="48" r="16" fill="none" stroke="var(--teal)" /><circle cx="48" cy="48" r="5" fill="var(--accent)" /></svg>
          <h3>Nothing on here</h3>
          <p>This page has moved or never existed. Plenty is starting near you tonight, though.</p>
          <NavLink className="btn btn-p" href="/">See what&apos;s on</NavLink>
        </div>
      </div>
    </div>
  );
}
