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

package swim.dataflow.operator;

import swim.streamlet.AbstractOutlet;
import swim.streamlet.Inlet;
import swim.streamlet.Outlet;
import swim.streamlet.OutletInlet;
import swim.structure.Item;
import swim.structure.Value;

public abstract class UnaryOutlet extends AbstractOutlet<Value> {

  final Inlet<Value> operandInlet;

  public UnaryOutlet() {
    this.operandInlet = new OutletInlet<Value>(this);
  }

  public Inlet<Value> operandInlet() {
    return this.operandInlet;
  }

  @Override
  public Value get() {
    final Outlet<? extends Value> operandInput = this.operandInlet.input();
    if (operandInput != null) {
      final Value argument = operandInput.get();
      if (argument != null) {
        final Item result = this.evaluate(argument);
        return result.toValue();
      }
    }
    return Value.absent();
  }

  protected abstract Item evaluate(Value argument);

}
