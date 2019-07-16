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
import static org.testng.Assert.assertEquals;

public class FilterFieldsOperatorSpec {
  @Test
  public void evaluateFilterFieldsOperatorAfterPut() {
    final MapInput<String, Integer> input = new MapInput<>();
    final MapOutput<String, Integer> output = new MapOutput<>();
    final FilterFieldsOperator<String, Integer, Map<String, Integer>> isEven = new FilterFieldsOperator<String, Integer, Map<String, Integer>>() {
      @Override
      public boolean evaluate(String key, Integer input) {
        return input % 2 == 0;
      }
    };
    isEven.bindInput(input);
    output.bindInput(isEven);

    input.put("two", 2);
    input.reconcileInput(0); // reconcile forward
    assertEquals(output.get(), HashTrieMap.<String, Integer>empty().updated("two", 2));

    input.put("three", 3);
    input.reconcileInput(1); // reconcile forward
    assertEquals(output.get(), HashTrieMap.<String, Integer>empty().updated("two", 2));

    input.put("three", 4);
    output.reconcileOutput(1); // reconcile backward
    assertEquals(output.get(), HashTrieMap.<String, Integer>empty().updated("two", 2).updated("three", 4));

    input.put("two", 3);
    output.reconcileOutput(1); // reconcile backward
    assertEquals(output.get(), HashTrieMap.<String, Integer>empty().updated("three", 4));
  }

  @Test
  public void applyFilterFieldsCombinatorAfterPut() {
    final MapInput<String, Integer> input = new MapInput<>();
    final MapOutput<String, Integer> output = new MapOutput<>();
    final MapOutlet<String, Integer, ? extends Map<String, Integer>> isEven = input.filter((key, value) -> value % 2 == 0);
    output.bindInput(isEven);

    input.put("two", 2);
    input.reconcileInput(0); // reconcile forward
    assertEquals(output.get(), HashTrieMap.<String, Integer>empty().updated("two", 2));

    input.put("three", 3);
    input.reconcileInput(1); // reconcile forward
    assertEquals(output.get(), HashTrieMap.<String, Integer>empty().updated("two", 2));

    input.put("three", 4);
    output.reconcileOutput(1); // reconcile backward
    assertEquals(output.get(), HashTrieMap.<String, Integer>empty().updated("two", 2).updated("three", 4));

    input.put("two", 3);
    output.reconcileOutput(1); // reconcile backward
    assertEquals(output.get(), HashTrieMap.<String, Integer>empty().updated("three", 4));
  }
}
