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

import type {Class, Dictionary, MutableDictionary} from "@swim/util";
import {OutputSettings, OutputStyle, Unicode} from "@swim/codec";
import {TaskStatus} from "../task/Task";
import {PackageTaskOptions, PackageTask} from "./PackageTask";
import type {PackageConfig, PackageScope} from "./PackageScope";

/** @public */
export interface VersionTaskOptions extends PackageTaskOptions {
  packageVersions?: Dictionary<string>;
  dryRun?: boolean;
}

/** @public */
export class VersionTask extends PackageTask {
  override get name(): string {
    return "version";
  }

  override readonly optionsType?: Class<VersionTaskOptions>;

  override async exec(options?: VersionTaskOptions): Promise<TaskStatus> {
    const packageVersions = options !== void 0 ? options.packageVersions : void 0;
    const packageScope = this.packageScope;
    if (packageVersions !== void 0 && packageScope !== null) {
      const packageConfigPath = packageScope.package.path;
      const oldPackageConfig = packageScope.package.value;
      if (packageConfigPath !== void 0 && oldPackageConfig !== null) {
        this.logBegin("updating");
        const newPackageConfig = this.updatedPackageConfig(packageScope, oldPackageConfig, packageVersions);
        if (newPackageConfig !== null) {
          if (options === void 0 || options.dryRun !== true) {
            let output = Unicode.stringOutput(OutputSettings.styled());
            output = OutputStyle.greenBold(output);
            output = output.write("writing updates");
            output = OutputStyle.reset(output);
            output = output.write(" ");
            output = OutputStyle.faint(output);
            output = output.write("to");
            output = OutputStyle.reset(output);
            output = output.write(" ");
            output = OutputStyle.gray(output);
            output = output.write(packageConfigPath);
            output = OutputStyle.reset(output);
            console.log(output.bind());
            packageScope.package.store(void 0, newPackageConfig);
          } else {
            let output = Unicode.stringOutput(OutputSettings.styled());
            output = OutputStyle.yellowBold(output);
            output = output.write("not writing updates");
            output = OutputStyle.reset(output);
            output = output.write(" ");
            output = OutputStyle.faint(output);
            output = output.write("to");
            output = OutputStyle.reset(output);
            output = output.write(" ");
            output = OutputStyle.gray(output);
            output = output.write(packageConfigPath);
            output = OutputStyle.reset(output);
            console.log(output.bind());
          }
        }
        console.log("");
      }
    }
    return TaskStatus.Success;
  }

  protected updatedPackageConfig(packageScope: PackageScope, oldPackageConfig: PackageConfig, packageVersions: Dictionary<string>): PackageConfig | null {
    const newPackageConfig: MutableDictionary<unknown> = {};
    let modified = false;
    for (const key in oldPackageConfig) {
      const oldValue = oldPackageConfig[key as keyof PackageConfig];
      if (key === "version") {
        let output = Unicode.stringOutput(OutputSettings.styled());
        output = OutputStyle.gray(output);
        output = output.write("version");
        output = OutputStyle.reset(output);
        output = OutputStyle.faint(output);
        output = output.write(":");
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = OutputStyle.cyan(output);
        output = output.write("" + oldValue);
        output = OutputStyle.reset(output);
        const newVersion = packageVersions[packageScope.name];
        if (newVersion !== void 0 && newVersion !== oldValue) {
          newPackageConfig[key] = newVersion;
          modified = true;
          output = output.write(" ");
          output = OutputStyle.faint(output);
          output = output.write("->");
          output = OutputStyle.reset(output);
          output = output.write(" ");
          output = OutputStyle.green(output);
          output = output.write(newVersion);
          output = OutputStyle.reset(output);
        } else {
          newPackageConfig[key] = oldValue;
        }
        console.log(output.bind());
      } else if (key in VersionTask.DependencyKeys && oldValue !== void 0) {
        let output = Unicode.stringOutput(OutputSettings.styled());
        output = OutputStyle.gray(output);
        output = output.write(key);
        output = OutputStyle.reset(output);
        output = OutputStyle.faint(output);
        output = output.write(":");
        output = OutputStyle.reset(output);
        console.log(output.bind());
        const newDependencies = this.updatedDependencies(oldValue as Dictionary<string>, packageVersions);
        if (newDependencies !== null) {
          newPackageConfig[key] = newDependencies;
          modified = true;
        } else {
          newPackageConfig[key] = oldValue;
          output = Unicode.stringOutput(OutputSettings.styled());
          output = OutputStyle.gray(output);
          output = output.write("- ");
          output = OutputStyle.reset(output);
          output = OutputStyle.faint(output);
          output = output.write("no change");
          output = OutputStyle.reset(output);
          console.log(output.bind());
        }
      } else {
        newPackageConfig[key] = oldValue;
      }
    }
    return modified ? newPackageConfig as unknown as PackageConfig : null;
  }

  protected updatedDependencies(oldDependencies: Dictionary<string>, packageVersions: Dictionary<string>): Dictionary<string> | null {
    const newDependencies: MutableDictionary<string> = {};
    let modified = false;
    for (const packageName in oldDependencies) {
      const oldVersion = oldDependencies[packageName]!;
      const newVersion = packageVersions[packageName];
      if (newVersion !== void 0 && newVersion !== oldVersion) {
        newDependencies[packageName] = newVersion;
        modified = true;
        let output = Unicode.stringOutput(OutputSettings.styled());
        output = OutputStyle.gray(output);
        output = output.write("- ");
        output = OutputStyle.reset(output);
        output = output.write(packageName);
        output = OutputStyle.faint(output);
        output = output.write(":");
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = OutputStyle.cyan(output);
        output = output.write(oldVersion);
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = OutputStyle.faint(output);
        output = output.write("->");
        output = OutputStyle.reset(output);
        output = output.write(" ");
        output = OutputStyle.green(output);
        output = output.write(newVersion);
        output = OutputStyle.reset(output);
        console.log(output.bind());
      } else {
        newDependencies[packageName] = oldVersion;
      }
    }
    return modified ? newDependencies : null;
  }

  /** @internal */
  static readonly DependencyKeys: Dictionary<null> = {
    "dependencies": null,
    "optionalDependencies": null,
    "peerDependencies": null,
    "devDependencies": null,
  };
}
