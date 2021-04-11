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
import type {GraphicsView, GraphicsViewObserver} from "@swim/graphics";
import type {DataPointView} from "./DataPointView";

export interface DataPointViewObserver<X, Y, V extends DataPointView<X, Y> = DataPointView<X, Y>> extends GraphicsViewObserver<V> {
  viewWillSetDataPointX?(newX: X | undefined, oldX: X | undefined, view: V): void;

  viewDidSetDataPointX?(newX: X | undefined, oldX: X | undefined, view: V): void;

  viewWillSetDataPointY?(newY: Y | undefined, oldY: Y | undefined, view: V): void;

  viewDidSetDataPointY?(newY: Y | undefined, oldY: Y | undefined, view: V): void;

  viewWillSetDataPointY2?(newY2: Y | undefined, oldY2: Y | undefined, view: V): void;

  viewDidSetDataPointY2?(newY2: Y | undefined, oldY2: Y | undefined, view: V): void;

  viewWillSetDataPointRadius?(newRadius: Length | null, oldRadius: Length | null, view: V): void;

  viewDidSetDataPointRadius?(newRadius: Length | null, oldRadius: Length | null, view: V): void;

  viewWillSetDataPointColor?(newColor: Color | null, oldColor: Color | null, view: V): void;

  viewDidSetDataPointColor?(newColor: Color | null, oldColor: Color | null, view: V): void;

  viewWillSetDataPointOpacity?(newOpacity: number | undefined, oldOpacity: number | undefined, view: V): void;

  viewDidSetDataPointOpacity?(newOpacity: number | undefined, oldOpacity: number | undefined, view: V): void;

  viewWillSetDataPointLabel?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, view: V): void;

  viewDidSetDataPointLabel?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, view: V): void;
}
