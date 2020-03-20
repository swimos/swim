// Copyright 2015-2020 SWIM.AI inc.
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

import {PointR2, BoxR2} from "@swim/math";
import {Transform} from "@swim/transform";
import {AnyRenderer, RendererType, Renderer, CanvasRenderer, WebGLRenderer} from "@swim/render";
import {View, RenderedView} from "@swim/view";
import {MapViewContext} from "./MapViewContext";
import {MapView} from "./MapView";
import {MapGraphicsView} from "./MapGraphicsView";
import {MapLayerViewContext} from "./MapLayerViewContext";
import {MapLayerViewController} from "./MapLayerViewController";

export class MapLayerView extends MapGraphicsView {
  /** @hidden */
  _canvas: HTMLCanvasElement;
  /** @hidden */
  _viewController: MapLayerViewController | null;
  /** @hidden */
  _renderer: Renderer | null | undefined;

  constructor(key: string | null = null) {
    super(key);
    this._canvas = this.createCanvas();
    this._renderer = void 0;
  }

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  get viewController(): MapLayerViewController | null {
    return this._viewController;
  }

  get pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  get layerRenderer(): Renderer | null {
    const parentView = this.parentView;
    return RenderedView.is(parentView) ? parentView.renderer : null;
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
      if (context) {
        return new CanvasRenderer(context, this.pixelRatio);
      } else {
        throw new Error("Failed to create canvas rendering context");
      }
    } else if (rendererType === "webgl") {
      const context = this._canvas.getContext("webgl");
      if (context) {
        return new WebGLRenderer(context, this.pixelRatio);
      } else {
        throw new Error("Failed to create webgl rendering context");
      }
    } else {
      throw new Error("Failed to create " + rendererType + " renderer");
    }
  }

  /** @hidden */
  doUpdate(updateFlags: number, viewContext: MapViewContext): void {
    const layerViewContext = this.layerViewContext(viewContext);
    this.willUpdate(layerViewContext);
    if (((updateFlags | this._updateFlags) & View.NeedsCompute) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsCompute;
      this.doCompute(layerViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsAnimate) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsAnimate;
      this.doAnimate(layerViewContext);
    }
    if (((updateFlags | this._updateFlags) & MapView.NeedsProject) !== 0) {
      this._updateFlags = this._updateFlags & ~MapView.NeedsProject;
      this.doProject(layerViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsLayout) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsLayout;
      this.doLayout(layerViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsScroll) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsScroll;
      this.doScroll(layerViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsRender) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsRender;
      this.doRender(layerViewContext);
    }
    this.onUpdate(layerViewContext);
    this.doUpdateChildViews(updateFlags, layerViewContext);
    this.didUpdate(layerViewContext);
  }

  protected onRender(viewContext: MapLayerViewContext): void {
    this.clearCanvas();
  }

  protected didUpdateChildViews(viewContext: MapLayerViewContext): void {
    super.didUpdateChildViews(viewContext);
    this.copyLayerImage(viewContext);
  }

  childViewContext(childView: View, viewContext: MapLayerViewContext): MapLayerViewContext {
    return viewContext;
  }

  layerViewContext(viewContext: MapViewContext): MapLayerViewContext {
    const layerViewContext = Object.create(viewContext);
    layerViewContext.layerRenderer = viewContext.renderer;
    layerViewContext.renderer = this.renderer;
    return layerViewContext;
  }

  get parentTransform(): Transform {
    return Transform.identity();
  }

  protected willSetBounds(bounds: BoxR2): BoxR2 | void {
    const newBounds = super.willSetBounds(bounds);
    if (newBounds instanceof BoxR2) {
      bounds = newBounds;
    }
    const xMin = Math.round(bounds.xMin);
    const yMin = Math.round(bounds.yMin);
    const xMax = Math.round(bounds.xMax);
    const yMax = Math.round(bounds.yMax);
    return new BoxR2(xMin, yMin, xMax, yMax);
  }

  protected onSetBounds(newBounds: BoxR2, oldBounds: BoxR2): void {
    if (!newBounds.equals(oldBounds)) {
      this.resizeCanvas(this._canvas, newBounds);
      this.resetRenderer();
      this.requireUpdate(View.NeedsLayout);
    }
  }

  protected layoutChildView(childView: View): void {
    if (RenderedView.is(childView)) {
      let bounds = this._bounds;
      let anchor = this._anchor;
      const x = bounds.x;
      const y = bounds.y;
      if (bounds.x !== 0 || bounds.y !== 0) {
        // transform bounds into layer coordinates
        const width = bounds.width;
        const height = bounds.height;
        bounds = new BoxR2(0, 0, width, height);
      }
      if (x !== 0 || y !== 0) {
        // transform anchor into layer coordinates
        anchor = new PointR2(anchor.x - x, anchor.y - y);
      }
      childView.setBounds(bounds);
      childView.setAnchor(anchor);
    }
  }

  hitTest(x: number, y: number, viewContext: MapViewContext): RenderedView | null {
    const layerViewContext = this.layerViewContext(viewContext);
    const bounds = this._bounds;
    x -= bounds.x;
    y -= bounds.y;

    let hit: RenderedView | null = null;
    const childViews = this._childViews;
    for (let i = childViews.length - 1; i >= 0; i -= 1) {
      const childView = childViews[i];
      if (RenderedView.is(childView) && childView.bounds.contains(x, y)) {
        hit = childView.hitTest(x, y, layerViewContext);
        if (hit !== null) {
          break;
        }
      }
    }
    return hit;
  }

  protected createCanvas(): HTMLCanvasElement {
    return document.createElement("canvas");
  }

  protected resizeCanvas(node: HTMLCanvasElement, bounds: BoxR2): void {
    const width = Math.floor(bounds.width);
    const height = Math.floor(bounds.height);
    const pixelRatio = this.pixelRatio;
    node.width = width * pixelRatio;
    node.height = height * pixelRatio;
    node.style.width = width + "px";
    node.style.height = height + "px";
  }

  clearCanvas(): void {
    const renderer = this.renderer;
    if (renderer instanceof CanvasRenderer) {
      const bounds = this._bounds;
      renderer.context.clearRect(0, 0, bounds.width, bounds.height);
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
      const bounds = this._bounds;
      renderer.context.viewport(0, 0, bounds.width, bounds.height);
    }
  }

  protected copyLayerImage(viewContext: MapLayerViewContext): void {
    const layerRenderer = viewContext.layerRenderer;
    const renderer = viewContext.renderer;
    if (layerRenderer instanceof CanvasRenderer && renderer instanceof CanvasRenderer) {
      const bounds = this._bounds;
      const pixelRatio = this.pixelRatio;
      const imageData = layerRenderer.context.getImageData(0, 0, bounds.width * pixelRatio, bounds.height * pixelRatio);
      renderer.context.putImageData(imageData, bounds.x * pixelRatio, bounds.y * pixelRatio);
    }
  }
}
