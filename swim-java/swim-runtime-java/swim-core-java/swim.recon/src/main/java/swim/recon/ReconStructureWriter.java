// Copyright 2015-2021 Swim Inc.
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

import java.util.Iterator;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;
import swim.structure.Absent;
import swim.structure.Attr;
import swim.structure.Bool;
import swim.structure.Data;
import swim.structure.Expression;
import swim.structure.Extant;
import swim.structure.Field;
import swim.structure.Func;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Operator;
import swim.structure.Record;
import swim.structure.Selector;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import swim.structure.func.BridgeFunc;
import swim.structure.func.LambdaFunc;
import swim.structure.operator.BinaryOperator;
import swim.structure.operator.ConditionalOperator;
import swim.structure.operator.InvokeOperator;
import swim.structure.operator.UnaryOperator;
import swim.structure.selector.ChildrenSelector;
import swim.structure.selector.DescendantsSelector;
import swim.structure.selector.FilterSelector;
import swim.structure.selector.GetAttrSelector;
import swim.structure.selector.GetItemSelector;
import swim.structure.selector.GetSelector;
import swim.structure.selector.IdentitySelector;
import swim.structure.selector.KeysSelector;
import swim.structure.selector.LiteralSelector;
import swim.structure.selector.ValuesSelector;

public class ReconStructureWriter extends ReconWriter<Item, Value> {

  public ReconStructureWriter() {
    // nop
  }

  @Override
  public boolean isField(Item item) {
    return item instanceof Field;
  }

  @Override
  public boolean isAttr(Item item) {
    return item instanceof Attr;
  }

  @Override
  public boolean isSlot(Item item) {
    return item instanceof Slot;
  }

  @Override
  public boolean isValue(Item item) {
    return item instanceof Value;
  }

  @Override
  public boolean isRecord(Item item) {
    return item instanceof Record;
  }

  @Override
  public boolean isText(Item item) {
    return item instanceof Text;
  }

  @Override
  public boolean isNum(Item item) {
    return item instanceof Num;
  }

  @Override
  public boolean isBool(Item item) {
    return item instanceof Bool;
  }

  @Override
  public boolean isExpression(Item item) {
    return item instanceof Expression;
  }

  @Override
  public boolean isExtant(Item item) {
    return item instanceof Extant;
  }

  @Override
  public Iterator<Item> items(Item item) {
    return item.iterator();
  }

  @Override
  public Item item(Value value) {
    return value;
  }

  @Override
  public Value key(Item item) {
    return item.key();
  }

  @Override
  public Value value(Item item) {
    return item.toValue();
  }

  @Override
  public String string(Item item) {
    return item.stringValue();
  }

  @Override
  public int precedence(Item item) {
    return item.precedence();
  }

  @Override
  public int sizeOfItem(Item item) {
    if (item instanceof Field) {
      if (item instanceof Attr) {
        final Attr that = (Attr) item;
        return this.sizeOfAttr(that.key(), that.value());
      } else if (item instanceof Slot) {
        final Slot that = (Slot) item;
        return this.sizeOfSlot(that.key(), that.value());
      }
    } else if (item instanceof Value) {
      return this.sizeOfValue((Value) item);
    }
    throw new WriterException("No Recon serialization for " + item);
  }

  @Override
  public Writer<?, ?> writeItem(Output<?> output, Item item) {
    if (item instanceof Field) {
      if (item instanceof Attr) {
        final Attr that = (Attr) item;
        return this.writeAttr(output, that.key(), that.value());
      } else if (item instanceof Slot) {
        final Slot that = (Slot) item;
        return this.writeSlot(output, that.key(), that.value());
      }
    } else if (item instanceof Value) {
      return this.writeValue(output, (Value) item);
    }
    return Writer.error(new WriterException("No Recon serialization for " + item));
  }

