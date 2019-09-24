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

package swim.actor;

import java.util.Collection;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.concurrent.StageDef;
import swim.runtime.HostDef;
import swim.runtime.LaneDef;
import swim.runtime.LogDef;
import swim.runtime.NodeDef;
import swim.runtime.PartDef;
import swim.runtime.PartPredicate;
import swim.runtime.PolicyDef;
import swim.store.StoreDef;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriMapper;
import swim.util.Murmur3;

public class ActorPartDef implements PartDef, Debug {
  final Value partKey;
  final PartPredicate predicate;
  final boolean isGateway;
  final UriMapper<HostDef> hostDefs;
  final UriMapper<NodeDef> nodeDefs;
  final UriMapper<LaneDef> laneDefs;
  final LogDef logDef;
  final PolicyDef policyDef;
  final StageDef stageDef;
  final StoreDef storeDef;

  public ActorPartDef(Value partKey, PartPredicate predicate, boolean isGateway,
                      UriMapper<HostDef> hostDefs, UriMapper<NodeDef> nodeDefs,
                      UriMapper<LaneDef> laneDefs, LogDef logDef, PolicyDef policyDef,
                      StageDef stageDef, StoreDef storeDef) {
    this.partKey = partKey;
    this.predicate = predicate;
    this.isGateway = isGateway;
    this.hostDefs = hostDefs;
    this.nodeDefs = nodeDefs;
    this.laneDefs = laneDefs;
    this.logDef = logDef;
    this.policyDef = policyDef;
    this.stageDef = stageDef;
    this.storeDef = storeDef;
  }

  @Override
  public final Value partKey() {
    return this.partKey;
  }

  public ActorPartDef partKey(Value partKey) {
    return copy(partKey, this.predicate, this.isGateway, this.hostDefs, this.nodeDefs,
                this.laneDefs, this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final PartPredicate predicate() {
    return this.predicate;
  }

  public ActorPartDef predicate(PartPredicate predicate) {
    return copy(this.partKey, predicate, this.isGateway, this.hostDefs, this.nodeDefs,
                this.laneDefs, this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final boolean isGateway() {
    return this.isGateway;
  }

  public ActorPartDef isGateway(boolean isGateway) {
    return copy(this.partKey, this.predicate, isGateway, this.hostDefs, this.nodeDefs,
                this.laneDefs, this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final Collection<? extends HostDef> hostDefs() {
    return this.hostDefs.values();
  }

  @Override
  public final HostDef getHostDef(Uri hostUri) {
    return this.hostDefs.get(hostUri);
  }

  public ActorPartDef hostDef(HostDef hostDef) {
    return copy(this.partKey, this.predicate, this.isGateway,
                this.hostDefs.updated(hostDef.hostPattern(), hostDef), this.nodeDefs,
                this.laneDefs, this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final Collection<? extends NodeDef> nodeDefs() {
    return this.nodeDefs.values();
  }

  @Override
  public final NodeDef getNodeDef(Uri nodeUri) {
    return this.nodeDefs.get(nodeUri);
  }

  public ActorPartDef nodeDef(NodeDef nodeDef) {
    return copy(this.partKey, this.predicate, this.isGateway, this.hostDefs,
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

  public ActorPartDef laneDef(LaneDef laneDef) {
    return copy(this.partKey, this.predicate, this.isGateway, this.hostDefs,
                this.nodeDefs, this.laneDefs.updated(laneDef.lanePattern(), laneDef),
                this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final LogDef logDef() {
    return this.logDef;
  }

  public ActorPartDef logDef(LogDef logDef) {
    return copy(this.partKey, this.predicate, this.isGateway, this.hostDefs, this.nodeDefs,
                this.laneDefs, logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final PolicyDef policyDef() {
    return this.policyDef;
  }

  public ActorPartDef policyDef(PolicyDef policyDef) {
    return copy(this.partKey, this.predicate, this.isGateway, this.hostDefs, this.nodeDefs,
                this.laneDefs, this.logDef, policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final StageDef stageDef() {
    return this.stageDef;
  }

  public ActorPartDef stageDef(StageDef stageDef) {
    return copy(this.partKey, this.predicate, this.isGateway, this.hostDefs, this.nodeDefs,
                this.laneDefs, this.logDef, this.policyDef, stageDef, this.storeDef);
  }

  @Override
  public final StoreDef storeDef() {
    return this.storeDef;
  }

  public ActorPartDef storeDef(StoreDef storeDef) {
    return copy(this.partKey, this.predicate, this.isGateway, this.hostDefs, this.nodeDefs,
                this.laneDefs, this.logDef, this.policyDef, this.stageDef, storeDef);
  }

  protected ActorPartDef copy(Value partKey, PartPredicate predicate, boolean isGateway,
                              UriMapper<HostDef> hostDefs, UriMapper<NodeDef> nodeDefs,
                              UriMapper<LaneDef> laneDefs, LogDef logDef, PolicyDef policyDef,
                              StageDef stageDef, StoreDef storeDef) {
    return new ActorPartDef(partKey, predicate, isGateway, hostDefs, nodeDefs,
                            laneDefs, logDef, policyDef, stageDef, storeDef);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ActorPartDef) {
      final ActorPartDef that = (ActorPartDef) other;
      return this.partKey.equals(that.partKey)
          && this.predicate.equals(that.predicate)
          && this.isGateway == that.isGateway
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
      hashSeed = Murmur3.seed(ActorPartDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed, Murmur3.hash(this.partKey)),
        Murmur3.hash(this.predicate)), Murmur3.hash(this.isGateway)), this.hostDefs.hashCode()),
        this.nodeDefs.hashCode()), this.laneDefs.hashCode()), Murmur3.hash(this.logDef)),
        Murmur3.hash(this.policyDef)), Murmur3.hash(this.stageDef)), Murmur3.hash(this.storeDef)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("ActorPartDef").write('.').write("fromPartPredicate").write('(')
        .debug(this.partKey).write(", ").debug(this.predicate).write(')');
    if (this.isGateway) {
      output = output.write('.').write("isGateway").write('(').debug(this.isGateway).write(')');
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

  public static ActorPartDef fromPartPredicate(Value partKey, PartPredicate predicate) {
    return new ActorPartDef(partKey, predicate, false, UriMapper.empty(),
                            UriMapper.empty(), UriMapper.empty(),
                            null, null, null, null);
  }
}
