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

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.concurrent.StageDef;
import swim.runtime.LaneDef;
import swim.runtime.LogDef;
import swim.runtime.PolicyDef;
import swim.store.StoreDef;
import swim.uri.Uri;
import swim.uri.UriPattern;
import swim.util.Murmur3;

public class ActorLaneDef implements LaneDef, Debug {
  final UriPattern lanePattern;
  final String laneType;
  final LogDef logDef;
  final PolicyDef policyDef;
  final StageDef stageDef;
  final StoreDef storeDef;

  public ActorLaneDef(UriPattern lanePattern, String laneType, LogDef logDef,
                      PolicyDef policyDef, StageDef stageDef, StoreDef storeDef) {
    this.lanePattern = lanePattern;
    this.laneType = laneType;
    this.logDef = logDef;
    this.policyDef = policyDef;
    this.stageDef = stageDef;
    this.storeDef = storeDef;
  }

  @Override
  public final Uri laneUri() {
    return this.lanePattern.isUri() ? this.lanePattern.toUri() : null;
  }

  @Override
  public final UriPattern lanePattern() {
    return this.lanePattern;
  }

  public ActorLaneDef lanePattern(UriPattern lanePattern) {
    return copy(lanePattern, this.laneType, this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final String laneType() {
    return this.laneType;
  }

  public ActorLaneDef laneType(String laneType) {
    return copy(this.lanePattern, laneType, this.logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final LogDef logDef() {
    return this.logDef;
  }

  public ActorLaneDef logDef(LogDef logDef) {
    return copy(this.lanePattern, this.laneType, logDef, this.policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final PolicyDef policyDef() {
    return this.policyDef;
  }

  public ActorLaneDef policyDef(PolicyDef policyDef) {
    return copy(this.lanePattern, this.laneType, this.logDef, policyDef, this.stageDef, this.storeDef);
  }

  @Override
  public final StageDef stageDef() {
    return this.stageDef;
  }

  public ActorLaneDef stageDef(StageDef stageDef) {
    return copy(this.lanePattern, this.laneType, this.logDef, this.policyDef, stageDef, this.storeDef);
  }

  @Override
  public final StoreDef storeDef() {
    return this.storeDef;
  }

  public ActorLaneDef storeDef(StoreDef storeDef) {
    return copy(this.lanePattern, this.laneType, this.logDef, this.policyDef, this.stageDef, storeDef);
  }

  protected ActorLaneDef copy(UriPattern lanePattern, String laneType, LogDef logDef,
                               PolicyDef policyDef, StageDef stageDef, StoreDef storeDef) {
    return new ActorLaneDef(lanePattern, laneType, logDef, policyDef, stageDef, storeDef);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ActorLaneDef) {
      final ActorLaneDef that = (ActorLaneDef) other;
      return this.lanePattern.equals(that.lanePattern)
          && (this.laneType == null ? that.laneType == null : this.laneType.equals(that.laneType))
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
      hashSeed = Murmur3.seed(ActorLaneDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(hashSeed, this.lanePattern.hashCode()), Murmur3.hash(this.laneType)),
        Murmur3.hash(this.logDef)), Murmur3.hash(this.policyDef)),
        Murmur3.hash(this.stageDef)), Murmur3.hash(this.storeDef)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("ActorLaneDef").write('.');
    if (this.lanePattern.isUri()) {
      output = output.write("fromLaneUri").write('(').debug(this.lanePattern.toUri()).write(')');
    } else {
      output = output.write("fromLanePattern").write('(').debug(this.lanePattern).write(')');
    }
    if (this.laneType != null) {
      output = output.write('.').write("laneType").write('(').debug(this.laneType).write(')');
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

  public static ActorLaneDef fromLaneUri(Uri laneUri) {
    return new ActorLaneDef(UriPattern.from(laneUri), null, null, null, null, null);
  }

  public static ActorLaneDef fromLaneUri(String laneUri) {
    return fromLaneUri(Uri.parse(laneUri));
  }

  public static ActorLaneDef fromLanePattern(UriPattern lanePattern) {
    return new ActorLaneDef(lanePattern, null, null, null, null, null);
  }

  public static ActorLaneDef fromLanePattern(String lanePattern) {
    return fromLanePattern(UriPattern.parse(lanePattern));
  }
}
