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
import {
  Model,
  TraitModelType,
  TraitConstructor,
  TraitClass,
  Trait,
  TraitFastener,
} from "@swim/model";
import {CellTrait} from "../cell/CellTrait";
import type {LeafTraitObserver} from "./LeafTraitObserver";

export class LeafTrait extends Trait {
  constructor() {
    super();
    this.cellFasteners = [];
  }

  override readonly observerType?: Class<LeafTraitObserver>;

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
    if (this.mounted) {
      cellFastener.mount();
    }
  }

  removeCell(cellTrait: CellTrait): void {
    const cellFasteners = this.cellFasteners as TraitFastener<this, CellTrait>[];
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      if (cellFastener.trait === cellTrait) {
        cellFastener.setTrait(null);
        if (this.mounted) {
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
    if (this.consuming) {
      cellTrait.consume(this);
    }
  }

  protected detachCell(cellTrait: CellTrait, cellFastener: TraitFastener<this, CellTrait>): void {
    if (this.consuming) {
      cellTrait.unconsume(this);
    }
  }

  protected willSetCell(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                        targetTrait: Trait | null, cellFastener: TraitFastener<this, CellTrait>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetCell !== void 0) {
        traitObserver.traitDidSetCell(newCellTrait, oldCellTrait, targetTrait, this);
      }
    }
  }

  /** @internal */
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
    return LeafTrait.CellFastener.create(this, cellTrait.key ?? "cell");
  }

  /** @internal */
  readonly cellFasteners: ReadonlyArray<TraitFastener<this, CellTrait>>;

  /** @internal */
  protected mountCellFasteners(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      cellFastener.mount();
    }
  }

  /** @internal */
  protected unmountCellFasteners(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      cellFastener.unmount();
    }
  }

  /** @internal */
  protected startConsumingCells(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellTrait = cellFasteners[i]!.trait;
      if (cellTrait !== null) {
        cellTrait.consume(this);
      }
    }
  }

  /** @internal */
  protected stopConsumingCells(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellTrait = cellFasteners[i]!.trait;
      if (cellTrait !== null) {
        cellTrait.unconsume(this);
      }
    }
  }

  protected detectCellModel(model: Model): CellTrait | null {
    return model.getTrait(CellTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const children = model.children;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const child = children[i]!;
      const cellTrait = this.detectCellModel(child);
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

  /** @protected */
  override onInsertChild(child: Model, target: Model | null): void {
    super.onInsertChild(child, target);
    const cellTrait = this.detectCellModel(child);
    if (cellTrait !== null) {
      const targetTrait = target !== null ? this.detectCellModel(target) : null;
      this.insertCell(cellTrait, targetTrait);
    }
  }

  /** @protected */
  override onRemoveChild(child: Model): void {
    super.onRemoveChild(child);
    const cellTrait = this.detectCellModel(child);
    if (cellTrait !== null) {
      this.removeCell(cellTrait);
    }
  }

  /** @protected */
  override onInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    super.onInsertTrait(trait, targetTrait);
    const cellTrait = this.detectCellTrait(trait);
    if (cellTrait !== null) {
      this.insertCell(cellTrait, targetTrait);
    }
  }

  /** @protected */
  override onRemoveTrait(trait: Trait): void {
    super.onRemoveTrait(trait);
    const cellTrait = this.detectCellTrait(trait);
    if (cellTrait !== null) {
      this.removeCell(cellTrait);
    }
  }

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountCellFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountCellFasteners();
    super.unmountFasteners();
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
