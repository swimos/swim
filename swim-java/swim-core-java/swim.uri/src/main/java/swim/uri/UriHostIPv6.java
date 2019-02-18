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

package swim.uri;

import swim.codec.Output;

final class UriHostIPv6 extends UriHost {
  final String address;
  String string;

  UriHostIPv6(String address) {
    this.address = address;
  }

  @Override
  public String address() {
    return this.address;
  }

  @Override
  public String ipv6() {
    return this.address;
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("UriHost").write('.').write("ipv6").write('(').debug(this.address).write(')');
  }

  @Override
  public void display(Output<?> output) {
    if (this.string != null) {
      output = output.write(this.string);
    } else {
      output = output.write('[');
      Uri.writeHostLiteral(this.address, output);
      output = output.write(']');
    }
  }

  @Override
  public String toString() {
    if (this.string == null) {
      this.string = new StringBuilder(1 + this.address.length() + 1)
          .append('[').append(this.address).append(']').toString();
    }
    return this.string;
  }
}
