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

import {Equals, Equivalent, Lazy} from "@swim/util";
import {Parser, Diagnostic, Unicode} from "@swim/codec";
import type {Interpolate, Interpolator} from "@swim/mapping";
import {Item, Value, Text, Form} from "@swim/structure";
import {AnyLength, Length} from "@swim/math";
import {AnyColor, Color} from "../color/Color";
import {BoxShadowInterpolator} from "../"; // forward import
import {BoxShadowForm} from "../"; // forward import
import {BoxShadowParser} from "../"; // forward import

export type AnyBoxShadow = BoxShadow | BoxShadowInit | string | ReadonlyArray<AnyBoxShadow>;

export interface BoxShadowInit {
  inset?: boolean;
  offsetX?: AnyLength;
  offsetY?: AnyLength;
  blurRadius?: AnyLength;
  spreadRadius?: AnyLength;
  color?: AnyColor;
}

export class BoxShadow implements Interpolate<BoxShadow>, Equals, Equivalent {
  constructor(inset: boolean, offsetX: Length, offsetY: Length, blurRadius: Length,
              spreadRadius: Length, color: Color, next: BoxShadow | null) {
    Object.defineProperty(this, "inset", {
      value: inset,
      enumerable: true,
    });
    Object.defineProperty(this, "offsetX", {
      value: offsetX,
      enumerable: true,
    });
    Object.defineProperty(this, "offsetY", {
      value: offsetY,
      enumerable: true,
    });
    Object.defineProperty(this, "blurRadius", {
      value: blurRadius,
      enumerable: true,
    });
    Object.defineProperty(this, "spreadRadius", {
      value: spreadRadius,
      enumerable: true,
    });
    Object.defineProperty(this, "color", {
      value: color,
      enumerable: true,
    });
    Object.defineProperty(this, "next", {
      value: next,
      enumerable: true,
    });
    Object.defineProperty(this, "stringValue", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
  }

  readonly inset!: boolean;

  withInset(inset: boolean): BoxShadow {
    if (inset === this.inset) {
      return this;
    } else {
      return new BoxShadow(inset, this.offsetX, this.offsetY, this.blurRadius,
                           this.spreadRadius, this.color, this.next);
    }
  }

  readonly offsetX!: Length;

  withOffsetX(offsetX: AnyLength): BoxShadow {
    offsetX = Length.fromAny(offsetX);
    if (offsetX.equals(this.offsetX)) {
      return this;
    } else {
      return new BoxShadow(this.inset, offsetX, this.offsetY, this.blurRadius,
                           this.spreadRadius, this.color, this.next);
    }
  }

  readonly offsetY!: Length;

  withOffsetY(offsetY: AnyLength): BoxShadow {
    offsetY = Length.fromAny(offsetY);
    if (offsetY.equals(this.offsetY)) {
      return this;
    } else {
      return new BoxShadow(this.inset, this.offsetX, offsetY, this.blurRadius,
                           this.spreadRadius, this.color, this.next);
    }
  }

  readonly blurRadius!: Length;

  withBlurRadius(blurRadius: AnyLength): BoxShadow {
    blurRadius = Length.fromAny(blurRadius);
    if (blurRadius.equals(this.blurRadius)) {
      return this;
    } else {
      return new BoxShadow(this.inset, this.offsetX, this.offsetY, blurRadius,
                           this.spreadRadius, this.color, this.next);
    }
  }

  readonly spreadRadius!: Length;

  withSpreadRadius(spreadRadius: AnyLength): BoxShadow {
    spreadRadius = Length.fromAny(spreadRadius);
    if (spreadRadius.equals(this.spreadRadius)) {
      return this;
    } else {
      return new BoxShadow(this.inset, this.offsetX, this.offsetY, this.blurRadius,
                           spreadRadius, this.color, this.next);
    }
  }

  readonly color!: Color;

  withColor(color: AnyColor): BoxShadow {
    color = Color.fromAny(color);
    if (color.equals(this.color)) {
      return this;
    } else {
      return new BoxShadow(this.inset, this.offsetX, this.offsetY, this.blurRadius,
                           this.spreadRadius, color, this.next);
    }
  }

  readonly next!: BoxShadow | null;

  and(value: AnyBoxShadow): BoxShadow;
  and(offsetX: AnyLength, offsetY: AnyLength, color: AnyColor): BoxShadow;
  and(offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, color: AnyColor): BoxShadow;
  and(offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, spreadRadius: AnyLength, color: AnyColor): BoxShadow;
  and(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, color: AnyColor): BoxShadow;
  and(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, color: AnyColor): BoxShadow;
  and(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, spreadRadius: AnyLength, color: AnyColor): BoxShadow;
  and(inset: AnyBoxShadow | AnyLength | boolean, offsetX?: AnyLength, offsetY?: AnyColor | AnyLength, blurRadius?: AnyColor | AnyLength, spreadRadius?: AnyColor | AnyLength, color?: AnyColor): BoxShadow {
    let next: BoxShadow | null;
    if (this.next !== null) {
      // eslint-disable-next-line prefer-rest-params, prefer-spread
      next = this.next.and.apply(this.next, arguments as any);
    } else {
      // eslint-disable-next-line prefer-rest-params, prefer-spread
      next = BoxShadow.create.apply(BoxShadow, arguments as any);
    }
    return new BoxShadow(this.inset, this.offsetX, this.offsetY, this.blurRadius,
                         this.spreadRadius, this.color, next);
  }

  interpolateTo(that: BoxShadow): Interpolator<BoxShadow>;
  interpolateTo(that: unknown): Interpolator<BoxShadow> | null;
  interpolateTo(that: unknown): Interpolator<BoxShadow> | null {
    if (that instanceof BoxShadow) {
      return BoxShadowInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BoxShadow) {
      return this.inset === that.inset
          && this.offsetX.equivalentTo(that.offsetX, epsilon)
          && this.offsetY.equivalentTo(that.offsetY, epsilon)
          && this.blurRadius.equivalentTo(that.blurRadius, epsilon)
          && this.spreadRadius.equivalentTo(that.spreadRadius, epsilon)
          && this.color.equivalentTo(that.color, epsilon)
          && Equivalent(this.next, that.next, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BoxShadow) {
      return this.inset === that.inset && this.offsetX.equals(that.offsetX)
          && this.offsetY.equals(that.offsetY) && this.blurRadius.equals(that.blurRadius)
          && this.spreadRadius.equals(that.spreadRadius) && this.color.equals(that.color)
          && Equals(this.next, that.next);
    }
    return false;
  }

  /** @hidden */
  readonly stringValue!: string | undefined;

  toString(): string {
    let s = this.stringValue;
    if (s === void 0) {
      s = "";
      if (this.inset) {
        s += "inset";
        s += " ";
      }
      s += this.offsetX.toString();
      s += " ";
      s += this.offsetY.toString();
      s += " ";
      s += this.blurRadius.toString();
      s += " ";
      s += this.spreadRadius.toString();
      s += " ";
      s += this.color.toString();
      if (this.next !== null) {
        s += ", ";
        s += this.next.toString();
      }
      Object.defineProperty(this, "stringValue", {
        value: s,
        enumerable: true,
        configurable: true,
      });
    }
    return s;
  }

  static create(value: AnyBoxShadow): BoxShadow;
  static create(offsetX: AnyLength, offsetY: AnyLength, color: AnyColor): BoxShadow;
  static create(offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, color: AnyColor): BoxShadow;
  static create(offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, spreadRadius: AnyLength, color: AnyColor): BoxShadow;
  static create(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, color: AnyColor): BoxShadow;
  static create(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, color: AnyColor): BoxShadow;
  static create(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, spreadRadius: AnyLength, color: AnyColor): BoxShadow;
  static create(inset: AnyBoxShadow | AnyLength | boolean, offsetX?: AnyLength, offsetY?: AnyColor | AnyLength, blurRadius?: AnyColor | AnyLength, spreadRadius?: AnyColor | AnyLength, color?: AnyColor): BoxShadow {
    if (arguments.length === 1) {
      return BoxShadow.fromAny(inset as AnyBoxShadow)!;
    } else if (typeof inset !== "boolean") {
      if (arguments.length === 3) {
        color = Color.fromAny(offsetY as AnyColor);
        spreadRadius = Length.zero();
        blurRadius = Length.zero();
        offsetY = Length.fromAny(offsetX!);
        offsetX = Length.fromAny(inset as AnyLength);
      } else if (arguments.length === 4) {
        color = Color.fromAny(blurRadius as AnyColor);
        spreadRadius = Length.zero();
        blurRadius = Length.fromAny(offsetY as AnyLength);
        offsetY = Length.fromAny(offsetX!);
        offsetX = Length.fromAny(inset as AnyLength);
      } else if (arguments.length === 5) {
        color = Color.fromAny(spreadRadius as AnyColor);
        spreadRadius = Length.fromAny(blurRadius as AnyLength);
        blurRadius = Length.fromAny(offsetY as AnyLength);
        offsetY = Length.fromAny(offsetX!);
        offsetX = Length.fromAny(inset as AnyLength);
      } else {
        throw new Error(inset + ", " + offsetX + ", " + offsetY + ", " + blurRadius + ", " + spreadRadius + ", " + color);
      }
      inset = false;
    } else {
      if (arguments.length === 4) {
        color = Color.fromAny(blurRadius as AnyColor);
        spreadRadius = Length.zero();
        blurRadius = Length.zero();
        offsetY = Length.fromAny(offsetY as AnyLength);
        offsetX = Length.fromAny(offsetX!);
      } else if (arguments.length === 5) {
        color = Color.fromAny(spreadRadius as AnyColor);
        spreadRadius = Length.zero();
        blurRadius = Length.fromAny(blurRadius as AnyLength);
        offsetY = Length.fromAny(offsetY as AnyLength);
        offsetX = Length.fromAny(offsetX!);
      } else if (arguments.length === 6) {
        color = Color.fromAny(color!);
        spreadRadius = Length.fromAny(spreadRadius as AnyLength);
        blurRadius = Length.fromAny(blurRadius as AnyLength);
        offsetY = Length.fromAny(offsetY as AnyLength);
        offsetX = Length.fromAny(offsetX!);
      } else {
        throw new Error(inset + ", " + offsetX + ", " + offsetY + ", " + blurRadius + ", " + spreadRadius + ", " + color);
      }
    }
    return new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, null);
  }

  static fromInit(init: BoxShadowInit): BoxShadow {
    const inset = init.inset || false;
    const offsetX = init.offsetX !== void 0 ? Length.fromAny(init.offsetX) : Length.zero();
    const offsetY = init.offsetY !== void 0 ? Length.fromAny(init.offsetY) : Length.zero();
    const blurRadius = init.blurRadius !== void 0 ? Length.fromAny(init.blurRadius) : Length.zero();
    const spreadRadius = init.spreadRadius !== void 0 ? Length.fromAny(init.spreadRadius) : Length.zero();
    const color = init.color !== void 0 ? Color.fromAny(init.color) : Color.black();
    return new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, null);
  }

