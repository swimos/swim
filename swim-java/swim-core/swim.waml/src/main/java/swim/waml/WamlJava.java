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
import java.util.AbstractMap.SimpleEntry;
import java.util.AbstractMap.SimpleImmutableEntry;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
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
public final class WamlJava implements WamlProvider, ToSource {

  final WamlCodec codec;
  final int priority;

  private WamlJava(WamlCodec codec, int priority) {
    this.codec = codec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable WamlForm<?> resolveWamlForm(Type javaType) throws WamlFormException {
    if (javaType instanceof GenericArrayType) {
      return WamlJava.arrayForm(this.codec, ((GenericArrayType) javaType).getGenericComponentType());
    } else if (javaType instanceof Class<?>) {
      final Class<?> javaClass = (Class<?>) javaType;
      if (javaClass.isArray()) {
        return WamlJava.arrayForm(this.codec, javaClass.getComponentType());
      } else if (javaClass == Void.TYPE) {
        return WamlJava.voidForm();
      } else if (javaClass == Boolean.class || javaClass == Boolean.TYPE) {
        return WamlJava.booleanForm();
      } else if (javaClass == Byte.class || javaClass == Byte.TYPE) {
        return WamlJava.byteForm();
      } else if (javaClass == Character.class || javaClass == Character.TYPE) {
        return WamlJava.charForm();
      } else if (javaClass == Short.class || javaClass == Short.TYPE) {
        return WamlJava.shortForm();
      } else if (javaClass == Integer.class || javaClass == Integer.TYPE) {
        return WamlJava.intForm();
      } else if (javaClass == Long.class || javaClass == Long.TYPE) {
        return WamlJava.longForm();
      } else if (javaClass == Float.class || javaClass == Float.TYPE) {
        return WamlJava.floatForm();
      } else if (javaClass == Double.class || javaClass == Double.TYPE) {
        return WamlJava.doubleForm();
      } else if (javaClass == String.class) {
        return WamlJava.stringForm();
      } else if (Number.class.isAssignableFrom(javaClass)) {
        return WamlJava.numberForm();
      } else if (ByteBuffer.class.isAssignableFrom(javaClass)) {
        return WamlJava.byteBufferForm();
      } else if (Instant.class.isAssignableFrom(javaClass)) {
        return WamlJava.instantForm();
      } else if (InetAddress.class.isAssignableFrom(javaClass)) {
        return WamlJava.inetAddressForm();
      } else if (InetSocketAddress.class.isAssignableFrom(javaClass)) {
        return WamlJava.inetSocketAddressForm();
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlJava", "provider");
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

  public static WamlJava provider(WamlCodec codec, int priority) {
    return new WamlJava(codec, priority);
  }

  public static WamlJava provider(WamlCodec codec) {
    return new WamlJava(codec, BUILTIN_PRIORITY);
  }

  public static WamlUndefinedForm<Void> voidForm() {
    return WamlJava.VoidForm.INSTANCE;
  }

  public static WamlUnitForm<Object> nullForm() {
    return WamlJava.NullForm.INSTANCE;
  }

  public static WamlIdentifierForm<Object> identifierForm() {
    return WamlJava.IdentifierForm.INSTANCE;
  }

  public static WamlIdentifierForm<Boolean> booleanForm() {
    return WamlJava.BooleanForm.INSTANCE;
  }

  public static WamlNumberForm<Byte> byteForm() {
    return WamlJava.ByteForm.INSTANCE;
  }

  public static WamlForm<Character> charForm() {
    return WamlJava.CharForm.INSTANCE;
  }

  public static WamlNumberForm<Short> shortForm() {
    return WamlJava.ShortForm.INSTANCE;
  }

  public static WamlNumberForm<Integer> intForm() {
    return WamlJava.IntForm.INSTANCE;
  }

  public static WamlNumberForm<Long> longForm() {
    return WamlJava.LongForm.INSTANCE;
  }

  public static WamlNumberForm<Float> floatForm() {
    return WamlJava.FloatForm.INSTANCE;
  }

  public static WamlNumberForm<Double> doubleForm() {
    return WamlJava.DoubleForm.INSTANCE;
  }

  public static WamlNumberForm<Number> numberForm() {
    return WamlJava.NumberForm.INSTANCE;
  }

  public static WamlStringForm<?, String> stringForm() {
    return WamlJava.StringForm.INSTANCE;
  }

  public static WamlForm<String> keyForm() {
    return WamlJava.KeyForm.INSTANCE;
  }

  public static WamlAttrForm<Object, ByteBuffer> blobAttrForm() {
    return WamlJava.BlobAttrForm.INSTANCE;
  }

  public static WamlStringForm<?, ByteBuffer> byteBufferForm() {
    return WamlJava.ByteBufferForm.INSTANCE;
  }

  public static WamlForm<Instant> instantForm() {
    return WamlJava.InstantForm.INSTANCE;
  }

  public static WamlForm<InetAddress> inetAddressForm() {
    return WamlJava.InetAddressForm.INSTANCE;
  }

  public static WamlForm<InetSocketAddress> inetSocketAddressForm() {
    return WamlJava.InetSocketAddressForm.INSTANCE;
  }

  public static <E, A> WamlArrayForm<E, ?, A> arrayForm(Class<?> componentClass, WamlForm<E> componentForm) {
    return new WamlJava.ArrayForm<E, A>(componentClass, componentForm);
  }

  public static <E, A> @Nullable WamlArrayForm<E, ?, A> arrayForm(WamlCodec codec, Type componentType) throws WamlFormException {
    final WamlForm<E> componentForm = codec.getWamlForm(componentType);
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
        return new WamlJava.ArrayForm<E, A>((Class<?>) componentType, componentForm);
      }
    }
    return null;
  }

  public static WamlMarkupForm<Object, ?, List<Object>> markupForm(WamlForm<Object> nodeForm) {
    return new WamlJava.MarkupForm(nodeForm);
  }

  public static WamlTupleForm<String, Object, ?, Object> tupleForm(WamlForm<Object> paramForm) {
    return new WamlJava.TupleForm(paramForm);
  }

  private static final ThreadLocal<CacheSet<String>> STRING_CACHE =
      new ThreadLocal<CacheSet<String>>();

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

  private static final ThreadLocal<CacheSet<String>> KEY_CACHE =
      new ThreadLocal<CacheSet<String>>();

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

  static final class VoidForm implements WamlUndefinedForm<Void>, ToSource {

    @Override
    public @Nullable Void undefinedValue() {
      return null;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Void value, WamlWriter writer) {
      return writer.writeIdentifier(output, this, "undefined", Collections.emptyIterator());
    }

    @Override
    public Write<?> writeBlock(Output<?> output, @Nullable Void value, WamlWriter writer) {
      return Write.done();
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
      notation.beginInvoke("WamlJava", "voidForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.VoidForm INSTANCE = new WamlJava.VoidForm();

  }

  static final class NullForm implements WamlUnitForm<Object>, ToSource {

    @Override
    public @Nullable Object unitValue() {
      return null;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object value, WamlWriter writer) {
      return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "nullForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.NullForm INSTANCE = new WamlJava.NullForm();

  }

  static final class IdentifierForm implements WamlIdentifierForm<Object>, ToSource {

    @Override
    public @Nullable Object identifierValue(String value, ExprParser parser) throws WamlException {
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
          if (parser instanceof WamlParser && ((WamlParser) parser).options().exprsEnabled()) {
            return new ChildExpr(ContextExpr.of(), Term.of(value));
          } else {
            return value;
          }
      }
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object value, WamlWriter writer) {
      if (value == null) {
        return writer.writeIdentifier(output, this, "null", Collections.emptyIterator());
      } else if (value instanceof Boolean) {
        return writer.writeIdentifier(output, this, ((Boolean) value).booleanValue() ? "true" : "false", Collections.emptyIterator());
      } else {
        return writer.writeIdentifier(output, this, value.toString(), Collections.emptyIterator());
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
        if (Waml.parser().isIdentifier(string)) {
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
      notation.beginInvoke("WamlJava", "identifierForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.IdentifierForm INSTANCE = new WamlJava.IdentifierForm();

  }

  static final class BooleanForm implements WamlIdentifierForm<Boolean>, WamlNumberForm<Boolean>, ToSource {

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
    public Parse<Boolean> parse(Input input, WamlParser parser) {
      return parser.parseExpr(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Boolean value, WamlWriter writer) {
      if (value != null) {
        return writer.writeBoolean(output, this, value.booleanValue(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "booleanForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.BooleanForm INSTANCE = new WamlJava.BooleanForm();

  }

  static final class ByteForm implements WamlNumberForm<Byte>, ToSource {

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
    public Write<?> write(Output<?> output, @Nullable Byte value, WamlWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, this, value.intValue(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "byteForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.ByteForm INSTANCE = new WamlJava.ByteForm();

  }

  static final class CharForm implements WamlNumberForm<Character>, ToSource {

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
    public Write<?> write(Output<?> output, @Nullable Character value, WamlWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, this, (int) value.charValue(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "charForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.CharForm INSTANCE = new WamlJava.CharForm();

  }

  static final class ShortForm implements WamlNumberForm<Short>, ToSource {

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
    public Write<?> write(Output<?> output, @Nullable Short value, WamlWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, this, value.intValue(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "shortForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.ShortForm INSTANCE = new WamlJava.ShortForm();

  }

  static final class IntForm implements WamlNumberForm<Integer>, ToSource {

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
    public Write<?> write(Output<?> output, @Nullable Integer value, WamlWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, this, value.intValue(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "intForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.IntForm INSTANCE = new WamlJava.IntForm();

  }

  static final class LongForm implements WamlNumberForm<Long>, ToSource {

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
    public Write<?> write(Output<?> output, @Nullable Long value, WamlWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, this, value.longValue(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "longForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.LongForm INSTANCE = new WamlJava.LongForm();

  }

  static final class FloatForm implements WamlNumberForm<Float>, ToSource {

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
    public Write<?> write(Output<?> output, @Nullable Float value, WamlWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, this, value.floatValue(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "floatForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.FloatForm INSTANCE = new WamlJava.FloatForm();

  }

  static final class DoubleForm implements WamlNumberForm<Double>, ToSource {

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
    public Write<?> write(Output<?> output, @Nullable Double value, WamlWriter writer) {
      if (value != null) {
        return writer.writeNumber(output, this, value.doubleValue(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "doubleForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.DoubleForm INSTANCE = new WamlJava.DoubleForm();

  }

  static final class NumberForm implements WamlNumberForm<Number>, ToSource {

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
    public Write<?> write(Output<?> output, @Nullable Number value, WamlWriter writer) {
      if (value == null) {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      } else if (value instanceof Byte || value instanceof Short || value instanceof Integer) {
        return writer.writeNumber(output, this, value.intValue(), Collections.emptyIterator());
      } else if (value instanceof Long) {
        return writer.writeNumber(output, this, value.longValue(), Collections.emptyIterator());
      } else if (value instanceof Float) {
        return writer.writeNumber(output, this, value.floatValue(), Collections.emptyIterator());
      } else if (value instanceof Double) {
        return writer.writeNumber(output, this, value.doubleValue(), Collections.emptyIterator());
      } else if (value instanceof BigInteger) {
        return writer.writeNumber(output, this, (BigInteger) value, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "numberForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.NumberForm INSTANCE = new WamlJava.NumberForm();

  }

  static final class StringForm implements WamlStringForm<StringBuilder, String>, ToSource {

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
      return WamlJava.stringCache().put(builder.toString());
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable String value, WamlWriter writer) {
      if (value != null) {
        return writer.writeString(output, this, value, Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      }
    }

    @Override
    public Term intoTerm(@Nullable String value) throws TermException {
      return Term.from(value);
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
      notation.beginInvoke("WamlJava", "stringForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.StringForm INSTANCE = new WamlJava.StringForm();

  }

  static final class KeyForm implements WamlIdentifierForm<String>, WamlStringForm<StringBuilder, String>, ToSource {

    @Override
    public String identifierValue(String value, ExprParser parser) {
      return WamlJava.keyCache().put(value);
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
      return WamlJava.keyCache().put(builder.toString());
    }

    @Override
    public Parse<String> parse(Input input, WamlParser parser) {
      return parser.parseValue(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable String value, WamlWriter writer) {
      if (value == null) {
        return writer.writeIdentifier(output, this, "null", Collections.emptyIterator());
      } else if (writer.isIdentifier(value) && !writer.isKeyword(value)) {
        return writer.writeIdentifier(output, this, value, Collections.emptyIterator());
      } else {
        return writer.writeString(output, this, value, Collections.emptyIterator());
      }
    }

    @Override
    public Term intoTerm(@Nullable String value) throws TermException {
      return Term.from(value);
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
      notation.beginInvoke("WamlJava", "keyForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.KeyForm INSTANCE = new WamlJava.KeyForm();

  }

  static final class BlobAttrForm implements WamlAttrForm<Object, ByteBuffer>, ToSource {

    @Override
    public WamlForm<Object> argsForm() {
      return WamlJava.nullForm();
    }

    @Override
    public boolean isNullary(@Nullable Object args) {
      return args == null;
    }

    @Override
    public WamlForm<ByteBuffer> refineForm(WamlForm<ByteBuffer> form, String name, @Nullable Object args) {
      // Omit @blob attr
      return WamlJava.byteBufferForm();
    }

    @Override
    public WamlForm<ByteBuffer> refineForm(WamlForm<ByteBuffer> form, String name) {
      // Omit @blob attr
      return WamlJava.byteBufferForm();
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlJava", "blobAttrForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.BlobAttrForm INSTANCE = new WamlJava.BlobAttrForm();

  }

  static final class ByteBufferForm implements WamlStringForm<Output<ByteBuffer>, ByteBuffer>, ToSource {

    @Override
    public WamlAttrForm<?, ? extends ByteBuffer> getAttrForm(String name) throws WamlException {
      if ("blob".equals(name)) {
        return WamlJava.blobAttrForm();
      } else {
        return WamlStringForm.super.getAttrForm(name);
      }
    }

    @Override
    public Output<ByteBuffer> stringBuilder() {
      return Base64.standard().decodedOutput(new ByteBufferOutput());
    }

    @Override
    public Output<ByteBuffer> appendCodePoint(Output<ByteBuffer> builder, int c) {
      return builder.write(c);
    }

    @Override
    public @Nullable ByteBuffer buildString(Output<ByteBuffer> builder) throws WamlException {
      try {
        return builder.get();
      } catch (OutputException cause) {
        throw new WamlException("malformed base-64 string", cause);
      }
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable ByteBuffer value, WamlWriter writer) {
      if (value != null) {
        final StringOutput stringOutput = new StringOutput();
        Base64.standard().writeByteBuffer(stringOutput, value).assertDone();
        return writer.writeString(output, this, stringOutput.get(), new WamlJava.ByteBufferForm.AttrIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "byteBufferForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.ByteBufferForm INSTANCE = new WamlJava.ByteBufferForm();

    static final class AttrIterator implements Iterator<Map.Entry<String, Object>> {

      boolean hasNext;

      AttrIterator() {
        this.hasNext = true;
      }

      @Override
      public boolean hasNext() {
        return this.hasNext;
      }

      @Override
      public Map.Entry<String, Object> next() {
        if (this.hasNext) {
          this.hasNext = false;
          return new SimpleImmutableEntry<String, Object>("blob", null);
        } else {
          throw new NoSuchElementException();
        }
      }

    }

  }

  static final class InstantForm implements WamlStringForm<StringBuilder, Instant>, WamlNumberForm<Instant>, ToSource {

    @Override
    public StringBuilder stringBuilder() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public Instant buildString(StringBuilder builder) {
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
    public Parse<Instant> parse(Input input, WamlParser parser) {
      return parser.parseExpr(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Instant value, WamlWriter writer) {
      if (value != null) {
        return writer.writeString(output, this, value.toString(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "instantForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.InstantForm INSTANCE = new WamlJava.InstantForm();

  }

  static final class InetAddressForm implements WamlStringForm<StringBuilder, InetAddress>, ToSource {

    @Override
    public StringBuilder stringBuilder() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public @Nullable InetAddress buildString(StringBuilder builder) throws WamlException {
      try {
        return InetAddress.getByName(builder.toString());
      } catch (UnknownHostException | SecurityException cause) {
        throw new WamlException(cause);
      }
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable InetAddress value, WamlWriter writer) {
      if (value != null) {
        return writer.writeString(output, this, value.getHostAddress(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "inetAddress").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.InetAddressForm INSTANCE = new WamlJava.InetAddressForm();

  }

  static final class InetSocketAddressForm implements WamlStringForm<StringBuilder, InetSocketAddress>, ToSource {

    @Override
    public StringBuilder stringBuilder() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public @Nullable InetSocketAddress buildString(StringBuilder builder) throws WamlException {
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
    public Write<?> write(Output<?> output, @Nullable InetSocketAddress value, WamlWriter writer) {
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
        return writer.writeString(output, this, builder.toString(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "inetSocketAddress").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final WamlJava.InetSocketAddressForm INSTANCE = new WamlJava.InetSocketAddressForm();

  }

  static final class ArrayForm<E, A> implements WamlArrayForm<E, ArrayBuilder<E, A>, A>, ToSource {

    final Class<?> componentClass;
    final WamlForm<E> componentForm;

    ArrayForm(Class<?> componentClass, WamlForm<E> componentForm) {
      this.componentClass = componentClass;
      this.componentForm = componentForm;
    }

    @Override
    public WamlForm<E> elementForm() {
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
    public Write<?> write(Output<?> output, @Nullable A value, WamlWriter writer) {
      if (value != null) {
        return writer.writeArray(output, this, Assume.conforms(ArrayIterator.of(value)), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
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
      notation.beginInvoke("WamlJava", "arrayForm")
              .appendArgument(this.componentClass)
              .appendArgument(this.componentForm)
              .endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class MarkupForm implements WamlMarkupForm<Object, List<Object>, List<Object>>, ToSource {

    final WamlForm<Object> nodeForm;

    MarkupForm(WamlForm<Object> nodeForm) {
      this.nodeForm = nodeForm;
    }

    @Override
    public WamlForm<Object> nodeForm() {
      return this.nodeForm;
    }

    @Override
    public @Nullable String asText(@Nullable Object node) {
      if (node instanceof String) {
        return (String) node;
      } else {
        return null;
      }
    }

    @Override
    public List<Object> markupBuilder() {
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
    public List<Object> buildMarkup(List<Object> builder) {
      return builder;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable List<Object> value, WamlWriter writer) {
      if (value != null) {
        return writer.writeMarkup(output, this, value.iterator(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      }
    }

    @Override
    public Term intoTerm(@Nullable List<Object> value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable List<Object> fromTerm(Term term) {
      return Assume.conformsNullable(term.objectValue(List.class));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlJava", "markupForm")
              .appendArgument(this.nodeForm)
              .endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class TupleForm implements WamlTupleForm<String, Object, WamlJava.TupleBuilder, Object>, ToSource {

    final WamlForm<Object> paramForm;

    TupleForm(WamlForm<Object> paramForm) {
      this.paramForm = paramForm;
    }

    @Override
    public WamlForm<String> labelForm() {
      return WamlJava.keyForm();
    }

    @Override
    public WamlForm<Object> paramForm() {
      return this.paramForm;
    }

    @Override
    public @Nullable Object emptyTuple() {
      return null;
    }

    @Override
    public @Nullable Object unaryTuple(@Nullable Object param) {
      return param;
    }

    @Override
    public WamlJava.TupleBuilder tupleBuilder() {
      return new WamlJava.TupleBuilder();
    }

    @Override
    public WamlJava.TupleBuilder appendParam(WamlJava.TupleBuilder builder, @Nullable Object param) {
      builder.appendParam(param);
      return builder;
    }

    @Override
    public WamlJava.TupleBuilder appendParam(WamlJava.TupleBuilder builder, @Nullable Object label, @Nullable Object param) {
      builder.appendParam(label, param);
      return builder;
    }

    @Override
    public @Nullable Object buildTuple(WamlJava.TupleBuilder builder) {
      return builder.build();
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object value, WamlWriter writer) {
      return Write.error(new WriteException("no serialization for " + value));
    }

    @Override
    public Term intoTerm(@Nullable Object value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable Object fromTerm(Term term) {
      if (term.isValidObject()) {
        return term.objectValue();
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlJava", "tupleForm")
              .appendArgument(this.paramForm)
              .endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class TupleBuilder {

    @Nullable ArrayList<Object> list;
    @Nullable LinkedHashMap<String, Object> map;

    TupleBuilder() {
      this.list = null;
      this.map = null;
    }

    void appendParam(@Nullable Object param) {
      this.map = null;
      if (this.list == null) {
        this.list = new ArrayList<Object>();
      }
      this.list.add(param);
    }

    void appendParam(@Nullable Object label, @Nullable Object param) {
      String key = null;
      if (label instanceof String) {
        key = (String) label;
      } else if (label instanceof ChildExpr && ((ChildExpr) label).scope() instanceof ContextExpr) {
        final Term childKey = ((ChildExpr) label).key();
        if (childKey.isValidString()) {
          key = childKey.stringValue();
        }
      }

      if (this.list == null) {
        this.list = new ArrayList<Object>();
        this.map = new LinkedHashMap<String, Object>();
      }
      this.list.add(new SimpleEntry<String, Object>(key, param));
      if (this.map != null) {
        this.map.put(key, param);
      }
    }

    @Nullable Object build() {
      if (this.map != null) {
        return this.map;
      } else if (this.list != null) {
        return this.list;
      } else {
        return null;
      }
    }

  }

}
