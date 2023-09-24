// Copyright 2015-2023 Nstream, inc.
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

import type {Class} from "@swim/util";
import type {Domain} from "@swim/util";
import type {Range} from "@swim/util";
import type {ContinuousScale} from "@swim/util";
import type {TimingLike} from "@swim/util";
import type {Property} from "@swim/component";
import type {GraphicsViewObserver} from "@swim/graphics";
import {GraphicsView} from "@swim/graphics";
import type {ContinuousScaleAnimator} from "./ContinuousScaleAnimator";
import {ScaledView} from "./"; // forward import

/** @public */
export interface ScaledYViewObserver<Y = unknown, V extends ScaledYView<Y> = ScaledYView<Y>> extends GraphicsViewObserver<V> {
  viewDidSetYScale?(yScale: ContinuousScale<Y, number> | null, view: V): void;

  viewDidSetYRangePadding?(yRangePadding: readonly [number, number], view: V): void;

  viewDidSetYDataDomain?(yDataDomain: Domain<Y> | null, view: V): void;
}

/** @public */
export interface ScaledYView<Y = unknown> extends GraphicsView {
  /** @override */
  readonly observerType?: Class<ScaledYViewObserver<Y>>;

  readonly yScale: ContinuousScaleAnimator<this, Y, number>;

  yDomain(): Domain<Y> | null;
  yDomain(yDomain: Domain<Y> | null, timing?: TimingLike | boolean): this;
  yDomain(yMin: Y, yMax: Y, timing: TimingLike | boolean): this;

  yRange(): Range<number> | null;

  readonly yRangePadding: Property<this, readonly [number, number]>

  readonly yDataDomain: Domain<Y> | null;

  readonly yDataRange: Range<number> | null;
}

/** @public */
export const ScaledYView = (function () {
  const ScaledYView = {} as {
    is<Y>(object: unknown): object is ScaledYView<Y>
  };

  ScaledYView.is = function <Y>(object: unknown): object is ScaledYView<Y> {
    if (typeof object === "object" && object !== null) {
      const view = object as ScaledYView<Y>;
      return view instanceof ScaledView
          || view instanceof GraphicsView && "yScale" in view;
    }
    return false;
  };

  return ScaledYView;
})();
