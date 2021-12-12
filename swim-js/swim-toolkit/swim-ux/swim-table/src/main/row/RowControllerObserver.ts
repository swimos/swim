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

import type {LeafControllerObserver} from "../leaf/LeafControllerObserver";
import type {RowView} from "./RowView";
import type {RowTrait} from "./RowTrait";
import type {RowController} from "./RowController";
import type {TableView} from "../table/TableView";
import type {TableTrait} from "../table/TableTrait";
import type {TableController} from "../table/TableController";

/** @public */
export interface RowControllerObserver<C extends RowController = RowController> extends LeafControllerObserver<C> {
  controllerWillAttachRowTrait?(rowTrait: RowTrait, controller: C): void;

  controllerDidDetachRowTrait?(rowTrait: RowTrait, controller: C): void;

  controllerWillAttachRowView?(rowView: RowView, controller: C): void;

  controllerDidDetachRowView?(rowView: RowView, controller: C): void;

  controllerWillAttachTree?(treeController: TableController, controller: C): void;

  controllerDidDetachTree?(treeController: TableController, controller: C): void;

  controllerWillAttachTreeTrait?(treeTrait: TableTrait, treeController: TableController, controller: C): void;

  controllerDidDetachTreeTrait?(treeTrait: TableTrait, treeController: TableController, controller: C): void;

  controllerWillAttachTreeView?(treeView: TableView, treeController: TableController, controller: C): void;

  controllerDidDetachTreeView?(treeView: TableView, treeController: TableController, controller: C): void;

  controllerWillExpandRowView?(rowView: RowView, controller: C): void;

  controllerDidExpandRowView?(rowView: RowView, controller: C): void;

  controllerWillCollapseRowView?(rowView: RowView, controller: C): void;

  controllerDidCollapseRowView?(rowView: RowView, controller: C): void;
}
