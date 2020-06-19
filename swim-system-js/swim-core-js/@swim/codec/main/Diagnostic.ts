// Copyright 2015-2020 Swim inc.
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

import {Objects, Severity} from "@swim/util";
import {Tag} from "./Tag";
import {Mark} from "./Mark";
import {Input} from "./Input";
import {OutputSettings} from "./OutputSettings";
import {Output} from "./Output";
import {OutputStyle} from "./OutputStyle";
import {Format} from "./Format";
import {Display} from "./Display";
import {Unicode} from "./Unicode";
import {Base10} from "./Base10";

/**
 * Informational message attached to an input location.
 */
export class Diagnostic implements Display {
  /** @hidden */
  readonly _input: Input;
  /** @hidden */
  readonly _tag: Tag;
  /** @hidden */
  readonly _severity: Severity;
  /** @hidden */
  readonly _message: string | null;
  /** @hidden */
  readonly _note: string | null;
  /** @hidden */
  readonly _cause: Diagnostic | null;

  constructor(input: Input, tag: Tag, severity: Severity, message: string | null,
              note: string | null, cause: Diagnostic | null) {
    this._input = input;
    this._tag = tag;
    this._severity = severity;
    this._message = message;
    this._note = note;
    this._cause = cause;
  }

  /**
   * Returns the `Input` source to which this diagnostic is attached.
   */
  input(): Input {
    return this._input.clone();
  }

  /**
   * Returns the annotated location `Tag` in the `input` to which this
   * diagnostic is attached.
   */
  tag(): Tag {
    return this._tag;
  }

  /**
   * Returns the level of importance of this diagnostic.
   */
  severity(): Severity {
    return this._severity;
  }

  /**
   * Returns the help message that describes this diagnostic.
   */
  message(): string | null {
    return this._message;
  }

  /**
   * Returns an informative comment on the source context to which this
   * diagnostic is attached.
   */
  note(): string | null {
    return this._note;
  }

  /**
   * Returns the `Diagnostic` cause of this diagnostic, forming a linked chain
   * of diagnostics, or `null` if this diagnostic has no cause.
   */
  cause(): Diagnostic | null {
    return this._cause;
  }

  private lineDigits(): number {
    let digits = Base10.countDigits(this._tag.end().line());
    if (this._cause !== null) {
      digits = Math.max(digits, this._cause.lineDigits());
    }
    return digits;
  }

  display(output: Output): void {
    const input = this._input.clone();
    const start = this._tag.start();
    const end = this._tag.end();
    const severity = this._severity;
    const message = this._message;
    const note = this._note;
    const cause = this._cause;
    const contextLines = 2;
    const lineDigits = this.lineDigits();
    Diagnostic.displayDiagnostic(input, start, end, severity, message, note,
                                 cause, contextLines, lineDigits, output);
  }

  toString(settings?: OutputSettings): string {
    return Format.display(this, settings);
  }

  static from(input: Input, tag: Tag, severity: Severity, cause?: Diagnostic | null): Diagnostic;
  static from(input: Input, tag: Tag, severity: Severity, message: string | null,
              diagnostic?: Diagnostic | null): Diagnostic;
  static from(input: Input, tag: Tag, severity: Severity, message: string | null,
              note: string | null, cause?: Diagnostic | null): Diagnostic;
  static from(input: Input, tag: Tag, severity: Severity, message?: Diagnostic | string | null,
              note?: Diagnostic | string | null, cause?: Diagnostic | null): Diagnostic {
    if (message instanceof Diagnostic) {
      cause = message;
      note = null;
      message = null;
    } else if (note instanceof Diagnostic) {
      cause = note;
      note = null;
    }
    input = input.clone();
    if (message === void 0) {
      message = null;
    }
    if (note === void 0) {
      note = null;
    }
    if (cause === void 0) {
      cause = null;
    }
    return new Diagnostic(input, tag, severity, message, note, cause);
  }

