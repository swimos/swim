// Copyright 2015-2020 Swim inc.
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

import {ViewObserverType, View, ViewObserver} from "@swim/view";
import {GestureInputType} from "./GestureInput";
import {PositionGestureInput} from "./PositionGestureInput";
import {PositionGestureDelegate} from "./PositionGestureDelegate";

export class AbstractPositionGesture<V extends View> implements ViewObserver<V> {
  /** @hidden */
  _view: V | null;
  /** @hidden */
  _delegate: PositionGestureDelegate | null;
  /** @hidden */
  _inputs: {[inputId: string]: PositionGestureInput | undefined};
  /** @hidden */
  _inputCount: number;
  /** @hidden */
  _hoverCount: number;
  /** @hidden */
  _pressCount: number;

  constructor(view: V | null, delegate: PositionGestureDelegate | null = null) {
    this._view = view;
    this._delegate = delegate;
    this._inputs = {};
    this._inputCount = 0;
    this._hoverCount = 0;
    this._pressCount = 0;
  }

  protected initView(view: V | null): void {
    if (view !== null) {
      view.addViewObserver(this as ViewObserverType<V>);
      if (view.isMounted()) {
        this.attachEvents(view);
      }
    }
  }

  get view(): V | null {
    return this._view;
  }

  setView(view: V | null): void {
    if (this._view !== view) {
      if (this._view !== null) {
        this.detachEvents(this._view);
        this._view.removeViewObserver(this as ViewObserverType<V>);
      }
      this._view = view;
      if (this._view !== null) {
        this._view.addViewObserver(this as ViewObserverType<V>);
        if (this._view.isMounted()) {
          this.attachEvents(this._view);
        }
      }
    }
  }

  get delegate(): PositionGestureDelegate | null {
    return this._delegate;
  }

  setDelegate(delegate: PositionGestureDelegate | null): void {
    this._delegate = delegate;
  }

  get inputs(): {readonly [inputId: string]: PositionGestureInput | undefined} {
    return this._inputs;
  }

  getInput(inputId: string | number): PositionGestureInput | null {
    if (typeof inputId === "number") {
      inputId = "" + inputId;
    }
    const input = this._inputs[inputId];
    return input !== void 0 ? input : null;
  }

  protected createInput(inputId: string, inputType: GestureInputType, isPrimary: boolean,
                        x: number, y: number, t: number): PositionGestureInput {
    return new PositionGestureInput(inputId, inputType, isPrimary, x, y, t);
  }

  protected getOrCreateInput(inputId: string | number, inputType: GestureInputType, isPrimary: boolean,
                             x: number, y: number, t: number): PositionGestureInput {
    if (typeof inputId === "number") {
      inputId = "" + inputId;
    }
    let input = this._inputs[inputId];
    if (input === void 0) {
      input = this.createInput(inputId, inputType, isPrimary, x, y, t);
      this._inputs[inputId] = input;
      this._inputCount += 1;
    }
    return input;
  }

  protected clearInput(input: PositionGestureInput): void {
    if (!input.hovering && !input.pressing) {
      delete this._inputs[input.inputId];
      this._inputCount -= 1;
    }
  }

  viewDidMount(view: V): void {
    this.attachEvents(view);
  }

  viewWillUnmount(view: V): void {
    this.detachEvents(view);
    this._inputs = {};
    this._inputCount = 0;
    this._hoverCount = 0;
    this._pressCount = 0;
  }

  protected attachEvents(view: V): void {
    this.attachHoverEvents(view);
  }

  protected detachEvents(view: V): void {
    this.detachHoverEvents(view);
    this.detachPressEvents(view);
  }

  protected attachHoverEvents(view: V): void {
    // hook
  }

  protected detachHoverEvents(view: V): void {
    // hook
  }

  protected attachPressEvents(view: V): void {
    // hook
  }

  protected detachPressEvents(view: V): void {
    // hook
  }

  isHovering(): boolean {
    return this._hoverCount !== 0;
  }

  protected startHovering(): void {
    this.willStartHovering();
    this.onStartHovering();
    this.didStartHovering();
  }

