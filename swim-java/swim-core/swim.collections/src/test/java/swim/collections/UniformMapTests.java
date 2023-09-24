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

import java.util.AbstractMap.SimpleEntry;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.platform.commons.JUnitException;
import swim.util.Assume;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class UniformMapTests {

  @Test
  public void testEmpty() {
    final UniformMap<String, Integer> map = UniformMap.empty();
    assertTrue(map.isEmpty());
    assertEquals(0, map.size());
    assertEquals(0, map.shape().size());
  }

  @Test
  public void testEmptyEntryIterator() {
    final UniformMap<String, Integer> map = UniformMap.empty();
    final Iterator<Map.Entry<String, Integer>> iter = map.iterator();
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testEmptyKeyIterator() {
    final UniformMap<String, Integer> map = UniformMap.empty();
    final Iterator<String> iter = map.keyIterator();
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testEmptyValueIterator() {
    final UniformMap<String, Integer> map = UniformMap.empty();
    final Iterator<Integer> iter = map.valueIterator();
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testEmptyRemoveNonExistent() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.remove("a");
    assertTrue(map.isEmpty());
    assertEquals(0, map.size());
    assertEquals(0, map.shape().size());
  }

  @Test
  public void testInline1() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    assertFalse(map.isEmpty());
    assertEquals(1, map.size());
    assertEquals(1, map.shape().size());
    assertEquals(2, map.get("x"));
  }

  @Test
  public void testInline1EntryIterator() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);

    final Iterator<Map.Entry<String, Integer>> iter = map.iterator();
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Integer>("x", 2), iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline1KeyIterator() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);

    final Iterator<String> iter = map.keyIterator();
    assertTrue(iter.hasNext());
    assertEquals("x", iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline1ValueIterator() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);

    final Iterator<Integer> iter = map.valueIterator();
    assertTrue(iter.hasNext());
    assertEquals(2, iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline1RemoveNonExistent() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);

    map.remove("a");
    assertFalse(map.isEmpty());
    assertEquals(1, map.size());
    assertEquals(1, map.shape().size());
    assertEquals(2, map.get("x"));
  }

  @Test
  public void testInline1Remove() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);

    map.remove("x");
    assertTrue(map.isEmpty());
    assertEquals(0, map.size());
    assertEquals(0, map.shape().size());
    assertNull(map.get("x"));
  }

  @Test
  public void testInline2() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    assertFalse(map.isEmpty());
    assertEquals(2, map.size());
    assertEquals(2, map.shape().size());
    assertEquals(2, map.get("x"));
    assertEquals(3, map.get("y"));
  }

  @Test
  public void testInline2EntryIterator() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);

    final Iterator<Map.Entry<String, Integer>> iter = map.iterator();
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Integer>("x", 2), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Integer>("y", 3), iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline2KeyIterator() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);

    final Iterator<String> iter = map.keyIterator();
    assertTrue(iter.hasNext());
    assertEquals("x", iter.next());
    assertTrue(iter.hasNext());
    assertEquals("y", iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline2ValueIterator() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);

    final Iterator<Integer> iter = map.valueIterator();
    assertTrue(iter.hasNext());
    assertEquals(2, iter.next());
    assertTrue(iter.hasNext());
    assertEquals(3, iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline2RemoveNonExistent() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);

    map.remove("a");
    assertFalse(map.isEmpty());
    assertEquals(2, map.size());
    assertEquals(2, map.shape().size());
    assertEquals(2, map.get("x"));
    assertEquals(3, map.get("y"));
  }

  @Test
  public void testInline2RemoveForward() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);

    map.remove("x");
    assertFalse(map.isEmpty());
    assertEquals(1, map.size());
    assertEquals(-1, map.shape().size());
    assertNull(map.get("x"));
    assertEquals(3, map.get("y"));

    map.remove("y");
    assertTrue(map.isEmpty());
    assertEquals(0, map.size());
    assertEquals(-1, map.shape().size());
    assertNull(map.get("x"));
    assertNull(map.get("y"));
  }

  @Test
  public void testInline2RemoveReverse() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);

    map.remove("y");
    assertFalse(map.isEmpty());
    assertEquals(1, map.size());
    assertEquals(1, map.shape().size());
    assertEquals(2, map.get("x"));
    assertNull(map.get("y"));

    map.remove("x");
    assertTrue(map.isEmpty());
    assertEquals(0, map.size());
    assertEquals(0, map.shape().size());
    assertNull(map.get("x"));
    assertNull(map.get("y"));
  }

  @Test
  public void testInline3() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);
    assertFalse(map.isEmpty());
    assertEquals(3, map.size());
    assertEquals(3, map.shape().size());
    assertEquals(2, map.get("x"));
    assertEquals(3, map.get("y"));
    assertEquals(5, map.get("z"));
  }

  @Test
  public void testInline3EntryIterator() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);

    final Iterator<Map.Entry<String, Integer>> iter = map.iterator();
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Integer>("x", 2), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Integer>("y", 3), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Integer>("z", 5), iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline3KeyIterator() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);

    final Iterator<String> iter = map.keyIterator();
    assertTrue(iter.hasNext());
    assertEquals("x", iter.next());
    assertTrue(iter.hasNext());
    assertEquals("y", iter.next());
    assertTrue(iter.hasNext());
    assertEquals("z", iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline3ValueIterator() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);

    final Iterator<Integer> iter = map.valueIterator();
    assertTrue(iter.hasNext());
    assertEquals(2, iter.next());
    assertTrue(iter.hasNext());
    assertEquals(3, iter.next());
    assertTrue(iter.hasNext());
    assertEquals(5, iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline3RemoveNonExistent() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);

    map.remove("a");
    assertFalse(map.isEmpty());
    assertEquals(3, map.size());
    assertEquals(3, map.shape().size());
    assertEquals(2, map.get("x"));
    assertEquals(3, map.get("y"));
    assertEquals(5, map.get("z"));
  }

  @Test
  public void testInline3RemoveForward() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);

    map.remove("x");
    assertFalse(map.isEmpty());
    assertEquals(2, map.size());
    assertEquals(-1, map.shape().size());
    assertNull(map.get("x"));
    assertEquals(3, map.get("y"));
    assertEquals(5, map.get("z"));

    map.remove("y");
    assertFalse(map.isEmpty());
    assertEquals(1, map.size());
    assertEquals(-1, map.shape().size());
    assertNull(map.get("x"));
    assertNull(map.get("y"));
    assertEquals(5, map.get("z"));

    map.remove("z");
    assertTrue(map.isEmpty());
    assertEquals(0, map.size());
    assertEquals(-1, map.shape().size());
    assertNull(map.get("x"));
    assertNull(map.get("y"));
    assertNull(map.get("z"));
  }

  @Test
  public void testInline3RemoveReverse() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);

    map.remove("z");
    assertFalse(map.isEmpty());
    assertEquals(2, map.size());
    assertEquals(2, map.shape().size());
    assertEquals(2, map.get("x"));
    assertEquals(3, map.get("y"));
    assertNull(map.get("z"));

    map.remove("y");
    assertFalse(map.isEmpty());
    assertEquals(1, map.size());
    assertEquals(1, map.shape().size());
    assertEquals(2, map.get("x"));
    assertNull(map.get("y"));
    assertNull(map.get("z"));

    map.remove("x");
    assertTrue(map.isEmpty());
    assertEquals(0, map.size());
    assertEquals(0, map.shape().size());
    assertNull(map.get("x"));
    assertNull(map.get("y"));
    assertNull(map.get("z"));
  }

  @Test
  public void testInline3RemoveMiddle() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);

    map.remove("y");
    assertFalse(map.isEmpty());
    assertEquals(2, map.size());
    assertEquals(-1, map.shape().size());
    assertEquals(2, map.get("x"));
    assertNull(map.get("y"));
    assertEquals(5, map.get("z"));
  }

  @Test
  public void testPacked4() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);
    map.put("w", 7);
    assertFalse(map.isEmpty());
    assertEquals(4, map.size());
    assertEquals(4, map.shape().size());
    assertEquals(2, map.get("x"));
    assertEquals(3, map.get("y"));
    assertEquals(5, map.get("z"));
    assertEquals(7, map.get("w"));
  }

  @Test
  public void testPacked4EntryIterator() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);
    map.put("w", 7);

    final Iterator<Map.Entry<String, Integer>> iter = map.iterator();
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Integer>("x", 2), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Integer>("y", 3), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Integer>("z", 5), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Integer>("w", 7), iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testPacked4KeyIterator() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);
    map.put("w", 7);

    final Iterator<String> iter = map.keyIterator();
    assertTrue(iter.hasNext());
    assertEquals("x", iter.next());
    assertTrue(iter.hasNext());
    assertEquals("y", iter.next());
    assertTrue(iter.hasNext());
    assertEquals("z", iter.next());
    assertTrue(iter.hasNext());
    assertEquals("w", iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testPacked4ValueIterator() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);
    map.put("w", 7);

    final Iterator<Integer> iter = map.valueIterator();
    assertTrue(iter.hasNext());
    assertEquals(2, iter.next());
    assertTrue(iter.hasNext());
    assertEquals(3, iter.next());
    assertTrue(iter.hasNext());
    assertEquals(5, iter.next());
    assertTrue(iter.hasNext());
    assertEquals(7, iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testPacked4RemoveNonExistent() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);
    map.put("w", 7);

    map.remove("a");
    assertFalse(map.isEmpty());
    assertEquals(4, map.size());
    assertEquals(4, map.shape().size());
    assertEquals(2, map.get("x"));
    assertEquals(3, map.get("y"));
    assertEquals(5, map.get("z"));
    assertEquals(7, map.get("w"));
  }

  @Test
  public void testPacked4RemoveForward() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);
    map.put("w", 7);

    map.remove("x");
    assertFalse(map.isEmpty());
    assertEquals(3, map.size());
    assertEquals(-1, map.shape().size());
    assertNull(map.get("x"));
    assertEquals(3, map.get("y"));
    assertEquals(5, map.get("z"));
    assertEquals(7, map.get("w"));

    map.remove("y");
    assertFalse(map.isEmpty());
    assertEquals(2, map.size());
    assertEquals(-1, map.shape().size());
    assertNull(map.get("x"));
    assertNull(map.get("y"));
    assertEquals(5, map.get("z"));
    assertEquals(7, map.get("w"));

    map.remove("z");
    assertFalse(map.isEmpty());
    assertEquals(1, map.size());
    assertEquals(-1, map.shape().size());
    assertNull(map.get("x"));
    assertNull(map.get("y"));
    assertNull(map.get("z"));
    assertEquals(7, map.get("w"));

    map.remove("w");
    assertTrue(map.isEmpty());
    assertEquals(0, map.size());
    assertEquals(-1, map.shape().size());
    assertNull(map.get("x"));
    assertNull(map.get("y"));
    assertNull(map.get("z"));
    assertNull(map.get("w"));
  }

  @Test
  public void testPacked4RemoveReverse() {
    final UniformMap<String, Integer> map = UniformMap.of();
    map.put("x", 2);
    map.put("y", 3);
    map.put("z", 5);
    map.put("w", 7);

    map.remove("w");
    assertFalse(map.isEmpty());
    assertEquals(3, map.size());
    assertEquals(3, map.shape().size());
    assertEquals(2, map.get("x"));
    assertEquals(3, map.get("y"));
    assertEquals(5, map.get("z"));
    assertNull(map.get("w"));

    map.remove("z");
    assertFalse(map.isEmpty());
    assertEquals(2, map.size());
    assertEquals(2, map.shape().size());
    assertEquals(2, map.get("x"));
    assertEquals(3, map.get("y"));
    assertNull(map.get("z"));
    assertNull(map.get("w"));

    map.remove("y");
    assertFalse(map.isEmpty());
    assertEquals(1, map.size());
    assertEquals(1, map.shape().size());
    assertEquals(2, map.get("x"));
    assertNull(map.get("y"));
    assertNull(map.get("z"));
    assertNull(map.get("w"));

    map.remove("x");
    assertTrue(map.isEmpty());
    assertEquals(0, map.size());
    assertEquals(0, map.shape().size());
    assertNull(map.get("x"));
    assertNull(map.get("y"));
    assertNull(map.get("z"));
    assertNull(map.get("w"));
  }

  @Test
  public void testHashed() {
    final int size = 1 << 20;
    final UniformMap<String, Integer> map = UniformMap.of();
    for (int k = 1; k <= size; k += 1) {
      map.put(Integer.toString(k), k);
      assertFalse(map.isEmpty());
      assertEquals(k, map.size());
      if (Integer.bitCount(k) <= 2) {
        for (int i = 1; i <= k; i += 1) {
          assertEquals(i, map.get(Integer.toString(i)));
        }
      }
    }
  }

  @Test
  public void testHashedEntryIterator() {
    final int size = 1 << 20;
    final UniformMap<String, Integer> map = UniformMap.of();
    for (int k = 1; k <= size; k += 1) {
      map.put(Integer.toString(k), k);
      assertFalse(map.isEmpty());
      assertEquals(k, map.size());
      if (Integer.bitCount(k) <= 2) {
        final Iterator<Map.Entry<String, Integer>> iter = map.iterator();
        for (int i = 1; i <= k; i += 1) {
          assertTrue(iter.hasNext());
          assertEquals(new SimpleEntry<String, Integer>(Integer.toString(i), i), iter.next());
        }
        assertFalse(iter.hasNext());
        assertThrows(NoSuchElementException.class, () -> {
          iter.next();
        });
      }
    }
  }

  @Test
  public void testHashedKeyIterator() {
    final int size = 1 << 20;
    final UniformMap<String, Integer> map = UniformMap.of();
    for (int k = 1; k <= size; k += 1) {
      map.put(Integer.toString(k), k);
      assertFalse(map.isEmpty());
      assertEquals(k, map.size());
      if (Integer.bitCount(k) <= 2) {
        final Iterator<String> iter = map.keyIterator();
        for (int i = 1; i <= k; i += 1) {
          assertTrue(iter.hasNext());
          assertEquals(Integer.toString(i), iter.next());
        }
        assertFalse(iter.hasNext());
        assertThrows(NoSuchElementException.class, () -> {
          iter.next();
        });
      }
    }
  }

  @Test
  public void testHashedValueIterator() {
    final int size = 1 << 20;
    final UniformMap<String, Integer> map = UniformMap.of();
    for (int k = 1; k <= size; k += 1) {
      map.put(Integer.toString(k), k);
      assertFalse(map.isEmpty());
      assertEquals(k, map.size());
      if (Integer.bitCount(k) <= 2) {
        final Iterator<Integer> iter = map.valueIterator();
        for (int i = 1; i <= k; i += 1) {
          assertTrue(iter.hasNext());
          assertEquals(i, iter.next());
        }
        assertFalse(iter.hasNext());
        assertThrows(NoSuchElementException.class, () -> {
          iter.next();
        });
      }
    }
  }

  @Test
  @Tag("benchmark")
  public void benchmarkPackedLookups() {
    final int size = 32;
    final int lookups = 10000000;
    final int iterations = 10;
    final String[] keys = new String[size];
    final UniformMap<String, Integer> map = UniformMap.of();
    for (int i = 0; i < size; i += 1) {
      keys[i] = Integer.toString(i);
      map.put(keys[i], i);
    }

    System.out.println("Warming up ...");
    for (int i = 0; i < lookups; i += 1) {
      final int k = (int) (Math.random() * size);
      if (Assume.nonNull(map.get(keys[k])) != k) {
        throw new JUnitException("");
      }
    }

    System.out.println("Benchmarking ...");
    for (int iteration = 0; iteration < iterations; iteration += 1) {
      final long t0 = System.currentTimeMillis();
      for (int i = 0; i < lookups; i += 1) {
        final int k = (int) (Math.random() * size);
        if (Assume.nonNull(map.get(keys[k])) != k) {
          throw new JUnitException("");
        }
      }
      final long dt = System.currentTimeMillis() - t0;
      final long rate = Math.round((double) lookups * 1000.0 / (double) dt);
      System.out.println("Looked up " + lookups + " keys in " + dt + "ms (" + rate + "/sec)");
    }
  }

}
