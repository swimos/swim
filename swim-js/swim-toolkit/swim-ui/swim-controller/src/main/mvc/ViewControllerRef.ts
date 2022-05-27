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
import {ControllerRefDescriptor, ControllerRefClass, ControllerRef} from "../controller/ControllerRef";

/** @public */
export type ViewControllerRefView<F extends ViewControllerRef<any, any, any>> =
  F extends {viewType?: ViewFactory<infer V>} ? V : never;

/** @public */
export type ViewControllerRefController<F extends ViewControllerRef<any, any, any>> =
  F extends {controllerType?: ControllerFactory<infer C>} ? C : never;

/** @public */
export interface ViewControllerRefDescriptor<V extends View = View, C extends Controller = Controller> extends ControllerRefDescriptor<C> {
  extends?: Proto<ViewControllerRef<any, any, any>> | string | boolean | null;
  viewType?: ViewFactory<V>;
  viewKey?: string | boolean;
  observesView?: boolean;
}

/** @public */
export type ViewControllerRefTemplate<F extends ViewControllerRef<any, any, any>> =
  ThisType<F> &
  ViewControllerRefDescriptor<ViewControllerRefView<F>, ViewControllerRefController<F>> &
  Partial<Omit<F, keyof ViewControllerRefDescriptor>>;

/** @public */
export interface ViewControllerRefClass<F extends ViewControllerRef<any, any, any> = ViewControllerRef<any, any, any>> extends ControllerRefClass<F> {
  /** @override */
  specialize(template: ViewControllerRefDescriptor<any, any>): ViewControllerRefClass<F>;

