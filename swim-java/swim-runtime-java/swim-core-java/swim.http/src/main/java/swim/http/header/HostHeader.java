// Copyright 2015-2021 Swim Inc.
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

public final class HostHeader extends HttpHeader {

  final UriHost host;
  final UriPort port;

  HostHeader(UriHost host, UriPort port) {
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
    return new InetSocketAddress(this.host.inetAddress(), this.port.number());
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return HostHeaderWriter.write(output, this.host, this.port);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HostHeader) {
      final HostHeader that = (HostHeader) other;
      return this.host.equals(that.host) && this.port.equals(that.port);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HostHeader.hashSeed == 0) {
      HostHeader.hashSeed = Murmur3.seed(HostHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HostHeader.hashSeed,
        this.host.hashCode()), this.port.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HostHeader").write('.').write("create").write('(')
                   .debug(this.host.toString());
    if (this.port.isDefined()) {
      output = output.write(", ").debug(this.port.number());
    }
    output = output.write(')');
    return output;
  }

  public static HostHeader create(UriHost host, UriPort port) {
    return new HostHeader(host, port);
  }

  public static HostHeader create(UriHost host) {
    return new HostHeader(host, UriPort.undefined());
  }

  public static HostHeader create(UriAuthority authority) {
    return new HostHeader(authority.host(), authority.port());
  }

  public static HostHeader create(String host, int port) {
    return new HostHeader(UriHost.parse(host), UriPort.create(port));
  }

  public static HostHeader create(String host) {
    return new HostHeader(UriHost.parse(host), UriPort.undefined());
  }

  public static HostHeader create(InetSocketAddress address) {
    return new HostHeader(UriHost.inetAddress(address.getAddress()),
                          UriPort.create(address.getPort()));
  }

  public static Parser<HostHeader> parseHeaderValue(Input input, HttpParser http) {
    return HostHeaderParser.parse(input);
  }

}
