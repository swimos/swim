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

  HashTrieMap<Type, ReprForm<?>> reprForms;

  public ReprRegistry() {
    this.providers = new ReprProvider[0];
    this.reprForms = HashTrieMap.empty();
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
        if (provider.priority() > providers[index].priority()) {
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
      if (providers != oldProviders) {
        // CAS failed; try again.
        continue;
      }
      providers = newProviders;
      break;
    } while (true);
  }

  protected void loadIntrinsics() {
    // Builtin providers
    this.addProvider(LangReprs.provider());
  }

  protected void loadExtensions() {
    final ServiceLoader<ReprProvider> serviceLoader = ServiceLoader.load(ReprProvider.class, ReprRegistry.class.getClassLoader());
    final Iterator<ServiceLoader.Provider<ReprProvider>> serviceProviders = serviceLoader.stream().iterator();
    while (serviceProviders.hasNext()) {
      this.loadExtension(serviceProviders.next());
    }
  }

  void loadExtension(ServiceLoader.Provider<ReprProvider> serviceProvider) {
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
      // ignore
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
        // ignore
      }
    }

    if (provider == null) {
      provider = serviceProvider.get();
    }
    this.addProvider(provider);
  }

  @SuppressWarnings("ReferenceEquality")
  public void registerReprForm(Type type, ReprForm<?> reprForm) {
    HashTrieMap<Type, ReprForm<?>> reprForms = (HashTrieMap<Type, ReprForm<?>>) REPR_FORMS.getOpaque(this);
    do {
      final HashTrieMap<Type, ReprForm<?>> oldReprForms = reprForms;
      final HashTrieMap<Type, ReprForm<?>> newReprForms = oldReprForms.updated(type, reprForm);
      reprForms = (HashTrieMap<Type, ReprForm<?>>) REPR_FORMS.compareAndExchangeRelease(this, oldReprForms, newReprForms);
      if (reprForms != oldReprForms) {
        // CAS failed; try again.
        continue;
      }
      reprForms = newReprForms;
      break;
    } while (true);
  }

  protected ReprForm<?> resolveReprForm(Type type) throws ReprProviderException {
    if (type == Object.class) {
      return this;
    }

    final ReprProvider[] providers = (ReprProvider[]) PROVIDERS.getOpaque(this);
    for (int i = 0; i < providers.length; i += 1) {
      final ReprProvider provider = providers[i];
      final ReprForm<?> reprForm = provider.resolveReprForm(type);
      if (reprForm != null) {
        return reprForm;
      }
    }

    throw new ReprProviderException("no repr form for " + type);
  }

  @SuppressWarnings("ReferenceEquality")
  public <T> ReprForm<T> getReprForm(Type type) throws ReprProviderException {
    if (type instanceof WildcardType) {
      final Type[] upperBounds = ((WildcardType) type).getUpperBounds();
      if (upperBounds != null && upperBounds.length != 0) {
        type = upperBounds[0];
      } else {
        type = Object.class;
      }
    }
    if (type instanceof TypeVariable) {
      final Type[] bounds = ((TypeVariable) type).getBounds();
      if (bounds != null && bounds.length != 0) {
        type = bounds[0];
      } else {
        type = Object.class;
      }
    }

    HashTrieMap<Type, ReprForm<?>> reprForms = (HashTrieMap<Type, ReprForm<?>>) REPR_FORMS.getOpaque(this);
    ReprForm<T> newReprForm = null;
    do {
      final ReprForm<T> oldReprForm = Assume.conformsNullable(reprForms.get(type));
      if (oldReprForm != null) {
        return oldReprForm;
      } else if (newReprForm == null) {
        newReprForm = Assume.conforms(this.resolveReprForm(type));
      }
      final HashTrieMap<Type, ReprForm<?>> oldReprForms = reprForms;
      final HashTrieMap<Type, ReprForm<?>> newReprForms = oldReprForms.updated(type, newReprForm);
      reprForms = (HashTrieMap<Type, ReprForm<?>>) REPR_FORMS.compareAndExchangeRelease(this, oldReprForms, newReprForms);
      if (reprForms != oldReprForms) {
        // CAS failed; try again.
        continue;
      }
      reprForms = newReprForms;
      return newReprForm;
    } while (true);
  }

  public <T> ReprForm<T> getReprForm(@Nullable T value) throws ReprProviderException {
    if (value == null) {
      return Assume.conforms(LangReprs.nullForm());
    }
    return this.getReprForm(value.getClass());
  }

  @Override
  public Repr intoRepr(@Nullable Object value) throws ReprException {
    if (value instanceof Repr) {
      return (Repr) value;
    }
    return this.getReprForm(value).intoRepr(value);
  }

  @Override
  public @Nullable Object fromRepr(Repr repr) throws ReprException {
    if (repr.isValidObject()) {
      return repr.objectValue();
    }
    return repr;
  }

  @Override
  public @Nullable Object initializer() throws ReprException {
    return null;
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
   * {@code VarHandle} for atomically accessing the {@link #reprForms} field.
   */
  static final VarHandle REPR_FORMS;

  static final ReprRegistry REGISTRY;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      PROVIDERS = lookup.findVarHandle(ReprRegistry.class, "providers", ReprProvider.class.arrayType());
      REPR_FORMS = lookup.findVarHandle(ReprRegistry.class, "reprForms", HashTrieMap.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
    REGISTRY = new ReprRegistry();
  }

}
