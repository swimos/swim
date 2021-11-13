// Copyright 2015-2021 Swim Inc.
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
import {ReconExam} from "../ReconExam";

export class ReconWriterSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): ReconExam {
    return new ReconExam(report, this, name, options);
  }

  @Test
  writeAbsent(exam: ReconExam): void {
    exam.writes(Value.absent(), "");
  }

  @Test
  writeExtant(exam: ReconExam): void {
    exam.writes(Value.extant(), "");
  }

  @Test
  writeEmptyRecords(exam: ReconExam): void {
    exam.writes(Record.empty(), "{}");
    exam.writesBlock(Record.empty(), "{}");
  }

  @Test
  writeUnaryRecords(exam: ReconExam): void {
    exam.writes(Record.of(1), "{1}");
    exam.writesBlock(Record.of(1), "1");
  }

  @Test
  writeNonEmptyRecords(exam: ReconExam): void {
    exam.writes(Record.of(1, 2, "3", true), "{1,2,\"3\",true}");
    exam.writesBlock(Record.of(1, 2, "3", true), "1,2,\"3\",true");
  }

  @Test
  writeNestedRecords(exam: ReconExam): void {
    exam.writes(Record.of(Record.of(1, 2), Record.of(3, 4)), "{{1,2},{3,4}}");
    exam.writesBlock(Record.of(Record.of(1, 2), Record.of(3, 4)), "{1,2},{3,4}");
  }

  @Test
  writeEmptyStrings(exam: ReconExam): void {
    exam.writes(Text.empty(), "\"\"");
  }

  @Test
  writeNonEmptyStrings(exam: ReconExam): void {
    exam.writes(Text.from("Hello, world!"), "\"Hello, world!\"");
  }

  @Test
  writeStringsWithEscapes(exam: ReconExam): void {
    exam.writes(Text.from("\"\\\b\f\n\r\t"), "\"\\\"\\\\\\b\\f\\n\\r\\t\"");
  }

  @Test
  writeIdentifiers(exam: ReconExam): void {
    exam.writes(Text.from("test"), "test");
  }

  @Test
  writeEmptyData(exam: ReconExam): void {
    exam.writes(Data.empty(), "%");
  }

  @Test
  writeNonEmptyData(exam: ReconExam): void {
    exam.writes(Data.fromBase64("AAAA"), "%AAAA");
    exam.writes(Data.fromBase64("AAA="), "%AAA=");
    exam.writes(Data.fromBase64("AA=="), "%AA==");
    exam.writes(Data.fromBase64("ABCDabcd12/+"), "%ABCDabcd12/+");
    exam.writes(Data.fromBase64("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+"),
                "%ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+");
  }

  @Test
  writeDataValuesWithinRecords(exam: ReconExam): void {
    exam.writes(Record.of(Data.fromBase64("AAAA")), "{%AAAA}");
    exam.writesBlock(Record.of(Data.fromBase64("AAAA")), "%AAAA");
  }

  @Test
  writeNumbers(exam: ReconExam): void {
    exam.writes(Num.from(0), "0");
    exam.writes(Num.from(1), "1");
    exam.writes(Num.from(-1), "-1");
    exam.writes(Num.from(15), "15");
    exam.writes(Num.from(-20), "-20");
    exam.writes(Num.from(3.14), "3.14");
    exam.writes(Num.from(-0.5), "-0.5");
    exam.writes(Num.from(6.02e+23), "6.02e+23");
    exam.writes(Num.from(2147483647), "2147483647");
    exam.writes(Num.from(-2147483648), "-2147483648");
    exam.writes(Num.from(9007199254740992), "9007199254740992");
    exam.writes(Num.from(-9007199254740991), "-9007199254740991");
  }

  @Test
  writeUint32(exam: ReconExam): void {
    exam.writes(Num.uint32(0x00000000), "0x00000000");
    exam.writes(Num.uint32(0x00000001), "0x00000001");
    exam.writes(Num.uint32(0x00000010), "0x00000010");
    exam.writes(Num.uint32(0x00000100), "0x00000100");
    exam.writes(Num.uint32(0x00001000), "0x00001000");
    exam.writes(Num.uint32(0x00010000), "0x00010000");
    exam.writes(Num.uint32(0x00100000), "0x00100000");
    exam.writes(Num.uint32(0x01000000), "0x01000000");
    exam.writes(Num.uint32(0x10000000), "0x10000000");
    exam.writes(Num.uint32(0xffffffff), "0xffffffff");
    exam.writes(Num.uint32(0xfedcba98), "0xfedcba98");
    exam.writes(Num.uint32(0x01234567), "0x01234567");
  }

  @Test
  writeBooleans(exam: ReconExam): void {
    exam.writes(Bool.from(true), "true");
    exam.writes(Bool.from(false), "false");
  }

  @Test
  writeExtantAttrs(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("answer")), "@answer");
  }

  @Test
  writeAttrsWithAbsentParams(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("answer", Value.absent())), "@answer()");
  }

  @Test
  writeAttrsWithQuotedNames(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("@at")), "@\"@at\"");
    exam.writes(Record.of(Attr.of("@at", Value.absent())), "@\"@at\"()");
  }

  @Test
  writeAttrsWithSingleParams(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("answer", Record.empty())), "@answer({})");
    exam.writes(Record.of(Attr.of("answer", "42")), "@answer(\"42\")");
    exam.writes(Record.of(Attr.of("answer", 42)), "@answer(42)");
    exam.writes(Record.of(Attr.of("answer", true)), "@answer(true)");
  }

  @Test
  writeAttrsWithMultipleParams(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("answer", Record.of(42, true))), "@answer(42,true)");
  }

  @Test
  writeAttrsWithNamedParams(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("answer", Record.of(Slot.of("number", 42)))), "@answer(number:42)");
  }

  @Test
  writeRecordsWithIdentKeyedSlots(exam: ReconExam): void {
    exam.writes(Record.of(Slot.of("a", 1)), "{a:1}");
    exam.writes(Record.of(Slot.of("a", 1), false, Slot.of("c", 3)), "{a:1,false,c:3}");
    exam.writesBlock(Record.of(Slot.of("a", 1)), "a:1");
    exam.writesBlock(Record.of(Slot.of("a", 1), false, Slot.of("c", 3)), "a:1,false,c:3");
  }

  @Test
  writeRecordsWithValueKeyedSlots(exam: ReconExam): void {
    exam.writes(Record.of(Slot.of(Num.from(1), "one"), Slot.of(Record.of(Attr.of("id"), "foo"), "bar")), "{1:one,@id foo:bar}");
    exam.writesBlock(Record.of(Slot.of(Num.from(1), "one"), Slot.of(Record.of(Attr.of("id"), "foo"), "bar")), "1:one,@id foo:bar");
  }

  @Test
  writeRecordsWithExtantSlots(exam: ReconExam): void {
    exam.writes(Record.of(Slot.of("blank")), "{blank:}");
    exam.writesBlock(Record.of(Slot.of("blank")), "blank:");
  }

  @Test
  writePrefixAttributedEmptyRecords(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("hello"), Record.empty()), "@hello{{}}");
  }

  @Test
  writePrefixAttributedNonEmptyText(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("hello"), "world!"), "@hello\"world!\"");
  }

  @Test
  writePrefixAttributedIdents(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("answer"), "test"), "@answer test");
  }

  @Test
  writePrefixAttributedNumbers(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("answer"), 42), "@answer 42");
  }

  @Test
  writePrefixAttributedSlots(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("hello"), Slot.of("subject", "world!")), "@hello{subject:\"world!\"}");
  }

  @Test
  writePostfixEmptyRecords(exam: ReconExam): void {
    exam.writes(Record.of(Record.empty(), Attr.of("signed")), "{{}}@signed");
  }

  @Test
  writePostfixAttributedEmptyText(exam: ReconExam): void {
    exam.writes(Record.of("", Attr.of("signed")), "\"\"@signed");
  }

  @Test
  writePostfixAttributedNonEmptyText(exam: ReconExam): void {
    exam.writes(Record.of("world!", Attr.of("signed")), "\"world!\"@signed");
  }

  @Test
  writePostfixAttributedIdents(exam: ReconExam): void {
    exam.writes(Record.of("test", Attr.of("signed")), "test@signed");
  }

  @Test
  writePostfixAttributedNumbers(exam: ReconExam): void {
    exam.writes(Record.of(42, Attr.of("signed")), "42@signed");
  }

  @Test
  writePostfixAttributedSlots(exam: ReconExam): void {
    exam.writes(Record.of(Slot.of("subject", "world!"), Attr.of("signed")), "{subject:\"world!\"}@signed");
  }

  @Test
  writeSingleValuesWithMultiplePostfixAttributes(exam: ReconExam): void {
    exam.writes(Record.of(6, Attr.of("months"), Attr.of("remaining")), "6@months@remaining");
  }

  @Test
  writeSingleValuesWithCircumfixAttributes(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("a"), Attr.of("b"), false, Attr.of("x"), Attr.of("y")), "@a@b false@x@y");
  }

  @Test
  writeSingleValuesWithInterspersedAttributes(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("a"), 1, Attr.of("b"), 2), "@a 1@b 2");
  }

  @Test
  writeSingleValuesWithInterspersedAttributeGroups(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("a"), Attr.of("b"), 1, Attr.of("c"), Attr.of("d"), 2), "@a@b 1@c@d 2");
  }

  @Test
  writeMultipleValuesWithMultiplePostfixAtributes(exam: ReconExam): void {
    exam.writes(Record.of(1, 2, Attr.of("x"), Attr.of("y")), "{1,2}@x@y");
  }

  @Test
  writeMultipleValuesWithMultipleCircumfixAtributes(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("a"), Attr.of("b"), 1, 2, Attr.of("x"), Attr.of("y")), "@a@b{1,2}@x@y");
  }

  @Test
  writeMultipleValuesWithMultipleInterspersedAtributes(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("a"), 1, 2, Attr.of("b"), 3, 4), "@a{1,2}@b{3,4}");
  }

  @Test
  writeMultipleValuesWithMultipleInterspersedAtributeGroups(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("a"), Attr.of("b"), 1, 2, Attr.of("c"), Attr.of("d"), 3, 4), "@a@b{1,2}@c@d{3,4}");
  }

  @Test
  writeSimpleMarkup(exam: ReconExam): void {
    exam.writes(Record.of("Hello, ", Record.of(Attr.of("em"), "world"), "!"), "[Hello, @em[world]!]");
    exam.writes(Record.of("Hello, ", Record.of(Attr.of("em", Record.of(Slot.of("class", "subject"))), "world"), "!"), "[Hello, @em(class:subject)[world]!]");
  }

  @Test
  writeNestedMarkup(exam: ReconExam): void {
    exam.writes(Record.of("X ", Record.of(Attr.of("p"), "Y ", Record.of(Attr.of("q"), "Z"), "."), "."), "[X @p[Y @q[Z].].]");
  }

  @Test
  writeMarkupWithNonPrefixAttributes(exam: ReconExam): void {
    exam.writes(Record.of("X ", Record.of(Attr.of("p"), "Y.", Attr.of("q")), "."), "[X {@p\"Y.\"@q}.]");
  }

  @Test
  writeMarkupInAttributeParameters(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("msg", Record.of("Hello, ", Record.of(Attr.of("em"), "world"), "!"))), "@msg([Hello, @em[world]!])");
  }

  @Test
  writeMarkupEmbeddedValues(exam: ReconExam): void {
    exam.writes(Record.of("Hello, ", 6), "[Hello, {6}]");
    exam.writes(Record.of("Hello, ", 6, "!"), "[Hello, {6}!]");
    exam.writes(Record.of("Hello, ", 6, 7, "!"), "[Hello, {6,7}!]");
  }

  @Test
  writeMarkupEmbeddedValuesWithSubsequentAttributes(exam: ReconExam): void {
    exam.writes(Record.of("Wait ", 1, Attr.of("second"), " longer", Record.of(Attr.of("please"))), "[Wait {1}]@second[ longer@please]");
    exam.writes(Record.of("Wait ", 1, 2, Attr.of("second"), " longer", Record.of(Attr.of("please"))), "[Wait {1,2}]@second[ longer@please]");
  }

  @Test
  writeMarkupEmbeddedRecords(exam: ReconExam): void {
    exam.writes(Record.of("Hello, ", Record.empty(), "!"), "[Hello, {{}}!]");
    exam.writes(Record.of("Hello, ", Record.of(1), "!"), "[Hello, {{1}}!]");
    exam.writes(Record.of("Hello, ", Record.of(1, 2), "!"), "[Hello, {{1,2}}!]");
  }

  @Test
  writeMarkupEmbeddedAttributedValues(exam: ReconExam): void {
    exam.writes(Record.of("Hello, ", Record.of(Attr.of("number"), 6), "!"), "[Hello, @number{6}!]");
  }

  @Test
  writeMarkupEmbeddedAttributedRecords(exam: ReconExam): void {
    exam.writes(Record.of("Hello, ", Record.of(Attr.of("choice"), "Earth", "Mars"), "!"), "[Hello, @choice{Earth,Mars}!]");
  }

  @Test
  writeMarkupEmbeddedAttributedRecordsWithNonPrefixAttributes(exam: ReconExam): void {
    exam.writes(Record.of("Hello, ", Record.of(1, Attr.of("second")), "!"), "[Hello, {1@second}!]");
  }
}
