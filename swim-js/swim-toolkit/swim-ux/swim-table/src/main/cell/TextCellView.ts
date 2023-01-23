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

import type {Class} from "@swim/util";
import {Affinity, FastenerClass} from "@swim/component";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {CellView} from "./CellView";
import type {TextCellViewObserver} from "./TextCellViewObserver";

/** @public */
export class TextCellView extends CellView {
  protected override initCell(): void {
    super.initCell();
    this.addClass("cell-text");
  }

  override readonly observerType?: Class<TextCellViewObserver>;

  @ViewRef<TextCellView["content"]>({
    viewType: HtmlView,
    viewKey: true,
    binds: true,
    willAttachView(contentView: HtmlView): void {
      this.owner.callObservers("viewWillAttachContent", contentView, this.owner);
    },
    didDetachView(contentView: HtmlView): void {
      this.owner.callObservers("viewDidDetachContent", contentView, this.owner);
    },
    setText(content: string | undefined): HtmlView {
      let contentView = this.view;
      if (contentView === null) {
        contentView = this.createView();
        this.setView(contentView);
      }
      contentView.text(content);
      return contentView;
    },
    createView(): HtmlView {
      const contentView = HtmlView.fromTag("span");
      contentView.alignSelf.setState("center", Affinity.Intrinsic);
      contentView.whiteSpace.setState("nowrap", Affinity.Intrinsic);
      contentView.textOverflow.setState("ellipsis", Affinity.Intrinsic);
      contentView.overflowX.setState("hidden", Affinity.Intrinsic);
      contentView.overflowY.setState("hidden", Affinity.Intrinsic);
      return contentView;
    },
  })
  readonly content!: ViewRef<this, HtmlView> & {
    setText(content: string | undefined): HtmlView,
  };
  static readonly content: FastenerClass<TextCellView["content"]>;
}
