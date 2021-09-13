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
import {View} from "../View";
import type {ViewObserverType} from "../ViewObserver";
import type {GestureInputType} from "./GestureInput";
import {GestureContext} from "./GestureContext";
import {GestureMethod, GestureInit, Gesture} from "./Gesture";
import {PositionGestureInput} from "./PositionGestureInput";
import {MousePositionGesture} from "../"; // forward import
import {TouchPositionGesture} from "../"; // forward import
import {PointerPositionGesture} from "../"; // forward import

export interface PositionGestureInit<V extends View> extends GestureInit<V> {
  extends?: PositionGestureClass;

  willStartHovering?(): void;
  didStartHovering?(): void;
  willStopHovering?(): void;
  didStopHovering?(): void;

  willBeginHover?(input: PositionGestureInput, event: Event | null): void;
  didBeginHover?(input: PositionGestureInput, event: Event | null): void;
  willEndHover?(input: PositionGestureInput, event: Event | null): void;
  didEndHover?(input: PositionGestureInput, event: Event | null): void;

  willStartPressing?(): void;
  didStartPressing?(): void;
  willStopPressing?(): void;
  didStopPressing?(): void;

  willBeginPress?(input: PositionGestureInput, event: Event | null): boolean | void;
  didBeginPress?(input: PositionGestureInput, event: Event | null): void;

  willMovePress?(input: PositionGestureInput, event: Event | null): void;
  didMovePress?(input: PositionGestureInput, event: Event | null): void;

  willEndPress?(input: PositionGestureInput, event: Event | null): void;
  didEndPress?(input: PositionGestureInput, event: Event | null): void;

  willCancelPress?(input: PositionGestureInput, event: Event | null): void;
  didCancelPress?(input: PositionGestureInput, event: Event | null): void;

  willPress?(input: PositionGestureInput, event: Event | null): void;
  didPress?(input: PositionGestureInput, event: Event | null): void;

  willLongPress?(input: PositionGestureInput): void;
  didLongPress?(input: PositionGestureInput): void;
}

export type PositionGestureDescriptor<G extends GestureContext, V extends View, I = {}> = PositionGestureInit<V> & ThisType<PositionGesture<G, V> & I> & Partial<I>;

export interface PositionGestureConstructor<G extends GestureContext, V extends View, I = {}> {
  new<O extends G>(owner: O, gestureName: string | undefined): PositionGesture<O, V> & I;
  prototype: PositionGesture<any, any> & I;
}

export interface PositionGestureClass extends Function {
  readonly prototype: PositionGesture<any, any>;
}

export interface PositionGesture<G extends GestureContext, V extends View> extends Gesture<G, V> {
  /** @hidden */
  attachEvents(view: V): void;

  /** @hidden */
  detachEvents(view: V): void;

  /** @hidden */
  attachHoverEvents(view: V): void;

  /** @hidden */
  detachHoverEvents(view: V): void;

  /** @hidden */
  attachPressEvents(view: V): void;

  /** @hidden */
  detachPressEvents(view: V): void;

  readonly inputs: {readonly [inputId: string]: PositionGestureInput | undefined};

  getInput(inputId: string | number): PositionGestureInput | null;

  /** @hidden */
  createInput(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number): PositionGestureInput;

  /** @hidden */
  getOrCreateInput(inputId: string | number, inputType: GestureInputType, isPrimary: boolean,
                   x: number, y: number, t: number): PositionGestureInput;

  /** @hidden */
  clearInput(input: PositionGestureInput): void;

  /** @hidden */
  clearInputs(): void;

  readonly hoverCount: number;

  isHovering(): boolean;

  /** @hidden */
  startHovering(): void;

  /** @hidden */
  willStartHovering(): void;

  /** @hidden */
  onStartHovering(): void;

  /** @hidden */
  didStartHovering(): void;

  /** @hidden */
  stopHovering(): void;

  /** @hidden */
  willStopHovering(): void;

  /** @hidden */
  onStopHovering(): void;

  /** @hidden */
  didStopHovering(): void;

