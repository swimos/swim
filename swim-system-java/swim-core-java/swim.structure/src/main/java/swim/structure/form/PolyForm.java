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

import java.lang.reflect.Field;
import java.lang.reflect.GenericArrayType;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.nio.ByteBuffer;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import swim.collections.HashTrieMap;
import swim.structure.Bool;
import swim.structure.Data;
import swim.structure.Form;
import swim.structure.FormException;
import swim.structure.Header;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Member;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Tag;
import swim.structure.Text;

public class PolyForm extends Form<Object> implements Cloneable {
  final Object unit;
  HashTrieMap<Class<?>, Form<?>> classForms;
  HashTrieMap<String, Form<?>> tagForms;

  PolyForm(Object unit, HashTrieMap<Class<?>, Form<?>> classForms,
           HashTrieMap<String, Form<?>> tagForms) {
    this.unit = unit;
    this.classForms = classForms;
    this.tagForms = tagForms;
  }

  public PolyForm() {
    this(null, HashTrieMap.<Class<?>, Form<?>>empty(), HashTrieMap.<String, Form<?>>empty());
  }

  @Override
  public final Object unit() {
    return this.unit;
  }

  @Override
  public PolyForm unit(Object unit) {
    return new PolyForm(unit, this.classForms, this.tagForms);
  }

  @Override
  public final Class<?> type() {
    return Object.class;
  }

  @Override
  public Item mold(Object object, Item item) {
    if (object != null) {
      final Form<Object> form = formForClass(object.getClass());
      if (form != null) {
        return form.mold(object, item);
      } else if (object instanceof String) {
        return moldString((String) object, item);
      } else if (object instanceof Number) {
        return moldNumber((Number) object, item);
      } else if (object instanceof Character) {
        return moldCharacter((Character) object, item);
      } else if (object instanceof Boolean) {
        return moldBoolean((Boolean) object, item);
      } else if (object instanceof ByteBuffer) {
        return moldByteBuffer((ByteBuffer) object, item);
      } else if (object instanceof Map<?, ?>) {
        return moldMap((Map<?, ?>) object, item);
      } else if (object instanceof Collection<?>) {
        return moldCollection((Collection<?>) object, item);
      } else if (object instanceof Object[]) {
        return moldArray((Object[]) object, item);
      } else {
        return Item.absent();
      }
    } else {
      return Item.extant();
    }
  }

  @Override
  public Item mold(Object object) {
    if (object != null) {
      final Form<Object> form = formForClass(object.getClass());
      if (form != null) {
        return form.mold(object);
      } else if (object instanceof String) {
        return moldString((String) object);
      } else if (object instanceof Number) {
        return moldNumber((Number) object);
      } else if (object instanceof Character) {
        return moldCharacter((Character) object);
      } else if (object instanceof Boolean) {
        return moldBoolean((Boolean) object);
      } else if (object instanceof ByteBuffer) {
        return moldByteBuffer((ByteBuffer) object);
      } else if (object instanceof Map<?, ?>) {
        return moldMap((Map<?, ?>) object);
      } else if (object instanceof Collection<?>) {
        return moldCollection((Collection<?>) object);
      } else if (object instanceof Object[]) {
        return moldArray((Object[]) object);
      } else {
        return Item.absent();
      }
    } else {
      return Item.extant();
    }
  }

  protected Item moldString(String object, Item item) {
    return Form.forString().mold(object, item);
  }

  protected Item moldString(String object) {
    return Form.forString().mold(object);
  }

  protected Item moldNumber(Number object, Item item) {
    return Form.forNumber().mold(object, item);
  }

  protected Item moldNumber(Number object) {
    return Form.forNumber().mold(object);
  }

  protected Item moldCharacter(Character object, Item item) {
    return Form.forCharacter().mold(object, item);
  }

  protected Item moldCharacter(Character object) {
    return Form.forCharacter().mold(object);
  }

  protected Item moldBoolean(Boolean object, Item item) {
    return Form.forBoolean().mold(object, item);
  }

