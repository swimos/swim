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
import java.util.ArrayList;
import java.util.Collection;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
import java.util.SortedMap;
import java.util.SortedSet;
import java.util.TreeMap;
import java.util.TreeSet;
import swim.structure.form.ArrayForm;
import swim.structure.form.BigIntegerForm;
import swim.structure.form.BooleanForm;
import swim.structure.form.ByteBufferForm;
import swim.structure.form.ByteForm;
import swim.structure.form.CharacterForm;
import swim.structure.form.CollectionForm;
import swim.structure.form.DoubleForm;
import swim.structure.form.FloatForm;
import swim.structure.form.IntegerForm;
import swim.structure.form.ItemForm;
import swim.structure.form.LongForm;
import swim.structure.form.MapForm;
import swim.structure.form.NumberForm;
import swim.structure.form.PolyForm;
import swim.structure.form.ShortForm;
import swim.structure.form.StringForm;
import swim.structure.form.TagForm;
import swim.structure.form.UnitForm;
import swim.structure.form.ValueForm;

/**
 * Transformation between a structurally typed {@link Item} and a nominally
 * typed Java object.
 */
public abstract class Form<T> {
  /**
   * Returns the key of the tag attribute that distinguishes structures of this
   * {@code Form}; returns {@code null} if this {@code Form} has no
   * distinguishing tag attribute.  Used to accelerate distrcrimination of
   * polymorphic structural types with nominal type hints.
   */
  public String tag() {
    return null;
  }

  /**
   * Returns a version of this {@code Form} that requires a head {@link Attr}
   * with the given {@code tag} name.
   */
  public Form<T> tag(String tag) {
    if (tag != null) {
      return new TagForm<T>(tag, this);
    } else {
      return this;
    }
  }

  /**
   * Returns a default–possibly {@code null}–value of type {@code T}.  Used
   * as the fallback return value when {@link Item#coerce(Form) coercing} an
   * invalid structural value.
   */
  public T unit() {
    return null;
  }

  /**
   * Returns a version of this {@code Form} with the given {@code unit} value.
   */
  public Form<T> unit(T unit) {
    if (unit != null) {
      return new UnitForm<T>(unit, this);
    } else {
      return this;
    }
  }

  /**
   * Returns the reified {@code Class} of type {@code T}.
   */
  public abstract Class<?> type();

  /**
   * Converts a nominally typed Java {@code object} into its structurally typed
   * equivalent based on the provided prototype {@code item}.  The passed-in
   * {@code item} is assumed to be non-{@code null}.  The returned {@code Item}
   * must never be {@code null}.
   */
  public Item mold(T object, Item item) {
    return item.concat(mold(object));
  }

  /**
   * Converts a nominally typed Java {@code object} into its structurally typed
   * equivalent.  The returned {@code Item} must never be {@code null}.
   */
  public abstract Item mold(T object);

  /**
   * Converts a structurally typed {@code item} into a nominally typed Java
   * object based on the provided prototype {@code object}.  The passed-in
   * {@code item} is assumed to be non-{@code null}.  The passed-in prototype
   * {@code object} may be {@code null}.
   */
  public T cast(Item item, T object) {
    return cast(item);
  }

  /**
   * Converts a structurally typed {@code item} into a nominally typed Java
   * object.  The passed-in {@code item} is assumed to be non-{@code null}.
   */
  public abstract T cast(Item item);

  private static Form<Byte> byteForm;
  private static Form<Short> shortForm;
  private static Form<Integer> integerForm;
  private static Form<Long> longForm;
  private static Form<Float> floatForm;
  private static Form<Double> doubleForm;
  private static Form<Character> characterForm;
  private static Form<Boolean> booleanForm;
  private static Form<BigInteger> bigIntegerForm;
  private static Form<Number> numberForm;
  private static Form<String> stringForm;
  private static Form<ByteBuffer> byteBufferForm;
  private static Form<Item> itemForm;
  private static Form<Value> valueForm;

  /**
   * Utility method to receive a singleton {@link ByteForm}.
   */
  public static Form<Byte> forByte() {
    if (byteForm == null) {
      byteForm = new ByteForm((byte) 0);
    }
    return byteForm;
  }

