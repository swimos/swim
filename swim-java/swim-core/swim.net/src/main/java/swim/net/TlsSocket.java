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

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketException;
import java.nio.ByteBuffer;
import java.nio.channels.CancelledKeyException;
import java.nio.channels.ClosedChannelException;
import java.nio.channels.SocketChannel;
import java.security.Principal;
import java.security.cert.Certificate;
import java.security.cert.CertificateEncodingException;
import java.util.ArrayList;
import javax.net.ssl.SNIHostName;
import javax.net.ssl.SNIServerName;
import javax.net.ssl.SSLEngine;
import javax.net.ssl.SSLEngineResult;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SSLPeerUnverifiedException;
import javax.net.ssl.SSLSession;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.log.Log;
import swim.repr.ArrayRepr;
import swim.repr.BlobRepr;
import swim.repr.Repr;
import swim.repr.ReprException;
import swim.repr.TupleRepr;
import swim.util.Severity;

@Public
@Since("5.0")
public class TlsSocket extends TcpSocket {

  /**
   * SSL engine used to secure the network connection.
   */
  protected final SSLEngine sslEngine;

  /**
   * Buffer for encrypted inbound network data.
   */
  protected final ByteBuffer recvBuffer;

  /**
   * Buffer for encrypted outbound network data.
   */
  protected final ByteBuffer sendBuffer;

  public TlsSocket(SocketChannel channel, NetSocket socket, SSLEngine sslEngine) {
    super(channel, socket);
    this.sslEngine = sslEngine;
    final SSLSession sslSession = this.sslEngine.getSession();
    this.recvBuffer = ByteBuffer.allocateDirect(sslSession.getApplicationBufferSize());
    this.sendBuffer = ByteBuffer.allocateDirect(sslSession.getPacketBufferSize());
  }

  @Override
  protected Log initLog() {
    if (this.remoteAddress != null) {
      return Log.forTopic("swim.net.tls.server").withFocus(this.logFocus());
    } else {
      return Log.forTopic("swim.net.tls.client").withFocus(this.logFocus());
    }
  }

  @Override
  String protocol() {
    return "tls";
  }

  @Override
  public @Nullable SSLSession sslSession() {
    return this.sslEngine.getSession();
  }

  @Override
  public @Nullable SSLParameters sslParameters() {
    return this.sslEngine.getSSLParameters();
  }

  @Override
  public void setSslParameters(SSLParameters sslParameters) {
    this.sslEngine.setSSLParameters(sslParameters);
  }

  @Override
  protected void willConnect() throws IOException {
    this.log.debugEntity("connecting socket", this.socket);

    if (this.isClient()) {
      final SSLParameters sslParameters = this.sslEngine.getSSLParameters();

      final InetSocketAddress remoteAddress = this.remoteAddress;
      if (remoteAddress != null) {
        // Configure TLS server name indication.
        final SNIHostName serverName = new SNIHostName(remoteAddress.getHostName());
        final ArrayList<SNIServerName> serverNames = new ArrayList<SNIServerName>(1);
        serverNames.add(serverName);
        sslParameters.setServerNames(serverNames);
      }

      this.sslEngine.setSSLParameters(sslParameters);
    }

    // Invoke socket lifecycle callback.
    this.socket.willConnect();
  }

  @Override
  protected void willOpen() throws IOException {
    this.log.debugEntity("opening socket", this.socket);

    // Invoke socket lifecycle callback.
    this.socket.willOpen();

    // Begin the TLS handshake.
    this.sslEngine.beginHandshake();

    // Request handshake I/O callbacks.
    this.requestOpeningRead();
    if (this.isClient()) {
      this.requestOpeningWrite();
    }
  }

  protected void requestOpeningRead() {
    if (this.recvBuffer.position() == 0) {
      this.getTransportContext().requestRead();
    } else {
      this.dispatchRead();
    }
  }

