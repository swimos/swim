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

import type {PositionGestureInput} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import type {LeafView} from "../leaf/LeafView";
import type {RowView} from "./RowView";
import type {TableView} from "../table/TableView";

/** @public */
export interface RowViewObserver<V extends RowView = RowView> extends HtmlViewObserver<V> {
  viewWillAttachLeaf?(leafView: LeafView, view: V): void;

  viewDidDetachLeaf?(leafView: LeafView, view: V): void;

  viewWillHighlightLeaf?(leafView: LeafView, view: V): void;

  viewDidHighlightLeaf?(leafView: LeafView, view: V): void;

  viewWillUnhighlightLeaf?(leafView: LeafView, view: V): void;

  viewDidUnhighlightLeaf?(leafView: LeafView, view: V): void;

  viewDidEnterLeaf?(leafView: LeafView, view: V): void;

  viewDidLeaveLeaf?(leafView: LeafView, view: V): void;

  viewDidPressLeaf?(input: PositionGestureInput, event: Event | null, leafView: LeafView, view: V): void;

  viewDidLongPressLeaf?(input: PositionGestureInput, leafView: LeafView, view: V): void;

  viewWillAttachTree?(treeView: TableView, view: V): void;

  viewDidDetachTree?(treeView: TableView, view: V): void;

  viewWillExpand?(view: V): void;

  viewDidExpand?(view: V): void;

  viewWillCollapse?(view: V): void;

  viewDidCollapse?(view: V): void;
}
