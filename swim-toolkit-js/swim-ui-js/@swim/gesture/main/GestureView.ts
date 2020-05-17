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

import {View, HtmlView} from "@swim/view";
import {GestureViewObserver} from "./GestureViewObserver";
import {GestureViewController} from "./GestureViewController";

export type GestureViewPointerType = "mouse" | "touch" | "pen" | "unknown";

export class GestureViewHover {
  readonly id: string;
  readonly pointerType: GestureViewPointerType;
  t0: number;
  view?: View;

  constructor(id: string, pointerType: GestureViewPointerType) {
    this.id = id;
    this.pointerType = pointerType;
    this.t0 = performance.now();
    this.view = void 0;
  }
}

export class GestureViewTrack {
  readonly id: string;
  readonly pointerType: GestureViewPointerType;
  defaultPrevented: boolean;
  holdTimer: number;
  holdDelay: number;
  buttons: number;
  x0: number;
  y0: number;
  t0: number;
  dx: number;
  dy: number;
  dt: number;
  x: number;
  y: number;
  t: number;
  view?: View;

  constructor(id: string, pointerType: GestureViewPointerType,
              buttons: number, x: number, y: number) {
    this.id = id;
    this.pointerType = pointerType;
    this.defaultPrevented = false;
    this.holdTimer = 0;
    this.holdDelay = 400;
    this.buttons = buttons;
    this.x0 = x;
    this.y0 = y;
    this.t0 = performance.now();
    this.dx = 0;
    this.dy = 0;
    this.dt = 0;
    this.x = x;
    this.y = y;
    this.t = this.t0;
    this.view = void 0;
  }

  preventDefault(): void {
    this.defaultPrevented = true;
  }

  setHoldTimer(f: () => void): void {
    if (this.holdDelay !== 0) {
      this.clearHoldTimer();
      this.holdTimer = setTimeout(f, this.holdDelay) as any;
    }
  }

  clearHoldTimer(): void {
    if (this.holdTimer !== 0) {
      clearTimeout(this.holdTimer);
      this.holdTimer = 0;
    }
  }
}

/** @hidden */
export class BaseGestureView extends HtmlView {
  /** @hidden */
  _hovers: {[id: string]: GestureViewHover | undefined};
  /** @hidden */
  _hoverCount: number;
  /** @hidden */
  _tracks: {[id: string]: GestureViewTrack | undefined};
  /** @hidden */
  _trackCount: number;

  constructor(node: HTMLElement) {
    super(node);
    this._hovers = {};
    this._hoverCount = 0;
    this._tracks = {};
    this._trackCount = 0;
  }

  get viewController(): GestureViewController | null {
    return this._viewController;
  }

  get hovers(): {readonly [id: string]: GestureViewHover | undefined} {
    return this._hovers;
  }

  get tracks(): {readonly [id: string]: GestureViewTrack | undefined} {
    return this._tracks;
  }

  activate(event: Event | null): void {
    this.willActivate(event);
    this.onActivate(event);
    this.didActivate(event);
  }

