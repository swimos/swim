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
import swim.codec.CodecException;
import swim.codec.CodecType;
import swim.codec.Format;
import swim.codec.Input;
import swim.codec.MediaType;
import swim.codec.MetaFormat;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.collections.FingerTrieList;
import swim.collections.HashTrieMap;
import swim.expr.Expr;
import swim.term.Term;
import swim.term.TermException;
import swim.term.TermWriterOptions;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
@CodecType({"application/json", "text/json"})
public class JsonMetaCodec implements MetaFormat, JsonFormat<Object>, ToSource {

  JsonProvider[] providers;

  HashTrieMap<Type, JsonFormat<?>> formats;

  public JsonMetaCodec() {
    this.providers = new JsonProvider[0];
    this.formats = HashTrieMap.empty();
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
      final JsonProvider[] oldProviders = providers;
      final JsonProvider[] newProviders = new JsonProvider[oldProviders.length + 1];
      System.arraycopy(oldProviders, 0, newProviders, 0, index);
      newProviders[index] = provider;
      System.arraycopy(oldProviders, index, newProviders, index + 1, oldProviders.length - index);
      providers = (JsonProvider[]) PROVIDERS.compareAndExchangeRelease(this, oldProviders, newProviders);
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
    this.addProvider(JsonLang.provider(this));
    this.addProvider(JsonTerms.provider());
    this.addProvider(JsonReprs.provider());

    // Generic providers
    this.addProvider(JsonSpecifiers.provider(this));
    this.addProvider(JsonVariants.provider(this));
    this.addProvider(JsonEnums.provider());
    this.addProvider(JsonThrowables.provider());
    this.addProvider(JsonCollections.provider(this));
    this.addProvider(JsonReflections.provider(this));
  }

  protected void loadExtensions() {
    final ServiceLoader<JsonProvider> serviceLoader = ServiceLoader.load(JsonProvider.class, JsonMetaCodec.class.getClassLoader());
    final Iterator<ServiceLoader.Provider<JsonProvider>> serviceProviders = serviceLoader.stream().iterator();
    while (serviceProviders.hasNext()) {
      this.loadExtension(serviceProviders.next());
    }
  }

