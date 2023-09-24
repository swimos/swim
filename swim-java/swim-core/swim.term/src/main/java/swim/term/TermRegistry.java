// Copyright 2015-2023 Nstream, inc.
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

package swim.term;

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
import swim.util.WriteSource;

@Public
@Since("5.0")
public class TermRegistry implements TermForm<Object>, WriteSource {

  TermProvider[] providers;

  HashTrieMap<Type, TermForm<?>> termForms;

  public TermRegistry() {
    this.providers = new TermProvider[0];
    this.termForms = HashTrieMap.empty();
    this.loadIntrinsics();
    this.loadExtensions();
  }

  public final FingerTrieList<TermProvider> providers() {
    return FingerTrieList.of(this.providers);
  }

  @SuppressWarnings("ReferenceEquality")
  public void addProvider(TermProvider provider) {
    TermProvider[] providers = (TermProvider[]) PROVIDERS.getOpaque(this);
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
      final TermProvider[] oldProviders = providers;
      final TermProvider[] newProviders = new TermProvider[oldProviders.length + 1];
      System.arraycopy(oldProviders, 0, newProviders, 0, index);
      newProviders[index] = provider;
      System.arraycopy(oldProviders, index, newProviders, index + 1, oldProviders.length - index);
      providers = (TermProvider[]) PROVIDERS.compareAndExchangeRelease(this, oldProviders, newProviders);
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
    this.addProvider(LangTerms.provider());

    // Generic providers
    this.addProvider(ReflectionTerms.provider(this));
  }

  protected void loadExtensions() {
    final ServiceLoader<TermProvider> serviceLoader = ServiceLoader.load(TermProvider.class, TermRegistry.class.getClassLoader());
    final Iterator<ServiceLoader.Provider<TermProvider>> serviceProviders = serviceLoader.stream().iterator();
    while (serviceProviders.hasNext()) {
      this.loadExtension(serviceProviders.next());
    }
  }

  void loadExtension(ServiceLoader.Provider<TermProvider> serviceProvider) {
    final Class<? extends TermProvider> providerClass = serviceProvider.type();
    TermProvider provider = null;

    // public static TermProvider provider(TermRegistry registry);
    try {
      final Method method = providerClass.getDeclaredMethod("provider", TermRegistry.class);
      if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && TermProvider.class.isAssignableFrom(method.getReturnType())) {
        provider = (TermProvider) method.invoke(null, this);
      }
    } catch (ReflectiveOperationException cause) {
      // ignore
    }

    if (provider == null) {
      // public static TermProvider provider();
      try {
        final Method method = providerClass.getDeclaredMethod("provider");
        if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
            && TermProvider.class.isAssignableFrom(method.getReturnType())) {
          provider = (TermProvider) method.invoke(null);
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
  public void registerTermForm(Type type, TermForm<?> termForm) {
    HashTrieMap<Type, TermForm<?>> termForms = (HashTrieMap<Type, TermForm<?>>) TERM_FORMS.getOpaque(this);
    do {
      final HashTrieMap<Type, TermForm<?>> oldTermForms = termForms;
      final HashTrieMap<Type, TermForm<?>> newTermForms = oldTermForms.updated(type, termForm);
      termForms = (HashTrieMap<Type, TermForm<?>>) TERM_FORMS.compareAndExchangeRelease(this, oldTermForms, newTermForms);
      if (termForms != oldTermForms) {
        // CAS failed; try again.
        continue;
      }
      termForms = newTermForms;
      break;
    } while (true);
  }

  protected TermForm<?> resolveTermForm(Type type) throws TermProviderException {
    if (type == Object.class) {
      return this;
    }

    final TermProvider[] providers = (TermProvider[]) PROVIDERS.getOpaque(this);
    for (int i = 0; i < providers.length; i += 1) {
      final TermProvider provider = providers[i];
      final TermForm<?> termForm = provider.resolveTermForm(type);
      if (termForm != null) {
        return termForm;
      }
    }

    throw new TermProviderException("no term form for " + type);
  }

  @SuppressWarnings("ReferenceEquality")
  public <T> TermForm<T> getTermForm(Type type) throws TermProviderException {
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

    HashTrieMap<Type, TermForm<?>> termForms = (HashTrieMap<Type, TermForm<?>>) TERM_FORMS.getOpaque(this);
    TermForm<T> newTermForm = null;
    do {
      final TermForm<T> oldTermForm = Assume.conformsNullable(termForms.get(type));
      if (oldTermForm != null) {
        return oldTermForm;
      } else if (newTermForm == null) {
        newTermForm = Assume.conforms(this.resolveTermForm(type));
      }
      final HashTrieMap<Type, TermForm<?>> oldTermForms = termForms;
      final HashTrieMap<Type, TermForm<?>> newTermForms = oldTermForms.updated(type, newTermForm);
      termForms = (HashTrieMap<Type, TermForm<?>>) TERM_FORMS.compareAndExchangeRelease(this, oldTermForms, newTermForms);
      if (termForms != oldTermForms) {
        // CAS failed; try again.
        continue;
      }
      termForms = newTermForms;
      return newTermForm;
    } while (true);
  }

  public <T> TermForm<T> getTermForm(@Nullable T value) throws TermProviderException {
    if (value == null) {
      return Assume.conforms(LangTerms.nullForm());
    }
    return this.getTermForm(value.getClass());
  }

  @Override
  public Term intoTerm(@Nullable Object value) throws TermException {
    if (value instanceof Term) {
      return (Term) value;
    }
    return this.getTermForm(value).intoTerm(value);
  }

  @Override
  public @Nullable Object fromTerm(Term term) throws TermException {
    if (term.isValidObject()) {
      return term.objectValue();
    }
    return term;
  }

  @Override
  public @Nullable Object initializer() throws TermException {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Term", "registry").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #providers} field.
   */
  static final VarHandle PROVIDERS;

  /**
   * {@code VarHandle} for atomically accessing the {@link #termForms} field.
   */
  static final VarHandle TERM_FORMS;

  static final TermRegistry REGISTRY;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      PROVIDERS = lookup.findVarHandle(TermRegistry.class, "providers", TermProvider.class.arrayType());
      TERM_FORMS = lookup.findVarHandle(TermRegistry.class, "termForms", HashTrieMap.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
    REGISTRY = new TermRegistry();
  }

}
