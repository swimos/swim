// Copyright 2015-2021 Swim inc.
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

import type {InletType, InletOptions, Inlet} from "./Inlet";
import type {OutletType, OutletOptions, Outlet} from "./Outlet";
import type {InoutletType, InoutletOptions, Inoutlet} from "./Inoutlet";
import type {StreamletContext} from "./StreamletContext";
import type {StreamletScope} from "./StreamletScope";
import type {Streamlet} from "./Streamlet";
import type {GenericStreamlet} from "./GenericStreamlet";
import {StreamletInlet} from "./StreamletInlet";
import {StreamletOutlet} from "./StreamletOutlet";
import {StreamletInoutlet} from "./StreamletInoutlet";

/** @hidden */
export class InletDescriptor {
  readonly key: string;
  readonly name: string;
  readonly type: InletType;

  constructor(key: string, name: string, type: InletType) {
    this.key = key;
    this.name = name;
    this.type = type;
  }
}

/** @hidden */
export class OutletDescriptor {
  readonly key: string;
  readonly name: string;
  readonly type: OutletType;

  constructor(key: string, name: string, type: OutletType) {
    this.key = key;
    this.name = name;
    this.type = type;
  }
}

/** @hidden */
export class InoutletDescriptor {
  readonly key: string;
  readonly name: string;
  readonly type: InoutletType;

  constructor(key: string, name: string, type: InoutletType) {
    this.key = key;
    this.name = name;
    this.type = type;
  }
}

/** @hidden */
export interface StreamletPrototype {
  inlets?: {[name: string]: InletDescriptor | InoutletDescriptor | undefined};
  outlets?: {[name: string]: OutletDescriptor | InoutletDescriptor | undefined};
  inoutlets?: {[name: string]: InoutletDescriptor | undefined};
}

