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

import {Class, AnyTiming, Timing} from "@swim/util";
import {MemberFastenerClass, Property} from "@swim/component";
import type {Length} from "@swim/math";
import {Trait, TraitRef} from "@swim/model";
import type {Color} from "@swim/style";
import type {GraphicsView} from "@swim/graphics";
import {Controller, TraitViewRef, TraitViewControllerSet} from "@swim/controller";
import type {DataPointView} from "./DataPointView";
import type {DataPointTrait} from "./DataPointTrait";
import {DataPointController} from "./DataPointController";
import {DataSetTrait} from "./DataSetTrait";
import type {DataSetControllerObserver} from "./DataSetControllerObserver";

/** @public */
export interface DataSetControllerDataPointExt<X = unknown, Y = unknown> {
  attachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>): void;
  detachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>): void;
  attachDataPointView(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>): void;
  detachDataPointView(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>): void;
  attachDataPointLabelView(labelView: GraphicsView, dataPointController: DataPointController<X, Y>): void;
  detachDataPointLabelView(labelView: GraphicsView, dataPointController: DataPointController<X, Y>): void;
}

/** @public */
export class DataSetController<X = unknown, Y = unknown> extends Controller {
  override readonly observerType?: Class<DataSetControllerObserver<X, Y>>;

  @TraitRef<DataSetController<X, Y>, DataSetTrait<X, Y>>({
    type: DataSetTrait,
    observes: true,
    willAttachTrait(dataSetTrait: DataSetTrait<X, Y>): void {
      this.owner.callObservers("controllerWillAttachDataSetTrait", dataSetTrait, this.owner);
    },
    didAttachTrait(dataSetTrait: DataSetTrait<X, Y>): void {
      const dataPointTraits = dataSetTrait.dataPoints.traits;
      for (const traitId in dataPointTraits) {
        const dataPointTrait = dataPointTraits[traitId]!;
        this.owner.dataPoints.addTraitController(dataPointTrait);
      }
    },
    willDetachTrait(dataSetTrait: DataSetTrait<X, Y>): void {
      const dataPointTraits = dataSetTrait.dataPoints.traits;
      for (const traitId in dataPointTraits) {
        const dataPointTrait = dataPointTraits[traitId]!;
        this.owner.dataPoints.deleteTraitController(dataPointTrait);
      }
    },
    didDetachTrait(dataSetTrait: DataSetTrait<X, Y>): void {
      this.owner.callObservers("controllerDidDetachDataSetTrait", dataSetTrait, this.owner);
    },
    traitWillAttachDataPoint(dataPointTrait: DataPointTrait<X, Y>, targetTrait: Trait): void {
      this.owner.dataPoints.addTraitController(dataPointTrait, targetTrait);
    },
    traitDidDetachDataPoint(dataPointTrait: DataPointTrait<X, Y>): void {
      this.owner.dataPoints.deleteTraitController(dataPointTrait);
    },
  })
  readonly dataSet!: TraitRef<this, DataSetTrait<X, Y>>;
  static readonly dataSet: MemberFastenerClass<DataSetController, "dataSet">;

  @Property({type: Timing, state: true})
  readonly dataPointTiming!: Property<this, Timing | boolean | undefined, AnyTiming>;

