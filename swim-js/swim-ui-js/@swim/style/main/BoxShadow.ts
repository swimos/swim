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

import {Equals, Objects} from "@swim/util";
import {Parser, Diagnostic, Unicode} from "@swim/codec";
import {Item, Value, Text, Form} from "@swim/structure";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {BoxShadowParser} from "./BoxShadowParser";
import {BoxShadowForm} from "./BoxShadowForm";

export type AnyBoxShadow = BoxShadow | BoxShadowInit | string | BoxShadowArray;

export type BoxShadowArray = {[index: number]: BoxShadow | BoxShadowInit | string, length: number};

export interface BoxShadowInit {
  offsetX?: AnyLength;
  offsetY?: AnyLength;
  blurRadius?: AnyLength;
  spreadRadius?: AnyLength;
  color?: AnyColor;
  inset?: boolean;
}

export class BoxShadow implements Equals {
  readonly inset: boolean;
  readonly offsetX: Length;
  readonly offsetY: Length;
  readonly blurRadius: Length;
  readonly spreadRadius: Length;
  readonly color: Color;
  readonly next: BoxShadow | null;

  constructor(inset: boolean, offsetX: Length, offsetY: Length, blurRadius: Length,
              spreadRadius: Length, color: Color, next: BoxShadow | null) {
    this.inset = inset;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.blurRadius = blurRadius;
    this.spreadRadius = spreadRadius;
    this.color = color;
    this.next = next;
  }

  isDefined(): boolean {
    return this.inset || this.offsetX.isDefined() || this.offsetY.isDefined()
        || this.blurRadius.isDefined() || this.spreadRadius.isDefined()
        || this.color.isDefined() || (this.next ? this.next.isDefined() : false);
  }

  and(value: AnyBoxShadow): BoxShadow;
  and(offsetX: AnyLength, offsetY: AnyLength, color: AnyColor): BoxShadow;
  and(offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, color: AnyColor): BoxShadow;
  and(offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, spreadRadius: AnyLength, color: AnyColor): BoxShadow;
  and(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, color: AnyColor): BoxShadow;
  and(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, color: AnyColor): BoxShadow;
  and(inset: boolean, offsetX: AnyLength, offsetY: AnyLength, blurRadius: AnyLength, spreadRadius: AnyLength, color: AnyColor): BoxShadow;
  and(inset: AnyBoxShadow | AnyLength | boolean, offsetX?: AnyLength, offsetY?: AnyColor | AnyLength, blurRadius?: AnyColor | AnyLength, spreadRadius?: AnyColor | AnyLength, color?: AnyColor): BoxShadow {
    const next = this.next ? this.next.and.apply(this.next, arguments) : BoxShadow.of.apply(null, arguments);
    return new BoxShadow(this.inset, this.offsetX, this.offsetY, this.blurRadius,
                         this.spreadRadius, this.color, next);
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BoxShadow) {
      return this.inset === that.inset && this.offsetX.equals(that.offsetX)
          && this.offsetY.equals(that.offsetY) && this.blurRadius.equals(that.blurRadius)
          && this.spreadRadius.equals(that.spreadRadius) && this.color.equals(that.color)
          && Objects.equal(this.next, that.next);
    }
    return false;
  }

  toString(): string {
    if (this.isDefined()) {
      let s = "";
      let boxShadow = this as BoxShadow;
      do {
        if (boxShadow.inset) {
          s += "inset";
          s += " ";
        }
        s += boxShadow.offsetX.toString();
        s += " ";
        s += boxShadow.offsetY.toString();
        s += " ";
        s += boxShadow.blurRadius.toString();
        s += " ";
        s += boxShadow.spreadRadius.toString();
        s += " ";
        s += boxShadow.color.toString();
        if (boxShadow.next) {
          s += ", ";
          boxShadow = boxShadow.next;
          continue;
        }
        break;
      } while (true);
      return s;
    } else {
      return "none";
    }
  }

  private static _none: BoxShadow;
  static none(): BoxShadow {
    if (!BoxShadow._none) {
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
    } else if (typeof value === "object" && value && (value as any).length === void 0) {
      value = value as BoxShadowInit;
      const inset = value.inset || false;
      const offsetX = value.offsetX !== void 0 ? Length.fromAny(value.offsetX) : Length.zero();
      const offsetY = value.offsetY !== void 0 ? Length.fromAny(value.offsetY) : Length.zero();
      const blurRadius = value.blurRadius !== void 0 ? Length.fromAny(value.blurRadius) : Length.zero();
      const spreadRadius = value.spreadRadius !== void 0 ? Length.fromAny(value.spreadRadius) : Length.zero();
      const color = value.color !== void 0 ? Color.fromAny(value.color) : Color.black();
      return new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, null);
    } else if (typeof value === "object" && value && (value as any).length > 0) {
      value = value as BoxShadowArray;
      let boxShadow = BoxShadow.fromAny(value[0]);
      for (let i = 1; i < value.length; i += 1) {
        boxShadow = boxShadow.and(value[i]);
      }
      return boxShadow;
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): BoxShadow | undefined {
    let boxShadow: BoxShadow | undefined;
    value.forEach(function (item: Item, index: number) {
      const header = item.header("boxShadow");
      if (header) {
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
        if (boxShadow) {
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
    if (value && typeof value === "object") {
      const init = value as BoxShadowInit;
      return init.offsetX !== void 0 && init.offsetY !== void 0 && init.color !== void 0;
    }
    return false;
  }

  private static _form: Form<BoxShadow, AnyBoxShadow>;
  static form(unit?: BoxShadow): Form<BoxShadow, AnyBoxShadow> {
    if (unit !== void 0) {
      unit = BoxShadow.fromAny(unit);
    }
    if (unit !== BoxShadow.none()) {
      return new BoxShadow.Form(unit);
    } else {
      if (!BoxShadow._form) {
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
