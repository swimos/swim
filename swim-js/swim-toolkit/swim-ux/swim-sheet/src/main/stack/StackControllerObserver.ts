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

import type {Trait} from "@swim/model";
import type {PositionGestureInput} from "@swim/view";
import type {ControllerObserver} from "@swim/controller";
import type {ToolController, BarView, BarController} from "@swim/toolbar";
import type {SheetView} from "../sheet/SheetView";
import type {SheetController} from "../sheet/SheetController";
import type {StackView} from "./StackView";
import type {StackController} from "./StackController";

/** @public */
export interface StackControllerObserver<C extends StackController = StackController> extends ControllerObserver<C> {
  controllerWillAttachStackTrait?(stackTrait: Trait, controller: C): void;

  controllerDidDetachStackTrait?(stackTrait: Trait, controller: C): void;

  controllerWillAttachStackView?(stackView: StackView, controller: C): void;

  controllerDidDetachStackView?(stackView: StackView, controller: C): void;

  controllerWillAttachNavBar?(navBarController: BarController, controller: C): void;

  controllerDidDetachNavBar?(navBarController: BarController, controller: C): void;

  controllerWillAttachNavBarView?(navBarView: BarView, controller: C): void;

  controllerDidDetachNavBarView?(navBarView: BarView, controller: C): void;

  controllerDidPressCloseButton?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidPressBackButton?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidPressSearchButton?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerWillAttachSheet?(sheetController: SheetController, controller: C): void;

  controllerDidDetachSheet?(sheetController: SheetController, controller: C): void;

  controllerWillAttachSheetTrait?(sheetTrait: Trait, sheetController: SheetController, controller: C): void;

  controllerDidDetachSheetTrait?(sheetTrait: Trait, sheetController: SheetController, controller: C): void;

  controllerWillAttachSheetView?(sheetView: SheetView, sheetController: SheetController, controller: C): void;

  controllerDidDetachSheetView?(sheetView: SheetView, sheetController: SheetController, controller: C): void;

  controllerWillAttachSheetTitle?(titleController: ToolController, sheetController: SheetController, controller: C): void;

  controllerDidDetachSheetTitle?(titleController: ToolController, sheetController: SheetController, controller: C): void;

  controllerWillAttachFront?(frontController: SheetController, controller: C): void;

  controllerDidDetachFront?(frontController: SheetController, controller: C): void;

  controllerWillAttachFrontTrait?(frontTrait: Trait, controller: C): void;

  controllerDidDetachFrontTrait?(frontTrait: Trait, controller: C): void;

  controllerWillAttachFrontView?(frontView: SheetView, controller: C): void;

  controllerDidDetachFrontView?(frontView: SheetView, controller: C): void;
}
