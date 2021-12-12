// Copyright 2015-2021 Swim.inc
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
 * A hashed generational cache map discards the least recently used value
 * with the worst hit rate per hash bucket. HashGenCacheMap is an LRFU cache
 * with O(1) access time.
 *
 * Maintaining four "generations" of cached values per hash bucket, the cache
 * discards from the younger generations based on least recent usage, and
 * promotes younger generations to older generations based on most frequent
 * usage. Cache misses count as negative usage of the older generations,
 * biasing the cache against least recently used values with poor hit rates.
 *
 * @public
 */
export class HashGenCacheMap<K, V> {
  /** @internal */
  readonly buckets: Array<HashGenCacheMapBucket<K, V> | undefined>;
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

  get(key: K): V | undefined {
    if (this.buckets.length === 0) {
      return void 0;
    }
    const index = Math.abs(Values.hash(key)) % this.buckets.length;
    const bucket = this.buckets[index];
    if (bucket === void 0) {
      return void 0;
    }

    const gen4Key = bucket.gen4Key;
    if (gen4Key !== void 0 && Values.equal(key, gen4Key)) {
      const gen4Val = bucket.gen4Val;
      if (gen4Val !== void 0) {
        this.gen4Hits += 1;
        bucket.gen4Weight++;
        return gen4Val;
      } else {
        bucket.gen4Key = void 0;
      }
    }

    const gen3Key = bucket.gen3Key;
    if (gen3Key !== void 0 && Values.equal(key, gen3Key)) {
      const gen3Val = bucket.gen3Val;
      if (gen3Val !== void 0) {
        this.gen3Hits += 1;
        if (bucket.gen3Weight++ > bucket.gen4Weight) {
          this.buckets[index] = new HashGenCacheMapBucket(
              bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
              bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
              bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
              bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight);
        }
        return gen3Val;
      } else {
        bucket.gen3Key = void 0;
      }
    }

    const gen2Key = bucket.gen2Key;
    if (gen2Key !== void 0 && Values.equal(key, gen2Key)) {
      const gen2Val = bucket.gen2Val;
      if (gen2Val !== void 0) {
        this.gen2Hits += 1;
        if (bucket.gen2Weight++ > bucket.gen3Weight) {
          this.buckets[index] = new HashGenCacheMapBucket(
              bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
              bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
              bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
              bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight);
        }
        return gen2Val;
      } else {
        bucket.gen2Key = void 0;
      }
    }

    const gen1Key = bucket.gen1Key;
    if (gen1Key !== void 0 && Values.equal(key, gen1Key)) {
      const gen1Val = bucket.gen1Val;
      if (gen1Val !== void 0) {
        this.gen1Hits += 1;
        if (bucket.gen1Weight++ > bucket.gen2Weight) {
          this.buckets[index] = new HashGenCacheMapBucket(
              bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
              bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
              bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
              bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight);
        }
        return gen1Val;
      } else {
        bucket.gen1Key = void 0;
      }
    }

    this.misses += 1;
    return void 0;
  }

  put(key: K, value: V): V {
    if (this.buckets.length === 0) {
      return value;
    }
    const index = Math.abs(Values.hash(key)) % this.buckets.length;
    const bucket = this.buckets[index] || new HashGenCacheMapBucket();

    let gen4Key = bucket.gen4Key;
    if (gen4Key !== void 0 && Values.equal(key, gen4Key)) {
      const gen4Val = bucket.gen4Val;
      if (gen4Val !== void 0) {
        this.gen4Hits += 1;
        bucket.gen4Weight++;
        return gen4Val;
      } else {
        bucket.gen4Key = void 0;
        gen4Key = void 0;
      }
    }

    let gen3Key = bucket.gen3Key;
    if (gen3Key !== void 0 && Values.equal(key, gen3Key)) {
      const gen3Val = bucket.gen3Val;
      if (gen3Val !== void 0) {
        this.gen3Hits += 1;
        if (bucket.gen3Weight++ > bucket.gen4Weight) {
          this.buckets[index] = new HashGenCacheMapBucket(
              bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
              bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
              bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
              bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight);
        }
        return gen3Val;
      } else {
        bucket.gen3Key = void 0;
        gen3Key = void 0;
      }
    }

    let gen2Key = bucket.gen2Key;
    if (gen2Key !== void 0 && Values.equal(key, gen2Key)) {
      const gen2Val = bucket.gen2Val;
      if (gen2Val !== void 0) {
        this.gen2Hits += 1;
        if (bucket.gen2Weight++ > bucket.gen3Weight) {
          this.buckets[index] = new HashGenCacheMapBucket(
              bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
              bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
              bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
              bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight);
        }
        return gen2Val;
      } else {
        bucket.gen2Key = void 0;
        gen2Key = void 0;
      }
    }

    let gen1Key = bucket.gen1Key;
    if (gen1Key !== void 0 && Values.equal(key, gen1Key)) {
      const gen1Val = bucket.gen1Val;
      if (gen1Val !== void 0) {
        this.gen1Hits += 1;
        if (bucket.gen1Weight++ > bucket.gen2Weight) {
          this.buckets[index] = new HashGenCacheMapBucket(
              bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
              bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
              bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
              bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight);
        }
        return gen1Val;
      } else {
        bucket.gen1Key = void 0;
        gen1Key = void 0;
      }
    }

    this.misses += 1;
    if (gen4Key === void 0) {
      this.buckets[index] = new HashGenCacheMapBucket(
          bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
          bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
          bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
          key, value, 1);
    } else if (gen3Key === void 0) {
      this.buckets[index] = new HashGenCacheMapBucket(
          bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
          bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
          bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
          key, value, 1);
    } else if (gen2Key === void 0) {
      this.buckets[index] = new HashGenCacheMapBucket(
          bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
          bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
          bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
          key, value, 1);
    } else if (gen1Key === void 0) {
      this.buckets[index] = new HashGenCacheMapBucket(
          bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
          bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
          bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
          key, value, 1);
    } else {
      // Penalize older gens for thrash. Promote gen1 to prevent nacent gens
      // from flip-flopping. If sacrificed gen2 was worth keeping, it likely
      // would have already been promoted.
      this.buckets[index] = new HashGenCacheMapBucket(
          bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight - 1,
          bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight - 1,
          bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
          key, value, 1);
    }

    return value;
  }

