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

import {AnyInterpolator, Interpolator} from "@swim/interpolate";
import {Scale} from "./Scale";

export abstract class ContinuousScale<D extends DU, R extends RU, DU = D, RU = R> extends Scale<D, R, DU, RU> {
  abstract norm(x: DU): number;

  abstract unscale(y: RU): D;

  abstract clampScale(x: DU): R;

  abstract domain(): D[];
  abstract domain(xs: ReadonlyArray<DU>): ContinuousScale<D, R, DU, RU>;
  abstract domain(x0: DU, x1?: DU): ContinuousScale<D, R, DU, RU>;

  abstract range(): RU[];
  abstract range(ys: ReadonlyArray<RU>): ContinuousScale<D, R, DU, RU>;
  abstract range(y0: RU, y1?: RU): ContinuousScale<D, R, DU, RU>;

  abstract interpolator(): Interpolator<R, RU>;
  abstract interpolator(fx: AnyInterpolator<R, RU>): ContinuousScale<D, R, DU, RU>;

  abstract clampDomain(xMin?: DU, xMax?: DU, zMin?: number, zMax?: number, epsilon?: number): ContinuousScale<D, R, DU, RU>;

  abstract solveDomain(x1: DU, y1: RU, x2?: DU, y2?: RU, epsilon?: number): ContinuousScale<D, R, DU, RU>;
}
Scale.Continuous = ContinuousScale;
