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

import {AnyColor, Color} from "@swim/color";
import {MemberAnimator, View, HtmlView, HtmlAppView} from "@swim/view";
import {NavigationBarController} from "./NavigationBarController";

export class NavigationBar extends HtmlView {
  /** @hidden */
  _viewController: NavigationBarController | null;

  constructor(node: HTMLElement, key: string | null = null) {
    super(node, key);
    this.tintColor.setState(Color.parse("#f5a623"));
  }

  protected initNode(node: HTMLElement): void {
    this.position("relative").display("flex");
    this.append("div").key("bar").flexGrow(1);
  }

  get viewController(): NavigationBarController | null {
    return this._viewController;
  }

  @MemberAnimator(Color)
  tintColor: MemberAnimator<this, Color, AnyColor>;

  get barView(): HtmlView | null {
    return this.getChildView("bar") as HtmlView;
  }

  protected onResize(): void {
    const appView = this.appView;
    if (appView instanceof HtmlAppView) {
      const viewport = appView.viewport;
      this.paddingTop(viewport.safeArea.insetTop);
    }
  }

  protected onAnimate(t: number): void {
    this.tintColor.onFrame(t);

    this.backgroundColor(this.tintColor.state!.brighter(0.5));

    const barView = this.barView;
    if (barView) {
      this.updateBarView(barView);
    }
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    const childKey = childView.key();
    if (childKey === "bar") {
      this.onInsertBarView(childView as HtmlView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    const childKey = childView.key();
    if (childKey === "bar") {
      this.onRemoveBarView(childView as HtmlView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertBarView(barView: HtmlView): void {
    this.updateBarView(barView);
  }

  protected onRemoveBarView(barView: HtmlView): void {
    // stub
  }

  protected updateBarView(barView: HtmlView): void {
    barView.backgroundColor(this.tintColor.state!);
  }
}
