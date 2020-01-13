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
import {Output, Debug, Format} from "@swim/codec";
import {AnyArg, Arg} from "./Arg";

export type AnyOpt = Opt | OptInit | string;

export interface OptInit {
  name: string;
  flag?: string | null;
  desc?: string | null;
  args?: AnyArg[];
}

export class Opt implements Equals, Debug {
  /** @hidden */
  readonly _name: string;
  /** @hidden */
  _flag: string | null;
  /** @hidden */
  _desc: string | null;
  /** @hidden */
  _args: Arg[];
  /** @hidden */
  _defs: number;

  constructor(name: string, flag: string | null, desc: string | null, args: Arg[], defs: number) {
    this._name = name;
    this._flag = flag;
    this._desc = desc;
    this._args = args;
    this._defs = defs;
  }

  name(): string {
    return this._name;
  }

  flag(): string | null;
  flag(flag: string | null): this;
  flag(flag?: string | null): string | null | this {
    if (flag === void 0) {
      return this._flag;
    } else {
      this._flag = flag;
      return this;
    }
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

  args(): Arg[] {
    return this._args;
  }

  /** @hidden */
  arg(arg: AnyArg): this {
    arg = Arg.fromAny(arg);
    this._args.push(arg);
    return this;
  }

  defs(): number {
    return this._defs;
  }

  isDefined(): boolean {
    return this._defs !== 0;
  }

  getArg(index: number = 0): Arg {
    return this._args[index];
  }

  getValue(index: number = 0): string | undefined {
    const arg = this._args[index];
    return arg ? arg.value() : void 0;
  }

  parse(params: string[], paramIndex: number): number {
    const argCount = this._args.length;
    const paramCount = params.length;
    for (let argIndex = 0; argIndex < argCount && paramIndex < paramCount; argIndex += 1) {
      const arg = this._args[argIndex];
      const param = params[paramIndex];
      if (!arg._optional || param.charCodeAt(0) !== 45/*'-'*/) {
        arg.value(param);
        paramIndex += 1;
      } else {
        break;
      }
    }
    return paramIndex;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Opt) {
      return this._name === that._name && this._flag === that._flag
          && this._desc === that._desc && Objects.equal(this._args, that._args)
          && this._defs === that._defs;
    }
    return false;
  }

  debug(output: Output): void {
    output = output.write("Opt").write(46/*'.'*/).write("of").write(40/*'('*/).debug(this._name).write(41/*')'*/);
    if (this._flag !== null) {
      output = output.write(46/*'.'*/).write("flag").write(40/*'('*/).debug(this._flag).write(41/*')'*/);
    }
    if (this._desc !== null) {
      output = output.write(46/*'.'*/).write("desc").write(40/*'('*/).debug(this._desc).write(41/*')'*/);
    }
    const argCount = this._args.length;
    for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
      const arg = this._args[argIndex];
      output = output.write(46/*'.'*/).write("arg").write(40/*'('*/).debug(arg).write(41/*')'*/);
    }
  }

  toString(): string {
    return Format.debug(this);
  }

  clone(): Opt {
    const argCount = this._args.length;
    const args = new Array<Arg>(argCount);
    for (let i = 0; i < argCount; i += 1) {
      args[i] = this._args[i].clone();
    }
    return new Opt(this._name, this._flag, this._desc, args, this._defs);
  }

  static of(name: string, flag: string | null = null, desc: string | null = null, anyArgs?: AnyArg[]): Opt {
    const argCount = anyArgs ? anyArgs.length : 0;
    const args = new Array<Arg>(argCount);
    for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
      args[argIndex] = Arg.fromAny(anyArgs![argIndex]);
    }
    return new Opt(name, flag, desc, args, 0);
  }

  static fromAny(opt: AnyOpt): Opt {
    if (opt instanceof Opt) {
      return opt;
    } else if (typeof opt === "string") {
      return new Opt(opt, null, null, [], 0);
    } else {
      const flag = opt.flag !== void 0 ? opt.flag : null;
      const desc = opt.desc !== void 0 ? opt.desc : null;
      const argCount = opt.args ? opt.args.length : 0;
      const args = new Array<Arg>(argCount);
      for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
        args[argIndex] = Arg.fromAny(opt.args![argIndex]);
      }
      return new Opt(opt.name, flag, desc, args, 0);
    }
  }
}
