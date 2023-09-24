// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {Animator} from "@swim/component";
import {Length} from "@swim/math";
import {R2Point} from "@swim/math";
import {R2Box} from "@swim/math";
import {R2Shape} from "@swim/math";
import {R2Curve} from "@swim/math";
import {R2Spline} from "@swim/math";
import {R2Path} from "@swim/math";
import {R2Group} from "@swim/math";
import {GeoPoint} from "@swim/geo";
import {GeoBox} from "@swim/geo";
import {GeoShape} from "@swim/geo";
import {Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import type {FillView} from "@swim/graphics";
import type {StrokeView} from "@swim/graphics";
import type {PaintingContext} from "@swim/graphics";
import {PaintingRenderer} from "@swim/graphics";
import type {CanvasContext} from "@swim/graphics";
import {CanvasRenderer} from "@swim/graphics";
import type {GeoFeatureViewObserver} from "./GeoFeatureView";
import {GeoFeatureView} from "./GeoFeatureView";

/** @public */
export interface GeoShapeViewObserver<V extends GeoShapeView = GeoShapeView> extends GeoFeatureViewObserver<V> {
  viewDidSetGeoShape?(geoShape: GeoShape | null, view: V): void;
}

/** @public */
export class GeoShapeView extends GeoFeatureView implements FillView, StrokeView {
  constructor() {
    super();
    Object.defineProperty(this, "viewBounds", {
      value: R2Box.undefined(),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly observerType?: Class<GeoShapeViewObserver>;

  @Animator({
    valueType: GeoShape,
    value: null,
    didSetValue(geoShape: GeoShape | null): void {
      if (geoShape !== null) {
        this.owner.setGeoBounds(geoShape.bounds);
        this.owner.geoCentroid.setIntrinsic(geoShape.bounds.center);
      } else {
        this.owner.setGeoBounds(GeoBox.undefined());
        this.owner.geoCentroid.setIntrinsic(null);
      }
      if (this.mounted) {
        this.owner.projectShape();
      }
      this.owner.callObservers("viewDidSetGeoShape", geoShape, this.owner);
    },
  })
  readonly geoShape!: Animator<this, GeoShape | null>;

  @Animator({valueType: R2Shape, value: null})
  readonly viewShape!: Animator<this, R2Shape | null>;

  @Animator({valueType: GeoPoint, value: null})
  readonly geoCentroid!: Animator<this, GeoPoint | null>;

  @Animator({valueType: R2Point, value: null})
  readonly viewCentroid!: Animator<this, R2Point | null>;

  @ThemeAnimator({valueType: Color, value: null, updateFlags: View.NeedsRender})
  readonly fill!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Number, updateFlags: View.NeedsRender})
  readonly fillOpacity!: ThemeAnimator<this, number | undefined>;

  @ThemeAnimator({valueType: Color, value: null, updateFlags: View.NeedsRender})
  readonly stroke!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Number, updateFlags: View.NeedsRender})
  readonly strokeOpacity!: ThemeAnimator<this, number | undefined>;

  @ThemeAnimator({valueType: Length, value: null, updateFlags: View.NeedsRender})
  readonly strokeWidth!: ThemeAnimator<this, Length | null>;

  @Property({valueType: Number})
  readonly strokeHitWidth!: Property<this, number | undefined>;

  //@Property({valueType: Boolean, value: true})
  //readonly clipViewport!: Property<this, boolean>;

  //override cullGeoFrame(geoFrame: GeoBox = this.geoFrame): void {
  //  if (!geoFrame.intersects(this.geoBounds)) {
  //    this.setCulled(true);
  //    return;
  //  }
  //  const viewFrame = this.viewFrame;
  //  const bounds = this.viewBounds;
  //  // Check if 9x9 view frame fully contains view bounds.
  //  const contained = !this.clipViewport.value
  //                 || viewFrame.xMin - 4 * viewFrame.width <= bounds.xMin
  //                 && bounds.xMax <= viewFrame.xMax + 4 * viewFrame.width
  //                 && viewFrame.yMin - 4 * viewFrame.height <= bounds.yMin
  //                 && bounds.yMax <= viewFrame.yMax + 4 * viewFrame.height;
  //  this.setCulled(!contained || !viewFrame.intersects(bounds));
  //}

  protected override onProject(): void {
    super.onProject();
    this.projectShape();
  }

  protected projectShape(): void {
    const geoViewport = this.geoViewport.value;
    if (geoViewport === null) {
      return;
    }

    let viewShape: R2Shape | null;
    if (this.viewShape.hasAffinity(Affinity.Intrinsic)) {
      const geoShape = this.geoShape.value;
      viewShape = geoShape !== null && geoShape.isDefined() ? geoShape.project(geoViewport) : null;
      this.viewShape.setIntrinsic(viewShape);
    } else {
      viewShape = this.viewShape.value;
    }

    if (this.viewCentroid.hasAffinity(Affinity.Intrinsic)) {
      const geoCentroid = this.geoCentroid.value;
      const viewCentroid = geoCentroid !== null && geoCentroid.isDefined()
                         ? geoViewport.project(geoCentroid)
                         : null;
      this.viewCentroid.setIntrinsic(viewCentroid);
    }

    (this as Mutable<this>).viewBounds = viewShape !== null ? viewShape.bounds : this.viewFrame;

    //this.cullGeoFrame(geoViewport.geoFrame);
  }

  protected override onRender(): void {
    super.onRender();
    const renderer = this.renderer.value;
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled) {
      const viewShape = this.viewShape.value;
      if (viewShape !== null && viewShape.isDefined()) {
        this.renderShape(viewShape, renderer.context, this.viewFrame);
      }
    }
  }

  protected renderShape(shape: R2Shape, context: PaintingContext, frame: R2Box): void {
    if (shape instanceof R2Group) {
      this.renderGroup(shape, context, frame);
    } else if (shape instanceof R2Path) {
      this.renderPath(shape, context, frame);
    } else if (shape instanceof R2Spline) {
      this.renderPath(R2Path.of(shape), context, frame);
    } else if (shape instanceof R2Curve) {
      this.renderPath(R2Path.open(shape), context, frame);
    }
  }

  protected renderGroup(group: R2Group, context: PaintingContext, frame: R2Box): void {
    const shapes = group.shapes;
    for (let i = 0; i < shapes.length; i += 1) {
      const shape = shapes[i]!;
      if (shape.isDefined()) {
        this.renderShape(shape, context, frame);
      }
    }
  }

  protected renderPath(path: R2Path, context: PaintingContext, frame: R2Box): void {
    // save
    const contextFillStyle = context.fillStyle;
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    context.beginPath();
    path.draw(context);

    let fill = this.fill.value;
    if (fill !== null) {
      const fillOpacity = this.fillOpacity.value;
      if (fillOpacity !== void 0) {
        fill = fill.alpha(fillOpacity);
      }
      context.fillStyle = fill.toString();
      context.fill();
    }

    let stroke = this.stroke.value;
    const strokeWidth = this.strokeWidth.value;
    if (stroke !== null && strokeWidth !== null) {
      const strokeOpacity = this.strokeOpacity.value;
      if (strokeOpacity !== void 0) {
        stroke = stroke.alpha(strokeOpacity);
      }
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

  protected override hitTest(x: number, y: number): GraphicsView | null {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      const viewShape = this.viewShape.value;
      if (viewShape !== null && viewShape.isDefined()) {
        const p = renderer.transform.transform(x, y);
        return this.hitTestShape(p.x, p.y, viewShape, renderer.context, this.viewFrame);
      }
    }
    return null;
  }

  protected hitTestShape(x: number, y: number, shape: R2Shape,
                         context: CanvasContext, frame: R2Box): GraphicsView | null {
    if (shape instanceof R2Group) {
      return this.hitTestGroup(x, y, shape, context, frame);
    } else if (shape instanceof R2Path) {
      return this.hitTestPath(x, y, shape, context, frame);
    } else if (shape instanceof R2Spline) {
      return this.hitTestPath(x, y, R2Path.of(shape), context, frame);
    } else if (shape instanceof R2Curve) {
      return this.hitTestPath(x, y, R2Path.open(shape), context, frame);
    }
    return null;
  }

  protected hitTestGroup(x: number, y: number, group: R2Group,
                         context: CanvasContext, frame: R2Box): GraphicsView | null {
    const shapes = group.shapes;
    for (let i = 0; i < shapes.length; i += 1) {
      const shape = shapes[i]!;
      if (shape.isDefined()) {
        const hit = this.hitTestShape(x, y, shape, context, frame);
        if (hit !== null) {
          return hit;
        }
      }
    }
    return null;
  }

  protected hitTestPath(x: number, y: number, path: R2Path,
                        context: CanvasContext, frame: R2Box): GraphicsView | null {
    context.beginPath();
    path.draw(context);

    if (this.fill.value !== null && context.isPointInPath(x, y)) {
      return this;
    }

    // save
    const contextLineWidth = context.lineWidth;

    let pointInStroke = false;
    const strokeWidth = this.strokeWidth.value;
    if (this.stroke.value !== null && strokeWidth !== null) {
      const size = Math.min(frame.width, frame.height);
      const hitWidth = Math.max(this.strokeHitWidth.getValueOr(0), strokeWidth.pxValue(size));
      if (hitWidth !== 0) {
        context.lineWidth = hitWidth;
        pointInStroke = context.isPointInStroke(x, y);
      }
    }

    // restore
    context.lineWidth = contextLineWidth;

    return pointInStroke ? this : null;
  }

  protected override updateGeoBounds(): void {
    // nop
  }

  override get popoverFrame(): R2Box {
    const inversePageTransform = this.pageTransform.inverse();
    const viewCentroid = this.viewCentroid.value;
    if (viewCentroid === null || !viewCentroid.isDefined()) {
      return this.viewBounds.transform(inversePageTransform);
    }
    const px = inversePageTransform.transformX(viewCentroid.x, viewCentroid.y);
    const py = inversePageTransform.transformY(viewCentroid.x, viewCentroid.y);
    return new R2Box(px, py, px, py);
  }

  override readonly viewBounds!: R2Box;
}
