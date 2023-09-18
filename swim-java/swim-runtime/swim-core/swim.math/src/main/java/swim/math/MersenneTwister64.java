// Copyright 2015-2023 Nstream, inc.
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

package swim.math;

public class MersenneTwister64 extends Random {

  final long[] state;
  int index;

  public MersenneTwister64(long seed) {
    this.state = new long[312];
    this.index = 0;
    this.state[0] = seed;
    for (int i = 1; i < 312; i += 1) {
      this.state[i] = 6364136223846793005L * (this.state[i - 1] ^ this.state[i - 1] >>> 62) + (long) i;
    }
  }

  public MersenneTwister64(long[] key) {
    this(19650218L);
    int i = 1;
    int j = 0;
    int k = Math.max(312, key.length);
    while (k != 0) {
      this.state[i] = (this.state[i] ^ ((this.state[i - 1] ^ this.state[i - 1] >>> 62) * 3935559000370003845L)) + key[j] + (long) j;
      i += 1;
      j += 1;
      if (i > 311) {
        this.state[0] = this.state[311];
        i = 1;
      }
      if (j >= key.length) {
        j = 0;
      }
      k -= 1;
    }
    k = 311;
    while (k != 0) {
      this.state[i] = (this.state[i] ^ ((this.state[i - 1] ^ this.state[i - 1] >>> 62) * 2862933555777941757L)) - (long) i;
      i += 1;
      if (i > 311) {
        this.state[0] = this.state[311];
        i = 1;
      }
      k -= 1;
    }
    this.state[0] = 1L << 63;
  }

  public MersenneTwister64() {
    this(System.currentTimeMillis());
  }

  void generate() {
    final long[] state = this.state;
    long x = 0L;
    int i = 0;
    while (i < 156) {
      x = state[i] & 0xffffffff80000000L | state[i + 1] & 0x000000007fffffffL;
      state[i] = state[i + 156] ^ x >>> 1 ^ ((x & 1L) == 0L ? 0L : 0xb5026f5aa96619e9L);
      i += 1;
    }
    while (i < 311) {
      x = state[i] & 0xffffffff80000000L | state[i + 1] & 0x000000007fffffffL;
      state[i] = state[i - 156] ^ x >>> 1 ^ ((x & 1L) == 0L ? 0L : 0xb5026f5aa96619e9L);
      i += 1;
    }
    x = state[311] & 0xffffffff80000000L | state[0] & 0x000000007fffffffL;
    state[311] = state[155] ^ x >>> 1 ^ ((x & 1L) == 0L ? 0L : 0xb5026f5aa96619e9L);
  }

  long next() {
    if (this.index >= 312) {
      this.generate();
      this.index = 0;
    }

    long x = this.state[this.index];
    x ^= x >>> 29 & 0x5555555555555555L;
    x ^= x << 17 & 0x71d67fffeda60000L;
    x ^= x << 37 & 0xfff7eee000000000L;
    x ^= x >>> 43;

    this.index += 1;
    return x;
  }

  @Override
  public byte nextByte() {
    return (byte) this.next();
  }

  @Override
  public short nextShort() {
    return (short) this.next();
  }

  @Override
  public int nextInt() {
    return (int) this.next();
  }

  @Override
  public long nextLong() {
    return this.next();
  }

  @Override
  public float nextFloat() {
    return (float) (this.nextInt() >>> 8) / (float) (1 << 24);
  }

  @Override
  public double nextDouble() {
    return (double) (this.nextLong() >>> 11) / (double) (1L << 53);
  }

  @Override
  public boolean nextBoolean() {
    return (this.next() >>> 63) != 0;
  }

}
