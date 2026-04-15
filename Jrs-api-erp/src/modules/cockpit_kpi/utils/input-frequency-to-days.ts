/** Converte frequência de lançamento do KPI em dias esperados entre registros. */
export function inputFrequencyToDays(freq: string): number {
  const f = String(freq ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (f.includes('diario') || f === 'daily') return 1;
  if (f.includes('semanal') || f.includes('week')) return 7;
  if (f.includes('quinz')) return 14;
  if (f.includes('mensal') || f.includes('month')) return 31;
  if (f.includes('trim')) return 92;
  return 7;
}
