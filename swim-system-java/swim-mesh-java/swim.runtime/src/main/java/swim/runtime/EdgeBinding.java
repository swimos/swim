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
import swim.uri.Uri;

public interface EdgeBinding extends TierBinding, CellBinding, CellContext {
  EdgeBinding edgeWrapper();

  EdgeContext edgeContext();

  void setEdgeContext(EdgeContext edgeContext);

  <T> T unwrapEdge(Class<T> edgeClass);

  EdgeAddress cellAddress();

  String edgeName();

  void openMetaEdge(EdgeBinding edge, NodeBinding metaEdge);

  MeshBinding network();

  void setNetwork(MeshBinding network);

  HashTrieMap<Uri, MeshBinding> meshes();

  MeshBinding getMesh(Uri meshUri);

  MeshBinding openMesh(Uri meshUri);

  MeshBinding openMesh(Uri meshUri, MeshBinding mesh);

  void openMetaMesh(MeshBinding mesh, NodeBinding metaMesh);

  void openMetaPart(PartBinding part, NodeBinding metaPart);

  void openMetaHost(HostBinding host, NodeBinding metaHost);

  void openMetaNode(NodeBinding node, NodeBinding metaNode);

  void openMetaLane(LaneBinding lane, NodeBinding metaLane);

  void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink);
}
