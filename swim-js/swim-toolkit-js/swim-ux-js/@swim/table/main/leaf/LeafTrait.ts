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
import {Model, TraitConstructor, Trait, TraitSet} from "@swim/model";
import {CellTrait} from "../cell/CellTrait";
import type {LeafTraitObserver} from "./LeafTraitObserver";

export class LeafTrait extends Trait {
  override readonly observerType?: Class<LeafTraitObserver>;

  getCell(key: string): CellTrait | null;
  getCell<R extends CellTrait>(key: string, cellTraitClass: Class<R>): R | null;
  getCell(key: string, cellTraitClass?: Class<CellTrait>): CellTrait | null {
    if (cellTraitClass === void 0) {
      cellTraitClass = CellTrait;
    }
    const cellTrait = this.getTrait(key);
    return cellTrait instanceof cellTraitClass ? cellTrait : null;
  }

  getOrCreateCell<R extends CellTrait>(key: string, cellTraitConstructor: TraitConstructor<R>): R {
    let cellTrait = this.getTrait(key) as R | null;
    if (!(cellTrait instanceof cellTraitConstructor)) {
      cellTrait = new cellTraitConstructor();
      this.setTrait(key, cellTrait);
    }
    return cellTrait;
  }

  setCell(key: string, cellTrait: CellTrait): void {
    this.setTrait(key, cellTrait);
  }

  @TraitSet<LeafTrait, CellTrait>({
    type: CellTrait,
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
  static readonly cells: MemberFastenerClass<LeafTrait, "cells">;

  /** @internal */
  protected startConsumingCells(): void {
    const cellTraits = this.cells.traits;
    for (const traitId in cellTraits) {
      const cellTrait = cellTraits[traitId]!;
      cellTrait.consume(this);
    }
  }

  /** @internal */
  protected stopConsumingCells(): void {
    const cellTraits = this.cells.traits;
    for (const traitId in cellTraits) {
      const cellTrait = cellTraits[traitId]!;
      cellTrait.unconsume(this);
    }
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingCells();
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingCells();
  }
}
