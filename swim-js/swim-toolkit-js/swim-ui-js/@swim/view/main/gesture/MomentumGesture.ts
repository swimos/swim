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

import {__extends} from "tslib";
import type {ViewContext} from "../ViewContext";
import {View} from "../View";
import type {ViewObserverType} from "../ViewObserver";
import type {GestureInputType} from "./GestureInput";
import {GestureContext} from "./GestureContext";
import type {GestureMethod} from "./Gesture";
import {PositionGestureInit, PositionGesture} from "./PositionGesture";
import {MomentumGestureInput} from "./MomentumGestureInput";
import {MouseMomentumGesture} from "../"; // forward import
import {TouchMomentumGesture} from "../"; // forward import
import {PointerMomentumGesture} from "../"; // forward import

export interface MomentumGestureInit<V extends View> extends PositionGestureInit<V> {
  extends?: MomentumGestureClass;

  /**
   * The time delta for velocity derivation, in milliseconds.
   */
  hysteresis?: number;

  /**
   * The magnitude of the deceleration on coasting input points in,
   * pixels/millisecond^2. An acceleration of zero disables coasting.
   */
  acceleration?: number;

  /**
   * The maximum magnitude of the velocity of coasting input points,
   * in pixels/millisecond.
   */
  velocityMax?: number;

  willBeginHover?(input: MomentumGestureInput, event: Event | null): void;
  didBeginHover?(input: MomentumGestureInput, event: Event | null): void;
  willEndHover?(input: MomentumGestureInput, event: Event | null): void;
  didEndHover?(input: MomentumGestureInput, event: Event | null): void;

  willStartInteracting?(): void;
  didStartInteracting?(): void;
  willStopInteracting?(): void;
  didStopInteracting?(): void;

  willBeginPress?(input: MomentumGestureInput, event: Event | null): boolean | void;
  didBeginPress?(input: MomentumGestureInput, event: Event | null): void;

  willMovePress?(input: MomentumGestureInput, event: Event | null): void;
  didMovePress?(input: MomentumGestureInput, event: Event | null): void;

  willEndPress?(input: MomentumGestureInput, event: Event | null): void;
  didEndPress?(input: MomentumGestureInput, event: Event | null): void;

  willCancelPress?(input: MomentumGestureInput, event: Event | null): void;
  didCancelPress?(input: MomentumGestureInput, event: Event | null): void;

  willPress?(input: MomentumGestureInput, event: Event | null): void;
  didPress?(input: MomentumGestureInput, event: Event | null): void;

  willLongPress?(input: MomentumGestureInput): void;
  didLongPress?(input: MomentumGestureInput): void;

  willStartCoasting?(): void;
  didStartCoasting?(): void;
  willStopCoasting?(): void;
  didStopCoasting?(): void;

  willBeginCoast?(input: MomentumGestureInput, event: Event | null): boolean | void;
  didBeginCoast?(input: MomentumGestureInput, event: Event | null): void;
  willEndCoast?(input: MomentumGestureInput, event: Event | null): void;
  didEndCoast?(input: MomentumGestureInput, event: Event | null): void;

  willCoast?(): void;
  didCoast?(): void;
}

export type MomentumGestureDescriptor<G extends GestureContext, V extends View, I = {}> = MomentumGestureInit<V> & ThisType<MomentumGesture<G, V> & I> & Partial<I>;

export interface MomentumGestureConstructor<G extends GestureContext, V extends View, I = {}> {
  new<O extends G>(owner: O, gestureName: string | undefined): MomentumGesture<O, V> & I;
  prototype: MomentumGesture<any, any> & I;
}

export interface MomentumGestureClass extends Function {
  readonly prototype: MomentumGesture<any, any>;
}

export interface MomentumGesture<G extends GestureContext, V extends View> extends PositionGesture<G, V> {
  readonly inputs: {readonly [inputId: string]: MomentumGestureInput | undefined};

  getInput(inputId: string | number): MomentumGestureInput | null;

  /** @hidden */
  createInput(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number): MomentumGestureInput;

