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

import java.util.Objects;
import swim.util.Severity;

/**
 * Informational message attached to an input location.
 */
public final class Diagnostic implements Display {
  final Input input;
  final Tag tag;
  final Severity severity;
  final String message;
  final String note;
  final Diagnostic cause;

  Diagnostic(Input input, Tag tag, Severity severity, String message,
             String note, Diagnostic cause) {
    this.input = input;
    this.tag = tag;
    this.severity = severity;
    this.message = message;
    this.note = note;
    this.cause = cause;
  }

  /**
   * Returns the {@code Input} source to which this diagnostic is attached.
   */
  public Input input() {
    return this.input.clone();
  }

  /**
   * Returns the annotated location {@code Tag} in the {@code input} to which
   * this diagnostic is attached.
   */
  public Tag tag() {
    return this.tag;
  }

  /**
   * Returns the level of importance of this diagnostic.
   */
  public Severity severity() {
    return this.severity;
  }

  /**
   * Returns the help message that describes this diagnostic.
   */
  public String message() {
    return this.message;
  }

  /**
   * Returns an informative comment on the source context to which this
   * diagnostic is attached.
   */
  public String note() {
    return this.note;
  }

  /**
   * Returns the {@code Diagnostic} cause of this diagnostic, forming a linked
   * chain of diagnostics, or {@code null} if this diagnostic has no cause.
   */
  public Diagnostic cause() {
    return this.cause;
  }

  private int lineDigits() {
    int digits = Base10.countDigits(this.tag.end().line());
    if (this.cause != null) {
      digits = Math.max(digits, this.cause.lineDigits());
    }
    return digits;
  }

  @Override
  public void display(Output<?> output) {
    final Input input = this.input.clone();
    final Mark start = this.tag.start();
    final Mark end = this.tag.end();
    final Severity severity = this.severity;
    final String message = this.message;
    final String note = this.note;
    final Diagnostic cause = this.cause;
    final int contextLines = 2;
    final int lineDigits = lineDigits();
    displayDiagnostic(input, start, end, severity, message, note, cause,
        contextLines, lineDigits, output);
  }

  public String toString(OutputSettings settings) {
    return Format.display(this, settings);
  }

  @Override
  public String toString() {
    return Format.display(this);
  }

  public static Diagnostic from(Input input, Tag tag, Severity severity,
                                String message, String note, Diagnostic cause) {
    input = input.clone();
    tag = Objects.requireNonNull(tag);
    severity = Objects.requireNonNull(severity);
    return new Diagnostic(input, tag, severity, message, note, cause);
  }

  public static Diagnostic from(Input input, Tag tag, Severity severity,
                                String message, String note) {
    return from(input, tag, severity, message, note, null);
  }

  public static Diagnostic from(Input input, Tag tag, Severity severity,
                                String message, Diagnostic cause) {
    return from(input, tag, severity, message, null, cause);
  }

  public static Diagnostic from(Input input, Tag tag, Severity severity, String message) {
    return from(input, tag, severity, message, null, null);
  }

  public static Diagnostic from(Input input, Tag tag, Severity severity, Diagnostic cause) {
    return from(input, tag, severity, null, null, cause);
  }

  public static Diagnostic from(Input input, Tag tag, Severity severity) {
    return from(input, tag, severity, null, null, null);
  }

  public static Diagnostic message(String message, Input input, Severity severity, String note, Diagnostic cause) {
    final Mark mark = input.mark();
    final Input source = input.clone().seek(null);
    return from(source, mark, severity, message, note, cause);
  }

  public static Diagnostic message(String message, Input input, Severity severity, String note) {
    return message(message, input, severity, note, null);
  }

  public static Diagnostic message(String message, Input input, Severity severity, Diagnostic cause) {
    return message(message, input, severity, null, cause);
  }

  public static Diagnostic message(String message, Input input, Severity severity) {
    return message(message, input, severity, null, null);
  }

  public static Diagnostic message(String message, Input input, String note, Diagnostic cause) {
    return message(message, input, Severity.error(), note, cause);
  }

  public static Diagnostic message(String message, Input input, String note) {
    return message(message, input, Severity.error(), note, null);
  }

  public static Diagnostic message(String message, Input input, Diagnostic cause) {
    return message(message, input, Severity.error(), null, cause);
  }

  public static Diagnostic message(String message, Input input) {
    return message(message, input, Severity.error(), null, null);
  }

  public static Diagnostic unexpected(Input input, Severity severity, String note, Diagnostic cause) {
    final String message;
    if (input.isCont()) {
      final Output<String> output = Unicode.stringOutput().write("unexpected").write(' ');
      Format.debugChar(input.head(), output);
      message = output.bind();
    } else {
      message = "unexpected end of input";
    }
    final Mark mark = input.mark();
    final Input source = input.clone().seek(null);
    return from(source, mark, severity, message, note, cause);
  }

