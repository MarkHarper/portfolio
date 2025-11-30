export class ReverseMap<K, V> extends Map<K, V> {
  *[Symbol.iterator](): IterableIterator<[K, V]> {
    const entries = Array.from(super[Symbol.iterator]());
    for (let i = entries.length - 1; i >= 0; i--) {
      yield entries[i];
    }
  }

  *entries(): IterableIterator<[K, V]> {
    yield* this[Symbol.iterator]();
  }

  *keys(): IterableIterator<K> {
    const keys = Array.from(super.keys());
    for (let i = keys.length - 1; i >= 0; i--) {
      yield keys[i];
    }
  }

  *values(): IterableIterator<V> {
    const values = Array.from(super.values());
    for (let i = values.length - 1; i >= 0; i--) {
      yield values[i];
    }
  }

  forEach(
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
    thisArg?: any,
  ): void {
    const entries = Array.from(super[Symbol.iterator]());
    for (let i = entries.length - 1; i >= 0; i--) {
      const [key, value] = entries[i];
      callbackfn.call(thisArg, value, key, this);
    }
  }
}
