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

import type {Mutable, Proto, ObserverType} from "@swim/util";
import {FastenerOwner, FastenerInit, FastenerClass, Fastener} from "@swim/component";
import {GestureInputType, GestureInput} from "./GestureInput";
import {View} from "../"; // forward import

/** @internal */
export type MemberGestureView<O, K extends keyof O> =
  O[K] extends Gesture<any, infer V> ? V : never;

/** @internal */
export type GestureView<G extends Gesture<any, any>> =
  G extends Gesture<any, infer V> ? V : never;

/** @public */
export type GestureMethod = "auto" | "pointer" | "touch" | "mouse";

/** @public */
export interface GestureInit<V extends View = View> extends FastenerInit {
  extends?: {prototype: Gesture<any, any>} | string | boolean | null;
  method?: GestureMethod;
  key?: string | boolean;
  self?: boolean;
  binds?: boolean;
  observes?: boolean;

  willAttachView?(view: V, target: View | null): void;
  didAttachView?(view: V, target: View | null): void;

  willDetachView?(view: V): void;
  didDetachView?(view: V): void;

  detectView?(view: View): V | null;
}

/** @public */
export type GestureDescriptor<O = unknown, V extends View = View, I = {}> = ThisType<Gesture<O, V> & I> & GestureInit<V> & Partial<I>;

/** @public */
export interface GestureClass<G extends Gesture<any, any> = Gesture<any, any>> extends FastenerClass<G> {
}

/** @public */
export interface GestureFactory<G extends Gesture<any, any> = Gesture<any, any>> extends GestureClass<G> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): GestureFactory<G> & I;

  specialize(method: GestureMethod): GestureFactory | null;

  define<O, V extends View = View>(className: string, descriptor: GestureDescriptor<O, V>): GestureFactory<Gesture<any, V>>;
  define<O, V extends View = View>(className: string, descriptor: {observes: boolean} & GestureDescriptor<O, V, ObserverType<V>>): GestureFactory<Gesture<any, V>>;
  define<O, V extends View = View, I = {}>(className: string, descriptor: {implements: unknown} & GestureDescriptor<O, V, I>): GestureFactory<Gesture<any, V> & I>;
  define<O, V extends View = View, I = {}>(className: string, descriptor: {implements: unknown; observes: boolean} & GestureDescriptor<O, V, I & ObserverType<V>>): GestureFactory<Gesture<any, V> & I>;

  <O, V extends View = View>(descriptor: GestureDescriptor<O, V>): PropertyDecorator;
  <O, V extends View = View>(descriptor: {observes: boolean} & GestureDescriptor<O, V, ObserverType<V>>): PropertyDecorator;
  <O, V extends View = View, I = {}>(descriptor: {implements: unknown} & GestureDescriptor<O, V, I>): PropertyDecorator;
  <O, V extends View = View, I = {}>(descriptor: {implements: unknown; observes: boolean} & GestureDescriptor<O, V, I & ObserverType<V>>): PropertyDecorator;
}

/** @public */
export interface Gesture<O = unknown, V extends View = View> extends Fastener<O> {
  (): V | null;
  (view: V | null, targetView?: View | null): O;

  /** @override */
  get fastenerType(): Proto<Gesture<any, any>>;

  readonly view: V | null;

  getView(): V;

  setView(newView: V | null, targetView?: View | null): V | null;

  /** @protected */
  willAttachView(view: V, target: View | null): void;

  /** @protected */
  onAttachView(view: V, target: View | null): void;

  /** @protected */
  didAttachView(view: V, target: View | null): void;

  /** @protected */
  willDetachView(view: V): void;

  /** @protected */
  onDetachView(view: V): void;

  /** @protected */
  didDetachView(view: V): void;

  /** @internal @protected */
  attachEvents(view: V): void;

  /** @internal @protected */
  detachEvents(view: V): void;

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
  resetInput(input: GestureInput): void;

  /** @internal */
  resetInputs(): void;

  /** @internal */
  bindView(view: View, target?: View | null): void;

  /** @internal */
  unbindView(view: View): void;

  detectView(view: View): V | null;

  /** @internal */
  viewWillUnmount(view: V): void;

  /** @protected @override */
  onMount(): void;

  /** @internal */
  get key(): string | undefined; // optional prototype field

  /** @internal */
  get self(): boolean | undefined; // optional prototype property

  /** @internal */
  get binds(): boolean | undefined; // optional prototype property

  /** @internal */
  get observes(): boolean | undefined; // optional prototype property

  /** @internal @override */
  get lazy(): boolean; // prototype property

  /** @internal @override */
  get static(): string | boolean; // prototype property
}

