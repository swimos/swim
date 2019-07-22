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

package swim.dynamic.api.lane;

import swim.dynamic.HostPackage;
import swim.dynamic.JavaHostPackage;

public final class SwimApiLane {
  private SwimApiLane() {
    // static
  }

  public static final HostPackage PACKAGE;

  static {
    final JavaHostPackage hostPkg = new JavaHostPackage("swim.api.lane");
    PACKAGE = hostPkg;
    hostPkg.addHostType(HostCommandLane.TYPE);
    hostPkg.addHostType(HostDemandLane.TYPE);
    hostPkg.addHostType(HostDemandMapLane.TYPE);
    hostPkg.addHostType(HostJoinMapLane.TYPE);
    hostPkg.addHostType(HostJoinValueLane.TYPE);
    hostPkg.addHostType(HostListLane.TYPE);
    hostPkg.addHostType(HostMapLane.TYPE);
    hostPkg.addHostType(HostSpatialLane.TYPE);
    hostPkg.addHostType(HostSupplyLane.TYPE);
    hostPkg.addHostType(HostValueLane.TYPE);
    hostPkg.addHostType(HostLaneFactory.TYPE);
  }
}
