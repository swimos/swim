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

import {Lazy, Numbers, Strings, HashGenCacheSet} from "@swim/util";
import {OutputSettings, Output, Format} from "@swim/codec";
import type {Interpolator} from "@swim/mapping";
import {AnyItem, Item} from "./Item";
import {AnyValue, Value} from "./Value";
import {Num} from "./"; // forward import
import {TextOutput} from "./"; // forward import

export type AnyText = Text | string;

export class Text extends Value {
  private constructor(value: string) {
    super();
    Object.defineProperty(this, "value", {
      value: value,
      enumerable: true,
    });
    Object.defineProperty(this, "hashValue", {
      value: void 0,
      configurable: true,
    });
  }

  isConstant(): boolean {
    return true;
  }

  declare readonly value: string;

  get size(): number {
    return this.value.length;
  }

  stringValue(): string;
  stringValue<T>(orElse: T): string;
  stringValue<T>(orElse?: T): string {
    return this.value;
  }

  numberValue(): number | undefined;
  numberValue<T>(orElse: T): number | T;
  numberValue<T>(orElse?: T): number | T | undefined {
    try {
      return Num.parse(this.value).numberValue();
    } catch (error) {
      return orElse;
    }
  }

  booleanValue(): boolean | undefined;
  booleanValue<T>(orElse: T): boolean | T;
  booleanValue<T>(orElse?: T): boolean | T | undefined {
    if (this.value === "true") {
      return true;
    } else if (this.value === "false") {
      return false;
    } else {
      return orElse;
    }
  }

  toAny(): AnyText {
    return this.value;
  }

  valueOf(): string {
    return this.value;
  }

  plus(that: AnyValue): Value;
  plus(that: AnyItem): Item;
  plus(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Text) {
      return Text.from(this.value + that.value);
    }
    return super.plus(that);
  }

  branch(): Text {
    return this;
  }

  clone(): Text {
    return this;
  }

  commit(): this {
    return this;
  }

  interpolateTo(that: Text): Interpolator<Text>;
  interpolateTo(that: Item): Interpolator<Item>;
  interpolateTo(that: unknown): Interpolator<Item> | null;
  interpolateTo(that: unknown): Interpolator<Item> | null {
    return super.interpolateTo(that);
  }

  get typeOrder(): number {
    return 5;
  }

  compareTo(that: unknown): number {
    if (that instanceof Text) {
      return this.value.localeCompare(that.value);
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
    } else if (that instanceof Text) {
      return this.value === that.value;
    }
    return false;
  }

  /** @hidden */
  declare readonly hashValue: number | undefined;

  hashCode(): number {
    let hashValue = this.hashValue;
    if (hashValue === void 0) {
      hashValue = Strings.hash(this.value);
      Object.defineProperty(this, "hashValue", {
        value: hashValue,
      });
    }
    return hashValue;
  }

  debug(output: Output): void {
    output = output.write("Text").write(46/*'.'*/);
    if (this.value.length === 0) {
      output = output.write("empty").write(40/*'('*/).write(41/*')'*/);
    } else {
      output = output.write("from").write(40/*'('*/).debug(this.value).write(41/*')'*/);
    }
  }

  display(output: Output): void {
    Format.debug(this.value, output);
  }

  toString(): string {
    return this.value;
  }

  @Lazy
  static empty(): Text {
    return new Text("");
  }

  static from(value: string): Text {
    const n = value.length;
    if (n === 0) {
      return Text.empty();
    } else {
      let text = new Text(value);
      if (n <= 64) {
        text = Text.cache.put(text);
      }
      return text;
    }
  }

  static fromAny(value: AnyText): Text {
    if (value instanceof Text) {
      return value;
    } else if (typeof value === "string") {
      return Text.from(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static output(settings?: OutputSettings): Output<Text> {
    if (settings === void 0) {
      settings = OutputSettings.standard();
    }
    return new TextOutput("", settings);
  }

  /** @hidden */
  @Lazy
  static get cache(): HashGenCacheSet<Text> {
    const cacheSize = 128;
    return new HashGenCacheSet<Text>(cacheSize);
  }
}
