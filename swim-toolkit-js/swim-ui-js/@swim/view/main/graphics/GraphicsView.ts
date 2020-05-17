// Copyright 2015-2020 SWIM.AI inc.
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

import {BoxR2} from "@swim/math";
import {Transform} from "@swim/transform";
import {Animator} from "@swim/animate";
import {Renderer} from "@swim/render";
import {ViewScope} from "../scope/ViewScope";
import {ViewEvent, ViewMouseEvent, ViewEventHandler} from "../ViewEvent";
import {ViewControllerType, ViewFlags, View} from "../View";
import {ViewObserver} from "../ViewObserver";
import {LayoutAnchor} from "../layout/LayoutAnchor";
import {LayoutView} from "../layout/LayoutView";
import {MemberAnimator} from "../member/MemberAnimator";
import {AnimatedViewClass, AnimatedView} from "../animated/AnimatedView";
import {RenderedViewContext} from "../rendered/RenderedViewContext";
import {RenderedViewConstructor, RenderedView} from "../rendered/RenderedView";
import {GraphicsViewObserver} from "./GraphicsViewObserver";
import {GraphicsViewController} from "./GraphicsViewController";
import {CanvasView} from "../canvas/CanvasView";

export class GraphicsView extends View implements RenderedView {
  /** @hidden */
  _key?: string;
  /** @hidden */
  _parentView: View | null;
  /** @hidden */
  readonly _childViews: View[];
  /** @hidden */
  _childViewMap?: {[key: string]: View | undefined};
  /** @hidden */
  _viewController: ViewControllerType<this> | null;
  /** @hidden */
  _viewObservers?: ViewObserver[];
  /** @hidden */
  _viewFlags: ViewFlags;
  /** @hidden */
  _viewScopes?: {[scopeName: string]: ViewScope<View, unknown> | undefined};
  /** @hidden */
  _layoutAnchors?: {[anchorName: string]: LayoutAnchor<LayoutView> | undefined};
  /** @hidden */
  _memberAnimators?: {[animatorName: string]: Animator | undefined};
  /** @hidden */
  _viewFrame?: BoxR2;
  /** @hidden */
  _eventHandlers?: {[type: string]: ViewEventHandler[] | undefined};

  constructor() {
    super();
    this._parentView = null;
    this._childViews = [];
    this._viewController = null;
    this._viewFlags = 0;
  }

  get viewController(): GraphicsViewController | null {
    return this._viewController;
  }

  setViewController(newViewController: ViewControllerType<this> | null): void {
    const oldViewController = this._viewController;
    if (oldViewController !== newViewController) {
      this.willSetViewController(newViewController);
      if (oldViewController !== null) {
        oldViewController.setView(null);
      }
      this._viewController = newViewController;
      if (newViewController !== null) {
        newViewController.setView(this);
      }
      this.onSetViewController(newViewController);
      this.didSetViewController(newViewController);
    }
  }

  get viewObservers(): ReadonlyArray<ViewObserver> {
    let viewObservers = this._viewObservers;
    if (viewObservers === void 0) {
      viewObservers = [];
      this._viewObservers = viewObservers;
    }
    return viewObservers;
  }

  addViewObserver(viewObserver: ViewObserver): void {
    let viewObservers = this._viewObservers;
    let index: number;
    if (viewObservers === void 0) {
      viewObservers = [];
      this._viewObservers = viewObservers;
      index = -1;
    } else {
      index = viewObservers.indexOf(viewObserver);
    }
    if (index < 0) {
      this.willAddViewObserver(viewObserver);
      viewObservers.push(viewObserver);
      this.onAddViewObserver(viewObserver);
      this.didAddViewObserver(viewObserver);
    }
  }

  removeViewObserver(viewObserver: ViewObserver): void {
    const viewObservers = this._viewObservers;
    if (viewObservers !== void 0) {
      const index = viewObservers.indexOf(viewObserver);
      if (index >= 0) {
        this.willRemoveViewObserver(viewObserver);
        viewObservers.splice(index, 1);
        this.onRemoveViewObserver(viewObserver);
        this.didRemoveViewObserver(viewObserver);
      }
    }
  }

  get canvasView(): CanvasView | null {
    const parentView = this._parentView;
    return RenderedView.is(parentView) ? parentView.canvasView : null;
  }

