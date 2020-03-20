// Copyright 2015-2020 SWIM.AI inc.
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

import {InletType, InletOptions, Inlet} from "./Inlet";
import {OutletType, OutletOptions, Outlet} from "./Outlet";
import {InoutletType, InoutletOptions, Inoutlet} from "./Inoutlet";
import {StreamletContext} from "./StreamletContext";
import {StreamletScope} from "./StreamletScope";
import {Streamlet} from "./Streamlet";
import {GenericStreamlet} from "./GenericStreamlet";
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
export interface StreamletClass {
  _inlets?: {[name: string]: InletDescriptor | InoutletDescriptor | undefined};
  _outlets?: {[name: string]: OutletDescriptor | InoutletDescriptor | undefined};
  _inoutlets?: {[name: string]: InoutletDescriptor | undefined};
}

export abstract class AbstractStreamlet<I = unknown, O = I> implements GenericStreamlet<I, O> {
  protected scope: StreamletScope<O> | null;
  protected context: StreamletContext | null;
  /** @hidden */
  protected _version: number;

  constructor(scope: StreamletScope<O> | null = null) {
    this.scope = scope;
    this._version = -1;
  }

  protected streamletClass(): StreamletClass {
    return (this as any).__proto__ as StreamletClass;
  }

  streamletScope(): StreamletScope<O> | null {
    return this.scope;
  }

  setStreamletScope(scope: StreamletScope<O> | null): void {
    this.scope = scope;
  }

  streamletContext(): StreamletContext | null {
    if (this.context) {
      return this.context;
    }
    const scope = this.streamletScope();
    if (scope !== null) {
      return scope.streamletContext();
    }
    return null;
  }

  setStreamletContext(context: StreamletContext | null): void {
    this.context = context;
  }

  inlet(key: string): Inlet<I> | null;
  inlet<I2 extends I>(): Inlet<I2>;
  inlet(key?: string): Inlet<I> | null {
    if (key === void 0) {
      return new StreamletInlet<I>(this);
    } else {
      return AbstractStreamlet.reflectInletKey<I, O>(key, this, this.streamletClass());
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
      return AbstractStreamlet.reflectOutletKey<I, O>(key, this, this.streamletClass());
    } else {
      return key;
    }
  }

  inoutlet<I2 extends I, O2>(): Inoutlet<I2, O2> {
    return new StreamletInoutlet<I2, O2>(this as Streamlet<I2, O2>);
  }

  decohere(): void {
    if (this._version >= 0) {
      this.willDecohere();
      this._version = -1;
      this.onDecohere();
      this.onDecohereOutlets();
      this.didDecohere();
    }
  }

  recohere(version: number): void {
    if (this._version < 0) {
      this.willRecohere(version);
      this._version = version;
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
      const input = inlet.input();
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
    AbstractStreamlet.disconnectInputs(this, this.streamletClass());
  }

  /** @hidden */
  static disconnectInputs<I, O>(streamlet: Streamlet<I, O>, streamletClass: StreamletClass | null): void {
    while (streamletClass) {
      if (streamletClass.hasOwnProperty("_inlets")) {
        for (const name in streamletClass._inlets) {
          const inletDescriptor = streamletClass._inlets[name]!;
          if (inletDescriptor instanceof InletDescriptor) {
            const inlet = AbstractStreamlet.reflectInletField(streamlet, inletDescriptor);
            inlet.disconnectInputs();
          } else if (inletDescriptor instanceof InoutletDescriptor) {
            const inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, inletDescriptor);
            inoutlet.disconnectInputs();
          }
        }
      }
      streamletClass = (streamletClass as any).__proto__ as StreamletClass | null;
    }
  }

  disconnectOutputs(): void {
    AbstractStreamlet.disconnectOutputs(this, this.streamletClass());
  }

  /** @hidden */
  static disconnectOutputs<I, O>(streamlet: Streamlet<I, O>, streamletClass: StreamletClass | null): void {
    while (streamletClass) {
      if (streamletClass.hasOwnProperty("_outlets")) {
        for (const name in streamletClass._outlets) {
          const outletDescriptor = streamletClass._outlets[name]!;
          if (outletDescriptor instanceof OutletDescriptor) {
            const outlet = AbstractStreamlet.reflectOutletField(streamlet, outletDescriptor);
            outlet.disconnectOutputs();
          } else if (outletDescriptor instanceof InoutletDescriptor) {
            const inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, outletDescriptor);
            inoutlet.disconnectOutputs();
          }
        }
      }
      streamletClass = (streamletClass as any).__proto__ as StreamletClass | null;
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
    AbstractStreamlet.decohereOutlets(this, this.streamletClass());
  }

