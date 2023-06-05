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

package swim.repr;

import java.math.BigInteger;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.term.Evaluator;
import swim.term.Term;
import swim.term.TermGenerator;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class TermRepr implements Repr, ToSource {

  final Attrs attrs;
  final Term term;

  TermRepr(Attrs attrs, Term term) {
    this.attrs = attrs.commit();
    this.term = term;
  }

  @Override
  public Attrs attrs() {
    return this.attrs;
  }

  @Override
  public void setAttrs(Attrs attrs) {
    throw new UnsupportedOperationException("immutable");
  }

  @Override
  public TermRepr letAttrs(Attrs attrs) {
    return this.withAttrs(attrs);
  }

  @Override
  public TermRepr letAttr(String key, Repr value) {
    return this.letAttrs(this.attrs.let(key, value));
  }

  @Override
  public TermRepr letAttr(String key) {
    return this.letAttr(key, Repr.unit());
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public TermRepr withAttrs(Attrs attrs) {
    if (attrs == this.attrs) {
      return this;
    } else if (attrs == Attrs.empty()) {
      return TermRepr.of(this.term);
    }
    return new TermRepr(attrs, this.term);
  }

  @Override
  public TermRepr withAttr(String key, Repr value) {
    return this.withAttrs(this.attrs.updated(key, value));
  }

  @Override
  public TermRepr withAttr(String key) {
    return this.withAttr(key, Repr.unit());
  }

  public Term term() {
    return this.term;
  }

  @Override
  public int precedence() {
    return this.term.precedence();
  }

  @Override
  public boolean isGenerator() {
    return this.term.isGenerator();
  }

  @Override
  public TermGenerator generator() {
    return this.term.generator();
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    return this.term.evaluate(evaluator);
  }

  @Override
  public @Nullable Term getMember(Evaluator evaluator, String key) {
    Term member = this.term.getMember(evaluator, key);
    if (member == null) {
      member = Repr.super.getMember(evaluator, key);
    }
    return member;
  }

  @Override
  public @Nullable Term getChild(Evaluator evaluator, Term key) {
    return this.term.getChild(evaluator, key);
  }

  @Override
  public TermGenerator getChildren() {
    return this.term.getChildren();
  }

  @Override
  public TermGenerator getDescendants() {
    return this.term.getDescendants();
  }

  @Override
  public Term invoke(Evaluator evaluator, Term... args) {
    return this.term.invoke(evaluator, args);
  }

  @Override
  public Term bitwiseOr(Term that) {
    return this.term.bitwiseOr(that);
  }

  @Override
  public Term bitwiseXor(Term that) {
    return this.term.bitwiseXor(that);
  }

  @Override
  public Term bitwiseAnd(Term that) {
    return this.term.bitwiseAnd(that);
  }

  @Override
  public Term lt(Term that) {
    return this.term.lt(that);
  }

  @Override
  public Term le(Term that) {
    return this.term.le(that);
  }

  @Override
  public Term eq(Term that) {
    return this.term.eq(that);
  }

  @Override
  public Term ne(Term that) {
    return this.term.ne(that);
  }

  @Override
  public Term ge(Term that) {
    return this.term.ge(that);
  }

  @Override
  public Term gt(Term that) {
    return this.term.gt(that);
  }

  @Override
  public Term plus(Term that) {
    return this.term.plus(that);
  }

  @Override
  public Term minus(Term that) {
    return this.term.minus(that);
  }

  @Override
  public Term times(Term that) {
    return this.term.times(that);
  }

  @Override
  public Term divide(Term that) {
    return this.term.divide(that);
  }

  @Override
  public Term modulo(Term that) {
    return this.term.modulo(that);
  }

  @Override
  public Term not() {
    return this.term.not();
  }

  @Override
  public Term bitwiseNot() {
    return this.term.bitwiseNot();
  }

  @Override
  public Term negative() {
    return this.term.negative();
  }

  @Override
  public Term positive() {
    return this.term.positive();
  }

  @Override
  public Term inverse() {
    return this.term.inverse();
  }

  @Override
  public boolean isTruthy() {
    return this.term.isTruthy();
  }

  @Override
  public boolean isFalsey() {
    return this.term.isFalsey();
  }

  @Override
  public boolean isValidBoolean() {
    return this.term.isValidBoolean();
  }

  @Override
  public boolean booleanValue() {
    return this.term.booleanValue();
  }

  @Override
  public boolean isValidByte() {
    return this.term.isValidByte();
  }

  @Override
  public byte byteValue() {
    return this.term.byteValue();
  }

  @Override
  public boolean isValidShort() {
    return this.term.isValidShort();
  }

  @Override
  public short shortValue() {
    return this.term.shortValue();
  }

  @Override
  public boolean isValidInt() {
    return this.term.isValidInt();
  }

  @Override
  public int intValue() {
    return this.term.intValue();
  }

  @Override
  public boolean isValidLong() {
    return this.term.isValidLong();
  }

  @Override
  public long longValue() {
    return this.term.longValue();
  }

  @Override
  public boolean isValidFloat() {
    return this.term.isValidFloat();
  }

  @Override
  public float floatValue() {
    return this.term.floatValue();
  }

  @Override
  public boolean isValidDouble() {
    return this.term.isValidDouble();
  }

  @Override
  public double doubleValue() {
    return this.term.doubleValue();
  }

  @Override
  public boolean isValidBigInteger() {
    return this.term.isValidBigInteger();
  }

  @Override
  public BigInteger bigIntegerValue() {
    return this.term.bigIntegerValue();
  }

  @Override
  public boolean isValidNumber() {
    return this.term.isValidNumber();
  }

  @Override
  public Number numberValue() {
    return this.term.numberValue();
  }

  @Override
  public boolean isValidChar() {
    return this.term.isValidChar();
  }

  @Override
  public char charValue() {
    return this.term.charValue();
  }

  @Override
  public boolean isValidString() {
    return this.term.isValidString();
  }

  @Override
  public String stringValue() {
    return this.term.stringValue();
  }

  @Override
  public boolean isValidObject() {
    return this.term.isValidObject();
  }

  @Override
  public Object objectValue() {
    return this.term.objectValue();
  }

  @Override
  public String formatValue() {
    return this.term.formatValue();
  }

  @Override
  public boolean isMutable() {
    return false;
  }

  @Override
  public TermRepr commit() {
    return this;
  }

  @Override
  public Term flatten() {
    return this.term.flatten();
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TermRepr that) {
      return this.attrs.equals(that.attrs)
          && this.term.equals(that.term);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(TermRepr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.attrs.hashCode()), this.term.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("TermRepr", "of")
            .appendArgument(this.term)
            .endInvoke();
    if (!this.attrs.isEmpty()) {
      this.attrs.writeWithAttrs(notation);
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static TermRepr of(Term term) {
    if (term instanceof TermRepr) {
      return (TermRepr) term;
    }
    return new TermRepr(Attrs.empty(), term);
  }

}
