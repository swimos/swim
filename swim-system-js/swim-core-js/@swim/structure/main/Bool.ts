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

import {Lazy, Numbers, Strings} from "@swim/util";
import type {Output} from "@swim/codec";
import {AnyItem, Item} from "./Item";
import {AnyValue, Value} from "./Value";

export type AnyBool = Bool | boolean;

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

  isConstant(): boolean {
    return true;
  }

  declare readonly value: boolean;

  stringValue(): string;
  stringValue<T>(orElse: T): string;
  stringValue<T>(orElse?: T): string {
    return this.value ? "true" : "false";
  }

  booleanValue(): boolean;
  booleanValue<T>(orElse: T): boolean;
  booleanValue<T>(orElse?: T): boolean {
    return this.value;
  }

  toAny(): AnyBool {
    return this.value;
  }

  valueOf(): boolean {
    return this.value;
  }

  conditional(thenTerm: AnyValue, elseTerm: AnyValue): Value;
  conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item;
  conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item {
    return this.value ? Item.fromAny(thenTerm) : Item.fromAny(elseTerm);
  }

  or(that: AnyValue): Value;
  or(that: AnyItem): Item;
  or(that: AnyItem): Item {
    return this.value ? this : Item.fromAny(that);
  }

  and(that: AnyValue): Value;
  and(that: AnyItem): Item;
  and(that: AnyItem): Item {
    return this.value ? Item.fromAny(that) : this;
  }

  not(): Value {
    return Bool.from(!this.value);
  }

  get typeOrder(): number {
    return 7;
  }

  compareTo(that: unknown): number {
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

  equivalentTo(that: unknown): boolean {
    return this.equals(that);
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Bool) {
      return this.value === that.value;
    }
    return false;
  }

  /** @hidden */
  declare readonly hashValue: number;

  hashCode(): number {
    return this.hashValue;
  }

  debug(output: Output): void {
    output = output.write("Bool").write(46/*'.'*/).write("from")
        .write(40/*'('*/).write(this.value ? "true" : "false").write(41/*')'*/);
  }

  display(output: Output): void {
    output = output.write(this.value ? "true" : "false");
  }

  @Lazy
  static get true(): Bool {
    return new Bool(true);
  }

  @Lazy
  static get false(): Bool {
    return new Bool(false);
  }

  static from(value: boolean): Bool {
    return value ? Bool.true : Bool.false;
  }

  static fromAny(value: AnyBool): Bool {
    if (value instanceof Bool) {
      return value;
    } else if (typeof value === "boolean") {
      return Bool.from(value);
    } else {
      throw new TypeError("" + value);
    }
  }
}
