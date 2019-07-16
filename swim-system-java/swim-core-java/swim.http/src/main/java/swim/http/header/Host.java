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

package swim.http.header;

import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Writer;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.uri.UriAuthority;
import swim.uri.UriHost;
import swim.uri.UriPort;
import swim.util.Murmur3;

public final class Host extends HttpHeader {
  final UriHost host;
  final UriPort port;

  Host(UriHost host, UriPort port) {
    this.host = host;
    this.port = port;
  }

  @Override
  public String lowerCaseName() {
    return "host";
  }

  @Override
  public String name() {
    return "Host";
  }

  public UriHost getHost() {
    return this.host;
  }

  public UriPort port() {
    return this.port;
  }

  public InetSocketAddress inetSocketAddress() throws UnknownHostException {
    return new InetSocketAddress(host.inetAddress(), port.number());
  }

  @Override
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return HostWriter.write(output, this.host, this.port);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Host) {
      final Host that = (Host) other;
      return this.host.equals(that.host) && this.port.equals(that.port);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Host.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.host.hashCode()), this.port.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Host").write('.').write("from").write('(').debug(this.host.toString());
    if (this.port.isDefined()) {
      output = output.write(", ").debug(this.port.number());
    }
    output = output.write(')');
  }

  private static int hashSeed;

  public static Host from(UriHost host, UriPort port) {
    return new Host(host, port);
  }

  public static Host from(UriHost host) {
    return new Host(host, UriPort.undefined());
  }

  public static Host from(UriAuthority authority) {
    return new Host(authority.host(), authority.port());
  }

  public static Host from(String host, int port) {
    return new Host(UriHost.parse(host), UriPort.from(port));
  }

  public static Host from(String host) {
    return new Host(UriHost.parse(host), UriPort.undefined());
  }

  public static Host from(InetSocketAddress address) {
    return new Host(UriHost.inetAddress(address.getAddress()), UriPort.from(address.getPort()));
  }

  public static Parser<Host> parseHttpValue(Input input, HttpParser http) {
    return HostParser.parse(input);
  }
}
