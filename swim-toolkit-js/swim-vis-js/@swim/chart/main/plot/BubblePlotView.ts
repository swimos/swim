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

import {AnyLength, Length, R2Box} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import {ViewAnimator} from "@swim/view";
import type {GraphicsViewController, CanvasContext, FillViewInit, FillView, StrokeViewInit, StrokeView} from "@swim/graphics";
import {ScatterPlotType, ScatterPlotViewInit, ScatterPlotView} from "./ScatterPlotView";
import type {BubblePlotViewObserver} from "./BubblePlotViewObserver";

export type AnyBubblePlotView<X, Y> = BubblePlotView<X, Y> | BubblePlotViewInit<X, Y>;

export interface BubblePlotViewInit<X, Y> extends ScatterPlotViewInit<X, Y>, FillViewInit, StrokeViewInit {
  radius?: AnyLength;
}

export class BubblePlotView<X, Y> extends ScatterPlotView<X, Y> implements FillView, StrokeView {
  override initView(init: BubblePlotViewInit<X, Y>): void {
    super.initView(init);
    if (init.radius !== void 0) {
      this.radius(init.radius);
    }
    if (init.fill !== void 0) {
      this.fill(init.fill);
    }
    if (init.stroke !== void 0) {
      this.stroke(init.stroke);
    }
    if (init.strokeWidth !== void 0) {
      this.strokeWidth(init.strokeWidth);
    }
  }

  override readonly viewController!: GraphicsViewController<BubblePlotView<X, Y>> & BubblePlotViewObserver<X, Y> | null;

  override readonly viewObservers!: ReadonlyArray<BubblePlotViewObserver<X, Y>>;

  override get plotType(): ScatterPlotType {
    return "bubble";
  }

  protected willSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetPlotRadius !== void 0) {
      viewController.viewWillSetPlotRadius(newRadius, oldRadius, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetPlotRadius !== void 0) {
        viewObserver.viewWillSetPlotRadius(newRadius, oldRadius, this);
      }
    }
  }

  protected onSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    // hook
  }

  protected didSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetPlotRadius !== void 0) {
        viewObserver.viewDidSetPlotRadius(newRadius, oldRadius, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetPlotRadius !== void 0) {
      viewController.viewDidSetPlotRadius(newRadius, oldRadius, this);
    }
  }

  @ViewAnimator<BubblePlotView<X, Y>, Length | null, AnyLength | null>({
    type: Length,
    state: Length.px(5),
    willSetValue(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.willSetRadius(newRadius, oldRadius);
    },
    didSetValue(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.onSetRadius(newRadius, oldRadius);
      this.owner.didSetRadius(newRadius, oldRadius);
    },
  })
  readonly radius!: ViewAnimator<this, Length | null, AnyLength | null>;

  protected willSetFill(newFill: Color | null, oldFill: Color | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetPlotFill !== void 0) {
      viewController.viewWillSetPlotFill(newFill, oldFill, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetPlotFill !== void 0) {
        viewObserver.viewWillSetPlotFill(newFill, oldFill, this);
      }
    }
  }

  protected onSetFill(newFill: Color | null, oldFill: Color | null): void {
    // hook
  }

  protected didSetFill(newFill: Color | null, oldFill: Color | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetPlotFill !== void 0) {
        viewObserver.viewDidSetPlotFill(newFill, oldFill, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetPlotFill !== void 0) {
      viewController.viewDidSetPlotFill(newFill, oldFill, this);
    }
  }

  @ViewAnimator<BubblePlotView<X, Y>, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    look: Look.accentColor,
    willSetValue(newFill: Color | null, oldFill: Color | null): void {
      this.owner.willSetFill(newFill, oldFill);
    },
    didSetValue(newFill: Color | null, oldFill: Color | null): void {
      this.owner.onSetFill(newFill, oldFill);
      this.owner.didSetFill(newFill, oldFill);
    },
  })
  readonly fill!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Color, state: null})
  readonly stroke!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Length, state: null})
  readonly strokeWidth!: ViewAnimator<this, Length | null, AnyLength | null>;

  protected renderPlot(context: CanvasContext, frame: R2Box): void {
    const size = Math.min(frame.width, frame.height);
    const radius = this.radius.getValueOr(Length.zero());
    const fill = this.fill.value;
    const stroke = this.stroke.value;
    const strokeWidth = this.strokeWidth.value;

    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const p = dataPointFasteners[i]!.view!;
      context.beginPath();
      const r = p.radius.getValueOr(radius).pxValue(size);
      context.arc(p.xCoord, p.yCoord, r, 0, 2 * Math.PI);
      let fillColor = p.color.getValueOr(fill);
      if (fillColor !== null) {
        const opacity = p.opacity.value;
        if (opacity !== void 0) {
          fillColor = fillColor.alpha(opacity);
        }
        context.fillStyle = fillColor.toString();
        context.fill();
      }
      if (stroke !== null) {
        if (strokeWidth !== null) {
          context.lineWidth = strokeWidth.pxValue(size);
        }
        context.strokeStyle = stroke.toString();
        context.stroke();
      }
    }
  }

  static override create<X, Y>(): BubblePlotView<X, Y> {
    return new BubblePlotView<X, Y>();
  }

  static override fromInit<X, Y>(init: BubblePlotViewInit<X, Y>): BubblePlotView<X, Y> {
    const view = new BubblePlotView<X, Y>();
    view.initView(init);
    return view;
  }

  static override fromAny<X, Y>(value: AnyBubblePlotView<X, Y>): BubblePlotView<X, Y> {
    if (value instanceof BubblePlotView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
