import { getPositions } from '@/actions/positions';
import { PositionsPageClient } from './PositionsPageClient';

export default async function PositionsPage() {
  const positions = await getPositions();
  return <PositionsPageClient positions={positions} />;
}
