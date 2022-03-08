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
 * @public
 */
export class Diagnostic implements Display {
  constructor(input: Input, tag: Tag, severity: Severity, message: string | undefined,
              note: string | undefined, cause: Diagnostic | null) {
    this.input = input;
    this.tag = tag;
    this.severity = severity;
    this.message = message;
    this.note = note;
    this.cause = cause;
  }

  /** @internal */
  readonly input: Input;

  /**
   * The location in the `input` to which this diagnostic is attached.
   */
  readonly tag: Tag;

  /**
   * The level of importance of this diagnostic.
   */
  readonly severity: Severity;

  /**
   * The help message that describes this diagnostic.
   */
  readonly message: string | undefined;

  /**
   * An informative comment on the source context to which this diagnostic is attached.
   */
  readonly note: string | undefined;

  /**
   * The `Diagnostic` cause of this diagnostic, forming a linked chain of
   * diagnostics, or `null` if this diagnostic has no cause.
   */
  readonly cause: Diagnostic | null;

  private lineDigits(): number {
    let digits = Base10.countDigits(this.tag.end.line);
    if (this.cause !== null) {
      digits = Math.max(digits, this.cause.lineDigits());
    }
    return digits;
  }

  display<T>(output: Output<T>): Output<T> {
    const input = this.input.clone();
    const start = this.tag.start;
    const end = this.tag.end;
    const severity = this.severity;
    const message = this.message;
    const note = this.note;
    const cause = this.cause;
    const contextLines = 2;
    const lineDigits = this.lineDigits();
    output = Diagnostic.display(output, input, start, end, severity, message,
                                note, cause, contextLines, lineDigits);
    return output;
  }


