// Copyright 2015-2020 SWIM.AI inc.
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

import {Spec, Test, Exam} from "@swim/unit";
import {Attr, Slot, Value, Record, Text, Num, Selector} from "@swim/structure";

export class SelectorSpec extends Spec {
  @Test
  selectIdentity(exam: Exam): void {
    exam.equal(Selector.identity().evaluate(Value.absent()), Value.absent());
    exam.equal(Selector.identity().evaluate(Value.extant()), Value.extant());
    exam.equal(Selector.identity().evaluate(Num.from(42)), Num.from(42));
    exam.equal(Selector.identity().evaluate(Text.from("test")), Text.from("test"));
    exam.equal(Selector.identity().evaluate(Record.empty()), Record.empty());
  }

  @Test
  selectGet(exam: Exam): void {
    exam.equal(Selector.get("a").evaluate(Record.of(Slot.of("a", 1))), Num.from(1));
    exam.equal(Selector.get("a").evaluate(Record.of(Slot.of("b", 2))), Value.absent());
    exam.equal(Selector.get("a").evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Num.from(1));
    exam.equal(Selector.get("b").evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Num.from(2));
    exam.equal(Selector.get("b").evaluate(Record.of(Slot.of("a", 1))), Value.absent());
  }

  @Test
  selectGetAttr(exam: Exam): void {
    exam.equal(Selector.getAttr("a").evaluate(Record.of().attr("a", 1)), Num.from(1));
    exam.equal(Selector.getAttr("b").evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Value.absent());
  }

  @Test
  selectFieldGet(exam: Exam): void {
    exam.equal(Selector.get("b").evaluate(Slot.of("a", Record.of(Slot.of("b", 2)))), Num.from(2));
    exam.equal(Selector.get("b").get("c").evaluate(Slot.of("a", Record.of(Slot.of("b", Record.of(Slot.of("c", 3)))))), Num.from(3));
    exam.equal(Selector.get("a").evaluate(Slot.of("a", Record.of(Slot.of("b", 2)))), Value.absent());
  }

  @Test
  selectKeys(exam: Exam): void {
    exam.equal(Selector.keys().evaluate(Record.of(Slot.of("a", 1))), Text.from("a"));
    exam.equal(Selector.keys().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of("a", "b"));
    exam.equal(Selector.keys().evaluate(Record.empty()), Value.absent());
    exam.equal(Selector.keys().evaluate(Record.of("a")), Value.absent());
    exam.equal(Selector.keys().evaluate(Record.of("a", "b")), Value.absent());
    exam.equal(Selector.keys().evaluate(Record.of(42)), Value.absent());
    exam.equal(Selector.keys().evaluate(Value.extant()), Value.absent());
    exam.equal(Selector.keys().evaluate(Value.absent()), Value.absent());
  }

  @Test
  selectValues(exam: Exam): void {
    exam.equal(Selector.values().evaluate(Record.of(Slot.of("a", 1))), Num.from(1));
    exam.equal(Selector.values().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(1, 2));
    exam.equal(Selector.values().evaluate(Record.empty()), Value.absent());
    exam.equal(Selector.values().evaluate(Record.of("a")), Text.from("a"));
    exam.equal(Selector.values().evaluate(Record.of("a", "b")), Record.of("a", "b"));
    exam.equal(Selector.values().evaluate(Record.of(42)), Num.from(42));
    exam.equal(Selector.values().evaluate(Value.extant()), Value.extant());
    exam.equal(Selector.values().evaluate(Value.absent()), Value.absent());
  }

  @Test
  selectChildren(exam: Exam): void {
    exam.equal(Selector.children().evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Record.of(Slot.of("a", 1), Slot.of("b", 2)));
    exam.equal(Selector.children().evaluate(Record.of(1, 2, 3)), Record.of(1, 2, 3));
    exam.equal(Selector.children().evaluate(Value.absent()), Value.absent());
    exam.equal(Selector.children().evaluate(Value.extant()), Value.absent());
    exam.equal(Selector.children().evaluate(Record.empty()), Value.absent());
    exam.equal(Selector.children().evaluate(Text.from("test")), Value.absent());
    exam.equal(Selector.children().evaluate(Record.of("test")), Text.from("test"));
    exam.equal(Selector.children().evaluate(Record.of(42)), Num.from(42));
    exam.equal(Selector.children().evaluate(Record.of(Value.extant())), Value.extant());
    exam.equal(Selector.children().evaluate(Record.of(Value.absent())), Value.absent());
  }

