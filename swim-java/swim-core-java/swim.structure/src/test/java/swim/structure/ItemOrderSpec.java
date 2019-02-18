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

package swim.structure;

import org.testng.annotations.Test;
import static org.testng.Assert.fail;

public class ItemOrderSpec {
  public static void assertOrderBefore(Item x, Item y) {
    final int order = x.compareTo(y);
    if (order >= 0) {
      fail(x + " did not order before " + y);
    }
  }

  public static void assertOrderAfter(Item x, Item y) {
    final int order = x.compareTo(y);
    if (order <= 0) {
      fail(x + " did not order after " + y);
    }
  }

  public static void assertOrderSame(Item x, Item y) {
    final int order = x.compareTo(y);
    if (order != 0) {
      fail(x + " did not order the same as " + y);
    }
  }

  @Test
  public void orderAttrsByKeyThenValue() {
    assertOrderBefore(Attr.of("a"), Attr.of("b"));
    assertOrderAfter(Attr.of("b"), Attr.of("a"));
    assertOrderBefore(Attr.of("a", 0), Attr.of("a", 1));
    assertOrderAfter(Attr.of("a", 1), Attr.of("a", 0));
    assertOrderSame(Attr.of("a"), Attr.of("a"));
    assertOrderSame(Attr.of("a", 0), Attr.of("a", 0));
  }

  @Test
  public void orderSlotsByKeyThenValue() {
    assertOrderBefore(Slot.of("a"), Slot.of("b"));
    assertOrderAfter(Slot.of("b"), Slot.of("a"));
    assertOrderBefore(Slot.of("a", 0), Slot.of("a", 1));
    assertOrderAfter(Slot.of("a", 1), Slot.of("a", 0));
    assertOrderSame(Slot.of("a"), Slot.of("a"));
    assertOrderSame(Slot.of("a", 0), Slot.of("a", 0));
  }

  @Test
  public void orderRecordsBySequentialItemOrder() {
    assertOrderBefore(Record.empty(), Record.of(1));
    assertOrderAfter(Record.of(1), Record.empty());
    assertOrderBefore(Record.of(1), Record.of(1, "a"));
    assertOrderAfter(Record.of(1, "a"), Record.of(1));
    assertOrderBefore(Record.of(1, "a"), Record.of(1, "b"));
    assertOrderAfter(Record.of(1, "b"), Record.of(1, "a"));
    assertOrderBefore(Record.of(0, "a"), Record.of(1));
    assertOrderAfter(Record.of(1), Record.of(0, "a"));
    assertOrderSame(Record.empty(), Record.empty());
    assertOrderSame(Record.of(1), Record.of(1));
    assertOrderSame(Record.of(1, "a"), Record.of(1, "a"));
  }

  @Test
  public void ordeTextBySequentialCodePointOrder() {
    assertOrderBefore(Text.empty(), Text.from("a"));
    assertOrderAfter(Text.from("a"), Text.empty());
    assertOrderBefore(Text.from("a"), Text.from("aa"));
    assertOrderAfter(Text.from("aa"), Text.from("a"));
    assertOrderBefore(Text.from("aa"), Text.from("ab"));
    assertOrderAfter(Text.from("ab"), Text.from("aa"));
    assertOrderBefore(Text.from("ab"), Text.from("b"));
    assertOrderAfter(Text.from("b"), Text.from("ab"));
    assertOrderSame(Text.empty(), Text.empty());
    assertOrderSame(Text.from("a"), Text.from("a"));
    assertOrderSame(Text.from("ab"), Text.from("ab"));
  }

  @Test
  public void orderDataBySequentialByteOrder() {
    assertOrderBefore(Data.empty(), Data.fromBase64("AA=="));
    assertOrderAfter(Data.fromBase64("AA=="), Data.empty());
    assertOrderBefore(Data.fromBase64("AA=="), Data.fromBase64("AAA="));
    assertOrderAfter(Data.fromBase64("AAA="), Data.fromBase64("AA=="));
    assertOrderBefore(Data.fromBase64("AAA="), Data.fromBase64("AAE="));
    assertOrderAfter(Data.fromBase64("AAE="), Data.fromBase64("AAA="));
    assertOrderBefore(Data.fromBase64("AAE="), Data.fromBase64("AQ=="));
    assertOrderAfter(Data.fromBase64("AQ=="), Data.fromBase64("AAE="));
    assertOrderSame(Data.empty(), Data.empty());
    assertOrderSame(Data.fromBase64("AA=="), Data.fromBase64("AA=="));
    assertOrderSame(Data.fromBase64("AAE="), Data.fromBase64("AAE="));
  }

  @Test
  public void orderNumsNumerically() {
    assertOrderBefore(Num.from(0), Num.from(1));
    assertOrderAfter(Num.from(1), Num.from(0));
    assertOrderBefore(Num.from(0.5), Num.from(1.0));
    assertOrderAfter(Num.from(1.0), Num.from(0.5));
    assertOrderBefore(Num.from(-1), Num.from(1));
    assertOrderAfter(Num.from(1), Num.from(-1));
    assertOrderSame(Num.from(0), Num.from(0));
    assertOrderSame(Num.from(1), Num.from(1));
    assertOrderSame(Num.from(-1), Num.from(-1));
    assertOrderSame(Num.from(0.5), Num.from(0.5));
  }

  @Test
  public void orderExtantTheSameAsItself() {
    assertOrderSame(Value.extant(), Value.extant());
  }

