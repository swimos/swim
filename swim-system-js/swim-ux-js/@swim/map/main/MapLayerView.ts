// Copyright 2015-2019 SWIM.AI inc.
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
import {RenderingContext} from "@swim/render";
import {View, RenderView} from "@swim/view";
import {MapViewContext} from "./MapViewContext";
import {MapView} from "./MapView";
import {MapGraphicView} from "./MapGraphicView";
import {MapLayerViewContext} from "./MapLayerViewContext";
import {MapLayerViewController} from "./MapLayerViewController";

export class MapLayerView extends MapGraphicView {
  /** @hidden */
  _canvas: HTMLCanvasElement;
  /** @hidden */
  _viewController: MapLayerViewController | null;

  constructor(key: string | null = null) {
    super(key);
    this._canvas = this.createCanvas();
  }

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  get viewController(): MapLayerViewController | null {
    return this._viewController;
  }

  get renderingContext(): RenderingContext | null {
    return this._canvas.getContext("2d");
  }

  get layeringContext(): RenderingContext | null {
    const parentView = this.parentView;
    return RenderView.is(parentView) ? parentView.renderingContext : null;
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
    if (this.parentView) {
      const bounds = this._bounds;
      viewContext.layeringContext.clearRect(0, 0, bounds.width, bounds.height);
    }
    super.onRender(viewContext);
  }

  protected didUpdateChildViews(viewContext: MapLayerViewContext): void {
    super.didUpdateChildViews(viewContext);
    this.copyLayerImage(viewContext);
  }

  protected copyLayerImage(viewContext: MapLayerViewContext): void {
    const bounds = this._bounds;
    const pixelRatio = this.pixelRatio;
    const imageData = viewContext.layeringContext.getImageData(0, 0, bounds.width * pixelRatio, bounds.height * pixelRatio);
    viewContext.renderingContext.putImageData(imageData, bounds.x * pixelRatio, bounds.y * pixelRatio);
  }

  childViewContext(childView: View, viewContext: MapLayerViewContext): MapLayerViewContext {
    return viewContext;
  }

  layerViewContext(viewContext: MapViewContext): MapLayerViewContext {
    return {
      updateTime: viewContext.updateTime,
      viewport: viewContext.viewport,
      viewIdiom: viewContext.viewIdiom,
      renderingContext: this.renderingContext!,
      layeringContext: viewContext.renderingContext,
      pixelRatio: this.pixelRatio,
      projection: viewContext.projection,
      zoom: viewContext.zoom,
    };
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
      this.requireUpdate(View.NeedsLayout);
    }
  }

  protected layoutChildView(childView: View): void {
    if (RenderView.is(childView)) {
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

  hitTest(x: number, y: number, context: RenderingContext): RenderView | null {
    const layerContext = this.renderingContext!;
    const bounds = this._bounds;
    x -= bounds.x;
    y -= bounds.y;

    let hit: RenderView | null = null;
    const childViews = this._childViews;
    for (let i = childViews.length - 1; i >= 0; i -= 1) {
      const childView = childViews[i];
      if (RenderView.is(childView) && childView.bounds.contains(x, y)) {
        hit = childView.hitTest(x, y, layerContext);
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
    const context = this.renderingContext!;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }
}