export abstract class AbstractStreamlet<I = unknown, O = I> implements GenericStreamlet<I, O> {
  constructor(scope: StreamletScope<O> | null = null) {
    Object.defineProperty(this, "streamletScope", {
      value: scope,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "streamletContext", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "version", {
      value: -1,
      enumerable: true,
      configurable: true,
    });
  }

  readonly streamletScope!: StreamletScope<O> | null;

  setStreamletScope(scope: StreamletScope<O> | null): void {
    Object.defineProperty(this, "streamletScope", {
      value: scope,
      enumerable: true,
      configurable: true,
    });
  }

  readonly streamletContext!: StreamletContext | null;

  setStreamletContext(context: StreamletContext | null): void {
    Object.defineProperty(this, "streamletContext", {
      value: context,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  readonly version!: number;

  inlet(key: string): Inlet<I> | null;
  inlet<I2 extends I>(): Inlet<I2>;
  inlet(key?: string): Inlet<I> | null {
    if (key === void 0) {
      return new StreamletInlet<I>(this);
    } else {
      return AbstractStreamlet.reflectInletKey<I, O>(key, this, Object.getPrototypeOf(this));
    }
  }

  bindInput(key: string, input: Outlet<I>): void {
    const inlet = this.inlet(key);
    if (inlet === null) {
      throw new Error("" + key);
    }
    inlet.bindInput(input);
  }

  unbindInput(key: string): void {
    const inlet = this.inlet(key);
    if (inlet === null) {
      throw new Error("" + key);
    }
    inlet.unbindInput();
  }

  outlet(key: string | Outlet<O>): Outlet<O> | null;
  outlet<O2>(): Outlet<O2>;
  outlet(key?: string | Outlet<O>): Outlet<O> | null {
    if (key === void 0) {
      return new StreamletOutlet<O>(this);
    } else if (typeof key === "string") {
      return AbstractStreamlet.reflectOutletKey<I, O>(key, this, Object.getPrototypeOf(this));
    } else {
      return key;
    }
  }

  inoutlet<I2 extends I, O2>(): Inoutlet<I2, O2> {
    return new StreamletInoutlet<I2, O2>(this as Streamlet<I2, O2>);
  }

  decohere(): void {
    if (this.version >= 0) {
      this.willDecohere();
      Object.defineProperty(this, "version", {
        value: -1,
        enumerable: true,
        configurable: true,
      });
      this.onDecohere();
      this.onDecohereOutlets();
      this.didDecohere();
    }
  }

  recohere(version: number): void {
    if (this.version < 0) {
      this.willRecohere(version);
      Object.defineProperty(this, "version", {
        value: version,
        enumerable: true,
        configurable: true,
      });
      this.onRecohereInlets(version);
      this.onRecohere(version);
      this.onRecohereOutlets(version);
      this.didRecohere(version);
    }
  }

  getInput<I2 extends I>(inlet: Inlet<I2> | string): I2 | undefined;
  getInput<I2 extends I, E = I2>(inlet: Inlet<I2> | string, orElse: E): I2 | E;
  getInput<I2 extends I, E = I2>(inlet: Inlet<I2> | string, orElse?: E): I2 | E | undefined {
    if (typeof inlet === "string") {
      inlet = this.inlet(inlet) as Inlet<I2>;
    }
    let object: I2 | E | undefined;
    if (inlet !== null) {
      const input = inlet.input;
      if (input !== null) {
        object = input.get();
      }
    }
    if (object === void 0) {
      object = orElse;
    }
    return object;
  }

  getOutput(outlet: Outlet<O> | string): O | undefined {
    return void 0;
  }

  disconnectInputs(): void {
    AbstractStreamlet.disconnectInputs(this, Object.getPrototypeOf(this));
  }

  /** @hidden */
  static disconnectInputs<I, O>(streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null): void {
    while (streamletPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(streamletPrototype, "inlets")) {
        for (const name in streamletPrototype.inlets) {
          const inletDescriptor = streamletPrototype.inlets[name]!;
          if (inletDescriptor instanceof InletDescriptor) {
            const inlet = AbstractStreamlet.reflectInletField(streamlet, inletDescriptor);
            inlet.disconnectInputs();
          } else if (inletDescriptor instanceof InoutletDescriptor) {
            const inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, inletDescriptor);
            inoutlet.disconnectInputs();
          }
        }
      }
      streamletPrototype = Object.getPrototypeOf(streamletPrototype);
    }
  }

  disconnectOutputs(): void {
    AbstractStreamlet.disconnectOutputs(this, Object.getPrototypeOf(this));
  }

  /** @hidden */
  static disconnectOutputs<I, O>(streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null): void {
    while (streamletPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(streamletPrototype, "outlets")) {
        for (const name in streamletPrototype.outlets) {
          const outletDescriptor = streamletPrototype.outlets[name]!;
          if (outletDescriptor instanceof OutletDescriptor) {
            const outlet = AbstractStreamlet.reflectOutletField(streamlet, outletDescriptor);
            outlet.disconnectOutputs();
          } else if (outletDescriptor instanceof InoutletDescriptor) {
            const inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, outletDescriptor);
            inoutlet.disconnectOutputs();
          }
        }
      }
      streamletPrototype = Object.getPrototypeOf(streamletPrototype);
    }
  }

  willDecohereInlet(inlet: Inlet<I>): void {
    // hook
  }

  didDecohereInlet(inlet: Inlet<I>): void {
    this.decohere();
  }

  willRecohereInlet(inlet: Inlet<I>, version: number): void {
    // hook
  }

  didRecohereInlet(inlet: Inlet<I>, version: number): void {
    this.recohere(version);
  }

  willDecohereOutlet(outlet: Outlet<O>): void {
    // hook
  }

  didDecohereOutlet(outlet: Outlet<O>): void {
    // hook
  }

  willRecohereOutlet(outlet: Outlet<O>, version: number): void {
    // hook
  }

  didRecohereOutlet(outlet: Outlet<O>, version: number): void {
    // hook
  }

  protected willDecohere(): void {
    // hook
  }

