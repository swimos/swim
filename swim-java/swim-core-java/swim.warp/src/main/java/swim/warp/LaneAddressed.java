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

public abstract class LaneAddressed extends Envelope {
  final Uri nodeUri;
  final Uri laneUri;
  final Value body;

  LaneAddressed(Uri nodeUri, Uri laneUri, Value body) {
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
    this.body = body.commit();
  }

  @Override
  public Uri nodeUri() {
    return this.nodeUri;
  }

  @Override
  public Uri laneUri() {
    return this.laneUri;
  }

  @Override
  public Value body() {
    return this.body;
  }

  @Override
  public abstract LaneAddressed nodeUri(Uri nodeUri);

  @Override
  public abstract LaneAddressed laneUri(Uri laneUri);

  @Override
  public abstract LaneAddressed body(Value body);

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other != null && getClass() == other.getClass()) {
      final LaneAddressed that = (LaneAddressed) other;
      return this.nodeUri.equals(that.nodeUri) && this.laneUri.equals(that.laneUri)
          && this.body.equals(that.body);
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.seed(getClass()),
        this.nodeUri.hashCode()), this.laneUri.hashCode()), this.body.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write(getClass().getSimpleName()).write('(')
        .debug(this.nodeUri).write(", ").debug(this.laneUri);
    if (this.body.isDefined()) {
      output = output.write(", ").debug(this.body);
    }
    output = output.write(')');
  }
}
