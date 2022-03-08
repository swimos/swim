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
import type {ViewportIdiom} from "../viewport/ViewportIdiom";
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

/** @public */
export type ViewContextType<V extends View> =
  V extends {readonly contextType?: Class<infer T>} ? T : never;

/** @public */
export type ViewFlags = ComponentFlags;

/** @public */
export type AnyView<V extends View = View> = V | ViewFactory<V> | InitType<V>;

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
  fromInit(init: InitType<V>): V;
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
export type ViewCreator<F extends (abstract new (...args: any) => V) & Creatable<InstanceType<F>>, V extends View = View> =
  (abstract new (...args: any) => InstanceType<F>) & Creatable<InstanceType<F>>;

/** @public */
export class View extends Component<View> implements Initable<ViewInit>, ConstraintScope, ConstraintContext, ThemeContext {
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

  readonly contextType?: Class<ViewContext>;

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
  override setChild<F extends ViewCreator<F>>(key: string, factory: F): View | null;
  override setChild(key: string, newChild: AnyView | null): View | null;
  override setChild(key: string, newChild: AnyView | null): View | null {
    if (newChild !== null) {
      newChild = View.fromAny(newChild);
    }
    return super.setChild(key, newChild) as View | null;
  }

  override appendChild<V extends View>(child: V, key?: string): V;
  override appendChild<F extends ViewCreator<F>>(factory: F, key?: string): InstanceType<F>;
  override appendChild(child: AnyView, key?: string): View;
  override appendChild(child: AnyView, key?: string): View {
    child = View.fromAny(child);
    return super.appendChild(child, key);
  }

  override prependChild<V extends View>(child: V, key?: string): V;
  override prependChild<F extends ViewCreator<F>>(factory: F, key?: string): InstanceType<F>;
  override prependChild(child: AnyView, key?: string): View;
  override prependChild(child: AnyView, key?: string): View {
    child = View.fromAny(child);
    return super.prependChild(child, key);
  }

