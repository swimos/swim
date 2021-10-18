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

package swim.codec;

import org.testng.annotations.Test;
import swim.util.Severity;
import static org.testng.Assert.assertEquals;

public class DiagnosticSpec {

  @Test
  public void testOneLineMarkAtStart() {
    final Input input = Unicode.stringInput("Hello, world!" + Format.lineSeparator()).id("input");
    final Mark mark = Mark.at(0L, 1, 1);
    final Diagnostic diagnostic = Diagnostic.create(input, mark, Severity.debug());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 " --> input:1:1" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "1 | Hello, world!" + Format.lineSeparator()
               + "  | ^");
  }

  @Test
  public void testOneLineMarkAtNewline() {
    final Input input = Unicode.stringInput("Hello, world!" + Format.lineSeparator()).id("input");
    final Mark mark = Mark.at(13L, 1, 14);
    final Diagnostic diagnostic = Diagnostic.create(input, mark, Severity.debug());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 " --> input:1:14" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "1 | Hello, world!" + Format.lineSeparator()
               + "  |              ^");
  }

  @Test
  public void testOneLineMark() {
    final Input input = Unicode.stringInput("Hello, world!" + Format.lineSeparator()).id("input");
    final Mark mark = Mark.at(5L, 1, 6);
    final Diagnostic diagnostic = Diagnostic.create(input, mark, Severity.info());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 " --> input:1:6" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "1 | Hello, world!" + Format.lineSeparator()
               + "  |      ^");
  }

  @Test
  public void testOneLineMarkWithNote() {
    final Input input = Unicode.stringInput("Hello, world!" + Format.lineSeparator()).id("input");
    final Mark mark = Mark.at(5L, 1, 6, "comma");
    final Diagnostic diagnostic = Diagnostic.create(input, mark, Severity.note(), null, "optional punctuation");
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 " --> input:1:6" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "1 | Hello, world!" + Format.lineSeparator()
               + "  |      ^ comma" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "  = note: optional punctuation");
  }

  @Test
  public void testOneLineMarkNoNewline() {
    final Input input = Unicode.stringInput("Hello, world!").id("input");
    final Mark mark = Mark.at(5L, 1, 6);
    final Diagnostic diagnostic = Diagnostic.create(input, mark, Severity.warning());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 " --> input:1:6" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "1 | Hello, world!" + Format.lineSeparator()
               + "  |      ^");
  }

  @Test
  public void testOneLineSpan() {
    final Input input = Unicode.stringInput("Hello, wordl!" + Format.lineSeparator()).id("input");
    final Span span = Span.from(Mark.at(7L, 1, 8), Mark.at(11L, 1, 12));
    final Diagnostic diagnostic = Diagnostic.create(input, span, Severity.warning());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 " --> input:1:8" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "1 | Hello, wordl!" + Format.lineSeparator()
               + "  |        ^^^^^");
  }

  @Test
  public void testOneLineSpanWithMessageAndNotes() {
    final Input input = Unicode.stringInput("Hello, wordl!" + Format.lineSeparator()).id("input");
    final Span span = Span.from(Mark.at(7L, 1, 8), Mark.at(11L, 1, 12, "did you mean 'world'?"));
    final Diagnostic diagnostic = Diagnostic.create(input, span, Severity.warning(), "check your spelling");
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 "warning: check your spelling" + Format.lineSeparator()
               + " --> input:1:8" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "1 | Hello, wordl!" + Format.lineSeparator()
               + "  |        ^^^^^ did you mean 'world'?");
  }

  @Test
  public void testOneLineNumberPadding() {
    final Input input = Unicode.stringInput("\n\n\n\n\n\n\n\n\nHello, world!" + Format.lineSeparator()).id("input");
    final Mark mark = Mark.at(14L, 10, 6);
    final Diagnostic diagnostic = Diagnostic.create(input, mark, Severity.warning());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 "  --> input:10:6" + Format.lineSeparator()
               + "   |" + Format.lineSeparator()
               + "10 | Hello, world!" + Format.lineSeparator()
               + "   |      ^");
  }

  @Test
  public void testTwoLineSpan() {
    final Input input = Unicode.stringInput("@test {\"" + Format.lineSeparator()
                                          + "}\"" + Format.lineSeparator()).id("input");
    final Span span = Span.from(Mark.at(6L, 1, 7), Mark.at(10L, 2, 2));
    final Diagnostic diagnostic = Diagnostic.create(input, span, Severity.error());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 " --> input:1:7" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "1 |   @test {\"" + Format.lineSeparator()
               + "  |  _______^" + Format.lineSeparator()
               + "2 | | }\"" + Format.lineSeparator()
               + "  | |__^");
  }

  @Test
  public void testTwoLineSpanWithMessageAndNotes() {
    final Input input = Unicode.stringInput("@test {\"" + Format.lineSeparator()
                                          + "}\"" + Format.lineSeparator()).id("input");
    final Span span = Span.from(Mark.at(6L, 1, 7, "opened here"), Mark.at(10L, 2, 2, "implicitly closed"));
    final Diagnostic diagnostic = Diagnostic.create(input, span, Severity.error(), "unclosed block", "check delimiter ordering");
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 "error: unclosed block" + Format.lineSeparator()
               + " --> input:1:7" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "1 |   @test {\"" + Format.lineSeparator()
               + "  |  _______^ opened here" + Format.lineSeparator()
               + "2 | | }\"" + Format.lineSeparator()
               + "  | |__^ implicitly closed" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "  = note: check delimiter ordering");
  }

  @Test
  public void testSevenLineSpan() {
    final Input input = Unicode.stringInput("@test {" + Format.lineSeparator()
                                          + "  a: 1" + Format.lineSeparator()
                                          + "  b: 2" + Format.lineSeparator()
                                          + "  c: 3" + Format.lineSeparator()
                                          + "  d: 4" + Format.lineSeparator()
                                          + "  e: 5" + Format.lineSeparator()
                                          + "]" + Format.lineSeparator()).id("input");
    final Span span = Span.from(Mark.at(6L, 1, 7), Mark.at(43L, 7, 1));
    final Diagnostic diagnostic = Diagnostic.create(input, span, Severity.error());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 " --> input:1:7" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "1 |   @test {" + Format.lineSeparator()
               + "  |  _______^" + Format.lineSeparator()
               + "2 | |   a: 1" + Format.lineSeparator()
               + "3 | |   b: 2" + Format.lineSeparator()
               + "4 | |   c: 3" + Format.lineSeparator()
               + "5 | |   d: 4" + Format.lineSeparator()
               + "6 | |   e: 5" + Format.lineSeparator()
               + "7 | | ]" + Format.lineSeparator()
               + "  | |_^");
  }

  @Test
  public void testSevenLineSpanWithNotes() {
    final Input input = Unicode.stringInput("@test {" + Format.lineSeparator()
                                          + "  a: 1" + Format.lineSeparator()
                                          + "  b: 2" + Format.lineSeparator()
                                          + "  c: 3" + Format.lineSeparator()
                                          + "  d: 4" + Format.lineSeparator()
                                          + "  e: 5" + Format.lineSeparator()
                                          + "]" + Format.lineSeparator()).id("input");
    final Span span = Span.from(Mark.at(6L, 1, 7, "opened here"), Mark.at(43L, 7, 1, "implicitly closed"));
    final Diagnostic diagnostic = Diagnostic.create(input, span, Severity.error());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 " --> input:1:7" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "1 |   @test {" + Format.lineSeparator()
               + "  |  _______^ opened here" + Format.lineSeparator()
               + "2 | |   a: 1" + Format.lineSeparator()
               + "3 | |   b: 2" + Format.lineSeparator()
               + "4 | |   c: 3" + Format.lineSeparator()
               + "5 | |   d: 4" + Format.lineSeparator()
               + "6 | |   e: 5" + Format.lineSeparator()
               + "7 | | ]" + Format.lineSeparator()
               + "  | |_^ implicitly closed");
  }

  @Test
  public void testTenLineSpan() {
    final Input input = Unicode.stringInput("@test {" + Format.lineSeparator()
                                          + "  a: 1" + Format.lineSeparator()
                                          + "  b: 2" + Format.lineSeparator()
                                          + "  c: 3" + Format.lineSeparator()
                                          + "  d: 4" + Format.lineSeparator()
                                          + "  e: 5" + Format.lineSeparator()
                                          + "  f: 6" + Format.lineSeparator()
                                          + "  g: 7" + Format.lineSeparator()
                                          + "  h: 8" + Format.lineSeparator()
                                          + "]" + Format.lineSeparator()).id("input");
    final Span span = Span.from(Mark.at(6L, 1, 7), Mark.at(64L, 10, 1));
    final Diagnostic diagnostic = Diagnostic.create(input, span, Severity.error());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 "  --> input:1:7" + Format.lineSeparator()
               + "   |" + Format.lineSeparator()
               + " 1 |   @test {" + Format.lineSeparator()
               + "   |  _______^" + Format.lineSeparator()
               + " 2 | |   a: 1" + Format.lineSeparator()
               + " 3 | |   b: 2" + Format.lineSeparator()
               + "..   |" + Format.lineSeparator()
               + " 8 | |   g: 7" + Format.lineSeparator()
               + " 9 | |   h: 8" + Format.lineSeparator()
               + "10 | | ]" + Format.lineSeparator()
               + "   | |_^");
  }

  @Test
  public void testTenLineSpanWithNotes() {
    final Input input = Unicode.stringInput("@test {" + Format.lineSeparator()
                                          + "  a: 1" + Format.lineSeparator()
                                          + "  b: 2" + Format.lineSeparator()
                                          + "  c: 3" + Format.lineSeparator()
                                          + "  d: 4" + Format.lineSeparator()
                                          + "  e: 5" + Format.lineSeparator()
                                          + "  f: 6" + Format.lineSeparator()
                                          + "  g: 7" + Format.lineSeparator()
                                          + "  h: 8" + Format.lineSeparator()
                                          + "]" + Format.lineSeparator()).id("input");
    final Span span = Span.from(Mark.at(6L, 1, 7, "opened here"), Mark.at(64L, 10, 1, "implicitly closed"));
    final Diagnostic diagnostic = Diagnostic.create(input, span, Severity.error());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 "  --> input:1:7" + Format.lineSeparator()
               + "   |" + Format.lineSeparator()
               + " 1 |   @test {" + Format.lineSeparator()
               + "   |  _______^ opened here" + Format.lineSeparator()
               + " 2 | |   a: 1" + Format.lineSeparator()
               + " 3 | |   b: 2" + Format.lineSeparator()
               + "..   |" + Format.lineSeparator()
               + " 8 | |   g: 7" + Format.lineSeparator()
               + " 9 | |   h: 8" + Format.lineSeparator()
               + "10 | | ]" + Format.lineSeparator()
               + "   | |_^ implicitly closed");
  }

  @Test
  public void testCauseBeforeError() {
    final Input input = Unicode.stringInput("@test {" + Format.lineSeparator()
                                          + "  foo: 1" + Format.lineSeparator()
                                          + "  bar: 2" + Format.lineSeparator()
                                          + "  foo: 3" + Format.lineSeparator()
                                          + "]" + Format.lineSeparator()).id("input");
    final Span span0 = Span.from(Mark.at(10L, 2, 3), Mark.at(12L, 2, 5, "first use"));
    final Diagnostic cause = Diagnostic.create(input, span0, Severity.note());
    final Span span1 = Span.from(Mark.at(28L, 4, 3), Mark.at(30L, 4, 5, "second use"));
    final Diagnostic diagnostic = Diagnostic.create(input, span1, Severity.error(), "duplicate field", cause);
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 "error: duplicate field" + Format.lineSeparator()
               + " --> input:4:3" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "2 |   foo: 1" + Format.lineSeparator()
               + "  |   ^^^ first use" + Format.lineSeparator()
               + ".  " + Format.lineSeparator()
               + "4 |   foo: 3" + Format.lineSeparator()
               + "  |   ^^^ second use");
  }

  @Test
  public void testCauseAfterError() {
    final Input input = Unicode.stringInput("@test {" + Format.lineSeparator()
                                          + "  foo: 1" + Format.lineSeparator()
                                          + "  bar: 2" + Format.lineSeparator()
                                          + "  foo: 3" + Format.lineSeparator()
                                          + "]" + Format.lineSeparator()).id("input");
    final Span span0 = Span.from(Mark.at(28L, 4, 3), Mark.at(30L, 4, 5, "clobbered here"));
    final Diagnostic cause = Diagnostic.create(input, span0, Severity.note());
    final Span span1 = Span.from(Mark.at(10L, 2, 3), Mark.at(12L, 2, 5, "defined here"));
    final Diagnostic diagnostic = Diagnostic.create(input, span1, Severity.error(), "clobbered field", cause);
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                  "error: clobbered field" + Format.lineSeparator()
                + " --> input:2:3" + Format.lineSeparator()
                + "  |" + Format.lineSeparator()
                + "2 |   foo: 1" + Format.lineSeparator()
                + "  |   ^^^ defined here" + Format.lineSeparator()
                + ".  " + Format.lineSeparator()
                + "4 |   foo: 3" + Format.lineSeparator()
                + "  |   ^^^ clobbered here");
  }

  @Test
  public void testMultiMessageCause() {
    final Input input = Unicode.stringInput("@test {" + Format.lineSeparator()
                                          + "  foo: 1" + Format.lineSeparator()
                                          + "  bar: 2" + Format.lineSeparator()
                                          + "  foo: 3" + Format.lineSeparator()
                                          + "]" + Format.lineSeparator()).id("input");
    final Span span0 = Span.from(Mark.at(10L, 2, 3), Mark.at(12L, 2, 5, "first use"));
    final Diagnostic cause = Diagnostic.create(input, span0, Severity.note(), "clobbered field");
    final Span span1 = Span.from(Mark.at(28L, 4, 3), Mark.at(30L, 4, 5, "second use"));
    final Diagnostic diagnostic = Diagnostic.create(input, span1, Severity.error(), "duplicate field", cause);
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 "error: duplicate field" + Format.lineSeparator()
               + " --> input:4:3" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "4 |   foo: 3" + Format.lineSeparator()
               + "  |   ^^^ second use" + Format.lineSeparator()
               + "note: clobbered field" + Format.lineSeparator()
               + " --> input:2:3" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "2 |   foo: 1" + Format.lineSeparator()
               + "  |   ^^^ first use");
  }

  @Test
  public void testMultiInputCause() {
    final Input input0 = Unicode.stringInput("test: true" + Format.lineSeparator()).id("input0");
    final Span span0 = Span.from(Mark.at(0L, 1, 1), Mark.at(3L, 1, 4, "original definition"));
    final Diagnostic cause = Diagnostic.create(input0, span0, Severity.note());
    final Input input1 = Unicode.stringInput("test: false" + Format.lineSeparator()).id("input1");
    final Span span1 = Span.from(Mark.at(0L, 1, 1), Mark.at(3L, 1, 4, "duplicate definition"));
    final Diagnostic diagnostic = Diagnostic.create(input1, span1, Severity.error(), "ambiguous definition", cause);
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                 "error: ambiguous definition" + Format.lineSeparator()
               + " --> input1:1:1" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "1 | test: false" + Format.lineSeparator()
               + "  | ^^^^ duplicate definition" + Format.lineSeparator()
               + " --> input0:1:1" + Format.lineSeparator()
               + "  |" + Format.lineSeparator()
               + "1 | test: true" + Format.lineSeparator()
               + "  | ^^^^ original definition");
  }

  @Test
  public void testMultiInputMultiMessageCause() {
    final Input input0 = Unicode.stringInput("test: true" + Format.lineSeparator()).id("input0");
    final Span span0 = Span.from(Mark.at(0L, 1, 1), Mark.at(3L, 1, 4, "original definition"));
    final Diagnostic cause = Diagnostic.create(input0, span0, Severity.note(), "clobbered declaration");
    final Input input1 = Unicode.stringInput("test: false" + Format.lineSeparator()).id("input1");
    final Span span1 = Span.from(Mark.at(0L, 1, 1), Mark.at(3L, 1, 4, "duplicate definition"));
    final Diagnostic diagnostic = Diagnostic.create(input1, span1, Severity.error(), "ambiguous definition", cause);
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(),
                  "error: ambiguous definition" + Format.lineSeparator()
                + " --> input1:1:1" + Format.lineSeparator()
                + "  |" + Format.lineSeparator()
                + "1 | test: false" + Format.lineSeparator()
                + "  | ^^^^ duplicate definition" + Format.lineSeparator()
                + "note: clobbered declaration" + Format.lineSeparator()
                + " --> input0:1:1" + Format.lineSeparator()
                + "  |" + Format.lineSeparator()
                + "1 | test: true" + Format.lineSeparator()
                + "  | ^^^^ original definition");
  }

  static void printDiagnostic(Diagnostic diagnostic) {
    System.out.println(diagnostic.toString(OutputSettings.styled()));
  }

}
