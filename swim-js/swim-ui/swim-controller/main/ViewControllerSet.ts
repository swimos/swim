// Copyright 2015-2023 Nstream, inc.
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
import type {Fastener} from "@swim/component";
import type {ViewFactory} from "@swim/view";
import {View} from "@swim/view";
import type {Controller} from "./Controller";
import type {ControllerSetDescriptor} from "./ControllerSet";
import type {ControllerSetClass} from "./ControllerSet";
import {ControllerSet} from "./ControllerSet";

/** @public */
export interface ViewControllerSetDescriptor<R, V extends View, C extends Controller> extends ControllerSetDescriptor<R, C> {
  extends?: Proto<ViewControllerSet<any, any, any, any>> | boolean | null;
}

/** @public */
export interface ViewControllerSetClass<F extends ViewControllerSet<any, any, any, any> = ViewControllerSet<any, any, any, any>> extends ControllerSetClass<F> {
}

/** @public */
export interface ViewControllerSet<R = any, V extends View = View, C extends Controller = Controller, I extends any[] = [C | null]> extends ControllerSet<R, C, I> {
  /** @override */
  get descriptorType(): Proto<ViewControllerSetDescriptor<R, V, C>>;

  get viewType(): ViewFactory<V> | null;

  /** @protected */
  viewKey(view: V): string | undefined;

  get observesView(): boolean;

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

  addView(view?: V | LikeType<V>, targetController?: Controller | null, controllerKey?: string): V;

  addViews(views: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void;

  setViews(views: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void;

  attachView(view?: V | LikeType<V> | null, targetController?: Controller | null): V;

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

  insertView(parent?: Controller | null, view?: V | LikeType<V>, targetController?: Controller | null, controllerKey?: string): V;

  insertViews(parent: Controller | null, views: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void;

  removeView(view: V): V | null;

  removeViews(views?: {readonly [viewId: string]: V | undefined}): void;

  deleteView(view: V): V | null;

  deleteViews(views?: {readonly [viewId: string]: V | undefined}): void;

  reinsertView(view: V, targetView?: V | null): void;

  createView(): V;

  /** @protected */
  fromViewLike(value: V | LikeType<V>): V;

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
export const ViewControllerSet = (<R, V extends View, C extends Controller, I extends any[], F extends ViewControllerSet<any, any, any, any>>() => ControllerSet.extend<ViewControllerSet<R, V, C, I>, ViewControllerSetClass<F>>("ViewControllerSet", {
  viewType: null,

  viewKey(view: V): string | undefined {
    return void 0;
  },

  observesView: false,

  getViewController(view: V): C | null {
    const controller = this.viewControllers[view.uid];
    return controller !== void 0 ? controller : null;
  },

  associateViewController(view: V, controller: C): void {
    const viewControllers = this.viewControllers as {[viewId: string]: C | undefined};
    viewControllers[view.uid] = controller;
  },

  dissociateViewController(view: V, controller: C): void {
    const viewControllers = this.viewControllers as {[viewId: string]: C | undefined};
    delete viewControllers[view.uid];
  },

  hasView(view: View): boolean {
    return this.views[view.uid] !== void 0;
  },

  addView(newView?: V | LikeType<V>, targetController?: Controller | null, controllerKey?: string): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromViewLike(newView);
    } else {
      newView = this.createView();
    }
    let controller = this.getViewController(newView);
    if (controller === null) {
      controller = this.createController(newView);
    }
    this.addController(controller, targetController, controllerKey);
    return newView;
  },

  addViews(newViews: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void {
    for (const viewId in newViews) {
      this.addView(newViews[viewId]!, targetController);
    }
  },

  setViews(newViews: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void {
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
  },

  attachView(newView?: V | LikeType<V> | null, targetController?: Controller | null): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromViewLike(newView);
    } else {
      newView = this.createView();
    }
    const views = this.views as {[viewId: string]: V | undefined};
    if (views[newView.uid] !== void 0) {
      return newView;
    }
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
    return newView;
  },

  initView(view: V): void {
    // hook
  },

  willAttachView(view: V, targetController: Controller | null): void {
    // hook
  },

  onAttachView(view: V, targetController: Controller | null): void {
    if (this.observesView) {
      view.observe(this as Observes<V>);
    }
  },

  didAttachView(view: V, targetController: Controller | null): void {
    // hook
  },

  attachViews(newViews: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void {
    for (const viewId in newViews) {
      this.attachView(newViews[viewId]!, targetController);
    }
  },

  detachView(oldView: V): V | null {
    const views = this.views as {[viewId: string]: V | undefined};
    if (views[oldView.uid] === void 0) {
      return null;
    }
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

  detachViews(views?: {readonly [viewId: string]: V | undefined}): void {
    if (views === void 0) {
      views = this.views;
    }
    for (const viewId in views) {
      this.detachView(views[viewId]!);
    }
  },

  insertView(parent?: Controller | null, newView?: V | LikeType<V>, targetController?: Controller | null, controllerKey?: string): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromViewLike(newView);
    } else {
      newView = this.createView();
    }
    let controller = this.getViewController(newView);
    if (controller === null) {
      controller = this.createController(newView);
    }
    this.insertController(parent, controller, targetController, controllerKey);
    return newView;
  },

  insertViews(parent: Controller | null, newViews: {readonly [viewId: string]: V | undefined}, targetController?: Controller | null): void {
    for (const viewId in newViews) {
      this.insertView(parent, newViews[viewId]!, targetController);
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

  reinsertView(view: V, targetView: V | null): void {
    const controller = this.getViewController(view);
    if (controller === null) {
      return;
    }
    const targetController = targetView !== null ? this.getViewController(targetView) : null;
    this.reinsertController(controller, targetController);
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

  detectController(controller: Controller): C | null {
    if (this.detectControllerView(controller) !== null) {
      return controller as C;
    }
    return null;
  },

  onAttachController(controller: C, targetController: Controller | null): void {
    const view = this.detectControllerView(controller);
    if (view !== null) {
      this.associateViewController(view, controller);
      this.attachView(view, targetController);
    }
    super.onAttachController(controller, targetController);
  },

  onDetachController(controller: C): void {
    super.onDetachController(controller);
    const view = this.detectControllerView(controller);
    if (view !== null) {
      this.detachView(view);
      this.dissociateViewController(view, controller);
    }
  },

  createController(view?: V): C {
    const controller = super.createController() as C;
    if (view === void 0) {
      view = this.createView();
    }
    const viewKey = this.viewKey(view);
    this.insertControllerView(controller, view, null, viewKey);
    return controller;
  },

  compare(a: C, b: C): number {
    const x = this.detectControllerView(a);
    const y = this.detectControllerView(b);
    if (x !== null && y !== null) {
      return this.compareViews(x, y);
    }
    return x !== null ? 1 : y !== null ? -1 : 0;
  },

  compareViews(a: V, b: V): number {
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).viewControllers = {};
    (fastener as Mutable<typeof fastener>).views = {};
    (fastener as Mutable<typeof fastener>).viewCount = 0;
    return fastener;
  },
}))();
