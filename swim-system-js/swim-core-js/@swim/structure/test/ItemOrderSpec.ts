// Copyright 2015-2021 Swim inc.
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
import {Attr, Slot, Value, Record, Data, Text, Num, Bool} from "@swim/structure";

export class ItemOrderSpec extends Spec {
  @Test
  orderAttrsByKeyThenValue(exam: Exam): void {
    exam.compareLessThan(Attr.of("a"), Attr.of("b"));
    exam.compareGreaterThan(Attr.of("b"), Attr.of("a"));
    exam.compareLessThan(Attr.of("a", 0), Attr.of("a", 1));
    exam.compareGreaterThan(Attr.of("a", 1), Attr.of("a", 0));
    exam.compareEqual(Attr.of("a"), Attr.of("a"));
    exam.compareEqual(Attr.of("a", 0), Attr.of("a", 0));
  }

  @Test
  orderSlotsByKeyThenValue(exam: Exam): void {
    exam.compareLessThan(Slot.of("a"), Slot.of("b"));
    exam.compareGreaterThan(Slot.of("b"), Slot.of("a"));
    exam.compareLessThan(Slot.of("a", 0), Slot.of("a", 1));
    exam.compareGreaterThan(Slot.of("a", 1), Slot.of("a", 0));
    exam.compareEqual(Slot.of("a"), Slot.of("a"));
    exam.compareEqual(Slot.of("a", 0), Slot.of("a", 0));
  }

  @Test
  orderRecordsBySequentialItemOrder(exam: Exam): void {
    exam.compareLessThan(Record.empty(), Record.of(1));
    exam.compareGreaterThan(Record.of(1), Record.empty());
    exam.compareLessThan(Record.of(1), Record.of(1, "a"));
    exam.compareGreaterThan(Record.of(1, "a"), Record.of(1));
    exam.compareLessThan(Record.of(1, "a"), Record.of(1, "b"));
    exam.compareGreaterThan(Record.of(1, "b"), Record.of(1, "a"));
    exam.compareLessThan(Record.of(0, "a"), Record.of(1));
    exam.compareGreaterThan(Record.of(1), Record.of(0, "a"));
    exam.compareEqual(Record.empty(), Record.empty());
    exam.compareEqual(Record.of(1), Record.of(1));
    exam.compareEqual(Record.of(1, "a"), Record.of(1, "a"));
  }

  @Test
  ordeTextBySequentialCodePointOrder(exam: Exam): void {
    exam.compareLessThan(Text.empty(), Text.from("a"));
    exam.compareGreaterThan(Text.from("a"), Text.empty());
    exam.compareLessThan(Text.from("a"), Text.from("aa"));
    exam.compareGreaterThan(Text.from("aa"), Text.from("a"));
    exam.compareLessThan(Text.from("aa"), Text.from("ab"));
    exam.compareGreaterThan(Text.from("ab"), Text.from("aa"));
    exam.compareLessThan(Text.from("ab"), Text.from("b"));
    exam.compareGreaterThan(Text.from("b"), Text.from("ab"));
    exam.compareEqual(Text.empty(), Text.empty());
    exam.compareEqual(Text.from("a"), Text.from("a"));
    exam.compareEqual(Text.from("ab"), Text.from("ab"));
  }

  @Test
  orderDataBySequentialByteOrder(exam: Exam): void {
    exam.compareLessThan(Data.empty(), Data.fromBase64("AA=="));
    exam.compareGreaterThan(Data.fromBase64("AA=="), Data.empty());
    exam.compareLessThan(Data.fromBase64("AA=="), Data.fromBase64("AAA="));
    exam.compareGreaterThan(Data.fromBase64("AAA="), Data.fromBase64("AA=="));
    exam.compareLessThan(Data.fromBase64("AAA="), Data.fromBase64("AAE="));
    exam.compareGreaterThan(Data.fromBase64("AAE="), Data.fromBase64("AAA="));
    exam.compareLessThan(Data.fromBase64("AAE="), Data.fromBase64("AQ=="));
    exam.compareGreaterThan(Data.fromBase64("AQ=="), Data.fromBase64("AAE="));
    exam.compareEqual(Data.empty(), Data.empty());
    exam.compareEqual(Data.fromBase64("AA=="), Data.fromBase64("AA=="));
    exam.compareEqual(Data.fromBase64("AAE="), Data.fromBase64("AAE="));
  }

  @Test
  orderNumsNumerically(exam: Exam): void {
    exam.compareLessThan(Num.from(0), Num.from(1));
    exam.compareGreaterThan(Num.from(1), Num.from(0));
    exam.compareLessThan(Num.from(0.5), Num.from(1.0));
    exam.compareGreaterThan(Num.from(1.0), Num.from(0.5));
    exam.compareLessThan(Num.from(-1), Num.from(1));
    exam.compareGreaterThan(Num.from(1), Num.from(-1));
    exam.compareEqual(Num.from(0), Num.from(0));
    exam.compareEqual(Num.from(1), Num.from(1));
    exam.compareEqual(Num.from(-1), Num.from(-1));
    exam.compareEqual(Num.from(0.5), Num.from(0.5));
  }

  @Test
  orderExtantTheSameAsItself(exam: Exam): void {
    exam.compareEqual(Value.extant(), Value.extant());
  }

  @Test
  orderAbsentTheSameAsItself(exam: Exam): void {
    exam.compareEqual(Value.absent(), Value.absent());
  }

