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

import {
  Model,
  TraitModelType,
  TraitConstructor,
  TraitClass,
  Trait,
  TraitFastener,
  GenericTrait,
} from "@swim/model";
import {CellTrait} from "../cell/CellTrait";
import type {LeafTraitObserver} from "./LeafTraitObserver";

export class LeafTrait extends GenericTrait {
  constructor() {
    super();
    Object.defineProperty(this, "cellFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly traitObservers!: ReadonlyArray<LeafTraitObserver>;

  getCell(key: string): CellTrait | null;
  getCell<R extends CellTrait>(key: string, cellTraitClass: TraitClass<R>): R | null;
  getCell(key: string, cellTraitClass?: TraitClass<CellTrait>): CellTrait | null {
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

  insertCell(cellTrait: CellTrait, targetTrait: Trait | null = null): void {
    const cellFasteners = this.cellFasteners as TraitFastener<this, CellTrait>[];
    let targetIndex = cellFasteners.length;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      if (cellFastener.trait === cellTrait) {
        return;
      } else if (cellFastener.trait === targetTrait) {
        targetIndex = i;
      }
    }
    const cellFastener = this.createCellFastener(cellTrait);
    cellFasteners.splice(targetIndex, 0, cellFastener);
    cellFastener.setTrait(cellTrait, targetTrait);
    if (this.isMounted()) {
      cellFastener.mount();
    }
  }

  removeCell(cellTrait: CellTrait): void {
    const cellFasteners = this.cellFasteners as TraitFastener<this, CellTrait>[];
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      if (cellFastener.trait === cellTrait) {
        cellFastener.setTrait(null);
        if (this.isMounted()) {
          cellFastener.unmount();
        }
        cellFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initCell(cellTrait: CellTrait, cellFastener: TraitFastener<this, CellTrait>): void {
    // hook
  }

  protected attachCell(cellTrait: CellTrait, cellFastener: TraitFastener<this, CellTrait>): void {
    if (this.isConsuming()) {
      cellTrait.addTraitConsumer(this);
    }
  }

  protected detachCell(cellTrait: CellTrait, cellFastener: TraitFastener<this, CellTrait>): void {
    if (this.isConsuming()) {
      cellTrait.removeTraitConsumer(this);
    }
  }

  protected willSetCell(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                        targetTrait: Trait | null, cellFastener: TraitFastener<this, CellTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetCell !== void 0) {
        traitObserver.traitWillSetCell(newCellTrait, oldCellTrait, targetTrait, this);
      }
    }
  }

  protected onSetCell(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                      targetTrait: Trait | null, cellFastener: TraitFastener<this, CellTrait>): void {
    if (oldCellTrait !== null) {
      this.detachCell(oldCellTrait, cellFastener);
    }
    if (newCellTrait !== null) {
      this.attachCell(newCellTrait, cellFastener);
      this.initCell(newCellTrait, cellFastener);
    }
  }

  protected didSetCell(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                       targetTrait: Trait | null, cellFastener: TraitFastener<this, CellTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetCell !== void 0) {
        traitObserver.traitDidSetCell(newCellTrait, oldCellTrait, targetTrait, this);
      }
    }
  }

  /** @hidden */
  static CellFastener = TraitFastener.define<LeafTrait, CellTrait>({
    type: CellTrait,
    sibling: false,
    willSetTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, targetTrait: Trait | null): void {
      this.owner.willSetCell(newCellTrait, oldCellTrait, targetTrait, this);
    },
    onSetTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, targetTrait: Trait | null): void {
      this.owner.onSetCell(newCellTrait, oldCellTrait, targetTrait, this);
    },
    didSetTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, targetTrait: Trait | null): void {
      this.owner.didSetCell(newCellTrait, oldCellTrait, targetTrait, this);
    },
  });

  protected createCellFastener(cellTrait: CellTrait): TraitFastener<this, CellTrait> {
    return new LeafTrait.CellFastener(this, cellTrait.key, "cell");
  }

  /** @hidden */
  readonly cellFasteners!: ReadonlyArray<TraitFastener<this, CellTrait>>;

  /** @hidden */
  protected mountCellFasteners(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      cellFastener.mount();
    }
  }

  /** @hidden */
  protected unmountCellFasteners(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      cellFastener.unmount();
    }
  }

  /** @hidden */
  protected startConsumingCells(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellTrait = cellFasteners[i]!.trait;
      if (cellTrait !== null) {
        cellTrait.addTraitConsumer(this);
      }
    }
  }

  /** @hidden */
  protected stopConsumingCells(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellTrait = cellFasteners[i]!.trait;
      if (cellTrait !== null) {
        cellTrait.removeTraitConsumer(this);
      }
    }
  }

  protected detectCellModel(model: Model): CellTrait | null {
    return model.getTrait(CellTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const childModels = model.childModels;
    for (let i = 0, n = childModels.length; i < n; i += 1) {
      const childModel = childModels[i]!;
      const cellTrait = this.detectCellModel(childModel);
      if (cellTrait !== null) {
        this.insertCell(cellTrait);
      }
    }
  }

  protected detectCellTrait(trait: Trait): CellTrait | null {
    return trait instanceof CellTrait ? trait : null;
  }

  protected detectTraits(model: TraitModelType<this>): void {
    const traits = model.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      const trait = traits[i]!;
      const cellTrait = this.detectCellTrait(trait);
      if (cellTrait !== null) {
        this.insertCell(cellTrait);
      }
    }
  }

  protected override didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    if (newModel !== null) {
      this.detectTraits(newModel);
      this.detectModels(newModel);
    }
    super.didSetModel(newModel, oldModel);
  }

  protected override onInsertChildModel(childModel: Model, targetModel: Model | null): void {
    super.onInsertChildModel(childModel, targetModel);
    const cellTrait = this.detectCellModel(childModel);
    if (cellTrait !== null) {
      const targetTrait = targetModel !== null ? this.detectCellModel(targetModel) : null;
      this.insertCell(cellTrait, targetTrait);
    }
  }

  protected override onRemoveChildModel(childModel: Model): void {
    super.onRemoveChildModel(childModel);
    const cellTrait = this.detectCellModel(childModel);
    if (cellTrait !== null) {
      this.removeCell(cellTrait);
    }
  }

  protected override onInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    super.onInsertTrait(trait, targetTrait);
    const cellTrait = this.detectCellTrait(trait);
    if (cellTrait !== null) {
      this.insertCell(cellTrait, targetTrait);
    }
  }

  protected override onRemoveTrait(trait: Trait): void {
    super.onRemoveTrait(trait);
    const cellTrait = this.detectCellTrait(trait);
    if (cellTrait !== null) {
      this.removeCell(cellTrait);
    }
  }

  /** @hidden */
  protected override mountTraitFasteners(): void {
    super.mountTraitFasteners();
    this.mountCellFasteners();
  }

  /** @hidden */
  protected override unmountTraitFasteners(): void {
    this.unmountCellFasteners();
    super.unmountTraitFasteners();
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
