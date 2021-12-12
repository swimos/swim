// Copyright 2015-2021 Swim.inc
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
import {Attr, Slot, Value, Record, Text, Num} from "@swim/structure";
import {RecordMapMutableSpec} from "./RecordMapMutableSpec";
import {RecordMapImmutableSpec} from "./RecordMapImmutableSpec";

export class RecordMapSpec extends Spec {
  @Unit
  mutableSpec(): Spec {
    return new RecordMapMutableSpec();
  }

  @Unit
  immutableSpec(): Spec {
    return new RecordMapImmutableSpec();
  }

  @Test
  testEmpty(exam: Exam): void {
    exam.true(Record.empty().isEmpty());
  }

  @Test
  testOf(exam: Exam): void {
    const xs = Record.of("a", "b", "c");
    exam.false(xs.isEmpty());
    exam.equal(xs.length, 3);
    exam.equal(xs.getItem(0), Text.from("a"));
    exam.equal(xs.getItem(1), Text.from("b"));
    exam.equal(xs.getItem(2), Text.from("c"));
  }

  @Test
  testBuildItems(exam: Exam): void {
    const xs = Record.of().item("a").item(3);
    exam.false(xs.isEmpty());
    exam.equal(xs.length, 2);
    exam.equal(xs.getItem(0), Text.from("a"));
    exam.equal(xs.getItem(1), Num.from(3));
  }

  @Test
  testBuildAttrs(exam: Exam): void {
    const xs = Record.of().attr("k", "v").attr("a", 3);
    exam.false(xs.isEmpty());
    exam.equal(xs.length, 2);
    exam.equal(xs.fieldCount, 2);
    exam.equal(xs.getItem(0), Attr.of("k", "v"));
    exam.equal(xs.getItem(1), Attr.of("a", 3));
  }

  @Test
  testBuildSlots(exam: Exam): void {
    const xs = Record.of().slot("k", "v").slot("a", 3).slot(4, 5);
    exam.false(xs.isEmpty());
    exam.equal(xs.length, 3);
    exam.equal(xs.fieldCount, 3);
    exam.equal(xs.getItem(0), Slot.of("k", "v"));
    exam.equal(xs.getItem(1), Slot.of("a", 3));
    exam.equal(xs.getItem(2), Slot.of(4, 5));
  }

  @Test
  testTail(exam: Exam): void {
    exam.equal(Record.empty().tail(), Record.empty());
    exam.equal(Record.of("a").tail(), Record.empty());
    exam.equal(Record.of("a", "b").tail(), Record.of("b"));
    exam.equal(Record.of("a", "b", "c").tail(), Record.of("b", "c"));
  }

  @Test
  testBody(exam: Exam): void {
    exam.equal(Record.empty().body(), Value.absent());
    exam.equal(Record.of("a").body(), Value.absent());
    exam.equal(Record.of("a", "b").body(), Text.from("b"));
    exam.equal(Record.of("a").attr("b").body(), Record.of().attr("b"));
    exam.equal(Record.of("a", "b", "c").body(), Record.of("b", "c"));
  }

  @Test
  testHas(exam: Exam): void {
    exam.true(Record.of().attr("k", "v").has("k"));
    exam.true(Record.of().attr("k", "v").attr("a", "b").has("a"));
    exam.false(Record.empty().has("k"));
    exam.false(Record.of().attr("k", "v").has("a"));
    exam.false(Record.of().attr("k", "v").attr("a", "b").has("b"));
    exam.true(Record.of().attr("item", "Juice").attr("$$hashKey").has("item"));

    exam.true(Record.of().slot("k", "v").has("k"));
    exam.true(Record.of().slot("k", "v").slot("a", "b").has("a"));
    exam.true(Record.of().slot("k", "v").slot(4, 5).has(4));
    exam.false(Record.empty().has("k"));
    exam.false(Record.of().slot("k", "v").has("a"));
    exam.false(Record.of().slot("k", "v").slot("a", "b").has("b"));
    exam.true(Record.of().slot("item", "Juice").slot("$$hashKey").has("item"));
  }

  @Test
  testIndexOf(exam: Exam): void {
    const xs = Record.of("a", "b", "b", "c");
    exam.equal(xs.indexOf("a"), 0);
    exam.equal(xs.indexOf("b"), 1);
    exam.equal(xs.indexOf("c"), 3);
    exam.equal(xs.indexOf("d"), -1);
  }