  get key(): string | null {
    const key = this._key;
    return key !== void 0 ? key : null;
  }

  /** @hidden */
  setKey(key: string | null): void {
    if (key !== null) {
      this._key = key;
    } else if (this._key !== void 0) {
      this._key = void 0;
    }
  }

  get parentView(): View | null {
    return this._parentView;
  }

  /** @hidden */
  setParentView(newParentView: View | null, oldParentView: View | null) {
    this.willSetParentView(newParentView, oldParentView);
    this._parentView = newParentView;
    this.onSetParentView(newParentView, oldParentView);
    this.didSetParentView(newParentView, oldParentView);
  }

  get childViews(): ReadonlyArray<View> {
    return this._childViews;
  }

  getChildView(key: string): View | null {
    const childViewMap = this._childViewMap;
    if (childViewMap !== void 0) {
      const childView = childViewMap[key];
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  setChildView(key: string, newChildView: View | null): View | null {
    if (newChildView !== null) {
      if (!RenderedView.is(newChildView)) {
        throw new TypeError("" + newChildView);
      }
      newChildView.remove();
    }
    let index = -1;
    let oldChildView: View | null = null;
    let targetView: View | null = null;
    const childViews = this._childViews;
    const childViewMap = this._childViewMap;
    if (childViewMap !== void 0) {
      const childView = childViewMap[key];
      if (childView !== void 0) {
        index = childViews.indexOf(childView);
        // assert(index >= 0);
        oldChildView = childView;
        targetView = childViews[index + 1] || null;
        this.willRemoveChildView(childView);
        childView.setParentView(null, this);
        this.removeChildViewMap(childView);
        childViews.splice(index, 1);
        this.onRemoveChildView(childView);
        this.didRemoveChildView(childView);
        childView.setKey(null);
      }
    }
    if (newChildView !== null) {
      newChildView.setKey(key);
      this.willInsertChildView(newChildView, targetView);
      if (index >= 0) {
        childViews.splice(index, 0, newChildView);
      } else {
        childViews.push(newChildView);
      }
      this.insertChildViewMap(newChildView);
      newChildView.setParentView(this, null);
      this.onInsertChildView(newChildView, targetView);
      this.didInsertChildView(newChildView, targetView);
    }
    return oldChildView;
  }

  /** @hidden */
  protected insertChildViewMap(childView: View): void {
    const key = childView.key;
    if (key !== null) {
      let childViewMap = this._childViewMap;
      if (childViewMap === void 0) {
        childViewMap = {};
        this._childViewMap = childViewMap;
      }
      childViewMap[key] = childView;
    }
  }

  /** @hidden */
  protected removeChildViewMap(childView: View): void {
    const childViewMap = this._childViewMap;
    if (childViewMap !== void 0) {
      const key = childView.key;
      if (key !== null) {
        delete childViewMap[key];
      }
    }
  }

  append<V extends RenderedView>(childView: V, key?: string): V;
  append<C extends RenderedViewConstructor>(viewConstructor: C, key?: string): InstanceType<C>;
  append(child: RenderedView | RenderedViewConstructor, key?: string): RenderedView {
    if (typeof child === "function") {
      child = RenderedView.create(child);
    }
    this.appendChildView(child, key);
    return child;
  }

  appendChildView(childView: View, key?: string): void {
    if (!RenderedView.is(childView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    this.willInsertChildView(childView, null);
    this._childViews.push(childView);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
  }

  prepend<V extends RenderedView>(childView: V, key?: string): V;
  prepend<C extends RenderedViewConstructor>(viewConstructor: C, key?: string): InstanceType<C>;
  prepend(child: RenderedView | RenderedViewConstructor, key?: string): RenderedView {
    if (typeof child === "function") {
      child = RenderedView.create(child);
    }
    this.prependChildView(child, key);
    return child;
  }

  prependChildView(childView: View, key?: string): void {
    if (!RenderedView.is(childView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    this.willInsertChildView(childView, null);
    this._childViews.unshift(childView);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
  }

  insert<V extends RenderedView>(childView: V, target: View | null, key?: string): V;
  insert<C extends RenderedViewConstructor>(viewConstructor: C, target: View | null, key?: string): InstanceType<C>;
  insert(child: RenderedView | RenderedViewConstructor, target: View | null, key?: string): RenderedView {
    if (typeof child === "function") {
      child = RenderedView.create(child);
    }
    this.insertChildView(child, target, key);
    return child;
  }

  insertChildView(childView: View, targetView: View | null, key?: string): void {
    if (!RenderedView.is(childView)) {
      throw new TypeError("" + childView);
    }
    if (targetView !== null && !RenderedView.is(childView)) {
      throw new TypeError("" + targetView);
    }
    if (targetView !== null && targetView.parentView !== this) {
      throw new TypeError("" + targetView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    this.willInsertChildView(childView, targetView);
    const childViews = this._childViews;
    const index = targetView !== null ? childViews.indexOf(targetView) : -1;
    if (index >= 0) {
      childViews.splice(index, 0, childView);
    } else {
      childViews.push(childView);
    }
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildView(childView, targetView);
  }

  removeChildView(key: string): View | null;
  removeChildView(childView: View): void;
  removeChildView(key: string | View): View | null | void {
    let childView: View | null;
    if (typeof key === "string") {
      childView = this.getChildView(key);
      if (childView === null) {
        return null;
      }
    } else {
      childView = key;
    }
    if (!RenderedView.is(childView)) {
      throw new TypeError("" + childView);
    }
    if (childView.parentView !== this) {
      throw new Error("not a child view");
    }
    this.willRemoveChildView(childView);
    childView.setParentView(null, this);
    this.removeChildViewMap(childView);
    const childViews = this._childViews;
    const index = childViews.indexOf(childView);
    if (index >= 0) {
      childViews.splice(index, 1);
    }
    this.onRemoveChildView(childView);
    this.didRemoveChildView(childView);
    childView.setKey(null);
    if (typeof key === "string") {
      return childView;
    }
  }

  removeAll(): void {
    const childViews = this._childViews;
    do {
      const count = childViews.length;
      if (count > 0) {
        const childView = childViews[count - 1];
        this.willRemoveChildView(childView);
        childView.setParentView(null, this);
        this.removeChildViewMap(childView);
        childViews.pop();
        this.onRemoveChildView(childView);
        this.didRemoveChildView(childView);
        childView.setKey(null);
        continue;
      }
      break;
    } while (true);
  }

  remove(): void {
    const parentView = this._parentView;
    if (parentView !== null) {
      if ((this._viewFlags & View.UpdatingMask) === 0) {
        parentView.removeChildView(this);
      } else {
        this._viewFlags |= View.RemovingFlag;
      }
    }
  }

  /** @hidden */
  get viewFlags(): ViewFlags {
    return this._viewFlags;
  }

  /** @hidden */
  setViewFlags(viewFlags: ViewFlags): void {
    this._viewFlags = viewFlags;
  }

  cascadeMount(): void {
    if ((this._viewFlags & View.MountedFlag) === 0) {
      this._viewFlags |= View.MountedFlag;
      this.willMount();
      this.onMount();
      this.doMountChildViews();
      this.didMount();
    } else {
      throw new Error("already mounted");
    }
  }

  /** @hidden */
  doMountChildViews(): void {
    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      childView.cascadeMount();
    }
  }

  cascadeUnmount(): void {
    if ((this._viewFlags & View.MountedFlag) !== 0) {
      this._viewFlags &= ~View.MountedFlag
      this.willUnmount();
      this.doUnmountChildViews();
      this.onUnmount();
      this.didUnmount();
    } else {
      throw new Error("already unmounted");
    }
  }

  /** @hidden */
  doUnmountChildViews(): void {
    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      childView.cascadeUnmount();
    }
  }

  protected onUnmount(): void {
    this.cancelAnimators();
    this._viewFlags = 0;
  }

  cascadePower(): void {
    if ((this._viewFlags & View.PoweredFlag) === 0) {
      this._viewFlags |= View.PoweredFlag;
      this.willPower();
      this.onPower();
      this.doPowerChildViews();
      this.didPower();
    } else {
      throw new Error("already powered");
    }
  }

  /** @hidden */
  doPowerChildViews(): void {
    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      childView.cascadePower();
    }
  }

  cascadeUnpower(): void {
    if ((this._viewFlags & View.PoweredFlag) !== 0) {
      this._viewFlags &= ~View.PoweredFlag
      this.willUnpower();
      this.doUnpowerChildViews();
      this.onUnpower();
      this.didUnpower();
    } else {
      throw new Error("already unpowered");
    }
  }

  /** @hidden */
  doUnpowerChildViews(): void {
    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      childView.cascadeUnpower();
    }
  }

  get renderer(): Renderer | null {
    const parentView = this._parentView;
    return RenderedView.is(parentView) ? parentView.renderer : null;
  }

  needsProcess(processFlags: ViewFlags, viewContext: RenderedViewContext): ViewFlags {
    if ((this._viewFlags & View.NeedsAnimate) === 0) {
      processFlags &= ~View.NeedsAnimate;
    }
    return processFlags;
  }

  cascadeProcess(processFlags: ViewFlags, viewContext: RenderedViewContext): void {
    processFlags = this._viewFlags | processFlags;
    processFlags = this.needsProcess(processFlags, viewContext);
    this.doProcess(processFlags, viewContext);
  }

  /** @hidden */
  protected doProcess(processFlags: ViewFlags, viewContext: RenderedViewContext): void {
    let cascadeFlags = processFlags;
    this._viewFlags &= ~(View.NeedsProcess | View.NeedsResize | View.NeedsProject);
    this.willProcess(viewContext);
    this._viewFlags |= View.ProcessingFlag;
    try {
      if (((this._viewFlags | processFlags) & View.NeedsScroll) !== 0) {
        cascadeFlags |= View.NeedsScroll;
        this._viewFlags &= ~View.NeedsScroll;
        this.willScroll(viewContext);
      }
      if (((this._viewFlags | processFlags) & View.NeedsDerive) !== 0) {
        cascadeFlags |= View.NeedsDerive;
        this._viewFlags &= ~View.NeedsDerive;
        this.willDerive(viewContext);
      }
      if (((this._viewFlags | processFlags) & View.NeedsAnimate) !== 0) {
        cascadeFlags |= View.NeedsAnimate;
        this._viewFlags &= ~View.NeedsAnimate;
        this.willAnimate(viewContext);
      }

      this.onProcess(viewContext);
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.onScroll(viewContext);
      }
      if ((cascadeFlags & View.NeedsDerive) !== 0) {
        this.onDerive(viewContext);
      }
      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.onAnimate(viewContext);
      }

      this.doProcessChildViews(cascadeFlags, viewContext);

      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.didAnimate(viewContext);
      }
      if ((cascadeFlags & View.NeedsDerive) !== 0) {
        this.didDerive(viewContext);
      }
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.didScroll(viewContext);
      }
    } finally {
      this._viewFlags &= ~View.ProcessingFlag;
      this.didProcess(viewContext);
    }
  }

