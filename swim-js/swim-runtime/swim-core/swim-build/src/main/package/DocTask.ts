// Copyright 2015-2023 Swim.inc
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
import {TaskStatus} from "../task/Task";
import {PackageTask} from "./PackageTask";

/** @public */
export class DocTask extends PackageTask {
  override get name(): string {
    return "doc";
  }

  override async exec(): Promise<TaskStatus> {
    const packageScope = this.packageScope!;
    const packageConfig = await packageScope.package.getOrLoadIfExists(null);
    const packageScripts = packageConfig !== null ? packageConfig.scripts : void 0;
    const doScript = packageScripts !== void 0 ? packageScripts.doc : void 0;
    if (doScript !== void 0) {
      return new Promise<TaskStatus>((resolve, reject): void => {
        this.logBegin("documenting");
        const t0 = Date.now();
        ChildProcess.exec(doScript!, {cwd: this.baseDir.value}, (error, stdout, stderr) => {
          const dt = Date.now() - t0;
          console.log(stdout);
          if (stderr.length !== 0) {
            console.error(stderr);
          }
          if (error === null) {
            this.logSuccess("documented", dt);
            resolve(TaskStatus.Success);
          } else {
            this.logFailure("failed to document");
            resolve(TaskStatus.Failure);
          }
        });
      });
    } else {
      return TaskStatus.Pending;
    }
  }
}
