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

import type {Mutable, Class, Dictionary, MutableDictionary} from "@swim/util";
import type {GeoPoint, GeoBox, GeoProjection} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, ViewFlags, AnyView, ViewFactory, View} from "@swim/view";
import {GraphicsView, PaintingContext, PaintingRenderer} from "@swim/graphics";
import {GeoViewInit, GeoView} from "../geo/GeoView";
import {GeoTree} from "./GeoTree";

export interface GeoTreeViewInit extends GeoViewInit {
  geoTreeColor?: AnyColor;
}

export class GeoTreeView extends GeoView {
  constructor(geoFrame?: GeoBox, depth?: number, maxDepth?: number, density?: number) {
    super();
    this.root = GeoTree.empty(geoFrame, depth, maxDepth, density);
    this.stem = null;
    this.childMap = null;
  }

  /** @internal */
  readonly root: GeoTree;

  /** @internal */
  updateRoot(newRoot: GeoTree): void {
    const oldRoot = this.root;
    const oldGeoBounds = oldRoot.geoBounds;
    const newGeoBounds = newRoot.geoBounds;
    (this as Mutable<this>).root = newRoot;
    (this as Mutable<this>).stem = null;
    if (!newGeoBounds.equals(oldGeoBounds)) {
      this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
  }

  /** @internal */
  readonly stem: GeoTree | null;

  /** @internal */
  getStem(geoBounds: GeoBox): GeoTree {
    let stem = this.stem;
    if (stem === null) {
      stem = this.root.getTree(geoBounds);
      (this as Mutable<this>).stem = stem;
    }
    return stem;
  }

  override get childCount(): number {
    return this.root.size;
  }

  override get children(): ReadonlyArray<View> {
    const children: View[] = [];
    this.root.forEach(function (child: GeoView): void {
      children.push(child);
    }, this);
    return children;
  }

  override firstChild(): View | null {
    const child = this.root.forEach(function (child: GeoView): GeoView {
      return child;
    }, this);
    return child !== void 0 ? child : null;
  }

  override lastChild(): View | null {
    const child = this.root.forEachReverse(function (child: GeoView): GeoView {
      return child;
    }, this);
    return child !== void 0 ? child : null;
  }

  override nextChild(target: View): View | null {
    if (target.parent === this) {
      let nextChild: GeoView | null = null;
      const child = this.root.forEachReverse(function (child: GeoView): GeoView | null | void {
        if (child === target) {
          return nextChild;
        }
        nextChild = child;
      }, this);
      if (child !== void 0) {
        return child;
      }
    }
    return null;
  }

  override previousChild(target: View): View | null {
    if (target.parent === this) {
      let previousChild: GeoView | null = null;
      const child = this.root.forEach(function (child: GeoView): GeoView | null | void {
        if (child === target) {
          return previousChild;
        }
        previousChild = child;
      }, this);
      if (child !== void 0) {
        return child;
      }
    }
    return null;
  }

  override forEachChild<T>(callback: (child: View) => T | void): T | undefined;
  override forEachChild<T, S>(callback: (this: S, child: View) => T | void, thisArg: S): T | undefined;
  override forEachChild<T, S>(callback: (this: S | undefined, child: View) => T | void, thisArg?: S): T | undefined {
    return this.root.forEach(callback, thisArg);
  }

  /** @internal */
  readonly childMap: Dictionary<GeoView> | null;

  /** @internal */
  protected insertChildMap(child: GeoView): void {
    const key = child.key;
    if (key !== void 0) {
      let childMap = this.childMap as MutableDictionary<GeoView>;
      if (childMap === null) {
        childMap = {};
        (this as Mutable<this>).childMap = childMap;
      }
      childMap[key] = child;
    }
  }

  /** @internal */
  protected removeChildMap(child: GeoView): void {
    const key = child.key;
    if (key !== void 0) {
      const childMap = this.childMap as MutableDictionary<GeoView>;
      if (childMap !== null) {
        delete childMap[key];
      }
    }
  }

  override getChild<V extends GeoView>(key: string, childBound: Class<V>): V | null;
  override getChild(key: string, childBound?: Class<GeoView>): GeoView | null;
  override getChild(key: string, childBound?: Class<GeoView>): GeoView | null {
    const childMap = this.childMap;
    if (childMap !== null) {
      const child = childMap[key];
      if (child !== void 0 && (childBound === void 0 || child instanceof childBound)) {
        return child;
      }
    }
    return null;
  }

  override setChild<V extends View>(key: string, newChild: V | ViewFactory<V> | null): View | null;
  override setChild(key: string, newChild: AnyView | null): View | null;
  override setChild(key: string, newChild: AnyView | null): View | null {
    if (newChild !== null) {
      newChild = View.fromAny(newChild);
      if (!(newChild instanceof GeoView)) {
        throw new TypeError("" + newChild);
      }
      newChild.remove();
    }

    const oldChild = this.getChild(key);
    if (oldChild !== null) {
      this.willRemoveChild(oldChild);
      oldChild.detachParent(this);
      this.removeChildMap(oldChild);
      this.updateRoot(this.root.removed(oldChild, oldChild.geoBounds));
      this.onRemoveChild(oldChild);
      this.didRemoveChild(oldChild);
      oldChild.setKey(void 0);
    }

    if (newChild !== null) {
      newChild.setKey(key);
      this.updateRoot(this.root.inserted(newChild, newChild.geoBounds));
      this.insertChildMap(newChild);
      newChild.attachParent(this);
      this.onInsertChild(newChild, null);
      this.didInsertChild(newChild, null);
      newChild.cascadeInsert();
    }

    return oldChild;
  }

  override appendChild<V extends View>(child: V | ViewFactory<V>, key?: string): V;
  override appendChild(child: AnyView, key?: string): View;
  override appendChild(child: AnyView, key?: string): View {
    child = View.fromAny(child);
    if (!(child instanceof GeoView)) {
      throw new TypeError("" + child);
    }

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    this.willInsertChild(child, null);
    this.updateRoot(this.root.inserted(child, child.geoBounds));
    this.insertChildMap(child);
    child.attachParent(this);
    this.onInsertChild(child, null);
    this.didInsertChild(child, null);
    child.cascadeInsert();

    return child;
  }

  override prependChild<V extends View>(child: V | ViewFactory<V>, key?: string): V;
  override prependChild(child: AnyView, key?: string): View;
  override prependChild(child: AnyView, key?: string): View {
    child = View.fromAny(child);
    if (!(child instanceof GeoView)) {
      throw new TypeError("" + child);
    }

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    this.willInsertChild(child, null);
    this.updateRoot(this.root.inserted(child, child.geoBounds));
    this.insertChildMap(child);
    child.attachParent(this);
    this.onInsertChild(child, null);
    this.didInsertChild(child, null);
    child.cascadeInsert();

    return child;
  }

  override insertChild<V extends View>(child: V | ViewFactory<V>, target: View | null, key?: string): V;
  override insertChild(child: AnyView, target: View | null, key?: string): View;
  override insertChild(child: AnyView, target: View | null, key?: string): View {
    if (target !== null && target.parent !== this) {
      throw new TypeError("" + target);
    }

    child = View.fromAny(child);
    if (!(child instanceof GeoView)) {
      throw new TypeError("" + child);
    }

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    this.willInsertChild(child, target);
    this.updateRoot(this.root.inserted(child, child.geoBounds));
    this.insertChildMap(child);
    child.attachParent(this);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();

    return child;
  }

  override replaceChild<V extends View>(newChild: View, oldChild: V): V;
  override replaceChild<V extends View>(newChild: AnyView, oldChild: V): V;
  override replaceChild(newChild: AnyView, oldChild: View): View {
    if (!(oldChild instanceof GeoView)) {
      throw new TypeError("" + oldChild);
    }
    if (oldChild.parent !== this) {
      throw new TypeError("" + oldChild);
    }
    newChild = View.fromAny(newChild);
    if (!(newChild instanceof GeoView)) {
      throw new TypeError("" + newChild);
    }
    if (newChild !== oldChild) {
      this.removeChild(oldChild);
      this.appendChild(newChild);
    }
    return oldChild;
  }

  override removeChild(key: string): View | null;
  override removeChild<V extends View>(child: V): V;
  override removeChild(key: string | View): View | null {
    let child: View | null;
    if (typeof key === "string") {
      child = this.getChild(key);
      if (child === null) {
        return null;
      }
    } else {
      child = key;
      if (child.parent !== this) {
        throw new Error("not a child view");
      }
    }
    if (!(child instanceof GeoView)) {
      throw new TypeError("" + child);
    }

    this.willRemoveChild(child);
    child.detachParent(this);
    this.removeChildMap(child);
    this.updateRoot(this.root.removed(child, child.geoBounds));
    this.onRemoveChild(child);
    this.didRemoveChild(child);
    child.setKey(void 0);

    return child;
  }

  override removeChildren(): void {
    this.root.forEach(function (child: GeoView): void {
      this.removeChild(child);
    }, this);
  }

  protected override willProject(viewContext: ViewContextType<this>): void {
    super.willProject(viewContext);
    (this as Mutable<this>).stem = null;
  }

  protected override processChildren(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     processChild: (this: this, child: View, processFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    const stem = this.getStem(viewContext.geoViewport.geoFrame);
    this.processTree(stem, processFlags, viewContext, processChild);
  }

  /** @internal */
  protected processTree(tree: GeoTree, processFlags: ViewFlags, viewContext: ViewContextType<this>,
                        processChild: (this: this, child: View, processFlags: ViewFlags,
                                       viewContext: ViewContextType<this>) => void): void {
    if (tree.southWest !== null && tree.southWest.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.processTree(tree.southWest, processFlags, viewContext, processChild);
    }
    if (tree.northWest !== null && tree.northWest.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.processTree(tree.northWest, processFlags, viewContext, processChild);
    }
    if (tree.southEast !== null && tree.southEast.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.processTree(tree.southEast, processFlags, viewContext, processChild);
    }
    if (tree.northEast !== null && tree.northEast.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.processTree(tree.northEast, processFlags, viewContext, processChild);
    }
    const children = tree.views;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i]!;
      processChild.call(this, child, processFlags, viewContext);
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
      }
    }
  }

  @ThemeAnimator({type: Color, state: null})
  readonly geoTreeColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const outlineColor = this.geoTreeColor.value;
    if (outlineColor !== null) {
      this.renderGeoTree(viewContext, outlineColor);
    }
  }

  protected renderGeoTree(viewContext: ViewContextType<this>, outlineColor: Color): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof PaintingRenderer && !this.isHidden() && !this.culled) {
      this.renderGeoTreeOutline(this.root, viewContext.geoViewport, renderer.context, outlineColor);
    }
  }

  protected renderGeoTreeOutline(tree: GeoTree, geoProjection: GeoProjection,
                                 context: PaintingContext, outlineColor: Color): void {
    if (tree.southWest !== null) {
      this.renderGeoTreeOutline(tree.southWest, geoProjection, context, outlineColor);
    }
    if (tree.northWest !== null) {
      this.renderGeoTreeOutline(tree.northWest, geoProjection, context, outlineColor);
    }
    if (tree.southEast !== null) {
      this.renderGeoTreeOutline(tree.southEast, geoProjection, context, outlineColor);
    }
    if (tree.northEast !== null) {
      this.renderGeoTreeOutline(tree.northEast, geoProjection, context, outlineColor);
    }
    const minDepth = 2;
    if (tree.depth >= minDepth) {
      const u = (tree.depth - minDepth) / (tree.maxDepth - minDepth);
      const outlineWidth = 4 * (1 - u) + 0.5 * u;
      this.renderGeoOutline(tree.geoFrame, geoProjection, context, outlineColor, outlineWidth);
    }
  }

  protected override displayChildren(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     displayChild: (this: this, child: View, displayFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    const stem = this.getStem(viewContext.geoViewport.geoFrame);
    this.displayTree(stem, displayFlags, viewContext, displayChild);
  }

  /** @internal */
  protected displayTree(tree: GeoTree, displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                        displayChild: (this: this, child: View, displayFlags: ViewFlags,
                                       viewContext: ViewContextType<this>) => void): void {
    if (tree.southWest !== null && tree.southWest.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.displayTree(tree.southWest, displayFlags, viewContext, displayChild);
    }
    if (tree.northWest !== null && tree.northWest.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.displayTree(tree.northWest, displayFlags, viewContext, displayChild);
    }
    if (tree.southEast !== null && tree.southEast.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.displayTree(tree.southEast, displayFlags, viewContext, displayChild);
    }
    if (tree.northEast !== null && tree.northEast.geoFrame.intersects(viewContext.geoViewport.geoFrame)) {
      this.displayTree(tree.northEast, displayFlags, viewContext, displayChild);
    }
    const children = tree.views;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i]!;
      displayChild.call(this, child, displayFlags, viewContext);
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
      }
    }
  }

  override onSetChildGeoBounds(child: GeoView, newChildViewGeoBounds: GeoBox, oldChildViewGeoBounds: GeoBox): void {
    this.updateRoot(this.root.moved(child, newChildViewGeoBounds, oldChildViewGeoBounds));
  }

  declare readonly geoBounds: GeoBox; // getter defined below to work around useDefineForClassFields lunacy

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const geoViewport = viewContext.geoViewport;
    const geoPoint = geoViewport.unproject(x, y);
    const stem = this.getStem(geoViewport.geoFrame);
    return this.hitTestTree(stem, x, y, geoPoint, viewContext);
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
      const children = tree.views;
      for (let i = 0; i < children.length; i += 1) {
        const child = children[i]!;
        hit = child.cascadeHitTest(x, y, viewContext);
        if (hit !== null) {
          break;
        }
      }
    }
    return hit;
  }

  override init(init: GeoTreeViewInit): void {
    super.init(init);
    if (init.geoTreeColor !== void 0) {
      this.geoTreeColor(init.geoTreeColor);
    }
  }
}
Object.defineProperty(GeoTreeView.prototype, "geoBounds", {
  get(this: GeoTreeView): GeoBox {
    return this.root.geoBounds;
  },
  configurable: true,
});
