// Copyright 2015-2023 Swim.inc
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
import {Controller, TraitViewRef} from "@swim/controller";
import type {ColLayout} from "../layout/ColLayout";
import {ColView} from "./ColView";
import {ColTrait} from "./ColTrait";
import type {TextColTrait} from "./TextColTrait";
import type {ColControllerObserver} from "./ColControllerObserver";

/** @public */
export class ColController extends Controller {
  override readonly observerType?: Class<ColControllerObserver>;

  @TraitViewRef<ColController["col"]>({
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
    willAttachView(colView: ColView): void {
      this.owner.callObservers("controllerWillAttachColView", colView, this.owner);
    },
    didDetachView(colView: ColView): void {
      this.owner.callObservers("controllerDidDetachColView", colView, this.owner);
    },
  })
  readonly col!: TraitViewRef<this, ColTrait, ColView> & Observes<ColTrait & TextColTrait>;
  static readonly col: FastenerClass<ColController["col"]>;
}
