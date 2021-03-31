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

import {Arrays, Cursor} from "@swim/util";
import type {Inlet} from "./Inlet";
import type {Outlet} from "./Outlet";
import {OutletCombinators} from "./OutletCombinators";

export abstract class AbstractOutlet<O> implements Outlet<O> {
  constructor() {
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

  /** @hidden */
  declare readonly outputs: ReadonlyArray<Inlet<O>>;

  /** @hidden */
  declare readonly version: number;

  abstract get(): O | undefined;

  outputIterator(): Cursor<Inlet<O>> {
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

  disconnectInputs(): void {
    // nop
  }

  decohereInput(): void {
    if (this.version >= 0) {
      this.willDecohereInput();
      Object.defineProperty(this, "version", {
        value: -1,
        enumerable: true,
        configurable: true,
      });
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
      Object.defineProperty(this, "version", {
        value: version,
        enumerable: true,
        configurable: true,
      });
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
export interface AbstractOutlet<O> extends OutletCombinators<O> {
}
OutletCombinators.define(AbstractOutlet.prototype);