  protected willActivate(event: Event | null): void {
    this.willObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewWillActivate !== void 0) {
        viewObserver.viewWillActivate(event, this);
      }
    });
  }

  protected onActivate(event: Event | null): void {
    // hook
  }

  protected didActivate(event: Event | null): void {
    this.didObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewDidActivate !== void 0) {
        viewObserver.viewDidActivate(event, this);
      }
    });
  }

  protected onMount(): void {
    super.onMount();
    this.attachNode(this._node);
  }

  protected onUnmount(): void {
    this._hovers = {};
    this._hoverCount = 0;
    this._tracks = {};
    this._trackCount = 0;
    this.detachNode(this._node);
    super.onUnmount();
  }

  protected attachNode(node: Node): void {
    // hook
  }

  protected detachNode(node: Node): void {
    // hook
  }

  protected startHovering(): void {
    this.willStartHovering();
    this.onStartHovering();
    this.didStartHovering();
  }

  protected willStartHovering(): void {
    this.willObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewWillStartHovering !== void 0) {
        viewObserver.viewWillStartHovering(this);
      }
    });
  }

  protected onStartHovering(): void {
    // hook
  }

  protected didStartHovering(): void {
    this.didObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewDidStartHovering !== void 0) {
        viewObserver.viewDidStartHovering(this);
      }
    });
  }

  protected stopHovering(): void {
    this.willStopHovering();
    this.onStopHovering();
    this.didStopHovering();
  }

  protected willStopHovering(): void {
    this.willObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewWillStopHovering !== void 0) {
        viewObserver.viewWillStopHovering(this);
      }
    });
  }

  protected onStopHovering(): void {
    // hook
  }

  protected didStopHovering(): void {
    this.didObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewDidStopHovering !== void 0) {
        viewObserver.viewDidStopHovering(this);
      }
    });
  }

  protected createHover(id: string, pointerType: GestureViewPointerType): GestureViewHover {
    return new GestureViewHover(id, pointerType);
  }

  beginHover(id: string, pointerType: GestureViewPointerType, event: Event | null): GestureViewHover {
    let hover = this._hovers[id];
    if (hover === void 0) {
      hover = this.createHover(id, pointerType);
      this.willBeginHover(hover, event);
      this._hovers[id] = hover;
      this.onBeginHover(hover, event);
      this._hoverCount += 1;
      if (this._hoverCount === 1) {
        this.startHovering();
      }
      this.didBeginHover(hover, event);
    }
    return hover;
  }

  protected willBeginHover(hover: GestureViewHover, event: Event | null): void {
    this.willObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewWillBeginHover !== void 0) {
        viewObserver.viewWillBeginHover(hover, event, this);
      }
    });
  }

  protected onBeginHover(hover: GestureViewHover, event: Event | null): void {
    // hook
  }

  protected didBeginHover(hover: GestureViewHover, event: Event | null): void {
    this.didObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewDidBeginHover !== void 0) {
        viewObserver.viewDidBeginHover(hover, event, this);
      }
    });
  }

  endHover(id: string, event: Event | null): GestureViewHover | null {
    const hover = this._hovers[id];
    if (hover !== void 0) {
      this.willEndHover(hover, event);
      delete this._hovers[id];
      this._hoverCount -= 1;
      this.onEndHover(hover, event);
      if (this._hoverCount === 0) {
        this.stopHovering();
      }
      this.didEndHover(hover, event);
      return hover;
    } else {
      return null;
    }
  }

  protected willEndHover(hover: GestureViewHover, event: Event | null): void {
    this.willObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewWillEndHover !== void 0) {
        viewObserver.viewWillEndHover(hover, event, this);
      }
    });
  }

  protected onEndHover(hover: GestureViewHover, event: Event | null): void {
    // hook
  }

  protected didEndHover(hover: GestureViewHover, event: Event | null): void {
    this.didObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewDidEndHover !== void 0) {
        viewObserver.viewDidEndHover(hover, event, this);
      }
    });
  }

  protected startTracking(): void {
    this.willStartTracking();
    this.onStartTracking();
    this.didStartTracking();
  }

  protected willStartTracking(): void {
    this.willObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewWillStartTracking !== void 0) {
        viewObserver.viewWillStartTracking(this);
      }
    });
  }

  protected onStartTracking(): void {
    // hook
  }

  protected didStartTracking(): void {
    this.didObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewDidStartTracking !== void 0) {
        viewObserver.viewDidStartTracking(this);
      }
    });
  }

  protected stopTracking(): void {
    this.willStopTracking();
    this.onStopTracking();
    this.didStopTracking();
  }

  protected willStopTracking(): void {
    this.willObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewWillStopTracking !== void 0) {
        viewObserver.viewWillStopTracking(this);
      }
    });
  }

  protected onStopTracking(): void {
    // hook
  }

  protected didStopTracking(): void {
    this.didObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewDidStopTracking !== void 0) {
        viewObserver.viewDidStopTracking(this);
      }
    });
  }

  protected createTrack(id: string, pointerType: GestureViewPointerType, buttons: number,
                        clientX: number, clientY: number): GestureViewTrack {
    return new GestureViewTrack(id, pointerType, buttons, clientX, clientY);
  }

  beginTrack(id: string, pointerType: GestureViewPointerType, buttons: number,
             clientX: number, clientY: number, event: Event | null): GestureViewTrack {
    let track = this._tracks[id];
    if (track === void 0) {
      track = this.createTrack(id, pointerType, buttons, clientX, clientY);
      this.willBeginTrack(track, event);
      this._tracks[id] = track;
      this.onBeginTrack(track, event);
      this._trackCount += 1;
      track.setHoldTimer(this.holdTrack.bind(this, id));
      if (this._trackCount === 1) {
        this.startTracking();
      }
      this.didBeginTrack(track, event);
    }
    return track;
  }

  protected willBeginTrack(track: GestureViewTrack, event: Event | null): void {
    this.willObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewWillBeginTrack !== void 0) {
        viewObserver.viewWillBeginTrack(track, event, this);
      }
    });
  }

  protected onBeginTrack(track: GestureViewTrack, event: Event | null): void {
    // hook
  }

  protected didBeginTrack(track: GestureViewTrack, event: Event | null): void {
    this.didObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewDidBeginTrack !== void 0) {
        viewObserver.viewDidBeginTrack(track, event, this);
      }
    });
  }

  holdTrack(id: string): GestureViewTrack | null {
    const track = this._tracks[id];
    if (track !== void 0) {
      const t = performance.now();
      this.willHoldTrack(track);
      track.dt = t - track.t0;
      track.t = t;
      this.onHoldTrack(track);
      this.didHoldTrack(track);
      return track;
    } else {
      return null;
    }
  }

  protected willHoldTrack(track: GestureViewTrack): void {
    this.willObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewWillHoldTrack !== void 0) {
        viewObserver.viewWillHoldTrack(track, this);
      }
    });
  }

  protected onHoldTrack(track: GestureViewTrack): void {
    // hook
  }

  protected didHoldTrack(track: GestureViewTrack): void {
    this.didObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewDidHoldTrack !== void 0) {
        viewObserver.viewDidHoldTrack(track, this);
      }
    });
  }

  moveTrack(id: string, clientX: number, clientY: number,
            event: Event | null): GestureViewTrack | null {
    const track = this._tracks[id];
    if (track !== void 0) {
      const t = performance.now();
      this.willMoveTrack(track, event);
      track.dx = clientX - track.x0;
      track.dy = clientY - track.y0;
      track.dt = t - track.t0;
      track.x = clientX;
      track.y = clientY;
      track.t = t;
      this.onMoveTrack(track, event);
      this.didMoveTrack(track, event);
      return track;
    } else {
      return null;
    }
  }

  protected willMoveTrack(track: GestureViewTrack, event: Event | null): void {
    this.willObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewWillMoveTrack !== void 0) {
        viewObserver.viewWillMoveTrack(track, event, this);
      }
    });
  }

  protected onMoveTrack(track: GestureViewTrack, event: Event | null): void {
    if (track.pointerType !== "mouse" && track.dt < 100 &&
        track.dx * track.dx + track.dy * track.dy > 10 * 10) {
      this.cancelTrack(track.id, track.x, track.y, event);
    }
  }

  protected didMoveTrack(track: GestureViewTrack, event: Event | null): void {
    this.didObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewDidMoveTrack !== void 0) {
        viewObserver.viewDidMoveTrack(track, event, this);
      }
    });
  }

  endTrack(id: string, clientX: number, clientY: number,
           event: Event | null): GestureViewTrack | null {
    const track = this._tracks[id];
    if (track !== void 0) {
      this.willEndTrack(track, event);
      delete this._tracks[id];
      this._trackCount -= 1;
      this.onEndTrack(track, event);
      track.clearHoldTimer();
      if (this._trackCount === 0) {
        this.stopTracking();
      }
      this.didEndTrack(track, event);
      return track;
    } else {
      return null;
    }
  }

  protected willEndTrack(track: GestureViewTrack, event: Event | null): void {
    this.willObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewWillEndTrack !== void 0) {
        viewObserver.viewWillEndTrack(track, event, this);
      }
    });
  }

  protected onEndTrack(track: GestureViewTrack, event: Event | null): void {
    // hook
  }

  protected didEndTrack(track: GestureViewTrack, event: Event | null): void {
    this.didObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewDidEndTrack !== void 0) {
        viewObserver.viewDidEndTrack(track, event, this);
      }
    });
  }

  cancelTrack(id: string, clientX: number, clientY: number,
              event: Event | null): GestureViewTrack | null {
    const track = this._tracks[id];
    if (track !== void 0) {
      this.willCancelTrack(track, event);
      delete this._tracks[id];
      this._trackCount -= 1;
      this.onCancelTrack(track, event);
      track.clearHoldTimer();
      if (this._trackCount === 0) {
        this.stopTracking();
      }
      this.didCancelTrack(track, event);
      return track;
    } else {
      return null;
    }
  }

  protected willCancelTrack(track: GestureViewTrack, event: Event | null): void {
    this.willObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewWillCancelTrack !== void 0) {
        viewObserver.viewWillCancelTrack(track, event, this);
      }
    });
  }

  protected onCancelTrack(track: GestureViewTrack, event: Event | null): void {
    // hook
  }

  protected didCancelTrack(track: GestureViewTrack, event: Event | null): void {
    this.didObserve(function (viewObserver: GestureViewObserver): void {
      if (viewObserver.viewDidCancelTrack !== void 0) {
        viewObserver.viewDidCancelTrack(track, event, this);
      }
    });
  }
}

