// Copyright 2015-2021 Swim.inc
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
import {Affinity, MemberFastenerClass} from "@swim/component";
import type {Trait} from "@swim/model";
import type {View} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import {Controller, TraitViewRef, TraitViewControllerRef, TraitViewControllerSet} from "@swim/controller";
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

/** @public */
export interface TableControllerHeaderExt {
  attachHeaderTrait(headerTrait: HeaderTrait, headerController: HeaderController): void;
  detachHeaderTrait(headerTrait: HeaderTrait, headerController: HeaderController): void;
  attachHeaderView(headerView: HeaderView, headerController: HeaderController): void;
  detachHeaderView(headerView: HeaderView, headerController: HeaderController): void;
}

/** @public */
export interface TableControllerColExt {
  attachColTrait(colTrait: ColTrait, colController: ColController): void;
  detachColTrait(colTrait: ColTrait, colController: ColController): void;
  attachColView(colView: ColView, colController: ColController): void;
  detachColView(colView: ColView, colController: ColController): void;
  attachColLabelView(colLabelView: HtmlView, colController: ColController): void;
  detachColLabelView(colLabelView: HtmlView, colController: ColController): void;
}

/** @public */
export interface TableControllerRowExt {
  attachRowTrait(rowTrait: RowTrait, rowController: RowController): void;
  detachRowTrait(rowTrait: RowTrait, rowController: RowController): void;
  attachRowView(rowView: RowView, rowController: RowController): void;
  detachRowView(rowView: RowView, rowController: RowController): void;
  attachLeafTrait(leafTrait: LeafTrait, rowController: RowController): void;
  detachLeafTrait(leafTrait: LeafTrait, rowController: RowController): void;
  attachLeafView(leafView: LeafView, rowController: RowController): void;
  detachLeafView(leafView: LeafView, rowController: RowController): void;
  attachCell(cellController: CellController, rowController: RowController): void;
  detachCell(cellController: CellController, rowController: RowController): void;
  attachCellTrait(cellTrait: CellTrait, cellController: CellController, rowController: RowController): void;
  detachCellTrait(cellTrait: CellTrait, cellController: CellController, rowController: RowController): void;
  attachCellView(cellView: CellView, cellController: CellController, rowController: RowController): void;
  detachCellView(cellView: CellView, cellController: CellController, rowController: RowController): void;
  attachCellContentView(cellContentView: HtmlView, cellController: CellController, rowController: RowController): void;
  detachCellContentView(cellContentView: HtmlView, cellController: CellController, rowController: RowController): void;
  attachTree(treeController: TableController, rowController: RowController): void;
  detachTree(treeController: TableController, rowController: RowController): void;
  attachTreeTrait(treeTrait: TableTrait, treeController: TableController, rowController: RowController): void;
  detachTreeTrait(treeTrait: TableTrait, treeController: TableController, rowController: RowController): void;
  attachTreeView(treeView: TableView, treeController: TableController, rowController: RowController): void;
  detachTreeView(treeView: TableView, treeController: TableController, rowController: RowController): void;
}

/** @public */
export class TableController extends Controller {
  override readonly observerType?: Class<TableControllerObserver>;

  protected layoutTable(tableLayout: TableLayout, tableView: TableView): void {
    tableView.layout.setValue(tableLayout, Affinity.Intrinsic);
  }

