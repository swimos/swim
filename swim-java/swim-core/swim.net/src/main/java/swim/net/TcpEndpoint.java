// Copyright 2015-2023 Nstream, inc.
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

package swim.net;

import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public interface TcpEndpoint {

  TcpOptions tcpOptions();

  NetSocketRef bindTcpSocket(NetSocket socket);

  NetListenerRef bindTcpListener(NetListener listener);

  /**
   * Returns a URI host compatible host:port string representation of the
   * given {@code socketAddress}, without triggering address resolution.
   */
  static String endpointAddress(InetSocketAddress socketAddress) {
    final StringBuilder builder = new StringBuilder();
    final String hostString = socketAddress.getHostString();
    final InetAddress inetAddress = socketAddress.getAddress();
    if (inetAddress instanceof Inet6Address && hostString.equals(inetAddress.getHostAddress())) {
      // Host is an IPv6 literal; enclose it in square brackets.
      builder.append('[').append(hostString).append(']');
    } else {
      // Host is either a hostname or an IPv4 literal.
      builder.append(hostString);
    }
    builder.append(':').append(socketAddress.getPort());
    return builder.toString();
  }

}
