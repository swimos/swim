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
 * A hashed generational cache set discards the least recently used value
 * with the worst hit rate per hash bucket.  HashGenCacheSet is a concurrent
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
public class HashGenCacheSet<T> {
  final AtomicReferenceArray<HashGenCacheSetBucket<T>> buckets;
  volatile int gen4Hits;
  volatile int gen3Hits;
  volatile int gen2Hits;
  volatile int gen1Hits;
  volatile int misses;

  public HashGenCacheSet(int size) {
    this.buckets = new AtomicReferenceArray<HashGenCacheSetBucket<T>>(size);
  }

  public T put(T value) {
    if (this.buckets.length() == 0) {
      return value;
    }
    final int index = Math.abs(value.hashCode()) % this.buckets.length();
    HashGenCacheSetBucket<T> bucket = this.buckets.get(index);
    if (bucket == null) {
      bucket = new HashGenCacheSetBucket<T>();
    }

    final T gen4Val = bucket.gen4ValRef.get();
    if (gen4Val != null && value.equals(gen4Val)) {
      GEN4_HITS.incrementAndGet(this);
      BUCKET_GEN4_WEIGHT.incrementAndGet(bucket);
      return gen4Val;
    }

    final T gen3Val = bucket.gen3ValRef.get();
    if (gen3Val != null && value.equals(gen3Val)) {
      GEN3_HITS.incrementAndGet(this);
      if (BUCKET_GEN3_WEIGHT.incrementAndGet(bucket) > bucket.gen4Weight) {
        this.buckets.set(index, new HashGenCacheSetBucket<T>(
                         bucket.gen3ValRef, bucket.gen3Weight,
                         bucket.gen4ValRef, bucket.gen4Weight,
                         bucket.gen2ValRef, bucket.gen2Weight,
                         bucket.gen1ValRef, bucket.gen1Weight));
      }
      return gen3Val;
    }

    final T gen2Val = bucket.gen2ValRef.get();
    if (gen2Val != null && value.equals(gen2Val)) {
      GEN2_HITS.incrementAndGet(this);
      if (BUCKET_GEN2_WEIGHT.incrementAndGet(bucket) > bucket.gen3Weight) {
        this.buckets.set(index, new HashGenCacheSetBucket<T>(
                         bucket.gen4ValRef, bucket.gen4Weight,
                         bucket.gen2ValRef, bucket.gen2Weight,
                         bucket.gen3ValRef, bucket.gen3Weight,
                         bucket.gen1ValRef, bucket.gen1Weight));
      }
      return gen2Val;
    }

    final T gen1Val = bucket.gen1ValRef.get();
    if (gen1Val != null && value.equals(gen1Val)) {
      GEN1_HITS.incrementAndGet(this);
      if (BUCKET_GEN1_WEIGHT.incrementAndGet(bucket) > bucket.gen2Weight) {
        this.buckets.set(index, new HashGenCacheSetBucket<T>(
                         bucket.gen4ValRef, bucket.gen4Weight,
                         bucket.gen3ValRef, bucket.gen3Weight,
                         bucket.gen1ValRef, bucket.gen1Weight,
                         bucket.gen2ValRef, bucket.gen2Weight));
      }
      return gen1Val;
    }

    MISSES.incrementAndGet(this);
    if (gen4Val == null) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1ValRef, bucket.gen1Weight,
                       new SoftReference<T>(value), 1));
    } else if (gen3Val == null) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1ValRef, bucket.gen1Weight,
                       new SoftReference<T>(value), 1));
    } else if (gen2Val == null) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen1ValRef, bucket.gen1Weight,
                       new SoftReference<T>(value), 1));
    } else if (gen1Val == null) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2ValRef, bucket.gen2Weight,
                       new SoftReference<T>(value), 1));
    } else {
      // Penalize older gens for thrash. Promote gen1 to prevent nacent gens
      // from flip-flopping. If sacrificed gen2 was worth keeping, it likely
      // would have already been promoted.
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen4ValRef, bucket.gen4Weight - 1,
                       bucket.gen3ValRef, bucket.gen3Weight - 1,
                       bucket.gen1ValRef, bucket.gen1Weight,
                       new SoftReference<T>(value), 1));
    }

    return value;
  }

  public boolean weaken(T value) {
    if (this.buckets.length() == 0) {
      return false;
    }
    final int index = Math.abs(value.hashCode()) % this.buckets.length();
    final HashGenCacheSetBucket<T> bucket = this.buckets.get(index);
    if (bucket == null) {
      return false;
    }

    final T gen4Val = bucket.gen4ValRef.get();
    if (gen4Val != null && value.equals(gen4Val)) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       weakRef(bucket.gen4ValRef), bucket.gen4Weight,
                       bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1ValRef, bucket.gen1Weight));
      return true;
    }

    final T gen3Val = bucket.gen3ValRef.get();
    if (gen3Val != null && value.equals(gen3Val)) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen4ValRef, bucket.gen4Weight,
                       weakRef(bucket.gen3ValRef), bucket.gen3Weight,
                       bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1ValRef, bucket.gen1Weight));
      return true;
    }

    final T gen2Val = bucket.gen2ValRef.get();
    if (gen2Val != null && value.equals(gen2Val)) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3ValRef, bucket.gen3Weight,
                       weakRef(bucket.gen2ValRef), bucket.gen2Weight,
                       bucket.gen1ValRef, bucket.gen1Weight));
      return true;
    }

    final T gen1Val = bucket.gen1ValRef.get();
    if (gen1Val != null && value.equals(gen1Val)) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2ValRef, bucket.gen2Weight,
                       weakRef(bucket.gen1ValRef), bucket.gen1Weight));
      return true;
    }

    if (gen4Val == null) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1ValRef, bucket.gen1Weight,
                       HashGenCacheSet.<T>nullRef(), 1));
    } else if (gen3Val == null) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1ValRef, bucket.gen1Weight,
                       HashGenCacheSet.<T>nullRef(), 1));
    } else if (gen2Val == null) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen1ValRef, bucket.gen1Weight,
                       HashGenCacheSet.<T>nullRef(), 1));
    } else if (gen1Val == null) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2ValRef, bucket.gen2Weight,
                       HashGenCacheSet.<T>nullRef(), 1));
    }

    return false;
  }

  public boolean remove(T value) {
    if (this.buckets.length() == 0) {
      return false;
    }
    final int index = Math.abs(value.hashCode()) % this.buckets.length();
    final HashGenCacheSetBucket<T> bucket = this.buckets.get(index);
    if (bucket == null) {
      return false;
    }

    final T gen4Val = bucket.gen4ValRef.get();
    if (gen4Val != null && value.equals(gen4Val)) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1ValRef, bucket.gen1Weight,
                       HashGenCacheSet.<T>nullRef(), 0));
      return true;
    }

    final T gen3Val = bucket.gen3ValRef.get();
    if (gen3Val != null && value.equals(gen3Val)) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen2ValRef, bucket.gen2Weight,
                       bucket.gen1ValRef, bucket.gen1Weight,
                       HashGenCacheSet.<T>nullRef(), 0));
      return true;
    }

    final T gen2Val = bucket.gen2ValRef.get();
    if (gen2Val != null && value.equals(gen2Val)) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen1ValRef, bucket.gen1Weight,
                       HashGenCacheSet.<T>nullRef(), 0));
      return true;
    }

    final T gen1Val = bucket.gen1ValRef.get();
    if (gen1Val != null && value.equals(gen1Val)) {
      this.buckets.set(index, new HashGenCacheSetBucket<T>(
                       bucket.gen4ValRef, bucket.gen4Weight,
                       bucket.gen3ValRef, bucket.gen3Weight,
                       bucket.gen2ValRef, bucket.gen2Weight,
                       HashGenCacheSet.<T>nullRef(), 0));
      return true;
    }

    return false;
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
  static final AtomicIntegerFieldUpdater<HashGenCacheSetBucket<?>> BUCKET_GEN4_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheSetBucket<?>>) (Class<?>) HashGenCacheSetBucket.class, "gen4Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheSetBucket<?>> BUCKET_GEN3_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheSetBucket<?>>) (Class<?>) HashGenCacheSetBucket.class, "gen3Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheSetBucket<?>> BUCKET_GEN2_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheSetBucket<?>>) (Class<?>) HashGenCacheSetBucket.class, "gen2Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheSetBucket<?>> BUCKET_GEN1_WEIGHT =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheSetBucket<?>>) (Class<?>) HashGenCacheSetBucket.class, "gen1Weight");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheSet<?>> GEN4_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheSet<?>>) (Class<?>) HashGenCacheSet.class, "gen4Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheSet<?>> GEN3_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheSet<?>>) (Class<?>) HashGenCacheSet.class, "gen3Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheSet<?>> GEN2_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheSet<?>>) (Class<?>) HashGenCacheSet.class, "gen2Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheSet<?>> GEN1_HITS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheSet<?>>) (Class<?>) HashGenCacheSet.class, "gen1Hits");

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HashGenCacheSet<?>> MISSES =
      AtomicIntegerFieldUpdater.newUpdater((Class<HashGenCacheSet<?>>) (Class<?>) HashGenCacheSet.class, "misses");
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
