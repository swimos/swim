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

import {HashCode, Equivalent, Lazy} from "@swim/util";
import {Output, Parser, Debug, Diagnostic, Unicode} from "@swim/codec";
import type {Interpolate, Interpolator} from "@swim/mapping";
import type {Value, Form} from "@swim/structure";
import {AnyLength, Length} from "../length/Length";
import {PxLength} from "../length/PxLength";
import {AnyAngle, Angle} from "../angle/Angle";
import {DegAngle} from "../angle/DegAngle";
import type {R2Operator} from "../r2/R2Operator";
import type {R2Point} from "../r2/R2Point";
import {TransformForm} from "../"; // forward import
import {IdentityTransform} from "../"; // forward import
import {TranslateTransform} from "../"; // forward import
import {ScaleTransform} from "../"; // forward import
import {RotateTransform} from "../"; // forward import
import {SkewTransform} from "../"; // forward import
import {AffineTransform} from "../"; // forward import
import {AffineTransformInterpolator} from "../"; // forward import
import {TransformList} from "../"; // forward import
import {TransformListParser} from "../"; // forward import

export type AnyTransform = Transform | string;

export abstract class Transform implements R2Operator, Interpolate<Transform>, HashCode, Equivalent, Debug {
  abstract transform(that: Transform): Transform;
  abstract transform(x: number, y: number): R2Point;

  abstract transformX(x: number, y: number): number;

  abstract transformY(x: number, y: number): number;

  abstract inverse(): Transform;

  translate(x: AnyLength, y: AnyLength): Transform {
    return this.transform(Transform.translate(x, y));
  }

  translateX(x: AnyLength): Transform {
    return this.transform(Transform.translateX(x));
  }

  translateY(y: AnyLength): Transform {
    return this.transform(Transform.translateY(y));
  }

  scale(x: number, y: number): Transform {
    return this.transform(Transform.scale(x, y));
  }

  scaleX(x: number): Transform {
    return this.transform(Transform.scaleX(x));
  }

  scaleY(y: number): Transform {
    return this.transform(Transform.scaleY(y));
  }

  rotate(a: AnyAngle): Transform {
    return this.transform(Transform.rotate(a));
  }

  skew(x: AnyAngle, y: AnyAngle): Transform {
    return this.transform(Transform.skew(x, y));
  }

  skewX(x: AnyAngle): Transform {
    return this.transform(Transform.skewX(x));
  }

  skewY(y: AnyAngle): Transform {
    return this.transform(Transform.skewY(y));
  }

  abstract toAffine(): AffineTransform;

  toMatrix(): DOMMatrix {
    return this.toAffine().toMatrix();
  }

  toCssTransformComponent(): CSSTransformComponent | null {
    return null
  }

  toCssValue(): CSSStyleValue | null {
    if (typeof CSSTransformValue !== "undefined") {
      const component = this.toCssTransformComponent();
      if (component !== null) {
        return new CSSTransformValue([component]);
      }
    }
    return null;
  }

  abstract toValue(): Value;

