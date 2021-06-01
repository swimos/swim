// Copyright 2015-2021 Swim inc.
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
import type {KeyEffect} from "./KeyEffect";
import {AbstractMapInlet} from "./AbstractMapInlet";

/**
 * A `MapInlet` that decoheres a parameterized `Outlet` whenever the
 * `MapInlet` decoheres, and that recoheres the parameterized `Outlet`
 * whenever the `MapInlet` recoheres.
 */
export class OutletMapInlet<K, V, O> extends AbstractMapInlet<K, V, O> {
  constructor(outlet: Outlet<unknown>) {
    super();
    Object.defineProperty(this, "outlet", {
      value: outlet,
      enumerable: true,
    });
  }

  readonly outlet!: Outlet<unknown>;

  protected override onDecohereOutputKey(key: K, effect: KeyEffect): void {
    this.outlet.decohereInput();
  }

  protected override onDecohereOutput(): void {
    this.outlet.decohereInput();
  }

  protected override onRecohereOutputKey(key: K, effect: KeyEffect, version: number): void {
    this.outlet.recohereInput(version);
  }

  protected override onRecohereOutput(version: number): void {
    this.outlet.recohereInput(version);
  }
}
