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
import {Record, Text} from "@swim/structure";

export class RecordMapImmutableSpec extends Spec {
  @Test
  testImmutablSet(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").commit();
    exam.throws(() => xs.set("k", "V"));
  }

  @Test
  testImmutableSetItem(exam: Exam): void {
    const xs = Record.of("a", "d", "c").commit();
    exam.throws(() => xs.setItem(1, "b"));
  }

  @Test
  testImmutableUpdatedAttr(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").commit();
    exam.true(xs.has("k")); // force hashTable
    const ys = xs.updatedAttr("a", "B");
    exam.equal(xs.fieldCount, 2);
    exam.equal(ys.fieldCount, 2);
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "b"));
    exam.equal(ys, Record.of().attr("k", "v").attr("a", "B"));
  }

  @Test
  testImmutableUpdatedSlot(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").commit();
    exam.true(xs.has("k")); // force hashTable
    const ys = xs.updatedSlot("k", "V");
    exam.equal(xs.fieldCount, 2);
    exam.equal(ys.fieldCount, 2);
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "b"));
    exam.equal(ys, Record.of().slot("k", "V").slot("a", "b"));
  }

  @Test
  testImmutablePush(exam: Exam): void {
    const xs = Record.of("a", "b").commit();
    exam.throws(() => xs.push("c"));
  }

  @Test
  testImmutablePushMultiple(exam: Exam): void {
    const xs = Record.of("a", "b").commit();
    exam.throws(() => xs.push("c", "d"));
  }

  @Test
  testImmutableSpliceInsert(exam: Exam): void {
    const xs = Record.of("b", "d").commit();
    exam.throws(() => xs.splice(1, 0, "c"));
  }

  @Test
  testImmutableSpliceInsertMultiple(exam: Exam): void {
    const xs = Record.of("a", "d").commit();
    exam.throws(() => xs.splice(1, 0, "b", "c"));
  }

  @Test
  testImmutableRemoveSpliceDelete(exam: Exam): void {
    const xs = Record.of("a", "b", "c").commit();
    exam.throws(() => xs.splice(1, 1));
  }

  @Test
  testImmutableDelete(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").commit();
    exam.throws(() => xs.delete("a"));
  }

  @Test
  testImmutableClear(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "d").commit();
    exam.throws(() => xs.clear());
  }

  @Test
  testBranchedSetItem(exam: Exam): void {
    const xs = Record.of("a", "d", "c").commit();
    const ys = xs.branch();
    exam.false(xs.isMutable());
    exam.true(ys.isMutable());
    ys.setItem(1, "b");
    exam.equal(xs.getItem(1), Text.from("d"));
    exam.equal(ys.getItem(1), Text.from("b"));
  }

  @Test
  testBranchedSet(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").commit();
    exam.true(xs.has("k")); // force hashTable
    const ys = xs.branch();
    ys.set("k", "V");
    exam.equal(xs.fieldCount, 2);
    exam.equal(ys.fieldCount, 2);
    exam.equal(xs.get("k"), Text.from("v"));
    exam.equal(xs.get("a"), Text.from("b"));
    exam.equal(ys.get("k"), Text.from("V"));
    exam.equal(ys.get("a"), Text.from("b"));
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "b"));
    exam.equal(ys, Record.of().attr("k", "V").slot("a", "b"));
  }

  @Test
  testBranchedPush(exam: Exam): void {
    const xs = Record.of("a", "b").commit();
    const ys = xs.branch();
    ys.push("c");
    exam.equal(xs.length, 2);
    exam.equal(ys.length, 3);
    exam.equal(xs, Record.of("a", "b"));
    exam.equal(ys, Record.of("a", "b", "c"));
  }

  @Test
  testBranchedPushMultiple(exam: Exam): void {
    const xs = Record.of("c", "d").commit();
    const ys = xs.branch();
    ys.push("e", "f");
    exam.equal(xs.length, 2);
    exam.equal(ys.length, 4);
    exam.equal(xs, Record.of("c", "d"));
    exam.equal(ys, Record.of("c", "d", "e", "f"));
  }

  @Test
  testBranchedSpliceInsert(exam: Exam): void {
    const xs = Record.of("b", "d").commit();
    const ys = xs.branch();
    ys.splice(1, 0, "c");
    exam.equal(xs.length, 2);
    exam.equal(ys.length, 3);
    exam.equal(xs, Record.of("b", "d"));
    exam.equal(ys, Record.of("b", "c", "d"));
  }

  @Test
  testBranchedSpliceInsertMultiple(exam: Exam): void {
    const xs = Record.of("c", "f").commit();
    const ys = xs.branch();
    ys.splice(1, 0, "d", "e");
    exam.equal(xs.length, 2);
    exam.equal(ys.length, 4);
    exam.equal(xs, Record.of("c", "f"));
    exam.equal(ys, Record.of("c", "d", "e", "f"));
  }

  @Test
  testBranchedSpliceDelete(exam: Exam): void {
    const xs = Record.of("a", "b", "c").commit();
    const ys = xs.branch();
    ys.splice(1, 1);
    exam.equal(xs.length, 3);
    exam.equal(ys.length, 2);
    exam.equal(xs, Record.of("a", "b", "c"));
    exam.equal(ys, Record.of("a", "c"));
  }

  @Test
  testBranchedDelete(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").commit();
    const ys = xs.branch();
    ys.delete("a");
    exam.equal(xs.length, 2);
    exam.equal(ys.length, 1);
    exam.equal(xs.fieldCount, 2);
    exam.equal(ys.fieldCount, 1);
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "b"));
    exam.equal(ys, Record.of().attr("k", "v"));
  }

  @Test
  testBranchedClear(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "d").commit();
    const ys = xs.branch();
    ys.clear();
    exam.equal(xs.length, 4);
    exam.equal(ys.length, 0);
    exam.equal(xs, Record.of("a", "b", "c", "d"));
    exam.equal(ys, Record.empty());
  }
}
