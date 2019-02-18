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

import {Cursor} from "@swim/util";
import {Output, Writer, Unicode, Base10, Base16} from "@swim/codec";
import {Recon} from "./Recon";
import {AttrWriter} from "./AttrWriter";
import {SlotWriter} from "./SlotWriter";
import {BlockWriter} from "./BlockWriter";
import {PrimaryWriter} from "./PrimaryWriter";
import {MarkupTextWriter} from "./MarkupTextWriter";
import {DataWriter} from "./DataWriter";
import {IdentWriter} from "./IdentWriter";
import {StringWriter} from "./StringWriter";
import {LambdaFuncWriter} from "./LambdaFuncWriter";
import {ConditionalOperatorWriter} from "./ConditionalOperatorWriter";
import {InfixOperatorWriter} from "./InfixOperatorWriter";
import {PrefixOperatorWriter} from "./PrefixOperatorWriter";
import {InvokeOperatorWriter} from "./InvokeOperatorWriter";
import {LiteralSelectorWriter} from "./LiteralSelectorWriter";
import {GetSelectorWriter} from "./GetSelectorWriter";
import {GetAttrSelectorWriter} from "./GetAttrSelectorWriter";
import {GetItemSelectorWriter} from "./GetItemSelectorWriter";
import {KeysSelectorWriter} from "./KeysSelectorWriter";
import {ValuesSelectorWriter} from "./ValuesSelectorWriter";
import {ChildrenSelectorWriter} from "./ChildrenSelectorWriter";
import {DescendantsSelectorWriter} from "./DescendantsSelectorWriter";
import {FilterSelectorWriter} from "./FilterSelectorWriter";

/**
 * Factory for constructing Recon writers.
 */
export abstract class ReconWriter<I, V> {
  abstract isField(item: I): boolean;

  abstract isAttr(item: I): boolean;

  abstract isSlot(item: I): boolean;

  abstract isValue(item: I): boolean;

  abstract isRecord(item: I): boolean;

  abstract isText(item: I): boolean;

  abstract isNum(item: I): boolean;

  abstract isBool(item: I): boolean;

  abstract isExpression(item: I): boolean;

  abstract isExtant(item: I): boolean;

  abstract items(item: I): Cursor<I>;

  abstract item(value: V): I;

  abstract key(item: I): V;

  abstract value(item: I): V;

  abstract string(item: I): string;

  abstract precedence(item: I): number;

  abstract sizeOfItem(item: I): number;

  abstract writeItem(item: I, output: Output): Writer;

  abstract sizeOfValue(value: V): number;

  abstract writeValue(value: V, output: Output): Writer;

  abstract sizeOfBlockValue(value: V): number;

  abstract writeBlockValue(value: V, output: Output): Writer;

  sizeOfAttr(key: V, value: V): number {
    return AttrWriter.sizeOf(this, key, value);
  }

  writeAttr(key: V, value: V, output: Output): Writer {
    return AttrWriter.write(output, this, key, value);
  }

  sizeOfSlot(key: V, value: V): number {
    return SlotWriter.sizeOf(this, key, value);
  }

  writeSlot(key: V, value: V, output: Output): Writer {
    return SlotWriter.write(output, this, key, value);
  }

  abstract sizeOfBlockItem(item: I): number;

  abstract writeBlockItem(item: I, output: Output): Writer;

  sizeOfBlock(item: I): number;
  sizeOfBlock(items: Cursor<I>, inBlock: boolean, inMarkup: boolean): number;
  sizeOfBlock(item: I | Cursor<I>, inBlock?: boolean, inMarkup?: boolean): number {
    if (arguments.length === 3) {
      return BlockWriter.sizeOf(this, item as Cursor<I>, inBlock!, inMarkup!);
    } else {
      const items = this.items(item as I);
      if (items.hasNext()) {
        return BlockWriter.sizeOf(this, items, this.isBlockSafe(this.items(item as I)), false);
      } else {
        return 2; // "{}"
      }
    }
  }

