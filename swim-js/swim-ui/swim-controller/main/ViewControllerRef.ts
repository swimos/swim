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
import type {Observes} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {ViewFactory} from "@swim/view";
import {View} from "@swim/view";
import type {Controller} from "./Controller";
import type {ControllerRefDescriptor} from "./ControllerRef";
import type {ControllerRefClass} from "./ControllerRef";
import {ControllerRef} from "./ControllerRef";

/** @public */
export interface ViewControllerRefDescriptor<R, V extends View, C extends Controller> extends ControllerRefDescriptor<R, C> {
  extends?: Proto<ViewControllerRef<any, any, any, any>> | boolean | null;
  viewKey?: string | boolean;
}

/** @public */
export interface ViewControllerRefClass<F extends ViewControllerRef<any, any, any, any> = ViewControllerRef<any, any, any, any>> extends ControllerRefClass<F> {
}

/** @public */
export interface ViewControllerRef<R = any, V extends View = View, C extends Controller = Controller, I extends any[] = [C | null]> extends ControllerRef<R, C, I> {
  /** @override */
  get descriptorType(): Proto<ViewControllerRefDescriptor<R, V, C>>;

  set(viewOrController: V | C | LikeType<C> | Fastener<any, I[0], any> | null): R;

  setIntrinsic(viewOrController: V | C | LikeType<C> | Fastener<any, I[0], any> | null): R;

  get viewType(): ViewFactory<V> | null;

  get viewKey(): string | undefined;

  get observesView(): boolean;

  readonly view: V | null;

  getView(): V;

  setView(view: V | LikeType<V> | null, targetView?: View | null, controllerKey?: string): V | null;

  attachView(view?: V | LikeType<V> | null, targetView?: View | null): V;

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

  insertView(controller?: C | null, view?: V | LikeType<V>, targetView?: View | null, controllerKey?: string): V;

  removeView(): V | null;

  deleteView(): V | null;

  createView(): V;

