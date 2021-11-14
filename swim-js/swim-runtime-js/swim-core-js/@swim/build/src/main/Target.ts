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

import * as ChildProcess from "child_process";
import * as FS from "fs";
import * as Path from "path";
import * as ts from "typescript";
import {ESLint, Linter, Rule} from "eslint";
import * as rollup from "rollup";
import * as apiExtractor from "@microsoft/api-extractor";
import * as typedoc from "typedoc";
import * as terser from "terser";
import {Severity} from "@swim/util";
import {Tag, Mark, Span, OutputSettings, OutputStyle, Diagnostic, Unicode} from "@swim/codec";
import type {Project} from "./Project";

/** @internal */
export interface TargetConfig {
  id: string;
  path?: string;
  deps?: string[];
  peerDeps?: string[];
  compilerOptions?: ts.CompilerOptions;
  preamble?: string;
}

/** @internal */
export class Target {
  readonly project: Project;

  readonly id: string;
  readonly uid: string;
  readonly path: string;
  readonly baseDir: string;

  readonly deps: Target[];
  readonly peerDeps: Target[];

  preamble: string | undefined;

  readonly compilerOptions: ts.CompilerOptions;
  readonly emittedSourceFiles: ts.SourceFile[];
  program: ts.Program | null;
  linter: ESLint | null;

  selected: boolean;
  watching: boolean;
  failed: boolean;
  retest: boolean;
  redoc: boolean;
  reapi: boolean;

  compileStart: number;
  bundleTimer: number;

  constructor(project: Project, config: TargetConfig) {
    this.project = project;

    this.id = config.id;
    this.uid = this.project.id + ":" + this.id;
    this.path = config.path !== void 0 ? config.path : this.id;
    this.baseDir = Path.resolve(this.project.baseDir, "src", this.path);

    this.deps = [];
    this.peerDeps = [];

    this.preamble = config.preamble;

    this.compilerOptions = config.compilerOptions || this.project.compilerOptions;
    this.emittedSourceFiles = [];
    this.program = null;
    this.linter = null;

    this.selected = false;
    this.watching = false;
    this.failed = false;
    this.retest = false;
    this.redoc = false;
    this.reapi = false;

    this.compileStart = 0;
    this.createProgram = this.createProgram.bind(this);
    this.onCompileUpdate = this.onCompileUpdate.bind(this);
    this.onCompileResult = this.onCompileResult.bind(this);
    this.onCompileError = this.onCompileError.bind(this);

    this.bundleTimer = 0;
    this.bundleRest = this.bundleRest.bind(this);
    this.onBundleWarning = this.onBundleWarning.bind(this);
    this.onBundleError = this.onBundleError.bind(this);
  }

  initDeps(config: TargetConfig): void {
    if (config.deps !== void 0) {
      for (let i = 0; i < config.deps.length; i += 1) {
        const dep = config.deps[i]!;
        const [projectId, targetId] = dep.split(":");
        const project = this.project.build.projects[projectId!];
        if (project !== void 0) {
          const target = project.targets[targetId || "main"];
          if (target !== void 0) {
            this.deps.push(target);
          } else {
            throw new Error(this.uid + " depends on unknown target " + targetId + " of project " + projectId);
          }
        } else {
          throw new Error(this.uid + " depends on unknown project " + projectId);
        }
      }
    }
  }

  initPeerDeps(config: TargetConfig): void {
    if (config.peerDeps !== void 0) {
      for (let i = 0; i < config.peerDeps.length; i += 1) {
        const peerDep = config.peerDeps[i]!;
        const [projectId, targetId] = peerDep.split(":");
        const project = this.project.build.projects[projectId!];
        if (project !== void 0) {
          const target = project.targets[targetId || "main"];
          if (target !== void 0) {
            this.peerDeps.push(target);
          } else {
            throw new Error(this.uid + " has peer dependency on unknown target " + targetId + " of project " + projectId);
          }
        } else {
          throw new Error(this.uid + " has peer dependency on unknown project " + projectId);
        }
      }
    }
  }

  initBundles(bundleConfigs: rollup.RollupOptions | rollup.RollupOptions[]): void {
    if (!Array.isArray(bundleConfigs)) {
      this.initBundleOutputs(bundleConfigs);
    } else {
      for (let i = 0; i < bundleConfigs.length; i += 1) {
        this.initBundleOutputs(bundleConfigs[i]!);
      }
    }
  }

  initBundleOutputs(bundleConfig: rollup.RollupOptions): void {
    if (typeof bundleConfig.input === "string") {
      bundleConfig.input = Path.resolve(this.project.baseDir, bundleConfig.input);
    }
    const bundleOutput = bundleConfig.output;
    if (bundleOutput !== void 0) {
      if (!Array.isArray(bundleOutput)) {
        this.initBundleOutput(bundleOutput);
      } else {
        for (let i = 0; i < bundleOutput.length; i += 1) {
          this.initBundleOutput(bundleOutput[i]!);
        }
      }
    }
  }

