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

import swim.collections.FingerTrieSeq;
import swim.structure.Value;
import swim.uri.Uri;

public interface MeshBinding extends TierBinding, CellBinding, CellContext {
  EdgeBinding edge();

  MeshBinding meshWrapper();

  MeshContext meshContext();

  void setMeshContext(MeshContext meshContext);

  <T> T unwrapMesh(Class<T> meshClass);

  MeshAddress cellAddress();

  Uri meshUri();

  void openMetaMesh(MeshBinding mesh, NodeBinding metaMesh);

  PartBinding gateway();

  void setGateway(PartBinding gateway);

  PartBinding ourself();

  void setOurself(PartBinding ourself);

  FingerTrieSeq<PartBinding> parts();

  PartBinding getPart(Uri nodeUri);

  PartBinding getPart(Value partKey);

  PartBinding openPart(Uri nodeUri);

  PartBinding openGateway();

  PartBinding addPart(Value partKey, PartBinding part);

  void openMetaPart(PartBinding part, NodeBinding metaPart);

  void openMetaHost(HostBinding host, NodeBinding metaHost);

  void openMetaNode(NodeBinding node, NodeBinding metaNode);

  void openMetaLane(LaneBinding lane, NodeBinding metaLane);

  void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink);
}
