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

import type {Trait} from "@swim/model";
import {View, PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import {
  Controller,
  ControllerObserverType,
  ControllerViewTrait,
  ControllerFastener,
  CompositeController,
} from "@swim/controller";
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

export class TableController extends CompositeController {
  constructor() {
    super();
    this.colFasteners = [];
    this.rowFasteners = [];
  }

  override readonly controllerObservers!: ReadonlyArray<TableControllerObserver>;

  protected layoutTable(tableLayout: TableLayout, tableView: TableView): void {
    tableView.layout.setState(tableLayout, View.Intrinsic);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTableTrait !== void 0) {
        controllerObserver.controllerWillSetTableTrait(newTableTrait, oldTableTrait, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTableTrait !== void 0) {
        controllerObserver.controllerDidSetTableTrait(newTableTrait, oldTableTrait, this);
      }
    }
  }

  protected willSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTableLayout !== void 0) {
        controllerObserver.controllerWillSetTableLayout(newTableLayout, oldTableLayout, this);
      }
    }
  }

  protected onSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
    // hook
  }

  protected didSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTableLayout !== void 0) {
        controllerObserver.controllerDidSetTableLayout(newTableLayout, oldTableLayout, this);
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
        if (rowView !== null && rowView.parentView === null) {
          rowController.row.injectView(tableView);
        }
      }
    }
  }

  protected detachTableView(tableView: TableView): void {
    // hook
  }

  protected willSetTableView(newTableView: TableView | null, oldTableView: TableView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTableView !== void 0) {
        controllerObserver.controllerWillSetTableView(newTableView, oldTableView, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTableView !== void 0) {
        controllerObserver.controllerDidSetTableView(newTableView, oldTableView, this);
      }
    }
  }

  /** @hidden */
  static TableFastener = ControllerViewTrait.define<TableController, TableView, TableTrait>({
    viewType: TableView,
    observeView: true,
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
    traitType: TableTrait,
    observeTrait: true,
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
  });

  @ControllerViewTrait<TableController, TableView, TableTrait>({
    extends: TableController.TableFastener,
  })
  readonly table!: ControllerViewTrait<this, TableView, TableTrait>;

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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetHeader !== void 0) {
        controllerObserver.controllerWillSetHeader(newHeaderController, oldHeaderController, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetHeader !== void 0) {
        controllerObserver.controllerDidSetHeader(newHeaderController, oldHeaderController, this);
      }
    }
  }

  protected insertHeaderTrait(headerTrait: HeaderTrait, targetTrait: Trait | null = null): void {
    const childControllers = this.childControllers;
    let targetController: HeaderController | null = null;
    for (let i = 0, n = childControllers.length; i < n; i += 1) {
      const childController = childControllers[i]!;
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
      this.insertChildController(headerController, targetController);
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
    const childControllers = this.childControllers;
    for (let i = 0, n = childControllers.length; i < n; i += 1) {
      const childController = childControllers[i]!;
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetHeaderTrait !== void 0) {
        controllerObserver.controllerWillSetHeaderTrait(newHeaderTrait, oldHeaderTrait, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetHeaderTrait !== void 0) {
        controllerObserver.controllerDidSetHeaderTrait(newHeaderTrait, oldHeaderTrait, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetHeaderView !== void 0) {
        controllerObserver.controllerWillSetHeaderView(newHeaderView, oldHeaderView, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetHeaderView !== void 0) {
        controllerObserver.controllerDidSetHeaderView(newHeaderView, oldHeaderView, this);
      }
    }
  }

  /** @hidden */
  static HeaderFastener = ControllerFastener.define<TableController, HeaderController>({
    type: HeaderController,
    observe: true,
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
    if (this.isMounted()) {
      colFastener.mount();
    }
  }

  removeCol(colController: ColController): void {
    const colFasteners = this.colFasteners as ControllerFastener<this, ColController>[];
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      if (colFastener.controller === colController) {
        colFastener.setController(null);
        if (this.isMounted()) {
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetCol !== void 0) {
        controllerObserver.controllerWillSetCol(newColController, oldColController, colFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetCol !== void 0) {
        controllerObserver.controllerDidSetCol(newColController, oldColController, colFastener);
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
      this.insertChildController(colController, targetController);
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
        if (this.isMounted()) {
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetColTrait !== void 0) {
        controllerObserver.controllerWillSetColTrait(newColTrait, oldColTrait, colFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetColTrait !== void 0) {
        controllerObserver.controllerDidSetColTrait(newColTrait, oldColTrait, colFastener);
      }
    }
  }

  protected willSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                             colFastener: ControllerFastener<this, ColController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetColLayout !== void 0) {
        controllerObserver.controllerWillSetColLayout(newColLayout, oldColLayout, colFastener);
      }
    }
  }

  protected onSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                           colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected didSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                            colFastener: ControllerFastener<this, ColController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetColLayout !== void 0) {
        controllerObserver.controllerDidSetColLayout(newColLayout, oldColLayout, colFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetColView !== void 0) {
        controllerObserver.controllerWillSetColView(newColView, oldColView, colFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetColView !== void 0) {
        controllerObserver.controllerDidSetColView(newColView, oldColView, colFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetColLabelView !== void 0) {
        controllerObserver.controllerWillSetColLabelView(newColLabelView, oldColLabelView, colFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetColLabelView !== void 0) {
        controllerObserver.controllerDidSetColLabelView(newColLabelView, oldColLabelView, colFastener);
      }
    }
  }

  /** @hidden */
  static ColFastener = ControllerFastener.define<TableController, ColController>({
    type: ColController,
    child: false,
    observe: true,
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
    return new TableController.ColFastener(this, colController.key, "col");
  }

  /** @hidden */
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
    if (this.isMounted()) {
      rowFastener.mount();
    }
  }

  removeRow(rowController: RowController): void {
    const rowFasteners = this.rowFasteners as ControllerFastener<this, RowController>[];
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      if (rowFastener.controller === rowController) {
        rowFastener.setController(null);
        if (this.isMounted()) {
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetRow !== void 0) {
        controllerObserver.controllerWillSetRow(newRowController, oldRowController, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetRow !== void 0) {
        controllerObserver.controllerDidSetRow(newRowController, oldRowController, rowFastener);
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
      this.insertChildController(rowController, targetController);
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
        if (this.isMounted()) {
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetRowTrait !== void 0) {
        controllerObserver.controllerWillSetRowTrait(newRowTrait, oldRowTrait, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetRowTrait !== void 0) {
        controllerObserver.controllerDidSetRowTrait(newRowTrait, oldRowTrait, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetRowView !== void 0) {
        controllerObserver.controllerWillSetRowView(newRowView, oldRowView, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetRowView !== void 0) {
        controllerObserver.controllerDidSetRowView(newRowView, oldRowView, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetLeafTrait !== void 0) {
        controllerObserver.controllerWillSetLeafTrait(newLeafTrait, oldLeafTrait, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetLeafTrait !== void 0) {
        controllerObserver.controllerDidSetLeafTrait(newLeafTrait, oldLeafTrait, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetLeafView !== void 0) {
        controllerObserver.controllerWillSetLeafView(newLeafView, oldLeafView, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetLeafView !== void 0) {
        controllerObserver.controllerDidSetLeafView(newLeafView, oldLeafView, rowFastener);
      }
    }
  }

  protected willHighlightLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillHighlightLeafView !== void 0) {
        controllerObserver.controllerWillHighlightLeafView(leafView, rowFastener);
      }
    }
  }

  protected onHighlightLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didHighlightLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidHighlightLeafView !== void 0) {
        controllerObserver.controllerDidHighlightLeafView(leafView, rowFastener);
      }
    }
  }

  protected willUnhighlightLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillUnhighlightLeafView !== void 0) {
        controllerObserver.controllerWillUnhighlightLeafView(leafView, rowFastener);
      }
    }
  }

  protected onUnhighlightLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didUnhighlightLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidUnhighlightLeafView !== void 0) {
        controllerObserver.controllerDidUnhighlightLeafView(leafView, rowFastener);
      }
    }
  }

  protected onEnterLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didEnterLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidEnterLeafView !== void 0) {
        controllerObserver.controllerDidEnterLeafView(leafView, rowFastener);
      }
    }
  }

  protected onLeaveLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didLeaveLeafView(leafView: LeafView, rowFastener: ControllerFastener<this, RowController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidLeaveLeafView !== void 0) {
        controllerObserver.controllerDidLeaveLeafView(leafView, rowFastener);
      }
    }
  }

  protected onPressLeafView(input: PositionGestureInput, event: Event | null, leafView: LeafView,
                             rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didPressLeafView(input: PositionGestureInput, event: Event | null, leafView: LeafView,
                             rowFastener: ControllerFastener<this, RowController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidPressLeafView !== void 0) {
        controllerObserver.controllerDidPressLeafView(input, event, leafView, rowFastener);
      }
    }
  }

  protected onLongPressLeafView(input: PositionGestureInput, leafView: LeafView,
                                rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didLongPressLeafView(input: PositionGestureInput, leafView: LeafView,
                                 rowFastener: ControllerFastener<this, RowController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidLongPressLeafView !== void 0) {
        controllerObserver.controllerDidLongPressLeafView(input, leafView, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetCell !== void 0) {
        controllerObserver.controllerWillSetCell(newCellController, oldCellController, cellFastener, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetCell !== void 0) {
        controllerObserver.controllerDidSetCell(newCellController, oldCellController, cellFastener, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetCellTrait !== void 0) {
        controllerObserver.controllerWillSetCellTrait(newCellTrait, oldCellTrait, cellFastener, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetCellTrait !== void 0) {
        controllerObserver.controllerDidSetCellTrait(newCellTrait, oldCellTrait, cellFastener, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetCellView !== void 0) {
        controllerObserver.controllerWillSetCellView(newCellView, oldCellView, cellFastener, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetCellView !== void 0) {
        controllerObserver.controllerDidSetCellView(newCellView, oldCellView, cellFastener, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetCellContentView !== void 0) {
        controllerObserver.controllerWillSetCellContentView(newCellContentView, oldCellContentView, cellFastener, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetCellContentView !== void 0) {
        controllerObserver.controllerDidSetCellContentView(newCellContentView, oldCellContentView, cellFastener, rowFastener);
      }
    }
  }

  protected willSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null,
                            cellFastener: ControllerFastener<RowController, CellController>,
                            rowFastener: ControllerFastener<this, RowController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetCellIcon !== void 0) {
        controllerObserver.controllerWillSetCellIcon(newCellIcon, oldCellIcon, cellFastener, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetCellIcon !== void 0) {
        controllerObserver.controllerDidSetCellIcon(newCellIcon, oldCellIcon, cellFastener, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTree !== void 0) {
        controllerObserver.controllerWillSetTree(newTreeController, oldTreeController, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTree !== void 0) {
        controllerObserver.controllerDidSetTree(newTreeController, oldTreeController, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTreeTrait !== void 0) {
        controllerObserver.controllerWillSetTreeTrait(newTreeTrait, oldTreeTrait, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTreeTrait !== void 0) {
        controllerObserver.controllerDidSetTreeTrait(newTreeTrait, oldTreeTrait, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTreeView !== void 0) {
        controllerObserver.controllerWillSetTreeView(newTreeView, oldTreeView, rowFastener);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTreeView !== void 0) {
        controllerObserver.controllerDidSetTreeView(newTreeView, oldTreeView, rowFastener);
      }
    }
  }

  protected willExpandRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillExpandRowView !== void 0) {
        controllerObserver.controllerWillExpandRowView(rowView, rowFastener);
      }
    }
  }

  protected onExpandRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didExpandRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidExpandRowView !== void 0) {
        controllerObserver.controllerDidExpandRowView(rowView, rowFastener);
      }
    }
  }

  protected willCollapseRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillCollapseRowView !== void 0) {
        controllerObserver.controllerWillCollapseRowView(rowView, rowFastener);
      }
    }
  }

  protected onCollapseRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    // hook
  }

  protected didCollapseRowView(rowView: RowView, rowFastener: ControllerFastener<this, RowController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidCollapseRowView !== void 0) {
        controllerObserver.controllerDidCollapseRowView(rowView, rowFastener);
      }
    }
  }

  /** @hidden */
  static RowFastener = ControllerFastener.define<TableController, RowController, never, ControllerObserverType<RowController>>({
    type: RowController,
    child: false,
    observe: true,
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
    return new TableController.RowFastener(this, rowController.key, "row");
  }

  /** @hidden */
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

  protected detectHeaderController(controller: Controller): HeaderController | null {
    return controller instanceof HeaderController ? controller : null;
  }

  protected detectRowController(controller: Controller): RowController | null {
    return controller instanceof RowController ? controller : null;
  }

  protected override onInsertChildController(childController: Controller, targetController: Controller | null): void {
    super.onInsertChildController(childController, targetController);
    const headerController = this.detectHeaderController(childController);
    if (headerController !== null) {
      this.header.setController(headerController, targetController);
    }
    const rowController = this.detectRowController(childController);
    if (rowController !== null) {
      this.insertRow(rowController, targetController);
    }
  }

  protected override onRemoveChildController(childController: Controller): void {
    super.onRemoveChildController(childController);
    const headerController = this.detectHeaderController(childController);
    if (headerController !== null) {
      this.header.setController(null);
    }
    const rowController = this.detectRowController(childController);
    if (rowController !== null) {
      this.removeRow(rowController);
    }
  }

  /** @hidden */
  protected override mountControllerFasteners(): void {
    super.mountControllerFasteners();
    this.mountColFasteners();
    this.mountRowFasteners();
  }

  /** @hidden */
  protected override unmountControllerFasteners(): void {
    this.unmountRowFasteners();
    this.unmountColFasteners();
    super.unmountControllerFasteners();
  }
}
