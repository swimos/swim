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

import java.math.BigInteger;
import java.nio.ByteBuffer;
import swim.structure.func.LambdaFunc;
import swim.structure.operator.BitwiseAndOperator;
import swim.structure.operator.BitwiseOrOperator;
import swim.structure.operator.BitwiseXorOperator;
import swim.structure.operator.DivideOperator;
import swim.structure.operator.EqOperator;
import swim.structure.operator.GeOperator;
import swim.structure.operator.GtOperator;
import swim.structure.operator.LeOperator;
import swim.structure.operator.LtOperator;
import swim.structure.operator.MinusOperator;
import swim.structure.operator.ModuloOperator;
import swim.structure.operator.NeOperator;
import swim.structure.operator.PlusOperator;
import swim.structure.operator.TimesOperator;
import swim.util.Builder;

public abstract class Value extends Item {
  Value() {
    // stub
  }

  /**
   * Returns {@code true} if this {@code Value} is not {@link Absent}.
   */
  @Override
  public boolean isDefined() {
    return true;
  }

  /**
   * Returns {@code true} if this {@code Value} is neither {@link Extant} nor
   * {@link Absent}.
   */
  @Override
  public boolean isDistinct() {
    return true;
  }

  /**
   * Always returns {@link Absent} because a {@code Value} can't be a {@code
   * Field}, so it can't have a key component.
   */
  @Override
  public final Value key() {
    return Value.absent();
  }

  /**
   * Always returns {@code this} because every {@code Value} is its own value
   * component.
   */
  @Override
  public final Value toValue() {
    return this;
  }

  /**
   * Returns the {@code key} string of the first member of this {@code Value},
   * if this {@code Value} is a {@link Record}, and its first member is an
   * {@code Attr}; otherwise returns {@code null} if this {@code Value} is not
   * a {@code Record}, or if this {@code Value} is a {@code Record} whose first
   * member is not an {@code Attr}.
   * <p>
   * Used to concisely get the name of the discriminating attribute of a
   * structure.  The {@code tag} can be used to discern the nominal type of a
   * polymorphic structure, similar to an XML element tag.
   */
  @Override
  public String tag() {
    return null;
  }

  /**
   * Returns the {@link #flattened() flattened} members of this {@code Value}
   * after all attributes have been removed, if this {@code Value} is a {@link
   * Record}; otherwise returns {@code this} if this {@code Value} is not a
   * {@code Record}.
   * <p>
   * Used to concisely get the scalar value of an attributed structure. An
   * attributed structure is a {@code Record} with one or more attributes that
   * modify one or more other members.
   */
  @Override
  public Value target() {
    return this;
  }

  /**
   * Returns the sole member of this {@code Value}, if this {@code Value} is a
   * {@link Record} with exactly one member, and its member is a {@code Value};
   * returns {@link Extant} if this {@code Value} is an empty {@code Record};
   * otherwise returns {@code this} if this {@code Value} is a {@code Record}
   * with more than one member, or if this {@code Value} is not a {@code
   * Record}.
   * <p>
   * Used to convert a unary {@code Record} into its member {@code Value}.
   * Facilitates writing code that treats a unary {@code Record} equivalently
   * to a bare {@code Value}.
   */
  @Override
  public Value flattened() {
    return this;
  }

  /**
   * Returns {@code this} if this {@code Value} is a {@link Record}; returns a
   * {@code Record} containing just this {@code Value}, if this {@code Value}
   * is {@link #isDistinct() distinct}; otherwise returns an empty {@code
   * Record} if this {@code Value} is {@link Extant} or {@link Absent}.
   * Facilitates writing code that treats a bare {@code Value} equivalently to
   * a unary {@code Record}.
   */
  @Override
  public Record unflattened() {
    return Record.of(this);
  }

