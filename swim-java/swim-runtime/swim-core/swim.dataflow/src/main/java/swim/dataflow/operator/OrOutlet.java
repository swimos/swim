// Copyright 2015-2023 Swim.inc
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

  final Inlet<Value> lhsInlet;
  final Inlet<Value> rhsInlet;

  public OrOutlet() {
    this.lhsInlet = new OutletInlet<Value>(this);
    this.rhsInlet = new OutletInlet<Value>(this);
  }

  public Inlet<Value> lhsInlet() {
    return this.lhsInlet;
  }

  public Inlet<Value> rhsInlet() {
    return this.rhsInlet;
  }

  @Override
  public Value get() {
    final Outlet<? extends Value> lhsInput = this.lhsInlet.input();
    final Value lhs = lhsInput != null ? lhsInput.get() : null;
    if (lhs != null && lhs.isDefinite()) {
      return lhs;
    }
    final Outlet<? extends Value> rhsInput = this.rhsInlet.input();
    final Value rhs = rhsInput != null ? rhsInput.get() : null;
    if (rhs != null) {
      return rhs;
    }
    return Value.absent();
  }

}
