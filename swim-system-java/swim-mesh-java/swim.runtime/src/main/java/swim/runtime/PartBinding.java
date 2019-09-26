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

package swim.runtime;

import swim.collections.HashTrieMap;
import swim.structure.Value;
import swim.uri.Uri;

public interface PartBinding extends TierBinding, CellBinding, CellContext {
  MeshBinding mesh();

  PartBinding partWrapper();

  PartContext partContext();

  void setPartContext(PartContext partContext);

  <T> T unwrapPart(Class<T> partClass);

  PartAddress cellAddress();

  Uri meshUri();

  Value partKey();

  PartPredicate predicate();

  void openMetaPart(PartBinding part, NodeBinding metaPart);

  HostBinding master();

  void setMaster(HostBinding master);

  HashTrieMap<Uri, HostBinding> hosts();

  HostBinding getHost(Uri hostUri);

  HostBinding openHost(Uri hostUri);

  HostBinding openHost(Uri hostUri, HostBinding host);

  void reopenUplinks();

  void openMetaHost(HostBinding host, NodeBinding metaHost);

  void openMetaNode(NodeBinding node, NodeBinding metaNode);

  void openMetaLane(LaneBinding lane, NodeBinding metaLane);

  void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink);
}
