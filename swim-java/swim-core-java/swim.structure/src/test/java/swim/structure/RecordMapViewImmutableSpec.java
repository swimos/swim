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

public class RecordMapViewImmutableSpec {
  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableViewPut() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").slot("c", "d");
    final Record xss = xs.subList(1, 2);
    xs.commit();
    xss.put("a", "B");
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableViewSetItem() {
    final Record xs = Record.of("a", "d", "c");
    final Record xss = xs.subList(1, 2);
    xs.commit();
    xss.setItem(0, "b");
  }

  @Test
  public void testImmutableViewUpdatedAttr() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").slot("c", "d");
    final Record xss = xs.subList(1, 2);
    xs.commit();
    final Record yss = xss.updatedAttr("a", "B");
    assertEquals(xs, Record.of().attr("k", "v").slot("a", "b").slot("c", "d"));
    assertEquals(xss, Record.of().slot("a", "b"));
    assertEquals(yss, Record.of().attr("a", "B"));
  }

  @Test
  public void testImmutableViewUpdatedSlot() {
    final Record xs = Record.of().attr("k", "v").attr("a", "b").slot("c", "d");
    final Record xss = xs.subList(1, 2);
    xs.commit();
    final Record yss = xss.updatedSlot("a", "B");
    assertEquals(xs, Record.of().attr("k", "v").attr("a", "b").slot("c", "d"));
    assertEquals(xss, Record.of().attr("a", "b"));
    assertEquals(yss, Record.of().slot("a", "B"));
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableViewAdd() {
    final Record xs = Record.of("a", "b", "d");
    final Record xss = xs.subList(1, 2);
    xs.commit();
    xss.add("c");
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableViewAddAll() {
    final Record xs = Record.of("a", "b", "c", "f");
    final Record xss = xs.subList(1, 3);
    xs.commit();
    xss.addAll(Record.of("d", "e"));
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableViewAddIndex() {
    final Record xs = Record.of("a", "c", "e", "g");
    final Record xss = xs.subList(1, 3);
    xs.commit();
    xss.add(1, "d");
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableViewAddAllIndex() {
    final Record xs = Record.of("a", "b", "e", "f");
    final Record xss = xs.subList(1, 3);
    xs.commit();
    xss.addAll(1, Record.of("c", "d"));
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableViewRemoveIndex() {
    final Record xs = Record.of("a", "b", "c", "d", "e");
    final Record xss = xs.subList(1, 4);
    xs.commit();
    xss.remove(1);
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableViewRemoveItem() {
    final Record xs = Record.of("a", "b", "c", "d", "c");
    final Record xss = xs.subList(1, 4);
    xs.commit();
    xss.remove("c");
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableViewRemoveKey() {
    final Record xs = Record.of().attr("k", "v").slot("a", "b").slot("c", "d").slot("e", "f");
    final Record xss = xs.subList(1, 3);
    xs.commit();
    xss.removeKey("c");
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableViewRemoveAll() {
    final Record xs = Record.of("a", "b", "c", "d", "e", "f");
    final Record xss = xs.subList(1, 5);
    xs.commit();
    xss.removeAll(Record.of("c", "d"));
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableViewRetainAll() {
    final Record xs = Record.of("a", "b", "c", "d", "e", "f");
    final Record xss = xs.subList(1, 5);
    xs.commit();
    xss.retainAll(Record.of("c", "d"));
  }

  @Test(expectedExceptions = UnsupportedOperationException.class)
  public void testImmutableViewClear() {
    final Record xs = Record.of("a", "b", "c", "d");
    final Record xss = xs.subList(1, 3);
    xs.commit();
    xss.clear();
  }

  @Test
  public void testBranchedViewSetItem() {
    final Record xs = Record.of("a", "d", "c").commit();
    final Record xss = xs.subList(1, 2);
    final Record yss = xss.branch();
    yss.setItem(0, "b");
    assertEquals(xs.size(), 3);
    assertEquals(xss.size(), 1);
    assertEquals(yss.size(), 1);
    assertEquals(xs, Record.of("a", "d", "c"));
    assertEquals(xss, Record.of("d"));
    assertEquals(yss, Record.of("b"));
  }

  @Test
  public void testBranchedViewAdd() {
    final Record xs = Record.of("a", "b", "d").commit();
    final Record xss = xs.subList(1, 2);
    final Record yss = xss.branch();
    yss.add("c");
    assertEquals(xs.size(), 3);
    assertEquals(xss.size(), 1);
    assertEquals(yss.size(), 2);
    assertEquals(xs, Record.of("a", "b", "d"));
    assertEquals(xss, Record.of("b"));
    assertEquals(yss, Record.of("b", "c"));
  }

  @Test
  public void testBranchedViewAddAll() {
    final Record xs = Record.of("a", "b", "c", "f").commit();
    final Record xss = xs.subList(1, 3);
    final Record yss = xss.branch();
    yss.addAll(Record.of("d", "e"));
    assertEquals(xs.size(), 4);
    assertEquals(xss.size(), 2);
    assertEquals(yss.size(), 4);
    assertEquals(xs, Record.of("a", "b", "c", "f"));
    assertEquals(xss, Record.of("b", "c"));
    assertEquals(yss, Record.of("b", "c", "d", "e"));
  }

  @Test
  public void testBranchedViewAddIndex() {
    final Record xs = Record.of("a", "b", "d", "e").commit();
    final Record xss = xs.subList(1, 3);
    final Record yss = xss.branch();
    yss.add(1, "c");
    assertEquals(xs.size(), 4);
    assertEquals(xss.size(), 2);
    assertEquals(yss.size(), 3);
    assertEquals(xs, Record.of("a", "b", "d", "e"));
    assertEquals(xss, Record.of("b", "d"));
    assertEquals(yss, Record.of("b", "c", "d"));
  }

  @Test
  public void testBranchedViewAddAllIndex() {
    final Record xs = Record.of("a", "b", "e", "f").commit();
    final Record xss = xs.subList(1, 3);
    final Record yss = xss.branch();
    yss.addAll(1, Record.of("c", "d"));
    assertEquals(xs.size(), 4);
    assertEquals(xss.size(), 2);
    assertEquals(yss.size(), 4);
    assertEquals(xs, Record.of("a", "b", "e", "f"));
    assertEquals(xss, Record.of("b", "e"));
    assertEquals(yss, Record.of("b", "c", "d", "e"));
  }

  @Test
  public void testBranchedViewRemoveIndex() {
    final Record xs = Record.of("a", "b", "c", "d", "e").commit();
    final Record xss = xs.subList(1, 4);
    final Record yss = xss.branch();
    yss.remove(1);
    assertEquals(xs.size(), 5);
    assertEquals(xss.size(), 3);
    assertEquals(yss.size(), 2);
    assertEquals(xs, Record.of("a", "b", "c", "d", "e"));
    assertEquals(xss, Record.of("b", "c", "d"));
    assertEquals(yss, Record.of("b", "d"));
  }

  @Test
  public void testBranchedViewRemoveItem() {
    final Record xs = Record.of("a", "b", "c", "d", "c").commit();
    final Record xss = xs.subList(1, 4);
    final Record yss = xss.branch();
    yss.remove("c");
    assertEquals(xs.size(), 5);
    assertEquals(xss.size(), 3);
    assertEquals(yss.size(), 2);
    assertEquals(xs, Record.of("a", "b", "c", "d", "c"));
    assertEquals(xss, Record.of("b", "c", "d"));
    assertEquals(yss, Record.of("b", "d"));
  }

  @Test
  public void testBranchedViewRemoveAll() {
    final Record xs = Record.of("c", "b", "c", "d", "e", "d").commit();
    final Record xss = xs.subList(1, 5);
    final Record yss = xss.branch();
    yss.removeAll(Record.of("c", "d"));
    assertEquals(xs.size(), 6);
    assertEquals(xss.size(), 4);
    assertEquals(yss.size(), 2);
    assertEquals(xs, Record.of("c", "b", "c", "d", "e", "d"));
    assertEquals(xss, Record.of("b", "c", "d", "e"));
    assertEquals(yss, Record.of("b", "e"));
  }

  @Test
  public void testBranchedViewRetainAll() {
    final Record xs = Record.of("c", "b", "c", "d", "e", "d").commit();
    final Record xss = xs.subList(1, 5);
    final Record yss = xss.branch();
    yss.retainAll(Record.of("b", "e"));
    assertEquals(xs.size(), 6);
    assertEquals(xss.size(), 4);
    assertEquals(yss.size(), 2);
    assertEquals(xs, Record.of("c", "b", "c", "d", "e", "d"));
    assertEquals(xss, Record.of("b", "c", "d", "e"));
    assertEquals(yss, Record.of("b", "e"));
  }

  @Test
  public void testBranchedViewClear() {
    final Record xs = Record.of("a", "b", "c", "d").commit();
    final Record xss = xs.subList(1, 3);
    final Record yss = xss.branch();
    yss.clear();
    assertEquals(xs.size(), 4);
    assertEquals(xss.size(), 2);
    assertEquals(yss.size(), 0);
    assertEquals(xs, Record.of("a", "b", "c", "d"));
    assertEquals(xss, Record.of("b", "c"));
    assertEquals(yss, Record.empty());
  }
}
