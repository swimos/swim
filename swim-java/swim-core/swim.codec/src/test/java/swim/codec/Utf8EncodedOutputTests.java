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

package swim.codec;

import java.util.Arrays;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class Utf8EncodedOutputTests {

  @Test
  public void encodeValid1ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 1
    encodeValidCodePoint(0x00, byteArray(0x00));
    encodeValidCodePoint(0x7F, byteArray(0x7F));
  }

  @Test
  public void encodeValid2ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 2
    encodeValidCodePoint(0x080, byteArray(0xC2, 0x80));
    encodeValidCodePoint(0x7FF, byteArray(0xDF, 0xBF));
  }

  @Test
  public void encodeValid3ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 3
    encodeValidCodePoint(0x0800, byteArray(0xE0, 0xA0, 0x80));
    encodeValidCodePoint(0x0FFF, byteArray(0xE0, 0xBF, 0xBF));
    // Table 3-7 row 4
    encodeValidCodePoint(0x1000, byteArray(0xE1, 0x80, 0x80));
    encodeValidCodePoint(0xCFFF, byteArray(0xEC, 0xBF, 0xBF));
    // Table 3-7 row 5
    encodeValidCodePoint(0xD000, byteArray(0xED, 0x80, 0x80));
    encodeValidCodePoint(0xD7FF, byteArray(0xED, 0x9F, 0xBF));
    // Table 3-7 row 6
    encodeValidCodePoint(0xE000, byteArray(0xEE, 0x80, 0x80));
    encodeValidCodePoint(0xFFFF, byteArray(0xEF, 0xBF, 0xBF));
  }

  @Test
  public void encodeValid4ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 7
    encodeValidCodePoint(0x010000, byteArray(0xF0, 0x90, 0x80, 0x80));
    encodeValidCodePoint(0x03FFFF, byteArray(0xF0, 0xBF, 0xBF, 0xBF));
    // Table 3-7 row 8
    encodeValidCodePoint(0x040000, byteArray(0xF1, 0x80, 0x80, 0x80));
    encodeValidCodePoint(0x0FFFFF, byteArray(0xF3, 0xBF, 0xBF, 0xBF));
    // Table 3-7 row 9
    encodeValidCodePoint(0x100000, byteArray(0xF4, 0x80, 0x80, 0x80));
    encodeValidCodePoint(0x10FFFF, byteArray(0xF4, 0x8F, 0xBF, 0xBF));
  }

  static void encodeValidCodePoint(int codePoint, byte[] codeUnits) {
    final int n = codeUnits.length;
    for (int i = 1; i <= n; i += 1) {
      final byte[] actual = new byte[n];
      final BinaryOutput buffer = new BinaryOutput(actual, 0, i);
      final Utf8EncodedOutput<?> output = new Utf8EncodedOutput<>(buffer, UtfErrorMode.fatal());
      output.write(codePoint);
      buffer.limit(n);
      if (i != n) {
        assertFalse(Arrays.equals(actual, codeUnits));
      }
      output.flush();
      assertArrayEquals(codeUnits, actual);
    }
  }

  static byte[] byteArray(int... xs) {
    final int n = xs.length;
    final byte[] bytes = new byte[n];
    for (int i = 0; i < n; i += 1) {
      bytes[i] = (byte) xs[i];
    }
    return bytes;
  }

}
