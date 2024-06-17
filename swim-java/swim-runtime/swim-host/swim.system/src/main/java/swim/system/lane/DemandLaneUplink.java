// Copyright 2015-2024 Nstream, inc.
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

import swim.concurrent.Stage;
import swim.structure.Value;
import swim.system.UplinkAddress;
import swim.system.WarpBinding;
import swim.system.warp.DemandUplinkModem;
import swim.warp.SyncRequest;

public class DemandLaneUplink extends DemandUplinkModem {

  final DemandLaneModel laneBinding;

  public DemandLaneUplink(DemandLaneModel laneBinding, WarpBinding linkBinding,
                          UplinkAddress uplinkAddress) {
    super(linkBinding, uplinkAddress);
    this.laneBinding = laneBinding;
  }

  @Override
  public DemandLaneModel laneBinding() {
    return this.laneBinding;
  }

  @Override
  public Stage stage() {
    return this.laneBinding.stage();
  }

  @Override
  protected Value nextDownCue() {
    return this.laneBinding.nextDownCue(this);
  }

  @Override
  protected void willSync(SyncRequest request) {
    this.cueDown();
    super.willSync(request);
  }

}
