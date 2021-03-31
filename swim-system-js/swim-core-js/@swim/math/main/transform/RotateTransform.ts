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

import {Murmur3, Constructors} from "@swim/util";
import {Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import type {Interpolator} from "@swim/mapping";
import {Item, Value, Record} from "@swim/structure";
import {Angle} from "../angle/Angle";
import {PointR2} from "../r2/PointR2";
import {Transform} from "./Transform";
import {IdentityTransform} from "./IdentityTransform";
import {RotateTransformInterpolator} from "../"; // forward import
import {RotateTransformParser} from "../"; // forward import
import {AffineTransform} from "../"; // forward import

export class RotateTransform extends Transform {
  constructor(angle: Angle) {
    super();
    Object.defineProperty(this, "angle", {
      value: angle,
      enumerable: true,
    });
    Object.defineProperty(this, "stringValue", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly angle: Angle;

  transform(that: Transform): Transform;
  transform(x: number, y: number): PointR2;
  transform(x: Transform | number, y?: number): Transform | PointR2 {
    if (arguments.length === 1) {
      if (x instanceof IdentityTransform) {
        return this;
      } else {
        return Transform.list(this, x as Transform);
      }
    } else {
      const angle = this.angle.radValue();
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      return new PointR2((x as number) * cosA - y! * sinA,
                         (x as number) * sinA + y! * cosA);
    }
  }

  transformX(x: number, y: number): number {
    const angle = this.angle.radValue();
    return x * Math.cos(angle) - y * Math.sin(angle);
  }

  transformY(x: number, y: number): number {
    const angle = this.angle.radValue();
    return x * Math.sin(angle) + y * Math.cos(angle);
  }

  inverse(): Transform {
    return new RotateTransform(this.angle.negative());
  }

  toAffine(): AffineTransform {
    const angle = this.angle.radValue();
    return new AffineTransform(Math.cos(angle), Math.sin(angle),
                              -Math.sin(angle), Math.cos(angle),
                               0, 0);
  }

  toCssTransformComponent(): CSSTransformComponent | null {
    if (typeof CSSTranslate !== "undefined") {
      const angle = this.angle.toCssValue();
      return new CSSRotate(angle!);
    }
    return null;
  }

  toValue(): Value {
    return Record.create(1).attr("rotate", this.angle.toString());
  }

  interpolateTo(that: RotateTransform): Interpolator<RotateTransform>;
  interpolateTo(that: Transform): Interpolator<Transform>;
  interpolateTo(that: unknown): Interpolator<Transform> | null;
  interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof RotateTransform) {
      return RotateTransformInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  conformsTo(that: Transform): boolean {
    return that instanceof RotateTransform;
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof RotateTransform) {
      return this.angle.equivalentTo(that.angle, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (that instanceof RotateTransform) {
      return this.angle.equals(that.angle);
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(RotateTransform), this.angle.hashCode()));
  }

  debug(output: Output): void {
    output = output.write("Transform").write(46/*'.'*/).write("rotate")
        .write(40/*'('*/).debug(this.angle).write(41/*')'*/);
  }

  /** @hidden */
  declare readonly stringValue: string | undefined;

  toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      stringValue = "rotate(" + this.angle + ")";
      Object.defineProperty(this, "stringValue", {
        value: stringValue,
        enumerable: true,
        configurable: true,
      });
    }
    return stringValue;
  }

  toAttributeString(): string {
    return "rotate(" + this.angle.degValue() + ")";
  }

  static fromCssTransformComponent(component: CSSRotate): RotateTransform {
    const angle = Angle.fromCssValue(component.angle);
    return new RotateTransform(angle);
  }

  static fromAny(value: RotateTransform | string): RotateTransform {
    if (value === void 0 || value === null || value instanceof RotateTransform) {
      return value;
    } else if (typeof value === "string") {
      return RotateTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): RotateTransform | null {
    const header = value.header("rotate");
    if (header.isDefined()) {
      let angle = Angle.zero();
      header.forEach(function (item: Item, index: number) {
        const key = item.key.stringValue();
        if (key === "angle") {
          angle = item.toValue().cast(Angle.form(), angle);
        } else if (item instanceof Value && index === 0) {
          angle = item.cast(Angle.form(), angle);
        }
      }, this);
      return new RotateTransform(angle);
    }
    return null;
  }

  static parse(string: string): RotateTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = RotateTransformParser.parse(input);
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
