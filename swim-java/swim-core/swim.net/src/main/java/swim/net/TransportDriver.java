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
import java.nio.channels.CancelledKeyException;
import java.nio.channels.ClosedChannelException;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.Objects;
import javax.net.ssl.SSLEngine;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.exec.Scheduler;
import swim.log.Log;
import swim.log.LogScope;
import swim.util.Assume;
import swim.util.Result;

/**
 * A {@link TransportService} that uses a {@link Selector} thread to dispatch
 * I/O readiness events to registered {@linkplain Transport transports}.
 */
@Public
@Since("5.0")
public class TransportDriver implements TransportService, NetEndpoint {

  /**
   * Transport configuration options.
   */
  TransportOptions transportOptions;

  /**
   * Lazily instantiated TCP configuration options.
   */
  @Nullable TcpOptions tcpOptions;

  /**
   * Lazily instantiated TCP configuration options.
   */
  @Nullable TlsOptions tlsOptions;

  /**
   * Selector used to wait on I/O readiness events.
   */
  @Nullable Selector selector;

  /**
   * Default execution context in which to run I/O tasks.
   */
  @Nullable Scheduler scheduler;

  /**
   * Atomic bit field containing the service run state in {@link #STATE_MASK}.
   */
  volatile int status;

  /**
   * Service lifecycle and error log.
   */
  Log log;

  /**
   * Thread that waits on and dispatches I/O readiness events.
   */
  final DriverThread thread;

  public TransportDriver(TransportOptions transportOptions) {
    // Initialize transport options.
    this.transportOptions = transportOptions;

    // TCP and TLS options are lazily initialized on service start,
    // if not explicitly configured before then.
    this.tcpOptions = null;
    this.tlsOptions = null;

    // The I/O selector is lazily initialized on service start.
    this.selector = null;

    // Transport drivers are not required to provide a default scheduler.
    this.scheduler = null;

    // Initialize service status.
    this.status = 0;

    // Initialize the service log.
    this.log = this.initLog();

    // Initialize--but don't start--the selector thread.
    this.thread = new DriverThread(this);
    // Set the selector thread name to the log topic
    // concatenated with the service ID.
    this.thread.setName(this.log.topic() + '-' + Log.uniqueId(this));
  }

  public TransportDriver() {
    this(TransportOptions.standard());
  }

  public Log log() {
    return this.log;
  }

  protected String logFocus() {
    return Log.uniqueFocus(this);
  }

  protected Log initLog() {
    return Log.forTopic("swim.net.transport.driver").withFocus(this.logFocus());
  }

  public void setLog(Log log) {
    Objects.requireNonNull(log);
    this.log = log.withFocus(this.logFocus());
    // Update the selector thread name to match the log topic
    // concatenated with the service ID.
    this.thread.setName(this.log.topic() + '-' + Log.uniqueId(this));
  }

  @Override
  public final TransportOptions transportOptions() {
    return this.transportOptions;
  }

  @Override
  public void setTransportOptions(TransportOptions transportOptions) {
    final boolean configured = this.tryTransportOptions(transportOptions);
    if (!configured) {
      throw new IllegalStateException("can't configure transport driver once started");
    }
  }

  @Override
  public boolean tryTransportOptions(TransportOptions transportOptions) {
    Objects.requireNonNull(transportOptions);
    return this.tryConfigure(() -> {
      this.transportOptions = transportOptions;
    });
  }

  /**
   * Returns the default execution context in which to run I/O tasks.
   */
  public final @Nullable Scheduler scheduler() {
    return this.scheduler;
  }

  /**
   * Assigns a new {@code scheduler} in which to run I/O tasks.
   * A scheduler can only be assigned prior to starting the service.
   *
   * @throws IllegalStateException if the service has already been started.
   */
  public void setScheduler(@Nullable Scheduler scheduler) {
    final boolean configured = this.tryScheduler(scheduler);
    if (!configured) {
      throw new IllegalStateException("can't configure transport driver once started");
    }
  }

  /**
   * Attempts to assign a new {@code scheduler} in which to run I/O tasks.
   * A scheduler can only be assigned prior to starting the service. Returns
   * {@code true} if the scheduler was successfully assigned; otherwise
   * returns {@code false} if the service has already been started and
   * is therefore no longer configurable.
   */
  public boolean tryScheduler(@Nullable Scheduler scheduler) {
    return this.tryConfigure(() -> {
      this.scheduler = scheduler;
    });
  }

