// Copyright 2015-2022 Swim.inc
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
  Instance,
  Arrays,
  FromAny,
  AnyTiming,
  Timing,
  Creatable,
  Inits,
  Initable,
  Observes,
} from "@swim/util";
import {
  Affinity,
  FastenerClass,
  Fastener,
  Property,
  Animator,
  Provider,
  ComponentFlags,
  ComponentInit,
  Component,
} from "@swim/component";
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
import type {ViewIdiom} from "./ViewIdiom";
import {ViewInsets} from "./ViewInsets";
import type {
  ViewObserver,
  ViewWillInsertChild,
  ViewDidInsertChild,
  ViewWillRemoveChild,
  ViewDidRemoveChild,
  ViewWillResize,
  ViewDidResize,
  ViewWillScroll,
  ViewDidScroll,
  ViewWillChange,
  ViewDidChange,
  ViewWillAnimate,
  ViewDidAnimate,
  ViewWillProject,
  ViewDidProject,
  ViewWillLayout,
  ViewDidLayout,
  ViewWillRender,
  ViewDidRender,
  ViewWillRasterize,
  ViewDidRasterize,
  ViewWillComposite,
  ViewDidComposite,
  ViewObserverCache,
} from "./ViewObserver";
import {ViewRelation} from "./"; // forward import
import {Gesture} from "../"; // forward import
import type {LayoutViewport} from "../viewport/LayoutViewport";
import type {VisualViewport} from "../viewport/VisualViewport";
import {ViewportService} from "../"; // forward import
import {DisplayerService} from "../"; // forward import
import {SolverService} from "../"; // forward import
import {StylerService} from "../"; // forward import

/** @public */
export type ViewFlags = ComponentFlags;

/** @public */
export type AnyView<V extends View = View> = V | ViewFactory<V> | Inits<V>;

/** @public */
export interface ViewInit extends ComponentInit {
  type?: Creatable<View>;
  key?: string;
  children?: AnyView[];

  mood?: MoodVector;
  moodModifier?: MoodMatrix;
  theme?: ThemeMatrix;
  themeModifier?: MoodMatrix;
}

/** @public */
export interface ViewFactory<V extends View = View, U = AnyView<V>> extends Creatable<V>, FromAny<V, U> {
  fromInit(init: Inits<V>): V;
}

/** @public */
export interface ViewClass<V extends View = View, U = AnyView<V>> extends Function, ViewFactory<V, U> {
  readonly prototype: V;
}

/** @public */
export interface ViewConstructor<V extends View = View, U = AnyView<V>> extends ViewClass<V, U> {
  new(): V;
}

/** @public */
export class View extends Component<View> implements Initable<ViewInit>, ConstraintScope, ConstraintContext, ThemeContext, EventTarget {
  constructor() {
    super();
    this.observerCache = {};
    this.constraints = Arrays.empty;
    this.constraintVariables = Arrays.empty;
  }

  override get componentType(): Class<View> {
    return View;
  }

  override readonly observerType?: Class<ViewObserver>;

