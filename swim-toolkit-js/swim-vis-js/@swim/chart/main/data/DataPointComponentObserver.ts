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
import type {GraphicsView} from "@swim/graphics";
import type {ComponentObserver} from "@swim/component";
import type {DataPointView} from "./DataPointView";
import type {DataPointTrait} from "./DataPointTrait";
import type {DataPointComponent} from "./DataPointComponent";

export interface DataPointComponentObserver<X, Y, C extends DataPointComponent<X, Y> = DataPointComponent<X, Y>> extends ComponentObserver<C> {
  dataPointWillSetTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, component: C): void;

  dataPointDidSetTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, component: C): void;

  dataPointWillSetView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointVIew: DataPointView<X, Y> | null, component: C): void;

  dataPointDidSetView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointVIew: DataPointView<X, Y> | null, component: C): void;

  dataPointWillSetViewX?(newX: X | undefined, oldX: X | undefined, component: C): void;

  dataPointDidSetViewX?(newX: X | undefined, oldX: X | undefined, component: C): void;

  dataPointWillSetViewY?(newY: Y | undefined, oldY: Y | undefined, component: C): void;

  dataPointDidSetViewY?(newY: Y | undefined, oldY: Y | undefined, component: C): void;

  dataPointWillSetViewY2?(newY2: Y | undefined, oldY2: Y | undefined, component: C): void;

  dataPointDidSetViewY2?(newY2: Y | undefined, oldY2: Y | undefined, component: C): void;

  dataPointWillSetViewRadius?(newRadius: Length | null, oldRadius: Length | null, component: C): void;

  dataPointDidSetViewRadius?(newRadius: Length | null, oldRadius: Length | null, component: C): void;

  dataPointWillSetLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, component: C): void;

  dataPointDidSetLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, component: C): void;
}
