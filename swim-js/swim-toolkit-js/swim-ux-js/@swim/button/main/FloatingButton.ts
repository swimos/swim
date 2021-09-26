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

import type {Mutable} from "@swim/util";
import {AnyTiming, Timing} from "@swim/mapping";
import {Length, Angle, Transform} from "@swim/math";
import {AnyExpansion, Expansion} from "@swim/style";
import {Look, Feel, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {
  ViewContextType,
  ViewContext,
  View,
  ViewAnimator,
  ExpansionViewAnimator,
  ViewFastener,
  PositionGestureInput,
  PositionGesture,
} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import {Graphics, HtmlIconView} from "@swim/graphics";
import {ButtonMembrane} from "./ButtonMembrane";

export type FloatingButtonType = "regular" | "mini";

export class FloatingButton extends ButtonMembrane {
  constructor(node: HTMLElement) {
    super(node);
    this.buttonType = "regular";
    this.iconCount = 0;
    this.icon = null;
    this.initButton();
  }

  protected initButton(): void {
    this.addClass("floating-button");
    this.position.setState("relative", View.Intrinsic);
    if (this.buttonType === "regular") {
      this.width.setState(56, View.Intrinsic);
      this.height.setState(56, View.Intrinsic);
    } else if (this.buttonType === "mini") {
      this.width.setState(40, View.Intrinsic);
      this.height.setState(40, View.Intrinsic);
    }
    this.borderTopLeftRadius.setState(Length.pct(50), View.Intrinsic);
    this.borderTopRightRadius.setState(Length.pct(50), View.Intrinsic);
    this.borderBottomLeftRadius.setState(Length.pct(50), View.Intrinsic);
    this.borderBottomRightRadius.setState(Length.pct(50), View.Intrinsic);
    this.overflowX.setState("hidden", View.Intrinsic);
    this.overflowY.setState("hidden", View.Intrinsic);
    this.userSelect.setState("none", View.Intrinsic);
    this.cursor.setState("pointer", View.Intrinsic);
  }

  readonly buttonType: FloatingButtonType;

  setButtonType(buttonType: FloatingButtonType): void {
    if (this.buttonType !== buttonType) {
      (this as Mutable<this>).buttonType = buttonType;
      if (buttonType === "regular") {
        this.width.setState(56, View.Intrinsic);
        this.height.setState(56, View.Intrinsic);
      } else if (buttonType === "mini") {
        this.width.setState(40, View.Intrinsic);
        this.height.setState(40, View.Intrinsic);
      }
    }
  }

  /** @hidden */
  static override Gesture = PositionGesture.define<FloatingButton, HtmlView>({
    extends: ButtonMembrane.Gesture,
    didStartHovering(): void {
      this.owner.modifyMood(Feel.default, [[Feel.hovering, 1]]);
      if (this.owner.backgroundColor.takesPrecedence(View.Intrinsic)) {
        const timing = this.owner.getLook(Look.timing);
        this.owner.backgroundColor.setState(this.owner.getLookOr(Look.accentColor, null), timing, View.Intrinsic);
      }
    },
    didStopHovering(): void {
      this.owner.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
      if (this.owner.backgroundColor.takesPrecedence(View.Intrinsic)) {
        const timing = this.owner.getLook(Look.timing);
        this.owner.backgroundColor.setState(this.owner.getLookOr(Look.accentColor, null), timing, View.Intrinsic);
      }
    },
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      // nop
    },
  }) as typeof ButtonMembrane.Gesture;

  @PositionGesture<FloatingButton, HtmlView>({
    extends: FloatingButton.Gesture,
  })
  override readonly gesture!: PositionGesture<this, HtmlView>;

  /** @hidden */
  static IconFastener = ViewFastener.define<FloatingButton, HtmlIconView, never, {iconIndex: number}>({
    extends: void 0,
    type: HtmlIconView,
    child: false,
    observe: true,
    iconIndex: 0,
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, iconView: HtmlIconView): void {
      const iconColor = theme.getOr(Look.backgroundColor, mood, null);
      iconView.iconColor.setState(iconColor, timing);
    },
    viewDidAnimate(viewContext: ViewContext, iconView: HtmlIconView): void {
      if (!iconView.opacity.isAnimating() && this.iconIndex !== this.owner.iconCount) {
        iconView.remove();
        if (this.iconIndex > this.owner.iconCount) {
          this.owner.setViewFastener(this.key!, null);
        }
      }
    },
  });

  /** @hidden */
  iconCount: number;

  icon: ViewFastener<this, HtmlIconView> | null;

  pushIcon(icon: Graphics, timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }

    const oldIconCount = this.iconCount;
    const oldIconKey = "icon" + oldIconCount;
    const oldIconFastener = this.getViewFastener(oldIconKey) as ViewFastener<this, HtmlIconView> | null;
    const oldIconView = oldIconFastener !== null ? oldIconFastener.view : null;
    if (oldIconView !== null) {
      if (timing !== false) {
        oldIconView.opacity.setState(0, timing, View.Intrinsic);
        oldIconView.transform.setState(Transform.rotate(Angle.deg(90)), timing, View.Intrinsic);
      } else {
        oldIconView.remove();
      }
    }

    const newIconCount = oldIconCount + 1;
    const newIconKey = "icon" + newIconCount;
    const newIconFastener = new FloatingButton.IconFastener(this, newIconKey, newIconKey);
    newIconFastener.iconIndex = newIconCount;
    const newIconView = HtmlIconView.create();
    newIconView.position.setState("absolute", View.Intrinsic);
    newIconView.left.setState(0, View.Intrinsic);
    newIconView.top.setState(0, View.Intrinsic);
    newIconView.width.setState(this.width.state, View.Intrinsic);
    newIconView.height.setState(this.height.state, View.Intrinsic);
    newIconView.opacity.setState(0, View.Intrinsic);
    newIconView.opacity.setState(1, timing, View.Intrinsic);
    newIconView.transform.setState(Transform.rotate(Angle.deg(-90)), View.Intrinsic);
    newIconView.transform.setState(Transform.rotate(Angle.deg(0)), timing, View.Intrinsic);
    newIconView.pointerEvents.setState("none", View.Intrinsic);
    newIconView.iconWidth.setState(24, View.Intrinsic);
    newIconView.iconHeight.setState(24, View.Intrinsic);
    newIconView.iconColor.setPrecedence(View.Extrinsic);
    newIconView.graphics.setState(icon, View.Intrinsic);
    newIconFastener.setView(newIconView);
    this.setViewFastener(newIconKey, newIconFastener);
    this.appendChildView(newIconView, newIconKey);

    this.iconCount = newIconCount;
    this.icon = newIconFastener;
  }

  popIcon(timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }

    const oldIconCount = this.iconCount;
    const oldIconKey = "icon" + oldIconCount;
    const oldIconFastener = this.getViewFastener(oldIconKey) as ViewFastener<this, HtmlIconView> | null;
    const oldIconView = oldIconFastener !== null ? oldIconFastener.view : null;
    if (oldIconView !== null) {
      if (timing !== false) {
        oldIconView.opacity.setState(0, timing, View.Intrinsic);
        oldIconView.transform.setState(Transform.rotate(Angle.deg(-90)), timing, View.Intrinsic);
      } else {
        oldIconView.remove();
      }
    }

    const newIconCount = oldIconCount - 1;
    const newIconKey = "icon" + newIconCount;
    const newIconFastener = this.getViewFastener(newIconKey) as ViewFastener<this, HtmlIconView> | null;
    const newIconView = newIconFastener !== null ? newIconFastener.view : null;
    if (newIconView !== null) {
      newIconView.opacity.setState(1, timing, View.Intrinsic);
      newIconView.transform.setState(Transform.rotate(Angle.deg(0)), timing, View.Intrinsic);
      this.appendChildView(newIconView, newIconKey);
    }

    this.iconCount = newIconCount;
    this.icon = newIconFastener;
  }

  @ViewAnimator({type: Expansion, inherit: true})
  readonly disclosure!: ExpansionViewAnimator<this, Expansion | undefined, AnyExpansion | undefined>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);

    this.backgroundColor.setState(theme.getOr(Look.accentColor, mood, null), timing, View.Intrinsic);

    let shadow = theme.getOr(Look.shadow, Mood.floating, null);
    if (shadow !== null) {
      const shadowColor = shadow.color;
      const phase = this.disclosure.getPhaseOr(1);
      shadow = shadow.withColor(shadowColor.alpha(shadowColor.alpha() * phase));
    }
    this.boxShadow.setState(shadow, timing, View.Intrinsic);
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);

    let shadow = this.getLookOr(Look.shadow, Mood.floating, null);
    if (shadow !== null) {
      const shadowColor = shadow.color;
      const phase = this.disclosure.getPhaseOr(1);
      shadow = shadow.withColor(shadowColor.alpha(shadowColor.alpha() * phase));
    }
    this.boxShadow.setState(shadow, View.Intrinsic);
  }
}