  /**
   * Returns the value of the first member of this {@code Value}, if this
   * {@code Value} is a {@code Record}, and its first member is an {@link Attr}
   * whose {@code key} string is equal to {@code tag}; otherwise returns {@link
   * Absent} if this {@code Value} is not a {@code Record}, or if this {@code
   * Value} is a {@code Record} whose first member is not an {@code Attr}, or
   * if this {@code Value} is a {@code Record} whose first member is an {@code
   * Attr} whose {@code key} does not equal the {@code tag}.
   * <p>
   * Used to conditionally get the value of the head {@code Attr} of a
   * structure, if and only if the key string of the head {@code Attr} is equal
   * to the {@code tag}.  Can be used to check if a structure might conform to
   * a nominal type named {@code tag}, while simultaneously getting the value
   * of the {@code tag} attribute.
   */
  @Override
  public Value header(String tag) {
    return Value.absent();
  }

  /**
   * Returns the {@link #unflattened() unflattened} {@link #header(String)
   * header} of this {@code Value}, if this {@code Value} is a {@link Record},
   * and its first member is an {@link Attr} whose {@code key} string is equal
   * to {@code tag}; otherwise returns {@code null}.
   * <p>
   * The {@code headers} of the {@code tag} attribute of a structure are like
   * the attributes of an XML element tag; through unlike an XML element,
   * {@code tag} attribute headers are not limited to string keys and values.
   */
  @Override
  public Record headers(String tag) {
    return null;
  }

  /**
   * Returns the first member of this {@code Value}, if this {@code Value} is a
   * non-empty {@link Record}; otherwise returns {@link Absent}.
   */
  @Override
  public Item head() {
    return Item.absent();
  }

  /**
   * Returns a view of all but the first member of this {@code Value}, if this
   * {@code Value} is a non-empty {@link Record}; otherwise returns an empty
   * {@code Record} if this {@code Value} is not a {@code Record}, of if this
   * {@code Value} is itself an empty {@code Record}.
   */
  @Override
  public Record tail() {
    return Record.empty();
  }

  /**
   * Returns the {@link Record#flattened() flattened} {@link #tail() tail}
   * of this {@code Value}.  Used to recursively deconstruct a structure,
   * terminating with its last {@code Value}, rather than a unary {@code
   * Record} containing its last value, if the structure ends with a {@code
   * Value} member.
   */
  @Override
  public Value body() {
    return Value.extant();
  }

  /**
   * Returns the number of members contained in this {@code Value}, if this
   * {@code Value} is a {@link Record}; otherwise returns {@code 0} if this
   * {@code Value} is not a {@code Record}.
   */
  @Override
  public int length() {
    return 0;
  }

  /**
   * Returns {@code true} if this {@code Value} is a {@link Record} that has a
   * member equal to {@code item}; otherwise returns {@code false} if this
   * {@code Value} is not a {@code Record}, or if this {@code Value} is a
   * {@code Record}, but has no member equal to {@code item}.
   */
  @Override
  public boolean contains(Item item) {
    return false;
  }

  /**
   * Returns {@code true} if this {@code Value} is a {@link Record} that has a
   * {@link Field} member with a key that is equal to the given {@code key};
   * otherwise returns {@code false} if this {@code Value} is not a {@code
   * Record}, or if this {@code Value} is a {@code Record}, but has no {@code
   * Field} member with a key equal to the given {@code key}.
   */
  @Override
  public boolean containsKey(Value key) {
    return false;
  }

  /**
   * Returns {@code true} if this {@code Value} is a {@link Record} that has a
   * {@link Field} with a {@code Text} key whose string value is equal to the
   * given {@code key}; otherwise returns {@code false} if this {@code Value}
   * is not a {@code Record}, or if this {@code Value} is a {@code Record}, but
   * has no {@code Field} member with a {@code Text} key whose string value
   * equals the given {@code key}.  Equivalent to {@link #containsKey(Value)},
   * but avoids boxing the {@code key} string into a {@code Text} value.
   */
  @Override
  public boolean containsKey(String key) {
    return false;
  }

  /**
   * Returns {@code true} if this {@code Value} is a {@link Record} that has a
   * {@link Field} member with a value that is equal to the given {@code value};
   * otherwise returns {@code false} if this {@code Value} is not a {@code
   * Record}, or if this {@code Value} is a {@code Record}, but has no {@code
   * Field} member with a value equal to the given {@code value}.
   */
  @Override
  public boolean containsValue(Value value) {
    return false;
  }

