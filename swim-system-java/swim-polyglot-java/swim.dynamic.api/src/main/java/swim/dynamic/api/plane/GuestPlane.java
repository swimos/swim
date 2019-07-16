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

package swim.dynamic.api.plane;

import swim.api.plane.Plane;
import swim.api.plane.PlaneContext;
import swim.dynamic.Bridge;
import swim.dynamic.BridgeGuest;

public class GuestPlane extends BridgeGuest implements Plane {
  protected final PlaneContext planeContext;

  public GuestPlane(Bridge bridge, Object guest, PlaneContext planeContext) {
    super(bridge, guest);
    this.planeContext = planeContext;
  }

  @Override
  public PlaneContext planeContext() {
    return this.planeContext;
  }

  @Override
  public void willStart() {
    if (this.bridge.guestCanInvokeMember(this.guest, "willStart")) {
      this.bridge.guestInvokeMember(this.guest, "willStart");
    }
  }

  @Override
  public void didStart() {
    if (this.bridge.guestCanInvokeMember(this.guest, "didStart")) {
      this.bridge.guestInvokeMember(this.guest, "didStart");
    }
  }

  @Override
  public void willStop() {
    if (this.bridge.guestCanInvokeMember(this.guest, "willStop")) {
      this.bridge.guestInvokeMember(this.guest, "willStop");
    }
  }

  @Override
  public void didStop() {
    if (this.bridge.guestCanInvokeMember(this.guest, "didStop")) {
      this.bridge.guestInvokeMember(this.guest, "didStop");
    }
  }

  @Override
  public void willClose() {
    if (this.bridge.guestCanInvokeMember(this.guest, "willClose")) {
      this.bridge.guestInvokeMember(this.guest, "willClose");
    }
  }

  @Override
  public void didClose() {
    if (this.bridge.guestCanInvokeMember(this.guest, "didClose")) {
      this.bridge.guestInvokeMember(this.guest, "didClose");
    }
  }

  @Override
  public void didFail(Throwable error) {
    if (this.bridge.guestCanInvokeMember(this.guest, "didFail")) {
      this.bridge.guestInvokeMember(this.guest, "didFail", error);
    }
  }
}
