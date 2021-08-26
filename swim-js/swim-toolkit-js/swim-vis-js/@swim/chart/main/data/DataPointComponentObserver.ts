// Copyright 2015-2021 Swim Inc.
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
import type {GraphicsView} from "@swim/graphics";
import type {ComponentObserver} from "@swim/component";
import type {DataPointView} from "./DataPointView";
import type {DataPointTrait} from "./DataPointTrait";
import type {DataPointComponent} from "./DataPointComponent";

export interface DataPointComponentObserver<X, Y, C extends DataPointComponent<X, Y> = DataPointComponent<X, Y>> extends ComponentObserver<C> {
  componentWillSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, component: C): void;

  componentDidSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, component: C): void;

  componentWillSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointVIew: DataPointView<X, Y> | null, component: C): void;

  componentDidSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointVIew: DataPointView<X, Y> | null, component: C): void;

  componentWillSetDataPointX?(newX: X | undefined, oldX: X | undefined, component: C): void;

  componentDidSetDataPointX?(newX: X | undefined, oldX: X | undefined, component: C): void;

  componentWillSetDataPointY?(newY: Y | undefined, oldY: Y | undefined, component: C): void;

  componentDidSetDataPointY?(newY: Y | undefined, oldY: Y | undefined, component: C): void;

  componentWillSetDataPointY2?(newY2: Y | undefined, oldY2: Y | undefined, component: C): void;

  componentDidSetDataPointY2?(newY2: Y | undefined, oldY2: Y | undefined, component: C): void;

  componentWillSetDataPointRadius?(newRadius: Length | null, oldRadius: Length | null, component: C): void;

  componentDidSetDataPointRadius?(newRadius: Length | null, oldRadius: Length | null, component: C): void;

  componentWillSetDataPointColor?(newColor: Color | null, oldColor: Color | null, component: C): void;

  componentDidSetDataPointColor?(newColor: Color | null, oldColor: Color | null, component: C): void;

  componentWillSetDataPointOpacity?(newOpacity: number | undefined, oldOpacity: number | undefined, component: C): void;

  componentDidSetDataPointOpacity?(newOpacity: number | undefined, oldOpacity: number | undefined, component: C): void;

  componentWillSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, component: C): void;

  componentDidSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, component: C): void;
}
