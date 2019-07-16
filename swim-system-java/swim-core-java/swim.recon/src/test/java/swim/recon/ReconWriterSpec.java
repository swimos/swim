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

package swim.recon;

import java.math.BigInteger;
import java.nio.charset.Charset;
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.codec.Binary;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;
import swim.codec.Writer;
import swim.structure.Attr;
import swim.structure.Bool;
import swim.structure.Data;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;

public class ReconWriterSpec {
  public static void assertWrites(Item item, byte... expected) {
    final int size = Recon.structureWriter().sizeOfItem(item);
    final int n = expected.length;
    if (size != n) {
      fail("expected " + n + " bytes, but found " + size + " bytes: " + Recon.toString(item));
    }
    for (int i = 0; i <= n; i += 1) {
      final byte[] actual = new byte[n];
      OutputBuffer<?> buffer = Binary.outputBuffer(actual);
      buffer = buffer.limit(i);
      Writer<?, ?> writer = Recon.write(item, Utf8.decodedOutput(buffer).isPart(true));
      buffer = buffer.limit(buffer.capacity());
      writer = writer.pull(Utf8.decodedOutput(buffer).isPart(false));
      if (writer.isError()) {
        throw new TestException(writer.trap());
      }
      assertFalse(writer.isCont());
      assertTrue(writer.isDone());
      assertEquals(actual, expected);
    }
  }

  public static void assertWrites(Item item, String expected) {
    assertWrites(item, expected.getBytes(Charset.forName("UTF-8")));
  }

  public static void assertWritesBlock(Item item, byte... expected) {
    final int size = Recon.structureWriter().sizeOfBlockItem(item);
    final int n = expected.length;
    if (size != n) {
      fail("expected " + n + " bytes, but found " + size + " bytes: " + Recon.toBlockString(item));
    }
    for (int i = 0; i <= n; i += 1) {
      final byte[] actual = new byte[n];
      OutputBuffer<?> buffer = Binary.outputBuffer(actual);
      buffer = buffer.limit(i);
      Writer<?, ?> writer = Recon.writeBlock(item, Utf8.decodedOutput(buffer).isPart(true));
      buffer = buffer.limit(buffer.capacity());
      writer = writer.pull(Utf8.decodedOutput(buffer).isPart(false));
      if (writer.isError()) {
        throw new TestException(writer.trap());
      }
      assertFalse(writer.isCont());
      assertTrue(writer.isDone());
      assertEquals(actual, expected);
    }
  }

  public static void assertWritesBlock(Item item, String expected) {
    assertWritesBlock(item, expected.getBytes(Charset.forName("UTF-8")));
  }

  @Test
  public void writeAbsent() {
    assertWrites(Value.absent(), "");
  }

  @Test
  public void writeExtant() {
    assertWrites(Value.extant(), "");
  }

  @Test
  public void writeEmptyRecords() {
    assertWrites(Record.empty(), "{}");
    assertWritesBlock(Record.empty(), "{}");
  }

  @Test
  public void writeUnaryRecords() {
    assertWrites(Record.of(1), "{1}");
    assertWritesBlock(Record.of(1), "1");
  }

  @Test
  public void writeNonEmptyRecords() {
    assertWrites(Record.of(1, 2, "3", true), "{1,2,\"3\",true}");
    assertWritesBlock(Record.of(1, 2, "3", true), "1,2,\"3\",true");
  }

  @Test
  public void writeNestedRecords() {
    assertWrites(Record.of(Record.of(1, 2), Record.of(3, 4)), "{{1,2},{3,4}}");
    assertWritesBlock(Record.of(Record.of(1, 2), Record.of(3, 4)), "{1,2},{3,4}");
  }

  @Test
  public void writeEmptyStrings() {
    assertWrites(Text.empty(), "\"\"");
  }

  @Test
  public void writeNonEmptyStrings() {
    assertWrites(Text.from("Hello, world!"), "\"Hello, world!\"");
  }

  @Test
  public void writeStringsWithEscapes() {
    assertWrites(Text.from("\"\\\b\f\n\r\t"), "\"\\\"\\\\\\b\\f\\n\\r\\t\"");
  }

  @Test
  public void writeIdentifiers() {
    assertWrites(Text.from("test"), "test");
  }

  @Test
  public void writeEmptyData() {
    assertWrites(Data.empty(), "%");
  }

  @Test
  public void writeNonEmptyData() {
    assertWrites(Data.fromBase64("AAAA"), "%AAAA");
    assertWrites(Data.fromBase64("AAA="), "%AAA=");
    assertWrites(Data.fromBase64("AA=="), "%AA==");
    assertWrites(Data.fromBase64("ABCDabcd12/+"), "%ABCDabcd12/+");
    assertWrites(Data.fromBase64("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+"),
                 "%ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+");
  }

