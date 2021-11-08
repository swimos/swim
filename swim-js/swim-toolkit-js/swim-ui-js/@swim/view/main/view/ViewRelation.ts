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

import type {Class, ObserverType} from "@swim/util";
import {FastenerOwner, FastenerInit, FastenerClass, Fastener} from "@swim/fastener";
import {AnyView, ViewFactory, View} from "./View";

export type ViewRelationType<F extends ViewRelation<any, any>> =
  F extends ViewRelation<any, infer V> ? V : never;

export interface ViewRelationInit<V extends View = View> extends FastenerInit {
  extends?: {prototype: ViewRelation<any, any>} | string | boolean | null;
  type?: ViewFactory<V>;
  binds?: boolean;
  observes?: boolean;

  initView?(view: V): void;
  willAttachView?(view: V, targetView: View | null): void;
  didAttachView?(view: V, targetView: View | null): void;

  deinitView?(view: V): void;
  willDetachView?(view: V): void;
  didDetachView?(view: V): void;

  parentView?: View | null;
  insertChild?(parent: View, child: V, targetView: View | null, key: string | undefined): void;

  detectView?(view: View): V | null;
  createView?(): V;
  fromAny?(value: AnyView<V>): V;
}

export type ViewRelationDescriptor<O = unknown, V extends View = View, I = {}> = ThisType<ViewRelation<O, V> & I> & ViewRelationInit<V> & Partial<I>;

export interface ViewRelationClass<F extends ViewRelation<any, any> = ViewRelation<any, any>> extends FastenerClass<F> {
}

export interface ViewRelationFactory<F extends ViewRelation<any, any> = ViewRelation<any, any>> extends ViewRelationClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ViewRelationFactory<F> & I;

  define<O, V extends View = View>(className: string, descriptor: ViewRelationDescriptor<O, V>): ViewRelationFactory<ViewRelation<any, V>>;
  define<O, V extends View = View>(className: string, descriptor: {observes: boolean} & ViewRelationDescriptor<O, V, ObserverType<V>>): ViewRelationFactory<ViewRelation<any, V>>;
  define<O, V extends View = View, I = {}>(className: string, descriptor: ViewRelationDescriptor<O, V, I>): ViewRelationFactory<ViewRelation<any, V> & I>;
  define<O, V extends View = View, I = {}>(className: string, descriptor: {observes: boolean} & ViewRelationDescriptor<O, V, I & ObserverType<V>>): ViewRelationFactory<ViewRelation<any, V> & I>;

  <O, V extends View = View>(descriptor: ViewRelationDescriptor<O, V>): PropertyDecorator;
  <O, V extends View = View>(descriptor: {observes: boolean} & ViewRelationDescriptor<O, V, ObserverType<V>>): PropertyDecorator;
  <O, V extends View = View, I = {}>(descriptor: ViewRelationDescriptor<O, V, I>): PropertyDecorator;
  <O, V extends View = View, I = {}>(descriptor: {observes: boolean} & ViewRelationDescriptor<O, V, I & ObserverType<V>>): PropertyDecorator;
}

export interface ViewRelation<O = unknown, V extends View = View> extends Fastener<O> {
  /** @override */
  get familyType(): Class<ViewRelation<any, any>> | null;

  /** @protected */
  initView(view: V): void;

  /** @protected */
  willAttachView(view: V, targetView: View | null): void;

  /** @protected */
  onAttachView(view: V, targetView: View | null): void;

  /** @protected */
  didAttachView(view: V, targetView: View | null): void;

  /** @protected */
  deinitView(view: V): void;

  /** @protected */
  willDetachView(view: V): void;

  /** @protected */
  onDetachView(view: V): void;

  /** @protected */
  didDetachView(view: V): void;

  /** @internal @protected */
  get parentView(): View | null;

  /** @internal @protected */
  insertChild(parent: View, child: V, target: View | null, key: string | undefined): void;

  /** @internal */
  bindView(view: View, targetView: View | null): void;

  /** @internal */
  unbindView(view: View): void;

  detectView(view: View): V | null;

  createView(): V;

  /** @internal @protected */
  fromAny(value: AnyView<V>): V;

  /** @internal @protected */
  get type(): ViewFactory<V> | undefined; // optional prototype property

