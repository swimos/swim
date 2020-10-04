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

import {Equals, Objects} from "@swim/util";
import {Parser, Diagnostic, Unicode} from "@swim/codec";
import {Item, Value, Text, Form} from "@swim/structure";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {BoxShadowParser} from "./BoxShadowParser";
import {BoxShadowForm} from "./BoxShadowForm";

export type AnyBoxShadow = BoxShadow | BoxShadowInit | string | BoxShadowArray;

export interface BoxShadowInit {
  inset?: boolean;
  offsetX?: AnyLength;
  offsetY?: AnyLength;
  blurRadius?: AnyLength;
  spreadRadius?: AnyLength;
  color?: AnyColor;
}

export type BoxShadowArray = {[index: number]: BoxShadow | BoxShadowInit | string, length: number};

export class BoxShadow implements Equals {
  /** @hidden */
  readonly _inset: boolean;
  /** @hidden */
  readonly _offsetX: Length;
  /** @hidden */
  readonly _offsetY: Length;
  /** @hidden */
  readonly _blurRadius: Length;
  /** @hidden */
  readonly _spreadRadius: Length;
  /** @hidden */
  readonly _color: Color;
  /** @hidden */
  readonly _next: BoxShadow | null;
  /** @hidden */
  _string?: string;

  constructor(inset: boolean, offsetX: Length, offsetY: Length, blurRadius: Length,
              spreadRadius: Length, color: Color, next: BoxShadow | null) {
    this._inset = inset;
    this._offsetX = offsetX;
    this._offsetY = offsetY;
    this._blurRadius = blurRadius;
    this._spreadRadius = spreadRadius;
    this._color = color;
    this._next = next;
  }

  isDefined(): boolean {
    return this._inset || this._offsetX.isDefined() || this._offsetY.isDefined()
        || this._blurRadius.isDefined() || this._spreadRadius.isDefined()
        || this._color.isDefined() || (this._next !== null ? this._next.isDefined() : false);
  }

  inset(): boolean;
  inset(inset: boolean): BoxShadow;
  inset(inset?: boolean): boolean | BoxShadow {
    if (inset === void 0) {
      return this._inset;
    } else {
      return new BoxShadow(inset, this._offsetX, this._offsetY, this._blurRadius,
                           this._spreadRadius, this._color, this._next);
    }
  }

  offsetX(): Length;
  offsetX(offsetX: AnyLength): BoxShadow;
  offsetX(offsetX?: AnyLength): Length | BoxShadow {
    if (offsetX === void 0) {
      return this._offsetX;
    } else {
      offsetX = Length.fromAny(offsetX);
      return new BoxShadow(this._inset, offsetX, this._offsetY, this._blurRadius,
                           this._spreadRadius, this._color, this._next);
    }
  }

  offsetY(): Length;
  offsetY(offsetY: AnyLength): BoxShadow;
  offsetY(offsetY?: AnyLength): Length | BoxShadow {
    if (offsetY === void 0) {
      return this._offsetY;
    } else {
      offsetY = Length.fromAny(offsetY);
      return new BoxShadow(this._inset, this._offsetX, offsetY, this._blurRadius,
                           this._spreadRadius, this._color, this._next);
    }
  }

  blurRadius(): Length;
  blurRadius(blurRadius: AnyLength): BoxShadow;
  blurRadius(blurRadius?: AnyLength): Length | BoxShadow {
    if (blurRadius === void 0) {
      return this._blurRadius;
    } else {
      blurRadius = Length.fromAny(blurRadius);
      return new BoxShadow(this._inset, this._offsetX, this._offsetY, blurRadius,
                           this._spreadRadius, this._color, this._next);
    }
  }

  spreadRadius(): Length;
  spreadRadius(spreadRadius: AnyLength): BoxShadow;
  spreadRadius(spreadRadius?: AnyLength): Length | BoxShadow {
    if (spreadRadius === void 0) {
      return this._spreadRadius;
    } else {
      spreadRadius = Length.fromAny(spreadRadius);
      return new BoxShadow(this._inset, this._offsetX, this._offsetY, this._blurRadius,
                           spreadRadius, this._color, this._next);
    }
  }

