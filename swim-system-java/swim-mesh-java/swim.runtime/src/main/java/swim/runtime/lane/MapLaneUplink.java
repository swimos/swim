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

package swim.runtime.lane;

import swim.concurrent.Stage;
import swim.runtime.UplinkAddress;
import swim.runtime.WarpBinding;
import swim.runtime.warp.MapUplinkModem;
import swim.structure.Attr;
import swim.structure.Record;
import swim.structure.Value;
import swim.warp.SyncRequest;

public class MapLaneUplink extends MapUplinkModem {
  final MapLaneModel laneBinding;

  public MapLaneUplink(MapLaneModel laneBinding, WarpBinding linkBinding,
                       UplinkAddress uplinkAddress) {
    super(linkBinding, uplinkAddress);
    this.laneBinding = laneBinding;
  }

  @Override
  public MapLaneModel laneBinding() {
    return this.laneBinding;
  }

  @Override
  public Stage stage() {
    return this.laneBinding.stage();
  }

  @Override
  protected Value nextDownKey(Value key) {
    final Value value = this.laneBinding.get(key);
    if (value != null) {
      return Attr.of("update", Record.create(1).slot("key", key)).concat(value);
    } else {
      return null;
    }
  }

  @Override
  protected void willSync(SyncRequest request) {
    syncDown(this.laneBinding.keyIterator());
    super.willSync(request);
  }
}
