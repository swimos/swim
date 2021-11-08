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

import {Mutable, Class, Equals, Values, Domain, Range, AnyTiming, LinearRange, ContinuousScale} from "@swim/util";
import {Affinity, Property, Animator} from "@swim/fastener";
import {BTree} from "@swim/collections";
import type {R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, ViewFlags, AnyView, ViewCreator, View, ViewRef} from "@swim/view";
import {GraphicsView, CanvasContext, CanvasRenderer} from "@swim/graphics";
import type {DataPointCategory} from "../data/DataPoint";
import {AnyDataPointView, DataPointView} from "../data/DataPointView";
import {ContinuousScaleAnimator} from "../scaled/ContinuousScaleAnimator";
import type {PlotViewInit, PlotViewDataPointExt, PlotView} from "./PlotView";
import type {SeriesPlotViewObserver} from "./SeriesPlotViewObserver";

export type SeriesPlotHitMode = "domain" | "plot" | "data" | "none";

export type SeriesPlotType = "line" | "area";

export type AnySeriesPlotView<X = unknown, Y = unknown> = SeriesPlotView<X, Y> | SeriesPlotViewInit<X, Y> | SeriesPlotType;

export interface SeriesPlotViewInit<X = unknown, Y = unknown> extends PlotViewInit<X, Y> {
  plotType?: SeriesPlotType;
  hitMode?: SeriesPlotHitMode;
}

export abstract class SeriesPlotView<X = unknown, Y = unknown> extends GraphicsView implements PlotView<X, Y> {
  constructor() {
    super();
    this.dataPointRefs = new BTree();
    this.xDataDomain = null;
    this.yDataDomain = null;
    this.xDataRange = null;
    this.yDataRange = null;
    this.gradientStops = 0;
  }

  override readonly observerType?: Class<SeriesPlotViewObserver<X, Y>>;

  abstract readonly plotType: SeriesPlotType;

  @ThemeAnimator({type: Font, state: null, inherits: true})
  readonly font!: ThemeAnimator<this, Font | null, AnyFont | null>;

  @ThemeAnimator({type: Color, state: null, inherits: true})
  readonly textColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @Property({type: String, state: "domain"})
  readonly hitMode!: Property<this, SeriesPlotHitMode>;

  @Animator<SeriesPlotView<X, Y>, ContinuousScale<X, number> | null>({
    extends: ContinuousScaleAnimator,
    type: ContinuousScale,
    inherits: true,
    state: null,
    updateFlags: View.NeedsLayout,
    willSetValue(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
      this.owner.callObservers("viewWillSetXScale", newXScale, oldXScale, this.owner);
    },
    didSetValue(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
      this.owner.updateXDataRange();
      this.owner.callObservers("viewDidSetXScale", newXScale, oldXScale, this.owner);
    },
  })
  readonly xScale!: ContinuousScaleAnimator<this, X, number>;

  @Animator<SeriesPlotView<X, Y>, ContinuousScale<Y, number> | null>({
    extends: ContinuousScaleAnimator,
    type: ContinuousScale,
    inherits: true,
    state: null,
    updateFlags: View.NeedsLayout,
    willSetValue(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
      this.owner.callObservers("viewWillSetYScale", newYScale, oldYScale, this.owner);
    },
    didSetValue(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
      this.owner.updateYDataRange();
      this.owner.callObservers("viewDidSetYScale", newYScale, oldYScale, this.owner);
    },
  })
  readonly yScale!: ContinuousScaleAnimator<this, Y, number>;

  xDomain(): Domain<X> | null;
  xDomain(xDomain: Domain<X> | string | null, timing?: AnyTiming | boolean): this;
  xDomain(xMin: X, xMax: X, timing: AnyTiming | boolean): this;
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

  @Property<SeriesPlotView<X, Y>, readonly [number, number]>({
    initState(): readonly [number, number] {
      return [0, 0];
    },
    willSetState(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
      this.owner.callObservers("viewWillSetXRangePadding", newXRangePadding, oldXRangePadding, this.owner);
    },
    didSetState(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
      this.owner.callObservers("viewDidSetXRangePadding", newXRangePadding, oldXRangePadding, this.owner);
    },
  })
  readonly xRangePadding!: Property<this, readonly [number, number]>