  protected willStartHovering(): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.willStartHovering !== void 0) {
      delegate.willStartHovering();
    }
  }

  protected onStartHovering(): void {
    // hook
  }

  protected didStartHovering(): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.didStartHovering !== void 0) {
      delegate.didStartHovering();
    }
  }

  protected stopHovering(): void {
    this.willStopHovering();
    this.onStopHovering();
    this.didStopHovering();
  }

  protected willStopHovering(): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.willStopHovering !== void 0) {
      delegate.willStopHovering();
    }
  }

  protected onStopHovering(): void {
    // hook
  }

  protected didStopHovering(): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.didStopHovering !== void 0) {
      delegate.didStopHovering();
    }
  }

  beginHover(input: PositionGestureInput, event: Event | null): void {
    if (!input.hovering) {
      this.willBeginHover(input, event);
      input.hovering = true;
      this._hoverCount += 1;
      this.onBeginHover(input, event);
      this.didBeginHover(input, event);
      if (this._hoverCount === 1) {
        this.startHovering();
      }
    }
  }

  protected willBeginHover(input: PositionGestureInput, event: Event | null): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.willBeginHover !== void 0) {
      delegate.willBeginHover(input, event);
    }
  }

  protected onBeginHover(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didBeginHover(input: PositionGestureInput, event: Event | null): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.didBeginHover !== void 0) {
      delegate.didBeginHover(input, event);
    }
  }

  endHover(input: PositionGestureInput, event: Event | null): void {
    if (input.hovering) {
      this.willEndHover(input, event);
      input.hovering = false;
      this._hoverCount -= 1;
      this.onEndHover(input, event);
      this.didEndHover(input, event);
      if (this._hoverCount === 0) {
        this.stopHovering();
      }
      this.clearInput(input);
    }
  }

  protected willEndHover(input: PositionGestureInput, event: Event | null): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.willEndHover !== void 0) {
      delegate.willEndHover(input, event);
    }
  }

  protected onEndHover(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didEndHover(input: PositionGestureInput, event: Event | null): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.didEndHover !== void 0) {
      delegate.didEndHover(input, event);
    }
  }

  isPressing(): boolean {
    return this._pressCount !== 0;
  }

  protected startPressing(): void {
    this.willStartPressing();
    this.onStartPressing();
    this.didStartPressing();
  }

  protected willStartPressing(): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.willStartPressing !== void 0) {
      delegate.willStartPressing();
    }
  }

  protected onStartPressing(): void {
    this.attachPressEvents(this._view!);
  }

  protected didStartPressing(): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.didStartPressing !== void 0) {
      delegate.didStartPressing();
    }
  }

  protected stopPressing(): void {
    this.willStopPressing();
    this.onStopPressing();
    this.didStopPressing();
  }

  protected willStopPressing(): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.willStopPressing !== void 0) {
      delegate.willStopPressing();
    }
  }

  protected onStopPressing(): void {
    this.detachPressEvents(this._view!);
  }

  protected didStopPressing(): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.didStopPressing !== void 0) {
      delegate.didStopPressing();
    }
  }

  beginPress(input: PositionGestureInput, event: Event | null): void {
    if (!input.pressing) {
      const allowPress = this.willBeginPress(input, event);
      if (allowPress) {
        input.pressing = true;
        this._pressCount += 1;
        this.onBeginPress(input, event);
        input.setHoldTimer(this.holdPress.bind(this, input));
        this.didBeginPress(input, event);
        if (this._pressCount === 1) {
          this.startPressing();
        }
      }
    }
  }

  protected willBeginPress(input: PositionGestureInput, event: Event | null): boolean {
    const delegate = this._delegate;
    if (delegate !== null && delegate.willBeginPress !== void 0) {
      const allowPress = delegate.willBeginPress(input, event);
      if (allowPress === false) {
        return false;
      }
    }
    return true;
  }

  protected onBeginPress(input: PositionGestureInput, event: Event | null): void {
    input.x0 = input.x;
    input.y0 = input.y;
    input.t0 = input.t;
    input.dx = 0;
    input.dy = 0;
    input.dt = 0;
  }

  protected didBeginPress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.didBeginPress !== void 0) {
      delegate.didBeginPress(input, event);
    }
  }

  holdPress(input: PositionGestureInput): void {
    if (input.pressing) {
      input.clearHoldTimer();
      this.willHoldPress(input);
      this.onHoldPress(input);
      this.didHoldPress(input);
    }
  }

  protected willHoldPress(input: PositionGestureInput): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.willHoldPress !== void 0) {
      delegate.willHoldPress(input);
    }
  }

  protected onHoldPress(input: PositionGestureInput): void {
    const t = performance.now();
    input.dt = t - input.t;
    input.t = t;
  }

  protected didHoldPress(input: PositionGestureInput): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.didHoldPress !== void 0) {
      delegate.didHoldPress(input);
    }
  }

  movePress(input: PositionGestureInput, event: Event | null): void {
    if (input.pressing) {
      this.willMovePress(input, event);
      this.onMovePress(input, event);
      this.didMovePress(input, event);
    }
  }

  protected willMovePress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.willMovePress !== void 0) {
      delegate.willMovePress(input, event);
    }
  }

  protected onMovePress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didMovePress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.didMovePress !== void 0) {
      delegate.didMovePress(input, event);
    }
  }

  endPress(input: PositionGestureInput, event: Event | null) {
    if (input.pressing) {
      input.clearHoldTimer();
      this.willEndPress(input, event);
      input.pressing = false;
      this._pressCount -= 1;
      this.onEndPress(input, event);
      this.didEndPress(input, event);
      if (this._pressCount === 0) {
        this.stopPressing();
      }
      this.clearInput(input);
    }
  }

  protected willEndPress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.willEndPress !== void 0) {
      delegate.willEndPress(input, event);
    }
  }

  protected onEndPress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didEndPress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.didEndPress !== void 0) {
      delegate.didEndPress(input, event);
    }
  }

  cancelPress(input: PositionGestureInput, event: Event | null): void {
    if (input.pressing) {
      input.clearHoldTimer();
      this.willCancelPress(input, event);
      input.pressing = false;
      this._pressCount -= 1;
      this.onCancelPress(input, event);
      this.didCancelPress(input, event);
      if (this._pressCount === 0) {
        this.stopPressing();
      }
      this.clearInput(input);
    }
  }

  protected willCancelPress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.willCancelPress !== void 0) {
      delegate.willCancelPress(input, event);
    }
  }

  protected onCancelPress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didCancelPress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.didCancelPress !== void 0) {
      delegate.didCancelPress(input, event);
    }
  }

  press(input: PositionGestureInput, event: Event | null): void {
    this.willPress(input, event);
    this.onPress(input, event);
    this.didPress(input, event);
  }

  protected willPress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.willPress !== void 0) {
      delegate.willPress(input, event);
    }
  }

  protected onPress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didPress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this._delegate;
    if (delegate !== null && delegate.didPress !== void 0) {
      delegate.didPress(input, event);
    }
  }
}

