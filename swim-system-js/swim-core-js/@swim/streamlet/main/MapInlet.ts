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

import {Inlet} from "./Inlet";
import type {KeyEffect} from "./KeyEffect";

/**
 * Input connector into a `Streamlet` for a key-value map state.
 */
export interface MapInlet<K, V, I> extends Inlet<I> {
  /**
   * Marks this `MapInlet` as needing an `effect` applied to a given `key`.
   * Decohering an individual key decoheres the entire state of the `Inlet`.
   * But only the decoherent keys need to be updated in order to recohere the
   * overall state of the `Inlet`.
   */
  decohereOutputKey(key: K, effect: KeyEffect): void;

  /**
   * Updates the state of an individual `key` in this `MapInlet` to make it
   * consistent with the target `version`.  The `MapInlet` only needs to update
   * if the current `version` differs from the target `version`.  To update the
   * state of a key, the `MapInlet` first invokes [[MapOutlet.recohereInputKey]]
   * on its [[input]], if its input is a `MapOutlet`, or it invokes
   * [[Outlet.recohereInput]], if its input is not a `MapOutlet`.  Then,
   * if all decoherent keys have been recohered, the `MapInlet` invokes
   * [[Streamlet.recohere]] on its attached streamlet.
   */
  recohereOutputKey(key: K, version: number): void;
}

export const MapInlet = {} as {
  is<K, V, I>(object: unknown): object is MapInlet<K, V, I>;
};

MapInlet.is = function <K, V, I>(object: unknown): object is MapInlet<K, V, I> {
  if (typeof object === "object" && object !== null) {
    const inlet = object as MapInlet<K, V, I>;
    return Inlet.is(inlet)
        && typeof inlet.decohereOutputKey === "function"
        && typeof inlet.recohereOutputKey === "function";
  }
  return false;
};
