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
import {Murmur3} from "@swim/util";
import type {HashCode} from "@swim/util";
import {Booleans} from "@swim/util";
import {Strings} from "@swim/util";
import {Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";

/** @public */
export type ArgLike = Arg | ArgInit | string;

/** @public */
export interface ArgInit {
  /** @internal */
  readonly typeid?: "ArgInit";
  readonly name: string;
  readonly value?: string;
  readonly optional?: boolean;
}

/** @public */
export class Arg implements HashCode, Debug {
  constructor(name: string, value: string | undefined, optional: boolean) {
    this.name = name;
    this.value = value;
    this.optional = optional;
  }

  /** @internal */
  declare readonly typeid?: "Arg";

  readonly name: string;

  readonly value: string | undefined;

  withValue(value: string | undefined): this {
    (this as Mutable<this>).value = value;
    return this;
  }

  readonly optional: boolean;

  asOptional(optional: boolean): this {
    (this as Mutable<this>).optional = optional;
    return this;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Arg) {
      return this.name === that.name && this.value === that.value
          && this.optional === that.optional;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Constructors.hash(Arg),
        Strings.hash(this.name)), Strings.hash(this.value)), Booleans.hash(this.optional)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("Arg").write(46/*'.'*/).write("of").write(40/*'('*/).debug(this.name);
    if (this.value !== void 0) {
      output = output.write(", ").debug(this.value);
    }
    output = output.write(41/*')'*/);
    if (this.optional) {
      output = output.write(46/*'.'*/).write("optional").write(40/*'('*/).write("true").write(41/*')'*/);
    }
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  clone(): Arg {
    return new Arg(this.name, this.value, this.optional);
  }

  static create(name: string, value?: string, optional: boolean = false): Arg {
    return new Arg(name, value, optional);
  }

  static fromLike<T extends ArgLike | null | undefined>(value: T): Arg | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Arg) {
      return value as Arg | Uninitable<T>;
    } else if (typeof value === "string") {
      return new Arg(value, void 0, false);
    } else if (typeof value === "object") {
      return Arg.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: ArgInit): Arg {
    return new Arg(init.name, init.value, init.optional !== void 0 ? init.optional : false);
  }
}
