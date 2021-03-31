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

import {AnyLength, Length, AnyPointR2, PointR2, BoxR2, CircleR2} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {ViewContextType, View, ViewProperty, ViewAnimator} from "@swim/view";
import {
  GraphicsView,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
  CanvasContext,
  CanvasRenderer,
} from "@swim/graphics";
import type {MapGraphicsViewController} from "../graphics/MapGraphicsViewController";
import {MapLayerView} from "../layer/MapLayerView";
import type {GeoViewInit, GeoView} from "./GeoView";
import type {GeoCircleViewObserver} from "./GeoCircleViewObserver";

export type AnyGeoCircleView = GeoCircleView | GeoCircleViewInit;

export interface GeoCircleViewInit extends GeoViewInit, FillViewInit, StrokeViewInit {
  geoCenter?: AnyGeoPoint;
  viewCenter?: AnyPointR2;
  radius?: AnyLength;
  hitRadius?: number;
}

export class GeoCircleView extends MapLayerView implements GeoView, FillView, StrokeView {
  initView(init: GeoCircleViewInit): void {
    super.initView(init);
    if (init.geoCenter !== void 0) {
      this.geoCenter(init.geoCenter);
    }
    if (init.viewCenter !== void 0) {
      this.viewCenter(init.viewCenter);
    }
    if (init.radius !== void 0) {
      this.radius(init.radius);
    }
    if (init.hitRadius !== void 0) {
      this.hitRadius(init.hitRadius);
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

  declare readonly viewController: MapGraphicsViewController<GeoCircleView> & GeoCircleViewObserver | null;

  declare readonly viewObservers: ReadonlyArray<GeoCircleViewObserver>;

  protected willSetGeoCenter(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.geoViewWillSetGeometry !== void 0) {
      viewController.geoViewWillSetGeometry(newGeoCenter, oldGeoCenter, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.geoViewWillSetGeometry !== void 0) {
        viewObserver.geoViewWillSetGeometry(newGeoCenter, oldGeoCenter, this);
      }
    }
  }

  protected onSetGeoCenter(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint): void {
    this.updateGeoBounds(newGeoCenter);
  }

  protected didSetGeoCenter(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.geoViewDidSetGeometry !== void 0) {
        viewObserver.geoViewDidSetGeometry(newGeoCenter, oldGeoCenter, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.geoViewDidSetGeometry !== void 0) {
      viewController.geoViewDidSetGeometry(newGeoCenter, oldGeoCenter, this);
    }
  }

  @ViewAnimator<GeoCircleView, GeoPoint, AnyGeoPoint>({
    type: GeoPoint,
    state: GeoPoint.origin(),
    willSetValue(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint): void {
      this.owner.willSetGeoCenter(newGeoCenter, oldGeoCenter);
    },
    didSetValue(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint): void {
      this.owner.onSetGeoCenter(newGeoCenter, oldGeoCenter);
      this.owner.didSetGeoCenter(newGeoCenter, oldGeoCenter);
    },
  })
  declare geoCenter: ViewAnimator<this, GeoPoint, AnyGeoPoint>;

  @ViewAnimator({type: PointR2, state: PointR2.origin()})
  declare viewCenter: ViewAnimator<this, PointR2, AnyPointR2>;

  @ViewAnimator({type: Length, state: Length.zero()})
  declare radius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, state: null, inherit: true})
  declare fill: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Color, state: null, inherit: true})
  declare stroke: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Length, state: null, inherit: true})
  declare strokeWidth: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewProperty({type: Number})
  declare hitRadius: ViewProperty<this, number | undefined>;

  protected updateGeoBounds(geoCenter: GeoPoint): void {
    if (geoCenter.isDefined()) {
      const oldGeoBounds = this.geoBounds;
      const newGeoBounds = new GeoBox(geoCenter.lng, geoCenter.lat, geoCenter.lng, geoCenter.lat);
      if (!oldGeoBounds.equals(newGeoBounds)) {
        Object.defineProperty(this, "geoBounds", {
          value: newGeoBounds,
          enumerable: true,
          configurable: true,
        });
        this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
        this.requireUpdate(View.NeedsProject);
      }
    }
  }

  protected onProject(viewContext: ViewContextType<this>): void {
    super.onProject(viewContext);
    let viewCenter: PointR2;
    if (this.viewCenter.isPrecedent(View.Intrinsic)) {
      const geoProjection = viewContext.geoProjection;
      viewCenter = geoProjection.project(this.geoCenter.getValue());
      this.viewCenter.setState(viewCenter, View.Intrinsic);
    } else {
      viewCenter = this.viewCenter.getValue();
    }
    const frame = this.viewFrame;
    const size = Math.min(frame.width, frame.height);
    const radius = this.radius.getValue().pxValue(size);
    const invalid = !isFinite(viewCenter.x) || !isFinite(viewCenter.y) || !isFinite(radius);
    const culled = invalid || !frame.intersectsCircle(new CircleR2(viewCenter.x, viewCenter.y, radius));
    this.setCulled(culled);
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderCircle(renderer.context, this.viewFrame);
      context.restore();
    }
  }

  protected renderCircle(context: CanvasContext, frame: BoxR2): void {
    const size = Math.min(frame.width, frame.height);
    const viewCenter = this.viewCenter.getValue();
    const radius = this.radius.getValue().pxValue(size);

    context.beginPath();
    context.arc(viewCenter.x, viewCenter.y, radius, 0, 2 * Math.PI);

    const fill = this.fill.value;
    if (fill !== null) {
      context.fillStyle = fill.toString();
      context.fill();
    }

    const stroke = this.stroke.value;
    if (stroke !== null) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth !== null) {
        context.lineWidth = strokeWidth.pxValue(size);
      }
      context.strokeStyle = stroke.toString();
      context.stroke();
    }
  }

  protected doUpdateGeoBounds(): void {
    // nop
  }

  get popoverFrame(): BoxR2 {
    const frame = this.viewFrame;
    const size = Math.min(frame.width, frame.height);
    const inversePageTransform = this.pageTransform.inverse();
    const viewCenter = this.viewCenter.getValue();
    const px = inversePageTransform.transformX(viewCenter.x, viewCenter.y);
    const py = inversePageTransform.transformY(viewCenter.x, viewCenter.y);
    const radius = this.radius.getValue().pxValue(size);
    return new BoxR2(px - radius, py - radius, px + radius, py + radius);
  }

  get viewBounds(): BoxR2 {
    const frame = this.viewFrame;
    const size = Math.min(frame.width, frame.height);
    const viewCenter = this.viewCenter.getValue();
    const radius = this.radius.getValue().pxValue(size);
    return new BoxR2(viewCenter.x - radius, viewCenter.y - radius,
                     viewCenter.x + radius, viewCenter.y + radius);
  }

  get hitBounds(): BoxR2 {
    const frame = this.viewFrame;
    const size = Math.min(frame.width, frame.height);
    const viewCenter = this.viewCenter.getValue();
    const radius = this.radius.getValue().pxValue(size);
    const hitRadius = Math.max(this.hitRadius.getStateOr(radius), radius);
    return new BoxR2(viewCenter.x - hitRadius, viewCenter.y - hitRadius,
                     viewCenter.x + hitRadius, viewCenter.y + hitRadius);
  }

  protected doHitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    let hit = super.doHitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        hit = this.hitTestCircle(x, y, context, this.viewFrame, renderer.pixelRatio);
      }
    }
    return hit;
  }

  protected hitTestCircle(x: number, y: number, context: CanvasContext,
                          frame: BoxR2, pixelRatio: number): GraphicsView | null {
    const size = Math.min(frame.width, frame.height);
    const viewCenter = this.viewCenter.getValue();
    const radius = this.radius.getValue().pxValue(size);

    if (this.fill.value !== null) {
      const hitRadius = Math.max(this.hitRadius.getStateOr(radius), radius);
      const dx = viewCenter.x - x;
      const dy = viewCenter.y - y;
      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        return this;
      }
    }

    const strokeWidth = this.strokeWidth.value;
    if (this.stroke.value !== null && strokeWidth !== null) {
      x *= pixelRatio;
      y *= pixelRatio;

      context.save();
      context.beginPath();
      context.arc(viewCenter.x, viewCenter.y, radius, 0, 2 * Math.PI);
      context.lineWidth = strokeWidth.pxValue(size);
      if (context.isPointInStroke(x, y)) {
        context.restore();
        return this;
      } else {
        context.restore();
      }
    }
    return null;
  }

  static create(): GeoCircleView {
    return new GeoCircleView();
  }

  static fromInit(init: GeoCircleViewInit): GeoCircleView {
    const view = new GeoCircleView();
    view.initView(init);
    return view;
  }

  static fromAny(value: AnyGeoCircleView): GeoCircleView {
    if (value instanceof GeoCircleView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