  protected Item moldBoolean(Boolean object) {
    return Form.forBoolean().mold(object);
  }

  protected Item moldByteBuffer(ByteBuffer object, Item item) {
    return Form.forByteBuffer().mold(object, item);
  }

  protected Item moldByteBuffer(ByteBuffer object) {
    return Form.forByteBuffer().mold(object);
  }

  protected Item moldArray(Object[] object, Item item) {
    return Form.forArray(object.getClass().getComponentType(), this).mold(object, item);
  }

  protected Item moldArray(Object[] object) {
    return Form.forArray(object.getClass().getComponentType(), this).mold(object);
  }

  protected Item moldCollection(Collection<?> object, Item item) {
    return Form.forCollection(object.getClass(), this).mold(object, item);
  }

  protected Item moldCollection(Collection<?> object) {
    return Form.forCollection(object.getClass(), this).mold(object);
  }

  protected Item moldMap(Map<?, ?> object, Item item) {
    return Form.forMap(object.getClass(), this, this).mold(object, item);
  }

  protected Item moldMap(Map<?, ?> object) {
    return Form.forMap(object.getClass(), this, this).mold(object);
  }

  @Override
  public Object cast(Item item, Object object) {
    if (item instanceof Record) {
      return castRecord((Record) item, object);
    } else if (item instanceof Text) {
      return castText((Text) item);
    } else if (item instanceof Data) {
      return castData((Data) item);
    } else if (item instanceof Num) {
      return castNum((Num) item);
    } else if (item instanceof Bool) {
      return castBool((Bool) item);
    }
    return null;
  }

  @Override
  public Object cast(Item item) {
    if (item instanceof Record) {
      return castRecord((Record) item);
    } else if (item instanceof Text) {
      return castText((Text) item);
    } else if (item instanceof Data) {
      return castData((Data) item);
    } else if (item instanceof Num) {
      return castNum((Num) item);
    } else if (item instanceof Bool) {
      return castBool((Bool) item);
    }
    return null;
  }

  protected Object castRecord(Record value, Object object) {
    final Form<Object> form = formForTag(value.tag());
    if (form != null) {
      return form.cast(value, object);
    } else {
      return null;
    }
  }

  protected Object castRecord(Record value) {
    final Form<Object> form = formForTag(value.tag());
    if (form != null) {
      return form.cast(value);
    } else {
      return null;
    }
  }

  protected Object castText(Text value) {
    return Form.forString().cast(value);
  }

  protected Object castData(Data value) {
    return Form.forByteBuffer().cast(value);
  }

  protected Object castNum(Num value) {
    return Form.forNumber().cast(value);
  }

  protected Object castBool(Bool value) {
    return Form.forBoolean().cast(value);
  }

