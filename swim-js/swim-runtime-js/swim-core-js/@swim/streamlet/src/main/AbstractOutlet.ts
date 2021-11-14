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

import {Mutable, Arrays, Cursor} from "@swim/util";
import type {Inlet} from "./Inlet";
import type {Outlet} from "./Outlet";
import {OutletCombinators} from "./OutletCombinators";

/** @public */
export abstract class AbstractOutlet<O> implements Outlet<O> {
  constructor() {
    this.outputs = Arrays.empty;
    this.version = -1;
  }

  /** @internal */
  readonly outputs: ReadonlyArray<Inlet<O>>;

  /** @internal */
  readonly version: number;

  abstract get(): O | undefined;

  outputIterator(): Cursor<Inlet<O>> {
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

  disconnectInputs(): void {
    // nop
  }

  decohereInput(): void {
    if (this.version >= 0) {
      this.willDecohereInput();
      (this as Mutable<this>).version = -1;
      this.onDecohereInput();
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        outputs[i]!.decohereOutput();
      }
      this.didDecohereInput();
    }
  }

  recohereInput(version: number): void {
    if (this.version < 0) {
      this.willRecohereInput(version);
      (this as Mutable<this>).version = version;
      this.onRecohereInput(version);
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        outputs[i]!.recohereOutput(version);
      }
      this.didRecohereInput(version);
    }
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
/** @public */
export interface AbstractOutlet<O> extends OutletCombinators<O> {
}
OutletCombinators.define(AbstractOutlet.prototype);
