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

package swim.dataflow.connector;

import swim.collections.FingerTrieSeq;
import swim.dataflow.graph.Require;

/**
 * Junction that brings together any number of inputs, of the same type, and emits them all on a singel ouput.
 *
 * @param <T> The type of the values.
 */
public class UnionJunction<T> extends AbstractJunction<T> implements Bundle<T, T> {

  private final FingerTrieSeq<Receptacle<T>> inputs;

  /**
   * @param numInputs The number of inputs to create.
   */
  public UnionJunction(final int numInputs) {
    Require.that(numInputs > 1, "The number of inputs must be at least 2.");
    FingerTrieSeq<Receptacle<T>> inputBuilder = FingerTrieSeq.empty();
    for (int i = 0; i < numInputs; ++i) {
      inputBuilder = inputBuilder.appended(this::emit);
    }
    inputs = inputBuilder;
  }

  public Receptacle<T> getInput(final int i) {
    Require.that(i >= 0 && i < inputs.size(), "Input index must be in [0, %d).", inputs.size());
    return inputs.get(i);
  }

  @Override
  public Iterable<Receptacle<T>> inputs() {
    return inputs;
  }
}