  initBundleOutput(bundleOutput: rollup.OutputOptions): void {
    if (typeof bundleOutput.file === "string") {
      bundleOutput.file = Path.resolve(this.project.baseDir, bundleOutput.file);
      if (this.preamble === void 0) {
        if (typeof bundleOutput.banner === "string") {
          this.preamble = bundleOutput.banner;
        } else {
          const bundleName = Path.basename(bundleOutput.file, Path.extname(bundleOutput.file));
          this.preamble = "// " + bundleName + "-" + this.project.package.version;
          if (typeof this.project.package.copyright === "string") {
            this.preamble += "; copyright " + this.project.package.copyright;
          }
        }
      }
      if (!bundleOutput.banner && this.project.devel) {
        bundleOutput.banner = this.preamble;
      }
    }
  }

  transitiveProjects(projects: Project[] = []): Project[] {
    for (let i = 0; i < this.peerDeps.length; i += 1) {
      projects = this.peerDeps[i]!.transitiveProjects(projects);
    }
    for (let i = 0; i < this.deps.length; i += 1) {
      projects = this.deps[i]!.transitiveProjects(projects);
    }
    if (projects.indexOf(this.project) < 0) {
      projects.push(this.project);
    }
    return projects;
  }

  transitiveTargets(targets: Target[] = []): Target[] {
    for (let i = 0; i < this.peerDeps.length; i += 1) {
      targets = this.peerDeps[i]!.transitiveTargets(targets);
    }
    for (let i = 0; i < this.deps.length; i += 1) {
      targets = this.deps[i]!.transitiveTargets(targets);
    }
    if (targets.indexOf(this) < 0) {
      targets.push(this);
    }
    return targets;
  }

  frameworkTargets(targets: Target[] = []): Target[] {
    if (this.project.framework) {
      for (let i = 0; i < this.peerDeps.length; i += 1) {
        targets = this.peerDeps[i]!.frameworkTargets(targets);
      }
      for (let i = 0; i < this.deps.length; i += 1) {
        targets = this.deps[i]!.frameworkTargets(targets);
      }
    }
    if (targets.indexOf(this) < 0) {
      targets.push(this);
    }
    return targets;
  }

  rootTargets(targets: Target[] = []): Target[] {
    if (this.project.framework) {
      for (let i = 0; i < this.peerDeps.length; i += 1) {
        targets = this.peerDeps[i]!.rootTargets(targets);
      }
    }
    if (targets.indexOf(this) < 0) {
      targets.push(this);
    }
    return targets;
  }

  protected canCompile(): boolean {
    let targets = [] as Target[];
    for (let i = 0; i < this.deps.length; i += 1) {
      targets = this.deps[i]!.transitiveTargets(targets);
    }
    for (let i = 0; i < targets.length; i += 1) {
      const target = targets[i]!;
      if (target.failed) {
        return false;
      }
    }
    return true;
  }

  compile(): Promise<unknown> {
    if (this.canCompile()) {
      let output = Unicode.stringOutput(OutputSettings.styled());
      output = OutputStyle.greenBold(output);
      output = output.write("compiling");
      output = OutputStyle.reset(output);
      output = output.write(" ");
      output = OutputStyle.yellow(output);
      output = output.write(this.uid);
      output = OutputStyle.reset(output);
      console.log(output.bind());

      const solutionBuilderHost = ts.createSolutionBuilderHost(ts.sys, this.createProgram as ts.CreateProgram<ts.EmitAndSemanticDiagnosticsBuilderProgram>,
                                                               this.onCompileError, this.onCompileUpdate);
      const solutionBuilder = ts.createSolutionBuilder(solutionBuilderHost, [this.baseDir], {incremental: true});

      this.compileStart = Date.now();
      solutionBuilder.build(this.baseDir);

      return this.lint().then((): Promise<unknown> => {
        if (!this.failed) {
          this.onCompileSuccess();
          return this.bundleRest();
        } else {
          this.onCompileFailure();
        }
        return Promise.resolve(void 0);
      });
    }
    return Promise.resolve(void 0);
  }

  watch(): void {
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.greenBold(output);
    output = output.write("watching");
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = OutputStyle.yellow(output);
    output = output.write(this.uid);
    output = OutputStyle.reset(output);
    console.log(output.bind());

    const solutionBuilderHost = ts.createSolutionBuilderWithWatchHost(ts.sys, this.createProgram as ts.CreateProgram<ts.EmitAndSemanticDiagnosticsBuilderProgram>,
                                                                      this.onCompileError, this.onCompileUpdate, this.onCompileResult);
    const solutionBuilder = ts.createSolutionBuilderWithWatch(solutionBuilderHost, [this.baseDir], {incremental: true});

    this.watching = true;
    this.compileStart = Date.now();
    solutionBuilder.build(this.baseDir);
  }

