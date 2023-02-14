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

package swim.repr;

import java.util.AbstractMap.SimpleEntry;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.platform.commons.JUnitException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ObjectReprTests {

  @Test
  public void testEmpty() {
    final ObjectRepr repr = ObjectRepr.empty();
    assertTrue(repr.isEmpty());
    assertEquals(0, repr.size());
    assertEquals(0, repr.shape().size());
  }

  @Test
  public void testEmptyEntryIterator() {
    final ObjectRepr repr = ObjectRepr.empty();
    final Iterator<Map.Entry<String, Repr>> iter = repr.iterator();
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testEmptyKeyIterator() {
    final ObjectRepr repr = ObjectRepr.empty();
    final Iterator<String> iter = repr.keyIterator();
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testEmptyValueIterator() {
    final ObjectRepr repr = ObjectRepr.empty();
    final Iterator<Repr> iter = repr.valueIterator();
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testEmptyRemoveNonExistent() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.remove("a");
    assertTrue(repr.isEmpty());
    assertEquals(0, repr.size());
    assertEquals(0, repr.shape().size());
  }

  @Test
  public void testInline1() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    assertFalse(repr.isEmpty());
    assertEquals(1, repr.size());
    assertEquals(1, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
  }

  @Test
  public void testInline1EntryIterator() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));

    final Iterator<Map.Entry<String, Repr>> iter = repr.iterator();
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Repr>("x", NumberRepr.of(2)), iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline1KeyIterator() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));

    final Iterator<String> iter = repr.keyIterator();
    assertTrue(iter.hasNext());
    assertEquals("x", iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline1ValueIterator() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));

    final Iterator<Repr> iter = repr.valueIterator();
    assertTrue(iter.hasNext());
    assertEquals(NumberRepr.of(2), iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline1RemoveNonExistent() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));

    repr.remove("a");
    assertFalse(repr.isEmpty());
    assertEquals(1, repr.size());
    assertEquals(1, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
  }

  @Test
  public void testInline1Remove() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));

    repr.remove("x");
    assertTrue(repr.isEmpty());
    assertEquals(0, repr.size());
    assertEquals(0, repr.shape().size());
    assertEquals(Repr.undefined(), repr.get("x"));
  }

  @Test
  public void testInline2() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    assertFalse(repr.isEmpty());
    assertEquals(2, repr.size());
    assertEquals(2, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(NumberRepr.of(3), repr.get("y"));
  }

  @Test
  public void testInline2EntryIterator() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));

    final Iterator<Map.Entry<String, Repr>> iter = repr.iterator();
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Repr>("x", NumberRepr.of(2)), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Repr>("y", NumberRepr.of(3)), iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline2KeyIterator() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));

    final Iterator<String> iter = repr.keyIterator();
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
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));

    final Iterator<Repr> iter = repr.valueIterator();
    assertTrue(iter.hasNext());
    assertEquals(NumberRepr.of(2), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(NumberRepr.of(3), iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline2RemoveNonExistent() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));

    repr.remove("a");
    assertFalse(repr.isEmpty());
    assertEquals(2, repr.size());
    assertEquals(2, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(NumberRepr.of(3), repr.get("y"));
  }

  @Test
  public void testInline2RemoveForward() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));

    repr.remove("x");
    assertFalse(repr.isEmpty());
    assertEquals(1, repr.size());
    assertEquals(-1, repr.shape().size());
    assertEquals(Repr.undefined(), repr.get("x"));
    assertEquals(NumberRepr.of(3), repr.get("y"));

    repr.remove("y");
    assertTrue(repr.isEmpty());
    assertEquals(0, repr.size());
    assertEquals(-1, repr.shape().size());
    assertEquals(Repr.undefined(), repr.get("x"));
    assertEquals(Repr.undefined(), repr.get("y"));
  }

  @Test
  public void testInline2RemoveReverse() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));

    repr.remove("y");
    assertFalse(repr.isEmpty());
    assertEquals(1, repr.size());
    assertEquals(1, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(Repr.undefined(), repr.get("y"));

    repr.remove("x");
    assertTrue(repr.isEmpty());
    assertEquals(0, repr.size());
    assertEquals(0, repr.shape().size());
    assertEquals(Repr.undefined(), repr.get("x"));
    assertEquals(Repr.undefined(), repr.get("y"));
  }

  @Test
  public void testInline3() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));
    assertFalse(repr.isEmpty());
    assertEquals(3, repr.size());
    assertEquals(3, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(NumberRepr.of(3), repr.get("y"));
    assertEquals(NumberRepr.of(5), repr.get("z"));
  }

  @Test
  public void testInline3EntryIterator() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));

    final Iterator<Map.Entry<String, Repr>> iter = repr.iterator();
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Repr>("x", NumberRepr.of(2)), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Repr>("y", NumberRepr.of(3)), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Repr>("z", NumberRepr.of(5)), iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline3KeyIterator() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));

    final Iterator<String> iter = repr.keyIterator();
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
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));

    final Iterator<Repr> iter = repr.valueIterator();
    assertTrue(iter.hasNext());
    assertEquals(NumberRepr.of(2), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(NumberRepr.of(3), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(NumberRepr.of(5), iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testInline3RemoveNonExistent() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));

    repr.remove("a");
    assertFalse(repr.isEmpty());
    assertEquals(3, repr.size());
    assertEquals(3, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(NumberRepr.of(3), repr.get("y"));
    assertEquals(NumberRepr.of(5), repr.get("z"));
  }

  @Test
  public void testInline3RemoveForward() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));

    repr.remove("x");
    assertFalse(repr.isEmpty());
    assertEquals(2, repr.size());
    assertEquals(-1, repr.shape().size());
    assertEquals(Repr.undefined(), repr.get("x"));
    assertEquals(NumberRepr.of(3), repr.get("y"));
    assertEquals(NumberRepr.of(5), repr.get("z"));

    repr.remove("y");
    assertFalse(repr.isEmpty());
    assertEquals(1, repr.size());
    assertEquals(-1, repr.shape().size());
    assertEquals(Repr.undefined(), repr.get("x"));
    assertEquals(Repr.undefined(), repr.get("y"));
    assertEquals(NumberRepr.of(5), repr.get("z"));

    repr.remove("z");
    assertTrue(repr.isEmpty());
    assertEquals(0, repr.size());
    assertEquals(-1, repr.shape().size());
    assertEquals(Repr.undefined(), repr.get("x"));
    assertEquals(Repr.undefined(), repr.get("y"));
    assertEquals(Repr.undefined(), repr.get("z"));
  }

  @Test
  public void testInline3RemoveReverse() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));

    repr.remove("z");
    assertFalse(repr.isEmpty());
    assertEquals(2, repr.size());
    assertEquals(2, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(NumberRepr.of(3), repr.get("y"));
    assertEquals(Repr.undefined(), repr.get("z"));

    repr.remove("y");
    assertFalse(repr.isEmpty());
    assertEquals(1, repr.size());
    assertEquals(1, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(Repr.undefined(), repr.get("y"));
    assertEquals(Repr.undefined(), repr.get("z"));

    repr.remove("x");
    assertTrue(repr.isEmpty());
    assertEquals(0, repr.size());
    assertEquals(0, repr.shape().size());
    assertEquals(Repr.undefined(), repr.get("x"));
    assertEquals(Repr.undefined(), repr.get("y"));
    assertEquals(Repr.undefined(), repr.get("z"));
  }

  @Test
  public void testInline3RemoveMiddle() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));

    repr.remove("y");
    assertFalse(repr.isEmpty());
    assertEquals(2, repr.size());
    assertEquals(-1, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(Repr.undefined(), repr.get("y"));
    assertEquals(NumberRepr.of(5), repr.get("z"));
  }

  @Test
  public void testPacked4() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));
    repr.put("w", NumberRepr.of(7));
    assertFalse(repr.isEmpty());
    assertEquals(4, repr.size());
    assertEquals(4, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(NumberRepr.of(3), repr.get("y"));
    assertEquals(NumberRepr.of(5), repr.get("z"));
    assertEquals(NumberRepr.of(7), repr.get("w"));
  }

  @Test
  public void testPacked4EntryIterator() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));
    repr.put("w", NumberRepr.of(7));

    final Iterator<Map.Entry<String, Repr>> iter = repr.iterator();
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Repr>("x", NumberRepr.of(2)), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Repr>("y", NumberRepr.of(3)), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Repr>("z", NumberRepr.of(5)), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(new SimpleEntry<String, Repr>("w", NumberRepr.of(7)), iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testPacked4KeyIterator() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));
    repr.put("w", NumberRepr.of(7));

    final Iterator<String> iter = repr.keyIterator();
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
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));
    repr.put("w", NumberRepr.of(7));

    final Iterator<Repr> iter = repr.valueIterator();
    assertTrue(iter.hasNext());
    assertEquals(NumberRepr.of(2), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(NumberRepr.of(3), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(NumberRepr.of(5), iter.next());
    assertTrue(iter.hasNext());
    assertEquals(NumberRepr.of(7), iter.next());
    assertFalse(iter.hasNext());
    assertThrows(NoSuchElementException.class, () -> {
      iter.next();
    });
  }

  @Test
  public void testPacked4RemoveNonExistent() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));
    repr.put("w", NumberRepr.of(7));

    repr.remove("a");
    assertFalse(repr.isEmpty());
    assertEquals(4, repr.size());
    assertEquals(4, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(NumberRepr.of(3), repr.get("y"));
    assertEquals(NumberRepr.of(5), repr.get("z"));
    assertEquals(NumberRepr.of(7), repr.get("w"));
  }

  @Test
  public void testPacked4RemoveForward() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));
    repr.put("w", NumberRepr.of(7));

    repr.remove("x");
    assertFalse(repr.isEmpty());
    assertEquals(3, repr.size());
    assertEquals(-1, repr.shape().size());
    assertEquals(Repr.undefined(), repr.get("x"));
    assertEquals(NumberRepr.of(3), repr.get("y"));
    assertEquals(NumberRepr.of(5), repr.get("z"));
    assertEquals(NumberRepr.of(7), repr.get("w"));

    repr.remove("y");
    assertFalse(repr.isEmpty());
    assertEquals(2, repr.size());
    assertEquals(-1, repr.shape().size());
    assertEquals(Repr.undefined(), repr.get("x"));
    assertEquals(Repr.undefined(), repr.get("y"));
    assertEquals(NumberRepr.of(5), repr.get("z"));
    assertEquals(NumberRepr.of(7), repr.get("w"));

    repr.remove("z");
    assertFalse(repr.isEmpty());
    assertEquals(1, repr.size());
    assertEquals(-1, repr.shape().size());
    assertEquals(Repr.undefined(), repr.get("x"));
    assertEquals(Repr.undefined(), repr.get("y"));
    assertEquals(Repr.undefined(), repr.get("z"));
    assertEquals(NumberRepr.of(7), repr.get("w"));

    repr.remove("w");
    assertTrue(repr.isEmpty());
    assertEquals(0, repr.size());
    assertEquals(-1, repr.shape().size());
    assertEquals(Repr.undefined(), repr.get("x"));
    assertEquals(Repr.undefined(), repr.get("y"));
    assertEquals(Repr.undefined(), repr.get("z"));
    assertEquals(Repr.undefined(), repr.get("w"));
  }

  @Test
  public void testPacked4RemoveReverse() {
    final ObjectRepr repr = ObjectRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    repr.put("z", NumberRepr.of(5));
    repr.put("w", NumberRepr.of(7));

    repr.remove("w");
    assertFalse(repr.isEmpty());
    assertEquals(3, repr.size());
    assertEquals(3, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(NumberRepr.of(3), repr.get("y"));
    assertEquals(NumberRepr.of(5), repr.get("z"));
    assertEquals(Repr.undefined(), repr.get("w"));

    repr.remove("z");
    assertFalse(repr.isEmpty());
    assertEquals(2, repr.size());
    assertEquals(2, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(NumberRepr.of(3), repr.get("y"));
    assertEquals(Repr.undefined(), repr.get("z"));
    assertEquals(Repr.undefined(), repr.get("w"));

    repr.remove("y");
    assertFalse(repr.isEmpty());
    assertEquals(1, repr.size());
    assertEquals(1, repr.shape().size());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(Repr.undefined(), repr.get("y"));
    assertEquals(Repr.undefined(), repr.get("z"));
    assertEquals(Repr.undefined(), repr.get("w"));

    repr.remove("x");
    assertTrue(repr.isEmpty());
    assertEquals(0, repr.size());
    assertEquals(0, repr.shape().size());
    assertEquals(Repr.undefined(), repr.get("x"));
    assertEquals(Repr.undefined(), repr.get("y"));
    assertEquals(Repr.undefined(), repr.get("z"));
    assertEquals(Repr.undefined(), repr.get("w"));
  }

  @Test
  public void testHashed() {
    final int size = 1 << 20;
    final ObjectRepr repr = ObjectRepr.of();
    for (int k = 1; k <= size; k += 1) {
      repr.put(Integer.toString(k), NumberRepr.of(k));
      assertFalse(repr.isEmpty());
      assertEquals(k, repr.size());
      if (Integer.bitCount(k) <= 2) {
        for (int i = 1; i <= k; i += 1) {
          assertEquals(NumberRepr.of(i), repr.get(Integer.toString(i)));
        }
      }
    }
  }

  @Test
  public void testHashedEntryIterator() {
    final int size = 1 << 20;
    final ObjectRepr repr = ObjectRepr.of();
    for (int k = 1; k <= size; k += 1) {
      repr.put(Integer.toString(k), NumberRepr.of(k));
      assertFalse(repr.isEmpty());
      assertEquals(k, repr.size());
      if (Integer.bitCount(k) <= 2) {
        final Iterator<Map.Entry<String, Repr>> iter = repr.iterator();
        for (int i = 1; i <= k; i += 1) {
          assertTrue(iter.hasNext());
          assertEquals(new SimpleEntry<String, Repr>(Integer.toString(i), NumberRepr.of(i)), iter.next());
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
    final ObjectRepr repr = ObjectRepr.of();
    for (int k = 1; k <= size; k += 1) {
      repr.put(Integer.toString(k), NumberRepr.of(k));
      assertFalse(repr.isEmpty());
      assertEquals(k, repr.size());
      if (Integer.bitCount(k) <= 2) {
        final Iterator<String> iter = repr.keyIterator();
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
    final ObjectRepr repr = ObjectRepr.of();
    for (int k = 1; k <= size; k += 1) {
      repr.put(Integer.toString(k), NumberRepr.of(k));
      assertFalse(repr.isEmpty());
      assertEquals(k, repr.size());
      if (Integer.bitCount(k) <= 2) {
        final Iterator<Repr> iter = repr.valueIterator();
        for (int i = 1; i <= k; i += 1) {
          assertTrue(iter.hasNext());
          assertEquals(NumberRepr.of(i), iter.next());
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
    final ObjectRepr repr = ObjectRepr.of();
    for (int i = 0; i < size; i += 1) {
      keys[i] = Integer.toString(i);
      repr.put(keys[i], NumberRepr.of(i));
    }

    System.out.println("Warming up ...");
    for (int i = 0; i < lookups; i += 1) {
      final int k = (int) (Math.random() * size);
      if (repr.get(keys[k]).intValue() != k) {
        throw new JUnitException("");
      }
    }

    System.out.println("Benchmarking ...");
    for (int iteration = 0; iteration < iterations; iteration += 1) {
      final long t0 = System.currentTimeMillis();
      for (int i = 0; i < lookups; i += 1) {
        final int k = (int) (Math.random() * size);
        if (repr.get(keys[k]).intValue() != k) {
          throw new JUnitException("");
        }
      }
      final long dt = System.currentTimeMillis() - t0;
      final long rate = Math.round((double) lookups * 1000.0 / (double) dt);
      System.out.println("Looked up " + lookups + " keys in " + dt + "ms (" + rate + "/sec)");
    }
  }

}
