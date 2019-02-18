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

package swim.dataflow.operator;

import swim.streamlet.AbstractOutlet;
import swim.streamlet.Inlet;
import swim.streamlet.Outlet;
import swim.streamlet.OutletInlet;
import swim.structure.Value;

public final class OrOutlet extends AbstractOutlet<Value> {
  final Inlet<Value> operand1Inlet;
  final Inlet<Value> operand2Inlet;

  public OrOutlet() {
    this.operand1Inlet = new OutletInlet<Value>(this);
    this.operand2Inlet = new OutletInlet<Value>(this);
  }

  public Inlet<Value> operand1Inlet() {
    return this.operand1Inlet;
  }

  public Inlet<Value> operand2Inlet() {
    return this.operand2Inlet;
  }

  @Override
  public Value get() {
    final Outlet<? extends Value> operand1Input = this.operand1Inlet.input();
    final Value argument1 = operand1Input != null ? operand1Input.get() : null;
    if (argument1 != null && argument1.booleanValue(false)) {
      return argument1;
    }
    final Outlet<? extends Value> operand2Input = this.operand2Inlet.input();
    final Value argument2 = operand2Input != null ? operand2Input.get() : null;
    if (argument2 != null) {
      return argument2;
    }
    return Value.absent();
  }
}
