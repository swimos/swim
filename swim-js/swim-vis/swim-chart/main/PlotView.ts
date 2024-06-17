// Copyright 2015-2024 Nstream, inc.
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
import type {TimingLike} from "@swim/util";
import type {Property} from "@swim/component";
import type {ThemeAnimator} from "@swim/theme";
import type {View} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import type {DataPointView} from "./DataPointView";
import type {ContinuousScaleAnimator} from "./ContinuousScaleAnimator";
import type {ScaledXYViewObserver} from "./ScaledXYView";
import type {ScaledXYView} from "./ScaledXYView";

/** @public */
export interface PlotViewObserver<X = unknown, Y = unknown, V extends PlotView<X, Y> = PlotView<X, Y>> extends ScaledXYViewObserver<X, Y, V> {
  viewWillAttachDataPoint?(dataPointView: DataPointView<X, Y>, targetView: View | null, view: V): void;

  viewDidDetachDataPoint?(dataPointView: DataPointView<X, Y>, view: V): void;

  viewDidSetOpacity?(opacity: number | undefined, view: V): void;
}

/** @public */
export interface PlotView<X = unknown, Y = unknown> extends GraphicsView, ScaledXYView<X, Y> {
  /** @override */
  readonly observerType?: Class<PlotViewObserver<X, Y>>;

  /** @override */
  readonly xScale: ContinuousScaleAnimator<this, X, number>;

  /** @override */
  readonly yScale: ContinuousScaleAnimator<this, Y, number>;

  /** @override */
  xDomain(): Domain<X> | null;
  xDomain(xDomain: Domain<X> | null, timing?: TimingLike | boolean): this;
  xDomain(xMin: X, xMax: X, timing?: TimingLike | boolean): this;

  /** @override */
  yDomain(): Domain<Y> | null;
  yDomain(yDomain: Domain<Y> | null, timing?: TimingLike | boolean): this;
  yDomain(yMin: Y, yMax: Y, timingtimingtiming?: TimingLike | boolean): this;

  /** @override */
  xRange(): Range<number> | null;

  /** @override */
  yRange(): Range<number> | null;

  /** @override */
  readonly xRangePadding: Property<this, readonly [number, number]>

  /** @override */
  readonly yRangePadding: Property<this, readonly [number, number]>

  /** @override */
  readonly xDataDomain: Domain<X> | null;

  /** @override */
  readonly yDataDomain: Domain<Y> | null;

  /** @override */
  readonly xDataRange: Range<number> | null;

  /** @override */
  readonly yDataRange: Range<number> | null;

  readonly opacity: ThemeAnimator<this, number | undefined>;
}