  writeBlock(item: I, output: Output): Writer;
  writeBlock(items: Cursor<I>, output: Output, inBlock: boolean, inMarkup: boolean): Writer;
  writeBlock(item: I | Cursor<I>, output: Output, inBlock?: boolean, inMarkup?: boolean): Writer {
    if (arguments.length === 4) {
      return BlockWriter.write(output, this, item as Cursor<I>, inBlock!, inMarkup!);
    } else {
      const items = this.items(item as I);
      if (items.hasNext()) {
        return BlockWriter.write(output, this, items, this.isBlockSafe(this.items(item as I)), false);
      } else {
        return Unicode.writeString("{}", output);
      }
    }
  }

  sizeOfRecord(item: I): number {
    const items = this.items(item);
    if (items.hasNext()) {
      return BlockWriter.sizeOf(this, items, false, false);
    } else {
      return 2; // "{}"
    }
  }

  writeRecord(item: I, output: Output): Writer {
    const items = this.items(item);
    if (items.hasNext()) {
      return BlockWriter.write(output, this, items, false, false);
    } else {
      return Unicode.writeString("{}", output);
    }
  }

  sizeOfPrimary(value: V): number {
    if (this.isRecord(this.item(value))) {
      const items = this.items(this.item(value));
      if (items.hasNext()) {
        return PrimaryWriter.sizeOf(this, items);
      }
    } else if (!this.isExtant(this.item(value))) {
      return this.sizeOfValue(value);
    }
    return 2; // "()"
  }

  writePrimary(value: V, output: Output): Writer {
    if (this.isRecord(this.item(value))) {
      const items = this.items(this.item(value));
      if (items.hasNext()) {
        return PrimaryWriter.write(output, this, items);
      }
    } else if (!this.isExtant(this.item(value))) {
      return this.writeValue(value, output);
    }
    return Unicode.writeString("()", output);
  }

  isBlockSafe(items: Cursor<I>): boolean {
    while (items.hasNext()) {
      if (this.isAttr(items.next().value!)) {
        return false;
      }
    }
    return true;
  }

  isMarkupSafe(items: Cursor<I>): boolean {
    if (!items.hasNext() || !this.isAttr(items.next().value!)) {
      return false;
    }
    while (items.hasNext()) {
      if (this.isAttr(items.next().value!)) {
        return false;
      }
    }
    return true;
  }

  sizeOfMarkupText(item: I | string): number {
    if (typeof item !== "string") {
      item = this.string(item);
    }
    return MarkupTextWriter.sizeOf(item);
  }

  writeMarkupText(item: I | string, output: Output): Writer {
    if (typeof item !== "string") {
      item = this.string(item);
    }
    return MarkupTextWriter.write(output, item);
  }

  sizeOfData(length: number): number {
    return DataWriter.sizeOf(length);
  }

  writeData(value: Uint8Array | undefined, output: Output): Writer {
    if (value) {
      return DataWriter.write(output, value);
    } else {
      return Unicode.writeString("%", output);
    }
  }

  isIdent(value: I | string): boolean {
    if (typeof value !== "string") {
      value = this.string(value);
    }
    const n = value.length;
    let c: number | undefined;
    if (n === 0 || (c = value.codePointAt(0), c !== void 0 && !Recon.isIdentStartChar(c))) {
      return false;
    }
    for (let i = value.offsetByCodePoints(0, 1); i < n; i = value.offsetByCodePoints(i, 1)) {
      c = value.codePointAt(i);
      if (c === void 0 || !Recon.isIdentChar(c)) {
        return false;
      }
    }
    return true;
  }

  sizeOfText(value: string): number {
    if (this.isIdent(value)) {
      return IdentWriter.sizeOf(value);
    } else {
      return StringWriter.sizeOf(value);
    }
  }

  writeText(value: string, output: Output): Writer {
    if (this.isIdent(value)) {
      return IdentWriter.write(output, value);
    } else {
      return StringWriter.write(output, value);
    }
  }

  sizeOfNum(value: number): number {
    if (isFinite(value) && Math.floor(value) === value && Math.abs(value) < 2147483648) {
      let size = Base10.countDigits(value);
      if (value < 0) {
        size += 1;
      }
      return size;
    } else {
      return ("" + value).length;
    }
  }

