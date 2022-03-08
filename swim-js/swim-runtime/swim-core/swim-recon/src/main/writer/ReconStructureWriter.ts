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

import type {Cursor} from "@swim/util";
import {Output, WriterException, Writer} from "@swim/codec";
import {
  Item,
  Field,
  Attr,
  Slot,
  Value,
  Record,
  Data,
  Text,
  Num,
  Bool,
  Expression,
  Operator,
  Selector,
  Func,
  Extant,
  Absent,
  ChildrenSelector,
  DescendantsSelector,
  FilterSelector,
  GetAttrSelector,
  GetItemSelector,
  GetSelector,
  IdentitySelector,
  KeysSelector,
  LiteralSelector,
  ValuesSelector,
  BinaryOperator,
  ConditionalOperator,
  InvokeOperator,
  UnaryOperator,
  BridgeFunc,
  LambdaFunc,
} from "@swim/structure";
import {ReconWriter} from "./ReconWriter";

/** @public */
export class ReconStructureWriter extends ReconWriter<Item, Value> {
  override isField(item: Item): boolean {
    return item instanceof Field;
  }

  override isAttr(item: Item): boolean {
    return item instanceof Attr;
  }

  override isSlot(item: Item): boolean {
    return item instanceof Slot;
  }

  override isValue(item: Item): boolean {
    return item instanceof Value;
  }

  override isRecord(item: Item): boolean {
    return item instanceof Record;
  }

  override isText(item: Item): boolean {
    return item instanceof Text;
  }

  override isNum(item: Item): boolean {
    return item instanceof Num;
  }

  override isBool(item: Item): boolean {
    return item instanceof Bool;
  }

  override isExpression(item: Item): boolean {
    return item instanceof Expression;
  }

  override isExtant(item: Item): boolean {
    return item instanceof Extant;
  }

  override items(item: Item): Cursor<Item> {
    return item.iterator();
  }

  override item(value: Value): Item {
    return value;
  }

  override key(item: Item): Value {
    return item.key;
  }

  override value(item: Item): Value {
    return item.toValue();
  }

  override string(item: Item): string {
    return item.stringValue("");
  }

  override precedence(item: Item): number {
    return item.precedence;
  }

  override sizeOfItem(item: Item): number {
    if (item instanceof Field) {
      if (item instanceof Attr) {
        return this.sizeOfAttr(item.key, item.value);
      } else if (item instanceof Slot) {
        return this.sizeOfSlot(item.key, item.value);
      }
    } else if (item instanceof Value) {
      return this.sizeOfValue(item);
    }
    throw new WriterException("No Recon serialization for " + item);
  }

  override writeItem(output: Output, item: Item): Writer {
    if (item instanceof Field) {
      if (item instanceof Attr) {
        return this.writeAttr(output, item.key, item.value);
      } else if (item instanceof Slot) {
        return this.writeSlot(output, item.key, item.value);
      }
    } else if (item instanceof Value) {
      return this.writeValue(output, item);
    }
    return Writer.error(new WriterException("No Recon serialization for " + item));
  }

  override sizeOfValue(value: Value): number {
    if (value instanceof Record) {
      return this.sizeOfRecord(value);
    } else if (value instanceof Data) {
      return this.sizeOfData(value.size);
    } else if (value instanceof Text) {
      return this.sizeOfText(value.value);
    } else if (value instanceof Num) {
      if (value.isUint32()) {
        return this.sizeOfUint32(value.value);
      } else if (value.isUint64()) {
        return this.sizeOfUint64(value.value);
      } else {
        return this.sizeOfNum(value.value);
      }
    } else if (value instanceof Bool) {
      return this.sizeOfBool(value.value);
    } else if (value instanceof Selector) {
      return this.sizeOfSelector(value);
    } else if (value instanceof Operator) {
      return this.sizeOfOperator(value);
    } else if (value instanceof Func) {
      return this.sizeOfFunc(value);
    } else if (value instanceof Extant) {
      return this.sizeOfExtant();
    } else if (value instanceof Absent) {
      return this.sizeOfAbsent();
    }
    throw new WriterException("No Recon serialization for " + value);
  }

