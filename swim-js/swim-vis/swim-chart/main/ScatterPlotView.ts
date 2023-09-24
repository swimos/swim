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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import {Equals} from "@swim/util";
import {Values} from "@swim/util";
import type {Domain} from "@swim/util";
import type {Range} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {LinearRange} from "@swim/util";
import type {ContinuousScale} from "@swim/util";
import type {Observes} from "@swim/util";
import {Property} from "@swim/component";
import type {R2Box} from "@swim/math";
import {Font} from "@swim/style";
import {Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewSet} from "@swim/view";
import {GraphicsView} from "@swim/graphics";
import type {CanvasContext} from "@swim/graphics";
import {CanvasRenderer} from "@swim/graphics";
import {DataPointView} from "./DataPointView";
import {ContinuousScaleAnimator} from "./ContinuousScaleAnimator";
import type {PlotViewObserver} from "./PlotView";
import type {PlotView} from "./PlotView";

/** @public */
export interface ScatterPlotViewObserver<X = unknown, Y = unknown, V extends ScatterPlotView<X, Y> = ScatterPlotView<X, Y>> extends PlotViewObserver<X, Y, V> {
}

/** @public */
export abstract class ScatterPlotView<X = unknown, Y = unknown> extends GraphicsView implements PlotView<X, Y> {
  constructor() {
    super();
    this.xDataDomain = null;
    this.yDataDomain = null;
    this.xDataRange = null;
    this.yDataRange = null;
  }

  declare readonly observerType?: Class<ScatterPlotViewObserver<X, Y>>;

  @ThemeAnimator({
    valueType: Number,
    updateFlags: View.NeedsRender,
    didSetValue(opacity: number | undefined): void {
      this.owner.callObservers("viewDidSetOpacity", opacity, this.owner);
    },
  })
  readonly opacity!: ThemeAnimator<this, number | undefined>;

