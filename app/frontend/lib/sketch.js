// drawably draws a fresh random sketch on every attach, and its React wrappers
// re-attach whenever their options change. Deriving the seed from a stable key
// keeps a control's stroke put while the contribute flow re-renders around it.
export function seedFrom(key) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
