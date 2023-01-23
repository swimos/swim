// Copyright 2015-2023 Swim.inc
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

import {Values} from "../values/Values";

/**
 * A hashed generational cache set discards the least recently used value
 * with the worst hit rate per hash bucket. HashGenCacheSet is a LRFU cache
 * with O(1) access time.
 *
 * Maintaining four "generations" of cached values per hash bucket, the cache
 * discards from the younger generations based on least recent usage, and
 * promotes younger generations to older generations based on most frequent
 * usage. Cache misses count as negative usage of the older generations,
 * biasing the cache against least recently used values with poor hit rates.
 *
 * The cache soft references the older generations, and weak references the
 * younger generations; the garbage collector can reclaim the entire cache,
 * but will preferentially wipe the younger cache generations before the older
 * cache generations.
 *
 * @public
 */
export class HashGenCacheSet<T> {
  /** @internal */
  readonly buckets: Array<HashGenCacheSetBucket<T> | undefined>;
  /** @internal */
  gen4Hits: number;
  /** @internal */
  gen3Hits: number;
  /** @internal */
  gen2Hits: number;
  /** @internal */
  gen1Hits: number;
  /** @internal */
  misses: number;

  constructor(size: number) {
    this.buckets = new Array(size);
    this.gen4Hits = 0;
    this.gen3Hits = 0;
    this.gen2Hits = 0;
    this.gen1Hits = 0;
    this.misses = 0;
  }

  put(value: T): T {
    if (this.buckets.length === 0) {
      return value;
    }
    const index = Math.abs(Values.hash(value)) % this.buckets.length;
    const bucket = this.buckets[index] || new HashGenCacheSetBucket<T>();

    const gen4Val = bucket.gen4Val;
    if (gen4Val !== void 0 && Values.equal(value, gen4Val)) {
      this.gen4Hits += 1;
      bucket.gen4Weight++;
      return gen4Val;
    }

    const gen3Val = bucket.gen3Val;
    if (gen3Val !== void 0 && Values.equal(value, gen3Val)) {
      this.gen3Hits += 1;
      if (bucket.gen3Weight++ > bucket.gen4Weight) {
        this.buckets[index] = new HashGenCacheSetBucket<T>(
            bucket.gen3Val, bucket.gen3Weight,
            bucket.gen4Val, bucket.gen4Weight,
            bucket.gen2Val, bucket.gen2Weight,
            bucket.gen1Val, bucket.gen1Weight);
      }
      return gen3Val;
    }

    const gen2Val = bucket.gen2Val;
    if (gen2Val !== void 0 && Values.equal(value, gen2Val)) {
      this.gen2Hits += 1;
      if (bucket.gen2Weight++ > bucket.gen3Weight) {
        this.buckets[index] = new HashGenCacheSetBucket<T>(
            bucket.gen4Val, bucket.gen4Weight,
            bucket.gen2Val, bucket.gen2Weight,
            bucket.gen3Val, bucket.gen3Weight,
            bucket.gen1Val, bucket.gen1Weight);
      }
      return gen2Val;
    }

    const gen1Val = bucket.gen1Val;
    if (gen1Val !== void 0 && Values.equal(value, gen1Val)) {
      this.gen1Hits += 1;
      if (bucket.gen1Weight++ > bucket.gen2Weight) {
        this.buckets[index] = new HashGenCacheSetBucket<T>(
            bucket.gen4Val, bucket.gen4Weight,
            bucket.gen3Val, bucket.gen3Weight,
            bucket.gen1Val, bucket.gen1Weight,
            bucket.gen2Val, bucket.gen2Weight);
      }
      return gen1Val;
    }

    this.misses += 1;
    if (gen4Val === void 0) {
      this.buckets[index] = new HashGenCacheSetBucket<T>(
          bucket.gen3Val, bucket.gen3Weight,
          bucket.gen2Val, bucket.gen2Weight,
          bucket.gen1Val, bucket.gen1Weight,
          value, 1);
    } else if (gen3Val === void 0) {
      this.buckets[index] = new HashGenCacheSetBucket<T>(
          bucket.gen4Val, bucket.gen4Weight,
          bucket.gen2Val, bucket.gen2Weight,
          bucket.gen1Val, bucket.gen1Weight,
          value, 1);
    } else if (gen2Val === void 0) {
      this.buckets[index] = new HashGenCacheSetBucket<T>(
          bucket.gen4Val, bucket.gen4Weight,
          bucket.gen3Val, bucket.gen3Weight,
          bucket.gen1Val, bucket.gen1Weight,
          value, 1);
    } else if (gen1Val === void 0) {
      this.buckets[index] = new HashGenCacheSetBucket<T>(
          bucket.gen4Val, bucket.gen4Weight,
          bucket.gen3Val, bucket.gen3Weight,
          bucket.gen2Val, bucket.gen2Weight,
          value, 1);
    } else {
      // Penalize older gens for thrash. Promote gen1 to prevent nacent gens
      // from flip-flopping. If sacrificed gen2 was worth keeping, it likely
      // would have already been promoted.
      this.buckets[index] = new HashGenCacheSetBucket<T>(
          bucket.gen4Val, bucket.gen4Weight - 1,
          bucket.gen3Val, bucket.gen3Weight - 1,
          bucket.gen1Val, bucket.gen1Weight,
          value, 1);
    }

    return value;
  }

