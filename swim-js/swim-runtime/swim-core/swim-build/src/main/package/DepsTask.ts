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

import {OutputSettings, OutputStyle, Unicode} from "@swim/codec";
import {TaskStatus} from "../task/Task";
import {PackageTask} from "./PackageTask";

/** @public */
export class DepsTask extends PackageTask {
  override get name(): string {
    return "deps";
  }

  override async exec(): Promise<TaskStatus> {
    const packageScope = this.packageScope!;
    const dependencies = packageScope.getDependencies();

    let output = Unicode.stringOutput(OutputSettings.styled());
    const parent = this.parent;
    output = (parent !== null ? parent : this).writeName(output);
    output = output.write(" ");
    output = OutputStyle.cyanBold(output);
    output = output.write("dependencies");
    output = OutputStyle.reset(output);
    console.log(output.bind());

    let dependencyCount = 0;
    for (const packageName in dependencies) {
      const dependency = dependencies[packageName]!;
      output = Unicode.stringOutput(OutputSettings.styled());
      output = output.write(" - ");
      output = OutputStyle.yellow(output);
      output = output.write(dependency.name);
      output = OutputStyle.reset(output);
      console.log(output.bind());
      dependencyCount += 1;
    }
    if (dependencyCount === 0) {
      output = Unicode.stringOutput(OutputSettings.styled());
      output = output.write(" - ");
      output = OutputStyle.gray(output);
      output = output.write("none");
      output = OutputStyle.reset(output);
      console.log(output.bind());
    }
    console.log("");

    return TaskStatus.Success;
  }
}
