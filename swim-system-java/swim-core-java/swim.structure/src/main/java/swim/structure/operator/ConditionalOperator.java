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

package swim.structure.operator;

import swim.codec.Output;
import swim.structure.Interpreter;
import swim.structure.Item;
import swim.structure.Operator;
import swim.util.Murmur3;

public final class ConditionalOperator extends Operator {
  final Item ifTerm;
  final Item thenTerm;
  final Item elseTerm;

  public ConditionalOperator(Item ifTerm, Item thenTerm, Item elseTerm) {
    this.ifTerm = ifTerm.commit();
    this.thenTerm = thenTerm.commit();
    this.elseTerm = elseTerm.commit();
  }

  public Item ifTerm() {
    return this.ifTerm;
  }

  public Item thenTerm() {
    return this.thenTerm;
  }

  public Item elseTerm() {
    return this.elseTerm;
  }

  @Override
  public boolean isConstant() {
    return this.ifTerm.isConstant() && this.thenTerm.isConstant()
        && this.elseTerm.isConstant();
  }

  @Override
  public int precedence() {
    return 2;
  }

  @Override
  public Item evaluate(Interpreter interpreter) {
    interpreter.willOperate(this);
    final Item result;
    final Item ifTerm = this.ifTerm.evaluate(interpreter);
    if (ifTerm.booleanValue(false)) {
      final Item thenTerm = this.thenTerm.evaluate(interpreter);
      result = thenTerm;
    } else {
      final Item elseTerm = this.elseTerm.evaluate(interpreter);
      result = elseTerm;
    }
    interpreter.didOperate(this, result);
    return result;
  }

  @Override
  public Item substitute(Interpreter interpreter) {
    final Item ifTerm = this.ifTerm.substitute(interpreter);
    final Item thenTerm = this.thenTerm.substitute(interpreter);
    final Item elseTerm = this.elseTerm.substitute(interpreter);
    return new ConditionalOperator(ifTerm, thenTerm, elseTerm);
  }

  @Override
  public int typeOrder() {
    return 20;
  }

  @Override
  protected int compareTo(Operator that) {
    if (that instanceof ConditionalOperator) {
      return compareTo((ConditionalOperator) that);
    }
    return Integer.compare(typeOrder(), that.typeOrder());
  }

  int compareTo(ConditionalOperator that) {
    int order = this.ifTerm.compareTo(that.ifTerm);
    if (order == 0) {
      order = this.thenTerm.compareTo(that.thenTerm);
      if (order == 0) {
        order = this.elseTerm.compareTo(that.elseTerm);
      }
    }
    return order;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ConditionalOperator) {
      final ConditionalOperator that = (ConditionalOperator) other;
      return this.ifTerm.equals(that.ifTerm) && this.thenTerm.equals(that.thenTerm)
          && this.elseTerm.equals(that.elseTerm);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(ConditionalOperator.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.ifTerm.hashCode()), this.thenTerm.hashCode()), this.elseTerm.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output.debug(this.ifTerm).write('.').write("conditional").write('(')
        .debug(this.thenTerm).write(", ").debug(this.elseTerm).write(')');
  }

  private static int hashSeed;
}
