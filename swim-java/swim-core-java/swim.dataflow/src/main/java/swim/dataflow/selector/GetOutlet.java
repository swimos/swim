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

package swim.dataflow.selector;

import swim.streamlet.AbstractOutlet;
import swim.streamlet.Inlet;
import swim.streamlet.MapInlet;
import swim.streamlet.MapOutlet;
import swim.streamlet.Outlet;
import swim.streamlet.OutletInlet;
import swim.streamlet.OutletMapInlet;
import swim.structure.Value;

public final class GetOutlet extends AbstractOutlet<Value> {
  final OutletInlet<Value> keyInlet;
  final OutletMapInlet<Value, Value, Object> mapInlet;

  public GetOutlet() {
    this.keyInlet = new OutletInlet<Value>(this);
    this.mapInlet = new OutletMapInlet<Value, Value, Object>(this);
  }

  public Inlet<Value> keyInlet() {
    return this.keyInlet;
  }

  public MapInlet<Value, Value, Object> mapInlet() {
    return this.mapInlet;
  }

  @Override
  public Value get() {
    final Outlet<? extends Value> keyInput = this.keyInlet.input();
    if (keyInput != null) {
      final Value key = keyInput.get();
      if (key != null) {
        final MapOutlet<Value, Value, ?> mapInput = this.mapInlet.input();
        if (mapInput != null) {
          final Value value = mapInput.get(key);
          if (value != null) {
            return value;
          }
        }
      }
    }
    return Value.absent();
  }
}
