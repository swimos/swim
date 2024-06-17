// Copyright 2015-2024 Nstream, inc.
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
import type {Proto} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import type {Fastener} from "@swim/component";
import {View} from "./View";
import type {GestureInputType} from "./Gesture";
import {GestureInput} from "./Gesture";
import {PositionGestureInput} from "./PositionGesture";
import type {PositionGestureDescriptor} from "./PositionGesture";
import type {PositionGestureClass} from "./PositionGesture";
import {PositionGesture} from "./PositionGesture";

/** @public */
export class MomentumGestureInput extends PositionGestureInput {
  vx: number;
  vy: number;
  ax: number;
  ay: number;

  /** @internal */
  readonly path: {x: number; y: number; t: number;}[];
  coasting: boolean;

  constructor(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number) {
    super(inputId, inputType, isPrimary, x, y, t);
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.path = [];
    this.coasting = false;
  }

  /** @internal */
  updatePosition(hysteresis: number): void {
    const path = this.path;
    const x = this.x;
    const y = this.y;
    const t = this.t;
    path.push({x, y, t});
    while (path.length > 1 && t - path[0]!.t > hysteresis) {
      path.shift();
    }
  }

  /** @internal */
  deriveVelocity(vMax: number): void {
    const p0 = this.path[0]!;
    const p1 = this.path[this.path.length - 1]!;
    if (p1 !== void 0 && p1 !== p0) {
      const dt = p1.t - p0.t;
      let vx: number;
      let vy: number;
      if (dt !== 0) {
        vx = (p1.x - p0.x) / dt;
        vy = (p1.y - p0.y) / dt;
        const v2 = vx * vx + vy * vy;
        const vMax2 = vMax * vMax;
        if (vMax2 < v2) {
          const v = Math.sqrt(v2);
          vx = vx * vMax / v;
          vy = vy * vMax / v;
        }
      } else {
        vx = 0;
        vy = 0;
      }
      this.vx = vx;
      this.vy = vy;
    } else if (p0 !== void 0) {
      this.vx = 0;
      this.vy = 0;
    }
  }

  /** @internal */
  integrateVelocity(t: number): void {
    const dt = t - this.t;
    if (dt === 0) {
      return;
    }

    let vx = this.vx + this.ax * dt;
    let x: number;
    if (vx < 0 === this.vx < 0) {
      x = this.x + this.vx * dt + 0.5 * (this.ax * dt * dt);
    } else {
      x = this.x - (this.vx * this.vx) / (2 * this.ax);
      vx = 0;
      this.ax = 0;
    }

    let vy = this.vy + this.ay * dt;
    let y: number;
    if (vy < 0 === this.vy < 0) {
      y = this.y + this.vy * dt + 0.5 * (this.ay * dt * dt);
    } else {
      y = this.y - (this.vy * this.vy) / (2 * this.ay);
      vy = 0;
      this.ay = 0;
    }

    this.dx = x - this.x;
    this.dy = y - this.y;
    this.dt = dt;
    this.x = x;
    this.y = y;
    this.t = t;
    this.vx = vx;
    this.vy = vy;
  }
}

/** @public */
export interface MomentumGestureDescriptor<R, V extends View> extends PositionGestureDescriptor<R, V> {
  extends?: Proto<MomentumGesture<any, any>> | boolean | null;
}

/** @public */
export interface MomentumGestureClass<G extends MomentumGesture<any, any> = MomentumGesture> extends PositionGestureClass<G> {
}

/** @public */
export interface MomentumGesture<R = any, V extends View = View> extends PositionGesture<R, V> {
  /** @override */
  get descriptorType(): Proto<MomentumGestureDescriptor<R, V>>;

  /** @internal @override */
  readonly inputs: {readonly [inputId: string]: MomentumGestureInput | undefined};

  /** @override */
  getInput(inputId: string | number): MomentumGestureInput | null;

  /** @internal @override */
  createInput(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number): MomentumGestureInput;

