// Copyright 2015-2021 Swim.inc
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

import type {Class, Timing} from "@swim/util";
import {Affinity, MemberFastenerClass, Property, Animator} from "@swim/component";
import {AnyLength, Length} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look, Feel, MoodVector, ThemeMatrix, ThemeAnimator} from "@swim/theme";
import {PositionGestureInput, PositionGesture, ViewContextType, View} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import {Graphics, Icon, FilledIcon, IconGraphicsAnimator, SvgIconView} from "@swim/graphics";
import {ButtonGlow} from "@swim/button";
import {ToolView} from "./ToolView";
import type {ButtonToolViewObserver} from "./ButtonToolViewObserver";

/** @public */
export class ButtonToolView extends ToolView {
  constructor(node: HTMLElement) {
    super(node);
    this.initSvg();
  }

  protected override initTool(): void {
    super.initTool();
    this.addClass("tool-button");
    this.boxSizing.setState("content-box", Affinity.Intrinsic);
    this.borderTopLeftRadius.setState(4, Affinity.Intrinsic);
    this.borderTopRightRadius.setState(4, Affinity.Intrinsic);
    this.borderBottomLeftRadius.setState(4, Affinity.Intrinsic);
    this.borderBottomRightRadius.setState(4, Affinity.Intrinsic);
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);
    this.userSelect.setState("none", Affinity.Intrinsic);
    this.cursor.setState("pointer", Affinity.Intrinsic);

    this.modifyMood(Feel.default, [[Feel.translucent, 1]]);
  }

  override readonly observerType?: Class<ButtonToolViewObserver>;

  protected initSvg(): void {
    const svgView = this.createSvgView();
    if (svgView !== null) {
      this.setChild("svg", svgView);
    }
  }

  protected createSvgView(): SvgIconView | null {
    return SvgIconView.create();
  }

  get svgView(): SvgIconView | null {
    const svgView = this.getChild("svg");
    return svgView instanceof SvgIconView ? svgView : null;
  }

  @Animator({type: Number, value: 0.5, updateFlags: View.NeedsLayout})
  override readonly xAlign!: Animator<this, number>;

  @Animator({type: Number, value: 0.5, updateFlags: View.NeedsLayout})
  readonly yAlign!: Animator<this, number>;

  @ThemeAnimator({type: Length, value: null, updateFlags: View.NeedsLayout})
  readonly iconWidth!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({type: Length, value: null, updateFlags: View.NeedsLayout})
  readonly iconHeight!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator<ButtonToolView, Color | null, AnyColor | null>({
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

  @ThemeAnimator<ButtonToolView, Graphics | null>({
    extends: IconGraphicsAnimator,
    type: Object,
    value: null,
    updateFlags: View.NeedsLayout,
    willSetValue(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.callObservers("viewWillSetGraphics", newGraphics, oldGraphics, this.owner);
    },
    didSetValue(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.requireUpdate(View.NeedsRasterize | View.NeedsComposite);
      this.owner.callObservers("viewDidSetGraphics", newGraphics, oldGraphics, this.owner);
    },
  })
  readonly graphics!: ThemeAnimator<this, Graphics | null>;

  protected override onInsertChild(child: View, target: View | null): void {
    super.onInsertChild(child, target);
    if (child.key === "svg" && child instanceof SvgIconView) {
      this.onInsertSvg(child);
    }
  }

  protected onInsertSvg(svgView: SvgIconView): void {
    svgView.xAlign.setInherits(true);
    svgView.yAlign.setInherits(true);
    svgView.iconWidth.setInherits(true);
    svgView.iconHeight.setInherits(true);
    svgView.iconColor.setInherits(true);
    svgView.graphics.setInherits(true);
    svgView.setStyle("position", "absolute");
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
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

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutTool();
  }

  protected layoutTool(): void {
    const svgView = this.svgView;
    if (svgView !== null && (svgView.width.hasAffinity(Affinity.Intrinsic)
                          || svgView.height.hasAffinity(Affinity.Intrinsic)
                          || svgView.viewBox.hasAffinity(Affinity.Intrinsic))) {
      let viewWidth: Length | number | null = this.width.value;
      viewWidth = viewWidth instanceof Length ? viewWidth.pxValue() : this.node.offsetWidth;
      let viewHeight: Length | number | null = this.height.value;
      viewHeight = viewHeight instanceof Length ? viewHeight.pxValue() : this.node.offsetHeight;
      svgView.width.setState(viewWidth, Affinity.Intrinsic);
      svgView.height.setState(viewHeight, Affinity.Intrinsic);
      svgView.viewBox.setState("0 0 " + viewWidth + " " + viewHeight, Affinity.Intrinsic);
      this.effectiveWidth.setState(viewWidth);
    }
  }

  @Property({type: Boolean, inherits: true, value: true})
  readonly hovers!: Property<this, boolean>;

  @Property({type: Boolean, inherits: true, value: true})
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

  @PositionGesture<ButtonToolView, HtmlView>({
    self: true,
    observes: true,
    viewDidUnmount(): void {
      this.owner.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
      if (this.owner.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
        let backgroundColor = this.owner.getLookOr(Look.backgroundColor, null);
        if (backgroundColor !== null) {
          backgroundColor = backgroundColor.alpha(0);
        }
        this.owner.backgroundColor.setState(backgroundColor, false, Affinity.Intrinsic);
      }
    },
    didStartHovering(): void {
      if (this.owner.hovers.value) {
        this.owner.modifyMood(Feel.default, [[Feel.hovering, 1]]);
        if (this.owner.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
          const timing = this.owner.getLook(Look.timing);
          this.owner.backgroundColor.setState(this.owner.getLookOr(Look.backgroundColor, null), timing, Affinity.Intrinsic);
        }
      }
    },
    didStopHovering(): void {
      this.owner.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
      if (this.owner.backgroundColor.hasAffinity(Affinity.Intrinsic)) {
        let backgroundColor = this.owner.getLookOr(Look.backgroundColor, null);
        if (backgroundColor !== null) {
          backgroundColor = backgroundColor.alpha(0);
        }
        const timing = this.owner.getLook(Look.timing);
        this.owner.backgroundColor.setState(backgroundColor, timing, Affinity.Intrinsic);
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
        this.owner.onPress(input, event);
        this.owner.didPress(input, event);
      }
    },
    didLongPress(input: PositionGestureInput): void {
      if (!input.defaultPrevented) {
        this.owner.onLongPress(input);
        this.owner.didLongPress(input);
      }
    },
  })
  readonly gesture!: PositionGesture<this, HtmlView>;
  static readonly gesture: MemberFastenerClass<ButtonToolView, "gesture">;

  onPress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  didPress(input: PositionGestureInput, event: Event | null): void {
    this.callObservers("viewDidPress", input, event, this);
  }

  onLongPress(input: PositionGestureInput): void {
    // hook
  }

  didLongPress(input: PositionGestureInput): void {
    this.callObservers("viewDidLongPress", input, this);
  }
}
