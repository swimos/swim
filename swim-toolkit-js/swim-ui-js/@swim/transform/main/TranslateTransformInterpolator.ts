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

import {Interpolator} from "@swim/interpolate";
import {LengthUnits, Length} from "@swim/length";
import {AnyTransform, Transform} from "./Transform";
import {TranslateTransform} from "./TranslateTransform";
import {TransformInterpolator} from "./TransformInterpolator";

export class TranslateTransformInterpolator extends TransformInterpolator<TranslateTransform> {
  /** @hidden */
  readonly x0: number;
  /** @hidden */
  readonly dx: number;
  /** @hidden */
  readonly xUnits: LengthUnits;
  /** @hidden */
  readonly y0: number;
  /** @hidden */
  readonly dy: number;
  /** @hidden */
  readonly yUnits: LengthUnits;

  constructor(f0: TranslateTransform, f1: TranslateTransform) {
    super();
    this.xUnits = f1.x.units;
    this.x0 = f0.x.toValue(this.xUnits);
    this.dx = f1.x.value - this.x0;
    this.yUnits = f1.y.units;
    this.y0 = f0.y.toValue(this.yUnits);
    this.dy = f1.y.value - this.y0;
  }

  interpolate(u: number): TranslateTransform {
    const x = Length.from(this.x0 + this.dx * u, this.xUnits);
    const y = Length.from(this.y0 + this.dy * u, this.yUnits);
    return new TranslateTransform(x, y);
  }

  deinterpolate(f: AnyTransform): number {
    f = Transform.fromAny(f);
    if (f instanceof TranslateTransform) {
      const units = f.x.units;
      const x0 = Length.fromAny(this.x0, this.xUnits).toValue(units);
      const y0 = Length.fromAny(this.y0, this.yUnits).toValue(units);
      const dx = Length.fromAny(this.dx, this.xUnits).toValue(units);
      const dy = Length.fromAny(this.dy, this.yUnits).toValue(units);
      const fx = f.x.toValue(units) - x0;
      const fy = f.y.toValue(units) - y0;
      const dp = fx * dx + fy * dy;
      const lf = Math.sqrt(fx * fx + fy * fy);
      return lf !== 0 ? dp / lf : lf;
    }
    return 0;
  }

  range(): readonly [TranslateTransform, TranslateTransform];
  range(fs: readonly [TranslateTransform, TranslateTransform]): TranslateTransformInterpolator;
  range(f0: TranslateTransform, f1: TranslateTransform): TranslateTransformInterpolator;
  range(fs: readonly [AnyTransform, AnyTransform]): TransformInterpolator;
  range(f0: AnyTransform, f1: AnyTransform): TransformInterpolator;
  range(f0?: readonly [AnyTransform, AnyTransform] | AnyTransform,
        f1?: AnyTransform): readonly [TranslateTransform, TranslateTransform] | TransformInterpolator {
    if (f0 === void 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (f1 === void 0) {
      f0 = f0 as readonly [AnyTransform, AnyTransform];
      return TranslateTransformInterpolator.between(f0[0], f0[1]);
    } else {
      return TranslateTransformInterpolator.between(f0 as AnyTransform, f1);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TranslateTransformInterpolator) {
      return this.x0 === that.x0 && this.dx === that.dx && this.xUnits === that.xUnits
          && this.y0 === that.y0 && this.dy === that.dy && this.yUnits === that.yUnits;
    }
    return false;
  }

  static between(f0: TranslateTransform, f1: TranslateTransform): TranslateTransformInterpolator;
  static between(f0: AnyTransform, f1: AnyTransform): TransformInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof TranslateTransform && b instanceof TranslateTransform) {
      return new TranslateTransformInterpolator(a, b);
    }
    return TransformInterpolator.between(a, b);
  }
}
TransformInterpolator.Translate = TranslateTransformInterpolator;
