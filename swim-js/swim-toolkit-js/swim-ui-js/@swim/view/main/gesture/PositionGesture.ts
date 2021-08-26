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

import type {View} from "../View";
import type {ViewObserverType, ViewObserver} from "../ViewObserver";
import type {GestureInputType} from "./GestureInput";
import {PositionGestureInput} from "./PositionGestureInput";
import type {PositionGestureDelegate} from "./PositionGestureDelegate";

export class AbstractPositionGesture<V extends View> implements ViewObserver<V> {
  constructor(view: V | null, delegate: PositionGestureDelegate | null = null) {
    Object.defineProperty(this, "view", {
      value: view,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "delegate", {
      value: delegate,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "inputs", {
      value: {},
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "inputCount", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "hoverCount", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "pressCount", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
  }

  readonly view!: V | null;

  protected initView(view: V | null): void {
    if (view !== null) {
      view.addViewObserver(this as ViewObserverType<V>);
      if (view.isMounted()) {
        this.attachEvents(view);
      }
    }
  }

  setView(newView: V | null): void {
    const oldView = this.view;
    if (oldView !== newView) {
      if (oldView!== null) {
        this.detachEvents(oldView);
        oldView.removeViewObserver(this as ViewObserverType<V>);
      }
      Object.defineProperty(this, "view", {
        value: newView,
        enumerable: true,
        configurable: true,
      });
      if (newView !== null) {
        newView.addViewObserver(this as ViewObserverType<V>);
        if (newView.isMounted()) {
          this.attachEvents(newView);
        }
      }
    }
  }

  readonly delegate!: PositionGestureDelegate | null;

  setDelegate(delegate: PositionGestureDelegate | null): void {
    Object.defineProperty(this, "delegate", {
      value: delegate,
      enumerable: true,
      configurable: true,
    });
  }

  readonly inputs!: {readonly [inputId: string]: PositionGestureInput | undefined};

  readonly inputCount!: number;

  getInput(inputId: string | number): PositionGestureInput | null {
    if (typeof inputId === "number") {
      inputId = "" + inputId;
    }
    const input = this.inputs[inputId];
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
    const inputs = this.inputs as {[inputId: string]: PositionGestureInput | undefined};
    let input = inputs[inputId];
    if (input === void 0) {
      input = this.createInput(inputId, inputType, isPrimary, x, y, t);
      inputs[inputId] = input;
      Object.defineProperty(this, "inputCount", {
        value: this.inputCount + 1,
        enumerable: true,
        configurable: true,
      });
    }
    return input;
  }

  protected clearInput(input: PositionGestureInput): void {
    if (!input.hovering && !input.pressing) {
      const inputs = this.inputs as {[inputId: string]: PositionGestureInput | undefined};
      delete inputs[input.inputId];
      Object.defineProperty(this, "inputCount", {
        value: this.inputCount - 1,
        enumerable: true,
        configurable: true,
      });
    }
  }

  viewDidMount(view: V): void {
    this.attachEvents(view);
  }

  viewWillUnmount(view: V): void {
    this.detachEvents(view);
    Object.defineProperty(this, "inputs", {
      value: {},
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "inputCount", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "hoverCount", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "pressCount", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
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

  readonly hoverCount!: number;

  isHovering(): boolean {
    return this.hoverCount !== 0;
  }

  protected startHovering(): void {
    this.willStartHovering();
    this.onStartHovering();
    this.didStartHovering();
  }

  protected willStartHovering(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willStartHovering !== void 0) {
      delegate.willStartHovering();
    }
  }

  protected onStartHovering(): void {
    // hook
  }

  protected didStartHovering(): void {
    const delegate = this.delegate;
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
    const delegate = this.delegate;
    if (delegate !== null && delegate.willStopHovering !== void 0) {
      delegate.willStopHovering();
    }
  }

  protected onStopHovering(): void {
    // hook
  }

  protected didStopHovering(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didStopHovering !== void 0) {
      delegate.didStopHovering();
    }
  }

  beginHover(input: PositionGestureInput, event: Event | null): void {
    if (!input.hovering) {
      this.willBeginHover(input, event);
      input.hovering = true;
      Object.defineProperty(this, "hoverCount", {
        value: this.hoverCount + 1,
        enumerable: true,
        configurable: true,
      });
      this.onBeginHover(input, event);
      this.didBeginHover(input, event);
      if (this.hoverCount === 1) {
        this.startHovering();
      }
    }
  }

  protected willBeginHover(input: PositionGestureInput, event: Event | null): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willBeginHover !== void 0) {
      delegate.willBeginHover(input, event);
    }
  }

  protected onBeginHover(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didBeginHover(input: PositionGestureInput, event: Event | null): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didBeginHover !== void 0) {
      delegate.didBeginHover(input, event);
    }
  }

  endHover(input: PositionGestureInput, event: Event | null): void {
    if (input.hovering) {
      this.willEndHover(input, event);
      input.hovering = false;
      Object.defineProperty(this, "hoverCount", {
        value: this.hoverCount - 1,
        enumerable: true,
        configurable: true,
      });
      this.onEndHover(input, event);
      this.didEndHover(input, event);
      if (this.hoverCount === 0) {
        this.stopHovering();
      }
      this.clearInput(input);
    }
  }

  protected willEndHover(input: PositionGestureInput, event: Event | null): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willEndHover !== void 0) {
      delegate.willEndHover(input, event);
    }
  }

