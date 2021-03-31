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

import type {Length} from "@swim/math";
import type {Color} from "@swim/style";
import type {Look} from "@swim/theme";
import type {LinePlotView} from "./LinePlotView";
import type {LinePlotTrait} from "./LinePlotTrait";
import type {SeriesPlotComponentObserver} from "./SeriesPlotComponentObserver";
import type {LinePlotComponent} from "./LinePlotComponent";

export interface LinePlotComponentObserver<X, Y, C extends LinePlotComponent<X, Y> = LinePlotComponent<X, Y>> extends SeriesPlotComponentObserver<X, Y, C> {
  plotWillSetTrait?(newPlotTrait: LinePlotTrait<X, Y> | null, oldPlotTrait: LinePlotTrait<X, Y> | null, component: C): void;

  plotDidSetTrait?(newPlotTrait: LinePlotTrait<X, Y> | null, oldPlotTrait: LinePlotTrait<X, Y> | null, component: C): void;

  plotWillSetView?(newPlotView: LinePlotView<X, Y> | null, oldPlotView: LinePlotView<X, Y> | null, component: C): void;

  plotDidSetView?(newPlotView: LinePlotView<X, Y> | null, oldPlotView: LinePlotView<X, Y> | null, component: C): void;

  linePlotWillSetStroke?(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, component: C): void;

  linePlotDidSetStroke?(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, component: C): void;

  linePlotWillSetStrokeWidth?(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, component: C): void;

  linePlotDidSetStrokeWidth?(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, component: C): void;
}
