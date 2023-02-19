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
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class TupleReprTests {

  @Test
  public void testEmpty() {
    final TupleRepr repr = TupleRepr.empty();
    assertTrue(repr.isEmpty());
    assertEquals(0, repr.size());
    assertEquals(0, repr.shape().size());
  }

  @Test
  public void testSize1Rank1() {
    final TupleRepr repr = TupleRepr.of();
    repr.put("x", NumberRepr.of(2));
    assertFalse(repr.isEmpty());
    assertEquals(1, repr.size());
    assertEquals(1, repr.shape().size());
    assertEquals(1, repr.shape().rank());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(new SimpleEntry<String, Repr>("x", NumberRepr.of(2)), repr.getEntry(0));
    assertEquals("x", repr.getKey(0));
    assertEquals(NumberRepr.of(2), repr.getValue(0));
  }

  @Test
  public void testSize2Rank2() {
    final TupleRepr repr = TupleRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    assertFalse(repr.isEmpty());
    assertEquals(2, repr.size());
    assertEquals(2, repr.shape().size());
    assertEquals(2, repr.shape().rank());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(new SimpleEntry<String, Repr>("x", NumberRepr.of(2)), repr.getEntry(0));
    assertEquals("x", repr.getKey(0));
    assertEquals(NumberRepr.of(2), repr.getValue(0));
    assertEquals(NumberRepr.of(3), repr.get("y"));
    assertEquals(new SimpleEntry<String, Repr>("y", NumberRepr.of(3)), repr.getEntry(1));
    assertEquals("y", repr.getKey(1));
    assertEquals(NumberRepr.of(3), repr.getValue(1));
  }

  @Test
  public void testSize1Rank0() {
    final TupleRepr repr = TupleRepr.of();
    repr.add(NumberRepr.of(2));
    assertFalse(repr.isEmpty());
    assertEquals(1, repr.size());
    assertEquals(1, repr.shape().size());
    assertEquals(0, repr.shape().rank());
    assertEquals(new SimpleEntry<String, Repr>(null, NumberRepr.of(2)), repr.getEntry(0));
    assertEquals(null, repr.getKey(0));
    assertEquals(NumberRepr.of(2), repr.getValue(0));
  }

  @Test
  public void testSize2Rank0() {
    final TupleRepr repr = TupleRepr.of();
    repr.add(NumberRepr.of(2));
    repr.add(NumberRepr.of(3));
    assertFalse(repr.isEmpty());
    assertEquals(2, repr.size());
    assertEquals(2, repr.shape().size());
    assertEquals(0, repr.shape().rank());
    assertEquals(new SimpleEntry<String, Repr>(null, NumberRepr.of(2)), repr.getEntry(0));
    assertEquals(null, repr.getKey(0));
    assertEquals(NumberRepr.of(2), repr.getValue(0));
    assertEquals(new SimpleEntry<String, Repr>(null, NumberRepr.of(3)), repr.getEntry(1));
    assertEquals(null, repr.getKey(1));
    assertEquals(NumberRepr.of(3), repr.getValue(1));
  }

  @Test
  public void testSize2Rank1LeadingKey() {
    final TupleRepr repr = TupleRepr.of();
    repr.put("x", NumberRepr.of(2));
    repr.add(NumberRepr.of(3));
    assertFalse(repr.isEmpty());
    assertEquals(2, repr.size());
    assertEquals(2, repr.shape().size());
    assertEquals(1, repr.shape().rank());
    assertEquals(NumberRepr.of(2), repr.get("x"));
    assertEquals(new SimpleEntry<String, Repr>("x", NumberRepr.of(2)), repr.getEntry(0));
    assertEquals("x", repr.getKey(0));
    assertEquals(NumberRepr.of(2), repr.getValue(0));
    assertEquals(new SimpleEntry<String, Repr>(null, NumberRepr.of(3)), repr.getEntry(1));
    assertEquals(null, repr.getKey(1));
    assertEquals(NumberRepr.of(3), repr.getValue(1));
  }

  @Test
  public void testSize2Rank1TrailingKey() {
    final TupleRepr repr = TupleRepr.of();
    repr.add(NumberRepr.of(2));
    repr.put("y", NumberRepr.of(3));
    assertFalse(repr.isEmpty());
    assertEquals(2, repr.size());
    assertEquals(2, repr.shape().size());
    assertEquals(1, repr.shape().rank());
    assertEquals(new SimpleEntry<String, Repr>(null, NumberRepr.of(2)), repr.getEntry(0));
    assertEquals(null, repr.getKey(0));
    assertEquals(NumberRepr.of(2), repr.getValue(0));
    assertEquals(NumberRepr.of(3), repr.get("y"));
    assertEquals(new SimpleEntry<String, Repr>("y", NumberRepr.of(3)), repr.getEntry(1));
    assertEquals("y", repr.getKey(1));
    assertEquals(NumberRepr.of(3), repr.getValue(1));
  }

}
