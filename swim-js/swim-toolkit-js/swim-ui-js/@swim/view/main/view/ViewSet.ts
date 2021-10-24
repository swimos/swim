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

import type {Mutable, Class, ObserverType} from "@swim/util";
import type {FastenerOwner} from "@swim/fastener";
import type {AnyView, ViewFactory, View} from "./View";
import {ViewRelationInit, ViewRelationClass, ViewRelation} from "./ViewRelation";

export type ViewSetType<F extends ViewSet<any, any>> =
  F extends ViewSet<any, infer V> ? V : never;

export interface ViewSetInit<V extends View = View> extends ViewRelationInit<V> {
  extends?: {prototype: ViewSet<any, any>} | string | boolean | null;
  key?(view: V): string | undefined;
}

export type ViewSetDescriptor<O = unknown, V extends View = View, I = {}> = ThisType<ViewSet<O, V> & I> & ViewSetInit<V> & Partial<I>;

export interface ViewSetClass<F extends ViewSet<any, any> = ViewSet<any, any>> extends ViewRelationClass<F> {
}

export interface ViewSetFactory<F extends ViewSet<any, any> = ViewSet<any, any>> extends ViewSetClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ViewSetFactory<F> & I;

  define<O, V extends View = View>(className: string, descriptor: ViewSetDescriptor<O, V>): ViewSetFactory<ViewSet<any, V>>;
  define<O, V extends View = View>(className: string, descriptor: {observes: boolean} & ViewSetDescriptor<O, V, ObserverType<V>>): ViewSetFactory<ViewSet<any, V>>;
  define<O, V extends View = View, I = {}>(className: string, descriptor: ViewSetDescriptor<O, V, I>): ViewSetFactory<ViewSet<any, V> & I>;
  define<O, V extends View = View, I = {}>(className: string, descriptor: {observes: boolean} & ViewSetDescriptor<O, V, I & ObserverType<V>>): ViewSetFactory<ViewSet<any, V> & I>;

  <O, V extends View = View>(descriptor: ViewSetDescriptor<O, V>): PropertyDecorator;
  <O, V extends View = View>(descriptor: {observes: boolean} & ViewSetDescriptor<O, V, ObserverType<V>>): PropertyDecorator;
  <O, V extends View = View, I = {}>(descriptor: ViewSetDescriptor<O, V, I>): PropertyDecorator;
  <O, V extends View = View, I = {}>(descriptor: {observes: boolean} & ViewSetDescriptor<O, V, I & ObserverType<V>>): PropertyDecorator;
}

export interface ViewSet<O = unknown, V extends View = View> extends ViewRelation<O, V> {
  (newView: AnyView<V>): O;

  /** @override */
  get familyType(): Class<ViewSet<any, any>> | null;

  /** @internal */
  readonly views: {readonly [id: number]: V | undefined};

  readonly viewCount: number;

  hasView(view: V): boolean;

  addView<V2 extends V>(view: V2 | ViewFactory<V2>, targetView?: View | null, key?: string): V2;
  addView(view: AnyView<V>, targetView?: View | null, key?: string): V;
  addView(view?: AnyView<V> | null, targetView?: View | null, key?: string): V | null;

  attachView<V2 extends V>(view: V2 | ViewFactory<V2>, targetView?: View | null): V2;
  attachView(view: AnyView<V>, targetView?: View | null): V;
  attachView(view?: AnyView<V> | null, targetView?: View | null): V | null;

  detachView(view: V): V | null;

  insertView(parentView?: View | null, newView?: AnyView<V> | null, targetView?: View | null, key?: string): V | null;

  removeView(view: V): V | null;

  deleteView(view: V): V | null;

  /** @internal @override */
  bindView(view: View, targetView: View | null): void;

  /** @internal @override */
  unbindView(view: View): void;

  /** @override */
  detectView(view: View): V | null;

  /** @internal @protected */
  key(view: V): string | undefined;
}

