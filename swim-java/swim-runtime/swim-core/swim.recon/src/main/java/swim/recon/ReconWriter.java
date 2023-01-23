// Copyright 2015-2023 Swim.inc
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

package swim.recon;

import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.util.Iterator;
import swim.codec.Base10;
import swim.codec.Base16;
import swim.codec.Output;
import swim.codec.Unicode;
import swim.codec.Writer;

/**
 * Factory for constructing Recon writers.
 */
public abstract class ReconWriter<I, V> {

  public ReconWriter() {
    // nop
  }

  public abstract boolean isField(I item);

  public abstract boolean isAttr(I item);

  public abstract boolean isSlot(I item);

  public abstract boolean isValue(I item);

  public abstract boolean isRecord(I item);

  public abstract boolean isText(I item);

  public abstract boolean isNum(I item);

  public abstract boolean isBool(I item);

  public abstract boolean isExpression(I item);

  public abstract boolean isExtant(I item);

  public abstract Iterator<I> items(I item);

  public abstract I item(V value);

  public abstract V key(I item);

  public abstract V value(I item);

  public abstract String string(I item);

  public abstract int precedence(I item);

  public abstract int sizeOfItem(I item);

  public abstract Writer<?, ?> writeItem(Output<?> output, I item);

  public abstract int sizeOfValue(V value);

  public abstract Writer<?, ?> writeValue(Output<?> output, V value);

  public abstract int sizeOfBlockValue(V value);

  public abstract Writer<?, ?> writeBlockValue(Output<?> output, V value);

  public int sizeOfAttr(V key, V value) {
    return AttrWriter.sizeOf(this, key, value);
  }

  public Writer<?, ?> writeAttr(Output<?> output, V key, V value) {
    return AttrWriter.write(output, this, key, value);
  }

  public int sizeOfSlot(V key, V value) {
    return SlotWriter.sizeOf(this, key, value);
  }

  public Writer<?, ?> writeSlot(Output<?> output, V key, V value) {
    return SlotWriter.write(output, this, key, value);
  }

  public abstract int sizeOfBlockItem(I item);

  public abstract Writer<?, ?> writeBlockItem(Output<?> output, I item);

  public int sizeOfBlock(Iterator<I> items, boolean inBlock, boolean inMarkup) {
    return BlockWriter.sizeOf(this, items, inBlock, inMarkup);
  }

  public Writer<?, ?> writeBlock(Output<?> output, Iterator<I> items, boolean inBlock, boolean inMarkup) {
    return BlockWriter.write(output, this, items, inBlock, inMarkup);
  }

  public int sizeOfBlock(I item) {
    final Iterator<I> items = this.items(item);
    if (items.hasNext()) {
      return BlockWriter.sizeOf(this, items, this.isBlockSafe(this.items(item)), false);
    } else {
      return 2; // "{}"
    }
  }

  public Writer<?, ?> writeBlock(Output<?> output, I item) {
    final Iterator<I> items = this.items(item);
    if (items.hasNext()) {
      return BlockWriter.write(output, this, items, this.isBlockSafe(this.items(item)), false);
    } else {
      return Unicode.writeString(output, "{}");
    }
  }

  public int sizeOfRecord(I item) {
    final Iterator<I> items = this.items(item);
    if (items.hasNext()) {
      return BlockWriter.sizeOf(this, items, false, false);
    } else {
      return 2; // "{}"
    }
  }

  public Writer<?, ?> writeRecord(Output<?> output, I item) {
    final Iterator<I> items = this.items(item);
    if (items.hasNext()) {
      return BlockWriter.write(output, this, items, false, false);
    } else {
      return Unicode.writeString(output, "{}");
    }
  }

  public int sizeOfPrimary(V value) {
    if (this.isRecord(this.item(value))) {
      final Iterator<I> items = this.items(this.item(value));
      if (items.hasNext()) {
        return PrimaryWriter.sizeOf(this, items);
      }
    } else if (!this.isExtant(this.item(value))) {
      return this.sizeOfValue(value);
    }
    return 2; // "()"
  }