  /**
   * Attempts to execute a {@code configuration} function. To ensure
   * consistent operation, configuration is not permitted once the service
   * has been started. Returns {@code true} if the {@code configuration}
   * function was executed; otherwise returns {@code false} if the service
   * has already been started, and thus can no longer be configured.
   * <p>
   * To prevent the service from concurrently starting while configuring,
   * the service temporarily enters a locked configuring state while it
   * executes the {@code configuration} function. This call may potentially
   * block if a concurrent configuration operation is being performed.
   */
  protected boolean tryConfigure(Runnable configuration) {
    Objects.requireNonNull(configuration);
    int status = (int) STATUS.getOpaque(this);
    boolean configured = false;
    boolean interrupted = false;
    do {
      if ((status & STATE_MASK) == INITIAL_STATE) {
        // The service has not yet been started; try to configure it.
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~STATE_MASK) | CONFIG_LOCK;
        // Try to acquire the config lock;
        // must happen before invoking the configuration function.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          // The config lock has been acquired.
          status = newStatus;
          configured = true;
          try {
            // Invoke the configuration function.
            configuration.run();
          } finally {
            // Prepare to notify waiters upon releasing the config lock.
            synchronized (this) {
              // Release the config lock; must happen before notifying waiters.
              status = (int) STATUS.compareAndExchangeAcquire(this, newStatus, oldStatus);
              // Verify that the service status didn't change while configuring.
              assert status == newStatus;
              status = oldStatus;
              // Notify waiters that the config lock has been released.
              this.notifyAll();
            }
          }
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else if ((status & STATE_MASK) == CONFIG_LOCK) {
        // Another thread currently holds the config lock;
        // prepare to wait for the config lock to be released.
        synchronized (this) {
          // Ensure the config lock is still held before waiting.
          status = (int) STATUS.getOpaque(this);
          if ((status & STATE_MASK) == CONFIG_LOCK) {
            try {
              this.wait(100L);
            } catch (InterruptedException cause) {
              // Defer thread interrupt.
              interrupted = true;
            }
            // Reload service status after waiting.
            status = (int) STATUS.getOpaque(this);
          }
        }
        // Continue trying to acquire the config lock.
        continue;
      } else {
        // The service has already been started; to ensure consistent operation,
        // configuration is no longer permitted.
        break;
      }
    } while (true);
    if (interrupted) {
      // Resume thread interrupt that occurred during service configuration.
      Thread.currentThread().interrupt();
    }
    // Return whether or not the configuration function was invoked.
    return configured;
  }

  @Override
  public final boolean start() {
    int status = (int) STATUS.getOpaque(this);
    boolean causedStart = false;
    boolean interrupted = false;
    do {
      if ((status & STATE_MASK) == STARTED_STATE) {
        // The service has already started.
        if (causedStart) {
          // This call caused the service to start.
          try {
            // Invoke didStart callback now that the selector thread has started.
            this.didStart();
          } catch (Throwable cause) {
            if (Result.isNonFatal(cause)) {
              // Report the non-fatal exception.
              this.log.error("didStart callback failed", cause);
              // Stop the service on lifecycle callback failure.
              this.stop();
              // Reload service status after stop.
              status = (int) STATUS.getOpaque(this);
            } else {
              // Rethrow the fatal exception.
              throw cause;
            }
          }
        }
        break;
      } else if ((status & STATE_MASK) == STARTING_STATE
              || (status & STATE_MASK) == CONFIG_LOCK) {
        // The service is concurrently starting or being configured;
        // prepare to wait for the concurrent operation to complete.
        synchronized (this) {
          // Ensure the concurrent operation is still ongoing before waiting.
          status = (int) STATUS.getOpaque(this);
          if ((status & STATE_MASK) == STARTING_STATE
              || (status & STATE_MASK) == CONFIG_LOCK) {
            try {
              this.wait(100L);
            } catch (InterruptedException cause) {
              // Defer thread interrupt.
              interrupted = true;
            }
            // Reload service status after waiting.
            status = (int) STATUS.getOpaque(this);
          }
        }
        // Continue trying to start the service.
        continue;
      } else if ((status & STATE_MASK) == INITIAL_STATE) {
        // The service has not yet been started.
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~STATE_MASK) | STARTING_STATE;
        // Try to transition the service into the starting state;
        // must happen before initiating service startup.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          // The service has transitioned into the starting state.
          status = newStatus;
          causedStart = true;
          try {
            // Invoke willStart callback prior to starting the selector thread.
            this.willStart();
          } catch (Throwable cause) {
            if (Result.isNonFatal(cause)) {
              // Report the non-fatal exception.
              this.log.error("willStart callback failed", cause);
              // Stop the service on lifecycle callback failure.
              this.stop();
              // Reload service status after stop.
              status = (int) STATUS.getOpaque(this);
            } else {
              // Rethrow the fatal exception.
              throw cause;
            }
          }
          // Start the selector thread.
          this.thread.start();
          // Continue startup sequence.
          continue;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else if ((status & STATE_MASK) == STOPPING_STATE
              || (status & STATE_MASK) == STOPPED_STATE) {
        // The service is concurrently stopping, or has permanently stopped.
        break;
      } else {
        throw new AssertionError("unreachable");
      }
    } while (true);
    if (interrupted) {
      // Resume thread interrupt that occurred during service startup.
      Thread.currentThread().interrupt();
    }
    // Return whether or not this call caused the service to start.
    return causedStart;
  }

