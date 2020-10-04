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

import {HashCode} from "@swim/util";
import {Output, Parser, Debug, Diagnostic, Unicode} from "@swim/codec";
import {Value, Form} from "@swim/structure";
import {R2Operator} from "@swim/math";
import {AnyAngle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {IdentityTransform} from "./IdentityTransform";
import {TranslateTransform} from "./TranslateTransform";
import {ScaleTransform} from "./ScaleTransform";
import {RotateTransform} from "./RotateTransform";
import {SkewTransform} from "./SkewTransform";
import {AffineTransform} from "./AffineTransform";
import {TransformList} from "./TransformList";
import {TranslateTransformParser} from "./TranslateTransformParser";
import {ScaleTransformParser} from "./ScaleTransformParser";
import {RotateTransformParser} from "./RotateTransformParser";
import {SkewTransformParser} from "./SkewTransformParser";
import {AffineTransformParser} from "./AffineTransformParser";
import {TransformListParser} from "./TransformListParser";
import {TransformParser} from "./TransformParser";
import {TransformForm} from "./TransformForm";

export type AnyTransform = Transform | string;

export interface Transformation {
  transform(point: [number, number]): [number, number];
  transform(x: number, y: number): [number, number];
  transform(point: [AnyLength, AnyLength]): [Length, Length];
  transform(x: AnyLength, y: AnyLength): [Length, Length];
}

export abstract class Transform implements Transformation, R2Operator, HashCode, Debug {
  abstract transform(that: Transform): Transform;
  abstract transform(point: [number, number]): [number, number];
  abstract transform(x: number, y: number): [number, number];
  abstract transform(point: [AnyLength, AnyLength]): [Length, Length];
  abstract transform(x: AnyLength, y: AnyLength): [Length, Length];

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

  scale(x: string | number, y: string | number): Transform {
    return this.transform(Transform.scale(x, y));
  }

  scaleX(x: string | number): Transform {
    return this.transform(Transform.scaleX(x));
  }

  scaleY(y: string | number): Transform {
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

  toCssTransformComponent(): CSSTransformComponent | undefined {
    return void 0; // conditionally overridden when CSS Typed OM is available
  }

  toCssValue(): CSSStyleValue | undefined {
    return void 0; // conditionally overridden when CSS Typed OM is available
  }

  abstract toValue(): Value;

  abstract conformsTo(that: Transform): boolean;

  abstract equals(that: Transform): boolean;

  abstract hashCode(): number;

  abstract debug(output: Output): void;

  abstract toString(): string;

  toAttributeString(): string {
    return this.toString();
  }

  private static _identity?: IdentityTransform;
  static identity(): IdentityTransform {
    if (Transform._identity === void 0) {
      Transform._identity = new Transform.Identity();
    }
    return Transform._identity;
  }

  static translate(x: AnyLength, y: AnyLength): TranslateTransform {
    return Transform.Translate.from(x, y);
  }

  static translateX(x: AnyLength): TranslateTransform {
    return Transform.Translate.from(x, 0);
  }

  static translateY(y: AnyLength): TranslateTransform {
    return Transform.Translate.from(0, y);
  }

  static scale(x: string | number, y: string | number): ScaleTransform {
    return Transform.Scale.from(x, y);
  }

  static scaleX(x: string | number): ScaleTransform {
    return Transform.Scale.from(x, 1);
  }

  static scaleY(y: string | number): ScaleTransform {
    return Transform.Scale.from(1, y);
  }

  static rotate(a: AnyAngle): RotateTransform {
    return Transform.Rotate.from(a);
  }

  static skew(x: AnyAngle, y: AnyAngle): SkewTransform {
    return Transform.Skew.from(x, y);
  }

  static skewX(x: AnyAngle): SkewTransform {
    return Transform.Skew.from(x, 0);
  }

  static skewY(y: AnyAngle): SkewTransform {
    return Transform.Skew.from(0, y);
  }

  static affine(x0?: string | number, y0?: string | number,
                x1?: string | number, y1?: string | number,
                tx?: string | number, ty?: string | number): AffineTransform {
    return Transform.Affine.from(x0, y0, x1, y1, tx, ty);
  }

  static list(...transforms: AnyTransform[]): TransformList {
    return Transform.List.from(transforms);
  }

  static fromCss(value: CSSStyleValue): Transform {
    if (value instanceof CSSTransformValue) {
      return Transform.fromCssTransform(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  /** @hidden */
  static fromCssTransform(value: CSSTransformValue): Transform {
    const n = value.length;
    const transforms = new Array<Transform>(n);
    for (let i = 0; i < n; i += 1) {
      transforms[i] = Transform.fromCssTransformComponent(value[i]!);
    }
    return new Transform.List(transforms);
  }

  static fromCssTransformComponent(component: CSSTransformComponent): Transform {
    if (component instanceof CSSTranslate) {
      return Transform.Translate.fromCssTransformComponent(component);
    } else if (component instanceof CSSRotate) {
      return Transform.Rotate.fromCssTransformComponent(component);
    } else if (component instanceof CSSScale) {
      return Transform.Scale.fromCssTransformComponent(component);
    } else if (component instanceof CSSSkew) {
      return Transform.Skew.fromCssTransformComponent(component);
    } else if (component instanceof CSSMatrixComponent) {
      return Transform.Affine.fromCssTransformComponent(component);
    } else {
      throw new TypeError("" + component);
    }
  }

  static fromAny(value: AnyTransform): Transform {
    if (value instanceof Transform) {
      return value;
    } else if (typeof value === "string") {
      return Transform.parse(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static fromValue(value: Value): Transform | undefined {
    const tag = value.tag();
    switch (tag) {
      case "identity": return Transform.Identity.fromValue(value);
      case "translate": return Transform.Translate.fromValue(value);
      case "scale": return Transform.Scale.fromValue(value);
      case "rotate": return Transform.Rotate.fromValue(value);
      case "skew": return Transform.Skew.fromValue(value);
      case "matrix": return Transform.Affine.fromValue(value);
      default: return Transform.List.fromValue(value);
    }
  }

  static parse(string: string): Transform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = Transform.ListParser.parse(input);
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
  static isAny(value: unknown): value is AnyTransform {
    return value instanceof Transform
        || typeof value === "string";
  }

  private static _form?: Form<Transform, AnyTransform>;
  static form(unit?: AnyTransform): Form<Transform, AnyTransform> {
    if (unit !== void 0) {
      return new Transform.Form(Transform.fromAny(unit));
    } else {
      if (Transform._form === void 0) {
        Transform._form = new Transform.Form();
      }
      return Transform._form;
    }
  }

  // Forward type declarations
  /** @hidden */
  static Identity: typeof IdentityTransform; // defined by IdentityTransform
  /** @hidden */
  static Translate: typeof TranslateTransform; // defined by TranslateTransform
  /** @hidden */
  static Scale: typeof ScaleTransform; // defined by ScaleTransform
  /** @hidden */
  static Rotate: typeof RotateTransform; // defined by RotateTransform
  /** @hidden */
  static Skew: typeof SkewTransform; // defined by SkewTransform
  /** @hidden */
  static Affine: typeof AffineTransform; // defined by AffineTransform
  /** @hidden */
  static List: typeof TransformList; // defined by TransformList
  /** @hidden */
  static TranslateParser: typeof TranslateTransformParser; // defined by TranslateTransformParser
  /** @hidden */
  static ScaleParser: typeof ScaleTransformParser; // defined by ScaleTransformParser
  /** @hidden */
  static RotateParser: typeof RotateTransformParser; // defined by RotateTransformParser
  /** @hidden */
  static SkewParser: typeof SkewTransformParser; // defined by SkewTransformParser
  /** @hidden */
  static AffineParser: typeof AffineTransformParser; // defined by AffineTransformParser
  /** @hidden */
  static ListParser: typeof TransformListParser; // defined by TransformListParser
  /** @hidden */
  static Parser: typeof TransformParser; // defined by TransformParser
  /** @hidden */
  static Form: typeof TransformForm; // defined by TransformForm
}
if (typeof CSSTransformValue !== "undefined") { // CSS Typed OM support
  Transform.prototype.toCssValue = function (this: Transform): CSSTransformValue | undefined {
    const component = this.toCssTransformComponent();
    return component !== void 0 ? new CSSTransformValue([component]) : void 0;
  };
}
