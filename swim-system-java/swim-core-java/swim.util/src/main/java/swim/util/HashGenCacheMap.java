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

import java.lang.ref.Reference;
import java.lang.ref.SoftReference;
import java.lang.ref.WeakReference;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceArray;

/**
 * A hashed generational cache map discards the least recently used value
 * with the worst hit rate per hash bucket.  HashGenCacheMap is a concurrent
 * and lock-free LRFU cache, with O(1) access time.
 *
 * <p>Maintaining four "generations" of cached values per hash bucket, the cache
 * discards from the younger generations based on least recent usage, and
 * promotes younger generations to older generations based on most frequent
 * usage.  Cache misses count as negative usage of the older generations,
 * biasing the cache against least recently used values with poor hit rates.</p>
 *
 * <p>The cache soft references the older generations, and weak references the
 * younger generations; the garbage collector can reclaim the entire cache,
 * but will preferentially wipe the younger cache generations before the older
 * cache generations.</p>
 */
public class HashGenCacheMap<K, V> {
  final AtomicReferenceArray<HashGenCacheMapBucket<K, V>> buckets;
  volatile int gen4Hits;
  volatile int gen3Hits;
  volatile int gen2Hits;
  volatile int gen1Hits;
  volatile int misses;

  public HashGenCacheMap(int size) {
    this.buckets = new AtomicReferenceArray<HashGenCacheMapBucket<K, V>>(size);
  }

