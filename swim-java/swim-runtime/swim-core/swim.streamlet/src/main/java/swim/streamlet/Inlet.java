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
 * Input connector into a {@link Streamlet}. An {@code Inlet} represents a
 * source from which a {@code Streamlet} acquires state.
 * <p>
 * In order for an {@code Inlet} to provide state to its {@code Streamlet},
 * it must bind to an {@link #input() input} source. The input source of an
 * {@code Inlet} is an {@link Outlet} of some other {@code Streamlet}. The
 * {@link #bindInput(Outlet)} method &quot;plugs&quot; the {@code Inlet} into
 * an {@code Outlet}. The {@link #unbindInput()} method &quot;unplugs&quot;
 * the {@code Inlet} from its connected {@code Outlet}.
 * <p>
 * The state of an {@code Inlet} has an integral <em>version</em>. When its
 * version is negative, the state of the {@code Inlet} is considered
 * <em>decoherent</em>. When any state on which an {@code Inlet} transitively
 * depends changes, the {@code Inlet} will be {@link #decohereOutput()
 * decohered}. Decoherence does not immediately cause an {@code Inlet} to
 * recompute its state. Instead, a separate {@link #recohereOutput(int)
 * recohere} step causes all of the decoherent paths in the dataflow graph
 * passing through the {@code Inlet} to make their states coherent again.
 */
public interface Inlet<I> {

  /**
   * Returns the {@code Outlet} from which this {@code Inlet} acquires its
   * state; returns {@code null} if this {@code Inlet} is disconnected.
   */
  Outlet<? extends I> input();

  /**
   * Connects this {@code Inlet} to an {@code Outlet} from which it will
   * acquire its state. If this {@code Inlet} is already connected, it will
   * first disconnect from its existing input. Then, after updating its {@link
   * #input() input} property, the {@code Inlet} will invoke {@link
   * Outlet#bindOutput(Inlet)} on its new {@code input}.
   */
  void bindInput(Outlet<? extends I> input);

  /**
   * Disconnects this {@code Inlet} from its input {@code Outlet}, if
   * connected. After setting its {@link #input() input} property to {@code
   * null}, the {@code Inlet} will invoke {@link Outlet#unbindOutput(Inlet)}
   * on its old input, if defined.
   */
  void unbindInput();

  /**
   * Disconnects all {@code Inlet}s dominated by this {@code Inlet} in the
   * dataflow dependency graph. Used to recursively clean up chains of
   * combinators terminating at this {@code Inlet}.
   */
  void disconnectInputs();

  /**
   * Disconnects all {@code Outlet}s dominated by this {@code Inlet} in the
   * dataflow graph. Used to recursively clean up chains of combinators
   * passing through this {@code Inlet}.
   */
  void disconnectOutputs();

  /**
   * Marks this {@code Inlet}—and the {@code Streamlet} to which this {@code
   * Inlet} is attached—as having decoherent state. Decohering an {@code Inlet}
   * will recursively decohere all streamlets that transitively depend on the
   * state of this {@code Inlet}. Decohering an {@code Inlet} does not cause
   * its state to be recomputed. A subsequent {@link #recohereOutput(int)}
   * call will eventually make the state of the {@code Inlet} coherent again.
   */
  void decohereOutput();

  /**
   * Updates the state of this {@code Inlet} to make it consistent with the
   * {@code target} version. The {@code Inlet} only needs to update if its
   * current {@code version} differs from the target {@code version}.
   * To update its state, the {@code Inlet} first invokes {@link
   * Outlet#recohereInput(int)} on its {@link #input() input}, to ensure that
   * its input is coherent. It then invokes {@link Streamlet#recohere(int)} on
   * the {@code Streamlet} to which it's attached, causing the {@code Streamlet}
   * to make its own state coherent again.
   */
  void recohereOutput(int version);

}
