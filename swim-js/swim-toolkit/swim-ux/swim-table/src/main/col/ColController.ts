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

import type {Class} from "@swim/util";
import type {MemberFastenerClass} from "@swim/component";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {Controller, TraitViewRef} from "@swim/controller";
import type {ColLayout} from "../layout/ColLayout";
import {ColView} from "./ColView";
import {ColLabel, ColTrait} from "./ColTrait";
import type {ColControllerObserver} from "./ColControllerObserver";

/** @public */
export class ColController extends Controller {
  override readonly observerType?: Class<ColControllerObserver>;

  @TraitViewRef<ColController, ColTrait, ColView>({
    traitType: ColTrait,
    observesTrait: true,
    initTrait(colTrait: ColTrait): void {
      const colView = this.view;
      if (colView !== null) {
        this.owner.setLabelView(colTrait.label.value, colTrait);
      }
    },
    deinitTrait(colTrait: ColTrait): void {
      const colView = this.view;
      if (colView !== null) {
        this.owner.setLabelView(null, colTrait);
      }
    },
    willAttachTrait(colTrait: ColTrait): void {
      this.owner.callObservers("controllerWillAttachColTrait", colTrait, this.owner);
    },
    didDetachTrait(colTrait: ColTrait): void {
      this.owner.callObservers("controllerDidDetachColTrait", colTrait, this.owner);
    },
    traitWillSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
      this.owner.callObservers("controllerWillSetColLayout", newLayout, oldLayout, this.owner);
    },
    traitDidSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
      this.owner.callObservers("controllerDidSetColLayout", newLayout, oldLayout, this.owner);
    },
    traitDidSetLabel(newLabel: ColLabel | null, oldLabel: ColLabel | null, colTrait: ColTrait): void {
      this.owner.setLabelView(newLabel, colTrait);
    },
    viewType: ColView,
    observesView: true,
    initView(colView: ColView): void {
      this.owner.label.setView(colView.label.view);
      const colTrait = this.trait;
      if (colTrait !== null) {
        this.owner.setLabelView(colTrait.label.value, colTrait);
      }
    },
    deinitView(colView: ColView): void {
      this.owner.label.setView(null);
    },
    willAttachView(colView: ColView): void {
      this.owner.callObservers("controllerWillAttachColView", colView, this.owner);
    },
    didDetachView(colView: ColView): void {
      this.owner.callObservers("controllerDidDetachColView", colView, this.owner);
    },
    viewWillAttachLabel(labelView: HtmlView): void {
      this.owner.label.setView(labelView);
    },
    viewDidDetachLabel(labelView: HtmlView): void {
      this.owner.label.setView(null);
    },
  })
  readonly col!: TraitViewRef<this, ColTrait, ColView>;
  static readonly col: MemberFastenerClass<ColController, "col">;

  protected createLabelView(label: ColLabel, colTrait: ColTrait): HtmlView | string | null {
    if (typeof label === "function") {
      return label(colTrait);
    } else {
      return label;
    }
  }

  protected setLabelView(label: ColLabel | null, colTrait: ColTrait): void {
    const colView = this.col.view;
    if (colView !== null) {
      const labelView = label !== null ? this.createLabelView(label, colTrait) : null;
      colView.label.setView(labelView);
    }
  }

  @ViewRef<ColController, HtmlView>({
    type: HtmlView,
    willAttachView(labelView: HtmlView): void {
      this.owner.callObservers("controllerWillAttachColLabelView", labelView, this.owner);
    },
    didDetachView(labelView: HtmlView): void {
      this.owner.callObservers("controllerDidDetachColLabelView", labelView, this.owner);
    },
  })
  readonly label!: ViewRef<this, HtmlView>;
  static readonly label: MemberFastenerClass<ColController, "label">;
}