  override writeValue(output: Output, value: Value): Writer {
    if (value instanceof Record) {
      return this.writeRecord(output, value);
    } else if (value instanceof Data) {
      return this.writeData(output, value.asUint8Array());
    } else if (value instanceof Text) {
      return this.writeText(output, value.value);
    } else if (value instanceof Num) {
      if (value.isUint32()) {
        return this.writeUint32(output, value.value);
      } else if (value.isUint64()) {
        return this.writeUint64(output, value.value);
      } else {
        return this.writeNum(output, value.value);
      }
    } else if (value instanceof Bool) {
      return this.writeBool(output, value.value);
    } else if (value instanceof Selector) {
      return this.writeSelector(output, value);
    } else if (value instanceof Operator) {
      return this.writeOperator(output, value);
    } else if (value instanceof Func) {
      return this.writeFunc(output, value);
    } else if (value instanceof Extant) {
      return this.writeExtant(output);
    } else if (value instanceof Absent) {
      return this.writeAbsent(output);
    }
    return Writer.error(new WriterException("No Recon serialization for " + value));
  }

  sizeOfSelector(selector: Selector): number {
    if (selector instanceof IdentitySelector) {
      return this.sizeOfIdentitySelector();
    } else if (selector instanceof LiteralSelector) {
      return this.sizeOfLiteralSelector(selector.item, selector.then);
    } else if (selector instanceof GetSelector) {
      return this.sizeOfGetSelector(selector.item, selector.then);
    } else if (selector instanceof GetAttrSelector) {
      return this.sizeOfGetAttrSelector(selector.item, selector.then);
    } else if (selector instanceof GetItemSelector) {
      return this.sizeOfGetItemSelector(selector.item, selector.then);
    } else if (selector instanceof KeysSelector) {
      return this.sizeOfKeysSelector(selector.then);
    } else if (selector instanceof ValuesSelector) {
      return this.sizeOfValuesSelector(selector.then);
    } else if (selector instanceof ChildrenSelector) {
      return this.sizeOfChildrenSelector(selector.then);
    } else if (selector instanceof DescendantsSelector) {
      return this.sizeOfDescendantsSelector(selector.then);
    } else if (selector instanceof FilterSelector) {
      return this.sizeOfFilterSelector(selector.predicate, selector.then);
    }
    throw new WriterException("No Recon serialization for " + selector);
  }

  writeSelector(output: Output, selector: Selector): Writer {
    if (selector instanceof IdentitySelector) {
      return this.writeIdentitySelector(output);
    } else if (selector instanceof LiteralSelector) {
      return this.writeLiteralSelector(output, selector.item, selector.then);
    } else if (selector instanceof GetSelector) {
      return this.writeGetSelector(output, selector.item, selector.then);
    } else if (selector instanceof GetAttrSelector) {
      return this.writeGetAttrSelector(output, selector.item, selector.then);
    } else if (selector instanceof GetItemSelector) {
      return this.writeGetItemSelector(output, selector.item, selector.then);
    } else if (selector instanceof KeysSelector) {
      return this.writeKeysSelector(output, selector.then);
    } else if (selector instanceof ValuesSelector) {
      return this.writeValuesSelector(output, selector.then);
    } else if (selector instanceof ChildrenSelector) {
      return this.writeChildrenSelector(output, selector.then);
    } else if (selector instanceof DescendantsSelector) {
      return this.writeDescendantsSelector(output, selector.then);
    } else if (selector instanceof FilterSelector) {
      return this.writeFilterSelector(output, selector.predicate, selector.then);
    }
    return Writer.error(new WriterException("No Recon serialization for " + selector));
  }

  sizeOfOperator(operator: Operator): number {
    if (operator instanceof BinaryOperator) {
      return this.sizeOfInfixOperator(operator.operand1, operator.operator, operator.operand2, operator.precedence);
    } else if (operator instanceof UnaryOperator) {
      return this.sizeOfPrefixOperator(operator.operator, operator.operand, operator.precedence);
    } else if (operator instanceof InvokeOperator) {
      return this.sizeOfInvokeOperator(operator.func, operator.args);
    } else if (operator instanceof ConditionalOperator) {
      return this.sizeOfConditionalOperator(operator.ifTerm, operator.thenTerm, operator.elseTerm, operator.precedence);
    }
    throw new WriterException("No Recon serialization for " + operator);
  }

  writeOperator(output: Output, operator: Operator): Writer {
    if (operator instanceof BinaryOperator) {
      return this.writeInfixOperator(output, operator.operand1, operator.operator, operator.operand2, operator.precedence);
    } else if (operator instanceof UnaryOperator) {
      return this.writePrefixOperator(output, operator.operator, operator.operand, operator.precedence);
    } else if (operator instanceof InvokeOperator) {
      return this.writeInvokeOperator(output, operator.func, operator.args);
    } else if (operator instanceof ConditionalOperator) {
      return this.writeConditionalOperator(output, operator.ifTerm, operator.thenTerm, operator.elseTerm, operator.precedence);
    }
    return Writer.error(new WriterException("No Recon serialization for " + operator));
  }

