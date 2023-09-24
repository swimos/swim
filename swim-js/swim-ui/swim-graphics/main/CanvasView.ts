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
import {Property} from "@swim/component";
import {EventHandler} from "@swim/component";
import {Provider} from "@swim/component";
import {R2Box} from "@swim/math";
import {Transform} from "@swim/math";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import {HtmlView} from "@swim/dom";
import type {GraphicsEvent} from "./GraphicsEvent";
import type {GraphicsMouseEventInit} from "./GraphicsEvent";
import type {GraphicsMouseEvent} from "./GraphicsEvent";
import type {GraphicsPointerEventInit} from "./GraphicsEvent";
import type {GraphicsPointerEvent} from "./GraphicsEvent";
import type {GraphicsTouchInit} from "./GraphicsEvent";
import type {GraphicsTouch} from "./GraphicsEvent";
import type {GraphicsTouchEvent} from "./GraphicsEvent";
import type {GraphicsRendererLike} from "./GraphicsRenderer";
import type {GraphicsRendererType} from "./GraphicsRenderer";
import {GraphicsRenderer} from "./GraphicsRenderer";
import {GraphicsView} from "./GraphicsView";
import {WebGLRenderer} from "./WebGLRenderer";
import {CanvasRenderer} from "./CanvasRenderer";
import {SpriteService} from "./SpriteService";

/** @internal */
export type CanvasFlags = number;

/** @public */
export interface CanvasViewObserver<V extends CanvasView = CanvasView> extends HtmlViewObserver<V> {
}

/** @public */
export class CanvasView extends HtmlView {
  constructor(node: HTMLCanvasElement) {
    super(node);
    this.viewFrame = R2Box.undefined();
    this.mouse = null;
    this.pointers = null;
    this.touches = null;

    this.style.setIntrinsic({
      position: "absolute",
      left: 0,
      top: 0,
    });
  }

  declare readonly observerType?: Class<CanvasViewObserver>;

  declare readonly node: HTMLCanvasElement;

  protected override needsUpdate(updateFlags: ViewFlags, immediate: boolean): ViewFlags {
    updateFlags = super.needsUpdate(updateFlags, immediate);
    updateFlags |= View.NeedsRender | View.NeedsComposite;
    this.setFlags(this.flags | (View.NeedsRender | View.NeedsComposite));
    return updateFlags;
  }

  protected override needsProcess(processFlags: ViewFlags): ViewFlags {
    if ((processFlags & View.ProcessMask) !== 0) {
      this.requireUpdate(View.NeedsRender | View.NeedsComposite);
    }
    return processFlags;
  }

  protected override onResize(): void {
    super.onResize();
    this.resizeCanvas(this.node);
    this.resetRenderer();
    this.requireUpdate(View.NeedsLayout | View.NeedsRender | View.NeedsComposite);
  }

  protected override onScroll(): void {
    super.onScroll();
    this.setCulled(!this.intersectsViewport());
  }

  protected override didDisplay(displayFlags: ViewFlags): void {
    this.detectHitTargets();
    super.didDisplay(displayFlags);
  }

  protected override onRender(): void {
    this.clearCanvas();
  }

  protected override needsDisplay(displayFlags: ViewFlags): ViewFlags {
    displayFlags |= View.NeedsRender | View.NeedsComposite;
    return displayFlags;
  }

  @Provider({
    serviceType: SpriteService,
    inherits: false,
    createService(): SpriteService {
      return new SpriteService();
    },
  })
  get sprites(): Provider<this, SpriteService> {
    return Provider.getter();
  }

  get pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  @Property({
    valueType: GraphicsRenderer,
    inherits: true,
    initValue(): GraphicsRenderer | null {
      return this.owner.createRenderer();
    },
    didSetValue(renderer: GraphicsRenderer | null): void {
      this.owner.resetRenderer();
    },
    fromLike(renderer: GraphicsRendererLike | null): GraphicsRenderer | null {
      if (typeof renderer === "string") {
        renderer = this.owner.createRenderer(renderer as GraphicsRendererType);
      }
      return renderer;
    },
  })
  readonly renderer!: Property<this, GraphicsRenderer | null>;

  protected createRenderer(rendererType: GraphicsRendererType = "canvas"): GraphicsRenderer | null {
    if (rendererType === "canvas") {
      const context = this.node.getContext("2d");
      if (context === null) {
        throw new Error("Failed to create canvas rendering context");
      }
      const pixelRatio = this.pixelRatio;
      const transform = Transform.affine(pixelRatio, 0, 0, pixelRatio, 0, 0);
      return new CanvasRenderer(context, transform, pixelRatio);
    } else if (rendererType === "webgl") {
      const context = this.node.getContext("webgl");
      if (context === null) {
        throw new Error("Failed to create webgl rendering context");
      }
      return new WebGLRenderer(context, this.pixelRatio);
    }
    throw new Error("Failed to create " + rendererType + " renderer");
  }

