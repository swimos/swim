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

import {Mutable, Class, Arrays, ObserverType} from "@swim/util";
import {Provider} from "@swim/fastener";
import {R2Box, Transform} from "@swim/math";
import type {Color} from "@swim/style";
import {
  ViewContext,
  ViewContextType,
  ViewInit,
  ViewFlags,
  View,
  ViewWillRender,
  ViewDidRender,
  ViewWillRasterize,
  ViewDidRasterize,
  ViewWillComposite,
  ViewDidComposite,
  ViewEvent,
  ViewMouseEvent,
  ViewPointerEvent,
  ViewEventHandler,
} from "@swim/view";
import {SpriteService} from "../sprite/SpriteService";
import type {GraphicsRenderer} from "./GraphicsRenderer";
import type {GraphicsViewContext} from "./GraphicsViewContext";
import type {GraphicsViewObserver} from "./GraphicsViewObserver";
import type {CanvasContext} from "../canvas/CanvasContext";
import {CanvasView} from "../"; // forward import

/** @public */
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

/** @public */
export interface GraphicsViewInit extends ViewInit {
  hidden?: boolean;
}

/** @public */
export abstract class GraphicsView extends View {
  constructor() {
    super();
    this.parent = null;
    this.ownViewFrame = null;
    this.eventHandlers = null;
    this.hoverSet = null;
  }

  override readonly observerType?: Class<GraphicsViewObserver>;

  override readonly contextType?: Class<GraphicsViewContext>;

  override readonly parent: View | null;

