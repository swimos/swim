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

import type {GeoPoint, GeoBox, GeoProjection} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {ViewContextType, ViewFlags, View, ViewAnimator} from "@swim/view";
import {GraphicsView, CanvasContext, CanvasRenderer} from "@swim/graphics";
import {GeoViewInit, GeoView} from "../geo/GeoView";
import {GeoTree} from "./GeoTree";

export interface GeoTreeViewInit extends GeoViewInit {
  treeOutlineColor?: AnyColor;
}

export class GeoTreeView extends GeoView {
  constructor(geoFrame?: GeoBox, depth?: number, maxDepth?: number, density?: number) {
    super();
    Object.defineProperty(this, "root", {
      value: GeoTree.empty(geoFrame, depth, maxDepth, density),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "childViewMap", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  override initView(init: GeoTreeViewInit): void {
    super.initView(init);
    if (init.treeOutlineColor !== void 0) {
      this.treeOutlineColor(init.treeOutlineColor);
    }
  }

  @ViewAnimator({type: Color})
  readonly treeOutlineColor!: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  /** @hidden */
  readonly root!: GeoTree;

  override get childViewCount(): number {
    return this.root.size;
  }

  override get childViews(): ReadonlyArray<View> {
    const childViews: View[] = [];
    this.root.forEach(function (childView: GeoView): void {
      childViews.push(childView);
    }, this);
    return childViews;
  }

  override firstChildView(): View | null {
    const childView = this.root.forEach(function (childView: GeoView): GeoView {
      return childView;
    }, this);
    return childView !== void 0 ? childView : null;
  }

  override lastChildView(): View | null {
    const childView = this.root.forEachReverse(function (childView: GeoView): GeoView {
      return childView;
    }, this);
    return childView !== void 0 ? childView : null;
  }

  override nextChildView(targetView: View): View | null {
    if (targetView.parentView === this) {
      let nextChildView: GeoView | null = null;
      const childView = this.root.forEachReverse(function (childView: GeoView): GeoView | null | void {
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

  override previousChildView(targetView: View): View | null {
    if (targetView.parentView === this) {
      let previousChildView: GeoView | null = null;
      const childView = this.root.forEach(function (childView: GeoView): GeoView | null | void {
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

  override forEachChildView<T>(callback: (childView: View) => T | void): T | undefined;
  override forEachChildView<T, S>(callback: (this: S, childView: View) => T | void,
                                  thisArg: S): T | undefined;
  override forEachChildView<T, S>(callback: (this: S | undefined, childView: View) => T | void,
                                  thisArg?: S): T | undefined {
    return this.root.forEach(callback, thisArg);
  }

  /** @hidden */
  readonly childViewMap!: {[key: string]: GeoView | undefined} | null;

  override getChildView(key: string): GeoView | null {
    const childViewMap = this.childViewMap;
    if (childViewMap !== null) {
      const childView = childViewMap[key];
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  override setChildView(key: string, newChildView: View | null): View | null {
    if (newChildView !== null) {
      if (!(newChildView instanceof GeoView)) {
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
      const oldGeoBounds = this.root.geoBounds;
      Object.defineProperty(this, "root", {
        value: this.root.removed(oldChildView, oldChildGeoBounds),
        enumerable: true,
        configurable: true,
      });
      const newGeoBounds = this.root.geoBounds;
      if (!newGeoBounds.equals(oldGeoBounds)) {
        this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
      }
      this.onRemoveChildView(oldChildView);
      this.didRemoveChildView(oldChildView);
      oldChildView.setKey(void 0);
    }
    if (newChildView !== null) {
      const newChildGeoBounds = newChildView.geoBounds;
      newChildView.setKey(key);
      const oldGeoBounds = this.root.geoBounds;
      Object.defineProperty(this, "root", {
        value: this.root.inserted(newChildView, newChildGeoBounds),
        enumerable: true,
        configurable: true,
      });
      const newGeoBounds = this.root.geoBounds;
      if (!newGeoBounds.equals(oldGeoBounds)) {
        this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
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
  protected insertChildViewMap(childView: GeoView): void {
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
  protected removeChildViewMap(childView: GeoView): void {
    const key = childView.key;
    if (key !== void 0) {
      const childViewMap = this.childViewMap;
      if (childViewMap !== null) {
        delete childViewMap[key];
      }
    }
  }

  override appendChildView(childView: View, key?: string): void {
    if (!(childView instanceof GeoView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childViewBounds = childView.geoBounds;
    this.willInsertChildView(childView, null);
    const oldGeoBounds = this.root.geoBounds;
    Object.defineProperty(this, "root", {
      value: this.root.inserted(childView, childViewBounds),
      enumerable: true,
      configurable: true,
    });
    const newGeoBounds = this.root.geoBounds;
    if (!newGeoBounds.equals(oldGeoBounds)) {
      this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
    childView.cascadeInsert();
  }

  override prependChildView(childView: View, key?: string): void {
    if (!(childView instanceof GeoView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childViewBounds = childView.geoBounds;
    this.willInsertChildView(childView, null);
    const oldGeoBounds = this.root.geoBounds;
    Object.defineProperty(this, "root", {
      value: this.root.inserted(childView, childViewBounds),
      enumerable: true,
      configurable: true,
    });
    const newGeoBounds = this.root.geoBounds;
    if (!newGeoBounds.equals(oldGeoBounds)) {
      this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
    childView.cascadeInsert();
  }

  override insertChildView(childView: View, targetView: View | null, key?: string): void {
    if (!(childView instanceof GeoView)) {
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
    const oldGeoBounds = this.root.geoBounds;
    Object.defineProperty(this, "root", {
      value: this.root.inserted(childView, childViewBounds),
      enumerable: true,
      configurable: true,
    });
    const newGeoBounds = this.root.geoBounds;
    if (!newGeoBounds.equals(oldGeoBounds)) {
      this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildView(childView, targetView);
    childView.cascadeInsert();
  }

  override removeChildView(key: string): View | null;
  override removeChildView(childView: View): void;
  override removeChildView(key: string | View): View | null | void {
    let childView: View | null;
    if (typeof key === "string") {
      childView = this.getChildView(key);
      if (childView === null) {
        return null;
      }
    } else {
      childView = key;
    }
    if (!(childView instanceof GeoView)) {
      throw new TypeError("" + childView);
    }
    if (childView.parentView !== this) {
      throw new Error("not a child view");
    }
    const childViewBounds = childView.geoBounds;
    this.willRemoveChildView(childView);
    childView.setParentView(null, this);
    this.removeChildViewMap(childView);
    const oldGeoBounds = this.root.geoBounds;
    Object.defineProperty(this, "root", {
      value: this.root.removed(childView, childViewBounds),
      enumerable: true,
      configurable: true,
    });
    const newGeoBounds = this.root.geoBounds;
    if (!newGeoBounds.equals(oldGeoBounds)) {
      this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    this.onRemoveChildView(childView);
    this.didRemoveChildView(childView);
    childView.setKey(void 0);
    if (typeof key === "string") {
      return childView;
    }
  }

  override removeAll(): void {
    this.root.forEach(function (childView: GeoView): void {
      this.removeChildView(childView);
    }, this);
  }

  protected override processChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                                       processChildView: (this: this, childView: View, processFlags: ViewFlags,
                                                          viewContext: ViewContextType<this>) => void): void {
    this.processTree(this.root, processFlags, viewContext, processChildView);
  }

  /** @hidden */
  protected processTree(tree: GeoTree, processFlags: ViewFlags, viewContext: ViewContextType<this>,
                        processChildView: (this: this, childView: View, processFlags: ViewFlags,
                                           viewContext: ViewContextType<this>) => void): void {
    if (tree.southWest !== null && tree.southWest.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.processTree(tree.southWest, processFlags, viewContext, processChildView);
    }
    if (tree.northWest !== null && tree.northWest.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.processTree(tree.northWest, processFlags, viewContext, processChildView);
    }
    if (tree.southEast !== null && tree.southEast.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.processTree(tree.southEast, processFlags, viewContext, processChildView);
    }
    if (tree.northEast !== null && tree.northEast.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.processTree(tree.northEast, processFlags, viewContext, processChildView);
    }
    const childViews = tree.views;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i]!;
      processChildView.call(this, childView, processFlags, viewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    const outlineColor = this.getViewAnimator("treeOutlineColor") as ViewAnimator<this, Color, AnyColor> | null;
    if (outlineColor !== null && outlineColor.value !== void 0) {
      this.renderTree(viewContext, outlineColor.value);
    }
  }

  protected renderTree(viewContext: ViewContextType<this>, outlineColor: Color): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderTreeOutline(this.root, context, viewContext.geoViewport, outlineColor);
      context.restore();
    }
  }

  protected renderTreeOutline(tree: GeoTree, context: CanvasContext,
                              geoProjection: GeoProjection, outlineColor: Color): void {
    if (tree.southWest !== null) {
      this.renderTreeOutline(tree.southWest, context, geoProjection, outlineColor);
    }
    if (tree.northWest !== null) {
      this.renderTreeOutline(tree.northWest, context, geoProjection, outlineColor);
    }
    if (tree.southEast !== null) {
      this.renderTreeOutline(tree.southEast, context, geoProjection, outlineColor);
    }
    if (tree.northEast !== null) {
      this.renderTreeOutline(tree.northEast, context, geoProjection, outlineColor);
    }
    const minDepth = 2;
    if (tree.depth >= minDepth) {
      const southWest = geoProjection.project(tree.geoFrame.southWest.normalized());
      const northWest = geoProjection.project(tree.geoFrame.northWest.normalized());
      const northEast = geoProjection.project(tree.geoFrame.northEast.normalized());
      const southEast = geoProjection.project(tree.geoFrame.southEast.normalized());
      context.beginPath();
      context.moveTo(southWest.x, southWest.y);
      context.lineTo(northWest.x, northWest.y);
      context.lineTo(northEast.x, northEast.y);
      context.lineTo(southEast.x, southEast.y);
      context.closePath();
      const u = (tree.depth - minDepth) / (tree.maxDepth - minDepth);
      context.lineWidth = 4 * (1 - u) + 0.5 * u;
      context.strokeStyle = outlineColor.toString();
      context.stroke();
    }
  }

  protected override displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                       displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                          viewContext: ViewContextType<this>) => void): void {
    this.displayTree(this.root, displayFlags, viewContext, displayChildView);
  }

  /** @hidden */
  protected displayTree(tree: GeoTree, displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                        displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                           viewContext: ViewContextType<this>) => void): void {
    if (tree.southWest !== null && tree.southWest.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.displayTree(tree.southWest, displayFlags, viewContext, displayChildView);
    }
    if (tree.northWest !== null && tree.northWest.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.displayTree(tree.northWest, displayFlags, viewContext, displayChildView);
    }
    if (tree.southEast !== null && tree.southEast.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.displayTree(tree.southEast, displayFlags, viewContext, displayChildView);
    }
    if (tree.northEast !== null && tree.northEast.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.displayTree(tree.northEast, displayFlags, viewContext, displayChildView);
    }
    const childViews = tree.views;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i]!;
      displayChildView.call(this, childView, displayFlags, viewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
  }

  override onSetChildViewGeoBounds(childView: GeoView, newChildViewGeoBounds: GeoBox, oldChildViewGeoBounds: GeoBox): void {
    const oldGeoBounds = this.root.geoBounds;
    Object.defineProperty(this, "root", {
      value: this.root.moved(childView, newChildViewGeoBounds, oldChildViewGeoBounds),
      enumerable: true,
      configurable: true,
    });
    const newGeoBounds = this.root.geoBounds;
    if (!newGeoBounds.equals(oldGeoBounds)) {
      this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
  }

  declare readonly geoBounds: GeoBox; // getter defined below to work around useDefineForClassFields lunacy

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const geoPoint = viewContext.geoViewport.unproject(x, y);
    return this.hitTestTree(this.root, x, y, geoPoint, viewContext);
  }

  protected hitTestTree(tree: GeoTree, x: number, y: number, geoPoint: GeoPoint,
                        viewContext: ViewContextType<this>): GraphicsView | null {
    let hit: GraphicsView | null = null;
    if (tree.southWest !== null && tree.southWest.geoFrame.contains(geoPoint)) {
      hit = this.hitTestTree(tree.southWest, x, y, geoPoint, viewContext);
    }
    if (hit === null && tree.northWest !== null && tree.northWest.geoFrame.contains(geoPoint)) {
      hit = this.hitTestTree(tree.northWest, x, y, geoPoint, viewContext);
    }
    if (hit === null && tree.southEast !== null && tree.southEast.geoFrame.contains(geoPoint)) {
      hit = this.hitTestTree(tree.southEast, x, y, geoPoint, viewContext);
    }
    if (hit === null && tree.northEast !== null && tree.northEast.geoFrame.contains(geoPoint)) {
      hit = this.hitTestTree(tree.northEast, x, y, geoPoint, viewContext);
    }
    if (hit === null) {
      const childViews = tree.views;
      for (let i = 0; i < childViews.length; i += 1) {
        const childView = childViews[i]!;
        if (childView.hitBounds.contains(x, y)) {
          hit = childView.cascadeHitTest(x, y, viewContext);
          if (hit !== null) {
            break;
          }
        }
      }
    }
    return hit;
  }

  static create(): GeoTreeView {
    return new GeoTreeView();
  }
}
Object.defineProperty(GeoTreeView.prototype, "geoBounds", {
  get(this: GeoTreeView): GeoBox {
    return this.root.geoBounds;
  },
  enumerable: true,
  configurable: true,
});
