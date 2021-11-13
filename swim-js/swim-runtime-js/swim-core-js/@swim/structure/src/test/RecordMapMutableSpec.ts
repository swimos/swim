// Copyright 2015-2021 Swim Inc.
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
import {Record, Text, Num} from "@swim/structure";

export class RecordMapMutableSpec extends Spec {
  @Test
  testMutableSet(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b");
    xs.set("k", "V");
    exam.equal(xs.length, 2);
    exam.equal(xs.fieldCount, 2);
    exam.equal(xs.get("k"), Text.from("V"));
    exam.equal(xs.get("a"), Text.from("b"));
    exam.equal(xs, Record.of().attr("k", "V").slot("a", "b"));

    xs.set("a", "B");
    exam.equal(xs.length, 2);
    exam.equal(xs.fieldCount, 2);
    exam.equal(xs.get("k"), Text.from("V"));
    exam.equal(xs.get("a"), Text.from("B"));
    exam.equal(xs, Record.of().attr("k", "V").slot("a", "B"));

    xs.set(4, 5);
    exam.equal(xs.length, 3);
    exam.equal(xs.fieldCount, 3);
    exam.equal(xs.get("k"), Text.from("V"));
    exam.equal(xs.get("a"), Text.from("B"));
    exam.equal(xs.get(4), Num.from(5));
    exam.equal(xs, Record.of().attr("k", "V").slot("a", "B").slot(4, 5));

    xs.set(4, "FOUR");
    exam.equal(xs.length, 3);
    exam.equal(xs.fieldCount, 3);
    exam.equal(xs.get("k"), Text.from("V"));
    exam.equal(xs.get("a"), Text.from("B"));
    exam.equal(xs.get(4), Text.from("FOUR"));
    exam.equal(xs, Record.of().attr("k", "V").slot("a", "B").slot(4, "FOUR"));
  }

  testMutableSetEmpty(exam: Exam): void {
    const xs = Record.create();
    xs.set("k", "v");
    exam.equal(xs.length, 1);
    exam.equal(xs.fieldCount, 1);
    exam.equal(xs.get("k"), Text.from("v"));
    exam.equal(xs, Record.of().slot("k", "v"));
  }

  @Test
  testMutableSetItem(exam: Exam): void {
    const xs = Record.of("a", "d", "c");
    xs.setItem(1, "b");
    exam.equal(xs.length, 3);
    exam.equal(xs.getItem(1), Text.from("b"));
  }

  testMutableUpdatedAttr(exam: Exam): void {
    let xs = Record.create();
    xs = xs.updatedAttr("k", "v");
    exam.equal(xs.length, 1);
    exam.equal(xs.fieldCount, 1);
    exam.equal(xs, Record.of().attr("k", "v"));

    xs = xs.updatedAttr("a", "b");
    exam.equal(xs.length, 2);
    exam.equal(xs.fieldCount, 2);
    exam.equal(xs, Record.of().attr("k", "v").attr("a", "b"));

    xs = xs.updatedAttr("k", "V");
    exam.equal(xs.length, 2);
    exam.equal(xs.fieldCount, 2);
    exam.equal(xs, Record.of().attr("k", "V").attr("a", "b"));

    xs = xs.updatedAttr("a", "B");
    exam.equal(xs.length, 2);
    exam.equal(xs.fieldCount, 2);
    exam.equal(xs, Record.of().attr("k", "V").attr("a", "B"));

    xs = Record.of().slot("k", "v").slot("a", "b");
    xs = xs.updatedAttr("k", "V");
    exam.equal(xs.length, 2);
    exam.equal(xs.fieldCount, 2);
    exam.equal(xs, Record.of().attr("k", "V").slot("a", "b"));
  }