  /** @internal */
  override attachParent(parent: View, nextSibling: View | null): void {
    // assert(this.parent === null);
    this.willAttachParent(parent);
    (this as Mutable<this>).parent = parent;
    let previousSibling: View | null;
    if (nextSibling !== null) {
      previousSibling = nextSibling.previousSibling;
      this.setNextSibling(nextSibling);
      nextSibling.setPreviousSibling(this);
    } else {
      previousSibling = parent.lastChild;
      parent.setLastChild(this);
    }
    if (previousSibling !== null) {
      previousSibling.setNextSibling(this);
      this.setPreviousSibling(previousSibling);
    } else {
      parent.setFirstChild(this);
    }
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

  override setChild<V extends View>(key: string, newChild: V): View | null;
  override setChild<F extends Class<Instance<F, View>> & Creatable<InstanceType<F>>>(key: string, factory: F): View | null;
  override setChild(key: string, newChild: AnyView | null): View | null;
  override setChild(key: string, newChild: AnyView | null): View | null {
    if (newChild !== null) {
      newChild = View.fromAny(newChild);
    }
    return super.setChild(key, newChild) as View | null;
  }

  override appendChild<V extends View>(child: V, key?: string): V;
  override appendChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(factory: F, key?: string): InstanceType<F>;
  override appendChild(child: AnyView, key?: string): View;
  override appendChild(child: AnyView, key?: string): View {
    child = View.fromAny(child);
    return super.appendChild(child, key);
  }

  override prependChild<V extends View>(child: V, key?: string): V;
  override prependChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(factory: F, key?: string): InstanceType<F>;
  override prependChild(child: AnyView, key?: string): View;
  override prependChild(child: AnyView, key?: string): View {
    child = View.fromAny(child);
    return super.prependChild(child, key);
  }

  override insertChild<V extends View>(child: V, target: View | null, key?: string): V;
  override insertChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(factory: F, target: View | null, key?: string): InstanceType<F>;
  override insertChild(child: AnyView, target: View | null, key?: string): View;
  override insertChild(child: AnyView, target: View | null, key?: string): View {
    child = View.fromAny(child);
    return super.insertChild(child, target, key);
  }

  override reinsertChild(child: View, target: View | null): void {
    super.reinsertChild(child, target);
  }

  override replaceChild<V extends View>(newChild: View, oldChild: V): V;
  override replaceChild<V extends View>(newChild: AnyView, oldChild: V): V;
  override replaceChild(newChild: AnyView, oldChild: View): View {
    newChild = View.fromAny(newChild);
    return super.replaceChild(newChild, oldChild);
  }

  protected override willInsertChild(child: View, target: View | null): void {
    super.willInsertChild(child, target);
    const observers = this.observerCache.viewWillInsertChildObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillInsertChild(child, target, this);
      }
    }
  }

  protected override onInsertChild(child: View, target: View | null): void {
    super.onInsertChild(child, target);
  }

  protected override didInsertChild(child: View, target: View | null): void {
    const observers = this.observerCache.viewDidInsertChildObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidInsertChild(child, target, this);
      }
    }
    super.didInsertChild(child, target);
  }

  /** @internal */
  override cascadeInsert(updateFlags?: ViewFlags): void {
    if ((this.flags & View.MountedFlag) !== 0) {
      if (updateFlags === void 0) {
        updateFlags = 0;
      }
      updateFlags |= this.flags & View.UpdateMask;
      if ((updateFlags & View.ProcessMask) !== 0) {
        this.cascadeProcess(updateFlags);
      }
    }
  }

  protected override willRemoveChild(child: View): void {
    super.willRemoveChild(child);
    const observers = this.observerCache.viewWillRemoveChildObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillRemoveChild(child, this);
      }
    }
  }

  protected override onRemoveChild(child: View): void {
    super.onRemoveChild(child);
  }

  protected override didRemoveChild(child: View): void {
    const observers = this.observerCache.viewDidRemoveChildObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidRemoveChild(child, this);
      }
    }
    super.didRemoveChild(child);
  }

  protected override willReinsertChild(child: View, target: View | null): void {
    super.willReinsertChild(child, target);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillReinsertChild !== void 0) {
        observer.viewWillReinsertChild(child, target, this);
      }
    }
  }

  protected override onReinsertChild(child: View, target: View | null): void {
    super.onReinsertChild(child, target);
  }

  protected override didReinsertChild(child: View, target: View | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidReinsertChild !== void 0) {
        observer.viewDidReinsertChild(child, target, this);
      }
    }
    super.didReinsertChild(child, target);
  }

  /** @internal */
  override mount(): void {
    throw new Error();
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

  /** @internal */
  override unmount(): void {
    throw new Error();
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
      if ((flags & View.CullFlag) === 0) {
        this.willCull();
        this.setFlags(flags | View.CulledFlag);
        this.onCull();
        this.cullChildren();
        this.didCull();
      } else {
        this.setFlags(flags | View.CulledFlag);
      }
    } else if (!culled && (flags & View.CulledFlag) !== 0) {
      if ((flags & View.CullFlag) === 0) {
        this.willUncull();
        this.setFlags(flags & ~View.CulledFlag);
        this.uncullChildren();
        this.onUncull();
        this.didUncull();
      } else {
        this.setFlags(flags & ~View.CulledFlag);
      }
    }
  }

  /** @internal */
  cascadeCull(): void {
    if ((this.flags & View.CullFlag) === 0) {
      if ((this.flags & View.CulledFlag) === 0) {
        this.willCull();
        this.setFlags(this.flags | View.CullFlag);
        this.onCull();
        this.cullChildren();
        this.didCull();
      } else {
        this.setFlags(this.flags | View.CullFlag);
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
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      child.cascadeCull();
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent cull");
      }
      child = next;
    }
  }

  /** @internal */
  cascadeUncull(): void {
    if ((this.flags & View.CullFlag) !== 0) {
      if ((this.flags & View.CulledFlag) === 0) {
        this.willUncull();
        this.setFlags(this.flags & ~View.CullFlag);
        this.uncullChildren();
        this.onUncull();
        this.didUncull();
      } else {
        this.setFlags(this.flags & ~View.CullFlag);
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

    if (this.mood.derived) {
      this.mood.decohere();
    }
    if (this.theme.derived) {
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
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      child.cascadeUncull();
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent uncull");
      }
      child = next;
    }
  }

  /**
   * Returns `true` if this view is ineligible for rendering and hit testing,
   * and should be excluded from its parent's layout and hit bounds.
   */
  get hidden(): boolean {
    return (this.flags & View.HiddenMask) !== 0;
  }

  /**
   * Makes this view ineligible for rendering and hit testing, and excludes
   * this view from its parent's layout and hit bounds, when `hidden` is `true`.
   * Makes this view eligible for rendering and hit testing, and includes this
   * view in its parent's layout and hit bounds, when `hidden` is `false`.
   */
  setHidden(hidden: boolean): void {
    const flags = this.flags;
    if (hidden && (flags & View.HiddenFlag) === 0) {
      this.setFlags(flags | View.HiddenFlag);
      if ((flags & View.HideFlag) === 0) {
        this.willHide();
        this.onHide();
        this.hideChildren();
        this.didHide();
      }
    } else if (!hidden && (flags & View.HiddenFlag) !== 0) {
      this.setFlags(flags & ~View.HiddenFlag);
      if ((flags & View.HideFlag) === 0) {
        this.willUnhide();
        this.unhideChildren();
        this.onUnhide();
        this.didUnhide();
      }
    }
  }

  /** @internal */
  cascadeHide(): void {
    if ((this.flags & View.HideFlag) === 0) {
      if ((this.flags & View.HiddenFlag) === 0) {
        this.willHide();
        this.setFlags(this.flags | View.HideFlag);
        this.onHide();
        this.hideChildren();
        this.didHide();
      } else {
        this.setFlags(this.flags | View.HideFlag);
      }
    }
  }

  protected willHide(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillHide !== void 0) {
        observer.viewWillHide(this);
      }
    }
  }

  protected onHide(): void {
    // hook
  }

  protected didHide(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidHide !== void 0) {
        observer.viewDidHide(this);
      }
    }
  }

  /** @internal */
  protected hideChildren(): void {
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      child.cascadeHide();
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent hide");
      }
      child = next;
    }
  }

  cascadeUnhide(): void {
    if ((this.flags & View.HideFlag) !== 0) {
      if ((this.flags & View.HiddenFlag) === 0) {
        this.willUnhide();
        this.setFlags(this.flags & ~View.HideFlag);
        this.unhideChildren();
        this.onUnhide();
        this.didUnhide();
      } else {
        this.setFlags(this.flags & ~View.HideFlag);
      }
    }
  }

  get unhideFlags(): ViewFlags {
    return (this.constructor as typeof View).UnhideFlags;
  }

  protected willUnhide(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillUnhide !== void 0) {
        observer.viewWillUnhide(this);
      }
    }
  }

  protected onUnhide(): void {
    this.requestUpdate(this, this.flags & View.UpdateMask, false);
    this.requireUpdate(this.uncullFlags);
  }

  protected didUnhide(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidUnhide !== void 0) {
        observer.viewDidUnhide(this);
      }
    }
  }

  /** @internal */
  protected unhideChildren(): void {
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      child.cascadeUnhide();
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent unhide");
      }
      child = next;
    }
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
          const updaterService = this.updater.service;
          if (updaterService !== null) {
            updaterService.requestUpdate(target, updateFlags, immediate);
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

  protected needsProcess(processFlags: ViewFlags): ViewFlags {
    return processFlags;
  }

  cascadeProcess(processFlags: ViewFlags): void {
    try {
      processFlags &= ~View.NeedsProcess;
      processFlags |= this.flags & View.UpdateMask;
      processFlags = this.needsProcess(processFlags);
      if ((processFlags & View.ProcessMask) !== 0) {
        let cascadeFlags = processFlags;
        this.setFlags(this.flags & ~View.NeedsProcess | View.ProcessingFlag);
        this.willProcess(cascadeFlags);
        if (((this.flags | processFlags) & View.NeedsResize) !== 0) {
          cascadeFlags |= View.NeedsResize;
          this.setFlags(this.flags & ~View.NeedsResize);
          this.willResize();
        }
        if (((this.flags | processFlags) & View.NeedsScroll) !== 0) {
          cascadeFlags |= View.NeedsScroll;
          this.setFlags(this.flags & ~View.NeedsScroll);
          this.willScroll();
        }
        if (((this.flags | processFlags) & View.NeedsChange) !== 0) {
          cascadeFlags |= View.NeedsChange;
          this.setFlags(this.flags & ~View.NeedsChange);
          this.willChange();
        }
        if (((this.flags | processFlags) & View.NeedsAnimate) !== 0) {
          cascadeFlags |= View.NeedsAnimate;
          this.setFlags(this.flags & ~View.NeedsAnimate);
          this.willAnimate();
        }
        if (((this.flags | processFlags) & View.NeedsProject) !== 0) {
          cascadeFlags |= View.NeedsProject;
          this.setFlags(this.flags & ~View.NeedsProject);
          this.willProject();
        }

        this.onProcess(cascadeFlags, );
        if ((cascadeFlags & View.NeedsResize) !== 0) {
          this.onResize();
        }
        if ((cascadeFlags & View.NeedsScroll) !== 0) {
          this.onScroll();
        }
        if ((cascadeFlags & View.NeedsChange) !== 0) {
          this.onChange();
        }
        if ((cascadeFlags & View.NeedsAnimate) !== 0) {
          this.onAnimate();
        }
        if ((cascadeFlags & View.NeedsProject) !== 0) {
          this.onProject();
        }

        if ((cascadeFlags & View.ProcessMask) !== 0) {
          this.processChildren(cascadeFlags, this.processChild);
        }

        if ((cascadeFlags & View.NeedsProject) !== 0) {
          this.didProject();
        }
        if ((cascadeFlags & View.NeedsAnimate) !== 0) {
          this.didAnimate();
        }
        if ((cascadeFlags & View.NeedsChange) !== 0) {
          this.didChange();
        }
        if ((cascadeFlags & View.NeedsScroll) !== 0) {
          this.didScroll();
        }
        if ((cascadeFlags & View.NeedsResize) !== 0) {
          this.didResize();
        }
        this.didProcess(cascadeFlags);
      }
    } finally {
      this.setFlags(this.flags & ~View.ProcessingFlag);
    }
  }

  protected willProcess(processFlags: ViewFlags): void {
    // hook
  }

  protected onProcess(processFlags: ViewFlags): void {
    // hook
  }

  protected didProcess(processFlags: ViewFlags): void {
    // hook
  }

  protected willResize(): void {
    const observers = this.observerCache.viewWillResizeObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillResize(this);
      }
    }
    this.evaluateConstraintVariables();
  }

  protected onResize(): void {
    // hook
  }

  protected didResize(): void {
    const observers = this.observerCache.viewDidResizeObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidResize(this);
      }
    }
  }

  protected willScroll(): void {
    const observers = this.observerCache.viewWillScrollObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillScroll(this);
      }
    }
  }

  protected onScroll(): void {
    // hook
  }

  protected didScroll(): void {
    const observers = this.observerCache.viewDidScrollObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidScroll(this);
      }
    }
  }

  protected willChange(): void {
    const observers = this.observerCache.viewWillChangeObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillChange(this);
      }
    }
  }

  protected onChange(): void {
    this.recohereFasteners(this.updateTime);
  }

  protected didChange(): void {
    const observers = this.observerCache.viewDidChangeObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidChange(this);
      }
    }
  }

  protected willAnimate(): void {
    const observers = this.observerCache.viewWillAnimateObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillAnimate(this);
      }
    }
  }

  protected onAnimate(): void {
    this.recohereAnimators(this.updateTime);
  }

  protected didAnimate(): void {
    const observers = this.observerCache.viewDidAnimateObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidAnimate(this);
      }
    }
  }

  protected willProject(): void {
    const observers = this.observerCache.viewWillProjectObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewWillProject(this);
      }
    }
  }

  protected onProject(): void {
    // hook
  }

  protected didProject(): void {
    const observers = this.observerCache.viewDidProjectObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewDidProject(this);
      }
    }
  }

  protected processChildren(processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      processChild.call(this, child, processFlags);
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent process pass");
      }
      child = next;
    }
  }

  protected processChild(child: View, processFlags: ViewFlags): void {
    child.cascadeProcess(processFlags);
  }

  get displaying(): boolean {
    return (this.flags & View.DisplayingFlag) !== 0;
  }

  protected needsDisplay(displayFlags: ViewFlags): ViewFlags {
    return displayFlags;
  }

  cascadeDisplay(displayFlags: ViewFlags): void {
    try {
      displayFlags &= ~View.NeedsDisplay;
      displayFlags |= this.flags & View.UpdateMask;
      displayFlags = this.needsDisplay(displayFlags);
      if ((displayFlags & View.DisplayMask) !== 0) {
        let cascadeFlags = displayFlags;
        this.setFlags(this.flags & ~View.NeedsDisplay | View.DisplayingFlag);
        this.willDisplay(cascadeFlags);
        if (((this.flags | displayFlags) & View.NeedsLayout) !== 0) {
          cascadeFlags |= View.NeedsLayout;
          this.setFlags(this.flags & ~View.NeedsLayout);
          this.willLayout();
        }
        if (((this.flags | displayFlags) & View.NeedsRender) !== 0) {
          cascadeFlags |= View.NeedsRender;
          this.setFlags(this.flags & ~View.NeedsRender);
          this.willRender();
        }
        if (((this.flags | displayFlags) & View.NeedsRasterize) !== 0) {
          cascadeFlags |= View.NeedsRasterize;
          this.setFlags(this.flags & ~View.NeedsRasterize);
          this.willRasterize();
        }
        if (((this.flags | displayFlags) & View.NeedsComposite) !== 0) {
          cascadeFlags |= View.NeedsComposite;
          this.setFlags(this.flags & ~View.NeedsComposite);
          this.willComposite();
        }

        this.onDisplay(cascadeFlags);
        if ((cascadeFlags & View.NeedsLayout) !== 0) {
          this.onLayout();
        }
        if ((cascadeFlags & View.NeedsRender) !== 0) {
          this.onRender();
        }
        if ((cascadeFlags & View.NeedsRasterize) !== 0) {
          this.onRasterize();
        }
        if ((cascadeFlags & View.NeedsComposite) !== 0) {
          this.onComposite();
        }

        if ((cascadeFlags & View.DisplayMask) !== 0 && !this.hidden && !this.culled) {
          this.displayChildren(cascadeFlags, this.displayChild);
        }

        if ((cascadeFlags & View.NeedsComposite) !== 0) {
          this.didComposite();
        }
        if ((cascadeFlags & View.NeedsRasterize) !== 0) {
          this.didRasterize();
        }
        if ((cascadeFlags & View.NeedsRender) !== 0) {
          this.didRender();
        }
        if ((cascadeFlags & View.NeedsLayout) !== 0) {
          this.didLayout();
        }
        this.didDisplay(cascadeFlags);
      }
    } finally {
      this.setFlags(this.flags & ~View.DisplayingFlag);
    }
  }

  protected willDisplay(displayFlags: ViewFlags): void {
    // hook
  }

  protected onDisplay(displayFlags: ViewFlags): void {
    // hook
  }

  protected didDisplay(displayFlags: ViewFlags): void {
    // hook
  }

  protected willLayout(): void {
    const observers = this.observerCache.viewWillLayoutObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillLayout(this);
      }
    }
  }

  protected onLayout(): void {
    // hook
  }

  protected didLayout(): void {
    const observers = this.observerCache.viewDidLayoutObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidLayout(this);
      }
    }
  }

  protected willRender(): void {
    const observers = this.observerCache.viewWillRenderObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewWillRender(this);
      }
    }
  }

  protected onRender(): void {
    // hook
  }

  protected didRender(): void {
    const observers = this.observerCache.viewDidRenderObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewDidRender(this);
      }
    }
  }

  protected willRasterize(): void {
    const observers = this.observerCache.viewWillRasterizeObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewWillRasterize(this);
      }
    }
  }

  protected onRasterize(): void {
    // hook
  }

  protected didRasterize(): void {
    const observers = this.observerCache.viewDidRasterizeObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewDidRasterize(this);
      }
    }
  }

  protected willComposite(): void {
    const observers = this.observerCache.viewWillCompositeObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewWillComposite(this);
      }
    }
  }

  protected onComposite(): void {
    // hook
  }

  protected didComposite(): void {
    const observers = this.observerCache.viewDidCompositeObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewDidComposite(this);
      }
    }
  }

  protected displayChildren(displayFlags: ViewFlags, displayChild: (this: this, child: View, displayFlags: ViewFlags) => void): void {
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      displayChild.call(this, child, displayFlags);
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent display pass");
      }
      child = next;
    }
  }

  protected displayChild(child: View, displayFlags: ViewFlags): void {
    child.cascadeDisplay(displayFlags);
  }

  get updateTime(): number {
    return this.updater.getService().updateTime;
  }

  @Provider<View["viewport"]>({
    get serviceType(): typeof ViewportService { // avoid static forward reference
      return ViewportService;
    },
  })
  readonly viewport!: Provider<this, ViewportService>;
  static readonly viewport: FastenerClass<View["viewport"]>;

  @Provider<View["updater"]>({
    get serviceType(): typeof DisplayerService { // avoid static forward reference
      return DisplayerService;
    },
    mountRootService(service: DisplayerService): void {
      Provider.prototype.mountRootService.call(this, service);
      service.roots.addView(this.owner);
    },
    unmountRootService(service: DisplayerService): void {
      Provider.prototype.unmountRootService.call(this, service);
      service.roots.removeView(this.owner);
    },
  })
  readonly updater!: Provider<this, DisplayerService>;
  static readonly updater: FastenerClass<View["updater"]>;

  @Provider<View["solver"]>({
    get serviceType(): typeof SolverService { // avoid static forward reference
      return SolverService;
    },
  })
  readonly solver!: Provider<this, SolverService>;
  static readonly solver: FastenerClass<View["solver"]>;

  @Provider<View["styler"]>({
    get serviceType(): typeof StylerService { // avoid static forward reference
      return StylerService;
    },
    mountRootService(service: StylerService): void {
      Provider.prototype.mountRootService.call(this, service);
      service.roots.addView(this.owner);
    },
    unmountRootService(service: StylerService): void {
      Provider.prototype.unmountRootService.call(this, service);
      service.roots.removeView(this.owner);
    },
  })
  readonly styler!: Provider<this, StylerService>;
  static readonly styler: FastenerClass<View["styler"]>;

  @Property<View["mood"]>({
    valueType: MoodVector,
    value: null,
    affinity: Affinity.Inherited,
    inherits: true,
    init(): void {
      this.timing = void 0;
    },
    transformInletValue(superMood: MoodVector | null): MoodVector | null {
      if (superMood !== null) {
        const moodModifierProperty = this.owner.getFastener<Property<unknown, MoodMatrix>>("moodModifier", Property);
        const moodModifier = moodModifierProperty !== null ? moodModifierProperty.value : null;
        if (moodModifier !== null) {
          superMood = moodModifier.timesCol(superMood, true);
        }
      }
      return superMood;
    },
    didSetValue(mood: MoodVector | null): void {
      const theme = this.owner.theme.value;
      if (theme !== null && mood !== null) {
        this.owner.applyTheme(theme, mood, this.timing);
        this.timing = void 0;
      }
    },
  })
  readonly mood!: Property<this, MoodVector | null> & {
    /** @internal */
    timing: AnyTiming | boolean | undefined,
  };

  @Property<View["theme"]>({
    valueType: ThemeMatrix,
    value: null,
    affinity: Affinity.Inherited,
    inherits: true,
    init(): void {
      this.timing = void 0;
    },
    transformInletValue(superTheme: ThemeMatrix | null): ThemeMatrix | null {
      if (superTheme !== null) {
        const themeModifierProperty = this.owner.getFastener<Property<unknown, MoodMatrix>>("themeModifier", Property);
        const themeModifier = themeModifierProperty !== null ? themeModifierProperty.value : null;
        if (themeModifier !== null) {
          superTheme = superTheme.transform(themeModifier, true);
        }
      }
      return superTheme;
    },
    didSetValue(theme: ThemeMatrix | null): void {
      const mood = this.owner.mood.value;
      if (theme !== null && mood !== null) {
        this.owner.applyTheme(theme, mood, this.timing);
        this.timing = void 0;
      }
    },
  })
  readonly theme!: Property<this, ThemeMatrix | null> & {
    /** @internal */
    timing: AnyTiming | boolean | undefined,
  };

  /** @override */
  getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined {
    const theme = this.theme.value;
    let value: T | undefined;
    if (theme !== null) {
      if (mood === void 0 || mood === null) {
        mood = this.mood.value;
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
    const theme = this.theme.value;
    let value: T | E;
    if (theme !== null) {
      if (mood === void 0 || mood === null) {
        mood = this.mood.value;
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
    if (timing === void 0 && this.inserting) {
      timing = false;
    } else if (timing === void 0 || timing === true) {
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

  @Property<View["moodModifier"]>({
    valueType: MoodMatrix,
    value: null,
    didSetValue(moodModifier: MoodMatrix | null): void {
      if (moodModifier !== null && this.owner.mood.hasAffinity(Affinity.Inherited)) {
        let superMood = this.owner.mood.inletValue;
        if (superMood === void 0 || superMood === null) {
          const stylerService = this.owner.styler.service;
          if (stylerService !== void 0 && stylerService !== null) {
            superMood = stylerService.mood.value;
          }
        }
        if (superMood !== void 0 && superMood !== null) {
          const mood = moodModifier.timesCol(superMood, true);
          this.owner.mood.setValue(mood, Affinity.Reflexive);
        }
      }
    },
  })
  readonly moodModifier!: Property<this, MoodMatrix | null>;

  modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: AnyTiming | boolean): void {
    if (this.moodModifier.hasAffinity(Affinity.Intrinsic)) {
      const oldMoodModifier = this.moodModifier.getValueOr(MoodMatrix.empty());
      const newMoodModifier = oldMoodModifier.updatedCol(feel, updates, true);
      if (!newMoodModifier.equals(oldMoodModifier)) {
        this.mood.timing = timing;
        this.moodModifier.setValue(newMoodModifier, Affinity.Intrinsic);
      }
    }
  }

  @Property<View["themeModifier"]>({
    valueType: MoodMatrix,
    value: null,
    didSetValue(themeModifier: MoodMatrix | null): void {
      if (themeModifier !== null && this.owner.theme.hasAffinity(Affinity.Inherited)) {
        let superTheme = this.owner.theme.inletValue;
        if (superTheme === void 0 || superTheme === null) {
          const stylerService = this.owner.styler.service;
          if (stylerService !== void 0 && stylerService !== null) {
            superTheme = stylerService.theme.value;
          }
        }
        if (superTheme !== void 0 && superTheme !== null) {
          const theme = superTheme.transform(themeModifier, true);
          this.owner.theme.setValue(theme, Affinity.Reflexive);
        }
      }
    },
  })
  readonly themeModifier!: Property<this, MoodMatrix | null>;

  modifyTheme(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: AnyTiming | boolean): void;
  modifyTheme(cols: [feel: Feel, updates: MoodVectorUpdates<Feel> | undefined][], timing?: AnyTiming | boolean): void;
  modifyTheme(feel: Feel | [feel: Feel, updates: MoodVectorUpdates<Feel> | undefined][], updates?: MoodVectorUpdates<Feel> | AnyTiming | boolean, timing?: AnyTiming | boolean): void {
    if (this.themeModifier.hasAffinity(Affinity.Intrinsic)) {
      const oldThemeModifier = this.themeModifier.getValueOr(MoodMatrix.empty());
      let newThemeModifier: MoodMatrix;
      if (feel instanceof Feel) {
        newThemeModifier = oldThemeModifier.updatedCol(feel, updates as MoodVectorUpdates<Feel>, true);
      } else {
        newThemeModifier = oldThemeModifier;
        const cols = feel as [feel: Feel, updates: MoodVectorUpdates<Feel> | undefined][];
        timing = updates as AnyTiming | boolean;
        updates = void 0;
        for (let i = 0, n = cols.length; i < n; i += 1) {
          [feel, updates] = cols[i]!;
          if (updates !== void 0) {
            newThemeModifier = newThemeModifier.updatedCol(feel, updates, true);
          } else {
            newThemeModifier = newThemeModifier.col(feel, void 0);
          }
        }
      }
      if (!newThemeModifier.equals(oldThemeModifier)) {
        this.theme.timing = timing;
        this.themeModifier.setValue(newThemeModifier, Affinity.Intrinsic);
      }
    }
  }

  /** @internal */
  protected override bindChildFastener(fastener: Fastener, child: View, target: View | null): void {
    super.bindChildFastener(fastener, child, target);
    if (fastener instanceof ViewRelation || fastener instanceof Gesture) {
      fastener.bindView(child, target);
    }
  }

  /** @internal */
  protected override unbindChildFastener(fastener: Fastener, child: View): void {
    if (fastener instanceof ViewRelation || fastener instanceof Gesture) {
      fastener.unbindView(child);
    }
    super.unbindChildFastener(fastener, child);
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
    const solverService = this.solver.service;
    if (solverService !== null) {
      solverService.activateConstraint(constraint);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @internal @override */
  deactivateConstraint(constraint: Constraint): void {
    const solverService = this.solver.service;
    if (solverService !== null) {
      solverService.deactivateConstraint(constraint);
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
      property.setValue(value);
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
    const solverService = this.solver.service;
    if (solverService !== null) {
      solverService.activateConstraintVariable(constraintVariable);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @internal @override */
  deactivateConstraintVariable(constraintVariable: ConstraintVariable): void {
    const solverService = this.solver.service;
    if (solverService !== null) {
      solverService.deactivateConstraintVariable(constraintVariable);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @internal @override */
  setConstraintVariable(constraintVariable: ConstraintVariable, value: number): void {
    const solverService = this.solver.service;
    if (solverService !== null) {
      solverService.setConstraintVariable(constraintVariable, value);
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
    const solverService = this.solver.service;
    if (solverService !== null) {
      const constraints = this.constraints;
      for (let i = 0, n = constraints.length; i < n; i += 1) {
        solverService.activateConstraint(constraints[i]!);
      }
    }
  }

  /** @internal */
  protected deactivateLayout(): void {
    const solverService = this.solver.service;
    if (solverService !== null) {
      const constraints = this.constraints;
      for (let i = 0, n = constraints.length; i < n; i += 1) {
        solverService.deactivateConstraint(constraints[i]!);
      }
    }
  }

  get layoutViewport(): LayoutViewport {
    return this.viewport.getService().layoutViewport.value;
  }

  get visualViewport(): VisualViewport {
    return this.viewport.getService().visualViewport.value;
  }

  get viewIdiom(): ViewIdiom {
    return this.viewport.getService().viewIdiom.value;
  }

  @Property<View["edgeInsets"]>({
    valueType: ViewInsets,
    value: ViewInsets.zero,
    inherits: true,
    updateFlags: View.NeedsResize | View.NeedsScroll | View.NeedsLayout,
    equalValues: ViewInsets.equal,
  })
  readonly edgeInsets!: Property<this, ViewInsets>;

  /**
   * Returns the transformation from the parent view coordinates to view
   * coordinates.
   */
  get parentTransform(): Transform {
    return Transform.identity();
  }

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

  get clientBounds(): R2Box {
    return R2Box.undefined();
  }

  intersectsViewport(): boolean {
    const bounds = this.clientBounds;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    return (bounds.top <= 0 && 0 < bounds.bottom || 0 <= bounds.top && bounds.top < viewportHeight)
        && (bounds.left <= 0 && 0 < bounds.right || 0 <= bounds.left && bounds.left < viewportWidth);
  }

  dispatchEvent(event: Event): boolean {
    return true; // nop
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): void {
    // nop
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): void {
    // nop
  }

  /** @internal */
  readonly observerCache: ViewObserverCache<this>;

  protected override onObserve(observer: Observes<this>): void {
    super.onObserve(observer);
    if (observer.viewWillInsertChild !== void 0) {
      this.observerCache.viewWillInsertChildObservers = Arrays.inserted(observer as ViewWillInsertChild, this.observerCache.viewWillInsertChildObservers);
    }
    if (observer.viewDidInsertChild !== void 0) {
      this.observerCache.viewDidInsertChildObservers = Arrays.inserted(observer as ViewDidInsertChild, this.observerCache.viewDidInsertChildObservers);
    }
    if (observer.viewWillRemoveChild !== void 0) {
      this.observerCache.viewWillRemoveChildObservers = Arrays.inserted(observer as ViewWillRemoveChild, this.observerCache.viewWillRemoveChildObservers);
    }
    if (observer.viewDidRemoveChild !== void 0) {
      this.observerCache.viewDidRemoveChildObservers = Arrays.inserted(observer as ViewDidRemoveChild, this.observerCache.viewDidRemoveChildObservers);
    }
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
    if (observer.viewWillProject !== void 0) {
      this.observerCache.viewWillProjectObservers = Arrays.inserted(observer as ViewWillProject, this.observerCache.viewWillProjectObservers);
    }
    if (observer.viewDidProject !== void 0) {
      this.observerCache.viewDidProjectObservers = Arrays.inserted(observer as ViewDidProject, this.observerCache.viewDidProjectObservers);
    }
    if (observer.viewWillLayout !== void 0) {
      this.observerCache.viewWillLayoutObservers = Arrays.inserted(observer as ViewWillLayout, this.observerCache.viewWillLayoutObservers);
    }
    if (observer.viewDidLayout !== void 0) {
      this.observerCache.viewDidLayoutObservers = Arrays.inserted(observer as ViewDidLayout, this.observerCache.viewDidLayoutObservers);
    }
    if (observer.viewWillRender !== void 0) {
      this.observerCache.viewWillRenderObservers = Arrays.inserted(observer as ViewWillRender, this.observerCache.viewWillRenderObservers);
    }
    if (observer.viewDidRender !== void 0) {
      this.observerCache.viewDidRenderObservers = Arrays.inserted(observer as ViewDidRender, this.observerCache.viewDidRenderObservers);
    }
    if (observer.viewWillRasterize !== void 0) {
      this.observerCache.viewWillRasterizeObservers = Arrays.inserted(observer as ViewWillRasterize, this.observerCache.viewWillRasterizeObservers);
    }
    if (observer.viewDidRasterize !== void 0) {
      this.observerCache.viewDidRasterizeObservers = Arrays.inserted(observer as ViewDidRasterize, this.observerCache.viewDidRasterizeObservers);
    }
    if (observer.viewWillComposite !== void 0) {
      this.observerCache.viewWillCompositeObservers = Arrays.inserted(observer as ViewWillComposite, this.observerCache.viewWillCompositeObservers);
    }
    if (observer.viewDidComposite !== void 0) {
      this.observerCache.viewDidCompositeObservers = Arrays.inserted(observer as ViewDidComposite, this.observerCache.viewDidCompositeObservers);
    }
  }

  protected override onUnobserve(observer: Observes<this>): void {
    super.onUnobserve(observer);
    if (observer.viewWillInsertChild !== void 0) {
      this.observerCache.viewWillInsertChildObservers = Arrays.removed(observer as ViewWillInsertChild, this.observerCache.viewWillInsertChildObservers);
    }
    if (observer.viewDidInsertChild !== void 0) {
      this.observerCache.viewDidInsertChildObservers = Arrays.removed(observer as ViewDidInsertChild, this.observerCache.viewDidInsertChildObservers);
    }
    if (observer.viewWillRemoveChild !== void 0) {
      this.observerCache.viewWillRemoveChildObservers = Arrays.removed(observer as ViewWillRemoveChild, this.observerCache.viewWillRemoveChildObservers);
    }
    if (observer.viewDidRemoveChild !== void 0) {
      this.observerCache.viewDidRemoveChildObservers = Arrays.removed(observer as ViewDidRemoveChild, this.observerCache.viewDidRemoveChildObservers);
    }
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
    if (observer.viewWillProject !== void 0) {
      this.observerCache.viewWillProjectObservers = Arrays.removed(observer as ViewWillProject, this.observerCache.viewWillProjectObservers);
    }
    if (observer.viewDidProject !== void 0) {
      this.observerCache.viewDidProjectObservers = Arrays.removed(observer as ViewDidProject, this.observerCache.viewDidProjectObservers);
    }
    if (observer.viewWillLayout !== void 0) {
      this.observerCache.viewWillLayoutObservers = Arrays.removed(observer as ViewWillLayout, this.observerCache.viewWillLayoutObservers);
    }
    if (observer.viewDidLayout !== void 0) {
      this.observerCache.viewDidLayoutObservers = Arrays.removed(observer as ViewDidLayout, this.observerCache.viewDidLayoutObservers);
    }
    if (observer.viewWillRender !== void 0) {
      this.observerCache.viewWillRenderObservers = Arrays.removed(observer as ViewWillRender, this.observerCache.viewWillRenderObservers);
    }
    if (observer.viewDidRender !== void 0) {
      this.observerCache.viewDidRenderObservers = Arrays.removed(observer as ViewDidRender, this.observerCache.viewDidRenderObservers);
    }
    if (observer.viewWillRasterize !== void 0) {
      this.observerCache.viewWillRasterizeObservers = Arrays.removed(observer as ViewWillRasterize, this.observerCache.viewWillRasterizeObservers);
    }
    if (observer.viewDidRasterize !== void 0) {
      this.observerCache.viewDidRasterizeObservers = Arrays.removed(observer as ViewDidRasterize, this.observerCache.viewDidRasterizeObservers);
    }
    if (observer.viewWillComposite !== void 0) {
      this.observerCache.viewWillCompositeObservers = Arrays.removed(observer as ViewWillComposite, this.observerCache.viewWillCompositeObservers);
    }
    if (observer.viewDidComposite !== void 0) {
      this.observerCache.viewDidCompositeObservers = Arrays.removed(observer as ViewDidComposite, this.observerCache.viewDidCompositeObservers);
    }
  }

  /** @override */
  override init(init: ViewInit): void {
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

  static override create<S extends new () => InstanceType<S>>(this: S): InstanceType<S> {
    return new this();
  }

  static override fromInit<S extends Class<Instance<S, View>>>(this: S, init: Inits<InstanceType<S>>): InstanceType<S> {
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

  static override fromAny<S extends Class<Instance<S, View>>>(this: S, value: AnyView<InstanceType<S>>): InstanceType<S> {
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
  static override uid: () => string = (function () {
    let nextId = 1;
    return function uid(): string {
      const id = ~~nextId;
      nextId += 1;
      return "view" + id;
    }
  })();

  /** @internal */
  static override readonly MountedFlag: ViewFlags = Component.MountedFlag;
  /** @internal */
  static override readonly InsertingFlag: ViewFlags = Component.InsertingFlag;
  /** @internal */
  static override readonly RemovingFlag: ViewFlags = Component.RemovingFlag;
  /** @internal */
  static readonly ProcessingFlag: ViewFlags = 1 << (Component.FlagShift + 0);
  /** @internal */
  static readonly DisplayingFlag: ViewFlags = 1 << (Component.FlagShift + 1);
  /** @internal */
  static readonly CullFlag: ViewFlags = 1 << (Component.FlagShift + 2);
  /** @internal */
  static readonly CulledFlag: ViewFlags = 1 << (Component.FlagShift + 3);
  /** @internal */
  static readonly HideFlag: ViewFlags = 1 << (Component.FlagShift + 4);
  /** @internal */
  static readonly HiddenFlag: ViewFlags = 1 << (Component.FlagShift + 5);
  /** @internal */
  static readonly UnboundedFlag: ViewFlags = 1 << (Component.FlagShift + 6);
  /** @internal */
  static readonly IntangibleFlag: ViewFlags = 1 << (Component.FlagShift + 7);
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
                                        | View.InsertingFlag
                                        | View.RemovingFlag
                                        | View.ProcessingFlag
                                        | View.DisplayingFlag
                                        | View.CullFlag
                                        | View.CulledFlag
                                        | View.HiddenFlag
                                        | View.UnboundedFlag
                                        | View.IntangibleFlag;

  static readonly NeedsProcess: ViewFlags = 1 << (Component.FlagShift + 8);
  static readonly NeedsResize: ViewFlags = 1 << (Component.FlagShift + 9);
  static readonly NeedsScroll: ViewFlags = 1 << (Component.FlagShift + 10);
  static readonly NeedsChange: ViewFlags = 1 << (Component.FlagShift + 11);
  static readonly NeedsAnimate: ViewFlags = 1 << (Component.FlagShift + 12);
  static readonly NeedsProject: ViewFlags = 1 << (Component.FlagShift + 13);
  /** @internal */
  static readonly ProcessMask: ViewFlags = View.NeedsProcess
                                         | View.NeedsResize
                                         | View.NeedsScroll
                                         | View.NeedsChange
                                         | View.NeedsAnimate
                                         | View.NeedsProject;

  static readonly NeedsDisplay: ViewFlags = 1 << (Component.FlagShift + 14);
  static readonly NeedsLayout: ViewFlags = 1 << (Component.FlagShift + 15);
  static readonly NeedsRender: ViewFlags = 1 << (Component.FlagShift + 16);
  static readonly NeedsRasterize: ViewFlags = 1 << (Component.FlagShift + 17);
  static readonly NeedsComposite: ViewFlags = 1 << (Component.FlagShift + 18);
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
  static override readonly FlagShift: number = Component.FlagShift + 19;
  /** @internal */
  static override readonly FlagMask: ViewFlags = (1 << View.FlagShift) - 1;

  static override readonly MountFlags: ViewFlags = Component.MountFlags | View.NeedsResize | View.NeedsChange | View.NeedsLayout;
  static readonly UncullFlags: ViewFlags = View.NeedsResize | View.NeedsChange | View.NeedsLayout;
  static readonly UnhideFlags: ViewFlags = View.NeedsLayout;
  static override readonly InsertChildFlags: ViewFlags = Component.InsertChildFlags | View.NeedsLayout;
  static override readonly RemoveChildFlags: ViewFlags = Component.RemoveChildFlags | View.NeedsLayout;
  static override readonly ReinsertChildFlags: ViewFlags = Component.InsertChildFlags | View.NeedsLayout;
}
