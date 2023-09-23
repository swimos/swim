// Copyright 2015-2023 Nstream, inc.
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
import type {Observes} from "@swim/util";
import type {FastenerDescriptor} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import {View} from "./View";

/** @public */
export type GestureInputType = "mouse" | "wheel" | "touch" | "pen" | "unknown";

/** @public */
export class GestureInput {
  readonly inputId: string;
  inputType: GestureInputType;
  isPrimary: boolean;

  target: EventTarget | null;
  button: number;
  buttons: number;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;

  width: number;
  height: number;
  tiltX: number;
  tiltY: number;
  twist: number;
  pressure: number;
  tangentialPressure: number;

  x0: number;
  y0: number;
  t0: number;
  dx: number;
  dy: number;
  dt: number;
  x: number;
  y: number;
  t: number;

  detail: unknown;

  defaultPrevented: boolean;

  constructor(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number) {
    this.inputId = inputId;
    this.inputType = inputType;
    this.isPrimary = isPrimary;

    this.target = null;
    this.button = 0;
    this.buttons = 0;
    this.altKey = false;
    this.ctrlKey = false;
    this.metaKey = false;
    this.shiftKey = false;

    this.width = 0;
    this.height = 0;
    this.tiltX = 0;
    this.tiltY = 0;
    this.twist = 0;
    this.pressure = 0;
    this.tangentialPressure = 0;

    this.x0 = x;
    this.y0 = y;
    this.t0 = t;
    this.dx = 0;
    this.dy = 0;
    this.dt = 0;
    this.x = x;
    this.y = y;
    this.t = t;

    this.detail = void 0;

    this.defaultPrevented = false;
  }

  preventDefault(): void {
    this.defaultPrevented = true;
  }

  /** @internal */
  static pointerInputType(inputType: string): GestureInputType {
    if (inputType === "mouse" || inputType === "touch" || inputType === "pen") {
      return inputType;
    }
    return "unknown";
  }
}

/** @public */
export type GestureMethod = "auto" | "pointer" | "touch" | "mouse";

/** @public */
export interface GestureDescriptor<R, V extends View> extends FastenerDescriptor<R> {
  extends?: Proto<Gesture<any, any>> | boolean | null;
  method?: GestureMethod;
  viewKey?: string | boolean;
  observes?: boolean;
}

/** @public */
export interface GestureClass<G extends Gesture<any, any> = Gesture> extends FastenerClass<G> {
}

/** @public */
export interface Gesture<R = any, V extends View = View> extends Fastener<R> {
  /** @override */
  get descriptorType(): Proto<GestureDescriptor<R, V>>;

  /** @override */
  get fastenerType(): Proto<Gesture<any, any>>;

  get bindsOwner(): boolean;

  get observes(): boolean;

  get viewKey(): string | undefined;

  readonly view: V | null;

  getView(): V;

  setView(newView: V | null): V | null;

  /** @protected */
  initView(view: V): void;

  /** @protected */
  willAttachView(view: V): void;

  /** @protected */
  onAttachView(view: V): void;

  /** @protected */
  didAttachView(view: V): void;

  /** @protected */
  deinitView(view: V): void;

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
  bindView(view: View): void;

  /** @internal */
  unbindView(view: View): void;

  detectView(view: View): V | null;

  /** @internal */
  viewWillUnmount(view: V): void;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;
}

