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

import type {Mutable, Class} from "@swim/util";
import {Affinity, Animator} from "@swim/fastener";
import {AnyLength, Length, AnyR2Point, R2Point, R2Box, Transform} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, ViewFlags, View} from "@swim/view";
import {
  AnyGraphicsRenderer,
  GraphicsRendererType,
  GraphicsRenderer,
  GraphicsView,
  CanvasCompositeOperation,
  CanvasRenderer,
  WebGLRenderer,
} from "@swim/graphics";
import type {GeoViewContext} from "../geo/GeoViewContext";
import type {GeoViewInit} from "../geo/GeoView";
import {GeoLayerView} from "../layer/GeoLayerView";
import {GeoRippleOptions, GeoRippleView} from "../effect/GeoRippleView";
import type {GeoRasterViewContext} from "./GeoRasterViewContext";
import type {GeoRasterViewObserver} from "./GeoRasterViewObserver";

/** @public */
export interface GeoRasterViewInit extends GeoViewInit {
  geoAnchor?: AnyGeoPoint;
  viewAnchor?: AnyR2Point;
  xAlign?: number;
  yAlign?: number;
  width?: AnyLength;
  height?: AnyLength;
  opacity?: number;
  compositeOperation?: CanvasCompositeOperation;
}

/** @public */
export class GeoRasterView extends GeoLayerView {
  constructor() {
    super();
    this.canvas = this.createCanvas();
    Object.defineProperty(this, "renderer", {
      value: this.createRenderer(),
      writable: true,
      enumerable: true,
      configurable: true,
    });
    this.ownRasterFrame = null;
  }

  override readonly observerType?: Class<GeoRasterViewObserver>;

  override readonly contextType?: Class<GeoRasterViewContext>;

  @Animator<GeoRasterView, GeoPoint | null, AnyGeoPoint | null>({
    type: GeoPoint,
    state: null,
    didSetState(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.projectGeoAnchor(newGeoCenter);
    },
    willSetValue(newGeoAnchor: GeoPoint | null, oldGeoAnchor: GeoPoint | null): void {
      this.owner.callObservers("viewWillSetGeoAnchor", newGeoAnchor, oldGeoAnchor, this.owner);
    },
    didSetValue(newGeoAnchor: GeoPoint | null, oldGeoAnchor: GeoPoint | null): void {
      this.owner.setGeoBounds(newGeoAnchor !== null ? newGeoAnchor.bounds : GeoBox.undefined());
      if (this.mounted) {
        this.owner.projectRaster(this.owner.viewContext);
      }
      this.owner.callObservers("viewDidSetGeoAnchor", newGeoAnchor, oldGeoAnchor, this.owner);
    },
  })
  readonly geoAnchor!: Animator<this, GeoPoint | null, AnyGeoPoint | null>;

  @Animator({type: R2Point, state: R2Point.undefined()})
  readonly viewAnchor!: Animator<this, R2Point | null, AnyR2Point | null>;

  @Animator({type: Number, state: 0.5, updateFlags: View.NeedsComposite})
  readonly xAlign!: Animator<this, number>;

  @Animator({type: Number, state: 0.5, updateFlags: View.NeedsComposite})
  readonly yAlign!: Animator<this, number>;

  @ThemeAnimator({type: Length, state: null, updateFlags: View.NeedsResize | View.NeedsLayout | View.NeedsRender | View.NeedsComposite})
  readonly width!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({type: Length, state: null, updateFlags: View.NeedsResize | View.NeedsLayout | View.NeedsRender | View.NeedsComposite})
  readonly height!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({type: Number, state: 1, updateFlags: View.NeedsComposite})
  readonly opacity!: ThemeAnimator<this, number>;

  @Animator({type: String, state: "source-over", updateFlags: View.NeedsComposite})
  readonly compositeOperation!: Animator<this, CanvasCompositeOperation>;

  get pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  /** @internal */
  readonly canvas: HTMLCanvasElement;

  get compositor(): GraphicsRenderer | null {
    const parent = this.parent;
    if (parent instanceof GraphicsView) {
      return parent.renderer;
    } else {
      return null;
    }
  }

  override readonly renderer!: GraphicsRenderer | null;

  setRenderer(renderer: AnyGraphicsRenderer | null): void {
    if (typeof renderer === "string") {
      renderer = this.createRenderer(renderer as GraphicsRendererType);
    }
    (this as Mutable<this>).renderer = renderer;
    this.requireUpdate(View.NeedsRender | View.NeedsComposite);
  }