  static message(message: string, input: Input, cause?: Diagnostic | null): Diagnostic;
  static message(message: string, input: Input, note: string, cause?: Diagnostic | null): Diagnostic;
  static message(message: string, input: Input, severity: Severity, cause?: Diagnostic | null): Diagnostic;
  static message(message: string, input: Input, severity?: Severity, note?: string, cause?: Diagnostic | null): Diagnostic;
  static message(message: string, input: Input, severity?: Diagnostic | Severity | string | null,
                 note?: Diagnostic | string | null, cause?: Diagnostic | null): Diagnostic {
    if (severity === null || severity instanceof Diagnostic) {
      cause = severity;
      severity = void 0;
    } else if (typeof severity === "string") {
      note = severity;
      severity = void 0;
    }
    if (note === null || note instanceof Diagnostic) {
      cause = note;
      note = void 0;
    }
    if (note === void 0) {
      note = null;
    }
    if (severity === void 0) {
      severity = Severity.error();
    }

    const mark = input.mark();
    const source = input.clone();
    source.seek();
    return Diagnostic.from(source, mark, severity, message, note, cause);
  }

  static unexpected(input: Input, cause?: Diagnostic | null): Diagnostic;
  static unexpected(input: Input, note: string, cause?: Diagnostic | null): Diagnostic;
  static unexpected(input: Input, severity: Severity, cause?: Diagnostic | null): Diagnostic;
  static unexpected(input: Input, severity?: Severity, note?: string, cause?: Diagnostic | null): Diagnostic;
  static unexpected(input: Input, severity?: Diagnostic | Severity | string | null,
                    note?: Diagnostic | string | null, cause?: Diagnostic | null): Diagnostic {
    if (severity === null || severity instanceof Diagnostic) {
      cause = severity;
      severity = void 0;
    } else if (typeof severity === "string") {
      note = severity;
      severity = void 0;
    }
    if (note === null || note instanceof Diagnostic) {
      cause = note;
      note = void 0;
    }
    if (note === void 0) {
      note = null;
    }
    if (severity === void 0) {
      severity = Severity.error();
    }

    let message;
    if (input.isCont()) {
      const output = Unicode.stringOutput().write("unexpected").write(32/*' '*/);
      Format.debugChar(input.head(), output);
      message = output.bind();
    } else {
      message = "unexpected end of input";
    }
    const mark = input.mark();
    const source = input.clone();
    source.seek();
    return Diagnostic.from(source, mark, severity, message, note, cause);
  }

  static expected(expected: string | number, input: Input, cause?: Diagnostic | null): Diagnostic;
  static expected(expected: string | number, input: Input, note: string, cause?: Diagnostic | null): Diagnostic;
  static expected(expected: string | number, input: Input, severity: Severity, cause?: Diagnostic | null): Diagnostic;
  static expected(expected: string | number, input: Input, severity?: Severity, note?: string, cause?: Diagnostic | null): Diagnostic;
  static expected(expected: string | number, input: Input, severity?: Diagnostic | Severity | string | null,
                  note?: Diagnostic | string | null, cause?: Diagnostic | null): Diagnostic {
    if (severity === null || severity instanceof Diagnostic) {
      cause = severity;
      severity = void 0;
    } else if (typeof severity === "string") {
      note = severity;
      severity = void 0;
    }
    if (note === null || note instanceof Diagnostic) {
      cause = note;
      note = void 0;
    }
    if (note === void 0) {
      note = null;
    }
    if (severity === void 0) {
      severity = Severity.error();
    }

    let output = Unicode.stringOutput().write("expected").write(32/*' '*/);
    if (typeof expected === "number") {
      Format.debugChar(expected, output);
    } else {
      output = output.write(expected);
    }
    output = output.write(44/*','*/).write(32/*' '*/).write("but found").write(32/*' '*/);
    if (input.isCont()) {
      Format.debugChar(input.head(), output);
    } else {
      output = output.write("end of input");
    }
    const message = output.bind();
    const mark = input.mark();
    const source = input.clone();
    source.seek();
    return Diagnostic.from(source, mark, severity, message, note, cause);
  }

