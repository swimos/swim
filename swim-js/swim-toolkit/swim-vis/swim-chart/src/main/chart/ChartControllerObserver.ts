// Copyright 2015-2021 Swim.inc
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

/** @public */
export interface ChartControllerObserver<X = unknown, Y = unknown, C extends ChartController<X, Y> = ChartController<X, Y>> extends GraphControllerObserver<X, Y, C> {
  controllerWillAttachChartTrait?(chartTrait: ChartTrait<X, Y>, controller: C): void;

  controllerDidDetachChartTrait?(chartTrait: ChartTrait<X, Y>, controller: C): void;

  controllerWillAttachChartView?(chartView: ChartView<X, Y>, controller: C): void;

  controllerDidDetachChartView?(chartView: ChartView<X, Y>, controller: C): void;

  controllerWillAttachTopAxis?(topAxisController: AxisController<X>, controller: C): void;

  controllerDidDetachTopAxis?(topAxisController: AxisController<X>, controller: C): void;

  controllerWillAttachTopAxisTrait?(topAxisTrait: AxisTrait<X>, controller: C): void;

  controllerDidDetachTopAxisTrait?(topAxisTrait: AxisTrait<X>, controller: C): void;

  controllerWillAttachTopAxisView?(topAxisView: AxisView<X>, controller: C): void;

  controllerDidDetachTopAxisView?(topAxisView: AxisView<X>, controller: C): void;

  controllerWillAttachRightAxis?(rightAxisController: AxisController<Y>, controller: C): void;

  controllerDidDetachRightAxis?(rightAxisController: AxisController<Y>, controller: C): void;

  controllerWillAttachRightAxisTrait?(rightAxisTrait: AxisTrait<Y>, controller: C): void;

  controllerDidDetachRightAxisTrait?(rightAxisTrait: AxisTrait<Y>, controller: C): void;

  controllerWillAttachRightAxisView?(rightAxisView: AxisView<Y>, controller: C): void;

  controllerDidDetachRightAxisView?(rightAxisView: AxisView<Y>, controller: C): void;

  controllerWillAttachBottomAxis?(bottomAxisController: AxisController<X>, controller: C): void;

  controllerDidDetachBottomAxis?(bottomAxisController: AxisController<X>, controller: C): void;

  controllerWillAttachBottomAxisTrait?(bottomAxisTrait: AxisTrait<X>, controller: C): void;

  controllerDidDetachBottomAxisTrait?(bottomAxisTrait: AxisTrait<X>, controller: C): void;

  controllerWillAttachBottomAxisView?(bottomAxisView: AxisView<X>, controller: C): void;

  controllerDidDetachBottomAxisView?(bottomAxisView: AxisView<X>, controller: C): void;

  controllerWillAttachLeftAxis?(leftAxisController: AxisController<Y>, controller: C): void;

  controllerDidDetachLeftAxis?(leftAxisController: AxisController<Y>, controller: C): void;

  controllerWillAttachLeftAxisTrait?(leftAxisTrait: AxisTrait<Y>, controller: C): void;

  controllerDidDetachLeftAxisTrait?(leftAxisTrait: AxisTrait<Y>, controller: C): void;

  controllerWillAttachLeftAxisView?(leftAxisView: AxisView<Y>, controller: C): void;

  controllerDidDetachLeftAxisView?(leftAxisView: AxisView<Y>, controller: C): void;
}
