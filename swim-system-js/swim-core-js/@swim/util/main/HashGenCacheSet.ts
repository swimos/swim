// Copyright 2015-2020 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Objects} from "./Objects";

/**
 * A hashed generational cache set discards the least recently used value
 * with the worst hit rate per hash bucket.  HashGenCacheSet is a concurrent
 * and lock-free LRFU cache, with O(1) access time.
 *
 * Maintaining four "generations" of cached values per hash bucket, the cache
 * discards from the younger generations based on least recent usage, and
 * promotes younger generations to older generations based on most frequent
 * usage.  Cache misses count as negative usage of the older generations,
 * biasing the cache against least recently used values with poor hit rates.
 *
 * The cache soft references the older generations, and weak references the
 * younger generations; the garbage collector can reclaim the entire cache,
 * but will preferentially wipe the younger cache generations before the older
 * cache generations.
 */
export class HashGenCacheSet<T> {
  readonly _buckets: Array<HashGenCacheSetBucket<T> | undefined>;
  _gen4Hits: number;
  _gen3Hits: number;
  _gen2Hits: number;
  _gen1Hits: number;
  _misses: number;

  constructor(size: number) {
    this._buckets = new Array(size);
    this._gen4Hits = 0;
    this._gen3Hits = 0;
    this._gen2Hits = 0;
    this._gen1Hits = 0;
    this._misses = 0;
  }

  put(value: T): T {
    if (this._buckets.length === 0) {
      return value;
    }
    const index = Math.abs(Objects.hash(value)) % this._buckets.length;
    const bucket = this._buckets[index] || new HashGenCacheSetBucket<T>();

    const gen4Val = bucket._gen4Val;
    if (gen4Val !== void 0 && Objects.equal(value, gen4Val)) {
      this._gen4Hits += 1;
      bucket._gen4Weight++;
      return gen4Val;
    }

    const gen3Val = bucket._gen3Val;
    if (gen3Val !== void 0 && Objects.equal(value, gen3Val)) {
      this._gen3Hits += 1;
      if (bucket._gen3Weight++ > bucket._gen4Weight) {
        this._buckets[index] = new HashGenCacheSetBucket<T>(
            bucket._gen3Val, bucket._gen3Weight,
            bucket._gen4Val, bucket._gen4Weight,
            bucket._gen2Val, bucket._gen2Weight,
            bucket._gen1Val, bucket._gen1Weight);
      }
      return gen3Val;
    }

    const gen2Val = bucket._gen2Val;
    if (gen2Val !== void 0 && Objects.equal(value, gen2Val)) {
      this._gen2Hits += 1;
      if (bucket._gen2Weight++ > bucket._gen3Weight) {
        this._buckets[index] = new HashGenCacheSetBucket<T>(
            bucket._gen4Val, bucket._gen4Weight,
            bucket._gen2Val, bucket._gen2Weight,
            bucket._gen3Val, bucket._gen3Weight,
            bucket._gen1Val, bucket._gen1Weight);
      }
      return gen2Val;
    }

    const gen1Val = bucket._gen1Val;
    if (gen1Val !== void 0 && Objects.equal(value, gen1Val)) {
      this._gen1Hits += 1;
      if (bucket._gen1Weight++ > bucket._gen2Weight) {
        this._buckets[index] = new HashGenCacheSetBucket<T>(
            bucket._gen4Val, bucket._gen4Weight,
            bucket._gen3Val, bucket._gen3Weight,
            bucket._gen1Val, bucket._gen1Weight,
            bucket._gen2Val, bucket._gen2Weight);
      }
      return gen1Val;
    }

    this._misses += 1;
    if (gen4Val === void 0) {
      this._buckets[index] = new HashGenCacheSetBucket<T>(
          bucket._gen3Val, bucket._gen3Weight,
          bucket._gen2Val, bucket._gen2Weight,
          bucket._gen1Val, bucket._gen1Weight,
          value, 1);
    } else if (gen3Val === void 0) {
      this._buckets[index] = new HashGenCacheSetBucket<T>(
          bucket._gen4Val, bucket._gen4Weight,
          bucket._gen2Val, bucket._gen2Weight,
          bucket._gen1Val, bucket._gen1Weight,
          value, 1);
    } else if (gen2Val === void 0) {
      this._buckets[index] = new HashGenCacheSetBucket<T>(
          bucket._gen4Val, bucket._gen4Weight,
          bucket._gen3Val, bucket._gen3Weight,
          bucket._gen1Val, bucket._gen1Weight,
          value, 1);
    } else if (gen1Val === void 0) {
      this._buckets[index] = new HashGenCacheSetBucket<T>(
          bucket._gen4Val, bucket._gen4Weight,
          bucket._gen3Val, bucket._gen3Weight,
          bucket._gen2Val, bucket._gen2Weight,
          value, 1);
    } else {
      // Penalize older gens for thrash. Promote gen1 to prevent nacent gens
      // from flip-flopping. If sacrificed gen2 was worth keeping, it likely
      // would have already been promoted.
      this._buckets[index] = new HashGenCacheSetBucket<T>(
          bucket._gen4Val, bucket._gen4Weight - 1,
          bucket._gen3Val, bucket._gen3Weight - 1,
          bucket._gen1Val, bucket._gen1Weight,
          value, 1);
    }

    return value;
  }

