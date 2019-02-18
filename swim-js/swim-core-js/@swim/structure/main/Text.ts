// Copyright 2015-2019 SWIM.AI inc.
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

import {Murmur3, Objects, HashGenCacheSet} from "@swim/util";
import {OutputSettings, Output, Format} from "@swim/codec";
import {AnyItem, Item} from "./Item";
import {AnyValue, Value} from "./Value";
import {TextOutput} from "./TextOutput";

export type AnyText = Text | string;

export class Text extends Value {
  /** @hidden */
  readonly _value: string;
  /** @hidden */
  _hashCode?: number;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  isConstant(): boolean {
    return true;
  }

  get value(): string {
    return this._value;
  }

  get size(): number {
    return this._value.length;
  }

  stringValue(): string;
  stringValue<T>(orElse: T): string;
  stringValue<T>(orElse?: T): string {
    return this._value;
  }

  numberValue(): number | undefined;
  numberValue<T>(orElse: T): number | T;
  numberValue<T>(orElse?: T): number | T | undefined {
    try {
      return Item.Num.from(this._value).numberValue();
    } catch (error) {
      return orElse;
    }
  }

  booleanValue(): boolean | undefined;
  booleanValue<T>(orElse: T): boolean | T;
  booleanValue<T>(orElse?: T): boolean | T | undefined {
    if (this._value === "true") {
      return true;
    } else if (this._value === "false") {
      return false;
    } else {
      return orElse;
    }
  }

  toAny(): AnyText {
    return this._value;
  }

  valueOf(): string {
    return this._value;
  }

  plus(that: AnyValue): Value;
  plus(that: AnyItem): Item;
  plus(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Text) {
      return Text.from(this._value + that._value);
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

  typeOrder(): number {
    return 5;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof Text) {
      const order = this._value.localeCompare(that._value);
      return order < 0 ? -1 : order > 0 ? 1 : 0;
    }
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Text) {
      return this._value === that._value;
    }
    return false;
  }

  hashCode(): number {
    if (this._hashCode === void 0) {
      this._hashCode = Murmur3.hash(this._value);
    }
    return this._hashCode;
  }

  debug(output: Output): void {
    output = output.write("Text").write(46/*'.'*/);
    if (this._value.length === 0) {
      output = output.write("empty").write(40/*'('*/).write(41/*')'*/);
    } else {
      output = output.write("from").write(40/*'('*/).debug(this._value).write(41/*')'*/);
    }
  }

  display(output: Output): void {
    Format.debug(this._value, output);
  }

  toString(): string {
    return this._value;
  }

  private static _empty?: Text;

  private static _cache?: HashGenCacheSet<Text>;

  static output(settings: OutputSettings = OutputSettings.standard()): Output<Text> {
    return new TextOutput("", settings);
  }

  static empty(): Text {
    if (!Text._empty) {
      Text._empty = new Text("");
    }
    return Text._empty;
  }

  static from(value: string): Text {
    const n = value.length;
    if (n === 0) {
      return Text.empty();
    } else {
      let text = new Text(value);
      if (n <= 64) {
        text = Text.cache().put(text);
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

  /** @hidden */
  static cache(): HashGenCacheSet<Text> {
    if (Text._cache == null) {
      const cacheSize = 128;
      Text._cache = new HashGenCacheSet<Text>(cacheSize);
    }
    return Text._cache;
  }
}
Item.Text = Text;
