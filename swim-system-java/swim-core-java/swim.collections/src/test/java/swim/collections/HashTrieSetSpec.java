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
import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNull;
import static org.testng.Assert.assertTrue;

public class HashTrieSetSpec {
  @Test
  public void testEmpty() {
    assertTrue(HashTrieSet.empty().isEmpty());
    assertEquals(HashTrieSet.empty().size(), 0);
    assertNull(HashTrieSet.empty().head());
    assertNull(HashTrieSet.empty().next(null));
  }

  @Test
  public void testUnary() {
    final HashTrieSet<String> xs = HashTrieSet.of("unit");
    assertFalse(xs.isEmpty());
    assertEquals(xs.head(), "unit");
    assertEquals(xs.next(null), "unit");
    final Iterator<String> iter = xs.iterator();
    assertTrue(iter.hasNext());
    assertEquals(iter.next(), "unit");
    assertFalse(iter.hasNext());
  }

  @Test
  public void testComposeSets() {
    for (int k = 4; k <= 20; k += 4) {
      final int n = 1 << k;
      testCompose(n);
    }
  }

  private void testCompose(int n) {
    System.out.println("Composing HashTrieSet with " + n + " elements ...");
    HashTrieSet<HashedInteger> xs = HashTrieSet.empty();
    for (int i = 1; i <= n; i += 1) {
      xs = xs.added(HashedInteger.valueOf(i));
    }
    assertFalse(xs.isEmpty());
    assertEquals(xs.size(), n);
    final Iterator<HashedInteger> iter = xs.iterator();
    long sum = 0L;
    HashedInteger last = null;
    while (iter.hasNext()) {
      final HashedInteger next = iter.next();
      sum += next.longValue();
      assertEquals(xs.next(last), next);
      last = next;
    }
    assertEquals(xs.next(last), xs.head());
    assertEquals(sum, ((long) n * ((long) n + 1L) / 2L), "sum of first " + n + " integers");
  }

  @Test
  public void testDecomposeSmallSets() {
    for (int n = 4; n <= 1024; n *= 2) {
      testDecompose(n);
    }
  }

  @Test(groups = {"slow"})
  public void testDecomposeLargeSets() {
    testDecompose(1 << 15);
  }

  private void testDecompose(int n) {
    System.out.println("Decomposing HashTrieSet with " + n + " elements ...");
    HashTrieSet<HashedInteger> xs = HashTrieSet.empty();
    for (int i = 1; i <= n; i += 1) {
      xs = xs.added(HashedInteger.valueOf(i));
    }
    for (int i = n; i > 0; i -= 1) {
      final Iterator<HashedInteger> iter = xs.iterator();
      long sum = 0L;
      HashedInteger last = null;
      while (iter.hasNext()) {
        final HashedInteger next = iter.next();
        sum += next.longValue();
        assertEquals(xs.next(last), next);
        last = next;
      }
      assertEquals(xs.next(last), xs.head());
      final long expected = ((long) i * ((long) i + 1L) / 2L);
      assertEquals(sum, expected, "sum of first " + i + " of " + n + " integers");
      xs = xs.removed(HashedInteger.valueOf(i));
    }
  }

  @Test
  public void testCollisions() {
    HashTrieSet<HashedValue<Integer>> xs = HashTrieSet.empty();
    xs = xs.added(new HashedValue<Integer>(3, 1));
    xs = xs.added(new HashedValue<Integer>(5, 1));
    xs = xs.added(new HashedValue<Integer>(7, 1));
    assertEquals(xs.size(), 3);
    assertTrue(xs.contains(new HashedValue<Integer>(3, 1)));
    assertTrue(xs.contains(new HashedValue<Integer>(5, 1)));
    assertTrue(xs.contains(new HashedValue<Integer>(7, 1)));

    Iterator<HashedValue<Integer>> iter = xs.iterator();
    int sum = 0;
    HashedValue<Integer> last = null;
    while (iter.hasNext()) {
      final HashedValue<Integer> next = iter.next();
      sum += next.get().intValue();
      assertEquals(xs.next(last), next);
      last = next;
    }
    assertEquals(xs.next(last), xs.head());
    assertEquals(sum, 15);

    xs = xs.removed(new HashedValue<Integer>(5, 1));
    assertEquals(xs.size(), 2);
    assertTrue(xs.contains(new HashedValue<Integer>(3, 1)));
    assertFalse(xs.contains(new HashedValue<Integer>(5, 1)));
    assertTrue(xs.contains(new HashedValue<Integer>(7, 1)));
    iter = xs.iterator();
    sum = 0;
    last = null;
    while (iter.hasNext()) {
      final HashedValue<Integer> next = iter.next();
      sum += next.get().intValue();
      assertEquals(xs.next(last), next);
      last = next;
    }
    assertEquals(xs.next(last), xs.head());
    assertEquals(sum, 10);

    xs = xs.removed(new HashedValue<Integer>(3, 1));
    assertEquals(xs.size(), 1);
    assertFalse(xs.contains(new HashedValue<Integer>(3, 1)));
    assertFalse(xs.contains(new HashedValue<Integer>(5, 1)));
    assertTrue(xs.contains(new HashedValue<Integer>(7, 1)));
    iter = xs.iterator();
    sum = 0;
    last = null;
    while (iter.hasNext()) {
      final HashedValue<Integer> next = iter.next();
      sum += next.get().intValue();
      assertEquals(xs.next(last), next);
      last = next;
    }
    assertEquals(xs.next(last), xs.head());
    assertEquals(sum, 7);

    xs = xs.removed(new HashedValue<Integer>(7, 1));
    assertTrue(xs.isEmpty());
    assertEquals(xs.size(), 0);
    assertFalse(xs.contains(new HashedValue<Integer>(3, 1)));
    assertFalse(xs.contains(new HashedValue<Integer>(5, 1)));
    assertFalse(xs.contains(new HashedValue<Integer>(7, 1)));
    iter = xs.iterator();
    assertFalse(iter.hasNext());
  }
}
