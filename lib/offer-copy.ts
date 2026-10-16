const TIER_HEADER = /^\s*(BASIC|PREMIUM PLUS|PREMIUM|LUXURY)\s*[—–-]\s*(.+?)\s*$/i;

export function normalizeOfferCopy(copy: string): string {
  return copy
    .replace(/\u00e2\u20ac\u201d/g, '—')
    .replace(/\u00e2\u20ac\u201c/g, '–')
    .replace(/\u00e2\u201a\u00b9/g, '₹')
    .replace(/\u00c2\u00b7/g, '·')
    .replace(/\u00c2/g, '');
}

export function getOfferIntro(copy: string): string {
  const normalized = normalizeOfferCopy(copy);
  const lines = normalized.split('\n');
  const firstTier = lines.findIndex((line) => TIER_HEADER.test(line));
  const end = firstTier < 0 ? lines.length : firstTier;
  return lines.slice(0, end).join('\n').trim();
}

export function getOfferOutro(copy: string): string {
  return normalizeOfferCopy(copy).split('\n').find((line) => /^\s*Professional photography,/i.test(line))?.trim() || '';
}

export function getMaternityTiers(copy: string): Array<{ name: string; price: string; items: string[] }> {
  const lines = normalizeOfferCopy(copy).split('\n');
  return lines.flatMap((line, index) => {
    const match = line.match(TIER_HEADER);
    if (!match) return [];
    const items: string[] = [];
    for (let next = index + 1; next < lines.length && lines[next].trim() && !TIER_HEADER.test(lines[next]); next += 1) {
      if (!/^\s*Professional photography,/i.test(lines[next])) items.push(lines[next].trim());
    }
    return [{ name: match[1].toUpperCase(), price: match[2].trim(), items }];
  });
}
