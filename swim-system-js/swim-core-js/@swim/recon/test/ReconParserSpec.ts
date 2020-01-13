// Copyright 2015-2020 SWIM.AI inc.
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

import {TestOptions, Test, Spec, Report} from "@swim/unit";
import {Attr, Slot, Value, Record, Data, Text, Num, Bool} from "@swim/structure";
import {ReconExam} from "./ReconExam";

export class ReconParserSpec extends Spec {
  createExam(report: Report, name: string, options: TestOptions): ReconExam {
    return new ReconExam(report, this, name, options);
  }

  @Test
  parseEmptyInput(exam: ReconExam): void {
    exam.parses("", Value.absent());
  }

  @Test
  parseComments(exam: ReconExam): void {
    exam.parses("#", Value.absent());
    exam.parses("#comment", Value.absent());
    exam.parses("#\n", Value.absent());
    exam.parses("#comment\n", Value.absent());
  }

  @Test
  parseEmptyRecords(exam: ReconExam): void {
    exam.parses("{}", Record.empty());
  }

  @Test
  parseNonEmptyRecords(exam: ReconExam): void {
    exam.parses("{1,2,\"3\",true}", Record.of(1, 2, "3", true));
    exam.parses("1,2,\"3\",true", Record.of(1, 2, "3", true));
  }

  @Test
  parseNestedRecords(exam: ReconExam): void {
    exam.parses("{{1,2},{3,4}}", Record.of(Record.of(1, 2), Record.of(3, 4)));
    exam.parses("{1,2},{3,4}", Record.of(Record.of(1, 2), Record.of(3, 4)));
  }

  @Test
  parseRecordsWithComments(exam: ReconExam): void {
    exam.parses("{#comment\n}", Record.empty());
    exam.parses("{#comment\n#comment\n}", Record.empty());
  }

  @Test
  parseEmptyData(exam: ReconExam): void {
    exam.parses("%", Data.empty());
  }

  @Test
  parseNonEmptyData(exam: ReconExam): void {
    exam.parses("%AAAA", Data.fromBase64("AAAA"));
    exam.parses("%AAA=", Data.fromBase64("AAA="));
    exam.parses("%AA==", Data.fromBase64("AA=="));
    exam.parses("%ABCDabcd12/+", Data.fromBase64("ABCDabcd12/+"));
  }

  @Test
  parseEmptyMarkup(exam: ReconExam): void {
    exam.parses("[]", Record.empty());
  }

  @Test
  parseEmptyStrings(exam: ReconExam): void {
    exam.parses("\"\"", Text.empty());
    exam.parses("''", Text.empty());
  }

  @Test
  parseNonEmptyStrings(exam: ReconExam): void {
    exam.parses("\"test\"", Text.from("test"));
    exam.parses("'test'", Text.from("test"));
  }

  @Test
  parseStringsWithEscapes(exam: ReconExam): void {
    exam.parses("\"\\\"\\\\\\/\\@\\{\\}\\[\\]\\b\\f\\n\\r\\t\"", Text.from("\"\\/@{}[]\b\f\n\r\t"));
    exam.parses("'\\\'\\\\\\/\\@\\{\\}\\[\\]\\b\\f\\n\\r\\t'", Text.from("'\\/@{}[]\b\f\n\r\t"));
  }

  @Test
  parseIdentifiers(exam: ReconExam): void {
    exam.parses("test", Text.from("test"));
  }

  @Test
  parseUnicodeIdentifiers(exam: ReconExam): void {
    exam.parses("À", Text.from("À")); // U+C0
    exam.parses("Ö", Text.from("Ö")); // U+D6
    exam.parses("Ø", Text.from("Ø")); // U+D8
    exam.parses("ö", Text.from("ö")); // U+F6
    exam.parses("ø", Text.from("ø")); // U+F8
    exam.parses("˿", Text.from("˿")); // U+2FF
    exam.parses("Ͱ", Text.from("Ͱ")); // U+370
    exam.parses("ͽ", Text.from("ͽ")); // U+37D
    exam.parses("Ϳ", Text.from("Ϳ")); // U+37F
    exam.parses("῿", Text.from("῿")); // U+1FFF
    exam.parses("⁰", Text.from("⁰")); // U+2070
    exam.parses("↏", Text.from("↏")); // U+218F
    exam.parses("Ⰰ", Text.from("Ⰰ")); // U+2C00
    exam.parses("⿯", Text.from("⿯")); // U+2FEF
    exam.parses("、", Text.from("、")); // U+3001
    exam.parses("퟿", Text.from("퟿")); // U+D7FF
    exam.parses("豈", Text.from("豈")); // U+F900
    exam.parses("﷏", Text.from("﷏")); // U+FDCF
    exam.parses("ﷰ", Text.from("ﷰ")); // U+FDF0
    //exam.parses("𐀀", Text.from("𐀀")); // U+10000
    //exam.parses("󯿿", Text.from("󯿿")); // U+EFFFF

    exam.parses("_À", Text.from("_À")); // U+C0
    exam.parses("_Ö", Text.from("_Ö")); // U+D6
    exam.parses("_Ø", Text.from("_Ø")); // U+D8
    exam.parses("_ö", Text.from("_ö")); // U+F6
    exam.parses("_ø", Text.from("_ø")); // U+F8
    exam.parses("_˿", Text.from("_˿")); // U+2FF
    exam.parses("_Ͱ", Text.from("_Ͱ")); // U+370
    exam.parses("_ͽ", Text.from("_ͽ")); // U+37D
    exam.parses("_Ϳ", Text.from("_Ϳ")); // U+37F
    exam.parses("_῿", Text.from("_῿")); // U+1FFF
    exam.parses("_⁰", Text.from("_⁰")); // U+2070
    exam.parses("_↏", Text.from("_↏")); // U+218F
    exam.parses("_Ⰰ", Text.from("_Ⰰ")); // U+2C00
    exam.parses("_⿯", Text.from("_⿯")); // U+2FEF
    exam.parses("_、", Text.from("_、")); // U+3001
    exam.parses("_퟿", Text.from("_퟿")); // U+D7FF
    exam.parses("_豈", Text.from("_豈")); // U+F900
    exam.parses("_﷏", Text.from("_﷏")); // U+FDCF
    exam.parses("_ﷰ", Text.from("_ﷰ")); // U+FDF0
    //exam.parses("_𐀀", Text.from("_𐀀")); // U+10000
    //exam.parses("_󯿿", Text.from("_󯿿")); // U+EFFFF
  }

