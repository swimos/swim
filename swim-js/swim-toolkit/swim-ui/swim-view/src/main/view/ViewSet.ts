// Copyright 2015-2023 Swim.inc
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

import {Mutable, Proto, Objects, Comparator} from "@swim/util";
import {Affinity, FastenerFlags, FastenerOwner, Fastener} from "@swim/component";
import type {AnyView, ViewFactory, View} from "./View";
import {ViewRelationDescriptor, ViewRelationClass, ViewRelation} from "./ViewRelation";

/** @public */
export type ViewSetView<F extends ViewSet<any, any>> =
  F extends {viewType?: ViewFactory<infer V>} ? V : never;

/** @public */
export interface ViewSetDescriptor<V extends View = View> extends ViewRelationDescriptor<V> {
  extends?: Proto<ViewSet<any, any>> | string | boolean | null;
  ordered?: boolean;
  sorted?: boolean;
}

/** @public */
export type ViewSetTemplate<F extends ViewSet<any, any>> =
  ThisType<F> &
  ViewSetDescriptor<ViewSetView<F>> &
  Partial<Omit<F, keyof ViewSetDescriptor>>;

/** @public */
export interface ViewSetClass<F extends ViewSet<any, any> = ViewSet<any, any>> extends ViewRelationClass<F> {
  /** @override */
  specialize(template: ViewSetDescriptor<any>): ViewSetClass<F>;

  /** @override */
  refine(fastenerClass: ViewSetClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: ViewSetTemplate<F2>): ViewSetClass<F2>;
  extend<F2 extends F>(className: string, template: ViewSetTemplate<F2>): ViewSetClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: ViewSetTemplate<F2>): ViewSetClass<F2>;
  define<F2 extends F>(className: string, template: ViewSetTemplate<F2>): ViewSetClass<F2>;

  /** @override */
  <F2 extends F>(template: ViewSetTemplate<F2>): PropertyDecorator;

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
export interface ViewSet<O = unknown, V extends View = View> extends ViewRelation<O, V> {
  (view: AnyView<V>): O;

  /** @override */
  get fastenerType(): Proto<ViewSet<any, any>>;

  /** @internal @override */
  getSuper(): ViewSet<unknown, V> | null;

  /** @internal @override */
  setDerived(derived: boolean, inlet: ViewSet<unknown, V>): void;

  /** @protected @override */
  willDerive(inlet: ViewSet<unknown, V>): void;

  /** @protected @override */
  onDerive(inlet: ViewSet<unknown, V>): void;

  /** @protected @override */
  didDerive(inlet: ViewSet<unknown, V>): void;

  /** @protected @override */
  willUnderive(inlet: ViewSet<unknown, V>): void;

  /** @protected @override */
  onUnderive(inlet: ViewSet<unknown, V>): void;

  /** @protected @override */
  didUnderive(inlet: ViewSet<unknown, V>): void;

  /** @override */
  readonly inlet: ViewSet<unknown, V> | null;

  /** @protected @override */
  willBindInlet(inlet: ViewSet<unknown, V>): void;

  /** @protected @override */
  onBindInlet(inlet: ViewSet<unknown, V>): void;

  /** @protected @override */
  didBindInlet(inlet: ViewSet<unknown, V>): void;

  /** @protected @override */
  willUnbindInlet(inlet: ViewSet<unknown, V>): void;

  /** @protected @override */
  onUnbindInlet(inlet: ViewSet<unknown, V>): void;

  /** @protected @override */
  didUnbindInlet(inlet: ViewSet<unknown, V>): void;

  /** @internal @override */
  readonly outlets: ReadonlyArray<ViewSet<unknown, V>> | null;

  /** @internal @override */
  attachOutlet(outlet: ViewSet<unknown, V>): void;

  /** @internal @override */
  detachOutlet(outlet: ViewSet<unknown, V>): void;

  /** @internal */
  readonly views: {readonly [viewId: string]: V | undefined};

  /** @internal */
  insertViewMap(newView: V, target: View | null): void;

  /** @internal */
  removeViewMap(oldView: V): void;

  readonly viewCount: number;

  hasView(view: View): boolean;