  /** @internal @override */
  getOrCreateInput(inputId: string | number, inputType: GestureInputType, isPrimary: boolean,
                   x: number, y: number, t: number): MomentumGestureInput;

  /** @internal @override */
  clearInput(input: MomentumGestureInput): void;

  /** @internal @override */
  clearInputs(): void;

  /** @internal @override */
  resetInput(input: MomentumGestureInput): void;

  /** @protected */
  initHysteresis(): number;

  /**
   * The time delta for velocity derivation, in milliseconds.
   */
  hysteresis: number;

  /** @protected */
  initAcceleration(): number;

  /**
   * The magnitude of the deceleration on coasting input points in,
   * pixels/millisecond^2. An acceleration of zero disables coasting.
   */
  acceleration: number;

  /** @protected */
  initVelocityMax(): number;

  /**
   * The maximum magnitude of the velocity of coasting input points,
   * in pixels/millisecond.
   */
  velocityMax: number;

  /** @internal */
  viewWillAnimate(view: View): void;

  /** @internal */
  interrupt(event: Event | null): void;

  /** @internal */
  cancel(event: Event | null): void;

  /** @internal */
  startInteracting(): void;

  /** @protected */
  willStartInteracting(): void;

  /** @protected */
  onStartInteracting(): void;

  /** @protected */
  didStartInteracting(): void;

  /** @internal */
  stopInteracting(): void;

  /** @protected */
  willStopInteracting(): void;

  /** @protected */
  onStopInteracting(): void;

  /** @protected */
  didStopInteracting(): void;

  /** @internal @override */
  onStartPressing(): void;

  /** @internal @override */
  onStopPressing(): void;

  /** @internal @override */
  beginPress(input: MomentumGestureInput, event: Event | null): void;

  /** @protected @override */
  onBeginPress(input: MomentumGestureInput, event: Event | null): void;

  /** @protected @override */
  onMovePress(input: MomentumGestureInput, event: Event | null): void;

  /** @protected @override */
  willEndPress(input: MomentumGestureInput, event: Event | null): void;

  /** @protected @override */
  onEndPress(input: MomentumGestureInput, event: Event | null): void;

  /** @protected @override */
  onCancelPress(input: MomentumGestureInput, event: Event | null): void;

  readonly coastCount: number;

  get coasting(): boolean;

  /** @internal */
  startCoasting(): void;

  /** @protected */
  willStartCoasting(): void;

  /** @protected */
  onStartCoasting(): void;

  /** @protected */
  didStartCoasting(): void;

  /** @internal */
  stopCoasting(): void;

  /** @protected */
  willStopCoasting(): void;

  /** @protected */
  onStopCoasting(): void;

  /** @protected */
  didStopCoasting(): void;

  /** @internal */
  beginCoast(input: MomentumGestureInput, event: Event | null): void;

  /** @protected */
  willBeginCoast(input: MomentumGestureInput, event: Event | null): boolean | void;

  /** @protected */
  onBeginCoast(input: MomentumGestureInput, event: Event | null): void;

  /** @protected */
  didBeginCoast(input: MomentumGestureInput, event: Event | null): void;

  /** @internal */
  endCoast(input: MomentumGestureInput, event: Event | null): void;

  /** @protected */
  willEndCoast(input: MomentumGestureInput, event: Event | null): void;

  /** @protected */
  onEndCoast(input: MomentumGestureInput, event: Event | null): void;

  /** @protected */
  didEndCoast(input: MomentumGestureInput, event: Event | null): void;

  /** @internal */
  doCoast(t: number): void;

  /** @protected */
  willCoast(): void;

  /** @protected */
  onCoast(): void;

  /** @protected */
  didCoast(): void;

  /** @internal */
  integrate(t: number): void;
}

