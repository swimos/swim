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

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.Unicode;
import swim.collections.FingerTrieSeq;
import swim.util.Murmur3;

public class Cmd implements Cloneable, Debug {
  final String id;
  final String name;
  String desc;
  FingerTrieSeq<Opt> opts;
  FingerTrieSeq<Cmd> cmds;
  ExecCmd exec;
  Cmd base;

  public Cmd(String id, String name, String desc, FingerTrieSeq<Opt> opts,
             FingerTrieSeq<Cmd> cmds, ExecCmd exec, Cmd base) {
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.opts = opts;
    this.cmds = cmds;
    this.exec = exec;
    this.base = base;
  }

  public Cmd base() {
    return this.base;
  }

  public String id() {
    return this.id;
  }

  public String name() {
    return this.name;
  }

  public String desc() {
    return this.desc;
  }

  public Cmd desc(String desc) {
    this.desc = desc;
    return this;
  }

  public FingerTrieSeq<Opt> opts() {
    return this.opts;
  }

  public Cmd opt(Opt opt) {
    this.opts = this.opts.appended(opt);
    return this;
  }

  public Cmd opt(String opt) {
    return opt(Opt.of(opt));
  }

  public FingerTrieSeq<Cmd> cmds() {
    return this.cmds;
  }

  public Cmd cmd(Cmd cmd) {
    this.cmds = this.cmds.appended(cmd);
    return this;
  }

  public Cmd cmd(String cmd) {
    return cmd(Cmd.of(cmd));
  }

  public Opt getOpt(String name) {
    for (int i = 0, n = this.opts.size(); i < n; i += 1) {
      final Opt opt = this.opts.get(i);
      if (name.equals(opt.name)) {
        return opt;
      }
    }
    throw new IllegalArgumentException("undefined opt: " + name);
  }

  public Cmd parse(String[] params) {
    return parse(params, 1);
  }

  public Cmd parse(String[] params, int paramIndex) {
    final int paramCount = params.length;
    final int optCount = this.opts.size();
    final int cmdCount = this.cmds.size();

    while (paramIndex < paramCount) {
      final String param = params[paramIndex];
      for (int cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
        final Cmd cmd = this.cmds.get(cmdIndex);
        if (param.equals(cmd.name)) {
          final Cmd subCmd = cmd;
          subCmd.base = this;
          return subCmd.parse(params, paramIndex + 1);
        }
      }
      paramIndex += 1;
      final int argLength = param.length();
      if (argLength > 2 && param.charAt(0) == '-' && param.charAt(1) == '-') {
        final String name = param.substring(2);
        for (int optIndex = 0; optIndex < optCount; optIndex += 1) {
          final Opt opt = this.opts.get(optIndex);
          if (name.equals(opt.name)) {
            opt.defs += 1;
            paramIndex = opt.parse(params, paramIndex);
          }
        }
      } else if (argLength > 1 && param.charAt(0) == '-') {
        for (int flagIndex = 1; flagIndex < argLength; flagIndex += 1) {
          final char flag = param.charAt(flagIndex);
          for (int optIndex = 0; optIndex < optCount; optIndex += 1) {
            final Opt opt = this.opts.get(optIndex);
            if (flag == opt.flag) {
              opt.defs += 1;
              if (argLength == 2) {
                paramIndex = opt.parse(params, paramIndex);
              }
            }
          }
        }
      }
    }
    return this;
  }

  public ExecCmd exec() {
    return this.exec;
  }

  public Cmd exec(ExecCmd exec) {
    this.exec = exec;
    return this;
  }

  public void run() {
    if (this.exec != null) {
      this.exec.exec(this);
    }
  }

  public Cmd helpCmd() {
    return this.cmd(Cmd.help());
  }

  public void writeFullName(Output<String> output) {
    if (this.base != null) {
      this.base.writeFullName(output);
      output.write(' ');
    }
    output.write(this.name);
  }

