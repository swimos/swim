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

package swim.router;

import swim.kernel.HostDef;
import swim.kernel.KernelProxy;
import swim.kernel.MeshDef;
import swim.kernel.PartDef;
import swim.runtime.EdgeBinding;
import swim.runtime.HostBinding;
import swim.runtime.MeshBinding;
import swim.runtime.PartBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class RouterKernel extends KernelProxy {
  final double kernelPriority;

  public RouterKernel(double kernelPriority) {
    this.kernelPriority = kernelPriority;
  }

  public RouterKernel() {
    this(KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  @Override
  public EdgeBinding createEdge(String edgeName) {
    EdgeBinding edge = super.createEdge(edgeName);
    if (edge == null) {
      edge = new EdgeTable();
    }
    return edge;
  }

  @Override
  public MeshBinding createMesh(String edgeName, MeshDef meshDef) {
    MeshBinding mesh = super.createMesh(edgeName, meshDef);
    if (mesh == null) {
      mesh = new MeshTable();
    }
    return mesh;
  }

  @Override
  public MeshBinding createMesh(String edgeName, Uri meshUri) {
    MeshBinding mesh = super.createMesh(edgeName, meshUri);
    if (mesh == null) {
      mesh = new MeshTable();
    }
    return mesh;
  }

  @Override
  public PartBinding createPart(String edgeName, Uri meshUri, PartDef partDef) {
    PartBinding part = super.createPart(edgeName, meshUri, partDef);
    if (part == null) {
      part = new PartTable(partDef.predicate());
    }
    return part;
  }

  @Override
  public PartBinding createPart(String edgeName, Uri meshUri, Value partKey) {
    PartBinding part = super.createPart(edgeName, meshUri, partKey);
    if (part == null) {
      part = new PartTable();
    }
    return part;
  }

  @Override
  public HostBinding createHost(String edgeName, Uri meshUri, Value partKey, HostDef hostDef) {
    HostBinding host = super.createHost(edgeName, meshUri, partKey, hostDef);
    if (host == null) {
      host = new HostTable();
    }
    return host;
  }

  @Override
  public HostBinding createHost(String edgeName, Uri meshUri, Value partKey, Uri hostUri) {
    HostBinding host = super.createHost(edgeName, meshUri, partKey, hostUri);
    if (host == null) {
      host = new HostTable();
    }
    return host;
  }

  private static final double KERNEL_PRIORITY = 0.0;

  public static RouterKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || RouterKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(KERNEL_PRIORITY);
      return new RouterKernel(kernelPriority);
    }
    return null;
  }
}
