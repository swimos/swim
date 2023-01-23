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

package swim.util;

import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicLongFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceArray;

/**
 * A hashed generational map evicts the least recently used value with the
 * worst hit rate per hash bucket. HashGenMap is a concurrent and lock-free
 * LRFU cache, with O(1) access time, that strongly references its values.
 * <p>
 * Maintaining four "generations" of cached values per hash bucket, the cache
 * discards from the younger generations based on least recent usage, and
 * promotes younger generations to older generations based on most frequent
 * usage. Cache misses count as negative usage of the older generations,
 * biasing the cache against least recently used values with poor hit rates.
 * <p>
 * The evict(K, V) method is guaranteed to be called when a value is displaced
 * from the cache.
 */
public class HashGenMap<K, V> {

  final AtomicReferenceArray<HashGenMapBucket<K, V>> buckets;
  volatile long gen4Hits;
  volatile long gen3Hits;
  volatile long gen2Hits;
  volatile long gen1Hits;
  volatile long misses;
  volatile long evicts;

  public HashGenMap(int size) {
    this.buckets = new AtomicReferenceArray<HashGenMapBucket<K, V>>(size);
    this.gen4Hits = 0L;
    this.gen3Hits = 0L;
    this.gen2Hits = 0L;
    this.gen1Hits = 0L;
    this.misses = 0L;
    this.evicts = 0L;
  }

  protected void evict(K key, V value) {
    // hook
  }

  public V get(K key) {
    final AtomicReferenceArray<HashGenMapBucket<K, V>> buckets = this.buckets;
    if (buckets.length() == 0) {
      return null;
    }
    HashGenMapBucket<K, V> oldBucket;
    HashGenMapBucket<K, V> newBucket;
    V cacheVal;
    final int index = Math.abs(key.hashCode()) % buckets.length();
    do {
      oldBucket = buckets.get(index);
      if (oldBucket == null) {
        newBucket = null;
        cacheVal = null;
      } else {
        if (oldBucket.gen4Key != null && key.equals(oldBucket.gen4Key)) {
          HashGenMap.GEN4_HITS.incrementAndGet(this);
          HashGenMapBucket.GEN4_WEIGHT.incrementAndGet(oldBucket);
          newBucket = oldBucket;
          cacheVal = oldBucket.gen4Val;
        } else if (oldBucket.gen3Key != null && key.equals(oldBucket.gen3Key)) {
          HashGenMap.GEN3_HITS.incrementAndGet(this);
          if (HashGenMapBucket.GEN3_WEIGHT.incrementAndGet(oldBucket) > oldBucket.gen4Weight) {
            newBucket = new HashGenMapBucket<K, V>(oldBucket.gen3Key, oldBucket.gen3Val, oldBucket.gen3Weight,
                                                   oldBucket.gen4Key, oldBucket.gen4Val, oldBucket.gen4Weight,
                                                   oldBucket.gen2Key, oldBucket.gen2Val, oldBucket.gen2Weight,
                                                   oldBucket.gen1Key, oldBucket.gen1Val, oldBucket.gen1Weight);
          } else {
            newBucket = oldBucket;
          }
          cacheVal = oldBucket.gen3Val;
        } else if (oldBucket.gen2Key != null && key.equals(oldBucket.gen2Key)) {
          HashGenMap.GEN2_HITS.incrementAndGet(this);
          if (HashGenMapBucket.GEN2_WEIGHT.incrementAndGet(oldBucket) > oldBucket.gen3Weight) {
            newBucket = new HashGenMapBucket<K, V>(oldBucket.gen4Key, oldBucket.gen4Val, oldBucket.gen4Weight,
                                                   oldBucket.gen2Key, oldBucket.gen2Val, oldBucket.gen2Weight,
                                                   oldBucket.gen3Key, oldBucket.gen3Val, oldBucket.gen3Weight,
                                                   oldBucket.gen1Key, oldBucket.gen1Val, oldBucket.gen1Weight);
          } else {
            newBucket = oldBucket;
          }
          cacheVal = oldBucket.gen2Val;
        } else if (oldBucket.gen1Key != null && key.equals(oldBucket.gen1Key)) {
          HashGenMap.GEN1_HITS.incrementAndGet(this);
          if (HashGenMapBucket.GEN1_WEIGHT.incrementAndGet(oldBucket) > oldBucket.gen2Weight) {
            newBucket = new HashGenMapBucket<K, V>(oldBucket.gen4Key, oldBucket.gen4Val, oldBucket.gen4Weight,
                                                   oldBucket.gen3Key, oldBucket.gen3Val, oldBucket.gen3Weight,
                                                   oldBucket.gen1Key, oldBucket.gen1Val, oldBucket.gen1Weight,
                                                   oldBucket.gen2Key, oldBucket.gen2Val, oldBucket.gen2Weight);
          } else {
            newBucket = oldBucket;
          }
          cacheVal = oldBucket.gen1Val;
        } else {
          HashGenMap.MISSES.incrementAndGet(this);
          newBucket = oldBucket;
          cacheVal = null;
        }
      }
    } while (oldBucket != newBucket && !buckets.compareAndSet(index, oldBucket, newBucket));
    return cacheVal;
  }

