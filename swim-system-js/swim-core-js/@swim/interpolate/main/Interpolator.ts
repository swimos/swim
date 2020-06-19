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
import {NumberInterpolator} from "./NumberInterpolator";
import {StepInterpolator} from "./StepInterpolator";
import {ArrayInterpolator} from "./ArrayInterpolator";
import {InterpolatorInterpolator} from "./InterpolatorInterpolator";
import {InterpolatorMap} from "./InterpolatorMap";

export interface InterpolatorFactory {
  tryBetween(a: unknown, b: unknown): Interpolator<unknown> | null;

  tryBetweenAny?(a: unknown, b: unknown): Interpolator<unknown> | null;
}

export abstract class Interpolator<T, U = T> implements Equals {
  abstract interpolate(u: number): T;

  abstract deinterpolate(y: T | U): number;

  abstract range(): readonly [T, T];
  abstract range(ys: readonly [T | U, T | U]): Interpolator<T, U>;
  abstract range(y0: T | U, y1: T | U): Interpolator<T, U>;

  map<FT>(f: (value: T) => FT): Interpolator<FT, T> {
    return new Interpolator.Map(this, f);
  }

  abstract equals(that: unknown): boolean;

  static map<T, FT>(a: T, b: T, f: (value: T) => FT): Interpolator<FT, T> {
    return new Interpolator.Map(Interpolator.between(a, b), f);
  }

  static between<T, U>(a: T | U, b: T | U): Interpolator<T, U>
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    let interpolator: Interpolator<unknown> | null = null;
    const factories = this._factories;
    const factoryCount = factories.length;
    for (let i = 0; interpolator === null && i < factoryCount; i += 1) {
      const factory = factories[i];
      interpolator = factory.tryBetween(a, b);
    }
    for (let i = 0; interpolator === null && i < factoryCount; i += 1) {
      const factory = factories[i];
      if (factory.tryBetweenAny !== void 0) {
        interpolator = factory.tryBetweenAny(a, b);
      }
    }
    if (interpolator === null) {
      interpolator = Interpolator.Interpolator.tryBetween(a, b);
    }
    if (interpolator === null) {
      interpolator = Interpolator.Array.tryBetween(a, b);
    }
    if (interpolator === null) {
      interpolator = new Interpolator.Step(a, b);
    }
    return interpolator;
  }

  /** @hidden */
  private static readonly _factories: InterpolatorFactory[] = [];

  static get factories(): ReadonlyArray<InterpolatorFactory> {
    return this._factories;
  }

  static registerFactory(factory: InterpolatorFactory): void {
    // assert(factory !== Interpolator);
    if (this._factories.indexOf(factory) < 0) {
      this._factories.push(factory);
    }
  }

  static unregisterFactory(factory: InterpolatorFactory): void {
    const index = this._factories.indexOf(factory);
    if (index >= 0) {
      this._factories.splice(index, 1);
    }
  }

  // Forward type declarations
  /** @hidden */
  static Number: typeof NumberInterpolator; // defined by NumberInterpolator
  /** @hidden */
  static Step: typeof StepInterpolator; // defined by StepInterpolator
  /** @hidden */
  static Array: typeof ArrayInterpolator; // defined by ArrayInterpolator
  /** @hidden */
  static Interpolator: typeof InterpolatorInterpolator; // defined by InterpolatorInterpolator
  /** @hidden */
  static Map: typeof InterpolatorMap; // defined by InterpolatorMap
}
