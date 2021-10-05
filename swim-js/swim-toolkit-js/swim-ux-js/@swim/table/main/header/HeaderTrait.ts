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
import {ColTrait} from "../col/ColTrait";
import type {HeaderTraitObserver} from "./HeaderTraitObserver";

export class HeaderTrait extends Trait {
  constructor() {
    super();
    this.colFasteners = [];
  }

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
    if (this.mounted) {
      colFastener.mount();
    }
  }

  removeCol(colTrait: ColTrait): void {
    const colFasteners = this.colFasteners as TraitFastener<this, ColTrait>[];
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      if (colFastener.trait === colTrait) {
        colFastener.setTrait(null);
        if (this.mounted) {
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
    if (this.consuming) {
      colTrait.consume(this);
    }
  }

  protected detachCol(colTrait: ColTrait, colFastener: TraitFastener<this, ColTrait>): void {
    if (this.consuming) {
      colTrait.unconsume(this);
    }
  }

  protected willSetCol(newColTrait: ColTrait | null, oldColTrait: ColTrait | null,
                       targetTrait: Trait | null, colFastener: TraitFastener<this, ColTrait>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetCol !== void 0) {
        traitObserver.traitDidSetCol(newColTrait, oldColTrait, targetTrait, this);
      }
    }
  }

  /** @internal */
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
    return HeaderTrait.ColFastener.create(this, colTrait.key ?? "col");
  }

  /** @internal */
  readonly colFasteners: ReadonlyArray<TraitFastener<this, ColTrait>>;

  /** @internal */
  protected mountColFasteners(): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      colFastener.mount();
    }
  }

  /** @internal */
  protected unmountColFasteners(): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      colFastener.unmount();
    }
  }

  /** @internal */
  protected startConsumingCols(): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colTrait = colFasteners[i]!.trait;
      if (colTrait !== null) {
        colTrait.consume(this);
      }
    }
  }

  /** @internal */
  protected stopConsumingCols(): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colTrait = colFasteners[i]!.trait;
      if (colTrait !== null) {
        colTrait.unconsume(this);
      }
    }
  }

  protected detectCellModel(model: Model): ColTrait | null {
    return model.getTrait(ColTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const children = model.children;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const child = children[i]!;
      const colTrait = this.detectCellModel(child);
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

  /** @protected */
  override onInsertChild(child: Model, target: Model | null): void {
    super.onInsertChild(child, target);
    const colTrait = this.detectCellModel(child);
    if (colTrait !== null) {
      const targetTrait = target !== null ? this.detectCellModel(target) : null;
      this.insertCol(colTrait, targetTrait);
    }
  }

  /** @protected */
  override onRemoveChild(child: Model): void {
    super.onRemoveChild(child);
    const colTrait = this.detectCellModel(child);
    if (colTrait !== null) {
      this.removeCol(colTrait);
    }
  }

  /** @protected */
  override onInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    super.onInsertTrait(trait, targetTrait);
    const colTrait = this.detectColTrait(trait);
    if (colTrait !== null) {
      this.insertCol(colTrait, targetTrait);
    }
  }

  /** @protected */
  override onRemoveTrait(trait: Trait): void {
    super.onRemoveTrait(trait);
    const colTrait = this.detectColTrait(trait);
    if (colTrait !== null) {
      this.removeCol(colTrait);
    }
  }

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountColFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountColFasteners();
    super.unmountFasteners();
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
