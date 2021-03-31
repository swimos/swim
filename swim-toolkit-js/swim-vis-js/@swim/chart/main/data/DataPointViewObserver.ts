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
import type {GraphicsView, GraphicsViewObserver} from "@swim/graphics";
import type {DataPointView} from "./DataPointView";

export interface DataPointViewObserver<X, Y, V extends DataPointView<X, Y> = DataPointView<X, Y>> extends GraphicsViewObserver<V> {
  dataPointViewWillSetX?(newX: X | undefined, oldX: X | undefined, view: V): void;

  dataPointViewDidSetX?(newX: X | undefined, oldX: X | undefined, view: V): void;

  dataPointViewWillSetY?(newY: Y | undefined, oldY: Y | undefined, view: V): void;

  dataPointViewDidSetY?(newY: Y | undefined, oldY: Y | undefined, view: V): void;

  dataPointViewWillSetY2?(newY2: Y | undefined, oldY2: Y | undefined, view: V): void;

  dataPointViewDidSetY2?(newY2: Y | undefined, oldY2: Y | undefined, view: V): void;

  dataPointViewWillSetRadius?(newRadius: Length | null, oldRadius: Length | null, view: V): void;

  dataPointViewDidSetRadius?(newRadius: Length | null, oldRadius: Length | null, view: V): void;

  dataPointViewWillSetLabel?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, view: V): void;

  dataPointViewDidSetLabel?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, view: V): void;
}
