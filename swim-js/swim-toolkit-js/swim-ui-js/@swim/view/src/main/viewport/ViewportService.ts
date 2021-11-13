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

import {Mutable, Class, Lazy, ObserverType, Service} from "@swim/util";
import {R2Box} from "@swim/math";
import type {ViewIdiom} from "./ViewIdiom";
import {Viewport} from "./Viewport";
import type {ViewportServiceObserver} from "./ViewportServiceObserver";
import {ViewContext} from "../view/ViewContext";
import {View} from "../"; // forward import

export class ViewportService<V extends View = View> extends Service<V> {
  constructor() {
    super();
    this.viewContext = ViewContext.create();
    this.viewportResizeTimer = 0;
    this.reorientationTimer = 0;

    this.throttleScroll = this.throttleScroll.bind(this);
    this.throttleResize = this.throttleResize.bind(this);
    this.debounceViewportResize = this.debounceViewportResize.bind(this);
    this.throttleViewportResize = this.throttleViewportResize.bind(this);
    this.debounceReorientation = this.debounceReorientation.bind(this);
    this.throttleReorientation = this.throttleReorientation.bind(this);
  }

  override readonly observerType?: Class<ViewportServiceObserver<V>>;

  readonly viewContext: ViewContext;

  get viewport(): Viewport {
    return this.viewContext.viewport;
  }

  get viewIdiom(): ViewIdiom {
    return this.viewContext.viewIdiom;
  }

  /** @internal */
  detectViewIdiom(viewport: Viewport): ViewIdiom | undefined {
    if (viewport.width < 960 || viewport.height < 480) {
      return "mobile";
    } else {
      return "desktop";
    }
  }

