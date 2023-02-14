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

import java.nio.ByteOrder;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * 32-bit <a href="https://en.wikipedia.org/wiki/MurmurHash">MurmurHash</a>
 * algorithm, version 3.
 */
@Public
@Since("5.0")
public final class Murmur3 {

  private Murmur3() {
    // static
  }

  /**
   * Returns the hash code of the name of the class.
   */
  public static int seed(Class<?> clazz) {
    return Murmur3.seed(clazz.getName());
  }

  /**
   * Returns the hash code of the given {@code string}.
   */
  public static int seed(String string) {
    return Murmur3.mash(Murmur3.mixString(0, string));
  }

  /**
   * Returns the hash code of the primitive {@code byte value}.
   */
  public static int hash(byte value) {
    return (int) value;
  }

  /**
   * Returns the hash code of the primitive {@code short value}.
   */
  public static int hash(short value) {
    return (int) value;
  }

  /**
   * Returns the hash code of the primitive {@code int value}.
   */
  public static int hash(int value) {
    return value;
  }

  /**
   * Returns the hash code of the primitive {@code long value}.
   */
  public static int hash(long value) {
    return (int) value ^ ((int) (value >>> 32) + (int) (value >>> 63));
  }

  /**
   * Returns the hash code of the primitive {@code float value}.
   */
  public static int hash(float value) {
    if (value == (float) (int) value) {
      return (int) value;
    } else if (value == (float) (long) value) {
      return Murmur3.hash((long) value);
    } else {
      return Float.floatToIntBits(value);
    }
  }

  /**
   * Returns the hash code of the primitive {@code double value}.
   */
  public static int hash(double value) {
    if (value == (double) (int) value) {
      return (int) value;
    } else if (value == (double) (long) value) {
      return Murmur3.hash((long) value);
    } else if (value == (double) (float) value) {
      return Float.floatToIntBits((float) value);
    } else {
      final long y = Double.doubleToLongBits(value);
      return (int) y ^ (int) (y >>> 32);
    }
  }

  /**
   * Returns the hash code of the primitive {@code char value}.
   */
  public static int hash(char value) {
    return value;
  }

  /**
   * Returns the hash code of the primitive {@code boolean value}.
   */
  public static int hash(boolean value) {
    if (value) {
      return Boolean.TRUE.hashCode();
    } else {
      return Boolean.FALSE.hashCode();
    }
  }

  /**
   * Returns the hash code of the given {@code number}.
   */
  public static int hash(Number number) {
    if (number instanceof Double) {
      return Murmur3.hash(number.doubleValue());
    } else if (number instanceof Float) {
      return Murmur3.hash(number.floatValue());
    } else if (number instanceof Long) {
      return Murmur3.hash(number.longValue());
    } else {
      return number.intValue();
    }
  }

  /**
   * Returns the hash code of the given {@code array}.
   */
  public static int hash(byte[] array) {
    return Murmur3.mash(Murmur3.mixByteArray(0, array));
  }

  /**
   * Returns the hash code of the–possibly {@code null}–{@code object}.
   */
  public static int hash(@Nullable Object object) {
    if (object == null) {
      return 0;
    } else if (object instanceof Number) {
      return Murmur3.hash((Number) object);
    } else {
      return object.hashCode();
    }
  }

  /**
   * Mixes each consecutive 4-byte word in the given {@code array} into the
   * accumulated hash {@code code}.
   */
  public static int mixByteArray(int code, byte[] array) {
    return Murmur3.mixByteArray(code, array, 0, array.length);
  }

  /**
   * Mixes each consecutive 4-byte word in the given {@code array}, starting at
   * index {@code offset}, and continuing for {@code size} bytes, into the
   * accumulated hash {@code code}.
   */
  public static int mixByteArray(int code, byte[] array, int offset, int size) {
    if (ByteOrder.nativeOrder() == ByteOrder.BIG_ENDIAN) {
      return Murmur3.mixByteArrayBE(code, array, offset, size);
    } else if (ByteOrder.nativeOrder() == ByteOrder.LITTLE_ENDIAN) {
      return Murmur3.mixByteArrayLE(code, array, offset, size);
    } else {
      throw new AssertionError();
    }
  }