  @Override
  public int sizeOfValue(Value value) {
    if (value instanceof Record) {
      final Record that = (Record) value;
      return this.sizeOfRecord(that);
    } else if (value instanceof Data) {
      final Data that = (Data) value;
      return this.sizeOfData(that.size());
    } else if (value instanceof Text) {
      final Text that = (Text) value;
      return this.sizeOfText(that.stringValue());
    } else if (value instanceof Num) {
      final Num that = (Num) value;
      if (that.isUint32()) {
        return this.sizeOfUint32(that.intValue());
      } else if (that.isUint64()) {
        return this.sizeOfUint64(that.longValue());
      } else if (that.isValidInt()) {
        return this.sizeOfNum(that.intValue());
      } else if (that.isValidLong()) {
        return this.sizeOfNum(that.longValue());
      } else if (that.isValidFloat()) {
        return this.sizeOfNum(that.floatValue());
      } else if (that.isValidDouble()) {
        return this.sizeOfNum(that.doubleValue());
      } else if (that.isValidInteger()) {
        return this.sizeOfNum(that.integerValue());
      }
    } else if (value instanceof Bool) {
      final Bool that = (Bool) value;
      return this.sizeOfBool(that.booleanValue());
    } else if (value instanceof Selector) {
      return this.sizeOfSelector((Selector) value);
    } else if (value instanceof Operator) {
      return this.sizeOfOperator((Operator) value);
    } else if (value instanceof Func) {
      return this.sizeOfFunc((Func) value);
    } else if (value instanceof Extant) {
      return this.sizeOfExtant();
    } else if (value instanceof Absent) {
      return this.sizeOfAbsent();
    }
    throw new WriterException("No Recon serialization for " + value);
  }

  @Override
  public Writer<?, ?> writeValue(Output<?> output, Value value) {
    if (value instanceof Record) {
      final Record that = (Record) value;
      return this.writeRecord(output, that);
    } else if (value instanceof Data) {
      final Data that = (Data) value;
      return this.writeData(output, that.asByteBuffer());
    } else if (value instanceof Text) {
      final Text that = (Text) value;
      return this.writeText(output, that.stringValue());
    } else if (value instanceof Num) {
      final Num that = (Num) value;
      if (that.isUint32()) {
        return this.writeUint32(output, that.intValue());
      } else if (that.isUint64()) {
        return this.writeUint64(output, that.longValue());
      } else if (that.isValidInt()) {
        return this.writeNum(output, that.intValue());
      } else if (that.isValidLong()) {
        return this.writeNum(output, that.longValue());
      } else if (that.isValidFloat()) {
        return this.writeNum(output, that.floatValue());
      } else if (that.isValidDouble()) {
        return this.writeNum(output, that.doubleValue());
      } else if (that.isValidInteger()) {
        return this.writeNum(output, that.integerValue());
      }
    } else if (value instanceof Bool) {
      final Bool that = (Bool) value;
      return this.writeBool(output, that.booleanValue());
    } else if (value instanceof Selector) {
      return this.writeSelector(output, (Selector) value);
    } else if (value instanceof Operator) {
      return this.writeOperator(output, (Operator) value);
    } else if (value instanceof Func) {
      return this.writeFunc(output, (Func) value);
    } else if (value instanceof Extant) {
      return this.writeExtant(output);
    } else if (value instanceof Absent) {
      return this.writeAbsent(output);
    }
    return Writer.error(new WriterException("No Recon serialization for " + value));
  }

  public int sizeOfSelector(Selector selector) {
    if (selector instanceof IdentitySelector) {
      return this.sizeOfIdentitySelector();
    } else if (selector instanceof LiteralSelector) {
      final LiteralSelector that = (LiteralSelector) selector;
      return this.sizeOfLiteralSelector(that.item(), that.then());
    } else if (selector instanceof GetSelector) {
      final GetSelector that = (GetSelector) selector;
      return this.sizeOfGetSelector(that.accessor(), that.then());
    } else if (selector instanceof GetAttrSelector) {
      final GetAttrSelector that = (GetAttrSelector) selector;
      return this.sizeOfGetAttrSelector(that.accessor(), that.then());
    } else if (selector instanceof GetItemSelector) {
      final GetItemSelector that = (GetItemSelector) selector;
      return this.sizeOfGetItemSelector(that.accessor(), that.then());
    } else if (selector instanceof KeysSelector) {
      final KeysSelector that = (KeysSelector) selector;
      return this.sizeOfKeysSelector(that.then());
    } else if (selector instanceof ValuesSelector) {
      final ValuesSelector that = (ValuesSelector) selector;
      return this.sizeOfValuesSelector(that.then());
    } else if (selector instanceof ChildrenSelector) {
      final ChildrenSelector that = (ChildrenSelector) selector;
      return this.sizeOfChildrenSelector(that.then());
    } else if (selector instanceof DescendantsSelector) {
      final DescendantsSelector that = (DescendantsSelector) selector;
      return this.sizeOfDescendantsSelector(that.then());
    } else if (selector instanceof FilterSelector) {
      final FilterSelector that = (FilterSelector) selector;
      return this.sizeOfFilterSelector(that.predicate(), that.then());
    }
    throw new WriterException("No Recon serialization for " + selector);
  }

