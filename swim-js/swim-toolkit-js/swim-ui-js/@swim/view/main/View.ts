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
import {AnyTiming, Timing} from "@swim/mapping";
import {
  AnyConstraintExpression,
  ConstraintExpression,
  ConstraintVariable,
  ConstraintBinding,
  ConstraintRelation,
  AnyConstraintStrength,
  ConstraintStrength,
  Constraint,
  ConstraintScope,
} from "@swim/constraint";
import {R2Box, Transform} from "@swim/math";
import {Look, Feel, Mood, MoodVectorUpdates, MoodVector, ThemeMatrix} from "@swim/theme";
import type {ViewContextType, ViewContext} from "./ViewContext";
import type {
  ViewObserverType,
  ViewObserver,
  ViewWillResize,
  ViewDidResize,
  ViewWillScroll,
  ViewDidScroll,
  ViewWillChange,
  ViewDidChange,
  ViewWillAnimate,
  ViewDidAnimate,
  ViewWillLayout,
  ViewDidLayout,
  ViewObserverCache,
} from "./ViewObserver";
import type {ViewIdiom} from "./viewport/ViewIdiom";
import type {Viewport} from "./viewport/Viewport";
import type {ViewServiceConstructor, ViewService} from "./service/ViewService";
import type {ViewportService} from "./service/ViewportService";
import type {DisplayService} from "./service/DisplayService";
import type {LayoutService} from "./service/LayoutService";
import type {ThemeService} from "./service/ThemeService";
import type {ModalService} from "./service/ModalService";
import type {ViewPropertyConstructor, ViewProperty} from "./property/ViewProperty";
import type {AnimationTrack} from "./animation/AnimationTrack";
import type {AnimationTimeline} from "./animation/AnimationTimeline";
import type {ViewAnimatorConstructor, ViewAnimator} from "./animator/ViewAnimator";
import type {ViewFastenerConstructor, ViewFastener} from "./fastener/ViewFastener";
import {GestureContextPrototype, GestureContext} from "./gesture/GestureContext";
import type {Gesture} from "./gesture/Gesture";

export type ViewMemberType<V, K extends keyof V> =
  V[K] extends ViewProperty<any, infer T, any> ? T :
  V[K] extends ViewAnimator<any, infer T, any> ? T :
  never;

export type ViewMemberInit<V, K extends keyof V> =
  V[K] extends ViewProperty<any, infer T, infer U> ? T | U :
  V[K] extends ViewAnimator<any, infer T, infer U> ? T | U :
  never;

export type ViewMemberKey<V, K extends keyof V> =
  V[K] extends ViewProperty<any, any> ? K :
  V[K] extends ViewAnimator<any, any> ? K :
  never;

export type ViewMemberMap<V> = {
  -readonly [K in keyof V as ViewMemberKey<V, K>]?: ViewMemberInit<V, K>;
};

export type ViewFlags = number;

export type ViewPrecedence = number;

export interface ViewInit {
  key?: string;
}

export interface ViewFactory<V extends View = View, U = never> {
  create(): V;
  fromAny?(value: V | U): V;
}

export interface ViewPrototype extends GestureContextPrototype {
  /** @hidden */
  viewServiceConstructors?: {[serviceName: string]: ViewServiceConstructor<View, unknown> | undefined};

  /** @hidden */
  viewPropertyConstructors?: {[propertyName: string]: ViewPropertyConstructor<View, unknown> | undefined};

  /** @hidden */
  viewAnimatorConstructors?: {[animatorName: string]: ViewAnimatorConstructor<View, unknown> | undefined};

  /** @hidden */
  viewFastenerConstructors?: {[fastenerName: string]: ViewFastenerConstructor<View, View> | undefined};
}

export interface ViewConstructor<V extends View = View> {
  new(): V;
  readonly prototype: V;
}

export interface ViewClass<V extends View = View> extends Function {
  readonly prototype: V;

  readonly mountFlags: ViewFlags;

  readonly powerFlags: ViewFlags;

  readonly uncullFlags: ViewFlags;

  readonly insertChildFlags: ViewFlags;

  readonly removeChildFlags: ViewFlags;
}

