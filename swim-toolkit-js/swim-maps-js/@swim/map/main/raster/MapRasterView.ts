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

import {BoxR2} from "@swim/math";
import {Transform} from "@swim/transform";
import {
  AnyRenderer,
  RendererType,
  Renderer,
  CanvasCompositeOperation,
  CanvasRenderer,
  WebGLRenderer,
} from "@swim/render";
import {ViewFlags, View, ViewAnimator, GraphicsView} from "@swim/view";
import {MapGraphicsViewContext} from "../graphics/MapGraphicsViewContext";
import {MapGraphicsNodeView} from "../graphics/MapGraphicsNodeView";
import {MapRasterViewContext} from "./MapRasterViewContext";
import {MapRasterViewObserver} from "./MapRasterViewObserver";
import {MapRasterViewController} from "./MapRasterViewController";

export class MapRasterView extends MapGraphicsNodeView {
  /** @hidden */
  _canvas: HTMLCanvasElement;
  /** @hidden */
  _renderer: Renderer | null | undefined;
  /** @hidden */
  _rasterFrame: BoxR2;

  constructor() {
    super();
    this._canvas = this.createCanvas();
    this._renderer = void 0;
    this._rasterFrame = BoxR2.undefined();
  }

  get viewController(): MapRasterViewController | null {
    return this._viewController;
  }

  @ViewAnimator(Number, {value: 1})
  opacity: ViewAnimator<this, number>;

  @ViewAnimator(String, {value: "source-over"})
  compositeOperation: ViewAnimator<this, CanvasCompositeOperation>;

  get pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  get compositor(): Renderer | null {
    const parentView = this.parentView;
    return parentView instanceof GraphicsView ? parentView.renderer : null;
  }

  get renderer(): Renderer | null {
    let renderer = this._renderer;
    if (renderer === void 0) {
      renderer = this.createRenderer();
      this._renderer = renderer;
    }
    return renderer;
  }

  setRenderer(renderer: AnyRenderer | null): void {
    if (typeof renderer === "string") {
      renderer = this.createRenderer(renderer as RendererType);
    }
    this._renderer = renderer;
    this.resetRenderer();
  }