  public V get(K key) {
    if (this.buckets.length() == 0) {
      return null;
    }
    final int index = Math.abs(key.hashCode()) % this.buckets.length();
    final HashGenCacheMapBucket<K, V> bucket = this.buckets.get(index);
    if (bucket == null) {
      return null;
    }

    final K gen4Key = bucket.gen4KeyRef.get();
    if (gen4Key != null && key.equals(gen4Key)) {
      final V gen4Val = bucket.gen4ValRef.get();
      if (gen4Val != null) {
        GEN4_HITS.incrementAndGet(this);
        BUCKET_GEN4_WEIGHT.incrementAndGet(bucket);
        return gen4Val;
      } else {
        bucket.gen4KeyRef.clear();
      }
    }

    final K gen3Key = bucket.gen3KeyRef.get();
    if (gen3Key != null && key.equals(gen3Key)) {
      final V gen3Val = bucket.gen3ValRef.get();
      if (gen3Val != null) {
        GEN3_HITS.incrementAndGet(this);
        if (BUCKET_GEN3_WEIGHT.incrementAndGet(bucket) > bucket.gen4Weight) {
          this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                           bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                           bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                           bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                           bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight));
        }
        return gen3Val;
      } else {
        bucket.gen3KeyRef.clear();
      }
    }

    final K gen2Key = bucket.gen2KeyRef.get();
    if (gen2Key != null && key.equals(gen2Key)) {
      final V gen2Val = bucket.gen2ValRef.get();
      if (gen2Val != null) {
        GEN2_HITS.incrementAndGet(this);
        if (BUCKET_GEN2_WEIGHT.incrementAndGet(bucket) > bucket.gen3Weight) {
          this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                           bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                           bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                           bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                           bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight));
        }
        return gen2Val;
      } else {
        bucket.gen2KeyRef.clear();
      }
    }

    final K gen1Key = bucket.gen1KeyRef.get();
    if (gen1Key != null && key.equals(gen1Key)) {
      final V gen1Val = bucket.gen1ValRef.get();
      if (gen1Val != null) {
        GEN1_HITS.incrementAndGet(this);
        if (BUCKET_GEN1_WEIGHT.incrementAndGet(bucket) > bucket.gen2Weight) {
          this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                           bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                           bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                           bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight,
                           bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight));
        }
        return gen1Val;
      } else {
        bucket.gen1KeyRef.clear();
      }
    }

    MISSES.incrementAndGet(this);
    return null;
  }

  public V put(K key, V value) {
    if (this.buckets.length() == 0) {
      return value;
    }
    final int index = Math.abs(key.hashCode()) % this.buckets.length();
    HashGenCacheMapBucket<K, V> bucket = this.buckets.get(index);
    if (bucket == null) {
      bucket = new HashGenCacheMapBucket<K, V>();
    }

    K gen4Key = bucket.gen4KeyRef.get();
    if (gen4Key != null && key.equals(gen4Key)) {
      final V gen4Val = bucket.gen4ValRef.get();
      if (gen4Val != null) {
        GEN4_HITS.incrementAndGet(this);
        BUCKET_GEN4_WEIGHT.incrementAndGet(bucket);
        return gen4Val;
      } else {
        bucket.gen4KeyRef.clear();
        gen4Key = null;
      }
    }

    K gen3Key = bucket.gen3KeyRef.get();
    if (gen3Key != null && key.equals(gen3Key)) {
      final V gen3Val = bucket.gen3ValRef.get();
      if (gen3Val != null) {
        GEN3_HITS.incrementAndGet(this);
        if (BUCKET_GEN3_WEIGHT.incrementAndGet(bucket) > bucket.gen4Weight) {
          this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                           bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                           bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                           bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                           bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight));
        }
        return gen3Val;
      } else {
        bucket.gen3KeyRef.clear();
        gen3Key = null;
      }
    }

    K gen2Key = bucket.gen2KeyRef.get();
    if (gen2Key != null && key.equals(gen2Key)) {
      final V gen2Val = bucket.gen2ValRef.get();
      if (gen2Val != null) {
        GEN2_HITS.incrementAndGet(this);
        if (BUCKET_GEN2_WEIGHT.incrementAndGet(bucket) > bucket.gen3Weight) {
          this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                           bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                           bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                           bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                           bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight));
        }
        return gen2Val;
      } else {
        bucket.gen2KeyRef.clear();
        gen2Key = null;
      }
    }

    K gen1Key = bucket.gen1KeyRef.get();
    if (gen1Key != null && key.equals(gen1Key)) {
      final V gen1Val = bucket.gen1ValRef.get();
      if (gen1Val != null) {
        GEN1_HITS.incrementAndGet(this);
        if (BUCKET_GEN1_WEIGHT.incrementAndGet(bucket) > bucket.gen2Weight) {
          this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                           bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                           bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                           bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight,
                           bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight));
        }
        return gen1Val;
      } else {
        bucket.gen1KeyRef.clear();
        gen1Key = null;
      }
    }

    MISSES.incrementAndGet(this);
    if (gen4Key == null) {
      this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                       bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight,
                       new SoftReference<K>(key), new SoftReference<V>(value), 1));
    } else if (gen3Key == null) {
      this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                       bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight,
                       new SoftReference<K>(key), new SoftReference<V>(value), 1));
    } else if (gen2Key == null) {
      this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                       bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight,
                       new SoftReference<K>(key), new SoftReference<V>(value), 1));
    } else if (gen1Key == null) {
      this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                       bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                       new SoftReference<K>(key), new SoftReference<V>(value), 1));
    } else {
      // Penalize older gens for thrash. Promote gen1 to prevent nacent gens
      // from flip-flopping. If sacrificed gen2 was worth keeping, it likely
      // would have already been promoted.
      this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                       bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight - 1,
                       bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight - 1,
                       bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight,
                       new SoftReference<K>(key), new SoftReference<V>(value), 1));
    }

    return value;
  }

  public boolean weaken(K key) {
    if (this.buckets.length() == 0) {
      return false;
    }
    final int index = Math.abs(key.hashCode()) % this.buckets.length();
    final HashGenCacheMapBucket<K, V> bucket = this.buckets.get(index);
    if (bucket == null) {
      return false;
    }

    K gen4Key = bucket.gen4KeyRef.get();
    if (gen4Key != null && key.equals(gen4Key)) {
      final V gen4Val = bucket.gen4ValRef.get();
      if (gen4Val != null) {
        this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                         weakRef(bucket.gen4KeyRef), weakRef(bucket.gen4ValRef), bucket.gen4Weight,
                         bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                         bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                         bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight));
        return true;
      } else {
        bucket.gen4KeyRef.clear();
        gen4Key = null;
      }
    }

    K gen3Key = bucket.gen3KeyRef.get();
    if (gen3Key != null && key.equals(gen3Key)) {
      final V gen3Val = bucket.gen3ValRef.get();
      if (gen3Val != null) {
        this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                         bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                         weakRef(bucket.gen3KeyRef), weakRef(bucket.gen3ValRef), bucket.gen3Weight,
                         bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                         bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight));
        return true;
      } else {
        bucket.gen3KeyRef.clear();
        gen3Key = null;
      }
    }

    K gen2Key = bucket.gen2KeyRef.get();
    if (gen2Key != null && key.equals(gen2Key)) {
      final V gen2Val = bucket.gen2ValRef.get();
      if (gen2Val != null) {
        this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                         bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                         bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                         weakRef(bucket.gen2KeyRef), weakRef(bucket.gen2ValRef), bucket.gen2Weight,
                         bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight));
        return true;
      } else {
        bucket.gen2KeyRef.clear();
        gen2Key = null;
      }
    }

    K gen1Key = bucket.gen1KeyRef.get();
    if (gen1Key != null && key.equals(gen1Key)) {
      final V gen1Val = bucket.gen1ValRef.get();
      if (gen1Val != null) {
        this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                         bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                         bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                         bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                         weakRef(bucket.gen1KeyRef), weakRef(bucket.gen1ValRef), bucket.gen1Weight));
        return true;
      } else {
        bucket.gen1KeyRef.clear();
        gen1Key = null;
      }
    }

    if (gen4Key == null) {
      this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                       bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight,
                       HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 1));
    } else if (gen3Key == null) {
      this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                       bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight,
                       HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 1));
    } else if (gen2Key == null) {
      this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                       bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight,
                       HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 1));
    } else if (gen1Key == null) {
      this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                       bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                       HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 1));
    }

    return false;
  }

  public V remove(K key) {
    if (this.buckets.length() == 0) {
      return null;
    }
    final int index = Math.abs(key.hashCode()) % this.buckets.length();
    final HashGenCacheMapBucket<K, V> bucket = this.buckets.get(index);
    if (bucket == null) {
      return null;
    }

    final K gen4Key = bucket.gen4KeyRef.get();
    if (gen4Key != null && key.equals(gen4Key)) {
      final V gen4Val = bucket.gen4ValRef.get();
      this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                       bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight,
                       HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 0));
      return gen4Val;
    }

    final K gen3Key = bucket.gen3KeyRef.get();
    if (gen3Key != null && key.equals(gen3Key)) {
      final V gen3Val = bucket.gen3ValRef.get();
      this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                       bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight,
                       HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 0));
      return gen3Val;
    }

    final K gen2Key = bucket.gen2KeyRef.get();
    if (gen2Key != null && key.equals(gen2Key)) {
      final V gen2Val = bucket.gen2ValRef.get();
      this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                       bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen1KeyRef, bucket.gen1ValRef, bucket.gen1Weight,
                       HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 0));
      return gen2Val;
    }

    final K gen1Key = bucket.gen1KeyRef.get();
    if (gen1Key != null && key.equals(gen1Key)) {
      final V gen1Val = bucket.gen1ValRef.get();
      this.buckets.set(index, new HashGenCacheMapBucket<K, V>(
                       bucket.gen4KeyRef, bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3KeyRef, bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2KeyRef, bucket.gen2ValRef, bucket.gen2Weight,
                       HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 0));
      return gen1Val;
    }

    return null;
  }

  public void clear() {
    for (int i = 0; i < this.buckets.length(); i += 1) {
      this.buckets.set(i, null);
    }
  }

  long hits() {
    return (long) this.gen4Hits + (long) this.gen3Hits + (long) this.gen2Hits + (long) this.gen1Hits;
  }

  public double hitRatio() {
    final double hits = (double) hits();
    return hits / (hits + (double) this.misses);
  }

  static final <T> WeakReference<T> weakRef(Reference<T> ref) {
    if (ref instanceof WeakReference<?>) {
      return (WeakReference<T>) ref;
    } else {
      return new WeakReference<T>(ref.get());
    }
  }

  @SuppressWarnings("unchecked")
  static final <T> SoftReference<T> nullRef() {
    return (SoftReference<T>) NULL_REF;
  }

  static final SoftReference<Object> NULL_REF = new SoftReference<Object>(null);

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheMapBucket<?, ?>> BUCKET_GEN4_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheMapBucket<?, ?>>) (Class<?>) HashGenCacheMapBucket.class, "gen4Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheMapBucket<?, ?>> BUCKET_GEN3_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheMapBucket<?, ?>>) (Class<?>) HashGenCacheMapBucket.class, "gen3Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheMapBucket<?, ?>> BUCKET_GEN2_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheMapBucket<?, ?>>) (Class<?>) HashGenCacheMapBucket.class, "gen2Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheMapBucket<?, ?>> BUCKET_GEN1_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheMapBucket<?, ?>>) (Class<?>) HashGenCacheMapBucket.class, "gen1Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheMap<?, ?>> GEN4_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheMap<?, ?>>) (Class<?>) HashGenCacheMap.class, "gen4Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheMap<?, ?>> GEN3_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheMap<?, ?>>) (Class<?>) HashGenCacheMap.class, "gen3Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheMap<?, ?>> GEN2_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheMap<?, ?>>) (Class<?>) HashGenCacheMap.class, "gen2Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheMap<?, ?>> GEN1_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheMap<?, ?>>) (Class<?>) HashGenCacheMap.class, "gen1Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheMap<?, ?>> MISSES =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheMap<?, ?>>) (Class<?>) HashGenCacheMap.class, "misses");
}

