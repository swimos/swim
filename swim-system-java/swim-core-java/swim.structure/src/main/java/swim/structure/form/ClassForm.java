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

package swim.structure.form;

import java.lang.reflect.Constructor;
import swim.structure.Attr;
import swim.structure.Form;
import swim.structure.FormException;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Text;
import swim.structure.Value;

/**
 * For some {@code Class}, a transformation between a structurally typed {@code
 * Item} and an instance of that {@code Class}.
 * <p>
 * A {@code Class} instance in Java can be completely described by its {@code
 * Class} <em>name</em>, its <em>field names</em>, and its <em>field
 * values</em>.  This, combined with the fact that some fields are more
 * important than others, gives rise to the following rules for transforming
 * objects into structured {@code Items}:
 * <ol>
 *   <li>The {@code} String identifier for the {@code Class}, usually simply
 *   the {@code Class} name or some function of it, is called {@code tag}.</li>
 *   <li>Every field being considered is either a {@code member} or a {@code
 *   header}, with the latter reserved for "important" fields.</li>
 *   <li>Every such field transforms to a {@link swim.structure.Slot} whose key
 *   is the name of the field and whose value is the {@code Item} representation
 *   of the field.</li>
 *   <li>The structural representation of every object is some {@link Record}
 *   unless the item is {@code null}, which always transforms into {@link
 *   swim.structure.Extant}.</li>
 *   <li>The first entry in this {@code Record} is an {@link Attr} whose key is
 *   {@code tag} and whose value is either:
 *   <ul>
 *     <li>A {@code Record} of {@code headers} that were transformed into {@code
 *     Slots} via rule 3., or</li>
 *     <li>{@code Extant} if this {@code Class} has no fields.</li>
 *   </ul>
 *   </li>
 *   <li>Every subsequent entry in the {@code Record} from rule 4. is a {@code
 *   member} that was transformed into a {@code Slot} via rule 3.</li>
 * </ol>
 * <p>
 * These rules can be directly inverted to transform {@code Items} to objects.
 */
public final class ClassForm<T> extends Form<T> implements Cloneable {
  final Class<?> type;
  final String tag;
  final T unit;
  final Constructor<T> constructor;
  Form<T>[] headers;
  Form<T>[] members;

  @SuppressWarnings("unchecked")
  ClassForm(Class<?> type, String tag, T unit, Constructor<T> constructor,
            Form<T>[] headers, Form<T>[] members) {
    this.type = type;
    this.tag = tag;
    this.unit = unit;
    this.constructor = constructor;
    this.headers = headers;
    this.members = members;
  }

  @SuppressWarnings("unchecked")
  public ClassForm(Class<?> type, String tag, T unit) {
    this.type = type;
    this.tag = tag;
    this.unit = unit;
    Constructor<T> constructor;
    try {
      constructor = (Constructor<T>) type.getDeclaredConstructor();
      constructor.setAccessible(true);
    } catch (NoSuchMethodException cause) {
      constructor = null;
    }
    this.constructor = constructor;
    this.headers = (Form<T>[]) new Form<?>[0];
    this.members = (Form<T>[]) new Form<?>[0];
  }

  @Override
  public String tag() {
    return this.tag;
  }

  @Override
  public ClassForm<T> tag(String tag) {
    return new ClassForm<T>(this.type, tag, this.unit, this.constructor, this.headers, this.members);
  }

  @Override
  public T unit() {
    return this.unit;
  }

  @Override
  public ClassForm<T> unit(T unit) {
    return new ClassForm<T>(this.type, this.tag, unit, this.constructor, this.headers, this.members);
  }

  @SuppressWarnings("unchecked")
  public ClassForm<T> addHeader(Form<T> header) {
    final Form<T>[] oldHeaders = this.headers;
    final int n = oldHeaders.length;
    final Form<T>[] newHeaders = (Form<T>[]) new Form<?>[n + 1];
    System.arraycopy(oldHeaders, 0, newHeaders, 0, n);
    newHeaders[n] = header;
    this.headers = newHeaders;
    return this;
  }

  @SuppressWarnings("unchecked")
  public ClassForm<T> putHeader(Form<T> header) {
    if (header instanceof FieldForm<?>) {
      final String name = ((FieldForm<?>) header).field().getName();
      final Form<T>[] oldHeaders = this.headers;
      for (int i = 0, n = oldHeaders.length; i < n; i += 1) {
        final Form<T> oldHeader = oldHeaders[i];
        if (oldHeader instanceof FieldForm<?> && name.equals(((FieldForm<?>) oldHeader).field().getName())) {
          final Form<T>[] newHeaders = (Form<T>[]) new Form<?>[n];
          System.arraycopy(oldHeaders, 0, newHeaders, 0, n);
          newHeaders[i] = header;
          this.headers = newHeaders;
          return this;
        }
      }
    }
    return addHeader(header);
  }