  remove(value: T): boolean {
    if (this._buckets.length === 0) {
      return false;
    }
    const index = Math.abs(Objects.hash(value)) % this._buckets.length;
    const bucket = this._buckets[index];
    if (bucket === void 0) {
      return false;
    }

    const gen4Val = bucket._gen4Val;
    if (gen4Val !== void 0 && Objects.equal(value, gen4Val)) {
      this._buckets[index] = new HashGenCacheSetBucket<T>(
          bucket._gen3Val, bucket._gen3Weight,
          bucket._gen2Val, bucket._gen2Weight,
          bucket._gen1Val, bucket._gen1Weight,
          void 0, 0);
      return true;
    }

    const gen3Val = bucket._gen3Val;
    if (gen3Val !== void 0 && Objects.equal(value, gen3Val)) {
      this._buckets[index] = new HashGenCacheSetBucket<T>(
          bucket._gen4Val, bucket._gen4Weight,
          bucket._gen2Val, bucket._gen2Weight,
          bucket._gen1Val, bucket._gen1Weight,
          void 0, 0);
      return true;
    }

    const gen2Val = bucket._gen2Val;
    if (gen2Val !== void 0 && Objects.equal(value, gen2Val)) {
      this._buckets[index] = new HashGenCacheSetBucket<T>(
          bucket._gen4Val, bucket._gen4Weight,
          bucket._gen3Val, bucket._gen3Weight,
          bucket._gen1Val, bucket._gen1Weight,
          void 0, 0);
      return true;
    }

    const gen1Val = bucket._gen1Val;
    if (gen1Val !== void 0 && Objects.equal(value, gen1Val)) {
      this._buckets[index] = new HashGenCacheSetBucket<T>(
          bucket._gen4Val, bucket._gen4Weight,
          bucket._gen3Val, bucket._gen3Weight,
          bucket._gen2Val, bucket._gen2Weight,
          void 0, 0);
      return true;
    }

    return false;
  }

  clear(): void {
    for (let i = 0; i < this._buckets.length; i += 1) {
      this._buckets[i] = void 0;
    }
  }

  /** @hidden */
  hits(): number {
    return this._gen4Hits + this._gen3Hits + this._gen2Hits + this._gen1Hits;
  }

  hitRatio(): number {
    const hits = this.hits();
    return hits / (hits + this._misses);
  }
}

/** @hidden */
export class HashGenCacheSetBucket<T> {
  /** @hidden */
  _gen4Val: T | undefined;
  /** @hidden */
  _gen4Weight: number;
  /** @hidden */
  _gen3Val: T | undefined;
  /** @hidden */
  _gen3Weight: number;
  /** @hidden */
  _gen2Val: T | undefined;
  /** @hidden */
  _gen2Weight: number;
  /** @hidden */
  _gen1Val: T | undefined;
  /** @hidden */
  _gen1Weight: number;

  constructor(gen4Val?: T, gen4Weight: number = 0,
              gen3Val?: T, gen3Weight: number = 0,
              gen2Val?: T, gen2Weight: number = 0,
              gen1Val?: T, gen1Weight: number = 0) {
    this._gen4Val = gen4Val;
    this._gen4Weight = gen4Weight;
    this._gen3Val = gen3Val;
    this._gen3Weight = gen3Weight;
    this._gen2Val = gen2Val;
    this._gen2Weight = gen2Weight;
    this._gen1Val = gen1Val;
    this._gen1Weight = gen1Weight;
  }
}
