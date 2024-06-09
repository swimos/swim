// Copyright 2015-2024 Nstream, inc.
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
import type {Proto} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Objects} from "@swim/util";
import type {Comparator} from "@swim/util";
import {Affinity} from "@swim/component";
import type {FastenerFlags} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {View} from "./View";
import type {ViewRelationDescriptor} from "./ViewRelation";
import type {ViewRelationClass} from "./ViewRelation";
import {ViewRelation} from "./ViewRelation";

/** @public */
export interface ViewSetDescriptor<R, V extends View> extends ViewRelationDescriptor<R, V> {
  extends?: Proto<ViewSet<any, any, any>> | boolean | null;
  ordered?: boolean;
  sorted?: boolean;
}

/** @public */
export interface ViewSetClass<F extends ViewSet<any, any, any> = ViewSet<any, any, any>> extends ViewRelationClass<F> {
  /** @internal */
  readonly OrderedFlag: FastenerFlags;
  /** @internal */
  readonly SortedFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface ViewSet<R = any, V extends View = View, I extends any[] = [V | null]> extends ViewRelation<R, V, I> {
  /** @override */
  get descriptorType(): Proto<ViewSetDescriptor<R, V>>;

  /** @override */
  get fastenerType(): Proto<ViewSet<any, any, any>>;

  /** @override */
  get parent(): ViewSet<any, V, any> | null;

  /** @protected */
  viewKey(view: V): string | undefined;

  /** @internal */
  readonly views: {readonly [viewId: string]: V | undefined};

  readonly viewCount: number;

  /** @internal */
  insertViewMap(newView: V, target: View | null): void;

  /** @internal */
  removeViewMap(oldView: V): void;

  hasView(view: View): boolean;

  addView(view?: V | LikeType<V>, target?: View | null, key?: string): V;

  addViews(views: {readonly [viewId: string]: V | undefined}, target?: View | null): void;

  setViews(views: {readonly [viewId: string]: V | undefined}, target?: View | null): void;

  attachView(view?: V | LikeType<V> | null, target?: View | null): V;

  attachViews(views: {readonly [viewId: string]: V | undefined}, target?: View | null): void;

  detachView(view: V): V | null;

  detachViews(views?: {readonly [viewId: string]: V | undefined}): void;

  insertView(parent?: View | null, view?: V | LikeType<V>, target?: View | null, key?: string): V;

  insertViews(parent: View | null, views: {readonly [viewId: string]: V | undefined}, target?: View | null): void;

  removeView(view: V): V | null;

  removeViews(views?: {readonly [viewId: string]: V | undefined}): void;

  deleteView(view: V): V | null;

  deleteViews(views?: {readonly [viewId: string]: V | undefined}): void;

  reinsertView(view: V, target?: View | null): void;

  /** @internal @override */
  bindView(view: View, target: View | null): void;

  /** @internal @override */
  unbindView(view: View): void;

  /** @override */
  detectView(view: View): V | null;

  /** @override */
  recohere(t: number): void;

  get ordered(): boolean;

  order(ordered?: boolean): this;

  get sorted(): boolean;

  sort(sorted?: boolean): this;

  /** @protected */
  willSort(parent: View | null): void;

  /** @protected */
  onSort(parent: View | null): void;

  /** @protected */
  didSort(parent: View | null): void;

  /** @internal */
  sortChildren(parent: View, comparator?: Comparator<V>): void;

  /** @internal */
  getTargetChild(parent: View, child: V): View | null;

  /** @internal */
  compareChildren(a: View, b: View): number;

  /** @internal */
  compareTargetChild(a: View, b: View): number;

  /** @protected */
  compare(a: V, b: V): number;
}

/** @public */
export const ViewSet = (<R, V extends View, I extends any[], F extends ViewSet<any, any, any>>() => ViewRelation.extend<ViewSet<R, V, I>, ViewSetClass<F>>("ViewSet", {
  get fastenerType(): Proto<ViewSet<any, any, any>> {
    return ViewSet;
  },

  viewKey(view: V): string | undefined {
    return void 0;
  },

  insertViewMap(newView: V, target: View | null): void {
    const views = this.views as {[viewId: string]: V | undefined};
    if (target !== null && (this.flags & ViewSet.OrderedFlag) !== 0) {
      (this as Mutable<typeof this>).views = Objects.inserted(views, newView.uid, newView, target);
    } else {
      views[newView.uid] = newView;
    }
  },

  removeViewMap(oldView: V): void {
    const views = this.views as {[viewId: string]: V | undefined};
    delete views[oldView.uid];
  },

  hasView(view: View): boolean {
    return this.views[view.uid] !== void 0;
  },

  addView(newView?: V | LikeType<V>, target?: View | null, key?: string): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromLike(newView);
    } else {
      newView = this.createView();
    }
    if (target === void 0) {
      target = null;
    }
    let parent: View | null;
    if (this.binds && (parent = this.parentView, parent !== null)) {
      if (target === null) {
        if (newView.parent === parent) {
          target = newView.nextSibling;
        } else {
          target = this.getTargetChild(parent, newView);
        }
      }
      if (key === void 0) {
        key = this.viewKey(newView);
      }
      if (newView.parent !== parent || newView.nextSibling !== target || newView.key !== key) {
        this.insertChild(parent, newView, target, key);
      }
    }
    if (this.views[newView.uid] !== void 0) {
      return newView;
    }
    this.insertViewMap(newView, target);
    (this as Mutable<typeof this>).viewCount += 1;
    this.willAttachView(newView, target);
    this.onAttachView(newView, target);
    this.initView(newView);
    this.didAttachView(newView, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newView;
  },

  addViews(newViews: {readonly [viewId: string]: V | undefined}, target?: View | null): void {
    for (const viewId in newViews) {
      this.addView(newViews[viewId]!, target);
    }
  },

  setViews(newViews: {readonly [viewId: string]: V | undefined}, target?: View | null): void {
    const binds = this.binds;
    const parent = binds ? this.parentView : null;
    const views = this.views;
    for (const viewId in views) {
      if (newViews[viewId] === void 0) {
        const oldView = this.detachView(views[viewId]!);
        if (oldView !== null && binds && parent !== null && oldView.parent === parent) {
          oldView.remove();
        }
      }
    }
    if ((this.flags & ViewSet.OrderedFlag) !== 0) {
      const orderedViews = new Array<V>();
      for (const viewId in newViews) {
        orderedViews.push(newViews[viewId]!);
      }
      for (let i = 0, n = orderedViews.length; i < n; i += 1) {
        const newView = orderedViews[i]!;
        if (views[newView.uid] === void 0) {
          const targetView = i < n + 1 ? orderedViews[i + 1] : target;
          this.addView(newView, targetView);
        }
      }
    } else {
      for (const viewId in newViews) {
        if (views[viewId] === void 0) {
          this.addView(newViews[viewId]!, target);
        }
      }
    }
  },

  attachView(newView?: V | LikeType<V> | null, target?: View | null): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromLike(newView);
    } else {
      newView = this.createView();
    }
    if (this.views[newView.uid] !== void 0) {
      return newView;
    } else if (target === void 0) {
      target = null;
    }
    this.insertViewMap(newView, target);
    (this as Mutable<typeof this>).viewCount += 1;
    this.willAttachView(newView, target);
    this.onAttachView(newView, target);
    this.initView(newView);
    this.didAttachView(newView, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newView;
  },

  attachViews(newViews: {readonly [viewId: string]: V | undefined}, target?: View | null): void {
    for (const viewId in newViews) {
      this.attachView(newViews[viewId]!, target);
    }
  },

  detachView(oldView: V): V | null {
    if (this.views[oldView.uid] === void 0) {
      return null;
    }
    (this as Mutable<typeof this>).viewCount -= 1;
    this.removeViewMap(oldView);
    this.willDetachView(oldView);
    this.onDetachView(oldView);
    this.deinitView(oldView);
    this.didDetachView(oldView);
    this.setCoherent(true);
    this.decohereOutlets();
    return oldView;
  },

  detachViews(views?: {readonly [viewId: string]: V | undefined}): void {
    if (views === void 0) {
      views = this.views;
    }
    for (const viewId in views) {
      this.detachView(views[viewId]!);
    }
  },

  insertView(parent?: View | null, newView?: V | LikeType<V>, target?: View | null, key?: string): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromLike(newView);
    } else {
      newView = this.createView();
    }
    if (parent === void 0) {
      parent = null;
    }
    if (!this.binds && this.views[newView.uid] !== void 0 && newView.parent !== null && parent === null && key === void 0) {
      return newView;
    }
    if (parent === null) {
      parent = this.parentView;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.viewKey(newView);
    }
    if (parent !== null && (newView.parent !== parent || newView.key !== key)) {
      if (target === null) {
        target = this.getTargetChild(parent, newView);
      }
      this.insertChild(parent, newView, target, key);
    }
    if (this.views[newView.uid] !== void 0) {
      return newView;
    }
    this.insertViewMap(newView, target);
    (this as Mutable<typeof this>).viewCount += 1;
    this.willAttachView(newView, target);
    this.onAttachView(newView, target);
    this.initView(newView);
    this.didAttachView(newView, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newView;
  },