  @Test
  public void writeDataValuesWithinRecords() {
    assertWrites(Record.of(Data.fromBase64("AAAA")), "{%AAAA}");
    assertWritesBlock(Record.of(Data.fromBase64("AAAA")), "%AAAA");
  }

  @Test
  public void writeNumbers() {
    assertWrites(Num.from(0), "0");
    assertWrites(Num.from(1), "1");
    assertWrites(Num.from(-1), "-1");
    assertWrites(Num.from(15), "15");
    assertWrites(Num.from(-20), "-20");
    assertWrites(Num.from(3.14), "3.14");
    assertWrites(Num.from(-0.5), "-0.5");
    assertWrites(Num.from(6.02E23), "6.02E23");
    assertWrites(Num.from(2147483647), "2147483647");
    assertWrites(Num.from(-2147483648), "-2147483648");
    assertWrites(Num.from(9223372036854775807L), "9223372036854775807");
    assertWrites(Num.from(-9223372036854775808L), "-9223372036854775808");
  }

  @Test
  public void writeUint32() {
    assertWrites(Num.uint32(0x00000000), "0x00000000");
    assertWrites(Num.uint32(0x00000001), "0x00000001");
    assertWrites(Num.uint32(0x00000010), "0x00000010");
    assertWrites(Num.uint32(0x00000100), "0x00000100");
    assertWrites(Num.uint32(0x00001000), "0x00001000");
    assertWrites(Num.uint32(0x00010000), "0x00010000");
    assertWrites(Num.uint32(0x00100000), "0x00100000");
    assertWrites(Num.uint32(0x01000000), "0x01000000");
    assertWrites(Num.uint32(0x10000000), "0x10000000");
    assertWrites(Num.uint32(0xffffffff), "0xffffffff");
    assertWrites(Num.uint32(0xfedcba98), "0xfedcba98");
    assertWrites(Num.uint32(0x01234567), "0x01234567");
  }

  @Test
  public void writeUint64() {
    assertWrites(Num.uint64(0x0000000000000000L), "0x0000000000000000");
    assertWrites(Num.uint64(0x0000000000000001L), "0x0000000000000001");
    assertWrites(Num.uint64(0x0000000000000010L), "0x0000000000000010");
    assertWrites(Num.uint64(0x0000000000000100L), "0x0000000000000100");
    assertWrites(Num.uint64(0x0000000000001000L), "0x0000000000001000");
    assertWrites(Num.uint64(0x0000000000010000L), "0x0000000000010000");
    assertWrites(Num.uint64(0x0000000000100000L), "0x0000000000100000");
    assertWrites(Num.uint64(0x0000000001000000L), "0x0000000001000000");
    assertWrites(Num.uint64(0x0000000010000000L), "0x0000000010000000");
    assertWrites(Num.uint64(0x0000000100000000L), "0x0000000100000000");
    assertWrites(Num.uint64(0x0000001000000000L), "0x0000001000000000");
    assertWrites(Num.uint64(0x0000010000000000L), "0x0000010000000000");
    assertWrites(Num.uint64(0x0000100000000000L), "0x0000100000000000");
    assertWrites(Num.uint64(0x0001000000000000L), "0x0001000000000000");
    assertWrites(Num.uint64(0x0010000000000000L), "0x0010000000000000");
    assertWrites(Num.uint64(0x0100000000000000L), "0x0100000000000000");
    assertWrites(Num.uint64(0x1000000000000000L), "0x1000000000000000");
    assertWrites(Num.uint64(0xffffffffffffffffL), "0xffffffffffffffff");
    assertWrites(Num.uint64(0xfedcba9876543210L), "0xfedcba9876543210");
    assertWrites(Num.uint64(0x0123456789abcdefL), "0x0123456789abcdef");
  }

  @Test
  public void writeBigIntegers() {
    assertWrites(Num.from(new BigInteger("9223372036854775808")), "9223372036854775808");
    assertWrites(Num.from(new BigInteger("-9223372036854775809")), "-9223372036854775809");
  }

  @Test
  public void writeBooleans() {
    assertWrites(Bool.from(true), "true");
    assertWrites(Bool.from(false), "false");
  }

  @Test
  public void writeExtantAttrs() {
    assertWrites(Record.of(Attr.of("answer")), "@answer");
  }

  @Test
  public void writeAttrsWithAbsentParams() {
    assertWrites(Record.of(Attr.of("answer", Value.absent())), "@answer()");
  }