/** @hidden */
export class PointerPositionGesture<V extends View> extends AbstractPositionGesture<V> {
  constructor(view: V | null, delegate?: PositionGestureDelegate | null) {
    super(view, delegate);
    this.onPointerEnter = this.onPointerEnter.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerCancel = this.onPointerCancel.bind(this);
    this.onPointerLeaveDocument = this.onPointerLeaveDocument.bind(this);
    this.initView(view);
  }

  protected attachHoverEvents(view: V): void {
    view.on("pointerenter", this.onPointerEnter);
    view.on("pointerleave", this.onPointerLeave);
    view.on("pointerdown", this.onPointerDown);
  }

  protected detachHoverEvents(view: V): void {
    view.off("pointerenter", this.onPointerEnter);
    view.off("pointerleave", this.onPointerLeave);
    view.off("pointerdown", this.onPointerDown);
  }

  protected attachPressEvents(view: V): void {
    document.body.addEventListener("pointermove", this.onPointerMove);
    document.body.addEventListener("pointerup", this.onPointerUp);
    document.body.addEventListener("pointercancel", this.onPointerCancel);
    document.body.addEventListener("pointerleave", this.onPointerLeaveDocument);
  }

  protected detachPressEvents(view: V): void {
    document.body.removeEventListener("pointermove", this.onPointerMove);
    document.body.removeEventListener("pointerup", this.onPointerUp);
    document.body.removeEventListener("pointercancel", this.onPointerCancel);
    document.body.removeEventListener("pointerleave", this.onPointerLeaveDocument);
  }

