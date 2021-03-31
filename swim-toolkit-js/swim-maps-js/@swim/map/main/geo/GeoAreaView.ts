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

import {AnyLength, Length, BoxR2} from "@swim/math";
import type {GeoBox, GeoPath} from "@swim/geo";
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
import {GeoPathViewInit, GeoPathView} from "./GeoPathView";
import type {GeoAreaViewObserver} from "./GeoAreaViewObserver";

export interface GeoAreaViewInit extends GeoPathViewInit, FillViewInit, StrokeViewInit {
  clipViewport?: true;
}

export class GeoAreaView extends GeoPathView implements FillView, StrokeView {
  initView(init: GeoAreaViewInit): void {
    super.initView(init);
    if (init.fill !== void 0) {
      this.fill(init.fill);
    }
    if (init.stroke !== void 0) {
      this.stroke(init.stroke);
    }
    if (init.strokeWidth !== void 0) {
      this.strokeWidth(init.strokeWidth);
    }
    if (init.clipViewport !== void 0) {
      this.clipViewport(init.clipViewport);
    }
  }

  declare readonly viewController: MapGraphicsViewController<GeoAreaView> & GeoAreaViewObserver | null;

  declare readonly viewObservers: ReadonlyArray<GeoAreaViewObserver>;

  @ViewAnimator({type: Color, state: null, inherit: true})
  declare fill: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Color, state: null, inherit: true})
  declare stroke: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Length, state: null, inherit: true})
  declare strokeWidth: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewProperty({type: Boolean, state: true})
  declare clipViewport: ViewProperty<this, boolean>;

  protected onSetGeoPath(newGeoPath: GeoPath, oldGeoPath: GeoPath): void {
    super.onSetGeoPath(newGeoPath, oldGeoPath);
    if (this.geoCentroid.isPrecedent(View.Intrinsic)) {
      this.geoCentroid.setState(newGeoPath.centroid(), View.Intrinsic);
    }
  }

  cullGeoFrame(geoFrame: GeoBox = this.geoFrame): void {
    let culled: boolean;
    if (geoFrame.intersects(this.geoBounds)) {
      const frame = this.viewFrame;
      const bounds = this.viewBounds;
      // check if 9x9 view frame fully contains view bounds
      const contained = !this.clipViewport.state
                     || frame.xMin - 4 * frame.width <= bounds.xMin
                     && bounds.xMax <= frame.xMax + 4 * frame.width
                     && frame.yMin - 4 * frame.height <= bounds.yMin
                     && bounds.yMax <= frame.yMax + 4 * frame.height;
      culled = !contained || !frame.intersects(bounds);
    } else {
      culled = true;
    }
    this.setCulled(culled);
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderArea(context, this.viewFrame);
      context.restore();
    }
  }

  protected renderArea(context: CanvasContext, frame: BoxR2): void {
    const viewPath = this.viewPath.getValue();
    if (viewPath.isDefined()) {
      context.beginPath();
      viewPath.draw(context);
      const fill = this.fill.value;
      if (fill !== null) {
        context.fillStyle = fill.toString();
        context.fill();
      }
      const stroke = this.stroke.value;
      const strokeWidth = this.strokeWidth.value;
      if (stroke !== null && strokeWidth !== null) {
        const size = Math.min(frame.width, frame.height);
        context.lineWidth = strokeWidth.pxValue(size);
        context.strokeStyle = stroke.toString();
        context.stroke();
      }
    }
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
        hit = this.hitTestArea(x, y, context, this.viewFrame);
        context.restore();
      }
    }
    return hit;
  }

  protected hitTestArea(x: number, y: number, context: CanvasContext, frame: BoxR2): GraphicsView | null {
    const viewPath = this.viewPath.getValue();
    if (viewPath.isDefined()) {
      context.beginPath();
      viewPath.draw(context);
      if (this.fill.value !== null && context.isPointInPath(x, y)) {
        return this;
      }
      if (this.stroke.value !== null) {
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

  static create(): GeoAreaView {
    return new GeoAreaView();
  }

  static fromInit(init: GeoAreaViewInit): GeoAreaView {
    const view = new GeoAreaView();
    view.initView(init);
    return view;
  }
}
