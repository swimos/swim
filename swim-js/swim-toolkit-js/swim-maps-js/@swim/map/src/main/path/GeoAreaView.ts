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

import type {Class} from "@swim/util";
import {AnyLength, Length, R2Box} from "@swim/math";
import {Property} from "@swim/component";
import type {GeoBox} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, View} from "@swim/view";
import {
  GraphicsView,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
  PaintingContext,
  PaintingRenderer,
  CanvasContext,
  CanvasRenderer,
} from "@swim/graphics";
import {GeoPathViewInit, GeoPathView} from "./GeoPathView";
import type {GeoAreaViewObserver} from "./GeoAreaViewObserver";

/** @public */
export interface GeoAreaViewInit extends GeoPathViewInit, FillViewInit, StrokeViewInit {
  clipViewport?: true;
}

/** @public */
export class GeoAreaView extends GeoPathView implements FillView, StrokeView {
  override readonly observerType?: Class<GeoAreaViewObserver>;

  @ThemeAnimator<GeoAreaView, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    inherits: true,
    updateFlags: View.NeedsRender,
    willSetValue(newFill: Color | null, oldFill: Color | null): void {
      this.owner.callObservers("viewWillSetFill", newFill, oldFill, this.owner);
    },
    didSetValue(newFill: Color | null, oldFill: Color | null): void {
      this.owner.callObservers("viewDidSetFill", newFill, oldFill, this.owner);
    },
  })
  readonly fill!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator<GeoAreaView, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    inherits: true,
    updateFlags: View.NeedsRender,
    willSetValue(newStroke: Color | null, oldStroke: Color | null): void {
      this.owner.callObservers("viewWillSetStroke", newStroke, oldStroke, this.owner);
    },
    didSetValue(newStroke: Color | null, oldStroke: Color | null): void {
      this.owner.callObservers("viewDidSetStroke", newStroke, oldStroke, this.owner);
    },
  })
  readonly stroke!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator<GeoAreaView, Length | null, AnyLength | null>({
    type: Length,
    state: null,
    inherits: true,
    updateFlags: View.NeedsRender,
    willSetValue(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.callObservers("viewWillSetStrokeWidth", newStrokeWidth, oldStrokeWidth, this.owner);
    },
    didSetValue(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.callObservers("viewDidSetStrokeWidth", newStrokeWidth, oldStrokeWidth, this.owner);
    },
  })
  readonly strokeWidth!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @Property({type: Boolean, state: true})
  readonly clipViewport!: Property<this, boolean>;

  override cullGeoFrame(geoFrame: GeoBox = this.geoFrame): void {
    let culled: boolean;
    if (geoFrame.intersects(this.geoBounds)) {
      const viewFrame = this.viewContext.viewFrame;
      const bounds = this.viewBounds;
      // check if 9x9 view frame fully contains view bounds
      const contained = !this.clipViewport.state
                     || viewFrame.xMin - 4 * viewFrame.width <= bounds.xMin
                     && bounds.xMax <= viewFrame.xMax + 4 * viewFrame.width
                     && viewFrame.yMin - 4 * viewFrame.height <= bounds.yMin
                     && bounds.yMax <= viewFrame.yMax + 4 * viewFrame.height;
      culled = !contained || !viewFrame.intersects(bounds);
    } else {
      culled = true;
    }
    this.setCulled(culled);
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled) {
      this.renderArea(renderer.context, viewContext.viewFrame);
    }
  }

  protected renderArea(context: PaintingContext, frame: R2Box): void {
    const viewPath = this.viewPath.value;
    if (viewPath !== null && viewPath.isDefined()) {
      // save
      const contextFillStyle = context.fillStyle;
      const contextLineWidth = context.lineWidth;
      const contextStrokeStyle = context.strokeStyle;

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

      // restore
      context.fillStyle = contextFillStyle;
      context.lineWidth = contextLineWidth;
      context.strokeStyle = contextStrokeStyle;
    }
  }

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const p = renderer.transform.transform(x, y);
      return this.hitTestArea(p.x, p.y, renderer.context, viewContext.viewFrame);
    }
    return null;
  }

  protected hitTestArea(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const viewPath = this.viewPath.value;
    if (viewPath !== null && viewPath.isDefined()) {
      context.beginPath();
      viewPath.draw(context);
      if (this.fill.value !== null && context.isPointInPath(x, y)) {
        return this;
      }
      if (this.stroke.value !== null) {
        const strokeWidth = this.strokeWidth.value;
        if (strokeWidth !== null) {
          // save
          const contextLineWidth = context.lineWidth;

          const size = Math.min(frame.width, frame.height);
          context.lineWidth = strokeWidth.pxValue(size);
          const pointInStroke = context.isPointInStroke(x, y);

          // restore
          context.lineWidth = contextLineWidth;

          if (pointInStroke) {
            return this;
          }
        }
      }
    }
    return null;
  }

  override init(init: GeoAreaViewInit): void {
    super.init(init);
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
}
