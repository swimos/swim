// Copyright 2015-2021 Swim inc.
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

public final class EdgeAddress implements EdgeAddressed, Debug {

  final String edgeName;

  public EdgeAddress(String edgeName) {
    this.edgeName = edgeName;
  }

  @Override
  public String edgeName() {
    return this.edgeName;
  }

  public EdgeAddress edgeName(String edgeName) {
    return this.copy(edgeName);
  }

  EdgeAddress copy(String edgeName) {
    return new EdgeAddress(edgeName);
  }

  @Override
  public MeshAddress meshUri(Uri meshUri) {
    return new MeshAddress(this.edgeName, meshUri);
  }

  @Override
  public MeshAddress meshUri(String meshUri) {
    return this.meshUri(Uri.parse(meshUri));
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

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (EdgeAddress.hashSeed == 0) {
      EdgeAddress.hashSeed = Murmur3.hash(EdgeAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(EdgeAddress.hashSeed, this.edgeName.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("EdgeAddress").write('.').write("create").write('(')
                   .debug(this.edgeName).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static EdgeAddress create(String edgeName) {
    return new EdgeAddress(edgeName);
  }

}
