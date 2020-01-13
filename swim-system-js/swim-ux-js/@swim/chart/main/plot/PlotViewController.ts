// Copyright 2015-2020 SWIM.AI inc.
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

import {GraphicViewController} from "@swim/view";
import {AxisView} from "../axis/AxisView";
import {PlotType, PlotView} from "./PlotView";
import {PlotViewObserver} from "./PlotViewObserver";

export class PlotViewController<X = any, Y = any, V extends PlotView<X, Y> = PlotView<X, Y>> extends GraphicViewController<V> implements PlotViewObserver<X, Y, V> {
  get type(): PlotType {
    const view = this._view;
    return view ? view.type : void 0 as any;
  }

  xAxis(): AxisView<X> | null {
    const view = this._view;
    return view ? view.xAxis() : null;
  }

  yAxis(): AxisView<Y> | null {
    const view = this._view;
    return view ? view.yAxis() : null;
  }
}