  /**
   * Utility method to receive a singleton {@link ShortForm}.
   */
  public static Form<Short> forShort() {
    if (shortForm == null) {
      shortForm = new ShortForm((short) 0);
    }
    return shortForm;
  }

  /**
   * Utility method to receive a singleton {@link IntegerForm}.
   */
  public static Form<Integer> forInteger() {
    if (integerForm == null) {
      integerForm = new IntegerForm(0);
    }
    return integerForm;
  }

  /**
   * Utility method to receive a singleton {@link LongForm}.
   */
  public static Form<Long> forLong() {
    if (longForm == null) {
      longForm = new LongForm(0L);
    }
    return longForm;
  }

  /**
   * Utility method to receive a singleton {@link FloatForm}.
   */
  public static Form<Float> forFloat() {
    if (floatForm == null) {
      floatForm = new FloatForm(0.0f);
    }
    return floatForm;
  }

  /**
   * Utility method to receive a singleton {@link DoubleForm}.
   */
  public static Form<Double> forDouble() {
    if (doubleForm == null) {
      doubleForm = new DoubleForm(0.0);
    }
    return doubleForm;
  }

  /**
   * Utility method to receive a singleton {@link CharacterForm}.
   */
  public static Form<Character> forCharacter() {
    if (characterForm == null) {
      characterForm = new CharacterForm('\0');
    }
    return characterForm;
  }

  /**
   * Utility method to receive a singleton {@link BooleanForm}.
   */
  public static Form<Boolean> forBoolean() {
    if (booleanForm == null) {
      booleanForm = new BooleanForm(false);
    }
    return booleanForm;
  }

  /**
   * Utility method to receive a singleton {@link BigIntegerForm}.
   */
  public static final Form<BigInteger> forBigInteger() {
    if (bigIntegerForm == null) {
      bigIntegerForm = new BigIntegerForm(BigInteger.ZERO);
    }
    return bigIntegerForm;
  }

  /**
   * Utility method to receive a singleton {@link NumberForm}.
   */
  public static Form<Number> forNumber() {
    if (numberForm == null) {
      numberForm = new NumberForm(Integer.valueOf(0));
    }
    return numberForm;
  }

  /**
   * Utility method to receive a singleton {@link StringForm}.
   */
  public static Form<String> forString() {
    if (stringForm == null) {
      stringForm = new StringForm("");
    }
    return stringForm;
  }

  /**
   * Utility method to receive a singleton {@link ByteBufferForm}.
   */
  public static Form<ByteBuffer> forByteBuffer() {
    if (byteBufferForm == null) {
      byteBufferForm = new ByteBufferForm();
    }
    return byteBufferForm;
  }

  /**
   * Utility method to receive a singleton {@link ItemForm}.
   */
  public static Form<Item> forItem() {
    if (itemForm == null) {
      itemForm = new ItemForm(Item.absent());
    }
    return itemForm;
  }

  /**
   * Utility method to receive a singleton {@link ValueForm}.
   */
  public static Form<Value> forValue() {
    if (valueForm == null) {
      valueForm = new ValueForm(Value.absent());
    }
    return valueForm;
  }

  /**
   * Utility method to construct an {@link ArrayForm}.
   */
  @SuppressWarnings("unchecked")
  public static <T> Form<T> forArray(Class<?> type, Form<?> form) {
    return (Form<T>) new ArrayForm(type, form);
  }

  /**
   * Utility method to construct a {@link CollectionForm}.
   */
  @SuppressWarnings("unchecked")
  public static <CC, T> Form<CC> forCollection(Class<?> type, Form<T> form) {
    if (type == Collection.class || type == List.class) {
      type = ArrayList.class;
    } else if (type == Queue.class || type == Deque.class) {
      type = LinkedList.class;
    } else if (type == Set.class) {
      type = HashSet.class;
    } else if (type == SortedSet.class) {
      type = TreeSet.class;
    }
    return (Form<CC>) new CollectionForm<T>(type, form);
  }

  /**
   * Utility method to construct a {@link CollectionForm} where the underlying
   * collection is of type {@link java.util.List List&lt;T&gt;}.
   */
  public static <T> Form<List<T>> forList(Form<T> form) {
    return forCollection(List.class, form);
  }

