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

import type {ComponentViewTrait} from "@swim/component";
import {PlotComponent} from "./PlotComponent";
import type {ScatterPlotView} from "./ScatterPlotView";
import type {ScatterPlotTrait} from "./ScatterPlotTrait";
import type {ScatterPlotComponentObserver} from "./ScatterPlotComponentObserver";

export abstract class ScatterPlotComponent<X, Y> extends PlotComponent<X, Y> {
  declare readonly componentObservers: ReadonlyArray<ScatterPlotComponentObserver<X, Y>>;

  abstract readonly plot: ComponentViewTrait<this, ScatterPlotView<X, Y>, ScatterPlotTrait<X, Y>>;
}