/** @hidden */
export class PointerGestureView extends BaseGestureView {
  constructor(node: HTMLElement) {
    super(node);
    this.onPointerEnter = this.onPointerEnter.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerCancel = this.onPointerCancel.bind(this);
    this.onDocumentLeave = this.onDocumentLeave.bind(this);
  }

  protected attachNode(node: Node): void {
    node.addEventListener("pointerenter", this.onPointerEnter);
    node.addEventListener("pointerleave", this.onPointerLeave);
    node.addEventListener("pointerdown", this.onPointerDown, {passive: true});
  }

  protected detachNode(node: Node): void {
    node.removeEventListener("pointerenter", this.onPointerEnter);
    node.removeEventListener("pointerleave", this.onPointerLeave);
    node.removeEventListener("pointerdown", this.onPointerDown);
    document.body.removeEventListener("pointermove", this.onPointerMove);
    document.body.removeEventListener("pointerup", this.onPointerUp);
    document.body.removeEventListener("pointercancel", this.onPointerCancel);
    document.body.removeEventListener("pointerleave", this.onDocumentLeave);
  }

  protected onStartTracking(): void {
    document.body.addEventListener("pointermove", this.onPointerMove);
    document.body.addEventListener("pointerup", this.onPointerUp);
    document.body.addEventListener("pointercancel", this.onPointerCancel);
    document.body.addEventListener("pointerleave", this.onDocumentLeave);
  }

