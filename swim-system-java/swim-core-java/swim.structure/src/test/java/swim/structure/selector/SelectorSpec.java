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

import org.testng.Assert;
import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Selector;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class SelectorSpec {
  @Test
  public void selectIdentity() {
    Assert.assertEquals(Selector.identity().evaluate(Value.absent()), Value.absent());
    assertEquals(Selector.identity().evaluate(Value.extant()), Value.extant());
    Assert.assertEquals(Selector.identity().evaluate(Num.from(42)), Num.from(42));
    Assert.assertEquals(Selector.identity().evaluate(Text.from("test")), Text.from("test"));
    Assert.assertEquals(Selector.identity().evaluate(Record.empty()), Record.empty());
  }

  @Test
  public void selectGet() {
    assertEquals(Selector.identity().get("a").evaluate(Record.of(Slot.of("a", 1))), Num.from(1));
    assertEquals(Selector.identity().get("a").evaluate(Record.of(Slot.of("b", 2))), Value.absent());
    assertEquals(Selector.identity().get("a").evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Num.from(1));
    assertEquals(Selector.identity().get("b").evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Num.from(2));
    assertEquals(Selector.identity().get("b").evaluate(Record.of(Slot.of("a", 1))), Value.absent());
  }

  @Test
  public void selectGetAttr() {
    assertEquals(Selector.identity().getAttr("a").evaluate(Record.of().attr("a", 1)), Num.from(1));
    assertEquals(Selector.identity().getAttr("b").evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Value.absent());
  }

  @Test
  public void selectFieldGet() {
    assertEquals(Selector.identity().get("b").evaluate(Slot.of("a", Record.of(Slot.of("b", 2)))), Num.from(2));
    assertEquals(Selector.identity().get("b").get("c").evaluate(Slot.of("a", Record.of(Slot.of("b", Record.of(Slot.of("c", 3)))))), Num.from(3));
    assertEquals(Selector.identity().get("a").evaluate(Slot.of("a", Record.of(Slot.of("b", 2)))), Value.absent());
  }

  @Test
  public void selectKeys() {
    assertEquals(Selector.identity().keys().evaluate(Record.of(Slot.of("a", 1))), Text.from("a"));
    assertEquals(Selector.identity().keys().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of("a", "b"));
    assertEquals(Selector.identity().keys().evaluate(Record.empty()), Value.absent());
    assertEquals(Selector.identity().keys().evaluate(Record.of("a")), Value.absent());
    assertEquals(Selector.identity().keys().evaluate(Record.of("a", "b")), Value.absent());
    assertEquals(Selector.identity().keys().evaluate(Record.of(42)), Value.absent());
    assertEquals(Selector.identity().keys().evaluate(Value.extant()), Value.absent());
    assertEquals(Selector.identity().keys().evaluate(Value.absent()), Value.absent());
  }

  @Test
  public void selectValues() {
    assertEquals(Selector.identity().values().evaluate(Record.of(Slot.of("a", 1))), Num.from(1));
    assertEquals(Selector.identity().values().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(1, 2));
    assertEquals(Selector.identity().values().evaluate(Record.empty()), Value.absent());
    assertEquals(Selector.identity().values().evaluate(Record.of("a")), Text.from("a"));
    assertEquals(Selector.identity().values().evaluate(Record.of("a", "b")), Record.of("a", "b"));
    assertEquals(Selector.identity().values().evaluate(Record.of(42)), Num.from(42));
    assertEquals(Selector.identity().values().evaluate(Value.extant()), Value.extant());
    assertEquals(Selector.identity().values().evaluate(Value.absent()), Value.absent());
  }

  @Test
  public void selectChildren() {
    assertEquals(Selector.identity().children().evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Record.of(Slot.of("a", 1), Slot.of("b", 2)));
    assertEquals(Selector.identity().children().evaluate(Record.of(1, 2, 3)), Record.of(1, 2, 3));
    assertEquals(Selector.identity().children().evaluate(Value.absent()), Value.absent());
    assertEquals(Selector.identity().children().evaluate(Value.extant()), Value.absent());
    assertEquals(Selector.identity().children().evaluate(Record.empty()), Value.absent());
    assertEquals(Selector.identity().children().evaluate(Text.from("test")), Value.absent());
    assertEquals(Selector.identity().children().evaluate(Record.of("test")), Text.from("test"));
    assertEquals(Selector.identity().children().evaluate(Record.of(42)), Num.from(42));
    assertEquals(Selector.identity().children().evaluate(Record.of(Value.extant())), Value.extant());
    assertEquals(Selector.identity().children().evaluate(Record.of(Value.absent())), Value.absent());
  }

  @Test
  public void selectDescendants() {
    assertEquals(Selector.identity().descendants().evaluate(Record.of(Slot.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3), Slot.of("d", Record.of(4, 5)), Slot.of("e", 6))))),
                 Record.of(Slot.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3), Slot.of("d", Record.of(4, 5)), Slot.of("e", 6))), Slot.of("b", 2), Slot.of("c", 3), Slot.of("d", Record.of(4, 5)), 4, 5, Slot.of("e", 6)));
    assertEquals(Selector.identity().descendants().evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Record.of(Slot.of("a", 1), Slot.of("b", 2)));
    assertEquals(Selector.identity().descendants().evaluate(Record.of(1, 2, 3)), Record.of(1, 2, 3));
    assertEquals(Selector.identity().descendants().evaluate(Value.absent()), Value.absent());
    assertEquals(Selector.identity().descendants().evaluate(Value.extant()), Value.absent());
    assertEquals(Selector.identity().descendants().evaluate(Record.of(Value.extant())), Value.extant());
    assertEquals(Selector.identity().descendants().evaluate(Record.of("test")), Text.from("test"));
    assertEquals(Selector.identity().descendants().evaluate(Record.of(42)), Num.from(42));
    assertEquals(Selector.identity().descendants().evaluate(Num.from(42)), Value.absent());
  }

  @Test
  public void selectChildrenGet() {
    assertEquals(Selector.identity().children().get("z").evaluate(Record.of(Record.of(Slot.of("z", 1)), Record.of(Slot.of("a", 2)), Record.of(Slot.of("z", 3)))), Record.of(1, 3));
    assertEquals(Selector.identity().children().get("z").evaluate(Record.of(Slot.of("a", Record.of(Slot.of("z", 1))), Slot.of("z", 2), Slot.of("b", Record.of(Slot.of("z", 3))))), Record.of(1, 3));
    assertEquals(Selector.identity().children().get("z").evaluate(Record.of(Slot.of("z", 1), Slot.of("b", 2), Slot.of("z", 3))), Value.absent());
  }

  @Test
  public void selectChildrenKeys() {
    assertEquals(Selector.identity().children().keys().evaluate(Record.of(Slot.of("a", 1))), Text.from("a"));
    assertEquals(Selector.identity().children().keys().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of("a", "b"));
    assertEquals(Selector.identity().children().keys().evaluate(Record.of(Slot.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))))), Text.from("a"));
  }

  @Test
  public void selectChildrenValues() {
    assertEquals(Selector.identity().children().values().evaluate(Record.of(Slot.of("a", 1))), Num.from(1));
    assertEquals(Selector.identity().children().values().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(1, 2));
    assertEquals(Selector.identity().children().values().evaluate(Record.of(Slot.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))))), Record.of(Slot.of("b", 2), Slot.of("c", 3)));
  }

  @Test
  public void selectDescendantsKeys() {
    assertEquals(Selector.identity().descendants().keys().evaluate(Record.of(Slot.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))), Slot.of("d", Record.of(4, 5)), Slot.of("e", 6))),
                 Record.of("a", "b", "c", "d", "e"));
    assertEquals(Selector.identity().descendants().keys().evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Record.of("a", "b"));
    assertEquals(Selector.identity().descendants().keys().evaluate(Record.of(1, 2, 3)), Value.absent());
  }

  @Test
  public void selectDescendantsValues() {
    assertEquals(Selector.identity().descendants().values().evaluate(Record.of(Slot.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))), Slot.of("d", Record.of(4, 5)), Slot.of("e", 6))),
                 Record.of(Record.of(Slot.of("b", 2), Slot.of("c", 3)), 2, 3, Record.of(4, 5), 4, 5, 6));
    assertEquals(Selector.identity().descendants().values().evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Record.of(1, 2));
    assertEquals(Selector.identity().descendants().values().evaluate(Record.of(1, 2, 3)), Record.of(1, 2, 3));
  }

  @Test
  public void filterGet() {
    assertEquals(Selector.identity().get("a").filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
    assertEquals(Selector.identity().get("b").filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
    assertEquals(Selector.identity().get("c").filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Value.absent());
    assertEquals(Selector.identity().get("a").filter().evaluate(Text.from("test")), Value.absent());
    assertEquals(Selector.identity().get("a").filter().evaluate(Num.from(42)), Value.absent());
    assertEquals(Selector.identity().get("a").filter().evaluate(Value.extant()), Value.absent());
    assertEquals(Selector.identity().get("a").filter().evaluate(Value.absent()), Value.absent());
    assertEquals(Selector.identity().get("a").get("b").filter().evaluate(Record.of(Attr.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))))), Record.of(Attr.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3)))));
    assertEquals(Selector.identity().get("a").get("c").filter().evaluate(Record.of(Attr.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))))), Record.of(Attr.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3)))));
    assertEquals(Selector.identity().get("a").get("d").filter().evaluate(Record.of(Attr.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))))), Value.absent());
  }

  @Test
  public void filterLessThan() {
    assertEquals(Selector.identity().get("a").lt(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 40))), Record.of(Slot.of("a", 40)));
    assertEquals(Selector.identity().get("a").lt(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 42))), Value.absent());
    assertEquals(Selector.identity().get("a").lt(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 50))), Value.absent());
  }

  @Test
  public void filterLessThanOrEqual() {
    assertEquals(Selector.identity().get("a").le(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 40))), Record.of(Slot.of("a", 40)));
    assertEquals(Selector.identity().get("a").le(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 42))), Record.of(Slot.of("a", 42)));
    assertEquals(Selector.identity().get("a").le(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 50))), Value.absent());
  }

  @Test
  public void filterEqual() {
    assertEquals(Selector.identity().get("a").eq(Text.from("foo")).filter().evaluate(Record.of(Slot.of("a", "foo"))), Record.of(Slot.of("a", "foo")));
    assertEquals(Selector.identity().get("a").eq(Text.from("foo")).filter().evaluate(Record.of(Slot.of("a", "bar"))), Value.absent());
  }

  @Test
  public void filterNotEqual() {
    assertEquals(Selector.identity().get("a").ne(Text.from("foo")).filter().evaluate(Record.of(Slot.of("a", "foo"))), Value.absent());
    assertEquals(Selector.identity().get("a").ne(Text.from("foo")).filter().evaluate(Record.of(Slot.of("a", "bar"))), Record.of(Slot.of("a", "bar")));
  }

  @Test
  public void filterGreaterThanOrEqual() {
    assertEquals(Selector.identity().get("a").ge(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 50))), Record.of(Slot.of("a", 50)));
    assertEquals(Selector.identity().get("a").ge(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 42))), Record.of(Slot.of("a", 42)));
    assertEquals(Selector.identity().get("a").ge(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 40))), Value.absent());
  }

  @Test
  public void filterGreaterThan() {
    assertEquals(Selector.identity().get("a").gt(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 50))), Record.of(Slot.of("a", 50)));
    assertEquals(Selector.identity().get("a").gt(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 42))), Value.absent());
    assertEquals(Selector.identity().get("a").gt(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 40))), Value.absent());
  }

  @Test
  public void filterGetOrGet() {
    assertEquals(Selector.identity().get("a").or(Selector.identity().get("b")).filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
    assertEquals(Selector.identity().get("a").or(Selector.identity().get("c")).filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
    assertEquals(Selector.identity().get("c").or(Selector.identity().get("b")).filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
    assertEquals(Selector.identity().get("c").or(Selector.identity().get("d")).filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Value.absent());
  }

  @Test
  public void filterGetAndGet() {
    assertEquals(Selector.identity().get("a").and(Selector.identity().get("b")).filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
    assertEquals(Selector.identity().get("c").and(Selector.identity().get("b")).filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Value.absent());
  }

  @Test
  public void filterGetNot() {
    assertEquals(Selector.identity().get("a").not().filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Value.absent());
    assertEquals(Selector.identity().get("b").not().filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Value.absent());
    assertEquals(Selector.identity().get("c").not().filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
  }
}
