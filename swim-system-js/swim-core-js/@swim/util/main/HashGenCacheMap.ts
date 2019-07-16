// Copyright 2015-2019 SWIM.AI inc.
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
 * A hashed generational cache map discards the least recently used value
 * with the worst hit rate per hash bucket.  HashGenCacheMap is a concurrent
 * and lock-free LRFU cache, with O(1) access time.
 *
 * Maintaining four "generations" of cached values per hash bucket, the cache
 * discards from the younger generations based on least recent usage, and
 * promotes younger generations to older generations based on most frequent
 * usage.  Cache misses count as negative usage of the older generations,
 * biasing the cache against least recently used values with poor hit rates.
 */
export class HashGenCacheMap<K, V> {
  /** @hidden */
  readonly _buckets: Array<HashGenCacheMapBucket<K, V> | undefined>;
  /** @hidden */
  _gen4Hits: number;
  /** @hidden */
  _gen3Hits: number;
  /** @hidden */
  _gen2Hits: number;
  /** @hidden */
  _gen1Hits: number;
  /** @hidden */
  _misses: number;

  constructor(size: number) {
    this._buckets = new Array(size);
    this._gen4Hits = 0;
    this._gen3Hits = 0;
    this._gen2Hits = 0;
    this._gen1Hits = 0;
    this._misses = 0;
  }

  get(key: K): V | undefined {
    if (this._buckets.length === 0) {
      return void 0;
    }
    const index = Math.abs(Objects.hash(key)) % this._buckets.length;
    const bucket = this._buckets[index];
    if (!bucket) {
      return void 0;
    }

    const gen4Key = bucket._gen4Key;
    if (gen4Key !== void 0 && Objects.equal(key, gen4Key)) {
      const gen4Val = bucket._gen4Val;
      if (gen4Val !== void 0) {
        this._gen4Hits += 1;
        bucket._gen4Weight++;
        return gen4Val;
      } else {
        bucket._gen4Key = void 0;
      }
    }

    const gen3Key = bucket._gen3Key;
    if (gen3Key !== void 0 && Objects.equal(key, gen3Key)) {
      const gen3Val = bucket._gen3Val;
      if (gen3Val !== void 0) {
        this._gen3Hits += 1;
        if (bucket._gen3Weight++ > bucket._gen4Weight) {
          this._buckets[index] = new HashGenCacheMapBucket(
              bucket._gen3Key, bucket._gen3Val, bucket._gen3Weight,
              bucket._gen4Key, bucket._gen4Val, bucket._gen4Weight,
              bucket._gen2Key, bucket._gen2Val, bucket._gen2Weight,
              bucket._gen1Key, bucket._gen1Val, bucket._gen1Weight);
        }
        return gen3Val;
      } else {
        bucket._gen3Key = void 0;
      }
    }

    const gen2Key = bucket._gen2Key;
    if (gen2Key !== void 0 && Objects.equal(key, gen2Key)) {
      const gen2Val = bucket._gen2Val;
      if (gen2Val !== void 0) {
        this._gen2Hits += 1;
        if (bucket._gen2Weight++ > bucket._gen3Weight) {
          this._buckets[index] = new HashGenCacheMapBucket(
              bucket._gen4Key, bucket._gen4Val, bucket._gen4Weight,
              bucket._gen2Key, bucket._gen2Val, bucket._gen2Weight,
              bucket._gen3Key, bucket._gen3Val, bucket._gen3Weight,
              bucket._gen1Key, bucket._gen1Val, bucket._gen1Weight);
        }
        return gen2Val;
      } else {
        bucket._gen2Key = void 0;
      }
    }

    const gen1Key = bucket._gen1Key;
    if (gen1Key !== void 0 && Objects.equal(key, gen1Key)) {
      const gen1Val = bucket._gen1Val;
      if (gen1Val !== void 0) {
        this._gen1Hits += 1;
        if (bucket._gen1Weight++ > bucket._gen2Weight) {
          this._buckets[index] = new HashGenCacheMapBucket(
              bucket._gen4Key, bucket._gen4Val, bucket._gen4Weight,
              bucket._gen3Key, bucket._gen3Val, bucket._gen3Weight,
              bucket._gen1Key, bucket._gen1Val, bucket._gen1Weight,
              bucket._gen2Key, bucket._gen2Val, bucket._gen2Weight);
        }
        return gen1Val;
      } else {
        bucket._gen1Key = void 0;
      }
    }

    this._misses += 1;
    return void 0;
  }

