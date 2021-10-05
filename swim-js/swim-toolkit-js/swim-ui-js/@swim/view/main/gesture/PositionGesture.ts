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

import type {Mutable, ObserverType} from "@swim/util";
import type {FastenerOwner} from "@swim/fastener";
import type {GestureInputType} from "./GestureInput";
import {GestureMethod, GestureInit, GestureClass, Gesture} from "./Gesture";
import {PositionGestureInput} from "./PositionGestureInput";
import {MousePositionGesture} from "./"; // forward import
import {TouchPositionGesture} from "./"; // forward import
import {PointerPositionGesture} from "./"; // forward import
import type {View} from "../view/View";

export interface PositionGestureInit<V extends View = View> extends GestureInit<V> {
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

export type PositionGestureDescriptor<O = unknown, V extends View = View, I = {}> = ThisType<PositionGesture<O, V> & I> & PositionGestureInit<V> & Partial<I>;

export interface PositionGestureClass<G extends PositionGesture<any, any> = PositionGesture<any, any>> extends GestureClass<G> {
  create(this: PositionGestureClass<G>, owner: FastenerOwner<G>, gestureName: string): G;

  construct(gestureClass: PositionGestureClass, fastener: G | null, owner: FastenerOwner<G>, gestureName: string): G;

  specialize(method: GestureMethod): PositionGestureClass | null;

  extend(this: PositionGestureClass<G>, classMembers?: {} | null): PositionGestureClass<G>;

  define<O, V extends View = View, I = {}>(descriptor: {observes: boolean} & PositionGestureDescriptor<O, V, I & ObserverType<V>>): PositionGestureClass<PositionGesture<any, V> & I>;
  define<O, V extends View = View, I = {}>(descriptor: PositionGestureDescriptor<O, V, I>): PositionGestureClass<PositionGesture<any, V> & I>;

  <O, V extends View = View, I = {}>(descriptor: {observes: boolean} & PositionGestureDescriptor<O, V, I & ObserverType<V>>): PropertyDecorator;
  <O, V extends View = View, I = {}>(descriptor: PositionGestureDescriptor<O, V, I>): PropertyDecorator;
}

export interface PositionGesture<O = unknown, V extends View = View> extends Gesture<O, V> {
  /** @internal @protected @override */
  attachEvents(view: V): void;

  /** @internal @protected @override */
  detachEvents(view: V): void;

  /** @internal @protected */
  attachHoverEvents(view: V): void;

  /** @internal @protected */
  detachHoverEvents(view: V): void;

  /** @internal @protected */
  attachPressEvents(view: V): void;

  /** @internal @protected */
  detachPressEvents(view: V): void;

  /** @internal @override */
  readonly inputs: {readonly [inputId: string]: PositionGestureInput | undefined};

  /** @override */
  getInput(inputId: string | number): PositionGestureInput | null;

  /** @internal @override */
  createInput(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number): PositionGestureInput;

  /** @internal */
  getOrCreateInput(inputId: string | number, inputType: GestureInputType, isPrimary: boolean,
                   x: number, y: number, t: number): PositionGestureInput;

  /** @internal @override */
  clearInput(input: PositionGestureInput): void;

  /** @internal @override */
  clearInputs(): void;

  readonly hoverCount: number;

  get hovering(): boolean;

  /** @internal */
  startHovering(): void;

  /** @protected */
  willStartHovering(): void;

  /** @protected */
  onStartHovering(): void;

  /** @protected */
  didStartHovering(): void;

  /** @internal */
  stopHovering(): void;

  /** @protected */
  willStopHovering(): void;

  /** @protected */
  onStopHovering(): void;

  /** @protected */
  didStopHovering(): void;