  /** @internal */
  readonly viewFrame: R2Box;

  setViewFrame(viewFrame: R2Box | null): void {
    // nop
  }

  get viewBounds(): R2Box {
    return this.viewFrame;
  }

  get hitBounds(): R2Box {
    return this.viewFrame;
  }

  cascadeHitTest(x: number, y: number): GraphicsView | null {
    if (this.hidden || this.culled || this.intangible || !this.hitBounds.contains(x, y)) {
      return null;
    }
    let hit = this.hitTestChildren(x, y);
    if (hit === null) {
      hit = this.hitTest(x, y);
    }
    return hit;
  }

  protected hitTest(x: number, y: number): GraphicsView | null {
    return null;
  }

  protected hitTestChildren(x: number, y: number): GraphicsView | null {
    let child = this.firstChild;
    while (child !== null) {
      if (child instanceof GraphicsView) {
        const hit = this.hitTestChild(child, x, y);
        if (hit !== null) {
          return hit;
        }
      }
      child = child.nextSibling;
    }
    return null;
  }

  protected hitTestChild(childView: GraphicsView, x: number, y: number): GraphicsView | null {
    return childView.cascadeHitTest(x, y);
  }

  /** @internal */
  protected detectHitTargets(clientBounds?: R2Box): void {
    if (this.mouseEvents.value) {
      const mouse = this.mouse;
      if (mouse !== null) {
        if (clientBounds === void 0) {
          clientBounds = this.clientBounds;
        }
        this.detectMouseTarget(mouse, this.clientBounds);
      }
    }
    if (this.pointerEvents.value) {
      const pointers = this.pointers;
      for (const id in pointers) {
        const pointer = pointers[id]!;
        if (clientBounds === void 0) {
          clientBounds = this.clientBounds;
        }
        this.detectPointerTarget(pointer, clientBounds);
      }
    }
  }

  setEventTarget(eventTarget: EventTarget | null): void {
    if (eventTarget === null) {
      eventTarget = this;
    }

    this.click.setTarget(eventTarget);
    this.dblclick.setTarget(eventTarget);
    this.contextmenu.setTarget(eventTarget);
    this.wheel.setTarget(eventTarget);

    this.mouseenter.setTarget(eventTarget);
    this.mouseleave.setTarget(eventTarget);
    this.mousedown.setTarget(eventTarget);

    this.pointerenter.setTarget(eventTarget);
    this.pointerleave.setTarget(eventTarget);
    this.pointerdown.setTarget(eventTarget);

    this.touchstart.setTarget(eventTarget);
    this.touchmove.setTarget(eventTarget);
    this.touchend.setTarget(eventTarget);
    this.touchcancel.setTarget(eventTarget);
  }

  @Property({
    valueType: Boolean,
    value: true,
    didSetValue(clickEvents: boolean): void {
      this.owner.click.enabled = clickEvents;
      this.owner.dblclick.enabled = clickEvents;
      this.owner.contextmenu.enabled = clickEvents;
    },
  })
  readonly clickEvents!: Property<this, boolean>;

  @Property({
    valueType: Boolean,
    value: false,
    didSetValue(wheelEvents: boolean): void {
      this.owner.wheel.enabled = wheelEvents;
    },
  })
  readonly wheelEvents!: Property<this, boolean>;

  @Property({
    valueType: Boolean,
    value: false,
    didSetValue(mouseEvents: boolean): void {
      this.owner.mouseenter.enabled = mouseEvents;
      this.owner.mouseleave.enabled = mouseEvents;
      this.owner.mousedown.enabled = mouseEvents;
    },
  })
  readonly mouseEvents!: Property<this, boolean>;

  @Property({
    valueType: Boolean,
    value: false,
    didSetValue(pointerEvents: boolean): void {
      this.owner.pointerenter.enabled = pointerEvents;
      this.owner.pointerleave.enabled = pointerEvents;
      this.owner.pointerdown.enabled = pointerEvents;
    },
  })
  readonly pointerEvents!: Property<this, boolean>;

  @Property({
    valueType: Boolean,
    value: false,
    didSetValue(touchEvents: boolean): void {
      this.owner.touchstart.enabled = touchEvents;
    },
  })
  readonly touchEvents!: Property<this, boolean>;

  /** @internal */
  handleEvent(event: GraphicsEvent): void {
    // nop
  }

  /** @internal */
  bubbleEvent(event: GraphicsEvent): View | null {
    this.handleEvent(event);
    return this;
  }