  protected updateInput(input: PositionGestureInput, event: PointerEvent): void {
    input.target = event.target;
    input.button = event.button;
    input.buttons = event.buttons;
    input.altKey = event.altKey;
    input.ctrlKey = event.ctrlKey;
    input.metaKey = event.metaKey;
    input.shiftKey = event.shiftKey;

    input.dx = event.clientX - input.x;
    input.dy = event.clientY - input.y;
    input.dt = event.timeStamp - input.t;
    input.x = event.clientX;
    input.y = event.clientY;
    input.t = event.timeStamp;

    input.width = event.width;
    input.height = event.height;
    input.tiltX = event.tiltX;
    input.tiltY = event.tiltY;
    input.twist = event.twist;
    input.pressure = event.pressure;
    input.tangentialPressure = event.tangentialPressure;
  }

  protected onPointerEnter(event: PointerEvent): void {
    if (event.pointerType === "mouse" && event.buttons === 0) {
      const input = this.getOrCreateInput(event.pointerId, PointerPositionGesture.inputType(event.pointerType),
                                          event.isPrimary, event.clientX, event.clientY, event.timeStamp);
      this.updateInput(input, event);
      if (!input.hovering) {
        this.beginHover(input, event);
      }
    }
  }

  protected onPointerLeave(event: PointerEvent): void {
    if (event.pointerType === "mouse") {
      const input = this.getInput(event.pointerId);
      if (input !== null) {
        this.updateInput(input, event);
        this.endHover(input, event);
      }
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    event.preventDefault();
    const input = this.getOrCreateInput(event.pointerId, PointerPositionGesture.inputType(event.pointerType),
                                        event.isPrimary, event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.pressing) {
      this.beginPress(input, event);
    }
    if (event.pointerType === "mouse" && event.button !== 0) {
      this.cancelPress(input, event);
    }
  }

  protected onPointerMove(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.movePress(input, event);
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.endPress(input, event);
      if (!input.defaultPrevented && event.button === 0) {
        this.press(input, event);
      }
    }
  }

  protected onPointerCancel(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.cancelPress(input, event);
    }
  }

  protected onPointerLeaveDocument(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.cancelPress(input, event);
      this.endHover(input, event);
    }
  }

  /** @hidden */
  static inputType(inputType: string): GestureInputType {
    if (inputType === "mouse" || inputType === "touch" || inputType === "pen") {
      return inputType;
    } else {
      return "unknown";
    }
  }
}

export class TouchPositionGesture<V extends View> extends AbstractPositionGesture<V> {
  constructor(view: V | null, delegate?: PositionGestureDelegate | null) {
    super(view, delegate);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchCancel = this.onTouchCancel.bind(this);
    this.initView(view);
  }

  protected attachHoverEvents(view: V): void {
    view.on("touchstart", this.onTouchStart);
  }

  protected detachHoverEvents(view: V): void {
    view.off("touchstart", this.onTouchStart);
  }

  protected attachPressEvents(view: V): void {
    view.on("touchmove", this.onTouchMove);
    view.on("touchend", this.onTouchEnd);
    view.on("touchcancel", this.onTouchCancel);
  }

  protected detachPressEvents(view: V): void {
    view.off("touchmove", this.onTouchMove);
    view.off("touchend", this.onTouchEnd);
    view.off("touchcancel", this.onTouchCancel);
  }

  protected updateInput(input: PositionGestureInput, event: TouchEvent, touch: Touch): void {
    input.target = touch.target;
    input.altKey = event.altKey;
    input.ctrlKey = event.ctrlKey;
    input.metaKey = event.metaKey;
    input.shiftKey = event.shiftKey;

    input.dx = touch.clientX - input.x;
    input.dy = touch.clientY - input.y;
    input.dt = event.timeStamp - input.t;
    input.x = touch.clientX;
    input.y = touch.clientY;
    input.t = event.timeStamp;
  }