  protected willAnimate(viewContext: RenderedViewContext): void {
    this.willObserve(function (viewObserver: GraphicsViewObserver): void {
      if (viewObserver.viewWillAnimate !== void 0) {
        viewObserver.viewWillAnimate(viewContext, this);
      }
    });
  }

  protected onAnimate(viewContext: RenderedViewContext): void {
    this.animateMembers(viewContext.updateTime);
  }

  protected didAnimate(viewContext: RenderedViewContext): void {
    this.didObserve(function (viewObserver: GraphicsViewObserver): void {
      if (viewObserver.viewDidAnimate !== void 0) {
        viewObserver.viewDidAnimate(viewContext, this);
      }
    });
  }

  /** @hidden */
  protected doProcessChildViews(processFlags: ViewFlags, viewContext: RenderedViewContext): void {
    const childViews = this._childViews;
    if ((processFlags & View.ProcessMask) !== 0 && childViews.length !== 0) {
      this.willProcessChildViews(viewContext);
      let i = 0;
      while (i < childViews.length) {
        const childView = childViews[i];
        const childViewContext = this.childViewContext(childView, viewContext);
        this.doProcessChildView(childView, processFlags, childViewContext);
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
        i += 1;
      }
      this.didProcessChildViews(viewContext);
    }
  }

