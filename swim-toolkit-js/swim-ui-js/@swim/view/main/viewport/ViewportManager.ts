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

import {ViewContext} from "../ViewContext";
import {View} from "../View";
import {ViewManagerObserverType, ViewManager} from "../manager/ViewManager";
import {ViewIdiom} from "./ViewIdiom";
import {Viewport} from "./Viewport";
import {ViewportContext} from "./ViewportContext";
import {ViewportManagerObserver} from "./ViewportManagerObserver";

export class ViewportManager<V extends View = View> extends ViewManager<V> {
  /** @hidden */
  readonly _viewContext: ViewportContext;
  /** @hidden */
  _reorientationTimer: number;

  constructor() {
    super();
    this.throttleScroll = this.throttleScroll.bind(this);
    this.throttleResize = this.throttleResize.bind(this);
    this.debounceReorientation = this.debounceReorientation.bind(this);
    this.throttleReorientation = this.throttleReorientation.bind(this);

    this._reorientationTimer = 0;
    this._viewContext = this.initViewContext();
  }

  protected initViewContext(): ViewportContext {
    return {
      updateTime: 0,
      viewIdiom: "unspecified",
      viewport: this.detectViewport(),
    };
  }

  get viewContext(): ViewContext {
    return this._viewContext;
  }

  get viewport(): Viewport {
    return this._viewContext.viewport;
  }

  get viewIdiom(): ViewIdiom {
    return this._viewContext.viewIdiom;
  }

  /** @hidden */
  detectViewport(): Viewport {
    return Viewport.detect();
  }

  /** @hidden */
  detectViewIdiom(viewport: Viewport): ViewIdiom | undefined {
    if (viewport.width < 960 || viewport.height < 480) {
      return "mobile";
    } else {
      return "desktop";
    }
  }

  /** @hidden */
  updateViewIdiom(viewport: Viewport): void {
    let viewIdiom = this.willObserve(function (viewManagerObserver: ViewportManagerObserver): void | ViewIdiom {
      if (viewManagerObserver.detectViewIdiom !== void 0) {
        const viewIdiom = viewManagerObserver.detectViewIdiom(viewport!, this);
        if (viewIdiom !== void 0) {
          return viewIdiom;
        }
      }
    });
    if (viewIdiom === void 0) {
      viewIdiom = this.detectViewIdiom(viewport);
    }
    if (viewIdiom !== void 0) {
      this.setViewIdiom(viewIdiom);
    }
  }

  setViewIdiom(newViewIdiom: ViewIdiom): void {
    const viewContext = this._viewContext;
    const oldViewIdiom = viewContext.viewIdiom;
    if (oldViewIdiom !== newViewIdiom) {
      this.willSetViewIdiom(newViewIdiom, oldViewIdiom);
      viewContext.viewIdiom = newViewIdiom;
      this.onSetViewIdiom(newViewIdiom, oldViewIdiom);
      this.didSetViewIdiom(newViewIdiom, oldViewIdiom);
    }
  }

  protected willSetViewIdiom(newViewIdiom: ViewIdiom, oldViewIdiom: ViewIdiom): void {
    this.willObserve(function (viewManagerObserver: ViewportManagerObserver): void {
      if (viewManagerObserver.viewportManagerWillSetViewIdiom !== void 0) {
        viewManagerObserver.viewportManagerWillSetViewIdiom(newViewIdiom, oldViewIdiom, this);
      }
    });
  }

  protected onSetViewIdiom(newViewIdiom: ViewIdiom, oldViewIdiom: ViewIdiom): void {
    const rootViews = this._rootViews;
    for (let i = 0, n = rootViews.length; i < n; i += 1) {
      rootViews[i].requireUpdate(View.NeedsLayout);
    }
  }