  public static Diagnostic unexpected(Input input, Severity severity, String note) {
    return unexpected(input, severity, note, null);
  }

  public static Diagnostic unexpected(Input input, Severity severity, Diagnostic cause) {
    return unexpected(input, severity, null, cause);
  }

  public static Diagnostic unexpected(Input input, Severity severity) {
    return unexpected(input, severity, null, null);
  }

  public static Diagnostic unexpected(Input input, String note, Diagnostic cause) {
    return unexpected(input, Severity.error(), note, cause);
  }

  public static Diagnostic unexpected(Input input, String note) {
    return unexpected(input, Severity.error(), note, null);
  }

  public static Diagnostic unexpected(Input input, Diagnostic cause) {
    return unexpected(input, Severity.error(), null, cause);
  }

  public static Diagnostic unexpected(Input input) {
    return unexpected(input, Severity.error(), null, null);
  }

  public static Diagnostic expected(int expected, Input input, Severity severity, String note, Diagnostic cause) {
    Output<String> output = Unicode.stringOutput().write("expected").write(' ');
    Format.debugChar(expected, output);
    output = output.write(", ").write("but found").write(' ');
    if (input.isCont()) {
      Format.debugChar(input.head(), output);
    } else {
      output = output.write("end of input");
    }
    final String message = output.bind();
    final Mark mark = input.mark();
    final Input source = input.clone().seek(null);
    return from(source, mark, severity, message, note, cause);
  }

  public static Diagnostic expected(int expected, Input input, Severity severity, String note) {
    return expected(expected, input, severity, note, null);
  }

  public static Diagnostic expected(int expected, Input input, Severity severity, Diagnostic cause) {
    return expected(expected, input, severity, null, cause);
  }

  public static Diagnostic expected(int expected, Input input, Severity severity) {
    return expected(expected, input, severity, null, null);
  }

  public static Diagnostic expected(int expected, Input input, String note, Diagnostic cause) {
    return expected(expected, input, Severity.error(), note, cause);
  }

  public static Diagnostic expected(int expected, Input input, String note) {
    return expected(expected, input, Severity.error(), note, null);
  }

  public static Diagnostic expected(int expected, Input input, Diagnostic cause) {
    return expected(expected, input, Severity.error(), null, cause);
  }

  public static Diagnostic expected(int expected, Input input) {
    return expected(expected, input, Severity.error(), null, null);
  }

  public static Diagnostic expected(String expected, Input input, Severity severity, String note, Diagnostic cause) {
    Output<String> output = Unicode.stringOutput().write("expected").write(' ').write(expected)
        .write(", ").write("but found").write(' ');
    if (input.isCont()) {
      Format.debugChar(input.head(), output);
    } else {
      output = output.write("end of input");
    }
    final String message = output.bind();
    final Mark mark = input.mark();
    final Input source = input.clone().seek(null);
    return from(source, mark, severity, message, note, cause);
  }

  public static Diagnostic expected(String expected, Input input, Severity severity, String note) {
    return expected(expected, input, severity, note, null);
  }

  public static Diagnostic expected(String expected, Input input, Severity severity, Diagnostic cause) {
    return expected(expected, input, severity, null, cause);
  }

  public static Diagnostic expected(String expected, Input input, Severity severity) {
    return expected(expected, input, severity, null, null);
  }

  public static Diagnostic expected(String expected, Input input, String note, Diagnostic cause) {
    return expected(expected, input, Severity.error(), note, cause);
  }

  public static Diagnostic expected(String expected, Input input, String note) {
    return expected(expected, input, Severity.error(), note, null);
  }

  public static Diagnostic expected(String expected, Input input, Diagnostic cause) {
    return expected(expected, input, Severity.error(), null, cause);
  }

  public static Diagnostic expected(String expected, Input input) {
    return expected(expected, input, Severity.error(), null, null);
  }

  static void displayDiagnostic(Input input, Mark start, Mark end, Severity severity,
                                String message, String note, Diagnostic cause,
                                int contextLines, int lineDigits, Output<?> output) {
    do {
      if (message != null) {
        displayMessage(severity, message, output);
        output = output.writeln();
      }
      displayAnchor(input, start, lineDigits, output);
      output = output.writeln();
      final Diagnostic next = displayContext(input, start, end, severity, note,
          cause, contextLines, lineDigits, output);
      if (next != null) {
        output = output.writeln();
        input = next.input.clone();
        start = next.tag.start();
        end = next.tag.end();
        severity = next.severity;
        message = next.message;
        note = next.note;
        cause = next.cause;
      } else {
        break;
      }
    } while (true);
  }