  protected onStopTracking(): void {
    document.body.removeEventListener("pointermove", this.onPointerMove);
    document.body.removeEventListener("pointerup", this.onPointerUp);
    document.body.removeEventListener("pointercancel", this.onPointerCancel);
    document.body.removeEventListener("pointerleave", this.onDocumentLeave);
  }

  protected onPointerEnter(event: PointerEvent): void {
    if (event.pointerType === "mouse" && event.buttons === 0) {
      const id = "" + event.pointerId;
      if (this._tracks[id] === void 0) {
        const pointerType = PointerGestureView.pointerType(event.pointerType);
        this.beginHover(id, pointerType, event);
      }
    }
  }

  protected onPointerLeave(event: PointerEvent): void {
    if (event.pointerType === "mouse") {
      const id = "" + event.pointerId;
      if (this._tracks[id] === void 0) {
        this.endHover(id, event);
      }
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    const id = "" + event.pointerId;
    const pointerType = PointerGestureView.pointerType(event.pointerType);
    this.beginTrack(id, pointerType, event.buttons, event.clientX, event.clientY, event);
    if (event.pointerType === "mouse" && event.button !== 0) {
      this.cancelTrack(id, event.clientX, event.clientY, event);
    }
  }

  protected onPointerMove(event: PointerEvent): void {
    const id = "" + event.pointerId;
    this.moveTrack(id, event.clientX, event.clientY, event);
  }

  protected onPointerUp(event: PointerEvent): void {
    const id = "" + event.pointerId;
    const track = this.endTrack(id, event.clientX, event.clientY, event);
    if (track !== null && !track.defaultPrevented && event.button === 0) {
      this.activate(event);
    }
    this.endHover(id, event);
  }

  protected onPointerCancel(event: PointerEvent): void {
    const id = "" + event.pointerId;
    this.cancelTrack(id, event.clientX, event.clientY, event);
    this.endHover(id, event);
  }

  protected onDocumentLeave(event: PointerEvent): void {
    const id = "" + event.pointerId;
    this.cancelTrack(id, event.clientX, event.clientY, event);
    this.endHover(id, event);
  }

  /** @hidden */
  static pointerType(pointerType: string): GestureViewPointerType {
    if (pointerType === "mouse" || pointerType === "touch" || pointerType === "pen") {
      return pointerType;
    } else {
      return "unknown";
    }
  }
}

/** @hidden */
export class TouchGestureView extends BaseGestureView {
  constructor(node: HTMLElement) {
    super(node);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchCancel = this.onTouchCancel.bind(this);
  }

