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

public class RecordMapViewSpec {
  @Test
  public void testViewIsEmpty() {
    assertTrue(Record.of("a", "b", "c").subList(1, 1).isEmpty());
    assertFalse(Record.of("a", "b", "c").subList(1, 2).isEmpty());
  }

  @Test
  public void testViewSize() {
    assertEquals(Record.of("a", "b", "c").subList(1, 1).size(), 0);
    assertEquals(Record.of("a", "b", "c").subList(1, 2).size(), 1);
  }

  @Test
  public void testViewTail() {
    assertEquals(Record.of("a").subList(1, 1).tail(), Record.empty());
    assertEquals(Record.of("a", "b").subList(1, 2).tail(), Record.empty());
    assertEquals(Record.of("a", "b", "c").subList(1, 3).tail(), Record.of("c"));
    assertEquals(Record.of("a", "b", "c", "d").subList(1, 4).tail(), Record.of("c", "d"));
  }

  @Test
  public void testViewBody() {
    assertEquals(Record.of("a").subList(1, 1).body(), Value.absent());
    assertEquals(Record.of("a", "b").subList(1, 2).body(), Value.absent());
    assertEquals(Record.of("a", "b", "c").subList(1, 3).body(), Text.from("c"));
    assertEquals(Record.of("a", "b").attr("c").subList(1, 3).body(), Record.of().attr("c"));
    assertEquals(Record.of("a", "b", "c", "d").subList(1, 4).body(), Record.of("c", "d"));
  }

  @Test
  public void testViewContains() {
    assertTrue(Record.of("a", "b", "c").subList(1, 2).contains("b"));
    assertFalse(Record.of("a", "b", "c").subList(1, 2).contains("c"));
    assertFalse(Record.of("a", "b", "c").subList(1, 1).contains("b"));
  }

  @Test
  public void testViewContainsAll() {
    assertTrue(Record.of("a", "b", "c", "d", "e").subList(1, 4).containsAll(Record.empty()));
    assertTrue(Record.of("a", "b", "c", "d", "e").subList(1, 4).containsAll(Record.of("c")));
    assertTrue(Record.of("a", "b", "c", "d", "e").subList(1, 4).containsAll(Record.of("b", "c")));
    assertTrue(Record.of("a", "b", "c", "d", "e").subList(1, 4).containsAll(Record.of("b", "d")));
    assertTrue(Record.of("a", "b", "c", "d", "e").subList(1, 4).containsAll(Record.of("c", "d")));
    assertFalse(Record.of("a", "b", "c").subList(1, 2).containsAll(Record.of("c")));
    assertFalse(Record.of("a", "b", "c").subList(1, 2).containsAll(Record.of("b", "c")));
    assertFalse(Record.of("a", "b", "c").subList(1, 1).containsAll(Record.of("b")));
    assertFalse(Record.of("a", "b", "c").subList(1, 1).containsAll(Record.of("b", "c")));
  }

  @Test
  public void testViewContainsKey() {
    final Record xss = Record.of().attr("k", "v").attr("a", "b").slot(Num.from(3), "three").slot(Num.from(4), "four").subList(1, 3);
    assertFalse(xss.containsKey("k"));
    assertTrue(xss.containsKey("a"));
    assertTrue(xss.containsKey(Num.from(3)));
    assertFalse(xss.containsKey(Num.from(4)));
  }

  @Test
  public void testViewIndexOf() {
    final Record xs = Record.of("a", "b", "c", "c", "d", "e");
    final Record xss = xs.subList(1, 5);
    assertEquals(xss.indexOf("a"), -1);
    assertEquals(xss.indexOf("b"), 0);
    assertEquals(xss.indexOf("c"), 1);
    assertEquals(xss.indexOf("d"), 3);
    assertEquals(xss.indexOf("e"), -1);
  }

  @Test
  public void testViewLastIndexOf() {
    final Record xs = Record.of("a", "b", "c", "c", "d", "e");
    final Record xss = xs.subList(1, 5);
    assertEquals(xss.lastIndexOf("e"), -1);
    assertEquals(xss.lastIndexOf("d"), 3);
    assertEquals(xss.lastIndexOf("c"), 2);
    assertEquals(xss.lastIndexOf("b"), 0);
    assertEquals(xss.lastIndexOf("a"), -1);
  }

  @Test
  public void testViewGet() {
    final Record xss = Record.of().attr("k", "v").attr("a", "b").slot(Num.from(3), "three").slot(Num.from(4), "four").subList(1, 3);
    assertEquals(xss.get("k"), Value.absent());
    assertEquals(xss.get("a"), Text.from("b"));
    assertEquals(xss.get(Num.from(3)), Text.from("three"));
    assertEquals(xss.get(Num.from(4)), Value.absent());
  }

