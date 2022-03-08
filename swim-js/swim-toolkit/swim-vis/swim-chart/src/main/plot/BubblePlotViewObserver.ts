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
import type {ScatterPlotViewObserver} from "./ScatterPlotViewObserver";
import type {BubblePlotView} from "./BubblePlotView";

/** @public */
export interface BubblePlotViewObserver<X = unknown, Y = unknown, V extends BubblePlotView<X, Y> = BubblePlotView<X, Y>> extends ScatterPlotViewObserver<X, Y, V> {
  viewWillSetPlotRadius?(newRadius: Length | null, oldRadius: Length | null, view: V): void;

  viewDidSetPlotRadius?(newRadius: Length | null, oldRadius: Length | null, view: V): void;

  viewWillSetPlotFill?(newFill: Color | null, oldFill: Color | null, view: V): void;

  viewDidSetPlotFill?(newFill: Color | null, oldFill: Color | null, view: V): void;
}
