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
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

public class RecordMapMutableSpec {
  @Test
  public void testMutablePut() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b");
    xs.put("k", "V");
    assertEquals(xs.size(), 2);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(xs.get("k"), Text.from("V"));
    assertEquals(xs.get("a"), Text.from("b"));
    assertEquals(xs, Record.of().attr("k", "V").slot("a", "b"));

    xs.put("a", "B");
    assertEquals(xs.size(), 2);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(xs.get("k"), Text.from("V"));
    assertEquals(xs.get("a"), Text.from("B"));
    assertEquals(xs, Record.of().attr("k", "V").slot("a", "B"));

    xs.put(Num.from(4), 5);
    assertEquals(xs.size(), 3);
    assertEquals(xs.fieldCount(), 3);
    assertEquals(xs.get("k"), Text.from("V"));
    assertEquals(xs.get("a"), Text.from("B"));
    assertEquals(xs.get(Num.from(4)), Num.from(5));
    assertEquals(xs, Record.of().attr("k", "V").slot("a", "B").slot(Num.from(4), 5));

    xs.put(Num.from(4), "FOUR");
    assertEquals(xs.size(), 3);
    assertEquals(xs.fieldCount(), 3);
    assertEquals(xs.get("k"), Text.from("V"));
    assertEquals(xs.get("a"), Text.from("B"));
    assertEquals(xs.get(Num.from(4)), Text.from("FOUR"));
    assertEquals(xs, Record.of().attr("k", "V").slot("a", "B").slot(Num.from(4), "FOUR"));
  }

  @Test
  public void testMutablePutEmpty() {
    final Record xs = Record.create();
    xs.put("k", "v");
    assertEquals(xs.size(), 1);
    assertEquals(xs.fieldCount(), 1);
    assertEquals(xs.get("k"), Text.from("v"));
    assertEquals(xs, Record.of().slot("k", "v"));
  }

  @Test
  public void testMutableSetItem() {
    final Record xs = Record.of("a", "d", "c");
    xs.setItem(1, "b");
    assertEquals(xs.size(), 3);
    assertEquals(xs.getItem(1), Text.from("b"));
  }

  @Test
  public void testMutableUpdatedAttr() {
    Record xs = Record.create();
    xs = xs.updatedAttr("k", "v");
    assertEquals(xs.size(), 1);
    assertEquals(xs.fieldCount(), 1);
    assertEquals(xs, Record.of().attr("k", "v"));

    xs = xs.updatedAttr("a", "b");
    assertEquals(xs.size(), 2);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(xs, Record.of().attr("k", "v").attr("a", "b"));

    xs = xs.updatedAttr("k", "V");
    assertEquals(xs.size(), 2);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(xs, Record.of().attr("k", "V").attr("a", "b"));

    xs = xs.updatedAttr("a", "B");
    assertEquals(xs.size(), 2);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(xs, Record.of().attr("k", "V").attr("a", "B"));

    xs = Record.of().slot("k", "v").slot("a", "b");
    xs = xs.updatedAttr("k", "V");
    assertEquals(xs.size(), 2);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(xs, Record.of().attr("k", "V").slot("a", "b"));
  }

  @Test
  public void testMutableUpdatedSlot() {
    Record xs = Record.create();
    xs = xs.updatedSlot("k", "v");
    assertEquals(xs.size(), 1);
    assertEquals(xs.fieldCount(), 1);
    assertEquals(xs, Record.of().slot("k", "v"));

    xs = xs.updatedSlot("a", "b");
    assertEquals(xs.size(), 2);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(xs, Record.of().slot("k", "v").slot("a", "b"));

    xs = xs.updatedSlot("k", "V");
    assertEquals(xs.size(), 2);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(xs, Record.of().slot("k", "V").slot("a", "b"));

    xs = xs.updatedSlot("a", "B");
    assertEquals(xs.size(), 2);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(xs, Record.of().slot("k", "V").slot("a", "B"));

    xs = Record.of().attr("k", "v").attr("a", "b");
    xs = xs.updatedSlot("a", "B");
    assertEquals(xs.size(), 2);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "B"));
  }

  @Test
  public void testMutableAdd() {
    final Record xs = Record.of("a", "b");
    xs.add("c");
    assertEquals(xs.size(), 3);
    assertEquals(xs, Record.of("a", "b", "c"));
  }

  @Test
  public void testMutableAddEmpty() {
    final Record xs = Record.create();
    xs.add("a");
    assertEquals(xs.size(), 1);
    assertEquals(xs, Record.of("a"));
  }

  @Test
  public void testMutableAddAll() {
    final Record xs = Record.of("a", "b");
    xs.addAll(Record.of("c", "d"));
    assertEquals(xs.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "d"));
  }

  @Test
  public void testMutableAddAllEmpty() {
    final Record xs = Record.create();
    xs.addAll(Record.empty());
    assertEquals(xs.size(), 0);
    assertEquals(xs, Record.empty());

    xs.addAll(Record.of("a", "b"));
    assertEquals(xs.size(), 2);
    assertEquals(xs, Record.of("a", "b"));
  }

  @Test
  public void testMutableAddIndex() {
    final Record xs = Record.of("b", "d");
    xs.add(1, "c");
    assertEquals(xs.size(), 3);
    assertEquals(xs, Record.of("b", "c", "d"));

    xs.add(0, "a");
    assertEquals(xs.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "d"));

    xs.add(4, "e");
    assertEquals(xs.size(), 5);
    assertEquals(xs, Record.of("a", "b", "c", "d", "e"));
  }

  @Test
  public void testMutableAddAllIndex() {
    Record xs = Record.of("a", "d");
    xs.addAll(1, Record.of("b", "c"));
    assertEquals(xs.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "d"));

    xs = Record.of("c", "d");
    xs.addAll(0, Record.of("a", "b"));
    assertEquals(xs.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "d"));
  }

  @Test
  public void testMutableRemoveIndex() {
    final Record xs = Record.of("a", "b", "c");
    xs.remove(1);
    assertEquals(xs.size(), 2);
    assertEquals(xs, Record.of("a", "c"));

    xs.remove(1);
    assertEquals(xs.size(), 1);
    assertEquals(xs, Record.of("a"));

    xs.remove(0);
    assertEquals(xs.size(), 0);
    assertEquals(xs, Record.empty());
  }

  @Test
  public void testMutableRemoveItem() {
    final Record xs = Record.of("a", "b", "c");
    xs.remove("d");
    assertEquals(xs.size(), 3);
    assertEquals(xs, Record.of("a", "b", "c"));

    xs.remove("b");
    assertEquals(xs.size(), 2);
    assertEquals(xs, Record.of("a", "c"));

    xs.remove("c");
    assertEquals(xs.size(), 1);
    assertEquals(xs, Record.of("a"));

    xs.remove("a");
    assertEquals(xs.size(), 0);
    assertEquals(xs, Record.empty());

    xs.remove("z");
    assertEquals(xs.size(), 0);
    assertEquals(xs, Record.empty());
  }

  @Test
  public void testMutableRemoveKey() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b");
    xs.removeKey("a");
    assertEquals(xs.size(), 1);
    assertEquals(xs.fieldCount(), 1);
    assertEquals(xs, Record.of().attr("k", "v"));

    xs.removeKey("z");
    assertEquals(xs.size(), 1);
    assertEquals(xs.fieldCount(), 1);
    assertEquals(xs, Record.of().attr("k", "v"));

    xs.removeKey("k");
    assertEquals(xs.size(), 0);
    assertEquals(xs.fieldCount(), 0);
    assertEquals(xs, Record.empty());

    xs.removeKey("z");
    assertEquals(xs.size(), 0);
    assertEquals(xs.fieldCount(), 0);
    assertEquals(xs, Record.empty());
  }

  @Test
  public void testMutableRemoveAll() {
    final Record xs = Record.of("a", "b", "c", "d");
    xs.removeAll(Record.empty());
    assertEquals(xs.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "d"));

    xs.removeAll(Record.of("x", "y"));
    assertEquals(xs.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "d"));

    xs.removeAll(Record.of("b", "d", "e"));
    assertEquals(xs.size(), 2);
    assertEquals(xs, Record.of("a", "c"));

    xs.removeAll(Record.of("c", "a"));
    assertEquals(xs.size(), 0);

    xs.removeAll(Record.of("z"));
    assertEquals(xs.size(), 0);
  }

  @Test
  public void testMutableRetainAll() {
    final Record xs = Record.of("a", "b", "c", "d");
    xs.retainAll(Record.of("a", "b", "c", "d", "e"));
    assertEquals(xs.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "d"));

    xs.retainAll(Record.of("d", "a"));
    assertEquals(xs.size(), 2);
    assertEquals(xs, Record.of("a", "d"));

    xs.retainAll(Record.of("d"));
    assertEquals(xs.size(), 1);
    assertEquals(xs, Record.of("d"));

    xs.retainAll(Record.of("f"));
    assertEquals(xs.size(), 0);
  }

  @Test
  public void testMutableClear() {
    final Record xs = Record.of("a", "b", "c", "d");
    xs.clear();
    assertEquals(xs.size(), 0);
    assertEquals(xs, Record.empty());
  }

  @Test
  public void testAliasedSetItem() {
    final Record xs = Record.of("a", "d", "c");
    final Record ys = xs.branch();
    assertTrue(xs.isAliased());
    assertTrue(ys.isAliased());

    ys.setItem(1, "b");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.getItem(1), Text.from("d"));
    assertEquals(ys.getItem(1), Text.from("b"));

    xs.setItem(1, "B");
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.getItem(1), Text.from("B"));
    assertEquals(ys.getItem(1), Text.from("b"));
  }

  @Test
  public void testAliasedPut() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b");
    assertTrue(xs.containsKey("k")); // force hashTable
    final Record ys = xs.branch();

    ys.put("k", "V");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.fieldCount(), 2);
    assertEquals(ys.fieldCount(), 2);
    assertEquals(xs.get("k"), Text.from("v"));
    assertEquals(xs.get("a"), Text.from("b"));
    assertEquals(ys.get("k"), Text.from("V"));
    assertEquals(ys.get("a"), Text.from("b"));
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "b"));
    assertEquals(ys, Record.of().attr("k", "V").slot("a", "b"));

    xs.put("a", "B");
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.fieldCount(), 2);
    assertEquals(ys.fieldCount(), 2);
    assertEquals(xs.get("k"), Text.from("v"));
    assertEquals(xs.get("a"), Text.from("B"));
    assertEquals(ys.get("k"), Text.from("V"));
    assertEquals(ys.get("a"), Text.from("b"));
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "B"));
    assertEquals(ys, Record.of().attr("k", "V").slot("a", "b"));
  }

  @Test
  public void testAliasedUpdatedAttr() {
    Record xs = Record.of().attr("k", "v").slot("a", "b");
    assertTrue(xs.containsKey("k")); // force hashTable
    Record ys = xs.branch();

    ys = ys.updatedAttr("k", "V");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.fieldCount(), 2);
    assertEquals(ys.fieldCount(), 2);
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "b"));
    assertEquals(ys, Record.of().attr("k", "V").slot("a", "b"));

    xs = xs.updatedAttr("a", "B");
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.fieldCount(), 2);
    assertEquals(ys.fieldCount(), 2);
    assertEquals(xs, Record.of().attr("k", "v").attr("a", "B"));
    assertEquals(ys, Record.of().attr("k", "V").slot("a", "b"));
  }

  @Test
  public void testAliasedUpdatedSlot() {
    Record xs = Record.of().attr("k", "v").slot("a", "b");
    assertTrue(xs.containsKey("k")); // force hashTable
    Record ys = xs.branch();

    ys = ys.updatedSlot("a", "B");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.fieldCount(), 2);
    assertEquals(ys.fieldCount(), 2);
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "b"));
    assertEquals(ys, Record.of().attr("k", "v").slot("a", "B"));

    xs = xs.updatedSlot("k", "V");
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.fieldCount(), 2);
    assertEquals(ys.fieldCount(), 2);
    assertEquals(xs, Record.of().slot("k", "V").slot("a", "b"));
    assertEquals(ys, Record.of().attr("k", "v").slot("a", "B"));
  }

  @Test
  public void testAliasedAdd() {
    final Record xs = Record.of("a", "b");
    final Record ys = xs.branch();

    ys.add("c");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 3);
    assertEquals(xs, Record.of("a", "b"));
    assertEquals(ys, Record.of("a", "b", "c"));

    xs.add("C");
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 3);
    assertEquals(ys.size(), 3);
    assertEquals(xs, Record.of("a", "b", "C"));
    assertEquals(ys, Record.of("a", "b", "c"));
  }

  @Test
  public void testAliasedAddAll() {
    final Record xs = Record.of("c", "d");
    final Record ys = xs.branch();

    ys.addAll(Record.of("e", "f"));
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 4);
    assertEquals(xs, Record.of("c", "d"));
    assertEquals(ys, Record.of("c", "d", "e", "f"));

    xs.addAll(Record.of("E", "F"));
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 4);
    assertEquals(ys.size(), 4);
    assertEquals(xs, Record.of("c", "d", "E", "F"));
    assertEquals(ys, Record.of("c", "d", "e", "f"));
  }

  @Test
  public void testAliasedAddIndex() {
    final Record xs = Record.of("b", "d");
    final Record ys = xs.branch();

    ys.add(1, "c");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 3);
    assertEquals(xs, Record.of("b", "d"));
    assertEquals(ys, Record.of("b", "c", "d"));

    xs.add(0, "a");
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 3);
    assertEquals(ys.size(), 3);
    assertEquals(xs, Record.of("a", "b", "d"));
    assertEquals(ys, Record.of("b", "c", "d"));
  }

  @Test
  public void testAliasedAddAllIndex() {
    final Record xs = Record.of("c", "f");
    final Record ys = xs.branch();

    ys.addAll(1, Record.of("d", "e"));
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 4);
    assertEquals(xs, Record.of("c", "f"));
    assertEquals(ys, Record.of("c", "d", "e", "f"));

    xs.addAll(0, Record.of("a", "b"));
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 4);
    assertEquals(ys.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "f"));
    assertEquals(ys, Record.of("c", "d", "e", "f"));
  }

  @Test
  public void testAliasedRemoveIndex() {
    final Record xs = Record.of("a", "b", "c");
    final Record ys = xs.branch();

    ys.remove(1);
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 3);
    assertEquals(ys.size(), 2);
    assertEquals(xs, Record.of("a", "b", "c"));
    assertEquals(ys, Record.of("a", "c"));

    xs.remove(0);
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 2);
    assertEquals(xs, Record.of("b", "c"));
    assertEquals(ys, Record.of("a", "c"));
  }

  @Test
  public void testAliasedRemoveItem() {
    final Record xs = Record.of("a", "b", "c");
    final Record ys = xs.branch();

    ys.remove("b");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 3);
    assertEquals(ys.size(), 2);
    assertEquals(xs, Record.of("a", "b", "c"));
    assertEquals(ys, Record.of("a", "c"));

    xs.remove("c");
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 2);
    assertEquals(xs, Record.of("a", "b"));
    assertEquals(ys, Record.of("a", "c"));
  }

  @Test
  public void testAliasedRemoveKey() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b");
    final Record ys = xs.branch();

    ys.removeKey("a");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 1);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(ys.fieldCount(), 1);
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "b"));
    assertEquals(ys, Record.of().attr("k", "v"));

    xs.removeKey("k");
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 1);
    assertEquals(ys.size(), 1);
    assertEquals(xs.fieldCount(), 1);
    assertEquals(ys.fieldCount(), 1);
    assertEquals(xs, Record.of().slot("a", "b"));
    assertEquals(ys, Record.of().attr("k", "v"));
  }

  @Test
  public void testAliasedRemoveAll() {
    final Record xs = Record.of("a", "b", "c", "d");
    final Record ys = xs.branch();

    ys.removeAll(Record.of("b", "z", "c"));
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 4);
    assertEquals(ys.size(), 2);
    assertEquals(xs, Record.of("a", "b", "c", "d"));
    assertEquals(ys, Record.of("a", "d"));

    xs.removeAll(Record.of("a", "z", "d"));
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 2);
    assertEquals(xs, Record.of("b", "c"));
    assertEquals(ys, Record.of("a", "d"));
  }

  @Test
  public void testAliasedRetainAll() {
    final Record xs = Record.of("a", "b", "c", "d");
    final Record ys = xs.branch();

    ys.retainAll(Record.of("b", "z", "c"));
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 4);
    assertEquals(ys.size(), 2);
    assertEquals(xs, Record.of("a", "b", "c", "d"));
    assertEquals(ys, Record.of("b", "c"));

    xs.retainAll(Record.of("a", "z", "d"));
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 2);
    assertEquals(xs, Record.of("a", "d"));
    assertEquals(ys, Record.of("b", "c"));
  }

  @Test
  public void testAliasedClear() {
    final Record xs = Record.of("a", "b", "c", "d");
    final Record ys = xs.branch();

    ys.clear();
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 4);
    assertEquals(ys.size(), 0);
    assertEquals(xs, Record.of("a", "b", "c", "d"));
    assertEquals(ys, Record.empty());

    xs.clear();
    assertFalse(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 0);
    assertEquals(ys.size(), 0);
    assertEquals(xs, Record.empty());
    assertEquals(ys, Record.empty());
  }
}
