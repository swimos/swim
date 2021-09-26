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

import {AnyTiming, Timing} from "@swim/mapping";
import type {Length} from "@swim/math";
import type {Trait} from "@swim/model";
import type {Color} from "@swim/style";
import type {GraphicsView} from "@swim/graphics";
import {
  Controller,
  ControllerProperty,
  ControllerTrait,
  ControllerFastener,
  CompositeController,
} from "@swim/controller";
import type {DataPointView} from "./DataPointView";
import type {DataPointTrait} from "./DataPointTrait";
import {DataPointController} from "./DataPointController";
import {DataSetTrait} from "./DataSetTrait";
import type {DataSetControllerObserver} from "./DataSetControllerObserver";

export class DataSetController<X, Y> extends CompositeController {
  constructor() {
    super();
    this.dataPointFasteners = [];
  }

  override readonly controllerObservers!: ReadonlyArray<DataSetControllerObserver<X, Y>>;

  protected initDataSetTrait(dataSetTrait: DataSetTrait<X, Y>): void {
    // hook
  }

  protected attachDataSetTrait(dataSetTrait: DataSetTrait<X, Y>): void {
    const dataPointFasteners = dataSetTrait.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointTrait = dataPointFasteners[i]!.trait;
      if (dataPointTrait !== null) {
        this.insertDataPointTrait(dataPointTrait);
      }
    }
  }

  protected detachDataSetTrait(dataSetTrait: DataSetTrait<X, Y>): void {
    const dataPointFasteners = dataSetTrait.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointTrait = dataPointFasteners[i]!.trait;
      if (dataPointTrait !== null) {
        this.removeDataPointTrait(dataPointTrait);
      }
    }
  }

  protected willSetDataSetTrait(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataSetTrait !== void 0) {
        controllerObserver.controllerWillSetDataSetTrait(newDataSetTrait, oldDataSetTrait, this);
      }
    }
  }

  protected onSetDataSetTrait(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null): void {
    if (oldDataSetTrait !== null) {
      this.detachDataSetTrait(oldDataSetTrait);
    }
    if (newDataSetTrait !== null) {
      this.attachDataSetTrait(newDataSetTrait);
      this.initDataSetTrait(newDataSetTrait);
    }
  }

  protected didSetDataSetTrait(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataSetTrait !== void 0) {
        controllerObserver.controllerDidSetDataSetTrait(newDataSetTrait, oldDataSetTrait, this);
      }
    }
  }

  /** @hidden */
  static DataSetFastener = ControllerTrait.define<DataSetController<unknown, unknown>, DataSetTrait<unknown, unknown>>({
    type: DataSetTrait,
    observe: true,
    willSetTrait(newDataSetTrait: DataSetTrait<unknown, unknown> | null, oldDataSetTrait: DataSetTrait<unknown, unknown> | null): void {
      this.owner.willSetDataSetTrait(newDataSetTrait, oldDataSetTrait);
    },
    onSetTrait(newDataSetTrait: DataSetTrait<unknown, unknown> | null, oldDataSetTrait: DataSetTrait<unknown, unknown> | null): void {
      this.owner.onSetDataSetTrait(newDataSetTrait, oldDataSetTrait);
    },
    didSetTrait(newDataSetTrait: DataSetTrait<unknown, unknown> | null, oldDataSetTrait: DataSetTrait<unknown, unknown> | null): void {
      this.owner.didSetDataSetTrait(newDataSetTrait, oldDataSetTrait);
    },
    traitWillSetDataPoint(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null, targetTrait: Trait): void {
      if (oldDataPointTrait !== null) {
        this.owner.removeDataPointTrait(oldDataPointTrait);
      }
    },
    traitDidSetDataPoint(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null, targetTrait: Trait): void {
      if (newDataPointTrait !== null) {
        this.owner.insertDataPointTrait(newDataPointTrait, targetTrait);
      }
    },
  });

  @ControllerTrait<DataSetController<X, Y>, DataSetTrait<X, Y>>({
    extends: DataSetController.DataSetFastener,
  })
  readonly dataSet!: ControllerTrait<this, DataSetTrait<X, Y>>;

  insertDataPoint(dataPointController: DataPointController<X, Y>, targetController: Controller | null = null): void {
    const dataPointFasteners = this.dataPointFasteners as ControllerFastener<this, DataPointController<X, Y>>[];
    let targetIndex = dataPointFasteners.length;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      if (dataPointFastener.controller === dataPointController) {
        return;
      } else if (dataPointFastener.controller === targetController) {
        targetIndex = i;
      }
    }
    const dataPointFastener = this.createDataPointFastener(dataPointController);
    dataPointFasteners.splice(targetIndex, 0, dataPointFastener);
    dataPointFastener.setController(dataPointController, targetController);
    if (this.isMounted()) {
      dataPointFastener.mount();
    }
  }

  removeDataPoint(dataPointController: DataPointController<X, Y>): void {
    const dataPointFasteners = this.dataPointFasteners as ControllerFastener<this, DataPointController<X, Y>>[];
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      if (dataPointFastener.controller === dataPointController) {
        dataPointFastener.setController(null);
        if (this.isMounted()) {
          dataPointFastener.unmount();
        }
        dataPointFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createDataPoint(dataPointTrait: DataPointTrait<X, Y>): DataPointController<X, Y> | null {
    return new DataPointController<X, Y>();
  }

  protected initDataPoint(dataPointController: DataPointController<X, Y>, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const dataPointTrait = dataPointController.dataPoint.trait;
    if (dataPointTrait !== null) {
      this.initDataPointTrait(dataPointTrait, dataPointFastener);
    }
    const dataPointView = dataPointController.dataPoint.view;
    if (dataPointView !== null) {
      this.initDataPointView(dataPointView, dataPointFastener);
    }
  }

  protected attachDataPoint(dataPointController: DataPointController<X, Y>, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const dataPointTrait = dataPointController.dataPoint.trait;
    if (dataPointTrait !== null) {
      this.attachDataPointTrait(dataPointTrait, dataPointFastener);
    }
    const dataPointView = dataPointController.dataPoint.view;
    if (dataPointView !== null) {
      this.attachDataPointView(dataPointView, dataPointFastener);
    }
  }

  protected detachDataPoint(dataPointController: DataPointController<X, Y>, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const dataPointView = dataPointController.dataPoint.view;
    if (dataPointView !== null) {
      this.detachDataPointView(dataPointView, dataPointFastener);
    }
    const dataPointTrait = dataPointController.dataPoint.trait;
    if (dataPointTrait !== null) {
      this.detachDataPointTrait(dataPointTrait, dataPointFastener);
    }
  }

  protected willSetDataPoint(newDataPointController: DataPointController<X, Y> | null, oldDataPointController: DataPointController<X, Y> | null,
                             dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataPoint !== void 0) {
        controllerObserver.controllerWillSetDataPoint(newDataPointController, oldDataPointController, dataPointFastener);
      }
    }
  }

  protected onSetDataPoint(newDataPointController: DataPointController<X, Y> | null, oldDataPointController: DataPointController<X, Y> | null,
                           dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    if (oldDataPointController !== null) {
      this.detachDataPoint(oldDataPointController, dataPointFastener);
    }
    if (newDataPointController !== null) {
      this.attachDataPoint(newDataPointController, dataPointFastener);
      this.initDataPoint(newDataPointController, dataPointFastener);
    }
  }

  protected didSetDataPoint(newDataPointController: DataPointController<X, Y> | null, oldDataPointController: DataPointController<X, Y> | null,
                            dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPoint !== void 0) {
        controllerObserver.controllerDidSetDataPoint(newDataPointController, oldDataPointController, dataPointFastener);
      }
    }
  }

  insertDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, targetTrait: Trait | null = null): void {
    const dataPointFasteners = this.dataPointFasteners as ControllerFastener<this, DataPointController<X, Y>>[];
    let targetController: DataPointController<X, Y> | null = null;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointController = dataPointFasteners[i]!.controller;
      if (dataPointController !== null) {
        if (dataPointController.dataPoint.trait === dataPointTrait) {
          return;
        } else if (dataPointController.dataPoint.trait === targetTrait) {
          targetController = dataPointController;
        }
      }
    }
    const dataPointController = this.createDataPoint(dataPointTrait);
    if (dataPointController !== null) {
      dataPointController.dataPoint.setTrait(dataPointTrait);
      this.insertChildController(dataPointController, targetController);
      if (dataPointController.dataPoint.view === null) {
        const dataPointView = this.createDataPointView(dataPointController);
        let targetView: DataPointView<X, Y> | null = null;
        if (targetController !== null) {
          targetView = targetController.dataPoint.view;
        }
        dataPointController.dataPoint.setView(dataPointView, targetView);
      }
    }
  }

  removeDataPointTrait(dataPointTrait: DataPointTrait<X, Y>): void {
    const dataPointFasteners = this.dataPointFasteners as ControllerFastener<this, DataPointController<X, Y>>[];
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      const dataPointController = dataPointFastener.controller;
      if (dataPointController !== null && dataPointController.dataPoint.trait === dataPointTrait) {
        dataPointFastener.setController(null);
        if (this.isMounted()) {
          dataPointFastener.unmount();
        }
        dataPointFasteners.splice(i, 1);
        dataPointController.remove();
        return;
      }
    }
  }

  protected initDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    // hook
  }

  protected attachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    // hook
  }

  protected detachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    // hook
  }

  protected willSetDataPointTrait(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null,
                                  dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataPointTrait !== void 0) {
        controllerObserver.controllerWillSetDataPointTrait(newDataPointTrait, oldDataPointTrait, dataPointFastener);
      }
    }
  }

  protected onSetDataPointTrait(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null,
                                dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    if (oldDataPointTrait !== null) {
      this.detachDataPointTrait(oldDataPointTrait, dataPointFastener);
    }
    if (newDataPointTrait !== null) {
      this.attachDataPointTrait(newDataPointTrait, dataPointFastener);
      this.initDataPointTrait(newDataPointTrait, dataPointFastener);
    }
  }

  protected didSetDataPointTrait(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null,
                                 dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPointTrait !== void 0) {
        controllerObserver.controllerDidSetDataPointTrait(newDataPointTrait, oldDataPointTrait, dataPointFastener);
      }
    }
  }

  protected createDataPointView(dataPointController: DataPointController<X, Y>): DataPointView<X, Y> | null {
    return dataPointController.dataPoint.createView();
  }

  protected initDataPointView(dataPointView: DataPointView<X, Y>, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const labelView = dataPointView.label.view;
    if (labelView !== null) {
      this.initDataPointLabelView(labelView, dataPointFastener);
    }
  }

  protected attachDataPointView(dataPointView: DataPointView<X, Y>, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const labelView = dataPointView.label.view;
    if (labelView !== null) {
      this.attachDataPointLabelView(labelView, dataPointFastener);
    }
  }

  protected detachDataPointView(dataPointView: DataPointView<X, Y>, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const labelView = dataPointView.label.view;
    if (labelView !== null) {
      this.detachDataPointLabelView(labelView, dataPointFastener);
    }
    dataPointView.remove();
  }

  protected willSetDataPointView(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null,
                                 dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataPointView !== void 0) {
        controllerObserver.controllerWillSetDataPointView(newDataPointView, oldDataPointView, dataPointFastener);
      }
    }
  }

  protected onSetDataPointView(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null,
                               dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    if (oldDataPointView !== null) {
      this.detachDataPointView(oldDataPointView, dataPointFastener);
    }
    if (newDataPointView !== null) {
      this.attachDataPointView(newDataPointView, dataPointFastener);
      this.initDataPointView(newDataPointView, dataPointFastener);
    }
  }

  protected didSetDataPointView(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null,
                                dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPointView !== void 0) {
        controllerObserver.controllerDidSetDataPointView(newDataPointView, oldDataPointView, dataPointFastener);
      }
    }
  }

  protected willSetDataPointX(newX: X | undefined, oldX: X | undefined, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataPointX !== void 0) {
        controllerObserver.controllerWillSetDataPointX(newX, oldX, dataPointFastener);
      }
    }
  }

  protected onSetDataPointX(newX: X | undefined, oldX: X | undefined, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    // hook
  }

  protected didSetDataPointX(newX: X | undefined, oldX: X | undefined, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPointX !== void 0) {
        controllerObserver.controllerDidSetDataPointX(newX, oldX, dataPointFastener);
      }
    }
  }

  protected willSetDataPointY(newY: Y | undefined, oldY: Y | undefined, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataPointY !== void 0) {
        controllerObserver.controllerWillSetDataPointY(newY, oldY, dataPointFastener);
      }
    }
  }

  protected onSetDataPointY(newY: Y | undefined, oldY: Y | undefined, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    // hook
  }

  protected didSetDataPointY(newY: Y | undefined, oldY: Y | undefined, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPointY !== void 0) {
        controllerObserver.controllerDidSetDataPointY(newY, oldY, dataPointFastener);
      }
    }
  }

  protected willSetDataPointY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataPointY2 !== void 0) {
        controllerObserver.controllerWillSetDataPointY2(newY2, oldY2, dataPointFastener);
      }
    }
  }

  protected onSetDataPointY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    // hook
  }

  protected didSetDataPointY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPointY2 !== void 0) {
        controllerObserver.controllerDidSetDataPointY2(newY2, oldY2, dataPointFastener);
      }
    }
  }

  protected willSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataPointRadius !== void 0) {
        controllerObserver.controllerWillSetDataPointRadius(newRadius, oldRadius, dataPointFastener);
      }
    }
  }

  protected onSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    // hook
  }

  protected didSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPointRadius !== void 0) {
        controllerObserver.controllerDidSetDataPointRadius(newRadius, oldRadius, dataPointFastener);
      }
    }
  }

  protected willSetDataPointColor(newColor: Color | null, oldColor: Color | null, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataPointColor !== void 0) {
        controllerObserver.controllerWillSetDataPointColor(newColor, oldColor, dataPointFastener);
      }
    }
  }

  protected onSetDataPointColor(newColor: Color | null, oldColor: Color | null, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    // hook
  }

  protected didSetDataPointColor(newColor: Color | null, oldColor: Color | null, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPointColor !== void 0) {
        controllerObserver.controllerDidSetDataPointColor(newColor, oldColor, dataPointFastener);
      }
    }
  }

  protected willSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataPointOpacity !== void 0) {
        controllerObserver.controllerWillSetDataPointOpacity(newOpacity, oldOpacity, dataPointFastener);
      }
    }
  }

  protected onSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    // hook
  }

  protected didSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPointOpacity !== void 0) {
        controllerObserver.controllerDidSetDataPointOpacity(newOpacity, oldOpacity, dataPointFastener);
      }
    }
  }

  protected initDataPointLabelView(labelView: GraphicsView, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    // hook
  }

  protected attachDataPointLabelView(labelView: GraphicsView, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    // hook
  }

  protected detachDataPointLabelView(labelView: GraphicsView, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    // hook
  }

  protected willSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                      dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllertWillSetDataPointLabelView !== void 0) {
        controllerObserver.controllertWillSetDataPointLabelView(newLabelView, oldLabelView, dataPointFastener);
      }
    }
  }

  protected onSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                    dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    if (oldLabelView !== null) {
      this.detachDataPointLabelView(oldLabelView, dataPointFastener);
    }
    if (newLabelView !== null) {
      this.attachDataPointLabelView(newLabelView, dataPointFastener);
      this.initDataPointLabelView(newLabelView, dataPointFastener);
    }
  }

  protected didSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                     dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPointLabelView !== void 0) {
        controllerObserver.controllerDidSetDataPointLabelView(newLabelView, oldLabelView, dataPointFastener);
      }
    }
  }

  @ControllerProperty({type: Timing, state: true})
  readonly dataPointTiming!: ControllerProperty<this, Timing | boolean | undefined, AnyTiming>;

  /** @hidden */
  static DataPointFastener = ControllerFastener.define<DataSetController<unknown, unknown>, DataPointController<unknown, unknown>>({
    type: DataPointController,
    child: false,
    observe: true,
    willSetController(newDataPointController: DataPointController<unknown, unknown> | null, oldDataPointController: DataPointController<unknown, unknown> | null): void {
      this.owner.willSetDataPoint(newDataPointController, oldDataPointController, this);
    },
    onSetController(newDataPointController: DataPointController<unknown, unknown> | null, oldDataPointController: DataPointController<unknown, unknown> | null): void {
      this.owner.onSetDataPoint(newDataPointController, oldDataPointController, this);
    },
    didSetController(newDataPointController: DataPointController<unknown, unknown> | null, oldDataPointController: DataPointController<unknown, unknown> | null): void {
      this.owner.didSetDataPoint(newDataPointController, oldDataPointController, this);
    },
    controllerWillSetDataPointTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null): void {
      this.owner.willSetDataPointTrait(newDataPointTrait, oldDataPointTrait, this);
    },
    controllerDidSetDataPointTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null): void {
      this.owner.onSetDataPointTrait(newDataPointTrait, oldDataPointTrait, this);
      this.owner.didSetDataPointTrait(newDataPointTrait, oldDataPointTrait, this);
    },
    controllerWillSetDataPointView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null): void {
      this.owner.willSetDataPointView(newDataPointView, oldDataPointView, this);
    },
    controllerDidSetDataPointView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null): void {
      this.owner.onSetDataPointView(newDataPointView, oldDataPointView, this);
      this.owner.didSetDataPointView(newDataPointView, oldDataPointView, this);
    },
    controllerWillSetDataPointX(newX: unknown | undefined, oldX: unknown | undefined): void {
      this.owner.willSetDataPointX(newX, oldX, this);
    },
    controllerDidSetDataPointX(newX: unknown | undefined, oldX: unknown | undefined): void {
      this.owner.onSetDataPointX(newX, oldX, this);
      this.owner.didSetDataPointX(newX, oldX, this);
    },
    controllerWillSetDataPointY(newY: unknown | undefined, oldY: unknown | undefined): void {
      this.owner.willSetDataPointY(newY, oldY, this);
    },
    controllerDidSetDataPointY(newY: unknown | undefined, oldY: unknown | undefined): void {
      this.owner.onSetDataPointY(newY, oldY, this);
      this.owner.didSetDataPointY(newY, oldY, this);
    },
    controllerWillSetDataPointY2(newY2: unknown | undefined, oldY2: unknown | undefined): void {
      this.owner.willSetDataPointY2(newY2, oldY2, this);
    },
    controllerDidSetDataPointY2(newY2: unknown | undefined, oldY2: unknown | undefined): void {
      this.owner.onSetDataPointY2(newY2, oldY2, this);
      this.owner.didSetDataPointY2(newY2, oldY2, this);
    },
    controllerWillSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.willSetDataPointRadius(newRadius, oldRadius, this);
    },
    controllerDidSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.onSetDataPointRadius(newRadius, oldRadius, this);
      this.owner.didSetDataPointRadius(newRadius, oldRadius, this);
    },
    controllerWillSetDataPointColor(newColor: Color | null, oldColor: Color | null): void {
      this.owner.willSetDataPointColor(newColor, oldColor, this);
    },
    controllerDidSetDataPointColor(newColor: Color | null, oldColor: Color | null): void {
      this.owner.onSetDataPointColor(newColor, oldColor, this);
      this.owner.didSetDataPointColor(newColor, oldColor, this);
    },
    controllerWillSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined): void {
      this.owner.willSetDataPointOpacity(newOpacity, oldOpacity, this);
    },
    controllerDidSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined): void {
      this.owner.onSetDataPointOpacity(newOpacity, oldOpacity, this);
      this.owner.didSetDataPointOpacity(newOpacity, oldOpacity, this);
    },
    controllertWillSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.willSetDataPointLabelView(newLabelView, oldLabelView, this);
    },
    controllerDidSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.onSetDataPointLabelView(newLabelView, oldLabelView, this);
      this.owner.didSetDataPointLabelView(newLabelView, oldLabelView, this);
    },
  });

  protected createDataPointFastener(dataPointController: DataPointController<X, Y>): ControllerFastener<this, DataPointController<X, Y>> {
    return new DataSetController.DataPointFastener(this as DataSetController<unknown, unknown>, dataPointController.key, "dataPoint") as ControllerFastener<this, DataPointController<X, Y>>;
  }

  /** @hidden */
  readonly dataPointFasteners: ReadonlyArray<ControllerFastener<this, DataPointController<X, Y>>>;

  protected getDataPointFastener(dataPointTrait: DataPointTrait<X, Y>): ControllerFastener<this, DataPointController<X, Y>> | null {
    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      const dataPointController = dataPointFastener.controller;
      if (dataPointController !== null && dataPointController.dataPoint.trait === dataPointTrait) {
        return dataPointFastener;
      }
    }
    return null;
  }

  /** @hidden */
  protected mountDataPointFasteners(): void {
    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      dataPointFastener.mount();
    }
  }

  /** @hidden */
  protected unmountDataPointFasteners(): void {
    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      dataPointFastener.unmount();
    }
  }

  protected detectDataPointController(controller: Controller): DataPointController<X, Y> | null {
    return controller instanceof DataPointController ? controller : null;
  }

  protected override onInsertChildController(childController: Controller, targetController: Controller | null): void {
    super.onInsertChildController(childController, targetController);
    const dataPointController = this.detectDataPointController(childController);
    if (dataPointController !== null) {
      this.insertDataPoint(dataPointController, targetController);
    }
  }

  protected override onRemoveChildController(childController: Controller): void {
    super.onRemoveChildController(childController);
    const dataPointController = this.detectDataPointController(childController);
    if (dataPointController !== null) {
      this.removeDataPoint(dataPointController);
    }
  }

  /** @hidden */
  protected override mountControllerFasteners(): void {
    super.mountControllerFasteners();
    this.mountDataPointFasteners();
  }

  /** @hidden */
  protected override unmountControllerFasteners(): void {
    this.unmountDataPointFasteners();
    super.unmountControllerFasteners();
  }
}
