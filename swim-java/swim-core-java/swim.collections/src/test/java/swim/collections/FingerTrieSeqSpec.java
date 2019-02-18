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
import java.util.ListIterator;
import org.testng.annotations.Test;
import swim.util.Builder;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

public class FingerTrieSeqSpec {
  @Test
  public void testEmpty() {
    assertTrue(FingerTrieSeq.empty().isEmpty());
    assertEquals(FingerTrieSeq.empty().size(), 0);
  }

  @Test
  public void testUnary() {
    final FingerTrieSeq<String> xs = FingerTrieSeq.of("unit");
    assertFalse(xs.isEmpty());
    final Iterator<String> iter = xs.iterator();
    assertTrue(iter.hasNext());
    assertEquals(iter.next(), "unit");
    assertFalse(iter.hasNext());
  }

  @Test
  public void testRemoved() {
    assertEquals(FingerTrieSeq.of(1, 2, 3, 4).removed(0), FingerTrieSeq.of(2, 3, 4));
    assertEquals(FingerTrieSeq.of(1, 2, 3, 4).removed(1), FingerTrieSeq.of(1, 3, 4));
    assertEquals(FingerTrieSeq.of(1, 2, 3, 4).removed(2), FingerTrieSeq.of(1, 2, 4));
    assertEquals(FingerTrieSeq.of(1, 2, 3, 4).removed(3), FingerTrieSeq.of(1, 2, 3));
  }

  @Test
  public void testComposeSeqs() {
    for (int k = 4; k <= 20; k += 4) {
      final int n = 1 << k;
      testCompose(n);
    }
  }
  private void testCompose(int n) {
    System.out.println("Composing FingerTrieSeq with " + n + " elements ...");
    final Builder<Integer, FingerTrieSeq<Integer>> builder = FingerTrieSeq.builder();
    for (int i = 1; i <= n; i += 1) {
      builder.add(i);
    }
    final FingerTrieSeq<Integer> xs = builder.bind();
    assertFalse(xs.isEmpty());
    assertEquals(xs.size(), n);
    final Iterator<Integer> iter = xs.iterator();
    long sum = 0L;
    while (iter.hasNext()) {
      sum += iter.next().longValue();
    }
    assertEquals(sum, ((long) n * ((long) n + 1L) / 2L), "sum of first " + n + " integers");
  }

  @Test
  public void testDropSeqs() {
    testDrop((1 << 10) + 1);
    testDrop((1 << 15) + 1);
  }
  private void testDrop(int n) {
    final Builder<Integer, FingerTrieSeq<Integer>> builder = FingerTrieSeq.builder();
    for (int i = 0; i <= n; i += 1) {
      builder.add(i);
    }
    final FingerTrieSeq<Integer> xs = builder.bind();
    for (int a = 0; a < n; a += 1) {
      final FingerTrieSeq<Integer> ys = xs.drop(a);
      final Iterator<Integer> iter = ys.iterator();
      for (int i = a; i < n; i += 1) {
        final int y = iter.next();
        assertEquals(y, i);
      }
    }
  }

  @Test
  public void testTakeSeqs() {
    testTake((1 << 10) + 1);
    testTake((1 << 15) + 1);
  }
  private void testTake(int n) {
    final Builder<Integer, FingerTrieSeq<Integer>> builder = FingerTrieSeq.builder();
    for (int i = 0; i <= n; i += 1) {
      builder.add(i);
    }
    final FingerTrieSeq<Integer> xs = builder.bind();
    for (int b = 0; b < n; b += 1) {
      final FingerTrieSeq<Integer> ys = xs.take(b);
      final Iterator<Integer> iter = ys.iterator();
      for (int i = 0; i < b; i += 1) {
        final int y = iter.next();
        assertEquals(y, i);
      }
    }
  }

  @Test
  public void testAppendAndDropSeqs() {
    for (int appendCount = 0; appendCount < 128; appendCount += 1) {
      for (int dropCount = 0; dropCount < appendCount; dropCount += 1) {
        testAppendAndDrop(appendCount, dropCount);
      }
    }
  }
  private void testAppendAndDrop(int appendCount, int dropCount) {
    FingerTrieSeq<Integer> xs = FingerTrieSeq.empty();
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
      assertEquals(xs.get(i).intValue(), i + dropCount);
    }
  }

  @Test
  public void testPrependAndDropSeqs() {
    for (int prependCount = 0; prependCount < 128; prependCount += 1) {
      for (int dropCount = 0; dropCount < prependCount; dropCount += 1) {
        testAppendAndDrop(prependCount, dropCount);
      }
    }
  }
  private void testPrependAndDrop(int prependCount, int dropCount) {
    FingerTrieSeq<Integer> xs = FingerTrieSeq.empty();
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
      assertEquals(xs.get(i).intValue(), prependCount +  dropCount - i - 1);
    }
  }

  @Test
  public void testListIterator() {
    testListIteratorSize((1 << 10) + 1);
    testListIteratorSize((1 << 15) + 1);
  }
  private void testListIteratorSize(int n) {
    final Builder<Integer, FingerTrieSeq<Integer>> builder = FingerTrieSeq.builder();
    for (int i = 0; i <= n; i += 1) {
      builder.add(i);
    }
    final FingerTrieSeq<Integer> xs = builder.bind();
    for (int a = 0; a < n; a += 1) {
      final ListIterator<Integer> iter = xs.listIterator(a);
      for (int i = a; i < n; i += 1) {
        assertTrue(iter.hasNext());
        final int y = iter.next();
        assertEquals(y, i);
      }
    }
  }

  @Test
  public void testReverseListIterator() {
    testReverseListIteratorSize((1 << 10) + 1);
    testReverseListIteratorSize((1 << 15) + 1);
  }
  private void testReverseListIteratorSize(int n) {
    final Builder<Integer, FingerTrieSeq<Integer>> builder = FingerTrieSeq.builder();
    for (int i = 0; i <= n; i += 1) {
      builder.add(i);
    }
    final FingerTrieSeq<Integer> xs = builder.bind();
    for (int b = 0; b < n; b += 1) {
      final ListIterator<Integer> iter = xs.listIterator(b);
      for (int i = b - 1; i >= 0; i -= 1) {
        assertTrue(iter.hasPrevious());
        final int y = iter.previous();
        assertEquals(y, i);
      }
      assertFalse(iter.hasPrevious());
    }
  }
}
