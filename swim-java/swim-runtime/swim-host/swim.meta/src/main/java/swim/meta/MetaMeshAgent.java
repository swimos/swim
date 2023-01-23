// Copyright 2015-2023 Swim.inc
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

package swim.meta;

import swim.system.LinkBinding;
import swim.system.MeshBinding;
import swim.system.NodeContext;
import swim.system.agent.AgentNode;
import swim.uri.Uri;

public final class MetaMeshAgent extends AgentNode {

  protected final MeshBinding mesh;

  public MetaMeshAgent(MeshBinding mesh) {
    this.mesh = mesh;
  }

  @Override
  public void setNodeContext(NodeContext nodeContext) {
    super.setNodeContext(nodeContext);
    this.mesh.openMetaMesh(this.mesh, this);
  }

  @Override
  protected void openUnknownUplink(Uri laneUri, LinkBinding link) {
    if (MetaMeshAgent.NODES_URI.equals(laneUri)) {
      link.setNodeUri(MetaMeshAgent.META_HOST_URI);
      this.host().openUplink(link);
    } else {
      super.openUnknownUplink(laneUri, link);
    }
  }

  static final Uri NODES_URI = Uri.parse("nodes");
  static final Uri META_HOST_URI = Uri.parse("swim:meta:host");

}