  @Override
  protected void doOpeningRead() throws IOException {
    SSLEngineResult.HandshakeStatus handshakeStatus = this.sslEngine.getHandshakeStatus();
    SSLEngineResult result;
    read: do {
      switch (handshakeStatus) {
        case NOT_HANDSHAKING:
          break;
        case FINISHED:
          this.requestOpen();
          break;
        case NEED_TASK:
          final Runnable task = this.sslEngine.getDelegatedTask();
          if (task != null) {
            task.run();
          } else {
            Thread.onSpinWait();
          }
          handshakeStatus = this.sslEngine.getHandshakeStatus();
          continue read;
        case NEED_WRAP:
          this.requestOpeningWrite();
          break;
        case NEED_UNWRAP:
          try {
            final int count = this.channel.read(this.recvBuffer);
            this.recvBuffer.flip();
            result = this.sslEngine.unwrap(this.recvBuffer, EMPTY_BUFFER);
            this.recvBuffer.compact();
            switch (result.getStatus()) {
              case OK:
                handshakeStatus = result.getHandshakeStatus();
                continue read;
              case CLOSED:
                //this.channel.shutdownInput();
                break;
              case BUFFER_UNDERFLOW:
                this.requestOpeningRead();
                break;
              case BUFFER_OVERFLOW:
                this.log.warningStatus("recv buffer overflow", this);
                // Initiate socket close.
                this.close();
                break;
              default:
                throw new AssertionError("unreachable");
            }
            if (count < 0) {
              this.sslEngine.closeInbound();
            }
          } catch (ClosedChannelException cause) {
            // Initiate socket close.
            this.close();
          } catch (IOException cause) {
            this.log.warningStatus("opening read failed", this, cause);
            // Initiate socket close.
            this.close();
          }
          break;
        default:
          throw new AssertionError(handshakeStatus.toString()); // unreachable
      }
      break;
    } while (true);
  }

  protected void requestOpeningWrite() {
    if (this.sendBuffer.position() == 0) {
      this.getTransportContext().requestWrite();
    } else {
      this.dispatchWrite();
    }
  }

  @Override
  protected void doOpeningWrite() throws IOException {
    SSLEngineResult.HandshakeStatus handshakeStatus = this.sslEngine.getHandshakeStatus();
    SSLEngineResult result;
    write: do {
      switch (handshakeStatus) {
        case NOT_HANDSHAKING:
          break;
        case FINISHED:
          this.requestOpen();
          break;
        case NEED_TASK:
          final Runnable task = this.sslEngine.getDelegatedTask();
          if (task != null) {
            task.run();
          } else {
            Thread.onSpinWait();
          }
          handshakeStatus = this.sslEngine.getHandshakeStatus();
          continue write;
        case NEED_WRAP:
          try {
            result = this.sslEngine.wrap(EMPTY_BUFFER, this.sendBuffer);
            this.sendBuffer.flip();
            this.channel.write(this.sendBuffer);
            this.sendBuffer.compact();
            switch (result.getStatus()) {
              case OK:
                handshakeStatus = result.getHandshakeStatus();
                continue write;
              case CLOSED:
                if (this.sendBuffer.position() == 0) {
                  this.channel.shutdownOutput();
                } else {
                  this.requestOpeningWrite();
                }
                break;
              case BUFFER_UNDERFLOW:
                this.log.warningStatus("send buffer underflow", this);
                // Initiate socket close.
                this.close();
                break;
              case BUFFER_OVERFLOW:
                this.requestOpeningWrite();
                break;
              default:
                throw new AssertionError("unreachable");
            }
          } catch (ClosedChannelException cause) {
            // Initiate socket close.
            this.close();
          } catch (IOException cause) {
            this.log.warningStatus("opening write failed", this, cause);
            // Initiate socket close.
            this.close();
          }
          break;
        case NEED_UNWRAP:
          this.requestOpeningRead();
          break;
        default:
          throw new AssertionError(handshakeStatus.toString()); // unreachable
      }
      break;
    } while (true);
  }

