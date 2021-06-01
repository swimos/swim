// Copyright 2015-2021 Swim inc.
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

import type {ScaledViewObserver} from "../scaled/ScaledViewObserver";
import type {GraphView} from "../graph/GraphView";
import type {AxisView} from "../axis/AxisView";
import type {ChartView} from "./ChartView";

export interface ChartViewObserver<X, Y, V extends ChartView<X, Y> = ChartView<X, Y>> extends ScaledViewObserver<X, Y, V> {
  viewWillSetGraph?(newGraphView: GraphView<X, Y> | null, oldGraphView: GraphView<X, Y> | null, view: V): void;

  viewDidSetGraph?(newGraphView: GraphView<X, Y> | null, oldGraphView: GraphView<X, Y> | null, view: V): void;

  viewWillSetTopAxis?(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null, view: V): void;

  viewDidSetTopAxis?(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null, view: V): void;

  viewWillSetRightAxis?(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null, view: V): void;

  viewDidSetRightAxis?(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null, view: V): void;

  viewWillSetBottomAxis?(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null, view: V): void;

  viewDidSetBottomAxis?(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null, view: V): void;

  viewWillSetLeftAxis?(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null, view: V): void;

  viewDidSetLeftAxis?(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null, view: V): void;
}