  /** @internal */
  updateViewIdiom(viewport: Viewport): void {
    let viewIdiom: ViewIdiom | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.detectViewIdiom !== void 0) {
        viewIdiom = observer.detectViewIdiom(viewport, this) as ViewIdiom | undefined;
        if (viewIdiom !== void 0) {
          break;
        }
      }
    }
    if (viewIdiom === void 0) {
      viewIdiom = this.detectViewIdiom(viewport);
    }
    if (viewIdiom !== void 0) {
      this.setViewIdiom(viewIdiom);
    }
  }

  setViewIdiom(newViewIdiom: ViewIdiom): void {
    const viewContext = this.viewContext;
    const oldViewIdiom = viewContext.viewIdiom;
    if (oldViewIdiom !== newViewIdiom) {
      this.willSetViewIdiom(newViewIdiom, oldViewIdiom);
      (viewContext as Mutable<ViewContext>).viewIdiom = newViewIdiom;
      this.onSetViewIdiom(newViewIdiom, oldViewIdiom);
      this.didSetViewIdiom(newViewIdiom, oldViewIdiom);
    }
  }

  protected willSetViewIdiom(newViewIdiom: ViewIdiom, oldViewIdiom: ViewIdiom): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillSetViewIdiom !== void 0) {
        observer.serviceWillSetViewIdiom(newViewIdiom, oldViewIdiom, this);
      }
    }
  }

  protected onSetViewIdiom(newViewIdiom: ViewIdiom, oldViewIdiom: ViewIdiom): void {
    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      roots[i]!.requireUpdate(View.NeedsLayout);
    }
  }

  protected didSetViewIdiom(newViewIdiom: ViewIdiom, oldViewIdiom: ViewIdiom): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidSetViewIdiom !== void 0) {
        observer.serviceDidSetViewIdiom(newViewIdiom, oldViewIdiom, this);
      }
    }
  }

  protected willReorient(orientation: OrientationType): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillReorient !== void 0) {
        observer.serviceWillReorient(orientation, this);
      }
    }
  }

  protected onReorient(orientation: OrientationType): void {
    // hook
  }

  protected didReorient(orientation: OrientationType): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidReorient !== void 0) {
        observer.serviceDidReorient(orientation, this);
      }
    }
  }

  protected override onObserve(observer: ObserverType<this>): void {
    super.onObserve(observer);
    if (this.attached) {
      this.updateViewIdiom(this.viewport);
    }
  }

  protected override onAttach(): void {
    super.onAttach();
    this.attachEvents();
    this.updateViewIdiom(this.viewport);
  }

  protected override onDetach(): void {
    this.detachEvents();
    super.onDetach();
  }

  protected attachEvents(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", this.throttleScroll, {passive: true});
      window.addEventListener("resize", this.throttleResize);
      window.addEventListener("orientationchange", this.debounceReorientation);
      if (window.visualViewport !== void 0) {
        window.visualViewport.addEventListener('resize', this.debounceViewportResize);
      }
    }
  }

  protected detachEvents(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", this.throttleScroll);
      window.removeEventListener("resize", this.throttleResize);
      window.removeEventListener("orientationchange", this.debounceReorientation);
      if (window.visualViewport !== void 0) {
        window.visualViewport.removeEventListener('resize', this.debounceViewportResize);
      }
    }
  }

  /** @internal */
  throttleScroll(): void {
    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      roots[i]!.requireUpdate(View.NeedsScroll);
    }
  }

  /** @internal */
  throttleResize(): void {
    const viewport = Viewport.detect();
    const viewFrame = new R2Box(0, 0, viewport.width, viewport.height);
    (this.viewContext as Mutable<ViewContext>).viewport = viewport;
    (this.viewContext as Mutable<ViewContext>).viewFrame = viewFrame;
    this.updateViewIdiom(viewport);

    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      roots[i]!.requireUpdate(View.NeedsResize | View.NeedsLayout);
    }
  }

  /** @internal */
  viewportResizeTimer: number;

  /** @internal */
  protected debounceViewportResize(): void {
    if (this.viewportResizeTimer !== 0) {
      clearTimeout(this.viewportResizeTimer);
      this.viewportResizeTimer = 0;
    }
    this.viewportResizeTimer = setTimeout(this.throttleViewportResize, ViewportService.ViewportResizeDelay) as any;
  }

  /** @internal */
  protected throttleViewportResize(): void {
    if (this.viewportResizeTimer !== 0) {
      clearTimeout(this.viewportResizeTimer);
      this.viewportResizeTimer = 0;
    }

    const viewport = Viewport.detect();
    const viewFrame = new R2Box(0, 0, viewport.width, viewport.height);
    (this.viewContext as Mutable<ViewContext>).viewport = viewport;
    (this.viewContext as Mutable<ViewContext>).viewFrame = viewFrame;
    this.updateViewIdiom(viewport);

    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      roots[i]!.requireUpdate(View.NeedsResize | View.NeedsScroll | View.NeedsLayout);
    }
  }

  /** @internal */
  reorientationTimer: number;

  /** @internal */
  protected debounceReorientation(): void {
    if (this.reorientationTimer !== 0) {
      clearTimeout(this.reorientationTimer);
      this.reorientationTimer = 0;
    }
    this.reorientationTimer = setTimeout(this.throttleReorientation, ViewportService.ReorientationDelay) as any;
  }

  /** @internal */
  protected throttleReorientation(): void {
    if (this.reorientationTimer !== 0) {
      clearTimeout(this.reorientationTimer);
      this.reorientationTimer = 0;
    }

    const viewport = Viewport.detect();
    const viewFrame = new R2Box(0, 0, viewport.width, viewport.height);
    (this.viewContext as Mutable<ViewContext>).viewport = viewport;
    (this.viewContext as Mutable<ViewContext>).viewFrame = viewFrame;
    this.willReorient(viewport.orientation);
    this.updateViewIdiom(viewport);
    this.onReorient(viewport.orientation);
    this.didReorient(viewport.orientation);

    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      roots[i]!.requireUpdate(View.NeedsResize | View.NeedsScroll | View.NeedsLayout);
    }
  }

  /** @internal */
  static ViewportResizeDelay: number = 200;
  /** @internal */
  static ReorientationDelay: number = 100;

  @Lazy
  static global<V extends View>(): ViewportService<V> {
    return new ViewportService();
  }
}
