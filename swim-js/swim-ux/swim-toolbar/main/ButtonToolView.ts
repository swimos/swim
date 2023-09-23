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
import type {Timing} from "@swim/util";
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {Animator} from "@swim/component";
import {Color} from "@swim/style";
import {Focus} from "@swim/style";
import {FocusAnimator} from "@swim/style";
import {Look} from "@swim/theme";
import {Feel} from "@swim/theme";
import type {MoodVector} from "@swim/theme";
import type {ThemeMatrix} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import type {PositionGestureInput} from "@swim/view";
import {PositionGesture} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import {Graphics} from "@swim/graphics";
import {IconLayout} from "@swim/graphics";
import {Icon} from "@swim/graphics";
import type {IconView} from "@swim/graphics";
import {IconGraphicsAnimator} from "@swim/graphics";
import {SvgIconView} from "@swim/graphics";
import {ButtonGlow} from "@swim/button";
import type {ToolViewObserver} from "./ToolView";
import {ToolView} from "./ToolView";

/** @public */
export interface ButtonToolViewObserver<V extends ButtonToolView = ButtonToolView> extends ToolViewObserver<V> {
  viewDidSetGraphics?(graphics: Graphics | null, view: V): void;
}

/** @public */
export class ButtonToolView extends ToolView implements IconView {
  protected override initTool(): void {
    super.initTool();
    this.setIntrinsic<ButtonToolView>({
      classList: ["tool-button"],
      style: {
        boxSizing: "border-box",
        borderRadius: 4,
        overflow: "hidden",
        userSelect: "none",
        cursor: "pointer",
        backgroundColor: Look.backgroundColor,
      },
    });
  }

  declare readonly observerType?: Class<ButtonToolViewObserver>;

  @Animator({valueType: Number, value: 0.5, updateFlags: View.NeedsLayout})
  override readonly xAlign!: Animator<this, number>;

  /** @override */
  @Animator({valueType: IconLayout, value: null, updateFlags: View.NeedsLayout})
  readonly iconLayout!: Animator<this, IconLayout | null>;

  /** @override */
  @ThemeAnimator({
    valueType: Color,
    value: null,
    updateFlags: View.NeedsLayout,
    didSetState(iconColor: Color | null): void {
      const timing = this.timing !== null ? this.timing : false;
      this.owner.graphics.setState(this.owner.graphics.state, timing, Affinity.Reflexive);
    },
  })
  get iconColor(): ThemeAnimator<this, Color | null> {
    return ThemeAnimator.getter();
  }

  /** @override */
  @ThemeAnimator({
    extends: IconGraphicsAnimator,
    valueType: Graphics,
    value: null,
    updateFlags: View.NeedsLayout,
    didSetValue(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.callObservers("viewDidSetGraphics", newGraphics, this.owner);
    },
  })
  readonly graphics!: ThemeAnimator<this, Graphics | null>;