  public Writer<?, ?> writePrimary(Output<?> output, V value) {
    if (this.isRecord(this.item(value))) {
      final Iterator<I> items = this.items(this.item(value));
      if (items.hasNext()) {
        return PrimaryWriter.write(output, this, items);
      }
    } else if (!this.isExtant(this.item(value))) {
      return this.writeValue(output, value);
    }
    return Unicode.writeString(output, "()");
  }

  public boolean isBlockSafe(Iterator<I> items) {
    while (items.hasNext()) {
      if (this.isAttr(items.next())) {
        return false;
      }
    }
    return true;
  }

  public boolean isMarkupSafe(Iterator<I> items) {
    if (!items.hasNext() || !this.isAttr(items.next())) {
      return false;
    }
    while (items.hasNext()) {
      if (this.isAttr(items.next())) {
        return false;
      }
    }
    return true;
  }

  public int sizeOfMarkupText(I item) {
    return this.sizeOfMarkupText(this.string(item));
  }

  public Writer<?, ?> writeMarkupText(Output<?> output, I item) {
    return this.writeMarkupText(output, this.string(item));
  }

  public int sizeOfMarkupText(String text) {
    return MarkupTextWriter.sizeOf(text);
  }

  public Writer<?, ?> writeMarkupText(Output<?> output, String text) {
    return MarkupTextWriter.write(output, text);
  }

  public int sizeOfData(int length) {
    return DataWriter.sizeOf(length);
  }

  public Writer<?, ?> writeData(Output<?> output, ByteBuffer value) {
    if (value != null) {
      return DataWriter.write(output, value);
    } else {
      return Unicode.writeString(output, "%");
    }
  }

  public boolean isIdent(I item) {
    return this.isIdent(this.string(item));
  }

  public boolean isIdent(String value) {
    final int n = value.length();
    if (n == 0 || !Recon.isIdentStartChar(value.codePointAt(0))) {
      return false;
    }
    for (int i = value.offsetByCodePoints(0, 1); i < n; i = value.offsetByCodePoints(i, 1)) {
      if (!Recon.isIdentChar(value.codePointAt(i))) {
        return false;
      }
    }
    return true;
  }

  public int sizeOfText(String value) {
    if (this.isIdent(value)) {
      return IdentWriter.sizeOf(value);
    } else {
      return StringWriter.sizeOf(value);
    }
  }

  public Writer<?, ?> writeText(Output<?> output, String value) {
    if (this.isIdent(value)) {
      return IdentWriter.write(output, value);
    } else {
      return StringWriter.write(output, value);
    }
  }

  public int sizeOfNum(int value) {
    int size = Base10.countDigits(value);
    if (value < 0) {
      size += 1;
    }
    return size;
  }

  public Writer<?, ?> writeNum(Output<?> output, int value) {
    return Base10.writeInt(output, value);
  }

  public int sizeOfNum(long value) {
    int size = Base10.countDigits(value);
    if (value < 0L) {
      size += 1;
    }
    return size;
  }

  public Writer<?, ?> writeNum(Output<?> output, long value) {
    return Base10.writeLong(output, value);
  }

  public int sizeOfNum(float value) {
    return Float.toString(value).length();
  }

  public Writer<?, ?> writeNum(Output<?> output, float value) {
    return Base10.writeFloat(output, value);
  }

  public int sizeOfNum(double value) {
    return Double.toString(value).length();
  }

  public Writer<?, ?> writeNum(Output<?> output, double value) {
    return Base10.writeDouble(output, value);
  }

  public int sizeOfNum(BigInteger value) {
    return value.toString().length();
  }

  public Writer<?, ?> writeNum(Output<?> output, BigInteger value) {
    return Unicode.writeString(output, value);
  }

  public int sizeOfUint32(int value) {
    return 10;
  }

