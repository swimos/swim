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
import {AxisView} from "./axis/AxisView";
import {ChartView} from "./ChartView";
import {ChartViewObserver} from "./ChartViewObserver";

export class ChartViewController<X = any, Y = any, V extends ChartView<X, Y> = ChartView<X, Y>> extends GraphicViewController<V> implements ChartViewObserver<X, Y, V> {
  topAxis(): AxisView<X> | null {
    const view = this._view;
    return view ? view.topAxis() : null;
  }

  rightAxis(): AxisView<Y> | null {
    const view = this._view;
    return view ? view.rightAxis() : null;
  }

  bottomAxis(): AxisView<X> | null {
    const view = this._view;
    return view ? view.bottomAxis() : null;
  }

  leftAxis(): AxisView<Y> | null {
    const view = this._view;
    return view ? view.leftAxis() : null;
  }
}