  @Test
  testLastIndexOf(exam: Exam): void {
    const xs = Record.of("a", "b", "b", "c");
    exam.equal(xs.lastIndexOf("c"), 3);
    exam.equal(xs.lastIndexOf("b"), 2);
    exam.equal(xs.lastIndexOf("a"), 0);
    exam.equal(xs.lastIndexOf("d"), -1);
  }

  @Test
  testGet(exam: Exam): void {
    exam.equal(Record.of().slot("k", "v").get("k"), Text.from("v"));
    exam.equal(Record.of().slot("k", "v").slot("a", "b").get("a"), Text.from("b"));
    exam.equal(Record.of().slot("k", "v").slot(4, 5).get(4), Num.from(5));
    exam.equal(Record.of().slot("a", "b").slot("a", "c").get("a"), Text.from("c"));
    exam.equal(Record.empty().get("k"), Value.absent());
    exam.equal(Record.of().slot("k", "v").get("a"), Value.absent());
    exam.equal(Record.of().slot("k", "v").slot("a", "b").get("b"), Value.absent());
    exam.equal(Record.of().slot("item", "Juice").slot("$$hashKey", "hashValue").get("$$hashKey"), Text.from("hashValue"));
  }

  @Test
  testGetAttr(exam: Exam): void {
    exam.equal(Record.of().attr("k", "v").getAttr("k"), Text.from("v"));
    exam.equal(Record.of().slot("k", "v").getAttr("k"), Value.absent());
    exam.equal(Record.of().slot("k", "v").attr("a", "b").getAttr("a"), Text.from("b"));
    exam.equal(Record.of().attr("k", "v").slot("a", "b").getAttr("a"), Value.absent());
    exam.equal(Record.of().attr("a", "b").attr("a", "c").getAttr("a"), Text.from("c"));
    exam.equal(Record.of().attr("a", "b").slot("a", "c").getAttr("a"), Value.absent());
    exam.equal(Record.empty().getAttr("k"), Value.absent());
    exam.equal(Record.of().slot("k", "v").getAttr("a"), Value.absent());
    exam.equal(Record.of().slot("k", "v").slot("a", "b").getAttr("b"), Value.absent());
  }

  @Test
  testGetSlot(exam: Exam): void {
    exam.equal(Record.of().attr("k", "v").getSlot("k"), Value.absent());
    exam.equal(Record.of().slot("k", "v").getSlot("k"), Text.from("v"));
    exam.equal(Record.of().attr("k", "v").slot("a", "b").getSlot("a"), Text.from("b"));
    exam.equal(Record.of().slot("k", "v").attr("a", "b").getSlot("a"), Value.absent());
    exam.equal(Record.of().slot("a", "b").slot("a", "c").getSlot("a"), Text.from("c"));
    exam.equal(Record.of().slot("a", "b").attr("a", "c").getSlot("a"), Value.absent());
    exam.equal(Record.empty().getSlot("k"), Value.absent());
    exam.equal(Record.of().slot("k", "v").getSlot("a"), Value.absent());
    exam.equal(Record.of().attr("k", "v").attr("a", "b").getSlot("b"), Value.absent());
  }

  @Test
  testGetField(exam: Exam): void {
    exam.equal(Record.of().attr("k", "v").getField("k"), Attr.of("k", "v"));
    exam.equal(Record.of().slot("k", "v").getField("k"), Slot.of("k", "v"));
    exam.equal(Record.of().slot("k", "v").attr("a", "b").getField("a"), Attr.of("a", "b"));
    exam.equal(Record.of().slot("k", "v").slot("a", "b").getField("a"), Slot.of("a", "b"));
    exam.equal(Record.of().slot("a", "b").slot("a", "c").getField("a"), Slot.of("a", "c"));
    exam.equal(Record.of().attr("a", "b").attr("a", "c").getField("a"), Attr.of("a", "c"));
    exam.equal(Record.of().attr("a", "b").slot("a", "c").getField("a"), Slot.of("a", "c"));
    exam.equal(Record.of().slot("a", "b").attr("a", "c").getField("a"), Attr.of("a", "c"));
    exam.equal(Record.empty().getField("k"), void 0);
    exam.equal(Record.of().slot("k", "v").getField("a"), void 0);
    exam.equal(Record.of().slot("k", "v").slot("a", "b").getField("b"), void 0);
  }

