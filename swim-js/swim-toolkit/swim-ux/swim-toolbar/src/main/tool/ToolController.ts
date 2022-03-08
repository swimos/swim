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

import type {Class} from "@swim/util";
import {Affinity, MemberFastenerClass, Property} from "@swim/component";
import {Controller, TraitViewRef} from "@swim/controller";
import {AnyToolLayout, ToolLayout} from "../layout/ToolLayout";
import {ToolView} from "./ToolView";
import {ToolTrait} from "./ToolTrait";
import {TitleToolTrait} from "./TitleToolTrait";
import {ButtonToolTrait} from "./ButtonToolTrait";
import type {ToolControllerObserver} from "./ToolControllerObserver";
import {TitleToolController} from "../"; // forward import
import {ButtonToolController} from "../"; // forward import

/** @public */
export class ToolController extends Controller {
  override readonly observerType?: Class<ToolControllerObserver>;

  @TraitViewRef<ToolController, ToolTrait, ToolView>({
    traitType: ToolTrait,
    observesTrait: true,
    initTrait(toolTrait: ToolTrait): void {
      this.owner.layout.setValue(toolTrait.layout.value, Affinity.Intrinsic);
    },
    willAttachTrait(toolTrait: ToolTrait): void {
      this.owner.callObservers("controllerWillAttachToolTrait", toolTrait, this.owner);
    },
    didDetachTrait(toolTrait: ToolTrait): void {
      this.owner.callObservers("controllerDidDetachToolTrait", toolTrait, this.owner);
    },
    traitDidSetLayout(newLayout: ToolLayout | null, oldLayout: ToolLayout | null): void {
      this.owner.layout.setValue(newLayout, Affinity.Intrinsic);
    },
    viewType: ToolView,
    willAttachView(toolView: ToolView): void {
      this.owner.callObservers("controllerWillAttachToolView", toolView, this.owner);
    },
    didDetachView(toolView: ToolView): void {
      this.owner.callObservers("controllerDidDetachToolView", toolView, this.owner);
    },
  })
  readonly tool!: TraitViewRef<this, ToolTrait, ToolView>;
  static readonly tool: MemberFastenerClass<ToolController, "tool">;

  @Property<ToolController, ToolLayout | null, AnyToolLayout | null>({
    type: ToolLayout,
    value: null,
    willSetValue(newLayout: ToolLayout | null, oldLayout: ToolLayout | null): void {
      this.owner.callObservers("controllerWillSetToolLayout", newLayout, oldLayout, this.owner);
    },
    didSetValue(newLayout: ToolLayout | null, oldLayout: ToolLayout | null): void {
      this.owner.callObservers("controllerDidSetToolLayout", newLayout, oldLayout, this.owner);
    },
  })
  readonly layout!: Property<this, ToolLayout | null, AnyToolLayout | null>;

  static fromTrait(toolTrait: ToolTrait): ToolController {
    if (toolTrait instanceof TitleToolTrait) {
      return new TitleToolController();
    } else if (toolTrait instanceof ButtonToolTrait) {
      return new ButtonToolController();
    } else {
      return new ToolController();
    }
  }
}