  /**
   * Lifecycle callback invoked after entering the starting state, but before
   * the selector thread has been started. {@code willStart} is invoked from
   * the thread context of the caller that causes the service to start.
   * If {@code willStart} throws an exception, the service will be
   * immediately stopped.
   */
  protected void willStart() {
    this.log.debug("starting transport driver");
    // Ensure that the service has associated TCP options.
    if (this.tcpOptions == null) {
      // Lazily instantiate and assign default TCP options.
      this.tcpOptions = this.createTcpOptions();
    }
    // Ensure that the service has associated TLS options.
    if (this.tlsOptions == null) {
      // Lazily instantiate and assign default TLS options.
      this.tlsOptions = this.createTlsOptions();
    }
  }

  /**
   * Lifecycle callback invoked after the selector thread is up and running,
   * and the service has entered the started state. {@code didStart} is
   * invoked from the thread context of the caller that causes the service
   * to stop. If {@code didStart} throws an exception, the service will be
   * immediately stopped.
   */
  protected void didStart() {
    this.log.notice("started transport driver");
  }

  /**
   * Lifecycle callback invoked by the selector thread right when it starts.
   * If {@code didStartThread} throws an exception, the selector thread
   * will exit and the service will be stopped.
   */
  protected void didStartThread() {
    this.log.debug("started selector thread");
  }

  @Override
  public final boolean stop() {
    int status = (int) STATUS.getOpaque(this);
    boolean causedStop = false;
    boolean interrupted = false;
    do {
      if ((status & STATE_MASK) == STOPPED_STATE) {
        // The service has already stopped.
        if (causedStop) {
          // This call caused the service to stop.
          try {
            // Invoke didStop callback now that the selector thread has shutdown.
            this.didStop();
          } catch (Throwable cause) {
            if (Result.isNonFatal(cause)) {
              // Report the non-fatal exception.
              this.log.error("didStop callback failed", cause);
            } else {
              // Rethrow the fatal exception.
              throw cause;
            }
          }
        }
        break;
      } else if ((status & STATE_MASK) == STOPPING_STATE
              || (status & STATE_MASK) == STARTING_STATE
              || (status & STATE_MASK) == CONFIG_LOCK) {
        // The service is concurrently starting, stopping, or being configured;
        // prepare to wait for the concurrent operation to complete.
        synchronized (this) {
          // Ensure the concurrent operation is still ongoing before waiting.
          status = (int) STATUS.getOpaque(this);
          if ((status & STATE_MASK) == STOPPING_STATE
              || (status & STATE_MASK) == STARTING_STATE
              || (status & STATE_MASK) == CONFIG_LOCK) {
            try {
              this.wait(100L);
            } catch (InterruptedException cause) {
              // Defer thread interrupt.
              interrupted = true;
            }
            // Reload service status after waiting.
            status = (int) STATUS.getOpaque(this);
          }
        }
        // Continue trying to stop the service.
        continue;
      } else if ((status & STATE_MASK) == STARTED_STATE
              || (status & STATE_MASK) == INITIAL_STATE) {
        // The service is running, or has never been started.
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~STATE_MASK) | STOPPING_STATE;
        // Try to transition the service into the stopping state;
        // must happen before initiating service shutdown.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          // The service has transitioned into the stopping state.
          status = newStatus;
          causedStop = true;
          try {
            // Invoke willStop callback prior to stopping the selector thread.
            this.willStop();
          } catch (Throwable cause) {
            if (Result.isNonFatal(cause)) {
              // Report the non-fatal exception.
              this.log.error("willStop callback failed", cause);
            } else {
              // Rethrow the fatal exception.
              throw cause;
            }
          }
          // Stop the selector thread.
          while (this.thread.isAlive()) {
            // Interrupt the selector thread so it will wakeup and die.
            this.thread.interrupt();
            try {
              // Wait for the selector thread to exit.
              this.thread.join(100);
            } catch (InterruptedException cause) {
              // Defer thread interrupt.
              interrupted = true;
            }
          }
          // Continue shutdown sequence.
          continue;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else {
        throw new AssertionError("unreachable");
      }
    } while (true);
    if (interrupted) {
      // Resume thread interrupt that occurred during service shutdown.
      Thread.currentThread().interrupt();
    }
    return causedStop;
  }

  /**
   * Lifecycle callback invoked after entering the stopping state, but before
   * the selector thread has been stopped. {@code willStop} is invoked from
   * the thread context of the caller that causes the service to stop.
   */
  protected void willStop() {
    this.log.debug("stopping transport driver");
  }

