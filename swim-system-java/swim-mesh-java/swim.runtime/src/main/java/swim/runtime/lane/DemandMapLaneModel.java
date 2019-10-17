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
import swim.api.warp.WarpUplink;
import swim.collections.FingerTrieSeq;
import swim.runtime.LaneView;
import swim.runtime.WarpBinding;
import swim.runtime.warp.WarpLaneModel;
import swim.structure.Record;
import swim.structure.Value;

public class DemandMapLaneModel extends WarpLaneModel<DemandMapLaneView<?, ?>, DemandMapLaneUplink> {
  @Override
  public String laneType() {
    return "map";
  }

  @Override
  protected DemandMapLaneUplink createWarpUplink(WarpBinding link) {
    return new DemandMapLaneUplink(this, link, createUplinkAddress(link));
  }

  @Override
  protected void didOpenLaneView(DemandMapLaneView<?, ?> view) {
    view.setLaneBinding(this);
  }

  void cueDownKey(Value key) {
    FingerTrieSeq<DemandMapLaneUplink> uplinks;
    do {
      uplinks = this.uplinks;
      for (int i = 0, n = uplinks.size(); i < n; i += 1) {
        uplinks.get(i).cueDownKey(key);
      }
    } while (uplinks != this.uplinks);
  }

  void remove(Value key) {
    sendDown(Record.create(1).attr("remove", Record.create(1).slot("key", key)));
  }

  Value nextDownCue(Value key, WarpUplink uplink) {
    final Object views = this.views;
    if (views instanceof DemandMapLaneView<?, ?>) {
      return ((DemandMapLaneView<?, ?>) views).nextDownCue(key, uplink);
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        final Value value = ((DemandMapLaneView<?, ?>) viewArray[i]).nextDownCue(key, uplink);
        if (value != null) {
          return value;
        }
      }
    }
    return null;
  }

  Iterator<Value> syncKeys(WarpUplink uplink) {
    final Object views = this.views;
    if (views instanceof DemandMapLaneView<?, ?>) {
      return ((DemandMapLaneView<?, ?>) views).syncKeys(uplink);
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        final Iterator<Value> iterator = ((DemandMapLaneView<?, ?>) viewArray[i]).syncKeys(uplink);
        if (iterator != null) {
          return iterator;
        }
      }
    }
    return null;
  }
}
