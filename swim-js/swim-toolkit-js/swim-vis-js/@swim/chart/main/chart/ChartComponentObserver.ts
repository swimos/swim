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

import type {GraphComponentObserver} from "../graph/GraphComponentObserver";
import type {AxisView} from "../axis/AxisView";
import type {AxisTrait} from "../axis/AxisTrait";
import type {AxisComponent} from "../axis/AxisComponent";
import type {ChartView} from "./ChartView";
import type {ChartTrait} from "./ChartTrait";
import type {ChartComponent} from "./ChartComponent";

export interface ChartComponentObserver<X, Y, C extends ChartComponent<X, Y> = ChartComponent<X, Y>> extends GraphComponentObserver<X, Y, C> {
  componentWillSetChartTrait?(newChartTraitt: ChartTrait<X, Y> | null, oldChartTrait: ChartTrait<X, Y> | null, component: C): void;

  componentDidSetChartTrait?(newChartTraitt: ChartTrait<X, Y> | null, oldChartTrait: ChartTrait<X, Y> | null, component: C): void;

  componentWillSetChartView?(newChartView: ChartView<X, Y> | null, oldChartView: ChartView<X, Y> | null, component: C): void;

  componentDidSetChartView?(newChartView: ChartView<X, Y> | null, oldChartView: ChartView<X, Y> | null, component: C): void;

  componentWillSetTopAxis?(newTopAxisComponent: AxisComponent<X> | null, oldTopAxisComponent: AxisComponent<X> | null, component: C): void;

  componentDidSetTopAxis?(newTopAxisComponent: AxisComponent<X> | null, oldTopAxisComponent: AxisComponent<X> | null, component: C): void;

  componentWillSetTopAxisTrait?(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null, component: C): void;

  componentDidSetTopAxisTrait?(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null, component: C): void;

  componentWillSetTopAxisView?(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null, component: C): void;

  componentDidSetTopAxisView?(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null, component: C): void;

  componentWillSetRightAxis?(newRightAxisComponent: AxisComponent<Y> | null, oldRightAxisComponent: AxisComponent<Y> | null, component: C): void;

  componentDidSetRightAxis?(newRightAxisComponent: AxisComponent<Y> | null, oldRightAxisComponent: AxisComponent<Y> | null, component: C): void;

  componentWillSetRightAxisTrait?(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null, component: C): void;

  componentDidSetRightAxisTrait?(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null, component: C): void;

  componentWillSetRightAxisView?(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null, component: C): void;

  componentDidSetRightAxisView?(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null, component: C): void;

  componentWillSetBottomAxis?(newBottomAxisComponent: AxisComponent<X> | null, oldBottomAxisComponent: AxisComponent<X> | null, component: C): void;

  componentDidSetBottomAxis?(newBottomAxisComponent: AxisComponent<X> | null, oldBottomAxisComponent: AxisComponent<X> | null, component: C): void;

  componentWillSetBottomAxisTrait?(newBottomAxisTrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null, component: C): void;

  componentDidSetBottomAxisTrait?(newBottomAxisTrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null, component: C): void;

  componentWillSetBottomAxisView?(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null, component: C): void;

  componentDidSetBottomAxisView?(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null, component: C): void;

  componentWillSetLeftAxis?(newLeftAxisComponent: AxisComponent<Y> | null, oldLeftAxisComponent: AxisComponent<Y> | null, component: C): void;

  componentDidSetLeftAxis?(newLeftAxisComponent: AxisComponent<Y> | null, oldLeftAxisComponent: AxisComponent<Y> | null, component: C): void;

  componentWillSetLeftAxisTrait?(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null, component: C): void;

  componentDidSetLeftAxisTrait?(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null, component: C): void;

  componentWillSetLeftAxisView?(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null, component: C): void;

  componentDidSetLeftAxisView?(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null, component: C): void;
}
