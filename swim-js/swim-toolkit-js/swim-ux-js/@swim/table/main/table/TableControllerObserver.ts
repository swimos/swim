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

import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import type {ControllerObserver, ControllerFastener} from "@swim/controller";
import type {TableLayout} from "../layout/TableLayout";
import type {ColLayout} from "../layout/ColLayout";
import type {CellView} from "../cell/CellView";
import type {CellTrait} from "../cell/CellTrait";
import type {CellController} from "../cell/CellController";
import type {ColView} from "../col/ColView";
import type {ColTrait} from "../col/ColTrait";
import type {ColController} from "../col/ColController";
import type {RowView} from "../row/RowView";
import type {RowTrait} from "../row/RowTrait";
import type {RowController} from "../row/RowController";
import type {TableView} from "./TableView";
import type {TableTrait} from "./TableTrait";
import type {TableController} from "./TableController";

export interface TableControllerObserver<C extends TableController = TableController> extends ControllerObserver<C> {
  controllerWillSetTableTrait?(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null, controller: C): void;

  controllerDidSetTableTrait?(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null, controller: C): void;

  controllerWillSetTableLayout?(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null, controller: C): void;

  controllerDidSetTableLayout?(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null, controller: C): void;

  controllerWillSetTableView?(newTableView: TableView | null, oldTableView: TableView | null, controller: C): void;

  controllerDidSetTableView?(newTableView: TableView | null, oldTableView: TableView | null, controller: C): void;

  controllerWillSetCol?(newColController: ColController | null, oldColController: ColController | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerDidSetCol?(newColController: ColController | null, oldColController: ColController | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerWillSetColTrait?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerDidSetColTrait?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerWillSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerDidSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerWillSetColView?(newColView: ColView | null, oldColView: ColView | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerDidSetColView?(newColView: ColView | null, oldColView: ColView | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerWillSetColHeaderView?(newColHeaderView: HtmlView | null, oldColHeaderView: HtmlView | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerDidSetColHeaderView?(newColHeaderView: HtmlView | null, oldColHeaderView: HtmlView | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerWillSetRow?(newRowController: RowController | null, oldRowController: RowController | null, rowFastener: ControllerFastener<C, RowController>): void;

  controllerDidSetRow?(newRowController: RowController | null, oldRowController: RowController | null, rowFastener: ControllerFastener<C, RowController>): void;

  controllerWillSetRowTrait?(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, rowFastener: ControllerFastener<C, RowController>): void;

  controllerDidSetRowTrait?(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, rowFastener: ControllerFastener<C, RowController>): void;

  controllerWillSetRowView?(newRowView: RowView | null, oldRowView: RowView | null, rowFastener: ControllerFastener<C, RowController>): void;

  controllerDidSetRowView?(newRowView: RowView | null, oldRowView: RowView | null, rowFastener: ControllerFastener<C, RowController>): void;

  controllerWillSetCell?(newCellController: CellController | null, oldCellController: CellController | null, cellFastener: ControllerFastener<RowController, CellController>, rowFastener: ControllerFastener<C, RowController>): void;

  controllerDidSetCell?(newCellController: CellController | null, oldCellController: CellController | null, cellFastener: ControllerFastener<RowController, CellController>, rowFastener: ControllerFastener<C, RowController>): void;

  controllerWillSetCellTrait?(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, cellFastener: ControllerFastener<RowController, CellController>, rowFastener: ControllerFastener<C, RowController>): void;

  controllerDidSetCellTrait?(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, cellFastener: ControllerFastener<RowController, CellController>, rowFastener: ControllerFastener<C, RowController>): void;

  controllerWillSetCellView?(newCellView: CellView | null, oldCellView: CellView | null, cellFastener: ControllerFastener<RowController, CellController>, rowFastener: ControllerFastener<C, RowController>): void;

  controllerDidSetCellView?(newCellView: CellView | null, oldCellView: CellView | null, cellFastener: ControllerFastener<RowController, CellController>, rowFastener: ControllerFastener<C, RowController>): void;

  controllerWillSetCellContentView?(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null, cellFastener: ControllerFastener<RowController, CellController>, rowFastener: ControllerFastener<C, RowController>): void;

  controllerDidSetCellContentView?(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null, cellFastener: ControllerFastener<RowController, CellController>, rowFastener: ControllerFastener<C, RowController>): void;

  controllerWillSetCellIcon?(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellFastener: ControllerFastener<RowController, CellController>, rowFastener: ControllerFastener<C, RowController>): void;

  controllerDidSetCellIcon?(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellFastener: ControllerFastener<RowController, CellController>, rowFastener: ControllerFastener<C, RowController>): void;
}
