// Copyright 2015-2021 Swim inc.
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

import {Values, Severity} from "@swim/util";
import type {Tag} from "./Tag";
import type {Mark} from "./Mark";
import type {Input} from "../input/Input";
import type {OutputSettings} from "../output/OutputSettings";
import type {Output} from "../output/Output";
import type {Display} from "../format/Display";
import {OutputStyle} from "../format/OutputStyle";
import {Format} from "../format/Format";
import {Unicode} from "../unicode/Unicode";
import {Base10} from "../number/Base10";

/**
 * Informational message attached to an input location.
 */
export class Diagnostic implements Display {
  constructor(input: Input, tag: Tag, severity: Severity, message: string | undefined,
              note: string | undefined, cause: Diagnostic | null) {
    Object.defineProperty(this, "input", {
      value: input,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "tag", {
      value: tag,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "severity", {
      value: severity,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "message", {
      value: message,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "note", {
      value: note,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "cause", {
      value: cause,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  readonly input!: Input;

  /**
   * The location in the `input` to which this diagnostic is attached.
   */
  readonly tag!: Tag;

  /**
   * The level of importance of this diagnostic.
   */
  readonly severity!: Severity;

  /**
   * The help message that describes this diagnostic.
   */
  readonly message!: string | undefined;

  /**
   * An informative comment on the source context to which this diagnostic is attached.
   */
  readonly note!: string | undefined;

  /**
   * The `Diagnostic` cause of this diagnostic, forming a linked chain of
   * diagnostics, or `null` if this diagnostic has no cause.
   */
  readonly cause!: Diagnostic | null;

  private lineDigits(): number {
    let digits = Base10.countDigits(this.tag.end.line);
    if (this.cause !== null) {
      digits = Math.max(digits, this.cause.lineDigits());
    }
    return digits;
  }

  display(output: Output): void {
    const input = this.input.clone();
    const start = this.tag.start;
    const end = this.tag.end;
    const severity = this.severity;
    const message = this.message;
    const note = this.note;
    const cause = this.cause;
    const contextLines = 2;
    const lineDigits = this.lineDigits();
    Diagnostic.displayDiagnostic(input, start, end, severity, message, note,
                                 cause, contextLines, lineDigits, output);
  }

  toString(settings?: OutputSettings): string {
    return Format.display(this, settings);
  }

  static create(input: Input, tag: Tag, severity: Severity, cause?: Diagnostic | null): Diagnostic;
  static create(input: Input, tag: Tag, severity: Severity, message: string | undefined,
                cause?: Diagnostic | null): Diagnostic;
  static create(input: Input, tag: Tag, severity: Severity, message: string | undefined,
                note: string | undefined, cause?: Diagnostic | null): Diagnostic;
  static create(input: Input, tag: Tag, severity: Severity, message?: Diagnostic | null | string | undefined,
                note?: Diagnostic | null | string | undefined, cause?: Diagnostic | null): Diagnostic {
    if (arguments.length === 3) { // (input, tag, severity)
      cause = null;
      note = void 0;
      message = void 0;
    } else if (arguments.length === 4) {
      if (message === null || message instanceof Diagnostic) { // (input, tag, severity, cause)
        cause = message;
        message = void 0;
      } else { // (input, tag, severity, message)
        cause = null;
      }
    } else if (arguments.length === 5) {
      if (note === null || note instanceof Diagnostic) { // (input, tag, severity, message, cause)
        cause = note;
        note = void 0;
      } else { // (input, tag, severity, message, note)
        cause = null;
      }
    } else { // (input, tag, severity, message, note, cause)
      if (cause === void 0) {
        cause = null;
      }
    }
    return new Diagnostic(input.clone(), tag, severity, message as string | undefined, note as string | undefined, cause);
  }

  static message(message: string, input: Input, cause?: Diagnostic | null): Diagnostic;
  static message(message: string, input: Input, note: string, cause?: Diagnostic | null): Diagnostic;
  static message(message: string, input: Input, severity: Severity, cause?: Diagnostic | null): Diagnostic;
  static message(message: string, input: Input, severity?: Severity, note?: string, cause?: Diagnostic | null): Diagnostic;
  static message(message: string, input: Input, severity?: Diagnostic | null | Severity | string | undefined,
                 note?: Diagnostic | null | string | undefined, cause?: Diagnostic | null): Diagnostic {
    if (arguments.length === 2) { // (message, input)
      cause = null;
      note = void 0;
      severity = Severity.error();
    } else if (arguments.length === 3) {
      if (severity === null || severity instanceof Diagnostic) { // (message, input, cause)
        cause = severity;
        severity = Severity.error();
      } else if (typeof severity === "string") { // (message, input, note)
        cause = null;
        note = severity;
        severity = Severity.error();
      } else { // (message, input, severity)
        cause = null;
      }
    } else if (arguments.length === 4) {
      if (typeof severity === "string") { // (message, input, note, cause)
        cause = note as Diagnostic | null;
        note = severity;
        severity = Severity.error();
      } else if (note === null || note instanceof Diagnostic) { // (message, input, severity, cause)
        cause = note;
        note = void 0;
      } else { // (message, input, severity, note)
        cause = null;
      }
    } else { // (message, input, severity, note, cause)
      if (cause === void 0) {
        cause = null;
      }
    }

    const mark = input.mark;
    const source = input.clone();
    source.seek();
    return new Diagnostic(source, mark, severity as Severity, message, note as string | undefined, cause);
  }

  static unexpected(input: Input, cause?: Diagnostic | null): Diagnostic;
  static unexpected(input: Input, note: string, cause?: Diagnostic | null): Diagnostic;
  static unexpected(input: Input, severity: Severity, cause?: Diagnostic | null): Diagnostic;
  static unexpected(input: Input, severity?: Severity, note?: string, cause?: Diagnostic | null): Diagnostic;
  static unexpected(input: Input, severity?: Diagnostic | null | Severity | string | undefined,
                    note?: Diagnostic | null | string | undefined, cause?: Diagnostic | null): Diagnostic {
    if (arguments.length === 1) { // (input)
      cause = null;
      severity = Severity.error();
    } else if (arguments.length === 2) {
      if (severity === null || severity instanceof Diagnostic) { // (input, cause)
        cause = severity;
        severity = Severity.error();
      } else if (typeof severity === "string") { // (input, note)
        cause = null;
        note = severity;
        severity = Severity.error();
      } else { // (input, severity)
        cause = null;
      }
    } else if (arguments.length === 3) {
      if (typeof severity === "string") { // (input, note, cause)
        cause = note as Diagnostic | null;
        note = severity;
        severity = Severity.error();
      } else if (note === null || note instanceof Diagnostic) { // (input, severity, cause)
        cause = note;
        note = void 0;
      } else { // (input, severity, note)
        cause = null;
      }
    } else { // (input, severity, note, cause)
      if (cause === void 0) {
        cause = null;
      }
    }

    let message;
    if (input.isCont()) {
      const output = Unicode.stringOutput().write("unexpected").write(32/*' '*/);
      Format.debugChar(input.head(), output);
      message = output.bind();
    } else {
      message = "unexpected end of input";
    }
    const mark = input.mark;
    const source = input.clone();
    source.seek();
    return new Diagnostic(source, mark, severity as Severity, message, note as string | undefined, cause);
  }

  static expected(expected: string | number, input: Input, cause?: Diagnostic | null): Diagnostic;
  static expected(expected: string | number, input: Input, note: string, cause?: Diagnostic | null): Diagnostic;
  static expected(expected: string | number, input: Input, severity: Severity, cause?: Diagnostic | null): Diagnostic;
  static expected(expected: string | number, input: Input, severity?: Severity, note?: string, cause?: Diagnostic | null): Diagnostic;
  static expected(expected: string | number, input: Input, severity?: Diagnostic | null | Severity | string | undefined,
                  note?: Diagnostic | null | string | undefined, cause?: Diagnostic | null): Diagnostic {
    if (arguments.length === 2) { // (excpected, input)
      cause = null;
      severity = Severity.error();
    } else if (arguments.length === 3) {
      if (severity === null || severity instanceof Diagnostic) { // (excpected, input, cause)
        cause = severity;
        severity = Severity.error();
      } else if (typeof severity === "string") { // (excpected, input, note)
        cause = null;
        note = severity;
        severity = Severity.error();
      } else { // (expected, input, severity)
        cause = null;
      }
    } else if (arguments.length === 4) {
      if (typeof severity === "string") { // (excpected, input, note, cause)
        cause = note as Diagnostic | null;
        note = severity;
        severity = Severity.error();
      } else if (note === null || note instanceof Diagnostic) { // (excpected, input, severity, cause)
        cause = note;
        note = void 0;
      } else { // (excpected, input, severity, note)
        cause = null;
      }
    } else { // (excpected, input, severity, note, cause)
      if (cause === void 0) {
        cause = null;
      }
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
    const mark = input.mark;
    const source = input.clone();
    source.seek();
    return new Diagnostic(source, mark, severity as Severity, message, note as string | undefined, cause);
  }

  private static displayDiagnostic(input: Input, start: Mark, end: Mark,
                                   severity: Severity, message: string | undefined,
                                   note: string | undefined, cause: Diagnostic | null,
                                   contextLines: number, lineDigits: number,
                                   output: Output): void {
    do {
      if (message !== void 0) {
        Diagnostic.displayMessage(severity, message, output);
        output = output.writeln();
      }
      Diagnostic.displayAnchor(input, start, lineDigits, output);
      output = output.writeln();
      const next = Diagnostic.displayContext(input, start, end, severity, note,
                                             cause, contextLines, lineDigits, output);
      if (next !== null) {
        output = output.writeln();
        input = next.input.clone();
        start = next.tag.start;
        end = next.tag.end;
        severity = next.severity;
        message = next.message;
        note = next.note;
        cause = next.cause;
      } else {
        break;
      }
    } while (true);
  }

  /** @hidden */
  static displayMessage(severity: Severity, message: string | undefined, output: Output): void {
    Diagnostic.formatSeverity(severity, output);
    output = output.write(severity.label);
    OutputStyle.reset(output);
    OutputStyle.bold(output);
    output = output.write(58/*':'*/);
    if (message !== void 0) {
      output = output.write(32/*' '*/).write(message);
    }
    OutputStyle.reset(output);
  }

  private static displayAnchor(input: Input, start: Mark, lineDigits: number,
                               output: Output): void {
    Diagnostic.displayLineLeadArrow(lineDigits, output);
    output = output.write(32/*' '*/);
    const id = input.id;
    if (id !== void 0) {
      Format.display(id, output);
    }
    output = output.write(58/*':'*/);
    Format.displayNumber(start.line, output);
    output = output.write(58/*':'*/);
    Format.displayNumber(start.column, output);
    output = output.writeln();

    Diagnostic.displayLineLead(lineDigits, output);
  }

  private static displayCause(cause: Diagnostic, contextLines: number,
                              lineDigits: number, output: Output): Diagnostic | null {
    const input = cause.input.clone();
    const start = cause.tag.start;
    const end = cause.tag.end;
    const severity = cause.severity;
    const note = cause.note;
    const next = cause.cause;
    return Diagnostic.displayContext(input, start, end, severity, note, next,
                                     contextLines, lineDigits, output);
  }

  private static displayContext(input: Input, start: Mark, end: Mark,
                                severity: Severity, note: string | undefined,
                                cause: Diagnostic | null, contextLines: number,
                                lineDigits: number, output: Output): Diagnostic | null {
    let next = cause;
    const sameCause = cause !== null && cause.message === void 0
                   && Values.equal(input.id, cause.input.id);
    const causeOrder = sameCause ? (start.offset <= cause!.tag.start.offset ? -1 : 1) : 0;
    if (causeOrder === 1) {
      next = Diagnostic.displayCause(cause!, contextLines, lineDigits, output);
      output = output.writeln();
      Diagnostic.displayLineLeadEllipsis(lineDigits, output);
      output = output.writeln();
    }
    Diagnostic.displayLines(input, start, end, severity, contextLines, lineDigits, output);
    if (note !== void 0) {
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
    const startLine = start.line;
    const endLine = end.line;
    let line = input.line;

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

  private static displayNote(note: string | undefined, lineDigits: number, output: Output): void {
    output = output.writeln();
    Diagnostic.displayLineLead(lineDigits, output);
    output = output.writeln();
    Diagnostic.displayLineComment('note', note, lineDigits, output);
  }

  private static displayLine(input: Input, start: Mark, end: Mark,
                             severity: Severity, line: number,
                             lineDigits: number, output: Output): void {
    if (start.line === line && end.line === line) {
      Diagnostic.displaySingleLine(input, start, end, severity, line, lineDigits, output);
    } else if (start.line === line) {
      Diagnostic.displayStartLine(input, start, severity, line, lineDigits, output);
    } else if (end.line === line) {
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
    for (let i = 1; i < input.column; i += 1) {
      output = output.write(32/*' '*/);
    }
    Diagnostic.displayLineText(input, line, output);

    Diagnostic.displayLineLead(lineDigits, output);
    output = output.write(32/*' '*/);
    let i = 1;
    while (i < start.column) {
      output = output.write(32/*' '*/);
      i += 1;
    }
    Diagnostic.formatSeverity(severity, output);
    while (i <= end.column) {
      output = output.write(94/*'^'*/);
      i += 1;
    }
    if (end.note !== void 0) {
      output = output.write(32/*' '*/).write(end.note);
    }
    OutputStyle.reset(output);
  }

  private static displayStartLine(input: Input, start: Mark,
                                  severity: Severity, line: number,
                                  lineDigits: number, output: Output): void {
    Diagnostic.displayLineLeadNumber(line, lineDigits, output);
    output = output.write(32/*' '*/).write(32/*' '*/).write(32/*' '*/);
    for (let i = 1; i < input.column; i += 1) {
      output = output.write(32/*' '*/);
    }
    Diagnostic.displayLineText(input, line, output);

    Diagnostic.displayLineLead(lineDigits, output);
    output = output.write(32/*' '*/).write(32/*' '*/);
    Diagnostic.formatSeverity(severity, output);
    output = output.write(95/*'_'*/);
    let i = 1;
    while (i < start.column) {
      output = output.write(95/*'_'*/);
      i += 1;
    }
    output = output.write(94/*'^'*/);
    if (start.note !== void 0) {
      output = output.write(32/*' '*/).write(start.note);
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
    while (i < end.column) {
      output = output.write(95/*'_'*/);
      i += 1;
    }
    output = output.write(94/*'^'*/);
    if (end.note !== void 0) {
      output = output.write(32/*' '*/).write(end.note);
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

  private static displayLineComment(label: string, comment: string | undefined,
                                    lineDigits: number, output: Output): void {
    Diagnostic.displayLineLeadComment(lineDigits, output);
    output = output.write(32/*' '*/);
    OutputStyle.bold(output);
    output = output.write(label).write(58/*':'*/);
    OutputStyle.reset(output);
    if (comment !== void 0) {
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
    while (input.isCont() && input.line === line) {
      output = output.write(input.head());
      input = input.step();
    }
    if (input.line === line) {
      output = output.writeln();
    }
  }

  private static consumeLineText(input: Input, line: number): void {
    while (input.isCont() && input.line === line) {
      input = input.step();
    }
  }

  private static formatSeverity(severity: Severity, output: Output): void {
    switch (severity.level) {
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