  cascadeDisplay(displayFlags: ViewFlags, viewContext: RenderedViewContext): void {
    displayFlags = this._viewFlags | displayFlags;
    displayFlags = this.needsDisplay(displayFlags, viewContext);
    this.doDisplay(displayFlags, viewContext);
  }

  /** @hidden */
  protected doDisplay(displayFlags: ViewFlags, viewContext: RenderedViewContext): void {
    let cascadeFlags = displayFlags;
    this._viewFlags &= ~(View.NeedsDisplay | View.NeedsComposite);
    this.willDisplay(viewContext);
    this._viewFlags |= View.DisplayingFlag;
    try {
      if (((this._viewFlags | displayFlags) & View.NeedsLayout) !== 0) {
        cascadeFlags |= View.NeedsLayout;
        this._viewFlags &= ~View.NeedsLayout;
        this.willLayout(viewContext);
      }
      if (((this._viewFlags | displayFlags) & View.NeedsRender) !== 0) {
        cascadeFlags |= View.NeedsRender;
        this._viewFlags &= ~View.NeedsRender;
        this.willRender(viewContext);
      }

      this.onDisplay(viewContext);
      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.onLayout(viewContext);
      }
      if ((cascadeFlags & View.NeedsRender) !== 0) {
        this.onRender(viewContext);
      }

      this.doDisplayChildViews(cascadeFlags, viewContext);

      if ((cascadeFlags & View.NeedsRender) !== 0) {
        this.didRender(viewContext);
      }
      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.didLayout(viewContext);
      }
    } finally {
      this._viewFlags &= ~View.DisplayingFlag;
      this.didDisplay(viewContext);
    }
  }

  protected willRender(viewContext: RenderedViewContext): void {
    this.willObserve(function (viewObserver: GraphicsViewObserver): void {
      if (viewObserver.viewWillRender !== void 0) {
        viewObserver.viewWillRender(viewContext, this);
      }
    });
  }

  protected onRender(viewContext: RenderedViewContext): void {
    // hook
  }

  protected didRender(viewContext: RenderedViewContext): void {
    this.didObserve(function (viewObserver: GraphicsViewObserver): void {
      if (viewObserver.viewDidRender !== void 0) {
        viewObserver.viewDidRender(viewContext, this);
      }
    });
  }

  /** @hidden */
  protected doDisplayChildViews(displayFlags: ViewFlags, viewContext: RenderedViewContext): void {
    const childViews = this._childViews;
    if ((displayFlags & View.DisplayMask) !== 0 && childViews.length !== 0 && !this.isHidden() && !this.isCulled()) {
      this.willDisplayChildViews(viewContext);
      let i = 0;
      while (i < childViews.length) {
        const childView = childViews[i];
        const childViewContext = this.childViewContext(childView, viewContext);
        this.doDisplayChildView(childView, displayFlags, childViewContext);
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
        i += 1;
      }
      this.didDisplayChildViews(viewContext);
    }
  }

  childViewContext(childView: View, viewContext: RenderedViewContext): RenderedViewContext {
    return viewContext;
  }

  hasViewScope(scopeName: string): boolean {
    const viewScopes = this._viewScopes;
    return viewScopes !== void 0 && viewScopes[scopeName] !== void 0;
  }

  getViewScope(scopeName: string): ViewScope<View, unknown> | null {
    const viewScopes = this._viewScopes;
    return viewScopes !== void 0 ? viewScopes[scopeName] || null : null;
  }

  setViewScope(scopeName: string, viewScope: ViewScope<View, unknown> | null): void {
    let viewScopes = this._viewScopes;
    if (viewScopes === void 0) {
      viewScopes = {};
      this._viewScopes = viewScopes;
    }
    if (viewScope !== null) {
      viewScopes[scopeName] = viewScope;
    } else {
      delete viewScopes[scopeName];
    }
  }

  hasLayoutAnchor(anchorName: string): boolean {
    const layoutAnchors = this._layoutAnchors;
    return layoutAnchors !== void 0 && layoutAnchors[anchorName] !== void 0;
  }

  getLayoutAnchor(anchorName: string): LayoutAnchor<LayoutView> | null {
    const layoutAnchors = this._layoutAnchors;
    return layoutAnchors !== void 0 ? layoutAnchors[anchorName] || null : null;
  }

  setLayoutAnchor(anchorName: string, layoutAnchor: LayoutAnchor<LayoutView> | null): void {
    let layoutAnchors = this._layoutAnchors;
    if (layoutAnchors === void 0) {
      layoutAnchors = {};
      this._layoutAnchors = layoutAnchors;
    }
    if (layoutAnchor !== null) {
      layoutAnchors[anchorName] = layoutAnchor;
    } else {
      delete layoutAnchors[anchorName];
    }
  }

  hasMemberAnimator(animatorName: string): boolean {
    const memberAnimators = this._memberAnimators;
    return memberAnimators !== void 0 && memberAnimators[animatorName] !== void 0;
  }

  getMemberAnimator(animatorName: string): Animator | null {
    const memberAnimators = this._memberAnimators;
    return memberAnimators !== void 0 ? memberAnimators[animatorName] || null : null;
  }

  setMemberAnimator(animatorName: string, animator: Animator | null): void {
    let memberAnimators = this._memberAnimators;
    if (memberAnimators === void 0) {
      memberAnimators = {};
      this._memberAnimators = memberAnimators;
    }
    if (animator !== null) {
      memberAnimators[animatorName] = animator;
    } else {
      delete memberAnimators[animatorName];
    }
  }

  /** @hidden */
  getLazyMemberAnimator(animatorName: string): Animator | null {
    let memberAnimator = this.getMemberAnimator(animatorName);
    if (memberAnimator === null) {
      const viewClass = (this as any).__proto__ as AnimatedViewClass;
      const descriptor = AnimatedView.getMemberAnimatorDescriptor(animatorName, viewClass);
      if (descriptor !== null && descriptor.animatorType !== void 0) {
        memberAnimator = AnimatedView.initMemberAnimator(descriptor.animatorType, this, animatorName, descriptor);
        this.setMemberAnimator(animatorName, memberAnimator);
      }
    }
    return memberAnimator;
  }

  /** @hidden */
  animatorDidSetAuto(animator: Animator, auto: boolean): void {
    if (animator instanceof MemberAnimator) {
      this.requireUpdate(View.NeedsDerive);
    }
  }

  /** @hidden */
  animateMembers(t: number): void {
    const memberAnimators = this._memberAnimators;
    if (memberAnimators !== void 0) {
      for (const animatorName in memberAnimators) {
        const animator = memberAnimators[animatorName]!;
        animator.onFrame(t);
      }
    }
  }

  animate(animator: Animator): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  /** @hidden */
  cancelAnimators(): void {
    this.cancelMemberAnimators();
  }

  /** @hidden */
  cancelMemberAnimators(): void {
    const memberAnimators = this._memberAnimators;
    if (memberAnimators !== void 0) {
      for (const animatorName in memberAnimators) {
        const animator = memberAnimators[animatorName]!;
        animator.cancel();
      }
    }
  }

  isHidden(): boolean {
    if ((this._viewFlags & View.HiddenFlag) !== 0) {
      return true;
    } else {
      const parentView = this._parentView;
      return RenderedView.is(parentView) ? parentView.isHidden() : false;
    }
  }

  setHidden(newHidden: boolean): void {
    const oldHidden = (this._viewFlags & View.HiddenFlag) !== 0;
    if (oldHidden !== newHidden) {
      this.willSetHidden(newHidden);
      if (newHidden) {
        this._viewFlags |= View.HiddenFlag;
      } else {
        this._viewFlags &= ~View.HiddenFlag;
      }
      this.onSetHidden(newHidden);
      this.didSetHidden(newHidden);
    }
  }

  protected willSetHidden(hidden: boolean): void {
    this.willObserve(function (viewObserver: GraphicsViewObserver): void {
      if (viewObserver.viewWillSetHidden !== void 0) {
        viewObserver.viewWillSetHidden(hidden, this);
      }
    });
  }

  protected onSetHidden(hidden: boolean): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetHidden(hidden: boolean): void {
    this.didObserve(function (viewObserver: GraphicsViewObserver): void {
      if (viewObserver.viewDidSetHidden !== void 0) {
        viewObserver.viewDidSetHidden(hidden, this);
      }
    });
  }

  isCulled(): boolean {
    if ((this._viewFlags & View.CulledFlag) !== 0) {
      return true;
    } else {
      const parentView = this._parentView;
      return RenderedView.is(parentView) ? parentView.isCulled() : false;
    }
  }

  setCulled(newCulled: boolean): void {
    const oldCulled = (this._viewFlags & View.CulledFlag) !== 0;
    if (oldCulled !== newCulled) {
      this.willSetCulled(newCulled);
      if (newCulled) {
        this._viewFlags |= View.CulledFlag;
      } else {
        this._viewFlags &= ~View.CulledFlag;
      }
      this.onSetCulled(newCulled);
      this.didSetCulled(newCulled);
    }
  }

  protected willSetCulled(culled: boolean): void {
    this.willObserve(function (viewObserver: GraphicsViewObserver): void {
      if (viewObserver.viewWillSetCulled !== void 0) {
        viewObserver.viewWillSetCulled(culled, this);
      }
    });
  }

  protected onSetCulled(culled: boolean): void {
    if (!culled) {
      this.requireUpdate(View.NeedsLayout);
    }
  }

  protected didSetCulled(culled: boolean): void {
    this.didObserve(function (viewObserver: GraphicsViewObserver): void {
      if (viewObserver.viewDidSetCulled !== void 0) {
        viewObserver.viewDidSetCulled(culled, this);
      }
    });
  }

  cullViewFrame(viewFrame: BoxR2 = this.viewFrame): void {
    this.setCulled(!viewFrame.intersects(this.viewBounds));
  }

  get viewFrame(): BoxR2 {
    let viewFrame = this._viewFrame;
    if (viewFrame === void 0) {
      const parentView = this._parentView;
      viewFrame = RenderedView.is(parentView) ? parentView.viewFrame : BoxR2.empty();
    }
    return viewFrame;
  }

  setViewFrame(viewFrame: BoxR2 | null): void {
    if (viewFrame !== null) {
      this._viewFrame = viewFrame;
    } else if (this._viewFrame !== void 0) {
      this._viewFrame = void 0;
    }
  }

  get viewBounds(): BoxR2 {
    return this.viewFrame;
  }

  deriveViewBounds(): BoxR2 {
    let viewBounds: BoxR2 | undefined;
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (RenderedView.is(childView) && !childView.isHidden()) {
        const childViewBounds = childView.viewBounds;
        if (viewBounds === void 0) {
          viewBounds = childViewBounds;
        } else {
          viewBounds = viewBounds.union(childViewBounds);
        }
      }
    }
    if (viewBounds === void 0) {
      viewBounds = this.viewFrame;
    }
    return viewBounds;
  }

  get hitBounds(): BoxR2 {
    return this.viewFrame;
  }

  deriveHitBounds(): BoxR2 {
    let hitBounds: BoxR2 | undefined;
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (RenderedView.is(childView) && !childView.isHidden()) {
        const childHitBounds = childView.hitBounds;
        if (hitBounds === void 0) {
          hitBounds = childHitBounds;
        } else {
          hitBounds = hitBounds.union(childHitBounds);
        }
      }
    }
    if (hitBounds === void 0) {
      hitBounds = this.viewBounds;
    }
    return hitBounds;
  }

  hitTest(x: number, y: number, viewContext: RenderedViewContext): RenderedView | null {
    let hit: RenderedView | null = null;
    const childViews = this._childViews;
    for (let i = childViews.length - 1; i >= 0; i -= 1) {
      const childView = childViews[i];
      if (RenderedView.is(childView) && !childView.isHidden() && !childView.isCulled()) {
        const hitBounds = childView.hitBounds;
        if (hitBounds.contains(x, y)) {
          hit = childView.hitTest(x, y, viewContext);
          if (hit !== null) {
            break;
          }
        }
      }
    }
    return hit;
  }

  get parentTransform(): Transform {
    return Transform.identity();
  }

  get clientBounds(): BoxR2 {
    const inverseClientTransform = this.clientTransform.inverse();
    return this.viewBounds.transform(inverseClientTransform);
  }

  get popoverFrame(): BoxR2 {
    const inversePageTransform = this.pageTransform.inverse();
    return this.viewBounds.transform(inversePageTransform);
  }

  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    let eventHandlers = this._eventHandlers;
    if (eventHandlers === void 0) {
      eventHandlers = {};
      this._eventHandlers = eventHandlers;
    }
    let handlers = eventHandlers[type];
    const capture = typeof options === "boolean" ? options : typeof options === "object" && options !== null && options.capture || false;
    const passive = options && typeof options === "object" && options.passive || false;
    const once = options && typeof options === "object" && options.once || false;
    let handler: ViewEventHandler | undefined;
    if (handlers === void 0) {
      handler = {listener, capture, passive, once};
      handlers = [handler];
      eventHandlers[type] = handlers;
    } else {
      const n = handlers.length;
      let i = 0;
      while (i < n) {
        handler = handlers[i];
        if (handler.listener === listener && handler.capture === capture) {
          break;
        }
        i += 1;
      }
      if (i < n) {
        handler!.passive = passive;
        handler!.once = once;
      } else {
        handler = {listener, capture, passive, once};
        handlers.push(handler);
      }
    }
    return this;
  }

  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    const eventHandlers = this._eventHandlers;
    if (eventHandlers !== void 0) {
      const handlers = eventHandlers[type];
      if (handlers !== void 0) {
        const capture = typeof options === "boolean" ? options : typeof options === "object" && options !== null && options.capture || false;
        const n = handlers.length;
        let i = 0;
        while (i < n) {
          const handler = handlers[i];
          if (handler.listener === listener && handler.capture === capture) {
            handlers.splice(i, 1);
            if (handlers.length === 0) {
              delete eventHandlers[type];
            }
            break;
          }
          i += 1;
        }
      }
    }
    return this;
  }

  /** @hidden */
  handleEvent(event: ViewEvent): void {
    const type = event.type;
    const eventHandlers = this._eventHandlers;
    if (eventHandlers !== void 0) {
      const handlers = eventHandlers[type];
      if (handlers !== void 0) {
        let i = 0;
        while (i < handlers.length) {
          const handler = handlers[i];
          if (!handler.capture) {
            const listener = handler.listener;
            if (typeof listener === "function") {
              listener(event);
            } else if (typeof listener === "object" && listener !== null) {
              listener.handleEvent(event);
            }
            if (handler.once) {
              handlers.splice(i, 1);
              continue;
            }
          }
          i += 1;
        }
        if (handlers.length === 0) {
          delete eventHandlers[type];
        }
      }
    }
    if (type === "mouseover") {
      this.onMouseOver(event as MouseEvent);
    } else if (type === "mouseout") {
      this.onMouseOut(event as MouseEvent);
    }
  }

  /** @hidden */
  bubbleEvent(event: ViewEvent): View | null {
    this.handleEvent(event);
    if (event.bubbles && !event.cancelBubble) {
      const parentView = this._parentView;
      if (RenderedView.is(parentView)) {
        return parentView.bubbleEvent(event);
      } else {
        return parentView;
      }
    } else {
      return null;
    }
  }

  dispatchEvent(event: ViewEvent): boolean {
    event.targetView = this;
    const next = this.bubbleEvent(event);
    if (next !== null) {
      return next.dispatchEvent(event);
    } else {
      return !event.cancelBubble;
    }
  }

  isHovering(): boolean {
    return (this._viewFlags & View.HoveringFlag) !== 0;
  }

  /** @hidden */
  protected onMouseOver(event: ViewMouseEvent): void {
    if ((this._viewFlags & View.HoveringFlag) === 0) {
      this._viewFlags |= View.HoveringFlag;
      const eventHandlers = this._eventHandlers;
      if (eventHandlers !== void 0 && eventHandlers.mouseenter !== void 0) {
        const enterEvent = new MouseEvent("mouseenter", {
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          bubbles: false,
        }) as ViewMouseEvent;
        enterEvent.targetView = this;
        enterEvent.relatedTargetView = event.relatedTargetView;
        this.handleEvent(enterEvent);
      }
    }
  }

  /** @hidden */
  protected onMouseOut(event: ViewMouseEvent): void {
    if ((this._viewFlags & View.HoveringFlag) !== 0) {
      this._viewFlags &= ~View.HoveringFlag;
      const eventHandlers = this._eventHandlers;
      if (eventHandlers !== void 0 && eventHandlers.mouseleave !== void 0) {
        const leaveEvent = new MouseEvent("mouseleave", {
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          bubbles: false,
        }) as ViewMouseEvent;
        leaveEvent.targetView = this;
        leaveEvent.relatedTargetView = event.relatedTargetView;
        this.handleEvent(leaveEvent);
      }
    }
  }
}
View.Graphics = GraphicsView;
