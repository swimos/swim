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
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A hashed generational cache set discards the least recently used value
 * with the worst hit rate per hash bucket. HashGenCacheSet is a concurrent
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
public class HashGenCacheSet<T> {

  final HashGenCacheSetBucket<T>[] buckets;
  volatile long gen4Hits;
  volatile long gen3Hits;
  volatile long gen2Hits;
  volatile long gen1Hits;
  volatile long misses;

  public HashGenCacheSet(int size) {
    this.buckets = Assume.conforms(new HashGenCacheSetBucket<?>[size]);
    this.gen4Hits = 0L;
    this.gen3Hits = 0L;
    this.gen2Hits = 0L;
    this.gen1Hits = 0L;
    this.misses = 0L;
  }

  public T put(T value) {
    final HashGenCacheSetBucket<T>[] buckets = this.buckets;
    if (buckets.length == 0) {
      return value;
    }

    final int index = Math.abs(value.hashCode() % buckets.length);
    HashGenCacheSetBucket<T> bucket = (HashGenCacheSetBucket<T>) BUCKET.getAcquire(buckets, index);
    if (bucket == null) {
      bucket = new HashGenCacheSetBucket<T>();
    }

    final T gen4Val = bucket.gen4ValRef.get();
    if (gen4Val != null && value.equals(gen4Val)) {
      GEN4_HITS.getAndAddRelease(this, 1);
      GEN4_WEIGHT.getAndAddRelease(bucket, 1);
      return gen4Val;
    }

    final T gen3Val = bucket.gen3ValRef.get();
    if (gen3Val != null && value.equals(gen3Val)) {
      GEN3_HITS.getAndAddRelease(this, 1);
      if ((int) GEN3_WEIGHT.getAndAddAcquire(bucket, 1) >= (int) GEN4_WEIGHT.getOpaque(bucket)) {
        bucket = new HashGenCacheSetBucket<T>(bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                              bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                              bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                              bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket));
        BUCKET.setRelease(buckets, index, bucket);
      }
      return gen3Val;
    }

