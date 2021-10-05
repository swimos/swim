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
import {Affinity} from "@swim/fastener";
import {ViewFastener} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {CellView} from "./CellView";
import type {TextCellViewObserver} from "./TextCellViewObserver";

export class TextCellView extends CellView {
  protected override initCell(): void {
    super.initCell();
    this.addClass("cell-text");
  }

  override readonly observerType?: Class<TextCellViewObserver>;

  protected createContent(value?: string): HtmlView | null {
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
  }

  protected initContent(contentView: HtmlView): void {
    // hook
  }

  protected attachContent(contentView: HtmlView): void {
    // hook
  }

  protected detachContent(contentView: HtmlView): void {
    // hook
  }

  protected willSetContent(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetContent !== void 0) {
        observer.viewWillSetContent(newContentView, oldContentView, this);
      }
    }
  }

  protected onSetContent(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
    if (oldContentView !== null) {
      this.detachContent(oldContentView);
    }
    if (newContentView !== null) {
      this.attachContent(newContentView);
      this.initContent(newContentView);
    }
  }

  protected didSetContent(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetContent !== void 0) {
        observer.viewDidSetContent(newContentView, oldContentView, this);
      }
    }
  }

  @ViewFastener<TextCellView, HtmlView, string>({
    key: true,
    type: HtmlView,
    child: true,
    willSetView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.willSetContent(newContentView, oldContentView);
    },
    onSetView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.onSetContent(newContentView, oldContentView);
    },
    didSetView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.didSetContent(newContentView, oldContentView);
    },
    fromAny(value: HtmlView | string): HtmlView | null {
      if (value instanceof HtmlView) {
        return value;
      } else {
        return this.owner.createContent(value);
      }
    },
  })
  readonly content!: ViewFastener<this, HtmlView, string>;
}