  static int mixByteArrayBE(int code, byte[] array, int offset, int size) {
    final int limit = offset + size;
    while (offset + 3 < limit) {
      final int word = (array[offset] & 0xFF) << 24 | (array[offset + 1] & 0xFF) << 16
                     | (array[offset + 2] & 0xFF) << 8 | (array[offset + 3] & 0xFF);
      code = Murmur3.mix(code, word);
      offset += 4;
    }
    if (offset < limit) {
      int word = (array[offset] & 0xFF) << 24;
      if (offset + 1 < limit) {
        word |= (array[offset + 1] & 0xFF) << 16;
        if (offset + 2 < limit) {
          word |= (array[offset + 2] & 0xFF) << 8;
          //assert offset + 3 === limit;
        }
      }
      word *= 0xCC9E2D51;
      word = Integer.rotateLeft(word, 15);
      word *= 0x1B873593;
      code ^= word;
    }
    return code ^ size;
  }

  static int mixByteArrayLE(int code, byte[] array, int offset, int size) {
    final int limit = offset + size;
    while (offset + 3 < limit) {
      final int word = (array[offset] & 0xFF) | (array[offset + 1] & 0xFF) << 8
                     | (array[offset + 2] & 0xFF) << 16 | (array[offset + 3] & 0xFF) << 24;
      code = Murmur3.mix(code, word);
      offset += 4;
    }
    if (offset < limit) {
      int word = array[offset] & 0xFF;
      if (offset + 1 < limit) {
        word |= (array[offset + 1] & 0xFF) << 8;
        if (offset + 2 < limit) {
          word |= (array[offset + 2] & 0xFF) << 16;
          //assert offset + 3 == limit;
        }
      }
      word *= 0xCC9E2D51;
      word = Integer.rotateLeft(word, 15);
      word *= 0x1B873593;
      code ^= word;
    }
    return code ^ size;
  }

  /**
   * Mixes each consecutive 4-byte word in the UTF-8 encoding of the {@code
   * string} into the accumulated hash {@code code}.
   */
  public static int mixString(int code, String string) {
    if (ByteOrder.nativeOrder() == ByteOrder.BIG_ENDIAN) {
      return Murmur3.mixStringBE(code, string);
    } else if (ByteOrder.nativeOrder() == ByteOrder.LITTLE_ENDIAN) {
      return Murmur3.mixStringLE(code, string);
    } else {
      throw new AssertionError();
    }
  }

