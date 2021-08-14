// Copyright 2015-2021 Swim inc.
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
import java.util.concurrent.atomic.AtomicLongFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceArray;

/**
 * A hashed generational set evicts the least recently used value with the
 * worst hit rate per hash bucket. HashGenSet is a concurrent and lock-free
 * LRFU cache, with O(1) access time, that strongly references its values.
 * <p>
 * Maintaining four "generations" of cached values per hash bucket, the cache
 * discards from the younger generations based on least recent usage, and
 * promotes younger generations to older generations based on most frequent
 * usage. Cache misses count as negative usage of the older generations,
 * biasing the cache against least recently used values with poor hit rates.
 * <p>
 * The evict(V) method is guaranteed to be called when a value is displaced
 * from the cache.
 */
public class HashGenSet<V> {

  final AtomicReferenceArray<HashGenSetBucket<V>> buckets;
  volatile long gen4Hits;
  volatile long gen3Hits;
  volatile long gen2Hits;
  volatile long gen1Hits;
  volatile long misses;
  volatile long evicts;

  public HashGenSet(int size) {
    this.buckets = new AtomicReferenceArray<HashGenSetBucket<V>>(size);
    this.gen4Hits = 0L;
    this.gen3Hits = 0L;
    this.gen2Hits = 0L;
    this.gen1Hits = 0L;
    this.misses = 0L;
    this.evicts = 0L;
  }

  protected void evict(V value) {
  }

  public V put(V value) {
    final AtomicReferenceArray<HashGenSetBucket<V>> buckets = this.buckets;
    if (buckets.length() == 0) {
      return value;
    }
    HashGenSetBucket<V> oldBucket;
    HashGenSetBucket<V> newBucket;
    V evictVal = null;
    V cacheVal;
    final int index = Math.abs(value.hashCode()) % buckets.length();
    do {
      oldBucket = buckets.get(index);
      if (oldBucket == null) {
        newBucket = new HashGenSetBucket<V>(value);
        cacheVal = value;
      } else {
        if (oldBucket.gen4Val != null && value.equals(oldBucket.gen4Val)) {
          HashGenSet.GEN4_HITS.incrementAndGet(this);
          HashGenSetBucket.GEN4_WEIGHT.incrementAndGet(oldBucket);
          newBucket = oldBucket;
          cacheVal = oldBucket.gen4Val;
        } else if (oldBucket.gen3Val != null && value.equals(oldBucket.gen3Val)) {
          HashGenSet.GEN3_HITS.incrementAndGet(this);
          if (HashGenSetBucket.GEN3_WEIGHT.incrementAndGet(oldBucket) > oldBucket.gen4Weight) {
            newBucket = new HashGenSetBucket<V>(oldBucket.gen3Val, oldBucket.gen3Weight,
                                                oldBucket.gen4Val, oldBucket.gen4Weight,
                                                oldBucket.gen2Val, oldBucket.gen2Weight,
                                                oldBucket.gen1Val, oldBucket.gen1Weight);
          } else {
            newBucket = oldBucket;
          }
          cacheVal = oldBucket.gen3Val;
        } else if (oldBucket.gen2Val != null && value.equals(oldBucket.gen2Val)) {
          HashGenSet.GEN2_HITS.incrementAndGet(this);
          if (HashGenSetBucket.GEN2_WEIGHT.incrementAndGet(oldBucket) > oldBucket.gen3Weight) {
            newBucket = new HashGenSetBucket<V>(oldBucket.gen4Val, oldBucket.gen4Weight,
                                                oldBucket.gen2Val, oldBucket.gen2Weight,
                                                oldBucket.gen3Val, oldBucket.gen3Weight,
                                                oldBucket.gen1Val, oldBucket.gen1Weight);
          } else {
            newBucket = oldBucket;
          }
          cacheVal = oldBucket.gen2Val;
        } else if (oldBucket.gen1Val != null && value.equals(oldBucket.gen1Val)) {
          HashGenSet.GEN1_HITS.incrementAndGet(this);
          if (HashGenSetBucket.GEN1_WEIGHT.incrementAndGet(oldBucket) > oldBucket.gen2Weight) {
            newBucket = new HashGenSetBucket<V>(oldBucket.gen4Val, oldBucket.gen4Weight,
                                                oldBucket.gen3Val, oldBucket.gen3Weight,
                                                oldBucket.gen1Val, oldBucket.gen1Weight,
                                                oldBucket.gen2Val, oldBucket.gen2Weight);
          } else {
            newBucket = oldBucket;
          }
          cacheVal = oldBucket.gen1Val;
        } else {
          HashGenSet.MISSES.incrementAndGet(this);
          evictVal = oldBucket.gen2Val;
          // Penalize older gens for thrash. Promote gen1 to prevent nacent gens
          // from flip-flopping. If sacrificed gen2 was worth keeping, it likely
          // would have already been promoted.
          newBucket = new HashGenSetBucket<V>(oldBucket.gen4Val, oldBucket.gen4Weight - 1,
                                              oldBucket.gen3Val, oldBucket.gen3Weight - 1,
                                              oldBucket.gen1Val, oldBucket.gen1Weight,
                                              value, 1);
          cacheVal = value;
        }
      }
    } while (oldBucket != newBucket && !buckets.compareAndSet(index, oldBucket, newBucket));
    if (evictVal != null) {
      HashGenSet.EVICTS.incrementAndGet(this);
      this.evict(evictVal);
    }
    return cacheVal;
  }

