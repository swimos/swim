// Based on zlib-1.2.8
// Copyright (c) 1995-2013 Jean-loup Gailly and Mark Adler
// Copyright (c) 2016-2018 Swim.it inc.
//
// This software is provided 'as-is', without any express or implied
// warranty.  In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//    claim that you wrote the original software. If you use this software
//    in a product, an acknowledgment in the product documentation would be
//    appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//    misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

package swim.deflate;

final class Adler32 {
  private Adler32() {
    // stub
  }

  // largest prime smaller than 65536
  static final int BASE = 65521;

  // largest n such that 255n(n+1)/2 + (n+1)(BASE-1) <= 2^32-1
  static final int NMAX = 5552;

  static int adler32(int adler, byte[] buffer, int offset, int length) {
    int sum2;
    int n;

    // split Adler-32 into component sums
    sum2 = (adler >>> 16) & 0xFFFF;
    adler &= 0xFFFF;

    // in case user likes doing a byte at a time, keep it fast
    if (length == 1) {
      adler += buffer[0];
      if (adler >= BASE) {
        adler -= BASE;
      }
      sum2 += adler;
      if (sum2 >= BASE) {
        sum2 -= BASE;
      }
      return adler | (sum2 << 16);
    }

    // initial Adler-32 value (deferred check for length == 1 speed)
    if (buffer == null) {
      return 1;
    }

    // in case short lengths are provided, keep it somewhat fast
    if (length < 16) {
      while (length-- != 0) {
        adler += buffer[offset++]; sum2 += adler;
      }
      if (adler >= BASE) {
        adler -= BASE;
      }
      sum2 %= BASE; // only added so many BASE's
      return adler | (sum2 << 16);
    }

    // do length NMAX blocks -- requires just one modulo operation
    while (length >= NMAX) {
      length -= NMAX;
      n = NMAX / 16; // NMAX is divisible by 16
      do {
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
      } while (--n != 0);
      adler %= BASE;
      sum2 %= BASE;
    }

    // do remaining bytes (less than NMAX, still just one modulo)
    if (length != 0) { // avoid modulos if none remaining
      while (length >= 16) {
        length -= 16;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
        adler += buffer[offset++]; sum2 += adler;
      }
      while (length-- != 0) {
        adler += buffer[offset++]; sum2 += adler;
      }
      adler %= BASE;
      sum2 %= BASE;
    }

    // return recombined sums
    return adler | (sum2 << 16);
  }
}
