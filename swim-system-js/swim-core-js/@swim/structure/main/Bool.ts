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

import {Murmur3, Objects} from "@swim/util";
import {Output} from "@swim/codec";
import {AnyItem, Item} from "./Item";
import {AnyValue, Value} from "./Value";

export type AnyBool = Bool | boolean;

export class Bool extends Value {
  /** @hidden */
  readonly _value: boolean;
  /** @hidden */
  _hashCode?: number;

  private constructor(value: boolean) {
    super();
    this._value = value;
  }

  isConstant(): boolean {
    return true;
  }

  get value(): boolean {
    return this._value;
  }

  stringValue(): string;
  stringValue<T>(orElse: T): string;
  stringValue<T>(orElse?: T): string {
    return this._value ? "true" : "false";
  }

  booleanValue(): boolean;
  booleanValue<T>(orElse: T): boolean;
  booleanValue<T>(orElse?: T): boolean {
    return this._value;
  }

  toAny(): AnyBool {
    return this._value;
  }

  valueOf(): boolean {
    return this._value;
  }

  conditional(thenTerm: AnyValue, elseTerm: AnyValue): Value;
  conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item;
  conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item {
    return this._value ? Item.fromAny(thenTerm) : Item.fromAny(elseTerm);
  }

  or(that: AnyValue): Value;
  or(that: AnyItem): Item;
  or(that: AnyItem): Item {
    return this._value ? this : Item.fromAny(that);
  }

  and(that: AnyValue): Value;
  and(that: AnyItem): Item;
  and(that: AnyItem): Item {
    return this._value ? Item.fromAny(that) : this;
  }

  not(): Value {
    return Bool.from(!this._value);
  }

  typeOrder(): number {
    return 7;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof Bool) {
      if (this._value && !that._value) {
        return -1;
      } else if (!this._value && that._value) {
        return 1;
      } else {
        return 0;
      }
    }
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Bool) {
      return this._value === that._value;
    }
    return false;
  }

  hashCode(): number {
    if (this._hashCode === void 0) {
      this._hashCode = Murmur3.hash(this._value ? "true" : "false");
    }
    return this._hashCode;
  }

  debug(output: Output): void {
    output = output.write("Bool").write(46/*'.'*/).write("from")
        .write(40/*'('*/).write(this._value ? "true" : "false").write(41/*')'*/);
  }

  display(output: Output): void {
    output = output.write(this._value ? "true" : "false");
  }

  private static readonly True: Bool = new Bool(true);

  private static readonly False: Bool = new Bool(false);

  static from(value: boolean): Bool {
    return value ? Bool.True : Bool.False;
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
Item.Bool = Bool;
