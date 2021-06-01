// Copyright 2015-2021 Swim inc.
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

import {AnyLength, Length} from "@swim/math";
import {Model, TraitModelType, Trait, TraitProperty, TraitFastener, GenericTrait} from "@swim/model";
import type {ColLayout} from "../layout/ColLayout";
import {AnyTableLayout, TableLayout} from "../layout/TableLayout";
import {ColTrait} from "../col/ColTrait";
import {RowTrait} from "../row/RowTrait";
import type {TableTraitObserver} from "./TableTraitObserver";

export class TableTrait extends GenericTrait {
  constructor() {
    super();
    Object.defineProperty(this, "colFasteners", {
      value: [],
      enumerable: true,
    });
    Object.defineProperty(this, "rowFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly traitObservers!: ReadonlyArray<TableTraitObserver>;

  protected createLayout(): TableLayout | null {
    const colLayouts: ColLayout[] = [];
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colTrait = colFasteners[i]!.trait;
      if (colTrait !== null) {
        const colLayout = colTrait.layout.state;
        if (colLayout !== null) {
          colLayouts.push(colLayout);
        }
      }
    }
    const colSpacing = this.colSpacing.state;
    return new TableLayout(null, null, null, colSpacing, colLayouts);
  }

  protected updateLayout(): void {
    const layout = this.createLayout();
    this.layout.setState(layout, Model.Intrinsic);
  }

  protected willSetLayout(newLayout: TableLayout | null, oldLayout: TableLayout | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetTableLayout !== void 0) {
        traitObserver.traitWillSetTableLayout(newLayout, oldLayout, this);
      }
    }
  }

  protected onSetLayout(newLayout: TableLayout | null, oldLayout: TableLayout | null): void {
    // hook
  }

  protected didSetLayout(newLayout: TableLayout | null, oldLayout: TableLayout | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetTableLayout !== void 0) {
        traitObserver.traitDidSetTableLayout(newLayout, oldLayout, this);
      }
    }
  }

  @TraitProperty<TableTrait, TableLayout | null, AnyTableLayout | null>({
    type: TableLayout,
    state: null,
    willSetState(newLayout: TableLayout | null, oldLayout: TableLayout | null): void {
      this.owner.willSetLayout(newLayout, oldLayout);
    },
    didSetState(newLayout: TableLayout | null, oldLayout: TableLayout | null): void {
      this.owner.onSetLayout(newLayout, oldLayout);
      this.owner.didSetLayout(newLayout, oldLayout);
    },
  })
  readonly layout!: TraitProperty<this, TableLayout | null, AnyTableLayout | null>;

  protected onSetColSpacing(newColSpacing: Length | null, oldColSpacing: Length | null): void {
    this.updateLayout();
  }

  @TraitProperty<TableTrait, Length | null, AnyLength | null>({
    type: Length,
    state: null,
    didSetState(newColSpacing: Length | null, oldColSpacing: Length | null): void {
      this.owner.onSetColSpacing(newColSpacing, oldColSpacing);
    },
  })
  readonly colSpacing!: TraitProperty<this, Length | null, AnyLength | null>;

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
    this.updateLayout();
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

  protected onSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                           colFastener: TraitFastener<this, ColTrait>): void {
    this.updateLayout();
  }

  /** @hidden */
  static ColFastener = TraitFastener.define<TableTrait, ColTrait>({
    type: ColTrait,
    sibling: false,
    observe: true,
    willSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait | null): void {
      this.owner.willSetCol(newColTrait, oldColTrait, targetTrait, this);
    },
    onSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait | null): void {
      this.owner.onSetCol(newColTrait, oldColTrait, targetTrait, this);
    },
    didSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait | null): void {
      this.owner.didSetCol(newColTrait, oldColTrait, targetTrait, this);
    },
    traitDidSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null): void {
      this.owner.onSetColLayout(newColLayout, oldColLayout, this);
    },
  });

  protected createColFastener(colTrait: ColTrait): TraitFastener<this, ColTrait> {
    return new TableTrait.ColFastener(this, colTrait.key, "col");
  }

  /** @hidden */
  readonly colFasteners!: ReadonlyArray<TraitFastener<this, ColTrait>>;

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

  insertRow(rowTrait: RowTrait, targetTrait: Trait | null = null): void {
    const rowFasteners = this.rowFasteners as TraitFastener<this, RowTrait>[];
    let targetIndex = rowFasteners.length;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      if (rowFastener.trait === rowTrait) {
        return;
      } else if (rowFastener.trait === targetTrait) {
        targetIndex = i;
      }
    }
    const rowFastener = this.createRowFastener(rowTrait);
    rowFasteners.splice(targetIndex, 0, rowFastener);
    rowFastener.setTrait(rowTrait, targetTrait);
    if (this.isMounted()) {
      rowFastener.mount();
    }
  }

  removeRow(rowTrait: RowTrait): void {
    const rowFasteners = this.rowFasteners as TraitFastener<this, RowTrait>[];
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      if (rowFastener.trait === rowTrait) {
        rowFastener.setTrait(null);
        if (this.isMounted()) {
          rowFastener.unmount();
        }
        rowFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initRow(rowTrait: RowTrait, rowFastener: TraitFastener<this, RowTrait>): void {
    // hook
  }

  protected attachRow(rowTrait: RowTrait, rowFastener: TraitFastener<this, RowTrait>): void {
    if (this.isConsuming()) {
      rowTrait.addTraitConsumer(this);
    }
  }

  protected detachRow(rowTrait: RowTrait, rowFastener: TraitFastener<this, RowTrait>): void {
    if (this.isConsuming()) {
      rowTrait.removeTraitConsumer(this);
    }
  }

  protected willSetRow(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null,
                       targetTrait: Trait | null, rowFastener: TraitFastener<this, RowTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetRow !== void 0) {
        traitObserver.traitWillSetRow(newRowTrait, oldRowTrait, targetTrait, this);
      }
    }
  }

  protected onSetRow(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null,
                     targetTrait: Trait | null, rowFastener: TraitFastener<this, RowTrait>): void {
    if (oldRowTrait !== null) {
      this.detachRow(oldRowTrait, rowFastener);
    }
    if (newRowTrait !== null) {
      this.attachRow(newRowTrait, rowFastener);
      this.initRow(newRowTrait, rowFastener);
    }
  }

  protected didSetRow(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null,
                      targetTrait: Trait | null, rowFastener: TraitFastener<this, RowTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetRow !== void 0) {
        traitObserver.traitDidSetRow(newRowTrait, oldRowTrait, targetTrait, this);
      }
    }
  }

  /** @hidden */
  static RowFastener = TraitFastener.define<TableTrait, RowTrait>({
    type: RowTrait,
    sibling: false,
    willSetTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, targetTrait: Trait | null): void {
      this.owner.willSetRow(newRowTrait, oldRowTrait, targetTrait, this);
    },
    onSetTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, targetTrait: Trait | null): void {
      this.owner.onSetRow(newRowTrait, oldRowTrait, targetTrait, this);
    },
    didSetTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, targetTrait: Trait | null): void {
      this.owner.didSetRow(newRowTrait, oldRowTrait, targetTrait, this);
    },
  });

  protected createRowFastener(rowTrait: RowTrait): TraitFastener<this, RowTrait> {
    return new TableTrait.RowFastener(this, rowTrait.key, "row");
  }

  /** @hidden */
  readonly rowFasteners!: ReadonlyArray<TraitFastener<this, RowTrait>>;

  /** @hidden */
  protected mountRowFasteners(): void {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      rowFastener.mount();
    }
  }

  /** @hidden */
  protected unmountRowFasteners(): void {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      rowFastener.unmount();
    }
  }

  /** @hidden */
  protected startConsumingRows(): void {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowTrait = rowFasteners[i]!.trait;
      if (rowTrait !== null) {
        rowTrait.addTraitConsumer(this);
      }
    }
  }

  /** @hidden */
  protected stopConsumingRows(): void {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowTrait = rowFasteners[i]!.trait;
      if (rowTrait !== null) {
        rowTrait.removeTraitConsumer(this);
      }
    }
  }

  protected detectColModel(model: Model): ColTrait | null {
    return model.getTrait(ColTrait);
  }

  protected detectRowModel(model: Model): RowTrait | null {
    return model.getTrait(RowTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const childModels = model.childModels;
    for (let i = 0, n = childModels.length; i < n; i += 1) {
      const childModel = childModels[i]!;
      const colTrait = this.detectColModel(childModel);
      if (colTrait !== null) {
        this.insertCol(colTrait);
      }
      const rowTrait = this.detectRowModel(childModel);
      if (rowTrait !== null) {
        this.insertRow(rowTrait);
      }
    }
  }

  protected detectColTrait(trait: Trait): ColTrait | null {
    return trait instanceof ColTrait ? trait : null;
  }

  protected override didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    if (newModel !== null) {
      this.detectModels(newModel);
    }
    super.didSetModel(newModel, oldModel);
  }

  protected override onInsertChildModel(childModel: Model, targetModel: Model | null): void {
    super.onInsertChildModel(childModel, targetModel);
    const colTrait = this.detectColModel(childModel);
    if (colTrait !== null) {
      const targetTrait = targetModel !== null ? this.detectColModel(targetModel) : null;
      this.insertCol(colTrait, targetTrait);
    }
    const rowTrait = this.detectRowModel(childModel);
    if (rowTrait !== null) {
      const targetTrait = targetModel !== null ? this.detectRowModel(targetModel) : null;
      this.insertRow(rowTrait, targetTrait);
    }
  }

  protected override onRemoveChildModel(childModel: Model): void {
    super.onRemoveChildModel(childModel);
    const colTrait = this.detectColModel(childModel);
    if (colTrait !== null) {
      this.removeCol(colTrait);
    }
    const rowTrait = this.detectRowModel(childModel);
    if (rowTrait !== null) {
      this.removeRow(rowTrait);
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
    this.mountRowFasteners();
  }

  /** @hidden */
  protected override unmountTraitFasteners(): void {
    this.unmountRowFasteners();
    this.unmountColFasteners();
    super.unmountTraitFasteners();
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingCols();
    this.startConsumingRows();
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingRows();
    this.stopConsumingCols();
  }
}