  public Writer<?, ?> writeUint32(Output<?> output, int value) {
    return Base16.lowercase().writeIntLiteral(output, value, 8);
  }

  public int sizeOfUint64(long value) {
    return 18;
  }

  public Writer<?, ?> writeUint64(Output<?> output, long value) {
    return Base16.lowercase().writeLongLiteral(output, value, 16);
  }

  public int sizeOfBool(boolean value) {
    return value ? 4 : 5;
  }

  public Writer<?, ?> writeBool(Output<?> output, boolean value) {
    return Unicode.writeString(output, value ? "true" : "false");
  }

  public int sizeOfLambdaFunc(V bindings, V template) {
    return LambdaFuncWriter.sizeOf(this, bindings, template);
  }

  public Writer<?, ?> writeLambdaFunc(Output<?> output, V bindings, V template) {
    return LambdaFuncWriter.write(output, this, bindings, template);
  }

  public int sizeOfConditionalOperator(I ifTerm, I thenTerm, I elseTerm, int precedence) {
    return ConditionalOperatorWriter.sizeOf(this, ifTerm, thenTerm, elseTerm, precedence);
  }

  public Writer<?, ?> writeConditionalOperator(Output<?> output, I ifTerm, I thenTerm, I elseTerm, int precedence) {
    return ConditionalOperatorWriter.write(output, this, ifTerm, thenTerm, elseTerm, precedence);
  }

  public int sizeOfInfixOperator(I lhs, String operator, I rhs, int precedence) {
    return InfixOperatorWriter.sizeOf(this, lhs, operator, rhs, precedence);
  }

  public Writer<?, ?> writeInfixOperator(Output<?> output, I lhs, String operator, I rhs, int precedence) {
    return InfixOperatorWriter.write(output, this, lhs, operator, rhs, precedence);
  }

  public int sizeOfPrefixOperator(String operator, I operand, int precedence) {
    return PrefixOperatorWriter.sizeOf(this, operator, operand, precedence);
  }

  public Writer<?, ?> writePrefixOperator(Output<?> output, String operator, I operand, int precedence) {
    return PrefixOperatorWriter.write(output, this, operator, operand, precedence);
  }

  public int sizeOfInvokeOperator(V func, V args) {
    return InvokeOperatorWriter.sizeOf(this, func, args);
  }

  public Writer<?, ?> writeInvokeOperator(Output<?> output, V func, V args) {
    return InvokeOperatorWriter.write(output, this, func, args);
  }

  public abstract int sizeOfThen(V then);

  public abstract Writer<?, ?> writeThen(Output<?> output, V then);

  public int sizeOfIdentitySelector() {
    return 0;
  }

  public Writer<?, ?> writeIdentitySelector(Output<?> output) {
    return Writer.done();
  }

  public int sizeOfThenIdentitySelector() {
    return 0;
  }

  public Writer<?, ?> writeThenIdentitySelector(Output<?> output) {
    return Writer.done();
  }

  public int sizeOfLiteralSelector(I item, V then) {
    return LiteralSelectorWriter.sizeOf(this, item, then);
  }

  public Writer<?, ?> writeLiteralSelector(Output<?> output, I item, V then) {
    return LiteralSelectorWriter.write(output, this, item, then);
  }

  public int sizeOfThenLiteralSelector(I item, V then) {
    return 0;
  }

  public Writer<?, ?> writeThenLiteralSelector(Output<?> output, I item, V then) {
    return Writer.done();
  }

  public int sizeOfGetSelector(V key, V then) {
    return GetSelectorWriter.sizeOf(this, key, then);
  }

  public Writer<?, ?> writeGetSelector(Output<?> output, V key, V then) {
    return GetSelectorWriter.write(output, this, key, then);
  }

  public int sizeOfThenGetSelector(V key, V then) {
    return GetSelectorWriter.sizeOf(this, key, then);
  }

