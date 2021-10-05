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
import {Affinity, Property} from "@swim/fastener";
import type {GeoPath} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, View} from "@swim/view";
import {
  GraphicsView,
  StrokeViewInit,
  StrokeView,
  CanvasContext,
  CanvasRenderer,
} from "@swim/graphics";
import {GeoPathViewInit, GeoPathView} from "./GeoPathView";
import type {GeoLineViewObserver} from "./GeoLineViewObserver";

export interface GeoLineViewInit extends GeoPathViewInit, StrokeViewInit {
  hitWidth?: number;
}

export class GeoLineView extends GeoPathView implements StrokeView {
  override readonly observerType?: Class<GeoLineViewObserver>;

  protected willSetStroke(newStroke: Color | null, oldStroke: Color | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetStroke !== void 0) {
        observer.viewWillSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected onSetStroke(newStroke: Color | null, oldStroke: Color | null): void {
    this.requireUpdate(View.NeedsRender);
  }

  protected didSetStroke(newStroke: Color | null, oldStroke: Color | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetStroke !== void 0) {
        observer.viewDidSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  @ThemeAnimator<GeoLineView, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    inherits: true,
    updateFlags: View.NeedsRender,
    willSetValue(newStroke: Color | null, oldStroke: Color | null): void {
      this.owner.willSetStroke(newStroke, oldStroke);
    },
    didSetValue(newStroke: Color | null, oldStroke: Color | null): void {
      this.owner.onSetStroke(newStroke, oldStroke);
      this.owner.didSetStroke(newStroke, oldStroke);
    },
  })
  readonly stroke!: ThemeAnimator<this, Color | null, AnyColor | null>;

  protected willSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetStrokeWidth !== void 0) {
        observer.viewWillSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  protected onSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    this.requireUpdate(View.NeedsRender);
  }

  protected didSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetStrokeWidth !== void 0) {
        observer.viewDidSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  @ThemeAnimator<GeoLineView, Length | null, AnyLength | null>({
    type: Length,
    state: null,
    inherits: true,
    updateFlags: View.NeedsRender,
    willSetValue(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.willSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
    },
    didSetValue(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.onSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
      this.owner.didSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
    },
  })
  readonly strokeWidth!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @Property({type: Number})
  readonly hitWidth!: Property<this, number | undefined>;

  protected override onSetGeoPath(newGeoPath: GeoPath, oldGeoPath: GeoPath): void {
    super.onSetGeoPath(newGeoPath, oldGeoPath);
    if (this.geoCentroid.hasAffinity(Affinity.Intrinsic)) {
      this.geoCentroid.setState(newGeoPath.centroid(), Affinity.Intrinsic);
    }
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.culled) {
      this.renderLine(renderer.context, this.viewFrame);
    }
  }

  protected renderLine(context: CanvasContext, frame: R2Box): void {
    const viewPath = this.viewPath.value;
    if (viewPath !== null && viewPath.isDefined()) {
      const stroke = this.stroke.value;
      const strokeWidth = this.strokeWidth.value;
      if (stroke !== null && strokeWidth !== null) {
        // save
        const contextLineWidth = context.lineWidth;
        const contextStrokeStyle = context.strokeStyle;

        context.beginPath();
        viewPath.draw(context);

        const size = Math.min(frame.width, frame.height);
        context.lineWidth = strokeWidth.pxValue(size);
        context.strokeStyle = stroke.toString();
        context.stroke();

        // restore
        context.lineWidth = contextLineWidth;
        context.strokeStyle = contextStrokeStyle;
      }
    }
  }

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const p = renderer.transform.transform(x, y);
      return this.hitTestLine(p.x, p.y, renderer.context, this.viewFrame);
    }
    return null;
  }

  protected hitTestLine(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const viewPath = this.viewPath.value;
    if (viewPath !== null && viewPath.isDefined()) {
      if (this.stroke.value !== null) {
        // save
        const contextLineWidth = context.lineWidth;

        context.beginPath();
        viewPath.draw(context);

        let hitWidth = this.hitWidth.getStateOr(0);
        const strokeWidth = this.strokeWidth.value;
        if (strokeWidth !== null) {
          const size = Math.min(frame.width, frame.height);
          hitWidth = Math.max(hitWidth, strokeWidth.pxValue(size));
        }
        context.lineWidth = hitWidth;
        const pointInStroke = context.isPointInStroke(x, y);

        // restore
        context.lineWidth = contextLineWidth;

        if (pointInStroke) {
          return this;
        }
      }
    }
    return null;
  }

  override init(init: GeoLineViewInit): void {
    super.init(init);
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
}
