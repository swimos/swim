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

package swim.system.lane;

import swim.api.warp.WarpUplink;
import swim.structure.Value;
import swim.system.LaneModel;
import swim.system.LaneView;
import swim.system.WarpBinding;
import swim.system.warp.WarpLaneModel;

public class DemandLaneModel extends WarpLaneModel<DemandLaneView<?>, DemandLaneUplink> {

  public DemandLaneModel() {
    // nop
  }

  @Override
  public String laneType() {
    return "demand";
  }

  @Override
  protected DemandLaneUplink createWarpUplink(WarpBinding link) {
    return new DemandLaneUplink(this, link, this.createUplinkAddress(link));
  }

  @Override
  protected void didOpenLaneView(DemandLaneView<?> view) {
    view.setLaneBinding(this);
  }

  Value nextDownCue(WarpUplink uplink) {
    final Object views = LaneModel.VIEWS.get(this);
    if (views instanceof DemandLaneView<?>) {
      return ((DemandLaneView<?>) views).nextDownCue(uplink);
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        final Value value = ((DemandLaneView<?>) viewArray[i]).nextDownCue(uplink);
        if (value != null) {
          return value;
        }
      }
    }
    return null;
  }

}
