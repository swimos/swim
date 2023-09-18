// Copyright 2015-2023 Nstream, inc.
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

package swim.actor;

import java.util.Collection;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.collections.HashTrieMap;
import swim.concurrent.StageDef;
import swim.store.StoreDef;
import swim.structure.Value;
import swim.system.HostDef;
import swim.system.LaneDef;
import swim.system.LogDef;
import swim.system.MeshDef;
import swim.system.NodeDef;
import swim.system.PartDef;
import swim.system.PolicyDef;
import swim.uri.Uri;
import swim.uri.UriMapper;
import swim.util.Murmur3;

public class ActorMeshDef implements MeshDef, Debug {

  final Uri meshUri;
  final HashTrieMap<Value, PartDef> partDefs;
  final UriMapper<HostDef> hostDefs;
  final UriMapper<NodeDef> nodeDefs;
  final UriMapper<LaneDef> laneDefs;
  final LogDef logDef;
  final PolicyDef policyDef;
  final StageDef stageDef;
  final StoreDef storeDef;

  public ActorMeshDef(Uri meshUri, HashTrieMap<Value, PartDef> partDefs,
                      UriMapper<HostDef> hostDefs, UriMapper<NodeDef> nodeDefs,
                      UriMapper<LaneDef> laneDefs, LogDef logDef, PolicyDef policyDef,
                      StageDef stageDef, StoreDef storeDef) {
    this.meshUri = meshUri;
    this.partDefs = partDefs;
    this.hostDefs = hostDefs;
    this.nodeDefs = nodeDefs;
    this.laneDefs = laneDefs;
    this.logDef = logDef;
    this.policyDef = policyDef;
    this.stageDef = stageDef;
    this.storeDef = storeDef;
  }

  @Override
  public final Uri meshUri() {
    return this.meshUri;
  }