  addView(view?: AnyView<V>, target?: View | null, key?: string): V;

  addViews(views: {readonly [viewId: string]: V | undefined}, target?: View | null): void;

  setViews(views: {readonly [viewId: string]: V | undefined}, target?: View | null): void;

  attachView(view?: AnyView<V>, target?: View | null): V;

  attachViews(views: {readonly [viewId: string]: V | undefined}, target?: View | null): void;

  detachView(view: V): V | null;

  detachViews(views?: {readonly [viewId: string]: V | undefined}): void;

  insertView(parent?: View | null, view?: AnyView<V>, target?: View | null, key?: string): V;

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

  /** @internal @protected */
  decohereOutlets(): void;

  /** @internal @protected */
  decohereOutlet(outlet: ViewSet<unknown, V>): void;

  /** @override */
  recohere(t: number): void;

  /** @internal @protected */
  viewKey(view: V): string | undefined;

  /** @internal */
  initOrdered(ordered: boolean): void;

  get ordered(): boolean;

  order(ordered?: boolean): this;

  /** @internal */
  initSorted(sorted: boolean): void;

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
export const ViewSet = (function (_super: typeof ViewRelation) {
  const ViewSet = _super.extend("ViewSet", {}) as ViewSetClass;

  Object.defineProperty(ViewSet.prototype, "fastenerType", {
    value: ViewSet,
    configurable: true,
  });

  ViewSet.prototype.onDerive = function (this: ViewSet, inlet: ViewSet): void {
    this.setViews(inlet.views);
  };

  ViewSet.prototype.insertViewMap = function <V extends View>(this: ViewSet<unknown, V>, newView: V, target: View | null): void {
    const views = this.views as {[viewId: string]: V | undefined};
    if (target !== null && (this.flags & ViewSet.OrderedFlag) !== 0) {
      (this as Mutable<typeof this>).views = Objects.inserted(views, newView.uid, newView, target);
    } else {
      views[newView.uid] = newView;
    }
  };

  ViewSet.prototype.removeViewMap = function <V extends View>(this: ViewSet<unknown, V>, oldView: V): void {
    const views = this.views as {[viewId: string]: V | undefined};
    delete views[oldView.uid];
  };

  ViewSet.prototype.hasView = function (this: ViewSet, view: View): boolean {
    return this.views[view.uid] !== void 0;
  };

  ViewSet.prototype.addView = function <V extends View>(this: ViewSet<unknown, V>, newView?: AnyView<V>, target?: View | null, key?: string): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAny(newView);
    } else {
      newView = this.createView();
    }
    if (target === void 0) {
      target = null;
    }
    let parent: View | null;
    if (this.binds && (parent = this.parentView, parent !== null)) {
      if (target === null) {
        target = this.getTargetChild(parent, newView);
      }
      if (key === void 0) {
        key = this.viewKey(newView);
      }
      this.insertChild(parent, newView, target, key);
    }
    if (this.views[newView.uid] === void 0) {
      this.insertViewMap(newView, target);
      (this as Mutable<typeof this>).viewCount += 1;
      this.willAttachView(newView, target);
      this.onAttachView(newView, target);
      this.initView(newView);
      this.didAttachView(newView, target);
      this.setCoherent(true);
      this.decohereOutlets();
    }
    return newView;
  };

  ViewSet.prototype.addViews = function <V extends View>(this: ViewSet, newViews: {readonly [viewId: string]: V | undefined}, target?: View | null): void {
    for (const viewId in newViews) {
      this.addView(newViews[viewId]!, target);
    }
  };

