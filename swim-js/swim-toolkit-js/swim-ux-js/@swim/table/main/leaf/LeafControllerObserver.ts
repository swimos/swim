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

import type {PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import type {ControllerObserver, ControllerFastener} from "@swim/controller";
import type {CellView} from "../cell/CellView";
import type {CellTrait} from "../cell/CellTrait";
import type {CellController} from "../cell/CellController";
import type {LeafView} from "./LeafView";
import type {LeafTrait} from "./LeafTrait";
import type {LeafController} from "./LeafController";

export interface LeafControllerObserver<C extends LeafController = LeafController> extends ControllerObserver<C> {
  controllerWillSetLeafTrait?(newLeafTrait: LeafTrait | null, oldLeafTrait: LeafTrait | null, controller: C): void;

  controllerDidSetLeafTrait?(newLeafTrait: LeafTrait | null, oldLeafTrait: LeafTrait | null, controller: C): void;

  controllerWillSetLeafView?(newLeafView: LeafView | null, oldLeafView: LeafView | null, controller: C): void;

  controllerDidSetLeafView?(newLeafView: LeafView | null, oldLeafView: LeafView | null, controller: C): void;

  controllerWillHighlightLeafView?(leafView: LeafView, controller: C): void;

  controllerDidHighlightLeafView?(leafView: LeafView, controller: C): void;

  controllerWillUnhighlightLeafView?(leafView: LeafView, controller: C): void;

  controllerDidUnhighlightLeafView?(leafView: LeafView, controller: C): void;

  controllerDidPressLeafView?(input: PositionGestureInput, event: Event | null, leafView: LeafView, controller: C): void;

  controllerDidLongPressLeafView?(input: PositionGestureInput, leafView: LeafView, controller: C): void;

  controllerWillSetCell?(newCellController: CellController | null, oldCellController: CellController | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerDidSetCell?(newCellController: CellController | null, oldCellController: CellController | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerWillSetCellTrait?(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerDidSetCellTrait?(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerWillSetCellView?(newCellView: CellView | null, oldCellView: CellView | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerDidSetCellView?(newCellView: CellView | null, oldCellView: CellView | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerDidPressCellView?(input: PositionGestureInput, event: Event | null, cellView: CellView, cellFastener: ControllerFastener<C, CellController>): void;

  controllerDidLongPressCellView?(input: PositionGestureInput, cellView: CellView, cellFastener: ControllerFastener<C, CellController>): void;

  controllerWillSetCellContentView?(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerDidSetCellContentView?(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerWillSetCellIcon?(newIcon: Graphics | null, oldIcon: Graphics | null, cellFastener: ControllerFastener<C, CellController>): void;

  controllerDidSetCellIcon?(newIcon: Graphics | null, oldIcon: Graphics | null, cellFastener: ControllerFastener<C, CellController>): void;
}
