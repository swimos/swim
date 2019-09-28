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
import swim.util.Murmur3;

public final class ServiceAddress extends CellAddress implements Debug {
  final String serviceName;

  public ServiceAddress(String serviceName) {
    this.serviceName = serviceName;
  }

  public String serviceName() {
    return this.serviceName;
  }

  public ServiceAddress serviceName(String serviceName) {
    return copy(serviceName);
  }

  ServiceAddress copy(String serviceName) {
    return new ServiceAddress(serviceName);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ServiceAddress) {
      final ServiceAddress that = (ServiceAddress) other;
      return this.serviceName.equals(that.serviceName);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.hash(ServiceAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.serviceName.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("ServiceAddress").write('.').write("from").write('(')
        .debug(this.serviceName).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static ServiceAddress from(String serviceName) {
    return new ServiceAddress(serviceName);
  }
}
