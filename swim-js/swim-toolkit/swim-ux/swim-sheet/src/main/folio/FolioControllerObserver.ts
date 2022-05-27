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
import type {ToolView, ToolController, BarView, BarController} from "@swim/toolbar";
import type {DrawerView} from "@swim/window";
import type {SheetView} from "../sheet/SheetView";
import type {SheetController} from "../sheet/SheetController";
import type {StackControllerObserver} from "../stack/StackControllerObserver";
import type {FolioStyle, FolioView} from "./FolioView";
import type {FolioController} from "./FolioController";

/** @public */
export interface FolioControllerObserver<C extends FolioController = FolioController> extends StackControllerObserver<C> {
  controllerWillAttachFolioTrait?(folioTrait: Trait, controller: C): void;

  controllerDidDetachFolioTrait?(folioTrait: Trait, controller: C): void;

  controllerWillAttachFolioView?(folioView: FolioView, controller: C): void;

  controllerDidDetachFolioView?(folioView: FolioView, controller: C): void;

  controllerDidSetFolioStyle(folioStyle: FolioStyle | undefined, controller: C): void;

  controllerDidSetFullBleed(fullBleed: boolean, controller: C): void;

  controllerDidSetFullScreen(fullScreen: boolean, controller: C): void;

  controllerWillAttachAppBar?(appBarController: BarController, controller: C): void;

  controllerDidDetachAppBar?(appBarController: BarController, controller: C): void;

  controllerWillAttachAppBarView?(appBarView: BarView, controller: C): void;

  controllerDidDetachAppBarView?(appBarView: BarView, controller: C): void;

  controllerWillAttachDrawerView?(drawerView: DrawerView, controller: C): void;

  controllerDidDetachDrawerView?(drawerView: DrawerView, controller: C): void;

  controllerDidPressMenuButton?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidPressActionButton?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerWillAttachCover?(coverController: SheetController, controller: C): void;

  controllerDidDetachCover?(coverController: SheetController, controller: C): void;

  controllerWillAttachCoverTrait?(coverTrait: Trait, controller: C): void;

  controllerDidDetachCoverTrait?(coverTrait: Trait, controller: C): void;

  controllerWillAttachCoverView?(coverView: SheetView, controller: C): void;

  controllerDidDetachCoverView?(coverView: SheetView, controller: C): void;

  controllerWillAttachCoverModeTool?(modeToolController: ToolController, controller: C): void;

  controllerDidDetachCoverModeTool?(modeToolController: ToolController, controller: C): void;

  controllerWillAttachCoverModeToolView?(modeToolView: ToolView, modeToolController: ToolController, controller: C): void;

  controllerDidDetachCoverModeToolView?(modeToolView: ToolView, modeToolController: ToolController, controller: C): void;
}