  /**
   * Utility method to construct a {@link CollectionForm} where the underlying
   * collection is of type {@link java.util.Set List&lt;T&gt;}.
   */
  public static <T> Form<Set<T>> forSet(Form<T> form) {
    return forCollection(Set.class, form);
  }

  /**
   * Utility method to construct a {@link MapForm} where {@link Form#cast(Item)
   * casts} return objects of type {@code type}.
   *
   * @throws ClassCastException if {@code type} does not extend {@link
   * java.util.Map}
   */
  @SuppressWarnings("unchecked")
  public static <CC, K, V> Form<CC> forMap(Class<?> type, Form<K> keyForm, Form<V> valForm) {
    if (type == Map.class) {
      type = HashMap.class;
    } else if (type == SortedMap.class) {
      type = TreeMap.class;
    }
    return (Form<CC>) (Form<?>) new MapForm<K, V>(type, keyForm, valForm);
  }

  /**
   * Utility method to construct a {@link MapForm}.
   */
  public static <K, V> Form<Map<K, V>> forMap(Form<K> keyForm, Form<V> valForm) {
    return forMap(Map.class, keyForm, valForm);
  }

  /**
   * Returns whether {@code type} has a built-in base (i.e. is defined in {@code
   * swim.structure.form} and is not a {@code CollectionForm}) {@code Form}.
   */
  public static boolean isBuiltin(Class<?> type) {
    return type.isPrimitive() || type.isArray() || type == Object.class
        || String.class.isAssignableFrom(type)
        || Number.class.isAssignableFrom(type)
        || Character.class.isAssignableFrom(type)
        || Boolean.class.isAssignableFrom(type)
        || ByteBuffer.class.isAssignableFrom(type);
  }

  /**
   * Returns the {@code type} built-in {@code Form} for {@code type} if it
   * exists, and {@code null} if it does not.
   */
  @SuppressWarnings("unchecked")
  public static <T> Form<T> forBuiltin(Class<?> type) {
    if (type == String.class) {
      return (Form<T>) forString();
    } else if (type == Byte.class || type == Byte.TYPE) {
      return (Form<T>) forByte();
    } else if (type == Short.class || type == Short.TYPE) {
      return (Form<T>) forShort();
    } else if (type == Integer.class || type == Integer.TYPE) {
      return (Form<T>) forInteger();
    } else if (type == Long.class || type == Long.TYPE) {
      return (Form<T>) forLong();
    } else if (type == Float.class || type == Float.TYPE) {
      return (Form<T>) forFloat();
    } else if (type == Double.class || type == Double.TYPE) {
      return (Form<T>) forDouble();
    } else if (type == Character.class || type == Character.TYPE) {
      return (Form<T>) forCharacter();
    } else if (type == Boolean.class || type == Boolean.TYPE) {
      return (Form<T>) forBoolean();
    } else if (type == BigInteger.class) {
      return (Form<T>) forBigInteger();
    } else if (type == ByteBuffer.class) {
      return (Form<T>) forByteBuffer();
    } else if (Value.class.isAssignableFrom(type)) {
      return (Form<T>) forValue();
    } else if (Item.class.isAssignableFrom(type)) {
      return (Form<T>) forItem();
    } else {
      return null;
    }
  }

  /**
   * Returns a {@code Form} for {@code type} against {@code scope} preferring
   * built-in {@code Forms} to {@link swim.structure.form.ClassForm}
   * constructions whenever possible.
   */
  public static <T> Form<T> forClass(Class<?> type, PolyForm scope) {
    if (type.isArray()) {
      final Class<?> componentType = type.getComponentType();
      return forArray(componentType, forClass(componentType));
    } else {
      Form<T> form = forBuiltin(type);
      if (form != null) {
        return form;
      }
      if (scope == null) {
        scope = new PolyForm();
      }
      form = scope.reflectClass(type);
      if (form != null) {
        return form;
      }
      return null;
    }
  }

  /**
   * Returns a {@code Form} for {@code type} preferring built-in {@code Forms}
   * to {@link swim.structure.form.ClassForm} constructions whenever possible.
   */
  public static <T> Form<T> forClass(Class<?> type) {
    return forClass(type, null);
  }
}
