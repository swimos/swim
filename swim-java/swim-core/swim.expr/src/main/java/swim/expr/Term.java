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

import java.math.BigInteger;
import java.util.Collections;
import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Text;
import swim.codec.Write;
import swim.expr.selector.ChildMethod;
import swim.expr.selector.ChildrenExpr;
import swim.expr.selector.DescendantsExpr;
import swim.expr.selector.FilterMethod;
import swim.expr.term.BooleanTerm;
import swim.expr.term.ByteTerm;
import swim.expr.term.CharTerm;
import swim.expr.term.DoubleTerm;
import swim.expr.term.FloatTerm;
import swim.expr.term.IntTerm;
import swim.expr.term.LongTerm;
import swim.expr.term.ShortTerm;
import swim.expr.term.StringTerm;
import swim.util.Assume;

@Public
@Since("5.0")
public interface Term {

  default int precedence() {
    return 100;
  }

  default boolean isGenerator() {
    return false;
  }

  default TermGenerator generator() {
    return TermGenerator.of(this);
  }

  default Term evaluate(Evaluator evaluator) {
    return this;
  }

  default @Nullable Term getMember(Evaluator evaluator, String key) {
    if ("child".equals(key)) {
      return new ChildMethod(this);
    } else if ("children".equals(key)) {
      return new ChildrenExpr(this);
    } else if ("descendants".equals(key)) {
      return new DescendantsExpr(this);
    } else if ("filter".equals(key)) {
      return new FilterMethod(this);
    } else {
      return null;
    }
  }

  default @Nullable Term getChild(Evaluator evaluator, Term key) {
    return null;
  }

  default TermGenerator getChildren() {
    return TermGenerator.empty();
  }

  default TermGenerator getDescendants() {
    return new GenerateDescendants(this.getChildren());
  }

  default Term invoke(Evaluator evaluator, Term... args) {
    return Term.trap();
  }

  default Term bitwiseOr(Term that) {
    return Term.trap();
  }

  default Term bitwiseXor(Term that) {
    return Term.trap();
  }

  default Term bitwiseAnd(Term that) {
    return Term.trap();
  }

  default Term lt(Term that) {
    return Term.trap();
  }

  default Term le(Term that) {
    return Term.trap();
  }

  default Term eq(Term that) {
    return Term.trap();
  }

  default Term ne(Term that) {
    return Term.trap();
  }

  default Term ge(Term that) {
    return Term.trap();
  }

  default Term gt(Term that) {
    return Term.trap();
  }

  default Term plus(Term that) {
    return Term.trap();
  }

  default Term minus(Term that) {
    return Term.trap();
  }

  default Term times(Term that) {
    return Term.trap();
  }

  default Term divide(Term that) {
    return Term.trap();
  }

  default Term modulo(Term that) {
    return Term.trap();
  }

  default Term not() {
    return Term.trap();
  }

  default Term bitwiseNot() {
    return Term.trap();
  }

  default Term negative() {
    return Term.trap();
  }

  default Term positive() {
    return Term.trap();
  }

  default Term inverse() {
    return Term.trap();
  }

  default boolean isTruthy() {
    return !this.isValidBoolean() || this.booleanValue();
  }

  default boolean isFalsey() {
    return this.isValidBoolean() && !this.booleanValue();
  }

  default boolean isValidBoolean() {
    return false;
  }

  default boolean booleanValue() {
    throw new UnsupportedOperationException();
  }

  default boolean isValidByte() {
    if (this.isValidNumber()) {
      final Number number = this.numberValue();
      if (number instanceof Byte) {
        return true;
      } else if (number instanceof Short) {
        return number.shortValue() == (short) (byte) number.shortValue();
      } else if (number instanceof Integer) {
        return number.intValue() == (int) (byte) number.intValue();
      } else if (number instanceof Long) {
        return number.longValue() == (long) (byte) number.longValue();
      } else if (number instanceof Float) {
        return number.floatValue() == (float) (byte) number.floatValue();
      } else if (number instanceof Double) {
        return number.doubleValue() == (double) (byte) number.doubleValue();
      }
    }
    return false;
  }

  default byte byteValue() {
    return this.numberValue().byteValue();
  }

  default boolean isValidShort() {
    if (this.isValidNumber()) {
      final Number number = this.numberValue();
      if (number instanceof Byte || number instanceof Short) {
        return true;
      } else if (number instanceof Integer) {
        return number.intValue() == (int) (short) number.intValue();
      } else if (number instanceof Long) {
        return number.longValue() == (long) (short) number.longValue();
      } else if (number instanceof Float) {
        return number.floatValue() == (float) (short) number.floatValue();
      } else if (number instanceof Double) {
        return number.doubleValue() == (double) (short) number.doubleValue();
      }
    }
    return false;
  }

  default short shortValue() {
    return this.numberValue().shortValue();
  }

  default boolean isValidInt() {
    if (this.isValidNumber()) {
      final Number number = this.numberValue();
      if (number instanceof Byte || number instanceof Short || number instanceof Integer) {
        return true;
      } else if (number instanceof Long) {
        return number.longValue() == (long) (int) number.longValue();
      } else if (number instanceof Float) {
        return number.floatValue() == (float) (int) number.floatValue();
      } else if (number instanceof Double) {
        return number.doubleValue() == (double) (int) number.doubleValue();
      }
    }
    return false;
  }

  default int intValue() {
    return this.numberValue().intValue();
  }