  /** @internal */
  override attachParent(parent: View): void {
    this.willAttachParent(parent);
    (this as Mutable<this>).parent = parent;
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
  override detachParent(parent: View): void {
    this.willDetachParent(parent);
    if (this.mounted) {
      this.cascadeUnmount();
    }
    this.onDetachParent(parent);
    (this as Mutable<this>).parent = null;
    this.didDetachParent(parent);
  }

  declare readonly renderer: GraphicsRenderer | null; // getter defined below to work around useDefineForClassFields lunacy

  protected override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.flags & View.NeedsAnimate) === 0) {
      processFlags &= ~View.NeedsAnimate;
    }
    return processFlags;
  }

  override cascadeProcess(processFlags: ViewFlags, baseViewContext: ViewContext): void {
    const viewContext = this.extendViewContext(baseViewContext);
    const outerViewContext = ViewContext.current;
    try {
      ViewContext.current = viewContext;
      processFlags &= ~View.NeedsProcess;
      processFlags |= this.flags & View.UpdateMask;
      processFlags = this.needsProcess(processFlags, viewContext);
      if ((processFlags & View.ProcessMask) !== 0) {
        let cascadeFlags = processFlags;
        this.setFlags(this.flags & ~(View.NeedsProcess | View.NeedsProject) | (View.TraversingFlag | View.ProcessingFlag | View.ContextualFlag));
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
          this.setFlags(this.flags & ~View.ContextualFlag);
          this.processChildren(cascadeFlags, viewContext, this.processChild);
          this.setFlags(this.flags | View.ContextualFlag);
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
      this.setFlags(this.flags & ~(View.TraversingFlag | View.ProcessingFlag | View.ContextualFlag));
      ViewContext.current = outerViewContext;
    }
  }

  override cascadeDisplay(displayFlags: ViewFlags, baseViewContext: ViewContext): void {
    const viewContext = this.extendViewContext(baseViewContext);
    const outerViewContext = ViewContext.current;
    try {
      ViewContext.current = viewContext;
      displayFlags &= ~View.NeedsDisplay;
      displayFlags |= this.flags & View.UpdateMask;
      displayFlags = this.needsDisplay(displayFlags, viewContext);
      if ((displayFlags & View.DisplayMask) !== 0) {
        let cascadeFlags = displayFlags;
        this.setFlags(this.flags & ~View.NeedsDisplay | (View.TraversingFlag | View.DisplayingFlag | View.ContextualFlag));
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

        if ((cascadeFlags & View.DisplayMask) !== 0 && !this.isHidden() && !this.culled) {
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
      this.setFlags(this.flags & ~(View.TraversingFlag | View.DisplayingFlag | View.ContextualFlag));
      ViewContext.current = outerViewContext;
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

  protected renderViewOutline(viewBox: R2Box, context: CanvasContext,
                              outlineColor: Color, outlineWidth: number): void {
    if (viewBox.isDefined()) {
      // save
      const contextLineWidth = context.lineWidth;
      const contextStrokeStyle = context.strokeStyle;

      context.beginPath();
      context.moveTo(viewBox.xMin, viewBox.yMin);
      context.lineTo(viewBox.xMin, viewBox.yMax);
      context.lineTo(viewBox.xMax, viewBox.yMax);
      context.lineTo(viewBox.xMax, viewBox.yMin);
      context.closePath();
      context.lineWidth = outlineWidth;
      context.strokeStyle = outlineColor.toString();
      context.stroke();

      // restore
      context.lineWidth = contextLineWidth;
      context.strokeStyle = contextStrokeStyle;
    }
  }

  /**
   * Returns `true` if this view is ineligible for rendering and hit testing,
   * and should be excluded from its parent's layout and hit bounds.
   */
  isHidden(): boolean {
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
        this.setFlags(this.flags | View.TraversingFlag);
        try {
          this.willSetHidden(true);
          this.onSetHidden(true);
          this.hideChildren();
          this.didSetHidden(true);
        } finally {
          this.setFlags(this.flags & ~View.TraversingFlag);
        }
      }
    } else if (!hidden && (flags & View.HiddenFlag) !== 0) {
      this.setFlags(flags & ~View.HiddenFlag);
      if ((flags & View.HideFlag) === 0) {
        this.setFlags(this.flags | View.TraversingFlag);
        try {
          this.willSetHidden(false);
          this.unhideChildren();
          this.onSetHidden(false);
          this.didSetHidden(false);
        } finally {
          this.setFlags(this.flags & ~View.TraversingFlag);
        }
      }
    }
  }

  cascadeHide(): void {
    if ((this.flags & View.HideFlag) === 0) {
      this.setFlags(this.flags | View.HideFlag);
      if ((this.flags & View.HiddenFlag) === 0) {
        this.setFlags(this.flags | View.TraversingFlag);
        try {
          this.willSetHidden(true);
          this.onSetHidden(true);
          this.hideChildren();
          this.didSetHidden(true);
        } finally {
          this.setFlags(this.flags & ~View.TraversingFlag);
        }
      }
    }
  }

  /** @internal */
  protected hideChildren(): void {
    type self = this;
    function hideNext(this: self, child: View): void {
      if (child instanceof GraphicsView) {
        child.cascadeHide();
        if ((child.flags & View.RemovingFlag) !== 0) {
          child.setFlags(child.flags & ~View.RemovingFlag);
          this.removeChild(child);
        }
      }
    }
    this.forEachChild(hideNext, this);
  }

  cascadeUnhide(): void {
    if ((this.flags & View.HideFlag) !== 0) {
      this.setFlags(this.flags & ~View.HideFlag);
      if ((this.flags & View.HiddenFlag) === 0) {
        this.setFlags(this.flags | View.TraversingFlag);
        try {
          this.willSetHidden(false);
          this.unhideChildren();
          this.onSetHidden(false);
          this.didSetHidden(false);
        } finally {
          this.setFlags(this.flags & ~View.TraversingFlag);
        }
      }
    }
  }

  /** @internal */
  protected unhideChildren(): void {
    type self = this;
    function unhideNext(this: self, child: View): void {
      if (child instanceof GraphicsView) {
        child.cascadeUnhide();
        if ((child.flags & View.RemovingFlag) !== 0) {
          child.setFlags(child.flags & ~View.RemovingFlag);
          this.removeChild(child);
        }
      }
    }
    this.forEachChild(unhideNext, this);
  }

  protected willSetHidden(hidden: boolean): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetHidden !== void 0) {
        observer.viewWillSetHidden(hidden, this);
      }
    }
  }

  protected onSetHidden(hidden: boolean): void {
    if (!hidden) {
      this.requireUpdate(View.NeedsRender);
    }
  }

  protected didSetHidden(hidden: boolean): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetHidden !== void 0) {
        observer.viewDidSetHidden(hidden, this);
      }
    }
  }

  @Provider({
    type: SpriteService,
    observes: false,
    service: SpriteService.global(),
  })
  readonly spriteProvider!: Provider<this, SpriteService>;

  /** @internal */
  readonly ownViewFrame: R2Box | null;

  /**
   * The parent-specified view-coordinate bounding box in which this view
   * should layout and render graphics.
   */
  get viewFrame(): R2Box {
    let viewFrame = this.ownViewFrame;
    if (viewFrame === null) {
      viewFrame = this.deriveViewFrame();
    }
    return viewFrame;
  }

  /**
   * Sets the view-coordinate bounding box in which this view should layout
   * and render graphics. Should only be invoked by the view's parent view.
   */
  setViewFrame(viewFrame: R2Box | null): void {
    (this as Mutable<this>).ownViewFrame = viewFrame;
  }

  protected deriveViewFrame(): R2Box {
    const parent = this.parent;
    if (parent instanceof GraphicsView || parent instanceof CanvasView) {
      return parent.viewFrame;
    } else {
      return R2Box.undefined();
    }
  }

  cullViewFrame(viewFrame: R2Box = this.viewFrame): void {
    this.setCulled(!viewFrame.intersects(this.viewBounds));
  }

  /**
   * The self-defined view-coordinate bounding box surrounding all graphics
   * this view could possibly render. Views with view bounds that don't
   * overlap their view frames may be culled from rendering and hit testing.
   */
  declare readonly viewBounds: R2Box; // getter defined below to work around useDefineForClassFields lunacy

  get ownViewBounds(): R2Box | null {
    return null;
  }

  deriveViewBounds(): R2Box {
    let viewBounds: R2Box | null = this.ownViewBounds;
    type self = this;
    function accumulateViewBounds(this: self, child: View): void {
      if (child instanceof GraphicsView && !child.isHidden() && !child.unbounded) {
        const childViewBounds = child.viewBounds;
        if (childViewBounds.isDefined()) {
          if (viewBounds !== null) {
            viewBounds = viewBounds.union(childViewBounds);
          } else {
            viewBounds = childViewBounds;
          }
        }
      }
    }
    this.forEachChild(accumulateViewBounds, this);
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
    function accumulateHitBounds(this: self, child: View): void {
      if (child instanceof GraphicsView && !child.isHidden() && !child.intangible) {
        const childHitBounds = child.hitBounds;
        if (hitBounds === void 0) {
          hitBounds = childHitBounds;
        } else {
          hitBounds = hitBounds.union(childHitBounds);
        }
      }
    }
    this.forEachChild(accumulateHitBounds, this);
    if (hitBounds === void 0) {
      hitBounds = this.viewBounds;
    }
    return hitBounds;
  }

  cascadeHitTest(x: number, y: number, baseViewContext: ViewContext): GraphicsView | null {
    if (!this.isHidden() && !this.culled && !this.intangible) {
      const hitBounds = this.hitBounds;
      if (hitBounds.contains(x, y)) {
        const viewContext = this.extendViewContext(baseViewContext);
        let hit = this.hitTestChildren(x, y, viewContext);
        if (hit === null) {
          const outerViewContext = ViewContext.current;
          try {
            ViewContext.current = viewContext;
            this.setFlags(this.flags | View.ContextualFlag);
            hit = this.hitTest(x, y, viewContext);
          } finally {
            this.setFlags(this.flags & ~View.ContextualFlag);
            ViewContext.current = outerViewContext;
          }
        }
        return hit;
      }
    }
    return null;
  }

  protected hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    return null;
  }

  protected hitTestChildren(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    type self = this;
    function hitTestNext(this: self, child: View): GraphicsView | void {
      if (child instanceof GraphicsView) {
        const hit = this.hitTestChild(child, x, y, viewContext);
        if (hit !== null) {
          return hit;
        }
      }
    }
    const hit = this.forEachChild(hitTestNext, this);
    return hit !== void 0 ? hit : null;
  }

  protected hitTestChild(child: GraphicsView, x: number, y: number,
                         viewContext: ViewContextType<this>): GraphicsView | null {
    return child.cascadeHitTest(x, y, viewContext);
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

  /** @internal */
  readonly eventHandlers: {[type: string]: ViewEventHandler[] | undefined} | null;

  override on<K extends keyof GraphicsViewEventMap>(type: K, listener: (this: this, event: GraphicsViewEventMap[K]) => unknown,
                                                    options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    let eventHandlers = this.eventHandlers;
    if (eventHandlers === null) {
      eventHandlers = {};
      (this as Mutable<this>).eventHandlers = eventHandlers;
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

  override off<K extends keyof GraphicsViewEventMap>(type: K, listener: (this: View, event: GraphicsViewEventMap[K]) => unknown,
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

  /** @internal */
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
   * `event` up the view hierarchy. Returns a `View`, without invoking any
   * registered event handlers, on which `dispatchEvent` should be called to
   * continue event propagation.
   * @internal
   */
  bubbleEvent(event: ViewEvent): View | null {
    this.handleEvent(event);
    let next: View | null;
    if (event.bubbles && !event.cancelBubble) {
      const parent = this.parent;
      if (parent instanceof GraphicsView || parent instanceof CanvasView) {
        next = parent.bubbleEvent(event);
      } else {
        next = parent;
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

  /** @internal */
  readonly hoverSet: {[id: string]: null | undefined} | null;

  isHovering(): boolean {
    const hoverSet = this.hoverSet;
    return hoverSet !== null && Object.keys(hoverSet).length !== 0;
  }

  /** @internal */
  protected onMouseOver(event: ViewMouseEvent): void {
    let hoverSet = this.hoverSet;
    if (hoverSet === null) {
      hoverSet = {};
      (this as Mutable<this>).hoverSet = hoverSet;
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

  /** @internal */
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

  /** @internal */
  protected onPointerOver(event: ViewPointerEvent): void {
    let hoverSet = this.hoverSet;
    if (hoverSet === null) {
      hoverSet = {};
      (this as Mutable<this>).hoverSet = hoverSet;
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

  /** @internal */
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

  protected override onObserve(observer: ObserverType<this>): void {
    super.onObserve(observer);
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

  override init(init: GraphicsViewInit): void {
    super.init(init);
    if (init.hidden !== void 0) {
      this.setHidden(init.hidden);
    }
  }

  static override readonly UncullFlags: ViewFlags = View.UncullFlags | View.NeedsRender;
  static override readonly InsertChildFlags: ViewFlags = View.InsertChildFlags | View.NeedsRender;
  static override readonly RemoveChildFlags: ViewFlags = View.RemoveChildFlags | View.NeedsRender;
}
Object.defineProperty(GraphicsView.prototype, "renderer", {
  get(this: GraphicsView): GraphicsRenderer | null {
    const parent = this.parent;
    if (parent instanceof GraphicsView || parent instanceof CanvasView) {
      return parent.renderer;
    } else {
      return null;
    }
  },
  configurable: true,
});
Object.defineProperty(GraphicsView.prototype, "viewBounds", {
  get(this: GraphicsView): R2Box {
    return this.viewFrame;
  },
  configurable: true,
});
