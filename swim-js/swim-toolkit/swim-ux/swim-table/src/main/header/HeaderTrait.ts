// Copyright 2015-2021 Swim.inc
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
import type {MemberFastenerClass} from "@swim/component";
import {Model, TraitConstructor, TraitClass, Trait, TraitSet} from "@swim/model";
import {ColTrait} from "../col/ColTrait";
import type {HeaderTraitObserver} from "./HeaderTraitObserver";

/** @public */
export class HeaderTrait extends Trait {
  override readonly observerType?: Class<HeaderTraitObserver>;

  getCol(key: string): ColTrait | null;
  getCol<R extends ColTrait>(key: string, colTraitClass: TraitClass<R>): R | null;
  getCol(key: string, colTraitClass?: TraitClass<ColTrait>): ColTrait | null {
    if (colTraitClass === void 0) {
      colTraitClass = ColTrait;
    }
    const colTrait = this.getTrait(key);
    return colTrait instanceof colTraitClass ? colTrait : null;
  }

  getOrCreateCol(key: string): ColTrait;
  getOrCreateCol<R extends ColTrait>(key: string, colTraitConstructor: TraitConstructor<R>): R;
  getOrCreateCol(key: string, colTraitConstructor?: TraitConstructor<ColTrait>): ColTrait {
    if (colTraitConstructor === void 0) {
      colTraitConstructor = ColTrait;
    }
    let colTrait = this.getTrait(key) as ColTrait | null;
    if (!(colTrait instanceof colTraitConstructor)) {
      colTrait = new colTraitConstructor();
      this.setTrait(key, colTrait);
    }
    return colTrait;
  }

  setCol(key: string, colTrait: ColTrait): void {
    this.setTrait(key, colTrait);
  }

  @TraitSet<HeaderTrait, ColTrait>({
    type: ColTrait,
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
  static readonly cols: MemberFastenerClass<HeaderTrait, "cols">;

  /** @internal */
  protected startConsumingCols(): void {
    const colTraits = this.cols.traits;
    for (const traitId in colTraits) {
      const colTrait = colTraits[traitId]!;
      colTrait.consume(this);
    }
  }

  /** @internal */
  protected stopConsumingCols(): void {
    const colTraits = this.cols.traits;
    for (const traitId in colTraits) {
      const colTrait = colTraits[traitId]!;
      colTrait.unconsume(this);
    }
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingCols();
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingCols();
  }
}
