// Copyright 2015-2022 Swim.inc
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

import type {Mutable, Proto, Observes} from "@swim/util";
import type {FastenerOwner} from "@swim/component";
import {AnyView, ViewFactory, View} from "@swim/view";
import type {ControllerFactory, Controller} from "../controller/Controller";
import {ControllerSetDescriptor, ControllerSetClass, ControllerSet} from "../controller/ControllerSet";

/** @public */
export type ViewControllerSetView<F extends ViewControllerSet<any, any, any>> =
  F extends {viewType?: ViewFactory<infer V>} ? V : never;

/** @public */
export type ViewControllerSetController<F extends ViewControllerSet<any, any, any>> =
  F extends {controllerType?: ControllerFactory<infer C>} ? C : never;

/** @public */
export interface ViewControllerSetDescriptor<V extends View = View, C extends Controller = Controller> extends ControllerSetDescriptor<C> {
  extends?: Proto<ViewControllerSet<any, any, any>> | string | boolean | null;
  viewType?: ViewFactory<V>;
  viewKey?: string | boolean;
  observesView?: boolean;
}

/** @public */
export type ViewControllerSetTemplate<F extends ViewControllerSet<any, any, any>> =
  ThisType<F> &
  ViewControllerSetDescriptor<ViewControllerSetView<F>, ViewControllerSetController<F>> &
  Partial<Omit<F, keyof ViewControllerSetDescriptor>>;

/** @public */
export interface ViewControllerSetClass<F extends ViewControllerSet<any, any, any> = ViewControllerSet<any, any, any>> extends ControllerSetClass<F> {
  /** @override */
  specialize(template: ViewControllerSetDescriptor<any, any>): ViewControllerSetClass<F>;

