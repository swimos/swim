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

import {Equals, Objects} from "@swim/util";
import {Output, Debug, Format, Unicode} from "@swim/codec";
import {AnyOpt, Opt} from "./Opt";

export type ExecCmd = (this: Cmd, opts: {[name: string]: string | null | undefined}) => void;

export type AnyCmd = Cmd | CmdInit | string;

export interface CmdInit {
  id?: string;
  name: string;
  desc?: string | null;
  opts?: AnyOpt[];
  cmds?: AnyCmd[];
  exec?: ExecCmd | null;
}

export class Cmd implements Equals, Debug {
  /** @hidden */
  readonly _id: string;
  /** @hidden */
  readonly _name: string;
  /** @hidden */
  _desc: string | null;
  /** @hidden */
  _opts: Opt[];
  /** @hidden */
  _cmds: Cmd[];
  /** @hidden */
  _exec: ExecCmd | null;
  /** @hidden */
  _base: Cmd | undefined;

  constructor(id: string, name: string, desc: string | null,
              opts: Opt[], cmds: Cmd[], exec: ExecCmd | null,
              base: Cmd | undefined) {
    this._id = id;
    this._name = name;
    this._desc = desc;
    this._opts = opts;
    this._cmds = cmds;
    this._exec = exec;
    this._base = base;
  }

  base(): Cmd | undefined {
    return this._base;
  }

  id(): string {
    return this._id;
  }

  name(): string {
    return this._name;
  }

  desc(): string | null;
  desc(desc: string | null): this;
  desc(desc?: string | null): string | null | this {
    if (desc === void 0) {
      return this._desc;
    } else {
      this._desc = desc;
      return this;
    }
  }

  opts(): Opt[] {
    return this._opts;
  }

  opt(opt: AnyOpt): this {
    opt = Opt.fromAny(opt);
    this._opts.push(opt);
    return this;
  }

  cmds(): Cmd[] {
    return this._cmds;
  }

  cmd(cmd: AnyCmd): this {
    cmd = Cmd.fromAny(cmd);
    this._cmds.push(cmd);
    return this;
  }

  helpCmd(): this {
    return this.cmd(Cmd.help());
  }

  getOpt(name: string): Opt {
    for (let i = 0, n = this._opts.length; i < n; i += 1) {
      const opt = this._opts[i];
      if (name === opt._name) {
        return opt;
      }
    }
    throw new Error("undefined opt: " + name);
  }

