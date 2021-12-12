// Copyright 2015-2021 Swim.inc
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
import type {MapInletMapOutlet} from "./MapInletMapOutlet";

/** @public */
export abstract class AbstractMapInletMapOutlet<KI, KO, VI, VO, I, O> implements MapInletMapOutlet<KI, KO, VI, VO, I, O> {
  constructor() {
    this.input = null;
    this.outputEffects = new BTree();
    this.inputEffects = new BTree();
    this.outlets = new BTree();
    this.outputs = Arrays.empty;
    this.version = -1;
  }

  readonly input: MapOutlet<KI, VI, I> | null;

  /** @internal */
  readonly outputEffects: BTree<KI, KeyEffect>;

  /** @internal */
  readonly inputEffects: BTree<KO, KeyEffect>;

  /** @internal */
  readonly outlets: BTree<KO, KeyOutlet<KO, VO>>;

  /** @internal */
  readonly outputs: ReadonlyArray<Inlet<O>>;

  /** @internal */
  readonly version: number;

  bindInput(newInput: MapOutlet<KI, VI, I>): void {
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

  abstract has(key: KO): boolean;

  abstract get(): O;

  abstract get(key: KO): VO | undefined;

  abstract keyIterator(): Iterator<KO>;

  outlet(key: KO): Outlet<VO> {
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
      oldOutlets.forEach(function (key: KO, keyOutlet: KeyOutlet<KO, VO>) {
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
      oldOutlets.forEach(function (key: KO, keyOutlet: KeyOutlet<KO, VO>) {
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

  decohereOutputKey(key: KI, effect: KeyEffect): void {
    const oldOutputEffects = this.outputEffects;
    if (oldOutputEffects.get(key) !== effect) {
      this.willDecohereOutputKey(key, effect);
      (this as Mutable<this>).outputEffects = oldOutputEffects.updated(key, effect);
      (this as Mutable<this>).version = -1;
      this.onDecohereOutputKey(key, effect);
      this.didDecohereOutputKey(key, effect);
    }
  }

  decohereInputKey(key: KO, effect: KeyEffect): void {
    const oldInputEffects = this.inputEffects;
    if (oldInputEffects.get(key) !== effect) {
      this.willDecohereInputKey(key, effect);
      (this as Mutable<this>).inputEffects = oldInputEffects.updated(key, effect);
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
      this.outlets.forEach(function (key: KO, outlet: KeyOutlet<KO, VO>): void {
        outlet.decohereInput();
      }, this);
      this.didDecohere();
    }
  }

  recohereOutputKey(key: KI, version: number): void {
    if (this.version < 0) {
      const oldOutputEffects = this.outputEffects;
      const effect = oldOutputEffects.get(key);
      if (effect !== void 0) {
        this.willRecohereOutputKey(key, effect, version);
        (this as Mutable<this>).outputEffects = oldOutputEffects.removed(key);
        if (this.input !== null) {
          this.input.recohereInputKey(key, version);
        }
        this.onRecohereOutputKey(key, effect, version);
        this.didRecohereOutputKey(key, effect, version);
      }
    }
  }

  recohereInputKey(key: KO, version: number): void {
    if (this.version < 0) {
      const oldInputEffects = this.inputEffects;
      const oldEffect = oldInputEffects.get(key);
      if (oldEffect !== void 0) {
        const newEffect = this.willRecohereInputKey(key, oldEffect, version);
        if (oldEffect !== newEffect) {
          this.decohereInputKey(key, newEffect);
        }
        (this as Mutable<this>).inputEffects = oldInputEffects.removed(key);
        this.onRecohereInputKey(key, newEffect, version);
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
        this.didRecohereInputKey(key, newEffect, version);
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
      this.outputEffects.forEach(function (key: KI): void {
        this.recohereOutputKey(key, version);
      }, this);
      this.inputEffects.forEach(function (key: KO): void {
        this.recohereInputKey(key, version);
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

  protected willDecohereOutputKey(key: KI, effect: KeyEffect): void {
    // hook
  }

  protected onDecohereOutputKey(key: KI, effect: KeyEffect): void {
    // hook
  }

  protected didDecohereOutputKey(key: KI, effect: KeyEffect): void {
    // hook
  }

  protected willDecohereInputKey(key: KO, effect: KeyEffect): void {
    // hook
  }

  protected onDecohereInputKey(key: KO, effect: KeyEffect): void {
    // hook
  }

  protected didDecohereInputKey(key: KO, effect: KeyEffect): void {
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

  protected willRecohereOutputKey(key: KI, effect: KeyEffect, version: number): void {
    // hook
  }

  protected onRecohereOutputKey(key: KI, effect: KeyEffect, version: number): void {
    // hook
  }

  protected didRecohereOutputKey(key: KI, effect: KeyEffect, version: number): void {
    // hook
  }

  protected willRecohereInputKey(key: KO, effect: KeyEffect, version: number): KeyEffect {
    return effect;
  }

  protected onRecohereInputKey(key: KO, effect: KeyEffect, version: number): void {
    // hook
  }

  protected didRecohereInputKey(key: KO, effect: KeyEffect, version: number): void {
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
export interface AbstractMapInletMapOutlet<KI, KO, VI, VO, I, O> extends MapOutletCombinators<KO, VO, O> {
}
MapOutletCombinators.define(AbstractMapInletMapOutlet.prototype);
