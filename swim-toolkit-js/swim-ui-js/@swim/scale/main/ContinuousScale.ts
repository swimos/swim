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
import {Scale} from "./Scale";

export abstract class ContinuousScale<D, R, DU = D, RU = R> extends Scale<D, R, DU, RU> {
  abstract norm(x: D | DU): number;

  abstract unscale(y: R | RU): D;

  abstract domain(): readonly [D, D];
  abstract domain(xs: readonly [D | DU, D | DU]): ContinuousScale<D, R, DU, RU>;
  abstract domain(x0: D | DU, x1?: D | DU): ContinuousScale<D, R, DU, RU>;

  abstract range(): readonly [R, R];
  abstract range(ys: readonly [R | RU, R | RU]): ContinuousScale<D, R, DU, RU>;
  abstract range(y0: R | RU, y1?: R | RU): ContinuousScale<D, R, DU, RU>;

  abstract interpolator(): Interpolator<R, RU>;
  abstract interpolator(fx: Interpolator<R, RU>): ContinuousScale<D, R, DU, RU>;

  abstract clampDomain(xMin: D | DU | null, xMax: D | DU | null,
                       zMin: number | null, zMax: number | null,
                       epsilon?: number): ContinuousScale<D, R, DU, RU>;

  abstract solveDomain(x1: D | DU, y1: R | RU,
                       x2?: D | DU, y2?: R | RU,
                       reflect?: boolean,
                       epsilon?: number): ContinuousScale<D, R, DU, RU>;
}
Scale.Continuous = ContinuousScale;
