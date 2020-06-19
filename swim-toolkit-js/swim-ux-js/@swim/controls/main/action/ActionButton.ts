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

import {Angle} from "@swim/angle";
import {Transform} from "@swim/transform";
import {Tween, Transition} from "@swim/transition";
import {ViewScope, ViewContext, View, SvgView, HtmlView, HtmlViewController} from "@swim/view";
import {PositionGestureInput, PositionGestureDelegate} from "@swim/gesture";
import {Theme} from "@swim/theme";
import {TactileView} from "@swim/app";

export class ActionButton extends TactileView implements PositionGestureDelegate {
  constructor(node: HTMLElement) {
    super(node);
  }

  protected initNode(node: HTMLElement): void {
    super.initNode(node);
    this.addClass("action-button")
        .position("relative")
        .display("flex")
        .justifyContent("center")
        .alignItems("center")
        .width(56)
        .height(56)
        .borderRadius("50%")
        .overflow("hidden")
        .userSelect("none")
        .cursor("pointer");
  }

  get viewController(): HtmlViewController<ActionButton> | null {
    return this._viewController;
  }

  @ViewScope(Object, {inherit: true})
  theme: ViewScope<this, Theme>;

  get iconContainer(): HtmlView | null {
    const childView = this.getChildView("iconContainer");
    return childView instanceof HtmlView ? childView : null;
  }

  get icon(): SvgView | HtmlView | null {
    const iconContainer = this.iconContainer;
    const childView = iconContainer !== null ? iconContainer.getChildView("icon") : null;
    return childView instanceof SvgView || childView instanceof HtmlView ? childView : null;
  }

  setIcon(icon: SvgView | HtmlView | null, tween: Tween<any> = null, ccw: boolean = false): void {
    tween = Transition.forTween(tween);
    const oldIconContainer = this.getChildView("iconContainer");
    if (oldIconContainer instanceof HtmlView) {
      this.removeChildViewMap(oldIconContainer);
      oldIconContainer.setKey(null);
      if (tween !== null) {
        oldIconContainer.opacity(0, tween.onEnd(oldIconContainer.remove.bind(oldIconContainer)))
                        .transform(Transform.rotate(Angle.deg(ccw ? -90 : 90)), tween);
      } else {
        oldIconContainer.remove();
      }
    }
    const newIconContainer = this.createIconContainer(icon)
        .opacity(0)
        .opacity(1, tween)
        .transform(Transform.rotate(Angle.deg(ccw ? 90 : -90)))
        .transform(Transform.rotate(Angle.deg(0)), tween);
    this.appendChildView(newIconContainer, "iconContainer");
  }

  protected createIconContainer(icon: View | null): HtmlView {
    const iconContainer = HtmlView.create("div")
        .addClass("action-icon")
        .position("absolute")
        .display("flex")
        .justifyContent("center")
        .alignItems("center")
        .width(56)
        .height(56)
        .pointerEvents("none");
    if (icon !== null) {
      iconContainer.appendChildView(icon, "icon");
    }
    return iconContainer;
  }

  setTheme(theme: Theme): void {
    this.backgroundColor.setAutoState(theme.primary.fillColor);
    this.boxShadow.setAutoState(theme.floating.shadow);

    const icon = this.icon;
    if (icon instanceof SvgView) {
      icon.fill.setAutoState(theme.primary.iconColor);
    }
  }

  protected onMount(): void {
    super.onMount();
    this.requireUpdate(View.NeedsCompute);
  }

  protected onCompute(viewContext: ViewContext): void {
    super.onCompute(viewContext);
    const theme = this.theme.state;
    if (theme !== void 0) {
      this.setTheme(theme);
    }
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    const childKey = childView.key;
    if (childKey === "iconContainer" && childView instanceof HtmlView) {
      this.onInsertIconContainer(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    const childKey = childView.key;
    if (childKey === "iconContainer" && childView instanceof HtmlView) {
      this.onRemoveIconContainer(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertIconContainer(iconContainer: HtmlView): void {
    // hook
  }

  protected onRemoveIconContainer(iconContainer: HtmlView): void {
    // hook
  }

  didStartHovering(): void {
    const theme = this.theme.state;
    if (theme !== void 0) {
      this.backgroundColor.setAutoState(theme.primary.fillColor.darker(0.5), this.tactileTransition);
    }
  }

  didStopHovering(): void {
    const theme = this.theme.state;
    if (theme !== void 0) {
      this.backgroundColor.setAutoState(theme.primary.fillColor, this.tactileTransition);
    }
  }

  didMovePress(input: PositionGestureInput, event: Event | null): void {
    // nop
  }
}