  @Test
  public void orderAbsentTheSameAsItself() {
    assertOrderSame(Value.absent(), Value.absent());
  }

  @Test
  public void relativeAttrOrder() {
    assertOrderBefore(Attr.of("a", 1), Slot.of("a", 1));
    assertOrderBefore(Attr.of("a", 1), Record.empty());
    assertOrderBefore(Attr.of("a", 1), Data.empty());
    assertOrderBefore(Attr.of("a", 1), Text.empty());
    assertOrderBefore(Attr.of("a", 1), Num.from(0));
    assertOrderBefore(Attr.of("a", 1), Bool.from(false));
    assertOrderBefore(Attr.of("a", 1), Value.extant());
    assertOrderBefore(Attr.of("a", 1), Value.absent());
  }

  @Test
  public void relativeSlotOrder() {
    assertOrderAfter(Slot.of("a", 1), Attr.of("a", 1));
    assertOrderBefore(Slot.of("a", 1), Record.empty());
    assertOrderBefore(Slot.of("a", 1), Data.empty());
    assertOrderBefore(Slot.of("a", 1), Text.empty());
    assertOrderBefore(Slot.of("a", 1), Num.from(0));
    assertOrderBefore(Slot.of("a", 1), Bool.from(false));
    assertOrderBefore(Slot.of("a", 1), Value.extant());
    assertOrderBefore(Slot.of("a", 1), Value.absent());
  }

  @Test
  public void relativeRecordOrder() {
    assertOrderAfter(Record.empty(), Attr.of("a", 1));
    assertOrderAfter(Record.empty(), Slot.of("a", 1));
    assertOrderBefore(Record.empty(), Data.empty());
    assertOrderBefore(Record.empty(), Text.empty());
    assertOrderBefore(Record.empty(), Num.from(0));
    assertOrderBefore(Record.empty(), Bool.from(false));
    assertOrderBefore(Record.empty(), Value.extant());
    assertOrderBefore(Record.empty(), Value.absent());
  }

  @Test
  public void relativeDataOrder() {
    assertOrderAfter(Data.empty(), Attr.of("a", 1));
    assertOrderAfter(Data.empty(), Slot.of("a", 1));
    assertOrderAfter(Data.empty(), Record.empty());
    assertOrderBefore(Data.empty(), Text.empty());
    assertOrderBefore(Data.empty(), Num.from(0));
    assertOrderBefore(Data.empty(), Bool.from(false));
    assertOrderBefore(Data.empty(), Value.extant());
    assertOrderBefore(Data.empty(), Value.absent());
  }

  @Test
  public void relativeTextOrder() {
    assertOrderAfter(Text.empty(), Attr.of("a", 1));
    assertOrderAfter(Text.empty(), Slot.of("a", 1));
    assertOrderAfter(Text.empty(), Record.empty());
    assertOrderAfter(Text.empty(), Data.empty());
    assertOrderBefore(Text.empty(), Num.from(0));
    assertOrderBefore(Text.empty(), Bool.from(false));
    assertOrderBefore(Text.empty(), Value.extant());
    assertOrderBefore(Text.empty(), Value.absent());
  }

  @Test
  public void relativeNumOrder() {
    assertOrderAfter(Num.from(0), Attr.of("a", 1));
    assertOrderAfter(Num.from(0), Slot.of("a", 1));
    assertOrderAfter(Num.from(0), Record.empty());
    assertOrderAfter(Num.from(0), Data.empty());
    assertOrderAfter(Num.from(0), Text.empty());
    assertOrderBefore(Num.from(0), Bool.from(false));
    assertOrderBefore(Num.from(0), Value.extant());
    assertOrderBefore(Num.from(0), Value.absent());
  }

  @Test
  public void relativeBoolOrder() {
    assertOrderAfter(Bool.from(false), Attr.of("a", 1));
    assertOrderAfter(Bool.from(false), Slot.of("a", 1));
    assertOrderAfter(Bool.from(false), Record.empty());
    assertOrderAfter(Bool.from(false), Data.empty());
    assertOrderAfter(Bool.from(false), Text.empty());
    assertOrderAfter(Bool.from(false), Num.from(0));
    assertOrderBefore(Bool.from(false), Value.extant());
    assertOrderBefore(Bool.from(false), Value.absent());
  }

  @Test
  public void relativeExtantOrder() {
    assertOrderAfter(Value.extant(), Attr.of("a", 1));
    assertOrderAfter(Value.extant(), Slot.of("a", 1));
    assertOrderAfter(Value.extant(), Record.empty());
    assertOrderAfter(Value.extant(), Data.empty());
    assertOrderAfter(Value.extant(), Text.empty());
    assertOrderAfter(Value.extant(), Bool.from(false));
    assertOrderAfter(Value.extant(), Num.from(0));
    assertOrderBefore(Value.extant(), Value.absent());
  }

  @Test
  public void relativeAbsentOrder() {
    assertOrderAfter(Value.absent(), Attr.of("a", 1));
    assertOrderAfter(Value.absent(), Slot.of("a", 1));
    assertOrderAfter(Value.absent(), Record.empty());
    assertOrderAfter(Value.absent(), Data.empty());
    assertOrderAfter(Value.absent(), Text.empty());
    assertOrderAfter(Value.absent(), Bool.from(false));
    assertOrderAfter(Value.absent(), Num.from(0));
    assertOrderAfter(Value.absent(), Value.extant());
  }
}