  /** @internal */
  fireEvent(event: GraphicsEvent, clientX: number, clientY: number): GraphicsView | null {
    const clientBounds = this.clientBounds;
    if (!clientBounds.contains(clientX, clientY)) {
      return null;
    }
    const x = clientX - clientBounds.x;
    const y = clientY - clientBounds.y;
    const hit = this.cascadeHitTest(x, y);
    if (hit === null) {
      return null;
    }
    event.targetView = hit;
    hit.bubbleEvent(event);
    return hit;
  }

  /** @internal */
  readonly mouse: GraphicsMouseEventInit | null;

  /** @internal */
  protected updateMouse(mouse: GraphicsMouseEventInit, event: MouseEvent): void {
    mouse.button = event.button;
    mouse.buttons = event.buttons;
    mouse.altKey = event.altKey;
    mouse.ctrlKey = event.ctrlKey;
    mouse.metaKey = event.metaKey;
    mouse.shiftKey = event.shiftKey;

    mouse.clientX = event.clientX;
    mouse.clientY = event.clientY;
    mouse.screenX = event.screenX;
    mouse.screenY = event.screenY;
    mouse.movementX = event.movementX;
    mouse.movementY = event.movementY;

    mouse.view = event.view;
    mouse.detail = event.detail;
    mouse.relatedTarget = event.relatedTarget;
  }

  /** @internal */
  protected fireMouseEvent(event: MouseEvent): GraphicsView | null {
    return this.fireEvent(event, event.clientX, event.clientY);
  }

  @EventHandler({
    eventType: "click",
    bindsOwner: true,
    enabled: false,
    init(): void {
      this.enabled = this.owner.clickEvents.value;
    },
    handle(event: MouseEvent): void {
      const mouse = this.owner.mouse;
      if (mouse !== null) {
        this.owner.updateMouse(mouse, event);
      }
      this.owner.fireMouseEvent(event);
    },
  })
  readonly click!: EventHandler<this>;

  @EventHandler({
    eventType: "dblclick",
    bindsOwner: true,
    enabled: false,
    init(): void {
      this.enabled = this.owner.clickEvents.value;
    },
    handle(event: MouseEvent): void {
      const mouse = this.owner.mouse;
      if (mouse !== null) {
        this.owner.updateMouse(mouse, event);
      }
      this.owner.fireMouseEvent(event);
    },
  })
  readonly dblclick!: EventHandler<this>;

  @EventHandler({
    eventType: "contextmenu",
    bindsOwner: true,
    enabled: false,
    init(): void {
      this.enabled = this.owner.clickEvents.value;
    },
    handle(event: MouseEvent): void {
      const mouse = this.owner.mouse;
      if (mouse !== null) {
        this.owner.updateMouse(mouse, event);
      }
      this.owner.fireMouseEvent(event);
    },
  })
  readonly contextmenu!: EventHandler<this>;

  @EventHandler({
    eventType: "wheel",
    bindsOwner: true,
    enabled: false,
    init(): void {
      this.enabled = this.owner.wheelEvents.value;
    },
    handle(event: WheelEvent): void {
      const mouse = this.owner.mouse;
      if (mouse !== null) {
        this.owner.updateMouse(mouse, event);
      }
      this.owner.fireMouseEvent(event);
    },
  })
  readonly wheel!: EventHandler<this>;

  @EventHandler({
    eventType: "mouseenter",
    bindsOwner: true,
    enabled: false,
    init(): void {
      this.enabled = this.owner.mouseEvents.value;
    },
    handle(event: MouseEvent): void {
      let mouse = this.owner.mouse;
      if (mouse === null) {
        mouse = {};
        (this.owner as Mutable<CanvasView>).mouse = mouse;
      }
      this.owner.mousemove.enabled = true;
      this.owner.updateMouse(mouse, event);
    },
  })
  readonly mouseenter!: EventHandler<this>;

  @EventHandler({
    eventType: "mouseleave",
    bindsOwner: true,
    enabled: false,
    init(): void {
      this.enabled = this.owner.mouseEvents.value;
    },
    handle(event: MouseEvent): void {
      (this.owner as Mutable<CanvasView>).mouse = null;
      this.owner.mousemove.enabled = false;
    },
  })
  readonly mouseleave!: EventHandler<this>;

  @EventHandler({
    eventType: "mousedown",
    bindsOwner: true,
    enabled: false,
    init(): void {
      this.enabled = this.owner.mouseEvents.value;
    },
    handle(event: MouseEvent): void {
      let mouse = this.owner.mouse;
      if (mouse === null) {
        mouse = {};
        (this.owner as Mutable<CanvasView>).mouse = mouse;
      }
      this.owner.mouseup.enabled = true;
      this.owner.updateMouse(mouse, event);
      this.owner.fireMouseEvent(event);
    },
  })
  readonly mousedown!: EventHandler<this>;