  /**
   * Returns the value of the last {@link Field} member of this {@code Value}
   * whose key is equal to the given {@code key}; returns {@link Absent} if
   * this {@code Value} is not a {@link Record}, or if this {@code Value} is a
   * {@code Record}, but has no {@code Field} member with a key equal to the
   * given {@code key}.
   */
  @Override
  public Value get(Value key) {
    return Value.absent();
  }

  /**
   * Returns the value of the last {@link Field} member of this {@code Value}
   * with a {@code Text} key whose string value is equal to the given {@code
   * key}; returns {@link Absent} if this {@code Value} is not a {@link Record},
   * or if this {@code Value} is a {@code Record}, but has no {@code Field}
   * member with a {@code Text} key whose string value equals the given {@code
   * key}.  Equivalent to {@link #get(Value)}, but avoids boxing the {@code
   * key} string into a {@code Text} value.
   */
  @Override
  public Value get(String key) {
    return Value.absent();
  }

  /**
   * Returns the value of the last {@link Attr} member of this {@code Value}
   * whose key is equal to the given {@code key}; returns {@link Absent} if
   * this {@code Value} is not a {@link Record}, or if this {@code Value} is a
   * {@code Record}, but has no {@code Attr} member with a key equal to the
   * given {@code key}.
   */
  @Override
  public Value getAttr(Text key) {
    return Value.absent();
  }

  /**
   * Returns the value of the last {@link Attr} member of this {@code Value}
   * with a {@code Text} key whose string value is equal to the given {@code
   * key}; returns {@link Absent} if this {@code Value} is not a {@link Record},
   * or if this {@code Value} is a {@code Record}, but has no {@code Attr}
   * member with a {@code Text} key whose string value equals the given {@code
   * key}.  Equivalent to {@link #getAttr(Text)}, but avoids boxing the {@code
   * key} string into a {@code Text} value.
   */
  @Override
  public Value getAttr(String key) {
    return Value.absent();
  }

  /**
   * Returns the value of the last {@link Slot} member of this {@code Value}
   * whose key is equal to the given {@code key}; returns {@link Absent} if
   * this {@code Value} is not a {@link Record}, or if this {@code Value} is a
   * {@code Record}, but has no {@code Slot} member with a key equal to the
   * given {@code key}.
   */
  @Override
  public Value getSlot(Value key) {
    return Value.absent();
  }

  /**
   * Returns the value of the last {@link Slot} member of this {@code Value}
   * with a {@code Text} key whose string value is equal to the given {@code
   * key}; returns {@link Absent} if this {@code Value} is not a {@link Record},
   * or if this {@code Value} is a {@code Record}, but has no {@code Slot}
   * member with a {@code Text} key whose string value equals the given {@code
   * key}.  Equivalent to {@link #getSlot(Value)}, but avoids boxing the {@code
   * key} string into a {@code Text} value.
   */
  @Override
  public Value getSlot(String key) {
    return Value.absent();
  }

  /**
   * Returns the last {@link Field} member of this {@code Value} whose key is
   * equal to the given {@code key}; returns {@code null} if this {@code Value}
   * is not a {@link Record}, or if this {@code Value} is a {@code Record}, but
   * has no {@code Field} member with a {@code key} equal to the given
   * {@code key}.
   */
  @Override
  public Field getField(Value key) {
    return null;
  }

  /**
   * Returns the last {@link Field} member of this {@code Value} with a {@code
   * Text} key whose string value is equal to the given {@code key}; returns
   * {@code null} if this {@code Value} is not a {@link Record}, or if this
   * {@code Value} is a {@code Record}, but has no {@code Field} member with a
   * {@code Text} key whose string value equals the given {@code key}.
   * Equivalent to {@link #getField(Value)}, but avoids boxing the {@code key}
   * string into a {@code Text} value.
   */
  @Override
  public Field getField(String key) {
    return null;
  }

