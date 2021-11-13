// Copyright 2015-2021 Swim Inc.
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

import type {Iterator} from "@swim/util";
import type {Inlet} from "./Inlet";
import type {OutletCombinators} from "./OutletCombinators";
import type {MapValueFunction, WatchValueFunction} from "./function";

export type OutletType = "value" | "map";

export interface OutletOptions {
  name?: string;
  type?: OutletType;
}

/**
 * Output connector from a [[Streamlet]].  An `Outlet` represents a sink to
 * which a `Streamlet` provides state.
 *
 * An `Outlet` has a one-to-many relationship with a set of output sinks.
 * An output sink of an `Outlet` is an `Inlet` of some other `Streamlet`.
 * The [[bindOutput]] method "plugs" an `Inlet` into the `Outlet`.
 * The [[unbindOutput]] method "unplugs" an `Inlet` from the `Outlet`.
 */
export interface Outlet<O = unknown> extends OutletCombinators<O> {
  /**
   * Returns the current state of this `Outlet`.
   */
  get(): O | undefined;

  /**
   * Returns an `Iterator` over the set of `Inlet`s that depend on the state of
   * this `Outlet`.
   */
  outputIterator(): Iterator<Inlet<O>>;

  /**
   * Adds an `output` to the set of `Inlet`s that depend on the state of this
   * `Outlet`.  The `output` will be decohered when the state of this
   * `Outlet` is decohered, and recohered when this `Outlet` is recohered.
   */
  bindOutput(output: Inlet<O>): void;

  /**
   * Removes an `output` from the set of `Inlet`s that depend on the state of
   * this `Outlet`.
   */
  unbindOutput(output: Inlet<O>): void;

  /**
   * Disconnects all outputs from this `Outlet` by invoking
   * [[Inlet.unbindInput]] on each `Inelt` that depends on the state of this
   * `Outlet`.
   */
  unbindOutputs(): void;

  /**
   * Disconnects all `Outlet`s dominated by this `Outlet` in the dataflow
   * graph.  Used to recursively clean up chains of combinators originating
   * from this `Inlet`.
   */
  disconnectOutputs(): void;

  /**
   * Disconnects all `Inlet`s dominated by this `Outlet` in the dataflow
   * dependency graph.  Used to recursively clean up chains of combinators
   * passing through this `Outlet`.
   */
  disconnectInputs(): void;

  /**
   * Marks this `Outlet`—and all [[outputIterator outputs]] that depend on the
   * state of this `Outlet`—as having decoherent state.
   */
  decohereInput(): void;

  /**
   * Updates the state of this `Outlet` to make it consistent with the target
   * `version`.  The `Outlet` only needs to update if its current `version`
   * differs from the target `version`.  To update its state, the `Outlet`
   * first invokes [[Streamlet.recohere]] on the `Streamlet` to which
   * it's attached. It then invokes [[Inlet.recohereOutput]] on each of its
   * dependent [[outputIterator outputs]].
   */
  recohereInput(version: number): void;

  memoize(): Outlet<O>;

  map<O2>(func: MapValueFunction<O, O2>): Outlet<O2>;

  watch(func: WatchValueFunction<O>): this;
}

/** @internal */
export const Outlet = (function () {
  const Outlet = {} as {
    is<O>(object: unknown): object is Outlet<O>;
  };

  Outlet.is = function <O>(object: unknown): object is Outlet<O> {
    if (typeof object === "object" && object !== null) {
      const outlet = object as Outlet<O>;
      return typeof outlet.outputIterator === "function"
          && typeof outlet.bindOutput === "function"
          && typeof outlet.unbindOutput === "function";
    }
    return false;
  };

  return Outlet;
})();
