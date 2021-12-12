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

import * as ChildProcess from "child_process";
import type {Class} from "@swim/util";
import {TaskStatus} from "../task/Task";
import {PackageTaskOptions, PackageTask} from "./PackageTask";

/** @public */
export interface PublishTaskOptions extends PackageTaskOptions {
  tag?: string;
  access?: string;
  dryRun?: boolean;
}

/** @public */
export class PublishTask extends PackageTask {
  override get name(): string {
    return "publish";
  }

  override readonly optionsType?: Class<PublishTaskOptions>;

  override async exec(options?: PublishTaskOptions): Promise<TaskStatus> {
    return new Promise<TaskStatus>((resolve, reject): void => {
      this.logBegin("publishing");

      const command = "npm";
      const args = ["publish"];
      if (options !== void 0) {
        if (options.tag !== void 0) {
          args.push("--tag", options.tag);
        }
        if (options.access !== void 0) {
          args.push("--access", options.access);
        }
        if (options.dryRun) {
          args.push("--dry-run");
        }
      }
      this.logCommand(command, args);

      const t0 = Date.now();
      const proc = ChildProcess.spawn(command, args, {cwd: this.baseDir.value, stdio: "inherit"});
      proc.on("exit", (code: number): void => {
        const dt = Date.now() - t0;
        if (code === 0) {
          this.logSuccess("published", dt);
          resolve(TaskStatus.Success);
        } else {
          this.logFailure("failed to publish");
          resolve(TaskStatus.Failure);
        }
      });
    });
  }
}