  remove(value: T): boolean {
    if (this.buckets.length === 0) {
      return false;
    }
    const index = Math.abs(Values.hash(value)) % this.buckets.length;
    const bucket = this.buckets[index];
    if (bucket === void 0) {
      return false;
    }

    const gen4Val = bucket.gen4Val;
    if (gen4Val !== void 0 && Values.equal(value, gen4Val)) {
      this.buckets[index] = new HashGenCacheSetBucket<T>(
          bucket.gen3Val, bucket.gen3Weight,
          bucket.gen2Val, bucket.gen2Weight,
          bucket.gen1Val, bucket.gen1Weight,
          void 0, 0);
      return true;
    }

    const gen3Val = bucket.gen3Val;
    if (gen3Val !== void 0 && Values.equal(value, gen3Val)) {
      this.buckets[index] = new HashGenCacheSetBucket<T>(
          bucket.gen4Val, bucket.gen4Weight,
          bucket.gen2Val, bucket.gen2Weight,
          bucket.gen1Val, bucket.gen1Weight,
          void 0, 0);
      return true;
    }

    const gen2Val = bucket.gen2Val;
    if (gen2Val !== void 0 && Values.equal(value, gen2Val)) {
      this.buckets[index] = new HashGenCacheSetBucket<T>(
          bucket.gen4Val, bucket.gen4Weight,
          bucket.gen3Val, bucket.gen3Weight,
          bucket.gen1Val, bucket.gen1Weight,
          void 0, 0);
      return true;
    }

    const gen1Val = bucket.gen1Val;
    if (gen1Val !== void 0 && Values.equal(value, gen1Val)) {
      this.buckets[index] = new HashGenCacheSetBucket<T>(
          bucket.gen4Val, bucket.gen4Weight,
          bucket.gen3Val, bucket.gen3Weight,
          bucket.gen2Val, bucket.gen2Weight,
          void 0, 0);
      return true;
    }

    return false;
  }

  clear(): void {
    for (let i = 0; i < this.buckets.length; i += 1) {
      this.buckets[i] = void 0;
    }
  }

  /** @internal */
  get hits(): number {
    return this.gen4Hits + this.gen3Hits + this.gen2Hits + this.gen1Hits;
  }

  get hitRatio(): number {
    const hits = this.hits;
    return hits / (hits + this.misses);
  }
}

/** @internal */
export class HashGenCacheSetBucket<T> {
  /** @internal */
  gen4Val: T | undefined;
  /** @internal */
  gen4Weight: number;
  /** @internal */
  gen3Val: T | undefined;
  /** @internal */
  gen3Weight: number;
  /** @internal */
  gen2Val: T | undefined;
  /** @internal */
  gen2Weight: number;
  /** @internal */
  gen1Val: T | undefined;
  /** @internal */
  gen1Weight: number;

  constructor(gen4Val?: T, gen4Weight: number = 0,
              gen3Val?: T, gen3Weight: number = 0,
              gen2Val?: T, gen2Weight: number = 0,
              gen1Val?: T, gen1Weight: number = 0) {
    this.gen4Val = gen4Val;
    this.gen4Weight = gen4Weight;
    this.gen3Val = gen3Val;
    this.gen3Weight = gen3Weight;
    this.gen2Val = gen2Val;
    this.gen2Weight = gen2Weight;
    this.gen1Val = gen1Val;
    this.gen1Weight = gen1Weight;
  }
}