  @EventHandler({
    eventType: "mousemove",
    enabled: false,
    initTarget(): EventTarget | null {
      return document.body;
    },
    handle(event: MouseEvent): void {
      let mouse = this.owner.mouse;
      if (mouse === null) {
        mouse = {};
        (this.owner as Mutable<CanvasView>).mouse = mouse;
      }
      this.owner.updateMouse(mouse, event);
      let oldTargetView = mouse.targetView as GraphicsView | null | undefined;
      if (oldTargetView === void 0) {
        oldTargetView = null;
      }
      const newTargetView = this.owner.fireMouseEvent(event);
      if (newTargetView !== oldTargetView) {
        this.owner.onMouseTargetChange(mouse, newTargetView, oldTargetView);
      }
    },
    didUnmount(): void {
      this.enabled = false;
      super.didUnmount();
    },
  })
  readonly mousemove!: EventHandler<this>;

  @EventHandler({
    eventType: "mouseup",
    enabled: false,
    initTarget(): EventTarget | null {
      return document.body;
    },
    handle(event: MouseEvent): void {
      const mouse = this.owner.mouse;
      if (mouse !== null) {
        this.owner.updateMouse(mouse, event);
      }
      this.owner.fireMouseEvent(event);
      this.owner.mouseup.enabled = false;
    },
    didUnmount(): void {
      this.enabled = false;
      super.didUnmount();
    },
  })
  readonly mouseup!: EventHandler<this>;

  /** @internal */
  protected onMouseTargetChange(mouse: GraphicsMouseEventInit, newTargetView: GraphicsView | null,
                                oldTargetView: GraphicsView | null): void {
    mouse.bubbles = true;
    let commonAncestorView: GraphicsView | null = null;
    if (oldTargetView !== null && newTargetView !== null) {
      commonAncestorView = oldTargetView.commonAncestor(newTargetView) as GraphicsView | null;
    }
    if (oldTargetView !== null) {
      const outEvent = new MouseEvent("mouseout", mouse) as GraphicsMouseEvent;
      outEvent.targetView = oldTargetView;
      outEvent.relatedTargetView = newTargetView;
      oldTargetView.bubbleEvent(outEvent);
      let leaveView: GraphicsView | null = oldTargetView;
      do {
        const leaveEvent = new MouseEvent("mouseleave", {
          bubbles: false,
          ...mouse,
        }) as GraphicsMouseEvent;
        leaveEvent.targetView = leaveView;
        leaveEvent.relatedTargetView = newTargetView;
        leaveView.handleEvent(leaveEvent);
        leaveView = leaveView.parent as GraphicsView | null;
      } while (leaveView instanceof GraphicsView && leaveView !== commonAncestorView);
    }
    mouse.targetView = newTargetView !== null ? newTargetView : void 0;
    if (newTargetView !== null) {
      const overEvent = new MouseEvent("mouseover", mouse) as GraphicsMouseEvent;
      overEvent.targetView = newTargetView;
      overEvent.relatedTargetView = oldTargetView;
      newTargetView.bubbleEvent(overEvent);
      let enterView: GraphicsView | null = newTargetView;
      do {
        const enterEvent = new MouseEvent("mouseenter", {
          bubbles: false,
          ...mouse,
        }) as GraphicsMouseEvent;
        enterEvent.targetView = enterView;
        enterEvent.relatedTargetView = oldTargetView;
        enterView.handleEvent(enterEvent);
        enterView = enterView.parent as GraphicsView | null;
      } while (enterView instanceof GraphicsView && enterView !== commonAncestorView);
    }
  }

  /** @internal */
  protected detectMouseTarget(mouse: GraphicsMouseEventInit, clientBounds: R2Box): void {
    const clientX = mouse.clientX!;
    const clientY = mouse.clientY!;
    if (clientBounds.contains(clientX, clientY)) {
      const x = clientX - clientBounds.x;
      const y = clientY - clientBounds.y;
      let oldTargetView = mouse.targetView as GraphicsView | null | undefined;
      if (oldTargetView === void 0) {
        oldTargetView = null;
      }
      const newTargetView = this.cascadeHitTest(x, y);
      if (newTargetView !== oldTargetView) {
        this.onMouseTargetChange(mouse, newTargetView, oldTargetView);
      }
    }
  }

  /** @internal */
  readonly pointers: {[id: string]: GraphicsPointerEventInit | undefined} | null;

  /** @internal */
  protected updatePointer(pointer: GraphicsPointerEventInit, event: PointerEvent): void {
    pointer.pointerId = event.pointerId;
    pointer.pointerType = event.pointerType;
    pointer.isPrimary = event.isPrimary;

    pointer.button = event.button;
    pointer.buttons = event.buttons;
    pointer.altKey = event.altKey;
    pointer.ctrlKey = event.ctrlKey;
    pointer.metaKey = event.metaKey;
    pointer.shiftKey = event.shiftKey;

    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
    pointer.screenX = event.screenX;
    pointer.screenY = event.screenY;
    pointer.movementX = event.movementX;
    pointer.movementY = event.movementY;

    pointer.width = event.width;
    pointer.height = event.height;
    pointer.tiltX = event.tiltX;
    pointer.tiltY = event.tiltY;
    pointer.twist = event.twist;
    pointer.pressure = event.pressure;
    pointer.tangentialPressure = event.tangentialPressure;

    pointer.view = event.view;
    pointer.detail = event.detail;
    pointer.relatedTarget = event.relatedTarget;
  }