  beginHover(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  willBeginHover(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  onBeginHover(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  didBeginHover(input: PositionGestureInput, event: Event | null): void;

  endHover(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  willEndHover(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  onEndHover(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  didEndHover(input: PositionGestureInput, event: Event | null): void;

  readonly pressCount: number;

  isPressing(): boolean

  /** @hidden */
  startPressing(): void;

  /** @hidden */
  willStartPressing(): void;

  /** @hidden */
  onStartPressing(): void;

  /** @hidden */
  didStartPressing(): void;

  /** @hidden */
  stopPressing(): void;

  /** @hidden */
  willStopPressing(): void;

  /** @hidden */
  onStopPressing(): void;

  /** @hidden */
  didStopPressing(): void;

  beginPress(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  willBeginPress(input: PositionGestureInput, event: Event | null): boolean | void;

  /** @hidden */
  onBeginPress(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  didBeginPress(input: PositionGestureInput, event: Event | null): void;

  movePress(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  willMovePress(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  onMovePress(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  didMovePress(input: PositionGestureInput, event: Event | null): void;

  endPress(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  willEndPress(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  onEndPress(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  didEndPress(input: PositionGestureInput, event: Event | null): void;

  cancelPress(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  willCancelPress(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  onCancelPress(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  didCancelPress(input: PositionGestureInput, event: Event | null): void;

  press(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  willPress(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  onPress(input: PositionGestureInput, event: Event | null): void;

  /** @hidden */
  didPress(input: PositionGestureInput, event: Event | null): void;

  longPress(input: PositionGestureInput): void;

  /** @hidden */
  willLongPress(input: PositionGestureInput): void;

  /** @hidden */
  onLongPress(input: PositionGestureInput): void;

  /** @hidden */
  didLongPress(input: PositionGestureInput): void;
}

export const PositionGesture = function <G extends GestureContext, V extends View>(
    this: PositionGesture<G, V> | typeof PositionGesture,
    owner: G | PositionGestureDescriptor<G, V>,
    gestureName?: string,
  ): PositionGesture<G, V> | PropertyDecorator {
  if (this instanceof PositionGesture) { // constructor
    return PositionGestureConstructor.call(this as unknown as PositionGesture<GestureContext, View>, owner as G, gestureName);
  } else { // decorator factory
    return PositionGestureDecoratorFactory(owner as PositionGestureDescriptor<G, V>);
  }
} as {
  /** @hidden */
  new<G extends GestureContext, V extends View>(owner: G, gestureName: string | undefined): PositionGesture<G, V>;

  <G extends GestureContext, V extends View = View, I = {}>(descriptor: {observe: boolean} & PositionGestureDescriptor<G, V, I & ViewObserverType<V>>): PropertyDecorator;
  <G extends GestureContext, V extends View = View, I = {}>(descriptor: PositionGestureDescriptor<G, V, I>): PropertyDecorator;

  /** @hidden */
  prototype: PositionGesture<any, any>;

  /** @hidden */
  getClass(method: GestureMethod): PositionGestureClass;

  define<G extends GestureContext, V extends View = View, I = {}>(descriptor: {observe: boolean} & PositionGestureDescriptor<G, V, I & ViewObserverType<V>>): PositionGestureConstructor<G, V, I>;
  define<G extends GestureContext, V extends View = View, I = {}>(descriptor: PositionGestureDescriptor<G, V, I>): PositionGestureConstructor<G, V, I>;
};
__extends(PositionGesture, Gesture);

function PositionGestureConstructor<G extends GestureContext, V extends View>(this: PositionGesture<G, V>, owner: G, gestureName: string | undefined): PositionGesture<G, V> {
  const _this: PositionGesture<G, V> = (Gesture as Function).call(this, owner, gestureName) || this;
  Object.defineProperty(_this, "hoverCount", {
    value: 0,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(_this, "pressCount", {
    value: 0,
    enumerable: true,
    configurable: true,
  });
  return _this;
}

function PositionGestureDecoratorFactory<G extends GestureContext, V extends View>(descriptor: PositionGestureDescriptor<G, V>): PropertyDecorator {
  return GestureContext.decorateGesture.bind(View, PositionGesture.define(descriptor as PositionGestureDescriptor<GestureContext, View>));
}

PositionGesture.prototype.attachEvents = function (this: PositionGesture<GestureContext, View>, view: View): void {
  Gesture.prototype.attachEvents.call(this, view);
  this.attachHoverEvents(view);
};

PositionGesture.prototype.detachEvents = function (this: PositionGesture<GestureContext, View>, view: View): void {
  this.detachPressEvents(view);
  this.detachHoverEvents(view);
  Gesture.prototype.detachEvents.call(this, view);
};

PositionGesture.prototype.attachHoverEvents = function (this: PositionGesture<GestureContext, View>, view: View): void {
  // hook
};

PositionGesture.prototype.detachHoverEvents = function (this: PositionGesture<GestureContext, View>, view: View): void {
  // hook
};

PositionGesture.prototype.attachPressEvents = function (this: PositionGesture<GestureContext, View>, view: View): void {
  // hook
};

PositionGesture.prototype.detachPressEvents = function (this: PositionGesture<GestureContext, View>, view: View): void {
  // hook
};

PositionGesture.prototype.createInput = function (this: PositionGesture<GestureContext, View>, inputId: string, inputType: GestureInputType, isPrimary: boolean,
                                                  x: number, y: number, t: number): PositionGestureInput {
  return new PositionGestureInput(inputId, inputType, isPrimary, x, y, t);
};

PositionGesture.prototype.clearInput = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput): void {
  if (!input.hovering && !input.pressing) {
    Gesture.prototype.clearInput.call(this, input);
  }
};

PositionGesture.prototype.clearInputs = function (this: PositionGesture<GestureContext, View>): void {
  Gesture.prototype.clearInputs.call(this);
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
};

PositionGesture.prototype.isHovering = function (this: PositionGesture<GestureContext, View>): boolean {
  return this.hoverCount !== 0;
};

PositionGesture.prototype.startHovering = function (this: PositionGesture<GestureContext, View>): void {
  this.willStartHovering();
  this.onStartHovering();
  this.didStartHovering();
};

PositionGesture.prototype.willStartHovering = function (this: PositionGesture<GestureContext, View>): void {
  // hook
};

PositionGesture.prototype.onStartHovering = function (this: PositionGesture<GestureContext, View>): void {
  // hook
};

PositionGesture.prototype.didStartHovering = function (this: PositionGesture<GestureContext, View>): void {
  // hook
};

PositionGesture.prototype.stopHovering = function (this: PositionGesture<GestureContext, View>): void {
  this.willStopHovering();
  this.onStopHovering();
  this.didStopHovering();
};

PositionGesture.prototype.willStopHovering = function (this: PositionGesture<GestureContext, View>): void {
  // hook
};

PositionGesture.prototype.onStopHovering = function (this: PositionGesture<GestureContext, View>): void {
  // hook
};

PositionGesture.prototype.didStopHovering = function (this: PositionGesture<GestureContext, View>): void {
  // hook
};

PositionGesture.prototype.beginHover = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
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
};

PositionGesture.prototype.willBeginHover = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.onBeginHover = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.didBeginHover = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.endHover = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
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
};

PositionGesture.prototype.willEndHover = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.onEndHover = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.didEndHover = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.isPressing = function (this: PositionGesture<GestureContext, View>): boolean {
  return this.pressCount !== 0;
};

PositionGesture.prototype.startPressing = function (this: PositionGesture<GestureContext, View>): void {
  this.willStartPressing();
  this.onStartPressing();
  this.didStartPressing();
};

PositionGesture.prototype.willStartPressing = function (this: PositionGesture<GestureContext, View>): void {
  // hook
};

PositionGesture.prototype.onStartPressing = function (this: PositionGesture<GestureContext, View>): void {
  this.attachPressEvents(this.view!);
};

PositionGesture.prototype.didStartPressing = function (this: PositionGesture<GestureContext, View>): void {
  // hook
};

PositionGesture.prototype.stopPressing = function (this: PositionGesture<GestureContext, View>): void {
  this.willStopPressing();
  this.onStopPressing();
  this.didStopPressing();
};

PositionGesture.prototype.willStopPressing = function (this: PositionGesture<GestureContext, View>): void {
  // hook
};

PositionGesture.prototype.onStopPressing = function (this: PositionGesture<GestureContext, View>): void {
  this.detachPressEvents(this.view!);
};

PositionGesture.prototype.didStopPressing = function (this: PositionGesture<GestureContext, View>): void {
  // hook
};

PositionGesture.prototype.beginPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  if (!input.pressing) {
    let allowPress = this.willBeginPress(input, event);
    if (allowPress === void 0) {
      allowPress = true;
    }
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
};

PositionGesture.prototype.willBeginPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): boolean | void {
  // hook
};

PositionGesture.prototype.onBeginPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  input.x0 = input.x;
  input.y0 = input.y;
  input.t0 = input.t;
  input.dx = 0;
  input.dy = 0;
  input.dt = 0;
};

PositionGesture.prototype.didBeginPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.movePress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  if (input.pressing) {
    this.willMovePress(input, event);
    this.onMovePress(input, event);
    this.didMovePress(input, event);
  }
};

PositionGesture.prototype.willMovePress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.onMovePress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.didMovePress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.endPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
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
};

PositionGesture.prototype.willEndPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.onEndPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.didEndPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.cancelPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
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
};

PositionGesture.prototype.willCancelPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.onCancelPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.didCancelPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.press = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  this.willPress(input, event);
  this.onPress(input, event);
  this.didPress(input, event);
};

PositionGesture.prototype.willPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.onPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.didPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput, event: Event | null): void {
  // hook
};

PositionGesture.prototype.longPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput): void {
  input.clearHoldTimer();
  const dt = performance.now() - input.t0;
  if (dt < 1.5 * input.holdDelay && input.pressing) {
    this.willLongPress(input);
    this.onLongPress(input);
    this.didLongPress(input);
  }
};

PositionGesture.prototype.willLongPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput): void {
  // hook
};

PositionGesture.prototype.onLongPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput): void {
  const t = performance.now();
  input.dt = t - input.t;
  input.t = t;
};

PositionGesture.prototype.didLongPress = function (this: PositionGesture<GestureContext, View>, input: PositionGestureInput): void {
  // hook
};

PositionGesture.getClass = function (method: GestureMethod): PositionGestureClass {
  if (method === "pointer") {
    return PointerPositionGesture;
  } else if (method === "touch") {
    return TouchPositionGesture;
  } else if (method === "mouse") {
    return MousePositionGesture;
  } else if (typeof PointerEvent !== "undefined") {
    return PointerPositionGesture;
  } else if (typeof TouchEvent !== "undefined") {
    return TouchPositionGesture;
  } else {
    return MousePositionGesture;
  }
};

PositionGesture.define = function <G extends GestureContext, V extends View, I>(descriptor: PositionGestureDescriptor<G, V, I>): PositionGestureConstructor<G, V, I> {
  let _super: PositionGestureClass | null | undefined = descriptor.extends;
  let method = descriptor.method;
  delete descriptor.extends;
  delete descriptor.method;

  if (method === void 0) {
    method = "auto";
  }
  if (_super === void 0) {
    _super = PositionGesture.getClass(method);
  }

  const _constructor = function DecoratedPositionGesture(this: PositionGesture<G, V>, owner: G, gestureName: string | undefined): PositionGesture<G, V> {
    let _this: PositionGesture<G, V> = function PositionGestureAccessor(view?: V | null, targetView?: View | null): V | null | G {
      if (view === void 0) {
        return _this.view;
      } else {
        _this.setView(view, targetView);
        return _this.owner;
      }
    } as PositionGesture<G, V>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, gestureName) || _this;
    return _this;
  } as unknown as PositionGestureConstructor<G, V, I>;

  const _prototype = descriptor as unknown as PositionGesture<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};