  /**
   * Lifecycle callback invoked after the selector thread has been stopped,
   * and the service has entered the stopped state. {@code didStop} is
   * invoked from the thread context of the caller that causes the service
   * to stop.
   */
  protected void didStop() {
    this.log.notice("stopped transport driver");
  }

  /**
   * Lifecycle callback invoked by the selector thread right before it exits.
   * If {@code didStartThread} throws an exception, the selector thread
   * will continue existing and the service will still be stopped.
   */
  protected void didStopThread() {
    this.log.debug("stopped selector thread");
  }

  @Override
  public TransportRef bindTransport(Transport transport) {
    Objects.requireNonNull(transport);
    // Start the transport service to ensure the availability of the selector.
    this.start();
    final SelectionKey selectionKey;
    try {
      // Register the transport channel with the selector.
      selectionKey = transport.channel().register((Selector) SELECTOR.getOpaque(this), 0);
    } catch (ClosedChannelException cause) {
      throw new IllegalStateException("transport channel closed", cause);
    }
    // Create a handle to bind the transport to the service.
    final TransportHandle handle = new TransportHandle(this, transport, selectionKey);
    // Assign the transport handle to the transport.
    transport.setTransportContext(handle);
    // Return the bound transport handle.
    return handle;
  }

  /**
   * Introspection callback invoked after a {@code transport} times out.
   */
  protected void didTimeoutTransport(Transport transport) {
    this.log.debugEntity("timed out transport", transport);
  }

  /**
   * Returns default TCP options to be used when none have been
   * explicitly configured.
   */
  protected TcpOptions createTcpOptions() {
    return TcpOptions.standard();
  }

  @Override
  public TcpOptions tcpOptions() {
    // Get the current TCP options.
    TcpOptions tcpOptions = this.tcpOptions;
    // Lazily instantiate default TCP options, if not yet configured.
    if (tcpOptions == null) {
      // If the TCP options are null, then the service hasn't started yet,
      // so configuration is still possible.
      this.tryConfigure(() -> {
        // Re-check the TCP options now that we hold the config lock
        // to ensure that it wasn't concurrently configured.
        if (this.tcpOptions == null) {
          // Lazily instantiate and assign default TCP options.
          this.tcpOptions = this.createTcpOptions();
        }
      });
      // Reload the TCP options assigned by the configuration function.
      // TCP options should never be null once configured.
      tcpOptions = Assume.nonNull(this.tcpOptions);
    }
    // Return the configured TCP options.
    return tcpOptions;
  }

  public void setTcpOptions(@Nullable TcpOptions tcpOptions) {
    final boolean configured = this.tryTcpOptions(tcpOptions);
    if (!configured) {
      throw new IllegalStateException("can't configure transport driver once started");
    }
  }

  public boolean tryTcpOptions(@Nullable TcpOptions tcpOptions) {
    return this.tryConfigure(() -> {
      this.tcpOptions = tcpOptions;
    });
  }

  public TcpSocket createTcpSocket(NetSocket socket) {
    Objects.requireNonNull(socket);
    final SocketChannel channel;
    try {
      channel = SocketChannel.open();
      channel.configureBlocking(false);
      this.tcpOptions().configure(channel.socket());
    } catch (IOException cause) {
      throw new UnsupportedOperationException("unable to initialize socket channel", cause);
    }
    return new TcpSocket(channel, socket);
  }

  @Override
  public NetSocketRef bindTcpSocket(NetSocket socket) {
    final TcpSocket transport = this.createTcpSocket(socket);
    transport.setScheduler(this.scheduler);
    this.bindTransport(transport);
    socket.setSocketContext(transport);
    return transport;
  }

  public TcpListener createTcpListener(NetListener listener) {
    Objects.requireNonNull(listener);
    final ServerSocketChannel channel;
    try {
      channel = ServerSocketChannel.open();
      channel.configureBlocking(false);
      channel.socket().setReuseAddress(true);
    } catch (IOException cause) {
      throw new UnsupportedOperationException("unable to initialize server socket channel", cause);
    }
    return new TcpListener(channel, listener, this.tcpOptions());
  }

  @Override
  public NetListenerRef bindTcpListener(NetListener listener) {
    final TcpListener transport = this.createTcpListener(listener);
    transport.setScheduler(this.scheduler);
    this.bindTransport(transport);
    listener.setListenerContext(transport);
    return transport;
  }

  /**
   * Returns default TLS options to be used when none have been
   * explicitly configured.
   */
  protected @Nullable TlsOptions createTlsOptions() {
    return TlsOptions.standard();
  }

