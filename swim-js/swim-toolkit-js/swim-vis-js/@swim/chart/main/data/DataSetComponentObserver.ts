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
import type {ComponentObserver, ComponentFastener} from "@swim/component";
import type {DataPointView} from "./DataPointView";
import type {DataPointTrait} from "./DataPointTrait";
import type {DataPointComponent} from "./DataPointComponent";
import type {DataSetTrait} from "./DataSetTrait";
import type {DataSetComponent} from "./DataSetComponent";

export interface DataSetComponentObserver<X, Y, C extends DataSetComponent<X, Y> = DataSetComponent<X, Y>> extends ComponentObserver<C> {
  componentWillSetDataSetTrait?(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, component: C): void;

  componentDidSetDataSetTrait?(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, component: C): void;

  componentWillSetDataPoint?(newDataPointComponent: DataPointComponent<X, Y> | null, oldDataPointComponent: DataPointComponent<X, Y> | null, dataPointDastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentDidSetDataPoint?(newDataPointComponent: DataPointComponent<X, Y> | null, oldDataPointComponent: DataPointComponent<X, Y> | null, dataPointDastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentWillSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentDidSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentWillSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentDidSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentWillSetDataPointX?(newX: X | undefined, oldX: X | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentDidSetDataPointX?(newX: X | undefined, oldX: X | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentWillSetDataPointY?(newY: Y | undefined, oldY: Y | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentDidSetDataPointY?(newY: Y | undefined, oldY: Y | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentWillSetDataPointY2?(newY2: Y | undefined, oldY2: Y | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentDidSetDataPointY2?(newY2: Y | undefined, oldY2: Y | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentWillSetDataPointRadius?(newRadius: Length | null, oldRadius: Length | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentDidSetDataPointRadius?(newRadius: Length | null, oldRadius: Length | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentWillSetDataPointColor?(newColor: Color | null, oldColor: Color | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentDidSetDataPointColor?(newColor: Color | null, oldColor: Color | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentWillSetDataPointOpacity?(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentDidSetDataPointOpacity?(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentWillSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  componentDidSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;
}
