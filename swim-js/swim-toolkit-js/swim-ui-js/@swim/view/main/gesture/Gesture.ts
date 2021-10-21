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

import type {Mutable, Class, ObserverType} from "@swim/util";
import {FastenerOwner, FastenerFlags, FastenerInit, Fastener} from "@swim/fastener";
import {GestureInputType, GestureInput} from "./GestureInput";
import {View} from "../"; // forward import

export type MemberGestureView<O, K extends keyof O> =
  O[K] extends Gesture<any, infer V> ? V : never;

export type GestureView<G extends Gesture<any, any>> =
  G extends Gesture<any, infer V> ? V : never;

export type GestureMethod = "auto" | "pointer" | "touch" | "mouse";

export interface GestureInit<V extends View = View> extends FastenerInit {
  method?: GestureMethod;
  self?: boolean;
  child?: boolean;
  observes?: boolean;

  willSetView?(newView: V | null, oldView: V | null, targetView: View | null): void;
  onSetView?(newView: V | null, oldView: V | null, targetView: View | null): void;
  didSetView?(newView: V | null, oldView: V | null, targetView: View | null): void;
}

export type GestureDescriptor<O = unknown, V extends View = View, I = {}> = ThisType<Gesture<O, V> & I> & GestureInit<V> & Partial<I>;

export interface GestureClass<G extends Gesture<any, any> = Gesture<any, any>> {
  /** @internal */
  prototype: G;

  create(owner: FastenerOwner<G>, gestureName: string): G;

  construct(gestureClass: {prototype: G}, fastener: G | null, owner: FastenerOwner<G>, gestureName: string): G;

  specialize(method: GestureMethod): GestureClass | null;

  extend<I = {}>(classMembers?: Partial<I> | null): GestureClass<G> & I;

  define<O, V extends View = View, I = {}>(descriptor: {observes: boolean} & GestureDescriptor<O, V, I & ObserverType<V>>): GestureClass<Gesture<any, V> & I>;
  define<O, V extends View = View, I = {}>(descriptor: GestureDescriptor<O, V, I>): GestureClass<Gesture<any, V> & I>;

  <O, V extends View = View, I = {}>(descriptor: {observes: boolean} & GestureDescriptor<O, V, I & ObserverType<V>>): PropertyDecorator;
  <O, V extends View = View, I = {}>(descriptor: GestureDescriptor<O, V, I>): PropertyDecorator;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

export interface Gesture<O = unknown, V extends View = View> extends Fastener<O> {
  (): V | null;
  (view: V | null, targetView?: View | null): O;

  /** @override */
  get familyType(): Class<Gesture<any, any>> | null;

  readonly view: V | null;

  getView(): V;

  setView(newView: V | null, targetView?: View | null): V | null;

  /** @internal */
  attachView(newView: V): void;

  /** @internal */
  detachView(oldView: V): void;

  /** @internal */
  willSetView(newView: V | null, oldView: V | null, targetView: View | null): void;

  /** @internal */
  onSetView(newView: V | null, oldView: V | null, targetView: View | null): void;

  /** @internal */
  didSetView(newView: V | null, oldView: V | null, targetView: View | null): void;

  /** @internal @protected */
  attachEvents(newView: V): void;

  /** @internal @protected */
  detachEvents(oldView: V): void;

  /** @internal */
  readonly inputs: {readonly [inputId: string]: GestureInput | undefined};

  readonly inputCount: number;

  getInput(inputId: string | number): GestureInput | null;

  /** @internal */
  createInput(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number): GestureInput;

  /** @internal */
  getOrCreateInput(inputId: string | number, inputType: GestureInputType, isPrimary: boolean,
                   x: number, y: number, t: number): GestureInput;

  /** @internal */
  clearInput(input: GestureInput): void;

  /** @internal */
  clearInputs(): void;

  /** @internal */
  viewWillUnmount(view: V): void;

  /** @protected @override */
  onMount(): void;

  /** @internal */
  get observes(): boolean | undefined; // optional prototype property

  /** @internal */
  get child(): boolean | undefined; // optional prototype property

