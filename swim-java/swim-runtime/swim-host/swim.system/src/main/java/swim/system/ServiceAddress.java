// Copyright 2015-2023 Swim.inc
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

package swim.system;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

public final class ServiceAddress implements CellAddress, Debug {

  final String serviceName;

  public ServiceAddress(String serviceName) {
    this.serviceName = serviceName;
  }

  public String serviceName() {
    return this.serviceName;
  }

  public ServiceAddress serviceName(String serviceName) {
    return this.copy(serviceName);
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

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (ServiceAddress.hashSeed == 0) {
      ServiceAddress.hashSeed = Murmur3.hash(ServiceAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(ServiceAddress.hashSeed, this.serviceName.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("ServiceAddress").write('.').write("create").write('(')
                   .debug(this.serviceName).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static ServiceAddress create(String serviceName) {
    return new ServiceAddress(serviceName);
  }

}
