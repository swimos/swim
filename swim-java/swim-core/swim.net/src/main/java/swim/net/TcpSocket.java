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
import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.net.ConnectException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketException;
import java.nio.ByteBuffer;
import java.nio.channels.CancelledKeyException;
import java.nio.channels.ClosedChannelException;
import java.nio.channels.ClosedSelectorException;
import java.nio.channels.SocketChannel;
import java.util.Objects;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SSLSession;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.exec.AbstractTask;
import swim.exec.Scheduler;
import swim.log.Log;
import swim.log.LogConfig;
import swim.log.LogEntity;
import swim.log.LogScope;
import swim.log.LogStatus;
import swim.repr.Repr;
import swim.repr.ReprException;
import swim.repr.TupleRepr;
import swim.util.Result;
import swim.util.Severity;

@Public
@Since("5.0")
public class TcpSocket implements Transport, NetSocketContext, LogEntity, LogConfig, LogStatus {

  /**
   * NIO socket channel used to perform I/O operations.
   */
  protected final SocketChannel channel;

  /**
   * Network socket on which to invoke I/O and lifecycle callbacks.
   */
  protected NetSocket socket;

  /**
   * Network socket to become after all pending I/O operations complete.
   */
  volatile @Nullable NetSocket becoming;

  /**
   * Network transport used to request I/O readiness callbacks.
   */
  protected @Nullable TransportContext context;

  /**
   * Execution context in which to run I/O tasks.
   */
  protected @Nullable Scheduler scheduler;

  /**
   * IP address and port to which the network socket should connect.
   */
  protected @Nullable InetSocketAddress remoteAddress;

  /**
   * Atomic bit field containing socket state in {@link #STATE_MASK}.
   */
  volatile int status;

  /**
   * Transport lifecycle and error log.
   */
  Log log;

  /**
   * Task from which to perform sequenced I/O and lifecycle operations,
   * excluding I/O writes, which are performed by the {@link #writer} task.
   */
  final TcpReader reader;

  /**
   * Task from which to perform sequenced write operations.
   */
  final TcpWriter writer;

  public TcpSocket(SocketChannel channel, NetSocket socket) {
    // Initialize transport parameters.
    this.channel = channel;
    this.socket = socket;
    this.becoming = null;

    // Initialize transport context.
    this.context = null;
    this.scheduler = null;
    this.remoteAddress = (InetSocketAddress) channel.socket().getRemoteSocketAddress();

    // Initialize transport status.
    this.status = 0;

    // Initialize the transport log.
    this.log = this.initLog();

    // Initialize the reader and writer tasks.
    this.reader = new TcpReader(this);
    this.writer = new TcpWriter(this);
  }

  public Log log() {
    return this.log;
  }

  protected String logFocus() {
    if (this.remoteAddress != null) {
      return TcpEndpoint.endpointAddress(this.remoteAddress);
    }
    return "";
  }

  protected Log initLog() {
    if (this.remoteAddress != null) {
      return Log.forTopic("swim.net.tcp.server").withFocus(this.logFocus());
    } else {
      return Log.forTopic("swim.net.tcp.client").withFocus(this.logFocus());
    }
  }

  public void setLog(Log log) {
    Objects.requireNonNull(log);
    this.log = log.withFocus(this.logFocus());
  }

  String protocol() {
    return "tcp";
  }

  @Override
  public final @Nullable TransportContext transportContext() {
    return this.context;
  }

