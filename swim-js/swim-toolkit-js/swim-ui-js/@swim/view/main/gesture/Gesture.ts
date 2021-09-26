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
import type {Mutable} from "@swim/util";
import {View} from "../View";
import type {ViewObserverType} from "../ViewObserver";
import {GestureInputType, GestureInput} from "./GestureInput";
import {GestureContext} from "./GestureContext";

export type GestureMemberType<G, K extends keyof G> =
  G[K] extends Gesture<any, infer V> ? V : never;

export type GestureMethod = "auto" | "pointer" | "touch" | "mouse";

export type GestureFlags = number;

export interface GestureInit<V extends View> {
  extends?: GestureClass;
  method?: GestureMethod;
  self?: boolean;
  child?: boolean;
  observe?: boolean;

  willSetView?(newView: V | null, oldView: V | null, targetView: View | null): void;
  onSetView?(newView: V | null, oldView: V | null, targetView: View | null): void;
  didSetView?(newView: V | null, oldView: V | null, targetView: View | null): void;
}

export type GestureDescriptor<G extends GestureContext, V extends View, I = {}> = GestureInit<V> & ThisType<Gesture<G, V> & I> & Partial<I>;

export interface GestureConstructor<G extends GestureContext, V extends View, I = {}> {
  new<O extends G>(owner: O, gestureName: string | undefined): Gesture<O, V> & I;
  prototype: Gesture<any, any> & I;
}

export interface GestureClass extends Function {
  readonly prototype: Gesture<any, any>;
}

export interface Gesture<G extends GestureContext, V extends View> {
  (): V | null;
  (view: V | null, targetView?: View | null): G;

  readonly name: string;

  readonly owner: G;

  /** @hidden */
  gestureFlags: GestureFlags;

  /** @hidden */
  setGestureFlags(gestureFlags: GestureFlags): void;

  readonly view: V | null;

  getView(): V;

  setView(newView: V | null, targetView?: View | null): V | null;

  /** @hidden */
  attachView(newView: V): void;

  /** @hidden */
  detachView(oldView: V): void;

  /** @hidden */
  willSetView(newView: V | null, oldView: V | null, targetView: View | null): void;

  /** @hidden */
  onSetView(newView: V | null, oldView: V | null, targetView: View | null): void;

  /** @hidden */
  didSetView(newView: V | null, oldView: V | null, targetView: View | null): void;

  /** @hidden */
  attachEvents(newView: V): void;

  /** @hidden */
  detachEvents(oldView: V): void;

  /** @hidden */
  observe?: boolean;

  /** @hidden */
  child?: boolean;

  /** @hidden */
  self?: boolean;

  readonly inputs: {readonly [inputId: string]: GestureInput | undefined};

  readonly inputCount: number;

  getInput(inputId: string | number): GestureInput | null;

  /** @hidden */
  createInput(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number): GestureInput;

  /** @hidden */
  getOrCreateInput(inputId: string | number, inputType: GestureInputType, isPrimary: boolean,
                   x: number, y: number, t: number): GestureInput;

  /** @hidden */
  clearInput(input: GestureInput): void;

  /** @hidden */
  clearInputs(): void;

  /** @hidden */
  viewWillUnmount(view: V): void;

  isMounted(): boolean;

  /** @hidden */
  mount(): void;

  /** @hidden */
  willMount(): void;

  /** @hidden */
  onMount(): void;

  /** @hidden */
  didMount(): void;

  /** @hidden */
  unmount(): void;

  /** @hidden */
  willUnmount(): void;

  /** @hidden */
  onUnmount(): void;

  /** @hidden */
  didUnmount(): void;
}

