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
import java.util.Iterator;
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
import swim.decl.FilterMode;
import swim.expr.ChildExpr;
import swim.expr.ContextExpr;
import swim.term.Term;
import swim.util.ArrayBuilder;
import swim.util.ArrayIterator;
import swim.util.Assume;
import swim.util.CacheSet;
import swim.util.LruCacheSet;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JsonLang implements JsonProvider, ToSource {

  final JsonMetaCodec metaCodec;
  final int priority;

  private JsonLang(JsonMetaCodec metaCodec, int priority) {
    this.metaCodec = metaCodec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable JsonFormat<?> resolveJsonFormat(Type type) throws JsonProviderException {
    if (type instanceof GenericArrayType) {
      return JsonLang.arrayFormat(this.metaCodec, ((GenericArrayType) type).getGenericComponentType());
    } else if (type instanceof Class<?>) {
      final Class<?> classType = (Class<?>) type;
      if (classType.isArray()) {
        return JsonLang.arrayFormat(this.metaCodec, classType.getComponentType());
      } else if (classType == void.class || classType == Void.TYPE) {
        return JsonLang.voidFormat();
      } else if (classType == Boolean.class || classType == Boolean.TYPE) {
        return JsonLang.booleanFormat();
      } else if (classType == Byte.class || classType == Byte.TYPE) {
        return JsonLang.byteFormat();
      } else if (classType == Character.class || classType == Character.TYPE) {
        return JsonLang.charFormat();
      } else if (classType == Short.class || classType == Short.TYPE) {
        return JsonLang.shortFormat();
      } else if (classType == Integer.class || classType == Integer.TYPE) {
        return JsonLang.intFormat();
      } else if (classType == Long.class || classType == Long.TYPE) {
        return JsonLang.longFormat();
      } else if (classType == Float.class || classType == Float.TYPE) {
        return JsonLang.floatFormat();
      } else if (classType == Double.class || classType == Double.TYPE) {
        return JsonLang.doubleFormat();
      } else if (classType == String.class) {
        return JsonLang.stringFormat();
      } else if (Number.class.isAssignableFrom(classType)) {
        return JsonLang.numberFormat();
      } else if (ByteBuffer.class.isAssignableFrom(classType)) {
        return JsonLang.byteBufferFormat();
      } else if (Instant.class.isAssignableFrom(classType)) {
        return JsonLang.instantFormat();
      } else if (InetAddress.class.isAssignableFrom(classType)) {
        return JsonLang.inetAddressFormat();
      } else if (InetSocketAddress.class.isAssignableFrom(classType)) {
        return JsonLang.inetSocketAddressFormat();
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonLang", "provider")
            .appendArgument(this.metaCodec);
    if (this.priority != BUILTIN_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static JsonLang provider(JsonMetaCodec metaCodec, int priority) {
    return new JsonLang(metaCodec, priority);
  }

  public static JsonLang provider(JsonMetaCodec metaCodec) {
    return new JsonLang(metaCodec, BUILTIN_PRIORITY);
  }

  public static JsonFormat<Void> voidFormat() {
    return VoidFormat.INSTANCE;
  }

  public static JsonFormat<Object> nullFormat() {
    return NullFormat.INSTANCE;
  }

  public static JsonFormat<Object> identifierFormat() {
    return IdentifierFormat.INSTANCE;
  }

  public static JsonFormat<Boolean> booleanFormat() {
    return BooleanFormat.INSTANCE;
  }

  public static JsonFormat<Byte> byteFormat() {
    return ByteFormat.INSTANCE;
  }

  public static JsonFormat<Character> charFormat() {
    return CharFormat.INSTANCE;
  }

  public static JsonFormat<Short> shortFormat() {
    return ShortFormat.INSTANCE;
  }

  public static JsonFormat<Integer> intFormat() {
    return IntFormat.INSTANCE;
  }

  public static JsonFormat<Long> longFormat() {
    return LongFormat.INSTANCE;
  }

  public static JsonFormat<Float> floatFormat() {
    return FloatFormat.INSTANCE;
  }

  public static JsonFormat<Double> doubleFormat() {
    return DoubleFormat.INSTANCE;
  }

  public static JsonFormat<Number> numberFormat() {
    return NumberFormat.INSTANCE;
  }

  public static JsonFormat<String> stringFormat() {
    return StringFormat.INSTANCE;
  }

  public static JsonFormat<String> keyFormat() {
    return KeyFormat.INSTANCE;
  }

  public static JsonFormat<ByteBuffer> byteBufferFormat() {
    return ByteBufferFormat.INSTANCE;
  }

  public static JsonFormat<Instant> instantFormat() {
    return InstantFormat.INSTANCE;
  }

  public static JsonFormat<InetAddress> inetAddressFormat() {
    return InetAddressFormat.INSTANCE;
  }

  public static JsonFormat<InetSocketAddress> inetSocketAddressFormat() {
    return InetSocketAddressFormat.INSTANCE;
  }

  public static <E, T> JsonFormat<T> arrayFormat(Class<?> componentClass, JsonFormat<E> componentFormat) {
    return new ArrayFormat<E, T>(componentClass, componentFormat);
  }

  public static <T> @Nullable JsonFormat<T> arrayFormat(JsonMetaCodec metaCodec, Type componentType) throws JsonProviderException {
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
      throw new JsonProviderException("unsupported array component type: " + componentType);
    }
    final JsonFormat<?> componentFormat = metaCodec.getJsonFormat(componentType);
    return new ArrayFormat<>((Class<?>) componentType, componentFormat);
  }

  static final ThreadLocal<CacheSet<String>> STRING_CACHE = new ThreadLocal<CacheSet<String>>();

  public static CacheSet<String> stringCache() {
    CacheSet<String> stringCache = STRING_CACHE.get();
    if (stringCache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.json.string.cache.size"));
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
        cacheSize = Integer.parseInt(System.getProperty("swim.json.key.cache.size"));
      } catch (NumberFormatException cause) {
        cacheSize = 512;
      }
      keyCache = new LruCacheSet<String>(cacheSize);
      KEY_CACHE.set(keyCache);
    }
    return keyCache;
  }

  static final class VoidFormat implements JsonFormat<Void>, JsonIdentifierParser<Void>, JsonIdentifierWriter<Void>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "undefined";
    }

    @Override
    public @Nullable Void fromIdentifier(String value, JsonParserOptions options) throws JsonException {
      if ("undefined".equals(value)) {
        return null;
      }
      throw new JsonException("unsupported identifier: " + value);
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
    public @Nullable Void initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "voidFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final VoidFormat INSTANCE = new VoidFormat();

  }

  static final class NullFormat implements JsonFormat<Object>, JsonIdentifierParser<Object>, JsonIdentifierWriter<Object>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "null";
    }

    @Override
    public @Nullable Object fromIdentifier(String value, JsonParserOptions options) throws JsonException {
      if ("null".equals(value)) {
        return null;
      }
      throw new JsonException("unsupported identifier: " + value);
    }

    @Override
    public @Nullable String intoIdentifier(@Nullable Object value) {
      return "null";
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
    public @Nullable Object initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "nullFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final NullFormat INSTANCE = new NullFormat();

  }

  static final class IdentifierFormat implements JsonFormat<Object>, JsonIdentifierParser<Object>, JsonIdentifierWriter<Object>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "identifier";
    }

    @Override
    public @Nullable Object fromIdentifier(String value, JsonParserOptions options) throws JsonException {
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
          throw new JsonException("unsupported identifier: " + value);
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
    public @Nullable Object initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "identifierFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final IdentifierFormat INSTANCE = new IdentifierFormat();

  }

  static final class BooleanFormat implements JsonFormat<Boolean>, JsonIdentifierParser<Boolean>, JsonIdentifierWriter<Boolean>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "boolean";
    }

    @Override
    public Boolean fromIdentifier(String value, JsonParserOptions options) {
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
    public Boolean initializer() {
      return Boolean.FALSE;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "booleanFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final BooleanFormat INSTANCE = new BooleanFormat();

  }

  static final class ByteFormat implements JsonFormat<Byte>, JsonNumberParser<Byte>, JsonNumberWriter<Byte>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Byte fromInteger(long value) {
      return Byte.valueOf((byte) value);
    }

    @Override
    public Byte fromHexadecimal(long value, int digits) {
      return Byte.valueOf((byte) value);
    }

    @Override
    public Byte fromBigInteger(String value) {
      return Byte.valueOf(new BigInteger(value).byteValue());
    }

    @Override
    public Byte fromDecimal(String value) {
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
    public Byte initializer() {
      return Byte.valueOf((byte) 0);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Byte value, JsonWriterOptions options) {
      if (value == null) {
        return this.writeNull(output);
      }
      return this.writeInt(output, value.intValue());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "byteFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final ByteFormat INSTANCE = new ByteFormat();

  }

  static final class CharFormat implements JsonFormat<Character>, JsonNumberParser<Character>, JsonNumberWriter<Character>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Character fromInteger(long value) {
      return Character.valueOf((char) value);
    }

    @Override
    public Character fromHexadecimal(long value, int digits) {
      return Character.valueOf((char) value);
    }

    @Override
    public Character fromBigInteger(String value) {
      return Character.valueOf((char) new BigInteger(value).intValue());
    }

    @Override
    public Character fromDecimal(String value) {
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
    public Character initializer() {
      return Character.valueOf((char) 0);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Character value, JsonWriterOptions options) {
      if (value == null) {
        return this.writeNull(output);
      }
      return this.writeInt(output, (int) value.charValue());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "charFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final CharFormat INSTANCE = new CharFormat();

  }

  static final class ShortFormat implements JsonFormat<Short>, JsonNumberParser<Short>, JsonNumberWriter<Short>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Short fromInteger(long value) {
      return Short.valueOf((short) value);
    }

    @Override
    public Short fromHexadecimal(long value, int digits) {
      return Short.valueOf((short) value);
    }

    @Override
    public Short fromBigInteger(String value) {
      return Short.valueOf(new BigInteger(value).shortValue());
    }

    @Override
    public Short fromDecimal(String value) {
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
    public Short initializer() {
      return Short.valueOf((short) 0);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Short value, JsonWriterOptions options) {
      if (value == null) {
        return this.writeNull(output);
      }
      return this.writeInt(output, value.intValue());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "shortFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final ShortFormat INSTANCE = new ShortFormat();

  }

  static final class IntFormat implements JsonFormat<Integer>, JsonNumberParser<Integer>, JsonNumberWriter<Integer>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Integer fromInteger(long value) {
      return Integer.valueOf((int) value);
    }

    @Override
    public Integer fromHexadecimal(long value, int digits) {
      return Integer.valueOf((int) value);
    }

    @Override
    public Integer fromBigInteger(String value) {
      return Integer.valueOf(new BigInteger(value).intValue());
    }

    @Override
    public Integer fromDecimal(String value) {
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
    public Integer initializer() {
      return Integer.valueOf(0);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Integer value, JsonWriterOptions options) {
      if (value == null) {
        return this.writeNull(output);
      }
      return this.writeInt(output, value.intValue());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "intFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final IntFormat INSTANCE = new IntFormat();

  }

  static final class LongFormat implements JsonFormat<Long>, JsonNumberParser<Long>, JsonNumberWriter<Long>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Long fromInteger(long value) {
      return Long.valueOf(value);
    }

    @Override
    public Long fromHexadecimal(long value, int digits) {
      return Long.valueOf(value);
    }

    @Override
    public Long fromBigInteger(String value) {
      return Long.valueOf(new BigInteger(value).longValue());
    }

    @Override
    public Long fromDecimal(String value) {
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
    public Long initializer() {
      return Long.valueOf(0L);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Long value, JsonWriterOptions options) {
      if (value == null) {
        return this.writeNull(output);
      }
      return this.writeLong(output, value.longValue());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "longFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final LongFormat INSTANCE = new LongFormat();

  }

  static final class FloatFormat implements JsonFormat<Float>, JsonNumberParser<Float>, JsonNumberWriter<Float>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Float fromInteger(long value) {
      return Float.valueOf((float) value);
    }

    @Override
    public Float fromHexadecimal(long value, int digits) {
      if (digits <= 8) {
        return Float.valueOf(Float.intBitsToFloat((int) value));
      } else {
        return Float.valueOf((float) Double.longBitsToDouble(value));
      }
    }

    @Override
    public Float fromBigInteger(String value) {
      return Float.valueOf(new BigInteger(value).floatValue());
    }

    @Override
    public Float fromDecimal(String value) {
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
    public Float initializer() {
      return Float.valueOf(0.0f);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Float value, JsonWriterOptions options) {
      if (value == null) {
        return this.writeNull(output);
      }
      return this.writeFloat(output, value.floatValue());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "floatFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final FloatFormat INSTANCE = new FloatFormat();

  }

  static final class DoubleFormat implements JsonFormat<Double>, JsonNumberParser<Double>, JsonNumberWriter<Double>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Double fromInteger(long value) {
      return Double.valueOf((double) value);
    }

    @Override
    public Double fromHexadecimal(long value, int digits) {
      if (digits <= 8) {
        return Double.valueOf((double) Float.intBitsToFloat((int) value));
      } else {
        return Double.valueOf(Double.longBitsToDouble(value));
      }
    }

    @Override
    public Double fromBigInteger(String value) {
      return Double.valueOf(new BigInteger(value).doubleValue());
    }

    @Override
    public Double fromDecimal(String value) {
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
    public Double initializer() {
      return Double.valueOf(0.0);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Double value, JsonWriterOptions options) {
      if (value == null) {
        return this.writeNull(output);
      }
      return this.writeDouble(output, value.doubleValue());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "doubleFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final DoubleFormat INSTANCE = new DoubleFormat();

  }

  static final class NumberFormat implements JsonFormat<Number>, JsonNumberParser<Number>, JsonNumberWriter<Number>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public Number fromInteger(long value) {
      if (value == (long) (int) value) {
        return Integer.valueOf((int) value);
      } else {
        return Long.valueOf(value);
      }
    }

    @Override
    public Number fromHexadecimal(long value, int digits) {
      if (value == (long) (int) value && digits <= 8) {
        return Integer.valueOf((int) value);
      } else {
        return Long.valueOf(value);
      }
    }

    @Override
    public Number fromBigInteger(String value) {
      return new BigInteger(value);
    }

    @Override
    public Number fromDecimal(String value) {
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
    public @Nullable Number initializer() {
      return null;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Number value, JsonWriterOptions options) {
      if (value == null) {
        return this.writeNull(output);
      } else if (value instanceof Byte || value instanceof Short || value instanceof Integer) {
        return this.writeInt(output, value.intValue());
      } else if (value instanceof Long) {
        return this.writeLong(output, value.longValue());
      } else if (value instanceof Float) {
        return this.writeFloat(output, value.floatValue());
      } else if (value instanceof Double) {
        return this.writeDouble(output, value.doubleValue());
      } else if (value instanceof BigInteger) {
        return this.writeBigInteger(output, (BigInteger) value);
      }
      return this.writeNumber(output, value);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "numberFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final NumberFormat INSTANCE = new NumberFormat();

  }

  static final class StringFormat implements JsonFormat<String>, JsonStringParser<StringBuilder, String>, JsonStringWriter<String>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "string";
    }

    @Override
    public StringBuilder stringBuilder() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public String buildString(StringBuilder builder) {
      return JsonLang.stringCache().put(builder.toString());
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
    public @Nullable String initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "stringFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final StringFormat INSTANCE = new StringFormat();

  }

  static final class KeyFormat implements JsonFormat<String>, JsonIdentifierParser<String>, JsonIdentifierWriter<String>, JsonStringWriter<String>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "key";
    }

    @Override
    public JsonStringParser<?, String> stringParser() {
      return KeyStringParser.INSTANCE;
    }

    @Override
    public String fromIdentifier(String value, JsonParserOptions options) {
      return JsonLang.keyCache().put(value);
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
    public @Nullable String initializer() {
      return null;
    }

    @Override
    public Parse<String> parse(Input input, JsonParserOptions options) {
      return this.parseValue(input, options);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable String value, JsonWriterOptions options) {
      if (value != null && options.identifierKeys()
          && Term.isIdentifier(value) && !options.keywords().contains(value)) {
        return JsonIdentifierWriter.super.write(output, value, options);
      }
      return JsonStringWriter.super.write(output, value, options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "keyFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final KeyFormat INSTANCE = new KeyFormat();

  }

  static final class KeyStringParser implements JsonStringParser<StringBuilder, String>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "key";
    }

    @Override
    public StringBuilder stringBuilder() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public String buildString(StringBuilder builder) {
      return JsonLang.keyCache().put(builder.toString());
    }

    @Override
    public @Nullable String initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "keyFormat").endInvoke()
              .beginInvoke("stringParser").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final KeyStringParser INSTANCE = new KeyStringParser();

  }

  static final class ByteBufferFormat implements JsonFormat<ByteBuffer>, JsonStringParser<Output<ByteBuffer>, ByteBuffer>, JsonStringWriter<ByteBuffer>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "base64";
    }

    @Override
    public Output<ByteBuffer> stringBuilder() {
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
    public @Nullable ByteBuffer buildString(Output<ByteBuffer> builder) throws JsonException {
      try {
        return builder.get();
      } catch (OutputException cause) {
        throw new JsonException("malformed base-64 string", cause);
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
    public @Nullable ByteBuffer initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "byteBufferFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final ByteBufferFormat INSTANCE = new ByteBufferFormat();

  }

  static final class InstantFormat implements JsonFormat<Instant>, JsonStringParser<StringBuilder, Instant>, JsonStringWriter<Instant>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "date-time";
    }

    @Override
    public StringBuilder stringBuilder() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public Instant buildString(StringBuilder builder) throws JsonException {
      try {
        return Instant.parse(builder.toString());
      } catch (DateTimeParseException cause) {
        throw new JsonException(cause);
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
    public @Nullable Instant initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "instantFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final InstantFormat INSTANCE = new InstantFormat();

  }

  static final class InetAddressFormat implements JsonFormat<InetAddress>, JsonStringParser<StringBuilder, InetAddress>, JsonStringWriter<InetAddress>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "InetAddress";
    }

    @Override
    public StringBuilder stringBuilder() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public InetAddress buildString(StringBuilder builder) throws JsonException {
      try {
        return InetAddress.getByName(builder.toString());
      } catch (UnknownHostException | SecurityException cause) {
        throw new JsonException(cause);
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
    public @Nullable InetAddress initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "inetAddress").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final InetAddressFormat INSTANCE = new InetAddressFormat();

  }

  static final class InetSocketAddressFormat implements JsonFormat<InetSocketAddress>, JsonStringParser<StringBuilder, InetSocketAddress>, JsonStringWriter<InetSocketAddress>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "InetSocketAddress";
    }

    @Override
    public StringBuilder stringBuilder() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public @Nullable InetSocketAddress buildString(StringBuilder builder) throws JsonException {
      final String address = builder.toString();
      final int colonIndex = address.indexOf(':');
      if (colonIndex >= 0) {
        try {
          final String host = address.substring(0, colonIndex);
          final int port = Integer.parseInt(address.substring(colonIndex + 1));
          return InetSocketAddress.createUnresolved(host, port);
        } catch (IllegalArgumentException cause) {
          throw new JsonException(cause);
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
    public @Nullable InetSocketAddress initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "inetSocketAddress").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final InetSocketAddressFormat INSTANCE = new InetSocketAddressFormat();

  }

  static final class ArrayFormat<E, T> implements JsonFormat<T>, JsonArrayParser<E, ArrayBuilder<E, T>, T>, JsonArrayWriter<E, T>, ToSource {

    final Class<?> componentClass;
    final JsonFormat<E> componentFormat;

    ArrayFormat(Class<?> componentClass, JsonFormat<E> componentFormat) {
      this.componentClass = componentClass;
      this.componentFormat = componentFormat;
    }

    @Override
    public @Nullable String typeName() {
      return "array";
    }

    @Override
    public JsonParser<E> elementParser() {
      return this.componentFormat;
    }

    @Override
    public ArrayBuilder<E, T> arrayBuilder() {
      return new ArrayBuilder<E, T>(this.componentClass);
    }

    @Override
    public ArrayBuilder<E, T> appendElement(ArrayBuilder<E, T> builder, @Nullable E element) {
      builder.add(element);
      return builder;
    }

    @Override
    public T buildArray(ArrayBuilder<E, T> builder) {
      return builder.build();
    }

    @Override
    public @Nullable Iterator<E> getElements(@Nullable T value) {
      if (value == null) {
        return null;
      }
      return Assume.conforms(ArrayIterator.of(value));
    }

    @Override
    public JsonWriter<E> elementWriter() {
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
    public @Nullable T initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonLang", "arrayFormat")
              .appendArgument(this.componentClass)
              .appendArgument(this.componentFormat)
              .endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

}