  /**
   * Returns the member of this {@code Value} at the given {@code index}, if
   * this {@code Value} is a {@link Record}, and the {@code index} is greater
   * than or equal to zero, and less than the {@link Record#length() length} of
   * the {@code Record}; otherwise returns {@link Absent} if this {@code Value}
   * is not a {@code Record}, or if this {@code Value} is a {@code Record}, but
   * the {@code index} is out of bounds.
   */
  @Override
  public Item getItem(int index) {
    return Item.absent();
  }

  @Override
  public Value removed(Value key) {
    return this;
  }

  @Override
  public Value removed(String key) {
    return this;
  }

  @Override
  public Item conditional(Item thenTerm, Item elseTerm) {
    if (thenTerm instanceof Value && elseTerm instanceof Value) {
      return conditional((Value) thenTerm, (Value) elseTerm);
    }
    return thenTerm;
  }

  public Value conditional(Value thenTerm, Value elseTerm) {
    return thenTerm;
  }

  @Override
  public Item or(Item that) {
    if (that instanceof Value) {
      return or((Value) that);
    }
    return this;
  }

  public Value or(Value that) {
    return this;
  }

  @Override
  public Item and(Item that) {
    if (that instanceof Value) {
      return and((Value) that);
    }
    return that;
  }

  public Value and(Value that) {
    return that;
  }

  @Override
  public Item bitwiseOr(Item that) {
    if (that instanceof Value) {
      return bitwiseOr((Value) that);
    } else if (that instanceof Slot) {
      final Value newValue = bitwiseOr(((Slot) that).value);
      if (newValue.isDefined()) {
        return new Slot(((Slot) that).key, newValue);
      }
    } else if (that instanceof Attr) {
      final Value newValue = bitwiseOr(((Attr) that).value);
      if (newValue.isDefined()) {
        return new Attr(((Attr) that).key, newValue);
      }
    }
    return Item.absent();
  }

  public Value bitwiseOr(Value that) {
    if (that instanceof Expression) {
      return new BitwiseOrOperator(this, that);
    }
    return Value.absent();
  }

  @Override
  public Item bitwiseXor(Item that) {
    if (that instanceof Value) {
      return bitwiseXor((Value) that);
    } else if (that instanceof Slot) {
      final Value newValue = bitwiseXor(((Slot) that).value);
      if (newValue.isDefined()) {
        return new Slot(((Slot) that).key, newValue);
      }
    } else if (that instanceof Attr) {
      final Value newValue = bitwiseXor(((Attr) that).value);
      if (newValue.isDefined()) {
        return new Attr(((Attr) that).key, newValue);
      }
    }
    return Item.absent();
  }

  public Value bitwiseXor(Value that) {
    if (that instanceof Expression) {
      return new BitwiseXorOperator(this, that);
    }
    return Value.absent();
  }

  @Override
  public Item bitwiseAnd(Item that) {
    if (that instanceof Value) {
      return bitwiseAnd((Value) that);
    } else if (that instanceof Slot) {
      final Value newValue = bitwiseAnd(((Slot) that).value);
      if (newValue.isDefined()) {
        return new Slot(((Slot) that).key, newValue);
      }
    } else if (that instanceof Attr) {
      final Value newValue = bitwiseAnd(((Attr) that).value);
      if (newValue.isDefined()) {
        return new Attr(((Attr) that).key, newValue);
      }
    }
    return Item.absent();
  }

  public Value bitwiseAnd(Value that) {
    if (that instanceof Expression) {
      return new BitwiseAndOperator(this, that);
    }
    return Value.absent();
  }

  @Override
  public Item lt(Item that) {
    if (that instanceof Value) {
      return lt((Value) that);
    }
    return super.lt(that);
  }

  public Value lt(Value that) {
    if (that instanceof Expression) {
      return new LtOperator(this, that);
    }
    return (Value) super.lt(that);
  }

  @Override
  public Item le(Item that) {
    if (that instanceof Value) {
      return le((Value) that);
    }
    return super.le(that);
  }

  public Value le(Value that) {
    if (that instanceof Expression) {
      return new LeOperator(this, that);
    }
    return (Value) super.le(that);
  }

