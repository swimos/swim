// Copyright 2015-2022 Swim.inc
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

import {Lazy, Numbers, Constructors, Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import {Item} from "./Item";
import {Value} from "./Value";
import {Record} from "./Record";

/** @public */
export type AnyExtant = Extant | null;

/** @public */
export class Extant extends Value {
  /** @internal */
  private constructor() {
    super();
  }

  /**
   * Always returns `true` because `Extant` is a defined value.
   */
  override isDefined(): boolean {
    return true;
  }

  /**
   * Always returns `false` because `Extant` is not a distinct value.
   */
  override isDistinct(): boolean {
    return false;
  }

  /**
   * Always returns `false` because `Extant` is not a definite value.
   */
  override isDefinite(): boolean {
    return false;
  }

  override isConstant(): boolean {
    return true;
  }

  /**
   * Always returns an empty `Record` because `Extant` is not a distinct value.
   */
  override unflattened(): Record {
    return Record.empty();
  }

  override not(): Value {
    return Value.absent();
  }

  /**
   * Always returns the empty `string` because `Extant` behaves like an empty
   * `Record`, which converts to a `string` by concatenating the string values
   * of all its members, if all its members convert to string values.
   */
  override stringValue(): string;
  /**
   * Always returns the empty `string` because `Extant` behaves like an empty
   * `Record`, which converts to a `string` by concatenating the string values
   * of all its members, if all its members convert to string values.
   */
  override stringValue<T>(orElse: T): string;
  override stringValue<T>(orElse?: T): string {
    return "";
  }

  /**
   * Always returns `true` because `Extant` behaves like a truthy value.
   */
  override booleanValue(): boolean;
  /**
   * Always returns `true` because `Extant` behaves like a truthy value.
   */
  override booleanValue<T>(orElse: T): boolean;
  override booleanValue<T>(orElse?: T): boolean {
    return true;
  }

  override toAny(): AnyExtant {
    return null;
  }

  override interpolateTo(that: Extant): Interpolator<Extant>;
  override interpolateTo(that: Item): Interpolator<Item>;
  override interpolateTo(that: unknown): Interpolator<Item> | null;
  override interpolateTo(that: unknown): Interpolator<Item> | null {
    return super.interpolateTo(that);
  }

  override get typeOrder(): number {
    return 98;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: unknown): boolean {
    return this === that;
  }

  override equals(that: unknown): boolean {
    return this === that;
  }

  override hashCode(): number {
    return Constructors.hash(Extant);
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Value").write(46/*'.'*/).write("extant").write(40/*'('*/).write(41/*')'*/);
    return output;
  }

  override display<T>(output: Output<T>): Output<T> {
    output = output.write("null");
    return output;
  }

  @Lazy
  static override extant(): Extant {
    return new Extant();
  }

  static override fromAny(value: AnyExtant): Extant {
    if (value instanceof Extant) {
      return value;
    } else if (value === null) {
      return Extant.extant();
    } else {
      throw new TypeError("" + value);
    }
  }
}