  /** @hidden */
  getOrCreateInput(inputId: string | number, inputType: GestureInputType, isPrimary: boolean,
                   x: number, y: number, t: number): MomentumGestureInput;

  /** @hidden */
  clearInput(input: MomentumGestureInput): void;

  /** @hidden */
  clearInputs(): void;

  hysteresis: number;

  acceleration: number;

  velocityMax: number;

  /** @hidden */
  viewWillAnimate(viewContext: ViewContext): void;

  interrupt(event: Event | null): void;

  cancel(event: Event | null): void;

  /** @hidden */
  startInteracting(): void;

  /** @hidden */
  willStartInteracting(): void;

  /** @hidden */
  onStartInteracting(): void;

  /** @hidden */
  didStartInteracting(): void;

  /** @hidden */
  stopInteracting(): void;

  /** @hidden */
  willStopInteracting(): void;

  /** @hidden */
  onStopInteracting(): void;

  /** @hidden */
  didStopInteracting(): void;

  /** @hidden */
  onStartPressing(): void;

  /** @hidden */
  onStopPressing(): void;

  beginPress(input: MomentumGestureInput, event: Event | null): void;

  /** @hidden */
  onBeginPress(input: MomentumGestureInput, event: Event | null): void;

  /** @hidden */
  onMovePress(input: MomentumGestureInput, event: Event | null): void;

  /** @hidden */
  willEndPress(input: MomentumGestureInput, event: Event | null): void;

  /** @hidden */
  onEndPress(input: MomentumGestureInput, event: Event | null): void;

  /** @hidden */
  onCancelPress(input: MomentumGestureInput, event: Event | null): void;

  readonly coastCount: number;

  isCoasting(): boolean;

  /** @hidden */
  startCoasting(): void;

  /** @hidden */
  willStartCoasting(): void;

  /** @hidden */
  onStartCoasting(): void;

  /** @hidden */
  didStartCoasting(): void;

  /** @hidden */
  stopCoasting(): void;

  /** @hidden */
  willStopCoasting(): void;

  /** @hidden */
  onStopCoasting(): void;

  /** @hidden */
  didStopCoasting(): void;

  beginCoast(input: MomentumGestureInput, event: Event | null): void;

  /** @hidden */
  willBeginCoast(input: MomentumGestureInput, event: Event | null): boolean | void;

  /** @hidden */
  onBeginCoast(input: MomentumGestureInput, event: Event | null): void;

  /** @hidden */
  didBeginCoast(input: MomentumGestureInput, event: Event | null): void;

  endCoast(input: MomentumGestureInput, event: Event | null): void;

  /** @hidden */
  willEndCoast(input: MomentumGestureInput, event: Event | null): void;

  /** @hidden */
  onEndCoast(input: MomentumGestureInput, event: Event | null): void;

  /** @hidden */
  didEndCoast(input: MomentumGestureInput, event: Event | null): void;

  /** @hidden */
  doCoast(t: number): void;

  /** @hidden */
  willCoast(): void;

  /** @hidden */
  onCoast(): void;

  /** @hidden */
  didCoast(): void;

  /** @hidden */
  integrate(t: number): void;
}

