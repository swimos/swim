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
import type {MemberFastenerClass} from "@swim/fastener";
import {TraitModelType, Trait, TraitRef} from "@swim/model";
import {DataSetTrait} from "../data/DataSetTrait";
import type {PlotTraitObserver} from "./PlotTraitObserver";

export class PlotTrait<X = unknown, Y = unknown> extends Trait {
  override readonly observerType?: Class<PlotTraitObserver<X, Y>>;

  @TraitRef<PlotTrait<X, Y>, DataSetTrait<X, Y>>({
    type: DataSetTrait,
    willAttachTrait(dataSetTrait: DataSetTrait<X, Y>, targetTrait: Trait | null): void {
      this.owner.callObservers("traitWillAttachDataSet", dataSetTrait, this.owner);
    },
    didAttachTrait(dataSetTrait: DataSetTrait<X, Y>): void {
      if (this.owner.consuming) {
        dataSetTrait.consume(this.owner);
      }
    },
    willDetachTrait(dataSetTrait: DataSetTrait<X, Y>): void {
      if (this.owner.consuming) {
        dataSetTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(dataSetTrait: DataSetTrait<X, Y>): void {
      this.owner.callObservers("traitDidDetachDataSet", dataSetTrait, this.owner);
    },
  })
  readonly dataSet!: TraitRef<this, DataSetTrait<X, Y>>;
  static readonly dataSet: MemberFastenerClass<PlotTrait, "dataSet">;

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

  protected override onAttachModel(model: TraitModelType<this>): void {
    super.onAttachModel(model);
    this.detectTraits(model);
  }

  /** @protected */
  override onInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    super.onInsertTrait(trait, targetTrait);
    if (this.dataSet.trait === null) {
      const dataSetTrait = this.detectDataSetTrait(trait);
      if (dataSetTrait !== null) {
        this.dataSet.setTrait(dataSetTrait, targetTrait);
      }
    }
  }

  /** @protected */
  override onRemoveTrait(trait: Trait): void {
    super.onRemoveTrait(trait);
    const dataSetTrait = this.detectDataSetTrait(trait);
    if (dataSetTrait !== null && this.dataSet.trait === dataSetTrait) {
      this.dataSet.setTrait(null);
    }
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    const dataSetTrait = this.dataSet.trait;
    if (dataSetTrait !== null) {
      dataSetTrait.consume(this);
    }
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    const dataSetTrait = this.dataSet.trait;
    if (dataSetTrait !== null) {
      dataSetTrait.unconsume(this);
    }
  }
}
