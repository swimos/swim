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

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

public class BitIntervalSpec {
  @Test
  public void testCompare() {
    assertEquals(BitInterval.compare(0L, 0L), 0);
    assertEquals(BitInterval.compare(1L, 1L), 0);
    assertEquals(BitInterval.compare(0L, 1L), -1);
    assertEquals(BitInterval.compare(1L, 0L), 1);
    assertEquals(BitInterval.compare(-1L, -1L), 0);
    assertEquals(BitInterval.compare(-1L, 0L), 0);
    assertEquals(BitInterval.compare(0L, -1L), 0);
    assertEquals(BitInterval.compare(-1L, 1L), -1);
    assertEquals(BitInterval.compare(1L, -1L), 1);
    assertEquals(BitInterval.compare(BitInterval.from(0, 0xDL), BitInterval.from(4, 0xDL)), 0);
    assertEquals(BitInterval.compare(BitInterval.from(1, 0xDL), BitInterval.from(3, 0xDL)), 0);
    assertEquals(BitInterval.compare(BitInterval.from(2, 0xDL), BitInterval.from(2, 0xDL)), 0);
    assertEquals(BitInterval.compare(BitInterval.from(3, 0xDL), BitInterval.from(1, 0xDL)), 0);
    assertEquals(BitInterval.compare(BitInterval.from(4, 0xDL), BitInterval.from(0, 0xDL)), 0);
  }

  @Test
  public void testCompare2() {
    assertEquals(BitInterval.compare(0x0000000000000000L, 0x8000000000000000L,
                                     0xC000000000000000L, 0xC000000000000000L), 0);
    assertEquals(BitInterval.compare(0xF800000000000000L, 0xFFFC000000000000L,
                                     0x800000000000000CL, 0xFFF0000000000001L), 0);
    assertEquals(BitInterval.compare(0xE000000000000002L, 0xC000000000000003L,
                                     0xF800000000000000L, 0xF000000000000001L), -1L);
    assertEquals(BitInterval.compare(0xE000000000000002L, 0xC000000000000003L,
                                     0xF000000000000000L, 0xFC00000000000000L), 1L);
    assertEquals(BitInterval.compare(0xF800000000000000L, 0xF000000000000001L,
                                     0xF000000000000000L, 0xFC00000000000000L), 0);
  }

  @Test
  public void testRank0Span() {
    assertEquals(BitInterval.span(0L, 1L), 0x8000000000000000L);
  }

  @Test
  public void testRank0SpanIdentity() {
    for (long i = 0L; i < 1024L; i += 1L) {
      assertEquals(BitInterval.span(i, i), i);
    }
  }

  @Test
  public void testUnion() {
    assertEquals(BitInterval.union(0xE00000000000000BL, 0xF800000000000002L), 0xF800000000000002L);
    assertEquals(BitInterval.union(0xF800000000000002L, 0xE00000000000000BL), 0xF800000000000002L);
    assertEquals(BitInterval.union(0x8000000000000000L, 0x8000000000000001L), 0xC000000000000000L);
    assertEquals(BitInterval.union(0x8000000000000001L, 0x8000000000000000L), 0xC000000000000000L);
    assertEquals(BitInterval.union(0xF000000000000000L, 0xF000000000000001L), 0xF800000000000000L);
  }

  @Test
  public void testRank4UnionIdentity() {
    for (long i = 0L; i < 1024L; i += 1L) {
      final long x = 0xF000000000000000L + i;
      assertEquals(BitInterval.union(x, x), x);
    }
  }

  @Test
  public void testContains() {
    assertTrue(BitInterval.contains(0L, 0L));
    assertTrue(BitInterval.contains(-1L, -1L));
    assertTrue(BitInterval.contains(-1L, 0L));
    assertFalse(BitInterval.contains(0L, -1L));
    assertFalse(BitInterval.contains(0L, 1L));
    assertFalse(BitInterval.contains(1L, 0L));
  }

  @Test
  public void testIntersects() {
    assertTrue(BitInterval.intersects(0L, 0L));
    assertTrue(BitInterval.intersects(-1L, -1L));
    assertTrue(BitInterval.intersects(-1L, 0L));
    assertTrue(BitInterval.intersects(0L, -1L));
    assertFalse(BitInterval.contains(0L, 1L));
    assertFalse(BitInterval.contains(1L, 0L));
  }
}