  @Property<SeriesPlotView<X, Y>, readonly [number, number]>({
    initState(): readonly [number, number] {
      return [0, 0];
    },
    willSetState(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
      this.owner.callObservers("viewWillSetYRangePadding", newYRangePadding, oldYRangePadding, this.owner);
    },
    didSetState(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
      this.owner.callObservers("viewDidSetYRangePadding", newYRangePadding, oldYRangePadding, this.owner);
    },
  })
  readonly yRangePadding!: Property<this, readonly [number, number]>

  readonly xDataDomain: Domain<X> | null;

  protected setXDataDomain(newXDataDomain: Domain<X> | null): void {
    const oldXDataDomain = this.xDataDomain;
    if (!Equals(newXDataDomain, oldXDataDomain)) {
      this.willSetXDataDomain(newXDataDomain, oldXDataDomain);
      (this as Mutable<this>).xDataDomain = newXDataDomain;
      this.onSetXDataDomain(newXDataDomain, oldXDataDomain);
      this.didSetXDataDomain(newXDataDomain, oldXDataDomain);
    }
  }

  protected willSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    this.callObservers("viewWillSetXDataDomain", newXDataDomain, oldXDataDomain, this);
  }

  protected onSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    this.updateXDataRange();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    this.callObservers("viewDidSetXDataDomain", newXDataDomain, oldXDataDomain, this);
  }

  protected updateXDataDomain(dataPointView: DataPointView<X, Y>): void {
    const dataPointRefs = this.dataPointRefs;
    const xMin = dataPointRefs.firstKey();
    const xMax = dataPointRefs.lastKey();
    let xDataDomain: Domain<X> | null;
    if (xMin !== void 0 && xMax !== void 0) {
      xDataDomain = Domain<X>(xMin, xMax);
    } else {
      const x = dataPointView.x.getValue();
      xDataDomain = Domain<X>(x, x);
    }
    this.setXDataDomain(xDataDomain);
  }

  readonly yDataDomain: Domain<Y> | null;

  protected setYDataDomain(newYDataDomain: Domain<Y> | null): void {
    const oldYDataDomain = this.yDataDomain;
    if (!Equals(newYDataDomain, oldYDataDomain)) {
      this.willSetYDataDomain(newYDataDomain, oldYDataDomain);
      (this as Mutable<this>).yDataDomain = newYDataDomain;
      this.onSetYDataDomain(newYDataDomain, oldYDataDomain);
      this.didSetYDataDomain(newYDataDomain, oldYDataDomain);
    }
  }

  protected willSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    this.callObservers("viewWillSetYDataDomain", newYDataDomain, oldYDataDomain, this);
  }

  protected onSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    this.updateYDataRange();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    this.callObservers("viewDidSetYDataDomain", newYDataDomain, oldYDataDomain, this);
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

  readonly xDataRange: Range<number> | null;

  protected setXDataRange(xDataRange: Range<number> | null): void {
    (this as Mutable<this>).xDataRange = xDataRange;
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

  readonly yDataRange: Range<number> | null;

  protected setYDataRange(yDataRange: Range<number> | null): void {
    (this as Mutable<this>).yDataRange = yDataRange;
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

  /** @internal */
  readonly gradientStops: number;

  insertDataPoint(dataPointView: AnyDataPointView<X, Y>, targetView: View | null = null): DataPointView<X, Y> {
    dataPointView = DataPointView.fromAny(dataPointView as AnyDataPointView) as DataPointView<X, Y>;
    dataPointView.remove();
    const x = dataPointView.x.getState();
    this.removeDataPoint(x);
    const dataPointRef = this.createDataPointRef(dataPointView);
    this.willInsertChild(dataPointView, null);
    this.dataPointRefs.set(x, dataPointRef);
    dataPointRef.setView(dataPointView, targetView);
    dataPointView.attachParent(this);
    this.onInsertChild(dataPointView, null);
    this.didInsertChild(dataPointView, null);
    dataPointView.cascadeInsert();
    if (this.mounted) {
      dataPointRef.mount();
    }
    return dataPointView;
  }

  insertDataPoints(...dataPointViews: AnyDataPointView<X, Y>[]): void {
    for (let i = 0, n = dataPointViews.length; i < n; i += 1) {
      this.insertDataPoint(dataPointViews[i]!);
    }
  }

  removeDataPoint(x: X): void;
  removeDataPoint(dataPointView: DataPointView<X, Y>): void;
  removeDataPoint(x: X | DataPointView<X, Y>): void {
    if (x instanceof DataPointView) {
      x = x.x.getState();
    }
    const dataPointRef = this.dataPointRefs.get(x);
    if (dataPointRef !== void 0) {
      const dataPointView = dataPointRef.view!;
      if (dataPointView.parent !== this) {
        throw new Error("not a child view");
      }
      this.willRemoveChild(dataPointView);
      dataPointView.detachParent(this);
      this.dataPointRefs.delete(x);
      this.onRemoveChild(dataPointView);
      this.didRemoveChild(dataPointView);
      dataPointView.setKey(void 0);
      dataPointRef.setView(null);
      if (this.mounted) {
        dataPointRef.unmount();
      }
    }
  }

  /** @internal */
  static DataPointRef = ViewRef.define<SeriesPlotView, DataPointView, PlotViewDataPointExt>("DataPointRef", {
    observes: true,
    willAttachView(dataPointView: DataPointView, targetView: View | null): void {
      this.owner.callObservers("viewWillAttachDataPoint", dataPointView, targetView, this.owner);
    },
    didAttachView(dataPointView: DataPointView): void {
      this.owner.updateXDataDomain(dataPointView);
      this.owner.updateYDataDomain(dataPointView);
      const labelView = dataPointView.label.view;
      if (labelView !== null) {
        this.attachDataPointLabelView(labelView);
      }
    },
    willDetachView(dataPointView: DataPointView): void {
      const labelView = dataPointView.label.view;
      if (labelView !== null) {
        this.detachDataPointLabelView(labelView);
      }
      this.owner.updateXDataDomain(dataPointView);
      // yDataDomain will be recomputed next layout pass
    },
    didDetachView(dataPointView: DataPointView): void {
      this.owner.callObservers("viewDidDetachDataPoint", dataPointView, this.owner);
    },
    viewDidSetDataPointX(newX: unknown | undefined, oldX: unknown | undefined, dataPointView: DataPointView): void {
      this.owner.updateXDataDomain(dataPointView);
      this.owner.requireUpdate(View.NeedsLayout);
    },
    viewDidSetDataPointY(newY: unknown | undefined, oldY: unknown | undefined, dataPointView: DataPointView): void {
      this.owner.updateYDataDomain(dataPointView);
      this.owner.requireUpdate(View.NeedsLayout);
    },
    viewDidSetDataPointY2(newY2: unknown | undefined, oldY2: unknown | undefined, dataPointView: DataPointView): void {
      this.owner.updateYDataDomain(dataPointView);
      this.owner.requireUpdate(View.NeedsLayout);
    },
    viewWillAttachDataPointLabel(labelView: GraphicsView): void {
      this.attachDataPointLabelView(labelView);
    },
    viewDidDetachDataPointLabel(labelView: GraphicsView): void {
      this.detachDataPointLabelView(labelView);
    },
    attachDataPointLabelView(labelView: GraphicsView): void {
      this.owner.requireUpdate(View.NeedsLayout);
    },
    detachDataPointLabelView(labelView: GraphicsView): void {
      // hook
    },
  });

  protected createDataPointRef(dataPointView: DataPointView<X, Y>): ViewRef<this, DataPointView<X, Y>> {
    return SeriesPlotView.DataPointRef.create(this) as ViewRef<this, DataPointView<X, Y>>;
  }

  /** @internal */
  readonly dataPointRefs: BTree<X, ViewRef<this, DataPointView<X, Y>>>;

  /** @internal */
  getDataPointRef(x: X): ViewRef<this, DataPointView<X, Y>> | null {
    const dataPointRef = this.dataPointRefs.get(x);
    return dataPointRef !== void 0 ? dataPointRef : null;
  }

  getDataPointView(x: X): DataPointView<X, Y> | null {
    const dataPointRef = this.dataPointRefs.get(x);
    return dataPointRef !== void 0 ? dataPointRef.view : null;
  }

  /** @internal */
  protected mountDataPointRefs(): void {
    type self = this;
    this.dataPointRefs.forEachValue(function (dataPointRef: ViewRef<self, DataPointView<X, Y>>): void {
      dataPointRef.mount();
    }, this);
  }

  /** @internal */
  protected unmountDataPointRefs(): void {
    type self = this;
    this.dataPointRefs.forEachValue(function (dataPointRef: ViewRef<self, DataPointView<X, Y>>): void {
      dataPointRef.unmount();
    }, this);
  }

  override get childCount(): number {
    return this.dataPointRefs.size;
  }

  override get children(): ReadonlyArray<View> {
    const children: View[] = [];
    type self = this;
    this.dataPointRefs.forEachValue(function (dataPointRef: ViewRef<self, DataPointView<X, Y>>): void {
      children.push(dataPointRef.view!);
    }, this);
    return children;
  }

  override firstChild(): View | null {
    const dataPointRef = this.dataPointRefs.firstValue();
    return dataPointRef !== void 0 ? dataPointRef.view! : null;
  }

  override lastChild(): View | null {
    const dataPointRef = this.dataPointRefs.lastValue();
    return dataPointRef !== void 0 ? dataPointRef.view! : null;
  }

  override nextChild(targetView: View): View | null {
    if (targetView instanceof DataPointView) {
      const dataPointRef = this.dataPointRefs.nextValue(targetView.x.getState());
      if (dataPointRef !== void 0) {
        return dataPointRef.view!;
      }
    }
    return null;
  }

  override previousChild(targetView: View): View | null {
    if (targetView instanceof DataPointView) {
      const dataPointRef = this.dataPointRefs.previousValue(targetView.x.getState());
      if (dataPointRef !== void 0) {
        return dataPointRef.view!;
      }
    }
    return null;
  }

  override forEachChild<T>(callback: (child: View) => T | void): T | undefined;
  override forEachChild<T, S>(callback: (this: S, child: View) => T | void, thisArg: S): T | undefined;
  override forEachChild<T, S>(callback: (this: S | undefined, child: View) => T | void, thisArg?: S): T | undefined {
    type self = this;
    return this.dataPointRefs.forEachValue(function (dataPointRef: ViewRef<self, DataPointView<X, Y>>): T | void {
      const result = callback.call(thisArg, dataPointRef.view!);
      if (result !== void 0) {
        return result;
      }
    }, thisArg);
  }

  override getChild<F extends abstract new (...args: any[]) => View>(key: string, childBound: F): InstanceType<F> | null;
  override getChild(key: string, childBound?: abstract new (...args: any[]) => View): View | null;
  override getChild(key: string, childBound?: abstract new (...args: any[]) => View): View | null {
    return null;
  }

  override setChild<V extends View>(key: string, newChild: V): View | null;
  override setChild<F extends ViewCreator<F>>(key: string, factory: F): View | null;
  override setChild(key: string, newChild: AnyView | null): View | null;
  override setChild(key: string, newChild: AnyView | null): View | null {
    throw new Error("unsupported");
  }

  override appendChild<V extends View>(child: V, key?: string): V;
  override appendChild<F extends ViewCreator<F>>(factory: F, key?: string): InstanceType<F>;
  override appendChild(child: AnyView, key?: string): View;
  override appendChild(child: AnyView, key?: string): View {
    if (key !== void 0) {
      throw new Error("unsupported");
    }
    child = View.fromAny(child);
    if (!(child instanceof DataPointView)) {
      throw new TypeError("" + child);
    }
    return this.insertDataPoint(child);
  }

  override prependChild<V extends View>(child: V, key?: string): V;
  override prependChild<F extends ViewCreator<F>>(factory: F, key?: string): InstanceType<F>;
  override prependChild(child: AnyView, key?: string): View;
  override prependChild(child: AnyView, key?: string): View {
    if (key !== void 0) {
      throw new Error("unsupported");
    }
    child = View.fromAny(child);
    if (!(child instanceof DataPointView)) {
      throw new TypeError("" + child);
    }
    return this.insertDataPoint(child);
  }

  override insertChild<V extends View>(child: V, target: View | null, key?: string): V;
  override insertChild<F extends ViewCreator<F>>(factory: F, target: View | null, key?: string): InstanceType<F>;
  override insertChild(child: AnyView, target: View | null, key?: string): View;
  override insertChild(child: AnyView, target: View | null, key?: string): View {
    if (key !== void 0) {
      throw new Error("unsupported");
    }
    child = View.fromAny(child);
    if (!(child instanceof DataPointView)) {
      throw new TypeError("" + child);
    }
    return this.insertDataPoint(child);
  }

  override replaceChild<V extends View>(newChild: View, oldChild: V): V;
  override replaceChild<V extends View>(newChild: AnyView, oldChild: V): V;
  override replaceChild(newChild: AnyView, oldChild: View): View {
    if (!(oldChild instanceof DataPointView)) {
      throw new TypeError("" + oldChild);
    }
    if (oldChild.parent !== this) {
      throw new TypeError("" + oldChild);
    }
    newChild = View.fromAny(newChild);
    if (!(newChild instanceof DataPointView)) {
      throw new TypeError("" + newChild);
    }
    if (newChild !== oldChild) {
      this.removeDataPoint(oldChild.x.getState());
      this.insertDataPoint(newChild);
    }
    return oldChild;
  }

  override removeChild(key: string): View | null;
  override removeChild<V extends View>(child: V): V;
  override removeChild(child: string | View): View | null {
    if (typeof child === "string") {
      throw new Error("unsupported");
    }
    if (!(child instanceof DataPointView)) {
      throw new TypeError("" + child);
    }
    this.removeDataPoint(child.x.getState());
    return child;
  }

  override removeChildren(): void {
    type self = this;
    this.dataPointRefs.forEach(function (x: X, dataPointRef: ViewRef<self, DataPointView<X, Y>>): void {
      const child = dataPointRef.view!;
      this.willRemoveChild(child);
      child.detachParent(this);
      this.dataPointRefs.delete(x);
      this.onRemoveChild(child);
      this.didRemoveChild(child);
      child.setKey(void 0);
      dataPointRef.setView(null);
      if (this.mounted) {
        dataPointRef.unmount();
      }
    }, this);
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.xScale.recohere(viewContext.updateTime);
    this.yScale.recohere(viewContext.updateTime);
    this.resizeScales(this.viewFrame);
  }

  /**
   * Updates own scale ranges to project onto view frame.
   */
  protected resizeScales(frame: R2Box): void {
    const xScale = !this.xScale.inherited ? this.xScale.value : null;
    if (xScale !== null && xScale.range[1] !== frame.width) {
      this.xScale.setRange(0, frame.width);
    }
    const yScale = !this.yScale.inherited ? this.yScale.value : null;
    if (yScale !== null && yScale.range[1] !== frame.height) {
      this.yScale.setRange(0, frame.height);
    }
  }

  protected override displayChildren(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     displayChild: (this: this, child: View, displayFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    let xScale: ContinuousScale<X, number> | null;
    let yScale: ContinuousScale<Y, number> | null;
    if ((displayFlags & View.NeedsLayout) !== 0 &&
        (xScale = this.xScale.value, xScale !== null) &&
        (yScale = this.yScale.value, yScale !== null)) {
      this.layoutChildViews(xScale, yScale, displayFlags, viewContext, displayChild);
    } else {
      super.displayChildren(displayFlags, viewContext, displayChild);
    }
  }

  protected layoutChildViews(xScale: ContinuousScale<X, number>,
                             yScale: ContinuousScale<Y, number>,
                             displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                             displayChild: (this: this, child: View, displayFlags: ViewFlags,
                                            viewContext: ViewContextType<this>) => void): void {
    // Recompute extrema when laying out child views.
    const frame = this.viewFrame;
    let xDataDomainMin: X | undefined;
    let xDataDomainMax: X | undefined;
    let yDataDomainMin: Y | undefined;
    let yDataDomainMax: Y | undefined;
    let gradientStops = 0;

    let point0 = null as DataPointView<X, Y> | null;
    let point1 = null as DataPointView<X, Y> | null;
    let y0: Y | undefined;
    let y1: Y | undefined;
    type self = this;
    function layoutChildView(this: self, child: View, displayFlags: ViewFlags,
                             viewContext: ViewContextType<self>): void {
      const point2 = child as DataPointView<X, Y>;
      const x2 = point2.x.getValue();
      const y2 = point2.y.getValue();
      const dy2 = point2.y2.value;

      const sx2 = xScale(x2);
      const sy2 = yScale(y2);
      point2.setXCoord(frame.xMin + sx2);
      point2.setYCoord(frame.yMin + sy2);

      const sdy2 = dy2 !== void 0 ? yScale(dy2) : void 0;
      if (sdy2 !== void 0) {
        point2.setY2Coord(frame.yMin + sdy2);
      } else if (point2.y2Coord !== void 0) {
        point2.setY2Coord(void 0);
      }

      if (point2.isGradientStop()) {
        gradientStops += 1;
      }

      if (point1 !== null) {
        let category: DataPointCategory;
        if (point0 !== null) {
          // categorize mid point
          if (Values.compare(y0!, y1!) < 0 && Values.compare(y2, y1!) < 0) {
            category = "maxima";
          } else if (Values.compare(y1!, y0!) < 0 && Values.compare(y1!, y2) < 0) {
            category = "minima";
          } else if (Values.compare(y0!, y1!) < 0 && Values.compare(y1!, y2) < 0) {
            category = "increasing";
          } else if (Values.compare(y1!, y0!) < 0 && Values.compare(y2, y1!) < 0) {
            category = "decreasing";
          } else {
            category = "flat";
          }
        } else {
          // categorize start point
          if (Values.compare(y1!, y2) < 0) {
            category = "increasing";
          } else if (Values.compare(y2, y1!) < 0) {
            category = "decreasing";
          } else {
            category = "flat";
          }
        }
        point1.category.setState(category, Affinity.Intrinsic);

        // update extrema
        if (Values.compare(y2, yDataDomainMin) < 0) {
          yDataDomainMin = y2;
        } else if (Values.compare(yDataDomainMax, y2) < 0) {
          yDataDomainMax = y2;
        }
        if (dy2 !== void 0) {
          if (Values.compare(dy2, yDataDomainMin) < 0) {
            yDataDomainMin = dy2;
          } else if (Values.compare(yDataDomainMax, dy2) < 0) {
            yDataDomainMax = dy2;
          }
        }
      } else {
        xDataDomainMin = x2;
        xDataDomainMax = x2;
        yDataDomainMin = y2;
        yDataDomainMax = y2;
      }

      point0 = point1;
      point1 = point2;
      y0 = y1;
      y1 = y2;
      xDataDomainMax = x2;

      displayChild.call(this, child, displayFlags, viewContext);
    }
    super.displayChildren(displayFlags, viewContext, layoutChildView);

    if (point1 !== null) {
      let category: DataPointCategory;
      if (point0 !== null) {
        // categorize end point
        if (Values.compare(y0!, y1!) < 0) {
          category = "increasing";
        } else if (Values.compare(y1!, y0!) < 0) {
          category = "decreasing";
        } else {
          category = "flat";
        }
      } else {
        // categorize sole point
        category = "flat";
      }
      point1.category.setState(category, Affinity.Intrinsic);
    }

    this.setXDataDomain(point0 !== null ? Domain<X>(xDataDomainMin!, xDataDomainMax!) : null);
    this.setYDataDomain(point0 !== null ? Domain<Y>(yDataDomainMin!, yDataDomainMax!) : null);
    (this as Mutable<this>).gradientStops = gradientStops;
  }

  protected override didRender(viewContext: ViewContextType<this>): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.culled) {
      this.renderPlot(renderer.context, this.viewFrame);
    }
    super.didRender(viewContext);
  }

  protected abstract renderPlot(context: CanvasContext, frame: R2Box): void;

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const hitMode = this.hitMode.state;
    if (hitMode !== "none") {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        let hit: GraphicsView | null;
        if (hitMode === "domain") {
          hit = this.hitTestDomain(x, y, renderer);
        } else {
          hit = this.hitTestPlot(x, y, renderer);
        }
        return hit;
      }
    }
    return null;
  }

  protected override hitTestChildren(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    return null;
  }

  protected hitTestDomain(x: number, y: number, renderer: CanvasRenderer): GraphicsView | null {
    const xScale = this.xScale.value;
    if (xScale !== null) {
      const d = xScale.inverse(x);
      const v0 = this.dataPointRefs.previousValue(d);
      const v1 = this.dataPointRefs.nextValue(d);
      const x0 = v0 !== void 0 ? v0.view!.x.value : void 0;
      const x1 = v1 !== void 0 ? v1.view!.x.value : void 0;
      const dx0 = x0 !== void 0 ? +d - +x0 : NaN;
      const dx1 = x1 !== void 0 ? +x1 - +d : NaN;
      if (dx0 <= dx1) {
        return v0!.view;
      } else if (dx0 > dx1) {
        return v1!.view;
      } else if (v0 !== void 0) {
        return v0!.view;
      } else if (v1 !== void 0) {
        return v1!.view;
      }
    }
    return null;
  }

  protected abstract hitTestPlot(x: number, y: number, renderer: CanvasRenderer): GraphicsView | null;

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountDataPointRefs();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountDataPointRefs();
    super.unmountFasteners();
  }

  override init(init: SeriesPlotViewInit<X, Y>): void {
    super.init(init);
    if (init.xScale !== void 0) {
      this.xScale(init.xScale);
    }
    if (init.yScale !== void 0) {
      this.yScale(init.yScale);
    }

    const data = init.data;
    if (data !== void 0) {
      for (let i = 0, n = data.length; i < n; i += 1) {
        this.appendChild(DataPointView.fromAny(data[i]! as AnyDataPointView));
      }
    }

    if (init.font !== void 0) {
      this.font(init.font);
    }
    if (init.textColor !== void 0) {
      this.textColor(init.textColor);
    }

    if (init.hitMode !== void 0) {
      this.hitMode(init.hitMode);
    }
  }
}