  parse(params?: string[], paramIndex: number = 1): Cmd {
    if (params === void 0) {
      params = process.argv;
    }
    const paramCount = params.length;
    const optCount = this._opts.length;
    const cmdCount = this._cmds.length;
    while (paramIndex < paramCount) {
      const param = params[paramIndex];
      for (let cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
        const cmd = this._cmds[cmdIndex];
        if (param === cmd._name) {
          const subcmd = cmd;
          subcmd._base = this;
          return subcmd.parse(params, paramIndex + 1);
        }
      }
      paramIndex += 1;
      const argLength = param.length;
      if (argLength > 2 && param.charCodeAt(0) === 45/*'-'*/ && param.charCodeAt(1) === 45/*'-'*/) {
        const name = param.substring(2);
        for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
          const opt = this._opts[optIndex];
          if (name === opt._name) {
            opt._defs += 1;
            paramIndex = opt.parse(params, paramIndex);
          }
        }
      } else if (argLength > 1 && param.charCodeAt(0) === 45/*'-'*/) {
        for (let flagIndex = 1; flagIndex < argLength; flagIndex += 1) {
          const flag = param.charAt(flagIndex);
          for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
            const opt = this._opts[optIndex];
            if (flag === opt._flag) {
              opt._defs += 1;
              if (argLength === 2) {
                paramIndex = opt.parse(params, paramIndex);
              }
            }
          }
        }
      }
    }
    return this;
  }

  exec(): ExecCmd | null;
  exec(exec: ExecCmd | null): this;
  exec(exec?: ExecCmd | null): ExecCmd | null | this {
    if (exec === void 0) {
      return this._exec;
    } else {
      this._exec = exec;
      return this;
    }
  }

  run(): void {
    if (this._exec) {
      const opts = {} as {[name: string]: string | null | undefined};
      let cmd: Cmd | undefined = this;
      do {
        const optCount = cmd._opts.length;
        for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
          const opt = cmd._opts[optIndex];
          const value = opt.getValue();
          if (value !== void 0) {
            opts[opt._name] = value;
          } else if (opt.defs()) {
            opts[opt._name] = null;
          }
        }
        cmd = cmd._base;
      } while (cmd);
      this._exec.call(this, opts);
    }
  }

  /** @hidden */
  writeFullName(output: Output): void {
    if (this._base) {
      this._base.writeFullName(output);
      output.write(32/*' '*/);
    }
    output.write(this._name);
  }

  /** @hidden */
  writeHelp(output: Output): void {
    output.write("Usage: ");
    this.writeFullName(output);
    const optCount = this._opts.length;
    if (optCount) {
      output.write(" [options]");
    }
    const cmdCount = this._cmds.length;
    if (cmdCount) {
      output.write(" <command>");
    }
    output.writeln();
    if (optCount) {
      output.writeln();
      output.writeln("Options:");
      for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
        const opt = this._opts[optIndex];
        if (opt._flag) {
          output.write("  -").write(opt._flag).write(", --").write(opt._name);
        } else {
          output.write("      --").write(opt._name);
        }
        let optLength = opt._name.length;
        const argCount = opt._args.length;
        for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
          const arg = opt._args[argIndex];
          output.write(32/*' '*/).write(60/*'<'*/).write(arg._name).write(62/*'>'*/);
          optLength += 2 + arg._name.length + 1;
          if (arg._optional) {
            output.write(63/*'?'*/);
            optLength += 1;
          }
        }
        for (let i = optLength; i < 15; i += 1) {
          output.write(32/*' '*/);
        }
        if (opt._desc) {
          output.write(32/*' '*/).write(opt._desc);
        }
        output.writeln();
      }
    }
    if (cmdCount) {
      output.writeln();
      output.writeln("Commands:");
      for (let cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
        const cmd = this._cmds[cmdIndex];
        output.write("  ").write(cmd._name);
        for (let i = cmd._name.length; i < 20; i += 1) {
          output.write(32/*' '*/);
        }
        if (cmd._desc) {
          output.write("  ").write(cmd._desc);
        }
        output.writeln();
      }
    }
  }

  toHelp(): string {
    const output = Unicode.stringOutput();
    this.writeHelp(output);
    return output.bind();
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Cmd) {
      return this._id === that._id && this._name === that._name && this._desc === that._desc
          && Objects.equal(this._opts, that._opts) && Objects.equal(this._cmds, that._cmds)
          && Objects.equal(this._exec, that._exec) && Objects.equal(this._base, that._base);
    }
    return false;
  }

  debug(output: Output): void {
    output = output.write("Cmd").write(46/*'.'*/).write("of").write(40/*'('*/).debug(this._name).write(41/*')'*/);
    if (this._desc !== null) {
      output = output.write(46/*'.'*/).write("desc").write(40/*'('*/).debug(this._desc).write(41/*')'*/);
    }
    const optCount = this._opts.length;
    for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
      const opt = this._opts[optIndex];
      output = output.write(46/*'.'*/).write("opt").write(40/*'('*/).debug(opt).write(41/*')'*/);
    }
    const cmdCount = this._cmds.length;
    for (let cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
      const cmd = this._cmds[cmdIndex];
      output = output.write(46/*'.'*/).write("cmd").write(40/*'('*/).debug(cmd).write(41/*')'*/);
    }
    if (this._exec !== null) {
      output = output.write(46/*'.'*/).write("exec").write(40/*'('*/).debug(this._exec).write(41/*')'*/);
    }
    if (this._base !== null) {
      output = output.write(46/*'.'*/).write("base").write(40/*'('*/).debug(this._base).write(41/*')'*/);
    }
  }

  toString(): string {
    return Format.debug(this);
  }

  clone(): Cmd {
    const optCount = this._opts.length;
    const opts = new Array<Opt>(optCount);
    for (let i = 0; i < optCount; i += 1) {
      opts[i] = this._opts[i].clone();
    }
    const cmdCount = this._cmds.length;
    const cmds = new Array<Cmd>(cmdCount);
    for (let i = 0; i < cmdCount; i += 1) {
      cmds[i] = this._cmds[i].clone();
    }
    return new Cmd(this._id, this._name, this._desc, opts, cmds, this._exec, this._base);
  }

  static of(id: string, name: string = id, desc: string | null = null,
            anyOpts?: AnyOpt[], anyCmds?: AnyCmd[], exec: ExecCmd | null = null): Cmd {
    const optCount = anyOpts ? anyOpts.length : 0;
    const opts = new Array<Opt>(optCount);
    for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
      opts[optIndex] = Opt.fromAny(anyOpts![optIndex]);
    }
    const cmdCount = anyCmds ? anyCmds.length : 0;
    const cmds = new Array<Cmd>(cmdCount);
    for (let cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
      cmds[cmdIndex] = Cmd.fromAny(anyCmds![cmdIndex]);
    }
    return new Cmd(id, name, desc, opts, cmds, exec, void 0);
  }

  static fromAny(cmd: AnyCmd): Cmd {
    if (cmd instanceof Cmd) {
      return cmd;
    } else if (typeof cmd === "string") {
      return new Cmd(cmd, cmd, null, [], [], null, void 0);
    } else {
      const id = cmd.id !== void 0 ? cmd.id : cmd.name;
      const desc = cmd.desc !== void 0 ? cmd.desc : null;
      const optCount = cmd.opts ? cmd.opts.length : 0;
      const opts = new Array<Opt>(optCount);
      for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
        opts[optIndex] = Opt.fromAny(cmd.opts![optIndex]);
      }
      const cmdCount = cmd.cmds ? cmd.cmds.length : 0;
      const cmds = new Array<Cmd>(cmdCount);
      for (let cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
        cmds[cmdIndex] = Cmd.fromAny(cmd.cmds![cmdIndex]);
      }
      const exec = cmd.exec !== void 0 ? cmd.exec : null;
      return new Cmd(id, cmd.name, desc, opts, cmds, exec, void 0);
    }
  }

  static help(): Cmd {
    return Cmd.of("help").exec(function (this: Cmd, args: {[name: string]: string}) {
      if (this._base) {
        console.log(this._base.toHelp());
      }
    });
  }
}
