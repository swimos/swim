// Copyright 2015-2023 Swim.inc
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
import type {ControllerObserver} from "@swim/controller";
import type {CellView} from "../cell/CellView";
import type {CellTrait} from "../cell/CellTrait";
import type {CellController} from "../cell/CellController";
import type {LeafView} from "./LeafView";
import type {LeafTrait} from "./LeafTrait";
import type {LeafController} from "./LeafController";

/** @public */
export interface LeafControllerObserver<C extends LeafController = LeafController> extends ControllerObserver<C> {
  controllerWillAttachLeafTrait?(leafTrait: LeafTrait, controller: C): void;

  controllerDidDetachLeafTrait?(leafTrait: LeafTrait, controller: C): void;

  controllerWillAttachLeafView?(leafView: LeafView, controller: C): void;

  controllerDidDetachLeafView?(leafView: LeafView, controller: C): void;

  controllerWillHighlightLeafView?(leafView: LeafView, controller: C): void;

  controllerDidHighlightLeafView?(leafView: LeafView, controller: C): void;

  controllerWillUnhighlightLeafView?(leafView: LeafView, controller: C): void;

  controllerDidUnhighlightLeafView?(leafView: LeafView, controller: C): void;

  controllerDidEnterLeafView?(leafView: LeafView, controller: C): void;

  controllerDidLeaveLeafView?(leafView: LeafView, controller: C): void;

  controllerDidPressLeafView?(input: PositionGestureInput, event: Event | null, leafView: LeafView, controller: C): void;

  controllerDidLongPressLeafView?(input: PositionGestureInput, leafView: LeafView, controller: C): void;

  controllerWillAttachCell?(cellController: CellController, controller: C): void;

  controllerDidDetachCell?(cellController: CellController, controller: C): void;

  controllerWillAttachCellTrait?(cellTrait: CellTrait, cellController: CellController, controller: C): void;

  controllerDidDetachCellTrait?(cellTrait: CellTrait, cellController: CellController, controller: C): void;

  controllerWillAttachCellView?(cellView: CellView, cellController: CellController, controller: C): void;

  controllerDidDetachCellView?(cellView: CellView, cellController: CellController, controller: C): void;

  controllerDidPressCellView?(input: PositionGestureInput, event: Event | null, cellView: CellView, cellController: CellController, controller: C): void;

  controllerDidLongPressCellView?(input: PositionGestureInput, cellView: CellView, cellController: CellController, controller: C): void;

  controllerWillAttachCellContentView?(cellContentView: HtmlView, cellController: CellController, controller: C): void;

  controllerDidDetachCellContentView?(cellContentView: HtmlView, cellController: CellController, controller: C): void;

  controllerDidSetCellIcon?(cellIcon: Graphics | null, cellController: CellController, controller: C): void;
}
