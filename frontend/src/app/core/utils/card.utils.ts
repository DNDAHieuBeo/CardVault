const EXTRA_TYPES = [
  'fusion monster', 'synchro monster', 'xyz monster', 'link monster',
  'synchro tuner monster', 'pendulum effect fusion monster',
];

export function isMonsterCard(type: string | undefined | null): boolean {
  return type?.toLowerCase().includes('monster') ?? false;
}

export function isExtraTypeCard(type: string | undefined | null): boolean {
  return EXTRA_TYPES.some(t => type?.toLowerCase().includes(t));
}