  public boolean remove(V value) {
    final AtomicReferenceArray<HashGenSetBucket<V>> buckets = this.buckets;
    if (buckets.length() == 0) {
      return false;
    }
    HashGenSetBucket<V> oldBucket;
    HashGenSetBucket<V> newBucket;
    boolean removed;
    final int index = Math.abs(value.hashCode()) % buckets.length();
    do {
      oldBucket = buckets.get(index);
      if (oldBucket == null) {
        newBucket = null;
        removed = false;
      } else {
        if (oldBucket.gen4Val != null && value.equals(oldBucket.gen4Val)) {
          newBucket = new HashGenSetBucket<V>(oldBucket.gen3Val, oldBucket.gen3Weight,
                                              oldBucket.gen2Val, oldBucket.gen2Weight,
                                              oldBucket.gen1Val, oldBucket.gen1Weight,
                                              null, 0);
          removed = true;
        } else if (oldBucket.gen3Val != null && value.equals(oldBucket.gen3Val)) {
          newBucket = new HashGenSetBucket<V>(oldBucket.gen4Val, oldBucket.gen4Weight,
                                              oldBucket.gen2Val, oldBucket.gen2Weight,
                                              oldBucket.gen1Val, oldBucket.gen1Weight,
                                              null, 0);
          removed = true;
        } else if (oldBucket.gen2Val != null && value.equals(oldBucket.gen2Val)) {
          newBucket = new HashGenSetBucket<V>(oldBucket.gen4Val, oldBucket.gen4Weight,
                                              oldBucket.gen3Val, oldBucket.gen3Weight,
                                              oldBucket.gen1Val, oldBucket.gen1Weight,
                                              null, 0);
          removed = true;
        } else if (oldBucket.gen1Val != null && value.equals(oldBucket.gen1Val)) {
          newBucket = new HashGenSetBucket<V>(oldBucket.gen4Val, oldBucket.gen4Weight,
                                              oldBucket.gen3Val, oldBucket.gen3Weight,
                                              oldBucket.gen2Val, oldBucket.gen2Weight,
                                              null, 0);
          removed = true;
        } else {
          newBucket = oldBucket;
          removed = false;
        }
      }
    } while (oldBucket != newBucket && !buckets.compareAndSet(index, oldBucket, newBucket));
    return removed;
  }

  public void clear() {
    final AtomicReferenceArray<HashGenSetBucket<V>> buckets = this.buckets;
    for (int i = 0; i < buckets.length(); i += 1) {
      buckets.set(i, null);
    }
  }

  public double hitRatio() {
    final double hits = (double) HashGenSet.GEN4_HITS.get(this)
                      + (double) HashGenSet.GEN3_HITS.get(this)
                      + (double) HashGenSet.GEN2_HITS.get(this)
                      + (double) HashGenSet.GEN1_HITS.get(this);
    return hits / (hits + (double) HashGenSet.MISSES.get(this));
  }

  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<HashGenSet<?>> GEN4_HITS =
      AtomicLongFieldUpdater.newUpdater((Class<HashGenSet<?>>) (Class<?>) HashGenSet.class, "gen4Hits");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<HashGenSet<?>> GEN3_HITS =
      AtomicLongFieldUpdater.newUpdater((Class<HashGenSet<?>>) (Class<?>) HashGenSet.class, "gen3Hits");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<HashGenSet<?>> GEN2_HITS =
      AtomicLongFieldUpdater.newUpdater((Class<HashGenSet<?>>) (Class<?>) HashGenSet.class, "gen2Hits");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<HashGenSet<?>> GEN1_HITS =
      AtomicLongFieldUpdater.newUpdater((Class<HashGenSet<?>>) (Class<?>) HashGenSet.class, "gen1Hits");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<HashGenSet<?>> MISSES =
      AtomicLongFieldUpdater.newUpdater((Class<HashGenSet<?>>) (Class<?>) HashGenSet.class, "misses");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<HashGenSet<?>> EVICTS =
      AtomicLongFieldUpdater.newUpdater((Class<HashGenSet<?>>) (Class<?>) HashGenSet.class, "evicts");

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

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSetBucket<?>> GEN4_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSetBucket<?>>) (Class<?>) HashGenSetBucket.class, "gen4Weight");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSetBucket<?>> GEN3_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSetBucket<?>>) (Class<?>) HashGenSetBucket.class, "gen3Weight");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSetBucket<?>> GEN2_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSetBucket<?>>) (Class<?>) HashGenSetBucket.class, "gen2Weight");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenSetBucket<?>> GEN1_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenSetBucket<?>>) (Class<?>) HashGenSetBucket.class, "gen1Weight");

}
