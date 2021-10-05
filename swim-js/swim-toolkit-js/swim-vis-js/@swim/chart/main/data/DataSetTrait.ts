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

import type {Class} from "@swim/util";
import {Model, TraitModelType, Trait, TraitFastener} from "@swim/model";
import {DataPointTrait} from "./DataPointTrait";
import type {DataSetTraitObserver} from "./DataSetTraitObserver";

export class DataSetTrait<X, Y> extends Trait {
  constructor() {
    super();
    this.dataPointFasteners = [];
  }

  override readonly observerType?: Class<DataSetTraitObserver<X, Y>>;

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
    if (this.mounted) {
      dataPointFastener.mount();
    }
  }

  removeDataPoint(dataPointTrait: DataPointTrait<X, Y>): void {
    const dataPointFasteners = this.dataPointFasteners as TraitFastener<this, DataPointTrait<X, Y>>[];
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      if (dataPointFastener.trait === dataPointTrait) {
        dataPointFastener.setTrait(null);
        if (this.mounted) {
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
    if (this.consuming) {
      dataPointTrait.consume(this);
    }
  }

  protected detachDataPoint(dataPointTrait: DataPointTrait<X, Y>, dataPointFastener: TraitFastener<this, DataPointTrait<X, Y>>): void {
    if (this.consuming) {
      dataPointTrait.unconsume(this);
    }
  }

  protected willSetDataPoint(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null,
                             targetTrait: Trait | null, dataPointFastener: TraitFastener<this, DataPointTrait<X, Y>>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetDataPoint !== void 0) {
        traitObserver.traitDidSetDataPoint(newDataPointTrait, oldDataPointTrait, targetTrait, this);
      }
    }
  }

  /** @internal */
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
    return DataSetTrait.DataPointFastener.create(this, dataPointTrait.key ?? "dataPoint") as TraitFastener<this, DataPointTrait<X, Y>>;
  }

  /** @internal */
  readonly dataPointFasteners: ReadonlyArray<TraitFastener<this, DataPointTrait<X, Y>>>;

  /** @internal */
  protected mountDataPointFasteners(): void {
    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      dataPointFastener.mount();
    }
  }

  /** @internal */
  protected unmountDataPointFasteners(): void {
    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      dataPointFastener.unmount();
    }
  }

  /** @internal */
  protected startConsumingDataPoints(): void {
    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointTrait = dataPointFasteners[i]!.trait;
      if (dataPointTrait !== null) {
        dataPointTrait.consume(this);
      }
    }
  }

  /** @internal */
  protected stopConsumingDataPoints(): void {
    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointTrait = dataPointFasteners[i]!.trait;
      if (dataPointTrait !== null) {
        dataPointTrait.unconsume(this);
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
    const children = model.children;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const child = children[i]!;
      const dataPointTrait = this.detectDataPointModel(child);
      if (dataPointTrait !== null) {
        this.insertDataPoint(dataPointTrait);
      }
    }
  }

  protected override didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    if (newModel !== null) {
      this.detectModels(newModel);
    }
    super.didSetModel(newModel, oldModel);
  }

  /** @protected */
  override onInsertChild(child: Model, target: Model | null): void {
    super.onInsertChild(child, target);
    const dataPointTrait = this.detectDataPointModel(child);
    if (dataPointTrait !== null) {
      const targetTrait = target !== null ? this.detectDataPointModel(target) : null;
      this.onInsertDataPoint(dataPointTrait, targetTrait);
    }
  }

  /** @protected */
  override onRemoveChild(child: Model): void {
    super.onRemoveChild(child);
    const dataPointTrait = this.detectDataPointModel(child);
    if (dataPointTrait !== null) {
      this.onRemoveDataPoint(dataPointTrait);
    }
  }

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountDataPointFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountDataPointFasteners();
    super.unmountFasteners();
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingDataPoints();
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingDataPoints();
  }
}
