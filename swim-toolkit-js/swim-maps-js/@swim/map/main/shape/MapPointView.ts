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

import {AnyPointR2, PointR2, BoxR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {Tween} from "@swim/transition";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {ViewFlags, View, ViewAnimator, GraphicsView, TypesetView} from "@swim/view";
import {AnyTextRunView, TextRunView} from "@swim/typeset";
import {AnyGeoPoint, GeoPointInit, GeoPointTuple, GeoPoint} from "../geo/GeoPoint";
import {GeoBox} from "../geo/GeoBox";
import {MapGraphicsViewContext} from "../graphics/MapGraphicsViewContext";
import {MapGraphicsViewInit} from "../graphics/MapGraphicsView";
import {MapGraphicsViewController} from "../graphics/MapGraphicsViewController";
import {MapGraphicsNodeView} from "../graphics/MapGraphicsNodeView";

export type MapPointLabelPlacement = "auto" | "top" | "right" | "bottom" | "left";

export type AnyMapPointView = MapPointView | MapPointViewInit | GeoPoint | GeoPointInit | GeoPointTuple;

export interface MapPointViewInit extends MapGraphicsViewInit {
  lng?: number;
  lat?: number;
  x?: number;
  y?: number;

  radius?: AnyLength;

  hitRadius?: number;

  color?: AnyColor;
  opacity?: number;

  labelPadding?: AnyLength;
  labelPlacement?: MapPointLabelPlacement;

  font?: AnyFont;
  textColor?: AnyColor;

  label?: GraphicsView | string | null;
}

export class MapPointView extends MapGraphicsNodeView {
  /** @hidden */
  _hitRadius?: number;
  /** @hidden */
  _labelPlacement?: MapPointLabelPlacement;
  /** @hidden */
  _geoBounds: GeoBox;

  constructor() {
    super();
    this._geoBounds = GeoBox.undefined();
    this.geoPoint.onUpdate = this.onSetGeoPoint.bind(this);
  }

  get viewController(): MapGraphicsViewController<MapPointView> | null {
    return this._viewController;
  }

  @ViewAnimator(GeoPoint, {value: GeoPoint.origin()})
  geoPoint: ViewAnimator<this, GeoPoint, AnyGeoPoint>;

  @ViewAnimator(PointR2, {value: PointR2.origin()})
  viewPoint: ViewAnimator<this, PointR2, AnyPointR2>;

  @ViewAnimator(Length)
  radius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Color)
  color: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Number)
  opacity: ViewAnimator<this, number>;

  @ViewAnimator(Length)
  labelPadding: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Font, {inherit: true})
  font: ViewAnimator<this, Font, AnyFont>;

  @ViewAnimator(Color, {inherit: true})
  textColor: ViewAnimator<this, Color, AnyColor>;

  hitRadius(): number | null;
  hitRadius(hitRadius: number | null): this;
  hitRadius(hitRadius?: number | null): number | null | this {
    if (hitRadius === void 0) {
      return this._hitRadius !== void 0 ? this._hitRadius : null;
    } else {
      if (hitRadius !== null) {
        this._hitRadius = hitRadius;
      } else if (this._hitRadius !== void 0) {
        this._hitRadius = void 0;
      }
      return this;
    }
  }

  label(): GraphicsView | null;
  label(label: GraphicsView | AnyTextRunView | null): this;
  label(label?: GraphicsView | AnyTextRunView | null): GraphicsView | null | this {
    if (label === void 0) {
      const childView = this.getChildView("label");
      return childView instanceof GraphicsView ? childView : null;
    } else {
      if (label !== null && !(label instanceof GraphicsView)) {
        label = TextRunView.fromAny(label);
      }
      this.setChildView("label", label);
      return this;
    }
  }

  labelPlacement(): MapPointLabelPlacement;
  labelPlacement(labelPlacement: MapPointLabelPlacement): this;
  labelPlacement(labelPlacement?: MapPointLabelPlacement): MapPointLabelPlacement | this {
    if (labelPlacement === void 0) {
      return this._labelPlacement !== void 0 ? this._labelPlacement : "auto";
    } else {
      this._labelPlacement = labelPlacement;
      return this;
    }
  }

  isGradientStop(): boolean {
    return !!this.color.value || typeof this.opacity.value === "number";
  }

  setState(point: AnyMapPointView, tween?: Tween<any>): void {
    let init: MapPointViewInit;
    if (point instanceof MapPointView) {
      init = point.toAny();
    } else if (point instanceof GeoPoint) {
      init = point.toAny();
    } else if (GeoPoint.isTuple(point)) {
      init = {lng: point[0], lat: point[1]};
    } else {
      init = point;
    }
    if (init.lng !== void 0 && init.lat !== void 0) {
      this.geoPoint(new GeoPoint(init.lng, init.lat), tween);
    } else if (init.x !== void 0 && init.y !== void 0) {
      this.viewPoint(new PointR2(init.x, init.y), tween);
    }

    if (init.radius !== void 0) {
      this.radius(init.radius, tween);
    }

    if (init.hitRadius !== void 0) {
      this.hitRadius(init.hitRadius);
    }

    if (init.color !== void 0) {
      this.color(init.color, tween);
    }
    if (init.opacity !== void 0) {
      this.opacity(init.opacity, tween);
    }

    if (init.labelPadding !== void 0) {
      this.labelPadding(init.labelPadding, tween);
    }
    if (init.labelPlacement !== void 0) {
      this.labelPlacement(init.labelPlacement);
    }

    if (init.font !== void 0) {
      this.font(init.font, tween);
    }
    if (init.textColor !== void 0) {
      this.textColor(init.textColor, tween);
    }

    if (init.label !== void 0) {
      this.label(init.label);
    }

    if (init.hidden !== void 0) {
      this.setHidden(init.hidden);
    }
    if (init.culled !== void 0) {
      this.setCulled(init.culled);
    }
  }

  protected onSetGeoPoint(newGeoPoint: GeoPoint | undefined, oldGeoPoint: GeoPoint | undefined): void {
    if (newGeoPoint !== void 0) {
      const oldGeoBounds = this._geoBounds;
      const newGeoBounds = new GeoBox(newGeoPoint._lng, newGeoPoint._lat, newGeoPoint._lng, newGeoPoint._lat);
      this._geoBounds = newGeoBounds;
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    this.requireUpdate(View.NeedsProject);
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsProject) !== 0 && this.label() !== null) {
      additionalFlags |= View.NeedsLayout;
    }
    additionalFlags |= super.modifyUpdate(updateFlags | additionalFlags);
    return additionalFlags;
  }

  protected onProject(viewContext: MapGraphicsViewContext): void {
    super.onProject(viewContext);
    if (this.viewPoint.isAuto()) {
      const viewPoint = viewContext.geoProjection.project(this.geoPoint.value!);
      //this.viewPoint.setAutoState(viewPoint);
      this.viewPoint._value = viewPoint;
      this.viewPoint._state = viewPoint;
    }
  }

  protected onLayout(viewContext: MapGraphicsViewContext): void {
    super.onLayout(viewContext);
    const label = this.label();
    if (label !== null) {
      this.layoutLabel(label, this.viewFrame);
    }
  }

  protected layoutLabel(label: GraphicsView, frame: BoxR2): void {
    const placement = this._labelPlacement !== void 0 ? this._labelPlacement : "auto";
    // TODO: auto placement

    const size = Math.min(frame.width, frame.height);
    const padding = this.labelPadding.value!.pxValue(size);
    const {x, y} = this.viewPoint.value!;
    let y1 = y;
    if (placement === "top") {
      y1 -= padding;
    } else if (placement === "bottom") {
      y1 += padding;
    }

    if (TypesetView.is(label)) {
      label.textAlign.setAutoState("center");
      label.textBaseline.setAutoState("bottom");
      label.textOrigin.setAutoState(new PointR2(x, y1));
    }
  }

  get viewBounds(): BoxR2 {
    const {x, y} = this.viewPoint.value!;
    return new BoxR2(x, y, x, y);
  }

  get hitBounds(): BoxR2 {
    const {x, y} = this.viewPoint.value!;
    const hitRadius = this._hitRadius !== void 0 ? this._hitRadius : 0;
    return new BoxR2(x - hitRadius, y - hitRadius, x + hitRadius, y + hitRadius);
  }

  get geoBounds(): GeoBox {
    return this._geoBounds;
  }

  hitTest(x: number, y: number, viewContext: MapGraphicsViewContext): GraphicsView | null {
    let hit = super.hitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        hit = this.hitTestPoint(x, y, context, this.viewFrame);
      }
    }
    return hit;
  }

  protected hitTestPoint(hx: number, hy: number, context: CanvasContext, frame: BoxR2): GraphicsView | null {
    const {x, y} = this.viewPoint.value!;
    const radius = this.radius.value;

    let hitRadius = this._hitRadius !== void 0 ? this._hitRadius : 0;
    if (radius !== void 0) {
      const size = Math.min(frame.width, frame.height);
      hitRadius = Math.max(hitRadius, radius.pxValue(size));
    }

    const dx = x - hx;
    const dy = y - hy;
    if (dx * dx + dy * dy < hitRadius * hitRadius) {
      return this;
    }
    return null;
  }

  toAny(): MapPointViewInit {
    const init: MapPointViewInit = {};
    if (this.geoPoint.value !== void 0) {
      init.lng = this.geoPoint.value.lng;
      init.lat = this.geoPoint.value.lat;
    }
    if (this.viewPoint.value !== void 0 && !this.viewPoint.isAuto()) {
      init.x = this.viewPoint.value.x;
      init.y = this.viewPoint.value.y;
    }
    if (this.radius.value !== void 0) {
      init.radius = this.radius.value;
    }
    if (this._hitRadius !== null) {
      init.hitRadius = this._hitRadius;
    }
    if (this.color.value !== void 0) {
      init.color = this.color.value;
    }
    if (this.opacity.value !== void 0) {
      init.opacity = this.opacity.value;
    }
    if (this.labelPadding.value !== void 0) {
      init.labelPadding = this.labelPadding.value;
    }
    if (this._labelPlacement !== void 0) {
      init.labelPlacement = this._labelPlacement;
    }
    return init;
  }

  static fromAny<X, Y>(point: AnyMapPointView): MapPointView {
    if (point instanceof MapPointView) {
      return point;
    } else if (typeof point === "object" && point !== null) {
      const view = new MapPointView();
      view.setState(point);
      return view;
    }
    throw new TypeError("" + point);
  }
}
