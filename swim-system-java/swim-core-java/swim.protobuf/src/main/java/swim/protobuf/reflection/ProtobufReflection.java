// Copyright 2015-2020 SWIM.AI inc.
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

package swim.protobuf.reflection;

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
import swim.protobuf.ProtobufException;
import swim.protobuf.ProtobufKind;
import swim.protobuf.ProtobufMember;
import swim.protobuf.schema.ProtobufDataType;
import swim.protobuf.schema.ProtobufFixed32Type;
import swim.protobuf.schema.ProtobufFixed64Type;
import swim.protobuf.schema.ProtobufMessageType;
import swim.protobuf.schema.ProtobufStringType;
import swim.protobuf.schema.ProtobufType;
import swim.protobuf.schema.ProtobufVarintType;
import swim.protobuf.schema.ProtobufZigZagType;
import swim.collections.FingerTrieSeq;

public final class ProtobufReflection {

  private ProtobufReflection() {
    // static
  }

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

  public static ProtobufVarintType<Boolean> booleanType() {
    if (booleanType == null) {
      booleanType = new BooleanReflection();
    }
    return booleanType;
  }

  public static ProtobufZigZagType<Byte> byteType() {
    if (byteType == null) {
      byteType = new ByteReflection();
    }
    return byteType;
  }

  public static ProtobufZigZagType<Short> shortType() {
    if (shortType == null) {
      shortType = new ShortReflection();
    }
    return shortType;
  }

  public static ProtobufZigZagType<Integer> intType() {
    if (intType == null) {
      intType = new IntReflection();
    }
    return intType;
  }

  public static ProtobufZigZagType<Long> longType() {
    if (longType == null) {
      longType = new LongReflection();
    }
    return longType;
  }

  public static ProtobufFixed32Type<Float> floatType() {
    if (floatType == null) {
      floatType = new FloatReflection();
    }
    return floatType;
  }

  public static ProtobufFixed64Type<Double> doubleType() {
    if (doubleType == null) {
      doubleType = new DoubleReflection();
    }
    return doubleType;
  }

  public static ProtobufVarintType<Character> charType() {
    if (charType == null) {
      charType = new CharReflection();
    }
    return charType;
  }

  public static ProtobufDataType<ByteBuffer> dataType() {
    if (dataType == null) {
      dataType = new DataReflection();
    }
    return dataType;
  }

  public static ProtobufStringType<String> stringType() {
    if (stringType == null) {
      stringType = new StringReflection();
    }
    return stringType;
  }

  @SuppressWarnings("unchecked")
  public static <T> ProtobufMessageType<T, T> messageType(Class<?> messageClass) {
    try {
      final Constructor<T> constructor = (Constructor<T>) messageClass.getConstructor();
      constructor.setAccessible(true);
      return new MessageReflection<T>(constructor);
    } catch (NoSuchMethodException cause) {
      throw new ProtobufException(cause);
    }
  }

  public static <T extends Enum<T>> ProtobufVarintType<T> enumType(Class<T> enumClass) {
    return EnumReflection.fromType(enumClass);
  }

  //@SuppressWarnings("unchecked")
  //public static <I, T> AvroArrayType<I, T> arrayType(Class<?> itemClass, ProtobufType<I> itemType) {
  //  return (AvroArrayType<I, T>) new ArrayReflection<I>(itemClass, itemType);
  //}

  //public static <I, T> AvroArrayType<I, T> arrayType(Class<?> itemClass) {
  //  return arrayType(itemClass, classType(itemClass));
  //}

  //@SuppressWarnings("unchecked")
  //public static <V, T extends Map<String, V>> AvroMapType<String, V, T> mapType(Class<?> mapClass, ProtobufType<V> valueType) {
  //  if (mapClass == Map.class) {
  //    mapClass = HashMap.class;
  //  } else if (mapClass == SortedMap.class) {
  //    mapClass = TreeMap.class;
  //  }
  //  try {
  //    final Constructor<Map<String, V>> constructor = (Constructor<Map<String, V>>) mapClass.getConstructor();
  //    constructor.setAccessible(true);
  //    return (AvroMapType<String, V, T>) new MapReflection<V>(constructor, valueType);
  //  } catch (NoSuchMethodException cause) {
  //    throw new ProtobufException(cause);
  //  }
  //}

