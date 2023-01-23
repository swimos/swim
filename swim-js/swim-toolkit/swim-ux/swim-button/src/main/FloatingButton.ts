// Copyright 2015-2023 Swim.inc
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

import {Mutable, AnyTiming, Timing, Observes} from "@swim/util";
import {Affinity, FastenerClass} from "@swim/component";
import {Length, Angle, Transform} from "@swim/math";
import {AnyPresence, Presence, PresenceAnimator} from "@swim/style";
import {Look, Feel, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {ViewRef, PositionGestureInput, PositionGesture} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import {Graphics, HtmlIconView} from "@swim/graphics";
import {ButtonMembrane} from "./ButtonMembrane";

/** @public */
export type FloatingButtonType = "regular" | "mini";

/** @public */
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
    this.position.setState("relative", Affinity.Intrinsic);
    if (this.buttonType === "regular") {
      this.width.setState(56, Affinity.Intrinsic);
      this.height.setState(56, Affinity.Intrinsic);
    } else if (this.buttonType === "mini") {
      this.width.setState(40, Affinity.Intrinsic);
      this.height.setState(40, Affinity.Intrinsic);
    }
    this.borderTopLeftRadius.setState(Length.pct(50), Affinity.Intrinsic);
    this.borderTopRightRadius.setState(Length.pct(50), Affinity.Intrinsic);
    this.borderBottomLeftRadius.setState(Length.pct(50), Affinity.Intrinsic);
    this.borderBottomRightRadius.setState(Length.pct(50), Affinity.Intrinsic);
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);
    this.userSelect.setState("none", Affinity.Intrinsic);
    this.cursor.setState("pointer", Affinity.Intrinsic);
  }

  readonly buttonType: FloatingButtonType;

  setButtonType(buttonType: FloatingButtonType): void {
    if (this.buttonType !== buttonType) {
      (this as Mutable<this>).buttonType = buttonType;
      if (buttonType === "regular") {
        this.width.setState(56, Affinity.Intrinsic);
        this.height.setState(56, Affinity.Intrinsic);
      } else if (buttonType === "mini") {
        this.width.setState(40, Affinity.Intrinsic);
        this.height.setState(40, Affinity.Intrinsic);
      }
    }
  }

  @PositionGesture<FloatingButton["gesture"]>({
    extends: true,
    didStartHovering(): void {
      this.owner.modifyMood(Feel.default, [[Feel.hovering, 1]]);
      if (this.owner.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
        const timing = this.owner.getLook(Look.timing);
        this.owner.backgroundColor.setState(this.owner.getLookOr(Look.accentColor, null), timing, Affinity.Intrinsic);
      }
    },
    didStopHovering(): void {
      this.owner.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
      if (this.owner.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
        const timing = this.owner.getLook(Look.timing);
        this.owner.backgroundColor.setState(this.owner.getLookOr(Look.accentColor, null), timing, Affinity.Intrinsic);
      }
    },
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      // nop
    },
  })
  override readonly gesture!: PositionGesture<this, HtmlView>;
  static override readonly gesture: FastenerClass<FloatingButton["gesture"]>;

  /** @internal */
  static IconRef = ViewRef.define<ViewRef<FloatingButton, HtmlIconView> & Observes<HtmlIconView> & {iconIndex: number}>("IconRef", {
    viewType: HtmlIconView,
    observes: true,
    init(): void {
      this.iconIndex = 0;
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, iconView: HtmlIconView): void {
      const iconColor = theme.getOr(Look.backgroundColor, mood, null);
      iconView.iconColor.setState(iconColor, timing);
    },
    viewDidAnimate(iconView: HtmlIconView): void {
      if (!iconView.opacity.tweening && this.iconIndex !== this.owner.iconCount) {
        iconView.remove();
        if (this.iconIndex > this.owner.iconCount) {
          this.owner.setFastener(this.viewKey!, null);
        }
      }
    },
  });

  /** @internal */
  iconCount: number;

  icon: ViewRef<this, HtmlIconView> | null;

  pushIcon(icon: Graphics, timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }

    const oldIconCount = this.iconCount;
    const oldIconKey = "icon" + oldIconCount;
    const oldIconRef: ViewRef<this, HtmlIconView> | null = this.getFastener(oldIconKey, ViewRef);
    const oldIconView = oldIconRef !== null ? oldIconRef.view : null;
    if (oldIconView !== null) {
      if (timing !== false) {
        oldIconView.opacity.setState(0, timing, Affinity.Intrinsic);
        oldIconView.transform.setState(Transform.rotate(Angle.deg(90)), timing, Affinity.Intrinsic);
      } else {
        oldIconView.remove();
      }
    }

    const newIconCount = oldIconCount + 1;
    const newIconKey = "icon" + newIconCount;
    const newIconRef = FloatingButton.IconRef.create(this) as ViewRef<this, HtmlIconView> & {iconIndex: number};
    Object.defineProperty(newIconRef, "name", {
      value: newIconKey,
      enumerable: true,
      configurable: true,
    });
    newIconRef.iconIndex = newIconCount;
    const newIconView = HtmlIconView.create();
    newIconView.position.setState("absolute", Affinity.Intrinsic);
    newIconView.left.setState(0, Affinity.Intrinsic);
    newIconView.top.setState(0, Affinity.Intrinsic);
    newIconView.width.setState(this.width.state, Affinity.Intrinsic);
    newIconView.height.setState(this.height.state, Affinity.Intrinsic);
    newIconView.opacity.setState(0, Affinity.Intrinsic);
    newIconView.opacity.setState(1, timing, Affinity.Intrinsic);
    newIconView.transform.setState(Transform.rotate(Angle.deg(-90)), Affinity.Intrinsic);
    newIconView.transform.setState(Transform.rotate(Angle.deg(0)), timing, Affinity.Intrinsic);
    newIconView.pointerEvents.setState("none", Affinity.Intrinsic);
    newIconView.iconWidth.setState(24, Affinity.Intrinsic);
    newIconView.iconHeight.setState(24, Affinity.Intrinsic);
    newIconView.iconColor.setAffinity(Affinity.Extrinsic);
    newIconView.graphics.setState(icon, Affinity.Intrinsic);
    newIconRef.setView(newIconView);
    this.setFastener(newIconKey, newIconRef);
    this.appendChild(newIconView, newIconKey);

    this.iconCount = newIconCount;
    this.icon = newIconRef;
  }

  popIcon(timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }

    const oldIconCount = this.iconCount;
    const oldIconKey = "icon" + oldIconCount;
    const oldIconRef: ViewRef<this, HtmlIconView> | null = this.getFastener(oldIconKey, ViewRef);
    const oldIconView = oldIconRef !== null ? oldIconRef.view : null;
    if (oldIconView !== null) {
      if (timing !== false) {
        oldIconView.opacity.setState(0, timing, Affinity.Intrinsic);
        oldIconView.transform.setState(Transform.rotate(Angle.deg(-90)), timing, Affinity.Intrinsic);
      } else {
        oldIconView.remove();
      }
    }

    const newIconCount = oldIconCount - 1;
    const newIconKey = "icon" + newIconCount;
    const newIconRef: ViewRef<this, HtmlIconView> | null = this.getFastener(newIconKey, ViewRef);
    const newIconView = newIconRef !== null ? newIconRef.view : null;
    if (newIconView !== null) {
      newIconView.opacity.setState(1, timing, Affinity.Intrinsic);
      newIconView.transform.setState(Transform.rotate(Angle.deg(0)), timing, Affinity.Intrinsic);
      this.appendChild(newIconView, newIconKey);
    }

    this.iconCount = newIconCount;
    this.icon = newIconRef;
  }

  @PresenceAnimator({inherits: true})
  readonly presence!: PresenceAnimator<this, Presence | undefined, AnyPresence | undefined>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);

    this.backgroundColor.setState(theme.getOr(Look.accentColor, mood, null), timing, Affinity.Intrinsic);

    let shadow = theme.getOr(Look.shadow, Mood.floating, null);
    if (shadow !== null) {
      const shadowColor = shadow.color;
      const phase = this.presence.getPhaseOr(1);
      shadow = shadow.withColor(shadowColor.alpha(shadowColor.alpha() * phase));
    }
    this.boxShadow.setState(shadow, timing, Affinity.Intrinsic);
  }

  protected override onLayout(): void {
    super.onLayout();
    let shadow = this.getLookOr(Look.shadow, Mood.floating, null);
    if (shadow !== null) {
      const shadowColor = shadow.color;
      const phase = this.presence.getPhaseOr(1);
      shadow = shadow.withColor(shadowColor.alpha(shadowColor.alpha() * phase));
    }
    this.boxShadow.setState(shadow, Affinity.Intrinsic);
  }
}