  @ViewRef({
    viewType: SvgIconView,
    viewKey: true,
    binds: true,
    init(): void {
      this.insertView();
    },
    initView(svgView: SvgIconView): void {
      svgView.style.position.set("absolute");
      svgView.iconLayout.setInherits(true);
      svgView.iconColor.setInherits(true);
      svgView.graphics.setInherits(true);
    },
  })
  readonly svg!: ViewRef<this, SvgIconView>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (!this.graphics.derived) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof Icon) {
        const newGraphics = oldGraphics.withTheme(theme, mood);
        this.graphics.setState(newGraphics, oldGraphics.isThemed() ? timing : false, Affinity.Reflexive);
      }
    }
  }

  protected override onResize(): void {
    super.onResize();
    this.requireUpdate(View.NeedsLayout);
  }

  protected override needsDisplay(displayFlags: ViewFlags): ViewFlags {
    if ((this.flags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    return displayFlags;
  }

  protected override onLayout(): void {
    super.onLayout();
    this.layoutTool();
  }

  protected layoutTool(): void {
    const svgView = this.svg.view;
    if (svgView === null || !svgView.attributes.width.hasAffinity(Affinity.Intrinsic)
                         && !svgView.attributes.height.hasAffinity(Affinity.Intrinsic)
                         && !svgView.attributes.viewBox.hasAffinity(Affinity.Intrinsic)) {
      return;
    }
    const width = this.style.width.pxValue();
    const height = this.style.height.pxValue();
    svgView.attributes.setIntrinsic({
      width, height,
      viewBox: "0 0 " + width + " " + height,
    });
    this.effectiveWidth.set(width);
  }

  @Property({valueType: Boolean, value: true, inherits: true})
  readonly hovers!: Property<this, boolean>;

  @FocusAnimator({
    value: Focus.unfocused(),
    get transition(): Timing | boolean | null {
      return this.owner.getLookOr(Look.timing, null);
    },
    didSetValue(newHover: Focus, oldHover: Focus): void {
      this.owner.modifyMood(Feel.default, [[Feel.transparent, 1 - newHover.phase]], false);
    },
    init(): void {
      this.owner.modifyMood(Feel.default, [[Feel.hovering, 1],
                                           [Feel.translucent, 1],
                                           [Feel.transparent, 1 - this.value.phase]], false);
    },
  })
  readonly hover!: FocusAnimator<this, Focus>;

  @Property({valueType: Boolean, value: true, inherits: true})
  readonly glows!: Property<this, boolean>;

  protected glow(input: PositionGestureInput): void {
    if (input.detail instanceof ButtonGlow) {
      input.detail.fade(input.x, input.y);
      input.detail = void 0;
    }
    if (input.detail === void 0) {
      const delay = input.inputType === "mouse" ? 0 : 100;
      input.detail = this.prependChild(ButtonGlow);
      (input.detail as ButtonGlow).glow(input.x, input.y, void 0, delay);
    }
  }

  @PositionGesture({
    bindsOwner: true,
    observes: true,
    viewDidUnmount(): void {
      this.owner.hover.unfocus(false);
    },
    didStartHovering(): void {
      if (this.owner.hovers.value) {
        this.owner.hover.focus(false);
      }
    },
    didStopHovering(): void {
      if (this.owner.hovers.value) {
        this.owner.hover.unfocus();
      }
    },
    didBeginPress(input: PositionGestureInput, event: Event | null): void {
      if (this.owner.glows.value) {
        this.owner.glow(input);
      }
    },
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      if (input.isRunaway()) {
        this.cancelPress(input, event);
      } else if (!this.owner.clientBounds.contains(input.x, input.y)) {
        input.clearHoldTimer();
        this.beginHover(input, event);
        if (input.detail instanceof ButtonGlow) {
          input.detail.fade(input.x, input.y);
          input.detail = void 0;
        }
      }
    },
    didEndPress(input: PositionGestureInput, event: Event | null): void {
      if (!this.owner.clientBounds.contains(input.x, input.y)) {
        this.endHover(input, event);
        if (input.detail instanceof ButtonGlow) {
          input.detail.fade(input.x, input.y);
          input.detail = void 0;
        }
      } else if (input.detail instanceof ButtonGlow) {
        input.detail.pulse(input.x, input.y);
      }
    },
    didCancelPress(input: PositionGestureInput, event: Event | null): void {
      if (!this.owner.clientBounds.contains(input.x, input.y)) {
        this.endHover(input, event);
      }
      if (input.detail instanceof ButtonGlow) {
        input.detail.fade(input.x, input.y);
        input.detail = void 0;
      }
    },
    didPress(input: PositionGestureInput, event: Event | null): void {
      if (!input.defaultPrevented && this.owner.clientBounds.contains(input.x, input.y)) {
        this.owner.didPress(input, event);
      }
    },
    didLongPress(input: PositionGestureInput): void {
      if (!input.defaultPrevented) {
        this.owner.didLongPress(input);
      }
    },
  })
  readonly gesture!: PositionGesture<this, HtmlView> & Observes<HtmlView>;

  didPress(input: PositionGestureInput, event: Event | null): void {
    this.callObservers("viewDidPress", input, event, this);
  }

  didLongPress(input: PositionGestureInput): void {
    this.callObservers("viewDidLongPress", input, this);
  }
}
