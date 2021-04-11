// Copyright 2015-2020 Swim inc.
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

import {View, ViewFastener} from "@swim/view";
import {HtmlView, HtmlViewController} from "@swim/dom";
import type {CellViewObserver} from "./CellViewObserver";

export class CellView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initCell();
  }

  protected initCell(): void {
    this.addClass("cell");
    this.overflowX.setState("hidden", View.Intrinsic);
    this.overflowY.setState("hidden", View.Intrinsic);
  }

  declare readonly viewController: HtmlViewController & CellViewObserver | null;

  declare readonly viewObservers: ReadonlyArray<CellViewObserver>;

  protected createContent(value?: string): HtmlView | null {
    const contentView = HtmlView.span.create();
    contentView.alignSelf.setState("center", View.Intrinsic);
    contentView.whiteSpace.setState("nowrap", View.Intrinsic);
    contentView.textOverflow.setState("ellipsis", View.Intrinsic);
    contentView.overflowX.setState("hidden", View.Intrinsic);
    contentView.overflowY.setState("hidden", View.Intrinsic);
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
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetCellContent !== void 0) {
      viewController.viewWillSetCellContent(newContentView, oldContentView, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetCellContent !== void 0) {
        viewObserver.viewWillSetCellContent(newContentView, oldContentView, this);
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
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetCellContent !== void 0) {
        viewObserver.viewDidSetCellContent(newContentView, oldContentView, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetCellContent !== void 0) {
      viewController.viewDidSetCellContent(newContentView, oldContentView, this);
    }
  }

  @ViewFastener<CellView, HtmlView, string>({
    key: true,
    type: HtmlView,
    fromAny(value: HtmlView | string): HtmlView | null {
      if (value instanceof HtmlView) {
        return value;
      } else {
        return this.owner.createContent(value);
      }
    },
    willSetView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.willSetContent(newContentView, oldContentView);
    },
    onSetView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.onSetContent(newContentView, oldContentView);
    },
    didSetView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.didSetContent(newContentView, oldContentView);
    },
  })
  declare content: ViewFastener<this, HtmlView, string>;
}
