// Copyright 2015-2023 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import {Lazy} from "@swim/util";
import type {HashCode} from "@swim/util";
import type {Equivalent} from "@swim/util";
import type {Interpolate} from "@swim/util";
import type {Interpolator} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Unicode} from "@swim/codec";
import type {Item} from "@swim/structure";
import type {Value} from "@swim/structure";
import {Record} from "@swim/structure";
import {Form} from "@swim/structure";
import type {LengthLike} from "./Length";
import {Length} from "./Length";
import {PxLength} from "./Length";
import type {AngleLike} from "./Angle";
import {Angle} from "./Angle";
import {DegAngle} from "./Angle";
import type {R2Operator} from "./R2Function";
import type {R2Point} from "./R2Point";
import {IdentityTransform} from "./"; // forward import
import {TranslateTransform} from "./"; // forward import
import {TranslateTransformParser} from "./"; // forward import
import {ScaleTransform} from "./"; // forward import
import {ScaleTransformParser} from "./"; // forward import
import {RotateTransform} from "./"; // forward import
import {RotateTransformParser} from "./"; // forward import
import {SkewTransform} from "./"; // forward import
import {SkewTransformParser} from "./"; // forward import
import {AffineTransform} from "./"; // forward import
import {AffineTransformInterpolator} from "./"; // forward import
import {AffineTransformParser} from "./"; // forward import
import {TransformList} from "./"; // forward import
import {TransformListParser} from "./"; // forward import

/** @public */
export type TransformLike = Transform | string;

/** @public */
export const TransformLike = {
  [Symbol.hasInstance](instance: unknown): instance is TransformLike {
    return instance instanceof Transform
        || typeof instance === "string";
  },
};

/** @public */
export abstract class Transform implements R2Operator, Interpolate<Transform>, HashCode, Equivalent, Debug {
  likeType?(like: string): void;

  abstract transform(that: Transform): Transform;
  abstract transform(x: number, y: number): R2Point;

  abstract transformX(x: number, y: number): number;

  abstract transformY(x: number, y: number): number;

  abstract inverse(): Transform;

  translate(x: LengthLike, y: LengthLike): Transform {
    return this.transform(Transform.translate(x, y));
  }

  translateX(x: LengthLike): Transform {
    return this.transform(Transform.translateX(x));
  }