  /** @internal */
  protected firePointerEvent(event: PointerEvent): GraphicsView | null {
    return this.fireEvent(event, event.clientX, event.clientY);
  }

  @EventHandler({
    eventType: "pointerenter",
    bindsOwner: true,
    enabled: false,
    init(): void {
      this.enabled = this.owner.pointerEvents.value;
    },
    handle(event: PointerEvent): void {
      const id = "" + event.pointerId;
      let pointers = this.owner.pointers;
      if (pointers === null) {
        pointers = {};
        (this.owner as Mutable<CanvasView>).pointers = pointers;
      }
      let pointer = pointers[id];
      if (pointer === void 0) {
        pointer = {};
        pointers[id] = pointer;
      }
      this.owner.pointermove.enabled = true;
      this.owner.pointerup.enabled = true;
      this.owner.pointercancel.enabled = true;
      this.owner.updatePointer(pointer, event);
    },
  })
  readonly pointerenter!: EventHandler<this>;

  @EventHandler({
    eventType: "pointerleave",
    bindsOwner: true,
    enabled: false,
    init(): void {
      this.enabled = this.owner.pointerEvents.value;
    },
    handle(event: PointerEvent): void {
      const id = "" + event.pointerId;
      let pointers = this.owner.pointers;
      if (pointers === null) {
        pointers = {};
        (this.owner as Mutable<CanvasView>).pointers = pointers;
      }
      const pointer = pointers[id];
      if (pointer !== void 0) {
        if (pointer.targetView !== void 0) {
          this.owner.onPointerTargetChange(pointer, null, pointer.targetView as GraphicsView);
        }
        delete pointers[id];
        if (Object.keys(pointers).length === 0) {
          this.owner.pointermove.enabled = false;
          this.owner.pointerup.enabled = false;
          this.owner.pointercancel.enabled = false;
        }
      }
    },
  })
  readonly pointerleave!: EventHandler<this>;

  @EventHandler({
    eventType: "pointerdown",
    bindsOwner: true,
    enabled: false,
    init(): void {
      this.enabled = this.owner.pointerEvents.value;
    },
    handle(event: PointerEvent): void {
      const id = "" + event.pointerId;
      let pointers = this.owner.pointers;
      if (pointers === null) {
        pointers = {};
        (this.owner as Mutable<CanvasView>).pointers = pointers;
      }
      let pointer = pointers[id];
      if (pointer === void 0) {
        pointer = {};
        pointers[id] = pointer;
      }
      this.owner.pointermove.enabled = true;
      this.owner.pointerup.enabled = true;
      this.owner.pointercancel.enabled = true;
      this.owner.updatePointer(pointer, event);
      this.owner.firePointerEvent(event);
    },
  })
  readonly pointerdown!: EventHandler<this>;

  @EventHandler({
    eventType: "pointermove",
    enabled: false,
    initTarget(): EventTarget | null {
      return document.body;
    },
    handle(event: PointerEvent): void {
      const id = "" + event.pointerId;
      let pointers = this.owner.pointers;
      if (pointers === null) {
        pointers = {};
        (this.owner as Mutable<CanvasView>).pointers = pointers;
      }
      let pointer = pointers[id];
      if (pointer === void 0) {
        pointer = {};
        pointers[id] = pointer;
      }
      this.owner.pointermove.enabled = true;
      this.owner.pointerup.enabled = true;
      this.owner.pointercancel.enabled = true;
      this.owner.updatePointer(pointer, event);
      let oldTargetView = pointer.targetView as GraphicsView | null | undefined;
      if (oldTargetView === void 0) {
        oldTargetView = null;
      }
      const newTargetView = this.owner.firePointerEvent(event);
      if (newTargetView !== oldTargetView) {
        this.owner.onPointerTargetChange(pointer, newTargetView, oldTargetView);
      }
    },
    didUnmount(): void {
      this.enabled = false;
      super.didUnmount();
    },
  })
  readonly pointermove!: EventHandler<this>;

