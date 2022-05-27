// Copyright 2015-2022 Swim.inc
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

import type {Trait} from "@swim/model";
import type {PositionGestureInput} from "@swim/view";
import type {ControllerObserver} from "@swim/controller";
import type {ToolView, ToolController} from "@swim/toolbar";
import type {SheetView} from "./SheetView";
import type {SheetController} from "./SheetController";

/** @public */
export interface SheetControllerObserver<C extends SheetController = SheetController> extends ControllerObserver<C> {
  controllerWillAttachSheetTrait?(sheetTrait: Trait, controller: C): void;

  controllerDidDetachSheetTrait?(sheetTrait: Trait, controller: C): void;

  controllerWillAttachSheetView?(sheetView: SheetView, controller: C): void;

  controllerDidDetachSheetView?(sheetView: SheetView, controller: C): void;

  controllerDidScrollSheetView?(sheetView: SheetView, controller: C): void;

  controllerWillAttachBack?(backController: SheetController, controller: C): void;

  controllerDidDetachBack?(backController: SheetController, controller: C): void;

  controllerWillAttachBackView?(backView: SheetView, controller: C): void;

  controllerDidDetachBackView?(backView: SheetView, controller: C): void;

  controllerWillAttachForward?(forwardController: SheetController, controller: C): void;

  controllerDidDetachForward?(forwardController: SheetController, controller: C): void;

  controllerWillAttachForwardView?(forwardView: SheetView, controller: C): void;

  controllerDidDetachForwardView?(forwardView: SheetView, controller: C): void;

  controllerDidSetFullBleed?(fullBleed: boolean, controller: C): void;

  controllerDidSetSearchable?(searchable: boolean, controller: C): void;

  controllerDidSetSearching?(searching: boolean, controller: C): void;

  controllerDidUpdateSearch?(query: string, controller: C): void;

  controllerDidSubmitSearch?(query: string, controller: C): void;

  controllerWillAttachTitle?(titleController: ToolController, controller: C): void;

  controllerDidDetachTitle?(titleController: ToolController, controller: C): void;

  controllerDidPressTitle?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidLongPressTitle?(input: PositionGestureInput, controller: C): void;

  controllerWillAttachHandle?(handleController: ToolController, controller: C): void;

  controllerDidDetachHandle?(handleController: ToolController, controller: C): void;

  controllerDidPressHandle?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidLongPressHandle?(input: PositionGestureInput, controller: C): void;

  controllerWillAttachModeTool?(modeToolController: ToolController, targetToolController: ToolController | null, controller: C): void;

  controllerDidDetachModeTool?(modeToolController: ToolController, controller: C): void;

  controllerWillAttachModeToolView?(modeToolView: ToolView, modeToolController: ToolController, controller: C): void;

  controllerDidDetachModeToolView?(modeToolView: ToolView, modeToolController: ToolController, controller: C): void;

  controllerWillPresentSheetView?(sheetView: SheetView, controller: C): void;

  controllerDidPresentSheetView?(sheetView: SheetView, controller: C): void;

  controllerWillDismissSheetView?(sheetView: SheetView, controller: C): void;

  controllerDidDismissSheetView?(sheetView: SheetView, controller: C): void;
}
