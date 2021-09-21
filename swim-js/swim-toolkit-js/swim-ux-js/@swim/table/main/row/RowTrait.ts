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

import {TraitModelType, Trait, TraitFastener} from "@swim/model";
import {LeafTrait} from "../leaf/LeafTrait";
import type {RowTraitObserver} from "./RowTraitObserver";
import {TableTrait} from "../"; // forward import

export class RowTrait extends LeafTrait {
  override readonly traitObservers!: ReadonlyArray<RowTraitObserver>;

  protected initTree(treeTrait: TableTrait): void {
    // hook
  }

  protected attachTree(treeTrait: TableTrait): void {
    // hook
  }

  protected detachTree(treeTrait: TableTrait): void {
    // hook
  }

  protected willSetTree(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null, targetTrait: Trait | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetTree !== void 0) {
        traitObserver.traitWillSetTree(newTreeTrait, oldTreeTrait, targetTrait, this);
      }
    }
  }

  protected onSetTree(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null, targetTrait: Trait | null): void {
    if (oldTreeTrait !== null) {
      this.detachTree(oldTreeTrait);
    }
    if (newTreeTrait !== null) {
      this.attachTree(newTreeTrait);
      this.initTree(newTreeTrait);
    }
  }

  protected didSetTree(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null, targetTrait: Trait | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetTree !== void 0) {
        traitObserver.traitDidSetTree(newTreeTrait, oldTreeTrait, targetTrait, this);
      }
    }
  }

  @TraitFastener<RowTrait, TableTrait>({
    // avoid cyclic reference to type: TableTrait
    sibling: false,
    willSetTrait(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null, targetTrait: Trait | null): void {
      this.owner.willSetTree(newTreeTrait, oldTreeTrait, targetTrait);
    },
    onSetTrait(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null, targetTrait: Trait | null): void {
      this.owner.onSetTree(newTreeTrait, oldTreeTrait, targetTrait);
    },
    didSetTrait(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null, targetTrait: Trait | null): void {
      this.owner.didSetTree(newTreeTrait, oldTreeTrait, targetTrait);
    },
  })
  readonly tree!: TraitFastener<this, TableTrait>;

  protected detectTreeTrait(trait: Trait): TableTrait | null {
    return trait instanceof TableTrait ? trait : null;
  }

  protected override detectTraits(model: TraitModelType<this>): void {
    const traits = model.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      const trait = traits[i]!;
      const cellTrait = this.detectCellTrait(trait);
      if (cellTrait !== null) {
        this.insertCell(cellTrait);
      }
      if (this.tree.trait === null) {
        const treeTrait = this.detectTreeTrait(trait);
        if (treeTrait !== null) {
          this.tree.setTrait(treeTrait);
        }
      }
    }
  }

  protected override onInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    super.onInsertTrait(trait, targetTrait);
    if (this.tree.trait === null) {
      const treeTrait = this.detectTreeTrait(trait);
      if (treeTrait !== null) {
        this.tree.setTrait(treeTrait, targetTrait);
      }
    }
  }

  protected override onRemoveTrait(trait: Trait): void {
    super.onRemoveTrait(trait);
    const treeTrait = this.detectTreeTrait(trait);
    if (treeTrait !== null && this.tree.trait === treeTrait) {
      this.tree.setTrait(null);
    }
  }
}
