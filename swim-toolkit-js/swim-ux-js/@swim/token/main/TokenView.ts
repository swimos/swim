// Copyright 2015-2021 Swim inc.
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
import {Length, R2Box} from "@swim/math";
import type {Color} from "@swim/style";
import {Look, Feel, MoodVector, ThemeMatrix} from "@swim/theme";
import {
  ViewContextType,
  ViewFlags,
  View,
  ViewObserver,
  ViewProperty,
  ViewAnimator,
  ViewFastener,
  PositionGestureInput,
  PositionGesture,
  PositionGestureDelegate,
} from "@swim/view";
import {HtmlViewInit, HtmlView, SvgView} from "@swim/dom";
import {Graphics, PathContext, PathRenderer} from "@swim/graphics";
import type {TokenViewObserver} from "./TokenViewObserver";
import type {TokenViewController} from "./TokenViewController";

export type TokenViewState = "collapsed" | "expanding" | "expanded" | "collapsing";

export interface TokenViewInit extends HtmlViewInit {
  controller?: TokenViewController;
}

export class TokenView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    Object.defineProperty(this, "tokenState", {
      value: "expanded",
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "headGesture", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "bodyGesture", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "footGesture", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    this.onClickHead = this.onClickHead.bind(this);
    this.onClickBody = this.onClickBody.bind(this);
    this.onClickFoot = this.onClickFoot.bind(this);
    this.initToken();
  }

  protected initToken(): void {
    this.addClass("token");
    this.position.setState("relative", View.Intrinsic);
    this.height.setState(32, View.Intrinsic);
    this.boxSizing.setState("content-box", View.Intrinsic);
    this.userSelect.setState("none", View.Intrinsic);
    this.shape.injectView();
  }

  override readonly viewController!: TokenViewController | null;

  override readonly viewObservers!: ReadonlyArray<TokenViewObserver>;

  override initView(init: TokenViewInit): void {
    super.initView(init);
  }

  protected initShape(shapeView: SvgView): void {
    shapeView.addClass("shape");
    shapeView.setStyle("position", "absolute");
    shapeView.setStyle("top", "0");
    shapeView.setStyle("left", "0");

    this.head.injectView(shapeView);
    this.headIcon.setView(this.headIcon.createView());
    this.body.injectView(shapeView);
    this.foot.injectView(shapeView);
    this.footIcon.setView(this.footIcon.createView());
  }

  protected initHead(headView: SvgView): void {
    headView.addClass("head");
    headView.fillRule.setState("evenodd", View.Intrinsic);
    headView.pointerEvents.setState("bounding-box", View.Intrinsic);
    headView.cursor.setState("pointer", View.Intrinsic);
    const headGesture = this.createHeadGesture(headView);
    if (headGesture !== null) {
      Object.defineProperty(this, "headGesture", {
        value: headGesture,
        enumerable: true,
        configurable: true,
      });
    }
  }

  /** @hidden */
  readonly headGesture!: PositionGesture<SvgView> | null;

  protected createHeadGesture(headView: SvgView): PositionGesture<SvgView> | null {
    return new PositionGesture(headView, this.head);
  }

  protected initHeadIcon(headIconView: SvgView): void {
    headIconView.addClass("head-icon");
    headIconView.pointerEvents.setState("none", View.Intrinsic);
  }

  protected initBody(bodyView: SvgView): void {
    bodyView.addClass("body");
    bodyView.pointerEvents.setState("fill", View.Intrinsic);
    bodyView.cursor.setState("pointer", View.Intrinsic);
    const bodyGesture = this.createBodyGesture(bodyView);
    if (bodyGesture !== null) {
      Object.defineProperty(this, "bodyGesture", {
        value: bodyGesture,
        enumerable: true,
        configurable: true,
      });
    }
  }

  /** @hidden */
  readonly bodyGesture!: PositionGesture<SvgView> | null;

  protected createBodyGesture(bodyView: SvgView): PositionGesture<SvgView> | null {
    return new PositionGesture(bodyView, this.body);
  }

  protected initFoot(footView: SvgView): void {
    footView.addClass("foot");
    footView.fillRule.setState("evenodd", View.Intrinsic);
    footView.pointerEvents.setState("bounding-box", View.Intrinsic);
    footView.cursor.setState("pointer", View.Intrinsic);
    const footGesture = this.createFootGesture(footView);
    if (footGesture !== null) {
      Object.defineProperty(this, "footGesture", {
        value: footGesture,
        enumerable: true,
        configurable: true,
      });
    }
  }

  /** @hidden */
  readonly footGesture!: PositionGesture<SvgView> | null;

  protected createFootGesture(footView: SvgView): PositionGesture<SvgView> | null {
    return new PositionGesture(footView, this.foot);
  }

  protected initFootIcon(footIconView: SvgView): void {
    footIconView.addClass("foot-icon");
    footIconView.pointerEvents.setState("none", View.Intrinsic);
  }

  protected initLabelContainer(labelContainer: HtmlView): void {
    labelContainer.addClass("label");
    labelContainer.display.setState("block", View.Intrinsic);
    labelContainer.position.setState("absolute", View.Intrinsic);
    labelContainer.top.setState(0, View.Intrinsic);
    labelContainer.left.setState(0, View.Intrinsic);
    labelContainer.overflowX.setState("hidden", View.Intrinsic);
    labelContainer.overflowY.setState("hidden", View.Intrinsic);
    labelContainer.pointerEvents.setState("none", View.Intrinsic);
  }

  protected initLabel(labelView: HtmlView): void {
    labelView.position.setState("absolute", View.Intrinsic);
    labelView.top.setState(0, View.Intrinsic);
    labelView.bottom.setState(0, View.Intrinsic);
    labelView.left.setState(0, View.Intrinsic);
  }

  readonly tokenState!: TokenViewState;

  isExpanded(): boolean {
    return this.tokenState === "expanded" || this.tokenState === "expanding";
  }

  isCollapsed(): boolean {
    return this.tokenState === "collapsed" || this.tokenState === "collapsing";
  }

  @ViewAnimator<TokenView, number>({
    type: Number,
    state: 1,
    updateFlags: View.NeedsLayout,
    onEnd(expandedPhase: number): void {
      const tokenState = this.owner.tokenState;
      if (tokenState === "expanding" && expandedPhase === 1) {
        this.owner.didExpand();
      } else if (tokenState === "collapsing" && expandedPhase === 0) {
        this.owner.didCollapse();
      }
    },
  })
  readonly expandedPhase!: ViewAnimator<this, number>;

  @ViewFastener<TokenView, SvgView>({
    key: true,
    type: SvgView,
    onSetView(shapeView: SvgView | null): void {
      if (shapeView !== null) {
        this.owner.initShape(shapeView);
      }
    },
  })
  readonly shape!: ViewFastener<this, SvgView>;

  /** @hidden */
  get fillLook(): Look<Color> {
    return Look.accentColor;
  }

  @ViewFastener<TokenView, SvgView, never, ViewObserver & PositionGestureDelegate>({
    extends: void 0,
    key: true,
    type: SvgView.path,
    child: false,
    observe: true,
    onSetView(headView: SvgView | null): void {
      if (headView !== null) {
        this.owner.initHead(headView);
      }
    },
    viewDidMount(headView: SvgView): void {
      headView.on("click", this.owner.onClickHead);
    },
    viewWillUnmount(headView: SvgView): void {
      headView.off("click", this.owner.onClickHead);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, headView: SvgView): void {
      headView.fill.setState(theme.getOr(this.owner.fillLook, mood, null), timing, View.Intrinsic);
      const headIconView = this.owner.headIcon.view;
      if (headIconView !== null && headIconView.fill.takesPrecedence(View.Intrinsic)) {
        const iconColor = theme.getOr(this.owner.fillLook, mood.updated(Feel.embossed, 1), null);
        headIconView.fill.setState(iconColor, timing, View.Intrinsic);
      }
    },
    didStartHovering(): void {
      const headView = this.view!;
      headView.modifyMood(Feel.default, [[Feel.hovering, 1]]);
      const timing = headView.getLook(Look.timing);
      headView.fill.setState(headView.getLookOr(this.owner.fillLook, null), timing, View.Intrinsic);
      const headIconView = this.owner.headIcon.view;
      if (headIconView !== null && headIconView.fill.takesPrecedence(View.Intrinsic)) {
        const iconColor = headView.getLookOr(this.owner.fillLook, headView.mood.getState().updated(Feel.embossed, 1), null);
        headIconView.fill.setState(iconColor, timing, View.Intrinsic);
      }
    },
    didStopHovering(): void {
      const headView = this.view!;
      headView.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
      const timing = headView.getLook(Look.timing);
      headView.fill.setState(headView.getLookOr(this.owner.fillLook, null), timing, View.Intrinsic);
      const headIconView = this.owner.headIcon.view;
      if (headIconView !== null && headIconView.fill.takesPrecedence(View.Intrinsic)) {
        const iconColor = headView.getLookOr(this.owner.fillLook, headView.mood.getState().updated(Feel.embossed, 1), null);
        headIconView.fill.setState(iconColor, timing, View.Intrinsic);
      }
    },
    didBeginPress(input: PositionGestureInput, event: Event | null): void {
      const headGesture = this.owner.headGesture;
      if (headGesture !== null && input.inputType !== "mouse") {
        headGesture.beginHover(input, event);
      }
    },
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      const headGesture = this.owner.headGesture;
      if (headGesture !== null && input.isRunaway()) {
        headGesture.cancelPress(input, event);
      }
    },
    didEndPress(input: PositionGestureInput, event: Event | null): void {
      const headGesture = this.owner.headGesture;
      if (headGesture !== null && (input.inputType !== "mouse" || !this.view!.clientBounds.contains(input.x, input.y))) {
        headGesture.endHover(input, event);
      }
    },
    didCancelPress(input: PositionGestureInput, event: Event | null): void {
      const headGesture = this.owner.headGesture;
      if (headGesture !== null && (input.inputType !== "mouse" || !this.view!.clientBounds.contains(input.x, input.y))) {
        headGesture.endHover(input, event);
      }
    },
  })
  readonly head!: ViewFastener<this, SvgView> & PositionGestureDelegate;

  /** @hidden */
  @ViewFastener<TokenView, SvgView, never, ViewObserver & PositionGestureDelegate>({
    extends: void 0,
    key: true,
    type: SvgView.path,
    child: false,
    onSetView(headIconView: SvgView | null): void {
      if (headIconView !== null) {
        this.owner.initHeadIcon(headIconView);
      }
    },
    insertView(parentView: View, childView: SvgView, targetView: View | null, key: string | undefined): void {
      const shapeView = this.owner.shape.view;
      if (shapeView !== null) {
        shapeView.insertChildView(childView, this.owner.body.view, key);
      }
    },
  })
  readonly headIcon!: ViewFastener<this, SvgView> & PositionGestureDelegate;

  @ViewProperty<TokenView, Graphics | null, never, {embossed: boolean}>({
    extends: void 0,
    type: Object,
    state: null,
    updateFlags: View.NeedsLayout,
    embossed: true,
  })
  readonly icon!: ViewProperty<this, Graphics | null> & {embossed: boolean};

  @ViewFastener<TokenView, SvgView, never, ViewObserver & PositionGestureDelegate>({
    extends: void 0,
    key: true,
    type: SvgView.path,
    child: false,
    observe: true,
    onSetView(bodyView: SvgView | null): void {
      if (bodyView !== null) {
        this.owner.initBody(bodyView);
      }
    },
    viewDidMount(headView: SvgView): void {
      headView.on("click", this.owner.onClickBody);
    },
    viewWillUnmount(headView: SvgView): void {
      headView.off("click", this.owner.onClickBody);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, bodyView: SvgView): void {
      bodyView.fill.setState(theme.getOr(this.owner.fillLook, mood, null), timing, View.Intrinsic);
      const labelView = this.owner.label.view;
      if (labelView !== null && labelView.color.takesPrecedence(View.Intrinsic)) {
        labelView.color.setState(theme.getOr(Look.backgroundColor, mood, null), timing, View.Intrinsic);
      }
    },
    didStartHovering(): void {
      const bodyView = this.view!;
      bodyView.modifyMood(Feel.default, [[Feel.hovering, 1]]);
      const timing = bodyView.getLook(Look.timing);
      bodyView.fill.setState(bodyView.getLookOr(this.owner.fillLook, null), timing, View.Intrinsic);
      const labelView = this.owner.label.view;
      if (labelView !== null && labelView.color.takesPrecedence(View.Intrinsic)) {
        labelView.color.setState(bodyView.getLookOr(Look.backgroundColor, null), timing, View.Intrinsic);
      }
    },
    didStopHovering(): void {
      const bodyView = this.view!;
      bodyView.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
      const timing = bodyView.getLook(Look.timing);
      bodyView.fill.setState(bodyView.getLookOr(this.owner.fillLook, null), timing, View.Intrinsic);
      const labelView = this.owner.label.view;
      if (labelView !== null && labelView.color.takesPrecedence(View.Intrinsic)) {
        labelView.color.setState(bodyView.getLookOr(Look.backgroundColor, null), timing, View.Intrinsic);
      }
    },
    didBeginPress(input: PositionGestureInput, event: Event | null): void {
      const bodyGesture = this.owner.bodyGesture;
      if (bodyGesture !== null && input.inputType !== "mouse") {
        bodyGesture.beginHover(input, event);
      }
    },
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      const bodyGesture = this.owner.bodyGesture;
      if (bodyGesture !== null && input.isRunaway()) {
        bodyGesture.cancelPress(input, event);
      }
    },
    didEndPress(input: PositionGestureInput, event: Event | null): void {
      const bodyGesture = this.owner.bodyGesture;
      if (bodyGesture !== null && (input.inputType !== "mouse" || !this.view!.clientBounds.contains(input.x, input.y))) {
        bodyGesture.endHover(input, event);
      }
    },
    didCancelPress(input: PositionGestureInput, event: Event | null): void {
      const bodyGesture = this.owner.bodyGesture;
      if (bodyGesture !== null && (input.inputType !== "mouse" || !this.view!.clientBounds.contains(input.x, input.y))) {
        bodyGesture.endHover(input, event);
      }
    },
  })
  readonly body!: ViewFastener<this, SvgView> & PositionGestureDelegate;

  @ViewFastener<TokenView, SvgView, never, ViewObserver & PositionGestureDelegate>({
    extends: void 0,
    key: true,
    type: SvgView.path,
    child: false,
    observe: true,
    onSetView(footView: SvgView | null): void {
      if (footView !== null) {
        this.owner.initFoot(footView);
      }
    },
    viewDidMount(footView: SvgView): void {
      footView.on("click", this.owner.onClickFoot);
    },
    viewWillUnmount(footView: SvgView): void {
      footView.off("click", this.owner.onClickFoot);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, footView: SvgView): void {
      footView.fill.setState(theme.getOr(this.owner.fillLook, mood, null), timing, View.Intrinsic);
      const footIconView = this.owner.footIcon.view;
      if (footIconView !== null && footIconView.fill.takesPrecedence(View.Intrinsic)) {
        const iconColor = theme.getOr(this.owner.fillLook, mood.updated(Feel.embossed, 1), null);
        footIconView.fill.setState(iconColor, timing, View.Intrinsic);
      }
    },
    didStartHovering(): void {
      const footView = this.view!;
      footView.modifyMood(Feel.default, [[Feel.hovering, 1]]);
      const timing = footView.getLook(Look.timing);
      footView.fill.setState(footView.getLookOr(this.owner.fillLook, null), timing, View.Intrinsic);
      const footIconView = this.owner.footIcon.view;
      if (footIconView !== null && footIconView.fill.takesPrecedence(View.Intrinsic)) {
        const iconColor = footView.getLookOr(this.owner.fillLook, footView.mood.getState().updated(Feel.embossed, 1), null);
        footIconView.fill.setState(iconColor, timing, View.Intrinsic);
      }
    },
    didStopHovering(): void {
      const footView = this.view!;
      footView.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
      const timing = footView.getLook(Look.timing);
      footView.fill.setState(footView.getLookOr(this.owner.fillLook, null), timing, View.Intrinsic);
      const footIconView = this.owner.footIcon.view;
      if (footIconView !== null && footIconView.fill.takesPrecedence(View.Intrinsic)) {
        const iconColor = footView.getLookOr(this.owner.fillLook, footView.mood.getState().updated(Feel.embossed, 1), null);
        footIconView.fill.setState(iconColor, timing, View.Intrinsic);
      }
    },
    didBeginPress(input: PositionGestureInput, event: Event | null): void {
      const footGesture = this.owner.footGesture;
      if (footGesture !== null && input.inputType !== "mouse") {
        footGesture.beginHover(input, event);
      }
    },
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      const footGesture = this.owner.footGesture;
      if (footGesture !== null && input.isRunaway()) {
        footGesture.cancelPress(input, event);
      }
    },
    didEndPress(input: PositionGestureInput, event: Event | null): void {
      const footGesture = this.owner.footGesture;
      if (footGesture !== null && (input.inputType !== "mouse" || !this.view!.clientBounds.contains(input.x, input.y))) {
        footGesture.endHover(input, event);
      }
    },
    didCancelPress(input: PositionGestureInput, event: Event | null): void {
      const footGesture = this.owner.footGesture;
      if (footGesture !== null && (input.inputType !== "mouse" || !this.view!.clientBounds.contains(input.x, input.y))) {
        footGesture.endHover(input, event);
      }
    },
  })
  readonly foot!: ViewFastener<this, SvgView> & PositionGestureDelegate;

  /** @hidden */
  @ViewFastener<TokenView, SvgView, never, ViewObserver & PositionGestureDelegate>({
    extends: void 0,
    key: true,
    type: SvgView.path,
    child: false,
    onSetView(footIconView: SvgView | null): void {
      if (footIconView !== null) {
        this.owner.initFootIcon(footIconView);
      }
    },
    insertView(parentView: View, childView: SvgView, targetView: View | null, key: string | undefined): void {
      const shapeView = this.owner.shape.view;
      if (shapeView !== null) {
        shapeView.appendChildView(childView, key);
      }
    },
  })
  readonly footIcon!: ViewFastener<this, SvgView> & PositionGestureDelegate;

  @ViewProperty<TokenView, Graphics | null, never, {embossed: boolean}>({
    extends: void 0,
    type: Object,
    state: null,
    updateFlags: View.NeedsLayout,
    embossed: true,
  })
  readonly accessory!: ViewProperty<this, Graphics | null> & {embossed: boolean};

  @ViewFastener<TokenView, HtmlView>({
    key: true,
    type: HtmlView,
    onSetView(labelContainer: HtmlView | null): void {
      if (labelContainer !== null) {
        this.owner.initLabelContainer(labelContainer);
      }
    },
  })
  readonly labelContainer!: ViewFastener<this, HtmlView>;

  @ViewFastener<TokenView, HtmlView>({
    key: true,
    child: false,
    type: HtmlView,
    onSetView(labelView: HtmlView | null): void {
      if (labelView !== null) {
        if (labelView.parentView === null) {
          this.owner.labelContainer.injectView();
          const labelContainer = this.owner.labelContainer.view;
          if (labelContainer !== null) {
            labelContainer.appendChildView(labelView);
          }
        }
        this.owner.initLabel(labelView);
      }
    },
  })
  readonly label!: ViewFastener<this, HtmlView>;

  override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((processFlags & View.NeedsLayout) !== 0) {
      processFlags |= View.NeedsAnimate;
    }
    return processFlags;
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutToken();
  }

  protected layoutToken(): void {
    const gap = 2;

    const paddingTop = this.paddingTop.getStateOr(Length.zero()).pxValue();
    const paddingRight = this.paddingRight.getStateOr(Length.zero()).pxValue();
    const paddingBottom = this.paddingBottom.getStateOr(Length.zero()).pxValue();
    const paddingLeft = this.paddingLeft.getStateOr(Length.zero()).pxValue();
    const boxHeight = this.node.clientHeight;
    const tokenHeight = boxHeight - paddingTop - paddingBottom;
    const radius = tokenHeight / 2;
    const pad = Math.sqrt(gap * gap + 2 * radius * gap);
    const padAngle = Math.asin(pad / (radius + gap));
    const labelPaddingLeft = radius / 2;
    const labelPaddingRight = radius;
    const accessoryPaddingRight = radius / 2;
    const expandedPhase = this.expandedPhase.value;

    const icon = this.icon.state;
    const accessoryIcon = this.accessory.state;

    let labelWidth = 0;
    let bodyWidth = 0;
    const labelView = this.label.view;
    if (labelView !== null) {
      labelWidth = labelView.node.clientWidth;
      bodyWidth += labelPaddingLeft + labelWidth + labelPaddingRight;
    }

    let accessoryWidth = 0;
    let footWidth = 0;
    if (accessoryIcon !== null) {
      accessoryWidth = 2 * radius;
      footWidth += accessoryWidth + accessoryPaddingRight;
    }

    let tokenWidth = tokenHeight
    if (expandedPhase !== 0 && bodyWidth !== 0) {
      tokenWidth += gap + expandedPhase * bodyWidth;
    }
    const bodyRight = tokenWidth;
    if (expandedPhase !== 0 && footWidth !== 0) {
      tokenWidth += gap + expandedPhase * footWidth;
    }

    const width = tokenWidth + paddingLeft + paddingRight;
    const height = boxHeight;

    this.width.setState(tokenWidth, View.Intrinsic);

    const labelContainer = this.labelContainer.view;
    if (labelContainer !== null) {
      labelContainer.display.setState(expandedPhase !== 0 ? "block" : "none", View.Intrinsic);
      labelContainer.left.setState(paddingLeft + tokenHeight + gap + labelPaddingLeft, View.Intrinsic);
      labelContainer.top.setState(paddingTop, View.Intrinsic);
      labelContainer.width.setState(expandedPhase * labelWidth, View.Intrinsic);
      labelContainer.height.setState(tokenHeight, View.Intrinsic);
    }

    const shapeView = this.shape.view;
    if (shapeView !== null) {
      shapeView.width.setState(width, View.Intrinsic);
      shapeView.height.setState(height, View.Intrinsic);
      shapeView.viewBox.setState("0 0 " + width + " " + height, View.Intrinsic);
    }

    const headView = this.head.view;
    if (headView !== null) {
      const context = new PathContext();
      context.setPrecision(3);
      context.arc(paddingLeft + radius, paddingTop + radius, radius, -(Math.PI / 2), 3 * (Math.PI / 2));
      context.closePath();
      if (icon !== null && !this.icon.embossed) {
        const renderer = new PathRenderer(context);
        const frame = new R2Box(paddingLeft, paddingTop, paddingLeft + tokenHeight, paddingTop + tokenHeight);
        icon.render(renderer, frame);
        this.headIcon.removeView();
      }
      headView.d.setState(context.toString(), View.Intrinsic);
    }
    const headIconView = this.headIcon.view;
    if (headIconView !== null) {
      if (icon !== null && this.icon.embossed) {
        const context = new PathContext();
        context.setPrecision(3);
        const renderer = new PathRenderer(context);
        const frame = new R2Box(paddingLeft, paddingTop, paddingLeft + tokenHeight, paddingTop + tokenHeight);
        icon.render(renderer, frame);
        headIconView.d.setState(context.toString(), View.Intrinsic);
        this.headIcon.injectView();
      } else {
        this.headIcon.removeView();
      }
    }

    const bodyView = this.body.view;
    if (bodyView !== null) {
      const context = new PathContext();
      context.setPrecision(3);
      if (expandedPhase !== 0) {
        const u = 1 - expandedPhase;
        context.arc(paddingLeft + radius, paddingTop + radius, radius + gap, -(Math.PI / 2) + padAngle, Math.PI / 2 - padAngle);
        context.arc(paddingLeft + bodyRight - radius - u * gap, paddingTop + radius, radius + u * gap, Math.PI / 2 - u * padAngle, -(Math.PI / 2) + u * padAngle, true);
        context.closePath();
      }
      bodyView.d.setState(context.toString(), View.Intrinsic);
    }

    const footView = this.foot.view;
    if (footView !== null && accessoryIcon !== null) {
      const context = new PathContext();
      context.setPrecision(3);
      if (expandedPhase !== 0) {
        const u = 1 - expandedPhase;
        context.arc(paddingLeft + bodyRight - radius, paddingTop + radius, radius + gap, -(Math.PI / 2) + padAngle, Math.PI / 2 - padAngle);
        context.arc(paddingLeft + tokenWidth - radius - u * gap, paddingTop + radius, radius + u * gap, Math.PI / 2 - u * padAngle, -(Math.PI / 2) + u * padAngle, true);
        context.closePath();
        if (accessoryIcon !== null && !this.accessory.embossed) {
          const renderer = new PathRenderer(context);
          const frame = new R2Box(paddingLeft + bodyRight + gap, paddingTop, paddingLeft + bodyRight + gap + 2 * radius, paddingTop + 2 * radius);
          accessoryIcon.render(renderer, frame);
          this.headIcon.removeView();
        }
      }
      footView.d.setState(context.toString(), View.Intrinsic);
    }
    const footIconView = this.footIcon.view;
    if (footIconView !== null) {
      if (accessoryIcon !== null && this.accessory.embossed) {
        const context = new PathContext();
        context.setPrecision(3);
        if (expandedPhase !== 0) {
          const renderer = new PathRenderer(context);
          const frame = new R2Box(paddingLeft + bodyRight + gap, paddingTop, paddingLeft + bodyRight + gap + tokenHeight, paddingTop + tokenHeight);
          accessoryIcon.render(renderer, frame);
        }
        footIconView.d.setState(context.toString(), View.Intrinsic);
        this.footIcon.injectView();
      } else {
        this.footIcon.removeView();
      }
    }
  }

  expand(timing?: AnyTiming | boolean): void {
    if (this.tokenState !== "expanded" || this.expandedPhase.value !== 1) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      if (this.tokenState !== "expanding") {
        this.willExpand();
      }
      if (timing !== false) {
        if (this.expandedPhase.value !== 1) {
          this.expandedPhase.setState(1, timing, View.Intrinsic);
        } else {
          setTimeout(this.didExpand.bind(this));
        }
      } else {
        this.expandedPhase.setState(1, View.Intrinsic);
        this.didExpand();
      }
    }
  }

  protected willExpand(): void {
    Object.defineProperty(this, "tokenState", {
      value: "expanding",
      enumerable: true,
      configurable: true,
    });
    const labelContainer = this.labelContainer.view;
    if (labelContainer !== null) {
      labelContainer.display.setState("block", View.Intrinsic);
    }

    const viewController = this.viewController;
    if (viewController !== null && viewController.tokenWillExpand !== void 0) {
      viewController.tokenWillExpand(this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.tokenWillExpand !== void 0) {
        viewObserver.tokenWillExpand(this);
      }
    }
  }

  protected didExpand(): void {
    Object.defineProperty(this, "tokenState", {
      value: "expanded",
      enumerable: true,
      configurable: true,
    });
    this.requireUpdate(View.NeedsLayout);

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.tokenDidExpand !== void 0) {
        viewObserver.tokenDidExpand(this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.tokenDidExpand !== void 0) {
      viewController.tokenDidExpand(this);
    }
  }

  collapse(timing?: AnyTiming | boolean): void {
    if (this.tokenState !== "collapsed" || this.expandedPhase.value !== 0) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      if (this.tokenState !== "collapsing") {
        this.willCollapse();
      }
      if (timing !== false) {
        if (this.expandedPhase.value !== 0) {
          this.expandedPhase.setState(0, timing, View.Intrinsic);
        } else {
          setTimeout(this.didCollapse.bind(this));
        }
      } else {
        this.expandedPhase.setState(0, View.Intrinsic);
        this.didCollapse();
      }
    }
  }

  protected willCollapse(): void {
    Object.defineProperty(this, "tokenState", {
      value: "collapsing",
      enumerable: true,
      configurable: true,
    });

    const viewController = this.viewController;
    if (viewController !== null && viewController.tokenWillCollapse !== void 0) {
      viewController.tokenWillCollapse(this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.tokenWillCollapse !== void 0) {
        viewObserver.tokenWillCollapse(this);
      }
    }
  }

  protected didCollapse(): void {
    Object.defineProperty(this, "tokenState", {
      value: "collapsed",
      enumerable: true,
      configurable: true,
    });
    this.requireUpdate(View.NeedsLayout);

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.tokenDidCollapse !== void 0) {
        viewObserver.tokenDidCollapse(this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.tokenDidCollapse !== void 0) {
      viewController.tokenDidCollapse(this);
    }
  }

  toggle(timing?: AnyTiming | boolean): void {
    const tokenState = this.tokenState;
    if (tokenState === "collapsed" || tokenState === "collapsing") {
      this.expand(timing);
    } else if (tokenState === "expanded" || tokenState === "expanding") {
      this.collapse(timing);
    }
  }

  protected onClickHead(event: MouseEvent): void {
    this.didPressHead();
  }

  protected didPressHead(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.tokenDidPressHead !== void 0) {
        viewObserver.tokenDidPressHead(this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.tokenDidPressHead !== void 0) {
      viewController.tokenDidPressHead(this);
    }
  }

  protected onClickBody(event: MouseEvent): void {
    this.didPressBody();
  }

  protected didPressBody(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.tokenDidPressBody !== void 0) {
        viewObserver.tokenDidPressBody(this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.tokenDidPressBody !== void 0) {
      viewController.tokenDidPressBody(this);
    }
  }

  protected onClickFoot(event: MouseEvent): void {
    this.didPressFoot();
  }

  protected didPressFoot(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.tokenDidPressFoot !== void 0) {
        viewObserver.tokenDidPressFoot(this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.tokenDidPressFoot !== void 0) {
      viewController.tokenDidPressFoot(this);
    }
  }
}
