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

package swim.structure.func;

import swim.codec.Output;
import swim.structure.Func;
import swim.structure.Interpreter;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import swim.structure.operator.InvokeOperator;
import swim.util.Murmur3;

public class LambdaFunc extends Func {
  final Value bindings;
  final Value template;

  public LambdaFunc(Value bindings, Value template) {
    this.bindings = bindings;
    this.template = template;
  }

  public final Value bindings() {
    return this.bindings;
  }

  public final Value template() {
    return this.template;
  }

  @Override
  public int precedence() {
    return 1;
  }

  @Override
  public Item invoke(Value args, Interpreter interpreter, InvokeOperator operator) {
    final Value bindings = this.bindings;
    final int arity = Math.max(1, bindings.length());
    final Record params = Record.create(arity);
    int i = 0;
    int j = 0;
    while (i < arity) {
      final Item binding = bindings instanceof Record ? bindings.getItem(i) : i == 0 ? bindings : Item.absent();
      final Value arg = args instanceof Record ? args.getItem(j).toValue() : j == 0 ? args : Value.absent();
      if (binding instanceof Text && arg.isDistinct()) {
        params.add(Slot.of((Text) binding, arg));
        j += 1;
      } else if (binding instanceof Slot) {
        if (arg.isDistinct()) {
          params.add(((Slot) binding).updatedValue(arg));
        } else {
          params.add(binding);
        }
        j += 1;
      }
      i += 1;
    }
    interpreter.pushScope(params);
    final Item result = this.template.evaluate(interpreter);
    interpreter.popScope();
    return result;
  }

  @Override
  public int typeOrder() {
    return 50;
  }

  @Override
  public int compareTo(Item other) {
    if (other instanceof LambdaFunc) {
      return compareTo((LambdaFunc) other);
    }
    return Integer.compare(typeOrder(), other.typeOrder());
  }

  int compareTo(LambdaFunc that) {
    int order = this.bindings.compareTo(that.bindings);
    if (order == 0) {
      order = this.template.compareTo(that.template);
    }
    return order;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof LambdaFunc) {
      final LambdaFunc that = (LambdaFunc) other;
      return this.bindings.equals(that.bindings) && this.template.equals(that.template);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(LambdaFunc.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.bindings.hashCode()), this.template.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output.debug(this.bindings).write('.').write("lambda").write('(').debug(this.template).write(')');
  }

  private static int hashSeed;
}
