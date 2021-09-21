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
import type {ConstraintVariable, Constraint} from "@swim/constraint";
import {R2Box, Transform} from "@swim/math";
import type {Color} from "@swim/style";
import {Look, Feel, MoodVectorUpdates, MoodVector, MoodMatrix, ThemeMatrix} from "@swim/theme";
import {
  ViewContextType,
  ViewContext,
  ViewInit,
  ViewFlags,
  ViewConstructor,
  View,
  ViewObserverType,
  ViewWillRender,
  ViewDidRender,
  ViewWillRasterize,
  ViewDidRasterize,
  ViewWillComposite,
  ViewDidComposite,
  ViewService,
  ViewProperty,
  ViewAnimator,
  ViewFastener,
  ViewEvent,
  ViewMouseEvent,
  ViewPointerEvent,
  ViewEventHandler,
  GestureContext,
  Gesture,
} from "@swim/view";
import type {GraphicsRenderer} from "./GraphicsRenderer";
import type {GraphicsViewContext} from "./GraphicsViewContext";
import type {GraphicsViewObserver} from "./GraphicsViewObserver";
import type {CanvasContext} from "../canvas/CanvasContext";
import {CanvasView} from "../"; // forward import

export interface GraphicsViewEventMap {
  "auxclick": MouseEvent;
  "click": MouseEvent;
  "contextmenu": MouseEvent;
  "dblclick": MouseEvent;
  "mousedown": MouseEvent;
  "mouseenter": MouseEvent;
  "mouseleave": MouseEvent;
  "mousemove": MouseEvent;
  "mouseout": MouseEvent;
  "mouseover": MouseEvent;
  "mouseup": MouseEvent;
  "pointercancel": PointerEvent;
  "pointerdown": PointerEvent;
  "pointerenter": PointerEvent;
  "pointerleave": PointerEvent;
  "pointermove": PointerEvent;
  "pointerout": PointerEvent;
  "pointerover": PointerEvent;
  "pointerup": PointerEvent;
  "touchcancel": TouchEvent;
  "touchend": TouchEvent;
  "touchmove": TouchEvent;
  "touchstart": TouchEvent;
  "wheel": WheelEvent;
}

export interface GraphicsViewInit extends ViewInit {
  mood?: MoodVector;
  moodModifier?: MoodMatrix;
  theme?: ThemeMatrix;
  themeModifier?: MoodMatrix;
  hidden?: boolean;
}

export interface GraphicsViewConstructor<V extends GraphicsView = GraphicsView> {
  new(): V;
  readonly prototype: V;
}

