// Copyright 2015-2022 Swim.inc
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

import type {Length} from "@swim/math";
import type {Color} from "@swim/style";
import type {LinePlotView} from "./LinePlotView";
import type {LinePlotTrait} from "./LinePlotTrait";
import type {SeriesPlotControllerObserver} from "./SeriesPlotControllerObserver";
import type {LinePlotController} from "./LinePlotController";

/** @public */
export interface LinePlotControllerObserver<X = unknown, Y = unknown, C extends LinePlotController<X, Y> = LinePlotController<X, Y>> extends SeriesPlotControllerObserver<X, Y, C> {
  controllerWillAttachPlotTrait?(plotTrait: LinePlotTrait<X, Y>, controller: C): void;

  controllerDidDetachPlotTrait?(plotTrait: LinePlotTrait<X, Y>, controller: C): void;

  controllerWillAttachPlotView?(plotView: LinePlotView<X, Y>, controller: C): void;

  controllerDidDetachPlotView?(plotView: LinePlotView<X, Y>, controller: C): void;

  controllerDidSetPlotStroke?(stroke: Color | null, controller: C): void;

  controllerDidSetPlotStrokeWidth?(strokeWidth: Length | null, controller: C): void;
}