  protected attachNode(node: Node): void {
    node.addEventListener("touchstart", this.onTouchStart, {passive: true});
    node.addEventListener("touchmove", this.onTouchMove);
    node.addEventListener("touchend", this.onTouchEnd);
    node.addEventListener("touchcancel", this.onTouchCancel);
  }

  protected detachNode(node: Node): void {
    node.removeEventListener("touchstart", this.onTouchStart);
    node.removeEventListener("touchmove", this.onTouchMove);
    node.removeEventListener("touchend", this.onTouchEnd);
    node.removeEventListener("touchcancel", this.onTouchCancel);
  }

  protected onStartTracking(): void {
    this.on("touchmove", this.onTouchMove);
    this.on("touchend", this.onTouchEnd);
    this.on("touchcancel", this.onTouchCancel);
  }

  protected onStopTracking(): void {
    this.off("touchmove", this.onTouchMove);
    this.off("touchend", this.onTouchEnd);
    this.off("touchcancel", this.onTouchCancel);
  }

  protected onTouchStart(event: TouchEvent): void {
    const touches = event.targetTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i];
      const id = "" + touch.identifier;
      this.beginTrack(id, "touch", 0, touch.clientX, touch.clientY, event);
    }
  }

  protected onTouchMove(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i];
      const id = "" + touch.identifier;
      this.moveTrack(id, touch.clientX, touch.clientY, event);
    }
  }

  protected onTouchEnd(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i];
      const id = "" + touch.identifier;
      const track = this.endTrack(id, touch.clientX, touch.clientY, event);
      if (track !== null && !track.defaultPrevented) {
        this.activate(event);
      }
      this.endHover(id, event);
    }
  }

  protected onTouchCancel(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i];
      const id = "" + touch.identifier;
      this.cancelTrack(id, touch.clientX, touch.clientY, event);
      this.endHover(id, event);
    }
  }
}

/** @hidden */
export class MouseGestureView extends BaseGestureView {
  constructor(node: HTMLElement) {
    super(node);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onDocumentLeave = this.onDocumentLeave.bind(this);
  }

  protected attachNode(node: Node): void {
    node.addEventListener("mouseenter", this.onMouseEnter);
    node.addEventListener("mouseleave", this.onMouseLeave);
    node.addEventListener("mousedown", this.onMouseDown);
  }

  protected detachNode(node: Node): void {
    node.removeEventListener("mouseenter", this.onMouseEnter);
    node.removeEventListener("mouseleave", this.onMouseLeave);
    node.removeEventListener("mousedown", this.onMouseDown);
    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);
    document.body.removeEventListener("mouseleave", this.onDocumentLeave);
  }

  protected onStartTracking(): void {
    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);
    document.body.addEventListener("mouseleave", this.onDocumentLeave);
  }

  protected onStopTracking(): void {
    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);
    document.body.removeEventListener("mouseleave", this.onDocumentLeave);
  }

  protected onMouseEnter(event: MouseEvent): void {
    if (event.buttons === 0 && this._tracks.mouse === void 0) {
      this.beginHover("mouse", "mouse", event);
    }
  }

  protected onMouseLeave(event: MouseEvent): void {
    if (this._tracks.mouse === void 0) {
      this.endHover("mouse", event);
    }
  }

  protected onMouseDown(event: MouseEvent): void {
    this.beginTrack("mouse", "mouse", event.buttons || 0, event.clientX, event.clientY, event);
    if (event.button !== 0) {
      this.cancelTrack("mouse", event.clientX, event.clientY, event);
    }
  }

  protected onMouseMove(event: MouseEvent): void {
    this.moveTrack("mouse", event.clientX, event.clientY, event);
  }

  protected onMouseUp(event: MouseEvent): void {
    const track = this.endTrack("mouse", event.clientX, event.clientY, event);
    if (track !== null && !track.defaultPrevented && event.button === 0) {
      this.activate(event);
    }
    this.endHover("mouse", event);
  }

  protected onDocumentLeave(event: MouseEvent): void {
    this.cancelTrack("mouse", event.clientX, event.clientY, event);
    this.endHover("mouse", event);
  }
}

type GestureView = BaseGestureView;
const GestureView: typeof BaseGestureView =
    typeof PointerEvent !== "undefined" ? PointerGestureView :
    typeof TouchEvent !== "undefined" ? TouchGestureView :
    MouseGestureView;
export {GestureView};
