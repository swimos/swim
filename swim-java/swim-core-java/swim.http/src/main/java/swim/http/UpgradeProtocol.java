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

package swim.http;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.Writer;
import swim.util.Murmur3;

public final class UpgradeProtocol extends HttpPart implements Debug {
  final String name;
  final String version;

  UpgradeProtocol(String name, String version) {
    this.name = name;
    this.version = version;
  }

  public String name() {
    return this.name;
  }

  public String version() {
    return this.version;
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.upgradeProtocolWriter(this.name, this.version);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeUpgradeProtocol(this.name, this.version, output);
  }

  public boolean matches(UpgradeProtocol that) {
    if (this == that) {
      return true;
    } else {
      return this.name.equalsIgnoreCase(that.name) && this.version.equals(that.version);
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UpgradeProtocol) {
      final UpgradeProtocol that = (UpgradeProtocol) other;
      return this.name.equals(that.name) && this.version.equals(that.version);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(UpgradeProtocol.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.name.hashCode()), this.version.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("UpgradeProtocol").write('.').write("from").write('(').debug(this.name);
    if (!this.version.isEmpty()) {
      output = output.write(", ").debug(this.version);
    }
    output = output.write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static UpgradeProtocol websocket;

  public static UpgradeProtocol websocket() {
    if (websocket == null) {
      websocket = new UpgradeProtocol("websocket", "");
    }
    return websocket;
  }

  public static UpgradeProtocol from(String name, String version) {
    if ("".equals(version)) {
      return from(name);
    } else {
      return new UpgradeProtocol(name, version);
    }
  }

  public static UpgradeProtocol from(String name) {
    if ("websocket".equals(name)) {
      return websocket();
    } else {
      return new UpgradeProtocol(name, "");
    }
  }

  public static UpgradeProtocol parse(String string) {
    return Http.standardParser().parseUpgradeProtocolString(string);
  }
}
