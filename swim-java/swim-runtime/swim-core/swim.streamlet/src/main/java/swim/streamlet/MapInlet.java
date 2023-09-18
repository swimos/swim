// Copyright 2015-2023 Nstream, inc.
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
   * given {@code key}. Decohering an individual key decoheres the entire
   * state of the {@code Inlet}. But only the decoherent keys need to be
   * updated in order to recohere the overall state of the {@code Inlet}.
   */
  void decohereOutputKey(K key, KeyEffect effect);

  /**
   * Updates the state of an individual {@code key} in this {@code MapInlet} to
   * make it consistent with the target {@code version}. The {@code MapInlet}
   * only needs to update if the current {@code version} differs from the target
   * {@code version}. To update the state of a key, the {@code MapInlet}
   * first invokes {@link MapOutlet#recohereInputKey(Object, int)} on its
   * {@link #input() input}, if its input is a {@link MapOutlet}, or it invokes
   * {@link Outlet#recohereInput(int)}, if its input is not a {@code MapOutlet}.
   * Then, if all decoherent keys have been recohered, the {@code MapInlet}
   * invokes {@link Streamlet#recohere(int)} on its attached streamlet.
   */
  void recohereOutputKey(K key, int version);

}
