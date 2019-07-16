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

package swim.fabric;

import java.util.Collection;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.collections.HashTrieMap;
import swim.kernel.AgentRouteDef;
import swim.kernel.AuthenticatorDef;
import swim.kernel.HostDef;
import swim.kernel.LaneDef;
import swim.kernel.LogDef;
import swim.kernel.MeshDef;
import swim.kernel.NodeDef;
import swim.kernel.PartDef;
import swim.kernel.PlaneDef;
import swim.kernel.PolicyDef;
import swim.kernel.RootDef;
import swim.kernel.SpaceDef;
import swim.kernel.StageDef;
import swim.kernel.StoreDef;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriMapper;
import swim.util.Murmur3;

public class FabricDef implements SpaceDef, RootDef, Debug {
  final String spaceName;
  final HashTrieMap<String, PlaneDef> planeDefs;
  final HashTrieMap<String, AgentRouteDef> agentRouteDefs;
  final HashTrieMap<String, AuthenticatorDef> authenticatorDefs;
  final HashTrieMap<Uri, MeshDef> meshDefs;
  final HashTrieMap<Value, PartDef> partDefs;
  final UriMapper<HostDef> hostDefs;
  final UriMapper<NodeDef> nodeDefs;
  final UriMapper<LaneDef> laneDefs;
  final LogDef logDef;
  final PolicyDef policyDef;
  final StageDef stageDef;
  final StoreDef storeDef;

