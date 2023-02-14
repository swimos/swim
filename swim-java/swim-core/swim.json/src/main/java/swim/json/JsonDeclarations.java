// Copyright 2015-2022 Swim.inc
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

package swim.json;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JsonDeclarations implements JsonProvider, ToSource {

  final JsonCodec codec;
  final int priority;

  private JsonDeclarations(JsonCodec codec, int priority) {
    this.codec = codec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable JsonForm<?> resolveJsonForm(Type javaType) {
    final Class<?> javaClass;
    final Type[] typeArguments;
    if (javaType instanceof Class<?>) {
      javaClass = (Class<?>) javaType;
      typeArguments = null;
    } else if (javaType instanceof ParameterizedType) {
      final ParameterizedType parameterizedType = (ParameterizedType) javaType;
      final Type rawType = parameterizedType.getRawType();
      if (rawType instanceof Class<?>) {
        javaClass = (Class<?>) rawType;
        typeArguments = parameterizedType.getActualTypeArguments();
      } else {
        return null;
      }
    } else {
      return null;
    }

    return JsonDeclarations.declarationForm(this.codec, javaClass, typeArguments);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonDeclarations", "provider");
    notation.appendArgument(this.codec);
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static JsonDeclarations provider(JsonCodec codec, int priority) {
    return new JsonDeclarations(codec, priority);
  }

  public static JsonDeclarations provider(JsonCodec codec) {
    return new JsonDeclarations(codec, GENERIC_PRIORITY);
  }

  public static @Nullable JsonForm<?> declarationForm(JsonCodec codec, Class<?> javaClass, Type @Nullable... typeArguments) {
    if (typeArguments != null && typeArguments.length != 0) {
      // public static JsonForm<?> jsonForm(JsonCodec codec, JsonForm<?> arg0, ..., JsonForm<?> argN);
      try {
        final Class<?>[] parameterTypes = new Class<?>[1 + typeArguments.length];
        parameterTypes[0] = JsonCodec.class;
        for (int i = 0; i < typeArguments.length; i += 1) {
          parameterTypes[1 + i] = JsonForm.class;
        }
        final Method method = javaClass.getDeclaredMethod("jsonForm", parameterTypes);
        if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
            && JsonForm.class.isAssignableFrom(method.getReturnType())) {
          final Object[] arguments = new Object[1 + typeArguments.length];
          arguments[0] = codec;
          for (int i = 0; i < typeArguments.length; i += 1) {
            arguments[1 + i] = codec.forType(typeArguments[i]);
          }
          return (JsonForm<?>) method.invoke(null, arguments);
        }
      } catch (ReflectiveOperationException cause) {
        // ignore
      }

      // public static JsonForm<?> jsonForm(JsonForm<?> arg0, ..., JsonForm<?> argN);
      try {
        final Class<?>[] parameterTypes = new Class<?>[typeArguments.length];
        for (int i = 0; i < typeArguments.length; i += 1) {
          parameterTypes[i] = JsonForm.class;
        }
        final Method method = javaClass.getDeclaredMethod("jsonForm", parameterTypes);
        if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
            && JsonForm.class.isAssignableFrom(method.getReturnType())) {
          final Object[] arguments = new Object[typeArguments.length];
          for (int i = 0; i < typeArguments.length; i += 1) {
            arguments[i] = codec.forType(typeArguments[i]);
          }
          return (JsonForm<?>) method.invoke(null, arguments);
        }
      } catch (ReflectiveOperationException cause) {
        // ignore
      }
    }

    // public static JsonForm<?> jsonForm(JsonCodec codec);
    try {
      final Method method = javaClass.getDeclaredMethod("jsonForm", JsonCodec.class);
      if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && JsonForm.class.isAssignableFrom(method.getReturnType())) {
        return (JsonForm<?>) method.invoke(null, codec);
      }
    } catch (ReflectiveOperationException cause) {
      // ignore
    }

    // public static JsonForm<?> jsonForm();
    try {
      final Method method = javaClass.getDeclaredMethod("jsonForm");
      if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && JsonForm.class.isAssignableFrom(method.getReturnType())) {
        return (JsonForm<?>) method.invoke(null);
      }
    } catch (ReflectiveOperationException cause) {
      // ignore
    }

    return null;
  }

}