/** @public */
export const MomentumGesture = (<R, V extends View, G extends MomentumGesture<any, any>>() => PositionGesture.extend<MomentumGesture<R, V>, MomentumGestureClass<G>>("MomentumGesture", {
  createInput(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number): MomentumGestureInput {
    return new MomentumGestureInput(inputId, inputType, isPrimary, x, y, t);
  },

  clearInput(input: MomentumGestureInput): void {
    if (!input.coasting) {
      super.clearInput(input);
    }
  },

  clearInputs(): void {
    super.clearInputs();
    (this as Mutable<typeof this>).coastCount = 0;
  },

  resetInput(input: MomentumGestureInput): void {
    if (input.coasting) {
      this.endCoast(input, null);
    }
    super.resetInput(input);
  },

  hysteresis: 67,

  initHysteresis(): number {
    return (Object.getPrototypeOf(this) as MomentumGesture).hysteresis;
  },

  acceleration: 0.00175,

  initAcceleration(): number {
    return (Object.getPrototypeOf(this) as MomentumGesture).acceleration;
  },

  velocityMax: 1.75,

  initVelocityMax(): number {
    return (Object.getPrototypeOf(this) as MomentumGesture).velocityMax;
  },

  viewWillAnimate(view: View): void {
    this.doCoast(view.updateTime);
  },

  interrupt(event: Event | null): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      this.endCoast(input, event);
    }
  },

  cancel(event: Event | null): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      this.endPress(input, event);
      this.endCoast(input, event);
    }
  },

  startInteracting(): void {
    this.willStartInteracting();
    this.onStartInteracting();
    this.didStartInteracting();
  },

  willStartInteracting(): void {
    // hook
  },

  onStartInteracting(): void {
    // hook
  },

  didStartInteracting(): void {
    // hook
  },

  stopInteracting(): void {
    this.willStopInteracting();
    this.onStopInteracting();
    this.didStopInteracting();
  },

  willStopInteracting(): void {
    // hook
  },

  onStopInteracting(): void {
    // hook
  },

  didStopInteracting(): void {
    // hook
  },

  onStartPressing(): void {
    super.onStartPressing();
    if (this.coastCount === 0) {
      this.startInteracting();
    }
  },

  onStopPressing(): void {
    super.onStopPressing();
    if (this.coastCount === 0) {
      this.stopInteracting();
    }
  },

  beginPress(input: MomentumGestureInput, event: Event | null): void {
    super.beginPress(input, event);
    this.interrupt(event);
  },

  onBeginPress(input: MomentumGestureInput, event: Event | null): void {
    super.onBeginPress(input, event);
    input.updatePosition(this.hysteresis);
    input.deriveVelocity(this.velocityMax);
  },

  onMovePress(input: MomentumGestureInput, event: Event | null): void {
    super.onMovePress(input, event);
    input.updatePosition(this.hysteresis);
    input.deriveVelocity(this.velocityMax);
  },

  willEndPress(input: MomentumGestureInput, event: Event | null): void {
    super.willEndPress(input, event);
    this.beginCoast(input, event);
  },

  onEndPress(input: MomentumGestureInput, event: Event | null): void {
    super.onEndPress(input, event);
    input.updatePosition(this.hysteresis);
    input.deriveVelocity(this.velocityMax);
  },

  onCancelPress(input: MomentumGestureInput, event: Event | null): void {
    super.onCancelPress(input, event);
    input.updatePosition(this.hysteresis);
    input.deriveVelocity(this.velocityMax);
  },

  get coasting(): boolean {
    return this.coastCount !== 0;
  },

  startCoasting(): void {
    this.willStartCoasting();
    this.onStartCoasting();
    this.didStartCoasting();
  },

  willStartCoasting(): void {
    // hook
  },

  onStartCoasting(): void {
    if (this.pressCount === 0) {
      this.startInteracting();
    }
    if (this.view !== null) {
      this.view.requireUpdate(View.NeedsAnimate);
    }
  },

  didStartCoasting(): void {
    // hook
  },

  stopCoasting(): void {
    this.willStopCoasting();
    this.onStopCoasting();
    this.didStopCoasting();
  },

  willStopCoasting(): void {
    // hook
  },

  onStopCoasting(): void {
    if (this.pressCount === 0) {
      this.stopInteracting();
    }
  },

  didStopCoasting(): void {
    // hook
  },

  beginCoast(input: MomentumGestureInput, event: Event | null): void {
    if (input.coasting || (input.vx === 0 && input.vy === 0)) {
      return;
    }
    const angle = Math.atan2(Math.abs(input.vy), Math.abs(input.vx));
    const a = this.acceleration;
    const ax = (input.vx < 0 ? a : input.vx > 0 ? -a : 0) * Math.cos(angle);
    const ay = (input.vy < 0 ? a : input.vy > 0 ? -a : 0) * Math.sin(angle);
    if (ax === 0 && ay === 0) {
      return;
    }
    input.ax = ax;
    input.ay = ay;
    let allowCoast = this.willBeginCoast(input, event);
    if (allowCoast === void 0) {
      allowCoast = true;
    }
    if (!allowCoast) {
      return;
    }
    input.coasting = true;
    (this as Mutable<typeof this>).coastCount += 1;
    this.onBeginCoast(input, event);
    this.didBeginCoast(input, event);
    if (this.coastCount === 1) {
      this.startCoasting();
    }
  },

  willBeginCoast(input: MomentumGestureInput, event: Event | null): boolean | void {
    // hook
  },

  onBeginCoast(input: MomentumGestureInput, event: Event | null): void {
    input.x0 = input.x;
    input.y0 = input.y;
    input.t0 = input.t;
    input.dx = 0;
    input.dy = 0;
    input.dt = 0;
  },

  didBeginCoast(input: MomentumGestureInput, event: Event | null): void {
    // hook
  },

  endCoast(input: MomentumGestureInput, event: Event | null): void {
    if (!input.coasting) {
      return;
    }
    this.willEndCoast(input, event);
    input.coasting = false;
    (this as Mutable<typeof this>).coastCount -= 1;
    this.onEndCoast(input, event);
    this.didEndCoast(input, event);
    if (this.coastCount === 0) {
      this.stopCoasting();
    }
    this.clearInput(input);
  },

  willEndCoast(input: MomentumGestureInput, event: Event | null): void {
    // hook
  },

  onEndCoast(input: MomentumGestureInput, event: Event | null): void {
    // hook
  },

  didEndCoast(input: MomentumGestureInput, event: Event | null): void {
    // hook
  },

  doCoast(t: number): void {
    if (this.coastCount === 0) {
      return;
    }
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
  },

  willCoast(): void {
    // hook
  },

  onCoast(): void {
    // hook
  },

  didCoast(): void {
    // hook
  },

  integrate(t: number): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (input.coasting) {
        input.integrateVelocity(t);
      }
    }
  },
},
{
  construct(gesture: G | null, owner: G extends Fastener<infer R, any, any> ? R : never): G {
    gesture = super.construct(gesture, owner) as G;
    (gesture as Mutable<typeof gesture>).coastCount = 0;
    gesture.hysteresis = gesture.initHysteresis();
    gesture.acceleration = gesture.initAcceleration();
    gesture.velocityMax = gesture.initVelocityMax();
    return gesture;
  },

  specialize(template: G extends {readonly descriptorType?: Proto<infer D>} ? D : never): FastenerClass<G> {
    let superClass = template.extends as FastenerClass<G> | null | undefined;
    if (superClass === void 0 || superClass === null) {
      const method = template.method;
      if (method === "pointer") {
        superClass = PointerMomentumGesture as unknown as FastenerClass<G>;
      } else if (method === "touch") {
        superClass = TouchMomentumGesture as unknown as FastenerClass<G>;
      } else if (method === "mouse") {
        superClass = MouseMomentumGesture as unknown as FastenerClass<G>;
      } else if (typeof PointerEvent !== "undefined") {
        superClass = PointerMomentumGesture as unknown as FastenerClass<G>;
      } else if (typeof TouchEvent !== "undefined") {
        superClass = TouchMomentumGesture as unknown as FastenerClass<G>;
      } else {
        superClass = MouseMomentumGesture as unknown as FastenerClass<G>;
      }
    }
    return superClass;
  },
}))();