  @Test
  parsePositiveIntegers(exam: ReconExam): void {
    exam.parses("0", Num.from(0));
    exam.parses("1", Num.from(1));
    exam.parses("5", Num.from(5));
    exam.parses("10", Num.from(10));
    exam.parses("11", Num.from(11));
    exam.parses("15", Num.from(15));
    exam.parses("2147483647", Num.from(2147483647));
    exam.parses("9007199254740992", Num.from(9007199254740992));
  }

  @Test
  parseNegativeIntegers(exam: ReconExam): void {
    exam.parses("-0", Num.from(-0));
    exam.parses("-1", Num.from(-1));
    exam.parses("-5", Num.from(-5));
    exam.parses("-10", Num.from(-10));
    exam.parses("-11", Num.from(-11));
    exam.parses("-15", Num.from(-15));
    exam.parses("-2147483648", Num.from(-2147483648));
    exam.parses("-9007199254740991", Num.from(-9007199254740991));
  }

  @Test
  parsePositiveDecimals(exam: ReconExam): void {
    exam.parses("0.0", Num.from(0.0));
    exam.parses("0.5", Num.from(0.5));
    exam.parses("1.0", Num.from(1.0));
    exam.parses("1.5", Num.from(1.5));
    exam.parses("1.05", Num.from(1.05));
    exam.parses("10.0", Num.from(10.0));
    exam.parses("10.5", Num.from(10.5));
  }

  @Test
  parseNegativeDecimals(exam: ReconExam): void {
    exam.parses("-0.0", Num.from(-0.0));
    exam.parses("-0.5", Num.from(-0.5));
    exam.parses("-1.0", Num.from(-1.0));
    exam.parses("-1.5", Num.from(-1.5));
    exam.parses("-1.05", Num.from(-1.05));
    exam.parses("-10.0", Num.from(-10.0));
    exam.parses("-10.5", Num.from(-10.5));
  }

  @Test
  parsePositiveDecimalsWithExponents(exam: ReconExam): void {
    exam.parses("4e0", Num.from(4e0));
    exam.parses("4E0", Num.from(4E0));
    exam.parses("4e1", Num.from(4e1));
    exam.parses("4E1", Num.from(4E1));
    exam.parses("4e2", Num.from(4e2));
    exam.parses("4E2", Num.from(4E2));
    exam.parses("4e+0", Num.from(4e+0));
    exam.parses("4E+0", Num.from(4E+0));
    exam.parses("4e-0", Num.from(4e-0));
    exam.parses("4E-0", Num.from(4E-0));
    exam.parses("4e+1", Num.from(4e+1));
    exam.parses("4E+1", Num.from(4E+1));
    exam.parses("4e-1", Num.from(4e-1));
    exam.parses("4E-1", Num.from(4E-1));
    exam.parses("4e+2", Num.from(4e+2));
    exam.parses("4E+2", Num.from(4E+2));
    exam.parses("4e-2", Num.from(4e-2));
    exam.parses("4E-2", Num.from(4E-2));
    exam.parses("4.0e2", Num.from(4.0e2));
    exam.parses("4.0E2", Num.from(4.0E2));
    exam.parses("4.0e+2", Num.from(4.0e+2));
    exam.parses("4.0E+2", Num.from(4.0E+2));
    exam.parses("4.0e-2", Num.from(4.0e-2));
    exam.parses("4.0E-2", Num.from(4.0E-2));
    exam.parses("1.17549435e-38", Num.from(1.17549435e-38)); // Float.MIN_VALUE
    exam.parses("3.4028235e38", Num.from(3.4028235e38)); // Float.MAX_VALUE
    exam.parses("1.17549435e-38", Num.from(1.17549435e-38)); // Float.MIN_NORMAL
    exam.parses("4.9e-324", Num.from(4.9e-324)); // Double.MIN_VALUE
    exam.parses("1.7976931348623157e308", Num.from(1.7976931348623157e308)); // Double.MAX_VALUE
    exam.parses("2.2250738585072014e-308", Num.from(2.2250738585072014e-308)); // Double.MIN_NORMAL
  }

  @Test
  parseNegativeDecimalsWithExponents(exam: ReconExam): void {
    exam.parses("-4e0", Num.from(-4e0));
    exam.parses("-4E0", Num.from(-4E0));
    exam.parses("-4e1", Num.from(-4e1));
    exam.parses("-4E1", Num.from(-4E1));
    exam.parses("-4e2", Num.from(-4e2));
    exam.parses("-4E2", Num.from(-4E2));
    exam.parses("-4e+0", Num.from(-4e+0));
    exam.parses("-4E+0", Num.from(-4E+0));
    exam.parses("-4e-0", Num.from(-4e-0));
    exam.parses("-4E-0", Num.from(-4E-0));
    exam.parses("-4e+1", Num.from(-4e+1));
    exam.parses("-4E+1", Num.from(-4E+1));
    exam.parses("-4e-1", Num.from(-4e-1));
    exam.parses("-4E-1", Num.from(-4E-1));
    exam.parses("-4e+2", Num.from(-4e+2));
    exam.parses("-4E+2", Num.from(-4E+2));
    exam.parses("-4e-2", Num.from(-4e-2));
    exam.parses("-4E-2", Num.from(-4E-2));
    exam.parses("-4.0e2", Num.from(-4.0e2));
    exam.parses("-4.0E2", Num.from(-4.0E2));
    exam.parses("-4.0e+2", Num.from(-4.0e+2));
    exam.parses("-4.0E+2", Num.from(-4.0E+2));
    exam.parses("-4.0e-2", Num.from(-4.0e-2));
    exam.parses("-4.0E-2", Num.from(-4.0E-2));
    exam.parses("-4.0e02", Num.from(-4.0e2));
    exam.parses("-4.0E02", Num.from(-4.0E2));
    exam.parses("-4.0e+02", Num.from(-4.0e+2));
    exam.parses("-4.0E+02", Num.from(-4.0E+2));
    exam.parses("-4.0e-02", Num.from(-4.0e-2));
    exam.parses("-4.0E-02", Num.from(-4.0E-2));
  }

