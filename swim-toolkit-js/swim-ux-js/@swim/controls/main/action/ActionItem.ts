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

import {AnyColor, Color} from "@swim/color";
import {
  ViewScope,
  ViewContext,
  ViewFlags,
  View,
  ViewAnimator,
  SvgView,
  HtmlView,
  HtmlViewController,
} from "@swim/view";
import {Theme} from "@swim/theme";

export class ActionItem extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
  }

  protected initNode(node: HTMLElement): void {
    this.addClass("action-item")
        .position("relative")
        .display("flex")
        .justifyContent("center")
        .alignItems("center")
        .width(48)
        .height(48)
        .borderRadius("50%")
        .userSelect("none")
        .cursor("pointer");
  }

  get viewController(): HtmlViewController<ActionItem> | null {
    return this._viewController;
  }

  @ViewScope(Object, {inherit: true})
  theme: ViewScope<this, Theme>;

  @ViewAnimator(Number, {inherit: true})
  stackPhase: ViewAnimator<this, number>; // 0 = collapsed; 1 = expanded

  @ViewAnimator(Color)
  hoverColor: ViewAnimator<this, Color, AnyColor>;

  get icon(): SvgView | HtmlView | null {
    const childView = this.getChildView("icon");
    return childView instanceof SvgView || childView instanceof HtmlView ? childView : null;
  }

  get label(): HtmlView | null {
    const childView = this.getChildView("label");
    return childView instanceof HtmlView ? childView : null;
  }

  setTheme(theme: Theme): void {
    this.backgroundColor.setAutoState(theme.secondary.fillColor);
    this.boxShadow.setAutoState(theme.floating.shadow);
    this.hoverColor.setAutoState(theme.secondary.fillColor.darker(0.5));

    const icon = this.icon;
    if (icon instanceof SvgView) {
      icon.fill.setAutoState(theme.secondary.iconColor);
    }
  }

  protected onMount(): void {
    super.onMount();
    this.requireUpdate(View.NeedsCompute);
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsAnimate) !== 0) {
      additionalFlags |= View.NeedsLayout;
    }
    additionalFlags |= super.modifyUpdate(updateFlags | additionalFlags);
    return additionalFlags;
  }

  protected onCompute(viewContext: ViewContext): void {
    super.onCompute(viewContext);
    const theme = this.theme.state;
    if (theme !== void 0) {
      this.setTheme(theme);
    }
  }

  protected onLayout(viewContext: ViewContext): void {
    super.onLayout(viewContext);
    const label = this.label;
    if (label !== null) {
      label.opacity(this.stackPhase.value!);
    }
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    const childKey = childView.key;
    if (childKey === "icon" && (childView instanceof SvgView || childView instanceof HtmlView)) {
      this.onInsertIcon(childView);
    } else if (childKey === "label" && childView instanceof HtmlView) {
      this.onInsertLabel(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    const childKey = childView.key;
    if (childKey === "icon" && (childView instanceof SvgView || childView instanceof HtmlView)) {
      this.onRemoveIcon(childView);
    } else if (childKey === "label" && childView instanceof HtmlView) {
      this.onRemoveLabel(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertIcon(icon: SvgView | HtmlView): void {
    // hook
  }

  protected onRemoveIcon(icon: SvgView | HtmlView): void {
    // hook
  }

  protected onInsertLabel(label: HtmlView): void {
    label.display.setAutoState("block");
    label.position("absolute")
        .top(0)
        .right(48 + 12)
        .bottom(0)
        .fontSize(17)
        .fontWeight("500")
        .lineHeight("48px")
        .whiteSpace("nowrap")
        .color("#cccccc")
        .opacity(this.stackPhase.value || 0);
  }

  protected onRemoveLabel(label: HtmlView): void {
    // hook
  }
}
