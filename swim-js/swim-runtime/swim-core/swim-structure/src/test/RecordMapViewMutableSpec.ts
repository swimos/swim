// Copyright 2015-2022 Swim.inc
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

export class RecordMapViewMutableSpec extends Spec {
  @Test
  testMutableViewSet(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").slot("c", "d");
    const xss = xs.subRecord(1, 2);

    xss.set("a", "B");
    exam.equal(xs.length, 3);
    exam.equal(xss.length, 1);
    exam.equal(xs.fieldCount, 3);
    exam.equal(xs.get("a"), Text.from("B"));
    exam.equal(xss.get("a"), Text.from("B"));
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "B").slot("c", "d"));
    exam.equal(xss, Record.of().slot("a", "B"));

    xss.set("k", "V");
    exam.equal(xs.length, 4);
    exam.equal(xss.length, 2);
    exam.equal(xs.fieldCount, 4);
    exam.equal(xs.get("k"), Text.from("V"));
    exam.equal(xss.get("k"), Text.from("V"));
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "B").slot("k", "V").slot("c", "d"));
    exam.equal(xss, Record.of().slot("a", "B").slot("k", "V"));
  }

  @Test
  testMutableViewSetItem(exam: Exam): void {
    const xs = Record.of("a", "d", "c");
    const xss = xs.subRecord(1, 2);
    xss.setItem(0, "b");
    exam.equal(xss.length, 1);
    exam.equal(xss.getItem(0), Text.from("b"));
    exam.equal(xs.length, 3);
    exam.equal(xs.getItem(1), Text.from("b"));
  }

  @Test
  testMutableViewUpdatedAttr(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").slot("e", "f");
    let xss = xs.subRecord(1, 2);

    xss = xss.updatedAttr("a", "B");
    exam.equal(xs.length, 3);
    exam.equal(xss.length, 1);
    exam.equal(xs.fieldCount, 3);
    exam.equal(xs.get("a"), Text.from("B"));
    exam.equal(xss.get("a"), Text.from("B"));
    exam.equal(xs, Record.of().attr("k", "v").attr("a", "B").slot("e", "f"));
    exam.equal(xss, Record.of().attr("a", "B"));

    xss = xss.updatedAttr("c", "D");
    exam.equal(xs.length, 4);
    exam.equal(xss.length, 2);
    exam.equal(xs.fieldCount, 4);
    exam.equal(xs.get("c"), Text.from("D"));
    exam.equal(xss.get("c"), Text.from("D"));
    exam.equal(xs, Record.of().attr("k", "v").attr("a", "B").attr("c", "D").slot("e", "f"));
    exam.equal(xss, Record.of().attr("a", "B").attr("c", "D"));
  }

  @Test
  testMutableViewUpdatedSlot(exam: Exam): void {
    const xs = Record.of().attr("k", "v").attr("a", "b").slot("e", "f");
    let xss = xs.subRecord(1, 2);

    xss = xss.updatedSlot("a", "B");
    exam.equal(xs.length, 3);
    exam.equal(xss.length, 1);
    exam.equal(xs.fieldCount, 3);
    exam.equal(xs.get("a"), Text.from("B"));
    exam.equal(xss.get("a"), Text.from("B"));
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "B").slot("e", "f"));
    exam.equal(xss, Record.of().slot("a", "B"));

    xss = xss.updatedSlot("c", "D");
    exam.equal(xs.length, 4);
    exam.equal(xss.length, 2);
    exam.equal(xs.fieldCount, 4);
    exam.equal(xs.get("c"), Text.from("D"));
    exam.equal(xss.get("c"), Text.from("D"));
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "B").slot("c", "D").slot("e", "f"));
    exam.equal(xss, Record.of().slot("a", "B").slot("c", "D"));
  }

  @Test
  testMutableViewPush(exam: Exam): void {
    const xs = Record.of("a", "b", "d");
    const xss = xs.subRecord(1, 2);
    xss.push("c");
    exam.equal(xs.length, 4);
    exam.equal(xss.length, 2);
    exam.equal(xs, Record.of("a", "b", "c", "d"));
    exam.equal(xss, Record.of("b", "c"));
  }

  @Test
  testMutableViewPushMultiple(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "f");
    const xss = xs.subRecord(1, 3);
    xss.push("d", "e");
    exam.equal(xs.length, 6);
    exam.equal(xss.length, 4);
    exam.equal(xs, Record.of("a", "b", "c", "d", "e", "f"));
    exam.equal(xss, Record.of("b", "c", "d", "e"));
  }

  @Test
  testMutableViewSpliceInsert(exam: Exam): void {
    const xs = Record.of("a", "c", "e", "g");
    const xss = xs.subRecord(1, 3);

    xss.splice(1, 0, "d");
    exam.equal(xs.length, 5);
    exam.equal(xss.length, 3);
    exam.equal(xs, Record.of("a", "c", "d", "e", "g"));
    exam.equal(xss, Record.of("c", "d", "e"));

    xss.splice(0, 0, "b");
    exam.equal(xs.length, 6);
    exam.equal(xss.length, 4);
    exam.equal(xs, Record.of("a", "b", "c", "d", "e", "g"));
    exam.equal(xss, Record.of("b", "c", "d", "e"));

    xss.splice(4, 0, "f");
    exam.equal(xs.length, 7);
    exam.equal(xss.length, 5);
    exam.equal(xs, Record.of("a", "b", "c", "d", "e", "f", "g"));
    exam.equal(xss, Record.of("b", "c", "d", "e", "f"));
  }

  @Test
  testMutableViewSpliceInsertMultiple(exam: Exam): void {
    const xs = Record.of("a", "b", "e", "f");
    const xss = xs.subRecord(1, 3);

    xss.splice(1, 0, "c", "d");
    exam.equal(xs.length, 6);
    exam.equal(xss.length, 4);
    exam.equal(xs, Record.of("a", "b", "c", "d", "e", "f"));
    exam.equal(xss, Record.of("b", "c", "d", "e"));
  }

  @Test
  testMutableViewSpliceDelete(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "d", "e");
    const xss = xs.subRecord(1, 4);

    xss.splice(1, 1);
    exam.equal(xs.length, 4);
    exam.equal(xss.length, 2);
    exam.equal(xs, Record.of("a", "b", "d", "e"));
    exam.equal(xss, Record.of("b", "d"));

    xss.splice(1, 1);
    exam.equal(xs.length, 3);
    exam.equal(xss.length, 1);
    exam.equal(xs, Record.of("a", "b", "e"));
    exam.equal(xss, Record.of("b"));

    xss.splice(0, 1);
    exam.equal(xs.length, 2);
    exam.equal(xss.length, 0);
    exam.equal(xs, Record.of("a", "e"));
    exam.equal(xss, Record.empty());
  }

  @Test
  testMutableViewDelete(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").slot("c", "d").slot("e", "f");
    const xss = xs.subRecord(1, 3);

    xss.delete("c");
    exam.equal(xs.length, 3);
    exam.equal(xss.length, 1);
    exam.equal(xs.fieldCount, 3);
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "b").slot("e", "f"));
    exam.equal(xss, Record.of().slot("a", "b"));

    xss.delete("k");
    exam.equal(xs.length, 3);
    exam.equal(xss.length, 1);
    exam.equal(xs.fieldCount, 3);
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "b").slot("e", "f"));
    exam.equal(xss, Record.of().slot("a", "b"));

    xss.delete("a");
    exam.equal(xs.length, 2);
    exam.equal(xss.length, 0);
    exam.equal(xs.fieldCount, 2);
    exam.equal(xs, Record.of().attr("k", "v").slot("e", "f"));
    exam.equal(xss, Record.empty());

    xss.delete("z");
    exam.equal(xs.length, 2);
    exam.equal(xss.length, 0);
    exam.equal(xs.fieldCount, 2);
    exam.equal(xs, Record.of().attr("k", "v").slot("e", "f"));
    exam.equal(xss, Record.empty());
  }

  @Test
  testMutableViewClear(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "d");
    const xss = xs.subRecord(1, 3);
    xss.clear();
    exam.equal(xs.length, 2);
    exam.equal(xss.length, 0);
    exam.equal(xs, Record.of("a", "d"));
    exam.equal(xss, Record.empty());
  }

  @Test
  testAliasedViewSetItem(exam: Exam): void {
    const xs = Record.of("a", "d", "c");
    const ys = xs.branch();
    const yss = ys.subRecord(1, 2);
    yss.setItem(0, "b");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 3);
    exam.equal(ys.length, 3);
    exam.equal(yss.length, 1);
    exam.equal(xs, Record.of("a", "d", "c"));
    exam.equal(ys, Record.of("a", "b", "c"));
    exam.equal(yss, Record.of("b"));
  }

  @Test
  testAliasedViewSet(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").slot("c", "d");
    const ys = xs.branch();
    const yss = ys.subRecord(1, 3);
    yss.set("a", "B");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 3);
    exam.equal(ys.length, 3);
    exam.equal(yss.length, 2);
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "b").slot("c", "d"));
    exam.equal(ys, Record.of().attr("k", "v").slot("a", "B").slot("c", "d"));
    exam.equal(yss, Record.of().slot("a", "B").slot("c", "d"));
  }

  @Test
  testAliasedViewUpdatedAttr(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").slot("e", "f");
    const ys = xs.branch();
    let yss = ys.subRecord(1, 2);
    yss = yss.updatedAttr("a", "B");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 3);
    exam.equal(ys.length, 3);
    exam.equal(yss.length, 1);
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "b").slot("e", "f"));
    exam.equal(ys, Record.of().attr("k", "v").attr("a", "B").slot("e", "f"));
    exam.equal(yss, Record.of().attr("a", "B"));
  }

  @Test
  testAliasedViewUpdatedSlot(exam: Exam): void {
    const xs = Record.of().attr("k", "v").attr("a", "b").slot("e", "f");
    const ys = xs.branch();
    let yss = ys.subRecord(1, 2);
    yss = yss.updatedSlot("a", "B");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 3);
    exam.equal(ys.length, 3);
    exam.equal(yss.length, 1);
    exam.equal(xs, Record.of().attr("k", "v").attr("a", "b").slot("e", "f"));
    exam.equal(ys, Record.of().attr("k", "v").slot("a", "B").slot("e", "f"));
    exam.equal(yss, Record.of().slot("a", "B"));
  }

  @Test
  testAliasedViewPush(exam: Exam): void {
    const xs = Record.of("a", "b", "d");
    const ys = xs.branch();
    const yss = ys.subRecord(1, 2);
    yss.push("c");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 3);
    exam.equal(ys.length, 4);
    exam.equal(yss.length, 2);
    exam.equal(xs, Record.of("a", "b", "d"));
    exam.equal(ys, Record.of("a", "b", "c", "d"));
    exam.equal(yss, Record.of("b", "c"));
  }

  @Test
  testAliasedViewAddPushMultiple(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "f");
    const ys = xs.branch();
    const yss = ys.subRecord(1, 3);
    yss.push("d", "e");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 4);
    exam.equal(ys.length, 6);
    exam.equal(yss.length, 4);
    exam.equal(xs, Record.of("a", "b", "c", "f"));
    exam.equal(ys, Record.of("a", "b", "c", "d", "e", "f"));
    exam.equal(yss, Record.of("b", "c", "d", "e"));
  }

  @Test
  testAliasedViewSpliceInsert(exam: Exam): void {
    const xs = Record.of("a", "b", "d", "e");
    const ys = xs.branch();
    const yss = ys.subRecord(1, 3);
    yss.splice(1, 0, "c");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 4);
    exam.equal(ys.length, 5);
    exam.equal(yss.length, 3);
    exam.equal(xs, Record.of("a", "b", "d", "e"));
    exam.equal(ys, Record.of("a", "b", "c", "d", "e"));
    exam.equal(yss, Record.of("b", "c", "d"));
  }

  @Test
  testAliasedViewSpliceInsertMultiple(exam: Exam): void {
    const xs = Record.of("a", "b", "e", "f");
    const ys = xs.branch();
    const yss = ys.subRecord(1, 3);
    yss.splice(1, 0, "c", "d");
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 4);
    exam.equal(ys.length, 6);
    exam.equal(yss.length, 4);
    exam.equal(xs, Record.of("a", "b", "e", "f"));
    exam.equal(ys, Record.of("a", "b", "c", "d", "e", "f"));
    exam.equal(yss, Record.of("b", "c", "d", "e"));
  }

  @Test
  testAliasedViewSpliceDelete(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "d", "e");
    const ys = xs.branch();
    const yss = ys.subRecord(1, 4);
    yss.splice(1, 1);
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 5);
    exam.equal(ys.length, 4);
    exam.equal(yss.length, 2);
    exam.equal(xs, Record.of("a", "b", "c", "d", "e"));
    exam.equal(ys, Record.of("a", "b", "d", "e"));
    exam.equal(yss, Record.of("b", "d"));
  }

  @Test
  testAliasedViewClear(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "d");
    const ys = xs.branch();
    const yss = ys.subRecord(1, 3);
    yss.clear();
    exam.true(xs.isAliased());
    exam.false(ys.isAliased());
    exam.equal(xs.length, 4);
    exam.equal(ys.length, 2);
    exam.equal(yss.length, 0);
    exam.equal(xs, Record.of("a", "b", "c", "d"));
    exam.equal(ys, Record.of("a", "d"));
    exam.equal(yss, Record.empty());
  }
}
