// Copyright 2015-2019 SWIM.AI inc.
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

import {View, ElementViewClass, HtmlView} from "@swim/view";
import {NavigationBar} from "./NavigationBar";
import {NavigationViewController} from "./NavigationViewController";

export class NavigationView extends HtmlView {
  /** @hidden */
  _viewController: NavigationViewController | null;

  constructor(node: HTMLElement, key: string | null = null,
              navigationBar: NavigationBar | ElementViewClass<HTMLElement, NavigationBar> = NavigationBar) {
    super(node, key);

    if (typeof navigationBar === "function") {
      navigationBar = HtmlView.create(navigationBar);
    }
    this.initNavigationBar(navigationBar.key("navigationBar"));
  }

  protected initNode(node: HTMLElement): void {
    this.position("relative").display("flex").flexDirection("column");
  }

  protected initNavigationBar(navigationBar: NavigationBar): void {
    this.append(navigationBar);
  }

  get viewController(): NavigationViewController | null {
    return this._viewController;
  }

  get navigationBar(): NavigationBar | null {
    return this.getChildView("navigationBar") as NavigationBar;
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    const childKey = childView.key();
    if (childKey === "navigationBar") {
      this.onInsertNavigationBar(childView as NavigationBar);
    }
  }

  protected onRemoveChildView(childView: View): void {
    const childKey = childView.key();
    if (childKey === "navigationBar") {
      this.onRemoveNavigationBar(childView as NavigationBar);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertNavigationBar(navigationBar: NavigationBar): void {
    // stub
  }

  protected onRemoveNavigationBar(navigationBar: NavigationBar): void {
    // stub
  }
}
