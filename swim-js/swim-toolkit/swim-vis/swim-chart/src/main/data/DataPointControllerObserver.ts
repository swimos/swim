// Copyright 2015-2023 Swim.inc
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

/** @public */
export interface DataPointControllerObserver<X = unknown, Y = unknown, C extends DataPointController<X, Y> = DataPointController<X, Y>> extends ControllerObserver<C> {
  controllerWillAttachDataPointTrait?(dataPointTrait: DataPointTrait<X, Y>, controller: C): void;

  controllerDidDetachDataPointTrait?(dataPointTrait: DataPointTrait<X, Y>, controller: C): void;

  controllerWillAttachDataPointView?(dataPointView: DataPointView<X, Y>, controller: C): void;

  controllerDidDetachDataPointView?(dataPointView: DataPointView<X, Y> , controller: C): void;

  controllerDidSetDataPointX?(x: X | undefined, controller: C): void;

  controllerDidSetDataPointY?(y: Y | undefined, controller: C): void;

  controllerDidSetDataPointY2?(y2: Y | undefined, controller: C): void;

  controllerDidSetDataPointRadius?(radius: Length | null, controller: C): void;

  controllerDidSetDataPointColor?(color: Color | null, controller: C): void;

  controllerDidSetDataPointOpacity?(opacity: number | undefined, controller: C): void;

  controllerWillAttachDataPointLabelView?(labelView: GraphicsView, controller: C): void;

  controllerDidDetachDataPointLabelView?(labelView: GraphicsView, controller: C): void;
}
