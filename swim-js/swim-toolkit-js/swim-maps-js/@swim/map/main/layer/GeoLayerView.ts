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
import type {R2Box} from "@swim/math";
import {GeoBox} from "@swim/geo";
import {ViewContextType, ViewFlags, AnyView, View} from "@swim/view";
import {GraphicsView} from "@swim/graphics";
import {GeoView} from "../geo/GeoView";

export class GeoLayerView extends GeoView {
  constructor() {
    super();
    this.children = [];
    this.childMap = null;
    Object.defineProperty(this, "geoBounds", {
      value: GeoBox.undefined(),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly children: ReadonlyArray<View>;

  override get childCount(): number {
    return this.children.length;
  }

  override firstChild(): View | null {
    const children = this.children;
    if (children.length !== 0) {
      return children[0]!;
    }
    return null;
  }

  override lastChild(): View | null {
    const children = this.children;
    const childCount = children.length;
    if (childCount !== 0) {
      return children[childCount - 1]!;
    }
    return null;
  }

  override nextChild(target: View): View | null {
    const children = this.children;
    const targetIndex = children.indexOf(target);
    if (targetIndex >= 0 && targetIndex + 1 < children.length) {
      return children[targetIndex + 1]!;
    }
    return null;
  }

  override previousChild(target: View): View | null {
    const children = this.children;
    const targetIndex = children.indexOf(target);
    if (targetIndex - 1 >= 0) {
      return children[targetIndex - 1]!;
    }
    return null;
  }

  override forEachChild<T>(callback: (child: View) => T | void): T | undefined;
  override forEachChild<T, S>(callback: (this: S, child: View) => T | void, thisArg: S): T | undefined;
  override forEachChild<T, S>(callback: (this: S | undefined, child: View) => T | void, thisArg?: S): T | undefined {
    let result: T | undefined;
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      result = callback.call(thisArg, child) as T | undefined;
      if (result !== void 0) {
        break;
      }
      if (children[i] === child) {
        i += 1;
      }
    }
    return result;
  }

  /** @internal */
  readonly childMap: Dictionary<View> | null;

  /** @internal */
  protected insertChildMap(child: View): void {
    const key = child.key;
    if (key !== void 0) {
      let childMap = this.childMap as MutableDictionary<View>;
      if (childMap === null) {
        childMap = {};
        (this as Mutable<this>).childMap = childMap;
      }
      childMap[key] = child;
    }
  }

  /** @internal */
  protected removeChildMap(child: View): void {
    const key = child.key;
    if (key !== void 0) {
      const childMap = this.childMap as MutableDictionary<View>;
      if (childMap !== null) {
        delete childMap[key];
      }
    }
  }

  override getChild<V extends View>(key: string, childBound: Class<V>): V | null;
  override getChild(key: string, childBound?: Class<View>): View | null;
  override getChild(key: string, childBound?: Class<View>): View | null {
    const childMap = this.childMap;
    if (childMap !== null) {
      const child = childMap[key];
      if (child !== void 0 && (childBound === void 0 || child instanceof childBound)) {
        return child;
      }
    }
    return null;
  }

  override setChild<V extends View>(key: string, newChild: AnyView<V> | null): View | null;
  override setChild(key: string, newChild: AnyView | null): View | null;
  override setChild(key: string, newChild: AnyView | null): View | null {
    if (newChild !== null) {
      newChild = View.fromAny(newChild);
    }

    let target: View | null = null;
    const children = this.children as View[];
    if (newChild !== null) {
      if (newChild.parent === this) {
        target = children[children.indexOf(newChild) + 1] || null;
      }
      newChild.remove();
    }

    let index = -1;
    const oldChild = this.getChild(key);
    if (oldChild !== null) {
      index = children.indexOf(oldChild);
      // assert(index >= 0);
      target = children[index + 1] || null;
      this.willRemoveChild(oldChild);
      oldChild.setParent(null, this);
      this.removeChildMap(oldChild);
      children.splice(index, 1);
      this.onRemoveChild(oldChild);
      this.didRemoveChild(oldChild);
      oldChild.setKey(void 0);
    }

    if (newChild !== null) {
      newChild.setKey(key);
      this.willInsertChild(newChild, target);
      if (index >= 0) {
        children.splice(index, 0, newChild);
      } else {
        children.push(newChild);
      }
      this.insertChildMap(newChild);
      newChild.setParent(this, null);
      this.onInsertChild(newChild, target);
      this.didInsertChild(newChild, target);
      newChild.cascadeInsert();
    }

    return oldChild;
  }

  override appendChild<V extends View>(child: AnyView<V>, key?: string): V;
  override appendChild(child: AnyView, key?: string): View;
  override appendChild(child: AnyView, key?: string): View {
    child = View.fromAny(child);

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    this.willInsertChild(child, null);
    (this.children as View[]).push(child);
    this.insertChildMap(child);
    child.setParent(this, null);
    this.onInsertChild(child, null);
    this.didInsertChild(child, null);
    child.cascadeInsert();

    return child;
  }

  override prependChild<V extends View>(child: AnyView<V>, key?: string): V;
  override prependChild(child: AnyView, key?: string): View;
  override prependChild(child: AnyView, key?: string): View {
    child = View.fromAny(child);

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    const children = this.children as View[];
    const target = children.length !== 0 ? children[0]! : null;
    this.willInsertChild(child, target);
    children.unshift(child);
    this.insertChildMap(child);
    child.setParent(this, null);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();

    return child;
  }

  override insertChild<V extends View>(child: AnyView<V>, target: View | null, key?: string): V;
  override insertChild(child: AnyView, target: View | null, key?: string): View;
  override insertChild(child: AnyView, target: View | null, key?: string): View {
    if (target !== null && target.parent !== this) {
      throw new TypeError("" + target);
    }

    child = View.fromAny(child);

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
      child.setKey(key);
    }

    this.willInsertChild(child, target);
    const children = this.children as View[];
    const index = target !== null ? children.indexOf(target) : -1;
    if (index >= 0) {
      children.splice(index, 0, child);
    } else {
      children.push(child);
    }
    this.insertChildMap(child);
    child.setParent(this, null);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();

    return child;
  }

  protected override didInsertChild(child: View, target: View | null): void {
    if (child instanceof GeoView) {
      this.onInsertChildGeoBounds(child, child.geoBounds);
    }
    super.didInsertChild(child, target);
  }

  override removeChild(key: string): View | null;
  override removeChild(child: View): void;
  override removeChild(key: string | View): View | null | void {
    let child: View | null;
    if (typeof key === "string") {
      child = this.getChild(key);
      if (child === null) {
        return null;
      }
    } else {
      child = key;
    }
    if (child.parent !== this) {
      throw new Error("not a child view");
    }

    this.willRemoveChild(child);
    child.setParent(null, this);
    this.removeChildMap(child);
    const children = this.children as View[];
    const index = children.indexOf(child);
    if (index >= 0) {
      children.splice(index, 1);
    }
    this.onRemoveChild(child);
    this.didRemoveChild(child);
    child.setKey(void 0);

    if (typeof key === "string") {
      return child;
    }
  }

  protected override didRemoveChild(child: View): void {
    if (child instanceof GeoView) {
      this.onRemoveChildGeoBounds(child, child.geoBounds);
    }
    super.didRemoveChild(child);
  }

  override removeChildren(): void {
    const children = this.children as View[];
    let childCount: number;
    while (childCount = children.length, childCount !== 0) {
      const child = children[childCount - 1]!;
      this.willRemoveChild(child);
      child.setParent(null, this);
      this.removeChildMap(child);
      children.pop();
      this.onRemoveChild(child);
      this.didRemoveChild(child);
      child.setKey(void 0);
    }
  }

  /** @internal */
  protected override mountChildren(): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      child.cascadeMount();
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  /** @internal */
  protected override unmountChildren(): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      child.cascadeUnmount();
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  protected override processChildren(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     processChild: (this: this, child: View, processFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      processChild.call(this, child, processFlags, viewContext);
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  protected override displayChildren(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     displayChild: (this: this, child: View, displayFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      displayChild.call(this, child, displayFlags, viewContext);
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  override readonly geoBounds!: GeoBox;

  protected setGeoBounds(newGeoBounds: GeoBox): void {
    const oldGeoBounds = this.geoBounds;
    if (!oldGeoBounds.equals(newGeoBounds)) {
      this.willSetGeoBounds(newGeoBounds, oldGeoBounds);
      (this as Mutable<this>).geoBounds = newGeoBounds;
      this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
  }

  protected updateGeoBounds(): void {
    this.setGeoBounds(this.deriveGeoBounds());
  }

  protected onInsertChildGeoBounds(child: GeoView, newGeoBounds: GeoBox): void {
    this.updateGeoBounds();
  }

  protected onRemoveChildGeoBounds(child: GeoView, oldGeoBounds: GeoBox): void {
    this.updateGeoBounds();
  }

  override onSetChildGeoBounds(child: GeoView, newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    this.updateGeoBounds();
  }

  override onSetChildHidden(child: GeoView, hidden: boolean): void {
    this.updateGeoBounds();
  }

  override onSetChildUnbounded(child: GeoView, unbounded: boolean): void {
    this.updateGeoBounds();
  }

  override deriveGeoBounds(): GeoBox {
    let geoBounds = this.ownGeoBounds;
    const children = this.children;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const child = children[i]!;
      if (child instanceof GeoView && !child.isHidden() && !child.unbounded) {
        const childGeoBounds = child.geoBounds;
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

  override deriveViewBounds(): R2Box {
    let viewBounds: R2Box | null = this.ownViewBounds;
    const children = this.children;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const child = children[i]!;
      if (child instanceof GraphicsView && !child.isHidden() && !child.unbounded) {
        const childBounds = child.viewBounds;
        if (childBounds.isDefined()) {
          if (viewBounds !== null) {
            viewBounds = viewBounds.union(childBounds);
          } else {
            viewBounds = childBounds;
          }
        }
      }
    }
    if (viewBounds === null) {
      viewBounds = this.viewFrame;
    }
    return viewBounds;
  }

  override deriveHitBounds(): R2Box {
    let hitBounds: R2Box | undefined;
    const children = this.children;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const child = children[i]!;
      if (child instanceof GraphicsView && !child.isHidden() && !child.intangible) {
        const childHitBounds = child.hitBounds;
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

  protected override hitTestChildren(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const children = this.children;
    for (let i = children.length - 1; i >= 0; i -= 1) {
      const child = children[i]!;
      if (child instanceof GraphicsView) {
        const hit = child.cascadeHitTest(x, y, viewContext);
        if (hit !== null) {
          return hit;
        }
      }
    }
    return null;
  }
}
