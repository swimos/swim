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
import type {Graphics} from "@swim/graphics";
import {TraitViewRef} from "@swim/controller";
import type {ColControllerObserver} from "./ColController";
import {ColController} from "./ColController";
import {IconColView} from "./IconColView";
import {IconColTrait} from "./IconColTrait";

/** @public */
export interface IconColControllerObserver<C extends IconColController = IconColController> extends ColControllerObserver<C> {
  controllerWillAttachColTrait?(colTrait: IconColTrait, controller: C): void;

  controllerDidDetachColTrait?(colTrait: IconColTrait, controller: C): void;

  controllerWillAttachColView?(colView: IconColView, controller: C): void;

  controllerDidDetachColView?(colView: IconColView, controller: C): void;

  controllerDidSetColIcon?(colIcon: Graphics | null, controller: C): void;
}

/** @public */
export class IconColController extends ColController {
  declare readonly observerType?: Class<IconColControllerObserver>;

  protected setIcon(icon: Graphics | null): void {
    const colView = this.col.view;
    if (colView !== null) {
      colView.graphics.set(icon);
    }
  }

  @TraitViewRef({
    extends: true,
    traitType: IconColTrait,
    observesTrait: true,
    initTrait(colTrait: IconColTrait): void {
      this.owner.setIcon(colTrait.icon.value);
    },
    deinitTrait(colTrait: IconColTrait): void {
      this.owner.setIcon(null);
    },
    traitDidSetIcon(icon: Graphics | null): void {
      this.owner.setIcon(icon);
    },
    viewType: IconColView,
    observesView: true,
    initView(colView: IconColView): void {
      const colTrait = this.trait;
      if (colTrait !== null) {
        this.owner.setIcon(colTrait.icon.value);
      }
    },
    viewDidSetGraphics(colIcon: Graphics | null): void {
      this.owner.callObservers("controllerDidSetColIcon", colIcon, this.owner);
    },
  })
  override readonly col!: TraitViewRef<this, IconColTrait, IconColView> & ColController["col"] & Observes<IconColTrait> & Observes<IconColView>;
}