  translateY(y: LengthLike): Transform {
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

  rotate(a: AngleLike): Transform {
    return this.transform(Transform.rotate(a));
  }

  skew(x: AngleLike, y: AngleLike): Transform {
    return this.transform(Transform.skew(x, y));
  }

  skewX(x: AngleLike): Transform {
    return this.transform(Transform.skewX(x));
  }

  skewY(y: AngleLike): Transform {
    return this.transform(Transform.skewY(y));
  }

  abstract toAffine(): AffineTransform;

  toMatrix(): DOMMatrix {
    return this.toAffine().toMatrix();
  }

  toCssTransformComponent(): CSSTransformComponent | null {
    return null;
  }

  toCssValue(): CSSStyleValue | null {
    if (typeof CSSTransformValue === "undefined") {
      return null;
    }
    const component = this.toCssTransformComponent();
    if (component === null) {
      return null;
    }
    return new CSSTransformValue([component]);
  }

  abstract toValue(): Value;

  /** @override */
  interpolateTo(that: Transform): Interpolator<Transform>;
  interpolateTo(that: unknown): Interpolator<Transform> | null;
  interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof Transform) {
      return AffineTransformInterpolator(this.toAffine(), that.toAffine());
    }
    return null;
  }

  abstract conformsTo(that: Transform): boolean;

  /** @override */
  abstract equivalentTo(that: unknown, epsilon?: number): boolean;

  /** @override */
  abstract equals(that: unknown): boolean;

  /** @override */
  abstract hashCode(): number;

  /** @override */
  abstract debug<T>(output: Output<T>): Output<T>;

  /** @override */
  abstract toString(): string;

  toAttributeString(): string {
    return this.toString();
  }

  @Lazy
  static identity(): Transform {
    return new IdentityTransform();
  }

  static translate(x: LengthLike, y: LengthLike): TranslateTransform {
    x = Length.fromLike(x);
    y = Length.fromLike(y);
    return new TranslateTransform(x, y);
  }

  static translateX(x: LengthLike): TranslateTransform {
    x = Length.fromLike(x);
    return new TranslateTransform(x, PxLength.zero());
  }

  static translateY(y: LengthLike): TranslateTransform {
    y = Length.fromLike(y);
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

  static rotate(a: AngleLike): RotateTransform {
    a = Angle.fromLike(a, "deg");
    return new RotateTransform(a);
  }

  static skew(x: AngleLike, y: AngleLike): SkewTransform {
    x = Angle.fromLike(x, "deg");
    y = Angle.fromLike(y, "deg");
    return new SkewTransform(x, y);
  }

  static skewX(x: AngleLike): SkewTransform {
    x = Angle.fromLike(x, "deg");
    return new SkewTransform(x, DegAngle.zero());
  }

  static skewY(y: AngleLike): SkewTransform {
    y = Angle.fromLike(y, "deg");
    return new SkewTransform(DegAngle.zero(), y);
  }

  static affine(x0: number = 1, y0: number = 0,
                x1: number = 0, y1: number = 1,
                tx: number = 0, ty: number = 0): AffineTransform {
    return new AffineTransform(x0, y0, x1, y1, tx, ty);
  }

  static list(...transforms: TransformLike[]): TransformList {
    const list: Transform[] = [];
    for (let i = 0; i < transforms.length; i += 1) {
      const transform = Transform.fromLike(transforms[i]!);
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
    }
    throw new TypeError("" + value);
  }

  /** @internal */
  static fromCssTransform(value: CSSTransformValue): Transform {
    const n = value.length;
    if (n === 1) {
      return Transform.fromCssTransformComponent(value[0]!);
    }
    const transforms = new Array<Transform>(n);
    for (let i = 0; i < n; i += 1) {
      transforms[i] = Transform.fromCssTransformComponent(value[i]!);
    }
    return new TransformList(transforms);
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
    }
    throw new TypeError("" + component);
  }

  static fromLike<T extends TransformLike | null | undefined>(value: T): Transform | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Transform) {
      return value as Transform | Uninitable<T>;
    } else if (typeof value === "string") {
      return Transform.parse(value);
    }
    throw new TypeError("" + value);
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
  static form(): Form<Transform, TransformLike> {
    return new TransformForm(Transform.identity());
  }
}

/** @internal */
export class TransformForm extends Form<Transform, TransformLike> {
  constructor(unit: Transform | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly unit: Transform | undefined;

  override withUnit(unit: Transform | undefined): Form<Transform, TransformLike> {
    if (unit === this.unit) {
      return this;
    }
    return new TransformForm(unit);
  }

  override mold(transform: TransformLike): Item {
    transform = Transform.fromLike(transform);
    return transform.toValue();
  }

  override cast(item: Item): Transform | undefined {
    const value = item.toValue();
    try {
      if (value instanceof Record) {
        const transform = Transform.fromValue(value);
        return transform !== null ? transform : void 0;
      } else {
        const string = value.stringValue(void 0);
        if (string !== void 0) {
          return Transform.parse(string);
        }
      }
    } catch (e) {
      // swallow
    }
    return void 0;
  }
}

/** @internal */
export class TransformParser extends Parser<Transform> {
  private readonly identOutput: Output<string> | undefined;

  constructor(identOutput?: Output<string>) {
    super();
    this.identOutput = identOutput;
  }

  override feed(input: Input): Parser<Transform> {
    return TransformParser.parse(input, this.identOutput);
  }

  static parse(input: Input, identOutput?: Output<string>): Parser<Transform> {
    let c = 0;
    identOutput = identOutput || Unicode.stringOutput();
    while (input.isCont() && (c = input.head(), Unicode.isAlpha(c) || Unicode.isDigit(c) || c === 45/*'-'*/)) {
      input = input.step();
      identOutput.write(c);
    }
    if (!input.isEmpty()) {
      const ident = identOutput.bind();
      switch (ident) {
        case "translate3d":
        case "translateX":
        case "translateY":
        case "translate": return TranslateTransformParser.parseRest(input, identOutput);
        case "scaleX":
        case "scaleY":
        case "scale": return ScaleTransformParser.parseRest(input, identOutput);
        case "rotate": return RotateTransformParser.parseRest(input, identOutput);
        case "skewX":
        case "skewY":
        case "skew": return SkewTransformParser.parseRest(input, identOutput);
        case "matrix": return AffineTransformParser.parseRest(input, identOutput);
        case "none": return Parser.done(Transform.identity());
        default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
      }
    }
    return new TransformParser(identOutput);
  }
}
