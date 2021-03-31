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

import {Murmur3, Numbers, Constructors} from "@swim/util";
import {Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import type {Interpolator} from "@swim/mapping";
import {Item, Value, Record} from "@swim/structure";
import {PointR2} from "../r2/PointR2";
import {Transform} from "./Transform";
import {IdentityTransform} from "./IdentityTransform";
import {ScaleTransformInterpolator} from "../"; // forward import
import {ScaleTransformParser} from "../"; // forward import
import {AffineTransform} from "../"; // forward import

export class ScaleTransform extends Transform {
  constructor(x: number, y: number) {
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

  declare readonly x: number;

  declare readonly y: number;

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
      return new PointR2(this.x * (x as number), this.y * y!);
    }
  }

  transformX(x: number, y: number): number {
    return this.x * x;
  }

  transformY(x: number, y: number): number {
    return this.y * y;
  }

  inverse(): Transform {
    return new ScaleTransform(1 / (this.x || 1), 1 / (this.y || 1));
  }

  toAffine(): AffineTransform {
    return new AffineTransform(this.x, 0, 0, this.y, 0, 0);
  }

  toCssTransformComponent(): CSSTransformComponent | null {
    if (typeof CSSTranslate !== "undefined") {
      return new CSSScale(this.x, this.y);
    }
    return null;
  }

  toValue(): Value {
    return Record.create(1)
                 .attr("scale", Record.create(2).slot("x", this.x)
                                                .slot("y", this.y));
  }

  interpolateTo(that: ScaleTransform): Interpolator<ScaleTransform>;
  interpolateTo(that: Transform): Interpolator<Transform>;
  interpolateTo(that: unknown): Interpolator<Transform> | null;
  interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof ScaleTransform) {
      return ScaleTransformInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  conformsTo(that: Transform): boolean {
    return that instanceof ScaleTransform;
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof ScaleTransform) {
      return Numbers.equivalent(this.x, that.x, epsilon)
          && Numbers.equivalent(this.y, that.y, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (that instanceof ScaleTransform) {
      return this.x === that.x && this.y === that.y;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(ScaleTransform),
        Numbers.hash(this.x)), Numbers.hash(this.y)));
  }

  debug(output: Output): void {
    output = output.write("Transform").write(46/*'.'*/).write("scale");
    if (this.x !== 0 && this.y === 0) {
      output = output.write("X").write(40/*'('*/).debug(this.x).write(41/*')'*/);
    } else if (this.x === 0 && this.y !== 0) {
      output = output.write("Y").write(40/*'('*/).debug(this.y).write(41/*')'*/);
    } else {
      output = output.write(40/*'('*/).debug(this.x).write(", ").debug(this.y).write(41/*')'*/);
    }
  }

  /** @hidden */
  declare readonly stringValue: string | undefined;

  toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      if (this.x !== 0 && this.y === 0) {
        stringValue = "scaleX(" + this.x + ")";
      } else if (this.x === 0 && this.y !== 0) {
        stringValue = "scaleY(" + this.y + ")";
      } else {
        stringValue = "scale(" + this.x + "," + this.y + ")";
      }
      Object.defineProperty(this, "stringValue", {
        value: stringValue,
        enumerable: true,
        configurable: true,
      });
    }
    return stringValue;
  }

  static fromCssTransformComponent(component: CSSScale): ScaleTransform {
    const x = typeof component.x === "number"
            ? component.x
            : component.x.to("number").value;
    const y = typeof component.y === "number"
            ? component.y
            : component.y.to("number").value;
    return new ScaleTransform(x, y);
  }

  static fromAny(value: ScaleTransform | string): ScaleTransform {
    if (value === void 0 || value === null || value instanceof ScaleTransform) {
      return value;
    } else if (typeof value === "string") {
      return ScaleTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): ScaleTransform | null {
    const header = value.header("scale");
    if (header.isDefined()) {
      let x = 0;
      let y = 0;
      header.forEach(function (item: Item, index: number) {
        const key = item.key.stringValue();
        if (key !== void 0) {
          if (key === "x") {
            x = item.toValue().numberValue(x);
          } else if (key === "y") {
            y = item.toValue().numberValue(y);
          }
        } else if (item instanceof Value) {
          if (index === 0) {
            x = item.numberValue(x);
          } else if (index === 1) {
            y = item.numberValue(y);
          }
        }
      }, this);
      return new ScaleTransform(x, y);
    }
    return null;
  }

  static parse(string: string): ScaleTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = ScaleTransformParser.parse(input);
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