  @TraitViewRef<TableController, TableTrait, TableView>({
    traitType: TableTrait,
    observesTrait: true,
    willAttachTrait(tableTrait: TableTrait): void {
      this.owner.callObservers("controllerWillAttachTableTrait", tableTrait, this.owner);
    },
    didAttachTrait(tableTrait: TableTrait): void {
      const headerTrait = tableTrait.header.trait;
      if (headerTrait !== null) {
        this.owner.header.setTrait(headerTrait);
      }
      const colTraits = tableTrait.cols.traits;
      for (const traitId in colTraits) {
        const colTrait = colTraits[traitId]!;
        this.owner.cols.addTraitController(colTrait, null, colTrait.key);
      }
      const rowTraits = tableTrait.rows.traits;
      for (const traitId in rowTraits) {
        const rowTrait = rowTraits[traitId]!;
        this.owner.rows.addTraitController(rowTrait);
      }
      const tableView = this.view;
      if (tableView !== null) {
        const tableLayout = tableTrait.layout.value;
        if (tableLayout !== null) {
          this.owner.layoutTable(tableLayout, tableView);
        }
      }
    },
    willDetachTrait(tableTrait: TableTrait): void {
      const rowTraits = tableTrait.rows.traits;
      for (const traitId in rowTraits) {
        const rowTrait = rowTraits[traitId]!;
        this.owner.rows.deleteTraitController(rowTrait);
      }
      const colTraits = tableTrait.cols.traits;
      for (const traitId in colTraits) {
        const colTrait = colTraits[traitId]!;
        this.owner.cols.deleteTraitController(colTrait);
      }
      const headerTrait = tableTrait.header.trait;
      if (headerTrait !== null) {
        this.owner.header.deleteTrait(headerTrait);
      }
    },
    didDetachTrait(tableTrait: TableTrait): void {
      this.owner.callObservers("controllerDidDetachTableTrait", tableTrait, this.owner);
    },
    traitWillSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
      this.owner.callObservers("controllerWillSetTableLayout", newTableLayout, oldTableLayout, this.owner);
    },
    traitDidSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
      this.owner.callObservers("controllerDidSetTableLayout", newTableLayout, oldTableLayout, this.owner);
    },
    traitWillAttachHeader(headerTrait: HeaderTrait): void {
      this.owner.header.setTrait(headerTrait);
    },
    traitDidDetachHeader(headerTrait: HeaderTrait): void {
      this.owner.header.deleteTrait(headerTrait);
    },
    traitWillAttachCol(colTrait: ColTrait, targetTrait: Trait): void {
      this.owner.cols.addTraitController(colTrait, targetTrait, colTrait.key);
    },
    traitDidDetachCol(colTrait: ColTrait): void {
      this.owner.cols.deleteTraitController(colTrait);
    },
    traitWillAttachRow(rowTrait: RowTrait, targetTrait: Trait): void {
      this.owner.rows.addTraitController(rowTrait, targetTrait);
    },
    traitDidDetachRow(rowTrait: RowTrait): void {
      this.owner.rows.deleteTraitController(rowTrait);
    },
    viewType: TableView,
    observesView: true,
    initView(tableView: TableView): void {
      const headerController = this.owner.header.controller;
      if (headerController !== null) {
        headerController.header.insertView(tableView);
        if (tableView.header.view === null) {
          tableView.header.setView(headerController.header.view);
        }
      }
      const rowControllers = this.owner.rows.controllers;
      for (const controllerId in rowControllers) {
        const rowController = rowControllers[controllerId]!;
        const rowView = rowController.row.view;
        if (rowView !== null && rowView.parent === null) {
          rowController.row.insertView(tableView);
        }
      }
      const tableTrait = this.trait;
      if (tableTrait !== null) {
        const tableLayout = tableTrait.layout.value;
        if (tableLayout !== null) {
          this.owner.layoutTable(tableLayout, tableView);
        }
      }
    },
    willAttachView(tableView: TableView): void {
      this.owner.callObservers("controllerWillAttachTableView", tableView, this.owner);
    },
    didDetachView(tableView: TableView): void {
      this.owner.callObservers("controllerDidDetachTableView", tableView, this.owner);
    },
    viewWillAttachHeader(headerView: HeaderView): void {
      const headerController = this.owner.header.controller;
      if (headerController !== null) {
        headerController.header.setView(headerView);
      }
    },
    viewDidDetachHeader(headerView: HeaderView): void {
      const headerController = this.owner.header.controller;
      if (headerController !== null) {
        headerController.header.setView(null);
      }
    },
  })
  readonly table!: TraitViewRef<this, TableTrait, TableView>;
  static readonly table: MemberFastenerClass<TableController, "table">;

  @TraitViewControllerRef<TableController, HeaderTrait, HeaderView, HeaderController, TableControllerHeaderExt>({
    implements: true,
    type: HeaderController,
    binds: true,
    observes: true,
    get parentView(): TableView | null {
      return this.owner.table.view;
    },
    getTraitViewRef(headerController: HeaderController): TraitViewRef<unknown, HeaderTrait, HeaderView> {
      return headerController.header;
    },
    initController(headerController: HeaderController): void {
      const tableTrait = this.owner.table.trait;
      if (tableTrait !== null) {
        const headerTrait = tableTrait.header.trait;
        if (headerTrait !== null) {
          headerController.header.setTrait(headerTrait);
        }
      }
    },
    willAttachController(headerController: HeaderController): void {
      this.owner.callObservers("controllerWillAttachHeader", headerController, this.owner);
    },
    didAttachController(headerController: HeaderController): void {
      const headerTrait = headerController.header.trait;
      if (headerTrait !== null) {
        this.attachHeaderTrait(headerTrait, headerController);
      }
      const headerView = headerController.header.view;
      if (headerView !== null) {
        this.attachHeaderView(headerView, headerController);
      }
    },
    willDetachController(headerController: HeaderController): void {
      const headerView = headerController.header.view;
      if (headerView !== null) {
        this.detachHeaderView(headerView, headerController);
      }
      const headerTrait = headerController.header.trait;
      if (headerTrait !== null) {
        this.detachHeaderTrait(headerTrait, headerController);
      }
    },
    didDetachController(headerController: HeaderController): void {
      this.owner.callObservers("controllerDidDetachHeader", headerController, this.owner);
    },
    controllerWillAttachHeaderTrait(headerTrait: HeaderTrait, headerController: HeaderController): void {
      this.owner.callObservers("controllerWillAttachHeaderTrait", headerTrait, this.owner);
      this.attachHeaderTrait(headerTrait, headerController);
    },
    controllerDidDetachHeaderTrait(headerTrait: HeaderTrait, headerController: HeaderController): void {
      this.detachHeaderTrait(headerTrait, headerController);
      this.owner.callObservers("controllerDidDetachHeaderTrait", headerTrait, this.owner);
    },
    attachHeaderTrait(headerTrait: HeaderTrait, headerController: HeaderController): void {
      // hook
    },
    detachHeaderTrait(headerTrait: HeaderTrait, headerController: HeaderController): void {
      // hook
    },
    controllerWillAttachHeaderView(headerView: HeaderView, headerController: HeaderController): void {
      this.owner.callObservers("controllerWillAttachHeaderView", headerView, this.owner);
      this.attachHeaderView(headerView, headerController);
    },
    controllerDidDetachHeaderView(headerView: HeaderView, headerController: HeaderController): void {
      this.detachHeaderView(headerView, headerController);
      this.owner.callObservers("controllerDidDetachHeaderView", headerView, this.owner);
    },
    attachHeaderView(headerView: HeaderView, headerController: HeaderController): void {
      //const tableView = this.owner.table.view;
      //if (tableView !== null && tableView.header.view === null) {
      //  tableView.header.setView(headerView);
      //}
    },
    detachHeaderView(headerView: HeaderView, headerController: HeaderController): void {
      headerView.remove();
    },
    detectController(controller: Controller): HeaderController | null {
      return controller instanceof HeaderController ? controller : null;
    },
  })
  readonly header!: TraitViewControllerRef<this, HeaderTrait, HeaderView, HeaderController>;
  static readonly header: MemberFastenerClass<TableController, "header">;

  @TraitViewControllerSet<TableController, ColTrait, ColView, ColController, TableControllerColExt>({
    implements: true,
    type: ColController,
    binds: true,
    observes: true,
    getTraitViewRef(colController: ColController): TraitViewRef<unknown, ColTrait, ColView> {
      return colController.col;
    },
    willAttachController(colController: ColController): void {
      this.owner.callObservers("controllerWillAttachCol", colController, this.owner);
    },
    didAttachController(colController: ColController): void {
      const colTrait = colController.col.trait;
      if (colTrait !== null) {
        this.attachColTrait(colTrait, colController);
      }
      const colView = colController.col.view;
      if (colView !== null) {
        this.attachColView(colView, colController);
      }
    },
    willDetachController(colController: ColController): void {
      const colTrait = colController.col.trait;
      if (colTrait !== null) {
        this.detachColTrait(colTrait, colController);
      }
      const colView = colController.col.view;
      if (colView !== null) {
        this.detachColView(colView, colController);
      }
    },
    didDetachController(colController: ColController): void {
      this.owner.callObservers("controllerDidDetachCol", colController, this.owner);
    },
    controllerWillAttachColTrait(colTrait: ColTrait, colController: ColController): void {
      this.owner.callObservers("controllerWillAttachColTrait", colTrait, colController, this.owner);
      this.attachColTrait(colTrait, colController);
    },
    controllerDidDetachColTrait(colTrait: ColTrait, colController: ColController): void {
      this.detachColTrait(colTrait, colController);
      this.owner.callObservers("controllerDidDetachColTrait", colTrait, colController, this.owner);
    },
    attachColTrait(colTrait: ColTrait, colController: ColController): void {
      // hook
    },
    detachColTrait(colTrait: ColTrait, colController: ColController): void {
      // hook
    },
    controllerWillSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colController: ColController): void {
      this.owner.callObservers("controllerWillSetColLayout", newColLayout, oldColLayout, colController, this.owner);
    },
    controllerDidSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colController: ColController): void {
      this.owner.callObservers("controllerDidSetColLayout", newColLayout, oldColLayout, colController, this.owner);
    },
    controllerWillAttachColView(colView: ColView, colController: ColController): void {
      this.owner.callObservers("controllerWillAttachColView", colView, colController, this.owner);
      this.attachColView(colView, colController);
    },
    controllerDidDetachColView(colView: ColView, colController: ColController): void {
      this.detachColView(colView, colController);
      this.owner.callObservers("controllerDidDetachColView", colView, colController, this.owner);
    },
    attachColView(colView: ColView, colController: ColController): void {
      const colLabelView = colView.label.view;
      if (colLabelView !== null) {
        this.attachColLabelView(colLabelView, colController);
      }
    },
    detachColView(colView: ColView, colController: ColController): void {
      const colLabelView = colView.label.view;
      if (colLabelView !== null) {
        this.detachColLabelView(colLabelView, colController);
      }
      colView.remove();
    },
    controllerWillAttachColLabelView(colLabelView: HtmlView, colController: ColController): void {
      this.owner.callObservers("controllerWillAttachColLabelView", colLabelView, colController, this.owner);
      this.attachColLabelView(colLabelView, colController);
    },
    controllerDidDetachColLabelView(colLabelView: HtmlView, colController: ColController): void {
      this.detachColLabelView(colLabelView, colController);
      this.owner.callObservers("controllerDidDetachColLabelView", colLabelView, colController, this.owner);
    },
    attachColLabelView(colLabelView: HtmlView, colController: ColController): void {
      // hook
    },
    detachColLabelView(colLabelView: HtmlView, colController: ColController): void {
      // hook
    },
  })
  readonly cols!: TraitViewControllerSet<this, ColTrait, ColView, ColController>;
  static readonly cols: MemberFastenerClass<TableController, "cols">;

  @TraitViewControllerSet<TableController, RowTrait, RowView, RowController, TableControllerRowExt>({
    implements: true,
    type: RowController,
    binds: true,
    observes: true,
    get parentView(): View | null {
      return this.owner.table.view;
    },
    getTraitViewRef(rowController: RowController): TraitViewRef<unknown, RowTrait, RowView> {
      return rowController.row;
    },
    willAttachController(rowController: RowController): void {
      this.owner.callObservers("controllerWillAttachRow", rowController, this.owner);
    },
    didAttachController(rowController: RowController): void {
      const rowTrait = rowController.row.trait;
      if (rowTrait !== null) {
        this.attachRowTrait(rowTrait, rowController);
      }
      const rowView = rowController.row.view;
      if (rowView !== null) {
        this.attachRowView(rowView, rowController);
      }
    },
    willDetachController(rowController: RowController): void {
      const rowView = rowController.row.view;
      if (rowView !== null) {
        this.detachRowView(rowView, rowController);
      }
      const rowTrait = rowController.row.trait;
      if (rowTrait !== null) {
        this.detachRowTrait(rowTrait, rowController);
      }
    },
    didDetachController(rowController: RowController): void {
      this.owner.callObservers("controllerDidDetachRow", rowController, this.owner);
    },
    controllerWillAttachRowTrait(rowTrait: RowTrait, rowController: RowController): void {
      this.owner.callObservers("controllerWillAttachRowTrait", rowTrait, rowController, this.owner);
      this.attachRowTrait(rowTrait, rowController);
    },
    controllerDidDetachRowTrait(rowTrait: RowTrait, rowController: RowController): void {
      this.detachRowTrait(rowTrait, rowController);
      this.owner.callObservers("controllerDidDetachRowTrait", rowTrait, rowController, this.owner);
    },
    attachRowTrait(rowTrait: RowTrait, rowController: RowController): void {
      // hook
    },
    detachRowTrait(rowTrait: RowTrait, rowController: RowController): void {
      // hook
    },
    controllerWillAttachRowView(rowView: RowView, rowController: RowController): void {
      this.owner.callObservers("controllerWillAttachRowView", rowView, rowController, this.owner);
      this.attachRowView(rowView, rowController);
    },
    controllerDidDetachRowView(rowView: RowView, rowController: RowController): void {
      this.detachRowView(rowView, rowController);
      this.owner.callObservers("controllerDidDetachRowView", rowView, rowController, this.owner);
    },
    attachRowView(rowView: RowView, rowController: RowController): void {
      // hook
    },
    detachRowView(rowView: RowView, rowController: RowController): void {
      rowView.remove();
    },
    controllerWillAttachLeafTrait(leafTrait: LeafTrait, rowController: RowController): void {
      this.owner.callObservers("controllerWillAttachLeafTrait", leafTrait, rowController, this.owner);
      this.attachLeafTrait(leafTrait, rowController);
    },
    controllerDidDetachLeafTrait(leafTrait: LeafTrait, rowController: RowController): void {
      this.detachLeafTrait(leafTrait, rowController);
      this.owner.callObservers("controllerDidDetachLeafTrait", leafTrait, rowController, this.owner);
    },
    attachLeafTrait(leafTrait: LeafTrait, rowController: RowController): void {
      // hook
    },
    detachLeafTrait(leafTrait: LeafTrait, rowController: RowController): void {
      // hook
    },
    controllerWillAttachLeafView(leafView: LeafView, rowController: RowController): void {
      this.owner.callObservers("controllerWillAttachLeafView", leafView, rowController, this.owner);
      this.attachLeafView(leafView, rowController);
    },
    controllerDidDetachLeafView(leafView: LeafView, rowController: RowController): void {
      this.detachLeafView(leafView, rowController);
      this.owner.callObservers("controllerDidDetachLeafView", leafView, rowController, this.owner);
    },
    attachLeafView(leafView: LeafView, rowController: RowController): void {
      // hook
    },
    detachLeafView(leafView: LeafView, rowController: RowController): void {
      // hook
    },
    controllerWillAttachCell(cellController: CellController, rowController: RowController): void {
      this.owner.callObservers("controllerWillAttachCell", cellController, rowController, this.owner);
      this.attachCell(cellController, rowController);
    },
    controllerDidDetachCell(cellController: CellController, rowController: RowController): void {
      this.detachCell(cellController, rowController);
      this.owner.callObservers("controllerDidDetachCell", cellController, rowController, this.owner);
    },
    attachCell(cellController: CellController, rowController: RowController): void {
      const cellTrait = cellController.cell.trait;
      if (cellTrait !== null) {
        this.attachCellTrait(cellTrait, cellController, rowController);
      }
      const cellView = cellController.cell.view;
      if (cellView !== null) {
        this.attachCellView(cellView, cellController, rowController);
      }
    },
    detachCell(cellController: CellController, rowController: RowController): void {
      const cellTrait = cellController.cell.trait;
      if (cellTrait !== null) {
        this.detachCellTrait(cellTrait, cellController, rowController);
      }
      const cellView = cellController.cell.view;
      if (cellView !== null) {
        this.detachCellView(cellView, cellController, rowController);
      }
    },
    controllerWillAttachCellTrait(cellTrait: CellTrait, cellController: CellController, rowController: RowController): void {
      this.owner.callObservers("controllerWillAttachCellTrait", cellTrait, cellController, rowController, this.owner);
      this.attachCellTrait(cellTrait, cellController, rowController);
    },
    controllerDidDetachCellTrait(cellTrait: CellTrait, cellController: CellController, rowController: RowController): void {
      this.detachCellTrait(cellTrait, cellController, rowController);
      this.owner.callObservers("controllerDidDetachCellTrait", cellTrait, cellController, rowController, this.owner);
    },
    attachCellTrait(cellTrait: CellTrait, cellController: CellController, rowController: RowController): void {
      // hook
    },
    detachCellTrait(cellTrait: CellTrait, cellController: CellController, rowController: RowController): void {
      // hook
    },
    controllerWillAttachCellView(cellView: CellView, cellController: CellController, rowController: RowController): void {
      this.owner.callObservers("controllerWillAttachCellView", cellView, cellController, rowController, this.owner);
      this.attachCellView(cellView, cellController, rowController);
    },
    controllerDidDetachCellView(cellView: CellView, cellController: CellController, rowController: RowController): void {
      this.detachCellView(cellView, cellController, rowController);
      this.owner.callObservers("controllerDidDetachCellView", cellView, cellController, rowController, this.owner);
    },
    attachCellView(cellView: CellView, cellController: CellController, rowController: RowController): void {
      if (cellView instanceof TextCellView) {
        const cellContentView = cellView.content.view;
        if (cellContentView !== null) {
          this.attachCellContentView(cellContentView, cellController, rowController);
        }
      }
    },
    detachCellView(cellView: CellView, cellController: CellController, rowController: RowController): void {
      if (cellView instanceof TextCellView) {
        const cellContentView = cellView.content.view;
        if (cellContentView !== null) {
          this.detachCellContentView(cellContentView, cellController, rowController);
        }
      }
    },
    controllerWillAttachCellContentView(cellContentView: HtmlView, cellController: CellController, rowController: RowController): void {
      this.owner.callObservers("controllerWillAttachCellContentView", cellContentView, cellController, rowController, this.owner);
      this.attachCellContentView(cellContentView, cellController, rowController);
    },
    controllerDidDetachCellContentView(cellContentView: HtmlView, cellController: CellController, rowController: RowController): void {
      this.detachCellContentView(cellContentView, cellController, rowController);
      this.owner.callObservers("controllerDidDetachCellContentView", cellContentView, cellController, rowController, this.owner);
    },
    attachCellContentView(cellContentView: HtmlView, cellController: CellController, rowController: RowController): void {
      // hook
    },
    detachCellContentView(cellContentView: HtmlView, cellController: CellController, rowController: RowController): void {
      // hook
    },
    controllerWillSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellController: CellController, rowController: RowController): void {
      this.owner.callObservers("controllerWillSetCellIcon", newCellIcon, oldCellIcon, cellController, rowController, this.owner);
    },
    controllerDidSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellController: CellController, rowController: RowController): void {
      this.owner.callObservers("controllerDidSetCellIcon", newCellIcon, oldCellIcon, cellController, rowController, this.owner);
    },
    controllerWillAttachTree(treeController: TableController, rowController: RowController): void {
      this.owner.callObservers("controllerWillAttachTree", treeController, rowController, this.owner);
      this.attachTree(treeController, rowController);
    },
    controllerDidDetachTree(treeController: TableController, rowController: RowController): void {
      this.detachTree(treeController, rowController);
      this.owner.callObservers("controllerDidDetachTree", treeController, rowController, this.owner);
    },
    attachTree(treeController: TableController, rowController: RowController): void {
      const treeTrait = treeController.table.trait;
      if (treeTrait !== null) {
        this.attachTreeTrait(treeTrait, treeController, rowController);
      }
      const treeView = treeController.table.view;
      if (treeView !== null) {
        this.attachTreeView(treeView, treeController, rowController);
      }
    },
    detachTree(treeController: TableController, rowController: RowController): void {
      const treeTrait = treeController.table.trait;
      if (treeTrait !== null) {
        this.detachTreeTrait(treeTrait, treeController, rowController);
      }
      const treeView = treeController.table.view;
      if (treeView !== null) {
        this.detachTreeView(treeView, treeController, rowController);
      }
    },
    controllerWillAttachTreeTrait(treeTrait: TableTrait, treeController: TableController, rowController: RowController): void {
      this.owner.callObservers("controllerWillAttachTreeTrait", treeTrait, treeController, rowController, this.owner);
      this.attachTreeTrait(treeTrait, treeController, rowController);
    },
    controllerDidDetachTreeTrait(treeTrait: TableTrait, treeController: TableController, rowController: RowController): void {
      this.detachTreeTrait(treeTrait, treeController, rowController);
      this.owner.callObservers("controllerDidDetachTreeTrait", treeTrait, treeController, rowController, this.owner);
    },
    attachTreeTrait(treeTrait: TableTrait, treeController: TableController, rowController: RowController): void {
      // hook
    },
    detachTreeTrait(treeTrait: TableTrait, treeController: TableController, rowController: RowController): void {
      // hook
    },
    controllerWillAttachTreeView(treeView: TableView, treeController: TableController, rowController: RowController): void {
      this.owner.callObservers("controllerWillAttachTreeView", treeView, treeController, rowController, this.owner);
      this.attachTreeView(treeView, treeController, rowController);
    },
    controllerDidDetachTreeView(treeView: TableView, treeController: TableController, rowController: RowController): void {
      this.detachTreeView(treeView, treeController, rowController);
      this.owner.callObservers("controllerDidDetachTreeView", treeView, treeController, rowController, this.owner);
    },
    attachTreeView(treeView: TableView, treeController: TableController, rowController: RowController): void {
      // hook
    },
    detachTreeView(treeView: TableView, treeController: TableController, rowController: RowController): void {
      // hook
    },
    controllerWillExpandRowView(rowView: RowView, rowController: RowController): void {
      this.owner.callObservers("controllerWillExpandRowView", rowView, rowController, this.owner);
    },
    controllerDidExpandRowView(rowView: RowView, rowController: RowController): void {
      this.owner.callObservers("controllerDidExpandRowView", rowView, rowController, this.owner);
    },
    controllerWillCollapseRowView(rowView: RowView, rowController: RowController): void {
      this.owner.callObservers("controllerWillCollapseRowView", rowView, rowController, this.owner);
    },
    controllerDidCollapseRowView(rowView: RowView, rowController: RowController): void {
      this.owner.callObservers("controllerDidCollapseRowView", rowView, rowController, this.owner);
    },
  })
  readonly rows!: TraitViewControllerSet<this, RowTrait, RowView, RowController>;
  static readonly rows: MemberFastenerClass<TableController, "rows">;
}