  ViewSet.prototype.setViews = function <V extends View>(this: ViewSet, newViews: {readonly [viewId: string]: V | undefined}, target?: View | null): void {
    const views = this.views;
    for (const viewId in views) {
      if (newViews[viewId] === void 0) {
        this.detachView(views[viewId]!);
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
          this.attachView(newView, targetView);
        }
      }
    } else {
      for (const viewId in newViews) {
        if (views[viewId] === void 0) {
          this.attachView(newViews[viewId]!, target);
        }
      }
    }
  };

  ViewSet.prototype.attachView = function <V extends View>(this: ViewSet<unknown, V>, newView?: AnyView<V>, target?: View | null): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAny(newView);
    } else {
      newView = this.createView();
    }
    if (this.views[newView.uid] === void 0) {
      if (target === void 0) {
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
    }
    return newView;
  };

  ViewSet.prototype.attachViews = function <V extends View>(this: ViewSet, newViews: {readonly [viewId: string]: V | undefined}, target?: View | null): void {
    for (const viewId in newViews) {
      this.attachView(newViews[viewId]!, target);
    }
  };

  ViewSet.prototype.detachView = function <V extends View>(this: ViewSet<unknown, V>, oldView: V): V | null {
    if (this.views[oldView.uid] !== void 0) {
      (this as Mutable<typeof this>).viewCount -= 1;
      this.removeViewMap(oldView);
      this.willDetachView(oldView);
      this.onDetachView(oldView);
      this.deinitView(oldView);
      this.didDetachView(oldView);
      this.setCoherent(true);
      this.decohereOutlets();
      return oldView;
    }
    return null;
  };

  ViewSet.prototype.detachViews = function <V extends View>(this: ViewSet<unknown, V>, views?: {readonly [viewId: string]: V | undefined}): void {
    if (views === void 0) {
      views = this.views;
    }
    for (const viewId in views) {
      this.detachView(views[viewId]!);
    }
  };

  ViewSet.prototype.insertView = function <V extends View>(this: ViewSet<unknown, V>, parent?: View | null, newView?: AnyView<V>, target?: View | null, key?: string): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAny(newView);
    } else {
      newView = this.createView();
    }
    if (parent === void 0) {
      parent = null;
    }
    if (this.binds || this.views[newView.uid] === void 0 || newView.parent === null || parent !== null || key !== void 0) {
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
      if (this.views[newView.uid] === void 0) {
        this.insertViewMap(newView, target);
        (this as Mutable<typeof this>).viewCount += 1;
        this.willAttachView(newView, target);
        this.onAttachView(newView, target);
        this.initView(newView);
        this.didAttachView(newView, target);
        this.setCoherent(true);
        this.decohereOutlets();
      }
    }
    return newView;
  };

  ViewSet.prototype.insertViews = function <V extends View>(this: ViewSet, parent: View | null, newViews: {readonly [viewId: string]: V | undefined}, target?: View | null): void {
    for (const viewId in newViews) {
      this.insertView(parent, newViews[viewId]!, target);
    }
  };

  ViewSet.prototype.removeView = function <V extends View>(this: ViewSet<unknown, V>, view: V): V | null {
    if (this.hasView(view)) {
      view.remove();
      return view;
    }
    return null;
  };

  ViewSet.prototype.removeViews = function <V extends View>(this: ViewSet<unknown, V>, views?: {readonly [viewId: string]: V | undefined}): void {
    if (views === void 0) {
      views = this.views;
    }
    for (const viewId in views) {
      this.removeView(views[viewId]!);
    }
  };

  ViewSet.prototype.deleteView = function <V extends View>(this: ViewSet<unknown, V>, view: V): V | null {
    const oldView = this.detachView(view);
    if (oldView !== null) {
      oldView.remove();
    }
    return oldView;
  };

  ViewSet.prototype.deleteViews = function <V extends View>(this: ViewSet<unknown, V>, views?: {readonly [viewId: string]: V | undefined}): void {
    if (views === void 0) {
      views = this.views;
    }
    for (const viewId in views) {
      this.deleteView(views[viewId]!);
    }
  };

  ViewSet.prototype.reinsertView = function <V extends View>(this: ViewSet<unknown, V>, view: V, target?: View | null): void {
    if (this.views[view.uid] !== void 0 && (target !== void 0 || (this.flags & ViewSet.SortedFlag) !== 0)) {
      const parent = view.parent;
      if (parent !== null) {
        if (target === void 0) {
          target = this.getTargetChild(parent, view);
        }
        parent.reinsertChild(view, target);
      }
    }
  };

  ViewSet.prototype.bindView = function <V extends View>(this: ViewSet<unknown, V>, view: View, target: View | null): void {
    if (this.binds) {
      const newView = this.detectView(view);
      if (newView !== null && this.views[newView.uid] === void 0) {
        this.insertViewMap(newView, target);
        (this as Mutable<typeof this>).viewCount += 1;
        this.willAttachView(newView, target);
        this.onAttachView(newView, target);
        this.initView(newView);
        this.didAttachView(newView, target);
        this.setCoherent(true);
        this.decohereOutlets();
      }
    }
  };

  ViewSet.prototype.unbindView = function <V extends View>(this: ViewSet<unknown, V>, view: View): void {
    if (this.binds) {
      const oldView = this.detectView(view);
      if (oldView !== null && this.views[oldView.uid] !== void 0) {
        (this as Mutable<typeof this>).viewCount -= 1;
        this.removeViewMap(oldView);
        this.willDetachView(oldView);
        this.onDetachView(oldView);
        this.deinitView(oldView);
        this.didDetachView(oldView);
        this.setCoherent(true);
        this.decohereOutlets();
      }
    }
  };

  ViewSet.prototype.detectView = function <V extends View>(this: ViewSet<unknown, V>, view: View): V | null {
    if (typeof this.viewType === "function" && view instanceof this.viewType) {
      return view as V;
    }
    return null;
  };

  ViewSet.prototype.decohereOutlets = function (this: ViewSet): void {
    const outlets = this.outlets;
    for (let i = 0, n = outlets !== null ? outlets.length : 0; i < n; i += 1) {
      this.decohereOutlet(outlets![i]!);
    }
  };

  ViewSet.prototype.decohereOutlet = function (this: ViewSet, outlet: ViewSet): void {
    if ((outlet.flags & Fastener.DerivedFlag) === 0 && Math.min(this.flags & Affinity.Mask, Affinity.Intrinsic) >= (outlet.flags & Affinity.Mask)) {
      outlet.setDerived(true, this);
    } else if ((outlet.flags & Fastener.DerivedFlag) !== 0 && (outlet.flags & Fastener.DecoherentFlag) === 0) {
      outlet.setCoherent(false);
      outlet.decohere();
    }
  };

  ViewSet.prototype.recohere = function (this: ViewSet, t: number): void {
    if ((this.flags & Fastener.DerivedFlag) !== 0) {
      const inlet = this.inlet;
      if (inlet !== null) {
        this.setViews(inlet.views);
      }
    }
  };

  ViewSet.prototype.viewKey = function <V extends View>(this: ViewSet<unknown, V>, view: V): string | undefined {
    return void 0;
  };

  ViewSet.prototype.initOrdered = function (this: ViewSet, ordered: boolean): void {
    if (ordered) {
      (this as Mutable<typeof this>).flags = this.flags | ViewSet.OrderedFlag;
    } else {
      (this as Mutable<typeof this>).flags = this.flags & ~ViewSet.OrderedFlag;
    }
  };

  Object.defineProperty(ViewSet.prototype, "ordered", {
    get(this: ViewSet): boolean {
      return (this.flags & ViewSet.OrderedFlag) !== 0;
    },
    configurable: true,
  });

  ViewSet.prototype.order = function (this: ViewSet, ordered?: boolean): typeof this {
    if (ordered === void 0) {
      ordered = true;
    }
    if (ordered) {
      this.setFlags(this.flags | ViewSet.OrderedFlag);
    } else {
      this.setFlags(this.flags & ~ViewSet.OrderedFlag);
    }
    return this;
  };

  ViewSet.prototype.initSorted = function (this: ViewSet, sorted: boolean): void {
    if (sorted) {
      (this as Mutable<typeof this>).flags = this.flags | ViewSet.SortedFlag;
    } else {
      (this as Mutable<typeof this>).flags = this.flags & ~ViewSet.SortedFlag;
    }
  };

  Object.defineProperty(ViewSet.prototype, "sorted", {
    get(this: ViewSet): boolean {
      return (this.flags & ViewSet.SortedFlag) !== 0;
    },
    configurable: true,
  });

  ViewSet.prototype.sort = function (this: ViewSet, sorted?: boolean): typeof this {
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
  };

  ViewSet.prototype.willSort = function (this: ViewSet, parent: View | null): void {
    // hook
  };

  ViewSet.prototype.onSort = function (this: ViewSet, parent: View | null): void {
    if (parent !== null) {
      this.sortChildren(parent);
    }
  };

  ViewSet.prototype.didSort = function (this: ViewSet, parent: View | null): void {
    // hook
  };

  ViewSet.prototype.sortChildren = function <V extends View>(this: ViewSet<unknown, V>, parent: View, comparator?: Comparator<V>): void {
    parent.sortChildren(this.compareChildren.bind(this));
  };

  ViewSet.prototype.getTargetChild = function <V extends View>(this: ViewSet<unknown, V>, parent: View, child: V): View | null {
    if ((this.flags & ViewSet.SortedFlag) !== 0) {
      return parent.getTargetChild(child, this.compareTargetChild.bind(this));
    } else {
      return null;
    }
  };

  ViewSet.prototype.compareChildren = function <V extends View>(this: ViewSet<unknown, V>, a: View, b: View): number {
    const views = this.views;
    const x = views[a.uid];
    const y = views[b.uid];
    if (x !== void 0 && y !== void 0) {
      return this.compare(x, y);
    } else {
      return x !== void 0 ? 1 : y !== void 0 ? -1 : 0;
    }
  };

  ViewSet.prototype.compareTargetChild = function <V extends View>(this: ViewSet<unknown, V>, a: V, b: View): number {
    const views = this.views;
    const y = views[b.uid];
    if (y !== void 0) {
      return this.compare(a, y);
    } else {
      return y !== void 0 ? -1 : 0;
    }
  };

  ViewSet.prototype.compare = function <V extends View>(this: ViewSet<unknown, V>, a: V, b: V): number {
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
  };

  ViewSet.construct = function <F extends ViewSet<any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (newView: AnyView<ViewSetView<F>>): FastenerOwner<F> {
        fastener!.addView(newView);
        return fastener!.owner;
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, this.prototype);
    }
    fastener = _super.construct.call(this, fastener, owner) as F;
    const flagsInit = fastener.flagsInit;
    if (flagsInit !== void 0) {
      fastener.initOrdered((flagsInit & ViewSet.OrderedFlag) !== 0);
      fastener.initSorted((flagsInit & ViewSet.SortedFlag) !== 0);
    }
    (fastener as Mutable<typeof fastener>).views = {};
    (fastener as Mutable<typeof fastener>).viewCount = 0;
    return fastener;
  };

  ViewSet.refine = function (fastenerClass: ViewSetClass<any>): void {
    _super.refine.call(this, fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;
    let flagsInit = fastenerPrototype.flagsInit;

    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "ordered")) {
      if (flagsInit === void 0) {
        flagsInit = 0;
      }
      if (fastenerPrototype.ordered) {
        flagsInit |= ViewSet.OrderedFlag;
      } else {
        flagsInit &= ~ViewSet.OrderedFlag;
      }
      delete (fastenerPrototype as ViewSetDescriptor).ordered;
    }

    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "sorted")) {
      if (flagsInit === void 0) {
        flagsInit = 0;
      }
      if (fastenerPrototype.sorted) {
        flagsInit |= ViewSet.SortedFlag;
      } else {
        flagsInit &= ~ViewSet.SortedFlag;
      }
      delete (fastenerPrototype as ViewSetDescriptor).sorted;
    }

    if (flagsInit !== void 0) {
      Object.defineProperty(fastenerPrototype, "flagsInit", {
        value: flagsInit,
        configurable: true,
      });
    }
  };

  (ViewSet as Mutable<typeof ViewSet>).OrderedFlag = 1 << (_super.FlagShift + 0);
  (ViewSet as Mutable<typeof ViewSet>).SortedFlag = 1 << (_super.FlagShift + 1);

  (ViewSet as Mutable<typeof ViewSet>).FlagShift = _super.FlagShift + 2;
  (ViewSet as Mutable<typeof ViewSet>).FlagMask = (1 << ViewSet.FlagShift) - 1;

  return ViewSet;
})(ViewRelation);
