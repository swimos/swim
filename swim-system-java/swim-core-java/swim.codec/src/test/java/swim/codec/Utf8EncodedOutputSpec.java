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

package swim.codec;

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNotEquals;

public class Utf8EncodedOutputSpec {
  @Test
  public void encodeValid1ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 1
    encodeValidCodePoint(0x00, byteArray(0x00));
    encodeValidCodePoint(0x7f, byteArray(0x7f));
  }

  @Test
  public void encodeValid2ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 2
    encodeValidCodePoint(0x080, byteArray(0xc2, 0x80));
    encodeValidCodePoint(0x7ff, byteArray(0xdf, 0xbf));
  }

  @Test
  public void encodeValid3ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 3
    encodeValidCodePoint(0x0800, byteArray(0xe0, 0xa0, 0x80));
    encodeValidCodePoint(0x0fff, byteArray(0xe0, 0xbf, 0xbf));
    // Table 3-7 row 4
    encodeValidCodePoint(0x1000, byteArray(0xe1, 0x80, 0x80));
    encodeValidCodePoint(0xcfff, byteArray(0xec, 0xbf, 0xbf));
    // Table 3-7 row 5
    encodeValidCodePoint(0xd000, byteArray(0xed, 0x80, 0x80));
    encodeValidCodePoint(0xd7ff, byteArray(0xed, 0x9f, 0xbf));
    // Table 3-7 row 6
    encodeValidCodePoint(0xe000, byteArray(0xee, 0x80, 0x80));
    encodeValidCodePoint(0xffff, byteArray(0xef, 0xbf, 0xbf));
  }

  @Test
  public void encodeValid4ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 7
    encodeValidCodePoint(0x010000, byteArray(0xf0, 0x90, 0x80, 0x80));
    encodeValidCodePoint(0x03ffff, byteArray(0xf0, 0xbf, 0xbf, 0xbf));
    // Table 3-7 row 8
    encodeValidCodePoint(0x040000, byteArray(0xf1, 0x80, 0x80, 0x80));
    encodeValidCodePoint(0x0fffff, byteArray(0xf3, 0xbf, 0xbf, 0xbf));
    // Table 3-7 row 9
    encodeValidCodePoint(0x100000, byteArray(0xf4, 0x80, 0x80, 0x80));
    encodeValidCodePoint(0x10ffff, byteArray(0xf4, 0x8f, 0xbf, 0xbf));
  }

  static void encodeValidCodePoint(int codePoint, byte[] codeUnits) {
    final int n = codeUnits.length;
    for (int i = 1; i <= n; i += 1) {
      final byte[] actual = new byte[n];
      final OutputBuffer<?> buffer = Binary.outputBuffer(actual, 0, i);
      Output<?> output = Utf8.encodedOutput(buffer, UtfErrorMode.fatal());
      output = output.write(codePoint);
      buffer.limit(n);
      if (i != n) {
        assertNotEquals(actual, codeUnits);
      }
      output = output.flush();
      assertEquals(actual, codeUnits);
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
