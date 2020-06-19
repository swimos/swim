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

import {ContinuousScale} from "@swim/scale";
import {GraphicsViewController} from "@swim/view";
import {PlotType, PlotView} from "./PlotView";
import {PlotViewObserver} from "./PlotViewObserver";

export class PlotViewController<X = unknown, Y = unknown, V extends PlotView<X, Y> = PlotView<X, Y>> extends GraphicsViewController<V> implements PlotViewObserver<X, Y, V> {
  get plotType(): PlotType {
    const view = this._view;
    return view !== null ? view.plotType : void 0 as any;
  }

  xScale(): ContinuousScale<X, number> | undefined {
    const view = this._view;
    return view !== null ? view.xScale() : void 0;
  }

  yScale(): ContinuousScale<Y, number> | undefined {
    const view = this._view;
    return view !== null ? view.yScale() : void 0;
  }
}