  @SuppressWarnings("unchecked")
  public <T> Form<T> formForTag(String tag) {
    if (tag != null) {
      return (Form<T>) this.tagForms.get(tag);
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  public <T> Form<T> formForClass(Class<?> type) {
    Form<T> form;
    do {
      form = (Form<T>) this.classForms.get(type);
      type = type.getSuperclass();
    } while (form == null && type != null);
    return form;
  }

  @SuppressWarnings("unchecked")
  public <T> Form<T> formForType(Type genericType) {
    if (genericType instanceof GenericArrayType) {
      Type componentType = ((GenericArrayType) genericType).getGenericComponentType();
      if (componentType instanceof TypeVariable) {
        componentType = ((TypeVariable) componentType).getBounds()[0];
      }
      if (componentType instanceof Class<?>) {
        return (Form<T>) Form.forArray((Class<?>) componentType, this);
      }
    }
    if (genericType instanceof ParameterizedType) {
      genericType = ((ParameterizedType) genericType).getRawType();
    }
    if (genericType instanceof Class<?>) {
      final Class<Object> type = (Class<Object>) genericType;
      if (type.isArray()) {
        return (Form<T>) Form.forArray(type.getComponentType(), this);
      } else if (Map.class.isAssignableFrom(type)) {
        return (Form<T>) Form.forMap(type, this, this);
      } else if (Collection.class.isAssignableFrom(type)) {
        return (Form<T>) Form.forCollection(type, this);
      } else {
        Form<T> form = formForClass(type);
        if (form != null) {
          return form;
        }
        form = Form.forClass(type);
        if (form != null) {
          return form;
        }
      }
    }
    return (Form<T>) this;
  }

  public PolyForm addForm(Form<?> newForm) {
    if (newForm instanceof PolyForm) {
      final PolyForm that = (PolyForm) newForm;
      final Iterator<Map.Entry<Class<?>, Form<?>>> classFormsIterator = that.classForms.iterator();
      while (classFormsIterator.hasNext()) {
        final Map.Entry<Class<?>, Form<?>> entry = classFormsIterator.next();
        this.classForms = this.classForms.updated(entry.getKey(), entry.getValue());
      }
      final Iterator<Map.Entry<String, Form<?>>> tagFormsIterator = that.tagForms.iterator();
      while (tagFormsIterator.hasNext()) {
        final Map.Entry<String, Form<?>> entry = tagFormsIterator.next();
        this.tagForms = this.tagForms.updated(entry.getKey(), entry.getValue());
      }
    } else {
      final Class<?> newClass = newForm.type();
      if (!classForms.containsKey(newClass)) {
        final String newTag = newForm.tag();
        if (newTag != null) {
          classForms = classForms.updated(newClass, newForm);
          tagForms = tagForms.updated(newTag, newForm);
        }
      }
    }
    return this;
  }

  public PolyForm addForms(Form<?>... newForms) {
    for (int i = 0, n = newForms.length; i < n; i += 1) {
      addForm(newForms[i]);
    }
    return this;
  }

  public PolyForm addClass(Class<?> newClass) {
    if (!classForms.containsKey(newClass)) {
      final Form<?> newForm = Form.forClass(newClass);
      if (newForm != null) {
        final String newTag = newForm.tag();
        if (newTag != null) {
          classForms = classForms.updated(newClass, newForm);
          tagForms = tagForms.updated(newTag, newForm);
        }
      }
    }
    return this;
  }

  public PolyForm addClasses(Class<?>... newClasses) {
    for (int i = 0, n = newClasses.length; i < n; i += 1) {
      addClass(newClasses[i]);
    }
    return this;
  }

  public PolyForm addType(Type genericType) {
    if (genericType instanceof GenericArrayType) {
      Type componentType = ((GenericArrayType) genericType).getGenericComponentType();
      if (componentType instanceof TypeVariable) {
        componentType = ((TypeVariable) componentType).getBounds()[0];
      }
      if (componentType instanceof Class<?>) {
        addClass((Class<?>) componentType);
      }
    } else if (genericType instanceof ParameterizedType) {
      addTypes(((ParameterizedType) genericType).getActualTypeArguments());
    } else if (genericType instanceof Class<?>) {
      final Class<?> type = (Class<?>) genericType;
      if (type.isArray()) {
        addClass(type.getComponentType());
      } else {
        addClass(type);
      }
    }
    return this;
  }

  public PolyForm addTypes(Type... newGenericTypes) {
    for (int i = 0, n = newGenericTypes.length; i < n; i += 1) {
      addType(newGenericTypes[i]);
    }
    return this;
  }

  public <T> ClassForm<T> reflectClassForm(ClassForm<T> classForm) {
    addForm(classForm);
    reflectFields(classForm, classForm.type());
    return classForm;
  }

  public <T> ClassForm<T> reflectClassForm(Class<?> type, String tag, T unit) {
    if (!type.isInterface() && (type.getModifiers() & Modifier.ABSTRACT) == 0 && !Form.isBuiltin(type)) {
      return reflectClassForm(new ClassForm<T>(type, tag, unit));
    }
    return null;
  }

  public <T> ClassForm<T> reflectClassForm(Class<?> type, String tag) {
    return reflectClassForm(type, tag, null);
  }

  public <T> ClassForm<T> reflectClassForm(Class<?> type) {
    final String tag = reflectClassTag(type);
    return reflectClassForm(type, tag, null);
  }

  @SuppressWarnings("unchecked")
  public <T> Form<T> reflectClass(Class<?> type) {
    if (!type.isInterface() && (type.getModifiers() & Modifier.ABSTRACT) == 0 && !Form.isBuiltin(type)) {
      final Field[] fields = type.getDeclaredFields();
      for (int i = 0, n = fields.length; i < n; i += 1) {
        final Field field = fields[i];
        final Kind kind = field.getAnnotation(Kind.class);
        if (kind != null) {
          if (!Form.class.isAssignableFrom(field.getType())) {
            throw new FormException(field.toString());
          }
          final int modifiers = field.getModifiers();
          if ((modifiers & Modifier.STATIC) == 0) {
            throw new FormException(field.toString());
          }
          field.setAccessible(true);
          try {
            Form<T> form = (Form<T>) field.get(null);
            if (form == null) {
              form = reflectClassForm(type);
              field.set(null, form);
            }
            return form;
          } catch (ReflectiveOperationException cause) {
            throw new FormException(cause);
          }
        }
      }

      final Method[] methods = type.getDeclaredMethods();
      for (int i = 0, n = methods.length; i < n; i += 1) {
        final Method method = methods[i];
        final Kind kind = method.getAnnotation(Kind.class);
        if (kind != null) {
          if (!Form.class.isAssignableFrom(method.getReturnType())) {
            throw new FormException(method.toString());
          }
          if (method.getParameterTypes().length != 0) {
            throw new FormException(method.toString());
          }
          final int modifiers = method.getModifiers();
          if ((modifiers & Modifier.STATIC) == 0) {
            throw new FormException(method.toString());
          }
          method.setAccessible(true);
          try {
            return (Form<T>) method.invoke(null);
          } catch (ReflectiveOperationException cause) {
            throw new FormException(cause);
          }
        }
      }

      return reflectClassForm(type);
    }
    return null;
  }

  public <T> Form<T> reflectClassName(String className) {
    try {
      return reflectClass(Class.forName(className));
    } catch (ClassNotFoundException cause) {
      throw new FormException(cause);
    }
  }

  public String reflectClassTag(Class<?> type) {
    final Tag tag = type.getAnnotation(Tag.class);
    if (tag != null) {
      return tag.value();
    } else {
      return type.getSimpleName();
    }
  }

  public <T> ClassForm<T> reflectField(ClassForm<T> classForm, Field field) {
    final int modifiers = field.getModifiers();
    if ((modifiers & (Modifier.STATIC | Modifier.TRANSIENT)) == 0) {
      if ((modifiers & (Modifier.FINAL | Modifier.PRIVATE | Modifier.PROTECTED)) != 0 || modifiers == 0) {
        field.setAccessible(true);
      }

      // Close over the generic type of the field.
      final Type fieldType = field.getGenericType();
      addType(fieldType);

      String name;
      final FieldForm<T> fieldForm;
      final Header header = field.getAnnotation(Header.class);
      if (header != null) {
        name = header.value();
        if (name == null || name.length() == 0) {
          name = field.getName();
        }
        fieldForm = new SlotForm<T>(field, Text.from(name), formForType(fieldType));
        return classForm.putHeader(fieldForm);
      } else {
        final Member member = field.getAnnotation(Member.class);
        name = member != null ? member.value() : null;
        if (name == null || name.length() == 0) {
          name = field.getName();
        }
        fieldForm = new SlotForm<T>(field, Text.from(name), formForType(fieldType));
        return classForm.putMember(fieldForm);
      }
    }
    return classForm;
  }

  public <T> ClassForm<T> reflectFields(ClassForm<T> classForm, Class<?> type) {
    if (type != null) {
      reflectFields(classForm, type.getSuperclass());
      final Field[] fields = type.getDeclaredFields();
      for (int i = 0, n = fields.length; i < n; i += 1) {
        reflectField(classForm, fields[i]);
      }
    }
    return classForm;
  }

  @Override
  public PolyForm clone() {
    return new PolyForm(this.unit, this.classForms, this.tagForms);
  }
}