  static void displayMessage(Severity severity, String message, Output<?> output) {
    formatSeverity(severity, output);
    output = output.write(severity.label());
    OutputStyle.reset(output);
    OutputStyle.bold(output);
    output = output.write(':');
    if (message != null) {
      output = output.write(' ').write(message);
    }
    OutputStyle.reset(output);
  }

  static void displayAnchor(Input input, Mark start, int lineDigits, Output<?> output) {
    displayLineLeadArrow(lineDigits, output);
    output = output.write(' ');
    final Object id = input.id();
    if (id != null) {
      Format.display(id, output);
    }
    output = output.write(':');
    Format.displayInt(start.line, output);
    output = output.write(':');
    Format.displayInt(start.column, output);
    output = output.writeln();

    displayLineLead(lineDigits, output);
  }

  static Diagnostic displayCause(Diagnostic cause, int contextLines, int lineDigits, Output<?> output) {
    final Input input = cause.input.clone();
    final Mark start = cause.tag.start();
    final Mark end = cause.tag.end();
    final Severity severity = cause.severity;
    final String note = cause.note;
    final Diagnostic next = cause.cause;
    return displayContext(input, start, end, severity, note, next, contextLines, lineDigits, output);
  }

  static Diagnostic displayContext(Input input, Mark start, Mark end, Severity severity,
                                   String note, Diagnostic cause, int contextLines,
                                   int lineDigits, Output<?> output) {
    Diagnostic next = cause;
    final boolean sameCause = cause != null && cause.message == null
        && Objects.equals(input.id(), cause.input.id());
    final int causeOrder = sameCause ? (start.offset <= cause.tag.start().offset ? -1 : 1) : 0;
    if (causeOrder == 1) {
      next = displayCause(cause, contextLines, lineDigits, output);
      output = output.writeln();
      displayLineLeadEllipsis(lineDigits, output);
      output = output.writeln();
    }
    displayLines(input, start, end, severity, contextLines, lineDigits, output);
    if (note != null) {
      displayNote(note, lineDigits, output);
    }
    if (causeOrder == -1) {
      output = output.writeln();
      displayLineLeadEllipsis(lineDigits, output);
      output = output.writeln();
      next = displayCause(cause, contextLines, lineDigits, output);
    }
    return next;
  }

  static void displayLines(Input input, Mark start, Mark end, Severity severity,
                           int contextLines, int lineDigits, Output<?> output) {
    final int startLine = start.line();
    final int endLine = end.line();
    int line = input.line();

    while (line < startLine) {
      consumeLineText(input, line);
      line += 1;
    }

    if (endLine - startLine > 2 * contextLines + 2) {
      while (line <= startLine + contextLines) {
        displayLine(input, start, end, severity, line, lineDigits, output);
        line += 1;
      }
      displayLineLeadEllipsis(lineDigits, output);
      output = output.write(' ');
      formatSeverity(severity, output);
      output = output.write('|');
      OutputStyle.reset(output);
      output = output.writeln();
      while (line < endLine - contextLines) {
        consumeLineText(input, line);
        line += 1;
      }
    }

    while (line <= endLine) {
      displayLine(input, start, end, severity, line, lineDigits, output);
      line += 1;
    }
  }

  static void displayNote(String note, int lineDigits, Output<?> output) {
    output = output.writeln();
    displayLineLead(lineDigits, output);
    output = output.writeln();
    displayLineComment("note", note, lineDigits, output);
  }

  static void displayLine(Input input, Mark start, Mark end, Severity severity,
                          int line, int lineDigits, Output<?> output) {
    if (start.line == line && end.line == line) {
      displaySingleLine(input, start, end, severity, line, lineDigits, output);
    } else if (start.line == line) {
      displayStartLine(input, start, severity, line, lineDigits, output);
    } else if (end.line == line) {
      displayEndLine(input, end, severity, line, lineDigits, output);
    } else {
      displayMidLine(input, severity, line, lineDigits, output);
    }
  }

  static void displaySingleLine(Input input, Mark start, Mark end, Severity severity,
                                int line, int lineDigits, Output<?> output) {
    displayLineLeadNumber(line, lineDigits, output);
    output = output.write(' ');
    for (int i = 1; i < input.column(); i += 1) {
      output = output.write(' ');
    }
    displayLineText(input, line, output);

    displayLineLead(lineDigits, output);
    output = output.write(' ');
    int i = 1;
    while (i < start.column) {
      output = output.write(' ');
      i += 1;
    }
    formatSeverity(severity, output);
    while (i <= end.column) {
      output = output.write('^');
      i += 1;
    }
    if (end.note != null) {
      output = output.write(' ').write(end.note);
    }
    OutputStyle.reset(output);
  }

