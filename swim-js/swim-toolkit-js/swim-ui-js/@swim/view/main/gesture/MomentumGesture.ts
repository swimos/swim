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

import type {ViewContext} from "../ViewContext";
import {View} from "../View";
import type {ViewObserver} from "../ViewObserver";
import type {GestureInputType} from "./GestureInput";
import {AbstractPositionGesture} from "./PositionGesture";
import {MomentumGestureInput} from "./MomentumGestureInput";
import type {MomentumGestureDelegate} from "./MomentumGestureDelegate";

export class AbstractMomentumGesture<V extends View> extends AbstractPositionGesture<V> implements ViewObserver<V> {
  constructor(view: V | null, delegate: MomentumGestureDelegate | null = null) {
    super(view, delegate);
    Object.defineProperty(this, "coastCount", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly delegate!: MomentumGestureDelegate | null;

  override setDelegate(delegate: MomentumGestureDelegate | null): void {
    Object.defineProperty(this, "delegate", {
      value: delegate,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly inputs!: {readonly [inputId: string]: MomentumGestureInput | undefined};

  override getInput(inputId: string | number): MomentumGestureInput | null {
    if (typeof inputId === "number") {
      inputId = "" + inputId;
    }
    const input = this.inputs[inputId];
    return input !== void 0 ? input : null;
  }

  protected override createInput(inputId: string, inputType: GestureInputType, isPrimary: boolean,
                                 x: number, y: number, t: number): MomentumGestureInput {
    return new MomentumGestureInput(inputId, inputType, isPrimary, x, y, t);
  }

  protected override getOrCreateInput(inputId: string | number, inputType: GestureInputType, isPrimary: boolean,
                                      x: number, y: number, t: number): MomentumGestureInput {
    if (typeof inputId === "number") {
      inputId = "" + inputId;
    }
    const inputs = this.inputs as {[inputId: string]: MomentumGestureInput | undefined};
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

  protected override clearInput(input: MomentumGestureInput): void {
    if (!input.hovering && !input.pressing && !input.coasting) {
      const inputs = this.inputs as {[inputId: string]: MomentumGestureInput | undefined};
      delete inputs[input.inputId];
      Object.defineProperty(this, "inputCount", {
        value: this.inputCount - 1,
        enumerable: true,
        configurable: true,
      });
    }
  }

  protected get hysteresis(): number {
    const delegate = this.delegate;
    if (delegate !== null && delegate.hysteresis !== void 0) {
      return delegate.hysteresis();
    } else {
      return MomentumGesture.Hysteresis;
    }
  }

  protected get acceleration(): number {
    const delegate = this.delegate;
    if (delegate !== null && delegate.acceleration !== void 0) {
      return delegate.acceleration();
    } else {
      return MomentumGesture.Acceleration;
    }
  }

  protected get velocityMax(): number {
    const delegate = this.delegate;
    if (delegate !== null && delegate.velocityMax !== void 0) {
      return delegate.velocityMax();
    } else {
      return MomentumGesture.VelocityMax;
    }
  }

  override viewWillUnmount(view: V): void {
    super.viewWillUnmount(view);
    Object.defineProperty(this, "coastCount", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
  }

  viewWillAnimate(viewContext: ViewContext): void {
    this.doCoast(viewContext.updateTime);
  }

  interrupt(event: Event | null): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      this.endCoast(input, event);
    }
  }

  cancel(event: Event | null): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      this.endPress(input, event);
      this.endCoast(input, event);
    }
  }

  protected startInteracting(): void {
    this.willStartInteracting();
    this.onStartInteracting();
    this.didStartInteracting();
  }

  protected willStartInteracting(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willStartInteracting !== void 0) {
      delegate.willStartInteracting();
    }
  }

  protected onStartInteracting(): void {
    // hook
  }

  protected didStartInteracting(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didStartInteracting !== void 0) {
      delegate.didStartInteracting();
    }
  }

  protected stopInteracting(): void {
    this.willStopInteracting();
    this.onStopInteracting();
    this.didStopInteracting();
  }

  protected willStopInteracting(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willStopInteracting !== void 0) {
      delegate.willStopInteracting();
    }
  }