  sizeOfFunc(func: Func): number {
    if (func instanceof LambdaFunc) {
      return this.sizeOfLambdaFunc(func.bindings, func.template);
    } else if (func instanceof BridgeFunc) {
      return 0;
    }
    throw new WriterException("No Recon serialization for " + func);
  }

  writeFunc(output: Output, func: Func): Writer {
    if (func instanceof LambdaFunc) {
      return this.writeLambdaFunc(output, func.bindings, func.template);
    } else if (func instanceof BridgeFunc) {
      return Writer.end();
    }
    return Writer.error(new WriterException("No Recon serialization for " + func));
  }

  override sizeOfBlockItem(item: Item): number {
    if (item instanceof Field) {
      return this.sizeOfItem(item);
    } else if (item instanceof Value) {
      return this.sizeOfBlockValue(item);
    }
    throw new WriterException("No Recon serialization for " + item);
  }

  override writeBlockItem(output: Output, item: Item): Writer {
    if (item instanceof Field) {
      return this.writeItem(output, item);
    } else if (item instanceof Value) {
      return this.writeBlockValue(output, item);
    }
    return Writer.error(new WriterException("No Recon serialization for " + item));
  }

  override sizeOfBlockValue(value: Value): number {
    if (value instanceof Record) {
      return this.sizeOfBlock(value);
    }
    return this.sizeOfValue(value);
  }

  override writeBlockValue(output: Output, value: Value): Writer {
    if (value instanceof Record) {
      return this.writeBlock(output, value);
    }
    return this.writeValue(output, value);
  }

  override sizeOfThen(then: Value): number {
    if (then instanceof Selector) {
      if (then instanceof IdentitySelector) {
        return this.sizeOfThenIdentitySelector();
      } else if (then instanceof LiteralSelector) {
        return this.sizeOfThenLiteralSelector(then.item, then.then);
      } else if (then instanceof GetSelector) {
        return this.sizeOfThenGetSelector(then.item, then.then);
      } else if (then instanceof GetAttrSelector) {
        return this.sizeOfThenGetAttrSelector(then.item, then.then);
      } else if (then instanceof GetItemSelector) {
        return this.sizeOfThenGetItemSelector(then.item, then.then);
      } else if (then instanceof KeysSelector) {
        return this.sizeOfThenKeysSelector(then.then);
      } else if (then instanceof ValuesSelector) {
        return this.sizeOfThenValuesSelector(then.then);
      } else if (then instanceof ChildrenSelector) {
        return this.sizeOfThenChildrenSelector(then.then);
      } else if (then instanceof DescendantsSelector) {
        return this.sizeOfThenDescendantsSelector(then.then);
      } else if (then instanceof FilterSelector) {
        return this.sizeOfThenFilterSelector(then.predicate, then.then);
      }
    }
    throw new WriterException("No Recon serialization for " + then);
  }

  override writeThen(output: Output, then: Value): Writer {
    if (then instanceof Selector) {
      if (then instanceof IdentitySelector) {
        return this.writeThenIdentitySelector(output);
      } else if (then instanceof LiteralSelector) {
        return this.writeThenLiteralSelector(output, then.item, then.then);
      } else if (then instanceof GetSelector) {
        return this.writeThenGetSelector(output, then.item, then.then);
      } else if (then instanceof GetAttrSelector) {
        return this.writeThenGetAttrSelector(output, then.item, then.then);
      } else if (then instanceof GetItemSelector) {
        return this.writeThenGetItemSelector(output, then.item, then.then);
      } else if (then instanceof KeysSelector) {
        return this.writeThenKeysSelector(output, then.then);
      } else if (then instanceof ValuesSelector) {
        return this.writeThenValuesSelector(output, then.then);
      } else if (then instanceof ChildrenSelector) {
        return this.writeThenChildrenSelector(output, then.then);
      } else if (then instanceof DescendantsSelector) {
        return this.writeThenDescendantsSelector(output, then.then);
      } else if (then instanceof FilterSelector) {
        return this.writeThenFilterSelector(output, then.predicate, then.then);
      }
    }
    return Writer.error(new WriterException("No Recon serialization for " + then));
  }
}
