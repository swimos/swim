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
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {AxisView} from "./AxisView";
import {TopAxisView} from "./AxisView";
import {RightAxisView} from "./AxisView";
import {BottomAxisView} from "./AxisView";
import {LeftAxisView} from "./AxisView";
import {AxisTrait} from "./AxisTrait";
import {TopAxisTrait} from "./AxisTrait";
import {RightAxisTrait} from "./AxisTrait";
import {BottomAxisTrait} from "./AxisTrait";
import {LeftAxisTrait} from "./AxisTrait";

/** @public */
export interface AxisControllerObserver<D = unknown, C extends AxisController<D> = AxisController<D>> extends ControllerObserver<C> {
  controllerWillAttachAxisTrait?(axisTrait: AxisTrait<D>, controller: C): void;

  controllerDidDetachAxisTrait?(axisTrait: AxisTrait<D>, controller: C): void;

  controllerWillAttachAxisView?(axisView: AxisView<D>, controller: C): void;

  controllerDidDetachAxisView?(axisView: AxisView<D>, controller: C): void;
}

/** @public */
export abstract class AxisController<D = unknown> extends Controller {
  declare readonly observerType?: Class<AxisControllerObserver<D>>;

  @TraitViewRef({
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
}

/** @public */
export class TopAxisController<X = unknown> extends AxisController<X> {
  @TraitViewRef({
    extends: true,
    traitType: TopAxisTrait,
    viewType: TopAxisView,
  })
  override readonly axis!: TraitViewRef<this, TopAxisTrait<X>, TopAxisView<X>> & AxisController<X>["axis"];
}

/** @public */
export class RightAxisController<Y = unknown> extends AxisController<Y> {
  @TraitViewRef({
    extends: true,
    traitType: RightAxisTrait,
    viewType: RightAxisView,
  })
  override readonly axis!: TraitViewRef<this, RightAxisTrait<Y>, RightAxisView<Y>> & AxisController<Y>["axis"];
}

/** @public */
export class BottomAxisController<X = unknown> extends AxisController<X> {
  @TraitViewRef({
    extends: true,
    traitType: BottomAxisTrait,
    viewType: BottomAxisView,
  })
  override readonly axis!: TraitViewRef<this, BottomAxisTrait<X>, BottomAxisView<X>> & AxisController<X>["axis"];
}

/** @public */
export class LeftAxisController<Y = unknown> extends AxisController<Y> {
  @TraitViewRef({
    extends: true,
    traitType: LeftAxisTrait,
    viewType: LeftAxisView,
  })
  override readonly axis!: TraitViewRef<this, LeftAxisTrait<Y>, LeftAxisView<Y>> & AxisController<Y>["axis"];
}
