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

package swim.db;

import org.testng.annotations.Test;
import swim.spatial.BitInterval;
import swim.structure.Record;
import swim.structure.Text;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

public class QTreePageSpec {
  @Test
  public void updateLeafWithRank0Tiles() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 0x18L, 0xf4L, Text.from("v0"), 1L);
    assertEquals(page.x(), 0x18L);
    assertEquals(page.y(), 0xf4L);
    assertEquals(page.xRank(), 0);
    assertEquals(page.yRank(), 0);
    assertEquals(page.xBase(), 0x18L);
    assertEquals(page.yBase(), 0xf4L);
    assertEquals(page.span(), 1);
    assertTrue(page.containsKey(Text.from("k0"), 0x18L, 0xf4L));
    assertEquals(page.get(Text.from("k0"), 0x18L, 0xf4L), Text.from("v0"));

    page = page.updated(Text.from("k1"), 0x14L, 0xf8L, Text.from("v1"), 1L);
    assertEquals(page.x(), 0xf000000000000001L);
    assertEquals(page.y(), 0xf00000000000000fL);
    assertEquals(page.xRank(), 4);
    assertEquals(page.yRank(), 4);
    assertEquals(page.xBase(), 0x10L);
    assertEquals(page.yBase(), 0xf0L);
    assertEquals(page.span(), 2);
    assertTrue(page.containsKey(Text.from("k0"), 0x18L, 0xf4L));
    assertTrue(page.containsKey(Text.from("k1"), 0x14L, 0xf8L));
    assertEquals(page.get(Text.from("k0"), 0x18L, 0xf4L), Text.from("v0"));
    assertEquals(page.get(Text.from("k1"), 0x14L, 0xf8L), Text.from("v1"));
  }

  @Test
  public void updateLeafWithRank4Tiles() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 4, 0x18L, 4, 0xf4L, Text.from("v0"), 1L);
    assertEquals(page.x(), 0xf000000000000001L);
    assertEquals(page.y(), 0xf00000000000000fL);
    assertEquals(page.xRank(), 4);
    assertEquals(page.yRank(), 4);
    assertEquals(page.xBase(), 0x10L);
    assertEquals(page.yBase(), 0xf0L);
    assertEquals(page.span(), 1);
    assertTrue(page.containsKey(Text.from("k0"), 4, 0x18L, 4, 0xf4L));
    assertEquals(page.get(Text.from("k0"), 4, 0x18L, 4, 0xf4L), Text.from("v0"));

    page = page.updated(Text.from("k1"), 4, 0x14L, 4, 0xf8L, Text.from("v1"), 1L);
    assertEquals(page.x(), 0xf000000000000001L);
    assertEquals(page.y(), 0xf00000000000000fL);
    assertEquals(page.xRank(), 4);
    assertEquals(page.yRank(), 4);
    assertEquals(page.xBase(), 0x10L);
    assertEquals(page.yBase(), 0xf0L);
    assertEquals(page.span(), 2);
    assertTrue(page.containsKey(Text.from("k0"), 4, 0x18L, 4, 0xf4L));
    assertTrue(page.containsKey(Text.from("k1"), 4, 0x14L, 4, 0xf8L));
    assertEquals(page.get(Text.from("k0"), 4, 0x18L, 4, 0xf4L), Text.from("v0"));
    assertEquals(page.get(Text.from("k1"), 4, 0x14L, 4, 0xf8L), Text.from("v1"));
  }

  @Test
  public void getAllInLeafWithRank0Tiles() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 2L, 2L, Text.from("v0"), 1L);
    page = page.updated(Text.from("k1"), 2L, 6L, Text.from("v1"), 1L);
    page = page.updated(Text.from("k2"), 6L, 2L, Text.from("v2"), 1L);
    page = page.updated(Text.from("k3"), 6L, 6L, Text.from("v3"), 1L);
    assertEquals(page.getAll(2L, 2L, 2L, 6L), Record.of().slot("k0", "v0").slot("k1", "v1"));
    assertEquals(page.getAll(1L, 1L, 3L, 7L), Record.of().slot("k0", "v0").slot("k1", "v1"));
    assertEquals(page.getAll(2L, 2L, 6L, 2L), Record.of().slot("k0", "v0").slot("k2", "v2"));
    assertEquals(page.getAll(1L, 1L, 7L, 3L), Record.of().slot("k0", "v0").slot("k2", "v2"));
    assertEquals(page.getAll(2L, 6L, 6L, 6L), Record.of().slot("k1", "v1").slot("k3", "v3"));
    assertEquals(page.getAll(1L, 5L, 7L, 7L), Record.of().slot("k1", "v1").slot("k3", "v3"));
    assertEquals(page.getAll(6L, 2L, 6L, 6L), Record.of().slot("k2", "v2").slot("k3", "v3"));
    assertEquals(page.getAll(5L, 1L, 7L, 7L), Record.of().slot("k2", "v2").slot("k3", "v3"));
    assertEquals(page.getAll(2L, 2L, 6L, 6L),
        Record.of().slot("k0", "v0").slot("k1", "v1").slot("k2", "v2").slot("k3", "v3"));
    assertEquals(page.getAll(1L, 1L, 7L, 7L),
        Record.of().slot("k0", "v0").slot("k1", "v1").slot("k2", "v2").slot("k3", "v3"));
  }

  @Test
  public void getAllInNodeWithRank0Tiles() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 2L, 2L, Text.from("v0"), 1L);
    page = page.updated(Text.from("k1"), 2L, 6L, Text.from("v1"), 1L);
    page = page.updated(Text.from("k2"), 6L, 2L, Text.from("v2"), 1L);
    page = page.updated(Text.from("k3"), 6L, 6L, Text.from("v3"), 1L);
    page = page.split(1L);
    assertEquals(page.getAll(2L, 2L, 2L, 6L), Record.of().slot("k0", "v0").slot("k1", "v1"));
    assertEquals(page.getAll(1L, 1L, 3L, 7L), Record.of().slot("k0", "v0").slot("k1", "v1"));
    assertEquals(page.getAll(2L, 2L, 6L, 2L), Record.of().slot("k0", "v0").slot("k2", "v2"));
    assertEquals(page.getAll(1L, 1L, 7L, 3L), Record.of().slot("k0", "v0").slot("k2", "v2"));
    assertEquals(page.getAll(2L, 6L, 6L, 6L), Record.of().slot("k1", "v1").slot("k3", "v3"));
    assertEquals(page.getAll(1L, 5L, 7L, 7L), Record.of().slot("k1", "v1").slot("k3", "v3"));
    assertEquals(page.getAll(6L, 2L, 6L, 6L), Record.of().slot("k2", "v2").slot("k3", "v3"));
    assertEquals(page.getAll(5L, 1L, 7L, 7L), Record.of().slot("k2", "v2").slot("k3", "v3"));
    assertEquals(page.getAll(2L, 2L, 6L, 6L),
        Record.of().slot("k0", "v0").slot("k1", "v1").slot("k2", "v2").slot("k3", "v3"));
    assertEquals(page.getAll(1L, 1L, 7L, 7L),
        Record.of().slot("k0", "v0").slot("k1", "v1").slot("k2", "v2").slot("k3", "v3"));
  }

  @Test
  public void splitXRank0Leaf() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 16L, 0L, Text.from("v0"), 1L);
    page = page.updated(Text.from("k1"), 16L, 1L, Text.from("v1"), 1L);
    page = page.updated(Text.from("k2"), 32L, 2L, Text.from("v2"), 1L);
    page = page.updated(Text.from("k3"), 32L, 3L, Text.from("v3"), 1L);
    page = page.split(1L);
    assertEquals(page.arity(), 2);
    assertEquals(page.x(), 0xfc00000000000000L);
    assertEquals(page.y(), 0xc000000000000000L);
    assertEquals(page.xRank(), 6);
    assertEquals(page.yRank(), 2);
    assertEquals(page.xBase(), 0L);
    assertEquals(page.yBase(), 0L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey(Text.from("k0"), 16L, 0L));
    assertTrue(page.containsKey(Text.from("k1"), 16L, 1L));
    assertTrue(page.containsKey(Text.from("k2"), 32L, 2L));
    assertTrue(page.containsKey(Text.from("k3"), 32L, 3L));
    assertEquals(page.get(Text.from("k0"), 16L, 0L), Text.from("v0"));
    assertEquals(page.get(Text.from("k1"), 16L, 1L), Text.from("v1"));
    assertEquals(page.get(Text.from("k2"), 32L, 2L), Text.from("v2"));
    assertEquals(page.get(Text.from("k3"), 32L, 3L), Text.from("v3"));

    final QTreePage page0 = page.getChildRef(0).page();
    assertEquals(page0.x(), 0x0000000000000010L);
    assertEquals(page0.y(), 0x8000000000000000L);
    assertEquals(page0.xRank(), 0);
    assertEquals(page0.yRank(), 1);
    assertEquals(page0.xBase(), 16L);
    assertEquals(page0.yBase(), 0L);
    assertEquals(page0.span(), 2);
    assertTrue(page0.containsKey(Text.from("k0"), 10L, 0L));
    assertTrue(page0.containsKey(Text.from("k1"), 10L, 1L));
    assertEquals(page0.get(Text.from("k0"), 10L, 0L), Text.from("v0"));
    assertEquals(page0.get(Text.from("k1"), 10L, 1L), Text.from("v1"));

    final QTreePage page1 = page.getChildRef(1).page();
    assertEquals(page1.x(), 0x0000000000000020L);
    assertEquals(page1.y(), 0x8000000000000001L);
    assertEquals(page1.xRank(), 0);
    assertEquals(page1.yRank(), 1);
    assertEquals(page1.xBase(), 32L);
    assertEquals(page1.yBase(), 2L);
    assertEquals(page1.span(), 2);
    assertTrue(page1.containsKey(Text.from("k2"), 0L, 2L));
    assertTrue(page1.containsKey(Text.from("k3"), 0L, 3L));
    assertEquals(page1.get(Text.from("k2"), 0L, 2L), Text.from("v2"));
    assertEquals(page1.get(Text.from("k3"), 0L, 3L), Text.from("v3"));
  }

  @Test
  public void splitYRank0Leaf() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 0L, 10L, Text.from("v0"), 1L);
    page = page.updated(Text.from("k1"), 1L, 10L, Text.from("v1"), 1L);
    page = page.updated(Text.from("k2"), 2L, 10L, Text.from("v2"), 1L);
    page = page.updated(Text.from("k3"), 3L, 10L, Text.from("v3"), 1L);
    page = page.split(1L);
    assertEquals(page.arity(), 2);
    assertEquals(page.x(), 0xc000000000000000L);
    assertEquals(page.y(), 0x000000000000000AL);
    assertEquals(page.xRank(), 2);
    assertEquals(page.yRank(), 0);
    assertEquals(page.xBase(), 0L);
    assertEquals(page.yBase(), 10L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey(Text.from("k0"), 0L, 10L));
    assertTrue(page.containsKey(Text.from("k1"), 1L, 10L));
    assertTrue(page.containsKey(Text.from("k2"), 2L, 10L));
    assertTrue(page.containsKey(Text.from("k3"), 3L, 10L));
    assertEquals(page.get(Text.from("k0"), 0L, 10L), Text.from("v0"));
    assertEquals(page.get(Text.from("k1"), 1L, 10L), Text.from("v1"));
    assertEquals(page.get(Text.from("k2"), 2L, 10L), Text.from("v2"));
    assertEquals(page.get(Text.from("k3"), 3L, 10L), Text.from("v3"));

    final QTreePage page0 = page.getChildRef(0).page();
    assertEquals(page0.x(), 0x8000000000000000L);
    assertEquals(page0.y(), 0x000000000000000AL);
    assertEquals(page0.xRank(), 1);
    assertEquals(page0.yRank(), 0);
    assertEquals(page0.xBase(), 0L);
    assertEquals(page0.yBase(), 10L);
    assertEquals(page0.span(), 2);
    assertTrue(page0.containsKey(Text.from("k0"), 0L, 10L));
    assertTrue(page0.containsKey(Text.from("k1"), 1L, 10L));
    assertEquals(page0.get(Text.from("k0"), 0L, 10L), Text.from("v0"));
    assertEquals(page0.get(Text.from("k1"), 1L, 10L), Text.from("v1"));

    final QTreePage page1 = page.getChildRef(1).page();
    assertEquals(page1.x(), 0x8000000000000001L);
    assertEquals(page1.y(), 0x000000000000000AL);
    assertEquals(page1.xRank(), 1);
    assertEquals(page1.yRank(), 0);
    assertEquals(page1.xBase(), 2L);
    assertEquals(page1.yBase(), 10L);
    assertEquals(page1.span(), 2);
    assertTrue(page1.containsKey(Text.from("k2"), 2L, 10L));
    assertTrue(page1.containsKey(Text.from("k3"), 3L, 10L));
    assertEquals(page1.get(Text.from("k2"), 2L, 10L), Text.from("v2"));
    assertEquals(page1.get(Text.from("k3"), 3L, 10L), Text.from("v3"));
  }

  @Test
  public void splitLeafWithRank0Tiles() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 2L, 2L, Text.from("v0"), 1L);
    page = page.updated(Text.from("k1"), 2L, 6L, Text.from("v1"), 1L);
    page = page.updated(Text.from("k2"), 6L, 2L, Text.from("v2"), 1L);
    page = page.updated(Text.from("k3"), 6L, 6L, Text.from("v3"), 1L);
    page = page.split(1L);
    assertEquals(page.arity(), 4);
    assertEquals(page.x(), 0xe000000000000000L);
    assertEquals(page.y(), 0xe000000000000000L);
    assertEquals(page.xRank(), 3);
    assertEquals(page.yRank(), 3);
    assertEquals(page.xBase(), 0L);
    assertEquals(page.yBase(), 0L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey(Text.from("k0"), 2L, 2L));
    assertTrue(page.containsKey(Text.from("k1"), 2L, 6L));
    assertTrue(page.containsKey(Text.from("k2"), 6L, 2L));
    assertTrue(page.containsKey(Text.from("k3"), 6L, 6L));
    assertFalse(page.containsKey(Text.from("k0"), 0L, 0L));
    assertFalse(page.containsKey(Text.from("k1"), 0L, 0L));
    assertFalse(page.containsKey(Text.from("k2"), 0L, 0L));
    assertFalse(page.containsKey(Text.from("k3"), 0L, 0L));
    assertEquals(page.get(Text.from("k0"), 2L, 2L), Text.from("v0"));
    assertEquals(page.get(Text.from("k1"), 2L, 6L), Text.from("v1"));
    assertEquals(page.get(Text.from("k2"), 6L, 2L), Text.from("v2"));
    assertEquals(page.get(Text.from("k3"), 6L, 6L), Text.from("v3"));

    final QTreePage page0 = page.getChildRef(0).page();
    assertEquals(page0.x(), 2L);
    assertEquals(page0.y(), 2L);
    assertEquals(page0.xRank(), 0);
    assertEquals(page0.yRank(), 0);
    assertEquals(page0.xBase(), 2L);
    assertEquals(page0.yBase(), 2L);
    assertEquals(page0.span(), 1);
    assertTrue(page0.containsKey(Text.from("k0"), 2L, 2L));
    assertEquals(page0.get(Text.from("k0"), 2L, 2L), Text.from("v0"));

    final QTreePage page1 = page.getChildRef(1).page();
    assertEquals(page1.x(), 2L);
    assertEquals(page1.y(), 6L);
    assertEquals(page1.xRank(), 0);
    assertEquals(page1.yRank(), 0);
    assertEquals(page1.xBase(), 2L);
    assertEquals(page1.yBase(), 6L);
    assertEquals(page1.span(), 1);
    assertTrue(page1.containsKey(Text.from("k1"), 2L, 6L));
    assertEquals(page1.get(Text.from("k1"), 2L, 6L), Text.from("v1"));

    final QTreePage page2 = page.getChildRef(2).page();
    assertEquals(page2.x(), 6L);
    assertEquals(page2.y(), 2L);
    assertEquals(page2.xRank(), 0);
    assertEquals(page2.yRank(), 0);
    assertEquals(page2.xBase(), 6L);
    assertEquals(page2.yBase(), 2L);
    assertEquals(page2.span(), 1);
    assertTrue(page2.containsKey(Text.from("k2"), 6L, 2L));
    assertEquals(page2.get(Text.from("k2"), 6L, 2L), Text.from("v2"));

    final QTreePage page3 = page.getChildRef(3).page();
    assertEquals(page3.x(), 6L);
    assertEquals(page3.y(), 6L);
    assertEquals(page3.xRank(), 0);
    assertEquals(page3.yRank(), 0);
    assertEquals(page3.xBase(), 6L);
    assertEquals(page3.yBase(), 6L);
    assertEquals(page3.span(), 1);
    assertTrue(page3.containsKey(Text.from("k3"), 6L, 6L));
    assertEquals(page3.get(Text.from("k3"), 6L, 6L), Text.from("v3"));
  }

  @Test
  public void splitNodeWithRank0Tiles() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 2L, 2L, Text.from("v0"), 1L);
    page = page.updated(Text.from("k1"), 2L, 6L, Text.from("v1"), 1L);
    page = page.updated(Text.from("k2"), 6L, 2L, Text.from("v2"), 1L);
    page = page.updated(Text.from("k3"), 6L, 6L, Text.from("v3"), 1L);
    page = page.split(1L);
    page = page.split(1L);
    assertEquals(page.arity(), 4);
    assertEquals(page.x(), 0xe000000000000000L);
    assertEquals(page.y(), 0xe000000000000000L);
    assertEquals(page.xRank(), 3);
    assertEquals(page.yRank(), 3);
    assertEquals(page.xBase(), 0L);
    assertEquals(page.yBase(), 0L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey(Text.from("k0"), 2L, 2L));
    assertTrue(page.containsKey(Text.from("k1"), 2L, 6L));
    assertTrue(page.containsKey(Text.from("k2"), 6L, 2L));
    assertTrue(page.containsKey(Text.from("k3"), 6L, 6L));
    assertFalse(page.containsKey(Text.from("k0"), 0L, 0L));
    assertFalse(page.containsKey(Text.from("k1"), 0L, 0L));
    assertFalse(page.containsKey(Text.from("k2"), 0L, 0L));
    assertFalse(page.containsKey(Text.from("k3"), 0L, 0L));
    assertEquals(page.get(Text.from("k0"), 2L, 2L), Text.from("v0"));
    assertEquals(page.get(Text.from("k1"), 2L, 6L), Text.from("v1"));
    assertEquals(page.get(Text.from("k2"), 6L, 2L), Text.from("v2"));
    assertEquals(page.get(Text.from("k3"), 6L, 6L), Text.from("v3"));

    final QTreePage page0 = page.getChildRef(0).page();
    assertEquals(page0.arity(), 1);
    assertEquals(page0.x(), 2L);
    assertEquals(page0.y(), 2L);
    assertEquals(page0.xRank(), 0);
    assertEquals(page0.yRank(), 0);
    assertEquals(page0.xBase(), 2L);
    assertEquals(page0.yBase(), 2L);
    assertEquals(page0.span(), 1);
    assertTrue(page0.containsKey(Text.from("k0"), 2L, 2L));
    assertEquals(page0.get(Text.from("k0"), 2L, 2L), Text.from("v0"));

    final QTreePage page1 = page.getChildRef(1).page();
    assertEquals(page1.arity(), 1);
    assertEquals(page1.x(), 2L);
    assertEquals(page1.y(), 6L);
    assertEquals(page1.xRank(), 0);
    assertEquals(page1.yRank(), 0);
    assertEquals(page1.xBase(), 2L);
    assertEquals(page1.yBase(), 6L);
    assertEquals(page1.span(), 1);
    assertTrue(page1.containsKey(Text.from("k1"), 2L, 6L));
    assertEquals(page1.get(Text.from("k1"), 2L, 6L), Text.from("v1"));

    final QTreePage page2 = page.getChildRef(2).page();
    assertEquals(page2.arity(), 1);
    assertEquals(page2.x(), 6L);
    assertEquals(page2.y(), 2L);
    assertEquals(page2.xRank(), 0);
    assertEquals(page2.yRank(), 0);
    assertEquals(page2.xBase(), 6L);
    assertEquals(page2.yBase(), 2L);
    assertEquals(page2.span(), 1);
    assertTrue(page2.containsKey(Text.from("k2"), 6L, 2L));
    assertEquals(page2.get(Text.from("k2"), 6L, 2L), Text.from("v2"));

    final QTreePage page3 = page.getChildRef(3).page();
    assertEquals(page3.arity(), 1);
    assertEquals(page3.x(), 6L);
    assertEquals(page3.y(), 6L);
    assertEquals(page3.xRank(), 0);
    assertEquals(page3.yRank(), 0);
    assertEquals(page3.xBase(), 6L);
    assertEquals(page3.yBase(), 6L);
    assertEquals(page3.span(), 1);
    assertTrue(page3.containsKey(Text.from("k3"), 6L, 6L));
    assertEquals(page3.get(Text.from("k3"), 6L, 6L), Text.from("v3"));
  }

  @Test
  public void splitLeafWithNonOverlappingMixedRankTiles() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 0, 0x5cL, 0, 0x5cL, Text.from("v0"), 1L);
    page = page.updated(Text.from("k1"), 0, 0x5cL, 0, 0x7cL, Text.from("v1"), 1L);
    page = page.updated(Text.from("k2"), 2, 0x7cL, 2, 0x5cL, Text.from("v2"), 1L);
    page = page.split(1L);
    assertEquals(page.arity(), 3);
    assertEquals(page.x(), 0xfc00000000000001L);
    assertEquals(page.y(), 0xfc00000000000001L);
    assertEquals(page.xRank(), 6);
    assertEquals(page.yRank(), 6);
    assertEquals(page.xBase(), 0x40L);
    assertEquals(page.yBase(), 0x40L);
    assertEquals(page.span(), 3);
    assertTrue(page.containsKey(Text.from("k0"), 0, 0x5cL, 0, 0x5cL));
    assertTrue(page.containsKey(Text.from("k1"), 0, 0x5cL, 0, 0x7cL));
    assertTrue(page.containsKey(Text.from("k2"), 2, 0x7cL, 2, 0x5cL));
    assertFalse(page.containsKey(Text.from("k0"), 0, 0x1cL, 0, 0x1cL));
    assertFalse(page.containsKey(Text.from("k1"), 0, 0x1cL, 0, 0x3cL));
    assertFalse(page.containsKey(Text.from("k2"), 2, 0x30L, 2, 0x10L));
    assertEquals(page.get(Text.from("k0"), 0, 0x5cL, 0, 0x5cL), Text.from("v0"));
    assertEquals(page.get(Text.from("k1"), 0, 0x5cL, 0, 0x7cL), Text.from("v1"));
    assertEquals(page.get(Text.from("k2"), 2, 0x7cL, 2, 0x5cL), Text.from("v2"));

    final QTreePage page0 = page.getChildRef(0).page();
    assertEquals(page0.x(), 0x5cL);
    assertEquals(page0.y(), 0x5cL);
    assertEquals(page0.xRank(), 0);
    assertEquals(page0.yRank(), 0);
    assertEquals(page0.xBase(), 0x5cL);
    assertEquals(page0.yBase(), 0x5cL);
    assertEquals(page0.span(), 1);
    assertTrue(page0.containsKey(Text.from("k0"), 0, 0x5cL, 0, 0x5cL));
    assertEquals(page0.get(Text.from("k0"), 0, 0x5cL, 0, 0x5cL), Text.from("v0"));

    final QTreePage page1 = page.getChildRef(1).page();
    assertEquals(page1.x(), 0x5cL);
    assertEquals(page1.y(), 0x7cL);
    assertEquals(page1.xRank(), 0);
    assertEquals(page1.yRank(), 0);
    assertEquals(page1.xBase(), 0x5cL);
    assertEquals(page1.yBase(), 0x7cL);
    assertEquals(page1.span(), 1);
    assertTrue(page1.containsKey(Text.from("k1"), 0, 0x5cL, 0, 0x7cL));
    assertEquals(page1.get(Text.from("k1"), 0, 0x5cL, 0, 0x7cL), Text.from("v1"));

    final QTreePage page2 = page.getChildRef(2).page();
    assertEquals(page2.x(), 0xc00000000000001fL);
    assertEquals(page2.y(), 0xc000000000000017L);
    assertEquals(page2.xRank(), 2);
    assertEquals(page2.yRank(), 2);
    assertEquals(page2.xBase(), 0x7cL);
    assertEquals(page2.yBase(), 0x5cL);
    assertEquals(page2.span(), 1);
    assertTrue(page2.containsKey(Text.from("k2"), 2, 0x7cL, 2, 0x5cL));
    assertEquals(page2.get(Text.from("k2"), 2, 0x7cL, 2, 0x5cL), Text.from("v2"));
  }

  @Test
  public void splitNodeWithNonOverlappingMixedRankTiles() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 0, 0x5cL, 0, 0x5cL, Text.from("v0"), 1L);
    page = page.updated(Text.from("k1"), 0, 0x5cL, 0, 0x7cL, Text.from("v1"), 1L);
    page = page.updated(Text.from("k2"), 2, 0x7cL, 2, 0x5cL, Text.from("v2"), 1L);
    page = page.split(1L);
    page = page.split(1L);
    assertEquals(page.arity(), 3);
    assertEquals(page.x(), 0xfc00000000000001L);
    assertEquals(page.y(), 0xfc00000000000001L);
    assertEquals(page.xRank(), 6);
    assertEquals(page.yRank(), 6);
    assertEquals(page.xBase(), 0x40L);
    assertEquals(page.yBase(), 0x40L);
    assertEquals(page.span(), 3);
    assertTrue(page.containsKey(Text.from("k0"), 0, 0x5cL, 0, 0x5cL));
    assertTrue(page.containsKey(Text.from("k1"), 0, 0x5cL, 0, 0x7cL));
    assertTrue(page.containsKey(Text.from("k2"), 2, 0x7cL, 2, 0x5cL));
    assertFalse(page.containsKey(Text.from("k0"), 0, 0x1cL, 0, 0x1cL));
    assertFalse(page.containsKey(Text.from("k1"), 0, 0x1cL, 0, 0x3cL));
    assertFalse(page.containsKey(Text.from("k2"), 2, 0x30L, 2, 0x10L));
    assertEquals(page.get(Text.from("k0"), 0, 0x5cL, 0, 0x5cL), Text.from("v0"));
    assertEquals(page.get(Text.from("k1"), 0, 0x5cL, 0, 0x7cL), Text.from("v1"));
    assertEquals(page.get(Text.from("k2"), 2, 0x7cL, 2, 0x5cL), Text.from("v2"));

    final QTreePage page0 = page.getChildRef(0).page();
    assertEquals(page0.x(), 0x5cL);
    assertEquals(page0.y(), 0x5cL);
    assertEquals(page0.xRank(), 0);
    assertEquals(page0.yRank(), 0);
    assertEquals(page0.xBase(), 0x5cL);
    assertEquals(page0.yBase(), 0x5cL);
    assertEquals(page0.span(), 1);
    assertTrue(page0.containsKey(Text.from("k0"), 0, 0x5cL, 0, 0x5cL));
    assertEquals(page0.get(Text.from("k0"), 0, 0x5cL, 0, 0x5cL), Text.from("v0"));

    final QTreePage page1 = page.getChildRef(1).page();
    assertEquals(page1.x(), 0x5cL);
    assertEquals(page1.y(), 0x7cL);
    assertEquals(page1.xRank(), 0);
    assertEquals(page1.yRank(), 0);
    assertEquals(page1.xBase(), 0x5cL);
    assertEquals(page1.yBase(), 0x7cL);
    assertEquals(page1.span(), 1);
    assertTrue(page1.containsKey(Text.from("k1"), 0, 0x5cL, 0, 0x7cL));
    assertEquals(page1.get(Text.from("k1"), 0, 0x5cL, 0, 0x7cL), Text.from("v1"));

    final QTreePage page2 = page.getChildRef(2).page();
    assertEquals(page2.x(), 0xc00000000000001fL);
    assertEquals(page2.y(), 0xc000000000000017L);
    assertEquals(page2.xRank(), 2);
    assertEquals(page2.yRank(), 2);
    assertEquals(page2.xBase(), 0x7cL);
    assertEquals(page2.yBase(), 0x5cL);
    assertEquals(page2.span(), 1);
    assertTrue(page2.containsKey(Text.from("k2"), 2, 0x7cL, 2, 0x5cL));
    assertEquals(page2.get(Text.from("k2"), 2, 0x7cL, 2, 0x5cL), Text.from("v2"));
  }

  @Test
  public void splitLeafWithXOverlappingTiles() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 6, 0x40L, 2, 0x5cL, Text.from("v0"), 1L);
    page = page.updated(Text.from("k1"), 6, 0x40L, 2, 0x7cL, Text.from("v1"), 1L);
    page = page.updated(Text.from("k2"), 0, 0x7cL, 0, 0x5cL, Text.from("v2"), 1L);
    page = page.updated(Text.from("k3"), 0, 0x7cL, 0, 0x7cL, Text.from("v3"), 1L);
    page = page.split(1L);
    assertEquals(page.arity(), 2);
    assertEquals(page.x(), 0xfc00000000000001L);
    assertEquals(page.y(), 0xfc00000000000001L);
    assertEquals(page.xRank(), 6);
    assertEquals(page.yRank(), 6);
    assertEquals(page.xBase(), 0x40L);
    assertEquals(page.yBase(), 0x40L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey(Text.from("k0"), 6, 0x40L, 2, 0x5cL));
    assertTrue(page.containsKey(Text.from("k1"), 6, 0x40L, 2, 0x7cL));
    assertTrue(page.containsKey(Text.from("k2"), 0, 0x7cL, 0, 0x5cL));
    assertTrue(page.containsKey(Text.from("k3"), 0, 0x7cL, 0, 0x7cL));
    assertEquals(page.get(Text.from("k0"), 6, 0x40L, 2, 0x5cL), Text.from("v0"));
    assertEquals(page.get(Text.from("k1"), 6, 0x40L, 2, 0x7cL), Text.from("v1"));
    assertEquals(page.get(Text.from("k2"), 0, 0x7cL, 0, 0x5cL), Text.from("v2"));
    assertEquals(page.get(Text.from("k3"), 0, 0x7cL, 0, 0x7cL), Text.from("v3"));

    final QTreePage page0 = page.getChildRef(0).page();
    assertEquals(page0.x(), 0xfc00000000000001L);
    assertEquals(page0.y(), 0xc000000000000017L);
    assertEquals(page0.xRank(), 6);
    assertEquals(page0.yRank(), 2);
    assertEquals(page0.xBase(), 0x40L);
    assertEquals(page0.yBase(), 0x5cL);
    assertEquals(page0.span(), 2);
    assertTrue(page0.containsKey(Text.from("k0"), 6, 0x40L, 2, 0x5cL));
    assertTrue(page0.containsKey(Text.from("k2"), 0, 0x7cL, 0, 0x5cL));
    assertEquals(page0.get(Text.from("k0"), 6, 0x40L, 2, 0x5cL), Text.from("v0"));
    assertEquals(page0.get(Text.from("k2"), 0, 0x7cL, 0, 0x5cL), Text.from("v2"));

    final QTreePage page1 = page.getChildRef(1).page();
    assertEquals(page1.x(), 0xfc00000000000001L);
    assertEquals(page1.y(), 0xc00000000000001fL);
    assertEquals(page1.xRank(), 6);
    assertEquals(page1.yRank(), 2);
    assertEquals(page1.xBase(), 0x40L);
    assertEquals(page1.yBase(), 0x7cL);
    assertEquals(page1.span(), 2);
    assertTrue(page1.containsKey(Text.from("k1"), 6, 0x40L, 2, 0x7cL));
    assertTrue(page1.containsKey(Text.from("k3"), 0, 0x7cL, 0, 0x7cL));
    assertEquals(page1.get(Text.from("k1"), 6, 0x40L, 2, 0x7cL), Text.from("v1"));
    assertEquals(page1.get(Text.from("k3"), 0, 0x7cL, 0, 0x7cL), Text.from("v3"));
  }

  @Test
  public void splitLeafWithYOverlappingTiles() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 2, 0x5cL, 6, 0x40L, Text.from("v0"), 1L);
    page = page.updated(Text.from("k1"), 0, 0x5cL, 0, 0x7cL, Text.from("v1"), 1L);
    page = page.updated(Text.from("k2"), 2, 0x7cL, 6, 0x40L, Text.from("v2"), 1L);
    page = page.updated(Text.from("k3"), 0, 0x7cL, 0, 0x5cL, Text.from("v3"), 1L);
    page = page.split(1L);
    assertEquals(page.arity(), 2);
    assertEquals(page.x(), 0xfc00000000000001L);
    assertEquals(page.y(), 0xfc00000000000001L);
    assertEquals(page.xRank(), 6);
    assertEquals(page.yRank(), 6);
    assertEquals(page.xBase(), 0x40L);
    assertEquals(page.yBase(), 0x40L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey(Text.from("k0"), 2, 0x5cL, 6, 0x40L));
    assertTrue(page.containsKey(Text.from("k1"), 0, 0x5cL, 0, 0x7cL));
    assertTrue(page.containsKey(Text.from("k2"), 2, 0x7cL, 6, 0x40L));
    assertTrue(page.containsKey(Text.from("k3"), 0, 0x7cL, 0, 0x5cL));
    assertEquals(page.get(Text.from("k0"), 2, 0x5cL, 6, 0x40L), Text.from("v0"));
    assertEquals(page.get(Text.from("k1"), 0, 0x5cL, 0, 0x7cL), Text.from("v1"));
    assertEquals(page.get(Text.from("k2"), 2, 0x7cL, 6, 0x40L), Text.from("v2"));
    assertEquals(page.get(Text.from("k3"), 0, 0x7cL, 0, 0x5cL), Text.from("v3"));

    final QTreePage page0 = page.getChildRef(0).page();
    assertEquals(page0.x(), 0xc000000000000017L);
    assertEquals(page0.y(), 0xfc00000000000001L);
    assertEquals(page0.xRank(), 2);
    assertEquals(page0.yRank(), 6);
    assertEquals(page0.xBase(), 0x5cL);
    assertEquals(page0.yBase(), 0x40L);
    assertEquals(page0.span(), 2);
    assertTrue(page0.containsKey(Text.from("k0"), 2, 0x5cL, 6, 0x40L));
    assertTrue(page0.containsKey(Text.from("k1"), 0, 0x5cL, 0, 0x7cL));
    assertEquals(page0.get(Text.from("k0"), 2, 0x5cL, 6, 0x40L), Text.from("v0"));
    assertEquals(page0.get(Text.from("k1"), 0, 0x5cL, 0, 0x7cL), Text.from("v1"));

    final QTreePage page1 = page.getChildRef(1).page();
    assertEquals(page1.x(), 0xc00000000000001fL);
    assertEquals(page1.y(), 0xfc00000000000001L);
    assertEquals(page1.xRank(), 2);
    assertEquals(page1.yRank(), 6);
    assertEquals(page1.xBase(), 0x7cL);
    assertEquals(page1.yBase(), 0x40L);
    assertEquals(page1.span(), 2);
    assertTrue(page1.containsKey(Text.from("k2"), 2, 0x7cL, 6, 0x40L));
    assertTrue(page1.containsKey(Text.from("k3"), 0, 0x7cL, 0, 0x7cL));
    assertEquals(page1.get(Text.from("k2"), 2, 0x7cL, 6, 0x40L), Text.from("v2"));
    assertEquals(page1.get(Text.from("k3"), 0, 0x7cL, 0, 0x7cL), Text.from("v3"));
  }

  @Test
  public void splitLeafWithXYOverlappingTiles() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 6, 0xc0L, 2, 0x8cL, Text.from("v0"), 1L);
    page = page.updated(Text.from("k1"), 2, 0x8cL, 6, 0xc0L, Text.from("v1"), 1L);
    page = page.updated(Text.from("k2"), 0, 0x80L, 0, 0x80L, Text.from("v2"), 1L);
    page = page.split(1L);
    assertEquals(page.arity(), 3);
    assertEquals(page.x(), 0xfe00000000000001L);
    assertEquals(page.y(), 0xfe00000000000001L);
    assertEquals(page.xRank(), 7);
    assertEquals(page.yRank(), 7);
    assertEquals(page.xBase(), 0x80L);
    assertEquals(page.yBase(), 0x80L);
    assertEquals(page.span(), 3);
    assertTrue(page.containsKey(Text.from("k0"), 6, 0xc0L, 2, 0x8cL));
    assertTrue(page.containsKey(Text.from("k1"), 2, 0x8cL, 6, 0xc0L));
    assertTrue(page.containsKey(Text.from("k2"), 0, 0x80L, 0, 0x80L));
    assertEquals(page.get(Text.from("k0"), 6, 0xc0L, 2, 0x8cL), Text.from("v0"));
    assertEquals(page.get(Text.from("k1"), 2, 0x8cL, 6, 0xc0L), Text.from("v1"));
    assertEquals(page.get(Text.from("k2"), 0, 0x80L, 0, 0x80L), Text.from("v2"));

    final QTreePage page0 = page.getChildRef(0).page();
    assertEquals(page0.x(), 0x0000000000000080L);
    assertEquals(page0.y(), 0x0000000000000080L);
    assertEquals(page0.xRank(), 0);
    assertEquals(page0.yRank(), 0);
    assertEquals(page0.xBase(), 0x80L);
    assertEquals(page0.yBase(), 0x80L);
    assertEquals(page0.span(), 1);
    assertTrue(page0.containsKey(Text.from("k2"), 3, 0x80L, 5, 0x80L));
    assertEquals(page0.get(Text.from("k2"), 0, 0x80L, 0, 0x80L), Text.from("v2"));

    final QTreePage page1 = page.getChildRef(1).page();
    assertEquals(page1.x(), 0xc000000000000023L);
    assertEquals(page1.y(), 0xfc00000000000003L);
    assertEquals(page1.xRank(), 2);
    assertEquals(page1.yRank(), 6);
    assertEquals(page1.xBase(), 0x8cL);
    assertEquals(page1.yBase(), 0xc0L);
    assertEquals(page1.span(), 1);
    assertTrue(page1.containsKey(Text.from("k1"), 2, 0x8cL, 6, 0xc0L));
    assertEquals(page1.get(Text.from("k1"), 2, 0x8cL, 6, 0xc0L), Text.from("v1"));

    final QTreePage page2 = page.getChildRef(2).page();
    assertEquals(page2.x(), 0xfc00000000000003L);
    assertEquals(page2.y(), 0xc000000000000023L);
    assertEquals(page2.xRank(), 6);
    assertEquals(page2.yRank(), 2);
    assertEquals(page2.xBase(), 0xc0L);
    assertEquals(page2.yBase(), 0x8cL);
    assertEquals(page2.span(), 1);
    assertTrue(page2.containsKey(Text.from("k0"), 6, 0xc0L, 2, 0x8cL));
    assertEquals(page2.get(Text.from("k0"), 6, 0xc0L, 2, 0x8cL), Text.from("v0"));
  }

  @Test
  public void splitLeafWithLiftedTiles() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    page = page.updated(Text.from("k0"), 6, 0x40L, 2, 0x5cL, Text.from("v0"), 1L);
    page = page.updated(Text.from("k1"), 2, 0x5cL, 6, 0x40L, Text.from("v1"), 1L);
    page = page.updated(Text.from("k2"), 0, 0x5cL, 0, 0x7cL, Text.from("v2"), 1L);
    page = page.updated(Text.from("k3"), 0, 0x7cL, 0, 0x5cL, Text.from("v3"), 1L);
    page = page.split(1L);
    assertEquals(page.arity(), 3);
    assertEquals(page.x(), 0xfc00000000000001L);
    assertEquals(page.y(), 0xfc00000000000001L);
    assertEquals(page.xRank(), 6);
    assertEquals(page.yRank(), 6);
    assertEquals(page.xBase(), 0x40L);
    assertEquals(page.yBase(), 0x40L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey(Text.from("k0"), 6, 0x40L, 2, 0x5cL));
    assertTrue(page.containsKey(Text.from("k1"), 2, 0x5cL, 6, 0x40L));
    assertTrue(page.containsKey(Text.from("k2"), 0, 0x5cL, 0, 0x7cL));
    assertTrue(page.containsKey(Text.from("k3"), 0, 0x7cL, 0, 0x5cL));
    assertEquals(page.get(Text.from("k0"), 6, 0x40L, 2, 0x5cL), Text.from("v0"));
    assertEquals(page.get(Text.from("k1"), 2, 0x5cL, 6, 0x40L), Text.from("v1"));
    assertEquals(page.get(Text.from("k2"), 0, 0x5cL, 0, 0x7cL), Text.from("v2"));
    assertEquals(page.get(Text.from("k3"), 0, 0x7cL, 0, 0x5cL), Text.from("v3"));

    final QTreePage page0 = page.getChildRef(0).page();
    assertEquals(page0.x(), 0xc000000000000017L);
    assertEquals(page0.y(), 0xfc00000000000001L);
    assertEquals(page0.xRank(), 2);
    assertEquals(page0.yRank(), 6);
    assertEquals(page0.xBase(), 0x5cL);
    assertEquals(page0.yBase(), 0x40L);
    assertEquals(page0.span(), 2);
    assertTrue(page0.containsKey(Text.from("k1"), 2, 0x5cL, 6, 0x40L));
    assertTrue(page0.containsKey(Text.from("k2"), 0, 0x5cL, 0, 0x7cL));
    assertEquals(page0.get(Text.from("k1"), 2, 0x5cL, 6, 0x40L), Text.from("v1"));
    assertEquals(page0.get(Text.from("k2"), 0, 0x5cL, 0, 0x7cL), Text.from("v2"));

    final QTreePage page1 = page.getChildRef(1).page();
    assertEquals(page1.x(), 0x000000000000007cL);
    assertEquals(page1.y(), 0x000000000000005cL);
    assertEquals(page1.xRank(), 0);
    assertEquals(page1.yRank(), 0);
    assertEquals(page1.xBase(), 0x7cL);
    assertEquals(page1.yBase(), 0x5cL);
    assertEquals(page1.span(), 1);
    assertTrue(page1.containsKey(Text.from("k3"), 0, 0x7cL, 0, 0x5cL));
    assertEquals(page1.get(Text.from("k3"), 0, 0x7cL, 0, 0x5cL), Text.from("v3"));
  }

  @Test
  public void splitPackedRank0Leaf() {
    final PageContext pageContext = new PageContext();
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    for (long i = 0L; i < 64L; i += 1L) {
      for (long j = 0L; j < 64L; j += 1L) {
        page = page.updated(Record.of(i, j), i, j, Record.of(-j, -i), 1L);
      }
    }
    page = page.split(1L);
    assertEquals(page.arity(), 4);
    assertEquals(page.x(), 0xfc00000000000000L);
    assertEquals(page.y(), 0xfc00000000000000L);
    assertEquals(page.xRank(), 6);
    assertEquals(page.yRank(), 6);
    assertEquals(page.xBase(), 0L);
    assertEquals(page.yBase(), 0L);
    assertEquals(page.span(), 4096);
    for (long i = 0L; i < 64L; i += 1L) {
      for (long j = 0L; j < 64L; j += 1L) {
        assertTrue(page.containsKey(Record.of(i, j), i, j), "i: " + i + "; j: " + j);
        assertEquals(page.get(Record.of(i, j), i, j), Record.of(-j, -i), "i: " + i + "; j: " + j);
      }
    }
  }

  @Test(groups = {"slow"})
  public void testUniformRank00Nodes() {
    testUniformRankNodes(0, 0, 32L);
  }

  @Test(groups = {"slow"})
  public void testUniformRank11Nodes() {
    testUniformRankNodes(1, 1, 32L);
  }

  @Test(groups = {"slow"})
  public void testUniformRank21Nodes() {
    testUniformRankNodes(2, 1, 32L);
  }

  @Test(groups = {"slow"})
  public void testNonUniformRankNodes() {
    testNonUniformRankNodes(32L, false);
  }

  @Test(groups = {"slow"})
  public void testNonUniformZigZagRankNodes() {
    testNonUniformRankNodes(32L, true);
  }

  void testUniformRankNodes(int xRank, int yRank, long size) {
    for (long width = 1L; width <= size; width <<= 1) {
      for (long xSpan = 1L; xSpan <= width; xSpan <<= 1) {
        for (long ySpan = 1L; ySpan <= width; ySpan <<= 1) {
          for (long xStep = 1L; xStep <= xSpan; xStep <<= 1) {
            for (long yStep = 1L; yStep <= ySpan; yStep <<= 1) {
              for (int splitArity = 4; splitArity <= Math.max(4, width); splitArity <<= 1) {
                System.out.println("testing width: " + width
                    + "; xSpan: " + xSpan + "; ySpan: " + ySpan
                    + "; xStep: " + xStep + "; yStep: " + yStep
                    + "; xRank: " + xRank + "; yRank: " + yRank
                    + "; splitArity: " + splitArity + " ...");
                testUniformRankNodes(0L, 0L, width, width, xSpan, ySpan,
                                     xStep, yStep, xRank, yRank, splitArity);
              }
            }
          }
        }
      }
    }
  }

  void testUniformRankNodes(long xMin, long yMin, long xMax, long yMax,
                            long xSpan, long ySpan, long xStep, long yStep,
                            int xRank, int yRank, final int splitArity) {
    final PageContext pageContext = new PageContext() {
      @Override
      public boolean pageShouldSplit(Page page) {
        return page.arity() > splitArity;
      }
      @Override
      public boolean pageShouldMerge(Page page) {
        return page.arity() < (splitArity >> 1);
      }
    };
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    long span = 0L;
    // Insert
    for (long x0 = xMin; x0 < xMax; x0 += xSpan) {
      for (long y0 = yMin; y0 < yMax; y0 += ySpan) {
        for (long x1 = 0L; x1 < xSpan; x1 += xStep) {
          final long xi = x0 + x1;
          for (long y1 = 0L; y1 < ySpan; y1 += yStep) {
            final long yi = y0 + y1;
            final long x = BitInterval.from(xRank, xi << xRank);
            final long y = BitInterval.from(yRank, yi << yRank);
            page = page.updated(Record.of(xi, yi), x, y, Record.of(-yi, -xi), 1L).balanced(1L);
            span += 1L;
            assertEquals(page.span(), span);
            assertTrue(page.containsKey(Record.of(xi, yi), x, y), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
          }
        }
      }
    }
    // Search
    for (long x0 = xMin; x0 < xMax; x0 += xSpan) {
      for (long y0 = yMin; y0 < yMax; y0 += ySpan) {
        for (long x1 = 0L; x1 < xSpan; x1 += xStep) {
          final long xi = x0 + x1;
          for (long y1 = 0L; y1 < ySpan; y1 += yStep) {
            final long yi = y0 + y1;
            final long x = BitInterval.from(xRank, xi << xRank);
            final long y = BitInterval.from(yRank, yi << yRank);
            assertTrue(page.containsKey(Record.of(xi, yi), x, y), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
            assertEquals(page.get(Record.of(xi, yi), x, y), Record.of(-yi, -xi), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
          }
        }
      }
    }
    // Remove
    for (long x0 = xMin; x0 < xMax; x0 += xSpan) {
      for (long y0 = yMin; y0 < yMax; y0 += ySpan) {
        for (long x1 = 0L; x1 < xSpan; x1 += xStep) {
          final long xi = x0 + x1;
          for (long y1 = 0L; y1 < ySpan; y1 += yStep) {
            final long yi = y0 + y1;
            final long x = BitInterval.from(xRank, xi << xRank);
            final long y = BitInterval.from(yRank, yi << yRank);
            page = page.removed(Record.of(xi, yi), x, y, 1L).balanced(1L);
            span -= 1L;
            assertEquals(page.span(), span);
            assertFalse(page.containsKey(Record.of(xi, yi), x, y), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
          }
        }
      }
    }
  }

  void testNonUniformRankNodes(long size, boolean zigzag) {
    for (long width = 1L; width <= size; width <<= 1) {
      for (long xSpan = 1L; xSpan <= width; xSpan <<= 1) {
        for (long ySpan = 1L; ySpan <= width; ySpan <<= 1) {
          for (long xStep = 1L; xStep <= xSpan; xStep <<= 1) {
            for (long yStep = 1L; yStep <= ySpan; yStep <<= 1) {
              for (int splitArity = 4; splitArity <= Math.max(4, width); splitArity <<= 1) {
                System.out.println("testing width: " + width
                    + "; xSpan: " + xSpan + "; ySpan: " + ySpan
                    + "; xStep: " + xStep + "; yStep: " + yStep
                    + "; splitArity: " + splitArity + "; zigzag: " + zigzag + " ...");
                testNonUniformRankNodes(0L, 0L, width, width, xSpan, ySpan,
                                        xStep, yStep, splitArity, zigzag);
              }
            }
          }
        }
      }
    }
  }

  void testNonUniformRankNodes(long xMin, long yMin, long xMax, long yMax,
                               long xSpan, long ySpan, long xStep, long yStep,
                               final int splitArity, boolean zigzag) {
    final PageContext pageContext = new PageContext() {
      @Override
      public boolean pageShouldSplit(Page page) {
        return page.arity() > splitArity;
      }
      @Override
      public boolean pageShouldMerge(Page page) {
        return page.arity() < (splitArity >> 1);
      }
    };
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    long span = 0L;
    // Insert
    for (long x0 = xMin; x0 < xMax; x0 += xSpan) {
      for (long y0 = yMin; y0 < yMax; y0 += ySpan) {
        for (long x1 = 0L; x1 < xSpan; x1 += xStep) {
          final long xi = x0 + x1;
          for (long y1 = 0L; y1 < ySpan; y1 += yStep) {
            final long yi = y0 + y1;
            final int xRank = (int) (zigzag ? y1 : x1);
            final int yRank = (int) (zigzag ? x1 : y1);
            final long x = BitInterval.from(xRank, xi << xRank);
            final long y = BitInterval.from(yRank, yi << yRank);
            page = page.updated(Record.of(xi, yi), x, y, Record.of(-yi, -xi), 1L).balanced(1L);
            span += 1L;
            assertEquals(page.span(), span);
            assertTrue(page.containsKey(Record.of(xi, yi), x, y), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
          }
        }
      }
    }
    // Search
    for (long x0 = xMin; x0 < xMax; x0 += xSpan) {
      for (long y0 = yMin; y0 < yMax; y0 += ySpan) {
        for (long x1 = 0L; x1 < xSpan; x1 += xStep) {
          final long xi = x0 + x1;
          for (long y1 = 0L; y1 < ySpan; y1 += yStep) {
            final long yi = y0 + y1;
            final int xRank = (int) (zigzag ? y1 : x1);
            final int yRank = (int) (zigzag ? x1 : y1);
            final long x = BitInterval.from(xRank, xi << xRank);
            final long y = BitInterval.from(yRank, yi << yRank);
            assertTrue(page.containsKey(Record.of(xi, yi), x, y), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
            assertEquals(page.get(Record.of(xi, yi), x, y), Record.of(-yi, -xi), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
          }
        }
      }
    }
    // Remove
    for (long x0 = xMin; x0 < xMax; x0 += xSpan) {
      for (long y0 = yMin; y0 < yMax; y0 += ySpan) {
        for (long x1 = 0L; x1 < xSpan; x1 += xStep) {
          final long xi = x0 + x1;
          for (long y1 = 0L; y1 < ySpan; y1 += yStep) {
            final long yi = y0 + y1;
            final int xRank = (int) (zigzag ? y1 : x1);
            final int yRank = (int) (zigzag ? x1 : y1);
            final long x = BitInterval.from(xRank, xi << xRank);
            final long y = BitInterval.from(yRank, yi << yRank);
            page = page.removed(Record.of(xi, yi), x, y, 1L).balanced(1L);
            span -= 1L;
            assertEquals(page.span(), span);
            assertFalse(page.containsKey(Record.of(xi, yi), x, y), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
          }
        }
      }
    }
  }
}