export abstract class View implements AnimationTimeline, ConstraintScope, GestureContext {
  constructor() {
    Object.defineProperty(this, "viewFlags", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "viewObservers", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "viewObserverCache", {
      value: {},
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "animationTracks", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
  }

  initView(init: ViewInit): void {
    // hook
  }

  readonly viewFlags!: ViewFlags;

  setViewFlags(viewFlags: ViewFlags): void {
    Object.defineProperty(this, "viewFlags", {
      value: viewFlags,
      enumerable: true,
      configurable: true,
    });
  }

  readonly viewObservers!: ReadonlyArray<ViewObserver>;

  addViewObserver(viewObserver: ViewObserverType<this>): void {
    const oldViewObservers = this.viewObservers;
    const newViewObservers = Arrays.inserted(viewObserver, oldViewObservers);
    if (oldViewObservers !== newViewObservers) {
      this.willAddViewObserver(viewObserver);
      Object.defineProperty(this, "viewObservers", {
        value: newViewObservers,
        enumerable: true,
        configurable: true,
      });
      this.onAddViewObserver(viewObserver);
      this.didAddViewObserver(viewObserver);
    }
  }

  /** @hidden */
  readonly viewObserverCache!: ViewObserverCache<this>;

  protected willAddViewObserver(viewObserver: ViewObserverType<this>): void {
    // hook
  }

  protected onAddViewObserver(viewObserver: ViewObserverType<this>): void {
    if (viewObserver.viewWillResize !== void 0) {
      this.viewObserverCache.viewWillResizeObservers = Arrays.inserted(viewObserver as ViewWillResize, this.viewObserverCache.viewWillResizeObservers);
    }
    if (viewObserver.viewDidResize !== void 0) {
      this.viewObserverCache.viewDidResizeObservers = Arrays.inserted(viewObserver as ViewDidResize, this.viewObserverCache.viewDidResizeObservers);
    }
    if (viewObserver.viewWillScroll !== void 0) {
      this.viewObserverCache.viewWillScrollObservers = Arrays.inserted(viewObserver as ViewWillScroll, this.viewObserverCache.viewWillScrollObservers);
    }
    if (viewObserver.viewDidScroll !== void 0) {
      this.viewObserverCache.viewDidScrollObservers = Arrays.inserted(viewObserver as ViewDidScroll, this.viewObserverCache.viewDidScrollObservers);
    }
    if (viewObserver.viewWillChange !== void 0) {
      this.viewObserverCache.viewWillChangeObservers = Arrays.inserted(viewObserver as ViewWillChange, this.viewObserverCache.viewWillChangeObservers);
    }
    if (viewObserver.viewDidChange !== void 0) {
      this.viewObserverCache.viewDidChangeObservers = Arrays.inserted(viewObserver as ViewDidChange, this.viewObserverCache.viewDidChangeObservers);
    }
    if (viewObserver.viewWillAnimate !== void 0) {
      this.viewObserverCache.viewWillAnimateObservers = Arrays.inserted(viewObserver as ViewWillAnimate, this.viewObserverCache.viewWillAnimateObservers);
    }
    if (viewObserver.viewDidAnimate !== void 0) {
      this.viewObserverCache.viewDidAnimateObservers = Arrays.inserted(viewObserver as ViewDidAnimate, this.viewObserverCache.viewDidAnimateObservers);
    }
    if (viewObserver.viewWillLayout !== void 0) {
      this.viewObserverCache.viewWillLayoutObservers = Arrays.inserted(viewObserver as ViewWillLayout, this.viewObserverCache.viewWillLayoutObservers);
    }
    if (viewObserver.viewDidLayout !== void 0) {
      this.viewObserverCache.viewDidLayoutObservers = Arrays.inserted(viewObserver as ViewDidLayout, this.viewObserverCache.viewDidLayoutObservers);
    }
  }

  protected didAddViewObserver(viewObserver: ViewObserverType<this>): void {
    // hook
  }

  removeViewObserver(viewObserver: ViewObserverType<this>): void {
    const oldViewObservers = this.viewObservers;
    const newViewObservers = Arrays.removed(viewObserver, oldViewObservers);
    if (oldViewObservers !== newViewObservers) {
      this.willRemoveViewObserver(viewObserver);
      Object.defineProperty(this, "viewObservers", {
        value: newViewObservers,
        enumerable: true,
        configurable: true,
      });
      this.onRemoveViewObserver(viewObserver);
      this.didRemoveViewObserver(viewObserver);
    }
  }

  protected willRemoveViewObserver(viewObserver: ViewObserverType<this>): void {
    // hook
  }

  protected onRemoveViewObserver(viewObserver: ViewObserverType<this>): void {
    if (viewObserver.viewWillResize !== void 0) {
      this.viewObserverCache.viewWillResizeObservers = Arrays.removed(viewObserver as ViewWillResize, this.viewObserverCache.viewWillResizeObservers);
    }
    if (viewObserver.viewDidResize !== void 0) {
      this.viewObserverCache.viewDidResizeObservers = Arrays.removed(viewObserver as ViewDidResize, this.viewObserverCache.viewDidResizeObservers);
    }
    if (viewObserver.viewWillScroll !== void 0) {
      this.viewObserverCache.viewWillScrollObservers = Arrays.removed(viewObserver as ViewWillScroll, this.viewObserverCache.viewWillScrollObservers);
    }
    if (viewObserver.viewDidScroll !== void 0) {
      this.viewObserverCache.viewDidScrollObservers = Arrays.removed(viewObserver as ViewDidScroll, this.viewObserverCache.viewDidScrollObservers);
    }
    if (viewObserver.viewWillChange !== void 0) {
      this.viewObserverCache.viewWillChangeObservers = Arrays.removed(viewObserver as ViewWillChange, this.viewObserverCache.viewWillChangeObservers);
    }
    if (viewObserver.viewDidChange !== void 0) {
      this.viewObserverCache.viewDidChangeObservers = Arrays.removed(viewObserver as ViewDidChange, this.viewObserverCache.viewDidChangeObservers);
    }
    if (viewObserver.viewWillAnimate !== void 0) {
      this.viewObserverCache.viewWillAnimateObservers = Arrays.removed(viewObserver as ViewWillAnimate, this.viewObserverCache.viewWillAnimateObservers);
    }
    if (viewObserver.viewDidAnimate !== void 0) {
      this.viewObserverCache.viewDidAnimateObservers = Arrays.removed(viewObserver as ViewDidAnimate, this.viewObserverCache.viewDidAnimateObservers);
    }
    if (viewObserver.viewWillLayout !== void 0) {
      this.viewObserverCache.viewWillLayoutObservers = Arrays.removed(viewObserver as ViewWillLayout, this.viewObserverCache.viewWillLayoutObservers);
    }
    if (viewObserver.viewDidLayout !== void 0) {
      this.viewObserverCache.viewDidLayoutObservers = Arrays.removed(viewObserver as ViewDidLayout, this.viewObserverCache.viewDidLayoutObservers);
    }
  }

  protected didRemoveViewObserver(viewObserver: ViewObserverType<this>): void {
    // hook
  }

  abstract readonly key: string | undefined;

  /** @hidden */
  abstract setKey(key: string | undefined): void;

  abstract readonly parentView: View | null;

  /** @hidden */
  abstract setParentView(newParentView: View | null, oldParentView: View | null): void;

  protected attachParentView(parentView: View): void {
    if (parentView.isMounted()) {
      this.cascadeMount();
      if (parentView.isPowered()) {
        this.cascadePower();
      }
      if (parentView.isCulled()) {
        this.cascadeCull();
      }
    }
  }

  protected detachParentView(parentView: View): void {
    if (this.isMounted()) {
      try {
        if (this.isPowered()) {
          this.cascadeUnpower();
        }
      } finally {
        this.cascadeUnmount();
      }
    }
  }

  protected willSetParentView(newParentView: View | null, oldParentView: View | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetParentView !== void 0) {
        viewObserver.viewWillSetParentView(newParentView, oldParentView, this);
      }
    }
  }