  @Override
  protected void doRead() throws IOException {
    // Invoke socket I/O callback.
    this.socket.doRead();

    SSLEngineResult.HandshakeStatus handshakeStatus = this.sslEngine.getHandshakeStatus();
    SSLEngineResult result;
    read: do {
      switch (handshakeStatus) {
        case NOT_HANDSHAKING:
          break;
        case FINISHED:
          break;
        case NEED_TASK:
          final Runnable task = this.sslEngine.getDelegatedTask();
          if (task != null) {
            task.run();
          } else {
            Thread.onSpinWait();
          }
          handshakeStatus = this.sslEngine.getHandshakeStatus();
          continue read;
        case NEED_WRAP:
          this.requestOpeningWrite();
          break;
        case NEED_UNWRAP:
          try {
            final int count = this.channel.read(this.recvBuffer);
            this.recvBuffer.flip();
            result = this.sslEngine.unwrap(this.recvBuffer, EMPTY_BUFFER);
            this.recvBuffer.compact();
            switch (result.getStatus()) {
              case OK:
                handshakeStatus = result.getHandshakeStatus();
                continue read;
              case CLOSED:
                //this.channel.shutdownInput();
                break;
              case BUFFER_UNDERFLOW:
                this.requestOpeningRead();
                break;
              case BUFFER_OVERFLOW:
                this.log.warningStatus("recv buffer overflow", this);
                // Initiate socket close.
                this.close();
                break;
              default:
                throw new AssertionError("unreachable");
            }
            if (count < 0) {
              this.sslEngine.closeInbound();
            }
          } catch (ClosedChannelException cause) {
            // Initiate socket close.
            this.close();
          } catch (IOException cause) {
            this.log.warningStatus("read failed", this, cause);
            // Initiate socket close.
            this.close();
          }
          break;
        default:
          throw new AssertionError(handshakeStatus.toString()); // unreachable
      }
      break;
    } while (true);
  }

  @Override
  public int read(ByteBuffer readBuffer) throws IOException {
    final int count = this.channel.read(this.recvBuffer);
    this.recvBuffer.flip();
    final SSLEngineResult result = this.sslEngine.unwrap(this.recvBuffer, readBuffer);
    this.recvBuffer.compact();
    switch (result.getStatus()) {
      case OK:
        break;
      case CLOSED:
        //this.channel.shutdownInput();
        break;
      case BUFFER_UNDERFLOW:
        break;
      case BUFFER_OVERFLOW:
        break;
      default:
        throw new AssertionError("unreachable");
    }
    if (count >= 0 || this.recvBuffer.position() != 0) {
      return result.bytesProduced();
    } else {
      return -1;
    }
  }

  @Override
  protected void doWrite() throws IOException {
    // Invoke socket I/O callback.
    this.socket.doWrite();

    SSLEngineResult.HandshakeStatus handshakeStatus = this.sslEngine.getHandshakeStatus();
    SSLEngineResult result;
    write: do {
      switch (handshakeStatus) {
        case NOT_HANDSHAKING:
          break;
        case FINISHED:
          break;
        case NEED_TASK:
          final Runnable task = this.sslEngine.getDelegatedTask();
          if (task != null) {
            task.run();
          } else {
            Thread.onSpinWait();
          }
          handshakeStatus = this.sslEngine.getHandshakeStatus();
          continue write;
        case NEED_WRAP:
          try {
            result = this.sslEngine.wrap(EMPTY_BUFFER, this.sendBuffer);
            this.sendBuffer.flip();
            this.channel.write(this.sendBuffer);
            this.sendBuffer.compact();
            switch (result.getStatus()) {
              case OK:
                handshakeStatus = result.getHandshakeStatus();
                continue write;
              case CLOSED:
                if (this.sendBuffer.position() == 0) {
                  this.channel.shutdownOutput();
                } else {
                  this.requestOpeningWrite();
                }
                break;
              case BUFFER_UNDERFLOW: // unreachable
                this.log.warningStatus("send buffer overflow", this);
                // Initiate socket close.
                this.close();
                break;
              case BUFFER_OVERFLOW:
                this.requestOpeningWrite();
                break;
              default:
                throw new AssertionError("unreachable");
            }
          } catch (ClosedChannelException cause) {
            // Initiate socket close.
            this.close();
          } catch (IOException cause) {
            this.log.warningStatus("write failed", this, cause);
            // Initiate socket close.
            this.close();
          }
          break;
        case NEED_UNWRAP:
          this.requestOpeningRead();
          break;
        default:
          throw new AssertionError(handshakeStatus.toString()); // unreachable
      }
      break;
    } while (true);
  }

