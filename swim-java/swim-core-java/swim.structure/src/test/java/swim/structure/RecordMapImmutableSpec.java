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

public class RecordMapImmutableSpec {
  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutablePut() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").commit();
    xs.put("k", "V");
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableSetItem() {
    final Record xs = Record.of("a", "d", "c").commit();
    xs.setItem(1, "b");
  }

  @Test
  public void testImmutableUpdatedAttr() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").commit();
    assertTrue(xs.containsKey("k")); // force hashTable
    final Record ys = xs.updatedAttr("a", "B");
    assertEquals(xs.fieldCount(), 2);
    assertEquals(ys.fieldCount(), 2);
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "b"));
    assertEquals(ys, Record.of().attr("k", "v").attr("a", "B"));
  }

  @Test
  public void testImmutableUpdatedSlot() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").commit();
    assertTrue(xs.containsKey("k")); // force hashTable
    final Record ys = xs.updatedSlot("k", "V");
    assertEquals(xs.fieldCount(), 2);
    assertEquals(ys.fieldCount(), 2);
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "b"));
    assertEquals(ys, Record.of().slot("k", "V").slot("a", "b"));
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableAdd() {
    final Record xs = Record.of("a", "b").commit();
    xs.add("c");
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableAddAll() {
    final Record xs = Record.of("a", "b").commit();
    xs.addAll(Record.of("c", "d"));
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableAddIndex() {
    final Record xs = Record.of("b", "d").commit();
    xs.add(1, "c");
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableAddAllIndex() {
    final Record xs = Record.of("a", "d").commit();
    xs.addAll(1, Record.of("b", "c"));
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableRemoveIndex() {
    final Record xs = Record.of("a", "b", "c").commit();
    xs.remove(1);
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableRemoveItem() {
    final Record xs = Record.of("a", "b", "c").commit();
    xs.remove("d");
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableRemoveKey() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").commit();
    xs.removeKey("a");
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableRemoveAll() {
    final Record xs = Record.of("a", "b", "c", "d").commit();
    xs.removeAll(Record.of("b", "c"));
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableRetainAll() {
    final Record xs = Record.of("a", "b", "c", "d").commit();
    xs.retainAll(Record.of("b", "c"));
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableClear() {
    final Record xs = Record.of("a", "b", "c", "d").commit();
    xs.clear();
  }

  @Test
  public void testBranchedSetItem() {
    final Record xs = Record.of("a", "d", "c").commit();
    final Record ys = xs.branch();
    assertFalse(xs.isMutable());
    assertTrue(ys.isMutable());
    ys.setItem(1, "b");
    assertEquals(xs.getItem(1), Text.from("d"));
    assertEquals(ys.getItem(1), Text.from("b"));
  }

  @Test
  public void testBranchedPut() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").commit();
    assertTrue(xs.containsKey("k")); // force hashTable
    final Record ys = xs.branch();
    ys.put("k", "V");
    assertEquals(xs.fieldCount(), 2);
    assertEquals(ys.fieldCount(), 2);
    assertEquals(xs.get("k"), Text.from("v"));
    assertEquals(xs.get("a"), Text.from("b"));
    assertEquals(ys.get("k"), Text.from("V"));
    assertEquals(ys.get("a"), Text.from("b"));
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "b"));
    assertEquals(ys, Record.of().attr("k", "V").slot("a", "b"));
  }

  @Test
  public void testBranchedAdd() {
    final Record xs = Record.of("a", "b").commit();
    final Record ys = xs.branch();
    ys.add("c");
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 3);
    assertEquals(xs, Record.of("a", "b"));
    assertEquals(ys, Record.of("a", "b", "c"));
  }

  @Test
  public void testBranchedAddAll() {
    final Record xs = Record.of("c", "d").commit();
    final Record ys = xs.branch();
    ys.addAll(Record.of("e", "f"));
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 4);
    assertEquals(xs, Record.of("c", "d"));
    assertEquals(ys, Record.of("c", "d", "e", "f"));
  }

  @Test
  public void testBranchedAddIndex() {
    final Record xs = Record.of("b", "d").commit();
    final Record ys = xs.branch();
    ys.add(1, "c");
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 3);
    assertEquals(xs, Record.of("b", "d"));
    assertEquals(ys, Record.of("b", "c", "d"));
  }

  @Test
  public void testBranchedAddAllIndex() {
    final Record xs = Record.of("c", "f").commit();
    final Record ys = xs.branch();
    ys.addAll(1, Record.of("d", "e"));
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 4);
    assertEquals(xs, Record.of("c", "f"));
    assertEquals(ys, Record.of("c", "d", "e", "f"));
  }

  @Test
  public void testBranchedRemoveIndex() {
    final Record xs = Record.of("a", "b", "c").commit();
    final Record ys = xs.branch();
    ys.remove(1);
    assertEquals(xs.size(), 3);
    assertEquals(ys.size(), 2);
    assertEquals(xs, Record.of("a", "b", "c"));
    assertEquals(ys, Record.of("a", "c"));
  }

  @Test
  public void testBranchedRemoveItem() {
    final Record xs = Record.of("a", "b", "c").commit();
    final Record ys = xs.branch();
    ys.remove("b");
    assertEquals(xs.size(), 3);
    assertEquals(ys.size(), 2);
    assertEquals(xs, Record.of("a", "b", "c"));
    assertEquals(ys, Record.of("a", "c"));
  }

  @Test
  public void testBranchedRemoveKey() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").commit();
    final Record ys = xs.branch();
    ys.removeKey("a");
    assertEquals(xs.size(), 2);
    assertEquals(ys.size(), 1);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(ys.fieldCount(), 1);
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "b"));
    assertEquals(ys, Record.of().attr("k", "v"));
  }

  @Test
  public void testBranchedRemoveAll() {
    final Record xs = Record.of("a", "b", "c", "d").commit();
    final Record ys = xs.branch();
    ys.removeAll(Record.of("b", "z", "c"));
    assertEquals(xs.size(), 4);
    assertEquals(ys.size(), 2);
    assertEquals(xs, Record.of("a", "b", "c", "d"));
    assertEquals(ys, Record.of("a", "d"));
  }

  @Test
  public void testBranchedRetainAll() {
    final Record xs = Record.of("a", "b", "c", "d").commit();
    final Record ys = xs.branch();
    ys.retainAll(Record.of("b", "z", "c"));
    assertEquals(xs.size(), 4);
    assertEquals(ys.size(), 2);
    assertEquals(xs, Record.of("a", "b", "c", "d"));
    assertEquals(ys, Record.of("b", "c"));
  }

  @Test
  public void testBranchedClear() {
    final Record xs = Record.of("a", "b", "c", "d").commit();
    final Record ys = xs.branch();
    ys.clear();
    assertEquals(xs.size(), 4);
    assertEquals(ys.size(), 0);
    assertEquals(xs, Record.of("a", "b", "c", "d"));
    assertEquals(ys, Record.empty());
  }
}
