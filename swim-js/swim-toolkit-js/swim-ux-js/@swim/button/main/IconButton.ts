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

import {AnyTiming, Timing} from "@swim/mapping";
import {AnyLength, Length, Angle, Transform} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look, Feel, MoodVector, ThemeMatrix} from "@swim/theme";
import {
  ViewContextType,
  ViewContext,
  ViewFlags,
  View,
  ViewObserverType,
  ViewAnimator,
  ViewFastener,
  PositionGestureDelegate,
} from "@swim/view";
import type {HtmlViewObserver, HtmlViewController} from "@swim/dom";
import {
  Graphics,
  Icon,
  FilledIcon,
  IconViewInit,
  IconView,
  IconViewAnimator,
  SvgIconView,
} from "@swim/graphics";
import type {ButtonObserver} from "./ButtonObserver";
import {ButtonMembraneInit, ButtonMembrane} from "./ButtonMembrane";

export interface IconButtonInit extends ButtonMembraneInit, IconViewInit {
  viewController?: HtmlViewController;
}

export class IconButton extends ButtonMembrane implements IconView, PositionGestureDelegate {
  constructor(node: HTMLElement) {
    super(node);
    this.iconCount = 0;
    this.icon = null;
    this.onClick = this.onClick.bind(this);
    this.initButton();
    this.initTheme();
  }

  protected initButton(): void {
    this.addClass("icon-button");
    this.position.setState("relative", View.Intrinsic);
    this.width.setState(44, View.Intrinsic);
    this.height.setState(44, View.Intrinsic);
    this.display.setState("flex", View.Intrinsic);
    this.justifyContent.setState("center", View.Intrinsic);
    this.alignItems.setState("center", View.Intrinsic);
    this.borderTopLeftRadius.setState(4, View.Intrinsic);
    this.borderTopRightRadius.setState(4, View.Intrinsic);
    this.borderBottomLeftRadius.setState(4, View.Intrinsic);
    this.borderBottomRightRadius.setState(4, View.Intrinsic);
    this.overflowX.setState("hidden", View.Intrinsic);
    this.overflowY.setState("hidden", View.Intrinsic);
    this.userSelect.setState("none", View.Intrinsic);
    this.cursor.setState("pointer", View.Intrinsic);
  }

  protected initTheme(): void {
    this.modifyTheme(Feel.default, [[Feel.translucent, 1]]);
  }

  override initView(init: IconButtonInit): void {
    super.initView(init);
    IconView.initView(this, init);
  }

  override readonly viewController!: HtmlViewController & ButtonObserver | null;

  override readonly viewObservers!: ReadonlyArray<HtmlViewObserver & ButtonObserver>;

  @ViewAnimator({type: Number, state: 0.5, updateFlags: View.NeedsLayout})
  readonly xAlign!: ViewAnimator<this, number>;

  @ViewAnimator({type: Number, state: 0.5, updateFlags: View.NeedsLayout})
  readonly yAlign!: ViewAnimator<this, number>;