  @Test
  parseUint32s(exam: ReconExam): void {
    exam.parses("0x0", Num.uint32(0x0));

    exam.parses("0x00000001", Num.uint32(0x00000001));
    exam.parses("0x00000010", Num.uint32(0x00000010));
    exam.parses("0x00000100", Num.uint32(0x00000100));
    exam.parses("0x00001000", Num.uint32(0x00001000));
    exam.parses("0x00010000", Num.uint32(0x00010000));
    exam.parses("0x00100000", Num.uint32(0x00100000));
    exam.parses("0x01000000", Num.uint32(0x01000000));
    exam.parses("0x10000000", Num.uint32(0x10000000));
    exam.parses("0xFFFFFFFF", Num.uint32(0xFFFFFFFF));
    exam.parses("0xFEDCBA98", Num.uint32(0xFEDCBA98));
    exam.parses("0x01234567", Num.uint32(0x01234567));
  }

  @Test
  parseBooleans(exam: ReconExam): void {
    exam.parses("true", Bool.from(true));
    exam.parses("false", Bool.from(false));
  }

  @Test
  parseSingleValuesWithTrailingCommas(exam: ReconExam): void {
    exam.parses("1,", Num.from(1));
  }

  @Test
  parseSingleValuesWithTrailingSemicolons(exam: ReconExam): void {
    exam.parses("1;", Num.from(1));
  }

  @Test
  parseMultipleCommaSeparatedItems(exam: ReconExam): void {
    exam.parses("  1, 2,3 ,4  ", Record.of(1, 2, 3, 4));
    exam.parses("{1, 2,3 ,4 }", Record.of(1, 2, 3, 4));
  }

  @Test
  parseMultipleSemicolonSeparatedItems(exam: ReconExam): void {
    exam.parses("  1; 2;3 ;4  ", Record.of(1, 2, 3, 4));
    exam.parses("{1; 2;3 ;4 }", Record.of(1, 2, 3, 4));
  }

  @Test
  parseMultipleItemsWithTrailingCommas(exam: ReconExam): void {
    exam.parses("  1, 2,3 ,4,  ", Record.of(1, 2, 3, 4));
    exam.parses("{1, 2,3 ,4, }", Record.of(1, 2, 3, 4));
  }

  @Test
  parseMultipleItemsWithTrailingSemicolons(exam: ReconExam): void {
    exam.parses("  1, 2,3 ,4;  ", Record.of(1, 2, 3, 4));
    exam.parses("{1, 2,3 ,4; }", Record.of(1, 2, 3, 4));
  }

  @Test
  parseMultipleNewlineSeparatedItems(exam: ReconExam): void {
    exam.parses(" 1\n 2\n3 \n4  ", Record.of(1, 2, 3, 4));
    exam.parses("{1\n 2\n3 \n4  }", Record.of(1, 2, 3, 4));
  }

  @Test
  parseMultipleItemsWithMixedSeparators(exam: ReconExam): void {
    exam.parses(" 1, 2\n3 \n4; 5   ", Record.of(1, 2, 3, 4, 5));
    exam.parses("{1, 2\n3 \n4; 5  }", Record.of(1, 2, 3, 4, 5));
  }

  @Test
  parseMultipleCommaNewlineSeparatedItems(exam: ReconExam): void {
    exam.parses(" \n 1,\n 2,\n3 \n ", Record.of(1, 2, 3));
    exam.parses("{\n 1,\n 2,\n3 \n}", Record.of(1, 2, 3));
  }

  @Test
  parseMultipleSemicolonNewlineSeparatedItems(exam: ReconExam): void {
    exam.parses(" \n 1;\n 2;\n3 \n ", Record.of(1, 2, 3));
    exam.parses("{\n 1;\n 2;\n3 \n}", Record.of(1, 2, 3));
  }

  @Test
  parseHeterogeneousTopLevelItemsAsRecord(exam: ReconExam): void {
    exam.parses("  extant:\n  record: {}\n  markup: []\n  \"\"\n  %AA==\n  integer: 0\n  decimal: 0.0\n  true\n  false\n",
        Record.of(Slot.of("extant"), Slot.of("record", Record.empty()), Slot.of("markup", Record.empty()), "", Data.fromBase64("AA=="),
            Slot.of("integer", 0), Slot.of("decimal", 0.0), true, false));
  }

  @Test
  parseHeterogeneousItemsInRecord(exam: ReconExam): void {
    exam.parses("{\n  extant:\n  record: {}\n  markup: []\n  \"\"\n  %AA==\n  integer: 0\n  decimal: 0.0\n  true\n  false\n}",
        Record.of(Slot.of("extant"), Slot.of("record", Record.empty()), Slot.of("markup", Record.empty()), "", Data.fromBase64("AA=="),
            Slot.of("integer", 0), Slot.of("decimal", 0.0), true, false));
  }