  private static display<T>(output: Output<T>, input: Input, start: Mark, end: Mark,
                            severity: Severity, message: string | undefined,
                            note: string | undefined, cause: Diagnostic | null,
                            contextLines: number, lineDigits: number): Output<T> {
    do {
      if (message !== void 0) {
        output = Diagnostic.displayMessage(output, severity, message);
        output = output.writeln();
      }
      output = Diagnostic.displayAnchor(output, input, start, lineDigits);
      output = output.writeln();
      const cont = Diagnostic.displayContext(output, input, start, end, severity,
                                             note, cause, contextLines, lineDigits);
      const next = cont[0];
      output = cont[1];
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
    return output;
  }

  /** @internal */
  static displayMessage<T>(output: Output<T>, severity: Severity, message: string | undefined): Output<T> {
    output = Diagnostic.formatSeverity(output, severity);
    output = output.write(severity.label);
    output = OutputStyle.reset(output);
    output = OutputStyle.bold(output);
    output = output.write(58/*':'*/);
    if (message !== void 0) {
      output = output.write(32/*' '*/).write(message);
    }
    output = OutputStyle.reset(output);
    return output;
  }

  private static displayAnchor<T>(output: Output<T>, input: Input,
                                  start: Mark, lineDigits: number): Output<T> {
    output = Diagnostic.displayLineLeadArrow(output, lineDigits);
    output = output.write(32/*' '*/);
    const id = input.id;
    if (id !== void 0) {
      output = Format.displayAny(output, id);
    }
    output = output.write(58/*':'*/);
    output = Format.displayNumber(output, start.line);
    output = output.write(58/*':'*/);
    output = Format.displayNumber(output, start.column);
    output = output.writeln();

    output = Diagnostic.displayLineLead(output, lineDigits);
    return output;
  }

  private static displayContext<T>(output: Output<T>, input: Input, start: Mark, end: Mark,
                                   severity: Severity, note: string | undefined,
                                   cause: Diagnostic | null, contextLines: number,
                                   lineDigits: number): [Diagnostic | null, Output<T>] {
    let next = cause;
    const sameCause = cause !== null && cause.message === void 0 && Values.equal(input.id, cause.input.id);
    const causeOrder = sameCause ? (start.offset <= cause!.tag.start.offset ? -1 : 1) : 0;
    if (causeOrder === 1) {
      const cont = Diagnostic.displayContext(output, cause!.input.clone(), cause!.tag.start,
                                             cause!.tag.end, cause!.severity, cause!.note,
                                             cause!.cause, contextLines, lineDigits);
      next = cont[0];
      output = cont[1];
      output = output.writeln();
      output = Diagnostic.displayLineLeadEllipsis(output, lineDigits);
      output = output.writeln();
    }
    output = Diagnostic.displayLines(output, input, start, end, severity, contextLines, lineDigits);
    if (note !== void 0) {
      output = Diagnostic.displayNote(output, note, lineDigits);
    }
    if (causeOrder === -1) {
      output = output.writeln();
      output = Diagnostic.displayLineLeadEllipsis(output, lineDigits);
      output = output.writeln();
      const cont = Diagnostic.displayContext(output, cause!.input.clone(), cause!.tag.start,
                                             cause!.tag.end, cause!.severity, cause!.note,
                                             cause!.cause, contextLines, lineDigits);
      next = cont[0];
      output = cont[1];
    }
    return [next, output];
  }

  private static displayLines<T>(output: Output<T>, input: Input, start: Mark, end: Mark,
                                 severity: Severity, contextLines: number,
                                 lineDigits: number): Output<T> {
    const startLine = start.line;
    const endLine = end.line;
    let line = input.line;

    while (line < startLine) {
      Diagnostic.consumeLineText(input, line);
      line += 1;
    }

    if (endLine - startLine > 2 * contextLines + 2) {
      while (line <= startLine + contextLines) {
        output = Diagnostic.displayLine(output, input, start, end, severity, line, lineDigits);
        line += 1;
      }
      output = Diagnostic.displayLineLeadEllipsis(output, lineDigits);
      output = output.write(32/*' '*/);
      output = Diagnostic.formatSeverity(output, severity);
      output = output.write(124/*'|'*/);
      output = OutputStyle.reset(output);
      output = output.writeln();
      while (line < endLine - contextLines) {
        Diagnostic.consumeLineText(input, line);
        line += 1;
      }
    }

    while (line <= endLine) {
      output = Diagnostic.displayLine(output, input, start, end, severity, line, lineDigits);
      line += 1;
    }
    return output;
  }

  private static displayNote<T>(output: Output<T>, note: string | undefined, lineDigits: number): Output<T> {
    output = output.writeln();
    output = Diagnostic.displayLineLead(output, lineDigits);
    output = output.writeln();
    output = Diagnostic.displayLineComment(output, 'note', note, lineDigits);
    return output;
  }

  private static displayLine<T>(output: Output<T>, input: Input, start: Mark, end: Mark,
                                severity: Severity, line: number, lineDigits: number): Output<T> {
    if (start.line === line && end.line === line) {
      output = Diagnostic.displaySingleLine(output, input, start, end, severity, line, lineDigits);
    } else if (start.line === line) {
      output = Diagnostic.displayStartLine(output, input, start, severity, line, lineDigits);
    } else if (end.line === line) {
      output = Diagnostic.displayEndLine(output, input, end, severity, line, lineDigits);
    } else {
      output = Diagnostic.displayMidLine(output, input, severity, line, lineDigits);
    }
    return output;
  }

  private static displaySingleLine<T>(output: Output<T>, input: Input, start: Mark, end: Mark,
                                      severity: Severity, line: number, lineDigits: number): Output<T> {
    output = Diagnostic.displayLineLeadNumber(output, line, lineDigits);
    output = output.write(32/*' '*/);
    for (let i = 1; i < input.column; i += 1) {
      output = output.write(32/*' '*/);
    }
    output = Diagnostic.displayLineText(output, input, line);

    output = Diagnostic.displayLineLead(output, lineDigits);
    output = output.write(32/*' '*/);
    let i = 1;
    while (i < start.column) {
      output = output.write(32/*' '*/);
      i += 1;
    }
    output = Diagnostic.formatSeverity(output, severity);
    while (i <= end.column) {
      output = output.write(94/*'^'*/);
      i += 1;
    }
    if (end.note !== void 0) {
      output = output.write(32/*' '*/).write(end.note);
    }
    output = OutputStyle.reset(output);
    return output;
  }

  private static displayStartLine<T>(output: Output<T>, input: Input, start: Mark,
                                     severity: Severity, line: number, lineDigits: number): Output<T> {
    output = Diagnostic.displayLineLeadNumber(output, line, lineDigits);
    output = output.write(32/*' '*/).write(32/*' '*/).write(32/*' '*/);
    for (let i = 1; i < input.column; i += 1) {
      output = output.write(32/*' '*/);
    }
    output = Diagnostic.displayLineText(output, input, line);

    output = Diagnostic.displayLineLead(output, lineDigits);
    output = output.write(32/*' '*/).write(32/*' '*/);
    output = Diagnostic.formatSeverity(output, severity);
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
    output = OutputStyle.reset(output);
    output = output.writeln();
    return output;
  }

  private static displayEndLine<T>(output: Output<T>, input: Input, end: Mark,
                                   severity: Severity, line: number, lineDigits: number): Output<T> {
    output = Diagnostic.displayLineLeadNumber(output, line, lineDigits);
    output = output.write(32/*' '*/);
    output = Diagnostic.formatSeverity(output, severity);
    output = output.write(124/*'|'*/);
    output = OutputStyle.reset(output);
    output = output.write(32/*' '*/);
    output = Diagnostic.displayLineText(output, input, line);

    output = Diagnostic.displayLineLead(output, lineDigits);
    output = output.write(32/*' '*/);
    output = Diagnostic.formatSeverity(output, severity);
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
    output = OutputStyle.reset(output);
    return output;
  }

  private static displayMidLine<T>(output: Output<T>, input: Input, severity: Severity,
                                   line: number, lineDigits: number): Output<T> {
    output = Diagnostic.displayLineLeadNumber(output, line, lineDigits);
    output = output.write(32/*' '*/);
    output = Diagnostic.formatSeverity(output, severity);
    output = output.write(124/*'|'*/);
    output = OutputStyle.reset(output);
    output = output.write(32/*' '*/);
    output = Diagnostic.displayLineText(output, input, line);
    return output;
  }

  private static displayLineComment<T>(output: Output<T>, label: string,
                                       comment: string | undefined, lineDigits: number): Output<T> {
    output = Diagnostic.displayLineLeadComment(output, lineDigits);
    output = output.write(32/*' '*/);
    output = OutputStyle.bold(output);
    output = output.write(label).write(58/*':'*/);
    output = OutputStyle.reset(output);
    if (comment !== void 0) {
      output = output.write(32/*' '*/).write(comment);
    }
    return output;
  }

  private static displayLineLead<T>(output: Output<T>, lineDigits: number): Output<T> {
    output = OutputStyle.blueBold(output);
    const padding = 1 + lineDigits;
    for (let i = 0; i < padding; i += 1) {
      output = output.write(32/*' '*/);
    }
    output = output.write(124/*'|'*/);
    output = OutputStyle.reset(output);
    return output;
  }

  private static displayLineLeadComment<T>(output: Output<T>, lineDigits: number): Output<T> {
    output = OutputStyle.blueBold(output);
    const padding = 1 + lineDigits;
    for (let i = 0; i < padding; i += 1) {
      output = output.write(32/*' '*/);
    }
    output = output.write(61/*'='*/);
    output = OutputStyle.reset(output);
    return output;
  }

  private static displayLineLeadArrow<T>(output: Output<T>, lineDigits: number): Output<T> {
    for (let i = 0; i < lineDigits; i += 1) {
      output = output.write(32/*' '*/);
    }
    output = OutputStyle.blueBold(output);
    output = output.write(45/*'-'*/).write(45/*'-'*/).write(62/*'>'*/);
    output = OutputStyle.reset(output);
    return output;
  }

  private static displayLineLeadEllipsis<T>(output: Output<T>, lineDigits: number): Output<T> {
    output = OutputStyle.blueBold(output);
    for (let i = 0; i < lineDigits; i += 1) {
      output = output.write(46/*'.'*/);
    }
    output = OutputStyle.reset(output);
    output = output.write(32/*' '*/).write(32/*' '*/);
    return output;
  }

  private static displayLineLeadNumber<T>(output: Output<T>, line: number, lineDigits: number): Output<T> {
    const padding = lineDigits - Base10.countDigits(line);
    for (let i = 0; i < padding; i += 1) {
      output = output.write(32/*' '*/);
    }
    output = OutputStyle.blueBold(output);
    output = Format.displayNumber(output, line);
    output = output.write(32/*' '*/).write(124/*'|'*/);
    output = OutputStyle.reset(output);
    return output;
  }

  private static displayLineText<T>(output: Output<T>, input: Input, line: number): Output<T> {
    while (input.isCont() && input.line === line) {
      output = output.write(input.head());
      input = input.step();
    }
    if (input.line === line) {
      output = output.writeln();
    }
    return output;
  }

  private static consumeLineText(input: Input, line: number): void {
    while (input.isCont() && input.line === line) {
      input = input.step();
    }
  }

  private static formatSeverity<T>(output: Output<T>, severity: Severity): Output<T> {
    switch (severity.level) {
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
      let output = Unicode.stringOutput().write("unexpected").write(32/*' '*/);
      output = Format.debugChar(output, input.head());
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
      output = Format.debugChar(output, expected);
    } else {
      output = output.write(expected);
    }
    output = output.write(44/*','*/).write(32/*' '*/).write("but found").write(32/*' '*/);
    if (input.isCont()) {
      output = Format.debugChar(output, input.head());
    } else {
      output = output.write("end of input");
    }
    const message = output.bind();
    const mark = input.mark;
    const source = input.clone();
    source.seek();
    return new Diagnostic(source, mark, severity as Severity, message, note as string | undefined, cause);
  }
}
