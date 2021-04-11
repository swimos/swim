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
  componentWillSetTableTrait?(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null, component: C): void;

  componentDidSetTableTrait?(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null, component: C): void;

  componentWillSetTableLayout?(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null, component: C): void;

  componentDidSetTableLayout?(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null, component: C): void;

  componentWillSetTableView?(newTableView: TableView | null, oldTableView: TableView | null, component: C): void;

  componentDidSetTableView?(newTableView: TableView | null, oldTableView: TableView | null, component: C): void;

  componentWillSetCol?(newColComponent: ColComponent | null, oldColComponent: ColComponent | null, colFastener: ComponentFastener<C, ColComponent>): void;

  componentDidSetCol?(newColComponent: ColComponent | null, oldColComponent: ColComponent | null, colFastener: ComponentFastener<C, ColComponent>): void;

  componentWillSetColTrait?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, colFastener: ComponentFastener<C, ColComponent>): void;

  componentDidSetColTrait?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, colFastener: ComponentFastener<C, ColComponent>): void;

  componentWillSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colFastener: ComponentFastener<C, ColComponent>): void;

  componentDidSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colFastener: ComponentFastener<C, ColComponent>): void;

  componentWillSetColView?(newColView: ColView | null, oldColView: ColView | null, colFastener: ComponentFastener<C, ColComponent>): void;

  componentDidSetColView?(newColView: ColView | null, oldColView: ColView | null, colFastener: ComponentFastener<C, ColComponent>): void;

  componentWillSetColHeaderView?(newColHeaderView: HtmlView | null, oldColHeaderView: HtmlView | null, colFastener: ComponentFastener<C, ColComponent>): void;

  componentDidSetColHeaderView?(newColHeaderView: HtmlView | null, oldColHeaderView: HtmlView | null, colFastener: ComponentFastener<C, ColComponent>): void;

  componentWillSetRow?(newRowComponent: RowComponent | null, oldRowComponent: RowComponent | null, rowFastener: ComponentFastener<C, RowComponent>): void;

  componentDidSetRow?(newRowComponent: RowComponent | null, oldRowComponent: RowComponent | null, rowFastener: ComponentFastener<C, RowComponent>): void;

  componentWillSetRowTrait?(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, rowFastener: ComponentFastener<C, RowComponent>): void;

  componentDidSetRowTrait?(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, rowFastener: ComponentFastener<C, RowComponent>): void;

  componentWillSetRowView?(newRowView: RowView | null, oldRowView: RowView | null, rowFastener: ComponentFastener<C, RowComponent>): void;

  componentDidSetRowView?(newRowView: RowView | null, oldRowView: RowView | null, rowFastener: ComponentFastener<C, RowComponent>): void;

  componentWillSetCell?(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  componentDidSetCell?(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  componentWillSetCellTrait?(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  componentDidSetCellTrait?(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  componentWillSetCellView?(newCellView: CellView | null, oldCellView: CellView | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  componentDidSetCellView?(newCellView: CellView | null, oldCellView: CellView | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  componentWillSetCellContentView?(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;

  componentDidSetCellContentView?(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null, cellFastener: ComponentFastener<RowComponent, CellComponent>, rowFastener: ComponentFastener<C, RowComponent>): void;
}
