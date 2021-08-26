// Copyright 2015-2021 Swim Inc.
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
import swim.protobuf.schema.ProtobufFieldType;
import swim.protobuf.schema.ProtobufFixed32Type;
import swim.protobuf.schema.ProtobufFixed64Type;
import swim.protobuf.schema.ProtobufMapEntryType;
import swim.protobuf.schema.ProtobufMapType;
import swim.protobuf.schema.ProtobufMessageType;
import swim.protobuf.schema.ProtobufRepeatedType;
import swim.protobuf.schema.ProtobufStringType;
import swim.protobuf.schema.ProtobufType;
import swim.protobuf.schema.ProtobufVarintType;
import swim.protobuf.schema.ProtobufZigZagType;

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
    if (ProtobufReflection.booleanType == null) {
      ProtobufReflection.booleanType = new BooleanReflection();
    }
    return ProtobufReflection.booleanType;
  }

  public static ProtobufZigZagType<Byte> byteType() {
    if (ProtobufReflection.byteType == null) {
      ProtobufReflection.byteType = new ByteReflection();
    }
    return ProtobufReflection.byteType;
  }

  public static ProtobufZigZagType<Short> shortType() {
    if (ProtobufReflection.shortType == null) {
      ProtobufReflection.shortType = new ShortReflection();
    }
    return ProtobufReflection.shortType;
  }

  public static ProtobufZigZagType<Integer> intType() {
    if (ProtobufReflection.intType == null) {
      ProtobufReflection.intType = new IntReflection();
    }
    return ProtobufReflection.intType;
  }

  public static ProtobufZigZagType<Long> longType() {
    if (ProtobufReflection.longType == null) {
      ProtobufReflection.longType = new LongReflection();
    }
    return ProtobufReflection.longType;
  }

  public static ProtobufFixed32Type<Float> floatType() {
    if (ProtobufReflection.floatType == null) {
      ProtobufReflection.floatType = new FloatReflection();
    }
    return ProtobufReflection.floatType;
  }

  public static ProtobufFixed64Type<Double> doubleType() {
    if (ProtobufReflection.doubleType == null) {
      ProtobufReflection.doubleType = new DoubleReflection();
    }
    return ProtobufReflection.doubleType;
  }

  public static ProtobufVarintType<Character> charType() {
    if (ProtobufReflection.charType == null) {
      ProtobufReflection.charType = new CharReflection();
    }
    return ProtobufReflection.charType;
  }

  public static ProtobufDataType<ByteBuffer> dataType() {
    if (ProtobufReflection.dataType == null) {
      ProtobufReflection.dataType = new DataReflection();
    }
    return ProtobufReflection.dataType;
  }

  public static ProtobufStringType<String> stringType() {
    if (ProtobufReflection.stringType == null) {
      ProtobufReflection.stringType = new StringReflection();
    }
    return ProtobufReflection.stringType;
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

  @SuppressWarnings("unchecked")
  public static <I, T> ProtobufRepeatedType<I, T> arrayType(Class<?> itemClass, ProtobufType<I> itemType) {
    return (ProtobufRepeatedType<I, T>) new ArrayReflection<I>(itemClass, itemType);
  }

  public static <I, T> ProtobufRepeatedType<I, T> arrayType(Class<?> itemClass) {
    return ProtobufReflection.arrayType(itemClass, ProtobufReflection.classType(itemClass));
  }

  public static <K, V> ProtobufMapEntryType<K, V, Map.Entry<K, V>> mapEntryType(ProtobufType<? extends K> keyType, ProtobufType<? extends V> valueType) {
    return MapEntryReflection.create(keyType, valueType);
  }

  @SuppressWarnings("unchecked")
  public static <K, V, M extends Map<K, V>> ProtobufMapType<K, V, Map.Entry<K, V>, M> mapType(Class<?> mapClass, ProtobufMapEntryType<? extends K, ? extends V, ? extends Map.Entry<K, V>> entryType) {
    if (mapClass == Map.class) {
      mapClass = HashMap.class;
    } else if (mapClass == SortedMap.class) {
      mapClass = TreeMap.class;
    }
    try {
      final Constructor<Map<K, V>> constructor = (Constructor<Map<K, V>>) mapClass.getConstructor();
      constructor.setAccessible(true);
      return (ProtobufMapType<K, V, Map.Entry<K, V>, M>) (ProtobufMapType<K, V, Map.Entry<K, V>, ?>) new MapReflection<K, V>(constructor, entryType);
    } catch (NoSuchMethodException cause) {
      throw new ProtobufException(cause);
    }
  }

  public static <K, V> ProtobufMapType<K, V, Map.Entry<K, V>, Map<K, V>> mapType(ProtobufMapEntryType<? extends K, ? extends V, ? extends Map.Entry<K, V>> entryType) {
    return ProtobufReflection.mapType(Map.class, entryType);
  }

  public static <K, V> ProtobufMapType<K, V, Map.Entry<K, V>, Map<K, V>> mapType(ProtobufType<? extends K> keyType, ProtobufType<? extends V> valueType) {
    final ProtobufMapEntryType<K, V, Map.Entry<K, V>> entryType = MapEntryReflection.create(keyType, valueType);
    return ProtobufReflection.mapType(Map.class, entryType);
  }

  @SuppressWarnings("unchecked")
  public static <V, M> ProtobufFieldType<V, M> field(Field field, long fieldNumber, ProtobufType<? extends V> valueType) {
    if (valueType instanceof ProtobufRepeatedType<?, ?>) {
      return new RepeatedFieldReflection<V, M>(field, fieldNumber, (ProtobufRepeatedType<V, ?>) valueType);
    } else {
      return new FieldReflection<V, M>(field, fieldNumber, valueType);
    }
  }

  public static <V, M> ProtobufFieldType<V, M> repeatedField(Field field, long fieldNumber, ProtobufRepeatedType<V, ?> repeatedType) {
    return new RepeatedFieldReflection<V, M>(field, fieldNumber, repeatedType);
  }

  static boolean isBuiltin(Class<?> type) {
    return type.isPrimitive() || type.isArray() || type == Object.class
        || String.class.isAssignableFrom(type)
        || Number.class.isAssignableFrom(type)
        || Character.class.isAssignableFrom(type)
        || Boolean.class.isAssignableFrom(type);
  }

  @SuppressWarnings("unchecked")
  static <T> ProtobufType<T> builtinType(Class<?> type) {
    if (type == String.class) {
      return (ProtobufType<T>) ProtobufReflection.stringType();
    } else if (type == Byte.class || type == Byte.TYPE) {
      return (ProtobufType<T>) ProtobufReflection.byteType();
    } else if (type == Short.class || type == Short.TYPE) {
      return (ProtobufType<T>) ProtobufReflection.shortType();
    } else if (type == Integer.class || type == Integer.TYPE) {
      return (ProtobufType<T>) ProtobufReflection.intType();
    } else if (type == Long.class || type == Long.TYPE) {
      return (ProtobufType<T>) ProtobufReflection.longType();
    } else if (type == Float.class || type == Float.TYPE) {
      return (ProtobufType<T>) ProtobufReflection.floatType();
    } else if (type == Double.class || type == Double.TYPE) {
      return (ProtobufType<T>) ProtobufReflection.doubleType();
    } else if (type == Character.class || type == Character.TYPE) {
      return (ProtobufType<T>) ProtobufReflection.charType();
    } else if (type == Boolean.class || type == Boolean.TYPE) {
      return (ProtobufType<T>) ProtobufReflection.booleanType();
    } else if (type == ByteBuffer.class) {
      return (ProtobufType<T>) ProtobufReflection.dataType();
    } else {
      return null;
    }
  }

  public static <T> ProtobufType<T> classType(Class<?> type) {
    if (type.isArray()) {
      final Class<?> componentType = type.getComponentType();
      return arrayType(componentType, classType(componentType));
    } else {
      ProtobufType<T> classType = builtinType(type);
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
  static <T> ProtobufType<T> reflectClass(Class<?> type) {
    if (!type.isInterface() && (type.getModifiers() & Modifier.ABSTRACT) == 0 && !isBuiltin(type)) {
      final Field[] fields = type.getDeclaredFields();
      for (int i = 0, n = fields.length; i < n; i += 1) {
        final Field field = fields[i];
        final ProtobufKind kindAnnotation = field.getAnnotation(ProtobufKind.class);
        if (kindAnnotation != null) {
          if (!ProtobufType.class.isAssignableFrom(field.getType())) {
            throw new ProtobufException(field.toString());
          }
          final int modifiers = field.getModifiers();
          if ((modifiers & Modifier.STATIC) == 0) {
            throw new ProtobufException(field.toString());
          }
          field.setAccessible(true);
          try {
            ProtobufType<T> classType = (ProtobufType<T>) field.get(null);
            if (classType == null) {
              classType = reflectClassType(type);
              field.set(null, classType);
            }
            return classType;
          } catch (ReflectiveOperationException cause) {
            throw new ProtobufException(cause);
          }
        }
      }

      final Method[] methods = type.getDeclaredMethods();
      for (int i = 0, n = methods.length; i < n; i += 1) {
        final Method method = methods[i];
        final ProtobufKind kindAnnotation = method.getAnnotation(ProtobufKind.class);
        if (kindAnnotation != null) {
          if (!ProtobufType.class.isAssignableFrom(method.getReturnType())) {
            throw new ProtobufException(method.toString());
          }
          if (method.getParameterTypes().length != 0) {
            throw new ProtobufException(method.toString());
          }
          final int modifiers = method.getModifiers();
          if ((modifiers & Modifier.STATIC) == 0) {
            throw new ProtobufException(method.toString());
          }
          method.setAccessible(true);
          try {
            return (ProtobufType<T>) method.invoke(null);
          } catch (ReflectiveOperationException cause) {
            throw new ProtobufException(cause);
          }
        }
      }

      return reflectClassType(type);
    }
    return null;
  }

  static <T> ProtobufMessageType<T, T> reflectClassType(Class<?> type) {
    if (!type.isInterface() && (type.getModifiers() & Modifier.ABSTRACT) == 0 && !isBuiltin(type)) {
      ProtobufMessageType<T, T> messageType = messageType(type);
      messageType = reflectFields(messageType, type);
      return messageType;
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  static <T> ProtobufType<T> reflectGenericType(Type genericType) {
    if (genericType instanceof GenericArrayType) {
      Type componentType = ((GenericArrayType) genericType).getGenericComponentType();
      if (componentType instanceof TypeVariable) {
        componentType = ((TypeVariable) componentType).getBounds()[0];
      }
      if (componentType instanceof Class<?>) {
        return (ProtobufType<T>) arrayType((Class<?>) componentType);
      }
    }
    final Type[] typeArguments;
    if (genericType instanceof ParameterizedType) {
      final ParameterizedType parameterizedType = (ParameterizedType) genericType;
      genericType = parameterizedType.getRawType();
      typeArguments = parameterizedType.getActualTypeArguments();
    } else {
      typeArguments = null;
    }
    if (genericType instanceof Class<?>) {
      final Class<Object> type = (Class<Object>) genericType;
      if (type.isArray()) {
        return (ProtobufType<T>) arrayType(type.getComponentType());
      } else if (type.isAssignableFrom(Map.class) && typeArguments != null && typeArguments.length == 2) {
        final ProtobufType<?> keyType = reflectGenericType(typeArguments[0]);
        final ProtobufType<?> valueType = reflectGenericType(typeArguments[1]);
        return (ProtobufType<T>) mapType(type, mapEntryType(keyType, valueType));
      } else {
        return classType(type);
      }
    }
    return null;
  }

  static <T> ProtobufMessageType<T, T> reflectFields(ProtobufMessageType<T, T> messageType, Class<?> messageClass) {
    if (messageClass != null) {
      messageType = reflectFields(messageType, messageClass.getSuperclass());
      final Field[] fields = messageClass.getDeclaredFields();
      for (int i = 0, n = fields.length; i < n; i += 1) {
        messageType = reflectField(messageType, fields[i]);
      }
    }
    return messageType;
  }

  static <T> ProtobufMessageType<T, T> reflectField(ProtobufMessageType<T, T> messageType, Field field) {
    final int modifiers = field.getModifiers();
    if ((modifiers & (Modifier.STATIC | Modifier.TRANSIENT)) == 0) {
      final ProtobufMember memberAnnotation = field.getAnnotation(ProtobufMember.class);
      if (memberAnnotation != null) {
        if ((modifiers & (Modifier.FINAL | Modifier.PRIVATE | Modifier.PROTECTED)) != 0 || modifiers == 0) {
          field.setAccessible(true);
        }
        final long fieldNumber = memberAnnotation.value();
        final ProtobufType<?> valueType = reflectGenericType(field.getGenericType());
        if (valueType != null) {
          messageType = messageType.field(field(field, fieldNumber, valueType));
        }
      }
    }
    return messageType;
  }

}