    final T gen2Val = bucket.gen2ValRef.get();
    if (gen2Val != null && value.equals(gen2Val)) {
      GEN2_HITS.getAndAddRelease(this, 1);
      if ((int) GEN2_WEIGHT.getAndAddAcquire(bucket, 1) >= (int) GEN3_WEIGHT.getOpaque(bucket)) {
        bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                              bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                              bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                              bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket));
        BUCKET.setRelease(buckets, index, bucket);
      }
      return gen2Val;
    }

    final T gen1Val = bucket.gen1ValRef.get();
    if (gen1Val != null && value.equals(gen1Val)) {
      GEN1_HITS.getAndAddRelease(this, 1);
      if ((int) GEN1_WEIGHT.getAndAddAcquire(bucket, 1) >= (int) GEN2_WEIGHT.getOpaque(bucket)) {
        bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                              bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                              bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                              bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket));
        BUCKET.setRelease(buckets, index, bucket);
      }
      return gen1Val;
    }

    MISSES.getAndAddRelease(this, 1);
    if (gen4Val == null) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                            bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                            bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                            new SoftReference<T>(value), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else if (gen3Val == null) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                            bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                            bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                            new SoftReference<T>(value), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else if (gen2Val == null) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                            bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                            bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                            new SoftReference<T>(value), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else if (gen1Val == null) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                            bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                            bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                            new SoftReference<T>(value), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else {
      // Penalize older gens for thrash. Promote gen1 to prevent nacent gens
      // from flip-flopping. If sacrificed gen2 was worth keeping, it likely
      // would have already been promoted.
      bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket) - 1,
                                            bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket) - 1,
                                            bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                            new SoftReference<T>(value), 1);
      BUCKET.setRelease(buckets, index, bucket);
    }

    return value;
  }

  public boolean weaken(T value) {
    final HashGenCacheSetBucket<T>[] buckets = this.buckets;
    if (buckets.length == 0) {
      return false;
    }

    final int index = Math.abs(value.hashCode() % buckets.length);
    HashGenCacheSetBucket<T> bucket = (HashGenCacheSetBucket<T>) BUCKET.getAcquire(buckets, index);
    if (bucket == null) {
      return false;
    }

    final T gen4Val = bucket.gen4ValRef.get();
    if (gen4Val != null && value.equals(gen4Val)) {
      bucket = new HashGenCacheSetBucket<T>(weakRef(bucket.gen4ValRef), (int) GEN4_WEIGHT.getOpaque(bucket),
                                            bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                            bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                            bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket));
      BUCKET.setRelease(buckets, index, bucket);
      return true;
    }

    final T gen3Val = bucket.gen3ValRef.get();
    if (gen3Val != null && value.equals(gen3Val)) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                            weakRef(bucket.gen3ValRef), (int) GEN3_WEIGHT.getOpaque(bucket),
                                            bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                            bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket));
      BUCKET.setRelease(buckets, index, bucket);
      return true;
    }

    final T gen2Val = bucket.gen2ValRef.get();
    if (gen2Val != null && value.equals(gen2Val)) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                            bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                            weakRef(bucket.gen2ValRef), (int) GEN2_WEIGHT.getOpaque(bucket),
                                            bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket));
      BUCKET.setRelease(buckets, index, bucket);
      return true;
    }

    final T gen1Val = bucket.gen1ValRef.get();
    if (gen1Val != null && value.equals(gen1Val)) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                            bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                            bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                            weakRef(bucket.gen1ValRef), (int) GEN1_WEIGHT.getOpaque(bucket));
      BUCKET.setRelease(buckets, index, bucket);
      return true;
    }

    if (gen4Val == null) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                            bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                            bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                            HashGenCacheSet.<T>nullRef(), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else if (gen3Val == null) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                            bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                            bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                            HashGenCacheSet.<T>nullRef(), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else if (gen2Val == null) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                            bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                            bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                            HashGenCacheSet.<T>nullRef(), 1);
      BUCKET.setRelease(buckets, index, bucket);
    } else if (gen1Val == null) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                            bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                            bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                            HashGenCacheSet.<T>nullRef(), 1);
      BUCKET.setRelease(buckets, index, bucket);
    }

    return false;
  }

  public boolean remove(T value) {
    final HashGenCacheSetBucket<T>[] buckets = this.buckets;
    if (buckets.length == 0) {
      return false;
    }

    final int index = Math.abs(value.hashCode() % buckets.length);
    HashGenCacheSetBucket<T> bucket = (HashGenCacheSetBucket<T>) BUCKET.getAcquire(buckets, index);
    if (bucket == null) {
      return false;
    }

    final T gen4Val = bucket.gen4ValRef.get();
    if (gen4Val != null && value.equals(gen4Val)) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                            bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                            bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                            HashGenCacheSet.<T>nullRef(), 0);
      BUCKET.setRelease(buckets, index, bucket);
      return true;
    }

    final T gen3Val = bucket.gen3ValRef.get();
    if (gen3Val != null && value.equals(gen3Val)) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                            bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                            bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                            HashGenCacheSet.<T>nullRef(), 0);
      BUCKET.setRelease(buckets, index, bucket);
      return true;
    }

    final T gen2Val = bucket.gen2ValRef.get();
    if (gen2Val != null && value.equals(gen2Val)) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                            bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                            bucket.gen1ValRef, (int) GEN1_WEIGHT.getOpaque(bucket),
                                            HashGenCacheSet.<T>nullRef(), 0);
      BUCKET.setRelease(buckets, index, bucket);
      return true;
    }

    final T gen1Val = bucket.gen1ValRef.get();
    if (gen1Val != null && value.equals(gen1Val)) {
      bucket = new HashGenCacheSetBucket<T>(bucket.gen4ValRef, (int) GEN4_WEIGHT.getOpaque(bucket),
                                            bucket.gen3ValRef, (int) GEN3_WEIGHT.getOpaque(bucket),
                                            bucket.gen2ValRef, (int) GEN2_WEIGHT.getOpaque(bucket),
                                            HashGenCacheSet.<T>nullRef(), 0);
      BUCKET.setRelease(buckets, index, bucket);
      return true;
    }

    return false;
  }

  public void clear() {
    final HashGenCacheSetBucket<T>[] buckets = this.buckets;
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
   * {@link HashGenCacheSetBucket} array.
   */
  static final VarHandle BUCKET;

  /**
   * {@code VarHandle} for atomically accessing the {@link HashGenCacheSetBucket#gen4Weight} field.
   */
  static final VarHandle GEN4_WEIGHT;

  /**
   * {@code VarHandle} for atomically accessing the {@link HashGenCacheSetBucket#gen3Weight} field.
   */
  static final VarHandle GEN3_WEIGHT;

  /**
   * {@code VarHandle} for atomically accessing the {@link HashGenCacheSetBucket#gen2Weight} field.
   */
  static final VarHandle GEN2_WEIGHT;

  /**
   * {@code VarHandle} for atomically accessing the {@link HashGenCacheSetBucket#gen1Weight} field.
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
    BUCKET = MethodHandles.arrayElementVarHandle(HashGenCacheSetBucket.class.arrayType());
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      GEN4_WEIGHT = lookup.findVarHandle(HashGenCacheSetBucket.class, "gen4Weight", Integer.TYPE);
      GEN3_WEIGHT = lookup.findVarHandle(HashGenCacheSetBucket.class, "gen3Weight", Integer.TYPE);
      GEN2_WEIGHT = lookup.findVarHandle(HashGenCacheSetBucket.class, "gen2Weight", Integer.TYPE);
      GEN1_WEIGHT = lookup.findVarHandle(HashGenCacheSetBucket.class, "gen1Weight", Integer.TYPE);
      GEN4_HITS = lookup.findVarHandle(HashGenCacheSet.class, "gen4Hits", Long.TYPE);
      GEN3_HITS = lookup.findVarHandle(HashGenCacheSet.class, "gen3Hits", Long.TYPE);
      GEN2_HITS = lookup.findVarHandle(HashGenCacheSet.class, "gen2Hits", Long.TYPE);
      GEN1_HITS = lookup.findVarHandle(HashGenCacheSet.class, "gen1Hits", Long.TYPE);
      MISSES = lookup.findVarHandle(HashGenCacheSet.class, "misses", Long.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}

final class HashGenCacheSetBucket<T> {

  final Reference<T> gen4ValRef;
  final Reference<T> gen3ValRef;
  final Reference<T> gen2ValRef;
  final Reference<T> gen1ValRef;

  volatile int gen4Weight;
  volatile int gen3Weight;
  volatile int gen2Weight;
  volatile int gen1Weight;

  HashGenCacheSetBucket(Reference<T> gen4ValRef, int gen4Weight,
                        Reference<T> gen3ValRef, int gen3Weight,
                        Reference<T> gen2ValRef, int gen2Weight,
                        Reference<T> gen1ValRef, int gen1Weight) {
    this.gen4ValRef = gen4ValRef;
    this.gen4Weight = gen4Weight;
    this.gen3ValRef = gen3ValRef;
    this.gen3Weight = gen3Weight;
    this.gen2ValRef = gen2ValRef;
    this.gen2Weight = gen2Weight;
    this.gen1ValRef = gen1ValRef;
    this.gen1Weight = gen1Weight;
  }

  HashGenCacheSetBucket() {
    this(HashGenCacheSet.<T>nullRef(), 0,
         HashGenCacheSet.<T>nullRef(), 0,
         HashGenCacheSet.<T>nullRef(), 0,
         HashGenCacheSet.<T>nullRef(), 0);
  }

}