  protected onSetParentView(newParentView: View | null, oldParentView: View | null): void {
    // hook
  }

  protected didSetParentView(newParentView: View | null, oldParentView: View | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetParentView !== void 0) {
        viewObserver.viewDidSetParentView(newParentView, oldParentView, this);
      }
    }
  }

  abstract remove(): void;

  abstract readonly childViewCount: number;

  abstract readonly childViews: ReadonlyArray<View>;

  abstract firstChildView(): View | null;

  abstract lastChildView(): View | null;

  abstract nextChildView(targetView: View): View | null;

  abstract previousChildView(targetView: View): View | null;

  abstract forEachChildView<T>(callback: (childView: View) => T | void): T | undefined;
  abstract forEachChildView<T, S>(callback: (this: S, childView: View) => T | void,
                                  thisArg: S): T | undefined;

  abstract getChildView(key: string): View | null;

  abstract setChildView(key: string, newChildView: View | null): View | null;

  abstract appendChildView(childView: View, key?: string): void;

  abstract prependChildView(childView: View, key?: string): void;

  abstract insertChildView(childView: View, targetView: View | null, key?: string): void;

  get insertChildFlags(): ViewFlags {
    return (this.constructor as ViewClass).insertChildFlags;
  }

  protected willInsertChildView(childView: View, targetView: View | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillInsertChildView !== void 0) {
        viewObserver.viewWillInsertChildView(childView, targetView, this);
      }
    }
  }

  protected onInsertChildView(childView: View, targetView: View | null): void {
    this.requireUpdate(this.insertChildFlags);
  }

  protected didInsertChildView(childView: View, targetView: View | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidInsertChildView !== void 0) {
        viewObserver.viewDidInsertChildView(childView, targetView, this);
      }
    }
  }

  abstract cascadeInsert(updateFlags?: ViewFlags, viewContext?: ViewContext): void;

  abstract removeChildView(key: string): View | null;
  abstract removeChildView(childView: View): void;

  abstract removeAll(): void;

  get removeChildFlags(): ViewFlags {
    return (this.constructor as ViewClass).removeChildFlags;
  }

  protected willRemoveChildView(childView: View): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillRemoveChildView !== void 0) {
        viewObserver.viewWillRemoveChildView(childView, this);
      }
    }
    this.requireUpdate(this.removeChildFlags);
  }

  protected onRemoveChildView(childView: View): void {
    // hook
  }

  protected didRemoveChildView(childView: View): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidRemoveChildView !== void 0) {
        viewObserver.viewDidRemoveChildView(childView, this);
      }
    }
  }

  getSuperView<V extends View>(viewClass: ViewClass<V>): V | null {
    const parentView = this.parentView;
    if (parentView === null) {
      return null;
    } else if (parentView instanceof viewClass) {
      return parentView;
    } else {
      return parentView.getSuperView(viewClass);
    }
  }

  getBaseView<V extends View>(viewClass: ViewClass<V>): V | null {
    const parentView = this.parentView;
    if (parentView === null) {
      return null;
    } else {
      const baseView = parentView.getBaseView(viewClass);
      if (baseView !== null) {
        return baseView;
      } else {
        return parentView instanceof viewClass ? parentView : null;
      }
    }
  }

  declare readonly viewportService: ViewportService<this>; // defined by ViewportService

  declare readonly displayService: DisplayService<this>; // defined by DisplayService

  declare readonly layoutService: LayoutService<this>; // defined by LayoutService

  declare readonly themeService: ThemeService<this>; // defined by ThemeService

  declare readonly modalService: ModalService<this>; // defined by ModalService

  isMounted(): boolean {
    return (this.viewFlags & View.MountedFlag) !== 0;
  }

  get mountFlags(): ViewFlags {
    return (this.constructor as ViewClass).mountFlags;
  }

  abstract cascadeMount(): void;

  protected willMount(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillMount !== void 0) {
        viewObserver.viewWillMount(this);
      }
    }
  }

  protected onMount(): void {
    this.requestUpdate(this, this.viewFlags & ~View.StatusMask, false);
    this.requireUpdate(this.mountFlags);
    if (this.animationTracks.length !== 0 && !this.isCulled()) {
      this.requireUpdate(View.NeedsAnimate);
    }
  }

  protected didMount(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidMount !== void 0) {
        viewObserver.viewDidMount(this);
      }
    }
  }

  abstract cascadeUnmount(): void;

  protected willUnmount(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillUnmount !== void 0) {
        viewObserver.viewWillUnmount(this);
      }
    }
  }

  protected onUnmount(): void {
    // hook
  }

  protected didUnmount(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidUnmount !== void 0) {
        viewObserver.viewDidUnmount(this);
      }
    }
  }

  isPowered(): boolean {
    return (this.viewFlags & View.PoweredFlag) !== 0;
  }

  get powerFlags(): ViewFlags {
    return (this.constructor as ViewClass).powerFlags;
  }

  abstract cascadePower(): void;

  protected willPower(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillPower !== void 0) {
        viewObserver.viewWillPower(this);
      }
    }
  }

  protected onPower(): void {
    this.requestUpdate(this, this.viewFlags & ~View.StatusMask, false);
    this.requireUpdate(this.powerFlags);
  }

  protected didPower(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidPower !== void 0) {
        viewObserver.viewDidPower(this);
      }
    }
  }

  abstract cascadeUnpower(): void;

  protected willUnpower(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillUnpower !== void 0) {
        viewObserver.viewWillUnpower(this);
      }
    }
  }

  protected onUnpower(): void {
    // hook
  }

  protected didUnpower(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidUnpower !== void 0) {
        viewObserver.viewDidUnpower(this);
      }
    }
  }

  isCulled(): boolean {
    return (this.viewFlags & View.CulledMask) !== 0;
  }

  abstract setCulled(culled: boolean): void;

  abstract cascadeCull(): void;

  protected willCull(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillCull !== void 0) {
        viewObserver.viewWillCull(this);
      }
    }
  }

  protected onCull(): void {
    // hook
  }

  protected didCull(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidCull !== void 0) {
        viewObserver.viewDidCull(this);
      }
    }
  }

  abstract cascadeUncull(): void;

  get uncullFlags(): ViewFlags {
    return (this.constructor as ViewClass).uncullFlags;
  }

  protected willUncull(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillUncull !== void 0) {
        viewObserver.viewWillUncull(this);
      }
    }
  }

  protected onUncull(): void {
    this.requestUpdate(this, this.viewFlags & ~View.StatusMask, false);
    this.requireUpdate(this.uncullFlags);
    if (this.animationTracks.length !== 0) {
      this.requireUpdate(View.NeedsAnimate);
    }
  }

  protected didUncull(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidUncull !== void 0) {
        viewObserver.viewDidUncull(this);
      }
    }
  }

  requireUpdate(updateFlags: ViewFlags, immediate: boolean = false): void {
    const viewFlags = this.viewFlags;
    const deltaUpdateFlags = updateFlags & ~viewFlags & View.UpdateMask;
    if (deltaUpdateFlags !== 0) {
      this.setViewFlags(viewFlags | deltaUpdateFlags);
      this.requestUpdate(this, deltaUpdateFlags, immediate);
    }
  }

  protected needsUpdate(targetView: View, updateFlags: ViewFlags, immediate: boolean): ViewFlags {
    return updateFlags;
  }

  requestUpdate(targetView: View, updateFlags: ViewFlags, immediate: boolean): void {
    if ((this.viewFlags & View.CulledMask) !== View.CulledFlag) { // if not culled root
      updateFlags = this.needsUpdate(targetView, updateFlags, immediate);
      let deltaUpdateFlags = this.viewFlags & ~updateFlags & View.UpdateMask;
      if ((updateFlags & View.ProcessMask) !== 0) {
        deltaUpdateFlags |= View.NeedsProcess;
      }
      if ((updateFlags & View.DisplayMask) !== 0) {
        deltaUpdateFlags |= View.NeedsDisplay;
      }
      if (deltaUpdateFlags !== 0 || immediate) {
        this.setViewFlags(this.viewFlags | deltaUpdateFlags);
        const parentView = this.parentView;
        if (parentView !== null) {
          parentView.requestUpdate(targetView, updateFlags, immediate);
        } else if (this.isMounted()) {
          const displayManager = this.displayService.manager;
          if (displayManager !== void 0) {
            displayManager.requestUpdate(targetView, updateFlags, immediate);
          }
        }
      }
    }
  }

  isTraversing(): boolean {
    return (this.viewFlags & View.TraversingFlag) !== 0;
  }

  isUpdating(): boolean {
    return (this.viewFlags & View.UpdatingMask) !== 0;
  }

  isProcessing(): boolean {
    return (this.viewFlags & View.ProcessingFlag) !== 0;
  }

  protected needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    return processFlags;
  }

  abstract cascadeProcess(processFlags: ViewFlags, viewContext: ViewContext): void;

  protected willProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    // hook
  }

  protected onProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    // hook
  }

  protected willResize(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewWillResizeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillResize(viewContext, this);
      }
    }
  }

  protected onResize(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didResize(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewDidResizeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidResize(viewContext, this);
      }
    }
  }

  protected willScroll(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewWillScrollObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillScroll(viewContext, this);
      }
    }
  }

  protected onScroll(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didScroll(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewDidScrollObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidScroll(viewContext, this);
      }
    }
  }

  protected willChange(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewWillChangeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillChange(viewContext, this);
      }
    }
  }

  protected onChange(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didChange(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewDidChangeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidChange(viewContext, this);
      }
    }
  }

  protected willAnimate(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewWillAnimateObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillAnimate(viewContext, this);
      }
    }
  }

  protected onAnimate(viewContext: ViewContextType<this>): void {
    if (!this.isCulled()) {
      this.updateAnimations(viewContext.updateTime);
    }
  }

  /** @hidden */
  updateAnimations(t: number): void {
    const animationTracks = this.animationTracks;
    for (let i = 0, n = animationTracks.length; i < n; i += 1) {
      const track = animationTracks[i]!;
      track.onAnimate(t);
    }
    if (this.animationTracks.length !== 0) {
      this.requireUpdate(View.NeedsAnimate);
    }
  }

  protected didAnimate(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewDidAnimateObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidAnimate(viewContext, this);
      }
    }
  }

  protected processChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                              processChildView: (this: this, childView: View, processFlags: ViewFlags,
                                                 viewContext: ViewContextType<this>) => void): void {
    type self = this;
    function processView(this: self, childView: View): void {
      processChildView.call(this, childView, processFlags, viewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
    this.forEachChildView(processView, this);
  }

  protected processChildView(childView: View, processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    childView.cascadeProcess(processFlags, viewContext);
  }

  isDisplaying(): boolean {
    return (this.viewFlags & View.DisplayingFlag) !== 0;
  }

  protected needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    return displayFlags;
  }

  abstract cascadeDisplay(displayFlags: ViewFlags, viewContext: ViewContext): void;

  protected willDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    // hook
  }

  protected onDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    // hook
  }

  protected willLayout(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewWillLayoutObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillLayout(viewContext, this);
      }
    }
  }

  protected onLayout(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didLayout(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewDidLayoutObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidLayout(viewContext, this);
      }
    }
  }

  protected displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                              displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                 viewContext: ViewContextType<this>) => void): void {
    type self = this;
    function displayView(this: self, childView: View): void {
      displayChildView.call(this, childView, displayFlags, viewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
    this.forEachChildView(displayView, this);
  }

  protected displayChildView(childView: View, displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    childView.cascadeDisplay(displayFlags, viewContext);
  }

  declare readonly mood: ViewProperty<this, MoodVector | null>; // defined by ViewProperty

  declare readonly theme: ViewProperty<this, ThemeMatrix | null>; // defined by ViewProperty

  abstract getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined;

  abstract getLookOr<T, E>(look: Look<T, unknown>, elseValue: E): T | E;
  abstract getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null, elseValue: E): T | E;

  abstract modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: AnyTiming | boolean): void;

  abstract modifyTheme(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: AnyTiming | boolean): void;

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = theme.getOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    this.willApplyTheme(theme, mood, timing as Timing | boolean);
    this.onApplyTheme(theme, mood, timing as Timing | boolean);
    this.didApplyTheme(theme, mood, timing as Timing | boolean);
  }

  protected willApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillApplyTheme !== void 0) {
        viewObserver.viewWillApplyTheme(theme, mood, timing, this);
      }
    }
  }

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    // hook
  }

  protected didApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidApplyTheme !== void 0) {
        viewObserver.viewDidApplyTheme(theme, mood, timing, this);
      }
    }
  }

  abstract hasViewService(serviceName: string): boolean;

  abstract getViewService(serviceName: string): ViewService<this, unknown> | null;

  abstract setViewService(serviceName: string, viewService: ViewService<this, unknown> | null): void;

  /** @hidden */
  getLazyViewService(serviceName: string): ViewService<this, unknown> | null {
    let viewService = this.getViewService(serviceName);
    if (viewService === null) {
      const constructor = View.getViewServiceConstructor(serviceName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        viewService = new constructor(this, serviceName);
        this.setViewService(serviceName, viewService);
      }
    }
    return viewService;
  }

  abstract hasViewProperty(propertyName: string): boolean;

  abstract getViewProperty(propertyName: string): ViewProperty<this, unknown> | null;

  abstract setViewProperty(propertyName: string, viewProperty: ViewProperty<this, unknown> | null): void;

  /** @hidden */
  getLazyViewProperty(propertyName: string): ViewProperty<this, unknown> | null {
    let viewProperty = this.getViewProperty(propertyName);
    if (viewProperty === null) {
      const constructor = View.getViewPropertyConstructor(propertyName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        viewProperty = new constructor(this, propertyName);
        this.setViewProperty(propertyName, viewProperty);
      }
    }
    return viewProperty;
  }

  abstract hasViewAnimator(animatorName: string): boolean;

  abstract getViewAnimator(animatorName: string): ViewAnimator<this, unknown> | null;

  abstract setViewAnimator(animatorName: string, viewAnimator: ViewAnimator<this, unknown> | null): void;

  /** @hidden */
  getLazyViewAnimator(animatorName: string): ViewAnimator<this, unknown> | null {
    let viewAnimator = this.getViewAnimator(animatorName);
    if (viewAnimator === null) {
      const constructor = View.getViewAnimatorConstructor(animatorName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        viewAnimator = new constructor(this, animatorName);
        this.setViewAnimator(animatorName, viewAnimator);
      }
    }
    return viewAnimator;
  }

  /** @hidden */
  readonly animationTracks!: ReadonlyArray<AnimationTrack>;

  trackWillStartAnimating(track: AnimationTrack): void {
    Object.defineProperty(this, "animationTracks", {
      value: Arrays.inserted(track, this.animationTracks),
      enumerable: true,
      configurable: true,
    });
    if (!this.isCulled()) {
      this.requireUpdate(View.NeedsAnimate);
    }
  }

  trackDidStartAnimating(track: AnimationTrack): void {
    // hook
  }

  trackWillStopAnimating(track: AnimationTrack): void {
    // hook
  }

  trackDidStopAnimating(track: AnimationTrack): void {
    Object.defineProperty(this, "animationTracks", {
      value: Arrays.removed(track, this.animationTracks),
      enumerable: true,
      configurable: true,
    });
  }

  abstract hasViewFastener(fastenerName: string): boolean;

  abstract getViewFastener(fastenerName: string): ViewFastener<this, View> | null;

  abstract setViewFastener(fastenerName: string, viewFastener: ViewFastener<this, any> | null): void;

  /** @hidden */
  getLazyViewFastener(fastenerName: string): ViewFastener<this, View> | null {
    let viewFastener = this.getViewFastener(fastenerName);
    if (viewFastener === null) {
      const constructor = View.getViewFastenerConstructor(fastenerName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        const key = constructor.prototype.key === true ? fastenerName
                  : constructor.prototype.key === false ? void 0
                  : constructor.prototype.key;
        viewFastener = new constructor(this, key, fastenerName);
        this.setViewFastener(fastenerName, viewFastener);
      }
    }
    return viewFastener;
  }

  abstract hasGesture(gestureName: string): boolean;

  abstract getGesture(gestureName: string): Gesture<this, View> | null;

  abstract setGesture(gestureName: string, gesture: Gesture<this, any> | null): void;

  /** @hidden */
  getLazyGesture(gestureName: string): Gesture<this, View> | null {
    let gesture = this.getGesture(gestureName);
    if (gesture === null) {
      const constructor = GestureContext.getGestureConstructor(gestureName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        gesture = new constructor(this, gestureName);
        this.setGesture(gestureName, gesture);
      }
    }
    return gesture;
  }

  constraint(lhs: AnyConstraintExpression, relation: ConstraintRelation,
             rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint {
    lhs = ConstraintExpression.fromAny(lhs);
    if (rhs !== void 0) {
      rhs = ConstraintExpression.fromAny(rhs);
    }
    const expression = rhs !== void 0 ? lhs.minus(rhs) : lhs;
    if (strength === void 0) {
      strength = ConstraintStrength.Required;
    } else {
      strength = ConstraintStrength.fromAny(strength);
    }
    const constraint = new Constraint(this, expression, relation, strength);
    this.addConstraint(constraint);
    return constraint;
  }

  abstract readonly constraints: ReadonlyArray<Constraint>;

  abstract hasConstraint(constraint: Constraint): boolean;

  abstract addConstraint(constraint: Constraint): void;

  abstract removeConstraint(constraint: Constraint): void;

  /** @hidden */
  activateConstraint(constraint: Constraint): void {
    const layoutManager = this.layoutService.manager;
    if (layoutManager !== void 0) {
      layoutManager.activateConstraint(constraint);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @hidden */
  deactivateConstraint(constraint: Constraint): void {
    const layoutManager = this.layoutService.manager;
    if (layoutManager !== void 0) {
      layoutManager.deactivateConstraint(constraint);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  constraintVariable(name: string, value?: number, strength?: AnyConstraintStrength): ConstraintBinding {
    if (value === void 0) {
      value = 0;
    }
    if (strength === void 0) {
      strength = ConstraintStrength.Strong;
    } else {
      strength = ConstraintStrength.fromAny(strength);
    }
    return new ConstraintBinding(this, name, value, strength);
  }

  abstract readonly constraintVariables: ReadonlyArray<ConstraintVariable>;

  abstract hasConstraintVariable(constraintVariable: ConstraintVariable): boolean;

  abstract addConstraintVariable(constraintVariable: ConstraintVariable): void;

  abstract removeConstraintVariable(constraintVariable: ConstraintVariable): void;

  /** @hidden */
  activateConstraintVariable(constraintVariable: ConstraintVariable): void {
    const layoutManager = this.layoutService.manager;
    if (layoutManager !== void 0) {
      layoutManager.activateConstraintVariable(constraintVariable);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @hidden */
  deactivateConstraintVariable(constraintVariable: ConstraintVariable): void {
    const layoutManager = this.layoutService.manager;
    if (layoutManager !== void 0) {
      layoutManager.deactivateConstraintVariable(constraintVariable);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @hidden */
  setConstraintVariable(constraintVariable: ConstraintVariable, state: number): void {
    const layoutManager = this.layoutService.manager;
    if (layoutManager !== void 0) {
      layoutManager.setConstraintVariable(constraintVariable, state);
    }
  }

  /** @hidden */
  setViewMember(key: string, value: unknown, timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void {
    const viewProperty = this.getLazyViewProperty(key);
    if (viewProperty !== null) {
      viewProperty.setState(value, precedence);
      return;
    }
    const viewAnimator = this.getLazyViewAnimator(key);
    if (viewAnimator !== null) {
      viewAnimator.setState(value, timing, precedence);
      return;
    }
  }

  setViewState<S extends View>(this: S, state: ViewMemberMap<S>, precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  setViewState<S extends View>(this: S, state: ViewMemberMap<S>, timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;
  setViewState<S extends View>(this: S, state: ViewMemberMap<S>, timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): void {
    if (typeof timing === "number") {
      precedence = timing;
      timing = void 0;
    } else if (precedence === void 0) {
      precedence = View.Extrinsic;
    }
    for (const key in state) {
      const value = state[key];
      this.setViewMember(key, value, timing, precedence);
    }
  }

  extendViewContext(viewContext: ViewContext): ViewContextType<this> {
    return viewContext as ViewContextType<this>;
  }

  get superViewContext(): ViewContext {
    const parentView = this.parentView;
    if (parentView !== null) {
      return parentView.viewContext;
    } else {
      const viewContext = this.viewportService.viewContext;
      return this.displayService.updatedViewContext(viewContext);
    }
  }

  declare readonly viewContext: ViewContext; // getter defined below to work around useDefineForClassFields lunacy

  get viewIdiom(): ViewIdiom {
    return this.viewContext.viewIdiom;
  }

  get viewport(): Viewport {
    return this.viewContext.viewport;
  }

  /**
   * Returns the transformation from the parent view coordinates to view
   * coordinates.
   */
  abstract readonly parentTransform: Transform;

  /**
   * Returns the transformation from page coordinates to view coordinates.
   */
  get pageTransform(): Transform {
    const parentView = this.parentView;
    if (parentView !== null) {
      return parentView.pageTransform.transform(this.parentTransform);
    } else {
      return Transform.identity();
    }
  }

  get pageBounds(): R2Box {
    const clientBounds = this.clientBounds;
    const clientTransform = this.clientTransform;
    return clientBounds.transform(clientTransform);
  }

  /**
   * Returns the bounding box, in page coordinates, the edges to which attached
   * popovers should point.
   */
  get popoverFrame(): R2Box {
    return this.pageBounds;
  }

  /**
   * Returns the transformation from viewport coordinates to view coordinates.
   */
  get clientTransform(): Transform {
    let clientTransform: Transform;
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    if (scrollX !== 0 || scrollY !== 0) {
      clientTransform = Transform.translate(scrollX, scrollY);
    } else {
      clientTransform = Transform.identity();
    }
    const pageTransform = this.pageTransform;
    return clientTransform.transform(pageTransform);
  }

  abstract readonly clientBounds: R2Box;

  intersectsViewport(): boolean {
    const bounds = this.clientBounds;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    return (bounds.top <= 0 && 0 < bounds.bottom || 0 <= bounds.top && bounds.top < viewportHeight)
        && (bounds.left <= 0 && 0 < bounds.right || 0 <= bounds.left && bounds.left < viewportWidth);
  }

  abstract dispatchEvent(event: Event): boolean;

  abstract on(type: string, listener: EventListenerOrEventListenerObject,
              options?: AddEventListenerOptions | boolean): this;

  abstract off(type: string, listener: EventListenerOrEventListenerObject,
               options?: EventListenerOptions | boolean): this;

  /** @hidden */
  static getViewServiceConstructor(serviceName: string, viewPrototype: ViewPrototype | null = null): ViewServiceConstructor<any, unknown> | null {
    if (viewPrototype === null) {
      viewPrototype = this.prototype as ViewPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(viewPrototype, "viewServiceConstructors")) {
        const constructor = viewPrototype.viewServiceConstructors![serviceName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      viewPrototype = Object.getPrototypeOf(viewPrototype);
    } while (viewPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateViewService(constructor: ViewServiceConstructor<View, unknown>,
                             target: Object, propertyKey: string | symbol): void {
    const viewPrototype = target as ViewPrototype;
    if (!Object.prototype.hasOwnProperty.call(viewPrototype, "viewServiceConstructors")) {
      viewPrototype.viewServiceConstructors = {};
    }
    viewPrototype.viewServiceConstructors![propertyKey.toString()] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: View): ViewService<View, unknown> {
        let viewService = this.getViewService(propertyKey.toString());
        if (viewService === null) {
          viewService = new constructor(this, propertyKey.toString());
          this.setViewService(propertyKey.toString(), viewService);
        }
        return viewService;
      },
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  static getViewPropertyConstructor(propertyName: string, viewPrototype: ViewPrototype | null = null): ViewPropertyConstructor<any, unknown> | null {
    if (viewPrototype === null) {
      viewPrototype = this.prototype as ViewPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(viewPrototype, "viewPropertyConstructors")) {
        const constructor = viewPrototype.viewPropertyConstructors![propertyName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      viewPrototype = Object.getPrototypeOf(viewPrototype);
    } while (viewPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateViewProperty(constructor: ViewPropertyConstructor<View, unknown>,
                              target: Object, propertyKey: string | symbol): void {
    const viewPrototype = target as ViewPrototype;
    if (!Object.prototype.hasOwnProperty.call(viewPrototype, "viewPropertyConstructors")) {
      viewPrototype.viewPropertyConstructors = {};
    }
    viewPrototype.viewPropertyConstructors![propertyKey.toString()] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: View): ViewProperty<View, unknown> {
        let viewProperty = this.getViewProperty(propertyKey.toString());
        if (viewProperty === null) {
          viewProperty = new constructor(this, propertyKey.toString());
          this.setViewProperty(propertyKey.toString(), viewProperty);
        }
        return viewProperty;
      },
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  static getViewAnimatorConstructor(animatorName: string, viewPrototype: ViewPrototype | null): ViewAnimatorConstructor<any, unknown> | null {
    if (viewPrototype === null) {
      viewPrototype = this.prototype as ViewPrototype;
    }
    while (viewPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(viewPrototype, "viewAnimatorConstructors")) {
        const constructor = viewPrototype.viewAnimatorConstructors![animatorName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      viewPrototype = Object.getPrototypeOf(viewPrototype);
    }
    return null;
  }

  /** @hidden */
  static decorateViewAnimator(constructor: ViewAnimatorConstructor<View, unknown>,
                              target: Object, propertyKey: string | symbol): void {
    const viewPrototype = target as ViewPrototype;
    if (!Object.prototype.hasOwnProperty.call(viewPrototype, "viewAnimatorConstructors")) {
      viewPrototype.viewAnimatorConstructors = {};
    }
    viewPrototype.viewAnimatorConstructors![propertyKey.toString()] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: View): ViewAnimator<View, unknown> {
        let viewAnimator = this.getViewAnimator(propertyKey.toString());
        if (viewAnimator === null) {
          viewAnimator = new constructor(this, propertyKey.toString());
          this.setViewAnimator(propertyKey.toString(), viewAnimator);
        }
        return viewAnimator;
      },
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  static getViewFastenerConstructor(fastenerName: string, viewPrototype: ViewPrototype | null = null): ViewFastenerConstructor<any, any> | null {
    if (viewPrototype === null) {
      viewPrototype = this.prototype as ViewPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(viewPrototype, "viewFastenerConstructors")) {
        const constructor = viewPrototype.viewFastenerConstructors![fastenerName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      viewPrototype = Object.getPrototypeOf(viewPrototype);
    } while (viewPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateViewFastener(constructor: ViewFastenerConstructor<View, View>,
                              target: Object, propertyKey: string | symbol): void {
    const fastenerName = propertyKey.toString();
    const key = constructor.prototype.key === true ? fastenerName
              : constructor.prototype.key === false ? void 0
              : constructor.prototype.key;
    const viewPrototype = target as ViewPrototype;
    if (!Object.prototype.hasOwnProperty.call(viewPrototype, "viewFastenerConstructors")) {
      viewPrototype.viewFastenerConstructors = {};
    }
    viewPrototype.viewFastenerConstructors![fastenerName] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: View): ViewFastener<View, View> {
        let viewFastener = this.getViewFastener(fastenerName);
        if (viewFastener === null) {
          viewFastener = new constructor(this, key, fastenerName);
          this.setViewFastener(fastenerName, viewFastener);
        }
        return viewFastener;
      },
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  static readonly MountedFlag: ViewFlags = 1 << 0;
  /** @hidden */
  static readonly PoweredFlag: ViewFlags = 1 << 1;
  /** @hidden */
  static readonly CullFlag: ViewFlags = 1 << 2;
  /** @hidden */
  static readonly CulledFlag: ViewFlags = 1 << 3;
  /** @hidden */
  static readonly HideFlag: ViewFlags = 1 << 4;
  /** @hidden */
  static readonly HiddenFlag: ViewFlags = 1 << 5;
  /** @hidden */
  static readonly TraversingFlag: ViewFlags = 1 << 6;
  /** @hidden */
  static readonly ProcessingFlag: ViewFlags = 1 << 7;
  /** @hidden */
  static readonly DisplayingFlag: ViewFlags = 1 << 8;
  /** @hidden */
  static readonly RemovingFlag: ViewFlags = 1 << 9;
  /** @hidden */
  static readonly ImmediateFlag: ViewFlags = 1 << 10;
  /** @hidden */
  static readonly CulledMask: ViewFlags = View.CullFlag
                                        | View.CulledFlag;
  /** @hidden */
  static readonly HiddenMask: ViewFlags = View.HideFlag
                                        | View.HiddenFlag;
  /** @hidden */
  static readonly UpdatingMask: ViewFlags = View.ProcessingFlag
                                          | View.DisplayingFlag;
  /** @hidden */
  static readonly StatusMask: ViewFlags = View.MountedFlag
                                        | View.PoweredFlag
                                        | View.CullFlag
                                        | View.CulledFlag
                                        | View.HiddenFlag
                                        | View.TraversingFlag
                                        | View.ProcessingFlag
                                        | View.DisplayingFlag
                                        | View.RemovingFlag
                                        | View.ImmediateFlag;

  static readonly NeedsProcess: ViewFlags = 1 << 11;
  static readonly NeedsResize: ViewFlags = 1 << 12;
  static readonly NeedsScroll: ViewFlags = 1 << 13;
  static readonly NeedsChange: ViewFlags = 1 << 14;
  static readonly NeedsAnimate: ViewFlags = 1 << 15;
  static readonly NeedsProject: ViewFlags = 1 << 16;
  /** @hidden */
  static readonly ProcessMask: ViewFlags = View.NeedsProcess
                                         | View.NeedsResize
                                         | View.NeedsScroll
                                         | View.NeedsChange
                                         | View.NeedsAnimate
                                         | View.NeedsProject;

  static readonly NeedsDisplay: ViewFlags = 1 << 17;
  static readonly NeedsLayout: ViewFlags = 1 << 18;
  static readonly NeedsRender: ViewFlags = 1 << 19;
  static readonly NeedsRasterize: ViewFlags = 1 << 20;
  static readonly NeedsComposite: ViewFlags = 1 << 21;
  /** @hidden */
  static readonly DisplayMask: ViewFlags = View.NeedsDisplay
                                         | View.NeedsLayout
                                         | View.NeedsRender
                                         | View.NeedsRasterize
                                         | View.NeedsComposite;

  /** @hidden */
  static readonly UpdateMask: ViewFlags = View.ProcessMask
                                        | View.DisplayMask;

  /** @hidden */
  static readonly ViewFlagShift: ViewFlags = 24;
  /** @hidden */
  static readonly ViewFlagMask: ViewFlags = (1 << View.ViewFlagShift) - 1;

  static readonly mountFlags: ViewFlags = View.NeedsResize | View.NeedsChange | View.NeedsLayout;
  static readonly powerFlags: ViewFlags = View.NeedsResize | View.NeedsChange | View.NeedsLayout;
  static readonly uncullFlags: ViewFlags = View.NeedsResize | View.NeedsChange | View.NeedsLayout;
  static readonly insertChildFlags: ViewFlags = View.NeedsLayout;
  static readonly removeChildFlags: ViewFlags = View.NeedsLayout;

  static readonly Intrinsic: ViewPrecedence = 0;
  static readonly Extrinsic: ViewPrecedence = 1;
}
Object.defineProperty(View.prototype, "viewContext", {
  get(this: View): ViewContext {
    return this.extendViewContext(this.superViewContext);
  },
  enumerable: true,
  configurable: true,
});
