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

import {TraitModelType, Trait, TraitFastener, GenericTrait} from "@swim/model";
import {DataSetTrait} from "../data/DataSetTrait";
import type {PlotTraitObserver} from "./PlotTraitObserver";

export class PlotTrait<X, Y> extends GenericTrait {
  declare readonly traitObservers: ReadonlyArray<PlotTraitObserver<X, Y>>;

  protected initDataSet(dataSetTrait: DataSetTrait<X, Y>): void {
    // hook
  }

  protected attachDataSet(dataSetTrait: DataSetTrait<X, Y>): void {
    if (this.isConsuming()) {
      dataSetTrait.addTraitConsumer(this);
    }
  }

  protected detachDataSet(dataSetTrait: DataSetTrait<X, Y>): void {
    if (this.isConsuming()) {
      dataSetTrait.removeTraitConsumer(this);
    }
  }

  protected willSetDataSet(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, targetTrait: Trait | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.plotTraitWillSetDataSet !== void 0) {
        traitObserver.plotTraitWillSetDataSet(newDataSetTrait, oldDataSetTrait, targetTrait, this);
      }
    }
  }

  protected onSetDataSet(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, targetTrait: Trait | null): void {
    if (oldDataSetTrait !== null) {
      this.detachDataSet(oldDataSetTrait);
    }
    if (newDataSetTrait !== null) {
      this.attachDataSet(newDataSetTrait);
      this.initDataSet(newDataSetTrait);
    }
  }

  protected didSetDataSet(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, targetTrait: Trait | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.plotTraitDidSetDataSet !== void 0) {
        traitObserver.plotTraitDidSetDataSet(newDataSetTrait, oldDataSetTrait, targetTrait, this);
      }
    }
  }

  @TraitFastener<PlotTrait<X, Y>, DataSetTrait<X, Y>>({
    type: DataSetTrait,
    sibling: false,
    willSetTrait(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, targetTrait: Trait | null): void {
      this.owner.willSetDataSet(newDataSetTrait, oldDataSetTrait, targetTrait);
    },
    onSetTrait(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, targetTrait: Trait | null): void {
      this.owner.onSetDataSet(newDataSetTrait, oldDataSetTrait, targetTrait);
    },
    didSetTrait(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, targetTrait: Trait | null): void {
      this.owner.didSetDataSet(newDataSetTrait, oldDataSetTrait, targetTrait);
    },
  })
  declare dataSet: TraitFastener<this, DataSetTrait<X, Y>>;

  protected detectDataSetTrait(trait: Trait): DataSetTrait<X, Y> | null {
    return trait instanceof DataSetTrait ? trait : null;
  }

  protected detectTraits(model: TraitModelType<this>): void {
    if (this.dataSet.trait === null) {
      const traits = model.traits;
      for (let i = 0, n = traits.length; i < n; i += 1) {
        const trait = traits[i]!;
        const dataSetTrait = this.detectDataSetTrait(trait);
        if (dataSetTrait !== null) {
          this.dataSet.setTrait(dataSetTrait);
        }
      }
    }
  }

  protected didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    if (newModel !== null) {
      this.detectTraits(newModel);
    }
    super.didSetModel(newModel, oldModel);
  }

  protected onInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    super.onInsertTrait(trait, targetTrait);
    if (this.dataSet.trait === null) {
      const dataSetTrait = this.detectDataSetTrait(trait);
      if (dataSetTrait !== null) {
        this.dataSet.setTrait(dataSetTrait, targetTrait);
      }
    }
  }

  protected onRemoveTrait(trait: Trait): void {
    super.onRemoveTrait(trait);
    const dataSetTrait = this.detectDataSetTrait(trait);
    if (dataSetTrait !== null && this.dataSet.trait === dataSetTrait) {
      this.dataSet.setTrait(null);
    }
  }

  protected onStartConsuming(): void {
    super.onStartConsuming();
    const dataSetTrait = this.dataSet.trait;
    if (dataSetTrait !== null) {
      dataSetTrait.addTraitConsumer(this);
    }
  }

  protected onStopConsuming(): void {
    super.onStopConsuming();
    const dataSetTrait = this.dataSet.trait;
    if (dataSetTrait !== null) {
      dataSetTrait.removeTraitConsumer(this);
    }
  }
}
