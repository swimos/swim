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
import type {Inlet} from "./Inlet";
import type {Outlet} from "./Outlet";
import {OutletCombinators} from "./OutletCombinators";
import type {Inoutlet} from "./Inoutlet";

/** @public */
export abstract class AbstractInoutlet<I, O> implements Inoutlet<I, O> {
  constructor() {
    this.input = null;
    this.outputs = Arrays.empty;
    this.version = -1;
  }

  readonly input: Outlet<I> | null;

  /** @internal */
  readonly outputs: ReadonlyArray<Inlet<O>>;

  /** @internal */
  readonly version: number;

  bindInput(newInput: Outlet<I> | null): void {
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

  abstract get(): O | undefined;

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
    const oldOutputs = this.outputs;
    (this as Mutable<this>).outputs = Arrays.empty;
    for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
      const output = oldOutputs[i]!;
      output.unbindInput();
    }
  }

  disconnectOutputs(): void {
    const oldOutputs = this.outputs;
    (this as Mutable<this>).outputs = Arrays.empty;
    for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
      const output = oldOutputs[i]!;
      output.unbindInput();
      output.disconnectOutputs();
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
        outputs[i]!.decohereOutput();
      }
      this.didDecohere();
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
      (this as Mutable<this>).version = version;
      if (this.input !== null) {
        this.input.recohereInput(version);
      }
      this.onRecohere(version);
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        outputs[i]!.recohereOutput(version);
      }
      this.didRecohere(version);
    }
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
export interface AbstractInoutlet<I, O> extends OutletCombinators<O> {
}
OutletCombinators.define(AbstractInoutlet.prototype);
