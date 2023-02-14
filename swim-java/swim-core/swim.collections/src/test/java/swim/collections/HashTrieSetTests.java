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
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class HashTrieSetTests {

  @Test
  public void testEmpty() {
    assertTrue(HashTrieSet.empty().isEmpty());
    assertEquals(0, HashTrieSet.empty().size());
    assertNull(HashTrieSet.empty().head());
    assertNull(HashTrieSet.empty().next(null));
  }

  @Test
  public void testUnary() {
    final HashTrieSet<String> xs = HashTrieSet.of("unit");
    assertFalse(xs.isEmpty());
    assertEquals("unit", xs.head());
    assertEquals("unit", xs.next(null));
    final Iterator<String> iter = xs.iterator();
    assertTrue(iter.hasNext());
    assertEquals("unit", iter.next());
    assertFalse(iter.hasNext());
  }

  @Test
  public void testComposeSets() {
    for (int k = 4; k <= 20; k += 4) {
      final int n = 1 << k;
      this.testCompose(n);
    }
  }

  private void testCompose(int n) {
    System.out.println("Composing HashTrieSet with " + n + " elements ...");
    HashTrieSet<HashedInteger> xs = HashTrieSet.empty();
    for (int i = 1; i <= n; i += 1) {
      xs = xs.added(HashedInteger.valueOf(i));
    }
    assertFalse(xs.isEmpty());
    assertEquals(n, xs.size());
    long sum = 0L;
    HashedInteger last = null;
    for (HashedInteger x : xs) {
      sum += x.longValue();
      assertEquals(x, xs.next(last));
      last = x;
    }
    assertNull(xs.next(last));
    assertEquals(((long) n * ((long) n + 1L) / 2L), sum, "sum of first " + n + " integers");
  }

  @Test
  public void testDecomposeSmallSets() {
    for (int n = 4; n <= 1024; n *= 2) {
      this.testDecompose(n);
    }
  }

  @Test
  @Tag("slow")
  public void testDecomposeLargeSets() {
    this.testDecompose(1 << 15);
  }

  private void testDecompose(int n) {
    System.out.println("Decomposing HashTrieSet with " + n + " elements ...");
    HashTrieSet<HashedInteger> xs = HashTrieSet.empty();
    for (int i = 1; i <= n; i += 1) {
      xs = xs.added(HashedInteger.valueOf(i));
    }
    for (int i = n; i > 0; i -= 1) {
      long sum = 0L;
      HashedInteger last = null;
      for (HashedInteger x : xs) {
        sum += x.longValue();
        assertEquals(x, xs.next(last));
        last = x;
      }
      assertNull(xs.next(last));
      final long expected = ((long) i * ((long) i + 1L) / 2L);
      assertEquals(expected, sum, "sum of first " + i + " of " + n + " integers");
      xs = xs.removed(HashedInteger.valueOf(i));
    }
  }

  @Test
  public void testCollisions() {
    HashTrieSet<HashedValue<Integer>> xs = HashTrieSet.empty();
    xs = xs.added(new HashedValue<Integer>(3, 1));
    xs = xs.added(new HashedValue<Integer>(5, 1));
    xs = xs.added(new HashedValue<Integer>(7, 1));
    assertEquals(3, xs.size());
    assertTrue(xs.contains(new HashedValue<Integer>(3, 1)));
    assertTrue(xs.contains(new HashedValue<Integer>(5, 1)));
    assertTrue(xs.contains(new HashedValue<Integer>(7, 1)));

    int sum = 0;
    HashedValue<Integer> last = null;
    for (HashedValue<Integer> x : xs) {
      sum += x.get().intValue();
      assertEquals(x, xs.next(last));
      last = x;
    }
    assertNull(xs.next(last));
    assertEquals(15, sum);

    xs = xs.removed(new HashedValue<Integer>(5, 1));
    assertEquals(2, xs.size());
    assertTrue(xs.contains(new HashedValue<Integer>(3, 1)));
    assertFalse(xs.contains(new HashedValue<Integer>(5, 1)));
    assertTrue(xs.contains(new HashedValue<Integer>(7, 1)));
    sum = 0;
    last = null;
    for (HashedValue<Integer> x : xs) {
      sum += x.get().intValue();
      assertEquals(x, xs.next(last));
      last = x;
    }
    assertNull(xs.next(last));
    assertEquals(10, sum);

    xs = xs.removed(new HashedValue<Integer>(3, 1));
    assertEquals(1, xs.size());
    assertFalse(xs.contains(new HashedValue<Integer>(3, 1)));
    assertFalse(xs.contains(new HashedValue<Integer>(5, 1)));
    assertTrue(xs.contains(new HashedValue<Integer>(7, 1)));
    sum = 0;
    last = null;
    for (HashedValue<Integer> x : xs) {
      sum += x.get().intValue();
      assertEquals(x, xs.next(last));
      last = x;
    }
    assertNull(xs.next(last));
    assertEquals(7, sum);

    xs = xs.removed(new HashedValue<Integer>(7, 1));
    assertTrue(xs.isEmpty());
    assertEquals(0, xs.size());
    assertFalse(xs.contains(new HashedValue<Integer>(3, 1)));
    assertFalse(xs.contains(new HashedValue<Integer>(5, 1)));
    assertFalse(xs.contains(new HashedValue<Integer>(7, 1)));
  }

}
