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

import {exec} from "child_process";
import {TaskStatus} from "../task/Task";
import {PackageTask} from "./PackageTask";

/** @public */
export class TestTask extends PackageTask {
  override get name(): string {
    return "test";
  }

  override async exec(): Promise<TaskStatus> {
    const packageScope = this.packageScope!;
    const packageConfig = await packageScope.package.getOrLoadIfExists(null);
    const packageScripts = packageConfig !== null ? packageConfig.scripts : void 0;
    const testScript = packageScripts !== void 0 ? packageScripts.test : void 0;
    if (testScript !== void 0) {
      return new Promise<TaskStatus>((resolve, reject): void => {
        this.logBegin("testing");
        const t0 = Date.now();
        const testProcess = exec(testScript!, {cwd: this.baseDir.value}, (error) => {
          const dt = Date.now() - t0;
          if (error === null) {
            this.logSuccess("tested", dt);
            resolve(TaskStatus.Success);
          } else {
            this.logFailure("failed to test");
            resolve(TaskStatus.Failure);
          }
        });
        testProcess.stdout!.on("data", function (data: string): void {
          process.stdout.write(data);
        });
        testProcess.stderr!.on("data", function (data: string): void {
          process.stderr.write(data);
        });
      });
    } else {
      return TaskStatus.Pending;
    }
  }
}