  public void writeHelp(Output<String> output) {
    output.write("Usage: ");
    this.writeFullName(output);
    final int optCount = this.opts.size();
    if (optCount != 0) {
      output.write(" [options]");
    }
    final int cmdCount = this.cmds.size();
    if (cmdCount != 0) {
      output.write(" <command>");
    }
    output.writeln();
    if (optCount != 0) {
      output.writeln();
      output.writeln("Options:");
      for (int optIndex = 0; optIndex < optCount; optIndex += 1) {
        final Opt opt = this.opts.get(optIndex);
        if (opt.flag != 0) {
          output.write("  -").write(opt.flag).write(", --").write(opt.name);
        } else {
          output.write("      --").write(opt.name);
        }
        int optLength = opt.name.length();
        final int argCount = opt.args.size();
        for (int argIndex = 0; argIndex < argCount; argIndex += 1) {
          final Arg arg = opt.args.get(argIndex);
          output.write(' ').write('<').write(arg.name).write('>');
          optLength += 2 + arg.name.length() + 1;
          if (arg.optional) {
            output.write('?');
            optLength += 1;
          }
        }
        for (int i = optLength; i < 15; i += 1) {
          output.write(' ');
        }
        if (opt.desc != null) {
          output.write(' ').write(opt.desc);
        }
        output.writeln();
      }
    }
    if (cmdCount != 0) {
      output.writeln();
      output.writeln("Commands:");
      for (int cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
        final Cmd cmd = this.cmds.get(cmdIndex);
        output.write("  ").write(cmd.name);
        for (int i = cmd.name.length(); i < 20; i += 1) {
          output.write(' ');
        }
        if (cmd.desc != null) {
          output.write("  ").write(cmd.desc);
        }
        output.writeln();
      }
    }
  }

  public String toHelp() {
    final Output<String> output = Unicode.stringOutput();
    this.writeHelp(output);
    return output.bind();
  }

  public boolean canEqual(Object other) {
    return other instanceof Cmd;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Cmd) {
      final Cmd that = (Cmd) other;
      return that.canEqual(this) && this.id.equals(that.id) && this.name.equals(that.name)
          && (this.desc == null ? that.desc == null : this.desc.equals(that.desc))
          && this.opts.equals(that.opts) && this.cmds.equals(that.cmds)
          && (this.exec == null ? that.exec == null : this.exec.equals(that.exec));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Cmd.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        hashSeed, this.id.hashCode()), this.name.hashCode()), Murmur3.hash(this.desc)),
        opts.hashCode()), cmds.hashCode()), Murmur3.hash(this.exec)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Cmd").write('.').write("of").write('(').debug(this.name).write(')');
    if (this.desc != null) {
      output = output.write('.').write("flag").write('(').debug(this.desc).write(')');
    }
    final int optCount = this.opts.size();
    for (int optIndex = 0; optIndex < optCount; optIndex += 1) {
      final Opt opt = this.opts.get(optIndex);
      output = output.write('.').write("opt").write('(').debug(opt).write(')');
    }
    final int cmdCount = this.cmds.size();
    for (int cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
      final Cmd cmd = this.cmds.get(cmdIndex);
      output = output.write('.').write("cmd").write('(').debug(cmd).write(')');
    }
    if (this.exec != null) {
      output = output.write('.').write("exec").write('(').debug(this.exec).write(')');
    }
    if (this.base != null) {
      output = output.write('.').write("base").write('(').debug(this.base).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  @Override
  public Cmd clone() {
    final int optCount = this.opts.size();
    FingerTrieSeq<Opt> opts = FingerTrieSeq.empty();
    for (int i = 0; i < optCount; i += 1) {
      opts = opts.appended(this.opts.get(i).clone());
    }
    final int cmdCount = this.cmds.size();
    FingerTrieSeq<Cmd> cmds = FingerTrieSeq.empty();
    for (int i = 0; i < cmdCount; i += 1) {
      cmds = cmds.appended(this.cmds.get(i).clone());
    }
    return new Cmd(this.id, this.name, this.desc, opts, cmds, this.exec, this.base);
  }

  private static int hashSeed;

  public static Cmd of(String id, String name) {
    return new Cmd(id, name, null, FingerTrieSeq.empty(), FingerTrieSeq.empty(), null, null);
  }

  public static Cmd of(String id) {
    return new Cmd(id, id, null, FingerTrieSeq.empty(), FingerTrieSeq.empty(), null, null);
  }

  public static Cmd help() {
    return new Cmd("help", "help", null, FingerTrieSeq.empty(), FingerTrieSeq.empty(), new ExecHelpCmd(), null);
  }
}

final class ExecHelpCmd implements ExecCmd {
  @Override
  public void exec(Cmd cmd) {
    if (cmd.base != null) {
      System.out.println(cmd.base.toHelp());
    }
  }
}
