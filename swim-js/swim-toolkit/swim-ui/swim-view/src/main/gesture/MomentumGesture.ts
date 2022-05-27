// Copyright 2015-2022 Swim.inc
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

import type {Mutable, Proto} from "@swim/util";
import type {FastenerOwner} from "@swim/component";
import {View} from "../view/View";
import type {GestureInputType} from "./GestureInput";
import type {GestureView} from "./Gesture";
import {PositionGestureDescriptor, PositionGestureClass, PositionGesture} from "./PositionGesture";
import {MomentumGestureInput} from "./MomentumGestureInput";
import {MouseMomentumGesture} from "./"; // forward import
import {TouchMomentumGesture} from "./"; // forward import
import {PointerMomentumGesture} from "./"; // forward import

/** @public */
export interface MomentumGestureDescriptor<V extends View = View> extends PositionGestureDescriptor<V> {
  extends?: Proto<MomentumGesture<any, any>> | string | boolean | null;
  hysteresis?: number;
  acceleration?: number;
  velocityMax?: number;
}

/** @public */
export type MomentumGestureTemplate<G extends MomentumGesture<any, any>> =
  ThisType<G> &
  MomentumGestureDescriptor<GestureView<G>> &
  Partial<Omit<G, keyof MomentumGestureDescriptor>>;

/** @public */
export interface MomentumGestureClass<G extends MomentumGesture<any, any> = MomentumGesture<any, any>> extends PositionGestureClass<G> {
  /** @override */
  specialize(template: MomentumGestureDescriptor<any>): MomentumGestureClass<G>;

  /** @override */
  refine(gestureClass: MomentumGestureClass<any>): void;

  /** @override */
  extend<G2 extends G>(className: string, template: MomentumGestureTemplate<G2>): MomentumGestureClass<G2>;
  extend<G2 extends G>(className: string, template: MomentumGestureTemplate<G2>): MomentumGestureClass<G2>;

  /** @override */
  define<G2 extends G>(className: string, template: MomentumGestureTemplate<G2>): MomentumGestureClass<G2>;
  define<G2 extends G>(className: string, template: MomentumGestureTemplate<G2>): MomentumGestureClass<G2>;

  /** @override */
  <G2 extends G>(template: MomentumGestureTemplate<G2>): PropertyDecorator;

  /** @internal */
  readonly Hysteresis: number;
  /** @internal */
  readonly Acceleration: number;
  /** @internal */
  readonly VelocityMax: number;
}

/** @public */
export interface MomentumGesture<O = unknown, V extends View = View> extends PositionGesture<O, V> {
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
export const MomentumGesture = (function (_super: typeof PositionGesture) {
  const MomentumGesture = _super.extend("MomentumGesture", {
    observes: true,
  }) as MomentumGestureClass;

  MomentumGesture.prototype.createInput = function (this: MomentumGesture, inputId: string, inputType: GestureInputType, isPrimary: boolean,
                                                    x: number, y: number, t: number): MomentumGestureInput {
    return new MomentumGestureInput(inputId, inputType, isPrimary, x, y, t);
  };

  MomentumGesture.prototype.clearInput = function (this: MomentumGesture, input: MomentumGestureInput): void {
    if (!input.coasting) {
      PositionGesture.prototype.clearInput.call(this, input);
    }
  };

  MomentumGesture.prototype.clearInputs = function (this: MomentumGesture): void {
    PositionGesture.prototype.clearInputs.call(this);
    (this as Mutable<typeof this>).coastCount = 0;
  };

  MomentumGesture.prototype.resetInput = function (this: MomentumGesture, input: MomentumGestureInput): void {
    if (input.coasting) {
      this.endCoast(input, null);
    }
    PositionGesture.prototype.resetInput.call(this, input);
  };

  MomentumGesture.prototype.initHysteresis = function (this: MomentumGesture): number {
    let hysteresis = (Object.getPrototypeOf(this) as MomentumGesture).hysteresis as number | undefined;
    if (hysteresis === void 0) {
      hysteresis = MomentumGesture.Hysteresis;
    }
    return hysteresis;
  };

  MomentumGesture.prototype.initAcceleration = function (this: MomentumGesture): number {
    let acceleration = (Object.getPrototypeOf(this) as MomentumGesture).acceleration as number | undefined;
    if (acceleration === void 0) {
      acceleration = MomentumGesture.Acceleration;
    }
    return acceleration;
  };

  MomentumGesture.prototype.initVelocityMax = function (this: MomentumGesture): number {
    let velocityMax = (Object.getPrototypeOf(this) as MomentumGesture).velocityMax as number | undefined;
    if (velocityMax === void 0) {
      velocityMax = MomentumGesture.VelocityMax;
    }
    return velocityMax;
  };

  MomentumGesture.prototype.viewWillAnimate = function (this: MomentumGesture, view: View): void {
    this.doCoast(view.updateTime);
  };

  MomentumGesture.prototype.interrupt = function (this: MomentumGesture, event: Event | null): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      this.endCoast(input, event);
    }
  };

