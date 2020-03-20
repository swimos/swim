// Copyright 2015-2020 SWIM.AI inc.
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

import {Spec, Test, Exam} from "@swim/unit";
import {Arg, Opt, Cmd} from "@swim/args";

export class CmdSpec extends Spec {
  @Test
  parseCmd(exam: Exam): void {
    const cmd = Cmd.of("test").cmd("exec");
    const run = cmd.clone().parse(["test"]);
    exam.equal(run.name(), "test");
  }

  @Test
  parseSubcmd(exam: Exam): void {
    const cmd = Cmd.of("test").cmd("exec");
    const run = cmd.clone().parse(["test", "exec"]);
    exam.equal(run.name(), "exec");
  }

  @Test
  parseOpt(exam: Exam): void {
    const cmd = Cmd.of("test").opt("arg");
    const run = cmd.clone().parse(["test", "--arg"]);
    exam.equal(run.getOpt("arg").defs(), 1);
  }

  @Test
  parseOpts(exam: Exam): void {
    const cmd = Cmd.of("test").opt("arg1").opt("arg2");
    const run = cmd.clone().parse(["test", "--arg2", "--arg1"]);
    exam.equal(run.getOpt("arg1").defs(), 1);
    exam.equal(run.getOpt("arg2").defs(), 1);
  }

  @Test
  parseFlag(exam: Exam): void {
    const cmd = Cmd.of("test").opt(Opt.of("arg", "a"));
    const run = cmd.clone().parse(["test", "-a"]);
    exam.equal(run.getOpt("arg").defs(), 1);
  }

  @Test
  parseFlags(exam: Exam): void {
    const cmd = Cmd.of("test").opt(Opt.of("arg1", "a")).opt(Opt.of("arg2", "b"));
    const run = cmd.clone().parse(["test", "-ba"]);
    exam.equal(run.getOpt("arg1").defs(), 1);
    exam.equal(run.getOpt("arg2").defs(), 1);
  }

  @Test
  parseOptArg(exam: Exam): void {
    const cmd = Cmd.of("test").opt(Opt.of("arg").arg("value"));
    const run = cmd.clone().parse(["test", "--arg", "value"]);
    exam.equal(run.getOpt("arg").defs(), 1);
    exam.equal(run.getOpt("arg").getValue(), "value");
  }

  @Test
  parseFlagArg(exam: Exam): void {
    const cmd = Cmd.of("test").opt(Opt.of("arg", "a").arg("value"));
    const run = cmd.clone().parse(["test", "-a", "value"]);
    exam.equal(run.getOpt("arg").defs(), 1);
    exam.equal(run.getOpt("arg").getValue(), "value");
  }

  @Test
  parseCmdArg(exam: Exam): void {
    const cmd = Cmd.of("test").arg(Arg.of("path"));
    const run = cmd.clone().parse(["test", "value"]);
    exam.equal(run.getArg(0).value(), "value");
    exam.equal(run.getValue(0), "value");
  }

  @Test
  testDefaultHelpCmd(exam: Exam): void {
    const cmd = Cmd.of("test")
        .cmd(Cmd.of("data").desc("access data")
            .cmd(Cmd.of("load").arg(Arg.of("file")).desc("load data").helpCmd())
            .cmd(Cmd.of("store").desc("store data"))
            .helpCmd()
            .opt(Opt.of("file").flag('f').desc("output file").arg("path"))
            .opt(Opt.of("force").desc("overwrite existing file")))
        .helpCmd();
    const run = cmd.clone().parse(["test"]);
    run.run();
  }

  @Test
  testHelpCmd(exam: Exam): void {
    const cmd = Cmd.of("test")
        .cmd(Cmd.of("data").desc("access data")
            .cmd(Cmd.of("load").arg(Arg.of("file")).desc("load data").helpCmd())
            .cmd(Cmd.of("store").desc("store data"))
            .helpCmd()
            .opt(Opt.of("file").flag('f').desc("output file").arg("path"))
            .opt(Opt.of("force").desc("overwrite existing file")))
        .helpCmd();
    const run = cmd.clone().parse(["test", "help"]);
    run.run();
  }

  @Test
  testHelpSubcmd(exam: Exam): void {
    const cmd = Cmd.of("test")
        .cmd(Cmd.of("data").desc("access data")
            .cmd(Cmd.of("load").arg(Arg.of("file")).desc("load data").helpCmd())
            .cmd(Cmd.of("store").desc("store data"))
            .helpCmd()
            .opt(Opt.of("file").flag('f').desc("output file").arg("path"))
            .opt(Opt.of("force").desc("overwrite existing file")))
        .helpCmd();
    const run = cmd.clone().parse(["test", "data", "help"]);
    run.run();
  }

  @Test
  testHelpCmdArg(exam: Exam): void {
    const cmd = Cmd.of("test")
        .cmd(Cmd.of("data").desc("access data")
            .cmd(Cmd.of("load").arg(Arg.of("file")).desc("load data").helpCmd())
            .cmd(Cmd.of("store").desc("store data"))
            .helpCmd()
            .opt(Opt.of("file").flag('f').desc("output file").arg("path"))
            .opt(Opt.of("force").desc("overwrite existing file")))
        .helpCmd();
    const run = cmd.clone().parse(["test", "data", "load", "help"]);
    run.run();
  }
}