  private static displayDiagnostic(input: Input, start: Mark, end: Mark,
                                   severity: Severity, message: string | null,
                                   note: string | null, cause: Diagnostic | null,
                                   contextLines: number, lineDigits: number,
                                   output: Output): void {
    do {
      if (message !== null) {
        Diagnostic.displayMessage(severity, message, output);
        output = output.writeln();
      }
      Diagnostic.displayAnchor(input, start, lineDigits, output);
      output = output.writeln();
      const next = Diagnostic.displayContext(input, start, end, severity, note,
                                             cause, contextLines, lineDigits, output);
      if (next !== null) {
        output = output.writeln();
        input = next._input.clone();
        start = next._tag.start();
        end = next._tag.end();
        severity = next._severity;
        message = next._message;
        note = next._note;
        cause = next._cause;
      } else {
        break;
      }
    } while (true);
  }

  /** @hidden */
  static displayMessage(severity: Severity, message: string | null, output: Output): void {
    Diagnostic.formatSeverity(severity, output);
    output = output.write(severity.label());
    OutputStyle.reset(output);
    OutputStyle.bold(output);
    output = output.write(58/*':'*/);
    if (message !== null) {
      output = output.write(32/*' '*/).write(message);
    }
    OutputStyle.reset(output);
  }

  private static displayAnchor(input: Input, start: Mark, lineDigits: number,
                               output: Output): void {
    Diagnostic.displayLineLeadArrow(lineDigits, output);
    output = output.write(32/*' '*/);
    const id = input.id();
    if (id !== null) {
      Format.display(id, output);
    }
    output = output.write(58/*':'*/);
    Format.displayNumber(start._line, output);
    output = output.write(58/*':'*/);
    Format.displayNumber(start._column, output);
    output = output.writeln();

    Diagnostic.displayLineLead(lineDigits, output);
  }

  private static displayCause(cause: Diagnostic, contextLines: number,
                              lineDigits: number, output: Output): Diagnostic | null {
    const input = cause._input.clone();
    const start = cause._tag.start();
    const end = cause._tag.end();
    const severity = cause._severity;
    const note = cause._note;
    const next = cause._cause;
    return Diagnostic.displayContext(input, start, end, severity, note, next,
                                     contextLines, lineDigits, output);
  }

  private static displayContext(input: Input, start: Mark, end: Mark,
                                severity: Severity, note: string | null,
                                cause: Diagnostic | null, contextLines: number,
                                lineDigits: number, output: Output): Diagnostic | null {
    let next = cause;
    const sameCause = cause !== null && cause._message === null
                   && Objects.equal(input.id(), cause._input.id());
    const causeOrder = sameCause ? (start._offset <= cause!._tag.start()._offset ? -1 : 1) : 0;
    if (causeOrder === 1) {
      next = Diagnostic.displayCause(cause!, contextLines, lineDigits, output);
      output = output.writeln();
      Diagnostic.displayLineLeadEllipsis(lineDigits, output);
      output = output.writeln();
    }
    Diagnostic.displayLines(input, start, end, severity, contextLines, lineDigits, output);
    if (note !== null) {
      Diagnostic.displayNote(note, lineDigits, output);
    }
    if (causeOrder === -1) {
      output = output.writeln();
      Diagnostic.displayLineLeadEllipsis(lineDigits, output);
      output = output.writeln();
      next = Diagnostic.displayCause(cause!, contextLines, lineDigits, output);
    }
    return next;
  }

