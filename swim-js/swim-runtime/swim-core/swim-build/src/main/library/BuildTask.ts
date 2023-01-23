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

import type {Class} from "@swim/util";
import {TaskStatus} from "../task/Task";
import {LibraryTaskOptions, LibraryTask} from "./LibraryTask";
import {CompileTask} from "./CompileTask";
import {LintTask} from "./LintTask";
import {ApiTask} from "./ApiTask";
import {BundleTask} from "./BundleTask";

/** @public */
export interface BuildTaskOptions extends LibraryTaskOptions {
  force?: boolean;
}

/** @public */
export class BuildTask extends LibraryTask {
  override get name(): string {
    return "build";
  }

  override readonly optionsType?: Class<BuildTaskOptions>;

  override async exec(options?: BuildTaskOptions): Promise<TaskStatus> {
    const packageScope = this.packageScope;
    if (packageScope === null || packageScope.libraryDependencyTaskStatus(void 0, BuildTask) !== TaskStatus.Failure) {
      return this.build(options);
    } else {
      this.logWarning("unable to build");
      return TaskStatus.Pending;
    }
  }

  protected async build(options?: BuildTaskOptions): Promise<TaskStatus> {
    const force = options !== void 0 && options.force === true;
    let buildStatus = TaskStatus.Success;
    let invalidated: boolean;
    let emitted: boolean;

    const compileTask = this.getPeerTask(CompileTask);
    if (compileTask !== null) {
      const compileStatus = await compileTask.run();
      if (compileStatus === TaskStatus.Success) {
        invalidated = compileTask.invalidated;
        emitted = compileTask.emitCount !== 0;
      } else {
        invalidated = false;
        emitted = false;
      }
      if (compileStatus > buildStatus) {
        buildStatus = compileStatus;
      }
    } else {
      invalidated = true;
      emitted = true;
    }

    const lintTask = this.getPeerTask(LintTask);
    if (lintTask !== null && emitted) {
      const lintStatus = await lintTask.run();
      if (lintStatus > buildStatus) {
        buildStatus = lintStatus;
      }
    }

    const apiTask = this.getPeerTask(ApiTask);
    if (apiTask !== null && (emitted || force)) {
      const apiStatus = await apiTask.run();
      if (apiStatus > buildStatus) {
        buildStatus = apiStatus;
      }
    }

    const bundleTask = this.getPeerTask(BundleTask);
    if (bundleTask !== null && (invalidated || force)) {
      const bundleStatus = await bundleTask.run();
      if (bundleStatus > buildStatus) {
        buildStatus = bundleStatus;
      }
    }

    return buildStatus;
  }
}