  public FabricDef(String spaceName, HashTrieMap<String, PlaneDef> planeDefs,
                   HashTrieMap<String, AgentRouteDef> agentRouteDefs,
                   HashTrieMap<String, AuthenticatorDef> authenticatorDefs,
                   HashTrieMap<Uri, MeshDef> meshDefs, HashTrieMap<Value, PartDef> partDefs,
                   UriMapper<HostDef> hostDefs, UriMapper<NodeDef> nodeDefs,
                   UriMapper<LaneDef> laneDefs, LogDef logDef, PolicyDef policyDef,
                   StageDef stageDef, StoreDef storeDef) {
    this.spaceName = spaceName;
    this.planeDefs = planeDefs;
    this.agentRouteDefs = agentRouteDefs;
    this.authenticatorDefs = authenticatorDefs;
    this.meshDefs = meshDefs;
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
  public final String spaceName() {
    return this.spaceName;
  }

  public FabricDef spaceName(String spaceName) {
    return copy(spaceName, this.planeDefs, this.agentRouteDefs, this.authenticatorDefs,
                this.meshDefs, this.partDefs, this.hostDefs, this.nodeDefs, this.laneDefs,
                this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final Collection<? extends PlaneDef> planeDefs() {
    return this.planeDefs.values();
  }

  @Override
  public final PlaneDef getPlaneDef(String planeName) {
    return this.planeDefs.get(planeName);
  }

  public FabricDef planeDef(PlaneDef planeDef) {
    return copy(this.spaceName, this.planeDefs.updated(planeDef.planeName(), planeDef),
                this.agentRouteDefs, this.authenticatorDefs, this.meshDefs,
                this.partDefs, this.hostDefs, this.nodeDefs, this.laneDefs,
                this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  public final Collection<? extends AgentRouteDef> agentRouteDefs() {
    return this.agentRouteDefs.values();
  }

  public final AgentRouteDef getAgentRouteDef(String routeName) {
    return this.agentRouteDefs.get(routeName);
  }

  public FabricDef agentRouteDef(AgentRouteDef agentRouteDef) {
    return copy(this.spaceName, this.planeDefs, this.agentRouteDefs.updated(agentRouteDef.routeName(), agentRouteDef),
                this.authenticatorDefs, this.meshDefs, this.partDefs, this.hostDefs, this.nodeDefs, this.laneDefs,
                this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  public final Collection<? extends AuthenticatorDef> authenticatorDefs() {
    return this.authenticatorDefs.values();
  }

  public final AuthenticatorDef getAuthenticatorDef(String authenticatorDef) {
    return this.authenticatorDefs.get(authenticatorDef);
  }

  public FabricDef authenticatorDef(AuthenticatorDef authenticatorDef) {
    return copy(this.spaceName, this.planeDefs, this.agentRouteDefs,
                this.authenticatorDefs.updated(authenticatorDef.authenticatorName(), authenticatorDef),
                this.meshDefs, this.partDefs, this.hostDefs, this.nodeDefs, this.laneDefs,
                this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final Collection<? extends MeshDef> meshDefs() {
    return this.meshDefs.values();
  }

  @Override
  public final MeshDef getMeshDef(Uri meshUri) {
    return this.meshDefs.get(meshUri);
  }

  public FabricDef meshDef(MeshDef meshDef) {
    return copy(this.spaceName, this.planeDefs, this.agentRouteDefs, this.authenticatorDefs,
                this.meshDefs.updated(meshDef.meshUri(), meshDef), this.partDefs, this.hostDefs,
                this.nodeDefs, this.laneDefs, this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final Collection<? extends PartDef> partDefs() {
    return this.partDefs.values();
  }

  @Override
  public final PartDef getPartDef(Value partKey) {
    return this.partDefs.get(partKey);
  }

  public FabricDef partDef(PartDef partDef) {
    return copy(this.spaceName, this.planeDefs, this.agentRouteDefs, this.authenticatorDefs,
                this.meshDefs, this.partDefs.updated(partDef.partKey(), partDef), this.hostDefs,
                this.nodeDefs, this.laneDefs, this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final Collection<? extends HostDef> hostDefs() {
    return this.hostDefs.values();
  }

  @Override
  public final HostDef getHostDef(Uri hostUri) {
    return this.hostDefs.get(hostUri);
  }

  public FabricDef hostDef(HostDef hostDef) {
    return copy(this.spaceName, this.planeDefs, this.agentRouteDefs, this.authenticatorDefs,
                this.meshDefs, this.partDefs, this.hostDefs.updated(hostDef.hostPattern(), hostDef),
                this.nodeDefs, this.laneDefs, this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final Collection<? extends NodeDef> nodeDefs() {
    return this.nodeDefs.values();
  }

  @Override
  public final NodeDef getNodeDef(Uri nodeUri) {
    return this.nodeDefs.get(nodeUri);
  }

  public FabricDef nodeDef(NodeDef nodeDef) {
    return copy(this.spaceName, this.planeDefs, this.agentRouteDefs, this.authenticatorDefs,
                this.meshDefs, this.partDefs, this.hostDefs,
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

  public FabricDef laneDef(LaneDef laneDef) {
    return copy(this.spaceName, this.planeDefs, this.agentRouteDefs, this.authenticatorDefs,
                this.meshDefs, this.partDefs, this.hostDefs, this.nodeDefs,
                this.laneDefs.updated(laneDef.lanePattern(), laneDef),
                this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final LogDef logDef() {
    return this.logDef;
  }

  public FabricDef logDef(LogDef logDef) {
    return copy(this.spaceName, this.planeDefs, this.agentRouteDefs, this.authenticatorDefs,
                this.meshDefs, this.partDefs, this.hostDefs, this.nodeDefs, this.laneDefs,
                logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final PolicyDef policyDef() {
    return this.policyDef;
  }

  public FabricDef policyDef(PolicyDef policyDef) {
    return copy(this.spaceName, this.planeDefs, this.agentRouteDefs, this.authenticatorDefs,
                this.meshDefs, this.partDefs, this.hostDefs, this.nodeDefs, this.laneDefs,
                this.logDef, policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final StageDef stageDef() {
    return this.stageDef;
  }

  public FabricDef stageDef(StageDef stageDef) {
    return copy(this.spaceName, this.planeDefs, this.agentRouteDefs, this.authenticatorDefs,
                this.meshDefs, this.partDefs, this.hostDefs, this.nodeDefs, this.laneDefs,
                this.logDef, this.policyDef, stageDef, this.storeDef);
  }

  @Override
  public final StoreDef storeDef() {
    return this.storeDef;
  }

  public FabricDef storeDef(StoreDef storeDef) {
    return copy(this.spaceName, this.planeDefs, this.agentRouteDefs, this.authenticatorDefs,
                this.meshDefs, this.partDefs, this.hostDefs, this.nodeDefs, this.laneDefs,
                this.logDef, this.policyDef, this.stageDef, storeDef);
  }

  protected FabricDef copy(String spaceName, HashTrieMap<String, PlaneDef> planeDefs,
                           HashTrieMap<String, AgentRouteDef> agentRouteDefs,
                           HashTrieMap<String, AuthenticatorDef> authenticatorDefs,
                           HashTrieMap<Uri, MeshDef> meshDefs, HashTrieMap<Value, PartDef> partDefs,
                           UriMapper<HostDef> hostDefs, UriMapper<NodeDef> nodeDefs,
                           UriMapper<LaneDef> laneDefs, LogDef logDef, PolicyDef policyDef,
                           StageDef stageDef, StoreDef storeDef) {
    return new FabricDef(spaceName, planeDefs, agentRouteDefs, authenticatorDefs,
                         meshDefs, partDefs, hostDefs, nodeDefs, laneDefs,
                         logDef, policyDef, stageDef, storeDef);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof FabricDef) {
      final FabricDef that = (FabricDef) other;
      return (this.spaceName == null ? that.spaceName == null : this.spaceName.equals(that.spaceName))
          && this.planeDefs.equals(that.planeDefs)
          && this.agentRouteDefs.equals(that.agentRouteDefs)
          && this.authenticatorDefs.equals(that.authenticatorDefs)
          && this.meshDefs.equals(that.meshDefs)
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

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(FabricDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.spaceName)), this.planeDefs.hashCode()), this.agentRouteDefs.hashCode()),
        this.authenticatorDefs.hashCode()), this.meshDefs.hashCode()), this.partDefs.hashCode()),
        this.hostDefs.hashCode()), this.nodeDefs.hashCode()), this.laneDefs.hashCode()),
        Murmur3.hash(this.logDef)), Murmur3.hash(this.policyDef)), Murmur3.hash(this.stageDef)),
        Murmur3.hash(this.storeDef)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("FabricDef").write('.').write("fromName").write('(')
        .debug(this.spaceName).write(')');
    for (PlaneDef planeDef : this.planeDefs.values()) {
      output = output.write('.').write("planeDef").write('(').debug(planeDef).write(')');
    }
    for (AgentRouteDef agentRouteDef : this.agentRouteDefs.values()) {
      output = output.write('.').write("agentRouteDef").write('(').debug(agentRouteDef).write(')');
    }
    for (AuthenticatorDef authenticatorDef : this.authenticatorDefs.values()) {
      output = output.write('.').write("authenticatorDef").write('(').debug(authenticatorDef).write(')');
    }
    for (MeshDef meshDef : this.meshDefs.values()) {
      output = output.write('.').write("meshDef").write('(').debug(meshDef).write(')');
    }
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
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static FabricDef fromName(String spaceName) {
    return new FabricDef(spaceName, HashTrieMap.empty(), HashTrieMap.empty(),
                         HashTrieMap.empty(), HashTrieMap.empty(), HashTrieMap.empty(),
                         UriMapper.empty(), UriMapper.empty(), UriMapper.empty(),
                         null, null, null, null);
  }

  public static FabricDef fromPlaneDef(PlaneDef planeDef) {
    return new FabricDef(planeDef.planeName(), HashTrieMap.of(planeDef.planeName(), planeDef),
                         HashTrieMap.empty(), HashTrieMap.empty(), HashTrieMap.empty(),
                         HashTrieMap.empty(), UriMapper.empty(), UriMapper.empty(),
                         UriMapper.empty(), null, null, null, null);
  }
}