  /** @hidden */
  static decohereOutlets<I, O>(streamlet: Streamlet<I, O>, streamletClass: StreamletClass | null): void {
    while (streamletClass) {
      if (streamletClass.hasOwnProperty("_outlets")) {
        for (const name in streamletClass._outlets) {
          const outletDescriptor = streamletClass._outlets[name]!;
          if (outletDescriptor instanceof OutletDescriptor) {
            const outlet = AbstractStreamlet.reflectOutletField(streamlet, outletDescriptor);
            outlet.decohereInput();
          } else if (outletDescriptor instanceof InoutletDescriptor) {
            const inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, outletDescriptor);
            inoutlet.decohereInput();
          }
        }
      }
      streamletClass = (streamletClass as any).__proto__ as StreamletClass | null;
    }
  }

  protected didDecohere(): void {
    // hook
  }

  protected willRecohere(version: number): void {
    // hook
  }

  protected onRecohereInlets(version: number): void {
    AbstractStreamlet.recohereInlets(version, this, this.streamletClass());
  }

  /** @hidden */
  static recohereInlets<I, O>(version: number, streamlet: Streamlet<I, O>, streamletClass: StreamletClass | null): void {
    while (streamletClass) {
      if (streamletClass.hasOwnProperty("_inlets")) {
        for (const name in streamletClass._inlets) {
          const inletDescriptor = streamletClass._inlets[name]!;
          if (inletDescriptor instanceof InletDescriptor) {
            const inlet = AbstractStreamlet.reflectInletField(streamlet, inletDescriptor);
            inlet.recohereOutput(version);
          } else if (inletDescriptor instanceof InoutletDescriptor) {
            const inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, inletDescriptor);
            inoutlet.recohereOutput(version);
          }
        }
      }
      streamletClass = (streamletClass as any).__proto__ as StreamletClass | null;
    }
  }

  protected onRecohere(version: number): void {
    // hook
  }

  protected onRecohereOutlets(version: number): void {
    AbstractStreamlet.recohereOutlets(version, this, this.streamletClass());
  }

  /** @hidden */
  static recohereOutlets<I, O>(version: number, streamlet: Streamlet<I, O>, streamletClass: StreamletClass | null): void {
    while (streamletClass) {
      if (streamletClass.hasOwnProperty("_outlets")) {
        for (const name in streamletClass._outlets) {
          const outletDescriptor = streamletClass._outlets[name]!;
          if (outletDescriptor instanceof OutletDescriptor) {
            const outlet = AbstractStreamlet.reflectOutletField(streamlet, outletDescriptor);
            outlet.recohereInput(version);
          } else if (outletDescriptor instanceof InoutletDescriptor) {
            const inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, outletDescriptor);
            inoutlet.recohereInput(version);
          }
        }
      }
      streamletClass = (streamletClass as any).__proto__ as StreamletClass | null;
    }
  }

  protected didRecohere(version: number): void {
    // hook
  }

  /** @hidden */
  static reflectEachInlet<I, O, T, S>(streamlet: Streamlet<I, O>, streamletClass: StreamletClass | null,
                                      callback: (this: S, inlet: Inlet<I>, name: string, index: number) => T | void,
                                      thisArg?: S): T | undefined {
    let index = 0;
    while (streamletClass) {
      if (streamletClass.hasOwnProperty("_inlets")) {
        for (const name in streamletClass._inlets) {
          const inletDescriptor = streamletClass._inlets[name]!;
          let inlet: Inlet<I> | null;
          if (inletDescriptor instanceof InletDescriptor) {
            inlet = AbstractStreamlet.reflectInletField(streamlet, inletDescriptor);
          } else if (inletDescriptor instanceof InoutletDescriptor) {
            inlet = AbstractStreamlet.reflectInoutletField(streamlet, inletDescriptor);
          } else {
            inlet = null;
          }
          const result = callback.call(thisArg, inlet, inletDescriptor.name, index);
          if (result !== void 0) {
            return result;
          }
          index += 1;
        }
      }
      streamletClass = (streamletClass as any).__proto__ as StreamletClass | null;
    }
    return void 0;
  }

  /** @hidden */
  static reflectEachOutlet<I, O, T, S>(streamlet: Streamlet<I, O>, streamletClass: StreamletClass | null,
                                       callback: (this: S, outlet: Outlet<O>, name: string, index: number) => T | void,
                                       thisArg?: S): T | undefined {
    let index = 0;
    while (streamletClass) {
      if (streamletClass.hasOwnProperty("_outlets")) {
        for (const name in streamletClass._outlets) {
          const outletDescriptor = streamletClass._outlets[name]!;
          let outlet: Outlet<O> | null;
          if (outletDescriptor instanceof OutletDescriptor) {
            outlet = AbstractStreamlet.reflectOutletField(streamlet, outletDescriptor);
          } else if (outletDescriptor instanceof InoutletDescriptor) {
            outlet = AbstractStreamlet.reflectInoutletField(streamlet, outletDescriptor);
          } else {
            outlet = null;
          }
          const result = callback.call(thisArg, outlet, outletDescriptor.name, index);
          if (result !== void 0) {
            return result;
          }
          index += 1;
        }
      }
      streamletClass = (streamletClass as any).__proto__ as StreamletClass | null;
    }
    return void 0;
  }

  /** @hidden */
  static reflectInletCount(streamletClass: StreamletClass | null): number {
    let count = 0;
    while (streamletClass) {
      if (streamletClass.hasOwnProperty("_inlets")) {
        for (const _ in streamletClass._inlets) {
          count += 1;
        }
      }
      streamletClass = (streamletClass as any).__proto__ as StreamletClass | null;
    }
    return count;
  }

  /** @hidden */
  static reflectOutletCount(streamletClass: StreamletClass | null): number {
    let count = 0;
    while (streamletClass) {
      if (streamletClass.hasOwnProperty("_outlets")) {
        for (const _ in streamletClass._outlets) {
          count += 1;
        }
      }
      streamletClass = (streamletClass as any).__proto__ as StreamletClass | null;
    }
    return count;
  }

  /** @hidden */
  static reflectInletIndex<I, O>(index: number, streamlet: Streamlet<I, O>, streamletClass: StreamletClass | null): [string, Inlet<I>] | null {
    while (streamletClass) {
      if (streamletClass.hasOwnProperty("_inlets")) {
        for (const name in streamletClass._inlets) {
          if (index === 0) {
            const inletDescriptor = streamletClass._inlets[name]!;
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
      streamletClass = (streamletClass as any).__proto__ as StreamletClass | null;
    }
    return null;
  }

  /** @hidden */
  static reflectOutletIndex<I, O>(index: number, streamlet: Streamlet<I, O>, streamletClass: StreamletClass | null): [string, Outlet<O>] | null {
    while (streamletClass) {
      if (streamletClass.hasOwnProperty("_outlets")) {
        for (const name in streamletClass._outlets) {
          if (index === 0) {
            const outletDescriptor = streamletClass._outlets[name]!;
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
      streamletClass = (streamletClass as any).__proto__ as StreamletClass | null;
    }
    return null;
  }

  /** @hidden */
  static reflectInletKey<I, O>(key: string, streamlet: Streamlet<I, O>, streamletClass: StreamletClass | null): Inlet<I> | null {
    while (streamletClass) {
      if (streamletClass.hasOwnProperty("_inlets")) {
        const inletDescriptor = streamletClass._inlets![key];
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
      streamletClass = (streamletClass as any).__proto__ as StreamletClass | null;
    }
    return null;
  }

  /** @hidden */
  static reflectOutletKey<I, O>(key: string, streamlet: Streamlet<I, O>, streamletClass: StreamletClass | null): Outlet<O> | null {
    while (streamletClass) {
      if (streamletClass.hasOwnProperty("_outlets")) {
        const outletDescriptor = streamletClass._outlets![key];
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
      streamletClass = (streamletClass as any).__proto__ as StreamletClass | null;
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
    if (!inlet) {
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
    if (!outlet) {
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
    if (!inoutlet) {
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
  static init(streamletClass: StreamletClass): void {
    if (!streamletClass.hasOwnProperty("_inlets")) {
      streamletClass._inlets = {};
    }
    if (!streamletClass.hasOwnProperty("_outlets")) {
      streamletClass._outlets = {};
    }
    if (!streamletClass.hasOwnProperty("_inoutlets")) {
      streamletClass._inoutlets = {};
    }
  }

  /** @hidden */
  static decorateInlet(options: InletOptions, target: StreamletClass, key: string): void {
    AbstractStreamlet.init(target);
    const name = options.name !== void 0 ? options.name : key;
    const type = options.type !== void 0 ? options.type : "value";
    const inletDescriptor = new InletDescriptor(key, name, type);
    target._inlets![name] = inletDescriptor;
  }

  /** @hidden */
  static decorateOutlet(options: OutletOptions, target: StreamletClass, key: string): void {
    AbstractStreamlet.init(target);
    const name = options.name !== void 0 ? options.name : key;
    const type = options.type !== void 0 ? options.type : "value";
    const outletDescriptor = new OutletDescriptor(key, name, type);
    target._outlets![name] = outletDescriptor;
  }

  /** @hidden */
  static decorateInoutlet(options: InoutletOptions, target: StreamletClass, key: string): void {
    AbstractStreamlet.init(target);
    const name = options.name !== void 0 ? options.name : key;
    const type = options.type !== void 0 ? options.type : "value";
    const inoutletDescriptor = new InoutletDescriptor(key, name, type);
    target._inlets![name] = inoutletDescriptor;
    target._outlets![name] = inoutletDescriptor;
    target._inoutlets![name] = inoutletDescriptor;
  }
}
