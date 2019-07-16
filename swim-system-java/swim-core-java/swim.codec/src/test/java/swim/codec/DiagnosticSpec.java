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
import swim.util.Severity;
import static org.testng.Assert.assertEquals;

public class DiagnosticSpec {
  static void printDiagnostic(Diagnostic diagnostic) {
    System.out.println(diagnostic.toString(OutputSettings.styled()));
  }

  @Test
  public void testOneLineMarkAtStart() {
    final Input input = Unicode.stringInput("Hello, world!\n").id("input");
    final Mark mark = Mark.at(0L, 1, 1);
    final Diagnostic diagnostic = Diagnostic.from(input, mark, Severity.debug());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), " --> input:1:1\n"
                                      + "  |\n"
                                      + "1 | Hello, world!\n"
                                      + "  | ^");
  }

  @Test
  public void testOneLineMarkAtNewline() {
    final Input input = Unicode.stringInput("Hello, world!\n").id("input");
    final Mark mark = Mark.at(13L, 1, 14);
    final Diagnostic diagnostic = Diagnostic.from(input, mark, Severity.debug());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), " --> input:1:14\n"
                                      + "  |\n"
                                      + "1 | Hello, world!\n"
                                      + "  |              ^");
  }

  @Test
  public void testOneLineMark() {
    final Input input = Unicode.stringInput("Hello, world!\n").id("input");
    final Mark mark = Mark.at(5L, 1, 6);
    final Diagnostic diagnostic = Diagnostic.from(input, mark, Severity.info());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), " --> input:1:6\n"
                                      + "  |\n"
                                      + "1 | Hello, world!\n"
                                      + "  |      ^");
  }

  @Test
  public void testOneLineMarkWithNote() {
    final Input input = Unicode.stringInput("Hello, world!\n").id("input");
    final Mark mark = Mark.at(5L, 1, 6, "comma");
    final Diagnostic diagnostic = Diagnostic.from(input, mark, Severity.note(), null, "optional punctuation");
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), " --> input:1:6\n"
                                      + "  |\n"
                                      + "1 | Hello, world!\n"
                                      + "  |      ^ comma\n"
                                      + "  |\n"
                                      + "  = note: optional punctuation");
  }

  @Test
  public void testOneLineMarkNoNewline() {
    final Input input = Unicode.stringInput("Hello, world!").id("input");
    final Mark mark = Mark.at(5L, 1, 6);
    final Diagnostic diagnostic = Diagnostic.from(input, mark, Severity.warning());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), " --> input:1:6\n"
                                      + "  |\n"
                                      + "1 | Hello, world!\n"
                                      + "  |      ^");
  }

  @Test
  public void testOneLineSpan() {
    final Input input = Unicode.stringInput("Hello, wordl!\n").id("input");
    final Span span = Span.from(Mark.at(7L, 1, 8), Mark.at(11L, 1, 12));
    final Diagnostic diagnostic = Diagnostic.from(input, span, Severity.warning());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), " --> input:1:8\n"
                                      + "  |\n"
                                      + "1 | Hello, wordl!\n"
                                      + "  |        ^^^^^");
  }

  @Test
  public void testOneLineSpanWithMessageAndNotes() {
    final Input input = Unicode.stringInput("Hello, wordl!\n").id("input");
    final Span span = Span.from(Mark.at(7L, 1, 8), Mark.at(11L, 1, 12, "did you mean 'world'?"));
    final Diagnostic diagnostic = Diagnostic.from(input, span, Severity.warning(), "check your spelling");
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), "warning: check your spelling\n"
                                      + " --> input:1:8\n"
                                      + "  |\n"
                                      + "1 | Hello, wordl!\n"
                                      + "  |        ^^^^^ did you mean 'world'?");
  }

  @Test
  public void testOneLineNumberPadding() {
    final Input input = Unicode.stringInput("\n\n\n\n\n\n\n\n\nHello, world!\n").id("input");
    final Mark mark = Mark.at(14L, 10, 6);
    final Diagnostic diagnostic = Diagnostic.from(input, mark, Severity.warning());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), "  --> input:10:6\n"
                                      + "   |\n"
                                      + "10 | Hello, world!\n"
                                      + "   |      ^");
  }

  @Test
  public void testTwoLineSpan() {
    final Input input = Unicode.stringInput("@test {\"\n"
                                          + "}\"\n").id("input");
    final Span span = Span.from(Mark.at(6L, 1, 7), Mark.at(10L, 2, 2));
    final Diagnostic diagnostic = Diagnostic.from(input, span, Severity.error());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), " --> input:1:7\n"
                                      + "  |\n"
                                      + "1 |   @test {\"\n"
                                      + "  |  _______^\n"
                                      + "2 | | }\"\n"
                                      + "  | |__^");
  }

  @Test
  public void testTwoLineSpanWithMessageAndNotes() {
    final Input input = Unicode.stringInput("@test {\"\n"
                                          + "}\"\n").id("input");
    final Span span = Span.from(Mark.at(6L, 1, 7, "opened here"), Mark.at(10L, 2, 2, "implicitly closed"));
    final Diagnostic diagnostic = Diagnostic.from(input, span, Severity.error(), "unclosed block", "check delimiter ordering");
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), "error: unclosed block\n"
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
  public void testSevenLineSpan() {
    final Input input = Unicode.stringInput("@test {\n"
                                          + "  a: 1\n"
                                          + "  b: 2\n"
                                          + "  c: 3\n"
                                          + "  d: 4\n"
                                          + "  e: 5\n"
                                          + "]\n").id("input");
    final Span span = Span.from(Mark.at(6L, 1, 7), Mark.at(43L, 7, 1));
    final Diagnostic diagnostic = Diagnostic.from(input, span, Severity.error());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), " --> input:1:7\n"
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
  public void testSevenLineSpanWithNotes() {
    final Input input = Unicode.stringInput("@test {\n"
                                          + "  a: 1\n"
                                          + "  b: 2\n"
                                          + "  c: 3\n"
                                          + "  d: 4\n"
                                          + "  e: 5\n"
                                          + "]\n").id("input");
    final Span span = Span.from(Mark.at(6L, 1, 7, "opened here"), Mark.at(43L, 7, 1, "implicitly closed"));
    final Diagnostic diagnostic = Diagnostic.from(input, span, Severity.error());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), " --> input:1:7\n"
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
  public void testTenLineSpan() {
    final Input input = Unicode.stringInput("@test {\n"
                                          + "  a: 1\n"
                                          + "  b: 2\n"
                                          + "  c: 3\n"
                                          + "  d: 4\n"
                                          + "  e: 5\n"
                                          + "  f: 6\n"
                                          + "  g: 7\n"
                                          + "  h: 8\n"
                                          + "]\n").id("input");
    final Span span = Span.from(Mark.at(6L, 1, 7), Mark.at(64L, 10, 1));
    final Diagnostic diagnostic = Diagnostic.from(input, span, Severity.error());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), "  --> input:1:7\n"
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
  public void testTenLineSpanWithNotes() {
    final Input input = Unicode.stringInput("@test {\n"
                                          + "  a: 1\n"
                                          + "  b: 2\n"
                                          + "  c: 3\n"
                                          + "  d: 4\n"
                                          + "  e: 5\n"
                                          + "  f: 6\n"
                                          + "  g: 7\n"
                                          + "  h: 8\n"
                                          + "]\n").id("input");
    final Span span = Span.from(Mark.at(6L, 1, 7, "opened here"), Mark.at(64L, 10, 1, "implicitly closed"));
    final Diagnostic diagnostic = Diagnostic.from(input, span, Severity.error());
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), "  --> input:1:7\n"
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
  public void testCauseBeforeError() {
    final Input input = Unicode.stringInput("@test {\n"
                                          + "  foo: 1\n"
                                          + "  bar: 2\n"
                                          + "  foo: 3\n"
                                          + "]\n").id("input");
    final Span span0 = Span.from(Mark.at(10L, 2, 3), Mark.at(12L, 2, 5, "first use"));
    final Diagnostic cause = Diagnostic.from(input, span0, Severity.note());
    final Span span1 = Span.from(Mark.at(28L, 4, 3), Mark.at(30L, 4, 5, "second use"));
    final Diagnostic diagnostic = Diagnostic.from(input, span1, Severity.error(), "duplicate field", cause);
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), "error: duplicate field\n"
                                      + " --> input:4:3\n"
                                      + "  |\n"
                                      + "2 |   foo: 1\n"
                                      + "  |   ^^^ first use\n"
                                      + ".  \n"
                                      + "4 |   foo: 3\n"
                                      + "  |   ^^^ second use");
  }

  @Test
  public void testCauseAfterError() {
    final Input input = Unicode.stringInput("@test {\n"
                                          + "  foo: 1\n"
                                          + "  bar: 2\n"
                                          + "  foo: 3\n"
                                          + "]\n").id("input");
    final Span span0 = Span.from(Mark.at(28L, 4, 3), Mark.at(30L, 4, 5, "clobbered here"));
    final Diagnostic cause = Diagnostic.from(input, span0, Severity.note());
    final Span span1 = Span.from(Mark.at(10L, 2, 3), Mark.at(12L, 2, 5, "defined here"));
    final Diagnostic diagnostic = Diagnostic.from(input, span1, Severity.error(), "clobbered field", cause);
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), "error: clobbered field\n"
                                      + " --> input:2:3\n"
                                      + "  |\n"
                                      + "2 |   foo: 1\n"
                                      + "  |   ^^^ defined here\n"
                                      + ".  \n"
                                      + "4 |   foo: 3\n"
                                      + "  |   ^^^ clobbered here");
  }

  @Test
  public void testMultiMessageCause() {
    final Input input = Unicode.stringInput("@test {\n"
                                          + "  foo: 1\n"
                                          + "  bar: 2\n"
                                          + "  foo: 3\n"
                                          + "]\n").id("input");
    final Span span0 = Span.from(Mark.at(10L, 2, 3), Mark.at(12L, 2, 5, "first use"));
    final Diagnostic cause = Diagnostic.from(input, span0, Severity.note(), "clobbered field");
    final Span span1 = Span.from(Mark.at(28L, 4, 3), Mark.at(30L, 4, 5, "second use"));
    final Diagnostic diagnostic = Diagnostic.from(input, span1, Severity.error(), "duplicate field", cause);
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), "error: duplicate field\n"
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
  public void testMultiInputCause() {
    final Input input0 = Unicode.stringInput("test: true\n").id("input0");
    final Span span0 = Span.from(Mark.at(0L, 1, 1), Mark.at(3L, 1, 4, "original definition"));
    final Diagnostic cause = Diagnostic.from(input0, span0, Severity.note());
    final Input input1 = Unicode.stringInput("test: false\n").id("input1");
    final Span span1 = Span.from(Mark.at(0L, 1, 1), Mark.at(3L, 1, 4, "duplicate definition"));
    final Diagnostic diagnostic = Diagnostic.from(input1, span1, Severity.error(), "ambiguous definition", cause);
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), "error: ambiguous definition\n"
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
  public void testMultiInputMultiMessageCause() {
    final Input input0 = Unicode.stringInput("test: true\n").id("input0");
    final Span span0 = Span.from(Mark.at(0L, 1, 1), Mark.at(3L, 1, 4, "original definition"));
    final Diagnostic cause = Diagnostic.from(input0, span0, Severity.note(), "clobbered declaration");
    final Input input1 = Unicode.stringInput("test: false\n").id("input1");
    final Span span1 = Span.from(Mark.at(0L, 1, 1), Mark.at(3L, 1, 4, "duplicate definition"));
    final Diagnostic diagnostic = Diagnostic.from(input1, span1, Severity.error(), "ambiguous definition", cause);
    printDiagnostic(diagnostic);
    assertEquals(diagnostic.toString(), "error: ambiguous definition\n"
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