  color(): Color;
  color(color: AnyColor): BoxShadow;
  color(color?: AnyColor): Color | BoxShadow {
    if (color === void 0) {
      return this._color;
    } else {
      color = Color.fromAny(color);
      return new BoxShadow(this._inset, this._offsetX, this._offsetY, this._blurRadius,
                           this._spreadRadius, color, this._next);
    }
  }

  and(value: AnyBoxShadow): BoxShadow;
  and(offsetX: AnyLength, offsetY: AnyLength, color: AnyColor): BoxShadow;
  and(offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, color: AnyColor): BoxShadow;
  and(offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, spreadRadius: AnyLength, color: AnyColor): BoxShadow;
  and(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, color: AnyColor): BoxShadow;
  and(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, color: AnyColor): BoxShadow;
  and(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, spreadRadius: AnyLength, color: AnyColor): BoxShadow;
  and(inset: AnyBoxShadow | AnyLength | boolean, offsetX?: AnyLength, offsetY?: AnyColor | AnyLength, blurRadius?: AnyColor | AnyLength, spreadRadius?: AnyColor | AnyLength, color?: AnyColor): BoxShadow {
    const next = this._next !== null ? this._next.and.apply(this._next, arguments) : BoxShadow.of.apply(null, arguments);
    return new BoxShadow(this._inset, this._offsetX, this._offsetY, this._blurRadius,
                         this._spreadRadius, this._color, next);
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BoxShadow) {
      return this._inset === that._inset && this._offsetX.equals(that._offsetX)
          && this._offsetY.equals(that._offsetY) && this._blurRadius.equals(that._blurRadius)
          && this._spreadRadius.equals(that._spreadRadius) && this._color.equals(that._color)
          && Objects.equal(this._next, that._next);
    }
    return false;
  }

  toString(): string {
    let s = this._string;
    if (s === void 0) {
      if (this.isDefined()) {
        s = "";
        if (this._inset) {
          s += "inset";
          s += " ";
        }
        s += this._offsetX.toString();
        s += " ";
        s += this._offsetY.toString();
        s += " ";
        s += this._blurRadius.toString();
        s += " ";
        s += this._spreadRadius.toString();
        s += " ";
        s += this._color.toString();
        if (this._next !== null) {
          s += ", ";
          s += this._next.toString();
        }
      } else {
        s = "none";
      }
      this._string = s;
    }
    return s;
  }

  private static _none?: BoxShadow;
  static none(): BoxShadow {
    if (BoxShadow._none === void 0) {
      BoxShadow._none = new BoxShadow(false, Length.zero(), Length.zero(), Length.zero(), Length.zero(), Color.black(), null);
    }
    return BoxShadow._none;
  }

  static of(value: AnyBoxShadow): BoxShadow;
  static of(offsetX: AnyLength, offsetY: AnyLength, color: AnyColor): BoxShadow;
  static of(offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, color: AnyColor): BoxShadow;
  static of(offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, spreadRadius: AnyLength, color: AnyColor): BoxShadow;
  static of(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, color: AnyColor): BoxShadow;
  static of(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, color: AnyColor): BoxShadow;
  static of(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, spreadRadius: AnyLength, color: AnyColor): BoxShadow;
  static of(inset: AnyBoxShadow | AnyLength | boolean, offsetX?: AnyLength, offsetY?: AnyColor | AnyLength, blurRadius?: AnyColor | AnyLength, spreadRadius?: AnyColor | AnyLength, color?: AnyColor): BoxShadow {
    if (arguments.length === 1) {
      return BoxShadow.fromAny(arguments[0]);
    } else if (typeof inset !== "boolean") {
      if (arguments.length === 3) {
        color = Color.fromAny(arguments[2]);
        spreadRadius = Length.zero();
        blurRadius = Length.zero();
        offsetY = Length.fromAny(arguments[1]);
        offsetX = Length.fromAny(arguments[0]);
      } else if (arguments.length === 4) {
        color = Color.fromAny(arguments[3]);
        spreadRadius = Length.zero();
        blurRadius = Length.fromAny(arguments[2]);
        offsetY = Length.fromAny(arguments[1]);
        offsetX = Length.fromAny(arguments[0]);
      } else if (arguments.length === 5) {
        color = Color.fromAny(arguments[4]);
        spreadRadius = Length.fromAny(arguments[3]);
        blurRadius = Length.fromAny(arguments[2]);
        offsetY = Length.fromAny(arguments[1]);
        offsetX = Length.fromAny(arguments[0]);
      } else {
        throw new TypeError("" + arguments);
      }
      inset = false;
    } else {
      if (arguments.length === 4) {
        color = Color.fromAny(arguments[3]);
        spreadRadius = Length.zero();
        blurRadius = Length.zero();
        offsetX = Length.fromAny(arguments[1]);
        offsetY = Length.fromAny(arguments[2]);
      } else if (arguments.length === 5) {
        color = Color.fromAny(arguments[4]);
        spreadRadius = Length.zero();
        blurRadius = Length.fromAny(arguments[3]);
        offsetX = Length.fromAny(arguments[1]);
        offsetY = Length.fromAny(arguments[2]);
      } else if (arguments.length === 6) {
        color = Color.fromAny(arguments[5]);
        spreadRadius = Length.fromAny(arguments[4]);
        blurRadius = Length.fromAny(arguments[3]);
        offsetY = Length.fromAny(arguments[2]);
        offsetX = Length.fromAny(arguments[1]);
      } else {
        throw new TypeError("" + arguments);
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

  static fromArray(array: BoxShadowArray): BoxShadow {
    let boxShadow = BoxShadow.fromAny(array[0]);
    for (let i = 1; i < array.length; i += 1) {
      boxShadow = boxShadow.and(array[i]);
    }
    return boxShadow;
  }

  static fromAny(...values: AnyBoxShadow[]): BoxShadow {
    let value: AnyBoxShadow;
    if (arguments.length === 0) {
      value = BoxShadow.none();
    } else if (arguments.length === 1) {
      value = arguments[0];
    } else {
      value = arguments;
    }
    if (value instanceof BoxShadow) {
      return value;
    } else if (typeof value === "string") {
      return BoxShadow.parse(value);
    } else if (typeof value === "object" && value !== null && (value as any).length === void 0) {
      return BoxShadow.fromInit(value as BoxShadowInit);
    } else if (typeof value === "object" && value !== null && (value as any).length > 0) {
      return BoxShadow.fromArray(value as BoxShadowArray);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): BoxShadow | undefined {
    let boxShadow: BoxShadow | undefined;
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
        if (boxShadow !== void 0) {
          boxShadow = boxShadow.and(next);
        } else {
          boxShadow = next;
        }
      }
    });
    return boxShadow;
  }

  static parse(string: string): BoxShadow {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = BoxShadow.Parser.parse(input);
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
  static isArray(value: unknown): value is BoxShadowArray {
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

  private static _form?: Form<BoxShadow, AnyBoxShadow>;
  static form(unit?: BoxShadow): Form<BoxShadow, AnyBoxShadow> {
    if (unit !== void 0) {
      unit = BoxShadow.fromAny(unit);
    }
    if (unit !== BoxShadow.none()) {
      return new BoxShadow.Form(unit);
    } else {
      if (BoxShadow._form === void 0) {
        BoxShadow._form = new BoxShadow.Form(BoxShadow.none());
      }
      return BoxShadow._form;
    }
  }

  // Forward type declarations
  /** @hidden */
  static Parser: typeof BoxShadowParser; // defined by BoxShadowParser
  /** @hidden */
  static Form: typeof BoxShadowForm; // defined by BoxShadowForm
}
