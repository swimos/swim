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

package swim.util;

import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceArray;

/**
 * A hashed generational map evicts the least recently used value with the
 * worst hit rate per hash bucket.  HashGenMap is a concurrent and lock-free
 * LRFU cache, with O(1) access time, that strongly references its values.
 *
 * Maintaining four "generations" of cached values per hash bucket, the cache
 * discards from the younger generations based on least recent usage, and
 * promotes younger generations to older generations based on most frequent
 * usage.  Cache misses count as negative usage of the older generations,
 * biasing the cache against least recently used values with poor hit rates.
 *
 * The evict(K, V) method is guaranteed to be called when a value is displaced
 * from the cache.
 */
public class HashGenMap<K, V> {
  final AtomicReferenceArray<HashGenMapBucket<K, V>> buckets;
  volatile int gen4Hits;
  volatile int gen3Hits;
  volatile int gen2Hits;
  volatile int gen1Hits;
  volatile int misses;
  volatile int evicts;

  public HashGenMap(int size) {
    this.buckets = new AtomicReferenceArray<HashGenMapBucket<K, V>>(size);
  }

  protected void evict(K key, V value) {
    // stub
  }

  public V get(K key) {
    if (this.buckets.length() == 0) {
      return null;
    }
    HashGenMapBucket<K, V> bucket;
    HashGenMapBucket<K, V> newBucket;
    V cacheVal;
    final int index = Math.abs(key.hashCode()) % this.buckets.length();
    do {
      bucket = this.buckets.get(index);
      if (bucket == null) {
        newBucket = null;
        cacheVal = null;
      } else {
        if (bucket.gen4Key != null && key.equals(bucket.gen4Key)) {
          GEN4_HITS.incrementAndGet(this);
          BUCKET_GEN4_WEIGHT.incrementAndGet(bucket);
          newBucket = bucket;
          cacheVal = bucket.gen4Val;
        } else if (bucket.gen3Key != null && key.equals(bucket.gen3Key)) {
          GEN3_HITS.incrementAndGet(this);
          if (BUCKET_GEN3_WEIGHT.incrementAndGet(bucket) > bucket.gen4Weight) {
            newBucket = new HashGenMapBucket<K, V>(
              bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
              bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
              bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
              bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight);
          } else {
            newBucket = bucket;
          }
          cacheVal = bucket.gen3Val;
        } else if (bucket.gen2Key != null && key.equals(bucket.gen2Key)) {
          GEN2_HITS.incrementAndGet(this);
          if (BUCKET_GEN2_WEIGHT.incrementAndGet(bucket) > bucket.gen3Weight) {
            newBucket = new HashGenMapBucket<K, V>(
              bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
              bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
              bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
              bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight);
          } else {
            newBucket = bucket;
          }
          cacheVal = bucket.gen2Val;
        } else if (bucket.gen1Key != null && key.equals(bucket.gen1Key)) {
          GEN1_HITS.incrementAndGet(this);
          if (BUCKET_GEN1_WEIGHT.incrementAndGet(bucket) > bucket.gen2Weight) {
            newBucket = new HashGenMapBucket<K, V>(
              bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
              bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
              bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
              bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight);
          } else {
            newBucket = bucket;
          }
          cacheVal = bucket.gen1Val;
        } else {
          MISSES.incrementAndGet(this);
          newBucket = bucket;
          cacheVal = null;
        }
      }
    } while (bucket != newBucket && !this.buckets.compareAndSet(index, bucket, newBucket));
    return cacheVal;
  }

  public V put(K key, V value) {
    if (this.buckets.length() == 0) {
      return value;
    }
    HashGenMapBucket<K, V> bucket;
    HashGenMapBucket<K, V> newBucket;
    K evictKey = null;
    V evictVal = null;
    V cacheVal;
    final int index = Math.abs(key.hashCode()) % this.buckets.length();
    do {
      bucket = this.buckets.get(index);
      if (bucket == null) {
        newBucket = new HashGenMapBucket<K, V>(key, value);
        cacheVal = value;
      } else {
        if (bucket.gen4Key != null && key.equals(bucket.gen4Key)) {
          GEN4_HITS.incrementAndGet(this);
          BUCKET_GEN4_WEIGHT.incrementAndGet(bucket);
          newBucket = bucket;
          cacheVal = bucket.gen4Val;
        } else if (bucket.gen3Key != null && key.equals(bucket.gen3Key)) {
          GEN3_HITS.incrementAndGet(this);
          if (BUCKET_GEN3_WEIGHT.incrementAndGet(bucket) > bucket.gen4Weight) {
            newBucket = new HashGenMapBucket<K, V>(
                bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
                bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
                bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
                bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight);
          } else {
            newBucket = bucket;
          }
          cacheVal = bucket.gen3Val;
        } else if (bucket.gen2Key != null && key.equals(bucket.gen2Key)) {
          GEN2_HITS.incrementAndGet(this);
          if (BUCKET_GEN2_WEIGHT.incrementAndGet(bucket) > bucket.gen3Weight) {
            newBucket = new HashGenMapBucket<K, V>(
                bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
                bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
                bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
                bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight);
          } else {
            newBucket = bucket;
          }
          cacheVal = bucket.gen2Val;
        } else if (bucket.gen1Key != null && key.equals(bucket.gen1Key)) {
          GEN1_HITS.incrementAndGet(this);
          if (BUCKET_GEN1_WEIGHT.incrementAndGet(bucket) > bucket.gen2Weight) {
            newBucket = new HashGenMapBucket<K, V>(
                bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
                bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
                bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
                bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight);
          } else {
            newBucket = bucket;
          }
          cacheVal = bucket.gen1Val;
        } else {
          MISSES.incrementAndGet(this);
          evictKey = bucket.gen2Key;
          evictVal = bucket.gen2Val;
          // Penalize older gens for thrash. Promote gen1 to prevent nacent gens
          // from flip-flopping. If sacrificed gen2 was worth keeping, it likely
          // would have already been promoted.
          newBucket = new HashGenMapBucket<K, V>(
              bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight - 1,
              bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight - 1,
              bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
              key, value, 1);
          cacheVal = value;
        }
      }
    } while (bucket != newBucket && !this.buckets.compareAndSet(index, bucket, newBucket));
    if (evictKey != null) {
      EVICTS.incrementAndGet(this);
      evict(evictKey, evictVal);
    }
    return cacheVal;
  }

