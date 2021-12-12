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

import * as Path from "path";
import {Cmd, Opt} from "@swim/args";
import type {Spec, ConsoleReport} from "@swim/unit";

export const cli = Cmd.create("swim-unit")
  .withHelpCmd()
  .withDesc("run unit tests")
  .withOpt(Opt.create("module").withFlag("m").withArg("name").withDesc("module to test"))
  .onExec(async function (this: Cmd, args: {[name: string]: string | undefined}): Promise<void> {
    const modulePath = Path.resolve(process.cwd(), args.module!);
    const module = await import(modulePath);
    if (module !== void 0 && module.default !== void 0) {
      const suite: Spec = module.default;
      const report = await suite.run() as ConsoleReport;
      if (report.failCount === 0) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    }
  });
