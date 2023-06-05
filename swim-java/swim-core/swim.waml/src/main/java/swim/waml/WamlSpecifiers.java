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

package swim.waml;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Notation;
import swim.util.ToSource;
import swim.waml.decl.WamlClassFormat;

@Public
@Since("5.0")
public final class WamlSpecifiers implements WamlProvider, ToSource {

  final WamlMetaCodec metaCodec;
  final int priority;

  private WamlSpecifiers(WamlMetaCodec metaCodec, int priority) {
    this.metaCodec = metaCodec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable WamlFormat<?> resolveWamlFormat(Type type) throws WamlProviderException {
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

    return WamlSpecifiers.specifierFormat(this.metaCodec, classType, typeArguments);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlSpecifiers", "provider")
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

  public static WamlSpecifiers provider(WamlMetaCodec metaCodec, int priority) {
    return new WamlSpecifiers(metaCodec, priority);
  }

  public static WamlSpecifiers provider(WamlMetaCodec metaCodec) {
    return new WamlSpecifiers(metaCodec, GENERIC_PRIORITY);
  }

  public static @Nullable WamlFormat<?> specifierFormat(WamlMetaCodec metaCodec, Class<?> classType,
                                                           Type @Nullable... typeArguments) throws WamlProviderException {
    // Search all methods declared on classType for @WamlClassFormat annotations;
    // ignore inherited methods to prevent inadvertent @WamlClassFormat inheritance.
    final Method[] methods = classType.getDeclaredMethods();
    for (int i = 0, n = methods.length; i < n; i += 1) {
      final Method method = methods[i];

      // Check for @WamlClassFormat annotation.
      final WamlClassFormat annotation = method.getAnnotation(WamlClassFormat.class);
      if (annotation == null) {
        continue;
      }

      if ((method.getModifiers() & Modifier.STATIC) == 0) {
        throw new WamlProviderException("non-static @WamlClassFormat method " + method);
      }
      if (!WamlFormat.class.isAssignableFrom(method.getReturnType())) {
        throw new WamlProviderException("return type of @WamlClassFormat method " + method
                                      + " must be assignable to " + WamlFormat.class.getName());
      }

      final Class<?>[] parameterTypes = method.getParameterTypes();
      if (typeArguments != null && 1 + typeArguments.length == parameterTypes.length
          && parameterTypes[0].isAssignableFrom(WamlMetaCodec.class)) {
        // static WamlFormat<T> <method>(WamlMetaCodec metaCodec, Type arg0, ..., Type argN);
        final Object[] arguments = new Object[1 + typeArguments.length];
        arguments[0] = metaCodec;
        System.arraycopy(typeArguments, 0, arguments, 1, typeArguments.length);
        try {
          return (WamlFormat<?>) method.invoke(null, arguments);
        } catch (IllegalAccessException cause) {
          throw new WamlProviderException("inaccessible @WamlClassFormat method " + method, cause);
        } catch (InvocationTargetException error) {
          throw new WamlProviderException("exception in @WamlClassFormat method " + method, error.getCause());
        }
      } else if (parameterTypes.length == 1 && parameterTypes[0].isAssignableFrom(WamlMetaCodec.class)) {
        // static WamlFormat<T> <method>(WamlMetaCodec metaCodec);
        try {
          return (WamlFormat<?>) method.invoke(null, metaCodec);
        } catch (IllegalAccessException cause) {
          throw new WamlProviderException("inaccessible @WamlClassFormat method " + method, cause);
        } catch (InvocationTargetException error) {
          throw new WamlProviderException("exception in @WamlClassFormat method " + method, error.getCause());
        }
      } else if (parameterTypes.length == 0) {
        // static WamlFormat<T> <method>();
        try {
          return (WamlFormat<?>) method.invoke(null);
        } catch (IllegalAccessException cause) {
          throw new WamlProviderException("inaccessible @WamlClassFormat method " + method, cause);
        } catch (InvocationTargetException error) {
          throw new WamlProviderException("exception in @WamlClassFormat method " + method, error.getCause());
        }
      }
      throw new WamlProviderException("invalid @WamlClassFormat method " + method);
    }

    // No @WamlClassFormat method found.
    return null;
  }

}
