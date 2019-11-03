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

package swim.avro.reflection;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.GenericArrayType;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import swim.avro.AvroException;
import swim.avro.AvroKind;
import swim.avro.AvroMember;
import swim.avro.AvroName;
import swim.avro.schema.AvroArrayType;
import swim.avro.schema.AvroBooleanType;
import swim.avro.schema.AvroDataType;
import swim.avro.schema.AvroDoubleType;
import swim.avro.schema.AvroEnumType;
import swim.avro.schema.AvroFieldType;
import swim.avro.schema.AvroFixedType;
import swim.avro.schema.AvroFloatType;
import swim.avro.schema.AvroIntType;
import swim.avro.schema.AvroLongType;
import swim.avro.schema.AvroMapType;
import swim.avro.schema.AvroNullType;
import swim.avro.schema.AvroRecordType;
import swim.avro.schema.AvroStringType;
import swim.avro.schema.AvroType;
import swim.avro.schema.AvroUnionType;
import swim.avro.schema.AvroVarintType;
import swim.collections.FingerTrieSeq;

public final class AvroReflection {
  private AvroReflection() {
    // static
  }

  private static NullReflection<?> nullType;
  private static BooleanReflection booleanType;
  private static ByteReflection byteType;
  private static ShortReflection shortType;
  private static IntReflection intType;
  private static LongReflection longType;
  private static FloatReflection floatType;
  private static DoubleReflection doubleType;
  private static CharReflection charType;
  private static DataReflection dataType;
  private static StringReflection stringType;

  @SuppressWarnings("unchecked")
  public static <T> AvroNullType<T> nullType() {
    if (nullType == null) {
      nullType = new NullReflection<Object>();
    }
    return (AvroNullType<T>) nullType;
  }

  public static AvroBooleanType<Boolean> booleanType() {
    if (booleanType == null) {
      booleanType = new BooleanReflection();
    }
    return booleanType;
  }

  public static AvroVarintType<Byte> byteType() {
    if (byteType == null) {
      byteType = new ByteReflection();
    }
    return byteType;
  }

  public static AvroVarintType<Short> shortType() {
    if (shortType == null) {
      shortType = new ShortReflection();
    }
    return shortType;
  }

  public static AvroIntType<Integer> intType() {
    if (intType == null) {
      intType = new IntReflection();
    }
    return intType;
  }

  public static AvroLongType<Long> longType() {
    if (longType == null) {
      longType = new LongReflection();
    }
    return longType;
  }

  public static AvroFloatType<Float> floatType() {
    if (floatType == null) {
      floatType = new FloatReflection();
    }
    return floatType;
  }

  public static AvroDoubleType<Double> doubleType() {
    if (doubleType == null) {
      doubleType = new DoubleReflection();
    }
    return doubleType;
  }

  public static AvroVarintType<Character> charType() {
    if (charType == null) {
      charType = new CharReflection();
    }
    return charType;
  }

  public static AvroDataType<ByteBuffer> dataType() {
    if (dataType == null) {
      dataType = new DataReflection();
    }
    return dataType;
  }

  public static AvroStringType<String> stringType() {
    if (stringType == null) {
      stringType = new StringReflection();
    }
    return stringType;
  }

  @SuppressWarnings("unchecked")
  public static <T> AvroRecordType<T, T> recordType(AvroName fullName, Class<?> recordClass) {
    try {
      final Constructor<T> constructor = (Constructor<T>) recordClass.getConstructor();
      constructor.setAccessible(true);
      return new RecordReflection<T>(fullName, constructor);
    } catch (NoSuchMethodException cause) {
      throw new AvroException(cause);
    }
  }

  public static <T> AvroRecordType<T, T> recordType(String fullName, Class<?> recordClass) {
    return recordType(AvroName.parse(fullName), recordClass);
  }

  public static <T extends Enum<T>> AvroEnumType<T> enumType(AvroName fullName, Class<T> enumClass) {
    return new EnumReflection<T>(fullName, FingerTrieSeq.of(enumClass.getEnumConstants()));
  }

  public static <T extends Enum<T>> AvroEnumType<T> enumType(String fullName, Class<T> enumClass) {
    return enumType(AvroName.parse(fullName), enumClass);
  }