export const Gesture = function <G extends GestureContext, V extends View>(
    this: Gesture<G, V> | typeof Gesture,
    owner: G | GestureDescriptor<G, V>,
    gestureName?: string,
  ): Gesture<G, V> | PropertyDecorator {
  if (this instanceof Gesture) { // constructor
    return GestureConstructor.call(this as unknown as Gesture<GestureContext, View>, owner as G, gestureName);
  } else { // decorator factory
    return GestureDecoratorFactory(owner as GestureDescriptor<G, V>);
  }
} as {
  /** @hidden */
  new<G extends GestureContext, V extends View>(owner: G, gestureName: string | undefined): Gesture<G, V>;

  <G extends GestureContext, V extends View = View, I = {}>(descriptor: {observe: boolean} & GestureDescriptor<G, V, I & ViewObserverType<V>>): PropertyDecorator;
  <G extends GestureContext, V extends View = View, I = {}>(descriptor: GestureDescriptor<G, V, I>): PropertyDecorator;

  /** @hidden */
  prototype: Gesture<any, any>;

  /** @hidden */
  getClass(method: GestureMethod): GestureClass | null;

  define<G extends GestureContext, V extends View = View, I = {}>(descriptor: {observe: boolean} & GestureDescriptor<G, V, I & ViewObserverType<V>>): GestureConstructor<G, V, I>;
  define<G extends GestureContext, V extends View = View, I = {}>(descriptor: GestureDescriptor<G, V, I>): GestureConstructor<G, V, I>;

  /** @hidden */
  MountedFlag: GestureFlags;
  /** @hidden */
  PreserveAspectRatioFlag: GestureFlags;
  /** @hidden */
  WheelFlag: GestureFlags;
  /** @hidden */
  NeedsRescale: GestureFlags;
};
__extends(Gesture, Object);

function GestureConstructor<G extends GestureContext, V extends View>(this: Gesture<G, V>, owner: G, gestureName: string | undefined): Gesture<G, V> {
  if (gestureName !== void 0) {
    Object.defineProperty(this, "name", {
      value: gestureName,
      enumerable: true,
      configurable: true,
    });
  }
  (this as Mutable<typeof this>).owner = owner;
  (this as Mutable<typeof this>).gestureFlags = 0;
  (this as Mutable<typeof this>).view = null;
  (this as Mutable<typeof this>).inputs = {};
  (this as Mutable<typeof this>).inputCount = 0;
  return this;
}

function GestureDecoratorFactory<G extends GestureContext, V extends View>(descriptor: GestureDescriptor<G, V>): PropertyDecorator {
  return GestureContext.decorateGesture.bind(View, Gesture.define(descriptor as GestureDescriptor<GestureContext, View>));
}

Gesture.prototype.setGestureFlags = function (this: Gesture<GestureContext, View>, gestureFlags: GestureFlags): void {
  (this as Mutable<typeof this>).gestureFlags = gestureFlags;
};

Gesture.prototype.getView = function <V extends View>(this: Gesture<GestureContext, V>): V {
  const view = this.view;
  if (view === null) {
    throw new TypeError("null " + this.name + " view");
  }
  return view;
};

