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

export class ReconStructureWriter extends ReconWriter<Item, Value> {
  isField(item: Item): boolean {
    return item instanceof Field;
  }

  isAttr(item: Item): boolean {
    return item instanceof Attr;
  }

  isSlot(item: Item): boolean {
    return item instanceof Slot;
  }

  isValue(item: Item): boolean {
    return item instanceof Value;
  }

  isRecord(item: Item): boolean {
    return item instanceof Record;
  }

  isText(item: Item): boolean {
    return item instanceof Text;
  }

  isNum(item: Item): boolean {
    return item instanceof Num;
  }

  isBool(item: Item): boolean {
    return item instanceof Bool;
  }

  isExpression(item: Item): boolean {
    return item instanceof Expression;
  }

  isExtant(item: Item): boolean {
    return item instanceof Extant;
  }

  items(item: Item): Cursor<Item> {
    return item.iterator();
  }

  item(value: Value): Item {
    return value;
  }

  key(item: Item): Value {
    return item.key;
  }

  value(item: Item): Value {
    return item.toValue();
  }

  string(item: Item): string {
    return item.stringValue("");
  }

  precedence(item: Item): number {
    return item.precedence();
  }

  sizeOfItem(item: Item): number {
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

  writeItem(item: Item, output: Output): Writer {
    if (item instanceof Field) {
      if (item instanceof Attr) {
        return this.writeAttr(item.key, item.value, output);
      } else if (item instanceof Slot) {
        return this.writeSlot(item.key, item.value, output);
      }
    } else if (item instanceof Value) {
      return this.writeValue(item, output);
    }
    return Writer.error(new WriterException("No Recon serialization for " + item));
  }

  sizeOfValue(value: Value): number {
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

  writeValue(value: Value, output: Output): Writer {
    if (value instanceof Record) {
      return this.writeRecord(value, output);
    } else if (value instanceof Data) {
      return this.writeData(value.asUint8Array(), output);
    } else if (value instanceof Text) {
      return this.writeText(value.value, output);
    } else if (value instanceof Num) {
      if (value.isUint32()) {
        return this.writeUint32(value.value, output);
      } else if (value.isUint64()) {
        return this.writeUint64(value.value, output);
      } else {
        return this.writeNum(value.value, output);
      }
    } else if (value instanceof Bool) {
      return this.writeBool(value.value, output);
    } else if (value instanceof Selector) {
      return this.writeSelector(value, output);
    } else if (value instanceof Operator) {
      return this.writeOperator(value, output);
    } else if (value instanceof Func) {
      return this.writeFunc(value, output);
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
      return this.sizeOfLiteralSelector(selector.item(), selector.then());
    } else if (selector instanceof GetSelector) {
      return this.sizeOfGetSelector(selector.accessor(), selector.then());
    } else if (selector instanceof GetAttrSelector) {
      return this.sizeOfGetAttrSelector(selector.accessor(), selector.then());
    } else if (selector instanceof GetItemSelector) {
      return this.sizeOfGetItemSelector(selector.accessor(), selector.then());
    } else if (selector instanceof KeysSelector) {
      return this.sizeOfKeysSelector(selector.then());
    } else if (selector instanceof ValuesSelector) {
      return this.sizeOfValuesSelector(selector.then());
    } else if (selector instanceof ChildrenSelector) {
      return this.sizeOfChildrenSelector(selector.then());
    } else if (selector instanceof DescendantsSelector) {
      return this.sizeOfDescendantsSelector(selector.then());
    } else if (selector instanceof FilterSelector) {
      return this.sizeOfFilterSelector(selector.predicate(), selector.then());
    }
    throw new WriterException("No Recon serialization for " + selector);
  }

  writeSelector(selector: Selector, output: Output): Writer {
    if (selector instanceof IdentitySelector) {
      return this.writeIdentitySelector(output);
    } else if (selector instanceof LiteralSelector) {
      return this.writeLiteralSelector(selector.item(), selector.then(), output);
    } else if (selector instanceof GetSelector) {
      return this.writeGetSelector(selector.accessor(), selector.then(), output);
    } else if (selector instanceof GetAttrSelector) {
      return this.writeGetAttrSelector(selector.accessor(), selector.then(), output);
    } else if (selector instanceof GetItemSelector) {
      return this.writeGetItemSelector(selector.accessor(), selector.then(), output);
    } else if (selector instanceof KeysSelector) {
      return this.writeKeysSelector(selector.then(), output);
    } else if (selector instanceof ValuesSelector) {
      return this.writeValuesSelector(selector.then(), output);
    } else if (selector instanceof ChildrenSelector) {
      return this.writeChildrenSelector(selector.then(), output);
    } else if (selector instanceof DescendantsSelector) {
      return this.writeDescendantsSelector(selector.then(), output);
    } else if (selector instanceof FilterSelector) {
      return this.writeFilterSelector(selector.predicate(), selector.then(), output);
    }
    return Writer.error(new WriterException("No Recon serialization for " + selector));
  }

  sizeOfOperator(operator: Operator): number {
    if (operator instanceof BinaryOperator) {
      return this.sizeOfInfixOperator(operator.operand1(), operator.operator(), operator.operand2(), operator.precedence());
    } else if (operator instanceof UnaryOperator) {
      return this.sizeOfPrefixOperator(operator.operator(), operator.operand(), operator.precedence());
    } else if (operator instanceof InvokeOperator) {
      return this.sizeOfInvokeOperator(operator.func(), operator.args());
    } else if (operator instanceof ConditionalOperator) {
      return this.sizeOfConditionalOperator(operator.ifTerm(), operator.thenTerm(), operator.elseTerm(), operator.precedence());
    }
    throw new WriterException("No Recon serialization for " + operator);
  }

  writeOperator(operator: Operator, output: Output): Writer {
    if (operator instanceof BinaryOperator) {
      return this.writeInfixOperator(operator.operand1(), operator.operator(), operator.operand2(), operator.precedence(), output);
    } else if (operator instanceof UnaryOperator) {
      return this.writePrefixOperator(operator.operator(), operator.operand(), operator.precedence(), output);
    } else if (operator instanceof InvokeOperator) {
      return this.writeInvokeOperator(operator.func(), operator.args(), output);
    } else if (operator instanceof ConditionalOperator) {
      return this.writeConditionalOperator(operator.ifTerm(), operator.thenTerm(), operator.elseTerm(), operator.precedence(), output);
    }
    return Writer.error(new WriterException("No Recon serialization for " + operator));
  }

  sizeOfFunc(func: Func): number {
    if (func instanceof LambdaFunc) {
      return this.sizeOfLambdaFunc(func.bindings(), func.template());
    } else if (func instanceof BridgeFunc) {
      return 0;
    }
    throw new WriterException("No Recon serialization for " + func);
  }

  writeFunc(func: Func, output: Output): Writer {
    if (func instanceof LambdaFunc) {
      return this.writeLambdaFunc(func.bindings(), func.template(), output);
    } else if (func instanceof BridgeFunc) {
      return Writer.done();
    }
    return Writer.error(new WriterException("No Recon serialization for " + func));
  }

  sizeOfBlockItem(item: Item): number {
    if (item instanceof Field) {
      return this.sizeOfItem(item);
    } else if (item instanceof Value) {
      return this.sizeOfBlockValue(item);
    }
    throw new WriterException("No Recon serialization for " + item);
  }

  writeBlockItem(item: Item, output: Output): Writer {
    if (item instanceof Field) {
      return this.writeItem(item, output);
    } else if (item instanceof Value) {
      return this.writeBlockValue(item, output);
    }
    return Writer.error(new WriterException("No Recon serialization for " + item));
  }

  sizeOfBlockValue(value: Value): number {
    if (value instanceof Record) {
      return this.sizeOfBlock(value);
    }
    return this.sizeOfValue(value);
  }

  writeBlockValue(value: Value, output: Output): Writer {
    if (value instanceof Record) {
      return this.writeBlock(value, output);
    }
    return this.writeValue(value, output);
  }

  sizeOfThen(then: Value): number {
    if (then instanceof Selector) {
      if (then instanceof IdentitySelector) {
        return this.sizeOfThenIdentitySelector();
      } else if (then instanceof LiteralSelector) {
        return this.sizeOfThenLiteralSelector(then.item(), then.then());
      } else if (then instanceof GetSelector) {
        return this.sizeOfThenGetSelector(then.accessor(), then.then());
      } else if (then instanceof GetAttrSelector) {
        return this.sizeOfThenGetAttrSelector(then.accessor(), then.then());
      } else if (then instanceof GetItemSelector) {
        return this.sizeOfThenGetItemSelector(then.accessor(), then.then());
      } else if (then instanceof KeysSelector) {
        return this.sizeOfThenKeysSelector(then.then());
      } else if (then instanceof ValuesSelector) {
        return this.sizeOfThenValuesSelector(then.then());
      } else if (then instanceof ChildrenSelector) {
        return this.sizeOfThenChildrenSelector(then.then());
      } else if (then instanceof DescendantsSelector) {
        return this.sizeOfThenDescendantsSelector(then.then());
      } else if (then instanceof FilterSelector) {
        return this.sizeOfThenFilterSelector(then.predicate(), then.then());
      }
    }
    throw new WriterException("No Recon serialization for " + then);
  }

  writeThen(then: Value, output: Output): Writer {
    if (then instanceof Selector) {
      if (then instanceof IdentitySelector) {
        return this.writeThenIdentitySelector(output);
      } else if (then instanceof LiteralSelector) {
        return this.writeThenLiteralSelector(then.item(), then.then(), output);
      } else if (then instanceof GetSelector) {
        return this.writeThenGetSelector(then.accessor(), then.then(), output);
      } else if (then instanceof GetAttrSelector) {
        return this.writeThenGetAttrSelector(then.accessor(), then.then(), output);
      } else if (then instanceof GetItemSelector) {
        return this.writeThenGetItemSelector(then.accessor(), then.then(), output);
      } else if (then instanceof KeysSelector) {
        return this.writeThenKeysSelector(then.then(), output);
      } else if (then instanceof ValuesSelector) {
        return this.writeThenValuesSelector(then.then(), output);
      } else if (then instanceof ChildrenSelector) {
        return this.writeThenChildrenSelector(then.then(), output);
      } else if (then instanceof DescendantsSelector) {
        return this.writeThenDescendantsSelector(then.then(), output);
      } else if (then instanceof FilterSelector) {
        return this.writeThenFilterSelector(then.predicate(), then.then(), output);
      }
    }
    return Writer.error(new WriterException("No Recon serialization for " + then));
  }
}