  public static <T extends Enum<T>> AvroEnumType<T> enumType(Class<T> enumClass) {
    final AvroName fullName = AvroName.parse(enumClass.getName().replace("$", "_"));
    return enumType(fullName, enumClass);
  }

  @SuppressWarnings("unchecked")
  public static <I, T> AvroArrayType<I, T> arrayType(Class<?> itemClass, AvroType<I> itemType) {
    return (AvroArrayType<I, T>) new ArrayReflection<I>(itemClass, itemType);
  }

  public static <I, T> AvroArrayType<I, T> arrayType(Class<?> itemClass) {
    return arrayType(itemClass, classType(itemClass));
  }

  @SuppressWarnings("unchecked")
  public static <V, T extends Map<String, V>> AvroMapType<String, V, T> mapType(Class<?> mapClass, AvroType<V> valueType) {
    if (mapClass == Map.class) {
      mapClass = HashMap.class;
    } else if (mapClass == SortedMap.class) {
      mapClass = TreeMap.class;
    }
    try {
      final Constructor<Map<String, V>> constructor = (Constructor<Map<String, V>>) mapClass.getConstructor();
      constructor.setAccessible(true);
      return (AvroMapType<String, V, T>) new MapReflection<V>(constructor, valueType);
    } catch (NoSuchMethodException cause) {
      throw new AvroException(cause);
    }
  }

  public static <V> AvroMapType<String, V, Map<String, V>> mapType(AvroType<V> valueType) {
    return mapType(Map.class, valueType);
  }

  public static <T> AvroUnionType<T> unionType() {
    return UnionReflection.empty();
  }

  public static AvroFixedType<byte[]> fixedType(AvroName fullName, int size) {
    return new FixedReflection(fullName, size);
  }

  public static AvroFixedType<byte[]> fixedType(String fullName, int size) {
    return fixedType(AvroName.parse(fullName), size);
  }

  public static <R, V> AvroFieldType<R, V> field(Field field, AvroType<? extends V> valueType) {
    return new FieldReflection<R, V>(field, valueType);
  }

  static boolean isBuiltin(Class<?> type) {
    return type.isPrimitive() || type.isArray() || type == Object.class
        || String.class.isAssignableFrom(type)
        || Number.class.isAssignableFrom(type)
        || Character.class.isAssignableFrom(type)
        || Boolean.class.isAssignableFrom(type);
  }

  @SuppressWarnings("unchecked")
  static <T> AvroType<T> builtinType(Class<?> type) {
    if (type == String.class) {
      return (AvroType<T>) stringType();
    } else if (type == Byte.class || type == Byte.TYPE) {
      return (AvroType<T>) byteType();
    } else if (type == Short.class || type == Short.TYPE) {
      return (AvroType<T>) shortType();
    } else if (type == Integer.class || type == Integer.TYPE) {
      return (AvroType<T>) intType();
    } else if (type == Long.class || type == Long.TYPE) {
      return (AvroType<T>) longType();
    } else if (type == Float.class || type == Float.TYPE) {
      return (AvroType<T>) floatType();
    } else if (type == Double.class || type == Double.TYPE) {
      return (AvroType<T>) doubleType();
    } else if (type == Character.class || type == Character.TYPE) {
      return (AvroType<T>) charType();
    } else if (type == Boolean.class || type == Boolean.TYPE) {
      return (AvroType<T>) booleanType();
    } else if (type == ByteBuffer.class) {
      return (AvroType<T>) dataType();
    } else {
      return null;
    }
  }

