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

import java.util.Map;
import org.testng.annotations.Test;
import swim.collections.HashTrieMap;
import swim.streamlet.MapInput;
import swim.streamlet.MapOutlet;
import swim.streamlet.MapOutput;
import swim.streamlet.Outlet;
import swim.streamlet.ValueOutput;
import static org.testng.Assert.assertEquals;

public class MapFieldValuesOperatorSpec {
  @Test
  public void evaluateMapFieldValuesOperatorAfterPut() {
    final MapInput<String, Integer> input = new MapInput<>();
    final MapOutput<String, Integer> output = new MapOutput<>();
    final MapFieldValuesOperator<String, Integer, Integer, Map<String, Integer>> square = new MapFieldValuesOperator<String, Integer, Integer, Map<String, Integer>>() {
      @Override
      public Integer evaluate(String key, Integer input) {
        return input * input;
      }
    };
    square.bindInput(input);
    output.bindInput(square);

    input.put("two", 2);
    input.reconcileInput(0); // reconcile forward
    assertEquals(output.get(), HashTrieMap.<String, Integer>empty().updated("two", 4));

    input.put("three", 3);
    output.reconcileOutput(1); // reconcile backward
    assertEquals(output.get(), HashTrieMap.<String, Integer>empty().updated("two", 4).updated("three", 9));
  }

  @Test
  public void applyMapFieldValuesCombinatorAfterPut() {
    final MapInput<String, Integer> input = new MapInput<>();
    final MapOutput<String, Integer> output = new MapOutput<>();
    final MapOutlet<String, Integer, ? extends Map<String, Integer>> square = input.map((key, value) -> value * value);
    output.bindInput(square);

    input.put("two", 2);
    input.reconcileInput(0); // reconcile forward
    assertEquals(output.get(), HashTrieMap.<String, Integer>empty().updated("two", 4));

    input.put("three", 3);
    output.reconcileOutput(1); // reconcile backward
    assertEquals(output.get(), HashTrieMap.<String, Integer>empty().updated("two", 4).updated("three", 9));
  }

  @Test
  public void applyMapKeyOperatorAfterPut() {
    final MapInput<String, Integer> input = new MapInput<>();
    final ValueOutput<Integer> output = new ValueOutput<>();
    final MapValueOperator<Integer, Integer> square = new MapValueOperator<Integer, Integer>() {
      @Override
      public Integer evaluate(Integer input) {
        return input * input;
      }
    };
    square.bindInput(input.outlet("number"));
    output.bindInput(square);

    input.put("number", 2);
    input.reconcileInput(0); // reconcile forward
    assertEquals((int) output.get(), 4);

    input.put("other", 3);
    input.reconcileInput(0); // reconcile forward
    assertEquals((int) output.get(), 4); // updating other key has no effect

    input.put("number", 4);
    output.reconcileOutput(1); // reconcile backward
    assertEquals((int) output.get(), 16);
  }

  @Test
  public void applyMapKeyCombinatorAfterPut() {
    final MapInput<String, Integer> input = new MapInput<>();
    final ValueOutput<Integer> output = new ValueOutput<>();
    final Outlet<Integer> square = input.outlet("number").map(value -> value * value);
    output.bindInput(square);

    input.put("number", 2);
    input.reconcileInput(0); // reconcile forward
    assertEquals((int) output.get(), 4);

    input.put("other", 3);
    input.reconcileInput(0); // reconcile forward
    assertEquals((int) output.get(), 4); // updating other key has no effect

    input.put("number", 4);
    output.reconcileOutput(1); // reconcile backward
    assertEquals((int) output.get(), 16);
  }

  @Test
  public void applyMapKeyCombinatorAfterMapFieldValuesCombinator() {
    final MapInput<String, Integer> input = new MapInput<>();
    final ValueOutput<Integer> output = new ValueOutput<>();
    final Outlet<Integer> squarePlus1 = input.map((key, value) -> value * value)
                                             .outlet("number").map(value -> value + 1);
    output.bindInput(squarePlus1);

    input.put("number", 2);
    input.reconcileInput(0); // reconcile forward
    assertEquals((int) output.get(), 5);

    input.put("other", 3);
    input.reconcileInput(0); // reconcile forward
    assertEquals((int) output.get(), 5); // updating other key has no effect

    input.put("number", 4);
    output.reconcileOutput(1); // reconcile backward
    assertEquals((int) output.get(), 17);
  }
}
