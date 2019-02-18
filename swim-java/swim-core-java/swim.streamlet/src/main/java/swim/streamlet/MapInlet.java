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
 * Input connector into a {@link Streamlet} for a key-value map state.
 */
public interface MapInlet<K, V, I> extends Inlet<I> {
  /**
   * Marks this {@code MapInlet} as needing an {@code effect} applied to a
   * given {@code key}.  Invalidating an individual key invalidates the entire
   * state of the {@code Inlet}.  But only the invalidated keys need to be
   * updated in order to reconcile the overall state of the {@code Inlet}.
   */
  void invalidateOutputKey(K key, KeyEffect effect);

  /**
   * Reconciles the state of an individual {@code key} in this {@code MapInlet},
   * if the version of this {@code MapInlet}'s state differs from the target
   * {@code version}.  To reconcile the state of a key, the {@code MapInlet}
   * first invokes {@link MapOutlet#reconcileInputKey(Object, int)} on its
   * {@link #input() input}, if its input is a {@link MapOutlet}, or it invokes
   * {@link Outlet#reconcileInput(int)}, if its input is not a {@code
   * MapOutlet}.  Then, if all invalid keys have been reconciled, the {@code
   * MapInlet} invokes {@link Streamlet#reconcile(int)} on its attached
   * streamlet.
   */
  void reconcileOutputKey(K key, int version);
}
