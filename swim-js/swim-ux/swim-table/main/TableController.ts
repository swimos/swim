// Copyright 2015-2023 Nstream, inc.
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
import type {Observes} from "@swim/util";
import type {Trait} from "@swim/model";
import type {View} from "@swim/view";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import type {TableLayout} from "./TableLayout";
import type {ColLayout} from "./ColLayout";
import type {CellView} from "./CellView";
import {TextCellView} from "./TextCellView";
import type {CellTrait} from "./CellTrait";
import type {CellController} from "./CellController";
import type {LeafView} from "./LeafView";
import type {LeafTrait} from "./LeafTrait";
import type {RowView} from "./RowView";
import type {RowTrait} from "./RowTrait";
import {RowController} from "./RowController";
import type {ColView} from "./ColView";
import {TextColView} from "./TextColView";
import type {ColTrait} from "./ColTrait";
import {ColController} from "./ColController";
import type {TextColController} from "./TextColController";
import type {IconColController} from "./IconColController";
import type {HeaderView} from "./HeaderView";
import type {HeaderTrait} from "./HeaderTrait";
import {HeaderController} from "./HeaderController";
import {TableView} from "./TableView";
import {TableTrait} from "./TableTrait";

/** @public */
export interface TableControllerObserver<C extends TableController = TableController> extends ControllerObserver<C> {
  controllerWillAttachTableTrait?(tableTrait: TableTrait, controller: C): void;

  controllerDidDetachTableTrait?(tableTrait: TableTrait, controller: C): void;

  controllerDidSetTableLayout?(tableLayout: TableLayout | null, controller: C): void;

  controllerWillAttachTableView?(tableView: TableView, controller: C): void;

  controllerDidDetachTableView?(tableView: TableView, controller: C): void;

  controllerWillExpandTableView?(tableView: TableView, controller: C): void;

  controllerDidExpandTableView?(tableView: TableView, controller: C): void;

  controllerWillCollapseTableView?(tableView: TableView, controller: C): void;

  controllerDidCollapseTableView?(tableView: TableView, controller: C): void;

  controllerWillAttachHeader?(headerController: HeaderController, controller: C): void;

  controllerDidDetachHeader?(headerController: HeaderController, controller: C): void;

  controllerWillAttachHeaderTrait?(headerTrait: HeaderTrait, controller: C): void;

  controllerDidDetachHeaderTrait?(headerTrait: HeaderTrait, controller: C): void;

  controllerWillAttachHeaderView?(headerView: HeaderView, controller: C): void;

  controllerDidDetachHeaderView?(headerView: HeaderView, controller: C): void;

  controllerDidPressHeaderView?(input: PositionGestureInput, event: Event | null, headerView: HeaderView, controller: C): void;

  controllerDidLongPressHeaderView?(input: PositionGestureInput, headerView: HeaderView, controller: C): void;

  controllerWillAttachCol?(colController: ColController, controller: C): void;

  controllerDidDetachCol?(colController: ColController, controller: C): void;

  controllerWillAttachColTrait?(colTrait: ColTrait, colController: ColController, controller: C): void;

  controllerDidDetachColTrait?(colTrait: ColTrait, colController: ColController, controller: C): void;

  controllerDidSetColLayout?(colLayout: ColLayout | null, colController: ColController, controller: C): void;

  controllerWillAttachColView?(colView: ColView, colController: ColController, controller: C): void;

  controllerDidDetachColView?(colView: ColView, colController: ColController, controller: C): void;

  controllerDidPressColView?(input: PositionGestureInput, event: Event | null, colView: ColView, colController: ColController, controller: C): void;

  controllerDidLongPressColView?(input: PositionGestureInput, colView: ColView, colController: ColController, controller: C): void;

  controllerWillAttachColLabelView?(colLabelView: HtmlView, colController: ColController, controller: C): void;

  controllerDidDetachColLabelView?(colLabelView: HtmlView, colController: ColController, controller: C): void;

  controllerDidSetColIcon?(colIcon: Graphics | null, colController: ColController, controller: C): void;

  controllerWillAttachRow?(rowController: RowController, controller: C): void;

  controllerDidDetachRow?(rowController: RowController, controller: C): void;

  controllerWillAttachRowTrait?(rowTrait: RowTrait, rowController: RowController, controller: C): void;

  controllerDidDetachRowTrait?(rowTrait: RowTrait, rowController: RowController, controller: C): void;

  controllerWillAttachRowView?(rowView: RowView, rowController: RowController, controller: C): void;

  controllerDidDetachRowView?(rowView: RowView, rowController: RowController, controller: C): void;

  controllerWillAttachLeafTrait?(leafTrait: LeafTrait, rowController: RowController, controller: C): void;

  controllerDidDetachLeafTrait?(leafTrait: LeafTrait, rowController: RowController, controller: C): void;

  controllerWillAttachLeafView?(leafView: LeafView, rowController: RowController, controller: C): void;

  controllerDidDetachLeafView?(leafView: LeafView, rowController: RowController, controller: C): void;

  controllerWillHighlightLeafView?(leafView: LeafView, rowController: RowController, controller: C): void;