  public Writer<?, ?> writeSelector(Output<?> output, Selector selector) {
    if (selector instanceof IdentitySelector) {
      return this.writeIdentitySelector(output);
    } else if (selector instanceof LiteralSelector) {
      final LiteralSelector that = (LiteralSelector) selector;
      return this.writeLiteralSelector(output, that.item(), that.then());
    } else if (selector instanceof GetSelector) {
      final GetSelector that = (GetSelector) selector;
      return this.writeGetSelector(output, that.accessor(), that.then());
    } else if (selector instanceof GetAttrSelector) {
      final GetAttrSelector that = (GetAttrSelector) selector;
      return this.writeGetAttrSelector(output, that.accessor(), that.then());
    } else if (selector instanceof GetItemSelector) {
      final GetItemSelector that = (GetItemSelector) selector;
      return this.writeGetItemSelector(output, that.accessor(), that.then());
    } else if (selector instanceof KeysSelector) {
      final KeysSelector that = (KeysSelector) selector;
      return this.writeKeysSelector(output, that.then());
    } else if (selector instanceof ValuesSelector) {
      final ValuesSelector that = (ValuesSelector) selector;
      return this.writeValuesSelector(output, that.then());
    } else if (selector instanceof ChildrenSelector) {
      final ChildrenSelector that = (ChildrenSelector) selector;
      return this.writeChildrenSelector(output, that.then());
    } else if (selector instanceof DescendantsSelector) {
      final DescendantsSelector that = (DescendantsSelector) selector;
      return this.writeDescendantsSelector(output, that.then());
    } else if (selector instanceof FilterSelector) {
      final FilterSelector that = (FilterSelector) selector;
      return this.writeFilterSelector(output, that.predicate(), that.then());
    }
    return Writer.error(new WriterException("No Recon serialization for " + selector));
  }

  public int sizeOfOperator(Operator operator) {
    if (operator instanceof BinaryOperator) {
      final BinaryOperator that = (BinaryOperator) operator;
      return this.sizeOfInfixOperator(that.lhs(), that.operator(), that.rhs(), that.precedence());
    } else if (operator instanceof UnaryOperator) {
      final UnaryOperator that = (UnaryOperator) operator;
      return this.sizeOfPrefixOperator(that.operator(), that.operand(), that.precedence());
    } else if (operator instanceof InvokeOperator) {
      final InvokeOperator that = (InvokeOperator) operator;
      return this.sizeOfInvokeOperator(that.func(), that.args());
    } else if (operator instanceof ConditionalOperator) {
      final ConditionalOperator that = (ConditionalOperator) operator;
      return this.sizeOfConditionalOperator(that.ifTerm(), that.thenTerm(), that.elseTerm(), that.precedence());
    }
    throw new WriterException("No Recon serialization for " + operator);
  }

  public Writer<?, ?> writeOperator(Output<?> output, Operator operator) {
    if (operator instanceof BinaryOperator) {
      final BinaryOperator that = (BinaryOperator) operator;
      return this.writeInfixOperator(output, that.lhs(), that.operator(), that.rhs(), that.precedence());
    } else if (operator instanceof UnaryOperator) {
      final UnaryOperator that = (UnaryOperator) operator;
      return this.writePrefixOperator(output, that.operator(), that.operand(), that.precedence());
    } else if (operator instanceof InvokeOperator) {
      final InvokeOperator that = (InvokeOperator) operator;
      return this.writeInvokeOperator(output, that.func(), that.args());
    } else if (operator instanceof ConditionalOperator) {
      final ConditionalOperator that = (ConditionalOperator) operator;
      return this.writeConditionalOperator(output, that.ifTerm(), that.thenTerm(), that.elseTerm(), that.precedence());
    }
    return Writer.error(new WriterException("No Recon serialization for " + operator));
  }

  public int sizeOfFunc(Func func) {
    if (func instanceof LambdaFunc) {
      final LambdaFunc that = (LambdaFunc) func;
      return this.sizeOfLambdaFunc(that.bindings(), that.template());
    } else if (func instanceof BridgeFunc) {
      return 0;
    }
    throw new WriterException("No Recon serialization for " + func);
  }

  public Writer<?, ?> writeFunc(Output<?> output, Func func) {
    if (func instanceof LambdaFunc) {
      final LambdaFunc that = (LambdaFunc) func;
      return this.writeLambdaFunc(output, that.bindings(), that.template());
    } else if (func instanceof BridgeFunc) {
      return Writer.done();
    }
    return Writer.error(new WriterException("No Recon serialization for " + func));
  }

  @Override
  public int sizeOfBlockItem(Item item) {
    if (item instanceof Field) {
      return this.sizeOfItem(item);
    } else if (item instanceof Value) {
      return this.sizeOfBlockValue((Value) item);
    }
    throw new WriterException("No Recon serialization for " + item);
  }

