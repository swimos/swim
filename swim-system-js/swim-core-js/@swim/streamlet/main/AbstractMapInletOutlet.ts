// Copyright 2015-2020 Swim inc.
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

import {Arrays, Iterator, Cursor} from "@swim/util";
import {BTree} from "@swim/collections";
import type {Inlet} from "./Inlet";
import {OutletCombinators} from "./OutletCombinators";
import type {KeyEffect} from "./KeyEffect";
import {MapOutlet} from "./MapOutlet";
import type {MapInletOutlet} from "./MapInletOutlet";

export abstract class AbstractMapInletOutlet<K, V, I, O> implements MapInletOutlet<K, V, I, O> {
  constructor() {
    Object.defineProperty(this, "input", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "effects", {
      value: new BTree(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "outputs", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "version", {
      value: -1,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly input: MapOutlet<K, V, I> | null;

  /** @hidden */
  declare readonly effects: BTree<K, KeyEffect>;

  /** @hidden */
  declare readonly outputs: ReadonlyArray<Inlet<O>>;

  /** @hidden */
  declare readonly version: number;

  bindInput(newInput: MapOutlet<K, V, I>): void {
    if (!MapOutlet.is(newInput)) {
      throw new TypeError("" + newInput);
    }
    const oldInput = this.input;
    if (oldInput !== newInput) {
      if (oldInput !== null) {
        oldInput.unbindOutput(this);
      }
      Object.defineProperty(this, "input", {
        value: newInput,
        enumerable: true,
        configurable: true,
      });
      if (newInput !== null) {
        newInput.bindOutput(this);
      }
    }
  }

  unbindInput(): void {
    const oldInput = this.input;
    if (oldInput !== null) {
      oldInput.unbindOutput(this);
      Object.defineProperty(this, "input", {
        value: null,
        enumerable: true,
        configurable: true,
      });
    }
  }

  disconnectInputs(): void {
    const oldInput = this.input;
    if (oldInput !== null) {
      oldInput.unbindOutput(this);
      Object.defineProperty(this, "input", {
        value: null,
        enumerable: true,
        configurable: true,
      });
      oldInput.disconnectInputs();
    }
  }

  abstract get(): O | undefined;

  outputIterator(): Iterator<Inlet<O>> {
    return Cursor.array(this.outputs);
  }

  bindOutput(output: Inlet<O>): void {
    Object.defineProperty(this, "outputs", {
      value: Arrays.inserted(output, this.outputs),
      enumerable: true,
      configurable: true,
    });
  }

  unbindOutput(output: Inlet<O>): void {
    Object.defineProperty(this, "outputs", {
      value: Arrays.removed(output, this.outputs),
      enumerable: true,
      configurable: true,
    });
  }

  unbindOutputs(): void {
    const oldOutputs = this.outputs;
    Object.defineProperty(this, "outputs", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
      const output = oldOutputs[i]!;
      output.unbindInput();
    }
  }

  disconnectOutputs(): void {
    const oldOutputs = this.outputs;
    Object.defineProperty(this, "outputs", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
      const output = oldOutputs[i]!;
      output.unbindInput();
      output.disconnectOutputs();
    }
  }

  decohereOutputKey(key: K, effect: KeyEffect): void {
    const oldEffects = this.effects;
    if (oldEffects.get(key) !== effect) {
      this.willDecohereOutputKey(key, effect);
      Object.defineProperty(this, "effects", {
        value: oldEffects.updated(key, effect),
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(this, "version", {
        value: -1,
        enumerable: true,
        configurable: true,
      });
      this.onDecohereOutputKey(key, effect);
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        output.decohereOutput();
      }
      this.didDecohereOutputKey(key, effect);
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
      Object.defineProperty(this, "version", {
        value: -1,
        enumerable: true,
        configurable: true,
      });
      this.onDecohere();
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        output.decohereOutput();
      }
      this.didDecohere();
    }
  }

  recohereOutputKey(key: K, version: number): void {
    if (this.version < 0) {
      const oldEffects = this.effects;
      const effect = oldEffects.get(key);
      if (effect !== void 0) {
        this.willRecohereOutputKey(key, effect, version);
        Object.defineProperty(this, "effects", {
          value: oldEffects.removed(key),
          enumerable: true,
          configurable: true,
        });
        if (this.input !== null) {
          this.input.recohereInputKey(key, version);
        }
        this.onRecohereOutputKey(key, effect, version);
        this.didRecohereOutputKey(key, effect, version);
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
        this.recohereOutputKey(key, version);
      }, this);
      Object.defineProperty(this, "version", {
        value: version,
        enumerable: true,
        configurable: true,
      });
      this.onRecohere(version);
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        output.recohereOutput(version);
      }
      this.didRecohere(version);
    }
  }

  protected willDecohereOutputKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected onDecohereOutputKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected didDecohereOutputKey(key: K, effect: KeyEffect): void {
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

  protected willRecohereOutputKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected onRecohereOutputKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected didRecohereOutputKey(key: K, effect: KeyEffect, version: number): void {
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
export interface AbstractMapInletOutlet<K, V, I, O> extends OutletCombinators<O> {
}
OutletCombinators.define(AbstractMapInletOutlet.prototype);
