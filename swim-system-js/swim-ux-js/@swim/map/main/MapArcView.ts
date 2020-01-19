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

import {BoxR2, CircleR2} from "@swim/math";
import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {Tween} from "@swim/transition";
import {RenderingContext} from "@swim/render";
import {
  MemberAnimator,
  ViewInit,
  RenderView,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
} from "@swim/view";
import {ArcInit, Arc} from "@swim/shape";
import {AnyLngLat, LngLat} from "./LngLat";
import {MapViewContext} from "./MapViewContext";
import {MapGraphicView} from "./MapGraphicView";
import {MapGraphicViewController} from "./MapGraphicViewController";

export type AnyMapArcView = MapArcView | MapArcViewInit;

export interface MapArcViewInit extends ViewInit, FillViewInit, StrokeViewInit, ArcInit {
  center?: AnyLngLat;
}

export class MapArcView extends MapGraphicView implements FillView, StrokeView {
  /** @hidden */
  _viewController: MapGraphicViewController<MapArcView> | null;

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

  get viewController(): MapGraphicViewController<MapArcView> | null {
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
    const context = viewContext.renderingContext;
    context.save();
    const bounds = this._bounds;
    const arc = this.value;
    arc.render(context, bounds, this._anchor);
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
    context.restore();
  }

  get popoverBounds(): BoxR2 {
    const inversePageTransform = this.pageTransform.inverse();
    const hitBounds = this._hitBounds;
    if (hitBounds !== null) {
      return hitBounds.transform(inversePageTransform);
    } else {
      const pageAnchor = this.anchor.transform(inversePageTransform);
      const pageX = Math.round(pageAnchor.x);
      const pageY = Math.round(pageAnchor.y);
      return new BoxR2(pageX, pageY, pageX, pageY);
    }
  }

  hitTest(x: number, y: number, context: RenderingContext): RenderView | null {
    let hit = super.hitTest(x, y, context);
    if (hit === null) {
      context.save();
      const pixelRatio = this.pixelRatio;
      x *= pixelRatio;
      y *= pixelRatio;
      context.beginPath();
      const bounds = this._bounds;
      const arc = this.value;
      arc.render(context, bounds, this._anchor);
      if (this.fill.value && context.isPointInPath(x, y)) {
        hit = this;
      } else if (this.stroke.value) {
        const strokeWidth = this.strokeWidth.value;
        if (strokeWidth) {
          const size = Math.min(bounds.width, bounds.height);
          context.lineWidth = strokeWidth.pxValue(size);
          if (context.isPointInStroke(x, y)) {
            hit = this;
          }
        }
      }
      context.restore();
    }
    return hit;
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