  public ClassForm<T> putHeader(String name, Value key, Form<?> form) {
    try {
      final java.lang.reflect.Field field = this.type.getField(name);
      final Form<T> header = new SlotForm<T>(field, key, form);
      return putHeader(header);
    } catch (NoSuchFieldException cause) {
      throw new FormException(cause);
    }
  }

  public ClassForm<T> putHeader(String name, Form<?> form) {
    return putHeader(name, Text.from(name), form);
  }

  @SuppressWarnings("unchecked")
  public ClassForm<T> addMember(Form<T> member) {
    final Form<T>[] oldMembers = this.members;
    final int n = oldMembers.length;
    final Form<T>[] newMembers = (Form<T>[]) new Form<?>[n + 1];
    System.arraycopy(oldMembers, 0, newMembers, 0, n);
    newMembers[n] = member;
    this.members = newMembers;
    return this;
  }

  @SuppressWarnings("unchecked")
  public ClassForm<T> putMember(Form<T> member) {
    if (member instanceof FieldForm<?>) {
      final String name = ((FieldForm<?>) member).field().getName();
      final Form<T>[] oldMembers = this.members;
      for (int i = 0, n = oldMembers.length; i < n; i += 1) {
        final Form<T> oldMember = oldMembers[i];
        if (oldMember instanceof FieldForm<?> && name.equals(((FieldForm<?>) oldMember).field().getName())) {
          final Form<T>[] newMembers = (Form<T>[]) new Form<?>[n];
          System.arraycopy(oldMembers, 0, newMembers, 0, n);
          newMembers[i] = member;
          this.members = newMembers;
          return this;
        }
      }
    }
    return addMember(member);
  }

  public ClassForm<T> putMember(String name, Value key, Form<?> form) {
    try {
      final java.lang.reflect.Field field = this.type.getField(name);
      final Form<T> member = new SlotForm<T>(field, key, form);
      return putMember(member);
    } catch (NoSuchFieldException cause) {
      throw new FormException(cause);
    }
  }

  public ClassForm<T> putMember(String name, Form<?> form) {
    return putMember(name, Text.from(name), form);
  }

  @Override
  public Class<?> type() {
    return this.type;
  }

  @Override
  public Item mold(T object, Item item) {
    if (object != null) {
      final Item head;
      if (this.tag != null) {
        Value header = Value.absent();
        for (int i = 0, n = this.headers.length; i < n; i += 1) {
          header = this.headers[i].mold(object, header).toValue();
        }
        if (!header.isDefined()) {
          header = Value.extant();
        }
        head = Attr.of(this.tag, header);
      } else {
        head = null;
      }
      for (int i = 0, n = this.members.length; i < n; i += 1) {
        item = this.members[i].mold(object, item);
      }
      if (head != null) {
        item = item.prepended(head);
      }
    }
    return item;
  }

  @Override
  public Item mold(T object) {
    if (object != null) {
      final Item head;
      if (this.tag != null) {
        Value header = Value.absent();
        for (int i = 0, n = this.headers.length; i < n; i += 1) {
          header = this.headers[i].mold(object, header).toValue();
        }
        if (!header.isDefined()) {
          header = Value.extant();
        }
        head = Attr.of(this.tag, header);
      } else {
        head = null;
      }
      final int n = this.members.length;
      Item item = Record.create(head != null ? 1 + n : n);
      for (int i = 0; i < n; i += 1) {
        item = this.members[i].mold(object, item);
      }
      if (head != null) {
        item = item.prepended(head);
      }
      return item;
    } else {
      return Item.extant();
    }
  }

  @Override
  public T cast(Item item, T object) {
    final Value value = item.toValue();
    if (this.tag != null) {
      final Value header = value.header(this.tag);
      if (!header.isDefined()) {
        return null;
      }
      for (int i = 0, n = this.headers.length; i < n; i += 1) {
        object = this.headers[i].cast(header, object);
      }
    }
    for (int i = 0, n = this.members.length; i < n; i += 1) {
      object = this.members[i].cast(value, object);
    }
    return object;
  }

  @Override
  public T cast(Item item) {
    if (this.constructor != null) {
      try {
        final T object = this.constructor.newInstance();
        return cast(item, object);
      } catch (ReflectiveOperationException cause) {
        throw new FormException(cause);
      }
    }
    return null;
  }

  @Override
  public ClassForm<T> clone() {
    return new ClassForm<T>(this.type, this.tag, this.unit, this.constructor, this.headers, this.members);
  }
}