  protected onDecohere(): void {
    // hook
  }

  protected onDecohereOutlets(): void {
    AbstractStreamlet.decohereOutlets(this, Object.getPrototypeOf(this));
  }

  /** @hidden */
  static decohereOutlets<I, O>(streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null): void {
    while (streamletPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(streamletPrototype, "outlets")) {
        for (const name in streamletPrototype.outlets) {
          const outletDescriptor = streamletPrototype.outlets[name]!;
          if (outletDescriptor instanceof OutletDescriptor) {
            const outlet = AbstractStreamlet.reflectOutletField(streamlet, outletDescriptor);
            outlet.decohereInput();
          } else if (outletDescriptor instanceof InoutletDescriptor) {
            const inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, outletDescriptor);
            inoutlet.decohereInput();
          }
        }
      }
      streamletPrototype = Object.getPrototypeOf(streamletPrototype);
    }
  }

  protected didDecohere(): void {
    // hook
  }

  protected willRecohere(version: number): void {
    // hook
  }

  protected onRecohereInlets(version: number): void {
    AbstractStreamlet.recohereInlets(version, this, Object.getPrototypeOf(this));
  }

  /** @hidden */
  static recohereInlets<I, O>(version: number, streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null): void {
    while (streamletPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(streamletPrototype, "inlets")) {
        for (const name in streamletPrototype.inlets) {
          const inletDescriptor = streamletPrototype.inlets[name]!;
          if (inletDescriptor instanceof InletDescriptor) {
            const inlet = AbstractStreamlet.reflectInletField(streamlet, inletDescriptor);
            inlet.recohereOutput(version);
          } else if (inletDescriptor instanceof InoutletDescriptor) {
            const inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, inletDescriptor);
            inoutlet.recohereOutput(version);
          }
        }
      }
      streamletPrototype = Object.getPrototypeOf(streamletPrototype);
    }
  }

  protected onRecohere(version: number): void {
    // hook
  }

  protected onRecohereOutlets(version: number): void {
    AbstractStreamlet.recohereOutlets(version, this, Object.getPrototypeOf(this));
  }

  /** @hidden */
  static recohereOutlets<I, O>(version: number, streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null): void {
    while (streamletPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(streamletPrototype, "outlets")) {
        for (const name in streamletPrototype.outlets) {
          const outletDescriptor = streamletPrototype.outlets[name]!;
          if (outletDescriptor instanceof OutletDescriptor) {
            const outlet = AbstractStreamlet.reflectOutletField(streamlet, outletDescriptor);
            outlet.recohereInput(version);
          } else if (outletDescriptor instanceof InoutletDescriptor) {
            const inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, outletDescriptor);
            inoutlet.recohereInput(version);
          }
        }
      }
      streamletPrototype = Object.getPrototypeOf(streamletPrototype);
    }
  }

  protected didRecohere(version: number): void {
    // hook
  }

  /** @hidden */
  static reflectEachInlet<I, O, T>(streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null,
                                   callback: (inlet: Inlet<I>, name: string, index: number) => T | void): T | undefined;
  /** @hidden */
  static reflectEachInlet<I, O, T, S>(streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null,
                                      callback: (this: S, inlet: Inlet<I>, name: string, index: number) => T | void,
                                      thisArg: S): T | undefined;
  /** @hidden */
  static reflectEachInlet<I, O, T, S>(streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null,
                                      callback: (this: S | undefined, inlet: Inlet<I>, name: string, index: number) => T | void,
                                      thisArg?: S): T | undefined {
    let index = 0;
    while (streamletPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(streamletPrototype, "inlets")) {
        for (const name in streamletPrototype.inlets) {
          const inletDescriptor = streamletPrototype.inlets[name]!;
          let inlet: Inlet<I> | null;
          if (inletDescriptor instanceof InletDescriptor) {
            inlet = AbstractStreamlet.reflectInletField(streamlet, inletDescriptor);
          } else if (inletDescriptor instanceof InoutletDescriptor) {
            inlet = AbstractStreamlet.reflectInoutletField(streamlet, inletDescriptor);
          } else {
            inlet = null;
          }
          if (inlet !== null) {
            const result = callback.call(thisArg, inlet, inletDescriptor.name, index);
            if (result !== void 0) {
              return result;
            }
            index += 1;
          }
        }
      }
      streamletPrototype = Object.getPrototypeOf(streamletPrototype);
    }
    return void 0;
  }

  /** @hidden */
  static reflectEachOutlet<I, O, T>(streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null,
                                       callback: (outlet: Outlet<O>, name: string, index: number) => T | void): T | undefined;
  /** @hidden */
  static reflectEachOutlet<I, O, T, S>(streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null,
                                       callback: (this: S, outlet: Outlet<O>, name: string, index: number) => T | void,
                                       thisArg: S): T | undefined;
  /** @hidden */
  static reflectEachOutlet<I, O, T, S>(streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null,
                                       callback: (this: S | undefined, outlet: Outlet<O>, name: string, index: number) => T | void,
                                       thisArg?: S): T | undefined {
    let index = 0;
    while (streamletPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(streamletPrototype, "outlets")) {
        for (const name in streamletPrototype.outlets) {
          const outletDescriptor = streamletPrototype.outlets[name]!;
          let outlet: Outlet<O> | null;
          if (outletDescriptor instanceof OutletDescriptor) {
            outlet = AbstractStreamlet.reflectOutletField(streamlet, outletDescriptor);
          } else if (outletDescriptor instanceof InoutletDescriptor) {
            outlet = AbstractStreamlet.reflectInoutletField(streamlet, outletDescriptor);
          } else {
            outlet = null;
          }
          if (outlet !== null) {
            const result = callback.call(thisArg, outlet, outletDescriptor.name, index);
            if (result !== void 0) {
              return result;
            }
            index += 1;
          }
        }
      }
      streamletPrototype = Object.getPrototypeOf(streamletPrototype);
    }
    return void 0;
  }

  /** @hidden */
  static reflectInletCount(streamletPrototype: StreamletPrototype | null): number {
    let count = 0;
    while (streamletPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(streamletPrototype, "inlets")) {
        for (const _ in streamletPrototype.inlets) {
          count += 1;
        }
      }
      streamletPrototype = Object.getPrototypeOf(streamletPrototype);
    }
    return count;
  }

  /** @hidden */
  static reflectOutletCount(streamletPrototype: StreamletPrototype | null): number {
    let count = 0;
    while (streamletPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(streamletPrototype, "outlets")) {
        for (const _ in streamletPrototype.outlets) {
          count += 1;
        }
      }
      streamletPrototype = Object.getPrototypeOf(streamletPrototype);
    }
    return count;
  }

  /** @hidden */
  static reflectInletIndex<I, O>(index: number, streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null): [string, Inlet<I>] | null {
    while (streamletPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(streamletPrototype, "inlets")) {
        for (const name in streamletPrototype.inlets) {
          if (index === 0) {
            const inletDescriptor = streamletPrototype.inlets[name]!;
            if (inletDescriptor instanceof InletDescriptor) {
              return [inletDescriptor.name, AbstractStreamlet.reflectInletField(streamlet, inletDescriptor)];
            } else if (inletDescriptor instanceof InoutletDescriptor) {
              return [inletDescriptor.name, AbstractStreamlet.reflectInoutletField(streamlet, inletDescriptor)];
            } else {
              return null;
            }
          }
          index -= 1;
        }
      }
      streamletPrototype = Object.getPrototypeOf(streamletPrototype);
    }
    return null;
  }

  /** @hidden */
  static reflectOutletIndex<I, O>(index: number, streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null): [string, Outlet<O>] | null {
    while (streamletPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(streamletPrototype, "outlets")) {
        for (const name in streamletPrototype.outlets) {
          if (index === 0) {
            const outletDescriptor = streamletPrototype.outlets[name]!;
            if (outletDescriptor instanceof OutletDescriptor) {
              return [outletDescriptor.name, AbstractStreamlet.reflectOutletField(streamlet, outletDescriptor)];
            } else if (outletDescriptor instanceof InoutletDescriptor) {
              return [outletDescriptor.name, AbstractStreamlet.reflectInoutletField(streamlet, outletDescriptor)];
            } else {
              return null;
            }
          }
          index -= 1;
        }
      }
      streamletPrototype = Object.getPrototypeOf(streamletPrototype);
    }
    return null;
  }

  /** @hidden */
  static reflectInletKey<I, O>(key: string, streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null): Inlet<I> | null {
    while (streamletPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(streamletPrototype, "inlets")) {
        const inletDescriptor = streamletPrototype.inlets![key];
        if (inletDescriptor !== void 0) {
          if (inletDescriptor instanceof InletDescriptor) {
            return AbstractStreamlet.reflectInletField(streamlet, inletDescriptor);
          } else if (inletDescriptor instanceof InoutletDescriptor) {
            return AbstractStreamlet.reflectInoutletField(streamlet, inletDescriptor);
          } else {
            return null;
          }
        }
      }
      streamletPrototype = Object.getPrototypeOf(streamletPrototype);
    }
    return null;
  }

  /** @hidden */
  static reflectOutletKey<I, O>(key: string, streamlet: Streamlet<I, O>, streamletPrototype: StreamletPrototype | null): Outlet<O> | null {
    while (streamletPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(streamletPrototype, "outlets")) {
        const outletDescriptor = streamletPrototype.outlets![key];
        if (outletDescriptor !== void 0) {
          if (outletDescriptor instanceof OutletDescriptor) {
            return AbstractStreamlet.reflectOutletField(streamlet, outletDescriptor);
          } else if (outletDescriptor instanceof InoutletDescriptor) {
            return AbstractStreamlet.reflectInoutletField(streamlet, outletDescriptor);
          } else {
            return null;
          }
        }
      }
      streamletPrototype = Object.getPrototypeOf(streamletPrototype);
    }
    return null;
  }

  /** @hidden */
  static reflectInletField<I, O>(streamlet: Streamlet<I, O>, inletDescriptor: InletDescriptor): Inlet<I> {
    if (inletDescriptor.type === "value") {
      return AbstractStreamlet.reflectValueInletField(streamlet, inletDescriptor.key);
    } else if (inletDescriptor.type === "map") {
      return AbstractStreamlet.reflectMapInletField(streamlet, inletDescriptor.key);
    } else {
      throw new TypeError(inletDescriptor.type);
    }
  }

  /** @hidden */
  static reflectValueInletField<I, O>(streamlet: Streamlet<I, O>, key: string): Inlet<I> {
    let inlet = (streamlet as any)[key] as Inlet<I> | undefined;
    if (inlet === void 0) {
      if (streamlet instanceof AbstractStreamlet) {
        inlet = streamlet.inlet();
      } else {
        inlet = new StreamletInlet<I>(streamlet);
      }
      (streamlet as any)[key] = inlet;
    }
    return inlet;
  }

  /** @hidden */
  static reflectMapInletField<I, O>(streamlet: Streamlet<I, O>, key: string): Inlet<I> {
    return null as any; // TODO
  }

  /** @hidden */
  static reflectOutletField<I, O>(streamlet: Streamlet<I, O>, outletDescriptor: OutletDescriptor): Outlet<O> {
    if (outletDescriptor.type === "value") {
      return AbstractStreamlet.reflectValueOutletField(streamlet, outletDescriptor.key);
    } else if (outletDescriptor.type === "map") {
      return AbstractStreamlet.reflectMapOutletField(streamlet, outletDescriptor.key);
    } else {
      throw new TypeError(outletDescriptor.type);
    }
  }

  /** @hidden */
  static reflectValueOutletField<I, O>(streamlet: Streamlet<I, O>, key: string): Outlet<O> {
    let outlet = (streamlet as any)[key] as Outlet<O> | undefined;
    if (outlet === void 0) {
      if (streamlet instanceof AbstractStreamlet) {
        outlet = streamlet.outlet();
      } else {
        outlet = new StreamletOutlet<O>(streamlet);
      }
      (streamlet as any)[key] = outlet;
    }
    return outlet;
  }

  /** @hidden */
  static reflectMapOutletField<I, O>(streamlet: Streamlet<I, O>, key: string): Outlet<O> {
    return null as any; // TODO
  }

  /** @hidden */
  static reflectInoutletField<I, O>(streamlet: Streamlet<I, O>, inoutletDescriptor: InoutletDescriptor): Inoutlet<I, O> {
    if (inoutletDescriptor.type === "value") {
      return AbstractStreamlet.reflectValueInoutletField(streamlet, inoutletDescriptor.key);
    } else if (inoutletDescriptor.type === "map") {
      return AbstractStreamlet.reflectMapInoutletField(streamlet, inoutletDescriptor.key);
    } else {
      throw new TypeError(inoutletDescriptor.type);
    }
  }

  /** @hidden */
  static reflectValueInoutletField<I, O>(streamlet: Streamlet<I, O>, key: string): Inoutlet<I, O> {
    let inoutlet = (streamlet as any)[key] as Inoutlet<I, O> | undefined;
    if (inoutlet === void 0) {
      if (streamlet instanceof AbstractStreamlet) {
        inoutlet = streamlet.inoutlet();
      } else {
        inoutlet = new StreamletInoutlet<I, O>(streamlet);
      }
      (streamlet as any)[key] = inoutlet;
    }
    return inoutlet;
  }

  /** @hidden */
  static reflectMapInoutletField<I, O>(streamlet: Streamlet<I, O>, key: string): Inoutlet<I, O> {
    return null as any; // TODO
  }

  /** @hidden */
  static init(streamletPrototype: StreamletPrototype): void {
    if (!Object.prototype.hasOwnProperty.call(streamletPrototype, "inlets")) {
      streamletPrototype.inlets = {};
    }
    if (!Object.prototype.hasOwnProperty.call(streamletPrototype, "outlets")) {
      streamletPrototype.outlets = {};
    }
    if (!Object.prototype.hasOwnProperty.call(streamletPrototype, "inoutlets")) {
      streamletPrototype.inoutlets = {};
    }
  }

  /** @hidden */
  static decorateInlet(options: InletOptions, target: StreamletPrototype, propertyKey: string | symbol): void {
    AbstractStreamlet.init(target);
    const name = options.name !== void 0 ? options.name : propertyKey.toString();
    const type = options.type !== void 0 ? options.type : "value";
    const inletDescriptor = new InletDescriptor(propertyKey.toString(), name, type);
    target.inlets![name] = inletDescriptor;
  }

  /** @hidden */
  static decorateOutlet(options: OutletOptions, target: StreamletPrototype, propertyKey: string | symbol): void {
    AbstractStreamlet.init(target);
    const name = options.name !== void 0 ? options.name : propertyKey.toString();
    const type = options.type !== void 0 ? options.type : "value";
    const outletDescriptor = new OutletDescriptor(propertyKey.toString(), name, type);
    target.outlets![name] = outletDescriptor;
  }

  /** @hidden */
  static decorateInoutlet(options: InoutletOptions, target: StreamletPrototype, propertyKey: string | symbol): void {
    AbstractStreamlet.init(target);
    const name = options.name !== void 0 ? options.name : propertyKey.toString();
    const type = options.type !== void 0 ? options.type : "value";
    const inoutletDescriptor = new InoutletDescriptor(propertyKey.toString(), name, type);
    target.inlets![name] = inoutletDescriptor;
    target.outlets![name] = inoutletDescriptor;
    target.inoutlets![name] = inoutletDescriptor;
  }
}
