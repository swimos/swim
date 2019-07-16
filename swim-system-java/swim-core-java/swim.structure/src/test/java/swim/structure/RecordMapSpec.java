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

import java.util.Iterator;
import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNull;
import static org.testng.Assert.assertTrue;

public class RecordMapSpec {
  @Test
  public void testEmpty() {
    assertTrue(Record.empty().isEmpty());
  }

  @Test
  public void testOf() {
    final Record xs = Record.of("a", "b", "c");
    assertFalse(xs.isEmpty());
    assertEquals(xs.size(), 3);
    assertEquals(xs.getItem(0), Text.from("a"));
    assertEquals(xs.getItem(1), Text.from("b"));
    assertEquals(xs.getItem(2), Text.from("c"));
  }

  @Test
  public void testBuildItems() {
    final Record xs = Record.of().item("a").item(3);
    assertFalse(xs.isEmpty());
    assertEquals(xs.size(), 2);
    assertEquals(xs.getItem(0), Text.from("a"));
    assertEquals(xs.getItem(1), Num.from(3));
  }

  @Test
  public void testBuildAttrs() {
    final Record xs = Record.of().attr("k", "v").attr("a", 3);
    assertFalse(xs.isEmpty());
    assertEquals(xs.size(), 2);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(xs.getItem(0), Attr.of("k", "v"));
    assertEquals(xs.getItem(1), Attr.of("a", 3));
  }

  @Test
  public void testBuildSlots() {
    final Record xs = Record.of().slot("k", "v").slot("a", 3).slot(Num.from(4), 5);
    assertFalse(xs.isEmpty());
    assertEquals(xs.size(), 3);
    assertEquals(xs.fieldCount(), 3);
    assertEquals(xs.getItem(0), Slot.of("k", "v"));
    assertEquals(xs.getItem(1), Slot.of("a", 3));
    assertEquals(xs.getItem(2), Slot.of(Num.from(4), 5));
  }

  @Test
  public void testTail() {
    assertEquals(Record.empty().tail(), Record.empty());
    assertEquals(Record.of("a").tail(), Record.empty());
    assertEquals(Record.of("a", "b").tail(), Record.of("b"));
    assertEquals(Record.of("a", "b", "c").tail(), Record.of("b", "c"));
  }

  @Test
  public void testBody() {
    assertEquals(Record.empty().body(), Value.absent());
    assertEquals(Record.of("a").body(), Value.absent());
    assertEquals(Record.of("a", "b").body(), Text.from("b"));
    assertEquals(Record.of("a").attr("b").body(), Record.of().attr("b"));
    assertEquals(Record.of("a", "b", "c").body(), Record.of("b", "c"));
  }

  @Test
  public void testContains() {
    assertTrue(Record.of("a").contains("a"));
    assertFalse(Record.of("a").contains("b"));
    assertFalse(Record.empty().contains("a"));
    assertTrue(Record.of().attr("k", "v").contains(Attr.of("k", "v")));
    assertTrue(Record.of().attr("k", "v").slot("a", "b").contains(Slot.of("a", "b")));
    assertFalse(Record.of().attr("k", "v").contains(Attr.of("k", "z")));
    assertTrue(Record.of().slot("item", "Juice").slot("$$hashKey", "hashValue").contains(Slot.of("$$hashKey", "hashValue")));
  }

  @Test
  public void testContainsAll() {
    assertTrue(Record.of("a", "b", "c").containsAll(Record.empty()));
    assertTrue(Record.of("a", "b", "c").containsAll(Record.of("b")));
    assertTrue(Record.of("a", "b", "c").containsAll(Record.of("a", "b")));
    assertTrue(Record.of("a", "b", "c").containsAll(Record.of("a", "c")));
    assertTrue(Record.of("a", "b", "c").containsAll(Record.of("b", "c")));
    assertFalse(Record.of("a").containsAll(Record.of("b")));
    assertFalse(Record.of("a").containsAll(Record.of("b", "c")));
    assertFalse(Record.empty().containsAll(Record.of("a")));
    assertFalse(Record.empty().containsAll(Record.of("a", "b")));
  }

