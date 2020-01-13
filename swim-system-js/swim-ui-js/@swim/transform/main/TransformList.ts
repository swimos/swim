// Copyright 2015-2020 SWIM.AI inc.
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

import {Murmur3} from "@swim/util";
import {Output} from "@swim/codec";
import {Item, Value, Record} from "@swim/structure";
import {AnyLength, Length} from "@swim/length";
import {AnyTransform, Transform} from "./Transform";
import {AffineTransform} from "./AffineTransform";

export class TransformList extends Transform {
  /** @hidden */
  readonly _transforms: ReadonlyArray<Transform>;

  constructor(transforms: ReadonlyArray<AnyTransform>) {
    super();
    const list = [];
    for (let i = 0; i < transforms.length; i += 1) {
      const transform = Transform.fromAny(transforms[i]);
      if (transform instanceof TransformList) {
        list.push(...transform._transforms);
      } else if (transform && !(transform instanceof Transform.Identity)) {
        list.push(transform);
      }
    }
    this._transforms = list;
  }

  get transforms(): ReadonlyArray<Transform> {
    return this._transforms;
  }

  transform(that: Transform): Transform;
  transform(point: [number, number]): [number, number];
  transform(x: number, y: number): [number, number];
  transform(point: [AnyLength, AnyLength]): [Length, Length];
  transform(x: AnyLength, y: AnyLength): [Length, Length];
  transform(x: Transform | [AnyLength, AnyLength] | AnyLength, y?: AnyLength): Transform | [number, number] | [Length, Length] {
    if (x instanceof Transform) {
      if (x instanceof Transform.Identity) {
        return this;
      } else {
        return new Transform.List([this, x]);
      }
    } else {
      if (Array.isArray(x)) {
        y = x[1];
        x = x[0];
      }
      const transforms = this._transforms;
      if (typeof x === "number" && typeof y === "number") {
        let point: [number, number] = [x, y];
        for (let i = 0, n = transforms.length; i < n; i += 1) {
          point = transforms[i].transform(point);
        }
        return point;
      } else {
        let point: [Length, Length] = [Length.fromAny(x), Length.fromAny(y!)];
        for (let i = 0, n = transforms.length; i < n; i += 1) {
          point = transforms[i].transform(point);
        }
        return point;
      }
    }
  }

  transformX(x: number, y: number): number {
    const transforms = this._transforms;
    for (let i = 0, n = transforms.length; i < n; i += 1) {
      x = transforms[i].transformX(x, y);
      y = transforms[i].transformX(x, y);
    }
    return x;
  }

  transformY(x: number, y: number): number {
    const transforms = this._transforms;
    for (let i = 0, n = transforms.length; i < n; i += 1) {
      x = transforms[i].transformX(x, y);
      y = transforms[i].transformX(x, y);
    }
    return y;
  }

  inverse(): Transform {
    const transforms = this._transforms;
    const n = transforms.length;
    const inverseTransforms = new Array<Transform>(n);
    for (let i = 0; i < n; i += 1) {
      inverseTransforms[i] = transforms[n - i - 1].inverse();
    }
    return new TransformList(inverseTransforms);
  }

  toAffine(): AffineTransform {
    let matrix = AffineTransform.identity();
    const transforms = this._transforms;
    for (let i = 0, n = transforms.length; i < n; i += 1) {
      matrix = matrix.multiply(transforms[i].toAffine());
    }
    return matrix;
  }

  toValue(): Value {
    const transforms = this._transforms;
    const n = transforms.length;
    const record = Record.create(n);
    for (let i = 0; i < n; i += 1) {
      record.push(transforms[i].toValue());
    }
    return record;
  }

  conformsTo(that: Transform): boolean {
    if (that instanceof TransformList) {
      const n = this._transforms.length;
      if (n === that._transforms.length) {
        for (let i = 0; i < n; i += 1) {
          if (!this._transforms[i].conformsTo(that._transforms[i])) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  equals(that: Transform): boolean {
    if (that instanceof TransformList) {
      const n = this._transforms.length;
      if (n === that._transforms.length) {
        for (let i = 0; i < n; i += 1) {
          if (!this._transforms[i].equals(that._transforms[i])) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  hashCode(): number {
    if (TransformList._hashSeed === void 0) {
      TransformList._hashSeed = Murmur3.seed(TransformList);
    }
    let code = TransformList._hashSeed;
    const transforms = this._transforms;
    for (let i = 0, n = transforms.length; i < n; i += 1) {
      code = Murmur3.mix(code, transforms[i].hashCode());
    }
    return Murmur3.mash(code);
  }

  debug(output: Output): void {
    output = output.write("Transform").write(46/*'.'*/).write("list").write(40/*'('*/);
    const transforms = this._transforms;
    const n = transforms.length;
    if (n > 0) {
      output = output.debug(transforms[0]);
      for (let i = 1; i < n; i += 1) {
        output = output.write(", ").debug(transforms[i]);
      }
    }
    output = output.write(41/*')'*/);
  }

  toString(): string {
    const transforms = this._transforms;
    const n = transforms.length;
    if (n > 0) {
      let s = transforms[0].toString();
      for (let i = 1; i < n; i += 1) {
        s = s + " " + transforms[i].toString();
      }
      return s;
    } else {
      return "";
    }
  }

  toAttributeString(): string {
    const transforms = this._transforms;
    const n = transforms.length;
    if (n > 0) {
      let s = transforms[0].toAttributeString();
      for (let i = 1; i < n; i += 1) {
        s = s + " " + transforms[i].toAttributeString();
      }
      return s;
    } else {
      return "";
    }
  }

  private static _hashSeed?: number;

  static fromAny(value: TransformList | string): TransformList {
    if (value instanceof TransformList) {
      return value;
    } else if (typeof value === "string") {
      return TransformList.parse(value);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): TransformList | undefined {
    const transforms = [] as Transform[];
    value.forEach(function (item: Item) {
      const transform = Transform.fromValue(item.toValue());
      if (transform) {
        transforms.push(transform);
      }
    }, this);
    if (transforms.length) {
      return new TransformList(transforms);
    }
    return undefined;
  }

  static parse(string: string): TransformList {
    const transform = Transform.parse(string);
    if (transform instanceof TransformList) {
      return transform;
    } else {
      return new TransformList([transform]);
    }
  }
}
Transform.List = TransformList;
