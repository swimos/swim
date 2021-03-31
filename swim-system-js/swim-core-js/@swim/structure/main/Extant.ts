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

import {Lazy, Numbers, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Interpolator} from "@swim/mapping";
import {Item} from "./Item";
import {Value} from "./Value";
import {Record} from "./Record";

export type AnyExtant = Extant | null;

export class Extant extends Value {
  /** @hidden */
  private constructor() {
    super();
  }

  /**
   * Always returns `true` because `Extant` is a defined value.
   */
  isDefined(): boolean {
    return true;
  }

  /**
   * Always returns `false` because `Extant` is not a distinct
   * value.
   */
  isDistinct(): boolean {
    return false;
  }

  isConstant(): boolean {
    return true;
  }

  /**
   * Always returns an empty `Record` because `Extant` is not a distinct value.
   */
  unflattened(): Record {
    return Record.empty();
  }

  not(): Value {
    return Value.absent();
  }

  /**
   * Always returns the empty `string` because `Extant` behaves like an empty
   * `Record`, which converts to a `string` by concatenating the string values
   * of all its members, if all its members convert to string values.
   */
  stringValue(): string;
  /**
   * Always returns the empty `string` because `Extant` behaves like an empty
   * `Record`, which converts to a `string` by concatenating the string values
   * of all its members, if all its members convert to string values.
   */
  stringValue<T>(orElse: T): string;
  stringValue<T>(orElse?: T): string {
    return "";
  }

  /**
   * Always returns `true` because `Extant` behaves like a truthy value.
   */
  booleanValue(): boolean;
  /**
   * Always returns `true` because `Extant` behaves like a truthy value.
   */
  booleanValue<T>(orElse: T): boolean;
  booleanValue<T>(orElse?: T): boolean {
    return true;
  }

  toAny(): AnyExtant {
    return null;
  }

  interpolateTo(that: Extant): Interpolator<Extant>;
  interpolateTo(that: Item): Interpolator<Item>;
  interpolateTo(that: unknown): Interpolator<Item> | null;
  interpolateTo(that: unknown): Interpolator<Item> | null {
    return super.interpolateTo(that);
  }

  get typeOrder(): number {
    return 98;
  }

  compareTo(that: unknown): number {
    if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  equivalentTo(that: unknown): boolean {
    return this === that;
  }

  equals(that: unknown): boolean {
    return this === that;
  }

  hashCode(): number {
    return Constructors.hash(Extant);
  }

  debug(output: Output): void {
    output = output.write("Value").write(46/*'.'*/).write("extant").write(40/*'('*/).write(41/*')'*/);
  }

  display(output: Output): void {
    output = output.write("null");
  }

  @Lazy
  static extant(): Extant {
    return new Extant();
  }

  static fromAny(value: AnyExtant): Extant {
    if (value instanceof Extant) {
      return value;
    } else if (value === null) {
      return Extant.extant();
    } else {
      throw new TypeError("" + value);
    }
  }
}
