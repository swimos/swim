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

package swim.args;

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;

public class CmdSpec {

  @Test
  public void parseCmd() {
    final Cmd cmd = Cmd.create("test").cmd("exec");
    final String[] str = new String[] {"test"};
    final Cmd run = cmd.clone().parse(str);
    assertEquals(run.name(), "test");
  }

  @Test
  public void parseSubcmd() {
    final Cmd cmd = Cmd.create("test").cmd("exec");
    final String[] params = new String[] {"test", "exec"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.name(), "exec");
  }

  @Test
  public void parseOpt() {
    final Cmd cmd = Cmd.create("test").opt("arg");
    final String[] params = new String[] {"test", "--arg"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.getOpt("arg").defs(), 1);
  }

  @Test
  public void parseOpts() {
    final Cmd cmd = Cmd.create("test").opt("arg1").opt("arg2");
    final String[] params = new String[] {"test", "--arg2", "--arg1"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.getOpt("arg1").defs(), 1);
    assertEquals(run.getOpt("arg2").defs(), 1);
  }

  @Test
  public void parseFlag() {
    final Cmd cmd = Cmd.create("test").opt(Opt.create("arg", 'a'));
    final String[] params = new String[] {"test", "-a"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.getOpt("arg").defs(), 1);
  }

  @Test
  public void parseFlags() {
    final Cmd cmd = Cmd.create("test").opt(Opt.create("arg1", 'a')).opt(Opt.create("arg2", 'b'));
    final String[] params = new String[] {"test", "-ba"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.getOpt("arg1").defs(), 1);
    assertEquals(run.getOpt("arg2").defs(), 1);
  }

  @Test
  public void parseOptArg() {
    final Cmd cmd = Cmd.create("test").opt(Opt.create("arg").arg("value"));
    final String[] params = new String[] {"test", "--arg", "value"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.getOpt("arg").defs(), 1);
    assertEquals(run.getOpt("arg").getValue(), "value");
  }

  @Test
  public void parseFlagArg() {
    final Cmd cmd = Cmd.create("test").opt(Opt.create("arg", 'a').arg("value"));
    final String[] params = new String[] {"test", "-a", "value"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.getOpt("arg").defs(), 1);
    assertEquals(run.getOpt("arg").getValue(), "value");
  }

  @Test
  public void parseCmdArg() {
    final Cmd cmd = Cmd.create("test").arg(Arg.create("path"));
    final String[] params = new String[] {"test", "value"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.getArg(0).value(), "value");
    assertEquals(run.getValue(0), "value");
  }

  @Test
  public void testDefaultHelpCmd() {
    final Cmd cmd = Cmd.create("test")
                       .cmd(Cmd.create("data").desc("access data")
                               .cmd(Cmd.create("load").arg(Arg.create("file")).desc("load data").helpCmd())
                               .cmd(Cmd.create("store").desc("store data"))
                               .helpCmd()
                               .opt(Opt.create("help").flag('h').desc("show help"))
                               .opt(Opt.create("file").flag('f').desc("output file").arg("path"))
                               .opt(Opt.create("force").desc("overwrite existing file")))
                       .helpCmd();
    final String[] params = new String[] {"test"};
    final Cmd run = cmd.clone().parse(params);
    run.run();
  }

  @Test
  public void testHelpCmd() {
    final Cmd cmd = Cmd.create("test")
                       .cmd(Cmd.create("data").desc("access data")
                               .cmd(Cmd.create("load").arg(Arg.create("file")).desc("load data").helpCmd())
                               .cmd(Cmd.create("store").desc("store data"))
                               .helpCmd()
                               .opt(Opt.create("help").flag('h').desc("show help"))
                               .opt(Opt.create("file").flag('f').desc("output file").arg("path"))
                               .opt(Opt.create("force").desc("overwrite existing file")))
                       .helpCmd();
    final String[] params = new String[] {"test", "help"};
    final Cmd run = cmd.clone().parse(params);
    run.run();
  }

  @Test
  public void testHelpSubcmd() {
    final Cmd cmd = Cmd.create("test")
                       .cmd(Cmd.create("data").desc("access data")
                               .cmd(Cmd.create("load").arg(Arg.create("file")).desc("load data").helpCmd())
                               .cmd(Cmd.create("store").desc("store data"))
                               .helpCmd()
                               .opt(Opt.create("file").flag('f').desc("output file").arg("path"))
                               .opt(Opt.create("force").desc("overwrite existing file")))
                       .helpCmd();
    final String[] params = new String[] {"test", "data", "help"};
    final Cmd run = cmd.clone().parse(params);
    run.run();
  }

  @Test
  public void testHelpCmdArg() {
    final Cmd cmd = Cmd.create("test")
                       .cmd(Cmd.create("data").desc("access data")
                               .cmd(Cmd.create("load").arg(Arg.create("file")).desc("load data").helpCmd())
                               .cmd(Cmd.create("store").desc("store data"))
                               .helpCmd()
                               .opt(Opt.create("file").flag('f').desc("output file").arg("path"))
                               .opt(Opt.create("force").desc("overwrite existing file")))
                       .helpCmd();
    final String[] params = new String[] {"test", "data", "load", "help"};
    final Cmd run = cmd.clone().parse(params);
    run.run();
  }

}