  interpolateTo(that: Transform): Interpolator<Transform>;
  interpolateTo(that: unknown): Interpolator<Transform> | null;
  interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof Transform) {
      return AffineTransformInterpolator(this.toAffine(), that.toAffine());
    } else {
      return null;
    }
  }

  abstract conformsTo(that: Transform): boolean;

  abstract equivalentTo(that: unknown, epsilon?: number): boolean;

  abstract equals(that: unknown): boolean;

  abstract hashCode(): number;

  abstract debug<T>(output: Output<T>): Output<T>;

  abstract toString(): string;

  toAttributeString(): string {
    return this.toString();
  }

  @Lazy
  static identity(): Transform {
    return new IdentityTransform();
  }

  static translate(x: AnyLength, y: AnyLength): TranslateTransform {
    x = Length.fromAny(x);
    y = Length.fromAny(y);
    return new TranslateTransform(x, y);
  }

  static translateX(x: AnyLength): TranslateTransform {
    x = Length.fromAny(x);
    return new TranslateTransform(x, PxLength.zero());
  }

  static translateY(y: AnyLength): TranslateTransform {
    y = Length.fromAny(y);
    return new TranslateTransform(PxLength.zero(), y);
  }

  static scale(x: number, y: number): ScaleTransform {
    return new ScaleTransform(x, y);
  }

  static scaleX(x: number): ScaleTransform {
    return new ScaleTransform(x, 1);
  }

  static scaleY(y: number): ScaleTransform {
    return new ScaleTransform(1, y);
  }

  static rotate(a: AnyAngle): RotateTransform {
    a = Angle.fromAny(a, "deg");
    return new RotateTransform(a);
  }

  static skew(x: AnyAngle, y: AnyAngle): SkewTransform {
    x = Angle.fromAny(x, "deg");
    y = Angle.fromAny(y, "deg");
    return new SkewTransform(x, y);
  }

  static skewX(x: AnyAngle): SkewTransform {
    x = Angle.fromAny(x, "deg");
    return new SkewTransform(x, DegAngle.zero());
  }

  static skewY(y: AnyAngle): SkewTransform {
    y = Angle.fromAny(y, "deg");
    return new SkewTransform(DegAngle.zero(), y);
  }

  static affine(x0: number = 1, y0: number = 0,
                x1: number = 0, y1: number = 1,
                tx: number = 0, ty: number = 0): AffineTransform {
    return new AffineTransform(x0, y0, x1, y1, tx, ty);
  }

  static list(...transforms: AnyTransform[]): TransformList {
    const list: Transform[] = [];
    for (let i = 0; i < transforms.length; i += 1) {
      const transform = Transform.fromAny(transforms[i]!);
      if (transform instanceof TransformList) {
        list.push(...transform.transforms);
      } else if (!(transform instanceof IdentityTransform)) {
        list.push(transform);
      }
    }
    return new TransformList(list);
  }

  static fromCssValue(value: CSSStyleValue): Transform {
    if (value instanceof CSSTransformValue) {
      return Transform.fromCssTransform(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  /** @hidden */
  static fromCssTransform(value: CSSTransformValue): Transform {
    const n = value.length;
    if (n === 1) {
      return Transform.fromCssTransformComponent(value[0]!);
    } else {
      const transforms = new Array<Transform>(n);
      for (let i = 0; i < n; i += 1) {
        transforms[i] = Transform.fromCssTransformComponent(value[i]!);
      }
      return new TransformList(transforms);
    }
  }

  static fromCssTransformComponent(component: CSSTransformComponent): Transform {
    if (component instanceof CSSTranslate) {
      return TranslateTransform.fromCssTransformComponent(component);
    } else if (component instanceof CSSRotate) {
      return RotateTransform.fromCssTransformComponent(component);
    } else if (component instanceof CSSScale) {
      return ScaleTransform.fromCssTransformComponent(component);
    } else if (component instanceof CSSSkew) {
      return SkewTransform.fromCssTransformComponent(component);
    } else if (component instanceof CSSMatrixComponent) {
      return AffineTransform.fromCssTransformComponent(component);
    } else {
      throw new TypeError("" + component);
    }
  }

  static fromAny(value: AnyTransform): Transform {
    if (value === void 0 || value === null || value instanceof Transform) {
      return value;
    } else if (typeof value === "string") {
      return Transform.parse(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static fromValue(value: Value): Transform | null {
    const tag = value.tag;
    switch (tag) {
      case "identity": return IdentityTransform.fromValue(value);
      case "translate": return TranslateTransform.fromValue(value);
      case "scale": return ScaleTransform.fromValue(value);
      case "rotate": return RotateTransform.fromValue(value);
      case "skew": return SkewTransform.fromValue(value);
      case "matrix": return AffineTransform.fromValue(value);
      default: return TransformList.fromValue(value);
    }
  }

  static parse(string: string): Transform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = TransformListParser.parse(input);
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

  @Lazy
  static form(): Form<Transform, AnyTransform> {
    return new TransformForm(Transform.identity());
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyTransform {
    return value instanceof Transform
        || typeof value === "string";
  }
}