  /** @internal @protected */
  get binds(): boolean | undefined; // optional prototype property

  /** @internal @protected */
  get observes(): boolean | undefined; // optional prototype property

  /** @internal @override */
  get lazy(): boolean; // prototype property

  /** @internal @override */
  get static(): string | boolean; // prototype property
}

export const ViewRelation = (function (_super: typeof Fastener) {
  const ViewRelation: ViewRelationFactory = _super.extend("ViewRelation");

  Object.defineProperty(ViewRelation.prototype, "familyType", {
    get: function (this: ViewRelation): Class<ViewRelation<any, any>> | null {
      return ViewRelation;
    },
    configurable: true,
  });

  ViewRelation.prototype.initView = function <V extends View>(this: ViewRelation<unknown, V>, view: V): void {
    // hook
  };

  ViewRelation.prototype.willAttachView = function <V extends View>(this: ViewRelation<unknown, V>, view: V, targetView: View | null): void {
    // hook
  };

  ViewRelation.prototype.onAttachView = function <V extends View>(this: ViewRelation<unknown, V>, view: V, targetView: View | null): void {
    if (this.observes === true) {
      view.observe(this as ObserverType<V>);
    }
  };

  ViewRelation.prototype.didAttachView = function <V extends View>(this: ViewRelation<unknown, V>, view: V, targetView: View | null): void {
    // hook
  };

  ViewRelation.prototype.deinitView = function <V extends View>(this: ViewRelation<unknown, V>, view: V): void {
    // hook
  };

  ViewRelation.prototype.willDetachView = function <V extends View>(this: ViewRelation<unknown, V>, view: V): void {
    // hook
  };

  ViewRelation.prototype.onDetachView = function <V extends View>(this: ViewRelation<unknown, V>, view: V): void {
    if (this.observes === true) {
      view.unobserve(this as ObserverType<V>);
    }
  };

  ViewRelation.prototype.didDetachView = function <V extends View>(this: ViewRelation<unknown, V>, view: V): void {
    // hook
  };

  Object.defineProperty(ViewRelation.prototype, "parentView", {
    get(this: ViewRelation): View | null {
      const owner = this.owner;
      return owner instanceof View ? owner : null;
    },
    configurable: true,
  });

  ViewRelation.prototype.insertChild = function <V extends View>(this: ViewRelation<unknown, V>, parent: View, child: V, target: View | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  };

  ViewRelation.prototype.bindView = function <V extends View>(this: ViewRelation<unknown, V>, view: View, targetView: View | null): void {
    // hook
  };

  ViewRelation.prototype.unbindView = function <V extends View>(this: ViewRelation<unknown, V>, view: View): void {
    // hook
  };

  ViewRelation.prototype.detectView = function <V extends View>(this: ViewRelation<unknown, V>, view: View): V | null {
    return null;
  };

  ViewRelation.prototype.createView = function <V extends View>(this: ViewRelation<unknown, V>): V {
    let view: V | undefined;
    const type = this.type;
    if (type !== void 0) {
      view = type.create();
    }
    if (view === void 0 || view === null) {
      let message = "Unable to create ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "view";
      throw new Error(message);
    }
    return view;
  };

  ViewRelation.prototype.fromAny = function <V extends View>(this: ViewRelation<unknown, V>, value: AnyView<V>): V {
    const type = this.type;
    if (type !== void 0) {
      return type.fromAny(value);
    } else {
      return View.fromAny(value) as V;
    }
  };

  Object.defineProperty(ViewRelation.prototype, "lazy", {
    get: function (this: ViewRelation): boolean {
      return false;
    },
    configurable: true,
  });

  Object.defineProperty(ViewRelation.prototype, "static", {
    get: function (this: ViewRelation): string | boolean {
      return true;
    },
    configurable: true,
  });

  ViewRelation.construct = function <F extends ViewRelation<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    return fastener;
  };

  ViewRelation.define = function <O, V extends View>(className: string, descriptor: ViewRelationDescriptor<O, V>): ViewRelationFactory<ViewRelation<any, V>> {
    let superClass = descriptor.extends as ViewRelationFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ViewRelation<any, any>}, fastener: ViewRelation<O, V> | null, owner: O): ViewRelation<O, V> {
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

  return ViewRelation;
})(Fastener);
