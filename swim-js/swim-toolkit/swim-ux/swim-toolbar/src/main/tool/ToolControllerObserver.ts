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

import type {ControllerObserver} from "@swim/controller";
import type {ToolLayout} from "../layout/ToolLayout";
import type {ToolView} from "./ToolView";
import type {ToolTrait} from "./ToolTrait";
import type {ToolController} from "./ToolController";

/** @public */
export interface ToolControllerObserver<C extends ToolController = ToolController> extends ControllerObserver<C> {
  controllerWillAttachToolTrait?(toolTrait: ToolTrait, controller: C): void;

  controllerDidDetachToolTrait?(toolTrait: ToolTrait, controller: C): void;

  controllerWillAttachToolView?(toolView: ToolView, controller: C): void;

  controllerDidDetachToolView?(toolView: ToolView, controller: C): void;

  controllerWillSetToolLayout?(newToolLayout: ToolLayout | null, oldToolLayout: ToolLayout | null, controller: C): void;

  controllerDidSetToolLayout?(newToolLayout: ToolLayout | null, oldToolLayout: ToolLayout | null, controller: C): void;
}