  @Override
  public @Nullable TlsOptions tlsOptions() {
    // Get the current TLS options.
    TlsOptions tlsOptions = this.tlsOptions;
    // Lazily instantiate default TLS options, if not yet configured.
    if (tlsOptions == null) {
      // If the TLS options are null, then the service hasn't started yet,
      // so configuration is still possible.
      this.tryConfigure(() -> {
        // Re-check the TLS options now that we hold the config lock
        // to ensure that it wasn't concurrently configured.
        if (this.tlsOptions == null) {
          // Lazily instantiate and assign default TLS options.
          this.tlsOptions = this.createTlsOptions();
        }
      });
      // Reload the TLS options assigned by the configuration function.
      tlsOptions = this.tlsOptions;
    }
    // Return the configured TLS options.
    return tlsOptions;
  }

  public void setTlsOptions(@Nullable TlsOptions tlsOptions) {
    final boolean configured = this.tryTlsOptions(tlsOptions);
    if (!configured) {
      throw new IllegalStateException("can't configure transport driver once started");
    }
  }

  public boolean tryTlsOptions(@Nullable TlsOptions tlsOptions) {
    return this.tryConfigure(() -> {
      this.tlsOptions = tlsOptions;
    });
  }

  public TlsSocket createTlsSocket(NetSocket socket) {
    Objects.requireNonNull(socket);
    final TlsOptions tlsOptions = this.tlsOptions();
    if (tlsOptions == null) {
      throw new UnsupportedOperationException("TLS not configured");
    }
    final SSLEngine sslEngine = tlsOptions.createSSLEngine();
    sslEngine.setUseClientMode(true);

    final SocketChannel channel;
    try {
      channel = SocketChannel.open();
      channel.configureBlocking(false);
      this.tcpOptions().configure(channel.socket());
    } catch (IOException cause) {
      throw new UnsupportedOperationException("unable to initialize socket channel", cause);
    }
    return new TlsSocket(channel, socket, sslEngine);
  }

  @Override
  public NetSocketRef bindTlsSocket(NetSocket socket) {
    final TlsSocket transport = this.createTlsSocket(socket);
    transport.setScheduler(this.scheduler);
    this.bindTransport(transport);
    socket.setSocketContext(transport);
    return transport;
  }

  public TlsListener createTlsListener(NetListener listener) {
    Objects.requireNonNull(listener);
    final TlsOptions tlsOptions = this.tlsOptions();
    if (tlsOptions == null) {
      throw new UnsupportedOperationException("TLS not configured");
    }

    final ServerSocketChannel channel;
    try {
      channel = ServerSocketChannel.open();
      channel.configureBlocking(false);
      channel.socket().setReuseAddress(true);
    } catch (IOException cause) {
      throw new UnsupportedOperationException("unable to initialize server socket channel", cause);
    }
    return new TlsListener(channel, listener, this.tcpOptions(), tlsOptions);
  }

  @Override
  public NetListenerRef bindTlsListener(NetListener listener) {
    final TlsListener transport = this.createTlsListener(listener);
    transport.setScheduler(this.scheduler);
    this.bindTransport(transport);
    listener.setListenerContext(transport);
    return transport;
  }

  /**
   * {@link #status} state indicating that the service has not yet been started.
   */
  static final int INITIAL_STATE = 0;

  /**
   * {@link #status} state indicating that the service is currently being started.
   */
  static final int STARTING_STATE = 1;

  /**
   * {@link #status} state indicating that the service has been started.
   */
  static final int STARTED_STATE = 2;

  /**
   * {@link #status} state indicating that the service is currently stopping.
   */
  static final int STOPPING_STATE = 3;

  /**
   * {@link #status} state indicating that the service has been permanently stopped.
   */
  static final int STOPPED_STATE = 4;

  /**
   * {@link #status} state indicating that the service has not yet been started,
   * but it is currently being configured.
   */
  static final int CONFIG_LOCK = 7;

  /**
   * Number of bits used by the state sub-field of the {@link #status} field.
   */
  static final int STATE_BITS = 3;

  /**
   * Bit mask for the state sub-field of the {@link #status} field.
   */
  static final int STATE_MASK = (1 << STATE_BITS) - 1;

  /**
   * {@code VarHandle} for atomically accessing the {@link #selector} field.
   */
  static final VarHandle SELECTOR;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      SELECTOR = lookup.findVarHandle(TransportDriver.class, "selector", Selector.class);
      STATUS = lookup.findVarHandle(TransportDriver.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}

/**
 * A {@link TransportContext} that manages I/O readiness events for a
 * {@code Transport} bound to a {@code TransportDriver}.
 */
final class TransportHandle implements TransportContext {

  /**
   * I/O dispatcher to which the transport is bound.
   */
  final TransportDriver service;

  /**
   * Transport on which to invoke I/O callbacks.
   */
  final Transport transport;

