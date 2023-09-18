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
import swim.concurrent.Cont;

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
    this.status = isClient ? TlsSocket.CLIENT : TlsSocket.SERVER;

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
    this.reader = Binary.inputBuffer(this.inputBuffer);
    this.writer = Binary.outputBuffer(this.outputBuffer);
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
    return (TlsSocket.STATUS.get(this) & TlsSocket.CONNECTED) != 0;
  }

  @Override
  public boolean isClient() {
    return (TlsSocket.STATUS.get(this) & TlsSocket.CLIENT) != 0;
  }

  @Override
  public boolean isServer() {
    return (TlsSocket.STATUS.get(this) & TlsSocket.SERVER) != 0;
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
    } catch (SSLException cause) {
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
    } catch (SSLException cause) {
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
    TlsSocket.FLOW_CONTROL.set(this, flowControl);
    if ((TlsSocket.STATUS.get(this) & TlsSocket.OPEN) != 0) {
      this.context.flowControl(flowControl);
    }
  }

  @Override
  public FlowControl flowControl(FlowModifier flowModifier) {
    do {
      final FlowControl oldFlowControl = this.flowControl;
      final FlowControl newFlowControl = oldFlowControl.modify(flowModifier);
      if (TlsSocket.FLOW_CONTROL.compareAndSet(this, oldFlowControl, newFlowControl)) {
        if ((TlsSocket.STATUS.get(this) & TlsSocket.OPEN) != 0) {
          return this.context.flowControl(flowModifier);
        } else {
          return newFlowControl;
        }
      }
    } while (true);
  }

  @Override
  public void become(IpSocket newSocket) {
    final IpSocket oldSocket = this.socket;
    if (oldSocket != null) {
      oldSocket.willBecome(newSocket);
    }

    final int status = TlsSocket.STATUS.get(this);
    newSocket.setIpSocketContext(this);
    this.socket = newSocket;
    if ((status & TlsSocket.CONNECTED) != 0) {
      newSocket.didConnect();
    } else if ((status & TlsSocket.CONNECTING) != 0) {
      newSocket.willConnect();
    }

    if (oldSocket != null) {
      oldSocket.didBecome(newSocket);
    }
  }

  @Override
  public void close() {
    do {
      final int oldStatus = TlsSocket.STATUS.get(this);
      if ((oldStatus & TlsSocket.OPEN) != 0) {
        final int newStatus = oldStatus & ~TlsSocket.OPEN | TlsSocket.CLOSING_OUTBOUND;
        if (TlsSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
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
      this.didConnect();
    } catch (ConnectException cause) {
      this.didClose();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      this.didFail(cause);
    }
  }

  @Override
  public void doRead() {
    read: do {
      final SSLEngineResult result;
      try {
        result = this.sslEngine.unwrap(this.readBuffer, this.inputBuffer);
      } catch (SSLException cause) {
        this.socket.didFail(cause);
        this.context.close();
        return;
      } catch (Throwable cause) {
        if (!Cont.isNonFatal(cause)) {
          throw cause;
        }
        this.socket.didFail(cause);
        this.context.close();
        return;
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
                this.handshakeAcknowledged();
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
          this.receivedClose();
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
    if ((TlsSocket.STATUS.get(this) & TlsSocket.OPEN) != 0 && !this.outputBuffer.hasRemaining()) {
      ((Buffer) this.outputBuffer).clear();
      this.socket.doWrite();
      ((Buffer) this.outputBuffer).flip();
    }
    final SSLEngineResult result;
    try {
      result = this.sslEngine.wrap(this.outputBuffer, this.writeBuffer);
    } catch (SSLException cause) {
      this.socket.didFail(cause);
      this.context.close();
      return;
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      this.socket.didFail(cause);
      this.context.close();
      return;
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
              this.handshakeFinished();
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
        if (this.writeBuffer.position() == 0) {
          this.context.close();
        }
        break;
      default:
        throw new AssertionError(sslStatus); // unreachable
    }
  }

  @Override
  public void didWrite() {
    final int status = TlsSocket.STATUS.get(this);
    if ((status & TlsSocket.HANDSHAKING) != 0) {
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
    } else if ((status & TlsSocket.HANDSHAKED) != 0) {
      this.handshakeAcknowledged();
    } else if ((status & TlsSocket.OPEN) != 0) {
      this.socket.didWrite();
    }
  }

  void handshakeFinished() {
    do {
      final int oldStatus = TlsSocket.STATUS.get(this);
      if ((oldStatus & (TlsSocket.HANDSHAKING | TlsSocket.HANDSHAKED)) != TlsSocket.HANDSHAKED) {
        final int newStatus = oldStatus & ~TlsSocket.HANDSHAKING | TlsSocket.HANDSHAKED;
        if (TlsSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  void handshakeAcknowledged() {
    do {
      final int oldStatus = TlsSocket.STATUS.get(this);
      if ((oldStatus & (TlsSocket.HANDSHAKING | TlsSocket.HANDSHAKED)) != 0) {
        final int newStatus = oldStatus & ~(TlsSocket.HANDSHAKING | TlsSocket.HANDSHAKED) | TlsSocket.OPEN;
        if (TlsSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
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
      final int oldStatus = TlsSocket.STATUS.get(this);
      if ((oldStatus & TlsSocket.CLOSING_OUTBOUND) != 0) {
        final int newStatus = oldStatus & ~TlsSocket.CLOSING_OUTBOUND;
        if (TlsSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.context.close();
          break;
        }
      } else if ((oldStatus & TlsSocket.CLOSING_INBOUND) == 0) {
        final int newStatus = oldStatus & ~TlsSocket.OPEN | TlsSocket.CLOSING_INBOUND;
        if (TlsSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
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
      final int oldStatus = TlsSocket.STATUS.get(this);
      if ((oldStatus & TlsSocket.CONNECTING) == 0) {
        final int newStatus = oldStatus | TlsSocket.CONNECTING;
        if (TlsSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
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
      final int oldStatus = TlsSocket.STATUS.get(this);
      if ((oldStatus & (TlsSocket.CONNECTING | TlsSocket.CONNECTED | TlsSocket.HANDSHAKING)) != (TlsSocket.CONNECTED | TlsSocket.HANDSHAKING)) {
        final int newStatus = oldStatus & ~TlsSocket.CONNECTING | (TlsSocket.CONNECTED | TlsSocket.HANDSHAKING);
        if (TlsSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          if ((oldStatus & TlsSocket.CONNECTED) != (newStatus & TlsSocket.CONNECTED)) {
            this.socket.didConnect();
          }
          if ((oldStatus & TlsSocket.HANDSHAKING) != (newStatus & TlsSocket.HANDSHAKING)) {
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
      final int oldStatus = TlsSocket.STATUS.get(this);
      if ((oldStatus & (TlsSocket.CONNECTING | TlsSocket.CONNECTED | TlsSocket.HANDSHAKING | TlsSocket.HANDSHAKED | TlsSocket.OPEN | TlsSocket.CLOSING_INBOUND | TlsSocket.CLOSING_OUTBOUND)) != 0) {
        final int newStatus = oldStatus & ~(TlsSocket.CONNECTING | TlsSocket.CONNECTED | TlsSocket.HANDSHAKING | TlsSocket.HANDSHAKED | TlsSocket.OPEN | TlsSocket.CLOSING_INBOUND | TlsSocket.CLOSING_OUTBOUND);
        if (TlsSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
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
    Throwable failure = null;
    if (!(error instanceof IOException)) {
      try {
        this.socket.didFail(error);
      } catch (Throwable cause) {
        if (!Cont.isNonFatal(cause)) {
          throw cause;
        }
        failure = cause;
      }
    }
    this.context.close();
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
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
