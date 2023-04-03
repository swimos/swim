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
import swim.codec.WriteException;
import swim.expr.ContextExpr;
import swim.expr.ExprParser;
import swim.expr.Term;
import swim.expr.TermException;
import swim.expr.selector.ChildExpr;
import swim.util.ArrayBuilder;
import swim.util.ArrayIterator;
import swim.util.Assume;
import swim.util.CacheSet;
import swim.util.LruCacheSet;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JsonJava implements JsonProvider, ToSource {

  final JsonCodec codec;
  final int priority;

  private JsonJava(JsonCodec codec, int priority) {
    this.codec = codec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable JsonForm<?> resolveJsonForm(Type javaType) throws JsonFormException {
    if (javaType instanceof GenericArrayType) {
      return JsonJava.arrayForm(this.codec, ((GenericArrayType) javaType).getGenericComponentType());
    } else if (javaType instanceof Class<?>) {
      final Class<?> javaClass = (Class<?>) javaType;
      if (javaClass.isArray()) {
        return JsonJava.arrayForm(this.codec, javaClass.getComponentType());
      } else if (javaClass == Void.TYPE) {
        return JsonJava.voidForm();
      } else if (javaClass == Boolean.class || javaClass == Boolean.TYPE) {
        return JsonJava.booleanForm();
      } else if (javaClass == Byte.class || javaClass == Byte.TYPE) {
        return JsonJava.byteForm();
      } else if (javaClass == Character.class || javaClass == Character.TYPE) {
        return JsonJava.charForm();
      } else if (javaClass == Short.class || javaClass == Short.TYPE) {
        return JsonJava.shortForm();
      } else if (javaClass == Integer.class || javaClass == Integer.TYPE) {
        return JsonJava.intForm();
      } else if (javaClass == Long.class || javaClass == Long.TYPE) {
        return JsonJava.longForm();
      } else if (javaClass == Float.class || javaClass == Float.TYPE) {
        return JsonJava.floatForm();
      } else if (javaClass == Double.class || javaClass == Double.TYPE) {
        return JsonJava.doubleForm();
      } else if (javaClass == String.class) {
        return JsonJava.stringForm();
      } else if (Number.class.isAssignableFrom(javaClass)) {
        return JsonJava.numberForm();
      } else if (ByteBuffer.class.isAssignableFrom(javaClass)) {
        return JsonJava.byteBufferForm();
      } else if (Instant.class.isAssignableFrom(javaClass)) {
        return JsonJava.instantForm();
      } else if (InetAddress.class.isAssignableFrom(javaClass)) {
        return JsonJava.inetAddressForm();
      } else if (InetSocketAddress.class.isAssignableFrom(javaClass)) {
        return JsonJava.inetSocketAddressForm();
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonJava", "provider");
    notation.appendArgument(this.codec);
    if (this.priority != BUILTIN_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static JsonJava provider(JsonCodec codec, int priority) {
    return new JsonJava(codec, priority);
  }

  public static JsonJava provider(JsonCodec codec) {
    return new JsonJava(codec, BUILTIN_PRIORITY);
  }

  public static JsonUndefinedForm<Void> voidForm() {
    return JsonJava.VoidForm.INSTANCE;
  }

  public static JsonNullForm<Object> nullForm() {
    return JsonJava.NullForm.INSTANCE;
  }

  public static JsonIdentifierForm<Object> identifierForm() {
    return JsonJava.IdentifierForm.INSTANCE;
  }

  public static JsonForm<Boolean> booleanForm() {
    return JsonJava.BooleanForm.INSTANCE;
  }

  public static JsonNumberForm<Byte> byteForm() {
    return JsonJava.ByteForm.INSTANCE;
  }

  public static JsonForm<Character> charForm() {
    return JsonJava.CharForm.INSTANCE;
  }

  public static JsonNumberForm<Short> shortForm() {
    return JsonJava.ShortForm.INSTANCE;
  }

  public static JsonNumberForm<Integer> intForm() {
    return JsonJava.IntForm.INSTANCE;
  }

  public static JsonNumberForm<Long> longForm() {
    return JsonJava.LongForm.INSTANCE;
  }

  public static JsonNumberForm<Float> floatForm() {
    return JsonJava.FloatForm.INSTANCE;
  }

  public static JsonNumberForm<Double> doubleForm() {
    return JsonJava.DoubleForm.INSTANCE;
  }

  public static JsonNumberForm<Number> numberForm() {
    return JsonJava.NumberForm.INSTANCE;
  }

  public static JsonStringForm<?, String> stringForm() {
    return JsonJava.StringForm.INSTANCE;
  }

  public static JsonForm<String> keyForm() {
    return JsonJava.KeyForm.INSTANCE;
  }

  public static JsonForm<ByteBuffer> byteBufferForm() {
    return JsonJava.ByteBufferForm.INSTANCE;
  }

  public static JsonForm<Instant> instantForm() {
    return JsonJava.InstantForm.INSTANCE;
  }

  public static JsonForm<InetAddress> inetAddressForm() {
    return JsonJava.InetAddressForm.INSTANCE;
  }

  public static JsonForm<InetSocketAddress> inetSocketAddressForm() {
    return JsonJava.InetSocketAddressForm.INSTANCE;
  }

  public static <E, A> JsonArrayForm<E, ?, A> arrayForm(Class<?> componentClass, JsonForm<E> componentForm) {
    return new JsonJava.ArrayForm<E, A>(componentClass, componentForm);
  }

  public static <E, A> @Nullable JsonArrayForm<E, ?, A> arrayForm(JsonCodec codec, Type componentType) throws JsonFormException {
    final JsonForm<E> componentForm = codec.getJsonForm(componentType);
    if (componentForm != null) {
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
      if (componentType instanceof Class<?>) {
        return new JsonJava.ArrayForm<E, A>((Class<?>) componentType, componentForm);
      }
    }
    return null;
  }

  private static final ThreadLocal<CacheSet<String>> STRING_CACHE =
      new ThreadLocal<CacheSet<String>>();

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

  private static final ThreadLocal<CacheSet<String>> KEY_CACHE =
      new ThreadLocal<CacheSet<String>>();

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

  static final class VoidForm implements JsonUndefinedForm<Void>, ToSource {

    @Override
    public @Nullable Void undefinedValue() {
      return null;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Void value, JsonWriter writer) {
      return writer.writeUndefined(output);
    }

    @Override
    public Term intoTerm(@Nullable Void value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Void fromTerm(Term term) {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "voidForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.VoidForm INSTANCE = new JsonJava.VoidForm();

  }

  static final class NullForm implements JsonNullForm<Object>, ToSource {

    @Override
    public @Nullable Object nullValue() {
      return null;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object value, JsonWriter writer) {
      return writer.writeNull(output);
    }

    @Override
    public Term intoTerm(@Nullable Object value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Object fromTerm(Term term) {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "nullForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.NullForm INSTANCE = new JsonJava.NullForm();

  }

  static final class IdentifierForm implements JsonIdentifierForm<Object>, ToSource {

    @Override
    public @Nullable Object identifierValue(String value, ExprParser parser) throws JsonException {
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
          if (parser instanceof JsonParser && ((JsonParser) parser).options().exprsEnabled()) {
            return new ChildExpr(ContextExpr.of(), Term.of(value));
          } else {
            throw new JsonException("unsupported identifier: " + value);
          }
      }
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object value, JsonWriter writer) {
      if (value == null) {
        return writer.writeNull(output);
      } else if (value instanceof Boolean) {
        return writer.writeBoolean(output, ((Boolean) value).booleanValue());
      } else {
        return writer.writeIdentifier(output, value.toString());
      }
    }

    @Override
    public Term intoTerm(@Nullable Object value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Object fromTerm(Term term) {
      if (term.isValidBoolean()) {
        return Boolean.valueOf(term.booleanValue());
      } else if (term.isValidString()) {
        final String string = term.stringValue();
        if (Json.parser().isIdentifier(string)) {
          return string;
        }
      } else if (term instanceof ChildExpr) {
        final ChildExpr childExpr = (ChildExpr) term;
        final Term scope = childExpr.scope();
        final Term key = childExpr.key();
        if (ContextExpr.of().equals(scope) && key.isValidString()) {
          return key.stringValue();
        }
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "identifierForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.IdentifierForm INSTANCE = new JsonJava.IdentifierForm();

  }

  static final class BooleanForm implements JsonIdentifierForm<Boolean>, JsonNumberForm<Boolean>, ToSource {

    @Override
    public Boolean identifierValue(String value, ExprParser parser) {
      if (value.length() == 0 || "false".equals(value)) {
        return Boolean.FALSE;
      } else {
        return Boolean.TRUE;
      }
    }

    @Override
    public Boolean integerValue(long value) {
      return Boolean.valueOf(value != 0L);
    }

    @Override
    public Boolean hexadecimalValue(long value, int digits) {
      return Boolean.valueOf(value != 0L);
    }

    @Override
    public Boolean bigIntegerValue(String value) {
      return Boolean.valueOf(!BigInteger.ZERO.equals(new BigInteger(value)));
    }

    @Override
    public Boolean decimalValue(String value) {
      return Boolean.valueOf(Double.parseDouble(value) != 0.0);
    }

    @Override
    public Parse<Boolean> parse(Input input, JsonParser parser) {
      return parser.parseExpr(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Boolean value, JsonWriter writer) {
      if (value != null) {
        return writer.writeBoolean(output, value.booleanValue());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable Boolean value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Boolean fromTerm(Term term) {
      if (term.isValidBoolean()) {
        return Boolean.valueOf(term.booleanValue());
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "booleanForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.BooleanForm INSTANCE = new JsonJava.BooleanForm();

  }

  static final class ByteForm implements JsonNumberForm<Byte>, ToSource {

    @Override
    public Byte integerValue(long value) {
      return Byte.valueOf((byte) value);
    }

    @Override
    public Byte hexadecimalValue(long value, int digits) {
      return Byte.valueOf((byte) value);
    }

    @Override
    public Byte bigIntegerValue(String value) {
      return Byte.valueOf(new BigInteger(value).byteValue());
    }

    @Override
    public Byte decimalValue(String value) {
      return Byte.valueOf((byte) Double.parseDouble(value));
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Byte value, JsonWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, value.intValue());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable Byte value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Byte fromTerm(Term term) {
      if (term.isValidByte()) {
        return Byte.valueOf(term.byteValue());
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "byteForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.ByteForm INSTANCE = new JsonJava.ByteForm();

  }

  static final class CharForm implements JsonNumberForm<Character>, ToSource {

    @Override
    public Character integerValue(long value) {
      return Character.valueOf((char) value);
    }

    @Override
    public Character hexadecimalValue(long value, int digits) {
      return Character.valueOf((char) value);
    }

    @Override
    public Character bigIntegerValue(String value) {
      return Character.valueOf((char) new BigInteger(value).intValue());
    }

    @Override
    public Character decimalValue(String value) {
      return Character.valueOf((char) Double.parseDouble(value));
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Character value, JsonWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, (int) value.charValue());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable Character value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Character fromTerm(Term term) {
      if (term.isValidChar()) {
        return Character.valueOf(term.charValue());
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "charForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.CharForm INSTANCE = new JsonJava.CharForm();

  }

  static final class ShortForm implements JsonNumberForm<Short>, ToSource {

    @Override
    public Short integerValue(long value) {
      return Short.valueOf((short) value);
    }

    @Override
    public Short hexadecimalValue(long value, int digits) {
      return Short.valueOf((short) value);
    }

    @Override
    public Short bigIntegerValue(String value) {
      return Short.valueOf(new BigInteger(value).shortValue());
    }

    @Override
    public Short decimalValue(String value) {
      return Short.valueOf((short) Double.parseDouble(value));
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Short value, JsonWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, value.intValue());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable Short value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Short fromTerm(Term term) {
      if (term.isValidShort()) {
        return Short.valueOf(term.shortValue());
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "shortForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.ShortForm INSTANCE = new JsonJava.ShortForm();

  }

  static final class IntForm implements JsonNumberForm<Integer>, ToSource {

    @Override
    public Integer integerValue(long value) {
      return Integer.valueOf((int) value);
    }

    @Override
    public Integer hexadecimalValue(long value, int digits) {
      return Integer.valueOf((int) value);
    }

    @Override
    public Integer bigIntegerValue(String value) {
      return Integer.valueOf(new BigInteger(value).intValue());
    }

    @Override
    public Integer decimalValue(String value) {
      return Integer.valueOf((int) Double.parseDouble(value));
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Integer value, JsonWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, value.intValue());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable Integer value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Integer fromTerm(Term term) {
      if (term.isValidInt()) {
        return Integer.valueOf(term.intValue());
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "intForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.IntForm INSTANCE = new JsonJava.IntForm();

  }

  static final class LongForm implements JsonNumberForm<Long>, ToSource {

    @Override
    public Long integerValue(long value) {
      return Long.valueOf(value);
    }

    @Override
    public Long hexadecimalValue(long value, int digits) {
      return Long.valueOf(value);
    }

    @Override
    public Long bigIntegerValue(String value) {
      return Long.valueOf(new BigInteger(value).longValue());
    }

    @Override
    public Long decimalValue(String value) {
      return Long.valueOf((long) Double.parseDouble(value));
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Long value, JsonWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, value.longValue());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable Long value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Long fromTerm(Term term) {
      if (term.isValidLong()) {
        return Long.valueOf(term.longValue());
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "longForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.LongForm INSTANCE = new JsonJava.LongForm();

  }

  static final class FloatForm implements JsonNumberForm<Float>, ToSource {

    @Override
    public Float integerValue(long value) {
      return Float.valueOf((float) value);
    }

    @Override
    public Float hexadecimalValue(long value, int digits) {
      if (digits <= 8) {
        return Float.valueOf(Float.intBitsToFloat((int) value));
      } else {
        return Float.valueOf((float) Double.longBitsToDouble(value));
      }
    }

    @Override
    public Float bigIntegerValue(String value) {
      return Float.valueOf(new BigInteger(value).floatValue());
    }

    @Override
    public Float decimalValue(String value) {
      return Float.valueOf((float) Double.parseDouble(value));
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Float value, JsonWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, value.floatValue());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable Float value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Float fromTerm(Term term) {
      if (term.isValidFloat()) {
        return Float.valueOf(term.floatValue());
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "floatForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.FloatForm INSTANCE = new JsonJava.FloatForm();

  }

  static final class DoubleForm implements JsonNumberForm<Double>, ToSource {

    @Override
    public Double integerValue(long value) {
      return Double.valueOf((double) value);
    }

    @Override
    public Double hexadecimalValue(long value, int digits) {
      if (digits <= 8) {
        return Double.valueOf((double) Float.intBitsToFloat((int) value));
      } else {
        return Double.valueOf(Double.longBitsToDouble(value));
      }
    }

    @Override
    public Double bigIntegerValue(String value) {
      return Double.valueOf(new BigInteger(value).doubleValue());
    }

    @Override
    public Double decimalValue(String value) {
      return Double.valueOf(Double.parseDouble(value));
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Double value, JsonWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, value.doubleValue());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable Double value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Double fromTerm(Term term) {
      if (term.isValidDouble()) {
        return Double.valueOf(term.doubleValue());
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "doubleForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.DoubleForm INSTANCE = new JsonJava.DoubleForm();

  }

  static final class NumberForm implements JsonNumberForm<Number>, ToSource {

    @Override
    public Number integerValue(long value) {
      if (value == (long) (int) value) {
        return Integer.valueOf((int) value);
      } else {
        return Long.valueOf(value);
      }
    }

    @Override
    public Number hexadecimalValue(long value, int digits) {
      if (value == (long) (int) value && digits <= 8) {
        return Integer.valueOf((int) value);
      } else {
        return Long.valueOf(value);
      }
    }

    @Override
    public Number bigIntegerValue(String value) {
      return new BigInteger(value);
    }

    @Override
    public Number decimalValue(String value) {
      final double x = Double.parseDouble(value);
      if (x == (double) (float) x) {
        return Float.valueOf((float) x);
      } else {
        return Double.valueOf(x);
      }
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Number value, JsonWriter writer) {
      if (value == null) {
        return writer.writeNull(output);
      } else if (value instanceof Byte || value instanceof Short || value instanceof Integer) {
        return writer.writeNumber(output, value.intValue());
      } else if (value instanceof Long) {
        return writer.writeNumber(output, value.longValue());
      } else if (value instanceof Float) {
        return writer.writeNumber(output, value.floatValue());
      } else if (value instanceof Double) {
        return writer.writeNumber(output, value.doubleValue());
      } else if (value instanceof BigInteger) {
        return writer.writeNumber(output, (BigInteger) value);
      } else {
        return Write.error(new WriteException("unsupported value: " + value));
      }
    }

    @Override
    public Term intoTerm(@Nullable Number value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Number fromTerm(Term term) {
      if (term.isValidNumber()) {
        return term.numberValue();
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "numberForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.NumberForm INSTANCE = new JsonJava.NumberForm();

  }

  static final class StringForm implements JsonStringForm<StringBuilder, String>, ToSource {

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
      return JsonJava.stringCache().put(builder.toString());
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable String value, JsonWriter writer) {
      if (value != null) {
        return writer.writeString(output, value);
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable String value) {
      return Term.of(value);
    }

    @Override
    public @Nullable String fromTerm(Term term) {
      if (term.isValidString()) {
        return term.stringValue();
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "stringForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.StringForm INSTANCE = new JsonJava.StringForm();

  }

  static final class KeyForm implements JsonIdentifierForm<String>, JsonStringForm<StringBuilder, String>, ToSource {

    @Override
    public String identifierValue(String value, ExprParser parser) {
      return JsonJava.keyCache().put(value);
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
      return JsonJava.keyCache().put(builder.toString());
    }

    @Override
    public Parse<String> parse(Input input, JsonParser parser) {
      return parser.parseValue(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable String value, JsonWriter writer) {
      if (value == null) {
        return writer.writeNull(output);
      } else if (writer.options().identifierKeys() && writer.isIdentifier(value) && !writer.isKeyword(value)) {
        return writer.writeIdentifier(output, value);
      } else {
        return writer.writeString(output, value);
      }
    }

    @Override
    public Term intoTerm(@Nullable String value) {
      return Term.of(value);
    }

    @Override
    public @Nullable String fromTerm(Term term) {
      if (term.isValidString()) {
        return term.stringValue();
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "keyForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.KeyForm INSTANCE = new JsonJava.KeyForm();

  }

  static final class ByteBufferForm implements JsonStringForm<Output<ByteBuffer>, ByteBuffer>, ToSource {

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
    public Write<?> write(Output<?> output, @Nullable ByteBuffer value, JsonWriter writer) {
      if (value != null) {
        final StringOutput stringOutput = new StringOutput();
        Base64.standard().writeByteBuffer(stringOutput, value).assertDone();
        return writer.writeString(output, stringOutput.get());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable ByteBuffer value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable ByteBuffer fromTerm(Term term) {
      return term.objectValue(ByteBuffer.class);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "byteBufferForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.ByteBufferForm INSTANCE = new JsonJava.ByteBufferForm();

  }

  static final class InstantForm implements JsonStringForm<StringBuilder, Instant>, JsonNumberForm<Instant>, ToSource {

    @Override
    public StringBuilder stringBuilder() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public @Nullable Instant buildString(StringBuilder builder) {
      return Instant.parse(builder.toString());
    }

    @Override
    public Instant integerValue(long value) {
      return Instant.ofEpochMilli(value);
    }

    @Override
    public Instant hexadecimalValue(long value, int digits) {
      return Instant.ofEpochMilli(value);
    }

    @Override
    public Instant bigIntegerValue(String value) {
      return Instant.ofEpochMilli(new BigInteger(value).longValue());
    }

    @Override
    public Instant decimalValue(String value) {
      return Instant.ofEpochMilli((long) Double.parseDouble(value));
    }

    @Override
    public Parse<Instant> parse(Input input, JsonParser parser) {
      return parser.parseExpr(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Instant value, JsonWriter writer) {
      if (value != null) {
        return writer.writeString(output, value.toString());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable Instant value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Instant fromTerm(Term term) {
      return term.objectValue(Instant.class);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "instantForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.InstantForm INSTANCE = new JsonJava.InstantForm();

  }

  static final class InetAddressForm implements JsonStringForm<StringBuilder, InetAddress>, ToSource {

    @Override
    public StringBuilder stringBuilder() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public @Nullable InetAddress buildString(StringBuilder builder) throws JsonException {
      try {
        return InetAddress.getByName(builder.toString());
      } catch (UnknownHostException | SecurityException cause) {
        throw new JsonException(cause);
      }
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable InetAddress value, JsonWriter writer) {
      if (value != null) {
        return writer.writeString(output, value.getHostAddress());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable InetAddress value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable InetAddress fromTerm(Term term) {
      return term.objectValue(InetAddress.class);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "inetAddress").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.InetAddressForm INSTANCE = new JsonJava.InetAddressForm();

  }

  static final class InetSocketAddressForm implements JsonStringForm<StringBuilder, InetSocketAddress>, ToSource {

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
    public Write<?> write(Output<?> output, @Nullable InetSocketAddress value, JsonWriter writer) {
      if (value != null) {
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
        return writer.writeString(output, builder.toString());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable InetSocketAddress value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable InetSocketAddress fromTerm(Term term) {
      return term.objectValue(InetSocketAddress.class);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "inetSocketAddress").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JsonJava.InetSocketAddressForm INSTANCE = new JsonJava.InetSocketAddressForm();

  }

  static final class ArrayForm<E, A> implements JsonArrayForm<E, ArrayBuilder<E, A>, A>, ToSource {

    final Class<?> componentClass;
    final JsonForm<E> componentForm;

    ArrayForm(Class<?> componentClass, JsonForm<E> componentForm) {
      this.componentClass = componentClass;
      this.componentForm = componentForm;
    }

    @Override
    public JsonForm<E> elementForm() {
      return this.componentForm;
    }

    @Override
    public ArrayBuilder<E, A> arrayBuilder() {
      return new ArrayBuilder<E, A>(this.componentClass);
    }

    @Override
    public ArrayBuilder<E, A> appendElement(ArrayBuilder<E, A> builder, @Nullable E element) {
      builder.add(element);
      return builder;
    }

    @Override
    public A buildArray(ArrayBuilder<E, A> builder) {
      return builder.build();
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable A value, JsonWriter writer) {
      if (value != null) {
        return writer.writeArray(output, this, Assume.conforms(ArrayIterator.of(value)));
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable A value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable A fromTerm(Term term) {
      if (term.isValidObject()) {
        final Object object = term.objectValue();
        if (this.componentClass.arrayType().isInstance(object)) {
          return Assume.conforms(object);
        }
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonJava", "arrayForm")
              .appendArgument(this.componentClass)
              .appendArgument(this.componentForm)
              .endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

}
