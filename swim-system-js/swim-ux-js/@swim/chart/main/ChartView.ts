// Copyright 2015-2020 SWIM.AI inc.
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

import {Objects} from "@swim/util";
import {PointR2, BoxR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {Tween, AnyTransition, Transition} from "@swim/transition";
import {
  MemberAnimator,
  View,
  RenderedViewContext,
  RenderedViewInit,
  RenderedView,
  GraphicsView,
} from "@swim/view";
import {Multitouch, ScaleGestureEvent, ScaleGesture} from "@swim/gesture";
import {AnyAxisView, AxisView} from "./axis/AxisView";
import {AnyPlotView, PlotView} from "./plot/PlotView";
import {ChartViewController} from "./ChartViewController";

export type ChartDomainBounds<D> = [D | boolean, D | boolean];

export type ChartDomainPadding<D> = [D | null, D | null];

export type AnyChartView<X = any, Y = any> = ChartView<X, Y> | ChartViewInit<X, Y>;

export interface ChartViewInit<X = any, Y = any> extends RenderedViewInit {
  topAxis?: AnyAxisView<X> | null;
  rightAxis?: AnyAxisView<Y> | null;
  bottomAxis?: AnyAxisView<X> | null;
  leftAxis?: AnyAxisView<Y> | null;

  plots?: AnyPlotView<X, Y>[] | null;

  fitTopDomain?: boolean;
  fitRightDomain?: boolean;
  fitBottomDomain?: boolean;
  fitLeftDomain?: boolean;

  topDomainBounds?: ChartDomainBounds<X>;
  rightDomainBounds?: ChartDomainBounds<Y>;
  bottomDomainBounds?: ChartDomainBounds<X>;
  leftDomainBounds?: ChartDomainBounds<Y>;

  topDomainPadding?: ChartDomainPadding<X>;
  rightDomainPadding?: ChartDomainPadding<Y>;
  bottomDomainPadding?: ChartDomainPadding<X>;
  leftDomainPadding?: ChartDomainPadding<Y>;

  rescaleTransition?: AnyTransition<any> | null;

  multitouch?: Multitouch | boolean | null;
  topGesture?: ScaleGesture<X> | boolean | null;
  rightGesture?: ScaleGesture<Y> | boolean | null;
  bottomGesture?: ScaleGesture<X> | boolean | null;
  leftGesture?: ScaleGesture<Y> | boolean | null;

  topGutter?: AnyLength;
  rightGutter?: AnyLength;
  bottomGutter?: AnyLength;
  leftGutter?: AnyLength;

  domainColor?: AnyColor;
  domainWidth?: number;
  domainSerif?: number;

  tickMarkColor?: AnyColor;
  tickMarkWidth?: number;
  tickMarkLength?: number;

  tickLabelPadding?: number;

  gridLineColor?: AnyColor;
  gridLineWidth?: number;

  font?: AnyFont | null;
  textColor?: AnyColor | null;
}

export class ChartView<X = any, Y = any> extends GraphicsView {
  /** @hidden */
  _viewController: ChartViewController<X, Y> | null;

  /** @hidden */
  _fitTopDomain: boolean;
  /** @hidden */
  _fitRightDomain: boolean;
  /** @hidden */
  _fitBottomDomain: boolean;
  /** @hidden */
  _fitLeftDomain: boolean;

  /** @hidden */
  _trackTopDomain: boolean;
  /** @hidden */
  _trackRightDomain: boolean;
  /** @hidden */
  _trackBottomDomain: boolean;
  /** @hidden */
  _trackLeftDomain: boolean;

  /** @hidden */
  readonly _topDomainBounds: ChartDomainBounds<X>;
  /** @hidden */
  readonly _rightDomainBounds: ChartDomainBounds<Y>;
  /** @hidden */
  readonly _bottomDomainBounds: ChartDomainBounds<X>;
  /** @hidden */
  readonly _leftDomainBounds: ChartDomainBounds<Y>;

  /** @hidden */
  readonly _topDomainPadding: ChartDomainPadding<X>;
  /** @hidden */
  readonly _rightDomainPadding: ChartDomainPadding<Y>;
  /** @hidden */
  readonly _bottomDomainPadding: ChartDomainPadding<X>;
  /** @hidden */
  readonly _leftDomainPadding: ChartDomainPadding<Y>;

  /** @hidden */
  _multitouch: Multitouch | null;
  /** @hidden */
  _topGesture: ScaleGesture<X> | null;
  /** @hidden */
  _rightGesture: ScaleGesture<Y> | null;
  /** @hidden */
  _bottomGesture: ScaleGesture<X> | null;
  /** @hidden */
  _leftGesture: ScaleGesture<Y> | null;

  /** @hidden */
  _rescaleTransition: Transition<any> | null;

  constructor() {
    super();
    this.onScaleStart = this.onScaleStart.bind(this);
    this.onScaleChange = this.onScaleChange.bind(this);
    this.onScaleCancel = this.onScaleCancel.bind(this);
    this.onScaleEnd = this.onScaleEnd.bind(this);

    this._fitTopDomain = true;
    this._fitRightDomain = true;
    this._fitBottomDomain = true;
    this._fitLeftDomain = true;

    this._trackTopDomain = true;
    this._trackRightDomain = true;
    this._trackBottomDomain = true;
    this._trackLeftDomain = true;

    this._topDomainBounds = [true, true];
    this._rightDomainBounds = [true, true];
    this._bottomDomainBounds = [true, true];
    this._leftDomainBounds = [true, true];

    this._topDomainPadding = [null, null];
    this._rightDomainPadding = [null, null];
    this._bottomDomainPadding = [null, null];
    this._leftDomainPadding = [null, null];

    this._multitouch = null;
    this._topGesture = null;
    this._rightGesture = null;
    this._bottomGesture = null;
    this._leftGesture = null;

    this._rescaleTransition = null;

    this.topGutter.setState(Length.px(20));
    this.rightGutter.setState(Length.px(40));
    this.bottomGutter.setState(Length.px(20));
    this.leftGutter.setState(Length.px(40));

    this.domainColor.setState(Color.black());
    this.domainWidth.setState(1);
    this.domainSerif.setState(6);

    this.tickMarkColor.setState(Color.black());
    this.tickMarkWidth.setState(1);
    this.tickMarkLength.setState(6);

    this.tickLabelPadding.setState(2);

    this.gridLineColor.setState(Color.transparent());
    this.gridLineWidth.setState(0);

    this.setChildView("surface", new GraphicsView());
  }

  get viewController(): ChartViewController<X, Y> | null {
    return this._viewController;
  }

  @MemberAnimator(Length)
  topGutter: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  rightGutter: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  bottomGutter: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  leftGutter: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color)
  domainColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Number)
  domainWidth: MemberAnimator<this, number>;

  @MemberAnimator(Number)
  domainSerif: MemberAnimator<this, number>;

  @MemberAnimator(Color)
  tickMarkColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Number)
  tickMarkWidth: MemberAnimator<this, number>;

  @MemberAnimator(Number)
  tickMarkLength: MemberAnimator<this, number>;

  @MemberAnimator(Number)
  tickLabelPadding: MemberAnimator<this, number>;

  @MemberAnimator(Color)
  gridLineColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Number)
  gridLineWidth: MemberAnimator<this, number>;

  @MemberAnimator(Font, {inherit: true})
  font: MemberAnimator<this, Font, AnyFont>;

  @MemberAnimator(Color, {inherit: true})
  textColor: MemberAnimator<this, Color, AnyColor>;

  surface(): RenderedView | null;
  surface(surface: RenderedView | null): this;
  surface(surface?: RenderedView | null): RenderedView | null | this {
    if (surface === void 0) {
      const childView = this.getChildView("surface");
      return RenderedView.is(childView) ? childView : null;
    } else {
      this.setChildView("surface", surface);
      return this;
    }
  }

  topAxis(): AxisView<X> | null;
  topAxis(topAxis: AnyAxisView<X> | string | null): this;
  topAxis(topAxis?: AnyAxisView<X> | string | null): AxisView<X> | null | this {
    if (topAxis === void 0) {
      const childView = this.getChildView("topAxis");
      return childView instanceof AxisView ? childView : null;
    } else {
      if (typeof topAxis === "string") {
        topAxis = AxisView.top(topAxis);
      } else if (topAxis !== null) {
        topAxis = AxisView.fromAny(topAxis);
      }
      this.setChildView("topAxis", topAxis);
      return this;
    }
  }

  rightAxis(): AxisView<Y> | null;
  rightAxis(rightAxis: AnyAxisView<Y> | string | null): this;
  rightAxis(rightAxis?: AnyAxisView<Y> | string | null): AxisView<Y> | null | this {
    if (rightAxis === void 0) {
      const childView = this.getChildView("rightAxis");
      return childView instanceof AxisView ? childView : null;
    } else {
      if (typeof rightAxis === "string") {
        rightAxis = AxisView.right(rightAxis);
      } else if (rightAxis !== null) {
        rightAxis = AxisView.fromAny(rightAxis);
      }
      this.setChildView("rightAxis", rightAxis);
      return this;
    }
  }

  bottomAxis(): AxisView<X> | null;
  bottomAxis(bottomAxis: AnyAxisView<X> | string | null): this;
  bottomAxis(bottomAxis?: AnyAxisView<X> | string | null): AxisView<X> | null | this {
    if (bottomAxis === void 0) {
      const childView = this.getChildView("bottomAxis");
      return childView instanceof AxisView ? childView : null;
    } else {
      if (typeof bottomAxis === "string") {
        bottomAxis = AxisView.bottom(bottomAxis);
      } else if (bottomAxis !== null) {
        bottomAxis = AxisView.fromAny(bottomAxis);
      }
      this.setChildView("bottomAxis", bottomAxis);
      return this;
    }
  }

  leftAxis(): AxisView<Y> | null;
  leftAxis(leftAxis: AnyAxisView<Y> | string | null): this;
  leftAxis(leftAxis?: AnyAxisView<Y> | string | null): AxisView<Y> | null | this {
    if (leftAxis === void 0) {
      const childView = this.getChildView("leftAxis");
      return childView instanceof AxisView ? childView : null;
    } else {
      if (typeof leftAxis === "string") {
        leftAxis = AxisView.left(leftAxis);
      } else if (leftAxis !== null) {
        leftAxis = AxisView.fromAny(leftAxis);
      }
      this.setChildView("leftAxis", leftAxis);
      return this;
    }
  }

  addPlot(plot: AnyPlotView<X, Y>): void {
    plot = PlotView.fromAny(plot);
    this.appendChildView(plot);
  }

  multitouch(): Multitouch | null;
  multitouch(multitouch: Multitouch | boolean | null): this;
  multitouch(multitouch?: Multitouch | boolean | null): Multitouch | null | this {
    if (multitouch === void 0) {
      return this._multitouch;
    } else {
      if (multitouch === true) {
        multitouch = Multitouch.create();
      } else if (multitouch === false) {
        multitouch = null;
      }
      if (this._multitouch) {
        this._multitouch.surface(null);
      }
      this._multitouch = multitouch;
      if (this._multitouch) {
        this._multitouch.surface(this.surface());
      }
      return this;
    }
  }

  topGesture(): ScaleGesture<X> | null;
  topGesture(topGesture: ScaleGesture<X> | boolean | null): this;
  topGesture(topGesture?: ScaleGesture<X> | boolean | null): ScaleGesture<X> | null | this {
    if (topGesture === void 0) {
      return this._topGesture;
    } else {
      if (topGesture === true) {
        topGesture = ScaleGesture.horizontal();
      } else if (topGesture === false) {
        topGesture = null;
      }
      if (this._topGesture) {
        this._topGesture.multitouch(null).ruler(null).scale(null);
      }
      this._topGesture = topGesture;
      if (this._topGesture) {
        if (!this._multitouch) {
          this.multitouch(true);
        }
        this._topGesture.multitouch(this._multitouch)
                        .ruler(this.surface())
                        .scale(this.topAxis()!.scale.value!);
        if (this._multitouch && this.isMounted()) {
          this._topGesture.attach(this._multitouch);
        }
        this.reboundTop();
      }
      return this;
    }
  }

  rightGesture(): ScaleGesture<Y> | null;
  rightGesture(rightGesture: ScaleGesture<Y> | boolean | null): this;
  rightGesture(rightGesture?: ScaleGesture<Y> | boolean | null): ScaleGesture<Y> | null | this {
    if (rightGesture === void 0) {
      return this._rightGesture;
    } else {
      if (rightGesture === true) {
        rightGesture = ScaleGesture.vertical();
      } else if (rightGesture === false) {
        rightGesture = null;
      }
      if (this._rightGesture) {
        this._rightGesture.multitouch(null).ruler(null).scale(null);
      }
      this._rightGesture = rightGesture;
      if (this._rightGesture) {
        if (!this._multitouch) {
          this.multitouch(true);
        }
        this._rightGesture.multitouch(this._multitouch)
                          .ruler(this.surface())
                          .scale(this.rightAxis()!.scale.value!);
        if (this._multitouch && this.isMounted()) {
          this._rightGesture.attach(this._multitouch);
        }
        this.reboundRight();
      }
      return this;
    }
  }

  bottomGesture(): ScaleGesture<X> | null;
  bottomGesture(bottomGesture: ScaleGesture<X> | boolean | null): this;
  bottomGesture(bottomGesture?: ScaleGesture<X> | boolean | null): ScaleGesture<X> | null | this {
    if (bottomGesture === void 0) {
      return this._bottomGesture;
    } else {
      if (bottomGesture === true) {
        bottomGesture = ScaleGesture.horizontal();
      } else if (bottomGesture === false) {
        bottomGesture = null;
      }
      if (this._bottomGesture) {
        this._bottomGesture.multitouch(null).ruler(null).scale(null);
      }
      this._bottomGesture = bottomGesture;
      if (this._bottomGesture) {
        if (!this._multitouch) {
          this.multitouch(true);
        }
        this._bottomGesture.multitouch(this._multitouch)
                           .ruler(this.surface())
                           .scale(this.bottomAxis()!.scale.value!);
        if (this._multitouch && this.isMounted()) {
          this._bottomGesture.attach(this._multitouch);
        }
        this.reboundBottom();
      }
      return this;
    }
  }

  leftGesture(): ScaleGesture<Y> | null;
  leftGesture(leftGesture: ScaleGesture<Y> | boolean | null): this;
  leftGesture(leftGesture?: ScaleGesture<Y> | boolean | null): ScaleGesture<Y> | null | this {
    if (leftGesture === void 0) {
      return this._leftGesture;
    } else {
      if (leftGesture === true) {
        leftGesture = ScaleGesture.vertical();
      } else if (leftGesture === false) {
        leftGesture = null;
      }
      if (this._leftGesture) {
        this._leftGesture.multitouch(null).ruler(null).scale(null);
      }
      this._leftGesture = leftGesture;
      if (this._leftGesture) {
        if (!this._multitouch) {
          this.multitouch(true);
        }
        this._leftGesture.multitouch(this._multitouch)
                         .ruler(this.surface())
                         .scale(this.leftAxis()!.scale.value!);
        if (this._multitouch && this.isMounted()) {
          this._leftGesture.attach(this._multitouch);
        }
        this.reboundLeft();
      }
      return this;
    }
  }

  rescaleTransition(): Transition<any> | null;
  rescaleTransition(rescaleTransition: AnyTransition<any> | null): this;
  rescaleTransition(rescaleTransition?: AnyTransition<any> | null): Transition<any> | null | this {
    if (rescaleTransition === void 0) {
      return this._rescaleTransition;
    } else {
      rescaleTransition = rescaleTransition !== null ? Transition.fromAny(rescaleTransition) : null;
      this._rescaleTransition = rescaleTransition;
      return this;
    }
  }

  fitTopDomain(): boolean;
  fitTopDomain(fitTopDomain: boolean): this;
  fitTopDomain(fitTopDomain?: boolean): boolean | this {
    if (fitTopDomain === void 0) {
      return this._fitTopDomain;
    } else {
      if (!this._fitTopDomain && fitTopDomain) {
        this.requireUpdate(View.NeedsLayout);
      }
      this._fitTopDomain = fitTopDomain;
      return this;
    }
  }

  fitRightDomain(): boolean;
  fitRightDomain(fitRightDomain: boolean): this;
  fitRightDomain(fitRightDomain?: boolean): boolean | this {
    if (fitRightDomain === void 0) {
      return this._fitRightDomain;
    } else {
      if (!this._fitRightDomain && fitRightDomain) {
        this.requireUpdate(View.NeedsLayout);
      }
      this._fitRightDomain = fitRightDomain;
      return this;
    }
  }

  fitBottomDomain(): boolean;
  fitBottomDomain(fitBottomDomain: boolean): this;
  fitBottomDomain(fitBottomDomain?: boolean): boolean | this {
    if (fitBottomDomain === void 0) {
      return this._fitBottomDomain;
    } else {
      if (!this._fitBottomDomain && fitBottomDomain) {
        this.requireUpdate(View.NeedsLayout);
      }
      this._fitBottomDomain = fitBottomDomain;
      return this;
    }
  }

  fitLeftDomain(): boolean;
  fitLeftDomain(fitLeftDomain: boolean): this;
  fitLeftDomain(fitLeftDomain?: boolean): boolean | this {
    if (fitLeftDomain === void 0) {
      return this._fitLeftDomain;
    } else {
      if (!this._fitLeftDomain && fitLeftDomain) {
        this.requireUpdate(View.NeedsLayout);
      }
      this._fitLeftDomain = fitLeftDomain;
      return this;
    }
  }

  topDomainBounds(): ChartDomainBounds<X>;
  topDomainBounds(topDomainBounds: Readonly<ChartDomainBounds<X>>): this;
  topDomainBounds(topDomainBounds?: Readonly<ChartDomainBounds<X>>): ChartDomainBounds<X> | this {
    if (topDomainBounds === void 0) {
      return this._topDomainBounds;
    } else {
      this._topDomainBounds[0] = topDomainBounds[0];
      this._topDomainBounds[1] = topDomainBounds[1];
      this.reboundTop();
      return this;
    }
  }

  rightDomainBounds(): ChartDomainBounds<Y>;
  rightDomainBounds(rightDomainBounds: Readonly<ChartDomainBounds<Y>>): this;
  rightDomainBounds(rightDomainBounds?: Readonly<ChartDomainBounds<Y>>): ChartDomainBounds<Y> | this {
    if (rightDomainBounds === void 0) {
      return this._rightDomainBounds;
    } else {
      this._rightDomainBounds[0] = rightDomainBounds[0];
      this._rightDomainBounds[1] = rightDomainBounds[1];
      this.reboundRight();
      return this;
    }
  }

  bottomDomainBounds(): ChartDomainBounds<X>;
  bottomDomainBounds(bottomDomainBounds: Readonly<ChartDomainBounds<X>>): this;
  bottomDomainBounds(bottomDomainBounds?: Readonly<ChartDomainBounds<X>>): ChartDomainBounds<X> | this {
    if (bottomDomainBounds === void 0) {
      return this._bottomDomainBounds;
    } else {
      this._bottomDomainBounds[0] = bottomDomainBounds[0];
      this._bottomDomainBounds[1] = bottomDomainBounds[1];
      this.reboundBottom();
      return this;
    }
  }

  leftDomainBounds(): ChartDomainBounds<Y>;
  leftDomainBounds(leftDomainBounds: Readonly<ChartDomainBounds<Y>>): this;
  leftDomainBounds(leftDomainBounds?: Readonly<ChartDomainBounds<Y>>): ChartDomainBounds<Y> | this {
    if (leftDomainBounds === void 0) {
      return this._leftDomainBounds;
    } else {
      this._leftDomainBounds[0] = leftDomainBounds[0];
      this._leftDomainBounds[1] = leftDomainBounds[1];
      this.reboundLeft();
      return this;
    }
  }

  topDomainPadding(): ChartDomainPadding<X>;
  topDomainPadding(topDomainPadding: Readonly<ChartDomainPadding<X>>): this;
  topDomainPadding(topDomainPadding?: Readonly<ChartDomainPadding<X>>): ChartDomainPadding<X> | this {
    if (topDomainPadding === void 0) {
      return this._topDomainPadding;
    } else {
      this._topDomainPadding[0] = topDomainPadding[0];
      this._topDomainPadding[1] = topDomainPadding[1];
      this.requireUpdate(View.NeedsLayout);
      return this;
    }
  }

  rightDomainPadding(): ChartDomainPadding<Y>;
  rightDomainPadding(rightDomainPadding: Readonly<ChartDomainPadding<Y>>): this;
  rightDomainPadding(rightDomainPadding?: Readonly<ChartDomainPadding<Y>>): ChartDomainPadding<Y> | this {
    if (rightDomainPadding === void 0) {
      return this._rightDomainPadding;
    } else {
      this._rightDomainPadding[0] = rightDomainPadding[0];
      this._rightDomainPadding[1] = rightDomainPadding[1];
      this.requireUpdate(View.NeedsLayout);
      return this;
    }
  }

  bottomDomainPadding(): ChartDomainPadding<X>;
  bottomDomainPadding(bottomDomainPadding: Readonly<ChartDomainPadding<X>>): this;
  bottomDomainPadding(bottomDomainPadding?: Readonly<ChartDomainPadding<X>>): ChartDomainPadding<X> | this {
    if (bottomDomainPadding === void 0) {
      return this._bottomDomainPadding;
    } else {
      this._bottomDomainPadding[0] = bottomDomainPadding[0];
      this._bottomDomainPadding[1] = bottomDomainPadding[1];
      this.requireUpdate(View.NeedsLayout);
      return this;
    }
  }

  leftDomainPadding(): ChartDomainPadding<Y>;
  leftDomainPadding(leftDomainPadding: Readonly<ChartDomainPadding<Y>>): this;
  leftDomainPadding(leftDomainPadding?: Readonly<ChartDomainPadding<Y>>): ChartDomainPadding<Y> | this {
    if (leftDomainPadding === void 0) {
      return this._leftDomainPadding;
    } else {
      this._leftDomainPadding[0] = leftDomainPadding[0];
      this._leftDomainPadding[1] = leftDomainPadding[1];
      this.requireUpdate(View.NeedsLayout);
      return this;
    }
  }

  topDomain(): Readonly<[X | null, X | null]> {
    const topDomain: [X | null, X | null] = [null, null];
    const topAxis = this.topAxis();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof PlotView && childView.xAxis() === topAxis) {
        const xDomain = childView.xDomain();
        if (topDomain[0] === null || xDomain[0] !== null && Objects.compare(topDomain[0], xDomain[0]) > 0) {
          topDomain[0] = xDomain[0];
        }
        if (topDomain[1] === null || xDomain[1] !== null && Objects.compare(topDomain[1], xDomain[1]) < 0) {
          topDomain[1] = xDomain[1];
        }
      }
    }
    return topDomain;
  }

  rightDomain(): Readonly<[Y | null, Y | null]> {
    const rightDomain: [Y | null, Y | null] = [null, null];
    const rightAxis = this.rightAxis();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof PlotView && childView.yAxis() === rightAxis) {
        const yDomain = childView.yDomain();
        if (rightDomain[0] === null || yDomain[0] !== null && Objects.compare(rightDomain[0], yDomain[0]) > 0) {
          rightDomain[0] = yDomain[0];
        }
        if (rightDomain[1] === null || yDomain[1] !== null && Objects.compare(rightDomain[1], yDomain[1]) < 0) {
          rightDomain[1] = yDomain[1];
        }
      }
    }
    return rightDomain;
  }

  bottomDomain(): Readonly<[X | null, X | null]> {
    const bottomDomain: [X | null, X | null] = [null, null];
    const bottomAxis = this.bottomAxis();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof PlotView && childView.xAxis() === bottomAxis) {
        const xDomain = childView.xDomain();
        if (bottomDomain[0] === null || xDomain[0] !== null && Objects.compare(bottomDomain[0], xDomain[0]) > 0) {
          bottomDomain[0] = xDomain[0];
        }
        if (bottomDomain[1] === null || xDomain[1] !== null && Objects.compare(bottomDomain[1], xDomain[1]) < 0) {
          bottomDomain[1] = xDomain[1];
        }
      }
    }
    return bottomDomain;
  }

  leftDomain(): Readonly<[Y | null, Y | null]> {
    const leftDomain: [Y | null, Y | null] = [null, null];
    const leftAxis = this.leftAxis();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof PlotView && childView.yAxis() === leftAxis) {
        const yDomain = childView.yDomain();
        if (leftDomain[0] === null || yDomain[0] !== null && Objects.compare(leftDomain[0], yDomain[0]) > 0) {
          leftDomain[0] = yDomain[0];
        }
        if (leftDomain[1] === null || yDomain[1] !== null && Objects.compare(leftDomain[1], yDomain[1]) < 0) {
          leftDomain[1] = yDomain[1];
        }
      }
    }
    return leftDomain;
  }

  topDomainPadded(): Readonly<[X | null, X | null]> {
    let [xMin, xMax] = this.topDomain();
    const [padMin, padMax] = this._topDomainPadding;
    if (xMin !== null && padMin !== null) {
      xMin = (+xMin - +padMin) as unknown as X;
    }
    if (xMax !== null && padMax !== null) {
      xMax = (+xMax + +padMax) as unknown as X;
    }
    return [xMin, xMax];
  }

  rightDomainPadded(): Readonly<[Y | null, Y | null]> {
    let [yMin, yMax] = this.rightDomain();
    const [padMin, padMax] = this._topDomainPadding;
    if (yMin !== null && padMin !== null) {
      yMin = (+yMin - +padMin) as unknown as Y;
    }
    if (yMax !== null && padMax !== null) {
      yMax = (+yMax + +padMax) as unknown as Y;
    }
    return [yMin, yMax];
  }

  bottomDomainPadded(): Readonly<[X | null, X | null]> {
    let [xMin, xMax] = this.bottomDomain();
    const [padMin, padMax] = this._bottomDomainPadding;
    if (xMin !== null && padMin !== null) {
      xMin = (+xMin - +padMin) as unknown as X;
    }
    if (xMax !== null && padMax !== null) {
      xMax = (+xMax + +padMax) as unknown as X;
    }
    return [xMin, xMax];
  }

  leftDomainPadded(): Readonly<[Y | null, Y | null]> {
    let [yMin, yMax] = this.leftDomain();
    const [padMin, padMax] = this._leftDomainPadding;
    if (yMin !== null && padMin !== null) {
      yMin = (+yMin - +padMin) as unknown as Y;
    }
    if (yMax !== null && padMax !== null) {
      yMax = (+yMax + +padMax) as unknown as Y;
    }
    return [yMin, yMax];
  }

  topRange(): Readonly<[number, number]> {
    const topRange: [number, number] = [Infinity, -Infinity];
    const topAxis = this.topAxis();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof PlotView && childView.xAxis() === topAxis) {
        const xRange = childView.xRange();
        topRange[0] = Math.min(topRange[0], xRange[0]);
        topRange[1] = Math.max(topRange[1], xRange[1]);
      }
    }
    return topRange;
  }

  rightRange(): Readonly<[number, number]> {
    const rightRange: [number, number] = [Infinity, -Infinity];
    const rightAxis = this.rightAxis();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof PlotView && childView.yAxis() === rightAxis) {
        const yRange = childView.yRange();
        rightRange[0] = Math.min(rightRange[0], yRange[0]);
        rightRange[1] = Math.max(rightRange[1], yRange[1]);
      }
    }
    return rightRange;
  }

  bottomRange(): Readonly<[number, number]> {
    const bottomRange: [number, number] = [Infinity, -Infinity];
    const bottomAxis = this.bottomAxis();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof PlotView && childView.xAxis() === bottomAxis) {
        const xRange = childView.xRange();
        bottomRange[0] = Math.min(bottomRange[0], xRange[0]);
        bottomRange[1] = Math.max(bottomRange[1], xRange[1]);
      }
    }
    return bottomRange;
  }

  leftRange(): Readonly<[number, number]> {
    const leftRange: [number, number] = [Infinity, -Infinity];
    const leftAxis = this.leftAxis();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof PlotView && childView.yAxis() === leftAxis) {
        const yRange = childView.yRange();
        leftRange[0] = Math.min(leftRange[0], yRange[0]);
        leftRange[1] = Math.max(leftRange[1], yRange[1]);
      }
    }
    return leftRange;
  }

  protected onMount(): void {
    if (this._multitouch) {
      this._multitouch.attach(this);
      if (this._topGesture) {
        this._topGesture.attach(this._multitouch);
      }
      if (this._rightGesture) {
        this._rightGesture.attach(this._multitouch);
      }
      if (this._bottomGesture) {
        this._bottomGesture.attach(this._multitouch);
      }
      if (this._leftGesture) {
        this._leftGesture.attach(this._multitouch);
      }
    }
    this.on("scalestart", this.onScaleStart);
    this.on("scalechange", this.onScaleChange);
    this.on("scalecancel", this.onScaleCancel);
    this.on("scaleend", this.onScaleEnd);
  }

  protected onUnmount(): void {
    this.off("scalestart", this.onScaleStart);
    this.off("scalechange", this.onScaleChange);
    this.off("scalecancel", this.onScaleCancel);
    this.off("scaleend", this.onScaleEnd);
    if (this._multitouch) {
      if (this._topGesture) {
        this._topGesture.detach(this._multitouch);
      }
      if (this._rightGesture) {
        this._rightGesture.detach(this._multitouch);
      }
      if (this._bottomGesture) {
        this._bottomGesture.detach(this._multitouch);
      }
      if (this._leftGesture) {
        this._leftGesture.detach(this._multitouch);
      }
      this._multitouch.detach(this);
    }
  }

  needsUpdate(updateFlags: number, viewContext: RenderedViewContext): number {
    if ((updateFlags & (View.NeedsAnimate | View.NeedsLayout)) !== 0) {
      updateFlags = updateFlags | View.NeedsAnimate | View.NeedsLayout | View.NeedsRender;
    }
    return updateFlags;
  }

  protected didUpdate(viewContext: RenderedViewContext): void {
    super.didUpdate(viewContext);
    this.autoscale();
    this.rebound();
  }

  protected onAnimate(viewContext: RenderedViewContext): void {
    const t = viewContext.updateTime;
    this.topGutter.onFrame(t);
    this.rightGutter.onFrame(t);
    this.bottomGutter.onFrame(t);
    this.leftGutter.onFrame(t);

    this.domainColor.onFrame(t);
    this.domainWidth.onFrame(t);
    this.domainSerif.onFrame(t);

    this.tickMarkColor.onFrame(t);
    this.tickMarkWidth.onFrame(t);
    this.tickMarkLength.onFrame(t);

    this.tickLabelPadding.onFrame(t);

    this.gridLineColor.onFrame(t);
    this.gridLineWidth.onFrame(t);

    this.font.onFrame(t);
    this.textColor.onFrame(t);
  }

  protected onLayout(viewContext: RenderedViewContext): void {
    if (this._topGesture) {
      this._topGesture.scale(this.topAxis()!.scale.value!);
    }
    if (this._rightGesture) {
      this._rightGesture.scale(this.rightAxis()!.scale.value!);
    }
    if (this._bottomGesture) {
      this._bottomGesture.scale(this.bottomAxis()!.scale.value!);
    }
    if (this._leftGesture) {
      this._leftGesture.scale(this.leftAxis()!.scale.value!);
    }
    this.layoutChildViews(viewContext);
  }

  protected layoutChildView(childView: View, viewContext: RenderedViewContext): void {
    const childKey = childView.key();
    if (childKey === "surface" && RenderedView.is(childView)) {
      this.layoutSurface(childView, this._bounds);
    } else if (childView instanceof AxisView) {
      if (childKey === "topAxis") {
        this.layoutTopAxis(childView, this._bounds);
      } else if (childKey === "rightAxis") {
        this.layoutRightAxis(childView, this._bounds);
      } else if (childKey === "bottomAxis") {
        this.layoutBottomAxis(childView, this._bounds);
      } else if (childKey === "leftAxis") {
        this.layoutLeftAxis(childView, this._bounds);
      }
    } else if (childView instanceof PlotView) {
      this.layoutPlot(childView, this._bounds);
    } else {
      super.layoutChildView(childView, viewContext);
    }
  }

  protected layoutSurface(surface: RenderedView, bounds: BoxR2): void {
    const topGutter = this.topGutter.value!.pxValue(bounds.height);
    const rightGutter = this.rightGutter.value!.pxValue(bounds.width);
    const bottomGutter = this.bottomGutter.value!.pxValue(bounds.height);
    const leftGutter = this.leftGutter.value!.pxValue(bounds.width);
    const xMin = bounds.xMin + leftGutter;
    const yMin = bounds.yMin + topGutter;
    const xMax = bounds.xMax - rightGutter;
    const yMax = bounds.yMax - bottomGutter;
    const xMid = (xMin + xMax) / 2;
    const yMid = (yMin + yMax) / 2;
    surface.setBounds(new BoxR2(xMin, yMin, xMax, yMax));
    surface.setAnchor(new PointR2(xMid, yMid));
  }

  protected layoutAxes(bounds: BoxR2): void {
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof AxisView) {
        const childKey = childView.key();
        if (childKey === "topAxis") {
          this.layoutTopAxis(childView, bounds);
        } else if (childKey === "rightAxis") {
          this.layoutRightAxis(childView, bounds);
        } else if (childKey === "bottomAxis") {
          this.layoutBottomAxis(childView, bounds);
        } else if (childKey === "leftAxis") {
          this.layoutLeftAxis(childView, bounds);
        }
      }
    }
  }

  protected layoutTopAxis(axis: AxisView<X>, bounds: BoxR2): void {
    const topGutter = this.topGutter.value!.pxValue(bounds.height);
    const rightGutter = this.rightGutter.value!.pxValue(bounds.width);
    const bottomGutter = this.bottomGutter.value!.pxValue(bounds.height);
    const leftGutter = this.leftGutter.value!.pxValue(bounds.width);
    const anchorX = bounds.xMin + leftGutter;
    const anchorY = bounds.yMin + topGutter;
    const xMin = anchorX;
    const yMin = bounds.yMin;
    const xMax = bounds.xMax - rightGutter;
    const yMax = bounds.yMax - bottomGutter;
    axis.setBounds(new BoxR2(xMin, yMin, xMax, yMax));
    axis.setAnchor(new PointR2(anchorX, anchorY));
    axis.range(0, xMax - xMin);
  }

  protected layoutRightAxis(axis: AxisView<Y>, bounds: BoxR2): void {
    const topGutter = this.topGutter.value!.pxValue(bounds.height);
    const rightGutter = this.rightGutter.value!.pxValue(bounds.width);
    const bottomGutter = this.bottomGutter.value!.pxValue(bounds.height);
    const leftGutter = this.leftGutter.value!.pxValue(bounds.width);
    const anchorX = Math.max(bounds.xMin + leftGutter, bounds.xMax - rightGutter);
    const anchorY = bounds.yMin + topGutter;
    const xMin = bounds.xMin + leftGutter;
    const yMin = anchorY;
    const xMax = bounds.xMax;
    const yMax = bounds.yMax - bottomGutter;
    axis.setBounds(new BoxR2(xMin, yMin, xMax, yMax));
    axis.setAnchor(new PointR2(anchorX, anchorY));
    axis.range(yMax - yMin, 0);
  }

  protected layoutBottomAxis(axis: AxisView<X>, bounds: BoxR2): void {
    const topGutter = this.topGutter.value!.pxValue(bounds.height);
    const rightGutter = this.rightGutter.value!.pxValue(bounds.width);
    const bottomGutter = this.bottomGutter.value!.pxValue(bounds.height);
    const leftGutter = this.leftGutter.value!.pxValue(bounds.width);
    const anchorX = bounds.xMin + leftGutter;
    const anchorY = Math.max(bounds.yMin + topGutter, bounds.yMax - bottomGutter);
    const xMin = anchorX;
    const yMin = bounds.yMin + topGutter;
    const xMax = bounds.xMax - rightGutter;
    const yMax = bounds.yMax;
    axis.setBounds(new BoxR2(xMin, yMin, xMax, yMax));
    axis.setAnchor(new PointR2(anchorX, anchorY));
    axis.range(0, xMax - xMin);
  }

  protected layoutLeftAxis(axis: AxisView<Y>, bounds: BoxR2): void {
    const topGutter = this.topGutter.value!.pxValue(bounds.height);
    const rightGutter = this.rightGutter.value!.pxValue(bounds.width);
    const bottomGutter = this.bottomGutter.value!.pxValue(bounds.height);
    const leftGutter = this.leftGutter.value!.pxValue(bounds.width);
    const anchorX = bounds.xMin + leftGutter;
    const anchorY = bounds.yMin + topGutter;
    const xMin = bounds.xMin;
    const yMin = anchorY;
    const xMax = bounds.xMax - rightGutter;
    const yMax = bounds.yMax - bottomGutter;
    axis.setBounds(new BoxR2(xMin, yMin, xMax, yMax));
    axis.setAnchor(new PointR2(anchorX, anchorY));
    axis.range(yMax - yMin, 0);
  }

  protected layoutPlot(plot: PlotView<X, Y>, bounds: BoxR2): void {
    const topGutter = this.topGutter.value!.pxValue(bounds.height);
    const rightGutter = this.rightGutter.value!.pxValue(bounds.width);
    const bottomGutter = this.bottomGutter.value!.pxValue(bounds.height);
    const leftGutter = this.leftGutter.value!.pxValue(bounds.width);
    const xMin = bounds.xMin + leftGutter;
    const yMin = bounds.yMin + topGutter;
    const xMax = bounds.xMax - rightGutter;
    const yMax = bounds.yMax - bottomGutter;
    const anchorX = xMin;
    const anchorY = yMin;
    plot.setBounds(new BoxR2(xMin, yMin, xMax, yMax));
    plot.setAnchor(new PointR2(anchorX, anchorY));
  }

  protected onInsertPlot(plot: PlotView<X, Y>): void {
    if (!plot.xAxis() || !plot.yAxis()) {
      const childViews = this._childViews;
      for (let i = 0, n = childViews.length; i < n; i += 1) {
        const childView = childViews[i];
        if (childView instanceof AxisView) {
          const childKey = childView.key();
          if (childKey === "topAxis" && !plot.xAxis()) {
            plot.xAxis(childView);
          } else if (childKey === "rightAxis" && !plot.yAxis()) {
            plot.yAxis(childView);
          } else if (childKey === "bottomAxis" && !plot.xAxis()) {
            plot.xAxis(childView);
          } else if (childKey === "leftAxis" && !plot.yAxis()) {
            plot.yAxis(childView);
          }
        }
      }
    }
  }

  protected onRemovePlot(plot: PlotView<X, Y>): void {
    // stub
  }

  protected onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    const childKey = childView.key();
    if (childKey === "surface" && RenderedView.is(childView)) {
      this.layoutSurface(childView, this._bounds);
      return;
    } else if (childView instanceof AxisView) {
      if (childKey === "topAxis") {
        this.layoutTopAxis(childView, this._bounds);
        return;
      } else if (childKey === "rightAxis") {
        this.layoutRightAxis(childView, this._bounds);
        return;
      } else if (childKey === "bottomAxis") {
        this.layoutBottomAxis(childView, this._bounds);
        return;
      } else if (childKey === "leftAxis") {
        this.layoutLeftAxis(childView, this._bounds);
        return;
      }
    } else if (childView instanceof PlotView) {
      this.onInsertPlot(childView);
      this.layoutPlot(childView, this._bounds);
    }
  }

  protected onRemoveChildView(childView: View): void {
    if (childView instanceof PlotView) {
      this.onRemovePlot(childView);
    }
  }

  autoscale(tween?: Tween<any>): void {
    if (tween === void 0) {
      tween = this._rescaleTransition || void 0;
    }
    this.autoscaleTop(tween);
    this.autoscaleRight(tween);
    this.autoscaleBottom(tween);
    this.autoscaleLeft(tween);
  }

  autoscaleTop(tween?: Tween<any>): void {
    if (this._fitTopDomain && this._trackTopDomain) {
      const topAxis = this.topAxis();
      if (topAxis) {
        if (tween === void 0) {
          tween = this._rescaleTransition || void 0;
        }
        const [xMin, xMax] = this.topDomainPadded();
        if (xMin !== null && xMax !== null) {
          topAxis.domain(xMin, xMax, tween);
        }
      }
    }
  }

  autoscaleRight(tween?: Tween<any>): void {
    if (this._fitRightDomain && this._trackRightDomain) {
      const rightAxis = this.rightAxis();
      if (rightAxis) {
        if (tween === void 0) {
          tween = this._rescaleTransition || void 0;
        }
        const [yMin, yMax] = this.rightDomainPadded();
        if (yMin !== null && yMax !== null) {
          rightAxis.domain(yMin, yMax, tween);
        }
      }
    }
  }

  autoscaleBottom(tween?: Tween<any>): void {
    if (this._fitBottomDomain && this._trackBottomDomain) {
      const bottomAxis = this.bottomAxis();
      if (bottomAxis) {
        if (tween === void 0) {
          tween = this._rescaleTransition || void 0;
        }
        const [xMin, xMax] = this.bottomDomainPadded();
        if (xMin !== null && xMax !== null) {
          bottomAxis.domain(xMin, xMax, tween);
        }
      }
    }
  }

  autoscaleLeft(tween?: Tween<any>): void {
    if (this._fitLeftDomain && this._trackLeftDomain) {
      const leftAxis = this.leftAxis();
      if (leftAxis) {
        if (tween === void 0) {
          tween = this._rescaleTransition || void 0;
        }
        const [yMin, yMax] = this.leftDomainPadded();
        if (yMin !== null && yMax !== null) {
          leftAxis.domain(yMin, yMax, tween);
        }
      }
    }
  }

  rebound(): void {
    this.reboundTop();
    this.reboundRight();
    this.reboundBottom();
    this.reboundLeft();
  }

  reboundTop(): void {
    const topGesture = this._topGesture;
    if (topGesture) {
      let [xMin, xMax] = this.topDomainPadded();
      if (xMin !== null && xMax !== null) {
        const [boundMin, boundMax] = this._topDomainBounds;
        if (typeof boundMin !== "boolean") {
          xMin = (+xMin - +boundMin) as unknown as X;
        }
        if (typeof boundMax !== "boolean") {
          xMax = (+xMax + +boundMax) as unknown as X;
        }
        topGesture.domainBounds(typeof boundMin !== "boolean" || boundMin ? xMin : null,
                                typeof boundMax !== "boolean" || boundMax ? xMax : null);
      }
    }
  }

  reboundRight(): void {
    const rightGesture = this._rightGesture;
    if (rightGesture) {
      let [yMin, yMax] = this.rightDomainPadded();
      if (yMin !== null && yMax !== null) {
        const [boundMin, boundMax] = this._rightDomainBounds;
        if (typeof boundMin !== "boolean") {
          yMin = (+yMin - +boundMin) as unknown as Y;
        }
        if (typeof boundMax !== "boolean") {
          yMax = (+yMax + +boundMax) as unknown as Y;
        }
        rightGesture.domainBounds(typeof boundMin !== "boolean" || boundMin ? yMin : null,
                                  typeof boundMax !== "boolean" || boundMax ? yMax : null);
      }
    }
  }

  reboundBottom(): void {
    const bottomGesture = this._bottomGesture;
    if (bottomGesture) {
      let [xMin, xMax] = this.bottomDomainPadded();
      if (xMin !== null && xMax !== null) {
        const [boundMin, boundMax] = this._bottomDomainBounds;
        if (typeof boundMin !== "boolean") {
          xMin = (+xMin - +boundMin) as unknown as X;
        }
        if (typeof boundMax !== "boolean") {
          xMax = (+xMax + +boundMax) as unknown as X;
        }
        bottomGesture.domainBounds(typeof boundMin !== "boolean" || boundMin ? xMin : null,
                                   typeof boundMax !== "boolean" || boundMax ? xMax : null);
      }
    }
  }

  reboundLeft(): void {
    const leftGesture = this._leftGesture;
    if (leftGesture) {
      let [yMin, yMax] = this.leftDomainPadded();
      if (yMin !== null && yMax !== null) {
        const [boundMin, boundMax] = this._leftDomainBounds;
        if (typeof boundMin !== "boolean") {
          yMin = (+yMin - +boundMin) as unknown as Y;
        }
        if (typeof boundMax !== "boolean") {
          yMax = (+yMax + +boundMax) as unknown as Y;
        }
        leftGesture.domainBounds(typeof boundMin !== "boolean" || boundMin ? yMin : null,
                                 typeof boundMax !== "boolean" || boundMax ? yMax : null);
      }
    }
  }

  protected retrackTop(): void {
    const topGesture = this._topGesture;
    if (topGesture) {
      const [xMin, xMax] = topGesture.scale()!.domain();
      const boundMin = topGesture.domainMin();
      const boundMax = topGesture.domainMax();
      if (xMin !== null && xMax !== null && boundMin != null && boundMax !== null) {
        const order = Objects.compare(xMin, xMax);
        if (order < 0 && Objects.compare(xMin, boundMin) <= 0 && Objects.compare(xMax, boundMax) >= 0
            || order > 0 && Objects.compare(xMax, boundMin) <= 0 && Objects.compare(xMin, boundMax) >= 0) {
          this._trackTopDomain = true;
        }
      }
    }
  }

  protected retrackRight(): void {
    const rightGesture = this._rightGesture;
    if (rightGesture) {
      const [yMin, yMax] = rightGesture.scale()!.domain();
      const boundMin = rightGesture.domainMin();
      const boundMax = rightGesture.domainMax();
      if (yMin !== null && yMax !== null && boundMin != null && boundMax !== null) {
        const order = Objects.compare(yMin, yMax);
        if (order < 0 && Objects.compare(yMin, boundMin) <= 0 && Objects.compare(yMax, boundMax) >= 0
            || order > 0 && Objects.compare(yMax, boundMin) <= 0 && Objects.compare(yMin, boundMax) >= 0) {
          this._trackRightDomain = true;
        }
      }
    }
  }

  protected retrackBottom(): void {
    const bottomGesture = this._bottomGesture;
    if (bottomGesture) {
      const [xMin, xMax] = bottomGesture.scale()!.domain();
      const boundMin = bottomGesture.domainMin();
      const boundMax = bottomGesture.domainMax();
      if (xMin !== null && xMax !== null && boundMin != null && boundMax !== null) {
        const order = Objects.compare(xMin, xMax);
        if (order < 0 && Objects.compare(xMin, boundMin) <= 0 && Objects.compare(xMax, boundMax) >= 0
            || order > 0 && Objects.compare(xMax, boundMin) <= 0 && Objects.compare(xMin, boundMax) >= 0) {
          this._trackBottomDomain = true;
        }
      }
    }
  }

  protected retrackLeft(): void {
    const leftGesture = this._leftGesture;
    if (leftGesture) {
      const [yMin, yMax] = leftGesture.scale()!.domain();
      const boundMin = leftGesture.domainMin();
      const boundMax = leftGesture.domainMax();
      if (yMin !== null && yMax !== null && boundMin != null && boundMax !== null) {
        const order = Objects.compare(yMin, yMax);
        if (order < 0 && Objects.compare(yMin, boundMin) <= 0 && Objects.compare(yMax, boundMax) >= 0
            || order > 0 && Objects.compare(yMax, boundMin) <= 0 && Objects.compare(yMin, boundMax) >= 0) {
          this._trackLeftDomain = true;
        }
      }
    }
  }

  protected onScaleStart(event: ScaleGestureEvent<unknown>): void {
    if (event.gesture === this._topGesture) {
      const topAxis = this.topAxis();
      if (topAxis) {
        topAxis.domain(event.scale.domain() as X[]);
        this.requireUpdate(View.NeedsLayout);
      }
      this._trackTopDomain = false;
    } else if (event.gesture === this._rightGesture) {
      const rightAxis = this.rightAxis();
      if (rightAxis) {
        rightAxis.domain(event.scale.domain() as Y[]);
        this.requireUpdate(View.NeedsLayout);
      }
      this._trackRightDomain = false;
    } else if (event.gesture === this._bottomGesture) {
      const bottomAxis = this.bottomAxis();
      if (bottomAxis) {
        bottomAxis.domain(event.scale.domain() as X[]);
        this.requireUpdate(View.NeedsLayout);
      }
      this._trackBottomDomain = false;
    } else if (event.gesture === this._leftGesture) {
      const leftAxis = this.leftAxis();
      if (leftAxis) {
        leftAxis.domain(event.scale.domain() as Y[]);
        this.requireUpdate(View.NeedsLayout);
      }
      this._trackLeftDomain = false;
    }
  }

  protected onScaleChange(event: ScaleGestureEvent<unknown>): void {
    if (event.gesture === this._topGesture) {
      const topAxis = this.topAxis();
      if (topAxis) {
        topAxis.domain(event.scale.domain() as X[]);
        this.requireUpdate(View.NeedsLayout);
      }
    } else if (event.gesture === this._rightGesture) {
      const rightAxis = this.rightAxis();
      if (rightAxis) {
        rightAxis.domain(event.scale.domain() as Y[]);
        this.requireUpdate(View.NeedsLayout);
      }
    } else if (event.gesture === this._bottomGesture) {
      const bottomAxis = this.bottomAxis();
      if (bottomAxis) {
        bottomAxis.domain(event.scale.domain() as X[]);
        this.requireUpdate(View.NeedsLayout);
      }
    } else if (event.gesture === this._leftGesture) {
      const leftAxis = this.leftAxis();
      if (leftAxis) {
        leftAxis.domain(event.scale.domain() as Y[]);
        this.requireUpdate(View.NeedsLayout);
      }
    }
  }

  protected onScaleCancel(event: ScaleGestureEvent<unknown>): void {
    this.onScaleEnd(event);
  }

  protected onScaleEnd(event: ScaleGestureEvent<unknown>): void {
    if (event.gesture === this._topGesture) {
      const topAxis = this.topAxis();
      if (topAxis) {
        topAxis.domain(event.scale.domain() as X[]);
        this.requireUpdate(View.NeedsLayout);
      }
      this.retrackTop();
    } else if (event.gesture === this._rightGesture) {
      const rightAxis = this.rightAxis();
      if (rightAxis) {
        rightAxis.domain(event.scale.domain() as Y[]);
        this.requireUpdate(View.NeedsLayout);
      }
      this.retrackRight();
    } else if (event.gesture === this._bottomGesture) {
      const bottomAxis = this.bottomAxis();
      if (bottomAxis) {
        bottomAxis.domain(event.scale.domain() as X[]);
        this.requireUpdate(View.NeedsLayout);
      }
      this.retrackBottom();
    } else if (event.gesture === this._leftGesture) {
      const leftAxis = this.leftAxis();
      if (leftAxis) {
        leftAxis.domain(event.scale.domain() as Y[]);
        this.requireUpdate(View.NeedsLayout);
      }
      this.retrackLeft();
    }
  }

  static fromAny<X = any, Y = any>(chart: AnyChartView<X, Y>): ChartView<X, Y> {
    if (chart instanceof ChartView) {
      return chart;
    } else if (typeof chart === "object" && chart) {
      const view = new ChartView();
      if (chart.key !== void 0) {
        view.key(chart.key);
      }

      if (chart.bottomAxis !== void 0) {
        view.bottomAxis(chart.bottomAxis);
      }
      if (chart.leftAxis !== void 0) {
        view.leftAxis(chart.leftAxis);
      }
      if (chart.topAxis !== void 0) {
        view.topAxis(chart.topAxis);
      }
      if (chart.rightAxis !== void 0) {
        view.rightAxis(chart.rightAxis);
      }

      const plots = chart.plots;
      if (plots) {
        for (let i = 0, n = plots.length; i < n; i += 1) {
          view.addPlot(plots[i]);
        }
      }

      if (chart.fitTopDomain !== void 0) {
        view.fitTopDomain(chart.fitTopDomain);
      }
      if (chart.fitRightDomain !== void 0) {
        view.fitRightDomain(chart.fitRightDomain);
      }
      if (chart.fitBottomDomain !== void 0) {
        view.fitBottomDomain(chart.fitBottomDomain);
      }
      if (chart.fitLeftDomain !== void 0) {
        view.fitLeftDomain(chart.fitLeftDomain);
      }

      if (chart.topDomainBounds !== void 0) {
        view.topDomainBounds(chart.topDomainBounds);
      }
      if (chart.rightDomainBounds !== void 0) {
        view.rightDomainBounds(chart.rightDomainBounds);
      }
      if (chart.bottomDomainBounds !== void 0) {
        view.bottomDomainBounds(chart.bottomDomainBounds);
      }
      if (chart.leftDomainBounds !== void 0) {
        view.leftDomainBounds(chart.leftDomainBounds);
      }

      if (chart.topDomainPadding !== void 0) {
        view.topDomainPadding(chart.topDomainPadding);
      }
      if (chart.rightDomainPadding !== void 0) {
        view.rightDomainPadding(chart.rightDomainPadding);
      }
      if (chart.bottomDomainPadding !== void 0) {
        view.bottomDomainPadding(chart.bottomDomainPadding);
      }
      if (chart.leftDomainPadding !== void 0) {
        view.leftDomainPadding(chart.leftDomainPadding);
      }

      if (chart.multitouch !== void 0) {
        view.multitouch(chart.multitouch);
      }
      if (chart.topGesture !== void 0) {
        view.topGesture(chart.topGesture);
      }
      if (chart.rightGesture !== void 0) {
        view.rightGesture(chart.rightGesture);
      }
      if (chart.bottomGesture !== void 0) {
        view.bottomGesture(chart.bottomGesture);
      }
      if (chart.leftGesture !== void 0) {
        view.leftGesture(chart.leftGesture);
      }

      if (chart.rescaleTransition !== void 0) {
        view.rescaleTransition(chart.rescaleTransition);
      }

      if (chart.topGutter !== void 0) {
        view.topGutter(chart.topGutter);
      }
      if (chart.rightGutter !== void 0) {
        view.rightGutter(chart.rightGutter);
      }
      if (chart.bottomGutter !== void 0) {
        view.bottomGutter(chart.bottomGutter);
      }
      if (chart.leftGutter !== void 0) {
        view.leftGutter(chart.leftGutter);
      }

      if (chart.domainColor !== void 0) {
        view.domainColor(chart.domainColor);
      }
      if (chart.domainWidth !== void 0) {
        view.domainWidth(chart.domainWidth);
      }
      if (chart.domainSerif !== void 0) {
        view.domainSerif(chart.domainSerif);
      }

      if (chart.tickMarkColor !== void 0) {
        view.tickMarkColor(chart.tickMarkColor);
      }
      if (chart.tickMarkWidth !== void 0) {
        view.tickMarkWidth(chart.tickMarkWidth);
      }
      if (chart.tickMarkLength !== void 0) {
        view.tickMarkLength(chart.tickMarkLength);
      }

      if (chart.tickLabelPadding !== void 0) {
        view.tickLabelPadding(chart.tickLabelPadding);
      }

      if (chart.gridLineColor !== void 0) {
        view.gridLineColor(chart.gridLineColor);
      }
      if (chart.gridLineWidth !== void 0) {
        view.gridLineWidth(chart.gridLineWidth);
      }

      if (chart.font !== void 0) {
        view.font(chart.font);
      }
      if (chart.textColor !== void 0) {
        view.textColor(chart.textColor);
      }

      if (chart.hidden !== void 0) {
        view.setHidden(chart.hidden);
      }
      if (chart.culled !== void 0) {
        view.setCulled(chart.culled);
      }

      return view;
    }
    throw new TypeError("" + chart);
  }
}