  private static displayLines(input: Input, start: Mark, end: Mark,
                              severity: Severity, contextLines: number,
                              lineDigits: number, output: Output): void {
    const startLine = start.line();
    const endLine = end.line();
    let line = input.line();

    while (line < startLine) {
      Diagnostic.consumeLineText(input, line);
      line += 1;
    }

    if (endLine - startLine > 2 * contextLines + 2) {
      while (line <= startLine + contextLines) {
        Diagnostic.displayLine(input, start, end, severity, line, lineDigits, output);
        line += 1;
      }
      Diagnostic.displayLineLeadEllipsis(lineDigits, output);
      output = output.write(32/*' '*/);
      Diagnostic.formatSeverity(severity, output);
      output = output.write(124/*'|'*/);
      OutputStyle.reset(output);
      output = output.writeln();
      while (line < endLine - contextLines) {
        Diagnostic.consumeLineText(input, line);
        line += 1;
      }
    }

    while (line <= endLine) {
      Diagnostic.displayLine(input, start, end, severity, line, lineDigits, output);
      line += 1;
    }
  }

  private static displayNote(note: string | null, lineDigits: number, output: Output): void {
    output = output.writeln();
    Diagnostic.displayLineLead(lineDigits, output);
    output = output.writeln();
    Diagnostic.displayLineComment('note', note, lineDigits, output);
  }

  private static displayLine(input: Input, start: Mark, end: Mark,
                             severity: Severity, line: number,
                             lineDigits: number, output: Output): void {
    if (start._line === line && end._line === line) {
      Diagnostic.displaySingleLine(input, start, end, severity, line, lineDigits, output);
    } else if (start._line === line) {
      Diagnostic.displayStartLine(input, start, severity, line, lineDigits, output);
    } else if (end._line === line) {
      Diagnostic.displayEndLine(input, end, severity, line, lineDigits, output);
    } else {
      Diagnostic.displayMidLine(input, severity, line, lineDigits, output);
    }
  }

  private static displaySingleLine(input: Input, start: Mark, end: Mark,
                                   severity: Severity, line: number,
                                   lineDigits: number, output: Output): void {
    Diagnostic.displayLineLeadNumber(line, lineDigits, output);
    output = output.write(32/*' '*/);
    for (let i = 1; i < input.column(); i += 1) {
      output = output.write(32/*' '*/);
    }
    Diagnostic.displayLineText(input, line, output);

    Diagnostic.displayLineLead(lineDigits, output);
    output = output.write(32/*' '*/);
    let i = 1;
    while (i < start._column) {
      output = output.write(32/*' '*/);
      i += 1;
    }
    Diagnostic.formatSeverity(severity, output);
    while (i <= end._column) {
      output = output.write(94/*'^'*/);
      i += 1;
    }
    if (end._note !== null) {
      output = output.write(32/*' '*/).write(end._note);
    }
    OutputStyle.reset(output);
  }

  private static displayStartLine(input: Input, start: Mark,
                                  severity: Severity, line: number,
                                  lineDigits: number, output: Output): void {
    Diagnostic.displayLineLeadNumber(line, lineDigits, output);
    output = output.write(32/*' '*/).write(32/*' '*/).write(32/*' '*/);
    for (let i = 1; i < input.column(); i += 1) {
      output = output.write(32/*' '*/);
    }
    Diagnostic.displayLineText(input, line, output);

    Diagnostic.displayLineLead(lineDigits, output);
    output = output.write(32/*' '*/).write(32/*' '*/);
    Diagnostic.formatSeverity(severity, output);
    output = output.write(95/*'_'*/);
    let i = 1;
    while (i < start._column) {
      output = output.write(95/*'_'*/);
      i += 1;
    }
    output = output.write(94/*'^'*/);
    if (start._note !== null) {
      output = output.write(32/*' '*/).write(start._note);
    }
    OutputStyle.reset(output);
    output = output.writeln();
  }

