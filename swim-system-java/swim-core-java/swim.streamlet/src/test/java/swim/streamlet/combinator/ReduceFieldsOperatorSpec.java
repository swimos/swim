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
import swim.streamlet.MapInput;
import swim.streamlet.Outlet;
import swim.streamlet.ValueOutput;
import static org.testng.Assert.assertEquals;

public class ReduceFieldsOperatorSpec {
  @Test
  public void evaluateReduceFieldsOperatorAfterPut() {
    final MapInput<String, Integer> input = new MapInput<>();
    final ValueOutput<Integer> output = new ValueOutput<>();
    final ReduceFieldsOperator<String, Integer, Map<String, Integer>, Integer> sum = new ReduceFieldsOperator<String, Integer, Map<String, Integer>, Integer>() {
      @Override
      public Integer identity() {
        return 0;
      }
      @Override
      public Integer accumulate(Integer result, Integer value) {
        return result + value;
      }
      @Override
      public Integer combine(Integer result, Integer value) {
        return result + value;
      }
    };
    sum.bindInput(input);
    output.bindInput(sum);

    input.put("two", 2);
    input.reconcileInput(0); // reconcile forward
    assertEquals(output.get().intValue(), 2);

    input.put("three", 3);
    output.reconcileOutput(1); // reconcile backward
    assertEquals(output.get().intValue(), 5);
  }

  @Test
  public void applyReduceFieldsCombinatorAfterPut() {
    final MapInput<String, Integer> input = new MapInput<>();
    final ValueOutput<Integer> output = new ValueOutput<>();
    final Outlet<Integer> sum = input.reduce(0, (result, value) -> result + value, (result, value) -> result + value);
    output.bindInput(sum);

    input.put("two", 2);
    input.reconcileInput(0); // reconcile forward
    assertEquals(output.get().intValue(), 2);

    input.put("three", 3);
    output.reconcileOutput(1); // reconcile backward
    assertEquals(output.get().intValue(), 5);
  }
}
