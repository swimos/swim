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

import {R2Box} from "@swim/math";
import type {Color} from "@swim/style";
import {ViewContextType, ViewFlags, View, ViewAnimator} from "@swim/view";
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
import type {GeoRasterViewContext} from "./GeoRasterViewContext";

export interface GeoRasterViewInit extends GeoViewInit {
  opacity?: number;
  compositeOperation?: CanvasCompositeOperation;
}

export class GeoRasterView extends GeoLayerView {
  constructor() {
    super();
    Object.defineProperty(this, "canvas", {
      value: this.createCanvas(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "renderer", {
      value: this.createRenderer(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "rasterFrame", {
      value: R2Box.undefined(),
      enumerable: true,
      configurable: true,
    });
  }

  override initView(init: GeoRasterViewInit): void {
    super.initView(init);
    if (init.opacity !== void 0) {
      this.opacity(init.opacity);
    }
    if (init.compositeOperation !== void 0) {
      this.compositeOperation(init.compositeOperation);
    }
  }

  @ViewAnimator({type: Number, state: 1})
  readonly opacity!: ViewAnimator<this, number>;

  @ViewAnimator({type: String, state: "source-over"})
  readonly compositeOperation!: ViewAnimator<this, CanvasCompositeOperation>;

  get pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  /** @hidden */
  readonly canvas!: HTMLCanvasElement;

  get compositor(): GraphicsRenderer | null {
    const parentView = this.parentView;
    return parentView instanceof GraphicsView ? parentView.renderer : null;
  }

  override readonly renderer!: GraphicsRenderer | null;

  setRenderer(renderer: AnyGraphicsRenderer | null): void {
    if (typeof renderer === "string") {
      renderer = this.createRenderer(renderer as GraphicsRendererType);
    }
    Object.defineProperty(this, "renderer", {
      value: renderer,
      enumerable: true,
      configurable: true,
    });
    this.resetRenderer();
  }

  protected createRenderer(rendererType: GraphicsRendererType = "canvas"): GraphicsRenderer | null {
    if (rendererType === "canvas") {
      const context = this.canvas.getContext("2d");
      if (context !== null) {
        return new CanvasRenderer(context, this.pixelRatio, this.theme.state, this.mood.state);
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
    if ((updateFlags & View.UpdateMask) !== 0) {
      updateFlags |= View.NeedsRender | View.NeedsComposite;
      this.setViewFlags(this.viewFlags | View.NeedsDisplay | View.NeedsRender | View.NeedsComposite);
    }
    return updateFlags;
  }

  protected override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.viewFlags & View.ProcessMask) !== 0 || (processFlags & (View.NeedsResize | View.NeedsProject)) !== 0) {
      this.requireUpdate(View.NeedsRender | View.NeedsComposite);
    } else {
      processFlags = 0;
    }
    return processFlags;
  }

  protected override onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.requireUpdate(View.NeedsRender | View.NeedsComposite);
  }

  protected override needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.viewFlags & View.DisplayMask) !== 0) {
      displayFlags |= View.NeedsRender | View.NeedsComposite;
    } else if ((displayFlags & View.NeedsComposite) !== 0) {
      displayFlags = View.NeedsDisplay | View.NeedsComposite;
    } else {
      displayFlags = 0;
    }
    return displayFlags;
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    this.updateRasterFrame();
    this.resizeCanvas(this.canvas);
    this.resetRenderer();
    this.clearCanvas();
    super.onRender(viewContext);
  }

  protected override didComposite(viewContext: ViewContextType<this>): void {
    this.compositeImage(viewContext);
    super.didComposite(viewContext);
  }

  protected override renderGeoBounds(viewContext: ViewContextType<this>, outlineColor: Color, outlineWidth: number): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled() && !this.isUnbounded()) {
      const context = renderer.context;
      context.save();
      this.renderViewOutline(this.rasterFrame, context, outlineColor, outlineWidth);
      context.restore();
    }
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

  override readonly viewContext!: GeoRasterViewContext;

  declare readonly viewBounds: R2Box; // getter defined below to work around useDefineForClassFields lunacy

  /** @hidden */
  readonly rasterFrame!: R2Box;

  protected deriveRasterFrame(): R2Box {
    const viewBounds = this.viewBounds;
    if (viewBounds.isDefined()) {
      const pixelRatio = this.pixelRatio;
      const xMin = Math.floor(viewBounds.xMin);
      const yMin = Math.floor(viewBounds.yMin);
      const xMax = Math.ceil(viewBounds.xMax);
      const yMax = Math.ceil(viewBounds.yMax);
      const newCanvasWidth = (xMax - xMin) * pixelRatio;
      const newCanvasHeight = (yMax - yMin) * pixelRatio;

      const minTextureSize = GeoRasterView.MinTextureSize * pixelRatio;
      const maxCanvasWidth = Math.max(minTextureSize, GeoRasterView.nextPowerOfTwo(newCanvasWidth));
      const maxCanvasHeight = Math.max(minTextureSize, GeoRasterView.nextPowerOfTwo(newCanvasHeight));

      const canvas = this.canvas;
      const oldCanvasWidth = canvas.width;
      const oldCanvasHeight = canvas.height;
      let canvasWidth: number;
      if (newCanvasWidth / oldCanvasWidth < GeoRasterView.MinTextureShrinkRatio) {
        canvasWidth = maxCanvasWidth;
      } else {
        canvasWidth = Math.max(maxCanvasWidth, oldCanvasWidth);
      }
      let canvasHeight: number;
      if (newCanvasHeight / oldCanvasHeight < GeoRasterView.MinTextureShrinkRatio) {
        canvasHeight = maxCanvasHeight;
      } else {
        canvasHeight = Math.max(maxCanvasHeight, oldCanvasHeight);
      }
      const width = canvasWidth / pixelRatio;
      const height = canvasHeight / pixelRatio;

      return new R2Box(xMin, yMin, xMin + width, yMin + height);
    }
    return R2Box.undefined();
  }

  /** @hidden */
  static nextPowerOfTwo(n: number): number {
    n = Math.max(32, n) - 1;
    n |= n >> 1; n |= n >> 2; n |= n >> 4; n |= n >> 8; n |= n >> 16;
    return n + 1;
  }

  protected updateRasterFrame(): void {
    Object.defineProperty(this, "rasterFrame", {
      value: this.deriveRasterFrame(),
      enumerable: true,
      configurable: true,
    });
  }

  protected createCanvas(): HTMLCanvasElement {
    return document.createElement("canvas");
  }

  protected resizeCanvas(canvas: HTMLCanvasElement): void {
    const rasterFrame = this.rasterFrame;
    if (rasterFrame.isDefined()) {
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
  }

  clearCanvas(): void {
    const renderer = this.renderer;
    if (renderer instanceof CanvasRenderer) {
      const rasterFrame = this.rasterFrame;
      renderer.context.clearRect(0, 0, rasterFrame.xMax, rasterFrame.yMax);
    } else if (renderer instanceof WebGLRenderer) {
      const context = renderer.context;
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    }
  }

  resetRenderer(): void {
    const rasterFrame = this.rasterFrame;
    if (rasterFrame.isDefined()) {
      const renderer = this.renderer;
      if (renderer instanceof CanvasRenderer) {
        const pixelRatio = this.pixelRatio;
        const dx = Math.floor(rasterFrame.xMin) * pixelRatio;
        const dy = Math.floor(rasterFrame.yMin) * pixelRatio;
        renderer.context.setTransform(pixelRatio, 0, 0, pixelRatio, -dx, -dy);
      } else if (renderer instanceof WebGLRenderer) {
        renderer.context.viewport(rasterFrame.x, rasterFrame.y, rasterFrame.xMax, rasterFrame.yMax);
      }
    }
  }

  protected compositeImage(viewContext: ViewContextType<this>): void {
    const compositor = viewContext.compositor;
    if (compositor instanceof CanvasRenderer) {
      const context = compositor.context;
      const rasterFrame = this.rasterFrame;
      const canvas = this.canvas;
      if (rasterFrame.isDefined() && rasterFrame.width !== 0 && rasterFrame.height !== 0 && canvas.width !== 0 && canvas.height !== 0) {
        context.save();
        context.globalAlpha = this.opacity.getValue();
        context.globalCompositeOperation = this.compositeOperation.getValue();
        context.drawImage(canvas, rasterFrame.x, rasterFrame.y, rasterFrame.width, rasterFrame.height);
        context.restore();
      }
    }
  }

  static override create(): GeoRasterView {
    return new GeoRasterView();
  }

  /** @hidden */
  static MinTextureSize: number = 16;
  /** @hidden */
  static MinTextureShrinkRatio: number = 0.4;

  static override readonly mountFlags: ViewFlags = GeoLayerView.mountFlags | View.NeedsRender | View.NeedsComposite;
  static override readonly powerFlags: ViewFlags = GeoLayerView.powerFlags | View.NeedsRender | View.NeedsComposite;
  static override readonly uncullFlags: ViewFlags = GeoLayerView.uncullFlags | View.NeedsRender | View.NeedsComposite;
}
Object.defineProperty(GeoRasterView.prototype, "viewBounds", {
  get(this: GeoRasterView): R2Box {
    return this.deriveViewBounds();
  },
  enumerable: true,
  configurable: true,
});