  protected createRenderer(rendererType: GraphicsRendererType = "canvas"): GraphicsRenderer | null {
    if (rendererType === "canvas") {
      const context = this.canvas.getContext("2d");
      if (context !== null) {
        return new CanvasRenderer(context, Transform.identity(), this.pixelRatio);
      } else {
        throw new Error("Failed to create canvas rendering context");
      }
    } else if (rendererType === "webgl") {
      const context = this.canvas.getContext("webgl");
      if (context !== null) {
        return new WebGLRenderer(context, this.pixelRatio);
      } else {
        throw new Error("Failed to create webgl rendering context");
      }
    } else {
      throw new Error("Failed to create " + rendererType + " renderer");
    }
  }

  protected override needsUpdate(updateFlags: ViewFlags, immediate: boolean): ViewFlags {
    updateFlags = super.needsUpdate(updateFlags, immediate);
    const rasterFlags = updateFlags & (View.NeedsRender | View.NeedsComposite);
    if (rasterFlags !== 0) {
      updateFlags |= View.NeedsComposite;
      this.setFlags(this.flags | View.NeedsDisplay | View.NeedsComposite | rasterFlags);
    }
    return updateFlags;
  }

  protected override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.flags & View.ProcessMask) === 0 && (processFlags & (View.NeedsResize | View.NeedsProject)) === 0) {
      processFlags = 0;
    }
    return processFlags;
  }

  protected override onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.requireUpdate(View.NeedsRender | View.NeedsComposite);
  }

  protected override onProject(viewContext: ViewContextType<this>): void {
    super.onProject(viewContext);
    this.projectRaster(viewContext);
  }

  protected projectGeoAnchor(geoAnchor: GeoPoint | null): void {
    if (this.mounted) {
      const viewContext = this.viewContext as ViewContextType<this>;
      const viewAnchor = geoAnchor !== null && geoAnchor.isDefined()
                       ? viewContext.geoViewport.project(geoAnchor)
                       : null;
      this.viewAnchor.setInterpolatedValue(this.viewAnchor.value, viewAnchor);
      this.projectRaster(viewContext);
    }
  }

  protected projectRaster(viewContext: ViewContextType<this>): void {
    let viewAnchor: R2Point | null;
    if (this.viewAnchor.hasAffinity(Affinity.Intrinsic)) {
      const geoAnchor = this.geoAnchor.value;
      viewAnchor = geoAnchor !== null && geoAnchor.isDefined()
                 ? viewContext.geoViewport.project(geoAnchor)
                 : null;
      this.viewAnchor.setValue(viewAnchor);
    } else {
      viewAnchor = this.viewAnchor.value;
    }
    if (viewAnchor !== null) {
      const viewFrame = viewContext.viewFrame;
      const viewWidth = viewFrame.width;
      const viewHeight = viewFrame.height;
      const viewSize = Math.min(viewWidth, viewHeight);
      let width: Length | number | null = this.width.value;
      width = width instanceof Length ? width.pxValue(viewSize) : viewWidth;
      let height: Length | number | null = this.height.value;
      height = height instanceof Length ? height.pxValue(viewSize) : viewHeight;
      const x = viewAnchor.x - width * this.xAlign.getValue();
      const y = viewAnchor.y - height * this.yAlign.getValue();
      const rasterFrame = new R2Box(x, y, x + width, y + height);
      this.setRasterFrame(rasterFrame);
      this.setViewFrame(rasterFrame);
      this.setCulled(!viewFrame.intersects(rasterFrame));
    } else {
      this.setCulled(!this.viewFrame.intersects(this.rasterFrame));
    }
  }

  protected override needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.flags & View.DisplayMask) !== 0) {
      displayFlags |= View.NeedsComposite;
    } else if ((displayFlags & View.NeedsComposite) !== 0) {
      displayFlags = View.NeedsDisplay | View.NeedsComposite;
    } else {
      displayFlags = 0;
    }
    return displayFlags;
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    const rasterFrame = this.rasterFrame;
    this.resizeCanvas(this.canvas, rasterFrame);
    this.resetRenderer(rasterFrame);
    this.clearCanvas(rasterFrame);
    super.onRender(viewContext);
  }

  protected override didComposite(viewContext: ViewContextType<this>): void {
    this.compositeImage(viewContext);
    super.didComposite(viewContext);
  }

  protected override onSetHidden(hidden: boolean): void {
    if (!hidden) {
      this.requireUpdate(View.NeedsRender | View.NeedsComposite);
    }
  }

  override extendViewContext(viewContext: GeoViewContext): ViewContextType<this> {
    const rasterViewContext = Object.create(viewContext);
    rasterViewContext.compositor = viewContext.renderer;
    rasterViewContext.renderer = this.renderer;
    return rasterViewContext;
  }

  /** @internal */
  readonly ownRasterFrame: R2Box | null;

  get rasterFrame(): R2Box {
    let rasterFrame = this.ownRasterFrame;
    if (rasterFrame === null) {
      rasterFrame = this.deriveRasterFrame();
    }
    return rasterFrame;
  }

  /** @internal */
  setRasterFrame(rasterFrame: R2Box | null): void {
    (this as Mutable<this>).ownRasterFrame = rasterFrame;
  }

  protected deriveRasterFrame(): R2Box {
    return this.deriveViewBounds();
  }

  protected createCanvas(): HTMLCanvasElement {
    return document.createElement("canvas");
  }

  protected resizeCanvas(canvas: HTMLCanvasElement, rasterFrame: R2Box): void {
    const pixelRatio = this.pixelRatio;
    const newWidth = rasterFrame.width;
    const newHeight = rasterFrame.height;
    const newCanvasWidth = newWidth * pixelRatio;
    const newCanvasHeight = newHeight * pixelRatio;
    const oldCanvasWidth = canvas.width;
    const oldCanvasHeight = canvas.height;
    if (newCanvasWidth !== oldCanvasWidth || newCanvasHeight !== oldCanvasHeight) {
      canvas.width = newCanvasWidth;
      canvas.height = newCanvasHeight;
      canvas.style.width = newWidth + "px";
      canvas.style.height = newHeight + "px";
    }
  }

  protected clearCanvas(rasterFrame: R2Box): void {
    const renderer = this.renderer;
    if (renderer instanceof CanvasRenderer) {
      renderer.context.clearRect(0, 0, rasterFrame.xMax, rasterFrame.yMax);
    } else if (renderer instanceof WebGLRenderer) {
      const context = renderer.context;
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    }
  }

  protected resetRenderer(rasterFrame: R2Box): void {
    const renderer = this.renderer;
    if (renderer instanceof CanvasRenderer) {
      const pixelRatio = this.pixelRatio;
      const dx = rasterFrame.xMin * pixelRatio;
      const dy = rasterFrame.yMin * pixelRatio;
      renderer.context.setTransform(pixelRatio, 0, 0, pixelRatio, -dx, -dy);
      renderer.setTransform(Transform.affine(pixelRatio, 0, 0, pixelRatio, -dx, -dy));
    } else if (renderer instanceof WebGLRenderer) {
      renderer.context.viewport(rasterFrame.x, rasterFrame.y, rasterFrame.xMax, rasterFrame.yMax);
    }
  }

  protected compositeImage(viewContext: ViewContextType<this>): void {
    const compositor = viewContext.compositor;
    if (compositor instanceof CanvasRenderer) {
      const context = compositor.context;
      const rasterFrame = this.rasterFrame;
      const canvas = this.canvas;
      if (rasterFrame.isDefined() && rasterFrame.width !== 0 && rasterFrame.height !== 0 &&
          canvas.width !== 0 && canvas.height !== 0) {
        const globalAlpha = context.globalAlpha;
        const globalCompositeOperation = context.globalCompositeOperation;
        context.globalAlpha = this.opacity.getValue();
        context.globalCompositeOperation = this.compositeOperation.getValue();
        context.drawImage(canvas, rasterFrame.x, rasterFrame.y, rasterFrame.width, rasterFrame.height);
        context.globalAlpha = globalAlpha;
        context.globalCompositeOperation = globalCompositeOperation;
      }
    }
  }

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }

  override init(init: GeoRasterViewInit): void {
    super.init(init);
    if (init.geoAnchor !== void 0) {
      this.geoAnchor(init.geoAnchor);
    }
    if (init.viewAnchor !== void 0) {
      this.viewAnchor(init.viewAnchor);
    }
    if (init.xAlign !== void 0) {
      this.xAlign(init.xAlign);
    }
    if (init.yAlign !== void 0) {
      this.yAlign(init.yAlign);
    }
    if (init.width !== void 0) {
      this.width(init.width);
    }
    if (init.height !== void 0) {
      this.height(init.height);
    }
    if (init.opacity !== void 0) {
      this.opacity(init.opacity);
    }
    if (init.compositeOperation !== void 0) {
      this.compositeOperation(init.compositeOperation);
    }
  }

  static override readonly MountFlags: ViewFlags = GeoLayerView.MountFlags | View.NeedsRender | View.NeedsComposite;
  static override readonly UncullFlags: ViewFlags = GeoLayerView.UncullFlags | View.NeedsRender | View.NeedsComposite;
}
