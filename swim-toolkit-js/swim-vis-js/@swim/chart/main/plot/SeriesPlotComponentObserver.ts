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

import type {PlotComponentObserver} from "./PlotComponentObserver";
import type {SeriesPlotView} from "./SeriesPlotView";
import type {SeriesPlotTrait} from "./SeriesPlotTrait";
import type {SeriesPlotComponent} from "./SeriesPlotComponent";

export interface SeriesPlotComponentObserver<X, Y, C extends SeriesPlotComponent<X, Y> = SeriesPlotComponent<X, Y>> extends PlotComponentObserver<X, Y, C> {
  componentWillSetPlotTrait?(newPlotTrait: SeriesPlotTrait<X, Y> | null, oldPlotTrait: SeriesPlotTrait<X, Y> | null, component: C): void;

  componentDidSetPlotTrait?(newPlotTrait: SeriesPlotTrait<X, Y> | null, oldPlotTrait: SeriesPlotTrait<X, Y> | null, component: C): void;

  componentWillSetPlotView?(newPlotView: SeriesPlotView<X, Y> | null, oldPlotView: SeriesPlotView<X, Y> | null, component: C): void;

  componentDidSetPlotView?(newPlotView: SeriesPlotView<X, Y> | null, oldPlotView: SeriesPlotView<X, Y> | null, component: C): void;
}
