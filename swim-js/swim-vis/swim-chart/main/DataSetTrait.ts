// Copyright 2015-2023 Nstream, inc.
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
import {TraitSet} from "@swim/model";
import {DataPointTrait} from "./DataPointTrait";

/** @public */
export interface DataSetTraitObserver<X = unknown, Y = unknown, T extends DataSetTrait<X, Y> = DataSetTrait<X, Y>> extends TraitObserver<T> {
  traitWillAttachDataPoint?(dataPointTrait: DataPointTrait<X, Y>, targetTrait: Trait | null, trait: T): void;

  traitDidDetachDataPoint?(dataPointTrait: DataPointTrait<X, Y>, trait: T): void;
}

/** @public */
export class DataSetTrait<X = unknown, Y = unknown> extends Trait {
  declare readonly observerType?: Class<DataSetTraitObserver<X, Y>>;

  @TraitSet({
    traitType: DataPointTrait,
    binds: true,
    willAttachTrait(dataPointTrait: DataPointTrait<X, Y>, targetTrait: Trait | null): void {
      this.owner.callObservers("traitWillAttachDataPoint", dataPointTrait, targetTrait, this.owner);
    },
    didAttachTrait(dataPointTrait: DataPointTrait<X, Y>): void {
      if (this.owner.consuming) {
        dataPointTrait.consume(this.owner);
      }
    },
    willDetachTrait(dataPointTrait: DataPointTrait<X, Y>): void {
      if (this.owner.consuming) {
        dataPointTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(dataPointTrait: DataPointTrait<X, Y>): void {
      this.owner.callObservers("traitDidDetachDataPoint", dataPointTrait, this.owner);
    },
    detectModel(model: Model): DataPointTrait<X, Y> | null {
      return model.getTrait(DataPointTrait) as DataPointTrait<X, Y>;
    },
  })
  readonly dataPoints!: TraitSet<this, DataPointTrait<X, Y>>;

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.dataPoints.consumeTraits(this);
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.dataPoints.unconsumeTraits(this);
  }
}
