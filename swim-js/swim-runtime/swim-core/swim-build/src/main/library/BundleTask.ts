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
import * as rollup from "rollup";
import type {MemberFastenerClass} from "@swim/component";
import {FileRef} from "@swim/sys";
import {TaskStatus} from "../task/Task";
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

  @FileRef<BundleTask, rollup.RollupOptions[] | null>({
    fileName: "rollup.config.js",
    value: null,
    getBaseDir(): string | undefined {
      return this.owner.baseDir.value;
    },
    async readFile(path: string): Promise<rollup.RollupOptions[] | null> {
      let rollupConfig: rollup.RollupOptions[] | rollup.RollupOptions = await BundleTask.importScript(path);
      if (!Array.isArray(rollupConfig)) {
        rollupConfig = [rollupConfig];
      }
      return rollupConfig;
    },
    willSetValue(path: string, rollupConfig: rollup.RollupOptions[] | null): void {
      if (rollupConfig !== null) {
        this.owner.caches.length = rollupConfig.length;
        for (let i = 0; i < rollupConfig.length; i += 1) {
          const rollupOptions = rollupConfig[i]!;
          rollupOptions.cache = this.owner.caches[i];
        }
      }
    },
  })
  readonly rollupConfig!: FileRef<this, rollup.RollupOptions[] | null>;
  static readonly rollupConfig: MemberFastenerClass<BundleTask, "rollupConfig">;

  override async exec(): Promise<TaskStatus> {
    let status = TaskStatus.Pending;
    const rollupConfig = await this.rollupConfig.getOrLoadIfExists(null);
    if (rollupConfig !== null) {
      this.logBegin("bundling");
      const t0 = Date.now();
      status = await this.bundle(rollupConfig);
      const dt = Date.now() - t0;
      if (status === TaskStatus.Success) {
        this.logSuccess("bundled", dt);
      } else {
        this.logFailure("failed to bundle");
      }
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

  static async importScript(scriptFile: string): Promise<any> {
    const bundle = await rollup.rollup({
      input: scriptFile,
      external(id: string): boolean {
        return id[0] !== "." && !Path.isAbsolute(id) || id.slice(-5, id.length) === ".json";
      },
      onwarn(warning: rollup.RollupWarning, warn: rollup.WarningHandler): void {
        if (warning.code === "MIXED_EXPORTS") {
          return; // suppress
        }
        warn(warning);
      },
    });

    const {output} = await bundle.generate({
      format: "cjs",
      exports: "default",
    });

    // temporarily override require to inject config script
    const defaultLoader = require.extensions[".js"];
    require.extensions[".js"] = function (module: NodeModule, fileName: string): void {
      if (fileName === scriptFile) {
        (module as { _compile?: any })._compile(output[0].code, fileName);
      } else {
        defaultLoader(module, fileName);
      }
    };

    delete require.cache[scriptFile];
    const config = require(scriptFile);
    require.extensions[".js"] = defaultLoader;
    return config;
  }
}