  @Test
  selectDescendants(exam: Exam): void {
    exam.equal(Selector.descendants().evaluate(Record.of(Slot.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3), Slot.of("d", Record.of(4, 5)), Slot.of("e", 6))))),
               Record.of(Slot.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3), Slot.of("d", Record.of(4, 5)), Slot.of("e", 6))), Slot.of("b", 2), Slot.of("c", 3), Slot.of("d", Record.of(4, 5)), 4, 5, Slot.of("e", 6)));
    exam.equal(Selector.descendants().evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Record.of(Slot.of("a", 1), Slot.of("b", 2)));
    exam.equal(Selector.descendants().evaluate(Record.of(1, 2, 3)), Record.of(1, 2, 3));
    exam.equal(Selector.descendants().evaluate(Value.absent()), Value.absent());
    exam.equal(Selector.descendants().evaluate(Value.extant()), Value.absent());
    exam.equal(Selector.descendants().evaluate(Record.of(Value.extant())), Value.extant());
    exam.equal(Selector.descendants().evaluate(Record.of("test")), Text.from("test"));
    exam.equal(Selector.descendants().evaluate(Record.of(42)), Num.from(42));
    exam.equal(Selector.descendants().evaluate(Num.from(42)), Value.absent());
  }

  @Test
  selectChildrenGet(exam: Exam): void {
    exam.equal(Selector.children().get("z").evaluate(Record.of(Record.of(Slot.of("z", 1)), Record.of(Slot.of("a", 2)), Record.of(Slot.of("z", 3)))), Record.of(1, 3));
    exam.equal(Selector.children().get("z").evaluate(Record.of(Slot.of("a", Record.of(Slot.of("z", 1))), Slot.of("z", 2), Slot.of("b", Record.of(Slot.of("z", 3))))), Record.of(1, 3));
    exam.equal(Selector.children().get("z").evaluate(Record.of(Slot.of("z", 1), Slot.of("b", 2), Slot.of("z", 3))), Value.absent());
  }

  @Test
  selectChildrenKeys(exam: Exam): void {
    exam.equal(Selector.children().keys().evaluate(Record.of(Slot.of("a", 1))), Text.from("a"));
    exam.equal(Selector.children().keys().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of("a", "b"));
    exam.equal(Selector.children().keys().evaluate(Record.of(Slot.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))))), Text.from("a"));
  }

  @Test
  selectChildrenValues(exam: Exam): void {
    exam.equal(Selector.children().values().evaluate(Record.of(Slot.of("a", 1))), Num.from(1));
    exam.equal(Selector.children().values().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(1, 2));
    exam.equal(Selector.children().values().evaluate(Record.of(Slot.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))))), Record.of(Slot.of("b", 2), Slot.of("c", 3)));
  }

  @Test
  selectDescendantsKeys(exam: Exam): void {
    exam.equal(Selector.descendants().keys().evaluate(Record.of(Slot.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))), Slot.of("d", Record.of(4, 5)), Slot.of("e", 6))),
               Record.of("a", "b", "c", "d", "e"));
    exam.equal(Selector.descendants().keys().evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Record.of("a", "b"));
    exam.equal(Selector.descendants().keys().evaluate(Record.of(1, 2, 3)), Value.absent());
  }

  @Test
  selectDescendantsValues(exam: Exam): void {
    exam.equal(Selector.descendants().values().evaluate(Record.of(Slot.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))), Slot.of("d", Record.of(4, 5)), Slot.of("e", 6))),
               Record.of(Record.of(Slot.of("b", 2), Slot.of("c", 3)), 2, 3, Record.of(4, 5), 4, 5, 6));
    exam.equal(Selector.descendants().values().evaluate(Record.of(Slot.of("a", 1), Slot.of("b", 2))), Record.of(1, 2));
    exam.equal(Selector.descendants().values().evaluate(Record.of(1, 2, 3)), Record.of(1, 2, 3));
  }

  @Test
  filterGet(exam: Exam): void {
    exam.equal(Selector.get("a").filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
    exam.equal(Selector.get("b").filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
    exam.equal(Selector.get("c").filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Value.absent());
    exam.equal(Selector.get("a").filter().evaluate(Text.from("test")), Value.absent());
    exam.equal(Selector.get("a").filter().evaluate(Num.from(42)), Value.absent());
    exam.equal(Selector.get("a").filter().evaluate(Value.extant()), Value.absent());
    exam.equal(Selector.get("a").filter().evaluate(Value.absent()), Value.absent());
    exam.equal(Selector.get("a").get("b").filter().evaluate(Record.of(Attr.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))))), Record.of(Attr.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3)))));
    exam.equal(Selector.get("a").get("c").filter().evaluate(Record.of(Attr.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))))), Record.of(Attr.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3)))));
    exam.equal(Selector.get("a").get("d").filter().evaluate(Record.of(Attr.of("a", Record.of(Slot.of("b", 2), Slot.of("c", 3))))), Value.absent());
  }

  @Test
  filterLessThan(exam: Exam): void {
    exam.equal(Selector.get("a").lt(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 40))), Record.of(Slot.of("a", 40)));
    exam.equal(Selector.get("a").lt(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 42))), Value.absent());
    exam.equal(Selector.get("a").lt(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 50))), Value.absent());
  }

  @Test
  filterLessThanOrEqual(exam: Exam): void {
    exam.equal(Selector.get("a").le(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 40))), Record.of(Slot.of("a", 40)));
    exam.equal(Selector.get("a").le(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 42))), Record.of(Slot.of("a", 42)));
    exam.equal(Selector.get("a").le(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 50))), Value.absent());
  }

  @Test
  filterEqual(exam: Exam): void {
    exam.equal(Selector.get("a").eq(Text.from("foo")).filter().evaluate(Record.of(Slot.of("a", "foo"))), Record.of(Slot.of("a", "foo")));
    exam.equal(Selector.get("a").eq(Text.from("foo")).filter().evaluate(Record.of(Slot.of("a", "bar"))), Value.absent());
  }

  @Test
  filterNotEqual(exam: Exam): void {
    exam.equal(Selector.get("a").ne(Text.from("foo")).filter().evaluate(Record.of(Slot.of("a", "foo"))), Value.absent());
    exam.equal(Selector.get("a").ne(Text.from("foo")).filter().evaluate(Record.of(Slot.of("a", "bar"))), Record.of(Slot.of("a", "bar")));
  }

  @Test
  filterGreaterThanOrEqual(exam: Exam): void {
    exam.equal(Selector.get("a").ge(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 50))), Record.of(Slot.of("a", 50)));
    exam.equal(Selector.get("a").ge(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 42))), Record.of(Slot.of("a", 42)));
    exam.equal(Selector.get("a").ge(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 40))), Value.absent());
  }

  @Test
  filterGreaterThan(exam: Exam): void {
    exam.equal(Selector.get("a").gt(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 50))), Record.of(Slot.of("a", 50)));
    exam.equal(Selector.get("a").gt(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 42))), Value.absent());
    exam.equal(Selector.get("a").gt(Num.from(42)).filter().evaluate(Record.of(Slot.of("a", 40))), Value.absent());
  }

  @Test
  filterGetOrGet(exam: Exam): void {
    exam.equal(Selector.get("a").or(Selector.get("b")).filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
    exam.equal(Selector.get("a").or(Selector.get("c")).filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
    exam.equal(Selector.get("c").or(Selector.get("b")).filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
    exam.equal(Selector.get("c").or(Selector.get("d")).filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Value.absent());
  }

  @Test
  filterGetAndGet(exam: Exam): void {
    exam.equal(Selector.get("a").and(Selector.get("b")).filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
    exam.equal(Selector.get("c").and(Selector.get("b")).filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Value.absent());
  }

  @Test
  filterGetNot(exam: Exam): void {
    exam.equal(Selector.get("a").not().filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Value.absent());
    exam.equal(Selector.get("b").not().filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Value.absent());
    exam.equal(Selector.get("c").not().filter().evaluate(Record.of(Attr.of("a", 1), Slot.of("b", 2))), Record.of(Attr.of("a", 1), Slot.of("b", 2)));
  }
}
