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
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.SocketException;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Objects;
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
import swim.repr.TupleRepr;
import swim.util.Result;
import swim.util.Severity;

@Public
@Since("5.0")
public class TcpListener implements Transport, NetListenerContext, LogEntity, LogConfig, LogStatus {

  /**
   * NIO server socket channel used to accept incoming connections.
   */
  protected final ServerSocketChannel channel;

  /**
   * Network listener on which to invoke I/O and lifecycle callbacks.
   */
  protected NetListener listener;

  /**
   * TCP options used to configure accepted connections.
   */
  protected TcpOptions tcpOptions;

  /**
   * Network transport used to request I/O readiness callbacks.
   */
  protected @Nullable TransportContext context;

  /**
   * Execution context in which to run I/O tasks.
   */
  protected @Nullable Scheduler scheduler;

  /**
   * IP address and port to which the network listener should bind.
   */
  protected @Nullable InetSocketAddress localAddress;

  /**
   * Atomic bit field containing listener state in {@link #STATE_MASK}.
   */
  volatile int status;

  /**
   * Transport lifecycle and error log.
   */
  Log log;

  /**
   * Task from which to perform sequenced I/O and lifecycle operations.
   */
  final TcpAcceptor acceptor;

  public TcpListener(ServerSocketChannel channel, NetListener listener, TcpOptions tcpOptions) {
    // Initialize transport parameters.
    this.channel = channel;
    this.listener = listener;
    this.tcpOptions = tcpOptions;

    // Initialize transport context.
    this.context = null;
    this.scheduler = null;
    this.localAddress = (InetSocketAddress) channel.socket().getLocalSocketAddress();

    // Initialize transport status.
    this.status = 0;

    // Initialize the transport log.
    this.log = this.initLog();

    // Initialize the acceptor task.
    this.acceptor = new TcpAcceptor(this);
  }

  public Log log() {
    return this.log;
  }

  protected String logFocus() {
    if (this.localAddress != null) {
      return TcpEndpoint.endpointAddress(this.localAddress);
    }
    return "";
  }