  protected didSetViewIdiom(newViewIdiom: ViewIdiom, oldViewIdiom: ViewIdiom): void {
    this.didObserve(function (viewManagerObserver: ViewportManagerObserver): void {
      if (viewManagerObserver.viewportManagerDidSetViewIdiom !== void 0) {
        viewManagerObserver.viewportManagerDidSetViewIdiom(newViewIdiom, oldViewIdiom, this);
      }
    });
  }

  protected willReorient(orientation: OrientationType): void {
    this.willObserve(function (viewManagerObserver: ViewportManagerObserver): void {
      if (viewManagerObserver.viewportManagerWillReorient !== void 0) {
        viewManagerObserver.viewportManagerWillReorient(orientation, this);
      }
    });
  }

  protected onReorient(orientation: OrientationType): void {
    // hook
  }

  protected didReorient(orientation: OrientationType): void {
    this.didObserve(function (viewManagerObserver: ViewportManagerObserver): void {
      if (viewManagerObserver.viewportManagerDidReorient !== void 0) {
        viewManagerObserver.viewportManagerDidReorient(orientation, this);
      }
    });
  }

  // @ts-ignore
  declare readonly viewManagerObservers: ReadonlyArray<ViewportManagerObserver>;

  protected onAddViewManagerObserver(viewManagerObserver: ViewManagerObserverType<this>): void {
    super.onAddViewManagerObserver(viewManagerObserver);
    if (this.isAttached()) {
      this.updateViewIdiom(this.viewport);
    }
  }

  protected onAttach(): void {
    super.onAttach();
    this.attachEvents();
    this.updateViewIdiom(this.viewport);
  }

  protected onDetach(): void {
    this.detachEvents();
    super.onDetach();
  }

  protected attachEvents(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", this.throttleScroll, {passive: true});
      window.addEventListener("resize", this.throttleResize);
      window.addEventListener("orientationchange", this.debounceReorientation);
    }
  }

  protected detachEvents(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", this.throttleScroll);
      window.removeEventListener("resize", this.throttleResize);
      window.removeEventListener("orientationchange", this.debounceReorientation);
    }
  }

  /** @hidden */
  throttleScroll(): void {
    const rootViews = this._rootViews;
    for (let i = 0, n = rootViews.length; i < n; i += 1) {
      rootViews[i].requireUpdate(View.NeedsScroll);
    }
  }

  /** @hidden */
  throttleResize(): void {
    const viewport = this.detectViewport();
    this._viewContext.viewport = viewport;
    this.updateViewIdiom(viewport);

    const rootViews = this._rootViews;
    for (let i = 0, n = rootViews.length; i < n; i += 1) {
      rootViews[i].requireUpdate(View.NeedsResize | View.NeedsLayout);
    }
  }

  /** @hidden */
  protected debounceReorientation(): void {
    if (this._reorientationTimer !== 0) {
      clearTimeout(this._reorientationTimer);
      this._reorientationTimer = 0;
    }
    this._reorientationTimer = setTimeout(this.throttleReorientation, ViewportManager.ReorientationDelay) as any;
  }

  /** @hidden */
  protected throttleReorientation(): void {
    if (this._reorientationTimer !== 0) {
      clearTimeout(this._reorientationTimer);
      this._reorientationTimer = 0;
    }

    const viewport = this.detectViewport();
    this._viewContext.viewport = viewport;
    this.willReorient(viewport.orientation);
    this.updateViewIdiom(viewport);
    this.onReorient(viewport.orientation);
    this.didReorient(viewport.orientation);

    const rootViews = this._rootViews;
    for (let i = 0, n = rootViews.length; i < n; i += 1) {
      rootViews[i].requireUpdate(View.NeedsResize | View.NeedsScroll | View.NeedsLayout);
    }
  }

  /** @hidden */
  static ReorientationDelay: number = 100;

  private static _global?: ViewportManager<any>;
  static global<V extends View>(): ViewportManager<V> {
    if (ViewportManager._global === void 0) {
      ViewportManager._global = new ViewportManager();
    }
    return ViewportManager._global;
  }
}
ViewManager.Viewport = ViewportManager;
