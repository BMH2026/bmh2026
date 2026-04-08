// /explore đã được hợp nhất vào /play (tab "chơi" trong bottom nav).
// Redirect về /play để không gây 404 khi có deep-link cũ.
import { redirect } from 'next/navigation';

export default function ExplorePage() {
  redirect('/play');
}
