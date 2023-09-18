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

public final class AndOperator extends BinaryOperator {

  public AndOperator(Item lhs, Item rhs) {
    super(lhs, rhs);
  }

  @Override
  public String operator() {
    return "&&";
  }

  @Override
  public int precedence() {
    return 4;
  }

  @Override
  public Item evaluate(Interpreter interpreter) {
    interpreter.willOperate(this);
    final Item result;
    final Item lhs = this.lhs.evaluate(interpreter);
    if (lhs.isDefinite()) {
      final Item rhs = this.rhs.evaluate(interpreter);
      result = rhs;
    } else {
      result = lhs;
    }
    interpreter.didOperate(this, result);
    return result;
  }

  @Override
  public Item substitute(Interpreter interpreter) {
    final Item lhs = this.lhs.substitute(interpreter);
    final Item rhs = this.rhs.substitute(interpreter);
    return lhs.and(rhs);
  }

  @Override
  public int typeOrder() {
    return 22;
  }

  @Override
  protected int compareTo(Operator that) {
    if (that instanceof AndOperator) {
      return this.compareTo((AndOperator) that);
    }
    return Integer.compare(this.typeOrder(), that.typeOrder());
  }

  int compareTo(AndOperator that) {
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
    } else if (other instanceof AndOperator) {
      final AndOperator that = (AndOperator) other;
      return this.lhs.equals(that.lhs) && this.rhs.equals(that.rhs);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (AndOperator.hashSeed == 0) {
      AndOperator.hashSeed = Murmur3.seed(AndOperator.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(AndOperator.hashSeed,
        this.lhs.hashCode()), this.rhs.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output.debug(this.lhs).write('.').write("and").write('(').debug(this.rhs).write(')');
    return output;
  }

}
