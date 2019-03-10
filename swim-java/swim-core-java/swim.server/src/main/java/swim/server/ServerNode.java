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

package swim.server;

import swim.api.policy.Policy;
import swim.runtime.NodeBinding;
import swim.runtime.NodeProxy;
import swim.store.StoreBinding;

public final class ServerNode extends NodeProxy {
  final StoreBinding store;
  final Policy policy;

  ServerNode(NodeBinding nodeBinding, StoreBinding store, Policy policy) {
    super(nodeBinding);
    this.store = store;
    this.policy = policy;
  }

  @Override
  public Policy policy() {
    return this.policy;
  }

  @Override
  public StoreBinding store() {
    return this.store;
  }
}
