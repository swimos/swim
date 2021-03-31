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
import type {ComponentObserver, ComponentFastener} from "@swim/component";
import type {DataPointView} from "./DataPointView";
import type {DataPointTrait} from "./DataPointTrait";
import type {DataPointComponent} from "./DataPointComponent";
import type {DataSetTrait} from "./DataSetTrait";
import type {DataSetComponent} from "./DataSetComponent";

export interface DataSetComponentObserver<X, Y, C extends DataSetComponent<X, Y> = DataSetComponent<X, Y>> extends ComponentObserver<C> {
  dataSetWillSetTrait?(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, component: C): void;

  dataSetDidSetTrait?(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, component: C): void;

  dataSetWillSetDataPoint?(newDataPointComponent: DataPointComponent<X, Y> | null, oldDataPointComponent: DataPointComponent<X, Y> | null, dataPointDastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetDidSetDataPoint?(newDataPointComponent: DataPointComponent<X, Y> | null, oldDataPointComponent: DataPointComponent<X, Y> | null, dataPointDastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetWillSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetDidSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetWillSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetDidSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetWillSetDataPointViewX?(newX: X | undefined, oldX: X | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetDidSetDataPointViewX?(newX: X | undefined, oldX: X | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetWillSetDataPointViewY?(newY: Y | undefined, oldY: Y | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetDidSetDataPointViewY?(newY: Y | undefined, oldY: Y | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetWillSetDataPointViewY2?(newY2: Y | undefined, oldY2: Y | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetDidSetDataPointViewY2?(newY2: Y | undefined, oldY2: Y | undefined, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetWillSetDataPointViewRadius?(newRadius: Length | null, oldRadius: Length | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetDidSetDataPointViewRadius?(newRadius: Length | null, oldRadius: Length | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetWillSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;

  dataSetDidSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointFastener: ComponentFastener<C, DataPointComponent<X, Y>>): void;
}
