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

import {Spec, Unit, Test, Exam} from "@swim/unit";
import {Value, Attr, Slot, Record, Text} from "@swim/structure";
import {RecordMapViewMutableSpec} from "./RecordMapViewMutableSpec";
import {RecordMapViewImmutableSpec} from "./RecordMapViewImmutableSpec";

export class RecordMapViewSpec extends Spec {
  @Unit
  mutableSpec(): Spec {
    return new RecordMapViewMutableSpec();
  }

  @Unit
  immutableSpec(): Spec {
    return new RecordMapViewImmutableSpec();
  }

  @Test
  testViewIsEmpty(exam: Exam): void {
    exam.true(Record.of("a", "b", "c").subRecord(1, 1).isEmpty());
    exam.false(Record.of("a", "b", "c").subRecord(1, 2).isEmpty());
  }

  @Test
  testViewSize(exam: Exam): void {
    exam.equal(Record.of("a", "b", "c").subRecord(1, 1).length, 0);
    exam.equal(Record.of("a", "b", "c").subRecord(1, 2).length, 1);
  }

  @Test
  testViewTail(exam: Exam): void {
    exam.equal(Record.of("a").subRecord(1, 1).tail(), Record.empty());
    exam.equal(Record.of("a", "b").subRecord(1, 2).tail(), Record.empty());
    exam.equal(Record.of("a", "b", "c").subRecord(1, 3).tail(), Record.of("c"));
    exam.equal(Record.of("a", "b", "c", "d").subRecord(1, 4).tail(), Record.of("c", "d"));
  }

  @Test
  testViewBody(exam: Exam): void {
    exam.equal(Record.of("a").subRecord(1, 1).body(), Value.absent());
    exam.equal(Record.of("a", "b").subRecord(1, 2).body(), Value.absent());
    exam.equal(Record.of("a", "b", "c").subRecord(1, 3).body(), Text.from("c"));
    exam.equal(Record.of("a", "b").attr("c").subRecord(1, 3).body(), Record.of().attr("c"));
    exam.equal(Record.of("a", "b", "c", "d").subRecord(1, 4).body(), Record.of("c", "d"));
  }

  @Test
  testViewHas(exam: Exam): void {
    const xss = Record.of().attr("k", "v").attr("a", "b").slot(3, "three").slot(4, "four").subRecord(1, 3);
    exam.false(xss.has("k"));
    exam.true(xss.has("a"));
    exam.true(xss.has(3));
    exam.false(xss.has(4));
  }

  @Test
  testViewIndexOf(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "c", "d", "e");
    const xss = xs.subRecord(1, 5);
    exam.equal(xss.indexOf("a"), -1);
    exam.equal(xss.indexOf("b"), 0);
    exam.equal(xss.indexOf("c"), 1);
    exam.equal(xss.indexOf("d"), 3);
    exam.equal(xss.indexOf("e"), -1);
  }

  @Test
  testViewLastIndexOf(exam: Exam): void {
    const xs = Record.of("a", "b", "c", "c", "d", "e");
    const xss = xs.subRecord(1, 5);
    exam.equal(xss.lastIndexOf("e"), -1);
    exam.equal(xss.lastIndexOf("d"), 3);
    exam.equal(xss.lastIndexOf("c"), 2);
    exam.equal(xss.lastIndexOf("b"), 0);
    exam.equal(xss.lastIndexOf("a"), -1);
  }

  @Test
  testViewGet(exam: Exam): void {
    const xss = Record.of().attr("k", "v").attr("a", "b").slot(3, "three").slot(4, "four").subRecord(1, 3);
    exam.equal(xss.get("k"), Value.absent());
    exam.equal(xss.get("a"), Text.from("b"));
    exam.equal(xss.get(3), Text.from("three"));
    exam.equal(xss.get(4), Value.absent());
  }

  @Test
  testViewGetAttr(exam: Exam): void {
    const xss = Record.of().attr("a", "b").item("c").slot("d", "e").attr("f", "g").attr("h", "i").item("j").attr("k", "v").subRecord(1, 5);
    exam.equal(xss.getAttr("a"), Value.absent());
    exam.equal(xss.getAttr("d"), Value.absent());
    exam.equal(xss.getAttr("f"), Text.from("g"));
    exam.equal(xss.getAttr("h"), Text.from("i"));
    exam.equal(xss.getAttr("k"), Value.absent());
  }

  @Test
  testViewGetSlot(exam: Exam): void {
    const xss = Record.of().slot("a", "b").item("c").attr("d", "e").slot("f", "g").slot("h", "i").item("j").slot("k", "v").subRecord(1, 5);
    exam.equal(xss.getSlot("a"), Value.absent());
    exam.equal(xss.getSlot("d"), Value.absent());
    exam.equal(xss.getSlot("f"), Text.from("g"));
    exam.equal(xss.getSlot("h"), Text.from("i"));
    exam.equal(xss.getSlot("k"), Value.absent());
  }

  @Test
  testViewGetField(exam: Exam): void {
    const xss = Record.of().attr("a", "b").item("c").slot("d", "e").attr("f", "g").attr("h", "i").item("j").attr("k", "v").subRecord(1, 5);
    exam.equal(xss.getField("a"), void 0);
    exam.equal(xss.getField("d"), Slot.of("d", "e"));
    exam.equal(xss.getField("f"), Attr.of("f", "g"));
    exam.equal(xss.getField("h"), Attr.of("h", "i"));
    exam.equal(xss.getField("k"), void 0);
  }

  @Test
  testViewGetItem(exam: Exam): void {
    const xss = Record.of("a", "b", "c", "d", "e").subRecord(1, 4);
    exam.equal(xss.getItem(0), Text.from("b"));
    exam.equal(xss.getItem(1), Text.from("c"));
    exam.equal(xss.getItem(2), Text.from("d"));
  }

  @Test
  testViewGetItemOutOfBounds(exam: Exam): void {
    const xss = Record.of("a", "b", "c", "d", "e").subRecord(1, 4);
    exam.equal(xss.getItem(-1), Text.from("d"));
    exam.equal(xss.getItem(3), Value.absent());
  }

  @Test
  testViewIterator(exam: Exam): void {
    const iter = Record.of("a", "b", "c", "d", "e").subRecord(1, 4).iterator();
    exam.true(iter.hasNext());
    exam.equal(iter.next().value!, Text.from("b"));
    exam.true(iter.hasNext());
    exam.equal(iter.next().value!, Text.from("c"));
    exam.true(iter.hasNext());
    exam.equal(iter.next().value!, Text.from("d"));
    exam.false(iter.hasNext());
  }
}
