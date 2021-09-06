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

import type {Color} from "@swim/style";
import type {AreaPlotView} from "./AreaPlotView";
import type {AreaPlotTrait} from "./AreaPlotTrait";
import type {SeriesPlotControllerObserver} from "./SeriesPlotControllerObserver";
import type {AreaPlotController} from "./AreaPlotController";

export interface AreaPlotControllerObserver<X, Y, C extends AreaPlotController<X, Y> = AreaPlotController<X, Y>> extends SeriesPlotControllerObserver<X, Y, C> {
  controllerWillSetPlotTrait?(newPlotTrait: AreaPlotTrait<X, Y> | null, oldPlotTrait: AreaPlotTrait<X, Y> | null, controller: C): void;

  controllerDidSetPlotTrait?(newPlotTrait: AreaPlotTrait<X, Y> | null, oldPlotTrait: AreaPlotTrait<X, Y> | null, controller: C): void;

  controllerWillSetPlotView?(newPlotView: AreaPlotView<X, Y> | null, oldPlotView: AreaPlotView<X, Y> | null, controller: C): void;

  controllerDidSetPlotView?(newPlotView: AreaPlotView<X, Y> | null, oldPlotView: AreaPlotView<X, Y> | null, controller: C): void;

  controllerWillSetPlotFill?(newFill: Color | null, oldFill: Color | null, controller: C): void;

  controllerDidSetPlotFill?(newFill: Color | null, oldFill: Color | null, controller: C): void;
}
