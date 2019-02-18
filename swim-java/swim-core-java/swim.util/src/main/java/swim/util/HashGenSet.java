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
 * A hashed generational set evicts the least recently used value with the
 * worst hit rate per hash bucket.  HashGenSet is a concurrent and lock-free
 * LRFU cache, with O(1) access time, that strongly references its values.
 *
 * Maintaining four "generations" of cached values per hash bucket, the cache
 * discards from the younger generations based on least recent usage, and
 * promotes younger generations to older generations based on most frequent
 * usage.  Cache misses count as negative usage of the older generations,
 * biasing the cache against least recently used values with poor hit rates.
 *
 * The evict(V) method is guaranteed to be called when a value is displaced
 * from the cache.
 */
public class HashGenSet<V> {
  final AtomicReferenceArray<HashGenSetBucket<V>> buckets;
  volatile int gen4Hits;
  volatile int gen3Hits;
  volatile int gen2Hits;
  volatile int gen1Hits;
  volatile int misses;
  volatile int evicts;

  public HashGenSet(int size) {
    buckets = new AtomicReferenceArray<HashGenSetBucket<V>>(size);
  }

  protected void evict(V value) { }

  public V put(V value) {
    if (buckets.length() == 0) {
      return value;
    }
    HashGenSetBucket<V> bucket;
    HashGenSetBucket<V> newBucket;
    V evictVal = null;
    V cacheVal;
    final int index = Math.abs(value.hashCode()) % buckets.length();
    do {
      bucket = buckets.get(index);
      if (bucket == null) {
        newBucket = new HashGenSetBucket<V>(value);
        cacheVal = value;
      } else {
        if (bucket.gen4Val != null && value.equals(bucket.gen4Val)) {
          GEN4_HITS.incrementAndGet(this);
          BUCKET_GEN4_WEIGHT.incrementAndGet(bucket);
          newBucket = bucket;
          cacheVal = bucket.gen4Val;
        } else if (bucket.gen3Val != null && value.equals(bucket.gen3Val)) {
          GEN3_HITS.incrementAndGet(this);
          if (BUCKET_GEN3_WEIGHT.incrementAndGet(bucket) > bucket.gen4Weight) {
            newBucket = new HashGenSetBucket<V>(
                bucket.gen3Val, bucket.gen3Weight,
                bucket.gen4Val, bucket.gen4Weight,
                bucket.gen2Val, bucket.gen2Weight,
                bucket.gen1Val, bucket.gen1Weight);
          } else {
            newBucket = bucket;
          }
          cacheVal = bucket.gen3Val;
        } else if (bucket.gen2Val != null && value.equals(bucket.gen2Val)) {
          GEN2_HITS.incrementAndGet(this);
          if (BUCKET_GEN2_WEIGHT.incrementAndGet(bucket) > bucket.gen3Weight) {
            newBucket = new HashGenSetBucket<V>(
                bucket.gen4Val, bucket.gen4Weight,
                bucket.gen2Val, bucket.gen2Weight,
                bucket.gen3Val, bucket.gen3Weight,
                bucket.gen1Val, bucket.gen1Weight);
          } else {
            newBucket = bucket;
          }
          cacheVal = bucket.gen2Val;
        } else if (bucket.gen1Val != null && value.equals(bucket.gen1Val)) {
          GEN1_HITS.incrementAndGet(this);
          if (BUCKET_GEN1_WEIGHT.incrementAndGet(bucket) > bucket.gen2Weight) {
            newBucket = new HashGenSetBucket<V>(
                bucket.gen4Val, bucket.gen4Weight,
                bucket.gen3Val, bucket.gen3Weight,
                bucket.gen1Val, bucket.gen1Weight,
                bucket.gen2Val, bucket.gen2Weight);
          } else {
            newBucket = bucket;
          }
          cacheVal = bucket.gen1Val;
        } else {
          MISSES.incrementAndGet(this);
          evictVal = bucket.gen2Val;
          // Penalize older gens for thrash. Promote gen1 to prevent nacent gens
          // from flip-flopping. If sacrificed gen2 was worth keeping, it likely
          // would have already been promoted.
          newBucket = new HashGenSetBucket<V>(
              bucket.gen4Val, bucket.gen4Weight - 1,
              bucket.gen3Val, bucket.gen3Weight - 1,
              bucket.gen1Val, bucket.gen1Weight,
              value, 1);
          cacheVal = value;
        }
      }
    } while (bucket != newBucket && !buckets.compareAndSet(index, bucket, newBucket));
    if (evictVal != null) {
      EVICTS.incrementAndGet(this);
      evict(evictVal);
    }
    return cacheVal;
  }

