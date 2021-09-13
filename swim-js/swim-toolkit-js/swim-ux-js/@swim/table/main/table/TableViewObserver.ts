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
import type {HeaderView} from "../header/HeaderView";
import type {TableView} from "./TableView";

export interface TableViewObserver<V extends TableView = TableView> extends HtmlViewObserver<V> {
  viewWillSetHeader?(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null, view: V): void;

  viewDidSetHeader?(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null, view: V): void;

  viewWillSetRow?(newRowView: RowView | null, oldRowView: RowView | null, targetView: View | null, view: V): void;

  viewDidSetRow?(newRowView: RowView | null, oldRowView: RowView | null, targetView: View | null, view: V): void;

  viewWillSetLeaf?(newLeafView: LeafView | null, oldLeafView: LeafView | null, rowFastener: ViewFastener<V, RowView>): void;

  viewDidSetLeaf?(newLeafView: LeafView | null, oldLeafView: LeafView | null, rowFastener: ViewFastener<V, RowView>): void;

  viewWillHighlightLeaf?(leafView: LeafView, rowFastener: ViewFastener<V, RowView>): void;

  viewDidHighlightLeaf?(leafView: LeafView, rowFastener: ViewFastener<V, RowView>): void;

  viewWillUnhighlightLeaf?(leafView: LeafView, rowFastener: ViewFastener<V, RowView>): void;

  viewDidUnhighlightLeaf?(leafView: LeafView, rowFastener: ViewFastener<V, RowView>): void;

  viewDidEnterLeaf?(leafView: LeafView, rowFastener: ViewFastener<V, RowView>): void;

  viewDidLeaveLeaf?(leafView: LeafView, rowFastener: ViewFastener<V, RowView>): void;

  viewDidPressLeaf?(input: PositionGestureInput, event: Event | null, leafView: LeafView, rowFastener: ViewFastener<V, RowView>): void;

  viewDidLongPressLeaf?(input: PositionGestureInput, leafView: LeafView, rowFastener: ViewFastener<V, RowView>): void;

  viewWillSetTree?(newTreeView: TableView | null, oldTreeView: TableView | null, rowFastener: ViewFastener<V, RowView>): void;

  viewDidSetTree?(newTreeView: TableView | null, oldTreeView: TableView | null, rowFastener: ViewFastener<V, RowView>): void;

  viewWillExpandRow?(rowFastener: ViewFastener<V, RowView>): void;

  viewDidExpandRow?(rowFastener: ViewFastener<V, RowView>): void;

  viewWillCollapseRow?(rowFastener: ViewFastener<V, RowView>): void;

  viewDidCollapseRow?(rowFastener: ViewFastener<V, RowView>): void;
}
