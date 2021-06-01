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

import {Equals, Values} from "@swim/util";
import {Domain, Range, AnyTiming, LinearRange, ContinuousScale} from "@swim/mapping";
import type {R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ViewContextType, ViewFlags, View, ViewProperty, ViewAnimator, ViewFastener} from "@swim/view";
import {GraphicsView, GraphicsViewController, LayerView, CanvasContext, CanvasRenderer} from "@swim/graphics";
import {AnyDataPointView, DataPointView} from "../data/DataPointView";
import {ContinuousScaleAnimator} from "../scaled/ContinuousScaleAnimator";
import type {PlotViewInit, PlotView} from "./PlotView";
import type {ScatterPlotViewObserver} from "./ScatterPlotViewObserver";
import {BubblePlotView} from "../"; // forward import

export type ScatterPlotType = "bubble";

export type AnyScatterPlotView<X, Y> = ScatterPlotView<X, Y> | ScatterPlotViewInit<X, Y> | ScatterPlotType;

export interface ScatterPlotViewInit<X, Y> extends PlotViewInit<X, Y> {
  plotType?: ScatterPlotType;
}

export abstract class ScatterPlotView<X, Y> extends LayerView implements PlotView<X, Y> {
  constructor() {
    super();
    Object.defineProperty(this, "dataPointFasteners", {
      value: [],
      enumerable: true,
    });
    Object.defineProperty(this, "xDataDomain", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "yDataDomain", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "xDataRange", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "yDataRange", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  override initView(init: ScatterPlotViewInit<X, Y>): void {
    super.initView(init);
    if (init.xScale !== void 0) {
      this.xScale(init.xScale);
    }
    if (init.yScale !== void 0) {
      this.yScale(init.yScale);
    }

    const data = init.data;
    if (data !== void 0) {
      for (let i = 0, n = data.length; i < n; i += 1) {
        this.insertDataPoint(data[i]!);
      }
    }

    if (init.font !== void 0) {
      this.font(init.font);
    }
    if (init.textColor !== void 0) {
      this.textColor(init.textColor);
    }
  }

  override readonly viewController!: GraphicsViewController<ScatterPlotView<X, Y>> & ScatterPlotViewObserver<X, Y> | null;

  override readonly viewObservers!: ReadonlyArray<ScatterPlotViewObserver<X, Y>>;

  abstract readonly plotType: ScatterPlotType;

  @ViewAnimator({type: Font, state: null, inherit: true})
  readonly font!: ViewAnimator<this, Font | null, AnyFont | null>;

  @ViewAnimator({type: Color, state: null, inherit: true})
  readonly textColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  protected willSetXScale(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetXScale !== void 0) {
      viewController.viewWillSetXScale(newXScale, oldXScale, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetXScale !== void 0) {
        viewObserver.viewWillSetXScale(newXScale, oldXScale, this);
      }
    }
  }

  protected onSetXScale(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
    this.updateXDataRange();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetXScale(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetXScale !== void 0) {
        viewObserver.viewDidSetXScale(newXScale, oldXScale, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetXScale !== void 0) {
      viewController.viewDidSetXScale(newXScale, oldXScale, this);
    }
  }

  @ViewAnimator<ScatterPlotView<X, Y>, ContinuousScale<X, number> | null>({
    extends: ContinuousScaleAnimator,
    type: ContinuousScale,
    inherit: true,
    state: null,
    willSetValue(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
      this.owner.willSetXScale(newXScale, oldXScale);
    },
    didSetValue(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
      this.owner.onSetXScale(newXScale, oldXScale);
      this.owner.didSetXScale(newXScale, oldXScale);
    },
  })
  readonly xScale!: ContinuousScaleAnimator<this, X, number>;

  protected willSetYScale(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetYScale !== void 0) {
      viewController.viewWillSetYScale(newYScale, oldYScale, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetYScale !== void 0) {
        viewObserver.viewWillSetYScale(newYScale, oldYScale, this);
      }
    }
  }

  protected onSetYScale(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
    this.updateYDataRange();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetYScale(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetYScale !== void 0) {
        viewObserver.viewDidSetYScale(newYScale, oldYScale, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetYScale !== void 0) {
      viewController.viewDidSetYScale(newYScale, oldYScale, this);
    }
  }

  @ViewAnimator<ScatterPlotView<X, Y>, ContinuousScale<Y, number> | null>({
    extends: ContinuousScaleAnimator,
    type: ContinuousScale,
    inherit: true,
    state: null,
    willSetValue(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
      this.owner.willSetYScale(newYScale, oldYScale);
    },
    didSetValue(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
      this.owner.onSetYScale(newYScale, oldYScale);
      this.owner.didSetYScale(newYScale, oldYScale);
    },
  })
  readonly yScale!: ContinuousScaleAnimator<this, Y, number>;

  xDomain(): Domain<X> | null;
  xDomain(xDomain: Domain<X> | string | null, timing?: AnyTiming | boolean): this;
  xDomain(xMin: X, xMax: X, timing?: AnyTiming | boolean): this;
  xDomain(xMin?: Domain<X> | X | string | null, xMax?: X | AnyTiming | boolean,
          timing?: AnyTiming | boolean): Domain<X> | null | this {
    if (arguments.length === 0) {
      const xScale = this.xScale.value;
      return xScale !== null ? xScale.domain : null;
    } else {
      this.xScale.setDomain(xMin as any, xMax as any, timing);
      return this;
    }
  }

  yDomain(): Domain<Y> | null;
  yDomain(yDomain: Domain<Y> | string | null, timing?: AnyTiming | boolean): this;
  yDomain(yMin: Y, yMax: Y, timing: AnyTiming | boolean): this;
  yDomain(yMin?: Domain<Y> | Y | string | null, yMax?: Y | AnyTiming | boolean,
          timing?: AnyTiming | boolean): Domain<Y> | null | this {
    if (arguments.length === 0) {
      const yScale = this.yScale.value;
      return yScale !== null ? yScale.domain : null;
    } else {
      this.yScale.setDomain(yMin as any, yMax as any, timing);
      return this;
    }
  }

  xRange(): Range<number> | null {
    const xScale = this.xScale.value;
    return xScale !== null ? xScale.range : null;
  }

  yRange(): Range<number> | null {
    const yScale = this.yScale.value;
    return yScale !== null ? yScale.range : null;
  }

  protected willSetXRangePadding(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetXRangePadding !== void 0) {
      viewController.viewWillSetXRangePadding(newXRangePadding, oldXRangePadding, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetXRangePadding !== void 0) {
        viewObserver.viewWillSetXRangePadding(newXRangePadding, oldXRangePadding, this);
      }
    }
  }

  protected onSetXRangePadding(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
    // hook
  }

  protected didSetXRangePadding(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetXRangePadding !== void 0) {
        viewObserver.viewDidSetXRangePadding(newXRangePadding, oldXRangePadding, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetXRangePadding !== void 0) {
      viewController.viewDidSetXRangePadding(newXRangePadding, oldXRangePadding, this);
    }
  }

  @ViewProperty<ScatterPlotView<X, Y>, readonly [number, number]>({
    initState(): readonly [number, number] {
      return [0, 0];
    },
    willSetState(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
      this.owner.willSetXRangePadding(newXRangePadding, oldXRangePadding);
    },
    didSetState(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
      this.owner.onSetXRangePadding(newXRangePadding, oldXRangePadding);
      this.owner.didSetXRangePadding(newXRangePadding, oldXRangePadding);
    },
  })
  readonly xRangePadding!: ViewProperty<this, readonly [number, number]>

  protected willSetYRangePadding(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetYRangePadding !== void 0) {
      viewController.viewWillSetYRangePadding(newYRangePadding, oldYRangePadding, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetYRangePadding !== void 0) {
        viewObserver.viewWillSetYRangePadding(newYRangePadding, oldYRangePadding, this);
      }
    }
  }

