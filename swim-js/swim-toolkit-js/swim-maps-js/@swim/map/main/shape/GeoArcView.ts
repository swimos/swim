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

import {
  AnyLength,
  Length,
  AnyAngle,
  Angle,
  AnyR2Point,
  R2Point,
  R2Segment,
  R2Box,
  R2Circle,
} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {ViewContextType, View, ViewAnimator} from "@swim/view";
import {
  GraphicsView,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
  CanvasContext,
  CanvasRenderer,
} from "@swim/graphics";
import {Arc} from "@swim/graphics";
import type {GeoViewInit} from "../geo/GeoView";
import {GeoLayerView} from "../layer/GeoLayerView";
import {GeoRippleOptions, GeoRippleView} from "../effect/GeoRippleView";
import type {GeoArcViewObserver} from "./GeoArcViewObserver";

export type AnyGeoArcView = GeoArcView | GeoArcViewInit;

export interface GeoArcViewInit extends GeoViewInit, FillViewInit, StrokeViewInit {
  geoCenter?: AnyGeoPoint;
  viewCenter?: R2Point;
  innerRadius?: AnyLength;
  outerRadius?: AnyLength;
  startAngle?: AnyAngle;
  sweepAngle?: AnyAngle;
  padAngle?: AnyAngle;
  padRadius?: AnyLength | null;
  cornerRadius?: AnyLength;
}

export class GeoArcView extends GeoLayerView implements FillView, StrokeView {
  override initView(init: GeoArcViewInit): void {
    super.initView(init);
    if (init.geoCenter !== void 0) {
      this.geoCenter(init.geoCenter);
    }
    if (init.viewCenter !== void 0) {
      this.viewCenter(init.viewCenter);
    }
    if (init.innerRadius !== void 0) {
      this.innerRadius(init.innerRadius);
    }
    if (init.outerRadius !== void 0) {
      this.outerRadius(init.outerRadius);
    }
    if (init.startAngle !== void 0) {
      this.startAngle(init.startAngle);
    }
    if (init.sweepAngle !== void 0) {
      this.sweepAngle(init.sweepAngle);
    }
    if (init.padAngle !== void 0) {
      this.padAngle(init.padAngle);
    }
    if (init.padRadius !== void 0) {
      this.padRadius(init.padRadius);
    }
    if (init.cornerRadius !== void 0) {
      this.cornerRadius(init.cornerRadius);
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

  override readonly viewObservers!: ReadonlyArray<GeoArcViewObserver>;

  protected willSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetGeoCenter !== void 0) {
        viewObserver.viewWillSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
    }
  }

