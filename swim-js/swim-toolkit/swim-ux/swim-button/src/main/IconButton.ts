// Copyright 2015-2022 Swim.inc
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

import {Class, AnyTiming, Timing} from "@swim/util";
import {Affinity, MemberFastenerClass, Animator} from "@swim/component";
import {AnyLength, Length, Angle, Transform} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look, Feel, MoodVector, ThemeMatrix, ThemeAnimator} from "@swim/theme";
import {
  PositionGesture,
  ViewContextType,
  ViewContext,
  ViewFlags,
  View,
  ViewRef,
} from "@swim/view";
import type {HtmlView, HtmlViewObserver} from "@swim/dom";
import {
  Graphics,
  Icon,
  FilledIcon,
  IconViewInit,
  IconView,
  IconGraphicsAnimator,
  SvgIconView,
} from "@swim/graphics";
import type {ButtonObserver} from "./ButtonObserver";
import {ButtonMembraneInit, ButtonMembrane} from "./ButtonMembrane";

/** @public */
export interface IconButtonInit extends ButtonMembraneInit, IconViewInit {
}

/** @public */
export class IconButton extends ButtonMembrane implements IconView {
  constructor(node: HTMLElement) {
    super(node);
    this.iconCount = 0;
    this.icon = null;
    this.onClick = this.onClick.bind(this);
    this.initButton();
    this.initTheme();
  }

  override readonly observerType?: Class<HtmlViewObserver & ButtonObserver>;