  @Test
  parseLeadingComments(exam: ReconExam): void {
    exam.parses("#comment\ntest", Text.from("test"));
  }

  @Test
  parseLeadingCommentsInBlocks(exam: ReconExam): void {
    exam.parses("#comment\n1\n#comment\n2", Record.of(1, 2));
  }

  @Test
  parseLeadingCommentsInRecords(exam: ReconExam): void {
    exam.parses("{#comment\n1\n#comment\n2}", Record.of(1, 2));
  }

  @Test
  parseTrailingComments(exam: ReconExam): void {
    exam.parses("test#comment", Text.from("test"));
  }

  @Test
  parseTrailingCommentsInBlocks(exam: ReconExam): void {
    exam.parses("1#comment\n2#comment", Record.of(1, 2));
  }

  @Test
  parseTrailingCommentsInRecords(exam: ReconExam): void {
    exam.parses("{1#comment\n2#comment\n}", Record.of(1, 2));
  }

  @Test
  parseSingleExtantAttributesWithNoParameters(exam: ReconExam): void {
    exam.parses("@test", Record.of(Attr.of("test")));
  }

  @Test
  parseSingleExtantAttributesWithEmptyParameters(exam: ReconExam): void {
    exam.parses("@test()", Record.of(Attr.of("test")));
  }

  @Test
  parseQuotedAttributeNames(exam: ReconExam): void {
    exam.parses("@\"test\"", Record.of(Attr.of("test")));
    exam.parses("@\"test\"()", Record.of(Attr.of("test")));
    exam.parses("@\"@at\"", Record.of(Attr.of("@at")));
    exam.parses("@\"@at\"()", Record.of(Attr.of("@at")));
  }

  @Test
  parseSingleExtantAttributesWithSingleParameters(exam: ReconExam): void {
    exam.parses("@hello()", Record.of(Attr.of("hello")));
    exam.parses("@hello([world])", Record.of(Attr.of("hello", Record.of("world"))));
    exam.parses("@hello(\"world\")", Record.of(Attr.of("hello", "world")));
    exam.parses("@hello(42)", Record.of(Attr.of("hello", 42)));
  }

  @Test
  parseSingleExtantAttributesWithMultipleParameters(exam: ReconExam): void {
    exam.parses("@hello(\"world\", %AA==, 42, true)", Record.of(Attr.of("hello", Record.of("world", Data.fromBase64("AA=="), 42, true))));
    exam.parses("@hello(\"world\"; %AA==; 42; true)", Record.of(Attr.of("hello", Record.of("world", Data.fromBase64("AA=="), 42, true))));
    exam.parses("@hello(\"world\"\n%AA==\n42\ntrue)", Record.of(Attr.of("hello", Record.of("world", Data.fromBase64("AA=="), 42, true))));
  }

  @Test
  parseSingleExtantAttributesWithNamedParameters(exam: ReconExam): void {
    exam.parses("@hello(name: \"world\")", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world")))));
    exam.parses("@hello(name: \"world\", data: %AA==, number: 42, false)",
        Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"), Slot.of("data", Data.fromBase64("AA==")), Slot.of("number", 42), false))));
  }

  @Test
  parseMultipleExtantAttributesWithNoParameters(exam: ReconExam): void {
    exam.parses("@a@b", Record.of(Attr.of("a"), Attr.of("b")));
    exam.parses("@a @b", Record.of(Attr.of("a"), Attr.of("b")));
  }

  @Test
  parseMultipleExtantAttributesWithEmptyParameters(exam: ReconExam): void {
    exam.parses("@a()@b()", Record.of(Attr.of("a"), Attr.of("b")));
    exam.parses("@a() @b()", Record.of(Attr.of("a"), Attr.of("b")));
  }

  @Test
  parseMultipleExtantAttributesWithSingleParameters(exam: ReconExam): void {
    exam.parses("@a({})@b([])", Record.of(Attr.of("a", Record.empty()), Attr.of("b", Record.empty())));
    exam.parses("@a(\"test\") @b(42)", Record.of(Attr.of("a", "test"), Attr.of("b", 42)));
    exam.parses("@a(true) @b(false)", Record.of(Attr.of("a", Bool.from(true)), Attr.of("b", Bool.from(false))));
  }

  @Test
  parseMultipleExtantAttributesWithComplexParameters(exam: ReconExam): void {
    exam.parses("@hello(\"world\", 42) @test(name: \"parse\", pending: false)",
        Record.of(Attr.of("hello", Record.of("world", 42)), Attr.of("test", Record.of(Slot.of("name", "parse"), Slot.of("pending", Bool.from(false))))));
  }

  @Test
  parsePrefixAttributedEmptyRecords(exam: ReconExam): void {
    exam.parses("@hello {}", Record.of(Attr.of("hello")));
    exam.parses("@hello() {}", Record.of(Attr.of("hello")));
    exam.parses("@hello(\"world\") {}", Record.of(Attr.of("hello", "world")));
    exam.parses("@hello(name: \"world\") {}", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world")))));
  }

  @Test
  parsePrefixAttributedNonEmptyRecords(exam: ReconExam): void {
    exam.parses("@hello { {}, [] }", Record.of(Attr.of("hello"), Record.empty(), Record.empty()));
    exam.parses("@hello() { \"world\", 42 }", Record.of(Attr.of("hello"), "world", 42));
    exam.parses("@hello(\"world\") { number: 42, true }", Record.of(Attr.of("hello", "world"), Slot.of("number", 42), true));
    exam.parses("@hello(name: \"world\") { {1,2} }", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), Record.of(1, 2)));
  }

  @Test
  parsePrefixAttributedEmptyMarkup(exam: ReconExam): void {
    exam.parses("@hello []", Record.of(Attr.of("hello")));
    exam.parses("@hello() []", Record.of(Attr.of("hello")));
    exam.parses("@hello(\"world\") []", Record.of(Attr.of("hello", "world")));
    exam.parses("@hello(name: \"world\") []", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world")))));
  }

  @Test
  parsePrefixAttributedNonEmptyMarkup(exam: ReconExam): void {
    exam.parses("@hello [test]", Record.of(Attr.of("hello"), "test"));
    exam.parses("@hello() [test]", Record.of(Attr.of("hello"), "test"));
    exam.parses("@hello(\"world\") [test]", Record.of(Attr.of("hello", "world"), "test"));
    exam.parses("@hello(name: \"world\") [test]", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), "test"));
  }

