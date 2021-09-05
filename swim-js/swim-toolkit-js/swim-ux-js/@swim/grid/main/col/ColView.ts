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

import {View, ViewFastener} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {ColViewObserver} from "./ColViewObserver";

export class ColView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initCol();
  }

  protected initCol(): void {
    this.addClass("col");
    this.overflowX.setState("hidden", View.Intrinsic);
    this.overflowY.setState("hidden", View.Intrinsic);
  }

  override readonly viewObservers!: ReadonlyArray<ColViewObserver>;

  protected createHeader(value?: string): HtmlView | null {
    const headerView = HtmlView.span.create();
    headerView.alignSelf.setState("center", View.Intrinsic);
    if (value !== void 0) {
      headerView.text(value);
    }
    return headerView;
  }

  protected initHeader(headerView: HtmlView): void {
    // hook
  }

  protected attachHeader(headerView: HtmlView): void {
    // hook
  }

  protected detachHeader(headerView: HtmlView): void {
    // hook
  }

  protected willSetHeader(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetColHeader !== void 0) {
        viewObserver.viewWillSetColHeader(newHeaderView, oldHeaderView, this);
      }
    }
  }

  protected onSetHeader(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
    if (oldHeaderView !== null) {
      this.detachHeader(oldHeaderView);
    }
    if (newHeaderView !== null) {
      this.attachHeader(newHeaderView);
      this.initHeader(newHeaderView);
    }
  }

  protected didSetHeader(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetColHeader !== void 0) {
        viewObserver.viewDidSetColHeader(newHeaderView, oldHeaderView, this);
      }
    }
  }

  @ViewFastener<ColView, HtmlView, string>({
    key: true,
    type: HtmlView,
    fromAny(value: HtmlView | string): HtmlView | null {
      if (value instanceof HtmlView) {
        return value;
      } else {
        return this.owner.createHeader(value);
      }
    },
    willSetView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
      this.owner.willSetHeader(newHeaderView, oldHeaderView);
    },
    onSetView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
      this.owner.onSetHeader(newHeaderView, oldHeaderView);
    },
    didSetView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
      this.owner.didSetHeader(newHeaderView, oldHeaderView);
    },
  })
  readonly header!: ViewFastener<this, HtmlView, string>;
}