  @Override
  public int write(ByteBuffer writeBuffer) throws IOException {
    final SSLEngineResult result = this.sslEngine.wrap(writeBuffer, this.sendBuffer);
    this.sendBuffer.flip();
    this.channel.write(this.sendBuffer);
    this.sendBuffer.compact();
    switch (result.getStatus()) {
      case OK:
        break;
      case CLOSED:
        if (this.sendBuffer.position() == 0) {
          try {
            this.channel.shutdownOutput();
          } catch (ClosedChannelException cause) {
            // The channel was already fully closed.
          }
        } else {
          this.requestOpeningWrite();
        }
        break;
      case BUFFER_UNDERFLOW: // unreachable
        this.log.warningStatus("send buffer underflow", this);
        // Initiate socket close.
        this.close();
        break;
      case BUFFER_OVERFLOW: // unreachable
        this.log.warningStatus("send buffer overflow", this);
        // Initiate socket close.
        this.close();
        break;
      default:
        throw new AssertionError("unreachable");
    }
    return result.bytesConsumed();
  }

  @Override
  protected void doCloseInbound() throws IOException {
    this.log.debugEntity("close inbound", this.socket);

    try {
      this.requestClosingRead();
    } catch (CancelledKeyException cause) {
      // already closed
    }
  }

  @Override
  protected void doCloseOutbound() throws IOException {
    this.log.debugEntity("close outbound", this.socket);

    this.sslEngine.closeOutbound();

    try {
      this.requestClosingWrite();
    } catch (CancelledKeyException cause) {
      // already closed
    }
  }

  protected void requestClosingRead() {
    if (this.recvBuffer.position() == 0) {
      this.getTransportContext().requestRead();
    } else {
      this.dispatchRead();
    }
  }

  @Override
  protected void doClosingRead() throws IOException {
    SSLEngineResult.HandshakeStatus handshakeStatus = this.sslEngine.getHandshakeStatus();
    SSLEngineResult result;
    read: do {
      switch (handshakeStatus) {
        case NOT_HANDSHAKING:
          this.channel.shutdownInput();
          break;
        case FINISHED:
          break;
        case NEED_TASK:
          final Runnable task = this.sslEngine.getDelegatedTask();
          if (task != null) {
            task.run();
          } else {
            Thread.onSpinWait();
          }
          handshakeStatus = this.sslEngine.getHandshakeStatus();
          continue read;
        case NEED_WRAP:
          this.requestClosingWrite();
          break;
        case NEED_UNWRAP:
          try {
            final int count = this.channel.read(this.recvBuffer);
            this.recvBuffer.flip();
            result = this.sslEngine.unwrap(this.recvBuffer, EMPTY_BUFFER);
            this.recvBuffer.compact();
            switch (result.getStatus()) {
              case OK:
                handshakeStatus = result.getHandshakeStatus();
                continue read;
              case CLOSED:
                handshakeStatus = result.getHandshakeStatus();
                continue read;
              case BUFFER_UNDERFLOW:
                this.requestClosingRead();
                break;
              case BUFFER_OVERFLOW:
                this.log.warningStatus("recv buffer overflow", this);
                // Initiate socket close.
                this.close();
                break;
              default:
                throw new AssertionError("unreachable");
            }
            if (count < 0) {
              this.sslEngine.closeInbound();
            }
          } catch (ClosedChannelException cause) {
            // Initiate socket close.
            this.close();
          } catch (IOException cause) {
            this.log.warningStatus("closing read failed", this, cause);
            // Initiate socket close.
            this.close();
          }
          break;
        default:
          throw new AssertionError(handshakeStatus.toString()); // unreachable
      }
      break;
    } while (true);
  }

  protected void requestClosingWrite() {
    if (this.sendBuffer.position() == 0) {
      this.getTransportContext().requestWrite();
    } else {
      this.dispatchWrite();
    }
  }

