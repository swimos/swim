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

import java.lang.reflect.Array;
import java.lang.reflect.GenericArrayType;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.lang.reflect.WildcardType;
import java.math.BigInteger;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.AbstractMap.SimpleEntry;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base64;
import swim.codec.ByteBufferOutput;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.OutputException;
import swim.codec.Parse;
import swim.codec.StringOutput;
import swim.codec.Write;
import swim.collections.UniformMap;
import swim.decl.FilterMode;
import swim.expr.ChildExpr;
import swim.expr.ContextExpr;
import swim.repr.Attrs;
import swim.repr.Repr;
import swim.term.Term;
import swim.util.ArrayBuilder;
import swim.util.ArrayIterator;
import swim.util.Assume;
import swim.util.CacheSet;
import swim.util.LruCacheSet;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class WamlLang implements WamlProvider, WriteSource {

  final WamlMetaCodec metaCodec;
  final int priority;

  private WamlLang(WamlMetaCodec metaCodec, int priority) {
    this.metaCodec = metaCodec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable WamlFormat<?> resolveWamlFormat(Type type) throws WamlProviderException {
    if (type instanceof GenericArrayType) {
      return WamlLang.arrayFormat(this.metaCodec, ((GenericArrayType) type).getGenericComponentType());
    } else if (type instanceof Class<?>) {
      final Class<?> classType = (Class<?>) type;
      if (classType.isArray()) {
        return WamlLang.arrayFormat(this.metaCodec, classType.getComponentType());
      } else if (classType == void.class || classType == Void.TYPE) {
        return WamlLang.voidFormat();
      } else if (classType == Boolean.class || classType == Boolean.TYPE) {
        return WamlLang.booleanFormat();
      } else if (classType == Byte.class || classType == Byte.TYPE) {
        return WamlLang.byteFormat();
      } else if (classType == Character.class || classType == Character.TYPE) {
        return WamlLang.charFormat();
      } else if (classType == Short.class || classType == Short.TYPE) {
        return WamlLang.shortFormat();
      } else if (classType == Integer.class || classType == Integer.TYPE) {
        return WamlLang.intFormat();
      } else if (classType == Long.class || classType == Long.TYPE) {
        return WamlLang.longFormat();
      } else if (classType == Float.class || classType == Float.TYPE) {
        return WamlLang.floatFormat();
      } else if (classType == Double.class || classType == Double.TYPE) {
        return WamlLang.doubleFormat();
      } else if (classType == String.class) {
        return WamlLang.stringFormat();
      } else if (Number.class.isAssignableFrom(classType)) {
        return WamlLang.numberFormat();
      } else if (ByteBuffer.class.isAssignableFrom(classType)) {
        return WamlLang.byteBufferFormat();
      } else if (Instant.class.isAssignableFrom(classType)) {
        return WamlLang.instantFormat();
      } else if (InetAddress.class.isAssignableFrom(classType)) {
        return WamlLang.inetAddressFormat();
      } else if (InetSocketAddress.class.isAssignableFrom(classType)) {
        return WamlLang.inetSocketAddressFormat();
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlLang", "provider")
            .appendArgument(this.metaCodec);
    if (this.priority != BUILTIN_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static WamlLang provider(WamlMetaCodec metaCodec, int priority) {
    return new WamlLang(metaCodec, priority);
  }

  public static WamlLang provider(WamlMetaCodec metaCodec) {
    return new WamlLang(metaCodec, BUILTIN_PRIORITY);
  }

  public static WamlFormat<Void> voidFormat() {
    return VoidFormat.INSTANCE;
  }

  public static WamlFormat<Object> nullFormat() {
    return NullFormat.INSTANCE;
  }

  public static WamlFormat<Object> identifierFormat() {
    return IdentifierFormat.INSTANCE;
  }

  public static WamlFormat<Boolean> booleanFormat() {
    return BooleanFormat.INSTANCE;
  }

  public static WamlFormat<Byte> byteFormat() {
    return ByteFormat.INSTANCE;
  }

  public static WamlFormat<Character> charFormat() {
    return CharFormat.INSTANCE;
  }

  public static WamlFormat<Short> shortFormat() {
    return ShortFormat.INSTANCE;
  }

  public static WamlFormat<Integer> intFormat() {
    return IntFormat.INSTANCE;
  }

  public static WamlFormat<Long> longFormat() {
    return LongFormat.INSTANCE;
  }

  public static WamlFormat<Float> floatFormat() {
    return FloatFormat.INSTANCE;
  }

  public static WamlFormat<Double> doubleFormat() {
    return DoubleFormat.INSTANCE;
  }

  public static WamlFormat<Number> numberFormat() {
    return NumberFormat.INSTANCE;
  }

  public static WamlFormat<String> stringFormat() {
    return StringFormat.INSTANCE;
  }

  public static WamlFormat<String> keyFormat() {
    return KeyFormat.INSTANCE;
  }

  public static WamlFormat<ByteBuffer> byteBufferFormat() {
    return ByteBufferFormat.INSTANCE;
  }

  public static WamlFormat<Instant> instantFormat() {
    return InstantFormat.INSTANCE;
  }

  public static WamlFormat<InetAddress> inetAddressFormat() {
    return InetAddressFormat.INSTANCE;
  }

  public static WamlFormat<InetSocketAddress> inetSocketAddressFormat() {
    return InetSocketAddressFormat.INSTANCE;
  }

  public static WamlFormat<List<Object>> markupFormat(WamlFormat<Object> nodeFormat) {
    return new MarkupFormat(nodeFormat);
  }

  public static <E, T> WamlFormat<T> arrayFormat(Class<?> componentClass, WamlFormat<E> componentFormat) {
    return new ArrayFormat<E, T>(componentClass, componentFormat);
  }

  public static <T> @Nullable WamlFormat<T> arrayFormat(WamlMetaCodec metaCodec, Type componentType) throws WamlProviderException {
    if (componentType instanceof WildcardType) {
      final Type[] upperBounds = ((WildcardType) componentType).getUpperBounds();
      if (upperBounds != null && upperBounds.length != 0) {
        componentType = upperBounds[0];
      } else {
        componentType = Object.class;
      }
    }
    if (componentType instanceof TypeVariable) {
      final Type[] bounds = ((TypeVariable) componentType).getBounds();
      if (bounds != null && bounds.length != 0) {
        componentType = bounds[0];
      } else {
        componentType = Object.class;
      }
    }
    if (componentType instanceof ParameterizedType) {
      componentType = ((ParameterizedType) componentType).getRawType();
    }
    if (!(componentType instanceof Class<?>)) {
      throw new WamlProviderException("unsupported array component type: " + componentType);
    }
    final WamlFormat<?> componentFormat = metaCodec.getWamlFormat(componentType);
    return new ArrayFormat<>((Class<?>) componentType, componentFormat);
  }

  public static WamlFormat<Object> tupleFormat(WamlFormat<Object> valueFormat) {
    return new TupleFormat(valueFormat);
  }

  static final ThreadLocal<CacheSet<String>> STRING_CACHE = new ThreadLocal<CacheSet<String>>();

  public static CacheSet<String> stringCache() {
    CacheSet<String> stringCache = STRING_CACHE.get();
    if (stringCache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.waml.string.cache.size"));
      } catch (NumberFormatException cause) {
        cacheSize = 512;
      }
      stringCache = new LruCacheSet<String>(cacheSize);
      STRING_CACHE.set(stringCache);
    }
    return stringCache;
  }

  static final ThreadLocal<CacheSet<String>> KEY_CACHE = new ThreadLocal<CacheSet<String>>();

  public static CacheSet<String> keyCache() {
    CacheSet<String> keyCache = KEY_CACHE.get();
    if (keyCache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.waml.key.cache.size"));
      } catch (NumberFormatException cause) {
        cacheSize = 512;
      }
      keyCache = new LruCacheSet<String>(cacheSize);
      KEY_CACHE.set(keyCache);
    }
    return keyCache;
  }

  static final class VoidFormat implements WamlFormat<Void>, WamlIdentifierParser<Void>, WamlIdentifierWriter<Void>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "undefined";
    }

    @Override
    public @Nullable Void fromIdentifier(@Nullable Object attrs, String value, WamlParserOptions options) throws WamlException {
      if ("undefined".equals(value)) {
        return null;
      }
      throw new WamlException("unsupported identifier: " + value);
    }

    @Override
    public @Nullable String intoIdentifier(@Nullable Void value) {
      return "undefined";
    }

    @Override
    public boolean filter(@Nullable Void value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
        case TRUTHY:
        case DISTINCT:
          return false;
        default:
          return true;
      }
    }

    @Override
    public @Nullable Void initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public Write<?> writeBlock(Output<?> output, @Nullable Void value, WamlWriterOptions options) {
      return Write.done();
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "voidFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final VoidFormat INSTANCE = new VoidFormat();

  }

  static final class NullFormat implements WamlFormat<Object>, WamlTupleParser<Object, Object, Object>, WamlTupleWriter<Object, Object>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "unit";
    }

    @Override
    public WamlParser<Object> valueParser() {
      return this;
    }

    @Override
    public @Nullable Object emptyTuple(@Nullable Object attrs) throws WamlException {
      return null;
    }

    @Override
    public @Nullable Object unaryTuple(@Nullable Object attrs, @Nullable Object value) throws WamlException {
      return null;
    }

    @SuppressWarnings("NullAway")
    @Override
    public @Nullable Object tupleBuilder(@Nullable Object attrs) throws WamlException {
      return null;
    }

    @SuppressWarnings("NullAway")
    @Override
    public @Nullable Object appendValue(@Nullable Object builder, @Nullable Object value) {
      return builder;
    }

    @SuppressWarnings("NullAway")
    @Override
    public @Nullable Object appendField(@Nullable Object builder, @Nullable Object key, @Nullable Object value) {
      return builder;
    }

    @Override
    public @Nullable Object buildTuple(@Nullable Object attrs, @Nullable Object builder) throws WamlException {
      return builder;
    }

    @Override
    public @Nullable Iterator<? extends Map.Entry<String, Object>> getFields(@Nullable Object value) {
      return null;
    }

    @Override
    public WamlWriter<String> keyWriter() {
      return WamlLang.keyFormat();
    }

    @Override
    public WamlWriter<Object> valueWriter() {
      return this;
    }

    @Override
    public boolean filter(@Nullable Object value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
        case TRUTHY:
        case DISTINCT:
          return value != null;
        default:
          return true;
      }
    }

    @Override
    public @Nullable Object initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable Object value, WamlWriterOptions options) {
      return this.writeUnit(output, attrs, options);
    }

    @Override
    public Write<?> writeBlock(Output<?> output, @Nullable Object value, WamlWriterOptions options) {
      return Write.done();
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "nullFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final NullFormat INSTANCE = new NullFormat();

  }

  static final class IdentifierFormat implements WamlFormat<Object>, WamlIdentifierParser<Object>, WamlIdentifierWriter<Object>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "identifier";
    }

    @Override
    public @Nullable Object fromIdentifier(@Nullable Object attrs, String value, WamlParserOptions options) {
      switch (value) {
        case "undefined":
          return null;
        case "null":
          return null;
        case "false":
          return Boolean.FALSE;
        case "true":
          return Boolean.TRUE;
        default:
          if (options.exprsEnabled()) {
            return new ChildExpr(ContextExpr.of(), Term.of(value));
          }
          return value;
      }
    }

    @Override
    public @Nullable String intoIdentifier(@Nullable Object value) {
      if (value instanceof Boolean) {
        return ((Boolean) value).booleanValue() ? "true" : "false";
      } else if (value instanceof ChildExpr expr && expr.scope().equals(ContextExpr.of())
              && expr.key().isValidString()) {
        return expr.key().stringValue();
      }
      return null;
    }

    @Override
    public boolean filter(@Nullable Object value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null;
        case TRUTHY:
        case DISTINCT:
          return value != null && (value instanceof Boolean ? ((Boolean) value).booleanValue() : true);
        default:
          return true;
      }
    }

    @Override
    public @Nullable Object initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "identifierFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final IdentifierFormat INSTANCE = new IdentifierFormat();

  }

  static final class BooleanFormat implements WamlFormat<Boolean>, WamlIdentifierParser<Boolean>, WamlIdentifierWriter<Boolean>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "boolean";
    }

    @Override
    public Boolean fromIdentifier(@Nullable Object attrs, String value, WamlParserOptions options) {
      if (value.length() == 0 || "false".equals(value)) {
        return Boolean.FALSE;
      } else {
        return Boolean.TRUE;
      }
    }

    @Override
    public @Nullable String intoIdentifier(@Nullable Boolean value) {
      if (value == null) {
        return null;
      }
      return value.booleanValue() ? "true" : "false";
    }

    @Override
    public boolean filter(@Nullable Boolean value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null;
        case TRUTHY:
        case DISTINCT:
          return value != null && value.booleanValue();
        default:
          return true;
      }
    }

    @Override
    public Boolean initializer(@Nullable Object attrs) {
      return Boolean.FALSE;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "booleanFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final BooleanFormat INSTANCE = new BooleanFormat();

  }

  static final class ByteFormat implements WamlFormat<Byte>, WamlNumberParser<Byte>, WamlNumberWriter<Byte>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Byte fromInteger(@Nullable Object attrs, long value) {
      return Byte.valueOf((byte) value);
    }

    @Override
    public Byte fromHexadecimal(@Nullable Object attrs, long value, int digits) {
      return Byte.valueOf((byte) value);
    }

    @Override
    public Byte fromBigInteger(@Nullable Object attrs, String value) {
      return Byte.valueOf(new BigInteger(value).byteValue());
    }

    @Override
    public Byte fromDecimal(@Nullable Object attrs, String value) {
      return Byte.valueOf((byte) Double.parseDouble(value));
    }

    @Override
    public @Nullable Number intoNumber(@Nullable Byte value) {
      return value;
    }

    @Override
    public boolean filter(@Nullable Byte value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null;
        case TRUTHY:
        case DISTINCT:
          return value != null && value.byteValue() != (byte) 0;
        default:
          return true;
      }
    }

    @Override
    public Byte initializer(@Nullable Object attrs) {
      return Byte.valueOf((byte) 0);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable Byte value, WamlWriterOptions options) {
      if (value == null) {
        return this.writeUnit(output, attrs, options);
      }
      return this.writeInt(output, attrs, value.intValue(), options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "byteFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ByteFormat INSTANCE = new ByteFormat();

  }

  static final class CharFormat implements WamlFormat<Character>, WamlNumberParser<Character>, WamlNumberWriter<Character>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Character fromInteger(@Nullable Object attrs, long value) {
      return Character.valueOf((char) value);
    }

    @Override
    public Character fromHexadecimal(@Nullable Object attrs, long value, int digits) {
      return Character.valueOf((char) value);
    }

    @Override
    public Character fromBigInteger(@Nullable Object attrs, String value) {
      return Character.valueOf((char) new BigInteger(value).intValue());
    }

    @Override
    public Character fromDecimal(@Nullable Object attrs, String value) {
      return Character.valueOf((char) Double.parseDouble(value));
    }

    @Override
    public @Nullable Number intoNumber(@Nullable Character value) {
      if (value == null) {
        return null;
      }
      return Integer.valueOf((int) value.charValue());
    }

    @Override
    public boolean filter(@Nullable Character value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null;
        case TRUTHY:
        case DISTINCT:
          return value != null && value.charValue() != (char) 0;
        default:
          return true;
      }
    }

    @Override
    public Character initializer(@Nullable Object attrs) {
      return Character.valueOf((char) 0);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable Character value, WamlWriterOptions options) {
      if (value == null) {
        return this.writeUnit(output, attrs, options);
      }
      return this.writeInt(output, attrs, (int) value.charValue(), options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "charFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final CharFormat INSTANCE = new CharFormat();

  }

  static final class ShortFormat implements WamlFormat<Short>, WamlNumberParser<Short>, WamlNumberWriter<Short>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Short fromInteger(@Nullable Object attrs, long value) {
      return Short.valueOf((short) value);
    }

    @Override
    public Short fromHexadecimal(@Nullable Object attrs, long value, int digits) {
      return Short.valueOf((short) value);
    }

    @Override
    public Short fromBigInteger(@Nullable Object attrs, String value) {
      return Short.valueOf(new BigInteger(value).shortValue());
    }

    @Override
    public Short fromDecimal(@Nullable Object attrs, String value) {
      return Short.valueOf((short) Double.parseDouble(value));
    }

    @Override
    public @Nullable Number intoNumber(@Nullable Short value) {
      return value;
    }

    @Override
    public boolean filter(@Nullable Short value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null;
        case TRUTHY:
        case DISTINCT:
          return value != null && value.shortValue() != (short) 0;
        default:
          return true;
      }
    }

    @Override
    public Short initializer(@Nullable Object attrs) {
      return Short.valueOf((short) 0);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable Short value, WamlWriterOptions options) {
      if (value == null) {
        return this.writeUnit(output, attrs, options);
      }
      return this.writeInt(output, attrs, value.intValue(), options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "shortFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ShortFormat INSTANCE = new ShortFormat();

  }

  static final class IntFormat implements WamlFormat<Integer>, WamlNumberParser<Integer>, WamlNumberWriter<Integer>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Integer fromInteger(@Nullable Object attrs, long value) {
      return Integer.valueOf((int) value);
    }

    @Override
    public Integer fromHexadecimal(@Nullable Object attrs, long value, int digits) {
      return Integer.valueOf((int) value);
    }

    @Override
    public Integer fromBigInteger(@Nullable Object attrs, String value) {
      return Integer.valueOf(new BigInteger(value).intValue());
    }

    @Override
    public Integer fromDecimal(@Nullable Object attrs, String value) {
      return Integer.valueOf((int) Double.parseDouble(value));
    }

    @Override
    public @Nullable Number intoNumber(@Nullable Integer value) {
      return value;
    }

    @Override
    public boolean filter(@Nullable Integer value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null;
        case TRUTHY:
        case DISTINCT:
          return value != null && value.intValue() != 0;
        default:
          return true;
      }
    }

    @Override
    public Integer initializer(@Nullable Object attrs) {
      return Integer.valueOf(0);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable Integer value, WamlWriterOptions options) {
      if (value == null) {
        return this.writeUnit(output, attrs, options);
      }
      return this.writeInt(output, attrs, value.intValue(), options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "intFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final IntFormat INSTANCE = new IntFormat();

  }

  static final class LongFormat implements WamlFormat<Long>, WamlNumberParser<Long>, WamlNumberWriter<Long>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Long fromInteger(@Nullable Object attrs, long value) {
      return Long.valueOf(value);
    }

    @Override
    public Long fromHexadecimal(@Nullable Object attrs, long value, int digits) {
      return Long.valueOf(value);
    }

    @Override
    public Long fromBigInteger(@Nullable Object attrs, String value) {
      return Long.valueOf(new BigInteger(value).longValue());
    }

    @Override
    public Long fromDecimal(@Nullable Object attrs, String value) {
      return Long.valueOf((long) Double.parseDouble(value));
    }

    @Override
    public @Nullable Number intoNumber(@Nullable Long value) {
      return value;
    }

    @Override
    public boolean filter(@Nullable Long value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null;
        case TRUTHY:
        case DISTINCT:
          return value != null && value.longValue() != 0L;
        default:
          return true;
      }
    }

    @Override
    public Long initializer(@Nullable Object attrs) {
      return Long.valueOf(0L);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable Long value, WamlWriterOptions options) {
      if (value == null) {
        return this.writeUnit(output, attrs, options);
      }
      return this.writeLong(output, attrs, value.longValue(), options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "longFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final LongFormat INSTANCE = new LongFormat();

  }

  static final class FloatFormat implements WamlFormat<Float>, WamlNumberParser<Float>, WamlNumberWriter<Float>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Float fromInteger(@Nullable Object attrs, long value) {
      return Float.valueOf((float) value);
    }

    @Override
    public Float fromHexadecimal(@Nullable Object attrs, long value, int digits) {
      if (digits <= 8) {
        return Float.valueOf(Float.intBitsToFloat((int) value));
      } else {
        return Float.valueOf((float) Double.longBitsToDouble(value));
      }
    }

    @Override
    public Float fromBigInteger(@Nullable Object attrs, String value) {
      return Float.valueOf(new BigInteger(value).floatValue());
    }

    @Override
    public Float fromDecimal(@Nullable Object attrs, String value) {
      return Float.valueOf((float) Double.parseDouble(value));
    }

    @Override
    public @Nullable Number intoNumber(@Nullable Float value) {
      return value;
    }

    @Override
    public boolean filter(@Nullable Float value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null;
        case TRUTHY:
        case DISTINCT:
          return value != null && value.floatValue() != 0.0f;
        default:
          return true;
      }
    }

    @Override
    public Float initializer(@Nullable Object attrs) {
      return Float.valueOf(0.0f);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable Float value, WamlWriterOptions options) {
      if (value == null) {
        return this.writeUnit(output, attrs, options);
      }
      return this.writeFloat(output, attrs, value.floatValue(), options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "floatFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final FloatFormat INSTANCE = new FloatFormat();

  }

  static final class DoubleFormat implements WamlFormat<Double>, WamlNumberParser<Double>, WamlNumberWriter<Double>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Double fromInteger(@Nullable Object attrs, long value) {
      return Double.valueOf((double) value);
    }

    @Override
    public Double fromHexadecimal(@Nullable Object attrs, long value, int digits) {
      if (digits <= 8) {
        return Double.valueOf((double) Float.intBitsToFloat((int) value));
      } else {
        return Double.valueOf(Double.longBitsToDouble(value));
      }
    }

    @Override
    public Double fromBigInteger(@Nullable Object attrs, String value) {
      return Double.valueOf(new BigInteger(value).doubleValue());
    }

    @Override
    public Double fromDecimal(@Nullable Object attrs, String value) {
      return Double.valueOf(Double.parseDouble(value));
    }

    @Override
    public @Nullable Number intoNumber(@Nullable Double value) {
      return value;
    }

    @Override
    public boolean filter(@Nullable Double value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null;
        case TRUTHY:
        case DISTINCT:
          return value != null && value.doubleValue() != 0.0;
        default:
          return true;
      }
    }

    @Override
    public Double initializer(@Nullable Object attrs) {
      return Double.valueOf(0.0);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable Double value, WamlWriterOptions options) {
      if (value == null) {
        return this.writeUnit(output, attrs, options);
      }
      return this.writeDouble(output, attrs, value.doubleValue(), options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "doubleFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final DoubleFormat INSTANCE = new DoubleFormat();

  }

  static final class NumberFormat implements WamlFormat<Number>, WamlNumberParser<Number>, WamlNumberWriter<Number>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Number fromInteger(@Nullable Object attrs, long value) {
      if (value == (long) (int) value) {
        return Integer.valueOf((int) value);
      } else {
        return Long.valueOf(value);
      }
    }

    @Override
    public Number fromHexadecimal(@Nullable Object attrs, long value, int digits) {
      if (value == (long) (int) value && digits <= 8) {
        return Integer.valueOf((int) value);
      } else {
        return Long.valueOf(value);
      }
    }

    @Override
    public Number fromBigInteger(@Nullable Object attrs, String value) {
      return new BigInteger(value);
    }

    @Override
    public Number fromDecimal(@Nullable Object attrs, String value) {
      final double x = Double.parseDouble(value);
      if (x == (double) (float) x) {
        return Float.valueOf((float) x);
      } else {
        return Double.valueOf(x);
      }
    }

    @Override
    public @Nullable Number intoNumber(@Nullable Number value) {
      return value;
    }

    @Override
    public boolean filter(@Nullable Number value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null;
        case TRUTHY:
        case DISTINCT:
          if (value == null) {
            return false;
          } else if (value instanceof Byte) {
            return ((Byte) value).byteValue() != (byte) 0;
          } else if (value instanceof Short) {
            return ((Short) value).shortValue() != (short) 0;
          } else if (value instanceof Integer) {
            return ((Integer) value).intValue() != 0;
          } else if (value instanceof Long) {
            return ((Long) value).longValue() != 0L;
          } else if (value instanceof Float) {
            return ((Float) value).floatValue() != 0.0f;
          } else if (value instanceof Double) {
            return ((Double) value).doubleValue() != 0.0;
          } else if (value instanceof BigInteger) {
            return !((BigInteger) value).equals(BigInteger.ZERO);
          }
          return true;
        default:
          return true;
      }
    }

    @Override
    public @Nullable Number initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable Number value, WamlWriterOptions options) {
      if (value == null) {
        return this.writeUnit(output, attrs, options);
      } else if (value instanceof Byte || value instanceof Short || value instanceof Integer) {
        return this.writeInt(output, attrs, value.intValue(), options);
      } else if (value instanceof Long) {
        return this.writeLong(output, attrs, value.longValue(), options);
      } else if (value instanceof Float) {
        return this.writeFloat(output, attrs, value.floatValue(), options);
      } else if (value instanceof Double) {
        return this.writeDouble(output, attrs, value.doubleValue(), options);
      } else if (value instanceof BigInteger) {
        return this.writeBigInteger(output, attrs, (BigInteger) value, options);
      }
      return this.writeNumber(output, attrs, value, options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "numberFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final NumberFormat INSTANCE = new NumberFormat();

  }

  static final class StringFormat implements WamlFormat<String>, WamlStringParser<StringBuilder, String>, WamlStringWriter<String>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "string";
    }

    @Override
    public StringBuilder stringBuilder(@Nullable Object attrs) {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public String buildString(@Nullable Object attrs, StringBuilder builder) {
      return WamlLang.stringCache().put(builder.toString());
    }

    @Override
    public @Nullable String initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public boolean filter(@Nullable String value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null;
        case TRUTHY:
        case DISTINCT:
          return value != null && value.length() != 0;
        default:
          return true;
      }
    }

    @Override
    public @Nullable String intoString(@Nullable String value) {
      return value;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "stringFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final StringFormat INSTANCE = new StringFormat();

  }

  static final class KeyFormat implements WamlFormat<String>, WamlIdentifierParser<String>, WamlIdentifierWriter<String>, WamlStringWriter<String>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "key";
    }

    @Override
    public WamlStringParser<?, String> stringParser() {
      return KeyStringParser.INSTANCE;
    }

    @Override
    public String fromIdentifier(@Nullable Object attrs, String value, WamlParserOptions options) {
      return WamlLang.keyCache().put(value);
    }

    @Override
    public @Nullable String intoIdentifier(@Nullable String value) {
      return value;
    }

    @Override
    public @Nullable String intoString(@Nullable String value) {
      return value;
    }

    @Override
    public boolean filter(@Nullable String value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null;
        case TRUTHY:
        case DISTINCT:
          return value != null && value.length() != 0;
        default:
          return true;
      }
    }

    @Override
    public @Nullable String initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public Parse<String> parse(Input input, WamlParserOptions options) {
      return this.parseValue(input, options);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable String value, WamlWriterOptions options) {
      if (value != null && Term.isIdentifier(value) && !options.keywords().contains(value)) {
        return WamlIdentifierWriter.super.write(output, attrs, value, options);
      }
      return WamlStringWriter.super.write(output, attrs, value, options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "keyFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final KeyFormat INSTANCE = new KeyFormat();

  }

  static final class KeyStringParser implements WamlStringParser<StringBuilder, String>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "key";
    }

    @Override
    public StringBuilder stringBuilder(@Nullable Object attrs) {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public String buildString(@Nullable Object attrs, StringBuilder builder) {
      return WamlLang.keyCache().put(builder.toString());
    }

    @Override
    public @Nullable String initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "keyFormat").endInvoke()
              .beginInvoke("stringParser").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final KeyStringParser INSTANCE = new KeyStringParser();

  }

  static final class ByteBufferFormat implements WamlFormat<ByteBuffer>, WamlStringParser<Output<ByteBuffer>, ByteBuffer>, WamlStringWriter<ByteBuffer>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "base64";
    }

    @Override
    public @Nullable Object getAttrs(@Nullable ByteBuffer value) {
      return Attrs.of("blob", Repr.unit());
    }

    @Override
    public Output<ByteBuffer> stringBuilder(@Nullable Object attrs) {
      return Base64.standard().decodedOutput(new ByteBufferOutput());
    }

    @Override
    public Output<ByteBuffer> appendCodePoint(Output<ByteBuffer> builder, int c) {
      if (builder.isCont()) {
        builder.write(c);
      }
      return builder;
    }

    @Override
    public @Nullable ByteBuffer buildString(@Nullable Object attrs, Output<ByteBuffer> builder) throws WamlException {
      try {
        return builder.get();
      } catch (OutputException cause) {
        throw new WamlException("malformed base-64 string", cause);
      }
    }

    @Override
    public @Nullable String intoString(@Nullable ByteBuffer value) {
      if (value == null) {
        return null;
      }
      final StringOutput output = new StringOutput();
      Base64.standard().writeByteBuffer(output, value).assertDone();
      return output.get();
    }

    @Override
    public boolean filter(@Nullable ByteBuffer value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
        case TRUTHY:
          return value != null;
        case DISTINCT:
          return value != null && value.hasRemaining();
        default:
          return true;
      }
    }

    @Override
    public @Nullable ByteBuffer initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "byteBufferFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ByteBufferFormat INSTANCE = new ByteBufferFormat();

  }

  static final class InstantFormat implements WamlFormat<Instant>, WamlStringParser<StringBuilder, Instant>, WamlStringWriter<Instant>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "date-time";
    }

    @Override
    public StringBuilder stringBuilder(@Nullable Object attrs) {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public Instant buildString(@Nullable Object attrs, StringBuilder builder) throws WamlException {
      try {
        return Instant.parse(builder.toString());
      } catch (DateTimeParseException cause) {
        throw new WamlException(cause);
      }
    }

    @Override
    public @Nullable String intoString(@Nullable Instant value) {
      if (value == null) {
        return null;
      }
      return value.toString();
    }

    @Override
    public boolean filter(@Nullable Instant value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null;
        case TRUTHY:
        case DISTINCT:
          return value != null && value.toEpochMilli() != 0L;
        default:
          return true;
      }
    }

    @Override
    public @Nullable Instant initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "instantFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final InstantFormat INSTANCE = new InstantFormat();

  }

  static final class InetAddressFormat implements WamlFormat<InetAddress>, WamlStringParser<StringBuilder, InetAddress>, WamlStringWriter<InetAddress>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "InetAddress";
    }

    @Override
    public StringBuilder stringBuilder(@Nullable Object attrs) {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public InetAddress buildString(@Nullable Object attrs, StringBuilder builder) throws WamlException {
      try {
        return InetAddress.getByName(builder.toString());
      } catch (UnknownHostException | SecurityException cause) {
        throw new WamlException(cause);
      }
    }

    @Override
    public @Nullable String intoString(@Nullable InetAddress value) {
      if (value == null) {
        return null;
      }
      return value.getHostAddress();
    }

    @Override
    public @Nullable InetAddress initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "inetAddress").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final InetAddressFormat INSTANCE = new InetAddressFormat();

  }

  static final class InetSocketAddressFormat implements WamlFormat<InetSocketAddress>, WamlStringParser<StringBuilder, InetSocketAddress>, WamlStringWriter<InetSocketAddress>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "InetSocketAddress";
    }

    @Override
    public StringBuilder stringBuilder(@Nullable Object attrs) {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public @Nullable InetSocketAddress buildString(@Nullable Object attrs, StringBuilder builder) throws WamlException {
      final String address = builder.toString();
      final int colonIndex = address.indexOf(':');
      if (colonIndex >= 0) {
        try {
          final String host = address.substring(0, colonIndex);
          final int port = Integer.parseInt(address.substring(colonIndex + 1));
          return InetSocketAddress.createUnresolved(host, port);
        } catch (IllegalArgumentException cause) {
          throw new WamlException(cause);
        }
      }
      return null;
    }

    @Override
    public @Nullable String intoString(@Nullable InetSocketAddress value) {
      if (value == null) {
        return null;
      }
      final StringBuilder builder = new StringBuilder();
      // Construct a host:port string without triggering address resolution.
      final String hostString = value.getHostString();
      final InetAddress inetAddress = value.getAddress();
      if (inetAddress instanceof Inet6Address && hostString.equals(inetAddress.getHostAddress())) {
        // Host is an IPv6 literal; enclose it in square brackets.
        builder.append('[').append(hostString).append(']');
      } else {
        // Host is either a hostname or an IPv4 literal.
        builder.append(hostString);
      }
      builder.append(':').append(value.getPort());
      return builder.toString();
    }

    @Override
    public @Nullable InetSocketAddress initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "inetSocketAddress").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final InetSocketAddressFormat INSTANCE = new InetSocketAddressFormat();

  }

  static final class MarkupFormat implements WamlFormat<List<Object>>, WamlMarkupParser<Object, List<Object>, List<Object>>, WamlMarkupWriter<Object, List<Object>>, WriteSource {

    final WamlFormat<Object> nodeFormat;

    MarkupFormat(WamlFormat<Object> nodeFormat) {
      this.nodeFormat = nodeFormat;
    }

    @Override
    public @Nullable String typeName() {
      return "markup";
    }

    @Override
    public WamlParser<Object> nodeParser() {
      return this.nodeFormat;
    }

    @Override
    public List<Object> markupBuilder(@Nullable Object attrs) {
      return new ArrayList<Object>();
    }

    @Override
    public List<Object> appendNode(List<Object> builder, @Nullable Object node) {
      builder.add(node);
      return builder;
    }

    @Override
    public List<Object> appendText(List<Object> builder, String text) {
      builder.add(text);
      return builder;
    }

    @Override
    public List<Object> buildMarkup(@Nullable Object attrs, List<Object> builder) {
      return builder;
    }

    @Override
    public WamlWriter<Object> nodeWriter() {
      return this.nodeFormat;
    }

    @Override
    public @Nullable String asText(@Nullable Object node) {
      if (node instanceof String) {
        return (String) node;
      }
      return null;
    }

    @Override
    public @Nullable Iterator<? extends Object> intoNodes(@Nullable List<Object> value) {
      if (value == null) {
        return null;
      }
      return value.iterator();
    }

    @Override
    public boolean filter(@Nullable List<Object> value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
        case TRUTHY:
          return value != null;
        case DISTINCT:
          return value != null && !value.isEmpty();
        default:
          return true;
      }
    }

    @Override
    public @Nullable List<Object> initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "markupFormat")
              .appendArgument(this.nodeFormat)
              .endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

  }

  static final class ArrayFormat<E, T> implements WamlFormat<T>, WamlArrayParser<E, ArrayBuilder<E, T>, T>, WamlArrayWriter<E, T>, WriteSource {

    final Class<?> componentClass;
    final WamlFormat<E> componentFormat;

    ArrayFormat(Class<?> componentClass, WamlFormat<E> componentFormat) {
      this.componentClass = componentClass;
      this.componentFormat = componentFormat;
    }

    @Override
    public @Nullable String typeName() {
      return "array";
    }

    @Override
    public WamlParser<E> elementParser() {
      return this.componentFormat;
    }

    @Override
    public ArrayBuilder<E, T> arrayBuilder(@Nullable Object attrs) {
      return new ArrayBuilder<E, T>(this.componentClass);
    }

    @Override
    public ArrayBuilder<E, T> appendElement(ArrayBuilder<E, T> builder, @Nullable E element) {
      builder.add(element);
      return builder;
    }

    @Override
    public T buildArray(@Nullable Object attrs, ArrayBuilder<E, T> builder) {
      return builder.build();
    }

    @Override
    public @Nullable Iterator<? extends E> getElements(@Nullable T value) {
      if (value == null) {
        return null;
      }
      return Assume.conforms(ArrayIterator.of(value));
    }

    @Override
    public WamlWriter<E> elementWriter() {
      return this.componentFormat;
    }

    @Override
    public boolean filter(@Nullable T value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
        case TRUTHY:
          return value != null;
        case DISTINCT:
          return value != null && Array.getLength(value) != 0;
        default:
          return true;
      }
    }

    @Override
    public @Nullable T initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "arrayFormat")
              .appendArgument(this.componentClass)
              .appendArgument(this.componentFormat)
              .endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

  }

  static final class TupleFormat implements WamlFormat<Object>, WamlTupleParser<Object, TupleBuilder, Object>, WamlTupleWriter<Object, Object>, WriteSource {

    final WamlFormat<Object> valueFormat;

    TupleFormat(WamlFormat<Object> valueFormat) {
      this.valueFormat = valueFormat;
    }

    @Override
    public @Nullable String typeName() {
      return "tuple";
    }

    @Override
    public WamlParser<Object> valueParser() {
      return this.valueFormat;
    }

    @Override
    public @Nullable Object emptyTuple(@Nullable Object attrs) {
      return null;
    }

    @Override
    public @Nullable Object unaryTuple(@Nullable Object attrs, @Nullable Object value) {
      return value;
    }

    @Override
    public TupleBuilder tupleBuilder(@Nullable Object attrs) {
      return new TupleBuilder();
    }

    @Override
    public TupleBuilder appendValue(TupleBuilder builder, @Nullable Object value) {
      builder.appendValue(value);
      return builder;
    }

    @Override
    public TupleBuilder appendField(TupleBuilder builder, @Nullable Object key, @Nullable Object value) throws WamlException {
      builder.appendField(key, value);
      return builder;
    }

    @Override
    public @Nullable Object buildTuple(@Nullable Object attrs, TupleBuilder builder) {
      return builder.build();
    }

    @Override
    public @Nullable Iterator<? extends Map.Entry<String, Object>> getFields(@Nullable Object value) throws WamlException {
      throw new WamlException("unsupported value: " + value);
    }

    @Override
    public WamlWriter<String> keyWriter() {
      return WamlLang.keyFormat();
    }

    @Override
    public WamlWriter<Object> valueWriter() {
      return this.valueFormat;
    }

    @Override
    public boolean filter(@Nullable Object value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
        case TRUTHY:
          return value != null;
        case DISTINCT:
          if (value == null) {
            return false;
          } else if (value instanceof List<?>) {
            return !((List<?>) value).isEmpty();
          } else if (value instanceof Map<?, ?>) {
            return !((Map<?, ?>) value).isEmpty();
          }
          return true;
        default:
          return true;
      }
    }

    @Override
    public @Nullable Object initializer(@Nullable Object attrs) {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlLang", "tupleFormat")
              .appendArgument(this.valueFormat)
              .endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

  }

  static final class TupleBuilder {

    @Nullable ArrayList<Object> list;
    @Nullable UniformMap<String, Object> map;

    TupleBuilder() {
      this.list = null;
      this.map = null;
    }

    void appendValue(@Nullable Object value) {
      this.map = null;
      if (this.list == null) {
        this.list = new ArrayList<Object>();
      }
      this.list.add(value);
    }

    void appendField(@Nullable Object key, @Nullable Object value) throws WamlException {
      String keyString = null;
      if (key instanceof String) {
        keyString = (String) key;
      } else if (key instanceof ChildExpr && ((ChildExpr) key).scope() instanceof ContextExpr) {
        final Term childKey = ((ChildExpr) key).key();
        if (childKey.isValidString()) {
          keyString = childKey.stringValue();
        }
      }
      if (keyString == null) {
        throw new WamlException("unsupported key: " + key);
      }

      if (this.list == null) {
        this.list = new ArrayList<Object>();
        this.map = new UniformMap<String, Object>();
      }
      this.list.add(new SimpleEntry<String, Object>(keyString, value));
      if (this.map != null) {
        this.map.put(keyString, value);
      }
    }

    @Nullable Object build() {
      if (this.map != null) {
        return this.map;
      } else if (this.list != null) {
        return this.list;
      }
      return null;
    }

  }

}