  public V put(K key, V value) {
    final AtomicReferenceArray<HashGenMapBucket<K, V>> buckets = this.buckets;
    if (buckets.length() == 0) {
      return value;
    }
    HashGenMapBucket<K, V> oldBucket;
    HashGenMapBucket<K, V> newBucket;
    K evictKey = null;
    V evictVal = null;
    V cacheVal;
    final int index = Math.abs(key.hashCode()) % buckets.length();
    do {
      oldBucket = buckets.get(index);
      if (oldBucket == null) {
        newBucket = new HashGenMapBucket<K, V>(key, value);
        cacheVal = value;
      } else {
        if (oldBucket.gen4Key != null && key.equals(oldBucket.gen4Key)) {
          HashGenMap.GEN4_HITS.incrementAndGet(this);
          HashGenMapBucket.GEN4_WEIGHT.incrementAndGet(oldBucket);
          newBucket = oldBucket;
          cacheVal = oldBucket.gen4Val;
        } else if (oldBucket.gen3Key != null && key.equals(oldBucket.gen3Key)) {
          HashGenMap.GEN3_HITS.incrementAndGet(this);
          if (HashGenMapBucket.GEN3_WEIGHT.incrementAndGet(oldBucket) > oldBucket.gen4Weight) {
            newBucket = new HashGenMapBucket<K, V>(oldBucket.gen3Key, oldBucket.gen3Val, oldBucket.gen3Weight,
                                                   oldBucket.gen4Key, oldBucket.gen4Val, oldBucket.gen4Weight,
                                                   oldBucket.gen2Key, oldBucket.gen2Val, oldBucket.gen2Weight,
                                                   oldBucket.gen1Key, oldBucket.gen1Val, oldBucket.gen1Weight);
          } else {
            newBucket = oldBucket;
          }
          cacheVal = oldBucket.gen3Val;
        } else if (oldBucket.gen2Key != null && key.equals(oldBucket.gen2Key)) {
          HashGenMap.GEN2_HITS.incrementAndGet(this);
          if (HashGenMapBucket.GEN2_WEIGHT.incrementAndGet(oldBucket) > oldBucket.gen3Weight) {
            newBucket = new HashGenMapBucket<K, V>(oldBucket.gen4Key, oldBucket.gen4Val, oldBucket.gen4Weight,
                                                   oldBucket.gen2Key, oldBucket.gen2Val, oldBucket.gen2Weight,
                                                   oldBucket.gen3Key, oldBucket.gen3Val, oldBucket.gen3Weight,
                                                   oldBucket.gen1Key, oldBucket.gen1Val, oldBucket.gen1Weight);
          } else {
            newBucket = oldBucket;
          }
          cacheVal = oldBucket.gen2Val;
        } else if (oldBucket.gen1Key != null && key.equals(oldBucket.gen1Key)) {
          HashGenMap.GEN1_HITS.incrementAndGet(this);
          if (HashGenMapBucket.GEN1_WEIGHT.incrementAndGet(oldBucket) > oldBucket.gen2Weight) {
            newBucket = new HashGenMapBucket<K, V>(oldBucket.gen4Key, oldBucket.gen4Val, oldBucket.gen4Weight,
                                                   oldBucket.gen3Key, oldBucket.gen3Val, oldBucket.gen3Weight,
                                                   oldBucket.gen1Key, oldBucket.gen1Val, oldBucket.gen1Weight,
                                                   oldBucket.gen2Key, oldBucket.gen2Val, oldBucket.gen2Weight);
          } else {
            newBucket = oldBucket;
          }
          cacheVal = oldBucket.gen1Val;
        } else {
          HashGenMap.MISSES.incrementAndGet(this);
          evictKey = oldBucket.gen2Key;
          evictVal = oldBucket.gen2Val;
          // Penalize older gens for thrash. Promote gen1 to prevent nacent gens
          // from flip-flopping. If sacrificed gen2 was worth keeping, it likely
          // would have already been promoted.
          newBucket = new HashGenMapBucket<K, V>(oldBucket.gen4Key, oldBucket.gen4Val, oldBucket.gen4Weight - 1,
                                                 oldBucket.gen3Key, oldBucket.gen3Val, oldBucket.gen3Weight - 1,
                                                 oldBucket.gen1Key, oldBucket.gen1Val, oldBucket.gen1Weight,
                                                 key, value, 1);
          cacheVal = value;
        }
      }
    } while (oldBucket != newBucket && !buckets.compareAndSet(index, oldBucket, newBucket));
    if (evictKey != null) {
      HashGenMap.EVICTS.incrementAndGet(this);
      this.evict(evictKey, evictVal);
    }
    return cacheVal;
  }

