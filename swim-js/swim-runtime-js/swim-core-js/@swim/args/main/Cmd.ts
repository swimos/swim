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

import {Equals, Arrays} from "@swim/util";
import {Output, Debug, Format, Unicode} from "@swim/codec";
import {AnyOpt, Opt} from "./Opt";
import {AnyArg, Arg} from "./Arg";

export type ExecCmd = (this: Cmd, opts: {[name: string]: string | undefined}, args: string[]) => void;

export type AnyCmd = Cmd | CmdInit | string;

export interface CmdInit {
  id?: string;
  name: string;
  desc?: string;
  opts?: AnyOpt[];
  args?: AnyArg[];
  cmds?: AnyCmd[];
  exec?: ExecCmd | null;
}

export class Cmd implements Equals, Debug {
  constructor(id: string, name: string, desc: string | undefined, opts: Opt[],
              args: Arg[], cmds: Cmd[], exec: ExecCmd | null, base: Cmd | null) {
    Object.defineProperty(this, "id", {
      value: id,
      enumerable: true,
    });
    Object.defineProperty(this, "name", {
      value: name,
      enumerable: true,
    });
    Object.defineProperty(this, "desc", {
      value: desc,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "opts", {
      value: opts,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "args", {
      value: args,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "cmds", {
      value: cmds,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "exec", {
      value: exec,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "base", {
      value: base,
      enumerable: true,
      configurable: true,
    });
  }

  readonly id!: string;

  readonly name!: string;

  readonly desc!: string | undefined;

  withDesc(desc: string | undefined): this {
    Object.defineProperty(this, "desc", {
      value: desc,
      enumerable: true,
      configurable: true,
    });
    return this;
  }

  readonly opts!: ReadonlyArray<Opt>;

  withOpt(opt: AnyOpt): this {
    opt = Opt.fromAny(opt);
    (this.opts as Opt[]).push(opt);
    return this;
  }

  readonly args!: ReadonlyArray<Arg>;

  withArg(arg: AnyArg): this {
    arg = Arg.fromAny(arg);
    (this.args as Arg[]).push(arg as Arg);
    return this;
  }

  readonly cmds!: ReadonlyArray<Cmd>;

  withCmd(cmd: AnyCmd): this {
    cmd = Cmd.fromAny(cmd);
    (this.cmds as Cmd[]).push(cmd);
    return this;
  }

  withHelpCmd(): this {
    this.withCmd(Cmd.help());
    if (this.exec === null) {
      this.onExec(execDefaultHelpCmd);
    }
    return this;
  }

  getOpt(name: string): Opt {
    const opts = this.opts;
    for (let i = 0, n = opts.length; i < n; i += 1) {
      const opt = opts[i]!;
      if (name === opt.name) {
        return opt;
      }
    }
    throw new Error("undefined opt: " + name);
  }

  getArg(index: number = 0): Arg | null {
    const arg = this.args[index];
    return arg !== void 0 ? arg : null;
  }

  getValue(index: number = 0): string | undefined {
    const arg = this.args[index];
    return arg !== void 0 ? arg.value : void 0;
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
    const opts = this.opts;
    const optCount = opts.length;
    const args = this.args;
    const argCount = args.length;

    if (paramIndex < paramCount) {
      const cmds = this.cmds;
      const cmdCount = cmds.length;
      for (let cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
        const cmd = cmds[cmdIndex]!;
        if (params[paramIndex] === cmd.name) {
          cmd.withBase(this);
          return cmd.parse(params, paramIndex + 1);
        }
      }
    }

    let argIndex = 0;
    while (paramIndex < paramCount) {
      const param = params[paramIndex]!;
      paramIndex += 1;
      const argLength = param.length;
      if (argLength > 2 && param.charCodeAt(0) === 45/*'-'*/ && param.charCodeAt(1) === 45/*'-'*/) {
        const name = param.substring(2);
        for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
          const opt = opts[optIndex]!;
          if (name === opt.name) {
            opt.def();
            paramIndex = opt.parse(params, paramIndex);
          }
        }
      } else if (argLength > 1 && param.charCodeAt(0) === 45/*'-'*/) {
        for (let flagIndex = 1; flagIndex < argLength; flagIndex += 1) {
          const flag = param.charAt(flagIndex);
          for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
            const opt = opts[optIndex]!;
            if (flag === opt.flag) {
              opt.def();
              if (argLength === 2) {
                paramIndex = opt.parse(params, paramIndex);
              }
            }
          }
        }
      } else if (argIndex < argCount) {
        const arg = args[argIndex]!;
        arg.withValue(param);
        argIndex += 1;
      }
    }
    return this;
  }

  readonly exec!: ExecCmd | null;

  onExec(exec: ExecCmd | null): this {
    Object.defineProperty(this, "exec", {
      value: exec,
      enumerable: true,
      configurable: true,
    });
    return this;
  }

  readonly base!: Cmd | null;

  withBase(base: Cmd | null): this {
    Object.defineProperty(this, "base", {
      value: base,
      enumerable: true,
      configurable: true,
    });
    return this;
  }

  run(): void {
    if (this.exec !== null) {
      const opts: {[name: string]: string | undefined} = {};
      const args: string[] = [];
      let cmd: Cmd | null = this;
      do {
        const optCount = cmd.opts.length;
        for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
          const opt = cmd.opts[optIndex]!;
          const value = opt.getValue();
          if (value !== void 0) {
            opts[opt.name] = value;
          } else if (opt.defs) {
            opts[opt.name] = void 0;
          }
        }
        const argCount = cmd.args.length;
        for (let argIndex = argCount - 1; argIndex >= 0; argIndex -= 1) {
          const arg = cmd.args[argIndex]!;
          const argValue = arg.value;
          if (argValue !== void 0) {
            args.unshift(argValue);
          }
        }
        cmd = cmd.base;
      } while (cmd !== null);
      this.exec.call(this, opts, args);
    }
  }

  /** @hidden */
  writeFullName(output: Output): void {
    if (this.base !== null) {
      this.base.writeFullName(output);
      output.write(32/*' '*/);
    }
    output.write(this.name);
  }

  /** @hidden */
  writeHelp(output: Output): void {
    output.write("Usage: ");
    this.writeFullName(output);
    const optCount = this.opts.length;
    const argCount = this.args.length;
    const cmdCount = this.cmds.length;
    if (optCount !== 0) {
      output.write(32/*' '*/).write("[options]");
    }
    if (argCount !== 0) {
      for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
        const arg = this.args[argIndex]!;
        output.write(32/*' '*/).write(91/*'['*/).write(arg.name).write(93/*']'*/);
        if (arg.optional) {
          output.write(63/*'?'*/);
        }
      }
    } else if (cmdCount !== 0) {
      output.write(32/*' '*/).write("<command>");
    }
    output.writeln();
    if (optCount !== 0) {
      output.writeln();
      output.writeln("Options:");
      for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
        const opt = this.opts[optIndex]!;
        if (opt.flag !== void 0) {
          output.write("  -").write(opt.flag).write(", --").write(opt.name);
        } else {
          output.write("      --").write(opt.name);
        }
        let optLength = opt.name.length;
        const optArgCount = opt.args.length;
        for (let optArgIndex = 0; optArgIndex < optArgCount; optArgIndex += 1) {
          const optArg = opt.args[optArgIndex]!;
          output.write(32/*' '*/).write(60/*'<'*/).write(optArg.name).write(62/*'>'*/);
          optLength += 2 + optArg.name.length + 1;
          if (optArg.optional) {
            output.write(63/*'?'*/);
            optLength += 1;
          }
        }
        for (let i = optLength; i < 15; i += 1) {
          output.write(32/*' '*/);
        }
        if (opt.desc !== void 0) {
          output.write(32/*' '*/).write(opt.desc);
        }
        output.writeln();
      }
    }
    if (cmdCount !== 0) {
      output.writeln();
      output.writeln("Commands:");
      for (let cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
        const cmd = this.cmds[cmdIndex]!;
        output.write("  ").write(cmd.name);
        for (let i = cmd.name.length; i < 20; i += 1) {
          output.write(32/*' '*/);
        }
        if (cmd.desc !== void 0) {
          output.write("  ").write(cmd.desc);
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
      return this.id === that.id && this.name === that.name && this.desc === that.desc
          && Arrays.equal(this.opts, that.opts) && Arrays.equal(this.args, that.args)
          && Arrays.equal(this.cmds, that.cmds) && Equals(this.exec, that.exec)
          && Equals(this.base, that.base);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("Cmd").write(46/*'.'*/).write("of").write(40/*'('*/).debug(this.name).write(41/*')'*/);
    if (this.desc !== void 0) {
      output = output.write(46/*'.'*/).write("desc").write(40/*'('*/).debug(this.desc).write(41/*')'*/);
    }
    const opts = this.opts;
    for (let optIndex = 0, optCount = opts.length; optIndex < optCount; optIndex += 1) {
      const opt = opts[optIndex]!;
      output = output.write(46/*'.'*/).write("opt").write(40/*'('*/).debug(opt).write(41/*')'*/);
    }
    const args = this.args;
    for (let argIndex = 0, argCount = args.length; argIndex < argCount; argIndex += 1) {
      const arg = args[argIndex]!;
      output = output.write(46/*'.'*/).write("arg").write(40/*'('*/).debug(arg).write(41/*')'*/);
    }
    const cmds = this.cmds;
    for (let cmdIndex = 0, cmdCount = cmds.length; cmdIndex < cmdCount; cmdIndex += 1) {
      const cmd = cmds[cmdIndex];
      output = output.write(46/*'.'*/).write("cmd").write(40/*'('*/).debug(cmd).write(41/*')'*/);
    }
    if (this.exec !== null) {
      output = output.write(46/*'.'*/).write("exec").write(40/*'('*/).debug(this.exec).write(41/*')'*/);
    }
    if (this.base !== null) {
      output = output.write(46/*'.'*/).write("base").write(40/*'('*/).debug(this.base).write(41/*')'*/);
    }
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  clone(): Cmd {
    const optCount = this.opts.length;
    const opts = new Array<Opt>(optCount);
    for (let i = 0; i < optCount; i += 1) {
      opts[i] = this.opts[i]!.clone();
    }
    const argCount = this.args.length;
    const args = new Array<Arg>(argCount);
    for (let i = 0; i < argCount; i += 1) {
      args[i] = this.args[i]!.clone();
    }
    const cmdCount = this.cmds.length;
    const cmds = new Array<Cmd>(cmdCount);
    for (let i = 0; i < cmdCount; i += 1) {
      cmds[i] = this.cmds[i]!.clone();
    }
    return new Cmd(this.id, this.name, this.desc, opts, args, cmds, this.exec, this.base);
  }

  static create(id: string, name?: string, desc?: string, anyOpts?: AnyOpt[],
                anyArgs?: AnyArg[], anyCmds?: AnyCmd[], exec: ExecCmd | null = null): Cmd {
    if (name === void 0) {
      name = id;
    }
    const optCount = anyOpts !== void 0 ? anyOpts.length : 0;
    const opts = new Array<Opt>(optCount);
    for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
      opts[optIndex] = Opt.fromAny(anyOpts![optIndex]!);
    }
    const argCount = anyArgs !== void 0 ? anyArgs.length : 0;
    const args = new Array<Arg>(argCount);
    for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
      args[argIndex] = Arg.fromAny(anyArgs![argIndex]!);
    }
    const cmdCount = anyCmds !== void 0 ? anyCmds.length : 0;
    const cmds = new Array<Cmd>(cmdCount);
    for (let cmdIndex = 0; cmdIndex < cmdCount; cmdIndex += 1) {
      cmds[cmdIndex] = Cmd.fromAny(anyCmds![cmdIndex]!);
    }
    return new Cmd(id, name, desc, opts, args, cmds, exec, null);
  }

  static fromInit(init: CmdInit): Cmd {
    const id = init.id !== void 0 ? init.id : init.name;
    const optCount = init.opts !== void 0 ? init.opts.length : 0;
    const opts = new Array<Opt>(optCount);
    for (let optIndex = 0; optIndex < optCount; optIndex += 1) {
      opts[optIndex] = Opt.fromAny(init.opts![optIndex]!);
    }
    const argCount = init.args !== void 0 ? init.args.length : 0;
    const args = new Array<Arg>(argCount);
    for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
      args[argIndex] = Arg.fromAny(init.args![argIndex]!);
    }
    const cmdCount = init.cmds !== void 0 ? init.cmds.length : 0;
    const cmds = new Array<Cmd>(cmdCount);
    for (let initIndex = 0; initIndex < cmdCount; initIndex += 1) {
      cmds[initIndex] = Cmd.fromAny(init.cmds![initIndex]!);
    }
    const exec = init.exec !== void 0 ? init.exec : null;
    return new Cmd(id, init.name, init.desc, opts, args, cmds, exec, null);
  }

  static fromAny(value: AnyCmd): Cmd {
    if (value instanceof Cmd) {
      return value;
    } else if (typeof value === "string") {
      return new Cmd(value, value, void 0, [], [], [], null, null);
    } else if (typeof value === "object" && value !== null) {
      return Cmd.fromInit(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static help(): Cmd {
    return Cmd.create("help").onExec(execHelpCmd);
  }
}

function execHelpCmd(this: Cmd, args: {[name: string]: string | undefined}) {
  if (this.base !== null) {
    console.log(this.base.toHelp());
  }
}

function execDefaultHelpCmd(this: Cmd, args: {[name: string]: string | undefined}) {
  console.log(this.toHelp());
}
