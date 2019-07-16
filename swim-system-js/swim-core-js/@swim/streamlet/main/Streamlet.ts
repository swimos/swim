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
import {StreamletContext} from "./StreamletContext";
import {StreamletScope} from "./StreamletScope";

/**
 * Stateful node in a dataflow graph that uses the state of its [[Inlet
 * inlets]] to compute the state of its [[Outlet Outlets]].
 */
export interface Streamlet<I = unknown, O = I> extends StreamletScope<O> {
  /**
   * Returns the lexically scoped parent of this `Streamlet`.  Returns `null`
   * if this `Streamlet` has no lexical parent.
   */
  streamletScope(): StreamletScope<O> | null;

  /**
   * Sets the lexically scoped parent of this `Streamlet`.
   */
  setStreamletScope(scope: StreamletScope<O> | null): void;

  /**
   * Returns the environment in which this `Streamlet` operates.
   */
  streamletContext(): StreamletContext | null;

  /**
   * Sets the environment in which this `Streamlet` operates.
   */
  setStreamletContext(context: StreamletContext | null): void;

  /**
   * Returns the `Inlet` to this `Streamlet` identified by the given `key`;
   * returns `null` if this `Streamlet` has no such `Inlet`.
   */
  inlet(key: string): Inlet<I> | null;

  /**
   * Connects the `Inlet` of this `Streamlet`, identified by the given `key` to
   * the `input` from which the `Inlet` should acquire its state.  Delegates to
   * [[Inlet.bindInput]] on the identified `Inlet`.
   *
   * @throws `Error` if this `Streamlet` has no `Inlet` with the given `key`.
   */
  bindInput(key: string, input: Outlet<I>): void;

  /**
   * Disconnects the `Inlet` of this `Streamlet`, identified by the given
   * `key`, from its [[Inlet.input input]] `Outlet`, if connected.  Delegates
   * to [[Inlet.unbindInput]] on the identified `Inlet`.
   *
   * @throws `Error` if this `Streamlet` has no `Inlet` with the given `key`.
   */
  unbindInput(key: string): void;

  /**
   * Returns the `Outlet` of this `Streamlet` identified by the given `key`;
   * returns `null` if this `Streamlet` has no such `Outlet`.
   */
  outlet(key: string): Outlet<O> | null;

  /**
   * Disconnects all `Inlet`s dominated by this `Streamlet` in the dataflow
   * dependency graph.  Used to recursively clean up chains of combinators
   * terminating at this `Streamlet`.
   */
  disconnectInputs(): void;

  /**
   * Disconnects all `Inlets`s dominated by this `Streamlet` in the dataflow
   * graph.  Used to recursively clean up chains of combinators originating
   * from this `Streamlet`.
   */
  disconnectOutputs(): void;

  /**
   * Marks this `Streamlet`—and all of its outlets—as having stale state.
   * Invalidating a `Streamlet` will recursively invalidate all streamlets
   * that transitively depend on the state of this `Streamlet`.  Invalidating
   * a `Streamlet` does not cause its state to be recomputed.  A subsequent
   * [[reconcile]] call will reconcile the state of the `Streamlet`.
   */
  invalidate(): void;

  /**
   * Reconciles the state of this `Streamlet`, if the version of this
   * `Streamlet`'s state differs from the target `version`.  To reconcile its
   * state, the `Streamlet` first invokes [[Inlet.reconcileOutput]] on each of
   * its inlets, to ensure that its input states are up-to-date.  It then
   * recomputes its own state, in an implementation defined manner.  Finally,
   * it invokes [[Outlet.reconcileInput]] on its outlets, causing all
   * transitively dependent streamlets to reconcile their own state.
   */
  reconcile(version: number): void;
}

/** @hidden */
export const Streamlet = {
  is<I, O>(object: unknown): object is Streamlet<I, O> {
    if (typeof object === "object" && object) {
      const streamlet = object as Streamlet<I, O>;
      return typeof streamlet.streamletScope === "function"
          && typeof streamlet.setStreamletScope === "function"
          && typeof streamlet.streamletContext === "function"
          && typeof streamlet.setStreamletContext === "function";
    }
    return false;
  },
};