  @EventHandler({
    eventType: "pointerup",
    enabled: false,
    initTarget(): EventTarget | null {
      return document.body;
    },
    handle(event: PointerEvent): void {
      const id = "" + event.pointerId;
      let pointers = this.owner.pointers;
      if (pointers === null) {
        pointers = {};
        (this.owner as Mutable<CanvasView>).pointers = pointers;
      }
      const pointer = pointers[id];
      if (pointer !== void 0) {
        this.owner.updatePointer(pointer, event);
      }
      this.owner.firePointerEvent(event);
      if (pointer !== void 0 && event.pointerType !== "mouse") {
        if (pointer.targetView !== void 0) {
          this.owner.onPointerTargetChange(pointer, null, pointer.targetView as GraphicsView);
        }
        delete pointers[id];
        if (Object.keys(pointers).length === 0) {
          this.owner.pointermove.enabled = false;
          this.owner.pointerup.enabled = false;
          this.owner.pointercancel.enabled = false;
        }
      }
    },
    didUnmount(): void {
      this.enabled = false;
      super.didUnmount();
    },
  })
  readonly pointerup!: EventHandler<this>;

  @EventHandler({
    eventType: "pointercancel",
    enabled: false,
    initTarget(): EventTarget | null {
      return document.body;
    },
    handle(event: PointerEvent): void {
      const id = "" + event.pointerId;
      let pointers = this.owner.pointers;
      if (pointers === null) {
        pointers = {};
        (this.owner as Mutable<CanvasView>).pointers = pointers;
      }
      const pointer = pointers[id];
      if (pointer !== void 0) {
        this.owner.updatePointer(pointer, event);
      }
      this.owner.firePointerEvent(event);
      if (pointer !== void 0 && event.pointerType !== "mouse") {
        if (pointer.targetView !== void 0) {
          this.owner.onPointerTargetChange(pointer, null, pointer.targetView as GraphicsView);
        }
        delete pointers[id];
        if (Object.keys(pointers).length === 0) {
          this.owner.pointermove.enabled = false;
          this.owner.pointerup.enabled = false;
          this.owner.pointercancel.enabled = false;
        }
      }
    },
    didUnmount(): void {
      this.enabled = false;
      super.didUnmount();
    },
  })
  readonly pointercancel!: EventHandler<this>;

  /** @internal */
  protected onPointerTargetChange(pointer: GraphicsPointerEventInit, newTargetView: GraphicsView | null,
                                  oldTargetView: GraphicsView | null): void {
    pointer.bubbles = true;
    let commonAncestorView: GraphicsView | null = null;
    if (oldTargetView !== null && newTargetView !== null) {
      commonAncestorView = oldTargetView.commonAncestor(newTargetView) as GraphicsView | null;
    }
    if (oldTargetView !== null) {
      const outEvent = new PointerEvent("pointerout", pointer) as GraphicsPointerEvent;
      outEvent.targetView = oldTargetView;
      outEvent.relatedTargetView = newTargetView;
      oldTargetView.bubbleEvent(outEvent);
      let leaveView: GraphicsView | null = oldTargetView;
      do {
        const leaveEvent = new PointerEvent("pointerleave", {
          bubbles: false,
          ...pointer,
        }) as GraphicsPointerEvent;
        leaveEvent.targetView = leaveView;
        leaveEvent.relatedTargetView = newTargetView;
        leaveView.handleEvent(leaveEvent);
        leaveView = leaveView.parent as GraphicsView | null;
      } while (leaveView instanceof GraphicsView && leaveView !== commonAncestorView);
    }
    pointer.targetView = newTargetView !== null ? newTargetView : void 0;
    if (newTargetView !== null) {
      const overEvent = new PointerEvent("pointerover", pointer) as GraphicsPointerEvent;
      overEvent.targetView = newTargetView;
      overEvent.relatedTargetView = oldTargetView;
      newTargetView.bubbleEvent(overEvent);
      let enterView: GraphicsView | null = newTargetView;
      do {
        const enterEvent = new PointerEvent("pointerenter", {
          bubbles: false,
          ...pointer,
        }) as GraphicsPointerEvent;
        enterEvent.targetView = enterView;
        enterEvent.relatedTargetView = oldTargetView;
        enterView.handleEvent(enterEvent);
        enterView = enterView.parent as GraphicsView | null;
      } while (enterView instanceof GraphicsView && enterView !== commonAncestorView);
    }
  }

  /** @internal */
  protected detectPointerTarget(pointer: GraphicsPointerEventInit, clientBounds: R2Box): void {
    const clientX = pointer.clientX!;
    const clientY = pointer.clientY!;
    if (clientBounds.contains(clientX, clientY)) {
      const x = clientX - clientBounds.x;
      const y = clientY - clientBounds.y;
      let oldTargetView = pointer.targetView as GraphicsView | null | undefined;
      if (oldTargetView === void 0) {
        oldTargetView = null;
      }
      const newTargetView = this.cascadeHitTest(x, y);
      if (newTargetView !== oldTargetView) {
        this.onPointerTargetChange(pointer, newTargetView, oldTargetView);
      }
    }
  }

