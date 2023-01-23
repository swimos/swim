// Copyright 2015-2023 Swim.inc
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

import {Mutable, Murmur3, Numbers, Constructors, Interpolator} from "@swim/util";
import {Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Item, Value, Record} from "@swim/structure";
import {R2Point} from "../r2/R2Point";
import {Transform} from "./Transform";
import {IdentityTransform} from "./IdentityTransform";
import {ScaleTransformInterpolator} from "../"; // forward import
import {ScaleTransformParser} from "../"; // forward import
import {AffineTransform} from "../"; // forward import

/** @public */
export class ScaleTransform extends Transform {
  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.stringValue = void 0;
  }

  readonly x: number;

  readonly y: number;

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
      return new R2Point(this.x * (x as number), this.y * y!);
    }
  }

  override transformX(x: number, y: number): number {
    return this.x * x;
  }

  override transformY(x: number, y: number): number {
    return this.y * y;
  }

  override inverse(): Transform {
    return new ScaleTransform(1 / (this.x || 1), 1 / (this.y || 1));
  }

  toAffine(): AffineTransform {
    return new AffineTransform(this.x, 0, 0, this.y, 0, 0);
  }

  override toCssTransformComponent(): CSSTransformComponent | null {
    if (typeof CSSTranslate !== "undefined") {
      return new CSSScale(this.x, this.y);
    }
    return null;
  }

  override toValue(): Value {
    return Record.create(1)
                 .attr("scale", Record.create(2).slot("x", this.x)
                                                .slot("y", this.y));
  }

  override interpolateTo(that: ScaleTransform): Interpolator<ScaleTransform>;
  override interpolateTo(that: Transform): Interpolator<Transform>;
  override interpolateTo(that: unknown): Interpolator<Transform> | null;
  override interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof ScaleTransform) {
      return ScaleTransformInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  override conformsTo(that: Transform): boolean {
    return that instanceof ScaleTransform;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof ScaleTransform) {
      return Numbers.equivalent(this.x, that.x, epsilon)
          && Numbers.equivalent(this.y, that.y, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof ScaleTransform) {
      return this.x === that.x && this.y === that.y;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(ScaleTransform),
        Numbers.hash(this.x)), Numbers.hash(this.y)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Transform").write(46/*'.'*/).write("scale");
    if (this.x !== 0 && this.y === 0) {
      output = output.write("X").write(40/*'('*/).debug(this.x);
    } else if (this.x === 0 && this.y !== 0) {
      output = output.write("Y").write(40/*'('*/).debug(this.y);
    } else {
      output = output.write(40/*'('*/).debug(this.x).write(", ").debug(this.y);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  /** @internal */
  readonly stringValue: string | undefined;

  override toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      if (this.x !== 0 && this.y === 0) {
        stringValue = "scaleX(" + this.x + ")";
      } else if (this.x === 0 && this.y !== 0) {
        stringValue = "scaleY(" + this.y + ")";
      } else {
        stringValue = "scale(" + this.x + "," + this.y + ")";
      }
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }

  static override fromCssTransformComponent(component: CSSScale): ScaleTransform {
    const x = typeof component.x === "number"
            ? component.x
            : component.x.to("number").value;
    const y = typeof component.y === "number"
            ? component.y
            : component.y.to("number").value;
    return new ScaleTransform(x, y);
  }

  static override fromAny(value: ScaleTransform | string): ScaleTransform {
    if (value === void 0 || value === null || value instanceof ScaleTransform) {
      return value;
    } else if (typeof value === "string") {
      return ScaleTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static override fromValue(value: Value): ScaleTransform | null {
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

  static override parse(string: string): ScaleTransform {
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
