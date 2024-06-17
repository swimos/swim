// Copyright 2015-2024 Nstream, inc.
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
import type {Model} from "@swim/model";
import type {TraitObserver} from "@swim/model";
import {Trait} from "@swim/model";
import {TraitRef} from "@swim/model";
import {DataSetTrait} from "./DataSetTrait";
import type {PlotController} from "./PlotController";

/** @public */
export interface PlotTraitObserver<X = unknown, Y = unknown, T extends PlotTrait<X, Y> = PlotTrait<X, Y>> extends TraitObserver<T> {
  traitWillAttachDataSet?(dataSetTrait: DataSetTrait<X, Y>, trait: T): void;

  traitDidDetachDataSet?(dataSetTrait: DataSetTrait<X, Y>, trait: T): void;
}

/** @public */
export abstract class PlotTrait<X = unknown, Y = unknown> extends Trait {
  declare readonly observerType?: Class<PlotTraitObserver<X, Y>>;

  @TraitRef({
    traitType: DataSetTrait,
    binds: true,
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
    detectModel(model: Model): DataSetTrait<X, Y> | null {
      return null;
    },
    detectTrait(trait: Trait): DataSetTrait<X, Y> | null {
      return trait instanceof DataSetTrait ? trait : null;
    },
  })
  readonly dataSet!: TraitRef<this, DataSetTrait<X, Y>>;

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

  abstract createPlotController(): PlotController<X, Y>;
}