  @Test
  parsePrefixAttributedEmptyStrings(exam: ReconExam): void {
    exam.parses("@hello \"\"", Record.of(Attr.of("hello"), ""));
    exam.parses("@hello() \"\"", Record.of(Attr.of("hello"), ""));
    exam.parses("@hello(\"world\") \"\"", Record.of(Attr.of("hello", "world"), ""));
    exam.parses("@hello(name: \"world\") \"\"", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), ""));

    exam.parses("@hello ''", Record.of(Attr.of("hello"), ""));
    exam.parses("@hello() ''", Record.of(Attr.of("hello"), ""));
    exam.parses("@hello('world') ''", Record.of(Attr.of("hello", "world"), ""));
    exam.parses("@hello(name: 'world') ''", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), ""));
  }

  @Test
  parsePrefixAttributedNonEmptyStrings(exam: ReconExam): void {
    exam.parses("@hello \"test\"", Record.of(Attr.of("hello"), "test"));
    exam.parses("@hello() \"test\"", Record.of(Attr.of("hello"), "test"));
    exam.parses("@hello(\"world\") \"test\"", Record.of(Attr.of("hello", "world"), "test"));
    exam.parses("@hello(name: \"world\") \"test\"", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), "test"));

    exam.parses("@hello 'test'", Record.of(Attr.of("hello"), "test"));
    exam.parses("@hello() 'test'", Record.of(Attr.of("hello"), "test"));
    exam.parses("@hello('world') 'test'", Record.of(Attr.of("hello", "world"), "test"));
    exam.parses("@hello(name: 'world') 'test'", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), "test"));
  }

  @Test
  parsePrefixAttributedEmptyData(exam: ReconExam): void {
    exam.parses("@hello %", Record.of(Attr.of("hello"), Data.empty()));
    exam.parses("@hello() %", Record.of(Attr.of("hello"), Data.empty()));
    exam.parses("@hello(\"world\") %", Record.of(Attr.of("hello", "world"), Data.empty()));
    exam.parses("@hello(name: \"world\") %", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), Data.empty()));
  }

  @Test
  parsePrefixAttributedNonEmptyData(exam: ReconExam): void {
    exam.parses("@hello %AA==", Record.of(Attr.of("hello"), Data.fromBase64("AA==")));
    exam.parses("@hello() %AAA=", Record.of(Attr.of("hello"), Data.fromBase64("AAA=")));
    exam.parses("@hello(\"world\") %AAAA", Record.of(Attr.of("hello", "world"), Data.fromBase64("AAAA")));
    exam.parses("@hello(name: \"world\") %ABCDabcd12+/", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), Data.fromBase64("ABCDabcd12+/")));
  }

  @Test
  parsePrefixAttributedNumbers(exam: ReconExam): void {
    exam.parses("@hello 42", Record.of(Attr.of("hello"), 42));
    exam.parses("@hello() -42", Record.of(Attr.of("hello"), -42));
    exam.parses("@hello(\"world\") 42.0", Record.of(Attr.of("hello", "world"), 42.0));
    exam.parses("@hello(name: \"world\") -42.0", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), -42.0));
  }

  @Test
  parsePrefixAttributedBooleans(exam: ReconExam): void {
    exam.parses("@hello true", Record.of(Attr.of("hello"), true));
    exam.parses("@hello() false", Record.of(Attr.of("hello"), false));
    exam.parses("@hello(\"world\") true", Record.of(Attr.of("hello", "world"), true));
    exam.parses("@hello(name: \"world\") false", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world"))), false));
  }

  @Test
  parsePostfixAttributedEmptyRecords(exam: ReconExam): void {
    exam.parses("{} @signed", Record.of(Attr.of("signed")));
    exam.parses("{} @signed()", Record.of(Attr.of("signed")));
    exam.parses("{} @signed(\"me\")", Record.of(Attr.of("signed", "me")));
    exam.parses("{} @signed(by: \"me\")", Record.of(Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  parsePostfixAttributedNonEmptyRecords(exam: ReconExam): void {
    exam.parses("{ {}, [] } @signed", Record.of(Record.empty(), Record.empty(), Attr.of("signed")));
    exam.parses("{ \"world\", 42 } @signed()", Record.of("world", 42, Attr.of("signed")));
    exam.parses("{ number: 42, true } @signed(\"me\")", Record.of(Slot.of("number", 42), true, Attr.of("signed", "me")));
    exam.parses("{ {1,2} } @signed(by: \"me\")", Record.of(Record.of(1, 2), Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  parsePostfixAttributedEmptyMarkup(exam: ReconExam): void {
    exam.parses("[] @signed", Record.of(Attr.of("signed")));
    exam.parses("[] @signed()", Record.of(Attr.of("signed")));
    exam.parses("[] @signed(\"me\")", Record.of(Attr.of("signed", "me")));
    exam.parses("[] @signed(by: \"me\")", Record.of(Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  parsePostfixAttributedNonEmptyMarkup(exam: ReconExam): void {
    exam.parses("[test] @signed", Record.of("test", Attr.of("signed")));
    exam.parses("[test] @signed()", Record.of("test", Attr.of("signed")));
    exam.parses("[test] @signed(\"me\")", Record.of("test", Attr.of("signed", "me")));
    exam.parses("[test] @signed(by: \"me\")", Record.of("test", Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  parsePostfixAttributedEmptyStrings(exam: ReconExam): void {
    exam.parses("\"\" @signed", Record.of("", Attr.of("signed")));
    exam.parses("\"\" @signed()", Record.of("", Attr.of("signed")));
    exam.parses("\"\" @signed(\"me\")", Record.of("", Attr.of("signed", "me")));
    exam.parses("\"\" @signed(by: \"me\")", Record.of("", Attr.of("signed", Record.of(Slot.of("by", "me")))));

    exam.parses("'' @signed", Record.of("", Attr.of("signed")));
    exam.parses("'' @signed()", Record.of("", Attr.of("signed")));
    exam.parses("'' @signed('me')", Record.of("", Attr.of("signed", "me")));
    exam.parses("'' @signed(by: 'me')", Record.of("", Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  parsePostfixAttributedNonEmptyStrings(exam: ReconExam): void {
    exam.parses("\"test\" @signed", Record.of("test", Attr.of("signed")));
    exam.parses("\"test\" @signed()", Record.of("test", Attr.of("signed")));
    exam.parses("\"test\" @signed(\"me\")", Record.of("test", Attr.of("signed", "me")));
    exam.parses("\"test\" @signed(by: \"me\")", Record.of("test", Attr.of("signed", Record.of(Slot.of("by", "me")))));

    exam.parses("'test' @signed", Record.of("test", Attr.of("signed")));
    exam.parses("'test' @signed()", Record.of("test", Attr.of("signed")));
    exam.parses("'test' @signed('me')", Record.of("test", Attr.of("signed", "me")));
    exam.parses("'test' @signed(by: 'me')", Record.of("test", Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  parsePostfixAttributedEmptyData(exam: ReconExam): void {
    exam.parses("% @signed", Record.of(Data.empty(), Attr.of("signed")));
    exam.parses("% @signed()", Record.of(Data.empty(), Attr.of("signed")));
    exam.parses("% @signed(\"me\")", Record.of(Data.empty(), Attr.of("signed", "me")));
    exam.parses("% @signed(by: \"me\")", Record.of(Data.empty(), Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  parsePostfixAttributedNonEmptyData(exam: ReconExam): void {
    exam.parses("%AA== @signed", Record.of(Data.fromBase64("AA=="), Attr.of("signed")));
    exam.parses("%AAA= @signed()", Record.of(Data.fromBase64("AAA="), Attr.of("signed")));
    exam.parses("%AAAA @signed(\"me\")", Record.of(Data.fromBase64("AAAA"), Attr.of("signed", "me")));
    exam.parses("%ABCDabcd12+/ @signed(by: \"me\")", Record.of(Data.fromBase64("ABCDabcd12+/"), Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  parsePostfixAttributeNumbers(exam: ReconExam): void {
    exam.parses("42 @signed", Record.of(42, Attr.of("signed")));
    exam.parses("-42 @signed()", Record.of(-42, Attr.of("signed")));
    exam.parses("42.0 @signed(\"me\")", Record.of(42.0, Attr.of("signed", "me")));
    exam.parses("-42.0 @signed(by: \"me\")", Record.of(-42.0, Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  parsePostfixAttributeBooleans(exam: ReconExam): void {
    exam.parses("true @signed", Record.of(true, Attr.of("signed")));
    exam.parses("false @signed()", Record.of(false, Attr.of("signed")));
    exam.parses("true @signed(\"me\")", Record.of(true, Attr.of("signed", "me")));
    exam.parses("false @signed(by: \"me\")", Record.of(false, Attr.of("signed", Record.of(Slot.of("by", "me")))));
  }

  @Test
  parseInfixAttributedEmptyRecords(exam: ReconExam): void {
    exam.parses("{}@hello{}", Record.of(Attr.of("hello")));
    exam.parses("{}@hello(){}", Record.of(Attr.of("hello")));
    exam.parses("{}@hello(\"world\"){}", Record.of(Attr.of("hello", "world")));
    exam.parses("{}@hello(name: \"world\"){}", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world")))));
  }

  @Test
  parseInfixAttributedNonEmptyRecords(exam: ReconExam): void {
    exam.parses("{{}}@hello{[]}", Record.of(Record.empty(), Attr.of("hello"), Record.empty()));
    exam.parses("{42}@hello(){\"world\"}", Record.of(42, Attr.of("hello"), "world"));
    exam.parses("{number: 42}@hello(\"world\"){true}", Record.of(Slot.of("number", 42), Attr.of("hello", "world"), true));
    exam.parses("{{1,2}}@hello(name: \"world\"){{3,4}}", Record.of(Record.of(1, 2), Attr.of("hello", Record.of(Slot.of("name", "world"))), Record.of(3, 4)));
  }

  @Test
  parseInfixAttributedEmptyMarkup(exam: ReconExam): void {
    exam.parses("[]@hello[]", Record.of(Attr.of("hello")));
    exam.parses("[]@hello()[]", Record.of(Attr.of("hello")));
    exam.parses("[]@hello(\"world\")[]", Record.of(Attr.of("hello", "world")));
    exam.parses("[]@hello(name: \"world\")[]", Record.of(Attr.of("hello", Record.of(Slot.of("name", "world")))));
  }

  @Test
  parseInfixAttributedNonEmptyMarkup(exam: ReconExam): void {
    exam.parses("[a]@hello[test]", Record.of("a", Attr.of("hello"), "test"));
    exam.parses("[a]@hello()[test]", Record.of("a", Attr.of("hello"), "test"));
    exam.parses("[a]@hello(\"world\")[test]", Record.of("a", Attr.of("hello", "world"), "test"));
    exam.parses("[a]@hello(name: \"world\")[test]", Record.of("a", Attr.of("hello", Record.of(Slot.of("name", "world"))), "test"));
  }

  @Test
  parseInfixAttributedEmptyStrings(exam: ReconExam): void {
    exam.parses("\"\"@hello\"\"", Record.of("", Attr.of("hello"), ""));
    exam.parses("\"\"@hello()\"\"", Record.of("", Attr.of("hello"), ""));
    exam.parses("\"\"@hello(\"world\")\"\"", Record.of("", Attr.of("hello", "world"), ""));
    exam.parses("\"\"@hello(name: \"world\")\"\"", Record.of("", Attr.of("hello", Record.of(Slot.of("name", "world"))), ""));

    exam.parses("''@hello''", Record.of("", Attr.of("hello"), ""));
    exam.parses("''@hello()''", Record.of("", Attr.of("hello"), ""));
    exam.parses("''@hello('world')''", Record.of("", Attr.of("hello", "world"), ""));
    exam.parses("''@hello(name: 'world')''", Record.of("", Attr.of("hello", Record.of(Slot.of("name", "world"))), ""));
  }

  @Test
  parseInfixAttributedNonEmptyStrings(exam: ReconExam): void {
    exam.parses("\"a\"@hello\"test\"", Record.of("a", Attr.of("hello"), "test"));
    exam.parses("\"a\"@hello()\"test\"", Record.of("a", Attr.of("hello"), "test"));
    exam.parses("\"a\"@hello(\"world\")\"test\"", Record.of("a", Attr.of("hello", "world"), "test"));
    exam.parses("\"a\"@hello(name: \"world\")\"test\"", Record.of("a", Attr.of("hello", Record.of(Slot.of("name", "world"))), "test"));

    exam.parses("'a'@hello'test'", Record.of("a", Attr.of("hello"), "test"));
    exam.parses("'a'@hello()'test'", Record.of("a", Attr.of("hello"), "test"));
    exam.parses("'a'@hello('world')'test'", Record.of("a", Attr.of("hello", "world"), "test"));
    exam.parses("'a'@hello(name: 'world')'test'", Record.of("a", Attr.of("hello", Record.of(Slot.of("name", "world"))), "test"));
  }

  @Test
  parseInfixAttributedEmptyData(exam: ReconExam): void {
    exam.parses("%@hello%", Record.of(Data.empty(), Attr.of("hello"), Data.empty()));
    exam.parses("%@hello()%", Record.of(Data.empty(), Attr.of("hello"), Data.empty()));
    exam.parses("%@hello(\"world\")%", Record.of(Data.empty(), Attr.of("hello", "world"), Data.empty()));
    exam.parses("%@hello(name: \"world\")%", Record.of(Data.empty(), Attr.of("hello", Record.of(Slot.of("name", "world"))), Data.empty()));
  }

  @Test
  parseInfixAttributedNonEmptyData(exam: ReconExam): void {
    exam.parses("%AA==@hello%BB==", Record.of(Data.fromBase64("AA=="), Attr.of("hello"), Data.fromBase64("BB==")));
    exam.parses("%AAA=@hello()%BBB=", Record.of(Data.fromBase64("AAA="), Attr.of("hello"), Data.fromBase64("BBB=")));
    exam.parses("%AAAA@hello(\"world\")%BBBB", Record.of(Data.fromBase64("AAAA"), Attr.of("hello", "world"), Data.fromBase64("BBBB")));
    exam.parses("%ABCDabcd12+/@hello(name: \"world\")%/+21dcbaDCBA", Record.of(Data.fromBase64("ABCDabcd12+/"),
        Attr.of("hello", Record.of(Slot.of("name", "world"))), Data.fromBase64("/+21dcbaDCBA")));
  }

  @Test
  parseInfixAttributedNumbers(exam: ReconExam): void {
    exam.parses("2@hello 42", Record.of(2, Attr.of("hello"), 42));
    exam.parses("-2@hello()-42", Record.of(-2, Attr.of("hello"), -42));
    exam.parses("2.0@hello(\"world\")42.0", Record.of(2.0, Attr.of("hello", "world"), 42.0));
    exam.parses("-2.0@hello(name: \"world\")-42.0", Record.of(-2.0, Attr.of("hello", Record.of(Slot.of("name", "world"))), -42.0));
  }

  @Test
  parseInfixAttributedBooleans(exam: ReconExam): void {
    exam.parses("true@hello true", Record.of(true, Attr.of("hello"), true));
    exam.parses("false@hello()false", Record.of(false, Attr.of("hello"), false));
    exam.parses("true@hello(\"world\")true", Record.of(true, Attr.of("hello", "world"), true));
    exam.parses("false@hello(name: \"world\")false", Record.of(false, Attr.of("hello", Record.of(Slot.of("name", "world"))), false));
  }

  @Test
  parseNonEmptyMarkup(exam: ReconExam): void {
    exam.parses("[test]", Record.of("test"));
  }

  @Test
  parseMarkupWithEmbeddedMarkup(exam: ReconExam): void {
    exam.parses("[Hello, [good] world!]", Record.of("Hello, ", "good", " world!"));
  }

  @Test
  parseMarkupWithEscapes(exam: ReconExam): void {
    exam.parses("[\\\"\\$\\'\\\\\\/\\@\\{\\}\\[\\]\\b\\f\\n\\r\\t]", Record.of("\"$'\\/@{}[]\b\f\n\r\t"));
  }

  @Test
  parseMarkupWithEmbeddedStructure(exam: ReconExam): void {
    exam.parses("[Hello{}world]", Record.of("Hello", "world"));
    exam.parses("[A: {\"answer\"}.]", Record.of("A: ", "answer", "."));
    exam.parses("[A: {%AA==}.]", Record.of("A: ", Data.fromBase64("AA=="), "."));
    exam.parses("[A: {42}.]", Record.of("A: ", 42, "."));
    exam.parses("[A: {true}.]", Record.of("A: ", true, "."));
    exam.parses("[A: {false}.]", Record.of("A: ", false, "."));
    exam.parses("[A: {answer:0.0}.]", Record.of("A: ", Slot.of("answer", 0.0), "."));
  }

  @Test
  parseMarkupWithEmbeddedSingleExtantAttributes(exam: ReconExam): void {
    exam.parses("[A: @answer.]", Record.of("A: ", Record.of(Attr.of("answer")), "."));
    exam.parses("[A: @answer().]", Record.of("A: ", Record.of(Attr.of("answer")), "."));
    exam.parses("[A: @answer(\"secret\").]", Record.of("A: ", Record.of(Attr.of("answer", "secret")), "."));
    exam.parses("[A: @answer(number: 42, true).]", Record.of("A: ", Record.of(Attr.of("answer", Record.of(Slot.of("number", 42), true))), "."));
  }

  @Test
  parseMarkupWithEmbeddedSequentialExtantAttributes(exam: ReconExam): void {
    exam.parses("[A: @good @answer.]", Record.of("A: ", Record.of(Attr.of("good")), " ", Record.of(Attr.of("answer")), "."));
    exam.parses("[A: @good@answer.]", Record.of("A: ", Record.of(Attr.of("good")), Record.of(Attr.of("answer")), "."));
    exam.parses("[A: @good() @answer().]", Record.of("A: ", Record.of(Attr.of("good")), " ", Record.of(Attr.of("answer")), "."));
    exam.parses("[A: @good()@answer().]", Record.of("A: ", Record.of(Attr.of("good")), Record.of(Attr.of("answer")), "."));
  }

  @Test
  parseMarkupWithEmbeddedAttributedMarkup(exam: ReconExam): void {
    exam.parses("[Hello, @em[world]!]", Record.of("Hello, ", Record.of(Attr.of("em"), "world"), "!"));
    exam.parses("[Hello, @em()[world]!]", Record.of("Hello, ", Record.of(Attr.of("em"), "world"), "!"));
    exam.parses("[Hello, @em(\"italic\")[world]!]", Record.of("Hello, ", Record.of(Attr.of("em", "italic"), "world"), "!"));
    exam.parses("[Hello, @em(class:\"subject\",style:\"italic\")[world]!]", Record.of("Hello, ", Record.of(Attr.of("em", Record.of(Slot.of("class", "subject"), Slot.of("style", "italic"))), "world"), "!"));
  }

  @Test
  parseMarkupWithEmbeddedAttributedValues(exam: ReconExam): void {
    exam.parses("[A: @answer{42}.]", Record.of("A: ", Record.of(Attr.of("answer"), 42), "."));
    exam.parses("[A: @answer(){42}.]", Record.of("A: ", Record.of(Attr.of("answer"), 42), "."));
    exam.parses("[A: @answer(\"secret\"){42}.]", Record.of("A: ", Record.of(Attr.of("answer", "secret"), 42), "."));
    exam.parses("[A: @answer(number: 42, secret){true}.]", Record.of("A: ", Record.of(Attr.of("answer", Record.of(Slot.of("number", 42), "secret")), true), "."));
  }

  @Test
  parseUnclosedEmptyRecordFails(exam: ReconExam): void {
    exam.parseFails("{");
    exam.parseFails("{#comment");
  }

  @Test
  parseUnclosedNonEmptyRecordFails(exam: ReconExam): void {
    exam.parseFails("{1");
    exam.parseFails("{1 ");
    exam.parseFails("{1,");
    exam.parseFails("{1#comment");
  }

  @Test
  parseUnclosedEmptyMarkupFails(exam: ReconExam): void {
    exam.parseFails("[");
  }

  @Test
  parseUnclosedNonEmptyMarkupFails(exam: ReconExam): void {
    exam.parseFails("[test");
    exam.parseFails("[test{}");
  }

  @Test
  parseUnclosedEmptyStringFails(exam: ReconExam): void {
    exam.parseFails("\"");
    exam.parseFails("'");
  }

  @Test
  parseUnclosedNonEmptyStringFails(exam: ReconExam): void {
    exam.parseFails("\"test");
    exam.parseFails("\"test\\");

    exam.parseFails("'test");
    exam.parseFails("'test\\");
  }

  @Test
  parseNakedNegativeFails(exam: ReconExam): void {
    exam.parseFails("-");
  }

  @Test
  parseTrailingDecimalFails(exam: ReconExam): void {
    exam.parseFails("1.");
  }

  @Test
  parseTrailingExponentFails(exam: ReconExam): void {
    exam.parseFails("1e");
    exam.parseFails("1E");
    exam.parseFails("1.e");
    exam.parseFails("1.E");
    exam.parseFails("1.0e");
    exam.parseFails("1.0E");
    exam.parseFails("1.0e+");
    exam.parseFails("1.0E+");
    exam.parseFails("1.0e-");
    exam.parseFails("1.0E-");
  }

  @Test
  parseUnpaddedDataFails(exam: ReconExam): void {
    exam.parseFails("%AAA");
    exam.parseFails("%AA");
    exam.parseFails("%A");
  }

  @Test
  parseMalformedDataFails(exam: ReconExam): void {
    exam.parseFails("%AA=A");
  }

  @Test
  parseKeylessAttrFails(exam: ReconExam): void {
    exam.parseFails("@");
    exam.parseFails("@()");
  }

  @Test
  parseKeylessSlotFails(exam: ReconExam): void {
    exam.parseFails(":");
    exam.parseFails(":test");
  }

  @Test
  parseTrailingValuesFails(exam: ReconExam): void {
    exam.parseFails("{}{}");
    exam.parseFails("1 2");
  }
}
