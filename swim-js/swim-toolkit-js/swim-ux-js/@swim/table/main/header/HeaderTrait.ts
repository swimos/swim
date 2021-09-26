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
import {ColTrait} from "../col/ColTrait";
import type {HeaderTraitObserver} from "./HeaderTraitObserver";

export class HeaderTrait extends GenericTrait {
  constructor() {
    super();
    this.colFasteners = [];
  }

  override readonly traitObservers!: ReadonlyArray<HeaderTraitObserver>;

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

  insertCol(colTrait: ColTrait, targetTrait: Trait | null = null): void {
    const colFasteners = this.colFasteners as TraitFastener<this, ColTrait>[];
    let targetIndex = colFasteners.length;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      if (colFastener.trait === colTrait) {
        return;
      } else if (colFastener.trait === targetTrait) {
        targetIndex = i;
      }
    }
    const colFastener = this.createColFastener(colTrait);
    colFasteners.splice(targetIndex, 0, colFastener);
    colFastener.setTrait(colTrait, targetTrait);
    if (this.isMounted()) {
      colFastener.mount();
    }
  }

  removeCol(colTrait: ColTrait): void {
    const colFasteners = this.colFasteners as TraitFastener<this, ColTrait>[];
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      if (colFastener.trait === colTrait) {
        colFastener.setTrait(null);
        if (this.isMounted()) {
          colFastener.unmount();
        }
        colFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initCol(colTrait: ColTrait, colFastener: TraitFastener<this, ColTrait>): void {
    // hook
  }

  protected attachCol(colTrait: ColTrait, colFastener: TraitFastener<this, ColTrait>): void {
    if (this.isConsuming()) {
      colTrait.addTraitConsumer(this);
    }
  }

  protected detachCol(colTrait: ColTrait, colFastener: TraitFastener<this, ColTrait>): void {
    if (this.isConsuming()) {
      colTrait.removeTraitConsumer(this);
    }
  }

  protected willSetCol(newColTrait: ColTrait | null, oldColTrait: ColTrait | null,
                       targetTrait: Trait | null, colFastener: TraitFastener<this, ColTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetCol !== void 0) {
        traitObserver.traitWillSetCol(newColTrait, oldColTrait, targetTrait, this);
      }
    }
  }

  protected onSetCol(newColTrait: ColTrait | null, oldColTrait: ColTrait | null,
                     targetTrait: Trait | null, colFastener: TraitFastener<this, ColTrait>): void {
    if (oldColTrait !== null) {
      this.detachCol(oldColTrait, colFastener);
    }
    if (newColTrait !== null) {
      this.attachCol(newColTrait, colFastener);
      this.initCol(newColTrait, colFastener);
    }
  }

  protected didSetCol(newColTrait: ColTrait | null, oldColTrait: ColTrait | null,
                      targetTrait: Trait | null, colFastener: TraitFastener<this, ColTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetCol !== void 0) {
        traitObserver.traitDidSetCol(newColTrait, oldColTrait, targetTrait, this);
      }
    }
  }

  /** @hidden */
  static ColFastener = TraitFastener.define<HeaderTrait, ColTrait>({
    type: ColTrait,
    sibling: false,
    willSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait | null): void {
      this.owner.willSetCol(newColTrait, oldColTrait, targetTrait, this);
    },
    onSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait | null): void {
      this.owner.onSetCol(newColTrait, oldColTrait, targetTrait, this);
    },
    didSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait | null): void {
      this.owner.didSetCol(newColTrait, oldColTrait, targetTrait, this);
    },
  });

  protected createColFastener(colTrait: ColTrait): TraitFastener<this, ColTrait> {
    return new HeaderTrait.ColFastener(this, colTrait.key, "col");
  }

  /** @hidden */
  readonly colFasteners: ReadonlyArray<TraitFastener<this, ColTrait>>;

  /** @hidden */
  protected mountColFasteners(): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      colFastener.mount();
    }
  }

  /** @hidden */
  protected unmountColFasteners(): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      colFastener.unmount();
    }
  }

  /** @hidden */
  protected startConsumingCols(): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colTrait = colFasteners[i]!.trait;
      if (colTrait !== null) {
        colTrait.addTraitConsumer(this);
      }
    }
  }

  /** @hidden */
  protected stopConsumingCols(): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colTrait = colFasteners[i]!.trait;
      if (colTrait !== null) {
        colTrait.removeTraitConsumer(this);
      }
    }
  }

  protected detectCellModel(model: Model): ColTrait | null {
    return model.getTrait(ColTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const childModels = model.childModels;
    for (let i = 0, n = childModels.length; i < n; i += 1) {
      const childModel = childModels[i]!;
      const colTrait = this.detectCellModel(childModel);
      if (colTrait !== null) {
        this.insertCol(colTrait);
      }
    }
  }

  protected detectColTrait(trait: Trait): ColTrait | null {
    return trait instanceof ColTrait ? trait : null;
  }

  protected detectTraits(model: TraitModelType<this>): void {
    const traits = model.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      const trait = traits[i]!;
      const colTrait = this.detectColTrait(trait);
      if (colTrait !== null) {
        this.insertCol(colTrait);
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
    const colTrait = this.detectCellModel(childModel);
    if (colTrait !== null) {
      const targetTrait = targetModel !== null ? this.detectCellModel(targetModel) : null;
      this.insertCol(colTrait, targetTrait);
    }
  }

  protected override onRemoveChildModel(childModel: Model): void {
    super.onRemoveChildModel(childModel);
    const colTrait = this.detectCellModel(childModel);
    if (colTrait !== null) {
      this.removeCol(colTrait);
    }
  }

  protected override onInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    super.onInsertTrait(trait, targetTrait);
    const colTrait = this.detectColTrait(trait);
    if (colTrait !== null) {
      this.insertCol(colTrait, targetTrait);
    }
  }

  protected override onRemoveTrait(trait: Trait): void {
    super.onRemoveTrait(trait);
    const colTrait = this.detectColTrait(trait);
    if (colTrait !== null) {
      this.removeCol(colTrait);
    }
  }

  /** @hidden */
  protected override mountTraitFasteners(): void {
    super.mountTraitFasteners();
    this.mountColFasteners();
  }

  /** @hidden */
  protected override unmountTraitFasteners(): void {
    this.unmountColFasteners();
    super.unmountTraitFasteners();
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