  public boolean remove(V value) {
    if (buckets.length() == 0) {
      return false;
    }
    HashGenSetBucket<V> bucket;
    HashGenSetBucket<V> newBucket;
    boolean removed;
    final int index = Math.abs(value.hashCode()) % buckets.length();
    do {
      bucket = buckets.get(index);
      if (bucket == null) {
        newBucket = null;
        removed = false;
      } else {
        if (bucket.gen4Val != null && value.equals(bucket.gen4Val)) {
          newBucket = new HashGenSetBucket<V>(
              bucket.gen3Val, bucket.gen3Weight,
              bucket.gen2Val, bucket.gen2Weight,
              bucket.gen1Val, bucket.gen1Weight,
              null, 0);
          removed = true;
        } else if (bucket.gen3Val != null && value.equals(bucket.gen3Val)) {
          newBucket = new HashGenSetBucket<V>(
              bucket.gen4Val, bucket.gen4Weight,
              bucket.gen2Val, bucket.gen2Weight,
              bucket.gen1Val, bucket.gen1Weight,
              null, 0);
          removed = true;
        } else if (bucket.gen2Val != null && value.equals(bucket.gen2Val)) {
          newBucket = new HashGenSetBucket<V>(
              bucket.gen4Val, bucket.gen4Weight,
              bucket.gen3Val, bucket.gen3Weight,
              bucket.gen1Val, bucket.gen1Weight,
              null, 0);
          removed = true;
        } else if (bucket.gen1Val != null && value.equals(bucket.gen1Val)) {
          newBucket = new HashGenSetBucket<V>(
              bucket.gen4Val, bucket.gen4Weight,
              bucket.gen3Val, bucket.gen3Weight,
              bucket.gen2Val, bucket.gen2Weight,
              null, 0);
          removed = true;
        } else {
          newBucket = bucket;
          removed = false;
        }
      }
    } while (bucket != newBucket && !buckets.compareAndSet(index, bucket, newBucket));
    return removed;
  }

  public void clear() {
    for (int i = 0; i < buckets.length(); i += 1) {
      buckets.set(i, null);
    }
  }

  public double hitRatio() {
    final double hits = (double) gen4Hits + (double) gen3Hits + (double) gen2Hits + (double) gen1Hits;
    return hits / (hits + (double) misses);
  }

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSetBucket<?>> BUCKET_GEN4_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSetBucket<?>>) (Class<?>) HashGenSetBucket.class, "gen4Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSetBucket<?>> BUCKET_GEN3_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSetBucket<?>>) (Class<?>) HashGenSetBucket.class, "gen3Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSetBucket<?>> BUCKET_GEN2_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSetBucket<?>>) (Class<?>) HashGenSetBucket.class, "gen2Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSetBucket<?>> BUCKET_GEN1_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSetBucket<?>>) (Class<?>) HashGenSetBucket.class, "gen1Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSet<?>> GEN4_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSet<?>>) (Class<?>) HashGenSet.class, "gen4Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSet<?>> GEN3_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSet<?>>) (Class<?>) HashGenSet.class, "gen3Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSet<?>> GEN2_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSet<?>>) (Class<?>) HashGenSet.class, "gen2Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSet<?>> GEN1_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSet<?>>) (Class<?>) HashGenSet.class, "gen1Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSet<?>> MISSES =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSet<?>>) (Class<?>) HashGenSet.class, "misses");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSet<?>> EVICTS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSet<?>>) (Class<?>) HashGenSet.class, "evicts");
}

final class HashGenSetBucket<V> {
  final V gen4Val;
  final V gen3Val;
  final V gen2Val;
  final V gen1Val;

  volatile int gen4Weight;
  volatile int gen3Weight;
  volatile int gen2Weight;
  volatile int gen1Weight;

  HashGenSetBucket(V gen4Val, int gen4Weight,
                   V gen3Val, int gen3Weight,
                   V gen2Val, int gen2Weight,
                   V gen1Val, int gen1Weight) {
    this.gen4Val = gen4Val;
    this.gen4Weight = gen4Weight;
    this.gen3Val = gen3Val;
    this.gen3Weight = gen3Weight;
    this.gen2Val = gen2Val;
    this.gen2Weight = gen2Weight;
    this.gen1Val = gen1Val;
    this.gen1Weight = gen1Weight;
  }

  HashGenSetBucket(V value) {
    this(null, 0, null, 0, null, 0, value, 1);
  }

  HashGenSetBucket() {
    this(null, 0, null, 0, null, 0, null, 0);
  }
}
