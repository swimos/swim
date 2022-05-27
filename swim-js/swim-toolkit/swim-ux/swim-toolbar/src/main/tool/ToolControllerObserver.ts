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

import type {PositionGestureInput} from "@swim/view";
import type {ControllerObserver} from "@swim/controller";
import type {ToolLayout} from "../layout/ToolLayout";
import type {ToolView} from "./ToolView";
import type {ToolController} from "./ToolController";

/** @public */
export interface ToolControllerObserver<C extends ToolController = ToolController> extends ControllerObserver<C> {
  controllerWillAttachToolView?(toolView: ToolView, controller: C): void;

  controllerDidDetachToolView?(toolView: ToolView, controller: C): void;

  controllerDidSetToolLayout?(toolLayout: ToolLayout | null, controller: C): void;

  controllerDidPressToolView?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidLongPressToolView?(input: PositionGestureInput, controller: C): void;
}
