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

import type {PositionGestureInput, View} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import type {LeafView} from "../leaf/LeafView";
import type {RowView} from "../row/RowView";
import type {HeaderView} from "../header/HeaderView";
import type {TableView} from "./TableView";

/** @public */
export interface TableViewObserver<V extends TableView = TableView> extends HtmlViewObserver<V> {
  viewWillAttachHeader?(headerView: HeaderView, view: V): void;

  viewDidDetachHeader?(headerView: HeaderView, view: V): void;

  viewWillAttachRow?(rowView: RowView, targetView: View | null, view: V): void;

  viewDidDetachRow?(rowView: RowView, view: V): void;

  viewWillAttachLeaf?(leafView: LeafView, rowView: RowView): void;

  viewDidDetachLeaf?(leafView: LeafView, rowView: RowView): void;

  viewWillHighlightLeaf?(leafView: LeafView, rowView: RowView): void;

  viewDidHighlightLeaf?(leafView: LeafView, rowView: RowView): void;

  viewWillUnhighlightLeaf?(leafView: LeafView, rowView: RowView): void;

  viewDidUnhighlightLeaf?(leafView: LeafView, rowView: RowView): void;

  viewDidEnterLeaf?(leafView: LeafView, rowView: RowView): void;

  viewDidLeaveLeaf?(leafView: LeafView, rowView: RowView): void;

  viewDidPressLeaf?(input: PositionGestureInput, event: Event | null, leafView: LeafView, rowView: RowView): void;

  viewDidLongPressLeaf?(input: PositionGestureInput, leafView: LeafView, rowView: RowView): void;

  viewWillAttachTree?(treeView: TableView, rowView: RowView): void;

  viewDidDetachTree?(treeView: TableView, rowView: RowView): void;

  viewWillExpandRow?(rowView: RowView): void;

  viewDidExpandRow?(rowView: RowView): void;

  viewWillCollapseRow?(rowView: RowView): void;

  viewDidCollapseRow?(rowView: RowView): void;
}
