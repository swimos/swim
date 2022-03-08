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
import * as FS from "fs";
import * as apiExtractor from "@microsoft/api-extractor";
import {Severity} from "@swim/util";
import {Mark, OutputSettings, Diagnostic, Unicode} from "@swim/codec";
import type {MemberFastenerClass} from "@swim/component";
import {FileRef} from "@swim/sys";
import {TaskStatus} from "../task/Task";
import {LibraryTask} from "./LibraryTask";

/** @public */
export class ApiTask extends LibraryTask {
  constructor() {
    super();
    this.messages = [];
  }

  override get name(): string {
    return "api";
  }

  readonly messages: apiExtractor.ExtractorMessage[];

  @FileRef<ApiTask, apiExtractor.ExtractorConfig | null>({
    fileName: "api-extractor.json",
    value: null,
    getBaseDir(): string | undefined {
      return this.owner.baseDir.value;
    },
    async readFile(path: string): Promise<apiExtractor.ExtractorConfig | null> {
      return apiExtractor.ExtractorConfig.loadFileAndPrepare(path);
    },
  })
  readonly extractorConfig!: FileRef<this, apiExtractor.ExtractorConfig | null>;
  static readonly extractorConfig: MemberFastenerClass<ApiTask, "extractorConfig">;

  override async exec(): Promise<TaskStatus> {
    let status = TaskStatus.Pending;
    const extractorConfig = await this.extractorConfig.getOrLoadIfExists(null);
    if (extractorConfig !== null) {
      this.logBegin("typing");
      const t0 = Date.now();
      status = await this.extractApi(extractorConfig);
      const dt = Date.now() - t0;
      if (status === TaskStatus.Success) {
        this.logSuccess("typed", dt);
      } else {
        this.logFailure("failed to type");
      }
    }
    return status;
  }

  protected async extractApi(extractorConfig: apiExtractor.ExtractorConfig): Promise<TaskStatus> {
    this.messages.length = 0;
    if (extractorConfig.apiReportEnabled) {
      ApiTask.mkdir(Path.dirname(extractorConfig.reportFilePath));
    }
    const result = apiExtractor.Extractor.invoke(extractorConfig, {
      localBuild: true,
      showDiagnostics: false,
      messageCallback: this.onExtractorMessage.bind(this),
    });
    if (result.succeeded) {
      return TaskStatus.Success;
    } else {
      return TaskStatus.Failure;
    }
  }

  protected onExtractorMessage(message: apiExtractor.ExtractorMessage): void {
    message.handled = true;
    this.messages.push(message);
    this.logMessage(message);
  }

  protected diagnose(message: apiExtractor.ExtractorMessage): Diagnostic | null {
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

  protected logMessage(message: apiExtractor.ExtractorMessage): void {
    const diagnostic = this.diagnose(message);
    if (diagnostic !== null) {
      console.log(diagnostic.toString(OutputSettings.styled()));
    }
  }

  /** @internal */
  static mkdir(dir: string): void {
    if (!FS.existsSync(dir)) {
      this.mkdir(Path.dirname(dir));
      FS.mkdirSync(dir);
    }
  }
}
