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

import type {Class, Initable} from "@swim/util";
import {Affinity, MemberFastenerClass} from "@swim/fastener";
import {AnyView, ViewRef} from "@swim/view";
import {HtmlViewInit, HtmlView} from "@swim/dom";
import {CellView} from "./CellView";
import type {TextCellViewObserver} from "./TextCellViewObserver";

/** @public */
export class TextCellView extends CellView {
  protected override initCell(): void {
    super.initCell();
    this.addClass("cell-text");
  }

  override readonly observerType?: Class<TextCellViewObserver>;

  @ViewRef<TextCellView, HtmlView & Initable<HtmlViewInit | string>, {create(value?: string): HtmlView}>({
    key: true,
    type: HtmlView,
    binds: true,
    willAttachView(contentView: HtmlView): void {
      this.owner.callObservers("viewWillAttachContent", contentView, this.owner);
    },
    didDetachView(contentView: HtmlView): void {
      this.owner.callObservers("viewDidDetachContent", contentView, this.owner);
    },
    create(value?: string): HtmlView {
      const contentView = HtmlView.fromTag("span");
      contentView.alignSelf.setState("center", Affinity.Intrinsic);
      contentView.whiteSpace.setState("nowrap", Affinity.Intrinsic);
      contentView.textOverflow.setState("ellipsis", Affinity.Intrinsic);
      contentView.overflowX.setState("hidden", Affinity.Intrinsic);
      contentView.overflowY.setState("hidden", Affinity.Intrinsic);
      if (value !== void 0) {
        contentView.text(value);
      }
      return contentView;
    },
    fromAny(value: AnyView<HtmlView> | string): HtmlView {
      if (typeof value === "string") {
        return this.create(value);
      } else {
        return HtmlView.fromAny(value);
      }
    },
  })
  readonly content!: ViewRef<this, HtmlView & Initable<HtmlViewInit | string>> & {create(value?: string): HtmlView};
  static readonly content: MemberFastenerClass<TextCellView, "content">;
}
