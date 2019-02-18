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
import {RenderView} from "@swim/view";
import {MapGraphicView} from "./MapGraphicView";
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

  cascadeRender(context: RenderingContext): void {
    const layerContext = this.getContext();
    this.willRender(context, layerContext);
    if (this._dirty) {
      this.onRender(context, layerContext);
      const childViews = this.childViews;
      for (let i = 0, n = childViews.length; i < n; i += 1) {
        const childView = childViews[i];
        if (RenderView.is(childView)) {
          childView.cascadeRender(layerContext);
        }
      }
    }
    this.didRender(context, layerContext);
  }

  protected willRender(context: RenderingContext, layerContext?: RenderingContext): void {
    super.willRender(context);
  }

  protected onRender(context: RenderingContext, layerContext?: RenderingContext): void {
    const bounds = this._bounds;
    layerContext!.clearRect(0, 0, bounds.width, bounds.height);
    super.onRender(context);
  }

  protected didRender(context: RenderingContext, layerContext?: RenderingContext): void {
    this.copyLayerImage(context, layerContext!);
    super.didRender(context);
  }

  protected copyLayerImage(context: RenderingContext, layerContext: RenderingContext): void {
    const bounds = this._bounds;
    const pixelRatio = this.pixelRatio;
    const imageData = layerContext.getImageData(0, 0, bounds.width * pixelRatio, bounds.height * pixelRatio);
    context.putImageData(imageData, bounds.x * pixelRatio, bounds.y * pixelRatio);
  }

  protected onCull(): void {
    // nop
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
      this.setDirty(true);
    }
  }

  protected setChildViewBounds(childView: RenderView, bounds: BoxR2): void {
    if (bounds.x !== 0 || bounds.y !== 0) {
      // transform bounds into layer coordinates
      const width = bounds.width;
      const height = bounds.height;
      bounds = new BoxR2(0, 0, width, height);
    }
    childView.setBounds(bounds);
  }

  protected setChildViewAnchor(childView: RenderView, anchor: PointR2): void {
    const bounds = this._bounds;
    const x = bounds.x;
    const y = bounds.y;
    if (x !== 0 || y !== 0) {
      // transform anchor into layer coordinates
      anchor = new PointR2(anchor.x - x, anchor.y - y);
    }
    childView.setAnchor(anchor);
  }

  hitTest(x: number, y: number, context: RenderingContext): RenderView | null {
    const layerContext = this.getContext();
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

  getContext(): RenderingContext {
    return this._canvas.getContext("2d")!;
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
    const context = this.getContext();
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }
}