  protected onEndHover(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didEndHover(input: PositionGestureInput, event: Event | null): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didEndHover !== void 0) {
      delegate.didEndHover(input, event);
    }
  }

  readonly pressCount!: number;

  isPressing(): boolean {
    return this.pressCount !== 0;
  }

  protected startPressing(): void {
    this.willStartPressing();
    this.onStartPressing();
    this.didStartPressing();
  }

  protected willStartPressing(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willStartPressing !== void 0) {
      delegate.willStartPressing();
    }
  }

  protected onStartPressing(): void {
    this.attachPressEvents(this.view!);
  }

  protected didStartPressing(): void {
    const delegate = this.delegate;
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
    const delegate = this.delegate;
    if (delegate !== null && delegate.willStopPressing !== void 0) {
      delegate.willStopPressing();
    }
  }

  protected onStopPressing(): void {
    this.detachPressEvents(this.view!);
  }

  protected didStopPressing(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didStopPressing !== void 0) {
      delegate.didStopPressing();
    }
  }

  beginPress(input: PositionGestureInput, event: Event | null): void {
    if (!input.pressing) {
      const allowPress = this.willBeginPress(input, event);
      if (allowPress) {
        input.pressing = true;
        input.defaultPrevented = false;
        Object.defineProperty(this, "pressCount", {
          value: this.pressCount + 1,
          enumerable: true,
          configurable: true,
        });
        this.onBeginPress(input, event);
        input.setHoldTimer(this.longPress.bind(this, input));
        this.didBeginPress(input, event);
        if (this.pressCount === 1) {
          this.startPressing();
        }
      }
    }
  }

  protected willBeginPress(input: PositionGestureInput, event: Event | null): boolean {
    const delegate = this.delegate;
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
    const delegate = this.delegate;
    if (delegate !== null && delegate.didBeginPress !== void 0) {
      delegate.didBeginPress(input, event);
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
    const delegate = this.delegate;
    if (delegate !== null && delegate.willMovePress !== void 0) {
      delegate.willMovePress(input, event);
    }
  }

  protected onMovePress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didMovePress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didMovePress !== void 0) {
      delegate.didMovePress(input, event);
    }
  }

  endPress(input: PositionGestureInput, event: Event | null): void {
    input.clearHoldTimer();
    if (input.pressing) {
      this.willEndPress(input, event);
      input.pressing = false;
      Object.defineProperty(this, "pressCount", {
        value: this.pressCount - 1,
        enumerable: true,
        configurable: true,
      });
      this.onEndPress(input, event);
      this.didEndPress(input, event);
      if (this.pressCount === 0) {
        this.stopPressing();
      }
      this.clearInput(input);
    }
  }

  protected willEndPress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willEndPress !== void 0) {
      delegate.willEndPress(input, event);
    }
  }

  protected onEndPress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didEndPress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didEndPress !== void 0) {
      delegate.didEndPress(input, event);
    }
  }

  cancelPress(input: PositionGestureInput, event: Event | null): void {
    input.clearHoldTimer();
    if (input.pressing) {
      this.willCancelPress(input, event);
      input.pressing = false;
      Object.defineProperty(this, "pressCount", {
        value: this.pressCount - 1,
        enumerable: true,
        configurable: true,
      });
      this.onCancelPress(input, event);
      this.didCancelPress(input, event);
      if (this.pressCount === 0) {
        this.stopPressing();
      }
      this.clearInput(input);
    }
  }

  protected willCancelPress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willCancelPress !== void 0) {
      delegate.willCancelPress(input, event);
    }
  }

  protected onCancelPress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didCancelPress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this.delegate;
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
    const delegate = this.delegate;
    if (delegate !== null && delegate.willPress !== void 0) {
      delegate.willPress(input, event);
    }
  }

  protected onPress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  protected didPress(input: PositionGestureInput, event: Event | null): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didPress !== void 0) {
      delegate.didPress(input, event);
    }
  }

  longPress(input: PositionGestureInput): void {
    input.clearHoldTimer();
    const dt = performance.now() - input.t0;
    if (dt < 1.5 * input.holdDelay && input.pressing) {
      this.willLongPress(input);
      this.onLongPress(input);
      this.didLongPress(input);
    }
  }

  protected willLongPress(input: PositionGestureInput): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willLongPress !== void 0) {
      delegate.willLongPress(input);
    }
  }

  protected onLongPress(input: PositionGestureInput): void {
    const t = performance.now();
    input.dt = t - input.t;
    input.t = t;
  }

  protected didLongPress(input: PositionGestureInput): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didLongPress !== void 0) {
      delegate.didLongPress(input);
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

  protected override attachHoverEvents(view: V): void {
    view.on("pointerenter", this.onPointerEnter as EventListener);
    view.on("pointerleave", this.onPointerLeave as EventListener);
    view.on("pointerdown", this.onPointerDown as EventListener);
  }

  protected override detachHoverEvents(view: V): void {
    view.off("pointerenter", this.onPointerEnter as EventListener);
    view.off("pointerleave", this.onPointerLeave as EventListener);
    view.off("pointerdown", this.onPointerDown as EventListener);
  }

  protected override attachPressEvents(view: V): void {
    document.body.addEventListener("pointermove", this.onPointerMove);
    document.body.addEventListener("pointerup", this.onPointerUp);
    document.body.addEventListener("pointercancel", this.onPointerCancel);
    document.body.addEventListener("pointerleave", this.onPointerLeaveDocument);
  }

  protected override detachPressEvents(view: V): void {
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

  protected override attachHoverEvents(view: V): void {
    view.on("touchstart", this.onTouchStart as EventListener);
  }

  protected override detachHoverEvents(view: V): void {
    view.off("touchstart", this.onTouchStart as EventListener);
  }

  protected override attachPressEvents(view: V): void {
    view.on("touchmove", this.onTouchMove as EventListener);
    view.on("touchend", this.onTouchEnd as EventListener);
    view.on("touchcancel", this.onTouchCancel as EventListener);
  }

  protected override detachPressEvents(view: V): void {
    view.off("touchmove", this.onTouchMove as EventListener);
    view.off("touchend", this.onTouchEnd as EventListener);
    view.off("touchcancel", this.onTouchCancel as EventListener);
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
    const touches = event.targetTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
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
      const touch = touches[i]!;
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
      const touch = touches[i]!;
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
      const touch = touches[i]!;
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

  protected override attachHoverEvents(view: V): void {
    view.on("mouseenter", this.onMouseEnter as EventListener);
    view.on("mouseleave", this.onMouseLeave as EventListener);
    view.on("mousedown", this.onMouseDown as EventListener);
  }

  protected override detachHoverEvents(view: V): void {
    view.off("mouseenter", this.onMouseEnter as EventListener);
    view.off("mouseleave", this.onMouseLeave as EventListener);
    view.off("mousedown", this.onMouseDown as EventListener);
  }

  protected override attachPressEvents(view: V): void {
    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);
    document.body.addEventListener("mouseleave", this.onMouseLeaveDocument);
  }

  protected override detachPressEvents(view: V): void {
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