  /** @internal */
  readonly touches: {[id: string]: GraphicsTouchInit | undefined} | null;

  /** @internal */
  protected updateTouch(touch: GraphicsTouchInit, event: Touch): void {
    touch.clientX = event.clientX;
    touch.clientY = event.clientY;
    touch.screenX = event.screenX;
    touch.screenY = event.screenY;
    touch.pageX = event.pageX;
    touch.pageY = event.pageY;

    touch.radiusX = event.radiusX;
    touch.radiusY = event.radiusY;
    touch.rotationAngle = event.rotationAngle;
    touch.force = event.force;
  }

  /** @internal */
  protected fireTouchEvent(type: string, originalEvent: TouchEvent): void {
    const changedTouches = originalEvent.changedTouches;
    const dispatched: GraphicsView[] = [];
    for (let i = 0; i < changedTouches.length; i += 1) {
      const changedTouch = changedTouches[i]! as GraphicsTouch;
      const targetView = changedTouch.targetView as GraphicsView | undefined;
      if (targetView !== void 0 && dispatched.indexOf(targetView) < 0) {
        const startEvent: GraphicsTouchEvent = new TouchEvent(type, {
          changedTouches: changedTouches as unknown as Touch[],
          targetTouches: originalEvent.targetTouches as unknown as Touch[],
          touches: originalEvent.touches as unknown as Touch[],
          bubbles: true,
        });
        startEvent.targetView = targetView;
        const targetViewTouches: Touch[] = [changedTouch];
        for (let j = i + 1; j < changedTouches.length; j += 1) {
          const nextTouch = changedTouches[j]! as GraphicsTouch;
          if (nextTouch.targetView === targetView) {
            targetViewTouches.push(nextTouch);
          }
        }

        const touchDocument = document as Document & {createTouchList?(...touches: Touch[]): TouchList};
        if (touchDocument.createTouchList !== void 0) {
          startEvent.targetViewTouches = touchDocument.createTouchList(...targetViewTouches);
        } else {
          (targetViewTouches as unknown as TouchList).item = function (index: number): Touch {
            return targetViewTouches[index]!;
          };
          startEvent.targetViewTouches = targetViewTouches as unknown as TouchList;
        }
        targetView.bubbleEvent(startEvent);
        dispatched.push(targetView);
      }
    }
  }

  @EventHandler({
    eventType: "touchstart",
    bindsOwner: true,
    enabled: false,
    init(): void {
      this.enabled = this.owner.touchEvents.value;
    },
    handle(event: TouchEvent): void {
      let clientBounds: R2Box | undefined;
      let touches = this.owner.touches;
      if (touches === null) {
        touches = {};
        (this.owner as Mutable<CanvasView>).touches = touches;
      }
      const changedTouches = event.changedTouches;
      for (let i = 0; i < changedTouches.length; i += 1) {
        const changedTouch = changedTouches[i] as GraphicsTouch;
        const id = "" + changedTouch.identifier;
        let touch = touches[id];
        if (touch === void 0) {
          touch = {
            identifier: changedTouch.identifier,
            target: changedTouch.target,
          };
          touches[id] = touch;
        }
        this.owner.touchmove.enabled = true;
        this.owner.touchend.enabled = true;
        this.owner.touchcancel.enabled = true;
        this.owner.updateTouch(touch, changedTouch);
        const clientX = touch.clientX!;
        const clientY = touch.clientY!;
        if (clientBounds === void 0) {
          clientBounds = this.owner.clientBounds;
        }
        if (clientBounds.contains(clientX, clientY)) {
          const x = clientX - clientBounds.x;
          const y = clientY - clientBounds.y;
          const hit = this.owner.cascadeHitTest(x, y);
          if (hit !== null) {
            touch.targetView = hit;
            changedTouch.targetView = hit;
          }
        }
      }
      this.owner.fireTouchEvent("touchstart", event);
    },
  })
  readonly touchstart!: EventHandler<this>;

  @EventHandler({
    eventType: "touchmove",
    bindsOwner: true,
    enabled: false,
    handle(event: TouchEvent): void {
      let touches = this.owner.touches;
      if (touches === null) {
        touches = {};
        (this.owner as Mutable<CanvasView>).touches = touches;
      }
      const changedTouches = event.changedTouches;
      for (let i = 0; i < changedTouches.length; i += 1) {
        const changedTouch = changedTouches[i] as GraphicsTouch;
        const id = "" + changedTouch.identifier;
        let touch = touches[id];
        if (touch === void 0) {
          touch = {
            identifier: changedTouch.identifier,
            target: changedTouch.target,
          };
          touches[id] = touch;
        }
        this.owner.updateTouch(touch, changedTouch);
        changedTouch.targetView = touch.targetView;
      }
      this.owner.fireTouchEvent("touchmove", event);
    },
    didUnmount(): void {
      this.enabled = false;
      super.didUnmount();
    },
  })
  readonly touchmove!: EventHandler<this>;