  @Override
  public Item eq(Item that) {
    if (that instanceof Value) {
      return eq((Value) that);
    }
    return super.eq(that);
  }

  public Value eq(Value that) {
    if (that instanceof Expression) {
      return new EqOperator(this, that);
    }
    return (Value) super.eq(that);
  }

  @Override
  public Item ne(Item that) {
    if (that instanceof Value) {
      return ne((Value) that);
    }
    return super.ne(that);
  }

  public Value ne(Value that) {
    if (that instanceof Expression) {
      return new NeOperator(this, that);
    }
    return (Value) super.ne(that);
  }

  @Override
  public Item ge(Item that) {
    if (that instanceof Value) {
      return ge((Value) that);
    }
    return super.ge(that);
  }

  public Value ge(Value that) {
    if (that instanceof Expression) {
      return new GeOperator(this, that);
    }
    return (Value) super.ge(that);
  }

  @Override
  public Item gt(Item that) {
    if (that instanceof Value) {
      return gt((Value) that);
    }
    return super.gt(that);
  }

  public Value gt(Value that) {
    if (that instanceof Expression) {
      return new GtOperator(this, that);
    }
    return (Value) super.gt(that);
  }

  @Override
  public Item plus(Item that) {
    if (that instanceof Value) {
      return plus((Value) that);
    } else if (that instanceof Slot) {
      final Value newValue = plus(((Slot) that).value);
      if (newValue.isDefined()) {
        return new Slot(((Slot) that).key, newValue);
      }
    } else if (that instanceof Attr) {
      final Value newValue = plus(((Attr) that).value);
      if (newValue.isDefined()) {
        return new Attr(((Attr) that).key, newValue);
      }
    }
    return Item.absent();
  }

  public Value plus(Value that) {
    if (that instanceof Expression) {
      return new PlusOperator(this, that);
    }
    return Value.absent();
  }

  @Override
  public Item minus(Item that) {
    if (that instanceof Value) {
      return minus((Value) that);
    } else if (that instanceof Slot) {
      final Value newValue = minus(((Slot) that).value);
      if (newValue.isDefined()) {
        return new Slot(((Slot) that).key, newValue);
      }
    } else if (that instanceof Attr) {
      final Value newValue = minus(((Attr) that).value);
      if (newValue.isDefined()) {
        return new Attr(((Attr) that).key, newValue);
      }
    }
    return Item.absent();
  }

  public Value minus(Value that) {
    if (that instanceof Expression) {
      return new MinusOperator(this, that);
    }
    return Value.absent();
  }

  @Override
  public Item times(Item that) {
    if (that instanceof Value) {
      return times((Value) that);
    } else if (that instanceof Slot) {
      final Value newValue = times(((Slot) that).value);
      if (newValue.isDefined()) {
        return new Slot(((Slot) that).key, newValue);
      }
    } else if (that instanceof Attr) {
      final Value newValue = times(((Attr) that).value);
      if (newValue.isDefined()) {
        return new Attr(((Attr) that).key, newValue);
      }
    }
    return Item.absent();
  }

  public Value times(Value that) {
    if (that instanceof Expression) {
      return new TimesOperator(this, that);
    }
    return Value.absent();
  }

  @Override
  public Item divide(Item that) {
    if (that instanceof Value) {
      return divide((Value) that);
    } else if (that instanceof Slot) {
      final Value newValue = divide(((Slot) that).value);
      if (newValue.isDefined()) {
        return new Slot(((Slot) that).key, newValue);
      }
    } else if (that instanceof Attr) {
      final Value newValue = divide(((Attr) that).value);
      if (newValue.isDefined()) {
        return new Attr(((Attr) that).key, newValue);
      }
    }
    return Item.absent();
  }

  public Value divide(Value that) {
    if (that instanceof Expression) {
      return new DivideOperator(this, that);
    }
    return Value.absent();
  }

