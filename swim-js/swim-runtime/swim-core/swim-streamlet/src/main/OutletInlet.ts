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

import type {Outlet} from "./Outlet";
import {AbstractInlet} from "./AbstractInlet";

/**
 * An `Inlet` that decoheres a parameterized `Outlet` whenever the `Inlet`
 * decoheres, and that recoheres the parameterized `Outlet` whenever the
 * `Inlet` recoheres.
 * @public
 */
export class OutletInlet<I> extends AbstractInlet<I> {
  constructor(outlet: Outlet<unknown>) {
    super();
    this.outlet = outlet;
  }

  readonly outlet: Outlet<unknown>;

  protected override onDecohereOutput(): void {
    this.outlet.decohereInput();
  }

  protected override onRecohereOutput(version: number): void {
    this.outlet.recohereInput(version);
  }
}
