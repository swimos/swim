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

package swim.dynamic.api.warp.function;

import swim.api.warp.function.DidCommand;
import swim.dynamic.Bridge;
import swim.dynamic.BridgeGuest;
import swim.structure.Value;

public class GuestDidCommand extends BridgeGuest implements DidCommand {
  public GuestDidCommand(Bridge bridge, Object guest) {
    super(bridge, guest);
  }

  @Override
  public void didCommand(Value body) {
    this.bridge.guestExecuteVoid(this.guest, body);
  }
}
