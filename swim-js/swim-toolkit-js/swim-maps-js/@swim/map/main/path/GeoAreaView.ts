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

import {AnyLength, Length, R2Box} from "@swim/math";
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
import {GeoPathViewInit, GeoPathView} from "./GeoPathView";
import type {GeoAreaViewObserver} from "./GeoAreaViewObserver";

export interface GeoAreaViewInit extends GeoPathViewInit, FillViewInit, StrokeViewInit {
  clipViewport?: true;
}

export class GeoAreaView extends GeoPathView implements FillView, StrokeView {
  override initView(init: GeoAreaViewInit): void {
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

  override readonly viewObservers!: ReadonlyArray<GeoAreaViewObserver>;

  protected willSetFill(newFill: Color | null, oldFill: Color | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetFill !== void 0) {
        viewObserver.viewWillSetFill(newFill, oldFill, this);
      }
    }
  }

  protected onSetFill(newFill: Color | null, oldFill: Color | null): void {
    this.requireUpdate(View.NeedsRender);
  }

  protected didSetFill(newFill: Color | null, oldFill: Color | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetFill !== void 0) {
        viewObserver.viewDidSetFill(newFill, oldFill, this);
      }
    }
  }

  @ViewAnimator<GeoAreaView, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    inherit: true,
    willSetValue(newFill: Color | null, oldFill: Color | null): void {
      this.owner.willSetFill(newFill, oldFill);
    },
    didSetValue(newFill: Color | null, oldFill: Color | null): void {
      this.owner.onSetFill(newFill, oldFill);
      this.owner.didSetFill(newFill, oldFill);
    },
  })
  readonly fill!: ViewAnimator<this, Color | null, AnyColor | null>;

  protected willSetStroke(newStroke: Color | null, oldStroke: Color | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetStroke !== void 0) {
        viewObserver.viewWillSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected onSetStroke(newStroke: Color | null, oldStroke: Color | null): void {
    this.requireUpdate(View.NeedsRender);
  }

  protected didSetStroke(newStroke: Color | null, oldStroke: Color | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetStroke !== void 0) {
        viewObserver.viewDidSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  @ViewAnimator<GeoAreaView, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    inherit: true,
    willSetValue(newStroke: Color | null, oldStroke: Color | null): void {
      this.owner.willSetStroke(newStroke, oldStroke);
    },
    didSetValue(newStroke: Color | null, oldStroke: Color | null): void {
      this.owner.onSetStroke(newStroke, oldStroke);
      this.owner.didSetStroke(newStroke, oldStroke);
    },
  })
  readonly stroke!: ViewAnimator<this, Color | null, AnyColor | null>;

  protected willSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetStrokeWidth !== void 0) {
        viewObserver.viewWillSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  protected onSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    this.requireUpdate(View.NeedsRender);
  }

  protected didSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetStrokeWidth !== void 0) {
        viewObserver.viewDidSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  @ViewAnimator<GeoAreaView, Length | null, AnyLength | null>({
    type: Length,
    state: null,
    inherit: true,
    willSetValue(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.willSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
    },
    didSetValue(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.onSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
      this.owner.didSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
    },
  })
  readonly strokeWidth!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewProperty({type: Boolean, state: true})
  readonly clipViewport!: ViewProperty<this, boolean>;

  protected override onSetGeoPath(newGeoPath: GeoPath, oldGeoPath: GeoPath): void {
    super.onSetGeoPath(newGeoPath, oldGeoPath);
    if (this.geoCentroid.takesPrecedence(View.Intrinsic)) {
      this.geoCentroid.setState(newGeoPath.centroid(), View.Intrinsic);
    }
  }

  override cullGeoFrame(geoFrame: GeoBox = this.geoFrame): void {
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

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderArea(context, this.viewFrame);
      context.restore();
    }
  }

  protected renderArea(context: CanvasContext, frame: R2Box): void {
    const viewPath = this.viewPath.value;
    if (viewPath !== null && viewPath.isDefined()) {
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

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
      const p = renderer.transform.transform(x, y);
      const hit = this.hitTestArea(p.x, p.y, context, this.viewFrame);
      context.restore();
      return hit;
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

  static override create(): GeoAreaView {
    return new GeoAreaView();
  }

  static fromInit(init: GeoAreaViewInit): GeoAreaView {
    const view = new GeoAreaView();
    view.initView(init);
    return view;
  }
}