export const MomentumGesture = function <G extends GestureContext, V extends View>(
    this: MomentumGesture<G, V> | typeof MomentumGesture,
    owner: G | MomentumGestureDescriptor<G, V>,
    gestureName?: string,
  ): MomentumGesture<G, V> | PropertyDecorator {
  if (this instanceof MomentumGesture) { // constructor
    return MomentumGestureConstructor.call(this as unknown as MomentumGesture<GestureContext, View>, owner as G, gestureName);
  } else { // decorator factory
    return MomentumGestureDecoratorFactory(owner as MomentumGestureDescriptor<G, V>);
  }
} as {
  /** @hidden */
  new<G extends GestureContext, V extends View>(owner: G, gestureName: string | undefined): MomentumGesture<G, V>;

  <G extends GestureContext, V extends View = View, I = {}>(descriptor: {observe: boolean} & MomentumGestureDescriptor<G, V, I & ViewObserverType<V>>): PropertyDecorator;
  <G extends GestureContext, V extends View = View, I = {}>(descriptor: MomentumGestureDescriptor<G, V, I>): PropertyDecorator;

  /** @hidden */
  prototype: MomentumGesture<any, any>;

  /** @hidden */
  getClass(method: GestureMethod): MomentumGestureClass;

  define<G extends GestureContext, V extends View = View, I = {}>(descriptor: {observe: boolean} & MomentumGestureDescriptor<G, V, I & ViewObserverType<V>>): MomentumGestureConstructor<G, V, I>;
  define<G extends GestureContext, V extends View = View, I = {}>(descriptor: MomentumGestureDescriptor<G, V, I>): MomentumGestureConstructor<G, V, I>;

  /** @hidden */
  hysteresis: number;

  /** @hidden */
  acceleration: number;

  /** @hidden */
  velocityMax: number;
};
__extends(MomentumGesture, PositionGesture);

function MomentumGestureConstructor<G extends GestureContext, V extends View>(this: MomentumGesture<G, V>, owner: G, gestureName: string | undefined): MomentumGesture<G, V> {
  const _this: MomentumGesture<G, V> = (PositionGesture as Function).call(this, owner, gestureName) || this;
  Object.defineProperty(this, "coastCount", {
    value: 0,
    enumerable: true,
    configurable: true,
  });
  this.hysteresis = MomentumGesture.hysteresis;
  this.acceleration = MomentumGesture.acceleration;
  this.velocityMax = MomentumGesture.velocityMax;
  return _this;
}

function MomentumGestureDecoratorFactory<G extends GestureContext, V extends View>(descriptor: MomentumGestureDescriptor<G, V>): PropertyDecorator {
  return GestureContext.decorateGesture.bind(View, MomentumGesture.define(descriptor as MomentumGestureDescriptor<GestureContext, View>));
}

Object.defineProperty(MomentumGesture.prototype, "observe", {
  value: true,
  enumerable: true,
  configurable: true,
});

MomentumGesture.prototype.createInput = function (this: MomentumGesture<GestureContext, View>, inputId: string, inputType: GestureInputType, isPrimary: boolean,
                                                  x: number, y: number, t: number): MomentumGestureInput {
  return new MomentumGestureInput(inputId, inputType, isPrimary, x, y, t);
};

MomentumGesture.prototype.clearInput = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput): void {
  if (!input.coasting) {
    PositionGesture.prototype.clearInput.call(this, input);
  }
};

MomentumGesture.prototype.clearInputs = function (this: MomentumGesture<GestureContext, View>): void {
  PositionGesture.prototype.clearInputs.call(this);
  Object.defineProperty(this, "coastCount", {
    value: 0,
    enumerable: true,
    configurable: true,
  });
};

MomentumGesture.prototype.viewWillAnimate = function (this: MomentumGesture<GestureContext, View>, viewContext: ViewContext): void {
  this.doCoast(viewContext.updateTime);
};

MomentumGesture.prototype.interrupt = function (this: MomentumGesture<GestureContext, View>, event: Event | null): void {
  const inputs = this.inputs;
  for (const inputId in inputs) {
    const input = inputs[inputId]!;
    this.endCoast(input, event);
  }
};

MomentumGesture.prototype.cancel = function (this: MomentumGesture<GestureContext, View>, event: Event | null): void {
  const inputs = this.inputs;
  for (const inputId in inputs) {
    const input = inputs[inputId]!;
    this.endPress(input, event);
    this.endCoast(input, event);
  }
};

MomentumGesture.prototype.startInteracting = function (this: MomentumGesture<GestureContext, View>): void {
  this.willStartInteracting();
  this.onStartInteracting();
  this.didStartInteracting();
};

MomentumGesture.prototype.willStartInteracting = function (this: MomentumGesture<GestureContext, View>): void {
  // hook
};

MomentumGesture.prototype.onStartInteracting = function (this: MomentumGesture<GestureContext, View>): void {
  // hook
};