  @Override
  protected void doClosingWrite() throws IOException {
    SSLEngineResult.HandshakeStatus handshakeStatus = this.sslEngine.getHandshakeStatus();
    SSLEngineResult result;
    write: do {
      switch (handshakeStatus) {
        case NOT_HANDSHAKING:
          if (this.sendBuffer.position() != 0) {
            this.sendBuffer.flip();
            this.channel.write(this.sendBuffer);
            this.sendBuffer.compact();
          }
          if (this.sendBuffer.position() == 0) {
            this.channel.shutdownOutput();
            if (this.isDoneReading()) {
              if (this.sslEngine.isInboundDone()) {
                this.channel.shutdownInput();
              } else {
                this.requestClosingRead();
              }
            }
          } else {
            this.requestClosingWrite();
          }
          break;
        case FINISHED:
          break;
        case NEED_TASK:
          final Runnable task = this.sslEngine.getDelegatedTask();
          if (task != null) {
            task.run();
          } else {
            Thread.onSpinWait();
          }
          handshakeStatus = this.sslEngine.getHandshakeStatus();
          continue write;
        case NEED_WRAP:
          try {
            result = this.sslEngine.wrap(EMPTY_BUFFER, this.sendBuffer);
            this.sendBuffer.flip();
            this.channel.write(this.sendBuffer);
            this.sendBuffer.compact();
            switch (result.getStatus()) {
              case OK:
                handshakeStatus = result.getHandshakeStatus();
                continue write;
              case CLOSED:
                handshakeStatus = result.getHandshakeStatus();
                continue write;
              case BUFFER_UNDERFLOW: // unreachable
                this.log.warningStatus("send buffer underflow", this);
                // Initiate socket close.
                this.close();
                break;
              case BUFFER_OVERFLOW:
                this.requestClosingWrite();
                break;
              default:
                throw new AssertionError("unreachable");
            }
          } catch (ClosedChannelException cause) {
            // Initiate socket close.
            this.close();
          } catch (IOException cause) {
            this.log.warningStatus("closing write failed", this, cause);
            // Initiate socket close.
            this.close();
          }
          break;
        case NEED_UNWRAP:
          this.requestClosingRead();
          break;
        default:
          throw new AssertionError(handshakeStatus.toString()); // unreachable
      }
      break;
    } while (true);
  }