  @EventHandler({
    eventType: "touchend",
    bindsOwner: true,
    enabled: false,
    handle(event: TouchEvent): void {
      let touches = this.owner.touches;
      if (touches === null) {
        touches = {};
        (this.owner as Mutable<CanvasView>).touches = touches;
      }
      const changedTouches = event.changedTouches;
      for (let i = 0; i < changedTouches.length; i += 1) {
        const changedTouch = changedTouches[i] as GraphicsTouch;
        const id = "" + changedTouch.identifier;
        let touch = touches[id];
        if (touch === void 0) {
          touch = {
            identifier: changedTouch.identifier,
            target: changedTouch.target,
          };
          touches[id] = touch;
        }
        this.owner.updateTouch(touch, changedTouch);
        changedTouch.targetView = touch.targetView;
      }
      this.owner.fireTouchEvent("touchend", event);
      for (let i = 0; i < changedTouches.length; i += 1) {
        const changedTouch = changedTouches[i] as GraphicsTouch;
        const id = "" + changedTouch.identifier;
        delete touches[id];
        if (Object.keys(touches).length === 0) {
          this.owner.touchmove.enabled = false;
          this.owner.touchend.enabled = false;
          this.owner.touchcancel.enabled = false;
        }
      }
    },
    didUnmount(): void {
      this.enabled = false;
      super.didUnmount();
    },
  })
  readonly touchend!: EventHandler<this>;

  @EventHandler({
    eventType: "touchcancel",
    bindsOwner: true,
    enabled: false,
    handle(event: TouchEvent): void {
      let touches = this.owner.touches;
      if (touches === null) {
        touches = {};
        (this.owner as Mutable<CanvasView>).touches = touches;
      }
      const changedTouches = event.changedTouches;
      for (let i = 0; i < changedTouches.length; i += 1) {
        const changedTouch = changedTouches[i] as GraphicsTouch;
        const id = "" + changedTouch.identifier;
        let touch = touches[id];
        if (touch === void 0) {
          touch = {
            identifier: changedTouch.identifier,
            target: changedTouch.target,
          };
          touches[id] = touch;
        }
        this.owner.updateTouch(touch, changedTouch);
        changedTouch.targetView = touch.targetView;
      }
      this.owner.fireTouchEvent("touchcancel", event);
      for (let i = 0; i < changedTouches.length; i += 1) {
        const changedTouch = changedTouches[i] as GraphicsTouch;
        const id = "" + changedTouch.identifier;
        delete touches[id];
        if (Object.keys(touches).length === 0) {
          this.owner.touchmove.enabled = false;
          this.owner.touchend.enabled = false;
          this.owner.touchcancel.enabled = false;
        }
      }
    },
    didUnmount(): void {
      this.enabled = false;
      super.didUnmount();
    },
  })
  readonly touchcancel!: EventHandler<this>;

  protected resizeCanvas(canvas: HTMLCanvasElement): void {
    let width: number;
    let height: number;
    let pixelRatio: number;
    let parentNode = canvas.parentNode;
    if (parentNode instanceof HTMLElement) {
      do {
        width = Math.floor(parentNode.offsetWidth);
        height = Math.floor(parentNode.offsetHeight);
        if (width !== 0 && height !== 0) {
          break;
        } else if ((width === 0 || height === 0) && HtmlView.isPositioned(parentNode)) {
          this.requireUpdate(View.NeedsResize); // view might not yet have been laid out
        }
        parentNode = parentNode.parentNode;
      } while (parentNode instanceof HTMLElement);
      pixelRatio = this.pixelRatio;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    } else {
      width = Math.floor(canvas.width);
      height = Math.floor(canvas.height);
      pixelRatio = 1;
    }
    (this as Mutable<this>).viewFrame = new R2Box(0, 0, width, height);
  }

  clearCanvas(): void {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      const frame = this.viewFrame;
      renderer.context.clearRect(0, 0, frame.width, frame.height);
    } else if (renderer instanceof WebGLRenderer) {
      const context = renderer.context;
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    }
  }

  resetRenderer(): void {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      const pixelRatio = this.pixelRatio;
      renderer.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    } else if (renderer instanceof WebGLRenderer) {
      const frame = this.viewFrame;
      renderer.context.viewport(0, 0, frame.width, frame.height);
    }
  }

  /** @internal */
  static override readonly tag: string = "canvas";

  static override readonly UncullFlags: ViewFlags = HtmlView.UncullFlags | View.NeedsRender | View.NeedsComposite;
  static override readonly UnhideFlags: ViewFlags = HtmlView.UnhideFlags | View.NeedsRender | View.NeedsComposite;
}
