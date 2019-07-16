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

class TcpService implements Transport, IpServiceContext {
  final Station station;
  final InetSocketAddress localAddress;
  final ServerSocketChannel serverChannel;
  final IpService service;
  final IpSettings ipSettings;
  TransportContext context;

  TcpService(Station station, InetSocketAddress localAddress,
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

    final IpSocket socket = this.service.createSocket();
    final InetSocketAddress remoteAddress = (InetSocketAddress) channel.socket().getRemoteSocketAddress();
    final TcpSocket transport = new TcpSocket(this.localAddress, remoteAddress, channel, this.ipSettings, false);
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
