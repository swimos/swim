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

import {AnyPointR2, PointR2, BoxR2, SegmentR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {View, MemberAnimator, RenderedView, StrokeViewInit, StrokeView} from "@swim/view";
import {AnyGeoPoint, GeoPoint} from "../geo/GeoPoint";
import {GeoBox} from "../geo/GeoBox";
import {MapViewContext} from "../MapViewContext";
import {MapViewInit} from "../MapView";
import {MapGraphicsView} from "../graphics/MapGraphicsView";
import {MapGraphicsViewController} from "../graphics/MapGraphicsViewController";

export type AnyMapLineView = MapLineView | MapLineViewInit;

export interface MapLineViewInit extends MapViewInit, StrokeViewInit {
  geoStart?: AnyGeoPoint;
  geoEnd?: AnyGeoPoint;
  viewStart?: AnyPointR2;
  viewEnd?: AnyPointR2;
  hitWidth?: number;
}

export class MapLineView extends MapGraphicsView implements StrokeView {
  /** @hidden */
  _hitWidth?: number;
  /** @hidden */
  _geoBounds: GeoBox;

  constructor() {
    super();
    this._geoBounds = GeoBox.empty();
    this.geoStart.onUpdate = this.onSetGeoStart.bind(this);
    this.geoEnd.onUpdate = this.onSetGeoEnd.bind(this);
  }

  get viewController(): MapGraphicsViewController<MapLineView> | null {
    return this._viewController;
  }

  @MemberAnimator(GeoPoint, {value: GeoPoint.origin()})
  geoStart: MemberAnimator<this, GeoPoint, AnyGeoPoint>;

  @MemberAnimator(GeoPoint, {value: GeoPoint.origin()})
  geoEnd: MemberAnimator<this, GeoPoint, AnyGeoPoint>;

  @MemberAnimator(PointR2, {value: PointR2.origin()})
  viewStart: MemberAnimator<this, PointR2, AnyPointR2>;

  @MemberAnimator(PointR2, {value: PointR2.origin()})
  viewEnd: MemberAnimator<this, PointR2, AnyPointR2>;

  @MemberAnimator(Color, {inherit: true})
  stroke: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length, {inherit: true})
  strokeWidth: MemberAnimator<this, Length, AnyLength>;

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
    const newGeoEnd = this.geoEnd.value!;
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
    const newGeoStart = this.geoEnd.value!;
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

  protected onProject(viewContext: MapViewContext): void {
    super.onProject(viewContext);
    const geoProjection = viewContext.geoProjection;
    let viewStart: PointR2;
    let viewEnd: PointR2;
    if (this.viewStart.isAuto()) {
      viewStart = geoProjection.project(this.geoStart.value!);
      this.viewStart.setAutoState(viewStart);
    } else {
      viewStart = this.viewStart.value!;
    }
    if (this.viewEnd.isAuto()) {
      viewEnd = geoProjection.project(this.geoEnd.value!);
      this.viewEnd.setAutoState(viewEnd);
    } else {
      viewEnd = this.viewEnd.value!;
    }
    const x0 = viewStart.x;
    const y0 = viewStart.y;
    const x1 = viewEnd.x;
    const y1 = viewEnd.y;
    const invalid = !isFinite(x0) || isFinite(y0) || !isFinite(x1) || !isFinite(y1);
    const culled = invalid || !this.viewFrame.intersectsSegment(new SegmentR2(x0, y0, x1, y1));
    this.setCulled(culled);
  }

  protected onRender(viewContext: MapViewContext): void {
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
        const viewStart = this.viewStart.value!;
        const viewEnd = this.viewEnd.value!;
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
    const viewStart = this.viewStart.value!;
    const viewEnd = this.viewEnd.value!;
    const xMid = (viewStart.x + viewEnd.x) / 2;
    const yMid = (viewStart.y + viewEnd.y) / 2;
    const inversePageTransform = this.pageTransform.inverse();
    const [px, py] = inversePageTransform.transform(xMid, yMid);
    return new BoxR2(px, py, px, py);
  }

  get viewBounds(): BoxR2 {
    const viewStart = this.viewStart.value!;
    const x0 = viewStart.x;
    const y0 = viewStart.y;
    const viewEnd = this.viewEnd.value!;
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

  hitTest(x: number, y: number, viewContext: MapViewContext): RenderedView | null {
    let hit = super.hitTest(x, y, viewContext);
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

  protected hitTestLine(x: number, y: number, context: CanvasContext, frame: BoxR2): RenderedView | null {
    const viewStart = this.viewStart.value!;
    const viewEnd = this.viewEnd.value!;

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
      const view = new MapLineView();
      if (line.geoStart !== void 0) {
        view.geoStart(line.geoStart);
      }
      if (line.geoEnd !== void 0) {
        view.geoEnd(line.geoEnd);
      }
      if (line.stroke !== void 0) {
        view.stroke(line.stroke);
      }
      if (line.strokeWidth !== void 0) {
        view.strokeWidth(line.strokeWidth);
      }
      if (line.hitWidth !== void 0) {
        view.hitWidth(line.hitWidth);
      }
      if (line.hidden !== void 0) {
        view.setHidden(line.hidden);
      }
      if (line.culled !== void 0) {
        view.setCulled(line.culled);
      }
      return view;
    }
    throw new TypeError("" + line);
  }
}
