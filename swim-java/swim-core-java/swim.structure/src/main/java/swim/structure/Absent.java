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

package swim.structure;

import java.util.Iterator;
import swim.codec.Output;
import swim.util.Murmur3;

public final class Absent extends Value {
  private Absent() {
    // stub
  }

  /**
   * Always returns {@code false} because {@code Absent} represents an
   * undefined value.
   */
  @Override
  public boolean isDefined() {
    return false;
  }

  @Override
  public boolean isConstant() {
    return true;
  }

  /**
   * Always returns {@code false} because {@code Absent} is not a distinct
   * value.
   */
  @Override
  public boolean isDistinct() {
    return false;
  }

  /**
   * Always returns an empty {@code Record} because {@code Absent} is not a
   * distinct value.
   */
  @Override
  public Record unflattened() {
    return Record.empty();
  }

  @Override
  public Record updated(Value key, Value value) {
    return Record.of(Slot.of(key, value));
  }

  @Override
  public Record updatedAttr(Text key, Value value) {
    return Record.of(Attr.of(key, value));
  }

  @Override
  public Record updatedSlot(Value key, Value value) {
    return Record.of(Slot.of(key, value));
  }

  @Override
  public Record appended(Item item) {
    return Record.of(item);
  }

  @Override
  public Record appended(Object... items) {
    return Record.of(items);
  }

  @Override
  public Record prepended(Item item) {
    return Record.of(item);
  }

  @Override
  public Record prepended(Object... items) {
    return Record.of(items);
  }

  @Override
  public Record concat(Item that) {
    if (!that.isDefined()) {
      return Record.create();
    } else if (that instanceof Record) {
      return ((Record) that).branch();
    } else {
      return Record.of(that);
    }
  }

  @Override
  public Item conditional(Item thenTerm, Item elseTerm) {
    return elseTerm;
  }

  @Override
  public Value conditional(Value thenTerm, Value elseTerm) {
    return elseTerm;
  }

  @Override
  public Item or(Item that) {
    return that;
  }

  @Override
  public Value or(Value that) {
    return that;
  }

  @Override
  public Item and(Item that) {
    return this;
  }

  @Override
  public Value and(Value that) {
    return this;
  }

  @Override
  public Value not() {
    return Value.extant();
  }

  /**
   * Always returns {@code false} because {@code Absent} behaves like a falsey
   * value.
   */
  @Override
  public boolean booleanValue() {
    return false;
  }

  /**
   * Always returns {@code false} because {@code Absent} behaves like a falsey
   * value.
   */
  @Override
  public boolean booleanValue(boolean orElse) {
    return false;
  }

  @Override
  public Iterator<Item> iterator() {
    return new ItemIterator(null);
  }

  @Override
  public int typeOrder() {
    return 99;
  }

  @Override
  public int compareTo(Item other) {
    return Integer.compare(typeOrder(), other.typeOrder());
  }

  @Override
  public boolean equals(Object other) {
    return this == other;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Absent.class);
    }
    return hashSeed;
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Value").write('.').write("absent").write('(').write(')');
  }

  private static int hashSeed;

  private static final Absent VALUE = new Absent();

  public static Absent absent() {
    return VALUE;
  }
}
