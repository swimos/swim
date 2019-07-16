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

import java.util.Iterator;
import swim.streamlet.combinator.MapValueCombinator;
import swim.streamlet.combinator.MemoizeValueCombinator;
import swim.streamlet.combinator.WatchValueCombinator;
import swim.streamlet.function.MapValueFunction;
import swim.streamlet.function.WatchValueFunction;

/**
 * Output connector from a {@link Streamlet}.  An {@code Outlet} represents a
 * sink to which a {@code Streamlet} provides state.
 * <p>
 * An {@code Outlet} has a one-to-many relationship with a set of output sinks.
 * An output sink of an {@code Outlet} is an {@link Inlet} of some other {@code
 * Streamlet}.  The {@link #bindOutput(Inlet)} method &quot;plugs&quot; an {@code
 * Inlet} into the {@code Outlet}.  The {@link #unbindOutput(Inlet)} method
 * &quot;unplugs&quot; an {@code Inlet} from the {@code Outlet}.
 */
public interface Outlet<O> {
  /**
   * Returns the current state of this {@code Outlet}.
   */
  O get();

  /**
   * Returns an {@code Iterator} over the set of {@code Inlet}s that depend on
   * the state of this {@code Outlet}.
   */
  Iterator<? extends Inlet<? super O>> outputIterator();

  /**
   * Adds an {@code output} to the set of {@code Inlet}s that depend on the
   * state of this {@code Outlet}.  The {@code output} will be invalidated when
   * the state of this {@code Outlet} is invalidated, and updated when this
   * {@code Outlet} is updated.
   */
  void bindOutput(Inlet<? super O> output);

  /**
   * Removes an {@code output} from the set of {@code Inlet}s that depend on
   * the state of this {@code Outlet}.
   */
  void unbindOutput(Inlet<? super O> output);

  /**
   * Disconnects all outputs from this {@code Outlet} by invoking {@link
   * Inlet#unbindInput()} on each {@code Inelt} that depends on the state of
   * this {@code Outlet}.
   */
  void unbindOutputs();

  /**
   * Disconnects all {@code Outlet}s dominated by this {@code Outlet} in the
   * dataflow graph.  Used to recursively clean up chains of combinators
   * originating from this {@code Inlet}.
   */
  void disconnectOutputs();

  /**
   * Disconnects all {@code Inlet}s dominated by this {@code Outlet} in the
   * dataflow dependency graph.  Used to recursively clean up chains of
   * combinators passing through this {@code Outlet}.
   */
  void disconnectInputs();

  /**
   * Marks this {@code Outlet}—and all {@link #outputIterator() outputs} that
   * depend on the state of this {@code Outlet}—as having stale state.
   */
  void invalidateInput();

  /**
   * Reconciles the state of this {@code Outlet}, if the version of this {@code
   * Outlet}'s state differs from the target {@code version}.  To reconcile its
   * state, the {@code Outlet} first invokes {@link Streamlet#reconcile(int)}
   * on the {@code Streamlet} to which it's attached. It then invokes {@link
   * Inlet#reconcileOutput(int)} on each of its dependent {@link
   * #outputIterator() outputs}.
   */
  void reconcileInput(int version);

  default Outlet<O> memoize() {
    final MemoizeValueCombinator<O> combinator = new MemoizeValueCombinator<O>();
    combinator.bindInput(this);
    return combinator;
  }

  default <O2> Outlet<O2> map(MapValueFunction<? super O, O2> func) {
    final MapValueCombinator<O, O2> combinator = new MapValueCombinator<O, O2>(func);
    combinator.bindInput(this);
    return combinator;
  }

  default Outlet<O> watch(WatchValueFunction<? super O> func) {
    final WatchValueCombinator<O> combinator = new WatchValueCombinator<O>(func);
    combinator.bindInput(this);
    return this;
  }
}
