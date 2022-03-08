// Copyright 2015-2022 Swim.inc
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

import type {PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import type {TableLayout} from "../layout/TableLayout";
import type {ColLayout} from "../layout/ColLayout";
import type {CellView} from "../cell/CellView";
import type {CellTrait} from "../cell/CellTrait";
import type {CellController} from "../cell/CellController";
import type {LeafView} from "../leaf/LeafView";
import type {LeafTrait} from "../leaf/LeafTrait";
import type {RowView} from "../row/RowView";
import type {RowTrait} from "../row/RowTrait";
import type {RowController} from "../row/RowController";
import type {ColView} from "../col/ColView";
import type {ColTrait} from "../col/ColTrait";
import type {ColController} from "../col/ColController";
import type {HeaderView} from "../header/HeaderView";
import type {HeaderTrait} from "../header/HeaderTrait";
import type {HeaderController} from "../header/HeaderController";
import type {TableView} from "./TableView";
import type {TableTrait} from "./TableTrait";
import type {TableController} from "./TableController";

/** @public */
export interface TableControllerObserver<C extends TableController = TableController> extends ControllerObserver<C> {
  controllerWillAttachTableTrait?(tableTrait: TableTrait, controller: C): void;

  controllerDidDetachTableTrait?(tableTrait: TableTrait, controller: C): void;

  controllerWillSetTableLayout?(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null, controller: C): void;

  controllerDidSetTableLayout?(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null, controller: C): void;

  controllerWillAttachTableView?(tableView: TableView, controller: C): void;

  controllerDidDetachTableView?(tableView: TableView, controller: C): void;

  controllerWillAttachHeader?(headerController: HeaderController, controller: C): void;

  controllerDidDetachHeader?(headerController: HeaderController, controller: C): void;

  controllerWillAttachHeaderTrait?(headerTrait: HeaderTrait, controller: C): void;

  controllerDidDetachHeaderTrait?(headerTrait: HeaderTrait, controller: C): void;

  controllerWillAttachHeaderView?(headerView: HeaderView, controller: C): void;

  controllerDidDetachHeaderView?(headerView: HeaderView, controller: C): void;

  controllerWillAttachCol?(colController: ColController, controller: C): void;

  controllerDidDetachCol?(colController: ColController, controller: C): void;

  controllerWillAttachColTrait?(colTrait: ColTrait, colController: ColController, controller: C): void;

  controllerDidDetachColTrait?(colTrait: ColTrait, colController: ColController, controller: C): void;

  controllerWillSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colController: ColController, controller: C): void;

  controllerDidSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colController: ColController, controller: C): void;

  controllerWillAttachColView?(colView: ColView, colController: ColController, controller: C): void;

  controllerDidDetachColView?(colView: ColView, colController: ColController, controller: C): void;

  controllerWillAttachColLabelView?(colLabelView: HtmlView, colController: ColController, controller: C): void;

  controllerDidDetachColLabelView?(colLabelView: HtmlView, colController: ColController, controller: C): void;

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

  controllerWillSetCellIcon?(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellController: CellController, rowController: RowController, controller: C): void;

  controllerDidSetCellIcon?(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellController: CellController, rowController: RowController, controller: C): void;

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
