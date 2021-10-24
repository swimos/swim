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
import {Model, Trait, TraitSet} from "@swim/model";
import {DataPointTrait} from "./DataPointTrait";
import type {DataSetTraitObserver} from "./DataSetTraitObserver";

export class DataSetTrait<X = unknown, Y = unknown> extends Trait {
  override readonly observerType?: Class<DataSetTraitObserver<X, Y>>;

  @TraitSet<DataSetTrait<X, Y>, DataPointTrait<X, Y>>({
    type: DataPointTrait,
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
      return model.getTrait(DataPointTrait);
    },
  })
  readonly dataPoints!: TraitSet<this, DataPointTrait<X, Y>>;
  static readonly dataPoints: MemberFastenerClass<DataSetTrait, "dataPoints">;

  /** @internal */
  protected startConsumingDataPoints(): void {
    const dataPointTraits = this.dataPoints.traits;
    for (const traitId in dataPointTraits) {
      const dataPointTrait = dataPointTraits[traitId]!;
      dataPointTrait.consume(this);
    }
  }

  /** @internal */
  protected stopConsumingDataPoints(): void {
    const dataPointTraits = this.dataPoints.traits;
    for (const traitId in dataPointTraits) {
      const dataPointTrait = dataPointTraits[traitId]!;
      dataPointTrait.unconsume(this);
    }
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
