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

import java.lang.reflect.Type;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.time.Instant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Notation;
import swim.util.Severity;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class LangTerms implements TermProvider, WriteSource {

  final int priority;

  private LangTerms(int priority) {
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable TermForm<?> resolveTermForm(Type type) throws TermProviderException {
    if (type instanceof Class<?>) {
      final Class<?> classType = (Class<?>) type;
      if (classType == Boolean.class || classType == Boolean.TYPE) {
        return LangTerms.booleanForm();
      } else if (classType == Byte.class || classType == Byte.TYPE) {
        return LangTerms.byteForm();
      } else if (classType == Character.class || classType == Character.TYPE) {
        return LangTerms.charForm();
      } else if (classType == Short.class || classType == Short.TYPE) {
        return LangTerms.shortForm();
      } else if (classType == Integer.class || classType == Integer.TYPE) {
        return LangTerms.intForm();
      } else if (classType == Long.class || classType == Long.TYPE) {
        return LangTerms.longForm();
      } else if (classType == Float.class || classType == Float.TYPE) {
        return LangTerms.floatForm();
      } else if (classType == Double.class || classType == Double.TYPE) {
        return LangTerms.doubleForm();
      } else if (BigInteger.class.isAssignableFrom(classType)) {
        return LangTerms.bigIntegerForm();
      } else if (Number.class.isAssignableFrom(classType)) {
        return LangTerms.numberForm();
      } else if (classType == String.class) {
        return LangTerms.stringForm();
      } else if (ByteBuffer.class.isAssignableFrom(classType)) {
        return LangTerms.byteBufferForm();
      } else if (Instant.class.isAssignableFrom(classType)) {
        return LangTerms.instantForm();
      } else if (Throwable.class.isAssignableFrom(classType)) {
        return LangTerms.throwableForm();
      } else if (Severity.class.isAssignableFrom(classType)) {
        return LangTerms.severityForm();
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("LangTerms", "provider");
    if (this.priority != BUILTIN_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final LangTerms PROVIDER = new LangTerms(BUILTIN_PRIORITY);

  public static LangTerms provider(int priority) {
    if (priority == BUILTIN_PRIORITY) {
      return PROVIDER;
    }
    return new LangTerms(priority);
  }

  public static LangTerms provider() {
    return PROVIDER;
  }

  public static TermForm<Object> nullForm() {
    return NullForm.INSTANCE;
  }

  public static TermForm<Boolean> booleanForm() {
    return BooleanForm.INSTANCE;
  }

  public static TermForm<Byte> byteForm() {
    return ByteForm.INSTANCE;
  }

  public static TermForm<Character> charForm() {
    return CharForm.INSTANCE;
  }

  public static TermForm<Short> shortForm() {
    return ShortForm.INSTANCE;
  }

  public static TermForm<Integer> intForm() {
    return IntForm.INSTANCE;
  }

  public static TermForm<Long> longForm() {
    return LongForm.INSTANCE;
  }

  public static TermForm<Float> floatForm() {
    return FloatForm.INSTANCE;
  }

  public static TermForm<Double> doubleForm() {
    return DoubleForm.INSTANCE;
  }

  public static TermForm<BigInteger> bigIntegerForm() {
    return BigIntegerForm.INSTANCE;
  }

  public static TermForm<Number> numberForm() {
    return NumberForm.INSTANCE;
  }

  public static TermForm<String> stringForm() {
    return StringForm.INSTANCE;
  }

  public static TermForm<ByteBuffer> byteBufferForm() {
    return ByteBufferForm.INSTANCE;
  }

  public static TermForm<Instant> instantForm() {
    return InstantForm.INSTANCE;
  }

  public static TermForm<Throwable> throwableForm() {
    return ThrowableForm.INSTANCE;
  }

  public static TermForm<Severity> severityForm() {
    return SeverityForm.INSTANCE;
  }

  static final class NullForm implements TermForm<Object>, WriteSource {

    @Override
    public Term intoTerm(@Nullable Object value) {
      return NullTerm.of();
    }

    @Override
    public @Nullable Object fromTerm(Term term) {
      return null;
    }

    @Override
    public @Nullable Object initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "nullForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final NullForm INSTANCE = new NullForm();

  }

  static final class BooleanForm implements TermForm<Boolean>, WriteSource {

    @Override
    public Term intoTerm(@Nullable Boolean value) {
      if (value == null) {
        return Term.of();
      }
      return BooleanTerm.of(value.booleanValue());
    }

    @Override
    public @Nullable Boolean fromTerm(Term term) {
      if (term.isValidBoolean()) {
        return Boolean.valueOf(term.booleanValue());
      }
      return null;
    }

    @Override
    public Boolean initializer() {
      return Boolean.FALSE;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "booleanForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final BooleanForm INSTANCE = new BooleanForm();

  }

  static final class ByteForm implements TermForm<Byte>, WriteSource {

    @Override
    public Term intoTerm(@Nullable Byte value) {
      if (value == null) {
        return Term.of();
      }
      return ByteTerm.of(value.byteValue());
    }

    @Override
    public @Nullable Byte fromTerm(Term term) {
      if (term.isValidByte()) {
        return Byte.valueOf(term.byteValue());
      }
      return null;
    }

    @Override
    public Byte initializer() {
      return Byte.valueOf((byte) 0);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "byteForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ByteForm INSTANCE = new ByteForm();

  }

  static final class CharForm implements TermForm<Character>, WriteSource {

    @Override
    public Term intoTerm(@Nullable Character value) {
      if (value == null) {
        return Term.of();
      }
      return CharTerm.of(value.charValue());
    }

    @Override
    public @Nullable Character fromTerm(Term term) {
      if (term.isValidChar()) {
        return Character.valueOf(term.charValue());
      }
      return null;
    }

    @Override
    public Character initializer() {
      return Character.valueOf((char) 0);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "charForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final CharForm INSTANCE = new CharForm();

  }

  static final class ShortForm implements TermForm<Short>, WriteSource {

    @Override
    public Term intoTerm(@Nullable Short value) {
      if (value == null) {
        return Term.of();
      }
      return ShortTerm.of(value.shortValue());
    }

    @Override
    public @Nullable Short fromTerm(Term term) {
      if (term.isValidShort()) {
        return Short.valueOf(term.shortValue());
      }
      return null;
    }

    @Override
    public Short initializer() {
      return Short.valueOf((short) 0);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "shortForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ShortForm INSTANCE = new ShortForm();

  }

  static final class IntForm implements TermForm<Integer>, WriteSource {

    @Override
    public Term intoTerm(@Nullable Integer value) {
      if (value == null) {
        return Term.of();
      }
      return IntTerm.of(value.intValue());
    }

    @Override
    public @Nullable Integer fromTerm(Term term) {
      if (term.isValidInt()) {
        return Integer.valueOf(term.intValue());
      }
      return null;
    }

    @Override
    public Integer initializer() {
      return Integer.valueOf(0);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "intForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final IntForm INSTANCE = new IntForm();

  }

  static final class LongForm implements TermForm<Long>, WriteSource {

    @Override
    public Term intoTerm(@Nullable Long value) {
      if (value == null) {
        return Term.of();
      }
      return LongTerm.of(value.longValue());
    }

    @Override
    public @Nullable Long fromTerm(Term term) {
      if (term.isValidLong()) {
        return Long.valueOf(term.longValue());
      }
      return null;
    }

    @Override
    public Long initializer() {
      return Long.valueOf(0L);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "longForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final LongForm INSTANCE = new LongForm();

  }

  static final class FloatForm implements TermForm<Float>, WriteSource {

    @Override
    public Term intoTerm(@Nullable Float value) {
      if (value == null) {
        return Term.of();
      }
      return FloatTerm.of(value.floatValue());
    }

    @Override
    public @Nullable Float fromTerm(Term term) {
      if (term.isValidFloat()) {
        return Float.valueOf(term.floatValue());
      }
      return null;
    }

    @Override
    public Float initializer() {
      return Float.valueOf(0.0f);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "floatForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final FloatForm INSTANCE = new FloatForm();

  }

  static final class DoubleForm implements TermForm<Double>, WriteSource {

    @Override
    public Term intoTerm(@Nullable Double value) {
      if (value == null) {
        return Term.of();
      }
      return DoubleTerm.of(value.doubleValue());
    }

    @Override
    public @Nullable Double fromTerm(Term term) {
      if (term.isValidDouble()) {
        return Double.valueOf(term.doubleValue());
      }
      return null;
    }

    @Override
    public Double initializer() {
      return Double.valueOf(0.0);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "doubleForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final DoubleForm INSTANCE = new DoubleForm();

  }

  static final class BigIntegerForm implements TermForm<BigInteger>, WriteSource {

    @Override
    public Term intoTerm(@Nullable BigInteger value) {
      if (value == null) {
        return Term.of();
      }
      return BigIntegerTerm.of(value);
    }

    @Override
    public @Nullable BigInteger fromTerm(Term term) {
      if (term.isValidBigInteger()) {
        return term.bigIntegerValue();
      }
      return null;
    }

    @Override
    public BigInteger initializer() {
      return BigInteger.ZERO;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "bigIntegerForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final BigIntegerForm INSTANCE = new BigIntegerForm();

  }

  static final class NumberForm implements TermForm<Number>, WriteSource {

    @Override
    public Term intoTerm(@Nullable Number value) throws TermException {
      if (value == null) {
        return Term.of();
      } else if (value instanceof Byte) {
        return ByteTerm.of(value.byteValue());
      } else if (value instanceof Short) {
        return ShortTerm.of(value.shortValue());
      } else if (value instanceof Integer) {
        return IntTerm.of(value.intValue());
      } else if (value instanceof Long) {
        return LongTerm.of(value.longValue());
      } else if (value instanceof Float) {
        return FloatTerm.of(value.floatValue());
      } else if (value instanceof Double) {
        return DoubleTerm.of(value.doubleValue());
      } else if (value instanceof BigInteger) {
        return BigIntegerTerm.of((BigInteger) value);
      }
      throw new TermException("unsupported value: " + value);
    }

    @Override
    public @Nullable Number fromTerm(Term term) {
      if (term.isValidNumber()) {
        return term.numberValue();
      }
      return null;
    }

    @Override
    public @Nullable Number initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "numberForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final NumberForm INSTANCE = new NumberForm();

  }

  static final class StringForm implements TermForm<String>, WriteSource {

    @Override
    public Term intoTerm(@Nullable String value) {
      if (value == null) {
        return Term.of();
      }
      return StringTerm.of(value);
    }

    @Override
    public @Nullable String fromTerm(Term term) {
      if (term.isValidString()) {
        return term.stringValue();
      }
      return null;
    }

    @Override
    public @Nullable String initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "stringForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final StringForm INSTANCE = new StringForm();

  }

  static final class ByteBufferForm implements TermForm<ByteBuffer>, WriteSource {

    @Override
    public Term intoTerm(@Nullable ByteBuffer value) {
      if (value == null) {
        return Term.of();
      }
      return ByteBufferTerm.of(value);
    }

    @Override
    public @Nullable ByteBuffer fromTerm(Term term) {
      return term.objectValue(ByteBuffer.class);
    }

    @Override
    public @Nullable ByteBuffer initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "byteBufferForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ByteBufferForm INSTANCE = new ByteBufferForm();

  }

  static final class InstantForm implements TermForm<Instant>, WriteSource {

    @Override
    public Term intoTerm(@Nullable Instant value) {
      if (value == null) {
        return Term.of();
      }
      return InstantTerm.of(value);
    }

    @Override
    public @Nullable Instant fromTerm(Term term) {
      return term.objectValue(Instant.class);
    }

    @Override
    public @Nullable Instant initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "throwableForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final InstantForm INSTANCE = new InstantForm();

  }

  static final class ThrowableForm implements TermForm<Throwable>, WriteSource {

    @Override
    public Term intoTerm(@Nullable Throwable value) {
      if (value == null) {
        return Term.of();
      }
      return ThrowableTerm.of(value);
    }

    @Override
    public @Nullable Throwable fromTerm(Term term) {
      return term.objectValue(Throwable.class);
    }

    @Override
    public @Nullable Throwable initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "throwableForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ThrowableForm INSTANCE = new ThrowableForm();

  }

  static final class SeverityForm implements TermForm<Severity>, WriteSource {

    @Override
    public Term intoTerm(@Nullable Severity value) {
      if (value == null) {
        return Term.of();
      }
      return SeverityTerm.of(value);
    }

    @Override
    public @Nullable Severity fromTerm(Term term) {
      return term.objectValue(Severity.class);
    }

    @Override
    public @Nullable Severity initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangTerms", "severityForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final SeverityForm INSTANCE = new SeverityForm();

  }

}
