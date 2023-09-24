// Copyright 2015-2023 Nstream, inc.
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
import java.util.ListIterator;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class FingerTrieListTests {

  @Test
  public void testEmpty() {
    assertTrue(FingerTrieList.empty().isEmpty());
    assertEquals(0, FingerTrieList.empty().size());
  }

  @Test
  public void testUnary() {
    final FingerTrieList<String> xs = FingerTrieList.of("unit");
    assertFalse(xs.isEmpty());
    final Iterator<String> iter = xs.iterator();
    assertTrue(iter.hasNext());
    assertEquals("unit", iter.next());
    assertFalse(iter.hasNext());
  }

  @Test
  public void testRemoved() {
    for (int k = 0; k <= 12; k += 1) {
      final int n = 1 << k;
      this.testRemoved(n);
    }
  }

  private void testRemoved(int n) {
    System.out.println("Removing each element from FingerTrieList with " + n + " elements ...");
    final FingerTrieListBuilder<Integer> builder = new FingerTrieListBuilder<Integer>();
    for (int i = 0; i < n; i += 1) {
      builder.add(i);
    }
    final FingerTrieList<Integer> xs = builder.build();
    assertFalse(xs.isEmpty());
    assertEquals(n, xs.size());
    for (int i = 0; i < n; i += 1) {
      final FingerTrieList<Integer> ys = xs.removed(i);
      assertEquals(n - 1, ys.size());
      for (int j = 0; j < i; j += 1) {
        assertEquals(j, ys.get(j));
      }
      for (int j = i; j < n - 1; j += 1) {
        assertEquals(j + 1, ys.get(j));
      }
    }
  }

  @Test
  public void testRemovedPrefixesBackwards() {
    for (int k = 0; k <= 10; k += 1) {
      final int n = 1 << k;
      this.testRemovedPrefixesBackwards(n);
    }
  }

  private void testRemovedPrefixesBackwards(int n) {
    System.out.println("Removing backwards prefixes of FingerTrieList with " + n + " elements ...");
    final FingerTrieListBuilder<Integer> builder = new FingerTrieListBuilder<Integer>();
    for (int i = 0; i < n; i += 1) {
      builder.add(i);
    }
    final FingerTrieList<Integer> xs = builder.build();

    for (int i = 0; i < n; i += 1) {
      // Remove indexes from i down to 0
      FingerTrieList<Integer> ys = xs;
      for (int j = i; j >= 0; j -= 1) {
        ys = ys.removed(j);
        assertEquals(n - (i - j) - 1, ys.size());
        for (int k = 0; k < j; k += 1) {
          assertEquals(k, ys.get(k));
        }
        for (int k = j; k < ys.size(); k += 1) {
          assertEquals(i - j + k + 1, ys.get(k));
        }
      }
    }
  }

  @Test
  public void testRemovedSuffixesForwards() {
    for (int k = 0; k <= 10; k += 1) {
      final int n = 1 << k;
      this.testRemovedSuffixesForwards(n);
    }
  }

  private void testRemovedSuffixesForwards(int n) {
    System.out.println("Removing forwards suffixes of FingerTrieList with " + n + " elements ...");
    final FingerTrieListBuilder<Integer> builder = new FingerTrieListBuilder<Integer>();
    for (int i = 0; i < n; i += 1) {
      builder.add(i);
    }
    final FingerTrieList<Integer> xs = builder.build();

    for (int i = n - 1; i >= 0; i -= 1) {
      // Remove indexes from i up to n - 1
      FingerTrieList<Integer> ys = xs;
      for (int j = i; j < n; j += 1) {
        ys = ys.removed(i);
        assertEquals(n - (j - i) - 1, ys.size());
        for (int k = 0; k < i; k += 1) {
          assertEquals(k, ys.get(k));
        }
        for (int k = i; k < ys.size(); k += 1) {
          assertEquals(j - i + k + 1, ys.get(k));
        }
      }
    }
  }

  @Test
  public void testComposeLists() {
    for (int k = 4; k <= 20; k += 4) {
      final int n = 1 << k;
      this.testCompose(n);
    }
  }

  private void testCompose(int n) {
    System.out.println("Composing FingerTrieList with " + n + " elements ...");
    final FingerTrieListBuilder<Integer> builder = new FingerTrieListBuilder<Integer>();
    for (int i = 1; i <= n; i += 1) {
      builder.add(i);
    }
    final FingerTrieList<Integer> xs = builder.build();
    assertFalse(xs.isEmpty());
    assertEquals(n, xs.size());
    long sum = 0L;
    for (Integer x : xs) {
      sum += x.longValue();
    }
    assertEquals(((long) n * ((long) n + 1L) / 2L), sum, "sum of first " + n + " integers");
  }

  @Test
  public void testDropLists() {
    this.testDrop((1 << 10) + 1);
    this.testDrop((1 << 15) + 1);
  }

  private void testDrop(int n) {
    final FingerTrieListBuilder<Integer> builder = new FingerTrieListBuilder<Integer>();
    for (int i = 0; i <= n; i += 1) {
      builder.add(i);
    }
    final FingerTrieList<Integer> xs = builder.build();
    for (int a = 0; a < n; a += 1) {
      final FingerTrieList<Integer> ys = xs.drop(a);
      final Iterator<Integer> iter = ys.iterator();
      for (int i = a; i < n; i += 1) {
        final int y = iter.next();
        assertEquals(i, y);
      }
    }
  }

  @Test
  public void testTakeLists() {
    this.testTake((1 << 10) + 1);
    this.testTake((1 << 15) + 1);
  }

  private void testTake(int n) {
    final FingerTrieListBuilder<Integer> builder = new FingerTrieListBuilder<Integer>();
    for (int i = 0; i <= n; i += 1) {
      builder.add(i);
    }
    final FingerTrieList<Integer> xs = builder.build();
    for (int b = 0; b < n; b += 1) {
      final FingerTrieList<Integer> ys = xs.take(b);
      final Iterator<Integer> iter = ys.iterator();
      for (int i = 0; i < b; i += 1) {
        final int y = iter.next();
        assertEquals(i, y);
      }
    }
  }

  @Test
  public void testAppendAndDropLists() {
    for (int appendCount = 0; appendCount < 128; appendCount += 1) {
      for (int dropCount = 0; dropCount < appendCount; dropCount += 1) {
        this.testAppendAndDrop(appendCount, dropCount);
      }
    }
  }

  private void testAppendAndDrop(int appendCount, int dropCount) {
    FingerTrieList<Integer> xs = FingerTrieList.empty();
    for (int i = 0; i < appendCount; i += 1) {
      xs = xs.appended(i);
    }
    for (int j = 0; j < dropCount; j += 1) {
      xs = xs.tail();
    }
    for (int i = appendCount; i < appendCount + dropCount; i += 1) {
      xs = xs.appended(i);
    }
    for (int i = 0; i < appendCount; i += 1) {
      assertEquals(i + dropCount, xs.get(i));
    }
  }

  @Test
  public void testPrependAndDropLists() {
    for (int prependCount = 0; prependCount < 128; prependCount += 1) {
      for (int dropCount = 0; dropCount < prependCount; dropCount += 1) {
        this.testPrependAndDrop(prependCount, dropCount);
      }
    }
  }

  private void testPrependAndDrop(int prependCount, int dropCount) {
    FingerTrieList<Integer> xs = FingerTrieList.empty();
    for (int i = 0; i < prependCount; i += 1) {
      xs = xs.prepended(i);
    }
    for (int j = 0; j < dropCount; j += 1) {
      xs = xs.body();
    }
    for (int i = prependCount; i < prependCount + dropCount; i += 1) {
      xs = xs.prepended(i);
    }
    for (int i = 0; i < prependCount; i += 1) {
      assertEquals(prependCount + dropCount - i - 1, xs.get(i));
    }
  }

  @Test
  public void testListIterator() {
    this.testListIteratorSize((1 << 10) + 1);
    this.testListIteratorSize((1 << 15) + 1);
  }

  private void testListIteratorSize(int n) {
    final FingerTrieListBuilder<Integer> builder = new FingerTrieListBuilder<Integer>();
    for (int i = 0; i <= n; i += 1) {
      builder.add(i);
    }
    final FingerTrieList<Integer> xs = builder.build();
    for (int a = 0; a < n; a += 1) {
      final ListIterator<Integer> iter = xs.listIterator(a);
      for (int i = a; i < n; i += 1) {
        assertTrue(iter.hasNext());
        final int y = iter.next();
        assertEquals(i, y);
      }
    }
  }

  @Test
  public void testReverseListIterator() {
    this.testReverseListIteratorSize((1 << 10) + 1);
    this.testReverseListIteratorSize((1 << 15) + 1);
  }

  private void testReverseListIteratorSize(int n) {
    final FingerTrieListBuilder<Integer> builder = new FingerTrieListBuilder<Integer>();
    for (int i = 0; i <= n; i += 1) {
      builder.add(i);
    }
    final FingerTrieList<Integer> xs = builder.build();
    for (int b = 0; b < n; b += 1) {
      final ListIterator<Integer> iter = xs.listIterator(b);
      for (int i = b - 1; i >= 0; i -= 1) {
        assertTrue(iter.hasPrevious());
        final int y = iter.previous();
        assertEquals(i, y);
      }
      assertFalse(iter.hasPrevious());
    }
  }

}
