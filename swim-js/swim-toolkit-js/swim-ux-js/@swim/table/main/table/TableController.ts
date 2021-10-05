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

import type {Class, ObserverType} from "@swim/util";
import {Affinity} from "@swim/fastener";
import type {Trait} from "@swim/model";
import type {View, PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import {TraitViewFastener, ControllerFastener, GenericController, Controller} from "@swim/controller";
import type {TableLayout} from "../layout/TableLayout";
import type {ColLayout} from "../layout/ColLayout";
import type {CellView} from "../cell/CellView";
import {TextCellView} from "../cell/TextCellView";
import type {CellTrait} from "../cell/CellTrait";
import type {CellController} from "../cell/CellController";
import type {LeafView} from "../leaf/LeafView";
import type {LeafTrait} from "../leaf/LeafTrait";
import type {RowView} from "../row/RowView";
import type {RowTrait} from "../row/RowTrait";
import {RowController} from "../row/RowController";
import type {ColView} from "../col/ColView";
import type {ColTrait} from "../col/ColTrait";
import {ColController} from "../col/ColController";
import type {HeaderView} from "../header/HeaderView";
import type {HeaderTrait} from "../header/HeaderTrait";
import {HeaderController} from "../header/HeaderController";
import {TableView} from "./TableView";
import {TableTrait} from "./TableTrait";
import type {TableControllerObserver} from "./TableControllerObserver";

export class TableController extends GenericController {
  constructor() {
    super();
    this.colFasteners = [];
    this.rowFasteners = [];
  }

  override readonly observerType?: Class<TableControllerObserver>;

  protected layoutTable(tableLayout: TableLayout, tableView: TableView): void {
    tableView.layout.setState(tableLayout, Affinity.Intrinsic);
  }

  protected initTableTrait(tableTrait: TableTrait): void {
    const tableLayout = tableTrait.layout.state;
    if (tableLayout !== null) {
      const tableView = this.table.view;
      if (tableView !== null) {
        this.layoutTable(tableLayout, tableView);
      }
    }
  }

  protected attachTableTrait(tableTrait: TableTrait): void {
    const headerTrait = tableTrait.header.trait;
    if (headerTrait !== null) {
      this.insertHeaderTrait(headerTrait);
    }

    const colFasteners = tableTrait.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colTrait = colFasteners[i]!.trait;
      if (colTrait !== null) {
        this.insertColTrait(colTrait);
      }
    }

    const rowFasteners = tableTrait.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowTrait = rowFasteners[i]!.trait;
      if (rowTrait !== null) {
        this.insertRowTrait(rowTrait);
      }
    }
  }

  protected detachTableTrait(tableTrait: TableTrait): void {
    const rowFasteners = tableTrait.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowTrait = rowFasteners[i]!.trait;
      if (rowTrait !== null) {
        this.removeRowTrait(rowTrait);
      }
    }

    const colFasteners = tableTrait.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colTrait = colFasteners[i]!.trait;
      if (colTrait !== null) {
        this.removeColTrait(colTrait);
      }
    }

    const headerTrait = tableTrait.header.trait;
    if (headerTrait !== null) {
      this.removeHeaderTrait(headerTrait);
    }
  }

  protected willSetTableTrait(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetTableTrait !== void 0) {
        observer.controllerWillSetTableTrait(newTableTrait, oldTableTrait, this);
      }
    }
  }

  protected onSetTableTrait(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null): void {
    if (oldTableTrait !== null) {
      this.detachTableTrait(oldTableTrait);
    }
    if (newTableTrait !== null) {
      this.attachTableTrait(newTableTrait);
      this.initTableTrait(newTableTrait);
    }
  }

  protected didSetTableTrait(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetTableTrait !== void 0) {
        observer.controllerDidSetTableTrait(newTableTrait, oldTableTrait, this);
      }
    }
  }

  protected willSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetTableLayout !== void 0) {
        observer.controllerWillSetTableLayout(newTableLayout, oldTableLayout, this);
      }
    }
  }

  protected onSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
    // hook
  }

  protected didSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetTableLayout !== void 0) {
        observer.controllerDidSetTableLayout(newTableLayout, oldTableLayout, this);
      }
    }
  }

  protected createTableView(): TableView | null {
    return TableView.create();
  }

  protected initTableView(tableView: TableView): void {
    const tableTrait = this.table.trait;
    if (tableTrait !== null) {
      const tableLayout = tableTrait.layout.state;
      if (tableLayout !== null) {
        this.layoutTable(tableLayout, tableView);
      }
    }
  }

  protected attachTableView(tableView: TableView): void {
    const headerController = this.header.controller;
    if (headerController !== null) {
      headerController.header.injectView(tableView);
      if (tableView.header.view === null) {
        tableView.header.setView(headerController.header.view);
      }
    }

    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowController = rowFasteners[i]!.controller;
      if (rowController !== null) {
        const rowView = rowController.row.view;
        if (rowView !== null && rowView.parent === null) {
          rowController.row.injectView(tableView);
        }
      }
    }
  }

  protected detachTableView(tableView: TableView): void {
    // hook
  }

  protected willSetTableView(newTableView: TableView | null, oldTableView: TableView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetTableView !== void 0) {
        observer.controllerWillSetTableView(newTableView, oldTableView, this);
      }
    }
  }

  protected onSetTableView(newTableView: TableView | null, oldTableView: TableView | null): void {
    if (oldTableView !== null) {
      this.detachTableView(oldTableView);
    }
    if (newTableView !== null) {
      this.attachTableView(newTableView);
      this.initTableView(newTableView);
    }
  }

  protected didSetTableView(newTableView: TableView | null, oldTableView: TableView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetTableView !== void 0) {
        observer.controllerDidSetTableView(newTableView, oldTableView, this);
      }
    }
  }

  /** @internal */
  static TableFastener = TraitViewFastener.define<TableController, TableTrait, TableView>({
    traitType: TableTrait,
    observesTrait: true,
    willSetTrait(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null): void {
      this.owner.willSetTableTrait(newTableTrait, oldTableTrait);
    },
    onSetTrait(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null): void {
      this.owner.onSetTableTrait(newTableTrait, oldTableTrait);
    },
    didSetTrait(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null): void {
      this.owner.didSetTableTrait(newTableTrait, oldTableTrait);
    },
    traitWillSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
      this.owner.willSetTableLayout(newTableLayout, oldTableLayout);
    },
    traitDidSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
      this.owner.onSetTableLayout(newTableLayout, oldTableLayout);
      this.owner.didSetTableLayout(newTableLayout, oldTableLayout);
    },
    traitWillSetHeader(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null, targetTrait: Trait | null): void {
      if (oldHeaderTrait !== null) {
        this.owner.removeHeaderTrait(oldHeaderTrait);
      }
    },
    traitDidSetHeader(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null, targetTrait: Trait | null): void {
      if (newHeaderTrait !== null) {
        this.owner.insertHeaderTrait(newHeaderTrait, targetTrait);
      }
    },
    traitWillSetCol(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait): void {
      if (oldColTrait !== null) {
        this.owner.removeColTrait(oldColTrait);
      }
    },
    traitDidSetCol(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait): void {
      if (newColTrait !== null) {
        this.owner.insertColTrait(newColTrait, targetTrait);
      }
    },
    traitWillSetRow(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, targetTrait: Trait): void {
      if (oldRowTrait !== null) {
        this.owner.removeRowTrait(oldRowTrait);
      }
    },
    traitDidSetRow(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, targetTrait: Trait): void {
      if (newRowTrait !== null) {
        this.owner.insertRowTrait(newRowTrait, targetTrait);
      }
    },
    viewType: TableView,
    observesView: true,
    willSetView(newTableView: TableView | null, oldTableView: TableView | null): void {
      this.owner.willSetTableView(newTableView, oldTableView);
    },
    onSetView(newTableView: TableView | null, oldTableView: TableView | null): void {
      this.owner.onSetTableView(newTableView, oldTableView);
    },
    didSetView(newTableView: TableView | null, oldTableView: TableView | null): void {
      this.owner.didSetTableView(newTableView, oldTableView);
    },
    viewDidSetHeader(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null, targetView: View | null): void {
      const headerController = this.owner.header.controller;
      if (headerController !== null) {
        headerController.header.setView(newHeaderView);
      }
    },
    createView(): TableView | null {
      return this.owner.createTableView();
    },
  });

  @TraitViewFastener<TableController, TableTrait, TableView>({
    extends: TableController.TableFastener,
  })
  readonly table!: TraitViewFastener<this, TableTrait, TableView>;

  protected createHeader(headerTrait: HeaderTrait): HeaderController | null {
    return new HeaderController();
  }

  protected initHeader(headerController: HeaderController): void {
    const tableTrait = this.table.trait;
    if (tableTrait !== null) {
      const headerTrait = tableTrait.header.trait;
      if (headerTrait !== null) {
        headerController.header.setTrait(headerTrait);
      }
    }

    const headerTrait = headerController.header.trait;
    if (headerTrait !== null) {
      this.initHeaderTrait(headerTrait);
    }
    const treeView = headerController.header.view;
    if (treeView !== null) {
      this.initHeaderView(treeView);
    }
  }

  protected attachHeader(headerController: HeaderController): void {
    const headerTrait = headerController.header.trait;
    if (headerTrait !== null) {
      this.attachHeaderTrait(headerTrait);
    }
    const treeView = headerController.header.view;
    if (treeView !== null) {
      this.attachHeaderView(treeView);
    }
  }

  protected detachHeader(headerController: HeaderController): void {
    const headerTrait = headerController.header.trait;
    if (headerTrait !== null) {
      this.detachHeaderTrait(headerTrait);
    }
    const treeView = headerController.header.view;
    if (treeView !== null) {
      this.detachHeaderView(treeView);
    }
  }

  protected willSetHeader(newHeaderController: HeaderController | null, oldHeaderController: HeaderController | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetHeader !== void 0) {
        observer.controllerWillSetHeader(newHeaderController, oldHeaderController, this);
      }
    }
  }

  protected onSetHeader(newHeaderController: HeaderController | null, oldHeaderController: HeaderController | null): void {
    if (oldHeaderController !== null) {
      this.detachHeader(oldHeaderController);
    }
    if (newHeaderController !== null) {
      this.attachHeader(newHeaderController);
      this.initHeader(newHeaderController);
    }
  }

  protected didSetHeader(newHeaderController: HeaderController | null, oldHeaderController: HeaderController | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetHeader !== void 0) {
        observer.controllerDidSetHeader(newHeaderController, oldHeaderController, this);
      }
    }
  }

  protected insertHeaderTrait(headerTrait: HeaderTrait, targetTrait: Trait | null = null): void {
    const children = this.children;
    let targetController: HeaderController | null = null;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const childController = children[i]!;
      if (childController instanceof HeaderController) {
        if (childController.header.trait === headerTrait) {
          return;
        } else if (childController.header.trait === targetTrait) {
          targetController = childController;
        }
      }
    }
    const headerController = this.createHeader(headerTrait);
    if (headerController instanceof HeaderController) {
      headerController.header.setTrait(headerTrait);
      this.header.setController(headerController, targetController);
      this.insertChild(headerController, targetController);
      if (headerController.header.view === null) {
        const headerView = headerController.header.createView();
        let targetView: HeaderView | null = null;
        if (targetController !== null) {
          targetView = targetController.header.view;
        }
        const tableView = this.table.view;
        if (tableView !== null) {
          headerController.header.injectView(tableView, headerView, targetView, null);
        } else {
          headerController.header.setView(headerView, targetView);
        }
      }
    }
  }

  protected removeHeaderTrait(headerTrait: HeaderTrait): void {
    const children = this.children;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const childController = children[i]!;
      if (childController instanceof HeaderController && childController.header.trait === headerTrait) {
        this.header.setController(null);
        childController.remove();
        return;
      }
    }
  }

  protected initHeaderTrait(headerTrait: HeaderTrait): void {
    // hook
  }

  protected attachHeaderTrait(headerTrait: HeaderTrait): void {
    // hook
  }

  protected detachHeaderTrait(headerTrait: HeaderTrait): void {
    // hook
  }

  protected willSetHeaderTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetHeaderTrait !== void 0) {
        observer.controllerWillSetHeaderTrait(newHeaderTrait, oldHeaderTrait, this);
      }
    }
  }

  protected onSetHeaderTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null): void {
    if (oldHeaderTrait !== null) {
      this.detachHeaderTrait(oldHeaderTrait);
    }
    if (newHeaderTrait !== null) {
      this.attachHeaderTrait(newHeaderTrait);
      this.initHeaderTrait(newHeaderTrait);
    }
  }

  protected didSetHeaderTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetHeaderTrait !== void 0) {
        observer.controllerDidSetHeaderTrait(newHeaderTrait, oldHeaderTrait, this);
      }
    }
  }

  protected initHeaderView(headerView: HeaderView): void {
    // hook
  }

  protected attachHeaderView(headerView: HeaderView): void {
    const tableView = this.table.view;
    if (tableView !== null && tableView.header.view === null) {
      tableView.header.setView(headerView);
    }
  }

  protected detachHeaderView(headerView: HeaderView): void {
    headerView.remove();
  }

  protected willSetHeaderView(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetHeaderView !== void 0) {
        observer.controllerWillSetHeaderView(newHeaderView, oldHeaderView, this);
      }
    }
  }

  protected onSetHeaderView(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null): void {
    if (oldHeaderView !== null) {
      this.detachHeaderView(oldHeaderView);
    }
    if (newHeaderView !== null) {
      this.attachHeaderView(newHeaderView);
      this.initHeaderView(newHeaderView);
    }
  }

  protected didSetHeaderView(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetHeaderView !== void 0) {
        observer.controllerDidSetHeaderView(newHeaderView, oldHeaderView, this);
      }
    }
  }

  /** @internal */
  static HeaderFastener = ControllerFastener.define<TableController, HeaderController>({
    type: HeaderController,
    child: true,
    observes: true,
    willSetController(newHeaderController: HeaderController | null, oldHeaderController: HeaderController | null): void {
      this.owner.willSetHeader(newHeaderController, oldHeaderController);
    },
    onSetController(newHeaderController: HeaderController | null, oldHeaderController: HeaderController | null): void {
      this.owner.onSetHeader(newHeaderController, oldHeaderController);
    },
    didSetController(newHeaderController: HeaderController | null, oldHeaderController: HeaderController | null): void {
      this.owner.didSetHeader(newHeaderController, oldHeaderController);
    },
    controllerWillSetHeaderTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null): void {
      this.owner.willSetHeaderTrait(newHeaderTrait, oldHeaderTrait);
    },
    controllerDidSetHeaderTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null): void {
      this.owner.onSetHeaderTrait(newHeaderTrait, oldHeaderTrait);
      this.owner.didSetHeaderTrait(newHeaderTrait, oldHeaderTrait);
    },
    controllerWillSetHeaderView(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null): void {
      this.owner.willSetHeaderView(newHeaderView, oldHeaderView);
    },
    controllerDidSetHeaderView(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null): void {
      this.owner.onSetHeaderView(newHeaderView, oldHeaderView);
      this.owner.didSetHeaderView(newHeaderView, oldHeaderView);
    },
  });

  @ControllerFastener<TableController, HeaderController>({
    extends: TableController.HeaderFastener,
  })
  readonly header!: ControllerFastener<this, HeaderController>;

  insertCol(colController: ColController, targetController: Controller | null = null): void {
    const colFasteners = this.colFasteners as ControllerFastener<this, ColController>[];
    let targetIndex = colFasteners.length;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      if (colFastener.controller === colController) {
        return;
      } else if (colFastener.controller === targetController) {
        targetIndex = i;
      }
    }
    const colFastener = this.createColFastener(colController);
    colFasteners.splice(targetIndex, 0, colFastener);
    colFastener.setController(colController, targetController);
    if (this.mounted) {
      colFastener.mount();
    }
  }

  removeCol(colController: ColController): void {
    const colFasteners = this.colFasteners as ControllerFastener<this, ColController>[];
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      if (colFastener.controller === colController) {
        colFastener.setController(null);
        if (this.mounted) {
          colFastener.unmount();
        }
        colFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createCol(colTrait: ColTrait): ColController | null {
    return new ColController();
  }

  protected initCol(colController: ColController, colFastener: ControllerFastener<this, ColController>): void {
    const colTrait = colController.col.trait;
    if (colTrait !== null) {
      this.initColTrait(colTrait, colFastener);
    }
    const colView = colController.col.view;
    if (colView !== null) {
      this.initColView(colView, colFastener);
    }
  }

  protected attachCol(colController: ColController, colFastener: ControllerFastener<this, ColController>): void {
    const colTrait = colController.col.trait;
    if (colTrait !== null) {
      this.attachColTrait(colTrait, colFastener);
    }
    const colView = colController.col.view;
    if (colView !== null) {
      this.attachColView(colView, colFastener);
    }
  }

  protected detachCol(colController: ColController, colFastener: ControllerFastener<this, ColController>): void {
    const colTrait = colController.col.trait;
    if (colTrait !== null) {
      this.detachColTrait(colTrait, colFastener);
    }
    const colView = colController.col.view;
    if (colView !== null) {
      this.detachColView(colView, colFastener);
    }
  }

  protected willSetCol(newColController: ColController | null, oldColController: ColController | null,
                       colFastener: ControllerFastener<this, ColController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetCol !== void 0) {
        observer.controllerWillSetCol(newColController, oldColController, colFastener);
      }
    }
  }

  protected onSetCol(newColController: ColController | null, oldColController: ColController | null,
                     colFastener: ControllerFastener<this, ColController>): void {
    if (oldColController !== null) {
      this.detachCol(oldColController, colFastener);
    }
    if (newColController !== null) {
      this.attachCol(newColController, colFastener);
      this.initCol(newColController, colFastener);
    }
  }

  protected didSetCol(newColController: ColController | null, oldColController: ColController | null,
                      colFastener: ControllerFastener<this, ColController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetCol !== void 0) {
        observer.controllerDidSetCol(newColController, oldColController, colFastener);
      }
    }
  }

  insertColTrait(colTrait: ColTrait, targetTrait: Trait | null = null): void {
    const colFasteners = this.colFasteners as ControllerFastener<this, ColController>[];
    let targetController: ColController | null = null;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colController = colFasteners[i]!.controller;
      if (colController !== null) {
        if (colController.col.trait === colTrait) {
          return;
        } else if (colController.col.trait === targetTrait) {
          targetController = colController;
        }
      }
    }
    const colController = this.createCol(colTrait);
    if (colController !== null) {
      this.insertChild(colController, targetController);
      colController.col.setTrait(colTrait);
    }
  }

  removeColTrait(colTrait: ColTrait): void {
    const colFasteners = this.colFasteners as ControllerFastener<this, ColController>[];
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      const colController = colFastener.controller;
      if (colController !== null && colController.col.trait === colTrait) {
        colFastener.setController(null);
        if (this.mounted) {
          colFastener.unmount();
        }
        colFasteners.splice(i, 1);
        colController.remove();
        return;
      }
    }
  }

  protected initColTrait(colTrait: ColTrait | null, colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected attachColTrait(colTrait: ColTrait | null, colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected detachColTrait(colTrait: ColTrait | null, colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected willSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null,
                            colFastener: ControllerFastener<this, ColController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetColTrait !== void 0) {
        observer.controllerWillSetColTrait(newColTrait, oldColTrait, colFastener);
      }
    }
  }

  protected onSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null,
                          colFastener: ControllerFastener<this, ColController>): void {
    if (oldColTrait !== null) {
      this.detachColTrait(oldColTrait, colFastener);
    }
    if (newColTrait !== null) {
      this.attachColTrait(oldColTrait, colFastener);
      this.initColTrait(newColTrait, colFastener);
    }
  }

  protected didSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null,
                           colFastener: ControllerFastener<this, ColController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetColTrait !== void 0) {
        observer.controllerDidSetColTrait(newColTrait, oldColTrait, colFastener);
      }
    }
  }

  protected willSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                             colFastener: ControllerFastener<this, ColController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetColLayout !== void 0) {
        observer.controllerWillSetColLayout(newColLayout, oldColLayout, colFastener);
      }
    }
  }

  protected onSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                           colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected didSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                            colFastener: ControllerFastener<this, ColController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetColLayout !== void 0) {
        observer.controllerDidSetColLayout(newColLayout, oldColLayout, colFastener);
      }
    }
  }

  protected createColView(colController: ColController): ColView | null {
    return colController.col.createView();
  }

  protected initColView(colView: ColView, colFastener: ControllerFastener<this, ColController>): void {
    const colLabelView = colView.label.view;
    if (colLabelView !== null) {
      this.initColLabelView(colLabelView, colFastener);
    }
  }

  protected attachColView(colView: ColView, colFastener: ControllerFastener<this, ColController>): void {
    const colLabelView = colView.label.view;
    if (colLabelView !== null) {
      this.attachColLabelView(colLabelView, colFastener);
    }
  }

  protected detachColView(colView: ColView, colFastener: ControllerFastener<this, ColController>): void {
    const colLabelView = colView.label.view;
    if (colLabelView !== null) {
      this.detachColLabelView(colLabelView, colFastener);
    }
    colView.remove();
  }

  protected willSetColView(newColView: ColView | null, oldColView: ColView | null,
                           colFastener: ControllerFastener<this, ColController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetColView !== void 0) {
        observer.controllerWillSetColView(newColView, oldColView, colFastener);
      }
    }
  }

  protected onSetColView(newColView: ColView | null, oldColView: ColView | null,
                         colFastener: ControllerFastener<this, ColController>): void {
    if (oldColView !== null) {
      this.detachColView(oldColView, colFastener);
    }
    if (newColView !== null) {
      this.attachColView(newColView, colFastener);
      this.initColView(newColView, colFastener);
    }
  }

  protected didSetColView(newColView: ColView | null, oldColView: ColView | null,
                          colFastener: ControllerFastener<this, ColController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetColView !== void 0) {
        observer.controllerDidSetColView(newColView, oldColView, colFastener);
      }
    }
  }

  protected initColLabelView(colLabelView: HtmlView, colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected attachColLabelView(colLabelView: HtmlView, colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected detachColLabelView(colLabelView: HtmlView, colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected willSetColLabelView(newColLabelView: HtmlView | null, oldColLabelView: HtmlView | null,
                                colFastener: ControllerFastener<this, ColController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetColLabelView !== void 0) {
        observer.controllerWillSetColLabelView(newColLabelView, oldColLabelView, colFastener);
      }
    }
  }

  protected onSetColLabelView(newColLabelView: HtmlView | null, oldColLabelView: HtmlView | null,
                              colFastener: ControllerFastener<this, ColController>): void {
    if (oldColLabelView !== null) {
      this.detachColLabelView(oldColLabelView, colFastener);
    }
    if (newColLabelView !== null) {
      this.attachColLabelView(newColLabelView, colFastener);
      this.initColLabelView(newColLabelView, colFastener);
    }
  }

  protected didSetColLabelView(newColLabelView: HtmlView | null, oldColLabelView: HtmlView | null,
                               colFastener: ControllerFastener<this, ColController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetColLabelView !== void 0) {
        observer.controllerDidSetColLabelView(newColLabelView, oldColLabelView, colFastener);
      }
    }
  }

  /** @internal */
  static ColFastener = ControllerFastener.define<TableController, ColController>({
    type: ColController,
    child: false,
    observes: true,
    willSetController(newColController: ColController | null, oldColController: ColController | null): void {
      this.owner.willSetCol(newColController, oldColController, this);
    },
    onSetController(newColController: ColController | null, oldColController: ColController | null): void {
      this.owner.onSetCol(newColController, oldColController, this);
    },
    didSetController(newColController: ColController | null, oldColController: ColController | null): void {
      this.owner.didSetCol(newColController, oldColController, this);
    },
    controllerWillSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
      this.owner.willSetColTrait(newColTrait, oldColTrait, this);
    },
    controllerDidSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
      this.owner.onSetColTrait(newColTrait, oldColTrait, this);
      this.owner.didSetColTrait(newColTrait, oldColTrait, this);
    },
    controllerWillSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null): void {
      this.owner.willSetColLayout(newColLayout, oldColLayout, this);
    },
    controllerDidSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null): void {
      this.owner.onSetColLayout(newColLayout, oldColLayout, this);
      this.owner.didSetColLayout(newColLayout, oldColLayout, this);
    },
    controllerWillSetColView(newColView: ColView | null, oldColView: ColView | null): void {
      this.owner.willSetColView(newColView, oldColView, this);
    },
    controllerDidSetColView(newColView: ColView | null, oldColView: ColView | null): void {
      this.owner.onSetColView(newColView, oldColView, this);
      this.owner.didSetColView(newColView, oldColView, this);
    },
    controllerWillSetColLabelView(newColLabelView: HtmlView | null, oldColLabelView: HtmlView | null): void {
      this.owner.willSetColLabelView(newColLabelView, oldColLabelView, this);
    },
    controllerDidSetColLabelView(newColLabelView: HtmlView | null, oldColLabelView: HtmlView | null): void {
      this.owner.onSetColLabelView(newColLabelView, oldColLabelView, this);
      this.owner.didSetColLabelView(newColLabelView, oldColLabelView, this);
    },
  });

  protected createColFastener(colController: ColController): ControllerFastener<this, ColController> {
    return TableController.ColFastener.create(this, colController.key ?? "col");
  }

  /** @internal */
  readonly colFasteners: ReadonlyArray<ControllerFastener<this, ColController>>;

  protected getColFastener(colTrait: ColTrait): ControllerFastener<this, ColController> | null {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      const colController = colFastener.controller;
      if (colController !== null && colController.col.trait === colTrait) {
        return colFastener;
      }
    }
    return null;
  }

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

  insertRow(rowController: RowController, targetController: Controller | null = null): void {
    const rowFasteners = this.rowFasteners as ControllerFastener<this, RowController>[];
    let targetIndex = rowFasteners.length;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      if (rowFastener.controller === rowController) {
        return;
      } else if (rowFastener.controller === targetController) {
        targetIndex = i;
      }
    }
    const rowFastener = this.createRowFastener(rowController);
    rowFasteners.splice(targetIndex, 0, rowFastener);
    rowFastener.setController(rowController, targetController);
    if (this.mounted) {
      rowFastener.mount();
    }
  }

  removeRow(rowController: RowController): void {
    const rowFasteners = this.rowFasteners as ControllerFastener<this, RowController>[];
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      if (rowFastener.controller === rowController) {
        rowFastener.setController(null);
        if (this.mounted) {
          rowFastener.unmount();
        }
        rowFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createRow(rowTrait: RowTrait): RowController | null {
    return new RowController();
  }

  protected initRow(rowController: RowController, rowFastener: ControllerFastener<this, RowController>): void {
    const rowTrait = rowController.row.trait;
    if (rowTrait !== null) {
      this.initRowTrait(rowTrait, rowFastener);
    }
    const rowView = rowController.row.view;
    if (rowView !== null) {
      this.initRowView(rowView, rowFastener);
    }
  }

  protected attachRow(rowController: RowController, rowFastener: ControllerFastener<this, RowController>): void {
    const rowTrait = rowController.row.trait;
    if (rowTrait !== null) {
      this.attachRowTrait(rowTrait, rowFastener);
    }
    const rowView = rowController.row.view;
    if (rowView !== null) {
      this.attachRowView(rowView, rowFastener);
    }
  }

  protected detachRow(rowController: RowController, rowFastener: ControllerFastener<this, RowController>): void {
    const rowView = rowController.row.view;
    if (rowView !== null) {
      this.detachRowView(rowView, rowFastener);
    }
    const rowTrait = rowController.row.trait;
    if (rowTrait !== null) {
      this.detachRowTrait(rowTrait, rowFastener);
    }
  }

  protected willSetRow(newRowController: RowController | null, oldRowController: RowController | null,
                       rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetRow !== void 0) {
        observer.controllerWillSetRow(newRowController, oldRowController, rowFastener);
      }
    }
  }

  protected onSetRow(newRowController: RowController | null, oldRowController: RowController | null,
                     rowFastener: ControllerFastener<this, RowController>): void {
    if (oldRowController !== null) {
      this.detachRow(oldRowController, rowFastener);
    }
    if (newRowController !== null) {
      this.attachRow(newRowController, rowFastener);
      this.initRow(newRowController, rowFastener);
    }
  }

  protected didSetRow(newRowController: RowController | null, oldRowController: RowController | null,
                      rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetRow !== void 0) {
        observer.controllerDidSetRow(newRowController, oldRowController, rowFastener);
      }
    }
  }

  insertRowTrait(rowTrait: RowTrait, targetTrait: Trait | null = null): void {
    const rowFasteners = this.rowFasteners as ControllerFastener<this, RowController>[];
    let targetController: RowController | null = null;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowController = rowFasteners[i]!.controller;
      if (rowController !== null) {
        if (rowController.row.trait === rowTrait) {
          return;
        } else if (rowController.row.trait === targetTrait) {
          targetController = rowController;
        }
      }
    }
    const rowController = this.createRow(rowTrait);
    if (rowController !== null) {
      rowController.row.setTrait(rowTrait);
      this.insertChild(rowController, targetController);
      if (rowController.row.view === null) {
        const rowView = this.createRowView(rowController);
        let targetView: RowView | null = null;
        if (targetController !== null) {
          targetView = targetController.row.view;
        }
        const tableView = this.table.view;
        if (tableView !== null) {
          rowController.row.injectView(tableView, rowView, targetView, null);
        } else {
          rowController.row.setView(rowView, targetView);
        }
      }
    }
  }

  removeRowTrait(rowTrait: RowTrait): void {
    const rowFasteners = this.rowFasteners as ControllerFastener<this, RowController>[];
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      const rowController = rowFastener.controller;
      if (rowController !== null && rowController.row.trait === rowTrait) {
        rowFastener.setController(null);
        if (this.mounted) {
          rowFastener.unmount();
        }
        rowFasteners.splice(i, 1);
        rowController.remove();
        return;
      }
    }
  }

  protected initRowTrait(rowTrait: RowTrait | null, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected attachRowTrait(rowTrait: RowTrait | null, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected detachRowTrait(rowTrait: RowTrait | null, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected willSetRowTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null,
                            rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetRowTrait !== void 0) {
        observer.controllerWillSetRowTrait(newRowTrait, oldRowTrait, rowFastener);
      }
    }
  }

  protected onSetRowTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null,
                          rowFastener: ControllerFastener<this, RowController>): void {
    if (oldRowTrait !== null) {
      this.detachRowTrait(oldRowTrait, rowFastener);
    }
    if (newRowTrait !== null) {
      this.attachRowTrait(newRowTrait, rowFastener);
      this.initRowTrait(newRowTrait, rowFastener);
    }
  }

  protected didSetRowTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null,
                           rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetRowTrait !== void 0) {
        observer.controllerDidSetRowTrait(newRowTrait, oldRowTrait, rowFastener);
      }
    }
  }

  protected createRowView(rowController: RowController): RowView | null {
    return rowController.row.createView();
  }

  protected initRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected attachRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected detachRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    rowView.remove();
  }

  protected willSetRowView(newRowView: RowView | null, oldRowView: RowView | null,
                           rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetRowView !== void 0) {
        observer.controllerWillSetRowView(newRowView, oldRowView, rowFastener);
      }
    }
  }

  protected onSetRowView(newRowView: RowView | null, oldRowView: RowView | null,
                         rowFastener: ControllerFastener<this, RowController>): void {
    if (oldRowView !== null) {
      this.detachRowView(oldRowView, rowFastener);
    }
    if (newRowView !== null) {
      this.attachRowView(newRowView, rowFastener);
      this.initRowView(newRowView, rowFastener);
    }
  }

  protected didSetRowView(newRowView: RowView | null, oldRowView: RowView | null,
                          rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetRowView !== void 0) {
        observer.controllerDidSetRowView(newRowView, oldRowView, rowFastener);
      }
    }
  }

  protected initLeafTrait(leafTrait: LeafTrait | null, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected attachLeafTrait(leafTrait: LeafTrait | null, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected detachLeafTrait(leafTrait: LeafTrait | null, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected willSetLeafTrait(newLeafTrait: LeafTrait | null, oldLeafTrait: LeafTrait | null,
                             rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetLeafTrait !== void 0) {
        observer.controllerWillSetLeafTrait(newLeafTrait, oldLeafTrait, rowFastener);
      }
    }
  }

  protected onSetLeafTrait(newLeafTrait: LeafTrait | null, oldLeafTrait: LeafTrait | null,
                           rowFastener: ControllerFastener<this, RowController>): void {
    if (oldLeafTrait !== null) {
      this.detachLeafTrait(oldLeafTrait, rowFastener);
    }
    if (newLeafTrait !== null) {
      this.attachLeafTrait(newLeafTrait, rowFastener);
      this.initLeafTrait(newLeafTrait, rowFastener);
    }
  }

  protected didSetLeafTrait(newLeafTrait: LeafTrait | null, oldLeafTrait: LeafTrait | null,
                            rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetLeafTrait !== void 0) {
        observer.controllerDidSetLeafTrait(newLeafTrait, oldLeafTrait, rowFastener);
      }
    }
  }

  protected initLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected attachLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected detachLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected willSetLeafView(newLeafView: LeafView | null, oldLeafView: LeafView | null,
                            rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetLeafView !== void 0) {
        observer.controllerWillSetLeafView(newLeafView, oldLeafView, rowFastener);
      }
    }
  }

  protected onSetLeafView(newLeafView: LeafView | null, oldLeafView: LeafView | null,
                          rowFastener: ControllerFastener<this, RowController>): void {
    if (oldLeafView !== null) {
      this.detachLeafView(oldLeafView, rowFastener);
    }
    if (newLeafView !== null) {
      this.attachLeafView(newLeafView, rowFastener);
      this.initLeafView(newLeafView, rowFastener);
    }
  }

  protected didSetLeafView(newLeafView: LeafView | null, oldLeafView: LeafView | null,
                           rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetLeafView !== void 0) {
        observer.controllerDidSetLeafView(newLeafView, oldLeafView, rowFastener);
      }
    }
  }

  protected willHighlightLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillHighlightLeafView !== void 0) {
        observer.controllerWillHighlightLeafView(leafView, rowFastener);
      }
    }
  }

  protected onHighlightLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didHighlightLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidHighlightLeafView !== void 0) {
        observer.controllerDidHighlightLeafView(leafView, rowFastener);
      }
    }
  }

  protected willUnhighlightLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillUnhighlightLeafView !== void 0) {
        observer.controllerWillUnhighlightLeafView(leafView, rowFastener);
      }
    }
  }

  protected onUnhighlightLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didUnhighlightLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidUnhighlightLeafView !== void 0) {
        observer.controllerDidUnhighlightLeafView(leafView, rowFastener);
      }
    }
  }

  protected onEnterLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didEnterLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidEnterLeafView !== void 0) {
        observer.controllerDidEnterLeafView(leafView, rowFastener);
      }
    }
  }

  protected onLeaveLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didLeaveLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidLeaveLeafView !== void 0) {
        observer.controllerDidLeaveLeafView(leafView, rowFastener);
      }
    }
  }

  protected onPressLeafView(input: PositionGestureInput, event: Event | null, leafView: LeafView,
                             rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didPressLeafView(input: PositionGestureInput, event: Event | null, leafView: LeafView,
                             rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidPressLeafView !== void 0) {
        observer.controllerDidPressLeafView(input, event, leafView, rowFastener);
      }
    }
  }

  protected onLongPressLeafView(input: PositionGestureInput, leafView: LeafView,
                                rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didLongPressLeafView(input: PositionGestureInput, leafView: LeafView,
                                 rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidLongPressLeafView !== void 0) {
        observer.controllerDidLongPressLeafView(input, leafView, rowFastener);
      }
    }
  }

  protected initCell(cellController: CellController, cellFastener: ControllerFastener<RowController, CellController>,
                     rowFastener: ControllerFastener<this, RowController>): void {
    const cellTrait = cellController.cell.trait;
    if (cellTrait !== null) {
      this.initCellTrait(cellTrait, cellFastener, rowFastener);
    }
    const cellView = cellController.cell.view;
    if (cellView !== null) {
      this.initCellView(cellView, cellFastener, rowFastener);
    }
  }

  protected attachCell(cellController: CellController, cellFastener: ControllerFastener<RowController, CellController>,
                       rowFastener: ControllerFastener<this, RowController>): void {
    const cellTrait = cellController.cell.trait;
    if (cellTrait !== null) {
      this.attachCellTrait(cellTrait, cellFastener, rowFastener);
    }
    const cellView = cellController.cell.view;
    if (cellView !== null) {
      this.attachCellView(cellView, cellFastener, rowFastener);
    }
  }

  protected detachCell(cellController: CellController, cellFastener: ControllerFastener<RowController, CellController>,
                       rowFastener: ControllerFastener<this, RowController>): void {
    const cellTrait = cellController.cell.trait;
    if (cellTrait !== null) {
      this.detachCellTrait(cellTrait, cellFastener, rowFastener);
    }
    const cellView = cellController.cell.view;
    if (cellView !== null) {
      this.detachCellView(cellView, cellFastener, rowFastener);
    }
  }

  protected willSetCell(newCellController: CellController | null, oldCellController: CellController | null,
                        cellFastener: ControllerFastener<RowController, CellController>,
                        rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetCell !== void 0) {
        observer.controllerWillSetCell(newCellController, oldCellController, cellFastener, rowFastener);
      }
    }
  }

  protected onSetCell(newCellController: CellController | null, oldCellController: CellController | null,
                      cellFastener: ControllerFastener<RowController, CellController>,
                      rowFastener: ControllerFastener<this, RowController>): void {
    if (oldCellController !== null) {
      this.detachCell(oldCellController, cellFastener, rowFastener);
    }
    if (newCellController !== null) {
      this.attachCell(newCellController, cellFastener, rowFastener);
      this.initCell(newCellController, cellFastener, rowFastener);
    }
  }

  protected didSetCell(newCellController: CellController | null, oldCellController: CellController | null,
                       cellFastener: ControllerFastener<RowController, CellController>,
                       rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetCell !== void 0) {
        observer.controllerDidSetCell(newCellController, oldCellController, cellFastener, rowFastener);
      }
    }
  }

  protected initCellTrait(cellTrait: CellTrait | null, cellFastener: ControllerFastener<RowController, CellController>,
                          rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected attachCellTrait(cellTrait: CellTrait | null, cellFastener: ControllerFastener<RowController, CellController>,
                            rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected detachCellTrait(cellTrait: CellTrait | null, cellFastener: ControllerFastener<RowController, CellController>,
                            rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected willSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                             cellFastener: ControllerFastener<RowController, CellController>,
                             rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetCellTrait !== void 0) {
        observer.controllerWillSetCellTrait(newCellTrait, oldCellTrait, cellFastener, rowFastener);
      }
    }
  }

  protected onSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                           cellFastener: ControllerFastener<RowController, CellController>,
                           rowFastener: ControllerFastener<this, RowController>): void {
    if (oldCellTrait !== null) {
      this.detachCellTrait(oldCellTrait, cellFastener, rowFastener);
    }
    if (newCellTrait !== null) {
      this.attachCellTrait(oldCellTrait, cellFastener, rowFastener);
      this.initCellTrait(newCellTrait, cellFastener, rowFastener);
    }
  }

  protected didSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                            cellFastener: ControllerFastener<RowController, CellController>,
                            rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetCellTrait !== void 0) {
        observer.controllerDidSetCellTrait(newCellTrait, oldCellTrait, cellFastener, rowFastener);
      }
    }
  }

  protected initCellView(cellView: CellView, cellFastener: ControllerFastener<RowController, CellController>,
                         rowFastener: ControllerFastener<this, RowController>): void {
    if (cellView instanceof TextCellView) {
      const cellContentView = cellView.content.view;
      if (cellContentView !== null) {
        this.initCellContentView(cellContentView, cellFastener, rowFastener);
      }
    }
  }

  protected attachCellView(cellView: CellView, cellFastener: ControllerFastener<RowController, CellController>,
                           rowFastener: ControllerFastener<this, RowController>): void {
    if (cellView instanceof TextCellView) {
      const cellContentView = cellView.content.view;
      if (cellContentView !== null) {
        this.attachCellContentView(cellContentView, cellFastener, rowFastener);
      }
    }
  }

  protected detachCellView(cellView: CellView, cellFastener: ControllerFastener<RowController, CellController>,
                           rowFastener: ControllerFastener<this, RowController>): void {
    if (cellView instanceof TextCellView) {
      const cellContentView = cellView.content.view;
      if (cellContentView !== null) {
        this.detachCellContentView(cellContentView, cellFastener, rowFastener);
      }
    }
  }

  protected willSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                            cellFastener: ControllerFastener<RowController, CellController>,
                            rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetCellView !== void 0) {
        observer.controllerWillSetCellView(newCellView, oldCellView, cellFastener, rowFastener);
      }
    }
  }

  protected onSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                          cellFastener: ControllerFastener<RowController, CellController>,
                          rowFastener: ControllerFastener<this, RowController>): void {
    if (oldCellView !== null) {
      this.detachCellView(oldCellView, cellFastener, rowFastener);
    }
    if (newCellView !== null) {
      this.attachCellView(newCellView, cellFastener, rowFastener);
      this.initCellView(newCellView, cellFastener, rowFastener);
    }
  }

  protected didSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                           cellFastener: ControllerFastener<RowController, CellController>,
                           rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetCellView !== void 0) {
        observer.controllerDidSetCellView(newCellView, oldCellView, cellFastener, rowFastener);
      }
    }
  }

  protected initCellContentView(cellContentView: HtmlView, cellFastener: ControllerFastener<RowController, CellController>,
                                rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected attachCellContentView(cellContentView: HtmlView, cellFastener: ControllerFastener<RowController, CellController>,
                                  rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected detachCellContentView(cellContentView: HtmlView, cellFastener: ControllerFastener<RowController, CellController>,
                                  rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected willSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                   cellFastener: ControllerFastener<RowController, CellController>,
                                   rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetCellContentView !== void 0) {
        observer.controllerWillSetCellContentView(newCellContentView, oldCellContentView, cellFastener, rowFastener);
      }
    }
  }

  protected onSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                 cellFastener: ControllerFastener<RowController, CellController>,
                                 rowFastener: ControllerFastener<this, RowController>): void {
    if (oldCellContentView !== null) {
      this.detachCellContentView(oldCellContentView, cellFastener, rowFastener);
    }
    if (newCellContentView !== null) {
      this.attachCellContentView(newCellContentView, cellFastener, rowFastener);
      this.initCellContentView(newCellContentView, cellFastener, rowFastener);
    }
  }

  protected didSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                  cellFastener: ControllerFastener<RowController, CellController>,
                                  rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetCellContentView !== void 0) {
        observer.controllerDidSetCellContentView(newCellContentView, oldCellContentView, cellFastener, rowFastener);
      }
    }
  }

  protected willSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null,
                            cellFastener: ControllerFastener<RowController, CellController>,
                            rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetCellIcon !== void 0) {
        observer.controllerWillSetCellIcon(newCellIcon, oldCellIcon, cellFastener, rowFastener);
      }
    }
  }

  protected onSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null,
                          cellFastener: ControllerFastener<RowController, CellController>,
                          rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null,
                           cellFastener: ControllerFastener<RowController, CellController>,
                           rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetCellIcon !== void 0) {
        observer.controllerDidSetCellIcon(newCellIcon, oldCellIcon, cellFastener, rowFastener);
      }
    }
  }

  protected initTree(treeController: TableController, rowFastener: ControllerFastener<this, RowController>): void {
    const treeTrait = treeController.table.trait;
    if (treeTrait !== null) {
      this.initTreeTrait(treeTrait, rowFastener);
    }
    const treeView = treeController.table.view;
    if (treeView !== null) {
      this.initTreeView(treeView, rowFastener);
    }
  }

  protected attachTree(treeController: TableController, rowFastener: ControllerFastener<this, RowController>): void {
    const treeTrait = treeController.table.trait;
    if (treeTrait !== null) {
      this.attachTreeTrait(treeTrait, rowFastener);
    }
    const treeView = treeController.table.view;
    if (treeView !== null) {
      this.attachTreeView(treeView, rowFastener);
    }
  }

  protected detachTree(treeController: TableController, rowFastener: ControllerFastener<this, RowController>): void {
    const treeTrait = treeController.table.trait;
    if (treeTrait !== null) {
      this.detachTreeTrait(treeTrait, rowFastener);
    }
    const treeView = treeController.table.view;
    if (treeView !== null) {
      this.detachTreeView(treeView, rowFastener);
    }
  }

  protected willSetTree(newTreeController: TableController | null, oldTreeController: TableController | null,
                        rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetTree !== void 0) {
        observer.controllerWillSetTree(newTreeController, oldTreeController, rowFastener);
      }
    }
  }

  protected onSetTree(newTreeController: TableController | null, oldTreeController: TableController | null,
                      rowFastener: ControllerFastener<this, RowController>): void {
    if (oldTreeController !== null) {
      this.detachTree(oldTreeController, rowFastener);
    }
    if (newTreeController !== null) {
      this.attachTree(newTreeController, rowFastener);
      this.initTree(newTreeController, rowFastener);
    }
  }

  protected didSetTree(newTreeController: TableController | null, oldTreeController: TableController | null,
                       rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetTree !== void 0) {
        observer.controllerDidSetTree(newTreeController, oldTreeController, rowFastener);
      }
    }
  }

  protected initTreeTrait(treeTrait: TableTrait | null, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected attachTreeTrait(treeTrait: TableTrait | null, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected detachTreeTrait(treeTrait: TableTrait | null, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected willSetTreeTrait(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null,
                             rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetTreeTrait !== void 0) {
        observer.controllerWillSetTreeTrait(newTreeTrait, oldTreeTrait, rowFastener);
      }
    }
  }

  protected onSetTreeTrait(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null,
                           rowFastener: ControllerFastener<this, RowController>): void {
    if (oldTreeTrait !== null) {
      this.detachTreeTrait(oldTreeTrait, rowFastener);
    }
    if (newTreeTrait !== null) {
      this.attachTreeTrait(oldTreeTrait, rowFastener);
      this.initTreeTrait(newTreeTrait, rowFastener);
    }
  }

  protected didSetTreeTrait(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null,
                            rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetTreeTrait !== void 0) {
        observer.controllerDidSetTreeTrait(newTreeTrait, oldTreeTrait, rowFastener);
      }
    }
  }

  protected initTreeView(treeView: TableView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected attachTreeView(treeView: TableView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected detachTreeView(treeView: TableView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected willSetTreeView(newTreeView: TableView | null, oldTreeView: TableView | null,
                            rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetTreeView !== void 0) {
        observer.controllerWillSetTreeView(newTreeView, oldTreeView, rowFastener);
      }
    }
  }

  protected onSetTreeView(newTreeView: TableView | null, oldTreeView: TableView | null,
                          rowFastener: ControllerFastener<this, RowController>): void {
    if (oldTreeView !== null) {
      this.detachTreeView(oldTreeView, rowFastener);
    }
    if (newTreeView !== null) {
      this.attachTreeView(newTreeView, rowFastener);
      this.initTreeView(newTreeView, rowFastener);
    }
  }

  protected didSetTreeView(newTreeView: TableView | null, oldTreeView: TableView | null,
                           rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetTreeView !== void 0) {
        observer.controllerDidSetTreeView(newTreeView, oldTreeView, rowFastener);
      }
    }
  }

  protected willExpandRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillExpandRowView !== void 0) {
        observer.controllerWillExpandRowView(rowView, rowFastener);
      }
    }
  }

  protected onExpandRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didExpandRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidExpandRowView !== void 0) {
        observer.controllerDidExpandRowView(rowView, rowFastener);
      }
    }
  }

  protected willCollapseRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillCollapseRowView !== void 0) {
        observer.controllerWillCollapseRowView(rowView, rowFastener);
      }
    }
  }

  protected onCollapseRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didCollapseRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidCollapseRowView !== void 0) {
        observer.controllerDidCollapseRowView(rowView, rowFastener);
      }
    }
  }

  /** @internal */
  static RowFastener = ControllerFastener.define<TableController, RowController, never, ObserverType<RowController>>({
    extends: null,
    type: RowController,
    child: false,
    observes: true,
    willSetController(newRowController: RowController | null, oldRowController: RowController | null): void {
      this.owner.willSetRow(newRowController, oldRowController, this);
    },
    onSetController(newRowController: RowController | null, oldRowController: RowController | null): void {
      this.owner.onSetRow(newRowController, oldRowController, this);
    },
    didSetController(newRowController: RowController | null, oldRowController: RowController | null): void {
      this.owner.didSetRow(newRowController, oldRowController, this);
    },
    controllerWillSetRowTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null): void {
      this.owner.willSetRowTrait(newRowTrait, oldRowTrait, this);
    },
    controllerDidSetRowTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null): void {
      this.owner.onSetRowTrait(newRowTrait, oldRowTrait, this);
      this.owner.didSetRowTrait(newRowTrait, oldRowTrait, this);
    },
    controllerWillSetRowView(newRowView: RowView | null, oldRowView: RowView | null): void {
      this.owner.willSetRowView(newRowView, oldRowView, this);
    },
    controllerDidSetRowView(newRowView: RowView | null, oldRowView: RowView | null): void {
      this.owner.onSetRowView(newRowView, oldRowView, this);
      this.owner.didSetRowView(newRowView, oldRowView, this);
    },
    controllerWillSetLeafTrait(newLeafTrait: LeafTrait | null, oldLeafTrait: LeafTrait | null): void {
      this.owner.willSetLeafTrait(newLeafTrait, oldLeafTrait, this);
    },
    controllerDidSetLeafTrait(newLeafTrait: LeafTrait | null, oldLeafTrait: LeafTrait | null): void {
      this.owner.onSetLeafTrait(newLeafTrait, oldLeafTrait, this);
      this.owner.didSetLeafTrait(newLeafTrait, oldLeafTrait, this);
    },
    controllerWillSetLeafView(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
      this.owner.willSetLeafView(newLeafView, oldLeafView, this);
    },
    controllerDidSetLeafView(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
      this.owner.onSetLeafView(newLeafView, oldLeafView, this);
      this.owner.didSetLeafView(newLeafView, oldLeafView, this);
    },
    controllerWillHighlightLeafView(leafView: LeafView): void {
      this.owner.willHighlightLeafView(leafView, this);
      this.owner.onHighlightLeafView(leafView, this);
    },
    controllerDidHighlightLeafView(leafView: LeafView): void {
      this.owner.didHighlightLeafView(leafView, this);
    },
    controllerWillUnhighlightLeafView(leafView: LeafView): void {
      this.owner.willUnhighlightLeafView(leafView, this);
    },
    controllerDidUnhighlightLeafView(leafView: LeafView): void {
      this.owner.onUnhighlightLeafView(leafView, this);
      this.owner.didUnhighlightLeafView(leafView, this);
    },
    controllerDidEnterLeafView(leafView: LeafView): void {
      this.owner.onEnterLeafView(leafView, this);
      this.owner.didEnterLeafView(leafView, this);
    },
    controllerDidLeaveLeafView(leafView: LeafView): void {
      this.owner.onLeaveLeafView(leafView, this);
      this.owner.didLeaveLeafView(leafView, this);
    },
    controllerDidPressLeafView(input: PositionGestureInput, event: Event | null, leafView: LeafView): void {
      this.owner.onPressLeafView(input, event, leafView, this);
      this.owner.didPressLeafView(input, event, leafView, this);
    },
    controllerDidLongPressLeafView(input: PositionGestureInput, leafView: LeafView): void {
      this.owner.onLongPressLeafView(input, leafView, this);
      this.owner.didLongPressLeafView(input, leafView, this);
    },
    controllerWillSetCell(newCellController: CellController | null, oldCellController: CellController | null,
                          cellFastener: ControllerFastener<RowController, CellController>): void {
      this.owner.willSetCell(newCellController, oldCellController, cellFastener, this);
    },
    controllerDidSetCell(newCellController: CellController | null, oldCellController: CellController | null,
                         cellFastener: ControllerFastener<RowController, CellController>): void {
      this.owner.onSetCell(newCellController, oldCellController, cellFastener, this);
      this.owner.didSetCell(newCellController, oldCellController, cellFastener, this);
    },
    controllerWillSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                               cellFastener: ControllerFastener<RowController, CellController>): void {
      this.owner.willSetCellTrait(newCellTrait, oldCellTrait, cellFastener, this);
    },
    controllerDidSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                              cellFastener: ControllerFastener<RowController, CellController>): void {
      this.owner.onSetCellTrait(newCellTrait, oldCellTrait, cellFastener, this);
      this.owner.didSetCellTrait(newCellTrait, oldCellTrait, cellFastener, this);
    },
    controllerWillSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                              cellFastener: ControllerFastener<RowController, CellController>): void {
      this.owner.willSetCellView(newCellView, oldCellView, cellFastener, this);
    },
    controllerDidSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                             cellFastener: ControllerFastener<RowController, CellController>): void {
      this.owner.onSetCellView(newCellView, oldCellView, cellFastener, this);
      this.owner.didSetCellView(newCellView, oldCellView, cellFastener, this);
    },
    controllerWillSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                     cellFastener: ControllerFastener<RowController, CellController>): void {
      this.owner.willSetCellContentView(newCellContentView, oldCellContentView, cellFastener, this);
    },
    controllerDidSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                    cellFastener: ControllerFastener<RowController, CellController>): void {
      this.owner.onSetCellContentView(newCellContentView, oldCellContentView, cellFastener, this);
      this.owner.didSetCellContentView(newCellContentView, oldCellContentView, cellFastener, this);
    },
    controllerWillSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null,
                              cellFastener: ControllerFastener<RowController, CellController>): void {
      this.owner.willSetCellIcon(newCellIcon, oldCellIcon, cellFastener, this);
    },
    controllerDidSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null,
                             cellFastener: ControllerFastener<RowController, CellController>): void {
      this.owner.onSetCellIcon(newCellIcon, oldCellIcon, cellFastener, this);
      this.owner.didSetCellIcon(newCellIcon, oldCellIcon, cellFastener, this);
    },
    controllerWillSetTree(newTreeController: TableController | null, oldTreeController: TableController | null): void {
      this.owner.willSetTree(newTreeController, oldTreeController, this);
    },
    controllerDidSetTree(newTreeController: TableController | null, oldTreeController: TableController | null): void {
      this.owner.onSetTree(newTreeController, oldTreeController, this);
      this.owner.didSetTree(newTreeController, oldTreeController, this);
    },
    controllerWillSetTreeTrait(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null): void {
      this.owner.willSetTreeTrait(newTreeTrait, oldTreeTrait, this);
    },
    controllerDidSetTreeTrait(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null): void {
      this.owner.onSetTreeTrait(newTreeTrait, oldTreeTrait, this);
      this.owner.didSetTreeTrait(newTreeTrait, oldTreeTrait, this);
    },
    controllerWillSetTreeView(newTreeView: TableView | null, oldTreeView: TableView | null): void {
      this.owner.willSetTreeView(newTreeView, oldTreeView, this);
    },
    controllerDidSetTreeView(newTreeView: TableView | null, oldTreeView: TableView | null): void {
      this.owner.onSetTreeView(newTreeView, oldTreeView, this);
      this.owner.didSetTreeView(newTreeView, oldTreeView, this);
    },
    controllerWillExpandRowView(rowView: RowView): void {
      this.owner.willExpandRowView(rowView, this);
      this.owner.onExpandRowView(rowView, this);
    },
    controllerDidExpandRowView(rowView: RowView): void {
      this.owner.didExpandRowView(rowView, this);
    },
    controllerWillCollapseRowView(rowView: RowView): void {
      this.owner.willCollapseRowView(rowView, this);
    },
    controllerDidCollapseRowView(rowView: RowView): void {
      this.owner.onCollapseRowView(rowView, this);
      this.owner.didCollapseRowView(rowView, this);
    },
  });

  protected createRowFastener(rowController: RowController): ControllerFastener<this, RowController> {
    return TableController.RowFastener.create(this, rowController.key ?? "row");
  }

  /** @internal */
  readonly rowFasteners: ReadonlyArray<ControllerFastener<this, RowController>>;

  protected getRowFastener(rowTrait: RowTrait): ControllerFastener<this, RowController> | null {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      const rowController = rowFastener.controller;
      if (rowController !== null && rowController.row.trait === rowTrait) {
        return rowFastener;
      }
    }
    return null;
  }

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

  protected detectHeaderController(controller: Controller): HeaderController | null {
    return controller instanceof HeaderController ? controller : null;
  }

  protected detectRowController(controller: Controller): RowController | null {
    return controller instanceof RowController ? controller : null;
  }

  protected override onInsertChild(childController: Controller, targetController: Controller | null): void {
    super.onInsertChild(childController, targetController);
    const headerController = this.detectHeaderController(childController);
    if (headerController !== null) {
      this.header.setController(headerController, targetController);
    }
    const rowController = this.detectRowController(childController);
    if (rowController !== null) {
      this.insertRow(rowController, targetController);
    }
  }

  protected override onRemoveChild(childController: Controller): void {
    super.onRemoveChild(childController);
    const headerController = this.detectHeaderController(childController);
    if (headerController !== null) {
      this.header.setController(null);
    }
    const rowController = this.detectRowController(childController);
    if (rowController !== null) {
      this.removeRow(rowController);
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
}