  @Test
  public void testContainsKey() {
    assertTrue(Record.of().attr("k", "v").containsKey("k"));
    assertTrue(Record.of().attr("k", "v").attr("a", "b").containsKey("a"));
    assertFalse(Record.empty().containsKey("k"));
    assertFalse(Record.of().attr("k", "v").containsKey("a"));
    assertFalse(Record.of().attr("k", "v").attr("a", "b").containsKey("b"));
    assertTrue(Record.of().attr("item", "Juice").attr("$$hashKey").containsKey("item"));

    assertTrue(Record.of().slot("k", "v").containsKey("k"));
    assertTrue(Record.of().slot("k", "v").slot("a", "b").containsKey("a"));
    assertTrue(Record.of().slot("k", "v").slot(Num.from(4), 5).containsKey(Num.from(4)));
    assertFalse(Record.empty().containsKey("k"));
    assertFalse(Record.of().slot("k", "v").containsKey("a"));
    assertFalse(Record.of().slot("k", "v").slot("a", "b").containsKey("b"));
    assertTrue(Record.of().slot("item", "Juice").slot("$$hashKey").containsKey("item"));
  }

  @Test
  public void testContainsValue() {
    assertTrue(Record.of().slot("k", "v").containsValue(Text.from("v")));
    assertTrue(Record.of().slot("k", "v").slot("a", "b").containsValue(Text.from("b")));
    assertTrue(Record.of().slot("k", "v").slot(Num.from(4), 5).containsValue(Num.from(5)));
    assertFalse(Record.empty().containsValue(Text.from("v")));
    assertFalse(Record.of().slot("k", "v").containsValue(Text.from("b")));
    assertFalse(Record.of().slot("k", "v").slot("a", "b").containsValue(Text.from("a")));
    assertTrue(Record.of().slot("item", "Juice").slot("$$hashKey", "hashValue").containsValue(Text.from("hashValue")));
  }

  @Test
  public void testIndexOf() {
    final Record xs = Record.of("a", "b", "b", "c");
    assertEquals(xs.indexOf("a"), 0);
    assertEquals(xs.indexOf("b"), 1);
    assertEquals(xs.indexOf("c"), 3);
    assertEquals(xs.indexOf("d"), -1);
  }

  @Test
  public void testLastIndexOf() {
    final Record xs = Record.of("a", "b", "b", "c");
    assertEquals(xs.lastIndexOf("c"), 3);
    assertEquals(xs.lastIndexOf("b"), 2);
    assertEquals(xs.lastIndexOf("a"), 0);
    assertEquals(xs.lastIndexOf("d"), -1);
  }

  @Test
  public void testGet() {
    assertEquals(Record.of().slot("k", "v").get("k"), Text.from("v"));
    assertEquals(Record.of().slot("k", "v").slot("a", "b").get("a"), Text.from("b"));
    assertEquals(Record.of().slot("k", "v").slot(Num.from(4), 5).get(Num.from(4)), Num.from(5));
    assertEquals(Record.of().slot("a", "b").slot("a", "c").get("a"), Text.from("c"));
    assertEquals(Record.empty().get("k"), Value.absent());
    assertEquals(Record.of().slot("k", "v").get("a"), Value.absent());
    assertEquals(Record.of().slot("k", "v").slot("a", "b").get("b"), Value.absent());
    assertEquals(Record.of().slot("item", "Juice").slot("$$hashKey", "hashValue").get("$$hashKey"), Text.from("hashValue"));
  }

