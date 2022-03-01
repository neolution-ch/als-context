/**
 * Simple helper to make an array from a lenght and a generator (for example faker).
 *
 * @param length
 * @param generator
 *
 * @example
 * makeArray(2, faker.random.word()) // ["random 1", "random 2"]
 * @returns
 */
function makeArray<T>(length: number, generator: () => T): T[] {
  return Array.from({ length }, generator);
}

export { makeArray };
