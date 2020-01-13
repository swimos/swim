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

import {PlotViewController} from "../plot/PlotViewController";
import {GraphType, GraphView} from "./GraphView";
import {GraphViewObserver} from "./GraphViewObserver";

export class GraphViewController<X = any, Y = any, V extends GraphView<X, Y> = GraphView<X, Y>> extends PlotViewController<X, Y, V> implements GraphViewObserver<X, Y, V> {
  get type(): GraphType {
    const view = this._view;
    return view ? view.type : void 0 as any;
  }
}
