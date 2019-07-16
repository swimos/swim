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

import java.nio.ByteOrder;

/**
 * 32-bit <a href="https://en.wikipedia.org/wiki/MurmurHash">MurmurHash</a>
 * algorithm, version 3.
 */
public final class Murmur3 {
  private Murmur3() {
  }

  /**
   * Returns the hash code of the name of the class.
   */
  public static int seed(Class<?> clazz) {
    return seed(clazz.getName());
  }

  /**
   * Returns the hash code of the {@code string}.
   */
  public static int seed(String string) {
    return mash(mix(0, string));
  }

  /**
   * Returns the hash code of the primitive `byte` `value`.
   */
  public static int hash(byte value) {
    return value;
  }

  /**
   * Returns the hash code of the primitive `short` `value`.
   */
  public static int hash(short value) {
    return value;
  }

  /**
   * Returns the hash code of the primitive `int` `value`.
   */
  public static int hash(int value) {
    return value;
  }

  /**
   * Returns the hash code of the primitive `long` `value`.
   */
  public static int hash(long value) {
    return (int) value ^ ((int) (value >>> 32) + (int) (value >>> 63));
  }

  /**
   * Returns the hash code of the primitive `float` `value`.
   */
  public static int hash(float value) {
    if (value == (float) (int) value) {
      return (int) value;
    } else if (value == (float) (long) value) {
      return hash((long) value);
    } else {
      return Float.floatToIntBits(value);
    }
  }

  /**
   * Returns the hash code of the primitive `double` `value`.
   */
  public static int hash(double value) {
    if (value == (double) (int) value) {
      return (int) value;
    } else if (value == (double) (long) value) {
      return hash((long) value);
    } else if (value == (double) (float) value) {
      return Float.floatToIntBits((float) value);
    } else {
      final long y = Double.doubleToLongBits(value);
      return (int) y ^ (int) (y >>> 32);
    }
  }

  /**
   * Returns the hash code of the primitive `char` `value`.
   */
  public static int hash(char value) {
    return value;
  }

  /**
   * Returns the hash code of the primitive `boolean` `value`.
   */
  public static int hash(boolean value) {
    if (value) {
      return Boolean.TRUE.hashCode();
    } else {
      return Boolean.FALSE.hashCode();
    }
  }

  /**
   * Returns the hash code of the {@code number}.
   */
  public static int hash(Number number) {
    if (number instanceof Double) {
      return hash(number.doubleValue());
    } else if (number instanceof Float) {
      return hash(number.floatValue());
    } else if (number instanceof Long) {
      return hash(number.longValue());
    } else {
      return number.intValue();
    }
  }

  /**
   * Returns the hash code of the–possibly {@code null}–{@code object}.
   */
  public static int hash(Object object) {
    if (object == null) {
      return 0;
    } else if (object instanceof Number) {
      return hash((Number) object);
    } else {
      return object.hashCode();
    }
  }

  /**
   * Mixes each consecutive 4-byte word in the {@code array}, starting at
   * index {@code offset}, and continuing for {@code size} bytes, into the
   * accumulated hash {@code code}.
   */
  public static int mix(int code, byte[] array, int offset, int size) {
    if (ByteOrder.nativeOrder() == ByteOrder.BIG_ENDIAN) {
      return mixByteArrayBE(code, array, offset, size);
    } else if (ByteOrder.nativeOrder() == ByteOrder.LITTLE_ENDIAN) {
      return mixByteArrayLE(code, array, offset, size);
    } else {
      throw new AssertionError();
    }
  }
  static int mixByteArrayBE(int code, byte[] array, int offset, int size) {
    final int limit = offset + size;
    while (offset + 3 < limit) {
      final int word = (array[offset    ] & 0xff) << 24 | (array[offset + 1] & 0xff) << 16
                     | (array[offset + 2] & 0xff) <<  8 |  array[offset + 3] & 0xff;
      code = mix(code, word);
      offset += 4;
    }
    if (offset < limit) {
      int word = (array[offset] & 0xff) << 24;
      if (offset + 1 < limit) {
        word |= (array[offset + 1] & 0xff) << 16;
        if (offset + 2 < limit) {
          word |= (array[offset + 2] & 0xff) << 8;
          //assert offset + 3 === limit;
        }
      }
      word *= 0xcc9e2d51;
      word = Integer.rotateLeft(word, 15);
      word *= 0x1b873593;
      code ^= word;
    }
    return code ^ size;
  }
  static int mixByteArrayLE(int code, byte[] array, int offset, int size) {
    final int limit = offset + size;
    while (offset + 3 < limit) {
      final int word =  array[offset    ] & 0xff        | (array[offset + 1] & 0xff) <<  8
                     | (array[offset + 2] & 0xff) << 16 | (array[offset + 3] & 0xff) << 24;
      code = mix(code, word);
      offset += 4;
    }
    if (offset < limit) {
      int word = array[offset] & 0xff;
      if (offset + 1 < limit) {
        word |= (array[offset + 1] & 0xff) << 8;
        if (offset + 2 < limit) {
          word |= (array[offset + 2] & 0xff) << 16;
          //assert offset + 3 == limit;
        }
      }
      word *= 0xcc9e2d51;
      word = Integer.rotateLeft(word, 15);
      word *= 0x1b873593;
      code ^= word;
    }
    return code ^ size;
  }

