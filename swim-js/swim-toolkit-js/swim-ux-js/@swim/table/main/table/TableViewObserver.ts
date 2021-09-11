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

import type {View, ViewFastener, PositionGestureInput} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import type {LeafView} from "../leaf/LeafView";
import type {RowView} from "../row/RowView";
import type {TableView} from "./TableView";

export interface TableViewObserver<V extends TableView = TableView> extends HtmlViewObserver<V> {
  viewWillSetRow?(newRowView: RowView | null, oldRowView: RowView | null, targetView: View | null, view: V): void;

  viewDidSetRow?(newRowView: RowView | null, oldRowView: RowView | null, targetView: View | null, view: V): void;

  viewWillSetLeaf?(newLeafView: LeafView | null, oldLeafView: LeafView | null, rowFastener: ViewFastener<TableView, RowView>): void;

  viewDidSetLeaf?(newLeafView: LeafView | null, oldLeafView: LeafView | null, rowFastener: ViewFastener<TableView, RowView>): void;

  viewWillHighlightLeaf?(leafView: LeafView, rowFastener: ViewFastener<TableView, RowView>): void;

  viewDidHighlightLeaf?(leafView: LeafView, rowFastener: ViewFastener<TableView, RowView>): void;

  viewWillUnhighlightLeaf?(leafView: LeafView, rowFastener: ViewFastener<TableView, RowView>): void;

  viewDidUnhighlightLeaf?(leafView: LeafView, rowFastener: ViewFastener<TableView, RowView>): void;

  viewDidPressLeaf?(input: PositionGestureInput, event: Event | null, leafView: LeafView, rowFastener: ViewFastener<TableView, RowView>): void;

  viewDidLongPressLeaf?(input: PositionGestureInput, leafView: LeafView, rowFastener: ViewFastener<TableView, RowView>): void;

  viewWillSetTree?(newTreeView: TableView | null, oldTreeView: TableView | null, rowFastener: ViewFastener<TableView, RowView>): void;

  viewDidSetTree?(newTreeView: TableView | null, oldTreeView: TableView | null, rowFastener: ViewFastener<TableView, RowView>): void;

  viewWillExpandTree?(rowFastener: ViewFastener<TableView, RowView>): void;

  viewDidExpandTree?(rowFastener: ViewFastener<TableView, RowView>): void;

  viewWillCollapseTree?(rowFastener: ViewFastener<TableView, RowView>): void;

  viewDidCollapseTree?(rowFastener: ViewFastener<TableView, RowView>): void;
}
