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

import {R2Box, Transform} from "@swim/math";
import {ViewContextType, ViewFlags, View, ViewAnimator} from "@swim/view";
import type {AnyGraphicsRenderer, GraphicsRendererType, GraphicsRenderer} from "../graphics/GraphicsRenderer";
import type {GraphicsViewContext} from "../graphics/GraphicsViewContext";
import {GraphicsViewInit, GraphicsView} from "../graphics/GraphicsView";
import {LayerView} from "../layer/LayerView";
import {WebGLRenderer} from "../webgl/WebGLRenderer";
import type {CanvasCompositeOperation} from "../canvas/CanvasContext";
import {CanvasRenderer} from "../canvas/CanvasRenderer";
import {CanvasView} from "../canvas/CanvasView";
import type {RasterViewContext} from "./RasterViewContext";

export interface RasterViewInit extends GraphicsViewInit {
  opacity?: number;
  compositeOperation?: CanvasCompositeOperation;
}

export class RasterView extends LayerView {
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
    Object.defineProperty(this, "ownRasterFrame", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  override initView(init: RasterViewInit): void {
    super.initView(init);
    if (init.opacity !== void 0) {
      this.opacity(init.opacity);
    }
    if (init.compositeOperation !== void 0) {
      this.compositeOperation(init.compositeOperation);
    }
  }

  @ViewAnimator({type: Number, state: 1, updateFlags: View.NeedsComposite})
  readonly opacity!: ViewAnimator<this, number>;

  @ViewAnimator({type: String, state: "source-over", updateFlags: View.NeedsComposite})
  readonly compositeOperation!: ViewAnimator<this, CanvasCompositeOperation>;

  get pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  /** @hidden */
  readonly canvas!: HTMLCanvasElement;

  get compositor(): GraphicsRenderer | null {
    const parentView = this.parentView;
    if (parentView instanceof GraphicsView || parentView instanceof CanvasView) {
      return parentView.renderer;
    } else {
      return null;
    }
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
    this.requireUpdate(View.NeedsRender | View.NeedsComposite);
  }

  protected createRenderer(rendererType: GraphicsRendererType = "canvas"): GraphicsRenderer | null {
    if (rendererType === "canvas") {
      const context = this.canvas.getContext("2d");
      if (context !== null) {
        return new CanvasRenderer(context, Transform.identity(), this.pixelRatio,
                                  this.theme.state, this.mood.state);
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
      this.setViewFlags(this.viewFlags | View.NeedsDisplay | View.NeedsComposite | rasterFlags);
    }
    return updateFlags;
  }

  protected override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.viewFlags & View.ProcessMask) === 0 && (processFlags & View.NeedsResize) === 0) {
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

  override extendViewContext(viewContext: GraphicsViewContext): ViewContextType<this> {
    const rasterViewContext = Object.create(viewContext);
    rasterViewContext.compositor = viewContext.renderer;
    rasterViewContext.renderer = this.renderer;
    return rasterViewContext;
  }

  override readonly viewContext!: RasterViewContext;

  declare readonly viewBounds: R2Box; // getter defined below to work around useDefineForClassFields lunacy

  /** @hidden */
  readonly ownRasterFrame!: R2Box | null;

  get rasterFrame(): R2Box {
    let rasterFrame = this.ownRasterFrame;
    if (rasterFrame === null) {
      rasterFrame = this.deriveRasterFrame();
    }
    return rasterFrame;
  }

  /** @hidden */
  setRasterFrame(rasterFrame: R2Box | null): void {
    Object.defineProperty(this, "ownRasterFrame", {
      value: rasterFrame,
      enumerable: true,
      configurable: true,
    });
  }

  protected deriveRasterFrame(): R2Box {
    return this.viewBounds;
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

  static override create(): RasterView {
    return new RasterView();
  }

  static override readonly mountFlags: ViewFlags = LayerView.mountFlags | View.NeedsRender | View.NeedsComposite;
  static override readonly powerFlags: ViewFlags = LayerView.powerFlags | View.NeedsRender | View.NeedsComposite;
  static override readonly uncullFlags: ViewFlags = LayerView.uncullFlags | View.NeedsRender | View.NeedsComposite;
}
Object.defineProperty(RasterView.prototype, "viewBounds", {
  get(this: RasterView): R2Box {
    return this.deriveViewBounds();
  },
  enumerable: true,
  configurable: true,
});
