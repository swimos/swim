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

import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostClassType;
import swim.structure.Num;

public final class HostNum {
  private HostNum() {
    // static
  }

  public static final HostObjectType<Num> TYPE;

  static {
    final JavaHostClassType<Num> type = new JavaHostClassType<>(Num.class);
    TYPE = type;
    type.extendType(HostValue.TYPE);
  }
}
