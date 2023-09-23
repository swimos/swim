// Copyright 2015-2023 Nstream, inc.
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
import {Extractor} from "@microsoft/api-extractor";
import {ExtractorConfig} from "@microsoft/api-extractor";
import type {ExtractorMessage} from "@microsoft/api-extractor";
import {Severity} from "@swim/util";
import {Mark} from "@swim/codec";
import {Diagnostic} from "@swim/codec";
import {OutputSettings} from "@swim/codec";
import {Unicode} from "@swim/codec";
import {FileRef} from "@swim/sys";
import {TaskStatus} from "./Task";
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

  readonly messages: ExtractorMessage[];

  @FileRef({
    fileName: "api-extractor.json",
    value: null,
    getBaseDir(): string | undefined {
      return this.owner.baseDir.value;
    },
    async readFile(path: string): Promise<ExtractorConfig | null> {
      return ExtractorConfig.loadFileAndPrepare(path);
    },
  })
  readonly extractorConfig!: FileRef<this, ExtractorConfig | null>;

  override async exec(): Promise<TaskStatus> {
    const extractorConfig = await this.extractorConfig.getOrLoadIfExists(null);
    if (extractorConfig === null) {
      return TaskStatus.Pending;
    }
    this.logBegin("typing");
    const t0 = Date.now();
    const status = await this.extractApi(extractorConfig);
    const dt = Date.now() - t0;
    if (status === TaskStatus.Success) {
      this.logSuccess("typed", dt);
    } else {
      this.logFailure("failed to type");
    }
    return status;
  }

  protected async extractApi(extractorConfig: ExtractorConfig): Promise<TaskStatus> {
    this.messages.length = 0;
    if (extractorConfig.apiReportEnabled) {
      ApiTask.mkdir(Path.dirname(extractorConfig.reportFilePath));
    }
    const result = Extractor.invoke(extractorConfig, {
      localBuild: true,
      showDiagnostics: false,
      messageCallback: this.onExtractorMessage.bind(this),
    });
    return result.succeeded ? TaskStatus.Success : TaskStatus.Failure;
  }

  protected onExtractorMessage(message: ExtractorMessage): void {
    message.handled = true;
    this.messages.push(message);
    this.logMessage(message);
  }

  protected diagnose(message: ExtractorMessage): Diagnostic | null {
    const sourceFilePath = message.sourceFilePath;
    const sourceFileLine = message.sourceFileLine;
    const sourceFileColumn = message.sourceFileColumn;
    if (sourceFilePath === void 0 || sourceFileLine === void 0 || sourceFileColumn === void 0) {
      return null;
    }
    const tag = Mark.at(0, sourceFileLine, sourceFileColumn, message.text);

    let severity: Severity;
    switch (message.logLevel) {
      case "error": severity = Severity.error(); break;
      case "warning": severity = Severity.warning(); break;
      case "info": severity = Severity.info(); break;
      case "verbose": severity = Severity.debug(); break;
      case "none":
      default: return null;
    }

    const source = FS.readFileSync(sourceFilePath, "utf8");
    const input = Unicode.stringInput(source).withId(sourceFilePath);
    return new Diagnostic(input, tag, severity, message.messageId, void 0, null);
  }

  protected logMessage(message: ExtractorMessage): void {
    const diagnostic = this.diagnose(message);
    if (diagnostic === null) {
      return;
    }
    console.log(diagnostic.toString(OutputSettings.styled()));
  }

  /** @internal */
  static mkdir(dir: string): void {
    if (FS.existsSync(dir)) {
      return;
    }
    this.mkdir(Path.dirname(dir));
    FS.mkdirSync(dir);
  }
}
