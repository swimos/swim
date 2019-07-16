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
import swim.structure.Func;
import swim.structure.Interpreter;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;

public final class InvokeOutlet extends AbstractOutlet<Value> {
  final Record scope;
  final Inlet<Value> funcInlet;
  final Inlet<Value> argsInlet;

  public InvokeOutlet(Record scope) {
    this.scope = scope;
    this.funcInlet = new OutletInlet<Value>(this);
    this.argsInlet = new OutletInlet<Value>(this);
  }

  public Inlet<Value> funcInlet() {
    return this.funcInlet;
  }

  public Inlet<Value> argsInlet() {
    return this.argsInlet;
  }

  @Override
  public Value get() {
    final Outlet<? extends Value> funcInput = this.funcInlet.input();
    final Outlet<? extends Value> argsInput = this.argsInlet.input();
    if (funcInput != null && argsInput != null) {
      final Value func = this.funcInlet.input().get();
      if (func instanceof Func) {
        final Value args = this.argsInlet.input().get();
        if (args != null) {
          final Interpreter interpreter = new Interpreter();
          interpreter.pushScope(this.scope);
          final Item result = ((Func) func).invoke(args, interpreter, null /* TODO: generalize InvokeOperator to InvokeContext */);
          return result.toValue();
        }
      }
    }
    return Value.absent();
  }
}
