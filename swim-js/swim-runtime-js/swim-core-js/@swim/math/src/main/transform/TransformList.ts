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
import type {Output} from "@swim/codec";
import {Item, Value, Record} from "@swim/structure";
import {R2Point} from "../r2/R2Point";
import {Transform} from "./Transform";
import {AffineTransform} from "./AffineTransform";
import {IdentityTransform} from "./IdentityTransform";
import {TransformListInterpolator} from "../"; // forward import

export class TransformList extends Transform {
  constructor(transforms: ReadonlyArray<Transform>) {
    super();
    this.transforms = transforms;
    this.stringValue = void 0;
  }

  readonly transforms: ReadonlyArray<Transform>;

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
      const transforms = this.transforms;
      for (let i = 0, n = transforms.length; i < n; i += 1) {
        const transform = transforms[i]!;
        const xi = transform.transformX(x as number, y!);
        const yi = transform.transformY(x as number, y!);
        x = xi;
        y = yi;
      }
      return new R2Point(x as number, y!);
    }
  }

  override transformX(x: number, y: number): number {
    const transforms = this.transforms;
    for (let i = 0, n = transforms.length; i < n; i += 1) {
      const transform = transforms[i]!;
      const xi = transform.transformX(x, y);
      const yi = transform.transformY(x, y);
      x = xi;
      y = yi;
    }
    return x;
  }

  override transformY(x: number, y: number): number {
    const transforms = this.transforms;
    for (let i = 0, n = transforms.length; i < n; i += 1) {
      const transform = transforms[i]!;
      const xi = transform.transformX(x, y);
      const yi = transform.transformY(x, y);
      x = xi;
      y = yi;
    }
    return y;
  }

  override inverse(): Transform {
    const transforms = this.transforms;
    const n = transforms.length;
    const inverseTransforms = new Array<Transform>(n);
    for (let i = 0; i < n; i += 1) {
      inverseTransforms[i] = transforms[n - i - 1]!.inverse();
    }
    return new TransformList(inverseTransforms);
  }

  override toAffine(): AffineTransform {
    let matrix = AffineTransform.identity();
    const transforms = this.transforms;
    for (let i = 0, n = transforms.length; i < n; i += 1) {
      matrix = matrix.multiply(transforms[i]!.toAffine());
    }
    return matrix;
  }

  override toCssTransformComponent(): CSSTransformComponent | null {
    if (typeof CSSTranslate !== "undefined") {
      return new CSSMatrixComponent(this.toMatrix());
    }
    return null;
  }

  override toCssValue(): CSSStyleValue | null {
    if (typeof CSSTransformValue !== "undefined") {
      const transforms = this.transforms;
      const n = transforms.length;
      const components = new Array<CSSTransformComponent>(n);
      for (let i = 0, n = transforms.length; i < n; i += 1) {
        const transform = transforms[i]!;
        const component = transform.toCssTransformComponent();
        if (component !== null) {
          components[i] = component;
        } else {
          return null;
        }
      }
      return new CSSTransformValue(components);
    }
    return null;
  }

  override toValue(): Value {
    const transforms = this.transforms;
    const n = transforms.length;
    const record = Record.create(n);
    for (let i = 0; i < n; i += 1) {
      record.push(transforms[i]!.toValue());
    }
    return record;
  }

  override interpolateTo(that: TransformList): Interpolator<TransformList>;
  override interpolateTo(that: Transform): Interpolator<Transform>;
  override interpolateTo(that: unknown): Interpolator<Transform> | null;
  override interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof TransformList) {
      return TransformListInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  override conformsTo(that: Transform): boolean {
    if (that instanceof TransformList) {
      const n = this.transforms.length;
      if (n === that.transforms.length) {
        for (let i = 0; i < n; i += 1) {
          if (!this.transforms[i]!.conformsTo(that.transforms[i]!)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof TransformList) {
      const n = this.transforms.length;
      if (n === that.transforms.length) {
        for (let i = 0; i < n; i += 1) {
          if (!this.transforms[i]!.equivalentTo(that.transforms[i]!, epsilon)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof TransformList) {
      const n = this.transforms.length;
      if (n === that.transforms.length) {
        for (let i = 0; i < n; i += 1) {
          if (!this.transforms[i]!.equals(that.transforms[i]!)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  override hashCode(): number {
    let hashValue = Constructors.hash(TransformList);
    const transforms = this.transforms;
    for (let i = 0, n = transforms.length; i < n; i += 1) {
      hashValue = Murmur3.mix(hashValue, transforms[i]!.hashCode());
    }
    return Murmur3.mash(hashValue);
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Transform").write(46/*'.'*/).write("list").write(40/*'('*/);
    const transforms = this.transforms;
    const n = transforms.length;
    if (n > 0) {
      output = output.debug(transforms[0]!);
      for (let i = 1; i < n; i += 1) {
        output = output.write(", ").debug(transforms[i]!);
      }
    }
    output = output.write(41/*')'*/);
    return output;
  }

  /** @internal */
  readonly stringValue: string | undefined;

  override toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      const transforms = this.transforms;
      const n = transforms.length;
      if (n > 0) {
        stringValue = transforms[0]!.toString();
        for (let i = 1; i < n; i += 1) {
          stringValue += " ";
          stringValue += transforms[i]!.toString();
        }
      } else {
        stringValue = "none";
      }
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }

  override toAttributeString(): string {
    const transforms = this.transforms;
    const n = transforms.length;
    if (n > 0) {
      let s = transforms[0]!.toAttributeString();
      for (let i = 1; i < n; i += 1) {
        s += " ";
        s += transforms[i]!.toAttributeString();
      }
      return s;
    } else {
      return "";
    }
  }

  static override fromAny(value: TransformList | string): TransformList {
    if (value === void 0 || value === null || value instanceof TransformList) {
      return value;
    } else if (typeof value === "string") {
      return TransformList.parse(value);
    }
    throw new TypeError("" + value);
  }

  static override fromValue(value: Value): TransformList | null {
    const transforms: Transform[] = [];
    value.forEach(function (item: Item) {
      const transform = Transform.fromValue(item.toValue());
      if (transform !== null) {
        transforms.push(transform);
      }
    }, this);
    if (transforms.length !== 0) {
      return new TransformList(transforms);
    }
    return null;
  }

  static override parse(string: string): TransformList {
    const transform = Transform.parse(string);
    if (transform instanceof TransformList) {
      return transform;
    } else {
      return new TransformList([transform]);
    }
  }
}
