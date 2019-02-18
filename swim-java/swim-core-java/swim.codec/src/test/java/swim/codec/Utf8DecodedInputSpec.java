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
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

public class Utf8DecodedInputSpec {
  @Test
  public void decodeWellFormed1ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 1
    decodeWellFormedCodeUnitSequence(byteArray(0x00), 0x00);
    decodeWellFormedCodeUnitSequence(byteArray(0x7f), 0x7f);
  }

  @Test
  public void decodeWellFormed2ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 2
    decodeWellFormedCodeUnitSequence(byteArray(0xc2, 0x80), 0x080);
    decodeWellFormedCodeUnitSequence(byteArray(0xdf, 0xbf), 0x7ff);
  }

  @Test
  public void decodeWellFormed3ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 3
    decodeWellFormedCodeUnitSequence(byteArray(0xe0, 0xa0, 0x80), 0x0800);
    decodeWellFormedCodeUnitSequence(byteArray(0xe0, 0xbf, 0xbf), 0x0fff);
    // Table 3-7 row 4
    decodeWellFormedCodeUnitSequence(byteArray(0xe1, 0x80, 0x80), 0x1000);
    decodeWellFormedCodeUnitSequence(byteArray(0xec, 0xbf, 0xbf), 0xcfff);
    // Table 3-7 row 5
    decodeWellFormedCodeUnitSequence(byteArray(0xed, 0x80, 0x80), 0xd000);
    decodeWellFormedCodeUnitSequence(byteArray(0xed, 0x9f, 0xbf), 0xd7ff);
    // Table 3-7 row 6
    decodeWellFormedCodeUnitSequence(byteArray(0xee, 0x80, 0x80), 0xe000);
    decodeWellFormedCodeUnitSequence(byteArray(0xef, 0xbf, 0xbf), 0xffff);
  }

  @Test
  public void decodeWellFormed4ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 7
    decodeWellFormedCodeUnitSequence(byteArray(0xf0, 0x90, 0x80, 0x80), 0x010000);
    decodeWellFormedCodeUnitSequence(byteArray(0xf0, 0xbf, 0xbf, 0xbf), 0x03ffff);
    // Table 3-7 row 8
    decodeWellFormedCodeUnitSequence(byteArray(0xf1, 0x80, 0x80, 0x80), 0x040000);
    decodeWellFormedCodeUnitSequence(byteArray(0xf3, 0xbf, 0xbf, 0xbf), 0x0fffff);
    // Table 3-7 row 9
    decodeWellFormedCodeUnitSequence(byteArray(0xf4, 0x80, 0x80, 0x80), 0x100000);
    decodeWellFormedCodeUnitSequence(byteArray(0xf4, 0x8f, 0xbf, 0xbf), 0x10ffff);
  }

  @Test
  public void decodeIllFormed1ByteCodeUnitSequences() {
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0x80));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xc1));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xf5));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xff));
  }

  @Test
  public void decodeIllFormed2ByteCodeUnitSequences() {
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xc2, 0xc0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xdf, 0xc0));

    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xe0, 0x80));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xed, 0xbf));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xf0, 0x80));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xf4, 0xbf));
  }

  @Test
  public void decodeIllFormed3ByteCodeUnitSequences() {
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xe0, 0xa0, 0xc0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xe0, 0xbf, 0xc0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xe1, 0x80, 0xc0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xec, 0xbf, 0xc0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xed, 0x80, 0xc0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xed, 0x9f, 0xc0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xee, 0x80, 0xc0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xef, 0xbf, 0xc0));
  }

  @Test
  public void decodeIllFormed4ByteCodeUnitSequences() {
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xf0, 0x90, 0x80, 0xc0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xf0, 0xbf, 0xbf, 0xc0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xf1, 0x80, 0x80, 0xc0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xf3, 0xbf, 0xbf, 0xc0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xf4, 0x80, 0x80, 0xc0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xf4, 0x8f, 0xbf, 0xc0));
  }

  @Test
  public void recoverFromIllFormed1ByteCodeUnitSequences() {
    recoverFromIllFormedCodeUnitSequence(byteArray(0x80, 0x00), 0x00);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xf5, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xff, 0x7f), 0x7f);
  }

  @Test
  public void recoverFromIllFormed2ByteCodeUnitSequences() {
    recoverFromIllFormedCodeUnitSequence(byteArray(0xc2, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xe0, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xe1, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xec, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xed, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xee, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xef, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xf0, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xf1, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xf3, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xf4, 0x7f), 0x7f);
  }

  @Test
  public void recoverFromIllFormed3ByteCodeUnitSequences() {
    recoverFromIllFormedCodeUnitSequence(byteArray(0xe0, 0xa0, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xe0, 0xbf, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xe1, 0x80, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xec, 0xbf, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xed, 0x80, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xed, 0x9f, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xee, 0x80, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xef, 0xbf, 0x7f), 0x7f);
  }

  @Test
  public void recoverFromIllFormed4ByteCodeUnitSequences() {
    recoverFromIllFormedCodeUnitSequence(byteArray(0xf0, 0x90, 0x80, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xf0, 0xbf, 0xbf, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xf1, 0x80, 0x80, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xf3, 0xbf, 0xbf, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xf4, 0x80, 0x80, 0x7f), 0x7f);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xf4, 0x8f, 0xbf, 0x7f), 0x7f);
  }

  static void decodeWellFormedCodeUnitSequence(byte[] codeUnits, int codePoint) {
    final int n = codeUnits.length;

    // Decode complete code unit sequence.
    Input input = Utf8.decodedInput(Binary.input(codeUnits));
    assertTrue(input.isCont());
    assertFalse(input.isEmpty());
    assertFalse(input.isDone());
    assertFalse(input.isError());
    assertEquals(input.head(), codePoint);
    input = input.step();
    assertFalse(input.isCont());
    assertFalse(input.isEmpty());
    assertTrue(input.isDone());
    assertFalse(input.isError());

    // Decode all code unit subsequence permutations.
    for (int i = 0; i <= n; i += 1) {
      final byte[] part1 = new byte[i];
      for (int j = 0; j < i; j += 1) {
        part1[j] = codeUnits[j];
      }
      final byte[] part2 = new byte[n - i];
      for (int j = i; j < n; j += 1) {
        part2[j - i] = codeUnits[j];
      }

      input = Utf8.decodedInput(Binary.input(part1)).isPart(true);
      assertEquals(input.isCont(), i == n);
      assertEquals(input.isEmpty(), i != n);
      assertFalse(input.isDone());
      assertFalse(input.isError());
      if (i == n) {
        assertEquals(input.head(), codePoint);
        input = input.step();
        assertFalse(input.isCont());
        assertTrue(input.isEmpty());
        assertFalse(input.isDone());
        assertFalse(input.isError());
      } else {
        input = input.fork(Binary.input(part2)).isPart(false);
        assertTrue(input.isCont());
        assertFalse(input.isEmpty());
        assertFalse(input.isDone());
        assertFalse(input.isError());
        assertEquals(input.head(), codePoint);
        input = input.step();
        assertFalse(input.isCont());
        assertFalse(input.isEmpty());
        assertTrue(input.isDone());
        assertFalse(input.isError());
      }
    }
  }

  static void decodeMaximalSubpartOfIllFormedCodeUnitSequence(byte[] codeUnits) {
    final int n = codeUnits.length;

    // Decode complete code unit sequence with replacement.
    Input input = Utf8.decodedInput(Binary.input(codeUnits), UtfErrorMode.replacement());
    assertTrue(input.isCont());
    assertFalse(input.isEmpty());
    assertFalse(input.isDone());
    assertFalse(input.isError());
    assertEquals(input.head(), 0xfffd);
    if (n > 1) {
      input = input.step();
      assertTrue(input.isCont());
      assertFalse(input.isEmpty());
      assertFalse(input.isDone());
      assertFalse(input.isError());
      assertEquals(input.head(), 0xfffd);
    }
    input = input.step();
    assertFalse(input.isCont());
    assertFalse(input.isEmpty());
    assertTrue(input.isDone());
    assertFalse(input.isError());

    // Decode complete code unit sequence with failure.
    input = Utf8.decodedInput(Binary.input(codeUnits), UtfErrorMode.fatal());
    assertFalse(input.isCont());
    assertFalse(input.isEmpty());
    assertFalse(input.isDone());
    assertTrue(input.isError());

    // Decode all code unit subsequence permutations.
    for (int i = 0; i <= n; i += 1) {
      final byte[] part1 = new byte[i];
      for (int j = 0; j < i; j += 1) {
        part1[j] = codeUnits[j];
      }
      final byte[] part2 = new byte[n - i];
      for (int j = i; j < n; j += 1) {
        part2[j - i] = codeUnits[j];
      }

      // Decode code unit subsequence with replacement.
      input = Utf8.decodedInput(Binary.input(part1), UtfErrorMode.replacement()).isPart(true);
      assertEquals(input.isCont(), i == n);
      assertEquals(input.isEmpty(), i != n);
      assertFalse(input.isDone());
      assertFalse(input.isError());
      if (i == n) {
        assertEquals(input.head(), 0xfffd);
        if (n > 1) {
          input = input.step();
          assertTrue(input.isCont());
          assertFalse(input.isEmpty());
          assertFalse(input.isDone());
          assertFalse(input.isError());
          assertEquals(input.head(), 0xfffd);
        }
        input = input.isPart(false);
        input = input.step();
        assertFalse(input.isCont());
        assertFalse(input.isEmpty());
        assertTrue(input.isDone());
        assertFalse(input.isError());
      } else {
        input = input.fork(Binary.input(part2));
        assertTrue(input.isCont());
        assertFalse(input.isEmpty());
        assertFalse(input.isDone());
        assertFalse(input.isError());
        assertEquals(input.head(), 0xfffd);
        if (n > 1) {
          input = input.step();
          assertTrue(input.isCont());
          assertFalse(input.isEmpty());
          assertFalse(input.isDone());
          assertFalse(input.isError());
          assertEquals(input.head(), 0xfffd);
        }
        input = input.isPart(false);
        input = input.step();
        assertFalse(input.isCont());
        assertFalse(input.isEmpty());
        assertTrue(input.isDone());
        assertFalse(input.isError());
      }

      // Decode code unit subsequence with failure.
      input = Utf8.decodedInput(Binary.input(part1), UtfErrorMode.fatal()).isPart(true);
      assertFalse(input.isCont());
      assertEquals(input.isEmpty(), i != n);
      assertFalse(input.isDone());
      assertEquals(input.isError(), i == n);
      if (i == n) {
        assertFalse(input.isCont());
        assertFalse(input.isEmpty());
        assertFalse(input.isDone());
        assertTrue(input.isError());
      } else {
        input = input.fork(Binary.input(part2));
        assertFalse(input.isCont());
        assertFalse(input.isEmpty());
        assertFalse(input.isDone());
        assertTrue(input.isError());
      }
    }
  }

  static void recoverFromIllFormedCodeUnitSequence(byte[] codeUnits, int codePoint) {
    final int n = codeUnits.length;

    // Decode complete code unit sequence with replacement.
    Input input = Utf8.decodedInput(Binary.input(codeUnits), UtfErrorMode.replacement());
    assertTrue(input.isCont());
    assertFalse(input.isEmpty());
    assertFalse(input.isDone());
    assertFalse(input.isError());
    assertEquals(input.head(), 0xfffd);
    input = input.step();
    assertTrue(input.isCont());
    assertFalse(input.isEmpty());
    assertFalse(input.isDone());
    assertFalse(input.isError());
    assertEquals(input.head(), codePoint);
    input = input.step();
    assertFalse(input.isCont());
    assertFalse(input.isEmpty());
    assertTrue(input.isDone());
    assertFalse(input.isError());

    // Decode all code unit subsequence permutations.
    for (int i = 0; i <= n; i += 1) {
      //System.out.println("i: " + i + "; n: " + n);
      final byte[] part1 = new byte[i];
      for (int j = 0; j < i; j += 1) {
        part1[j] = codeUnits[j];
      }
      final byte[] part2 = new byte[n - i];
      for (int j = i; j < n; j += 1) {
        part2[j - i] = codeUnits[j];
      }

      // Decode code unit subsequence with replacement.
      input = Utf8.decodedInput(Binary.input(part1), UtfErrorMode.replacement()).isPart(true);
      if (input.isCont()) {
        assertTrue(input.isCont());
        assertFalse(input.isEmpty());
        assertFalse(input.isDone());
        assertFalse(input.isError());
        assertEquals(input.head(), 0xfffd);
        input = input.step();
        if (input.isEmpty()) {
          input = input.fork(Binary.input(part2));
        }
        assertTrue(input.isCont());
        assertFalse(input.isEmpty());
        assertFalse(input.isDone());
        assertFalse(input.isError());
        assertEquals(input.head(), codePoint);
        input = input.step();
        input = input.isPart(false);
        assertFalse(input.isCont());
        assertFalse(input.isEmpty());
        assertTrue(input.isDone());
        assertFalse(input.isError());
      } else {
        input = input.fork(Binary.input(part2)).isPart(false);
        assertTrue(input.isCont());
        assertFalse(input.isEmpty());
        assertFalse(input.isDone());
        assertFalse(input.isError());
        assertEquals(input.head(), 0xfffd);
        input = input.step();
        assertTrue(input.isCont());
        assertFalse(input.isEmpty());
        assertFalse(input.isDone());
        assertFalse(input.isError());
        assertEquals(input.head(), codePoint);
        input = input.step();
        assertFalse(input.isCont());
        assertFalse(input.isEmpty());
        assertTrue(input.isDone());
        assertFalse(input.isError());
      }
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