  insertViews(parent: View | null, newViews: {readonly [viewId: string]: V | undefined}, target?: View | null): void {
    for (const viewId in newViews) {
      this.insertView(parent, newViews[viewId]!, target);
    }
  },

  removeView(view: V): V | null {
    if (!this.hasView(view)) {
      return null;
    }
    view.remove();
    return view;
  },

  removeViews(views?: {readonly [viewId: string]: V | undefined}): void {
    if (views === void 0) {
      views = this.views;
    }
    for (const viewId in views) {
      this.removeView(views[viewId]!);
    }
  },

  deleteView(view: V): V | null {
    const oldView = this.detachView(view);
    if (oldView === null) {
      return null;
    }
    oldView.remove();
    return oldView;
  },

  deleteViews(views?: {readonly [viewId: string]: V | undefined}): void {
    if (views === void 0) {
      views = this.views;
    }
    for (const viewId in views) {
      this.deleteView(views[viewId]!);
    }
  },

  reinsertView(view: V, target?: View | null): void {
    if (this.views[view.uid] === void 0 || (target === void 0 && (this.flags & ViewSet.SortedFlag) === 0)) {
      return;
    }
    const parent = view.parent;
    if (parent === null) {
      return;
    } else if (target === void 0) {
      target = this.getTargetChild(parent, view);
    }
    parent.reinsertChild(view, target);
  },

