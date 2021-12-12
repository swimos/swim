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

import type {View} from "@swim/view";
import type {DataPointView} from "../data/DataPointView";
import type {ScaledXYViewObserver} from "../scaled/ScaledXYViewObserver";
import type {PlotView} from "./PlotView";

/** @public */
export interface PlotViewObserver<X = unknown, Y = unknown, V extends PlotView<X, Y> = PlotView<X, Y>> extends ScaledXYViewObserver<X, Y, V> {
  viewWillAttachDataPoint?(dataPointView: DataPointView<X, Y>, targetView: View | null, view: V): void;

  viewDidDetachDataPoint?(dataPointView: DataPointView<X, Y>, view: V): void;
}