MomentumGesture.prototype.didStartInteracting = function (this: MomentumGesture<GestureContext, View>): void {
  // hook
};

MomentumGesture.prototype.stopInteracting = function (this: MomentumGesture<GestureContext, View>): void {
  this.willStopInteracting();
  this.onStopInteracting();
  this.didStopInteracting();
};

MomentumGesture.prototype.willStopInteracting = function (this: MomentumGesture<GestureContext, View>): void {
  // hook
};

MomentumGesture.prototype.onStopInteracting = function (this: MomentumGesture<GestureContext, View>): void {
  // hook
};

MomentumGesture.prototype.didStopInteracting = function (this: MomentumGesture<GestureContext, View>): void {
  // hook
};

MomentumGesture.prototype.onStartPressing = function (this: MomentumGesture<GestureContext, View>): void {
  PositionGesture.prototype.onStartPressing.call(this);
  if (this.coastCount === 0) {
    this.startInteracting();
  }
};

MomentumGesture.prototype.onStopPressing = function (this: MomentumGesture<GestureContext, View>): void {
  PositionGesture.prototype.onStopPressing.call(this);
  if (this.coastCount === 0) {
    this.stopInteracting();
  }
};

MomentumGesture.prototype.beginPress = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): void {
  PositionGesture.prototype.beginPress.call(this, input, event);
  this.interrupt(event);
};

MomentumGesture.prototype.onBeginPress = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): void {
  PositionGesture.prototype.onBeginPress.call(this, input, event);
  input.updatePosition(this.hysteresis);
  input.deriveVelocity(this.velocityMax);
};

MomentumGesture.prototype.onMovePress = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): void {
  PositionGesture.prototype.onMovePress.call(this, input, event);
  input.updatePosition(this.hysteresis);
  input.deriveVelocity(this.velocityMax);
};

MomentumGesture.prototype.willEndPress = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): void {
  PositionGesture.prototype.willEndPress.call(this, input, event);
  this.beginCoast(input, event);
};

MomentumGesture.prototype.onEndPress = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): void {
  PositionGesture.prototype.onEndPress.call(this, input, event);
  input.updatePosition(this.hysteresis);
  input.deriveVelocity(this.velocityMax);
};

MomentumGesture.prototype.onCancelPress = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): void {
  PositionGesture.prototype.onCancelPress.call(this, input, event);
  input.updatePosition(this.hysteresis);
  input.deriveVelocity(this.velocityMax);
};

MomentumGesture.prototype.isCoasting = function (this: MomentumGesture<GestureContext, View>): boolean {
  return this.coastCount !== 0;
};

MomentumGesture.prototype.startCoasting = function (this: MomentumGesture<GestureContext, View>): void {
  this.willStartCoasting();
  this.onStartCoasting();
  this.didStartCoasting();
};

MomentumGesture.prototype.willStartCoasting = function (this: MomentumGesture<GestureContext, View>): void {
  // hook
};

MomentumGesture.prototype.onStartCoasting = function (this: MomentumGesture<GestureContext, View>): void {
  if (this.pressCount === 0) {
    this.startInteracting();
  }
  if (this.view !== null) {
    this.view.requireUpdate(View.NeedsAnimate);
  }
};

MomentumGesture.prototype.didStartCoasting = function (this: MomentumGesture<GestureContext, View>): void {
  // hook
};

MomentumGesture.prototype.stopCoasting = function (this: MomentumGesture<GestureContext, View>): void {
  this.willStopCoasting();
  this.onStopCoasting();
  this.didStopCoasting();
};

MomentumGesture.prototype.willStopCoasting = function (this: MomentumGesture<GestureContext, View>): void {
  // hook
};

MomentumGesture.prototype.onStopCoasting = function (this: MomentumGesture<GestureContext, View>): void {
  if (this.pressCount === 0) {
    this.stopInteracting();
  }
};

MomentumGesture.prototype.didStopCoasting = function (this: MomentumGesture<GestureContext, View>): void {
  // hook
};

