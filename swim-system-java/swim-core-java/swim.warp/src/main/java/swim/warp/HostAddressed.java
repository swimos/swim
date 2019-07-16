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

public abstract class HostAddressed extends Envelope {
  final Value body;

  HostAddressed(Value body) {
    this.body = body.commit();
  }

  @Override
  public Uri nodeUri() {
    return Uri.empty();
  }

  @Override
  public Uri laneUri() {
    return Uri.empty();
  }

  @Override
  public Value body() {
    return this.body;
  }

  @Override
  public HostAddressed nodeUri(Uri nodeUri) {
    throw new UnsupportedOperationException();
  }

  @Override
  public HostAddressed laneUri(Uri laneUri) {
    throw new UnsupportedOperationException();
  }

  @Override
  public abstract HostAddressed body(Value body);

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other != null && getClass() == other.getClass()) {
      final HostAddressed that = (HostAddressed) other;
      return this.body.equals(that.body);
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.seed(getClass()), this.body.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write(getClass().getSimpleName()).write('(');
    if (this.body.isDefined()) {
      output = output.debug(this.body);
    }
    output = output.write(')');
  }
}
