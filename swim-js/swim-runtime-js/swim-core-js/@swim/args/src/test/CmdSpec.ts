// Copyright 2015-2021 Swim Inc.
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
    const cmd = Cmd.create("test").withCmd("exec");
    const run = cmd.clone().parse(["test"]);
    exam.equal(run.name, "test");
  }

  @Test
  parseSubcmd(exam: Exam): void {
    const cmd = Cmd.create("test").withCmd("exec");
    const run = cmd.clone().parse(["test", "exec"]);
    exam.equal(run.name, "exec");
  }

  @Test
  parseOpt(exam: Exam): void {
    const cmd = Cmd.create("test").withOpt("arg");
    const run = cmd.clone().parse(["test", "--arg"]);
    exam.equal(run.getOpt("arg").defs, 1);
  }

  @Test
  parseOpts(exam: Exam): void {
    const cmd = Cmd.create("test").withOpt("arg1").withOpt("arg2");
    const run = cmd.clone().parse(["test", "--arg2", "--arg1"]);
    exam.equal(run.getOpt("arg1").defs, 1);
    exam.equal(run.getOpt("arg2").defs, 1);
  }

  @Test
  parseFlag(exam: Exam): void {
    const cmd = Cmd.create("test").withOpt(Opt.create("arg", "a"));
    const run = cmd.clone().parse(["test", "-a"]);
    exam.equal(run.getOpt("arg").defs, 1);
  }

  @Test
  parseFlags(exam: Exam): void {
    const cmd = Cmd.create("test").withOpt(Opt.create("arg1", "a")).withOpt(Opt.create("arg2", "b"));
    const run = cmd.clone().parse(["test", "-ba"]);
    exam.equal(run.getOpt("arg1").defs, 1);
    exam.equal(run.getOpt("arg2").defs, 1);
  }

  @Test
  parseOptArg(exam: Exam): void {
    const cmd = Cmd.create("test").withOpt(Opt.create("arg").withArg("value"));
    const run = cmd.clone().parse(["test", "--arg", "value"]);
    exam.equal(run.getOpt("arg").defs, 1);
    exam.equal(run.getOpt("arg").getValue(), "value");
  }

  @Test
  parseFlagArg(exam: Exam): void {
    const cmd = Cmd.create("test").withOpt(Opt.create("arg", "a").withArg("value"));
    const run = cmd.clone().parse(["test", "-a", "value"]);
    exam.equal(run.getOpt("arg").defs, 1);
    exam.equal(run.getOpt("arg").getValue(), "value");
  }

  @Test
  parseCmdArg(exam: Exam): void {
    const cmd = Cmd.create("test").withArg(Arg.create("path"));
    const run = cmd.clone().parse(["test", "value"]);
    exam.equal(run.getArg(0)!.value, "value");
    exam.equal(run.getValue(0), "value");
  }

  @Test
  testDefaultHelpCmd(exam: Exam): void {
    const cmd = Cmd.create("test")
        .withCmd(Cmd.create("data").withDesc("access data")
            .withCmd(Cmd.create("load").withArg(Arg.create("file")).withDesc("load data").withHelpCmd())
            .withCmd(Cmd.create("store").withDesc("store data"))
            .withHelpCmd()
            .withOpt(Opt.create("file").withFlag('f').withDesc("output file").withArg("path"))
            .withOpt(Opt.create("force").withDesc("overwrite existing file")))
        .withHelpCmd();
    const run = cmd.clone().parse(["test"]);
    run.run();
  }

  @Test
  testHelpCmd(exam: Exam): void {
    const cmd = Cmd.create("test")
        .withCmd(Cmd.create("data").withDesc("access data")
            .withCmd(Cmd.create("load").withArg(Arg.create("file")).withDesc("load data").withHelpCmd())
            .withCmd(Cmd.create("store").withDesc("store data"))
            .withHelpCmd()
            .withOpt(Opt.create("file").withFlag('f').withDesc("output file").withArg("path"))
            .withOpt(Opt.create("force").withDesc("overwrite existing file")))
        .withHelpCmd();
    const run = cmd.clone().parse(["test", "help"]);
    run.run();
  }

  @Test
  testHelpSubcmd(exam: Exam): void {
    const cmd = Cmd.create("test")
        .withCmd(Cmd.create("data").withDesc("access data")
            .withCmd(Cmd.create("load").withArg(Arg.create("file")).withDesc("load data").withHelpCmd())
            .withCmd(Cmd.create("store").withDesc("store data"))
            .withHelpCmd()
            .withOpt(Opt.create("file").withFlag('f').withDesc("output file").withArg("path"))
            .withOpt(Opt.create("force").withDesc("overwrite existing file")))
        .withHelpCmd();
    const run = cmd.clone().parse(["test", "data", "help"]);
    run.run();
  }

  @Test
  testHelpCmdArg(exam: Exam): void {
    const cmd = Cmd.create("test")
        .withCmd(Cmd.create("data").withDesc("access data")
            .withCmd(Cmd.create("load").withArg(Arg.create("file")).withDesc("load data").withHelpCmd())
            .withCmd(Cmd.create("store").withDesc("store data"))
            .withHelpCmd()
            .withOpt(Opt.create("file").withFlag('f').withDesc("output file").withArg("path"))
            .withOpt(Opt.create("force").withDesc("overwrite existing file")))
        .withHelpCmd();
    const run = cmd.clone().parse(["test", "data", "load", "help"]);
    run.run();
  }
}
