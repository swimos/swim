// Copyright 2015-2024 Nstream, inc.
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
import type {Range} from "@swim/util";
import {Timing} from "@swim/util";
import {Easing} from "@swim/util";
import {LinearRange} from "@swim/util";
import {Property} from "@swim/component";
import {Length} from "@swim/math";
import {R2Point} from "@swim/math";
import {R2Box} from "@swim/math";
import {Font} from "@swim/style";
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import type {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import type {ScaledViewObserver} from "./ScaledView";
import {ScaledView} from "./ScaledView";
import {GraphView} from "./GraphView";
import type {AxisView} from "./AxisView";
import {TopAxisView} from "./AxisView";
import {RightAxisView} from "./AxisView";
import {BottomAxisView} from "./AxisView";
import {LeftAxisView} from "./AxisView";

/** @public */
export interface ChartViewObserver<X = unknown, Y = unknown, V extends ChartView<X, Y> = ChartView<X, Y>> extends ScaledViewObserver<X, Y, V> {
  viewWillAttachGraph?(graphView: GraphView<X, Y>, view: V): void;

  viewDidDetachGraph?(graphView: GraphView<X, Y>, view: V): void;

  viewWillAttachTopAxis?(topAxisView: AxisView<X>, view: V): void;

  viewDidDetachTopAxis?(topAxisView: AxisView<X>, view: V): void;

  viewWillAttachRightAxis?(rightAxisView: AxisView<Y> , view: V): void;

  viewDidDetachRightAxis?(rightAxisView: AxisView<Y>, view: V): void;

  viewWillAttachBottomAxis?(bottomAxisView: AxisView<X>, view: V): void;

  viewDidDetachBottomAxis?(bottomAxisView: AxisView<X>, view: V): void;

  viewWillAttachLeftAxis?(leftAxisView: AxisView<Y>, view: V): void;

  viewDidDetachLeftAxis?(leftAxisView: AxisView<Y>, view: V): void;
}

/** @public */
export class ChartView<X = unknown, Y = unknown> extends ScaledView<X, Y> {
  declare readonly observerType?: Class<ChartViewObserver<X, Y>>;

  @ThemeAnimator({valueType: Length, value: Length.px(20)})
  readonly gutterTop!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.px(40)})
  readonly gutterRight!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.px(20)})
  readonly gutterBottom!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.px(40)})
  readonly gutterLeft!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Color, value: null, look: Look.tickColor})
  readonly borderColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Number, value: 1})
  readonly borderWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Number, value: 6})
  readonly borderSerif!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Color, value: null, look: Look.tickColor})
  readonly tickMarkColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Number, value: 1})
  readonly tickMarkWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Number, value: 6})
  readonly tickMarkLength!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Number, value: 2})
  readonly tickLabelPadding!: ThemeAnimator<this, number>;

  @Property({
    valueType: Timing,
    initValue(): Timing {
      return Easing.cubicOut.withDuration(250);
    },
  })
  readonly tickTransition!: Property<this, Timing>;

  @ThemeAnimator({valueType: Color, value: null, look: Look.gridColor})
  readonly gridLineColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Number, value: 0})
  readonly gridLineWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Font, value: null, inherits: true})
  readonly font!: ThemeAnimator<this, Font | null>;

  @ThemeAnimator({valueType: Color, value: null, look: Look.tickColor})
  readonly textColor!: ThemeAnimator<this, Color | null>;

  override xRange(): Range<number> | null {
    const frame = this.viewFrame;
    const gutterLeft = this.gutterLeft.getValue().pxValue(frame.width);
    const gutterRight = this.gutterRight.getValue().pxValue(frame.width);
    const xRangePadding = this.xRangePadding.value;
    const xRangeMin = xRangePadding[0];
    const xRangeMax = this.viewFrame.width - gutterRight - gutterLeft - xRangePadding[1];
    return LinearRange(xRangeMin, xRangeMax);
  }

  override yRange(): Range<number> | null {
    const frame = this.viewFrame;
    const gutterTop = this.gutterTop.getValue().pxValue(frame.height);
    const gutterBottom = this.gutterBottom.getValue().pxValue(frame.height);
    const yRangePadding = this.yRangePadding.value;
    const yRangeMin = yRangePadding[0];
    const yRangeMax = this.viewFrame.height - gutterBottom - gutterTop - yRangePadding[1];
    return LinearRange(yRangeMax, yRangeMin);
  }

  @ViewRef({
    viewType: GraphView,
    viewKey: true,
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

  @ViewRef({
    viewType: TopAxisView,
    viewKey: true,
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
  readonly topAxis!: ViewRef<this, AxisView<X>>;

  @ViewRef({
    viewType: RightAxisView,
    viewKey: true,
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
  readonly rightAxis!: ViewRef<this, AxisView<Y>>;

  @ViewRef({
    viewType: BottomAxisView,
    viewKey: true,
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
  readonly bottomAxis!: ViewRef<this, AxisView<X>>;

  @ViewRef({
    viewType: LeftAxisView,
    viewKey: true,
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
  readonly leftAxis!: ViewRef<this, AxisView<Y>>;

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
      topAxisView.origin.setIntrinsic(new R2Point(graphLeft, graphTop));
    }
    const rightAxisView = this.rightAxis.view;
    if (rightAxisView !== null) {
      rightAxisView.setViewFrame(new R2Box(graphLeft, graphTop, frame.xMax, graphBottom));
      rightAxisView.origin.setIntrinsic(new R2Point(Math.max(graphLeft, graphRight), graphBottom));
    }
    const bottomAxisView = this.bottomAxis.view;
    if (bottomAxisView !== null) {
      bottomAxisView.setViewFrame(new R2Box(graphLeft, graphTop, graphRight, frame.yMax));
      bottomAxisView.origin.setIntrinsic(new R2Point(graphLeft, Math.max(graphTop, graphBottom)));
    }
    const leftAxisView = this.leftAxis.view;
    if (leftAxisView !== null) {
      leftAxisView.setViewFrame(new R2Box(frame.xMin, graphTop, graphRight, graphBottom));
      leftAxisView.origin.setIntrinsic(new R2Point(graphLeft, graphBottom));
    }

    const graphView = this.graph.view;
    if (graphView !== null) {
      graphView.setViewFrame(new R2Box(graphLeft, graphTop, graphRight, graphBottom));
    }
  }
}