  public V remove(K key) {
    final AtomicReferenceArray<HashGenMapBucket<K, V>> buckets = this.buckets;
    if (buckets.length() == 0) {
      return null;
    }
    HashGenMapBucket<K, V> oldBucket;
    HashGenMapBucket<K, V> newBucket;
    V cacheVal;
    final int index = Math.abs(key.hashCode()) % buckets.length();
    do {
      oldBucket = buckets.get(index);
      if (oldBucket == null) {
        cacheVal = null;
        newBucket = null;
      } else {
        if (oldBucket.gen4Key != null && key.equals(oldBucket.gen4Key)) {
          cacheVal = oldBucket.gen4Val;
          newBucket = new HashGenMapBucket<K, V>(oldBucket.gen3Key, oldBucket.gen3Val, oldBucket.gen3Weight,
                                                 oldBucket.gen2Key, oldBucket.gen2Val, oldBucket.gen2Weight,
                                                 oldBucket.gen1Key, oldBucket.gen1Val, oldBucket.gen1Weight,
                                                 null, null, 0);
        } else if (oldBucket.gen3Key != null && key.equals(oldBucket.gen3Key)) {
          cacheVal = oldBucket.gen3Val;
          newBucket = new HashGenMapBucket<K, V>(oldBucket.gen4Key, oldBucket.gen4Val, oldBucket.gen4Weight,
                                                 oldBucket.gen2Key, oldBucket.gen2Val, oldBucket.gen2Weight,
                                                 oldBucket.gen1Key, oldBucket.gen1Val, oldBucket.gen1Weight,
                                                 null, null, 0);
        } else if (oldBucket.gen2Key != null && key.equals(oldBucket.gen2Key)) {
          cacheVal = oldBucket.gen2Val;
          newBucket = new HashGenMapBucket<K, V>(oldBucket.gen4Key, oldBucket.gen4Val, oldBucket.gen4Weight,
                                                 oldBucket.gen3Key, oldBucket.gen3Val, oldBucket.gen3Weight,
                                                 oldBucket.gen1Key, oldBucket.gen1Val, oldBucket.gen1Weight,
                                                 null, null, 0);
        } else if (oldBucket.gen1Key != null && key.equals(oldBucket.gen1Key)) {
          cacheVal = oldBucket.gen1Val;
          newBucket = new HashGenMapBucket<K, V>(oldBucket.gen4Key, oldBucket.gen4Val, oldBucket.gen4Weight,
                                                 oldBucket.gen3Key, oldBucket.gen3Val, oldBucket.gen3Weight,
                                                 oldBucket.gen2Key, oldBucket.gen2Val, oldBucket.gen2Weight,
                                                 null, null, 0);
        } else {
          cacheVal = null;
          newBucket = oldBucket;
        }
      }
    } while (oldBucket != newBucket && !buckets.compareAndSet(index, oldBucket, newBucket));
    return cacheVal;
  }

  public void clear() {
    final AtomicReferenceArray<HashGenMapBucket<K, V>> buckets = this.buckets;
    for (int i = 0; i < buckets.length(); i += 1) {
      buckets.set(i, null);
    }
  }

  public double hitRatio() {
    final double hits = (double) HashGenMap.GEN4_HITS.get(this)
                      + (double) HashGenMap.GEN3_HITS.get(this)
                      + (double) HashGenMap.GEN2_HITS.get(this)
                      + (double) HashGenMap.GEN1_HITS.get(this);
    return hits / (hits + (double) HashGenMap.MISSES.get(this));
  }

  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<HashGenMap<?, ?>> GEN4_HITS =
      AtomicLongFieldUpdater.newUpdater((Class<HashGenMap<?, ?>>) (Class<?>) HashGenMap.class, "gen4Hits");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<HashGenMap<?, ?>> GEN3_HITS =
      AtomicLongFieldUpdater.newUpdater((Class<HashGenMap<?, ?>>) (Class<?>) HashGenMap.class, "gen3Hits");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<HashGenMap<?, ?>> GEN2_HITS =
      AtomicLongFieldUpdater.newUpdater((Class<HashGenMap<?, ?>>) (Class<?>) HashGenMap.class, "gen2Hits");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<HashGenMap<?, ?>> GEN1_HITS =
      AtomicLongFieldUpdater.newUpdater((Class<HashGenMap<?, ?>>) (Class<?>) HashGenMap.class, "gen1Hits");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<HashGenMap<?, ?>> MISSES =
      AtomicLongFieldUpdater.newUpdater((Class<HashGenMap<?, ?>>) (Class<?>) HashGenMap.class, "misses");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<HashGenMap<?, ?>> EVICTS =
      AtomicLongFieldUpdater.newUpdater((Class<HashGenMap<?, ?>>) (Class<?>) HashGenMap.class, "evicts");

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

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMapBucket<?, ?>> GEN4_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMapBucket<?, ?>>) (Class<?>) HashGenMapBucket.class, "gen4Weight");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMapBucket<?, ?>> GEN3_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMapBucket<?, ?>>) (Class<?>) HashGenMapBucket.class, "gen3Weight");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMapBucket<?, ?>> GEN2_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMapBucket<?, ?>>) (Class<?>) HashGenMapBucket.class, "gen2Weight");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenMapBucket<?, ?>> GEN1_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenMapBucket<?, ?>>) (Class<?>) HashGenMapBucket.class, "gen1Weight");

}