  static int mixStringBE(int code, String string) {
    int word = 0;
    int k = 32;
    int i = 0;
    final int n = string != null ? string.length() : 0;
    int utf8Length = 0;
    while (i < n) {
      final int c = string.codePointAt(i);
      if (c >= 0 && c <= 0x7F) { // U+0000..U+007F
        k -= 8;
        word |= c << k;
        if (k == 0) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 32;
        }
        utf8Length += 1;
      } else if (c >= 0x80 && c <= 0x7FF) { // U+0080..U+07FF
        k -= 8;
        word |= (0xC0 | (c >>> 6)) << k;
        if (k == 0) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 32;
        }
        k -= 8;
        word |= (0x80 | (c & 0x3F)) << k;
        if (k == 0) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 32;
        }
        utf8Length += 2;
      } else if (c >= 0x0800 && c <= 0xFFFF) { // (U+0800..U+D7FF, U+E000..U+FFFF, and surrogates
        k -= 8;
        word |= (0xE0 | (c >>> 12)) << k;
        if (k == 0) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 32;
        }
        k -= 8;
        word |= (0x80 | ((c >>> 6) & 0x3F)) << k;
        if (k == 0) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 32;
        }
        k -= 8;
        word |= (0x80 | (c & 0x3F)) << k;
        if (k == 0) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 32;
        }
        utf8Length += 3;
      } else if (c >= 0x10000 && c <= 0x10FFFF) { // U+10000..U+10FFFF
        k -= 8;
        word |= (0xF0 | (c >>> 18)) << k;
        if (k == 0) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 32;
        }
        k -= 8;
        word |= (0x80 | ((c >>> 12) & 0x3F)) << k;
        if (k == 0) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 32;
        }
        k -= 8;
        word |= (0x80 | ((c >>> 6) & 0x3F)) << k;
        if (k == 0) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 32;
        }
        k -= 8;
        word |= (0x80 | (c & 0x3F)) << k;
        if (k == 0) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 32;
        }
        utf8Length += 4;
      } else { // surrogate or invalid code point
        k -= 8;
        word |= 0xEF << k;
        if (k == 0) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 32;
        }
        k -= 8;
        word |= 0xBF << k;
        if (k == 0) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 32;
        }
        k -= 8;
        word |= 0xBD << k;
        if (k == 0) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 32;
        }
        utf8Length += 3;
      }
      i = string.offsetByCodePoints(i, 1);
    }
    if (k != 32) {
      word *= 0xCC9E2D51;
      word = Integer.rotateLeft(word, 15);
      word *= 0x1B873593;
      code ^= word;
    }
    return code ^ utf8Length;
  }

  static int mixStringLE(int code, String string) {
    int word = 0;
    int k = 0;
    int i = 0;
    final int n = string.length();
    int utf8Length = 0;
    while (i < n) {
      final int c = string.codePointAt(i);
      if (c >= 0 && c <= 0x7F) { // U+0000..U+007F
        word |= c << k;
        k += 8;
        if (k == 32) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 0;
        }
        utf8Length += 1;
      } else if (c >= 0x80 && c <= 0x7FF) { // U+0080..U+07FF
        word |= (0xC0 | (c >>> 6)) << k;
        k += 8;
        if (k == 32) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 0;
        }
        word |= (0x80 | (c & 0x3F)) << k;
        k += 8;
        if (k == 32) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 0;
        }
        utf8Length += 2;
      } else if (c >= 0x0800 && c <= 0xFFFF) { // (U+0800..U+D7FF, U+E000..U+FFFF, and surrogates
        word |= (0xE0 | (c >>> 12)) << k;
        k += 8;
        if (k == 32) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 0;
        }
        word |= (0x80 | ((c >>> 6) & 0x3F)) << k;
        k += 8;
        if (k == 32) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 0;
        }
        word |= (0x80 | (c & 0x3F)) << k;
        k += 8;
        if (k == 32) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 0;
        }
        utf8Length += 3;
      } else if (c >= 0x10000 && c <= 0x10FFFF) { // U+10000..U+10FFFF
        word |= (0xF0 | (c >>> 18)) << k;
        k += 8;
        if (k == 32) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 0;
        }
        word |= (0x80 | ((c >>> 12) & 0x3F)) << k;
        k += 8;
        if (k == 32) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 0;
        }
        word |= (0x80 | ((c >>> 6) & 0x3F)) << k;
        k += 8;
        if (k == 32) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 0;
        }
        word |= (0x80 | (c & 0x3F)) << k;
        k += 8;
        if (k == 32) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 0;
        }
        utf8Length += 4;
      } else { // surrogate or invalid code point
        word |= 0xEF << k;
        k += 8;
        if (k == 32) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 0;
        }
        word |= 0xBF << k;
        k += 8;
        if (k == 32) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 0;
        }
        word |= 0xBD << k;
        k += 8;
        if (k == 32) {
          code = Murmur3.mix(code, word);
          word = 0;
          k = 0;
        }
        utf8Length += 3;
      }
      i = string.offsetByCodePoints(i, 1);
    }
    if (k != 32) {
      word *= 0xCC9E2D51;
      word = Integer.rotateLeft(word, 15);
      word *= 0x1B873593;
      code ^= word;
    }
    return code ^ utf8Length;
  }

  /**
   * Mixes a new hash {@code value} into the accumulated cumulative hash
   * {@code code}.
   */
  public static int mix(int code, int value) {
    value *= 0xCC9E2D51;
    value = Integer.rotateLeft(value, 15);
    value *= 0x1B873593;
    code ^= value;
    code = Integer.rotateLeft(code, 13);
    code = code * 5 + 0xE6546B64;
    return code;
  }

  /**
   * Finalizes a hash {@code code}.
   */
  public static int mash(int code) {
    code ^= code >>> 16;
    code *= 0x85EBCA6B;
    code ^= code >>> 13;
    code *= 0xC2B2AE35;
    code ^= code >>> 16;
    return code;
  }

}