  static void displayStartLine(Input input, Mark start, Severity severity,
                               int line, int lineDigits, Output<?> output) {
    displayLineLeadNumber(line, lineDigits, output);
    output = output.write(' ').write(' ').write(' ');
    for (int i = 1; i < input.column(); i += 1) {
      output = output.write(' ');
    }
    displayLineText(input, line, output);

    displayLineLead(lineDigits, output);
    output = output.write(' ').write(' ');
    formatSeverity(severity, output);
    output = output.write('_');
    int i = 1;
    while (i < start.column) {
      output = output.write('_');
      i += 1;
    }
    output = output.write('^');
    if (start.note != null) {
      output = output.write(' ').write(start.note);
    }
    OutputStyle.reset(output);
    output = output.writeln();
  }

  static void displayEndLine(Input input, Mark end, Severity severity,
                             int line, int lineDigits, Output<?> output) {
    displayLineLeadNumber(line, lineDigits, output);
    output = output.write(' ');
    formatSeverity(severity, output);
    output = output.write('|');
    OutputStyle.reset(output);
    output = output.write(' ');
    displayLineText(input, line, output);

    displayLineLead(lineDigits, output);
    output = output.write(' ');
    formatSeverity(severity, output);
    output = output.write('|').write('_');
    int i = 1;
    while (i < end.column) {
      output = output.write('_');
      i += 1;
    }
    output = output.write('^');
    if (end.note != null) {
      output = output.write(' ').write(end.note);
    }
    OutputStyle.reset(output);
  }

  static void displayMidLine(Input input, Severity severity,
                             int line, int lineDigits, Output<?> output) {
    displayLineLeadNumber(line, lineDigits, output);
    output = output.write(' ');
    formatSeverity(severity, output);
    output = output.write('|');
    OutputStyle.reset(output);
    output = output.write(' ');
    displayLineText(input, line, output);
  }

  static void displayLineComment(String label, String comment,
                                 int lineDigits, Output<?> output) {
    displayLineLeadComment(lineDigits, output);
    output = output.write(' ');
    OutputStyle.bold(output);
    output = output.write(label).write(':');
    OutputStyle.reset(output);
    if (comment != null) {
      output = output.write(' ').write(comment);
    }
  }

  static void displayLineLead(int lineDigits, Output<?> output) {
    OutputStyle.blueBold(output);
    final int padding = 1 + lineDigits;
    for (int i = 0; i < padding; i += 1) {
      output = output.write(' ');
    }
    output = output.write('|');
    OutputStyle.reset(output);
  }

  static void displayLineLeadComment(int lineDigits, Output<?> output) {
    OutputStyle.blueBold(output);
    final int padding = 1 + lineDigits;
    for (int i = 0; i < padding; i += 1) {
      output = output.write(' ');
    }
    output = output.write('=');
    OutputStyle.reset(output);
  }

  static void displayLineLeadArrow(int lineDigits, Output<?> output) {
    for (int i = 0; i < lineDigits; i += 1) {
      output = output.write(' ');
    }
    OutputStyle.blueBold(output);
    output = output.write('-').write('-').write('>');
    OutputStyle.reset(output);
  }

  static void displayLineLeadEllipsis(int lineDigits, Output<?> output) {
    OutputStyle.blueBold(output);
    for (int i = 0; i < lineDigits; i += 1) {
      output = output.write('.');
    }
    OutputStyle.reset(output);
    output = output.write(' ').write(' ');
  }

  static void displayLineLeadNumber(int line, int lineDigits, Output<?> output) {
    final int padding = lineDigits - Base10.countDigits(line);
    for (int i = 0; i < padding; i += 1) {
      output = output.write(' ');
    }
    OutputStyle.blueBold(output);
    Format.displayInt(line, output);
    output = output.write(' ').write('|');
    OutputStyle.reset(output);
  }

  static void displayLineText(Input input, int line, Output<?> output) {
    while (input.isCont() && input.line() == line) {
      output = output.write(input.head());
      input = input.step();
    }
    if (input.line() == line) {
      output = output.writeln();
    }
  }

  static void consumeLineText(Input input, int line) {
    while (input.isCont() && input.line() == line) {
      input = input.step();
    }
  }

  static void formatSeverity(Severity severity, Output<?> output) {
    switch (severity.level()) {
      case Severity.FATAL_LEVEL:
      case Severity.ALERT_LEVEL:
      case Severity.ERROR_LEVEL:
        OutputStyle.redBold(output);
        break;
      case Severity.WARNING_LEVEL:
        OutputStyle.yellowBold(output);
        break;
      case Severity.NOTE_LEVEL:
        OutputStyle.greenBold(output);
        break;
      case Severity.INFO_LEVEL:
        OutputStyle.cyanBold(output);
        break;
      case Severity.DEBUG_LEVEL:
      case Severity.TRACE_LEVEL:
      default:
        OutputStyle.magentaBold(output);
    }
  }
}