  MomentumGesture.prototype.cancel = function (this: MomentumGesture, event: Event | null): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      this.endPress(input, event);
      this.endCoast(input, event);
    }
  };

  MomentumGesture.prototype.startInteracting = function (this: MomentumGesture): void {
    this.willStartInteracting();
    this.onStartInteracting();
    this.didStartInteracting();
  };

  MomentumGesture.prototype.willStartInteracting = function (this: MomentumGesture): void {
    // hook
  };

  MomentumGesture.prototype.onStartInteracting = function (this: MomentumGesture): void {
    // hook
  };

  MomentumGesture.prototype.didStartInteracting = function (this: MomentumGesture): void {
    // hook
  };

  MomentumGesture.prototype.stopInteracting = function (this: MomentumGesture): void {
    this.willStopInteracting();
    this.onStopInteracting();
    this.didStopInteracting();
  };

  MomentumGesture.prototype.willStopInteracting = function (this: MomentumGesture): void {
    // hook
  };

  MomentumGesture.prototype.onStopInteracting = function (this: MomentumGesture): void {
    // hook
  };

  MomentumGesture.prototype.didStopInteracting = function (this: MomentumGesture): void {
    // hook
  };

  MomentumGesture.prototype.onStartPressing = function (this: MomentumGesture): void {
    PositionGesture.prototype.onStartPressing.call(this);
    if (this.coastCount === 0) {
      this.startInteracting();
    }
  };

  MomentumGesture.prototype.onStopPressing = function (this: MomentumGesture): void {
    PositionGesture.prototype.onStopPressing.call(this);
    if (this.coastCount === 0) {
      this.stopInteracting();
    }
  };

  MomentumGesture.prototype.beginPress = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): void {
    PositionGesture.prototype.beginPress.call(this, input, event);
    this.interrupt(event);
  };

  MomentumGesture.prototype.onBeginPress = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): void {
    PositionGesture.prototype.onBeginPress.call(this, input, event);
    input.updatePosition(this.hysteresis);
    input.deriveVelocity(this.velocityMax);
  };

  MomentumGesture.prototype.onMovePress = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): void {
    PositionGesture.prototype.onMovePress.call(this, input, event);
    input.updatePosition(this.hysteresis);
    input.deriveVelocity(this.velocityMax);
  };

  MomentumGesture.prototype.willEndPress = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): void {
    PositionGesture.prototype.willEndPress.call(this, input, event);
    this.beginCoast(input, event);
  };

  MomentumGesture.prototype.onEndPress = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): void {
    PositionGesture.prototype.onEndPress.call(this, input, event);
    input.updatePosition(this.hysteresis);
    input.deriveVelocity(this.velocityMax);
  };

  MomentumGesture.prototype.onCancelPress = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): void {
    PositionGesture.prototype.onCancelPress.call(this, input, event);
    input.updatePosition(this.hysteresis);
    input.deriveVelocity(this.velocityMax);
  };

  Object.defineProperty(MomentumGesture.prototype, "coasting", {
    get(this: MomentumGesture): boolean {
      return this.coastCount !== 0;
    },
    configurable: true,
  })

  MomentumGesture.prototype.startCoasting = function (this: MomentumGesture): void {
    this.willStartCoasting();
    this.onStartCoasting();
    this.didStartCoasting();
  };

  MomentumGesture.prototype.willStartCoasting = function (this: MomentumGesture): void {
    // hook
  };

  MomentumGesture.prototype.onStartCoasting = function (this: MomentumGesture): void {
    if (this.pressCount === 0) {
      this.startInteracting();
    }
    if (this.view !== null) {
      this.view.requireUpdate(View.NeedsAnimate);
    }
  };

  MomentumGesture.prototype.didStartCoasting = function (this: MomentumGesture): void {
    // hook
  };

  MomentumGesture.prototype.stopCoasting = function (this: MomentumGesture): void {
    this.willStopCoasting();
    this.onStopCoasting();
    this.didStopCoasting();
  };

  MomentumGesture.prototype.willStopCoasting = function (this: MomentumGesture): void {
    // hook
  };

  MomentumGesture.prototype.onStopCoasting = function (this: MomentumGesture): void {
    if (this.pressCount === 0) {
      this.stopInteracting();
    }
  };

  MomentumGesture.prototype.didStopCoasting = function (this: MomentumGesture): void {
    // hook
  };

  MomentumGesture.prototype.beginCoast = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): void {
    if (!input.coasting && (input.vx !== 0 || input.vy !== 0)) {
      const angle = Math.atan2(Math.abs(input.vy), Math.abs(input.vx));
      const a = this.acceleration;
      const ax = (input.vx < 0 ? a : input.vx > 0 ? -a : 0) * Math.cos(angle);
      const ay = (input.vy < 0 ? a : input.vy > 0 ? -a : 0) * Math.sin(angle);
      if (ax !== 0 || ay !== 0) {
        input.ax = ax;
        input.ay = ay;
        let allowCoast = this.willBeginCoast(input, event);
        if (allowCoast === void 0) {
          allowCoast = true;
        }
        if (allowCoast) {
          input.coasting = true;
          (this as Mutable<typeof this>).coastCount += 1;
          this.onBeginCoast(input, event);
          this.didBeginCoast(input, event);
          if (this.coastCount === 1) {
            this.startCoasting();
          }
        }
      }
    }
  };

  MomentumGesture.prototype.willBeginCoast = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): boolean | void {
    // hook
  };

  MomentumGesture.prototype.onBeginCoast = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): void {
    input.x0 = input.x;
    input.y0 = input.y;
    input.t0 = input.t;
    input.dx = 0;
    input.dy = 0;
    input.dt = 0;
  };

  MomentumGesture.prototype.didBeginCoast = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): void {
    // hook
  };

  MomentumGesture.prototype.endCoast = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): void {
    if (input.coasting) {
      this.willEndCoast(input, event);
      input.coasting = false;
      (this as Mutable<typeof this>).coastCount -= 1;
      this.onEndCoast(input, event);
      this.didEndCoast(input, event);
      if (this.coastCount === 0) {
        this.stopCoasting();
      }
      this.clearInput(input);
    }
  };

  MomentumGesture.prototype.willEndCoast = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): void {
    // hook
  };

  MomentumGesture.prototype.onEndCoast = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): void {
    // hook
  };

  MomentumGesture.prototype.didEndCoast = function (this: MomentumGesture, input: MomentumGestureInput, event: Event | null): void {
    // hook
  };

  MomentumGesture.prototype.doCoast = function (this: MomentumGesture, t: number): void {
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
  };

  MomentumGesture.prototype.willCoast = function (this: MomentumGesture): void {
    // hook
  };

  MomentumGesture.prototype.onCoast = function (this: MomentumGesture): void {
    // hook
  };

  MomentumGesture.prototype.didCoast = function (this: MomentumGesture): void {
    // hook
  };

  MomentumGesture.prototype.integrate = function (this: MomentumGesture, t: number): void {
    const inputs = this.inputs;
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      if (input.coasting) {
        input.integrateVelocity(t);
      }
    }
  };

  MomentumGesture.construct = function <G extends MomentumGesture<any, any>>(gesture: G | null, owner: FastenerOwner<G>): G {
    gesture = _super.construct.call(this, gesture, owner) as G;
    (gesture as Mutable<typeof gesture>).coastCount = 0;
    gesture.hysteresis = gesture.initHysteresis();
    gesture.acceleration = gesture.initAcceleration();
    gesture.velocityMax = gesture.initVelocityMax();
    return gesture;
  };

  MomentumGesture.specialize = function (template: MomentumGestureDescriptor<any>): MomentumGestureClass {
    let superClass = template.extends as MomentumGestureClass | null | undefined;
    if (superClass === void 0 || superClass === null) {
      const method = template.method;
      if (method === "pointer") {
        superClass = PointerMomentumGesture;
      } else if (method === "touch") {
        superClass = TouchMomentumGesture;
      } else if (method === "mouse") {
        superClass = MouseMomentumGesture;
      } else if (typeof PointerEvent !== "undefined") {
        superClass = PointerMomentumGesture;
      } else if (typeof TouchEvent !== "undefined") {
        superClass = TouchMomentumGesture;
      } else {
        superClass = MouseMomentumGesture;
      }
    }
    return superClass
  };

  (MomentumGesture as Mutable<typeof MomentumGesture>).Hysteresis = 67;
  (MomentumGesture as Mutable<typeof MomentumGesture>).Acceleration = 0.00175;
  (MomentumGesture as Mutable<typeof MomentumGesture>).VelocityMax = 1.75;

  return MomentumGesture;
})(PositionGesture);
