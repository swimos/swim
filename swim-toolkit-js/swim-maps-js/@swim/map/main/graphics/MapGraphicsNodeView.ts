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
import {ViewFlags, View, GraphicsView} from "@swim/view";
import {GeoBox} from "../geo/GeoBox";
import {MapGraphicsViewContext} from "./MapGraphicsViewContext";
import {MapGraphicsView} from "./MapGraphicsView";
import {MapGraphicsViewController} from "./MapGraphicsViewController";

export class MapGraphicsNodeView extends MapGraphicsView {
  /** @hidden */
  readonly _childViews: View[];
  /** @hidden */
  _childViewMap?: {[key: string]: View | undefined};

  constructor() {
    super();
    this._childViews = [];
  }

  get viewController(): MapGraphicsViewController<MapGraphicsNodeView> | null {
    return this._viewController;
  }

  get childViewCount(): number {
    return this._childViews.length;
  }

  get childViews(): ReadonlyArray<View> {
    return this._childViews;
  }

  forEachChildView<T, S = unknown>(callback: (this: S, childView: View) => T | void,
                                   thisArg?: S): T | undefined {
    const childViews = this._childViews;
    if (childViews.length !== 0) {
      let i = 0;
      do {
        const childView = childViews[i];
        const result = callback.call(thisArg, childView);
        if (result !== void 0) {
          return result;
        }
        if (i < childViews.length) {
          if (childViews[i] === childView) {
            i += 1;
          }
          continue;
        }
        break;
      } while (true);
    }
    return void 0;
  }