  controllerDidHighlightLeafView?(leafView: LeafView, rowController: RowController, controller: C): void;

  controllerWillUnhighlightLeafView?(leafView: LeafView, rowController: RowController, controller: C): void;

  controllerDidUnhighlightLeafView?(leafView: LeafView, rowController: RowController, controller: C): void;

  controllerDidEnterLeafView?(leafView: LeafView, rowController: RowController, controller: C): void;

  controllerDidLeaveLeafView?(leafView: LeafView, rowController: RowController, controller: C): void;

  controllerDidPressLeafView?(input: PositionGestureInput, event: Event | null, leafView: LeafView, rowController: RowController, controller: C): void;

  controllerDidLongPressLeafView?(input: PositionGestureInput, leafView: LeafView, rowController: RowController, controller: C): void;

  controllerWillAttachCell?(cellController: CellController, rowController: RowController, controller: C): void;

  controllerDidDetachCell?(cellController: CellController, rowController: RowController, controller: C): void;

  controllerWillAttachCellTrait?(cellTrait: CellTrait, cellController: CellController, rowController: RowController, controller: C): void;

  controllerDidDetachCellTrait?(cellTrait: CellTrait, cellController: CellController, rowController: RowController, controller: C): void;

  controllerWillAttachCellView?(cellView: CellView, cellController: CellController, rowController: RowController, controller: C): void;

  controllerDidDetachCellView?(cellView: CellView, cellController: CellController, rowController: RowController, controller: C): void;

  controllerWillAttachCellContentView?(cellContentView: HtmlView, cellController: CellController, rowController: RowController, controller: C): void;

  controllerDidDetachCellContentView?(cellContentView: HtmlView, cellController: CellController, rowController: RowController, controller: C): void;

  controllerDidSetCellIcon?(cellIcon: Graphics | null, cellController: CellController, rowController: RowController, controller: C): void;

  controllerWillAttachTree?(treeController: TableController, rowController: RowController, controller: C): void;

  controllerDidDetachTree?(treeController: TableController, rowController: RowController, controller: C): void;

  controllerWillAttachTreeTrait?(treeTrait: TableTrait, treeController: TableController, rowController: RowController, controller: C): void;

  controllerDidDetachTreeTrait?(treeTrait: TableTrait, treeController: TableController, rowController: RowController, controller: C): void;

  controllerWillAttachTreeView?(treeView: TableView, treeController: TableController, rowController: RowController, controller: C): void;

  controllerDidDetachTreeView?(treeView: TableView, treeController: TableController, rowController: RowController, controller: C): void;

  controllerWillExpandRowView?(rowView: RowView, rowController: RowController, controller: C): void;

  controllerDidExpandRowView?(rowView: RowView, rowController: RowController, controller: C): void;

  controllerWillCollapseRowView?(rowView: RowView, rowController: RowController, controller: C): void;

  controllerDidCollapseRowView?(rowView: RowView, rowController: RowController, controller: C): void;
}

/** @public */
export class TableController extends Controller {
  declare readonly observerType?: Class<TableControllerObserver>;

  protected layoutTable(tableLayout: TableLayout, tableView: TableView): void {
    tableView.layout.setIntrinsic(tableLayout);
  }

