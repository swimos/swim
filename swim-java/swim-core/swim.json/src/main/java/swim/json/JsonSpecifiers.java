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

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.json.decl.JsonClassFormat;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JsonSpecifiers implements JsonProvider, ToSource {

  final JsonMetaCodec metaCodec;
  final int priority;

  private JsonSpecifiers(JsonMetaCodec metaCodec, int priority) {
    this.metaCodec = metaCodec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable JsonFormat<?> resolveJsonFormat(Type type) throws JsonProviderException {
    final Class<?> classType;
    final Type[] typeArguments;
    if (type instanceof Class<?>) {
      classType = (Class<?>) type;
      typeArguments = null;
    } else if (type instanceof ParameterizedType) {
      final ParameterizedType parameterizedType = (ParameterizedType) type;
      final Type rawType = parameterizedType.getRawType();
      if (rawType instanceof Class<?>) {
        classType = (Class<?>) rawType;
        typeArguments = parameterizedType.getActualTypeArguments();
      } else {
        return null;
      }
    } else {
      return null;
    }

    return JsonSpecifiers.specifierFormat(this.metaCodec, classType, typeArguments);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonSpecifiers", "provider")
            .appendArgument(this.metaCodec);
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static JsonSpecifiers provider(JsonMetaCodec metaCodec, int priority) {
    return new JsonSpecifiers(metaCodec, priority);
  }

  public static JsonSpecifiers provider(JsonMetaCodec metaCodec) {
    return new JsonSpecifiers(metaCodec, GENERIC_PRIORITY);
  }

  public static @Nullable JsonFormat<?> specifierFormat(JsonMetaCodec metaCodec, Class<?> classType,
                                                        Type @Nullable... typeArguments) throws JsonProviderException {
    // Search all methods declared on classType for @JsonClassFormat annotations;
    // ignore inherited methods to prevent inadvertent @JsonClassFormat inheritance.
    final Method[] methods = classType.getDeclaredMethods();
    for (int i = 0, n = methods.length; i < n; i += 1) {
      final Method method = methods[i];

      // Check for @JsonClassFormat annotation.
      final JsonClassFormat annotation = method.getAnnotation(JsonClassFormat.class);
      if (annotation == null) {
        continue;
      }

      if ((method.getModifiers() & Modifier.STATIC) == 0) {
        throw new JsonProviderException("non-static @JsonClassFormat method " + method);
      }
      if (!JsonFormat.class.isAssignableFrom(method.getReturnType())) {
        throw new JsonProviderException("return type of @JsonClassFormat method " + method
                                      + " must be assignable to " + JsonFormat.class.getName());
      }

      final Class<?>[] parameterTypes = method.getParameterTypes();
      if (typeArguments != null && 1 + typeArguments.length == parameterTypes.length
          && parameterTypes[0].isAssignableFrom(JsonMetaCodec.class)) {
        // static JsonFormat<T> <method>(JsonMetaCodec metaCodec, Type arg0, ..., Type argN);
        final Object[] arguments = new Object[1 + typeArguments.length];
        arguments[0] = metaCodec;
        System.arraycopy(typeArguments, 0, arguments, 1, typeArguments.length);
        try {
          return (JsonFormat<?>) method.invoke(null, arguments);
        } catch (IllegalAccessException cause) {
          throw new JsonProviderException("inaccessible @JsonClassFormat method " + method, cause);
        } catch (InvocationTargetException error) {
          throw new JsonProviderException("exception in @JsonClassFormat method " + method, error.getCause());
        }
      } else if (parameterTypes.length == 1 && parameterTypes[0].isAssignableFrom(JsonMetaCodec.class)) {
        // static JsonFormat<T> <method>(JsonMetaCodec metaCodec);
        try {
          return (JsonFormat<?>) method.invoke(null, metaCodec);
        } catch (IllegalAccessException cause) {
          throw new JsonProviderException("inaccessible @JsonClassFormat method " + method, cause);
        } catch (InvocationTargetException error) {
          throw new JsonProviderException("exception in @JsonClassFormat method " + method, error.getCause());
        }
      } else if (parameterTypes.length == 0) {
        // static JsonFormat<T> <method>();
        try {
          return (JsonFormat<?>) method.invoke(null);
        } catch (IllegalAccessException cause) {
          throw new JsonProviderException("inaccessible @JsonClassFormat method " + method, cause);
        } catch (InvocationTargetException error) {
          throw new JsonProviderException("exception in @JsonClassFormat method " + method, error.getCause());
        }
      }
      throw new JsonProviderException("invalid @JsonClassFormat method " + method);
    }

    // No @JsonClassFormat method found.
    return null;
  }

}
