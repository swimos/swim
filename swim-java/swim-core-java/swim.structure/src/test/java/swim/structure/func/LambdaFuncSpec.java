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

package swim.structure.selector;

import org.testng.annotations.Test;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Selector;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class LambdaFuncSpec {
  @Test
  public void evaluateIdentityLambda() {
    final Record scope = Record.of(Slot.of("f", Text.from("x").lambda(
        Selector.identity().get("x"))));
    assertEquals(Selector.identity().get("f").invoke(Num.from(3)).evaluate(scope),
        Num.from(3));
    assertEquals(Selector.identity().get("f").invoke(Text.from("test")).evaluate(scope),
        Text.from("test"));
  }

  @Test
  public void evaluateUnaryLambda() {
    final Record scope = Record.of(Slot.of("f", Text.from("x").lambda(
        Selector.identity().get("x").plus(Num.from(1)))));
    assertEquals(Selector.identity().get("f").invoke(Num.from(3)).evaluate(scope),
        Num.from(4));
    assertEquals(Selector.identity().get("f").invoke(Num.from(0)).evaluate(scope),
        Num.from(1));
  }

  @Test
  public void evaluateBinaryLambda() {
    final Record scope = Record.of(Slot.of("f", Record.of("x", "y").lambda(
        Selector.identity().get("x").plus(Selector.identity().get("y")))));
    assertEquals(Selector.identity().get("f").invoke(Record.of(3, 5)).evaluate(scope),
        Num.from(8));
    assertEquals(Selector.identity().get("f").invoke(Record.of("a", "b")).evaluate(scope),
        Text.from("ab"));
  }

  @Test
  public void evaluateLambdaWithDefaultBindings() {
    final Record scope = Record.of(Slot.of("f", Record.of(Slot.of("x", 1), Slot.of("y", 1)).lambda(
        Selector.identity().get("x").plus(Selector.identity().get("y")))));
    assertEquals(Selector.identity().get("f").invoke(Record.of(3, 5)).evaluate(scope),
        Num.from(8));
    assertEquals(Selector.identity().get("f").invoke(Num.from(3)).evaluate(scope),
        Num.from(4));
    assertEquals(Selector.identity().get("f").invoke(Value.extant()).evaluate(scope),
        Num.from(2));
  }
}