Gesture.prototype.setView = function <V extends View>(this: Gesture<GestureContext, V>, newView: V | null, targetView?: View | null): V | null {
  const oldView = this.view;
  if (oldView !== newView) {
    if (targetView === void 0) {
      targetView = null
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

Gesture.prototype.attachView = function <V extends View>(this: Gesture<GestureContext, V>, newView: V): void {
  this.attachEvents(newView);
  if (this.observe === true) {
    newView.addViewObserver(this as ViewObserverType<V>);
  }
};

Gesture.prototype.detachView = function <V extends View>(this: Gesture<GestureContext, V>, oldView: V): void {
  this.clearInputs();
  if (this.observe === true) {
    oldView.removeViewObserver(this as ViewObserverType<V>);
  }
  this.detachEvents(oldView);
};

Gesture.prototype.willSetView = function <V extends View>(this: Gesture<GestureContext, V>, newView: V | null, oldView: V | null, targetView: View | null): void {
  // hook
};

Gesture.prototype.onSetView = function <V extends View>(this: Gesture<GestureContext, V>, newView: V | null, oldView: V | null, targetView: View | null): void {
  // hook
};

Gesture.prototype.didSetView = function <V extends View>(this: Gesture<GestureContext, V>, newView: V | null, oldView: V | null, targetView: View | null): void {
  // hook
};

Gesture.prototype.attachEvents = function <V extends View>(this: Gesture<GestureContext, V>, view: V): void {
  // hook
};

Gesture.prototype.detachEvents = function <V extends View>(this: Gesture<GestureContext, V>, view: V): void {
  // hook
};

Gesture.prototype.getInput = function (this: Gesture<GestureContext, View>, inputId: string | number): GestureInput | null {
  if (typeof inputId === "number") {
    inputId = "" + inputId;
  }
  const input = this.inputs[inputId];
  return input !== void 0 ? input : null;
};

Gesture.prototype.createInput = function (this: Gesture<GestureContext, View>, inputId: string, inputType: GestureInputType, isPrimary: boolean,
                                          x: number, y: number, t: number): GestureInput {
  return new GestureInput(inputId, inputType, isPrimary, x, y, t);
};

Gesture.prototype.getOrCreateInput = function (this: Gesture<GestureContext, View>, inputId: string | number, inputType: GestureInputType, isPrimary: boolean,
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

Gesture.prototype.clearInput = function (this: Gesture<GestureContext, View>, input: GestureInput): void {
  const inputs = this.inputs as {[inputId: string]: GestureInput | undefined};
  delete inputs[input.inputId];
  (this as Mutable<typeof this>).inputCount -= 1;
};

Gesture.prototype.clearInputs = function (this: Gesture<GestureContext, View>): void {
  (this as Mutable<typeof this>).inputs = {};
  (this as Mutable<typeof this>).inputCount = 0;
};

Gesture.prototype.viewWillUnmount = function (this: Gesture<GestureContext, View>, view: View): void {
  this.clearInputs();
};

Gesture.prototype.isMounted = function (this: Gesture<GestureContext, View>): boolean {
  return (this.gestureFlags & Gesture.MountedFlag) !== 0;
};

Gesture.prototype.mount = function (this: Gesture<GestureContext, View>): void {
  if ((this.gestureFlags & Gesture.MountedFlag) === 0) {
    this.willMount();
    this.setGestureFlags(this.gestureFlags | Gesture.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

Gesture.prototype.willMount = function (this: Gesture<GestureContext, View>): void {
  // hook
};

Gesture.prototype.onMount = function (this: Gesture<GestureContext, View>): void {
  if (this.self === true && this.owner instanceof View) {
    this.setView(this.owner);
  }
};

Gesture.prototype.didMount = function (this: Gesture<GestureContext, View>): void {
  // hook
};

Gesture.prototype.unmount = function (this: Gesture<GestureContext, View>): void {
  if ((this.gestureFlags & Gesture.MountedFlag) !== 0) {
    this.willUnmount();
    this.setGestureFlags(this.gestureFlags & ~Gesture.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

Gesture.prototype.willUnmount = function (this: Gesture<GestureContext, View>): void {
  // hook
};

Gesture.prototype.onUnmount = function (this: Gesture<GestureContext, View>): void {
  // hook
};

Gesture.prototype.didUnmount = function (this: Gesture<GestureContext, View>): void {
  // hook
};

Gesture.getClass = function (method: GestureMethod): GestureClass | null {
  return null;
};

Gesture.define = function <G extends GestureContext, V extends View, I>(descriptor: GestureDescriptor<G, V, I>): GestureConstructor<G, V, I> {
  let _super: GestureClass | null | undefined = descriptor.extends;
  let method = descriptor.method;
  delete descriptor.extends;
  delete descriptor.method;

  if (method === void 0) {
    method = "auto";
  }
  if (_super === void 0) {
    _super = Gesture.getClass(method);
  }
  if (_super === null) {
    _super = Gesture;
  }

  const _constructor = function DecoratedGesture(this: Gesture<G, V>, owner: G, gestureName: string | undefined): Gesture<G, V> {
    let _this: Gesture<G, V> = function GestureAccessor(view?: V | null, targetView?: View | null): V | null | G {
      if (view === void 0) {
        return _this.view;
      } else {
        _this.setView(view, targetView);
        return _this.owner;
      }
    } as Gesture<G, V>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, gestureName) || _this;
    return _this;
  } as unknown as GestureConstructor<G, V, I>;

  const _prototype = descriptor as unknown as Gesture<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};

Gesture.MountedFlag = 1 << 0;
Gesture.PreserveAspectRatioFlag = 1 << 1;
Gesture.WheelFlag = 1 << 2;
Gesture.NeedsRescale = 1 << 3;
