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

import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Severity;
import swim.util.ToString;

/**
 * Informational message attached to an input location.
 */
@Public
@Since("5.0")
public final class Diagnostic implements ToString {

  final Input input;
  final SourceLocation location;
  final Severity severity;
  final @Nullable String message;
  final @Nullable String note;
  final @Nullable Diagnostic cause;

  Diagnostic(Input input, SourceLocation location, Severity severity,
             @Nullable String message, @Nullable String note,
             @Nullable Diagnostic cause) {
    this.input = input;
    this.location = location;
    this.severity = severity;
    this.message = message;
    this.note = note;
    this.cause = cause;
  }

  /**
   * Returns the {@code Input} stream to which this diagnostic is attached.
   */
  public Input input() {
    return this.input.clone();
  }

  /**
   * Returns the annotated {@code SourceLocation} in the {@code input} stream
   * to which this diagnostic is attached.
   */
  public SourceLocation location() {
    return this.location;
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
  public @Nullable String message() {
    return this.message;
  }

  /**
   * Returns an informative comment on the source context to which this
   * diagnostic is attached.
   */
  public @Nullable String note() {
    return this.note;
  }

  /**
   * Returns the {@code Diagnostic} cause of this diagnostic, forming a linked
   * chain of diagnostics, or {@code null} if this diagnostic has no cause.
   */
  public @Nullable Diagnostic cause() {
    return this.cause;
  }

  private int lineDigits() {
    int digits = Base10.countDigits(this.location.end().line());
    if (this.cause != null) {
      digits = Math.max(digits, this.cause.lineDigits());
    }
    return digits;
  }

  @Override
  public void writeString(Appendable output) {
    Diagnostic.writeString(Notation.from(output), this.input.clone(),
                           this.location.start(), this.location.end(),
                           this.severity, this.message, this.note,
                           this.cause, CONTEXT_LINES, this.lineDigits());
  }

  static void writeString(Notation notation, Input input, SourcePosition start,
                          SourcePosition end, Severity severity,
                          @Nullable String message, @Nullable String note,
                          @Nullable Diagnostic cause, int contextLines,
                          int lineDigits) {
    do {
      if (message != null) {
        Diagnostic.writeMessage(notation, severity, message);
        notation.append('\n');
      }
      Diagnostic.writeAnchor(notation, input, start, lineDigits);
      notation.append('\n');
      final Diagnostic next = Diagnostic.writeContext(notation, input, start,
                                                      end, severity, note, cause,
                                                      contextLines, lineDigits);
      if (next != null) {
        notation.append('\n');
        input = next.input.clone();
        start = next.location.start();
        end = next.location.end();
        severity = next.severity;
        message = next.message;
        note = next.note;
        cause = next.cause;
        continue;
      }
      break;
    } while (true);
  }

  static void writeMessage(Notation notation, Severity severity,
                           @Nullable String message) {
    severity.stylize(notation);
    notation.append(severity.label());
    notation.reset();
    notation.bold();
    notation.append(':');
    if (message != null) {
      notation.append(' ').append(message);
    }
    notation.reset();
  }

  static void writeAnchor(Notation notation, Input input,
                          SourcePosition start, int lineDigits) {
    Diagnostic.writeLineLeadArrow(notation, lineDigits);
    notation.append(' ');
    final String identifier = input.identifier();
    if (identifier != null) {
      notation.append(identifier);
    }
    notation.append(':').append(start.line).append(':').append(start.column);
    notation.append('\n');

    Diagnostic.writeLineLead(notation, lineDigits);
  }

  static @Nullable Diagnostic writeContext(Notation notation, Input input, SourcePosition start,
                                           SourcePosition end, Severity severity,
                                           @Nullable String note, @Nullable Diagnostic cause,
                                           int contextLines, int lineDigits) {
    Diagnostic next = cause;
    final boolean sameCause = cause != null && cause.message == null
                           && Objects.equals(input.identifier(), cause.input.identifier());
    final int causeOrder = sameCause ? (start.offset <= Assume.nonNull(cause).location.start().offset ? -1 : 1) : 0;
    if (causeOrder == 1) {
      cause = Assume.nonNull(cause);
      next = Diagnostic.writeContext(notation, cause.input.clone(),
                                     cause.location.start(), cause.location.end(),
                                     cause.severity, cause.note, cause.cause,
                                     contextLines, lineDigits);
      notation.append('\n');
      Diagnostic.writeLineLeadEllipsis(notation, lineDigits);
      notation.append('\n');
    }
    Diagnostic.writeLines(notation, input, start, end, severity,
                           contextLines, lineDigits);
    if (note != null) {
      Diagnostic.writeNote(notation, note, lineDigits);
    }
    if (causeOrder == -1) {
      cause = Assume.nonNull(cause);
      notation.append('\n');
      Diagnostic.writeLineLeadEllipsis(notation, lineDigits);
      notation.append('\n');
      next = Diagnostic.writeContext(notation, cause.input.clone(),
                                     cause.location.start(), cause.location.end(),
                                     cause.severity, cause.note, cause.cause,
                                     contextLines, lineDigits);
    }
    return next;
  }

  static void writeLines(Notation notation, Input input, SourcePosition start,
                         SourcePosition end, Severity severity,
                         int contextLines, int lineDigits) {
    final int startLine = start.line();
    final int endLine = end.line();
    int line = input.line();

    while (line < startLine) {
      Diagnostic.consumeLineText(input, line);
      line += 1;
    }

    if (endLine - startLine > 2 * contextLines + 2) {
      while (line <= startLine + contextLines) {
        Diagnostic.writeLine(notation, input, start, end,
                             severity, line, lineDigits);
        line += 1;
      }
      Diagnostic.writeLineLeadEllipsis(notation, lineDigits);
      notation.append(' ');
      severity.stylize(notation);
      notation.append('|');
      notation.reset();
      notation.append('\n');
      while (line < endLine - contextLines) {
        Diagnostic.consumeLineText(input, line);
        line += 1;
      }
    }

    while (line <= endLine) {
      Diagnostic.writeLine(notation, input, start, end,
                           severity, line, lineDigits);
      line += 1;
    }
  }

  static void writeNote(Notation notation, String note, int lineDigits) {
    notation.append('\n');
    Diagnostic.writeLineLead(notation, lineDigits);
    notation.append('\n');
    Diagnostic.writeLineComment(notation, "note", note, lineDigits);
  }

  static void writeLine(Notation notation, Input input, SourcePosition start,
                        SourcePosition end, Severity severity,
                        int line, int lineDigits) {
    if (start.line == line && end.line == line) {
      Diagnostic.writeSingleLine(notation, input, start, end, severity, line, lineDigits);
    } else if (start.line == line) {
      Diagnostic.writeStartLine(notation, input, start, severity, line, lineDigits);
    } else if (end.line == line) {
      Diagnostic.writeEndLine(notation, input, end, severity, line, lineDigits);
    } else {
      Diagnostic.writeMidLine(notation, input, severity, line, lineDigits);
    }
  }

  static void writeSingleLine(Notation notation, Input input,
                              SourcePosition start, SourcePosition end,
                              Severity severity, int line, int lineDigits) {
    Diagnostic.writeLineLeadNumber(notation, line, lineDigits);
    notation.append(' ');
    for (int i = 1; i < input.column(); i += 1) {
      notation.append(' ');
    }
    Diagnostic.writeLineText(notation, input, line);

    Diagnostic.writeLineLead(notation, lineDigits);
    notation.append(' ');
    int i = 1;
    while (i < start.column) {
      notation.append(' ');
      i += 1;
    }
    severity.stylize(notation);
    while (i <= end.column) {
      notation.append('^');
      i += 1;
    }
    if (end.note != null) {
      notation.append(' ').append(end.note);
    }
    notation.reset();
  }

  static void writeStartLine(Notation notation, Input input,
                              SourcePosition start, Severity severity,
                              int line, int lineDigits) {
    Diagnostic.writeLineLeadNumber(notation, line, lineDigits);
    notation.append(' ').append(' ').append(' ');
    for (int i = 1; i < input.column(); i += 1) {
      notation.append(' ');
    }
    Diagnostic.writeLineText(notation, input, line);

    Diagnostic.writeLineLead(notation, lineDigits);
    notation.append(' ').append(' ');
    severity.stylize(notation);
    notation.append('_');
    int i = 1;
    while (i < start.column) {
      notation.append('_');
      i += 1;
    }
    notation.append('^');
    if (start.note != null) {
      notation.append(' ').append(start.note);
    }
    notation.reset();
    notation.append('\n');
  }

  static void writeEndLine(Notation notation, Input input, SourcePosition end,
                           Severity severity, int line, int lineDigits) {
    Diagnostic.writeLineLeadNumber(notation, line, lineDigits);
    notation.append(' ');
    severity.stylize(notation);
    notation.append('|');
    notation.reset();
    notation.append(' ');
    Diagnostic.writeLineText(notation, input, line);

    Diagnostic.writeLineLead(notation, lineDigits);
    notation.append(' ');
    severity.stylize(notation);
    notation.append('|').append('_');
    int i = 1;
    while (i < end.column) {
      notation.append('_');
      i += 1;
    }
    notation.append('^');
    if (end.note != null) {
      notation.append(' ').append(end.note);
    }
    notation.reset();
  }

  static void writeMidLine(Notation notation, Input input, Severity severity,
                           int line, int lineDigits) {
    Diagnostic.writeLineLeadNumber(notation, line, lineDigits);
    notation.append(' ');
    severity.stylize(notation);
    notation.append('|');
    notation.reset();
    notation.append(' ');
    Diagnostic.writeLineText(notation, input, line);
  }

  static void writeLineComment(Notation notation, String label,
                               @Nullable String comment, int lineDigits) {
    Diagnostic.writeLineLeadComment(notation, lineDigits);
    notation.append(' ');
    notation.bold();
    notation.append(label).append(':');
    notation.reset();
    if (comment != null) {
      notation.append(' ').append(comment);
    }
  }

  static void writeLineLead(Notation notation, int lineDigits) {
    notation.boldBlue();
    final int padding = 1 + lineDigits;
    for (int i = 0; i < padding; i += 1) {
      notation.append(' ');
    }
    notation.append('|');
    notation.reset();
  }

  static void writeLineLeadComment(Notation notation, int lineDigits) {
    notation.boldBlue();
    final int padding = 1 + lineDigits;
    for (int i = 0; i < padding; i += 1) {
      notation.append(' ');
    }
    notation.append('=');
    notation.reset();
  }

  static void writeLineLeadArrow(Notation notation, int lineDigits) {
    for (int i = 0; i < lineDigits; i += 1) {
      notation.append(' ');
    }
    notation.boldBlue();
    notation.append('-').append('-').append('>');
    notation.reset();
  }

  static void writeLineLeadEllipsis(Notation notation, int lineDigits) {
    notation.boldBlue();
    for (int i = 0; i < lineDigits; i += 1) {
      notation.append('.');
    }
    notation.reset();
    notation.append(' ').append(' ');
  }

  static void writeLineLeadNumber(Notation notation, int line, int lineDigits) {
    final int padding = lineDigits - Base10.countDigits(line);
    for (int i = 0; i < padding; i += 1) {
      notation.append(' ');
    }
    notation.boldBlue();
    notation.append(line).append(' ').append('|');
    notation.reset();
  }

  static void writeLineText(Notation notation, Input input, int line) {
    while (input.isCont() && input.line() == line) {
      notation.appendCodePoint(input.head());
      input.step();
    }
    if (input.line() == line) {
      notation.append('\n');
    }
  }

  static void consumeLineText(Input input, int line) {
    while (input.isCont() && input.line() == line) {
      input.step();
    }
  }

  @Override
  public String toString() {
    return this.toString(null);
  }

  static final int CONTEXT_LINES = 2;

  public static Diagnostic of(Input input, SourceLocation location, Severity severity,
                              @Nullable String message, @Nullable String note,
                              @Nullable Diagnostic cause) {
    input = input.clone();
    Objects.requireNonNull(location, "location");
    Objects.requireNonNull(severity, "severity");
    return new Diagnostic(input, location, severity, message, note, cause);
  }

  public static Diagnostic of(Input input, SourceLocation location, Severity severity,
                              @Nullable String message, @Nullable String note) {
    return Diagnostic.of(input, location, severity, message, note, null);
  }

  public static Diagnostic of(Input input, SourceLocation location, Severity severity,
                              @Nullable String message, @Nullable Diagnostic cause) {
    return Diagnostic.of(input, location, severity, message, null, cause);
  }

  public static Diagnostic of(Input input, SourceLocation location, Severity severity,
                              @Nullable String message) {
    return Diagnostic.of(input, location, severity, message, null, null);
  }

  public static Diagnostic of(Input input, SourceLocation location, Severity severity,
                              @Nullable Diagnostic cause) {
    return Diagnostic.of(input, location, severity, null, null, cause);
  }

  public static Diagnostic of(Input input, SourceLocation location, Severity severity) {
    return Diagnostic.of(input, location, severity, null, null, null);
  }

  public static Diagnostic message(@Nullable String message, Input input,
                                   Severity severity, @Nullable String note,
                                   @Nullable Diagnostic cause) {
    final SourcePosition position = input.position();
    final Input source = input.clone().seek(null);
    return Diagnostic.of(source, position, severity, message, note, cause);
  }

  public static Diagnostic message(@Nullable String message, Input input,
                                   Severity severity, @Nullable String note) {
    return Diagnostic.message(message, input, severity, note, null);
  }

  public static Diagnostic message(@Nullable String message, Input input,
                                   Severity severity, @Nullable Diagnostic cause) {
    return Diagnostic.message(message, input, severity, null, cause);
  }

  public static Diagnostic message(@Nullable String message, Input input,
                                   Severity severity) {
    return Diagnostic.message(message, input, severity, null, null);
  }

  public static Diagnostic message(@Nullable String message, Input input,
                                   @Nullable String note, @Nullable Diagnostic cause) {
    return Diagnostic.message(message, input, Severity.ERROR, note, cause);
  }

  public static Diagnostic message(@Nullable String message, Input input,
                                   @Nullable String note) {
    return Diagnostic.message(message, input, Severity.ERROR, note, null);
  }

  public static Diagnostic message(@Nullable String message, Input input,
                                   @Nullable Diagnostic cause) {
    return Diagnostic.message(message, input, Severity.ERROR, null, cause);
  }

  public static Diagnostic message(@Nullable String message, Input input) {
    return Diagnostic.message(message, input, Severity.ERROR, null, null);
  }

  public static Diagnostic unexpected(Input input, Severity severity,
                                      @Nullable String note,
                                      @Nullable Diagnostic cause) {
    final String message;
    if (input.isCont()) {
      final Notation notation = new Notation();
      notation.append("Unexpected").append(' ');
      notation.appendSourceCodePoint(input.head());
      message = notation.toString();
    } else {
      message = "Unexpected end of input";
    }
    final SourcePosition position = input.position();
    final Input source = input.clone().seek(null);
    return Diagnostic.of(source, position, severity, message, note, cause);
  }

  public static Diagnostic unexpected(Input input, Severity severity,
                                      @Nullable String note) {
    return Diagnostic.unexpected(input, severity, note, null);
  }

  public static Diagnostic unexpected(Input input, Severity severity,
                                      @Nullable Diagnostic cause) {
    return Diagnostic.unexpected(input, severity, null, cause);
  }

  public static Diagnostic unexpected(Input input, Severity severity) {
    return Diagnostic.unexpected(input, severity, null, null);
  }

  public static Diagnostic unexpected(Input input, @Nullable String note,
                                      @Nullable Diagnostic cause) {
    return Diagnostic.unexpected(input, Severity.ERROR, note, cause);
  }

  public static Diagnostic unexpected(Input input, @Nullable String note) {
    return Diagnostic.unexpected(input, Severity.ERROR, note, null);
  }

  public static Diagnostic unexpected(Input input, @Nullable Diagnostic cause) {
    return Diagnostic.unexpected(input, Severity.ERROR, null, cause);
  }

  public static Diagnostic unexpected(Input input) {
    return Diagnostic.unexpected(input, Severity.ERROR, null, null);
  }

  public static Diagnostic expected(int expected, Input input, Severity severity,
                                    @Nullable String note, @Nullable Diagnostic cause) {
    final Notation notation = new Notation();
    notation.append("Expected").append(' ');
    notation.appendSourceCodePoint(expected);
    notation.append(", ").append("but found").append(' ');
    if (input.isCont()) {
      notation.appendSourceCodePoint(input.head());
    } else {
      notation.append("end of input");
    }
    final String message = notation.toString();
    final SourcePosition position = input.position();
    final Input source = input.clone().seek(null);
    return Diagnostic.of(source, position, severity, message, note, cause);
  }

  public static Diagnostic expected(int expected, Input input, Severity severity,
                                    @Nullable String note) {
    return Diagnostic.expected(expected, input, severity, note, null);
  }

  public static Diagnostic expected(int expected, Input input, Severity severity,
                                    @Nullable Diagnostic cause) {
    return Diagnostic.expected(expected, input, severity, null, cause);
  }

  public static Diagnostic expected(int expected, Input input, Severity severity) {
    return Diagnostic.expected(expected, input, severity, null, null);
  }

  public static Diagnostic expected(int expected, Input input, @Nullable String note,
                                    @Nullable Diagnostic cause) {
    return Diagnostic.expected(expected, input, Severity.ERROR, note, cause);
  }

  public static Diagnostic expected(int expected, Input input, @Nullable String note) {
    return Diagnostic.expected(expected, input, Severity.ERROR, note, null);
  }

  public static Diagnostic expected(int expected, Input input, @Nullable Diagnostic cause) {
    return Diagnostic.expected(expected, input, Severity.ERROR, null, cause);
  }

  public static Diagnostic expected(int expected, Input input) {
    return Diagnostic.expected(expected, input, Severity.ERROR, null, null);
  }

  public static Diagnostic expected(String expected, Input input, Severity severity,
                                    @Nullable String note, @Nullable Diagnostic cause) {
    final Notation notation = new Notation();
    notation.append("Expected").append(' ').append(expected)
            .append(", ").append("but found").append(' ');
    if (input.isCont()) {
      notation.appendSourceCodePoint(input.head());
    } else {
      notation.append("end of input");
    }
    final String message = notation.toString();
    final SourcePosition position = input.position();
    final Input source = input.clone().seek(null);
    return Diagnostic.of(source, position, severity, message, note, cause);
  }

  public static Diagnostic expected(String expected, Input input, Severity severity,
                                    @Nullable String note) {
    return Diagnostic.expected(expected, input, severity, note, null);
  }

  public static Diagnostic expected(String expected, Input input, Severity severity,
                                    @Nullable Diagnostic cause) {
    return Diagnostic.expected(expected, input, severity, null, cause);
  }

  public static Diagnostic expected(String expected, Input input, Severity severity) {
    return Diagnostic.expected(expected, input, severity, null, null);
  }

  public static Diagnostic expected(String expected, Input input, @Nullable String note,
                                    @Nullable Diagnostic cause) {
    return Diagnostic.expected(expected, input, Severity.ERROR, note, cause);
  }

  public static Diagnostic expected(String expected, Input input, @Nullable String note) {
    return Diagnostic.expected(expected, input, Severity.ERROR, note, null);
  }

  public static Diagnostic expected(String expected, Input input, @Nullable Diagnostic cause) {
    return Diagnostic.expected(expected, input, Severity.ERROR, null, cause);
  }

  public static Diagnostic expected(String expected, Input input) {
    return Diagnostic.expected(expected, input, Severity.ERROR, null, null);
  }

}
