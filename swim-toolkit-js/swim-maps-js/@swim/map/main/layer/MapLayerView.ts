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

import type {BoxR2} from "@swim/math";
import {GeoBox} from "@swim/geo";
import {ViewContextType, ViewFlags, View} from "@swim/view";
import {GraphicsView} from "@swim/graphics";
import {MapGraphicsView} from "../graphics/MapGraphicsView";

export class MapLayerView extends MapGraphicsView {
  constructor() {
    super();
    Object.defineProperty(this, "childViews", {
      value: [],
      enumerable: true,
    });
    Object.defineProperty(this, "childViewMap", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "geoBounds", {
      value: GeoBox.undefined(),
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly childViews: ReadonlyArray<View>;

  get childViewCount(): number {
    return this.childViews.length;
  }

  firstChildView(): View | null {
    const childViews = this.childViews;
    return childViews.length !== 0 ? childViews[0]! : null;
  }

  lastChildView(): View | null {
    const childViews = this.childViews;
    return childViews.length !== 0 ? childViews[childViews.length - 1]! : null;
  }

  nextChildView(targetView: View): View | null {
    const childViews = this.childViews;
    const targetIndex = childViews.indexOf(targetView);
    return targetIndex >= 0 && targetIndex + 1 < childViews.length ? childViews[targetIndex + 1]! : null;
  }

  previousChildView(targetView: View): View | null {
    const childViews = this.childViews;
    const targetIndex = childViews.indexOf(targetView);
    return targetIndex - 1 >= 0 ? childViews[targetIndex - 1]! : null;
  }

  forEachChildView<T>(callback: (childView: View) => T | void): T | undefined;
  forEachChildView<T, S>(callback: (this: S, childView: View) => T | void,
                         thisArg: S): T | undefined;
  forEachChildView<T, S>(callback: (this: S | undefined, childView: View) => T | void,
                         thisArg?: S): T | undefined {
    let result: T | undefined;
    const childViews = this.childViews;
    let i = 0;
    while (i < childViews.length) {
      const childView = childViews[i]!;
      result = callback.call(thisArg, childView) as T | undefined;
      if (result !== void 0) {
        break;
      }
      if (childViews[i] === childView) {
        i += 1;
      }
    }
    return result;
  }

  /** @hidden */
  declare readonly childViewMap: {[key: string]: View | undefined} | null;

  getChildView(key: string): View | null {
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
    let targetView: View | null = null;
    const childViews = this.childViews as View[];
    if (newChildView !== null) {
      if (!(newChildView instanceof GraphicsView)) {
        throw new TypeError("" + newChildView);
      }
      if (newChildView.parentView === this) {
        targetView = childViews[childViews.indexOf(newChildView) + 1] || null;
      }
      newChildView.remove();
    }
    let index = -1;
    const oldChildView = this.getChildView(key);
    if (oldChildView !== null) {
      index = childViews.indexOf(oldChildView);
      // assert(index >= 0);
      targetView = childViews[index + 1] || null;
      this.willRemoveChildView(oldChildView);
      oldChildView.setParentView(null, this);
      this.removeChildViewMap(oldChildView);
      childViews.splice(index, 1);
      this.onRemoveChildView(oldChildView);
      this.didRemoveChildView(oldChildView);
      oldChildView.setKey(void 0);
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
      newChildView.cascadeInsert();
    }
    return oldChildView;
  }

  /** @hidden */
  protected insertChildViewMap(childView: View): void {
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
  protected removeChildViewMap(childView: View): void {
    const key = childView.key;
    if (key !== void 0) {
      const childViewMap = this.childViewMap;
      if (childViewMap !== null) {
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
    (this.childViews as View[]).push(childView);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
    childView.cascadeInsert();
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
    const childViews = this.childViews as View[];
    const targetView = childViews.length !== 0 ? childViews[0]! : null;
    this.willInsertChildView(childView, targetView);
    childViews.unshift(childView);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildView(childView, targetView);
    childView.cascadeInsert();
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
    const childViews = this.childViews as View[];
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
    childView.cascadeInsert();
  }

  protected didInsertChildView(childView: View, targetView: View | null): void {
    if (childView instanceof MapGraphicsView) {
      this.childViewDidInsertGeoBounds(childView, childView.geoBounds);
    }
    super.didInsertChildView(childView, targetView);
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
    const childViews = this.childViews as View[];
    const index = childViews.indexOf(childView);
    if (index >= 0) {
      childViews.splice(index, 1);
    }
    this.onRemoveChildView(childView);
    this.didRemoveChildView(childView);
    childView.setKey(void 0);
    if (typeof key === "string") {
      return childView;
    }
  }

  protected didRemoveChildView(childView: View): void {
    if (childView instanceof MapGraphicsView) {
      this.childViewDidRemoveGeoBounds(childView, childView.geoBounds);
    }
    super.didRemoveChildView(childView);
  }

  removeAll(): void {
    const childViews = this.childViews as View[];
    do {
      const count = childViews.length;
      if (count > 0) {
        const childView = childViews[count - 1]!;
        this.willRemoveChildView(childView);
        childView.setParentView(null, this);
        this.removeChildViewMap(childView);
        childViews.pop();
        this.onRemoveChildView(childView);
        this.didRemoveChildView(childView);
        childView.setKey(void 0);
        continue;
      }
      break;
    } while (true);
  }

  /** @hidden */
  doMountChildViews(): void {
    const childViews = this.childViews;
    let i = 0;
    while (i < childViews.length) {
      const childView = childViews[i]!;
      childView.cascadeMount();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  doUnmountChildViews(): void {
    const childViews = this.childViews;
    let i = 0;
    while (i < childViews.length) {
      const childView = childViews[i]!;
      childView.cascadeUnmount();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  doPowerChildViews(): void {
    const childViews = this.childViews;
    let i = 0;
    while (i < childViews.length) {
      const childView = childViews[i]!;
      childView.cascadePower();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  doUnpowerChildViews(): void {
    const childViews = this.childViews;
    let i = 0;
    while (i < childViews.length) {
      const childView = childViews[i]!;
      childView.cascadeUnpower();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  protected processChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                              processChildView: (this: this, childView: View, processFlags: ViewFlags,
                                                 viewContext: ViewContextType<this>) => void): void {
    const childViews = this.childViews;
    let i = 0;
    while (i < childViews.length) {
      const childView = childViews[i]!;
      processChildView.call(this, childView, processFlags, viewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  protected displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                              displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                 viewContext: ViewContextType<this>) => void): void {
    const childViews = this.childViews;
    let i = 0;
    while (i < childViews.length) {
      const childView = childViews[i]!;
      displayChildView.call(this, childView, displayFlags, viewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  // @ts-ignore
  declare readonly geoBounds: GeoBox;

  protected doUpdateGeoBounds(): void {
    const oldGeoBounds = this.geoBounds;
    const newGeoBounds = this.deriveGeoBounds();
    if (!oldGeoBounds.equals(newGeoBounds)) {
      Object.defineProperty(this, "geoBounds", {
        value: newGeoBounds,
        enumerable: true,
        configurable: true,
      });
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
  }

  protected childViewDidInsertGeoBounds(childView: MapGraphicsView, newGeoBounds: GeoBox): void {
    this.doUpdateGeoBounds();
  }

  protected childViewDidRemoveGeoBounds(childView: MapGraphicsView, oldGeoBounds: GeoBox): void {
    this.doUpdateGeoBounds();
  }

  childViewDidSetGeoBounds(childView: MapGraphicsView, newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    this.doUpdateGeoBounds();
  }

  childViewDidSetHidden(childView: MapGraphicsView, hidden: boolean): void {
    this.doUpdateGeoBounds();
  }

  deriveGeoBounds(): GeoBox {
    let geoBounds: GeoBox | null = this.ownGeoBounds;
    const childViews = this.childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i]!;
      if (childView instanceof MapGraphicsView && !childView.isHidden()) {
        const childGeoBounds = childView.geoBounds;
        if (childGeoBounds.isDefined()) {
          if (geoBounds !== null) {
            geoBounds = geoBounds.union(childGeoBounds);
          } else {
            geoBounds = childGeoBounds;
          }
        }
      }
    }
    if (geoBounds === null) {
      geoBounds = this.geoFrame;
    }
    return geoBounds;
  }

  deriveViewBounds(): BoxR2 {
    let viewBounds: BoxR2 | null = this.ownViewBounds;
    const childViews = this.childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i]!;
      if (childView instanceof GraphicsView && !childView.isHidden()) {
        const childViewBounds = childView.viewBounds;
        if (childViewBounds.isDefined()) {
          if (viewBounds !== null) {
            viewBounds = viewBounds.union(childViewBounds);
          } else {
            viewBounds = childViewBounds;
          }
        }
      }
    }
    if (viewBounds === null) {
      viewBounds = this.viewFrame;
    }
    return viewBounds;
  }

  deriveHitBounds(): BoxR2 {
    let hitBounds: BoxR2 | undefined;
    const childViews = this.childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i]!;
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

  protected doHitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    let hit: GraphicsView | null = null;
    const childViews = this.childViews;
    for (let i = childViews.length - 1; i >= 0; i -= 1) {
      const childView = childViews[i]!;
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
