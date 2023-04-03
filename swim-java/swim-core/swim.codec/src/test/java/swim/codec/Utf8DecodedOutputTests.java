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

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class Utf8DecodedOutputTests {

  @Test
  public void decodeWellFormed1ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 1
    decodeWellFormedCodeUnitSequence(byteArray(0x00), 0x00);
    decodeWellFormedCodeUnitSequence(byteArray(0x7F), 0x7F);
  }

  @Test
  public void decodeWellFormed2ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 2
    decodeWellFormedCodeUnitSequence(byteArray(0xC2, 0x80), 0x080);
    decodeWellFormedCodeUnitSequence(byteArray(0xDF, 0xBF), 0x7FF);
  }

  @Test
  public void decodeWellFormed3ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 3
    decodeWellFormedCodeUnitSequence(byteArray(0xE0, 0xA0, 0x80), 0x0800);
    decodeWellFormedCodeUnitSequence(byteArray(0xE0, 0xBF, 0xBF), 0x0FFF);
    // Table 3-7 row 4
    decodeWellFormedCodeUnitSequence(byteArray(0xE1, 0x80, 0x80), 0x1000);
    decodeWellFormedCodeUnitSequence(byteArray(0xEC, 0xBF, 0xBF), 0xCFFF);
    // Table 3-7 row 5
    decodeWellFormedCodeUnitSequence(byteArray(0xED, 0x80, 0x80), 0xD000);
    decodeWellFormedCodeUnitSequence(byteArray(0xED, 0x9F, 0xBF), 0xD7FF);
    // Table 3-7 row 6
    decodeWellFormedCodeUnitSequence(byteArray(0xEE, 0x80, 0x80), 0xE000);
    decodeWellFormedCodeUnitSequence(byteArray(0xEF, 0xBF, 0xBF), 0xFFFF);
  }

  @Test
  public void decodeWellFormed4ByteCodeUnitSequences() {
    // Unicode 11.0.0 § 3.9
    // Table 3-7 row 7
    decodeWellFormedCodeUnitSequence(byteArray(0xF0, 0x90, 0x80, 0x80), 0x010000);
    decodeWellFormedCodeUnitSequence(byteArray(0xF0, 0xBF, 0xBF, 0xBF), 0x03FFFF);
    // Table 3-7 row 8
    decodeWellFormedCodeUnitSequence(byteArray(0xF1, 0x80, 0x80, 0x80), 0x040000);
    decodeWellFormedCodeUnitSequence(byteArray(0xF3, 0xBF, 0xBF, 0xBF), 0x0FFFFF);
    // Table 3-7 row 9
    decodeWellFormedCodeUnitSequence(byteArray(0xF4, 0x80, 0x80, 0x80), 0x100000);
    decodeWellFormedCodeUnitSequence(byteArray(0xF4, 0x8F, 0xBF, 0xBF), 0x10FFFF);
  }

  @Test
  public void decodeIllFormed1ByteCodeUnitSequences() {
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0x80));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xC1));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xF5));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xFF));
  }

  @Test
  public void decodeIllFormed2ByteCodeUnitSequences() {
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xC2, 0xC0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xDF, 0xC0));

    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xE0, 0x80));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xED, 0xBF));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xF0, 0x80));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xF4, 0xBF));
  }

  @Test
  public void decodeIllFormed3ByteCodeUnitSequences() {
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xE0, 0xA0, 0xC0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xE0, 0xBF, 0xC0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xE1, 0x80, 0xC0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xEC, 0xBF, 0xC0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xED, 0x80, 0xC0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xED, 0x9F, 0xC0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xEE, 0x80, 0xC0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xEF, 0xBF, 0xC0));
  }

  @Test
  public void decodeIllFormed4ByteCodeUnitSequences() {
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xF0, 0x90, 0x80, 0xC0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xF0, 0xBF, 0xBF, 0xC0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xF1, 0x80, 0x80, 0xC0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xF3, 0xBF, 0xBF, 0xC0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xF4, 0x80, 0x80, 0xC0));
    decodeMaximalSubpartOfIllFormedCodeUnitSequence(byteArray(0xF4, 0x8F, 0xBF, 0xC0));
  }

  @Test
  public void recoverFromIllFormed1ByteCodeUnitSequences() {
    recoverFromIllFormedCodeUnitSequence(byteArray(0x80, 0x00), 0x00);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xF5, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xFF, 0x7F), 0x7F);
  }

  @Test
  public void recoverFromIllFormed2ByteCodeUnitSequences() {
    recoverFromIllFormedCodeUnitSequence(byteArray(0xC2, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xE0, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xE1, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xEC, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xED, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xEE, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xEF, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xF0, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xF1, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xF3, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xF4, 0x7F), 0x7F);
  }

  @Test
  public void recoverFromIllFormed3ByteCodeUnitSequences() {
    recoverFromIllFormedCodeUnitSequence(byteArray(0xE0, 0xA0, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xE0, 0xBF, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xE1, 0x80, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xEC, 0xBF, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xED, 0x80, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xED, 0x9F, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xEE, 0x80, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xEF, 0xBF, 0x7F), 0x7F);
  }

  @Test
  public void recoverFromIllFormed4ByteCodeUnitSequences() {
    recoverFromIllFormedCodeUnitSequence(byteArray(0xF0, 0x90, 0x80, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xF0, 0xBF, 0xBF, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xF1, 0x80, 0x80, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xF3, 0xBF, 0xBF, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xF4, 0x80, 0x80, 0x7F), 0x7F);
    recoverFromIllFormedCodeUnitSequence(byteArray(0xF4, 0x8F, 0xBF, 0x7F), 0x7F);
  }

  static void decodeWellFormedCodeUnitSequence(byte[] codeUnits, int codePoint) {
    final int n = codeUnits.length;
    // Decode complete code unit sequence.
    final Utf8DecodedOutput<String> output = new Utf8DecodedOutput<String>(new StringOutput());
    for (int i = 0; i < n; i += 1) {
      assertTrue(output.isCont());
      assertFalse(output.isFull());
      assertFalse(output.isDone());
      assertFalse(output.isError());
      output.write(codeUnits[i] & 0xFF);
    }
    assertEquals(new StringBuilder().appendCodePoint(codePoint).toString(), output.getUnchecked());
  }

  static void decodeMaximalSubpartOfIllFormedCodeUnitSequence(byte[] codeUnits) {
    final int n = codeUnits.length;
    final StringBuilder sb = new StringBuilder();
    sb.appendCodePoint(0xFFFD);
    if (n > 1) {
      sb.appendCodePoint(0xFFFD);
    }
    final String expected = sb.toString();

    // Decode complete code unit sequence with replacement.
    Utf8DecodedOutput<String> output = new Utf8DecodedOutput<String>(new StringOutput(), UtfErrorMode.replacement());
    for (int i = 0; i < n; i += 1) {
      assertTrue(output.isCont());
      assertFalse(output.isFull());
      assertFalse(output.isDone());
      assertFalse(output.isError());
      output.write(codeUnits[i] & 0xFF);
    }
    assertEquals(expected, output.getUnchecked());

    // Decode complete code unit sequence with failure.
    output = new Utf8DecodedOutput<String>(new StringOutput(), UtfErrorMode.fatal());
    for (int i = 0; i < n; i += 1) {
      assertTrue(output.isCont());
      assertFalse(output.isFull());
      assertFalse(output.isDone());
      assertFalse(output.isError());
      output.write(codeUnits[i] & 0xFF);
    }
    assertFalse(output.isCont());
    assertFalse(output.isFull());
    assertFalse(output.isDone());
    assertTrue(output.isError());
  }

  static void recoverFromIllFormedCodeUnitSequence(byte[] codeUnits, int codePoint) {
    final int n = codeUnits.length;
    final StringBuilder sb = new StringBuilder();
    sb.appendCodePoint(0xFFFD);
    sb.appendCodePoint(codePoint);
    final String expected = sb.toString();

    // Decode complete code unit sequence with replacement.
    final Utf8DecodedOutput<String> output = new Utf8DecodedOutput<String>(new StringOutput(), UtfErrorMode.replacement());
    for (int i = 0; i < n; i += 1) {
      assertTrue(output.isCont());
      assertFalse(output.isFull());
      assertFalse(output.isDone());
      assertFalse(output.isError());
      output.write(codeUnits[i] & 0xFF);
    }
    assertEquals(expected, output.getUnchecked());
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
