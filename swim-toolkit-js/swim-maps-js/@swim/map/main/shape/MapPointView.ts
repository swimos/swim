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
import {
  ViewContextType,
  ViewFlags,
  View,
  ViewAnimator,
  GraphicsView,
  TypesetView,
} from "@swim/view";
import {AnyTextRunView, TextRunView} from "@swim/typeset";
import {AnyGeoPoint, GeoPointInit, GeoPointTuple, GeoPoint} from "../geo/GeoPoint";
import {GeoBox} from "../geo/GeoBox";
import {MapGraphicsViewInit} from "../graphics/MapGraphicsView";
import {MapLayerView} from "../graphics/MapLayerView";

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

export class MapPointView extends MapLayerView {
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

  initView(init: MapPointViewInit): void {
    super.initView(init);
    this.setState(init);
  }

  @ViewAnimator({type: GeoPoint, state: GeoPoint.origin()})
  geoPoint: ViewAnimator<this, GeoPoint, AnyGeoPoint>;

  @ViewAnimator({type: PointR2, state: PointR2.origin()})
  viewPoint: ViewAnimator<this, PointR2, AnyPointR2>;

  @ViewAnimator({type: Length})
  radius: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  @ViewAnimator({type: Color})
  color: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  @ViewAnimator({type: Number})
  opacity: ViewAnimator<this, number | undefined>;

  @ViewAnimator({type: Length})
  labelPadding: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  @ViewAnimator({type: Font, inherit: true})
  font: ViewAnimator<this, Font | undefined, AnyFont | undefined>;

  @ViewAnimator({type: Color, inherit: true})
  textColor: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

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

  protected modifyUpdate(targetView: View, updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsProject) !== 0 && this.label() !== null) {
      additionalFlags |= View.NeedsLayout;
    }
    additionalFlags |= super.modifyUpdate(targetView, updateFlags | additionalFlags);
    return additionalFlags;
  }

  protected onProject(viewContext: ViewContextType<this>): void {
    super.onProject(viewContext);
    if (this.viewPoint.isAuto()) {
      const viewPoint = viewContext.geoProjection.project(this.geoPoint.getValue());
      //this.viewPoint.setAutoState(viewPoint);
      this.viewPoint._value = viewPoint;
      this.viewPoint._state = viewPoint;
    }
  }

  protected onLayout(viewContext: ViewContextType<this>): void {
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
    const padding = this.labelPadding.getValue().pxValue(size);
    const {x, y} = this.viewPoint.getValue();
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
    const {x, y} = this.viewPoint.getValue();
    return new BoxR2(x, y, x, y);
  }

  get hitBounds(): BoxR2 {
    const {x, y} = this.viewPoint.getValue();
    const hitRadius = this._hitRadius !== void 0 ? this._hitRadius : 0;
    return new BoxR2(x - hitRadius, y - hitRadius, x + hitRadius, y + hitRadius);
  }

  get geoBounds(): GeoBox {
    return this._geoBounds;
  }

  protected doHitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    let hit = super.doHitTest(x, y, viewContext);
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
    const {x, y} = this.viewPoint.getValue();
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

  static fromAny(point: AnyMapPointView): MapPointView {
    if (point instanceof MapPointView) {
      return point;
    } else if (point instanceof GeoPoint || GeoPoint.isTuple(point)) {
      return MapPointView.fromGeoPoint(point);
    } else if (typeof point === "object" && point !== null) {
      return MapPointView.fromInit(point);
    }
    throw new TypeError("" + point);
  }

  static fromGeoPoint<X, Y>(point: AnyGeoPoint): MapPointView {
    const view = new MapPointView();
    view.setState(point);
    return view;
  }

  static fromInit<X, Y>(init: MapPointViewInit): MapPointView {
    const view = new MapPointView();
    view.initView(init);
    return view;
  }
}
