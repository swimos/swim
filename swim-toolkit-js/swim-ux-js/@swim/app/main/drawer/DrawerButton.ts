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

import {View, SvgView, HtmlView, HtmlViewController} from "@swim/view";
import {DrawerView} from "./DrawerView";

export class DrawerButton extends HtmlView {
  /** @hidden */
  _drawerView: DrawerView | null;

  constructor(node: HTMLElement) {
    super(node);
    this.onClick = this.onClick.bind(this);
    this._drawerView = null;
    this.initChildren();
  }

  protected initNode(node: HTMLElement): void {
    this.addClass("drawer-button")
        .display("flex")
        .justifyContent("center")
        .alignItems("center")
        .width(48)
        .height(48)
        .userSelect("none")
        .cursor("pointer");
  }

  protected initChildren(): void {
    this.append(this.createIcon(), "icon");
  }

  protected createIcon(): SvgView {
    const icon = SvgView.create("svg")
        .width(30)
        .height(30)
        .viewBox("0 0 30 30")
        .stroke("#ffffff")
        .strokeWidth(2)
        .strokeLinecap("round");
    icon.append("path").d("M4 7h22M4 15h22M4 23h22");
    return icon;
  }

  get viewController(): HtmlViewController<DrawerButton> | null {
    return this._viewController;
  }

  get drawerView(): DrawerView | null {
    return this._drawerView;
  }

  setDrawerView(drawerView: DrawerView | null) {
    this._drawerView = drawerView;
  }

  get iconView(): HtmlView | null {
    const childView = this.getChildView("icon");
    return childView instanceof HtmlView ? childView : null;
  }

  protected onMount(): void {
    super.onMount();
    this.on("click", this.onClick);
  }

  protected onUnmount(): void {
    this.off("click", this.onClick);
    super.onUnmount();
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    const childKey = childView.key;
    if (childKey === "icon" && (childView instanceof SvgView || childView instanceof HtmlView)) {
      this.onInsertIcon(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    const childKey = childView.key;
    if (childKey === "icon" && (childView instanceof SvgView || childView instanceof HtmlView)) {
      this.onRemoveIcon(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertIcon(icon: SvgView | HtmlView): void {
    // hook
  }

  protected onRemoveIcon(icon: SvgView | HtmlView): void {
    // hook
  }

  protected onClick(event: MouseEvent): void {
    event.stopPropagation();
    const drawerView = this._drawerView;
    if (drawerView !== null) {
      drawerView.toggle();
    }
  }
}