  getChildView(key: string): View | null {
    const childViewMap = this._childViewMap;
    if (childViewMap !== void 0) {
      const childView = childViewMap[key];
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  setChildView(key: string, newChildView: View | null): View | null {
    if (newChildView !== null) {
      if (!(newChildView instanceof GraphicsView)) {
        throw new TypeError("" + newChildView);
      }
      newChildView.remove();
    }
    let index = -1;
    let oldChildView: View | null = null;
    let targetView: View | null = null;
    const childViews = this._childViews;
    const childViewMap = this._childViewMap;
    if (childViewMap !== void 0) {
      const childView = childViewMap[key];
      if (childView !== void 0) {
        index = childViews.indexOf(childView);
        // assert(index >= 0);
        oldChildView = childView;
        targetView = childViews[index + 1] || null;
        this.willRemoveChildView(childView);
        childView.setParentView(null, this);
        this.removeChildViewMap(childView);
        childViews.splice(index, 1);
        this.onRemoveChildView(childView);
        this.didRemoveChildView(childView);
        childView.setKey(null);
      }
    }
    if (newChildView !== null) {
      newChildView.setKey(key);
      this.willInsertChildView(newChildView, targetView);
      if (index >= 0) {
        childViews.splice(index, 0, newChildView);
      } else {
        childViews.push(newChildView);
      }
      this.insertChildViewMap(newChildView);
      newChildView.setParentView(this, null);
      this.onInsertChildView(newChildView, targetView);
      this.didInsertChildView(newChildView, targetView);
    }
    return oldChildView;
  }

  /** @hidden */
  protected insertChildViewMap(childView: View): void {
    const key = childView.key;
    if (key !== null) {
      let childViewMap = this._childViewMap;
      if (childViewMap === void 0) {
        childViewMap = {};
        this._childViewMap = childViewMap;
      }
      childViewMap[key] = childView;
    }
  }

  /** @hidden */
  protected removeChildViewMap(childView: View): void {
    const childViewMap = this._childViewMap;
    if (childViewMap !== void 0) {
      const key = childView.key;
      if (key !== null) {
        delete childViewMap[key];
      }
    }
  }

  appendChildView(childView: View, key?: string): void {
    if (!(childView instanceof GraphicsView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    this.willInsertChildView(childView, null);
    this._childViews.push(childView);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
  }

  prependChildView(childView: View, key?: string): void {
    if (!(childView instanceof GraphicsView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    this.willInsertChildView(childView, null);
    this._childViews.unshift(childView);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
  }

  insertChildView(childView: View, targetView: View | null, key?: string): void {
    if (!(childView instanceof GraphicsView)) {
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
    this.willInsertChildView(childView, targetView);
    const childViews = this._childViews;
    const index = targetView !== null ? childViews.indexOf(targetView) : -1;
    if (index >= 0) {
      childViews.splice(index, 0, childView);
    } else {
      childViews.push(childView);
    }
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildView(childView, targetView);
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
    if (!(childView instanceof GraphicsView)) {
      throw new TypeError("" + childView);
    }
    if (childView.parentView !== this) {
      throw new Error("not a child view");
    }
    this.willRemoveChildView(childView);
    childView.setParentView(null, this);
    this.removeChildViewMap(childView);
    const childViews = this._childViews;
    const index = childViews.indexOf(childView);
    if (index >= 0) {
      childViews.splice(index, 1);
    }
    this.onRemoveChildView(childView);
    this.didRemoveChildView(childView);
    childView.setKey(null);
    if (typeof key === "string") {
      return childView;
    }
  }

  removeAll(): void {
    const childViews = this._childViews;
    do {
      const count = childViews.length;
      if (count > 0) {
        const childView = childViews[count - 1];
        this.willRemoveChildView(childView);
        childView.setParentView(null, this);
        this.removeChildViewMap(childView);
        childViews.pop();
        this.onRemoveChildView(childView);
        this.didRemoveChildView(childView);
        childView.setKey(null);
        continue;
      }
      break;
    } while (true);
  }

  /** @hidden */
  doMountChildViews(): void {
    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      childView.cascadeMount();
    }
  }

  /** @hidden */
  doUnmountChildViews(): void {
    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      childView.cascadeUnmount();
    }
  }

  /** @hidden */
  doPowerChildViews(): void {
    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      childView.cascadePower();
    }
  }

  /** @hidden */
  doUnpowerChildViews(): void {
    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      childView.cascadeUnpower();
    }
  }

  /** @hidden */
  protected doProcessChildViews(processFlags: ViewFlags, viewContext: MapGraphicsViewContext): void {
    const childViews = this._childViews;
    if ((processFlags & View.ProcessMask) !== 0 && childViews.length !== 0) {
      this.willProcessChildViews(viewContext);
      let i = 0;
      while (i < childViews.length) {
        const childView = childViews[i];
        const childViewContext = this.childViewContext(childView, viewContext);
        this.doProcessChildView(childView, processFlags, childViewContext);
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
        i += 1;
      }
      this.didProcessChildViews(viewContext);
    }
  }

  /** @hidden */
  protected doDisplayChildViews(displayFlags: ViewFlags, viewContext: MapGraphicsViewContext): void {
    const childViews = this._childViews;
    if ((displayFlags & View.DisplayMask) !== 0 && childViews.length !== 0
        && !this.isHidden() && !this.isCulled()) {
      this.willDisplayChildViews(viewContext);
      let i = 0;
      while (i < childViews.length) {
        const childView = childViews[i];
        const childViewContext = this.childViewContext(childView, viewContext);
        this.doDisplayChildView(childView, displayFlags, childViewContext);
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
        i += 1;
      }
      this.didDisplayChildViews(viewContext);
    }
  }

  deriveGeoBounds(): GeoBox {
    let geoBounds: GeoBox | undefined;
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof MapGraphicsView && !childView.isHidden()) {
        const childGeoBounds = childView.geoBounds;
        if (childGeoBounds.isDefined()) {
          if (geoBounds !== void 0) {
            geoBounds = geoBounds.union(childGeoBounds);
          } else {
            geoBounds = childGeoBounds;
          }
        }
      }
    }
    if (geoBounds === void 0) {
      geoBounds = this.geoFrame;
    }
    return geoBounds;
  }

  deriveViewBounds(): BoxR2 {
    let viewBounds: BoxR2 | undefined;
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof GraphicsView && !childView.isHidden()) {
        const childViewBounds = childView.viewBounds;
        if (childViewBounds.isDefined()) {
          if (viewBounds !== void 0) {
            viewBounds = viewBounds.union(childViewBounds);
          } else {
            viewBounds = childViewBounds;
          }
        }
      }
    }
    if (viewBounds === void 0) {
      viewBounds = this.viewFrame;
    }
    return viewBounds;
  }

  deriveHitBounds(): BoxR2 {
    let hitBounds: BoxR2 | undefined;
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof GraphicsView && !childView.isHidden()) {
        const childHitBounds = childView.hitBounds;
        if (hitBounds === void 0) {
          hitBounds = childHitBounds;
        } else {
          hitBounds = hitBounds.union(childHitBounds);
        }
      }
    }
    if (hitBounds === void 0) {
      hitBounds = this.viewBounds;
    }
    return hitBounds;
  }

  hitTest(x: number, y: number, viewContext: MapGraphicsViewContext): GraphicsView | null {
    let hit: GraphicsView | null = null;
    const childViews = this._childViews;
    for (let i = childViews.length - 1; i >= 0; i -= 1) {
      const childView = childViews[i];
      if (childView instanceof GraphicsView && !childView.isHidden() && !childView.isCulled()) {
        const hitBounds = childView.hitBounds;
        if (hitBounds.contains(x, y)) {
          hit = childView.hitTest(x, y, viewContext);
          if (hit !== null) {
            break;
          }
        }
      }
    }
    return hit;
  }
}
