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

package swim.dynamic.api.lane.function;

import java.util.Iterator;
import swim.api.lane.function.OnSyncKeys;
import swim.api.warp.WarpUplink;
import swim.dynamic.Bridge;
import swim.dynamic.BridgeGuest;

public class GuestOnSyncKeys<K> extends BridgeGuest implements OnSyncKeys<K> {
  public GuestOnSyncKeys(Bridge bridge, Object guest) {
    super(bridge, guest);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Iterator<K> onSync(WarpUplink uplink) {
    return (Iterator<K>) this.bridge.guestExecute(this.guest, uplink);
  }
}
