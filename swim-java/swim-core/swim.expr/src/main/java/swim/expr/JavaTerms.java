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

package swim.expr;

import java.lang.reflect.Type;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.time.Instant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.selector.ChildExpr;
import swim.expr.term.BigIntegerTerm;
import swim.expr.term.BooleanTerm;
import swim.expr.term.ByteBufferTerm;
import swim.expr.term.ByteTerm;
import swim.expr.term.CharTerm;
import swim.expr.term.DoubleTerm;
import swim.expr.term.FloatTerm;
import swim.expr.term.InstantTerm;
import swim.expr.term.IntTerm;
import swim.expr.term.LongTerm;
import swim.expr.term.NullTerm;
import swim.expr.term.ShortTerm;
import swim.expr.term.StringTerm;
import swim.expr.term.ThrowableTerm;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JavaTerms implements TermProvider, ToSource {

  final int priority;

  private JavaTerms(int priority) {
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable TermForm<?> resolveTermForm(Type javaType) throws TermFormException {
    if (javaType instanceof Class<?>) {
      final Class<?> javaClass = (Class<?>) javaType;
      if (javaClass == Boolean.class || javaClass == Boolean.TYPE) {
        return JavaTerms.booleanForm();
      } else if (javaClass == Byte.class || javaClass == Byte.TYPE) {
        return JavaTerms.byteForm();
      } else if (javaClass == Character.class || javaClass == Character.TYPE) {
        return JavaTerms.charForm();
      } else if (javaClass == Short.class || javaClass == Short.TYPE) {
        return JavaTerms.shortForm();
      } else if (javaClass == Integer.class || javaClass == Integer.TYPE) {
        return JavaTerms.intForm();
      } else if (javaClass == Long.class || javaClass == Long.TYPE) {
        return JavaTerms.longForm();
      } else if (javaClass == Float.class || javaClass == Float.TYPE) {
        return JavaTerms.floatForm();
      } else if (javaClass == Double.class || javaClass == Double.TYPE) {
        return JavaTerms.doubleForm();
      } else if (BigInteger.class.isAssignableFrom(javaClass)) {
        return JavaTerms.bigIntegerForm();
      } else if (Number.class.isAssignableFrom(javaClass)) {
        return JavaTerms.numberForm();
      } else if (javaClass == String.class) {
        return JavaTerms.stringForm();
      } else if (ByteBuffer.class.isAssignableFrom(javaClass)) {
        return JavaTerms.byteBufferForm();
      } else if (Instant.class.isAssignableFrom(javaClass)) {
        return JavaTerms.instantForm();
      } else if (Throwable.class.isAssignableFrom(javaClass)) {
        return JavaTerms.throwableForm();
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JavaTerms", "provider");
    if (this.priority != BUILTIN_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final JavaTerms PROVIDER = new JavaTerms(BUILTIN_PRIORITY);

  public static JavaTerms provider(int priority) {
    if (priority == BUILTIN_PRIORITY) {
      return PROVIDER;
    } else {
      return new JavaTerms(priority);
    }
  }

  public static JavaTerms provider() {
    return PROVIDER;
  }

  public static TermForm<Object> nullForm() {
    return JavaTerms.NullForm.INSTANCE;
  }

  public static IdentifierTermForm<String> identifierForm() {
    return JavaTerms.IdentifierForm.INSTANCE;
  }

  public static TermForm<Boolean> booleanForm() {
    return JavaTerms.BooleanForm.INSTANCE;
  }

  public static TermForm<Byte> byteForm() {
    return JavaTerms.ByteForm.INSTANCE;
  }

  public static TermForm<Character> charForm() {
    return JavaTerms.CharForm.INSTANCE;
  }

  public static TermForm<Short> shortForm() {
    return JavaTerms.ShortForm.INSTANCE;
  }

  public static TermForm<Integer> intForm() {
    return JavaTerms.IntForm.INSTANCE;
  }

  public static TermForm<Long> longForm() {
    return JavaTerms.LongForm.INSTANCE;
  }

  public static TermForm<Float> floatForm() {
    return JavaTerms.FloatForm.INSTANCE;
  }

  public static TermForm<Double> doubleForm() {
    return JavaTerms.DoubleForm.INSTANCE;
  }

  public static TermForm<BigInteger> bigIntegerForm() {
    return JavaTerms.BigIntegerForm.INSTANCE;
  }

  public static NumberTermForm<Number> numberForm() {
    return JavaTerms.NumberForm.INSTANCE;
  }

  public static StringTermForm<?, String> stringForm() {
    return JavaTerms.StringForm.INSTANCE;
  }

  public static TermForm<ByteBuffer> byteBufferForm() {
    return JavaTerms.ByteBufferForm.INSTANCE;
  }

  public static TermForm<Instant> instantForm() {
    return JavaTerms.InstantForm.INSTANCE;
  }

  public static TermForm<Throwable> throwableForm() {
    return JavaTerms.ThrowableForm.INSTANCE;
  }

  static final class NullForm implements TermForm<Object>, ToSource {

    @Override
    public Term intoTerm(@Nullable Object value) {
      return NullTerm.of();
    }

    @Override
    public @Nullable Object fromTerm(Term term) {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "nullForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.NullForm INSTANCE = new JavaTerms.NullForm();

  }

  static final class IdentifierForm implements IdentifierTermForm<String>, ToSource {

    @Override
    public Term intoTerm(@Nullable String value) {
      if (value == null) {
        return NullTerm.of();
      }
      switch (value) {
        case "undefined":
          return TrapTerm.of();
        case "null":
          return NullTerm.of();
        case "false":
          return BooleanTerm.of(false);
        case "true":
          return BooleanTerm.of(true);
        default:
          return new ChildExpr(ContextExpr.of(), StringTerm.of(value));
      }
    }

    @Override
    public @Nullable String fromTerm(Term term) {
      if (term instanceof NullTerm) {
        return "null";
      } else if (term instanceof BooleanTerm) {
        return ((BooleanTerm) term).booleanValue() ? "true" : "false";
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
    public String identifierValue(String value, ExprParser parser) {
      return value;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "identifierForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.IdentifierForm INSTANCE = new JavaTerms.IdentifierForm();

  }

  static final class BooleanForm implements TermForm<Boolean>, ToSource {

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
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "booleanForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.BooleanForm INSTANCE = new JavaTerms.BooleanForm();

  }

  static final class ByteForm implements TermForm<Byte>, ToSource {

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
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "byteForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.ByteForm INSTANCE = new JavaTerms.ByteForm();

  }

  static final class CharForm implements TermForm<Character>, ToSource {

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
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "charForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.CharForm INSTANCE = new JavaTerms.CharForm();

  }

  static final class ShortForm implements TermForm<Short>, ToSource {

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
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "shortForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.ShortForm INSTANCE = new JavaTerms.ShortForm();

  }

  static final class IntForm implements TermForm<Integer>, ToSource {

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
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "intForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.IntForm INSTANCE = new JavaTerms.IntForm();

  }

  static final class LongForm implements TermForm<Long>, ToSource {

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
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "longForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.LongForm INSTANCE = new JavaTerms.LongForm();

  }

  static final class FloatForm implements TermForm<Float>, ToSource {

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
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "floatForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.FloatForm INSTANCE = new JavaTerms.FloatForm();

  }

  static final class DoubleForm implements TermForm<Double>, ToSource {

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
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "doubleForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.DoubleForm INSTANCE = new JavaTerms.DoubleForm();

  }

  static final class BigIntegerForm implements TermForm<BigInteger>, ToSource {

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
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "bigIntegerForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.BigIntegerForm INSTANCE = new JavaTerms.BigIntegerForm();

  }

  static final class NumberForm implements NumberTermForm<Number>, ToSource {

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
      } else {
        throw new TermException("unsupported value: " + value);
      }
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
    public Number integerValue(long value) {
      if (value == (long) (int) value) {
        return Integer.valueOf((int) value);
      } else {
        return Long.valueOf(value);
      }
    }

    @Override
    public Number hexadecimalValue(long value, int digits) {
      if (digits <= 8) {
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
      return Double.parseDouble(value);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "numberForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.NumberForm INSTANCE = new JavaTerms.NumberForm();

  }

  static final class StringForm implements StringTermForm<StringBuilder, String>, ToSource {

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
      } else {
        return null;
      }
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
      return builder.toString();
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "stringForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.StringForm INSTANCE = new JavaTerms.StringForm();

  }

  static final class ByteBufferForm implements TermForm<ByteBuffer>, ToSource {

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
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "byteBufferForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.ByteBufferForm INSTANCE = new JavaTerms.ByteBufferForm();

  }

  static final class InstantForm implements TermForm<Instant>, ToSource {

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
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "throwableForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.InstantForm INSTANCE = new JavaTerms.InstantForm();

  }

  static final class ThrowableForm implements TermForm<Throwable>, ToSource {

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
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaTerms", "throwableForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaTerms.ThrowableForm INSTANCE = new JavaTerms.ThrowableForm();

  }

}
