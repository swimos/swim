// Copyright 2015-2024 Nstream, inc.
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
import {Property} from "@swim/component";
import type {Trait} from "@swim/model";
import type {PositionGestureInput} from "@swim/view";
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {ToolLayout} from "./ToolLayout";
import {ToolView} from "./ToolView";

/** @public */
export interface ToolControllerObserver<C extends ToolController = ToolController> extends ControllerObserver<C> {
  controllerWillAttachToolView?(toolView: ToolView, controller: C): void;

  controllerDidDetachToolView?(toolView: ToolView, controller: C): void;

  controllerDidSetToolLayout?(toolLayout: ToolLayout | null, controller: C): void;

  controllerDidPressToolView?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidLongPressToolView?(input: PositionGestureInput, controller: C): void;
}

/** @public */
export class ToolController extends Controller {
  declare readonly observerType?: Class<ToolControllerObserver>;

  @TraitViewRef({
    viewType: ToolView,
    observesView: true,
    willAttachView(toolView: ToolView): void {
      this.owner.callObservers("controllerWillAttachToolView", toolView, this.owner);
    },
    didDetachView(toolView: ToolView): void {
      this.owner.callObservers("controllerDidDetachToolView", toolView, this.owner);
    },
    viewDidPress(input: PositionGestureInput, event: Event | null): void {
      this.owner.callObservers("controllerDidPressToolView", input, event, this.owner);
    },
    viewDidLongPress(input: PositionGestureInput): void {
      this.owner.callObservers("controllerDidLongPressToolView", input, this.owner);
    },
  })
  readonly tool!: TraitViewRef<this, Trait, ToolView> & Observes<ToolView>;

  @Property({
    valueType: ToolLayout,
    value: null,
    didSetValue(toolLayout: ToolLayout | null): void {
      this.owner.callObservers("controllerDidSetToolLayout", toolLayout, this.owner);
    },
  })
  readonly layout!: Property<this, ToolLayout | null>;
}
