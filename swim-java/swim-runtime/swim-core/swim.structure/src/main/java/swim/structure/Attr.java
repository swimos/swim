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

package swim.structure;

import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import swim.codec.Output;
import swim.structure.operator.BitwiseAndOperator;
import swim.structure.operator.BitwiseOrOperator;
import swim.structure.operator.BitwiseXorOperator;
import swim.structure.operator.DivideOperator;
import swim.structure.operator.MinusOperator;
import swim.structure.operator.ModuloOperator;
import swim.structure.operator.PlusOperator;
import swim.structure.operator.TimesOperator;

public final class Attr extends Field {

  final Text key;
  Value value;
  volatile int flags;

  Attr(Text key, Value value, int flags) {
    this.key = key;
    this.value = value;
    this.flags = flags;
  }

  Attr(Text key, Value value) {
    this(key, value, 0);
  }

  @Override
  public boolean isConstant() {
    return this.key.isConstant() && this.value.isConstant();
  }

  public String name() {
    return this.key.value;
  }

  @Override
  public Text key() {
    return this.key;
  }

  @Override
  public Value value() {
    return this.value;
  }

  @Override
  public Value setValue(Value newValue) {
    if ((Attr.FLAGS.get(this) & Attr.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final Value oldValue = this.value;
    this.value = newValue;
    return oldValue;
  }

  @Override
  public Attr updatedValue(Value value) {
    if (value == null) {
      throw new NullPointerException();
    }
    return new Attr(this.key, value);
  }

  @Override
  public Item bitwiseOr(Item that) {
    if (that instanceof Expression) {
      return new BitwiseOrOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Attr && this.key.equals(((Attr) that).key)) {
      newValue = this.value.bitwiseOr(((Attr) that).value);
    } else if (that instanceof Value) {
      newValue = this.value.bitwiseOr((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Attr(this.key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item bitwiseXor(Item that) {
    if (that instanceof Expression) {
      return new BitwiseXorOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Attr && this.key.equals(((Attr) that).key)) {
      newValue = this.value.bitwiseXor(((Attr) that).value);
    } else if (that instanceof Value) {
      newValue = this.value.bitwiseXor((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Attr(this.key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item bitwiseAnd(Item that) {
    if (that instanceof Expression) {
      return new BitwiseAndOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Attr && this.key.equals(((Attr) that).key)) {
      newValue = this.value.bitwiseAnd(((Attr) that).value);
    } else if (that instanceof Value) {
      newValue = this.value.bitwiseAnd((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Attr(this.key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item plus(Item that) {
    if (that instanceof Expression) {
      return new PlusOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Attr && this.key.equals(((Attr) that).key)) {
      newValue = this.value.plus(((Attr) that).value);
    } else if (that instanceof Value) {
      newValue = this.value.plus((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Attr(this.key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item minus(Item that) {
    if (that instanceof Expression) {
      return new MinusOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Attr && this.key.equals(((Attr) that).key)) {
      newValue = this.value.minus(((Attr) that).value);
    } else if (that instanceof Value) {
      newValue = this.value.minus((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Attr(this.key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item times(Item that) {
    if (that instanceof Expression) {
      return new TimesOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Attr && this.key.equals(((Attr) that).key)) {
      newValue = this.value.times(((Attr) that).value);
    } else if (that instanceof Value) {
      newValue = this.value.times((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Attr(this.key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item divide(Item that) {
    if (that instanceof Expression) {
      return new DivideOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Attr && this.key.equals(((Attr) that).key)) {
      newValue = this.value.divide(((Attr) that).value);
    } else if (that instanceof Value) {
      newValue = this.value.divide((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Attr(this.key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item modulo(Item that) {
    if (that instanceof Expression) {
      return new ModuloOperator(this, that);
    }
    final Value newValue;
    if (that instanceof Attr && this.key.equals(((Attr) that).key)) {
      newValue = this.value.modulo(((Attr) that).value);
    } else if (that instanceof Value) {
      newValue = this.value.modulo((Value) that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Attr(this.key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item not() {
    final Value newValue = this.value.not();
    if (newValue.isDefined()) {
      return new Attr(this.key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item bitwiseNot() {
    final Value newValue = this.value.bitwiseNot();
    if (newValue.isDefined()) {
      return new Attr(this.key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item negative() {
    final Value newValue = this.value.negative();
    if (newValue.isDefined()) {
      return new Attr(this.key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item positive() {
    final Value newValue = this.value.positive();
    if (newValue.isDefined()) {
      return new Attr(this.key, newValue);
    }
    return Item.absent();
  }

  @Override
  public Item inverse() {
    final Value newValue = this.value.inverse();
    if (newValue.isDefined()) {
      return new Attr(this.key, newValue);
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
      if (key instanceof Text) {
        return new Attr((Text) key, value);
      } else {
        return new Slot(key, value);
      }
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
      if (key instanceof Text) {
        return new Attr((Text) key, value);
      } else {
        return new Slot(key, value);
      }
    }
    return Item.absent();
  }

  @Override
  public boolean isAliased() {
    return false;
  }

  @Override
  public boolean isMutable() {
    return (Attr.FLAGS.get(this) & Attr.IMMUTABLE) == 0;
  }

  @Override
  public void alias() {
    do {
      final int oldFlags = Attr.FLAGS.get(this);
      if ((oldFlags & Attr.IMMUTABLE) == 0) {
        final int newFlags = oldFlags | Attr.IMMUTABLE;
        if (Attr.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  @Override
  public Attr branch() {
    final int flags = Attr.FLAGS.get(this);
    if ((flags & Attr.IMMUTABLE) != 0) {
      return new Attr(this.key, this.value, flags & ~Attr.IMMUTABLE);
    } else {
      return this;
    }
  }

  @Override
  public Attr commit() {
    do {
      final int oldFlags = Attr.FLAGS.get(this);
      if ((oldFlags & Attr.IMMUTABLE) == 0) {
        final int newFlags = oldFlags | Attr.IMMUTABLE;
        if (Attr.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
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
    return 1;
  }

  @Override
  public int compareTo(Item other) {
    if (other instanceof Attr) {
      return this.compareTo((Attr) other);
    }
    return Integer.compare(this.typeOrder(), other.typeOrder());
  }

  int compareTo(Attr that) {
    int order = this.key.compareTo(that.key);
    if (order == 0) {
      order = this.value.compareTo(that.value);
    }
    return order;
  }

  @Override
  public boolean keyEquals(Object key) {
    if (key instanceof String) {
      return this.key.value.equals(key);
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
    } else if (other instanceof Attr) {
      final Attr that = (Attr) other;
      return this.key.equals(that.key) && this.value.equals(that.value);
    }
    return false;
  }

  @Override
  public int hashCode() {
    return this.key.hashCode() ^ this.value.hashCode();
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Attr").write('.').write("of").write('(').display(this.key);
    if (!(this.value instanceof Extant)) {
      output = output.write(", ").display(this.value);
    }
    output = output.write(')');
    return output;
  }

  static final int IMMUTABLE = 1 << 0;

  static final AtomicIntegerFieldUpdater<Attr> FLAGS =
      AtomicIntegerFieldUpdater.newUpdater(Attr.class, "flags");

  public static Attr of(Text key, Value value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    if (value == null) {
      throw new NullPointerException("value");
    }
    return new Attr(key, value);
  }

  public static Attr of(Text key, String value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    if (value == null) {
      throw new NullPointerException("value");
    }
    return new Attr(key, Text.from(value));
  }

  public static Attr of(Text key, int value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Attr(key, Num.from(value));
  }

  public static Attr of(Text key, long value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Attr(key, Num.from(value));
  }

  public static Attr of(Text key, float value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Attr(key, Num.from(value));
  }

  public static Attr of(Text key, double value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Attr(key, Num.from(value));
  }

  public static Attr of(Text key, boolean value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Attr(key, Bool.from(value));
  }

  public static Attr of(String key, Value value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    if (value == null) {
      throw new NullPointerException("value");
    }
    return new Attr(Text.from(key), value);
  }

  public static Attr of(String key, String value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    if (value == null) {
      throw new NullPointerException("value");
    }
    return new Attr(Text.from(key), Text.from(value));
  }

  public static Attr of(String key, int value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Attr(Text.from(key), Num.from(value));
  }

  public static Attr of(String key, long value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Attr(Text.from(key), Num.from(value));
  }

  public static Attr of(String key, float value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Attr(Text.from(key), Num.from(value));
  }

  public static Attr of(String key, double value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Attr(Text.from(key), Num.from(value));
  }

  public static Attr of(String key, boolean value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Attr(Text.from(key), Bool.from(value));
  }

  public static Attr of(Text key) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Attr(key, Value.extant());
  }

  public static Attr of(String key) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    return new Attr(Text.from(key), Value.extant());
  }

}