  bindView(view: View, target: View | null): void {
    if (!this.binds) {
      return;
    }
    const newView = this.detectView(view);
    if (newView === null || this.views[newView.uid] !== void 0) {
      return;
    }
    this.insertViewMap(newView, target);
    (this as Mutable<typeof this>).viewCount += 1;
    this.willAttachView(newView, target);
    this.onAttachView(newView, target);
    this.initView(newView);
    this.didAttachView(newView, target);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  unbindView(view: View): void {
    if (!this.binds) {
      return;
    }
    const oldView = this.detectView(view);
    if (oldView === null || this.views[oldView.uid] === void 0) {
      return;
    }
    (this as Mutable<typeof this>).viewCount -= 1;
    this.removeViewMap(oldView);
    this.willDetachView(oldView);
    this.onDetachView(oldView);
    this.deinitView(oldView);
    this.didDetachView(oldView);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  detectView(view: View): V | null {
    if (typeof this.viewType === "function" && view instanceof this.viewType) {
      return view as V;
    }
    return null;
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof ViewSet) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        this.setViews(inlet.views);
      }
    } else {
      this.setDerived(false);
    }
  },

  get ordered(): boolean {
    return (this.flags & ViewSet.OrderedFlag) !== 0;
  },

  order(ordered?: boolean): typeof this {
    if (ordered === void 0) {
      ordered = true;
    }
    if (ordered) {
      this.setFlags(this.flags | ViewSet.OrderedFlag);
    } else {
      this.setFlags(this.flags & ~ViewSet.OrderedFlag);
    }
    return this;
  },

  get sorted(): boolean {
    return (this.flags & ViewSet.SortedFlag) !== 0;
  },

  sort(sorted?: boolean): typeof this {
    if (sorted === void 0) {
      sorted = true;
    }
    if (sorted) {
      const parent = this.parentView;
      this.willSort(parent);
      this.setFlags(this.flags | ViewSet.SortedFlag);
      this.onSort(parent);
      this.didSort(parent);
    } else {
      this.setFlags(this.flags & ~ViewSet.SortedFlag);
    }
    return this;
  },

  willSort(parent: View | null): void {
    // hook
  },

  onSort(parent: View | null): void {
    if (parent !== null) {
      this.sortChildren(parent);
    }
  },

  didSort(parent: View | null): void {
    // hook
  },

  sortChildren(parent: View, comparator?: Comparator<V>): void {
    parent.sortChildren(this.compareChildren.bind(this));
  },

  getTargetChild(parent: View, child: V): View | null {
    if ((this.flags & ViewSet.SortedFlag) !== 0) {
      return parent.getTargetChild(child, this.compareTargetChild.bind(this));
    }
    return null;
  },

  compareChildren(a: View, b: View): number {
    const views = this.views;
    const x = views[a.uid];
    const y = views[b.uid];
    if (x !== void 0 && y !== void 0) {
      return this.compare(x, y);
    }
    return x !== void 0 ? 1 : y !== void 0 ? -1 : 0;
  },

  compareTargetChild(a: V, b: View): number {
    const views = this.views;
    const y = views[b.uid];
    if (y !== void 0) {
      return this.compare(a, y);
    }
    return y !== void 0 ? -1 : 0;
  },

  compare(a: V, b: V): number {
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).views = {};
    (fastener as Mutable<typeof fastener>).viewCount = 0;
    return fastener;
  },

  refine(fastenerClass: FastenerClass<ViewSet<any, any, any>>): void {
    super.refine(fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    let flagsInit = fastenerPrototype.flagsInit;
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "ordered")) {
      if (fastenerPrototype.ordered) {
        flagsInit |= ViewSet.OrderedFlag;
      } else {
        flagsInit &= ~ViewSet.OrderedFlag;
      }
      delete (fastenerPrototype as ViewSetDescriptor<any, any>).ordered;
    }
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "sorted")) {
      if (fastenerPrototype.sorted) {
        flagsInit |= ViewSet.SortedFlag;
      } else {
        flagsInit &= ~ViewSet.SortedFlag;
      }
      delete (fastenerPrototype as ViewSetDescriptor<any, any>).sorted;
    }
    Object.defineProperty(fastenerPrototype, "flagsInit", {
      value: flagsInit,
      enumerable: true,
      configurable: true,
    });
  },

  OrderedFlag: 1 << (ViewRelation.FlagShift + 0),
  SortedFlag: 1 << (ViewRelation.FlagShift + 1),

  FlagShift: ViewRelation.FlagShift + 2,
  FlagMask: (1 << (ViewRelation.FlagShift + 2)) - 1,
}))();
