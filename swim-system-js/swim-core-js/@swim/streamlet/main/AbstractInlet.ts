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

import {Inlet} from "./Inlet";
import {Outlet} from "./Outlet";

export abstract class AbstractInlet<I> implements Inlet<I> {
  /** @hidden */
  protected _input: Outlet<I> | null;
  /** @hidden */
  protected _version: number;

  constructor() {
    this._input = null;
    this._version = -1;
  }

  input(): Outlet<I> | null {
    return this._input;
  }

  bindInput(input: Outlet<I> | null): void {
    if (this._input !== null) {
      this._input.unbindOutput(this);
    }
    this._input = input;
    if (this._input !== null) {
      this._input.bindOutput(this);
    }
  }

  unbindInput(): void {
    if (this._input !== null) {
      this._input.unbindOutput(this);
    }
    this._input = null;
  }

  disconnectInputs(): void {
    const input = this._input;
    if (input !== null) {
      input.unbindOutput(this);
      this._input = null;
      input.disconnectInputs();
    }
  }

  disconnectOutputs(): void {
    // nop
  }

  decohereOutput(): void {
    if (this._version >= 0) {
      this.willDecohereOutput();
      this._version = -1;
      this.onDecohereOutput();
      this.didDecohereOutput();
    }
  }

  recohereOutput(version: number): void {
    if (this._version < 0) {
      this.willRecohereOutput(version);
      this._version = version;
      if (this._input !== null) {
        this._input.recohereInput(version);
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