/** @internal */
export interface PointerMomentumGesture<R = any, V extends View = View> extends MomentumGesture<R, V> {
  /** @internal @protected @override */
  attachHoverEvents(view: V): void;

  /** @internal @protected @override */
  detachHoverEvents(view: V): void;

  /** @internal @protected @override */
  attachPressEvents(view: V): void;

  /** @internal @protected @override */
  detachPressEvents(view: V): void;

  /** @internal @protected */
  updateInput(input: MomentumGestureInput, event: PointerEvent): void;

  /** @internal @protected */
  onPointerEnter(event: PointerEvent): void;

  /** @internal @protected */
  onPointerLeave(event: PointerEvent): void;

  /** @internal @protected */
  onPointerDown(event: PointerEvent): void;

  /** @internal @protected */
  onPointerMove(event: PointerEvent): void;

  /** @internal @protected */
  onPointerUp(event: PointerEvent): void;

  /** @internal @protected */
  onPointerCancel(event: PointerEvent): void;

  /** @internal @protected */
  onPointerLeaveDocument(event: PointerEvent): void;
}

/** @internal */
export const PointerMomentumGesture = (<R, V extends View, G extends PointerMomentumGesture<any, any>>() => MomentumGesture.extend<PointerMomentumGesture<R, V>, MomentumGestureClass<G>>("PointerMomentumGesture", {
  attachHoverEvents(view: V): void {
    view.addEventListener("pointerenter", this.onPointerEnter as EventListener);
    view.addEventListener("pointerleave", this.onPointerLeave as EventListener);
    view.addEventListener("pointerdown", this.onPointerDown as EventListener);
  },

  detachHoverEvents(view: V): void {
    view.removeEventListener("pointerenter", this.onPointerEnter as EventListener);
    view.removeEventListener("pointerleave", this.onPointerLeave as EventListener);
    view.removeEventListener("pointerdown", this.onPointerDown as EventListener);
  },

  attachPressEvents(view: V): void {
    document.body.addEventListener("pointermove", this.onPointerMove);
    document.body.addEventListener("pointerup", this.onPointerUp);
    document.body.addEventListener("pointercancel", this.onPointerCancel);
    document.body.addEventListener("pointerleave", this.onPointerLeaveDocument);
  },

  detachPressEvents(view: V): void {
    document.body.removeEventListener("pointermove", this.onPointerMove);
    document.body.removeEventListener("pointerup", this.onPointerUp);
    document.body.removeEventListener("pointercancel", this.onPointerCancel);
    document.body.removeEventListener("pointerleave", this.onPointerLeaveDocument);
  },

  updateInput(input: MomentumGestureInput, event: PointerEvent): void {
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
  },

  onPointerEnter(event: PointerEvent): void {
    if (event.pointerType !== "mouse" || event.buttons !== 0) {
      return;
    }
    const input = this.getOrCreateInput(event.pointerId, GestureInput.pointerInputType(event.pointerType),
                                        event.isPrimary, event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.hovering) {
      this.beginHover(input, event);
    }
  },

  onPointerLeave(event: PointerEvent): void {
    if (event.pointerType !== "mouse") {
      return;
    }
    const input = this.getInput(event.pointerId);
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.endHover(input, event);
  },

  onPointerDown(event: PointerEvent): void {
    const input = this.getOrCreateInput(event.pointerId, GestureInput.pointerInputType(event.pointerType),
                                        event.isPrimary, event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.pressing) {
      this.beginPress(input, event);
    }
    if (event.pointerType === "mouse" && event.button !== 0) {
      this.cancelPress(input, event);
    }
  },

  onPointerMove(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.movePress(input, event);
  },

  onPointerUp(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.endPress(input, event);
    if (!input.defaultPrevented && event.button === 0) {
      this.press(input, event);
    }
  },

  onPointerCancel(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.cancelPress(input, event);
  },

  onPointerLeaveDocument(event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.cancelPress(input, event);
    this.endHover(input, event);
  },
},
{
  construct(gesture: G | null, owner: G extends Fastener<infer R, any, any> ? R : never): G {
    gesture = super.construct(gesture, owner) as G;
    gesture.onPointerEnter = gesture.onPointerEnter.bind(gesture);
    gesture.onPointerLeave = gesture.onPointerLeave.bind(gesture);
    gesture.onPointerDown = gesture.onPointerDown.bind(gesture);
    gesture.onPointerMove = gesture.onPointerMove.bind(gesture);
    gesture.onPointerUp = gesture.onPointerUp.bind(gesture);
    gesture.onPointerCancel = gesture.onPointerCancel.bind(gesture);
    gesture.onPointerLeaveDocument = gesture.onPointerLeaveDocument.bind(gesture);
    return gesture;
  },
}))();

