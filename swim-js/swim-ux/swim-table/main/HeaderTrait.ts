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
import type {Instance} from "@swim/util";
import type {Creatable} from "@swim/util";
import type {Model} from "@swim/model";
import type {TraitObserver} from "@swim/model";
import {Trait} from "@swim/model";
import {TraitSet} from "@swim/model";
import {ColTrait} from "./ColTrait";

/** @public */
export interface HeaderTraitObserver<T extends HeaderTrait = HeaderTrait> extends TraitObserver<T> {
  traitWillAttachCol?(colTrait: ColTrait, targetTrait: Trait | null, trait: T): void;

  traitDidDetachCol?(colTrait: ColTrait, trait: T): void;
}

/** @public */
export class HeaderTrait extends Trait {
  declare readonly observerType?: Class<HeaderTraitObserver>;

  getCol<F extends Class<ColTrait>>(key: string, colTraitClass: F): InstanceType<F> | null;
  getCol(key: string): ColTrait | null;
  getCol(key: string, colTraitClass?: Class<ColTrait>): ColTrait | null {
    if (colTraitClass === void 0) {
      colTraitClass = ColTrait;
    }
    const colTrait = this.getTrait(key);
    return colTrait instanceof colTraitClass ? colTrait : null;
  }

  getOrCreateCol<F extends Class<Instance<F, ColTrait>> & Creatable<Instance<F, ColTrait>>>(key: string, colTraitClass: F): InstanceType<F> {
    let colTrait = this.getTrait(key, colTraitClass);
    if (colTrait === null) {
      colTrait = colTraitClass.create();
      this.setTrait(key, colTrait);
    }
    return colTrait!;
  }

  setCol(key: string, colTrait: ColTrait | null): void {
    this.setTrait(key, colTrait);
  }

  @TraitSet({
    traitType: ColTrait,
    binds: true,
    willAttachTrait(colTrait: ColTrait, targetTrait: Trait | null): void {
      this.owner.callObservers("traitWillAttachCol", colTrait, targetTrait, this.owner);
    },
    didAttachTrait(colTrait: ColTrait): void {
      if (this.owner.consuming) {
        colTrait.consume(this.owner);
      }
    },
    willDetachTrait(colTrait: ColTrait): void {
      if (this.owner.consuming) {
        colTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(colTrait: ColTrait): void {
      this.owner.callObservers("traitDidDetachCol", colTrait, this.owner);
    },
    detectModel(model: Model): ColTrait | null {
      return model.getTrait(ColTrait);
    },
  })
  readonly cols!: TraitSet<this, ColTrait>;

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.cols.consumeTraits(this);
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.cols.unconsumeTraits(this);
  }
}
