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

import * as Path from "path";
import * as ts from "typescript";
import {MutableDictionary, Severity} from "@swim/util";
import {Input, OutputSettings, Tag, Mark, Span, Diagnostic, Unicode} from "@swim/codec";
import type {FastenerClass} from "@swim/component";
import {FileRef} from "@swim/sys";
import {TaskStatus} from "../task/Task";
import type {PackageScope} from "../package/PackageScope";
import {LibraryTask} from "./LibraryTask";

/** @public */
export class CompileTask extends LibraryTask {
  constructor() {
    super();
    this.diagnostics = [];
    this.emittedSourceFiles = {};
    this.emitCount = 0;
    this.invalidated = false;
  }

  override get name(): string {
    return "compile";
  }

  readonly diagnostics: ts.Diagnostic[];

  emittedSourceFiles: MutableDictionary<ts.SourceFile>;

  emitCount: number;

  invalidated: boolean;

  @FileRef<CompileTask["tsconfig"]>({
    fileName: "tsconfig.json",
    value: null,
    getBaseDir(): string | undefined {
      return this.owner.baseDir.value;
    },
    async readFile(path: string): Promise<ts.ParsedCommandLine | null> {
      const tsconfig = ts.getParsedCommandLineOfConfigFile(path, void 0, ts.sys as unknown as ts.ParseConfigFileHost);
      return tsconfig !== void 0 ? tsconfig : null;
    },
  })
  readonly tsconfig!: FileRef<this, ts.ParsedCommandLine | null>;
  static readonly tsconfig: FastenerClass<CompileTask["tsconfig"]>;

  override async exec(): Promise<TaskStatus> {
    this.logBegin("compiling");
    const t0 = Date.now();
    const status = await this.compile();
    const dt = Date.now() - t0;
    if (status === TaskStatus.Success) {
      this.logSuccess("compiled", dt);
    } else {
      this.logFailure("failed to compile");
    }
    return status;
  }

  protected async compile(): Promise<TaskStatus> {
    this.diagnostics.length = 0;
    this.emittedSourceFiles = {};
    this.emitCount = 0;
    this.invalidated = false;

    const solutionBuilderHost = this.createSolutionBuilderHost();
    const solutionBuilder = this.createSolutionBuilder(solutionBuilderHost);

    let status = ts.ExitStatus.Success;
    let invalidatedProject: ts.InvalidatedProject<ts.EmitAndSemanticDiagnosticsBuilderProgram> | undefined;
    while (invalidatedProject = solutionBuilder.getNextInvalidatedProject(), invalidatedProject !== void 0) {
      this.invalidated = true;
      status = invalidatedProject.done();
      if (status !== ts.ExitStatus.Success) {
        break;
      }
    }

    if (status === ts.ExitStatus.Success) {
      return TaskStatus.Success;
    } else {
      return TaskStatus.Failure;
    }
  }

  protected createSolutionBuilderHost(): ts.SolutionBuilderHost<ts.EmitAndSemanticDiagnosticsBuilderProgram> {
    const solutionBuilderHost = ts.createSolutionBuilderHost(void 0, this.createProgram.bind(this), this.reportDiagnostic.bind(this));
    solutionBuilderHost.getParsedCommandLine = this.getParsedCommandLine.bind(this);
    return solutionBuilderHost;
  }

  protected createSolutionBuilder(solutionBuilderHost:  ts.SolutionBuilderHost<ts.EmitAndSemanticDiagnosticsBuilderProgram>): ts.SolutionBuilder<ts.EmitAndSemanticDiagnosticsBuilderProgram> {
    const solutionBuilder = ts.createSolutionBuilder(solutionBuilderHost, [this.baseDir.value!], {incremental: true});
    return solutionBuilder;
  }

  protected getParsedCommandLine(fileName: string): ts.ParsedCommandLine | undefined {
    const workspace = this.workspace.getService();
    const libraryDir = Path.dirname(fileName);
    const libraryScope = workspace.getLibrary(libraryDir);
    if (libraryScope !== null) {
      const compileTask = libraryScope.getTask(CompileTask);
      if (compileTask !== null) {
        const tsconfig = compileTask.tsconfig.value;
        if (tsconfig !== null) {
          if (tsconfig.options.composite === true) {
            const packageScope = libraryScope.packageScope;
            if (packageScope !== null) {
              tsconfig.projectReferences = this.injectProjectReferences(packageScope, tsconfig.projectReferences);
            }
          }
          return tsconfig;
        }
      }
    }
    return ts.getParsedCommandLineOfConfigFile(fileName, void 0, ts.sys as unknown as ts.ParseConfigFileHost);
  }

