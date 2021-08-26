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

import {Spec, Test, Exam} from "@swim/unit";
import {Severity} from "@swim/util";
import {Mark, Span, OutputSettings, Diagnostic, Unicode} from "@swim/codec";

export class DiagnosticSpec extends Spec {
  printDiagnostic(diagnostic: Diagnostic): void {
    console.log(diagnostic.toString(OutputSettings.styled()));
  }

  @Test
  testOneLineMarkAtStart(exam: Exam): void {
    const input = Unicode.stringInput("Hello, world!\n").withId("input");
    const mark = Mark.at(0, 1, 1);
    const diagnostic = Diagnostic.create(input, mark, Severity.debug());
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), " --> input:1:1\n"
                                    + "  |\n"
                                    + "1 | Hello, world!\n"
                                    + "  | ^");
  }

  @Test
  testOneLineMarkAtNewline(exam: Exam): void {
    const input = Unicode.stringInput("Hello, world!\n").withId("input");
    const mark = Mark.at(13, 1, 14);
    const diagnostic = Diagnostic.create(input, mark, Severity.debug());
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), " --> input:1:14\n"
                                    + "  |\n"
                                    + "1 | Hello, world!\n"
                                    + "  |              ^");
  }

  @Test
  testOneLineMark(exam: Exam): void {
    const input = Unicode.stringInput("Hello, world!\n").withId("input");
    const mark = Mark.at(5, 1, 6);
    const diagnostic = Diagnostic.create(input, mark, Severity.info());
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), " --> input:1:6\n"
                                    + "  |\n"
                                    + "1 | Hello, world!\n"
                                    + "  |      ^");
  }

  @Test
  testOneLineMarkWithNote(exam: Exam): void {
    const input = Unicode.stringInput("Hello, world!\n").withId("input");
    const mark = Mark.at(5, 1, 6, "comma");
    const diagnostic = Diagnostic.create(input, mark, Severity.note(), void 0, "optional punctuation");
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), " --> input:1:6\n"
                                    + "  |\n"
                                    + "1 | Hello, world!\n"
                                    + "  |      ^ comma\n"
                                    + "  |\n"
                                    + "  = note: optional punctuation");
  }

  @Test
  testOneLineMarkNoNewline(exam: Exam): void {
    const input = Unicode.stringInput("Hello, world!").withId("input");
    const mark = Mark.at(5, 1, 6);
    const diagnostic = Diagnostic.create(input, mark, Severity.warning());
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), " --> input:1:6\n"
                                    + "  |\n"
                                    + "1 | Hello, world!\n"
                                    + "  |      ^");
  }

  @Test
  testOneLineSpan(exam: Exam): void {
    const input = Unicode.stringInput("Hello, wordl!\n").withId("input");
    const span = Span.from(Mark.at(7, 1, 8), Mark.at(11, 1, 12));
    const diagnostic = Diagnostic.create(input, span, Severity.warning());
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), " --> input:1:8\n"
                                    + "  |\n"
                                    + "1 | Hello, wordl!\n"
                                    + "  |        ^^^^^");
  }

  @Test
  testOneLineSpanWithMessageAndNotes(exam: Exam): void {
    const input = Unicode.stringInput("Hello, wordl!\n").withId("input");
    const span = Span.from(Mark.at(7, 1, 8), Mark.at(11, 1, 12, "did you mean 'world'?"));
    const diagnostic = Diagnostic.create(input, span, Severity.warning(), "check your spelling");
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), "warning: check your spelling\n"
                                    + " --> input:1:8\n"
                                    + "  |\n"
                                    + "1 | Hello, wordl!\n"
                                    + "  |        ^^^^^ did you mean 'world'?");
  }

  @Test
  testOneLineNumberPadding(exam: Exam): void {
    const input = Unicode.stringInput("\n\n\n\n\n\n\n\n\nHello, world!\n").withId("input");
    const mark = Mark.at(14, 10, 6);
    const diagnostic = Diagnostic.create(input, mark, Severity.warning());
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), "  --> input:10:6\n"
                                    + "   |\n"
                                    + "10 | Hello, world!\n"
                                    + "   |      ^");
  }

  @Test
  testTwoLineSpan(exam: Exam): void {
    const input = Unicode.stringInput("@test {\"\n"
                                    + "}\"\n").withId("input");
    const span = Span.from(Mark.at(6, 1, 7), Mark.at(10, 2, 2));
    const diagnostic = Diagnostic.create(input, span, Severity.error());
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), " --> input:1:7\n"
                                    + "  |\n"
                                    + "1 |   @test {\"\n"
                                    + "  |  _______^\n"
                                    + "2 | | }\"\n"
                                    + "  | |__^");
  }

  @Test
  testTwoLineSpanWithMessageAndNotes(exam: Exam): void {
    const input = Unicode.stringInput("@test {\"\n"
                                    + "}\"\n").withId("input");
    const span = Span.from(Mark.at(6, 1, 7, "opened here"), Mark.at(10, 2, 2, "implicitly closed"));
    const diagnostic = Diagnostic.create(input, span, Severity.error(), "unclosed block", "check delimiter ordering");
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), "error: unclosed block\n"
                                    + " --> input:1:7\n"
                                    + "  |\n"
                                    + "1 |   @test {\"\n"
                                    + "  |  _______^ opened here\n"
                                    + "2 | | }\"\n"
                                    + "  | |__^ implicitly closed\n"
                                    + "  |\n"
                                    + "  = note: check delimiter ordering");
  }

  @Test
  testSevenLineSpan(exam: Exam): void {
    const input = Unicode.stringInput("@test {\n"
                                    + "  a: 1\n"
                                    + "  b: 2\n"
                                    + "  c: 3\n"
                                    + "  d: 4\n"
                                    + "  e: 5\n"
                                    + "]\n").withId("input");
    const span = Span.from(Mark.at(6, 1, 7), Mark.at(43, 7, 1));
    const diagnostic = Diagnostic.create(input, span, Severity.error());
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), " --> input:1:7\n"
                                    + "  |\n"
                                    + "1 |   @test {\n"
                                    + "  |  _______^\n"
                                    + "2 | |   a: 1\n"
                                    + "3 | |   b: 2\n"
                                    + "4 | |   c: 3\n"
                                    + "5 | |   d: 4\n"
                                    + "6 | |   e: 5\n"
                                    + "7 | | ]\n"
                                    + "  | |_^");
  }

  @Test
  testSevenLineSpanWithNotes(exam: Exam): void {
    const input = Unicode.stringInput("@test {\n"
                                    + "  a: 1\n"
                                    + "  b: 2\n"
                                    + "  c: 3\n"
                                    + "  d: 4\n"
                                    + "  e: 5\n"
                                    + "]\n").withId("input");
    const span = Span.from(Mark.at(6, 1, 7, "opened here"), Mark.at(43, 7, 1, "implicitly closed"));
    const diagnostic = Diagnostic.create(input, span, Severity.error());
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), " --> input:1:7\n"
                                    + "  |\n"
                                    + "1 |   @test {\n"
                                    + "  |  _______^ opened here\n"
                                    + "2 | |   a: 1\n"
                                    + "3 | |   b: 2\n"
                                    + "4 | |   c: 3\n"
                                    + "5 | |   d: 4\n"
                                    + "6 | |   e: 5\n"
                                    + "7 | | ]\n"
                                    + "  | |_^ implicitly closed");
  }

  @Test
  testTenLineSpan(exam: Exam): void {
    const input = Unicode.stringInput("@test {\n"
                                    + "  a: 1\n"
                                    + "  b: 2\n"
                                    + "  c: 3\n"
                                    + "  d: 4\n"
                                    + "  e: 5\n"
                                    + "  f: 6\n"
                                    + "  g: 7\n"
                                    + "  h: 8\n"
                                    + "]\n").withId("input");
    const span = Span.from(Mark.at(6, 1, 7), Mark.at(64, 10, 1));
    const diagnostic = Diagnostic.create(input, span, Severity.error());
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), "  --> input:1:7\n"
                                    + "   |\n"
                                    + " 1 |   @test {\n"
                                    + "   |  _______^\n"
                                    + " 2 | |   a: 1\n"
                                    + " 3 | |   b: 2\n"
                                    + "..   |\n"
                                    + " 8 | |   g: 7\n"
                                    + " 9 | |   h: 8\n"
                                    + "10 | | ]\n"
                                    + "   | |_^");
  }

  @Test
  testTenLineSpanWithNotes(exam: Exam): void {
    const input = Unicode.stringInput("@test {\n"
                                    + "  a: 1\n"
                                    + "  b: 2\n"
                                    + "  c: 3\n"
                                    + "  d: 4\n"
                                    + "  e: 5\n"
                                    + "  f: 6\n"
                                    + "  g: 7\n"
                                    + "  h: 8\n"
                                    + "]\n").withId("input");
    const span = Span.from(Mark.at(6, 1, 7, "opened here"), Mark.at(64, 10, 1, "implicitly closed"));
    const diagnostic = Diagnostic.create(input, span, Severity.error());
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), "  --> input:1:7\n"
                                    + "   |\n"
                                    + " 1 |   @test {\n"
                                    + "   |  _______^ opened here\n"
                                    + " 2 | |   a: 1\n"
                                    + " 3 | |   b: 2\n"
                                    + "..   |\n"
                                    + " 8 | |   g: 7\n"
                                    + " 9 | |   h: 8\n"
                                    + "10 | | ]\n"
                                    + "   | |_^ implicitly closed");
  }

  @Test
  testCauseBeforeError(exam: Exam): void {
    const input = Unicode.stringInput("@test {\n"
                                    + "  foo: 1\n"
                                    + "  bar: 2\n"
                                    + "  foo: 3\n"
                                    + "]\n").withId("input");
    const span0 = Span.from(Mark.at(10, 2, 3), Mark.at(12, 2, 5, "first use"));
    const cause = Diagnostic.create(input, span0, Severity.note());
    const span1 = Span.from(Mark.at(28, 4, 3), Mark.at(30, 4, 5, "second use"));
    const diagnostic = Diagnostic.create(input, span1, Severity.error(), "duplicate field", cause);
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), "error: duplicate field\n"
                                    + " --> input:4:3\n"
                                    + "  |\n"
                                    + "2 |   foo: 1\n"
                                    + "  |   ^^^ first use\n"
                                    + ".  \n"
                                    + "4 |   foo: 3\n"
                                    + "  |   ^^^ second use");
  }

  @Test
  testCauseAfterError(exam: Exam): void {
    const input = Unicode.stringInput("@test {\n"
                                    + "  foo: 1\n"
                                    + "  bar: 2\n"
                                    + "  foo: 3\n"
                                    + "]\n").withId("input");
    const span0 = Span.from(Mark.at(28, 4, 3), Mark.at(30, 4, 5, "clobbered here"));
    const cause = Diagnostic.create(input, span0, Severity.note());
    const span1 = Span.from(Mark.at(10, 2, 3), Mark.at(12, 2, 5, "defined here"));
    const diagnostic = Diagnostic.create(input, span1, Severity.error(), "clobbered field", cause);
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), "error: clobbered field\n"
                                    + " --> input:2:3\n"
                                    + "  |\n"
                                    + "2 |   foo: 1\n"
                                    + "  |   ^^^ defined here\n"
                                    + ".  \n"
                                    + "4 |   foo: 3\n"
                                    + "  |   ^^^ clobbered here");
  }

  @Test
  testMultiMessageCause(exam: Exam): void {
    const input = Unicode.stringInput("@test {\n"
                                    + "  foo: 1\n"
                                    + "  bar: 2\n"
                                    + "  foo: 3\n"
                                    + "]\n").withId("input");
    const span0 = Span.from(Mark.at(10, 2, 3), Mark.at(12, 2, 5, "first use"));
    const cause = Diagnostic.create(input, span0, Severity.note(), "clobbered field");
    const span1 = Span.from(Mark.at(28, 4, 3), Mark.at(30, 4, 5, "second use"));
    const diagnostic = Diagnostic.create(input, span1, Severity.error(), "duplicate field", cause);
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), "error: duplicate field\n"
                                    + " --> input:4:3\n"
                                    + "  |\n"
                                    + "4 |   foo: 3\n"
                                    + "  |   ^^^ second use\n"
                                    + "note: clobbered field\n"
                                    + " --> input:2:3\n"
                                    + "  |\n"
                                    + "2 |   foo: 1\n"
                                    + "  |   ^^^ first use");
  }

  @Test
  testMultiInputCause(exam: Exam): void {
    const input0 = Unicode.stringInput("test: true\n").withId("input0");
    const span0 = Span.from(Mark.at(0, 1, 1), Mark.at(3, 1, 4, "original definition"));
    const cause = Diagnostic.create(input0, span0, Severity.note());
    const input1 = Unicode.stringInput("test: false\n").withId("input1");
    const span1 = Span.from(Mark.at(0, 1, 1), Mark.at(3, 1, 4, "duplicate definition"));
    const diagnostic = Diagnostic.create(input1, span1, Severity.error(), "ambiguous definition", cause);
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), "error: ambiguous definition\n"
                                    + " --> input1:1:1\n"
                                    + "  |\n"
                                    + "1 | test: false\n"
                                    + "  | ^^^^ duplicate definition\n"
                                    + " --> input0:1:1\n"
                                    + "  |\n"
                                    + "1 | test: true\n"
                                    + "  | ^^^^ original definition");
  }

  @Test
  testMultiInputMultiMessageCause(exam: Exam): void {
    const input0 = Unicode.stringInput("test: true\n").withId("input0");
    const span0 = Span.from(Mark.at(0, 1, 1), Mark.at(3, 1, 4, "original definition"));
    const cause = Diagnostic.create(input0, span0, Severity.note(), "clobbered declaration");
    const input1 = Unicode.stringInput("test: false\n").withId("input1");
    const span1 = Span.from(Mark.at(0, 1, 1), Mark.at(3, 1, 4, "duplicate definition"));
    const diagnostic = Diagnostic.create(input1, span1, Severity.error(), "ambiguous definition", cause);
    this.printDiagnostic(diagnostic);
    exam.equal(diagnostic.toString(), "error: ambiguous definition\n"
                                    + " --> input1:1:1\n"
                                    + "  |\n"
                                    + "1 | test: false\n"
                                    + "  | ^^^^ duplicate definition\n"
                                    + "note: clobbered declaration\n"
                                    + " --> input0:1:1\n"
                                    + "  |\n"
                                    + "1 | test: true\n"
                                    + "  | ^^^^ original definition");
  }
}