  @ThemeAnimator({valueType: Font, value: null, inherits: true})
  readonly font!: ThemeAnimator<this, Font | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true})
  readonly textColor!: ThemeAnimator<this, Color | null>;

  /** @override */
  @ContinuousScaleAnimator({
    value: null,
    inherits: true,
    updateFlags: View.NeedsLayout,
    didSetValue(xScale: ContinuousScale<X, number> | null): void {
      this.owner.updateXDataRange();
      this.owner.callObservers("viewDidSetXScale", xScale, this.owner);
    },
  })
  readonly xScale!: ContinuousScaleAnimator<this, X, number>;

  /** @override */
  @ContinuousScaleAnimator({
    value: null,
    inherits: true,
    updateFlags: View.NeedsLayout,
    didSetValue(yScale: ContinuousScale<Y, number> | null): void {
      this.owner.updateYDataRange();
      this.owner.callObservers("viewDidSetYScale", yScale, this.owner);
    },
  })
  readonly yScale!: ContinuousScaleAnimator<this, Y, number>;

  /** @override */
  xDomain(): Domain<X> | null;
  xDomain(xDomain: Domain<X> | string | null, timing?: TimingLike | boolean): this;
  xDomain(xMin: X, xMax: X, timing?: TimingLike | boolean): this;
  xDomain(xMin?: Domain<X> | X | string | null, xMax?: X | TimingLike | boolean,
          timing?: TimingLike | boolean): Domain<X> | null | this {
    if (arguments.length === 0) {
      const xScale = this.xScale.value;
      return xScale !== null ? xScale.domain : null;
    } else {
      this.xScale.setDomain(xMin as any, xMax as any, timing);
      return this;
    }
  }

  /** @override */
  yDomain(): Domain<Y> | null;
  yDomain(yDomain: Domain<Y> | string | null, timing?: TimingLike | boolean): this;
  yDomain(yMin: Y, yMax: Y, timing: TimingLike | boolean): this;
  yDomain(yMin?: Domain<Y> | Y | string | null, yMax?: Y | TimingLike | boolean,
          timing?: TimingLike | boolean): Domain<Y> | null | this {
    if (arguments.length === 0) {
      const yScale = this.yScale.value;
      return yScale !== null ? yScale.domain : null;
    } else {
      this.yScale.setDomain(yMin as any, yMax as any, timing);
      return this;
    }
  }

  /** @override */
  xRange(): Range<number> | null {
    const xScale = this.xScale.value;
    return xScale !== null ? xScale.range : null;
  }

  /** @override */
  yRange(): Range<number> | null {
    const yScale = this.yScale.value;
    return yScale !== null ? yScale.range : null;
  }

  /** @override */
  @Property({
    initValue(): readonly [number, number] {
      return [0, 0];
    },
    didSetValue(xRangePadding: readonly [number, number]): void {
      this.owner.callObservers("viewDidSetXRangePadding", xRangePadding, this.owner);
    },
  })
  readonly xRangePadding!: Property<this, readonly [number, number]>;

  /** @override */
  @Property({
    initValue(): readonly [number, number] {
      return [0, 0];
    },
    didSetValue(yRangePadding: readonly [number, number]): void {
      this.owner.callObservers("viewDidSetYRangePadding", yRangePadding, this.owner);
    },
  })
  readonly yRangePadding!: Property<this, readonly [number, number]>;

  /** @override */
  readonly xDataDomain: Domain<X> | null;

  protected setXDataDomain(newXDataDomain: Domain<X> | null): void {
    const oldXDataDomain = this.xDataDomain;
    if (Equals(newXDataDomain, oldXDataDomain)) {
      return;
    }
    this.willSetXDataDomain(newXDataDomain, oldXDataDomain);
    (this as Mutable<this>).xDataDomain = newXDataDomain;
    this.onSetXDataDomain(newXDataDomain, oldXDataDomain);
    this.didSetXDataDomain(newXDataDomain, oldXDataDomain);
  }

  protected willSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    // hook
  }

  protected onSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    this.updateXDataRange();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    this.callObservers("viewDidSetXDataDomain", newXDataDomain, this);
  }

  protected updateXDataDomain(dataPointView: DataPointView<X, Y>): void {
    const x: X = dataPointView.x.getValue();
    let xDataDomain = this.xDataDomain;
    if (xDataDomain === null) {
      xDataDomain = this.xScale.createDomain(x, x);
    } else {
      if (Values.compare(x, xDataDomain[0]) < 0) {
        xDataDomain = this.xScale.createDomain(x, xDataDomain[1]);
      } else if (Values.compare(xDataDomain[1], x) < 0) {
        xDataDomain = this.xScale.createDomain(xDataDomain[0], x);
      }
    }
    this.setXDataDomain(xDataDomain);
  }

  /** @override */
  readonly yDataDomain: Domain<Y> | null;

  protected setYDataDomain(newYDataDomain: Domain<Y> | null): void {
    const oldYDataDomain = this.yDataDomain;
    if (Equals(newYDataDomain, oldYDataDomain)) {
      return;
    }
    this.willSetYDataDomain(newYDataDomain, oldYDataDomain);
    (this as Mutable<this>).yDataDomain = newYDataDomain;
    this.onSetYDataDomain(newYDataDomain, oldYDataDomain);
    this.didSetYDataDomain(newYDataDomain, oldYDataDomain);
  }

  protected willSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    // hook
  }

  protected onSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    this.updateYDataRange();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    this.callObservers("viewDidSetYDataDomain", newYDataDomain, this);
  }

  protected updateYDataDomain(dataPointView: DataPointView<X, Y>): void {
    const y = dataPointView.y.value as Y;
    const y2 = dataPointView.y2.value;
    let yDataDomain = this.yDataDomain;
    if (yDataDomain === null) {
      yDataDomain = this.yScale.createDomain(y, y);
    } else {
      if (Values.compare(y, yDataDomain[0]) < 0) {
        yDataDomain = this.yScale.createDomain(y, yDataDomain[1]);
      } else if (Values.compare(yDataDomain[1], y) < 0) {
        yDataDomain = this.yScale.createDomain(yDataDomain[0], y);
      }
      if (y2 !== void 0) {
        if (Values.compare(y2, yDataDomain[0]) < 0) {
          yDataDomain = this.yScale.createDomain(y2, yDataDomain[1]);
        } else if (Values.compare(yDataDomain[1], y2) < 0) {
          yDataDomain = this.yScale.createDomain(yDataDomain[0], y2);
        }
      }
    }
    this.setYDataDomain(yDataDomain);
  }

  /** @override */
  readonly xDataRange: Range<number> | null;

  protected setXDataRange(xDataRange: Range<number> | null): void {
    (this as Mutable<this>).xDataRange = xDataRange;
  }

  protected updateXDataRange(): void {
    const xDataDomain = this.xDataDomain;
    if (xDataDomain === null) {
      return;
    }
    const xScale = this.xScale.value;
    if (xScale !== null) {
      this.setXDataRange(LinearRange(xScale(xDataDomain[0]), xScale(xDataDomain[1])));
    } else {
      this.setXDataRange(null);
    }
  }

  /** @override */
  readonly yDataRange: Range<number> | null;

  protected setYDataRange(yDataRange: Range<number> | null): void {
    (this as Mutable<this>).yDataRange = yDataRange;
  }

  protected updateYDataRange(): void {
    const yDataDomain = this.yDataDomain;
    if (yDataDomain === null) {
      return;
    }
    const yScale = this.yScale.value;
    if (yScale !== null) {
      this.setYDataRange(LinearRange(yScale(yDataDomain[0]), yScale(yDataDomain[1])));
    } else {
      this.setYDataRange(null);
    }
  }

  @ViewSet({
    viewType: DataPointView,
    binds: true,
    observes: true,
    willAttachView(newDataPointView: DataPointView<X, Y>, targetView: View | null): void {
      this.owner.callObservers("viewWillAttachDataPoint", newDataPointView, targetView, this.owner);
    },
    didAttachView(dataPointView: DataPointView<X, Y>): void {
      this.owner.updateXDataDomain(dataPointView);
      this.owner.updateYDataDomain(dataPointView);
      const labelView = dataPointView.label.view;
      if (labelView !== null) {
        this.attachDataPointLabelView(labelView);
      }
    },
    willDetachView(dataPointView: DataPointView<X, Y>): void {
      const labelView = dataPointView.label.view;
      if (labelView !== null) {
        this.detachDataPointLabelView(labelView);
      }
      // xDataDomain and yDataDomain will be recomputed next layout pass
    },
    didDetachView(newDataPointView: DataPointView<X, Y>): void {
      this.owner.callObservers("viewDidDetachDataPoint", newDataPointView, this.owner);
    },
    viewDidSetX(x: X | undefined, dataPointView: DataPointView<X, Y>): void {
      this.owner.updateXDataDomain(dataPointView);
      this.owner.requireUpdate(View.NeedsLayout);
    },
    viewDidSetY(y: Y | undefined, dataPointView: DataPointView<X, Y>): void {
      this.owner.updateYDataDomain(dataPointView);
      this.owner.requireUpdate(View.NeedsLayout);
    },
    viewDidSetY2(y2: Y | undefined, dataPointView: DataPointView<X, Y>): void {
      this.owner.updateYDataDomain(dataPointView);
      this.owner.requireUpdate(View.NeedsLayout);
    },
    viewWillAttachLabel(labelView: GraphicsView): void {
      this.attachDataPointLabelView(labelView);
    },
    viewDidDetachLabel(labelView: GraphicsView): void {
      this.detachDataPointLabelView(labelView);
    },
    attachDataPointLabelView(labelView: GraphicsView): void {
      this.owner.requireUpdate(View.NeedsLayout);
    },
    detachDataPointLabelView(labelView: GraphicsView): void {
      // hook
    },
  })
  readonly dataPoints!: ViewSet<this, DataPointView<X, Y>> & Observes<DataPointView<X, Y>> & {
    attachDataPointLabelView(labelView: GraphicsView): void,
    detachDataPointLabelView(labelView: GraphicsView): void,
  };

  protected override onLayout(): void {
    super.onLayout();
    const updateTime = this.updateTime;
    this.xScale.recohere(updateTime);
    this.yScale.recohere(updateTime);
    this.resizeScales(this.viewFrame);
  }

  /**
   * Updates own scale ranges to project onto view frame.
   */
  protected resizeScales(frame: R2Box): void {
    const xScale = !this.xScale.derived ? this.xScale.value : null;
    if (xScale !== null && xScale.range[1] !== frame.width) {
      this.xScale.setRange(0, frame.width);
    }
    const yScale = !this.yScale.derived ? this.yScale.value : null;
    if (yScale !== null && yScale.range[1] !== frame.height) {
      this.yScale.setRange(0, frame.height);
    }
  }

  protected override displayChildren(displayFlags: ViewFlags, displayChild: (this: this, childView: View, displayFlags: ViewFlags) => void): void {
    let xScale: ContinuousScale<X, number> | null;
    let yScale: ContinuousScale<Y, number> | null;
    if ((displayFlags & View.NeedsLayout) !== 0 &&
        (xScale = this.xScale.value, xScale !== null) &&
        (yScale = this.yScale.value, yScale !== null)) {
      this.layoutChildren(xScale, yScale, displayFlags, displayChild);
    } else {
      super.displayChildren(displayFlags, displayChild);
    }
  }

  protected layoutChildren(xScale: ContinuousScale<X, number>, yScale: ContinuousScale<Y, number>,
                           displayFlags: ViewFlags, displayChild: (this: this, childView: View, displayFlags: ViewFlags) => void): void {
    // Recompute extrema when laying out child views.
    const frame = this.viewFrame;
    const size = Math.min(frame.width, frame.height);
    let xDataDomainMin: X | undefined;
    let xDataDomainMax: X | undefined;
    let yDataDomainMin: Y | undefined;
    let yDataDomainMax: Y | undefined;
    let xRangePaddingMin = 0;
    let xRangePaddingMax = 0;
    let yRangePaddingMin = 0;
    let yRangePaddingMax = 0;

    let point0 = null as DataPointView<X, Y> | null;
    type self = this;
    function layoutChild(this: self, point1: View, displayFlags: ViewFlags): void {
      if (point1 instanceof DataPointView) {
        const x1 = point1.x.getValue();
        const y1 = point1.y.getValue();
        const dy1 = point1.y2.value;
        const r1 = point1.radius.value;
        const sx1 = xScale(x1);
        const sy1 = yScale(y1);
        point1.setXCoord(frame.xMin + sx1);
        point1.setYCoord(frame.yMin + sy1);

        if (point0 === null) {
          xDataDomainMin = x1;
          xDataDomainMax = x1;
          yDataDomainMin = y1;
          yDataDomainMax = y1;
        } else {
          // update extrema
          if (Values.compare(x1, xDataDomainMin) < 0) {
            xDataDomainMin = x1;
          } else if (Values.compare(xDataDomainMax, x1) < 0) {
            xDataDomainMax = x1;
          }
          if (Values.compare(y1, yDataDomainMin) < 0) {
            yDataDomainMin = y1;
          } else if (Values.compare(yDataDomainMax, y1) < 0) {
            yDataDomainMax = y1;
          }
          if (dy1 !== void 0) {
            if (Values.compare(dy1, yDataDomainMin) < 0) {
              yDataDomainMin = dy1;
            } else if (Values.compare(yDataDomainMax, dy1) < 0) {
              yDataDomainMax = dy1;
            }
          }
        }

        if (r1 !== null) {
          const radius = r1.pxValue(size);
          xRangePaddingMin = Math.max(radius, xRangePaddingMin);
          xRangePaddingMax = Math.max(radius, xRangePaddingMax);
          yRangePaddingMin = Math.max(radius, yRangePaddingMin);
          yRangePaddingMax = Math.max(radius, yRangePaddingMax);
        }
        point0 = point1;
      }

      displayChild.call(this, point1, displayFlags);
    }
    super.displayChildren(displayFlags, layoutChild);

    this.setXDataDomain(point0 !== null ? this.xScale.createDomain(xDataDomainMin!, xDataDomainMax!) : null);
    this.setYDataDomain(point0 !== null ? this.yScale.createDomain(yDataDomainMin!, yDataDomainMax!) : null);
    this.xRangePadding.setIntrinsic([xRangePaddingMin, xRangePaddingMax]);
    this.yRangePadding.setIntrinsic([yRangePaddingMin, yRangePaddingMax]);
  }

  protected override didRender(): void {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer && !this.hidden && !this.culled) {
      this.renderPlot(renderer.context, this.viewFrame);
    }
    super.didRender();
  }

  protected abstract renderPlot(context: CanvasContext, frame: R2Box): void;
}