  //public static <V> AvroMapType<String, V, Map<String, V>> mapType(ProtobufType<V> valueType) {
  //  return mapType(Map.class, valueType);
  //}

  //public static <T> AvroUnionType<T> unionType() {
  //  return UnionReflection.empty();
  //}

  //public static AvroFixedType<byte[]> fixedType(AvroName fullName, int size) {
  //  return new FixedReflection(fullName, size);
  //}

  //public static AvroFixedType<byte[]> fixedType(String fullName, int size) {
  //  return fixedType(AvroName.parse(fullName), size);
  //}

  //public static <R, V> AvroFieldType<R, V> field(Field field, ProtobufType<? extends V> valueType) {
  //  return new FieldReflection<R, V>(field, valueType);
  //}

  //static boolean isBuiltin(Class<?> type) {
  //  return type.isPrimitive() || type.isArray() || type == Object.class
  //      || String.class.isAssignableFrom(type)
  //      || Number.class.isAssignableFrom(type)
  //      || Character.class.isAssignableFrom(type)
  //      || Boolean.class.isAssignableFrom(type);
  //}

  //@SuppressWarnings("unchecked")
  //static <T> ProtobufType<T> builtinType(Class<?> type) {
  //  if (type == String.class) {
  //    return (ProtobufType<T>) stringType();
  //  } else if (type == Byte.class || type == Byte.TYPE) {
  //    return (ProtobufType<T>) byteType();
  //  } else if (type == Short.class || type == Short.TYPE) {
  //    return (ProtobufType<T>) shortType();
  //  } else if (type == Integer.class || type == Integer.TYPE) {
  //    return (ProtobufType<T>) intType();
  //  } else if (type == Long.class || type == Long.TYPE) {
  //    return (ProtobufType<T>) longType();
  //  } else if (type == Float.class || type == Float.TYPE) {
  //    return (ProtobufType<T>) floatType();
  //  } else if (type == Double.class || type == Double.TYPE) {
  //    return (ProtobufType<T>) doubleType();
  //  } else if (type == Character.class || type == Character.TYPE) {
  //    return (ProtobufType<T>) charType();
  //  } else if (type == Boolean.class || type == Boolean.TYPE) {
  //    return (ProtobufType<T>) booleanType();
  //  } else if (type == ByteBuffer.class) {
  //    return (ProtobufType<T>) dataType();
  //  } else {
  //    return null;
  //  }
  //}

  //public static <T> ProtobufType<T> classType(Class<?> type) {
  //  if (type.isArray()) {
  //    final Class<?> componentType = type.getComponentType();
  //    return arrayType(componentType, classType(componentType));
  //  } else {
  //    ProtobufType<T> classType = builtinType(type);
  //    if (classType != null) {
  //      return classType;
  //    }
  //    classType = reflectClass(type);
  //    if (classType != null) {
  //      return classType;
  //    }
  //    return null;
  //  }
  //}

  //@SuppressWarnings("unchecked")
  //static <T> ProtobufType<T> reflectClass(Class<?> type) {
  //  if (!type.isInterface() && (type.getModifiers() & Modifier.ABSTRACT) == 0 && !isBuiltin(type)) {
  //    final Field[] fields = type.getDeclaredFields();
  //    for (int i = 0, n = fields.length; i < n; i += 1) {
  //      final Field field = fields[i];
  //      final ProtobufKind kind = field.getAnnotation(ProtobufKind.class);
  //      if (kind != null) {
  //        if (!ProtobufType.class.isAssignableFrom(field.getType())) {
  //          throw new ProtobufException(field.toString());
  //        }
  //        final int modifiers = field.getModifiers();
  //        if ((modifiers & Modifier.STATIC) == 0) {
  //          throw new ProtobufException(field.toString());
  //        }
  //        field.setAccessible(true);
  //        try {
  //          ProtobufType<T> classType = (ProtobufType<T>) field.get(null);
  //          if (classType == null) {
  //            classType = reflectClassType(type);
  //            field.set(null, classType);
  //          }
  //          return classType;
  //        } catch (ReflectiveOperationException cause) {
  //          throw new ProtobufException(cause);
  //        }
  //      }
  //    }

