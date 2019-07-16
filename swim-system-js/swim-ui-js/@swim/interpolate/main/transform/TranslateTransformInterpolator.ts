// Copyright 2015-2019 SWIM.AI inc.
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

import {LengthUnits, Length} from "@swim/length";
import {AnyTransform, Transform, TranslateTransform} from "@swim/transform";
import {TransformInterpolator} from "../TransformInterpolator";

export class TranslateTransformInterpolator extends TransformInterpolator<TranslateTransform> {
  private readonly x0: number;
  private readonly dx: number;
  private readonly xUnits: LengthUnits;
  private readonly y0: number;
  private readonly dy: number;
  private readonly yUnits: LengthUnits;

  constructor(f0: TranslateTransform | string | undefined, f1: TranslateTransform | string | undefined) {
    super();
    let x0: Length | undefined;
    let y0: Length | undefined;
    if (f0 !== void 0) {
      f0 = TranslateTransform.fromAny(f0);
      x0 = f0.x;
      y0 = f0.y;
    } else {
      x0 = void 0;
      y0 = void 0;
    }
    let x1: Length | undefined;
    let y1: Length | undefined;
    if (f1 !== void 0) {
      f1 = TranslateTransform.fromAny(f1);
      x1 = f1.x;
      y1 = f1.y;
    } else {
      x1 = void 0;
      y1 = void 0;
    }
    if (!x0 && !x1) {
      x1 = x0 = Length.zero();
    } else if (!x1) {
      x1 = x0;
    } else if (!x0) {
      x0 = x1;
    } else {
      x0 = x0.to(x1.units());
    }
    if (!y0 && !y1) {
      y1 = y0 = Length.zero();
    } else if (!y1) {
      y1 = y0;
    } else if (!y0) {
      y0 = y1;
    } else {
      y0 = y0.to(y1.units());
    }
    this.x0 = x0!.value();
    this.dx = x1!.value() - this.x0;
    this.xUnits = x1!.units();
    this.y0 = y0!.value();
    this.dy = y1!.value() - this.y0;
    this.yUnits = y1!.units();
  }

  interpolate(u: number): TranslateTransform {
    const x = Length.from(this.x0 + this.dx * u, this.xUnits);
    const y = Length.from(this.y0 + this.dy * u, this.yUnits);
    return new TranslateTransform(x, y);
  }

  deinterpolate(f: AnyTransform): number {
    f = Transform.fromAny(f);
    if (f instanceof TranslateTransform) {
      const units = f.x.units();
      const x0 = Length.fromAny(this.x0, this.xUnits).toValue(units);
      const y0 = Length.fromAny(this.y0, this.yUnits).toValue(units);
      const dx = Length.fromAny(this.dx, this.xUnits).toValue(units);
      const dy = Length.fromAny(this.dy, this.yUnits).toValue(units);
      const fx = f.x.toValue(units) - x0;
      const fy = f.y.toValue(units) - y0;
      const dp = fx * dx + fy * dy;
      const lf = Math.sqrt(fx * fx + fy * fy);
      return lf ? dp / lf : lf;
    }
    return 0;
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
}
TransformInterpolator.Translate = TranslateTransformInterpolator;