  public ActorMeshDef meshUri(Uri meshUri) {
    return this.copy(meshUri, this.partDefs, this.hostDefs, this.nodeDefs, this.laneDefs,
                     this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final Collection<? extends PartDef> partDefs() {
    return this.partDefs.values();
  }

  @Override
  public final PartDef getPartDef(Value partKey) {
    return this.partDefs.get(partKey);
  }

  public ActorMeshDef partDef(PartDef partDef) {
    return this.copy(this.meshUri, this.partDefs.updated(partDef.partKey(), partDef),
                     this.hostDefs, this.nodeDefs, this.laneDefs,
                     this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final Collection<? extends HostDef> hostDefs() {
    return this.hostDefs.values();
  }

  @Override
  public final HostDef getHostDef(Uri hostUri) {
    return this.hostDefs.get(hostUri);
  }

  public ActorMeshDef hostDef(HostDef hostDef) {
    return this.copy(this.meshUri, this.partDefs, this.hostDefs.updated(hostDef.hostPattern(), hostDef),
                     this.nodeDefs, this.laneDefs,
                     this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final Collection<? extends NodeDef> nodeDefs() {
    return this.nodeDefs.values();
  }

  @Override
  public final NodeDef getNodeDef(Uri nodeUri) {
    return this.nodeDefs.get(nodeUri);
  }

  public ActorMeshDef nodeDef(NodeDef nodeDef) {
    return this.copy(this.meshUri, this.partDefs, this.hostDefs,
                     this.nodeDefs.updated(nodeDef.nodePattern(), nodeDef), this.laneDefs,
                     this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final Collection<? extends LaneDef> laneDefs() {
    return this.laneDefs.values();
  }

  @Override
  public final LaneDef getLaneDef(Uri laneUri) {
    return this.laneDefs.get(laneUri);
  }

  public ActorMeshDef laneDef(LaneDef laneDef) {
    return this.copy(this.meshUri, this.partDefs, this.hostDefs, this.nodeDefs,
                     this.laneDefs.updated(laneDef.lanePattern(), laneDef),
                     this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final LogDef logDef() {
    return this.logDef;
  }

  public ActorMeshDef logDef(LogDef logDef) {
    return this.copy(this.meshUri, this.partDefs, this.hostDefs, this.nodeDefs, this.laneDefs,
                     logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final PolicyDef policyDef() {
    return this.policyDef;
  }

  public ActorMeshDef policyDef(PolicyDef policyDef) {
    return this.copy(this.meshUri, this.partDefs, this.hostDefs, this.nodeDefs, this.laneDefs,
                     this.logDef, policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final StageDef stageDef() {
    return this.stageDef;
  }

  public ActorMeshDef stageDef(StageDef stageDef) {
    return this.copy(this.meshUri, this.partDefs, this.hostDefs, this.nodeDefs, this.laneDefs,
                     this.logDef, this.policyDef, stageDef, this.storeDef);
  }

  @Override
  public final StoreDef storeDef() {
    return this.storeDef;
  }

  public ActorMeshDef storeDef(StoreDef storeDef) {
    return this.copy(this.meshUri, this.partDefs, this.hostDefs, this.nodeDefs, this.laneDefs,
                     this.logDef, this.policyDef, this.stageDef, storeDef);
  }

  protected ActorMeshDef copy(Uri meshUri, HashTrieMap<Value, PartDef> partDefs,
                              UriMapper<HostDef> hostDefs, UriMapper<NodeDef> nodeDefs,
                              UriMapper<LaneDef> laneDefs, LogDef logDef, PolicyDef policyDef,
                              StageDef stageDef, StoreDef storeDef) {
    return new ActorMeshDef(meshUri, partDefs, hostDefs, nodeDefs, laneDefs,
                            logDef, policyDef, stageDef, storeDef);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ActorMeshDef) {
      final ActorMeshDef that = (ActorMeshDef) other;
      return this.meshUri.equals(that.meshUri)
          && this.partDefs.equals(that.partDefs)
          && this.hostDefs.equals(that.hostDefs)
          && this.nodeDefs.equals(that.nodeDefs)
          && this.laneDefs.equals(that.laneDefs)
          && (this.logDef == null ? that.logDef == null : this.logDef.equals(that.logDef))
          && (this.policyDef == null ? that.policyDef == null : this.policyDef.equals(that.policyDef))
          && (this.stageDef == null ? that.stageDef == null : this.stageDef.equals(that.stageDef))
          && (this.storeDef == null ? that.storeDef == null : this.storeDef.equals(that.storeDef));
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (ActorMeshDef.hashSeed == 0) {
      ActorMeshDef.hashSeed = Murmur3.seed(ActorMeshDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(ActorMeshDef.hashSeed, Murmur3.hash(this.meshUri)),
        this.partDefs.hashCode()), this.hostDefs.hashCode()), this.nodeDefs.hashCode()),
        this.laneDefs.hashCode()), Murmur3.hash(this.logDef)), Murmur3.hash(this.policyDef)),
        Murmur3.hash(this.stageDef)), Murmur3.hash(this.storeDef)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("ActorMeshDef").write('.').write("fromMeshUri").write('(')
                   .debug(this.meshUri).write(')');
    for (PartDef partDef : this.partDefs.values()) {
      output = output.write('.').write("partDef").write('(').debug(partDef).write(')');
    }
    for (HostDef hostDef : this.hostDefs.values()) {
      output = output.write('.').write("hostDef").write('(').debug(hostDef).write(')');
    }
    for (NodeDef nodeDef : this.nodeDefs.values()) {
      output = output.write('.').write("nodeDef").write('(').debug(nodeDef).write(')');
    }
    for (LaneDef laneDef : this.laneDefs.values()) {
      output = output.write('.').write("laneDef").write('(').debug(laneDef).write(')');
    }
    if (this.logDef != null) {
      output = output.write('.').write("logDef").write('(').debug(this.logDef).write(')');
    }
    if (this.policyDef != null) {
      output = output.write('.').write("policyDef").write('(').debug(this.policyDef).write(')');
    }
    if (this.stageDef != null) {
      output = output.write('.').write("stageDef").write('(').debug(this.stageDef).write(')');
    }
    if (this.storeDef != null) {
      output = output.write('.').write("storeDef").write('(').debug(this.storeDef).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static ActorMeshDef fromMeshUri(Uri meshUri) {
    return new ActorMeshDef(meshUri, HashTrieMap.empty(), UriMapper.empty(),
                            UriMapper.empty(), UriMapper.empty(),
                            null, null, null, null);
  }

  public static ActorMeshDef fromMeshUri(String meshUri) {
    return ActorMeshDef.fromMeshUri(Uri.parse(meshUri));
  }

}
