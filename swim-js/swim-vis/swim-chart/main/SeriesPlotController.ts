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
import type {TraitViewRef} from "@swim/controller";
import type {SeriesPlotView} from "./SeriesPlotView";
import type {SeriesPlotTrait} from "./SeriesPlotTrait";
import type {PlotControllerObserver} from "./PlotController";
import {PlotController} from "./PlotController";

/** @public */
export interface SeriesPlotControllerObserver<X = unknown, Y = unknown, C extends SeriesPlotController<X, Y> = SeriesPlotController<X, Y>> extends PlotControllerObserver<X, Y, C> {
  controllerWillAttachPlotTrait?(plotTrait: SeriesPlotTrait<X, Y>, controller: C): void;

  controllerDidDetachPlotTrait?(plotTrait: SeriesPlotTrait<X, Y>, controller: C): void;

  controllerWillAttachPlotView?(plotView: SeriesPlotView<X, Y>, controller: C): void;

  controllerDidDetachPlotView?(plotView: SeriesPlotView<X, Y>, controller: C): void;
}

/** @public */
export abstract class SeriesPlotController<X = unknown, Y = unknown> extends PlotController<X, Y> {
  declare readonly observerType?: Class<SeriesPlotControllerObserver<X, Y>>;

  abstract override readonly plot: TraitViewRef<this, SeriesPlotTrait<X, Y>, SeriesPlotView<X, Y>>;
}
