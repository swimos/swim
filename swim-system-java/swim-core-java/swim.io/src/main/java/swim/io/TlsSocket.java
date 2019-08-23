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
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import javax.net.ssl.SSLEngine;
import javax.net.ssl.SSLEngineResult;
import javax.net.ssl.SSLException;
import javax.net.ssl.SSLSession;
import swim.codec.Binary;
import swim.codec.InputBuffer;
import swim.codec.OutputBuffer;
import swim.concurrent.Conts;

class TlsSocket implements Transport, IpSocketContext {
  final InetSocketAddress localAddress;
  final InetSocketAddress remoteAddress;
  final ByteBuffer readBuffer;
  final ByteBuffer writeBuffer;
  final ByteBuffer inputBuffer;
  final ByteBuffer outputBuffer;
  final InputBuffer reader;
  final OutputBuffer<?> writer;
  final SocketChannel channel;
  final SSLEngine sslEngine;
  final IpSettings ipSettings;
  TransportContext context;
  volatile IpSocket socket;
  volatile FlowControl flowControl;
  volatile int status;

  TlsSocket(InetSocketAddress localAddress, InetSocketAddress remoteAddress, SocketChannel channel,
            SSLEngine sslEngine, IpSettings ipSettings, boolean isClient) {
    if (sslEngine == null) {
      throw new NullPointerException();
    }
    this.localAddress = localAddress;
    this.remoteAddress = remoteAddress;
    this.channel = channel;
    this.sslEngine = sslEngine;
    this.ipSettings = ipSettings;
    this.flowControl = FlowControl.WAIT;
    this.status = isClient ? CLIENT : SERVER;

    final SSLSession sslSession = this.sslEngine.getSession();
    final TcpSettings tcpSettings = this.ipSettings.tcpSettings();
    final int readBufferSize = Math.max(tcpSettings.readBufferSize(), sslSession.getApplicationBufferSize());
    final int writeBufferSize = Math.max(tcpSettings.writeBufferSize(), sslSession.getPacketBufferSize());
    this.readBuffer = ByteBuffer.allocate(readBufferSize);
    this.writeBuffer = ByteBuffer.allocate(writeBufferSize);
    ((Buffer) this.writeBuffer).position(this.writeBuffer.capacity());
    this.inputBuffer = ByteBuffer.allocate(readBufferSize);
    this.outputBuffer = ByteBuffer.allocate(writeBufferSize);
    ((Buffer) this.outputBuffer).position(this.outputBuffer.capacity());
    this.reader = Binary.inputBuffer(inputBuffer);
    this.writer = Binary.outputBuffer(outputBuffer);
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
    return this.reader;
  }

  @Override
  public OutputBuffer<?> outputBuffer() {
    return this.writer;
  }

  @Override
  public boolean isConnected() {
    return (this.status & CONNECTED) != 0;
  }

  @Override
  public boolean isClient() {
    return (this.status & CLIENT) != 0;
  }

  @Override
  public boolean isServer() {
    return (this.status & SERVER) != 0;
  }

  @Override
  public boolean isSecure() {
    return true;
  }

  @Override
  public String securityProtocol() {
    return this.sslEngine.getSession().getProtocol();
  }

  @Override
  public String cipherSuite() {
    return this.sslEngine.getSession().getCipherSuite();
  }

  @Override
  public InetSocketAddress localAddress() {
    return this.localAddress;
  }

  @Override
  public Principal localPrincipal() {
    return this.sslEngine.getSession().getLocalPrincipal();
  }

  @Override
  public Collection<Certificate> localCertificates() {
    final Certificate[] certificates = this.sslEngine.getSession().getLocalCertificates();
    if (certificates != null) {
      return Arrays.asList(certificates);
    } else {
      return Collections.emptyList();
    }
  }

  @Override
  public InetSocketAddress remoteAddress() {
    return this.remoteAddress;
  }

