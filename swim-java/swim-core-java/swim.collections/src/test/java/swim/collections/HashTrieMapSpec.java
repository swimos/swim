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

package swim.collections;

import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNull;
import static org.testng.Assert.assertTrue;

public class HashTrieMapSpec {
  @Test
  public void testEmpty() {
    assertTrue(HashTrieMap.empty().isEmpty());
    assertEquals(HashTrieMap.empty().size(), 0);
    assertNull(HashTrieMap.empty().head());
    assertNull(HashTrieMap.empty().headKey());
    assertNull(HashTrieMap.empty().headValue());
    assertNull(HashTrieMap.empty().next(null));
    assertNull(HashTrieMap.empty().nextKey(null));
    assertNull(HashTrieMap.empty().nextValue(null));
  }

  @Test
  public void testUnary() {
    final HashTrieMap<String, Integer> xs = HashTrieMap.of("one", 1);
    assertFalse(xs.isEmpty());
    assertEquals(xs.next(null).getKey(), "one");
    assertEquals(xs.next(null).getValue().intValue(), 1);
    assertEquals(xs.nextKey(null), "one");
    assertEquals(xs.nextValue(null).intValue(), 1);
    final Iterator<Map.Entry<String, Integer>> iter = xs.iterator();
    assertTrue(iter.hasNext());
    final Map.Entry<String, Integer> entry = iter.next();
    assertEquals(entry.getKey(), "one");
    assertEquals(entry.getValue().intValue(), 1);
    assertFalse(iter.hasNext());
  }

  @Test
  public void testComposeMaps() {
    for (int k = 4; k <= 20; k += 4) {
      final int n = 1 << k;
      testCompose(n);
    }
  }

  private void testCompose(int n) {
    System.out.println("Composing HashTrieMap with " + n + " entries ...");
    HashTrieMap<HashedInteger, Integer> xs = HashTrieMap.empty();
    for (int i = 1; i <= n; i += 1) {
      xs = xs.updated(HashedInteger.valueOf(-i), i);
    }
    assertFalse(xs.isEmpty());
    assertEquals(xs.size(), n);
    final Iterator<Map.Entry<HashedInteger, Integer>> iter = xs.iterator();
    long sum = 0L;
    HashedInteger lastKey = null;
    while (iter.hasNext()) {
      final Map.Entry<HashedInteger, Integer> next = iter.next();
      assertEquals(-next.getKey().intValue(), next.getValue().intValue());
      sum += next.getValue().longValue();
      assertEquals(xs.next(lastKey), next);
      assertEquals(xs.nextKey(lastKey), next.getKey());
      assertEquals(xs.nextValue(lastKey), next.getValue());
      lastKey = next.getKey();
    }
    assertEquals(xs.next(lastKey), xs.head());
    assertEquals(xs.nextKey(lastKey), xs.headKey());
    assertEquals(xs.nextValue(lastKey), xs.headValue());
    assertEquals(sum, ((long) n * ((long) n + 1L) / 2L), "sum of first " + n + " integers");
  }

  @Test
  public void testDecomposeSmallMaps() {
    for (int n = 4; n <= 1024; n *= 2) {
      testDecompose(n);
    }
  }

  @Test(groups = {"slow"})
  public void testDecomposeLargeMaps() {
    testDecompose(1 << 15);
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
        assertEquals(-next.getKey().intValue(), next.getValue().intValue());
        sum += next.getValue().longValue();
        assertEquals(xs.next(lastKey), next);
        assertEquals(xs.nextKey(lastKey), next.getKey());
        assertEquals(xs.nextValue(lastKey), next.getValue());
        lastKey = next.getKey();
      }
      assertEquals(xs.next(lastKey), xs.head());
      assertEquals(xs.nextKey(lastKey), xs.headKey());
      assertEquals(xs.nextValue(lastKey), xs.headValue());
      final long expected = ((long) i * ((long) i + 1L) / 2L);
      assertEquals(sum, expected, "sum of first " + i + " of " + n + " integers");
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
    assertEquals(xs.size(), 3);
    assertTrue(xs.containsKey(new HashedValue<Integer>(3, 1)));
    assertTrue(xs.containsKey(new HashedValue<Integer>(5, 1)));
    assertTrue(xs.containsKey(new HashedValue<Integer>(7, 1)));
    assertEquals(xs.get(new HashedValue<Integer>(3, 1)).intValue(), 3);
    assertEquals(xs.get(new HashedValue<Integer>(5, 1)).intValue(), 5);
    assertEquals(xs.get(new HashedValue<Integer>(7, 1)).intValue(), 7);