  public Writer<?, ?> writeThenGetSelector(Output<?> output, V key, V then) {
    return GetSelectorWriter.writeThen(output, this, key, then);
  }

  public int sizeOfGetAttrSelector(V key, V then) {
    return GetAttrSelectorWriter.sizeOf(this, key, then);
  }

  public Writer<?, ?> writeGetAttrSelector(Output<?> output, V key, V then) {
    return GetAttrSelectorWriter.write(output, this, key, then);
  }

  public int sizeOfThenGetAttrSelector(V key, V then) {
    return GetAttrSelectorWriter.sizeOf(this, key, then);
  }

  public Writer<?, ?> writeThenGetAttrSelector(Output<?> output, V key, V then) {
    return GetAttrSelectorWriter.writeThen(output, this, key, then);
  }

  public int sizeOfGetItemSelector(V index, V then) {
    return GetItemSelectorWriter.sizeOf(this, index, then);
  }

  public Writer<?, ?> writeGetItemSelector(Output<?> output, V index, V then) {
    return GetItemSelectorWriter.write(output, this, index, then);
  }

  public int sizeOfThenGetItemSelector(V index, V then) {
    return GetItemSelectorWriter.sizeOfThen(this, index, then);
  }

  public Writer<?, ?> writeThenGetItemSelector(Output<?> output, V index, V then) {
    return GetItemSelectorWriter.writeThen(output, this, index, then);
  }

  public int sizeOfKeysSelector(V then) {
    return KeysSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeKeysSelector(Output<?> output, V then) {
    return KeysSelectorWriter.write(output, this, then);
  }

  public int sizeOfThenKeysSelector(V then) {
    return KeysSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeThenKeysSelector(Output<?> output, V then) {
    return KeysSelectorWriter.writeThen(output, this, then);
  }

  public int sizeOfValuesSelector(V then) {
    return ValuesSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeValuesSelector(Output<?> output, V then) {
    return ValuesSelectorWriter.write(output, this, then);
  }

  public int sizeOfThenValuesSelector(V then) {
    return ValuesSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeThenValuesSelector(Output<?> output, V then) {
    return ValuesSelectorWriter.writeThen(output, this, then);
  }

  public int sizeOfChildrenSelector(V then) {
    return ChildrenSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeChildrenSelector(Output<?> output, V then) {
    return ChildrenSelectorWriter.write(output, this, then);
  }

  public int sizeOfThenChildrenSelector(V then) {
    return ChildrenSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeThenChildrenSelector(Output<?> output, V then) {
    return ChildrenSelectorWriter.writeThen(output, this, then);
  }

  public int sizeOfDescendantsSelector(V then) {
    return DescendantsSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeDescendantsSelector(Output<?> output, V then) {
    return DescendantsSelectorWriter.write(output, this, then);
  }

  public int sizeOfThenDescendantsSelector(V then) {
    return DescendantsSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeThenDescendantsSelector(Output<?> output, V then) {
    return DescendantsSelectorWriter.writeThen(output, this, then);
  }

  public int sizeOfFilterSelector(V predicate, V then) {
    return FilterSelectorWriter.sizeOf(this, predicate, then);
  }

  public Writer<?, ?> writeFilterSelector(Output<?> output, V predicate, V then) {
    return FilterSelectorWriter.write(output, this, predicate, then);
  }

  public int sizeOfThenFilterSelector(V predicate, V then) {
    return FilterSelectorWriter.sizeOfThen(this, predicate, then);
  }

  public Writer<?, ?> writeThenFilterSelector(Output<?> output, V predicate, V then) {
    return FilterSelectorWriter.writeThen(output, this, predicate, then);
  }

  public int sizeOfExtant() {
    return 0;
  }

  public Writer<?, ?> writeExtant(Output<?> output) {
    return Writer.done();
  }

  public int sizeOfAbsent() {
    return 0;
  }

  public Writer<?, ?> writeAbsent(Output<?> output) {
    return Writer.done();
  }

}