  /**
   * Mixes each consecutive 4-byte word in the {@code array} into the
   * accumulated hash {@code code}.
   */
  public static int mix(int code, byte[] array) {
    return mix(code, array, 0, array != null ? array.length : 0);
  }

  /**
   * Mixes each consecutive 4-byte word in the UTF-8 encoding of the {@code
   * string} into the accumulated hash {@code code}.
   */
  public static int mix(int code, String string) {
    if (ByteOrder.nativeOrder() == ByteOrder.BIG_ENDIAN) {
      return mixStringBE(code, string);
    } else if (ByteOrder.nativeOrder() == ByteOrder.LITTLE_ENDIAN) {
      return mixStringLE(code, string);
    } else {
      throw new AssertionError();
    }
  }
  @SuppressWarnings("checkstyle:LeftCurly")
  static int mixStringBE(int code, String string) {
    int word = 0;
    int k = 32;
    int i = 0;
    final int n = string != null ? string.length() : 0;
    int utf8Length = 0;
    while (i < n) {
      final int c = string.codePointAt(i);
      if (c >= 0 && c <= 0x7f) { // U+0000..U+007F
        k -= 8;
        word |= c << k;
        if (k == 0) { code = mix(code, word); word = 0; k = 32; }
        utf8Length += 1;
      } else if (c >= 0x80 && c <= 0x7ff) { // U+0080..U+07FF
        k -= 8;
        word |= (0xc0 | (c >>> 6)) << k;
        if (k == 0) { code = mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= (0x80 | (c & 0x3f)) << k;
        if (k == 0) { code = mix(code, word); word = 0; k = 32; }
        utf8Length += 2;
      } else if (c >= 0x0800 && c <= 0xffff) { // (U+0800..U+D7FF, U+E000..U+FFFF, and surrogates
        k -= 8;
        word |= (0xe0 | (c  >>> 12)) << k;
        if (k == 0) { code = mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= (0x80 | ((c >>>  6) & 0x3f)) << k;
        if (k == 0) { code = mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= (0x80 | (c & 0x3f)) << k;
        if (k == 0) { code = mix(code, word); word = 0; k = 32; }
        utf8Length += 3;
      } else if (c >= 0x10000 && c <= 0x10ffff) { // U+10000..U+10FFFF
        k -= 8;
        word |= (0xf0 | (c  >>> 18)) << k;
        if (k == 0) { code = mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= (0x80 | ((c >>> 12) & 0x3f)) << k;
        if (k == 0) { code = mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= (0x80 | ((c >>>  6) & 0x3f)) << k;
        if (k == 0) { code = mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= (0x80 | (c & 0x3f)) << k;
        if (k == 0) { code = mix(code, word); word = 0; k = 32; }
        utf8Length += 4;
      } else { // surrogate or invalid code point
        k -= 8;
        word |= 0xef << k;
        if (k == 0) { code = mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= 0xbf << k;
        if (k == 0) { code = mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= 0xbd << k;
        if (k == 0) { code = mix(code, word); word = 0; k = 32; }
        utf8Length += 3;
      }
      i = string.offsetByCodePoints(i, 1);
    }
    if (k != 32) {
      word *= 0xcc9e2d51;
      word = Integer.rotateLeft(word, 15);
      word *= 0x1b873593;
      code ^= word;
    }
    return code ^ utf8Length;
  }
  @SuppressWarnings("checkstyle:LeftCurly")
  static int mixStringLE(int code, String string) {
    int word = 0;
    int k = 0;
    int i = 0;
    final int n = string.length();
    int utf8Length = 0;
    while (i < n) {
      final int c = string.codePointAt(i);
      if (c >= 0 && c <= 0x7f) { // U+0000..U+007F
        word |= c << k;
        k += 8;
        if (k == 32) { code = mix(code, word); word = 0; k = 0; }
        utf8Length += 1;
      } else if (c >= 0x80 && c <= 0x7ff) { // U+0080..U+07FF
        word |= (0xc0 | (c >>> 6)) << k;
        k += 8;
        if (k == 32) { code = mix(code, word); word = 0; k = 0; }
        word |= (0x80 | (c & 0x3f)) << k;
        k += 8;
        if (k == 32) { code = mix(code, word); word = 0; k = 0; }
        utf8Length += 2;
      } else if (c >= 0x0800 && c <= 0xffff) { // (U+0800..U+D7FF, U+E000..U+FFFF, and surrogates
        word |= (0xe0 | (c  >>> 12)) << k;
        k += 8;
        if (k == 32) { code = mix(code, word); word = 0; k = 0; }
        word |= (0x80 | ((c >>>  6) & 0x3f)) << k;
        k += 8;
        if (k == 32) { code = mix(code, word); word = 0; k = 0; }
        word |= (0x80 | (c & 0x3f)) << k;
        k += 8;
        if (k == 32) { code = mix(code, word); word = 0; k = 0; }
        utf8Length += 3;
      } else if (c >= 0x10000 && c <= 0x10ffff) { // U+10000..U+10FFFF
        word |= (0xf0 | (c  >>> 18)) << k;
        k += 8;
        if (k == 32) { code = mix(code, word); word = 0; k = 0; }
        word |= (0x80 | ((c >>> 12) & 0x3f)) << k;
        k += 8;
        if (k == 32) { code = mix(code, word); word = 0; k = 0; }
        word |= (0x80 | ((c >>>  6) & 0x3f)) << k;
        k += 8;
        if (k == 32) { code = mix(code, word); word = 0; k = 0; }
        word |= (0x80 | (c & 0x3f)) << k;
        k += 8;
        if (k == 32) { code = mix(code, word); word = 0; k = 0; }
        utf8Length += 4;
      } else { // surrogate or invalid code point
        word |= 0xef << k;
        k += 8;
        if (k == 32) { code = mix(code, word); word = 0; k = 0; }
        word |= 0xbf << k;
        k += 8;
        if (k == 32) { code = mix(code, word); word = 0; k = 0; }
        word |= 0xbd << k;
        k += 8;
        if (k == 32) { code = mix(code, word); word = 0; k = 0; }
        utf8Length += 3;
      }
      i = string.offsetByCodePoints(i, 1);
    }
    if (k != 32) {
      word *= 0xcc9e2d51;
      word = Integer.rotateLeft(word, 15);
      word *= 0x1b873593;
      code ^= word;
    }
    return code ^ utf8Length;
  }

  /**
   * Mixes a new hash {@code value} into the accumulated cumulative hash
   * {@code code}.
   */
  public static int mix(int code, int value) {
    value *= 0xcc9e2d51;
    value = Integer.rotateLeft(value, 15);
    value *= 0x1b873593;
    code ^= value;
    code = Integer.rotateLeft(code, 13);
    code = code * 5 + 0xe6546b64;
    return code;
  }

  /**
   * Finalizes a hash {@code code}.
   */
  public static int mash(int code) {
    code ^= code >>> 16;
    code *= 0x85ebca6b;
    code ^= code >>> 13;
    code *= 0xc2b2ae35;
    code ^= code >>> 16;
    return code;
  }
}
