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
import {ViewContextType, ViewContext, ViewFlags, View, ViewAnimator} from "@swim/view";
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
    updateFlags |= View.NeedsRender | View.NeedsComposite;
    this.setViewFlags(this.viewFlags | (View.NeedsRender | View.NeedsComposite));
    return updateFlags;
  }

  protected override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.viewFlags & View.ProcessMask) !== 0 || (processFlags & View.NeedsResize) !== 0) {
      this.requireUpdate(View.NeedsRender | View.NeedsComposite);
    } else {
      processFlags = 0;
    }
    return processFlags;
  }

  protected override onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.requireUpdate(View.NeedsLayout | View.NeedsRender | View.NeedsComposite);
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

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.resizeCanvas(this.canvas);
    this.resetRenderer();
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    this.clearCanvas();
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

  override readonly viewContext!: GeoRasterViewContext;

  /** @hidden */
  get compositeFrame(): R2Box {
    let viewFrame = this.ownViewFrame;
    if (viewFrame === null) {
      const parentView = this.parentView;
      viewFrame = parentView instanceof GraphicsView ? parentView.viewFrame : R2Box.undefined();
    }
    return viewFrame;
  }

  /** @hidden */
  readonly rasterFrame!: R2Box;

  override get viewFrame(): R2Box {
    return this.rasterFrame;
  }

  override setViewFrame(viewFrame: R2Box | null): void {
    Object.defineProperty(this, "ownViewFrame", {
      value: viewFrame,
      enumerable: true,
      configurable: true,
    });
  }

  override cascadeHitTest(x: number, y: number, baseViewContext: ViewContext): GraphicsView | null {
    const compositeFrame = this.compositeFrame;
    x -= Math.floor(compositeFrame.xMin);
    y -= Math.floor(compositeFrame.yMin);
    return super.cascadeHitTest(x, y, baseViewContext);
  }

  override get parentTransform(): Transform {
    const compositeFrame = this.compositeFrame;
    const dx = Math.floor(compositeFrame.xMin);
    const dy = Math.floor(compositeFrame.yMin);
    if (dx !== 0 || dy !== 0) {
      return Transform.translate(-dx, -dy);
    }
    return Transform.identity();
  }

  protected createCanvas(): HTMLCanvasElement {
    return document.createElement("canvas");
  }

  protected resizeCanvas(canvas: HTMLCanvasElement): void {
    const compositeFrame = this.compositeFrame;
    const xMin = compositeFrame.xMin - Math.floor(compositeFrame.xMin);
    const yMin = compositeFrame.yMin - Math.floor(compositeFrame.yMin);
    const xMax = Math.ceil(xMin + compositeFrame.width);
    const yMax = Math.ceil(yMin + compositeFrame.height);
    const rasterFrame = new R2Box(xMin, yMin, xMax, yMax);
    if (!this.rasterFrame.equals(rasterFrame)) {
      const pixelRatio = this.pixelRatio;
      canvas.width = xMax * pixelRatio;
      canvas.height = yMax * pixelRatio;
      canvas.style.width = xMax + "px";
      canvas.style.height = yMax + "px";
      Object.defineProperty(this, "rasterFrame", {
        value: rasterFrame,
        enumerable: true,
        configurable: true,
      });
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
    const renderer = this.renderer;
    if (renderer instanceof CanvasRenderer) {
      const pixelRatio = this.pixelRatio;
      renderer.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    } else if (renderer instanceof WebGLRenderer) {
      const rasterFrame = this.rasterFrame;
      renderer.context.viewport(0, 0, rasterFrame.xMax, rasterFrame.yMax);
    }
  }

  protected compositeImage(viewContext: ViewContextType<this>): void {
    const compositor = viewContext.compositor;
    const renderer = viewContext.renderer;
    if (compositor instanceof CanvasRenderer && renderer instanceof CanvasRenderer) {
      const compositeFrame = this.compositeFrame;
      const context = compositor.context;
      context.save();
      context.globalAlpha = this.opacity.getValue();
      context.globalCompositeOperation = this.compositeOperation.getValue();
      const x = Math.floor(compositeFrame.x);
      const y = Math.floor(compositeFrame.y);
      context.drawImage(this.canvas, x, y, compositeFrame.width, compositeFrame.height);
      context.restore();
    }
  }

  static override create(): GeoRasterView {
    return new GeoRasterView();
  }

  static override readonly mountFlags: ViewFlags = GeoLayerView.mountFlags | View.NeedsRender | View.NeedsComposite;
  static override readonly powerFlags: ViewFlags = GeoLayerView.powerFlags | View.NeedsRender | View.NeedsComposite;
  static override readonly uncullFlags: ViewFlags = GeoLayerView.uncullFlags | View.NeedsRender | View.NeedsComposite;
}
