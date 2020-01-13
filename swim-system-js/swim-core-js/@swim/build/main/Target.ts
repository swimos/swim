// Copyright 2015-2020 SWIM.AI inc.
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

import {fork} from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import * as tslint from "tslint";
import * as rollup from "rollup";
import * as typedoc from "typedoc";
// tslint:disable: no-var-requires
const terser = require("terser");

import {Severity} from "@swim/util";
import {Tag, Mark, Span, OutputSettings, OutputStyle, Diagnostic, Unicode} from "@swim/codec";
import {Project} from "./Project";
import {DocTarget} from "./DocTarget";

export interface TargetConfig {
  id: string;
  path?: string;
  deps?: string[];
  compilerOptions?: ts.CompilerOptions;
  preamble?: string;
}

export class Target {
  readonly project: Project;

  readonly id: string;
  readonly uid: string;
  readonly path: string;
  readonly baseDir: string;

  readonly deps: Target[];

  preamble: string | undefined;

  readonly compilerOptions: ts.CompilerOptions;
  readonly lintConfig: tslint.Configuration.IConfigurationFile;
  readonly emittedSourceFiles: ts.SourceFile[];
  program: ts.Program | undefined;

  selected: boolean;
  watching: boolean;
  failed: boolean;
  retest: boolean;
  redoc: boolean;

  compileStart: number;
  bundleTimer: number;

  constructor(project: Project, config: TargetConfig) {
    this.project = project;

    this.id = config.id;
    this.uid = this.project.id + ":" + this.id;
    this.path = config.path !== void 0 ? config.path : this.id;
    this.baseDir = path.resolve(this.project.baseDir, this.path);

    this.deps = [];

    this.preamble = config.preamble;

    this.compilerOptions = config.compilerOptions || this.project.compilerOptions;
    this.lintConfig = tslint.Configuration.findConfiguration(null, this.baseDir).results!;
    this.emittedSourceFiles = [];

    this.selected = false;
    this.watching = false;
    this.failed = false;
    this.retest = false;
    this.redoc = false;

    this.compileStart = 0;
    this.createWatchProgram = this.createWatchProgram.bind(this);
    this.onCompileUpdate = this.onCompileUpdate.bind(this);
    this.onCompileResult = this.onCompileResult.bind(this);
    this.onCompileError = this.onCompileError.bind(this);

    this.bundleTimer = 0;
    this.bundle = this.bundle.bind(this);
    this.onBundleWarning = this.onBundleWarning.bind(this);
    this.onBundleError = this.onBundleError.bind(this);
  }

  initDeps(config: TargetConfig): void {
    if (config.deps) {
      for (let i = 0; i < config.deps.length; i += 1) {
        const dep = config.deps[i];
        const [projectId, targetId] = dep.split(":");
        const project = this.project.build.projects[projectId];
        const target = project.targets[targetId || "main"];
        this.deps.push(target);
      }
    }
  }

  initBundle(bundleConfig: rollup.RollupOptions): void {
    if (typeof bundleConfig.input === "string") {
      bundleConfig.input = path.resolve(this.project.baseDir, bundleConfig.input);
    }
    const bundleOutput = bundleConfig.output as rollup.OutputOptions;
    if (bundleOutput && typeof bundleOutput.file === "string") {
      bundleOutput.file = path.resolve(this.project.baseDir, bundleOutput.file);
      if (this.preamble === void 0) {
        if (typeof bundleOutput.banner === "string") {
          this.preamble = bundleOutput.banner;
        } else {
          this.preamble = "// " + path.basename(bundleOutput.file, ".js") + "-" + this.project.package.version;
          if (this.project.package.copyright) {
            this.preamble += "; copyright " + this.project.package.copyright;
          }
        }
      }
      if (!bundleOutput.banner && this.project.devel) {
        bundleOutput.banner = this.preamble;
      }
    }
  }

  transitiveDeps(targets: Target[] = []): Target[] {
    for (let i = 0; i < this.deps.length; i += 1) {
      targets = this.deps[i].transitiveDeps(targets);
    }
    if (targets.indexOf(this) < 0) {
      targets.push(this);
    }
    return targets;
  }

