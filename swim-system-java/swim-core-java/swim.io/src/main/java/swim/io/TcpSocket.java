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
import java.net.ConnectException;
import java.net.InetSocketAddress;
import java.nio.Buffer;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.Collections;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import swim.codec.Binary;
import swim.codec.InputBuffer;
import swim.codec.OutputBuffer;
import swim.concurrent.Conts;

class TcpSocket implements Transport, IpSocketContext {
  final InetSocketAddress localAddress;
  final InetSocketAddress remoteAddress;
  final ByteBuffer readBuffer;
  final ByteBuffer writeBuffer;
  final InputBuffer inputBuffer;
  final OutputBuffer<?> outputBuffer;
  final SocketChannel channel;
  final IpSettings ipSettings;
  TransportContext context;
  volatile IpSocket socket;
  volatile int status;

  TcpSocket(InetSocketAddress localAddress, InetSocketAddress remoteAddress,
            SocketChannel channel, IpSettings ipSettings, boolean isClient) {
    this.localAddress = localAddress;
    this.remoteAddress = remoteAddress;
    this.channel = channel;
    this.ipSettings = ipSettings;
    this.status = isClient ? CLIENT : SERVER;
    final TcpSettings tcpSettings = ipSettings.tcpSettings();
    this.readBuffer = ByteBuffer.allocate(tcpSettings.readBufferSize());
    this.writeBuffer = ByteBuffer.allocate(tcpSettings.writeBufferSize());
    ((Buffer) this.writeBuffer).position(this.writeBuffer.capacity());
    this.inputBuffer = Binary.inputBuffer(this.readBuffer);
    this.outputBuffer = Binary.outputBuffer(this.writeBuffer);
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
  public SocketChannel channel() {
    return this.channel;
  }

  @Override
  public ByteBuffer readBuffer() {
    return this.readBuffer;
  }

  @Override
  public ByteBuffer writeBuffer() {
    return this.writeBuffer;
  }

  @Override
  public long idleTimeout() {
    return this.socket.idleTimeout();
  }

  @Override
  public IpSettings ipSettings() {
    return this.ipSettings;
  }

  @Override
  public InputBuffer inputBuffer() {
    return this.inputBuffer;
  }

  @Override
  public OutputBuffer<?> outputBuffer() {
    return this.outputBuffer;
  }

  @Override
  public boolean isConnected() {
    return (STATUS.get(this) & CONNECTED) != 0;
  }

  @Override
  public boolean isClient() {
    return (STATUS.get(this) & CLIENT) != 0;
  }

  @Override
  public boolean isServer() {
    return (STATUS.get(this) & SERVER) != 0;
  }

  @Override
  public boolean isSecure() {
    return false;
  }

  @Override
  public String securityProtocol() {
    return null;
  }

  @Override
  public String cipherSuite() {
    return null;
  }

  @Override
  public InetSocketAddress localAddress() {
    return this.localAddress;
  }

  @Override
  public Principal localPrincipal() {
    return null;
  }

  @Override
  public Collection<Certificate> localCertificates() {
    return Collections.emptyList();
  }

  @Override
  public InetSocketAddress remoteAddress() {
    return this.remoteAddress;
  }

  @Override
  public Principal remotePrincipal() {
    return null;
  }

  @Override
  public Collection<Certificate> remoteCertificates() {
    return Collections.emptyList();
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
  public void become(IpSocket newSocket) {
    final IpSocket oldSocket = this.socket;
    if (oldSocket != null) {
      oldSocket.willBecome(newSocket);
    }

    final int status = STATUS.get(this);
    newSocket.setIpSocketContext(this);
    this.socket = newSocket;
    if ((status & CONNECTED) != 0) {
      newSocket.didConnect();
    } else if ((status & CONNECTING) != 0) {
      newSocket.willConnect();
    }

    if (oldSocket != null) {
      oldSocket.didBecome(newSocket);
    }
  }

  @Override
  public void close() {
    this.context.close();
  }

  @Override
  public void doAccept() throws IOException {
    throw new UnsupportedOperationException();
  }

  @Override
  public void doConnect() throws IOException {
    try {
      this.channel.finishConnect();
      didConnect();
    } catch (ConnectException error) {
      didClose();
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        didFail(error);
      } else {
        throw error;
      }
    }
  }

  @Override
  public void doRead() {
    this.socket.doRead();
  }

  @Override
  public void doWrite() {
    this.socket.doWrite();
  }

  @Override
  public void didWrite() {
    this.socket.didWrite();
  }

  void willConnect() {
    do {
      final int oldStatus = STATUS.get(this);
      if ((status & CONNECTING) == 0) {
        final int newStatus = oldStatus | CONNECTING;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.socket.willConnect();
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  void didConnect() {
    do {
      final int oldStatus = STATUS.get(this);
      if ((oldStatus & (CONNECTING | CONNECTED)) != CONNECTED) {
        final int newStatus = oldStatus & ~CONNECTING | CONNECTED;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.socket.didConnect();
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  @Override
  public void didClose() {
    do {
      final int oldStatus = STATUS.get(this);
      if ((status & (CONNECTING | CONNECTED)) != 0) {
        final int newStatus = oldStatus & ~(CONNECTING | CONNECTED);
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.socket.didDisconnect();
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  @Override
  public void didTimeout() {
    this.socket.didTimeout();
  }

  @Override
  public void didFail(Throwable error) {
    if (!(error instanceof IOException)) {
      this.socket.didFail(error);
    }
    close();
  }

  static final int CLIENT = 1 << 0;
  static final int SERVER = 1 << 1;
  static final int CONNECTING = 1 << 2;
  static final int CONNECTED = 1 << 3;

  static final AtomicIntegerFieldUpdater<TcpSocket> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(TcpSocket.class, "status");
}
