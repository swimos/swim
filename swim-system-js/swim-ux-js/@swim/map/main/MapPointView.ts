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

import {Objects} from "@swim/util";
import {PointR2, BoxR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {MemberAnimator, View, RenderedView, TypesetView} from "@swim/view";
import {AnyTextRunView, TextRunView} from "@swim/typeset";
import {AnyLngLat, LngLat} from "./LngLat";
import {MapViewContext} from "./MapViewContext";
import {MapView} from "./MapView";
import {MapGraphicsView} from "./MapGraphicsView";
import {MapGraphicsViewController} from "./MapGraphicsViewController";
import {MapPointLabelPlacement, AnyMapPoint} from "./MapPoint";

export type AnyMapPointView = MapPointView | AnyMapPoint;

export class MapPointView extends MapGraphicsView {
  /** @hidden */
  _viewController: MapGraphicsViewController<MapPointView> | null;
  /** @hidden */
  _hitRadius: number;
  /** @hidden */
  _labelPlacement: MapPointLabelPlacement;

  constructor(coord: LngLat = LngLat.origin(), key?: string) {
    super(key);
    this.coord.setState(coord);
    this._hitRadius = 5;
    this._labelPlacement = "auto";
  }

  get viewController(): MapGraphicsViewController<MapPointView> | null {
    return this._viewController;
  }

  get lng(): number {
    return this.coord.value!.lng;
  }

  get lat(): number {
    return this.coord.value!.lat;
  }

  get x(): number {
    return this._anchor.x;
  }

  get y(): number {
    return this._anchor.y;
  }

  @MemberAnimator(LngLat)
  coord: MemberAnimator<this, LngLat, AnyLngLat>;

  @MemberAnimator(Length)
  r: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color)
  color: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Number)
  opacity: MemberAnimator<this, number>;

  @MemberAnimator(Length)
  labelPadding: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Font, {inherit: true})
  font: MemberAnimator<this, Font, AnyFont>;

  @MemberAnimator(Color, {inherit: true})
  textColor: MemberAnimator<this, Color, AnyColor>;

  hitRadius(): number;
  hitRadius(hitRadius: number): this;
  hitRadius(hitRadius?: number): number | this {
    if (hitRadius === void 0) {
      return this._hitRadius;
    } else {
      this._hitRadius = hitRadius;
      return this;
    }
  }

  label(): View | null;
  label(label: View | AnyTextRunView | null): this;
  label(label?: View | AnyTextRunView | null): View | null | this {
    if (label === void 0) {
      return this.getChildView("label");
    } else {
      if (label !== null && !(label instanceof View)) {
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
      return this._labelPlacement;
    } else {
      this._labelPlacement = labelPlacement;
      return this;
    }
  }

  isGradientStop(): boolean {
    return !!this.color.value || typeof this.opacity.value === "number";
  }

  needsUpdate(updateFlags: number, viewContext: MapViewContext): number {
    if ((updateFlags & (View.NeedsAnimate | View.NeedsLayout)) !== 0) {
      updateFlags = updateFlags | View.NeedsAnimate | View.NeedsLayout | View.NeedsRender;
    }
    return updateFlags;
  }

  protected onAnimate(viewContext: MapViewContext): void {
    const t = viewContext.updateTime;
    const oldCoord = this.coord.value!;
    this.coord.onFrame(t);
    const newCoord = this.coord.value!;

    this.r.onFrame(t);

    this.color.onFrame(t);
    this.opacity.onFrame(t);

    this.labelPadding.onFrame(t);

    this.font.onFrame(t);
    this.textColor.onFrame(t);

    if (!Objects.equal(oldCoord, newCoord)) {
      this.requireUpdate(MapView.NeedsProject);
    }
  }

  protected onProject(viewContext: MapViewContext): void {
    const projection = viewContext.projection;
    const anchor = projection.project(this.coord.value!);
    this._hitBounds = new BoxR2(anchor.x, anchor.y, anchor.x, anchor.y);
    this.setAnchor(anchor);
  }

  protected onLayout(viewContext: MapViewContext): void {
    const bounds = this._bounds;
    const anchor = this._anchor;
    const invalid = !isFinite(anchor.x) || isFinite(anchor.y);
    const culled = invalid || !bounds.intersectsPoint(anchor);

    const label = this.label();
    if (RenderedView.is(label)) {
      this.layoutLabel(label, this._bounds, this._anchor);
    }

    this.setCulled(culled);
    this.layoutChildViews(viewContext);
  }

  protected layoutLabel(label: RenderedView, bounds: BoxR2, anchor: PointR2): void {
    const placement = this._labelPlacement;
    // TODO: auto placement

    const padding = this.labelPadding.value!.pxValue(Math.min(bounds.width, bounds.height));
    const x = anchor.x;
    const y0 = anchor.y;
    let y1 = y0;
    if (placement === "top") {
      y1 -= padding;
    } else if (placement === "bottom") {
      y1 += padding;
    }

    const labelAnchor = new PointR2(x, y1);
    label.setAnchor(labelAnchor);
    if (TypesetView.is(label)) {
      label.textAlign("center");
      label.textBaseline("bottom");
    }
  }

  hitTest(x: number, y: number, viewContext: MapViewContext): RenderedView | null {
    let hit = super.hitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        hit = this.hiteTestPoint(x, y, context, this._bounds, this._anchor);
      }
    }
    return hit;
  }

  protected hiteTestPoint(x: number, y: number, context: CanvasContext,
                          bounds: BoxR2, anchor: PointR2): RenderedView | null {
    let hitRadius = this._hitRadius;
    const radius = this.r.value;
    if (radius) {
      const bounds = this.bounds;
      const size = Math.min(bounds.width, bounds.height);
      hitRadius = Math.max(hitRadius, radius.pxValue(size));
    }

    const dx = anchor.x - x;
    const dy = anchor.y - y;
    if (dx * dx + dy * dy < hitRadius * hitRadius) {
      return this;
    }
    return null;
  }

  static fromAny<X, Y>(point: AnyMapPointView): MapPointView {
    if (point instanceof MapPointView) {
      return point;
    } else if (typeof point === "object" && point) {
      const coord = LngLat.fromAny(point.coord);
      const view = new MapPointView(coord, point.key);

      if (point.r !== void 0) {
        view.r(point.r);
      }

      if (point.hitRadius !== void 0) {
        view.hitRadius(point.hitRadius);
      }

      if (point.color !== void 0) {
        view.color(point.color);
      }
      if (point.opacity !== void 0) {
        view.opacity(point.opacity);
      }

      if (point.labelPadding !== void 0) {
        view.labelPadding(point.labelPadding);
      }
      if (point.labelPlacement !== void 0) {
        view.labelPlacement(point.labelPlacement);
      }

      if (point.font !== void 0) {
        view.font(point.font);
      }
      if (point.textColor !== void 0) {
        view.textColor(point.textColor);
      }

      if (point.label !== void 0) {
        view.label(point.label);
      }

      return view;
    }
    throw new TypeError("" + point);
  }
}
