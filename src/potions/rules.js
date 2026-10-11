const MIXED = { kind: 'mixed', fizz: true };

// Acid, base or neutral: juice, neutral and mixed cups all count as neutral.
export function typeOf(kind) {
  return kind === 'acid' || kind === 'base' ? kind : 'neutral';
}

// What a cup becomes when something of `addedType` is poured in.
export function combine(cupKind, addedType, fromWater = false) {
  const cup = typeOf(cupKind);
  if (addedType === 'acid') return cup === 'base' ? MIXED : { kind: 'acid', fizz: false };
  if (addedType === 'base') return cup === 'acid' ? MIXED : { kind: 'base', fizz: false };
  if (fromWater && cupKind === 'juice') return { kind: 'neutral', fizz: false };
  return { kind: cupKind, fizz: false };
}

// The color the juice should end up as.
export function colorAfter(palette, result, cup, addedColor) {
  if (result.kind === 'mixed') return palette.mixed;
  if (result.kind === 'base') return palette.base;
  if (result.kind === 'acid') return cup.kind === 'acid' ? cup.color : addedColor;
  if (result.kind === 'neutral' && cup.kind === 'juice') return palette.juice;
  return cup.color;
}
