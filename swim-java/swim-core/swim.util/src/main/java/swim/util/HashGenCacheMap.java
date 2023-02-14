// Copyright 2015-2022 Swim.inc
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

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.lang.ref.Reference;
import java.lang.ref.SoftReference;
import java.lang.ref.WeakReference;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A hashed generational cache map discards the least recently used value
 * with the worst hit rate per hash bucket. HashGenCacheMap is a concurrent
 * and lock-free LRFU cache, with O(1) access time.
 * <p>
 * Maintaining four "generations" of cached values per hash bucket, the cache
 * discards from the younger generations based on least recent usage, and
 * promotes younger generations to older generations based on most frequent
 * usage. Cache misses count as negative usage of the older generations,
 * biasing the cache against least recently used values with poor hit rates.
 * <p>
 * The cache soft references the older generations, and weak references the
 * younger generations; the garbage collector can reclaim the entire cache,
 * but will preferentially wipe the younger cache generations before the older
 * cache generations.
 */
@Public
@Since("5.0")
public class HashGenCacheMap<K, V> {

  final HashGenCacheMapBucket<K, V>[] buckets;
  volatile long gen4Hits;
  volatile long gen3Hits;
  volatile long gen2Hits;
  volatile long gen1Hits;
  volatile long misses;

  public HashGenCacheMap(int size) {
    this.buckets = Assume.conforms(new HashGenCacheMapBucket<?, ?>[size]);
    this.gen4Hits = 0L;
    this.gen3Hits = 0L;
    this.gen2Hits = 0L;
    this.gen1Hits = 0L;
    this.misses = 0L;
  }