  @Override
  public Item modulo(Item that) {
    if (that instanceof Value) {
      return modulo((Value) that);
    } else if (that instanceof Slot) {
      final Value newValue = modulo(((Slot) that).value);
      if (newValue.isDefined()) {
        return new Slot(((Slot) that).key, newValue);
      }
    } else if (that instanceof Attr) {
      final Value newValue = modulo(((Attr) that).value);
      if (newValue.isDefined()) {
        return new Attr(((Attr) that).key, newValue);
      }
    }
    return Item.absent();
  }

  public Value modulo(Value that) {
    if (that instanceof Expression) {
      return new ModuloOperator(this, that);
    }
    return Value.absent();
  }

  @Override
  public Value not() {
    return Value.absent();
  }

  @Override
  public Value bitwiseNot() {
    return Value.absent();
  }

  @Override
  public Value negative() {
    return Value.absent();
  }

  @Override
  public Value positive() {
    return Value.absent();
  }

  @Override
  public Value inverse() {
    return Value.absent();
  }

  @Override
  public Value lambda(Value template) {
    return new LambdaFunc(this, template);
  }

  /**
   * Converts this {@code Value} into a {@code String} value, if possible.
   *
   * @throws UnsupportedOperationException if this {@code Value} can't be
   *                                       converted into a {@code String} value.
   */
  @Override
  public String stringValue() {
    throw new UnsupportedOperationException();
  }

  /**
   * Converts this {@code Value} into a {@code String} value, if possible;
   * otherwise returns {@code orElse} if this {@code Value} can't be converted
   * into a {@code string} value.
   */
  @Override
  public String stringValue(String orElse) {
    return orElse;
  }

  /**
   * Converts this {@code Value} into a primitive {@code byte} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Value} can't be
   *                                       converted into a primitive {@code byte} value.
   */
  @Override
  public byte byteValue() {
    throw new UnsupportedOperationException();
  }

  /**
   * Converts this {@code Value} into a primitive {@code byte} value,
   * if possible; otherwise returns {@code orElse} if this {@code Value} can't
   * be converted into a primitive {@code byte} value.
   */
  @Override
  public byte byteValue(byte orElse) {
    return orElse;
  }

  /**
   * Converts this {@code Value} into a primitive {@code short} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Value} can't be
   *                                       converted into a primitive {@code short} value.
   */
  @Override
  public short shortValue() {
    throw new UnsupportedOperationException();
  }

  /**
   * Converts this {@code Value} into a primitive {@code short} value,
   * if possible; otherwise returns {@code orElse} if this {@code Value} can't
   * be converted into a primitive {@code short} value.
   */
  @Override
  public short shortValue(short orElse) {
    return orElse;
  }

  /**
   * Converts this {@code Value} into a primitive {@code int} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Value} can't be
   *                                       converted into a primitive {@code int} value.
   */
  @Override
  public int intValue() {
    throw new UnsupportedOperationException();
  }

  /**
   * Converts this {@code Value} into a primitive {@code int} value,
   * if possible; otherwise returns {@code orElse} if this {@code Value} can't
   * be converted into a primitive {@code int} value.
   */
  @Override
  public int intValue(int orElse) {
    return orElse;
  }

  /**
   * Converts this {@code Value} into a primitive {@code long} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Value} can't be
   *                                       converted into a primitive {@code long} value.
   */
  @Override
  public long longValue() {
    throw new UnsupportedOperationException();
  }

  /**
   * Converts this {@code Value} into a primitive {@code long} value,
   * if possible; otherwise returns {@code orElse} if this {@code Value} can't
   * be converted into a primitive {@code long} value.
   */
  @Override
  public long longValue(long orElse) {
    return orElse;
  }

  /**
   * Converts this {@code Value} into a primitive {@code float} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Value} can't be
   *                                       converted into a primitive {@code float} value.
   */
  @Override
  public float floatValue() {
    throw new UnsupportedOperationException();
  }

  /**
   * Converts this {@code Value} into a primitive {@code float} value,
   * if possible; otherwise returns {@code orElse} if this {@code Value} can't
   * be converted into a primitive {@code float} value.
   */
  @Override
  public float floatValue(float orElse) {
    return orElse;
  }

