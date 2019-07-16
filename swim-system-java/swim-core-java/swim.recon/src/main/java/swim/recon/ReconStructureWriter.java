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
        return sizeOfAttr(that.key(), that.value());
      } else if (item instanceof Slot) {
        final Slot that = (Slot) item;
        return sizeOfSlot(that.key(), that.value());
      }
    } else if (item instanceof Value) {
      return sizeOfValue((Value) item);
    }
    throw new WriterException("No Recon serialization for " + item);
  }

  @Override
  public Writer<?, ?> writeItem(Item item, Output<?> output) {
    if (item instanceof Field) {
      if (item instanceof Attr) {
        final Attr that = (Attr) item;
        return writeAttr(that.key(), that.value(), output);
      } else if (item instanceof Slot) {
        final Slot that = (Slot) item;
        return writeSlot(that.key(), that.value(), output);
      }
    } else if (item instanceof Value) {
      return writeValue((Value) item, output);
    }
    return Writer.error(new WriterException("No Recon serialization for " + item));
  }

  @Override
  public int sizeOfValue(Value value) {
    if (value instanceof Record) {
      final Record that = (Record) value;
      return sizeOfRecord(that);
    } else if (value instanceof Data) {
      final Data that = (Data) value;
      return sizeOfData(that.size());
    } else if (value instanceof Text) {
      final Text that = (Text) value;
      return sizeOfText(that.stringValue());
    } else if (value instanceof Num) {
      final Num that = (Num) value;
      if (that.isUint32()) {
        return sizeOfUint32(that.intValue());
      } else if (that.isUint64()) {
        return sizeOfUint64(that.longValue());
      } else if (that.isValidInt()) {
        return sizeOfNum(that.intValue());
      } else if (that.isValidLong()) {
        return sizeOfNum(that.longValue());
      } else if (that.isValidFloat()) {
        return sizeOfNum(that.floatValue());
      } else if (that.isValidDouble()) {
        return sizeOfNum(that.doubleValue());
      } else if (that.isValidInteger()) {
        return sizeOfNum(that.integerValue());
      }
    } else if (value instanceof Bool) {
      final Bool that = (Bool) value;
      return sizeOfBool(that.booleanValue());
    } else if (value instanceof Selector) {
      return sizeOfSelector((Selector) value);
    } else if (value instanceof Operator) {
      return sizeOfOperator((Operator) value);
    } else if (value instanceof Func) {
      return sizeOfFunc((Func) value);
    } else if (value instanceof Extant) {
      return sizeOfExtant();
    } else if (value instanceof Absent) {
      return sizeOfAbsent();
    }
    throw new WriterException("No Recon serialization for " + value);
  }

  @Override
  public Writer<?, ?> writeValue(Value value, Output<?> output) {
    if (value instanceof Record) {
      final Record that = (Record) value;
      return writeRecord(that, output);
    } else if (value instanceof Data) {
      final Data that = (Data) value;
      return writeData(that.asByteBuffer(), output);
    } else if (value instanceof Text) {
      final Text that = (Text) value;
      return writeText(that.stringValue(), output);
    } else if (value instanceof Num) {
      final Num that = (Num) value;
      if (that.isUint32()) {
        return writeUint32(that.intValue(), output);
      } else if (that.isUint64()) {
        return writeUint64(that.longValue(), output);
      } else if (that.isValidInt()) {
        return writeNum(that.intValue(), output);
      } else if (that.isValidLong()) {
        return writeNum(that.longValue(), output);
      } else if (that.isValidFloat()) {
        return writeNum(that.floatValue(), output);
      } else if (that.isValidDouble()) {
        return writeNum(that.doubleValue(), output);
      } else if (that.isValidInteger()) {
        return writeNum(that.integerValue(), output);
      }
    } else if (value instanceof Bool) {
      final Bool that = (Bool) value;
      return writeBool(that.booleanValue(), output);
    } else if (value instanceof Selector) {
      return writeSelector((Selector) value, output);
    } else if (value instanceof Operator) {
      return writeOperator((Operator) value, output);
    } else if (value instanceof Func) {
      return writeFunc((Func) value, output);
    } else if (value instanceof Extant) {
      return writeExtant(output);
    } else if (value instanceof Absent) {
      return writeAbsent(output);
    }
    return Writer.error(new WriterException("No Recon serialization for " + value));
  }

  public int sizeOfSelector(Selector selector) {
    if (selector instanceof IdentitySelector) {
      return sizeOfIdentitySelector();
    } else if (selector instanceof LiteralSelector) {
      final LiteralSelector that = (LiteralSelector) selector;
      return sizeOfLiteralSelector(that.item(), that.then());
    } else if (selector instanceof GetSelector) {
      final GetSelector that = (GetSelector) selector;
      return sizeOfGetSelector(that.accessor(), that.then());
    } else if (selector instanceof GetAttrSelector) {
      final GetAttrSelector that = (GetAttrSelector) selector;
      return sizeOfGetAttrSelector(that.accessor(), that.then());
    } else if (selector instanceof GetItemSelector) {
      final GetItemSelector that = (GetItemSelector) selector;
      return sizeOfGetItemSelector(that.accessor(), that.then());
    } else if (selector instanceof KeysSelector) {
      final KeysSelector that = (KeysSelector) selector;
      return sizeOfKeysSelector(that.then());
    } else if (selector instanceof ValuesSelector) {
      final ValuesSelector that = (ValuesSelector) selector;
      return sizeOfValuesSelector(that.then());
    } else if (selector instanceof ChildrenSelector) {
      final ChildrenSelector that = (ChildrenSelector) selector;
      return sizeOfChildrenSelector(that.then());
    } else if (selector instanceof DescendantsSelector) {
      final DescendantsSelector that = (DescendantsSelector) selector;
      return sizeOfDescendantsSelector(that.then());
    } else if (selector instanceof FilterSelector) {
      final FilterSelector that = (FilterSelector) selector;
      return sizeOfFilterSelector(that.predicate(), that.then());
    }
    throw new WriterException("No Recon serialization for " + selector);
  }

  public Writer<?, ?> writeSelector(Selector selector, Output<?> output) {
    if (selector instanceof IdentitySelector) {
      return writeIdentitySelector(output);
    } else if (selector instanceof LiteralSelector) {
      final LiteralSelector that = (LiteralSelector) selector;
      return writeLiteralSelector(that.item(), that.then(), output);
    } else if (selector instanceof GetSelector) {
      final GetSelector that = (GetSelector) selector;
      return writeGetSelector(that.accessor(), that.then(), output);
    } else if (selector instanceof GetAttrSelector) {
      final GetAttrSelector that = (GetAttrSelector) selector;
      return writeGetAttrSelector(that.accessor(), that.then(), output);
    } else if (selector instanceof GetItemSelector) {
      final GetItemSelector that = (GetItemSelector) selector;
      return writeGetItemSelector(that.accessor(), that.then(), output);
    } else if (selector instanceof KeysSelector) {
      final KeysSelector that = (KeysSelector) selector;
      return writeKeysSelector(that.then(), output);
    } else if (selector instanceof ValuesSelector) {
      final ValuesSelector that = (ValuesSelector) selector;
      return writeValuesSelector(that.then(), output);
    } else if (selector instanceof ChildrenSelector) {
      final ChildrenSelector that = (ChildrenSelector) selector;
      return writeChildrenSelector(that.then(), output);
    } else if (selector instanceof DescendantsSelector) {
      final DescendantsSelector that = (DescendantsSelector) selector;
      return writeDescendantsSelector(that.then(), output);
    } else if (selector instanceof FilterSelector) {
      final FilterSelector that = (FilterSelector) selector;
      return writeFilterSelector(that.predicate(), that.then(), output);
    }
    return Writer.error(new WriterException("No Recon serialization for " + selector));
  }

  public int sizeOfOperator(Operator operator) {
    if (operator instanceof BinaryOperator) {
      final BinaryOperator that = (BinaryOperator) operator;
      return sizeOfInfixOperator(that.operand1(), that.operator(), that.operand2(), that.precedence());
    } else if (operator instanceof UnaryOperator) {
      final UnaryOperator that = (UnaryOperator) operator;
      return sizeOfPrefixOperator(that.operator(), that.operand(), that.precedence());
    } else if (operator instanceof InvokeOperator) {
      final InvokeOperator that = (InvokeOperator) operator;
      return sizeOfInvokeOperator(that.func(), that.args());
    } else if (operator instanceof ConditionalOperator) {
      final ConditionalOperator that = (ConditionalOperator) operator;
      return sizeOfConditionalOperator(that.ifTerm(), that.thenTerm(), that.elseTerm(), that.precedence());
    }
    throw new WriterException("No Recon serialization for " + operator);
  }

  public Writer<?, ?> writeOperator(Operator operator, Output<?> output) {
    if (operator instanceof BinaryOperator) {
      final BinaryOperator that = (BinaryOperator) operator;
      return writeInfixOperator(that.operand1(), that.operator(), that.operand2(), that.precedence(), output);
    } else if (operator instanceof UnaryOperator) {
      final UnaryOperator that = (UnaryOperator) operator;
      return writePrefixOperator(that.operator(), that.operand(), that.precedence(), output);
    } else if (operator instanceof InvokeOperator) {
      final InvokeOperator that = (InvokeOperator) operator;
      return writeInvokeOperator(that.func(), that.args(), output);
    } else if (operator instanceof ConditionalOperator) {
      final ConditionalOperator that = (ConditionalOperator) operator;
      return writeConditionalOperator(that.ifTerm(), that.thenTerm(), that.elseTerm(), that.precedence(), output);
    }
    return Writer.error(new WriterException("No Recon serialization for " + operator));
  }

  public int sizeOfFunc(Func func) {
    if (func instanceof LambdaFunc) {
      final LambdaFunc that = (LambdaFunc) func;
      return sizeOfLambdaFunc(that.bindings(), that.template());
    } else if (func instanceof BridgeFunc) {
      return 0;
    }
    throw new WriterException("No Recon serialization for " + func);
  }

  public Writer<?, ?> writeFunc(Func func, Output<?> output) {
    if (func instanceof LambdaFunc) {
      final LambdaFunc that = (LambdaFunc) func;
      return writeLambdaFunc(that.bindings(), that.template(), output);
    } else if (func instanceof BridgeFunc) {
      return Writer.done();
    }
    return Writer.error(new WriterException("No Recon serialization for " + func));
  }

  @Override
  public int sizeOfBlockItem(Item item) {
    if (item instanceof Field) {
      return sizeOfItem(item);
    } else if (item instanceof Value) {
      return sizeOfBlockValue((Value) item);
    }
    throw new WriterException("No Recon serialization for " + item);
  }

  @Override
  public Writer<?, ?> writeBlockItem(Item item, Output<?> output) {
    if (item instanceof Field) {
      return writeItem(item, output);
    } else if (item instanceof Value) {
      return writeBlockValue((Value) item, output);
    }
    return Writer.error(new WriterException("No Recon serialization for " + item));
  }

  @Override
  public int sizeOfBlockValue(Value value) {
    if (value instanceof Record) {
      return sizeOfBlock((Record) value);
    }
    return sizeOfValue(value);
  }

  @Override
  public Writer<?, ?> writeBlockValue(Value value, Output<?> output) {
    if (value instanceof Record) {
      return writeBlock((Record) value, output);
    }
    return writeValue(value, output);
  }

  @Override
  public int sizeOfThen(Value then) {
    if (then instanceof Selector) {
      final Selector selector = (Selector) then;
      if (selector instanceof IdentitySelector) {
        return sizeOfThenIdentitySelector();
      } else if (selector instanceof LiteralSelector) {
        final LiteralSelector that = (LiteralSelector) selector;
        return sizeOfThenLiteralSelector(that.item(), that.then());
      } else if (selector instanceof GetSelector) {
        final GetSelector that = (GetSelector) selector;
        return sizeOfThenGetSelector(that.accessor(), that.then());
      } else if (selector instanceof GetAttrSelector) {
        final GetAttrSelector that = (GetAttrSelector) selector;
        return sizeOfThenGetAttrSelector(that.accessor(), that.then());
      } else if (selector instanceof GetItemSelector) {
        final GetItemSelector that = (GetItemSelector) selector;
        return sizeOfThenGetItemSelector(that.accessor(), that.then());
      } else if (selector instanceof KeysSelector) {
        final KeysSelector that = (KeysSelector) selector;
        return sizeOfThenKeysSelector(that.then());
      } else if (selector instanceof ValuesSelector) {
        final ValuesSelector that = (ValuesSelector) selector;
        return sizeOfThenValuesSelector(that.then());
      } else if (selector instanceof ChildrenSelector) {
        final ChildrenSelector that = (ChildrenSelector) selector;
        return sizeOfThenChildrenSelector(that.then());
      } else if (selector instanceof DescendantsSelector) {
        final DescendantsSelector that = (DescendantsSelector) selector;
        return sizeOfThenDescendantsSelector(that.then());
      } else if (selector instanceof FilterSelector) {
        final FilterSelector that = (FilterSelector) selector;
        return sizeOfThenFilterSelector(that.predicate(), that.then());
      }
    }
    throw new WriterException("No Recon serialization for " + then);
  }

  @Override
  public Writer<?, ?> writeThen(Value then, Output<?> output) {
    if (then instanceof Selector) {
      final Selector selector = (Selector) then;
      if (selector instanceof IdentitySelector) {
        return writeThenIdentitySelector(output);
      } else if (selector instanceof LiteralSelector) {
        final LiteralSelector that = (LiteralSelector) selector;
        return writeThenLiteralSelector(that.item(), that.then(), output);
      } else if (selector instanceof GetSelector) {
        final GetSelector that = (GetSelector) selector;
        return writeThenGetSelector(that.accessor(), that.then(), output);
      } else if (selector instanceof GetAttrSelector) {
        final GetAttrSelector that = (GetAttrSelector) selector;
        return writeThenGetAttrSelector(that.accessor(), that.then(), output);
      } else if (selector instanceof GetItemSelector) {
        final GetItemSelector that = (GetItemSelector) selector;
        return writeThenGetItemSelector(that.accessor(), that.then(), output);
      } else if (selector instanceof KeysSelector) {
        final KeysSelector that = (KeysSelector) selector;
        return writeThenKeysSelector(that.then(), output);
      } else if (selector instanceof ValuesSelector) {
        final ValuesSelector that = (ValuesSelector) selector;
        return writeThenValuesSelector(that.then(), output);
      } else if (selector instanceof ChildrenSelector) {
        final ChildrenSelector that = (ChildrenSelector) selector;
        return writeThenChildrenSelector(that.then(), output);
      } else if (selector instanceof DescendantsSelector) {
        final DescendantsSelector that = (DescendantsSelector) selector;
        return writeThenDescendantsSelector(that.then(), output);
      } else if (selector instanceof FilterSelector) {
        final FilterSelector that = (FilterSelector) selector;
        return writeThenFilterSelector(that.predicate(), that.then(), output);
      }
    }
    return Writer.error(new WriterException("No Recon serialization for " + then));
  }
}
