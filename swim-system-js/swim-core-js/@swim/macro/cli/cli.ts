// Copyright 2015-2021 Swim inc.
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

import {Cmd, Opt, Arg} from "@swim/args";
import {Recon} from "@swim/recon";
import {Processor} from "@swim/macro";

function runProcess(this: Cmd, args: {[name: string]: string | undefined}): void {
  const processor = new Processor();
  const model = processor.includeFile(args.model!);
  const result = processor.evaluate(model);
  if (result.isDefined()) {
    console.log(Recon.toBlockString(result));
  }
}

const processCmd: Cmd = Cmd.create("process")
    .withDesc("process input model")
    .withOpt(Opt.create("model").withFlag("m").withArg(Arg.create("model.recon").withValue("model.recon").asOptional(true)).withDesc("input model path"))
    .withHelpCmd()
    .onExec(runProcess);

export const cli = Cmd.create("swim-macro")
    .withCmd(processCmd)
    .withHelpCmd();