  protected onSetYRangePadding(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
    // hook
  }

  protected didSetYRangePadding(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetYRangePadding !== void 0) {
        viewObserver.viewDidSetYRangePadding(newYRangePadding, oldYRangePadding, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetYRangePadding !== void 0) {
      viewController.viewDidSetYRangePadding(newYRangePadding, oldYRangePadding, this);
    }
  }

  @ViewProperty<ScatterPlotView<X, Y>, readonly [number, number]>({
    initState(): readonly [number, number] {
      return [0, 0];
    },
    willSetState(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
      this.owner.willSetYRangePadding(newYRangePadding, oldYRangePadding);
    },
    didSetState(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
      this.owner.onSetYRangePadding(newYRangePadding, oldYRangePadding);
      this.owner.didSetYRangePadding(newYRangePadding, oldYRangePadding);
    },
  })
  readonly yRangePadding!: ViewProperty<this, readonly [number, number]>

  readonly xDataDomain!: Domain<X> | null;

  protected setXDataDomain(newXDataDomain: Domain<X> | null): void {
    const oldXDataDomain = this.xDataDomain;
    if (!Equals(newXDataDomain, oldXDataDomain)) {
      this.willSetXDataDomain(newXDataDomain, oldXDataDomain);
      Object.defineProperty(this, "xDataDomain", {
        value: newXDataDomain,
        enumerable: true,
        configurable: true,
      });
      this.onSetXDataDomain(newXDataDomain, oldXDataDomain);
      this.didSetXDataDomain(newXDataDomain, oldXDataDomain);
    }
  }

