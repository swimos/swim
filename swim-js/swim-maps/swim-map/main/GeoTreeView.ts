// Copyright 2015-2023 Nstream, inc.
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
import type {GeoPoint} from "@swim/geo";
import type {GeoBox} from "@swim/geo";
import type {GeoProjection} from "@swim/geo";
import {Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import type {PaintingContext} from "@swim/graphics";
import {PaintingRenderer} from "@swim/graphics";
import {GeoView} from "./GeoView";
import {GeoTree} from "./GeoTree";

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

  protected override willProject(): void {
    super.willProject();
    (this as Mutable<this>).stem = null;
  }

  protected override processChildren(processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    const geoViewport = this.geoViewport.value;
    if (geoViewport === null) {
      return;
    }
    const geoFrame = geoViewport.geoFrame;
    const stem = this.getStem(geoFrame);
    this.processTree(stem, geoFrame, processFlags, processChild);
  }

  /** @internal */
  protected processTree(tree: GeoTree, geoFrame: GeoBox, processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    if (tree.southWest !== null && tree.southWest.geoFrame.intersects(geoFrame)) {
      this.processTree(tree.southWest, geoFrame, processFlags, processChild);
    }
    if (tree.northWest !== null && tree.northWest.geoFrame.intersects(geoFrame)) {
      this.processTree(tree.northWest, geoFrame, processFlags, processChild);
    }
    if (tree.southEast !== null && tree.southEast.geoFrame.intersects(geoFrame)) {
      this.processTree(tree.southEast, geoFrame, processFlags, processChild);
    }
    if (tree.northEast !== null && tree.northEast.geoFrame.intersects(geoFrame)) {
      this.processTree(tree.northEast, geoFrame, processFlags, processChild);
    }
    const children = tree.views;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i]!;
      processChild.call(this, child, processFlags);
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
      }
    }
  }

  @ThemeAnimator({valueType: Color, value: null})
  get geoTreeColor(): ThemeAnimator<this, Color | null> {
    return ThemeAnimator.getter();
  }

  protected override onRender(): void {
    super.onRender();
    const outlineColor = ThemeAnimator.tryValue(this, "geoTreeColor");
    if (outlineColor !== null) {
      this.renderGeoTree(outlineColor);
    }
  }

  protected renderGeoTree(outlineColor: Color): void {
    const geoViewport = this.geoViewport.value;
    if (geoViewport === null) {
      return;
    }
    const renderer = this.renderer.value;
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled) {
      this.renderGeoTreeOutline(this.root, geoViewport, renderer.context, outlineColor);
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
      this.renderGeoOutline(tree.geoFrame, context, outlineColor, outlineWidth);
    }
  }

  protected override displayChildren(displayFlags: ViewFlags, displayChild: (this: this, child: View, displayFlags: ViewFlags) => void): void {
    const geoViewport = this.geoViewport.value;
    if (geoViewport === null) {
      return;
    }
    const geoFrame = geoViewport.geoFrame;
    const stem = this.getStem(geoFrame);
    this.displayTree(stem, geoFrame, displayFlags, displayChild);
  }

  /** @internal */
  protected displayTree(tree: GeoTree, geoFrame: GeoBox, displayFlags: ViewFlags, displayChild: (this: this, child: View, displayFlags: ViewFlags) => void): void {
    if (tree.southWest !== null && tree.southWest.geoFrame.intersects(geoFrame)) {
      this.displayTree(tree.southWest, geoFrame, displayFlags, displayChild);
    }
    if (tree.northWest !== null && tree.northWest.geoFrame.intersects(geoFrame)) {
      this.displayTree(tree.northWest, geoFrame, displayFlags, displayChild);
    }
    if (tree.southEast !== null && tree.southEast.geoFrame.intersects(geoFrame)) {
      this.displayTree(tree.southEast, geoFrame, displayFlags, displayChild);
    }
    if (tree.northEast !== null && tree.northEast.geoFrame.intersects(geoFrame)) {
      this.displayTree(tree.northEast, geoFrame, displayFlags, displayChild);
    }
    const children = tree.views;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i]!;
      displayChild.call(this, child, displayFlags);
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

  protected override hitTest(x: number, y: number): GraphicsView | null {
    const geoViewport = this.geoViewport.value;
    if (geoViewport === null) {
      return null;
    }
    const geoPoint = geoViewport.unproject(x, y);
    const stem = this.getStem(geoViewport.geoFrame);
    return this.hitTestTree(stem, x, y, geoPoint);
  }

  protected hitTestTree(tree: GeoTree, x: number, y: number, geoPoint: GeoPoint): GraphicsView | null {
    let hit: GraphicsView | null = null;
    if (tree.southWest !== null && tree.southWest.geoFrame.contains(geoPoint)) {
      hit = this.hitTestTree(tree.southWest, x, y, geoPoint);
    }
    if (hit === null && tree.northWest !== null && tree.northWest.geoFrame.contains(geoPoint)) {
      hit = this.hitTestTree(tree.northWest, x, y, geoPoint);
    }
    if (hit === null && tree.southEast !== null && tree.southEast.geoFrame.contains(geoPoint)) {
      hit = this.hitTestTree(tree.southEast, x, y, geoPoint);
    }
    if (hit === null && tree.northEast !== null && tree.northEast.geoFrame.contains(geoPoint)) {
      hit = this.hitTestTree(tree.northEast, x, y, geoPoint);
    }
    if (hit === null) {
      const children = tree.views;
      for (let i = 0; i < children.length; i += 1) {
        const child = children[i]!;
        hit = child.cascadeHitTest(x, y);
        if (hit !== null) {
          break;
        }
      }
    }
    return hit;
  }
}
