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

public final class ConditionalOutlet extends AbstractOutlet<Value> {
  final Inlet<Value> ifInlet;
  final Inlet<Value> thenInlet;
  final Inlet<Value> elseInlet;

  public ConditionalOutlet() {
    this.ifInlet = new OutletInlet<Value>(this);
    this.thenInlet = new OutletInlet<Value>(this);
    this.elseInlet = new OutletInlet<Value>(this);
  }

  public Inlet<Value> ifInlet() {
    return this.ifInlet;
  }

  public Inlet<Value> thenInlet() {
    return this.thenInlet;
  }

  public Inlet<Value> elseInlet() {
    return this.elseInlet;
  }

  @Override
  public Value get() {
    final Outlet<? extends Value> ifInput = this.ifInlet.input();
    if (ifInput != null) {
      final Value ifTerm = ifInput.get();
      if (ifTerm != null) {
        if (ifTerm.booleanValue(false)) {
          final Outlet<? extends Value> thenInput = this.thenInlet.input();
          if (thenInput != null) {
            final Value thenTerm = thenInput.get();
            if (thenTerm != null) {
              return thenTerm;
            }
          }
        } else {
          final Outlet<? extends Value> elseInput = this.elseInlet.input();
          if (elseInput != null) {
            final Value elseTerm = elseInput.get();
            if (elseTerm != null) {
              return elseTerm;
            }
          }
        }
      }
    }
    return Value.absent();
  }
}
