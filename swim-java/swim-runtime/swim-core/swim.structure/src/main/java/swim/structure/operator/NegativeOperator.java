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

public final class NegativeOperator extends UnaryOperator {

  public NegativeOperator(Item operand) {
    super(operand);
  }

  @Override
  public String operator() {
    return "-";
  }

  @Override
  public int precedence() {
    return 10;
  }

  @Override
  public Item evaluate(Interpreter interpreter) {
    interpreter.willOperate(this);
    final Item argument = this.operand.evaluate(interpreter);
    final Item result = argument.negative();
    interpreter.didOperate(this, result);
    return result;
  }

  @Override
  public Item substitute(Interpreter interpreter) {
    final Item argument = this.operand.substitute(interpreter);
    return argument.negative();
  }

  @Override
  public int typeOrder() {
    return 39;
  }

  @Override
  protected int compareTo(Operator that) {
    if (that instanceof NegativeOperator) {
      return this.compareTo((NegativeOperator) that);
    }
    return Integer.compare(this.typeOrder(), that.typeOrder());
  }

  int compareTo(NegativeOperator that) {
    return this.operand.compareTo(that.operand);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof NegativeOperator) {
      final NegativeOperator that = (NegativeOperator) other;
      return this.operand.equals(that.operand);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (NegativeOperator.hashSeed == 0) {
      NegativeOperator.hashSeed = Murmur3.seed(NegativeOperator.class);
    }
    return Murmur3.mash(Murmur3.mix(NegativeOperator.hashSeed, this.operand.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.debug(this.operand).write('.').write("negative").write('(').write(')');
    return output;
  }

}
