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

import {Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import {Interpolator, IdentityInterpolator} from "@swim/mapping";
import {Value, Record} from "@swim/structure";
import {PointR2} from "../r2/PointR2";
import {Transform} from "./Transform";
import {AffineTransform} from "../"; // forward import

export class IdentityTransform extends Transform {
  transform(that: Transform): Transform;
  transform(x: number, y: number): PointR2;
  transform(x: Transform | number, y?: number): Transform | PointR2 {
    if (arguments.length === 1) {
      return x as Transform;
    } else {
      return new PointR2(x as number, y!);
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
    return new AffineTransform(1, 0, 0, 1, 0, 0);
  }

  toCssValue(): CSSStyleValue | null {
    return new CSSKeywordValue("identity");
  }

  toValue(): Value {
    return Record.create(1).attr("identity");
  }

  interpolateTo(that: IdentityTransform): Interpolator<IdentityTransform>;
  interpolateTo(that: Transform): Interpolator<Transform>;
  interpolateTo(that: unknown): Interpolator<Transform> | null;
  interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof IdentityTransform) {
      return IdentityInterpolator(this);
    } else {
      return super.interpolateTo(that);
    }
  }

  conformsTo(that: Transform): boolean {
    return that instanceof IdentityTransform;
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    return that instanceof IdentityTransform;
  }

  equals(that: unknown): boolean {
    return that instanceof IdentityTransform;
  }

  hashCode(): number {
    return Constructors.hash(IdentityTransform);
  }

  debug(output: Output): void {
    output = output.write("Transform").write(46/*'.'*/).write("identity")
        .write(40/*'('*/).write(41/*')'*/);
  }

  toString(): string {
    return "none";
  }

  static fromValue(value: Value): IdentityTransform | null {
    if (value.tag === "identity") {
      return Transform.identity();
    }
    return null;
  }
}