  public @Nullable V get(K key) {
    final HashGenCacheMapBucket<K, V>[] buckets = this.buckets;
    if (buckets.length == 0) {
      return null;
    }

    final int index = Math.abs(key.hashCode() % buckets.length);
    HashGenCacheMapBucket<K, V> bucket = (HashGenCacheMapBucket<K, V>) BUCKET.getAcquire(buckets, index);
    if (bucket == null) {
      return null;
    }

    final K gen4Key = bucket.gen4KeyRef.get();
    if (gen4Key != null && key.equals(gen4Key)) {
      final V gen4Val = bucket.gen4ValRef.get();
      if (gen4Val != null) {
        GEN4_HITS.getAndAddRelease(this, 1);
        GEN4_WEIGHT.getAndAddRelease(bucket, 1);
        return gen4Val;
      } else {
        bucket.gen4KeyRef.clear();
      }
    }

    final K gen3Key = bucket.gen3KeyRef.get();
    if (gen3Key != null && key.equals(gen3Key)) {
      final V gen3Val = bucket.gen3ValRef.get();
      if (gen3Val != null) {
        GEN3_HITS.getAndAddRelease(this, 1);
        if ((int) GEN3_WEIGHT.getAndAddAcquire(bucket, 1) >= (int) GEN4_WEIGHT.getOpaque(bucket)) {
          bucket = new HashGenCacheMapBucket<K, V>(bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                                   bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                                   bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                                   bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket));
          BUCKET.setRelease(buckets, index, bucket);
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
        GEN2_HITS.getAndAddRelease(this, 1);
        if ((int) GEN2_WEIGHT.getAndAddAcquire(bucket, 1) >= (int) GEN3_WEIGHT.getOpaque(bucket)) {
          bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                                   bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                                   bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                                   bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket));
          BUCKET.setRelease(buckets, index, bucket);
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
        GEN1_HITS.getAndAddRelease(this, 1);
        if ((int) GEN1_WEIGHT.getAndAddAcquire(bucket, 1) >= (int) GEN2_WEIGHT.getOpaque(bucket)) {
          bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                                   bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                                   bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                                   bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket));
          BUCKET.setRelease(buckets, index, bucket);
        }
        return gen1Val;
      } else {
        bucket.gen1KeyRef.clear();
      }
    }

    MISSES.getAndAddRelease(this, 1);
    return null;
  }

  public V put(K key, V value) {
    final HashGenCacheMapBucket<K, V>[] buckets = this.buckets;
    if (buckets.length == 0) {
      return value;
    }

    final int index = Math.abs(key.hashCode() % buckets.length);
    HashGenCacheMapBucket<K, V> bucket = (HashGenCacheMapBucket<K, V>) BUCKET.getAcquire(buckets, index);
    if (bucket == null) {
      bucket = new HashGenCacheMapBucket<K, V>();
    }

    K gen4Key = bucket.gen4KeyRef.get();
    if (gen4Key != null && key.equals(gen4Key)) {
      final V gen4Val = bucket.gen4ValRef.get();
      if (gen4Val != null) {
        GEN4_HITS.getAndAddRelease(this, 1);
        GEN4_WEIGHT.getAndAddRelease(bucket, 1);
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
        GEN3_HITS.getAndAddRelease(this, 1);
        if ((int) GEN3_WEIGHT.getAndAddAcquire(bucket, 1) >= (int) GEN4_WEIGHT.getOpaque(bucket)) {
          bucket = new HashGenCacheMapBucket<K, V>(bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                                   bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                                   bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                                   bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket));
          BUCKET.setRelease(buckets, index, bucket);
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
        GEN2_HITS.getAndAddRelease(this, 1);
        if ((int) GEN2_WEIGHT.getAndAddAcquire(bucket, 1) >= (int) GEN3_WEIGHT.getOpaque(bucket)) {
          bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                                   bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                                   bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                                   bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket));
          BUCKET.setRelease(buckets, index, bucket);
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
        GEN1_HITS.getAndAddRelease(this, 1);
        if ((int) GEN1_WEIGHT.getAndAddAcquire(bucket, 1) >= (int) GEN2_WEIGHT.getOpaque(bucket)) {
          bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                                   bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                                   bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                                   bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket));
          BUCKET.setRelease(buckets, index, bucket);
        }
        return gen1Val;
      } else {
        bucket.gen1KeyRef.clear();
        gen1Key = null;
      }
    }

    MISSES.getAndAddRelease(this, 1);
    if (gen4Key == null) {
      bucket = new HashGenCacheMapBucket<K, V>(bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                               bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                               bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                               new SoftReference<K>(key), new SoftReference<V>(value), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else if (gen3Key == null) {
      bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                               bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                               bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                               new SoftReference<K>(key), new SoftReference<V>(value), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else if (gen2Key == null) {
      bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                               bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                               bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                               new SoftReference<K>(key), new SoftReference<V>(value), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else if (gen1Key == null) {
      bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                               bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                               bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                               new SoftReference<K>(key), new SoftReference<V>(value), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else {
      // Penalize older gens for thrash. Promote gen1 to prevent nacent gens
      // from flip-flopping. If sacrificed gen2 was worth keeping, it likely
      // would have already been promoted.
      bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket) - 1,
                                               bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket) - 1,
                                               bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                               new SoftReference<K>(key), new SoftReference<V>(value), 1);
      BUCKET.setRelease(buckets, index, bucket);
    }

    return value;
  }

  public boolean weaken(K key) {
    final HashGenCacheMapBucket<K, V>[] buckets = this.buckets;
    if (buckets.length == 0) {
      return false;
    }

    final int index = Math.abs(key.hashCode() % buckets.length);
    HashGenCacheMapBucket<K, V> bucket = (HashGenCacheMapBucket<K, V>) BUCKET.getAcquire(buckets, index);
    if (bucket == null) {
      return false;
    }

    K gen4Key = bucket.gen4KeyRef.get();
    if (gen4Key != null && key.equals(gen4Key)) {
      final V gen4Val = bucket.gen4ValRef.get();
      if (gen4Val != null) {
        bucket = new HashGenCacheMapBucket<K, V>(weakRef(bucket.gen4KeyRef), weakRef(bucket.gen4ValRef), (int) GEN4_WEIGHT.getOpaque(bucket),
                                                 bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                                 bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                                 bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket));
        BUCKET.setRelease(buckets, index, bucket);
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
        bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                                 weakRef(bucket.gen3KeyRef), weakRef(bucket.gen3ValRef), (int) GEN3_WEIGHT.getOpaque(bucket),
                                                 bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                                 bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket));
        BUCKET.setRelease(buckets, index, bucket);
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
        bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                                 bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                                 weakRef(bucket.gen2KeyRef), weakRef(bucket.gen2ValRef), (int) GEN2_WEIGHT.getOpaque(bucket),
                                                 bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket));
        BUCKET.setRelease(buckets, index, bucket);
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
        bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                                 bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                                 bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                                 weakRef(bucket.gen1KeyRef), weakRef(bucket.gen1ValRef), (int) GEN1_WEIGHT.getOpaque(bucket));
        BUCKET.setRelease(buckets, index, bucket);
        return true;
      } else {
        bucket.gen1KeyRef.clear();
        gen1Key = null;
      }
    }

    if (gen4Key == null) {
      bucket = new HashGenCacheMapBucket<K, V>(bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                               bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                               bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                               HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else if (gen3Key == null) {
      bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                               bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                               bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                               HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else if (gen2Key == null) {
      bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                               bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                               bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                               HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else if (gen1Key == null) {
      bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                               bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                               bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                               HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 1);
      BUCKET.setRelease(buckets, index, bucket);
    }

    return false;
  }

  public @Nullable V remove(K key) {
    final HashGenCacheMapBucket<K, V>[] buckets = this.buckets;
    if (buckets.length == 0) {
      return null;
    }

    final int index = Math.abs(key.hashCode() % buckets.length);
    HashGenCacheMapBucket<K, V> bucket = (HashGenCacheMapBucket<K, V>) BUCKET.getAcquire(buckets, index);
    if (bucket == null) {
      return null;
    }

    final K gen4Key = bucket.gen4KeyRef.get();
    if (gen4Key != null && key.equals(gen4Key)) {
      final V gen4Val = bucket.gen4ValRef.get();
      bucket = new HashGenCacheMapBucket<K, V>(bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                               bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                               bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                               HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 0);
      BUCKET.setRelease(buckets, index, bucket);
      return gen4Val;
    }

    final K gen3Key = bucket.gen3KeyRef.get();
    if (gen3Key != null && key.equals(gen3Key)) {
      final V gen3Val = bucket.gen3ValRef.get();
      bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                               bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                               bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                               HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 0);
      BUCKET.setRelease(buckets, index, bucket);
      return gen3Val;
    }

    final K gen2Key = bucket.gen2KeyRef.get();
    if (gen2Key != null && key.equals(gen2Key)) {
      final V gen2Val = bucket.gen2ValRef.get();
      bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                               bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                               bucket.gen1KeyRef, bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                               HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 0);
      BUCKET.setRelease(buckets, index, bucket);
      return gen2Val;
    }

    final K gen1Key = bucket.gen1KeyRef.get();
    if (gen1Key != null && key.equals(gen1Key)) {
      final V gen1Val = bucket.gen1ValRef.get();
      bucket = new HashGenCacheMapBucket<K, V>(bucket.gen4KeyRef, bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                               bucket.gen3KeyRef, bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                               bucket.gen2KeyRef, bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                               HashGenCacheMap.<K>nullRef(), HashGenCacheMap.<V>nullRef(), 0);
      BUCKET.setRelease(buckets, index, bucket);
      return gen1Val;
    }

    return null;
  }

  public void clear() {
    final HashGenCacheMapBucket<K, V>[] buckets = this.buckets;
    for (int i = 0; i < buckets.length; i += 1) {
      BUCKET.setRelease(buckets, i, null);
    }
  }

  public double hitRatio() {
    final double hits = (double) GEN4_HITS.getOpaque(this)
                      + (double) GEN3_HITS.getOpaque(this)
                      + (double) GEN2_HITS.getOpaque(this)
                      + (double) GEN1_HITS.getOpaque(this);
    final double misses = (double) MISSES.getOpaque(this);
    return hits / (hits + misses);
  }

  /**
   * {@code VarHandle} for atomically accessing elements of a
   * {@link HashGenCacheMapBucket} array.
   */
  static final VarHandle BUCKET;

  /**
   * {@code VarHandle} for atomically accessing the {@link HashGenCacheMapBucket#gen4Weight} field.
   */
  static final VarHandle GEN4_WEIGHT;

  /**
   * {@code VarHandle} for atomically accessing the {@link HashGenCacheMapBucket#gen3Weight} field.
   */
  static final VarHandle GEN3_WEIGHT;

  /**
   * {@code VarHandle} for atomically accessing the {@link HashGenCacheMapBucket#gen2Weight} field.
   */
  static final VarHandle GEN2_WEIGHT;

  /**
   * {@code VarHandle} for atomically accessing the {@link HashGenCacheMapBucket#gen1Weight} field.
   */
  static final VarHandle GEN1_WEIGHT;

  /**
   * {@code VarHandle} for atomically accessing the {@link #gen4Hits} field.
   */
  static final VarHandle GEN4_HITS;

  /**
   * {@code VarHandle} for atomically accessing the {@link #gen3Hits} field.
   */
  static final VarHandle GEN3_HITS;

  /**
   * {@code VarHandle} for atomically accessing the {@link #gen2Hits} field.
   */
  static final VarHandle GEN2_HITS;

  /**
   * {@code VarHandle} for atomically accessing the {@link #gen1Hits} field.
   */
  static final VarHandle GEN1_HITS;

  /**
   * {@code VarHandle} for atomically accessing the {@link #misses} field.
   */
  static final VarHandle MISSES;

  static final SoftReference<Object> NULL_REF = new SoftReference<Object>(null);

  static final <T> SoftReference<T> nullRef() {
    return Assume.conforms(NULL_REF);
  }

  static final <T> WeakReference<T> weakRef(Reference<T> ref) {
    if (ref instanceof WeakReference<?>) {
      return (WeakReference<T>) ref;
    } else {
      return new WeakReference<T>(ref.get());
    }
  }

  static {
    // Initialize var handles.
    BUCKET = MethodHandles.arrayElementVarHandle(HashGenCacheMapBucket.class.arrayType());
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      GEN4_WEIGHT = lookup.findVarHandle(HashGenCacheMapBucket.class, "gen4Weight", Integer.TYPE);
      GEN3_WEIGHT = lookup.findVarHandle(HashGenCacheMapBucket.class, "gen3Weight", Integer.TYPE);
      GEN2_WEIGHT = lookup.findVarHandle(HashGenCacheMapBucket.class, "gen2Weight", Integer.TYPE);
      GEN1_WEIGHT = lookup.findVarHandle(HashGenCacheMapBucket.class, "gen1Weight", Integer.TYPE);
      GEN4_HITS = lookup.findVarHandle(HashGenCacheMap.class, "gen4Hits", Long.TYPE);
      GEN3_HITS = lookup.findVarHandle(HashGenCacheMap.class, "gen3Hits", Long.TYPE);
      GEN2_HITS = lookup.findVarHandle(HashGenCacheMap.class, "gen2Hits", Long.TYPE);
      GEN1_HITS = lookup.findVarHandle(HashGenCacheMap.class, "gen1Hits", Long.TYPE);
      MISSES = lookup.findVarHandle(HashGenCacheMap.class, "misses", Long.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

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
