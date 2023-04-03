// Copyright 2015-2022 Swim.inc
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

package swim.collections;

import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import swim.util.Assume;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class HashTrieMapTests {

  @Test
  public void testEmpty() {
    assertTrue(HashTrieMap.empty().isEmpty());
    assertEquals(0, HashTrieMap.empty().size());
    assertNull(HashTrieMap.empty().head());
    assertNull(HashTrieMap.empty().headKey());
    assertNull(HashTrieMap.empty().headValue());
    assertNull(HashTrieMap.empty().next(null));
    assertNull(HashTrieMap.empty().nextKey(null));
    assertNull(HashTrieMap.empty().nextValue(null));
  }

  @Test
  public void testUnary() {
    final HashTrieMap<String, Integer> xs = HashTrieMap.<String, Integer>empty().updated("one", 1);
    assertFalse(xs.isEmpty());
    assertEquals("one", Assume.nonNull(xs.next(null)).getKey());
    assertEquals(1, Assume.nonNull(xs.next(null)).getValue().intValue());
    assertEquals("one", xs.nextKey(null));
    assertEquals(1, Assume.nonNull(xs.nextValue(null)).intValue());
    final Iterator<Map.Entry<String, Integer>> iter = xs.iterator();
    assertTrue(iter.hasNext());
    final Map.Entry<String, Integer> entry = iter.next();
    assertEquals("one", entry.getKey());
    assertEquals(1, entry.getValue().intValue());
    assertFalse(iter.hasNext());
  }

  @Test
  public void testComposeMaps() {
    for (int k = 4; k <= 20; k += 4) {
      final int n = 1 << k;
      this.testCompose(n);
    }
  }

  private void testCompose(int n) {
    System.out.println("Composing HashTrieMap with " + n + " entries ...");
    HashTrieMap<HashedInteger, Integer> xs = HashTrieMap.empty();
    for (int i = 1; i <= n; i += 1) {
      xs = xs.updated(HashedInteger.valueOf(-i), i);
    }
    assertFalse(xs.isEmpty());
    assertEquals(n, xs.size());
    final Iterator<Map.Entry<HashedInteger, Integer>> iter = xs.iterator();
    long sum = 0L;
    HashedInteger lastKey = null;
    while (iter.hasNext()) {
      final Map.Entry<HashedInteger, Integer> next = iter.next();
      assertEquals(next.getValue().intValue(), -next.getKey().intValue());
      sum += next.getValue().longValue();
      assertEquals(next, xs.next(lastKey));
      assertEquals(next.getKey(), xs.nextKey(lastKey));
      assertEquals(next.getValue(), xs.nextValue(lastKey));
      lastKey = next.getKey();
    }
    assertNull(xs.next(lastKey));
    assertNull(xs.nextKey(lastKey));
    assertNull(xs.nextValue(lastKey));
    assertEquals(((long) n * ((long) n + 1L) / 2L), sum, "sum of first " + n + " integers");
  }

  @Test
  public void testDecomposeSmallMaps() {
    for (int n = 4; n <= 1024; n *= 2) {
      this.testDecompose(n);
    }
  }

  @Test
  @Tag("slow")
  public void testDecomposeLargeMaps() {
    this.testDecompose(1 << 15);
  }

  private void testDecompose(int n) {
    System.out.println("Decomposing HashTrieMap with " + n + " entries ...");
    HashTrieMap<HashedInteger, Integer> xs = HashTrieMap.empty();
    for (int i = 1; i <= n; i += 1) {
      xs = xs.updated(HashedInteger.valueOf(-i), i);
    }
    for (int i = n; i > 0; i -= 1) {
      final Iterator<Map.Entry<HashedInteger, Integer>> iter = xs.iterator();
      long sum = 0L;
      HashedInteger lastKey = null;
      while (iter.hasNext()) {
        final Map.Entry<HashedInteger, Integer> next = iter.next();
        assertEquals(next.getValue().intValue(), -next.getKey().intValue());
        sum += next.getValue().longValue();
        assertEquals(next, xs.next(lastKey));
        assertEquals(next.getKey(), xs.nextKey(lastKey));
        assertEquals(next.getValue(), xs.nextValue(lastKey));
        lastKey = next.getKey();
      }
      assertNull(xs.next(lastKey));
      assertNull(xs.nextKey(lastKey));
      assertNull(xs.nextValue(lastKey));
      final long expected = ((long) i * ((long) i + 1L) / 2L);
      assertEquals(expected, sum, "sum of first " + i + " of " + n + " integers");
      xs = xs.removed(HashedInteger.valueOf(-i));
    }
  }

  @Test
  public void testCollisions() {
    HashTrieMap<HashedValue<Integer>, Integer> xs = HashTrieMap.empty();
    xs = xs.updated(new HashedValue<Integer>(3, 1), 3);
    xs = xs.updated(new HashedValue<Integer>(5, 1), 5);
    xs = xs.updated(new HashedValue<Integer>(7, 1), 0);
    xs = xs.updated(new HashedValue<Integer>(7, 1), 7);
    assertEquals(3, xs.size());
    assertTrue(xs.containsKey(new HashedValue<Integer>(3, 1)));
    assertTrue(xs.containsKey(new HashedValue<Integer>(5, 1)));
    assertTrue(xs.containsKey(new HashedValue<Integer>(7, 1)));
    assertEquals(3, xs.get(new HashedValue<Integer>(3, 1)));
    assertEquals(5, xs.get(new HashedValue<Integer>(5, 1)));
    assertEquals(7, xs.get(new HashedValue<Integer>(7, 1)));

    Iterator<Map.Entry<HashedValue<Integer>, Integer>> iter = xs.iterator();
    int sum = 0;
    HashedValue<Integer> lastKey = null;
    while (iter.hasNext()) {
      final Map.Entry<HashedValue<Integer>, Integer> next = iter.next();
      assertEquals(next.getValue().intValue(), next.getKey().get().intValue());
      sum += next.getValue().intValue();
      assertEquals(next, xs.next(lastKey));
      assertEquals(next.getKey(), xs.nextKey(lastKey));
      assertEquals(next.getValue(), xs.nextValue(lastKey));
      lastKey = next.getKey();
    }
    assertNull(xs.next(lastKey));
    assertNull(xs.nextKey(lastKey));
    assertNull(xs.nextValue(lastKey));
    assertEquals(15, sum);

    xs = xs.removed(new HashedValue<Integer>(5, 1));
    assertEquals(2, xs.size());
    assertTrue(xs.containsKey(new HashedValue<Integer>(3, 1)));
    assertFalse(xs.containsKey(new HashedValue<Integer>(5, 1)));
    assertTrue(xs.containsKey(new HashedValue<Integer>(7, 1)));
    assertEquals(3, xs.get(new HashedValue<Integer>(3, 1)));
    assertNull(xs.get(new HashedValue<Integer>(5, 1)));
    assertEquals(7, xs.get(new HashedValue<Integer>(7, 1)));
    iter = xs.iterator();
    sum = 0;
    lastKey = null;
    while (iter.hasNext()) {
      final Map.Entry<HashedValue<Integer>, Integer> next = iter.next();
      assertEquals(next.getValue().intValue(), next.getKey().get().intValue());
      sum += next.getValue().intValue();
      assertEquals(next, xs.next(lastKey));
      assertEquals(next.getKey(), xs.nextKey(lastKey));
      assertEquals(next.getValue(), xs.nextValue(lastKey));
      lastKey = next.getKey();
    }
    assertNull(xs.next(lastKey));
    assertNull(xs.nextKey(lastKey));
    assertNull(xs.nextValue(lastKey));
    assertEquals(10, sum);

    xs = xs.removed(new HashedValue<Integer>(3, 1));
    assertEquals(1, xs.size());
    assertFalse(xs.containsKey(new HashedValue<Integer>(3, 1)));
    assertFalse(xs.containsKey(new HashedValue<Integer>(5, 1)));
    assertTrue(xs.containsKey(new HashedValue<Integer>(7, 1)));
    assertNull(xs.get(new HashedValue<Integer>(3, 1)));
    assertNull(xs.get(new HashedValue<Integer>(5, 1)));
    assertEquals(7, xs.get(new HashedValue<Integer>(7, 1)));
    iter = xs.iterator();
    sum = 0;
    lastKey = null;
    while (iter.hasNext()) {
      final Map.Entry<HashedValue<Integer>, Integer> next = iter.next();
      assertEquals(next.getValue().intValue(), next.getKey().get().intValue());
      sum += next.getValue().intValue();
      assertEquals(next, xs.next(lastKey));
      assertEquals(next.getKey(), xs.nextKey(lastKey));
      assertEquals(next.getValue(), xs.nextValue(lastKey));
      lastKey = next.getKey();
    }
    assertNull(xs.next(lastKey));
    assertNull(xs.nextKey(lastKey));
    assertNull(xs.nextValue(lastKey));
    assertEquals(7, sum);

    xs = xs.removed(new HashedValue<Integer>(7, 1));
    assertTrue(xs.isEmpty());
    assertEquals(0, xs.size());
    assertFalse(xs.containsKey(new HashedValue<Integer>(3, 1)));
    assertFalse(xs.containsKey(new HashedValue<Integer>(5, 1)));
    assertFalse(xs.containsKey(new HashedValue<Integer>(7, 1)));
    assertNull(xs.get(new HashedValue<Integer>(3, 1)));
    assertNull(xs.get(new HashedValue<Integer>(5, 1)));
    assertNull(xs.get(new HashedValue<Integer>(7, 1)));
    iter = xs.iterator();
    assertFalse(iter.hasNext());
  }

  @Test
  @Tag("slow")
  public void testIterate() {
    HashTrieMap<String, Integer> xs = HashTrieMap.empty();
    final int limit = 3500000;
    int i = 0;
    while (i < limit) {
      xs = xs.updated(UUID.randomUUID().toString(), i);
      i++;
    }
    assertEquals(xs.size(), limit, "map size not same as expected");
    int count = 0;
    for (Map.Entry<String, Integer> unused : xs) {
      count += 1;
    }
    assertEquals(count, limit, "map iteration size not same as expected");
  }

  @Test
  public void testNextKey() {
    HashTrieMap<Integer, Integer> xs = HashTrieMap.empty();
    xs = xs.updated(0, 0);
    xs = xs.updated(1, 1);
    assertEquals((Object) 0, xs.nextKey(null));
    assertEquals((Object) 1, xs.nextKey(0));
    assertEquals(null, xs.nextKey(1));
  }

  @Test
  public void testNextValue() {
    HashTrieMap<Integer, Integer> xs = HashTrieMap.empty();
    xs = xs.updated(0, 0);
    xs = xs.updated(1, 1);
    assertEquals((Object) 0, xs.nextValue(null));
    assertEquals((Object) 1, xs.nextValue(0));
    assertEquals(null, xs.nextValue(1));
  }

}
