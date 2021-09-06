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
import type {ControllerObserver, ControllerFastener} from "@swim/controller";
import type {DataPointView} from "./DataPointView";
import type {DataPointTrait} from "./DataPointTrait";
import type {DataPointController} from "./DataPointController";
import type {DataSetTrait} from "./DataSetTrait";
import type {DataSetController} from "./DataSetController";

export interface DataSetControllerObserver<X, Y, C extends DataSetController<X, Y> = DataSetController<X, Y>> extends ControllerObserver<C> {
  controllerWillSetDataSetTrait?(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, controller: C): void;

  controllerDidSetDataSetTrait?(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, controller: C): void;

  controllerWillSetDataPoint?(newDataPointController: DataPointController<X, Y> | null, oldDataPointController: DataPointController<X, Y> | null, dataPointDastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerDidSetDataPoint?(newDataPointController: DataPointController<X, Y> | null, oldDataPointController: DataPointController<X, Y> | null, dataPointDastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerWillSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerDidSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerWillSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerDidSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerWillSetDataPointX?(newX: X | undefined, oldX: X | undefined, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerDidSetDataPointX?(newX: X | undefined, oldX: X | undefined, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerWillSetDataPointY?(newY: Y | undefined, oldY: Y | undefined, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerDidSetDataPointY?(newY: Y | undefined, oldY: Y | undefined, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerWillSetDataPointY2?(newY2: Y | undefined, oldY2: Y | undefined, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerDidSetDataPointY2?(newY2: Y | undefined, oldY2: Y | undefined, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerWillSetDataPointRadius?(newRadius: Length | null, oldRadius: Length | null, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerDidSetDataPointRadius?(newRadius: Length | null, oldRadius: Length | null, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerWillSetDataPointColor?(newColor: Color | null, oldColor: Color | null, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerDidSetDataPointColor?(newColor: Color | null, oldColor: Color | null, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerWillSetDataPointOpacity?(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerDidSetDataPointOpacity?(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllertWillSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;

  controllerDidSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointFastener: ControllerFastener<C, DataPointController<X, Y>>): void;
}
