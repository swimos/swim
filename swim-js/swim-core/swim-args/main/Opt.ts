// Copyright 2015-2024 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import type {Mutable} from "@swim/util";
import type {Equals} from "@swim/util";
import {Arrays} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {ArgLike} from "./Arg";
import {Arg} from "./Arg";

/** @public */
export type OptLike = Opt | OptInit | string;

/** @public */
export interface OptInit {
  /** @internal */
  readonly typeid?: "OptInit";
  name: string;
  flag?: string;
  desc?: string;
  args?: ArgLike[];
}

/** @public */
export class Opt implements Equals, Debug {
  constructor(name: string, flag: string | undefined, desc: string | undefined,
              args: readonly Arg[], defs: number) {
    this.name = name;
    this.flag = flag;
    this.desc = desc;
    this.args = args;
    this.defs = defs;
  }

  /** @internal */
  declare readonly typeid?: "Opt";

  readonly name: string;

  readonly flag: string | undefined;

  withFlag(flag: string | undefined): this {
    (this as Mutable<this>).flag = flag;
    return this;
  }

  readonly desc: string | undefined;

  withDesc(desc: string | undefined): this {
    (this as Mutable<this>).desc = desc;
    return this;
  }

  readonly args: readonly Arg[];

  /** @internal */
  withArg(arg: ArgLike): this {
    arg = Arg.fromLike(arg);
    (this.args as Arg[]).push(arg);
    return this;
  }

  readonly defs: number;

  def(): this {
    (this as Mutable<this>).defs += 1;
    return this;
  }

  isDefined(): boolean {
    return this.defs !== 0;
  }

  getArg(index: number = 0): Arg | null {
    const arg = this.args[index];
    return arg !== void 0 ? arg : null;
  }

  getValue(index: number = 0): string | undefined {
    const arg = this.args[index];
    return arg !== void 0 ? arg.value : void 0;
  }

  parse(params: string[], paramIndex: number): number {
    const args = this.args;
    const argCount = args.length;
    const paramCount = params.length;
    for (let argIndex = 0; argIndex < argCount && paramIndex < paramCount; argIndex += 1) {
      const arg = args[argIndex]!;
      const param = params[paramIndex]!;
      if (arg.optional && param.charCodeAt(0) === 45/*'-'*/) {
        break;
      }
      arg.withValue(param);
      paramIndex += 1;
    }
    return paramIndex;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Opt) {
      return this.name === that.name && this.flag === that.flag
          && this.desc === that.desc && Arrays.equal(this.args, that.args)
          && this.defs === that.defs;
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("Opt").write(46/*'.'*/).write("of").write(40/*'('*/).debug(this.name).write(41/*')'*/);
    if (this.flag !== void 0) {
      output = output.write(46/*'.'*/).write("flag").write(40/*'('*/).debug(this.flag).write(41/*')'*/);
    }
    if (this.desc !== void 0) {
      output = output.write(46/*'.'*/).write("desc").write(40/*'('*/).debug(this.desc).write(41/*')'*/);
    }
    const args = this.args;
    for (let argIndex = 0; argIndex < args.length; argIndex += 1) {
      const arg = args[argIndex]!;
      output = output.write(46/*'.'*/).write("arg").write(40/*'('*/).debug(arg).write(41/*')'*/);
    }
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  clone(): Opt {
    const oldArgs = this.args;
    const argCount = oldArgs.length;
    const newArgs = new Array<Arg>(argCount);
    for (let i = 0; i < argCount; i += 1) {
      newArgs[i] = oldArgs[i]!.clone();
    }
    return new Opt(this.name, this.flag, this.desc, newArgs, this.defs);
  }

  static create(name: string, flag?: string, desc?: string, anyArgs?: ArgLike[]): Opt {
    const argCount = anyArgs !== void 0 ? anyArgs.length : 0;
    const args = new Array<Arg>(argCount);
    for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
      args[argIndex] = Arg.fromLike(anyArgs![argIndex]!);
    }
    return new Opt(name, flag, desc, args, 0);
  }

  static fromLike<T extends OptLike | null | undefined>(value: T): Opt | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Opt) {
      return value as Opt | Uninitable<T>;
    } else if (typeof value === "string") {
      return new Opt(value, void 0, void 0, [], 0);
    } else if (typeof value === "object") {
      return Opt.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: OptInit): Opt {
    const argCount = init.args !== void 0 ? init.args.length : 0;
    const args = new Array<Arg>(argCount);
    for (let argIndex = 0; argIndex < argCount; argIndex += 1) {
      args[argIndex] = Arg.fromLike(init.args![argIndex]!);
    }
    return new Opt(init.name, init.flag, init.desc, args, 0);
  }
}
