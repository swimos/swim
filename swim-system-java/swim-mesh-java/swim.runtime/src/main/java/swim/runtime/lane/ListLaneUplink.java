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

import java.util.Iterator;
import java.util.Map;
import swim.concurrent.Stage;
import swim.runtime.UplinkAddress;
import swim.runtime.WarpBinding;
import swim.runtime.warp.ListLinkDelta;
import swim.runtime.warp.ListUplinkModem;
import swim.structure.Value;
import swim.warp.SyncRequest;

public class ListLaneUplink extends ListUplinkModem {
  final ListLaneModel laneBinding;

  public ListLaneUplink(ListLaneModel laneBinding, WarpBinding linkBinding,
                        UplinkAddress uplinkAddress) {
    super(linkBinding, uplinkAddress);
    this.laneBinding = laneBinding;
  }

  @Override
  public ListLaneModel laneBinding() {
    return this.laneBinding;
  }

  @Override
  public Stage stage() {
    return this.laneBinding.stage();
  }

  @Override
  protected void willSync(SyncRequest request) {
    final Iterator<Map.Entry<Object, Value>> items = this.laneBinding.iterator();
    int index = 0;
    while (items.hasNext()) {
      final Map.Entry<Object, Value> item = items.next();
      queueDown(ListLinkDelta.update(index, Value.fromObject(item.getKey()), item.getValue()));
      index += 1;
    }
    super.willSync(request);
  }
}
