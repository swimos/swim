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

import {Model, TraitModelType, Trait, TraitFastener, GenericTrait} from "@swim/model";
import {DataPointTrait} from "./DataPointTrait";
import type {DataSetTraitObserver} from "./DataSetTraitObserver";

export class DataSetTrait<X, Y> extends GenericTrait {
  constructor() {
    super();
    Object.defineProperty(this, "dataPointFasteners", {
      value: [],
      enumerable: true,
    });
  }

  declare readonly traitObservers: ReadonlyArray<DataSetTraitObserver<X, Y>>;

  insertDataPoint(dataPointTrait: DataPointTrait<X, Y>, targetTrait: Trait | null = null): void {
    const dataPointFasteners = this.dataPointFasteners as TraitFastener<this, DataPointTrait<X, Y>>[];
    let targetIndex = dataPointFasteners.length;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      if (dataPointFastener.trait === dataPointTrait) {
        return;
      } else if (dataPointFastener.trait === targetTrait) {
        targetIndex = i;
      }
    }
    const dataPointFastener = this.createDataPointFastener(dataPointTrait);
    dataPointFasteners.splice(targetIndex, 0, dataPointFastener);
    dataPointFastener.setTrait(dataPointTrait, targetTrait);
    if (this.isMounted()) {
      dataPointFastener.mount();
    }
  }

  removeDataPoint(dataPointTrait: DataPointTrait<X, Y>): void {
    const dataPointFasteners = this.dataPointFasteners as TraitFastener<this, DataPointTrait<X, Y>>[];
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      if (dataPointFastener.trait === dataPointTrait) {
        dataPointFastener.setTrait(null);
        if (this.isMounted()) {
          dataPointFastener.unmount();
        }
        dataPointFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initDataPoint(dataPointTrait: DataPointTrait<X, Y>, dataPointFastener: TraitFastener<this, DataPointTrait<X, Y>>): void {
    // hook
  }

  protected attachDataPoint(dataPointTrait: DataPointTrait<X, Y>, dataPointFastener: TraitFastener<this, DataPointTrait<X, Y>>): void {
    if (this.isConsuming()) {
      dataPointTrait.addTraitConsumer(this);
    }
  }

  protected detachDataPoint(dataPointTrait: DataPointTrait<X, Y>, dataPointFastener: TraitFastener<this, DataPointTrait<X, Y>>): void {
    if (this.isConsuming()) {
      dataPointTrait.removeTraitConsumer(this);
    }
  }

  protected willSetDataPoint(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null,
                             targetTrait: Trait | null, dataPointFastener: TraitFastener<this, DataPointTrait<X, Y>>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetDataPoint !== void 0) {
        traitObserver.traitWillSetDataPoint(newDataPointTrait, oldDataPointTrait, targetTrait, this);
      }
    }
  }

  protected onSetDataPoint(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null,
                           targetTrait: Trait | null, dataPointFastener: TraitFastener<this, DataPointTrait<X, Y>>): void {
    if (oldDataPointTrait !== null) {
      this.detachDataPoint(oldDataPointTrait, dataPointFastener);
    }
    if (newDataPointTrait !== null) {
      this.attachDataPoint(newDataPointTrait, dataPointFastener);
      this.initDataPoint(newDataPointTrait, dataPointFastener);
    }
  }

  protected didSetDataPoint(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null,
                            targetTrait: Trait | null, dataPointFastener: TraitFastener<this, DataPointTrait<X, Y>>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetDataPoint !== void 0) {
        traitObserver.traitDidSetDataPoint(newDataPointTrait, oldDataPointTrait, targetTrait, this);
      }
    }
  }

  /** @hidden */
  static DataPointFastener = TraitFastener.define<DataSetTrait<unknown, unknown>, DataPointTrait<unknown, unknown>>({
    type: DataPointTrait,
    sibling: false,
    willSetTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null, targetTrait: Trait | null): void {
      this.owner.willSetDataPoint(newDataPointTrait, oldDataPointTrait, targetTrait, this);
    },
    onSetTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null, targetTrait: Trait | null): void {
      this.owner.onSetDataPoint(newDataPointTrait, oldDataPointTrait, targetTrait, this);
    },
    didSetTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null, targetTrait: Trait | null): void {
      this.owner.didSetDataPoint(newDataPointTrait, oldDataPointTrait, targetTrait, this);
    },
  });

  protected createDataPointFastener(dataPointTrait: DataPointTrait<X, Y>): TraitFastener<this, DataPointTrait<X, Y>> {
    return new DataSetTrait.DataPointFastener(this as DataSetTrait<unknown, unknown>, dataPointTrait.key, "dataPoint") as TraitFastener<this, DataPointTrait<X, Y>>;
  }

  /** @hidden */
  declare readonly dataPointFasteners: ReadonlyArray<TraitFastener<this, DataPointTrait<X, Y>>>;

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

  /** @hidden */
  protected startConsumingDataPoints(): void {
    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointTrait = dataPointFasteners[i]!.trait;
      if (dataPointTrait !== null) {
        dataPointTrait.addTraitConsumer(this);
      }
    }
  }

  /** @hidden */
  protected stopConsumingDataPoints(): void {
    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointTrait = dataPointFasteners[i]!.trait;
      if (dataPointTrait !== null) {
        dataPointTrait.removeTraitConsumer(this);
      }
    }
  }

  protected onInsertDataPoint(dataPointTrait: DataPointTrait<X, Y>, targetTrait: Trait | null): void {
    this.insertDataPoint(dataPointTrait, targetTrait);
  }

  protected onRemoveDataPoint(dataPointTrait: DataPointTrait<X, Y>): void {
    this.removeDataPoint(dataPointTrait);
  }

  protected detectDataPointModel(model: Model): DataPointTrait<X, Y> | null {
    return model.getTrait(DataPointTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const childModels = model.childModels;
    for (let i = 0, n = childModels.length; i < n; i += 1) {
      const childModel = childModels[i]!;
      const dataPointTrait = this.detectDataPointModel(childModel);
      if (dataPointTrait !== null) {
        this.insertDataPoint(dataPointTrait);
      }
    }
  }

  protected didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    if (newModel !== null) {
      this.detectModels(newModel);
    }
    super.didSetModel(newModel, oldModel);
  }

  protected onInsertChildModel(childModel: Model, targetModel: Model | null): void {
    super.onInsertChildModel(childModel, targetModel);
    const dataPointTrait = this.detectDataPointModel(childModel);
    if (dataPointTrait !== null) {
      const targetTrait = targetModel !== null ? this.detectDataPointModel(targetModel) : null;
      this.onInsertDataPoint(dataPointTrait, targetTrait);
    }
  }

  protected onRemoveChildModel(childModel: Model): void {
    super.onRemoveChildModel(childModel);
    const dataPointTrait = this.detectDataPointModel(childModel);
    if (dataPointTrait !== null) {
      this.onRemoveDataPoint(dataPointTrait);
    }
  }

  /** @hidden */
  protected mountTraitFasteners(): void {
    super.mountTraitFasteners();
    this.mountDataPointFasteners();
  }

  /** @hidden */
  protected unmountTraitFasteners(): void {
    this.unmountDataPointFasteners();
    super.unmountTraitFasteners();
  }

  protected onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingDataPoints();
  }

  protected onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingDataPoints();
  }
}