  protected onSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
    this.setGeoBounds(newGeoCenter !== null ? newGeoCenter.bounds : GeoBox.undefined());
    if (this.isMounted()) {
      this.projectArc(this.viewContext as ViewContextType<this>);
    }
  }

  protected didSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetGeoCenter !== void 0) {
        viewObserver.viewDidSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
    }
  }

  @ViewAnimator<GeoArcView, GeoPoint | null, AnyGeoPoint | null>({
    type: GeoPoint,
    state: null,
    didSetState(newGeoCenter: GeoPoint | null, oldGeoCemter: GeoPoint | null): void {
      this.owner.projectGeoCenter(newGeoCenter);
    },
    willSetValue(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.willSetGeoCenter(newGeoCenter, oldGeoCenter);
    },
    didSetValue(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.onSetGeoCenter(newGeoCenter, oldGeoCenter);
      this.owner.didSetGeoCenter(newGeoCenter, oldGeoCenter);
    },
  })
  readonly geoCenter!: ViewAnimator<this, GeoPoint | null, AnyGeoPoint | null>;

  @ViewAnimator({type: R2Point, state: R2Point.undefined()})
  readonly viewCenter!: ViewAnimator<this, R2Point | null, AnyR2Point | null>;

  @ViewAnimator({type: Length, state: Length.zero()})
  readonly innerRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.zero()})
  readonly outerRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Angle, state: Angle.zero()})
  readonly startAngle!: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator({type: Angle, state: Angle.zero()})
  readonly sweepAngle!: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator({type: Angle, state: Angle.zero()})
  readonly padAngle!: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator({type: Length, state: null})
  readonly padRadius!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Length, state: Length.zero()})
  readonly cornerRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, state: null, inherit: true})
  readonly fill!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Color, state: null, inherit: true})
  readonly stroke!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Length, state: null, inherit: true})
  readonly strokeWidth!: ViewAnimator<this, Length | null, AnyLength | null>;

  get value(): Arc | null {
    const viewCenter = this.viewCenter.value;
    if (viewCenter !== null && viewCenter.isDefined()) {
      return new Arc(viewCenter, this.innerRadius.value, this.outerRadius.value,
                     this.startAngle.value, this.sweepAngle.value, this.padAngle.value,
                     this.padRadius.value, this.cornerRadius.value);
    } else {
      return null;
    }
  }

  get state(): Arc | null {
    const viewCenter = this.viewCenter.state;
    if (viewCenter !== null && viewCenter.isDefined()) {
      return new Arc(viewCenter, this.innerRadius.state, this.outerRadius.state,
                     this.startAngle.state, this.sweepAngle.state, this.padAngle.state,
                     this.padRadius.state, this.cornerRadius.state);
    } else {
      return null;
    }
  }

  protected override onProject(viewContext: ViewContextType<this>): void {
    super.onProject(viewContext);
    this.projectArc(viewContext);
  }

  protected projectGeoCenter(geoCenter: GeoPoint | null): void {
    if (this.isMounted()) {
      const viewContext = this.viewContext as ViewContextType<this>;
      const viewCenter = geoCenter !== null && geoCenter.isDefined()
                       ? viewContext.geoViewport.project(geoCenter)
                       : null;
      this.viewCenter.setIntermediateValue(this.viewCenter.value, viewCenter);
      this.projectArc(viewContext);
    }
  }

  protected projectArc(viewContext: ViewContextType<this>): void {
    if (this.viewCenter.takesPrecedence(View.Intrinsic)) {
      const geoCenter = this.geoCenter.value;
      const viewCenter = geoCenter !== null && geoCenter.isDefined()
                       ? viewContext.geoViewport.project(geoCenter)
                       : null;
      this.viewCenter.setValue(viewCenter);
    }
    const viewFrame = this.viewFrame;
    const size = Math.min(viewFrame.width, viewFrame.height);
    const r = this.outerRadius.getValue().pxValue(size);
    const p0 = this.viewCenter.value;
    const p1 = this.viewCenter.state;
    if (p0 !== null && p1 !== null && (
        viewFrame.intersectsCircle(new R2Circle(p0.x, p0.y, r)) ||
        viewFrame.intersectsSegment(new R2Segment(p0.x, p0.y, p1.x, p1.y)))) {
      this.setCulled(false);
    } else {
      this.setCulled(true);
    }
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderArc(renderer.context, this.viewFrame);
      context.restore();
    }
  }

  protected override renderGeoBounds(viewContext: ViewContextType<this>, outlineColor: Color, outlineWidth: number): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled() && !this.isUnbounded()) {
      const context = renderer.context;
      context.save();
      this.renderViewOutline(this.viewBounds, context, outlineColor, outlineWidth);
      context.restore();
    }
  }

  protected renderArc(context: CanvasContext, frame: R2Box): void {
    const arc = this.value;
    if (arc !== null && frame.isDefined()) {
      context.beginPath();
      arc.draw(context, frame);
      const fill = this.fill.value;
      if (fill !== null) {
        context.fillStyle = fill.toString();
        context.fill();
      }
      const stroke = this.stroke.value;
      if (stroke !== null) {
        const strokeWidth = this.strokeWidth.value;
        if (strokeWidth !== null) {
          const size = Math.min(frame.width, frame.height);
          context.lineWidth = strokeWidth.pxValue(size);
        }
        context.strokeStyle = stroke.toString();
        context.stroke();
      }
    }
  }

  protected override updateGeoBounds(): void {
    // nop
  }

  override get popoverFrame(): R2Box {
    const viewCenter = this.viewCenter.value;
    const frame = this.viewFrame;
    if (viewCenter !== null && viewCenter.isDefined()) {
      const size = Math.min(frame.width, frame.height);
      const inversePageTransform = this.pageTransform.inverse();
      const px = inversePageTransform.transformX(viewCenter.x, viewCenter.y);
      const py = inversePageTransform.transformY(viewCenter.x, viewCenter.y);
      const r = (this.innerRadius.getValue().pxValue(size) + this.outerRadius.getValue().pxValue(size)) / 2;
      const a = this.startAngle.getValue().radValue() + this.sweepAngle.getValue().radValue() / 2;
      const x = px + r * Math.cos(a);
      const y = py + r * Math.sin(a);
      return new R2Box(x, y, x, y);
    } else {
      return this.pageBounds;
    }
  }

  declare readonly viewBounds: R2Box; // getter defined below to work around useDefineForClassFields lunacy

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
      const p = renderer.transform.transform(x, y);
      const hit = this.hitTestArc(p.x, p.y, context, this.viewFrame);
      context.restore();
      return hit;
    }
    return null;
  }

  protected hitTestArc(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const arc = this.value;
    if (arc !== null) {
      context.beginPath();
      arc.draw(context, frame);
      if (this.fill.value !== null && context.isPointInPath(x, y)) {
        return this;
      } else if (this.stroke.value !== void 0) {
        const strokeWidth = this.strokeWidth.value;
        if (strokeWidth !== null) {
          const size = Math.min(frame.width, frame.height);
          context.lineWidth = strokeWidth.pxValue(size);
          if (context.isPointInStroke(x, y)) {
            return this;
          }
        }
      }
    }
    return null;
  }

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }

  static override create(): GeoArcView {
    return new GeoArcView();
  }

  static fromInit(init: GeoArcViewInit): GeoArcView {
    const view = new GeoArcView();
    view.initView(init);
    return view;
  }

  static fromAny(value: AnyGeoArcView): GeoArcView {
    if (value instanceof GeoArcView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
Object.defineProperty(GeoArcView.prototype, "viewBounds", {
  get(this: GeoArcView): R2Box {
    const viewCenter = this.viewCenter.value;
    const frame = this.viewFrame;
    if (viewCenter !== null && viewCenter.isDefined()) {
      const size = Math.min(frame.width, frame.height);
      const radius = this.outerRadius.getValue().pxValue(size);
      return new R2Box(viewCenter.x - radius, viewCenter.y - radius,
                       viewCenter.x + radius, viewCenter.y + radius);
    } else {
      return this.viewFrame
    }
  },
  enumerable: true,
  configurable: true,
});
