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
import org.testng.annotations.Test;
import swim.codec.ParserException;
import swim.structure.Attr;
import swim.structure.Bool;
import swim.structure.Data;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import static org.testng.Assert.ThrowingRunnable;
import static org.testng.Assert.assertThrows;

public class ReconParserSpec {
  public static void assertParses(String recon, Value expected) {
    Assertions.assertParses(Recon.structureParser().blockParser(), recon, expected);
    Assertions.assertParses(Recon.structureParser().blockParser(), " " + recon + " ", expected);
  }

  public static void assertParseFails(final String recon) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        Recon.parse(recon);
      }
    });
  }

  @Test
  public void parseEmptyInput() {
    assertParses("", Value.absent());
  }

  @Test
  public void parseComments() {
    assertParses("#", Value.absent());
    assertParses("#comment", Value.absent());
    assertParses("#\n", Value.absent());
    assertParses("#comment\n", Value.absent());
  }

  @Test
  public void parseEmptyRecords() {
    assertParses("{}", Record.empty());
  }

  @Test
  public void parseNonEmptyRecords() {
    assertParses("{1,2,\"3\",true}", Record.of(1, 2, "3", true));
    assertParses("1,2,\"3\",true", Record.of(1, 2, "3", true));
  }

  @Test
  public void parseNestedRecords() {
    assertParses("{{1,2},{3,4}}", Record.of(Record.of(1, 2), Record.of(3, 4)));
    assertParses("{1,2},{3,4}", Record.of(Record.of(1, 2), Record.of(3, 4)));
  }

  @Test
  public void parseRecordsWithComments() {
    assertParses("{#comment\n}", Record.empty());
    assertParses("{#comment\n#comment\n}", Record.empty());
  }

  @Test
  public void parseEmptyData() {
    assertParses("%", Data.empty());
  }

  @Test
  public void parseNonEmptyData() {
    assertParses("%AAAA", Data.fromBase64("AAAA"));
    assertParses("%AAA=", Data.fromBase64("AAA="));
    assertParses("%AA==", Data.fromBase64("AA=="));
    assertParses("%ABCDabcd12/+", Data.fromBase64("ABCDabcd12/+"));
  }

  @Test
  public void parseEmptyMarkup() {
    assertParses("[]", Record.empty());
  }

  @Test
  public void parseEmptyStrings() {
    assertParses("\"\"", Text.empty());
    assertParses("''", Text.empty());
  }

  @Test
  public void parseNonEmptyStrings() {
    assertParses("\"test\"", Text.from("test"));
    assertParses("'test'", Text.from("test"));
  }

  @Test
  public void parseStringsWithEscapes() {
    assertParses("\"\\\"\\\\\\/\\@\\{\\}\\[\\]\\b\\f\\n\\r\\t\"", Text.from("\"\\/@{}[]\b\f\n\r\t"));
    assertParses("'\\\'\\\\\\/\\@\\{\\}\\[\\]\\b\\f\\n\\r\\t'", Text.from("'\\/@{}[]\b\f\n\r\t"));
  }

  @Test
  public void parseIdentifiers() {
    assertParses("test", Text.from("test"));
  }

  @Test
  public void parseUnicodeIdentifiers() {
    assertParses("À", Text.from("À")); // U+C0
    assertParses("Ö", Text.from("Ö")); // U+D6
    assertParses("Ø", Text.from("Ø")); // U+D8
    assertParses("ö", Text.from("ö")); // U+F6
    assertParses("ø", Text.from("ø")); // U+F8
    assertParses("˿", Text.from("˿")); // U+2FF
    assertParses("Ͱ", Text.from("Ͱ")); // U+370
    assertParses("ͽ", Text.from("ͽ")); // U+37D
    assertParses("Ϳ", Text.from("Ϳ")); // U+37F
    assertParses("῿", Text.from("῿")); // U+1FFF
    assertParses("⁰", Text.from("⁰")); // U+2070
    assertParses("↏", Text.from("↏")); // U+218F
    assertParses("Ⰰ", Text.from("Ⰰ")); // U+2C00
    assertParses("⿯", Text.from("⿯")); // U+2FEF
    assertParses("、", Text.from("、")); // U+3001
    assertParses("퟿", Text.from("퟿")); // U+D7FF
    assertParses("豈", Text.from("豈")); // U+F900
    assertParses("﷏", Text.from("﷏")); // U+FDCF
    assertParses("ﷰ", Text.from("ﷰ")); // U+FDF0
    //assertParses("𐀀", Text.from("𐀀")); // U+10000
    //assertParses("󯿿", Text.from("󯿿")); // U+EFFFF

    assertParses("_À", Text.from("_À")); // U+C0
    assertParses("_Ö", Text.from("_Ö")); // U+D6
    assertParses("_Ø", Text.from("_Ø")); // U+D8
    assertParses("_ö", Text.from("_ö")); // U+F6
    assertParses("_ø", Text.from("_ø")); // U+F8
    assertParses("_˿", Text.from("_˿")); // U+2FF
    assertParses("_Ͱ", Text.from("_Ͱ")); // U+370
    assertParses("_ͽ", Text.from("_ͽ")); // U+37D
    assertParses("_Ϳ", Text.from("_Ϳ")); // U+37F
    assertParses("_῿", Text.from("_῿")); // U+1FFF
    assertParses("_⁰", Text.from("_⁰")); // U+2070
    assertParses("_↏", Text.from("_↏")); // U+218F
    assertParses("_Ⰰ", Text.from("_Ⰰ")); // U+2C00
    assertParses("_⿯", Text.from("_⿯")); // U+2FEF
    assertParses("_、", Text.from("_、")); // U+3001
    assertParses("_퟿", Text.from("_퟿")); // U+D7FF
    assertParses("_豈", Text.from("_豈")); // U+F900
    assertParses("_﷏", Text.from("_﷏")); // U+FDCF
    assertParses("_ﷰ", Text.from("_ﷰ")); // U+FDF0
    //assertParses("_𐀀", Text.from("_𐀀")); // U+10000
    //assertParses("_󯿿", Text.from("_󯿿")); // U+EFFFF
  }

  @Test
  public void parsePositiveIntegers() {
    assertParses("0", Num.from(0));
    assertParses("1", Num.from(1));
    assertParses("5", Num.from(5));
    assertParses("10", Num.from(10));
    assertParses("11", Num.from(11));
    assertParses("15", Num.from(15));
    assertParses("2147483647", Num.from(2147483647));
    assertParses("9223372036854775807", Num.from(9223372036854775807L));
  }

  @Test
  public void parseNegativeIntegers() {
    assertParses("-0", Num.from(-0));
    assertParses("-1", Num.from(-1));
    assertParses("-5", Num.from(-5));
    assertParses("-10", Num.from(-10));
    assertParses("-11", Num.from(-11));
    assertParses("-15", Num.from(-15));
    assertParses("-2147483648", Num.from(-2147483648));
    assertParses("-9223372036854775808", Num.from(-9223372036854775808L));
  }

  @Test
  public void parsePositiveDecimals() {
    assertParses("0.0", Num.from(0.0));
    assertParses("0.5", Num.from(0.5));
    assertParses("1.0", Num.from(1.0));
    assertParses("1.5", Num.from(1.5));
    assertParses("1.05", Num.from(1.05));
    assertParses("10.0", Num.from(10.0));
    assertParses("10.5", Num.from(10.5));
  }

  @Test
  public void parseNegativeDecimals() {
    assertParses("-0.0", Num.from(-0.0));
    assertParses("-0.5", Num.from(-0.5));
    assertParses("-1.0", Num.from(-1.0));
    assertParses("-1.5", Num.from(-1.5));
    assertParses("-1.05", Num.from(-1.05));
    assertParses("-10.0", Num.from(-10.0));
    assertParses("-10.5", Num.from(-10.5));
  }

  @Test
  public void parsePositiveDecimalsWithExponents() {
    assertParses("4e0", Num.from(4e0));
    assertParses("4E0", Num.from(4E0));
    assertParses("4e1", Num.from(4e1));
    assertParses("4E1", Num.from(4E1));
    assertParses("4e2", Num.from(4e2));
    assertParses("4E2", Num.from(4E2));
    assertParses("4e+0", Num.from(4e+0));
    assertParses("4E+0", Num.from(4E+0));
    assertParses("4e-0", Num.from(4e-0));
    assertParses("4E-0", Num.from(4E-0));
    assertParses("4e+1", Num.from(4e+1));
    assertParses("4E+1", Num.from(4E+1));
    assertParses("4e-1", Num.from(4e-1));
    assertParses("4E-1", Num.from(4E-1));
    assertParses("4e+2", Num.from(4e+2));
    assertParses("4E+2", Num.from(4E+2));
    assertParses("4e-2", Num.from(4e-2));
    assertParses("4E-2", Num.from(4E-2));
    assertParses("4.0e2", Num.from(4.0e2));
    assertParses("4.0E2", Num.from(4.0E2));
    assertParses("4.0e+2", Num.from(4.0e+2));
    assertParses("4.0E+2", Num.from(4.0E+2));
    assertParses("4.0e-2", Num.from(4.0e-2));
    assertParses("4.0E-2", Num.from(4.0E-2));
    assertParses("1.17549435e-38", Num.from(1.17549435e-38)); // Float.MIN_VALUE
    assertParses("3.4028235e38", Num.from(3.4028235e38)); // Float.MAX_VALUE
    assertParses("1.17549435e-38", Num.from(1.17549435e-38)); // Float.MIN_NORMAL
    assertParses("4.9e-324", Num.from(4.9e-324)); // Double.MIN_VALUE
    assertParses("1.7976931348623157e308", Num.from(1.7976931348623157e308)); // Double.MAX_VALUE
    assertParses("2.2250738585072014e-308", Num.from(2.2250738585072014e-308)); // Double.MIN_NORMAL
  }

  @Test
  public void parseNegativeDecimalsWithExponents() {
    assertParses("-4e0", Num.from(-4e0));
    assertParses("-4E0", Num.from(-4E0));
    assertParses("-4e1", Num.from(-4e1));
    assertParses("-4E1", Num.from(-4E1));
    assertParses("-4e2", Num.from(-4e2));
    assertParses("-4E2", Num.from(-4E2));
    assertParses("-4e+0", Num.from(-4e+0));
    assertParses("-4E+0", Num.from(-4E+0));
    assertParses("-4e-0", Num.from(-4e-0));
    assertParses("-4E-0", Num.from(-4E-0));
    assertParses("-4e+1", Num.from(-4e+1));
    assertParses("-4E+1", Num.from(-4E+1));
    assertParses("-4e-1", Num.from(-4e-1));
    assertParses("-4E-1", Num.from(-4E-1));
    assertParses("-4e+2", Num.from(-4e+2));
    assertParses("-4E+2", Num.from(-4E+2));
    assertParses("-4e-2", Num.from(-4e-2));
    assertParses("-4E-2", Num.from(-4E-2));
    assertParses("-4.0e2", Num.from(-4.0e2));
    assertParses("-4.0E2", Num.from(-4.0E2));
    assertParses("-4.0e+2", Num.from(-4.0e+2));
    assertParses("-4.0E+2", Num.from(-4.0E+2));
    assertParses("-4.0e-2", Num.from(-4.0e-2));
    assertParses("-4.0E-2", Num.from(-4.0E-2));
    assertParses("-4.0e02", Num.from(-4.0e2));
    assertParses("-4.0E02", Num.from(-4.0E2));
    assertParses("-4.0e+02", Num.from(-4.0e+2));
    assertParses("-4.0E+02", Num.from(-4.0E+2));
    assertParses("-4.0e-02", Num.from(-4.0e-2));
    assertParses("-4.0E-02", Num.from(-4.0E-2));
  }

  @Test
  public void parseUint32s() {
    assertParses("0x0", Num.uint32(0x0));

    assertParses("0x00000001", Num.uint32(0x00000001));
    assertParses("0x00000010", Num.uint32(0x00000010));
    assertParses("0x00000100", Num.uint32(0x00000100));
    assertParses("0x00001000", Num.uint32(0x00001000));
    assertParses("0x00010000", Num.uint32(0x00010000));
    assertParses("0x00100000", Num.uint32(0x00100000));
    assertParses("0x01000000", Num.uint32(0x01000000));
    assertParses("0x10000000", Num.uint32(0x10000000));
    assertParses("0xFFFFFFFF", Num.uint32(0xFFFFFFFF));
    assertParses("0xFEDCBA98", Num.uint32(0xFEDCBA98));
    assertParses("0x01234567", Num.uint32(0x01234567));
  }

  @Test
  public void parseUint64s() {
    assertParses("0x0000000000000001", Num.uint64(0x0000000000000001L));
    assertParses("0x0000000000000010", Num.uint64(0x0000000000000010L));
    assertParses("0x0000000000000100", Num.uint64(0x0000000000000100L));
    assertParses("0x0000000000001000", Num.uint64(0x0000000000001000L));
    assertParses("0x0000000000010000", Num.uint64(0x0000000000010000L));
    assertParses("0x0000000000100000", Num.uint64(0x0000000000100000L));
    assertParses("0x0000000001000000", Num.uint64(0x0000000001000000L));
    assertParses("0x0000000010000000", Num.uint64(0x0000000010000000L));
    assertParses("0x0000000100000000", Num.uint64(0x0000000100000000L));
    assertParses("0x0000001000000000", Num.uint64(0x0000001000000000L));
    assertParses("0x0000010000000000", Num.uint64(0x0000010000000000L));
    assertParses("0x0000100000000000", Num.uint64(0x0000100000000000L));
    assertParses("0x0001000000000000", Num.uint64(0x0001000000000000L));
    assertParses("0x0010000000000000", Num.uint64(0x0010000000000000L));
    assertParses("0x0100000000000000", Num.uint64(0x0100000000000000L));
    assertParses("0x1000000000000000", Num.uint64(0x1000000000000000L));
    assertParses("0xFFFFFFFFFFFFFFFF", Num.uint64(0xFFFFFFFFFFFFFFFFL));
    assertParses("0xFEDCBA9876543210", Num.uint64(0xFEDCBA9876543210L));
    assertParses("0x0123456789ABCDEF", Num.uint64(0x0123456789ABCDEFL));
  }

  @Test
  public void parseBigIntegers() {
    assertParses("9223372036854775808", Num.from(new BigInteger("9223372036854775808")));
    assertParses("-9223372036854775809", Num.from(new BigInteger("-9223372036854775809")));
  }

  @Test
  public void parseBooleans() {
    assertParses("true", Bool.from(true));
    assertParses("false", Bool.from(false));
  }

  @Test
  public void parseSingleValuesWithTrailingCommas() {
    assertParses("1,", Num.from(1));
  }

  @Test
  public void parseSingleValuesWithTrailingSemicolons() {
    assertParses("1;", Num.from(1));
  }

  @Test
  public void parseMultipleCommaSeparatedItems() {
    assertParses("  1, 2,3 ,4  ", Record.of(1, 2, 3, 4));
    assertParses("{1, 2,3 ,4 }", Record.of(1, 2, 3, 4));
  }

  @Test
  public void parseMultipleSemicolonSeparatedItems() {
    assertParses("  1; 2;3 ;4  ", Record.of(1, 2, 3, 4));
    assertParses("{1; 2;3 ;4 }", Record.of(1, 2, 3, 4));
  }

  @Test
  public void parseMultipleItemsWithTrailingCommas() {
    assertParses("  1, 2,3 ,4,  ", Record.of(1, 2, 3, 4));
    assertParses("{1, 2,3 ,4, }", Record.of(1, 2, 3, 4));
  }

  @Test
  public void parseMultipleItemsWithTrailingSemicolons() {
    assertParses("  1, 2,3 ,4;  ", Record.of(1, 2, 3, 4));
    assertParses("{1, 2,3 ,4; }", Record.of(1, 2, 3, 4));
  }

  @Test
  public void parseMultipleNewlineSeparatedItems() {
    assertParses(" 1\n 2\n3 \n4  ", Record.of(1, 2, 3, 4));
    assertParses("{1\n 2\n3 \n4  }", Record.of(1, 2, 3, 4));
  }

  @Test
  public void parseMultipleItemsWithMixedSeparators() {
    assertParses(" 1, 2\n3 \n4; 5   ", Record.of(1, 2, 3, 4, 5));
    assertParses("{1, 2\n3 \n4; 5  }", Record.of(1, 2, 3, 4, 5));
  }

  @Test
  public void parseMultipleCommaNewlineSeparatedItems() {
    assertParses(" \n 1,\n 2,\n3 \n ", Record.of(1, 2, 3));
    assertParses("{\n 1,\n 2,\n3 \n}", Record.of(1, 2, 3));
  }

  @Test
  public void parseMultipleSemicolonNewlineSeparatedItems() {
    assertParses(" \n 1;\n 2;\n3 \n ", Record.of(1, 2, 3));
    assertParses("{\n 1;\n 2;\n3 \n}", Record.of(1, 2, 3));
  }

  @Test
  public void parseHeterogeneousTopLevelItemsAsRecord() {
    assertParses("  extant:\n  record: {}\n  markup: []\n  \"\"\n  %AA==\n  integer: 0\n  decimal: 0.0\n  true\n  false\n",
        Record.of(Slot.of("extant"), Slot.of("record", Record.empty()), Slot.of("markup", Record.empty()), "", Data.fromBase64("AA=="),
            Slot.of("integer", 0), Slot.of("decimal", 0.0), true, false));
  }

  @Test
  public void parseHeterogeneousItemsInRecord() {
    assertParses("{\n  extant:\n  record: {}\n  markup: []\n  \"\"\n  %AA==\n  integer: 0\n  decimal: 0.0\n  true\n  false\n}",
        Record.of(Slot.of("extant"), Slot.of("record", Record.empty()), Slot.of("markup", Record.empty()), "", Data.fromBase64("AA=="),
            Slot.of("integer", 0), Slot.of("decimal", 0.0), true, false));
  }

  @Test
  public void parseLeadingComments() {
    assertParses("#comment\ntest", Text.from("test"));
  }

  @Test
  public void parseLeadingCommentsInBlocks() {
    assertParses("#comment\n1\n#comment\n2", Record.of(1, 2));
  }

  @Test
  public void parseLeadingCommentsInRecords() {
    assertParses("{#comment\n1\n#comment\n2}", Record.of(1, 2));
  }

  @Test
  public void parseTrailingComments() {
    assertParses("test#comment", Text.from("test"));
  }

  @Test
  public void parseTrailingCommentsInBlocks() {
    assertParses("1#comment\n2#comment", Record.of(1, 2));
  }

  @Test
  public void parseTrailingCommentsInRecords() {
    assertParses("{1#comment\n2#comment\n}", Record.of(1, 2));
  }

  @Test
  public void parseSingleExtantAttributesWithNoParameters() {
    assertParses("@test", Record.of(Attr.of("test")));
  }

  @Test
  public void parseSingleExtantAttributesWithEmptyParameters() {
    assertParses("@test()", Record.of(Attr.of("test")));
  }

  @Test
  public void parseQuotedAttributeNames() {
    assertParses("@\"test\"", Record.of(Attr.of("test")));
    assertParses("@\"test\"()", Record.of(Attr.of("test")));
    assertParses("@\"@at\"", Record.of(Attr.of("@at")));
    assertParses("@\"@at\"()", Record.of(Attr.of("@at")));
  }

  @Test
  public void parseSingleExtantAttributesWithSingleParameters() {
    assertParses("@hello()", Record.of(Attr.of("hello")));
    assertParses("@hello([world])", Record.of(Attr.of("hello", Record.of("world"))));
    assertParses("@hello(\"world\")", Record.of(Attr.of("hello", "world")));
    assertParses("@hello(42)", Record.of(Attr.of("hello", 42)));
  }

  @Test
  public void parseSingleExtantAttributesWithMultipleParameters() {
    assertParses("@hello(\"world\", %AA==, 42, true)", Record.of(Attr.of("hello", Record.of("world", Data.fromBase64("AA=="), 42, true))));
    assertParses("@hello(\"world\"; %AA==; 42; true)", Record.of(Attr.of("hello", Record.of("world", Data.fromBase64("AA=="), 42, true))));
    assertParses("@hello(\"world\"\n%AA==\n42\ntrue)", Record.of(Attr.of("hello", Record.of("world", Data.fromBase64("AA=="), 42, true))));
  }

  @Test
  public void parseSingleExtantAttributesWithNamedParameters() {
    assertParses("@hello(name: \"world\")", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world")))));
    assertParses("@hello(name: \"world\", data: %AA==, number: 42, false)",
        Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"), Slot.of("data", Data.fromBase64("AA==")), Slot.of("number", 42), false))));
  }

  @Test
  public void parseMultipleExtantAttributesWithNoParameters() {
    assertParses("@a@b", Record.of(Attr.of("a"), Attr.of("b")));
    assertParses("@a @b", Record.of(Attr.of("a"), Attr.of("b")));
  }

  @Test
  public void parseMultipleExtantAttributesWithEmptyParameters() {
    assertParses("@a()@b()", Record.of(Attr.of("a"), Attr.of("b")));
    assertParses("@a() @b()", Record.of(Attr.of("a"), Attr.of("b")));
  }

  @Test
  public void parseMultipleExtantAttributesWithSingleParameters() {
    assertParses("@a({})@b([])", Record.of(Attr.of("a", Record.empty()), Attr.of("b", Record.empty())));
    assertParses("@a(\"test\") @b(42)", Record.of(Attr.of("a", "test"), Attr.of("b", 42)));
    assertParses("@a(true) @b(false)", Record.of(Attr.of("a", Bool.from(true)), Attr.of("b", Bool.from(false))));
  }

  @Test
  public void parseMultipleExtantAttributesWithComplexParameters() {
    assertParses("@hello(\"world\", 42) @test(name: \"parse\", pending: false)",
        Record.of(Attr.of("hello", Record.of("world", 42)), Attr.of("test", Record.of(Slot.of("name", "parse"), Slot.of("pending", Bool.from(false))))));
  }

  @Test
  public void parsePrefixAttributedEmptyRecords() {
    assertParses("@hello {}", Record.of(Attr.of("hello")));
    assertParses("@hello() {}", Record.of(Attr.of("hello")));
    assertParses("@hello(\"world\") {}", Record.of(Attr.of("hello", "world")));
    assertParses("@hello(name: \"world\") {}", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world")))));
  }

  @Test
  public void parsePrefixAttributedNonEmptyRecords() {
    assertParses("@hello { {}, [] }", Record.of(Attr.of("hello"), Record.empty(), Record.empty()));
    assertParses("@hello() { \"world\", 42 }", Record.of(Attr.of("hello"), "world", 42));
    assertParses("@hello(\"world\") { number: 42, true }", Record.of(Attr.of("hello", "world"), Slot.of("number", 42), true));
    assertParses("@hello(name: \"world\") { {1,2} }", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), Record.of(1, 2)));
  }

  @Test
  public void parsePrefixAttributedEmptyMarkup() {
    assertParses("@hello []", Record.of(Attr.of("hello")));
    assertParses("@hello() []", Record.of(Attr.of("hello")));
    assertParses("@hello(\"world\") []", Record.of(Attr.of("hello", "world")));
    assertParses("@hello(name: \"world\") []", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world")))));
  }

  @Test
  public void parsePrefixAttributedNonEmptyMarkup() {
    assertParses("@hello [test]", Record.of(Attr.of("hello"), "test"));
    assertParses("@hello() [test]", Record.of(Attr.of("hello"), "test"));
    assertParses("@hello(\"world\") [test]", Record.of(Attr.of("hello", "world"), "test"));
    assertParses("@hello(name: \"world\") [test]", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), "test"));
  }

  @Test
  public void parsePrefixAttributedEmptyStrings() {
    assertParses("@hello \"\"", Record.of(Attr.of("hello"), ""));
    assertParses("@hello() \"\"", Record.of(Attr.of("hello"), ""));
    assertParses("@hello(\"world\") \"\"", Record.of(Attr.of("hello", "world"), ""));
    assertParses("@hello(name: \"world\") \"\"", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), ""));

    assertParses("@hello ''", Record.of(Attr.of("hello"), ""));
    assertParses("@hello() ''", Record.of(Attr.of("hello"), ""));
    assertParses("@hello('world') ''", Record.of(Attr.of("hello", "world"), ""));
    assertParses("@hello(name: 'world') ''", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), ""));
  }

  @Test
  public void parsePrefixAttributedNonEmptyStrings() {
    assertParses("@hello \"test\"", Record.of(Attr.of("hello"), "test"));
    assertParses("@hello() \"test\"", Record.of(Attr.of("hello"), "test"));
    assertParses("@hello(\"world\") \"test\"", Record.of(Attr.of("hello", "world"), "test"));
    assertParses("@hello(name: \"world\") \"test\"", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), "test"));

    assertParses("@hello 'test'", Record.of(Attr.of("hello"), "test"));
    assertParses("@hello() 'test'", Record.of(Attr.of("hello"), "test"));
    assertParses("@hello('world') 'test'", Record.of(Attr.of("hello", "world"), "test"));
    assertParses("@hello(name: 'world') 'test'", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), "test"));
  }

  @Test
  public void parsePrefixAttributedEmptyData() {
    assertParses("@hello %", Record.of(Attr.of("hello"), Data.empty()));
    assertParses("@hello() %", Record.of(Attr.of("hello"), Data.empty()));
    assertParses("@hello(\"world\") %", Record.of(Attr.of("hello", "world"), Data.empty()));
    assertParses("@hello(name: \"world\") %", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), Data.empty()));
  }

  @Test
  public void parsePrefixAttributedNonEmptyData() {
    assertParses("@hello %AA==", Record.of(Attr.of("hello"), Data.fromBase64("AA==")));
    assertParses("@hello() %AAA=", Record.of(Attr.of("hello"), Data.fromBase64("AAA=")));
    assertParses("@hello(\"world\") %AAAA", Record.of(Attr.of("hello", "world"), Data.fromBase64("AAAA")));
    assertParses("@hello(name: \"world\") %ABCDabcd12+/", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), Data.fromBase64("ABCDabcd12+/")));
  }

  @Test
  public void parsePrefixAttributedNumbers() {
    assertParses("@hello 42", Record.of(Attr.of("hello"), 42));
    assertParses("@hello() -42", Record.of(Attr.of("hello"), -42));
    assertParses("@hello(\"world\") 42.0", Record.of(Attr.of("hello", "world"), 42.0));
    assertParses("@hello(name: \"world\") -42.0", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), -42.0));
  }

  @Test
  public void parsePrefixAttributedBooleans() {
    assertParses("@hello true", Record.of(Attr.of("hello"), true));
    assertParses("@hello() false", Record.of(Attr.of("hello"), false));
    assertParses("@hello(\"world\") true", Record.of(Attr.of("hello", "world"), true));
    assertParses("@hello(name: \"world\") false", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), false));
  }

  @Test
  public void parsePostfixAttributedEmptyRecords() {
    assertParses("{} @signed", Record.of(Attr.of("signed")));
    assertParses("{} @signed()", Record.of(Attr.of("signed")));
    assertParses("{} @signed(\"me\")", Record.of(Attr.of("signed", "me")));
    assertParses("{} @signed(by: \"me\")", Record.of(Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  public void parsePostfixAttributedNonEmptyRecords() {
    assertParses("{ {}, [] } @signed", Record.of(Record.empty(), Record.empty(), Attr.of("signed")));
    assertParses("{ \"world\", 42 } @signed()", Record.of("world", 42, Attr.of("signed")));
    assertParses("{ number: 42, true } @signed(\"me\")", Record.of(Slot.of("number", 42), true, Attr.of("signed", "me")));
    assertParses("{ {1,2} } @signed(by: \"me\")", Record.of(Record.of(1, 2), Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  public void parsePostfixAttributedEmptyMarkup() {
    assertParses("[] @signed", Record.of(Attr.of("signed")));
    assertParses("[] @signed()", Record.of(Attr.of("signed")));
    assertParses("[] @signed(\"me\")", Record.of(Attr.of("signed", "me")));
    assertParses("[] @signed(by: \"me\")", Record.of(Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  public void parsePostfixAttributedNonEmptyMarkup() {
    assertParses("[test] @signed", Record.of("test", Attr.of("signed")));
    assertParses("[test] @signed()", Record.of("test", Attr.of("signed")));
    assertParses("[test] @signed(\"me\")", Record.of("test", Attr.of("signed", "me")));
    assertParses("[test] @signed(by: \"me\")", Record.of("test", Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  public void parsePostfixAttributedEmptyStrings() {
    assertParses("\"\" @signed", Record.of("", Attr.of("signed")));
    assertParses("\"\" @signed()", Record.of("", Attr.of("signed")));
    assertParses("\"\" @signed(\"me\")", Record.of("", Attr.of("signed", "me")));
    assertParses("\"\" @signed(by: \"me\")", Record.of("", Attr.of("signed", Record.of(Slot.of("by", "me")))));

    assertParses("'' @signed", Record.of("", Attr.of("signed")));
    assertParses("'' @signed()", Record.of("", Attr.of("signed")));
    assertParses("'' @signed('me')", Record.of("", Attr.of("signed", "me")));
    assertParses("'' @signed(by: 'me')", Record.of("", Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  public void parsePostfixAttributedNonEmptyStrings() {
    assertParses("\"test\" @signed", Record.of("test", Attr.of("signed")));
    assertParses("\"test\" @signed()", Record.of("test", Attr.of("signed")));
    assertParses("\"test\" @signed(\"me\")", Record.of("test", Attr.of("signed", "me")));
    assertParses("\"test\" @signed(by: \"me\")", Record.of("test", Attr.of("signed", Record.of(Slot.of("by", "me")))));

    assertParses("'test' @signed", Record.of("test", Attr.of("signed")));
    assertParses("'test' @signed()", Record.of("test", Attr.of("signed")));
    assertParses("'test' @signed('me')", Record.of("test", Attr.of("signed", "me")));
    assertParses("'test' @signed(by: 'me')", Record.of("test", Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  public void parsePostfixAttributedEmptyData() {
    assertParses("% @signed", Record.of(Data.empty(), Attr.of("signed")));
    assertParses("% @signed()", Record.of(Data.empty(), Attr.of("signed")));
    assertParses("% @signed(\"me\")", Record.of(Data.empty(), Attr.of("signed", "me")));
    assertParses("% @signed(by: \"me\")", Record.of(Data.empty(), Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  public void parsePostfixAttributedNonEmptyData() {
    assertParses("%AA== @signed", Record.of(Data.fromBase64("AA=="), Attr.of("signed")));
    assertParses("%AAA= @signed()", Record.of(Data.fromBase64("AAA="), Attr.of("signed")));
    assertParses("%AAAA @signed(\"me\")", Record.of(Data.fromBase64("AAAA"), Attr.of("signed", "me")));
    assertParses("%ABCDabcd12+/ @signed(by: \"me\")", Record.of(Data.fromBase64("ABCDabcd12+/"), Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  public void parsePostfixAttributeNumbers() {
    assertParses("42 @signed", Record.of(42, Attr.of("signed")));
    assertParses("-42 @signed()", Record.of(-42, Attr.of("signed")));
    assertParses("42.0 @signed(\"me\")", Record.of(42.0, Attr.of("signed", "me")));
    assertParses("-42.0 @signed(by: \"me\")", Record.of(-42.0, Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  public void parsePostfixAttributeBooleans() {
    assertParses("true @signed", Record.of(true, Attr.of("signed")));
    assertParses("false @signed()", Record.of(false, Attr.of("signed")));
    assertParses("true @signed(\"me\")", Record.of(true, Attr.of("signed", "me")));
    assertParses("false @signed(by: \"me\")", Record.of(false, Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  public void parseInfixAttributedEmptyRecords() {
    assertParses("{}@hello{}", Record.of(Attr.of("hello")));
    assertParses("{}@hello(){}", Record.of(Attr.of("hello")));
    assertParses("{}@hello(\"world\"){}", Record.of(Attr.of("hello", "world")));
    assertParses("{}@hello(name: \"world\"){}", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world")))));
  }

  @Test
  public void parseInfixAttributedNonEmptyRecords() {
    assertParses("{{}}@hello{[]}", Record.of(Record.empty(), Attr.of("hello"), Record.empty()));
    assertParses("{42}@hello(){\"world\"}", Record.of(42, Attr.of("hello"), "world"));
    assertParses("{number: 42}@hello(\"world\"){true}", Record.of(Slot.of("number", 42), Attr.of("hello", "world"), true));
    assertParses("{{1,2}}@hello(name: \"world\"){{3,4}}", Record.of(Record.of(1, 2), Attr.of("hello", Record.of(Slot.of("name", "world"))), Record.of(3, 4)));
  }

  @Test
  public void parseInfixAttributedEmptyMarkup() {
    assertParses("[]@hello[]", Record.of(Attr.of("hello")));
    assertParses("[]@hello()[]", Record.of(Attr.of("hello")));
    assertParses("[]@hello(\"world\")[]", Record.of(Attr.of("hello", "world")));
    assertParses("[]@hello(name: \"world\")[]", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world")))));
  }

  @Test
  public void parseInfixAttributedNonEmptyMarkup() {
    assertParses("[a]@hello[test]", Record.of("a", Attr.of("hello"), "test"));
    assertParses("[a]@hello()[test]", Record.of("a", Attr.of("hello"), "test"));
    assertParses("[a]@hello(\"world\")[test]", Record.of("a", Attr.of("hello", "world"), "test"));
    assertParses("[a]@hello(name: \"world\")[test]", Record.of("a", Attr.of("hello", Record.of(Slot.of("name", "world"))), "test"));
  }

  @Test
  public void parseInfixAttributedEmptyStrings() {
    assertParses("\"\"@hello\"\"", Record.of("", Attr.of("hello"), ""));
    assertParses("\"\"@hello()\"\"", Record.of("", Attr.of("hello"), ""));
    assertParses("\"\"@hello(\"world\")\"\"", Record.of("", Attr.of("hello", "world"), ""));
    assertParses("\"\"@hello(name: \"world\")\"\"", Record.of("", Attr.of("hello", Record.of(Slot.of("name", "world"))), ""));

    assertParses("''@hello''", Record.of("", Attr.of("hello"), ""));
    assertParses("''@hello()''", Record.of("", Attr.of("hello"), ""));
    assertParses("''@hello('world')''", Record.of("", Attr.of("hello", "world"), ""));
    assertParses("''@hello(name: 'world')''", Record.of("", Attr.of("hello", Record.of(Slot.of("name", "world"))), ""));
  }

  @Test
  public void parseInfixAttributedNonEmptyStrings() {
    assertParses("\"a\"@hello\"test\"", Record.of("a", Attr.of("hello"), "test"));
    assertParses("\"a\"@hello()\"test\"", Record.of("a", Attr.of("hello"), "test"));
    assertParses("\"a\"@hello(\"world\")\"test\"", Record.of("a", Attr.of("hello", "world"), "test"));
    assertParses("\"a\"@hello(name: \"world\")\"test\"", Record.of("a", Attr.of("hello", Record.of(Slot.of("name", "world"))), "test"));

    assertParses("'a'@hello'test'", Record.of("a", Attr.of("hello"), "test"));
    assertParses("'a'@hello()'test'", Record.of("a", Attr.of("hello"), "test"));
    assertParses("'a'@hello('world')'test'", Record.of("a", Attr.of("hello", "world"), "test"));
    assertParses("'a'@hello(name: 'world')'test'", Record.of("a", Attr.of("hello", Record.of(Slot.of("name", "world"))), "test"));
  }

  @Test
  public void parseInfixAttributedEmptyData() {
    assertParses("%@hello%", Record.of(Data.empty(), Attr.of("hello"), Data.empty()));
    assertParses("%@hello()%", Record.of(Data.empty(), Attr.of("hello"), Data.empty()));
    assertParses("%@hello(\"world\")%", Record.of(Data.empty(), Attr.of("hello", "world"), Data.empty()));
    assertParses("%@hello(name: \"world\")%", Record.of(Data.empty(), Attr.of("hello", Record.of(Slot.of("name", "world"))), Data.empty()));
  }

  @Test
  public void parseInfixAttributedNonEmptyData() {
    assertParses("%AA==@hello%BB==", Record.of(Data.fromBase64("AA=="), Attr.of("hello"), Data.fromBase64("BB==")));
    assertParses("%AAA=@hello()%BBB=", Record.of(Data.fromBase64("AAA="), Attr.of("hello"), Data.fromBase64("BBB=")));
    assertParses("%AAAA@hello(\"world\")%BBBB", Record.of(Data.fromBase64("AAAA"), Attr.of("hello", "world"), Data.fromBase64("BBBB")));
    assertParses("%ABCDabcd12+/@hello(name: \"world\")%/+21dcbaDCBA", Record.of(Data.fromBase64("ABCDabcd12+/"),
        Attr.of("hello", Record.of(Slot.of("name", "world"))), Data.fromBase64("/+21dcbaDCBA")));
  }

  @Test
  public void parseInfixAttributedNumbers() {
    assertParses("2@hello 42", Record.of(2, Attr.of("hello"), 42));
    assertParses("-2@hello()-42", Record.of(-2, Attr.of("hello"), -42));
    assertParses("2.0@hello(\"world\")42.0", Record.of(2.0, Attr.of("hello", "world"), 42.0));
    assertParses("-2.0@hello(name: \"world\")-42.0", Record.of(-2.0, Attr.of("hello", Record.of(Slot.of("name", "world"))), -42.0));
  }

  @Test
  public void parseInfixAttributedBooleans() {
    assertParses("true@hello true", Record.of(true, Attr.of("hello"), true));
    assertParses("false@hello()false", Record.of(false, Attr.of("hello"), false));
    assertParses("true@hello(\"world\")true", Record.of(true, Attr.of("hello", "world"), true));
    assertParses("false@hello(name: \"world\")false", Record.of(false, Attr.of("hello", Record.of(Slot.of("name", "world"))), false));
  }

  @Test
  public void parseNonEmptyMarkup() {
    assertParses("[test]", Record.of("test"));
  }

  @Test
  public void parseMarkupWithEmbeddedMarkup() {
    assertParses("[Hello, [good] world!]", Record.of("Hello, ", "good", " world!"));
  }

  @Test
  public void parseMarkupWithEscapes() {
    assertParses("[\\\"\\$\\'\\\\\\/\\@\\{\\}\\[\\]\\b\\f\\n\\r\\t]", Record.of("\"$'\\/@{}[]\b\f\n\r\t"));
  }

  @Test
  public void parseMarkupWithEmbeddedStructure() {
    assertParses("[Hello{}world]", Record.of("Hello", "world"));
    assertParses("[A: {\"answer\"}.]", Record.of("A: ", "answer", "."));
    assertParses("[A: {%AA==}.]", Record.of("A: ", Data.fromBase64("AA=="), "."));
    assertParses("[A: {42}.]", Record.of("A: ", 42, "."));
    assertParses("[A: {true}.]", Record.of("A: ", true, "."));
    assertParses("[A: {false}.]", Record.of("A: ", false, "."));
    assertParses("[A: {answer:0.0}.]", Record.of("A: ", Slot.of("answer", 0.0), "."));
  }

  @Test
  public void parseMarkupWithEmbeddedSingleExtantAttributes() {
    assertParses("[A: @answer.]", Record.of("A: ", Record.of(Attr.of("answer")), "."));
    assertParses("[A: @answer().]", Record.of("A: ", Record.of(Attr.of("answer")), "."));
    assertParses("[A: @answer(\"secret\").]", Record.of("A: ", Record.of(Attr.of("answer", "secret")), "."));
    assertParses("[A: @answer(number: 42, true).]", Record.of("A: ", Record.of(Attr.of("answer", Record.of(Slot.of("number", 42), true))), "."));
  }

  @Test
  public void parseMarkupWithEmbeddedSequentialExtantAttributes() {
    assertParses("[A: @good @answer.]", Record.of("A: ", Record.of(Attr.of("good")), " ", Record.of(Attr.of("answer")), "."));
    assertParses("[A: @good@answer.]", Record.of("A: ", Record.of(Attr.of("good")), Record.of(Attr.of("answer")), "."));
    assertParses("[A: @good() @answer().]", Record.of("A: ", Record.of(Attr.of("good")), " ", Record.of(Attr.of("answer")), "."));
    assertParses("[A: @good()@answer().]", Record.of("A: ", Record.of(Attr.of("good")), Record.of(Attr.of("answer")), "."));
  }

  @Test
  public void parseMarkupWithEmbeddedAttributedMarkup() {
    assertParses("[Hello, @em[world]!]", Record.of("Hello, ", Record.of(Attr.of("em"), "world"), "!"));
    assertParses("[Hello, @em()[world]!]", Record.of("Hello, ", Record.of(Attr.of("em"), "world"), "!"));
    assertParses("[Hello, @em(\"italic\")[world]!]", Record.of("Hello, ", Record.of(Attr.of("em", "italic"), "world"), "!"));
    assertParses("[Hello, @em(class:\"subject\",style:\"italic\")[world]!]", Record.of("Hello, ", Record.of(Attr.of("em", Record.of(Slot.of("class", "subject"), Slot.of("style", "italic"))), "world"), "!"));
  }

  @Test
  public void parseMarkupWithEmbeddedAttributedValues() {
    assertParses("[A: @answer{42}.]", Record.of("A: ", Record.of(Attr.of("answer"), 42), "."));
    assertParses("[A: @answer(){42}.]", Record.of("A: ", Record.of(Attr.of("answer"), 42), "."));
    assertParses("[A: @answer(\"secret\"){42}.]", Record.of("A: ", Record.of(Attr.of("answer", "secret"), 42), "."));
    assertParses("[A: @answer(number: 42, secret){true}.]", Record.of("A: ", Record.of(Attr.of("answer", Record.of(Slot.of("number", 42), "secret")), true), "."));
  }

  @Test
  public void parseUnclosedEmptyRecordFails() {
    assertParseFails("{");
    assertParseFails("{#comment");
  }

  @Test
  public void parseUnclosedNonEmptyRecordFails() {
    assertParseFails("{1");
    assertParseFails("{1 ");
    assertParseFails("{1,");
    assertParseFails("{1#comment");
  }

  @Test
  public void parseUnclosedEmptyMarkupFails() {
    assertParseFails("[");
  }

  @Test
  public void parseUnclosedNonEmptyMarkupFails() {
    assertParseFails("[test");
    assertParseFails("[test{}");
  }

  @Test
  public void parseUnclosedEmptyStringFails() {
    assertParseFails("\"");
    assertParseFails("'");
  }

  @Test
  public void parseUnclosedNonEmptyStringFails() {
    assertParseFails("\"test");
    assertParseFails("\"test\\");

    assertParseFails("'test");
    assertParseFails("'test\\");
  }

  @Test
  public void parseNakedNegativeFails() {
    assertParseFails("-");
  }

  @Test
  public void parseTrailingDecimalFails() {
    assertParseFails("1.");
  }

  @Test
  public void parseTrailingExponentFails() {
    assertParseFails("1e");
    assertParseFails("1E");
    assertParseFails("1.e");
    assertParseFails("1.E");
    assertParseFails("1.0e");
    assertParseFails("1.0E");
    assertParseFails("1.0e+");
    assertParseFails("1.0E+");
    assertParseFails("1.0e-");
    assertParseFails("1.0E-");
  }

  @Test
  public void parseUnpaddedDataFails() {
    assertParseFails("%AAA");
    assertParseFails("%AA");
    assertParseFails("%A");
  }

  @Test
  public void parseMalformedDataFails() {
    assertParseFails("%AA=A");
  }

  @Test
  public void parseKeylessAttrFails() {
    assertParseFails("@");
    assertParseFails("@()");
  }

  @Test
  public void parseKeylessSlotFails() {
    assertParseFails(":");
    assertParseFails(":test");
  }

  @Test
  public void parseTrailingValuesFails() {
    assertParseFails("{}{}");
    assertParseFails("1 2");
  }
}
