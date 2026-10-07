/**
 * Fisher-Yates (Knuth) shuffle algorithm:
 * Returns a new array with elements randomized in O(N) time.
 * Handles arrays of any length safely (empty, single item, multiple items).
 * Does not mutate the original array.
 */
export function shuffleArray<T>(items: T[]): T[] {
  if (!items || items.length <= 1) {
    return items ? [...items] : []
  }
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
