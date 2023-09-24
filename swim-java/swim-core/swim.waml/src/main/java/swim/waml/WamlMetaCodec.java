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
import swim.repr.Attrs;
import swim.term.Term;
import swim.term.TermException;
import swim.term.TermWriterOptions;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
@CodecType("application/x-waml")
public class WamlMetaCodec implements MetaFormat, WamlFormat<Object>, WriteSource {

  WamlProvider[] providers;

  HashTrieMap<Type, WamlFormat<?>> formats;

  public WamlMetaCodec() {
    this.providers = new WamlProvider[0];
    this.formats = HashTrieMap.empty();
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
      final WamlProvider[] oldProviders = providers;
      final WamlProvider[] newProviders = new WamlProvider[oldProviders.length + 1];
      System.arraycopy(oldProviders, 0, newProviders, 0, index);
      newProviders[index] = provider;
      System.arraycopy(oldProviders, index, newProviders, index + 1, oldProviders.length - index);
      providers = (WamlProvider[]) PROVIDERS.compareAndExchangeRelease(this, oldProviders, newProviders);
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
    this.addProvider(WamlLang.provider(this));
    this.addProvider(WamlTerms.provider());
    this.addProvider(WamlReprs.provider());

    // Generic providers
    this.addProvider(WamlSpecifiers.provider(this));
    this.addProvider(WamlVariants.provider(this));
    this.addProvider(WamlEnums.provider());
    this.addProvider(WamlThrowables.provider());
    this.addProvider(WamlCollections.provider(this));
    this.addProvider(WamlReflections.provider(this));
  }

  protected void loadExtensions() {
    final ServiceLoader<WamlProvider> serviceLoader = ServiceLoader.load(WamlProvider.class, WamlMetaCodec.class.getClassLoader());
    final Iterator<ServiceLoader.Provider<WamlProvider>> serviceProviders = serviceLoader.stream().iterator();
    while (serviceProviders.hasNext()) {
      this.loadExtension(serviceProviders.next());
    }
  }