  put(key: K, value: V): V {
    if (this._buckets.length === 0) {
      return value;
    }
    const index = Math.abs(Objects.hash(key)) % this._buckets.length;
    const bucket = this._buckets[index] || new HashGenCacheMapBucket();

    let gen4Key = bucket._gen4Key;
    if (gen4Key !== void 0 && Objects.equal(key, gen4Key)) {
      const gen4Val = bucket._gen4Val;
      if (gen4Val !== void 0) {
        this._gen4Hits += 1;
        bucket._gen4Weight++;
        return gen4Val;
      } else {
        bucket._gen4Key = void 0;
        gen4Key = void 0;
      }
    }

    let gen3Key = bucket._gen3Key;
    if (gen3Key !== void 0 && Objects.equal(key, gen3Key)) {
      const gen3Val = bucket._gen3Val;
      if (gen3Val !== void 0) {
        this._gen3Hits += 1;
        if (bucket._gen3Weight++ > bucket._gen4Weight) {
          this._buckets[index] = new HashGenCacheMapBucket(
              bucket._gen3Key, bucket._gen3Val, bucket._gen3Weight,
              bucket._gen4Key, bucket._gen4Val, bucket._gen4Weight,
              bucket._gen2Key, bucket._gen2Val, bucket._gen2Weight,
              bucket._gen1Key, bucket._gen1Val, bucket._gen1Weight);
        }
        return gen3Val;
      } else {
        bucket._gen3Key = void 0;
        gen3Key = void 0;
      }
    }

    let gen2Key = bucket._gen2Key;
    if (gen2Key !== void 0 && Objects.equal(key, gen2Key)) {
      const gen2Val = bucket._gen2Val;
      if (gen2Val !== void 0) {
        this._gen2Hits += 1;
        if (bucket._gen2Weight++ > bucket._gen3Weight) {
          this._buckets[index] = new HashGenCacheMapBucket(
              bucket._gen4Key, bucket._gen4Val, bucket._gen4Weight,
              bucket._gen2Key, bucket._gen2Val, bucket._gen2Weight,
              bucket._gen3Key, bucket._gen3Val, bucket._gen3Weight,
              bucket._gen1Key, bucket._gen1Val, bucket._gen1Weight);
        }
        return gen2Val;
      } else {
        bucket._gen2Key = void 0;
        gen2Key = void 0;
      }
    }

    let gen1Key = bucket._gen1Key;
    if (gen1Key !== void 0 && Objects.equal(key, gen1Key)) {
      const gen1Val = bucket._gen1Val;
      if (gen1Val !== void 0) {
        this._gen1Hits += 1;
        if (bucket._gen1Weight++ > bucket._gen2Weight) {
          this._buckets[index] = new HashGenCacheMapBucket(
              bucket._gen4Key, bucket._gen4Val, bucket._gen4Weight,
              bucket._gen3Key, bucket._gen3Val, bucket._gen3Weight,
              bucket._gen1Key, bucket._gen1Val, bucket._gen1Weight,
              bucket._gen2Key, bucket._gen2Val, bucket._gen2Weight);
        }
        return gen1Val;
      } else {
        bucket._gen1Key = void 0;
        gen1Key = void 0;
      }
    }

    this._misses += 1;
    if (gen4Key === void 0) {
      this._buckets[index] = new HashGenCacheMapBucket(
          bucket._gen3Key, bucket._gen3Val, bucket._gen3Weight,
          bucket._gen2Key, bucket._gen2Val, bucket._gen2Weight,
          bucket._gen1Key, bucket._gen1Val, bucket._gen1Weight,
          key, value, 1);
    } else if (gen3Key === void 0) {
      this._buckets[index] = new HashGenCacheMapBucket(
          bucket._gen4Key, bucket._gen4Val, bucket._gen4Weight,
          bucket._gen2Key, bucket._gen2Val, bucket._gen2Weight,
          bucket._gen1Key, bucket._gen1Val, bucket._gen1Weight,
          key, value, 1);
    } else if (gen2Key === void 0) {
      this._buckets[index] = new HashGenCacheMapBucket(
          bucket._gen4Key, bucket._gen4Val, bucket._gen4Weight,
          bucket._gen3Key, bucket._gen3Val, bucket._gen3Weight,
          bucket._gen1Key, bucket._gen1Val, bucket._gen1Weight,
          key, value, 1);
    } else if (gen1Key === void 0) {
      this._buckets[index] = new HashGenCacheMapBucket(
          bucket._gen4Key, bucket._gen4Val, bucket._gen4Weight,
          bucket._gen3Key, bucket._gen3Val, bucket._gen3Weight,
          bucket._gen2Key, bucket._gen2Val, bucket._gen2Weight,
          key, value, 1);
    } else {
      // Penalize older gens for thrash. Promote gen1 to prevent nacent gens
      // from flip-flopping. If sacrificed gen2 was worth keeping, it likely
      // would have already been promoted.
      this._buckets[index] = new HashGenCacheMapBucket(
          bucket._gen4Key, bucket._gen4Val, bucket._gen4Weight - 1,
          bucket._gen3Key, bucket._gen3Val, bucket._gen3Weight - 1,
          bucket._gen1Key, bucket._gen1Val, bucket._gen1Weight,
          key, value, 1);
    }

    return value;
  }

