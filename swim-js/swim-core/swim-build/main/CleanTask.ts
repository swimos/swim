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

import * as ChildProcess from "child_process";
import {TaskStatus} from "./Task";
import {PackageTask} from "./PackageTask";

/** @public */
export class CleanTask extends PackageTask {
  override get name(): string {
    return "clean";
  }

  override async exec(): Promise<TaskStatus> {
    const packageScope = this.packageScope!;
    const packageConfig = await packageScope.package.getOrLoadIfExists(null);
    const packageScripts = packageConfig !== null ? packageConfig.scripts : void 0;
    const cleanScript = packageScripts !== void 0 ? packageScripts.clean : void 0;
    if (cleanScript === void 0) {
      return TaskStatus.Pending;
    }
    return new Promise<TaskStatus>((resolve, reject): void => {
      this.logBegin("cleaning");
      ChildProcess.exec(cleanScript!, {cwd: this.baseDir.value}, (error, stdout, stderr) => {
        console.log(stdout);
        if (stderr) {
          console.error(stderr);
        }
        if (error === null) {
          resolve(TaskStatus.Success);
        } else {
          reject(error);
        }
      });
    });
  }
}
