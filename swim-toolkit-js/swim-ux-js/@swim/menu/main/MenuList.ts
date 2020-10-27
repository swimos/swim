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
import {ViewNodeType} from "@swim/dom";
import {ThemedHtmlView} from "@swim/theme";
import {MenuItem} from "./MenuItem";
import {MenuListObserver} from "./MenuListObserver";
import {MenuListController} from "./MenuListController";

export class MenuList extends ThemedHtmlView {
  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("menu-list");
    this.flexGrow.setAutoState(1);
    this.flexShrink.setAutoState(0);
    this.marginTop.setAutoState(12);
    this.marginBottom.setAutoState(12);
    this.userSelect.setAutoState("none");
  }

  // @ts-ignore
  declare readonly viewController: MenuListController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<MenuListObserver>;

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    if (childView instanceof MenuItem) {
      this.onInsertItem(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    if (childView instanceof MenuItem) {
      this.onRemoveItem(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertItem(item: MenuItem): void {
    // hook
  }

  protected onRemoveItem(item: MenuItem): void {
    // hook
  }

  /** @hidden */
  onPressItem(item: MenuItem): void {
    this.didObserve(function (viewObserver: MenuListObserver): void {
      if (viewObserver.menuDidPressItem !== void 0) {
        viewObserver.menuDidPressItem(item, this);
      }
    });
  }
}