  protected createRenderer(rendererType: RendererType = "canvas"): Renderer | null {
    if (rendererType === "canvas") {
      const context = this._canvas.getContext("2d");
      if (context !== null) {
        return new CanvasRenderer(context, this.pixelRatio);
      } else {
        throw new Error("Failed to create canvas rendering context");
      }
    } else if (rendererType === "webgl") {
      const context = this._canvas.getContext("webgl");
      if (context !== null) {
        return new WebGLRenderer(context, this.pixelRatio);
      } else {
        throw new Error("Failed to create webgl rendering context");
      }
    } else {
      throw new Error("Failed to create " + rendererType + " renderer");
    }
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.UpdateMask) !== 0) {
      if ((updateFlags & View.ProcessMask) !== 0) {
        additionalFlags |= View.NeedsProcess;
      }
      if ((updateFlags & View.DisplayMask) !== 0) {
        additionalFlags |= View.NeedsDisplay;
      }
      additionalFlags |= View.NeedsRender | View.NeedsComposite;
    }
    return additionalFlags;
  }

  cascadeProcess(processFlags: ViewFlags, viewContext: MapGraphicsViewContext): void {
    viewContext = this.rasterViewContext(viewContext);
    super.cascadeProcess(processFlags, viewContext);
  }

  cascadeDisplay(displayFlags: ViewFlags, viewContext: MapGraphicsViewContext): void {
    viewContext = this.rasterViewContext(viewContext);
    super.cascadeDisplay(displayFlags, viewContext);
  }

  /** @hidden */
  protected doDisplay(displayFlags: ViewFlags, viewContext: MapRasterViewContext): void {
    let cascadeFlags = displayFlags;
    this.willDisplay(viewContext);
    this._viewFlags |= View.DisplayingFlag;
    try {
      if (((this._viewFlags | displayFlags) & View.NeedsLayout) !== 0) {
        cascadeFlags |= View.NeedsLayout;
        this._viewFlags &= ~View.NeedsLayout;
        this.willLayout(viewContext);
      }
      if (((this._viewFlags | displayFlags) & View.NeedsRender) !== 0) {
        cascadeFlags |= View.NeedsRender;
        this._viewFlags &= ~View.NeedsRender;
        this.willRender(viewContext);
      }
      if (((this._viewFlags | displayFlags) & View.NeedsComposite) !== 0) {
        cascadeFlags |= View.NeedsComposite;
        this._viewFlags &= ~View.NeedsComposite;
        this.willComposite(viewContext);
      }

      this.onDisplay(viewContext);
      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.onLayout(viewContext);
      }
      if ((cascadeFlags & View.NeedsRender) !== 0) {
        this.onRender(viewContext);
      }
      if ((cascadeFlags & View.NeedsComposite) !== 0) {
        this.onComposite(viewContext);
      }

      this.doDisplayChildViews(cascadeFlags, viewContext);

      if ((cascadeFlags & View.NeedsComposite) !== 0) {
        this.didComposite(viewContext);
      }
      if ((cascadeFlags & View.NeedsRender) !== 0) {
        this.didRender(viewContext);
      }
      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.didLayout(viewContext);
      }
    } finally {
      this._viewFlags &= ~View.DisplayingFlag;
      this.didDisplay(viewContext);
    }
  }

  protected onLayout(viewContext: MapRasterViewContext): void {
    super.onLayout(viewContext);
    this.resizeCanvas(this._canvas);
    this.resetRenderer();
  }

  protected onRender(viewContext: MapRasterViewContext): void {
    super.onRender(viewContext);
    this.clearCanvas();
  }

  protected willComposite(viewContext: MapRasterViewContext): void {
    this.willObserve(function (viewObserver: MapRasterViewObserver): void {
      if (viewObserver.viewWillRender !== void 0) {
        viewObserver.viewWillRender(viewContext, this);
      }
    });
  }

  protected onComposite(viewContext: MapRasterViewContext): void {
    this.compositeImage(viewContext);
  }

  protected didComposite(viewContext: MapRasterViewContext): void {
    this.didObserve(function (viewObserver: MapRasterViewObserver): void {
      if (viewObserver.viewDidRender !== void 0) {
        viewObserver.viewDidRender(viewContext, this);
      }
    });
  }

  childViewContext(childView: View, viewContext: MapRasterViewContext): MapRasterViewContext {
    return viewContext;
  }

  rasterViewContext(viewContext: MapGraphicsViewContext): MapRasterViewContext {
    const rasterViewContext = Object.create(viewContext);
    rasterViewContext.compositor = viewContext.renderer;
    rasterViewContext.renderer = this.renderer;
    return rasterViewContext;
  }

  /** @hidden */
  get compositeFrame(): BoxR2 {
    let viewFrame = this._viewFrame;
    if (viewFrame === void 0) {
      const parentView = this._parentView;
      viewFrame = parentView instanceof GraphicsView ? parentView.viewFrame : BoxR2.undefined();
    }
    return viewFrame;
  }

  get viewFrame(): BoxR2 {
    return this._rasterFrame;
  }

  setViewFrame(viewFrame: BoxR2 | null): void {
    if (viewFrame !== null) {
      this._viewFrame = viewFrame;
    } else if (this._viewFrame !== void 0) {
      this._viewFrame = void 0;
    }
  }

  hitTest(x: number, y: number, viewContext: MapRasterViewContext): GraphicsView | null {
    const rasterViewContext = this.rasterViewContext(viewContext);
    const compositeFrame = this.compositeFrame;
    x -= Math.floor(compositeFrame.xMin);
    y -= Math.floor(compositeFrame.yMin);

    let hit: GraphicsView | null = null;
    const childViews = this._childViews;
    for (let i = childViews.length - 1; i >= 0; i -= 1) {
      const childView = childViews[i];
      if (childView instanceof GraphicsView && !childView.isHidden() && !childView.isCulled()) {
        const hitBounds = childView.hitBounds;
        if (hitBounds.contains(x, y)) {
          hit = childView.hitTest(x, y, rasterViewContext);
          if (hit !== null) {
            break;
          }
        }
      }
    }
    return hit;
  }

  get parentTransform(): Transform {
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

  protected resizeCanvas(node: HTMLCanvasElement): void {
    const compositeFrame = this.compositeFrame;
    const xMin = compositeFrame.xMin - Math.floor(compositeFrame.xMin);
    const yMin = compositeFrame.yMin - Math.floor(compositeFrame.yMin);
    const xMax = Math.ceil(xMin + compositeFrame.width);
    const yMax = Math.ceil(yMin + compositeFrame.height);
    const rasterFrame = new BoxR2(xMin, yMin, xMax, yMax);
    if (!this._rasterFrame.equals(rasterFrame)) {
      const pixelRatio = this.pixelRatio;
      node.width = xMax * pixelRatio;
      node.height = yMax * pixelRatio;
      node.style.width = xMax + "px";
      node.style.height = yMax + "px";
      this._rasterFrame = rasterFrame;
    }
  }

  clearCanvas(): void {
    const renderer = this.renderer;
    if (renderer instanceof CanvasRenderer) {
      const rasterFrame = this._rasterFrame;
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
      const rasterFrame = this._rasterFrame;
      renderer.context.viewport(0, 0, rasterFrame.xMax, rasterFrame.yMax);
    }
  }

  protected compositeImage(viewContext: MapRasterViewContext): void {
    const compositor = viewContext.compositor;
    const renderer = viewContext.renderer;
    if (compositor instanceof CanvasRenderer && renderer instanceof CanvasRenderer) {
      const imageData = renderer.context.getImageData(0, 0, this._canvas.width, this._canvas.height);
      const compositeFrame = this.compositeFrame;
      const pixelRatio = compositor.pixelRatio;
      const context = compositor.context;
      context.save();
      context.globalAlpha = this.opacity.value!;
      context.globalCompositeOperation = this.compositeOperation.value!;
      const x = Math.floor(compositeFrame.xMin) * pixelRatio;
      const y = Math.floor(compositeFrame.yMin) * pixelRatio;
      context.putImageData(imageData, x, y);
      context.restore();
    }
  }
}
