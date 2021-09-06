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
import type {ControllerObserver, ControllerFastener} from "@swim/controller";
import type {CellView} from "../cell/CellView";
import type {CellTrait} from "../cell/CellTrait";
import type {CellController} from "../cell/CellController";
import type {RowView} from "./RowView";
import type {RowTrait} from "./RowTrait";
import type {RowController} from "./RowController";

export interface RowControllerObserver<C extends RowController = RowController> extends ControllerObserver<C> {
  controllerWillSetRowTrait?(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, controller: C): void;

  controllerDidSetRowTrait?(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, controller: C): void;

  controllerWillSetRowView?(newRowView: RowView | null, oldRowView: RowView | null, controller: C): void;

  controllerDidSetRowView?(newRowView: RowView | null, oldRowView: RowView | null, controller: C): void;

  controllerWillSetCell?(newCellController: CellController | null, oldCellController: CellController | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerDidSetCell?(newCellController: CellController | null, oldCellController: CellController | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerWillSetCellTrait?(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerDidSetCellTrait?(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerWillSetCellView?(newCellView: CellView | null, oldCellView: CellView | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerDidSetCellView?(newCellView: CellView | null, oldCellView: CellView | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerWillSetCellContentView?(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerDidSetCellContentView?(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null, cellFastener: ControllerFastener<C, CellController>): void;
}