  private createProgram(rootNames: ReadonlyArray<string>,
                        options: ts.CompilerOptions,
                        host?: ts.CompilerHost,
                        oldProgram?: ts.EmitAndSemanticDiagnosticsBuilderProgram,
                        configFileParsingDiagnostics?: ReadonlyArray<ts.Diagnostic>,
                        projectReferences?: ReadonlyArray<ts.ProjectReference>): ts.EmitAndSemanticDiagnosticsBuilderProgram {
    const program = ts.createEmitAndSemanticDiagnosticsBuilderProgram(rootNames, options, host, oldProgram,
                                                                      configFileParsingDiagnostics, projectReferences);
    this.program = program.getProgram();
    const emit = this.program.emit;
    this.program.emit = function (this: Target, targetSourceFile?: ts.SourceFile, writeFile?: ts.WriteFileCallback,
                                  cancellationToken?: ts.CancellationToken, emitOnlyDtsFiles?: boolean,
                                  customTransformers?: ts.CustomTransformers): ts.EmitResult {
      this.onEmitSourceFile(targetSourceFile!);
      return emit.call(this.program, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
    }.bind(this);
    return program;
  }

  protected onEmitSourceFile(sourceFile: ts.SourceFile): void {
    if (this.program !== null && !this.program.isSourceFileFromExternalLibrary(sourceFile)
        && !this.program.isSourceFileDefaultLibrary(sourceFile)
        && sourceFile.fileName.indexOf(".d.ts") < 0
        && this.emittedSourceFiles.indexOf(sourceFile) < 0) {
      this.emittedSourceFiles.push(sourceFile);
    }
  }

  protected onCompileResult(status: ts.Diagnostic): void {
    if (this.canCompile()) {
      if (status.code === 6031) {
        // watching
        this.failed = false;
        this.compileStart = Date.now();
      } else if (status.code === 6032) {
        // change detected
        this.failed = false;
        this.compileStart = Date.now();
        let output = Unicode.stringOutput(OutputSettings.styled());
        output = OutputStyle.greenBold(output);
        output = output.write("recompiling");
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = OutputStyle.yellow(output);
        output = output.write(this.uid);
        output = OutputStyle.reset(output);
        console.log(output.bind());
      } else if (status.code === 6194) {
        // complete
        this.lint().then(() => {
          if (!this.failed) {
            this.onCompileSuccess();
            this.throttleBundle();
          } else {
            this.onCompileFailure();
          }
        });
      } else {
        this.onCompileError(status);
      }
    }
  }

  protected onCompileUpdate(status: ts.Diagnostic): void {
    // hook
  }

  protected onCompileError(error: ts.Diagnostic): void {
    if (error.code === 6377) {
      return; // Suppress .tsbuildinfo file overwrite error.
    }
    let message = error.messageText;
    if (typeof message !== "string") {
      message = message.messageText;
    }
    const severity = Target.tsSeverity(error.category);
    if (severity.level >= Severity.ERROR_LEVEL) {
      this.failed = true;
    }
    if (error.file !== void 0) {
      let tag: Tag;
      if (error.length! > 1) {
        const start = Target.tsMark(error.start!, error.file);
        const end = Target.tsMark(error.start! + error.length! - 1, error.file, message);
        tag = Span.from(start, end);
      } else {
        tag = Target.tsMark(error.start!, error.file, message);
      }

      const input = Unicode.stringInput(error.file.text).withId(error.file.fileName);
      const diagnostic = new Diagnostic(input, tag, severity, "" + error.code, void 0, null);
      console.log(diagnostic.toString(OutputSettings.styled()));
    } else {
      let output = Unicode.stringOutput(OutputSettings.styled());
      output = Diagnostic.displayMessage(output, severity, message);
      console.log(output.bind());
    }
  }

  private static tsMark(position: number, file: ts.SourceFile, note?: string): Mark {
    const {line, character} = file.getLineAndCharacterOfPosition(position);
    return Mark.at(position, line + 1, character + 1, note);
  }

  private static tsSeverity(category: ts.DiagnosticCategory): Severity {
    switch (category) {
      case ts.DiagnosticCategory.Warning: return Severity.warning();
      case ts.DiagnosticCategory.Error: return Severity.error();
      case ts.DiagnosticCategory.Suggestion: return Severity.note();
      case ts.DiagnosticCategory.Message:
      default: return Severity.info();
    }
  }

  protected onCompileSuccess(): void {
    if (this.id === "main" && (this.selected && this.reapi === true || this.emittedSourceFiles.length !== 0)) {
      this.apiExtractor();
    }

    const dt = Date.now() - this.compileStart;
    this.compileStart = 0;
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.greenBold(output);
    output = output.write("compiled");
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = OutputStyle.yellow(output);
    output = output.write(this.uid);
    output = OutputStyle.reset(output);
    output = output.write(" in ");
    output = output.debug(dt);
    output = output.write("ms");
    console.log(output.bind());
    console.log();
  }

  protected onCompileFailure(): void {
    this.compileStart = 0;
    this.emittedSourceFiles.length = 0;
    this.program = null;
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.redBold(output);
    output = output.write("failed to compile");
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = OutputStyle.yellow(output);
    output = output.write(this.uid);
    output = OutputStyle.reset(output);
    console.log(output.bind());
    console.log();
  }

  apiExtractor(): void {
    const extractorConfigPath = Path.join(this.project.baseDir, "api-extractor.json");
    const extractorConfig = apiExtractor.ExtractorConfig.loadFileAndPrepare(extractorConfigPath);

    if (extractorConfig.apiReportEnabled) {
      Target.mkdir(Path.dirname(extractorConfig.reportFilePath));
    }

    apiExtractor.Extractor.invoke(extractorConfig, {
      localBuild: true,
      showDiagnostics: false,
      messageCallback: this.onApiExtractorDiagnostic.bind(this),
    });
  }

  protected onApiExtractorDiagnostic(message: apiExtractor.ExtractorMessage): void {
    message.handled = true;
    const diagnostic = this.apiExtractorDiagnostic(message);
    if (diagnostic !== null) {
      if (diagnostic.severity.level >= Severity.ERROR_LEVEL) {
        this.failed = true;
      }
      console.log(diagnostic.toString(OutputSettings.styled()));
    }
  }

  protected apiExtractorDiagnostic(message: apiExtractor.ExtractorMessage): Diagnostic | null {
    const sourceFilePath = message.sourceFilePath;
    const sourceFileLine = message.sourceFileLine;
    const sourceFileColumn = message.sourceFileColumn;
    if (sourceFilePath !== void 0 && sourceFileLine !== void 0 && sourceFileColumn !== void 0) {
      const tag = Mark.at(0, sourceFileLine, sourceFileColumn, message.text);

      let severity: Severity;
      switch (message.logLevel) {
        case apiExtractor.ExtractorLogLevel.Error: severity = Severity.error(); break;
        case apiExtractor.ExtractorLogLevel.Warning: severity = Severity.warning(); break;
        case apiExtractor.ExtractorLogLevel.Info: severity = Severity.info(); break;
        case apiExtractor.ExtractorLogLevel.Verbose: severity = Severity.debug(); break;
        case apiExtractor.ExtractorLogLevel.None:
        default: return null;
      }

      const source = FS.readFileSync(sourceFilePath, "utf8")
      const input = Unicode.stringInput(source).withId(sourceFilePath);
      return new Diagnostic(input, tag, severity, message.messageId, void 0, null);
    }
    return null;
  }

  protected createLinter(): ESLint {
    return new ESLint({
      useEslintrc: true,
    });
  }

  protected lint(): Promise<unknown> {
    if (!this.failed) {
      let linter = this.linter;
      if (linter === null) {
        linter = this.createLinter();
        this.linter = linter;
      }
      return this.lintSourceFiles(linter, this.emittedSourceFiles, 0);
    } else {
      return Promise.resolve(void 0);
    }
  }

  protected lintSourceFiles(linter: ESLint, sourceFiles: ReadonlyArray<ts.SourceFile>, index: number): Promise<unknown> {
    if (index < sourceFiles.length) {
      const sourceFile = sourceFiles[index]!;
      return linter.lintText(sourceFile.text, {filePath: sourceFile.fileName}).then((results: ESLint.LintResult[]): void => {
        for (let i = 0; i < results.length; i += 1) {
          this.onLintResult(results[i]!);
        }
      }).then(this.lintSourceFiles.bind(this, linter, sourceFiles, index + 1));
    } else {
      return Promise.resolve(void 0);
    }
  }

  protected onLintResult(result: ESLint.LintResult): void {
    const messages = result.messages;
    for (let i = 0; i < messages.length; i += 1) {
      this.onLintMessage(result, messages[i]!);
    }
  }

  protected onLintMessage(result: ESLint.LintResult, lint: Linter.LintMessage): void {
    const diagnostic = this.lintResultDiagnostic(result, lint);
    console.log(diagnostic.toString(OutputSettings.styled()));
  }

  protected lintResultDiagnostic(result: ESLint.LintResult, lint: Linter.LintMessage): Diagnostic {
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
    if (severity.level >= Severity.ERROR_LEVEL) {
      this.failed = true;
    }

    let cause: Diagnostic | null = null;
    if (lint.suggestions !== void 0) {
      for (let i = lint.suggestions.length - 1; i >= 0; i -= 1) {
        cause = this.lintSuggestionDiagnostic(result, lint.suggestions[i]!, cause);
      }
    }
    if (lint.fix !== void 0) {
      cause = this.lintFixDiagnostic(result, lint.fix, cause);
    }

    const input = Unicode.stringInput(result.source!).withId(result.filePath);
    const message = lint.ruleId !== null ? "lint rule " + lint.ruleId : void 0;
    return new Diagnostic(input, tag, severity, message, void 0, cause);
  }

  protected lintSuggestionDiagnostic(result: ESLint.LintResult, suggestion: Linter.LintSuggestion, cause: Diagnostic | null): Diagnostic {
    let tag: Tag;
    const [startOffset, endOffset] = suggestion.fix.range;
    if (startOffset === endOffset) {
      tag = Target.markAtOffset(result.source!, startOffset, suggestion.desc);
    } else {
      tag = Target.spanAtOffsets(result.source!, startOffset, endOffset, suggestion.desc);
    }

    const input = Unicode.stringInput(result.source!).withId(result.filePath);
    return new Diagnostic(input, tag, Severity.debug(), "suggestion", void 0, cause);
  }

  protected lintFixDiagnostic(result: ESLint.LintResult, fix: Rule.Fix, cause: Diagnostic | null): Diagnostic {
    const note = "Replace with `" + fix.text + "`";
    let tag: Tag;
    const [startOffset, endOffset] = fix.range;
    if (startOffset === endOffset) {
      tag = Target.markAtOffset(result.source!, startOffset, note);
    } else {
      tag = Target.spanAtOffsets(result.source!, startOffset, endOffset, note);
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

  protected cancelBundle(): void {
    if (this.bundleTimer > 0) {
      clearTimeout(this.bundleTimer as any);
      this.bundleTimer = 0;
    }
  }

  protected throttleBundle(): void {
    this.cancelBundle();
    if (this.bundleTimer === 0) {
      this.bundleTimer = setTimeout(this.bundleRest, 1000) as any;
    } else if (this.bundleTimer === -1) {
      this.bundleTimer = -2;
    }
  }

  bundleRest(): Promise<unknown> {
    let action: Promise<unknown>;
    if (this.selected || this.emittedSourceFiles.length !== 0) {
      action = this.bundle();
    } else {
      action = Promise.resolve(void 0);
    }
    if (this.retest) {
      action = action.then((): Promise<unknown> => {
        return this.test();
      });
    }
    if (this.redoc) {
      action = action.then((): Promise<unknown> => {
        return this.doc();
      });
    }
    action = action.finally((): void => {
      this.emittedSourceFiles.length = 0;
      this.program = null;
    });
    return action;
  }

  bundle(): Promise<unknown> {
    this.cancelBundle();
    this.bundleTimer = -1;

    let output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.greenBold(output);
    output = output.write("bundling");
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = OutputStyle.yellow(output);
    output = output.write(this.uid);
    output = OutputStyle.reset(output);
    console.log(output.bind());

    const bundleConfigs = this.project.bundleConfig[this.id] as rollup.RollupOptions | rollup.RollupOptions | undefined;
    if (bundleConfigs !== void 0) {
      const t0 = Date.now();
      const cwd = process.cwd();
      process.chdir(this.project.baseDir);
      return this.generateBundles(bundleConfigs).then((result: unknown): unknown => {
        const dt = Date.now() - t0;
        let output = Unicode.stringOutput(OutputSettings.styled());
        output = OutputStyle.greenBold(output);
        output = output.write("bundled");
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = OutputStyle.yellow(output);
        output = output.write(this.uid);
        output = OutputStyle.reset(output);
        output = output.write(" in ");
        output = output.debug(dt);
        output = output.write("ms");
        console.log(output.bind());

        this.onBundleSuccess();
        return result;
      })
      .catch(this.onBundleError)
      .finally(() => {
        process.chdir(cwd);
      });
    } else {
      return Promise.resolve(void 0);
    }
  }

  generateBundles(bundleConfigs: rollup.RollupOptions | rollup.RollupOptions[], bundleIndex: number = 0): Promise<unknown> {
    if (bundleConfigs !== void 0) {
      if (!Array.isArray(bundleConfigs)) {
        return this.generateBundle(bundleConfigs);
      } else if (bundleIndex < bundleConfigs.length) {
        let bundleNext: Promise<unknown> = this.generateBundle(bundleConfigs[bundleIndex]!);
        if (bundleIndex + 1 < bundleConfigs.length) {
          bundleNext = bundleNext.then(this.generateBundles.bind(this, bundleConfigs, bundleIndex + 1));
        }
        return bundleNext;
      }
    }
    return Promise.resolve(void 0);
  }

  generateBundle(bundleConfig: rollup.RollupOptions): Promise<rollup.RollupOutput> {
    return rollup.rollup(bundleConfig).then((build: rollup.RollupBuild): Promise<rollup.RollupOutput> => {
      if (this.watching) {
        bundleConfig.cache = build.cache;
      }
      return this.generateBundleOutputs(build, bundleConfig);
    });
  }

  generateBundleOutputs(build: rollup.RollupBuild, bundleConfig: rollup.RollupOptions, outputIndex: number = 0): Promise<rollup.RollupOutput> {
    const bundleOutput = bundleConfig.output;
    if (bundleOutput !== void 0) {
      if (!Array.isArray(bundleOutput)) {
        return this.generateBundleOutput(build, bundleOutput);
      } else if (outputIndex < bundleOutput.length) {
        let bundleNext = this.generateBundleOutput(build, bundleOutput[outputIndex]!);
        if (outputIndex + 1 < bundleOutput.length) {
          bundleNext = bundleNext.then(this.generateBundleOutputs.bind(this, build, bundleConfig, outputIndex + 1));
        }
        return bundleNext;
      }
    }
    throw new Error("no bundles");
  }

  generateBundleOutput(build: rollup.RollupBuild, bundleOutput: rollup.OutputOptions): Promise<rollup.RollupOutput> {
    return build.generate(bundleOutput).then((bundle: rollup.RollupOutput): Promise<rollup.RollupOutput> => {
      bundle.output[0].fileName = bundleOutput.file!;
      return this.simplify(bundle, bundleOutput);
    }).then((bundle: rollup.RollupOutput): rollup.RollupOutput => {
      this.writeBundle(bundle, bundleOutput);
      return bundle;
    });
  }

  simplify(bundle: rollup.RollupOutput, options: rollup.OutputOptions): Promise<rollup.RollupOutput> {
    const inputChunk = bundle.output[0] as rollup.OutputChunk;
    const outputDir = Path.dirname(inputChunk.fileName);
    const scriptName = Path.basename(inputChunk.fileName);
    const scriptPath = Path.resolve(outputDir, scriptName);
    const terserOptions: terser.MinifyOptions = {
      compress: false,
      mangle: false,
      output: {
        beautify: true,
        comments: false,
        indent_level: 2,
      },
    };
    (terserOptions.output as any).keep_numbers = true;
    if (!options.banner) {
      terserOptions.output!.preamble = this.preamble;
    }
    if (options.sourcemap) {
      const sourceMappingURL = scriptName + ".map";
      terserOptions.sourceMap = {
        content: inputChunk.map,
        filename: scriptPath,
        url: sourceMappingURL,
      };
    }
    return terser.minify(inputChunk.code, terserOptions).then((output: terser.MinifyOutput): Promise<rollup.RollupOutput> => {
      const outputChunk: rollup.OutputChunk = {
        type: "chunk",
        fileName: scriptPath,
        code: output.code!,
        map: output.map as unknown as rollup.SourceMap,
        name: inputChunk.name,
        facadeModuleId: inputChunk.facadeModuleId,
        modules: inputChunk.modules,
        imports: inputChunk.imports,
        importedBindings: inputChunk.importedBindings,
        dynamicImports: inputChunk.dynamicImports,
        exports: inputChunk.exports,
        referencedFiles: inputChunk.referencedFiles,
        isEntry: inputChunk.isEntry,
        isDynamicEntry: inputChunk.isDynamicEntry,
        isImplicitEntry: inputChunk.isImplicitEntry,
        implicitlyLoadedBefore: inputChunk.implicitlyLoadedBefore,
      };
      bundle.output.push(outputChunk);
      if (this.project.devel || this.id === "test") {
        return Promise.resolve(bundle);
      } else {
        return this.minify(bundle, options);
      }
    }).catch(this.onMinifyError);
  }

  minify(bundle: rollup.RollupOutput, options: rollup.OutputOptions): Promise<rollup.RollupOutput> {
    const inputChunk = bundle.output[0] as rollup.OutputChunk;
    const outputDir = Path.dirname(inputChunk.fileName);
    const scriptExt = Path.extname(inputChunk.fileName);
    const scriptName = Path.basename(inputChunk.fileName, scriptExt) + ".min" + scriptExt;
    const scriptPath = Path.resolve(outputDir, scriptName);
    const terserOptions: terser.MinifyOptions = {
      output: {
        comments: false,
      },
    };
    if (!options.banner) {
      terserOptions.output!.preamble = this.preamble;
    }
    if (options.sourcemap) {
      const sourceMappingURL = scriptName + ".map";
      terserOptions.sourceMap = {
        content: inputChunk.map,
        filename: scriptPath,
        url: sourceMappingURL,
      };
    }
    return terser.minify(inputChunk.code, terserOptions).then((output: terser.MinifyOutput): rollup.RollupOutput => {
      const outputChunk: rollup.OutputChunk = {
        type: "chunk",
        fileName: scriptPath,
        code: output.code!,
        map: output.map as unknown as rollup.SourceMap,
        name: inputChunk.name,
        facadeModuleId: inputChunk.facadeModuleId,
        modules: inputChunk.modules,
        imports: inputChunk.imports,
        importedBindings: inputChunk.importedBindings,
        dynamicImports: inputChunk.dynamicImports,
        exports: inputChunk.exports,
        referencedFiles: inputChunk.referencedFiles,
        isEntry: inputChunk.isEntry,
        isDynamicEntry: inputChunk.isDynamicEntry,
        isImplicitEntry: inputChunk.isImplicitEntry,
        implicitlyLoadedBefore: inputChunk.implicitlyLoadedBefore,
      };
      bundle.output.push(outputChunk);
      return bundle;
    }).catch(this.onMinifyError);
  }

  protected onMinifyError(error: Error): Promise<any> {
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.redBold(output);
    output = output.write("error:");
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = output.write(error.message);
    console.log(output.bind());
    console.log();
    return Promise.reject(error);
  }

  protected onBundleSuccess(): void {
    if (this.bundleTimer === -2) {
      this.bundleTimer = 0;
      this.throttleBundle();
    } else {
      this.bundleTimer = 0;
    }
    console.log();
  }

  protected onBundleWarning(warning: rollup.RollupWarning): void {
    if (warning.code === "CIRCULAR_DEPENDENCY" || warning.code === "MISSING_NODE_BUILTINS") {
      return; // suppress superfluous warnings
    }
    let output = Unicode.stringOutput(OutputSettings.styled());
    if (warning.importer !== void 0) {
      output = output.write(warning.importer);
      output = output.write(" ");
    }
    output = OutputStyle.blue(output);
    output = output.write("warning:");
    output = OutputStyle.reset(output);
    if (warning.message.length !== 0) {
      output = output.write(" ");
      output = output.write(warning.message);
    }
    console.log(output.bind());
  }

  protected onBundleError(error: Error): void {
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.redBold(output);
    output = output.write("error:");
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = output.write(error.message);
    console.log(output.bind());
    console.log();

    output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.redBold(output);
    output = output.write("failed to bundle");
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = OutputStyle.yellow(output);
    output = output.write(this.uid);
    output = OutputStyle.reset(output);
    console.log(output.bind());
  }

  protected writeBundle(bundle: rollup.RollupOutput, options: rollup.OutputOptions): void {
    for (let i = 1; i < bundle.output.length; i += 1) {
      const chunk = bundle.output[i] as rollup.OutputChunk;
      const scriptPath = chunk.fileName!;
      const sourceMappingPath = scriptPath + ".map";

      Target.mkdir(Path.dirname(scriptPath));
      FS.writeFileSync(scriptPath, chunk.code, "utf8");

      if (options.sourcemap) {
        FS.writeFileSync(sourceMappingPath, chunk.map!.toString(), "utf8");
      }
    }
  }

  private static mkdir(dir: string) {
    if (!FS.existsSync(dir)) {
      Target.mkdir(Path.dirname(dir));
      FS.mkdirSync(dir);
    }
  }

  test(): Promise<unknown> {
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.greenBold(output);
    output = output.write("testing");
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = OutputStyle.yellow(output);
    output = output.write(this.uid);
    output = OutputStyle.reset(output);
    console.log(output.bind());

    const bundleConfig = this.project.bundleConfig[this.id] as rollup.RollupOptions | undefined;
    const bundleOutput = bundleConfig !== void 0 ? bundleConfig.output as rollup.OutputOptions : void 0;
    const outputFile = bundleOutput !== void 0 ? bundleOutput.file : void 0;
    const scriptPath = outputFile !== void 0 ? Path.resolve(this.project.baseDir, outputFile) : void 0;
    if (scriptPath !== void 0 && FS.existsSync(scriptPath)) {
      return new Promise<void>((resolve, reject): void => {
        const args: string[] = [];
        const t0 = Date.now();
        const proc = ChildProcess.fork(scriptPath, args, {cwd: this.project.baseDir});
        proc.on("exit", (code: number): void => {
          const dt = Date.now() - t0;
          if (code === 0) {
            let output = Unicode.stringOutput(OutputSettings.styled());
            output = OutputStyle.greenBold(output);
            output = output.write("tested");
            output = OutputStyle.reset(output);
            output = output.write(" ");
            output = OutputStyle.yellow(output);
            output = output.write(this.uid);
            output = OutputStyle.reset(output);
            output = output.write(" in ");
            output = output.debug(dt);
            output = output.write("ms");
            console.log(output.bind());
            console.log();
            resolve();
          } else {
            let output = Unicode.stringOutput(OutputSettings.styled());
            output = OutputStyle.redBold(output);
            output = output.write("failed to test");
            output = OutputStyle.reset(output);
            output = output.write(" ");
            output = OutputStyle.yellow(output);
            output = output.write(this.uid);
            output = OutputStyle.reset(output);
            console.log(output.bind());
            console.log();
            reject(code);
          }
        });
      });
    } else {
      let output = Unicode.stringOutput(OutputSettings.styled());
      output = OutputStyle.greenBold(output);
      output = output.write("untested");
      output = OutputStyle.reset(output);
      output = output.write(" ");
      output = OutputStyle.yellow(output);
      output = output.write(this.uid);
      output = OutputStyle.reset(output);
      console.log(output.bind());
      console.log();
      return Promise.resolve(0);
    }
  }

  doc(): Promise<unknown> {
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.greenBold(output);
    output = output.write("documenting");
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = OutputStyle.yellow(output);
    output = output.write(this.uid);
    output = OutputStyle.reset(output);
    console.log(output.bind());

    const outDir = Path.join(this.project.baseDir, "lib", "doc");

    const docOptions = {} as typedoc.TypeDocOptions;
    docOptions.name = this.project.title || this.project.name;
    let readmeFile: string;
    if (this.project.readme !== void 0) {
      readmeFile = Path.resolve(this.project.baseDir, this.project.readme);
    } else {
      readmeFile = Path.resolve(this.project.baseDir, "README.md");
    }
    if (FS.existsSync(readmeFile)) {
      docOptions.readme = readmeFile;
    }
    if (this.project.build.gaID !== void 0) {
      docOptions.gaID = this.project.build.gaID;
    }
    docOptions.excludeInternal = true;
    docOptions.excludePrivate = true;
    docOptions.entryPointStrategy = "packages";
    docOptions.entryPoints = [];

    if (this.project.framework) {
      const frameworkTargets = this.frameworkTargets();
      for (let i = 0; i < frameworkTargets.length; i += 1) {
        docOptions.entryPoints.push(frameworkTargets[i]!.project.baseDir);
      }
    } else {
      docOptions.entryPoints.push(this.project.baseDir);
    }

    const doc = new typedoc.Application();
    doc.bootstrap(docOptions);

    const t0 = Date.now();
    const project = doc.convert();
    if (project !== void 0) {
      return doc.generateDocs(project, outDir).then(() => {
        const dt = Date.now() - t0;
        output = Unicode.stringOutput(OutputSettings.styled());
        output = OutputStyle.greenBold(output);
        output = output.write("documented");
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = OutputStyle.yellow(output);
        output = output.write(this.uid);
        output = OutputStyle.reset(output);
        output = output.write(" in ");
        output = output.debug(dt);
        output = output.write("ms");
        console.log(output.bind());
        console.log();
      }).catch(this.onDocError);
    } else {
      let output = Unicode.stringOutput(OutputSettings.styled());
      output = OutputStyle.redBold(output);
      output = output.write("failed to document");
      output = OutputStyle.reset(output);
      output = output.write(" ");
      output = OutputStyle.yellow(output);
      output = output.write(this.uid);
      output = OutputStyle.reset(output);
      console.log(output.bind());
      console.log();
      return Promise.reject();
    }
  }

  protected onDocError(error: Error): void {
    let output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.redBold(output);
    output = output.write("error:");
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = output.write(error.message);
    console.log(output.bind());
    console.log();

    output = Unicode.stringOutput(OutputSettings.styled());
    output = OutputStyle.redBold(output);
    output = output.write("failed to document");
    output = OutputStyle.reset(output);
    output = output.write(" ");
    output = OutputStyle.yellow(output);
    output = output.write(this.uid);
    output = OutputStyle.reset(output);
    console.log(output.bind());
  }

  clean(): void {
    try {
      const configPath = ts.findConfigFile(this.baseDir, ts.sys.fileExists, "tsconfig.json");
      const commandLine = ts.getParsedCommandLineOfConfigFile(configPath!, this.compilerOptions, ts.sys as any)!;
      const tsBuildInfoFile = commandLine.options.tsBuildInfoFile;
      if (tsBuildInfoFile !== void 0 && tsBuildInfoFile.length !== 0 && FS.existsSync(tsBuildInfoFile)) {
        let output = Unicode.stringOutput(OutputSettings.styled());
        output = OutputStyle.greenBold(output);
        output = output.write("deleting");
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = output.write(tsBuildInfoFile);
        console.log(output.bind());
        FS.unlinkSync(tsBuildInfoFile);
      }
    } catch (error) {
      console.error(error); // swallow
    }
  }
}
