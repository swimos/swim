// Copyright 2015-2022 Swim.inc
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
import {Model, TraitCreator, Trait, TraitSet} from "@swim/model";
import {CellTrait} from "../cell/CellTrait";
import type {LeafTraitObserver} from "./LeafTraitObserver";

/** @public */
export class LeafTrait extends Trait {
  override readonly observerType?: Class<LeafTraitObserver>;

  getCell<F extends abstract new (...args: any) => CellTrait>(key: string, cellTraitClass: F): InstanceType<F> | null;
  getCell(key: string): CellTrait | null;
  getCell(key: string, cellTraitClass?: abstract new (...args: any) => CellTrait): CellTrait | null {
    if (cellTraitClass === void 0) {
      cellTraitClass = CellTrait;
    }
    const cellTrait = this.getTrait(key);
    return cellTrait instanceof cellTraitClass ? cellTrait : null;
  }

  getOrCreateCell<F extends TraitCreator<F, CellTrait>>(key: string, cellTraitClass: F): InstanceType<F> {
    let cellTrait = this.getTrait(key, cellTraitClass);
    if (cellTrait === null) {
      cellTrait = cellTraitClass.create();
      this.setTrait(key, cellTrait);
    }
    return cellTrait!;
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
