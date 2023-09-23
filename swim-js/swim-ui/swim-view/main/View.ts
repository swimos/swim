// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import {Lazy} from "@swim/util";
import type {FromLike} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import type {Creatable} from "@swim/util";
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {FastenerContext} from "@swim/component";
import type {Fastener} from "@swim/component";
import {Property} from "@swim/component";
import {Animator} from "@swim/component";
import {Provider} from "@swim/component";
import type {ComponentFlags} from "@swim/component";
import type {ComponentObserver} from "@swim/component";
import {Component} from "@swim/component";
import type {ConstraintExpressionLike} from "@swim/constraint";
import {ConstraintExpression} from "@swim/constraint";
import type {ConstraintVariable} from "@swim/constraint";
import {ConstraintProperty} from "@swim/constraint";
import type {ConstraintRelation} from "@swim/constraint";
import type {ConstraintStrengthLike} from "@swim/constraint";
import {ConstraintStrength} from "@swim/constraint";
import {Constraint} from "@swim/constraint";
import type {ConstraintScope} from "@swim/constraint";
import type {ConstraintContext} from "@swim/constraint";
import {R2Box} from "@swim/math";
import {Transform} from "@swim/math";
import {Look} from "@swim/theme";
import {Feel} from "@swim/theme";
import {Mood} from "@swim/theme";
import type {MoodVectorUpdates} from "@swim/theme";
import {MoodVector} from "@swim/theme";
import {MoodMatrix} from "@swim/theme";
import {ThemeMatrix} from "@swim/theme";
import type {ThemeContext} from "@swim/theme";
import {ViewRelation} from "./"; // forward import
import {Gesture} from "./"; // forward import
import type {LayoutViewport} from "./Viewport";
import type {VisualViewport} from "./Viewport";
import {ViewportService} from "./"; // forward import
import {DisplayerService} from "./"; // forward import
import {SolverService} from "./"; // forward import
import {StylerService} from "./"; // forward import

/** @public */
export type ViewIdiom = "unspecified" | "mobile" | "tablet" | "desktop";

/** @public */
export interface ViewInsets {
  readonly insetTop: number;
  readonly insetRight: number;
  readonly insetBottom: number;
  readonly insetLeft: number;
}

/** @public */
export const ViewInsets = {
  zero: Lazy(function (): ViewInsets {
    return Object.freeze({
      insetTop: 0,
      insetRight: 0,
      insetBottom: 0,
      insetLeft: 0,
    });
  }),

  equal(x: ViewInsets | null | undefined, y: ViewInsets | null | undefined): boolean {
    if (x === y) {
      return true;
    } else if (typeof x === "object" && x !== null && typeof y === "object" && y !== null) {
      return x.insetTop === y.insetTop
          && x.insetRight === y.insetRight
          && x.insetBottom === y.insetBottom
          && x.insetLeft === y.insetLeft;
    }
    return false;
  },
};

/** @public */
export type ViewFlags = ComponentFlags;

/** @public */
export interface ViewFactory<V extends View = View> extends Creatable<V>, FromLike<V> {
}

/** @public */
export interface ViewClass<V extends View = View> extends Function, ViewFactory<V> {
  readonly prototype: V;
}

/** @public */
export interface ViewConstructor<V extends View = View> extends ViewClass<V> {
  new(): V;
}

/** @public */
export interface ViewObserver<V extends View = View> extends ComponentObserver<V> {
  viewWillAttachParent?(parent: View, view: V): void;

  viewDidAttachParent?(parent: View, view: V): void;

  viewWillDetachParent?(parent: View, view: V): void;

  viewDidDetachParent?(parent: View, view: V): void;

  viewWillInsertChild?(child: View, target: View | null, view: V): void;

  viewDidInsertChild?(child: View, target: View | null, view: V): void;

  viewWillRemoveChild?(child: View, view: V): void;

  viewDidRemoveChild?(child: View, view: V): void;

  viewWillReinsertChild?(child: View, target: View | null, view: V): void;

  viewDidReinsertChild?(child: View, target: View | null, view: V): void;

  viewWillMount?(view: V): void;

  viewDidMount?(view: V): void;

  viewWillUnmount?(view: V): void;

  viewDidUnmount?(view: V): void;

  viewWillCull?(view: V): void;

  viewDidCull?(view: V): void;

  viewWillUncull?(view: V): void;

  viewDidUncull?(view: V): void;

  viewWillHide?(view: V): void;

  viewDidHide?(view: V): void;

  viewWillUnhide?(view: V): void;

  viewDidUnhide?(view: V): void;

  viewWillResize?(view: V): void;

  viewDidResize?(view: V): void;

  viewWillScroll?(view: V): void;

  viewDidScroll?(view: V): void;

  viewWillChange?(view: V): void;

  viewDidChange?(view: V): void;

  viewWillAnimate?(view: V): void;

  viewDidAnimate?(view: V): void;

  viewWillProject?(view: V): void;

  viewDidProject?(view: V): void;

  viewWillLayout?(view: V): void;

  viewDidLayout?(view: V): void;

  viewWillRender?(view: V): void;

  viewDidRender?(view: V): void;

  viewWillRasterize?(view: V): void;

  viewDidRasterize?(view: V): void;

  viewWillComposite?(view: V): void;

  viewDidComposite?(view: V): void;

  viewWillApplyTheme?(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, view: V): void;

  viewDidApplyTheme?(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, view: V): void;
}

/** @public */
export class View extends Component<View> implements ConstraintScope, ConstraintContext, ThemeContext, EventTarget {
  constructor() {
    super();
    this.constraints = null;
    this.constraintVariables = null;

    // Observer caches
    this.willAttachParentObservers = null;
    this.didAttachParentObservers = null;
    this.willDetachParentObservers = null;
    this.didDetachParentObservers = null;
    this.willInsertChildObservers = null;
    this.didInsertChildObservers = null;
    this.willRemoveChildObservers = null;
    this.didRemoveChildObservers = null;
    this.willMountObservers = null;
    this.didMountObservers = null;
    this.willUnmountObservers = null;
    this.didUnmountObservers = null;
    this.willResizeObservers = null;
    this.didResizeObservers = null;
    this.willScrollObservers = null;
    this.didScrollObservers = null;
    this.willChangeObservers = null;
    this.didChangeObservers = null;
    this.willAnimateObservers = null;
    this.didAnimateObservers = null;
    this.willProjectObservers = null;
    this.didProjectObservers = null;
    this.willLayoutObservers = null;
    this.didLayoutObservers = null;
    this.willRenderObservers = null;
    this.didRenderObservers = null;
    this.willRasterizeObservers = null;
    this.didRasterizeObservers = null;
    this.willCompositeObservers = null;
    this.didCompositeObservers = null;
  }

