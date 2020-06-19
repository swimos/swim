// Copyright 2015-2020 Swim inc.
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

import {HashCode, Murmur3, Objects} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";

export type AnyArg = Arg | ArgInit | string;

export interface ArgInit {
  readonly name: string;
  readonly value?: string;
  readonly optional: boolean;
}

export class Arg implements HashCode, Debug {
  /** @hidden */
  readonly _name: string;
  /** @hidden */
  _value: string | undefined;
  /** @hidden */
  _optional: boolean;

  constructor(name: string, value: string | undefined, optional: boolean) {
    this._name = name;
    this._value = value;
    this._optional = optional;
  }

  name(): string {
    return this._name;
  }

  value(): string | undefined;
  value(value: string | undefined): this;
  value(value?: string | undefined): string | undefined | this {
    if (arguments.length === 0) {
      return this._value;
    } else {
      this._value = value;
      return this;
    }
  }

  optional(): boolean;
  optional(optional: boolean): this;
  optional(optional?: boolean): boolean | this {
    if (optional === void 0) {
      return this._optional;
    } else {
      this._optional = optional;
      return this;
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Arg) {
      return this._name === that._name && Objects.equal(this._value, that._value)
          && this._optional === that._optional;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.seed(Arg),
        Murmur3.hash(this._name)), Murmur3.hash(this._value as any)), Murmur3.hash(this._optional)));
  }

  debug(output: Output): void {
    output = output.write("Arg").write(46/*'.'*/).write("of").write(40/*'('*/).debug(this._name);
    if (this._value !== void 0) {
      output = output.write(", ").debug(this._value);
    }
    output = output.write(41/*')'*/);
    if (this._optional) {
      output = output.write(46/*'.'*/).write("optional").write(40/*'('*/).write("true").write(41/*')'*/);
    }
  }

  toString(): string {
    return Format.debug(this);
  }

  clone(): Arg {
    return new Arg(this._name, this._value, this._optional);
  }

  static of(name: string, value?: string, optional: boolean = false): Arg {
    return new Arg(name, value, optional);
  }

  static fromAny(arg: AnyArg): Arg {
    if (arg instanceof Arg) {
      return arg;
    } else if (typeof arg === "string") {
      return new Arg(arg, void 0, false);
    } else {
      return new Arg(arg.name, arg.value, arg.optional || false);
    }
  }
}