  @Test
  public void writeAttrsWithQuotedNames() {
    assertWrites(Record.of(Attr.of("@at")), "@\"@at\"");
    assertWrites(Record.of(Attr.of("@at", Value.absent())), "@\"@at\"()");
  }

  @Test
  public void writeAttrsWithSingleParams() {
    assertWrites(Record.of(Attr.of("answer", Record.empty())), "@answer({})");
    assertWrites(Record.of(Attr.of("answer", "42")), "@answer(\"42\")");
    assertWrites(Record.of(Attr.of("answer", 42)), "@answer(42)");
    assertWrites(Record.of(Attr.of("answer", true)), "@answer(true)");
  }

  @Test
  public void writeAttrsWithMultipleParams() {
    assertWrites(Record.of(Attr.of("answer", Record.of(42, true))), "@answer(42,true)");
  }

  @Test
  public void writeAttrsWithNamedParams() {
    assertWrites(Record.of(Attr.of("answer", Record.of(Slot.of("number", 42)))), "@answer(number:42)");
  }

  @Test
  public void writeRecordsWithIdentKeyedSlots() {
    assertWrites(Record.of(Slot.of("a", 1)), "{a:1}");
    assertWrites(Record.of(Slot.of("a", 1), false, Slot.of("c", 3)), "{a:1,false,c:3}");
    assertWritesBlock(Record.of(Slot.of("a", 1)), "a:1");
    assertWritesBlock(Record.of(Slot.of("a", 1), false, Slot.of("c", 3)), "a:1,false,c:3");
  }

  @Test
  public void writeRecordsWithValueKeyedSlots() {
    assertWrites(Record.of(Slot.of(Num.from(1), "one"), Slot.of(Record.of(Attr.of("id"), "foo"), "bar")), "{1:one,@id foo:bar}");
    assertWritesBlock(Record.of(Slot.of(Num.from(1), "one"), Slot.of(Record.of(Attr.of("id"), "foo"), "bar")), "1:one,@id foo:bar");
  }

  @Test
  public void writeRecordsWithExtantSlots() {
    assertWrites(Record.of(Slot.of("blank")), "{blank:}");
    assertWritesBlock(Record.of(Slot.of("blank")), "blank:");
  }

  @Test
  public void writePrefixAttributedEmptyRecords() {
    assertWrites(Record.of(Attr.of("hello"), Record.empty()), "@hello{{}}");
  }

  @Test
  public void writePrefixAttributedNonEmptyText() {
    assertWrites(Record.of(Attr.of("hello"), "world!"), "@hello\"world!\"");
  }

  @Test
  public void writePrefixAttributedIdents() {
    assertWrites(Record.of(Attr.of("answer"), "test"), "@answer test");
  }

  @Test
  public void writePrefixAttributedNumbers() {
    assertWrites(Record.of(Attr.of("answer"), 42), "@answer 42");
  }

  @Test
  public void writePrefixAttributedSlots() {
    assertWrites(Record.of(Attr.of("hello"), Slot.of("subject", "world!")), "@hello{subject:\"world!\"}");
  }

  @Test
  public void writePostfixEmptyRecords() {
    assertWrites(Record.of(Record.empty(), Attr.of("signed")), "{{}}@signed");
  }

  @Test
  public void writePostfixAttributedEmptyText() {
    assertWrites(Record.of("", Attr.of("signed")), "\"\"@signed");
  }

  @Test
  public void writePostfixAttributedNonEmptyText() {
    assertWrites(Record.of("world!", Attr.of("signed")), "\"world!\"@signed");
  }

  @Test
  public void writePostfixAttributedIdents() {
    assertWrites(Record.of("test", Attr.of("signed")), "test@signed");
  }

  @Test
  public void writePostfixAttributedNumbers() {
    assertWrites(Record.of(42, Attr.of("signed")), "42@signed");
  }

  @Test
  public void writePostfixAttributedSlots() {
    assertWrites(Record.of(Slot.of("subject", "world!"), Attr.of("signed")), "{subject:\"world!\"}@signed");
  }

  @Test
  public void writeSingleValuesWithMultiplePostfixAttributes() {
    assertWrites(Record.of(6, Attr.of("months"), Attr.of("remaining")), "6@months@remaining");
  }

  @Test
  public void writeSingleValuesWithCircumfixAttributes() {
    assertWrites(Record.of(Attr.of("a"), Attr.of("b"), false, Attr.of("x"), Attr.of("y")), "@a@b false@x@y");
  }

