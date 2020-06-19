// Copyright 2015-2020 Swim inc.
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

import {PointR2, BoxR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {Ease, AnyTransition, Transition} from "@swim/transition";
import {View, ViewScope, ViewAnimator} from "@swim/view";
import {ChartViewController} from "./ChartViewController";
import {ScaleViewInit, ScaleView} from "./scale/ScaleView";
import {AnyGraphView, GraphView} from "./graph/GraphView";
import {AnyAxisView, AxisView} from "./axis/AxisView";

export type AnyChartView<X = unknown, Y = unknown> = ChartView<X, Y> | ChartViewInit<X, Y>;

export interface ChartViewInit<X = unknown, Y = unknown> extends ScaleViewInit<X, Y> {
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
  tickTransition?: AnyTransition<any>;

  gridLineColor?: AnyColor;
  gridLineWidth?: number;
}

export class ChartView<X = unknown, Y = unknown> extends ScaleView<X, Y> {
  constructor() {
    super();
    this.initChart();
  }

  get viewController(): ChartViewController<X, Y> | null {
    return this._viewController;
  }

  protected initChart(): void {
    this.setChildView("graph", this.createGraph());
  }

  protected createGraph(): GraphView<X, Y> | null {
    return new GraphView();
  }

  graph(): GraphView<X, Y> | null;
  graph(graph: AnyGraphView<X, Y> | null): this;
  graph(graph?: AnyGraphView<X, Y> | null): GraphView<X, Y> | null | this {
    if (graph === void 0) {
      const childView = this.getChildView("graph");
      return childView instanceof GraphView ? childView : null;
    } else {
      if (graph !== null) {
        graph = GraphView.fromAny(graph);
      }
      this.setChildView("graph", graph);
      return this;
    }
  }

  topAxis(): AxisView<X> | null;
  topAxis(topAxis: AnyAxisView<X> | true | null): this;
  topAxis(topAxis?: AnyAxisView<X> | true | null): AxisView<X> | null | this {
    if (topAxis === void 0) {
      const childView = this.getChildView("topAxis");
      return childView instanceof AxisView ? childView : null;
    } else {
      if (topAxis !== null) {
        topAxis = AxisView.fromAny(topAxis, "top");
      }
      if (topAxis !== null) {
        this.prependChildView(topAxis, "topAxis");
      } else {
        this.removeChildView("topAxis");
      }
      return this;
    }
  }

  rightAxis(): AxisView<Y> | null;
  rightAxis(rightAxis: AnyAxisView<Y> | true | null): this;
  rightAxis(rightAxis?: AnyAxisView<Y> | true | null): AxisView<Y> | null | this {
    if (rightAxis === void 0) {
      const childView = this.getChildView("rightAxis");
      return childView instanceof AxisView ? childView : null;
    } else {
      if (rightAxis !== null) {
        rightAxis = AxisView.fromAny(rightAxis, "right");
      }
      if (rightAxis !== null) {
        this.prependChildView(rightAxis, "rightAxis");
      } else {
        this.removeChildView("rightAxis");
      }
      return this;
    }
  }

  bottomAxis(): AxisView<X> | null;
  bottomAxis(bottomAxis: AnyAxisView<X> | true | null): this;
  bottomAxis(bottomAxis?: AnyAxisView<X> | true | null): AxisView<X> | null | this {
    if (bottomAxis === void 0) {
      const childView = this.getChildView("bottomAxis");
      return childView instanceof AxisView ? childView : null;
    } else {
      if (bottomAxis !== null) {
        bottomAxis = AxisView.fromAny(bottomAxis, "bottom");
      }
      if (bottomAxis !== null) {
        this.prependChildView(bottomAxis, "bottomAxis");
      } else {
        this.removeChildView("bottomAxis");
      }
      return this;
    }
  }

  leftAxis(): AxisView<Y> | null;
  leftAxis(leftAxis: AnyAxisView<Y> | true | null): this;
  leftAxis(leftAxis?: AnyAxisView<Y> | true | null): AxisView<Y> | null | this {
    if (leftAxis === void 0) {
      const childView = this.getChildView("leftAxis");
      return childView instanceof AxisView ? childView : null;
    } else {
      if (leftAxis !== null) {
        leftAxis = AxisView.fromAny(leftAxis, "left");
      }
      if (leftAxis !== null) {
        this.prependChildView(leftAxis, "leftAxis");
      } else {
        this.removeChildView("leftAxis");
      }
      return this;
    }
  }

  @ViewAnimator(Length, {value: Length.px(20)})
  gutterTop: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Length, {value: Length.px(40)})
  gutterRight: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Length, {value: Length.px(20)})
  gutterBottom: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Length, {value: Length.px(40)})
  gutterLeft: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Color, {value: Color.black()})
  borderColor: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Number, {value: 1})
  borderWidth: ViewAnimator<this, number>;

  @ViewAnimator(Number, {value: 6})
  borderSerif: ViewAnimator<this, number>;

  @ViewAnimator(Color, {value: Color.black()})
  tickMarkColor: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Number, {value: 1})
  tickMarkWidth: ViewAnimator<this, number>;

  @ViewAnimator(Number, {value: 6})
  tickMarkLength: ViewAnimator<this, number>;

  @ViewAnimator(Number, {value: 2})
  tickLabelPadding: ViewAnimator<this, number>;

  @ViewScope(Object, {
    inherit: true,
    init(): Transition<any> {
      return Transition.duration(250, Ease.cubicOut);
    },
  })
  tickTransition: ViewScope<this, Transition<any>>;

  @ViewAnimator(Color, {value: Color.transparent()})
  gridLineColor: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Number, {value: 0})
  gridLineWidth: ViewAnimator<this, number>;

  xRange(): readonly [number, number] | undefined {
    const frame = this.viewFrame;
    const gutterLeft = this.gutterLeft.value!.pxValue(frame.width);
    const gutterRight = this.gutterRight.value!.pxValue(frame.width);
    const xRangeMin = this._xRangePadding[0];
    const xRangeMax = this.viewFrame.width - gutterRight - gutterLeft - this._xRangePadding[1];
    return [xRangeMin, xRangeMax];
  }

  yRange(): readonly [number, number] | undefined {
    const frame = this.viewFrame;
    const gutterTop = this.gutterTop.value!.pxValue(frame.height);
    const gutterBottom = this.gutterBottom.value!.pxValue(frame.height);
    const yRangeMin = this._yRangePadding[0];
    const yRangeMax = this.viewFrame.height - gutterBottom - gutterTop - this._yRangePadding[1];
    return [yRangeMin, yRangeMax];
  }

  protected onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    if (childView instanceof GraphView) {
      this.onInsertGraph(childView);
    } else if (childView instanceof AxisView) {
      this.onInsertAxis(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    if (childView instanceof GraphView) {
      this.onInsertGraph(childView);
    } else if (childView instanceof AxisView) {
      this.onRemoveAxis(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertGraph(graph: GraphView<X, Y>): void {
    // hook
  }

  protected onRemoveGraph(graph: GraphView<X, Y>): void {
    // hook
  }

  protected onInsertAxis(axis: AxisView<X | Y>): void {
    // hook
  }

  protected onRemoveAxis(axis: AxisView<X | Y>): void {
    // hook
  }

  protected updateScales(): void {
    super.updateScales();
    this.layoutChart(this.viewFrame);
  }

  protected layoutChart(frame: BoxR2): void {
    const gutterTop = this.gutterTop.value!.pxValue(frame.height);
    const gutterRight = this.gutterRight.value!.pxValue(frame.width);
    const gutterBottom = this.gutterBottom.value!.pxValue(frame.height);
    const gutterLeft = this.gutterLeft.value!.pxValue(frame.width);

    const graphTop = frame.yMin + gutterTop;
    const graphRight = frame.xMax - gutterRight;
    const graphBottom = frame.yMax - gutterBottom;
    const graphLeft = frame.xMin + gutterLeft;

    const topAxis = this.topAxis();
    if (topAxis !== null) {
      const topFrame = topAxis.viewFrame;
      if (topFrame.xMin !== graphLeft || topFrame.yMin !== frame.yMin ||
          topFrame.xMax !== graphRight || topFrame.yMax !== graphBottom) {
        topAxis.setViewFrame(new BoxR2(graphLeft, frame.yMin, graphRight, graphBottom));
        topAxis.origin.setAutoState(new PointR2(graphLeft, graphTop));
        topAxis.requireUpdate(View.NeedsLayout);
      }
    }
    const rightAxis = this.rightAxis();
    if (rightAxis !== null) {
      const rightFrame = rightAxis.viewFrame;
      if (rightFrame.xMin !== graphLeft || rightFrame.yMin !== graphTop ||
          rightFrame.xMax !== frame.xMax || rightFrame.yMax !== graphBottom) {
        rightAxis.setViewFrame(new BoxR2(graphLeft, graphTop, frame.xMax, graphBottom));
        rightAxis.origin.setAutoState(new PointR2(Math.max(graphLeft, graphRight), graphBottom));
        rightAxis.requireUpdate(View.NeedsLayout);
      }
    }
    const bottomAxis = this.bottomAxis();
    if (bottomAxis !== null) {
      const bottomFrame = bottomAxis.viewFrame;
      if (bottomFrame.xMin !== graphLeft || bottomFrame.yMin !== graphTop ||
          bottomFrame.xMax !== graphRight || bottomFrame.yMax !== frame.yMax) {
        bottomAxis.setViewFrame(new BoxR2(graphLeft, graphTop, graphRight, frame.yMax));
        bottomAxis.origin.setAutoState(new PointR2(graphLeft, Math.max(graphTop, graphBottom)));
        bottomAxis.requireUpdate(View.NeedsLayout);
      }
    }
    const leftAxis = this.leftAxis();
    if (leftAxis !== null) {
      const leftFrame = leftAxis.viewFrame;
      if (leftFrame.xMin !== frame.xMin || leftFrame.yMin !== graphTop ||
          leftFrame.xMax !== graphRight || leftFrame.yMax !== graphBottom) {
        leftAxis.setViewFrame(new BoxR2(frame.xMin, graphTop, graphRight, graphBottom));
        leftAxis.origin.setAutoState(new PointR2(graphLeft, graphBottom));
        leftAxis.requireUpdate(View.NeedsLayout);
      }
    }

    const graph = this.graph();
    if (graph !== null) {
      const graphFrame = graph.viewFrame;
      if (graphFrame.xMin !== graphLeft || graphFrame.yMin !== graphTop ||
          graphFrame.xMax !== graphRight || graphFrame.yMax !== graphBottom) {
        graph.setViewFrame(new BoxR2(graphLeft, graphTop, graphRight, graphBottom));
        graph.requireUpdate(View.NeedsLayout);
      }
    }
  }

  static fromAny<X, Y>(chart: AnyChartView<X, Y>): ChartView<X, Y> {
    if (chart instanceof ChartView) {
      return chart;
    } else if (typeof chart === "object" && chart !== null) {
      return ChartView.fromInit(chart);
    }
    throw new TypeError("" + chart);
  }

  static fromInit<X, Y>(init: ChartViewInit<X, Y>): ChartView<X, Y> {
    const view = new ChartView<X, Y>();
    ScaleView.init(view, init);

    if (init.graph !== void 0) {
      view.graph(init.graph);
    }

    if (init.topAxis !== void 0) {
      view.topAxis(init.topAxis);
    }
    if (init.rightAxis !== void 0) {
      view.rightAxis(init.rightAxis);
    }
    if (init.bottomAxis !== void 0) {
      view.bottomAxis(init.bottomAxis);
    }
    if (init.leftAxis !== void 0) {
      view.leftAxis(init.leftAxis);
    }

    if (init.gutterTop !== void 0) {
      view.gutterTop(init.gutterTop);
    }
    if (init.gutterRight !== void 0) {
      view.gutterRight(init.gutterRight);
    }
    if (init.gutterBottom !== void 0) {
      view.gutterBottom(init.gutterBottom);
    }
    if (init.gutterLeft !== void 0) {
      view.gutterLeft(init.gutterLeft);
    }

    if (init.borderColor !== void 0) {
      view.borderColor(init.borderColor);
    }
    if (init.borderWidth !== void 0) {
      view.borderWidth(init.borderWidth);
    }
    if (init.borderSerif !== void 0) {
      view.borderSerif(init.borderSerif);
    }

    if (init.tickMarkColor !== void 0) {
      view.tickMarkColor(init.tickMarkColor);
    }
    if (init.tickMarkWidth !== void 0) {
      view.tickMarkWidth(init.tickMarkWidth);
    }
    if (init.tickMarkLength !== void 0) {
      view.tickMarkLength(init.tickMarkLength);
    }
    if (init.tickLabelPadding !== void 0) {
      view.tickLabelPadding(init.tickLabelPadding);
    }
    if (init.tickTransition !== void 0) {
      view.tickTransition(Transition.fromAny(init.tickTransition));
    }

    if (init.gridLineColor !== void 0) {
      view.gridLineColor(init.gridLineColor);
    }
    if (init.gridLineWidth !== void 0) {
      view.gridLineWidth(init.gridLineWidth);
    }

    return view;
  }
}