  protected injectProjectReferences(packageScope: PackageScope, projectReferences: readonly ts.ProjectReference[] | undefined): readonly ts.ProjectReference[] | undefined {
    const dependencyReferences = projectReferences !== void 0 ? projectReferences.slice(0) : [];

    const workspace = this.workspace.getService();
    const dependencies = packageScope.getDependencies();
    for (let i = 0; i < dependencyReferences.length; i += 1) {
      const dependencyReference = dependencyReferences[i]!;
      const dependencyLibraryScope = workspace.getLibrary(dependencyReference.path);
      const dependencyPackageScope = dependencyLibraryScope !== null ? dependencyLibraryScope.packageScope : null;
      if (dependencyPackageScope !== null && dependencies[dependencyPackageScope.name] !== void 0) {
        delete dependencies[dependencyPackageScope.name]; // don't redefine project references
      }
    }

    for (const dependencyName in dependencies) {
      const dependencyScope = dependencies[dependencyName]!;
      const dependencyLibraries = dependencyScope.getLibraries();
      for (const libraryName in dependencyLibraries) {
        const dependencyLibrary = dependencyLibraries[libraryName]!;
        dependencyReferences.push({path: dependencyLibrary.baseDir.getValue()});
      }
    }

    return dependencyReferences;
  }

  protected createProgram(rootNames: readonly string[] | undefined, options: ts.CompilerOptions | undefined, host?: ts.CompilerHost, oldProgram?: ts.EmitAndSemanticDiagnosticsBuilderProgram, configFileParsingDiagnostics?: readonly ts.Diagnostic[], projectReferences?: readonly ts.ProjectReference[]): ts.EmitAndSemanticDiagnosticsBuilderProgram {
    const builderProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram(rootNames, options, host, oldProgram, configFileParsingDiagnostics, projectReferences);
    const program = builderProgram.getProgram();
    program.emit = this.emit.bind(this, program.emit);
    return builderProgram;
  }

  protected reportDiagnostic(error: ts.Diagnostic): void {
    if (error.code === 6377) {
      return; // suppress .tsbuildinfo file overwrite error
    }
    this.diagnostics.push(error);
    this.logDiagnostic(error);
  }

  protected emit(emit: (targetSourceFile?: ts.SourceFile, writeFile?: ts.WriteFileCallback, cancellationToken?: ts.CancellationToken, emitOnlyDtsFiles?: boolean, customTransformers?: ts.CustomTransformers) => ts.EmitResult,
                 targetSourceFile?: ts.SourceFile, writeFile?: ts.WriteFileCallback, cancellationToken?: ts.CancellationToken, emitOnlyDtsFiles?: boolean, customTransformers?: ts.CustomTransformers): ts.EmitResult {
    if (targetSourceFile !== void 0) {
      const fileName = targetSourceFile.fileName;
      const tsconfig = this.tsconfig.value;
      if (tsconfig !== null && tsconfig.fileNames.includes(fileName)) {
        if (this.emittedSourceFiles[fileName] === void 0) {
          this.emitCount += 1;
        }
        this.emittedSourceFiles[fileName] = targetSourceFile;
      }
    }
    return emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
  }

  protected diagnose(error: ts.Diagnostic): Diagnostic {
    let message = error.messageText;
    if (typeof message !== "string") {
      message = message.messageText;
    }

    let severity: Severity;
    switch (error.category) {
      case ts.DiagnosticCategory.Warning: severity = Severity.warning();
      case ts.DiagnosticCategory.Error: severity = Severity.error();
      case ts.DiagnosticCategory.Suggestion: severity = Severity.note();
      case ts.DiagnosticCategory.Message:
      default: severity = Severity.info();
    }

    const file = error.file;
    if (file !== void 0) {
      let tag: Tag;
      const startOffset = error.start!;
      const startPosition = file.getLineAndCharacterOfPosition(startOffset);
      if (error.length! > 1) {
        const start = Mark.at(startOffset, startPosition.line + 1, startPosition.character + 1);
        const endOffset = startOffset + error.length! - 1;
        const endPosition = file.getLineAndCharacterOfPosition(endOffset);
        const end = Mark.at(endOffset, endPosition.line + 1, endPosition.character + 1, message);
        tag = Span.from(start, end);
      } else {
        tag = Mark.at(startOffset, startPosition.line + 1, startPosition.character + 1, message);
      }
      const input = Unicode.stringInput(file.text).withId(file.fileName);
      return new Diagnostic(input, tag, severity, "" + error.code, void 0, null);
    } else {
      return new Diagnostic(Input.done(), Mark.at(0, 1, 1, message), severity, "" + error.code, void 0, null);
    }
  }

  protected logDiagnostic(diagnostic: ts.Diagnostic): void {
    console.log(this.diagnose(diagnostic).toString(OutputSettings.styled()));
  }
}
