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

import {View} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {ListItem} from "./ListItem";
import type {ListViewObserver} from "./ListViewObserver";
import type {ListViewController} from "./ListViewController";

export class ListView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initList();
  }

  protected initList(): void {
    this.addClass("list");
    this.flexGrow.setState(1, View.Intrinsic);
    this.flexShrink.setState(0, View.Intrinsic);
    this.marginTop.setState(12, View.Intrinsic);
    this.marginBottom.setState(12, View.Intrinsic);
    this.userSelect.setState("none", View.Intrinsic);
  }

  declare readonly viewController: ListViewController | null;

  declare readonly viewObservers: ReadonlyArray<ListViewObserver>;

  protected onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    if (childView instanceof ListItem) {
      this.onInsertItem(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    if (childView instanceof ListItem) {
      this.onRemoveItem(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertItem(item: ListItem): void {
    // hook
  }

  protected onRemoveItem(item: ListItem): void {
    // hook
  }

  /** @hidden */
  onPressItem(item: ListItem): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.listDidPressItem !== void 0) {
        viewObserver.listDidPressItem(item, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.listDidPressItem !== void 0) {
      viewController.listDidPressItem(item, this);
    }
  }
}