  @Test
  public void testViewGetAttr() {
    final Record xss = Record.of().attr("a", "b").item("c").slot("d", "e").attr("f", "g").attr("h", "i").item("j").attr("k", "v").subList(1, 5);
    assertEquals(xss.getAttr("a"), Value.absent());
    assertEquals(xss.getAttr("d"), Value.absent());
    assertEquals(xss.getAttr("f"), Text.from("g"));
    assertEquals(xss.getAttr("h"), Text.from("i"));
    assertEquals(xss.getAttr("k"), Value.absent());
  }

  @Test
  public void testViewGetSlot() {
    final Record xss = Record.of().slot("a", "b").item("c").attr("d", "e").slot("f", "g").slot("h", "i").item("j").slot("k", "v").subList(1, 5);
    assertEquals(xss.getSlot("a"), Value.absent());
    assertEquals(xss.getSlot("d"), Value.absent());
    assertEquals(xss.getSlot("f"), Text.from("g"));
    assertEquals(xss.getSlot("h"), Text.from("i"));
    assertEquals(xss.getSlot("k"), Value.absent());
  }

  @Test
  public void testViewGetField() {
    final Record xss = Record.of().attr("a", "b").item("c").slot("d", "e").attr("f", "g").attr("h", "i").item("j").attr("k", "v").subList(1, 5);
    assertEquals(xss.getField("a"), null);
    assertEquals(xss.getField("d"), Slot.of("d", "e"));
    assertEquals(xss.getField("f"), Attr.of("f", "g"));
    assertEquals(xss.getField("h"), Attr.of("h", "i"));
    assertEquals(xss.getField("k"), null);
  }

  @Test
  public void testViewGetItem() {
    final Record xss = Record.of("a", "b", "c", "d", "e").subList(1, 4);
    assertEquals(xss.getItem(0), Text.from("b"));
    assertEquals(xss.getItem(1), Text.from("c"));
    assertEquals(xss.getItem(2), Text.from("d"));
  }

  @Test
  public void testViewGetItemOutOfBounds() {
    final Record xss = Record.of("a", "b", "c", "d", "e").subList(1, 4);
    assertEquals(xss.getItem(-1), Value.absent());
    assertEquals(xss.getItem(3), Value.absent());
  }

  public void testViewGetItemUnderflow() {
    assertEquals(Record.of("a", "b", "c", "d", "e").subList(1, 4).getItem(-1), Value.absent());
  }

  public void testViewGetItemOverflow() {
    assertEquals(Record.of("a", "b", "c", "d", "e").subList(1, 4).getItem(3), Value.absent());
  }

  @Test(expectedExceptions = IndexOutOfBoundsException.class)
  public void testViewGetUnderflow() {
    Record.of("a", "b", "c", "d", "e").subList(1, 4).get(-1);
  }

  @Test(expectedExceptions = IndexOutOfBoundsException.class)
  public void testViewGetOverflow() {
    Record.of("a", "b", "c", "d", "e").subList(1, 4).get(3);
  }

  @Test
  public void testViewToArray() {
    final Record xs = Record.of("a", "b", "c", "d", "e");
    final Record xss = xs.subList(1, 4);
    final Object[] array = xss.toArray();
    assertEquals(array.length, 3);
    assertEquals(array[0], Text.from("b"));
    assertEquals(array[1], Text.from("c"));
    assertEquals(array[2], Text.from("d"));
  }

  @Test
  public void testViewToTypedArray() {
    final Record xs = Record.of("a", "b", "c", "d", "e");
    final Record xss = xs.subList(1, 4);
    final Text[] array = {Text.from("w"), Text.from("x"), Text.from("y"), Text.from("z")};
    xss.toArray(array);
    assertEquals(array[0], Text.from("b"));
    assertEquals(array[1], Text.from("c"));
    assertEquals(array[2], Text.from("d"));
    assertNull(array[3]);
  }

  @Test
  public void testViewIterator() {
    final Iterator<Item> iter = Record.of("a", "b", "c", "d", "e").subList(1, 4).iterator();
    assertTrue(iter.hasNext());
    assertEquals(iter.next(), Text.from("b"));
    assertTrue(iter.hasNext());
    assertEquals(iter.next(), Text.from("c"));
    assertTrue(iter.hasNext());
    assertEquals(iter.next(), Text.from("d"));
    assertFalse(iter.hasNext());
  }
}