  @Test
  relativeAttrOrder(exam: Exam): void {
    exam.compareLessThan(Attr.of("a", 1), Slot.of("a", 1));
    exam.compareLessThan(Attr.of("a", 1), Record.empty());
    exam.compareLessThan(Attr.of("a", 1), Data.empty());
    exam.compareLessThan(Attr.of("a", 1), Text.empty());
    exam.compareLessThan(Attr.of("a", 1), Num.from(0));
    exam.compareLessThan(Attr.of("a", 1), Bool.from(false));
    exam.compareLessThan(Attr.of("a", 1), Value.extant());
    exam.compareLessThan(Attr.of("a", 1), Value.absent());
  }

  @Test
  relativeSlotOrder(exam: Exam): void {
    exam.compareGreaterThan(Slot.of("a", 1), Attr.of("a", 1));
    exam.compareLessThan(Slot.of("a", 1), Record.empty());
    exam.compareLessThan(Slot.of("a", 1), Data.empty());
    exam.compareLessThan(Slot.of("a", 1), Text.empty());
    exam.compareLessThan(Slot.of("a", 1), Num.from(0));
    exam.compareLessThan(Slot.of("a", 1), Bool.from(false));
    exam.compareLessThan(Slot.of("a", 1), Value.extant());
    exam.compareLessThan(Slot.of("a", 1), Value.absent());
  }

  @Test
  relativeRecordOrder(exam: Exam): void {
    exam.compareGreaterThan(Record.empty(), Attr.of("a", 1));
    exam.compareGreaterThan(Record.empty(), Slot.of("a", 1));
    exam.compareLessThan(Record.empty(), Data.empty());
    exam.compareLessThan(Record.empty(), Text.empty());
    exam.compareLessThan(Record.empty(), Num.from(0));
    exam.compareLessThan(Record.empty(), Bool.from(false));
    exam.compareLessThan(Record.empty(), Value.extant());
    exam.compareLessThan(Record.empty(), Value.absent());
  }

  @Test
  relativeDataOrder(exam: Exam): void {
    exam.compareGreaterThan(Data.empty(), Attr.of("a", 1));
    exam.compareGreaterThan(Data.empty(), Slot.of("a", 1));
    exam.compareGreaterThan(Data.empty(), Record.empty());
    exam.compareLessThan(Data.empty(), Text.empty());
    exam.compareLessThan(Data.empty(), Num.from(0));
    exam.compareLessThan(Data.empty(), Bool.from(false));
    exam.compareLessThan(Data.empty(), Value.extant());
    exam.compareLessThan(Data.empty(), Value.absent());
  }

  @Test
  relativeTextOrder(exam: Exam): void {
    exam.compareGreaterThan(Text.empty(), Attr.of("a", 1));
    exam.compareGreaterThan(Text.empty(), Slot.of("a", 1));
    exam.compareGreaterThan(Text.empty(), Record.empty());
    exam.compareGreaterThan(Text.empty(), Data.empty());
    exam.compareLessThan(Text.empty(), Num.from(0));
    exam.compareLessThan(Text.empty(), Bool.from(false));
    exam.compareLessThan(Text.empty(), Value.extant());
    exam.compareLessThan(Text.empty(), Value.absent());
  }

  @Test
  relativeNumOrder(exam: Exam): void {
    exam.compareGreaterThan(Num.from(0), Attr.of("a", 1));
    exam.compareGreaterThan(Num.from(0), Slot.of("a", 1));
    exam.compareGreaterThan(Num.from(0), Record.empty());
    exam.compareGreaterThan(Num.from(0), Data.empty());
    exam.compareGreaterThan(Num.from(0), Text.empty());
    exam.compareLessThan(Num.from(0), Bool.from(false));
    exam.compareLessThan(Num.from(0), Value.extant());
    exam.compareLessThan(Num.from(0), Value.absent());
  }

  @Test
  relativeBoolOrder(exam: Exam): void {
    exam.compareGreaterThan(Bool.from(false), Attr.of("a", 1));
    exam.compareGreaterThan(Bool.from(false), Slot.of("a", 1));
    exam.compareGreaterThan(Bool.from(false), Record.empty());
    exam.compareGreaterThan(Bool.from(false), Data.empty());
    exam.compareGreaterThan(Bool.from(false), Text.empty());
    exam.compareGreaterThan(Bool.from(false), Num.from(0));
    exam.compareLessThan(Bool.from(false), Value.extant());
    exam.compareLessThan(Bool.from(false), Value.absent());
  }

  @Test
  relativeExtantOrder(exam: Exam): void {
    exam.compareGreaterThan(Value.extant(), Attr.of("a", 1));
    exam.compareGreaterThan(Value.extant(), Slot.of("a", 1));
    exam.compareGreaterThan(Value.extant(), Record.empty());
    exam.compareGreaterThan(Value.extant(), Data.empty());
    exam.compareGreaterThan(Value.extant(), Text.empty());
    exam.compareGreaterThan(Value.extant(), Num.from(0));
    exam.compareGreaterThan(Value.extant(), Bool.from(false));
    exam.compareLessThan(Value.extant(), Value.absent());
  }

  @Test
  relativeAbsentOrder(exam: Exam): void {
    exam.compareGreaterThan(Value.absent(), Attr.of("a", 1));
    exam.compareGreaterThan(Value.absent(), Slot.of("a", 1));
    exam.compareGreaterThan(Value.absent(), Record.empty());
    exam.compareGreaterThan(Value.absent(), Data.empty());
    exam.compareGreaterThan(Value.absent(), Text.empty());
    exam.compareGreaterThan(Value.absent(), Num.from(0));
    exam.compareGreaterThan(Value.absent(), Bool.from(false));
    exam.compareGreaterThan(Value.absent(), Value.extant());
  }
}