  protected onStopInteracting(): void {
    // hook
  }

  protected didStopInteracting(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didStopInteracting !== void 0) {
      delegate.didStopInteracting();
    }
  }

  protected override onStartPressing(): void {
    super.onStartPressing();
    if (this.coastCount === 0) {
      this.startInteracting();
    }
  }

  protected override onStopPressing(): void {
    super.onStopPressing();
    if (this.coastCount === 0) {
      this.stopInteracting();
    }
  }

  override beginPress(input: MomentumGestureInput, event: Event | null): void {
    super.beginPress(input, event);
    this.interrupt(event);
  }

  protected override onBeginPress(input: MomentumGestureInput, event: Event | null): void {
    super.onBeginPress(input, event);
    input.updatePosition(this.hysteresis);
    input.deriveVelocity(this.velocityMax);
  }

  protected override onMovePress(input: MomentumGestureInput, event: Event | null): void {
    super.onMovePress(input, event);
    input.updatePosition(this.hysteresis);
    input.deriveVelocity(this.velocityMax);
  }

  protected override willEndPress(input: MomentumGestureInput, event: Event | null): void {
    super.willEndPress(input, event);
    this.beginCoast(input, event);
  }

  protected override onEndPress(input: MomentumGestureInput, event: Event | null): void {
    super.onEndPress(input, event);
    input.updatePosition(this.hysteresis);
    input.deriveVelocity(this.velocityMax);
  }

  protected override onCancelPress(input: MomentumGestureInput, event: Event | null): void {
    super.onCancelPress(input, event);
    input.updatePosition(this.hysteresis);
    input.deriveVelocity(this.velocityMax);
  }

  readonly coastCount!: number;

  isCoasting(): boolean {
    return this.coastCount !== 0;
  }

  protected startCoasting(): void {
    this.willStartCoasting();
    this.onStartCoasting();
    this.didStartCoasting();
  }

  protected willStartCoasting(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willStartCoasting !== void 0) {
      delegate.willStartCoasting();
    }
  }

  protected onStartCoasting(): void {
    if (this.pressCount === 0) {
      this.startInteracting();
    }
    if (this.view !== null) {
      this.view.requireUpdate(View.NeedsAnimate);
    }
  }

  protected didStartCoasting(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didStartCoasting !== void 0) {
      delegate.didStartCoasting();
    }
  }

  protected stopCoasting(): void {
    this.willStopCoasting();
    this.onStopCoasting();
    this.didStopCoasting();
  }

  protected willStopCoasting(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willStopCoasting !== void 0) {
      delegate.willStopCoasting();
    }
  }

  protected onStopCoasting(): void {
    if (this.pressCount === 0) {
      this.stopInteracting();
    }
  }

  protected didStopCoasting(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didStopCoasting !== void 0) {
      delegate.didStopCoasting();
    }
  }

  beginCoast(input: MomentumGestureInput, event: Event | null): void {
    if (!input.coasting && (input.vx !== 0 || input.vy !== 0)) {
      const angle = Math.atan2(Math.abs(input.vy), Math.abs(input.vx));
      const a = this.acceleration;
      const ax = (input.vx < 0 ? a : input.vx > 0 ? -a : 0) * Math.cos(angle);
      const ay = (input.vy < 0 ? a : input.vy > 0 ? -a : 0) * Math.sin(angle);
      if (ax !== 0 || ay !== 0) {
        input.ax = ax;
        input.ay = ay;
        const allowCoast = this.willBeginCoast(input, event);
        if (allowCoast) {
          input.coasting = true;
          Object.defineProperty(this, "coastCount", {
            value: this.coastCount + 1,
            enumerable: true,
            configurable: true,
          });
          this.onBeginCoast(input, event);
          this.didBeginCoast(input, event);
          if (this.coastCount === 1) {
            this.startCoasting();
          }
        }
      }
    }
  }

  protected willBeginCoast(input: MomentumGestureInput, event: Event | null): boolean {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willBeginCoast !== void 0) {
      const allowCoast = delegate.willBeginCoast(input, event);
      if (allowCoast === false) {
        return false;
      }
    }
    return true;
  }

  protected onBeginCoast(input: MomentumGestureInput, event: Event | null): void {
    input.x0 = input.x;
    input.y0 = input.y;
    input.t0 = input.t;
    input.dx = 0;
    input.dy = 0;
    input.dt = 0;
  }

  protected didBeginCoast(input: MomentumGestureInput, event: Event | null): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didBeginCoast !== void 0) {
      delegate.didBeginCoast(input, event);
    }
  }

  endCoast(input: MomentumGestureInput, event: Event | null): void {
    if (input.coasting) {
      this.willEndCoast(input, event);
      input.coasting = false;
      Object.defineProperty(this, "coastCount", {
        value: this.coastCount - 1,
        enumerable: true,
        configurable: true,
      });
      this.onEndCoast(input, event);
      this.didEndCoast(input, event);
      if (this.coastCount === 0) {
        this.stopCoasting();
      }
      this.clearInput(input);
    }
  }

  protected willEndCoast(input: MomentumGestureInput, event: Event | null): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willEndCoast !== void 0) {
      delegate.willEndCoast(input, event);
    }
  }

  protected onEndCoast(input: MomentumGestureInput, event: Event | null): void {
    // hook
  }

  protected didEndCoast(input: MomentumGestureInput, event: Event | null): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didEndCoast !== void 0) {
      delegate.didEndCoast(input, event);
    }
  }

  /** @hidden */
  protected doCoast(t: number): void {
    if (this.coastCount !== 0) {
      this.willCoast();
      this.integrate(t);
      this.onCoast();
      const inputs = this.inputs;
      for (const inputId in inputs) {
        const input = inputs[inputId]!;
        if (input.coasting && input.ax === 0 && input.ay === 0) {
          this.endCoast(input, null);
        }
      }
      this.didCoast();
      if (this.coastCount !== 0 && this.view !== null) {
        this.view.requireUpdate(View.NeedsAnimate);
      }
    }
  }

  protected willCoast(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.willCoast !== void 0) {
      delegate.willCoast();
    }
  }

  protected onCoast(): void {
    // hook
  }

  protected didCoast(): void {
    const delegate = this.delegate;
    if (delegate !== null && delegate.didCoast !== void 0) {
      delegate.didCoast();
    }
  }

  /** @hidden */
  protected integrate(t: number): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (input.coasting) {
        input.integrateVelocity(t);
      }
    }
  }

  /** @hidden */
  static Hysteresis: number = 67;
  /** @hidden */
  static Acceleration: number = 0.00175;
  /** @hidden */
  static VelocityMax: number = 1.75;
}

