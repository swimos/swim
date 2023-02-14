// Copyright 2015-2022 Swim.inc
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

import java.net.InetSocketAddress;
import javax.net.ssl.SSLSession;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Network connection context.
 */
@Public
@Since("5.0")
public interface ConnectionContext {

  /**
   * Returns {@code true} if the network channel represents an outbound
   * client connection.
   */
  boolean isClient();

  /**
   * Returns {@code true} if the network channel represents an inbound
   * server connection.
   */
  boolean isServer();

  /**
   * Returns {@code true} if the network channel is currently connected.
   */
  boolean isOpen();

  /**
   * Returns the IP address and port of the local endpoint of the network
   * connection; returns {@code null} if the network channel is not currently
   * connected.
   */
  @Nullable InetSocketAddress localAddress();

  /**
   * Returns the IP address and port of the remote endpoint of the network
   * connection; returns {@code null} if the network channel is not currently
   * connected.
   */
  @Nullable InetSocketAddress remoteAddress();

  /**
   * Returns the SSL session used to secure the network connection.
   * Returns {@code null} if the network channel is not currently connected,
   * or if the network connection is not secure.
   */
  @Nullable SSLSession sslSession();

}
