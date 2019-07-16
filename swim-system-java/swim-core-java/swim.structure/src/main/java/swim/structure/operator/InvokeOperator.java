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
import swim.structure.Func;
import swim.structure.Interpreter;
import swim.structure.Item;
import swim.structure.Operator;
import swim.structure.Value;
import swim.util.Murmur3;

public final class InvokeOperator extends Operator {
  final Value func;
  final Value args;
  Object state;

  public InvokeOperator(Value func, Value args) {
    this.func = func;
    this.args = args;
  }

  public Value func() {
    return this.func;
  }

  public Value args() {
    return this.args;
  }

  public Object state() {
    return this.state;
  }

  public void setState(Object state) {
    this.state = state;
  }

  @Override
  public boolean isConstant() {
    return this.func.isConstant() && this.args.isConstant();
  }

  @Override
  public int precedence() {
    return 11;
  }

  @Override
  public Item evaluate(Interpreter interpreter) {
    interpreter.willOperate(this);
    final Item result;
    final Item func = this.func.evaluate(interpreter);
    if (func instanceof Func) {
      result = ((Func) func).invoke(this.args, interpreter, this);
    } else {
      result = Item.absent();
    }
    interpreter.didOperate(this, result);
    return result;
  }

  @Override
  public Item substitute(Interpreter interpreter) {
    final Item func = this.func.evaluate(interpreter);
    if (func instanceof Func) {
      final Item result = ((Func) func).expand(this.args, interpreter, this);
      if (result != null) {
        return result;
      }
    }
    final Value args = this.args.substitute(interpreter).toValue();
    return new InvokeOperator(this.func, args);
  }

  @Override
  public int typeOrder() {
    return 41;
  }

  @Override
  protected int compareTo(Operator that) {
    if (that instanceof InvokeOperator) {
      return compareTo((InvokeOperator) that);
    }
    return Integer.compare(typeOrder(), that.typeOrder());
  }

  int compareTo(InvokeOperator that) {
    int order = this.func.compareTo(that.func);
    if (order == 0) {
      order = this.args.compareTo(that.args);
    }
    return order;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof InvokeOperator) {
      final InvokeOperator that = (InvokeOperator) other;
      return this.func.equals(that.func) && this.args.equals(that.args);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(InvokeOperator.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.func.hashCode()), this.args.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output.debug(this.func).write('.').write("invoke").write('(').debug(this.args).write(')');
  }

  private static int hashSeed;
}
