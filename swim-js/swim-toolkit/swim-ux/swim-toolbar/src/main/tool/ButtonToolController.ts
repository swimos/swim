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

import type {Class, Observes} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import type {Trait} from "@swim/model";
import type {Graphics} from "@swim/graphics";
import {TraitViewRef} from "@swim/controller";
import {ToolController} from "./ToolController";
import {ButtonToolView} from "./ButtonToolView";
import type {ButtonToolControllerObserver} from "./ButtonToolControllerObserver";

/** @public */
export class ButtonToolController extends ToolController {
  override readonly observerType?: Class<ButtonToolControllerObserver>;

  @TraitViewRef<ButtonToolController["tool"]>({
    extends: true,
    viewType: ButtonToolView,
    observesView: true,
    viewDidSetGraphics(toolIcon: Graphics | null): void {
      this.owner.callObservers("controllerDidSetToolIcon", toolIcon, this.owner);
    },
  })
  override readonly tool!: TraitViewRef<this, Trait, ButtonToolView> & ToolController["tool"] & Observes<ButtonToolView>;
  static override readonly tool: FastenerClass<ButtonToolController["tool"]>;
}
