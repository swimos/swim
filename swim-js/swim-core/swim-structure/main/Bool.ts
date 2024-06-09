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

import {Lazy} from "@swim/util";
import {Numbers} from "@swim/util";
import {Strings} from "@swim/util";
import type {Output} from "@swim/codec";
import type {ItemLike} from "./Item";
import {Item} from "./Item";
import type {ValueLike} from "./Value";
import {Value} from "./Value";

/** @public */
export type BoolLike = Bool | boolean;

/** @public */
export class Bool extends Value {
  private constructor(value: boolean) {
    super();
    Object.defineProperty(this, "value", {
      value: value,
      enumerable: true,
    });
    Object.defineProperty(this, "hashValue", {
      value: Strings.hash(value ? "true" : "false"),
    });
  }

  override likeType?(like: boolean): void;

  override isDefinite(): boolean {
    return this.value;
  }

  override isConstant(): boolean {
    return true;
  }

  readonly value!: boolean;

  override stringValue(): string;
  override stringValue<T>(orElse: T): string;
  override stringValue<T>(orElse?: T): string {
    return this.value ? "true" : "false";
  }

  override booleanValue(): boolean;
  override booleanValue<T>(orElse: T): boolean;
  override booleanValue<T>(orElse?: T): boolean {
    return this.value;
  }

  override toLike(): BoolLike {
    return this.value;
  }

  override valueOf(): boolean {
    return this.value;
  }

  override conditional(thenTerm: ValueLike, elseTerm: ValueLike): Value;
  override conditional(thenTerm: ItemLike, elseTerm: ItemLike): Item;
  override conditional(thenTerm: ItemLike, elseTerm: ItemLike): Item {
    return this.value ? Item.fromLike(thenTerm) : Item.fromLike(elseTerm);
  }

  override or(that: ValueLike): Value;
  override or(that: ItemLike): Item;
  override or(that: ItemLike): Item {
    return this.value ? this : Item.fromLike(that);
  }

  override and(that: ValueLike): Value;
  override and(that: ItemLike): Item;
  override and(that: ItemLike): Item {
    return this.value ? Item.fromLike(that) : this;
  }

  override not(): Value {
    return Bool.from(!this.value);
  }

  override get typeOrder(): number {
    return 7;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Bool) {
      if (this.value && !that.value) {
        return -1;
      } else if (!this.value && that.value) {
        return 1;
      } else {
        return 0;
      }
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: unknown): boolean {
    return this.equals(that);
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Bool) {
      return this.value === that.value;
    }
    return false;
  }

  /** @internal */
  readonly hashValue!: number;

  override hashCode(): number {
    return this.hashValue;
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Bool").write(46/*'.'*/).write("from").write(40/*'('*/)
                   .write(this.value ? "true" : "false").write(41/*')'*/);
    return output;
  }

  override display<T>(output: Output<T>): Output<T> {
    output = output.write(this.value ? "true" : "false");
    return output;
  }

  @Lazy
  static true(): Bool {
    return new Bool(true);
  }

  @Lazy
  static false(): Bool {
    return new Bool(false);
  }

  static from(value: boolean): Bool {
    return value ? Bool.true() : Bool.false();
  }

  static override fromLike(value: BoolLike): Bool {
    if (value instanceof Bool) {
      return value;
    } else if (typeof value === "boolean") {
      return Bool.from(value);
    }
    throw new TypeError("" + value);
  }
}
