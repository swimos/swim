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

import {Murmur3, Constructors} from "@swim/util";
import {Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import type {Interpolator} from "@swim/mapping";
import {Item, Value, Record} from "@swim/structure";
import {Length} from "../length/Length";
import {R2Point} from "../r2/R2Point";
import {Transform} from "./Transform";
import {IdentityTransform} from "./IdentityTransform";
import {TranslateTransformInterpolator} from "../"; // forward import
import {TranslateTransformParser} from "../"; // forward import
import {AffineTransform} from "../"; // forward import

export class TranslateTransform extends Transform {
  constructor(x: Length, y: Length) {
    super();
    Object.defineProperty(this, "x", {
      value: x,
      enumerable: true,
    });
    Object.defineProperty(this, "y", {
      value: y,
      enumerable: true,
    });
    Object.defineProperty(this, "stringValue", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
  }

  readonly x!: Length;

  readonly y!: Length;

  override transform(that: Transform): Transform;
  override transform(x: number, y: number): R2Point;
  override transform(x: Transform | number, y?: number): Transform | R2Point {
    if (arguments.length === 1) {
      if (x instanceof IdentityTransform) {
        return this;
      } else if (x instanceof TranslateTransform) {
        return new TranslateTransform(this.x.plus(x.x), this.y.plus(x.y));
      } else {
        return Transform.list(this, x as Transform);
      }
    } else {
      return new R2Point(this.x.pxValue() + (x as number), this.y.pxValue() + y!);
    }
  }

  override transformX(x: number, y: number): number {
    return this.x.pxValue() + x;
  }

  override transformY(x: number, y: number): number {
    return this.y.pxValue() + y;
  }

  override inverse(): Transform {
    return new TranslateTransform(this.x.negative(), this.y.negative());
  }

  override toAffine(): AffineTransform {
    return new AffineTransform(1, 0, 0, 1, this.x.pxValue(), this.y.pxValue());
  }

  override toCssTransformComponent(): CSSTransformComponent | null {
    if (typeof CSSTranslate !== "undefined") {
      const x = this.x.toCssValue();
      const y = this.y.toCssValue();
      return new CSSTranslate(x!, y!);
    }
    return null;
  }

  override toValue(): Value {
    return Record.create(1)
                 .attr("translate", Record.create(2).slot("x", this.x.toValue())
                                                    .slot("y", this.y.toValue()));
  }

  override interpolateTo(that: TranslateTransform): Interpolator<TranslateTransform>;
  override interpolateTo(that: Transform): Interpolator<Transform>;
  override interpolateTo(that: unknown): Interpolator<Transform> | null;
  override interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof TranslateTransform) {
      return TranslateTransformInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  override conformsTo(that: Transform): boolean {
    return that instanceof TranslateTransform;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof TranslateTransform) {
      return this.x.equivalentTo(that.x, epsilon)
          && this.y.equivalentTo(that.y, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof TranslateTransform) {
      return this.x.equals(that.x) && this.y.equals(that.y);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(TranslateTransform),
        this.x.hashCode()), this.y.hashCode()));
  }

  override debug(output: Output): void {
    output = output.write("Transform").write(46/*'.'*/).write("translate");
    if (this.x.isDefined() && !this.y.isDefined()) {
      output = output.write("X").write(40/*'('*/).debug(this.x).write(41/*')'*/);
    } else if (!this.x.isDefined() && this.y.isDefined()) {
      output = output.write("Y").write(40/*'('*/).debug(this.y).write(41/*')'*/);
    } else {
      output = output.write(40/*'('*/).debug(this.x).write(", ").debug(this.y).write(41/*')'*/);
    }
  }

  /** @hidden */
  readonly stringValue!: string | undefined;

  override toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      if (this.x.isDefined() && !this.y.isDefined()) {
        stringValue = "translate(" + this.x + ",0)";
      } else if (!this.x.isDefined() && this.y.isDefined()) {
        stringValue = "translate(0," + this.y + ")";
      } else {
        stringValue = "translate(" + this.x + "," + this.y + ")";
      }
      Object.defineProperty(this, "stringValue", {
        value: stringValue,
        enumerable: true,
        configurable: true,
      });
    }
    return stringValue;
  }

  override toAttributeString(): string {
    if (this.x.isDefined() && !this.y.isDefined()) {
      return "translate(" + this.x.pxValue() + ",0)";
    } else if (!this.x.isDefined() && this.y.isDefined()) {
      return "translate(0," + this.y.pxValue() + ")";
    } else {
      return "translate(" + this.x.pxValue() + "," + this.y.pxValue() + ")";
    }
  }

  static override fromCssTransformComponent(component: CSSTranslate): TranslateTransform {
    const x = typeof component.x === "number"
            ? Length.px(component.x)
            : Length.fromCssValue(component.x);
    const y = typeof component.y === "number"
            ? Length.px(component.y)
            : Length.fromCssValue(component.y);
    return new TranslateTransform(x, y);
  }

  static override fromAny(value: TranslateTransform | string): TranslateTransform {
    if (value === void 0 || value === null || value instanceof TranslateTransform) {
      return value;
    } else if (typeof value === "string") {
      return TranslateTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static override fromValue(value: Value): TranslateTransform | null {
    const header = value.header("translate");
    if (header.isDefined()) {
      let x = Length.zero();
      let y = Length.zero();
      header.forEach(function (item: Item, index: number) {
        const key = item.key.stringValue();
        if (key !== void 0) {
          if (key === "x") {
            x = item.toValue().cast(Length.form(), x);
          } else if (key === "y") {
            y = item.toValue().cast(Length.form(), y);
          }
        } else if (item instanceof Value) {
          if (index === 0) {
            x = item.cast(Length.form(), x);
          } else if (index === 1) {
            y = item.cast(Length.form(), y);
          }
        }
      }, this);
      return new TranslateTransform(x, y);
    }
    return null;
  }

  static override parse(string: string): TranslateTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = TranslateTransformParser.parse(input);
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
}
