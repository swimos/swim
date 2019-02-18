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

package swim.streamlet;

/**
 * Stateful node in a dataflow graph that uses the state of its {@link Inlet
 * Inlets} to compute the state of its {@link Outlet Outlets}.
 */
public interface Streamlet<I, O> extends StreamletScope<O> {
  /**
   * Returns the lexically scoped parent of this {@code Streamlet}.  Returns
   * {@code null} if this {@code Streamlet} has no lexical parent.
   */
  @Override
  StreamletScope<? extends O> streamletScope();

  /**
   * Sets the lexically scoped parent of this {@code Streamlet}.
   */
  void setStreamletScope(StreamletScope<? extends O> scope);

  /**
   * Returns the environment in which this {@code Streamlet} operates.
   */
  @Override
  StreamletContext streamletContext();

  /**
   * Sets the environment in which this {@code Streamlet} operates.
   */
  void setStreamletContext(StreamletContext context);

  /**
   * Returns the {@code Inlet} to this {@code Streamlet} identified by the
   * given {@code key}; returns {@code null} if this {@code Streamlet} has no
   * such {@code Inlet}.
   */
  Inlet<I> inlet(String key);

  /**
   * Connects the {@code Inlet} of this {@code Streamlet}, identified by the
   * given {@code key}, to the {@code input} from which the {@code Inlet}
   * should acquire its state.  Delegates to {@link Inlet#bindInput(Outlet)} on
   * the identified {@code Inlet}.
   *
   * @throws IllegalArgumentException if this {@code Streamlet} has no {@code
   *         Inlet} with the given {@code key}.
   */
  void bindInput(String key, Outlet<? extends I> input);

  /**
   * Disconnects the {@code Inlet} of this {@code Streamlet}, identified by the
   * given {@code key}, from its {@link Inlet#input() input} {@code Outlet},
   * if connected.  Delegates to {@link Inlet#unbindInput()} on the
   * identified {@code Inlet}.
   *
   * @throws IllegalArgumentException if this {@code Streamlet} has no {@code
   *         Inlet} with the given {@code key}.
   */
  void unbindInput(String key);

  /**
   * Returns the {@code Outlet} of this {@code Streamlet} identified by the
   * given {@code key}; returns {@code null} if this {@code Streamlet} has no
   * such {@code Outlet}.
   */
  @Override
  Outlet<O> outlet(String key);

  /**
   * Disconnects all {@code Inlet}s dominated by this {@code Streamlet} in the
   * dataflow dependency graph.  Used to recursively clean up chains of
   * combinators terminating at this {@code Streamlet}.
   */
  void disconnectInputs();

  /**
   * Disconnects all {@code Inlets}s dominated by this {@code Streamlet} in the
   * dataflow graph.  Used to recursively clean up chains of combinators
   * originating from this {@code Streamlet}.
   */
  void disconnectOutputs();

  /**
   * Marks this {@code Streamlet}—and all of its outlets—as having stale state.
   * Invalidating a {@code Streamlet} will recursively invalidate all
   * streamlets that transitively depend on the state of this {@code Streamlet}.
   * Invalidating a {@code Streamlet} does not cause its state to be
   * recomputed.  A subsequent {@link #reconcile(int)} call will reconcile the
   * state of the {@code Streamlet}.
   */
  void invalidate();

  /**
   * Reconciles the state of this {@code Streamlet}, if the version of this
   * {@code Streamlet}'s state differs from the target {@code version}.
   * To reconcile its state, the {@code Streamlet} first invokes {@link
   * Inlet#reconcileOutput(int)} on each of its inlets, to ensure that its
   * input states are up-to-date.  It then recomputes its own state, in an
   * implementation defined manner.  Finally, it invokes {@link
   * Outlet#reconcileInput(int)} on its outlets, causing all transitively
   * dependent streamlets to reconcile their own state.
   */
  void reconcile(int version);
}
