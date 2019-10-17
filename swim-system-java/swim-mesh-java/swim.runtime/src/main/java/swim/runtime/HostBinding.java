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

import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriMapper;

public interface HostBinding extends TierBinding, CellBinding {
  PartBinding part();

  HostBinding hostWrapper();

  HostContext hostContext();

  void setHostContext(HostContext hostContext);

  <T> T unwrapHost(Class<T> hostClass);

  HostAddress cellAddress();

  Uri meshUri();

  Value partKey();

  Uri hostUri();

  boolean isConnected();

  boolean isRemote();

  boolean isSecure();

  boolean isPrimary();

  void setPrimary(boolean isPrimary);

  boolean isReplica();

  void setReplica(boolean isReplica);

  boolean isMaster();

  boolean isSlave();

  void didBecomeMaster();

  void didBecomeSlave();

  void openMetaHost(HostBinding host, NodeBinding metaHost);

  UriMapper<NodeBinding> nodes();

  NodeBinding getNode(Uri nodeUri);

  NodeBinding openNode(Uri nodeUri);

  NodeBinding openNode(Uri nodeUri, NodeBinding node);

  void openMetaNode(NodeBinding node, NodeBinding metaNode);

  void openMetaLane(LaneBinding lane, NodeBinding metaLane);

  void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink);
}