  @TraitViewRef({
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
        this.owner.cols.addTrait(colTrait, null, colTrait.key);
      }
      this.owner.rows.addTraits(tableTrait.rows.traits);
      const tableView = this.view;
      if (tableView !== null) {
        const tableLayout = tableTrait.layout.value;
        if (tableLayout !== null) {
          this.owner.layoutTable(tableLayout, tableView);
        }
      }
    },
    willDetachTrait(tableTrait: TableTrait): void {
      this.owner.rows.deleteTraits(tableTrait.rows.traits);
      this.owner.cols.deleteTraits(tableTrait.cols.traits);
      const headerTrait = tableTrait.header.trait;
      if (headerTrait !== null) {
        this.owner.header.deleteTrait(headerTrait);
      }
    },
    didDetachTrait(tableTrait: TableTrait): void {
      this.owner.callObservers("controllerDidDetachTableTrait", tableTrait, this.owner);
    },
    traitDidSetTableLayout(tableLayout: TableLayout | null): void {
      this.owner.callObservers("controllerDidSetTableLayout", tableLayout, this.owner);
    },
    traitWillAttachHeader(headerTrait: HeaderTrait): void {
      this.owner.header.setTrait(headerTrait);
    },
    traitDidDetachHeader(headerTrait: HeaderTrait): void {
      this.owner.header.deleteTrait(headerTrait);
    },
    traitWillAttachCol(colTrait: ColTrait, targetTrait: Trait): void {
      this.owner.cols.addTrait(colTrait, targetTrait, colTrait.key);
    },
    traitDidDetachCol(colTrait: ColTrait): void {
      this.owner.cols.deleteTrait(colTrait);
    },
    traitWillAttachRow(rowTrait: RowTrait, targetTrait: Trait): void {
      this.owner.rows.addTrait(rowTrait, targetTrait);
    },
    traitDidDetachRow(rowTrait: RowTrait): void {
      this.owner.rows.deleteTrait(rowTrait);
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
          const targetView = this.owner.rows.getTargetView(rowController);
          rowController.row.insertView(tableView, void 0, targetView);
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
    viewWillExpand(tableView: TableView): void {
      this.owner.callObservers("controllerWillExpandTableView", tableView, this.owner);
    },
    viewDidExpand(tableView: TableView): void {
      this.owner.callObservers("controllerDidExpandTableView", tableView, this.owner);
    },
    viewWillCollapse(tableView: TableView): void {
      this.owner.callObservers("controllerWillCollapseTableView", tableView, this.owner);
    },
    viewDidCollapse(tableView: TableView): void {
      this.owner.callObservers("controllerDidCollapseTableView", tableView, this.owner);
    },
  })
  readonly table!: TraitViewRef<this, TableTrait, TableView> & Observes<TableTrait> & Observes<TableView>;

  @TraitViewControllerRef({
    controllerType: HeaderController,
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
      const tableView = this.owner.table.view;
      if (tableView !== null && tableView.header.view === null) {
        tableView.header.setView(headerView);
      }
    },
    detachHeaderView(headerView: HeaderView, headerController: HeaderController): void {
      headerView.remove();
    },
    controllerDidPressHeaderView(input: PositionGestureInput, event: Event | null, headerView: HeaderView): void {
      this.owner.callObservers("controllerDidPressHeaderView", input, event, headerView, this.owner);
    },
    controllerDidLongPressHeaderView(input: PositionGestureInput, headerView: HeaderView): void {
      this.owner.callObservers("controllerDidLongPressHeaderView", input, headerView, this.owner);
    },
    detectController(controller: Controller): HeaderController | null {
      return controller instanceof HeaderController ? controller : null;
    },
  })
  readonly header!: TraitViewControllerRef<this, HeaderTrait, HeaderView, HeaderController> & Observes<HeaderController> & {
    attachHeaderTrait(headerTrait: HeaderTrait, headerController: HeaderController): void;
    detachHeaderTrait(headerTrait: HeaderTrait, headerController: HeaderController): void;
    attachHeaderView(headerView: HeaderView, headerController: HeaderController): void;
    detachHeaderView(headerView: HeaderView, headerController: HeaderController): void;
  };

  @TraitViewControllerSet({
    controllerType: ColController,
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
    controllerDidSetColLayout(colLayout: ColLayout | null, colController: ColController): void {
      this.owner.callObservers("controllerDidSetColLayout", colLayout, colController, this.owner);
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
      if (colView instanceof TextColView) {
        const colLabelView = colView.label.view;
        if (colLabelView !== null) {
          this.attachColLabelView(colLabelView, colController);
        }
      }
    },
    detachColView(colView: ColView, colController: ColController): void {
      if (colView instanceof TextColView) {
        const colLabelView = colView.label.view;
        if (colLabelView !== null) {
          this.detachColLabelView(colLabelView, colController);
        }
      }
      colView.remove();
    },
    controllerDidPressColView(input: PositionGestureInput, event: Event | null, colView: ColView, colController: ColController): void {
      this.owner.callObservers("controllerDidPressColView", input, event, colView, colController, this.owner);
    },
    controllerDidLongPressColView(input: PositionGestureInput, colView: ColView, colController: ColController): void {
      this.owner.callObservers("controllerDidLongPressColView", input, colView, colController, this.owner);
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
    controllerDidSetColIcon(colIcon: Graphics | null, colController: ColController): void {
      this.owner.callObservers("controllerDidSetColIcon", colIcon, colController, this.owner);
    },
  })
  readonly cols!: TraitViewControllerSet<this, ColTrait, ColView, ColController> & Observes<ColController> & Observes<TextColController> & Observes<IconColController> & {
    attachColTrait(colTrait: ColTrait, colController: ColController): void;
    detachColTrait(colTrait: ColTrait, colController: ColController): void;
    attachColView(colView: ColView, colController: ColController): void;
    detachColView(colView: ColView, colController: ColController): void;
    attachColLabelView(colLabelView: HtmlView, colController: ColController): void;
    detachColLabelView(colLabelView: HtmlView, colController: ColController): void;
  };

  @TraitViewControllerSet({
    controllerType: RowController,
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
    controllerDidAttachParent(parent: Controller, rowController: RowController): void {
      const tableView = this.owner.table.view;
      const rowView = rowController.row.view;
      if (tableView !== null && rowView !== null) {
        const targetController = rowController.getNextSibling(RowController);
        const targetView = targetController !== null ? targetController.row.view : null;
        tableView.reinsertChild(rowView, targetView);
        //tableView.requireUpdate(View.NeedsScroll | View.NeedsLayout);
      }
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
    controllerDidSetCellIcon(cellIcon: Graphics | null, cellController: CellController, rowController: RowController): void {
      this.owner.callObservers("controllerDidSetCellIcon", cellIcon, cellController, rowController, this.owner);
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
  readonly rows!: TraitViewControllerSet<this, RowTrait, RowView, RowController> & Observes<RowController> & {
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
  };
}
