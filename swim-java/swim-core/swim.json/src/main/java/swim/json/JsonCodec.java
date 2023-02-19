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
@CodecType({"application/json", "text/json"})
public class JsonCodec implements JsonForm<Object>, Format, ToSource {

  JsonProvider[] providers;

  HashTrieMap<Type, JsonForm<?>> mappings;

  public JsonCodec() {
    this.providers = new JsonProvider[0];
    this.mappings = HashTrieMap.empty();
    this.loadIntrinsics();
    this.loadExtensions();
  }

  public final FingerTrieList<JsonProvider> providers() {
    return FingerTrieList.of(this.providers);
  }

  @SuppressWarnings("ReferenceEquality")
  public void addProvider(JsonProvider provider) {
    JsonProvider[] providers = (JsonProvider[]) PROVIDERS.getOpaque(this);
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
      final JsonProvider[] oldProviders = providers;
      final JsonProvider[] newProviders = new JsonProvider[oldProviders.length + 1];
      System.arraycopy(oldProviders, 0, newProviders, 0, index);
      newProviders[index] = provider;
      System.arraycopy(oldProviders, index, newProviders, index + 1, oldProviders.length - index);
      providers = (JsonProvider[]) PROVIDERS.compareAndExchangeRelease(this, oldProviders, newProviders);
      if (providers == oldProviders) {
        break;
      }
    } while (true);
  }

  protected void loadIntrinsics() {
    // Builtin providers
    this.addProvider(JsonJava.provider(this));
    this.addProvider(JsonReprs.provider());
    this.addProvider(JsonTerms.provider());

    // Generic providers
    this.addProvider(JsonDeclarations.provider(this));
    this.addProvider(JsonConversions.provider());
    this.addProvider(JsonUnions.provider(this));
    this.addProvider(JsonEnums.provider());
    this.addProvider(JsonThrowables.provider());
    this.addProvider(JsonCollections.provider(this));
    this.addProvider(JsonReflections.provider(this));
  }

  protected void loadExtensions() {
    final ServiceLoader<JsonProvider> serviceLoader = ServiceLoader.load(JsonProvider.class, JsonCodec.class.getClassLoader());
    final Iterator<ServiceLoader.Provider<JsonProvider>> serviceProviders = serviceLoader.stream().iterator();
    while (serviceProviders.hasNext()) {
      final ServiceLoader.Provider<JsonProvider> serviceProvider = serviceProviders.next();
      final Class<? extends JsonProvider> providerClass = serviceProvider.type();
      JsonProvider provider = null;

      // public static JsonProvider provider(JsonCodec codec);
      try {
        final Method method = providerClass.getDeclaredMethod("provider", JsonCodec.class);
        if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
            && JsonProvider.class.isAssignableFrom(method.getReturnType())) {
          provider = (JsonProvider) method.invoke(null, this);
        }
      } catch (ReflectiveOperationException cause) {
        // swallow
      }

      if (provider == null) {
        // public static JsonProvider provider();
        try {
          final Method method = providerClass.getDeclaredMethod("provider");
          if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
              && JsonProvider.class.isAssignableFrom(method.getReturnType())) {
            provider = (JsonProvider) method.invoke(null);
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
  public void registerJsonForm(Type javaType, JsonForm<?> jsonForm) {
    HashTrieMap<Type, JsonForm<?>> mappings = (HashTrieMap<Type, JsonForm<?>>) MAPPINGS.getOpaque(this);
    do {
      final HashTrieMap<Type, JsonForm<?>> oldMappings = mappings;
      final HashTrieMap<Type, JsonForm<?>> newMappings = oldMappings.updated(javaType, jsonForm);
      mappings = (HashTrieMap<Type, JsonForm<?>>) MAPPINGS.compareAndExchangeRelease(this, oldMappings, newMappings);
      if (mappings == oldMappings) {
        break;
      }
    } while (true);
  }

  protected @Nullable JsonForm<?> resolveJsonForm(Type javaType) {
    if (javaType == Object.class) {
      return this;
    }

    final JsonProvider[] providers = (JsonProvider[]) PROVIDERS.getOpaque(this);
    for (int i = 0; i < providers.length; i += 1) {
      final JsonProvider provider = providers[i];
      final JsonForm<?> jsonForm = provider.resolveJsonForm(javaType);
      if (jsonForm != null) {
        return jsonForm;
      }
    }

    return null;
  }

  @SuppressWarnings("ReferenceEquality")
  public <T> @Nullable JsonForm<T> forType(Type javaType) {
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

    HashTrieMap<Type, JsonForm<?>> mappings = (HashTrieMap<Type, JsonForm<?>>) MAPPINGS.getOpaque(this);
    JsonForm<T> newJsonForm = null;
    do {
      final JsonForm<T> oldJsonForm = Assume.conformsNullable(mappings.get(javaType));
      if (oldJsonForm != null) {
        return oldJsonForm;
      } else {
        if (newJsonForm == null) {
          newJsonForm = Assume.conformsNullable(this.resolveJsonForm(javaType));
          if (newJsonForm == null) {
            return null;
          }
        }
        final HashTrieMap<Type, JsonForm<?>> oldMappings = mappings;
        final HashTrieMap<Type, JsonForm<?>> newMappings = oldMappings.updated(javaType, newJsonForm);
        mappings = (HashTrieMap<Type, JsonForm<?>>) MAPPINGS.compareAndExchangeRelease(this, oldMappings, newMappings);
        if (mappings == oldMappings) {
          return newJsonForm;
        }
      }
    } while (true);
  }

  public <T> @Nullable JsonForm<T> forValue(@Nullable T value) {
    if (value == null) {
      return Assume.conforms(JsonJava.nullForm());
    } else {
      return this.forType(value.getClass());
    }
  }

  @Override
  public MediaType mediaType() {
    return APPLICATION_JSON;
  }

  @Override
  public <T> @Nullable JsonForm<T> getTranslator(Type javaType) {
    return this.forType(javaType);
  }

  @Override
  public JsonUndefinedForm<Void> undefinedForm() {
    return JsonJava.voidForm();
  }

  @Override
  public JsonNullForm<Object> nullForm() {
    return JsonJava.nullForm();
  }

  @Override
  public JsonNumberForm<Number> numberForm() {
    return JsonJava.numberForm();
  }

  @Override
  public JsonIdentifierForm<Object> identifierForm() {
    return JsonJava.identifierForm();
  }

  @Override
  public JsonStringForm<?, String> stringForm() {
    return JsonJava.stringForm();
  }

  @Override
  public @Nullable JsonArrayForm<?, ?, List<Object>> arrayForm() {
    final JsonForm<List<Object>> listForm = this.forType(List.class);
    if (listForm instanceof JsonArrayForm<?, ?, ?>) {
      return (JsonArrayForm<?, ?, List<Object>>) listForm;
    } else {
      return null;
    }
  }

  @Override
  public @Nullable JsonObjectForm<?, ?, ?, Map<Object, Object>> objectForm() {
    final JsonForm<Map<Object, Object>> mapForm = this.forType(Map.class);
    if (mapForm instanceof JsonObjectForm<?, ?, ?, ?>) {
      return (JsonObjectForm<?, ?, ?, Map<Object, Object>>) mapForm;
    } else {
      return null;
    }
  }

  @Override
  public Parse<Object> parse(Input input, JsonParser parser) {
    return parser.parseExpr(input, this);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object value, JsonWriter writer) {
    if (value != null) {
      final JsonForm<Object> valueForm = this.forValue(value);
      if (valueForm != null) {
        return valueForm.write(output, value, writer);
      } else {
        return Write.error(new WriteException("Unsupported value: " + value));
      }
    } else {
      return writer.writeNull(output);
    }
  }

  @Override
  public Term intoTerm(@Nullable Object value) {
    if (value instanceof Term) {
      return (Term) value;
    } else {
      final JsonForm<Object> jsonForm = this.forValue(value);
      if (jsonForm != null) {
        return jsonForm.intoTerm(value);
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
    notation.beginInvoke("Json", "codec").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static JsonCodec provider() {
    return Json.codec();
  }

  static final MediaType APPLICATION_JSON = MediaType.of("application", "json");

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
      PROVIDERS = lookup.findVarHandle(JsonCodec.class, "providers", JsonProvider.class.arrayType());
      MAPPINGS = lookup.findVarHandle(JsonCodec.class, "mappings", HashTrieMap.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