/** @internal */
export interface TouchMomentumGesture<R = any, V extends View = View> extends MomentumGesture<R, V> {
  /** @internal @protected @override */
  attachHoverEvents(view: V): void;

  /** @internal @protected @override */
  detachHoverEvents(view: V): void;

  /** @internal @protected @override */
  attachPressEvents(view: V): void;

  /** @internal @protected @override */
  detachPressEvents(view: V): void;

  /** @internal @protected */
  updateInput(input: MomentumGestureInput, event: TouchEvent, touch: Touch): void;

  /** @internal @protected */
  onTouchStart(event: TouchEvent): void;

  /** @internal @protected */
  onTouchMove(event: TouchEvent): void;

  /** @internal @protected */
  onTouchEnd(event: TouchEvent): void;

  /** @internal @protected */
  onTouchCancel(event: TouchEvent): void;
}

/** @internal */
export const TouchMomentumGesture = (<R, V extends View, G extends TouchMomentumGesture<any, any>>() => MomentumGesture.extend<TouchMomentumGesture<R, V>, MomentumGestureClass<G>>("TouchMomentumGesture", {
  attachHoverEvents(view: V): void {
    view.addEventListener("touchstart", this.onTouchStart as EventListener);
  },

  detachHoverEvents(view: V): void {
    view.removeEventListener("touchstart", this.onTouchStart as EventListener);
  },

  attachPressEvents(view: V): void {
    view.addEventListener("touchmove", this.onTouchMove as EventListener);
    view.addEventListener("touchend", this.onTouchEnd as EventListener);
    view.addEventListener("touchcancel", this.onTouchCancel as EventListener);
  },

  detachPressEvents(view: V): void {
    view.removeEventListener("touchmove", this.onTouchMove as EventListener);
    view.removeEventListener("touchend", this.onTouchEnd as EventListener);
    view.removeEventListener("touchcancel", this.onTouchCancel as EventListener);
  },

  updateInput(input: MomentumGestureInput, event: TouchEvent, touch: Touch): void {
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
  },

  onTouchStart(event: TouchEvent): void {
    const touches = event.targetTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getOrCreateInput(touch.identifier, "touch", false, touch.clientX, touch.clientY, event.timeStamp);
      this.updateInput(input, event, touch);
      if (!input.pressing) {
        this.beginPress(input, event);
      }
    }
  },

  onTouchMove(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getInput(touch.identifier);
      if (input === null) {
        continue;
      }
      this.updateInput(input, event, touch);
      this.movePress(input, event);
    }
  },

  onTouchEnd(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getInput(touch.identifier);
      if (input === null) {
        continue;
      }
      this.updateInput(input, event, touch);
      this.endPress(input, event);
      if (!input.defaultPrevented) {
        this.press(input, event);
      }
      this.endHover(input, event);
    }
  },

  onTouchCancel(event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getInput(touch.identifier);
      if (input === null) {
        continue;
      }
      this.updateInput(input, event, touch);
      this.cancelPress(input, event);
      this.endHover(input, event);
    }
  },
},
{
  construct(gesture: G | null, owner: G extends Fastener<infer R, any, any> ? R : never): G {
    gesture = super.construct(gesture, owner) as G;
    gesture.onTouchStart = gesture.onTouchStart.bind(gesture);
    gesture.onTouchMove = gesture.onTouchMove.bind(gesture);
    gesture.onTouchEnd = gesture.onTouchEnd.bind(gesture);
    gesture.onTouchCancel = gesture.onTouchCancel.bind(gesture);
    return gesture;
  },
}))();