  default boolean isValidLong() {
    if (this.isValidNumber()) {
      final Number number = this.numberValue();
      if (number instanceof Byte || number instanceof Short
          || number instanceof Integer || number instanceof Long) {
        return true;
      } else if (number instanceof Float) {
        return number.floatValue() == (float) (long) number.floatValue();
      } else if (number instanceof Double) {
        return number.doubleValue() == (double) (long) number.doubleValue();
      }
    }
    return false;
  }

  default long longValue() {
    return this.numberValue().longValue();
  }

  default boolean isValidFloat() {
    if (this.isValidNumber()) {
      final Number number = this.numberValue();
      if (number instanceof Byte || number instanceof Short) {
        return true;
      } else if (number instanceof Integer) {
        return number.intValue() == (int) (float) number.intValue();
      } else if (number instanceof Long) {
        return number.longValue() == (long) (float) number.longValue();
      } else if (number instanceof Float) {
        return true;
      } else if (number instanceof Double) {
        return number.doubleValue() == (double) (float) number.doubleValue();
      }
    }
    return false;
  }

  default float floatValue() {
    return this.numberValue().floatValue();
  }

  default boolean isValidDouble() {
    if (this.isValidNumber()) {
      final Number number = this.numberValue();
      if (number instanceof Byte || number instanceof Short || number instanceof Integer) {
        return true;
      } else if (number instanceof Long) {
        return number.longValue() == (long) (double) number.longValue();
      } else if (number instanceof Float || number instanceof Double) {
        return true;
      }
    }
    return false;
  }

  default double doubleValue() {
    return this.numberValue().doubleValue();
  }

  default boolean isValidBigInteger() {
    if (this.isValidNumber()) {
      final Number number = this.numberValue();
      if (number instanceof Byte || number instanceof Short
          || number instanceof Integer || number instanceof Long) {
        return true;
      } else if (number instanceof Float) {
        return number.floatValue() == (float) Math.rint((double) number.floatValue());
      } else if (number instanceof Double) {
        return number.doubleValue() == Math.rint(number.doubleValue());
      }
    }
    return false;
  }

  default BigInteger bigIntegerValue() {
    final Number number = this.numberValue();
    if (number instanceof Byte || number instanceof Short
        || number instanceof Integer || number instanceof Long) {
      return BigInteger.valueOf(number.longValue());
    } else if (number instanceof Float) {
      if (number.floatValue() == (float) (long) number.floatValue()) {
        return BigInteger.valueOf((long) number.floatValue());
      } else {
        return new BigInteger(Double.toString(Math.rint((double) number.floatValue())));
      }
    } else if (number instanceof Double) {
      if (number.doubleValue() == (double) (long) number.doubleValue()) {
        return BigInteger.valueOf((long) number.doubleValue());
      } else {
        return new BigInteger(Double.toString(Math.rint(number.doubleValue())));
      }
    } else if (number instanceof BigInteger) {
      return (BigInteger) number;
    } else {
      throw new UnsupportedOperationException();
    }
  }

  default boolean isValidNumber() {
    return false;
  }

  default Number numberValue() {
    throw new UnsupportedOperationException();
  }

  default boolean isValidChar() {
    return false;
  }

  default char charValue() {
    throw new UnsupportedOperationException();
  }

  default boolean isValidString() {
    return false;
  }

  default String stringValue() {
    throw new UnsupportedOperationException();
  }

  default boolean isValidObject() {
    return false;
  }

  default Object objectValue() {
    throw new UnsupportedOperationException();
  }

  default <T> @Nullable T objectValue(Class<T> objectClass) {
    if (this.isValidObject()) {
      final Object object = this.objectValue();
      if (objectClass.isInstance(object)) {
        return Assume.conforms(object);
      }
    }
    return null;
  }

  default String formatValue() {
    return this.toString();
  }

  default Write<?> writeFormat(Output<?> output) {
    return Text.transcoder().write(output, this.formatValue());
  }

  default Term commit() {
    return this;
  }

  default boolean canEqual(Term other) {
    return false;
  }

  static Term trap() {
    return TrapTerm.of();
  }

  static Term of(boolean value) {
    return BooleanTerm.of(value);
  }

  static Term of(byte value) {
    return ByteTerm.of(value);
  }

  static Term of(short value) {
    return ShortTerm.of(value);
  }

  static Term of(int value) {
    return IntTerm.of(value);
  }

  static Term of(long value) {
    return LongTerm.of(value);
  }

  static Term of(float value) {
    return FloatTerm.of(value);
  }

  static Term of(double value) {
    return DoubleTerm.of(value);
  }

  static Term of(char value) {
    return CharTerm.of(value);
  }

  static Term of(@Nullable String value) {
    if (value != null) {
      return StringTerm.of(value);
    } else {
      return Term.registry().intoTerm(value);
    }
  }

  static Term from(@Nullable Object value) {
    if (value instanceof Term) {
      return (Term) value;
    } else {
      return Term.registry().intoTerm(value);
    }
  }

  static TermRegistry registry() {
    return TermRegistry.REGISTRY;
  }

}

final class GenerateDescendants implements TermGenerator {

  final TermGenerator children;
  @Nullable TermGenerator descendants;

  GenerateDescendants(TermGenerator children) {
    this.children = children;
    this.descendants = null;
  }

  @Override
  public @Nullable Term evaluateNext(Evaluator evaluator) {
    do {
      if (this.descendants == null) {
        final Term child = this.children.evaluateNext(evaluator);
        if (child == null) {
          return null;
        }
        this.descendants = child.getDescendants();
      } else {
        final Term descendant = this.descendants.evaluateNext(evaluator);
        if (descendant != null) {
          return descendant.evaluate(evaluator);
        }
        this.descendants = null;
      }
    } while (true);
  }

}
