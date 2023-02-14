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

import java.io.PrintWriter;
import java.io.StringWriter;
import org.junit.jupiter.api.Test;
import swim.util.Severity;
import swim.util.NotationOptions;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class DiagnosticTests {

  @Test
  public void testOneLineMarkAtStart() {
    final Input input = new StringInput(String.format("Hello, world!%n")).withIdentifier("input");
    final SourcePosition position = SourcePosition.at(0L, 1, 1);
    final Diagnostic diagnostic = Diagnostic.create(input, position, Severity.DEBUG);
    printDiagnostic(diagnostic);
    assertEquals(" --> input:1:1\n"
               + "  |\n"
               + "1 | Hello, world!\n"
               + "  | ^",
                 diagnostic.toString());
  }

  @Test
  public void testOneLineMarkAtNewline() {
    final Input input = new StringInput(String.format("Hello, world!%n")).withIdentifier("input");
    final SourcePosition position = SourcePosition.at(13L, 1, 14);
    final Diagnostic diagnostic = Diagnostic.create(input, position, Severity.DEBUG);
    printDiagnostic(diagnostic);
    assertEquals(" --> input:1:14\n"
               + "  |\n"
               + "1 | Hello, world!\n"
               + "  |              ^",
                 diagnostic.toString());
  }

  @Test
  public void testOneLineMark() {
    final Input input = new StringInput(String.format("Hello, world!%n")).withIdentifier("input");
    final SourcePosition position = SourcePosition.at(5L, 1, 6);
    final Diagnostic diagnostic = Diagnostic.create(input, position, Severity.INFO);
    printDiagnostic(diagnostic);
    assertEquals(" --> input:1:6\n"
               + "  |\n"
               + "1 | Hello, world!\n"
               + "  |      ^",
                 diagnostic.toString());
  }

  @Test
  public void testOneLineMarkWithNote() {
    final Input input = new StringInput(String.format("Hello, world!%n")).withIdentifier("input");
    final SourcePosition position = SourcePosition.at(5L, 1, 6, "comma");
    final Diagnostic diagnostic = Diagnostic.create(input, position, Severity.NOTICE.withLabel("note"), null, "optional punctuation");
    printDiagnostic(diagnostic);
    assertEquals(" --> input:1:6\n"
               + "  |\n"
               + "1 | Hello, world!\n"
               + "  |      ^ comma\n"
               + "  |\n"
               + "  = note: optional punctuation",
                 diagnostic.toString());
  }

  @Test
  public void testOneLineMarkNoNewline() {
    final Input input = new StringInput("Hello, world!").withIdentifier("input");
    final SourcePosition position = SourcePosition.at(5L, 1, 6);
    final Diagnostic diagnostic = Diagnostic.create(input, position, Severity.WARNING);
    printDiagnostic(diagnostic);
    assertEquals(" --> input:1:6\n"
               + "  |\n"
               + "1 | Hello, world!\n"
               + "  |      ^",
                 diagnostic.toString());
  }

  @Test
  public void testOneLineSpan() {
    final Input input = new StringInput(String.format("Hello, wordl!%n")).withIdentifier("input");
    final SourceRange range = SourceRange.create(SourcePosition.at(7L, 1, 8), SourcePosition.at(11L, 1, 12));
    final Diagnostic diagnostic = Diagnostic.create(input, range, Severity.WARNING);
    printDiagnostic(diagnostic);
    assertEquals(" --> input:1:8\n"
               + "  |\n"
               + "1 | Hello, wordl!\n"
               + "  |        ^^^^^",
                 diagnostic.toString());
  }

  @Test
  public void testOneLineSpanWithMessageAndNotes() {
    final Input input = new StringInput(String.format("Hello, wordl!%n")).withIdentifier("input");
    final SourceRange range = SourceRange.create(SourcePosition.at(7L, 1, 8), SourcePosition.at(11L, 1, 12, "did you mean 'world'?"));
    final Diagnostic diagnostic = Diagnostic.create(input, range, Severity.WARNING, "check your spelling");
    printDiagnostic(diagnostic);
    assertEquals("warning: check your spelling\n"
               + " --> input:1:8\n"
               + "  |\n"
               + "1 | Hello, wordl!\n"
               + "  |        ^^^^^ did you mean 'world'?",
                 diagnostic.toString());
  }

  @Test
  public void testOneLineNumberPadding() {
    final Input input = new StringInput(String.format("\n\n\n\n\n\n\n\n\nHello, world!%n")).withIdentifier("input");
    final SourcePosition position = SourcePosition.at(14L, 10, 6);
    final Diagnostic diagnostic = Diagnostic.create(input, position, Severity.WARNING);
    printDiagnostic(diagnostic);
    assertEquals("  --> input:10:6\n"
               + "   |\n"
               + "10 | Hello, world!\n"
               + "   |      ^",
                 diagnostic.toString());
  }

  @Test
  public void testTwoLineSpan() {
    final Input input = new StringInput(String.format("@test {\"%n"
                                          + "}\"%n")).withIdentifier("input");
    final SourceRange range = SourceRange.create(SourcePosition.at(6L, 1, 7), SourcePosition.at(10L, 2, 2));
    final Diagnostic diagnostic = Diagnostic.create(input, range, Severity.ERROR);
    printDiagnostic(diagnostic);
    assertEquals(" --> input:1:7\n"
               + "  |\n"
               + "1 |   @test {\"\n"
               + "  |  _______^\n"
               + "2 | | }\"\n"
               + "  | |__^",
                 diagnostic.toString());
  }

  @Test
  public void testTwoLineSpanWithMessageAndNotes() {
    final Input input = new StringInput(String.format("@test {\"%n"
                                          + "}\"%n")).withIdentifier("input");
    final SourceRange range = SourceRange.create(SourcePosition.at(6L, 1, 7, "opened here"), SourcePosition.at(10L, 2, 2, "implicitly closed"));
    final Diagnostic diagnostic = Diagnostic.create(input, range, Severity.ERROR, "unclosed block", "check delimiter ordering");
    printDiagnostic(diagnostic);
    assertEquals("error: unclosed block\n"
               + " --> input:1:7\n"
               + "  |\n"
               + "1 |   @test {\"\n"
               + "  |  _______^ opened here\n"
               + "2 | | }\"\n"
               + "  | |__^ implicitly closed\n"
               + "  |\n"
               + "  = note: check delimiter ordering",
                 diagnostic.toString());
  }

  @Test
  public void testSevenLineSpan() {
    final StringWriter inputWriter = new StringWriter();
    final PrintWriter inputBuilder = new PrintWriter(inputWriter);
    inputBuilder.println("@test {");
    inputBuilder.println("  a: 1");
    inputBuilder.println("  b: 2");
    inputBuilder.println("  c: 3");
    inputBuilder.println("  d: 4");
    inputBuilder.println("  e: 5");
    inputBuilder.println("]");
    final Input input = new StringInput(inputWriter.toString()).withIdentifier("input");
    final SourceRange range = SourceRange.create(SourcePosition.at(6L, 1, 7), SourcePosition.at(43L, 7, 1));
    final Diagnostic diagnostic = Diagnostic.create(input, range, Severity.ERROR);
    printDiagnostic(diagnostic);
    assertEquals(" --> input:1:7\n"
               + "  |\n"
               + "1 |   @test {\n"
               + "  |  _______^\n"
               + "2 | |   a: 1\n"
               + "3 | |   b: 2\n"
               + "4 | |   c: 3\n"
               + "5 | |   d: 4\n"
               + "6 | |   e: 5\n"
               + "7 | | ]\n"
               + "  | |_^",
                 diagnostic.toString());
  }

  @Test
  public void testSevenLineSpanWithNotes() {
    final StringWriter inputWriter = new StringWriter();
    final PrintWriter inputBuilder = new PrintWriter(inputWriter);
    inputBuilder.println("@test {");
    inputBuilder.println("  a: 1");
    inputBuilder.println("  b: 2");
    inputBuilder.println("  c: 3");
    inputBuilder.println("  d: 4");
    inputBuilder.println("  e: 5");
    inputBuilder.println("]");
    final Input input = new StringInput(inputWriter.toString()).withIdentifier("input");
    final SourceRange range = SourceRange.create(SourcePosition.at(6L, 1, 7, "opened here"), SourcePosition.at(43L, 7, 1, "implicitly closed"));
    final Diagnostic diagnostic = Diagnostic.create(input, range, Severity.ERROR);
    printDiagnostic(diagnostic);
    assertEquals(" --> input:1:7\n"
               + "  |\n"
               + "1 |   @test {\n"
               + "  |  _______^ opened here\n"
               + "2 | |   a: 1\n"
               + "3 | |   b: 2\n"
               + "4 | |   c: 3\n"
               + "5 | |   d: 4\n"
               + "6 | |   e: 5\n"
               + "7 | | ]\n"
               + "  | |_^ implicitly closed",
                 diagnostic.toString());
  }

  @Test
  public void testTenLineSpan() {
    final StringWriter inputWriter = new StringWriter();
    final PrintWriter inputBuilder = new PrintWriter(inputWriter);
    inputBuilder.println("@test {");
    inputBuilder.println("  a: 1");
    inputBuilder.println("  b: 2");
    inputBuilder.println("  c: 3");
    inputBuilder.println("  d: 4");
    inputBuilder.println("  e: 5");
    inputBuilder.println("  f: 6");
    inputBuilder.println("  g: 7");
    inputBuilder.println("  h: 8");
    inputBuilder.println("]");
    final Input input = new StringInput(inputWriter.toString()).withIdentifier("input");
    final SourceRange range = SourceRange.create(SourcePosition.at(6L, 1, 7), SourcePosition.at(64L, 10, 1));
    final Diagnostic diagnostic = Diagnostic.create(input, range, Severity.ERROR);
    printDiagnostic(diagnostic);
    assertEquals("  --> input:1:7\n"
               + "   |\n"
               + " 1 |   @test {\n"
               + "   |  _______^\n"
               + " 2 | |   a: 1\n"
               + " 3 | |   b: 2\n"
               + "..   |\n"
               + " 8 | |   g: 7\n"
               + " 9 | |   h: 8\n"
               + "10 | | ]\n"
               + "   | |_^",
                 diagnostic.toString());
  }

  @Test
  public void testTenLineSpanWithNotes() {
    final StringWriter inputWriter = new StringWriter();
    final PrintWriter inputBuilder = new PrintWriter(inputWriter);
    inputBuilder.println("@test {");
    inputBuilder.println("  a: 1");
    inputBuilder.println("  b: 2");
    inputBuilder.println("  c: 3");
    inputBuilder.println("  d: 4");
    inputBuilder.println("  e: 5");
    inputBuilder.println("  f: 6");
    inputBuilder.println("  g: 7");
    inputBuilder.println("  h: 8");
    inputBuilder.println("]");
    final Input input = new StringInput(inputWriter.toString()).withIdentifier("input");
    final SourceRange range = SourceRange.create(SourcePosition.at(6L, 1, 7, "opened here"), SourcePosition.at(64L, 10, 1, "implicitly closed"));
    final Diagnostic diagnostic = Diagnostic.create(input, range, Severity.ERROR);
    printDiagnostic(diagnostic);
    assertEquals("  --> input:1:7\n"
               + "   |\n"
               + " 1 |   @test {\n"
               + "   |  _______^ opened here\n"
               + " 2 | |   a: 1\n"
               + " 3 | |   b: 2\n"
               + "..   |\n"
               + " 8 | |   g: 7\n"
               + " 9 | |   h: 8\n"
               + "10 | | ]\n"
               + "   | |_^ implicitly closed",
                 diagnostic.toString());
  }

  @Test
  public void testCauseBeforeError() {
    final StringWriter inputWriter = new StringWriter();
    final PrintWriter inputBuilder = new PrintWriter(inputWriter);
    inputBuilder.println("@test {");
    inputBuilder.println("  foo: 1");
    inputBuilder.println("  bar: 2");
    inputBuilder.println("  foo: 3");
    inputBuilder.println("]");
    final Input input = new StringInput(inputWriter.toString()).withIdentifier("input");
    final SourceRange range0 = SourceRange.create(SourcePosition.at(10L, 2, 3), SourcePosition.at(12L, 2, 5, "first use"));
    final Diagnostic cause = Diagnostic.create(input, range0, Severity.NOTICE.withLabel("note"));
    final SourceRange range1 = SourceRange.create(SourcePosition.at(28L, 4, 3), SourcePosition.at(30L, 4, 5, "second use"));
    final Diagnostic diagnostic = Diagnostic.create(input, range1, Severity.ERROR, "duplicate field", cause);
    printDiagnostic(diagnostic);
    assertEquals("error: duplicate field\n"
               + " --> input:4:3\n"
               + "  |\n"
               + "2 |   foo: 1\n"
               + "  |   ^^^ first use\n"
               + ".  \n"
               + "4 |   foo: 3\n"
               + "  |   ^^^ second use",
                 diagnostic.toString());
  }

  @Test
  public void testCauseAfterError() {
    final StringWriter inputWriter = new StringWriter();
    final PrintWriter inputBuilder = new PrintWriter(inputWriter);
    inputBuilder.println("@test {");
    inputBuilder.println("  foo: 1");
    inputBuilder.println("  bar: 2");
    inputBuilder.println("  foo: 3");
    inputBuilder.println("]");
    final Input input = new StringInput(inputWriter.toString()).withIdentifier("input");
    final SourceRange range0 = SourceRange.create(SourcePosition.at(28L, 4, 3), SourcePosition.at(30L, 4, 5, "clobbered here"));
    final Diagnostic cause = Diagnostic.create(input, range0, Severity.NOTICE.withLabel("note"));
    final SourceRange range1 = SourceRange.create(SourcePosition.at(10L, 2, 3), SourcePosition.at(12L, 2, 5, "defined here"));
    final Diagnostic diagnostic = Diagnostic.create(input, range1, Severity.ERROR, "clobbered field", cause);
    printDiagnostic(diagnostic);
    assertEquals("error: clobbered field\n"
               + " --> input:2:3\n"
               + "  |\n"
               + "2 |   foo: 1\n"
               + "  |   ^^^ defined here\n"
               + ".  \n"
               + "4 |   foo: 3\n"
               + "  |   ^^^ clobbered here",
                 diagnostic.toString());
  }

  @Test
  public void testMultiMessageCause() {
    final StringWriter inputWriter = new StringWriter();
    final PrintWriter inputBuilder = new PrintWriter(inputWriter);
    inputBuilder.println("@test {");
    inputBuilder.println("  foo: 1");
    inputBuilder.println("  bar: 2");
    inputBuilder.println("  foo: 3");
    inputBuilder.println("]");
    final Input input = new StringInput(inputWriter.toString()).withIdentifier("input");
    final SourceRange range0 = SourceRange.create(SourcePosition.at(10L, 2, 3), SourcePosition.at(12L, 2, 5, "first use"));
    final Diagnostic cause = Diagnostic.create(input, range0, Severity.NOTICE.withLabel("note"), "clobbered field");
    final SourceRange range1 = SourceRange.create(SourcePosition.at(28L, 4, 3), SourcePosition.at(30L, 4, 5, "second use"));
    final Diagnostic diagnostic = Diagnostic.create(input, range1, Severity.ERROR, "duplicate field", cause);
    printDiagnostic(diagnostic);
    assertEquals("error: duplicate field\n"
               + " --> input:4:3\n"
               + "  |\n"
               + "4 |   foo: 3\n"
               + "  |   ^^^ second use\n"
               + "note: clobbered field\n"
               + " --> input:2:3\n"
               + "  |\n"
               + "2 |   foo: 1\n"
               + "  |   ^^^ first use",
                 diagnostic.toString());
  }

  @Test
  public void testMultiInputCause() {
    final Input input0 = new StringInput(String.format("test: true%n")).withIdentifier("input0");
    final SourceRange range0 = SourceRange.create(SourcePosition.at(0L, 1, 1), SourcePosition.at(3L, 1, 4, "original definition"));
    final Diagnostic cause = Diagnostic.create(input0, range0, Severity.NOTICE.withLabel("note"));
    final Input input1 = new StringInput(String.format("test: false%n")).withIdentifier("input1");
    final SourceRange range1 = SourceRange.create(SourcePosition.at(0L, 1, 1), SourcePosition.at(3L, 1, 4, "duplicate definition"));
    final Diagnostic diagnostic = Diagnostic.create(input1, range1, Severity.ERROR, "ambiguous definition", cause);
    printDiagnostic(diagnostic);
    assertEquals("error: ambiguous definition\n"
               + " --> input1:1:1\n"
               + "  |\n"
               + "1 | test: false\n"
               + "  | ^^^^ duplicate definition\n"
               + " --> input0:1:1\n"
               + "  |\n"
               + "1 | test: true\n"
               + "  | ^^^^ original definition",
                 diagnostic.toString());
  }

  @Test
  public void testMultiInputMultiMessageCause() {
    final Input input0 = new StringInput(String.format("test: true%n")).withIdentifier("input0");
    final SourceRange range0 = SourceRange.create(SourcePosition.at(0L, 1, 1), SourcePosition.at(3L, 1, 4, "original definition"));
    final Diagnostic cause = Diagnostic.create(input0, range0, Severity.NOTICE.withLabel("note"), "clobbered declaration");
    final Input input1 = new StringInput(String.format("test: false%n")).withIdentifier("input1");
    final SourceRange range1 = SourceRange.create(SourcePosition.at(0L, 1, 1), SourcePosition.at(3L, 1, 4, "duplicate definition"));
    final Diagnostic diagnostic = Diagnostic.create(input1, range1, Severity.ERROR, "ambiguous definition", cause);
    printDiagnostic(diagnostic);
    assertEquals("error: ambiguous definition\n"
               + " --> input1:1:1\n"
               + "  |\n"
               + "1 | test: false\n"
               + "  | ^^^^ duplicate definition\n"
               + "note: clobbered declaration\n"
               + " --> input0:1:1\n"
               + "  |\n"
               + "1 | test: true\n"
               + "  | ^^^^ original definition",
                 diagnostic.toString());
  }

  static void printDiagnostic(Diagnostic diagnostic) {
    System.out.println(diagnostic.toString(NotationOptions.styled()));
  }

}
