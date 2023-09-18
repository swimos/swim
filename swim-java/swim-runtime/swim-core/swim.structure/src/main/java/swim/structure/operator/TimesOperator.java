// Copyright 2015-2023 Nstream, inc.
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

package swim.structure.operator;

import swim.codec.Output;
import swim.structure.Interpreter;
import swim.structure.Item;
import swim.structure.Operator;
import swim.util.Murmur3;

/**
 * A {@link BinaryOperator} that represents a multiplication operation between
 * its two operands.
 */
public final class TimesOperator extends BinaryOperator {

  public TimesOperator(Item lhs, Item rhs) {
    super(lhs, rhs);
  }

  @Override
  public String operator() {
    return "*";
  }

  @Override
  public int precedence() {
    return 9;
  }

  @Override
  public Item evaluate(Interpreter interpreter) {
    interpreter.willOperate(this);
    final Item lhs = this.lhs.evaluate(interpreter);
    final Item rhs = this.rhs.evaluate(interpreter);
    final Item result = lhs.times(rhs);
    interpreter.didOperate(this, result);
    return result;
  }

  @Override
  public Item substitute(Interpreter interpreter) {
    final Item lhs = this.lhs.substitute(interpreter);
    final Item rhs = this.rhs.substitute(interpreter);
    return lhs.times(rhs);
  }

  @Override
  public int typeOrder() {
    return 34;
  }

  @Override
  protected int compareTo(Operator that) {
    if (that instanceof TimesOperator) {
      return this.compareTo((TimesOperator) that);
    }
    return Integer.compare(this.typeOrder(), that.typeOrder());
  }

  int compareTo(TimesOperator that) {
    int order = this.lhs.compareTo(that.lhs);
    if (order == 0) {
      order = this.rhs.compareTo(that.rhs);
    }
    return order;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TimesOperator) {
      final TimesOperator that = (TimesOperator) other;
      return this.lhs.equals(that.lhs) && this.rhs.equals(that.rhs);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (TimesOperator.hashSeed == 0) {
      TimesOperator.hashSeed = Murmur3.seed(TimesOperator.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(TimesOperator.hashSeed,
        this.lhs.hashCode()), this.rhs.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.debug(this.lhs).write('.').write("times").write('(').debug(this.rhs).write(')');
    return output;
  }

}
