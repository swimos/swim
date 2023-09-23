// Copyright 2015-2023 Nstream, inc.
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

import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {Length} from "@swim/math";
import {Angle} from "@swim/math";
import {Transform} from "@swim/math";
import type {Presence} from "@swim/style";
import {PresenceAnimator} from "@swim/style";
import {Look} from "@swim/theme";
import {Feel} from "@swim/theme";
import {Mood} from "@swim/theme";
import type {MoodVector} from "@swim/theme";
import type {ThemeMatrix} from "@swim/theme";
import {ViewRef} from "@swim/view";
import {ViewSet} from "@swim/view";
import type {PositionGestureInput} from "@swim/view";
import {PositionGesture} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import {HtmlIconView} from "@swim/graphics";
import {ButtonMembrane} from "./ButtonMembrane";

/** @public */
export type FloatingButtonType = "regular" | "mini";

/** @public */
export class FloatingButton extends ButtonMembrane {
  constructor(node: HTMLElement) {
    super(node);
    this.initButton();
  }

  protected initButton(): void {
    this.setIntrinsic<FloatingButton>({
      classList: ["floating-button"],
      style: {
        position: "relative",
        borderRadius: Length.pct(50),
        overflow: "hidden",
        userSelect: "none",
        cursor: "pointer",
      },
    });
  }

  @Property({
    valueType: String,
    value: "regular",
    init(): void {
      this.updateButtonType(this.value);
    },
    didSetValue(newButtonType: FloatingButtonType, oldButtonType: FloatingButtonType): void {
      if (newButtonType === oldButtonType) {
        return;
      }
      this.updateButtonType(newButtonType);
    },
    updateButtonType(buttonType: FloatingButtonType): void {
      if (buttonType === "regular") {
        this.owner.style.setIntrinsic({
          width: 56,
          height: 56,
        });
      } else if (buttonType === "mini") {
        this.owner.style.setIntrinsic({
          width: 40,
          height: 40,
        });
      }
    },
  })
  readonly buttonType!: Property<this, FloatingButtonType> & {
    updateButtonType(buttonType: FloatingButtonType): void;
  };

  @ViewSet({
    viewType: HtmlIconView,
    observes: true,
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, iconView: HtmlIconView): void {
      const iconColor = theme.getOr(Look.backgroundColor, mood, null);
      iconView.iconColor.set(iconColor, timing);
    },
    viewDidAnimate(iconView: HtmlIconView): void {
      if (!iconView.style.opacity.tweening && iconView !== this.owner.icon.view) {
        this.deleteView(iconView);
      }
    },
  })
  readonly icons!: ViewSet<this, HtmlIconView> & Observes<HtmlIconView>;

  @ViewRef({
    viewType: HtmlIconView,
    createView(): HtmlIconView {
      const iconView = HtmlIconView.create().setIntrinsic({
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: this.owner.style.width.state,
          height: this.owner.style.height.state,
          opacity: 0,
          transform: Transform.rotate(Angle.deg(-90)),
          pointerEvents: "none",
        },
        iconLayout: {width: 24, height: 24},
      });
      iconView.iconColor.setAffinity(Affinity.Extrinsic);
      return iconView;
    },
    push(icon: Graphics, timing?: TimingLike | boolean): HtmlIconView {
      if (timing === void 0 && this.owner.icons.viewCount === 0) {
        timing = false;
      } else if (timing === void 0 || timing === true) {
        timing = this.owner.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromLike(timing);
      }

      const oldIconView = this.view;
      if (oldIconView !== null) {
        if (timing !== false) {
          oldIconView.style.setIntrinsic({
            opacity: 0,
            transform: Transform.rotate(Angle.deg(90)),
          }, timing);
        } else {
          this.owner.icons.deleteView(oldIconView);
        }
      }

      const newIconView = this.createView().setIntrinsic({
        graphics: icon,
      });
      this.owner.icons.attachView(newIconView);
      this.insertView(void 0, newIconView);
      newIconView.style.setIntrinsic({
        opacity: 1,
        transform: Transform.rotate(Angle.deg(0)),
      }, timing);

      return newIconView;
    },
    pop(timing?: TimingLike | boolean): HtmlIconView | null {
      if (timing === void 0 || timing === true) {
        timing = this.owner.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromLike(timing);
      }

      const oldIconView = this.view;
      let newIconView: HtmlIconView | null = null;
      const iconViews = this.owner.icons.views;
      for (const viewId in iconViews) {
        const iconView = iconViews[viewId]!;
        if (iconView !== oldIconView) {
          newIconView = iconView;
        }
      }

      if (oldIconView !== null) {
        if (timing !== false) {
          oldIconView.style.setIntrinsic({
            opacity: 0,
            transform: Transform.rotate(Angle.deg(-90)),
          }, timing);
          this.owner.icons.insertView(void 0, oldIconView);
        } else {
          this.owner.icons.deleteView(oldIconView);
        }
      }

      if (newIconView !== null) {
        this.insertView(void 0, newIconView);
        newIconView.style.setIntrinsic({
          opacity: 1,
          transform: Transform.rotate(Angle.deg(0)),
        }, timing);
      }

      return oldIconView;
    },
  })
  readonly icon!: ViewRef<this, HtmlIconView> & {
    push(icon: Graphics, timing?: TimingLike | boolean): HtmlIconView;
    pop(timing?: TimingLike | boolean): HtmlIconView | null;
  };

  @PresenceAnimator({
    inherits: true,
  })
  readonly presence!: PresenceAnimator<this, Presence | undefined>;

  @PositionGesture({
    extends: true,
    didStartHovering(): void {
      this.owner.modifyMood(Feel.default, [[Feel.hovering, 1]]);
      if (this.owner.style.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
        const timing = this.owner.getLook(Look.timing);
        this.owner.style.backgroundColor.setIntrinsic(this.owner.getLookOr(Look.accentColor, null), timing);
      }
    },
    didStopHovering(): void {
      this.owner.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
      if (this.owner.style.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
        const timing = this.owner.getLook(Look.timing);
        this.owner.style.backgroundColor.setIntrinsic(this.owner.getLookOr(Look.accentColor, null), timing);
      }
    },
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      // nop
    },
  })
  override readonly gesture!: PositionGesture<this, HtmlView>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);

    this.style.backgroundColor.setIntrinsic(theme.getOr(Look.accentColor, mood, null), timing);

    let shadow = theme.getOr(Look.shadow, Mood.floating, null);
    if (shadow !== null) {
      const shadowColor = shadow.color;
      const phase = this.presence.getPhaseOr(1);
      shadow = shadow.withColor(shadowColor.alpha(shadowColor.alpha() * phase));
    }
    this.style.boxShadow.setIntrinsic(shadow, timing);
  }

  protected override onLayout(): void {
    super.onLayout();
    let shadow = this.getLookOr(Look.shadow, Mood.floating, null);
    if (shadow !== null) {
      const shadowColor = shadow.color;
      const phase = this.presence.getPhaseOr(1);
      shadow = shadow.withColor(shadowColor.alpha(shadowColor.alpha() * phase));
    }
    this.style.boxShadow.setIntrinsic(shadow);
  }
}