  public V remove(K key) {
    if (this.buckets.length() == 0) {
      return null;
    }
    HashGenMapBucket<K, V> bucket;
    HashGenMapBucket<K, V> newBucket;
    V cacheVal;
    final int index = Math.abs(key.hashCode()) % this.buckets.length();
    do {
      bucket = this.buckets.get(index);
      if (bucket == null) {
        cacheVal = null;
        newBucket = null;
      } else {
        if (bucket.gen4Key != null && key.equals(bucket.gen4Key)) {
          cacheVal = bucket.gen4Val;
          newBucket = new HashGenMapBucket<K, V>(
              bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
              bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
              bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
              null, null, 0);
        } else if (bucket.gen3Key != null && key.equals(bucket.gen3Key)) {
          cacheVal = bucket.gen3Val;
          newBucket = new HashGenMapBucket<K, V>(
              bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
              bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
              bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
              null, null, 0);
        } else if (bucket.gen2Key != null && key.equals(bucket.gen2Key)) {
          cacheVal = bucket.gen2Val;
          newBucket = new HashGenMapBucket<K, V>(
              bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
              bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
              bucket.gen1Key, bucket.gen1Val, bucket.gen1Weight,
              null, null, 0);
        } else if (bucket.gen1Key != null && key.equals(bucket.gen1Key)) {
          cacheVal = bucket.gen1Val;
          newBucket = new HashGenMapBucket<K, V>(
              bucket.gen4Key, bucket.gen4Val, bucket.gen4Weight,
              bucket.gen3Key, bucket.gen3Val, bucket.gen3Weight,
              bucket.gen2Key, bucket.gen2Val, bucket.gen2Weight,
              null, null, 0);
        } else {
          cacheVal = null;
          newBucket = bucket;
        }
      }
    } while (bucket != newBucket && !this.buckets.compareAndSet(index, bucket, newBucket));
    return cacheVal;
  }

  public void clear() {
    for (int i = 0; i < this.buckets.length(); i += 1) {
      this.buckets.set(i, null);
    }
  }

  public long hits() {
    return (long) this.gen4Hits + (long) this.gen3Hits + (long) this.gen2Hits + (long) this.gen1Hits;
  }

  public double hitRatio() {
    final double hits = (double) hits();
    return hits / (hits + (double) this.misses);
  }

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMapBucket<?, ?>> BUCKET_GEN4_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMapBucket<?, ?>>) (Class<?>) HashGenMapBucket.class, "gen4Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMapBucket<?, ?>> BUCKET_GEN3_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMapBucket<?, ?>>) (Class<?>) HashGenMapBucket.class, "gen3Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMapBucket<?, ?>> BUCKET_GEN2_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMapBucket<?, ?>>) (Class<?>) HashGenMapBucket.class, "gen2Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMapBucket<?, ?>> BUCKET_GEN1_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMapBucket<?, ?>>) (Class<?>) HashGenMapBucket.class, "gen1Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMap<?, ?>> GEN4_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMap<?, ?>>) (Class<?>) HashGenMap.class, "gen4Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMap<?, ?>> GEN3_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMap<?, ?>>) (Class<?>) HashGenMap.class, "gen3Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMap<?, ?>> GEN2_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMap<?, ?>>) (Class<?>) HashGenMap.class, "gen2Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMap<?, ?>> GEN1_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMap<?, ?>>) (Class<?>) HashGenMap.class, "gen1Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMap<?, ?>> MISSES =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMap<?, ?>>) (Class<?>) HashGenMap.class, "misses");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMap<?, ?>> EVICTS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMap<?, ?>>) (Class<?>) HashGenMap.class, "evicts");
}

final class HashGenMapBucket<K, V> {
  final K gen4Key;
  final V gen4Val;
  final K gen3Key;
  final V gen3Val;
  final K gen2Key;
  final V gen2Val;
  final K gen1Key;
  final V gen1Val;

  volatile int gen4Weight;
  volatile int gen3Weight;
  volatile int gen2Weight;
  volatile int gen1Weight;

  HashGenMapBucket(K gen4Key, V gen4Val, int gen4Weight,
                   K gen3Key, V gen3Val, int gen3Weight,
                   K gen2Key, V gen2Val, int gen2Weight,
                   K gen1Key, V gen1Val, int gen1Weight) {
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

  HashGenMapBucket(K key, V value) {
    this(null, null, 0, null, null, 0, null, null, 0, key, value, 1);
  }

  HashGenMapBucket() {
    this(null, null, 0, null, null, 0, null, null, 0, null, null, 0);
  }
}
