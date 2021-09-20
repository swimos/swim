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

import type {R2Box} from "@swim/math";
import {ViewContextType, ViewFlags, View} from "@swim/view";
import {GraphicsView} from "../graphics/GraphicsView";

export class LayerView extends GraphicsView {
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
  }

  override readonly childViews!: ReadonlyArray<View>;

  override get childViewCount(): number {
    return this.childViews.length;
  }

  override firstChildView(): View | null {
    const childViews = this.childViews;
    return childViews.length !== 0 ? childViews[0]! : null;
  }

  override lastChildView(): View | null {
    const childViews = this.childViews;
    return childViews.length !== 0 ? childViews[childViews.length - 1]! : null;
  }

  override nextChildView(targetView: View): View | null {
    const childViews = this.childViews;
    const targetIndex = childViews.indexOf(targetView);
    return targetIndex >= 0 && targetIndex + 1 < childViews.length ? childViews[targetIndex + 1]! : null;
  }

  override previousChildView(targetView: View): View | null {
    const childViews = this.childViews;
    const targetIndex = childViews.indexOf(targetView);
    return targetIndex - 1 >= 0 ? childViews[targetIndex - 1]! : null;
  }

  override forEachChildView<T>(callback: (childView: View) => T | void): T | undefined;
  override forEachChildView<T, S>(callback: (this: S, childView: View) => T | void,
                                  thisArg: S): T | undefined;
  override forEachChildView<T, S>(callback: (this: S | undefined, childView: View) => T | void,
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
  readonly childViewMap!: {[key: string]: View | undefined} | null;

  override getChildView(key: string): View | null {
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

  override appendChildView(childView: View, key?: string): void {
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

  override prependChildView(childView: View, key?: string): void {
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

  override insertChildView(childView: View, targetView: View | null, key?: string): void {
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

  override removeAll(): void {
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
  protected override mountChildViews(): void {
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
  protected override unmountChildViews(): void {
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
  protected override powerChildViews(): void {
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
  protected override unpowerChildViews(): void {
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

  protected override processChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
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

  protected override displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
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

  override deriveViewBounds(): R2Box {
    let viewBounds: R2Box | undefined;
    const childViews = this.childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i]!;
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

  override deriveHitBounds(): R2Box {
    let hitBounds: R2Box | undefined;
    const childViews = this.childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i]!;
      if (childView instanceof GraphicsView && !childView.isHidden() && !childView.isIntangible()) {
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

  protected override hitTestChildViews(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const childViews = this.childViews;
    for (let i = childViews.length - 1; i >= 0; i -= 1) {
      const childView = childViews[i]!;
      if (childView instanceof GraphicsView) {
        const hit = childView.cascadeHitTest(x, y, viewContext);
        if (hit !== null) {
          return hit;
        }
      }
    }
    return null;
  }

  static create(): LayerView {
    return new LayerView();
  }
}
