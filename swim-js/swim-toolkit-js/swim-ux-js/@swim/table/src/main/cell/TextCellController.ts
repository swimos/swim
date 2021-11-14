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
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {TraitViewRef} from "@swim/controller";
import {CellController} from "./CellController";
import {TextCellView} from "./TextCellView";
import {TextCellContent, TextCellTrait} from "./TextCellTrait";
import type {TextCellControllerObserver} from "./TextCellControllerObserver";

/** @public */
export class TextCellController extends CellController {
  override readonly observerType?: Class<TextCellControllerObserver>;

  @TraitViewRef<TextCellController, TextCellTrait, TextCellView>({
    extends: true,
    traitType: TextCellTrait,
    observesTrait: true,
    initTrait(cellTrait: TextCellTrait): void {
      this.owner.setContentView(cellTrait.content.state, cellTrait);
    },
    deinitTrait(cellTrait: TextCellTrait): void {
      this.owner.setContentView(null, cellTrait);
    },
    traitDidSetContent(newContent: TextCellContent | null, oldContent: TextCellContent | null, cellTrait: TextCellTrait): void {
      this.owner.setContentView(newContent, cellTrait);
    },
    viewType: TextCellView,
    observesView: true,
    initView(cellView: TextCellView): void {
      this.owner.content.setView(cellView.content.view);
      const cellTrait = this.trait;
      if (cellTrait !== null) {
        this.owner.setContentView(cellTrait.content.state, cellTrait);
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
  override readonly cell!: TraitViewRef<this, TextCellTrait, TextCellView>;
  static readonly cell: MemberFastenerClass<TextCellController, "cell">;

  protected createContentView(content: TextCellContent, cellTrait: TextCellTrait): HtmlView | string | null {
    if (typeof content === "function") {
      return content(cellTrait);
    } else {
      return content;
    }
  }

  protected setContentView(content: TextCellContent | null, cellTrait: TextCellTrait): void {
    const cellView = this.cell.view;
    if (cellView !== null) {
      const contentView = content !== null ? this.createContentView(content, cellTrait) : null;
      cellView.content.setView(contentView);
    }
  }

  @ViewRef<TextCellController, HtmlView>({
    type: HtmlView,
    willAttachView(contentView: HtmlView): void {
      this.owner.callObservers("controllerWillAttachCellContentView", contentView, this.owner);
    },
    didDetachView(contentView: HtmlView): void {
      this.owner.callObservers("controllerDidDetachCellContentView", contentView, this.owner);
    },
  })
  readonly content!: ViewRef<this, HtmlView>;
  static readonly content: MemberFastenerClass<TextCellController, "content">;
}