/** @internal */
export interface MouseMomentumGesture<R = any, V extends View = View> extends MomentumGesture<R, V> {
  /** @internal @protected @override */
  attachHoverEvents(view: V): void;

  /** @internal @protected @override */
  detachHoverEvents(view: V): void;

  /** @internal @protected @override */
  attachPressEvents(view: V): void;

  /** @internal @protected @override */
  detachPressEvents(view: V): void;

  /** @internal @protected */
  updateInput(input: MomentumGestureInput, event: MouseEvent): void;

  /** @internal @protected */
  onMouseEnter(event: MouseEvent): void;

  /** @internal @protected */
  onMouseLeave(event: MouseEvent): void;

  /** @internal @protected */
  onMouseDown(event: MouseEvent): void;

  /** @internal @protected */
  onMouseMove(event: MouseEvent): void;

  /** @internal @protected */
  onMouseUp(event: MouseEvent): void;

  /** @internal @protected */
  onMouseLeaveDocument(event: MouseEvent): void;
}

/** @internal */
export const MouseMomentumGesture = (<R, V extends View, G extends MouseMomentumGesture<any, any>>() => MomentumGesture.extend<MouseMomentumGesture<R, V>, MomentumGestureClass<G>>("MouseMomentumGesture", {
  attachHoverEvents(view: V): void {
    view.addEventListener("mouseenter", this.onMouseEnter as EventListener);
    view.addEventListener("mouseleave", this.onMouseLeave as EventListener);
    view.addEventListener("mousedown", this.onMouseDown as EventListener);
  },

  detachHoverEvents(view: V): void {
    view.removeEventListener("mouseenter", this.onMouseEnter as EventListener);
    view.removeEventListener("mouseleave", this.onMouseLeave as EventListener);
    view.removeEventListener("mousedown", this.onMouseDown as EventListener);
  },

  attachPressEvents(view: V): void {
    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);
    document.body.addEventListener("mouseleave", this.onMouseLeaveDocument);
  },

  detachPressEvents(view: V): void {
    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);
    document.body.removeEventListener("mouseleave", this.onMouseLeaveDocument);
  },

  updateInput(input: MomentumGestureInput, event: MouseEvent): void {
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
  },

  onMouseEnter(event: MouseEvent): void {
    if (event.buttons !== 0) {
      return;
    }
    const input = this.getOrCreateInput("mouse", "mouse", true, event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.hovering) {
      this.beginHover(input, event);
    }
  },

  onMouseLeave(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.endHover(input, event);
  },

  onMouseDown(event: MouseEvent): void {
    const input = this.getOrCreateInput("mouse", "mouse", true, event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.pressing) {
      this.beginPress(input, event);
    }
    if (event.button !== 0) {
      this.cancelPress(input, event);
    }
  },

  onMouseMove(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.movePress(input, event);
  },

  onMouseUp(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.endPress(input, event);
    if (!input.defaultPrevented && event.button === 0) {
      this.press(input, event);
    }
  },

  onMouseLeaveDocument(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input === null) {
      return;
    }
    this.updateInput(input, event);
    this.cancelPress(input, event);
    this.endHover(input, event);
  },
},
{
  construct(gesture: G | null, owner: G extends Fastener<infer R, any, any> ? R : never): G {
    gesture = super.construct(gesture, owner) as G;
    gesture.onMouseEnter = gesture.onMouseEnter.bind(gesture);
    gesture.onMouseLeave = gesture.onMouseLeave.bind(gesture);
    gesture.onMouseDown = gesture.onMouseDown.bind(gesture);
    gesture.onMouseMove = gesture.onMouseMove.bind(gesture);
    gesture.onMouseUp = gesture.onMouseUp.bind(gesture);
    gesture.onMouseLeaveDocument = gesture.onMouseLeaveDocument.bind(gesture);
    return gesture;
  },
}))();