export const ViewSet = (function (_super: typeof ViewRelation) {
  const ViewSet: ViewSetFactory = _super.extend("ViewSet");

  Object.defineProperty(ViewSet.prototype, "familyType", {
    get: function (this: ViewSet): Class<ViewSet<any, any>> | null {
      return ViewSet;
    },
    configurable: true,
  });

  ViewSet.prototype.hasView = function <V extends View>(this: ViewSet<unknown, V>, view: V): boolean {
    return this.views[view.uid] !== void 0;
  };

  ViewSet.prototype.addView = function <V extends View>(this: ViewSet<unknown, V>, newView?: AnyView<V> | null, targetView?: View | null, key?: string): V | null {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAny(newView);
    } else {
      newView = this.createView();
    }
    if (newView !== null) {
      if (targetView === void 0) {
        targetView = null;
      }
      let parentView: View | null;
      if (this.binds && (parentView = this.parentView, parentView !== null)) {
        if (key === void 0) {
          key = this.key(newView);
        }
        this.insertChild(parentView, newView, targetView, key);
      }
      const views = this.views as {[id: number]: V | undefined};
      if (views[newView.uid] === void 0) {
        this.willAttachView(newView, targetView);
        views[newView.uid] = newView;
        (this as Mutable<typeof this>).viewCount += 1;
        this.onAttachView(newView, targetView);
        this.initView(newView);
        this.didAttachView(newView, targetView);
      }
    }
    return newView;
  };

  ViewSet.prototype.attachView = function <V extends View>(this: ViewSet<unknown, V>, newView?: AnyView<V> | null, targetView?: View | null): V | null {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAny(newView);
    } else {
      newView = this.createView();
    }
    const views = this.views as {[id: number]: V | undefined};
    if (newView !== null && views[newView.uid] === void 0) {
      if (targetView === void 0) {
        targetView = null;
      }
      this.willAttachView(newView, targetView);
      views[newView.uid] = newView;
      (this as Mutable<typeof this>).viewCount += 1;
      this.onAttachView(newView, targetView);
      this.initView(newView);
      this.didAttachView(newView, targetView);
    }
    return newView;
  };

  ViewSet.prototype.detachView = function <V extends View>(this: ViewSet<unknown, V>, oldView: V): V | null {
    const views = this.views as {[id: number]: V | undefined};
    if (views[oldView.uid] !== void 0) {
      this.willDetachView(oldView);
      (this as Mutable<typeof this>).viewCount -= 1;
      delete views[oldView.uid];
      this.onDetachView(oldView);
      this.deinitView(oldView);
      this.didDetachView(oldView);
      return oldView;
    }
    return null;
  };

  ViewSet.prototype.insertView = function <V extends View>(this: ViewSet<unknown, V>, parentView?: View | null, newView?: AnyView<V> | null, targetView?: View | null, key?: string): V | null {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAny(newView);
    } else {
      newView = this.createView();
    }
    const views = this.views as {[id: number]: V | undefined};
    if (newView !== null) {
      if (parentView === void 0 || parentView === null) {
        parentView = this.parentView;
      }
      if (targetView === void 0) {
        targetView = null;
      }
      if (key === void 0) {
        key = this.key(newView);
      }
      if (parentView !== null && (newView.parent !== parentView || newView.key !== key)) {
        this.insertChild(parentView, newView, targetView, key);
      }
      if (views[newView.uid] === void 0) {
        this.willAttachView(newView, targetView);
        views[newView.uid] = newView;
        (this as Mutable<typeof this>).viewCount += 1;
        this.onAttachView(newView, targetView);
        this.initView(newView);
        this.didAttachView(newView, targetView);
      }
    }
    return newView;
  };

  ViewSet.prototype.removeView = function <V extends View>(this: ViewSet<unknown, V>, view: V): V | null {
    if (this.hasView(view)) {
      view.remove();
      return view;
    }
    return null;
  };

  ViewSet.prototype.deleteView = function <V extends View>(this: ViewSet<unknown, V>, view: V): V | null {
    const oldView = this.detachView(view);
    if (oldView !== null) {
      oldView.remove();
    }
    return oldView;
  };

  ViewSet.prototype.bindView = function <V extends View>(this: ViewSet<unknown, V>, view: View, targetView: View | null): void {
    if (this.binds) {
      const newView = this.detectView(view);
      const views = this.views as {[id: number]: V | undefined};
      if (newView !== null && views[newView.uid] === void 0) {
        this.willAttachView(newView, targetView);
        views[newView.uid] = newView;
        (this as Mutable<typeof this>).viewCount += 1;
        this.onAttachView(newView, targetView);
        this.initView(newView);
        this.didAttachView(newView, targetView);
      }
    }
  };

  ViewSet.prototype.unbindView = function <V extends View>(this: ViewSet<unknown, V>, view: View): void {
    if (this.binds) {
      const oldView = this.detectView(view);
      const views = this.views as {[id: number]: V | undefined};
      if (oldView !== null && views[oldView.uid] !== void 0) {
        this.willDetachView(oldView);
        (this as Mutable<typeof this>).viewCount -= 1;
        delete views[oldView.uid];
        this.onDetachView(oldView);
        this.deinitView(oldView);
        this.didDetachView(oldView);
      }
    }
  };

  ViewSet.prototype.detectView = function <V extends View>(this: ViewSet<unknown, V>, view: View): V | null {
    if (typeof this.type === "function" && view instanceof this.type) {
      return view as V;
    }
    return null;
  };

  ViewSet.prototype.key = function <V extends View>(this: ViewSet<unknown, V>, view: V): string | undefined {
    return void 0;
  };

  ViewSet.construct = function <F extends ViewSet<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (newView: AnyView<ViewSetType<F>>): FastenerOwner<F> {
        fastener!.addView(newView);
        return fastener!.owner;
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).views = {};
    (fastener as Mutable<typeof fastener>).viewCount = 0;
    return fastener;
  };

  ViewSet.define = function <O, V extends View>(className: string, descriptor: ViewSetDescriptor<O, V>): ViewSetFactory<ViewSet<any, V>> {
    let superClass = descriptor.extends as ViewSetFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ViewSet<any, any>}, fastener: ViewSet<O, V> | null, owner: O): ViewSet<O, V> {
      fastener = superClass!.construct(fastenerClass, fastener, owner);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      return fastener;
    };

    return fastenerClass;
  };

  return ViewSet;
})(ViewRelation);