export abstract class GraphicsView extends View {
  constructor() {
    super();
    Object.defineProperty(this, "key", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "parentView", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "viewServices", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "viewProperties", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "viewAnimators", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "viewFasteners", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "gestures", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "constraints", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "constraintVariables", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "ownViewFrame", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "eventHandlers", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "hoverSet", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  override initView(init: GraphicsViewInit): void {
    super.initView(init);
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
    if (init.hidden !== void 0) {
      this.setHidden(init.hidden);
    }
  }

  override readonly viewObservers!: ReadonlyArray<GraphicsViewObserver>;

  protected override onAddViewObserver(viewObserver: ViewObserverType<this>): void {
    super.onAddViewObserver(viewObserver);
    if (viewObserver.viewWillRender !== void 0) {
      this.viewObserverCache.viewWillRenderObservers = Arrays.inserted(viewObserver as ViewWillRender, this.viewObserverCache.viewWillRenderObservers);
    }
    if (viewObserver.viewDidRender !== void 0) {
      this.viewObserverCache.viewDidRenderObservers = Arrays.inserted(viewObserver as ViewDidRender, this.viewObserverCache.viewDidRenderObservers);
    }
    if (viewObserver.viewWillRasterize !== void 0) {
      this.viewObserverCache.viewWillRasterizeObservers = Arrays.inserted(viewObserver as ViewWillRasterize, this.viewObserverCache.viewWillRasterizeObservers);
    }
    if (viewObserver.viewDidRasterize !== void 0) {
      this.viewObserverCache.viewDidRasterizeObservers = Arrays.inserted(viewObserver as ViewDidRasterize, this.viewObserverCache.viewDidRasterizeObservers);
    }
    if (viewObserver.viewWillComposite !== void 0) {
      this.viewObserverCache.viewWillCompositeObservers = Arrays.inserted(viewObserver as ViewWillComposite, this.viewObserverCache.viewWillCompositeObservers);
    }
    if (viewObserver.viewDidComposite !== void 0) {
      this.viewObserverCache.viewDidCompositeObservers = Arrays.inserted(viewObserver as ViewDidComposite, this.viewObserverCache.viewDidCompositeObservers);
    }
  }

  protected override onRemoveViewObserver(viewObserver: ViewObserverType<this>): void {
    super.onRemoveViewObserver(viewObserver);
    if (viewObserver.viewWillRender !== void 0) {
      this.viewObserverCache.viewWillRenderObservers = Arrays.removed(viewObserver as ViewWillRender, this.viewObserverCache.viewWillRenderObservers);
    }
    if (viewObserver.viewDidRender !== void 0) {
      this.viewObserverCache.viewDidRenderObservers = Arrays.removed(viewObserver as ViewDidRender, this.viewObserverCache.viewDidRenderObservers);
    }
    if (viewObserver.viewWillRasterize !== void 0) {
      this.viewObserverCache.viewWillRasterizeObservers = Arrays.removed(viewObserver as ViewWillRasterize, this.viewObserverCache.viewWillRasterizeObservers);
    }
    if (viewObserver.viewDidRasterize !== void 0) {
      this.viewObserverCache.viewDidRasterizeObservers = Arrays.removed(viewObserver as ViewDidRasterize, this.viewObserverCache.viewDidRasterizeObservers);
    }
    if (viewObserver.viewWillComposite !== void 0) {
      this.viewObserverCache.viewWillCompositeObservers = Arrays.removed(viewObserver as ViewWillComposite, this.viewObserverCache.viewWillCompositeObservers);
    }
    if (viewObserver.viewDidComposite !== void 0) {
      this.viewObserverCache.viewDidCompositeObservers = Arrays.removed(viewObserver as ViewDidComposite, this.viewObserverCache.viewDidCompositeObservers);
    }
  }

  protected willObserve<T>(callback: (this: this, viewObserver: ViewObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      result = callback.call(this, viewObserver as ViewObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, viewObserver: ViewObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      result = callback.call(this, viewObserver as ViewObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  override readonly key!: string | undefined;

  /** @hidden */
  override setKey(key: string | undefined): void {
    Object.defineProperty(this, "key", {
      value: key,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly parentView!: View | null;

  /** @hidden */
  override setParentView(newParentView: View | null, oldParentView: View | null): void {
    this.willSetParentView(newParentView, oldParentView);
    if (oldParentView !== null) {
      this.detachParentView(oldParentView);
    }
    Object.defineProperty(this, "parentView", {
      value: newParentView,
      enumerable: true,
      configurable: true,
    });
    if (newParentView !== null) {
      this.attachParentView(newParentView);
    }
    this.onSetParentView(newParentView, oldParentView);
    this.didSetParentView(newParentView, oldParentView);
  }

  override remove(): void {
    const parentView = this.parentView;
    if (parentView !== null) {
      if ((this.viewFlags & View.TraversingFlag) === 0) {
        parentView.removeChildView(this);
      } else {
        this.setViewFlags(this.viewFlags | View.RemovingFlag);
      }
    }
  }

  abstract override readonly childViewCount: number;

  abstract override readonly childViews: ReadonlyArray<View>;

  abstract override firstChildView(): View | null;

  abstract override lastChildView(): View | null;

  abstract override nextChildView(targetView: View): View | null;

  abstract override previousChildView(targetView: View): View | null;

  abstract override forEachChildView<T>(callback: (childView: View) => T | void): T | undefined;
  abstract override forEachChildView<T, S>(callback: (this: S, childView: View) => T | void, thisArg: S): T | undefined;

  abstract override getChildView(key: string): View | null;

  abstract override setChildView(key: string, newChildView: View | null): View | null;

  append<V extends View>(childView: V, key?: string): V;
  append<V extends GraphicsView>(viewConstructor: GraphicsViewConstructor<V>, key?: string): V
  append<V extends View>(viewConstructor: ViewConstructor<V>, key?: string): V;
  append(child: View | ViewConstructor, key?: string): View {
    if (typeof child === "function") {
      child = GraphicsView.fromConstructor(child);
    }
    this.appendChildView(child, key);
    return child;
  }

  abstract override appendChildView(childView: View, key?: string): void;

  prepend<V extends View>(childView: V, key?: string): V;
  prepend<V extends GraphicsView>(viewConstructor: GraphicsViewConstructor<V>, key?: string): V
  prepend<V extends View>(viewConstructor: ViewConstructor<V>, key?: string): V;
  prepend(child: View | ViewConstructor, key?: string): View {
    if (typeof child === "function") {
      child = GraphicsView.fromConstructor(child);
    }
    this.prependChildView(child, key);
    return child;
  }

  abstract override prependChildView(childView: View, key?: string): void;

  insert<V extends View>(childView: V, target: View | null, key?: string): V;
  insert<V extends GraphicsView>(viewConstructor: GraphicsViewConstructor<V>, target: View | null, key?: string): V
  insert<V extends View>(viewConstructor: ViewConstructor<V>, target: View | null, key?: string): V;
  insert(child: View | ViewConstructor, target: View | null, key?: string): View {
    if (typeof child === "function") {
      child = GraphicsView.fromConstructor(child);
    }
    this.insertChildView(child, target, key);
    return child;
  }

  abstract override insertChildView(childView: View, targetView: View | null, key?: string): void;

  protected override onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    this.insertViewFastener(childView, targetView);
    this.insertGesture(childView, targetView);
  }

  override cascadeInsert(updateFlags?: ViewFlags, viewContext?: ViewContext): void {
    if ((this.viewFlags & (View.MountedFlag | View.PoweredFlag)) === (View.MountedFlag | View.PoweredFlag)) {
      if (updateFlags === void 0) {
        updateFlags = 0;
      }
      updateFlags |= this.viewFlags & View.UpdateMask;
      if ((updateFlags & View.ProcessMask) !== 0) {
        if (viewContext === void 0) {
          viewContext = this.superViewContext;
        }
        this.cascadeProcess(updateFlags, viewContext);
      }
    }
  }

  abstract override removeChildView(key: string): View | null;
  abstract override removeChildView(childView: View): void;

  protected override onRemoveChildView(childView: View): void {
    super.onRemoveChildView(childView);
    this.removeGesture(childView);
    this.removeViewFastener(childView);
  }

  abstract override removeAll(): void;

  override cascadeMount(): void {
    if ((this.viewFlags & View.MountedFlag) === 0) {
      this.setViewFlags(this.viewFlags | (View.MountedFlag | View.TraversingFlag));
      try {
        this.willMount();
        this.onMount();
        this.mountChildViews();
        this.didMount();
      } finally {
        this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
      }
    } else {
      throw new Error("already mounted");
    }
  }

  protected override onMount(): void {
    super.onMount();
    this.mountViewServices();
    this.mountViewProperties();
    this.mountViewAnimators();
    this.mountViewFasteners();
    this.mountGestures();
    this.mountTheme();
    this.updateTheme(false);
  }

  protected override didMount(): void {
    this.activateLayout();
    super.didMount();
  }

  /** @hidden */
  protected mountChildViews(): void {
    type self = this;
    function mountChildView(this: self, childView: View): void {
      childView.cascadeMount();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
    this.forEachChildView(mountChildView, this);
  }

  override cascadeUnmount(): void {
    if ((this.viewFlags & View.MountedFlag) !== 0) {
      this.setViewFlags(this.viewFlags & ~View.MountedFlag | View.TraversingFlag);
      try {
        this.willUnmount();
        this.unmountChildViews();
        this.onUnmount();
        this.didUnmount();
      } finally {
        this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
      }
    } else {
      throw new Error("already unmounted");
    }
  }

  protected override willUnmount(): void {
    super.willUnmount();
    this.deactivateLayout();
  }

  protected override onUnmount(): void {
    this.unmountGestures();
    this.unmountViewFasteners();
    this.unmountViewAnimators();
    this.unmountViewProperties();
    this.unmountViewServices();
    this.setViewFlags(this.viewFlags & (~View.ViewFlagMask | View.RemovingFlag));
  }

  /** @hidden */
  protected unmountChildViews(): void {
    type self = this;
    function unmountChildView(this: self, childView: View): void {
      childView.cascadeUnmount();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
    this.forEachChildView(unmountChildView, this);
  }

  override cascadePower(): void {
    if ((this.viewFlags & View.PoweredFlag) === 0) {
      this.setViewFlags(this.viewFlags | (View.PoweredFlag | View.TraversingFlag));
      try {
        this.willPower();
        this.onPower();
        this.powerChildViews();
        this.didPower();
      } finally {
        this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
      }
    } else {
      throw new Error("already powered");
    }
  }

  /** @hidden */
  protected powerChildViews(): void {
    type self = this;
    function powerChildView(this: self, childView: View): void {
      childView.cascadePower();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
    this.forEachChildView(powerChildView, this);
  }

  override cascadeUnpower(): void {
    if ((this.viewFlags & View.PoweredFlag) !== 0) {
      this.setViewFlags(this.viewFlags & ~View.PoweredFlag | View.TraversingFlag);
      try {
        this.willUnpower();
        this.unpowerChildViews();
        this.onUnpower();
        this.didUnpower();
      } finally {
        this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
      }
    } else {
      throw new Error("already unpowered");
    }
  }

  /** @hidden */
  protected unpowerChildViews(): void {
    type self = this;
    function unpowerChildView(this: self, childView: View): void {
      childView.cascadeUnpower();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
    this.forEachChildView(unpowerChildView, this);
  }

  override setCulled(culled: boolean): void {
    const viewFlags = this.viewFlags;
    if (culled && (viewFlags & View.CulledFlag) === 0) {
      this.setViewFlags(viewFlags | View.CulledFlag);
      if ((viewFlags & View.CullFlag) === 0) {
        this.cullView();
      }
    } else if (!culled && (viewFlags & View.CulledFlag) !== 0) {
      this.setViewFlags(viewFlags & ~View.CulledFlag);
      if ((viewFlags & View.CullFlag) === 0) {
        this.uncullView();
      }
    }
  }

  override cascadeCull(): void {
    if ((this.viewFlags & View.CullFlag) === 0) {
      this.setViewFlags(this.viewFlags | View.CullFlag);
      if ((this.viewFlags & View.CulledFlag) === 0) {
        this.cullView();
      }
    }
  }

  /** @hidden */
  protected cullView(): void {
    this.setViewFlags(this.viewFlags | View.TraversingFlag);
    try {
      this.willCull();
      this.onCull();
      this.cullChildViews();
      this.didCull();
    } finally {
      this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
    }
  }

  /** @hidden */
  protected cullChildViews(): void {
    type self = this;
    function cullChildView(this: self, childView: View): void {
      childView.cascadeCull();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
    this.forEachChildView(cullChildView, this);
  }

  override cascadeUncull(): void {
    if ((this.viewFlags & View.CullFlag) !== 0) {
      this.setViewFlags(this.viewFlags & ~View.CullFlag);
      if ((this.viewFlags & View.CulledFlag) === 0) {
        this.uncullView();
      }
    }
  }

  /** @hidden */
  protected uncullView(): void {
    this.setViewFlags(this.viewFlags | View.TraversingFlag);
    try {
      this.willUncull();
      this.uncullChildViews();
      this.onUncull();
      this.didUncull();
    } finally {
      this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
    }
  }

  /** @hidden */
  protected uncullChildViews(): void {
    type self = this;
    function uncullChildView(this: self, childView: View): void {
      childView.cascadeUncull();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
    this.forEachChildView(uncullChildView, this);
  }

  protected override onUncull(): void {
    super.onUncull();
    if (this.mood.isInherited()) {
      this.mood.change();
    }
    if (this.theme.isInherited()) {
      this.theme.change();
    }
  }

  cullViewFrame(viewFrame: R2Box = this.viewFrame): void {
    this.setCulled(!viewFrame.intersects(this.viewBounds));
  }

  declare readonly renderer: GraphicsRenderer | null; // getter defined below to work around useDefineForClassFields lunacy

  protected override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.viewFlags & View.NeedsAnimate) === 0) {
      processFlags &= ~View.NeedsAnimate;
    }
    return processFlags;
  }

  override cascadeProcess(processFlags: ViewFlags, baseViewContext: ViewContext): void {
    const viewContext = this.extendViewContext(baseViewContext);
    processFlags &= ~View.NeedsProcess;
    processFlags |= this.viewFlags & View.UpdateMask;
    processFlags = this.needsProcess(processFlags, viewContext);
    if ((processFlags & View.ProcessMask) !== 0) {
      let cascadeFlags = processFlags;
      this.setViewFlags(this.viewFlags & ~(View.NeedsProcess | View.NeedsProject)
                                       |  (View.TraversingFlag | View.ProcessingFlag));
      try {
        this.willProcess(cascadeFlags, viewContext);
        if (((this.viewFlags | processFlags) & View.NeedsResize) !== 0) {
          cascadeFlags |= View.NeedsResize;
          this.setViewFlags(this.viewFlags & ~View.NeedsResize);
          this.willResize(viewContext);
        }
        if (((this.viewFlags | processFlags) & View.NeedsScroll) !== 0) {
          cascadeFlags |= View.NeedsScroll;
          this.setViewFlags(this.viewFlags & ~View.NeedsScroll);
          this.willScroll(viewContext);
        }
        if (((this.viewFlags | processFlags) & View.NeedsChange) !== 0) {
          cascadeFlags |= View.NeedsChange;
          this.setViewFlags(this.viewFlags & ~View.NeedsChange);
          this.willChange(viewContext);
        }
        if (((this.viewFlags | processFlags) & View.NeedsAnimate) !== 0) {
          cascadeFlags |= View.NeedsAnimate;
          this.setViewFlags(this.viewFlags & ~View.NeedsAnimate);
          this.willAnimate(viewContext);
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

        if ((cascadeFlags & View.ProcessMask) !== 0) {
          this.processChildViews(cascadeFlags, viewContext, this.processChildView);
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
      } finally {
        this.setViewFlags(this.viewFlags & ~(View.TraversingFlag | View.ProcessingFlag));
      }
    }
  }

  protected override willResize(viewContext: ViewContextType<this>): void {
    super.willResize(viewContext);
    this.evaluateConstraintVariables();
  }

  protected override onChange(viewContext: ViewContextType<this>): void {
    super.onChange(viewContext);
    this.changeViewProperties();
    this.updateTheme();
  }

  override cascadeDisplay(displayFlags: ViewFlags, baseViewContext: ViewContext): void {
    const viewContext = this.extendViewContext(baseViewContext);
    displayFlags &= ~View.NeedsDisplay;
    displayFlags |= this.viewFlags & View.UpdateMask;
    displayFlags = this.needsDisplay(displayFlags, viewContext);
    if ((displayFlags & View.DisplayMask) !== 0) {
      let cascadeFlags = displayFlags;
      this.setViewFlags(this.viewFlags & ~View.NeedsDisplay | (View.TraversingFlag | View.DisplayingFlag));
      try {
        this.willDisplay(cascadeFlags, viewContext);
        if (((this.viewFlags | displayFlags) & View.NeedsLayout) !== 0) {
          cascadeFlags |= View.NeedsLayout;
          this.setViewFlags(this.viewFlags & ~View.NeedsLayout);
          this.willLayout(viewContext);
        }
        if (((this.viewFlags | displayFlags) & View.NeedsRender) !== 0) {
          cascadeFlags |= View.NeedsRender;
          this.setViewFlags(this.viewFlags & ~View.NeedsRender);
          this.willRender(viewContext);
        }
        if (((this.viewFlags | displayFlags) & View.NeedsRasterize) !== 0) {
          cascadeFlags |= View.NeedsRasterize;
          this.setViewFlags(this.viewFlags & ~View.NeedsRasterize);
          this.willRasterize(viewContext);
        }
        if (((this.viewFlags | displayFlags) & View.NeedsComposite) !== 0) {
          cascadeFlags |= View.NeedsComposite;
          this.setViewFlags(this.viewFlags & ~View.NeedsComposite);
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

        if ((cascadeFlags & View.DisplayMask) !== 0 && !this.isHidden() && !this.isCulled()) {
          this.displayChildViews(cascadeFlags, viewContext, this.displayChildView);
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
      } finally {
        this.setViewFlags(this.viewFlags & ~(View.TraversingFlag | View.DisplayingFlag));
      }
    }
  }

  protected willRender(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewWillRenderObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillRender(viewContext, this);
      }
    }
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didRender(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewDidRenderObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidRender(viewContext, this);
      }
    }
  }

  protected willRasterize(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewWillRasterizeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillRasterize(viewContext, this);
      }
    }
  }

  protected onRasterize(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didRasterize(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewDidRasterizeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidRasterize(viewContext, this);
      }
    }
  }

  protected willComposite(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewWillCompositeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillComposite(viewContext, this);
      }
    }
  }

  protected onComposite(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didComposite(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewDidCompositeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidComposite(viewContext, this);
      }
    }
  }

  protected renderViewOutline(viewBox: R2Box, context: CanvasContext,
                              outlineColor: Color, outlineWidth: number): void {
    if (viewBox.isDefined()) {
      context.beginPath();
      context.moveTo(viewBox.xMin, viewBox.yMin);
      context.lineTo(viewBox.xMin, viewBox.yMax);
      context.lineTo(viewBox.xMax, viewBox.yMax);
      context.lineTo(viewBox.xMax, viewBox.yMin);
      context.closePath();
      context.lineWidth = outlineWidth;
      context.strokeStyle = outlineColor.toString();
      context.stroke();
    }
  }

  @ViewProperty({type: MoodMatrix, state: null})
  readonly moodModifier!: ViewProperty<this, MoodMatrix | null>;

  @ViewProperty({type: MoodMatrix, state: null})
  readonly themeModifier!: ViewProperty<this, MoodMatrix | null>;

  override getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined {
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

  override getLookOr<T, E>(look: Look<T, unknown>, elseValue: E): T | E;
  override getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null, elseValue: E): T | E;
  override getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null | E, elseValue?: E): T | E {
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

  override modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: AnyTiming | boolean): void {
    if (this.moodModifier.takesPrecedence(View.Intrinsic)) {
      const oldMoodModifier = this.moodModifier.getStateOr(MoodMatrix.empty());
      const newMoodModifier = oldMoodModifier.updatedCol(feel, updates, true);
      if (!newMoodModifier.equals(oldMoodModifier)) {
        this.moodModifier.setState(newMoodModifier, View.Intrinsic);
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

  override modifyTheme(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: AnyTiming | boolean): void {
    if (this.themeModifier.takesPrecedence(View.Intrinsic)) {
      const oldThemeModifier = this.themeModifier.getStateOr(MoodMatrix.empty());
      const newThemeModifier = oldThemeModifier.updatedCol(feel, updates, true);
      if (!newThemeModifier.equals(oldThemeModifier)) {
        this.themeModifier.setState(newThemeModifier, View.Intrinsic);
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

  protected changeMood(): void {
    const moodModifierProperty = this.getViewProperty("moodModifier") as ViewProperty<this, MoodMatrix | null> | null;
    if (moodModifierProperty !== null && this.mood.takesPrecedence(View.Intrinsic)) {
      const moodModifier = moodModifierProperty.state;
      if (moodModifier !== null) {
        let superMood = this.mood.superState;
        if (superMood === void 0 || superMood === null ) {
          const themeManager = this.themeService.manager;
          if (themeManager !== void 0 && themeManager !== null) {
            superMood = themeManager.mood;
          }
        }
        if (superMood !== void 0 && superMood !== null) {
          const mood = moodModifier.timesCol(superMood, true);
          this.mood.setState(mood, View.Intrinsic);
        }
      } else {
        this.mood.setInherited(true);
      }
    }
  }

  protected changeTheme(): void {
    const themeModifierProperty = this.getViewProperty("themeModifier") as ViewProperty<this, MoodMatrix | null> | null;
    if (themeModifierProperty !== null && this.theme.takesPrecedence(View.Intrinsic)) {
      const themeModifier = themeModifierProperty.state;
      if (themeModifier !== null) {
        let superTheme = this.theme.superState;
        if (superTheme === void 0 || superTheme === null) {
          const themeManager = this.themeService.manager;
          if (themeManager !== void 0 && themeManager !== null) {
            superTheme = themeManager.theme;
          }
        }
        if (superTheme !== void 0 && superTheme !== null) {
          const theme = superTheme.transform(themeModifier, true);
          this.theme.setState(theme, View.Intrinsic);
        }
      } else {
        this.theme.setInherited(true);
      }
    }
  }

  protected updateTheme(timing?: AnyTiming | boolean): void {
    this.changeMood();
    this.changeTheme();
    const theme = this.theme.state;
    const mood = this.mood.state;
    if (theme !== null && mood !== null) {
      this.applyTheme(theme, mood, timing);
    }
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    this.themeViewAnimators(theme, mood, timing);
  }

  /** @hidden */
  protected mountTheme(): void {
    // hook
  }

  /**
   * Returns `true` if this view is ineligible for rendering and hit testing,
   * and should be excluded from its parent's layout and hit bounds.
   */
  isHidden(): boolean {
    return (this.viewFlags & View.HiddenMask) !== 0;
  }

  /**
   * Makes this view ineligible for rendering and hit testing, and excludes
   * this view from its parent's layout and hit bounds, when `hidden` is `true`.
   * Makes this view eligible for rendering and hit testing, and includes this
   * view in its parent's layout and hit bounds, when `hidden` is `false`.
   */
  setHidden(hidden: boolean): void {
    const viewFlags = this.viewFlags;
    if (hidden && (viewFlags & View.HiddenFlag) === 0) {
      this.setViewFlags(viewFlags | View.HiddenFlag);
      if ((viewFlags & View.HideFlag) === 0) {
        this.hideView();
      }
    } else if (!hidden && (viewFlags & View.HiddenFlag) !== 0) {
      this.setViewFlags(viewFlags & ~View.HiddenFlag);
      if ((viewFlags & View.HideFlag) === 0) {
        this.unhideView();
      }
    }
  }

  cascadeHide(): void {
    if ((this.viewFlags & View.HideFlag) === 0) {
      this.setViewFlags(this.viewFlags | View.HideFlag);
      if ((this.viewFlags & View.HiddenFlag) === 0) {
        this.hideView();
      }
    }
  }

  /** @hidden */
  protected hideView(): void {
    this.setViewFlags(this.viewFlags | View.TraversingFlag);
    try {
      this.willSetHidden(true);
      this.onSetHidden(true);
      this.hideChildViews();
      this.didSetHidden(true);
    } finally {
      this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
    }
  }

  /** @hidden */
  protected hideChildViews(): void {
    type self = this;
    function hideChildView(this: self, childView: View): void {
      if (childView instanceof GraphicsView) {
        childView.cascadeHide();
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
        }
      }
    }
    this.forEachChildView(hideChildView, this);
  }

  cascadeUnhide(): void {
    if ((this.viewFlags & View.HideFlag) !== 0) {
      this.setViewFlags(this.viewFlags & ~View.HideFlag);
      if ((this.viewFlags & View.HiddenFlag) === 0) {
        this.unhideView();
      }
    }
  }

  /** @hidden */
  protected unhideView(): void {
    this.setViewFlags(this.viewFlags | View.TraversingFlag);
    try {
      this.willSetHidden(false);
      this.unhideChildViews();
      this.onSetHidden(false);
      this.didSetHidden(false);
    } finally {
      this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
    }
  }

  /** @hidden */
  protected unhideChildViews(): void {
    type self = this;
    function unhideChildView(this: self, childView: View): void {
      if (childView instanceof GraphicsView) {
        childView.cascadeUnhide();
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
        }
      }
    }
    this.forEachChildView(unhideChildView, this);
  }

  protected willSetHidden(hidden: boolean): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetHidden !== void 0) {
        viewObserver.viewWillSetHidden(hidden, this);
      }
    }
  }

  protected onSetHidden(hidden: boolean): void {
    if (!hidden) {
      this.requireUpdate(View.NeedsRender);
    }
  }

  protected didSetHidden(hidden: boolean): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetHidden !== void 0) {
        viewObserver.viewDidSetHidden(hidden, this);
      }
    }
  }

  /** @hidden */
  readonly viewServices!: {[serviceName: string]: ViewService<View, unknown> | undefined} | null;

  override hasViewService(serviceName: string): boolean {
    const viewServices = this.viewServices;
    return viewServices !== null && viewServices[serviceName] !== void 0;
  }

  override getViewService(serviceName: string): ViewService<this, unknown> | null {
    const viewServices = this.viewServices;
    if (viewServices !== null) {
      const viewService = viewServices[serviceName];
      if (viewService !== void 0) {
        return viewService as ViewService<this, unknown>;
      }
    }
    return null;
  }

  override setViewService(serviceName: string, newViewService: ViewService<this, unknown> | null): void {
    let viewServices = this.viewServices;
    if (viewServices === null) {
      viewServices = {};
      Object.defineProperty(this, "viewServices", {
        value: viewServices,
        enumerable: true,
        configurable: true,
      });
    }
    const oldViewService = viewServices[serviceName];
    if (oldViewService !== void 0 && this.isMounted()) {
      oldViewService.unmount();
    }
    if (newViewService !== null) {
      viewServices[serviceName] = newViewService;
      if (this.isMounted()) {
        newViewService.mount();
      }
    } else {
      delete viewServices[serviceName];
    }
  }

  /** @hidden */
  protected mountViewServices(): void {
    const viewServices = this.viewServices;
    for (const serviceName in viewServices) {
      const viewService = viewServices[serviceName]!;
      viewService.mount();
    }
  }

  /** @hidden */
  protected unmountViewServices(): void {
    const viewServices = this.viewServices;
    for (const serviceName in viewServices) {
      const viewService = viewServices[serviceName]!;
      viewService.unmount();
    }
  }

  /** @hidden */
  readonly viewProperties!: {[propertyName: string]: ViewProperty<View, unknown> | undefined} | null;

  override hasViewProperty(propertyName: string): boolean {
    const viewProperties = this.viewProperties;
    return viewProperties !== null && viewProperties[propertyName] !== void 0;
  }

  override getViewProperty(propertyName: string): ViewProperty<this, unknown> | null {
    const viewProperties = this.viewProperties;
    if (viewProperties !== null) {
      const viewProperty = viewProperties[propertyName];
      if (viewProperty !== void 0) {
        return viewProperty as ViewProperty<this, unknown>;
      }
    }
    return null;
  }

  override setViewProperty(propertyName: string, newViewProperty: ViewProperty<this, unknown> | null): void {
    let viewProperties = this.viewProperties;
    if (viewProperties === null) {
      viewProperties = {};
      Object.defineProperty(this, "viewProperties", {
        value: viewProperties,
        enumerable: true,
        configurable: true,
      });
    }
    const oldViewProperty = viewProperties[propertyName];
    if (oldViewProperty !== void 0 && this.isMounted()) {
      oldViewProperty.unmount();
    }
    if (newViewProperty !== null) {
      viewProperties[propertyName] = newViewProperty;
      if (this.isMounted()) {
        newViewProperty.mount();
      }
    } else {
      delete viewProperties[propertyName];
    }
  }

  /** @hidden */
  changeViewProperties(): void {
    const viewProperties = this.viewProperties;
    for (const propertyName in viewProperties) {
      const viewProperty = viewProperties[propertyName]!;
      viewProperty.onChange();
    }
  }

  /** @hidden */
  protected mountViewProperties(): void {
    const viewProperties = this.viewProperties;
    for (const propertyName in viewProperties) {
      const viewProperty = viewProperties[propertyName]!;
      viewProperty.mount();
    }
  }

  /** @hidden */
  protected unmountViewProperties(): void {
    const viewProperties = this.viewProperties;
    for (const propertyName in viewProperties) {
      const viewProperty = viewProperties[propertyName]!;
      viewProperty.unmount();
    }
  }

  /** @hidden */
  readonly viewAnimators!: {[animatorName: string]: ViewAnimator<View, unknown> | undefined} | null;

  override hasViewAnimator(animatorName: string): boolean {
    const viewAnimators = this.viewAnimators;
    return viewAnimators !== null && viewAnimators[animatorName] !== void 0;
  }

  override getViewAnimator(animatorName: string): ViewAnimator<this, unknown> | null {
    const viewAnimators = this.viewAnimators;
    if (viewAnimators !== null) {
      const viewAnimator = viewAnimators[animatorName];
      if (viewAnimator !== void 0) {
        return viewAnimator as ViewAnimator<this, unknown>;
      }
    }
    return null;
  }

  override setViewAnimator(animatorName: string, newViewAnimator: ViewAnimator<this, unknown> | null): void {
    let viewAnimators = this.viewAnimators;
    if (viewAnimators === null) {
      viewAnimators = {};
      Object.defineProperty(this, "viewAnimators", {
        value: viewAnimators,
        enumerable: true,
        configurable: true,
      });
    }
    const oldViewAnimator = viewAnimators[animatorName];
    if (oldViewAnimator !== void 0 && this.isMounted()) {
      oldViewAnimator.unmount();
    }
    if (newViewAnimator !== null) {
      viewAnimators[animatorName] = newViewAnimator;
      if (this.isMounted()) {
        newViewAnimator.mount();
      }
    } else {
      delete viewAnimators[animatorName];
    }
  }

  /** @hidden */
  protected themeViewAnimators(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    const viewAnimators = this.viewAnimators;
    for (const animatorName in viewAnimators) {
      const viewAnimator = viewAnimators[animatorName]!;
      viewAnimator.applyTheme(theme, mood, timing);
    }
  }

  /** @hidden */
  protected mountViewAnimators(): void {
    const viewAnimators = this.viewAnimators;
    for (const animatorName in viewAnimators) {
      const viewAnimator = viewAnimators[animatorName]!;
      viewAnimator.mount();
    }
  }

  /** @hidden */
  protected unmountViewAnimators(): void {
    const viewAnimators = this.viewAnimators;
    for (const animatorName in viewAnimators) {
      const viewAnimator = viewAnimators[animatorName]!;
      viewAnimator.unmount();
    }
  }

  /** @hidden */
  readonly viewFasteners!: {[fastenerName: string]: ViewFastener<View, View> | undefined} | null;

  override hasViewFastener(fastenerName: string): boolean {
    const viewFasteners = this.viewFasteners;
    return viewFasteners !== null && viewFasteners[fastenerName] !== void 0;
  }

  override getViewFastener(fastenerName: string): ViewFastener<this, View> | null {
    const viewFasteners = this.viewFasteners;
    if (viewFasteners !== null) {
      const viewFastener = viewFasteners[fastenerName];
      if (viewFastener !== void 0) {
        return viewFastener as ViewFastener<this, View>;
      }
    }
    return null;
  }

  override setViewFastener(fastenerName: string, newViewFastener: ViewFastener<this, any> | null): void {
    let viewFasteners = this.viewFasteners;
    if (viewFasteners === null) {
      viewFasteners = {};
      Object.defineProperty(this, "viewFasteners", {
        value: viewFasteners,
        enumerable: true,
        configurable: true,
      });
    }
    const oldViewFastener = viewFasteners[fastenerName];
    if (oldViewFastener !== void 0 && this.isMounted()) {
      oldViewFastener.unmount();
    }
    if (newViewFastener !== null) {
      viewFasteners[fastenerName] = newViewFastener;
      if (this.isMounted()) {
        newViewFastener.mount();
      }
    } else {
      delete viewFasteners[fastenerName];
    }
  }

  /** @hidden */
  protected mountViewFasteners(): void {
    const viewFasteners = this.viewFasteners;
    for (const fastenerName in viewFasteners) {
      const viewFastener = viewFasteners[fastenerName]!;
      viewFastener.mount();
    }
  }

  /** @hidden */
  protected unmountViewFasteners(): void {
    const viewFasteners = this.viewFasteners;
    for (const fastenerName in viewFasteners) {
      const viewFastener = viewFasteners[fastenerName]!;
      viewFastener.unmount();
    }
  }

  /** @hidden */
  protected insertViewFastener(childView: View, targetView: View | null): void {
    const fastenerName = childView.key;
    if (fastenerName !== void 0) {
      const viewFastener = this.getLazyViewFastener(fastenerName);
      if (viewFastener !== null && viewFastener.child === true) {
        viewFastener.doSetView(childView, targetView);
      }
    }
  }

  /** @hidden */
  protected removeViewFastener(childView: View): void {
    const fastenerName = childView.key;
    if (fastenerName !== void 0) {
      const viewFastener = this.getViewFastener(fastenerName);
      if (viewFastener !== null && viewFastener.child === true) {
        viewFastener.doSetView(null, null);
      }
    }
  }

  /** @hidden */
  readonly gestures!: {[gestureName: string]: Gesture<View, View> | undefined} | null;

  override hasGesture(gestureName: string): boolean {
    const gestures = this.gestures;
    return gestures !== null && gestures[gestureName] !== void 0;
  }

  override getGesture(gestureName: string): Gesture<this, View> | null {
    const gestures = this.gestures;
    if (gestures !== null) {
      const gesture = gestures[gestureName];
      if (gesture !== void 0) {
        return gesture as Gesture<this, View>;
      }
    }
    return null;
  }

  override setGesture(gestureName: string, newGesture: Gesture<this, any> | null): void {
    let gestures = this.gestures;
    if (gestures === null) {
      gestures = {};
      Object.defineProperty(this, "gestures", {
        value: gestures,
        enumerable: true,
        configurable: true,
      });
    }
    const oldGesture = gestures[gestureName];
    if (oldGesture !== void 0 && this.isMounted()) {
      oldGesture.unmount();
    }
    if (newGesture !== null) {
      gestures[gestureName] = newGesture;
      if (this.isMounted()) {
        newGesture.mount();
      }
    } else {
      delete gestures[gestureName];
    }
  }

  /** @hidden */
  protected mountGestures(): void {
    const gestures = this.gestures;
    for (const gestureName in gestures) {
      const gesture = gestures[gestureName]!;
      gesture.mount();
    }
    GestureContext.initGestures(this);
  }

  /** @hidden */
  protected unmountGestures(): void {
    const gestures = this.gestures;
    for (const gestureName in gestures) {
      const gesture = gestures[gestureName]!;
      gesture.unmount();
    }
  }

  /** @hidden */
  protected insertGesture(childView: View, targetView: View | null): void {
    const gestureName = childView.key;
    if (gestureName !== void 0) {
      const gesture = this.getLazyGesture(gestureName);
      if (gesture !== null && gesture.child === true) {
        gesture.setView(childView, targetView);
      }
    }
  }

  /** @hidden */
  protected removeGesture(childView: View): void {
    const gestureName = childView.key;
    if (gestureName !== void 0) {
      const gesture = this.getGesture(gestureName);
      if (gesture !== null && gesture.child === true) {
        gesture.setView(null, null);
      }
    }
  }

  readonly constraints!: ReadonlyArray<Constraint>;

  override hasConstraint(constraint: Constraint): boolean {
    return this.constraints.indexOf(constraint) >= 0;
  }

  override addConstraint(constraint: Constraint): void {
    const oldConstraints = this.constraints;
    const newConstraints = Arrays.inserted(constraint, oldConstraints);
    if (oldConstraints !== newConstraints) {
      Object.defineProperty(this, "constraints", {
        value: newConstraints,
        enumerable: true,
        configurable: true,
      });
      this.activateConstraint(constraint);
    }
  }

  override removeConstraint(constraint: Constraint): void {
    const oldConstraints = this.constraints;
    const newConstraints = Arrays.removed(constraint, oldConstraints);
    if (oldConstraints !== newConstraints) {
      this.deactivateConstraint(constraint);
      Object.defineProperty(this, "constraints", {
        value: newConstraints,
        enumerable: true,
        configurable: true,
      });
    }
  }

  readonly constraintVariables!: ReadonlyArray<ConstraintVariable>;

  override hasConstraintVariable(constraintVariable: ConstraintVariable): boolean {
    return this.constraintVariables.indexOf(constraintVariable) >= 0;
  }

  override addConstraintVariable(constraintVariable: ConstraintVariable): void {
    const oldConstraintVariables = this.constraintVariables;
    const newConstraintVariables = Arrays.inserted(constraintVariable, oldConstraintVariables);
    if (oldConstraintVariables !== newConstraintVariables) {
      Object.defineProperty(this, "constraintVariables", {
        value: newConstraintVariables,
        enumerable: true,
        configurable: true,
      });
      this.activateConstraintVariable(constraintVariable);
    }
  }

  override removeConstraintVariable(constraintVariable: ConstraintVariable): void {
    const oldConstraintVariables = this.constraintVariables;
    const newConstraintVariables = Arrays.removed(constraintVariable, oldConstraintVariables);
    if (oldConstraintVariables !== newConstraintVariables) {
      this.deactivateConstraintVariable(constraintVariable);
      Object.defineProperty(this, "constraintVariables", {
        value: newConstraintVariables,
        enumerable: true,
        configurable: true,
      });
    }
  }

  /** @hidden */
  evaluateConstraintVariables(): void {
    const constraintVariables = this.constraintVariables;
    for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
      const constraintVariable = constraintVariables[i]!;
      constraintVariable.evaluateConstraintVariable();
    }
  }

  /** @hidden */
  activateLayout(): void {
    const layoutManager = this.layoutService.manager;
    if (layoutManager !== void 0 && layoutManager !== null) {
      const constraints = this.constraints;
      for (let i = 0, n = constraints.length; i < n; i += 1) {
        layoutManager.activateConstraint(constraints[i]!);
      }
    }
  }

  /** @hidden */
  deactivateLayout(): void {
    const layoutManager = this.layoutService.manager;
    if (layoutManager !== void 0 && layoutManager !== null) {
      const constraints = this.constraints;
      for (let i = 0, n = constraints.length; i < n; i += 1) {
        layoutManager.deactivateConstraint(constraints[i]!);
      }
    }
  }

  override readonly viewContext!: GraphicsViewContext;

  /** @hidden */
  readonly ownViewFrame!: R2Box | null;

  /**
   * The parent-specified view-coordinate bounding box in which this view
   * should layout and render graphics.
   */
  get viewFrame(): R2Box {
    let viewFrame = this.ownViewFrame;
    if (viewFrame === null) {
      const parentView = this.parentView;
      if (parentView instanceof GraphicsView || parentView instanceof CanvasView) {
        viewFrame = parentView.viewFrame;
      } else {
        viewFrame = R2Box.undefined();
      }
    }
    return viewFrame;
  }

  /**
   * Sets the view-coordinate bounding box in which this view should layout
   * and render graphics.  Should only be invoked by the view's parent view.
   */
  setViewFrame(viewFrame: R2Box | null): void {
    Object.defineProperty(this, "ownViewFrame", {
      value: viewFrame,
      enumerable: true,
      configurable: true,
    });
  }

  /**
   * The self-defined view-coordinate bounding box surrounding all graphics
   * this view could possibly render.  Views with view bounds that don't
   * overlap their view frames may be culled from rendering and hit testing.
   */
  declare readonly viewBounds: R2Box; // getter defined below to work around useDefineForClassFields lunacy

  get ownViewBounds(): R2Box | null {
    return null;
  }

  deriveViewBounds(): R2Box {
    let viewBounds: R2Box | null = this.ownViewBounds;
    type self = this;
    function accumulateViewBounds(this: self, childView: View): void {
      if (childView instanceof GraphicsView && !childView.isHidden() && !childView.isUnbounded()) {
        const childViewBounds = childView.viewBounds;
        if (childViewBounds.isDefined()) {
          if (viewBounds !== null) {
            viewBounds = viewBounds.union(childViewBounds);
          } else {
            viewBounds = childViewBounds;
          }
        }
      }
    }
    this.forEachChildView(accumulateViewBounds, this);
    if (viewBounds === null) {
      viewBounds = this.viewFrame;
    }
    return viewBounds;
  }

  /**
   * The self-defined view-coordinate bounding box surrounding all hit regions
   * in this view.
   */
  get hitBounds(): R2Box {
    return this.viewBounds;
  }

  deriveHitBounds(): R2Box {
    let hitBounds: R2Box | undefined;
    type self = this;
    function accumulateHitBounds(this: self, childView: View): void {
      if (childView instanceof GraphicsView && !childView.isHidden() && !childView.isIntangible()) {
        const childHitBounds = childView.hitBounds;
        if (hitBounds === void 0) {
          hitBounds = childHitBounds;
        } else {
          hitBounds = hitBounds.union(childHitBounds);
        }
      }
    }
    this.forEachChildView(accumulateHitBounds, this);
    if (hitBounds === void 0) {
      hitBounds = this.viewBounds;
    }
    return hitBounds;
  }

  cascadeHitTest(x: number, y: number, baseViewContext: ViewContext): GraphicsView | null {
    if (!this.isHidden() && !this.isCulled() && !this.isIntangible()) {
      const hitBounds = this.hitBounds;
      if (hitBounds.contains(x, y)) {
        const viewContext = this.extendViewContext(baseViewContext);
        let hit = this.hitTestChildViews(x, y, viewContext);
        if (hit === null) {
          hit = this.hitTest(x, y, viewContext);
        }
        return hit;
      }
    }
    return null;
  }

  protected hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    return null;
  }

  protected hitTestChildViews(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    type self = this;
    function hitTestChildView(this: self, childView: View): GraphicsView | void {
      if (childView instanceof GraphicsView) {
        const hit = this.hitTestChildView(childView, x, y, viewContext);
        if (hit !== null) {
          return hit;
        }
      }
    }
    const hit = this.forEachChildView(hitTestChildView, this);
    return hit !== void 0 ? hit : null;
  }

  protected hitTestChildView(childView: GraphicsView, x: number, y: number,
                             viewContext: ViewContextType<this>): GraphicsView | null {
    return childView.cascadeHitTest(x, y, viewContext);
  }

  override get parentTransform(): Transform {
    return Transform.identity();
  }

  override get clientBounds(): R2Box {
    const inverseClientTransform = this.clientTransform.inverse();
    return this.viewBounds.transform(inverseClientTransform);
  }

  override get popoverFrame(): R2Box {
    const inversePageTransform = this.pageTransform.inverse();
    return this.viewBounds.transform(inversePageTransform);
  }

  /** @hidden */
  readonly eventHandlers!: {[type: string]: ViewEventHandler[] | undefined} | null;

  override on<T extends keyof GraphicsViewEventMap>(type: T, listener: (this: this, event: GraphicsViewEventMap[T]) => unknown,
                                                    options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    let eventHandlers = this.eventHandlers;
    if (eventHandlers === null) {
      eventHandlers = {};
      Object.defineProperty(this, "eventHandlers", {
        value: eventHandlers,
        enumerable: true,
        configurable: true,
      });
    }
    let handlers = eventHandlers[type];
    const capture = typeof options === "boolean" ? options
                  : typeof options === "object" && options !== null && options.capture || false;
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
        handler = handlers[i]!;
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

  override off<T extends keyof GraphicsViewEventMap>(type: T, listener: (this: View, event: GraphicsViewEventMap[T]) => unknown,
                                                     options?: EventListenerOptions | boolean): this;
  override off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;
  override off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    const eventHandlers = this.eventHandlers;
    if (eventHandlers !== null) {
      const handlers = eventHandlers[type];
      if (handlers !== void 0) {
        const capture = typeof options === "boolean" ? options
                      : typeof options === "object" && options !== null && options.capture || false;
        const n = handlers.length;
        let i = 0;
        while (i < n) {
          const handler = handlers[i]!;
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
    const eventHandlers = this.eventHandlers;
    if (eventHandlers !== null) {
      const handlers = eventHandlers[type];
      if (handlers !== void 0) {
        let i = 0;
        while (i < handlers.length) {
          const handler = handlers[i]!;
          if (!handler.capture) {
            const listener = handler.listener;
            if (typeof listener === "function") {
              listener.call(this, event);
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
      this.onMouseOver(event as ViewMouseEvent);
    } else if (type === "mouseout") {
      this.onMouseOut(event as ViewMouseEvent);
    } else if (type === "pointerover") {
      this.onPointerOver(event as ViewPointerEvent);
    } else if (type === "pointerout") {
      this.onPointerOut(event as ViewPointerEvent);
    }
  }

  /**
   * Invokes event handlers registered with this `View` before propagating the
   * `event` up the view hierarchy.  Returns a `View`, without invoking any
   * registered event handlers, on which `dispatchEvent` should be called to
   * continue event propagation.
   * @hidden
   */
  bubbleEvent(event: ViewEvent): View | null {
    this.handleEvent(event);
    let next: View | null;
    if (event.bubbles && !event.cancelBubble) {
      const parentView = this.parentView;
      if (parentView instanceof GraphicsView || parentView instanceof CanvasView) {
        next = parentView.bubbleEvent(event);
      } else {
        next = parentView;
      }
    } else {
      next = null;
    }
    return next;
  }

  override dispatchEvent(event: ViewEvent): boolean {
    event.targetView = this;
    const next = this.bubbleEvent(event);
    if (next !== null) {
      return next.dispatchEvent(event);
    } else {
      return !event.cancelBubble;
    }
  }

  /** @hidden */
  readonly hoverSet!: {[id: string]: null | undefined} | null;

  isHovering(): boolean {
    const hoverSet = this.hoverSet;
    return hoverSet !== null && Object.keys(hoverSet).length !== 0;
  }

  /** @hidden */
  protected onMouseOver(event: ViewMouseEvent): void {
    let hoverSet = this.hoverSet;
    if (hoverSet === null) {
      hoverSet = {};
      Object.defineProperty(this, "hoverSet", {
        value: hoverSet,
        enumerable: true,
        configurable: true,
      });
    }
    if (hoverSet.mouse === void 0) {
      hoverSet.mouse = null;
      const eventHandlers = this.eventHandlers;
      if (eventHandlers !== null && eventHandlers.mouseenter !== void 0) {
        const enterEvent = new MouseEvent("mouseenter", {
          bubbles: false,
          button: event.button,
          buttons: event.buttons,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          movementX: event.movementX,
          movementY: event.movementY,
          view: event.view,
          detail: event.detail,
          relatedTarget: event.relatedTarget,
        }) as ViewMouseEvent;
        enterEvent.targetView = this;
        enterEvent.relatedTargetView = event.relatedTargetView;
        this.handleEvent(enterEvent);
      }
    }
  }

  /** @hidden */
  protected onMouseOut(event: ViewMouseEvent): void {
    const hoverSet = this.hoverSet;
    if (hoverSet !== null && hoverSet.mouse !== void 0) {
      delete hoverSet.mouse;
      const eventHandlers = this.eventHandlers;
      if (eventHandlers !== null && eventHandlers.mouseleave !== void 0) {
        const leaveEvent = new MouseEvent("mouseleave", {
          bubbles: false,
          button: event.button,
          buttons: event.buttons,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          movementX: event.movementX,
          movementY: event.movementY,
          view: event.view,
          detail: event.detail,
          relatedTarget: event.relatedTarget,
        }) as ViewMouseEvent;
        leaveEvent.targetView = this;
        leaveEvent.relatedTargetView = event.relatedTargetView;
        this.handleEvent(leaveEvent);
      }
    }
  }

  /** @hidden */
  protected onPointerOver(event: ViewPointerEvent): void {
    let hoverSet = this.hoverSet;
    if (hoverSet === null) {
      hoverSet = {};
      Object.defineProperty(this, "hoverSet", {
        value: hoverSet,
        enumerable: true,
        configurable: true,
      });
    }
    const id = "" + event.pointerId;
    if (hoverSet[id] === void 0) {
      hoverSet[id] = null;
      const eventHandlers = this.eventHandlers;
      if (eventHandlers !== null && eventHandlers.pointerenter !== void 0) {
        const enterEvent = new PointerEvent("pointerenter", {
          bubbles: false,
          pointerId: event.pointerId,
          pointerType: event.pointerType,
          isPrimary: event.isPrimary,
          button: event.button,
          buttons: event.buttons,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          movementX: event.movementX,
          movementY: event.movementY,
          tiltX: event.tiltX,
          tiltY: event.tiltY,
          twist: event.twist,
          width: event.width,
          height: event.height,
          pressure: event.pressure,
          tangentialPressure: event.tangentialPressure,
          view: event.view,
          detail: event.detail,
          relatedTarget: event.relatedTarget,
        }) as ViewPointerEvent;
        enterEvent.targetView = this;
        enterEvent.relatedTargetView = event.relatedTargetView;
        this.handleEvent(enterEvent);
      }
    }
  }

  /** @hidden */
  protected onPointerOut(event: ViewPointerEvent): void {
    const hoverSet = this.hoverSet;
    if (hoverSet !== null) {
      const id = "" + event.pointerId;
      if (hoverSet[id] !== void 0) {
        delete hoverSet[id];
        const eventHandlers = this.eventHandlers;
        if (eventHandlers !== null && eventHandlers.pointerleave !== void 0) {
          const leaveEvent = new PointerEvent("pointerleave", {
            bubbles: false,
            pointerId: event.pointerId,
            pointerType: event.pointerType,
            isPrimary: event.isPrimary,
            button: event.button,
            buttons: event.buttons,
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            shiftKey: event.shiftKey,
            clientX: event.clientX,
            clientY: event.clientY,
            screenX: event.screenX,
            screenY: event.screenY,
            movementX: event.movementX,
            movementY: event.movementY,
            tiltX: event.tiltX,
            tiltY: event.tiltY,
            twist: event.twist,
            width: event.width,
            height: event.height,
            pressure: event.pressure,
            tangentialPressure: event.tangentialPressure,
            view: event.view,
            detail: event.detail,
            relatedTarget: event.relatedTarget,
          }) as ViewPointerEvent;
          leaveEvent.targetView = this;
          leaveEvent.relatedTargetView = event.relatedTargetView;
          this.handleEvent(leaveEvent);
        }
      }
    }
  }

  static fromConstructor(viewConstructor: ViewConstructor): View {
    if (viewConstructor.prototype instanceof View) {
      return new viewConstructor();
    } else {
      throw new TypeError("" + viewConstructor);
    }
  }

  static override readonly uncullFlags: ViewFlags = View.uncullFlags | View.NeedsRender;
  static override readonly insertChildFlags: ViewFlags = View.insertChildFlags | View.NeedsRender;
  static override readonly removeChildFlags: ViewFlags = View.removeChildFlags | View.NeedsRender;
}
Object.defineProperty(GraphicsView.prototype, "renderer", {
  get(this: GraphicsView): GraphicsRenderer | null {
    const parentView = this.parentView;
    if (parentView instanceof GraphicsView || parentView instanceof CanvasView) {
      return parentView.renderer;
    } else {
      return null;
    }
  },
  enumerable: true,
  configurable: true,
});
Object.defineProperty(GraphicsView.prototype, "viewBounds", {
  get(this: GraphicsView): R2Box {
    return this.viewFrame;
  },
  enumerable: true,
  configurable: true,
});
