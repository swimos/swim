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
import {Attr, Value, Record} from "@swim/structure";
import {AnyLength, Length} from "@swim/length";
import {Transform} from "./Transform";
import {AffineTransform} from "./AffineTransform";

export class IdentityTransform extends Transform {
  transform(that: Transform): Transform;
  transform(point: [number, number]): [number, number];
  transform(x: number, y: number): [number, number];
  transform(point: [AnyLength, AnyLength]): [Length, Length];
  transform(x: AnyLength, y: AnyLength): [Length, Length];
  transform(x: Transform | [AnyLength, AnyLength] | AnyLength, y?: AnyLength): Transform | [number, number] | [Length, Length] {
    if (x instanceof Transform) {
      return x;
    } else {
      if (Array.isArray(x)) {
        y = x[1];
        x = x[0];
      }
      if (typeof x === "number" && typeof y === "number") {
        return [x, y];
      } else {
        x = Length.fromAny(x);
        y = Length.fromAny(y!);
        return [x, y];
      }
    }
  }

  transformX(x: number, y: number): number {
    return x;
  }

  transformY(x: number, y: number): number {
    return y;
  }

  inverse(): Transform {
    return this;
  }

  toAffine(): AffineTransform {
    return new Transform.Affine(1, 0, 0, 1, 0, 0);
  }

  toValue(): Value {
    return Record.of(Attr.of("identity"));
  }

  conformsTo(that: Transform): boolean {
    return that instanceof IdentityTransform;
  }

  equals(that: Transform): boolean {
    return that instanceof IdentityTransform;
  }

  hashCode(): number {
    if (IdentityTransform._hashSeed === void 0) {
      IdentityTransform._hashSeed = Murmur3.seed(IdentityTransform);
    }
    return IdentityTransform._hashSeed;
  }

  debug(output: Output): void {
    output = output.write("Transform").write(46/*'.'*/).write("identity")
        .write(40/*'('*/).write(41/*')'*/);
  }

  toString(): string {
    return "none";
  }

  private static _hashSeed?: number;

  static fromValue(value: Value): IdentityTransform | undefined {
    if (value.tag() === "identity") {
      return Transform.identity();
    }
    return void 0;
  }
}
Transform.Identity = IdentityTransform;
