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

import {AnyTiming, Timing} from "@swim/mapping";
import {ComponentProperty, ComponentViewTrait} from "@swim/component";
import {DataSetComponent} from "../data/DataSetComponent";
import type {PlotView} from "./PlotView";
import type {PlotTrait} from "./PlotTrait";
import {BubblePlotTrait} from "./BubblePlotTrait";
import {LinePlotTrait} from "./LinePlotTrait";
import {AreaPlotTrait} from "./AreaPlotTrait";
import type {PlotComponentObserver} from "./PlotComponentObserver";
import {BubblePlotComponent} from "../"; // forward import
import {LinePlotComponent} from "../"; // forward import
import {AreaPlotComponent} from "../"; // forward import

export abstract class PlotComponent<X, Y> extends DataSetComponent<X, Y> {
  override readonly componentObservers!: ReadonlyArray<PlotComponentObserver<X, Y>>;

  @ComponentProperty({type: Timing, inherit: true})
  readonly plotTiming!: ComponentProperty<this, Timing | boolean | undefined, AnyTiming>;

  abstract readonly plot: ComponentViewTrait<this, PlotView<X, Y>, PlotTrait<X, Y>>;

  static createPlot<X, Y>(plotTrait: PlotTrait<X, Y>): PlotComponent<X, Y> | null {
    if (plotTrait instanceof BubblePlotTrait) {
      return new BubblePlotComponent<X, Y>();
    } else if (plotTrait instanceof LinePlotTrait) {
      return new LinePlotComponent<X, Y>();
    } else if (plotTrait instanceof AreaPlotTrait) {
      return new AreaPlotComponent<X, Y>();
    } else {
      return null;
    }
  }
}
