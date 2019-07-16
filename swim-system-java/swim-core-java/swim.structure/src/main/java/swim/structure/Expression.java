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

package swim.structure;

import swim.structure.operator.AndOperator;
import swim.structure.operator.BitwiseAndOperator;
import swim.structure.operator.BitwiseNotOperator;
import swim.structure.operator.BitwiseOrOperator;
import swim.structure.operator.BitwiseXorOperator;
import swim.structure.operator.ConditionalOperator;
import swim.structure.operator.DivideOperator;
import swim.structure.operator.EqOperator;
import swim.structure.operator.GeOperator;
import swim.structure.operator.GtOperator;
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

/**
 * A combination of operators, constants, and variables.  Every {@code Item}
 * in the Swim data model can be {@link #evaluate(Interpreter) evaluated}
 * against a scope.  An {@code Expression} is some {@code Value} that, when
 * evaluated, may yield a different value than the {@code Expression} itself.
 * Note that this is a stricter definition than that of a logical expression;
 * for example, the number {@code 2} is a valid expression, but it is not an
 * {@code Expression}.
 * <p>
 * An {@code Expression} can be either a {@link Selector} or an {@link
 * Operator}.  A {@code Selector} references specific attributes of a Swim model
 * instance.  An {@code Operator} identifies an operation on constants,
 * variables, or {@code Selector} expressions. Together, these form a foundation
 * for building expression languages that can both manipulate and read Swim
 * objects.
 */
public abstract class Expression extends Value {
  @Override
  public Item conditional(Item thenTerm, Item elseTerm) {
    return new ConditionalOperator(this, thenTerm, elseTerm);
  }

  @Override
  public Value conditional(Value thenTerm, Value elseTerm) {
    return new ConditionalOperator(this, thenTerm, elseTerm);
  }

  @Override
  public Operator or(Item that) {
    return new OrOperator(this, that);
  }

  @Override
  public Operator or(Value that) {
    return new OrOperator(this, that);
  }

  @Override
  public Operator and(Item that) {
    return new AndOperator(this, that);
  }

  @Override
  public Operator and(Value that) {
    return new AndOperator(this, that);
  }

  @Override
  public Operator bitwiseOr(Item that) {
    return new BitwiseOrOperator(this, that);
  }

  @Override
  public Operator bitwiseOr(Value that) {
    return new BitwiseOrOperator(this, that);
  }

  @Override
  public Operator bitwiseXor(Item that) {
    return new BitwiseXorOperator(this, that);
  }

  @Override
  public Operator bitwiseXor(Value that) {
    return new BitwiseXorOperator(this, that);
  }

  @Override
  public Operator bitwiseAnd(Item that) {
    return new BitwiseAndOperator(this, that);
  }

  @Override
  public Operator bitwiseAnd(Value that) {
    return new BitwiseAndOperator(this, that);
  }

  @Override
  public Operator lt(Item that) {
    return new LtOperator(this, that);
  }

  @Override
  public Operator lt(Value that) {
    return new LtOperator(this, that);
  }

  @Override
  public Operator le(Item that) {
    return new LeOperator(this, that);
  }

  @Override
  public Operator le(Value that) {
    return new LeOperator(this, that);
  }

  @Override
  public Operator eq(Item that) {
    return new EqOperator(this, that);
  }

  @Override
  public Operator eq(Value that) {
    return new EqOperator(this, that);
  }

  @Override
  public Operator ne(Item that) {
    return new NeOperator(this, that);
  }

  @Override
  public Operator ne(Value that) {
    return new NeOperator(this, that);
  }

  @Override
  public Operator ge(Item that) {
    return new GeOperator(this, that);
  }

  @Override
  public Operator ge(Value that) {
    return new GeOperator(this, that);
  }

  @Override
  public Operator gt(Item that) {
    return new GtOperator(this, that);
  }

  @Override
  public Operator gt(Value that) {
    return new GtOperator(this, that);
  }

  @Override
  public Operator plus(Item that) {
    return new PlusOperator(this, that);
  }

  @Override
  public Operator plus(Value that) {
    return new PlusOperator(this, that);
  }

  @Override
  public Operator minus(Item that) {
    return new MinusOperator(this, that);
  }

  @Override
  public Operator minus(Value that) {
    return new MinusOperator(this, that);
  }

  @Override
  public Operator times(Item that) {
    return new TimesOperator(this, that);
  }

  @Override
  public Operator times(Value that) {
    return new TimesOperator(this, that);
  }

  @Override
  public Operator divide(Item that) {
    return new DivideOperator(this, that);
  }

  @Override
  public Operator divide(Value that) {
    return new DivideOperator(this, that);
  }

  @Override
  public Operator modulo(Item that) {
    return new ModuloOperator(this, that);
  }

  @Override
  public Operator modulo(Value that) {
    return new ModuloOperator(this, that);
  }

  @Override
  public Operator not() {
    return new NotOperator(this);
  }

  @Override
  public Operator bitwiseNot() {
    return new BitwiseNotOperator(this);
  }

  @Override
  public Operator negative() {
    return new NegativeOperator(this);
  }

  @Override
  public Operator positive() {
    return new PositiveOperator(this);
  }

  @Override
  public Operator inverse() {
    return new DivideOperator(Num.from(1.0), this);
  }
}