  /** @internal */
  beginHover(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  willBeginHover(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  onBeginHover(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  didBeginHover(input: PositionGestureInput, event: Event | null): void;

  /** @internal */
  endHover(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  willEndHover(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  onEndHover(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  didEndHover(input: PositionGestureInput, event: Event | null): void;

  readonly pressCount: number;

  get pressing(): boolean

  /** @internal */
  startPressing(): void;

  /** @protected */
  willStartPressing(): void;

  /** @protected */
  onStartPressing(): void;

  /** @protected */
  didStartPressing(): void;

  /** @internal */
  stopPressing(): void;

  /** @protected */
  willStopPressing(): void;

  /** @protected */
  onStopPressing(): void;

  /** @protected */
  didStopPressing(): void;

  /** @internal */
  beginPress(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  willBeginPress(input: PositionGestureInput, event: Event | null): boolean | void;

  /** @protected */
  onBeginPress(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  didBeginPress(input: PositionGestureInput, event: Event | null): void;

  /** @internal */
  movePress(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  willMovePress(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  onMovePress(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  didMovePress(input: PositionGestureInput, event: Event | null): void;

  /** @internal */
  endPress(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  willEndPress(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  onEndPress(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  didEndPress(input: PositionGestureInput, event: Event | null): void;

  /** @internal */
  cancelPress(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  willCancelPress(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  onCancelPress(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  didCancelPress(input: PositionGestureInput, event: Event | null): void;

  /** @internal */
  press(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  willPress(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  onPress(input: PositionGestureInput, event: Event | null): void;

  /** @protected */
  didPress(input: PositionGestureInput, event: Event | null): void;

  /** @internal */
  longPress(input: PositionGestureInput): void;

  /** @protected */
  willLongPress(input: PositionGestureInput): void;

  /** @protected */
  onLongPress(input: PositionGestureInput): void;

  /** @protected */
  didLongPress(input: PositionGestureInput): void;
}

export const PositionGesture = (function (_super: typeof Gesture) {
  const PositionGesture = _super.extend() as PositionGestureClass;

  PositionGesture.prototype.attachEvents = function (this: PositionGesture, view: View): void {
    Gesture.prototype.attachEvents.call(this, view);
    this.attachHoverEvents(view);
  };

  PositionGesture.prototype.detachEvents = function (this: PositionGesture, view: View): void {
    this.detachPressEvents(view);
    this.detachHoverEvents(view);
    Gesture.prototype.detachEvents.call(this, view);
  };

  PositionGesture.prototype.attachHoverEvents = function (this: PositionGesture, view: View): void {
    // hook
  };

  PositionGesture.prototype.detachHoverEvents = function (this: PositionGesture, view: View): void {
    // hook
  };

  PositionGesture.prototype.attachPressEvents = function (this: PositionGesture, view: View): void {
    // hook
  };

  PositionGesture.prototype.detachPressEvents = function (this: PositionGesture, view: View): void {
    // hook
  };

  PositionGesture.prototype.createInput = function (this: PositionGesture, inputId: string, inputType: GestureInputType, isPrimary: boolean,
                                                    x: number, y: number, t: number): PositionGestureInput {
    return new PositionGestureInput(inputId, inputType, isPrimary, x, y, t);
  };

  PositionGesture.prototype.clearInput = function (this: PositionGesture, input: PositionGestureInput): void {
    if (!input.hovering && !input.pressing) {
      Gesture.prototype.clearInput.call(this, input);
    }
  };

  PositionGesture.prototype.clearInputs = function (this: PositionGesture): void {
    Gesture.prototype.clearInputs.call(this);
    (this as Mutable<typeof this>).hoverCount = 0;
    (this as Mutable<typeof this>).pressCount = 0;
  };

  Object.defineProperty(PositionGesture.prototype, "hovering", {
    get(this: PositionGesture): boolean {
      return this.hoverCount !== 0;
    },
    configurable: true,
  })

  PositionGesture.prototype.startHovering = function (this: PositionGesture): void {
    this.willStartHovering();
    this.onStartHovering();
    this.didStartHovering();
  };

  PositionGesture.prototype.willStartHovering = function (this: PositionGesture): void {
    // hook
  };

  PositionGesture.prototype.onStartHovering = function (this: PositionGesture): void {
    // hook
  };

  PositionGesture.prototype.didStartHovering = function (this: PositionGesture): void {
    // hook
  };

  PositionGesture.prototype.stopHovering = function (this: PositionGesture): void {
    this.willStopHovering();
    this.onStopHovering();
    this.didStopHovering();
  };

  PositionGesture.prototype.willStopHovering = function (this: PositionGesture): void {
    // hook
  };

  PositionGesture.prototype.onStopHovering = function (this: PositionGesture): void {
    // hook
  };

  PositionGesture.prototype.didStopHovering = function (this: PositionGesture): void {
    // hook
  };

  PositionGesture.prototype.beginHover = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    if (!input.hovering) {
      this.willBeginHover(input, event);
      input.hovering = true;
      (this as Mutable<typeof this>).hoverCount += 1;
      this.onBeginHover(input, event);
      this.didBeginHover(input, event);
      if (this.hoverCount === 1) {
        this.startHovering();
      }
    }
  };

  PositionGesture.prototype.willBeginHover = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.onBeginHover = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.didBeginHover = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.endHover = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    if (input.hovering) {
      this.willEndHover(input, event);
      input.hovering = false;
      (this as Mutable<typeof this>).hoverCount -= 1;
      this.onEndHover(input, event);
      this.didEndHover(input, event);
      if (this.hoverCount === 0) {
        this.stopHovering();
      }
      this.clearInput(input);
    }
  };

  PositionGesture.prototype.willEndHover = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.onEndHover = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.didEndHover = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  Object.defineProperty(PositionGesture.prototype, "pressing", {
    get(this: PositionGesture): boolean {
      return this.pressCount !== 0;
    },
    configurable: true,
  })

  PositionGesture.prototype.startPressing = function (this: PositionGesture): void {
    this.willStartPressing();
    this.onStartPressing();
    this.didStartPressing();
  };

  PositionGesture.prototype.willStartPressing = function (this: PositionGesture): void {
    // hook
  };

  PositionGesture.prototype.onStartPressing = function (this: PositionGesture): void {
    this.attachPressEvents(this.view!);
  };

  PositionGesture.prototype.didStartPressing = function (this: PositionGesture): void {
    // hook
  };

  PositionGesture.prototype.stopPressing = function (this: PositionGesture): void {
    this.willStopPressing();
    this.onStopPressing();
    this.didStopPressing();
  };

  PositionGesture.prototype.willStopPressing = function (this: PositionGesture): void {
    // hook
  };

  PositionGesture.prototype.onStopPressing = function (this: PositionGesture): void {
    this.detachPressEvents(this.view!);
  };

  PositionGesture.prototype.didStopPressing = function (this: PositionGesture): void {
    // hook
  };

  PositionGesture.prototype.beginPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    if (!input.pressing) {
      let allowPress = this.willBeginPress(input, event);
      if (allowPress === void 0) {
        allowPress = true;
      }
      if (allowPress) {
        input.pressing = true;
        input.defaultPrevented = false;
        (this as Mutable<typeof this>).pressCount += 1;
        this.onBeginPress(input, event);
        input.setHoldTimer(this.longPress.bind(this, input));
        this.didBeginPress(input, event);
        if (this.pressCount === 1) {
          this.startPressing();
        }
      }
    }
  };

  PositionGesture.prototype.willBeginPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): boolean | void {
    // hook
  };

  PositionGesture.prototype.onBeginPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    input.x0 = input.x;
    input.y0 = input.y;
    input.t0 = input.t;
    input.dx = 0;
    input.dy = 0;
    input.dt = 0;
  };

  PositionGesture.prototype.didBeginPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.movePress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    if (input.pressing) {
      this.willMovePress(input, event);
      this.onMovePress(input, event);
      this.didMovePress(input, event);
    }
  };

  PositionGesture.prototype.willMovePress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.onMovePress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.didMovePress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.endPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    input.clearHoldTimer();
    if (input.pressing) {
      this.willEndPress(input, event);
      input.pressing = false;
      (this as Mutable<typeof this>).pressCount -= 1;
      this.onEndPress(input, event);
      this.didEndPress(input, event);
      if (this.pressCount === 0) {
        this.stopPressing();
      }
      this.clearInput(input);
    }
  };

  PositionGesture.prototype.willEndPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.onEndPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.didEndPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.cancelPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    input.clearHoldTimer();
    if (input.pressing) {
      this.willCancelPress(input, event);
      input.pressing = false;
      (this as Mutable<typeof this>).pressCount -= 1;
      this.onCancelPress(input, event);
      this.didCancelPress(input, event);
      if (this.pressCount === 0) {
        this.stopPressing();
      }
      this.clearInput(input);
    }
  };

  PositionGesture.prototype.willCancelPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.onCancelPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.didCancelPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.press = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    this.willPress(input, event);
    this.onPress(input, event);
    this.didPress(input, event);
  };

  PositionGesture.prototype.willPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.onPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.didPress = function (this: PositionGesture, input: PositionGestureInput, event: Event | null): void {
    // hook
  };

  PositionGesture.prototype.longPress = function (this: PositionGesture, input: PositionGestureInput): void {
    input.clearHoldTimer();
    const dt = performance.now() - input.t0;
    if (dt < 1.5 * input.holdDelay && input.pressing) {
      this.willLongPress(input);
      this.onLongPress(input);
      this.didLongPress(input);
    }
  };

  PositionGesture.prototype.willLongPress = function (this: PositionGesture, input: PositionGestureInput): void {
    // hook
  };

  PositionGesture.prototype.onLongPress = function (this: PositionGesture, input: PositionGestureInput): void {
    const t = performance.now();
    input.dt = t - input.t;
    input.t = t;
  };

  PositionGesture.prototype.didLongPress = function (this: PositionGesture, input: PositionGestureInput): void {
    // hook
  };

  PositionGesture.construct = function <G extends PositionGesture<any, any>>(gestureClass: PositionGestureClass, gesture: G | null, owner: FastenerOwner<G>, gestureName: string): G {
    gesture = _super.construct(gestureClass, gesture, owner, gestureName) as G;
    (gesture as Mutable<typeof gesture>).hoverCount = 0;
    (gesture as Mutable<typeof gesture>).pressCount = 0;
    return gesture;
  };

  PositionGesture.specialize = function (method: GestureMethod): PositionGestureClass | null {
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

  PositionGesture.define = function <O, V extends View>(descriptor: PositionGestureDescriptor<O, V>): PositionGestureClass<PositionGesture<any, V>> {
    let superClass = descriptor.extends as PositionGestureClass | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    let method = descriptor.method;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.method;

    if (method === void 0) {
      method = "auto";
    }
    if (superClass === void 0 || superClass === null) {
      superClass = PositionGesture.specialize(method);
    }
    if (superClass === null) {
      superClass = this;
    }

    const gestureClass = superClass.extend(descriptor);

    gestureClass.construct = function (gestureClass: PositionGestureClass, gesture: PositionGesture<O, V> | null, owner: O, gestureName: string): PositionGesture<O, V> {
      gesture = superClass!.construct(gestureClass, gesture, owner, gestureName);
      if (affinity !== void 0) {
        gesture.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        gesture.initInherits(inherits);
      }
      return gesture;
    };

    return gestureClass;
  };

  return PositionGesture;
})(Gesture);
