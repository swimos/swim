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

import java.util.AbstractMap;
import java.util.Map;
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
  public <T> Output<T> display(Output<T> output) {
    final Input input = this.input.clone();
    final Mark start = this.tag.start();
    final Mark end = this.tag.end();
    final Severity severity = this.severity;
    final String message = this.message;
    final String note = this.note;
    final Diagnostic cause = this.cause;
    final int contextLines = 2;
    final int lineDigits = this.lineDigits();
    output = Diagnostic.display(input, start, end, severity, message, note, cause,
                                contextLines, lineDigits, output);
    return output;
  }

  static <T> Output<T> display(Input input, Mark start, Mark end, Severity severity,
                               String message, String note, Diagnostic cause,
                               int contextLines, int lineDigits, Output<T> output) {
    do {
      if (message != null) {
        output = Diagnostic.displayMessage(severity, message, output);
        output = output.writeln();
      }
      output = Diagnostic.displayAnchor(input, start, lineDigits, output);
      output = output.writeln();
      final Map.Entry<Diagnostic, Output<T>> cont = Diagnostic.displayContext(input, start, end, severity, note,
                                                                              cause, contextLines, lineDigits, output);
      final Diagnostic next = cont.getKey();
      output = cont.getValue();
      if (next != null) {
        output = output.writeln();
        input = next.input.clone();
        start = next.tag.start();
        end = next.tag.end();
        severity = next.severity;
        message = next.message;
        note = next.note;
        cause = next.cause;
        continue;
      }
      break;
    } while (true);
    return output;
  }

  static <T> Output<T> displayMessage(Severity severity, String message, Output<T> output) {
    output = Diagnostic.formatSeverity(severity, output);
    output = output.write(severity.label());
    output = OutputStyle.reset(output);
    output = OutputStyle.bold(output);
    output = output.write(':');
    if (message != null) {
      output = output.write(' ').write(message);
    }
    output = OutputStyle.reset(output);
    return output;
  }

  static <T> Output<T> displayAnchor(Input input, Mark start, int lineDigits, Output<T> output) {
    output = Diagnostic.displayLineLeadArrow(lineDigits, output);
    output = output.write(' ');
    final Object id = input.id();
    if (id != null) {
      output = Format.display(id, output);
    }
    output = output.write(':');
    output = Format.displayInt(start.line, output);
    output = output.write(':');
    output = Format.displayInt(start.column, output);
    output = output.writeln();

    output = Diagnostic.displayLineLead(lineDigits, output);
    return output;
  }

  static <T> Map.Entry<Diagnostic, Output<T>> displayContext(Input input, Mark start, Mark end, Severity severity,
                                                             String note, Diagnostic cause, int contextLines,
                                                             int lineDigits, Output<T> output) {
    Diagnostic next = cause;
    final boolean sameCause = cause != null && cause.message == null
                           && Objects.equals(input.id(), cause.input.id());
    final int causeOrder = sameCause ? (start.offset <= cause.tag.start().offset ? -1 : 1) : 0;
    if (causeOrder == 1) {
      final Map.Entry<Diagnostic, Output<T>> cont = Diagnostic.displayContext(cause.input.clone(), cause.tag.start(), cause.tag.end(),
                                                                              cause.severity, cause.note, cause.cause,
                                                                              contextLines, lineDigits, output);
      next = cont.getKey();
      output = cont.getValue();
      output = output.writeln();
      output = Diagnostic.displayLineLeadEllipsis(lineDigits, output);
      output = output.writeln();
    }
    output = Diagnostic.displayLines(input, start, end, severity, contextLines, lineDigits, output);
    if (note != null) {
      output = Diagnostic.displayNote(note, lineDigits, output);
    }
    if (causeOrder == -1) {
      output = output.writeln();
      output = Diagnostic.displayLineLeadEllipsis(lineDigits, output);
      output = output.writeln();
      final Map.Entry<Diagnostic, Output<T>> cont = Diagnostic.displayContext(cause.input.clone(), cause.tag.start(), cause.tag.end(),
                                                                              cause.severity, cause.note, cause.cause,
                                                                              contextLines, lineDigits, output);
      next = cont.getKey();
      output = cont.getValue();
    }
    return new AbstractMap.SimpleImmutableEntry<Diagnostic, Output<T>>(next, output);
  }

  static <T> Output<T> displayLines(Input input, Mark start, Mark end, Severity severity,
                                    int contextLines, int lineDigits, Output<T> output) {
    final int startLine = start.line();
    final int endLine = end.line();
    int line = input.line();

    while (line < startLine) {
      Diagnostic.consumeLineText(input, line);
      line += 1;
    }

    if (endLine - startLine > 2 * contextLines + 2) {
      while (line <= startLine + contextLines) {
        output = Diagnostic.displayLine(input, start, end, severity, line, lineDigits, output);
        line += 1;
      }
      output = Diagnostic.displayLineLeadEllipsis(lineDigits, output);
      output = output.write(' ');
      output = Diagnostic.formatSeverity(severity, output);
      output = output.write('|');
      output = OutputStyle.reset(output);
      output = output.writeln();
      while (line < endLine - contextLines) {
        Diagnostic.consumeLineText(input, line);
        line += 1;
      }
    }

    while (line <= endLine) {
      output = Diagnostic.displayLine(input, start, end, severity, line, lineDigits, output);
      line += 1;
    }
    return output;
  }

  static <T> Output<T> displayNote(String note, int lineDigits, Output<T> output) {
    output = output.writeln();
    output = Diagnostic.displayLineLead(lineDigits, output);
    output = output.writeln();
    output = Diagnostic.displayLineComment("note", note, lineDigits, output);
    return output;
  }

  static <T> Output<T> displayLine(Input input, Mark start, Mark end, Severity severity,
                                   int line, int lineDigits, Output<T> output) {
    if (start.line == line && end.line == line) {
      output = Diagnostic.displaySingleLine(input, start, end, severity, line, lineDigits, output);
    } else if (start.line == line) {
      output = Diagnostic.displayStartLine(input, start, severity, line, lineDigits, output);
    } else if (end.line == line) {
      output = Diagnostic.displayEndLine(input, end, severity, line, lineDigits, output);
    } else {
      output = Diagnostic.displayMidLine(input, severity, line, lineDigits, output);
    }
    return output;
  }

  static <T> Output<T> displaySingleLine(Input input, Mark start, Mark end, Severity severity,
                                         int line, int lineDigits, Output<T> output) {
    output = Diagnostic.displayLineLeadNumber(line, lineDigits, output);
    output = output.write(' ');
    for (int i = 1; i < input.column(); i += 1) {
      output = output.write(' ');
    }
    output = Diagnostic.displayLineText(input, line, output);

    output = Diagnostic.displayLineLead(lineDigits, output);
    output = output.write(' ');
    int i = 1;
    while (i < start.column) {
      output = output.write(' ');
      i += 1;
    }
    output = Diagnostic.formatSeverity(severity, output);
    while (i <= end.column) {
      output = output.write('^');
      i += 1;
    }
    if (end.note != null) {
      output = output.write(' ').write(end.note);
    }
    output = OutputStyle.reset(output);
    return output;
  }

  static <T> Output<T> displayStartLine(Input input, Mark start, Severity severity,
                                        int line, int lineDigits, Output<T> output) {
    output = Diagnostic.displayLineLeadNumber(line, lineDigits, output);
    output = output.write(' ').write(' ').write(' ');
    for (int i = 1; i < input.column(); i += 1) {
      output = output.write(' ');
    }
    output = Diagnostic.displayLineText(input, line, output);

    output = Diagnostic.displayLineLead(lineDigits, output);
    output = output.write(' ').write(' ');
    output = Diagnostic.formatSeverity(severity, output);
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
    output = OutputStyle.reset(output);
    output = output.writeln();
    return output;
  }

  static <T> Output<T> displayEndLine(Input input, Mark end, Severity severity,
                                      int line, int lineDigits, Output<T> output) {
    output = Diagnostic.displayLineLeadNumber(line, lineDigits, output);
    output = output.write(' ');
    output = Diagnostic.formatSeverity(severity, output);
    output = output.write('|');
    output = OutputStyle.reset(output);
    output = output.write(' ');
    output = Diagnostic.displayLineText(input, line, output);

    output = Diagnostic.displayLineLead(lineDigits, output);
    output = output.write(' ');
    output = Diagnostic.formatSeverity(severity, output);
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
    output = OutputStyle.reset(output);
    return output;
  }

  static <T> Output<T> displayMidLine(Input input, Severity severity,
                                      int line, int lineDigits, Output<T> output) {
    output = Diagnostic.displayLineLeadNumber(line, lineDigits, output);
    output = output.write(' ');
    output = Diagnostic.formatSeverity(severity, output);
    output = output.write('|');
    output = OutputStyle.reset(output);
    output = output.write(' ');
    output = Diagnostic.displayLineText(input, line, output);
    return output;
  }

  static <T> Output<T> displayLineComment(String label, String comment,
                                          int lineDigits, Output<T> output) {
    output = Diagnostic.displayLineLeadComment(lineDigits, output);
    output = output.write(' ');
    output = OutputStyle.bold(output);
    output = output.write(label).write(':');
    output = OutputStyle.reset(output);
    if (comment != null) {
      output = output.write(' ').write(comment);
    }
    return output;
  }

  static <T> Output<T> displayLineLead(int lineDigits, Output<T> output) {
    output = OutputStyle.blueBold(output);
    final int padding = 1 + lineDigits;
    for (int i = 0; i < padding; i += 1) {
      output = output.write(' ');
    }
    output = output.write('|');
    output = OutputStyle.reset(output);
    return output;
  }

  static <T> Output<T> displayLineLeadComment(int lineDigits, Output<T> output) {
    output = OutputStyle.blueBold(output);
    final int padding = 1 + lineDigits;
    for (int i = 0; i < padding; i += 1) {
      output = output.write(' ');
    }
    output = output.write('=');
    output = OutputStyle.reset(output);
    return output;
  }

  static <T> Output<T> displayLineLeadArrow(int lineDigits, Output<T> output) {
    for (int i = 0; i < lineDigits; i += 1) {
      output = output.write(' ');
    }
    output = OutputStyle.blueBold(output);
    output = output.write('-').write('-').write('>');
    output = OutputStyle.reset(output);
    return output;
  }

  static <T> Output<T> displayLineLeadEllipsis(int lineDigits, Output<T> output) {
    output = OutputStyle.blueBold(output);
    for (int i = 0; i < lineDigits; i += 1) {
      output = output.write('.');
    }
    output = OutputStyle.reset(output);
    output = output.write(' ').write(' ');
    return output;
  }

  static <T> Output<T> displayLineLeadNumber(int line, int lineDigits, Output<T> output) {
    final int padding = lineDigits - Base10.countDigits(line);
    for (int i = 0; i < padding; i += 1) {
      output = output.write(' ');
    }
    output = OutputStyle.blueBold(output);
    output = Format.displayInt(line, output);
    output = output.write(' ').write('|');
    output = OutputStyle.reset(output);
    return output;
  }

  static <T> Output<T> displayLineText(Input input, int line, Output<T> output) {
    while (input.isCont() && input.line() == line) {
      output = output.write(input.head());
      input = input.step();
    }
    if (input.line() == line) {
      output = output.writeln();
    }
    return output;
  }

  static void consumeLineText(Input input, int line) {
    while (input.isCont() && input.line() == line) {
      input = input.step();
    }
  }

  static <T> Output<T> formatSeverity(Severity severity, Output<T> output) {
    switch (severity.level()) {
      case Severity.FATAL_LEVEL:
      case Severity.ALERT_LEVEL:
      case Severity.ERROR_LEVEL:
        output = OutputStyle.redBold(output);
        break;
      case Severity.WARNING_LEVEL:
        output = OutputStyle.yellowBold(output);
        break;
      case Severity.NOTE_LEVEL:
        output = OutputStyle.greenBold(output);
        break;
      case Severity.INFO_LEVEL:
        output = OutputStyle.cyanBold(output);
        break;
      case Severity.DEBUG_LEVEL:
      case Severity.TRACE_LEVEL:
      default:
        output = OutputStyle.magentaBold(output);
    }
    return output;
  }

  public String toString(OutputSettings settings) {
    return Format.display(this, settings);
  }

  @Override
  public String toString() {
    return Format.display(this);
  }

  public static Diagnostic create(Input input, Tag tag, Severity severity,
                                  String message, String note, Diagnostic cause) {
    input = input.clone();
    tag = Objects.requireNonNull(tag);
    severity = Objects.requireNonNull(severity);
    return new Diagnostic(input, tag, severity, message, note, cause);
  }

  public static Diagnostic create(Input input, Tag tag, Severity severity,
                                  String message, String note) {
    return Diagnostic.create(input, tag, severity, message, note, null);
  }

  public static Diagnostic create(Input input, Tag tag, Severity severity,
                                  String message, Diagnostic cause) {
    return Diagnostic.create(input, tag, severity, message, null, cause);
  }

  public static Diagnostic create(Input input, Tag tag, Severity severity, String message) {
    return Diagnostic.create(input, tag, severity, message, null, null);
  }

  public static Diagnostic create(Input input, Tag tag, Severity severity, Diagnostic cause) {
    return Diagnostic.create(input, tag, severity, null, null, cause);
  }

  public static Diagnostic create(Input input, Tag tag, Severity severity) {
    return Diagnostic.create(input, tag, severity, null, null, null);
  }

  public static Diagnostic message(String message, Input input, Severity severity, String note, Diagnostic cause) {
    final Mark mark = input.mark();
    final Input source = input.clone().seek(null);
    return Diagnostic.create(source, mark, severity, message, note, cause);
  }

  public static Diagnostic message(String message, Input input, Severity severity, String note) {
    return Diagnostic.message(message, input, severity, note, null);
  }

  public static Diagnostic message(String message, Input input, Severity severity, Diagnostic cause) {
    return Diagnostic.message(message, input, severity, null, cause);
  }

  public static Diagnostic message(String message, Input input, Severity severity) {
    return Diagnostic.message(message, input, severity, null, null);
  }

  public static Diagnostic message(String message, Input input, String note, Diagnostic cause) {
    return Diagnostic.message(message, input, Severity.error(), note, cause);
  }

  public static Diagnostic message(String message, Input input, String note) {
    return Diagnostic.message(message, input, Severity.error(), note, null);
  }

  public static Diagnostic message(String message, Input input, Diagnostic cause) {
    return Diagnostic.message(message, input, Severity.error(), null, cause);
  }

  public static Diagnostic message(String message, Input input) {
    return Diagnostic.message(message, input, Severity.error(), null, null);
  }

  public static Diagnostic unexpected(Input input, Severity severity, String note, Diagnostic cause) {
    final String message;
    if (input.isCont()) {
      Output<String> output = Unicode.stringOutput().write("unexpected").write(' ');
      output = Format.debugChar(input.head(), output);
      message = output.bind();
    } else {
      message = "unexpected end of input";
    }
    final Mark mark = input.mark();
    final Input source = input.clone().seek(null);
    return Diagnostic.create(source, mark, severity, message, note, cause);
  }

  public static Diagnostic unexpected(Input input, Severity severity, String note) {
    return Diagnostic.unexpected(input, severity, note, null);
  }

  public static Diagnostic unexpected(Input input, Severity severity, Diagnostic cause) {
    return Diagnostic.unexpected(input, severity, null, cause);
  }

  public static Diagnostic unexpected(Input input, Severity severity) {
    return Diagnostic.unexpected(input, severity, null, null);
  }

  public static Diagnostic unexpected(Input input, String note, Diagnostic cause) {
    return Diagnostic.unexpected(input, Severity.error(), note, cause);
  }

  public static Diagnostic unexpected(Input input, String note) {
    return Diagnostic.unexpected(input, Severity.error(), note, null);
  }

  public static Diagnostic unexpected(Input input, Diagnostic cause) {
    return Diagnostic.unexpected(input, Severity.error(), null, cause);
  }

  public static Diagnostic unexpected(Input input) {
    return Diagnostic.unexpected(input, Severity.error(), null, null);
  }

  public static Diagnostic expected(int expected, Input input, Severity severity, String note, Diagnostic cause) {
    Output<String> output = Unicode.stringOutput().write("expected").write(' ');
    output = Format.debugChar(expected, output);
    output = output.write(", ").write("but found").write(' ');
    if (input.isCont()) {
      output = Format.debugChar(input.head(), output);
    } else {
      output = output.write("end of input");
    }
    final String message = output.bind();
    final Mark mark = input.mark();
    final Input source = input.clone().seek(null);
    return Diagnostic.create(source, mark, severity, message, note, cause);
  }

  public static Diagnostic expected(int expected, Input input, Severity severity, String note) {
    return Diagnostic.expected(expected, input, severity, note, null);
  }

  public static Diagnostic expected(int expected, Input input, Severity severity, Diagnostic cause) {
    return Diagnostic.expected(expected, input, severity, null, cause);
  }

  public static Diagnostic expected(int expected, Input input, Severity severity) {
    return Diagnostic.expected(expected, input, severity, null, null);
  }

  public static Diagnostic expected(int expected, Input input, String note, Diagnostic cause) {
    return Diagnostic.expected(expected, input, Severity.error(), note, cause);
  }

  public static Diagnostic expected(int expected, Input input, String note) {
    return Diagnostic.expected(expected, input, Severity.error(), note, null);
  }

  public static Diagnostic expected(int expected, Input input, Diagnostic cause) {
    return Diagnostic.expected(expected, input, Severity.error(), null, cause);
  }

  public static Diagnostic expected(int expected, Input input) {
    return Diagnostic.expected(expected, input, Severity.error(), null, null);
  }

  public static Diagnostic expected(String expected, Input input, Severity severity, String note, Diagnostic cause) {
    Output<String> output = Unicode.stringOutput().write("expected").write(' ').write(expected)
                                                  .write(", ").write("but found").write(' ');
    if (input.isCont()) {
      output = Format.debugChar(input.head(), output);
    } else {
      output = output.write("end of input");
    }
    final String message = output.bind();
    final Mark mark = input.mark();
    final Input source = input.clone().seek(null);
    return Diagnostic.create(source, mark, severity, message, note, cause);
  }

  public static Diagnostic expected(String expected, Input input, Severity severity, String note) {
    return Diagnostic.expected(expected, input, severity, note, null);
  }

  public static Diagnostic expected(String expected, Input input, Severity severity, Diagnostic cause) {
    return Diagnostic.expected(expected, input, severity, null, cause);
  }

  public static Diagnostic expected(String expected, Input input, Severity severity) {
    return Diagnostic.expected(expected, input, severity, null, null);
  }

  public static Diagnostic expected(String expected, Input input, String note, Diagnostic cause) {
    return Diagnostic.expected(expected, input, Severity.error(), note, cause);
  }

  public static Diagnostic expected(String expected, Input input, String note) {
    return Diagnostic.expected(expected, input, Severity.error(), note, null);
  }

  public static Diagnostic expected(String expected, Input input, Diagnostic cause) {
    return Diagnostic.expected(expected, input, Severity.error(), null, cause);
  }

  public static Diagnostic expected(String expected, Input input) {
    return Diagnostic.expected(expected, input, Severity.error(), null, null);
  }

}