  private static displayEndLine(input: Input, end: Mark,
                                severity: Severity, line: number,
                                lineDigits: number, output: Output): void {
    Diagnostic.displayLineLeadNumber(line, lineDigits, output);
    output = output.write(32/*' '*/);
    Diagnostic.formatSeverity(severity, output);
    output = output.write(124/*'|'*/);
    OutputStyle.reset(output);
    output = output.write(32/*' '*/);
    Diagnostic.displayLineText(input, line, output);

    Diagnostic.displayLineLead(lineDigits, output);
    output = output.write(32/*' '*/);
    Diagnostic.formatSeverity(severity, output);
    output = output.write(124/*'|'*/).write(95/*'_'*/);
    let i = 1;
    while (i < end._column) {
      output = output.write(95/*'_'*/);
      i += 1;
    }
    output = output.write(94/*'^'*/);
    if (end._note !== null) {
      output = output.write(32/*' '*/).write(end._note);
    }
    OutputStyle.reset(output);
  }

  private static displayMidLine(input: Input, severity: Severity, line: number,
                                lineDigits: number, output: Output): void {
    Diagnostic.displayLineLeadNumber(line, lineDigits, output);
    output = output.write(32/*' '*/);
    Diagnostic.formatSeverity(severity, output);
    output = output.write(124/*'|'*/);
    OutputStyle.reset(output);
    output = output.write(32/*' '*/);
    Diagnostic.displayLineText(input, line, output);
  }

  private static displayLineComment(label: string, comment: string | null,
                                    lineDigits: number, output: Output): void {
    Diagnostic.displayLineLeadComment(lineDigits, output);
    output = output.write(32/*' '*/);
    OutputStyle.bold(output);
    output = output.write(label).write(58/*':'*/);
    OutputStyle.reset(output);
    if (comment !== null) {
      output = output.write(32/*' '*/).write(comment);
    }
  }

  private static displayLineLead(lineDigits: number, output: Output): void {
    OutputStyle.blueBold(output);
    const padding = 1 + lineDigits;
    for (let i = 0; i < padding; i += 1) {
      output = output.write(32/*' '*/);
    }
    output = output.write(124/*'|'*/);
    OutputStyle.reset(output);
  }

  private static displayLineLeadComment(lineDigits: number, output: Output): void {
    OutputStyle.blueBold(output);
    const padding = 1 + lineDigits;
    for (let i = 0; i < padding; i += 1) {
      output = output.write(32/*' '*/);
    }
    output = output.write(61/*'='*/);
    OutputStyle.reset(output);
  }

  private static displayLineLeadArrow(lineDigits: number, output: Output): void {
    for (let i = 0; i < lineDigits; i += 1) {
      output = output.write(32/*' '*/);
    }
    OutputStyle.blueBold(output);
    output = output.write(45/*'-'*/).write(45/*'-'*/).write(62/*'>'*/);
    OutputStyle.reset(output);
  }

  private static displayLineLeadEllipsis(lineDigits: number, output: Output): void {
    OutputStyle.blueBold(output);
    for (let i = 0; i < lineDigits; i += 1) {
      output = output.write(46/*'.'*/);
    }
    OutputStyle.reset(output);
    output = output.write(32/*' '*/).write(32/*' '*/);
  }

  private static displayLineLeadNumber(line: number, lineDigits: number, output: Output): void {
    const padding = lineDigits - Base10.countDigits(line);
    for (let i = 0; i < padding; i += 1) {
      output = output.write(32/*' '*/);
    }
    OutputStyle.blueBold(output);
    Format.displayNumber(line, output);
    output = output.write(32/*' '*/).write(124/*'|'*/);
    OutputStyle.reset(output);
  }

  private static displayLineText(input: Input, line: number, output: Output): void {
    while (input.isCont() && input.line() === line) {
      output = output.write(input.head());
      input = input.step();
    }
    if (input.line() === line) {
      output = output.writeln();
    }
  }

  private static consumeLineText(input: Input, line: number): void {
    while (input.isCont() && input.line() === line) {
      input = input.step();
    }
  }

  private static formatSeverity(severity: Severity, output: Output): void {
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
