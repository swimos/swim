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

import type {GeoPoint, GeoBox, GeoProjection} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {ViewContextType, ViewFlags, View, ViewAnimator} from "@swim/view";
import {GraphicsView, CanvasContext, CanvasRenderer} from "@swim/graphics";
import {MapGraphicsViewInit, MapGraphicsView} from "../graphics/MapGraphicsView";
import {MapGridTile} from "./MapGridTile";

export interface MapGridViewInit extends MapGraphicsViewInit {
  tileOutlineColor?: AnyColor;
}

export class MapGridView extends MapGraphicsView {
  constructor(geoFrame?: GeoBox, depth?: number, maxDepth?: number, density?: number) {
    super();
    Object.defineProperty(this, "quadtree", {
      value: MapGridTile.empty(geoFrame, depth, maxDepth, density),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "childViewMap", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  initView(init: MapGridViewInit): void {
    super.initView(init);
    if (init.tileOutlineColor !== void 0) {
      this.tileOutlineColor(init.tileOutlineColor);
    }
  }

  @ViewAnimator({type: Color})
  declare tileOutlineColor: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  /** @hidden */
  declare readonly quadtree: MapGridTile;

  get childViewCount(): number {
    return this.quadtree.size;
  }

  get childViews(): ReadonlyArray<View> {
    const childViews: View[] = [];
    this.quadtree.forEach(function (childView: MapGraphicsView): void {
      childViews.push(childView);
    }, this);
    return childViews;
  }

  firstChildView(): View | null {
    const childView = this.quadtree.forEach(function (childView: MapGraphicsView): MapGraphicsView {
      return childView;
    }, this);
    return childView !== void 0 ? childView : null;
  }

  lastChildView(): View | null {
    const childView = this.quadtree.forEachReverse(function (childView: MapGraphicsView): MapGraphicsView {
      return childView;
    }, this);
    return childView !== void 0 ? childView : null;
  }

  nextChildView(targetView: View): View | null {
    if (targetView.parentView === this) {
      let nextChildView: MapGraphicsView | null = null;
      const childView = this.quadtree.forEachReverse(function (childView: MapGraphicsView): MapGraphicsView | null | void {
        if (childView === targetView) {
          return nextChildView;
        }
        nextChildView = childView;
      }, this);
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  previousChildView(targetView: View): View | null {
    if (targetView.parentView === this) {
      let previousChildView: MapGraphicsView | null = null;
      const childView = this.quadtree.forEach(function (childView: MapGraphicsView): MapGraphicsView | null | void {
        if (childView === targetView) {
          return previousChildView;
        }
        previousChildView = childView;
      }, this);
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  forEachChildView<T>(callback: (childView: View) => T | void): T | undefined;
  forEachChildView<T, S>(callback: (this: S, childView: View) => T | void,
                         thisArg: S): T | undefined;
  forEachChildView<T, S>(callback: (this: S | undefined, childView: View) => T | void,
                         thisArg?: S): T | undefined {
    return this.quadtree.forEach(callback, thisArg);
  }

  /** @hidden */
  declare readonly childViewMap: {[key: string]: MapGraphicsView | undefined} | null;

  getChildView(key: string): MapGraphicsView | null {
    const childViewMap = this.childViewMap;
    if (childViewMap !== null) {
      const childView = childViewMap[key];
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  setChildView(key: string, newChildView: View | null): View | null {
    if (newChildView !== null) {
      if (!(newChildView instanceof MapGraphicsView)) {
        throw new TypeError("" + newChildView);
      }
      newChildView.remove();
    }
    const oldChildView = this.getChildView(key);
    if (oldChildView !== null) {
      const oldChildGeoBounds = oldChildView.geoBounds;
      this.willRemoveChildView(oldChildView);
      oldChildView.setParentView(null, this);
      this.removeChildViewMap(oldChildView);
      const oldGeoBounds = this.quadtree.geoBounds;
      Object.defineProperty(this, "quadtree", {
        value: this.quadtree.removed(oldChildView, oldChildGeoBounds),
        enumerable: true,
        configurable: true,
      });
      const newGeoBounds = this.quadtree.geoBounds;
      if (!newGeoBounds.equals(oldGeoBounds)) {
        this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
      }
      this.onRemoveChildView(oldChildView);
      this.didRemoveChildView(oldChildView);
      oldChildView.setKey(void 0);
    }
    if (newChildView !== null) {
      const newChildGeoBounds = newChildView.geoBounds;
      newChildView.setKey(key);
      const oldGeoBounds = this.quadtree.geoBounds;
      Object.defineProperty(this, "quadtree", {
        value: this.quadtree.inserted(newChildView, newChildGeoBounds),
        enumerable: true,
        configurable: true,
      });
      const newGeoBounds = this.quadtree.geoBounds;
      if (!newGeoBounds.equals(oldGeoBounds)) {
        this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
      }
      this.insertChildViewMap(newChildView);
      newChildView.setParentView(this, null);
      this.onInsertChildView(newChildView, null);
      this.didInsertChildView(newChildView, null);
      newChildView.cascadeInsert();
    }
    return oldChildView;
  }

  /** @hidden */
  protected insertChildViewMap(childView: MapGraphicsView): void {
    const key = childView.key;
    if (key !== void 0) {
      let childViewMap = this.childViewMap;
      if (childViewMap === null) {
        childViewMap = {};
        Object.defineProperty(this, "childViewMap", {
          value: childViewMap,
          enumerable: true,
          configurable: true,
        });
      }
      childViewMap[key] = childView;
    }
  }

  /** @hidden */
  protected removeChildViewMap(childView: MapGraphicsView): void {
    const key = childView.key;
    if (key !== void 0) {
      const childViewMap = this.childViewMap;
      if (childViewMap !== null) {
        delete childViewMap[key];
      }
    }
  }

  appendChildView(childView: View, key?: string): void {
    if (!(childView instanceof MapGraphicsView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childViewBounds = childView.geoBounds;
    this.willInsertChildView(childView, null);
    const oldGeoBounds = this.quadtree.geoBounds;
    Object.defineProperty(this, "quadtree", {
      value: this.quadtree.inserted(childView, childViewBounds),
      enumerable: true,
      configurable: true,
    });
    const newGeoBounds = this.quadtree.geoBounds;
    if (!newGeoBounds.equals(oldGeoBounds)) {
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
    childView.cascadeInsert();
  }

  prependChildView(childView: View, key?: string): void {
    if (!(childView instanceof MapGraphicsView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childViewBounds = childView.geoBounds;
    this.willInsertChildView(childView, null);
    const oldGeoBounds = this.quadtree.geoBounds;
    Object.defineProperty(this, "quadtree", {
      value: this.quadtree.inserted(childView, childViewBounds),
      enumerable: true,
      configurable: true,
    });
    const newGeoBounds = this.quadtree.geoBounds;
    if (!newGeoBounds.equals(oldGeoBounds)) {
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
    childView.cascadeInsert();
  }

  insertChildView(childView: View, targetView: View | null, key?: string): void {
    if (!(childView instanceof MapGraphicsView)) {
      throw new TypeError("" + childView);
    }
    if (targetView !== null && !(targetView instanceof GraphicsView)) {
      throw new TypeError("" + targetView);
    }
    if (targetView !== null && targetView.parentView !== this) {
      throw new TypeError("" + targetView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childViewBounds = childView.geoBounds;
    this.willInsertChildView(childView, targetView);
    const oldGeoBounds = this.quadtree.geoBounds;
    Object.defineProperty(this, "quadtree", {
      value: this.quadtree.inserted(childView, childViewBounds),
      enumerable: true,
      configurable: true,
    });
    const newGeoBounds = this.quadtree.geoBounds;
    if (!newGeoBounds.equals(oldGeoBounds)) {
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildView(childView, targetView);
    childView.cascadeInsert();
  }

  removeChildView(key: string): View | null;
  removeChildView(childView: View): void;
  removeChildView(key: string | View): View | null | void {
    let childView: View | null;
    if (typeof key === "string") {
      childView = this.getChildView(key);
      if (childView === null) {
        return null;
      }
    } else {
      childView = key;
    }
    if (!(childView instanceof MapGraphicsView)) {
      throw new TypeError("" + childView);
    }
    if (childView.parentView !== this) {
      throw new Error("not a child view");
    }
    const childViewBounds = childView.geoBounds;
    this.willRemoveChildView(childView);
    childView.setParentView(null, this);
    this.removeChildViewMap(childView);
    const oldGeoBounds = this.quadtree.geoBounds;
    Object.defineProperty(this, "quadtree", {
      value: this.quadtree.removed(childView, childViewBounds),
      enumerable: true,
      configurable: true,
    });
    const newGeoBounds = this.quadtree.geoBounds;
    if (!newGeoBounds.equals(oldGeoBounds)) {
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    this.onRemoveChildView(childView);
    this.didRemoveChildView(childView);
    childView.setKey(void 0);
    if (typeof key === "string") {
      return childView;
    }
  }

  removeAll(): void {
    this.quadtree.forEach(function (childView: MapGraphicsView): void {
      this.removeChildView(childView);
    }, this);
  }

  /** @hidden */
  protected doProcessChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    if ((processFlags & View.ProcessMask) !== 0 && !this.isHidden() && !this.isCulled()) {
      this.willProcessChildViews(processFlags, viewContext);
      this.onProcessChildViews(processFlags, viewContext);
      this.didProcessChildViews(processFlags, viewContext);
    }
  }

  protected processChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                              processChildView: (this: this, childView: View, processFlags: ViewFlags,
                                                 viewContext: ViewContextType<this>) => void): void {
    this.processTile(this.quadtree, processFlags, viewContext, processChildView);
  }

  /** @hidden */
  protected processTile(tile: MapGridTile, processFlags: ViewFlags, viewContext: ViewContextType<this>,
                        processChildView: (this: this, childView: View, processFlags: ViewFlags,
                                           viewContext: ViewContextType<this>) => void): void {
    if (tile.southWest !== null && tile.southWest.geoFrame.intersects(viewContext.geoFrame)) {
      this.processTile(tile.southWest, processFlags, viewContext, processChildView);
    }
    if (tile.northWest !== null && tile.northWest.geoFrame.intersects(viewContext.geoFrame)) {
      this.processTile(tile.northWest, processFlags, viewContext, processChildView);
    }
    if (tile.southEast !== null && tile.southEast.geoFrame.intersects(viewContext.geoFrame)) {
      this.processTile(tile.southEast, processFlags, viewContext, processChildView);
    }
    if (tile.northEast !== null && tile.northEast.geoFrame.intersects(viewContext.geoFrame)) {
      this.processTile(tile.northEast, processFlags, viewContext, processChildView);
    }
    const childViews = tile.views;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i]!;
      processChildView.call(this, childView, processFlags, viewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    const outlineColor = this.getViewAnimator("tileOutlineColor") as ViewAnimator<this, Color, AnyColor> | null;
    if (outlineColor !== null && outlineColor.value !== void 0) {
      this.renderTiles(viewContext, outlineColor.value);
    }
  }

  protected renderTiles(viewContext: ViewContextType<this>, outlineColor: Color): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderTile(this.quadtree, context, viewContext.geoProjection, outlineColor);
      context.restore();
    }
  }

  protected renderTile(tile: MapGridTile, context: CanvasContext,
                       geoProjection: GeoProjection, outlineColor: Color): void {
    if (tile.southWest !== null) {
      this.renderTile(tile.southWest, context, geoProjection, outlineColor);
    }
    if (tile.northWest !== null) {
      this.renderTile(tile.northWest, context, geoProjection, outlineColor);
    }
    if (tile.southEast !== null) {
      this.renderTile(tile.southEast, context, geoProjection, outlineColor);
    }
    if (tile.northEast !== null) {
      this.renderTile(tile.northEast, context, geoProjection, outlineColor);
    }
    const minDepth = 2;
    if (tile.depth >= minDepth) {
      const southWest = geoProjection.project(tile.geoFrame.southWest);
      const northWest = geoProjection.project(tile.geoFrame.northWest);
      const northEast = geoProjection.project(tile.geoFrame.northEast);
      const southEast = geoProjection.project(tile.geoFrame.southEast);
      context.beginPath();
      context.moveTo(southWest.x, southWest.y);
      context.lineTo(northWest.x, northWest.y);
      context.lineTo(northEast.x, northEast.y);
      context.lineTo(southEast.x, southEast.y);
      context.closePath();
      const u = (tile.depth - minDepth) / (tile.maxDepth - minDepth)
      context.lineWidth = 4 * (1 - u) + 0.5 * u;
      context.strokeStyle = outlineColor.toString();
      context.stroke();
    }
  }

  protected displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                              displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                 viewContext: ViewContextType<this>) => void): void {
    this.displayTile(this.quadtree, displayFlags, viewContext, displayChildView);
  }

  /** @hidden */
  protected displayTile(tile: MapGridTile, displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                        displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                           viewContext: ViewContextType<this>) => void): void {
    if (tile.southWest !== null && tile.southWest.geoFrame.intersects(viewContext.geoFrame)) {
      this.displayTile(tile.southWest, displayFlags, viewContext, displayChildView);
    }
    if (tile.northWest !== null && tile.northWest.geoFrame.intersects(viewContext.geoFrame)) {
      this.displayTile(tile.northWest, displayFlags, viewContext, displayChildView);
    }
    if (tile.southEast !== null && tile.southEast.geoFrame.intersects(viewContext.geoFrame)) {
      this.displayTile(tile.southEast, displayFlags, viewContext, displayChildView);
    }
    if (tile.northEast !== null && tile.northEast.geoFrame.intersects(viewContext.geoFrame)) {
      this.displayTile(tile.northEast, displayFlags, viewContext, displayChildView);
    }
    const childViews = tile.views;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i]!;
      displayChildView.call(this, childView, displayFlags, viewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
  }

  childViewDidSetGeoBounds(childView: MapGraphicsView, newChildViewGeoBounds: GeoBox, oldChildViewGeoBounds: GeoBox): void {
    const oldGeoBounds = this.quadtree.geoBounds;
    Object.defineProperty(this, "quadtree", {
      value: this.quadtree.moved(childView, newChildViewGeoBounds, oldChildViewGeoBounds),
      enumerable: true,
      configurable: true,
    });
    const newGeoBounds = this.quadtree.geoBounds;
    if (!newGeoBounds.equals(oldGeoBounds)) {
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
  }

  get geoBounds(): GeoBox {
    return this.quadtree.geoBounds;
  }

  protected doHitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const geoPoint = viewContext.geoProjection.unproject(x, y);
    return this.hitTestTile(this.quadtree, x, y, geoPoint, viewContext);
  }

  protected hitTestTile(tile: MapGridTile, x: number, y: number, geoPoint: GeoPoint,
                        viewContext: ViewContextType<this>): GraphicsView | null {
    let hit: GraphicsView | null = null;
    if (tile.southWest !== null && tile.southWest.geoFrame.contains(geoPoint)) {
      hit = this.hitTestTile(tile.southWest, x, y, geoPoint, viewContext);
    }
    if (hit === null && tile.northWest !== null && tile.northWest.geoFrame.contains(geoPoint)) {
      hit = this.hitTestTile(tile.northWest, x, y, geoPoint, viewContext);
    }
    if (hit === null && tile.southEast !== null && tile.southEast.geoFrame.contains(geoPoint)) {
      hit = this.hitTestTile(tile.southEast, x, y, geoPoint, viewContext);
    }
    if (hit === null && tile.northEast !== null && tile.northEast.geoFrame.contains(geoPoint)) {
      hit = this.hitTestTile(tile.northEast, x, y, geoPoint, viewContext);
    }
    if (hit === null) {
      const childViews = tile.views;
      for (let i = 0; i < childViews.length; i += 1) {
        const childView = childViews[i]!;
        if (childView.hitBounds.contains(x, y)) {
          hit = childView.hitTest(x, y, viewContext);
          if (hit !== null) {
            break;
          }
        }
      }
    }
    return hit;
  }

  static create(): MapGridView {
    return new MapGridView();
  }
}
