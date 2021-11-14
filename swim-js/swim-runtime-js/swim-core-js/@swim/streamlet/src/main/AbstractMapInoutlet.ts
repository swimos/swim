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
import {MapOutlet} from "./MapOutlet";
import {MapOutletCombinators} from "./MapOutletCombinators";
import {KeyOutlet} from "./KeyOutlet";
import type {MapInoutlet} from "./MapInoutlet";

/** @public */
export abstract class AbstractMapInoutlet<K, VI, VO, I, O> implements MapInoutlet<K, VI, VO, I, O> {
  constructor() {
    this.input = null;
    this.effects = new BTree();
    this.outlets = new BTree();
    this.outputs = Arrays.empty;
    this.version = -1;
  }

  readonly input: MapOutlet<K, VI, I> | null;

  /** @internal */
  readonly effects: BTree<K, KeyEffect>;

  /** @internal */
  readonly outlets: BTree<K, KeyOutlet<K, VO>>;

  /** @internal */
  readonly outputs: ReadonlyArray<Inlet<O>>;

  /** @internal */
  readonly version: number;

  bindInput(newInput: MapOutlet<K, VI, I>): void {
    if (!MapOutlet.is(newInput)) {
      throw new TypeError("" + newInput);
    }
    const oldInput = this.input;
    if (oldInput !== newInput) {
      if (oldInput !== null) {
        oldInput.unbindOutput(this);
      }
      (this as Mutable<this>).input = newInput;
      if (newInput !== null) {
        newInput.bindOutput(this);
      }
    }
  }

  unbindInput(): void {
    const oldInput = this.input;
    if (oldInput !== null) {
      oldInput.unbindOutput(this);
      (this as Mutable<this>).input = null;
    }
  }

  disconnectInputs(): void {
    const oldInput = this.input;
    if (oldInput !== null) {
      oldInput.unbindOutput(this);
      (this as Mutable<this>).input = null;
      oldInput.disconnectInputs();
    }
  }

  abstract has(key: K): boolean;

  abstract get(): O | undefined;

  abstract get(key: K): VO | undefined;

  abstract keyIterator(): Iterator<K>;

  outlet(key: K): Outlet<VO> {
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
      oldOutlets.forEach(function (key: K, keyOutlet: KeyOutlet<K, VO>) {
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
      oldOutlets.forEach(function (key: K, keyOutlet: KeyOutlet<K, VO>) {
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

  decohereOutputKey(key: K, effect: KeyEffect): void {
    this.decohereKey(key, effect);
  }

  decohereInputKey(key: K, effect: KeyEffect): void {
    this.decohereKey(key, effect);
  }

  decohereKey(key: K, effect: KeyEffect): void {
    const oldEffects = this.effects;
    if (oldEffects.get(key) !== effect) {
      this.willDecohereKey(key, effect);
      (this as Mutable<this>).effects = oldEffects.updated(key, effect);
      (this as Mutable<this>).version = -1;
      this.onDecohereKey(key, effect);
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
      this.didDecohereKey(key, effect);
    }
  }

  decohereOutput(): void {
    this.decohere();
  }

  decohereInput(): void {
    this.decohere();
  }

  decohere(): void {
    if (this.version >= 0) {
      this.willDecohere();
      (this as Mutable<this>).version = -1;
      this.onDecohere();
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        output.decohereOutput();
      }
      this.outlets.forEach(function (key: K, outlet: KeyOutlet<K, VO>): void {
        outlet.decohereInput();
      }, this);
      this.didDecohere();
    }
  }

  recohereOutputKey(key: K, version: number): void {
    this.recohereKey(key, version);
  }

  recohereInputKey(key: K, version: number): void {
    this.recohereKey(key, version);
  }

  recohereKey(key: K, version: number): void {
    if (this.version < 0) {
      const oldEffects = this.effects;
      const effect = oldEffects.get(key);
      if (effect !== void 0) {
        this.willRecohereKey(key, effect, version);
        (this as Mutable<this>).effects = oldEffects.removed(key);
        if (this.input !== null) {
          this.input.recohereInputKey(key, version);
        }
        this.onRecohereKey(key, effect, version);
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
        this.didRecohereKey(key, effect, version);
      }
    }
  }

  recohereOutput(version: number): void {
    this.recohere(version);
  }

  recohereInput(version: number): void {
    this.recohere(version);
  }

  recohere(version: number): void {
    if (this.version < 0) {
      this.willRecohere(version);
      this.effects.forEach(function (key: K): void {
        this.recohereKey(key, version);
      }, this);
      (this as Mutable<this>).version = version;
      this.onRecohere(version);
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        output.recohereOutput(version);
      }
      this.didRecohere(version);
    }
  }

  protected willDecohereKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected onDecohereKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected didDecohereKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected willDecohere(): void {
    // hook
  }

  protected onDecohere(): void {
    // hook
  }

  protected didDecohere(): void {
    // hook
  }

  protected willRecohereKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected onRecohereKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected didRecohereKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected willRecohere(version: number): void {
    // hook
  }

  protected onRecohere(version: number): void {
    // hook
  }

  protected didRecohere(version: number): void {
    // hook
  }
}
/** @public */
export interface AbstractMapInoutlet<K, VI, VO, I, O> extends MapOutletCombinators<K, VO, O> {
}
MapOutletCombinators.define(AbstractMapInoutlet.prototype);
