// Copyright 2015-2021 Swim Inc.
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
import type {MemberFastenerClass} from "@swim/fastener";
import {GenericController, TraitViewRef} from "@swim/controller";
import {AxisView} from "./AxisView";
import {AxisTrait} from "./AxisTrait";
import type {AxisControllerObserver} from "./AxisControllerObserver";

/** @public */
export abstract class AxisController<D = unknown> extends GenericController {
  override readonly observerType?: Class<AxisControllerObserver<D>>;

  @TraitViewRef<AxisController<D>, AxisTrait<D>, AxisView<D>>({
    traitType: AxisTrait,
    willAttachTrait(axisTrait: AxisTrait<D>): void {
      this.owner.callObservers("controllerWillAttachAxisTrait", axisTrait, this.owner);
    },
    didDetachTrait(axisTrait: AxisTrait<D>): void {
      this.owner.callObservers("controllerDidDetachAxisTrait", axisTrait, this.owner);
    },
    viewType: AxisView,
    willAttachView(axisView: AxisView<D>): void {
      this.owner.callObservers("controllerWillAttachAxisView", axisView, this.owner);
    },
    didDetachView(axisView: AxisView<D>): void {
      this.owner.callObservers("controllerDidDetachAxisView", axisView, this.owner);
    },
  })
  readonly axis!: TraitViewRef<this, AxisTrait<D>, AxisView<D>>;
  static readonly axis: MemberFastenerClass<AxisController, "axis">;
}
