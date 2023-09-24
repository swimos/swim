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

import type {Class} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {Animator} from "@swim/component";
import {EventHandler} from "@swim/component";
import {Angle} from "@swim/math";
import {Transform} from "@swim/math";
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {Feel} from "@swim/theme";
import type {MoodVector} from "@swim/theme";
import type {ThemeMatrix} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import {ViewSet} from "@swim/view";
import {PositionGesture} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import type {HtmlView} from "@swim/dom";
import {Graphics} from "@swim/graphics";
import {IconLayout} from "@swim/graphics";
import {Icon} from "@swim/graphics";
import type {IconView} from "@swim/graphics";
import {IconGraphicsAnimator} from "@swim/graphics";
import {SvgIconView} from "@swim/graphics";
import type {ButtonObserver} from "./ButtonObserver";
import {ButtonMembrane} from "./ButtonMembrane";

/** @public */
export class IconButton extends ButtonMembrane implements IconView {
  constructor(node: HTMLElement) {
    super(node);
    this.initButton();
    this.initTheme();
  }

  declare readonly observerType?: Class<HtmlViewObserver & ButtonObserver>;

  protected initButton(): void {
    this.setIntrinsic<IconButton>({
      classList: ["icon-button"],
      style: {
        position: "relative",
        width: 44,
        height: 44,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 4,
        overflow: "hidden",
        userSelect: "none",
        cursor: "pointer",
      },
    });
  }

  protected initTheme(): void {
    this.modifyTheme(Feel.default, [[Feel.translucent, 1]]);
  }

  /** @override */
  @Animator({
    valueType: IconLayout,
    initValue(): IconLayout | null {
      return IconLayout.of(24, 24);
    },
    updateFlags: View.NeedsLayout
  })
  readonly iconLayout!: Animator<this, IconLayout | null>;

  /** @override */
  @ThemeAnimator({
    valueType: Color,
    value: null,
    updateFlags: View.NeedsLayout,
    didSetState(iconColor: Color | null): void {
      const timing = this.timing !== null ? this.timing : false;
      this.owner.graphics.setIntrinsic(this.owner.graphics.state, timing);
    },
  })
  readonly iconColor!: ThemeAnimator<this, Color | null>;

  /** @override */
  @ThemeAnimator({
    extends: IconGraphicsAnimator,
    valueType: Graphics,
    value: null,
    updateFlags: View.NeedsLayout,
  })
  readonly graphics!: ThemeAnimator<this, Graphics | null>;

  @ViewSet({
    viewType: SvgIconView,
    observes: true,
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, iconView: SvgIconView): void {
      const iconColor = theme.getOr(Look.backgroundColor, mood, null);
      iconView.iconColor.set(iconColor, timing);
    },
    viewDidAnimate(iconView: SvgIconView): void {
      if (!iconView.attributes.opacity.tweening && iconView !== this.owner.icon.view) {
        this.deleteView(iconView);
      }
    },
    viewWillLayout(iconView: SvgIconView): void {
      const width = this.owner.style.width.pxValue();
      const height = this.owner.style.height.pxValue();
      iconView.attributes.setIntrinsic({
        width, height,
        viewBox: "0 0 " + width + " " + height,
      });
    },
  })
  readonly icons!: ViewSet<this, SvgIconView> & Observes<SvgIconView>;

  @ViewRef({
    viewType: SvgIconView,
    createView(): SvgIconView {
      const iconView = SvgIconView.create().setIntrinsic({
        attributes: {
          opacity: 0,
          pointerEvents: "none",
        },
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          transform: Transform.rotate(Angle.deg(-90)),
        },
      });
      iconView.iconLayout.setInherits(true);
      iconView.iconColor.setInherits(true);
      return iconView;
    },
    push(icon: Graphics, timing?: TimingLike | boolean): SvgIconView {
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
          oldIconView.attributes.setIntrinsic({
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
      newIconView.attributes.setIntrinsic({
        opacity: 1,
        transform: Transform.rotate(Angle.deg(0)),
      }, timing);

      return newIconView;
    },
    pop(timing?: TimingLike | boolean): SvgIconView | null {
      if (timing === void 0 || timing === true) {
        timing = this.owner.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromLike(timing);
      }

      const oldIconView = this.view;
      let newIconView: SvgIconView | null = null;
      const iconViews = this.owner.icons.views;
      for (const viewId in iconViews) {
        const iconView = iconViews[viewId]!;
        if (iconView !== oldIconView) {
          newIconView = iconView;
        }
      }

      if (oldIconView !== null) {
        if (timing !== false) {
          oldIconView.attributes.setIntrinsic({
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
        newIconView.attributes.setIntrinsic({
          opacity: 1,
          transform: Transform.rotate(Angle.deg(0)),
        }, timing);
      }

      return oldIconView;
    },
  })
  readonly icon!: ViewRef<this, SvgIconView> & {
    push(icon: Graphics, timing?: TimingLike | boolean): SvgIconView;
    pop(timing?: TimingLike | boolean): SvgIconView | null;
  };

  @Property({valueType: Boolean, value: true})
  readonly hovers!: Property<this, boolean>;

  @PositionGesture({
    extends: true,
    didStartHovering(): void {
      if (this.owner.hovers.value) {
        this.owner.modifyMood(Feel.default, [[Feel.hovering, 1]]);
        const timing = this.owner.getLook(Look.timing);
        if (this.owner.style.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
          this.owner.style.backgroundColor.setIntrinsic(this.owner.getLookOr(Look.backgroundColor, null), timing);
        }
      }
    },
    didStopHovering(): void {
      this.owner.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
      const timing = this.owner.getLook(Look.timing);
      if (this.owner.style.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
        let backgroundColor = this.owner.getLookOr(Look.backgroundColor, null);
        if (backgroundColor !== null) {
          backgroundColor = backgroundColor.alpha(0);
        }
        this.owner.style.backgroundColor.setIntrinsic(backgroundColor, timing);
      }
    },
  })
  override readonly gesture!: PositionGesture<this, HtmlView>;

  @EventHandler({
    eventType: "click",
    handle(event: MouseEvent): void {
      event.stopPropagation();
      this.owner.callObservers("buttonDidPress", this.owner);
    },
  })
  readonly click!: EventHandler<this>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (this.style.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
      let backgroundColor = this.getLookOr(Look.backgroundColor, null);
      if (!this.gesture.hovering && backgroundColor instanceof Color) {
        backgroundColor = backgroundColor.alpha(0);
      }
      this.style.backgroundColor.setIntrinsic(backgroundColor, timing);
    }
    if (!this.graphics.derived) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof Icon) {
        const newGraphics = oldGraphics.withTheme(theme, mood);
        this.graphics.setIntrinsic(newGraphics, oldGraphics.isThemed() ? timing : false);
      }
    }
  }

  protected override onResize(): void {
    super.onResize();
    this.requireUpdate(View.NeedsLayout);
  }
}