  protected injectProjectReferences(oldRefs: ReadonlyArray<ts.ProjectReference> = [],
                                    compilerOptions?: ts.CompilerOptions): ts.ProjectReference[] {
    const newRefs: ts.ProjectReference[] = [];
    let targets: Target[] = [];
    for (let i = 0; i < this.deps.length; i += 1) {
      targets = this.deps[i].transitiveDeps(targets);
    }
    for (let i = 0; i < targets.length; i += 1) {
      const target = targets[i];
      newRefs.push({path: target.baseDir});
      if (target.id === "main" && compilerOptions) {
        compilerOptions.paths = compilerOptions.paths || {};
        if (!compilerOptions.paths[target.project.name]) {
          compilerOptions.paths[target.project.name] = [target.baseDir];
        }
      }
    }
    return newRefs;
  }

  protected injectCompilerOptions(compilerOptions: ts.CompilerOptions): void {
    // stub
  }

  protected canCompile(): boolean {
    let targets = [] as Target[];
    for (let i = 0; i < this.deps.length; i += 1) {
      targets = this.deps[i].transitiveDeps(targets);
    }
    for (let i = 0; i < targets.length; i += 1) {
      const target = targets[i];
      if (target.failed) {
        return false;
      }
    }
    return true;
  }

  compile(): Promise<unknown> {
    if (this.canCompile()) {
      const output = Unicode.stringOutput(OutputSettings.styled());
      OutputStyle.greenBold(output);
      output.write("compiling");
      OutputStyle.reset(output);
      output.write(" ");
      OutputStyle.yellow(output);
      output.write(this.uid);
      OutputStyle.reset(output);
      console.log(output.bind());

      const configPath = ts.findConfigFile(this.baseDir, ts.sys.fileExists, "tsconfig.json");
      const commandLine = ts.getParsedCommandLineOfConfigFile(configPath!, this.compilerOptions, ts.sys as any)!;
      const projectReferences = this.injectProjectReferences(commandLine.projectReferences, commandLine.options);
      this.injectCompilerOptions(commandLine.options);

      const incrementalProgram = ts.createIncrementalProgram<ts.EmitAndSemanticDiagnosticsBuilderProgram>({
        rootNames: commandLine.fileNames,
        options: commandLine.options,
        projectReferences: projectReferences,
        configFileParsingDiagnostics: commandLine.errors,
      });
      this.program = incrementalProgram.getProgram();
      this.compileStart = Date.now();

      let nextDiagnostic: ts.AffectedFileResult<ReadonlyArray<ts.Diagnostic>>;
      while (nextDiagnostic = incrementalProgram.getSemanticDiagnosticsOfNextAffectedFile()) {
        const diagnostics = nextDiagnostic.result;
        for (let i = 0; i < diagnostics.length; i += 1) {
          const diagnostic = diagnostics[i];
          if (diagnostic.category !== ts.DiagnosticCategory.Message) {
            this.onCompileError(diagnostics[i]);
          }
        }
      }

      if (!this.failed) {
        let nextEmit: ts.AffectedFileResult<ts.EmitResult>;
        while (nextEmit = incrementalProgram.emitNextAffectedFile()) {
          if ((nextEmit.affected as ts.SourceFile).kind === ts.SyntaxKind.SourceFile) {
            const sourceFile = nextEmit.affected as ts.SourceFile;
            this.onEmitSourceFile(sourceFile);
          }
        }
      }

      if (!this.failed) {
        this.lint();
      }
      this.emittedSourceFiles.length = 0;
      if (!this.failed) {
        this.onCompileSuccess();
        if (this.selected) {
          return this.bundle();
        }
      } else {
        this.onCompileFailure();
      }
      this.program = void 0;
    }
    return Promise.resolve(void 0);
  }