  void loadExtension(ServiceLoader.Provider<WamlProvider> serviceProvider) {
    final Class<? extends WamlProvider> providerClass = serviceProvider.type();
    WamlProvider provider = null;

    // public static WamlProvider provider(WamlMetaCodec metaCodec);
    try {
      final Method method = providerClass.getDeclaredMethod("provider", WamlMetaCodec.class);
      if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && WamlProvider.class.isAssignableFrom(method.getReturnType())) {
        provider = (WamlProvider) method.invoke(null, this);
      }
    } catch (ReflectiveOperationException cause) {
      // ignore
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
        // ignore
      }
    }

    if (provider == null) {
      provider = serviceProvider.get();
    }
    this.addProvider(provider);
  }

  @SuppressWarnings("ReferenceEquality")
  public void registerWamlFormat(Type type, WamlFormat<?> format) {
    HashTrieMap<Type, WamlFormat<?>> formats = (HashTrieMap<Type, WamlFormat<?>>) FORMATS.getOpaque(this);
    do {
      final HashTrieMap<Type, WamlFormat<?>> oldFormats = formats;
      final HashTrieMap<Type, WamlFormat<?>> newFormats = oldFormats.updated(type, format);
      formats = (HashTrieMap<Type, WamlFormat<?>>) FORMATS.compareAndExchangeRelease(this, oldFormats, newFormats);
      if (formats != oldFormats) {
        // CAS failed; try again.
        continue;
      }
      formats = newFormats;
      break;
    } while (true);
  }

  protected WamlFormat<?> resolveWamlFormat(Type type) throws WamlProviderException {
    if (type == Object.class) {
      return this;
    }

    final WamlProvider[] providers = (WamlProvider[]) PROVIDERS.getOpaque(this);
    for (int i = 0; i < providers.length; i += 1) {
      final WamlProvider provider = providers[i];
      final WamlFormat<?> format = provider.resolveWamlFormat(type);
      if (format != null) {
        return format;
      }
    }

    throw new WamlProviderException("no waml format for " + type);
  }

  @SuppressWarnings("ReferenceEquality")
  public <T> WamlFormat<T> getWamlFormat(Type type) throws WamlProviderException {
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

    HashTrieMap<Type, WamlFormat<?>> formats = (HashTrieMap<Type, WamlFormat<?>>) FORMATS.getOpaque(this);
    WamlFormat<T> newFormat = null;
    do {
      final WamlFormat<T> oldFormat = Assume.conformsNullable(formats.get(type));
      if (oldFormat != null) {
        return oldFormat;
      } else if (newFormat == null) {
        newFormat = Assume.conforms(this.resolveWamlFormat(type));
      }
      final HashTrieMap<Type, WamlFormat<?>> oldFormats = formats;
      final HashTrieMap<Type, WamlFormat<?>> newFormats = oldFormats.updated(type, newFormat);
      formats = (HashTrieMap<Type, WamlFormat<?>>) FORMATS.compareAndExchangeRelease(this, oldFormats, newFormats);
      if (formats != oldFormats) {
        // CAS failed; try again.
        continue;
      }
      return newFormat;
    } while (true);
  }

  public <T> WamlFormat<T> getWamlFormat(@Nullable T value) throws WamlProviderException {
    if (value == null) {
      return Assume.conforms(WamlLang.nullFormat());
    }
    return this.getWamlFormat(value.getClass());
  }

  @Override
  public WamlParser<Object> withAttrs(@Nullable Object attrs) throws WamlException {
    if (attrs instanceof Attrs attributes) {
      if (attributes.containsKey("blob")) {
        return Assume.covariant(WamlLang.byteBufferFormat());
      }
    }
    return this;
  }

  @Override
  public WamlIdentifierParser<Object> identifierParser() throws WamlException {
    return WamlLang.identifierFormat().identifierParser();
  }

  @Override
  public WamlNumberParser<Object> numberParser() throws WamlException {
    return Assume.covariant(WamlLang.numberFormat().numberParser());
  }

  @Override
  public WamlStringParser<?, Object> stringParser() throws WamlException {
    return Assume.covariant(WamlLang.stringFormat().stringParser());
  }

  @Override
  public WamlArrayParser<?, ?, Object> arrayParser() throws WamlException {
    return Assume.conforms(this.getWamlFormat(List.class).arrayParser());
  }

  @Override
  public WamlMarkupParser<?, ?, Object> markupParser() throws WamlException {
    return Assume.covariant(WamlLang.markupFormat(this).markupParser());
  }

  @Override
  public WamlObjectParser<?, ?, Object> objectParser() throws WamlException {
    return Assume.conforms(this.getWamlFormat(Map.class).objectParser());
  }

  @Override
  public WamlTupleParser<?, ?, Object> tupleParser() throws WamlException {
    return WamlLang.tupleFormat(this).tupleParser();
  }

  @Override
  public @Nullable Object initializer(@Nullable Object attrs) throws WamlException {
    return null;
  }

  @Override
  public MediaType mediaType() {
    return APPLICATION_X_WAML;
  }

  @Override
  public @Nullable String typeName() {
    return "any";
  }

  @Override
  public <T> Format<T> getFormat(Type type) throws CodecException {
    try {
      return this.getWamlFormat(type);
    } catch (WamlProviderException cause) {
      throw new CodecException(cause);
    }
  }

  public <T> Parse<T> parse(Type type, Input input, @Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    final WamlFormat<T> format;
    try {
      format = this.getWamlFormat(type);
    } catch (WamlProviderException cause) {
      return Parse.error(cause);
    }
    return format.parse(input, options);
  }

  @Override
  public <T> Parse<T> parse(Type type, Input input) {
    final WamlFormat<T> format;
    try {
      format = this.getWamlFormat(type);
    } catch (WamlProviderException cause) {
      return Parse.error(cause);
    }
    return format.parse(input, WamlParserOptions.standard());
  }

  public <T> Parse<T> parse(Type type, @Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    final WamlFormat<T> format;
    try {
      format = this.getWamlFormat(type);
    } catch (WamlProviderException cause) {
      return Parse.error(cause);
    }
    return format.parse(options);
  }

  @Override
  public <T> Parse<T> parse(Type type) {
    final WamlFormat<T> format;
    try {
      format = this.getWamlFormat(type);
    } catch (WamlProviderException cause) {
      return Parse.error(cause);
    }
    return format.parse(WamlParserOptions.standard());
  }

  public <T> Parse<T> parse(Type type, String string, @Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    final WamlFormat<T> format;
    try {
      format = this.getWamlFormat(type);
    } catch (WamlProviderException cause) {
      return Parse.error(cause);
    }
    return format.parse(string, options);
  }

  @Override
  public <T> Parse<T> parse(Type type, String string) {
    final WamlFormat<T> format;
    try {
      format = this.getWamlFormat(type);
    } catch (WamlProviderException cause) {
      return Parse.error(cause);
    }
    return format.parse(string, WamlParserOptions.standard());
  }

  @Override
  public Parse<Object> parse(Input input, @Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    return this.parseExpr(input, options);
  }

  public <T> Parse<T> parseBlock(Type type, Input input, @Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    final WamlFormat<T> format;
    try {
      format = this.getWamlFormat(type);
    } catch (WamlProviderException cause) {
      return Parse.error(cause);
    }
    return format.parseBlock(input, options);
  }

  public <T> Parse<T> parseBlock(Type type, Input input) {
    final WamlFormat<T> format;
    try {
      format = this.getWamlFormat(type);
    } catch (WamlProviderException cause) {
      return Parse.error(cause);
    }
    return format.parseBlock(input, WamlParserOptions.standard());
  }

  public <T> Parse<T> parseBlock(Type type, @Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    final WamlFormat<T> format;
    try {
      format = this.getWamlFormat(type);
    } catch (WamlProviderException cause) {
      return Parse.error(cause);
    }
    return format.parseBlock(options);
  }

  public <T> Parse<T> parseBlock(Type type) {
    final WamlFormat<T> format;
    try {
      format = this.getWamlFormat(type);
    } catch (WamlProviderException cause) {
      return Parse.error(cause);
    }
    return format.parseBlock(WamlParserOptions.standard());
  }

  public <T> Parse<T> parseBlock(Type type, String string, @Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    final WamlFormat<T> format;
    try {
      format = this.getWamlFormat(type);
    } catch (WamlProviderException cause) {
      return Parse.error(cause);
    }
    return format.parseBlock(string, options);
  }

  public <T> Parse<T> parseBlock(Type type, String string) {
    final WamlFormat<T> format;
    try {
      format = this.getWamlFormat(type);
    } catch (WamlProviderException cause) {
      return Parse.error(cause);
    }
    return format.parseBlock(string, WamlParserOptions.standard());
  }

  @Override
  public Parse<Object> parseBlock(Input input, @Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    return this.parseExpr(input, options);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object attrs,
                        @Nullable Object value, @Nullable WamlWriterOptions options) {
    if (options == null) {
      options = WamlWriterOptions.readable();
    }
    if (value instanceof Term) {
      return this.writeTerm(output, (Term) value, options);
    }
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      return Write.error(cause);
    }
    return format.write(output, attrs, value, options);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object value, @Nullable WamlWriterOptions options) {
    if (options == null) {
      options = WamlWriterOptions.readable();
    }
    if (value instanceof Term) {
      return this.writeTerm(output, (Term) value, options);
    }
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      return Write.error(cause);
    }
    return format.write(output, value, options);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object value) {
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      return Write.error(cause);
    }
    return format.write(output, value, WamlWriterOptions.readable());
  }

  @Override
  public Write<?> write(@Nullable Object value, @Nullable WamlWriterOptions options) {
    if (options == null) {
      options = WamlWriterOptions.readable();
    }
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      return Write.error(cause);
    }
    return format.write(value, options);
  }

  @Override
  public Write<?> write(@Nullable Object value) {
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      return Write.error(cause);
    }
    return format.write(value, WamlWriterOptions.readable());
  }

  @Override
  public String toString(@Nullable Object value, @Nullable WamlWriterOptions options) {
    if (options == null) {
      options = WamlWriterOptions.readable();
    }
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      throw new IllegalArgumentException(cause);
    }
    return format.toString(value, options);
  }

  @Override
  public String toString(@Nullable Object value) {
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      throw new IllegalArgumentException(cause);
    }
    return format.toString(value, WamlWriterOptions.readable());
  }

  @Override
  public Write<?> writeBlock(Output<?> output, @Nullable Object value, @Nullable WamlWriterOptions options) {
    if (options == null) {
      options = WamlWriterOptions.readable();
    }
    if (value instanceof Term) {
      return this.writeTerm(output, (Term) value, options);
    }
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      return Write.error(cause);
    }
    return format.writeBlock(output, value, options);
  }

  @Override
  public Write<?> writeBlock(Output<?> output, @Nullable Object value) {
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      return Write.error(cause);
    }
    return format.writeBlock(output, value, WamlWriterOptions.readable());
  }

  @Override
  public Write<?> writeBlock(@Nullable Object value, @Nullable WamlWriterOptions options) {
    if (options == null) {
      options = WamlWriterOptions.readable();
    }
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      return Write.error(cause);
    }
    return format.writeBlock(value, options);
  }

  @Override
  public Write<?> writeBlock(@Nullable Object value) {
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      return Write.error(cause);
    }
    return format.writeBlock(value, WamlWriterOptions.readable());
  }

  @Override
  public String toBlockString(@Nullable Object value, @Nullable WamlWriterOptions options) {
    if (options == null) {
      options = WamlWriterOptions.readable();
    }
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      throw new IllegalArgumentException(cause);
    }
    return format.toBlockString(value, options);
  }

  @Override
  public String toBlockString(@Nullable Object value) {
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      throw new IllegalArgumentException(cause);
    }
    return format.toBlockString(value, WamlWriterOptions.readable());
  }

  @Override
  public Write<?> writeTerm(Output<?> output, Term term, TermWriterOptions options) {
    options = WamlWriterOptions.readable().withOptions(options);
    if (term instanceof Expr) {
      return ((Expr) term).write(output, this, options);
    }
    final Object value;
    try {
      value = options.termRegistry().fromTerm(term);
    } catch (TermException cause) {
      return Write.error(cause);
    }
    final WamlFormat<Object> format;
    try {
      format = this.getWamlFormat(value);
    } catch (WamlProviderException cause) {
      return Write.error(cause);
    }
    return format.write(output, value, options);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Waml", "metaCodec").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WamlMetaCodec INSTANCE;

  public static WamlMetaCodec provider() {
    return INSTANCE;
  }

  static final MediaType APPLICATION_X_WAML = MediaType.of("application", "x-waml");

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
      PROVIDERS = lookup.findVarHandle(WamlMetaCodec.class, "providers", WamlProvider.class.arrayType());
      FORMATS = lookup.findVarHandle(WamlMetaCodec.class, "formats", HashTrieMap.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
    INSTANCE = new WamlMetaCodec();
  }

}
