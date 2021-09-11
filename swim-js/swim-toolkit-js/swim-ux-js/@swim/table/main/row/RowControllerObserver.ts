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

import type {LeafControllerObserver} from "../leaf/LeafControllerObserver";
import type {RowView} from "./RowView";
import type {RowTrait} from "./RowTrait";
import type {RowController} from "./RowController";
import type {TableView} from "../table/TableView";
import type {TableTrait} from "../table/TableTrait";
import type {TableController} from "../table/TableController";

export interface RowControllerObserver<C extends RowController = RowController> extends LeafControllerObserver<C> {
  controllerWillSetRowTrait?(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, controller: C): void;

  controllerDidSetRowTrait?(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, controller: C): void;

  controllerWillSetRowView?(newRowView: RowView | null, oldRowView: RowView | null, controller: C): void;

  controllerDidSetRowView?(newRowView: RowView | null, oldRowView: RowView | null, controller: C): void;

  controllerWillSetTree?(newTreeController: TableController | null, oldTreeController: TableController | null, controller: C): void;

  controllerDidSetTree?(newTreeController: TableController | null, oldTreeController: TableController | null, controller: C): void;

  controllerWillSetTreeTrait?(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null, controller: C): void;

  controllerDidSetTreeTrait?(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null, controller: C): void;

  controllerWillSetTreeView?(newTreeView: TableView | null, oldTreeView: TableView | null, controller: C): void;

  controllerDidSetTreeView?(newTreeView: TableView | null, oldTreeView: TableView | null, controller: C): void;

  controllerWillExpandRowView?(rowView: RowView, controller: C): void;

  controllerDidExpandRowView?(rowView: RowView, controller: C): void;

  controllerWillCollapseRowView?(rowView: RowView, controller: C): void;

  controllerDidCollapseRowView?(rowView: RowView, controller: C): void;
}
