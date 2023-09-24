// Copyright 2015-2023 Nstream, inc.
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

import type {Class} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Trait} from "@swim/model";
import type {Graphics} from "@swim/graphics";
import {TraitViewRef} from "@swim/controller";
import type {ToolControllerObserver} from "./ToolController";
import {ToolController} from "./ToolController";
import {ButtonToolView} from "./ButtonToolView";

/** @public */
export interface ButtonToolControllerObserver<C extends ButtonToolController = ButtonToolController> extends ToolControllerObserver<C> {
  controllerWillAttachToolView?(toolView: ButtonToolView, controller: C): void;

  controllerDidDetachToolView?(toolView: ButtonToolView, controller: C): void;

  controllerDidSetToolIcon?(toolIcon: Graphics | null, controller: C): void;
}

/** @public */
export class ButtonToolController extends ToolController {
  declare readonly observerType?: Class<ButtonToolControllerObserver>;

  @TraitViewRef({
    extends: true,
    viewType: ButtonToolView,
    observesView: true,
    viewDidSetGraphics(toolIcon: Graphics | null): void {
      this.owner.callObservers("controllerDidSetToolIcon", toolIcon, this.owner);
    },
  })
  override readonly tool!: TraitViewRef<this, Trait, ButtonToolView> & ToolController["tool"] & Observes<ButtonToolView>;
}
