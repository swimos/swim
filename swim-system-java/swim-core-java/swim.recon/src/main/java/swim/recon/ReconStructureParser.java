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
import swim.codec.Output;
import swim.structure.Attr;
import swim.structure.Bool;
import swim.structure.Data;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Selector;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import swim.structure.operator.AndOperator;
import swim.structure.operator.BitwiseAndOperator;
import swim.structure.operator.BitwiseNotOperator;
import swim.structure.operator.BitwiseOrOperator;
import swim.structure.operator.BitwiseXorOperator;
import swim.structure.operator.DivideOperator;
import swim.structure.operator.EqOperator;
import swim.structure.operator.GeOperator;
import swim.structure.operator.GtOperator;
import swim.structure.operator.InvokeOperator;
import swim.structure.operator.LeOperator;
import swim.structure.operator.LtOperator;
import swim.structure.operator.MinusOperator;
import swim.structure.operator.ModuloOperator;
import swim.structure.operator.NeOperator;
import swim.structure.operator.NegativeOperator;
import swim.structure.operator.NotOperator;
import swim.structure.operator.OrOperator;
import swim.structure.operator.PlusOperator;
import swim.structure.operator.PositiveOperator;
import swim.structure.operator.TimesOperator;
import swim.util.Builder;

public class ReconStructureParser extends ReconParser<Item, Value> {
  @Override
  public boolean isDistinct(Value value) {
    return value.isDistinct();
  }

  @Override
  public Item item(Value value) {
    return value;
  }

  @Override
  public Value value(Item item) {
    return item.toValue();
  }

  @Override
  public Item attr(Value key, Value value) {
    return Attr.of((Text) key, value);
  }

  @Override
  public Item attr(Value key) {
    return Attr.of((Text) key);
  }

  @Override
  public Item slot(Value key, Value value) {
    return Slot.of(key, value);
  }

  @Override
  public Item slot(Value key) {
    return Slot.of(key);
  }

  @Override
  public Builder<Item, Value> valueBuilder() {
    return Value.builder();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Item, Value> recordBuilder() {
    return (Builder<Item, Value>) (Builder<?, ?>) Record.create();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Output<Value> dataOutput() {
    return (Output<Value>) (Output<?>) Data.output();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Output<Value> textOutput() {
    return (Output<Value>) (Output<?>) Text.output();
  }

  @Override
  public Value ident(Value value) {
    if (value instanceof Text) {
      final String string = value.stringValue();
      if ("true".equals(string)) {
        return Bool.from(true);
      } else if ("false".equals(string)) {
        return Bool.from(false);
      }
    }
    return value;
  }

  @Override
  public Value num(int value) {
    return Num.from(value);
  }

  @Override
  public Value num(long value) {
    if ((int) value == value) {
      return Num.from((int) value);
    } else {
      return Num.from(value);
    }
  }

  @Override
  public Value num(float value) {
    return Num.from(value);
  }

  @Override
  public Value num(double value) {
    if ((float) value == value) {
      return Num.from((float) value);
    } else {
      return Num.from(value);
    }
  }

  @Override
  public Value num(BigInteger value) {
    return Num.from(value);
  }

  @Override
  public Value num(String value) {
    return Num.from(Double.parseDouble(value));
  }

  @Override
  public Value uint32(int value) {
    return Num.uint32(value);
  }

  @Override
  public Value uint64(long value) {
    return Num.uint64(value);
  }

  @Override
  public Value bool(boolean value) {
    return Bool.from(value);
  }

  @Override
  public Value selector() {
    return Selector.identity();
  }

  @Override
  public Value extant() {
    return Value.extant();
  }

  @Override
  public Value absent() {
    return Value.absent();
  }

  @Override
  public Value conditional(Value ifTerm, Value thenTerm, Value elseTerm) {
    return ifTerm.conditional(thenTerm, elseTerm);
  }

  @Override
  public Value or(Value lhs, Value rhs) {
    return new OrOperator(lhs, rhs);
  }

  @Override
  public Value and(Value lhs, Value rhs) {
    return new AndOperator(lhs, rhs);
  }

  @Override
  public Value bitwiseOr(Value lhs, Value rhs) {
    return new BitwiseOrOperator(lhs, rhs);
  }

  @Override
  public Value bitwiseXor(Value lhs, Value rhs) {
    return new BitwiseXorOperator(lhs, rhs);
  }

  @Override
  public Value bitwiseAnd(Value lhs, Value rhs) {
    return new BitwiseAndOperator(lhs, rhs);
  }

  @Override
  public Value lt(Value lhs, Value rhs) {
    return new LtOperator(lhs, rhs);
  }

  @Override
  public Value le(Value lhs, Value rhs) {
    return new LeOperator(lhs, rhs);
  }

  @Override
  public Value eq(Value lhs, Value rhs) {
    return new EqOperator(lhs, rhs);
  }

  @Override
  public Value ne(Value lhs, Value rhs) {
    return new NeOperator(lhs, rhs);
  }

  @Override
  public Value ge(Value lhs, Value rhs) {
    return new GeOperator(lhs, rhs);
  }

  @Override
  public Value gt(Value lhs, Value rhs) {
    return new GtOperator(lhs, rhs);
  }

  @Override
  public Value plus(Value lhs, Value rhs) {
    return new PlusOperator(lhs, rhs);
  }

  @Override
  public Value minus(Value lhs, Value rhs) {
    return new MinusOperator(lhs, rhs);
  }

  @Override
  public Value times(Value lhs, Value rhs) {
    return new TimesOperator(lhs, rhs);
  }

  @Override
  public Value divide(Value lhs, Value rhs) {
    return new DivideOperator(lhs, rhs);
  }

  @Override
  public Value modulo(Value lhs, Value rhs) {
    return new ModuloOperator(lhs, rhs);
  }

  @Override
  public Value not(Value rhs) {
    return new NotOperator(rhs);
  }

  @Override
  public Value bitwiseNot(Value rhs) {
    return new BitwiseNotOperator(rhs);
  }

  @Override
  public Value negative(Value rhs) {
    if (rhs instanceof Num) {
      return rhs.negative();
    } else {
      return new NegativeOperator(rhs);
    }
  }

  @Override
  public Value positive(Value rhs) {
    return new PositiveOperator(rhs);
  }

  @Override
  public Value invoke(Value func, Value args) {
    return new InvokeOperator(func, args);
  }

  @Override
  public Value lambda(Value bindings, Value template) {
    return bindings.lambda(template);
  }

  @Override
  public Value get(Value selector, Value key) {
    return selector.get(key);
  }

  @Override
  public Value getAttr(Value selector, Value key) {
    return selector.getAttr((Text) key);
  }

  @Override
  public Item getItem(Value selector, Value index) {
    return selector.getItem(index.intValue());
  }

  @Override
  public Value children(Value selector) {
    return Selector.literal(selector).children();
  }

  @Override
  public Value descendants(Value selector) {
    return Selector.literal(selector).descendants();
  }

  @Override
  public Value keys(Value selector) {
    return Selector.literal(selector).keys();
  }

  @Override
  public Value values(Value selector) {
    return Selector.literal(selector).values();
  }

  @Override
  public Value filter(Value selector, Value predicate) {
    return selector.filter(predicate);
  }
}
