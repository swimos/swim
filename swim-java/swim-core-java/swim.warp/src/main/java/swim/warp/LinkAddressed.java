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

package swim.warp;

import swim.codec.Output;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Murmur3;

public abstract class LinkAddressed extends LaneAddressed {
  final float prio;
  final float rate;

  LinkAddressed(Uri nodeUri, Uri laneUri, float prio, float rate, Value body) {
    super(nodeUri, laneUri, body);
    this.prio = prio;
    this.rate = rate;
  }

  public float prio() {
    return this.prio;
  }

  public float rate() {
    return this.rate;
  }

  @Override
  public abstract LinkAddressed nodeUri(Uri nodeUri);

  @Override
  public abstract LinkAddressed laneUri(Uri laneUri);

  @Override
  public abstract LinkAddressed body(Value body);

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other != null && getClass() == other.getClass()) {
      final LinkAddressed that = (LinkAddressed) other;
      return this.nodeUri.equals(that.nodeUri) && this.laneUri.equals(that.laneUri)
          && this.prio == that.prio && this.rate == that.rate
          && this.body.equals(that.body);
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.seed(getClass()), this.nodeUri.hashCode()), this.laneUri.hashCode()),
        Murmur3.hash(this.prio)), Murmur3.hash(this.rate)), this.body.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write(getClass().getSimpleName()).write('(')
        .debug(this.nodeUri).write(", ").debug(this.laneUri);
    if (this.prio != 0f || this.rate != 0f) {
      output = output.write(", ").debug(this.prio).write(", ").debug(this.rate);
    }
    if (this.body.isDefined()) {
      output = output.write(", ").debug(this.body);
    }
    output = output.write(')');
  }
}
