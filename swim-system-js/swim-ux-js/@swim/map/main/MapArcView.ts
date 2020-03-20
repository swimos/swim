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

import {PointR2, BoxR2, CircleR2} from "@swim/math";
import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {Tween} from "@swim/transition";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {
  MemberAnimator,
  ViewInit,
  RenderedView,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
} from "@swim/view";
import {ArcInit, Arc} from "@swim/shape";
import {AnyLngLat, LngLat} from "./LngLat";
import {MapViewContext} from "./MapViewContext";
import {MapGraphicsView} from "./MapGraphicsView";
import {MapGraphicsViewController} from "./MapGraphicsViewController";

export type AnyMapArcView = MapArcView | MapArcViewInit;

export interface MapArcViewInit extends ViewInit, FillViewInit, StrokeViewInit, ArcInit {
  center?: AnyLngLat;
}

export class MapArcView extends MapGraphicsView implements FillView, StrokeView {
  /** @hidden */
  _viewController: MapGraphicsViewController<MapArcView> | null;

  constructor(center: LngLat = LngLat.origin(), innerRadius: Length = Length.zero(),
              outerRadius: Length = Length.zero(), startAngle: Angle = Angle.zero(),
              sweepAngle: Angle = Angle.zero(), padAngle: Angle = Angle.zero(),
              padRadius: Length | null = null, cornerRadius: Length = Length.zero()) {
    super();
    this.center.setState(center);
    this.innerRadius.setState(innerRadius);
    this.outerRadius.setState(outerRadius);
    this.startAngle.setState(startAngle);
    this.sweepAngle.setState(sweepAngle);
    this.padAngle.setState(padAngle);
    this.padRadius.setState(padRadius);
    this.cornerRadius.setState(cornerRadius);
  }

  get viewController(): MapGraphicsViewController<MapArcView> | null {
    return this._viewController;
  }

  @MemberAnimator(LngLat)
  center: MemberAnimator<this, LngLat, AnyLngLat>;

