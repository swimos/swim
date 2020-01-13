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

import {Outlet} from "./Outlet";
import {AbstractInlet} from "./AbstractInlet";

/**
 * An `Inlet` that invalidates a parameterized `Outlet` whenever the `Inlet`
 * is invalidated, and that updates the parameterized `Outlet` whenever the
 * `Inlet` updates.
 */
export class OutletInlet<I> extends AbstractInlet<I> {
  /** @hidden */
  protected readonly _outlet: Outlet<unknown>;

  constructor(outlet: Outlet<unknown>) {
    super();
    this._outlet = outlet;
  }

  outlet(): Outlet<unknown> {
    return this._outlet;
  }

  protected onInvalidateOutput(): void {
    this._outlet.invalidateInput();
  }

  protected onReconcileOutput(version: number): void {
    this._outlet.reconcileInput(version);
  }
}
