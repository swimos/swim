// Copyright 2015-2021 Swim.inc
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

import {Mutable, Class, Lazy, ObserverType} from "@swim/util";
import {Service} from "@swim/component";
import {R2Box} from "@swim/math";
import type {ViewportIdiom} from "./ViewportIdiom";
import {Viewport} from "./Viewport";
import type {ViewportServiceObserver} from "./ViewportServiceObserver";
import {ViewContext} from "../view/ViewContext";
import {View} from "../"; // forward import

/** @public */
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

  get viewportIdiom(): ViewportIdiom {
    return this.viewContext.viewportIdiom;
  }

  /** @internal */
  detectViewportIdiom(viewport: Viewport): ViewportIdiom | undefined {
    if (viewport.width < 960 || viewport.height < 480) {
      return "mobile";
    } else {
      return "desktop";
    }
  }

  /** @internal */
  updateViewportIdiom(viewport: Viewport): void {
    let viewportIdiom: ViewportIdiom | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.detectViewportIdiom !== void 0) {
        viewportIdiom = observer.detectViewportIdiom(viewport, this) as ViewportIdiom | undefined;
        if (viewportIdiom !== void 0) {
          break;
        }
      }
    }
    if (viewportIdiom === void 0) {
      viewportIdiom = this.detectViewportIdiom(viewport);
    }
    if (viewportIdiom !== void 0) {
      this.setViewportIdiom(viewportIdiom);
    }
  }

  setViewportIdiom(newViewportIdiom: ViewportIdiom): void {
    const viewContext = this.viewContext;
    const oldViewportIdiom = viewContext.viewportIdiom;
    if (oldViewportIdiom !== newViewportIdiom) {
      this.willSetViewportIdiom(newViewportIdiom, oldViewportIdiom);
      (viewContext as Mutable<ViewContext>).viewportIdiom = newViewportIdiom;
      this.onSetViewportIdiom(newViewportIdiom, oldViewportIdiom);
      this.didSetViewportIdiom(newViewportIdiom, oldViewportIdiom);
    }
  }

  protected willSetViewportIdiom(newViewportIdiom: ViewportIdiom, oldViewportIdiom: ViewportIdiom): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillSetViewportIdiom !== void 0) {
        observer.serviceWillSetViewportIdiom(newViewportIdiom, oldViewportIdiom, this);
      }
    }
  }

  protected onSetViewportIdiom(newViewportIdiom: ViewportIdiom, oldViewportIdiom: ViewportIdiom): void {
    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      roots[i]!.requireUpdate(View.NeedsLayout);
    }
  }

  protected didSetViewportIdiom(newViewportIdiom: ViewportIdiom, oldViewportIdiom: ViewportIdiom): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidSetViewportIdiom !== void 0) {
        observer.serviceDidSetViewportIdiom(newViewportIdiom, oldViewportIdiom, this);
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
      this.updateViewportIdiom(this.viewport);
    }
  }

  protected override onAttach(): void {
    super.onAttach();
    this.attachEvents();
    this.updateViewportIdiom(this.viewport);
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
    this.updateViewportIdiom(viewport);

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
    this.updateViewportIdiom(viewport);

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
    this.updateViewportIdiom(viewport);
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
