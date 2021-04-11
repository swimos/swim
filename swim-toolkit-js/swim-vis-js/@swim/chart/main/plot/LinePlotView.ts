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

import {AnyLength, Length, BoxR2} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import {View, ViewProperty, ViewAnimator, ViewFastener} from "@swim/view";
import type {GraphicsView, GraphicsViewController, CanvasContext, CanvasRenderer, StrokeViewInit, StrokeView} from "@swim/graphics";
import type {DataPointView} from "../data/DataPointView";
import {SeriesPlotType, SeriesPlotViewInit, SeriesPlotView} from "./SeriesPlotView";
import type {LinePlotViewObserver} from "./LinePlotViewObserver";

export type AnyLinePlotView<X, Y> = LinePlotView<X, Y> | LinePlotViewInit<X, Y>;

export interface LinePlotViewInit<X, Y> extends SeriesPlotViewInit<X, Y>, StrokeViewInit {
  hitWidth?: number;
}

export class LinePlotView<X, Y> extends SeriesPlotView<X, Y> implements StrokeView {
  initView(init: LinePlotViewInit<X, Y>): void {
    super.initView(init);
     if (init.hitWidth !== void 0) {
      this.hitWidth(init.hitWidth);
    }

    if (init.stroke !== void 0) {
      this.stroke(init.stroke);
    }
    if (init.strokeWidth !== void 0) {
      this.strokeWidth(init.strokeWidth);
    }
  }

  declare readonly viewController: GraphicsViewController<LinePlotView<X, Y>> & LinePlotViewObserver<X, Y> | null;

  declare readonly viewObservers: ReadonlyArray<LinePlotViewObserver<X, Y>>;

  get plotType(): SeriesPlotType {
    return "line";
  }

  protected willSetStroke(newStroke: Color | null, oldStroke: Color | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetPlotStroke !== void 0) {
      viewController.viewWillSetPlotStroke(newStroke, oldStroke, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetPlotStroke !== void 0) {
        viewObserver.viewWillSetPlotStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected onSetStroke(newStroke: Color | null, oldStroke: Color | null): void {
    // hook
  }

  protected didSetStroke(newStroke: Color | null, oldStroke: Color | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetPlotStroke !== void 0) {
        viewObserver.viewDidSetPlotStroke(newStroke, oldStroke, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetPlotStroke !== void 0) {
      viewController.viewDidSetPlotStroke(newStroke, oldStroke, this);
    }
  }

  @ViewAnimator<LinePlotView<X, Y>, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    look: Look.accentColor,
    willSetValue(newStroke: Color | null, oldStroke: Color | null): void {
      this.owner.willSetStroke(newStroke, oldStroke);
    },
    didSetValue(newStroke: Color | null, oldStroke: Color | null): void {
      this.owner.onSetStroke(newStroke, oldStroke);
      this.owner.didSetStroke(newStroke, oldStroke);
    },
  })
  declare stroke: ViewAnimator<this, Color | null, AnyColor | null>;