  /**
   * Converts this {@code Value} into a primitive {@code double} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Value} can't be
   *                                       converted into a primitive {@code double} value.
   */
  @Override
  public double doubleValue() {
    throw new UnsupportedOperationException();
  }

  /**
   * Converts this {@code Value} into a primitive {@code double} value,
   * if possible; otherwise returns {@code orElse} if this {@code Value} can't
   * be converted into a primitive {@code double} value.
   */
  @Override
  public double doubleValue(double orElse) {
    return orElse;
  }

  /**
   * Converts this {@code Value} into a {@code BigInteger} value, if possible.
   *
   * @throws UnsupportedOperationException if this {@code Value} can't be
   *                                       converted into a {@code BigInteger} value.
   */
  @Override
  public BigInteger integerValue() {
    throw new UnsupportedOperationException();
  }

  /**
   * Converts this {@code Value} into a {@code BigInteger} value, if possible;
   * otherwise returns {@code orElse} if this {@code Value} can't be converted
   * into a {@code BigInteger} value.
   */
  @Override
  public BigInteger integerValue(BigInteger orElse) {
    return orElse;
  }

  /**
   * Converts this {@code Value} into a {@code Number} object, if possible.
   *
   * @throws UnsupportedOperationException if this {@code Value} can't be
   *                                       converted into a {@code Number} object.
   */
  @Override
  public Number numberValue() {
    throw new UnsupportedOperationException();
  }

  /**
   * Converts this {@code Value} into a {@code Number} object, if possible;
   * otherwise returns {@code orElse} if this {@code Value} can't be converted
   * into a {@code Number} object.
   */
  @Override
  public Number numberValue(Number orElse) {
    return orElse;
  }

  /**
   * Converts this {@code Value} into a primitive {@code char} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Value} can't be
   *                                       converted into a primitive {@code char} value.
   */
  @Override
  public char charValue() {
    throw new UnsupportedOperationException();
  }

  /**
   * Converts this {@code Value} into a primitive {@code char} value,
   * if possible; otherwise returns {@code orElse} if this {@code Value} can't
   * be converted into a primitive {@code char} value.
   */
  @Override
  public char charValue(char orElse) {
    return orElse;
  }

  /**
   * Converts this {@code Value} into a primitive {@code boolean} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Value} can't be
   *                                       converted into a primitive {@code boolean} value.
   */
  @Override
  public boolean booleanValue() {
    throw new UnsupportedOperationException();
  }

  /**
   * Converts this {@code Value} into a primitive {@code boolean} value,
   * if possible; otherwise returns {@code orElse} if this {@code Value} can't
   * be converted into a primitive {@code boolean} value.
   */
  @Override
  public boolean booleanValue(boolean orElse) {
    return orElse;
  }

  @Override
  public boolean isAliased() {
    return false;
  }

  @Override
  public boolean isMutable() {
    return false;
  }

  @Override
  public void alias() {
    // nop
  }

  @Override
  public Value branch() {
    return this;
  }

  @Override
  public Value commit() {
    return this;
  }

  @Override
  public boolean keyEquals(Object key) {
    return false;
  }

  public static Builder<Item, Value> builder() {
    return new ValueBuilder();
  }

  public static Value empty() {
    return Record.empty();
  }

  public static Value extant() {
    return Extant.extant();
  }

  public static Value absent() {
    return Absent.absent();
  }

  public static Value fromObject(Object object) {
    if (object == null) {
      return Value.extant();
    } else if (object instanceof Value) {
      return (Value) object;
    } else if (object instanceof String) {
      return Text.from((String) object);
    } else if (object instanceof Number) {
      return Num.from((Number) object);
    } else if (object instanceof Character) {
      return Num.from(((Character) object).charValue());
    } else if (object instanceof Boolean) {
      return Bool.from(((Boolean) object).booleanValue());
    } else if (object instanceof ByteBuffer) {
      return Data.from((ByteBuffer) object);
    } else if (object instanceof byte[]) {
      return Data.wrap((byte[]) object);
    } else {
      throw new IllegalArgumentException(object.toString());
    }
  }
}
