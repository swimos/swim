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

package swim.repr;

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.lang.reflect.WildcardType;
import java.util.Iterator;
import java.util.ServiceLoader;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.FingerTrieList;
import swim.collections.HashTrieMap;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public class ReprRegistry implements ReprForm<Object>, ToSource {

  ReprProvider[] providers;

  HashTrieMap<Type, ReprForm<?>> mappings;

  public ReprRegistry() {
    this.providers = new ReprProvider[0];
    this.mappings = HashTrieMap.empty();
    this.loadIntrinsics();
    this.loadExtensions();
  }

  public final FingerTrieList<ReprProvider> providers() {
    return FingerTrieList.of(this.providers);
  }

  @SuppressWarnings("ReferenceEquality")
  public void addProvider(ReprProvider provider) {
    ReprProvider[] providers = (ReprProvider[]) PROVIDERS.getOpaque(this);
    do {
      int index = providers.length - 1;
      while (index >= 0) {
        if (provider.priority() < providers[index].priority()) {
          index -= 1;
        } else {
          index += 1;
          break;
        }
      }
      if (index < 0) {
        index = 0;
      }
      final ReprProvider[] oldProviders = providers;
      final ReprProvider[] newProviders = new ReprProvider[oldProviders.length + 1];
      System.arraycopy(oldProviders, 0, newProviders, 0, index);
      newProviders[index] = provider;
      System.arraycopy(oldProviders, index, newProviders, index + 1, oldProviders.length - index);
      providers = (ReprProvider[]) PROVIDERS.compareAndExchangeRelease(this, oldProviders, newProviders);
      if (providers == oldProviders) {
        break;
      }
    } while (true);
  }

  protected void loadIntrinsics() {
    // Builtin providers
    this.addProvider(JavaReprs.provider());
  }

  protected void loadExtensions() {
    final ServiceLoader<ReprProvider> serviceLoader = ServiceLoader.load(ReprProvider.class, ReprRegistry.class.getClassLoader());
    final Iterator<ServiceLoader.Provider<ReprProvider>> serviceProviders = serviceLoader.stream().iterator();
    while (serviceProviders.hasNext()) {
      final ServiceLoader.Provider<ReprProvider> serviceProvider = serviceProviders.next();
      final Class<? extends ReprProvider> providerClass = serviceProvider.type();
      ReprProvider provider = null;

      // public static ReprProvider provider(ReprRegistry registry);
      try {
        final Method method = providerClass.getDeclaredMethod("provider", ReprRegistry.class);
        if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
            && ReprProvider.class.isAssignableFrom(method.getReturnType())) {
          provider = (ReprProvider) method.invoke(null, this);
        }
      } catch (ReflectiveOperationException cause) {
        // swallow
      }

      if (provider == null) {
        // public static ReprProvider provider();
        try {
          final Method method = providerClass.getDeclaredMethod("provider");
          if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
              && ReprProvider.class.isAssignableFrom(method.getReturnType())) {
            provider = (ReprProvider) method.invoke(null);
          }
        } catch (ReflectiveOperationException cause) {
          // swallow
        }
      }

      if (provider == null) {
        provider = serviceProvider.get();
      }
      this.addProvider(provider);
    }
  }

  @SuppressWarnings("ReferenceEquality")
  public void registerReprForm(Type javaType, ReprForm<?> reprForm) {
    HashTrieMap<Type, ReprForm<?>> mappings = (HashTrieMap<Type, ReprForm<?>>) MAPPINGS.getOpaque(this);
    do {
      final HashTrieMap<Type, ReprForm<?>> oldMappings = mappings;
      final HashTrieMap<Type, ReprForm<?>> newMappings = oldMappings.updated(javaType, reprForm);
      mappings = (HashTrieMap<Type, ReprForm<?>>) MAPPINGS.compareAndExchangeRelease(this, oldMappings, newMappings);
      if (mappings == oldMappings) {
        break;
      }
    } while (true);
  }

  protected @Nullable ReprForm<?> resolveReprForm(Type javaType) {
    if (javaType == Object.class) {
      return this;
    }

    final ReprProvider[] providers = (ReprProvider[]) PROVIDERS.getOpaque(this);
    for (int i = 0; i < providers.length; i += 1) {
      final ReprProvider provider = providers[i];
      final ReprForm<?> reprForm = provider.resolveReprForm(javaType);
      if (reprForm != null) {
        return reprForm;
      }
    }

    return null;
  }

  @SuppressWarnings("ReferenceEquality")
  public <T> @Nullable ReprForm<T> forType(Type javaType) {
    if (javaType instanceof WildcardType) {
      final Type[] upperBounds = ((WildcardType) javaType).getUpperBounds();
      if (upperBounds != null && upperBounds.length != 0) {
        javaType = upperBounds[0];
      } else {
        javaType = Object.class;
      }
    }
    if (javaType instanceof TypeVariable) {
      final Type[] bounds = ((TypeVariable) javaType).getBounds();
      if (bounds != null && bounds.length != 0) {
        javaType = bounds[0];
      } else {
        javaType = Object.class;
      }
    }

    HashTrieMap<Type, ReprForm<?>> mappings = (HashTrieMap<Type, ReprForm<?>>) MAPPINGS.getOpaque(this);
    ReprForm<T> newReprForm = null;
    do {
      final ReprForm<T> oldReprForm = Assume.conformsNullable(mappings.get(javaType));
      if (oldReprForm != null) {
        return oldReprForm;
      } else {
        if (newReprForm == null) {
          newReprForm = Assume.conformsNullable(this.resolveReprForm(javaType));
          if (newReprForm == null) {
            return null;
          }
        }
        final HashTrieMap<Type, ReprForm<?>> oldMappings = mappings;
        final HashTrieMap<Type, ReprForm<?>> newMappings = oldMappings.updated(javaType, newReprForm);
        mappings = (HashTrieMap<Type, ReprForm<?>>) MAPPINGS.compareAndExchangeRelease(this, oldMappings, newMappings);
        if (mappings == oldMappings) {
          return newReprForm;
        }
      }
    } while (true);
  }

  public <T> @Nullable ReprForm<T> forValue(@Nullable T value) {
    if (value == null) {
      return Assume.conforms(JavaReprs.nullForm());
    } else {
      return this.forType(value.getClass());
    }
  }

  @Override
  public Repr intoRepr(@Nullable Object value) {
    final ReprForm<Object> reprForm = this.forValue(value);
    if (reprForm != null) {
      return reprForm.intoRepr(value);
    } else {
      throw new IllegalArgumentException("No repr form for value: " + value);
    }
  }

  @Override
  public @Nullable Object fromRepr(Repr repr) {
    if (repr.isValidObject()) {
      return repr.objectValue();
    } else {
      return repr;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Repr", "registry").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #providers} field.
   */
  static final VarHandle PROVIDERS;

  /**
   * {@code VarHandle} for atomically accessing the {@link #mappings} field.
   */
  static final VarHandle MAPPINGS;

  static final ReprRegistry REGISTRY;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      PROVIDERS = lookup.findVarHandle(ReprRegistry.class, "providers", ReprProvider.class.arrayType());
      MAPPINGS = lookup.findVarHandle(ReprRegistry.class, "mappings", HashTrieMap.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
    REGISTRY = new ReprRegistry();
  }

}
