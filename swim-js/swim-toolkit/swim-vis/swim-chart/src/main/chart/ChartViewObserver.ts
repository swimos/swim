// Copyright 2015-2023 Swim.inc
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

/** @public */
export interface ChartViewObserver<X = unknown, Y = unknown, V extends ChartView<X, Y> = ChartView<X, Y>> extends ScaledViewObserver<X, Y, V> {
  viewWillAttachGraph?(graphView: GraphView<X, Y>, view: V): void;

  viewDidDetachGraph?(graphView: GraphView<X, Y>, view: V): void;

  viewWillAttachTopAxis?(topAxisView: AxisView<X>, view: V): void;

  viewDidDetachTopAxis?(topAxisView: AxisView<X>, view: V): void;

  viewWillAttachRightAxis?(rightAxisView: AxisView<Y> , view: V): void;

  viewDidDetachRightAxis?(rightAxisView: AxisView<Y>, view: V): void;

  viewWillAttachBottomAxis?(bottomAxisView: AxisView<X>, view: V): void;

  viewDidDetachBottomAxis?(bottomAxisView: AxisView<X>, view: V): void;

  viewWillAttachLeftAxis?(leftAxisView: AxisView<Y>, view: V): void;

  viewDidDetachLeftAxis?(leftAxisView: AxisView<Y>, view: V): void;
}
