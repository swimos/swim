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

import {ScaleViewController} from "./scale/ScaleViewController";
import {AxisView} from "./axis/AxisView";
import {ChartView} from "./ChartView";
import {ChartViewObserver} from "./ChartViewObserver";

export class ChartViewController<X = unknown, Y = unknown, V extends ChartView<X, Y> = ChartView<X, Y>> extends ScaleViewController<X, Y, V> implements ChartViewObserver<X, Y, V> {
  topAxis(): AxisView<X> | null {
    const view = this._view;
    return view !== null ? view.topAxis() : null;
  }

  rightAxis(): AxisView<Y> | null {
    const view = this._view;
    return view !== null ? view.rightAxis() : null;
  }

  bottomAxis(): AxisView<X> | null {
    const view = this._view;
    return view !== null ? view.bottomAxis() : null;
  }

  leftAxis(): AxisView<Y> | null {
    const view = this._view;
    return view !== null ? view.leftAxis() : null;
  }
}
