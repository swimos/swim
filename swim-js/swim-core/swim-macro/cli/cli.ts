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

import {Arg} from "@swim/args";
import {Opt} from "@swim/args";
import {Cmd} from "@swim/args";
import {Recon} from "@swim/recon";
import {Processor} from "@swim/macro";

const processCmd: Cmd = Cmd.create("process")
  .withHelpCmd()
  .withDesc("process input model")
  .withOpt(Opt.create("model").withFlag("m").withArg(Arg.create("model.recon").withValue("model.recon").asOptional(true)).withDesc("input model path"))
  .onExec(function (this: Cmd, args: {[name: string]: string | undefined}): void {
    const processor = new Processor();
    const model = processor.includeFile(args.model!);
    const result = processor.evaluate(model);
    if (result.isDefined()) {
      console.log(Recon.toBlockString(result));
    }
  });

export const cli = Cmd.create("swim-macro")
  .withCmd(processCmd)
  .withHelpCmd();