    Iterator<Map.Entry<HashedValue<Integer>, Integer>> iter = xs.iterator();
    int sum = 0;
    HashedValue<Integer> lastKey = null;
    while (iter.hasNext()) {
      final Map.Entry<HashedValue<Integer>, Integer> next = iter.next();
      assertEquals(next.getKey().get().intValue(), next.getValue().intValue());
      sum += next.getValue().intValue();
      assertEquals(xs.next(lastKey), next);
      assertEquals(xs.nextKey(lastKey), next.getKey());
      assertEquals(xs.nextValue(lastKey), next.getValue());
      lastKey = next.getKey();
    }
    assertEquals(xs.next(lastKey), xs.head());
    assertEquals(xs.nextKey(lastKey), xs.headKey());
    assertEquals(xs.nextValue(lastKey), xs.headValue());
    assertEquals(sum, 15);

    xs = xs.removed(new HashedValue<Integer>(5, 1));
    assertEquals(xs.size(), 2);
    assertTrue(xs.containsKey(new HashedValue<Integer>(3, 1)));
    assertFalse(xs.containsKey(new HashedValue<Integer>(5, 1)));
    assertTrue(xs.containsKey(new HashedValue<Integer>(7, 1)));
    assertEquals(xs.get(new HashedValue<Integer>(3, 1)).intValue(), 3);
    assertNull(xs.get(new HashedValue<Integer>(5, 1)));
    assertEquals(xs.get(new HashedValue<Integer>(7, 1)).intValue(), 7);
    iter = xs.iterator();
    sum = 0;
    lastKey = null;
    while (iter.hasNext()) {
      final Map.Entry<HashedValue<Integer>, Integer> next = iter.next();
      assertEquals(next.getKey().get().intValue(), next.getValue().intValue());
      sum += next.getValue().intValue();
      assertEquals(xs.next(lastKey), next);
      assertEquals(xs.nextKey(lastKey), next.getKey());
      assertEquals(xs.nextValue(lastKey), next.getValue());
      lastKey = next.getKey();
    }
    assertEquals(xs.next(lastKey), xs.head());
    assertEquals(xs.nextKey(lastKey), xs.headKey());
    assertEquals(xs.nextValue(lastKey), xs.headValue());
    assertEquals(sum, 10);

    xs = xs.removed(new HashedValue<Integer>(3, 1));
    assertEquals(xs.size(), 1);
    assertFalse(xs.containsKey(new HashedValue<Integer>(3, 1)));
    assertFalse(xs.containsKey(new HashedValue<Integer>(5, 1)));
    assertTrue(xs.containsKey(new HashedValue<Integer>(7, 1)));
    assertNull(xs.get(new HashedValue<Integer>(3, 1)));
    assertNull(xs.get(new HashedValue<Integer>(5, 1)));
    assertEquals(xs.get(new HashedValue<Integer>(7, 1)).intValue(), 7);
    iter = xs.iterator();
    sum = 0;
    lastKey = null;
    while (iter.hasNext()) {
      final Map.Entry<HashedValue<Integer>, Integer> next = iter.next();
      assertEquals(next.getKey().get().intValue(), next.getValue().intValue());
      sum += next.getValue().intValue();
      assertEquals(xs.next(lastKey), next);
      assertEquals(xs.nextKey(lastKey), next.getKey());
      assertEquals(xs.nextValue(lastKey), next.getValue());
      lastKey = next.getKey();
    }
    assertEquals(xs.next(lastKey), xs.head());
    assertEquals(xs.nextKey(lastKey), xs.headKey());
    assertEquals(xs.nextValue(lastKey), xs.headValue());
    assertEquals(sum, 7);

    xs = xs.removed(new HashedValue<Integer>(7, 1));
    assertTrue(xs.isEmpty());
    assertEquals(xs.size(), 0);
    assertFalse(xs.containsKey(new HashedValue<Integer>(3, 1)));
    assertFalse(xs.containsKey(new HashedValue<Integer>(5, 1)));
    assertFalse(xs.containsKey(new HashedValue<Integer>(7, 1)));
    assertNull(xs.get(new HashedValue<Integer>(3, 1)));
    assertNull(xs.get(new HashedValue<Integer>(5, 1)));
    assertNull(xs.get(new HashedValue<Integer>(7, 1)));
    iter = xs.iterator();
    assertFalse(iter.hasNext());
  }

  @Test(groups = {"slow"})
  public void testIterate() {
    HashTrieMap<String, Integer> xs = HashTrieMap.empty();
    final int limit = 3500000;
    int i = 0;
    while (i < limit) {
      xs = xs.updated(UUID.randomUUID().toString(), i);
      i++;
    }
    System.out.println("map size "  + xs.size());
    assertEquals(limit, xs.size(), "map size not same as expected");
    int count = 0;
    for (Map.Entry<String, Integer> x : xs) {
      count += 1;
    }
    System.out.println("count "  + count);
    assertEquals(limit, count, "map iteration size not same as expected");
  }
}
