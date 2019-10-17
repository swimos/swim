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

package swim.meta;

import swim.api.space.Space;
import swim.kernel.KernelContext;
import swim.kernel.KernelProxy;
import swim.recon.Recon;
import swim.runtime.EdgeBinding;
import swim.runtime.EdgeContext;
import swim.runtime.HostBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LinkContext;
import swim.runtime.MeshBinding;
import swim.runtime.NodeAddress;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriPath;

public class MetaKernel extends KernelProxy {
  final double kernelPriority;

  public MetaKernel(double kernelPriority) {
    this.kernelPriority = kernelPriority;
  }

  public MetaKernel() {
    this(KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  @Override
  public NodeBinding createNode(NodeAddress nodeAddress) {
    final Uri nodeUri = nodeAddress.nodeUri();
    if ("swim".equals(nodeUri.schemeName())) {
      final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
      final Space space = kernel.getSpace(nodeAddress.edgeName());
      if (space instanceof EdgeContext) {
        final EdgeBinding edge = ((EdgeContext) space).edgeWrapper();
        final UriPath nodePath = nodeUri.path();
        final NodeBinding nodeBinding = createMeta(edge, nodePath);
        if (nodeBinding != null) {
          return nodeBinding;
        }
      }
    }
    return super.createNode(nodeAddress);
  }

  protected NodeBinding createMeta(EdgeBinding edge, UriPath nodePath) {
    if (!nodePath.isEmpty()) {
      if ("meta:edge".equals(nodePath.head())) {
        nodePath = nodePath.tail(); // drop meta:edge
        if (!nodePath.isEmpty()) {
          nodePath = nodePath.tail(); // drop /
        }
        return createMetaEdge(edge, nodePath);
      } else if ("meta:mesh".equals(nodePath.head())) {
        nodePath = nodePath.tail(); // drop meta:mesh
        if (!nodePath.isEmpty()) {
          nodePath = nodePath.tail(); // drop /
        }
        return createMetaMesh(edge, nodePath);
      } else if ("meta:part".equals(nodePath.head())) {
        nodePath = nodePath.tail(); // drop meta:part
        if (!nodePath.isEmpty()) {
          nodePath = nodePath.tail(); // drop /
        }
        return createMetaPart(edge, nodePath);
      } else if ("meta:host".equals(nodePath.head())) {
        nodePath = nodePath.tail(); // drop meta:host
        if (!nodePath.isEmpty()) {
          nodePath = nodePath.tail(); // drop /
        }
        return createMetaHost(edge, nodePath);
      } else if ("meta:node".equals(nodePath.head())) {
        nodePath = nodePath.tail(); // drop meta:node
        if (!nodePath.isEmpty()) {
          nodePath = nodePath.tail(); // drop /
        }
        return createMetaNode(edge, nodePath);
      }
    }
    return null;
  }

  protected NodeBinding createMetaEdge(EdgeBinding edge, UriPath nodePath) {
    if (nodePath.isEmpty()) {
      return new MetaEdgeAgent(edge);
    }
    return null;
  }

  protected NodeBinding createMetaMesh(EdgeBinding edge, UriPath nodePath) {
    if (nodePath.isRelative()) {
      final Uri meshUri = nodePath.isEmpty() ? Uri.empty() : Uri.parse(nodePath.head());
      final MeshBinding mesh = edge.getMesh(meshUri);
      if (mesh != null) {
        if (!nodePath.isEmpty()) {
          nodePath = nodePath.tail(); // drop meshUri
          if (!nodePath.isEmpty()) {
            nodePath = nodePath.tail(); // drop /
          }
        }
        return createMetaMesh(mesh, nodePath);
      }
    }
    return null;
  }

  public NodeBinding createMetaMesh(MeshBinding mesh, UriPath nodePath) {
    if (nodePath.isEmpty()) {
      return new MetaMeshAgent(mesh);
    } else if ("part".equals(nodePath.head())) {
      nodePath = nodePath.tail(); // drop part
      if (!nodePath.isEmpty()) {
        nodePath = nodePath.tail(); // drop /
      }
      return createMetaPart(mesh, nodePath);
    } else if ("host".equals(nodePath.head())) {
      nodePath = nodePath.tail(); // drop host
      if (!nodePath.isEmpty()) {
        nodePath = nodePath.tail(); // drop /
      }
      return createMetaHost(mesh, nodePath);
    } else if ("node".equals(nodePath.head())) {
      nodePath = nodePath.tail(); // drop node
      if (!nodePath.isEmpty()) {
        nodePath = nodePath.tail(); // drop /
      }
      return createMetaNode(mesh, nodePath);
    }
    return null;
  }

  protected NodeBinding createMetaPart(EdgeBinding edge, UriPath nodePath) {
    final MeshBinding mesh = edge.network();
    if (mesh != null) {
      return createMetaPart(mesh, nodePath);
    }
    return null;
  }

  public NodeBinding createMetaPart(MeshBinding mesh, UriPath nodePath) {
    if (nodePath.isRelative()) {
      final Value partKey = nodePath.isEmpty() ? Value.extant() : Recon.parse(nodePath.head());
      final PartBinding part = mesh.getPart(partKey);
      if (part != null) {
        if (!nodePath.isEmpty()) {
          nodePath = nodePath.tail(); // drop partKey
          if (!nodePath.isEmpty()) {
            nodePath = nodePath.tail(); // drop /
          }
        }
        return createMetaPart(part, nodePath);
      }
    }
    return null;
  }

  public NodeBinding createMetaPart(PartBinding part, UriPath nodePath) {
    if (nodePath.isEmpty()) {
      return new MetaPartAgent(part);
    } else if ("host".equals(nodePath.head())) {
      nodePath = nodePath.tail(); // drop host
      if (!nodePath.isEmpty()) {
        nodePath = nodePath.tail(); // drop /
      }
      return createMetaHost(part, nodePath);
    } else if ("node".equals(nodePath.head())) {
      nodePath = nodePath.tail(); // drop node
      if (!nodePath.isEmpty()) {
        nodePath = nodePath.tail(); // drop /
      }
      return createMetaNode(part, nodePath);
    }
    return null;
  }

  protected NodeBinding createMetaHost(EdgeBinding edge, UriPath nodePath) {
    final MeshBinding mesh = edge.network();
    if (mesh != null) {
      return createMetaHost(mesh, nodePath);
    }
    return null;
  }

  public NodeBinding createMetaHost(MeshBinding mesh, UriPath nodePath) {
    final PartBinding part = mesh.gateway();
    if (part != null) {
      return createMetaHost(part, nodePath);
    }
    return null;
  }

  public NodeBinding createMetaHost(PartBinding part, UriPath nodePath) {
    if (nodePath.isRelative()) {
      final Uri hostUri = nodePath.isEmpty() ? Uri.empty() : Uri.parse(nodePath.head());
      final HostBinding host = part.getHost(hostUri);
      if (host != null) {
        if (!nodePath.isEmpty()) {
          nodePath = nodePath.tail(); // drop hostUri
          if (!nodePath.isEmpty()) {
            nodePath = nodePath.tail(); // drop /
          }
        }
        return createMetaHost(host, nodePath);
      }
    }
    return null;
  }

  public NodeBinding createMetaHost(HostBinding host, UriPath nodePath) {
    if (nodePath.isEmpty()) {
      return new MetaHostAgent(host);
    } else if ("node".equals(nodePath.head())) {
      nodePath = nodePath.tail(); // drop node
      if (!nodePath.isEmpty()) {
        nodePath = nodePath.tail(); // drop /
      }
      return createMetaNode(host, nodePath);
    }
    return null;
  }

  protected NodeBinding createMetaNode(EdgeBinding edge, UriPath nodePath) {
    final MeshBinding mesh = edge.network();
    if (mesh != null) {
      return createMetaNode(mesh, nodePath);
    }
    return null;
  }

  public NodeBinding createMetaNode(MeshBinding mesh, UriPath nodePath) {
    final PartBinding part = mesh.gateway();
    if (part != null) {
      return createMetaNode(part, nodePath);
    }
    return null;
  }

  public NodeBinding createMetaNode(PartBinding part, UriPath nodePath) {
    final HostBinding host = part.master();
    if (host != null) {
      return createMetaNode(host, nodePath);
    }
    return null;
  }

  public NodeBinding createMetaNode(HostBinding host, UriPath nodePath) {
    if (nodePath.isRelative()) {
      final Uri nodeUri = nodePath.isEmpty() ? Uri.empty() : Uri.parse(nodePath.head());
      final NodeBinding node = host.getNode(nodeUri);
      if (node != null) {
        if (!nodePath.isEmpty()) {
          nodePath = nodePath.tail(); // drop nodeUri
          if (!nodePath.isEmpty()) {
            nodePath = nodePath.tail(); // drop /
          }
        }
        return createMetaNode(node, nodePath);
      }
    }
    return null;
  }

  public NodeBinding createMetaNode(NodeBinding node, UriPath nodePath) {
    if (nodePath.isEmpty()) {
      return new MetaNodeAgent(node);
    } else if ("lane".equals(nodePath.head())) {
      nodePath = nodePath.tail(); // drop lane
      if (!nodePath.isEmpty()) {
        nodePath = nodePath.tail(); // drop /
      }
      return createMetaLane(node, nodePath);
    }
    return null;
  }

  public NodeBinding createMetaLane(NodeBinding node, UriPath nodePath) {
    if (nodePath.isRelative()) {
      final Uri laneUri = nodePath.isEmpty() ? Uri.empty() : Uri.parse(nodePath.head());
      final LaneBinding lane = node.getLane(laneUri);
      if (lane != null) {
        if (!nodePath.isEmpty()) {
          nodePath = nodePath.tail(); // drop laneUri
          if (!nodePath.isEmpty()) {
            nodePath = nodePath.tail(); // drop /
          }
        }
        return createMetaLane(lane, nodePath);
      }
    }
    return null;
  }

  public NodeBinding createMetaLane(LaneBinding lane, UriPath nodePath) {
    if (nodePath.isEmpty()) {
      return new MetaLaneAgent(lane);
    } else if ("uplink".equals(nodePath.head())) {
      nodePath = nodePath.tail(); // drop uplink
      if (!nodePath.isEmpty()) {
        nodePath = nodePath.tail(); // drop /
      }
      return createMetaUplink(lane, nodePath);
    }
    return null;
  }

  public NodeBinding createMetaUplink(LaneBinding lane, UriPath nodePath) {
    if (!nodePath.isEmpty() && nodePath.isRelative()) {
      final Value linkKey = Recon.parse(nodePath.head());
      final LinkContext uplink = lane.getUplink(linkKey);
      nodePath = nodePath.tail(); // drop linkKey
      if (!nodePath.isEmpty()) {
        nodePath = nodePath.tail(); // drop /
      }
      return createMetaUplink(uplink, nodePath);
    }
    return null;
  }

  public NodeBinding createMetaUplink(LinkContext uplink, UriPath nodePath) {
    if (nodePath.isEmpty()) {
      return new MetaUplinkAgent(uplink);
    }
    return null;
  }

  private static final double KERNEL_PRIORITY = 2.0;

  public static MetaKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || MetaKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(KERNEL_PRIORITY);
      return new MetaKernel(kernelPriority);
    }
    return null;
  }
}
