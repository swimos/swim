// Copyright 2015-2019 SWIM.AI inc.
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

  invalidateOutput(): void {
    if (this._version >= 0) {
      this.willInvalidateOutput();
      this._version = -1;
      this.onInvalidateOutput();
      this.didInvalidateOutput();
    }
  }

  reconcileOutput(version: number): void {
    if (this._version < 0) {
      this.willReconcileOutput(version);
      this._version = version;
      if (this._input !== null) {
        this._input.reconcileInput(version);
      }
      this.onReconcileOutput(version);
      this.didReconcileOutput(version);
    }
  }

  protected willInvalidateOutput(): void {
    // stub
  }

  protected onInvalidateOutput(): void {
    // stub
  }

  protected didInvalidateOutput(): void {
    // stub
  }

  protected willReconcileOutput(version: number): void {
    // stub
  }

  protected onReconcileOutput(version: number): void {
    // stub
  }

  protected didReconcileOutput(version: number): void {
    // stub
  }
}