/** @public */
export const Gesture = (function (_super: typeof Fastener) {
  const Gesture: GestureFactory = _super.extend("Gesture");

  Object.defineProperty(Gesture.prototype, "fastenerType", {
    get: function (this: Gesture): Proto<Gesture<any, any>> {
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

  Gesture.prototype.setView = function <V extends View>(this: Gesture<unknown, V>, newView: V | null, target?: View | null): V | null {
    const oldView = this.view;
    if (oldView !== newView) {
      if (oldView !== null) {
        this.willDetachView(oldView);
        (this as Mutable<typeof this>).view = null;
        this.onDetachView(oldView);
        this.didDetachView(oldView);
      }
      if (newView !== null) {
        if (target === void 0) {
          target = null;
        }
        this.willAttachView(newView, target);
        (this as Mutable<typeof this>).view = newView;
        this.onAttachView(newView, target);
        this.didAttachView(newView, target);
      }
    }
    return oldView;
  };

  Gesture.prototype.willAttachView = function <V extends View>(this: Gesture<unknown, V>, view: V, target: View | null): void {
    // hook
  };

  Gesture.prototype.onAttachView = function <V extends View>(this: Gesture<unknown, V>, view: V, target: View | null): void {
    this.attachEvents(view);
    if (this.observes === true) {
      view.observe(this as ObserverType<V>);
    }
  };

  Gesture.prototype.didAttachView = function <V extends View>(this: Gesture<unknown, V>, view: V, target: View | null): void {
    // hook
  };

  Gesture.prototype.willDetachView = function <V extends View>(this: Gesture<unknown, V>, view: V): void {
    // hook
  };

  Gesture.prototype.onDetachView = function <V extends View>(this: Gesture<unknown, V>, view: V): void {
    this.clearInputs();
    if (this.observes === true) {
      view.unobserve(this as ObserverType<V>);
    }
    this.detachEvents(view);
  };

  Gesture.prototype.didDetachView = function <V extends View>(this: Gesture<unknown, V>, view: V): void {
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

  Gesture.prototype.resetInput = function (this: Gesture, input: GestureInput): void {
    this.clearInput(input);
  };

  Gesture.prototype.resetInputs = function (this: Gesture): void {
    const inputs = this.inputs as {[inputId: string]: GestureInput | undefined};
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      this.resetInput(input);
    }
  };

  Gesture.prototype.bindView = function <V extends View>(this: Gesture<unknown, V>, view: View, target?: View | null): void {
    if (this.binds && this.view === null) {
      const newView = this.detectView(view);
      if (newView !== null) {
        this.setView(newView, target);
      }
    }
  };

  Gesture.prototype.unbindView = function <V extends View>(this: Gesture<unknown, V>, view: View): void {
    if (this.binds && this.view === view) {
      this.setView(null);
    }
  };

  Gesture.prototype.detectView = function <V extends View>(this: Gesture<unknown, V>, view: View): V | null {
    if (this.key !== void 0 && this.key === view.key) {
      return view as V;
    }
    return null;
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

  Object.defineProperty(Gesture.prototype, "lazy", {
    get: function (this: Gesture): boolean {
      return false;
    },
    configurable: true,
  });

  Object.defineProperty(Gesture.prototype, "static", {
    get: function (this: Gesture): string | boolean {
      return true;
    },
    configurable: true,
  });

  Gesture.construct = function <G extends Gesture<any, any>>(gestureClass: {prototype: G}, gesture: G | null, owner: FastenerOwner<G>): G {
    if (gesture === null) {
      gesture = function (view?: GestureView<G> | null, targetView?: View | null): GestureView<G> | null | FastenerOwner<G> {
        if (view === void 0) {
          return gesture!.view;
        } else {
          gesture!.setView(view, targetView);
          return gesture!.owner;
        }
      } as G;
      delete (gesture as Partial<Mutable<G>>).name; // don't clobber prototype name
      Object.setPrototypeOf(gesture, gestureClass.prototype);
    }
    gesture = _super.construct(gestureClass, gesture, owner) as G;
    (gesture as Mutable<typeof gesture>).view = null;
    (gesture as Mutable<typeof gesture>).inputs = {};
    (gesture as Mutable<typeof gesture>).inputCount = 0;
    return gesture;
  };

  Gesture.specialize = function (method: GestureMethod): GestureFactory | null {
    return null;
  };

  Gesture.define = function <O, V extends View>(className: string, descriptor: GestureDescriptor<O, V>): GestureFactory<Gesture<any, V>> {
    let superClass = descriptor.extends as GestureFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    let method = descriptor.method;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.method;

    if (descriptor.key === true) {
      Object.defineProperty(descriptor, "key", {
        value: className,
        configurable: true,
      });
    } else if (descriptor.key === false) {
      Object.defineProperty(descriptor, "key", {
        value: void 0,
        configurable: true,
      });
    }

    if (method === void 0) {
      method = "auto";
    }
    if (superClass === void 0 || superClass === null) {
      superClass = Gesture.specialize(method);
    }
    if (superClass === null) {
      superClass = this;
    }

    const gestureClass = superClass.extend(className, descriptor);

    gestureClass.construct = function (gestureClass: {prototype: Gesture<any, any>}, gesture: Gesture<O, V> | null, owner: O): Gesture<O, V> {
      gesture = superClass!.construct(gestureClass, gesture, owner);
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
