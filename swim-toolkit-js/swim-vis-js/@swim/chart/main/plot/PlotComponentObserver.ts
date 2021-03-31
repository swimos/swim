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

import type {DataSetComponentObserver} from "../data/DataSetComponentObserver";
import type {PlotView} from "./PlotView";
import type {PlotTrait} from "./PlotTrait";
import type {PlotComponent} from "./PlotComponent";

export interface PlotComponentObserver<X, Y, C extends PlotComponent<X, Y> = PlotComponent<X, Y>> extends DataSetComponentObserver<X, Y, C> {
  plotWillSetTrait?(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null, component: C): void;

  plotDidSetTrait?(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null, component: C): void;

  plotWillSetView?(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null, component: C): void;

  plotDidSetView?(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null, component: C): void;
}