  @Test
  testGetItem(exam: Exam): void {
    const xs = Record.of("a", "b", "c");
    exam.equal(xs.getItem(0), Text.from("a"));
    exam.equal(xs.getItem(1), Text.from("b"));
    exam.equal(xs.getItem(2), Text.from("c"));
  }

  @Test
  testGetItemOutOfBounds(exam: Exam): void {
    const xs = Record.of("a", "b", "c");
    exam.equal(xs.getItem(-1), Text.from("c"));
    exam.equal(xs.getItem(3), Value.absent());
  }

  @Test
  testIterator(exam: Exam): void {
    const iter = Record.of("a", "b", "c").iterator();
    exam.true(iter.hasNext());
    exam.equal(iter.next().value!, Text.from("a"));
    exam.true(iter.hasNext());
    exam.equal(iter.next().value!, Text.from("b"));
    exam.true(iter.hasNext());
    exam.equal(iter.next().value!, Text.from("c"));
    exam.false(iter.hasNext());
  }

  @Test
  testCompose(exam: Exam): void {
    for (let k = 4; k <= 20; k += 4) {
      const n = 1 << k;
      this.testComposeRecord(exam, n);
    }
  }
  private testComposeRecord(exam: Exam, n: number): void {
    exam.comment("Composing Record with " + n + " slots ...");
    const xs = Record.create();
    for (let i = 1; i <= n; i += 1) {
      xs.slot(Num.from(-i), i);
    }
    exam.false(xs.isEmpty());
    exam.equal(xs.length, n);

    const iter = xs.iterator();
    let sum = 0;
    while (iter.hasNext()) {
      const slot = iter.next().value! as Slot;
      if (-slot.key.numberValue()! !== slot.value.numberValue()) {
        exam.equal(-slot.key.numberValue()!, slot.value.numberValue());
      }
      sum += slot.value.numberValue()!;
    }
    if (sum !== n * (n + 1) / 2) {
      exam.equal(sum, n * (n + 1) / 2, "sum of first " + n + " integers");
    }

    for (let i = 1; i <= n; i += 1) {
      if (xs.get(-i).numberValue() !== i) {
        exam.equal(xs.get(-i).numberValue(), i);
      }
    }
  }

  @Test
  testDecompose(exam: Exam): void {
    for (let n = 4; n <= 4096; n *= 2) {
      this.testDecomposeRecord(exam, n);
    }
  }
  private testDecomposeRecord(exam: Exam, n: number): void {
    exam.comment("Decomposing Record with " + n + " slots ...");
    const xs = Record.create();
    for (let i = 1; i <= n; i += 1) {
      xs.slot(-i, i);
    }

    for (let i = n; i > 0; i -= 1) {
      const iter = xs.iterator();
      let sum = 0;
      while (iter.hasNext()) {
        const slot = iter.next().value! as Slot;
        if (-slot.key.numberValue()! !== slot.value.numberValue()) {
          exam.equal(-slot.key.numberValue()!, slot.value.numberValue());
        }
        sum += slot.value.numberValue()!;
      }
      if (sum !== i * (i + 1) / 2) {
        exam.equal(sum, i * (i + 1) / 2, "sum of first " + i + " of " + n + " integers");
      }

      for (let j = 1; j <= i; j += 1) {
        if (xs.get(-j).numberValue() !== j) {
          exam.equal(xs.get(-j).numberValue(), j);
        }
      }

      xs.delete(-i);
    }
  }

  @Test
  testCollisions(exam: Exam): void {
    const n = 4096;
    const xs = Record.create();
    for (let i = 1; i <= n; i += 1) {
      const key = ((i & 0x1) === 0 ? +1 : -1) * (i >> 1);
      xs.slot(key, i);
    }
    exam.false(xs.isEmpty());
    exam.equal(xs.length, n);
    exam.equal(xs.fieldCount, n);

    for (let i = 1; i <= n; i += 1) {
      const key = ((i & 0x1) === 0 ? +1 : -1) * (i >> 1);
      if (xs.get(key).numberValue() !== i) {
        exam.equal(xs.get(key).numberValue(), i);
      }
    }
  }
}
