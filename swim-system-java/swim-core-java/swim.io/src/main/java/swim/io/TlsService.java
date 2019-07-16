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

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.ClosedChannelException;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Collection;
import javax.net.ssl.SSLEngine;

class TlsService implements Transport, IpServiceContext {
  final Station station;
  final InetSocketAddress localAddress;
  final ServerSocketChannel serverChannel;
  final IpService service;
  final IpSettings ipSettings;
  TransportContext context;

  TlsService(Station station, InetSocketAddress localAddress,
             ServerSocketChannel serverChannel, IpService service,
             IpSettings ipSettings) {
    this.station = station;
    this.localAddress = localAddress;
    this.serverChannel = serverChannel;
    this.service = service;
    this.ipSettings = ipSettings;
  }

  @Override
  public TransportContext transportContext() {
    return this.context;
  }

  @Override
  public void setTransportContext(TransportContext context) {
    this.context = context;
  }

  @Override
  public ServerSocketChannel channel() {
    return this.serverChannel;
  }

  @Override
  public ByteBuffer readBuffer() {
    throw new UnsupportedOperationException();
  }

  @Override
  public ByteBuffer writeBuffer() {
    throw new UnsupportedOperationException();
  }

  @Override
  public long idleTimeout() {
    return 0L; // never timeout
  }

  @Override
  public InetSocketAddress localAddress() {
    return this.localAddress;
  }

  @Override
  public IpSettings ipSettings() {
    return this.ipSettings;
  }

  @Override
  public FlowControl flowControl() {
    return this.context.flowControl();
  }

  @Override
  public void flowControl(FlowControl flowControl) {
    this.context.flowControl(flowControl);
  }

  @Override
  public FlowControl flowControl(FlowModifier flowModifier) {
    return this.context.flowControl(flowModifier);
  }

  @Override
  public void unbind() {
    this.context.close();
  }

  @Override
  public void doAccept() throws IOException {
    final SocketChannel channel;
    try {
      channel = this.serverChannel.accept();
    } catch (ClosedChannelException error) {
      return;
    }
    if (channel == null) {
      return;
    }
    channel.configureBlocking(false);
    this.ipSettings.configure(channel.socket());

    final InetSocketAddress remoteAddress = (InetSocketAddress) channel.socket().getRemoteSocketAddress();
    final TlsSettings tlsSettings = this.ipSettings.tlsSettings();
    // Passing host and port to createSSLEngine causes SSLSession reuse problems with TLS 1.3.
    final SSLEngine sslEngine = tlsSettings.sslContext().createSSLEngine(/*remoteAddress.getHostString(), remoteAddress.getPort()*/);
    sslEngine.setUseClientMode(false);
    switch (tlsSettings.clientAuth()) {
      case NEED: sslEngine.setNeedClientAuth(true); break;
      case WANT: sslEngine.setWantClientAuth(true); break;
      case NONE: sslEngine.setWantClientAuth(false); break;
      default:
    }
    final Collection<String> cipherSuites = tlsSettings.cipherSuites();
    if (cipherSuites != null) {
      sslEngine.setEnabledCipherSuites(cipherSuites.toArray(new String[cipherSuites.size()]));
    }
    final Collection<String> protocols = tlsSettings.protocols();
    if (protocols != null) {
      sslEngine.setEnabledProtocols(protocols.toArray(new String[protocols.size()]));
    }

    final IpSocket socket = this.service.createSocket();
    final TlsSocket transport = new TlsSocket(this.localAddress, remoteAddress, channel, sslEngine, this.ipSettings, false);
    transport.become(socket);
    this.station.transport(transport, FlowControl.WAIT);
    this.service.didAccept(socket);
    transport.didConnect();
  }

  @Override
  public void doConnect() throws IOException {
    throw new UnsupportedOperationException();
  }

  @Override
  public void doRead() {
    throw new UnsupportedOperationException();
  }

  @Override
  public void doWrite() {
    throw new UnsupportedOperationException();
  }

  @Override
  public void didWrite() {
    throw new UnsupportedOperationException();
  }

  void didBind() {
    this.service.didBind();
  }

  void didAccept(IpSocket socket) {
    this.service.didAccept(socket);
  }

  void didUnbind() {
    this.service.didUnbind();
  }

  @Override
  public void didTimeout() {
    // stub
  }

  @Override
  public void didClose() {
    didUnbind();
  }

  @Override
  public void didFail(Throwable error) {
    this.service.didFail(error);
  }
}