  /** @override */
  refine(fastenerClass: ViewControllerSetClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: ViewControllerSetTemplate<F2>): ViewControllerSetClass<F2>;
  extend<F2 extends F>(className: string, template: ViewControllerSetTemplate<F2>): ViewControllerSetClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: ViewControllerSetTemplate<F2>): ViewControllerSetClass<F2>;
  define<F2 extends F>(className: string, template: ViewControllerSetTemplate<F2>): ViewControllerSetClass<F2>;

  /** @override */
  <F2 extends F>(template: ViewControllerSetTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface ViewControllerSet<O = unknown, V extends View = View, C extends Controller = Controller> extends ControllerSet<O, C> {
  /** @override */
  get fastenerType(): Proto<ViewControllerSet<any, any, any>>;

  /** @internal */
  readonly viewType?: ViewFactory<V>; // optional prototype property

  /** @internal */
  readonly viewKey?: string; // optional prototype property

  /** @internal */
  readonly viewControllers: {readonly [viewId: string]: C | undefined};

  getViewController(view: V): C | null;

  /** @protected */
  associateViewController(view: V, controller: C): void;

  /** @protected */
  dissociateViewController(view: V, controller: C): void;

  /** @internal */
  readonly views: {readonly [viewId: string]: V | undefined};

  readonly viewCount: number;

  hasView(view: View): boolean;

  addView(view?: AnyView<V>, targetController?: Controller | null, controllerKey?: string): V;

  addViews(views: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void;

  setViews(views: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void;

  attachView(view?: AnyView<V>, targetController?: Controller | null): V;

  /** @protected */
  initView(view: V): void;

  /** @protected */
  willAttachView(view: V, targetController: Controller | null): void;

  /** @protected */
  onAttachView(view: V, targetController: Controller | null): void;

  /** @protected */
  didAttachView(view: V, targetController: Controller | null): void;

  attachViews(views: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void;

  detachView(view: V): V | null;

  /** @protected */
  deinitView(view: V): void;

  /** @protected */
  willDetachView(view: V): void;

  /** @protected */
  onDetachView(view: V): void;

  /** @protected */
  didDetachView(view: V): void;

  detachViews(views?: {readonly [viewId: string]: V | undefined}): void;

  insertView(parent?: Controller | null, view?: AnyView<V>, targetController?: Controller | null, controllerKey?: string): V;

  insertViews(parent: Controller | null, views: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void;

  removeView(view: V): V | null;

  removeViews(views?: {readonly [viewId: string]: V | undefined}): void;

  deleteView(view: V): V | null;

  deleteViews(views?: {readonly [viewId: string]: V | undefined}): void;

  reinsertView(view: V, targetView?: V | null): void;

  createView(): V;

  /** @internal */
  readonly observesView?: boolean; // optional prototype property

  /** @protected */
  fromAnyView(value: AnyView<V>): V;

  /** @protected */
  detectControllerView(controller: Controller): V | null;

  /** @protected */
  insertControllerView(controller: C, view: V | null, targetView: View | null, viewKey: string | undefined): void;

  /** @override */
  detectController(controller: Controller): C | null;

  /** @protected @override */
  onAttachController(controller: C, targetController: Controller | null): void;

  /** @protected @override */
  onDetachController(controller: C): void;

  /** @override */
  createController(view?: V): C;

  /** @protected @override */
  compare(a: C, b: C): number;

  /** @protected */
  compareViews(a: V, b: V): number;
}

/** @public */
export const ViewControllerSet = (function (_super: typeof ControllerSet) {
  const ViewControllerSet = _super.extend("ViewControllerSet", {}) as ViewControllerSetClass;

  Object.defineProperty(ViewControllerSet.prototype, "fastenerType", {
    value: ViewControllerSet,
    configurable: true,
  });

  ViewControllerSet.prototype.getViewController = function <V extends View, C extends Controller>(this: ViewControllerSet<unknown, V, C>, view: V): C | null {
    const controller = this.viewControllers[view.uid];
    return controller !== void 0 ? controller : null;
  };

  ViewControllerSet.prototype.associateViewController = function <V extends View, C extends Controller>(this: ViewControllerSet<unknown, V, C>, view: V, controller: C): void {
    const viewControllers = this.viewControllers as {[viewId: string]: C | undefined};
    viewControllers[view.uid] = controller;
  };

  ViewControllerSet.prototype.dissociateViewController = function <V extends View, C extends Controller>(this: ViewControllerSet<unknown, V, C>, view: V, controller: C): void {
    const viewControllers = this.viewControllers as {[viewId: string]: C | undefined};
    delete viewControllers[view.uid];
  };

  ViewControllerSet.prototype.hasView = function (this: ViewControllerSet, view: View): boolean {
    return this.views[view.uid] !== void 0;
  };

  ViewControllerSet.prototype.addView = function <V extends View>(this: ViewControllerSet<unknown, V>, newView?: AnyView<V>, targetController?: Controller | null, controllerKey?: string): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAnyView(newView);
    } else {
      newView = this.createView();
    }
    let controller = this.getViewController(newView);
    if (controller === null) {
      controller = this.createController(newView);
    }
    this.addController(controller, targetController, controllerKey);
    return newView;
  };

  ViewControllerSet.prototype.addViews = function <V extends View>(this: ViewControllerSet, newViews: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void {
    for (const viewId in newViews) {
      this.addView(newViews[viewId]!, targetController);
    }
  };

  ViewControllerSet.prototype.setViews = function <V extends View>(this: ViewControllerSet, newViews: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void {
    const views = this.views;
    for (const viewId in views) {
      if (newViews[viewId] === void 0) {
        this.detachView(views[viewId]!);
      }
    }
    for (const viewId in newViews) {
      if (views[viewId] === void 0) {
        this.attachView(newViews[viewId]!, targetController);
      }
    }
  };

  ViewControllerSet.prototype.attachView = function <V extends View>(this: ViewControllerSet<unknown, V>, newView?: AnyView<V>, targetController?: Controller | null): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAnyView(newView);
    } else {
      newView = this.createView();
    }
    const views = this.views as {[viewId: string]: V | undefined};
    if (views[newView.uid] === void 0) {
      views[newView.uid] = newView;
      (this as Mutable<typeof this>).viewCount += 1;
      if (targetController === void 0) {
        targetController = null;
      }
      let controller = this.getViewController(newView);
      if (controller === null) {
        controller = this.createController(newView);
      }
      this.attachController(controller, targetController);
      this.willAttachView(newView, targetController);
      this.onAttachView(newView, targetController);
      this.initView(newView);
      this.didAttachView(newView, targetController);
    }
    return newView;
  };

  ViewControllerSet.prototype.initView = function <V extends View>(this: ViewControllerSet<unknown, V>, view: V): void {
    // hook
  };

  ViewControllerSet.prototype.willAttachView = function <V extends View>(this: ViewControllerSet<unknown, V>, view: V, targetController: Controller | null): void {
    // hook
  };

  ViewControllerSet.prototype.onAttachView = function <V extends View>(this: ViewControllerSet<unknown, V>, view: V, targetController: Controller | null): void {
    if (this.observesView === true) {
      view.observe(this as Observes<V>);
    }
  };

  ViewControllerSet.prototype.didAttachView = function <V extends View>(this: ViewControllerSet<unknown, V>, view: V, targetController: Controller | null): void {
    // hook
  };

  ViewControllerSet.prototype.attachViews = function <V extends View>(this: ViewControllerSet, newViews: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void {
    for (const viewId in newViews) {
      this.attachView(newViews[viewId]!, targetController);
    }
  };

  ViewControllerSet.prototype.detachView = function <V extends View>(this: ViewControllerSet<unknown, V>, oldView: V): V | null {
    const views = this.views as {[viewId: string]: V | undefined};
    if (views[oldView.uid] !== void 0) {
      (this as Mutable<typeof this>).viewCount -= 1;
      delete views[oldView.uid];
      this.willDetachView(oldView);
      this.onDetachView(oldView);
      this.deinitView(oldView);
      this.didDetachView(oldView);
      const controller = this.getViewController(oldView);
      if (controller !== null) {
        this.detachController(controller);
      }
      return oldView;
    }
    return null;
  };

  ViewControllerSet.prototype.deinitView = function <V extends View>(this: ViewControllerSet<unknown, V>, view: V): void {
    // hook
  };

  ViewControllerSet.prototype.willDetachView = function <V extends View>(this: ViewControllerSet<unknown, V>, view: V): void {
    // hook
  };

  ViewControllerSet.prototype.onDetachView = function <V extends View>(this: ViewControllerSet<unknown, V>, view: V): void {
    if (this.observesView === true) {
      view.unobserve(this as Observes<V>);
    }
  };

  ViewControllerSet.prototype.didDetachView = function <V extends View>(this: ViewControllerSet<unknown, V>, view: V): void {
    // hook
  };

  ViewControllerSet.prototype.detachViews = function <V extends View>(this: ViewControllerSet<unknown, V>, views?: {readonly [viewId: string]: V | undefined}): void {
    if (views === void 0) {
      views = this.views;
    }
    for (const viewId in views) {
      this.detachView(views[viewId]!);
    }
  };

  ViewControllerSet.prototype.insertView = function <V extends View>(this: ViewControllerSet<unknown, V>, parent?: Controller | null, newView?: AnyView<V>, targetController?: Controller | null, controllerKey?: string): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAnyView(newView);
    } else {
      newView = this.createView();
    }
    let controller = this.getViewController(newView);
    if (controller === null) {
      controller = this.createController(newView);
    }
    this.insertController(parent, controller, targetController, controllerKey);
    return newView;
  };

  ViewControllerSet.prototype.insertViews = function <V extends View>(this: ViewControllerSet, parent: Controller | null, newViews: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void {
    for (const viewId in newViews) {
      this.insertView(parent, newViews[viewId]!, targetController);
    }
  };

  ViewControllerSet.prototype.removeView = function <V extends View>(this: ViewControllerSet<unknown, V>, view: V): V | null {
    if (this.hasView(view)) {
      view.remove();
      return view;
    }
    return null;
  };

  ViewControllerSet.prototype.removeViews = function <V extends View>(this: ViewControllerSet<unknown, V>, views?: {readonly [viewId: string]: V | undefined}): void {
    if (views === void 0) {
      views = this.views;
    }
    for (const viewId in views) {
      this.removeView(views[viewId]!);
    }
  };

  ViewControllerSet.prototype.deleteView = function <V extends View>(this: ViewControllerSet<unknown, V>, view: V): V | null {
    const oldView = this.detachView(view);
    if (oldView !== null) {
      oldView.remove();
    }
    return oldView;
  };

  ViewControllerSet.prototype.deleteViews = function <V extends View>(this: ViewControllerSet<unknown, V>, views?: {readonly [viewId: string]: V | undefined}): void {
    if (views === void 0) {
      views = this.views;
    }
    for (const viewId in views) {
      this.deleteView(views[viewId]!);
    }
  };

  ViewControllerSet.prototype.reinsertView = function <V extends View>(this: ViewControllerSet<unknown, V>, view: V, targetView: V | null): void {
    const controller = this.getViewController(view);
    if (controller !== null) {
      const targetController = targetView !== null ? this.getViewController(targetView) : null;
      this.reinsertController(controller, targetController);
    }
  };

  ViewControllerSet.prototype.createView = function <V extends View>(this: ViewControllerSet<unknown, V>): V {
    let view: V | undefined;
    const viewType = this.viewType;
    if (viewType !== void 0) {
      view = viewType.create();
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

  ViewControllerSet.prototype.fromAnyView = function <V extends View>(this: ViewControllerSet<unknown, V>, value: AnyView<V>): V {
    const viewType = this.viewType;
    if (viewType !== void 0) {
      return viewType.fromAny(value);
    } else {
      return View.fromAny(value) as V;
    }
  };

  ViewControllerSet.prototype.detectControllerView = function <V extends View, C extends Controller>(this: ViewControllerSet<unknown, V, C>, controller: Controller): V | null {
    return null; // hook
  };

  ViewControllerSet.prototype.insertControllerView = function <V extends View, C extends Controller>(this: ViewControllerSet<unknown, V, C>, controller: C, view: V, targetView: View | null, viewKey: string | undefined): void {
    // hook
  };

  ViewControllerSet.prototype.detectController = function <V extends View, C extends Controller>(this: ViewControllerSet<unknown, V, C>, controller: Controller): C | null {
    if (this.detectControllerView(controller) !== null) {
      return controller as C;
    }
    return null;
  };

  ViewControllerSet.prototype.onAttachController = function <V extends View, C extends Controller>(this: ViewControllerSet<unknown, V, C>, controller: C, targetController: Controller | null): void {
    const view = this.detectControllerView(controller);
    if (view !== null) {
      this.associateViewController(view, controller);
      this.attachView(view, targetController);
    }
    ControllerSet.prototype.onAttachController.call(this, controller, targetController);
  };

  ViewControllerSet.prototype.onDetachController = function <V extends View, C extends Controller>(this: ViewControllerSet<unknown, V, C>, controller: C): void {
    ControllerSet.prototype.onDetachController.call(this, controller);
    const view = this.detectControllerView(controller);
    if (view !== null) {
      this.detachView(view);
      this.dissociateViewController(view, controller);
    }
  };

  ViewControllerSet.prototype.createController = function <V extends View, C extends Controller>(this: ViewControllerSet<unknown, V, C>, view?: V): C {
    const controller = _super.prototype.createController.call(this) as C;
    if (view === void 0) {
      view = this.createView();
    }
    this.insertControllerView(controller, view, null, this.viewKey);
    return controller;
  };

  ViewControllerSet.prototype.compare = function <V extends View, C extends Controller>(this: ViewControllerSet<unknown, V, C>, a: C, b: C): number {
    const x = this.detectControllerView(a);
    const y = this.detectControllerView(b);
    if (x !== null && y !== null) {
      return this.compareViews(x, y);
    } else {
      return x !== null ? 1 : y !== null ? -1 : 0;
    }
  };

  ViewControllerSet.prototype.compareViews = function <V extends View, C extends Controller>(this: ViewControllerSet<unknown, V, C>, a: V, b: V): number {
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
  };

  ViewControllerSet.construct = function <F extends ViewControllerSet<any, any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct.call(this, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).viewControllers = {};
    (fastener as Mutable<typeof fastener>).views = {};
    (fastener as Mutable<typeof fastener>).viewCount = 0;
    return fastener;
  };

  ViewControllerSet.refine = function (fastenerClass: ViewControllerSetClass<any>): void {
    _super.refine.call(this, fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "viewKey")) {
      const viewKey = fastenerPrototype.viewKey as string | boolean | undefined;
      if (viewKey === true) {
        Object.defineProperty(fastenerPrototype, "viewKey", {
          value: fastenerClass.name,
          enumerable: true,
          configurable: true,
        });
      } else if (viewKey === false) {
        Object.defineProperty(fastenerPrototype, "viewKey", {
          value: void 0,
          enumerable: true,
          configurable: true,
        });
      }
    }
  };

  return ViewControllerSet;
})(ControllerSet);