  writeNum(value: number, output: Output): Writer {
    if (isFinite(value) && Math.floor(value) === value && Math.abs(value) < 2147483648) {
      return Base10.writeInteger(value, output);
    } else {
      return Unicode.writeString("" + value, output);
    }
  }

  sizeOfUint32(value: number): number {
    return 10;
  }

  writeUint32(value: number, output: Output): Writer {
    return Base16.lowercase().writeIntegerLiteral(value, output, 8);
  }

  sizeOfUint64(value: number): number {
    return 18;
  }

  writeUint64(value: number, output: Output): Writer {
    return Base16.lowercase().writeIntegerLiteral(value, output, 16);
  }

  sizeOfBool(value: boolean): number {
    return value ? 4 : 5;
  }

  writeBool(value: boolean, output: Output): Writer {
    return Unicode.writeString(value ? "true" : "false", output);
  }

  sizeOfLambdaFunc(bindings: V, template: V): number {
    return LambdaFuncWriter.sizeOf(this, bindings, template);
  }

  writeLambdaFunc(bindings: V, template: V, output: Output): Writer {
    return LambdaFuncWriter.write(output, this, bindings, template);
  }

  sizeOfConditionalOperator(ifTerm: I, thenTerm: I, elseTerm: I, precedence: number): number {
    return ConditionalOperatorWriter.sizeOf(this, ifTerm, thenTerm, elseTerm, precedence);
  }

  writeConditionalOperator(ifTerm: I, thenTerm: I, elseTerm: I, precedence: number, output: Output): Writer {
    return ConditionalOperatorWriter.write(output, this, ifTerm, thenTerm, elseTerm, precedence);
  }

  sizeOfInfixOperator(lhs: I, operator: string, rhs: I, precedence: number): number {
    return InfixOperatorWriter.sizeOf(this, lhs, operator, rhs, precedence);
  }

  writeInfixOperator(lhs: I, operator: string, rhs: I, precedence: number, output: Output): Writer {
    return InfixOperatorWriter.write(output, this, lhs, operator, rhs, precedence);
  }

  sizeOfPrefixOperator(operator: string, rhs: I, precedence: number): number {
    return PrefixOperatorWriter.sizeOf(this, operator, rhs, precedence);
  }

  writePrefixOperator(operator: string, rhs: I, precedence: number, output: Output): Writer {
    return PrefixOperatorWriter.write(output, this, operator, rhs, precedence);
  }

  sizeOfInvokeOperator(func: V, args: V): number {
    return InvokeOperatorWriter.sizeOf(this, func, args);
  }

  writeInvokeOperator(func: V, args: V, output: Output): Writer {
    return InvokeOperatorWriter.write(output, this, func, args);
  }

  abstract sizeOfThen(then: V): number;

  abstract writeThen(then: V, output: Output): Writer;

  sizeOfIdentitySelector(): number {
    return 0;
  }

  writeIdentitySelector(output: Output): Writer {
    return Writer.done();
  }

  sizeOfThenIdentitySelector(): number {
    return 0;
  }

  writeThenIdentitySelector(output: Output): Writer {
    return Writer.done();
  }

  sizeOfLiteralSelector(item: I, then: V): number {
    return LiteralSelectorWriter.sizeOf(this, item, then);
  }

  writeLiteralSelector(item: I, then: V, output: Output): Writer {
    return LiteralSelectorWriter.write(output, this, item, then);
  }

  sizeOfThenLiteralSelector(item: I, then: V): number {
    return 0;
  }

  writeThenLiteralSelector(item: I, then: V, output: Output): Writer {
    return Writer.done();
  }

  sizeOfGetSelector(key: V, then: V): number {
    return GetSelectorWriter.sizeOf(this, key, then);
  }

  writeGetSelector(key: V, then: V, output: Output): Writer {
    return GetSelectorWriter.write(output, this, key, then);
  }

  sizeOfThenGetSelector(key: V, then: V): number {
    return GetSelectorWriter.sizeOf(this, key, then);
  }

  writeThenGetSelector(key: V, then: V, output: Output): Writer {
    return GetSelectorWriter.writeThen(output, this, key, then);
  }

