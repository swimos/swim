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

import {Arrays} from "@swim/util";
import type {View} from "../View";
import type {ViewManagerObserverType, ViewManagerObserver} from "./ViewManagerObserver";

export abstract class ViewManager<V extends View = View> {
  constructor() {
    Object.defineProperty(this, "rootViews", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "viewManagerObservers", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
  }

  readonly viewManagerObservers!: ReadonlyArray<ViewManagerObserver>;

  addViewManagerObserver(viewManagerObserver: ViewManagerObserverType<this>): void {
    const oldViewManagerObservers = this.viewManagerObservers;
    const newViewManagerObservers = Arrays.inserted(viewManagerObserver, oldViewManagerObservers);
    if (oldViewManagerObservers !== newViewManagerObservers) {
      this.willAddViewManagerObserver(viewManagerObserver);
      Object.defineProperty(this, "viewManagerObservers", {
        value: newViewManagerObservers,
        enumerable: true,
        configurable: true,
      });
      this.onAddViewManagerObserver(viewManagerObserver);
      this.didAddViewManagerObserver(viewManagerObserver);
    }
  }

  protected willAddViewManagerObserver(viewManagerObserver: ViewManagerObserverType<this>): void {
    // hook
  }

  protected onAddViewManagerObserver(viewManagerObserver: ViewManagerObserverType<this>): void {
    // hook
  }

  protected didAddViewManagerObserver(viewManagerObserver: ViewManagerObserverType<this>): void {
    // hook
  }

  removeViewManagerObserver(viewManagerObserver: ViewManagerObserverType<this>): void {
    const oldViewManagerObservers = this.viewManagerObservers;
    const newViewManagerObservers = Arrays.removed(viewManagerObserver, oldViewManagerObservers);
    if (oldViewManagerObservers !== newViewManagerObservers) {
      this.willRemoveViewManagerObserver(viewManagerObserver);
      Object.defineProperty(this, "viewManagerObservers", {
        value: newViewManagerObservers,
        enumerable: true,
        configurable: true,
      });
      this.onRemoveViewManagerObserver(viewManagerObserver);
      this.didRemoveViewManagerObserver(viewManagerObserver);
    }
  }

  protected willRemoveViewManagerObserver(viewManagerObserver: ViewManagerObserverType<this>): void {
    // hook
  }

  protected onRemoveViewManagerObserver(viewManagerObserver: ViewManagerObserverType<this>): void {
    // hook
  }

  protected didRemoveViewManagerObserver(viewManagerObserver: ViewManagerObserverType<this>): void {
    // hook
  }

  protected willObserve<T>(callback: (this: this, viewManagerObserver: ViewManagerObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const viewManagerObservers = this.viewManagerObservers;
    for (let i = 0, n = viewManagerObservers.length; i < n; i += 1) {
      const viewManagerObserver = viewManagerObservers[i]!;
      result = callback.call(this, viewManagerObserver as ViewManagerObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, viewManagerObserver: ViewManagerObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const viewManagerObservers = this.viewManagerObservers;
    for (let i = 0, n = viewManagerObservers.length; i < n; i += 1) {
      const viewManagerObserver = viewManagerObservers[i]!;
      result = callback.call(this, viewManagerObserver as ViewManagerObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  isAttached(): boolean {
    return this.rootViews.length !== 0;
  }

  protected willAttach(): void {
    const viewManagerObservers = this.viewManagerObservers;
    for (let i = 0, n = viewManagerObservers.length; i < n; i += 1) {
      const viewManagerObserver = viewManagerObservers[i]!;
      if (viewManagerObserver.viewManagerWillAttach !== void 0) {
        viewManagerObserver.viewManagerWillAttach(this);
      }
    }
  }

  protected onAttach(): void {
    // hook
  }

  protected didAttach(): void {
    const viewManagerObservers = this.viewManagerObservers;
    for (let i = 0, n = viewManagerObservers.length; i < n; i += 1) {
      const viewManagerObserver = viewManagerObservers[i]!;
      if (viewManagerObserver.viewManagerDidAttach !== void 0) {
        viewManagerObserver.viewManagerDidAttach(this);
      }
    }
  }

  protected willDetach(): void {
    const viewManagerObservers = this.viewManagerObservers;
    for (let i = 0, n = viewManagerObservers.length; i < n; i += 1) {
      const viewManagerObserver = viewManagerObservers[i]!;
      if (viewManagerObserver.viewManagerWillDetach !== void 0) {
        viewManagerObserver.viewManagerWillDetach(this);
      }
    }
  }

  protected onDetach(): void {
    // hook
  }

  protected didDetach(): void {
    const viewManagerObservers = this.viewManagerObservers;
    for (let i = 0, n = viewManagerObservers.length; i < n; i += 1) {
      const viewManagerObserver = viewManagerObservers[i]!;
      if (viewManagerObserver.viewManagerDidDetach !== void 0) {
        viewManagerObserver.viewManagerDidDetach(this);
      }
    }
  }

  readonly rootViews!: ReadonlyArray<V>;

  insertRootView(rootView: V): void {
    const oldRootViews = this.rootViews;
    const newRootViews = Arrays.inserted(rootView, oldRootViews);
    if (oldRootViews !== newRootViews) {
      const needsAttach = oldRootViews.length === 0;
      if (needsAttach) {
        this.willAttach();
      }
      this.willInsertRootView(rootView);
      Object.defineProperty(this, "rootViews", {
        value: newRootViews,
        enumerable: true,
        configurable: true,
      });
      if (needsAttach) {
        this.onAttach();
      }
      this.onInsertRootView(rootView);
      this.didInsertRootView(rootView);
      if (needsAttach) {
        this.didAttach();
      }
    }
  }

  protected willInsertRootView(rootView: V): void {
    const viewManagerObservers = this.viewManagerObservers;
    for (let i = 0, n = viewManagerObservers.length; i < n; i += 1) {
      const viewManagerObserver = viewManagerObservers[i]!;
      if (viewManagerObserver.viewManagerWillInsertRootView !== void 0) {
        viewManagerObserver.viewManagerWillInsertRootView(rootView, this);
      }
    }
  }

  protected onInsertRootView(rootView: V): void {
    // hook
  }

  protected didInsertRootView(rootView: V): void {
    const viewManagerObservers = this.viewManagerObservers;
    for (let i = 0, n = viewManagerObservers.length; i < n; i += 1) {
      const viewManagerObserver = viewManagerObservers[i]!;
      if (viewManagerObserver.viewManagerDidInsertRootView !== void 0) {
        viewManagerObserver.viewManagerDidInsertRootView(rootView, this);
      }
    }
  }

  removeRootView(rootView: V): void {
    const oldRootViews = this.rootViews;
    const newRootViews = Arrays.removed(rootView, oldRootViews);
    if (oldRootViews !== newRootViews) {
      const needsDetach = oldRootViews.length === 1;
      if (needsDetach) {
        this.willDetach();
      }
      this.willRemoveRootView(rootView);
      Object.defineProperty(this, "rootViews", {
        value: newRootViews,
        enumerable: true,
        configurable: true,
      });
      if (needsDetach) {
        this.onDetach();
      }
      this.onRemoveRootView(rootView);
      this.didRemoveRootView(rootView);
      if (needsDetach) {
        this.didDetach();
      }
    }
  }

  protected willRemoveRootView(rootView: V): void {
    const viewManagerObservers = this.viewManagerObservers;
    for (let i = 0, n = viewManagerObservers.length; i < n; i += 1) {
      const viewManagerObserver = viewManagerObservers[i]!;
      if (viewManagerObserver.viewManagerWillRemoveRootView !== void 0) {
        viewManagerObserver.viewManagerWillRemoveRootView(rootView, this);
      }
    }
  }

  protected onRemoveRootView(rootView: V): void {
    // hook
  }

  protected didRemoveRootView(rootView: V): void {
    const viewManagerObservers = this.viewManagerObservers;
    for (let i = 0, n = viewManagerObservers.length; i < n; i += 1) {
      const viewManagerObserver = viewManagerObservers[i]!;
      if (viewManagerObserver.viewManagerDidRemoveRootView !== void 0) {
        viewManagerObserver.viewManagerDidRemoveRootView(rootView, this);
      }
    }
  }
}
