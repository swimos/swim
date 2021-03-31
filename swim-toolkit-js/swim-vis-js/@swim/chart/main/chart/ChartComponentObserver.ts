// Copyright 2015-2020 Swim inc.
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

import type {GraphComponentObserver} from "../graph/GraphComponentObserver";
import type {AxisView} from "../axis/AxisView";
import type {AxisTrait} from "../axis/AxisTrait";
import type {AxisComponent} from "../axis/AxisComponent";
import type {ChartView} from "./ChartView";
import type {ChartTrait} from "./ChartTrait";
import type {ChartComponent} from "./ChartComponent";

export interface ChartComponentObserver<X, Y, C extends ChartComponent<X, Y> = ChartComponent<X, Y>> extends GraphComponentObserver<X, Y, C> {
  chartWillSetTrait?(newChartTraitt: ChartTrait<X, Y> | null, oldChartTrait: ChartTrait<X, Y> | null, component: C): void;

  chartDidSetTrait?(newChartTraitt: ChartTrait<X, Y> | null, oldChartTrait: ChartTrait<X, Y> | null, component: C): void;

  chartWillSetView?(newChartView: ChartView<X, Y> | null, oldChartView: ChartView<X, Y> | null, component: C): void;

  chartDidSetView?(newChartView: ChartView<X, Y> | null, oldChartView: ChartView<X, Y> | null, component: C): void;

  chartWillSetTopAxis?(newTopAxisComponent: AxisComponent<X> | null, oldTopAxisComponent: AxisComponent<X> | null, component: C): void;

  chartDidSetTopAxis?(newTopAxisComponent: AxisComponent<X> | null, oldTopAxisComponent: AxisComponent<X> | null, component: C): void;

  chartWillSetTopAxisTrait?(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null, component: C): void;

  chartDidSetTopAxisTrait?(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null, component: C): void;

  chartWillSetTopAxisView?(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null, component: C): void;

  chartDidSetTopAxisView?(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null, component: C): void;

  chartWillSetRightAxis?(newRightAxisComponent: AxisComponent<Y> | null, oldRightAxisComponent: AxisComponent<Y> | null, component: C): void;

  chartDidSetRightAxis?(newRightAxisComponent: AxisComponent<Y> | null, oldRightAxisComponent: AxisComponent<Y> | null, component: C): void;

  chartWillSetRightAxisTrait?(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null, component: C): void;

  chartDidSetRightAxisTrait?(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null, component: C): void;

  chartWillSetRightAxisView?(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null, component: C): void;

  chartDidSetRightAxisView?(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null, component: C): void;

  chartWillSetBottomAxis?(newBottomAxisComponent: AxisComponent<X> | null, oldBottomAxisComponent: AxisComponent<X> | null, component: C): void;

  chartDidSetBottomAxis?(newBottomAxisComponent: AxisComponent<X> | null, oldBottomAxisComponent: AxisComponent<X> | null, component: C): void;

  chartWillSetBottomAxisTrait?(newBottomAxisTrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null, component: C): void;

  chartDidSetBottomAxisTrait?(newBottomAxisTrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null, component: C): void;

  chartWillSetBottomAxisView?(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null, component: C): void;

  chartDidSetBottomAxisView?(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null, component: C): void;

  chartWillSetLeftAxis?(newLeftAxisComponent: AxisComponent<Y> | null, oldLeftAxisComponent: AxisComponent<Y> | null, component: C): void;

  chartDidSetLeftAxis?(newLeftAxisComponent: AxisComponent<Y> | null, oldLeftAxisComponent: AxisComponent<Y> | null, component: C): void;

  chartWillSetLeftAxisTrait?(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null, component: C): void;

  chartDidSetLeftAxisTrait?(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null, component: C): void;

  chartWillSetLeftAxisView?(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null, component: C): void;

  chartDidSetLeftAxisView?(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null, component: C): void;
}
