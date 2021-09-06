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

import type {GraphControllerObserver} from "../graph/GraphControllerObserver";
import type {AxisView} from "../axis/AxisView";
import type {AxisTrait} from "../axis/AxisTrait";
import type {AxisController} from "../axis/AxisController";
import type {ChartView} from "./ChartView";
import type {ChartTrait} from "./ChartTrait";
import type {ChartController} from "./ChartController";

export interface ChartControllerObserver<X, Y, C extends ChartController<X, Y> = ChartController<X, Y>> extends GraphControllerObserver<X, Y, C> {
  controllerWillSetChartTrait?(newChartTraitt: ChartTrait<X, Y> | null, oldChartTrait: ChartTrait<X, Y> | null, controller: C): void;

  controllerDidSetChartTrait?(newChartTraitt: ChartTrait<X, Y> | null, oldChartTrait: ChartTrait<X, Y> | null, controller: C): void;

  controllerWillSetChartView?(newChartView: ChartView<X, Y> | null, oldChartView: ChartView<X, Y> | null, controller: C): void;

  controllerDidSetChartView?(newChartView: ChartView<X, Y> | null, oldChartView: ChartView<X, Y> | null, controller: C): void;

  controllerWillSetTopAxis?(newTopAxisController: AxisController<X> | null, oldTopAxisController: AxisController<X> | null, controller: C): void;

  controllerDidSetTopAxis?(newTopAxisController: AxisController<X> | null, oldTopAxisController: AxisController<X> | null, controller: C): void;

  controllerWillSetTopAxisTrait?(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null, controller: C): void;

  controllerDidSetTopAxisTrait?(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null, controller: C): void;

  controllerWillSetTopAxisView?(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null, controller: C): void;

  controllerDidSetTopAxisView?(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null, controller: C): void;

  controllerWillSetRightAxis?(newRightAxisController: AxisController<Y> | null, oldRightAxisController: AxisController<Y> | null, controller: C): void;

  controllerDidSetRightAxis?(newRightAxisController: AxisController<Y> | null, oldRightAxisController: AxisController<Y> | null, controller: C): void;

  controllertWillSetRightAxisTrait?(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null, controller: C): void;

  controllerDidSetRightAxisTrait?(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null, controller: C): void;

  controllerWillSetRightAxisView?(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null, controller: C): void;

  controllerDidSetRightAxisView?(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null, controller: C): void;

  controllerWillSetBottomAxis?(newBottomAxisController: AxisController<X> | null, oldBottomAxisController: AxisController<X> | null, controller: C): void;

  controllerDidSetBottomAxis?(newBottomAxisController: AxisController<X> | null, oldBottomAxisController: AxisController<X> | null, controller: C): void;

  controllerWillSetBottomAxisTrait?(newBottomAxisTrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null, controller: C): void;

  controllerDidSetBottomAxisTrait?(newBottomAxisTrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null, controller: C): void;

  controllerWillSetBottomAxisView?(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null, controller: C): void;

  controllerDidSetBottomAxisView?(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null, controller: C): void;

  controllerWillSetLeftAxis?(newLeftAxisController: AxisController<Y> | null, oldLeftAxisController: AxisController<Y> | null, controller: C): void;

  controllerDidSetLeftAxis?(newLeftAxisController: AxisController<Y> | null, oldLeftAxisController: AxisController<Y> | null, controller: C): void;

  controllerWillSetLeftAxisTrait?(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null, controller: C): void;

  controllerDidSetLeftAxisTrait?(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null, controller: C): void;

  controllerWillSetLeftAxisView?(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null, controller: C): void;

  controllerDidSetLeftAxisView?(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null, controller: C): void;
}
