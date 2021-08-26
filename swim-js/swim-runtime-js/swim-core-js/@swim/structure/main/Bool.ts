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

  override toAny(): AnyBool {
    return this.value;
  }

  override valueOf(): boolean {
    return this.value;
  }

  override conditional(thenTerm: AnyValue, elseTerm: AnyValue): Value;
  override conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item;
  override conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item {
    return this.value ? Item.fromAny(thenTerm) : Item.fromAny(elseTerm);
  }

  override or(that: AnyValue): Value;
  override or(that: AnyItem): Item;
  override or(that: AnyItem): Item {
    return this.value ? this : Item.fromAny(that);
  }

  override and(that: AnyValue): Value;
  override and(that: AnyItem): Item;
  override and(that: AnyItem): Item {
    return this.value ? Item.fromAny(that) : this;
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

  /** @hidden */
  readonly hashValue!: number;

  override hashCode(): number {
    return this.hashValue;
  }

  override debug(output: Output): void {
    output = output.write("Bool").write(46/*'.'*/).write("from")
        .write(40/*'('*/).write(this.value ? "true" : "false").write(41/*')'*/);
  }

  override display(output: Output): void {
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

  static override fromAny(value: AnyBool): Bool {
    if (value instanceof Bool) {
      return value;
    } else if (typeof value === "boolean") {
      return Bool.from(value);
    } else {
      throw new TypeError("" + value);
    }
  }
}