/** @public */
export const Gesture = (<R, V extends View, G extends Gesture<any, any>>() => Fastener.extend<Gesture<R, V>, GestureClass<G>>("Gesture", {
  get fastenerType(): Proto<Gesture<any, any>> {
    return Gesture;
  },

  bindsOwner: false,

  observes: true,

  viewKey: void 0,

  getView(): V {
    const view = this.view;
    if (view === null) {
      let message = view + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "view";
      throw new TypeError(message);
    }
    return view;
  },

  setView(newView: V | null): V | null {
    const oldView = this.view;
    if (oldView === newView) {
      return oldView;
    } else if (oldView !== null) {
      (this as Mutable<typeof this>).view = null;
      this.willDetachView(oldView);
      this.onDetachView(oldView);
      this.deinitView(oldView);
      this.didDetachView(oldView);
    }
    if (newView !== null) {
      (this as Mutable<typeof this>).view = newView;
      this.willAttachView(newView);
      this.onAttachView(newView);
      this.initView(newView);
      this.didAttachView(newView);
    }
    return oldView;
  },

  initView(view: V): void {
    // hook
  },

  willAttachView(view: V): void {
    // hook
  },

  onAttachView(view: V): void {
    if ((this.flags & Fastener.MountedFlag) === 0) {
      return;
    }
    this.attachEvents(view);
    if (this.observes) {
      view.observe(this as Observes<V>);
    }
  },

  didAttachView(view: V): void {
    // hook
  },

  deinitView(view: V): void {
    // hook
  },

  willDetachView(view: V): void {
    // hook
  },

  onDetachView(view: V): void {
    this.clearInputs();
    if ((this.flags & Fastener.MountedFlag) === 0) {
      return;
    }
    if (this.observes) {
      view.unobserve(this as Observes<V>);
    }
    this.detachEvents(view);
  },

  didDetachView(view: V): void {
    // hook
  },

  attachEvents(view: V): void {
    // hook
  },

  detachEvents(view: V): void {
    // hook
  },

  getInput(inputId: string | number): GestureInput | null {
    if (typeof inputId === "number") {
      inputId = "" + inputId;
    }
    const input = this.inputs[inputId];
    return input !== void 0 ? input : null;
  },

  createInput(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number): GestureInput {
    return new GestureInput(inputId, inputType, isPrimary, x, y, t);
  },

  getOrCreateInput(inputId: string | number, inputType: GestureInputType, isPrimary: boolean,
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
  },

  clearInput(input: GestureInput): void {
    const inputs = this.inputs as {[inputId: string]: GestureInput | undefined};
    delete inputs[input.inputId];
    (this as Mutable<typeof this>).inputCount -= 1;
  },

  clearInputs(): void {
    (this as Mutable<typeof this>).inputs = {};
    (this as Mutable<typeof this>).inputCount = 0;
  },

  resetInput(input: GestureInput): void {
    this.clearInput(input);
  },

  resetInputs(): void {
    const inputs = this.inputs as {[inputId: string]: GestureInput | undefined};
    for (const inputId in inputs) {
      const input = inputs[inputId]!;
      this.resetInput(input);
    }
  },

  bindView(view: View): void {
    if (!this.binds || this.view !== null) {
      return;
    }
    const newView = this.detectView(view);
    if (newView === null) {
      return;
    }
    this.setView(newView);
  },

  unbindView(view: View): void {
    if (!this.binds || this.view !== view) {
      return;
    }
    this.setView(null);
  },

  detectView(view: View): V | null {
    if (this.viewKey !== void 0 && this.viewKey === view.key) {
      return view as V;
    }
    return null;
  },

  viewWillUnmount(view: View): void {
    this.clearInputs();
  },

  onMount(): void {
    super.onMount();
    const view = this.view;
    if (view !== null) {
      this.attachEvents(view);
      if (this.observes) {
        view.observe(this as Observes<V>);
      }
    }
  },

  onUnmount(): void {
    super.onUnmount();
    this.clearInputs();
    const view = this.view;
    if (view !== null) {
      if (this.observes) {
        view.unobserve(this as Observes<V>);
      }
      this.detachEvents(view);
    }
  },
},
{
  create(owner: G extends Fastener<infer R, any, any> ? R : never): G {
    const gesture = super.create(owner) as G;
    if (gesture.view === null && gesture.bindsOwner === true && (owner as unknown) instanceof View) {
      gesture.setView(owner);
    }
    return gesture;
  },

  construct(gesture: G | null, owner: G extends Fastener<infer R, any, any> ? R : never): G {
    gesture = super.construct(gesture, owner) as G;
    (gesture as Mutable<typeof gesture>).view = null;
    (gesture as Mutable<typeof gesture>).inputs = {};
    (gesture as Mutable<typeof gesture>).inputCount = 0;
    return gesture;
  },

  refine(fastenerClass: FastenerClass<Gesture<any, any>>): void {
    super.refine(fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    const viewKeyDescriptor = Object.getOwnPropertyDescriptor(fastenerPrototype, "viewKey");
    if (viewKeyDescriptor !== void 0 && "value" in viewKeyDescriptor) {
      if (viewKeyDescriptor.value === true) {
        viewKeyDescriptor.value = fastenerClass.name;
        Object.defineProperty(fastenerPrototype, "viewKey", viewKeyDescriptor);
      } else if (viewKeyDescriptor.value === false) {
        viewKeyDescriptor.value = void 0;
        Object.defineProperty(fastenerPrototype, "viewKey", viewKeyDescriptor);
      }
    }
  },
}))();
