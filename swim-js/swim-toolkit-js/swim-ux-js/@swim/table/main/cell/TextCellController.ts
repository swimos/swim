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
import {ViewFastener} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {TraitViewFastener} from "@swim/controller";
import {CellController} from "./CellController";
import {TextCellView} from "./TextCellView";
import {TextCellContent, TextCellTrait} from "./TextCellTrait";
import type {TextCellControllerObserver} from "./TextCellControllerObserver";

export class TextCellController extends CellController {
  override readonly observerType?: Class<TextCellControllerObserver>;

  protected override attachCellTrait(cellTrait: TextCellTrait): void {
    super.attachCellTrait(cellTrait);
    this.setContentView(cellTrait.content.state, cellTrait);
  }

  protected override detachCellTrait(cellTrait: TextCellTrait): void {
    this.setContentView(null, cellTrait);
    super.detachCellTrait(cellTrait);
  }

  protected override createCellView(): TextCellView | null {
    return TextCellView.create();
  }

  protected override attachCellView(cellView: TextCellView): void {
    this.content.setView(cellView.content.view);

    const cellTrait = this.cell.trait;
    if (cellTrait !== null) {
      this.setContentView(cellTrait.content.state, cellTrait);
    }
  }

  protected override detachCellView(cellView: TextCellView): void {
    this.content.setView(null);
  }

  /** @internal */
  static override CellFastener = TraitViewFastener.define<TextCellController, TextCellTrait, TextCellView>({
    extends: CellController.CellFastener,
    traitType: TextCellTrait,
    observesTrait: true,
    traitDidSetContent(newContent: TextCellContent | null, oldContent: TextCellContent | null, cellTrait: TextCellTrait): void {
      this.owner.setContentView(newContent, cellTrait);
    },
    viewType: TextCellView,
    observesView: true,
    viewDidSetContent(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.content.setView(newContentView);
    },
  });

  @TraitViewFastener<TextCellController, TextCellTrait, TextCellView>({
    extends: TextCellController.CellFastener,
  })
  override readonly cell!: TraitViewFastener<this, TextCellTrait, TextCellView>;

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

  protected initContentView(contentView: HtmlView): void {
    // hook
  }

  protected attachContentView(contentView: HtmlView): void {
    // hook
  }

  protected detachContentView(contentView: HtmlView): void {
    // hook
  }

  protected willSetContentView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetCellContentView !== void 0) {
        observer.controllerWillSetCellContentView(newContentView, oldContentView, this);
      }
    }
  }

  protected onSetContentView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
    if (oldContentView !== null) {
      this.detachContentView(oldContentView);
    }
    if (newContentView !== null) {
      this.attachContentView(newContentView);
      this.initContentView(newContentView);
    }
  }

  protected didSetContentView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetCellContentView !== void 0) {
        observer.controllerDidSetCellContentView(newContentView, oldContentView, this);
      }
    }
  }

  @ViewFastener<TextCellController, HtmlView>({
    type: HtmlView,
    willSetView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.willSetContentView(newContentView, oldContentView);
    },
    onSetView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.onSetContentView(newContentView, oldContentView);
    },
    didSetView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.didSetContentView(newContentView, oldContentView);
    },
  })
  readonly content!: ViewFastener<this, HtmlView>;
}
