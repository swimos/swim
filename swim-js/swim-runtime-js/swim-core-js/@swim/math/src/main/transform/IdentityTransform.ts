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

/// <reference types="w3c-css-typed-object-model-level-1"/>

import {Constructors, Interpolator, IdentityInterpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import {Value, Record} from "@swim/structure";
import {R2Point} from "../r2/R2Point";
import {Transform} from "./Transform";
import {AffineTransform} from "../"; // forward import

/** @public */
export class IdentityTransform extends Transform {
  override transform(that: Transform): Transform;
  override transform(x: number, y: number): R2Point;
  override transform(x: Transform | number, y?: number): Transform | R2Point {
    if (arguments.length === 1) {
      return x as Transform;
    } else {
      return new R2Point(x as number, y!);
    }
  }

  override transformX(x: number, y: number): number {
    return x;
  }

  override transformY(x: number, y: number): number {
    return y;
  }

  override inverse(): Transform {
    return this;
  }

  override toAffine(): AffineTransform {
    return new AffineTransform(1, 0, 0, 1, 0, 0);
  }

  override toCssValue(): CSSStyleValue | null {
    return new CSSKeywordValue("identity");
  }

  override toValue(): Value {
    return Record.create(1).attr("identity");
  }

  override interpolateTo(that: IdentityTransform): Interpolator<IdentityTransform>;
  override interpolateTo(that: Transform): Interpolator<Transform>;
  override interpolateTo(that: unknown): Interpolator<Transform> | null;
  override interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof IdentityTransform) {
      return IdentityInterpolator(this);
    } else {
      return super.interpolateTo(that);
    }
  }

  override conformsTo(that: Transform): boolean {
    return that instanceof IdentityTransform;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    return that instanceof IdentityTransform;
  }

  override equals(that: unknown): boolean {
    return that instanceof IdentityTransform;
  }

  override hashCode(): number {
    return Constructors.hash(IdentityTransform);
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Transform").write(46/*'.'*/).write("identity")
                   .write(40/*'('*/).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return "none";
  }

  static override fromValue(value: Value): IdentityTransform | null {
    if (value.tag === "identity") {
      return Transform.identity();
    }
    return null;
  }
}
