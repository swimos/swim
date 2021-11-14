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
import type {ControllerObserver} from "@swim/controller";
import type {DataPointView} from "./DataPointView";
import type {DataPointTrait} from "./DataPointTrait";
import type {DataPointController} from "./DataPointController";
import type {DataSetTrait} from "./DataSetTrait";
import type {DataSetController} from "./DataSetController";

/** @public */
export interface DataSetControllerObserver<X = unknown, Y = unknown, C extends DataSetController<X, Y> = DataSetController<X, Y>> extends ControllerObserver<C> {
  controllerWillAttachDataSetTrait?(dataSetTrait: DataSetTrait<X, Y>, controller: C): void;

  controllerDidDetachDataSetTrait?(dataSetTrait: DataSetTrait<X, Y>, controller: C): void;

  controllerWillAttachDataPoint?(dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerDidDetachDataPoint?(dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerWillAttachDataPointTrait?(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerDidDetachDataPointTrait?(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerWillAttachDataPointView?(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerDidDetachDataPointView?(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerWillSetDataPointX?(newX: X | undefined, oldX: X | undefined, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerDidSetDataPointX?(newX: X | undefined, oldX: X | undefined, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerWillSetDataPointY?(newY: Y | undefined, oldY: Y | undefined, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerDidSetDataPointY?(newY: Y | undefined, oldY: Y | undefined, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerWillSetDataPointY2?(newY2: Y | undefined, oldY2: Y | undefined, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerDidSetDataPointY2?(newY2: Y | undefined, oldY2: Y | undefined, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerWillSetDataPointRadius?(newRadius: Length | null, oldRadius: Length | null, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerDidSetDataPointRadius?(newRadius: Length | null, oldRadius: Length | null, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerWillSetDataPointColor?(newColor: Color | null, oldColor: Color | null, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerDidSetDataPointColor?(newColor: Color | null, oldColor: Color | null, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerWillSetDataPointOpacity?(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerDidSetDataPointOpacity?(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerWillAttachDataPointLabelView?(labelView: GraphicsView | null, dataPointController: DataPointController<X, Y>, controller: C): void;

  controllerDidDetachDataPointLabelView?(labelView: GraphicsView | null, dataPointController: DataPointController<X, Y>, controller: C): void;
}
