// Copyright 2015-2021 Swim.inc
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

import type * as ts from "typescript";
import * as eslint from "eslint";
import {Dictionary, Severity} from "@swim/util";
import {Tag, Mark, Span, OutputSettings, Diagnostic, Unicode} from "@swim/codec";
import type {MemberFastenerClass} from "@swim/component";
import {FileRef} from "@swim/sys";
import {TaskStatus} from "../task/Task";
import {LibraryTask} from "./LibraryTask";
import {CompileTask} from "./CompileTask";

/** @public */
export class LintTask extends LibraryTask {
  constructor() {
    super();
    this.results = [];
    this.warningCount = 0;
    this.fixableWarningCount = 0;
    this.errorCount = 0;
    this.fixableErrorCount = 0;
    this.fatalErrorCount = 0;
  }

  override get name(): string {
    return "lint";
  }

  readonly results: eslint.ESLint.LintResult[];

  warningCount: number;
  fixableWarningCount: number;
  errorCount: number;
  fixableErrorCount: number;
  fatalErrorCount: number;

  @FileRef<LintTask, eslint.ESLint.Options | null>({
    fileName: ".eslintrc",
    resolves: true,
    value: null,
    getBaseDir(): string | undefined {
      return this.owner.baseDir.value;
    },
  })
  readonly eslintrc!: FileRef<this, eslint.ESLint.Options | null>;
  static readonly eslintrc: MemberFastenerClass<LintTask, "eslintrc">;

  override async exec(): Promise<TaskStatus> {
    let status = TaskStatus.Pending;
    const compileTask = this.getPeerTask(CompileTask);
    if (compileTask !== null && compileTask.emitCount !== 0) {
      this.logBegin("linting");
      const t0 = Date.now();
      status = await this.lint(compileTask.emittedSourceFiles);
      const dt = Date.now() - t0;
      if (status === TaskStatus.Success) {
        this.logSuccess("linted", dt);
      } else {
        this.logFailure("failed to lint");
      }
    }
    return status;
  }

  protected async lint(sourceFiles: Dictionary<ts.SourceFile>): Promise<TaskStatus> {
    this.results.length = 0;
    this.warningCount = 0;
    this.fixableWarningCount = 0;
    this.errorCount = 0;
    this.fixableErrorCount = 0;
    this.fatalErrorCount = 0;
    const linter = new eslint.ESLint({useEslintrc: true});
    for (const fileName in sourceFiles) {
      const sourceFile = sourceFiles[fileName]!;
      try {
        const results = await linter.lintText(sourceFile.text, {filePath: sourceFile.fileName});
        for (let i = 0; i < results.length; i += 1) {
          this.onLintResult(results[i]!);
        }
      } catch (error) {
        console.log(sourceFile.fileName);
        throw error;
      }
    }
    if (this.fatalErrorCount === 0) {
      return TaskStatus.Success;
    } else {
      return TaskStatus.Failure;
    }
  }

  protected onLintResult(result: eslint.ESLint.LintResult): void {
    this.results.push(result);
    this.warningCount += result.warningCount;
    this.fixableWarningCount += result.fixableWarningCount;
    this.errorCount += result.errorCount;
    this.fixableErrorCount += result.fixableErrorCount;
    this.fatalErrorCount += result.fatalErrorCount;
    this.logResult(result);
  }

  protected diagnose(result: eslint.ESLint.LintResult, lint: eslint.Linter.LintMessage): Diagnostic {
    let tag: Tag;
    const startLine = lint.line;
    const startColumn = lint.column;
    const endLine = lint.endLine !== void 0 ? lint.endLine : startLine;
    const endColumn = lint.endColumn !== void 0 ? lint.endColumn : startColumn;
    if (startLine === endLine && startColumn === endColumn) {
      tag = Mark.at(0, startLine, startColumn, lint.message);
    } else {
      const start = Mark.at(0, startLine, startColumn);
      const end = Mark.at(0, endLine, endColumn, lint.message);
      tag = Span.from(start, end);
    }
    let severity: Severity;
    switch (lint.severity) {
      case 2: severity = Severity.error(); break;
      case 1: severity = Severity.warning(); break;
      case 0:
      default: severity = Severity.info();
    }

    let cause: Diagnostic | null = null;
    if (lint.suggestions !== void 0) {
      for (let i = lint.suggestions.length - 1; i >= 0; i -= 1) {
        cause = this.suggest(result, lint.suggestions[i]!, cause);
      }
    }
    if (lint.fix !== void 0) {
      cause = this.suggestFix(result, lint.fix, cause);
    }

    const input = Unicode.stringInput(result.source!).withId(result.filePath);
    const message = lint.ruleId !== null ? "lint rule " + lint.ruleId : void 0;
    return new Diagnostic(input, tag, severity, message, void 0, cause);
  }

  protected suggest(result: eslint.ESLint.LintResult, suggestion: eslint.Linter.LintSuggestion, cause: Diagnostic | null): Diagnostic {
    let tag: Tag;
    const [startOffset, endOffset] = suggestion.fix.range;
    if (startOffset === endOffset) {
      tag = LintTask.markAtOffset(result.source!, startOffset, suggestion.desc);
    } else {
      tag = LintTask.spanAtOffsets(result.source!, startOffset, endOffset, suggestion.desc);
    }

    const input = Unicode.stringInput(result.source!).withId(result.filePath);
    return new Diagnostic(input, tag, Severity.debug(), "suggestion", void 0, cause);
  }

  protected suggestFix(result: eslint.ESLint.LintResult, fix: eslint.Rule.Fix, cause: Diagnostic | null): Diagnostic {
    const note = "Replace with `" + fix.text + "`";
    let tag: Tag;
    const [startOffset, endOffset] = fix.range;
    if (startOffset === endOffset) {
      tag = LintTask.markAtOffset(result.source!, startOffset, note);
    } else {
      tag = LintTask.spanAtOffsets(result.source!, startOffset, endOffset, note);
    }

    const input = Unicode.stringInput(result.source!).withId(result.filePath);
    return new Diagnostic(input, tag, Severity.debug(), "fix", void 0, cause);
  }

  private static markAtOffset(source: string, offset: number, note?: string): Mark {
    let input = Unicode.stringInput(source);
    for (let i = 0; i < offset; i += 1) {
      input = input.step();
    }
    return input.mark.withNote(note);
  }

  private static spanAtOffsets(source: string, startOffset: number, endOffset: number, note?: string): Span {
    let input = Unicode.stringInput(source);
    let i = 0;
    for (; i < startOffset; i += 1) {
      input = input.step();
    }
    const start = input.mark;
    for (; i < endOffset; i += 1) {
      input = input.step();
    }
    const end = input.mark.withNote(note);
    return Span.from(start, end);
  }

  protected logMessage(result: eslint.ESLint.LintResult, message: eslint.Linter.LintMessage): void {
    console.log(this.diagnose(result, message).toString(OutputSettings.styled()));
  }

  protected logResult(result: eslint.ESLint.LintResult): void {
    const messages = result.messages;
    for (let i = 0; i < messages.length; i += 1) {
      this.logMessage(result, messages[i]!);
    }
  }
}
