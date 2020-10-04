// Copyright 2015-2020 Swim inc.
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

import {ViewContextType, ViewContext} from "./ViewContext";
import {ViewFlags, View} from "./View";
import {ViewObserver} from "./ViewObserver";
import {ViewIdiom} from "./viewport/ViewIdiom";
import {Viewport} from "./viewport/Viewport";

export type ViewControllerType<V extends View> =
  V extends {readonly viewController: infer VC} ? VC : unknown;

export class ViewController<V extends View = View> implements ViewObserver<V> {
  /** @hidden */
  protected _view: V | null;

  constructor() {
    this._view = null;
  }

  get view(): V | null {
    return this._view;
  }

  setView(view: V | null): void {
    this.willSetView(view);
    this._view = view;
    this.onSetView(view);
    this.didSetView(view);
  }

  protected willSetView(view: V | null): void {
    // hook
  }

  protected onSetView(view: V | null): void {
    // hook
  }

  protected didSetView(view: V | null): void {
    // hook
  }

  get key(): string | undefined {
    const view = this._view;
    return view !== null ? view.key : void 0;
  }

  get parentView(): View | null {
    const view = this._view;
    return view !== null ? view.parentView : null;
  }

  get parentViewController(): ViewController | null {
    const parentView = this.parentView;
    return parentView !== null ? parentView.viewController : null;
  }

  viewWillSetParentView(newParentView: View | null, oldParentView: View | null, view: V): void {
    // hook
  }

  viewDidSetParentView(newParentView: View | null, oldParentView: View | null, view: V): void {
    // hook
  }

  get childViews(): ReadonlyArray<View> {
    const view = this._view;
    return view !== null ? view.childViews : [];
  }

  get childViewControllers(): ReadonlyArray<ViewController | null> {
    return this.childViews.map(function (view: View): ViewController | null {
      return view.viewController;
    });
  }

  getChildView(key: string): View | null {
    const view = this._view;
    return view !== null ? view.getChildView(key) : null;
  }

  getChildViewController(key: string): ViewController | null {
    const childView = this.getChildView(key);
    return childView !== null ? childView.viewController : null;
  }

  setChildView(key: string, newChildView: View | null): View | null {
    const view = this._view;
    if (view !== null) {
      return view.setChildView(key, newChildView);
    } else {
      throw new Error("no view");
    }
  }

  setChildViewController(key: string, newChildViewController: ViewController | null): ViewController | null {
    const newChildView = newChildViewController !== null ? newChildViewController.view : null;
    if (newChildView !== null) {
      const oldChildView = this.setChildView(key, newChildView);
      return oldChildView !== null ? oldChildView.viewController : null;
    } else {
      throw new Error("no view");
    }
  }

  appendChildView(childView: View, key?: string): void {
    const view = this._view;
    if (view !== null) {
      view.appendChildView(childView, key);
    } else {
      throw new Error("no view");
    }
  }

  appendChildViewController(childViewController: ViewController, key?: string): void {
    const view = this._view;
    const childView = childViewController.view;
    if (view !== null && childView !== null) {
      view.appendChildView(childView, key);
    } else {
      throw new Error("no view");
    }
  }

  prependChildView(childView: View, key?: string): void {
    const view = this._view;
    if (view !== null) {
      view.prependChildView(childView, key);
    } else {
      throw new Error("no view");
    }
  }

  prependChildViewController(childViewController: ViewController, key?: string): void {
    const view = this._view;
    const childView = childViewController.view;
    if (view !== null && childView !== null) {
      view.prependChildView(childView, key);
    } else {
      throw new Error("no view");
    }
  }

  insertChildView(childView: View, targetView: View | null, key?: string): void {
    const view = this._view;
    if (view !== null) {
      view.insertChildView(childView, targetView, key);
    } else {
      throw new Error("no view");
    }
  }

  insertChildViewController(childViewController: ViewController,
                            targetViewController: ViewController | View | null,
                            key?: string): void {
    const view = this._view;
    const childView = childViewController.view;
    if (view !== null && childView !== null) {
      let targetView: View | null;
      if (targetViewController !== null && !(targetViewController instanceof View)) {
        targetView = targetViewController.view;
      } else {
        targetView = targetViewController;
      }
      view.insertChildView(childView, targetView, key);
    } else {
      throw new Error("no view");
    }
  }