  @ViewAnimator({type: Length, state: Length.px(24), updateFlags: View.NeedsLayout})
  readonly iconWidth!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Length, state: Length.px(24), updateFlags: View.NeedsLayout})
  readonly iconHeight!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Color, state: null, updateFlags: View.NeedsLayout})
  readonly iconColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({extends: IconViewAnimator, state: null, type: Object, updateFlags: View.NeedsLayout})
  readonly graphics!: ViewAnimator<this, Graphics | null>;

  /** @hidden */
  static IconFastener = ViewFastener.define<IconButton, SvgIconView, never, ViewObserverType<SvgIconView> & {iconIndex: number}>({
    extends: void 0,
    type: SvgIconView,
    child: false,
    observe: true,
    iconIndex: 0,
    viewDidAnimate(viewContext: ViewContext, iconView: SvgIconView): void {
      if (!iconView.opacity.isAnimating() && this.iconIndex !== this.owner.iconCount) {
        iconView.remove();
        if (this.iconIndex > this.owner.iconCount) {
          this.owner.setViewFastener(this.name, null);
        }
      }
    },
  });

  /** @hidden */
  iconCount: number;

  icon: ViewFastener<this, SvgIconView> | null;

  pushIcon(icon: Graphics, timing?: AnyTiming | boolean): void {
    const oldIconCount = this.iconCount;
    const newIconCount = oldIconCount + 1;
    this.iconCount = newIconCount;

    if (timing === void 0 && oldIconCount === 0) {
      timing = false;
    } else if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }

    const oldIconKey = "icon" + oldIconCount;
    const oldIconFastener = this.getViewFastener(oldIconKey) as ViewFastener<this, SvgIconView> | null;
    const oldIconView = oldIconFastener !== null ? oldIconFastener.view : null;
    if (oldIconView !== null) {
      if (timing !== false) {
        oldIconView.opacity.setState(0, timing, View.Intrinsic);
        oldIconView.cssTransform.setState(Transform.rotate(Angle.deg(90)), timing, View.Intrinsic);
      } else {
        oldIconView.remove();
      }
    }

    const newIconKey = "icon" + newIconCount;
    const newIconFastener = new IconButton.IconFastener(this, newIconKey, newIconKey);
    newIconFastener.iconIndex = newIconCount;
    this.icon = newIconFastener;
    const newIconView = SvgIconView.create();

    newIconView.setStyle("position", "absolute");
    newIconView.setStyle("left", "0");
    newIconView.setStyle("top", "0");
    newIconView.opacity.setState(0, View.Intrinsic);
    newIconView.opacity.setState(1, timing, View.Intrinsic);
    newIconView.cssTransform.setState(Transform.rotate(Angle.deg(-90)), View.Intrinsic);
    newIconView.cssTransform.setState(Transform.rotate(Angle.deg(0)), timing, View.Intrinsic);
    newIconView.pointerEvents.setState("none", View.Intrinsic);
    newIconView.xAlign.setInherit(true);
    newIconView.yAlign.setInherit(true);
    newIconView.iconWidth.setInherit(true);
    newIconView.iconHeight.setInherit(true);
    newIconView.iconColor.setInherit(true);
    newIconView.graphics.setState(icon, View.Intrinsic);
    newIconFastener.setView(newIconView);
    this.setViewFastener(newIconKey, newIconFastener);
    this.appendChildView(newIconView, newIconKey);
  }

  popIcon(timing?: AnyTiming | boolean): SvgIconView | null {
    const oldIconCount = this.iconCount;
    const newIconCount = oldIconCount - 1;
    this.iconCount = newIconCount;

    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }

    const oldIconKey = "icon" + oldIconCount;
    const oldIconFastener = this.getViewFastener(oldIconKey) as ViewFastener<this, SvgIconView> | null;
    const oldIconView = oldIconFastener !== null ? oldIconFastener.view : null;
    if (oldIconView !== null) {
      if (timing !== false) {
        oldIconView.opacity.setState(0, timing, View.Intrinsic);
        oldIconView.cssTransform.setState(Transform.rotate(Angle.deg(-90)), timing, View.Intrinsic);
      } else {
        oldIconView.remove();
        this.setViewFastener(oldIconKey, null);
      }
    }

    const newIconKey = "icon" + newIconCount;
    const newIconFastener = this.getViewFastener(newIconKey) as ViewFastener<this, SvgIconView> | null;
    this.icon = newIconFastener;
    const newIconView = newIconFastener !== null ? newIconFastener.view : null;
    if (newIconView !== null) {
      newIconView.opacity.setState(1, timing, View.Intrinsic);
      newIconView.cssTransform.setState(Transform.rotate(Angle.deg(0)), timing, View.Intrinsic);
      this.appendChildView(newIconView, newIconKey);
    }

    return oldIconView;
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
      let backgroundColor = this.getLookOr(Look.backgroundColor, null);
      if (!this.gesture.isHovering() && backgroundColor instanceof Color) {
        backgroundColor = backgroundColor.alpha(0);
      }
      this.backgroundColor.setState(backgroundColor, timing, View.Intrinsic);
    }
    if (!this.graphics.isInherited()) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof Icon) {
        const newGraphics = oldGraphics.withTheme(theme, mood);
        this.graphics.setOwnState(newGraphics, oldGraphics.isThemed() ? timing : false);
      }
    }
  }

  protected override onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.requireUpdate(View.NeedsLayout);
  }

  protected override onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    const iconColor = this.iconColor.takeUpdatedValue();
    if (iconColor !== void 0 && iconColor !== null) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof FilledIcon) {
        const newGraphics = oldGraphics.withFillColor(iconColor);
        this.graphics.setOwnState(newGraphics);
      }
    }
  }

  override needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.viewFlags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    return displayFlags;
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutIcon();
  }

  protected layoutIcon(): void {
    const viewFasteners = this.viewFasteners;
    if (viewFasteners !== null) {
      let viewWidth: Length | number | null = this.width.value;
      viewWidth = viewWidth instanceof Length ? viewWidth.pxValue() : this.node.offsetWidth;
      let viewHeight: Length | number | null = this.height.value;
      viewHeight = viewHeight instanceof Length ? viewHeight.pxValue() : this.node.offsetHeight;
      for (const fastenerName in viewFasteners) {
        const viewFastener = viewFasteners[fastenerName];
        if (viewFastener instanceof IconButton.IconFastener) {
          const iconView = viewFastener.view;
          if (iconView !== null) {
            iconView.width.setState(viewWidth, View.Intrinsic);
            iconView.height.setState(viewHeight, View.Intrinsic);
            iconView.viewBox.setState("0 0 " + viewWidth + " " + viewHeight, View.Intrinsic);
          }
        }
      }
    }
  }

  protected override onMount(): void {
    super.onMount();
    this.on("click", this.onClick);
  }

  protected override onUnmount(): void {
    this.off("click", this.onClick);
    super.onUnmount();
  }

  get hovers(): boolean {
    return true;
  }

  setHovers(hovers: boolean): void {
    if (this.hovers !== hovers) {
      Object.defineProperty(this, "hovers", {
        value: hovers,
        configurable: true,
        enumerable: true,
      });
    }
  }

  didStartHovering(): void {
    if (this.hovers) {
      this.modifyMood(Feel.default, [[Feel.hovering, 1]]);
      const timing = this.getLook(Look.timing);
      if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
        this.backgroundColor.setState(this.getLookOr(Look.backgroundColor, null), timing, View.Intrinsic);
      }
    }
  }

  didStopHovering(): void {
    this.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
    const timing = this.getLook(Look.timing);
    if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
      let backgroundColor = this.getLookOr(Look.backgroundColor, null);
      if (backgroundColor !== null) {
        backgroundColor = backgroundColor.alpha(0);
      }
      this.backgroundColor.setState(backgroundColor, timing, View.Intrinsic);
    }
  }

  protected onClick(event: MouseEvent): void {
    event.stopPropagation();

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.buttonDidPress !== void 0) {
        viewObserver.buttonDidPress(this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.buttonDidPress !== void 0) {
      viewController.buttonDidPress(this);
    }
  }
}