  protected willSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetPlotStrokeWidth !== void 0) {
      viewController.viewWillSetPlotStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetPlotStrokeWidth !== void 0) {
        viewObserver.viewWillSetPlotStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  protected onSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    if (this.xRangePadding.takesPrecedence(View.Intrinsic) || this.yRangePadding.takesPrecedence(View.Intrinsic)) {
      const frame = this.viewFrame;
      const size = Math.min(frame.width, frame.height);
      const strokeWidth = this.strokeWidth.getValueOr(Length.zero()).pxValue(size);
      const strokeRadius = strokeWidth / 2;
      this.xRangePadding.setState([strokeRadius, strokeRadius], View.Intrinsic);
      this.yRangePadding.setState([strokeRadius, strokeRadius], View.Intrinsic);
    }
  }

  protected didSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetPlotStrokeWidth !== void 0) {
        viewObserver.viewDidSetPlotStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetPlotStrokeWidth !== void 0) {
      viewController.viewDidSetPlotStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
    }
  }

  @ViewAnimator<LinePlotView<X, Y>, Length | null, AnyLength | null>({
    type: Length,
    state: Length.px(1),
    willSetValue(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.willSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
    },
    didSetValue(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.onSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
      this.owner.didSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
    },
  })
  declare strokeWidth: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewProperty({type: Number, state: 5})
  declare hitWidth: ViewProperty<this, number>;

  protected renderPlot(context: CanvasContext, frame: BoxR2): void {
    const size = Math.min(frame.width, frame.height);
    const stroke = this.stroke.getValueOr(Color.transparent());
    const strokeWidth = this.strokeWidth.getValueOr(Length.zero()).pxValue(size);
    const gradientStops = this.gradientStops;
    let gradient: CanvasGradient | null = null;

    let x0: number;
    let x1: number;
    let dx: number;
    const dataPointFasteners = this.dataPointFasteners;
    if (!dataPointFasteners.isEmpty()) {
      const p0 = dataPointFasteners.firstValue()!.view!;
      const p1 = dataPointFasteners.lastValue()!.view!;
      x0 = p0.xCoord;
      x1 = p1.xCoord;
      dx = x1 - x0;
      if (gradientStops !== 0) {
        gradient = context.createLinearGradient(x0, 0, x1, 0);
      }
    } else {
      x0 = NaN;
      x1 = NaN;
      dx = NaN;
    }

    context.beginPath();
    let i = 0;
    type self = this;
    dataPointFasteners.forEach(function (x: X, dataPointFastener: ViewFastener<self, DataPointView<X, Y>>): void {
      const p = dataPointFastener.view!;
      const xCoord = p.xCoord;
      const yCoord = p.yCoord;
      if (i === 0) {
        context.moveTo(xCoord, yCoord);
      } else {
        context.lineTo(xCoord, yCoord);
      }
      if (gradient !== null && p.isGradientStop()) {
        let color = p.color.getValueOr(stroke);
        const opacity = p.opacity.value;
        if (opacity !== void 0) {
          color = color.alpha(opacity);
        }
        const offset = (xCoord - x0) / (dx || 1);
        gradient!.addColorStop(offset, color.toString());
      }
      i += 1;
    }, this);

    context.strokeStyle = gradient !== null ? gradient : stroke.toString();
    context.lineWidth = strokeWidth;
    context.stroke();
  }

  protected hitTestPlot(x: number, y: number, renderer: CanvasRenderer): GraphicsView | null {
    const context = renderer.context;
    let hitWidth = this.hitWidth.state;
    const strokeWidth = this.strokeWidth.value;
    if (strokeWidth !== null) {
      const frame = this.viewFrame;
      const size = Math.min(frame.width, frame.height);
      hitWidth = Math.max(hitWidth, strokeWidth.pxValue(size));
    }

    context.beginPath();
    let i = 0;
    type self = this;
    this.dataPointFasteners.forEach(function (x: X, dataPointFastener: ViewFastener<self, DataPointView<X, Y>>): void {
      const p = dataPointFastener.view!;
      const xCoord = p.xCoord;
      const yCoord = p.yCoord;
      if (i === 0) {
        context.moveTo(xCoord, yCoord);
      } else {
        context.lineTo(xCoord, yCoord);
      }
      i += 1;
    }, this);

    context.lineWidth = hitWidth;
    if (context.isPointInStroke(x, y)) {
      const hitMode = this.hitMode.state;
      if (hitMode === "plot") {
        return this;
      } else if (hitMode === "data") {
        return this.hitTestDomain(x, y, renderer);
      }
    }
    return null;
  }

  static create<X, Y>(): LinePlotView<X, Y> {
    return new LinePlotView<X, Y>();
  }

  static fromInit<X, Y>(init: LinePlotViewInit<X, Y>): LinePlotView<X, Y> {
    const view = new LinePlotView<X, Y>();
    view.initView(init);
    return view;
  }

  static fromAny<X, Y>(value: AnyLinePlotView<X, Y>): LinePlotView<X, Y> {
    if (value instanceof LinePlotView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
