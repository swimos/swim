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

import type {HtmlView} from "@swim/dom";
import type {ComponentObserver, ComponentFastener} from "@swim/component";
import type {TableLayout} from "../layout/TableLayout";
import type {ColLayout} from "../layout/ColLayout";
import type {CellView} from "../cell/CellView";
import type {CellTrait} from "../cell/CellTrait";
import type {CellComponent} from "../cell/CellComponent";
import type {ColView} from "../col/ColView";
import type {ColTrait} from "../col/ColTrait";
import type {ColComponent} from "../col/ColComponent";
import type {RowView} from "../row/RowView";
import type {RowTrait} from "../row/RowTrait";
import type {RowComponent} from "../row/RowComponent";
import type {TableView} from "./TableView";
import type {TableTrait} from "./TableTrait";
import type {TableComponent} from "./TableComponent";

export interface TableComponentObserver<C extends TableComponent = TableComponent> extends ComponentObserver<C> {
  tableWillSetTrait?(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null, component: C): void;

  tableDidSetTrait?(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null, component: C): void;

  tableWillSetLayout?(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null, component: C): void;

  tableDidSetLayout?(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null, component: C): void;

  tableWillSetView?(newTableView: TableView | null, oldTableView: TableView | null, component: C): void;

  tableDidSetView?(newTableView: TableView | null, oldTableView: TableView | null, component: C): void;

  tableWillSetCol?(newColComponent: ColComponent | null, oldColComponent: ColComponent | null, colFastener: ComponentFastener<C, ColComponent>): void;

  tableDidSetCol?(newColComponent: ColComponent | null, oldColComponent: ColComponent | null, colFastener: ComponentFastener<C, ColComponent>): void;

  tableWillSetColTrait?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, colFastener: ComponentFastener<C, ColComponent>): void;

  tableDidSetColTrait?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, colFastener: ComponentFastener<C, ColComponent>): void;

  tableWillSetColView?(newColView: ColView | null, oldColView: ColView | null, colFastener: ComponentFastener<C, ColComponent>): void;

  tableDidSetColView?(newColView: ColView | null, oldColView: ColView | null, colFastener: ComponentFastener<C, ColComponent>): void;

  tableWillSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colFastener: ComponentFastener<C, ColComponent>): void;

  tableDidSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colFastener: ComponentFastener<C, ColComponent>): void;

  tableWillSetColHeaderView?(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null, colFastener: ComponentFastener<C, ColComponent>): void;

  tableDidSetColHeaderView?(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null, colFastener: ComponentFastener<C, ColComponent>): void;

  tableWillSetRow?(newRowComponent: RowComponent | null, oldRowComponent: RowComponent | null, rowFastener: ComponentFastener<C, RowComponent>): void;

  tableDidSetRow?(newRowComponent: RowComponent | null, oldRowComponent: RowComponent | null, rowFastener: ComponentFastener<C, RowComponent>): void;

  tableWillSetRowTrait?(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, rowFastener: ComponentFastener<C, RowComponent>): void;

  tableDidSetRowTrait?(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, rowFastener: ComponentFastener<C, RowComponent>): void;

  tableWillSetRowView?(newRowView: RowView | null, oldRowView: RowView | null, rowFastener: ComponentFastener<C, RowComponent>): void;

  tableDidSetRowView?(newRowView: RowView | null, oldRowView: RowView | null, rowFastener: ComponentFastener<C, RowComponent>): void;

  tableWillSetCell?(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  tableDidSetCell?(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  tableWillSetCellTrait?(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  tableDidSetCellTrait?(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  tableWillSetCellView?(newCellView: CellView | null, oldCellView: CellView | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  tableDidSetCellView?(newCellView: CellView | null, oldCellView: CellView | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  tableWillSetCellContentView?(newContentView: HtmlView | null, oldContentView: HtmlView | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  tableDidSetCellContentView?(newContentView: HtmlView | null, oldContentView: HtmlView | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;
}
