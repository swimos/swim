// Copyright 2015-2022 Swim.inc
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

package swim.dynamic.api.warp.function;

import swim.api.warp.WarpUplink;
import swim.api.warp.function.WillUplink;
import swim.dynamic.Bridge;
import swim.dynamic.BridgeGuest;

public class GuestWillUplink extends BridgeGuest implements WillUplink {

  public GuestWillUplink(Bridge bridge, Object guest) {
    super(bridge, guest);
  }

  @Override
  public void willUplink(WarpUplink uplink) {
    this.bridge.guestExecuteVoid(this.guest, uplink);
  }

}