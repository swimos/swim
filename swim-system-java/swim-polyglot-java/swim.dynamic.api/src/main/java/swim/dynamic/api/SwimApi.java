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

package swim.dynamic.api;

import swim.dynamic.HostLibrary;
import swim.dynamic.HostPackage;
import swim.dynamic.JavaHostLibrary;
import swim.dynamic.JavaHostPackage;
import swim.dynamic.api.agent.SwimApiAgent;
import swim.dynamic.api.lane.SwimApiLane;
import swim.dynamic.api.plane.SwimApiPlane;
import swim.dynamic.api.warp.SwimApiWarp;

public final class SwimApi {
  private SwimApi() {
    // static
  }

  public static final HostPackage PACKAGE;

  public static final HostLibrary LIBRARY;

  static {
    final JavaHostPackage hostPkg = new JavaHostPackage("swim.api");
    PACKAGE = hostPkg;
    hostPkg.addHostType(HostLane.TYPE);
    hostPkg.addHostType(HostLink.TYPE);

    final JavaHostLibrary hostLib = new JavaHostLibrary("swim.api");
    LIBRARY = hostLib;
    hostLib.addHostPackage(SwimApi.PACKAGE);
    hostLib.addHostPackage(SwimApiAgent.PACKAGE);
    hostLib.addHostPackage(SwimApiLane.PACKAGE);
    hostLib.addHostPackage(SwimApiPlane.PACKAGE);
    hostLib.addHostPackage(SwimApiWarp.PACKAGE);
  }
}
