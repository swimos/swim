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
import {Record} from "@swim/structure";

export class RecordMapViewImmutableSpec extends Spec {
  @Test
  testImmutableViewSet(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").slot("c", "d");
    const xss = xs.subRecord(1, 2);
    xs.commit();
    exam.throws(() => xss.set("a", "B"));
  }

  @Test
  testImmutableViewSetItem(exam: Exam): void {
    const xs = Record.of("a", "d", "c");
    const xss = xs.subRecord(1, 2);
    xs.commit();
    exam.throws(() => xss.setItem(0, "b"));
  }

  @Test
  testImmutableViewUpdatedAttr(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").slot("c", "d");
    const xss = xs.subRecord(1, 2);
    xs.commit();
    const yss = xss.updatedAttr("a", "B");
    exam.equal(xs, Record.of().attr("k", "v").slot("a", "b").slot("c", "d"));
    exam.equal(xss, Record.of().slot("a", "b"));
    exam.equal(yss, Record.of().attr("a", "B"));
  }

  @Test
  testImmutableViewUpdatedSlot(exam: Exam): void {
    const xs = Record.of().attr("k", "v").attr("a", "b").slot("c", "d");
    const xss = xs.subRecord(1, 2);
    xs.commit();
    const yss = xss.updatedSlot("a", "B");
    exam.equal(xs, Record.of().attr("k", "v").attr("a", "b").slot("c", "d"));
    exam.equal(xss, Record.of().attr("a", "b"));
    exam.equal(yss, Record.of().slot("a", "B"));
  }

  @Test
  testImmutableViewPush(exam: Exam): void {
    const xs = Record.of("a", "b", "d");
    const xss = xs.subRecord(1, 2);
    xs.commit();
    exam.throws(() => xss.push("c"));
  }

  @Test
  testImmutableViewPushMultiple(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "f");
    const xss = xs.subRecord(1, 3);
    xs.commit();
    exam.throws(() => xss.push("d", "e"));
  }

  @Test
  testImmutableViewSpliceInsert(exam: Exam): void {
    const xs = Record.of("a", "c", "e", "g");
    const xss = xs.subRecord(1, 3);
    xs.commit();
    exam.throws(() => xss.splice(1, 0, "d"));
  }

  @Test
  testImmutableViewSpliceInsertMultiple(exam: Exam): void {
    const xs = Record.of("a", "b", "e", "f");
    const xss = xs.subRecord(1, 3);
    xs.commit();
    exam.throws(() => xss.splice(1, 0, "c", "d"));
  }

  @Test
  testImmutableViewSpliceDelete(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "d", "e");
    const xss = xs.subRecord(1, 4);
    xs.commit();
    exam.throws(() => xss.splice(1, 1));
  }

  @Test
  testImmutableViewDelete(exam: Exam): void {
    const xs = Record.of().attr("k", "v").slot("a", "b").slot("c", "d").slot("e", "f");
    const xss = xs.subRecord(1, 3);
    xs.commit();
    exam.throws(() => xss.delete("c"));
  }

  @Test
  testImmutableViewClear(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "d");
    const xss = xs.subRecord(1, 3);
    xs.commit();
    exam.throws(() => xss.clear());
  }

  @Test
  testBranchedViewSetItem(exam: Exam): void {
    const xs = Record.of("a", "d", "c").commit();
    const xss = xs.subRecord(1, 2);
    const yss = xss.branch();
    yss.setItem(0, "b");
    exam.equal(xs.length, 3);
    exam.equal(xss.length, 1);
    exam.equal(yss.length, 1);
    exam.equal(xs, Record.of("a", "d", "c"));
    exam.equal(xss, Record.of("d"));
    exam.equal(yss, Record.of("b"));
  }

  @Test
  testBranchedViewPush(exam: Exam): void {
    const xs = Record.of("a", "b", "d").commit();
    const xss = xs.subRecord(1, 2);
    const yss = xss.branch();
    yss.push("c");
    exam.equal(xs.length, 3);
    exam.equal(xss.length, 1);
    exam.equal(yss.length, 2);
    exam.equal(xs, Record.of("a", "b", "d"));
    exam.equal(xss, Record.of("b"));
    exam.equal(yss, Record.of("b", "c"));
  }

  @Test
  testBranchedViewPushMultiple(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "f").commit();
    const xss = xs.subRecord(1, 3);
    const yss = xss.branch();
    yss.push("d", "e");
    exam.equal(xs.length, 4);
    exam.equal(xss.length, 2);
    exam.equal(yss.length, 4);
    exam.equal(xs, Record.of("a", "b", "c", "f"));
    exam.equal(xss, Record.of("b", "c"));
    exam.equal(yss, Record.of("b", "c", "d", "e"));
  }

  @Test
  testBranchedViewSpliceInsert(exam: Exam): void {
    const xs = Record.of("a", "b", "d", "e").commit();
    const xss = xs.subRecord(1, 3);
    const yss = xss.branch();
    yss.splice(1, 0, "c");
    exam.equal(xs.length, 4);
    exam.equal(xss.length, 2);
    exam.equal(yss.length, 3);
    exam.equal(xs, Record.of("a", "b", "d", "e"));
    exam.equal(xss, Record.of("b", "d"));
    exam.equal(yss, Record.of("b", "c", "d"));
  }

  @Test
  testBranchedViewSpliceInsertMultiple(exam: Exam): void {
    const xs = Record.of("a", "b", "e", "f").commit();
    const xss = xs.subRecord(1, 3);
    const yss = xss.branch();
    yss.splice(1, 0, "c", "d");
    exam.equal(xs.length, 4);
    exam.equal(xss.length, 2);
    exam.equal(yss.length, 4);
    exam.equal(xs, Record.of("a", "b", "e", "f"));
    exam.equal(xss, Record.of("b", "e"));
    exam.equal(yss, Record.of("b", "c", "d", "e"));
  }

  @Test
  testBranchedViewSpliceDelete(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "d", "e").commit();
    const xss = xs.subRecord(1, 4);
    const yss = xss.branch();
    yss.splice(1, 1);
    exam.equal(xs.length, 5);
    exam.equal(xss.length, 3);
    exam.equal(yss.length, 2);
    exam.equal(xs, Record.of("a", "b", "c", "d", "e"));
    exam.equal(xss, Record.of("b", "c", "d"));
    exam.equal(yss, Record.of("b", "d"));
  }

  @Test
  testBranchedViewClear(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "d").commit();
    const xss = xs.subRecord(1, 3);
    const yss = xss.branch();
    yss.clear();
    exam.equal(xs.length, 4);
    exam.equal(xss.length, 2);
    exam.equal(yss.length, 0);
    exam.equal(xs, Record.of("a", "b", "c", "d"));
    exam.equal(xss, Record.of("b", "c"));
    exam.equal(yss, Record.empty());
  }
}
