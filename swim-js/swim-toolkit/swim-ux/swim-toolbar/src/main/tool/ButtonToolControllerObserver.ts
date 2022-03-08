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
import type {Graphics} from "@swim/graphics";
import type {ToolControllerObserver} from "./ToolControllerObserver";
import type {ButtonToolView} from "./ButtonToolView";
import type {ButtonToolTrait} from "./ButtonToolTrait";
import type {ButtonToolController} from "./ButtonToolController";

/** @public */
export interface ButtonToolControllerObserver<C extends ButtonToolController = ButtonToolController> extends ToolControllerObserver<C> {
  controllerWillAttachToolTrait?(toolTrait: ButtonToolTrait, controller: C): void;

  controllerDidDetachToolTrait?(toolTrait: ButtonToolTrait, controller: C): void;

  controllerWillAttachToolView?(toolView: ButtonToolView, controller: C): void;

  controllerDidDetachToolView?(toolView: ButtonToolView, controller: C): void;

  controllerWillSetToolIcon?(newToolIcon: Graphics | null, oldToolIcon: Graphics | null, controller: C): void;

  controllerDidSetToolIcon?(newToolIcon: Graphics | null, oldToolIcon: Graphics | null, controller: C): void;

  controllerDidPressToolView?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidLongPressToolView?(input: PositionGestureInput, controller: C): void;
}
