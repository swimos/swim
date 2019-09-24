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
import swim.runtime.PolicyDef;
import swim.store.StoreDef;
import swim.uri.Uri;
import swim.uri.UriMapper;
import swim.uri.UriPattern;
import swim.util.Murmur3;

public class ActorHostDef implements HostDef, Debug {
  final UriPattern hostPattern;
  final boolean isPrimary;
  final boolean isReplica;
  final UriMapper<NodeDef> nodeDefs;
  final UriMapper<LaneDef> laneDefs;
  final LogDef logDef;
  final PolicyDef policyDef;
  final StageDef stageDef;
  final StoreDef storeDef;

  public ActorHostDef(UriPattern hostPattern, boolean isPrimary, boolean isReplica,
                      UriMapper<NodeDef> nodeDefs, UriMapper<LaneDef> laneDefs,
                      LogDef logDef, PolicyDef policyDef, StageDef stageDef,
                      StoreDef storeDef) {
    this.hostPattern = hostPattern;
    this.isPrimary = isPrimary;
    this.isReplica = isReplica;
    this.nodeDefs = nodeDefs;
    this.laneDefs = laneDefs;
    this.logDef = logDef;
    this.policyDef = policyDef;
    this.stageDef = stageDef;
    this.storeDef = storeDef;
  }

  @Override
  public final Uri hostUri() {
    return this.hostPattern.isUri() ? this.hostPattern.toUri() : null;
  }

  @Override
  public final UriPattern hostPattern() {
    return this.hostPattern;
  }

  public ActorHostDef hostPattern(UriPattern hostPattern) {
    return copy(hostPattern, this.isPrimary, this.isReplica, this.nodeDefs, this.laneDefs,
                this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final boolean isPrimary() {
    return this.isPrimary;
  }

  public ActorHostDef isPrimary(boolean isPrimary) {
    return copy(this.hostPattern, isPrimary, this.isReplica, this.nodeDefs, this.laneDefs,
                this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final boolean isReplica() {
    return this.isReplica;
  }

  public ActorHostDef isReplica(boolean isReplica) {
    return copy(this.hostPattern, this.isPrimary, isReplica, this.nodeDefs, this.laneDefs,
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

  public ActorHostDef nodeDef(NodeDef nodeDef) {
    return copy(this.hostPattern, this.isPrimary, this.isReplica,
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

  public ActorHostDef laneDef(LaneDef laneDef) {
    return copy(this.hostPattern, this.isPrimary, this.isReplica,
                this.nodeDefs, this.laneDefs.updated(laneDef.lanePattern(), laneDef),
                this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final LogDef logDef() {
    return this.logDef;
  }

  public ActorHostDef logDef(LogDef logDef) {
    return copy(this.hostPattern, this.isPrimary, this.isReplica, this.nodeDefs, this.laneDefs,
                logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final PolicyDef policyDef() {
    return this.policyDef;
  }

  public ActorHostDef policyDef(PolicyDef policyDef) {
    return copy(this.hostPattern, this.isPrimary, this.isReplica, this.nodeDefs, this.laneDefs,
                this.logDef, policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final StageDef stageDef() {
    return this.stageDef;
  }

  public ActorHostDef stageDef(StageDef stageDef) {
    return copy(this.hostPattern, this.isPrimary, this.isReplica, this.nodeDefs, this.laneDefs,
                this.logDef, this.policyDef, stageDef, this.storeDef);
  }

  @Override
  public final StoreDef storeDef() {
    return this.storeDef;
  }

  public ActorHostDef storeDef(StoreDef storeDef) {
    return copy(this.hostPattern, this.isPrimary, this.isReplica, this.nodeDefs, this.laneDefs,
                this.logDef, this.policyDef, this.stageDef, storeDef);
  }

  protected ActorHostDef copy(UriPattern hostPattern, boolean isPrimary, boolean isReplica,
                              UriMapper<NodeDef> nodeDefs, UriMapper<LaneDef> laneDefs,
                              LogDef logDef, PolicyDef policyDef, StageDef stageDef,
                              StoreDef storeDef) {
    return new ActorHostDef(hostPattern, isPrimary, isReplica, nodeDefs, laneDefs,
                            logDef, policyDef, stageDef, storeDef);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ActorHostDef) {
      final ActorHostDef that = (ActorHostDef) other;
      return this.hostPattern.equals(that.hostPattern)
          && this.isPrimary == that.isPrimary
          && this.isReplica == that.isReplica
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
      hashSeed = Murmur3.seed(ActorHostDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed, this.hostPattern.hashCode()),
        Murmur3.hash(this.isPrimary)), Murmur3.hash(this.isReplica)), this.nodeDefs.hashCode()),
        this.laneDefs.hashCode()), Murmur3.hash(this.logDef)), Murmur3.hash(this.policyDef)),
        Murmur3.hash(this.stageDef)), Murmur3.hash(this.storeDef)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("ActorHostDef").write('.');
    if (this.hostPattern.isUri()) {
      output = output.write("fromHostUri").write('(').debug(this.hostPattern.toUri()).write(')');
    } else {
      output = output.write("fromHostPattern").write('(').debug(this.hostPattern).write(')');
    }
    if (this.isPrimary) {
      output = output.write('.').write("isPrimary").write('(').debug(this.isPrimary).write(')');
    }
    if (this.isReplica) {
      output = output.write('.').write("isReplica").write('(').debug(this.isReplica).write(')');
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

  public static ActorHostDef fromHostUri(Uri hostUri) {
    return new ActorHostDef(UriPattern.from(hostUri), false, false, UriMapper.empty(),
                            UriMapper.empty(), null, null, null, null);
  }

  public static ActorHostDef fromHostUri(String hostUri) {
    return fromHostUri(Uri.parse(hostUri));
  }

  public static ActorHostDef fromHostPattern(UriPattern hostPattern) {
    return new ActorHostDef(hostPattern, false, false, UriMapper.empty(),
                            UriMapper.empty(), null, null, null, null);
  }

  public static ActorHostDef fromHostPattern(String hostPattern) {
    return fromHostPattern(UriPattern.parse(hostPattern));
  }
}
