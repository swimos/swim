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

package swim.dataflow;

import org.testng.annotations.Test;
import swim.structure.Record;
import swim.structure.Selector;
import swim.structure.Slot;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class RecordScopeSpec {
  @Test
  public void compileGetSelectorFields() {
    final Value y = Selector.identity().get("x");
    final RecordScope scope = RecordScope.of(Slot.of("y", y), Slot.of("x", 2));
    assertEquals(scope.get("x").intValue(), 2);
    assertEquals(scope.get("y"), Value.extant());

    scope.reconcileInput(0);
    assertEquals(scope.get("x").intValue(), 2);
    assertEquals(scope.get("y").intValue(), 2);

    scope.put("x", 4);
    assertEquals(scope.get("x").intValue(), 4);
    assertEquals(scope.get("y").intValue(), 2);

    scope.reconcileInput(1);
    assertEquals(scope.get("x").intValue(), 4);
    assertEquals(scope.get("y").intValue(), 4);
  }

  @Test
  public void compileOuterScopeGetSelectorFields() {
    final Value x = Record.of(Slot.of("y", Selector.identity().get("z")));
    final RecordScope scope = RecordScope.of(Slot.of("x", x), Slot.of("z", 2));
    assertEquals(scope.get("x"), Record.of(Slot.of("y")));
    assertEquals(scope.get("z").intValue(), 2);

    scope.reconcileInput(0);
    assertEquals(scope.get("x"), Record.of(Slot.of("y", 2)));
    assertEquals(scope.get("z").intValue(), 2);

    scope.put("z", 4);
    assertEquals(scope.get("x"), Record.of(Slot.of("y", 2)));
    assertEquals(scope.get("z").intValue(), 4);

    scope.reconcileInput(1);
    assertEquals(scope.get("x"), Record.of(Slot.of("y", 4)));
    assertEquals(scope.get("z").intValue(), 4);
  }

  @Test
  public void compileNestedGetSelectorFields() {
    final Value z = Selector.identity().get("x").get("y");
    final RecordScope scope = RecordScope.of(Slot.of("z", z), Slot.of("x", Record.of(Slot.of("a", 0), Slot.of("y", 2))));
    assertEquals(scope.get("x"), Record.of(Slot.of("a", 0), Slot.of("y", 2)));
    assertEquals(scope.get("z"), Value.extant());

    scope.reconcileInput(0);
    assertEquals(scope.get("x"), Record.of(Slot.of("a", 0), Slot.of("y", 2)));
    assertEquals(scope.get("z").intValue(), 2);

    ((Record) scope.get("x")).put("y", 4);
    assertEquals(scope.get("x"), Record.of(Slot.of("a", 0), Slot.of("y", 4)));
    assertEquals(scope.get("z").intValue(), 2);

    scope.reconcileInput(1);
    assertEquals(scope.get("x"), Record.of(Slot.of("a", 0), Slot.of("y", 4)));
    assertEquals(scope.get("z").intValue(), 4);
  }

  @Test
  public void compileDynamicGetSelectorFields() {
    final Value y = Selector.identity().get(Selector.identity().get("x"));
    final RecordScope scope = RecordScope.of(Slot.of("a", 2), Slot.of("b", 4), Slot.of("x", "a"), Slot.of("y", y));
    assertEquals(scope.get("x").stringValue(), "a");
    assertEquals(scope.get("y"), Value.extant());

    scope.reconcileInput(0);
    assertEquals(scope.get("x").stringValue(), "a");
    assertEquals(scope.get("y").intValue(), 2);

    scope.put("x", "b");
    assertEquals(scope.get("x").stringValue(), "b");
    assertEquals(scope.get("y").intValue(), 2);

    scope.reconcileInput(1);
    assertEquals(scope.get("x").stringValue(), "b");
    assertEquals(scope.get("y").intValue(), 4);
  }

  @Test
  public void compileConditionalOperators() {
    final Value z = Selector.identity().get("x").conditional(Selector.identity().get("y"), Selector.identity().get("w"));
    final RecordScope scope = RecordScope.of(Slot.of("x", true), Slot.of("z", z), Slot.of("y", 3), Slot.of("w", 5));
    assertEquals(scope.get("z"), Value.extant());

    scope.reconcileInput(0);
    assertEquals(scope.get("z").intValue(), 3);

    scope.put("x", false);
    assertEquals(scope.get("z").intValue(), 3);

    scope.reconcileInput(1);
    assertEquals(scope.get("z").intValue(), 5);

    scope.put("w", 7);
    assertEquals(scope.get("z").intValue(), 5);

    scope.reconcileInput(2);
    assertEquals(scope.get("z").intValue(), 7);
  }

  @Test
  public void compileBinaryOperators() {
    final Value z = Selector.identity().get("x").plus(Selector.identity().get("y"));
    final RecordScope scope = RecordScope.of(Slot.of("x", 2), Slot.of("z", z), Slot.of("y", 3));
    assertEquals(scope.get("z"), Value.extant());

    scope.reconcileInput(0);
    assertEquals(scope.get("z").intValue(), 5);

    scope.put("x", 7);
    assertEquals(scope.get("z").intValue(), 5);

    scope.reconcileInput(1);
    assertEquals(scope.get("z").intValue(), 10);

    scope.put("y", 11);
    assertEquals(scope.get("z").intValue(), 10);

    scope.reconcileInput(2);
    assertEquals(scope.get("z").intValue(), 18);
  }

  @Test
  public void compileUnaryOperators() {
    final Value z = Selector.identity().get("x").negative();
    final RecordScope scope = RecordScope.of(Slot.of("x", 2), Slot.of("z", z));
    assertEquals(scope.get("z"), Value.extant());

    scope.reconcileInput(0);
    assertEquals(scope.get("z").intValue(), -2);

    scope.put("x", 3);
    assertEquals(scope.get("z").intValue(), -2);

    scope.reconcileInput(1);
    assertEquals(scope.get("z").intValue(), -3);
  }

  @Test
  public void compileInvokeOperators() {
    final Value y = Selector.identity().get("math").get("floor").invoke(Selector.identity().get("x"));
    final RecordScope scope = RecordScope.of(Slot.of("y", y), Slot.of("x", 2.1));
    assertEquals(scope.get("x").doubleValue(), 2.1);
    assertEquals(scope.get("y"), Value.extant());

    scope.reconcileInput(0);
    assertEquals(scope.get("x").doubleValue(), 2.1);
    assertEquals(scope.get("y").doubleValue(), 2.0);

    scope.put("x", 3.14);
    assertEquals(scope.get("x").doubleValue(), 3.14);
    assertEquals(scope.get("y").doubleValue(), 2.0);

    scope.reconcileInput(1);
    assertEquals(scope.get("x").doubleValue(), 3.14);
    assertEquals(scope.get("y").doubleValue(), 3.0);
  }
}
