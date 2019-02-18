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

public class RecordMapViewMutableSpec {
  @Test
  public void testMutableViewPut() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").slot("c", "d");
    final Record xss = xs.subList(1, 2);

    xss.put("a", "B");
    assertEquals(xs.size(), 3);
    assertEquals(xss.size(), 1);
    assertEquals(xs.fieldCount(), 3);
    assertEquals(xs.get("a"), Text.from("B"));
    assertEquals(xss.get("a"), Text.from("B"));
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "B").slot("c", "d"));
    assertEquals(xss, Record.of().slot("a", "B"));

    xss.put("k", "V");
    assertEquals(xs.size(), 4);
    assertEquals(xss.size(), 2);
    assertEquals(xs.fieldCount(), 4);
    assertEquals(xs.get("k"), Text.from("V"));
    assertEquals(xss.get("k"), Text.from("V"));
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "B").slot("k", "V").slot("c", "d"));
    assertEquals(xss, Record.of().slot("a", "B").slot("k", "V"));
  }

  @Test
  public void testMutableViewSetItem() {
    final Record xs = Record.of("a", "d", "c");
    final Record xss = xs.subList(1, 2);
    xss.setItem(0, "b");
    assertEquals(xss.size(), 1);
    assertEquals(xss.getItem(0), Text.from("b"));
    assertEquals(xs.size(), 3);
    assertEquals(xs.getItem(1), Text.from("b"));
  }

  @Test
  public void testMutableViewUpdatedAttr() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").slot("e", "f");
    Record xss = xs.subList(1, 2);

    xss = xss.updatedAttr("a", "B");
    assertEquals(xs.size(), 3);
    assertEquals(xss.size(), 1);
    assertEquals(xs.fieldCount(), 3);
    assertEquals(xs.get("a"), Text.from("B"));
    assertEquals(xss.get("a"), Text.from("B"));
    assertEquals(xs, Record.of().attr("k", "v").attr("a", "B").slot("e", "f"));
    assertEquals(xss, Record.of().attr("a", "B"));

    xss = xss.updatedAttr("c", "D");
    assertEquals(xs.size(), 4);
    assertEquals(xss.size(), 2);
    assertEquals(xs.fieldCount(), 4);
    assertEquals(xs.get("c"), Text.from("D"));
    assertEquals(xss.get("c"), Text.from("D"));
    assertEquals(xs, Record.of().attr("k", "v").attr("a", "B").attr("c", "D").slot("e", "f"));
    assertEquals(xss, Record.of().attr("a", "B").attr("c", "D"));
  }

  @Test
  public void testMutableViewUpdatedSlot() {
    final Record xs = Record.of().attr("k", "v").attr("a", "b").slot("e", "f");
    Record xss = xs.subList(1, 2);

    xss = xss.updatedSlot("a", "B");
    assertEquals(xs.size(), 3);
    assertEquals(xss.size(), 1);
    assertEquals(xs.fieldCount(), 3);
    assertEquals(xs.get("a"), Text.from("B"));
    assertEquals(xss.get("a"), Text.from("B"));
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "B").slot("e", "f"));
    assertEquals(xss, Record.of().slot("a", "B"));

    xss = xss.updatedSlot("c", "D");
    assertEquals(xs.size(), 4);
    assertEquals(xss.size(), 2);
    assertEquals(xs.fieldCount(), 4);
    assertEquals(xs.get("c"), Text.from("D"));
    assertEquals(xss.get("c"), Text.from("D"));
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "B").slot("c", "D").slot("e", "f"));
    assertEquals(xss, Record.of().slot("a", "B").slot("c", "D"));
  }

  @Test
  public void testMutableViewAdd() {
    final Record xs = Record.of("a", "b", "d");
    final Record xss = xs.subList(1, 2);
    xss.add("c");
    assertEquals(xs.size(), 4);
    assertEquals(xss.size(), 2);
    assertEquals(xs, Record.of("a", "b", "c", "d"));
    assertEquals(xss, Record.of("b", "c"));
  }

  @Test
  public void testMutableViewAddAll() {
    final Record xs = Record.of("a", "b", "c", "f");
    final Record xss = xs.subList(1, 3);
    xss.addAll(Record.of("d", "e"));
    assertEquals(xs.size(), 6);
    assertEquals(xss.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "d", "e", "f"));
    assertEquals(xss, Record.of("b", "c", "d", "e"));
  }

  @Test
  public void testMutableViewAddIndex() {
    final Record xs = Record.of("a", "c", "e", "g");
    final Record xss = xs.subList(1, 3);

    xss.add(1, "d");
    assertEquals(xs.size(), 5);
    assertEquals(xss.size(), 3);
    assertEquals(xs, Record.of("a", "c", "d", "e", "g"));
    assertEquals(xss, Record.of("c", "d", "e"));

    xss.add(0, "b");
    assertEquals(xs.size(), 6);
    assertEquals(xss.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "d", "e", "g"));
    assertEquals(xss, Record.of("b", "c", "d", "e"));

    xss.add(4, "f");
    assertEquals(xs.size(), 7);
    assertEquals(xss.size(), 5);
    assertEquals(xs, Record.of("a", "b", "c", "d", "e", "f", "g"));
    assertEquals(xss, Record.of("b", "c", "d", "e", "f"));
  }

  @Test
  public void testMutableViewAddAllIndex() {
    final Record xs = Record.of("a", "b", "e", "f");
    final Record xss = xs.subList(1, 3);

    xss.addAll(1, Record.of("c", "d"));
    assertEquals(xs.size(), 6);
    assertEquals(xss.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "d", "e", "f"));
    assertEquals(xss, Record.of("b", "c", "d", "e"));
  }

  @Test
  public void testMutableViewRemoveIndex() {
    final Record xs = Record.of("a", "b", "c", "d", "e");
    final Record xss = xs.subList(1, 4);

    xss.remove(1);
    assertEquals(xs.size(), 4);
    assertEquals(xss.size(), 2);
    assertEquals(xs, Record.of("a", "b", "d", "e"));
    assertEquals(xss, Record.of("b", "d"));

    xss.remove(1);
    assertEquals(xs.size(), 3);
    assertEquals(xss.size(), 1);
    assertEquals(xs, Record.of("a", "b", "e"));
    assertEquals(xss, Record.of("b"));

    xss.remove(0);
    assertEquals(xs.size(), 2);
    assertEquals(xss.size(), 0);
    assertEquals(xs, Record.of("a", "e"));
    assertEquals(xss, Record.empty());
  }

  @Test
  public void testMutableViewRemoveItem() {
    final Record xs = Record.of("a", "b", "c", "d", "c");
    final Record xss = xs.subList(1, 4);

    xss.remove("a");
    assertEquals(xs.size(), 5);
    assertEquals(xss.size(), 3);
    assertEquals(xs, Record.of("a", "b", "c", "d", "c"));
    assertEquals(xss, Record.of("b", "c", "d"));

    xss.remove("c");
    assertEquals(xs.size(), 4);
    assertEquals(xss.size(), 2);
    assertEquals(xs, Record.of("a", "b", "d", "c"));
    assertEquals(xss, Record.of("b", "d"));

    xss.remove("d");
    assertEquals(xs.size(), 3);
    assertEquals(xss.size(), 1);
    assertEquals(xs, Record.of("a", "b", "c"));
    assertEquals(xss, Record.of("b"));

    xss.remove("b");
    assertEquals(xs.size(), 2);
    assertEquals(xss.size(), 0);
    assertEquals(xs, Record.of("a", "c"));
    assertEquals(xss, Record.empty());

    xss.remove("z");
    assertEquals(xs.size(), 2);
    assertEquals(xss.size(), 0);
    assertEquals(xs, Record.of("a", "c"));
    assertEquals(xss, Record.empty());
  }

  @Test
  public void testMutableViewRemoveKey() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").slot("c", "d").slot("e", "f");
    final Record xss = xs.subList(1, 3);

    xss.removeKey("c");
    assertEquals(xs.size(), 3);
    assertEquals(xss.size(), 1);
    assertEquals(xs.fieldCount(), 3);
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "b").slot("e", "f"));
    assertEquals(xss, Record.of().slot("a", "b"));

    xss.removeKey("k");
    assertEquals(xs.size(), 3);
    assertEquals(xss.size(), 1);
    assertEquals(xs.fieldCount(), 3);
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "b").slot("e", "f"));
    assertEquals(xss, Record.of().slot("a", "b"));

    xss.removeKey("a");
    assertEquals(xs.size(), 2);
    assertEquals(xss.size(), 0);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(xs, Record.of().attr("k", "v").slot("e", "f"));
    assertEquals(xss, Record.empty());

    xss.removeKey("z");
    assertEquals(xs.size(), 2);
    assertEquals(xss.size(), 0);
    assertEquals(xs.fieldCount(), 2);
    assertEquals(xs, Record.of().attr("k", "v").slot("e", "f"));
    assertEquals(xss, Record.empty());
  }

  @Test
  public void testMutableViewRemoveAll() {
    final Record xs = Record.of("a", "b", "c", "d", "e", "f");
    final Record xss = xs.subList(1, 5);

    xss.removeAll(Record.empty());
    assertEquals(xs.size(), 6);
    assertEquals(xss.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "d", "e", "f"));
    assertEquals(xss, Record.of("b", "c", "d", "e"));

    xss.removeAll(Record.of("a", "f"));
    assertEquals(xs.size(), 6);
    assertEquals(xss.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "d", "e", "f"));
    assertEquals(xss, Record.of("b", "c", "d", "e"));

    xss.removeAll(Record.of("c", "e", "f"));
    assertEquals(xs.size(), 4);
    assertEquals(xss.size(), 2);
    assertEquals(xs, Record.of("a", "b", "d", "f"));
    assertEquals(xss, Record.of("b", "d"));

    xss.removeAll(Record.of("d", "b"));
    assertEquals(xs.size(), 2);
    assertEquals(xss.size(), 0);
    assertEquals(xs, Record.of("a", "f"));
    assertEquals(xss, Record.empty());

    xss.removeAll(Record.of("a"));
    assertEquals(xs.size(), 2);
    assertEquals(xss.size(), 0);
    assertEquals(xs, Record.of("a", "f"));
    assertEquals(xss, Record.empty());
  }

  @Test
  public void testMutableViewRetainAll() {
    final Record xs = Record.of("a", "b", "c", "d", "e", "f");
    final Record xss = xs.subList(1, 5);

    xss.retainAll(Record.of("b", "c", "d", "e", "f"));
    assertEquals(xs.size(), 6);
    assertEquals(xss.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "d", "e", "f"));
    assertEquals(xss, Record.of("b", "c", "d", "e"));

    xss.retainAll(Record.of("e", "b"));
    assertEquals(xs.size(), 4);
    assertEquals(xss.size(), 2);
    assertEquals(xs, Record.of("a", "b", "e", "f"));
    assertEquals(xss, Record.of("b", "e"));

    xss.retainAll(Record.of("e"));
    assertEquals(xs.size(), 3);
    assertEquals(xss.size(), 1);
    assertEquals(xs, Record.of("a", "e", "f"));
    assertEquals(xss, Record.of("e"));

    xss.retainAll(Record.of("f"));
    assertEquals(xs.size(), 2);
    assertEquals(xss.size(), 0);
    assertEquals(xs, Record.of("a", "f"));
    assertEquals(xss, Record.empty());
  }

  @Test
  public void testMutableViewClear() {
    final Record xs = Record.of("a", "b", "c", "d");
    final Record xss = xs.subList(1, 3);
    xss.clear();
    assertEquals(xs.size(), 2);
    assertEquals(xss.size(), 0);
    assertEquals(xs, Record.of("a", "d"));
    assertEquals(xss, Record.empty());
  }

  @Test
  public void testAliasedViewSetItem() {
    final Record xs = Record.of("a", "d", "c");
    final Record ys = xs.branch();
    final Record yss = ys.subList(1, 2);
    yss.setItem(0, "b");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 3);
    assertEquals(ys.size(), 3);
    assertEquals(yss.size(), 1);
    assertEquals(xs, Record.of("a", "d", "c"));
    assertEquals(ys, Record.of("a", "b", "c"));
    assertEquals(yss, Record.of("b"));
  }

  @Test
  public void testAliasedViewPut() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").slot("c", "d");
    final Record ys = xs.branch();
    final Record yss = ys.subList(1, 3);
    yss.put("a", "B");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 3);
    assertEquals(ys.size(), 3);
    assertEquals(yss.size(), 2);
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "b").slot("c", "d"));
    assertEquals(ys, Record.of().attr("k", "v").slot("a", "B").slot("c", "d"));
    assertEquals(yss, Record.of().slot("a", "B").slot("c", "d"));
  }

  @Test
  public void testAliasedViewUpdatedAttr() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").slot("e", "f");
    final Record ys = xs.branch();
    Record yss = ys.subList(1, 2);
    yss = yss.updatedAttr("a", "B");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 3);
    assertEquals(ys.size(), 3);
    assertEquals(yss.size(), 1);
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "b").slot("e", "f"));
    assertEquals(ys, Record.of().attr("k", "v").attr("a", "B").slot("e", "f"));
    assertEquals(yss, Record.of().attr("a", "B"));
  }

  @Test
  public void testAliasedViewUpdatedSlot() {
    final Record xs = Record.of().attr("k", "v").attr("a", "b").slot("e", "f");
    final Record ys = xs.branch();
    Record yss = ys.subList(1, 2);
    yss = yss.updatedSlot("a", "B");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 3);
    assertEquals(ys.size(), 3);
    assertEquals(yss.size(), 1);
    assertEquals(xs, Record.of().attr("k", "v").attr("a", "b").slot("e", "f"));
    assertEquals(ys, Record.of().attr("k", "v").slot("a", "B").slot("e", "f"));
    assertEquals(yss, Record.of().slot("a", "B"));
  }

  @Test
  public void testAliasedViewAdd() {
    final Record xs = Record.of("a", "b", "d");
    final Record ys = xs.branch();
    final Record yss = ys.subList(1, 2);
    yss.add("c");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 3);
    assertEquals(ys.size(), 4);
    assertEquals(yss.size(), 2);
    assertEquals(xs, Record.of("a", "b", "d"));
    assertEquals(ys, Record.of("a", "b", "c", "d"));
    assertEquals(yss, Record.of("b", "c"));
  }

  @Test
  public void testAliasedViewAddAll() {
    final Record xs = Record.of("a", "b", "c", "f");
    final Record ys = xs.branch();
    final Record yss = ys.subList(1, 3);
    yss.addAll(Record.of("d", "e"));
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 4);
    assertEquals(ys.size(), 6);
    assertEquals(yss.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "f"));
    assertEquals(ys, Record.of("a", "b", "c", "d", "e", "f"));
    assertEquals(yss, Record.of("b", "c", "d", "e"));
  }

  @Test
  public void testAliasedViewAddIndex() {
    final Record xs = Record.of("a", "b", "d", "e");
    final Record ys = xs.branch();
    final Record yss = ys.subList(1, 3);
    yss.add(1, "c");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 4);
    assertEquals(ys.size(), 5);
    assertEquals(yss.size(), 3);
    assertEquals(xs, Record.of("a", "b", "d", "e"));
    assertEquals(ys, Record.of("a", "b", "c", "d", "e"));
    assertEquals(yss, Record.of("b", "c", "d"));
  }

  @Test
  public void testAliasedViewAddAllIndex() {
    final Record xs = Record.of("a", "b", "e", "f");
    final Record ys = xs.branch();
    final Record yss = ys.subList(1, 3);
    yss.addAll(1, Record.of("c", "d"));
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 4);
    assertEquals(ys.size(), 6);
    assertEquals(yss.size(), 4);
    assertEquals(xs, Record.of("a", "b", "e", "f"));
    assertEquals(ys, Record.of("a", "b", "c", "d", "e", "f"));
    assertEquals(yss, Record.of("b", "c", "d", "e"));
  }

  @Test
  public void testAliasedViewRemoveIndex() {
    final Record xs = Record.of("a", "b", "c", "d", "e");
    final Record ys = xs.branch();
    final Record yss = ys.subList(1, 4);
    yss.remove(1);
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 5);
    assertEquals(ys.size(), 4);
    assertEquals(yss.size(), 2);
    assertEquals(xs, Record.of("a", "b", "c", "d", "e"));
    assertEquals(ys, Record.of("a", "b", "d", "e"));
    assertEquals(yss, Record.of("b", "d"));
  }

  @Test
  public void testAliasedViewRemoveItem() {
    final Record xs = Record.of("a", "b", "c", "d", "c");
    final Record ys = xs.branch();
    final Record yss = ys.subList(1, 4);
    yss.remove("c");
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 5);
    assertEquals(ys.size(), 4);
    assertEquals(yss.size(), 2);
    assertEquals(xs, Record.of("a", "b", "c", "d", "c"));
    assertEquals(ys, Record.of("a", "b", "d", "c"));
    assertEquals(yss, Record.of("b", "d"));
  }

  @Test
  public void testAliasedViewRemoveAll() {
    final Record xs = Record.of("c", "b", "c", "d", "e", "d");
    final Record ys = xs.branch();
    final Record yss = ys.subList(1, 5);
    yss.removeAll(Record.of("c", "d"));
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 6);
    assertEquals(ys.size(), 4);
    assertEquals(yss.size(), 2);
    assertEquals(xs, Record.of("c", "b", "c", "d", "e", "d"));
    assertEquals(ys, Record.of("c", "b", "e", "d"));
    assertEquals(yss, Record.of("b", "e"));
  }

  @Test
  public void testAliasedViewRetainAll() {
    final Record xs = Record.of("c", "b", "c", "d", "e", "d");
    final Record ys = xs.branch();
    final Record yss = ys.subList(1, 5);
    yss.retainAll(Record.of("b", "e"));
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 6);
    assertEquals(ys.size(), 4);
    assertEquals(yss.size(), 2);
    assertEquals(xs, Record.of("c", "b", "c", "d", "e", "d"));
    assertEquals(ys, Record.of("c", "b", "e", "d"));
    assertEquals(yss, Record.of("b", "e"));
  }

  @Test
  public void testAliasedViewClear() {
    final Record xs = Record.of("a", "b", "c", "d");
    final Record ys = xs.branch();
    final Record yss = ys.subList(1, 3);
    yss.clear();
    assertTrue(xs.isAliased());
    assertFalse(ys.isAliased());
    assertEquals(xs.size(), 4);
    assertEquals(ys.size(), 2);
    assertEquals(yss.size(), 0);
    assertEquals(xs, Record.of("a", "b", "c", "d"));
    assertEquals(ys, Record.of("a", "d"));
    assertEquals(yss, Record.empty());
  }
}
