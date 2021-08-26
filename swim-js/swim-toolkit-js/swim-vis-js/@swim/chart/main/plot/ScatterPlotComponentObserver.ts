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

import type {PlotComponentObserver} from "./PlotComponentObserver";
import type {ScatterPlotView} from "./ScatterPlotView";
import type {ScatterPlotTrait} from "./ScatterPlotTrait";
import type {ScatterPlotComponent} from "./ScatterPlotComponent";

export interface ScatterPlotComponentObserver<X, Y, C extends ScatterPlotComponent<X, Y> = ScatterPlotComponent<X, Y>> extends PlotComponentObserver<X, Y, C> {
  componentWillSetPlotTrait?(newPlotTrait: ScatterPlotTrait<X, Y> | null, oldPlotTrait: ScatterPlotTrait<X, Y> | null, component: C): void;

  componentDidSetPlotTrait?(newPlotTrait: ScatterPlotTrait<X, Y> | null, oldPlotTrait: ScatterPlotTrait<X, Y> | null, component: C): void;

  componentWillSetPlotView?(newPlotView: ScatterPlotView<X, Y> | null, oldPlotView: ScatterPlotView<X, Y> | null, component: C): void;

  componentDidSetPlotView?(newPlotView: ScatterPlotView<X, Y> | null, oldPlotView: ScatterPlotView<X, Y> | null, component: C): void;
}
