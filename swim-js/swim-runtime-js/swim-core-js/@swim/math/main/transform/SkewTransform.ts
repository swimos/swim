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

import {Mutable, Murmur3, Constructors, Interpolator} from "@swim/util";
import {Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Item, Value, Record} from "@swim/structure";
import {Angle} from "../angle/Angle";
import {R2Point} from "../r2/R2Point";
import {Transform} from "./Transform";
import {IdentityTransform} from "./IdentityTransform";
import {SkewTransformInterpolator} from "../"; // forward import
import {SkewTransformParser} from "../"; // forward import
import {AffineTransform} from "../"; // forward import

export class SkewTransform extends Transform {
  constructor(x: Angle, y: Angle) {
    super();
    this.x = x;
    this.y = y;
    this.stringValue = void 0;
  }

  readonly x: Angle;

  readonly y: Angle;

  override transform(that: Transform): Transform;
  override transform(x: number, y: number): R2Point;
  override transform(x: Transform | number, y?: number): Transform | R2Point {
    if (arguments.length === 1) {
      if (x instanceof IdentityTransform) {
        return this;
      } else {
        return Transform.list(this, x as Transform);
      }
    } else {
      return new R2Point(Math.tan(this.x.radValue()) * y! + (x as number),
                         Math.tan(this.y.radValue()) * (x as number) + y!);
    }
  }

  override transformX(x: number, y: number): number {
    return Math.tan(this.x.radValue()) * y + x;
  }

  override transformY(x: number, y: number): number {
    return Math.tan(this.y.radValue()) * x + y;
  }

  override inverse(): Transform {
    return new SkewTransform(this.x.negative(), this.y.negative());
  }

  override toAffine(): AffineTransform {
    const x = this.x.radValue();
    const y = this.y.radValue();
    return new AffineTransform(1, Math.tan(y), Math.tan(x), 1, 0, 0);
  }

  override toCssTransformComponent(): CSSTransformComponent | null {
    if (typeof CSSTranslate !== "undefined") {
      const x = this.x.toCssValue();
      const y = this.y.toCssValue();
      return new CSSSkew(x!, y!);
    }
    return null;
  }

  override toValue(): Value {
    return Record.create(1)
                 .attr("skew", Record.create(2).slot("x", this.x.toValue())
                                               .slot("y", this.y.toValue()));
  }

  override interpolateTo(that: SkewTransform): Interpolator<SkewTransform>;
  override interpolateTo(that: Transform): Interpolator<Transform>;
  override interpolateTo(that: unknown): Interpolator<Transform> | null;
  override interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof SkewTransform) {
      return SkewTransformInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  override conformsTo(that: Transform): boolean {
    return that instanceof SkewTransform;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof SkewTransform) {
      return this.x.equivalentTo(that.x, epsilon)
          && this.y.equivalentTo(that.y, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof SkewTransform) {
      return this.x.equals(that.x) && this.y.equals(that.y);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(SkewTransform),
        this.x.hashCode()), this.y.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Transform").write(46/*'.'*/).write("skew");
    if (this.x.isDefined() && !this.y.isDefined()) {
      output = output.write("X").write(40/*'('*/).debug(this.x);
    } else if (!this.x.isDefined() && this.y.isDefined()) {
      output = output.write("Y").write(40/*'('*/).debug(this.y);
    } else {
      output = output.write(40/*'('*/).debug(this.x).write(", ").debug(this.y);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  /** @hidden */
  readonly stringValue: string | undefined;

  override toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      if (this.x.isDefined() && !this.y.isDefined()) {
        stringValue = "skewX(" + this.x + ")";
      } else if (!this.x.isDefined() && this.y.isDefined()) {
        stringValue = "skewY(" + this.y + ")";
      } else {
        stringValue = "skew(" + this.x + "," + this.y + ")";
      }
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }

  override toAttributeString(): string {
    if (this.x.isDefined() && !this.y.isDefined()) {
      return "skewX(" + this.x.degValue() + ")";
    } else if (!this.x.isDefined() && this.y.isDefined()) {
      return "skewY(" + this.y.degValue() + ")";
    } else {
      return "skew(" + this.x.degValue() + "," + this.y.degValue() + ")";
    }
  }

  static override fromCssTransformComponent(component: CSSSkew): SkewTransform {
    const x = typeof component.ax === "number"
            ? Angle.rad(component.ax)
            : Angle.fromCssValue(component.ax);
    const y = typeof component.ay === "number"
            ? Angle.rad(component.ay)
            : Angle.fromCssValue(component.ay);
    return new SkewTransform(x, y);
  }

  static override fromAny(value: SkewTransform | string): SkewTransform {
    if (value === void 0 || value === null || value instanceof SkewTransform) {
      return value;
    } else if (typeof value === "string") {
      return SkewTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static override fromValue(value: Value): SkewTransform | null {
    const header = value.header("skew");
    if (header.isDefined()) {
      let x = Angle.zero();
      let y = Angle.zero();
      header.forEach(function (item: Item, index: number) {
        const key = item.key.stringValue();
        if (key !== void 0) {
          if (key === "x") {
            x = item.toValue().cast(Angle.form(), x);
          } else if (key === "y") {
            y = item.toValue().cast(Angle.form(), y);
          }
        } else if (item instanceof Value) {
          if (index === 0) {
            x = item.cast(Angle.form(), x);
          } else if (index === 1) {
            y = item.cast(Angle.form(), y);
          }
        }
      }, this);
      return new SkewTransform(x, y);
    }
    return null;
  }

  static override parse(string: string): SkewTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = SkewTransformParser.parse(input);
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
