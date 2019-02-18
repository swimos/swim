// Copyright 2015-2019 SWIM.AI inc.
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

  public abstract Writer<?, ?> writeItem(I item, Output<?> output);

  public abstract int sizeOfValue(V value);

  public abstract Writer<?, ?> writeValue(V value, Output<?> output);

  public abstract int sizeOfBlockValue(V value);

  public abstract Writer<?, ?> writeBlockValue(V value, Output<?> output);

  public int sizeOfAttr(V key, V value) {
    return AttrWriter.sizeOf(this, key, value);
  }

  public Writer<?, ?> writeAttr(V key, V value, Output<?> output) {
    return AttrWriter.write(output, this, key, value);
  }

  public int sizeOfSlot(V key, V value) {
    return SlotWriter.sizeOf(this, key, value);
  }

  public Writer<?, ?> writeSlot(V key, V value, Output<?> output) {
    return SlotWriter.write(output, this, key, value);
  }

  public abstract int sizeOfBlockItem(I item);

  public abstract Writer<?, ?> writeBlockItem(I item, Output<?> output);

  public int sizeOfBlock(Iterator<I> items, boolean inBlock, boolean inMarkup) {
    return BlockWriter.sizeOf(this, items, inBlock, inMarkup);
  }

  public Writer<?, ?> writeBlock(Iterator<I> items, Output<?> output, boolean inBlock, boolean inMarkup) {
    return BlockWriter.write(output, this, items, inBlock, inMarkup);
  }

  public int sizeOfBlock(I item) {
    final Iterator<I> items = items(item);
    if (items.hasNext()) {
      return BlockWriter.sizeOf(this, items, isBlockSafe(items(item)), false);
    } else {
      return 2; // "{}"
    }
  }

  public Writer<?, ?> writeBlock(I item, Output<?> output) {
    final Iterator<I> items = items(item);
    if (items.hasNext()) {
      return BlockWriter.write(output, this, items, isBlockSafe(items(item)), false);
    } else {
      return Unicode.writeString("{}", output);
    }
  }

  public int sizeOfRecord(I item) {
    final Iterator<I> items = items(item);
    if (items.hasNext()) {
      return BlockWriter.sizeOf(this, items, false, false);
    } else {
      return 2; // "{}"
    }
  }

  public Writer<?, ?> writeRecord(I item, Output<?> output) {
    final Iterator<I> items = items(item);
    if (items.hasNext()) {
      return BlockWriter.write(output, this, items, false, false);
    } else {
      return Unicode.writeString("{}", output);
    }
  }

  public int sizeOfPrimary(V value) {
    if (isRecord(item(value))) {
      final Iterator<I> items = items(item(value));
      if (items.hasNext()) {
        return PrimaryWriter.sizeOf(this, items);
      }
    } else if (!isExtant(item(value))) {
      return sizeOfValue(value);
    }
    return 2; // "()"
  }

  public Writer<?, ?> writePrimary(V value, Output<?> output) {
    if (isRecord(item(value))) {
      final Iterator<I> items = items(item(value));
      if (items.hasNext()) {
        return PrimaryWriter.write(output, this, items);
      }
    } else if (!isExtant(item(value))) {
      return writeValue(value, output);
    }
    return Unicode.writeString("()", output);
  }

  public boolean isBlockSafe(Iterator<I> items) {
    while (items.hasNext()) {
      if (isAttr(items.next())) {
        return false;
      }
    }
    return true;
  }

  public boolean isMarkupSafe(Iterator<I> items) {
    if (!items.hasNext() || !isAttr(items.next())) {
      return false;
    }
    while (items.hasNext()) {
      if (isAttr(items.next())) {
        return false;
      }
    }
    return true;
  }

  public int sizeOfMarkupText(I item) {
    return sizeOfMarkupText(string(item));
  }

  public Writer<?, ?> writeMarkupText(I item, Output<?> output) {
    return writeMarkupText(string(item), output);
  }

  public int sizeOfMarkupText(String text) {
    return MarkupTextWriter.sizeOf(text);
  }

  public Writer<?, ?> writeMarkupText(String text, Output<?> output) {
    return MarkupTextWriter.write(output, text);
  }

  public int sizeOfData(int length) {
    return DataWriter.sizeOf(length);
  }

  public Writer<?, ?> writeData(ByteBuffer value, Output<?> output) {
    if (value != null) {
      return DataWriter.write(output, value);
    } else {
      return Unicode.writeString("%", output);
    }
  }

  public boolean isIdent(I item) {
    return isIdent(string(item));
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
    if (isIdent(value)) {
      return IdentWriter.sizeOf(value);
    } else {
      return StringWriter.sizeOf(value);
    }
  }

  public Writer<?, ?> writeText(String value, Output<?> output) {
    if (isIdent(value)) {
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

  public Writer<?, ?> writeNum(int value, Output<?> output) {
    return Base10.writeInt(value, output);
  }

  public int sizeOfNum(long value) {
    int size = Base10.countDigits(value);
    if (value < 0L) {
      size += 1;
    }
    return size;
  }

  public Writer<?, ?> writeNum(long value, Output<?> output) {
    return Base10.writeLong(value, output);
  }

  public int sizeOfNum(float value) {
    return Float.toString(value).length();
  }

  public Writer<?, ?> writeNum(float value, Output<?> output) {
    return Base10.writeFloat(value, output);
  }

  public int sizeOfNum(double value) {
    return Double.toString(value).length();
  }

  public Writer<?, ?> writeNum(double value, Output<?> output) {
    return Base10.writeDouble(value, output);
  }

  public int sizeOfNum(BigInteger value) {
    return value.toString().length();
  }

  public Writer<?, ?> writeNum(BigInteger value, Output<?> output) {
    return Unicode.writeString(value, output);
  }

  public int sizeOfUint32(int value) {
    return 10;
  }

  public Writer<?, ?> writeUint32(int value, Output<?> output) {
    return Base16.lowercase().writeIntLiteral(value, output, 8);
  }

  public int sizeOfUint64(long value) {
    return 18;
  }

  public Writer<?, ?> writeUint64(long value, Output<?> output) {
    return Base16.lowercase().writeLongLiteral(value, output, 16);
  }

  public int sizeOfBool(boolean value) {
    return value ? 4 : 5;
  }

  public Writer<?, ?> writeBool(boolean value, Output<?> output) {
    return Unicode.writeString(value ? "true" : "false", output);
  }

  public int sizeOfLambdaFunc(V bindings, V template) {
    return LambdaFuncWriter.sizeOf(this, bindings, template);
  }

  public Writer<?, ?> writeLambdaFunc(V bindings, V template, Output<?> output) {
    return LambdaFuncWriter.write(output, this, bindings, template);
  }

  public int sizeOfConditionalOperator(I ifTerm, I thenTerm, I elseTerm, int precedence) {
    return ConditionalOperatorWriter.sizeOf(this, ifTerm, thenTerm, elseTerm, precedence);
  }

  public Writer<?, ?> writeConditionalOperator(I ifTerm, I thenTerm, I elseTerm, int precedence, Output<?> output) {
    return ConditionalOperatorWriter.write(output, this, ifTerm, thenTerm, elseTerm, precedence);
  }

  public int sizeOfInfixOperator(I lhs, String operator, I rhs, int precedence) {
    return InfixOperatorWriter.sizeOf(this, lhs, operator, rhs, precedence);
  }

  public Writer<?, ?> writeInfixOperator(I lhs, String operator, I rhs, int precedence, Output<?> output) {
    return InfixOperatorWriter.write(output, this, lhs, operator, rhs, precedence);
  }

  public int sizeOfPrefixOperator(String operator, I operand, int precedence) {
    return PrefixOperatorWriter.sizeOf(this, operator, operand, precedence);
  }

  public Writer<?, ?> writePrefixOperator(String operator, I operand, int precedence, Output<?> output) {
    return PrefixOperatorWriter.write(output, this, operator, operand, precedence);
  }

  public int sizeOfInvokeOperator(V func, V args) {
    return InvokeOperatorWriter.sizeOf(this, func, args);
  }

  public Writer<?, ?> writeInvokeOperator(V func, V args, Output<?> output) {
    return InvokeOperatorWriter.write(output, this, func, args);
  }

  public abstract int sizeOfThen(V then);

  public abstract Writer<?, ?> writeThen(V then, Output<?> output);

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

  public Writer<?, ?> writeLiteralSelector(I item, V then, Output<?> output) {
    return LiteralSelectorWriter.write(output, this, item, then);
  }

  public int sizeOfThenLiteralSelector(I item, V then) {
    return 0;
  }

  public Writer<?, ?> writeThenLiteralSelector(I item, V then, Output<?> output) {
    return Writer.done();
  }

  public int sizeOfGetSelector(V key, V then) {
    return GetSelectorWriter.sizeOf(this, key, then);
  }

  public Writer<?, ?> writeGetSelector(V key, V then, Output<?> output) {
    return GetSelectorWriter.write(output, this, key, then);
  }

  public int sizeOfThenGetSelector(V key, V then) {
    return GetSelectorWriter.sizeOf(this, key, then);
  }

  public Writer<?, ?> writeThenGetSelector(V key, V then, Output<?> output) {
    return GetSelectorWriter.writeThen(output, this, key, then);
  }

  public int sizeOfGetAttrSelector(V key, V then) {
    return GetAttrSelectorWriter.sizeOf(this, key, then);
  }

  public Writer<?, ?> writeGetAttrSelector(V key, V then, Output<?> output) {
    return GetAttrSelectorWriter.write(output, this, key, then);
  }

  public int sizeOfThenGetAttrSelector(V key, V then) {
    return GetAttrSelectorWriter.sizeOf(this, key, then);
  }

  public Writer<?, ?> writeThenGetAttrSelector(V key, V then, Output<?> output) {
    return GetAttrSelectorWriter.writeThen(output, this, key, then);
  }

  public int sizeOfGetItemSelector(V index, V then) {
    return GetItemSelectorWriter.sizeOf(this, index, then);
  }

  public Writer<?, ?> writeGetItemSelector(V index, V then, Output<?> output) {
    return GetItemSelectorWriter.write(output, this, index, then);
  }

  public int sizeOfThenGetItemSelector(V index, V then) {
    return GetItemSelectorWriter.sizeOfThen(this, index, then);
  }

  public Writer<?, ?> writeThenGetItemSelector(V index, V then, Output<?> output) {
    return GetItemSelectorWriter.writeThen(output, this, index, then);
  }

  public int sizeOfKeysSelector(V then) {
    return KeysSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeKeysSelector(V then, Output<?> output) {
    return KeysSelectorWriter.write(output, this, then);
  }

  public int sizeOfThenKeysSelector(V then) {
    return KeysSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeThenKeysSelector(V then, Output<?> output) {
    return KeysSelectorWriter.writeThen(output, this, then);
  }

  public int sizeOfValuesSelector(V then) {
    return ValuesSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeValuesSelector(V then, Output<?> output) {
    return ValuesSelectorWriter.write(output, this, then);
  }

  public int sizeOfThenValuesSelector(V then) {
    return ValuesSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeThenValuesSelector(V then, Output<?> output) {
    return ValuesSelectorWriter.writeThen(output, this, then);
  }

  public int sizeOfChildrenSelector(V then) {
    return ChildrenSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeChildrenSelector(V then, Output<?> output) {
    return ChildrenSelectorWriter.write(output, this, then);
  }

  public int sizeOfThenChildrenSelector(V then) {
    return ChildrenSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeThenChildrenSelector(V then, Output<?> output) {
    return ChildrenSelectorWriter.writeThen(output, this, then);
  }

  public int sizeOfDescendantsSelector(V then) {
    return DescendantsSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeDescendantsSelector(V then, Output<?> output) {
    return DescendantsSelectorWriter.write(output, this, then);
  }

  public int sizeOfThenDescendantsSelector(V then) {
    return DescendantsSelectorWriter.sizeOf(this, then);
  }

  public Writer<?, ?> writeThenDescendantsSelector(V then, Output<?> output) {
    return DescendantsSelectorWriter.writeThen(output, this, then);
  }

  public int sizeOfFilterSelector(V predicate, V then) {
    return FilterSelectorWriter.sizeOf(this, predicate, then);
  }

  public Writer<?, ?> writeFilterSelector(V predicate, V then, Output<?> output) {
    return FilterSelectorWriter.write(output, this, predicate, then);
  }

  public int sizeOfThenFilterSelector(V predicate, V then) {
    return FilterSelectorWriter.sizeOfThen(this, predicate, then);
  }

  public Writer<?, ?> writeThenFilterSelector(V predicate, V then, Output<?> output) {
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