  sizeOfGetAttrSelector(key: V, then: V): number {
    return GetAttrSelectorWriter.sizeOf(this, key, then);
  }

  writeGetAttrSelector(key: V, then: V, output: Output): Writer {
    return GetAttrSelectorWriter.write(output, this, key, then);
  }

  sizeOfThenGetAttrSelector(key: V, then: V): number {
    return GetAttrSelectorWriter.sizeOf(this, key, then);
  }

  writeThenGetAttrSelector(key: V, then: V, output: Output): Writer {
    return GetAttrSelectorWriter.writeThen(output, this, key, then);
  }

  sizeOfGetItemSelector(index: V, then: V): number {
    return GetItemSelectorWriter.sizeOf(this, index, then);
  }

  writeGetItemSelector(index: V, then: V, output: Output): Writer {
    return GetItemSelectorWriter.write(output, this, index, then);
  }

  sizeOfThenGetItemSelector(index: V, then: V): number {
    return GetItemSelectorWriter.sizeOfThen(this, index, then);
  }

  writeThenGetItemSelector(index: V, then: V, output: Output): Writer {
    return GetItemSelectorWriter.writeThen(output, this, index, then);
  }

  sizeOfKeysSelector(then: V): number {
    return KeysSelectorWriter.sizeOf(this, then);
  }

  writeKeysSelector(then: V, output: Output): Writer {
    return KeysSelectorWriter.write(output, this, then);
  }

  sizeOfThenKeysSelector(then: V): number {
    return KeysSelectorWriter.sizeOf(this, then);
  }

  writeThenKeysSelector(then: V, output: Output): Writer {
    return KeysSelectorWriter.writeThen(output, this, then);
  }

  sizeOfValuesSelector(then: V): number {
    return ValuesSelectorWriter.sizeOf(this, then);
  }

  writeValuesSelector(then: V, output: Output): Writer {
    return ValuesSelectorWriter.write(output, this, then);
  }

  sizeOfThenValuesSelector(then: V): number {
    return ValuesSelectorWriter.sizeOf(this, then);
  }

  writeThenValuesSelector(then: V, output: Output): Writer {
    return ValuesSelectorWriter.writeThen(output, this, then);
  }

  sizeOfChildrenSelector(then: V): number {
    return ChildrenSelectorWriter.sizeOf(this, then);
  }

  writeChildrenSelector(then: V, output: Output): Writer {
    return ChildrenSelectorWriter.write(output, this, then);
  }

  sizeOfThenChildrenSelector(then: V): number {
    return ChildrenSelectorWriter.sizeOf(this, then);
  }

  writeThenChildrenSelector(then: V, output: Output): Writer {
    return ChildrenSelectorWriter.writeThen(output, this, then);
  }

  sizeOfDescendantsSelector(then: V): number {
    return DescendantsSelectorWriter.sizeOf(this, then);
  }

  writeDescendantsSelector(then: V, output: Output): Writer {
    return DescendantsSelectorWriter.write(output, this, then);
  }

  sizeOfThenDescendantsSelector(then: V): number {
    return DescendantsSelectorWriter.sizeOf(this, then);
  }

  writeThenDescendantsSelector(then: V, output: Output): Writer {
    return DescendantsSelectorWriter.writeThen(output, this, then);
  }

  sizeOfFilterSelector(predicate: V, then: V): number {
    return FilterSelectorWriter.sizeOf(this, predicate, then);
  }

  writeFilterSelector(predicate: V, then: V, output: Output): Writer {
    return FilterSelectorWriter.write(output, this, predicate, then);
  }

  sizeOfThenFilterSelector(predicate: V, then: V): number {
    return FilterSelectorWriter.sizeOfThen(this, predicate, then);
  }

  writeThenFilterSelector(predicate: V, then: V, output: Output): Writer {
    return FilterSelectorWriter.writeThen(output, this, predicate, then);
  }

  sizeOfExtant(): number {
    return 0;
  }

  writeExtant(output: Output): Writer {
    return Writer.done();
  }

  sizeOfAbsent(): number {
    return 0;
  }

  writeAbsent(output: Output): Writer {
    return Writer.done();
  }
}
