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

import {Mutable, Class, AnyTiming, Timing} from "@swim/util";
import {Affinity, MemberFastenerClass, Property, Animator} from "@swim/fastener";
import {Length, R2Box} from "@swim/math";
import type {Color} from "@swim/style";
import {Look, Feel, MoodVector, ThemeMatrix} from "@swim/theme";
import {
  PositionGestureInput,
  PositionGesture,
  ViewContextType,
  ViewFlags,
  View,
  ViewRef,
} from "@swim/view";
import {HtmlViewInit, HtmlView, SvgView} from "@swim/dom";
import {Graphics, PathContext, PathRenderer} from "@swim/graphics";
import type {TokenViewObserver} from "./TokenViewObserver";

export type TokenViewState = "collapsed" | "expanding" | "expanded" | "collapsing";

export interface TokenViewInit extends HtmlViewInit {
}

export class TokenView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.tokenState = "expanded";
    this.onClickHead = this.onClickHead.bind(this);
    this.onClickBody = this.onClickBody.bind(this);
    this.onClickFoot = this.onClickFoot.bind(this);
    this.initToken();
  }

  override readonly observerType?: Class<TokenViewObserver>;

  protected initToken(): void {
    this.addClass("token");
    this.position.setState("relative", Affinity.Intrinsic);
    this.height.setState(32, Affinity.Intrinsic);
    this.boxSizing.setState("content-box", Affinity.Intrinsic);
    this.userSelect.setState("none", Affinity.Intrinsic);
    this.shape.insertView();
  }

  protected initShape(shapeView: SvgView): void {
    shapeView.addClass("shape");
    shapeView.setStyle("position", "absolute");
    shapeView.setStyle("top", "0");
    shapeView.setStyle("left", "0");

    this.head.insertView(shapeView);
    this.headIcon.attachView();
    this.body.insertView(shapeView);
    this.foot.insertView(shapeView);
    this.footIcon.attachView();
  }

  protected initHead(headView: SvgView): void {
    headView.addClass("head");
    headView.fillRule.setState("evenodd", Affinity.Intrinsic);
    headView.pointerEvents.setState("bounding-box", Affinity.Intrinsic);
    headView.cursor.setState("pointer", Affinity.Intrinsic);
  }

  protected initHeadIcon(headIconView: SvgView): void {
    headIconView.addClass("head-icon");
    headIconView.pointerEvents.setState("none", Affinity.Intrinsic);
  }

  protected initBody(bodyView: SvgView): void {
    bodyView.addClass("body");
    bodyView.pointerEvents.setState("fill", Affinity.Intrinsic);
    bodyView.cursor.setState("pointer", Affinity.Intrinsic);
  }

  protected initFoot(footView: SvgView): void {
    footView.addClass("foot");
    footView.fillRule.setState("evenodd", Affinity.Intrinsic);
    footView.pointerEvents.setState("bounding-box", Affinity.Intrinsic);
    footView.cursor.setState("pointer", Affinity.Intrinsic);
  }

  protected initFootIcon(footIconView: SvgView): void {
    footIconView.addClass("foot-icon");
    footIconView.pointerEvents.setState("none", Affinity.Intrinsic);
  }

  protected initLabelContainer(labelContainer: HtmlView): void {
    labelContainer.addClass("label");
    labelContainer.display.setState("block", Affinity.Intrinsic);
    labelContainer.position.setState("absolute", Affinity.Intrinsic);
    labelContainer.top.setState(0, Affinity.Intrinsic);
    labelContainer.left.setState(0, Affinity.Intrinsic);
    labelContainer.overflowX.setState("hidden", Affinity.Intrinsic);
    labelContainer.overflowY.setState("hidden", Affinity.Intrinsic);
    labelContainer.pointerEvents.setState("none", Affinity.Intrinsic);
  }

  protected initLabel(labelView: HtmlView): void {
    labelView.position.setState("absolute", Affinity.Intrinsic);
    labelView.top.setState(0, Affinity.Intrinsic);
    labelView.bottom.setState(0, Affinity.Intrinsic);
    labelView.left.setState(0, Affinity.Intrinsic);
  }

  readonly tokenState: TokenViewState;

  get expanded(): boolean {
    return this.tokenState === "expanded" || this.tokenState === "expanding";
  }

  get collapsed(): boolean {
    return this.tokenState === "collapsed" || this.tokenState === "collapsing";
  }

  @Animator<TokenView, number>({
    type: Number,
    state: 1,
    updateFlags: View.NeedsLayout,
    didTransition(expandedPhase: number): void {
      const tokenState = this.owner.tokenState;
      if (tokenState === "expanding" && expandedPhase === 1) {
        this.owner.didExpand();
      } else if (tokenState === "collapsing" && expandedPhase === 0) {
        this.owner.didCollapse();
      }
    },
  })
  readonly expandedPhase!: Animator<this, number>;

  @ViewRef<TokenView, SvgView>({
    key: true,
    type: SvgView,
    binds: true,
    didAttachView(shapeView: SvgView): void {
      this.owner.initShape(shapeView);
    },
  })
  readonly shape!: ViewRef<this, SvgView>;
  static readonly shape: MemberFastenerClass<TokenView, "shape">;

  /** @internal */
  get fillLook(): Look<Color> {
    return Look.accentColor;
  }

  @ViewRef<TokenView, SvgView>({
    key: true,
    type: SvgView.forTag("path"),
    observes: true,
    didAttachView(headView: SvgView): void {
      this.owner.initHead(headView);
      this.owner.headGesture.setView(headView);
    },
    willDetachView(headView: SvgView): void {
      this.owner.headGesture.setView(null);
    },
    viewDidMount(headView: SvgView): void {
      headView.on("click", this.owner.onClickHead);
    },
    viewWillUnmount(headView: SvgView): void {
      headView.off("click", this.owner.onClickHead);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, headView: SvgView): void {
      headView.fill.setState(theme.getOr(this.owner.fillLook, mood, null), timing, Affinity.Intrinsic);
      const headIconView = this.owner.headIcon.view;
      if (headIconView !== null && headIconView.fill.hasAffinity(Affinity.Intrinsic)) {
        const iconColor = theme.getOr(this.owner.fillLook, mood.updated(Feel.embossed, 1), null);
        headIconView.fill.setState(iconColor, timing, Affinity.Intrinsic);
      }
    },
  })
  readonly head!: ViewRef<this, SvgView>;
  static readonly head: MemberFastenerClass<TokenView, "head">;

  @PositionGesture<TokenView, SvgView>({
    didStartHovering(): void {
      const headView = this.view!;
      headView.modifyMood(Feel.default, [[Feel.hovering, 1]]);
      const timing = headView.getLook(Look.timing);
      headView.fill.setState(headView.getLookOr(this.owner.fillLook, null), timing, Affinity.Intrinsic);
      const headIconView = this.owner.headIcon.view;
      if (headIconView !== null && headIconView.fill.hasAffinity(Affinity.Intrinsic)) {
        const iconColor = headView.getLookOr(this.owner.fillLook, headView.mood.getState().updated(Feel.embossed, 1), null);
        headIconView.fill.setState(iconColor, timing, Affinity.Intrinsic);
      }
    },
    didStopHovering(): void {
      const headView = this.view!;
      headView.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
      const timing = headView.getLook(Look.timing);
      headView.fill.setState(headView.getLookOr(this.owner.fillLook, null), timing, Affinity.Intrinsic);
      const headIconView = this.owner.headIcon.view;
      if (headIconView !== null && headIconView.fill.hasAffinity(Affinity.Intrinsic)) {
        const iconColor = headView.getLookOr(this.owner.fillLook, headView.mood.getState().updated(Feel.embossed, 1), null);
        headIconView.fill.setState(iconColor, timing, Affinity.Intrinsic);
      }
    },
    didBeginPress(input: PositionGestureInput, event: Event | null): void {
      if (input.inputType !== "mouse") {
        this.beginHover(input, event);
      }
    },
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      if (input.isRunaway()) {
        this.cancelPress(input, event);
      }
    },
    didEndPress(input: PositionGestureInput, event: Event | null): void {
      if (input.inputType !== "mouse" || !this.view!.clientBounds.contains(input.x, input.y)) {
        this.endHover(input, event);
      }
    },
    didCancelPress(input: PositionGestureInput, event: Event | null): void {
      if (input.inputType !== "mouse" || !this.view!.clientBounds.contains(input.x, input.y)) {
        this.endHover(input, event);
      }
    },
  })
  readonly headGesture!: PositionGesture<this, SvgView>;
  static readonly headGesture: MemberFastenerClass<TokenView, "headGesture">;

  /** @internal */
  @ViewRef<TokenView, SvgView>({
    key: true,
    type: SvgView.forTag("path"),
    didAttachView(headIconView: SvgView): void {
      this.owner.initHeadIcon(headIconView);
    },
    insertChild(parent: View, childView: SvgView, targetView: View | null, key: string | undefined): void {
      const shapeView = this.owner.shape.view;
      if (shapeView !== null) {
        shapeView.insertChild(childView, this.owner.body.view, key);
      }
    },
  })
  readonly headIcon!: ViewRef<this, SvgView>;
  static readonly headIcon: MemberFastenerClass<TokenView, "headIcon">;

  @Property<TokenView, Graphics | null, never, {embossed: boolean}>({
    type: Object,
    state: null,
    updateFlags: View.NeedsLayout,
    embossed: true,
  })
  readonly icon!: Property<this, Graphics | null> & {embossed: boolean};

  @ViewRef<TokenView, SvgView>({
    key: true,
    type: SvgView.forTag("path"),
    observes: true,
    didAttachView(bodyView: SvgView): void {
      this.owner.initBody(bodyView);
      this.owner.bodyGesture.setView(bodyView);
    },
    willDetachView(bodyView: SvgView): void {
      this.owner.bodyGesture.setView(null);
    },
    viewDidMount(headView: SvgView): void {
      headView.on("click", this.owner.onClickBody);
    },
    viewWillUnmount(headView: SvgView): void {
      headView.off("click", this.owner.onClickBody);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, bodyView: SvgView): void {
      bodyView.fill.setState(theme.getOr(this.owner.fillLook, mood, null), timing, Affinity.Intrinsic);
      const labelView = this.owner.label.view;
      if (labelView !== null && labelView.color.hasAffinity(Affinity.Intrinsic)) {
        labelView.color.setState(theme.getOr(Look.backgroundColor, mood, null), timing, Affinity.Intrinsic);
      }
    },
  })
  readonly body!: ViewRef<this, SvgView>;
  static readonly body: MemberFastenerClass<TokenView, "body">;

  @PositionGesture<TokenView, SvgView>({
    didStartHovering(): void {
      const bodyView = this.view!;
      bodyView.modifyMood(Feel.default, [[Feel.hovering, 1]]);
      const timing = bodyView.getLook(Look.timing);
      bodyView.fill.setState(bodyView.getLookOr(this.owner.fillLook, null), timing, Affinity.Intrinsic);
      const labelView = this.owner.label.view;
      if (labelView !== null && labelView.color.hasAffinity(Affinity.Intrinsic)) {
        labelView.color.setState(bodyView.getLookOr(Look.backgroundColor, null), timing, Affinity.Intrinsic);
      }
    },
    didStopHovering(): void {
      const bodyView = this.view!;
      bodyView.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
      const timing = bodyView.getLook(Look.timing);
      bodyView.fill.setState(bodyView.getLookOr(this.owner.fillLook, null), timing, Affinity.Intrinsic);
      const labelView = this.owner.label.view;
      if (labelView !== null && labelView.color.hasAffinity(Affinity.Intrinsic)) {
        labelView.color.setState(bodyView.getLookOr(Look.backgroundColor, null), timing, Affinity.Intrinsic);
      }
    },
    didBeginPress(input: PositionGestureInput, event: Event | null): void {
      if (input.inputType !== "mouse") {
        this.beginHover(input, event);
      }
    },
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      if (input.isRunaway()) {
        this.cancelPress(input, event);
      }
    },
    didEndPress(input: PositionGestureInput, event: Event | null): void {
      if (input.inputType !== "mouse" || !this.view!.clientBounds.contains(input.x, input.y)) {
        this.endHover(input, event);
      }
    },
    didCancelPress(input: PositionGestureInput, event: Event | null): void {
      if (input.inputType !== "mouse" || !this.view!.clientBounds.contains(input.x, input.y)) {
        this.endHover(input, event);
      }
    },
  })
  readonly bodyGesture!: PositionGesture<this, SvgView>;
  static readonly bodyGesture: MemberFastenerClass<TokenView, "bodyGesture">;

  @ViewRef<TokenView, SvgView>({
    key: true,
    type: SvgView.forTag("path"),
    observes: true,
    didAttachView(footView: SvgView): void {
      this.owner.initFoot(footView);
      this.owner.footGesture.setView(footView);
    },
    willDetachView(footView: SvgView): void {
      this.owner.footGesture.setView(null);
    },
    viewDidMount(footView: SvgView): void {
      footView.on("click", this.owner.onClickFoot);
    },
    viewWillUnmount(footView: SvgView): void {
      footView.off("click", this.owner.onClickFoot);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, footView: SvgView): void {
      footView.fill.setState(theme.getOr(this.owner.fillLook, mood, null), timing, Affinity.Intrinsic);
      const footIconView = this.owner.footIcon.view;
      if (footIconView !== null && footIconView.fill.hasAffinity(Affinity.Intrinsic)) {
        const iconColor = theme.getOr(this.owner.fillLook, mood.updated(Feel.embossed, 1), null);
        footIconView.fill.setState(iconColor, timing, Affinity.Intrinsic);
      }
    },
  })
  readonly foot!: ViewRef<this, SvgView>;
  static readonly foot: MemberFastenerClass<TokenView, "foot">;

  @PositionGesture<TokenView, SvgView>({
    didStartHovering(): void {
      const footView = this.view!;
      footView.modifyMood(Feel.default, [[Feel.hovering, 1]]);
      const timing = footView.getLook(Look.timing);
      footView.fill.setState(footView.getLookOr(this.owner.fillLook, null), timing, Affinity.Intrinsic);
      const footIconView = this.owner.footIcon.view;
      if (footIconView !== null && footIconView.fill.hasAffinity(Affinity.Intrinsic)) {
        const iconColor = footView.getLookOr(this.owner.fillLook, footView.mood.getState().updated(Feel.embossed, 1), null);
        footIconView.fill.setState(iconColor, timing, Affinity.Intrinsic);
      }
    },
    didStopHovering(): void {
      const footView = this.view!;
      footView.modifyMood(Feel.default, [[Feel.hovering, void 0]]);
      const timing = footView.getLook(Look.timing);
      footView.fill.setState(footView.getLookOr(this.owner.fillLook, null), timing, Affinity.Intrinsic);
      const footIconView = this.owner.footIcon.view;
      if (footIconView !== null && footIconView.fill.hasAffinity(Affinity.Intrinsic)) {
        const iconColor = footView.getLookOr(this.owner.fillLook, footView.mood.getState().updated(Feel.embossed, 1), null);
        footIconView.fill.setState(iconColor, timing, Affinity.Intrinsic);
      }
    },
    didBeginPress(input: PositionGestureInput, event: Event | null): void {
      if (input.inputType !== "mouse") {
        this.beginHover(input, event);
      }
    },
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      if (input.isRunaway()) {
        this.cancelPress(input, event);
      }
    },
    didEndPress(input: PositionGestureInput, event: Event | null): void {
      if (input.inputType !== "mouse" || !this.view!.clientBounds.contains(input.x, input.y)) {
        this.endHover(input, event);
      }
    },
    didCancelPress(input: PositionGestureInput, event: Event | null): void {
      if (input.inputType !== "mouse" || !this.view!.clientBounds.contains(input.x, input.y)) {
        this.endHover(input, event);
      }
    },
  })
  readonly footGesture!: PositionGesture<this, SvgView>;
  static readonly footGesture: MemberFastenerClass<TokenView, "footGesture">;

  /** @internal */
  @ViewRef<TokenView, SvgView>({
    key: true,
    type: SvgView.forTag("path"),
    didAttachView(footIconView: SvgView): void {
      this.owner.initFootIcon(footIconView);
    },
    insertChild(parent: View, childView: SvgView, targetView: View | null, key: string | undefined): void {
      const shapeView = this.owner.shape.view;
      if (shapeView !== null) {
        shapeView.appendChild(childView, key);
      }
    },
  })
  readonly footIcon!: ViewRef<this, SvgView>;
  static readonly footIcon: MemberFastenerClass<TokenView, "footIcon">;

  @Property<TokenView, Graphics | null, never, {embossed: boolean}>({
    type: Object,
    state: null,
    updateFlags: View.NeedsLayout,
    init(): void {
      this.embossed = true;
    },
  })
  readonly accessory!: Property<this, Graphics | null> & {embossed: boolean};

  @ViewRef<TokenView, HtmlView>({
    key: true,
    type: HtmlView,
    binds: true,
    didAttachView(labelContainer: HtmlView): void {
      this.owner.initLabelContainer(labelContainer);
    },
  })
  readonly labelContainer!: ViewRef<this, HtmlView>;
  static readonly labelContainer: MemberFastenerClass<TokenView, "labelContainer">;

  @ViewRef<TokenView, HtmlView>({
    key: true,
    type: HtmlView,
    didAttachView(labelView: HtmlView): void {
      if (labelView.parent === null) {
        this.owner.labelContainer.insertView();
        const labelContainer = this.owner.labelContainer.view;
        if (labelContainer !== null) {
          labelContainer.appendChild(labelView);
        }
      }
      this.owner.initLabel(labelView);
    },
  })
  readonly label!: ViewRef<this, HtmlView>;
  static readonly label: MemberFastenerClass<TokenView, "label">;

  protected override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
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

    let tokenWidth = tokenHeight;
    if (expandedPhase !== 0 && bodyWidth !== 0) {
      tokenWidth += gap + expandedPhase * bodyWidth;
    }
    const bodyRight = tokenWidth;
    if (expandedPhase !== 0 && footWidth !== 0) {
      tokenWidth += gap + expandedPhase * footWidth;
    }

    const width = tokenWidth + paddingLeft + paddingRight;
    const height = boxHeight;

    this.width.setState(tokenWidth, Affinity.Intrinsic);

    const labelContainer = this.labelContainer.view;
    if (labelContainer !== null) {
      labelContainer.display.setState(expandedPhase !== 0 ? "block" : "none", Affinity.Intrinsic);
      labelContainer.left.setState(paddingLeft + tokenHeight + gap + labelPaddingLeft, Affinity.Intrinsic);
      labelContainer.top.setState(paddingTop, Affinity.Intrinsic);
      labelContainer.width.setState(expandedPhase * labelWidth, Affinity.Intrinsic);
      labelContainer.height.setState(tokenHeight, Affinity.Intrinsic);
    }

    const shapeView = this.shape.view;
    if (shapeView !== null) {
      shapeView.width.setState(width, Affinity.Intrinsic);
      shapeView.height.setState(height, Affinity.Intrinsic);
      shapeView.viewBox.setState("0 0 " + width + " " + height, Affinity.Intrinsic);
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
      headView.d.setState(context.toString(), Affinity.Intrinsic);
    }
    const headIconView = this.headIcon.view;
    if (headIconView !== null) {
      if (icon !== null && this.icon.embossed) {
        const context = new PathContext();
        context.setPrecision(3);
        const renderer = new PathRenderer(context);
        const frame = new R2Box(paddingLeft, paddingTop, paddingLeft + tokenHeight, paddingTop + tokenHeight);
        icon.render(renderer, frame);
        headIconView.d.setState(context.toString(), Affinity.Intrinsic);
        this.headIcon.insertView();
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
      bodyView.d.setState(context.toString(), Affinity.Intrinsic);
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
      footView.d.setState(context.toString(), Affinity.Intrinsic);
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
        footIconView.d.setState(context.toString(), Affinity.Intrinsic);
        this.footIcon.insertView();
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
        this.onExpand();
      }
      if (timing !== false) {
        if (this.expandedPhase.value !== 1) {
          this.expandedPhase.setState(1, timing, Affinity.Intrinsic);
        } else {
          setTimeout(this.didExpand.bind(this));
        }
      } else {
        this.expandedPhase.setState(1, Affinity.Intrinsic);
        this.didExpand();
      }
    }
  }

  protected willExpand(): void {
    (this as Mutable<this>).tokenState = "expanding";
    const labelContainer = this.labelContainer.view;
    if (labelContainer !== null) {
      labelContainer.display.setState("block", Affinity.Intrinsic);
    }

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.tokenWillExpand !== void 0) {
        observer.tokenWillExpand(this);
      }
    }
  }

  protected onExpand(): void {
    // hook
  }

  protected didExpand(): void {
    (this as Mutable<this>).tokenState = "expanded";
    this.requireUpdate(View.NeedsLayout);

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.tokenDidExpand !== void 0) {
        observer.tokenDidExpand(this);
      }
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
        this.onCollapse();
      }
      if (timing !== false) {
        if (this.expandedPhase.value !== 0) {
          this.expandedPhase.setState(0, timing, Affinity.Intrinsic);
        } else {
          setTimeout(this.didCollapse.bind(this));
        }
      } else {
        this.expandedPhase.setState(0, Affinity.Intrinsic);
        this.didCollapse();
      }
    }
  }

  protected willCollapse(): void {
    (this as Mutable<this>).tokenState = "collapsing";

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.tokenWillCollapse !== void 0) {
        observer.tokenWillCollapse(this);
      }
    }
  }

  protected onCollapse(): void {
    const labelView = this.label.view;
    if (labelView !== null) {
      labelView.node.blur();
    }
  }

  protected didCollapse(): void {
    (this as Mutable<this>).tokenState = "collapsed";
    this.requireUpdate(View.NeedsLayout);

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.tokenDidCollapse !== void 0) {
        observer.tokenDidCollapse(this);
      }
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
    this.toggle();
    const labelView = this.label.view;
    if (labelView !== null && this.expanded) {
      labelView.node.focus();
    }
    this.didPressHead();
  }

  protected didPressHead(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.tokenDidPressHead !== void 0) {
        observer.tokenDidPressHead(this);
      }
    }
  }

  protected onClickBody(event: MouseEvent): void {
    this.didPressBody();
  }

  protected didPressBody(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.tokenDidPressBody !== void 0) {
        observer.tokenDidPressBody(this);
      }
    }
  }

  protected onClickFoot(event: MouseEvent): void {
    this.didPressFoot();
  }

  protected didPressFoot(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.tokenDidPressFoot !== void 0) {
        observer.tokenDidPressFoot(this);
      }
    }
  }

  override init(init: TokenViewInit): void {
    super.init(init);
  }
}
