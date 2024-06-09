// Copyright 2015-2024 Nstream, inc.
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
import {Transform} from "@swim/math";
import {GeoPoint} from "@swim/geo";
import {GeoBox} from "@swim/geo";
import {ThemeAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import type {GraphicsRendererLike} from "@swim/graphics";
import type {GraphicsRendererType} from "@swim/graphics";
import {GraphicsRenderer} from "@swim/graphics";
import type {CanvasCompositeOperation} from "@swim/graphics";
import {CanvasRenderer} from "@swim/graphics";
import {WebGLRenderer} from "@swim/graphics";
import type {GeoViewObserver} from "./GeoView";
import {GeoView} from "./GeoView";
import type {GeoRippleOptions} from "./GeoRippleView";
import {GeoRippleView} from "./GeoRippleView";

/** @public */
export interface GeoRasterViewObserver<V extends GeoRasterView = GeoRasterView> extends GeoViewObserver<V> {
  viewDidSetGeoAnchor?(geoAnchor: GeoPoint | null, view: V): void;
}

/** @public */
export class GeoRasterView extends GeoView {
  constructor() {
    super();
    this.canvas = this.createCanvas();
    this.ownRasterFrame = null;
    (this.renderer as Mutable<typeof this.renderer>).value = this.createRenderer();
  }

  declare readonly observerType?: Class<GeoRasterViewObserver>;

  @Animator({
    valueType: GeoPoint,
    value: null,
    didSetState(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.projectGeoAnchor(newGeoCenter);
    },
    didSetValue(newGeoAnchor: GeoPoint | null, oldGeoAnchor: GeoPoint | null): void {
      this.owner.setGeoBounds(newGeoAnchor !== null ? newGeoAnchor.bounds : GeoBox.undefined());
      if (this.mounted) {
        this.owner.projectRaster();
      }
      this.owner.callObservers("viewDidSetGeoAnchor", newGeoAnchor, this.owner);
    },
  })
  readonly geoAnchor!: Animator<this, GeoPoint | null>;

  @Animator({valueType: R2Point, value: R2Point.undefined()})
  readonly viewAnchor!: Animator<this, R2Point | null>;

  @Animator({valueType: Number, value: 0.5, updateFlags: View.NeedsComposite})
  readonly xAlign!: Animator<this, number>;

  @Animator({valueType: Number, value: 0.5, updateFlags: View.NeedsComposite})
  readonly yAlign!: Animator<this, number>;

  @ThemeAnimator({valueType: Length, value: null, updateFlags: View.NeedsResize | View.NeedsLayout | View.NeedsRender | View.NeedsComposite})
  readonly width!: ThemeAnimator<this, Length | null>;

  @ThemeAnimator({valueType: Length, value: null, updateFlags: View.NeedsResize | View.NeedsLayout | View.NeedsRender | View.NeedsComposite})
  readonly height!: ThemeAnimator<this, Length | null>;

  @ThemeAnimator({valueType: Number, value: 1, updateFlags: View.NeedsComposite})
  readonly opacity!: ThemeAnimator<this, number>;

  @Animator({valueType: String, value: "source-over", updateFlags: View.NeedsComposite})
  readonly compositeOperation!: Animator<this, CanvasCompositeOperation>;

  get pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  /** @internal */
  readonly canvas: HTMLCanvasElement;

  @Property({
    valueType: GraphicsRenderer,
    value: null,
    inherits: "renderer",
  })
  readonly compositor!: Property<this, GraphicsRenderer | null>;

  @Property({
    extends: true,
    inherits: false,
    updateFlags: View.NeedsRender | View.NeedsComposite,
    fromLike(renderer: GraphicsRendererLike | null): GraphicsRenderer | null {
      if (typeof renderer === "string") {
        renderer = this.owner.createRenderer(renderer as GraphicsRendererType);
      }
      return renderer;
    },
  })
  override readonly renderer!: Property<this, GraphicsRenderer | null>;

  protected createRenderer(rendererType: GraphicsRendererType = "canvas"): GraphicsRenderer | null {
    if (rendererType === "canvas") {
      const context = this.canvas.getContext("2d");
      if (context === null) {
        throw new Error("Failed to create canvas rendering context");
      }
      return new CanvasRenderer(context, Transform.identity(), this.pixelRatio);
    } else if (rendererType === "webgl") {
      const context = this.canvas.getContext("webgl");
      if (context === null) {
        throw new Error("Failed to create webgl rendering context");
      }
      return new WebGLRenderer(context, this.pixelRatio);
    }
    throw new Error("Failed to create " + rendererType + " renderer");
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

  protected override needsProcess(processFlags: ViewFlags): ViewFlags {
    if ((this.flags & View.ProcessMask) === 0 && (processFlags & (View.NeedsResize | View.NeedsProject)) === 0) {
      processFlags = 0;
    }
    return processFlags;
  }

  protected override onResize(): void {
    super.onResize();
    this.requireUpdate(View.NeedsRender | View.NeedsComposite);
  }

  protected override onProject(): void {
    super.onProject();
    this.projectRaster();
  }

  protected projectGeoAnchor(geoAnchor: GeoPoint | null): void {
    const geoViewport = this.geoViewport.value;
    if (!this.mounted || geoViewport === null) {
      return;
    }
    const viewAnchor = geoAnchor !== null && geoAnchor.isDefined()
                     ? geoViewport.project(geoAnchor)
                     : null;
    this.viewAnchor.setInterpolatedValue(this.viewAnchor.value, viewAnchor);
    this.projectRaster();
  }

  protected projectRaster(): void {
    const geoViewport = this.geoViewport.value;
    if (geoViewport === null) {
      return;
    }
    let viewAnchor: R2Point | null;
    if (this.viewAnchor.hasAffinity(Affinity.Intrinsic)) {
      const geoAnchor = this.geoAnchor.value;
      viewAnchor = geoAnchor !== null && geoAnchor.isDefined()
                 ? geoViewport.project(geoAnchor)
                 : null;
      this.viewAnchor.setIntrinsic(viewAnchor);
    } else {
      viewAnchor = this.viewAnchor.value;
    }
    if (viewAnchor === null) {
      this.setCulled(!this.viewFrame.intersects(this.rasterFrame));
      return;
    }
    const viewFrame = this.viewFrame;
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
  }

  protected override needsDisplay(displayFlags: ViewFlags): ViewFlags {
    if ((this.flags & View.DisplayMask) !== 0) {
      displayFlags |= View.NeedsComposite;
    } else if ((displayFlags & View.NeedsComposite) !== 0) {
      displayFlags = View.NeedsDisplay | View.NeedsComposite;
    } else {
      displayFlags = 0;
    }
    return displayFlags;
  }

  protected override onRender(): void {
    const rasterFrame = this.rasterFrame;
    this.resizeCanvas(this.canvas, rasterFrame);
    this.resetRenderer(rasterFrame);
    this.clearCanvas(rasterFrame);
    super.onRender();
  }

  protected override didComposite(): void {
    this.compositeImage();
    super.didComposite();
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
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      renderer.context.clearRect(0, 0, rasterFrame.xMax, rasterFrame.yMax);
    } else if (renderer instanceof WebGLRenderer) {
      const context = renderer.context;
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    }
  }

  protected resetRenderer(rasterFrame: R2Box): void {
    const renderer = this.renderer.value;
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

  protected compositeImage(): void {
    const compositor = this.compositor.value;
    if (!(compositor instanceof CanvasRenderer)) {
      return;
    }
    const rasterFrame = this.rasterFrame;
    const canvas = this.canvas;
    if (!rasterFrame.isDefined() || rasterFrame.width === 0 || rasterFrame.height === 0
        || canvas.width === 0 || canvas.height === 0) {
      return;
    }
    const context = compositor.context;
    const globalAlpha = context.globalAlpha;
    const globalCompositeOperation = context.globalCompositeOperation;
    context.globalAlpha = this.opacity.getValue();
    context.globalCompositeOperation = this.compositeOperation.getValue();
    context.drawImage(canvas, rasterFrame.x, rasterFrame.y, rasterFrame.width, rasterFrame.height);
    context.globalAlpha = globalAlpha;
    context.globalCompositeOperation = globalCompositeOperation;
  }

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }

  static override readonly MountFlags: ViewFlags = GeoView.MountFlags | View.NeedsComposite;
  static override readonly UncullFlags: ViewFlags = GeoView.UncullFlags | View.NeedsComposite;
  static override readonly UnhideFlags: ViewFlags = GeoView.UnhideFlags | View.NeedsComposite;
}