  override insertChild<V extends View>(child: V, target: View | null, key?: string): V;
  override insertChild<F extends ViewCreator<F>>(factory: F, target: View | null, key?: string): InstanceType<F>;
  override insertChild(child: AnyView, target: View | null, key?: string): View;
  override insertChild(child: AnyView, target: View | null, key?: string): View {
    child = View.fromAny(child);
    return super.insertChild(child, target, key);
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

  cascadeProcess(processFlags: ViewFlags, baseViewContext: ViewContext): void {
    const viewContext = this.extendViewContext(baseViewContext);
    const outerViewContext = ViewContext.current;
    try {
      ViewContext.current = viewContext;
      processFlags &= ~View.NeedsProcess;
      processFlags |= this.flags & View.UpdateMask;
      processFlags = this.needsProcess(processFlags, viewContext);
      if ((processFlags & View.ProcessMask) !== 0) {
        let cascadeFlags = processFlags;
        this.setFlags(this.flags & ~View.NeedsProcess | (View.ProcessingFlag | View.ContextualFlag));
        this.willProcess(cascadeFlags, viewContext);
        if (((this.flags | processFlags) & View.NeedsResize) !== 0) {
          cascadeFlags |= View.NeedsResize;
          this.setFlags(this.flags & ~View.NeedsResize);
          this.willResize(viewContext);
        }
        if (((this.flags | processFlags) & View.NeedsScroll) !== 0) {
          cascadeFlags |= View.NeedsScroll;
          this.setFlags(this.flags & ~View.NeedsScroll);
          this.willScroll(viewContext);
        }
        if (((this.flags | processFlags) & View.NeedsChange) !== 0) {
          cascadeFlags |= View.NeedsChange;
          this.setFlags(this.flags & ~View.NeedsChange);
          this.willChange(viewContext);
        }
        if (((this.flags | processFlags) & View.NeedsAnimate) !== 0) {
          cascadeFlags |= View.NeedsAnimate;
          this.setFlags(this.flags & ~View.NeedsAnimate);
          this.willAnimate(viewContext);
        }
        if (((this.flags | processFlags) & View.NeedsProject) !== 0) {
          cascadeFlags |= View.NeedsProject;
          this.setFlags(this.flags & ~View.NeedsProject);
          this.willProject(viewContext);
        }

        this.onProcess(cascadeFlags, viewContext);
        if ((cascadeFlags & View.NeedsResize) !== 0) {
          this.onResize(viewContext);
        }
        if ((cascadeFlags & View.NeedsScroll) !== 0) {
          this.onScroll(viewContext);
        }
        if ((cascadeFlags & View.NeedsChange) !== 0) {
          this.onChange(viewContext);
        }
        if ((cascadeFlags & View.NeedsAnimate) !== 0) {
          this.onAnimate(viewContext);
        }
        if ((cascadeFlags & View.NeedsProject) !== 0) {
          this.onProject(viewContext);
        }

        if ((cascadeFlags & View.ProcessMask) !== 0) {
          this.setFlags(this.flags & ~View.ContextualFlag);
          this.processChildren(cascadeFlags, viewContext, this.processChild);
          this.setFlags(this.flags | View.ContextualFlag);
        }

        if ((cascadeFlags & View.NeedsProject) !== 0) {
          this.didProject(viewContext);
        }
        if ((cascadeFlags & View.NeedsAnimate) !== 0) {
          this.didAnimate(viewContext);
        }
        if ((cascadeFlags & View.NeedsChange) !== 0) {
          this.didChange(viewContext);
        }
        if ((cascadeFlags & View.NeedsScroll) !== 0) {
          this.didScroll(viewContext);
        }
        if ((cascadeFlags & View.NeedsResize) !== 0) {
          this.didResize(viewContext);
        }
        this.didProcess(cascadeFlags, viewContext);
      }
    } finally {
      this.setFlags(this.flags & ~(View.ProcessingFlag | View.ContextualFlag));
      ViewContext.current = outerViewContext;
    }
  }

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
    this.recohereFasteners(viewContext.updateTime);
    this.updateTheme();
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

  protected willProject(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewWillProjectObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewWillProject(viewContext, this);
      }
    }
  }

  protected onProject(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didProject(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewDidProjectObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewDidProject(viewContext, this);
      }
    }
  }

  protected processChildren(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                            processChild: (this: this, child: View, processFlags: ViewFlags,
                                           viewContext: ViewContextType<this>) => void): void {
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      processChild.call(this, child, processFlags, viewContext);
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent process pass");
      }
      child = next;
    }
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

  cascadeDisplay(displayFlags: ViewFlags, baseViewContext: ViewContext): void {
    const viewContext = this.extendViewContext(baseViewContext);
    const outerViewContext = ViewContext.current;
    try {
      ViewContext.current = viewContext;
      displayFlags &= ~View.NeedsDisplay;
      displayFlags |= this.flags & View.UpdateMask;
      displayFlags = this.needsDisplay(displayFlags, viewContext);
      if ((displayFlags & View.DisplayMask) !== 0) {
        let cascadeFlags = displayFlags;
        this.setFlags(this.flags & ~View.NeedsDisplay | (View.DisplayingFlag | View.ContextualFlag));
        this.willDisplay(cascadeFlags, viewContext);
        if (((this.flags | displayFlags) & View.NeedsLayout) !== 0) {
          cascadeFlags |= View.NeedsLayout;
          this.setFlags(this.flags & ~View.NeedsLayout);
          this.willLayout(viewContext);
        }
        if (((this.flags | displayFlags) & View.NeedsRender) !== 0) {
          cascadeFlags |= View.NeedsRender;
          this.setFlags(this.flags & ~View.NeedsRender);
          this.willRender(viewContext);
        }
        if (((this.flags | displayFlags) & View.NeedsRasterize) !== 0) {
          cascadeFlags |= View.NeedsRasterize;
          this.setFlags(this.flags & ~View.NeedsRasterize);
          this.willRasterize(viewContext);
        }
        if (((this.flags | displayFlags) & View.NeedsComposite) !== 0) {
          cascadeFlags |= View.NeedsComposite;
          this.setFlags(this.flags & ~View.NeedsComposite);
          this.willComposite(viewContext);
        }

        this.onDisplay(cascadeFlags, viewContext);
        if ((cascadeFlags & View.NeedsLayout) !== 0) {
          this.onLayout(viewContext);
        }
        if ((cascadeFlags & View.NeedsRender) !== 0) {
          this.onRender(viewContext);
        }
        if ((cascadeFlags & View.NeedsRasterize) !== 0) {
          this.onRasterize(viewContext);
        }
        if ((cascadeFlags & View.NeedsComposite) !== 0) {
          this.onComposite(viewContext);
        }

        if ((cascadeFlags & View.DisplayMask) !== 0 && !this.hidden && !this.culled) {
          this.setFlags(this.flags & ~View.ContextualFlag);
          this.displayChildren(cascadeFlags, viewContext, this.displayChild);
          this.setFlags(this.flags | View.ContextualFlag);
        }

        if ((cascadeFlags & View.NeedsComposite) !== 0) {
          this.didComposite(viewContext);
        }
        if ((cascadeFlags & View.NeedsRasterize) !== 0) {
          this.didRasterize(viewContext);
        }
        if ((cascadeFlags & View.NeedsRender) !== 0) {
          this.didRender(viewContext);
        }
        if ((cascadeFlags & View.NeedsLayout) !== 0) {
          this.didLayout(viewContext);
        }
        this.didDisplay(cascadeFlags, viewContext);
      }
    } finally {
      this.setFlags(this.flags & ~(View.DisplayingFlag | View.ContextualFlag));
      ViewContext.current = outerViewContext;
    }
  }

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

  protected willRender(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewWillRenderObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewWillRender(viewContext, this);
      }
    }
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didRender(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewDidRenderObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewDidRender(viewContext, this);
      }
    }
  }

  protected willRasterize(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewWillRasterizeObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewWillRasterize(viewContext, this);
      }
    }
  }

  protected onRasterize(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didRasterize(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewDidRasterizeObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewDidRasterize(viewContext, this);
      }
    }
  }

  protected willComposite(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewWillCompositeObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewWillComposite(viewContext, this);
      }
    }
  }

  protected onComposite(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didComposite(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewDidCompositeObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewDidComposite(viewContext, this);
      }
    }
  }

  protected displayChildren(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                            displayChild: (this: this, child: View, displayFlags: ViewFlags,
                                           viewContext: ViewContextType<this>) => void): void {
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      displayChild.call(this, child, displayFlags, viewContext);
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent display pass");
      }
      child = next;
    }
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

  @Property({type: MoodVector, value: null, inherits: true})
  readonly mood!: Property<this, MoodVector | null>;

  @Property({type: ThemeMatrix, value: null, inherits: true})
  readonly theme!: Property<this, ThemeMatrix | null>;

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

  @Property({type: MoodMatrix, value: null})
  readonly moodModifier!: Property<this, MoodMatrix | null>;

  @Property({type: MoodMatrix, value: null})
  readonly themeModifier!: Property<this, MoodMatrix | null>;

  /** @internal */
  modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: AnyTiming | boolean): void {
    if (this.moodModifier.hasAffinity(Affinity.Intrinsic)) {
      const oldMoodModifier = this.moodModifier.getValueOr(MoodMatrix.empty());
      const newMoodModifier = oldMoodModifier.updatedCol(feel, updates, true);
      if (!newMoodModifier.equals(oldMoodModifier)) {
        this.moodModifier.setValue(newMoodModifier, Affinity.Intrinsic);
        this.changeMood();
        if (timing !== void 0) {
          const theme = this.theme.value;
          const mood = this.mood.value;
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
      const oldThemeModifier = this.themeModifier.getValueOr(MoodMatrix.empty());
      const newThemeModifier = oldThemeModifier.updatedCol(feel, updates, true);
      if (!newThemeModifier.equals(oldThemeModifier)) {
        this.themeModifier.setValue(newThemeModifier, Affinity.Intrinsic);
        this.changeTheme();
        if (timing !== void 0) {
          const theme = this.theme.value;
          const mood = this.mood.value;
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
      const moodModifier = moodModifierProperty.value;
      if (moodModifier !== null) {
        let superMood = this.mood.superValue;
        if (superMood === void 0 || superMood === null) {
          const themeService = this.themeProvider.service;
          if (themeService !== void 0 && themeService !== null) {
            superMood = themeService.mood;
          }
        }
        if (superMood !== void 0 && superMood !== null) {
          const mood = moodModifier.timesCol(superMood, true);
          this.mood.setValue(mood, Affinity.Intrinsic);
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
      const themeModifier = themeModifierProperty.value;
      if (themeModifier !== null) {
        let superTheme = this.theme.superValue;
        if (superTheme === void 0 || superTheme === null) {
          const themeService = this.themeProvider.service;
          if (themeService !== void 0 && themeService !== null) {
            superTheme = themeService.theme;
          }
        }
        if (superTheme !== void 0 && superTheme !== null) {
          const theme = superTheme.transform(themeModifier, true);
          this.theme.setValue(theme, Affinity.Intrinsic);
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
    const theme = this.theme.value;
    const mood = this.mood.value;
    if (theme !== null && mood !== null) {
      this.applyTheme(theme, mood, timing);
    }
  }

  /** @internal */
  protected mountTheme(): void {
    // hook
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
  setConstraintVariable(constraintVariable: ConstraintVariable, value: number): void {
    const layoutService = this.layoutProvider.service;
    if (layoutService !== void 0 && layoutService !== null) {
      layoutService.setConstraintVariable(constraintVariable, value);
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
        property.setValue(value, affinity);
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

  get viewportIdiom(): ViewportIdiom {
    return this.viewContext.viewportIdiom;
  }

  get viewport(): Viewport {
    return this.viewContext.viewport;
  }

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
    const viewport = this.viewport;
    return new R2Box(0, 0, viewport.width, viewport.height);
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

  on(type: string, listener: EventListenerOrEventListenerObject,
     options?: AddEventListenerOptions | boolean): this {
    return this; // nop
  }

  off(type: string, listener: EventListenerOrEventListenerObject,
      options?: EventListenerOptions | boolean): this {
    return this; // nop
  }

  /** @internal */
  readonly observerCache: ViewObserverCache<this>;

  protected override onObserve(observer: ObserverType<this>): void {
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

  protected override onUnobserve(observer: ObserverType<this>): void {
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

  static override fromInit<S extends abstract new (...args: any) => InstanceType<S>>(this: S, init: InitType<InstanceType<S>>): InstanceType<S> {
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

  static override fromAny<S extends abstract new (...args: any) => InstanceType<S>>(this: S, value: AnyView<InstanceType<S>>): InstanceType<S> {
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
  static override readonly MountedFlag: ViewFlags = Component.MountedFlag;
  /** @internal */
  static override readonly RemovingFlag: ViewFlags = Component.RemovingFlag;
  /** @internal */
  static readonly ProcessingFlag: ViewFlags = 1 << (Component.FlagShift + 0);
  /** @internal */
  static readonly DisplayingFlag: ViewFlags = 1 << (Component.FlagShift + 1);
  /** @internal */
  static readonly ContextualFlag: ViewFlags = 1 << (Component.FlagShift + 2);
  /** @internal */
  static readonly CullFlag: ViewFlags = 1 << (Component.FlagShift + 3);
  /** @internal */
  static readonly CulledFlag: ViewFlags = 1 << (Component.FlagShift + 4);
  /** @internal */
  static readonly HideFlag: ViewFlags = 1 << (Component.FlagShift + 5);
  /** @internal */
  static readonly HiddenFlag: ViewFlags = 1 << (Component.FlagShift + 6);
  /** @internal */
  static readonly UnboundedFlag: ViewFlags = 1 << (Component.FlagShift + 7);
  /** @internal */
  static readonly IntangibleFlag: ViewFlags = 1 << (Component.FlagShift + 8);
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
                                        | View.ProcessingFlag
                                        | View.DisplayingFlag
                                        | View.ContextualFlag
                                        | View.CullFlag
                                        | View.CulledFlag
                                        | View.HiddenFlag
                                        | View.UnboundedFlag
                                        | View.IntangibleFlag;

  static readonly NeedsProcess: ViewFlags = 1 << (Component.FlagShift + 9);
  static readonly NeedsResize: ViewFlags = 1 << (Component.FlagShift + 10);
  static readonly NeedsScroll: ViewFlags = 1 << (Component.FlagShift + 11);
  static readonly NeedsChange: ViewFlags = 1 << (Component.FlagShift + 12);
  static readonly NeedsAnimate: ViewFlags = 1 << (Component.FlagShift + 13);
  static readonly NeedsProject: ViewFlags = 1 << (Component.FlagShift + 14);
  /** @internal */
  static readonly ProcessMask: ViewFlags = View.NeedsProcess
                                         | View.NeedsResize
                                         | View.NeedsScroll
                                         | View.NeedsChange
                                         | View.NeedsAnimate
                                         | View.NeedsProject;

  static readonly NeedsDisplay: ViewFlags = 1 << (Component.FlagShift + 15);
  static readonly NeedsLayout: ViewFlags = 1 << (Component.FlagShift + 16);
  static readonly NeedsRender: ViewFlags = 1 << (Component.FlagShift + 17);
  static readonly NeedsRasterize: ViewFlags = 1 << (Component.FlagShift + 18);
  static readonly NeedsComposite: ViewFlags = 1 << (Component.FlagShift + 19);
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
  static override readonly FlagShift: number = Component.FlagShift + 20;
  /** @internal */
  static override readonly FlagMask: ViewFlags = (1 << View.FlagShift) - 1;

  static override readonly MountFlags: ViewFlags = Component.MountFlags | View.NeedsResize | View.NeedsChange | View.NeedsLayout;
  static readonly UncullFlags: ViewFlags = View.NeedsResize | View.NeedsChange | View.NeedsLayout;
  static readonly UnhideFlags: ViewFlags = View.NeedsLayout;
  static override readonly InsertChildFlags: ViewFlags = Component.InsertChildFlags | View.NeedsLayout;
  static override readonly RemoveChildFlags: ViewFlags = Component.RemoveChildFlags | View.NeedsLayout;
}