  @Override
  public Writer<?, ?> writeBlockItem(Output<?> output, Item item) {
    if (item instanceof Field) {
      return this.writeItem(output, item);
    } else if (item instanceof Value) {
      return this.writeBlockValue(output, (Value) item);
    }
    return Writer.error(new WriterException("No Recon serialization for " + item));
  }

  @Override
  public int sizeOfBlockValue(Value value) {
    if (value instanceof Record) {
      return this.sizeOfBlock((Record) value);
    }
    return this.sizeOfValue(value);
  }

  @Override
  public Writer<?, ?> writeBlockValue(Output<?> output, Value value) {
    if (value instanceof Record) {
      return this.writeBlock(output, (Record) value);
    }
    return this.writeValue(output, value);
  }

  @Override
  public int sizeOfThen(Value then) {
    if (then instanceof Selector) {
      final Selector selector = (Selector) then;
      if (selector instanceof IdentitySelector) {
        return this.sizeOfThenIdentitySelector();
      } else if (selector instanceof LiteralSelector) {
        final LiteralSelector that = (LiteralSelector) selector;
        return this.sizeOfThenLiteralSelector(that.item(), that.then());
      } else if (selector instanceof GetSelector) {
        final GetSelector that = (GetSelector) selector;
        return this.sizeOfThenGetSelector(that.accessor(), that.then());
      } else if (selector instanceof GetAttrSelector) {
        final GetAttrSelector that = (GetAttrSelector) selector;
        return this.sizeOfThenGetAttrSelector(that.accessor(), that.then());
      } else if (selector instanceof GetItemSelector) {
        final GetItemSelector that = (GetItemSelector) selector;
        return this.sizeOfThenGetItemSelector(that.accessor(), that.then());
      } else if (selector instanceof KeysSelector) {
        final KeysSelector that = (KeysSelector) selector;
        return this.sizeOfThenKeysSelector(that.then());
      } else if (selector instanceof ValuesSelector) {
        final ValuesSelector that = (ValuesSelector) selector;
        return this.sizeOfThenValuesSelector(that.then());
      } else if (selector instanceof ChildrenSelector) {
        final ChildrenSelector that = (ChildrenSelector) selector;
        return this.sizeOfThenChildrenSelector(that.then());
      } else if (selector instanceof DescendantsSelector) {
        final DescendantsSelector that = (DescendantsSelector) selector;
        return this.sizeOfThenDescendantsSelector(that.then());
      } else if (selector instanceof FilterSelector) {
        final FilterSelector that = (FilterSelector) selector;
        return this.sizeOfThenFilterSelector(that.predicate(), that.then());
      }
    }
    throw new WriterException("No Recon serialization for " + then);
  }

  @Override
  public Writer<?, ?> writeThen(Output<?> output, Value then) {
    if (then instanceof Selector) {
      final Selector selector = (Selector) then;
      if (selector instanceof IdentitySelector) {
        return this.writeThenIdentitySelector(output);
      } else if (selector instanceof LiteralSelector) {
        final LiteralSelector that = (LiteralSelector) selector;
        return this.writeThenLiteralSelector(output, that.item(), that.then());
      } else if (selector instanceof GetSelector) {
        final GetSelector that = (GetSelector) selector;
        return this.writeThenGetSelector(output, that.accessor(), that.then());
      } else if (selector instanceof GetAttrSelector) {
        final GetAttrSelector that = (GetAttrSelector) selector;
        return this.writeThenGetAttrSelector(output, that.accessor(), that.then());
      } else if (selector instanceof GetItemSelector) {
        final GetItemSelector that = (GetItemSelector) selector;
        return this.writeThenGetItemSelector(output, that.accessor(), that.then());
      } else if (selector instanceof KeysSelector) {
        final KeysSelector that = (KeysSelector) selector;
        return this.writeThenKeysSelector(output, that.then());
      } else if (selector instanceof ValuesSelector) {
        final ValuesSelector that = (ValuesSelector) selector;
        return this.writeThenValuesSelector(output, that.then());
      } else if (selector instanceof ChildrenSelector) {
        final ChildrenSelector that = (ChildrenSelector) selector;
        return this.writeThenChildrenSelector(output, that.then());
      } else if (selector instanceof DescendantsSelector) {
        final DescendantsSelector that = (DescendantsSelector) selector;
        return this.writeThenDescendantsSelector(output, that.then());
      } else if (selector instanceof FilterSelector) {
        final FilterSelector that = (FilterSelector) selector;
        return this.writeThenFilterSelector(output, that.predicate(), that.then());
      }
    }
    return Writer.error(new WriterException("No Recon serialization for " + then));
  }

}