  @Override
  public Principal remotePrincipal() {
    try {
      return this.sslEngine.getSession().getPeerPrincipal();
    } catch (SSLException error) {
      return null;
    }
  }

  @Override
  public Collection<Certificate> remoteCertificates() {
    try {
      final Certificate[] certificates = this.sslEngine.getSession().getPeerCertificates();
      if (certificates != null) {
        return Arrays.asList(certificates);
      }
    } catch (SSLException error) {
      // ignore
    }
    return Collections.emptyList();
  }

  @Override
  public FlowControl flowControl() {
    return this.flowControl;
  }

  @Override
  public void flowControl(FlowControl flowControl) {
    FLOW_CONTROL.set(this, flowControl);
    if ((this.status & OPEN) != 0) {
      this.context.flowControl(flowControl);
    }
  }

  @Override
  public FlowControl flowControl(FlowModifier flowModifier) {
    FlowControl oldFlow;
    FlowControl newFlow;
    do {
      oldFlow = this.flowControl;
      newFlow = oldFlow.modify(flowModifier);
      if (!oldFlow.equals(newFlow)) {
        if (FLOW_CONTROL.compareAndSet(this, oldFlow, newFlow)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    if ((this.status & OPEN) != 0) {
      return this.context.flowControl(flowModifier);
    } else {
      return newFlow;
    }
  }

  @Override
  public void become(IpSocket newSocket) {
    final IpSocket oldSocket = this.socket;
    if (oldSocket != null) {
      oldSocket.willBecome(newSocket);
    }

    final int status = this.status;
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
    do {
      final int oldStatus = this.status;
      if ((oldStatus & OPEN) != 0) {
        final int newStatus = oldStatus & ~OPEN | CLOSING_OUTBOUND;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.sslEngine.closeOutbound();
          this.context.flowControl(FlowModifier.ENABLE_READ_WRITE);
          break;
        }
      } else {
        this.context.close();
        break;
      }
    } while (true);
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
    read: do {
      final SSLEngineResult result;
      try {
        result = this.sslEngine.unwrap(this.readBuffer, this.inputBuffer);
      } catch (SSLException error) {
        this.socket.didFail(error);
        this.context.close();
        return;
      } catch (Throwable error) {
        if (Conts.isNonFatal(error)) {
          this.socket.didFail(error);
          this.context.close();
          return;
        } else {
          throw error;
        }
      }
      final SSLEngineResult.Status sslStatus = result.getStatus();
      SSLEngineResult.HandshakeStatus handshakeStatus;
      switch (sslStatus) {
        case OK:
          if (this.inputBuffer.position() > 0) {
            ((Buffer) this.inputBuffer).flip();
            this.socket.doRead();
            if (this.inputBuffer.hasRemaining()) {
              this.inputBuffer.compact();
            } else {
              ((Buffer) this.inputBuffer).clear();
            }
          }
          handshakeStatus = result.getHandshakeStatus();
          handshake: do {
            switch (handshakeStatus) {
              case NEED_UNWRAP:
                this.context.flowControl(FlowModifier.ENABLE_READ);
                if (this.readBuffer.hasRemaining()) {
                  continue read;
                } else {
                  break read;
                }
              case NEED_WRAP:
                this.context.flowControl(FlowModifier.ENABLE_READ_WRITE);
                break read;
              case NEED_TASK:
                do {
                  // Spin until task is actually available.
                  final Runnable task = this.sslEngine.getDelegatedTask();
                  if (task != null) {
                    task.run();
                    break;
                  } else {
                    handshakeStatus = this.sslEngine.getHandshakeStatus();
                    if (handshakeStatus != SSLEngineResult.HandshakeStatus.NEED_TASK) {
                      break;
                    }
                  }
                } while (true);
                continue handshake;
              case FINISHED:
                handshakeAcknowledged();
                break read;
              case NOT_HANDSHAKING:
                break read;
              default:
                throw new AssertionError(handshakeStatus); // unreachable
            }
            // unreachable
          } while (true);
          // unreachable
        case CLOSED:
          receivedClose();
          break read;
        case BUFFER_UNDERFLOW:
          handshakeStatus = result.getHandshakeStatus();
          switch (handshakeStatus) {
            case NEED_UNWRAP:
              this.context.flowControl(FlowModifier.ENABLE_READ);
              break read;
            case NEED_WRAP:
              this.context.flowControl(FlowModifier.ENABLE_READ_WRITE);
              break read;
            case NOT_HANDSHAKING:
              break read;
            default:
              throw new AssertionError(handshakeStatus); // unreachable
          }
          // unreachable
        case BUFFER_OVERFLOW:
          this.context.close();
          break read;
        default:
          throw new AssertionError(sslStatus); // unreachable
      }
      // unreachable
    } while (true);
  }

  @Override
  public void doWrite() {
    if ((this.status & OPEN) != 0 && !this.outputBuffer.hasRemaining()) {
      ((Buffer) this.outputBuffer).clear();
      this.socket.doWrite();
      ((Buffer) this.outputBuffer).flip();
    }
    final SSLEngineResult result;
    try {
      result = this.sslEngine.wrap(this.outputBuffer, this.writeBuffer);
    } catch (SSLException error) {
      this.socket.didFail(error);
      this.context.close();
      return;
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        this.socket.didFail(error);
        this.context.close();
        return;
      } else {
        throw error;
      }
    }
    final SSLEngineResult.Status sslStatus = result.getStatus();
    switch (sslStatus) {
      case OK:
        SSLEngineResult.HandshakeStatus handshakeStatus = result.getHandshakeStatus();
        handshake: do {
          switch (handshakeStatus) {
            case NEED_UNWRAP:
              this.context.flowControl(FlowModifier.ENABLE_READ);
              break;
            case NEED_WRAP:
              this.context.flowControl(FlowModifier.ENABLE_READ_WRITE);
              break;
            case FINISHED:
              this.context.flowControl(FlowModifier.DISABLE_WRITE);
              handshakeFinished();
              break;
            case NEED_TASK:
              do {
                // Spin until task is actually available.
                final Runnable task = this.sslEngine.getDelegatedTask();
                if (task != null) {
                  task.run();
                  break;
                } else {
                  handshakeStatus = this.sslEngine.getHandshakeStatus();
                  if (handshakeStatus != SSLEngineResult.HandshakeStatus.NEED_TASK) {
                    break;
                  }
                }
              } while (true);
              continue handshake;
            case NOT_HANDSHAKING:
              break;
            default:
              throw new AssertionError(handshakeStatus); // unreachable
          }
          break;
        } while (true);
        break;
      case CLOSED:
        this.context.close();
        break;
      case BUFFER_UNDERFLOW:
        this.context.close();
        break;
      case BUFFER_OVERFLOW:
        this.context.close();
        break;
      default:
        throw new AssertionError(sslStatus); // unreachable
    }
  }

  @Override
  public void didWrite() {
    final int status = this.status;
    if ((status & HANDSHAKING) != 0) {
      SSLEngineResult.HandshakeStatus handshakeStatus = this.sslEngine.getHandshakeStatus();
      handshake: do {
        switch (handshakeStatus) {
          case NEED_UNWRAP:
            this.context.flowControl(FlowModifier.DISABLE_WRITE_ENABLE_READ);
            break;
          case NEED_WRAP:
            this.context.flowControl(FlowModifier.ENABLE_READ_WRITE);
            break;
          case NEED_TASK:
            do {
              // Spin until task is actually available.
              final Runnable task = this.sslEngine.getDelegatedTask();
              if (task != null) {
                task.run();
                break;
              } else {
                handshakeStatus = this.sslEngine.getHandshakeStatus();
                if (handshakeStatus != SSLEngineResult.HandshakeStatus.NEED_TASK) {
                  break;
                }
              }
            } while (true);
            continue handshake;
          case NOT_HANDSHAKING:
            break;
          default:
            throw new AssertionError(handshakeStatus); // unreachable
        }
        break;
      } while (true);
    } else if ((status & HANDSHAKED) != 0) {
      handshakeAcknowledged();
    } else if ((status & OPEN) != 0) {
      this.socket.didWrite();
    }
  }

  void handshakeFinished() {
    do {
      final int oldStatus = this.status;
      if ((oldStatus & (HANDSHAKING | HANDSHAKED)) != HANDSHAKED) {
        final int newStatus = oldStatus & ~HANDSHAKING | HANDSHAKED;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  void handshakeAcknowledged() {
    do {
      final int oldStatus = this.status;
      if ((oldStatus & (HANDSHAKING | HANDSHAKED)) != 0) {
        final int newStatus = oldStatus & ~(HANDSHAKING | HANDSHAKED) | OPEN;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.socket.didSecure();
          this.context.flowControl(this.flowControl);
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  void receivedClose() {
    do {
      final int oldStatus = this.status;
      if ((oldStatus & CLOSING_OUTBOUND) != 0) {
        final int newStatus = oldStatus & ~CLOSING_OUTBOUND;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.context.close();
          break;
        }
      } else if ((oldStatus & CLOSING_INBOUND) == 0) {
        final int newStatus = oldStatus & ~OPEN | CLOSING_INBOUND;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.sslEngine.closeOutbound();
          this.context.flowControl(FlowModifier.ENABLE_READ_WRITE);
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  void willConnect() {
    do {
      final int oldStatus = this.status;
      if ((oldStatus & CONNECTING) == 0) {
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

  void didConnect() throws SSLException {
    do {
      final int oldStatus = this.status;
      if ((oldStatus & (CONNECTING | CONNECTED | HANDSHAKING)) != (CONNECTED | HANDSHAKING)) {
        final int newStatus = oldStatus & ~CONNECTING | (CONNECTED | HANDSHAKING);
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          if ((oldStatus & CONNECTED) != (newStatus & CONNECTED)) {
            this.socket.didConnect();
          }
          if ((oldStatus & HANDSHAKING) != (newStatus & HANDSHAKING)) {
            this.socket.willSecure();
          }
          this.sslEngine.beginHandshake();
          final SSLEngineResult.HandshakeStatus handshakeStatus = this.sslEngine.getHandshakeStatus();
          switch (handshakeStatus) {
            case NEED_UNWRAP:
              this.context.flowControl(FlowModifier.ENABLE_READ);
              break;
            case NEED_WRAP:
              this.context.flowControl(FlowModifier.ENABLE_READ_WRITE);
              break;
            default:
              throw new AssertionError(handshakeStatus); // unreachable
          }
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
      final int oldStatus = this.status;
      if ((oldStatus & (CONNECTING | CONNECTED | HANDSHAKING | HANDSHAKED | OPEN | CLOSING_INBOUND | CLOSING_OUTBOUND)) != 0) {
        final int newStatus = oldStatus & ~(CONNECTING | CONNECTED | HANDSHAKING | HANDSHAKED | OPEN | CLOSING_INBOUND | CLOSING_OUTBOUND);
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
    this.context.close();
  }

  static final int CLIENT = 1 << 0;
  static final int SERVER = 1 << 1;
  static final int CONNECTING = 1 << 2;
  static final int CONNECTED = 1 << 3;
  static final int HANDSHAKING = 1 << 4;
  static final int HANDSHAKED = 1 << 5;
  static final int OPEN = 1 << 6;
  static final int CLOSING_INBOUND = 1 << 7;
  static final int CLOSING_OUTBOUND = 1 << 8;

  static final AtomicReferenceFieldUpdater<TlsSocket, FlowControl> FLOW_CONTROL =
      AtomicReferenceFieldUpdater.newUpdater(TlsSocket.class, FlowControl.class, "flowControl");

  static final AtomicIntegerFieldUpdater<TlsSocket> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(TlsSocket.class, "status");
}