  //    final Method[] methods = type.getDeclaredMethods();
  //    for (int i = 0, n = methods.length; i < n; i += 1) {
  //      final Method method = methods[i];
  //      final ProtobufKind kind = method.getAnnotation(ProtobufKind.class);
  //      if (kind != null) {
  //        if (!ProtobufType.class.isAssignableFrom(method.getReturnType())) {
  //          throw new ProtobufException(method.toString());
  //        }
  //        if (method.getParameterTypes().length != 0) {
  //          throw new ProtobufException(method.toString());
  //        }
  //        final int modifiers = method.getModifiers();
  //        if ((modifiers & Modifier.STATIC) == 0) {
  //          throw new ProtobufException(method.toString());
  //        }
  //        method.setAccessible(true);
  //        try {
  //          return (ProtobufType<T>) method.invoke(null);
  //        } catch (ReflectiveOperationException cause) {
  //          throw new ProtobufException(cause);
  //        }
  //      }
  //    }

  //    return reflectClassType(type);
  //  }
  //  return null;
  //}

  //static <T> ProtobufMessageType<T, T> reflectClassType(Class<?> type) {
  //  if (!type.isInterface() && (type.getModifiers() & Modifier.ABSTRACT) == 0 && !isBuiltin(type)) {
  //    final AvroName fullName = AvroName.parse(type.getName().replace("$", "_"));
  //    ProtobufMessageType<T, T> messageType = messageType(fullName, type);
  //    messageType = reflectFields(messageType, type);
  //    return messageType;
  //  }
  //  return null;
  //}

  //@SuppressWarnings("unchecked")
  //static <T> ProtobufType<T> reflectGenericType(Type genericType) {
  //  if (genericType instanceof GenericArrayType) {
  //    Type componentType = ((GenericArrayType) genericType).getGenericComponentType();
  //    if (componentType instanceof TypeVariable) {
  //      componentType = ((TypeVariable) componentType).getBounds()[0];
  //    }
  //    if (componentType instanceof Class<?>) {
  //      return (ProtobufType<T>) arrayType((Class<?>) componentType);
  //    }
  //  }
  //  if (genericType instanceof ParameterizedType) {
  //    genericType = ((ParameterizedType) genericType).getRawType();
  //  }
  //  if (genericType instanceof Class<?>) {
  //    final Class<Object> type = (Class<Object>) genericType;
  //    if (type.isArray()) {
  //      return (ProtobufType<T>) arrayType(type.getComponentType());
  //    } else {
  //      return classType(type);
  //    }
  //  }
  //  return null;
  //}

  //static <T> ProtobufMessageType<T, T> reflectFields(ProtobufMessageType<T, T> messageType, Class<?> messageClass) {
  //  if (messageClass != null) {
  //    messageType = reflectFields(messageType, messageClass.getSuperclass());
  //    final Field[] fields = messageClass.getDeclaredFields();
  //    for (int i = 0, n = fields.length; i < n; i += 1) {
  //      messageType = reflectField(messageType, fields[i]);
  //    }
  //  }
  //  return messageType;
  //}

  //static <T> ProtobufMessageType<T, T> reflectField(ProtobufMessageType<T, T> messageType, Field field) {
  //  final int modifiers = field.getModifiers();
  //  if ((modifiers & (Modifier.STATIC | Modifier.TRANSIENT)) == 0) {
  //    if ((modifiers & (Modifier.FINAL | Modifier.PRIVATE | Modifier.PROTECTED)) != 0 || modifiers == 0) {
  //      field.setAccessible(true);
  //    }

  //    String name;
  //    final ProtobufMember member = field.getAnnotation(ProtobufMember.class);
  //    name = member != null ? member.value() : null;
  //    if (name == null || name.length() == 0) {
  //      name = field.getName();
  //    }
  //    messageType = messageType.field(field(field, reflectGenericType(field.getGenericType())));
  //  }
  //  return messageType;
  //}

}