  protected willSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetXDataDomain !== void 0) {
      viewController.viewWillSetXDataDomain(newXDataDomain, oldXDataDomain, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetXDataDomain !== void 0) {
        viewObserver.viewWillSetXDataDomain(newXDataDomain, oldXDataDomain, this);
      }
    }
  }

  protected onSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    this.updateXDataRange();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetXDataDomain !== void 0) {
        viewObserver.viewDidSetXDataDomain(newXDataDomain, oldXDataDomain, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetXDataDomain !== void 0) {
      viewController.viewDidSetXDataDomain(newXDataDomain, oldXDataDomain, this);
    }
  }

  protected updateXDataDomain(dataPointView: DataPointView<X, Y>): void {
    const x: X = dataPointView.x.getValue();
    let xDataDomain = this.xDataDomain;
    if (xDataDomain === null) {
      xDataDomain = Domain(x, x);
    } else {
      if (Values.compare(x, xDataDomain[0]) < 0) {
        xDataDomain = Domain(x, xDataDomain[1]);
      } else if (Values.compare(xDataDomain[1], x) < 0) {
        xDataDomain = Domain(xDataDomain[0], x);
      }
    }
    this.setXDataDomain(xDataDomain);
  }

  readonly yDataDomain!: Domain<Y> | null;

  protected setYDataDomain(newYDataDomain: Domain<Y> | null): void {
    const oldYDataDomain = this.yDataDomain;
    if (!Equals(newYDataDomain, oldYDataDomain)) {
      this.willSetYDataDomain(newYDataDomain, oldYDataDomain);
      Object.defineProperty(this, "yDataDomain", {
        value: newYDataDomain,
        enumerable: true,
        configurable: true,
      });
      this.onSetYDataDomain(newYDataDomain, oldYDataDomain);
      this.didSetYDataDomain(newYDataDomain, oldYDataDomain);
    }
  }

  protected willSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetYDataDomain !== void 0) {
      viewController.viewWillSetYDataDomain(newYDataDomain, oldYDataDomain, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetYDataDomain !== void 0) {
        viewObserver.viewWillSetYDataDomain(newYDataDomain, oldYDataDomain, this);
      }
    }
  }

  protected onSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    this.updateYDataRange();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetYDataDomain !== void 0) {
        viewObserver.viewDidSetYDataDomain(newYDataDomain, oldYDataDomain, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetYDataDomain !== void 0) {
      viewController.viewDidSetYDataDomain(newYDataDomain, oldYDataDomain, this);
    }
  }

  protected updateYDataDomain(dataPointView: DataPointView<X, Y>): void {
    const y = dataPointView.y.value;
    const y2 = dataPointView.y2.value;
    let yDataDomain = this.yDataDomain;
    if (yDataDomain === null) {
      yDataDomain = Domain(y, y);
    } else {
      if (Values.compare(y, yDataDomain[0]) < 0) {
        yDataDomain = Domain(y, yDataDomain[1]);
      } else if (Values.compare(yDataDomain[1], y) < 0) {
        yDataDomain = Domain(yDataDomain[0], y);
      }
      if (y2 !== void 0) {
        if (Values.compare(y2, yDataDomain[0]) < 0) {
          yDataDomain = Domain(y2, yDataDomain[1]);
        } else if (Values.compare(yDataDomain[1], y2) < 0) {
          yDataDomain = Domain(yDataDomain[0], y2);
        }
      }
    }
    this.setYDataDomain(yDataDomain);
  }

  readonly xDataRange!: Range<number> | null;

  protected setXDataRange(xDataRange: Range<number> | null): void {
    Object.defineProperty(this, "xDataRange", {
      value: xDataRange,
      enumerable: true,
      configurable: true,
    });
  }

  protected updateXDataRange(): void {
    const xDataDomain = this.xDataDomain;
    if (xDataDomain !== null) {
      const xScale = this.xScale.value;
      if (xScale !== null) {
        this.setXDataRange(LinearRange(xScale(xDataDomain[0]), xScale(xDataDomain[1])));
      } else {
        this.setXDataRange(null);
      }
    }
  }

  readonly yDataRange!: Range<number> | null;

  protected setYDataRange(yDataRange: Range<number> | null): void {
    Object.defineProperty(this, "yDataRange", {
      value: yDataRange,
      enumerable: true,
      configurable: true,
    });
  }

  protected updateYDataRange(): void {
    const yDataDomain = this.yDataDomain;
    if (yDataDomain !== null) {
      const yScale = this.yScale.value;
      if (yScale !== null) {
        this.setYDataRange(LinearRange(yScale(yDataDomain[0]), yScale(yDataDomain[1])));
      } else {
        this.setYDataRange(null);
      }
    }
  }

  insertDataPoint(dataPointView: AnyDataPointView<X, Y>, targetView: View | null = null): void {
    dataPointView = DataPointView.fromAny(dataPointView);
    const dataPointFasteners = this.dataPointFasteners as ViewFastener<this, DataPointView<X, Y>>[];
    let targetIndex = dataPointFasteners.length;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      if (dataPointFastener.view === dataPointView) {
        return;
      } else if (dataPointFastener.view === targetView) {
        targetIndex = i;
      }
    }
    const dataPointFastener = this.createDataPointFastener(dataPointView);
    dataPointFasteners.splice(targetIndex, 0, dataPointFastener);
    dataPointFastener.setView(dataPointView, targetView);
    if (this.isMounted()) {
      dataPointFastener.mount();
    }
  }

  insertDataPoints(...dataPointViews: AnyDataPointView<X, Y>[]): void {
    for (let i = 0, n = dataPointViews.length; i < n; i += 1) {
      this.insertDataPoint(dataPointViews[i]!);
    }
  }

  removeDataPoint(dataPointView: DataPointView<X, Y>): void {
    const dataPointFasteners = this.dataPointFasteners as ViewFastener<this, DataPointView<X, Y>>[];
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      if (dataPointFastener.view === dataPointView) {
        dataPointFastener.setView(null);
        if (this.isMounted()) {
          dataPointFastener.unmount();
        }
        dataPointFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initDataPoint(dataPointView: DataPointView<X, Y>, dataPointFastener: ViewFastener<this, DataPointView<X, Y>>): void {
    const labelView = dataPointView.label.view;
    if (labelView !== null) {
      this.initDataPointLabel(labelView, dataPointView, dataPointFastener);
    }
  }

  protected attachDataPoint(dataPointView: DataPointView<X, Y>, dataPointFastener: ViewFastener<this, DataPointView<X, Y>>): void {
    this.updateXDataDomain(dataPointView);
    this.updateYDataDomain(dataPointView);
  }

  protected detachDataPoint(dataPointView: DataPointView<X, Y>, dataPointFastener: ViewFastener<this, DataPointView<X, Y>>): void {
    // xDataDomain and yDataDomain will be recomputed next layout pass
  }

  protected willSetDataPoint(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null,
                             targetView: View | null, dataPointFastener: ViewFastener<this, DataPointView<X, Y>>): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetDataPoint !== void 0) {
      viewController.viewWillSetDataPoint(newDataPointView, oldDataPointView, targetView, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetDataPoint !== void 0) {
        viewObserver.viewWillSetDataPoint(newDataPointView, oldDataPointView, targetView, this);
      }
    }
  }

  protected onSetDataPoint(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null,
                           targetView: View | null, dataPointFastener: ViewFastener<this, DataPointView<X, Y>>): void {
    if (oldDataPointView !== null) {
      this.detachDataPoint(oldDataPointView, dataPointFastener);
    }
    if (newDataPointView !== null) {
      this.attachDataPoint(newDataPointView, dataPointFastener);
      this.initDataPoint(newDataPointView, dataPointFastener);
    }
  }

  protected didSetDataPoint(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null,
                            targetView: View | null, dataPointFastener: ViewFastener<this, DataPointView<X, Y>>): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetDataPoint !== void 0) {
        viewObserver.viewDidSetDataPoint(newDataPointView, oldDataPointView, targetView, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetDataPoint !== void 0) {
      viewController.viewDidSetDataPoint(newDataPointView, oldDataPointView, targetView, this);
    }
  }

  protected onSetDataPointX(newX: X | undefined, oldX: X | undefined, dataPointView: DataPointView<X, Y>,
                            dataPointFastener: ViewFastener<this, DataPointView<X, Y>>): void {
    this.updateXDataDomain(dataPointView);
    this.requireUpdate(View.NeedsLayout);
  }

  protected onSetDataPointY(newY: Y | undefined, oldY: Y | undefined, dataPointView: DataPointView<X, Y>,
                            dataPointFastener: ViewFastener<this, DataPointView<X, Y>>): void {
    this.updateYDataDomain(dataPointView);
    this.requireUpdate(View.NeedsLayout);
  }

  protected onSetDataPointY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointView: DataPointView<X, Y>,
                             dataPointFastener: ViewFastener<this, DataPointView<X, Y>>): void {
    this.updateYDataDomain(dataPointView);
    this.requireUpdate(View.NeedsLayout);
  }

  protected initDataPointLabel(labelView: GraphicsView, dataPointView: DataPointView<X, Y>,
                               dataPointFastener: ViewFastener<this, DataPointView<X, Y>>): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected onSetDataPointLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointView: DataPointView<X, Y>,
                                dataPointFastener: ViewFastener<this, DataPointView<X, Y>>): void {
    if (newLabelView !== null) {
      this.initDataPointLabel(newLabelView, dataPointView, dataPointFastener);
    }
  }

  /** @hidden */
  static DataPointFastener = ViewFastener.define<ScatterPlotView<unknown, unknown>, DataPointView<unknown, unknown>>({
    child: false,
    observe: true,
    willSetView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null, targetView: View | null): void {
      this.owner.willSetDataPoint(newDataPointView, oldDataPointView, targetView, this);
    },
    onSetView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null, targetView: View | null): void {
      this.owner.onSetDataPoint(newDataPointView, oldDataPointView, targetView, this);
    },
    didSetView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null, targetView: View | null): void {
      this.owner.didSetDataPoint(newDataPointView, oldDataPointView, targetView, this);
    },
    viewDidSetDataPointX(newX: unknown | undefined, oldX: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetDataPointX(newX, oldX, dataPointView, this);
    },
    viewDidSetDataPointY(newY: unknown | undefined, oldY: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetDataPointY(newY, oldY, dataPointView, this);
    },
    viewDidSetDataPointY2(newY2: unknown | undefined, oldY2: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetDataPointY2(newY2, oldY2, dataPointView, this);
    },
    viewDidSetDataPointLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetDataPointLabel(newLabelView, oldLabelView, dataPointView, this);
    },
  });

  protected createDataPointFastener(dataPointView: DataPointView<X, Y>): ViewFastener<this, DataPointView<X, Y>> {
    return new ScatterPlotView.DataPointFastener(this as ScatterPlotView<unknown, unknown>, dataPointView.key, "dataPoint") as ViewFastener<this, DataPointView<X, Y>>;
  }

  /** @hidden */
  readonly dataPointFasteners!: ReadonlyArray<ViewFastener<this, DataPointView<X, Y>>>;

  /** @hidden */
  protected mountDataPointFasteners(): void {
    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      dataPointFastener.mount();
    }
  }

  /** @hidden */
  protected unmountDataPointFasteners(): void {
    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointFastener = dataPointFasteners[i]!;
      dataPointFastener.unmount();
    }
  }

  protected detectDataPoint(view: View): DataPointView<X, Y> | null {
    return view instanceof DataPointView ? view : null;
  }

  protected override onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    const dataPointView = this.detectDataPoint(childView);
    if (dataPointView !== null) {
      this.insertDataPoint(dataPointView, targetView);
    }
  }

  protected override onRemoveChildView(childView: View): void {
    super.onRemoveChildView(childView);
    const dataPointView = this.detectDataPoint(childView);
    if (dataPointView !== null) {
      this.removeDataPoint(dataPointView);
    }
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.xScale.onAnimate(viewContext.updateTime);
    this.yScale.onAnimate(viewContext.updateTime);
    this.resizeScales(this.viewFrame);
  }

  /**
   * Updates own scale ranges to project onto view frame.
   */
  protected resizeScales(frame: R2Box): void {
    const xScale = !this.xScale.isInherited() ? this.xScale.ownValue : null;
    if (xScale !== null && xScale.range[1] !== frame.width) {
      this.xScale.setRange(0, frame.width);
    }
    const yScale = !this.yScale.isInherited() ? this.yScale.ownValue : null;
    if (yScale !== null && yScale.range[1] !== frame.height) {
      this.yScale.setRange(0, frame.height);
    }
  }

  protected override displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                       displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                          viewContext: ViewContextType<this>) => void): void {
    let xScale: ContinuousScale<X, number> | null;
    let yScale: ContinuousScale<Y, number> | null;
    if ((displayFlags & View.NeedsLayout) !== 0 &&
        (xScale = this.xScale.value, xScale !== null) &&
        (yScale = this.yScale.value, yScale !== null)) {
      this.layoutChildViews(xScale, yScale, displayFlags, viewContext, displayChildView);
    } else {
      super.displayChildViews(displayFlags, viewContext, displayChildView);
    }
  }

  protected layoutChildViews(xScale: ContinuousScale<X, number>,
                             yScale: ContinuousScale<Y, number>,
                             displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                             displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                viewContext: ViewContextType<this>) => void): void {
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
    function layoutChildView(this: self, point1: View, displayFlags: ViewFlags,
                             viewContext: ViewContextType<self>): void {
      if (point1 instanceof DataPointView) {
        const x1 = point1.x.getValue();
        const y1 = point1.y.getValue();
        const dy1 = point1.y2.value;
        const r1 = point1.radius.value;
        const sx1 = xScale(x1);
        const sy1 = yScale(y1);
        point1.setXCoord(frame.xMin + sx1);
        point1.setYCoord(frame.yMin + sy1);

        if (point0 !== null) {
          // update extrema
          if (Values.compare(x1, xDataDomainMin) < 0) {
            xDataDomainMin = x1
          } else if (Values.compare(xDataDomainMax, x1) < 0) {
            xDataDomainMax = x1;
          }
          if (Values.compare(y1, yDataDomainMin) < 0) {
            yDataDomainMin = y1
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
        } else {
          xDataDomainMin = x1;
          xDataDomainMax = x1;
          yDataDomainMin = y1;
          yDataDomainMax = y1;
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

      displayChildView.call(this, point1, displayFlags, viewContext);
    }
    super.displayChildViews(displayFlags, viewContext, layoutChildView);

    this.setXDataDomain(point0 !== null ? Domain<X>(xDataDomainMin!, xDataDomainMax!) : null);
    this.setYDataDomain(point0 !== null ? Domain<Y>(yDataDomainMin!, yDataDomainMax!) : null);
    this.xRangePadding.setState([xRangePaddingMin, xRangePaddingMax], View.Intrinsic);
    this.yRangePadding.setState([yRangePaddingMin, yRangePaddingMax], View.Intrinsic);
  }

  protected override didRender(viewContext: ViewContextType<this>): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      this.renderPlot(context, this.viewFrame);
    }
    super.didRender(viewContext);
  }

  protected abstract renderPlot(context: CanvasContext, frame: R2Box): void;

  /** @hidden */
  protected override mountViewFasteners(): void {
    super.mountViewFasteners();
    this.mountDataPointFasteners();
  }

  /** @hidden */
  protected override unmountViewFasteners(): void {
    this.unmountDataPointFasteners();
    super.unmountViewFasteners();
  }

  static fromType<X, Y>(type: ScatterPlotType): ScatterPlotView<X, Y> {
    if (type === "bubble") {
      return new BubblePlotView();
    }
    throw new TypeError("" + type);
  }

  static fromInit<X, Y>(init: ScatterPlotViewInit<X, Y>): ScatterPlotView<X, Y> {
    const type = init.plotType;
    if (type === "bubble") {
      return BubblePlotView.fromInit(init);
    }
    throw new TypeError("" + init);
  }

  static fromAny<X, Y>(value: AnyScatterPlotView<X, Y>): ScatterPlotView<X, Y> {
    if (value instanceof ScatterPlotView) {
      return value;
    } else if (typeof value === "string") {
      return this.fromType(value);
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
