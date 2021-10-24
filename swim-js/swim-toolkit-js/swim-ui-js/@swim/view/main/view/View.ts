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

import {
  Mutable,
  Class,
  Arrays,
  FromAny,
  AnyTiming,
  Timing,
  Creatable,
  InitType,
  Initable,
  ObserverType,
} from "@swim/util";
import {
  Affinity,
  Fastener,
  MemberPropertyInitMap,
  Property,
  Animator,
  Provider,
  HierarchyFlags,
  Hierarchy,
} from "@swim/fastener";
import {
  AnyConstraintExpression,
  ConstraintExpression,
  ConstraintVariable,
  ConstraintProperty,
  ConstraintRelation,
  AnyConstraintStrength,
  ConstraintStrength,
  Constraint,
  ConstraintScope,
  ConstraintContext,
} from "@swim/constraint";
import {R2Box, Transform} from "@swim/math";
import {
  Look,
  Feel,
  Mood,
  MoodVectorUpdates,
  MoodVector,
  MoodMatrix,
  ThemeMatrix,
  ThemeContext,
  ThemeAnimator,
} from "@swim/theme";
import type {ViewIdiom} from "../viewport/ViewIdiom";
import type {Viewport} from "../viewport/Viewport";
import {ViewportService} from "../viewport/ViewportService";
import {ViewportProvider} from "../viewport/ViewportProvider";
import {DisplayService} from "../display/DisplayService";
import {DisplayProvider} from "../display/DisplayProvider";
import {LayoutService} from "../layout/LayoutService";
import {LayoutProvider} from "../layout/LayoutProvider";
import {ThemeService} from "../theme/ThemeService";
import {ThemeProvider} from "../theme/ThemeProvider";
import {ModalService} from "../modal/ModalService";
import {ModalProvider} from "../modal/ModalProvider";
import {Gesture} from "../gesture/Gesture";
import {ViewContext} from "./ViewContext";
import type {
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
import {ViewRelation} from "./"; // forward import

export type ViewContextType<V extends View> =
  V extends {readonly contextType?: Class<infer T>} ? T : never;

export type ViewFlags = HierarchyFlags;

export type AnyView<V extends View = View> = V | ViewFactory<V> | InitType<V>;

export interface ViewInit {
  type?: Creatable<View>;
  key?: string;
  children?: AnyView[];

  mood?: MoodVector;
  moodModifier?: MoodMatrix;
  theme?: ThemeMatrix;
  themeModifier?: MoodMatrix;
}

export interface ViewFactory<V extends View = View, U = AnyView<V>> extends Creatable<V>, FromAny<V, U> {
  fromInit(init: InitType<V>): V;
}

export interface ViewClass<V extends View = View, U = AnyView<V>> extends Function, ViewFactory<V, U> {
  readonly prototype: V;
}

export interface ViewConstructor<V extends View = View, U = AnyView<V>> extends ViewClass<V, U> {
  new(): V;
}

export abstract class View extends Hierarchy implements Initable<ViewInit>, ConstraintScope, ConstraintContext, ThemeContext {
  constructor() {
    super();
    this.observerCache = {};
    this.constraints = Arrays.empty;
    this.constraintVariables = Arrays.empty;
  }

  override readonly familyType?: Class<View>;

  override readonly observerType?: Class<ViewObserver>;

  readonly contextType?: Class<ViewContext>;

  /** @internal */
  override readonly flags!: ViewFlags;

  /** @internal */
  override setFlags(flags: ViewFlags): void {
    (this as Mutable<this>).flags = flags;
  }

  abstract override readonly parent: View | null;

  /** @internal */
  override attachParent(parent: View): void {
    // assert(this.parent === null);
    this.willAttachParent(parent);
    if (parent.mounted) {
      if (parent.culled) {
        this.cascadeCull();
      }
      this.cascadeMount();
    }
    this.onAttachParent(parent);
    this.didAttachParent(parent);
  }

  protected override willAttachParent(parent: View): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillAttachParent !== void 0) {
        observer.viewWillAttachParent(parent, this);
      }
    }
  }

  protected override onAttachParent(parent: View): void {
    // hook
  }

  protected override didAttachParent(parent: View): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidAttachParent !== void 0) {
        observer.viewDidAttachParent(parent, this);
      }
    }
  }

  /** @internal */
  override detachParent(parent: View): void {
    // assert(this.parent === parent);
    this.willDetachParent(parent);
    if (this.mounted) {
      this.cascadeUnmount();
    }
    this.onDetachParent(parent);
    this.didDetachParent(parent);
  }

  protected override willDetachParent(parent: View): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillDetachParent !== void 0) {
        observer.viewWillDetachParent(parent, this);
      }
    }
  }

  protected override onDetachParent(parent: View): void {
    // hook
  }

  protected override didDetachParent(parent: View): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidDetachParent !== void 0) {
        observer.viewDidDetachParent(parent, this);
      }
    }
  }

  abstract override readonly childCount: number;

  abstract override readonly children: ReadonlyArray<View>;

  abstract override firstChild(): View | null;

  abstract override lastChild(): View | null;

  abstract override nextChild(target: View): View | null;

  abstract override previousChild(target: View): View | null;

  abstract override forEachChild<T>(callback: (child: View) => T | void): T | undefined;
  abstract override forEachChild<T, S>(callback: (this: S, child: View) => T | void, thisArg: S): T | undefined;

  abstract override getChild<V extends View>(key: string, childBound: Class<V>): V | null;
  abstract override getChild(key: string, childBound?: Class<View>): View | null;

  abstract override setChild<V extends View>(key: string, newChild: V | null): View | null;
  abstract override setChild(key: string, newChild: AnyView | null): View | null;

  abstract override appendChild<V extends View>(child: V, key?: string): V;
  abstract override appendChild(child: AnyView, key?: string): View;

  abstract override prependChild<V extends View>(child: V, key?: string): V;
  abstract override prependChild(child: AnyView, key?: string): View;

  abstract override insertChild<V extends View>(child: V, target: View | null, key?: string): V;
  abstract override insertChild(child: AnyView, target: View | null, key?: string): View;

  abstract override replaceChild<V extends View>(newChild: View, oldChild: V): V;
  abstract override replaceChild<V extends View>(newChild: AnyView, oldChild: V): V;

  override get insertChildFlags(): ViewFlags {
    return (this.constructor as typeof View).InsertChildFlags;
  }

  protected override willInsertChild(child: View, target: View | null): void {
    super.willInsertChild(child, target);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillInsertChild !== void 0) {
        observer.viewWillInsertChild(child, target, this);
      }
    }
  }

  protected override onInsertChild(child: View, target: View | null): void {
    super.onInsertChild(child, target);
    this.bindChildFasteners(child, target);
  }

  protected override didInsertChild(child: View, target: View | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidInsertChild !== void 0) {
        observer.viewDidInsertChild(child, target, this);
      }
    }
    super.didInsertChild(child, target);
  }

  /** @internal */
  override cascadeInsert(updateFlags?: ViewFlags, viewContext?: ViewContext): void {
    if ((this.flags & View.MountedFlag) !== 0) {
      if (updateFlags === void 0) {
        updateFlags = 0;
      }
      updateFlags |= this.flags & View.UpdateMask;
      if ((updateFlags & View.ProcessMask) !== 0) {
        if (viewContext === void 0) {
          viewContext = this.superViewContext;
        }
        this.cascadeProcess(updateFlags, viewContext);
      }
    }
  }

  abstract override removeChild(key: string): View | null;
  abstract override removeChild<V extends View>(child: V): V;

  override get removeChildFlags(): ViewFlags {
    return (this.constructor as typeof View).RemoveChildFlags;
  }

  protected override willRemoveChild(child: View): void {
    super.willRemoveChild(child);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillRemoveChild !== void 0) {
        observer.viewWillRemoveChild(child, this);
      }
    }
  }

  protected override onRemoveChild(child: View): void {
    super.onRemoveChild(child);
    this.unbindChildFasteners(child);
  }

  protected override didRemoveChild(child: View): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidRemoveChild !== void 0) {
        observer.viewDidRemoveChild(child, this);
      }
    }
    super.didRemoveChild(child);
  }

  override get mountFlags(): ViewFlags {
    return (this.constructor as typeof View).MountFlags;
  }

  protected override willMount(): void {
    super.willMount();
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillMount !== void 0) {
        observer.viewWillMount(this);
      }
    }
  }

  protected override onMount(): void {
    // subsume super
    this.requestUpdate(this, this.flags & View.UpdateMask, false);
    this.requireUpdate(this.mountFlags);

    if (!this.culled && this.decoherent !== null && this.decoherent.length !== 0) {
      this.requireUpdate(View.NeedsChange | View.NeedsAnimate);
    }

    this.mountFasteners();
    this.mountTheme();
    this.updateTheme(false);
  }

  protected override didMount(): void {
    this.activateLayout();
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidMount !== void 0) {
        observer.viewDidMount(this);
      }
    }
    super.didMount();
  }

  protected override willUnmount(): void {
    super.willUnmount();
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillUnmount !== void 0) {
        observer.viewWillUnmount(this);
      }
    }
    this.deactivateLayout();
  }

  protected override didUnmount(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidUnmount !== void 0) {
        observer.viewDidUnmount(this);
      }
    }
    super.didUnmount();
  }

  get culled(): boolean {
    return (this.flags & View.CulledMask) !== 0;
  }

  setCulled(culled: boolean): void {
    const flags = this.flags;
    if (culled && (flags & View.CulledFlag) === 0) {
      this.setFlags(flags | View.CulledFlag);
      if ((flags & View.CullFlag) === 0) {
        this.setFlags(this.flags | View.TraversingFlag);
        try {
          this.willCull();
          this.onCull();
          this.cullChildren();
          this.didCull();
        } finally {
          this.setFlags(this.flags & ~View.TraversingFlag);
        }
      }
    } else if (!culled && (flags & View.CulledFlag) !== 0) {
      this.setFlags(flags & ~View.CulledFlag);
      if ((flags & View.CullFlag) === 0) {
        this.setFlags(this.flags | View.TraversingFlag);
        try {
          this.willUncull();
          this.uncullChildren();
          this.onUncull();
          this.didUncull();
        } finally {
          this.setFlags(this.flags & ~View.TraversingFlag);
        }
      }
    }
  }

  /** @internal */
  cascadeCull(): void {
    if ((this.flags & View.CullFlag) === 0) {
      this.setFlags(this.flags | View.CullFlag);
      if ((this.flags & View.CulledFlag) === 0) {
        this.setFlags(this.flags | View.TraversingFlag);
        try {
          this.willCull();
          this.onCull();
          this.cullChildren();
          this.didCull();
        } finally {
          this.setFlags(this.flags & ~View.TraversingFlag);
        }
      }
    }
  }

  protected willCull(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillCull !== void 0) {
        observer.viewWillCull(this);
      }
    }
  }

  protected onCull(): void {
    // hook
  }

  protected didCull(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidCull !== void 0) {
        observer.viewDidCull(this);
      }
    }
  }

  /** @internal */
  protected cullChildren(): void {
    type self = this;
    function cullChild(this: self, child: View): void {
      child.cascadeCull();
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
      }
    }
    this.forEachChild(cullChild, this);
  }

  /** @internal */
  cascadeUncull(): void {
    if ((this.flags & View.CullFlag) !== 0) {
      this.setFlags(this.flags & ~View.CullFlag);
      if ((this.flags & View.CulledFlag) === 0) {
        this.setFlags(this.flags | View.TraversingFlag);
        try {
          this.willUncull();
          this.uncullChildren();
          this.onUncull();
          this.didUncull();
        } finally {
          this.setFlags(this.flags & ~View.TraversingFlag);
        }
      }
    }
  }

  get uncullFlags(): ViewFlags {
    return (this.constructor as typeof View).UncullFlags;
  }

  protected willUncull(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillUncull !== void 0) {
        observer.viewWillUncull(this);
      }
    }
  }

  protected onUncull(): void {
    this.requestUpdate(this, this.flags & View.UpdateMask, false);
    this.requireUpdate(this.uncullFlags);

    if (this.decoherent !== null && this.decoherent.length !== 0) {
      this.requireUpdate(View.NeedsChange | View.NeedsAnimate);
    }

    if (this.mood.inherited) {
      this.mood.decohere();
    }
    if (this.theme.inherited) {
      this.theme.decohere();
    }
  }

  protected didUncull(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidUncull !== void 0) {
        observer.viewDidUncull(this);
      }
    }
  }

  /** @internal */
  protected uncullChildren(): void {
    type self = this;
    function uncullChild(this: self, child: View): void {
      child.cascadeUncull();
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
      }
    }
    this.forEachChild(uncullChild, this);
  }

  get unbounded(): boolean {
    return (this.flags & View.UnboundedFlag) !== 0;
  }

  setUnbounded(unboundedFlag: boolean): void {
    if (unboundedFlag !== ((this.flags & View.UnboundedFlag) !== 0)) {
      this.willSetUnbounded(unboundedFlag);
      if (unboundedFlag) {
        this.setFlags(this.flags | View.UnboundedFlag);
      } else {
        this.setFlags(this.flags & ~View.UnboundedFlag);
      }
      this.onSetUnbounded(unboundedFlag);
      this.didSetUnbounded(unboundedFlag);
    }
  }

  protected willSetUnbounded(unboundedFlag: boolean): void {
    // hook
  }

  protected onSetUnbounded(unboundedFlag: boolean): void {
    // hook
  }

  protected didSetUnbounded(unboundedFlag: boolean): void {
    // hook
  }

  get intangible(): boolean {
    return (this.flags & View.IntangibleFlag) !== 0;
  }

  setIntangible(intangible: boolean): void {
    if (intangible !== ((this.flags & View.IntangibleFlag) !== 0)) {
      this.willSetIntangible(intangible);
      if (intangible) {
        this.setFlags(this.flags | View.IntangibleFlag);
      } else {
        this.setFlags(this.flags & ~View.IntangibleFlag);
      }
      this.onSetIntangible(intangible);
      this.didSetIntangible(intangible);
    }
  }

  protected willSetIntangible(intangible: boolean): void {
    // hook
  }

  protected onSetIntangible(intangible: boolean): void {
    // hook
  }

  protected didSetIntangible(intangible: boolean): void {
    // hook
  }

  override requireUpdate(updateFlags: ViewFlags, immediate: boolean = false): void {
    const flags = this.flags;
    const deltaUpdateFlags = updateFlags & ~flags & View.UpdateMask;
    if (deltaUpdateFlags !== 0) {
      this.setFlags(flags | deltaUpdateFlags);
      this.requestUpdate(this, deltaUpdateFlags, immediate);
    }
  }

  protected needsUpdate(updateFlags: ViewFlags, immediate: boolean): ViewFlags {
    return updateFlags;
  }

  requestUpdate(target: View, updateFlags: ViewFlags, immediate: boolean): void {
    if ((this.flags & View.CulledMask) !== View.CulledFlag) { // if not culled root
      updateFlags = this.needsUpdate(updateFlags, immediate);
      let deltaUpdateFlags = this.flags & ~updateFlags & View.UpdateMask;
      if ((updateFlags & View.ProcessMask) !== 0) {
        deltaUpdateFlags |= View.NeedsProcess;
      }
      if ((updateFlags & View.DisplayMask) !== 0) {
        deltaUpdateFlags |= View.NeedsDisplay;
      }
      if (deltaUpdateFlags !== 0 || immediate) {
        this.setFlags(this.flags | deltaUpdateFlags);
        const parent = this.parent;
        if (parent !== null) {
          parent.requestUpdate(target, updateFlags, immediate);
        } else if (this.mounted) {
          const displayService = this.displayProvider.service;
          if (displayService !== void 0 && displayService !== null) {
            displayService.requestUpdate(target, updateFlags, immediate);
          }
        }
      }
    }
  }

  get updating(): boolean {
    return (this.flags & View.UpdatingMask) !== 0;
  }

  get processing(): boolean {
    return (this.flags & View.ProcessingFlag) !== 0;
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
    const observers = this.observerCache.viewWillResizeObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillResize(viewContext, this);
      }
    }
    this.evaluateConstraintVariables();
  }

  protected onResize(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didResize(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewDidResizeObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidResize(viewContext, this);
      }
    }
  }

  protected willScroll(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewWillScrollObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillScroll(viewContext, this);
      }
    }
  }

  protected onScroll(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didScroll(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewDidScrollObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidScroll(viewContext, this);
      }
    }
  }

  protected willChange(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewWillChangeObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillChange(viewContext, this);
      }
    }
  }

  protected onChange(viewContext: ViewContextType<this>): void {
    this.updateTheme();
    this.recohereFasteners(viewContext.updateTime);
  }

  protected didChange(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewDidChangeObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidChange(viewContext, this);
      }
    }
  }

  protected willAnimate(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewWillAnimateObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillAnimate(viewContext, this);
      }
    }
  }

  protected onAnimate(viewContext: ViewContextType<this>): void {
    this.recohereAnimators(viewContext.updateTime);
  }

  protected didAnimate(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewDidAnimateObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidAnimate(viewContext, this);
      }
    }
  }

  protected processChildren(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                            processChild: (this: this, child: View, processFlags: ViewFlags,
                                           viewContext: ViewContextType<this>) => void): void {
    type self = this;
    function processNext(this: self, child: View): void {
      processChild.call(this, child, processFlags, viewContext);
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
      }
    }
    this.forEachChild(processNext, this);
  }

  protected processChild(child: View, processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    child.cascadeProcess(processFlags, viewContext);
  }

  get displaying(): boolean {
    return (this.flags & View.DisplayingFlag) !== 0;
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
    const observers = this.observerCache.viewWillLayoutObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillLayout(viewContext, this);
      }
    }
  }

  protected onLayout(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didLayout(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewDidLayoutObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidLayout(viewContext, this);
      }
    }
  }

  protected displayChildren(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                            displayChild: (this: this, child: View, displayFlags: ViewFlags,
                                           viewContext: ViewContextType<this>) => void): void {
    type self = this;
    function displayNext(this: self, child: View): void {
      displayChild.call(this, child, displayFlags, viewContext);
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
      }
    }
    this.forEachChild(displayNext, this);
  }

  protected displayChild(child: View, displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    child.cascadeDisplay(displayFlags, viewContext);
  }

  @Provider({
    extends: ViewportProvider,
    type: ViewportService,
    observes: false,
    service: ViewportService.global(),
  })
  readonly viewportProvider!: ViewportProvider<this>;

  @Provider({
    extends: DisplayProvider,
    type: DisplayService,
    observes: false,
    service: DisplayService.global(),
  })
  readonly displayProvider!: DisplayProvider<this>;

  @Provider({
    extends: LayoutProvider,
    type: LayoutService,
    observes: false,
    service: LayoutService.global(),
  })
  readonly layoutProvider!: LayoutProvider<this>;

  @Provider({
    extends: ThemeProvider,
    type: ThemeService,
    observes: false,
    service: ThemeService.global(),
  })
  readonly themeProvider!: ThemeProvider<this>;

  @Provider({
    extends: ModalProvider,
    type: ModalService,
    observes: false,
    service: ModalService.global(),
  })
  readonly modalProvider!: ModalProvider<this>;

  @Property({type: MoodVector, state: null, inherits: true})
  readonly mood!: Property<this, MoodVector | null>;

  @Property({type: ThemeMatrix, state: null, inherits: true})
  readonly theme!: Property<this, ThemeMatrix | null>;

  /** @override */
  getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined {
    const theme = this.theme.state;
    let value: T | undefined;
    if (theme !== null) {
      if (mood === void 0 || mood === null) {
        mood = this.mood.state;
      }
      if (mood !== null) {
        value = theme.get(look, mood);
      }
    }
    return value;
  }

  /** @override */
  getLookOr<T, E>(look: Look<T, unknown>, elseValue: E): T | E;
  /** @override */
  getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null, elseValue: E): T | E;
  getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null | E, elseValue?: E): T | E {
    if (arguments.length === 2) {
      elseValue = mood as E;
      mood = null;
    }
    const theme = this.theme.state;
    let value: T | E;
    if (theme !== null) {
      if (mood === void 0 || mood === null) {
        mood = this.mood.state;
      }
      if (mood !== null) {
        value = theme.getOr(look, mood as MoodVector<Feel>, elseValue as E);
      } else {
        value = elseValue as E;
      }
    } else {
      value = elseValue as E;
    }
    return value;
  }

  /** @internal */
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillApplyTheme !== void 0) {
        observer.viewWillApplyTheme(theme, mood, timing, this);
      }
    }
  }

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    this.themeAnimators(theme, mood, timing);
  }

  protected didApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidApplyTheme !== void 0) {
        observer.viewDidApplyTheme(theme, mood, timing, this);
      }
    }
  }

  /** @internal */
  protected themeAnimators(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      if (fastener instanceof ThemeAnimator) {
        fastener.applyTheme(theme, mood, timing);
      }
    }
  }

  @Property({type: MoodMatrix, state: null})
  readonly moodModifier!: Property<this, MoodMatrix | null>;

  @Property({type: MoodMatrix, state: null})
  readonly themeModifier!: Property<this, MoodMatrix | null>;

  /** @internal */
  modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: AnyTiming | boolean): void {
    if (this.moodModifier.hasAffinity(Affinity.Intrinsic)) {
      const oldMoodModifier = this.moodModifier.getStateOr(MoodMatrix.empty());
      const newMoodModifier = oldMoodModifier.updatedCol(feel, updates, true);
      if (!newMoodModifier.equals(oldMoodModifier)) {
        this.moodModifier.setState(newMoodModifier, Affinity.Intrinsic);
        this.changeMood();
        if (timing !== void 0) {
          const theme = this.theme.state;
          const mood = this.mood.state;
          if (theme !== null && mood !== null) {
            if (timing === true) {
              timing = theme.getOr(Look.timing, mood, false);
            } else {
              timing = Timing.fromAny(timing);
            }
            this.applyTheme(theme, mood, timing);
          }
        } else {
          this.requireUpdate(View.NeedsChange);
        }
      }
    }
  }

  /** @internal */
  modifyTheme(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: AnyTiming | boolean): void {
    if (this.themeModifier.hasAffinity(Affinity.Intrinsic)) {
      const oldThemeModifier = this.themeModifier.getStateOr(MoodMatrix.empty());
      const newThemeModifier = oldThemeModifier.updatedCol(feel, updates, true);
      if (!newThemeModifier.equals(oldThemeModifier)) {
        this.themeModifier.setState(newThemeModifier, Affinity.Intrinsic);
        this.changeTheme();
        if (timing !== void 0) {
          const theme = this.theme.state;
          const mood = this.mood.state;
          if (theme !== null && mood !== null) {
            if (timing === true) {
              timing = theme.getOr(Look.timing, mood, false);
            } else {
              timing = Timing.fromAny(timing);
            }
            this.applyTheme(theme, mood, timing);
          }
        } else {
          this.requireUpdate(View.NeedsChange);
        }
      }
    }
  }

  /** @internal */
  protected changeMood(): void {
    const moodModifierProperty = this.getFastener("moodModifier", Property) as Property<this, MoodMatrix | null> | null;
    if (moodModifierProperty !== null && this.mood.hasAffinity(Affinity.Intrinsic)) {
      const moodModifier = moodModifierProperty.state;
      if (moodModifier !== null) {
        let superMood = this.mood.superState;
        if (superMood === void 0 || superMood === null) {
          const themeService = this.themeProvider.service;
          if (themeService !== void 0 && themeService !== null) {
            superMood = themeService.mood;
          }
        }
        if (superMood !== void 0 && superMood !== null) {
          const mood = moodModifier.timesCol(superMood, true);
          this.mood.setState(mood, Affinity.Intrinsic);
        }
      } else {
        this.mood.setAffinity(Affinity.Inherited);
      }
    }
  }

  /** @internal */
  protected changeTheme(): void {
    const themeModifierProperty = this.getFastener("themeModifier", Property) as Property<this, MoodMatrix | null> | null;
    if (themeModifierProperty !== null && this.theme.hasAffinity(Affinity.Intrinsic)) {
      const themeModifier = themeModifierProperty.state;
      if (themeModifier !== null) {
        let superTheme = this.theme.superState;
        if (superTheme === void 0 || superTheme === null) {
          const themeService = this.themeProvider.service;
          if (themeService !== void 0 && themeService !== null) {
            superTheme = themeService.theme;
          }
        }
        if (superTheme !== void 0 && superTheme !== null) {
          const theme = superTheme.transform(themeModifier, true);
          this.theme.setState(theme, Affinity.Intrinsic);
        }
      } else {
        this.theme.setAffinity(Affinity.Inherited);
      }
    }
  }

  /** @internal */
  protected updateTheme(timing?: AnyTiming | boolean): void {
    this.changeMood();
    this.changeTheme();
    const theme = this.theme.state;
    const mood = this.mood.state;
    if (theme !== null && mood !== null) {
      this.applyTheme(theme, mood, timing);
    }
  }

  /** @internal */
  protected mountTheme(): void {
    // hook
  }

  protected override onAttachFastener(fastenerName: string, fastener: Fastener): void {
    super.onAttachFastener(fastenerName, fastener);
    this.bindFastener(fastener);
  }

  protected bindFastener(fastener: Fastener): void {
    if ((fastener instanceof ViewRelation || fastener instanceof Gesture) && fastener.binds) {
      this.forEachChild(function (child: View): void {
        fastener.bindView(child, null);
      }, this);
    }
  }

  /** @internal */
  protected bindChildFasteners(child: View, target: View | null): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      this.bindChildFastener(fastener, child, target);
    }
  }

  /** @internal */
  protected bindChildFastener(fastener: Fastener, child: View, target: View | null): void {
    if (fastener instanceof ViewRelation || fastener instanceof Gesture) {
      fastener.bindView(child, target);
    }
  }

  /** @internal */
  protected unbindChildFasteners(child: View): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      this.unbindChildFastener(fastener, child);
    }
  }

  /** @internal */
  protected unbindChildFastener(fastener: Fastener, child: View): void {
    if (fastener instanceof ViewRelation || fastener instanceof Gesture) {
      fastener.unbindView(child);
    }
  }

  /** @internal @override */
  override decohereFastener(fastener: Fastener): void {
    super.decohereFastener(fastener);
    if (fastener instanceof Animator) {
      this.requireUpdate(View.NeedsAnimate);
    } else {
      this.requireUpdate(View.NeedsChange);
    }
  }

  /** @internal */
  override recohereFasteners(t?: number): void {
    const decoherent = this.decoherent;
    if (decoherent !== null) {
      const decoherentCount = decoherent.length;
      if (decoherentCount !== 0) {
        if (t === void 0) {
          t = performance.now();
        }
        (this as Mutable<this>).decoherent = null;
        for (let i = 0; i < decoherentCount; i += 1) {
          const fastener = decoherent[i]!;
          if (!(fastener instanceof Animator)) {
            fastener.recohere(t);
          } else {
            this.decohereFastener(fastener);
          }
        }
      }
    }
  }

  /** @internal */
  recohereAnimators(t: number): void {
    const decoherent = this.decoherent;
    if (decoherent !== null) {
      const decoherentCount = decoherent.length;
      if (decoherentCount !== 0) {
        (this as Mutable<this>).decoherent = null;
        for (let i = 0; i < decoherentCount; i += 1) {
          const fastener = decoherent[i]!;
          if (fastener instanceof Animator) {
            fastener.recohere(t);
          } else {
            this.decohereFastener(fastener);
          }
        }
      }
    }
  }

  /** @override */
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

  /** @internal */
  readonly constraints: ReadonlyArray<Constraint>;

  /** @override */
  hasConstraint(constraint: Constraint): boolean {
    return this.constraints.indexOf(constraint) >= 0;
  }

  /** @override */
  addConstraint(constraint: Constraint): void {
    const oldConstraints = this.constraints;
    const newConstraints = Arrays.inserted(constraint, oldConstraints);
    if (oldConstraints !== newConstraints) {
      (this as Mutable<this>).constraints = newConstraints;
      this.activateConstraint(constraint);
    }
  }

  /** @override */
  removeConstraint(constraint: Constraint): void {
    const oldConstraints = this.constraints;
    const newConstraints = Arrays.removed(constraint, oldConstraints);
    if (oldConstraints !== newConstraints) {
      this.deactivateConstraint(constraint);
      (this as Mutable<this>).constraints = newConstraints;
    }
  }

  /** @internal @override */
  activateConstraint(constraint: Constraint): void {
    const layoutService = this.layoutProvider.service;
    if (layoutService !== void 0 && layoutService !== null) {
      layoutService.activateConstraint(constraint);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @internal @override */
  deactivateConstraint(constraint: Constraint): void {
    const layoutService = this.layoutProvider.service;
    if (layoutService !== void 0 && layoutService !== null) {
      layoutService.deactivateConstraint(constraint);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @override */
  constraintVariable(name: string, value?: number, strength?: AnyConstraintStrength): ConstraintProperty<unknown, number> {
    if (value === void 0) {
      value = 0;
    }
    if (strength !== void 0) {
      strength = ConstraintStrength.fromAny(strength);
    } else {
      strength = ConstraintStrength.Strong;
    }
    const property = ConstraintProperty.create(this) as ConstraintProperty<unknown, number>;
    Object.defineProperty(property, "name", {
      value: name,
      configurable: true,
    });
    if (value !== void 0) {
      property.setState(value);
    }
    property.setStrength(strength);
    property.mount();
    return property;
  }

  /** @internal */
  readonly constraintVariables: ReadonlyArray<ConstraintVariable>;

  /** @override */
  hasConstraintVariable(constraintVariable: ConstraintVariable): boolean {
    return this.constraintVariables.indexOf(constraintVariable) >= 0;
  }

  /** @override */
  addConstraintVariable(constraintVariable: ConstraintVariable): void {
    const oldConstraintVariables = this.constraintVariables;
    const newConstraintVariables = Arrays.inserted(constraintVariable, oldConstraintVariables);
    if (oldConstraintVariables !== newConstraintVariables) {
      (this as Mutable<this>).constraintVariables = newConstraintVariables;
      this.activateConstraintVariable(constraintVariable);
    }
  }

  /** @override */
  removeConstraintVariable(constraintVariable: ConstraintVariable): void {
    const oldConstraintVariables = this.constraintVariables;
    const newConstraintVariables = Arrays.removed(constraintVariable, oldConstraintVariables);
    if (oldConstraintVariables !== newConstraintVariables) {
      this.deactivateConstraintVariable(constraintVariable);
      (this as Mutable<this>).constraintVariables = newConstraintVariables;
    }
  }

  /** @internal @override */
  activateConstraintVariable(constraintVariable: ConstraintVariable): void {
    const layoutService = this.layoutProvider.service;
    if (layoutService !== void 0 && layoutService !== null) {
      layoutService.activateConstraintVariable(constraintVariable);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @internal @override */
  deactivateConstraintVariable(constraintVariable: ConstraintVariable): void {
    const layoutService = this.layoutProvider.service;
    if (layoutService !== void 0 && layoutService !== null) {
      layoutService.deactivateConstraintVariable(constraintVariable);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @internal @override */
  setConstraintVariable(constraintVariable: ConstraintVariable, state: number): void {
    const layoutService = this.layoutProvider.service;
    if (layoutService !== void 0 && layoutService !== null) {
      layoutService.setConstraintVariable(constraintVariable, state);
    }
  }

  /** @internal */
  evaluateConstraintVariables(): void {
    const constraintVariables = this.constraintVariables;
    for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
      const constraintVariable = constraintVariables[i]!;
      constraintVariable.evaluateConstraintVariable();
    }
  }

  /** @internal */
  protected activateLayout(): void {
    const layoutService = this.layoutProvider.service;
    if (layoutService !== void 0 && layoutService !== null) {
      const constraints = this.constraints;
      for (let i = 0, n = constraints.length; i < n; i += 1) {
        layoutService.activateConstraint(constraints[i]!);
      }
    }
  }

  /** @internal */
  protected deactivateLayout(): void {
    const layoutService = this.layoutProvider.service;
    if (layoutService !== void 0 && layoutService !== null) {
      const constraints = this.constraints;
      for (let i = 0, n = constraints.length; i < n; i += 1) {
        layoutService.deactivateConstraint(constraints[i]!);
      }
    }
  }

  /** @internal */
  setProperty(key: string, value: unknown, timing?: AnyTiming | boolean | null, affinity?: Affinity): void {
    const property = this.getLazyFastener(key, Property);
    if (property !== null) {
      if (property instanceof Animator) {
        property.setState(value, timing, affinity);
      } else {
        property.setState(value, affinity);
      }
    }
  }

  setProperties(properties: MemberPropertyInitMap<this>, timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  setProperties(properties: MemberPropertyInitMap<this>, timing?: AnyTiming | boolean | null, affinity?: Affinity): void;
  setProperties(properties: MemberPropertyInitMap<this>, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    if (typeof timing === "number") {
      affinity = timing;
      timing = void 0;
    }
    for (const key in properties) {
      const value = properties[key];
      this.setProperty(key, value, timing, affinity);
    }
  }

  /** @internal */
  get superViewContext(): ViewContext {
    const parent = this.parent;
    if (parent !== null) {
      return parent.viewContext;
    } else {
      const viewContext = this.viewportProvider.viewContext;
      return this.displayProvider.updatedViewContext(viewContext);
    }
  }

  /** @internal */
  extendViewContext(viewContext: ViewContext): ViewContextType<this> {
    return viewContext as ViewContextType<this>;
  }

  get viewContext(): ViewContextType<this> {
    if ((this.flags & View.ContextualFlag) !== 0) {
      return ViewContext.current as ViewContextType<this>;
    } else {
      return this.extendViewContext(this.superViewContext);
    }
  }

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
    const parent = this.parent;
    if (parent !== null) {
      return parent.pageTransform.transform(this.parentTransform);
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

  /** @internal */
  readonly observerCache: ViewObserverCache<this>;

  protected override onObserve(observer: ObserverType<this>): void {
    super.onObserve(observer);
    if (observer.viewWillResize !== void 0) {
      this.observerCache.viewWillResizeObservers = Arrays.inserted(observer as ViewWillResize, this.observerCache.viewWillResizeObservers);
    }
    if (observer.viewDidResize !== void 0) {
      this.observerCache.viewDidResizeObservers = Arrays.inserted(observer as ViewDidResize, this.observerCache.viewDidResizeObservers);
    }
    if (observer.viewWillScroll !== void 0) {
      this.observerCache.viewWillScrollObservers = Arrays.inserted(observer as ViewWillScroll, this.observerCache.viewWillScrollObservers);
    }
    if (observer.viewDidScroll !== void 0) {
      this.observerCache.viewDidScrollObservers = Arrays.inserted(observer as ViewDidScroll, this.observerCache.viewDidScrollObservers);
    }
    if (observer.viewWillChange !== void 0) {
      this.observerCache.viewWillChangeObservers = Arrays.inserted(observer as ViewWillChange, this.observerCache.viewWillChangeObservers);
    }
    if (observer.viewDidChange !== void 0) {
      this.observerCache.viewDidChangeObservers = Arrays.inserted(observer as ViewDidChange, this.observerCache.viewDidChangeObservers);
    }
    if (observer.viewWillAnimate !== void 0) {
      this.observerCache.viewWillAnimateObservers = Arrays.inserted(observer as ViewWillAnimate, this.observerCache.viewWillAnimateObservers);
    }
    if (observer.viewDidAnimate !== void 0) {
      this.observerCache.viewDidAnimateObservers = Arrays.inserted(observer as ViewDidAnimate, this.observerCache.viewDidAnimateObservers);
    }
    if (observer.viewWillLayout !== void 0) {
      this.observerCache.viewWillLayoutObservers = Arrays.inserted(observer as ViewWillLayout, this.observerCache.viewWillLayoutObservers);
    }
    if (observer.viewDidLayout !== void 0) {
      this.observerCache.viewDidLayoutObservers = Arrays.inserted(observer as ViewDidLayout, this.observerCache.viewDidLayoutObservers);
    }
  }

  protected override onUnobserve(observer: ObserverType<this>): void {
    super.onUnobserve(observer);
    if (observer.viewWillResize !== void 0) {
      this.observerCache.viewWillResizeObservers = Arrays.removed(observer as ViewWillResize, this.observerCache.viewWillResizeObservers);
    }
    if (observer.viewDidResize !== void 0) {
      this.observerCache.viewDidResizeObservers = Arrays.removed(observer as ViewDidResize, this.observerCache.viewDidResizeObservers);
    }
    if (observer.viewWillScroll !== void 0) {
      this.observerCache.viewWillScrollObservers = Arrays.removed(observer as ViewWillScroll, this.observerCache.viewWillScrollObservers);
    }
    if (observer.viewDidScroll !== void 0) {
      this.observerCache.viewDidScrollObservers = Arrays.removed(observer as ViewDidScroll, this.observerCache.viewDidScrollObservers);
    }
    if (observer.viewWillChange !== void 0) {
      this.observerCache.viewWillChangeObservers = Arrays.removed(observer as ViewWillChange, this.observerCache.viewWillChangeObservers);
    }
    if (observer.viewDidChange !== void 0) {
      this.observerCache.viewDidChangeObservers = Arrays.removed(observer as ViewDidChange, this.observerCache.viewDidChangeObservers);
    }
    if (observer.viewWillAnimate !== void 0) {
      this.observerCache.viewWillAnimateObservers = Arrays.removed(observer as ViewWillAnimate, this.observerCache.viewWillAnimateObservers);
    }
    if (observer.viewDidAnimate !== void 0) {
      this.observerCache.viewDidAnimateObservers = Arrays.removed(observer as ViewDidAnimate, this.observerCache.viewDidAnimateObservers);
    }
    if (observer.viewWillLayout !== void 0) {
      this.observerCache.viewWillLayoutObservers = Arrays.removed(observer as ViewWillLayout, this.observerCache.viewWillLayoutObservers);
    }
    if (observer.viewDidLayout !== void 0) {
      this.observerCache.viewDidLayoutObservers = Arrays.removed(observer as ViewDidLayout, this.observerCache.viewDidLayoutObservers);
    }
  }

  /** @override */
  init(init: ViewInit): void {
    if (init.mood !== void 0) {
      this.mood(init.mood);
    }
    if (init.moodModifier !== void 0) {
      this.moodModifier(init.moodModifier);
    }
    if (init.theme !== void 0) {
      this.theme(init.theme);
    }
    if (init.themeModifier !== void 0) {
      this.themeModifier(init.themeModifier);
    }
  }

  static create<S extends new () => InstanceType<S>>(this: S): InstanceType<S> {
    return new this();
  }

  static fromInit<S extends abstract new (...args: any[]) => InstanceType<S>>(this: S, init: InitType<InstanceType<S>>): InstanceType<S> {
    let type: Creatable<View>;
    if ((typeof init === "object" && init !== null || typeof init === "function") && Creatable.is((init as ViewInit).type)) {
      type = (init as ViewInit).type!;
    } else {
      type = this as unknown as Creatable<View>;
    }
    const view = type.create();
    view.init(init as ViewInit);
    return view as InstanceType<S>;
  }

  static fromAny<S extends abstract new (...args: any[]) => InstanceType<S>>(this: S, value: AnyView<InstanceType<S>>): InstanceType<S> {
    if (value === void 0 || value === null) {
      return value as InstanceType<S>;
    } else if (value instanceof View) {
      if (value instanceof this) {
        return value;
      } else {
        throw new TypeError(value + " not an instance of " + this);
      }
    } else if (Creatable.is(value)) {
      return (value as Creatable<InstanceType<S>>).create();
    } else {
      return (this as unknown as ViewFactory<InstanceType<S>>).fromInit(value);
    }
  }

  /** @internal */
  static override uid: () => number = (function () {
    let nextId = 1;
    return function uid(): number {
      const id = ~~nextId;
      nextId += 1;
      return id;
    }
  })();

  /** @internal */
  static override readonly MountedFlag: ViewFlags = Hierarchy.MountedFlag;
  /** @internal */
  static override readonly RemovingFlag: ViewFlags = Hierarchy.RemovingFlag;
  /** @internal */
  static override readonly TraversingFlag: ViewFlags = Hierarchy.TraversingFlag;
  /** @internal */
  static readonly ProcessingFlag: ViewFlags = 1 << (Hierarchy.FlagShift + 0);
  /** @internal */
  static readonly DisplayingFlag: ViewFlags = 1 << (Hierarchy.FlagShift + 1);
  /** @internal */
  static readonly ContextualFlag: ViewFlags = 1 << (Hierarchy.FlagShift + 2);
  /** @internal */
  static readonly CullFlag: ViewFlags = 1 << (Hierarchy.FlagShift + 3);
  /** @internal */
  static readonly CulledFlag: ViewFlags = 1 << (Hierarchy.FlagShift + 4);
  /** @internal */
  static readonly HideFlag: ViewFlags = 1 << (Hierarchy.FlagShift + 5);
  /** @internal */
  static readonly HiddenFlag: ViewFlags = 1 << (Hierarchy.FlagShift + 6);
  /** @internal */
  static readonly UnboundedFlag: ViewFlags = 1 << (Hierarchy.FlagShift + 7);
  /** @internal */
  static readonly IntangibleFlag: ViewFlags = 1 << (Hierarchy.FlagShift + 8);
  /** @internal */
  static readonly CulledMask: ViewFlags = View.CullFlag
                                        | View.CulledFlag;
  /** @internal */
  static readonly HiddenMask: ViewFlags = View.HideFlag
                                        | View.HiddenFlag;
  /** @internal */
  static readonly UpdatingMask: ViewFlags = View.ProcessingFlag
                                          | View.DisplayingFlag;
  /** @internal */
  static readonly StatusMask: ViewFlags = View.MountedFlag
                                        | View.RemovingFlag
                                        | View.TraversingFlag
                                        | View.ProcessingFlag
                                        | View.DisplayingFlag
                                        | View.ContextualFlag
                                        | View.CullFlag
                                        | View.CulledFlag
                                        | View.HiddenFlag
                                        | View.UnboundedFlag
                                        | View.IntangibleFlag;

  static readonly NeedsProcess: ViewFlags = 1 << (Hierarchy.FlagShift + 9);
  static readonly NeedsResize: ViewFlags = 1 << (Hierarchy.FlagShift + 10);
  static readonly NeedsScroll: ViewFlags = 1 << (Hierarchy.FlagShift + 11);
  static readonly NeedsChange: ViewFlags = 1 << (Hierarchy.FlagShift + 12);
  static readonly NeedsAnimate: ViewFlags = 1 << (Hierarchy.FlagShift + 13);
  static readonly NeedsProject: ViewFlags = 1 << (Hierarchy.FlagShift + 14);
  /** @internal */
  static readonly ProcessMask: ViewFlags = View.NeedsProcess
                                         | View.NeedsResize
                                         | View.NeedsScroll
                                         | View.NeedsChange
                                         | View.NeedsAnimate
                                         | View.NeedsProject;

  static readonly NeedsDisplay: ViewFlags = 1 << (Hierarchy.FlagShift + 15);
  static readonly NeedsLayout: ViewFlags = 1 << (Hierarchy.FlagShift + 16);
  static readonly NeedsRender: ViewFlags = 1 << (Hierarchy.FlagShift + 17);
  static readonly NeedsRasterize: ViewFlags = 1 << (Hierarchy.FlagShift + 18);
  static readonly NeedsComposite: ViewFlags = 1 << (Hierarchy.FlagShift + 19);
  /** @internal */
  static readonly DisplayMask: ViewFlags = View.NeedsDisplay
                                         | View.NeedsLayout
                                         | View.NeedsRender
                                         | View.NeedsRasterize
                                         | View.NeedsComposite;

  /** @internal */
  static readonly UpdateMask: ViewFlags = View.ProcessMask
                                        | View.DisplayMask;

  /** @internal */
  static override readonly FlagShift: number = Hierarchy.FlagShift + 20;
  /** @internal */
  static override readonly FlagMask: ViewFlags = (1 << View.FlagShift) - 1;

  static override readonly MountFlags: ViewFlags = Hierarchy.MountFlags | View.NeedsResize | View.NeedsChange | View.NeedsLayout;
  static readonly UncullFlags: ViewFlags = View.NeedsResize | View.NeedsChange | View.NeedsLayout;
  static override readonly InsertChildFlags: ViewFlags = Hierarchy.InsertChildFlags | View.NeedsLayout;
  static override readonly RemoveChildFlags: ViewFlags = Hierarchy.RemoveChildFlags | View.NeedsLayout;
}