  public static <T> AvroType<T> classType(Class<?> type) {
    if (type.isArray()) {
      final Class<?> componentType = type.getComponentType();
      return arrayType(componentType, classType(componentType));
    } else {
      AvroType<T> classType = builtinType(type);
      if (classType != null) {
        return classType;
      }
      classType = reflectClass(type);
      if (classType != null) {
        return classType;
      }
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  static <T> AvroType<T> reflectClass(Class<?> type) {
    if (!type.isInterface() && (type.getModifiers() & Modifier.ABSTRACT) == 0 && !isBuiltin(type)) {
      final Field[] fields = type.getDeclaredFields();
      for (int i = 0, n = fields.length; i < n; i += 1) {
        final Field field = fields[i];
        final AvroKind kind = field.getAnnotation(AvroKind.class);
        if (kind != null) {
          if (!AvroType.class.isAssignableFrom(field.getType())) {
            throw new AvroException(field.toString());
          }
          final int modifiers = field.getModifiers();
          if ((modifiers & Modifier.STATIC) == 0) {
            throw new AvroException(field.toString());
          }
          field.setAccessible(true);
          try {
            AvroType<T> classType = (AvroType<T>) field.get(null);
            if (classType == null) {
              classType = reflectClassType(type);
              field.set(null, classType);
            }
            return classType;
          } catch (ReflectiveOperationException cause) {
            throw new AvroException(cause);
          }
        }
      }

      final Method[] methods = type.getDeclaredMethods();
      for (int i = 0, n = methods.length; i < n; i += 1) {
        final Method method = methods[i];
        final AvroKind kind = method.getAnnotation(AvroKind.class);
        if (kind != null) {
          if (!AvroType.class.isAssignableFrom(method.getReturnType())) {
            throw new AvroException(method.toString());
          }
          if (method.getParameterTypes().length != 0) {
            throw new AvroException(method.toString());
          }
          final int modifiers = method.getModifiers();
          if ((modifiers & Modifier.STATIC) == 0) {
            throw new AvroException(method.toString());
          }
          method.setAccessible(true);
          try {
            return (AvroType<T>) method.invoke(null);
          } catch (ReflectiveOperationException cause) {
            throw new AvroException(cause);
          }
        }
      }

      return reflectClassType(type);
    }
    return null;
  }

  static <T> AvroRecordType<T, T> reflectClassType(Class<?> type) {
    if (!type.isInterface() && (type.getModifiers() & Modifier.ABSTRACT) == 0 && !isBuiltin(type)) {
      final AvroName fullName = AvroName.parse(type.getName().replace("$", "_"));
      AvroRecordType<T, T> recordType = recordType(fullName, type);
      recordType = reflectFields(recordType, type);
      return recordType;
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  static <T> AvroType<T> reflectGenericType(Type genericType) {
    if (genericType instanceof GenericArrayType) {
      Type componentType = ((GenericArrayType) genericType).getGenericComponentType();
      if (componentType instanceof TypeVariable) {
        componentType = ((TypeVariable) componentType).getBounds()[0];
      }
      if (componentType instanceof Class<?>) {
        return (AvroType<T>) arrayType((Class<?>) componentType);
      }
    }
    if (genericType instanceof ParameterizedType) {
      genericType = ((ParameterizedType) genericType).getRawType();
    }
    if (genericType instanceof Class<?>) {
      final Class<Object> type = (Class<Object>) genericType;
      if (type.isArray()) {
        return (AvroType<T>) arrayType(type.getComponentType());
      } else {
        return classType(type);
      }
    }
    return null;
  }

  static <T> AvroRecordType<T, T> reflectFields(AvroRecordType<T, T> recordType, Class<?> recordClass) {
    if (recordClass != null) {
      recordType = reflectFields(recordType, recordClass.getSuperclass());
      final Field[] fields = recordClass.getDeclaredFields();
      for (int i = 0, n = fields.length; i < n; i += 1) {
        recordType = reflectField(recordType, fields[i]);
      }
    }
    return recordType;
  }

  static <T> AvroRecordType<T, T> reflectField(AvroRecordType<T, T> recordType, Field field) {
    final int modifiers = field.getModifiers();
    if ((modifiers & (Modifier.STATIC | Modifier.TRANSIENT)) == 0) {
      if ((modifiers & (Modifier.FINAL | Modifier.PRIVATE | Modifier.PROTECTED)) != 0 || modifiers == 0) {
        field.setAccessible(true);
      }

      String name;
      final AvroMember member = field.getAnnotation(AvroMember.class);
      name = member != null ? member.value() : null;
      if (name == null || name.length() == 0) {
        name = field.getName();
      }
      recordType = recordType.field(field(field, reflectGenericType(field.getGenericType())));
    }
    return recordType;
  }
}
