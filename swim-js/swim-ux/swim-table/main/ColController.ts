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
import type {PositionGestureInput} from "@swim/view";
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import type {ColLayout} from "./ColLayout";
import {ColView} from "./ColView";
import {ColTrait} from "./ColTrait";
import type {TextColTrait} from "./TextColTrait";

/** @public */
export interface ColControllerObserver<C extends ColController = ColController> extends ControllerObserver<C> {
  controllerWillAttachColTrait?(colTrait: ColTrait, controller: C): void;

  controllerDidDetachColTrait?(colTrait: ColTrait, controller: C): void;

  controllerWillAttachColView?(colView: ColView, controller: C): void;

  controllerDidDetachColView?(colView: ColView, controller: C): void;

  controllerDidSetColLayout?(colLayout: ColLayout | null, controller: C): void;

  controllerDidPressColView?(input: PositionGestureInput, event: Event | null, colView: ColView, controller: C): void;

  controllerDidLongPressColView?(input: PositionGestureInput, colView: ColView, controller: C): void;
}

/** @public */
export class ColController extends Controller {
  declare readonly observerType?: Class<ColControllerObserver>;

  @TraitViewRef({
    traitType: ColTrait,
    observesTrait: true,
    willAttachTrait(colTrait: ColTrait): void {
      this.owner.callObservers("controllerWillAttachColTrait", colTrait, this.owner);
    },
    didDetachTrait(colTrait: ColTrait): void {
      this.owner.callObservers("controllerDidDetachColTrait", colTrait, this.owner);
    },
    traitDidSetLayout(colLayout: ColLayout | null): void {
      this.owner.callObservers("controllerDidSetColLayout", colLayout, this.owner);
    },
    viewType: ColView,
    observesView: true,
    willAttachView(colView: ColView): void {
      this.owner.callObservers("controllerWillAttachColView", colView, this.owner);
    },
    didDetachView(colView: ColView): void {
      this.owner.callObservers("controllerDidDetachColView", colView, this.owner);
    },
    viewDidPress(input: PositionGestureInput, event: Event | null, colView: ColView): void {
      this.owner.callObservers("controllerDidPressColView", input, event, colView, this.owner);
    },
    viewDidLongPress(input: PositionGestureInput, colView: ColView): void {
      this.owner.callObservers("controllerDidLongPressColView", input, colView, this.owner);
    },
  })
  readonly col!: TraitViewRef<this, ColTrait, ColView> & Observes<ColTrait> & Observes<TextColTrait> & Observes<ColView>;
}