  protected onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const touches = event.targetTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i];
      const input = this.getOrCreateInput(touch.identifier, "touch", false,
                                          touch.clientX, touch.clientY, event.timeStamp);
      this.updateInput(input, event, touch);
      if (!input.pressing) {
        this.beginPress(input, event);
      }
    }
  }

  protected onTouchMove(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i];
      const input = this.getInput(touch.identifier);
      if (input !== null) {
        this.updateInput(input, event, touch);
        this.movePress(input, event);
      }
    }
  }

  protected onTouchEnd(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i];
      const input = this.getInput(touch.identifier);
      if (input !== null) {
        this.updateInput(input, event, touch);
        this.endPress(input, event);
        if (!input.defaultPrevented) {
          this.press(input, event);
        }
        this.endHover(input, event);
      }
    }
  }

  protected onTouchCancel(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i];
      const input = this.getInput(touch.identifier);
      if (input !== null) {
        this.updateInput(input, event, touch);
        this.cancelPress(input, event);
        this.endHover(input, event);
      }
    }
  }
}

export class MousePositionGesture<V extends View> extends AbstractPositionGesture<V> {
  constructor(view: V | null, delegate?: PositionGestureDelegate | null) {
    super(view, delegate);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeaveDocument = this.onMouseLeaveDocument.bind(this);
    this.initView(view);
  }

  protected attachHoverEvents(view: V): void {
    view.on("mouseenter", this.onMouseEnter);
    view.on("mouseleave", this.onMouseLeave);
    view.on("mousedown", this.onMouseDown);
  }

  protected detachHoverEvents(view: V): void {
    view.off("mouseenter", this.onMouseEnter);
    view.off("mouseleave", this.onMouseLeave);
    view.off("mousedown", this.onMouseDown);
  }

  protected attachPressEvents(view: V): void {
    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);
    document.body.addEventListener("mouseleave", this.onMouseLeaveDocument);
  }

  protected detachPressEvents(view: V): void {
    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);
    document.body.removeEventListener("mouseleave", this.onMouseLeaveDocument);
  }

  protected updateInput(input: PositionGestureInput, event: MouseEvent): void {
    input.target = event.target;
    input.button = event.button;
    input.buttons = event.buttons;
    input.altKey = event.altKey;
    input.ctrlKey = event.ctrlKey;
    input.metaKey = event.metaKey;
    input.shiftKey = event.shiftKey;

    input.dx = event.clientX - input.x;
    input.dy = event.clientY - input.y;
    input.dt = event.timeStamp - input.y;
    input.x = event.clientX;
    input.y = event.clientY;
    input.t = event.timeStamp;
  }

  protected onMouseEnter(event: MouseEvent): void {
    if (event.buttons === 0) {
      const input = this.getOrCreateInput("mouse", "mouse", true,
                                          event.clientX, event.clientY, event.timeStamp);
      this.updateInput(input, event);
      if (!input.hovering) {
        this.beginHover(input, event);
      }
    }
  }

  protected onMouseLeave(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.endHover(input, event);
    }
  }

  protected onMouseDown(event: MouseEvent): void {
    const input = this.getOrCreateInput("mouse", "mouse", true,
                                        event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.pressing) {
      this.beginPress(input, event);
    }
    if (event.button !== 0) {
      this.cancelPress(input, event);
    }
  }

  protected onMouseMove(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.movePress(input, event);
    }
  }

  protected onMouseUp(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.endPress(input, event);
      if (!input.defaultPrevented && event.button === 0) {
        this.press(input, event);
      }
    }
  }

  protected onMouseLeaveDocument(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.cancelPress(input, event);
      this.endHover(input, event);
    }
  }
}

type PositionGesture<V extends View = View> = AbstractPositionGesture<V>;
const PositionGesture: typeof AbstractPositionGesture =
    typeof PointerEvent !== "undefined" ? PointerPositionGesture :
    typeof TouchEvent !== "undefined" ? TouchPositionGesture :
    MousePositionGesture;
export {PositionGesture};
