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

package swim.spatial;

import java.util.Arrays;
import org.testng.annotations.Test;
import swim.math.Z2Shape;
import swim.structure.Record;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

public class QTreePageSpec {
  static <K, S, V> QTreeEntry<K, S, V> entry(K key, V value) {
    return new QTreeEntry<K, S, V>(key, null, 0L, 0L, value);
  }

  @Test
  public void updateLeafWithRank0Tiles() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 0x18L, 0xf4L, "v0", tree);
    assertEquals(page.x(), 0x18L);
    assertEquals(page.y(), 0xf4L);
    assertEquals(page.xRank(), 0);
    assertEquals(page.yRank(), 0);
    assertEquals(page.xBase(), 0x18L);
    assertEquals(page.yBase(), 0xf4L);
    assertEquals(page.span(), 1);
    assertTrue(page.containsKey("k0", 0x18L, 0xf4L, tree));
    assertEquals(page.get("k0", 0x18L, 0xf4L, tree), "v0");

    page = page.updated("k1", null, 0x14L, 0xf8L, "v1", tree);
    assertEquals(page.x(), 0xf000000000000001L);
    assertEquals(page.y(), 0xf00000000000000fL);
    assertEquals(page.xRank(), 4);
    assertEquals(page.yRank(), 4);
    assertEquals(page.xBase(), 0x10L);
    assertEquals(page.yBase(), 0xf0L);
    assertEquals(page.span(), 2);
    assertTrue(page.containsKey("k0", 0x18L, 0xf4L, tree));
    assertTrue(page.containsKey("k1", 0x14L, 0xf8L, tree));
    assertEquals(page.get("k0", 0x18L, 0xf4L, tree), "v0");
    assertEquals(page.get("k1", 0x14L, 0xf8L, tree), "v1");
  }

  @Test
  public void updateLeafWithRank4Tiles() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 4, 0x18L, 4, 0xf4L, "v0", tree);
    assertEquals(page.x(), 0xf000000000000001L);
    assertEquals(page.y(), 0xf00000000000000fL);
    assertEquals(page.xRank(), 4);
    assertEquals(page.yRank(), 4);
    assertEquals(page.xBase(), 0x10L);
    assertEquals(page.yBase(), 0xf0L);
    assertEquals(page.span(), 1);
    assertTrue(page.containsKey("k0", 4, 0x18L, 4, 0xf4L, tree));
    assertEquals(page.get("k0", 4, 0x18L, 4, 0xf4L, tree), "v0");

    page = page.updated("k1", null, 4, 0x14L, 4, 0xf8L, "v1", tree);
    assertEquals(page.x(), 0xf000000000000001L);
    assertEquals(page.y(), 0xf00000000000000fL);
    assertEquals(page.xRank(), 4);
    assertEquals(page.yRank(), 4);
    assertEquals(page.xBase(), 0x10L);
    assertEquals(page.yBase(), 0xf0L);
    assertEquals(page.span(), 2);
    assertTrue(page.containsKey("k0", 4, 0x18L, 4, 0xf4L, tree));
    assertTrue(page.containsKey("k1", 4, 0x14L, 4, 0xf8L, tree));
    assertEquals(page.get("k0", 4, 0x18L, 4, 0xf4L, tree), "v0");
    assertEquals(page.get("k1", 4, 0x14L, 4, 0xf8L, tree), "v1");
  }

  @Test
  public void getAllInLeafWithRank0Tiles() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 2L, 2L, "v0", tree);
    page = page.updated("k1", null, 2L, 6L, "v1", tree);
    page = page.updated("k2", null, 6L, 2L, "v2", tree);
    page = page.updated("k3", null, 6L, 6L, "v3", tree);
    assertEquals(page.getAll(2L, 2L, 2L, 6L), Arrays.asList(entry("k0", "v0"), entry("k1", "v1")));
    assertEquals(page.getAll(1L, 1L, 3L, 7L), Arrays.asList(entry("k0", "v0"), entry("k1", "v1")));
    assertEquals(page.getAll(2L, 2L, 6L, 2L), Arrays.asList(entry("k0", "v0"), entry("k2", "v2")));
    assertEquals(page.getAll(1L, 1L, 7L, 3L), Arrays.asList(entry("k0", "v0"), entry("k2", "v2")));
    assertEquals(page.getAll(2L, 6L, 6L, 6L), Arrays.asList(entry("k1", "v1"), entry("k3", "v3")));
    assertEquals(page.getAll(1L, 5L, 7L, 7L), Arrays.asList(entry("k1", "v1"), entry("k3", "v3")));
    assertEquals(page.getAll(6L, 2L, 6L, 6L), Arrays.asList(entry("k2", "v2"), entry("k3", "v3")));
    assertEquals(page.getAll(5L, 1L, 7L, 7L), Arrays.asList(entry("k2", "v2"), entry("k3", "v3")));
    assertEquals(page.getAll(2L, 2L, 6L, 6L), Arrays.asList(entry("k0", "v0"), entry("k1", "v1"), entry("k2", "v2"), entry("k3", "v3")));
    assertEquals(page.getAll(1L, 1L, 7L, 7L), Arrays.asList(entry("k0", "v0"), entry("k1", "v1"), entry("k2", "v2"), entry("k3", "v3")));
  }

  @Test
  public void getAllInNodeWithRank0Tiles() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 2L, 2L, "v0", tree);
    page = page.updated("k1", null, 2L, 6L, "v1", tree);
    page = page.updated("k2", null, 6L, 2L, "v2", tree);
    page = page.updated("k3", null, 6L, 6L, "v3", tree);
    page = page.split(tree);
    assertEquals(page.getAll(2L, 2L, 2L, 6L), Arrays.asList(entry("k0", "v0"), entry("k1", "v1")));
    assertEquals(page.getAll(1L, 1L, 3L, 7L), Arrays.asList(entry("k0", "v0"), entry("k1", "v1")));
    assertEquals(page.getAll(2L, 2L, 6L, 2L), Arrays.asList(entry("k0", "v0"), entry("k2", "v2")));
    assertEquals(page.getAll(1L, 1L, 7L, 3L), Arrays.asList(entry("k0", "v0"), entry("k2", "v2")));
    assertEquals(page.getAll(2L, 6L, 6L, 6L), Arrays.asList(entry("k1", "v1"), entry("k3", "v3")));
    assertEquals(page.getAll(1L, 5L, 7L, 7L), Arrays.asList(entry("k1", "v1"), entry("k3", "v3")));
    assertEquals(page.getAll(6L, 2L, 6L, 6L), Arrays.asList(entry("k2", "v2"), entry("k3", "v3")));
    assertEquals(page.getAll(5L, 1L, 7L, 7L), Arrays.asList(entry("k2", "v2"), entry("k3", "v3")));
    assertEquals(page.getAll(2L, 2L, 6L, 6L), Arrays.asList(entry("k0", "v0"), entry("k1", "v1"), entry("k2", "v2"), entry("k3", "v3")));
    assertEquals(page.getAll(1L, 1L, 7L, 7L), Arrays.asList(entry("k0", "v0"), entry("k1", "v1"), entry("k2", "v2"), entry("k3", "v3")));
  }

  @Test
  public void splitXRank0Leaf() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 16L, 0L, "v0", tree);
    page = page.updated("k1", null, 16L, 1L, "v1", tree);
    page = page.updated("k2", null, 32L, 2L, "v2", tree);
    page = page.updated("k3", null, 32L, 3L, "v3", tree);
    page = page.split(tree);
    assertEquals(page.arity(), 2);
    assertEquals(page.x(), 0xfc00000000000000L);
    assertEquals(page.y(), 0xc000000000000000L);
    assertEquals(page.xRank(), 6);
    assertEquals(page.yRank(), 2);
    assertEquals(page.xBase(), 0L);
    assertEquals(page.yBase(), 0L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey("k0", 16L, 0L, tree));
    assertTrue(page.containsKey("k1", 16L, 1L, tree));
    assertTrue(page.containsKey("k2", 32L, 2L, tree));
    assertTrue(page.containsKey("k3", 32L, 3L, tree));
    assertEquals(page.get("k0", 16L, 0L, tree), "v0");
    assertEquals(page.get("k1", 16L, 1L, tree), "v1");
    assertEquals(page.get("k2", 32L, 2L, tree), "v2");
    assertEquals(page.get("k3", 32L, 3L, tree), "v3");

    final QTreePage<String, Z2Shape, String> page0 = page.getPage(0);
    assertEquals(page0.x(), 0x0000000000000010L);
    assertEquals(page0.y(), 0x8000000000000000L);
    assertEquals(page0.xRank(), 0);
    assertEquals(page0.yRank(), 1);
    assertEquals(page0.xBase(), 16L);
    assertEquals(page0.yBase(), 0L);
    assertEquals(page0.span(), 2);
    assertTrue(page0.containsKey("k0", 10L, 0L, tree));
    assertTrue(page0.containsKey("k1", 10L, 1L, tree));
    assertEquals(page0.get("k0", 10L, 0L, tree), "v0");
    assertEquals(page0.get("k1", 10L, 1L, tree), "v1");

    final QTreePage<String, Z2Shape, String> page1 = page.getPage(1);
    assertEquals(page1.x(), 0x0000000000000020L);
    assertEquals(page1.y(), 0x8000000000000001L);
    assertEquals(page1.xRank(), 0);
    assertEquals(page1.yRank(), 1);
    assertEquals(page1.xBase(), 32L);
    assertEquals(page1.yBase(), 2L);
    assertEquals(page1.span(), 2);
    assertTrue(page1.containsKey("k2", 0L, 2L, tree));
    assertTrue(page1.containsKey("k3", 0L, 3L, tree));
    assertEquals(page1.get("k2", 0L, 2L, tree), "v2");
    assertEquals(page1.get("k3", 0L, 3L, tree), "v3");
  }

  @Test
  public void splitYRank0Leaf() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 0L, 10L, "v0", tree);
    page = page.updated("k1", null, 1L, 10L, "v1", tree);
    page = page.updated("k2", null, 2L, 10L, "v2", tree);
    page = page.updated("k3", null, 3L, 10L, "v3", tree);
    page = page.split(tree);
    assertEquals(page.arity(), 2);
    assertEquals(page.x(), 0xc000000000000000L);
    assertEquals(page.y(), 0x000000000000000AL);
    assertEquals(page.xRank(), 2);
    assertEquals(page.yRank(), 0);
    assertEquals(page.xBase(), 0L);
    assertEquals(page.yBase(), 10L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey("k0", 0L, 10L, tree));
    assertTrue(page.containsKey("k1", 1L, 10L, tree));
    assertTrue(page.containsKey("k2", 2L, 10L, tree));
    assertTrue(page.containsKey("k3", 3L, 10L, tree));
    assertEquals(page.get("k0", 0L, 10L, tree), "v0");
    assertEquals(page.get("k1", 1L, 10L, tree), "v1");
    assertEquals(page.get("k2", 2L, 10L, tree), "v2");
    assertEquals(page.get("k3", 3L, 10L, tree), "v3");

    final QTreePage<String, Z2Shape, String> page0 = page.getPage(0);
    assertEquals(page0.x(), 0x8000000000000000L);
    assertEquals(page0.y(), 0x000000000000000AL);
    assertEquals(page0.xRank(), 1);
    assertEquals(page0.yRank(), 0);
    assertEquals(page0.xBase(), 0L);
    assertEquals(page0.yBase(), 10L);
    assertEquals(page0.span(), 2);
    assertTrue(page0.containsKey("k0", 0L, 10L, tree));
    assertTrue(page0.containsKey("k1", 1L, 10L, tree));
    assertEquals(page0.get("k0", 0L, 10L, tree), "v0");
    assertEquals(page0.get("k1", 1L, 10L, tree), "v1");

    final QTreePage<String, Z2Shape, String> page1 = page.getPage(1);
    assertEquals(page1.x(), 0x8000000000000001L);
    assertEquals(page1.y(), 0x000000000000000AL);
    assertEquals(page1.xRank(), 1);
    assertEquals(page1.yRank(), 0);
    assertEquals(page1.xBase(), 2L);
    assertEquals(page1.yBase(), 10L);
    assertEquals(page1.span(), 2);
    assertTrue(page1.containsKey("k2", 2L, 10L, tree));
    assertTrue(page1.containsKey("k3", 3L, 10L, tree));
    assertEquals(page1.get("k2", 2L, 10L, tree), "v2");
    assertEquals(page1.get("k3", 3L, 10L, tree), "v3");
  }

  @Test
  public void splitLeafWithRank0Tiles() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 2L, 2L, "v0", tree);
    page = page.updated("k1", null, 2L, 6L, "v1", tree);
    page = page.updated("k2", null, 6L, 2L, "v2", tree);
    page = page.updated("k3", null, 6L, 6L, "v3", tree);
    page = page.split(tree);
    assertEquals(page.arity(), 4);
    assertEquals(page.x(), 0xe000000000000000L);
    assertEquals(page.y(), 0xe000000000000000L);
    assertEquals(page.xRank(), 3);
    assertEquals(page.yRank(), 3);
    assertEquals(page.xBase(), 0L);
    assertEquals(page.yBase(), 0L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey("k0", 2L, 2L, tree));
    assertTrue(page.containsKey("k1", 2L, 6L, tree));
    assertTrue(page.containsKey("k2", 6L, 2L, tree));
    assertTrue(page.containsKey("k3", 6L, 6L, tree));
    assertFalse(page.containsKey("k0", 0L, 0L, tree));
    assertFalse(page.containsKey("k1", 0L, 0L, tree));
    assertFalse(page.containsKey("k2", 0L, 0L, tree));
    assertFalse(page.containsKey("k3", 0L, 0L, tree));
    assertEquals(page.get("k0", 2L, 2L, tree), "v0");
    assertEquals(page.get("k1", 2L, 6L, tree), "v1");
    assertEquals(page.get("k2", 6L, 2L, tree), "v2");
    assertEquals(page.get("k3", 6L, 6L, tree), "v3");

    final QTreePage<String, Z2Shape, String> page0 = page.getPage(0);
    assertEquals(page0.x(), 2L);
    assertEquals(page0.y(), 2L);
    assertEquals(page0.xRank(), 0);
    assertEquals(page0.yRank(), 0);
    assertEquals(page0.xBase(), 2L);
    assertEquals(page0.yBase(), 2L);
    assertEquals(page0.span(), 1);
    assertTrue(page0.containsKey("k0", 2L, 2L, tree));
    assertEquals(page0.get("k0", 2L, 2L, tree), "v0");

    final QTreePage<String, Z2Shape, String> page1 = page.getPage(1);
    assertEquals(page1.x(), 2L);
    assertEquals(page1.y(), 6L);
    assertEquals(page1.xRank(), 0);
    assertEquals(page1.yRank(), 0);
    assertEquals(page1.xBase(), 2L);
    assertEquals(page1.yBase(), 6L);
    assertEquals(page1.span(), 1);
    assertTrue(page1.containsKey("k1", 2L, 6L, tree));
    assertEquals(page1.get("k1", 2L, 6L, tree), "v1");

    final QTreePage<String, Z2Shape, String> page2 = page.getPage(2);
    assertEquals(page2.x(), 6L);
    assertEquals(page2.y(), 2L);
    assertEquals(page2.xRank(), 0);
    assertEquals(page2.yRank(), 0);
    assertEquals(page2.xBase(), 6L);
    assertEquals(page2.yBase(), 2L);
    assertEquals(page2.span(), 1);
    assertTrue(page2.containsKey("k2", 6L, 2L, tree));
    assertEquals(page2.get("k2", 6L, 2L, tree), "v2");

    final QTreePage<String, Z2Shape, String> page3 = page.getPage(3);
    assertEquals(page3.x(), 6L);
    assertEquals(page3.y(), 6L);
    assertEquals(page3.xRank(), 0);
    assertEquals(page3.yRank(), 0);
    assertEquals(page3.xBase(), 6L);
    assertEquals(page3.yBase(), 6L);
    assertEquals(page3.span(), 1);
    assertTrue(page3.containsKey("k3", 6L, 6L, tree));
    assertEquals(page3.get("k3", 6L, 6L, tree), "v3");
  }

  @Test
  public void splitNodeWithRank0Tiles() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 2L, 2L, "v0", tree);
    page = page.updated("k1", null, 2L, 6L, "v1", tree);
    page = page.updated("k2", null, 6L, 2L, "v2", tree);
    page = page.updated("k3", null, 6L, 6L, "v3", tree);
    page = page.split(tree);
    page = page.split(tree);
    assertEquals(page.arity(), 4);
    assertEquals(page.x(), 0xe000000000000000L);
    assertEquals(page.y(), 0xe000000000000000L);
    assertEquals(page.xRank(), 3);
    assertEquals(page.yRank(), 3);
    assertEquals(page.xBase(), 0L);
    assertEquals(page.yBase(), 0L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey("k0", 2L, 2L, tree));
    assertTrue(page.containsKey("k1", 2L, 6L, tree));
    assertTrue(page.containsKey("k2", 6L, 2L, tree));
    assertTrue(page.containsKey("k3", 6L, 6L, tree));
    assertFalse(page.containsKey("k0", 0L, 0L, tree));
    assertFalse(page.containsKey("k1", 0L, 0L, tree));
    assertFalse(page.containsKey("k2", 0L, 0L, tree));
    assertFalse(page.containsKey("k3", 0L, 0L, tree));
    assertEquals(page.get("k0", 2L, 2L, tree), "v0");
    assertEquals(page.get("k1", 2L, 6L, tree), "v1");
    assertEquals(page.get("k2", 6L, 2L, tree), "v2");
    assertEquals(page.get("k3", 6L, 6L, tree), "v3");

    final QTreePage<String, Z2Shape, String> page0 = page.getPage(0);
    assertEquals(page0.arity(), 1);
    assertEquals(page0.x(), 2L);
    assertEquals(page0.y(), 2L);
    assertEquals(page0.xRank(), 0);
    assertEquals(page0.yRank(), 0);
    assertEquals(page0.xBase(), 2L);
    assertEquals(page0.yBase(), 2L);
    assertEquals(page0.span(), 1);
    assertTrue(page0.containsKey("k0", 2L, 2L, tree));
    assertEquals(page0.get("k0", 2L, 2L, tree), "v0");

    final QTreePage<String, Z2Shape, String> page1 = page.getPage(1);
    assertEquals(page1.arity(), 1);
    assertEquals(page1.x(), 2L);
    assertEquals(page1.y(), 6L);
    assertEquals(page1.xRank(), 0);
    assertEquals(page1.yRank(), 0);
    assertEquals(page1.xBase(), 2L);
    assertEquals(page1.yBase(), 6L);
    assertEquals(page1.span(), 1);
    assertTrue(page1.containsKey("k1", 2L, 6L, tree));
    assertEquals(page1.get("k1", 2L, 6L, tree), "v1");

    final QTreePage<String, Z2Shape, String> page2 = page.getPage(2);
    assertEquals(page2.arity(), 1);
    assertEquals(page2.x(), 6L);
    assertEquals(page2.y(), 2L);
    assertEquals(page2.xRank(), 0);
    assertEquals(page2.yRank(), 0);
    assertEquals(page2.xBase(), 6L);
    assertEquals(page2.yBase(), 2L);
    assertEquals(page2.span(), 1);
    assertTrue(page2.containsKey("k2", 6L, 2L, tree));
    assertEquals(page2.get("k2", 6L, 2L, tree), "v2");

    final QTreePage<String, Z2Shape, String> page3 = page.getPage(3);
    assertEquals(page3.arity(), 1);
    assertEquals(page3.x(), 6L);
    assertEquals(page3.y(), 6L);
    assertEquals(page3.xRank(), 0);
    assertEquals(page3.yRank(), 0);
    assertEquals(page3.xBase(), 6L);
    assertEquals(page3.yBase(), 6L);
    assertEquals(page3.span(), 1);
    assertTrue(page3.containsKey("k3", 6L, 6L, tree));
    assertEquals(page3.get("k3", 6L, 6L, tree), "v3");
  }

  @Test
  public void splitLeafWithNonOverlappingMixedRankTiles() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 0, 0x5cL, 0, 0x5cL, "v0", tree);
    page = page.updated("k1", null, 0, 0x5cL, 0, 0x7cL, "v1", tree);
    page = page.updated("k2", null, 2, 0x7cL, 2, 0x5cL, "v2", tree);
    page = page.split(tree);
    assertEquals(page.arity(), 3);
    assertEquals(page.x(), 0xfc00000000000001L);
    assertEquals(page.y(), 0xfc00000000000001L);
    assertEquals(page.xRank(), 6);
    assertEquals(page.yRank(), 6);
    assertEquals(page.xBase(), 0x40L);
    assertEquals(page.yBase(), 0x40L);
    assertEquals(page.span(), 3);
    assertTrue(page.containsKey("k0", 0, 0x5cL, 0, 0x5cL, tree));
    assertTrue(page.containsKey("k1", 0, 0x5cL, 0, 0x7cL, tree));
    assertTrue(page.containsKey("k2", 2, 0x7cL, 2, 0x5cL, tree));
    assertFalse(page.containsKey("k0", 0, 0x1cL, 0, 0x1cL, tree));
    assertFalse(page.containsKey("k1", 0, 0x1cL, 0, 0x3cL, tree));
    assertFalse(page.containsKey("k2", 2, 0x30L, 2, 0x10L, tree));
    assertEquals(page.get("k0", 0, 0x5cL, 0, 0x5cL, tree), "v0");
    assertEquals(page.get("k1", 0, 0x5cL, 0, 0x7cL, tree), "v1");
    assertEquals(page.get("k2", 2, 0x7cL, 2, 0x5cL, tree), "v2");

    final QTreePage<String, Z2Shape, String> page0 = page.getPage(0);
    assertEquals(page0.x(), 0x5cL);
    assertEquals(page0.y(), 0x5cL);
    assertEquals(page0.xRank(), 0);
    assertEquals(page0.yRank(), 0);
    assertEquals(page0.xBase(), 0x5cL);
    assertEquals(page0.yBase(), 0x5cL);
    assertEquals(page0.span(), 1);
    assertTrue(page0.containsKey("k0", 0, 0x5cL, 0, 0x5cL, tree));
    assertEquals(page0.get("k0", 0, 0x5cL, 0, 0x5cL, tree), "v0");

    final QTreePage<String, Z2Shape, String> page1 = page.getPage(1);
    assertEquals(page1.x(), 0x5cL);
    assertEquals(page1.y(), 0x7cL);
    assertEquals(page1.xRank(), 0);
    assertEquals(page1.yRank(), 0);
    assertEquals(page1.xBase(), 0x5cL);
    assertEquals(page1.yBase(), 0x7cL);
    assertEquals(page1.span(), 1);
    assertTrue(page1.containsKey("k1", 0, 0x5cL, 0, 0x7cL, tree));
    assertEquals(page1.get("k1", 0, 0x5cL, 0, 0x7cL, tree), "v1");

    final QTreePage<String, Z2Shape, String> page2 = page.getPage(2);
    assertEquals(page2.x(), 0xc00000000000001fL);
    assertEquals(page2.y(), 0xc000000000000017L);
    assertEquals(page2.xRank(), 2);
    assertEquals(page2.yRank(), 2);
    assertEquals(page2.xBase(), 0x7cL);
    assertEquals(page2.yBase(), 0x5cL);
    assertEquals(page2.span(), 1);
    assertTrue(page2.containsKey("k2", 2, 0x7cL, 2, 0x5cL, tree));
    assertEquals(page2.get("k2", 2, 0x7cL, 2, 0x5cL, tree), "v2");
  }

  @Test
  public void splitNodeWithNonOverlappingMixedRankTiles() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 0, 0x5cL, 0, 0x5cL, "v0", tree);
    page = page.updated("k1", null, 0, 0x5cL, 0, 0x7cL, "v1", tree);
    page = page.updated("k2", null, 2, 0x7cL, 2, 0x5cL, "v2", tree);
    page = page.split(tree);
    page = page.split(tree);
    assertEquals(page.arity(), 3);
    assertEquals(page.x(), 0xfc00000000000001L);
    assertEquals(page.y(), 0xfc00000000000001L);
    assertEquals(page.xRank(), 6);
    assertEquals(page.yRank(), 6);
    assertEquals(page.xBase(), 0x40L);
    assertEquals(page.yBase(), 0x40L);
    assertEquals(page.span(), 3);
    assertTrue(page.containsKey("k0", 0, 0x5cL, 0, 0x5cL, tree));
    assertTrue(page.containsKey("k1", 0, 0x5cL, 0, 0x7cL, tree));
    assertTrue(page.containsKey("k2", 2, 0x7cL, 2, 0x5cL, tree));
    assertFalse(page.containsKey("k0", 0, 0x1cL, 0, 0x1cL, tree));
    assertFalse(page.containsKey("k1", 0, 0x1cL, 0, 0x3cL, tree));
    assertFalse(page.containsKey("k2", 2, 0x30L, 2, 0x10L, tree));
    assertEquals(page.get("k0", 0, 0x5cL, 0, 0x5cL, tree), "v0");
    assertEquals(page.get("k1", 0, 0x5cL, 0, 0x7cL, tree), "v1");
    assertEquals(page.get("k2", 2, 0x7cL, 2, 0x5cL, tree), "v2");

    final QTreePage<String, Z2Shape, String> page0 = page.getPage(0);
    assertEquals(page0.x(), 0x5cL);
    assertEquals(page0.y(), 0x5cL);
    assertEquals(page0.xRank(), 0);
    assertEquals(page0.yRank(), 0);
    assertEquals(page0.xBase(), 0x5cL);
    assertEquals(page0.yBase(), 0x5cL);
    assertEquals(page0.span(), 1);
    assertTrue(page0.containsKey("k0", 0, 0x5cL, 0, 0x5cL, tree));
    assertEquals(page0.get("k0", 0, 0x5cL, 0, 0x5cL, tree), "v0");

    final QTreePage<String, Z2Shape, String> page1 = page.getPage(1);
    assertEquals(page1.x(), 0x5cL);
    assertEquals(page1.y(), 0x7cL);
    assertEquals(page1.xRank(), 0);
    assertEquals(page1.yRank(), 0);
    assertEquals(page1.xBase(), 0x5cL);
    assertEquals(page1.yBase(), 0x7cL);
    assertEquals(page1.span(), 1);
    assertTrue(page1.containsKey("k1", 0, 0x5cL, 0, 0x7cL, tree));
    assertEquals(page1.get("k1", 0, 0x5cL, 0, 0x7cL, tree), "v1");

    final QTreePage<String, Z2Shape, String> page2 = page.getPage(2);
    assertEquals(page2.x(), 0xc00000000000001fL);
    assertEquals(page2.y(), 0xc000000000000017L);
    assertEquals(page2.xRank(), 2);
    assertEquals(page2.yRank(), 2);
    assertEquals(page2.xBase(), 0x7cL);
    assertEquals(page2.yBase(), 0x5cL);
    assertEquals(page2.span(), 1);
    assertTrue(page2.containsKey("k2", 2, 0x7cL, 2, 0x5cL, tree));
    assertEquals(page2.get("k2", 2, 0x7cL, 2, 0x5cL, tree), "v2");
  }

  @Test
  public void splitLeafWithXOverlappingTiles() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 6, 0x40L, 2, 0x5cL, "v0", tree);
    page = page.updated("k1", null, 6, 0x40L, 2, 0x7cL, "v1", tree);
    page = page.updated("k2", null, 0, 0x7cL, 0, 0x5cL, "v2", tree);
    page = page.updated("k3", null, 0, 0x7cL, 0, 0x7cL, "v3", tree);
    page = page.split(tree);
    assertEquals(page.arity(), 2);
    assertEquals(page.x(), 0xfc00000000000001L);
    assertEquals(page.y(), 0xfc00000000000001L);
    assertEquals(page.xRank(), 6);
    assertEquals(page.yRank(), 6);
    assertEquals(page.xBase(), 0x40L);
    assertEquals(page.yBase(), 0x40L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey("k0", 6, 0x40L, 2, 0x5cL, tree));
    assertTrue(page.containsKey("k1", 6, 0x40L, 2, 0x7cL, tree));
    assertTrue(page.containsKey("k2", 0, 0x7cL, 0, 0x5cL, tree));
    assertTrue(page.containsKey("k3", 0, 0x7cL, 0, 0x7cL, tree));
    assertEquals(page.get("k0", 6, 0x40L, 2, 0x5cL, tree), "v0");
    assertEquals(page.get("k1", 6, 0x40L, 2, 0x7cL, tree), "v1");
    assertEquals(page.get("k2", 0, 0x7cL, 0, 0x5cL, tree), "v2");
    assertEquals(page.get("k3", 0, 0x7cL, 0, 0x7cL, tree), "v3");

    final QTreePage<String, Z2Shape, String> page0 = page.getPage(0);
    assertEquals(page0.x(), 0xfc00000000000001L);
    assertEquals(page0.y(), 0xc000000000000017L);
    assertEquals(page0.xRank(), 6);
    assertEquals(page0.yRank(), 2);
    assertEquals(page0.xBase(), 0x40L);
    assertEquals(page0.yBase(), 0x5cL);
    assertEquals(page0.span(), 2);
    assertTrue(page0.containsKey("k0", 6, 0x40L, 2, 0x5cL, tree));
    assertTrue(page0.containsKey("k2", 0, 0x7cL, 0, 0x5cL, tree));
    assertEquals(page0.get("k0", 6, 0x40L, 2, 0x5cL, tree), "v0");
    assertEquals(page0.get("k2", 0, 0x7cL, 0, 0x5cL, tree), "v2");

    final QTreePage<String, Z2Shape, String> page1 = page.getPage(1);
    assertEquals(page1.x(), 0xfc00000000000001L);
    assertEquals(page1.y(), 0xc00000000000001fL);
    assertEquals(page1.xRank(), 6);
    assertEquals(page1.yRank(), 2);
    assertEquals(page1.xBase(), 0x40L);
    assertEquals(page1.yBase(), 0x7cL);
    assertEquals(page1.span(), 2);
    assertTrue(page1.containsKey("k1", 6, 0x40L, 2, 0x7cL, tree));
    assertTrue(page1.containsKey("k3", 0, 0x7cL, 0, 0x7cL, tree));
    assertEquals(page1.get("k1", 6, 0x40L, 2, 0x7cL, tree), "v1");
    assertEquals(page1.get("k3", 0, 0x7cL, 0, 0x7cL, tree), "v3");
  }

  @Test
  public void splitLeafWithYOverlappingTiles() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 2, 0x5cL, 6, 0x40L, "v0", tree);
    page = page.updated("k1", null, 0, 0x5cL, 0, 0x7cL, "v1", tree);
    page = page.updated("k2", null, 2, 0x7cL, 6, 0x40L, "v2", tree);
    page = page.updated("k3", null, 0, 0x7cL, 0, 0x5cL, "v3", tree);
    page = page.split(tree);
    assertEquals(page.arity(), 2);
    assertEquals(page.x(), 0xfc00000000000001L);
    assertEquals(page.y(), 0xfc00000000000001L);
    assertEquals(page.xRank(), 6);
    assertEquals(page.yRank(), 6);
    assertEquals(page.xBase(), 0x40L);
    assertEquals(page.yBase(), 0x40L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey("k0", 2, 0x5cL, 6, 0x40L, tree));
    assertTrue(page.containsKey("k1", 0, 0x5cL, 0, 0x7cL, tree));
    assertTrue(page.containsKey("k2", 2, 0x7cL, 6, 0x40L, tree));
    assertTrue(page.containsKey("k3", 0, 0x7cL, 0, 0x5cL, tree));
    assertEquals(page.get("k0", 2, 0x5cL, 6, 0x40L, tree), "v0");
    assertEquals(page.get("k1", 0, 0x5cL, 0, 0x7cL, tree), "v1");
    assertEquals(page.get("k2", 2, 0x7cL, 6, 0x40L, tree), "v2");
    assertEquals(page.get("k3", 0, 0x7cL, 0, 0x5cL, tree), "v3");

    final QTreePage<String, Z2Shape, String> page0 = page.getPage(0);
    assertEquals(page0.x(), 0xc000000000000017L);
    assertEquals(page0.y(), 0xfc00000000000001L);
    assertEquals(page0.xRank(), 2);
    assertEquals(page0.yRank(), 6);
    assertEquals(page0.xBase(), 0x5cL);
    assertEquals(page0.yBase(), 0x40L);
    assertEquals(page0.span(), 2);
    assertTrue(page0.containsKey("k0", 2, 0x5cL, 6, 0x40L, tree));
    assertTrue(page0.containsKey("k1", 0, 0x5cL, 0, 0x7cL, tree));
    assertEquals(page0.get("k0", 2, 0x5cL, 6, 0x40L, tree), "v0");
    assertEquals(page0.get("k1", 0, 0x5cL, 0, 0x7cL, tree), "v1");

    final QTreePage<String, Z2Shape, String> page1 = page.getPage(1);
    assertEquals(page1.x(), 0xc00000000000001fL);
    assertEquals(page1.y(), 0xfc00000000000001L);
    assertEquals(page1.xRank(), 2);
    assertEquals(page1.yRank(), 6);
    assertEquals(page1.xBase(), 0x7cL);
    assertEquals(page1.yBase(), 0x40L);
    assertEquals(page1.span(), 2);
    assertTrue(page1.containsKey("k2", 2, 0x7cL, 6, 0x40L, tree));
    assertTrue(page1.containsKey("k3", 0, 0x7cL, 0, 0x7cL, tree));
    assertEquals(page1.get("k2", 2, 0x7cL, 6, 0x40L, tree), "v2");
    assertEquals(page1.get("k3", 0, 0x7cL, 0, 0x7cL, tree), "v3");
  }

  @Test
  public void splitLeafWithXYOverlappingTiles() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 6, 0xc0L, 2, 0x8cL, "v0", tree);
    page = page.updated("k1", null, 2, 0x8cL, 6, 0xc0L, "v1", tree);
    page = page.updated("k2", null, 0, 0x80L, 0, 0x80L, "v2", tree);
    page = page.split(tree);
    assertEquals(page.arity(), 3);
    assertEquals(page.x(), 0xfe00000000000001L);
    assertEquals(page.y(), 0xfe00000000000001L);
    assertEquals(page.xRank(), 7);
    assertEquals(page.yRank(), 7);
    assertEquals(page.xBase(), 0x80L);
    assertEquals(page.yBase(), 0x80L);
    assertEquals(page.span(), 3);
    assertTrue(page.containsKey("k0", 6, 0xc0L, 2, 0x8cL, tree));
    assertTrue(page.containsKey("k1", 2, 0x8cL, 6, 0xc0L, tree));
    assertTrue(page.containsKey("k2", 0, 0x80L, 0, 0x80L, tree));
    assertEquals(page.get("k0", 6, 0xc0L, 2, 0x8cL, tree), "v0");
    assertEquals(page.get("k1", 2, 0x8cL, 6, 0xc0L, tree), "v1");
    assertEquals(page.get("k2", 0, 0x80L, 0, 0x80L, tree), "v2");

    final QTreePage<String, Z2Shape, String> page0 = page.getPage(0);
    assertEquals(page0.x(), 0x0000000000000080L);
    assertEquals(page0.y(), 0x0000000000000080L);
    assertEquals(page0.xRank(), 0);
    assertEquals(page0.yRank(), 0);
    assertEquals(page0.xBase(), 0x80L);
    assertEquals(page0.yBase(), 0x80L);
    assertEquals(page0.span(), 1);
    assertTrue(page0.containsKey("k2", 3, 0x80L, 5, 0x80L, tree));
    assertEquals(page0.get("k2", 0, 0x80L, 0, 0x80L, tree), "v2");

    final QTreePage<String, Z2Shape, String> page1 = page.getPage(1);
    assertEquals(page1.x(), 0xc000000000000023L);
    assertEquals(page1.y(), 0xfc00000000000003L);
    assertEquals(page1.xRank(), 2);
    assertEquals(page1.yRank(), 6);
    assertEquals(page1.xBase(), 0x8cL);
    assertEquals(page1.yBase(), 0xc0L);
    assertEquals(page1.span(), 1);
    assertTrue(page1.containsKey("k1", 2, 0x8cL, 6, 0xc0L, tree));
    assertEquals(page1.get("k1", 2, 0x8cL, 6, 0xc0L, tree), "v1");

    final QTreePage<String, Z2Shape, String> page2 = page.getPage(2);
    assertEquals(page2.x(), 0xfc00000000000003L);
    assertEquals(page2.y(), 0xc000000000000023L);
    assertEquals(page2.xRank(), 6);
    assertEquals(page2.yRank(), 2);
    assertEquals(page2.xBase(), 0xc0L);
    assertEquals(page2.yBase(), 0x8cL);
    assertEquals(page2.span(), 1);
    assertTrue(page2.containsKey("k0", 6, 0xc0L, 2, 0x8cL, tree));
    assertEquals(page2.get("k0", 6, 0xc0L, 2, 0x8cL, tree), "v0");
  }

  @Test
  public void splitLeafWithLiftedTiles() {
    final QTree<String, Z2Shape, String> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<String, Z2Shape, String> page = tree.root;
    page = page.updated("k0", null, 6, 0x40L, 2, 0x5cL, "v0", tree);
    page = page.updated("k1", null, 2, 0x5cL, 6, 0x40L, "v1", tree);
    page = page.updated("k2", null, 0, 0x5cL, 0, 0x7cL, "v2", tree);
    page = page.updated("k3", null, 0, 0x7cL, 0, 0x5cL, "v3", tree);
    page = page.split(tree);
    assertEquals(page.arity(), 3);
    assertEquals(page.x(), 0xfc00000000000001L);
    assertEquals(page.y(), 0xfc00000000000001L);
    assertEquals(page.xRank(), 6);
    assertEquals(page.yRank(), 6);
    assertEquals(page.xBase(), 0x40L);
    assertEquals(page.yBase(), 0x40L);
    assertEquals(page.span(), 4);
    assertTrue(page.containsKey("k0", 6, 0x40L, 2, 0x5cL, tree));
    assertTrue(page.containsKey("k1", 2, 0x5cL, 6, 0x40L, tree));
    assertTrue(page.containsKey("k2", 0, 0x5cL, 0, 0x7cL, tree));
    assertTrue(page.containsKey("k3", 0, 0x7cL, 0, 0x5cL, tree));
    assertEquals(page.get("k0", 6, 0x40L, 2, 0x5cL, tree), "v0");
    assertEquals(page.get("k1", 2, 0x5cL, 6, 0x40L, tree), "v1");
    assertEquals(page.get("k2", 0, 0x5cL, 0, 0x7cL, tree), "v2");
    assertEquals(page.get("k3", 0, 0x7cL, 0, 0x5cL, tree), "v3");

    final QTreePage<String, Z2Shape, String> page0 = page.getPage(0);
    assertEquals(page0.x(), 0xc000000000000017L);
    assertEquals(page0.y(), 0xfc00000000000001L);
    assertEquals(page0.xRank(), 2);
    assertEquals(page0.yRank(), 6);
    assertEquals(page0.xBase(), 0x5cL);
    assertEquals(page0.yBase(), 0x40L);
    assertEquals(page0.span(), 2);
    assertTrue(page0.containsKey("k1", 2, 0x5cL, 6, 0x40L, tree));
    assertTrue(page0.containsKey("k2", 0, 0x5cL, 0, 0x7cL, tree));
    assertEquals(page0.get("k1", 2, 0x5cL, 6, 0x40L, tree), "v1");
    assertEquals(page0.get("k2", 0, 0x5cL, 0, 0x7cL, tree), "v2");

    final QTreePage<String, Z2Shape, String> page1 = page.getPage(1);
    assertEquals(page1.x(), 0x000000000000007cL);
    assertEquals(page1.y(), 0x000000000000005cL);
    assertEquals(page1.xRank(), 0);
    assertEquals(page1.yRank(), 0);
    assertEquals(page1.xBase(), 0x7cL);
    assertEquals(page1.yBase(), 0x5cL);
    assertEquals(page1.span(), 1);
    assertTrue(page1.containsKey("k3", 0, 0x7cL, 0, 0x5cL, tree));
    assertEquals(page1.get("k3", 0, 0x7cL, 0, 0x5cL, tree), "v3");
  }

  @Test
  public void splitPackedRank0Leaf() {
    final QTree<Value, Z2Shape, Value> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<Value, Z2Shape, Value> page = tree.root;
    for (long i = 0L; i < 64L; i += 1L) {
      for (long j = 0L; j < 64L; j += 1L) {
        page = page.updated(Record.of(i, j), null, i, j, Record.of(-j, -i), tree);
      }
    }
    page = page.split(tree);
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
        assertTrue(page.containsKey(Record.of(i, j), i, j, tree), "i: " + i + "; j: " + j);
        assertEquals(page.get(Record.of(i, j), i, j, tree), Record.of(-j, -i), "i: " + i + "; j: " + j);
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
    final QTree<Value, Z2Shape, Value> tree = new QTree<Value, Z2Shape, Value>(Z2Shape.shapeForm()) {
      @Override
      protected int pageSplitSize() {
        return splitArity;
      }
    };
    QTreePage<Value, Z2Shape, Value> page = tree.root;
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
            page = page.updated(Record.of(xi, yi), null, x, y, Record.of(-yi, -xi), tree).balanced(tree);
            span += 1L;
            assertEquals(page.span(), span);
            assertTrue(page.containsKey(Record.of(xi, yi), x, y, tree), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
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
            assertTrue(page.containsKey(Record.of(xi, yi), x, y, tree), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
            assertEquals(page.get(Record.of(xi, yi), x, y, tree), Record.of(-yi, -xi), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
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
            page = page.removed(Record.of(xi, yi), x, y, tree).balanced(tree);
            span -= 1L;
            assertEquals(page.span(), span);
            assertFalse(page.containsKey(Record.of(xi, yi), x, y, tree), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
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
    final QTree<Value, Z2Shape, Value> tree = new QTree<Value, Z2Shape, Value>(Z2Shape.shapeForm()) {
      @Override
      protected int pageSplitSize() {
        return splitArity;
      }
    };
    QTreePage<Value, Z2Shape, Value> page = tree.root;
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
            page = page.updated(Record.of(xi, yi), null, x, y, Record.of(-yi, -xi), tree).balanced(tree);
            span += 1L;
            assertEquals(page.span(), span);
            assertTrue(page.containsKey(Record.of(xi, yi), x, y, tree), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
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
            assertTrue(page.containsKey(Record.of(xi, yi), x, y, tree), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
            assertEquals(page.get(Record.of(xi, yi), x, y, tree), Record.of(-yi, -xi), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
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
            page = page.removed(Record.of(xi, yi), x, y, tree).balanced(tree);
            span -= 1L;
            assertEquals(page.span(), span);
            assertFalse(page.containsKey(Record.of(xi, yi), x, y, tree), "x: 0x" + Long.toHexString(x) + "; y: 0x" + Long.toHexString(y));
          }
        }
      }
    }
  }
}
