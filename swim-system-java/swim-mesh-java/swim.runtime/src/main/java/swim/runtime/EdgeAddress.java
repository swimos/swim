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

package swim.runtime;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.uri.Uri;
import swim.util.Murmur3;

public final class EdgeAddress extends CellAddress implements Debug {
  final String edgeName;

  public EdgeAddress(String edgeName) {
    this.edgeName = edgeName;
  }

  public String edgeName() {
    return this.edgeName;
  }

  public EdgeAddress edgeName(String edgeName) {
    return copy(edgeName);
  }

  EdgeAddress copy(String edgeName) {
    return new EdgeAddress(edgeName);
  }

  public MeshAddress meshUri(Uri meshUri) {
    return new MeshAddress(this.edgeName, meshUri);
  }

  public MeshAddress meshUri(String meshUri) {
    return meshUri(Uri.parse(meshUri));
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof EdgeAddress) {
      final EdgeAddress that = (EdgeAddress) other;
      return this.edgeName.equals(that.edgeName);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.hash(EdgeAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.edgeName.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("EdgeAddress").write('.').write("from").write('(')
        .debug(this.edgeName).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static EdgeAddress from(String edgeName) {
    return new EdgeAddress(edgeName);
  }
}
