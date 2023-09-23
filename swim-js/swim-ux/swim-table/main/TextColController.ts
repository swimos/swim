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
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {TraitViewRef} from "@swim/controller";
import type {ColControllerObserver} from "./ColController";
import {ColController} from "./ColController";
import {TextColView} from "./TextColView";
import {TextColTrait} from "./TextColTrait";

/** @public */
export interface TextColControllerObserver<C extends TextColController = TextColController> extends ColControllerObserver<C> {
  controllerWillAttachColTrait?(colTrait: TextColTrait, controller: C): void;

  controllerDidDetachColTrait?(colTrait: TextColTrait, controller: C): void;

  controllerWillAttachColView?(colView: TextColView, controller: C): void;

  controllerDidDetachColView?(colView: TextColView, controller: C): void;

  controllerWillAttachColLabelView?(colLabelView: HtmlView, controller: C): void;

  controllerDidDetachColLabelView?(colLabelView: HtmlView, controller: C): void;
}

/** @public */
export class TextColController extends ColController {
  declare readonly observerType?: Class<TextColControllerObserver>;

  @TraitViewRef({
    extends: true,
    traitType: TextColTrait,
    observesTrait: true,
    initTrait(cellTrait: TextColTrait): void {
      this.owner.setLabelView(cellTrait.label.value);
    },
    deinitTrait(cellTrait: TextColTrait): void {
      this.owner.setLabelView(void 0);
    },
    traitDidSetLabel(label: string | undefined): void {
      this.owner.setLabelView(label);
    },
    viewType: TextColView,
    observesView: true,
    initView(colView: TextColView): void {
      this.owner.label.setView(colView.label.view);
      const cellTrait = this.trait;
      if (cellTrait !== null) {
        this.owner.setLabelView(cellTrait.label.value);
      }
    },
    deinitView(colView: TextColView): void {
      this.owner.label.setView(null);
    },
    viewWillAttachLabel(labelView: HtmlView): void {
      this.owner.label.setView(labelView);
    },
    viewDidDetachLabel(labelView: HtmlView): void {
      this.owner.label.setView(null);
    },
  })
  override readonly col!: TraitViewRef<this, TextColTrait, TextColView> & ColController["col"] & Observes<TextColTrait> & Observes<TextColView>;

  protected setLabelView(label: string | undefined): void {
    const colView = this.col.view;
    if (colView !== null) {
      colView.label.set(label);
    }
  }

  @ViewRef({
    viewType: HtmlView,
    willAttachView(contentView: HtmlView): void {
      this.owner.callObservers("controllerWillAttachColLabelView", contentView, this.owner);
    },
    didDetachView(contentView: HtmlView): void {
      this.owner.callObservers("controllerDidDetachColLabelView", contentView, this.owner);
    },
  })
  readonly label!: ViewRef<this, HtmlView>;
}
