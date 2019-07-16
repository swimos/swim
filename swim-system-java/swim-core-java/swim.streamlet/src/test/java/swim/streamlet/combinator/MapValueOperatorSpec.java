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

package swim.streamlet.combinator;

import org.testng.annotations.Test;
import swim.streamlet.Outlet;
import swim.streamlet.ValueInput;
import swim.streamlet.ValueOutput;
import static org.testng.Assert.assertEquals;

public class MapValueOperatorSpec {
  @Test
  public void evaluateMapValueOperatorAfterSet() {
    final ValueInput<Integer> input = new ValueInput<>(0);
    final ValueOutput<Integer> output = new ValueOutput<>();
    final MapValueOperator<Integer, Integer> square = new MapValueOperator<Integer, Integer>() {
      @Override
      public Integer evaluate(Integer input) {
        return input * input;
      }
    };
    square.bindInput(input);
    output.bindInput(square);

    input.set(2);
    input.reconcileInput(0); // reconcile forward
    assertEquals((int) output.get(), 4);

    input.set(8);
    output.reconcileOutput(1); // reconcile backward
    assertEquals((int) output.get(), 64);
  }

  @Test
  public void applyMapValueCombinatorAfterSet() {
    final ValueInput<Integer> input = new ValueInput<>(0);
    final ValueOutput<Integer> output = new ValueOutput<>();
    final Outlet<Integer> square = input.map(value -> value * value);
    output.bindInput(square);

    input.set(2);
    input.reconcileInput(0); // reconcile forward
    assertEquals((int) output.get(), 4);

    input.set(8);
    output.reconcileOutput(1); // reconcile backward
    assertEquals((int) output.get(), 64);
  }
}
