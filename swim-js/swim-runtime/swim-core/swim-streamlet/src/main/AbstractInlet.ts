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

import type {Mutable} from "@swim/util";
import type {Inlet} from "./Inlet";
import type {Outlet} from "./Outlet";

/** @public */
export abstract class AbstractInlet<I> implements Inlet<I> {
  constructor() {
    this.input = null;
    this.version = -1;
  }

  readonly input: Outlet<I> | null;

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

  disconnectOutputs(): void {
    // nop
  }

  decohereOutput(): void {
    if (this.version >= 0) {
      this.willDecohereOutput();
      (this as Mutable<this>).version = -1;
      this.onDecohereOutput();
      this.didDecohereOutput();
    }
  }

  recohereOutput(version: number): void {
    if (this.version < 0) {
      this.willRecohereOutput(version);
      (this as Mutable<this>).version = version;
      if (this.input !== null) {
        this.input.recohereInput(version);
      }
      this.onRecohereOutput(version);
      this.didRecohereOutput(version);
    }
  }

  protected willDecohereOutput(): void {
    // hook
  }

  protected onDecohereOutput(): void {
    // hook
  }

  protected didDecohereOutput(): void {
    // hook
  }

  protected willRecohereOutput(version: number): void {
    // hook
  }

  protected onRecohereOutput(version: number): void {
    // hook
  }

  protected didRecohereOutput(version: number): void {
    // hook
  }
}
