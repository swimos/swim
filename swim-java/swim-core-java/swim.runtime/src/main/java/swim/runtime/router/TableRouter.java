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

package swim.runtime.router;

import swim.runtime.HostBinding;
import swim.runtime.MeshBinding;
import swim.runtime.RootBinding;
import swim.runtime.RouterProxy;

public class TableRouter extends RouterProxy {
  @Override
  public double routerPriority() {
    return 0.0;
  }

  @Override
  public RootBinding createRoot() {
    return new RootTable();
  }

  @Override
  public MeshBinding createMesh() {
    return new MeshTable();
  }

  @Override
  public HostBinding createHost() {
    return new HostTable();
  }
}
