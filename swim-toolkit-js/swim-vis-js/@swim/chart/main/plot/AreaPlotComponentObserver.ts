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

import type {Color} from "@swim/style";
import type {AreaPlotView} from "./AreaPlotView";
import type {AreaPlotTrait} from "./AreaPlotTrait";
import type {SeriesPlotComponentObserver} from "./SeriesPlotComponentObserver";
import type {AreaPlotComponent} from "./AreaPlotComponent";

export interface AreaPlotComponentObserver<X, Y, C extends AreaPlotComponent<X, Y> = AreaPlotComponent<X, Y>> extends SeriesPlotComponentObserver<X, Y, C> {
  componentWillSetPlotTrait?(newPlotTrait: AreaPlotTrait<X, Y> | null, oldPlotTrait: AreaPlotTrait<X, Y> | null, component: C): void;

  componentDidSetPlotTrait?(newPlotTrait: AreaPlotTrait<X, Y> | null, oldPlotTrait: AreaPlotTrait<X, Y> | null, component: C): void;

  componentWillSetPlotView?(newPlotView: AreaPlotView<X, Y> | null, oldPlotView: AreaPlotView<X, Y> | null, component: C): void;

  componentDidSetPlotView?(newPlotView: AreaPlotView<X, Y> | null, oldPlotView: AreaPlotView<X, Y> | null, component: C): void;

  componentWillSetPlotFill?(newFill: Color | null, oldFill: Color | null, component: C): void;

  componentDidSetPlotFill?(newFill: Color | null, oldFill: Color | null, component: C): void;
}