  void loadExtension(ServiceLoader.Provider<JsonProvider> serviceProvider) {
    final Class<? extends JsonProvider> providerClass = serviceProvider.type();
    JsonProvider provider = null;

    // public static JsonProvider provider(JsonMetaCodec metaCodec);
    try {
      final Method method = providerClass.getDeclaredMethod("provider", JsonMetaCodec.class);
      if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && JsonProvider.class.isAssignableFrom(method.getReturnType())) {
        provider = (JsonProvider) method.invoke(null, this);
      }
    } catch (ReflectiveOperationException cause) {
      // ignore
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
        // ignore
      }
    }

    if (provider == null) {
      provider = serviceProvider.get();
    }
    this.addProvider(provider);
  }

  @SuppressWarnings("ReferenceEquality")
  public void registerJsonFormat(Type type, JsonFormat<?> format) {
    HashTrieMap<Type, JsonFormat<?>> formats = (HashTrieMap<Type, JsonFormat<?>>) FORMATS.getOpaque(this);
    do {
      final HashTrieMap<Type, JsonFormat<?>> oldFormats = formats;
      final HashTrieMap<Type, JsonFormat<?>> newFormats = oldFormats.updated(type, format);
      formats = (HashTrieMap<Type, JsonFormat<?>>) FORMATS.compareAndExchangeRelease(this, oldFormats, newFormats);
      if (formats != oldFormats) {
        // CAS failed; try again.
        continue;
      }
      formats = newFormats;
      break;
    } while (true);
  }

  protected JsonFormat<?> resolveJsonFormat(Type type) throws JsonProviderException {
    if (type == Object.class) {
      return this;
    }

    final JsonProvider[] providers = (JsonProvider[]) PROVIDERS.getOpaque(this);
    for (int i = 0; i < providers.length; i += 1) {
      final JsonProvider provider = providers[i];
      final JsonFormat<?> format = provider.resolveJsonFormat(type);
      if (format != null) {
        return format;
      }
    }

    throw new JsonProviderException("no json format for " + type);
  }

  @SuppressWarnings("ReferenceEquality")
  public <T> JsonFormat<T> getJsonFormat(Type type) throws JsonProviderException {
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

    HashTrieMap<Type, JsonFormat<?>> formats = (HashTrieMap<Type, JsonFormat<?>>) FORMATS.getOpaque(this);
    JsonFormat<T> newFormat = null;
    do {
      final JsonFormat<T> oldFormat = Assume.conformsNullable(formats.get(type));
      if (oldFormat != null) {
        return oldFormat;
      } else if (newFormat == null) {
        newFormat = Assume.conforms(this.resolveJsonFormat(type));
      }
      final HashTrieMap<Type, JsonFormat<?>> oldFormats = formats;
      final HashTrieMap<Type, JsonFormat<?>> newFormats = oldFormats.updated(type, newFormat);
      formats = (HashTrieMap<Type, JsonFormat<?>>) FORMATS.compareAndExchangeRelease(this, oldFormats, newFormats);
      if (formats != oldFormats) {
        // CAS failed; try again.
        continue;
      }
      return newFormat;
    } while (true);
  }

  public <T> JsonFormat<T> getJsonFormat(@Nullable T value) throws JsonProviderException {
    if (value == null) {
      return Assume.conforms(JsonLang.nullFormat());
    }
    return this.getJsonFormat(value.getClass());
  }

  @Override
  public JsonIdentifierParser<Object> identifierParser() throws JsonException {
    return JsonLang.identifierFormat().identifierParser();
  }

  @Override
  public JsonNumberParser<Object> numberParser() throws JsonException {
    return Assume.covariant(JsonLang.numberFormat().numberParser());
  }

  @Override
  public JsonStringParser<?, Object> stringParser() throws JsonException {
    return Assume.covariant(JsonLang.stringFormat().stringParser());
  }

  @Override
  public JsonArrayParser<?, ?, Object> arrayParser() throws JsonException {
    return Assume.conforms(this.getJsonFormat(List.class).arrayParser());
  }

  @Override
  public JsonObjectParser<?, ?, Object> objectParser() throws JsonException {
    return Assume.conforms(this.getJsonFormat(Map.class).objectParser());
  }

  @Override
  public @Nullable Object initializer() throws JsonException {
    return null;
  }

  @Override
  public MediaType mediaType() {
    return APPLICATION_JSON;
  }

  @Override
  public @Nullable String typeName() {
    return "any";
  }

  @Override
  public <T> Format<T> getFormat(Type type) throws CodecException {
    try {
      return this.getJsonFormat(type);
    } catch (JsonProviderException cause) {
      throw new CodecException(cause);
    }
  }

  public <T> Parse<T> parse(Type type, Input input, @Nullable JsonParserOptions options) {
    if (options == null) {
      options = JsonParserOptions.standard();
    }
    final JsonFormat<T> format;
    try {
      format = this.getJsonFormat(type);
    } catch (JsonProviderException cause) {
      return Parse.error(cause);
    }
    return format.parse(input, options);
  }

  @Override
  public <T> Parse<T> parse(Type type, Input input) {
    final JsonFormat<T> format;
    try {
      format = this.getJsonFormat(type);
    } catch (JsonProviderException cause) {
      return Parse.error(cause);
    }
    return format.parse(input, JsonParserOptions.standard());
  }

  public <T> Parse<T> parse(Type type, @Nullable JsonParserOptions options) {
    if (options == null) {
      options = JsonParserOptions.standard();
    }
    final JsonFormat<T> format;
    try {
      format = this.getJsonFormat(type);
    } catch (JsonProviderException cause) {
      return Parse.error(cause);
    }
    return format.parse(options);
  }

  @Override
  public <T> Parse<T> parse(Type type) {
    final JsonFormat<T> format;
    try {
      format = this.getJsonFormat(type);
    } catch (JsonProviderException cause) {
      return Parse.error(cause);
    }
    return format.parse(JsonParserOptions.standard());
  }

  public <T> Parse<T> parse(Type type, String string, @Nullable JsonParserOptions options) {
    if (options == null) {
      options = JsonParserOptions.standard();
    }
    final JsonFormat<T> format;
    try {
      format = this.getJsonFormat(type);
    } catch (JsonProviderException cause) {
      return Parse.error(cause);
    }
    return format.parse(string, options);
  }

  @Override
  public <T> Parse<T> parse(Type type, String string) {
    final JsonFormat<T> format;
    try {
      format = this.getJsonFormat(type);
    } catch (JsonProviderException cause) {
      return Parse.error(cause);
    }
    return format.parse(string, JsonParserOptions.standard());
  }

  @Override
  public Parse<Object> parse(Input input, @Nullable JsonParserOptions options) {
    if (options == null) {
      options = JsonParserOptions.standard();
    }
    return this.parseExpr(input, options);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object value, @Nullable JsonWriterOptions options) {
    if (options == null) {
      options = JsonWriterOptions.standard();
    }
    if (value instanceof Term) {
      return this.writeTerm(output, (Term) value, options);
    }
    final JsonFormat<Object> format;
    try {
      format = this.getJsonFormat(value);
    } catch (JsonProviderException cause) {
      return Write.error(cause);
    }
    return format.write(output, value, options);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object value) {
    final JsonFormat<Object> format;
    try {
      format = this.getJsonFormat(value);
    } catch (JsonProviderException cause) {
      return Write.error(cause);
    }
    return format.write(output, value, JsonWriterOptions.standard());
  }

  @Override
  public Write<?> write(@Nullable Object value, @Nullable JsonWriterOptions options) {
    if (options == null) {
      options = JsonWriterOptions.standard();
    }
    final JsonFormat<Object> format;
    try {
      format = this.getJsonFormat(value);
    } catch (JsonProviderException cause) {
      return Write.error(cause);
    }
    return format.write(value, options);
  }

  @Override
  public Write<?> write(@Nullable Object value) {
    final JsonFormat<Object> format;
    try {
      format = this.getJsonFormat(value);
    } catch (JsonProviderException cause) {
      return Write.error(cause);
    }
    return format.write(value, JsonWriterOptions.standard());
  }

  @Override
  public String toString(@Nullable Object value, @Nullable JsonWriterOptions options) {
    if (options == null) {
      options = JsonWriterOptions.standard();
    }
    final JsonFormat<Object> format;
    try {
      format = this.getJsonFormat(value);
    } catch (JsonProviderException cause) {
      throw new IllegalArgumentException(cause);
    }
    return format.toString(value, options);
  }

  @Override
  public String toString(@Nullable Object value) {
    final JsonFormat<Object> format;
    try {
      format = this.getJsonFormat(value);
    } catch (JsonProviderException cause) {
      throw new IllegalArgumentException(cause);
    }
    return format.toString(value, JsonWriterOptions.standard());
  }

  @Override
  public Write<?> writeTerm(Output<?> output, Term term, TermWriterOptions options) {
    options = JsonWriterOptions.standard().withOptions(options);
    if (term instanceof Expr) {
      return ((Expr) term).write(output, this, options);
    }
    final Object value;
    try {
      value = options.termRegistry().fromTerm(term);
    } catch (TermException cause) {
      return Write.error(cause);
    }
    final JsonFormat<Object> format;
    try {
      format = this.getJsonFormat(value);
    } catch (JsonProviderException cause) {
      return Write.error(cause);
    }
    return format.write(output, value, options);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Json", "metaCodec").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final JsonMetaCodec INSTANCE;

  public static JsonMetaCodec provider() {
    return INSTANCE;
  }

  static final MediaType APPLICATION_JSON = MediaType.of("application", "json");

  /**
   * {@code VarHandle} for atomically accessing the {@link #providers} field.
   */
  static final VarHandle PROVIDERS;

  /**
   * {@code VarHandle} for atomically accessing the {@link #formats} field.
   */
  static final VarHandle FORMATS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      PROVIDERS = lookup.findVarHandle(JsonMetaCodec.class, "providers", JsonProvider.class.arrayType());
      FORMATS = lookup.findVarHandle(JsonMetaCodec.class, "formats", HashTrieMap.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
    INSTANCE = new JsonMetaCodec();
  }

}
