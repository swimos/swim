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
import swim.math.Z2Form;
import swim.runtime.NodeBinding;
import swim.runtime.NodeProxy;
import swim.store.ListDataBinding;
import swim.store.MapDataBinding;
import swim.store.SpatialDataBinding;
import swim.store.Storage;
import swim.store.ValueDataBinding;
import swim.structure.Record;
import swim.structure.Value;

public final class ServerNode extends NodeProxy {
  final Storage storage;
  final Policy policy;

  ServerNode(NodeBinding nodeBinding, Storage storage, Policy policy) {
    super(nodeBinding);
    this.storage = storage;
    this.policy = policy;
  }

  @Override
  public Policy policy() {
    return this.policy;
  }

  protected Value treeName(Value name) {
    return Record.create(2).slot("node", nodeUri().toString()).slot("name", name).commit();
  }

  @Override
  public ListDataBinding openListData(Value name) {
    return storage.openListData(nodeUri(), name);
  }

  @Override
  public MapDataBinding openMapData(Value name) {
    return storage.openMapData(nodeUri(), name);
  }

  @Override
  public <S> SpatialDataBinding<S> openSpatialData(Value name, Z2Form<S> shapeForm) {
    return storage.openSpatialData(nodeUri(), name, shapeForm);
  }

  @Override
  public ValueDataBinding openValueData(Value name) {
    return storage.openValueData(nodeUri(), name);
  }
}
