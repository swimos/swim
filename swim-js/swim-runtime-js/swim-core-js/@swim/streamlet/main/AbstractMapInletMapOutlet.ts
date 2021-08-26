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

import {Arrays, Iterator, Cursor} from "@swim/util";
import {BTree} from "@swim/collections";
import type {Inlet} from "./Inlet";
import type {Outlet} from "./Outlet";
import type {KeyEffect} from "./KeyEffect";
import {MapInlet} from "./MapInlet";
import {MapOutlet} from "./MapOutlet";
import {MapOutletCombinators} from "./MapOutletCombinators";
import {KeyOutlet} from "./KeyOutlet";
import type {MapInletMapOutlet} from "./MapInletMapOutlet";

export abstract class AbstractMapInletMapOutlet<KI, KO, VI, VO, I, O> implements MapInletMapOutlet<KI, KO, VI, VO, I, O> {
  constructor() {
    Object.defineProperty(this, "input", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "outputEffects", {
      value: new BTree(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "inputEffects", {
      value: new BTree(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "outlets", {
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

  readonly input!: MapOutlet<KI, VI, I> | null;

  /** @hidden */
  readonly outputEffects!: BTree<KI, KeyEffect>;

  /** @hidden */
  readonly inputEffects!: BTree<KO, KeyEffect>;

  /** @hidden */
  readonly outlets!: BTree<KO, KeyOutlet<KO, VO>>;

  /** @hidden */
  readonly outputs!: ReadonlyArray<Inlet<O>>;

  /** @hidden */
  readonly version!: number;

  bindInput(newInput: MapOutlet<KI, VI, I>): void {
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

  abstract has(key: KO): boolean;

  abstract get(): O;

  abstract get(key: KO): VO | undefined;

  abstract keyIterator(): Iterator<KO>;

  outlet(key: KO): Outlet<VO> {
    const oldOutlets = this.outlets;
    let outlet = oldOutlets.get(key);
    if (outlet === void 0) {
      outlet = new KeyOutlet(this, key);
      Object.defineProperty(this, "outlets", {
        value: oldOutlets.updated(key, outlet),
        enumerable: true,
        configurable: true,
      });
    }
    return outlet;
  }

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
    const oldOutlets = this.outlets;
    if (oldOutlets.isEmpty()) {
      Object.defineProperty(this, "outlets", {
        value: new BTree(),
        enumerable: true,
        configurable: true,
      });
      oldOutlets.forEach(function (key: KO, keyOutlet: KeyOutlet<KO, VO>) {
        keyOutlet.unbindOutputs();
      }, this);
    }
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
    const oldOutlets = this.outlets;
    if (oldOutlets.isEmpty()) {
      Object.defineProperty(this, "outlets", {
        value: new BTree(),
        enumerable: true,
        configurable: true,
      });
      oldOutlets.forEach(function (key: KO, keyOutlet: KeyOutlet<KO, VO>) {
        keyOutlet.disconnectOutputs();
      }, this);
    }
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

  decohereOutputKey(key: KI, effect: KeyEffect): void {
    const oldOutputEffects = this.outputEffects;
    if (oldOutputEffects.get(key) !== effect) {
      this.willDecohereOutputKey(key, effect);
      Object.defineProperty(this, "outputEffects", {
        value: oldOutputEffects.updated(key, effect),
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(this, "version", {
        value: -1,
        enumerable: true,
        configurable: true,
      });
      this.onDecohereOutputKey(key, effect);
      this.didDecohereOutputKey(key, effect);
    }
  }

  decohereInputKey(key: KO, effect: KeyEffect): void {
    const oldInputEffects = this.inputEffects;
    if (oldInputEffects.get(key) !== effect) {
      this.willDecohereInputKey(key, effect);
      Object.defineProperty(this, "inputEffects", {
        value: oldInputEffects.updated(key, effect),
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(this, "version", {
        value: -1,
        enumerable: true,
        configurable: true,
      });
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
        Object.defineProperty(this, "outputEffects", {
          value: oldOutputEffects.removed(key),
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

  recohereInputKey(key: KO, version: number): void {
    if (this.version < 0) {
      const oldInputEffects = this.inputEffects;
      const oldEffect = oldInputEffects.get(key);
      if (oldEffect !== void 0) {
        const newEffect = this.willRecohereInputKey(key, oldEffect, version);
        if (oldEffect !== newEffect) {
          this.decohereInputKey(key, newEffect);
        }
        Object.defineProperty(this, "inputEffects", {
          value: oldInputEffects.removed(key),
          enumerable: true,
          configurable: true,
        });
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
export interface AbstractMapInletMapOutlet<KI, KO, VI, VO, I, O> extends MapOutletCombinators<KO, VO, O> {
}
MapOutletCombinators.define(AbstractMapInletMapOutlet.prototype);