  @Test
  public void testGetAttr() {
    assertEquals(Record.of().attr("k", "v").getAttr("k"), Text.from("v"));
    assertEquals(Record.of().slot("k", "v").getAttr("k"), Value.absent());
    assertEquals(Record.of().slot("k", "v").attr("a", "b").getAttr("a"), Text.from("b"));
    assertEquals(Record.of().attr("k", "v").slot("a", "b").getAttr("a"), Value.absent());
    assertEquals(Record.of().attr("a", "b").attr("a", "c").getAttr("a"), Text.from("c"));
    assertEquals(Record.of().attr("a", "b").slot("a", "c").getAttr("a"), Value.absent());
    assertEquals(Record.empty().getAttr("k"), Value.absent());
    assertEquals(Record.of().slot("k", "v").getAttr("a"), Value.absent());
    assertEquals(Record.of().slot("k", "v").slot("a", "b").getAttr("b"), Value.absent());
  }

  @Test
  public void testGetSlot() {
    assertEquals(Record.of().attr("k", "v").getSlot("k"), Value.absent());
    assertEquals(Record.of().slot("k", "v").getSlot("k"), Text.from("v"));
    assertEquals(Record.of().attr("k", "v").slot("a", "b").getSlot("a"), Text.from("b"));
    assertEquals(Record.of().slot("k", "v").attr("a", "b").getSlot("a"), Value.absent());
    assertEquals(Record.of().slot("a", "b").slot("a", "c").getSlot("a"), Text.from("c"));
    assertEquals(Record.of().slot("a", "b").attr("a", "c").getSlot("a"), Value.absent());
    assertEquals(Record.empty().getSlot("k"), Value.absent());
    assertEquals(Record.of().slot("k", "v").getSlot("a"), Value.absent());
    assertEquals(Record.of().attr("k", "v").attr("a", "b").getSlot("b"), Value.absent());
  }

  @Test
  public void testGetField() {
    assertEquals(Record.of().attr("k", "v").getField("k"), Attr.of("k", "v"));
    assertEquals(Record.of().slot("k", "v").getField("k"), Slot.of("k", "v"));
    assertEquals(Record.of().slot("k", "v").attr("a", "b").getField("a"), Attr.of("a", "b"));
    assertEquals(Record.of().slot("k", "v").slot("a", "b").getField("a"), Slot.of("a", "b"));
    assertEquals(Record.of().slot("a", "b").slot("a", "c").getField("a"), Slot.of("a", "c"));
    assertEquals(Record.of().attr("a", "b").attr("a", "c").getField("a"), Attr.of("a", "c"));
    assertEquals(Record.of().attr("a", "b").slot("a", "c").getField("a"), Slot.of("a", "c"));
    assertEquals(Record.of().slot("a", "b").attr("a", "c").getField("a"), Attr.of("a", "c"));
    assertEquals(Record.empty().getField("k"), null);
    assertEquals(Record.of().slot("k", "v").getField("a"), null);
    assertEquals(Record.of().slot("k", "v").slot("a", "b").getField("b"), null);
  }

  @Test
  public void testGetItem() {
    final Record xs = Record.of("a", "b", "c");
    assertEquals(xs.getItem(0), Text.from("a"));
    assertEquals(xs.getItem(1), Text.from("b"));
    assertEquals(xs.getItem(2), Text.from("c"));
  }

  @Test
  public void testViewGetItemOutOfBounds() {
    final Record xs = Record.of("a", "b", "c");
    assertEquals(xs.getItem(-1), Value.absent());
    assertEquals(xs.getItem(3), Value.absent());
  }

  @Test(expectedExceptions = IndexOutOfBoundsException.class)
  public void testGetUnderflow() {
    Record.of("a", "b", "c").get(-1);
  }

  @Test(expectedExceptions = IndexOutOfBoundsException.class)
  public void testGetOverflow() {
    Record.of("a", "b", "c").get(3);
  }