  /** @internal */
  get self(): boolean | undefined; // optional prototype property
}

export const Gesture = (function (_super: typeof Fastener) {
  const Gesture: GestureClass = _super.extend();

  Object.defineProperty(Gesture.prototype, "familyType", {
    get: function (this: Gesture): Class<Gesture<any, any>> | null {
      return Gesture;
    },
    configurable: true,
  });

  Gesture.prototype.getView = function <V extends View>(this: Gesture<unknown, V>): V {
    const view = this.view;
    if (view === null) {
      throw new TypeError("null " + this.name + " view");
    }
    return view;
  };

  Gesture.prototype.setView = function <V extends View>(this: Gesture<unknown, V>, newView: V | null, targetView?: View | null): V | null {
    const oldView = this.view;
    if (oldView !== newView) {
      if (targetView === void 0) {
        targetView = null;
      }
      this.willSetView(newView, oldView, targetView);
      if (oldView !== null) {
        this.detachView(oldView);
      }
      (this as Mutable<typeof this>).view = newView;
      if (newView !== null) {
        this.attachView(newView);
      }
      this.onSetView(newView, oldView, targetView);
      this.didSetView(newView, oldView, targetView);
    }
    return oldView;
  };

  Gesture.prototype.attachView = function <V extends View>(this: Gesture<unknown, V>, newView: V): void {
    this.attachEvents(newView);
    if (this.observes === true) {
      newView.observe(this as ObserverType<V>);
    }
  };

  Gesture.prototype.detachView = function <V extends View>(this: Gesture<unknown, V>, oldView: V): void {
    this.clearInputs();
    if (this.observes === true) {
      oldView.unobserve(this as ObserverType<V>);
    }
    this.detachEvents(oldView);
  };

  Gesture.prototype.willSetView = function <V extends View>(this: Gesture<unknown, V>, newView: V | null, oldView: V | null, targetView: View | null): void {
    // hook
  };

  Gesture.prototype.onSetView = function <V extends View>(this: Gesture<unknown, V>, newView: V | null, oldView: V | null, targetView: View | null): void {
    // hook
  };

  Gesture.prototype.didSetView = function <V extends View>(this: Gesture<unknown, V>, newView: V | null, oldView: V | null, targetView: View | null): void {
    // hook
  };

  Gesture.prototype.attachEvents = function <V extends View>(this: Gesture<unknown, V>, view: V): void {
    // hook
  };

  Gesture.prototype.detachEvents = function <V extends View>(this: Gesture<unknown, V>, view: V): void {
    // hook
  };

  Gesture.prototype.getInput = function (this: Gesture, inputId: string | number): GestureInput | null {
    if (typeof inputId === "number") {
      inputId = "" + inputId;
    }
    const input = this.inputs[inputId];
    return input !== void 0 ? input : null;
  };

  Gesture.prototype.createInput = function (this: Gesture, inputId: string, inputType: GestureInputType, isPrimary: boolean,
                                            x: number, y: number, t: number): GestureInput {
    return new GestureInput(inputId, inputType, isPrimary, x, y, t);
  };

  Gesture.prototype.getOrCreateInput = function (this: Gesture, inputId: string | number, inputType: GestureInputType, isPrimary: boolean,
                                                 x: number, y: number, t: number): GestureInput {
    if (typeof inputId === "number") {
      inputId = "" + inputId;
    }
    const inputs = this.inputs as {[inputId: string]: GestureInput | undefined};
    let input = inputs[inputId];
    if (input === void 0) {
      input = this.createInput(inputId, inputType, isPrimary, x, y, t);
      inputs[inputId] = input;
      (this as Mutable<typeof this>).inputCount += 1;
    }
    return input;
  };

  Gesture.prototype.clearInput = function (this: Gesture, input: GestureInput): void {
    const inputs = this.inputs as {[inputId: string]: GestureInput | undefined};
    delete inputs[input.inputId];
    (this as Mutable<typeof this>).inputCount -= 1;
  };

  Gesture.prototype.clearInputs = function (this: Gesture): void {
    (this as Mutable<typeof this>).inputs = {};
    (this as Mutable<typeof this>).inputCount = 0;
  };

  Gesture.prototype.viewWillUnmount = function (this: Gesture, view: View): void {
    this.clearInputs();
  };

  Gesture.prototype.onMount = function (this: Gesture): void {
    _super.prototype.onMount.call(this);
    if (this.self === true && this.owner instanceof View) {
      this.setView(this.owner);
    }
  };

  Gesture.construct = function <G extends Gesture<any, any>>(gestureClass: {prototype: G}, gesture: G | null, owner: FastenerOwner<G>, gestureName: string): G {
    if (gesture === null) {
      gesture = function Gesture(view?: GestureView<G> | null, targetView?: View | null): GestureView<G> | null | FastenerOwner<G> {
        if (view === void 0) {
          return gesture!.view;
        } else {
          gesture!.setView(view, targetView);
          return gesture!.owner;
        }
      } as G;
      Object.setPrototypeOf(gesture, gestureClass.prototype);
    }
    gesture = _super.construct(gestureClass, gesture, owner, gestureName) as G;
    (gesture as Mutable<typeof gesture>).view = null;
    (gesture as Mutable<typeof gesture>).inputs = {};
    (gesture as Mutable<typeof gesture>).inputCount = 0;
    return gesture;
  };

  Gesture.specialize = function (method: GestureMethod): GestureClass | null {
    return null;
  };

  Gesture.define = function <O, V extends View>(descriptor: GestureDescriptor<O, V>): GestureClass<Gesture<any, V>> {
    let superClass = descriptor.extends as GestureClass | null | undefined;
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
      superClass = Gesture.specialize(method);
    }
    if (superClass === null) {
      superClass = this;
    }

    const gestureClass = superClass.extend(descriptor);

    gestureClass.construct = function (gestureClass: {prototype: Gesture<any, any>}, gesture: Gesture<O, V> | null, owner: O, gestureName: string): Gesture<O, V> {
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

  return Gesture;
})(Fastener);