  /** @protected */
  fromViewLike(value: V | LikeType<V>): V;

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
export const ViewControllerRef = (<R, V extends View, C extends Controller, I extends any[], F extends ViewControllerRef<any, any, any, any>>() => ControllerRef.extend<ViewControllerRef<R, V, C, I>, ViewControllerRefClass<F>>("ViewControllerRef", {
  set(viewOrController: V | C | LikeType<C> | Fastener<any, I[0], any> | null): R {
    if (viewOrController instanceof Fastener) {
      this.bindInlet(viewOrController);
    } else if (viewOrController instanceof View) {
      this.setView(viewOrController);
    } else {
      this.setController(viewOrController);
    }
    return this.owner;
  },

  setIntrinsic(viewOrController: V | C | LikeType<C> | Fastener<any, I[0], any> | null): R {
    if (viewOrController instanceof Fastener) {
      this.bindInlet(viewOrController);
    } else if (viewOrController instanceof View) {
      this.setView(viewOrController);
    } else {
      this.setController(viewOrController);
    }
    return this.owner;
  },

  viewType: null,

  viewKey: void 0,

  observesView: false,

  getView(): V {
    const view = this.view;
    if (view === null) {
      let message = view + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "view";
      throw new TypeError(message);
    }
    return view;
  },

  setView(newView: V | LikeType<V> | null, targetView?: View | null, controllerKey?: string): V | null {
    if (newView !== null) {
      newView = this.fromViewLike(newView);
    }
    let oldView = this.view;
    if (oldView === newView) {
      return oldView;
    } else if (targetView === void 0) {
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
      if (oldView === newView) {
        return oldView;
      }
    }
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
    return oldView;
  },

  attachView(newView?: V | LikeType<V> | null, targetView?: View | null): V {
    let oldView = this.view;
    if (newView !== void 0 && newView !== null) {
      newView = this.fromViewLike(newView);
    } else if (oldView === null) {
      newView = this.createView();
    } else {
      newView = oldView;
    }
    let controller = this.controller;
    if (controller === null) {
      controller = this.createController(newView);
      this.attachController(controller);
      oldView = this.view;
    }
    if (targetView === void 0) {
      targetView = null;
    }
    if (oldView === newView) {
      return newView;
    } else if (oldView !== null) {
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
    return newView;
  },

  initView(view: V): void {
    // hook
  },

  willAttachView(view: V, targetView: View | null): void {
    // hook
  },

  onAttachView(view: V, targetView: View | null): void {
    if (this.observesView) {
      view.observe(this as Observes<V>);
    }
  },

  didAttachView(view: V, targetView: View | null): void {
    // hook
  },

  detachView(): V | null {
    const oldView = this.view;
    if (oldView === null) {
      return null;
    }
    (this as Mutable<typeof this>).view = null;
    this.willDetachView(oldView);
    this.onDetachView(oldView);
    this.deinitView(oldView);
    this.didDetachView(oldView);
    return oldView;
  },

  deinitView(view: V): void {
    // hook
  },

  willDetachView(view: V): void {
    // hook
  },

  onDetachView(view: V): void {
    if (this.observesView) {
      view.unobserve(this as Observes<V>);
    }
  },

  didDetachView(view: V): void {
    // hook
  },

  insertView(controller?: C | null, newView?: V | LikeType<V>, targetView?: View | null, controllerKey?: string): V {
    let oldView = this.view;
    if (newView !== void 0 && newView !== null) {
      newView = this.fromViewLike(newView);
    } else if (oldView === null) {
      newView = this.createView();
    } else {
      newView = oldView;
    }
    if (controller === void 0) {
      controller = null;
    }
    if (oldView === newView && controller === null) {
      return newView;
    }
    if (controller === null) {
      controller = this.createController(newView);
      this.insertController(null, controller);
    }
    if (targetView === void 0) {
      targetView = null;
    }
    if (controller !== null) {
      this.insertControllerView(controller, newView, targetView, this.viewKey);
    }
    oldView = this.view;
    if (oldView === newView) {
      return newView;
    } else if (oldView !== null) {
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
    return newView;
  },

  removeView(): V | null {
    const view = this.view;
    if (view === null) {
      return null;
    }
    view.remove();
    return view;
  },

  deleteView(): V | null {
    const view = this.detachView();
    if (view === null) {
      return null;
    }
    view.remove();
    return view;
  },

  createView(): V {
    let view: V | undefined;
    const viewType = this.viewType;
    if (viewType !== null) {
      view = viewType.create();
    }
    if (view === void 0 || view === null) {
      let message = "unable to create ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "view";
      throw new Error(message);
    }
    return view;
  },

  fromViewLike(value: V | LikeType<V>): V {
    const viewType = this.viewType;
    if (viewType !== null) {
      return viewType.fromLike(value);
    }
    return View.fromLike(value) as V;
  },

  detectControllerView(controller: Controller): V | null {
    return null; // hook
  },

  insertControllerView(controller: C, view: V, targetView: View | null, viewKey: string | undefined): void {
    // hook
  },

  onAttachController(controller: C, targetController: Controller | null): void {
    const view = this.detectControllerView(controller);
    if (view !== null) {
      const targetView = targetController !== null ? this.detectControllerView(targetController) : null;
      this.attachView(view, targetView);
    }
    super.onAttachController(controller, targetController);
  },

  onDetachController(controller: C): void {
    super.onDetachController(controller);
    const view = this.detectControllerView(controller);
    if (view !== null && view === this.view) {
      this.detachView();
    }
  },

  createController(view?: V): C {
    const controller = super.createController() as C;
    if (view === void 0) {
      view = this.createView();
    }
    this.insertControllerView(controller, view, null, this.viewKey);
    return controller;
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).view = null;
    return fastener;
  },

  refine(fastenerClass: FastenerClass<ViewControllerRef<any, any, any, any>>): void {
    super.refine(fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    const viewKeyDescriptor = Object.getOwnPropertyDescriptor(fastenerPrototype, "viewKey");
    if (viewKeyDescriptor !== void 0 && "value" in viewKeyDescriptor) {
      if (viewKeyDescriptor.value === true) {
        viewKeyDescriptor.value = fastenerClass.name;
        Object.defineProperty(fastenerPrototype, "viewKey", viewKeyDescriptor);
      } else if (viewKeyDescriptor.value === false) {
        viewKeyDescriptor.value = void 0;
        Object.defineProperty(fastenerPrototype, "viewKey", viewKeyDescriptor);
      }
    }
  },
}))();
