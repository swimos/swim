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

import {Class, Initable, Range, AnyTiming, Timing, Easing, LinearRange} from "@swim/util";
import {Affinity, MemberFastenerClass, Property} from "@swim/component";
import {AnyLength, Length, R2Point, R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {Look, ThemeAnimator} from "@swim/theme";
import {View, ViewRef} from "@swim/view";
import type {ChartViewObserver} from "./ChartViewObserver";
import {ScaledViewInit, ScaledView} from "../scaled/ScaledView";
import {AnyGraphView, GraphView} from "../graph/GraphView";
import type {AnyAxisView, AxisViewInit, AxisView} from "../axis/AxisView";
import {TopAxisView} from "../axis/TopAxisView";
import {RightAxisView} from "../axis/RightAxisView";
import {BottomAxisView} from "../axis/BottomAxisView";
import {LeftAxisView} from "../axis/LeftAxisView";

/** @public */
export type AnyChartView<X = unknown, Y = unknown> = ChartView<X, Y> | ChartViewInit<X, Y>;

/** @public */
export interface ChartViewInit<X = unknown, Y = unknown> extends ScaledViewInit<X, Y> {
  graph?: AnyGraphView<X, Y>;

  topAxis?: AnyAxisView<X> | true;
  rightAxis?: AnyAxisView<Y> | true;
  bottomAxis?: AnyAxisView<X> | true;
  leftAxis?: AnyAxisView<Y> | true;

  gutterTop?: AnyLength;
  gutterRight?: AnyLength;
  gutterBottom?: AnyLength;
  gutterLeft?: AnyLength;

  borderColor?: AnyColor;
  borderWidth?: number;
  borderSerif?: number;

  tickMarkColor?: AnyColor;
  tickMarkWidth?: number;
  tickMarkLength?: number;
  tickLabelPadding?: number;
  tickTransition?: AnyTiming;

  gridLineColor?: AnyColor;
  gridLineWidth?: number;

  font?: AnyFont;
  textColor?: AnyColor;
}

/** @public */
export class ChartView<X = unknown, Y = unknown> extends ScaledView<X, Y> {
  override readonly observerType?: Class<ChartViewObserver<X, Y>>;

  @ThemeAnimator({type: Length, state: Length.px(20)})
  readonly gutterTop!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, state: Length.px(40)})
  readonly gutterRight!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, state: Length.px(20)})
  readonly gutterBottom!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, state: Length.px(40)})
  readonly gutterLeft!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Color, state: null, look: Look.neutralColor})
  readonly borderColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Number, state: 1})
  readonly borderWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Number, state: 6})
  readonly borderSerif!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Color, state: null, look: Look.neutralColor})
  readonly tickMarkColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Number, state: 1})
  readonly tickMarkWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Number, state: 6})
  readonly tickMarkLength!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Number, state: 2})
  readonly tickLabelPadding!: ThemeAnimator<this, number>;

  @Property({
    type: Timing,
    initState(): Timing {
      return Easing.cubicOut.withDuration(250);
    },
  })
  readonly tickTransition!: Property<this, Timing, AnyTiming>;

  @ThemeAnimator({type: Color, state: null, look: Look.subduedColor})
  readonly gridLineColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Number, state: 0})
  readonly gridLineWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Font, state: null, inherits: true})
  readonly font!: ThemeAnimator<this, Font | null, AnyFont | null>;

  @ThemeAnimator({type: Color, state: null, look: Look.mutedColor})
  readonly textColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  override xRange(): Range<number> | null {
    const frame = this.viewFrame;
    const gutterLeft = this.gutterLeft.getValue().pxValue(frame.width);
    const gutterRight = this.gutterRight.getValue().pxValue(frame.width);
    const xRangePadding = this.xRangePadding.state;
    const xRangeMin = xRangePadding[0];
    const xRangeMax = this.viewFrame.width - gutterRight - gutterLeft - xRangePadding[1];
    return LinearRange(xRangeMin, xRangeMax);
  }

  override yRange(): Range<number> | null {
    const frame = this.viewFrame;
    const gutterTop = this.gutterTop.getValue().pxValue(frame.height);
    const gutterBottom = this.gutterBottom.getValue().pxValue(frame.height);
    const yRangePadding = this.yRangePadding.state;
    const yRangeMin = yRangePadding[0];
    const yRangeMax = this.viewFrame.height - gutterBottom - gutterTop - yRangePadding[1];
    return LinearRange(yRangeMax, yRangeMin);
  }

  @ViewRef<ChartView<X, Y>, GraphView<X, Y>>({
    key: true,
    type: GraphView,
    binds: true,
    willAttachView(graphView: GraphView<X, Y>): void {
      this.owner.callObservers("viewWillAttachGraph", graphView, this.owner);
    },
    didDetachView(graphView: GraphView<X, Y>): void {
      this.owner.callObservers("viewDidDetachGraph", graphView, this.owner);
    },
    detectView(view: View): GraphView<X, Y> | null {
      return view instanceof GraphView ? view : null;
    },
  })
  readonly graph!: ViewRef<this, GraphView<X, Y>>;
  static readonly graph: MemberFastenerClass<ChartView, "graph">;

  @ViewRef<ChartView<X, Y>, AxisView<X> & Initable<AxisViewInit<X> | true>>({
    key: true,
    type: TopAxisView,
    binds: true,
    willAttachView(topAxisView: AxisView<X>): void {
      this.owner.callObservers("viewWillAttachTopAxis", topAxisView, this.owner);
    },
    didDetachView(topAxisView: AxisView<X>): void {
      this.owner.callObservers("viewDidDetachTopAxis", topAxisView, this.owner);
    },
    detectView(view: View): AxisView<X> | null {
      return view instanceof TopAxisView ? view : null;
    },
  })
  readonly topAxis!: ViewRef<this, AxisView<X> & Initable<AxisViewInit<X> | true>>;
  static readonly topAxis: MemberFastenerClass<ChartView, "topAxis">;

  @ViewRef<ChartView<X, Y>, AxisView<Y> & Initable<AxisViewInit<Y> | true>>({
    key: true,
    type: RightAxisView,
    binds: true,
    willAttachView(rightAxisView: AxisView<Y>): void {
      this.owner.callObservers("viewWillAttachRightAxis", rightAxisView, this.owner);
    },
    didDetachView(rightAxisView: AxisView<Y>): void {
      this.owner.callObservers("viewDidDetachRightAxis", rightAxisView, this.owner);
    },
    detectView(view: View): AxisView<Y> | null {
      return view instanceof RightAxisView ? view : null;
    },
  })
  readonly rightAxis!: ViewRef<this, AxisView<Y> & Initable<AxisViewInit<Y> | true>>;
  static readonly rightAxis: MemberFastenerClass<ChartView, "rightAxis">;

  @ViewRef<ChartView<X, Y>, AxisView<X> & Initable<AxisViewInit<X> | true>>({
    key: true,
    type: BottomAxisView,
    binds: true,
    willAttachView(bottomAxisView: AxisView<X>): void {
      this.owner.callObservers("viewWillAttachBottomAxis", bottomAxisView, this.owner);
    },
    didDetachView(bottomAxisView: AxisView<X>): void {
      this.owner.callObservers("viewDidDetachBottomAxis", bottomAxisView, this.owner);
    },
    detectView(view: View): AxisView<X> | null {
      return view instanceof BottomAxisView ? view : null;
    },
  })
  readonly bottomAxis!: ViewRef<this, AxisView<X> & Initable<AxisViewInit<X> | true>>;
  static readonly bottomAxis: MemberFastenerClass<ChartView, "bottomAxis">;

  @ViewRef<ChartView<X, Y>, AxisView<Y> & Initable<AxisViewInit<Y> | true>>({
    key: true,
    type: LeftAxisView,
    binds: true,
    willAttachView(leftAxisView: AxisView<Y>): void {
      this.owner.callObservers("viewWillAttachLeftAxis", leftAxisView, this.owner);
    },
    didDetachView(leftAxisView: AxisView<Y>): void {
      this.owner.callObservers("viewDidDetachLeftAxis", leftAxisView, this.owner);
    },
    detectView(view: View): AxisView<Y> | null {
      return view instanceof LeftAxisView ? view : null;
    },
  })
  readonly leftAxis!: ViewRef<this, AxisView<Y> & Initable<AxisViewInit<Y> | true>>;
  static readonly leftAxis: MemberFastenerClass<ChartView, "leftAxis">;

  protected override updateScales(): void {
    this.layoutChart(this.viewFrame);
    super.updateScales();
  }

  protected layoutChart(frame: R2Box): void {
    const gutterTop = this.gutterTop.getValue().pxValue(frame.height);
    const gutterRight = this.gutterRight.getValue().pxValue(frame.width);
    const gutterBottom = this.gutterBottom.getValue().pxValue(frame.height);
    const gutterLeft = this.gutterLeft.getValue().pxValue(frame.width);

    const graphTop = frame.yMin + gutterTop;
    const graphRight = frame.xMax - gutterRight;
    const graphBottom = frame.yMax - gutterBottom;
    const graphLeft = frame.xMin + gutterLeft;

    const topAxisView = this.topAxis.view;
    if (topAxisView !== null) {
      topAxisView.setViewFrame(new R2Box(graphLeft, frame.yMin, graphRight, graphBottom));
      topAxisView.origin.setState(new R2Point(graphLeft, graphTop), Affinity.Intrinsic);
    }
    const rightAxisView = this.rightAxis.view;
    if (rightAxisView !== null) {
      rightAxisView.setViewFrame(new R2Box(graphLeft, graphTop, frame.xMax, graphBottom));
      rightAxisView.origin.setState(new R2Point(Math.max(graphLeft, graphRight), graphBottom), Affinity.Intrinsic);
    }
    const bottomAxisView = this.bottomAxis.view;
    if (bottomAxisView !== null) {
      bottomAxisView.setViewFrame(new R2Box(graphLeft, graphTop, graphRight, frame.yMax));
      bottomAxisView.origin.setState(new R2Point(graphLeft, Math.max(graphTop, graphBottom)), Affinity.Intrinsic);
    }
    const leftAxisView = this.leftAxis.view;
    if (leftAxisView !== null) {
      leftAxisView.setViewFrame(new R2Box(frame.xMin, graphTop, graphRight, graphBottom));
      leftAxisView.origin.setState(new R2Point(graphLeft, graphBottom), Affinity.Intrinsic);
    }

    const graphView = this.graph.view;
    if (graphView !== null) {
      graphView.setViewFrame(new R2Box(graphLeft, graphTop, graphRight, graphBottom));
    }
  }

  override init(init: ChartViewInit<X, Y>): void {
    super.init(init);
     if (init.graph !== void 0) {
      this.graph(init.graph);
    }

    if (init.topAxis !== void 0) {
      this.topAxis(init.topAxis);
    }
    if (init.rightAxis !== void 0) {
      this.rightAxis(init.rightAxis);
    }
    if (init.bottomAxis !== void 0) {
      this.bottomAxis(init.bottomAxis);
    }
    if (init.leftAxis !== void 0) {
      this.leftAxis(init.leftAxis);
    }

    if (init.gutterTop !== void 0) {
      this.gutterTop(init.gutterTop);
    }
    if (init.gutterRight !== void 0) {
      this.gutterRight(init.gutterRight);
    }
    if (init.gutterBottom !== void 0) {
      this.gutterBottom(init.gutterBottom);
    }
    if (init.gutterLeft !== void 0) {
      this.gutterLeft(init.gutterLeft);
    }

    if (init.borderColor !== void 0) {
      this.borderColor(init.borderColor);
    }
    if (init.borderWidth !== void 0) {
      this.borderWidth(init.borderWidth);
    }
    if (init.borderSerif !== void 0) {
      this.borderSerif(init.borderSerif);
    }

    if (init.tickMarkColor !== void 0) {
      this.tickMarkColor(init.tickMarkColor);
    }
    if (init.tickMarkWidth !== void 0) {
      this.tickMarkWidth(init.tickMarkWidth);
    }
    if (init.tickMarkLength !== void 0) {
      this.tickMarkLength(init.tickMarkLength);
    }
    if (init.tickLabelPadding !== void 0) {
      this.tickLabelPadding(init.tickLabelPadding);
    }
    if (init.tickTransition !== void 0) {
      this.tickTransition(init.tickTransition);
    }

    if (init.gridLineColor !== void 0) {
      this.gridLineColor(init.gridLineColor);
    }
    if (init.gridLineWidth !== void 0) {
      this.gridLineWidth(init.gridLineWidth);
    }

    if (init.font !== void 0) {
      this.font(init.font);
    }
    if (init.textColor !== void 0) {
      this.textColor(init.textColor);
    }
  }
}
