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
import {Affinity, Property} from "@swim/fastener";
import {AnyLength, Length} from "@swim/math";
import {Model, TraitModelType, Trait, TraitFastener} from "@swim/model";
import type {ColLayout} from "../layout/ColLayout";
import {AnyTableLayout, TableLayout} from "../layout/TableLayout";
import {RowTrait} from "../row/RowTrait";
import {ColTrait} from "../col/ColTrait";
import {HeaderTrait} from "../header/HeaderTrait";
import type {TableTraitObserver} from "./TableTraitObserver";

export class TableTrait extends Trait {
  constructor() {
    super();
    this.colFasteners = [];
    this.rowFasteners = [];
  }

  override readonly observerType?: Class<TableTraitObserver>;

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
    this.layout.setState(layout, Affinity.Intrinsic);
  }

  protected willSetLayout(newLayout: TableLayout | null, oldLayout: TableLayout | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetTableLayout !== void 0) {
        traitObserver.traitWillSetTableLayout(newLayout, oldLayout, this);
      }
    }
  }

  protected onSetLayout(newLayout: TableLayout | null, oldLayout: TableLayout | null): void {
    // hook
  }

  protected didSetLayout(newLayout: TableLayout | null, oldLayout: TableLayout | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetTableLayout !== void 0) {
        traitObserver.traitDidSetTableLayout(newLayout, oldLayout, this);
      }
    }
  }

  @Property<TableTrait, TableLayout | null, AnyTableLayout | null>({
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
  readonly layout!: Property<this, TableLayout | null, AnyTableLayout | null>;

  protected onSetColSpacing(newColSpacing: Length | null, oldColSpacing: Length | null): void {
    this.updateLayout();
  }

  @Property<TableTrait, Length | null, AnyLength | null>({
    type: Length,
    state: null,
    didSetState(newColSpacing: Length | null, oldColSpacing: Length | null): void {
      this.owner.onSetColSpacing(newColSpacing, oldColSpacing);
    },
  })
  readonly colSpacing!: Property<this, Length | null, AnyLength | null>;

  protected createHeader(): HeaderTrait | null {
    return new HeaderTrait();
  }

  protected initHeader(headerTrait: HeaderTrait): void {
    // hook
  }

  protected attachHeader(headerTrait: HeaderTrait): void {
    // hook
  }

  protected detachHeader(headerTrait: HeaderTrait): void {
    // hook
  }

  protected willSetHeader(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null, targetTrait: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetHeader !== void 0) {
        traitObserver.traitWillSetHeader(newHeaderTrait, oldHeaderTrait, targetTrait, this);
      }
    }
  }

  protected onSetHeader(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null, targetTrait: Trait | null): void {
    if (oldHeaderTrait !== null) {
      this.detachHeader(oldHeaderTrait);
    }
    if (newHeaderTrait !== null) {
      this.attachHeader(newHeaderTrait);
      this.initHeader(newHeaderTrait);
    }
  }

  protected didSetHeader(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null, targetTrait: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetHeader !== void 0) {
        traitObserver.traitDidSetHeader(newHeaderTrait, oldHeaderTrait, targetTrait, this);
      }
    }
  }

  @TraitFastener<TableTrait, HeaderTrait>({
    type: HeaderTrait,
    sibling: false,
    willSetTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null, targetTrait: Trait | null): void {
      this.owner.willSetHeader(newHeaderTrait, oldHeaderTrait, targetTrait);
    },
    onSetTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null, targetTrait: Trait | null): void {
      this.owner.onSetHeader(newHeaderTrait, oldHeaderTrait, targetTrait);
    },
    didSetTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null, targetTrait: Trait | null): void {
      this.owner.didSetHeader(newHeaderTrait, oldHeaderTrait, targetTrait);
    },
    createTrait(): HeaderTrait | null {
      return this.owner.createHeader();
    },
  })
  readonly header!: TraitFastener<this, HeaderTrait>;

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
    this.updateLayout();
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

  protected onSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                           colFastener: TraitFastener<this, ColTrait>): void {
    this.updateLayout();
  }

  /** @internal */
  static ColFastener = TraitFastener.define<TableTrait, ColTrait>({
    type: ColTrait,
    sibling: false,
    observes: true,
    willSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait | null): void {
      this.owner.willSetCol(newColTrait, oldColTrait, targetTrait, this);
    },
    onSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait | null): void {
      this.owner.onSetCol(newColTrait, oldColTrait, targetTrait, this);
    },
    didSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait | null): void {
      this.owner.didSetCol(newColTrait, oldColTrait, targetTrait, this);
    },
    traitDidSetLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null): void {
      this.owner.onSetColLayout(newColLayout, oldColLayout, this);
    },
  });

  protected createColFastener(colTrait: ColTrait): TraitFastener<this, ColTrait> {
    return TableTrait.ColFastener.create(this, colTrait.key ?? "col");
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
    if (this.mounted) {
      rowFastener.mount();
    }
  }

  removeRow(rowTrait: RowTrait): void {
    const rowFasteners = this.rowFasteners as TraitFastener<this, RowTrait>[];
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      if (rowFastener.trait === rowTrait) {
        rowFastener.setTrait(null);
        if (this.mounted) {
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
    if (this.consuming) {
      rowTrait.consume(this);
    }
  }

  protected detachRow(rowTrait: RowTrait, rowFastener: TraitFastener<this, RowTrait>): void {
    if (this.consuming) {
      rowTrait.unconsume(this);
    }
  }

  protected willSetRow(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null,
                       targetTrait: Trait | null, rowFastener: TraitFastener<this, RowTrait>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetRow !== void 0) {
        traitObserver.traitDidSetRow(newRowTrait, oldRowTrait, targetTrait, this);
      }
    }
  }

  /** @internal */
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
    return TableTrait.RowFastener.create(this, rowTrait.key ?? "row");
  }

  /** @internal */
  readonly rowFasteners: ReadonlyArray<TraitFastener<this, RowTrait>>;

  /** @internal */
  protected mountRowFasteners(): void {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      rowFastener.mount();
    }
  }

  /** @internal */
  protected unmountRowFasteners(): void {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      rowFastener.unmount();
    }
  }

  /** @internal */
  protected startConsumingRows(): void {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowTrait = rowFasteners[i]!.trait;
      if (rowTrait !== null) {
        rowTrait.consume(this);
      }
    }
  }

  /** @internal */
  protected stopConsumingRows(): void {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowTrait = rowFasteners[i]!.trait;
      if (rowTrait !== null) {
        rowTrait.unconsume(this);
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
    const children = model.children;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const child = children[i]!;
      const colTrait = this.detectColModel(child);
      if (colTrait !== null) {
        this.insertCol(colTrait);
      }
      const rowTrait = this.detectRowModel(child);
      if (rowTrait !== null) {
        this.insertRow(rowTrait);
      }
    }
  }

  protected detectHeaderTrait(trait: Trait): HeaderTrait | null {
    return trait instanceof HeaderTrait ? trait : null;
  }

  protected detectColTrait(trait: Trait): ColTrait | null {
    return trait instanceof ColTrait ? trait : null;
  }

  protected detectTraits(model: TraitModelType<this>): void {
    const traits = model.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      const trait = traits[i]!;
      if (this.header.trait === null) {
        const headerTrait = this.detectHeaderTrait(trait);
        if (headerTrait !== null) {
          this.header.setTrait(headerTrait);
        }
      }
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
    const colTrait = this.detectColModel(child);
    if (colTrait !== null) {
      const targetTrait = target !== null ? this.detectColModel(target) : null;
      this.insertCol(colTrait, targetTrait);
    }
    const rowTrait = this.detectRowModel(child);
    if (rowTrait !== null) {
      const targetTrait = target !== null ? this.detectRowModel(target) : null;
      this.insertRow(rowTrait, targetTrait);
    }
  }

  /** @protected */
  override onRemoveChild(child: Model): void {
    super.onRemoveChild(child);
    const colTrait = this.detectColModel(child);
    if (colTrait !== null) {
      this.removeCol(colTrait);
    }
    const rowTrait = this.detectRowModel(child);
    if (rowTrait !== null) {
      this.removeRow(rowTrait);
    }
  }

  /** @protected */
  override onInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    super.onInsertTrait(trait, targetTrait);
    if (this.header.trait === null) {
      const headerTrait = this.detectHeaderTrait(trait);
      if (headerTrait !== null) {
        this.header.setTrait(headerTrait, targetTrait);
      }
    }
    const colTrait = this.detectColTrait(trait);
    if (colTrait !== null) {
      this.insertCol(colTrait, targetTrait);
    }
  }

  /** @protected */
  override onRemoveTrait(trait: Trait): void {
    super.onRemoveTrait(trait);
    const headerTrait = this.detectHeaderTrait(trait);
    if (headerTrait !== null && this.header.trait === headerTrait) {
      this.header.setTrait(null);
    }
    const colTrait = this.detectColTrait(trait);
    if (colTrait !== null) {
      this.removeCol(colTrait);
    }
  }

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountColFasteners();
    this.mountRowFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountRowFasteners();
    this.unmountColFasteners();
    super.unmountFasteners();
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