  remove(key: K): V | undefined {
    if (this._buckets.length === 0) {
      return void 0;
    }
    const index = Math.abs(Objects.hash(key)) % this._buckets.length;
    const bucket = this._buckets[index];
    if (!bucket) {
      return void 0;
    }

    const gen4Key = bucket._gen4Key;
    if (gen4Key !== void 0 && Objects.equal(key, gen4Key)) {
      const gen4Val = bucket._gen4Val;
      this._buckets[index] = new HashGenCacheMapBucket(
          bucket._gen3Key, bucket._gen3Val, bucket._gen3Weight,
          bucket._gen2Key, bucket._gen2Val, bucket._gen2Weight,
          bucket._gen1Key, bucket._gen1Val, bucket._gen1Weight,
          void 0, void 0, 0);
      return gen4Val;
    }

    const gen3Key = bucket._gen3Key;
    if (gen3Key !== void 0 && Objects.equal(key, gen3Key)) {
      const gen3Val = bucket._gen3Val;
      this._buckets[index] = new HashGenCacheMapBucket(
          bucket._gen4Key, bucket._gen4Val, bucket._gen4Weight,
          bucket._gen2Key, bucket._gen2Val, bucket._gen2Weight,
          bucket._gen1Key, bucket._gen1Val, bucket._gen1Weight,
          void 0, void 0, 0);
      return gen3Val;
    }

    const gen2Key = bucket._gen2Key;
    if (gen2Key !== void 0 && Objects.equal(key, gen2Key)) {
      const gen2Val = bucket._gen2Val;
      this._buckets[index] = new HashGenCacheMapBucket(
          bucket._gen4Key, bucket._gen4Val, bucket._gen4Weight,
          bucket._gen3Key, bucket._gen3Val, bucket._gen3Weight,
          bucket._gen1Key, bucket._gen1Val, bucket._gen1Weight,
          void 0, void 0, 0);
      return gen2Val;
    }

    const gen1Key = bucket._gen1Key;
    if (gen1Key !== void 0 && Objects.equal(key, gen1Key)) {
      const gen1Val = bucket._gen1Val;
      this._buckets[index] = new HashGenCacheMapBucket(
          bucket._gen4Key, bucket._gen4Val, bucket._gen4Weight,
          bucket._gen3Key, bucket._gen3Val, bucket._gen3Weight,
          bucket._gen2Key, bucket._gen2Val, bucket._gen2Weight,
          void 0, void 0, 0);
      return gen1Val;
    }

    return void 0;
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
export class HashGenCacheMapBucket<K, V> {
  /** @hidden */
  _gen4Key: K | undefined;
  /** @hidden */
  _gen4Val: V | undefined;
  /** @hidden */
  _gen4Weight: number;
  /** @hidden */
  _gen3Key: K | undefined;
  /** @hidden */
  _gen3Val: V | undefined;
  /** @hidden */
  _gen3Weight: number;
  /** @hidden */
  _gen2Key: K | undefined;
  /** @hidden */
  _gen2Val: V | undefined;
  /** @hidden */
  _gen2Weight: number;
  /** @hidden */
  _gen1Key: K | undefined;
  /** @hidden */
  _gen1Val: V | undefined;
  /** @hidden */
  _gen1Weight: number;

  constructor(gen4Key?: K, gen4Val?: V, gen4Weight: number = 0,
              gen3Key?: K, gen3Val?: V, gen3Weight: number = 0,
              gen2Key?: K, gen2Val?: V, gen2Weight: number = 0,
              gen1Key?: K, gen1Val?: V, gen1Weight: number = 0) {
    this._gen4Key = gen4Key;
    this._gen4Val = gen4Val;
    this._gen4Weight = gen4Weight;
    this._gen3Key = gen3Key;
    this._gen3Val = gen3Val;
    this._gen3Weight = gen3Weight;
    this._gen2Key = gen2Key;
    this._gen2Val = gen2Val;
    this._gen2Weight = gen2Weight;
    this._gen1Key = gen1Key;
    this._gen1Val = gen1Val;
    this._gen1Weight = gen1Weight;
  }
}
