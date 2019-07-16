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

import swim.codec.Output;
import swim.structure.operator.BitwiseAndOperator;
import swim.structure.operator.BitwiseOrOperator;
import swim.structure.operator.BitwiseXorOperator;
import swim.structure.operator.DivideOperator;
import swim.structure.operator.MinusOperator;
import swim.structure.operator.ModuloOperator;
import swim.structure.operator.PlusOperator;
import swim.structure.operator.TimesOperator;

public final class Slot extends Field {
  final Value key;
  Value value;

  Slot(Value key, Value value, int flags) {
    this.key = key.commit();
    this.value = value;
    this.flags = flags;
  }

  Slot(Value key, Value value) {
    this(key, value, 0);
  }

  @Override
  public boolean isConstant() {
    return this.key.isConstant() && this.value.isConstant();
  }

  @Override
  public Value key() {
    return this.key;
  }

  @Override
  public Value value() {
    return this.value;
  }

  @Override
  public Value setValue(Value newValue) {
    if ((this.flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final Value oldValue = this.value;
    this.value = newValue;
    return oldValue;
  }

  @Override
  public Slot updatedValue(Value value) {
    if (value == null) {
      throw new NullPointerException();
    }
    return new Slot(key, value);
  }

  @Override
  public Item bitwiseOr(Item that) {
    if (that instanceof Expression) {
      return new BitwiseOrOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Slot && key.equals(((Slot) that).key)) {
      newValue = value.bitwiseOr(((Slot) that).value);
    } else if (that instanceof Value) {
      newValue = value.bitwiseOr((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item bitwiseXor(Item that) {
    if (that instanceof Expression) {
      return new BitwiseXorOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Slot && key.equals(((Slot) that).key)) {
      newValue = value.bitwiseXor(((Slot) that).value);
    } else if (that instanceof Value) {
      newValue = value.bitwiseXor((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item bitwiseAnd(Item that) {
    if (that instanceof Expression) {
      return new BitwiseAndOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Slot && key.equals(((Slot) that).key)) {
      newValue = value.bitwiseAnd(((Slot) that).value);
    } else if (that instanceof Value) {
      newValue = value.bitwiseAnd((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item plus(Item that) {
    if (that instanceof Expression) {
      return new PlusOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Slot && key.equals(((Slot) that).key)) {
      newValue = value.plus(((Slot) that).value);
    } else if (that instanceof Value) {
      newValue = value.plus((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item minus(Item that) {
    if (that instanceof Expression) {
      return new MinusOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Slot && key.equals(((Slot) that).key)) {
      newValue = value.minus(((Slot) that).value);
    } else if (that instanceof Value) {
      newValue = value.minus((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item times(Item that) {
    if (that instanceof Expression) {
      return new TimesOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Slot && key.equals(((Slot) that).key)) {
      newValue = value.times(((Slot) that).value);
    } else if (that instanceof Value) {
      newValue = value.times((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item divide(Item that) {
    if (that instanceof Expression) {
      return new DivideOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Slot && key.equals(((Slot) that).key)) {
      newValue = value.divide(((Slot) that).value);
    } else if (that instanceof Value) {
      newValue = value.divide((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item modulo(Item that) {
    if (that instanceof Expression) {
      return new ModuloOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Slot && key.equals(((Slot) that).key)) {
      newValue = value.modulo(((Slot) that).value);
    } else if (that instanceof Value) {
      newValue = value.modulo((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item not() {
    final Value newValue = value.not();
    if (newValue.isDefined()) {
      return new Slot(key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item bitwiseNot() {
    final Value newValue = value.bitwiseNot();
    if (newValue.isDefined()) {
      return new Slot(key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item negative() {
    final Value newValue = value.negative();
    if (newValue.isDefined()) {
      return new Slot(key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item positive() {
    final Value newValue = value.positive();
    if (newValue.isDefined()) {
      return new Slot(key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item inverse() {
    final Value newValue = value.inverse();
    if (newValue.isDefined()) {
      return new Slot(key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item evaluate(Interpreter interpreter) {
    final Value key = this.key.evaluate(interpreter).toValue();
    final Value value = this.value.evaluate(interpreter).toValue();
    if (key == this.key && value == this.value) {
      return this;
    } else if (key.isDefined() && value.isDefined()) {
      return new Slot(key, value);
    }
    return Item.absent();
  }

  @Override
  public Item substitute(Interpreter interpreter) {
    final Value key = this.key.substitute(interpreter).toValue();
    final Value value = this.value.substitute(interpreter).toValue();
    if (key == this.key && value == this.value) {
      return this;
    } else if (key.isDefined() && value.isDefined()) {
      return new Slot(key, value);
    }
    return Item.absent();
  }

  @Override
  public boolean isAliased() {
    return false;
  }

  @Override
  public boolean isMutable() {
    return (this.flags & IMMUTABLE) == 0;
  }

  @Override
  public void alias() {
    do {
      final int oldFlags = this.flags;
      if ((oldFlags & IMMUTABLE) == 0) {
        final int newFlags = oldFlags | IMMUTABLE;
        if (FLAGS.compareAndSet(this, oldFlags, newFlags)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  @Override
  public Slot branch() {
    if ((this.flags & IMMUTABLE) != 0) {
      return new Slot(key, value, flags & ~IMMUTABLE);
    } else {
      return this;
    }
  }

  @Override
  public Slot commit() {
    do {
      final int oldFlags = this.flags;
      if ((oldFlags & IMMUTABLE) == 0) {
        final int newFlags = oldFlags | IMMUTABLE;
        if (FLAGS.compareAndSet(this, oldFlags, newFlags)) {
          this.value.commit();
          break;
        }
      } else {
        break;
      }
    } while (true);
    return this;
  }

  @Override
  public int typeOrder() {
    return 2;
  }

  @Override
  public int compareTo(Item other) {
    if (other instanceof Slot) {
      return compareTo((Slot) other);
    }
    return Integer.compare(typeOrder(), other.typeOrder());
  }

  int compareTo(Slot that) {
    int order = this.key.compareTo(that.key);
    if (order == 0) {
      order = this.value.compareTo(that.value);
    }
    return order;
  }

  @Override
  public boolean keyEquals(Object key) {
    if (key instanceof String && this.key instanceof Text) {
      return ((Text) this.key).value.equals(key);
    } else if (key instanceof Field) {
      return this.key.equals(((Field) key).getKey());
    } else {
      return this.key.equals(key);
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Slot) {
      final Slot that = (Slot) other;
      return this.key.equals(that.key) && this.value.equals(that.value);
    }
    return false;
  }

  @Override
  public int hashCode() {
    return this.key.hashCode() ^ this.value.hashCode();
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Slot").write('.').write("of").write('(').display(this.key);
    if (!(this.value instanceof Extant)) {
      output = output.write(", ").display(this.value);
    }
    output = output.write(')');
  }

  public static Slot of(Value key, Value value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    if (value == null) {
      throw new NullPointerException("value");
    }
    return new Slot(key, value);
  }

  public static Slot of(Value key, String value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    if (value == null) {
      throw new NullPointerException("value");
    }
    return new Slot(key, Text.from(value));
  }

  public static Slot of(Value key, int value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Slot(key, Num.from(value));
  }

  public static Slot of(Value key, long value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Slot(key, Num.from(value));
  }

  public static Slot of(Value key, float value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Slot(key, Num.from(value));
  }

  public static Slot of(Value key, double value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Slot(key, Num.from(value));
  }

  public static Slot of(Value key, boolean value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Slot(key, Bool.from(value));
  }

  public static Slot of(String key, Value value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    if (value == null) {
      throw new NullPointerException("value");
    }
    return new Slot(Text.from(key), value);
  }

  public static Slot of(String key, String value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    if (value == null) {
      throw new NullPointerException("value");
    }
    return new Slot(Text.from(key), Text.from(value));
  }

  public static Slot of(String key, int value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Slot(Text.from(key), Num.from(value));
  }

  public static Slot of(String key, long value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Slot(Text.from(key), Num.from(value));
  }

  public static Slot of(String key, float value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Slot(Text.from(key), Num.from(value));
  }

  public static Slot of(String key, double value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Slot(Text.from(key), Num.from(value));
  }

  public static Slot of(String key, boolean value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Slot(Text.from(key), Bool.from(value));
  }

  public static Slot of(Value key) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Slot(key, Value.extant());
  }

  public static Slot of(String key) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Slot(Text.from(key), Value.extant());
  }
}
