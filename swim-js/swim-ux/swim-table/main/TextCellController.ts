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
import type {CellControllerObserver} from "./CellController";
import {CellController} from "./CellController";
import {TextCellView} from "./TextCellView";
import {TextCellTrait} from "./TextCellTrait";

/** @public */
export interface TextCellControllerObserver<C extends TextCellController = TextCellController> extends CellControllerObserver<C> {
  controllerWillAttachCellTrait?(cellTrait: TextCellTrait, controller: C): void;

  controllerDidDetachCellTrait?(cellTrait: TextCellTrait, controller: C): void;

  controllerWillAttachCellView?(cellView: TextCellView, controller: C): void;

  controllerDidDetachCellView?(cellView: TextCellView, controller: C): void;

  controllerWillAttachCellContentView?(cellContentView: HtmlView, controller: C): void;

  controllerDidDetachCellContentView?(cellContentView: HtmlView, controller: C): void;
}

/** @public */
export class TextCellController extends CellController {
  declare readonly observerType?: Class<TextCellControllerObserver>;

  @TraitViewRef({
    extends: true,
    traitType: TextCellTrait,
    observesTrait: true,
    initTrait(cellTrait: TextCellTrait): void {
      this.owner.setContentView(cellTrait.content.value);
    },
    deinitTrait(cellTrait: TextCellTrait): void {
      this.owner.setContentView(void 0);
    },
    traitDidSetContent(content: string | undefined): void {
      this.owner.setContentView(content);
    },
    viewType: TextCellView,
    observesView: true,
    initView(cellView: TextCellView): void {
      this.owner.content.setView(cellView.content.view);
      const cellTrait = this.trait;
      if (cellTrait !== null) {
        this.owner.setContentView(cellTrait.content.value);
      }
    },
    deinitView(cellView: TextCellView): void {
      this.owner.content.setView(null);
    },
    viewWillAttachContent(contentView: HtmlView): void {
      this.owner.content.setView(contentView);
    },
    viewDidDetachContent(contentView: HtmlView): void {
      this.owner.content.setView(null);
    },
  })
  override readonly cell!: TraitViewRef<this, TextCellTrait, TextCellView> & CellController["cell"] & Observes<TextCellTrait> & Observes<TextCellView>;

  protected setContentView(content: string | undefined): void {
    const cellView = this.cell.view;
    if (cellView !== null) {
      cellView.content.set(content);
    }
  }

  @ViewRef({
    viewType: HtmlView,
    willAttachView(contentView: HtmlView): void {
      this.owner.callObservers("controllerWillAttachCellContentView", contentView, this.owner);
    },
    didDetachView(contentView: HtmlView): void {
      this.owner.callObservers("controllerDidDetachCellContentView", contentView, this.owner);
    },
  })
  readonly content!: ViewRef<this, HtmlView>;
}