MomentumGesture.prototype.beginCoast = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): void {
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
};

MomentumGesture.prototype.willBeginCoast = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): boolean | void {
  // hook
};

MomentumGesture.prototype.onBeginCoast = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): void {
  input.x0 = input.x;
  input.y0 = input.y;
  input.t0 = input.t;
  input.dx = 0;
  input.dy = 0;
  input.dt = 0;
};

MomentumGesture.prototype.didBeginCoast = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): void {
  // hook
};

MomentumGesture.prototype.endCoast = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): void {
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
};

MomentumGesture.prototype.willEndCoast = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): void {
  // hook
};

MomentumGesture.prototype.onEndCoast = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): void {
  // hook
};

MomentumGesture.prototype.didEndCoast = function (this: MomentumGesture<GestureContext, View>, input: MomentumGestureInput, event: Event | null): void {
  // hook
};

MomentumGesture.prototype.doCoast = function(this: MomentumGesture<GestureContext, View>, t: number): void {
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

MomentumGesture.prototype.willCoast = function(this: MomentumGesture<GestureContext, View>): void {
  // hook
};

MomentumGesture.prototype.onCoast = function(this: MomentumGesture<GestureContext, View>): void {
  // hook
};

MomentumGesture.prototype.didCoast = function(this: MomentumGesture<GestureContext, View>): void {
  // hook
};

MomentumGesture.prototype.integrate = function(this: MomentumGesture<GestureContext, View>, t: number): void {
  const inputs = this.inputs;
  for (const inputId in inputs) {
    const input = inputs[inputId]!;
    if (input.coasting) {
      input.integrateVelocity(t);
    }
  }
};

MomentumGesture.getClass = function (method: GestureMethod): MomentumGestureClass {
  if (method === "pointer") {
    return PointerMomentumGesture;
  } else if (method === "touch") {
    return TouchMomentumGesture;
  } else if (method === "mouse") {
    return MouseMomentumGesture;
  } else if (typeof PointerEvent !== "undefined") {
    return PointerMomentumGesture;
  } else if (typeof TouchEvent !== "undefined") {
    return TouchMomentumGesture;
  } else {
    return MouseMomentumGesture;
  }
};

MomentumGesture.define = function <G extends GestureContext, V extends View, I>(descriptor: MomentumGestureDescriptor<G, V, I>): MomentumGestureConstructor<G, V, I> {
  let _super: MomentumGestureClass | null | undefined = descriptor.extends;
  let method = descriptor.method;
  const hysteresis = descriptor.hysteresis;
  const acceleration = descriptor.hysteresis;
  const velocityMax = descriptor.hysteresis;
  delete descriptor.extends;
  delete descriptor.method;
  delete descriptor.hysteresis;
  delete descriptor.acceleration;
  delete descriptor.velocityMax;

  if (method === void 0) {
    method = "auto";
  }
  if (_super === void 0) {
    _super = MomentumGesture.getClass(method);
  }

  const _constructor = function DecoratedMomentumGesture(this: MomentumGesture<G, V>, owner: G, gestureName: string | undefined): MomentumGesture<G, V> {
    let _this: MomentumGesture<G, V> = function MomentumGestureAccessor(view?: V | null, targetView?: View | null): V | null | G {
      if (view === void 0) {
        return _this.view;
      } else {
        _this.setView(view, targetView);
        return _this.owner;
      }
    } as MomentumGesture<G, V>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, gestureName) || _this;
    if (hysteresis !== void 0) {
      this.hysteresis = hysteresis;
    }
    if (acceleration !== void 0) {
      this.acceleration = acceleration;
    }
    if (velocityMax !== void 0) {
      this.velocityMax = velocityMax;
    }
    return _this;
  } as unknown as MomentumGestureConstructor<G, V, I>;

  const _prototype = descriptor as unknown as MomentumGesture<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};

MomentumGesture.hysteresis = 67;
MomentumGesture.acceleration = 0.00175;
MomentumGesture.velocityMax = 1.75;