  @MemberAnimator(Length)
  innerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  outerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Angle)
  startAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Angle)
  sweepAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Angle)
  padAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Length)
  padRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  cornerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color, {inherit: true})
  fill: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Color, {inherit: true})
  stroke: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length, {inherit: true})
  strokeWidth: MemberAnimator<this, Length, AnyLength>;

  get value(): Arc {
    return new Arc(this.innerRadius.value!, this.outerRadius.value!, this.startAngle.value!,
                   this.sweepAngle.value!, this.padAngle.value!, this.padRadius.value!,
                   this.cornerRadius.value!);
  }

  get state(): Arc {
    return new Arc(this.innerRadius.state!, this.outerRadius.state!, this.startAngle.state!,
                   this.sweepAngle.state!, this.padAngle.state!, this.padRadius.state!,
                   this.cornerRadius.state!);
  }

  setState(arc: Arc | MapArcViewInit, tween?: Tween<any>): void {
    if (arc instanceof Arc) {
      arc = arc.toAny();
    }
    if (arc.key !== void 0) {
      this.key(arc.key);
    }
    if (arc.center !== void 0) {
      this.center(arc.center, tween);
    }
    if (arc.innerRadius !== void 0) {
      this.innerRadius(arc.innerRadius, tween);
    }
    if (arc.outerRadius !== void 0) {
      this.outerRadius(arc.outerRadius, tween);
    }
    if (arc.startAngle !== void 0) {
      this.startAngle(arc.startAngle, tween);
    }
    if (arc.sweepAngle !== void 0) {
      this.sweepAngle(arc.sweepAngle, tween);
    }
    if (arc.padAngle !== void 0) {
      this.padAngle(arc.padAngle, tween);
    }
    if (arc.padRadius !== void 0) {
      this.padRadius(arc.padRadius, tween);
    }
    if (arc.cornerRadius !== void 0) {
      this.cornerRadius(arc.cornerRadius, tween);
    }
    if (arc.fill !== void 0) {
      this.fill(arc.fill, tween);
    }
    if (arc.stroke !== void 0) {
      this.stroke(arc.stroke, tween);
    }
    if (arc.strokeWidth !== void 0) {
      this.strokeWidth(arc.strokeWidth, tween);
    }
  }

  protected onAnimate(viewContext: MapViewContext): void {
    const t = viewContext.updateTime;
    this.innerRadius.onFrame(t);
    this.outerRadius.onFrame(t);
    this.startAngle.onFrame(t);
    this.sweepAngle.onFrame(t);
    this.padAngle.onFrame(t);
    this.padRadius.onFrame(t);
    this.cornerRadius.onFrame(t);
    this.fill.onFrame(t);
    this.stroke.onFrame(t);
    this.strokeWidth.onFrame(t);
  }

  protected onProject(viewContext: MapViewContext): void {
    const projection = viewContext.projection;
    const bounds = this._bounds;
    const anchor = projection.project(this.center.value!);
    const size = Math.min(bounds.width, bounds.height);
    const radius = this.outerRadius.value!.pxValue(size);
    this._hitBounds = new BoxR2(anchor.x - radius, anchor.y - radius,
                                anchor.x + radius, anchor.y + radius);
    this.setAnchor(anchor);
  }

  protected onLayout(viewContext: MapViewContext): void {
    const bounds = this._bounds;
    const anchor = this._anchor;
    const size = Math.min(bounds.width, bounds.height);
    const radius = this.outerRadius.value!.pxValue(size);
    const invalid = !isFinite(anchor.x) || !isFinite(anchor.y) || !isFinite(radius);
    const culled = invalid || !bounds.intersectsCircle(new CircleR2(anchor.x, anchor.y, radius));
    this.setCulled(culled);
    this.layoutChildViews(viewContext);
  }

  protected onRender(viewContext: MapViewContext): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
      this.renderArc(context, this._bounds, this._anchor);
      context.restore();
    }
  }

  protected renderArc(context: CanvasContext, bounds: BoxR2, anchor: PointR2): void {
    const arc = this.value;
    arc.draw(context, bounds, anchor);
    const fill = this.fill.value;
    if (fill) {
      context.fillStyle = fill.toString();
      context.fill();
    }
    const stroke = this.stroke.value;
    if (stroke) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth) {
        const size = Math.min(bounds.width, bounds.height);
        context.lineWidth = strokeWidth.pxValue(size);
      }
      context.strokeStyle = stroke.toString();
      context.stroke();
    }
  }

  get popoverBounds(): BoxR2 {
    const bounds = this._bounds;
    const anchor = this._anchor;
    let size: number | undefined;
    if (bounds) {
      size = Math.min(bounds.width, bounds.height);
    }
    const inversePageTransform = this.pageTransform.inverse();
    const c = anchor.transform(inversePageTransform);
    const r = (this.innerRadius.value!.pxValue(size) + this.outerRadius.value!.pxValue(size)) / 2;
    const a = this.startAngle.value!.radValue() + this.sweepAngle.value!.radValue() / 2;
    const x = c.x + r * Math.cos(a);
    const y = c.y + r * Math.sin(a);
    return new BoxR2(x, y, x, y);
  }

  hitTest(x: number, y: number, viewContext: MapViewContext): RenderedView | null {
    let hit = super.hitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        context.save();
        x *= renderer.pixelRatio;
        y *= renderer.pixelRatio;
        hit = this.hitTestArc(x, y, context, this._bounds, this._anchor);
        context.restore();
      }
    }
    return hit;
  }

  protected hitTestArc(x: number, y: number, context: CanvasContext,
                       bounds: BoxR2, anchor: PointR2): RenderedView | null {
    const arc = this.value;
    context.beginPath();
    arc.draw(context, bounds, anchor);
    if (this.fill.value && context.isPointInPath(x, y)) {
      return this;
    }
    if (this.stroke.value) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth) {
        const size = Math.min(bounds.width, bounds.height);
        context.lineWidth = strokeWidth.pxValue(size);
        if (context.isPointInStroke(x, y)) {
          return this;
        }
      }
    }
    return null;
  }

  static from(center: AnyLngLat = LngLat.origin(),
              innerRadius: AnyLength = Length.zero(),
              outerRadius: AnyLength = Length.zero(),
              startAngle: AnyAngle = Angle.zero(),
              sweepAngle: AnyAngle = Angle.zero(),
              padAngle: AnyAngle = Angle.zero(),
              padRadius: AnyLength | null = null,
              cornerRadius: AnyLength = Length.zero(),
              fill?: AnyColor | null,
              stroke?: AnyColor | null,
              strokeWidth?: AnyLength | null): MapArcView {
    center = LngLat.fromAny(center);
    innerRadius = Length.fromAny(innerRadius);
    outerRadius = Length.fromAny(outerRadius);
    startAngle = Angle.fromAny(startAngle);
    sweepAngle = Angle.fromAny(sweepAngle);
    padAngle = Angle.fromAny(padAngle);
    padRadius = padRadius !== null ? Length.fromAny(padRadius) : null;
    cornerRadius = Length.fromAny(cornerRadius);
    const view = new MapArcView(center as LngLat, innerRadius, outerRadius, startAngle,
                                sweepAngle, padAngle, padRadius, cornerRadius);
    if (fill !== void 0) {
      view.fill(fill);
    }
    if (stroke !== void 0) {
      view.stroke(stroke);
    }
    if (strokeWidth !== void 0) {
      view.strokeWidth(strokeWidth);
    }
    return view;
  }

  static fromAny(arc: AnyMapArcView): MapArcView {
    if (arc instanceof MapArcView) {
      return arc;
    } else if (arc instanceof Arc) {
      return new MapArcView(LngLat.origin(), arc.innerRadius(), arc.outerRadius(),
                            arc.startAngle(), arc.sweepAngle(), arc.padAngle(),
                            arc.padRadius(), arc.cornerRadius());
    } else if (typeof arc === "object" && arc) {
      const view = new MapArcView();
      view.setState(arc);
      return view;
    }
    throw new TypeError("" + arc);
  }
}