  remove(key: K): V | undefined {
    if (this.buckets.length === 0) {
      return void 0;
    }
    const index = Math.abs(Values.hash(key)) % this.buckets.length;
    const bucket = this.buckets[index];
    if (bucket === void 0) {
      return void 0;
    }

    const gen4Key = bucket.gen4Key;
    if (gen4Key !== void 0 && Values.equal(key, gen4Key)) {
      const gen4Val = bucket.gen4Val;
      this.buckets[index] = new HashGenCacheMapBucket(
          bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
          bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
          bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
          void 0, void 0, 0);
      return gen4Val;
    }

    const gen3Key = bucket.gen3Key;
    if (gen3Key !== void 0 && Values.equal(key, gen3Key)) {
      const gen3Val = bucket.gen3Val;
      this.buckets[index] = new HashGenCacheMapBucket(
          bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
          bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
          bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
          void 0, void 0, 0);
      return gen3Val;
    }

    const gen2Key = bucket.gen2Key;
    if (gen2Key !== void 0 && Values.equal(key, gen2Key)) {
      const gen2Val = bucket.gen2Val;
      this.buckets[index] = new HashGenCacheMapBucket(
          bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
          bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
          bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
          void 0, void 0, 0);
      return gen2Val;
    }

    const gen1Key = bucket.gen1Key;
    if (gen1Key !== void 0 && Values.equal(key, gen1Key)) {
      const gen1Val = bucket.gen1Val;
      this.buckets[index] = new HashGenCacheMapBucket(
          bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
          bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
          bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
          void 0, void 0, 0);
      return gen1Val;
    }

    return void 0;
  }

  clear(): void {
    for (let i = 0; i < this.buckets.length; i += 1) {
      this.buckets[i] = void 0;
    }
  }

  /** @internal */
  hits(): number {
    return this.gen4Hits + this.gen3Hits + this.gen2Hits + this.gen1Hits;
  }

  hitRatio(): number {
    const hits = this.hits();
    return hits / (hits + this.misses);
  }
}

/** @internal */
export class HashGenCacheMapBucket<K, V> {
  /** @internal */
  gen4Key: K | undefined;
  /** @internal */
  gen4Val: V | undefined;
  /** @internal */
  gen4Weight: number;
  /** @internal */
  gen3Key: K | undefined;
  /** @internal */
  gen3Val: V | undefined;
  /** @internal */
  gen3Weight: number;
  /** @internal */
  gen2Key: K | undefined;
  /** @internal */
  gen2Val: V | undefined;
  /** @internal */
  gen2Weight: number;
  /** @internal */
  gen1Key: K | undefined;
  /** @internal */
  gen1Val: V | undefined;
  /** @internal */
  gen1Weight: number;

  constructor(gen4Key?: K, gen4Val?: V, gen4Weight: number = 0,
              gen3Key?: K, gen3Val?: V, gen3Weight: number = 0,
              gen2Key?: K, gen2Val?: V, gen2Weight: number = 0,
              gen1Key?: K, gen1Val?: V, gen1Weight: number = 0) {
    this.gen4Key = gen4Key;
    this.gen4Val = gen4Val;
    this.gen4Weight = gen4Weight;
    this.gen3Key = gen3Key;
    this.gen3Val = gen3Val;
    this.gen3Weight = gen3Weight;
    this.gen2Key = gen2Key;
    this.gen2Val = gen2Val;
    this.gen2Weight = gen2Weight;
    this.gen1Key = gen1Key;
    this.gen1Val = gen1Val;
    this.gen1Weight = gen1Weight;
  }
}
