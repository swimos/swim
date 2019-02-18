// Copyright 2015-2019 SWIM.AI inc.
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
    final Cmd cmd = Cmd.of("test").cmd("exec");
    final String[] str = new String[] {"test"};
    final Cmd run = cmd.clone().parse(str);
    assertEquals(run.name(), "test");
  }

  @Test
  public void parseSubcmd() {
    final Cmd cmd = Cmd.of("test").cmd("exec");
    final String[] params = new String[] {"test", "exec"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.name(), "exec");
  }

  @Test
  public void parseOpt() {
    final Cmd cmd = Cmd.of("test").opt("arg");
    final String[] params = new String[] {"test", "--arg"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.getOpt("arg").defs(), 1);
  }

  @Test
  public void parseOpts() {
    final Cmd cmd = Cmd.of("test").opt("arg1").opt("arg2");
    final String[] params = new String[] {"test", "--arg2", "--arg1"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.getOpt("arg1").defs(), 1);
    assertEquals(run.getOpt("arg2").defs(), 1);
  }

  @Test
  public void parseFlag() {
    final Cmd cmd = Cmd.of("test").opt(Opt.of("arg", 'a'));
    final String[] params = new String[] {"test", "-a"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.getOpt("arg").defs(), 1);
  }

  @Test
  public void parseFlags() {
    final Cmd cmd = Cmd.of("test").opt(Opt.of("arg1", 'a')).opt(Opt.of("arg2", 'b'));
    final String[] params = new String[] {"test", "-ba"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.getOpt("arg1").defs(), 1);
    assertEquals(run.getOpt("arg2").defs(), 1);
  }

  @Test
  public void parseOptArg() {
    final Cmd cmd = Cmd.of("test").opt(Opt.of("arg").arg("value"));
    final String[] params = new String[] {"test", "--arg", "value"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.getOpt("arg").defs(), 1);
    assertEquals(run.getOpt("arg").getValue(), "value");
  }

  @Test
  public void parseFlagArg() {
    final Cmd cmd = Cmd.of("test").opt(Opt.of("arg", 'a').arg("value"));
    final String[] params = new String[] {"test", "-a", "value"};
    final Cmd run = cmd.clone().parse(params);
    assertEquals(run.getOpt("arg").defs(), 1);
    assertEquals(run.getOpt("arg").getValue(), "value");
  }

  @Test
  public void testHelpCmd() {
    final Cmd cmd = Cmd.of("test")
        .cmd(Cmd.of("data").desc("access data")
            .cmd(Cmd.of("load").desc("load data"))
            .cmd(Cmd.of("store").desc("store data"))
            .helpCmd()
            .opt(Opt.of("help").flag('h').desc("show help"))
            .opt(Opt.of("file").flag('f').desc("output file").arg("path"))
            .opt(Opt.of("force").desc("overwrite existing file")))
        .helpCmd();
    final String[] params = new String[] {"test", "help"};
    final Cmd run = cmd.clone().parse(params);
    run.run();
  }

  @Test
  public void testHelpSubcmd() {
    final Cmd cmd = Cmd.of("test")
        .cmd(Cmd.of("data").desc("access data")
            .cmd(Cmd.of("load").desc("load data"))
            .cmd(Cmd.of("store").desc("store data"))
            .helpCmd()
            .opt(Opt.of("file").flag('f').desc("output file").arg("path"))
            .opt(Opt.of("force").desc("overwrite existing file")))
        .helpCmd();
    final String[] params = new String[] {"test", "data", "help"};
    final Cmd run = cmd.clone().parse(params);
    run.run();
  }
}
