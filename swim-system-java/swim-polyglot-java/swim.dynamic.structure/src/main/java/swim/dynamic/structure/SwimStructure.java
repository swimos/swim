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

package swim.dynamic.structure;

import swim.dynamic.HostLibrary;
import swim.dynamic.HostPackage;
import swim.dynamic.JavaHostLibrary;
import swim.dynamic.JavaHostPackage;

public final class SwimStructure {
  private SwimStructure() {
    // static
  }

  public static final HostPackage PACKAGE;

  public static final HostLibrary LIBRARY;

  static {
    final JavaHostPackage hostPkg = new JavaHostPackage("swim.structure");
    PACKAGE = hostPkg;
    hostPkg.addHostType(HostItem.TYPE);
    hostPkg.addHostType(HostField.TYPE);
    hostPkg.addHostType(HostAttr.TYPE);
    hostPkg.addHostType(HostSlot.TYPE);
    hostPkg.addHostType(HostValue.TYPE);
    hostPkg.addHostType(HostRecord.TYPE);
    hostPkg.addHostType(HostData.TYPE);
    hostPkg.addHostType(HostText.TYPE);
    hostPkg.addHostType(HostNum.TYPE);
    hostPkg.addHostType(HostBool.TYPE);
    hostPkg.addHostType(HostExtant.TYPE);
    hostPkg.addHostType(HostAbsent.TYPE);

    final JavaHostLibrary hostLib = new JavaHostLibrary("swim.structure");
    LIBRARY = hostLib;
    hostLib.addHostPackage(SwimStructure.PACKAGE);
  }
}