  @TraitViewControllerSet<DataSetController<X, Y>, DataPointTrait<X, Y>, DataPointView<X, Y>, DataPointController<X, Y>, DataSetControllerDataPointExt<X, Y>>({
    type: DataPointController,
    binds: true,
    observes: true,
    getTraitViewRef(dataPointController: DataPointController<X, Y>): TraitViewRef<unknown, DataPointTrait<X, Y>, DataPointView<X, Y>> {
      return dataPointController.dataPoint;
    },
    willAttachController(dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerWillAttachDataPoint", dataPointController, this.owner);
    },
    didAttachController(dataPointController: DataPointController<X, Y>): void {
      const dataPointTrait = dataPointController.dataPoint.trait;
      if (dataPointTrait !== null) {
        this.attachDataPointTrait(dataPointTrait, dataPointController);
      }
      const dataPointView = dataPointController.dataPoint.view;
      if (dataPointView !== null) {
        this.attachDataPointView(dataPointView, dataPointController);
      }
      const parentView = this.parentView;
      if (parentView !== null) {
        dataPointController.dataPoint.insertView(parentView);
      }
    },
    willDetachController(dataPointController: DataPointController<X, Y>): void {
      const dataPointView = dataPointController.dataPoint.view;
      if (dataPointView !== null) {
        this.detachDataPointView(dataPointView, dataPointController);
      }
      const dataPointTrait = dataPointController.dataPoint.trait;
      if (dataPointTrait !== null) {
        this.detachDataPointTrait(dataPointTrait, dataPointController);
      }
    },
    didDetachController(dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerDidDetachDataPoint", dataPointController, this.owner);
    },
    controllerWillAttachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerWillAttachDataPointTrait", dataPointTrait, dataPointController, this.owner);
      this.attachDataPointTrait(dataPointTrait, dataPointController);
    },
    controllerDidDetachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>): void {
      this.detachDataPointTrait(dataPointTrait, dataPointController);
      this.owner.callObservers("controllerDidDetachDataPointTrait", dataPointTrait, dataPointController, this.owner);
    },
    attachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>): void {
      // hook
    },
    detachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>): void {
      // hook
    },
    controllerWillAttachDataPointView(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerWillAttachDataPointView", dataPointView, dataPointController, this.owner);
      this.attachDataPointView(dataPointView, dataPointController);
    },
    controllerDidDetachDataPointView(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>): void {
      this.detachDataPointView(dataPointView, dataPointController);
      this.owner.callObservers("controllerDidDetachDataPointView", dataPointView, dataPointController, this.owner);
    },
    attachDataPointView(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>): void {
      const labelView = dataPointView.label.view;
      if (labelView !== null) {
        this.attachDataPointLabelView(labelView, dataPointController);
      }
    },
    detachDataPointView(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>): void {
      const labelView = dataPointView.label.view;
      if (labelView !== null) {
        this.detachDataPointLabelView(labelView, dataPointController);
      }
      dataPointView.remove();
    },
    controllerWillSetDataPointX(newX: X | undefined, oldX: X | undefined, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerWillSetDataPointX", newX, oldX, dataPointController, this.owner);
    },
    controllerDidSetDataPointX(newX: X | undefined, oldX: X | undefined, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerDidSetDataPointX", newX, oldX, dataPointController, this.owner);
    },
    controllerWillSetDataPointY(newY: Y | undefined, oldY: Y | undefined, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerWillSetDataPointY", newY, oldY, dataPointController, this.owner);
    },
    controllerDidSetDataPointY(newY: Y | undefined, oldY: Y | undefined, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerDidSetDataPointY", newY, oldY, dataPointController, this.owner);
    },
    controllerWillSetDataPointY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerWillSetDataPointY2", newY2, oldY2, dataPointController, this.owner);
    },
    controllerDidSetDataPointY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerDidSetDataPointY2", newY2, oldY2, dataPointController, this.owner);
    },
    controllerWillSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerWillSetDataPointRadius", newRadius, oldRadius, dataPointController, this.owner);
    },
    controllerDidSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerDidSetDataPointRadius", newRadius, oldRadius, dataPointController, this.owner);
    },
    controllerWillSetDataPointColor(newColor: Color | null, oldColor: Color | null, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerWillSetDataPointColor", newColor, oldColor, dataPointController, this.owner);
    },
    controllerDidSetDataPointColor(newColor: Color | null, oldColor: Color | null, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerDidSetDataPointColor", newColor, oldColor, dataPointController, this.owner);
    },
    controllerWillSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerWillSetDataPointOpacity", newOpacity, oldOpacity, dataPointController, this.owner);
    },
    controllerDidSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerDidSetDataPointOpacity", newOpacity, oldOpacity, dataPointController, this.owner);
    },
    controllerWillAttachDataPointLabelView(labelView: GraphicsView, dataPointController: DataPointController<X, Y>): void {
      this.owner.callObservers("controllerWillAttachDataPointLabelView", labelView, dataPointController, this.owner);
      this.attachDataPointLabelView(labelView, dataPointController);
    },
    controllerDidDetachDataPointLabelView(labelView: GraphicsView, dataPointController: DataPointController<X, Y>): void {
      this.detachDataPointLabelView(labelView, dataPointController);
      this.owner.callObservers("controllerDidDetachDataPointLabelView", labelView, dataPointController, this.owner);
    },
    attachDataPointLabelView(labelView: GraphicsView, dataPointController: DataPointController<X, Y>): void {
      // hook
    },
    detachDataPointLabelView(labelView: GraphicsView, dataPointController: DataPointController<X, Y>): void {
      // hook
    },
  })
  readonly dataPoints!: TraitViewControllerSet<this, DataPointTrait<X, Y>, DataPointView<X, Y>, DataPointController<X, Y>> & DataSetControllerDataPointExt<X, Y>;
  static readonly dataPoints: MemberFastenerClass<DataSetController, "dataPoints">;
}