  testMutableUpdatedSlot(exam: Exam): void {
    let xs = Record.create();
    xs = xs.updatedSlot("k", "v");
    exam.equal(xs.length, 1);
    exam.equal(xs.fieldCount, 1);
    exam.equal(xs, Record.of().slot("k", "v"));

    xs = xs.updatedSlot("a", "b");
    exam.equal(xs.length, 2);
    exam.equal(xs.fieldCount, 2);
    exam.equal(xs, Record.of().slot("k", "v").slot("a", "b"));

    xs = xs.updatedSlot("k", "V");
    exam.equal(xs.length, 2);
    exam.equal(xs.fieldCount, 2);
    exam.equal(xs, Record.of().slot("k", "V").slot("a", "b"));

    xs = xs.updatedSlot("a", "B");
    exam.equal(xs.length, 2);
    exam.equal(xs.fieldCount, 2);
    exam.equal(xs, Record.of().slot("k", "V").slot("a", "B"));

    xs = Record.of().attr("k", "v").attr("a", "b");
    xs = xs.updatedSlot("a", "B");
    exam.equal(xs.length, 2);
    exam.equal(xs.fieldCount, 2);
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "B"));
  }

  @Test
  testMutablePush(exam: Exam): void {
    const xs = Record.of("a", "b");
    xs.push("c");
    exam.equal(xs.length, 3);
    exam.equal(xs, Record.of("a", "b", "c"));
  }

  @Test
  testMutablePushEmpty(exam: Exam): void {
    const xs = Record.create();
    xs.push("a");
    exam.equal(xs.length, 1);
    exam.equal(xs, Record.of("a"));
  }

  @Test
  testMutablePushMultiple(exam: Exam): void {
    const xs = Record.of("a", "b");
    xs.push("c", "d");
    exam.equal(xs.length, 4);
    exam.equal(xs, Record.of("a", "b", "c", "d"));
  }

  @Test
  testMutablePushMultipleEmpty(exam: Exam): void {
    const xs = Record.create();
    xs.push();
    exam.equal(xs.length, 0);
    exam.equal(xs, Record.empty());

    xs.push("a", "b");
    exam.equal(xs.length, 2);
    exam.equal(xs, Record.of("a", "b"));
  }

  @Test
  testMutableSpliceInsert(exam: Exam): void {
    const xs = Record.of("b", "d");
    xs.splice(1, 0, "c");
    exam.equal(xs.length, 3);
    exam.equal(xs, Record.of("b", "c", "d"));

    xs.splice(0, 0, "a");
    exam.equal(xs.length, 4);
    exam.equal(xs, Record.of("a", "b", "c", "d"));

    xs.splice(4, 0, "e");
    exam.equal(xs.length, 5);
    exam.equal(xs, Record.of("a", "b", "c", "d", "e"));
  }

  @Test
  testMutableSpliceInsertMultiple(exam: Exam): void {
    let xs = Record.of("a", "d");
    xs.splice(1, 0, "b", "c");
    exam.equal(xs.length, 4);
    exam.equal(xs, Record.of("a", "b", "c", "d"));

    xs = Record.of("c", "d");
    xs.splice(0, 0, "a", "b");
    exam.equal(xs.length, 4);
    exam.equal(xs, Record.of("a", "b", "c", "d"));
  }

  @Test
  testMutableSpliceDelete(exam: Exam): void {
    const xs = Record.of("a", "b", "c");
    xs.splice(1, 1);
    exam.equal(xs.length, 2);
    exam.equal(xs, Record.of("a", "c"));

    xs.splice(1, 1);
    exam.equal(xs.length, 1);
    exam.equal(xs, Record.of("a"));

    xs.splice(0, 1);
    exam.equal(xs.length, 0);
    exam.equal(xs, Record.empty());
  }

  @Test
  testMutableDelete(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b");
    xs.delete("a");
    exam.equal(xs.length, 1);
    exam.equal(xs.fieldCount, 1);
    exam.equal(xs, Record.of().attr("k", "v"));

    xs.delete("z");
    exam.equal(xs.length, 1);
    exam.equal(xs.fieldCount, 1);
    exam.equal(xs, Record.of().attr("k", "v"));

    xs.delete("k");
    exam.equal(xs.length, 0);
    exam.equal(xs.fieldCount, 0);
    exam.equal(xs, Record.empty());

    xs.delete("z");
    exam.equal(xs.length, 0);
    exam.equal(xs.fieldCount, 0);
    exam.equal(xs, Record.empty());
  }

  @Test
  testMutableClear(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "d");
    xs.clear();
    exam.equal(xs.length, 0);
    exam.equal(xs, Record.empty());
  }

  @Test
  testAliasedSetItem(exam: Exam): void {
    const xs = Record.of("a", "d", "c");
    const ys = xs.branch();
    exam.true(xs.isAliased());
    exam.true(ys.isAliased());

    ys.setItem(1, "b");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.getItem(1), Text.from("d"));
    exam.equal(ys.getItem(1), Text.from("b"));

    xs.setItem(1, "B");
    exam.false(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.getItem(1), Text.from("B"));
    exam.equal(ys.getItem(1), Text.from("b"));
  }

  @Test
  testAliasedSet(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b");
    exam.true(xs.has("k")); // force hashTable
    const ys = xs.branch();

    ys.set("k", "V");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.fieldCount, 2);
    exam.equal(ys.fieldCount, 2);
    exam.equal(xs.get("k"), Text.from("v"));
    exam.equal(xs.get("a"), Text.from("b"));
    exam.equal(ys.get("k"), Text.from("V"));
    exam.equal(ys.get("a"), Text.from("b"));
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "b"));
    exam.equal(ys, Record.of().attr("k", "V").slot("a", "b"));

    xs.set("a", "B");
    exam.false(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.fieldCount, 2);
    exam.equal(ys.fieldCount, 2);
    exam.equal(xs.get("k"), Text.from("v"));
    exam.equal(xs.get("a"), Text.from("B"));
    exam.equal(ys.get("k"), Text.from("V"));
    exam.equal(ys.get("a"), Text.from("b"));
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "B"));
    exam.equal(ys, Record.of().attr("k", "V").slot("a", "b"));
  }

  @Test
  testAliasedUpdatedAttr(exam: Exam): void {
    let xs = Record.of().attr("k", "v").slot("a", "b");
    exam.true(xs.has("k")); // force hashTable
    let ys = xs.branch();

    ys = ys.updatedAttr("k", "V");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.fieldCount, 2);
    exam.equal(ys.fieldCount, 2);
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "b"));
    exam.equal(ys, Record.of().attr("k", "V").slot("a", "b"));

    xs = xs.updatedAttr("a", "B");
    exam.false(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.fieldCount, 2);
    exam.equal(ys.fieldCount, 2);
    exam.equal(xs, Record.of().attr("k", "v").attr("a", "B"));
    exam.equal(ys, Record.of().attr("k", "V").slot("a", "b"));
  }

  @Test
  testAliasedUpdatedSlot(exam: Exam): void {
    let xs = Record.of().attr("k", "v").slot("a", "b");
    exam.true(xs.has("k")); // force hashTable
    let ys = xs.branch();

    ys = ys.updatedSlot("a", "B");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.fieldCount, 2);
    exam.equal(ys.fieldCount, 2);
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "b"));
    exam.equal(ys, Record.of().attr("k", "v").slot("a", "B"));

    xs = xs.updatedSlot("k", "V");
    exam.false(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.fieldCount, 2);
    exam.equal(ys.fieldCount, 2);
    exam.equal(xs, Record.of().slot("k", "V").slot("a", "b"));
    exam.equal(ys, Record.of().attr("k", "v").slot("a", "B"));
  }

  @Test
  testAliasedPush(exam: Exam): void {
    const xs = Record.of("a", "b");
    const ys = xs.branch();

    ys.push("c");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 2);
    exam.equal(ys.length, 3);
    exam.equal(xs, Record.of("a", "b"));
    exam.equal(ys, Record.of("a", "b", "c"));

    xs.push("C");
    exam.false(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 3);
    exam.equal(ys.length, 3);
    exam.equal(xs, Record.of("a", "b", "C"));
    exam.equal(ys, Record.of("a", "b", "c"));
  }

  @Test
  testAliasedPushMultiple(exam: Exam): void {
    const xs = Record.of("c", "d");
    const ys = xs.branch();

    ys.push("e", "f");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 2);
    exam.equal(ys.length, 4);
    exam.equal(xs, Record.of("c", "d"));
    exam.equal(ys, Record.of("c", "d", "e", "f"));

    xs.push("E", "F");
    exam.false(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 4);
    exam.equal(ys.length, 4);
    exam.equal(xs, Record.of("c", "d", "E", "F"));
    exam.equal(ys, Record.of("c", "d", "e", "f"));
  }

  @Test
  testAliasedSpliceInsert(exam: Exam): void {
    const xs = Record.of("b", "d");
    const ys = xs.branch();

    ys.splice(1, 0, "c");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 2);
    exam.equal(ys.length, 3);
    exam.equal(xs, Record.of("b", "d"));
    exam.equal(ys, Record.of("b", "c", "d"));

    xs.splice(0, 0, "a");
    exam.false(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 3);
    exam.equal(ys.length, 3);
    exam.equal(xs, Record.of("a", "b", "d"));
    exam.equal(ys, Record.of("b", "c", "d"));
  }

  @Test
  testAliasedSpliceInsertMultiple(exam: Exam): void {
    const xs = Record.of("c", "f");
    const ys = xs.branch();

    ys.splice(1, 0, "d", "e");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 2);
    exam.equal(ys.length, 4);
    exam.equal(xs, Record.of("c", "f"));
    exam.equal(ys, Record.of("c", "d", "e", "f"));

    xs.splice(0, 0, "a", "b");
    exam.false(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 4);
    exam.equal(ys.length, 4);
    exam.equal(xs, Record.of("a", "b", "c", "f"));
    exam.equal(ys, Record.of("c", "d", "e", "f"));
  }

  @Test
  testAliasedSpliceDelete(exam: Exam): void {
    const xs = Record.of("a", "b", "c");
    const ys = xs.branch();

    ys.splice(1, 1);
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 3);
    exam.equal(ys.length, 2);
    exam.equal(xs, Record.of("a", "b", "c"));
    exam.equal(ys, Record.of("a", "c"));

    xs.splice(0, 1);
    exam.false(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 2);
    exam.equal(ys.length, 2);
    exam.equal(xs, Record.of("b", "c"));
    exam.equal(ys, Record.of("a", "c"));
  }

  @Test
  testAliasedDelete(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b");
    const ys = xs.branch();

    ys.delete("a");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 2);
    exam.equal(ys.length, 1);
    exam.equal(xs.fieldCount, 2);
    exam.equal(ys.fieldCount, 1);
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "b"));
    exam.equal(ys, Record.of().attr("k", "v"));

    xs.delete("k");
    exam.false(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 1);
    exam.equal(ys.length, 1);
    exam.equal(xs.fieldCount, 1);
    exam.equal(ys.fieldCount, 1);
    exam.equal(xs, Record.of().slot("a", "b"));
    exam.equal(ys, Record.of().attr("k", "v"));
  }

  @Test
  testAliasedClear(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "d");
    const ys = xs.branch();

    ys.clear();
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 4);
    exam.equal(ys.length, 0);
    exam.equal(xs, Record.of("a", "b", "c", "d"));
    exam.equal(ys, Record.empty());

    xs.clear();
    exam.false(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 0);
    exam.equal(ys.length, 0);
    exam.equal(xs, Record.empty());
    exam.equal(ys, Record.empty());
  }
}
