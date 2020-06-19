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

import {Outlet} from "./Outlet";
import {KeyEffect} from "./KeyEffect";
import {AbstractMapInlet} from "./AbstractMapInlet";

/**
 * A `MapInlet` that decoheres a parameterized `Outlet` whenever the
 * `MapInlet` decoheres, and that recoheres the parameterized `Outlet`
 * whenever the `MapInlet` recoheres.
 */
export class OutletMapInlet<K, V, O> extends AbstractMapInlet<K, V, O> {
  /** @hidden */
  protected readonly _outlet: Outlet<unknown>;

  constructor(outlet: Outlet<unknown>) {
    super();
    this._outlet = outlet;
  }

  outlet(): Outlet<unknown> {
    return this._outlet;
  }

  protected onDecohereOutputKey(key: K, effect: KeyEffect): void {
    this._outlet.decohereInput();
  }

  protected onDecohereOutput(): void {
    this._outlet.decohereInput();
  }

  protected onRecohereOutputKey(key: K, effect: KeyEffect, version: number): void {
    this._outlet.recohereInput(version);
  }

  protected onRecohereOutput(version: number): void {
    this._outlet.recohereInput(version);
  }
}