  @Test
  public void writeSingleValuesWithInterspersedAttributes() {
    assertWrites(Record.of(Attr.of("a"), 1, Attr.of("b"), 2), "@a 1@b 2");
  }

  @Test
  public void writeSingleValuesWithInterspersedAttributeGroups() {
    assertWrites(Record.of(Attr.of("a"), Attr.of("b"), 1, Attr.of("c"), Attr.of("d"), 2), "@a@b 1@c@d 2");
  }

  @Test
  public void writeMultipleValuesWithMultiplePostfixAtributes() {
    assertWrites(Record.of(1, 2, Attr.of("x"), Attr.of("y")), "{1,2}@x@y");
  }

  @Test
  public void writeMultipleValuesWithMultipleCircumfixAtributes() {
    assertWrites(Record.of(Attr.of("a"), Attr.of("b"), 1, 2, Attr.of("x"), Attr.of("y")), "@a@b{1,2}@x@y");
  }

  @Test
  public void writeMultipleValuesWithMultipleInterspersedAtributes() {
    assertWrites(Record.of(Attr.of("a"), 1, 2, Attr.of("b"), 3, 4), "@a{1,2}@b{3,4}");
  }

  @Test
  public void writeMultipleValuesWithMultipleInterspersedAtributeGroups() {
    assertWrites(Record.of(Attr.of("a"), Attr.of("b"), 1, 2, Attr.of("c"), Attr.of("d"), 3, 4), "@a@b{1,2}@c@d{3,4}");
  }

  @Test
  public void writeSimpleMarkup() {
    assertWrites(Record.of("Hello, ", Record.of(Attr.of("em"), "world"), "!"), "[Hello, @em[world]!]");
    assertWrites(Record.of("Hello, ", Record.of(Attr.of("em", Record.of(Slot.of("class", "subject"))), "world"), "!"), "[Hello, @em(class:subject)[world]!]");
  }

  @Test
  public void writeNestedMarkup() {
    assertWrites(Record.of("X ", Record.of(Attr.of("p"), "Y ", Record.of(Attr.of("q"), "Z"), "."), "."), "[X @p[Y @q[Z].].]");
  }

  @Test
  public void writeMarkupWithNonPrefixAttributes() {
    assertWrites(Record.of("X ", Record.of(Attr.of("p"), "Y.", Attr.of("q")), "."), "[X {@p\"Y.\"@q}.]");
  }

  @Test
  public void writeMarkupInAttributeParameters() {
    assertWrites(Record.of(Attr.of("msg", Record.of("Hello, ", Record.of(Attr.of("em"), "world"), "!"))), "@msg([Hello, @em[world]!])");
  }

  @Test
  public void writeMarkupEmbeddedValues() {
    assertWrites(Record.of("Hello, ", 6), "[Hello, {6}]");
    assertWrites(Record.of("Hello, ", 6, "!"), "[Hello, {6}!]");
    assertWrites(Record.of("Hello, ", 6, 7, "!"), "[Hello, {6,7}!]");
  }

  @Test
  public void writeMarkupEmbeddedValuesWithSubsequentAttributes() {
    assertWrites(Record.of("Wait ", 1, Attr.of("second"), " longer", Record.of(Attr.of("please"))), "[Wait {1}]@second[ longer@please]");
    assertWrites(Record.of("Wait ", 1, 2, Attr.of("second"), " longer", Record.of(Attr.of("please"))), "[Wait {1,2}]@second[ longer@please]");
  }

  @Test
  public void writeMarkupEmbeddedRecords() {
    assertWrites(Record.of("Hello, ", Record.empty(), "!"), "[Hello, {{}}!]");
    assertWrites(Record.of("Hello, ", Record.of(1), "!"), "[Hello, {{1}}!]");
    assertWrites(Record.of("Hello, ", Record.of(1, 2), "!"), "[Hello, {{1,2}}!]");
  }

  @Test
  public void writeMarkupEmbeddedAttributedValues() {
    assertWrites(Record.of("Hello, ", Record.of(Attr.of("number"), 6), "!"), "[Hello, @number{6}!]");
  }

  @Test
  public void writeMarkupEmbeddedAttributedRecords() {
    assertWrites(Record.of("Hello, ", Record.of(Attr.of("choice"), "Earth", "Mars"), "!"), "[Hello, @choice{Earth,Mars}!]");
  }

  @Test
  public void writeMarkupEmbeddedAttributedRecordsWithNonPrefixAttributes() {
    assertWrites(Record.of("Hello, ", Record.of(1, Attr.of("second")), "!"), "[Hello, {1@second}!]");
  }
}