  @Test
  public void testToArray() {
    final Record xs = Record.of("a", "b", "c");
    final Object[] array = xs.toArray();
    assertEquals(array.length, 3);
    assertEquals(array[0], Text.from("a"));
    assertEquals(array[1], Text.from("b"));
    assertEquals(array[2], Text.from("c"));
  }

  @Test
  public void testToTypedArray() {
    final Record xs = Record.of("a", "b", "c");
    final Text[] array = {Text.from("w"), Text.from("x"), Text.from("y"), Text.from("z")};
    xs.toArray(array);
    assertEquals(array[0], Text.from("a"));
    assertEquals(array[1], Text.from("b"));
    assertEquals(array[2], Text.from("c"));
    assertNull(array[3]);
  }

  @Test
  public void testIterator() {
    final Iterator<Item> iter = Record.of("a", "b", "c").iterator();
    assertTrue(iter.hasNext());
    assertEquals(iter.next(), Text.from("a"));
    assertTrue(iter.hasNext());
    assertEquals(iter.next(), Text.from("b"));
    assertTrue(iter.hasNext());
    assertEquals(iter.next(), Text.from("c"));
    assertFalse(iter.hasNext());
  }

  @Test
  public void testCompose() {
    for (int k = 4; k <= 20; k += 4) {
      final int n = 1 << k;
      testComposeRecord(n);
    }
  }

  private void testComposeRecord(int n) {
    System.out.println("Composing Record with " + n + " slots ...");
    final Record xs = Record.create();
    for (int i = 1; i <= n; i += 1) {
      xs.slot(Num.from(-i), i);
    }
    assertFalse(xs.isEmpty());
    assertEquals(xs.size(), n);

    final Iterator<Item> iter = xs.iterator();
    long sum = 0L;
    while (iter.hasNext()) {
      final Slot slot = (Slot) iter.next();
      assertEquals(-slot.getKey().intValue(), slot.getValue().intValue());
      sum += slot.getValue().longValue();
    }
    assertEquals(sum, ((long) n * ((long) n + 1L) / 2L), "sum of first " + n + " integers");

    for (int i = 1; i <= n; i += 1) {
      assertEquals(xs.get(Num.from(-i)).intValue(), i);
    }
  }

  @Test
  public void testDecompose() {
    for (int n = 4; n <= 4096; n *= 2) {
      testDecomposeRecord(n);
    }
  }

  private void testDecomposeRecord(int n) {
    System.out.println("Decomposing Record with " + n + " slots ...");
    final Record xs = Record.create();
    for (int i = 1; i <= n; i += 1) {
      xs.slot(Num.from(-i), i);
    }

    for (int i = n; i > 0; i -= 1) {
      final Iterator<Item> iter = xs.iterator();
      long sum = 0L;
      while (iter.hasNext()) {
        final Slot slot = (Slot) iter.next();
        assertEquals(-slot.getKey().intValue(), slot.getValue().intValue());
        sum += slot.getValue().longValue();
      }
      final long expected = ((long) i * ((long) i + 1L) / 2L);
      assertEquals(sum, expected, "sum of first " + i + " of " + n + " integers");

      for (int j = 1; j <= i; j += 1) {
        assertEquals(xs.get(Num.from(-j)).intValue(), j);
      }

      xs.removeKey(Num.from(-i));
    }
  }

  @Test
  public void testCollisions() {
    final int n = 4096;
    final Record xs = Record.create();
    for (int i = 1; i <= n; i += 1) {
      final int key = ((i & 0x1) == 0 ? +1 : -1) * (i >> 1);
      xs.slot(Num.from(key), i);
    }
    assertFalse(xs.isEmpty());
    assertEquals(xs.size(), n);
    assertEquals(xs.fieldCount(), n);

    for (int i = 1; i <= n; i += 1) {
      final int key = ((i & 0x1) == 0 ? +1 : -1) * (i >> 1);
      assertEquals(xs.get(Num.from(key)).intValue(), i);
    }
  }
}
