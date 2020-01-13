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

export type InletType = "value" | "map";

export interface InletOptions {
  name?: string;
  type?: InletType;
}

/**
 * Input connector into a [[Streamlet]].  An `Inlet` represents a source from
 * which a `Streamlet` acquires state.
 *
 * In order for an `Inlet` to provide state to its `Streamlet`, it must bind to
 * an [[input]] source.  The input source of an `Inlet` is an [[Outlet]] of
 * some other `Streamlet`.  The [[bindInput]] method "plugs" the `Inlet` into
 * an `Outlet`.  The [[unbindInput]] method "unplugs" the `Inlet` from its
 * connected `Outlet`.
 *
 * The state of an `Inlet` has an integral _version_.  When its version is
 * negative, the state of the `Inlet` is considered _invalid_.  When any state
 * on which an `Inlet` transitively depends changes, the `Inlet` will be
 * [[invalidatOutput invalidated]].  Invalidation does not immediately cause an
 * `Inlet` to recompute its state.  Instead, a separate [[reconcileOutput
 * reconcile]] step causes all of the invalid paths in the dataflow graph
 * passing through the `Inlet` to reconcile their state.
 */
export interface Inlet<I = unknown> {
  /**
   * Returns the `Outlet` from which this `Inlet` acquires its state; returns
   * `null` if this `Inlet` is disconnected.
   */
  input(): Outlet<I> | null;

  /**
   * Connects this `Inlet` to an `Outlet` from which it will  acquire its
   * state.  If this `Inlet` is already connected, it will first disconnect
   * from its existing input.  Then, after updating its [[input]] property,
   * the `Inlet` will invoke [[Outlet.bindOutput]] on its new `input`.
   */
  bindInput(input: Outlet<I> | null): void;

  /**
   * Disconnects this `Inlet` from its input `Outlet`, if connected.  After
   * setting its [[input]] property to `null`, the `Inlet` will invoke
   * [[Outlet.unbindOutput]] on its old input, if defined.
   */
  unbindInput(): void;

  /**
   * Disconnects all `Inlet`s dominated by this `Inlet` in the dataflow
   * dependency graph.  Used to recursively clean up chains of combinators
   * terminating at this `Inlet`.
   */
  disconnectInputs(): void;

  /**
   * Disconnects all `Outlet`s dominated by this `Inlet` in the dataflow graph.
   * Used to recursively clean up chains of combinators passing through this
   * `Inlet`.
   */
  disconnectOutputs(): void;

  /**
   * Marks this `Inlet`—and the `Streamlet` to which this `Inlet` is attached—as
   * having stale state.  Invalidating an `Inlet` will recursively invalidate
   * all streamlets that transitively depend on the state of this `Inlet`.
   * Invalidating an `Inlet` does not cause its state to be recomputed.  A
   * subsequent [[reconcileOutput]] call will reconcile the state of the `Inlet`.
   */
  invalidateOutput(): void;

  /**
   * Reconciles the state of this `Inlet`, if the version of this `Inlet`'s
   * state differs from the target `version`.  To reconcile its state, the
   * `Inlet` first invokes [[Outlet.reconcileInput]] on its [[input]], to
   * ensure that its input is up-to-date.  It then invokes
   * [[Streamlet.reconcile]] on the `Streamlet` to which it's attached,
   * causing the `Streamlet` to reconcile its own state.
   */
  reconcileOutput(version: number): void;
}

/** @hidden */
export const Inlet = {
  is<I>(object: unknown): object is Inlet<I> {
    if (typeof object === "object" && object) {
      const inlet = object as Inlet<I>;
      return typeof inlet.input === "function"
          && typeof inlet.bindInput === "function"
          && typeof inlet.unbindInput === "function";
    }
    return false;
  },
};
