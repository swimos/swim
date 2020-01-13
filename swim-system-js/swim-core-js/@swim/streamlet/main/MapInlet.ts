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
import {KeyEffect} from "./KeyEffect";

/**
 * Input connector into a `Streamlet` for a key-value map state.
 */
export interface MapInlet<K, V, I> extends Inlet<I> {
  /**
   * Marks this `MapInlet` as needing an `effect` applied to a given `key`.
   * Invalidating an individual key invalidates the entire state of the `Inlet`.
   * But only the invalidated keys need to be updated in order to reconcile the
   * overall state of the `Inlet`.
   */
  invalidateOutputKey(key: K, effect: KeyEffect): void;

  /**
   * Reconciles the state of an individual `key` in this `MapInlet`, if the
   * version of this `MapInlet`'s state differs from the target `version`.
   * To reconcile the state of a key, the `MapInlet` first invokes
   * [[MapOutlet.reconcileInputKey]] on its [[input]], if its input is a
   * `MapOutlet`, or it invokes [[Outlet.reconcileInput]], if its input is not
   * a `MapOutlet`.  Then, if all invalid keys have been reconciled, the
   * `MapInlet` invokes [[Streamletreconcile]] on its attached streamlet.
   */
  reconcileOutputKey(key: K, version: number): void;
}

/** @hidden */
export const MapInlet = {
  is<K, V, I>(object: unknown): object is MapInlet<K, V, I> {
    if (typeof object === "object" && object) {
      const inlet = object as MapInlet<K, V, I>;
      return Inlet.is(inlet)
          && typeof inlet.invalidateOutputKey === "function"
          && typeof inlet.reconcileOutputKey === "function";
    }
    return false;
  },
};