  /**
   * Registration of the transport channel with the driver's selector.
   */
  final SelectionKey selectionKey;

  /**
   * Monotonic timestamp of the most recent I/O operation.
   */
  volatile long lastSelectTime;

  TransportHandle(TransportDriver service, Transport transport, SelectionKey selectionKey) {
    this.service = service;
    this.transport = transport;
    this.selectionKey = selectionKey;
    this.lastSelectTime = System.currentTimeMillis();
    selectionKey.attach(this);
  }

  @Override
  public Transport transport() {
    return this.transport;
  }

  @Override
  public TransportDispatcher dispatcher() {
    return this.service;
  }

  /**
   * Returns the number of idle milliseconds after which the transport should
   * be closed due to lack of activity.
   */
  long idleTimeout() {
    return this.transport.idleTimeout();
  }

  @Override
  public boolean requestAccept() {
    final int interestOps = this.selectionKey.interestOpsOr(SelectionKey.OP_ACCEPT);
    if ((interestOps & SelectionKey.OP_ACCEPT) == 0) {
      ((Selector) TransportDriver.SELECTOR.getOpaque(this.service)).wakeup();
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean cancelAccept() {
    final int interestOps = this.selectionKey.interestOpsAnd(~SelectionKey.OP_ACCEPT);
    if ((interestOps & SelectionKey.OP_ACCEPT) != 0) {
      ((Selector) TransportDriver.SELECTOR.getOpaque(this.service)).wakeup();
      return true;
    } else {
      return false;
    }
  }

  /**
   * Callback invoked by the selector thread when the transport channel
   * is ready to perform an <em>accept</em> operation.
   */
  void dispatchAccept() {
    try {
      // Invoke the I/O callback.
      this.transport.dispatchAccept();
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.service.log.errorStatus("dispatchAccept callback failed", this.transport, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  @Override
  public boolean requestConnect() {
    final int interestOps = this.selectionKey.interestOpsOr(SelectionKey.OP_CONNECT);
    if ((interestOps & SelectionKey.OP_CONNECT) == 0) {
      ((Selector) TransportDriver.SELECTOR.getOpaque(this.service)).wakeup();
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean cancelConnect() {
    final int interestOps = this.selectionKey.interestOpsAnd(~SelectionKey.OP_CONNECT);
    if ((interestOps & SelectionKey.OP_CONNECT) != 0) {
      ((Selector) TransportDriver.SELECTOR.getOpaque(this.service)).wakeup();
      return true;
    } else {
      return false;
    }
  }

  /**
   * Callback invoked by the selector thread when the transport channel
   * is ready to complete a <em>connect</em> operation.
   */
  void dispatchConnect() {
    try {
      // Invoke the I/O callback.
      this.transport.dispatchConnect();
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.service.log.errorStatus("dispatchConnect callback failed", this.transport, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  @Override
  public boolean requestRead() {
    final int interestOps = this.selectionKey.interestOpsOr(SelectionKey.OP_READ);
    if ((interestOps & SelectionKey.OP_READ) == 0) {
      ((Selector) TransportDriver.SELECTOR.getOpaque(this.service)).wakeup();
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean cancelRead() {
    final int interestOps = this.selectionKey.interestOpsAnd(~SelectionKey.OP_READ);
    if ((interestOps & SelectionKey.OP_READ) != 0) {
      ((Selector) TransportDriver.SELECTOR.getOpaque(this.service)).wakeup();
      return true;
    } else {
      return false;
    }
  }

  /**
   * Callback invoked by the selector thread when the transport channel
   * is ready to perform a <em>read</em> operation.
   */
  void dispatchRead() {
    try {
      // Invoke the I/O callback.
      this.transport.dispatchRead();
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.service.log.errorStatus("dispatchRead callback failed", this.transport, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  @Override
  public boolean requestWrite() {
    final int interestOps = this.selectionKey.interestOpsOr(SelectionKey.OP_WRITE);
    if ((interestOps & SelectionKey.OP_WRITE) == 0) {
      ((Selector) TransportDriver.SELECTOR.getOpaque(this.service)).wakeup();
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean cancelWrite() {
    final int interestOps = this.selectionKey.interestOpsAnd(~SelectionKey.OP_WRITE);
    if ((interestOps & SelectionKey.OP_WRITE) != 0) {
      ((Selector) TransportDriver.SELECTOR.getOpaque(this.service)).wakeup();
      return true;
    } else {
      return false;
    }
  }

  /**
   * Callback invoked by the selector thread when the transport channel
   * is ready to perform a <em>write</em> operation.
   */
  void dispatchWrite() {
    try {
      // Invoke the I/O callback.
      this.transport.dispatchWrite();
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.service.log.errorStatus("dispatchWrite callback failed", this.transport, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  void dispatchTimeout() {
    try {
      // Invoke the I/O callback.
      this.transport.dispatchTimeout();
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.service.log.errorStatus("dispatchTimeout callback failed", this.transport, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
    try {
      // Invoke service introspection callback.
      this.service.didTimeoutTransport(this.transport);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.service.log.errorStatus("didTimeoutTransport callback failed", this.transport, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  /**
   * Callback invoked by the selector thread when the selector thread is
   * exiting and will therefore no longer invoke any more I/O callbacks.
   */
  void dispatchClose() {
    try {
      // Invoke the I/O callback.
      this.transport.dispatchClose();
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.service.log.errorStatus("dispatchClose callback failed", this.transport, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  @Override
  public void cancel() {
    this.selectionKey.cancel();
  }

}

/**
 * Thread that waits on and dispatches I/O readiness events.
 */
final class DriverThread extends Thread {

  /**
   * Driver whose I/O transport events this thread dispatches.
   */
  final TransportDriver service;

  /**
   * Monotonic timestamp of the most recent timeout check.
   */
  long lastIdleCheck;

  DriverThread(TransportDriver service) {
    this.service = service;
    this.lastIdleCheck = System.currentTimeMillis();
    this.setDaemon(true);
  }

  /**
   * Waits on and dispatches I/O readiness events for all transports
   * registered with the I/O selector.
   */
  void select() throws IOException {
    // Get a reference to the I/O selector.
    final Selector selector = (Selector) TransportDriver.SELECTOR.getOpaque(this.service);
    // Compute the timestamp of the next idle check.
    final long nextIdleCheck = this.lastIdleCheck + this.service.transportOptions.idleInterval;
    // Compute the remaining time until the next idle check;
    final long timeout = Math.max(0L, nextIdleCheck - System.currentTimeMillis());
    // Wait for ready I/O events, or for the next idle check.
    final int selectedCount = selector.select(timeout);
    if (selectedCount > 0) {
      final Iterator<SelectionKey> selectedKeys = selector.selectedKeys().iterator();
      while (selectedKeys.hasNext()) {
        // Get the next selected key.
        final SelectionKey selectionKey = selectedKeys.next();
        // Remove the key from the selected set.
        selectedKeys.remove();
        // Get the transport handle attached to the selected key.
        final Object attachment = selectionKey.attachment();
        if (attachment instanceof TransportHandle) {
          final TransportHandle handle = (TransportHandle) attachment;
          // Dispatch I/O readiness events for the selected transport.
          this.dispatch(handle);
        }
      }
    }
  }

  /**
   * Dispatches I/O readiness events for the given transport {@code handle}.
   */
  void dispatch(TransportHandle handle) {
    try {
      // Get the set of ready I/O operations for the transport channel.
      final int readyOps = handle.selectionKey.readyOps();
      if ((readyOps & SelectionKey.OP_ACCEPT) != 0) {
        this.dispatchAccept(handle);
      }
      if ((readyOps & SelectionKey.OP_CONNECT) != 0) {
        this.dispatchConnect(handle);
      }
      if ((readyOps & SelectionKey.OP_READ) != 0) {
        this.dispatchRead(handle);
      }
      if ((readyOps & SelectionKey.OP_WRITE) != 0) {
        this.dispatchWrite(handle);
      }
    } catch (CancelledKeyException cause) {
      // The transport was closed during the last select operation.
    }
  }

  /**
   * Dispatches an accept ready event on a transport {@code handle}.
   */
  void dispatchAccept(TransportHandle handle) {
    final int interestOps = handle.selectionKey.interestOpsAnd(~SelectionKey.OP_ACCEPT);
    if ((interestOps & SelectionKey.OP_ACCEPT) != 0) {
      handle.lastSelectTime = System.currentTimeMillis();
      handle.dispatchAccept();
    }
  }

  /**
   * Dispatches a connect ready event on a transport {@code handle}.
   */
  void dispatchConnect(TransportHandle handle) {
    final int interestOps = handle.selectionKey.interestOpsAnd(~SelectionKey.OP_CONNECT);
    if ((interestOps & SelectionKey.OP_CONNECT) != 0) {
      handle.lastSelectTime = System.currentTimeMillis();
      handle.dispatchConnect();
    }
  }

  /**
   * Dispatches a read ready event on a transport {@code handle}.
   */
  void dispatchRead(TransportHandle handle) {
    final int interestOps = handle.selectionKey.interestOpsAnd(~SelectionKey.OP_READ);
    if ((interestOps & SelectionKey.OP_READ) != 0) {
      handle.lastSelectTime = System.currentTimeMillis();
      handle.dispatchRead();
    }
  }

  /**
   * Dispatches a write ready event on a transport {@code handle}.
   */
  void dispatchWrite(TransportHandle handle) {
    final int interestOps = handle.selectionKey.interestOpsAnd(~SelectionKey.OP_WRITE);
    if ((interestOps & SelectionKey.OP_WRITE) != 0) {
      handle.lastSelectTime = System.currentTimeMillis();
      handle.dispatchWrite();
    }
  }

  /**
   * Checks all transports registered with the I/O selector for idle timeouts.
   */
  void checkIdle() {
    final TransportOptions transportOptions = this.service.transportOptions;
    final long now = System.currentTimeMillis();
    if (now - this.lastIdleCheck >= transportOptions.idleInterval) {
      // Idle interval has elapsed since last timeout check;
      // update the last timeout check time.
      this.lastIdleCheck = now;
      // Get a reference to the I/O selector.
      final Selector selector = (Selector) TransportDriver.SELECTOR.getOpaque(this.service);
      // Loop over all selection keys registered with the I/O selector.
      for (SelectionKey selectionKey : selector.keys()) {
        // Get the transport handle attached to the next key.
        final Object attachment = selectionKey.attachment();
        if (attachment instanceof TransportHandle) {
          final TransportHandle handle = (TransportHandle) attachment;
          // Ask the transport for its desired idle timeout.
          long idleTimeout = handle.idleTimeout();
          if (idleTimeout < 0L) {
            // Negative idle timeout means use the default idle timeout.
            idleTimeout = transportOptions.idleTimeout;
          }
          // Zero indicates no idle timeout.
          if (idleTimeout > 0L && now - handle.lastSelectTime > idleTimeout) {
            // Notify the transport that its idle timeout has elapsed.
            handle.dispatchTimeout();
          }
        }
      }
    }
  }

  /**
   * Closes all transports registered with the I/O selector.
   */
  void closeTransports() {
    // Get a reference to the I/O selector.
    final Selector selector = (Selector) TransportDriver.SELECTOR.getOpaque(this.service);
    for (SelectionKey selectionKey : selector.keys()) {
      // Get the transport handle attached to the next key.
      final Object attachment = selectionKey.attachment();
      if (attachment instanceof TransportHandle) {
        final TransportHandle handle = (TransportHandle) attachment;
        handle.dispatchClose();
      }
    }
  }

  @Override
  public void run() {
    final TransportDriver service = this.service;
    final Selector selector;
    // Outer try/finally is to ensure proper shutdown on thread exit.
    LogScope.reset();
    try {
      LogScope.push("selector");

      try {
        // Initialize the I/O selector.
        selector = Selector.open();
      } catch (IOException cause) {
        // Report selector open failure.
        service.log.fatal("selector failed on open", cause);
        // Immediately exit the selector thread.
        return;
      }

      // Assign the selector to the service;
      // exposed to other threads by subsequent monitor barrier.
      TransportDriver.SELECTOR.setOpaque(service, selector);

      // Prepare to complete service startup.
      synchronized (service) {
        // Set the service status to started; must happen before notifying waiters.
        final int status = (int) TransportDriver.STATUS.compareAndExchangeAcquire(service, TransportDriver.STARTING_STATE, TransportDriver.STARTED_STATE);
        assert status == TransportDriver.STARTING_STATE;
        // Notify waiters of service startup completion.
        service.notifyAll();
      }

      // Invoke service introspection callback.
      service.didStartThread();

      try {
        // Loop while the service has not been stopped.
        do {
          // Wait on and dispatch I/O readiness events.
          this.select();
          // Check for transport idle timeouts.
          this.checkIdle();
          // Re-check service status.
          final int status = (int) TransportDriver.STATUS.getAcquire(service);
          // Check if the service has exited the started state.
          if ((status & TransportDriver.STATE_MASK) != TransportDriver.STARTED_STATE) {
            break;
          }
        } while (true);
        // Shut down all registered transports before stopping the service.
        this.closeTransports();
      } catch (IOException cause) {
        // Report the selector failure.
        service.log.fatal("selector failed", cause);
        // Shut down all registered transports before stopping the service.
        this.closeTransports();
      } catch (Throwable cause) {
        if (Result.isNonFatal(cause)) {
          // Report the non-fatal exception.
          service.log.fatal("selector thread failed", cause);
          // Shut down all registered transports.
          this.closeTransports();
        } else {
          // Rethrow the fatal exception.
          throw cause;
        }
      } finally {
        try {
          // Close the I/O selector.
          selector.close();
        } catch (IOException cause) {
          // Report selector close failure.
          service.log.warning("selector failed on close", cause);
        }
      }
    } finally {
      synchronized (service) {
        // Set the service state to stopped.
        TransportDriver.STATUS.setRelease(service, TransportDriver.STOPPED_STATE);
        // Notify waiters of service shutdown completion.
        service.notifyAll();
      }
      // Invoke service introspection callback.
      service.didStopThread();
      LogScope.pop();
    }
  }

}
