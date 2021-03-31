// Copyright 2015-2020 Swim inc.
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

import {Equals} from "@swim/util";
import {AnyLength, Length} from "@swim/math";
import {Model, TraitModelType, Trait, TraitFastener, GenericTrait} from "@swim/model";
import type {ColLayout} from "../layout/ColLayout";
import {AnyTableLayout, TableLayout} from "../layout/TableLayout";
import {ColTrait} from "../col/ColTrait";
import {RowTrait} from "../row/RowTrait";
import type {TableTraitObserver} from "./TableTraitObserver";

export class TableTrait extends GenericTrait {
  constructor() {
    super();
    Object.defineProperty(this, "layout", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "colSpacing", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "colFasteners", {
      value: [],
      enumerable: true,
    });
    Object.defineProperty(this, "rowFasteners", {
      value: [],
      enumerable: true,
    });
  }

  declare readonly traitObservers: ReadonlyArray<TableTraitObserver>;

  protected createLayout(): TableLayout | null {
    const colLayouts: ColLayout[] = [];
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colTrait = colFasteners[i]!.trait;
      if (colTrait !== null) {
        const colLayout = colTrait.layout;
        if (colLayout !== null) {
          colLayouts.push(colLayout);
        }
      }
    }
    const colSpacing = this.colSpacing;
    return new TableLayout(null, null, null, colSpacing, colLayouts);
  }

  protected updateLayout(): void {
    const layout = this.createLayout();
    this.setLayout(layout);
  }

  declare readonly layout: TableLayout | null;

  setLayout(newLayout: AnyTableLayout | null): void {
    if (newLayout !== null) {
      newLayout = TableLayout.fromAny(newLayout);
    }
    const oldLayout = this.layout;
    if (!Equals(newLayout, oldLayout)) {
      this.willSetLayout(newLayout, oldLayout);
      Object.defineProperty(this, "layout", {
        value: newLayout,
        enumerable: true,
        configurable: true,
      });
      this.onSetLayout(newLayout, oldLayout);
      this.didSetLayout(newLayout, oldLayout);
    }
  }

  protected willSetLayout(newLayout: TableLayout | null, oldHeader: TableLayout | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.tableTraitWillSetLayout !== void 0) {
        traitObserver.tableTraitWillSetLayout(newLayout, oldHeader, this);
      }
    }
  }

  protected onSetLayout(newLayout: TableLayout | null, oldHeader: TableLayout | null): void {
    // hook
  }

  protected didSetLayout(newLayout: TableLayout | null, oldHeader: TableLayout | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.tableTraitDidSetLayout !== void 0) {
        traitObserver.tableTraitDidSetLayout(newLayout, oldHeader, this);
      }
    }
  }

  declare readonly colSpacing: Length | null;

  setColSpacing(newColSpacing: AnyLength | null): void {
    if (newColSpacing !== null) {
      newColSpacing = Length.fromAny(newColSpacing);
    }
    const oldColSpacing = this.colSpacing;
    if (!Equals(newColSpacing, oldColSpacing)) {
      Object.defineProperty(this, "colSpacing", {
        value: newColSpacing,
        enumerable: true,
        configurable: true,
      });
      this.onSetColSpacing(newColSpacing, oldColSpacing);
    }
  }

  protected onSetColSpacing(newColSpacing: Length | null, oldColSpacing: Length | null): void {
    this.updateLayout();
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
      if (traitObserver.tableTraitWillSetCol !== void 0) {
        traitObserver.tableTraitWillSetCol(newColTrait, oldColTrait, targetTrait, this);
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
      if (traitObserver.tableTraitDidSetCol !== void 0) {
        traitObserver.tableTraitDidSetCol(newColTrait, oldColTrait, targetTrait, this);
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
    colTraitDidSetLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null): void {
      this.owner.onSetColLayout(newColLayout, oldColLayout, this);
    },
  });

  protected createColFastener(colTrait: ColTrait): TraitFastener<this, ColTrait> {
    return new TableTrait.ColFastener(this, colTrait.key, "col");
  }

  /** @hidden */
  declare readonly colFasteners: ReadonlyArray<TraitFastener<this, ColTrait>>;

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
      if (traitObserver.tableTraitWillSetRow !== void 0) {
        traitObserver.tableTraitWillSetRow(newRowTrait, oldRowTrait, targetTrait, this);
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
      if (traitObserver.tableTraitDidSetRow !== void 0) {
        traitObserver.tableTraitDidSetRow(newRowTrait, oldRowTrait, targetTrait, this);
      }
    }
  }

  /** @hidden */
  static RowFastener = TraitFastener.define<TableTrait, RowTrait>({
    type: RowTrait,
    sibling: false,
    observe: true,
    willSetTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, targetTrait: Trait | null): void {
      this.owner.willSetRow(newRowTrait, oldRowTrait, targetTrait, this);
    },
    onSetTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, targetTrait: Trait | null): void {
      this.owner.onSetRow(newRowTrait, oldRowTrait, targetTrait, this);
    },
    didSetTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, targetTrait: Trait | null): void {
      this.owner.didSetRow(newRowTrait, oldRowTrait, targetTrait, this);
    },
    traitDidSetParentModel(newParentModel: Model | null, oldParentModel: Model | null, rowTrait: RowTrait): void {
      if (newParentModel === null) {
        this.owner.removeRow(rowTrait);
      }
    },
  });

  protected createRowFastener(rowTrait: RowTrait): TraitFastener<this, RowTrait> {
    return new TableTrait.RowFastener(this, rowTrait.key, "row");
  }

  /** @hidden */
  declare readonly rowFasteners: ReadonlyArray<TraitFastener<this, RowTrait>>;

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

  protected didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    if (newModel !== null) {
      this.detectModels(newModel);
    }
    super.didSetModel(newModel, oldModel);
  }

  protected onInsertChildModel(childModel: Model, targetModel: Model | null): void {
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

  protected onRemoveChildModel(childModel: Model): void {
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

  protected onInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    super.onInsertTrait(trait, targetTrait);
    const colTrait = this.detectColTrait(trait);
    if (colTrait !== null) {
      this.insertCol(colTrait, targetTrait);
    }
  }

  protected onRemoveTrait(trait: Trait): void {
    super.onRemoveTrait(trait);
    const colTrait = this.detectColTrait(trait);
    if (colTrait !== null) {
      this.removeCol(colTrait);
    }
  }

  /** @hidden */
  protected mountTraitFasteners(): void {
    super.mountTraitFasteners();
    this.mountColFasteners();
    this.mountRowFasteners();
  }

  /** @hidden */
  protected unmountTraitFasteners(): void {
    this.unmountRowFasteners();
    this.unmountColFasteners();
    super.unmountTraitFasteners();
  }

  protected onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingCols();
    this.startConsumingRows();
  }

  protected onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingRows();
    this.stopConsumingCols();
  }
}
