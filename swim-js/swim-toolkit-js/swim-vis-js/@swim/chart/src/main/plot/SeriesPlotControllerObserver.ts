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

import type {PlotControllerObserver} from "./PlotControllerObserver";
import type {SeriesPlotView} from "./SeriesPlotView";
import type {SeriesPlotTrait} from "./SeriesPlotTrait";
import type {SeriesPlotController} from "./SeriesPlotController";

export interface SeriesPlotControllerObserver<X = unknown, Y = unknown, C extends SeriesPlotController<X, Y> = SeriesPlotController<X, Y>> extends PlotControllerObserver<X, Y, C> {
  controllerWillAttachPlotTrait?(plotTrait: SeriesPlotTrait<X, Y>, controller: C): void;

  controllerDidDetachPlotTrait?(plotTrait: SeriesPlotTrait<X, Y>, controller: C): void;

  controllerWillAttachPlotView?(plotView: SeriesPlotView<X, Y>, controller: C): void;

  controllerDidDetachPlotView?(plotView: SeriesPlotView<X, Y>, controller: C): void;
}