  protected Log initLog() {
    return Log.forTopic("swim.net.tcp.listener").withFocus(this.logFocus());
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
      throw new IllegalStateException("Unbound transport");
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
      scheduler.bindTask(this.acceptor);
    }
  }

  @Override
  public final ServerSocketChannel channel() {
    return this.channel;
  }

  @Override
  public final NetListener listener() {
    return this.listener;
  }

  @Override
  public final long idleTimeout() {
    return 0L; // never timeout
  }

  @Override
  public final @Nullable InetSocketAddress localAddress() {
    return this.localAddress;
  }

  @Override
  public boolean listen(InetSocketAddress localAddress) {
    // Load the current listener status; synchronized by subsequent accesses.
    int status = (int) STATUS.getOpaque(this);
    // Track whether or not this operation causes the listener to open.
    boolean opened = false;
    // Track opening interrupts.
    boolean interrupted = false;
    // Loop while the listener has not been requested to open.
    do {
      if ((status & STATE_MASK) == INITIAL_STATE && (status & (OPEN_REQUEST | CLOSE_REQUEST)) == 0) {
        // The listener has not yet been opened, requested to open, or requested to close.
        final int oldStatus = status;
        final int newStatus = oldStatus | OPEN_REQUEST;
        // Try to request listener open, synchronizing with concurrent status updates.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        // Check if we succeeded at requesting listener open.
        if (status == oldStatus) {
          // This operation caused the opening of the listener.
          status = newStatus;
          opened = true;
          // Store the address to which the listener should bind.
          this.localAddress = localAddress;
          // Focus the log now that localAddress is known.
          this.setLog(this.log);
          this.log.trace("request open");
          // Schedule the acceptor task to perform the open operation.
          this.acceptor.schedule();
          // Continue opening sequence.
          continue;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else if ((status & STATE_MASK) == INITIAL_STATE || (status & STATE_MASK) == OPENING_STATE) {
        // The listener is concurrently opening;
        // loop until the concurrent operation is complete.
        do {
          // Prepare to wait for the concurrent operation to complete.
          synchronized (this) {
            // Re-check listener status before waiting,
            // synchronized by monitor barrier.
            status = (int) STATUS.getOpaque(this);
            // Ensure the concurrent operation is still ongoing before waiting.
            if ((status & STATE_MASK) == OPENING_STATE) {
              try {
                this.wait(100L);
              } catch (InterruptedException e) {
                // Defer thread interrupt.
                interrupted = true;
              }
            } else {
              // The concurrent operation has completed.
              break;
            }
          }
        } while (true);
        // Re-check listener status.
        status = (int) STATUS.getOpaque(this);
        // Continue opening sequence.
        continue;
      } else {
        // The listener has already been opened, or requested to open.
        break;
      }
    } while (true);
    if (interrupted) {
      // Resume thread interrupt that occurred during listener open.
      Thread.currentThread().interrupt();
    }
    // Return whether or not this operation caused the listener to open.
    return opened;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runOpen(int status) {
    // Loop while the listener has not entered the opening state.
    do {
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~(STATE_MASK | OPEN_REQUEST)) | OPENING_STATE;
      // Try to initiate listener opening, synchronizing with concurrent status updates.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      // Check if we succeeded at transitioning into the opening state.
      if (status == oldStatus) {
        // The listener has transitioned into the opening state.
        status = newStatus;
        try {
          // Invoke lifecycle callback.
          this.willListen();
        } catch (IOException cause) {
          // Report the exception.
          this.log.warningStatus("willListen callback failed", this.listener, cause);
        } catch (Throwable cause) {
          if (Result.isNonFatal(cause)) {
            // Report non-fatal exception.
            this.log.errorStatus("willListen callback failed", this.listener, cause);
          } else {
            // Rethrow fatal exception.
            throw cause;
          }
        }
        // Continue opening the listener.
        break;
      } else {
        // CAS failed; try again.
        continue;
      }
    } while (true);

    // Bind the network channel.
    try {
      this.channel.bind(this.localAddress, this.tcpOptions.backlog());
    } catch (IOException cause) {
      // Initiate listener close.
      status = this.acceptorRequestClose(status);
      // Report the exception.
      this.log.warningStatus("failed to bind server socket", this.listener, cause);
      // Continue closing the listener.
      return status;
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Initiate listener close.
        status = this.acceptorRequestClose(status);
        // Report non-fatal exception.
        this.log.errorStatus("failed to bind server socket", this.listener, cause);
        // Continue closing the listener.
        return status;
      } else {
        // Rethrow fatal exception.
        throw cause;
      }
    }

    // Loop while the listener has not entered the opened state.
    do {
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~STATE_MASK) | OPENED_STATE;
      // Try to transition to the opened state, synchronizing with concurrent status updates.
      VarHandle.releaseFence();
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      // Check if we succeeded at transitioning into the opened state.
      if (status == oldStatus) {
        // The listener has transitioned into the opened state.
        status = newStatus;
        try {
          // Invoke lifecycle callback.
          this.didListen();
        } catch (IOException cause) {
          // Report the exception.
          this.log.warningStatus("didListen callback failed", this.listener, cause);
        } catch (Throwable cause) {
          if (Result.isNonFatal(cause)) {
            // Report non-fatal exception.
            this.log.errorStatus("didListen callback failed", this.listener, cause);
          } else {
            // Rethrow fatal exception.
            throw cause;
          }
        }
        // Schedule any pending accept request.
        if ((oldStatus & ACCEPT_REQUEST) != 0) {
          this.getTransportContext().requestAccept();
        }
        // Notify waiting threads of listener open.
        synchronized (this) {
          this.notifyAll();
        }
        // Done opening the listener.
        break;
      } else {
        // CAS failed; try again.
        continue;
      }
    } while (true);

    // Check if the channel has closed.
    if (!this.channel.isOpen()) {
      // Initiate listener close.
      status = this.acceptorRequestClose(status);
    }

    return status;
  }

  protected void willListen() throws IOException {
    this.log.debugEntity("opening listener", this.listener);

    // Invoke listener lifecycle callback.
    this.listener.willListen();
  }

  protected void didListen() throws IOException {
    // Invoke listener lifecycle callback.
    this.listener.didListen();

    this.log.infoConfig("opened listener", this);
  }

  @Override
  public boolean requestAccept() {
    // Load the current listener status; synchronized by subsequent accesses.
    int status = (int) STATUS.getOpaque(this);
    // Loop while the listener does not have a pending accept request.
    do {
      // Check that the listener does not have a pending accept request.
      if ((status & ACCEPT_REQUEST) == 0) {
        // The listener does not have a pending accept request;
        // signal that the listener would like to perform a accept.
        final int oldStatus = status;
        final int newStatus = oldStatus | ACCEPT_REQUEST;
        // Try to set the accept request flag, synchronizing with concurrent status updates.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        // Check if we succeeded at setting the accept request flag.
        if (status == oldStatus) {
          // The accept request flag has been set.
          status = newStatus;
          this.log.trace("request accept");
          final TransportContext context = this.context;
          // Only schedule accepts when the listener is in the opened state.
          if (context != null && (status & STATE_MASK) == OPENED_STATE) {
            // Schedule the accept request with the I/O dispatcher.
            context.requestAccept();
          }
          // Non-opened accept requests will be scheduled once opened.
          return true;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else {
        // An accept request is already pending.
        return false;
      }
    } while (true);
  }

  @Override
  public boolean cancelAccept() {
    // Load the current listener status; synchronized by subsequent accesses.
    int status = (int) STATUS.getOpaque(this);
    // Loop while the listener has a pending accept request.
    do {
      // Check that the listener has a pending accept request.
      if ((status & ACCEPT_REQUEST) != 0) {
        // The listener has a pending accept request; signal that the listener
        // is no longer interested in performing a accept.
        final int oldStatus = status;
        final int newStatus = oldStatus & ~ACCEPT_REQUEST;
        // Try to clear the accept request flag, synchronizing with concurrent status updates.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        // Check if we succeeded at clearing the accept request flag.
        if (status == oldStatus) {
          // The accept request flag has been cleared.
          status = newStatus;
          this.log.trace("cancel accept");
          final TransportContext context = this.context;
          // Only cancel accepts when the listener is in the opened state.
          if (context != null && (status & STATE_MASK) == OPENED_STATE) {
            // Cancel the accept request with the I/O dispatcher.
            context.cancelAccept();
          }
          return true;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else {
        // No accept request is currently pending.
        return false;
      }
    } while (true);
  }

  @Override
  public void dispatchAccept() {
    // Load the current listener status; synchronized by subsequent accesses.
    int status = (int) STATUS.getOpaque(this);
    // Loop while the listener has not been signaled to accept a new connection.
    do {
      // Check that the listener has not been closed, or requested to close.
      if ((status & STATE_MASK) != CLOSED_STATE && (status & STATE_MASK) != CLOSING_STATE
          && (status & CLOSE_REQUEST) == 0) {
        // The listener has not been closed, or requested to close;
        // signal that the network channel is ready to accept a new connection.
        final int oldStatus = status;
        final int newStatus = oldStatus | ACCEPT_READY;
        // Try to set the accept ready flag, synchronizing with concurrent status updates.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        // Check if we succeeded at setting the accept ready flag.
        if (status == oldStatus) {
          // The accept ready flag has been set; schedule the acceptor task
          // to perform the operation.
          status = newStatus;
          this.log.trace("ready to accept");
          this.acceptor.schedule();
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else {
        // The listener has been closed, or requested to close;
        // ignore the accept ready signal.
        break;
      }
    } while (true);
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runAccept(int status) {
    // Loop while the accept ready flag is not cleared.
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus & ~(ACCEPT_REQUEST | ACCEPT_READY);
      // Try to clear the accept ready flag, synchronizing with concurrent status updates.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      // Check if we succeeded at clearing the accept ready flag.
      if (status == oldStatus) {
        // The accept ready flag has been cleared.
        status = newStatus;
        break;
      } else {
        // CAS failed; try again.
        continue;
      }
    } while (true);

    try {
      // Invoke I/O callback.
      this.doAccept();
    } catch (IOException cause) {
      // Report the exception.
      this.log.warningStatus("doAccept failed", this.listener, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report non-fatal exception.
        this.log.errorStatus("doAccept failed", this.listener, cause);
      } else {
        // Rethrow fatal exception.
        throw cause;
      }
    }

    // Check if the channel has closed.
    if (!this.channel.isOpen()) {
      // Initiate listener close.
      status = this.acceptorRequestClose(status);
    }

    return status;
  }

  protected void doAccept() throws IOException {
    // Invoke listener I/O callback.
    this.listener.doAccept();
  }

  @Override
  public @Nullable NetSocketRef accept(NetSocket socket) throws IOException {
    final SocketChannel channel = this.channel.accept();
    channel.configureBlocking(false);
    this.tcpOptions.configure(channel.socket());

    final TcpSocket transport = new TcpSocket(channel, socket);
    transport.setScheduler(this.scheduler);
    this.getTransportContext().dispatcher().bindTransport(transport);
    socket.setSocketContext(transport);

    transport.open();

    this.log.infoEntity("accepted socket", transport);

    return transport;
  }

  @Override
  public void dispatchConnect() {
    this.log.debugStatus("unexpected dispatchConnect", this);
  }

  @Override
  public void dispatchRead() {
    this.log.debugStatus("unexpected dispatchRead", this);
  }

  @Override
  public void dispatchWrite() {
    this.log.debugStatus("unexpected dispatchWrite", this);
  }

  @Override
  public void dispatchTimeout() {
    // nop
  }

  @Override
  public void dispatchClose() {
    this.log.trace("transport closed");
    this.close();
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int acceptorRequestClose(int status) {
    // Request listener close; must only be called from the acceptor task.
    // Loop while the listener has not been closed or requested to close.
    do {
      // Check that the listener has not already been closed, or requested to close.
      if ((status & STATE_MASK) != CLOSED_STATE && (status & STATE_MASK) != CLOSING_STATE
          && (status & CLOSE_REQUEST) == 0) {
        // The listener has not been closed, or requested to close.
        final int oldStatus = status;
        final int newStatus = oldStatus | CLOSE_REQUEST;
        // Try to request listener close, synchronizing with concurrent status updates.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        // Check if we succeeded at requesting listener close.
        if (status == oldStatus) {
          // The listener has been requested to close.
          status = newStatus;
          this.log.trace("request close");
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else {
        // The listener has already been closed, or requested to close.
        break;
      }
    } while (true);
    return status;
  }

  @Override
  public void close() {
    // Load the current listener status; synchronized by subsequent accesses.
    int status = (int) STATUS.getOpaque(this);
    // Loop while the listener has not been closed, or requested to close.
    do {
      // Check if the listener has not yet been closed, or requested to close.
      if ((status & STATE_MASK) != CLOSED_STATE && (status & STATE_MASK) != CLOSING_STATE
          && (status & CLOSE_REQUEST) == 0) {
        // The listener has not yet been requested to close; clear any pending open request.
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~OPEN_REQUEST) | CLOSE_REQUEST;
        // Try to request listener close, synchronizing with concurrent status updates.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        // Check if we succeeded at requesting listener close.
        if (status == oldStatus) {
          // The listener has transitioned into the closing state.
          status = newStatus;
          this.log.trace("request close");
          // Schedule the acceptor task to perform the close operation.
          this.acceptor.schedule();
          // The listener will concurrently close.
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else {
        // The listener has already been closed, or requested to close.
        break;
      }
    } while (true);
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int runClose(int status) {
    // Loop while the listener has not entered the closing state.
    do {
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~(STATE_MASK | CLOSE_REQUEST)) | CLOSING_STATE;
      // Try to transition to the closing state, synchronizing with concurrent status updates.
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      // Check if we succeeded at transitioning into the closing state.
      if (status == oldStatus) {
        // The listener has transitioned into the closing state.
        status = newStatus;
        try {
          // Invoke lifecycle callback.
          this.willClose();
        } catch (IOException cause) {
          // Report the exception.
          this.log.warningStatus("willClose callback failed", this.listener, cause);
        } catch (Throwable cause) {
          if (Result.isNonFatal(cause)) {
            // Report non-fatal exception.
            this.log.errorStatus("willClose callback failed", this.listener, cause);
          } else {
            // Rethrow fatal exception.
            throw cause;
          }
        }
        // Continue closing the listener.
        break;
      } else {
        // CAS failed; try again.
        continue;
      }
    } while (true);

    // Cancel I/O scheduling for the this listener.
    try {
      this.getTransportContext().cancel();
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report non-fatal exception.
        this.log.errorStatus("failed to cancel transport", this.listener, cause);
      } else {
        // Rethrow fatal exception.
        throw cause;
      }
    }
    // Close the network channel.
    try {
      this.channel.close();
    } catch (IOException cause) {
      // Report the exception.
      this.log.warningStatus("failed to close channel", this.listener, cause);
    }

    // Loop while the listener has not entered the closed state.
    do {
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~STATE_MASK) | CLOSED_STATE;
      // Try to transition to the closed state, synchronizing with concurrent status updates.
      VarHandle.releaseFence();
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      // Check if we succeeded at transitioning into the closed state.
      if (status == oldStatus) {
        // The listener has transitioned into the closed state.
        status = newStatus;
        try {
          // Invoke lifecycle callback.
          this.didClose();
        } catch (IOException cause) {
          // Report the exception.
          this.log.warningStatus("willClose callback failed", this.listener, cause);
        } catch (Throwable cause) {
          if (Result.isNonFatal(cause)) {
            // Report non-fatal exception.
            this.log.errorStatus("willClose callback failed", this.listener, cause);
          } else {
            // Rethrow fatal exception.
            throw cause;
          }
        }
        // Notify waiting threads of listener close.
        synchronized (this) {
          this.notifyAll();
        }
        // Done closing the listener.
        break;
      } else {
        // CAS failed; try again.
        continue;
      }
    } while (true);

    return status;
  }

  protected void willClose() throws IOException {
    this.log.debugEntity("closing listener", this.listener);

    // Invoke listener lifecycle callback.
    this.listener.willClose();
  }

  protected void didClose() throws IOException {
    // Invoke listener lifecycle callback.
    this.listener.didClose();

    this.log.info("closed listener");
  }

  @Override
  public @Nullable Object toLogEntity(Severity level) {
    final TupleRepr detail = TupleRepr.of();
    detail.put("localAddress", Repr.from(this.localAddress));
    return detail;
  }

  @Override
  public @Nullable Object toLogConfig(Severity level) {
    final ServerSocket socket = this.channel.socket();
    final TupleRepr detail = TupleRepr.of();
    detail.put("localAddress", Repr.from(this.localAddress));
    try {
      detail.put("reuseAddress", Repr.of(socket.getReuseAddress()));
    } catch (SocketException e) {
      // ignore
    }
    return detail;
  }

  @Override
  public @Nullable Object toLogStatus(Severity level) {
    final ServerSocket socket = this.channel.socket();
    final TupleRepr detail = TupleRepr.of();
    detail.put("localAddress", Repr.from(this.localAddress));
    if (!socket.isBound()) {
      detail.put("bound", Repr.of(false));
    }
    if (socket.isClosed()) {
      detail.put("closed", Repr.of(true));
    }
    return detail;
  }

  /**
   * {@link #status} state indicating that the listener has not yet been bound.
   */
  static final int INITIAL_STATE = 0;

  /**
   * {@link #status} state indicating that the listener is currently being bound.
   */
  static final int OPENING_STATE = 1;

  /**
   * {@link #status} state indicating that the listener is bound.
   */
  static final int OPENED_STATE = 2;

  /**
   * {@link #status} state indicating that the listener is currently closing.
   */
  static final int CLOSING_STATE = 3;

  /**
   * {@link #status} state indicating that the listener has been permanently closed.
   */
  static final int CLOSED_STATE = 4;

  /**
   * Number of bits used by the state sub-field of the {@link #status} field.
   */
  static final int STATE_BITS = 3;

  /**
   * Bit mask for the state sub-field of the {@link #status} field.
   */
  static final int STATE_MASK = (1 << STATE_BITS) - 1;

  /**
   * {@link #status} bit indicating a request to open the listener.
   */
  static final int OPEN_REQUEST = 1 << 3;

  /**
   * {@link #status} bit indicating a request to accept a new connection.
   */
  static final int ACCEPT_REQUEST = 1 << 4;

  /**
   * {@link #status} bit indicating a request to close the listener.
   */
  static final int CLOSE_REQUEST = 1 << 5;

  /**
   * {@link #status} bit indicating the channel is ready to perform
   * an <em>accept</em> operation.
   */
  static final int ACCEPT_READY = 1 << 6;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      STATUS = lookup.findVarHandle(TcpListener.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}

final class TcpAcceptor extends AbstractTask {

  final TcpListener transport;

  TcpAcceptor(TcpListener transport) {
    this.transport = transport;
  }

  @Override
  public void run() {
    LogScope.reset();
    try {
      LogScope.push(this.transport.protocol());
      // Load the current listener status.
      int status = (int) TcpListener.STATUS.getOpaque(this.transport);
      // Loop while there are operations to perform.
      do {
        if ((status & TcpListener.CLOSE_REQUEST) != 0) {
          LogScope.push("unbind");
          try {
            status = this.transport.runClose(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & TcpListener.OPEN_REQUEST) != 0) {
          LogScope.push("bind");
          try {
            status = this.transport.runOpen(status);
            continue;
          } finally {
            LogScope.pop();
          }
        } else if ((status & (TcpListener.STATE_MASK | TcpListener.ACCEPT_READY)) == (TcpListener.OPENED_STATE | TcpListener.ACCEPT_READY)) {
          LogScope.push("accept");
          try {
            status = this.transport.runAccept(status);
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
