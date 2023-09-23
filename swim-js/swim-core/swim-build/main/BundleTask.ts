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

import * as rollup from "rollup";
import {loadConfigFile} from "rollup/loadConfigFile";
import {FileRef} from "@swim/sys";
import {TaskStatus} from "./Task";
import {LibraryTask} from "./LibraryTask";

/** @public */
export class BundleTask extends LibraryTask {
  constructor() {
    super();
    this.caches = [];
  }

  override get name(): string {
    return "bundle";
  }

  /** @internal */
  readonly caches: (rollup.RollupCache | undefined)[];

  @FileRef({
    fileName: "rollup.config.js",
    value: null,
    getBaseDir(): string | undefined {
      return this.owner.baseDir.value;
    },
    async readFile(path: string): Promise<rollup.MergedRollupOptions[] | null> {
      const {options, warnings} = await loadConfigFile(path, {});
      warnings.flush();
      return options;
    },
    willSetValue(path: string, rollupConfig: rollup.MergedRollupOptions[] | null): void {
      if (rollupConfig === null) {
        return;
      }
      this.owner.caches.length = rollupConfig.length;
      for (let i = 0; i < rollupConfig.length; i += 1) {
        const rollupOptions = rollupConfig[i]!;
        rollupOptions.cache = this.owner.caches[i];
      }
    },
  })
  readonly rollupConfig!: FileRef<this, rollup.MergedRollupOptions[] | null>;

  override async exec(): Promise<TaskStatus> {
    const rollupConfig = await this.rollupConfig.getOrLoadIfExists(null);
    if (rollupConfig === null) {
      return TaskStatus.Pending;
    }
    this.logBegin("bundling");
    const t0 = Date.now();
    const status = await this.bundle(rollupConfig);
    const dt = Date.now() - t0;
    if (status === TaskStatus.Success) {
      this.logSuccess("bundled", dt);
    } else {
      this.logFailure("failed to bundle");
    }
    return status;
  }

  protected async bundle(rollupConfig: rollup.RollupOptions[]): Promise<TaskStatus> {
    const cwd = process.cwd();
    process.chdir(this.baseDir.value!);
    try {
      for (let i = 0; i < rollupConfig.length; i += 1) {
        const rollupOptions = rollupConfig[i]!;
        // disable bundle caching as it appears to provide no performance gain
        //rollupOptions.cache = this.caches[i];
        const bundle = await rollup.rollup(rollupOptions);
        //this.caches[i] = bundle.cache;
        const outputOptions = rollupOptions.output;
        if (outputOptions !== void 0) {
          if (!Array.isArray(outputOptions)) {
            await bundle.write(outputOptions);
          } else {
            for (let j = 0; j < outputOptions.length; j += 1) {
              await bundle.write(outputOptions[j]!);
            }
          }
        }
        await bundle.close();
      }
      return TaskStatus.Success;
    } catch (error) {
      console.log(error);
      return TaskStatus.Failure;
    } finally {
      process.chdir(cwd);
    }
  }
}