  static fromArray(array: ReadonlyArray<BoxShadow>): BoxShadow {
    let boxShadow = BoxShadow.fromAny(array[0]!)!;
    for (let i = 1; i < array.length; i += 1) {
      boxShadow = boxShadow.and(array[i]!);
    }
    return boxShadow;
  }

  static fromAny(...values: AnyBoxShadow[]): BoxShadow | null {
    let value: AnyBoxShadow;
    if (arguments.length === 0) {
      return null;
    } else if (arguments.length === 1) {
      value = values[0]!;
    } else {
      value = values;
    }
    if (value === void 0 || value === null || value instanceof BoxShadow) {
      return value;
    } else if (typeof value === "string") {
      return BoxShadow.parse(value);
    } else if (typeof value === "object" && value !== null && (value as any).length === void 0) {
      return BoxShadow.fromInit(value as BoxShadowInit);
    } else if (typeof value === "object" && value !== null && (value as any).length > 0) {
      return BoxShadow.fromArray(value as ReadonlyArray<BoxShadow>);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): BoxShadow | null {
    let boxShadow: BoxShadow | null = null;
    value.forEach(function (item: Item, index: number) {
      const header = item.header("boxShadow");
      if (header.isDefined()) {
        let inset: boolean | undefined;
        let offsetX: Length | undefined;
        let offsetY: Length | undefined;
        let blurRadius: Length | undefined;
        let spreadRadius: Length | undefined;
        let color: Color | undefined;
        header.forEach(function (item: Item, index: number): void {
          const key = item.key.stringValue();
          if (key !== void 0) {
            if (key === "inset") {
              inset = item.toValue().booleanValue(inset);
            } else if (key === "offsetX") {
              offsetX = item.toValue().cast(Length.form(), offsetX);
            } else if (key === "offsetY") {
              offsetY = item.toValue().cast(Length.form(), offsetY);
            } else if (key === "blurRadius") {
              blurRadius = item.toValue().cast(Length.form(), blurRadius);
            } else if (key === "spreadRadius") {
              spreadRadius = item.toValue().cast(Length.form(), spreadRadius);
            } else if (key === "color") {
              color = item.toValue().cast(Color.form(), color);
            }
          } else if (item instanceof Value) {
            if (index === 0 && item instanceof Text && item.value === "inset") {
              inset = true;
            } else if (index === 0 || index === 1 && inset !== void 0) {
              offsetX = item.cast(Length.form(), offsetX);
            } else if (index === 1 || index === 2 && inset !== void 0) {
              offsetY = item.cast(Length.form(), offsetY);
            } else if (index === 2 || index === 3 && inset !== void 0) {
              blurRadius = item.cast(Length.form(), blurRadius);
              if (blurRadius === void 0) {
                color = item.cast(Color.form(), color);
              }
            } else if ((index === 3 || index === 4 && inset === void 0) && color === void 0) {
              spreadRadius = item.cast(Length.form(), spreadRadius);
              if (spreadRadius === void 0) {
                color = item.cast(Color.form(), color);
              }
            } else if ((index === 4 || index === 5 && inset === void 0) && color === void 0) {
              color = item.cast(Color.form(), color);
            }
          }
        });
        inset = inset !== void 0 ? inset : false;
        offsetX = offsetX !== void 0 ? offsetX : Length.zero();
        offsetY = offsetY !== void 0 ? offsetY : Length.zero();
        blurRadius = blurRadius !== void 0 ? blurRadius : Length.zero();
        spreadRadius = spreadRadius !== void 0 ? spreadRadius : Length.zero();
        color = color !== void 0 ? color : Color.black();
        const next = new BoxShadow(inset || false, offsetX, offsetY, blurRadius, spreadRadius, color, null);
        if (boxShadow !== null) {
          boxShadow = boxShadow.and(next);
        } else {
          boxShadow = next;
        }
      }
    });
    return boxShadow;
  }

  static parse(string: string): BoxShadow | null {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = BoxShadowParser.parse(input);
    if (parser.isDone()) {
      while (input.isCont() && Unicode.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  /** @hidden */
  static isInit(value: unknown): value is BoxShadowInit {
    if (typeof value === "object" && value !== null) {
      const init = value as BoxShadowInit;
      return init.offsetX !== void 0 && init.offsetY !== void 0 && init.color !== void 0;
    }
    return false;
  }

  /** @hidden */
  static isArray(value: unknown): value is ReadonlyArray<BoxShadow> {
    if (Array.isArray(value)) {
      const n = value.length;
      if (n !== 0) {
        for (let i = 0; i < n; i += 1) {
          if (!BoxShadow.isAny(value)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyBoxShadow {
    return value instanceof BoxShadow
        || BoxShadow.isArray(value)
        || BoxShadow.isInit(value)
        || typeof value === "string";
  }

  @Lazy
  static form(): Form<BoxShadow | null, AnyBoxShadow> {
    return new BoxShadowForm(null);
  }
}
