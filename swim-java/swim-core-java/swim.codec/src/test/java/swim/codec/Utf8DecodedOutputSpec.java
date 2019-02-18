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

public class Utf8DecodedOutputSpec {
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
    Output<String> output = Utf8.decodedOutput(Unicode.stringOutput());
    for (int i = 0; i < n; i += 1) {
      assertTrue(output.isCont());
      assertFalse(output.isFull());
      assertFalse(output.isDone());
      assertFalse(output.isError());
      output = output.write(codeUnits[i] & 0xff);
    }
    assertEquals(output.bind(), new StringBuilder().appendCodePoint(codePoint).toString());
  }

  static void decodeMaximalSubpartOfIllFormedCodeUnitSequence(byte[] codeUnits) {
    final int n = codeUnits.length;
    final StringBuilder sb = new StringBuilder();
    sb.appendCodePoint(0xfffd);
    if (n > 1) {
      sb.appendCodePoint(0xfffd);
    }
    final String expected = sb.toString();

    // Decode complete code unit sequence with replacement.
    Output<String> output = Utf8.decodedOutput(Unicode.stringOutput(), UtfErrorMode.replacement());
    for (int i = 0; i < n; i += 1) {
      assertTrue(output.isCont());
      assertFalse(output.isFull());
      assertFalse(output.isDone());
      assertFalse(output.isError());
      output = output.write(codeUnits[i] & 0xff);
    }
    assertEquals(output.bind(), expected);

    // Decode complete code unit sequence with failure.
    output = Utf8.decodedOutput(Unicode.stringOutput(), UtfErrorMode.fatal());
    for (int i = 0; i < n; i += 1) {
      assertTrue(output.isCont());
      assertFalse(output.isFull());
      assertFalse(output.isDone());
      assertFalse(output.isError());
      output = output.write(codeUnits[i] & 0xff);
    }
    assertFalse(output.isCont());
    assertFalse(output.isFull());
    assertFalse(output.isDone());
    assertTrue(output.isError());
  }

  static void recoverFromIllFormedCodeUnitSequence(byte[] codeUnits, int codePoint) {
    final int n = codeUnits.length;
    final StringBuilder sb = new StringBuilder();
    sb.appendCodePoint(0xfffd);
    sb.appendCodePoint(codePoint);
    final String expected = sb.toString();

    // Decode complete code unit sequence with replacement.
    Output<String> output = Utf8.decodedOutput(Unicode.stringOutput(), UtfErrorMode.replacement());
    for (int i = 0; i < n; i += 1) {
      assertTrue(output.isCont());
      assertFalse(output.isFull());
      assertFalse(output.isDone());
      assertFalse(output.isError());
      output = output.write(codeUnits[i] & 0xff);
    }
    assertEquals(output.bind(), expected);
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
