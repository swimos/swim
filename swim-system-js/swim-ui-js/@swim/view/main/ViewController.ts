// Copyright 2015-2019 SWIM.AI inc.
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

import {Viewport} from "./Viewport";
import {ViewIdiom} from "./ViewIdiom";
import {ViewContext} from "./ViewContext";
import {View} from "./View";
import {ViewObserver} from "./ViewObserver";
import {AppView} from "./AppView";
import {AppViewController} from "./AppViewController";

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

  key(): string | null {
    const view = this._view;
    return view ? view.key() : null;
  }

  viewWillSetKey(key: string | null, view: V): void {
    // hook
  }

  viewDidSetKey(key: string | null, view: V): void {
    // hook
  }

  isMounted(): boolean {
    const view = this._view;
    return view ? view.isMounted() : false;
  }

  get viewport(): Viewport | null {
    const view = this._view;
    return view ? view.viewport : null;
  }

  get viewIdiom(): ViewIdiom {
    const view = this._view;
    return view ? view.viewIdiom : "unspecified";
  }

  get appView(): AppView | null {
    const view = this._view;
    return view ? view.appView : null;
  }

  get appViewController(): AppViewController | null {
    const appView = this.appView;
    return appView ? appView.viewController : null;
  }

  get parentView(): View | null {
    const view = this._view;
    return view ? view.parentView : null;
  }

  get parentViewController(): ViewController | null {
    const parentView = this.parentView;
    return parentView ? parentView.viewController : null;
  }

  viewWillSetParentView(parentView: View | null, view: V): void {
    // hook
  }

  viewDidSetParentView(parentView: View | null, view: V): void {
    // hook
  }

  get childViews(): ReadonlyArray<View> {
    const view = this._view;
    return view ? view.childViews : [];
  }

  get childViewControllers(): ReadonlyArray<ViewController | null> {
    return this.childViews.map(function (view: View): ViewController | null {
      return view.viewController;
    });
  }

  getChildView(key: string): View | null {
    const view = this._view;
    return view ? view.getChildView(key) : null;
  }

  getChildViewController(key: string): ViewController | null {
    const childView = this.getChildView(key);
    return childView ? childView.viewController : null;
  }

  setChildView(key: string, newChildView: View | null): View | null {
    const view = this._view;
    if (view) {
      return view.setChildView(key, newChildView);
    } else {
      throw new Error("no view");
    }
  }

  setChildViewController(key: string, newChildViewController: ViewController | null): ViewController | null {
    const newChildView = newChildViewController ? newChildViewController.view : null;
    if (newChildView !== void 0) {
      const oldChildView = this.setChildView(key, newChildView);
      return oldChildView ? oldChildView.viewController : null;
    } else {
      throw new Error("no view");
    }
  }

  appendChildView(childView: View): void {
    const view = this._view;
    if (view) {
      view.appendChildView(childView);
    } else {
      throw new Error("no view");
    }
  }

  appendChildViewController(childViewController: ViewController): void {
    const childView = childViewController.view;
    if (childView) {
      this.appendChildView(childView);
    } else {
      throw new Error("no view");
    }
  }

  prependChildView(childView: View): void {
    const view = this._view;
    if (view) {
      view.prependChildView(childView);
    } else {
      throw new Error("no view");
    }
  }

  prependChildViewController(childViewController: ViewController): void {
    const childView = childViewController.view;
    if (childView) {
      this.prependChildView(childView);
    } else {
      throw new Error("no view");
    }
  }

  insertChildView(childView: View, targetView: View | null): void {
    const view = this._view;
    if (view) {
      view.insertChildView(childView, targetView);
    } else {
      throw new Error("no view");
    }
  }

  insertChildViewController(childViewController: ViewController,
                            targetViewController: ViewController | View | null): void {
    const childView = childViewController.view;
    let targetView: View | null | undefined;
    if (targetViewController && !(targetViewController instanceof View)) {
      targetView = targetViewController.view;
    } else {
      targetView = targetViewController;
    }
    if (childView && targetView !== void 0) {
      this.insertChildView(childView, targetView);
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

  removeChildView(childView: View): void {
    const view = this._view;
    if (view) {
      view.removeChildView(childView);
    } else {
      throw new Error("no view");
    }
  }

  removeChildViewController(childViewController: ViewController): void {
    const childView = childViewController.view;
    if (childView) {
      this.removeChildView(childView);
    } else {
      throw new Error("no view");
    }
  }

  removeAll(): void {
    const view = this._view;
    if (view) {
      view.removeAll();
    } else {
      throw new Error("no view");
    }
  }

  remove(): void {
    const view = this._view;
    if (view) {
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

  viewWillUpdate(viewContext: ViewContext, view: V): void {
    // hook
  }

  viewDidUpdate(viewContext: ViewContext, view: V): void {
    // hook
  }

  viewWillCompute(viewContext: ViewContext, view: V): void {
    // hook
  }

  viewDidCompute(viewContext: ViewContext, view: V): void {
    // hook
  }

  viewWillLayout(viewContext: ViewContext, view: V): void {
    // hook
  }

  viewDidLayout(viewContext: ViewContext, view: V): void {
    // hook
  }

  viewWillScroll(viewContext: ViewContext, view: V): void {
    // hook
  }

  viewDidScroll(viewContext: ViewContext, view: V): void {
    // hook
  }

  viewWillUpdateChildViews(viewContext: ViewContext, view: V): void {
    // hook
  }

  viewDidUpdateChildViews(viewContext: ViewContext, view: V): void {
    // hook
  }
}
