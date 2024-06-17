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
import type {Instance} from "@swim/util";
import type {Creatable} from "@swim/util";
import {Property} from "@swim/component";
import type {Model} from "@swim/model";
import type {TraitObserver} from "@swim/model";
import {Trait} from "@swim/model";
import {TraitSet} from "@swim/model";
import {Hyperlink} from "@swim/controller";
import {CellTrait} from "./CellTrait";

/** @public */
export interface LeafTraitObserver<T extends LeafTrait = LeafTrait> extends TraitObserver<T> {
  traitWillAttachCell?(cellTrait: CellTrait, targetTrait: Trait | null, trait: T): void;

  traitDidDetachCell?(cellTrait: CellTrait, trait: T): void;
}

/** @public */
export class LeafTrait extends Trait {
  declare readonly observerType?: Class<LeafTraitObserver>;

  @Property({valueType: Hyperlink, value: null})
  get hyperlink(): Property<this, Hyperlink | null> {
    return Property.getter();
  }

  getCell<F extends Class<CellTrait>>(key: string, cellTraitClass: F): InstanceType<F> | null;
  getCell(key: string): CellTrait | null;
  getCell(key: string, cellTraitClass?: Class<CellTrait>): CellTrait | null {
    if (cellTraitClass === void 0) {
      cellTraitClass = CellTrait;
    }
    const cellTrait = this.getTrait(key);
    return cellTrait instanceof cellTraitClass ? cellTrait : null;
  }

  getOrCreateCell<F extends Class<Instance<F, CellTrait>> & Creatable<Instance<F, CellTrait>>>(key: string, cellTraitClass: F): InstanceType<F> {
    let cellTrait = this.getTrait(key, cellTraitClass);
    if (cellTrait === null) {
      cellTrait = cellTraitClass.create();
      this.setTrait(key, cellTrait);
    }
    return cellTrait!;
  }

  setCell(key: string, cellTrait: CellTrait | null): void {
    this.setTrait(key, cellTrait);
  }

  @TraitSet({
    traitType: CellTrait,
    binds: true,
    willAttachTrait(cellTrait: CellTrait, targetTrait: Trait | null): void {
      this.owner.callObservers("traitWillAttachCell", cellTrait, targetTrait, this.owner);
    },
    didAttachTrait(cellTrait: CellTrait, targetTrait: Trait | null): void {
      if (this.owner.consuming) {
        cellTrait.consume(this.owner);
      }
    },
    willDetachTrait(cellTrait: CellTrait): void {
      if (this.owner.consuming) {
        cellTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(cellTrait: CellTrait): void {
      this.owner.callObservers("traitDidDetachCell", cellTrait, this.owner);
    },
    detectModel(model: Model): CellTrait | null {
      return model.getTrait(CellTrait);
    },
  })
  readonly cells!: TraitSet<this, CellTrait>;

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.cells.consumeTraits(this);
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.cells.unconsumeTraits(this);
  }
}