  viewWillInsertChildView(childView: View, targetView: View | null | undefined, view: V): void {
    // hook
  }

  viewDidInsertChildView(childView: View, targetView: View | null | undefined, view: V): void {
    // hook
  }

  removeChildView(key: string): View | null;
  removeChildView(childView: View): void;
  removeChildView(key: string | View): View | null | void {
    const view = this._view;
    if (view !== null) {
      if (typeof key === "string") {
        return view.removeChildView(key);
      } else {
        view.removeChildView(key);
      }
    } else {
      throw new Error("no view");
    }
  }

  removeChildViewController(key: string): ViewController | null;
  removeChildViewController(childViewController: ViewController): void;
  removeChildViewController(childViewController: string | ViewController): ViewController | null | void {
    const view = this._view;
    if (view !== null) {
      if (typeof childViewController === "string") {
        const childView = view.removeChildView(childViewController);
        return childView !== null ? childView.viewController : null;
      } else {
        const childView = childViewController.view;
        if (childView !== null) {
          view.removeChildView(childView);
        } else {
          throw new Error("no view");
        }
      }
    } else {
      throw new Error("no view");
    }
  }

  removeAll(): void {
    const view = this._view;
    if (view !== null) {
      view.removeAll();
    } else {
      throw new Error("no view");
    }
  }

  remove(): void {
    const view = this._view;
    if (view !== null) {
      view.remove();
    } else {
      throw new Error("no view");
    }
  }

  viewWillRemoveChildView(childView: View, view: V): void {
    // hook
  }

  viewDidRemoveChildView(childView: View, view: V): void {
    // hook
  }

  getSuperView<V extends View>(viewClass: {new(...args: any[]): V}): V | null {
    const view = this._view;
    return view !== null ? view.getSuperView(viewClass) : null;
  }

  getBaseView<V extends View>(viewClass: {new(...args: any[]): V}): V | null {
    const view = this._view;
    return view !== null ? view.getBaseView(viewClass) : null;
  }

  isMounted(): boolean {
    const view = this._view;
    return view !== null && view.isMounted();
  }

  viewWillMount(view: V): void {
    // hook
  }

  viewDidMount(view: V): void {
    // hook
  }

  viewWillUnmount(view: V): void {
    // hook
  }

  viewDidUnmount(view: V): void {
    // hook
  }

  isPowered(): boolean {
    const view = this._view;
    return view !== null && view.isPowered();
  }

  viewWillPower(view: V): void {
    // hook
  }

  viewDidPower(view: V): void {
    // hook
  }

  viewWillUnpower(view: V): void {
    // hook
  }

  viewDidUnpower(view: V): void {
    // hook
  }

  isCulled(): boolean {
    const view = this._view;
    return view !== null && view.isCulled();
  }

  viewWillCull(view: V): void {
    // hook
  }

  viewDidCull(view: V): void {
    // hook
  }

  viewWillUncull(view: V): void {
    // hook
  }

  viewDidUncull(view: V): void {
    // hook
  }

  isTraversing(): boolean {
    const view = this._view;
    return view !== null && view.isTraversing();
  }

  isUpdating(): boolean {
    const view = this._view;
    return view !== null && view.isUpdating();
  }

  isProcessing(): boolean {
    const view = this._view;
    return view !== null && view.isProcessing();
  }

  viewWillProcess(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewDidProcess(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewWillResize(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewDidResize(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewWillScroll(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewDidScroll(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewWillChange(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewDidChange(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewWillAnimate(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewDidAnimate(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewWillLayout(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewDidLayout(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewWillProcessChildViews(processFlags: ViewFlags, viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewDidProcessChildViews(processFlags: ViewFlags, viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  isDisplaying(): boolean {
    const view = this._view;
    return view !== null && view.isDisplaying();
  }

  viewWillDisplay(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewDidDisplay(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewWillDisplayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewDidDisplayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  get viewContext(): ViewContext {
    const view = this._view;
    return view !== null ? view.viewContext : ViewContext.default();
  }

  get viewIdiom(): ViewIdiom {
    return this.viewContext.viewIdiom;
  }

  get viewport(): Viewport {
    return this.viewContext.viewport;
  }
}