  protected initButton(): void {
    this.addClass("icon-button");
    this.position.setState("relative", Affinity.Intrinsic);
    this.width.setState(44, Affinity.Intrinsic);
    this.height.setState(44, Affinity.Intrinsic);
    this.display.setState("flex", Affinity.Intrinsic);
    this.justifyContent.setState("center", Affinity.Intrinsic);
    this.alignItems.setState("center", Affinity.Intrinsic);
    this.borderTopLeftRadius.setState(4, Affinity.Intrinsic);
    this.borderTopRightRadius.setState(4, Affinity.Intrinsic);
    this.borderBottomLeftRadius.setState(4, Affinity.Intrinsic);
    this.borderBottomRightRadius.setState(4, Affinity.Intrinsic);
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);
    this.userSelect.setState("none", Affinity.Intrinsic);
    this.cursor.setState("pointer", Affinity.Intrinsic);
  }

  protected initTheme(): void {
    this.modifyTheme(Feel.default, [[Feel.translucent, 1]]);
  }

  @Animator({type: Number, value: 0.5, updateFlags: View.NeedsLayout})
  readonly xAlign!: Animator<this, number>;

  @Animator({type: Number, value: 0.5, updateFlags: View.NeedsLayout})
  readonly yAlign!: Animator<this, number>;

  @ThemeAnimator({type: Length, value: Length.px(24), updateFlags: View.NeedsLayout})
  readonly iconWidth!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({type: Length, value: Length.px(24), updateFlags: View.NeedsLayout})
  readonly iconHeight!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator<IconButton, Color | null, AnyColor | null>({
    type: Color,
    value: null,
    updateFlags: View.NeedsLayout,
    didSetValue(newIconColor: Color | null, oldIconColor: Color | null): void {
      if (newIconColor !== null) {
        const oldGraphics = this.owner.graphics.value;
        if (oldGraphics instanceof FilledIcon) {
          const newGraphics = oldGraphics.withFillColor(newIconColor);
          this.owner.graphics.setState(newGraphics, Affinity.Reflexive);
        }
      }
    },
  })
  readonly iconColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({extends: IconGraphicsAnimator, value: null, type: Object, updateFlags: View.NeedsLayout})
  readonly graphics!: ThemeAnimator<this, Graphics | null>;

  /** @internal */
  static IconRef = ViewRef.define<IconButton, SvgIconView, {iconIndex: number}>("IconRef", {
    implements: true,
    type: SvgIconView,
    observes: true,
    init(): void {
      this.iconIndex = 0;
    },
    viewDidAnimate(viewContext: ViewContext, iconView: SvgIconView): void {
      if (!iconView.opacity.tweening && this.iconIndex !== this.owner.iconCount) {
        iconView.remove();
        if (this.iconIndex > this.owner.iconCount) {
          this.owner.setFastener(this.name, null);
        }
      }
    },
  });

  /** @internal */
  iconCount: number;

  icon: ViewRef<this, SvgIconView> | null;

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
    const oldIconRef: ViewRef<this, SvgIconView> | null = this.getFastener(oldIconKey, ViewRef);
    const oldIconView = oldIconRef !== null ? oldIconRef.view : null;
    if (oldIconView !== null) {
      if (timing !== false) {
        oldIconView.opacity.setState(0, timing, Affinity.Intrinsic);
        oldIconView.cssTransform.setState(Transform.rotate(Angle.deg(90)), timing, Affinity.Intrinsic);
      } else {
        oldIconView.remove();
      }
    }

    const newIconKey = "icon" + newIconCount;
    const newIconRef = IconButton.IconRef.create(this);
    Object.defineProperty(newIconRef, "name", {
      value: newIconKey,
      enumerable: true,
      configurable: true,
    });
    newIconRef.iconIndex = newIconCount;
    this.icon = newIconRef;
    const newIconView = SvgIconView.create();

    newIconView.setStyle("position", "absolute");
    newIconView.setStyle("left", "0");
    newIconView.setStyle("top", "0");
    newIconView.opacity.setState(0, Affinity.Intrinsic);
    newIconView.opacity.setState(1, timing, Affinity.Intrinsic);
    newIconView.cssTransform.setState(Transform.rotate(Angle.deg(-90)), Affinity.Intrinsic);
    newIconView.cssTransform.setState(Transform.rotate(Angle.deg(0)), timing, Affinity.Intrinsic);
    newIconView.pointerEvents.setState("none", Affinity.Intrinsic);
    newIconView.xAlign.setInherits(true);
    newIconView.yAlign.setInherits(true);
    newIconView.iconWidth.setInherits(true);
    newIconView.iconHeight.setInherits(true);
    newIconView.iconColor.setInherits(true);
    newIconView.graphics.setState(icon, Affinity.Intrinsic);
    newIconRef.setView(newIconView);
    this.setFastener(newIconKey, newIconRef);
    this.appendChild(newIconView, newIconKey);
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
    const oldIconRef: ViewRef<this, SvgIconView> | null = this.getFastener(oldIconKey, ViewRef);
    const oldIconView = oldIconRef !== null ? oldIconRef.view : null;
    if (oldIconView !== null) {
      if (timing !== false) {
        oldIconView.opacity.setState(0, timing, Affinity.Intrinsic);
        oldIconView.cssTransform.setState(Transform.rotate(Angle.deg(-90)), timing, Affinity.Intrinsic);
      } else {
        oldIconView.remove();
        this.setFastener(oldIconKey, null);
      }
    }

    const newIconKey = "icon" + newIconCount;
    const newIconRef: ViewRef<this, SvgIconView> | null = this.getFastener(newIconKey, ViewRef);
    this.icon = newIconRef;
    const newIconView = newIconRef !== null ? newIconRef.view : null;
    if (newIconView !== null) {
      newIconView.opacity.setState(1, timing, Affinity.Intrinsic);
      newIconView.cssTransform.setState(Transform.rotate(Angle.deg(0)), timing, Affinity.Intrinsic);
      this.appendChild(newIconView, newIconKey);
    }

    return oldIconView;
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (this.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
      let backgroundColor = this.getLookOr(Look.backgroundColor, null);
      if (!this.gesture.hovering && backgroundColor instanceof Color) {
        backgroundColor = backgroundColor.alpha(0);
      }
      this.backgroundColor.setState(backgroundColor, timing, Affinity.Intrinsic);
    }
    if (!this.graphics.inherited) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof Icon) {
        const newGraphics = oldGraphics.withTheme(theme, mood);
        this.graphics.setState(newGraphics, oldGraphics.isThemed() ? timing : false, Affinity.Reflexive);
      }
    }
  }

  protected override onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.requireUpdate(View.NeedsLayout);
  }

  protected override needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.flags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    return displayFlags;
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutIcon();
  }

  protected layoutIcon(): void {
    const fasteners = this.fasteners;
    if (fasteners !== null) {
      let viewWidth: Length | number | null = this.width.value;
      viewWidth = viewWidth instanceof Length ? viewWidth.pxValue() : this.node.offsetWidth;
      let viewHeight: Length | number | null = this.height.value;
      viewHeight = viewHeight instanceof Length ? viewHeight.pxValue() : this.node.offsetHeight;
      for (const fastenerName in fasteners) {
        const fastener = fasteners[fastenerName];
        if (fastener instanceof IconButton.IconRef) {
          const iconView = fastener.view;
          if (iconView !== null) {
            iconView.width.setState(viewWidth, Affinity.Intrinsic);
            iconView.height.setState(viewHeight, Affinity.Intrinsic);
            iconView.viewBox.setState("0 0 " + viewWidth + " " + viewHeight, Affinity.Intrinsic);
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
      });
    }
  }

  @PositionGesture<IconButton, HtmlView>({
    extends: true,
    didStartHovering(): void {
      if (this.owner.hovers) {
        this.owner.modifyMood(Feel.default, [[Feel.hovering, 1]]);
        const timing = this.owner.getLook(Look.timing);
        if (this.owner.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
          this.owner.backgroundColor.setState(this.owner.getLookOr(Look.backgroundColor, null), timing, Affinity.Intrinsic);
        }
      }
    },
    didStopHovering(): void {
      this.owner.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
      const timing = this.owner.getLook(Look.timing);
      if (this.owner.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
        let backgroundColor = this.owner.getLookOr(Look.backgroundColor, null);
        if (backgroundColor !== null) {
          backgroundColor = backgroundColor.alpha(0);
        }
        this.owner.backgroundColor.setState(backgroundColor, timing, Affinity.Intrinsic);
      }
    },
  })
  override readonly gesture!: PositionGesture<this, HtmlView>;
  static override readonly gesture: MemberFastenerClass<IconButton, "gesture">;

  protected onClick(event: MouseEvent): void {
    event.stopPropagation();

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.buttonDidPress !== void 0) {
        observer.buttonDidPress(this);
      }
    }
  }

  override init(init: IconButtonInit): void {
    super.init(init);
    IconView.init(this, init);
  }
}
