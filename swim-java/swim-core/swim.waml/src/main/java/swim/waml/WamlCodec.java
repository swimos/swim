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

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.lang.reflect.WildcardType;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.ServiceLoader;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.CodecType;
import swim.codec.Format;
import swim.codec.Input;
import swim.codec.MediaType;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.collections.FingerTrieList;
import swim.collections.HashTrieMap;
import swim.expr.Term;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
@CodecType("application/x-waml")
public class WamlCodec implements WamlForm<Object>, Format, ToSource {

  WamlProvider[] providers;

  HashTrieMap<Type, WamlForm<?>> mappings;

  public WamlCodec() {
    this.providers = new WamlProvider[0];
    this.mappings = HashTrieMap.empty();
    this.loadIntrinsics();
    this.loadExtensions();
  }

  public final FingerTrieList<WamlProvider> providers() {
    return FingerTrieList.of(this.providers);
  }

  @SuppressWarnings("ReferenceEquality")
  public void addProvider(WamlProvider provider) {
    WamlProvider[] providers = (WamlProvider[]) PROVIDERS.getOpaque(this);
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
      final WamlProvider[] oldProviders = providers;
      final WamlProvider[] newProviders = new WamlProvider[oldProviders.length + 1];
      System.arraycopy(oldProviders, 0, newProviders, 0, index);
      newProviders[index] = provider;
      System.arraycopy(oldProviders, index, newProviders, index + 1, oldProviders.length - index);
      providers = (WamlProvider[]) PROVIDERS.compareAndExchangeRelease(this, oldProviders, newProviders);
      if (providers == oldProviders) {
        break;
      }
    } while (true);
  }

  protected void loadIntrinsics() {
    // Builtin providers
    this.addProvider(WamlJava.provider(this));
    this.addProvider(WamlReprs.provider());
    this.addProvider(WamlTerms.provider());

    // Generic providers
    this.addProvider(WamlDeclarations.provider(this));
    this.addProvider(WamlConversions.provider());
    this.addProvider(WamlUnions.provider(this));
    this.addProvider(WamlEnums.provider());
    this.addProvider(WamlThrowables.provider());
    this.addProvider(WamlCollections.provider(this));
    this.addProvider(WamlReflections.provider(this));
  }

  protected void loadExtensions() {
    final ServiceLoader<WamlProvider> serviceLoader = ServiceLoader.load(WamlProvider.class, WamlCodec.class.getClassLoader());
    final Iterator<ServiceLoader.Provider<WamlProvider>> serviceProviders = serviceLoader.stream().iterator();
    while (serviceProviders.hasNext()) {
      final ServiceLoader.Provider<WamlProvider> serviceProvider = serviceProviders.next();
      final Class<? extends WamlProvider> providerClass = serviceProvider.type();
      WamlProvider provider = null;

      // public static WamlProvider provider(WamlCodec codec);
      try {
        final Method method = providerClass.getDeclaredMethod("provider", WamlCodec.class);
        if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
            && WamlProvider.class.isAssignableFrom(method.getReturnType())) {
          provider = (WamlProvider) method.invoke(null, this);
        }
      } catch (ReflectiveOperationException cause) {
        // swallow
      }

      if (provider == null) {
        // public static WamlProvider provider();
        try {
          final Method method = providerClass.getDeclaredMethod("provider");
          if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
              && WamlProvider.class.isAssignableFrom(method.getReturnType())) {
            provider = (WamlProvider) method.invoke(null);
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
  public void registerWamlForm(Type javaType, WamlForm<?> wamlForm) {
    HashTrieMap<Type, WamlForm<?>> mappings = (HashTrieMap<Type, WamlForm<?>>) MAPPINGS.getOpaque(this);
    do {
      final HashTrieMap<Type, WamlForm<?>> oldMappings = mappings;
      final HashTrieMap<Type, WamlForm<?>> newMappings = oldMappings.updated(javaType, wamlForm);
      mappings = (HashTrieMap<Type, WamlForm<?>>) MAPPINGS.compareAndExchangeRelease(this, oldMappings, newMappings);
      if (mappings == oldMappings) {
        break;
      }
    } while (true);
  }

  protected @Nullable WamlForm<?> resolveWamlForm(Type javaType) {
    if (javaType == Object.class) {
      return this;
    }

    final WamlProvider[] providers = (WamlProvider[]) PROVIDERS.getOpaque(this);
    for (int i = 0; i < providers.length; i += 1) {
      final WamlProvider provider = providers[i];
      final WamlForm<?> wamlForm = provider.resolveWamlForm(javaType);
      if (wamlForm != null) {
        return wamlForm;
      }
    }

    return null;
  }

  @SuppressWarnings("ReferenceEquality")
  public <T> @Nullable WamlForm<T> forType(Type javaType) {
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

    HashTrieMap<Type, WamlForm<?>> mappings = (HashTrieMap<Type, WamlForm<?>>) MAPPINGS.getOpaque(this);
    WamlForm<T> newWamlForm = null;
    do {
      final WamlForm<T> oldWamlForm = Assume.conformsNullable(mappings.get(javaType));
      if (oldWamlForm != null) {
        return oldWamlForm;
      } else {
        if (newWamlForm == null) {
          newWamlForm = Assume.conformsNullable(this.resolveWamlForm(javaType));
          if (newWamlForm == null) {
            return null;
          }
        }
        final HashTrieMap<Type, WamlForm<?>> oldMappings = mappings;
        final HashTrieMap<Type, WamlForm<?>> newMappings = oldMappings.updated(javaType, newWamlForm);
        mappings = (HashTrieMap<Type, WamlForm<?>>) MAPPINGS.compareAndExchangeRelease(this, oldMappings, newMappings);
        if (mappings == oldMappings) {
          return newWamlForm;
        }
      }
    } while (true);
  }

  public <T> @Nullable WamlForm<T> forValue(@Nullable T value) {
    if (value == null) {
      return Assume.conforms(WamlJava.nullForm());
    } else {
      return this.forType(value.getClass());
    }
  }

  @Override
  public @Nullable WamlAttrForm<?, ? extends Object> getAttrForm(String name) {
    if ("blob".equals(name)) {
      return WamlJava.blobAttrForm();
    } else {
      return WamlForm.super.getAttrForm(name);
    }
  }

  @Override
  public WamlUndefinedForm<Void> undefinedForm() {
    return WamlJava.voidForm();
  }

  @Override
  public WamlUnitForm<Object> unitForm() {
    return WamlJava.nullForm();
  }

  @Override
  public WamlNumberForm<Number> numberForm() {
    return WamlJava.numberForm();
  }

  @Override
  public WamlIdentifierForm<Object> identifierForm() {
    return WamlJava.identifierForm();
  }

  @Override
  public WamlStringForm<?, String> stringForm() {
    return WamlJava.stringForm();
  }

  @Override
  public @Nullable WamlArrayForm<?, ?, List<Object>> arrayForm() {
    final WamlForm<List<Object>> listForm = this.forType(List.class);
    if (listForm instanceof WamlArrayForm<?, ?, ?>) {
      return (WamlArrayForm<?, ?, List<Object>>) listForm;
    } else {
      return null;
    }
  }

  @Override
  public WamlMarkupForm<?, ?, List<Object>> markupForm() {
    return WamlJava.markupForm(this);
  }

  @Override
  public @Nullable WamlObjectForm<?, ?, ?, Map<Object, Object>> objectForm() {
    final WamlForm<Map<Object, Object>> mapForm = this.forType(Map.class);
    if (mapForm instanceof WamlObjectForm<?, ?, ?, ?>) {
      return (WamlObjectForm<?, ?, ?, Map<Object, Object>>) mapForm;
    } else {
      return null;
    }
  }

  @Override
  public WamlTupleForm<?, ?, ?, Object> tupleForm() {
    return WamlJava.tupleForm(this);
  }

  @Override
  public MediaType mediaType() {
    return APPLICATION_X_WAML;
  }

  @Override
  public <T> @Nullable WamlForm<T> getTranslator(Type javaType) {
    return this.forType(javaType);
  }

  @Override
  public Parse<Object> parse(Input input, WamlParser parser) {
    return parser.parseExpr(input, this);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object value, WamlWriter writer) {
    if (value == null) {
      return WamlJava.nullForm().write(output, value, writer);
    } else {
      final WamlForm<Object> valueForm = this.forValue(value);
      if (valueForm != null) {
        return valueForm.write(output, value, writer);
      } else {
        return Write.error(new WriteException("Unsupported value: " + value));
      }
    }
  }

  @Override
  public Write<?> writeBlock(Output<?> output, @Nullable Object value, WamlWriter writer) {
    if (value == null) {
      return WamlJava.nullForm().writeBlock(output, value, writer);
    } else {
      final WamlForm<Object> valueForm = this.forValue(value);
      if (valueForm != null) {
        return valueForm.writeBlock(output, value, writer);
      } else {
        return Write.error(new WriteException("Unsupported value: " + value));
      }
    }
  }

  @Override
  public Term intoTerm(@Nullable Object value) {
    if (value instanceof Term) {
      return (Term) value;
    } else {
      final WamlForm<Object> wamlForm = this.forValue(value);
      if (wamlForm != null) {
        return wamlForm.intoTerm(value);
      } else {
        return Term.from(value);
      }
    }
  }

  @Override
  public @Nullable Object fromTerm(Term term) {
    if (term.isValidObject()) {
      return term.objectValue();
    } else {
      return term;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Waml", "codec").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static WamlCodec provider() {
    return Waml.codec();
  }

  static final MediaType APPLICATION_X_WAML = MediaType.of("application", "x-waml");

  /**
   * {@code VarHandle} for atomically accessing the {@link #providers} field.
   */
  static final VarHandle PROVIDERS;

  /**
   * {@code VarHandle} for atomically accessing the {@link #mappings} field.
   */
  static final VarHandle MAPPINGS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      PROVIDERS = lookup.findVarHandle(WamlCodec.class, "providers", WamlProvider.class.arrayType());
      MAPPINGS = lookup.findVarHandle(WamlCodec.class, "mappings", HashTrieMap.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