export class PointerMomentumGesture<V extends View> extends AbstractMomentumGesture<V> {
  constructor(view: V | null, delegate?: MomentumGestureDelegate | null) {
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

  protected updateInput(input: MomentumGestureInput, event: PointerEvent): void {
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
      const input = this.getOrCreateInput(event.pointerId, PointerMomentumGesture.inputType(event.pointerType),
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
    const input = this.getOrCreateInput(event.pointerId, PointerMomentumGesture.inputType(event.pointerType),
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

export class TouchMomentumGesture<V extends View> extends AbstractMomentumGesture<V> {
  constructor(view: V | null, delegate?: MomentumGestureDelegate | null) {
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

  protected updateInput(input: MomentumGestureInput, event: TouchEvent, touch: Touch): void {
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

export class MouseMomentumGesture<V extends View> extends AbstractMomentumGesture<V> {
  constructor(view: V | null, delegate?: MomentumGestureDelegate | null) {
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

  protected updateInput(input: MomentumGestureInput, event: MouseEvent): void {
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

type MomentumGesture<V extends View = View> = AbstractMomentumGesture<V>;
const MomentumGesture: typeof AbstractMomentumGesture =
    typeof PointerEvent !== "undefined" ? PointerMomentumGesture :
    typeof TouchEvent !== "undefined" ? TouchMomentumGesture :
    MouseMomentumGesture;
export {MomentumGesture};
