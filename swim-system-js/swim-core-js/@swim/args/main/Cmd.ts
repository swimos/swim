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

import {Equals, Objects} from "@swim/util";
import {Output, Debug, Format, Unicode} from "@swim/codec";
import {AnyOpt, Opt} from "./Opt";
import {AnyArg, Arg} from "./Arg";

export type ExecCmd = (this: Cmd, opts: {[name: string]: string | null | undefined}, args: string[]) => void;

export type AnyCmd = Cmd | CmdInit | string;

export interface CmdInit {
  id?: string;
  name: string;
  desc?: string | null;
  opts?: AnyOpt[];
  args?: AnyArg[];
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
  _args: Arg[];
  /** @hidden */
  _cmds: Cmd[];
  /** @hidden */
  _exec: ExecCmd | null;
  /** @hidden */
  _base: Cmd | undefined;

  constructor(id: string, name: string, desc: string | null, opts: Opt[],
              args: Arg[], cmds: Cmd[], exec: ExecCmd | null, base: Cmd | undefined) {
    this._id = id;
    this._name = name;
    this._desc = desc;
    this._opts = opts;
    this._args = args;
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

  args(): Arg[] {
    return this._args;
  }

  /** @hidden */
  arg(arg: AnyArg): this {
    arg = Arg.fromAny(arg);
    this._args.push(arg);
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
    const cmd = this.cmd(Cmd.help());
    if (cmd._exec === null) {
      cmd._exec = execDefaultHelpCmd;
    }
    return cmd;
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

  getArg(index: number = 0): Arg {
    return this._args[index];
  }

  getValue(index: number = 0): string | undefined {
    const arg = this._args[index];
    return arg ? arg.value() : void 0;
  }

  parse(params?: string[], paramIndex?: number): Cmd {
    if (params === void 0) {
      params = process.argv;
      if (paramIndex === void 0) {
        paramIndex = 2;
      }
    } else if (paramIndex === void 0) {
      paramIndex = 1;
    }
    const paramCount = params.length;
    const optCount = this._opts.length;
    const argCount = this._args.length;

    if (paramIndex < paramCount) {
      const cmdCount = this._cmds.length;
      for (let cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
        const cmd = this._cmds[cmdIndex];
        if (params[paramIndex] === cmd._name) {
          cmd._base = this;
          return cmd.parse(params, paramIndex + 1);
        }
      }
    }

    let argIndex = 0;
    while (paramIndex < paramCount) {
      const param = params[paramIndex];
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
      } else if (argIndex < argCount) {
        const arg = this._args[argIndex];
        arg.value(param);
        argIndex += 1;
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
      const args = [] as string[];
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
        const argCount = cmd._args.length;
        for (let argIndex = argCount - 1; argIndex >= 0; argIndex -= 1) {
          const arg = cmd._args[argIndex];
          const argValue = arg.value();
          if (argValue !== void 0) {
            args.unshift(argValue);
          }
        }
        cmd = cmd._base;
      } while (cmd);
      this._exec.call(this, opts, args);
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
    const argCount = this._args.length;
    const cmdCount = this._cmds.length;
    if (optCount) {
      output.write(32/*' '*/).write("[options]");
    }
    if (argCount) {
      for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
        const arg = this._args[argIndex];
        output.write(32/*' '*/).write(91/*'['*/).write(arg._name).write(93/*']'*/);
        if (arg._optional) {
          output.write(63/*'?'*/);
        }
      }
    } else if (cmdCount) {
      output.write(32/*' '*/).write("<command>");
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
        const optArgCount = opt._args.length;
        for (let optArgIndex = 0; optArgIndex < optArgCount; optArgIndex += 1) {
          const optArg = opt._args[optArgIndex];
          output.write(32/*' '*/).write(60/*'<'*/).write(optArg._name).write(62/*'>'*/);
          optLength += 2 + optArg._name.length + 1;
          if (optArg._optional) {
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
          && Objects.equal(this._opts, that._opts) && Objects.equal(this._args, that._args)
          && Objects.equal(this._cmds, that._cmds) && Objects.equal(this._exec, that._exec)
          && Objects.equal(this._base, that._base);
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
    const argCount = this._args.length;
    for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
      const arg = this._args[argIndex];
      output = output.write(46/*'.'*/).write("arg").write(40/*'('*/).debug(arg).write(41/*')'*/);
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
    const argCount = this._args.length;
    const args = new Array<Arg>(argCount);
    for (let i = 0; i < argCount; i += 1) {
      args[i] = this._args[i].clone();
    }
    const cmdCount = this._cmds.length;
    const cmds = new Array<Cmd>(cmdCount);
    for (let i = 0; i < cmdCount; i += 1) {
      cmds[i] = this._cmds[i].clone();
    }
    return new Cmd(this._id, this._name, this._desc, opts, args, cmds, this._exec, this._base);
  }

  static of(id: string, name: string = id, desc: string | null = null,
            anyOpts?: AnyOpt[], anyArgs?: AnyArg[], anyCmds?: AnyCmd[],
            exec: ExecCmd | null = null): Cmd {
    const optCount = anyOpts ? anyOpts.length : 0;
    const opts = new Array<Opt>(optCount);
    for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
      opts[optIndex] = Opt.fromAny(anyOpts![optIndex]);
    }
    const argCount = anyArgs ? anyArgs.length : 0;
    const args = new Array<Arg>(argCount);
    for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
      args[argIndex] = Arg.fromAny(anyArgs![argIndex]);
    }
    const cmdCount = anyCmds ? anyCmds.length : 0;
    const cmds = new Array<Cmd>(cmdCount);
    for (let cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
      cmds[cmdIndex] = Cmd.fromAny(anyCmds![cmdIndex]);
    }
    return new Cmd(id, name, desc, opts, args, cmds, exec, void 0);
  }

  static fromAny(cmd: AnyCmd): Cmd {
    if (cmd instanceof Cmd) {
      return cmd;
    } else if (typeof cmd === "string") {
      return new Cmd(cmd, cmd, null, [], [], [], null, void 0);
    } else {
      const id = cmd.id !== void 0 ? cmd.id : cmd.name;
      const desc = cmd.desc !== void 0 ? cmd.desc : null;
      const optCount = cmd.opts ? cmd.opts.length : 0;
      const opts = new Array<Opt>(optCount);
      for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
        opts[optIndex] = Opt.fromAny(cmd.opts![optIndex]);
      }
      const argCount = cmd.args ? cmd.args.length : 0;
      const args = new Array<Arg>(argCount);
      for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
        args[argIndex] = Arg.fromAny(cmd.args![argIndex]);
      }
      const cmdCount = cmd.cmds ? cmd.cmds.length : 0;
      const cmds = new Array<Cmd>(cmdCount);
      for (let cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
        cmds[cmdIndex] = Cmd.fromAny(cmd.cmds![cmdIndex]);
      }
      const exec = cmd.exec !== void 0 ? cmd.exec : null;
      return new Cmd(id, cmd.name, desc, opts, args, cmds, exec, void 0);
    }
  }

  static help(): Cmd {
    return Cmd.of("help").exec(execHelpCmd);
  }
}

function execHelpCmd(this: Cmd, args: {[name: string]: string}) {
  if (this._base) {
    console.log(this._base.toHelp());
  }
}

function execDefaultHelpCmd(this: Cmd, args: {[name: string]: string}) {
  console.log(this.toHelp());
}