  /** @override */
  refine(fastenerClass: ViewControllerRefClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: ViewControllerRefTemplate<F2>): ViewControllerRefClass<F2>;
  extend<F2 extends F>(className: string, template: ViewControllerRefTemplate<F2>): ViewControllerRefClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: ViewControllerRefTemplate<F2>): ViewControllerRefClass<F2>;
  define<F2 extends F>(className: string, template: ViewControllerRefTemplate<F2>): ViewControllerRefClass<F2>;

  /** @override */
  <F2 extends F>(template: ViewControllerRefTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface ViewControllerRef<O = unknown, V extends View = View, C extends Controller = Controller> extends ControllerRef<O, C> {
  /** @override */
  get fastenerType(): Proto<ViewControllerRef<any, any, any>>;

  /** @internal */
  readonly viewType?: ViewFactory<V>; // optional prototype property

  /** @internal */
  readonly viewKey?: string; // optional prototype property

  readonly view: V | null;

  getView(): V;

  setView(view: AnyView<V> | null, targetView?: View | null, controllerKey?: string): V | null;

  attachView(view?: AnyView<V>, targetView?: View | null): V;

  /** @protected */
  initView(view: V): void;

  /** @protected */
  willAttachView(view: V, targetView: View | null): void;

  /** @protected */
  onAttachView(view: V, targetView: View | null): void;

  /** @protected */
  didAttachView(view: V, targetView: View | null): void;

  detachView(): V | null;

  /** @protected */
  deinitView(view: V): void;

  /** @protected */
  willDetachView(view: V): void;

  /** @protected */
  onDetachView(view: V): void;

  /** @protected */
  didDetachView(view: V): void;

  insertView(controller?: C | null, view?: AnyView<V>, targetView?: View | null, controllerKey?: string): V;

  removeView(): V | null;

  deleteView(): V | null;

  createView(): V;

  /** @internal */
  readonly observesView?: boolean; // optional prototype property

  /** @protected */
  fromAnyView(value: AnyView<V>): V;

  /** @protected */
  detectControllerView(controller: Controller): V | null;

  /** @protected */
  insertControllerView(controller: C, view: V | null, targetView: View | null, viewKey: string | undefined): void;

  /** @protected @override */
  onAttachController(controller: C, targetController: Controller | null): void;

  /** @protected @override */
  onDetachController(controller: C): void;

  /** @override */
  createController(view?: V): C;
}

/** @public */
export const ViewControllerRef = (function (_super: typeof ControllerRef) {
  const ViewControllerRef = _super.extend("ViewControllerRef", {}) as ViewControllerRefClass;

  Object.defineProperty(ViewControllerRef.prototype, "fastenerType", {
    value: ViewControllerRef,
    configurable: true,
  });

  ViewControllerRef.prototype.getView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>): V {
    const view = this.view;
    if (view === null) {
      let message = view + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "view";
      throw new TypeError(message);
    }
    return view;
  };

  ViewControllerRef.prototype.setView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, newView: AnyView<V> | null, targetView?: View | null, controllerKey?: string): V | null {
    if (newView !== null) {
      newView = this.fromAnyView(newView);
    }
    let oldView = this.view;
    if (oldView !== newView) {
      if (targetView === void 0) {
        targetView = null;
      }
      let controller = this.controller;
      if (controller === null && newView !== null) {
        controller = this.createController(newView);
        this.setController(controller, null, controllerKey);
      }
      if (controller !== null) {
        if (oldView !== null) {
          if (targetView === null) {
            targetView = oldView.nextSibling;
          }
          oldView.remove();
        }
        if (newView !== null) {
          this.insertControllerView(controller, newView, targetView, this.viewKey);
        }
        oldView = this.view;
      }
      if (oldView !== newView) {
        if (oldView !== null) {
          (this as Mutable<typeof this>).view = null;
          this.willDetachView(oldView);
          this.onDetachView(oldView);
          this.deinitView(oldView);
          this.didDetachView(oldView);
        }
        if (newView !== null) {
          (this as Mutable<typeof this>).view = newView;
          this.willAttachView(newView, targetView);
          this.onAttachView(newView, targetView);
          this.initView(newView);
          this.didAttachView(newView, targetView);
        }
      }
    }
    return oldView;
  };

  ViewControllerRef.prototype.attachView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, newView?: AnyView<V>, targetView?: View | null): V {
    let oldView = this.view;
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAnyView(newView);
    } else if (oldView === null) {
      newView = this.createView();
    } else {
      newView = oldView;
    }
    if (targetView === void 0) {
      targetView = null;
    }
    let controller = this.controller;
    if (controller === null) {
      controller = this.createController(newView);
      this.attachController(controller);
      oldView = this.view;
    }
    if (oldView !== newView) {
      if (oldView !== null) {
        (this as Mutable<typeof this>).view = null;
        this.willDetachView(oldView);
        this.onDetachView(oldView);
        this.deinitView(oldView);
        this.didDetachView(oldView);
      }
      (this as Mutable<typeof this>).view = newView;
      this.willAttachView(newView, targetView);
      this.onAttachView(newView, targetView);
      this.initView(newView);
      this.didAttachView(newView, targetView);
    }
    return newView;
  };

  ViewControllerRef.prototype.initView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, view: V): void {
    // hook
  };

  ViewControllerRef.prototype.willAttachView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, view: V, targetView: View | null): void {
    // hook
  };

  ViewControllerRef.prototype.onAttachView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, view: V, targetView: View | null): void {
    if (this.observesView === true) {
      view.observe(this as Observes<V>);
    }
  };

  ViewControllerRef.prototype.didAttachView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, view: V, targetView: View | null): void {
    // hook
  };

  ViewControllerRef.prototype.detachView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>): V | null {
    const oldView = this.view;
    if (oldView !== null) {
      (this as Mutable<typeof this>).view = null;
      this.willDetachView(oldView);
      this.onDetachView(oldView);
      this.deinitView(oldView);
      this.didDetachView(oldView);
    }
    return oldView;
  };

  ViewControllerRef.prototype.deinitView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, view: V): void {
    // hook
  };

  ViewControllerRef.prototype.willDetachView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, view: V): void {
    // hook
  };

  ViewControllerRef.prototype.onDetachView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, view: V): void {
    if (this.observesView === true) {
      view.unobserve(this as Observes<V>);
    }
  };

  ViewControllerRef.prototype.didDetachView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, view: V): void {
    // hook
  };

  ViewControllerRef.prototype.insertView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, controller?: C | null, newView?: AnyView<V>, targetView?: View | null, controllerKey?: string): V {
    let oldView = this.view;
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAnyView(newView);
    } else if (oldView === null) {
      newView = this.createView();
    } else {
      newView = oldView;
    }
    if (controller === void 0) {
      controller = null;
    }
    if (oldView !== newView || controller !== null) {
      if (targetView === void 0) {
        targetView = null;
      }
      if (controller === null) {
        controller = this.createController(newView);
        this.insertController(null, controller);
      }
      if (controller !== null) {
        this.insertControllerView(controller, newView, targetView, this.viewKey);
      }
      oldView = this.view;
      if (oldView !== newView) {
        if (oldView !== null) {
          (this as Mutable<typeof this>).view = null;
          this.willDetachView(oldView);
          this.onDetachView(oldView);
          this.deinitView(oldView);
          this.didDetachView(oldView);
          oldView.remove();
        }
        (this as Mutable<typeof this>).view = newView;
        this.willAttachView(newView, targetView);
        this.onAttachView(newView, targetView);
        this.initView(newView);
        this.didAttachView(newView, targetView);
      }
    }
    return newView;
  };

  ViewControllerRef.prototype.removeView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>): V | null {
    const view = this.view;
    if (view !== null) {
      view.remove();
    }
    return view;
  };

  ViewControllerRef.prototype.deleteView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>): V | null {
    const view = this.detachView();
    if (view !== null) {
      view.remove();
    }
    return view;
  };

  ViewControllerRef.prototype.createView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>): V {
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

  ViewControllerRef.prototype.fromAnyView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, value: AnyView<V>): V {
    const viewType = this.viewType;
    if (viewType !== void 0) {
      return viewType.fromAny(value);
    } else {
      return View.fromAny(value) as V;
    }
  };

  ViewControllerRef.prototype.detectControllerView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, controller: Controller): V | null {
    return null; // hook
  };

  ViewControllerRef.prototype.insertControllerView = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, controller: C, view: V, targetView: View | null, viewKey: string | undefined): void {
    // hook
  };

  ViewControllerRef.prototype.onAttachController = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, controller: C, targetController: Controller | null): void {
    const view = this.detectControllerView(controller);
    if (view !== null) {
      const targetView = targetController !== null ? this.detectControllerView(targetController) : null;
      this.attachView(view, targetView);
    }
    ControllerRef.prototype.onAttachController.call(this, controller, targetController);
  };

  ViewControllerRef.prototype.onDetachController = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, controller: C): void {
    ControllerRef.prototype.onDetachController.call(this, controller);
    const view = this.detectControllerView(controller);
    if (view !== null && view === this.view) {
      this.detachView();
    }
  };

  ViewControllerRef.prototype.createController = function <V extends View, C extends Controller>(this: ViewControllerRef<unknown, V, C>, view?: V): C {
    const controller = _super.prototype.createController.call(this) as C;
    if (view === void 0) {
      view = this.createView();
    }
    this.insertControllerView(controller, view, null, this.viewKey);
    return controller;
  };

  ViewControllerRef.construct = function <F extends ViewControllerRef<any, any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct.call(this, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).view = null;
    return fastener;
  };

  ViewControllerRef.refine = function (fastenerClass: ViewControllerRefClass<any>): void {
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

  return ViewControllerRef;
})(ControllerRef);