  @Override
  public @Nullable Object toLogConfig(Severity level) {
    final Socket socket = this.channel.socket();
    final SSLEngine sslEngine = this.sslEngine;
    final SSLSession sslSession = sslEngine.getSession();
    final TupleRepr context = TupleRepr.of();
    try {
      context.put("localAddress", Repr.from(socket.getLocalSocketAddress()));
    } catch (ReprException cause) {
      // ignore
    }
    try {
      context.put("remoteAddress", Repr.from(this.remoteAddress));
    } catch (ReprException cause) {
      // ignore
    }

    context.put("protocol", Repr.of(sslSession.getProtocol()));
    context.put("cipherSuite", Repr.of(sslSession.getCipherSuite()));
    context.put("clientAuth", Repr.of(TlsClientAuth.from(sslEngine).label()));

    final Principal localPrincipal = sslSession.getLocalPrincipal();
    if (localPrincipal != null) {
      context.put("localPrincipal", Repr.of(localPrincipal.getName()));
    }
    if (LOG_CERTIFICATES) {
      final Certificate[] localCertificates = sslSession.getLocalCertificates();
      if (localCertificates != null) {
        final ArrayRepr certificateBlobs = ArrayRepr.ofCapacity(localCertificates.length);
        for (int i = 0; i < localCertificates.length; i += 1) {
          try {
            certificateBlobs.add(BlobRepr.wrap(localCertificates[i].getEncoded()));
          } catch (CertificateEncodingException cause) {
            certificateBlobs.add(Repr.unit());
          }
        }
        context.put("localCertificates", certificateBlobs);
      }
    }

    try {
      final Principal remotePrincipal = sslSession.getPeerPrincipal();
      if (remotePrincipal != null) {
        context.put("remotePrincipal", Repr.of(remotePrincipal.getName()));
      }
    } catch (SSLPeerUnverifiedException cause) {
      // ignore
    }
    if (LOG_CERTIFICATES) {
      try {
        final Certificate[] remoteCertificates = sslSession.getPeerCertificates();
        if (remoteCertificates != null) {
          final ArrayRepr certificateBlobs = ArrayRepr.ofCapacity(remoteCertificates.length);
          for (int i = 0; i < remoteCertificates.length; i += 1) {
            try {
              certificateBlobs.add(BlobRepr.wrap(remoteCertificates[i].getEncoded()));
            } catch (CertificateEncodingException cause) {
              certificateBlobs.add(Repr.unit());
            }
          }
          context.put("localCertificates", certificateBlobs);
        }
      } catch (SSLPeerUnverifiedException cause) {
        // ignore
      }
    }

    try {
      final String applicationProtocol = sslEngine.getApplicationProtocol();
      if (applicationProtocol != null && applicationProtocol.length() != 0) {
        context.put("applicationProtocol", Repr.of(applicationProtocol));
      }
    } catch (UnsupportedOperationException cause) {
      // ignore
    }

    try {
      final String handshakeApplicationProtocol = sslEngine.getHandshakeApplicationProtocol();
      if (handshakeApplicationProtocol != null) {
        context.put("handshakeApplicationProtocol", Repr.of(handshakeApplicationProtocol));
      }
    } catch (UnsupportedOperationException cause) {
      // ignore
    }

    context.put("applicationBufferSize", Repr.of(sslSession.getApplicationBufferSize()));
    context.put("packetBufferSize", Repr.of(sslSession.getPacketBufferSize()));

    try {
      context.put("recvBufferSize", Repr.of(socket.getReceiveBufferSize()));
    } catch (SocketException cause) {
      // ignore
    }
    try {
      context.put("sendBufferSize", Repr.of(socket.getSendBufferSize()));
    } catch (SocketException cause) {
      // ignore
    }
    try {
      context.put("keepAlive", Repr.of(socket.getKeepAlive()));
    } catch (SocketException cause) {
      // ignore
    }
    try {
      context.put("noDelay", Repr.of(socket.getTcpNoDelay()));
    } catch (SocketException cause) {
      // ignore
    }

    return context;
  }

  @Override
  public @Nullable Object toLogStatus(Severity level) {
    final Socket socket = this.channel.socket();
    final TupleRepr context = TupleRepr.of();
    try {
      context.put("localAddress", Repr.from(socket.getLocalSocketAddress()));
    } catch (ReprException cause) {
      // ignore
    }
    try {
      context.put("remoteAddress", Repr.from(this.remoteAddress));
    } catch (ReprException cause) {
      // ignore
    }
    if (this.channel.isConnectionPending()) {
      context.put("connecting", Repr.of(true));
    }
    if (socket.isConnected()) {
      context.put("connected", Repr.of(true));
    }
    switch (this.sslEngine.getHandshakeStatus()) {
      case NOT_HANDSHAKING:
        break;
      case FINISHED:
        context.put("handshake", Repr.of("finished"));
        break;
      case NEED_TASK:
        context.put("handshake", Repr.of("running"));
        break;
      case NEED_WRAP:
        context.put("handshake", Repr.of("writing"));
        break;
      case NEED_UNWRAP:
        context.put("handshake", Repr.of("reading"));
        break;
      default:
    }
    if (socket.isInputShutdown()) {
      context.put("doneReading", Repr.of(true));
    }
    if (socket.isOutputShutdown()) {
      context.put("doneWriting", Repr.of(true));
    }
    if (socket.isClosed()) {
      context.put("closed", Repr.of(true));
    }
    return context;
  }

  static final ByteBuffer EMPTY_BUFFER = ByteBuffer.allocateDirect(0);

  static final boolean LOG_CERTIFICATES;

  static {
    LOG_CERTIFICATES = Boolean.parseBoolean(System.getProperty("swim.net.tls.log.certificates"));
  }

}
