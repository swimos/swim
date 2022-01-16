// Copyright 2015-2021 Swim.inc
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

import type {Mutable} from "@swim/util";
import type {GeoPoint, GeoBox, GeoProjection} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, ViewFlags, View} from "@swim/view";
import {GraphicsView, PaintingContext, PaintingRenderer} from "@swim/graphics";
import {GeoViewInit, GeoView} from "../geo/GeoView";
import {GeoTree} from "./GeoTree";

/** @public */
export interface GeoTreeViewInit extends GeoViewInit {
  geoTreeColor?: AnyColor;
}

/** @public */
export class GeoTreeView extends GeoView {
  constructor(geoFrame?: GeoBox, depth?: number, maxDepth?: number, density?: number) {
    super();
    this.root = GeoTree.empty(geoFrame, depth, maxDepth, density);
    this.stem = null;
  }

  /** @internal */
  readonly root: GeoTree;

  /** @internal */
  updateRoot(newRoot: GeoTree): void {
    (this as Mutable<this>).root = newRoot;
    (this as Mutable<this>).stem = null;
    this.setGeoBounds(newRoot.geoBounds);
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

  protected override onInsertChild(child: View, target: View | null): void {
    super.onInsertChild(child, target);
    if (child instanceof GeoView) {
      this.updateRoot(this.root.inserted(child, child.geoBounds));
    }
  }

  protected override onRemoveChild(child: View): void {
    super.onRemoveChild(child);
    if (child instanceof GeoView) {
      this.updateRoot(this.root.removed(child, child.geoBounds));
    }
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

  @ThemeAnimator({type: Color, value: null})
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
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled) {
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

  protected override updateGeoBounds(): void {
    // nop
  }

  protected override onSetChildGeoBounds(child: GeoView, newChildViewGeoBounds: GeoBox, oldChildViewGeoBounds: GeoBox): void {
    this.updateRoot(this.root.moved(child, newChildViewGeoBounds, oldChildViewGeoBounds));
  }

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