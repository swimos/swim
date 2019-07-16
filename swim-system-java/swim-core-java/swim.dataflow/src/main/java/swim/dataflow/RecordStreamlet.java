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

package swim.dataflow;

import swim.streamlet.Inlet;
import swim.streamlet.Outlet;
import swim.streamlet.Streamlet;
import swim.streamlet.StreamletScope;
import swim.structure.Record;
import swim.structure.Value;

public abstract class RecordStreamlet<I extends Value, O extends Value> extends Record implements Streamlet<I, O> {
  @Override
  public boolean isConstant() {
    return false;
  }

  public void compile() {
    AbstractRecordStreamlet.compileInlets(getClass(), this);
  }

  @SuppressWarnings("unchecked")
  public void compileInlet(Inlet<I> inlet, String name) {
    final StreamletScope<? extends O> scope = streamletScope();
    if (scope != null) {
      final Outlet<? extends O> input = scope.outlet(name);
      if (input != null) {
        // Assume Outlet<? super O> conforms to Outlet<I>.
        inlet.bindInput((Outlet<I>) (Outlet<?>) input);
      }
    }
  }
}
