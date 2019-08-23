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

package swim.spatial;

import java.util.Comparator;

/**
 * Significant bit interval encoding. Represents power-of-2 sized integer
 * intervals as a (64 - k) bit prefix with a k bit suffix.
 * <p>
 * Leading one bits replace trailing variable suffix bits. For an integer x
 * with k variable suffix bits, shift k high prefix 1 bits into x.
 * <p>
 * The rank of a bit interval is the number of trailing variable bits.
 * The base of a bit interval is the lower bound of the interval.
 * <p>
 * Examples for constant prefix bits x, and variable suffix bits y:
 * <p>
 * range 2^0:<br>
 * significant:  0xxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx<br>
 * bit interval: 0xxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx
 * <p>
 * range 2^1:<br>
 * significand:  0xxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxy<br>
 * bit interval: 10xxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx
 * <p>
 * range 2^2:<br>
 * significand:  0xxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxyy<br>
 * bit interval: 110xxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx
 * <p>
 * range 2^3:<br>
 * significand:  0xxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxyyy<br>
 * bit interval: 1110xxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx
 * <p>
 * range 2^4:<br>
 * significand:  0xxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxyyyy<br>
 * bit interval: 11110xxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx
 * <p>
 * range 2^63<br>
 * significand:  0yyyyyyy yyyyyyyy yyyyyyyy yyyyyyyy yyyyyyyy yyyyyyyy yyyyyyyy yyyyyyyy<br>
 * bit interval: 11111111 11111111 11111111 11111111 11111111 11111111 11111111 11111110
 */
public final class BitInterval {
  private BitInterval() {
    // stub
  }

  public static long from(int rank, long base) {
    return rank < 64 ? ((1L << rank) - 1L) << (64 - rank) | base >>> rank : -1L;
  }

  public static long span(long x0, long x1) {
    x0 &= 0x7fffffffffffffffL; // truncate to 63 bits
    x1 &= 0x7fffffffffffffffL; // truncate to 63 bits
    final int rank = 64 - Long.numberOfLeadingZeros(-1L & x0 & x1 ^ (x0 | x1));
    final long mask = ~((1L << rank) - 1L);
    final long base = (x0 | x1) & mask;
    return from(rank, base);
  }

  public static long union(long a, long b) {
    final int aRank = Long.numberOfLeadingZeros(~a);
    final int bRank = Long.numberOfLeadingZeros(~b);
    final long aBase = aRank < 64 ? a << aRank : 0L;
    final long bBase = bRank < 64 ? b << bRank : 0L;
    final long base = aBase | bBase;
    final long mask = -1L & aBase & bBase ^ base;
    final int rank = Math.max(64 - Long.numberOfLeadingZeros(mask), Math.max(aRank, bRank));
    return from(rank, base);
  }

  public static int rank(long bitInterval) {
    return Long.numberOfLeadingZeros(~bitInterval);
  }

  public static long base(long bitInterval) {
    final int rank = rank(bitInterval);
    return rank < 64 ? bitInterval << rank : 0L;
  }

  public static long mask(long bitInterval) {
    final int rank = rank(bitInterval);
    return rank < 64 ? ~((1L << rank) - 1L) : 0L;
  }

  public static int compare(long a, long b) {
    final int aRank = Long.numberOfLeadingZeros(~a);
    final int bRank = Long.numberOfLeadingZeros(~b);
    long aNorm = aRank < 64 ? a << aRank : 0L;
    long bNorm = bRank < 64 ? b << bRank : 0L;
    if (aRank < bRank) {
      // Clear low bRank bits of aNorm.
      aNorm &= ~((1L << bRank) - 1L);
    } else if (aRank > bRank) {
      // Clear low aRank bits of bNorm.
      bNorm &= ~((1L << aRank) - 1L);
    }
    return aNorm < bNorm ? -1 : aNorm > bNorm ? 1 : 0;
  }

  public static int compare(long xa, long ya, long xb, long yb) {
    int order = compare(xa, xb);
    if (order == 0) {
      order = compare(ya, yb);
    }
    return order;
  }

  public static boolean contains(long q, long a) {
    final int qRank = Long.numberOfLeadingZeros(~q);
    final int aRank = Long.numberOfLeadingZeros(~a);
    final long qBase = qRank < 64 ? q << qRank : 0L;
    final long aBase = aRank < 64 ? a << aRank : 0L;
    final long qMask = qRank < 64 ? ~((1L << qRank) - 1L) : 0L;
    return aRank <= qRank && (aBase & qMask) == qBase;
  }

  public static boolean contains(long xq, long yq, long xa, long ya) {
    return contains(xq, xa) && contains(yq, ya);
  }

  public static boolean intersects(long q, long a) {
    final int qRank = Long.numberOfLeadingZeros(~q);
    final int aRank = Long.numberOfLeadingZeros(~a);
    final long qBase = qRank < 64 ? q << qRank : 0L;
    final long aBase = aRank < 64 ? a << aRank : 0L;
    final long qMask = qRank < 64 ? ~((1L << qRank) - 1L) : 0L;
    final long aMask = aRank < 64 ? ~((1L << aRank) - 1L) : 0L;
    return aRank <= qRank && (aBase & qMask) == qBase
        || qRank <= aRank && (qBase & aMask) == aBase;
  }

  public static boolean intersects(long xq, long yq, long xa, long ya) {
    return intersects(xq, xa) && intersects(yq, ya);
  }

  public static <T> void sort(T[] array, Comparator<? super T> comparator) {
    sort(null, array, 0, array.length, 0, comparator);
  }

  private static <T> void sort(T[] src, T[] dest, int low, int high, int offset, Comparator<? super T> comparator) {
    final int length = high - low;
    if (length < 7) { // insertion sort
      for (int i = low; i < high; i += 1) {
        for (int j = i; j > low && comparator.compare(dest[j - 1], dest[j]) > 0; j -= 1) {
          final T tmp = dest[j];
          dest[j] = dest[j - 1];
          dest[j - 1] = tmp;
        }
      }
    } else { // merge sort
      final int destLow  = low;
      final int destHigh = high;
      low += offset;
      high += offset;
      final int mid = (low + high) >>> 1;
      if (src == null) {
        src = dest.clone();
      }
      sort(dest, src, low, mid, -offset, comparator);
      sort(dest, src, mid, high, -offset, comparator);
      if (comparator.compare(src[mid - 1], src[mid]) <= 0) {
        System.arraycopy(src, low, dest, destLow, length);
      } else {
        for (int i = destLow, p = low, q = mid; i < destHigh; i += 1) {
          if (q >= high || p < mid && comparator.compare(src[p], src[q]) <= 0) {
            dest[i] = src[p];
            p += 1;
          } else {
            dest[i] = src[q];
            q += 1;
          }
        }
      }
    }
  }
}