  declare readonly observerType?: Class<ViewObserver>;

  override get componentType(): Class<View> {
    return View;
  }

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

  /** @internal */
  protected willAttachParentObservers: Set<Required<Pick<ViewObserver, "viewWillAttachParent">>> | null;
  protected override willAttachParent(parent: View): void {
    const observers = this.willAttachParentObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillAttachParent(parent, this);
      }
    }
  }

  protected override onAttachParent(parent: View): void {
    // hook
  }

  /** @internal */
  protected didAttachParentObservers: Set<Required<Pick<ViewObserver, "viewDidAttachParent">>> | null;
  protected override didAttachParent(parent: View): void {
    const observers = this.didAttachParentObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewDidAttachParent(parent, this);
      }
    }
  }

  /** @internal */
  protected willDetachParentObservers: Set<Required<Pick<ViewObserver, "viewWillDetachParent">>> | null;
  protected override willDetachParent(parent: View): void {
    const observers = this.willDetachParentObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillDetachParent(parent, this);
      }
    }
  }

  protected override onDetachParent(parent: View): void {
    // hook
  }

  /** @internal */
  protected didDetachParentObservers: Set<Required<Pick<ViewObserver, "viewDidDetachParent">>> | null;
  protected override didDetachParent(parent: View): void {
    const observers = this.didDetachParentObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewDidDetachParent(parent, this);
      }
    }
  }

  /** @internal */
  protected willInsertChildObservers: Set<Required<Pick<ViewObserver, "viewWillInsertChild">>> | null;
  protected override willInsertChild(child: View, target: View | null): void {
    super.willInsertChild(child, target);
    const observers = this.willInsertChildObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillInsertChild(child, target, this);
      }
    }
  }

  protected override onInsertChild(child: View, target: View | null): void {
    super.onInsertChild(child, target);
  }

  /** @internal */
  protected didInsertChildObservers: Set<Required<Pick<ViewObserver, "viewDidInsertChild">>> | null;
  protected override didInsertChild(child: View, target: View | null): void {
    const observers = this.didInsertChildObservers;
    if (observers !== null) {
      for (const observer of observers) {
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

  /** @internal */
  protected willRemoveChildObservers: Set<Required<Pick<ViewObserver, "viewWillRemoveChild">>> | null;
  protected override willRemoveChild(child: View): void {
    super.willRemoveChild(child);
    const observers = this.willRemoveChildObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillRemoveChild(child, this);
      }
    }
  }

  protected override onRemoveChild(child: View): void {
    super.onRemoveChild(child);
  }

  /** @internal */
  protected didRemoveChildObservers: Set<Required<Pick<ViewObserver, "viewDidRemoveChild">>> | null;
  protected override didRemoveChild(child: View): void {
    const observers = this.didRemoveChildObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewDidRemoveChild(child, this);
      }
    }
    super.didRemoveChild(child);
  }

  protected override willReinsertChild(child: View, target: View | null): void {
    super.willReinsertChild(child, target);
    this.callObservers("viewWillReinsertChild", child, target, this);
  }

  protected override onReinsertChild(child: View, target: View | null): void {
    super.onReinsertChild(child, target);
  }

  protected override didReinsertChild(child: View, target: View | null): void {
    this.callObservers("viewDidReinsertChild", child, target, this);
    super.didReinsertChild(child, target);
  }

  /** @internal */
  override mount(): void {
    throw new Error();
  }

  protected willMountObservers: Set<Required<Pick<ViewObserver, "viewWillMount">>> | null;
  protected override willMount(): void {
    super.willMount();
    const observers = this.willMountObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillMount(this);
      }
    }
  }

  protected didMountObservers: Set<Required<Pick<ViewObserver, "viewDidMount">>> | null;
  protected override didMount(): void {
    // subsume super
    this.requestUpdate(this, this.flags & View.UpdateMask, false);
    this.requireUpdate(this.mountFlags);

    if (!this.culled && this.decoherent !== null && this.decoherent.length !== 0) {
      this.requireUpdate(View.NeedsChange | View.NeedsAnimate);
    }

    this.mountFasteners();

    this.activateLayout();
    const observers = this.didMountObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewDidMount(this);
      }
    }
    super.didMount();
  }

  /** @internal */
  override unmount(): void {
    throw new Error();
  }

  protected willUnmountObservers: Set<Required<Pick<ViewObserver, "viewWillUnmount">>> | null;
  protected override willUnmount(): void {
    super.willUnmount();
    const observers = this.willUnmountObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillUnmount(this);
      }
    }
    this.deactivateLayout();
  }

  protected didUnmountObservers: Set<Required<Pick<ViewObserver, "viewDidUnmount">>> | null;
  protected override didUnmount(): void {
    const observers = this.didUnmountObservers;
    if (observers !== null) {
      for (const observer of observers) {
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
    if ((this.flags & View.CullFlag) !== 0) {
      return;
    } else if ((this.flags & View.CulledFlag) !== 0) {
      this.setFlags(this.flags | View.CullFlag);
      return;
    }
    this.willCull();
    this.setFlags(this.flags | View.CullFlag);
    this.onCull();
    this.cullChildren();
    this.didCull();
  }

  protected willCull(): void {
    this.callObservers("viewWillCull", this);
  }

  protected onCull(): void {
    // hook
  }

  protected didCull(): void {
    this.callObservers("viewDidCull", this);
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
    if ((this.flags & View.CullFlag) === 0) {
      return;
    } else if ((this.flags & View.CulledFlag) !== 0) {
      this.setFlags(this.flags & ~View.CullFlag);
      return;
    }
    this.willUncull();
    this.setFlags(this.flags & ~View.CullFlag);
    this.uncullChildren();
    this.onUncull();
    this.didUncull();
  }

  get uncullFlags(): ViewFlags {
    return (this.constructor as typeof View).UncullFlags;
  }

  protected willUncull(): void {
    this.callObservers("viewWillUncull", this);
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
    this.callObservers("viewDidUncull", this);
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
    if ((this.flags & View.HideFlag) !== 0) {
      return;
    } else if ((this.flags & View.HiddenFlag) !== 0) {
      this.setFlags(this.flags | View.HideFlag);
      return;
    }
    this.willHide();
    this.setFlags(this.flags | View.HideFlag);
    this.onHide();
    this.hideChildren();
    this.didHide();
  }

  protected willHide(): void {
    this.callObservers("viewWillHide", this);
  }

  protected onHide(): void {
    // hook
  }

  protected didHide(): void {
    this.callObservers("viewDidHide", this);
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
    if ((this.flags & View.HideFlag) === 0) {
      return;
    } else if ((this.flags & View.HiddenFlag) !== 0) {
      this.setFlags(this.flags & ~View.HideFlag);
      return;
    }
    this.willUnhide();
    this.setFlags(this.flags & ~View.HideFlag);
    this.unhideChildren();
    this.onUnhide();
    this.didUnhide();
  }

  get unhideFlags(): ViewFlags {
    return (this.constructor as typeof View).UnhideFlags;
  }

  protected willUnhide(): void {
    this.callObservers("viewWillUnhide", this);
  }

  protected onUnhide(): void {
    this.requestUpdate(this, this.flags & View.UpdateMask, false);
    this.requireUpdate(this.uncullFlags);
  }

  protected didUnhide(): void {
    this.callObservers("viewDidUnhide", this);
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
    if (deltaUpdateFlags === 0) {
      return;
    }
    this.setFlags(flags | deltaUpdateFlags);
    this.requestUpdate(this, deltaUpdateFlags, immediate);
  }

  protected needsUpdate(updateFlags: ViewFlags, immediate: boolean): ViewFlags {
    return updateFlags;
  }

  requestUpdate(target: View, updateFlags: ViewFlags, immediate: boolean): void {
    if ((this.flags & View.CulledMask) === View.CulledFlag) {
      return; // culled root
    }
    updateFlags = this.needsUpdate(updateFlags, immediate);
    let deltaUpdateFlags = this.flags & ~updateFlags & View.UpdateMask;
    if ((updateFlags & View.ProcessMask) !== 0) {
      deltaUpdateFlags |= View.NeedsProcess;
    }
    if ((updateFlags & View.DisplayMask) !== 0) {
      deltaUpdateFlags |= View.NeedsDisplay;
    }
    if (deltaUpdateFlags === 0 && !immediate) {
      return;
    }
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
      if ((processFlags & View.ProcessMask) === 0) {
        return;
      }
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

      this.onProcess(cascadeFlags);
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

  /** @internal */
  protected willResizeObservers: Set<Required<Pick<ViewObserver, "viewWillResize">>> | null;
  protected willResize(): void {
    const observers = this.willResizeObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillResize(this);
      }
    }
    this.evaluateConstraintVariables();
  }

  protected onResize(): void {
    // hook
  }

  /** @internal */
  protected didResizeObservers: Set<Required<Pick<ViewObserver, "viewDidResize">>> | null;
  protected didResize(): void {
    const observers = this.didResizeObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewDidResize(this);
      }
    }
  }

  /** @internal */
  protected willScrollObservers: Set<Required<Pick<ViewObserver, "viewWillScroll">>> | null;
  protected willScroll(): void {
    const observers = this.willScrollObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillScroll(this);
      }
    }
  }

  protected onScroll(): void {
    // hook
  }

  /** @internal */
  protected didScrollObservers: Set<Required<Pick<ViewObserver, "viewDidScroll">>> | null;
  protected didScroll(): void {
    const observers = this.didScrollObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewDidScroll(this);
      }
    }
  }

  /** @internal */
  protected willChangeObservers: Set<Required<Pick<ViewObserver, "viewWillChange">>> | null;
  protected willChange(): void {
    const observers = this.willChangeObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillChange(this);
      }
    }
  }

  protected onChange(): void {
    this.recohereFasteners(this.updateTime);
  }

  /** @internal */
  protected didChangeObservers: Set<Required<Pick<ViewObserver, "viewDidChange">>> | null;
  protected didChange(): void {
    const observers = this.didChangeObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewDidChange(this);
      }
    }
  }

  /** @internal */
  protected willAnimateObservers: Set<Required<Pick<ViewObserver, "viewWillAnimate">>> | null;
  protected willAnimate(): void {
    const observers = this.willAnimateObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillAnimate(this);
      }
    }
  }

  protected onAnimate(): void {
    this.recohereAnimators(this.updateTime);
  }

  /** @internal */
  protected didAnimateObservers: Set<Required<Pick<ViewObserver, "viewDidAnimate">>> | null;
  protected didAnimate(): void {
    const observers = this.didAnimateObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewDidAnimate(this);
      }
    }
  }

  /** @internal */
  protected willProjectObservers: Set<Required<Pick<ViewObserver, "viewWillProject">>> | null;
  protected willProject(): void {
    const observers = this.willProjectObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillProject(this);
      }
    }
  }

  protected onProject(): void {
    // hook
  }

  /** @internal */
  protected didProjectObservers: Set<Required<Pick<ViewObserver, "viewDidProject">>> | null;
  protected didProject(): void {
    const observers = this.didProjectObservers;
    if (observers !== null) {
      for (const observer of observers) {
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
      if ((displayFlags & View.DisplayMask) === 0) {
        return;
      }
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

  /** @internal */
  protected willLayoutObservers: Set<Required<Pick<ViewObserver, "viewWillLayout">>> | null;
  protected willLayout(): void {
    const observers = this.willLayoutObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillLayout(this);
      }
    }
  }

  protected onLayout(): void {
    // hook
  }

  /** @internal */
  protected didLayoutObservers: Set<Required<Pick<ViewObserver, "viewDidLayout">>> | null;
  protected didLayout(): void {
    const observers = this.didLayoutObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewDidLayout(this);
      }
    }
  }

  /** @internal */
  protected willRenderObservers: Set<Required<Pick<ViewObserver, "viewWillRender">>> | null;
  protected willRender(): void {
    const observers = this.willRenderObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillRender(this);
      }
    }
  }

  protected onRender(): void {
    // hook
  }

  /** @internal */
  protected didRenderObservers: Set<Required<Pick<ViewObserver, "viewDidRender">>> | null;
  protected didRender(): void {
    const observers = this.didRenderObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewDidRender(this);
      }
    }
  }

  /** @internal */
  protected willRasterizeObservers: Set<Required<Pick<ViewObserver, "viewWillRasterize">>> | null;
  protected willRasterize(): void {
    const observers = this.willRasterizeObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillRasterize(this);
      }
    }
  }

  protected onRasterize(): void {
    // hook
  }

  /** @internal */
  protected didRasterizeObservers: Set<Required<Pick<ViewObserver, "viewDidRasterize">>> | null;
  protected didRasterize(): void {
    const observers = this.didRasterizeObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewDidRasterize(this);
      }
    }
  }

  /** @internal */
  protected willCompositeObservers: Set<Required<Pick<ViewObserver, "viewWillComposite">>> | null;
  protected willComposite(): void {
    const observers = this.willCompositeObservers;
    if (observers !== null) {
      for (const observer of observers) {
        observer.viewWillComposite(this);
      }
    }
  }

  protected onComposite(): void {
    // hook
  }

  /** @internal */
  protected didCompositeObservers: Set<Required<Pick<ViewObserver, "viewDidComposite">>> | null;
  protected didComposite(): void {
    const observers = this.didCompositeObservers;
    if (observers !== null) {
      for (const observer of observers) {
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

  @Provider({
    get serviceType(): typeof ViewportService { // avoid static forward reference
      return ViewportService;
    },
  })
  get viewport(): Provider<this, ViewportService> {
    return Provider.getter();
  }

  @Provider({
    get serviceType(): typeof DisplayerService { // avoid static forward reference
      return DisplayerService;
    },
    mountRootService(service: DisplayerService): void {
      super.mountRootService(service);
      service.roots.addView(this.owner);
    },
    unmountRootService(service: DisplayerService): void {
      super.unmountRootService(service);
      service.roots.removeView(this.owner);
    },
  })
  readonly updater!: Provider<this, DisplayerService>;

  @Provider({
    get serviceType(): typeof SolverService { // avoid static forward reference
      return SolverService;
    },
  })
  get solver(): Provider<this, SolverService> {
    return Provider.getter();
  }

  @Provider({
    get serviceType(): typeof StylerService { // avoid static forward reference
      return StylerService;
    },
    mountRootService(service: StylerService): void {
      super.mountRootService(service);
      service.roots.addView(this.owner);
    },
    unmountRootService(service: StylerService): void {
      super.unmountRootService(service);
      service.roots.removeView(this.owner);
    },
  })
  readonly styler!: Provider<this, StylerService>;

  @Property({
    valueType: MoodVector,
    value: null,
    affinity: Affinity.Inherited,
    inherits: true,
    init(): void {
      this.timing = void 0;
    },
    deriveValue(superMood: MoodVector | null): MoodVector | null {
      if (superMood !== null) {
        const moodModifierProperty = this.owner.moodModifier;
        const moodModifier = moodModifierProperty instanceof Property ? moodModifierProperty.value : null;
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
    timing: TimingLike | boolean | undefined,
  };

  @Property({
    valueType: ThemeMatrix,
    value: null,
    affinity: Affinity.Inherited,
    inherits: true,
    init(): void {
      this.timing = void 0;
    },
    deriveValue(superTheme: ThemeMatrix | null): ThemeMatrix | null {
      if (superTheme !== null) {
        const themeModifierProperty = this.owner.themeModifier;
        const themeModifier = themeModifierProperty instanceof Property ? themeModifierProperty.value : null;
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
    timing: TimingLike | boolean | undefined,
  };

  /** @override */
  getLook<T>(look: Look<T>, mood?: MoodVector<Feel> | null): T | undefined {
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
  getLookOr<T, E>(look: Look<T>, elseValue: E): T | E;
  /** @override */
  getLookOr<T, E>(look: Look<T>, mood: MoodVector<Feel> | null, elseValue: E): T | E;
  getLookOr<T, E>(look: Look<T>, mood: MoodVector<Feel> | null | E, elseValue?: E): T | E {
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
  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: TimingLike | boolean): void {
    if (timing === void 0 && this.inserting) {
      timing = false;
    } else if (timing === void 0 || timing === true) {
      timing = theme.getOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromLike(timing);
    }
    this.willApplyTheme(theme, mood, timing);
    this.onApplyTheme(theme, mood, timing);
    this.didApplyTheme(theme, mood, timing);
  }

  protected willApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    this.callObservers("viewWillApplyTheme", theme, mood, timing, this);
  }

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    this.themeFsteners(theme, mood, timing);
  }

  protected didApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    this.callObservers("viewDidApplyTheme", theme, mood, timing, this);
  }

  /** @internal */
  protected themeFsteners(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!] as Fastener<any, any, any> | undefined;
      if (fastener !== void 0 && "applyTheme" in (fastener as any)) {
        (fastener as any).applyTheme(theme, mood, timing);
      }
    }
  }

  @Property({
    valueType: MoodMatrix,
    value: null,
    didSetValue(moodModifier: MoodMatrix | null): void {
      if (moodModifier === null || !this.owner.mood.hasAffinity(Affinity.Inherited)) {
        return;
      }
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
    },
  })
  readonly moodModifier!: Property<this, MoodMatrix | null>;

  modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: TimingLike | boolean): void {
    if (!this.moodModifier.hasAffinity(Affinity.Intrinsic)) {
      return;
    }
    const oldMoodModifier = this.moodModifier.getValueOr(MoodMatrix.empty());
    const newMoodModifier = oldMoodModifier.updatedCol(feel, updates, true);
    if (newMoodModifier.equals(oldMoodModifier)) {
      return;
    }
    this.mood.timing = timing;
    this.moodModifier.setIntrinsic(newMoodModifier);
  }

  @Property({
    valueType: MoodMatrix,
    value: null,
    didSetValue(themeModifier: MoodMatrix | null): void {
      if (themeModifier === null || !this.owner.theme.hasAffinity(Affinity.Inherited)) {
        return;
      }
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
    },
  })
  readonly themeModifier!: Property<this, MoodMatrix | null>;

  modifyTheme(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: TimingLike | boolean): void;
  modifyTheme(cols: [feel: Feel, updates: MoodVectorUpdates<Feel> | undefined][], timing?: TimingLike | boolean): void;
  modifyTheme(feel: Feel | [feel: Feel, updates: MoodVectorUpdates<Feel> | undefined][], updates?: MoodVectorUpdates<Feel> | TimingLike | boolean, timing?: TimingLike | boolean): void {
    if (!this.themeModifier.hasAffinity(Affinity.Intrinsic)) {
      return;
    }
    const oldThemeModifier = this.themeModifier.getValueOr(MoodMatrix.empty());
    let newThemeModifier: MoodMatrix;
    if (feel instanceof Feel) {
      newThemeModifier = oldThemeModifier.updatedCol(feel, updates as MoodVectorUpdates<Feel>, true);
    } else {
      newThemeModifier = oldThemeModifier;
      const cols = feel as [feel: Feel, updates: MoodVectorUpdates<Feel> | undefined][];
      timing = updates as TimingLike | boolean;
      updates = void 0;
      for (let i = 0; i < cols.length; i += 1) {
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
      this.themeModifier.setIntrinsic(newThemeModifier);
    }
  }

  /** @override */
  getTransition(fastener: Fastener<any, any, any>): Timing | null {
    return this.getLookOr(Look.timing, null);
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

  /** @internal */
  protected override enqueueFastener(fastener: Fastener): void {
    super.enqueueFastener(fastener);
    if (fastener instanceof Animator) {
      this.requireUpdate(View.NeedsAnimate);
    } else {
      this.requireUpdate(View.NeedsChange);
    }
  }

  /** @internal */
  override recohereFasteners(t?: number): void {
    const decoherent = this.decoherent;
    if (decoherent === null || decoherent.length === 0) {
      return;
    } else if (t === void 0) {
      t = performance.now();
    }
    (this as Mutable<this>).coherentTime = t;
    (this as Mutable<this>).decoherent = null;
    (this as Mutable<this>).recohering = decoherent;
    try {
      for (let i = 0; i < decoherent.length; i += 1) {
        const fastener = decoherent[i]!;
        if (!(fastener instanceof Animator)) {
          fastener.recohere(t);
        } else {
          this.enqueueFastener(fastener);
        }
      }
    } finally {
      (this as Mutable<this>).recohering = null;
    }
  }

  /** @internal */
  recohereAnimators(t: number): void {
    const decoherent = this.decoherent;
    if (decoherent === null || decoherent.length === 0) {
      return;
    }
    // The passed-in update time parameter is used to ensure that all animators
    // update as if evaluated instantaneously. Jitter can occur if an update
    // pass takes longer than an animation frame. This is especially noticeable
    // when beginning new animations, such as when animating the insertion of
    // new views. Since animators base their timing functions on the time of
    // the first transition frame, update lag can truncate the important first
    // frames of an animation. To counter this effect, we use the current time
    // if more than 1/30 of a second has elapsed since the start of the update pass.
    const now = performance.now();
    if (now - t >= DisplayerService.MaxProcessInterval) {
      t = now;
    }
    (this as Mutable<this>).coherentTime = t;
    (this as Mutable<this>).decoherent = null;
    (this as Mutable<this>).recohering = decoherent;
    try {
      for (let i = 0; i < decoherent.length; i += 1) {
        const fastener = decoherent[i]!;
        if (fastener instanceof Animator) {
          fastener.recohere(t);
        } else {
          this.enqueueFastener(fastener);
        }
      }
    } finally {
      (this as Mutable<this>).recohering = null;
    }
  }

  /** @override */
  constraint(lhs: ConstraintExpressionLike, relation: ConstraintRelation,
             rhs?: ConstraintExpressionLike, strength?: ConstraintStrengthLike): Constraint {
    lhs = ConstraintExpression.fromLike(lhs);
    rhs = ConstraintExpression.fromLike(rhs);
    const expression = rhs !== void 0 ? lhs.minus(rhs) : lhs;
    if (strength === void 0) {
      strength = ConstraintStrength.Required;
    } else {
      strength = ConstraintStrength.fromLike(strength);
    }
    const constraint = new Constraint(this, expression, relation, strength);
    this.addConstraint(constraint);
    return constraint;
  }

  /** @internal */
  readonly constraints: ReadonlySet<Constraint> | null;

  /** @override */
  hasConstraint(constraint: Constraint): boolean {
    const constraints = this.constraints;
    return constraints !== null && constraints.has(constraint);
  }

  /** @override */
  addConstraint(constraint: Constraint): void {
    let constraints = this.constraints as Set<Constraint> | null;
    if (constraints === null) {
      constraints = new Set<Constraint>();
      (this as Mutable<this>).constraints = constraints;
    } else if (constraints.has(constraint)) {
      return;
    }
    constraints.add(constraint);
    this.activateConstraint(constraint);
  }

  /** @override */
  removeConstraint(constraint: Constraint): void {
    const constraints = this.constraints as Set<Constraint> | null;
    if (constraints === null || !constraints.has(constraint)) {
      return;
    }
    this.deactivateConstraint(constraint);
    constraints.delete(constraint);
  }

  /** @internal @override */
  activateConstraint(constraint: Constraint): void {
    const solverService = this.solver.service;
    if (solverService === null) {
      return;
    }
    solverService.activateConstraint(constraint);
    this.requireUpdate(View.NeedsLayout);
  }

  /** @internal @override */
  deactivateConstraint(constraint: Constraint): void {
    const solverService = this.solver.service;
    if (solverService === null) {
      return;
    }
    solverService.deactivateConstraint(constraint);
    this.requireUpdate(View.NeedsLayout);
  }

  /** @override */
  constraintVariable(name: string, value?: number, strength?: ConstraintStrengthLike): ConstraintProperty<unknown, number> {
    if (value === void 0) {
      value = 0;
    }
    if (strength !== void 0) {
      strength = ConstraintStrength.fromLike(strength);
    } else {
      strength = ConstraintStrength.Strong;
    }
    const property = ConstraintProperty.create(this) as ConstraintProperty<unknown, number>;
    Object.defineProperty(property, "name", {
      value: name,
      configurable: true,
    });
    if (value !== void 0) {
      property.set(value);
    }
    property.setStrength(strength);
    property.mount();
    return property;
  }

  /** @internal */
  readonly constraintVariables: ReadonlySet<ConstraintVariable> | null;

  /** @override */
  hasConstraintVariable(constraintVariable: ConstraintVariable): boolean {
    const constraintVariables = this.constraintVariables;
    return constraintVariables !== null && constraintVariables.has(constraintVariable);
  }

  /** @override */
  addConstraintVariable(constraintVariable: ConstraintVariable): void {
    let constraintVariables = this.constraintVariables as Set<ConstraintVariable> | null;
    if (constraintVariables === null) {
      constraintVariables = new Set<ConstraintVariable>();
      (this as Mutable<this>).constraintVariables = constraintVariables;
    } else if (constraintVariables.has(constraintVariable)) {
      return;
    }
    constraintVariables.add(constraintVariable);
    this.activateConstraintVariable(constraintVariable);
  }

  /** @override */
  removeConstraintVariable(constraintVariable: ConstraintVariable): void {
    const constraintVariables = this.constraintVariables as Set<ConstraintVariable> | null;
    if (constraintVariables === null || !constraintVariables.has(constraintVariable)) {
      return;
    }
    this.deactivateConstraintVariable(constraintVariable);
    constraintVariables.delete(constraintVariable);
  }

  /** @internal @override */
  activateConstraintVariable(constraintVariable: ConstraintVariable): void {
    const solverService = this.solver.service;
    if (solverService === null) {
      return;
    }
    solverService.activateConstraintVariable(constraintVariable);
    this.requireUpdate(View.NeedsLayout);
  }

  /** @internal @override */
  deactivateConstraintVariable(constraintVariable: ConstraintVariable): void {
    const solverService = this.solver.service;
    if (solverService === null) {
      return;
    }
    solverService.deactivateConstraintVariable(constraintVariable);
    this.requireUpdate(View.NeedsLayout);
  }

  /** @internal @override */
  setConstraintVariable(constraintVariable: ConstraintVariable, value: number): void {
    const solverService = Provider.tryService(this, "solver");
    if (solverService === null) {
      return;
    }
    solverService.setConstraintVariable(constraintVariable, value);
  }

  /** @internal */
  evaluateConstraintVariables(): void {
    const constraintVariables = this.constraintVariables;
    if (constraintVariables === null) {
      return;
    }
    for (const constraintVariable of constraintVariables) {
      constraintVariable.evaluateConstraintVariable();
    }
  }

  /** @internal */
  protected activateLayout(): void {
    const constraints = this.constraints;
    if (constraints === null) {
      return;
    }
    const solverService = this.solver.service;
    if (solverService === null || constraints === null) {
      return;
    }
    for (const constraint of constraints) {
      solverService.activateConstraint(constraint);
    }
  }

  /** @internal */
  protected deactivateLayout(): void {
    const constraints = this.constraints;
    if (constraints === null) {
      return;
    }
    const solverService = this.solver.service;
    if (solverService === null) {
      return;
    }
    for (const constraint of constraints) {
      solverService.deactivateConstraint(constraint);
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

  @Property({
    valueType: ViewInsets,
    value: ViewInsets.zero(),
    inherits: true,
    get updateFlags(): ViewFlags {
      return View.NeedsResize | View.NeedsScroll | View.NeedsLayout;
    },
    equalValues: ViewInsets.equal,
  })
  get edgeInsets(): Property<this, ViewInsets> {
    return Property.getter();
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

  protected override onObserve(observer: Observes<this>): void {
    super.onObserve(observer);
    if (observer.viewWillAttachParent !== void 0) {
      if (this.willAttachParentObservers === null) {
        this.willAttachParentObservers = new Set();
      }
      this.willAttachParentObservers.add(observer as Required<Pick<ViewObserver, "viewWillAttachParent">>);
    }
    if (observer.viewDidAttachParent !== void 0) {
      if (this.didAttachParentObservers === null) {
        this.didAttachParentObservers = new Set();
      }
      this.didAttachParentObservers.add(observer as Required<Pick<ViewObserver, "viewDidAttachParent">>);
    }
    if (observer.viewWillDetachParent !== void 0) {
      if (this.willDetachParentObservers === null) {
        this.willDetachParentObservers = new Set();
      }
      this.willDetachParentObservers.add(observer as Required<Pick<ViewObserver, "viewWillDetachParent">>);
    }
    if (observer.viewDidDetachParent !== void 0) {
      if (this.didDetachParentObservers === null) {
        this.didDetachParentObservers = new Set();
      }
      this.didDetachParentObservers.add(observer as Required<Pick<ViewObserver, "viewDidDetachParent">>);
    }
    if (observer.viewWillInsertChild !== void 0) {
      if (this.willInsertChildObservers === null) {
        this.willInsertChildObservers = new Set();
      }
      this.willInsertChildObservers.add(observer as Required<Pick<ViewObserver, "viewWillInsertChild">>);
    }
    if (observer.viewDidInsertChild !== void 0) {
      if (this.didInsertChildObservers === null) {
        this.didInsertChildObservers = new Set();
      }
      this.didInsertChildObservers.add(observer as Required<Pick<ViewObserver, "viewDidInsertChild">>);
    }
    if (observer.viewWillRemoveChild !== void 0) {
      if (this.willRemoveChildObservers === null) {
        this.willRemoveChildObservers = new Set();
      }
      this.willRemoveChildObservers.add(observer as Required<Pick<ViewObserver, "viewWillRemoveChild">>);
    }
    if (observer.viewDidRemoveChild !== void 0) {
      if (this.didRemoveChildObservers === null) {
        this.didRemoveChildObservers = new Set();
      }
      this.didRemoveChildObservers.add(observer as Required<Pick<ViewObserver, "viewDidRemoveChild">>);
    }
    if (observer.viewWillMount !== void 0) {
      if (this.willMountObservers === null) {
        this.willMountObservers = new Set();
      }
      this.willMountObservers.add(observer as Required<Pick<ViewObserver, "viewWillMount">>);
    }
    if (observer.viewDidMount !== void 0) {
      if (this.didMountObservers === null) {
        this.didMountObservers = new Set();
      }
      this.didMountObservers.add(observer as Required<Pick<ViewObserver, "viewDidMount">>);
    }
    if (observer.viewWillUnmount !== void 0) {
      if (this.willUnmountObservers === null) {
        this.willUnmountObservers = new Set();
      }
      this.willUnmountObservers.add(observer as Required<Pick<ViewObserver, "viewWillUnmount">>);
    }
    if (observer.viewDidUnmount !== void 0) {
      if (this.didUnmountObservers === null) {
        this.didUnmountObservers = new Set();
      }
      this.didUnmountObservers.add(observer as Required<Pick<ViewObserver, "viewDidUnmount">>);
    }
    if (observer.viewWillResize !== void 0) {
      if (this.willResizeObservers === null) {
        this.willResizeObservers = new Set();
      }
      this.willResizeObservers.add(observer as Required<Pick<ViewObserver, "viewWillResize">>);
    }
    if (observer.viewDidResize !== void 0) {
      if (this.didResizeObservers === null) {
        this.didResizeObservers = new Set();
      }
      this.didResizeObservers.add(observer as Required<Pick<ViewObserver, "viewDidResize">>);
    }
    if (observer.viewWillScroll !== void 0) {
      if (this.willScrollObservers === null) {
        this.willScrollObservers = new Set();
      }
      this.willScrollObservers.add(observer as Required<Pick<ViewObserver, "viewWillScroll">>);
    }
    if (observer.viewDidScroll !== void 0) {
      if (this.didScrollObservers === null) {
        this.didScrollObservers = new Set();
      }
      this.didScrollObservers.add(observer as Required<Pick<ViewObserver, "viewDidScroll">>);
    }
    if (observer.viewWillChange !== void 0) {
      if (this.willChangeObservers === null) {
        this.willChangeObservers = new Set();
      }
      this.willChangeObservers.add(observer as Required<Pick<ViewObserver, "viewWillChange">>);
    }
    if (observer.viewDidChange !== void 0) {
      if (this.didChangeObservers === null) {
        this.didChangeObservers = new Set();
      }
      this.didChangeObservers.add(observer as Required<Pick<ViewObserver, "viewDidChange">>);
    }
    if (observer.viewWillAnimate !== void 0) {
      if (this.willAnimateObservers === null) {
        this.willAnimateObservers = new Set();
      }
      this.willAnimateObservers.add(observer as Required<Pick<ViewObserver, "viewWillAnimate">>);
    }
    if (observer.viewDidAnimate !== void 0) {
      if (this.didAnimateObservers === null) {
        this.didAnimateObservers = new Set();
      }
      this.didAnimateObservers.add(observer as Required<Pick<ViewObserver, "viewDidAnimate">>);
    }
    if (observer.viewWillProject !== void 0) {
      if (this.willProjectObservers === null) {
        this.willProjectObservers = new Set();
      }
      this.willProjectObservers.add(observer as Required<Pick<ViewObserver, "viewWillProject">>);
    }
    if (observer.viewDidProject !== void 0) {
      if (this.didProjectObservers === null) {
        this.didProjectObservers = new Set();
      }
      this.didProjectObservers.add(observer as Required<Pick<ViewObserver, "viewDidProject">>);
    }
    if (observer.viewWillLayout !== void 0) {
      if (this.willLayoutObservers === null) {
        this.willLayoutObservers = new Set();
      }
      this.willLayoutObservers.add(observer as Required<Pick<ViewObserver, "viewWillLayout">>);
    }
    if (observer.viewDidLayout !== void 0) {
      if (this.didLayoutObservers === null) {
        this.didLayoutObservers = new Set();
      }
      this.didLayoutObservers.add(observer as Required<Pick<ViewObserver, "viewDidLayout">>);
    }
    if (observer.viewWillRender !== void 0) {
      if (this.willRenderObservers === null) {
        this.willRenderObservers = new Set();
      }
      this.willRenderObservers.add(observer as Required<Pick<ViewObserver, "viewWillRender">>);
    }
    if (observer.viewDidRender !== void 0) {
      if (this.didRenderObservers === null) {
        this.didRenderObservers = new Set();
      }
      this.didRenderObservers.add(observer as Required<Pick<ViewObserver, "viewDidRender">>);
    }
    if (observer.viewWillRasterize !== void 0) {
      if (this.willRasterizeObservers === null) {
        this.willRasterizeObservers = new Set();
      }
      this.willRasterizeObservers.add(observer as Required<Pick<ViewObserver, "viewWillRasterize">>);
    }
    if (observer.viewDidRasterize !== void 0) {
      if (this.didRasterizeObservers === null) {
        this.didRasterizeObservers = new Set();
      }
      this.didRasterizeObservers.add(observer as Required<Pick<ViewObserver, "viewDidRasterize">>);
    }
    if (observer.viewWillComposite !== void 0) {
      if (this.willCompositeObservers === null) {
        this.willCompositeObservers = new Set();
      }
      this.willCompositeObservers.add(observer as Required<Pick<ViewObserver, "viewWillComposite">>);
    }
    if (observer.viewDidComposite !== void 0) {
      if (this.didCompositeObservers === null) {
        this.didCompositeObservers = new Set();
      }
      this.didCompositeObservers.add(observer as Required<Pick<ViewObserver, "viewDidComposite">>);
    }
  }

  protected override onUnobserve(observer: Observes<this>): void {
    super.onUnobserve(observer);
    if (observer.viewWillAttachParent !== void 0 && this.willAttachParentObservers !== null) {
      this.willAttachParentObservers.delete(observer as Required<Pick<ViewObserver, "viewWillAttachParent">>);
    }
    if (observer.viewDidAttachParent !== void 0 && this.didAttachParentObservers !== null) {
      this.didAttachParentObservers.delete(observer as Required<Pick<ViewObserver, "viewDidAttachParent">>);
    }
    if (observer.viewWillDetachParent !== void 0 && this.willDetachParentObservers !== null) {
      this.willDetachParentObservers.delete(observer as Required<Pick<ViewObserver, "viewWillDetachParent">>);
    }
    if (observer.viewDidDetachParent !== void 0 && this.didDetachParentObservers !== null) {
      this.didDetachParentObservers.delete(observer as Required<Pick<ViewObserver, "viewDidDetachParent">>);
    }
    if (observer.viewWillInsertChild !== void 0 && this.willInsertChildObservers !== null) {
      this.willInsertChildObservers.delete(observer as Required<Pick<ViewObserver, "viewWillInsertChild">>);
    }
    if (observer.viewDidInsertChild !== void 0 && this.didInsertChildObservers !== null) {
      this.didInsertChildObservers.delete(observer as Required<Pick<ViewObserver, "viewDidInsertChild">>);
    }
    if (observer.viewWillRemoveChild !== void 0 && this.willRemoveChildObservers !== null) {
      this.willRemoveChildObservers.delete(observer as Required<Pick<ViewObserver, "viewWillRemoveChild">>);
    }
    if (observer.viewDidRemoveChild !== void 0 && this.didRemoveChildObservers !== null) {
      this.didRemoveChildObservers.delete(observer as Required<Pick<ViewObserver, "viewDidRemoveChild">>);
    }
    if (observer.viewWillMount !== void 0 && this.willMountObservers !== null) {
      this.willMountObservers.delete(observer as Required<Pick<ViewObserver, "viewWillMount">>);
    }
    if (observer.viewDidMount !== void 0 && this.didMountObservers !== null) {
      this.didMountObservers.delete(observer as Required<Pick<ViewObserver, "viewDidMount">>);
    }
    if (observer.viewWillUnmount !== void 0 && this.willUnmountObservers !== null) {
      this.willUnmountObservers.delete(observer as Required<Pick<ViewObserver, "viewWillUnmount">>);
    }
    if (observer.viewDidUnmount !== void 0 && this.didUnmountObservers !== null) {
      this.didUnmountObservers.delete(observer as Required<Pick<ViewObserver, "viewDidUnmount">>);
    }
    if (observer.viewWillResize !== void 0 && this.willResizeObservers !== null) {
      this.willResizeObservers.delete(observer as Required<Pick<ViewObserver, "viewWillResize">>);
    }
    if (observer.viewDidResize !== void 0 && this.didResizeObservers !== null) {
      this.didResizeObservers.delete(observer as Required<Pick<ViewObserver, "viewDidResize">>);
    }
    if (observer.viewWillScroll !== void 0 && this.willScrollObservers !== null) {
      this.willScrollObservers.delete(observer as Required<Pick<ViewObserver, "viewWillScroll">>);
    }
    if (observer.viewDidScroll !== void 0 && this.didScrollObservers !== null) {
      this.didScrollObservers.delete(observer as Required<Pick<ViewObserver, "viewDidScroll">>);
    }
    if (observer.viewWillChange !== void 0 && this.willChangeObservers !== null) {
      this.willChangeObservers.delete(observer as Required<Pick<ViewObserver, "viewWillChange">>);
    }
    if (observer.viewDidChange !== void 0 && this.didChangeObservers !== null) {
      this.didChangeObservers.delete(observer as Required<Pick<ViewObserver, "viewDidChange">>);
    }
    if (observer.viewWillAnimate !== void 0 && this.willAnimateObservers !== null) {
      this.willAnimateObservers.delete(observer as Required<Pick<ViewObserver, "viewWillAnimate">>);
    }
    if (observer.viewDidAnimate !== void 0 && this.didAnimateObservers !== null) {
      this.didAnimateObservers.delete(observer as Required<Pick<ViewObserver, "viewDidAnimate">>);
    }
    if (observer.viewWillProject !== void 0 && this.willProjectObservers !== null) {
      this.willProjectObservers.delete(observer as Required<Pick<ViewObserver, "viewWillProject">>);
    }
    if (observer.viewDidProject !== void 0 && this.didProjectObservers !== null) {
      this.didProjectObservers.delete(observer as Required<Pick<ViewObserver, "viewDidProject">>);
    }
    if (observer.viewWillLayout !== void 0 && this.willLayoutObservers !== null) {
      this.willLayoutObservers.delete(observer as Required<Pick<ViewObserver, "viewWillLayout">>);
    }
    if (observer.viewDidLayout !== void 0 && this.didLayoutObservers !== null) {
      this.didLayoutObservers.delete(observer as Required<Pick<ViewObserver, "viewDidLayout">>);
    }
    if (observer.viewWillRender !== void 0 && this.willRenderObservers !== null) {
      this.willRenderObservers.delete(observer as Required<Pick<ViewObserver, "viewWillRender">>);
    }
    if (observer.viewDidRender !== void 0 && this.didRenderObservers !== null) {
      this.didRenderObservers.delete(observer as Required<Pick<ViewObserver, "viewDidRender">>);
    }
    if (observer.viewWillRasterize !== void 0 && this.willRasterizeObservers !== null) {
      this.willRasterizeObservers.delete(observer as Required<Pick<ViewObserver, "viewWillRasterize">>);
    }
    if (observer.viewDidRasterize !== void 0 && this.didRasterizeObservers !== null) {
      this.didRasterizeObservers.delete(observer as Required<Pick<ViewObserver, "viewDidRasterize">>);
    }
    if (observer.viewWillComposite !== void 0 && this.willCompositeObservers !== null) {
      this.willCompositeObservers.delete(observer as Required<Pick<ViewObserver, "viewWillComposite">>);
    }
    if (observer.viewDidComposite !== void 0 && this.didCompositeObservers !== null) {
      this.didCompositeObservers.delete(observer as Required<Pick<ViewObserver, "viewDidComposite">>);
    }
  }

  /** @internal */
  static override uid: () => string = (function () {
    let nextId = 1;
    return function uid(): string {
      const id = ~~nextId;
      nextId += 1;
      return "view" + id;
    };
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
  static readonly CulledMask: ViewFlags = this.CullFlag
                                        | this.CulledFlag;
  /** @internal */
  static readonly HiddenMask: ViewFlags = this.HideFlag
                                        | this.HiddenFlag;
  /** @internal */
  static readonly UpdatingMask: ViewFlags = this.ProcessingFlag
                                          | this.DisplayingFlag;
  /** @internal */
  static readonly StatusMask: ViewFlags = this.MountedFlag
                                        | this.InsertingFlag
                                        | this.RemovingFlag
                                        | this.ProcessingFlag
                                        | this.DisplayingFlag
                                        | this.CullFlag
                                        | this.CulledFlag
                                        | this.HiddenFlag
                                        | this.UnboundedFlag
                                        | this.IntangibleFlag;

  static readonly NeedsProcess: ViewFlags = 1 << (Component.FlagShift + 8);
  static readonly NeedsResize: ViewFlags = 1 << (Component.FlagShift + 9);
  static readonly NeedsScroll: ViewFlags = 1 << (Component.FlagShift + 10);
  static readonly NeedsChange: ViewFlags = 1 << (Component.FlagShift + 11);
  static readonly NeedsAnimate: ViewFlags = 1 << (Component.FlagShift + 12);
  static readonly NeedsProject: ViewFlags = 1 << (Component.FlagShift + 13);
  /** @internal */
  static readonly ProcessMask: ViewFlags = this.NeedsProcess
                                         | this.NeedsResize
                                         | this.NeedsScroll
                                         | this.NeedsChange
                                         | this.NeedsAnimate
                                         | this.NeedsProject;

  static readonly NeedsDisplay: ViewFlags = 1 << (Component.FlagShift + 14);
  static readonly NeedsLayout: ViewFlags = 1 << (Component.FlagShift + 15);
  static readonly NeedsRender: ViewFlags = 1 << (Component.FlagShift + 16);
  static readonly NeedsRasterize: ViewFlags = 1 << (Component.FlagShift + 17);
  static readonly NeedsComposite: ViewFlags = 1 << (Component.FlagShift + 18);
  /** @internal */
  static readonly DisplayMask: ViewFlags = this.NeedsDisplay
                                         | this.NeedsLayout
                                         | this.NeedsRender
                                         | this.NeedsRasterize
                                         | this.NeedsComposite;

  /** @internal */
  static readonly UpdateMask: ViewFlags = this.ProcessMask
                                        | this.DisplayMask;

  /** @internal */
  static override readonly FlagShift: number = Component.FlagShift + 19;
  /** @internal */
  static override readonly FlagMask: ViewFlags = (1 << this.FlagShift) - 1;

  static override readonly MountFlags: ViewFlags = Component.MountFlags | this.NeedsResize | this.NeedsChange | this.NeedsLayout;
  static readonly UncullFlags: ViewFlags = this.NeedsResize | this.NeedsChange | this.NeedsLayout;
  static readonly UnhideFlags: ViewFlags = this.NeedsLayout;
  static override readonly InsertChildFlags: ViewFlags = Component.InsertChildFlags | this.NeedsLayout;
  static override readonly RemoveChildFlags: ViewFlags = Component.RemoveChildFlags | this.NeedsLayout;
  static override readonly ReinsertChildFlags: ViewFlags = Component.InsertChildFlags | this.NeedsLayout;
}
