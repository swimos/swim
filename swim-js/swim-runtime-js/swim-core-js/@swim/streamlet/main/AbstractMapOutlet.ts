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

import {Mutable, Arrays, Iterator, Cursor} from "@swim/util";
import {BTree} from "@swim/collections";
import type {Inlet} from "./Inlet";
import type {Outlet} from "./Outlet";
import type {KeyEffect} from "./KeyEffect";
import {MapInlet} from "./MapInlet";
import type {MapOutlet} from "./MapOutlet";
import {MapOutletCombinators} from "./MapOutletCombinators";
import {KeyOutlet} from "./KeyOutlet";

export abstract class AbstractMapOutlet<K, V, O> implements MapOutlet<K, V, O> {
  constructor() {
    this.effects = new BTree();
    this.outlets = new BTree();
    this.outputs = Arrays.empty;
    this.version = -1;
  }

  /** @hidden */
  readonly effects: BTree<K, KeyEffect>;

  /** @hidden */
  readonly outlets: BTree<K, KeyOutlet<K, V>>;

  /** @hidden */
  readonly outputs: ReadonlyArray<Inlet<O>>;

  /** @hidden */
  readonly version: number;

  abstract has(key: K): boolean;

  abstract get(): O | undefined;

  abstract get(key: K): V | undefined;

  abstract keyIterator(): Iterator<K>;

  outlet(key: K): Outlet<V> {
    const oldOutlets = this.outlets;
    let outlet = oldOutlets.get(key);
    if (outlet === void 0) {
      outlet = new KeyOutlet(this, key);
      (this as Mutable<this>).outlets = oldOutlets.updated(key, outlet);
    }
    return outlet;
  }

  outputIterator(): Iterator<Inlet<O>> {
    return Cursor.array(this.outputs);
  }

  bindOutput(output: Inlet<O>): void {
    (this as Mutable<this>).outputs = Arrays.inserted(output, this.outputs);
  }

  unbindOutput(output: Inlet<O>): void {
    (this as Mutable<this>).outputs = Arrays.removed(output, this.outputs);
  }

  unbindOutputs(): void {
    const oldOutlets = this.outlets;
    if (oldOutlets.isEmpty()) {
      (this as Mutable<this>).outlets = new BTree();
      oldOutlets.forEach(function (key: K, keyOutlet: KeyOutlet<K, V>) {
        keyOutlet.unbindOutputs();
      }, this);
    }
    const oldOutputs = this.outputs;
    (this as Mutable<this>).outputs = Arrays.empty;
    for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
      const output = oldOutputs[i]!;
      output.unbindInput();
    }
  }

  disconnectOutputs(): void {
    const oldOutlets = this.outlets;
    if (oldOutlets.isEmpty()) {
      (this as Mutable<this>).outlets = new BTree();
      oldOutlets.forEach(function (key: K, keyOutlet: KeyOutlet<K, V>) {
        keyOutlet.disconnectOutputs();
      }, this);
    }
    const oldOutputs = this.outputs;
    (this as Mutable<this>).outputs = Arrays.empty;
    for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
      const output = oldOutputs[i]!;
      output.unbindInput();
      output.disconnectOutputs();
    }
  }

  disconnectInputs(): void {
    // nop
  }

  decohereInputKey(key: K, effect: KeyEffect): void {
    const oldEffects = this.effects;
    if (oldEffects.get(key) !== effect) {
      this.willDecohereInputKey(key, effect);
      (this as Mutable<this>).effects = oldEffects.updated(key, effect);
      (this as Mutable<this>).version = -1;
      this.onDecohereInputKey(key, effect);
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        if (MapInlet.is(output)) {
          output.decohereOutputKey(key, effect);
        } else {
          output.decohereOutput();
        }
      }
      const outlet = this.outlets.get(key);
      if (outlet !== void 0) {
        outlet.decohereInput();
      }
      this.didDecohereInputKey(key, effect);
    }
  }

  decohereInput(): void {
    if (this.version >= 0) {
      this.willDecohereInput();
      (this as Mutable<this>).version = -1;
      this.onDecohereInput();
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        output.decohereOutput();
      }
      this.outlets.forEach(function (key: K, outlet: KeyOutlet<K, V>): void {
        outlet.decohereInput();
      }, this);
      this.didDecohereInput();
    }
  }

  recohereInputKey(key: K, version: number): void {
    if (this.version < 0) {
      const oldEffects = this.effects;
      const effect = oldEffects.get(key);
      if (effect !== void 0) {
        this.willRecohereInputKey(key, effect, version);
        (this as Mutable<this>).effects = oldEffects.removed(key);
        this.onRecohereInputKey(key, effect, version);
        const outputs = this.outputs;
        for (let i = 0, n = outputs.length; i < n; i += 1) {
          const output = outputs[i];
          if (MapInlet.is(output)) {
            output.recohereOutputKey(key, version);
          }
        }
        const outlet = this.outlets.get(key);
        if (outlet !== void 0) {
          outlet.recohereInput(version);
        }
        this.didRecohereInputKey(key, effect, version);
      }
    }
  }

  recohereInput(version: number): void {
    if (this.version < 0) {
      this.willRecohereInput(version);
      this.effects.forEach(function (key: K): void {
        this.recohereInputKey(key, version);
      }, this);
      (this as Mutable<this>).version = version;
      this.onRecohereInput(version);
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        output.recohereOutput(version);
      }
      this.didRecohereInput(version);
    }
  }

  protected willDecohereInputKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected onDecohereInputKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected didDecohereInputKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected willDecohereInput(): void {
    // hook
  }

  protected onDecohereInput(): void {
    // hook
  }

  protected didDecohereInput(): void {
    // hook
  }

  protected willRecohereInputKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected onRecohereInputKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected didRecohereInputKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected willRecohereInput(version: number): void {
    // hook
  }

  protected onRecohereInput(version: number): void {
    // hook
  }

  protected didRecohereInput(version: number): void {
    // hook
  }
}
export interface AbstractMapOutlet<K, V, O> extends MapOutletCombinators<K, V, O> {
}
MapOutletCombinators.define(AbstractMapOutlet.prototype);
