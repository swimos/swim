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

import {AnyPointR2, PointR2, BoxR2, SegmentR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {
  ViewContextType,
  View,
  ViewAnimator,
  GraphicsView,
  StrokeViewInit,
  StrokeView,
} from "@swim/view";
import {AnyGeoPoint, GeoPoint} from "../geo/GeoPoint";
import {GeoBox} from "../geo/GeoBox";
import {MapGraphicsViewInit} from "../graphics/MapGraphicsView";
import {MapLayerView} from "../graphics/MapLayerView";

export type AnyMapLineView = MapLineView | MapLineViewInit;

export interface MapLineViewInit extends MapGraphicsViewInit, StrokeViewInit {
  geoStart?: AnyGeoPoint;
  geoEnd?: AnyGeoPoint;
  viewStart?: AnyPointR2;
  viewEnd?: AnyPointR2;
  hitWidth?: number;
}

export class MapLineView extends MapLayerView implements StrokeView {
  /** @hidden */
  _hitWidth?: number;
  /** @hidden */
  _geoBounds: GeoBox;

  constructor() {
    super();
    this._geoBounds = GeoBox.undefined();
    this.geoStart.onUpdate = this.onSetGeoStart.bind(this);
    this.geoEnd.onUpdate = this.onSetGeoEnd.bind(this);
  }

  initView(init: MapLineViewInit): void {
    super.initView(init);
    if (init.geoStart !== void 0) {
      this.geoStart(init.geoStart);
    }
    if (init.geoEnd !== void 0) {
      this.geoEnd(init.geoEnd);
    }
    if (init.stroke !== void 0) {
      this.stroke(init.stroke);
    }
    if (init.strokeWidth !== void 0) {
      this.strokeWidth(init.strokeWidth);
    }
    if (init.hitWidth !== void 0) {
      this.hitWidth(init.hitWidth);
    }
  }

  @ViewAnimator({type: GeoPoint, state: GeoPoint.origin()})
  geoStart: ViewAnimator<this, GeoPoint, AnyGeoPoint>;

  @ViewAnimator({type: GeoPoint, state: GeoPoint.origin()})
  geoEnd: ViewAnimator<this, GeoPoint, AnyGeoPoint>;

  @ViewAnimator({type: PointR2, state: PointR2.origin()})
  viewStart: ViewAnimator<this, PointR2, AnyPointR2>;

  @ViewAnimator({type: PointR2, state: PointR2.origin()})
  viewEnd: ViewAnimator<this, PointR2, AnyPointR2>;

  @ViewAnimator({type: Color, inherit: true})
  stroke: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  @ViewAnimator({type: Length, inherit: true})
  strokeWidth: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  hitWidth(): number | null;
  hitWidth(hitWidth: number | null): this;
  hitWidth(hitWidth?: number | null): number | null | this {
    if (hitWidth === void 0) {
      return this._hitWidth !== void 0 ? this._hitWidth : null;
    } else {
      if (hitWidth !== null) {
        this._hitWidth = hitWidth;
      } else if (this._hitWidth !== void 0) {
        this._hitWidth = void 0;
      }
      return this;
    }
  }

  protected onSetGeoStart(newGeoStart: GeoPoint | undefined, oldGeoStart: GeoPoint | undefined): void {
    const newGeoEnd = this.geoEnd.getValue();
    if (newGeoStart !== void 0 && newGeoEnd !== void 0) {
      const oldGeoBounds = this._geoBounds;
      const newGeoBounds = new GeoBox(Math.min(newGeoStart.lng, newGeoEnd.lng),
                                      Math.min(newGeoStart.lat, newGeoEnd.lat),
                                      Math.max(newGeoStart.lng, newGeoEnd.lng),
                                      Math.max(newGeoStart.lat, newGeoEnd.lat));
      this._geoBounds = newGeoBounds;
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    this.requireUpdate(View.NeedsProject);
  }

  protected onSetGeoEnd(newGeoEnd: GeoPoint | undefined, oldGeoEnd: GeoPoint | undefined): void {
    const newGeoStart = this.geoEnd.getValue();
    if (newGeoStart !== void 0 && newGeoEnd !== void 0) {
      const oldGeoBounds = this._geoBounds;
      const newGeoBounds = new GeoBox(Math.min(newGeoStart.lng, newGeoEnd.lng),
                                      Math.min(newGeoStart.lat, newGeoEnd.lat),
                                      Math.max(newGeoStart.lng, newGeoEnd.lng),
                                      Math.max(newGeoStart.lat, newGeoEnd.lat));
      this._geoBounds = newGeoBounds;
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    this.requireUpdate(View.NeedsProject);
  }

  protected onProject(viewContext: ViewContextType<this>): void {
    super.onProject(viewContext);
    const geoProjection = viewContext.geoProjection;
    let viewStart: PointR2;
    let viewEnd: PointR2;
    if (this.viewStart.isAuto()) {
      viewStart = geoProjection.project(this.geoStart.getValue());
      this.viewStart.setAutoState(viewStart);
    } else {
      viewStart = this.viewStart.getValue();
    }
    if (this.viewEnd.isAuto()) {
      viewEnd = geoProjection.project(this.geoEnd.getValue());
      this.viewEnd.setAutoState(viewEnd);
    } else {
      viewEnd = this.viewEnd.getValue();
    }
    const x0 = viewStart.x;
    const y0 = viewStart.y;
    const x1 = viewEnd.x;
    const y1 = viewEnd.y;
    const invalid = !isFinite(x0) || isFinite(y0) || !isFinite(x1) || !isFinite(y1);
    const culled = invalid || !this.viewFrame.intersectsSegment(new SegmentR2(x0, y0, x1, y1));
    this.setCulled(culled);
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderLine(context, this.viewFrame);
      context.restore();
    }
  }

  protected renderLine(context: CanvasContext, frame: BoxR2): void {
    const stroke = this.stroke.value;
    if (stroke !== void 0) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth !== void 0) {
        const size = Math.min(frame.width, frame.height);
        const viewStart = this.viewStart.getValue();
        const viewEnd = this.viewEnd.getValue();
        context.beginPath();
        context.moveTo(viewStart.x, viewStart.y);
        context.lineTo(viewEnd.x, viewEnd.y);
        context.lineWidth = strokeWidth.pxValue(size);
        context.strokeStyle = stroke.toString();
        context.stroke();
      }
    }
  }

  get popoverFrame(): BoxR2 {
    const viewStart = this.viewStart.getValue();
    const viewEnd = this.viewEnd.getValue();
    const xMid = (viewStart.x + viewEnd.x) / 2;
    const yMid = (viewStart.y + viewEnd.y) / 2;
    const inversePageTransform = this.pageTransform.inverse();
    const [px, py] = inversePageTransform.transform(xMid, yMid);
    return new BoxR2(px, py, px, py);
  }

  get viewBounds(): BoxR2 {
    const viewStart = this.viewStart.getValue();
    const x0 = viewStart.x;
    const y0 = viewStart.y;
    const viewEnd = this.viewEnd.getValue();
    const x1 = viewEnd.x;
    const y1 = viewEnd.y;
    return new BoxR2(Math.min(x0, x1), Math.min(y0, y1),
                     Math.max(x0, x1), Math.max(y0, y1));
  }

  get hitBounds(): BoxR2 {
    return this.viewBounds;
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
        context.save();
        x *= renderer.pixelRatio;
        y *= renderer.pixelRatio;
        hit = this.hitTestLine(x, y, context, this.viewFrame);
        context.restore();
      }
    }
    return hit;
  }

  protected hitTestLine(x: number, y: number, context: CanvasContext, frame: BoxR2): GraphicsView | null {
    const viewStart = this.viewStart.getValue();
    const viewEnd = this.viewEnd.getValue();

    let hitWidth = this._hitWidth !== void 0 ? this._hitWidth : 0;
    const strokeWidth = this.strokeWidth.value;
    if (strokeWidth !== void 0) {
      const size = Math.min(frame.width, frame.height);
      hitWidth = Math.max(hitWidth, strokeWidth.pxValue(size));
    }

    context.beginPath();
    context.moveTo(viewStart.x, viewStart.y);
    context.lineTo(viewEnd.x, viewEnd.y);
    context.lineWidth = hitWidth;
    if (context.isPointInStroke(x, y)) {
      return this;
    }
    return null;
  }

  static fromAny(line: AnyMapLineView): MapLineView {
    if (line instanceof MapLineView) {
      return line;
    } else if (typeof line === "object" && line !== null) {
      return MapLineView.fromInit(line);
    }
    throw new TypeError("" + line);
  }

  static fromInit(init: MapLineViewInit): MapLineView {
    const view = new MapLineView();
    view.initView(init);
    return view;
  }
}