  watch(): void {
    const output = Unicode.stringOutput(OutputSettings.styled());
    OutputStyle.greenBold(output);
    output.write("watching");
    OutputStyle.reset(output);
    output.write(" ");
    OutputStyle.yellow(output);
    output.write(this.uid);
    OutputStyle.reset(output);
    console.log(output.bind());

    const configPath = ts.findConfigFile(this.baseDir, ts.sys.fileExists, "tsconfig.json");
    const commandLine = ts.getParsedCommandLineOfConfigFile(configPath!, this.compilerOptions, ts.sys as any)!;
    const projectReferences = this.injectProjectReferences(commandLine.projectReferences, commandLine.options);
    this.injectCompilerOptions(commandLine.options);

    const rootNames = projectReferences.map(ref => ref.path);
    rootNames.push(this.baseDir);
    const solutionBuilderHost = ts.createSolutionBuilderWithWatchHost(ts.sys, this.createWatchProgram, this.onCompileError,
                                                                      this.onCompileUpdate, this.onCompileResult);
    const solutionBuilder = ts.createSolutionBuilderWithWatch(solutionBuilderHost, rootNames, {incremental: true, watch: true});

    this.watching = true;
    solutionBuilder.build();
  }

  private createWatchProgram(rootNames: ReadonlyArray<string>,
                             options: ts.CompilerOptions,
                             host?: ts.CompilerHost,
                             oldProgram?: ts.EmitAndSemanticDiagnosticsBuilderProgram,
                             configFileParsingDiagnostics?: ReadonlyArray<ts.Diagnostic>,
                             projectReferences?: ReadonlyArray<ts.ProjectReference>): ts.EmitAndSemanticDiagnosticsBuilderProgram {
    projectReferences = this.injectProjectReferences(projectReferences, options);
    const watchProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram(rootNames, options, host, oldProgram,
                                                                           configFileParsingDiagnostics, projectReferences);
    this.program = watchProgram.getProgram();
    const emit = this.program.emit;
    this.program.emit = function (this: Target, targetSourceFile?: ts.SourceFile, writeFile?: ts.WriteFileCallback, cancellationToken?: ts.CancellationToken, emitOnlyDtsFiles?: boolean, customTransformers?: ts.CustomTransformers): ts.EmitResult {
      this.onEmitSourceFile(targetSourceFile!);
      return emit.call(this.program, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
    }.bind(this);
    return watchProgram;
  }

  protected onEmitSourceFile(sourceFile: ts.SourceFile): void {
    if (this.program && !this.program.isSourceFileFromExternalLibrary(sourceFile)
        && !this.program.isSourceFileDefaultLibrary(sourceFile)
        && sourceFile.fileName.indexOf(".d.ts") < 0
        && this.emittedSourceFiles.indexOf(sourceFile) < 0) {
      this.emittedSourceFiles.push(sourceFile);
    }
  }

  protected onCompileResult(status: ts.Diagnostic) {
    if (this.canCompile()) {
      if (status.code === 6031) {
        // watching
        this.failed = false;
        this.compileStart = Date.now();
      } else if (status.code === 6032) {
        // change detected
        this.failed = false;
        this.compileStart = Date.now();
        const output = Unicode.stringOutput(OutputSettings.styled());
        OutputStyle.greenBold(output);
        output.write("recompiling");
        OutputStyle.reset(output);
        output.write(" ");
        OutputStyle.yellow(output);
        output.write(this.uid);
        OutputStyle.reset(output);
        console.log(output.bind());
      } else if (status.code === 6194) {
        // complete
        if (!this.failed) {
          this.lint();
        }
        this.emittedSourceFiles.length = 0;
        if (!this.failed) {
          this.onCompileSuccess();
          if (this.selected) {
            this.throttleBundle();
          }
        } else {
          this.onCompileFailure();
        }
      } else {
        this.onCompileError(status);
      }
    }
  }

  protected onCompileUpdate(status: ts.Diagnostic) {
    // stub
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
    if (severity.level() >= Severity.ERROR_LEVEL) {
      this.failed = true;
    }
    if (error.file) {
      let tag: Tag;
      if (error.length! > 1) {
        const start = Target.tsMark(error.start!, error.file);
        const end = Target.tsMark(error.start! + error.length! - 1, error.file, message);
        tag = Span.from(start, end);
      } else {
        tag = Target.tsMark(error.start!, error.file, message);
      }

      const input = Unicode.stringInput(error.file.text).id(error.file.fileName);
      const diagnostic = new Diagnostic(input, tag, severity, "" + error.code, null, null);
      console.log(diagnostic.toString(OutputSettings.styled()));
    } else {
      const output = Unicode.stringOutput(OutputSettings.styled());
      Diagnostic.displayMessage(severity, message, output);
      console.log(output.bind());
    }
  }

  private static tsMark(position: number, file: ts.SourceFile, note: string | null = null): Mark {
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

  protected onCompileSuccess() {
    const dt = Date.now() - this.compileStart;
    this.compileStart = 0;
    const output = Unicode.stringOutput(OutputSettings.styled());
    OutputStyle.greenBold(output);
    output.write("compiled");
    OutputStyle.reset(output);
    output.write(" ");
    OutputStyle.yellow(output);
    output.write(this.uid);
    OutputStyle.reset(output);
    output.write(" in ");
    output.debug(dt);
    output.write("ms");
    console.log(output.bind());
    console.log();
  }

  protected onCompileFailure() {
    this.compileStart = 0;
    const output = Unicode.stringOutput(OutputSettings.styled());
    OutputStyle.redBold(output);
    output.write("failed to compile");
    OutputStyle.reset(output);
    output.write(" ");
    OutputStyle.yellow(output);
    output.write(this.uid);
    OutputStyle.reset(output);
    console.log(output.bind());
    console.log();
  }

  protected lint(): void {
    const linter = new tslint.Linter({fix: false}, this.program);
    for (let i = 0; i < this.emittedSourceFiles.length; i += 1) {
      const sourceFile = this.emittedSourceFiles[i];
      linter.lint(sourceFile.fileName, sourceFile.text, this.lintConfig);
    }
    this.onLintResult(linter.getResult());
  }

  protected onLintResult(result: tslint.LintResult): void {
    for (let i = 0; i < result.failures.length; i += 1) {
      this.onLintFailure(result.failures[i]);
    }
  }

  protected onLintFailure(failure: tslint.RuleFailure): void {
    let tag: Tag;
    if (failure.getEndPosition().getPosition() - failure.getStartPosition().getPosition() > 1) {
      const start = Target.tslinkMark(failure.getStartPosition());
      const end = Target.tslinkMark(failure.getEndPosition(), -1, failure.getFailure());
      tag = Span.from(start, end);
    } else {
      tag =  Target.tslinkMark(failure.getStartPosition(), 0, failure.getFailure());
    }
    const severity = Target.tslintSeverity(failure.getRuleSeverity());
    if (severity.level() >= Severity.ERROR_LEVEL) {
      this.failed = true;
    }

    const sourceFile = (failure as any).sourceFile;
    const input = Unicode.stringInput(sourceFile.text).id(sourceFile.fileName);
    const diagnostic = new Diagnostic(input, tag, severity, failure.getRuleName(), null, null);
    console.log(diagnostic.toString(OutputSettings.styled()));
  }

  private static tslinkMark(pos: tslint.RuleFailurePosition, shift: number = 0, note: string | null = null): Mark {
    const position = pos.getPosition();
    const {line, character} = pos.getLineAndCharacter();
    return Mark.at(position + shift, line + 1, character + shift + 1, note);
  }

  private static tslintSeverity(severity: tslint.RuleSeverity): Severity {
    switch (severity) {
      case "warning": return Severity.warning();
      case "error": return Severity.error();
      case "off":
      default: return Severity.info();
    }
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
      this.bundleTimer = setTimeout(this.bundle, 1000) as any;
    } else if (this.bundleTimer === -1) {
      this.bundleTimer = -2;
    }
  }

  bundle(): Promise<unknown> {
    this.cancelBundle();
    this.bundleTimer = -1;

    const output = Unicode.stringOutput(OutputSettings.styled());
    OutputStyle.greenBold(output);
    output.write("bundling");
    OutputStyle.reset(output);
    output.write(" ");
    OutputStyle.yellow(output);
    output.write(this.uid);
    OutputStyle.reset(output);
    console.log(output.bind());

    const bundleConfig = this.project.bundleConfig[this.id] as rollup.RollupOptions | undefined;
    if (bundleConfig) {
      const t0 = Date.now();
      const cwd = process.cwd();
      process.chdir(this.project.baseDir);
      return rollup.rollup(bundleConfig)
        .then((build: rollup.RollupBuild): Promise<rollup.RollupOutput> => {
          process.chdir(cwd);
          if (this.watching) {
            bundleConfig.cache = build.cache;
          }
          return build.generate(bundleConfig.output as rollup.OutputOptions);
        })
        .then((bundle: rollup.RollupOutput): rollup.RollupOutput => {
          const bundleOutput = bundleConfig.output as rollup.OutputOptions;
          bundle.output[0].fileName = bundleOutput.file!;
          bundle = this.minify(bundle, bundleOutput);

          this.writeBundle(bundle, bundleOutput);

          const dt = Date.now() - t0;
          const output = Unicode.stringOutput(OutputSettings.styled());
          OutputStyle.greenBold(output);
          output.write("bundled");
          OutputStyle.reset(output);
          output.write(" ");
          OutputStyle.yellow(output);
          output.write(this.uid);
          OutputStyle.reset(output);
          output.write(" in ");
          output.debug(dt);
          output.write("ms");
          console.log(output.bind());

          this.onBundleSuccess();
          return bundle;
        })
        .then((bundle: rollup.RollupOutput): Promise<rollup.RollupOutput> | rollup.RollupOutput => {
          if (this.retest) {
            return new Promise((resolve, reject): void => {
              this.test().then((): void => {
                resolve(bundle);
              }, reject);
            });
          } else {
            return bundle;
          }
        })
        .then((bundle: rollup.RollupOutput): Promise<rollup.RollupOutput> | rollup.RollupOutput => {
          if (this.redoc) {
            return new Promise((resolve, reject): void => {
              this.doc().then((): void => {
                resolve(bundle);
              }, reject);
            });
          } else {
            return bundle;
          }
        })
        .catch(this.onBundleError);
    } else {
      return Promise.resolve(void 0);
    }
  }

  minify(bundle: rollup.RollupOutput, options: rollup.OutputOptions): rollup.RollupOutput {
    if (!this.project.devel) {
      const inputChunk = bundle.output[0] as rollup.OutputChunk;
      const outputDir = path.dirname(inputChunk.fileName);
      const scriptName = path.basename(inputChunk.fileName, ".js") + ".min.js";
      const scriptPath = path.resolve(outputDir, scriptName);
      const terserOptions: any = {
        output: {},
      };
      if (!options.banner) {
        terserOptions.output.preamble = this.preamble;
      }
      if (options.sourcemap) {
        const sourceMappingURL = scriptName + ".map";
        terserOptions.sourceMap = {
          content: inputChunk.map,
          filename: scriptPath,
          url: sourceMappingURL,
        };
      }
      const output = terser.minify(inputChunk.code, terserOptions);
      if (!output.error) {
        const outputChunk: rollup.OutputChunk = {
          type: "chunk",
          fileName: scriptPath,
          code: output.code,
          map: output.map,
          name: inputChunk.name,
          facadeModuleId: inputChunk.facadeModuleId,
          modules: inputChunk.modules,
          imports: inputChunk.imports,
          dynamicImports: inputChunk.dynamicImports,
          exports: inputChunk.exports,
          isEntry: inputChunk.isEntry,
          isDynamicEntry: inputChunk.isDynamicEntry,
        };
        bundle.output.push(outputChunk);
      } else {
        this.onMinifyError(output.error);
      }
    }
    return bundle;
  }

  protected onMinifyError(error: Error): void {
    const output = Unicode.stringOutput(OutputSettings.styled());
    OutputStyle.redBold(output);
    output.write("error:");
    OutputStyle.reset(output);
    output.write(" ");
    output.write(error.message);
    console.log(output.bind());
    console.log();
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
    const output = Unicode.stringOutput(OutputSettings.styled());
    if (warning.importer) {
      output.write(warning.importer);
      output.write(" ");
    }
    OutputStyle.blue(output);
    output.write("warning:");
    OutputStyle.reset(output);
    if (warning.message) {
      output.write(" ");
      output.write(warning.message);
    }
    console.log(output.bind());
  }

  protected onBundleError(error: Error): void {
    let output = Unicode.stringOutput(OutputSettings.styled());
    OutputStyle.redBold(output);
    output.write("error:");
    OutputStyle.reset(output);
    output.write(" ");
    output.write(error.message);
    console.log(output.bind());
    console.log();

    output = Unicode.stringOutput(OutputSettings.styled());
    OutputStyle.redBold(output);
    output.write("failed to bundle");
    OutputStyle.reset(output);
    output.write(" ");
    OutputStyle.yellow(output);
    output.write(this.uid);
    OutputStyle.reset(output);
    console.log(output.bind());
  }

  protected writeBundle(bundle: rollup.RollupOutput, options: rollup.OutputOptions): void {
    for (let i = 0; i < bundle.output.length; i += 1) {
      const chunk = bundle.output[i] as rollup.OutputChunk;
      const scriptPath = chunk.fileName!;
      const sourceMappingPath = scriptPath + ".map";

      Target.mkdir(path.dirname(scriptPath));
      let code = chunk.code;
      if (options.sourcemap && i === 0) {
        const sourceMappingURL = path.basename(sourceMappingPath);
        code += "//# sourceMappingURL=" + sourceMappingURL;
      }
      fs.writeFileSync(scriptPath, code, "utf8");

      if (options.sourcemap) {
        fs.writeFileSync(sourceMappingPath, chunk.map, "utf8");
      }
    }
  }

  private static mkdir(dir: string) {
    if (!fs.existsSync(dir)) {
      Target.mkdir(path.dirname(dir));
      fs.mkdirSync(dir);
    }
  }

  test(): Promise<unknown> {
    const output = Unicode.stringOutput(OutputSettings.styled());
    OutputStyle.greenBold(output);
    output.write("testing");
    OutputStyle.reset(output);
    output.write(" ");
    OutputStyle.yellow(output);
    output.write(this.uid);
    OutputStyle.reset(output);
    console.log(output.bind());

    const bundleConfig = this.project.bundleConfig[this.id] as rollup.RollupOptions | undefined;
    const bundleOutput = bundleConfig ? bundleConfig.output as rollup.OutputOptions : void 0;
    const outputFile = bundleOutput ? bundleOutput.file : void 0;
    const scriptPath = outputFile ? path.resolve(this.project.baseDir, outputFile) : void 0;
    if (scriptPath && fs.existsSync(scriptPath)) {
      return new Promise((resolve, reject): void => {
        const args: string[] = [];

        const t0 = Date.now();
        const proc = fork(scriptPath, args);
        proc.on("exit", (code: number): void => {
          const dt = Date.now() - t0;
          if (code === 0) {
            const output = Unicode.stringOutput(OutputSettings.styled());
            OutputStyle.greenBold(output);
            output.write("tested");
            OutputStyle.reset(output);
            output.write(" ");
            OutputStyle.yellow(output);
            output.write(this.uid);
            OutputStyle.reset(output);
            output.write(" in ");
            output.debug(dt);
            output.write("ms");
            console.log(output.bind());
            console.log();
            resolve();
          } else {
            const output = Unicode.stringOutput(OutputSettings.styled());
            OutputStyle.redBold(output);
            output.write("failed to test");
            OutputStyle.reset(output);
            output.write(" ");
            OutputStyle.yellow(output);
            output.write(this.uid);
            OutputStyle.reset(output);
            console.log(output.bind());
            console.log();
            reject(code);
          }
        });
      });
    } else {
      const output = Unicode.stringOutput(OutputSettings.styled());
      OutputStyle.greenBold(output);
      output.write("untested");
      OutputStyle.reset(output);
      output.write(" ");
      OutputStyle.yellow(output);
      output.write(this.uid);
      OutputStyle.reset(output);
      console.log(output.bind());
      console.log();
      return Promise.resolve(0);
    }
  }

  protected getRootFileNames(): ReadonlyArray<string> {
    const configPath = ts.findConfigFile(this.baseDir, ts.sys.fileExists, "tsconfig.json");
    const commandLine = ts.getParsedCommandLineOfConfigFile(configPath!, this.compilerOptions, ts.sys as any)!;
    const projectReferences = this.injectProjectReferences(commandLine.projectReferences, commandLine.options);
    const program = ts.createProgram({
      rootNames: commandLine.fileNames,
      options: commandLine.options,
      projectReferences: projectReferences,
      configFileParsingDiagnostics: commandLine.errors,
    });
    return program.getRootFileNames();
  }

  doc(): Promise<unknown> {
    let output = Unicode.stringOutput(OutputSettings.styled());
    OutputStyle.greenBold(output);
    output.write("documenting");
    OutputStyle.reset(output);
    output.write(" ");
    OutputStyle.yellow(output);
    output.write(this.uid);
    OutputStyle.reset(output);
    console.log(output.bind());

    const configPath = ts.findConfigFile(this.baseDir, ts.sys.fileExists, "tsconfig.json");
    const outDir = path.join(this.project.baseDir, "doc", "/");

    const doc = new typedoc.Application({
      name: this.project.title || this.project.name,
      readme: "none",
      mode: "modules",
      tsconfig: configPath,
      gaID: this.project.build.gaID,
      excludeNotExported: true,
      excludePrivate: true,
      hideGenerator: true,
    });

    const fileNames: string[] = [];
    const fileTargetMap: {[fileName: string]: {target: Target} | undefined} = {};
    const targets = this.transitiveDeps();
    for (let i = 0; i < targets.length; i += 1) {
      const target = targets[i];
      const targetFileNames = target.getRootFileNames();
      for (let j = 0; j < targetFileNames.length; j += 1) {
        const fileName = targetFileNames[j];
        fileNames.push(fileName);
        fileTargetMap[fileName] = {target};
      }
    }

    const docTarget = doc.converter.getComponent("doc-target");
    if (docTarget instanceof DocTarget) {
      docTarget.target = this;
      docTarget.fileTargetMap = fileTargetMap;
    }

    const t0 = Date.now();
    const project = doc.convert(fileNames);
    if (project) {
      doc.generateDocs(project, outDir);
      const dt = Date.now() - t0;

      output = Unicode.stringOutput(OutputSettings.styled());
      OutputStyle.greenBold(output);
      output.write("documented");
      OutputStyle.reset(output);
      output.write(" ");
      OutputStyle.yellow(output);
      output.write(this.uid);
      OutputStyle.reset(output);
      output.write(" in ");
      output.debug(dt);
      output.write("ms");
      console.log(output.bind());
      console.log();
      return Promise.resolve();
    } else {
      const output = Unicode.stringOutput(OutputSettings.styled());
      OutputStyle.redBold(output);
      output.write("failed to document");
      OutputStyle.reset(output);
      output.write(" ");
      OutputStyle.yellow(output);
      output.write(this.uid);
      OutputStyle.reset(output);
      console.log(output.bind());
      console.log();
      return Promise.reject();
    }
  }

  clean(): void {
    try {
      const configPath = ts.findConfigFile(this.baseDir, ts.sys.fileExists, "tsconfig.json");
      const commandLine = ts.getParsedCommandLineOfConfigFile(configPath!, this.compilerOptions, ts.sys as any)!;
      const tsBuildInfoFile = commandLine.options.tsBuildInfoFile;
      if (tsBuildInfoFile && fs.existsSync(tsBuildInfoFile)) {
        const output = Unicode.stringOutput(OutputSettings.styled());
        OutputStyle.greenBold(output);
        output.write("deleting");
        OutputStyle.reset(output);
        output.write(" ");
        output.write(tsBuildInfoFile);
        console.log(output.bind());
        fs.unlinkSync(tsBuildInfoFile);
      }
    } catch (error) {
      console.error(error); // swallow
    }
  }
}
