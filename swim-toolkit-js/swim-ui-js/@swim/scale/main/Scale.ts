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

import {Equals} from "@swim/util";
import {AnyDateTime, DateTime} from "@swim/time";
import {Interpolator} from "@swim/interpolate";
import {ContinuousScale} from "./ContinuousScale";
import {LinearScale} from "./LinearScale";
import {TimeScale} from "./TimeScale";

export type ScaleType = "linear" | "time";

export abstract class Scale<D extends DU, R extends RU, DU = D, RU = R> implements Equals {
  abstract scale(x: DU): R;

  abstract equals(that: unknown): boolean;

  static linear<R extends RU, RU = R>(xs: ReadonlyArray<number>, fx: Interpolator<R, RU>): LinearScale<R, RU>;
  static linear<R extends RU, RU = R>(xs: ReadonlyArray<number>, ys: ReadonlyArray<RU>): LinearScale<R, RU>;
  static linear<R extends RU, RU = R>(x0: number, x1: number, fx: Interpolator<R, RU>): LinearScale<R, RU>;
  static linear<R extends RU, RU = R>(x0: number, x1: number, y0: RU, y1: RU): LinearScale<R, RU>;
  static linear<R extends RU, RU = R>(x0: ReadonlyArray<number> | number, x1: Interpolator<R, RU> | ReadonlyArray<RU> | number,
                                      y0?: Interpolator<R, RU> | RU, y1?: RU): LinearScale<R, RU> {
    if (Array.isArray(x0)) {
      if (!Array.isArray(x1)) {
        return new Scale.Linear(x0[0], x0[1], x1 as Interpolator<R, RU>);
      } else {
        x1 = x1 as ReadonlyArray<RU>;
        return new Scale.Linear(x0[0], x0[1], Interpolator.between(x1[0], x1[1]) as Interpolator<R, RU>);
      }
    } else {
      x0 = x0 as number;
      x1 = x1 as number;
      if (y1 === void 0) {
        return new Scale.Linear(x0, x1, y0 as Interpolator<R, RU>);
      } else {
        y0 = y0 as RU;
        y1 = y1 as RU;
        return new Scale.Linear(x0, x1, Interpolator.between(y0, y1) as Interpolator<R, RU>);
      }
    }
  }

  static time<R extends RU, RU = R>(ts: ReadonlyArray<AnyDateTime>, ft: Interpolator<R, RU>): TimeScale<R, RU>;
  static time<R extends RU, RU = R>(ts: ReadonlyArray<AnyDateTime>, ys: ReadonlyArray<RU>): TimeScale<R, RU>;
  static time<R extends RU, RU = R>(t0: AnyDateTime, t1: AnyDateTime, ft: Interpolator<R, RU>): TimeScale<R, RU>;
  static time<R extends RU, RU = R>(t0: AnyDateTime, t1: AnyDateTime, y0: RU, y1: RU): TimeScale<R, RU>;
  static time<R extends RU, RU = R>(t0: ReadonlyArray<AnyDateTime> | AnyDateTime, t1: Interpolator<R, RU> | ReadonlyArray<RU> | AnyDateTime,
                                    y0?: Interpolator<R, RU> | RU, y1?: RU): TimeScale<R, RU> {
    if (Array.isArray(t0)) {
      if (!Array.isArray(t1)) {
        return new Scale.Time(t0[0], t0[1], t1 as Interpolator<R, RU>);
      } else {
        t1 = t1 as ReadonlyArray<RU>;
        return new Scale.Time(t0[0], t0[1], Interpolator.between(t1[0], t1[1]) as Interpolator<R, RU>);
      }
    } else {
      t0 = t0 as AnyDateTime;
      t1 = t1 as AnyDateTime;
      if (y1 === void 0) {
        return new Scale.Time(t0, t1, y0 as Interpolator<R, RU>);
      } else {
        y0 = y0 as RU;
        y1 = y1 as RU;
        return new Scale.Time(t0, t1, Interpolator.between(y0, y1) as Interpolator<R, RU>);
      }
    }
  }

  static from<D extends DU, R extends RU, DU = D, RU = R>(x0: DU, x1: DU, fx: Interpolator<R, RU>): ContinuousScale<D, R, DU, RU>;
  static from<D extends DU, R extends RU, DU = D, RU = R>(x0: DU, x1: DU, y0: RU, y1: RU): ContinuousScale<D, R, DU, RU>;
  static from<D extends DU, R extends RU, DU = D, RU = R>(type: ScaleType, fx: Interpolator<R, RU>): ContinuousScale<D, R, DU, RU>;
  static from<D extends DU, R extends RU, DU = D, RU = R>(type: ScaleType, y0: RU, y1: RU): ContinuousScale<D, R, DU, RU>;
  static from<D extends DU, R extends RU, DU = D, RU = R>(x0: DU | ScaleType, x1: DU | Interpolator<R, RU> | RU,
                                                          y0?: Interpolator<R, RU> | RU, y1?: RU): ContinuousScale<D, R, DU, RU> {
    if (x0 === "time") {
      y1 = y0 as RU | undefined;
      y0 = x1 as Interpolator<R, RU> | RU | undefined;
      const now = DateTime.current();
      x1 = now as unknown as DU;
      x0 = now.time(now.time() - 86400000) as unknown as DU;
    } else if (x0 === "linear") {
      y1 = y0 as RU | undefined;
      y0 = x1 as Interpolator<R, RU> | RU | undefined;
      x1 = 1 as unknown as DU;
      x0 = 0 as unknown as DU;
    }
    if (x0 instanceof DateTime || x0 instanceof Date || x1 instanceof DateTime || x1 instanceof Date) {
      if (y1 === void 0) {
        return new Scale.Time(x0 as AnyDateTime, x1 as AnyDateTime, y0 as Interpolator<R, RU>) as unknown as ContinuousScale<D, R, DU, RU>;
      } else {
        return new Scale.Time(x0 as AnyDateTime, x1 as AnyDateTime, Interpolator.between(y0, y1)) as unknown as ContinuousScale<D, R, DU, RU>;
      }
    } else if (typeof x0 === "number" && typeof x1 === "number") {
      if (y1 === void 0) {
        return new Scale.Linear(x0, x1, y0 as Interpolator<R, RU>) as unknown as ContinuousScale<D, R, DU, RU>;
      } else {
        return new Scale.Linear(x0, x1, Interpolator.between(y0, y1)) as unknown as ContinuousScale<D, R, DU, RU>;
      }
    }
    throw new TypeError("" + arguments);
  }

  // Forward type declarations
  /** @hidden */
  static Continuous: typeof ContinuousScale; // defined by ContinuousScale
  /** @hidden */
  static Linear: typeof LinearScale; // defined by LinearScale
  /** @hidden */
  static Time: typeof TimeScale; // defined by TimeScale
}