  @Override
  public final TransportContext getTransportContext() {
    final TransportContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound transport");
    }
    return context;
  }

  @Override
  public void setTransportContext(@Nullable TransportContext context) {
    this.context = context;
  }

  @Override
  public final @Nullable Scheduler scheduler() {
    return this.scheduler;
  }

  @Override
  public void setScheduler(@Nullable Scheduler scheduler) {
    this.scheduler = scheduler;
    if (scheduler != null) {
      scheduler.bindTask(this.reader);
      scheduler.bindTask(this.writer);
    }
  }

  @Override
  public final SocketChannel channel() {
    return this.channel;
  }

  @Override
  public final NetSocket socket() {
    return this.socket;
  }

  @Override
  public long idleTimeout() {
    return this.socket.idleTimeout();
  }

  @Override
  public final boolean isClient() {
    final int status = (int) STATUS.getOpaque(this);
    return (status & ACCEPTED) == 0;
  }

  @Override
  public final boolean isServer() {
    final int status = (int) STATUS.getOpaque(this);
    return (status & ACCEPTED) != 0;
  }

  @Override
  public final boolean isConnecting() {
    final int status = (int) STATUS.getOpaque(this);
    return (status & OPENING_MASK) == CONNECTING;
  }

  @Override
  public final boolean isOpening() {
    final int status = (int) STATUS.getOpaque(this);
    return (status & OPENING_MASK) == OPENING_MASK;
  }

  @Override
  public final boolean isOpen() {
    final int status = (int) STATUS.getOpaque(this);
    return (status & OPENING_MASK) == CONNECTED;
  }

  @Override
  public final @Nullable InetSocketAddress localAddress() {
    try {
      return (InetSocketAddress) this.channel.getLocalAddress();
    } catch (IOException cause) {
      return null;
    }
  }

  @Override
  public final @Nullable InetSocketAddress remoteAddress() {
    return this.remoteAddress;
  }

  @Override
  public @Nullable SSLSession sslSession() {
    return null;
  }

  @Override
  public @Nullable SSLParameters sslParameters() {
    return null;
  }

  @Override
  public void setSslParameters(SSLParameters sslParameters) {
    throw new UnsupportedOperationException("not a secure transport");
  }

  @Override
  public void dispatchAccept() {
    this.log.debugStatus("unexpected dispatchAccept", this);
  }

  @Override
  public void dispatchConnect() {
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & CONNECT_READY) != 0) {
        // The transport already has a pending connect operation.
        break;
      }
      // The transport doesn't currently have a pending connect operation.
      final int oldStatus = status;
      final int newStatus = oldStatus | CONNECT_READY;
      // Try to set the connect ready flag;
      // must happen before scheduling the reader task.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The connect ready flag has been set.
      status = newStatus;
      this.log.trace("ready to connect");
      // Schedule the reader task to complete the connection.
      this.reader.schedule();
      break;
    } while (true);
  }

  @Override
  public boolean connect(InetSocketAddress remoteAddress) {
    final boolean connecting;
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & (STATE_MASK | CONNECT_REQUEST | CLOSE_REQUEST)) != INITIAL_STATE) {
        // The transport is no longer in the initial state, or has already been
        // requested to connect or close.
        connecting = false;
        break;
      }
      // The transport is still in its initial state, and has not been
      // requested to connect or close.
      final int oldStatus = status;
      final int newStatus = oldStatus | CONNECT_REQUEST;
      // Try to set the connect request flag;
      // must happen before scheduling the reader task.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The connect request flag has been set.
      status = newStatus;
      connecting = true;
      // Store the address to which the transport should connect.
      this.remoteAddress = remoteAddress;
      // Focus the log now that remoteAddress is known.
      this.setLog(this.log);
      this.log.trace("request connect");
      // Schedule the reader task to perform the connect operation.
      this.reader.schedule();
      break;
    } while (true);
    // Return whether or not this call caused the transport to begin connecting.
    return connecting;
  }

  /**
   * Invoked by the reader task to initiate a client connection. The given
   * service {@code status} has the {@code CONNECT_REQUEST} bit set.
   * Returns the current service status after initiating the connection.
   */
  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runConnect(int status) {
    do {
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~(STATE_MASK | CONNECT_REQUEST)) | CONNECTING_STATE;
      // Try to transition the transport into the connecting state;
      // must happen before initiating the connection.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The transport has transitioned into the connecting state.
      status = newStatus;
      try {
        // Invoke willConnect callback before initiating the connection.
        this.willConnect();
      } catch (IOException cause) {
        this.log.warningStatus("willConnect callback failed", this.socket, cause);
        // Initiate transport close.
        status = this.readerRequestClose(status);
        // Abort and close the socket.
        return status;
      } catch (Throwable cause) {
        if (Result.isFatal(cause)) {
          throw cause;
        }
        this.log.errorStatus("willConnect callback failed", this.socket, cause);
        // Initiate transport close.
        status = this.readerRequestClose(status);
        // Abort and close the socket.
        return status;
      }
      break;
    } while (true);

    final boolean connected;
    try {
      // Connect the network channel.
      connected = this.channel.connect(this.remoteAddress);
    } catch (IOException cause) {
      this.log.warningStatus("failed to connect socket", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("failed to connect socket", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    if (connected) {
      // The connection was immediately established.
      do {
        final int oldStatus = status;
        final int newStatus = oldStatus | CONNECT_READY;
        // Try to set the connect ready flag;
        // must happen after initiating the connection.
        status = (int) STATUS.compareAndExchangeRelease(this, oldStatus, newStatus);
        if (status != oldStatus) {
          // CAS failed; try again.
          continue;
        }
        // The connect ready flag has been set.
        status = newStatus;
        break;
      } while (true);
    } else {
      // The connection operation is still in progress; ask the I/O dispatcher
      // to inform us when the transport is ready to finish connecting.
      this.getTransportContext().requestConnect();
    }

    // Check if the network channel has closed.
    if (!this.channel.isOpen() || (this.channel.socket().isInputShutdown() && this.channel.socket().isOutputShutdown())) {
      // Initiate transport close.
      status = this.readerRequestClose(status);
    } else {
      status = (int) STATUS.getAcquire(this);
    }

    return status;
  }

  protected void willConnect() throws IOException {
    this.log.debugEntity("connecting socket", this.socket);

    // Invoke socket lifecycle callback.
    this.socket.willConnect();
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  public boolean open() {
    final boolean opening;
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & (STATE_MASK | CONNECT_REQUEST | CLOSE_REQUEST)) != INITIAL_STATE) {
        // The transport is no longer in the initial state, or has already been
        // requested to connect or close.
        opening = false;
        break;
      }
      // The transport is still in its initial state, and has not been
      // requested to connect or close.
      final int oldStatus = status;
      final int newStatus = oldStatus | ACCEPTED | CONNECTING_STATE | CONNECT_READY;
      // Try to transition the transport into the connecting state, with the
      // connect ready flag set so as to immediately complete the connection;
      // must happen before scheduling the reader task.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The transport has transitioned into the connecting state.
      status = newStatus;
      opening = true;
      // Store the address to which the transport is connected.
      this.remoteAddress = (InetSocketAddress) this.channel.socket().getRemoteSocketAddress();
      // Focus the log now that remoteAddress is known.
      this.setLog(this.log);
      this.log.trace("request open");
      // Schedule the reader task to begin the open operation.
      this.reader.schedule();
      break;
    } while (true);
    // Return whether or not this call caused the transport to begin opening.
    return opening;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runConnected(int status) {
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus & ~CONNECT_READY;
      // Try to clear the connect ready flag;
      // must happen before trying to finish connecting.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The connect ready flag has been cleared.
      status = newStatus;
      break;
    } while (true);

    final boolean connected;
    try {
      // Try to finish connecting the network channel.
      connected = this.channel.finishConnect();
    } catch (ConnectException cause) {
      this.log.infoStatus("failed to establish connection", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (IOException cause) {
      this.log.warningStatus("failed to establish connection", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("failed to establish connection", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    if (connected) {
      // The connection was successfully established.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~STATE_MASK) | OPENING_STATE;
        // Try to transition the transport into the opening state;
        // must happen before initiating any opening handshake.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status != oldStatus) {
          // CAS failed; try again.
          continue;
        }
        // The transport has transitioned into the opening state.
        status = newStatus;
        try {
          // Invoke willOpen callback before performing any opening handshake.
          this.willOpen();
        } catch (IOException cause) {
          this.log.warningStatus("willOpen callback failed", this.socket, cause);
          // Initiate transport close.
          status = this.readerRequestClose(status);
          // Abort and close the socket.
          return status;
        } catch (Throwable cause) {
          if (Result.isFatal(cause)) {
            throw cause;
          }
          this.log.errorStatus("willOpen callback failed", this.socket, cause);
          // Initiate transport close.
          status = this.readerRequestClose(status);
          // Abort and close the socket.
          return status;
        }
        break;
      } while (true);
    } else {
      // The connection operation is still in progress; ask the I/O dispatcher
      // to inform us when the transport is ready to finish connecting.
      this.getTransportContext().requestConnect();
    }

    // Check if the network channel has closed.
    if (!this.channel.isOpen() || (this.channel.socket().isInputShutdown() && this.channel.socket().isOutputShutdown())) {
      // Initiate transport close.
      status = this.readerRequestClose(status);
    } else {
      status = (int) STATUS.getAcquire(this);
    }

    return status;
  }

  protected void willOpen() throws IOException {
    this.log.debugEntity("opening socket", this.socket);

    // Invoke socket lifecycle callback.
    this.socket.willOpen();

    // Immediately finish opening the connection.
    this.requestOpen();
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runOpeningRead(int status) {
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus & ~READ_READY;
      // Try to clear the read ready flag;
      // must happen before performing the read operation.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The read ready flag has been cleared.
      status = newStatus;
      break;
    } while (true);

    try {
      // Invoke opening I/O callback.
      this.doOpeningRead();
    } catch (CancelledKeyException | ClosedChannelException | ClosedSelectorException cause) {
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (IOException cause) {
      this.log.warningStatus("doOpeningRead failed", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("doOpeningRead failed", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    // Check if the network channel has closed.
    if (!this.channel.isOpen() || (this.channel.socket().isInputShutdown() && this.channel.socket().isOutputShutdown())) {
      // Initiate transport close.
      status = this.readerRequestClose(status);
    } else {
      status = (int) STATUS.getAcquire(this);
    }

    return status;
  }

  protected void doOpeningRead() throws IOException {
    // hook
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runOpeningWrite(int status) {
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus & ~WRITE_READY;
      // Try to clear the write ready flag;
      // must happen before performing the write operation.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The write ready flag has been cleared.
      status = newStatus;
      break;
    } while (true);

    try {
      // Invoke opening I/O callback.
      this.doOpeningWrite();
    } catch (CancelledKeyException | ClosedChannelException | ClosedSelectorException cause) {
      // Initiate transport close.
      status = this.writerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (IOException cause) {
      this.log.warningStatus("doOpeningWrite failed", this.socket, cause);
      // Initiate transport close.
      status = this.writerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("doOpeningWrite failed", this.socket, cause);
      // Initiate transport close.
      status = this.writerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    // Check if the network channel has closed.
    if (!this.channel.isOpen() || (this.channel.socket().isInputShutdown() && this.channel.socket().isOutputShutdown())) {
      // Initiate transport close.
      status = this.writerRequestClose(status);
    } else {
      status = (int) STATUS.getAcquire(this);
    }

    return status;
  }

  protected void doOpeningWrite() throws IOException {
    // hook
  }

  protected void requestOpen() {
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & OPEN_REQUEST) != 0) {
        // The transport has already been requested to finish opening.
        break;
      }
      // The transport has not been requested to finish opening.
      final int oldStatus = status;
      final int newStatus = oldStatus | OPEN_REQUEST;
      // Try to set the open request flag;
      // must happen before scheduling the reader task.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The open request flag has been set.
      status = newStatus;
      this.log.trace("request open");
      // Schedule the reader task to finish the opening operation.
      this.reader.schedule();
      break;
    } while (true);
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runOpen(int status) {
    do {
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~(STATE_MASK | OPEN_REQUEST)) | OPENED_STATE;
      // Try to transition the transport into the opened state, clearing the open request flag;
      // must happen before finishing the open operation.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The transport has transitioned into the opened state.
      status = newStatus;
      try {
        // Invoke didOpen callback now that any opening handshake has been completed.
        this.didOpen();
      } catch (IOException cause) {
        this.log.warningStatus("didOpen callback failed", this.socket, cause);
        // Initiate transport close.
        status = this.readerRequestClose(status);
        // Abort and close the socket.
        return status;
      } catch (Throwable cause) {
        if (Result.isFatal(cause)) {
          throw cause;
        }
        this.log.errorStatus("didOpen callback failed", this.socket, cause);
        // Initiate transport close.
        status = this.readerRequestClose(status);
        // Abort and close the socket.
        return status;
      }
      // Schedule any pending read request.
      if ((oldStatus & READ_REQUEST) != 0) {
        this.getTransportContext().requestRead();
      }
      // Schedule any pending write request.
      if ((oldStatus & WRITE_REQUEST) != 0) {
        this.getTransportContext().requestWrite();
      }
      // Done opening the socket.
      break;
    } while (true);

    // Check if the network channel has closed.
    if (!this.channel.isOpen() || (this.channel.socket().isInputShutdown() && this.channel.socket().isOutputShutdown())) {
      // Initiate transport close.
      status = this.readerRequestClose(status);
    } else {
      status = (int) STATUS.getAcquire(this);
    }

    return status;
  }

  protected void didOpen() throws IOException {
    this.log.infoConfig("opened socket", this);

    // Invoke socket lifecycle callback.
    this.socket.didOpen();
  }

  @Override
  public void become(NetSocket socket) {
    Objects.requireNonNull(socket);
    int status = (int) STATUS.getOpaque(this);
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus | BECOME_REQUEST;
      // Try to set the become request flag; must happen before
      // assigning the becoming socket and scheduling the reader task.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The become request flag has been set.
      status = newStatus;
      // Store the new socket type to become.
      this.becoming = socket;
      this.log.debugEntity("request become", socket);
      // Schedule the reader task to become the new socket type.
      this.reader.schedule();
      break;
    } while (true);
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runBecome(int status) {
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus & ~BECOME_REQUEST;
      // Try to clear the become request flag;
      // must happen before becoming the new socket.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The become request flag has been cleared.
      status = newStatus;
      break;
    } while (true);

    final NetSocket oldSocket = this.socket;
    final NetSocket newSocket = this.becoming;
    if (newSocket == null) {
      this.log.errorStatus("tried to become null socket", oldSocket);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } else if (newSocket == oldSocket) {
      // No change to the socket.
      return status;
    }

    try {
      // Invoke willBecome callback before becoming the new socket.
      this.willBecome(newSocket, oldSocket);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("willBecome callback failed", oldSocket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    // Become the new socket.
    this.socket = newSocket;
    this.becoming = null;
    newSocket.setSocketContext(this);

    // Tell the new socket it's connected.
    try {
      newSocket.didOpen();
    } catch (IOException cause) {
      this.log.warningStatus("didOpen callback failed", newSocket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("didOpen callback failed", newSocket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    try {
      // Invoke didBecome callback after becoming the new socket.
      this.didBecome(newSocket, oldSocket);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("didBecome callback failed", oldSocket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    // Check if the network channel has closed.
    if (!this.channel.isOpen() || (this.channel.socket().isInputShutdown() && this.channel.socket().isOutputShutdown())) {
      // Initiate transport close.
      status = this.readerRequestClose(status);
    }

    return status;
  }

  protected void willBecome(NetSocket newSocket, NetSocket oldSocket) {
    this.log.debugEntity("becoming socket", newSocket);

    // Tell the old socket that the transport will become the new socket.
    oldSocket.willBecome(newSocket);
  }

  protected void didBecome(NetSocket newSocket, NetSocket oldSocket) {
    this.log.traceEntity("became socket", newSocket);

    // Tell the old socket that the transport has become the new socket.
    oldSocket.didBecome(newSocket);
  }

  @Override
  public boolean requestRead() {
    final boolean requested;
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & READ_REQUEST) != 0) {
        // The transport already has a pending read request.
        requested = false;
        break;
      }
      // The transport does not have a pending read request.
      final int oldStatus = status;
      final int newStatus = oldStatus | READ_REQUEST;
      // Try to set the read request flag;
      // must happen before requesting the I/O event.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The read request flag has been set.
      status = newStatus;
      requested = true;
      this.log.trace("request read");
      final TransportContext context = this.context;
      if (context != null && (status & CONNECTED) != 0) {
        // Only schedule reads when the transport is in the connected state.
        context.requestRead();
      } else {
        // Non-connected read requests will be scheduled once connected.
      }
      break;
    } while (true);
    return requested;
  }

  @Override
  public boolean cancelRead() {
    final boolean cancelled;
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & READ_REQUEST) == 0) {
        // The transport does not have a pending read request.
        cancelled = false;
        break;
      }
      // The transport has a pending read request.
      final int oldStatus = status;
      final int newStatus = oldStatus & ~READ_REQUEST;
      // Try to clear the read request flag;
      // must happen before cancelling the I/O event.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The read request flag has been cleared.
      status = newStatus;
      cancelled = true;
      this.log.trace("cancel read");
      final TransportContext context = this.context;
      if (context != null && (status & CONNECTED) != 0) {
        // Only cancel reads when the transport is in the connected state.
        context.cancelRead();
      }
      break;
    } while (true);
    return cancelled;
  }

  @Override
  public boolean triggerRead() {
    final boolean triggered;
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & READ_READY) != 0) {
        // The transport is already awaiting a read.
        triggered = false;
        break;
      }
      // The transport is not currently awaiting a read.
      final int oldStatus = status;
      final int newStatus = oldStatus | READ_READY;
      // Try to set the read ready flag;
      // must happen before scheduling the reader task.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The read ready flag has been set.
      status = newStatus;
      triggered = true;
      this.log.trace("trigger read");
      // Schedule the reader task to perform the read.
      this.reader.schedule();
      break;
    } while (true);
    return triggered;
  }

  @Override
  public void dispatchRead() {
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & READ_READY) != 0) {
        // The transport is already awaiting a read.
        break;
      }
      // The transport is not currently awaiting a read.
      final int oldStatus = status;
      final int newStatus = oldStatus | READ_READY;
      // Try to set the read ready flag;
      // must happen before scheduling the reader task.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The read ready flag has been set.
      status = newStatus;
      this.log.trace("ready to read");
      // Schedule the reader task to perform the read.
      this.reader.schedule();
      break;
    } while (true);
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runRead(int status) {
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus & ~(READ_REQUEST | READ_READY);
      // Try to clear the read request and read ready flags;
      // must happen before performing the read operation.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The read ready flag has been cleared.
      status = newStatus;
      break;
    } while (true);

    try {
      // Invoke I/O callback.
      this.doRead();
    } catch (CancelledKeyException | ClosedChannelException | ClosedSelectorException cause) {
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (IOException cause) {
      this.log.warningStatus("doRead failed", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("doRead failed", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    // Check if the network channel has closed.
    if (!this.channel.isOpen() || (this.channel.socket().isInputShutdown() && this.channel.socket().isOutputShutdown())) {
      // Initiate transport close.
      status = this.readerRequestClose(status);
    } else {
      status = (int) STATUS.getAcquire(this);
    }

    return status;
  }

  protected void doRead() throws IOException {
    // Invoke socket I/O callback.
    this.socket.doRead();
  }

  @Override
  public int read(ByteBuffer readBuffer) throws IOException {
    return this.channel.read(readBuffer);
  }

  @Override
  public boolean requestWrite() {
    final boolean requested;
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & WRITE_REQUEST) != 0) {
        // The transport already has a pending write request.
        requested = false;
        break;
      }
      // The transport does not have a pending write request.
      final int oldStatus = status;
      final int newStatus = oldStatus | WRITE_REQUEST;
      // Try to set the write request flag;
      // must happen before requesting the I/O event.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The write request flag has been set.
      status = newStatus;
      requested = true;
      this.log.trace("request write");
      final TransportContext context = this.context;
      if (context != null && (status & CONNECTED) != 0) {
        // Only schedule writes when the transport is in the connected state.
        context.requestWrite();
      } else {
        // Non-connected write requests will be scheduled once connected.
      }
      break;
    } while (true);
    return requested;
  }

  @Override
  public boolean cancelWrite() {
    final boolean cancelled;
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & WRITE_REQUEST) == 0) {
        // The transport does not have a pending write request.
        cancelled = false;
        break;
      }
      // The transport has a pending write request.
      final int oldStatus = status;
      final int newStatus = oldStatus & ~WRITE_REQUEST;
      // Try to clear the write request flag;
      // must happen before cancelling the I/O event.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The write request flag has been cleared.
      status = newStatus;
      cancelled = true;
      this.log.trace("cancel write");
      final TransportContext context = this.context;
      if (context != null && (status & CONNECTED) != 0) {
        // Only cancel writes when the transport is in the connected state.
        context.cancelWrite();
      }
      break;
    } while (true);
    return cancelled;
  }

  @Override
  public boolean triggerWrite() {
    final boolean triggered;
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & WRITE_READY) != 0) {
        // The transport is already awaiting a write.
        triggered = false;
        break;
      }
      // The transport is not currently awaiting a write.
      final int oldStatus = status;
      final int newStatus = oldStatus | WRITE_READY;
      // Try to set the write ready flag
      // must happen before scheduling the writer task.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The write ready flag has been set.
      status = newStatus;
      triggered = true;
      this.log.trace("trigger write");
      // Schedule the writer task to perform the operation.
      this.writer.schedule();
      break;
    } while (true);
    return triggered;
  }

  @Override
  public void dispatchWrite() {
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & WRITE_READY) != 0) {
        // The transport is already awaiting a write.
        break;
      }
      // The transport is not currently awaiting a write.
      final int oldStatus = status;
      final int newStatus = oldStatus | WRITE_READY;
      // Try to set the write ready flag
      // must happen before scheduling the writer task.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The write ready flag has been set.
      status = newStatus;
      this.log.trace("ready to write");
      // Schedule the writer task to perform the operation.
      this.writer.schedule();
      break;
    } while (true);
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runWrite(int status) {
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus & ~(WRITE_REQUEST | WRITE_READY);
      // Try to clear the write request and write ready flags;
      // must happen before performing the write operation.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The write ready flag has been cleared.
      status = newStatus;
      break;
    } while (true);

    try {
      // Invoke I/O callback.
      this.doWrite();
    } catch (CancelledKeyException | ClosedChannelException | ClosedSelectorException cause) {
      // Initiate transport close.
      status = this.writerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (IOException cause) {
      this.log.warningStatus("doWrite failed", this.socket, cause);
      // Initiate transport close.
      status = this.writerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("doWrite failed", this.socket, cause);
      // Initiate transport close.
      status = this.writerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    // Check if the network channel has closed.
    if (!this.channel.isOpen() || (this.channel.socket().isInputShutdown() && this.channel.socket().isOutputShutdown())) {
      // Initiate transport close.
      status = this.writerRequestClose(status);
    } else {
      status = (int) STATUS.getAcquire(this);
    }

    return status;
  }

  protected void doWrite() throws IOException {
    // Invoke socket I/O callback.
    this.socket.doWrite();
  }

  @Override
  public int write(ByteBuffer writeBuffer) throws IOException {
    return this.channel.write(writeBuffer);
  }

  @Override
  public void dispatchTimeout() {
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & TIMEOUT_REQUEST) != 0) {
        // The transport already has a pending timeout request.
        break;
      }
      // The transport does not have a pending timeout request.
      final int oldStatus = status;
      final int newStatus = oldStatus | TIMEOUT_REQUEST;
      // Try to set the timeout request flag;
      // must happen before scheduling the reader task.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The timeout request flag has been set.
      status = newStatus;
      this.log.trace("transport timed out");
      // Schedule the reader task to execute the timeout.
      this.reader.schedule();
      break;
    } while (true);
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runTimeout(int status) {
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus & ~TIMEOUT_REQUEST;
      // Try to clear the timeout request flag;
      // must happen before timing out the socket.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The timeout request flag has been cleared.
      status = newStatus;
      break;
    } while (true);

    try {
      // Invoke I/O callback.
      this.doTimeout();
    } catch (IOException cause) {
      this.log.warningStatus("doTimeout failed", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("doTimeout failed", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    // Check if the network channel has closed.
    if (!this.channel.isOpen() || (this.channel.socket().isInputShutdown() && this.channel.socket().isOutputShutdown())) {
      // Initiate transport close.
      status = this.readerRequestClose(status);
    } else {
      status = (int) STATUS.getAcquire(this);
    }

    return status;
  }

  protected void doTimeout() throws IOException {
    // Invoke socket I/O callback.
    this.socket.doTimeout();
  }

  @Override
  public final boolean isDoneReading() {
    final int status = (int) STATUS.getAcquire(this);
    return (status & DONE_READING) != 0;
  }

  @Override
  public boolean doneReading() {
    final boolean closed;
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & (CONNECTED | DONE_READING)) != CONNECTED) {
        // The transport is not connected, or is already closed for reading.
        closed = false;
        break;
      }
      // The transport is connected and open for reading.
      final int oldStatus = status;
      final int newStatus = oldStatus | (DONE_READING | CLOSE_INBOUND_REQUEST);
      // Try to close the socket for reading, and request that the transport
      // close its inbound stream; must happen before scheduling the reader task.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The socket has been closed for reading, and the transport
      // has been requested to close its inbound stream.
      status = newStatus;
      closed = true;
      this.log.trace("request close inbound");
      // Schedule the reader task to perform the inbound close.
      this.reader.schedule();
      break;
    } while (true);
    // Return whether or not this call caused the socket to close for reading.
    return closed;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runCloseInbound(int status) {
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus & ~CLOSE_INBOUND_REQUEST;
      // Try to clear the close inbound request flag;
      // must happen before closing the inbound transport stream.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The close inbound request flag has been cleared.
      status = newStatus;
      break;
    } while (true);

    try {
      // Invoke lifecycle callback.
      this.doCloseInbound();
    } catch (CancelledKeyException | ClosedChannelException | ClosedSelectorException cause) {
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (IOException cause) {
      this.log.warningStatus("doCloseInbound failed", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("doCloseInbound failed", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    // Check if the network channel has closed.
    if (!this.channel.isOpen() || (this.channel.socket().isInputShutdown() && this.channel.socket().isOutputShutdown())) {
      // Initiate transport close.
      status = this.readerRequestClose(status);
    } else {
      status = (int) STATUS.getAcquire(this);
    }

    return status;
  }

  protected void doCloseInbound() throws IOException {
    this.log.debugEntity("close inbound", this.socket);

    this.channel.shutdownInput();
  }

  @Override
  public final boolean isDoneWriting() {
    final int status = (int) STATUS.getAcquire(this);
    return (status & DONE_WRITING) != 0;
  }

  @Override
  public boolean doneWriting() {
    final boolean closed;
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & (CONNECTED | DONE_WRITING)) != CONNECTED) {
        // The transport is not connected, or is already closed for writing.
        closed = false;
        break;
      }
      // The transport is connected and open for writing.
      final int oldStatus = status;
      final int newStatus = oldStatus | (DONE_WRITING | CLOSE_OUTBOUND_REQUEST);
      // Try to close the socket for writing, and request that the transport
      // close its outbound stream; must happen before scheduling the writer task.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The socket has been closed for writing, and the transport
      // has been requested to close its outbound stream.
      status = newStatus;
      closed = true;
      this.log.trace("request close outbound");
      // Schedule the writer task to perform the outbound close.
      this.writer.schedule();
      break;
    } while (true);
    // Return whether or not this call caused the socket to close for writing.
    return closed;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runCloseOutbound(int status) {
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus & ~CLOSE_OUTBOUND_REQUEST;
      // Try to clear the close outbound request flag;
      // must happen before closing the outbound transport stream.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The close outbound request flag has been cleared.
      status = newStatus;
      break;
    } while (true);

    try {
      // Invoke lifecycle callback.
      this.doCloseOutbound();
    } catch (CancelledKeyException | ClosedChannelException | ClosedSelectorException cause) {
      // Initiate transport close.
      status = this.writerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (IOException cause) {
      this.log.warningStatus("doCloseOutbound failed", this.socket, cause);
      // Initiate transport close.
      status = this.writerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("doCloseOutbound failed", this.socket, cause);
      // Initiate transport close.
      status = this.writerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    // Check if the network channel has closed.
    if (!this.channel.isOpen() || (this.channel.socket().isInputShutdown() && this.channel.socket().isOutputShutdown())) {
      // Initiate transport close.
      status = this.writerRequestClose(status);
    } else {
      status = (int) STATUS.getAcquire(this);
    }

    return status;
  }

  protected void doCloseOutbound() throws IOException {
    this.log.debugEntity("close outbound", this.socket);

    // Transmit any previously written application data,
    // followed by TCP's normal termination sequence.
    this.channel.shutdownOutput();
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runClosingRead(int status) {
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus & ~READ_READY;
      // Try to clear the read ready flag;
      // must happen before performing the closing read.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The read ready flag has been cleared.
      status = newStatus;
      break;
    } while (true);

    try {
      // Invoke close I/O callback.
      this.doClosingRead();
    } catch (CancelledKeyException | ClosedChannelException | ClosedSelectorException cause) {
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (IOException cause) {
      this.log.warningStatus("doClosingRead failed", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("doClosingRead failed", this.socket, cause);
      // Initiate transport close.
      status = this.readerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    // Check if the network channel has closed.
    if (!this.channel.isOpen() || (this.channel.socket().isInputShutdown() && this.channel.socket().isOutputShutdown())) {
      // Initiate transport close.
      status = this.readerRequestClose(status);
    } else {
      status = (int) STATUS.getAcquire(this);
    }

    return status;
  }

  protected void doClosingRead() throws IOException {
    final ByteBuffer recvBuffer = ByteBuffer.allocateDirect(1024);
    do {
      final int count = this.channel.read(recvBuffer);
      if (count > 0) {
        recvBuffer.clear();
        continue;
      } else if (count == 0) {
        this.getTransportContext().requestRead();
      } else {
        this.channel.shutdownInput();
      }
      break;
    } while (true);
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runClosingWrite(int status) {
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus & ~WRITE_READY;
      // Try to clear the write ready flag
      // must happen before performing the closing write.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The write ready flag has been cleared.
      status = newStatus;
      break;
    } while (true);

    try {
      // Invoke close I/O callback.
      this.doClosingWrite();
    } catch (CancelledKeyException | ClosedChannelException | ClosedSelectorException cause) {
      // Initiate transport close.
      status = this.writerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (IOException cause) {
      this.log.warningStatus("doClosingWrite failed", this.socket, cause);
      // Initiate transport close.
      status = this.writerRequestClose(status);
      // Abort and close the socket.
      return status;
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("doClosingWrite failed", this.socket, cause);
      // Initiate transport close.
      status = this.writerRequestClose(status);
      // Abort and close the socket.
      return status;
    }

    // Check if the network channel has closed.
    if (!this.channel.isOpen() || (this.channel.socket().isInputShutdown() && this.channel.socket().isOutputShutdown())) {
      // Initiate transport close.
      status = this.writerRequestClose(status);
    } else {
      status = (int) STATUS.getAcquire(this);
    }

    return status;
  }

  protected void doClosingWrite() throws IOException {
    // hook
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int readerRequestClose(int status) {
    // Request socket close; must only be called from the reader task.
    do {
      if ((status & CLOSE_REQUEST) != 0) {
        // The transport already has a pending close request.
        break;
      }
      // The transport does not have a pending close request.
      final int oldStatus = status;
      final int newStatus = oldStatus | CLOSE_REQUEST;
      // Try to request socket close; must happen before continuing.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The transport has transitioned into the closing state.
      status = newStatus;
      this.log.trace("request close");
      break;
    } while (true);
    return status;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int writerRequestClose(int status) {
    // Request socket close; must only be called from the writer task.
    do {
      if ((status & CLOSE_REQUEST) != 0) {
        // The transport already has a pending close request.
        break;
      }
      // The transport does not have a pending close request.
      final int oldStatus = status;
      final int newStatus = oldStatus | CLOSE_REQUEST;
      // Try to request socket close; must happen before continuing.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The transport has transitioned into the closing state.
      status = newStatus;
      this.log.trace("request close");
      // Schedule the reader task to perform the close.
      this.reader.schedule();
      break;
    } while (true);
    return status;
  }

  @Override
  public void dispatchClose() {
    this.log.trace("transport closed");
    this.close();
  }

  @Override
  public void close() {
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & CLOSE_REQUEST) != 0) {
        // The transport already has a pending close request.
        break;
      }
      // The transport does not have a pending close request.
      final int oldStatus = status;
      final int newStatus = oldStatus | CLOSE_REQUEST;
      // Try to request socket close;
      // must happen before scheduling the reader task.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The transport has been requested to close.
      status = newStatus;
      this.log.trace("request close");
      // Schedule the reader task to perform the close.
      this.reader.schedule();
      break;
    } while (true);
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runClose(int status) {
    try {
      // Invoke willClose callback before closing the network channel.
      this.willClose();
    } catch (IOException cause) {
      this.log.warningStatus("willClose callback failed", this.socket, cause);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("willClose callback failed", this.socket, cause);
    }

    try {
      // Cancel I/O scheduling for the network channel.
      this.getTransportContext().cancel();
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("failed to cancel transport", this.socket, cause);
    }

    try {
      // Close the network channel.
      this.channel.close();
    } catch (IOException cause) {
      this.log.warningStatus("failed to close channel", this.socket, cause);
    }

    do {
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~(STATE_MASK | CLOSE_REQUEST)) | CLOSED_STATE;
      // Try to transition the transport into the closed state;
      // must happen after closing the network channel.
      status = (int) STATUS.compareAndExchangeRelease(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      // The transport has transitioned into the closed state.
      status = newStatus;
      break;
    } while (true);

    try {
      // Invoke didClose callback now that the network channel has been closed.
      this.didClose();
    } catch (IOException cause) {
      this.log.warningStatus("didClose callback failed", this.socket, cause);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("didClose callback failed", this.socket, cause);
    }
    status = (int) STATUS.getAcquire(this);

    return status;
  }

  protected void willClose() throws IOException {
    this.log.debugEntity("closing socket", this.socket);

    // Invoke socket lifecycle callback.
    this.socket.willClose();
  }

  protected void didClose() throws IOException {
    this.log.info("closed socket");

    // Invoke socket lifecycle callback.
    this.socket.didClose();
  }

  @Override
  public @Nullable Object toLogEntity(Severity level) {
    final Socket socket = this.channel.socket();
    final TupleRepr detail = TupleRepr.of();
    try {
      detail.put("localAddress", Repr.from(socket.getLocalSocketAddress()));
    } catch (ReprException cause) {
      // ignore
    }
    try {
      detail.put("remoteAddress", Repr.from(this.remoteAddress));
    } catch (ReprException cause) {
      // ignore
    }
    return detail;
  }

  @Override
  public @Nullable Object toLogConfig(Severity level) {
    final Socket socket = this.channel.socket();
    final TupleRepr detail = TupleRepr.of();
    try {
      detail.put("localAddress", Repr.from(socket.getLocalSocketAddress()));
    } catch (ReprException cause) {
      // ignore
    }
    try {
      detail.put("remoteAddress", Repr.from(this.remoteAddress));
    } catch (ReprException cause) {
      // ignore
    }
    try {
      detail.put("recvBufferSize", Repr.of(socket.getReceiveBufferSize()));
    } catch (SocketException cause) {
      // ignore
    }
    try {
      detail.put("sendBufferSize", Repr.of(socket.getSendBufferSize()));
    } catch (SocketException cause) {
      // ignore
    }
    try {
      detail.put("keepAlive", Repr.of(socket.getKeepAlive()));
    } catch (SocketException cause) {
      // ignore
    }
    try {
      detail.put("noDelay", Repr.of(socket.getTcpNoDelay()));
    } catch (SocketException cause) {
      // ignore
    }
    return detail;
  }

  @Override
  public @Nullable Object toLogStatus(Severity level) {
    final Socket socket = this.channel.socket();
    final TupleRepr detail = TupleRepr.of();
    try {
      detail.put("localAddress", Repr.from(socket.getLocalSocketAddress()));
    } catch (ReprException cause) {
      // ignore
    }
    try {
      detail.put("remoteAddress", Repr.from(this.remoteAddress));
    } catch (ReprException cause) {
      // ignore
    }
    if (this.channel.isConnectionPending()) {
      detail.put("connecting", Repr.of(true));
    }
    if (socket.isConnected()) {
      detail.put("connected", Repr.of(true));
    }
    if (socket.isInputShutdown()) {
      detail.put("doneReading", Repr.of(true));
    }
    if (socket.isOutputShutdown()) {
      detail.put("doneWriting", Repr.of(true));
    }
    if (socket.isClosed()) {
      detail.put("closed", Repr.of(true));
    }
    return detail;
  }

  /**
   * {@link #status} bit indicating whether the socket represents an accepted
   * server-side connection.
   */
  static final int ACCEPTED = 1 << 0;

  /**
   * {@link #status} bit indicating that the socket is still connecting.
   */
  static final int CONNECTING = 1 << 1;

  /**
   * {@link #status} bit indicating that the socket is currently connected.
   */
  static final int CONNECTED = 1 << 2;

  /**
   * {@link #status} bit indicating that the socket will no longer read
   * application data. The {@code DONE_READING} bit must never be cleared,
   * once set.
   */
  static final int DONE_READING = 1 << 3;

  /**
   * {@link #status} bit indicating that the socket will no longer write
   * application data. The {@code DONE_WRITING} bit must never be cleared,
   * once set.
   */
  static final int DONE_WRITING = 1 << 4;

  /**
   * Bit mask containing all lifecycle bits of the {@link #status} field.
   */
  static final int STATE_MASK = CONNECTING
                              | CONNECTED
                              | DONE_READING
                              | DONE_WRITING;

  /**
   * Bit mask containing the {@link #CONNECTING} and {@link #CONNECTED} bits
   * of the {@link #status} field.
   */
  static final int OPENING_MASK = CONNECTING | CONNECTED;

  /**
   * {@link #status} bit pattern corresponding to the initial socket state.
   */
  static final int INITIAL_STATE = 0;

  /**
   * {@link #status} bit pattern corresponding to the connecting state.
   */
  static final int CONNECTING_STATE = CONNECTING;

  /**
   * {@link #status} bit pattern corresponding to the opening state.
   */
  static final int OPENING_STATE = CONNECTING | CONNECTED;

  /**
   * {@link #status} bit pattern corresponding to the opened state.
   */
  static final int OPENED_STATE = CONNECTED;

  /**
   * {@link #status} bit pattern corresponding to the closing state.
   */
  static final int CLOSING_STATE = CONNECTED
                                 | DONE_READING
                                 | DONE_WRITING;

  /**
   * {@link #status} bit pattern corresponding to the closed state.
   */
  static final int CLOSED_STATE = DONE_READING
                                | DONE_WRITING;

  /**
   * {@link #status} bit indicating a request to connect the socket.
   */
  static final int CONNECT_REQUEST = 1 << 5;

  /**
   * {@link #status} bit indicating a request to finish opening the socket.
   */
  static final int OPEN_REQUEST = 1 << 6;

  /**
   * {@link #status} bit indicating a request for the socket to transition
   * to a different implementation.
   */
  static final int BECOME_REQUEST = 1 << 7;

  /**
   * {@link #status} bit indicating a request to read from the socket.
   */
  static final int READ_REQUEST = 1 << 8;

  /**
   * {@link #status} bit indicating a request to write to the socket.
   */
  static final int WRITE_REQUEST = 1 << 9;

  /**
   * {@link #status} bit indicating the socket has timed out due to inactivity.
   */
  static final int TIMEOUT_REQUEST = 1 << 10;

  /**
   * {@link #status} bit indicating a request to close the socket for reading.
   */
  static final int CLOSE_INBOUND_REQUEST = 1 << 11;

  /**
   * {@link #status} bit indicating a request to close the socket for writing.
   */
  static final int CLOSE_OUTBOUND_REQUEST = 1 << 12;

  /**
   * {@link #status} bit indicating a request to close the socket.
   */
  static final int CLOSE_REQUEST = 1 << 13;

  /**
   * {@link #status} bit indicating the network channel is ready to complete
   * a connect operation.
   */
  static final int CONNECT_READY = 1 << 14;

  /**
   * {@link #status} bit indicating the network channel is ready to perform
   * a read operation.
   */
  static final int READ_READY = 1 << 15;

  /**
   * {@link #status} bit indicating the network channel is ready to perform
   * a write operation.
   */
  static final int WRITE_READY = 1 << 16;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      STATUS = lookup.findVarHandle(TcpSocket.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}

final class TcpReader extends AbstractTask {

  final TcpSocket transport;

  TcpReader(TcpSocket transport) {
    this.transport = transport;
  }

  @Override
  public void run() {
    LogScope.reset();
    try {
      LogScope.push(this.transport.protocol());
      // Load the current socket status.
      int status = (int) TcpSocket.STATUS.getOpaque(this.transport);
      // Loop while there are reader operations to perform.
      do {
        if ((status & TcpSocket.CLOSE_REQUEST) != 0) {
          LogScope.push("close");
          try {
            status = this.transport.runClose(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & TcpSocket.CONNECT_REQUEST) != 0) {
          assert (status & TcpSocket.OPENING_MASK) == 0;
          LogScope.push("connect");
          try {
            status = this.transport.runConnect(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & TcpSocket.CONNECT_READY) != 0) {
          assert (status & TcpSocket.OPENING_MASK) == TcpSocket.CONNECTING;
          LogScope.push("connected");
          try {
            status = this.transport.runConnected(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & TcpSocket.OPEN_REQUEST) != 0) {
          assert (status & TcpSocket.OPENING_MASK) == TcpSocket.OPENING_MASK;
          LogScope.push("open");
          try {
            status = this.transport.runOpen(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & (TcpSocket.OPENING_MASK | TcpSocket.READ_READY)) == (TcpSocket.OPENING_MASK | TcpSocket.READ_READY)) {
          LogScope.push("read");
          try {
            status = this.transport.runOpeningRead(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & (TcpSocket.CONNECTED | TcpSocket.BECOME_REQUEST)) == (TcpSocket.CONNECTED | TcpSocket.BECOME_REQUEST)) {
          LogScope.push("become");
          try {
            status = this.transport.runBecome(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & (TcpSocket.CONNECTED | TcpSocket.CLOSE_INBOUND_REQUEST)) == (TcpSocket.CONNECTED | TcpSocket.CLOSE_INBOUND_REQUEST)) {
          LogScope.push("read");
          try {
            status = this.transport.runCloseInbound(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & (TcpSocket.CONNECTED | TcpSocket.DONE_READING | TcpSocket.READ_READY)) == (TcpSocket.CONNECTED | TcpSocket.DONE_READING | TcpSocket.READ_READY)) {
          LogScope.push("read");
          try {
            status = this.transport.runClosingRead(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & (TcpSocket.CONNECTED | TcpSocket.READ_READY)) == (TcpSocket.CONNECTED | TcpSocket.READ_READY)) {
          LogScope.push("read");
          try {
            status = this.transport.runRead(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & (TcpSocket.CONNECTED | TcpSocket.TIMEOUT_REQUEST)) == (TcpSocket.CONNECTED | TcpSocket.TIMEOUT_REQUEST)) {
          LogScope.push("timeout");
          try {
            status = this.transport.runTimeout(status);
            continue;
          } finally {
            LogScope.pop();
          }
        }
        break;
      } while (true);
    } finally {
      LogScope.pop();
    }
  }

}

final class TcpWriter extends AbstractTask {

  final TcpSocket transport;

  TcpWriter(TcpSocket transport) {
    this.transport = transport;
  }

  @Override
  public void run() {
    LogScope.reset();
    try {
      LogScope.push(this.transport.protocol());
      // Load the current socket status.
      int status = (int) TcpSocket.STATUS.getOpaque(this.transport);
      // Loop while there are writer operations to perform.
      do {
        if ((status & (TcpSocket.OPENING_MASK | TcpSocket.WRITE_READY)) == (TcpSocket.OPENING_MASK | TcpSocket.WRITE_READY)) {
          LogScope.push("write");
          try {
            status = this.transport.runOpeningWrite(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & (TcpSocket.CONNECTED | TcpSocket.CLOSE_OUTBOUND_REQUEST)) == (TcpSocket.CONNECTED | TcpSocket.CLOSE_OUTBOUND_REQUEST)) {
          LogScope.push("write");
          try {
            status = this.transport.runCloseOutbound(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & (TcpSocket.CONNECTED | TcpSocket.DONE_WRITING | TcpSocket.WRITE_READY)) == (TcpSocket.CONNECTED | TcpSocket.DONE_WRITING | TcpSocket.WRITE_READY)) {
          LogScope.push("write");
          try {
            status = this.transport.runClosingWrite(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & (TcpSocket.CONNECTED | TcpSocket.WRITE_READY)) == (TcpSocket.CONNECTED | TcpSocket.WRITE_READY)) {
          LogScope.push("write");
          try {
            status = this.transport.runWrite(status);
            continue;
          } finally {
            LogScope.pop();
          }
        }
        break;
      } while (true);
    } finally {
      LogScope.pop();
    }
  }

}