final class HashGenCacheMapBucket<K, V> {
  final Reference<K> gen4KeyRef;
  final Reference<V> gen4ValRef;
  final Reference<K> gen3KeyRef;
  final Reference<V> gen3ValRef;
  final Reference<K> gen2KeyRef;
  final Reference<V> gen2ValRef;
  final Reference<K> gen1KeyRef;
  final Reference<V> gen1ValRef;

  volatile int gen4Weight;
  volatile int gen3Weight;
  volatile int gen2Weight;
  volatile int gen1Weight;

  HashGenCacheMapBucket(Reference<K> gen4KeyRef, Reference<V> gen4ValRef, int gen4Weight,
                        Reference<K> gen3KeyRef, Reference<V> gen3ValRef, int gen3Weight,
                        Reference<K> gen2KeyRef, Reference<V> gen2ValRef, int gen2Weight,
                        Reference<K> gen1KeyRef, Reference<V> gen1ValRef, int gen1Weight) {
    this.gen4KeyRef = gen4KeyRef;
    this.gen4ValRef = gen4ValRef;
    this.gen4Weight = gen4Weight;
    this.gen3KeyRef = gen3KeyRef;
    this.gen3ValRef = gen3ValRef;
    this.gen3Weight = gen3Weight;
    this.gen2KeyRef = gen2KeyRef;
    this.gen2ValRef = gen2ValRef;
    this.gen2Weight = gen2Weight;
    this.gen1KeyRef = gen1KeyRef;
    this.gen1ValRef = gen1ValRef;
    this.gen1Weight = gen1Weight;
  }

  HashGenCacheMapBucket() {
    this(HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 0,
         HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 0,
         HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 0,
         HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 0);
  }
}
