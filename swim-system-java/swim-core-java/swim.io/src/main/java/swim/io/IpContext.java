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

package swim.io;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;

/**
 * IP network connection context.
 */
public interface IpContext {
  /**
   * Returns {@code true} if the underlying network channel is currently
   * connected.
   */
  boolean isConnected();

  /**
   * Returns {@code true} if the underlying network channel initiated an
   * outgoing connection.
   */
  boolean isClient();

  /**
   * Returns {@code true} if the underlying network channel accepted an
   * incoming connection.
   */
  boolean isServer();

  /**
   * Returns {@code true} if the underlying network transport is encrypted.
   */
  boolean isSecure();

  /**
   * Returns the name of the transport-layer security protocol used by the
   * underlying network connection.  Returns {@code null} if the underlying
   * network channel is not currently connected, or if the underlying network
   * connection is not secure.
   */
  String securityProtocol();

  /**
   * Returns the cryptographic cipher suite used by the underlying network
   * connection.  Returns {@code null} if the underlying network channel is not
   * currently connected, or if the underlying network connection is not secure.
   */
  String cipherSuite();

  /**
   * Returns the IP address and port of the local endpoint of the underlying
   * network connection.  Returns {@code null} if the underlying network
   * channel is not  currently connected.
   */
  InetSocketAddress localAddress();

  /**
   * Returns the authenticated identity of the local endpoint of the
   * underlying network connection.  Returns {@code null} if the underlying
   * network channel is not currently connected, or if the underlying network
   * connection is not authenticated.
   */
  Principal localPrincipal();

  /**
   * Returns the certificate chain used to authenticate the local endpoint of
   * the underlying network connection.  Returns {@code null} if the underlying
   * network channel is not currently connected, or if the underlying network
   * connection is not authenticated.
   */
  Collection<Certificate> localCertificates();

  /**
   * Returns the IP address and port of the remote endpoint of the underlying
   * network connection.  Returns {@code null} if the underlying network
   * channel is not currently connected.
   */
  InetSocketAddress remoteAddress();

  /**
   * Returns the authenticated identity of the remote endpoint of the
   * underlying network connection.  Returns {@code null} if the underlying
   * network channel is not currently connected, or if the underlying network
   * connection is not authenticated.
   */
  Principal remotePrincipal();

  /**
   * Returns the certificate chain used to authenticate the remote endpoint of
   * the underlying network connection.  Returns {@code null} if the underlying
   * network channel is not currently connected, or if the underlying network
   * connection is not authenticated.
   */
  Collection<Certificate> remoteCertificates();
}
