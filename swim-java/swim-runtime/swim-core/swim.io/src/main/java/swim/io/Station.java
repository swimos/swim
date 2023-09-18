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
import java.nio.Buffer;
import java.nio.ByteBuffer;
import java.nio.channels.CancelledKeyException;
import java.nio.channels.ClosedChannelException;
import java.nio.channels.ReadableByteChannel;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.WritableByteChannel;
import java.util.Iterator;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.concurrent.AbstractTask;
import swim.concurrent.Cont;
import swim.concurrent.MainStage;
import swim.concurrent.Stage;

/**
 * Asynchronous I/O multiplexor.
 */
public class Station {

  /**
   * Stage on which to execute I/O tasks.
   */
  protected final Stage stage;
  /**
   * Barrier used to sequence station startup.
   */
  final CountDownLatch startLatch;
  /**
   * Barrier used to sequence station shutdown.
   */
  final CountDownLatch stopLatch;
  /**
   * Thread that waits on and dispatches I/O readiness events.
   */
  final StationThread thread;
  /**
   * Transport configuration parameters.
   */
  protected TransportSettings transportSettings;
  /**
   * Atomic bit field with {@link #STARTED} and {@link #STOPPED} flags.
   */
  volatile int status;

  public Station(Stage stage, TransportSettings transportSettings) {
    // Assign the I/O task execution stage.
    this.stage = stage;

    // Assign the initial transport configuration parameters.
    this.transportSettings = transportSettings != null ? transportSettings : TransportSettings.standard();

    // Initialize the barrier used to sequence station startup.
    this.startLatch = new CountDownLatch(1);

    // Initialize the barrier used to sequence station shutdown.
    this.stopLatch = new CountDownLatch(1);

    // Initialize--but don't start--the station thread.
    this.thread = new StationThread(this);
  }

  public Station(Stage stage) {
    this(stage, null);
  }

  /**
   * Returns the {@code Stage} on which this {@code Station} executes I/O tasks.
   */
  public final Stage stage() {
    return this.stage;
  }

  /**
   * Returns the transport configuration parameters that govern this {@code
   * Station}'s regsitered transports.
   */
  public final TransportSettings transportSettings() {
    return this.transportSettings;
  }

  /**
   * Updates the transport configuration parameters that govern this {@code
   * Station}'s registered transports, and returns {@code this}.
   */
  public Station transportSettings(TransportSettings transportSettings) {
    this.transportSettings = transportSettings;
    return this;
  }

  /**
   * Ensures that this {@code Station} is up and running, starting up the
   * selector thread if it has not yet been started.
   *
   * @throws StationException if this {@code Station} has been stopped.
   */
  public void start() {
    do {
      final int oldStatus = Station.STATUS.get(this);
      if ((oldStatus & Station.STOPPED) == 0) {
        // Station hasn't yet stopped; make sure it has started.
        if ((oldStatus & Station.STARTED) == 0) {
          final int newStatus = oldStatus | Station.STARTED;
          // Try to set the STARTED flag; linearization point for station startup.
          if (Station.STATUS.compareAndSet(this, oldStatus, newStatus)) {
            // Initaite selector thread startup.
            this.willStart();
            this.thread.start();
            break;
          }
        } else {
          // Selector thread already started.
          break;
        }
      } else {
        throw new StationException("Can't restart stopped station");
      }
    } while (true);

    // Loop while the selector thread is not yet up and running.
    boolean interrupted = false;
    while (this.startLatch.getCount() != 0) {
      try {
        // Wait for selector thread startup to complete.
        this.startLatch.await();
      } catch (InterruptedException cause) {
        interrupted = true;
      }
    }
    if (interrupted) {
      Thread.currentThread().interrupt();
    }
  }

  /**
   * Ensures that this {@code Station} has been permanently stopped, shutting
   * down the selector thread, if it's currently running. Upon return, this
   * {@code Station} is guaranteed to be in the <em>stopped</em> state.
   */
  public void stop() {
    boolean interrupted = false;
    do {
      final int oldStatus = Station.STATUS.get(this);
      if ((oldStatus & Station.STOPPED) == 0) {
        // Station hasn't yet stopped; try to stop it.
        final int newStatus = oldStatus | Station.STOPPED;
        // Try to set the STOPPED flag; linearization point for station shutdown.
        if (Station.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          // Loop while the selector thread is still running.
          while (this.thread.isAlive()) {
            // Interrupt the selector thread so it will wakeup and die.
            this.thread.interrupt();
            try {
              // Wait for the selector thread to exit.
              this.thread.join(100);
            } catch (InterruptedException cause) {
              interrupted = true;
            }
          }
        }
      } else {
        // Selector thread already stopped.
        break;
      }
    } while (true);

    // Loop while the selector thread is still running.
    while (this.stopLatch.getCount() != 0) {
      try {
        // Wait for selector thread shutdown to complete.
        this.stopLatch.await();
      } catch (InterruptedException e) {
        interrupted = true;
      }
    }
    if (this.stage instanceof MainStage) {
      ((MainStage) this.stage).stop();
    }
    if (interrupted) {
      Thread.currentThread().interrupt();
    }
  }

  /**
   * Binds the given {@code transport} to this {@code Station}, initializing
   * the {@code transport}'s context with the given {@code flowControl} state.
   * The {@code Station} thereafter asynchronously executes I/O tasks on behalf
   * of the {@code transport} when the underlying physical transport is ready
   * for I/O operations permitted by the {@code transport}'s current flow
   * control state. Returns a {@code TransportRef}, which can be used to
   * modify the flow control of the {@code transport}, and to close the {@code
   * transport}.
   */
  public TransportRef transport(Transport transport, FlowControl flowControl) {
    // Ensure that the station has started.
    this.start();

    // Create the context that binds the transport to this station.
    final StationTransport context = new StationTransport(this, transport, flowControl);
    transport.setTransportContext(context);

    // Initialize the transport's flow control.
    this.reselect(context);

    // Return the transport context.
    return context;
  }

  /**
   * Informs the selector thread of a possible change to the given transport
   * {@code context}'s flow control state.
   */
  void reselect(StationTransport context) {
    this.thread.reselect(context);
  }

  /**
   * Lifecycle callback invoked before the selector thread starts.
   */
  protected void willStart() {
    // hook
  }

  /**
   * Lifecycle callback invoked after the selector thread starts.
   */
  protected void didStart() {
    // hook
  }

  /**
   * Lifecycle callback invoked before the selector thread stops.
   */
  protected void willStop() {
    // hook
  }

  /**
   * Lifecycle callback invoked after the selector thread stops.
   */
  protected void didStop() {
    // hook
  }

  /**
   * Lifecycle callback invoked if the selector thread throws a fatal {@code
   * error}. The selector thread will stop after invoking {@code didFail}.
   */
  protected void didFail(Throwable error) {
    error.printStackTrace();
  }

  /**
   * Introspection callback invoked after a {@code transport} completes an
   * accept operation.
   */
  protected void transportDidAccept(Transport transport) {
    // hook
  }

  /**
   * Introspection callback invoked after a {@code transport} completes a
   * connect operation.
   */
  protected void transportDidConnect(Transport transport) {
    // hook
  }

  /**
   * Introspection callback invoked after a {@code transport} times out.
   */
  protected void transportDidTimeout(Transport transport) {
    // hook
  }

  /**
   * Introspection callback invoked after a {@code transport} closes.
   */
  protected void transportDidClose(Transport transport) {
    // hook
  }

  /**
   * Introspection callback invoked after a {@code transport} operation fails
   * by throwing an {@code error}.
   */
  protected void transportDidFail(Transport transport, Throwable error) {
    if (!(error instanceof IOException)) {
      error.printStackTrace();
    }
  }

  /**
   * Atomic {@link #status} bit flag indicating that the station has started,
   * and is currently running.
   */
  static final int STARTED = 1 << 0;
  /**
   * Atomic {@link #status} bit flag indicating that the station had previously
   * started, but is now permanently stopped.
   */
  static final int STOPPED = 1 << 1;

  /**
   * Atomic {@link #status} field updater, used to linearize station startup
   * and shutdown.
   */
  static final AtomicIntegerFieldUpdater<Station> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(Station.class, "status");

}

/**
 * Context that binds a {@code Transport} to a {@code Station}, manages the
 * execution of I/O tasks, and maintains consistency of the transport's flow
 * control, with respoect to the station's selector.
 */
final class StationTransport implements TransportContext, TransportRef {

  /**
   * {@code Station} to which the {@code transport} is bound.
   */
  final Station station;
  /**
   * {@code Transport} binding on which to invoke I/O callbacks.
   */
  final Transport transport;
  /**
   * Atomic reference to the current flow control state of the transport.
   */
  volatile FlowControl flowControl;
  /**
   * Sequential {@code Task} that invokes transport read callbacks.
   */
  StationReader reader;
  /**
   * Sequential {@code Task} that invokes transport write callbacks.
   */
  StationWriter writer;
  /**
   * Registration of the transport channel with the station's selector.
   */
  SelectionKey selectionKey;
  /**
   * Monotonic timestamp of the most recent transport I/O operation.
   */
  volatile long lastSelectTime;

  StationTransport(Station station, Transport transport, FlowControl flowControl) {
    this.station = station;
    this.transport = transport;
    this.flowControl = flowControl;
  }

  /**
   * Informs the station's selector thread of a possible change to the
   * transport's flow control state.
   */
  void reselect() {
    this.station.reselect(this);
  }

  /**
   * Returns the number of idle milliseconds after which the transport should
   * be closed due to lack of activity.
   */
  long idleTimeout() {
    return this.transport.idleTimeout();
  }

  @Override
  public TransportSettings transportSettings() {
    return this.station.transportSettings;
  }

  @Override
  public FlowControl flowControl() {
    return StationTransport.FLOW_CONTROL.get(this);
  }

  @Override
  public void flowControl(FlowControl newFlowControl) {
    final FlowControl oldFlowControl = StationTransport.FLOW_CONTROL.getAndSet(this, newFlowControl);
    if (!oldFlowControl.equals(newFlowControl)) {
      this.reselect();
    }
  }

  @Override
  public FlowControl flowControl(FlowModifier flowModifier) {
    do {
      final FlowControl oldFlowControl = StationTransport.FLOW_CONTROL.get(this);
      final FlowControl newFlowControl = oldFlowControl.modify(flowModifier);
      if (!oldFlowControl.equals(newFlowControl)) {
        // Flow control changed; atomically update the transport's state.
        if (StationTransport.FLOW_CONTROL.compareAndSet(this, oldFlowControl, newFlowControl)) {
          // Inform the station's selector of the change.
          this.reselect();
          return newFlowControl;
        }
      } else {
        // No change to flow control state.
        return newFlowControl;
      }
    } while (true);
  }

  @Override
  public void close() {
    Throwable failure = null;
    try {
      // Close the transport's NIO channel.
      this.transport.channel().close();
    } catch (IOException cause) {
      // Report close failure to the station, but not to the transport binding.
      this.station.transportDidFail(this.transport, cause);
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    // Complete the transport close.
    this.didClose();
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  /**
   * I/O callback invoked by the station's selector thread when the transport
   * is ready to complete an <em>accept</em> operation.
   */
  void doAccept() {
    try {
      // Tell the transport binding to complete the accept operation.
      this.transport.doAccept();
      // Inform the station that the transport completed the accept operation.
      this.station.transportDidAccept(this.transport);
    } catch (ClosedChannelException cause) {
      // Channel closed during the accept operation; complete the close.
      this.didClose();
    } catch (IOException cause) {
      // Report the transport I/O exception.
      this.didFail(cause);
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        // Rethrow the fatal exception.
        throw cause;
      }
      // Report the non-fatal transport exception.
      this.didFail(cause);
    }
  }

  /**
   * I/O callback invoked by the station's selector thread when the transport
   * is ready to complete a <em>connect</em> operation. Disables the
   * <em>connect</em> operation on the transport's flow control state.
   */
  void doConnect() {
    do {
      final FlowControl oldFlowControl = StationTransport.FLOW_CONTROL.get(this);
      if (oldFlowControl.isConnectEnabled()) {
        // Connect operation is enabled; disable it.
        final FlowControl newFlowControl = oldFlowControl.connectDisabled();
        if (StationTransport.FLOW_CONTROL.compareAndSet(this, oldFlowControl, newFlowControl)) {
          break;
        }
      } else {
        // Connect operation already disabled.
        break;
      }
    } while (true);

    try {
      // Tell the transport binding to complete the connect operation.
      this.transport.doConnect();
      // Inform the station that the transport completed the connect operation.
      this.station.transportDidConnect(this.transport);
    } catch (ClosedChannelException cause) {
      // Channel closed during the connect operation; complete the close.
      this.didClose();
    } catch (IOException cause) {
      // Report the transport I/O exception.
      this.didFail(cause);
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        // Rethrow the fatal exception.
        throw cause;
      }
      // Report the non-fatal transport exception.
      this.didFail(cause);
    }
  }

  /**
   * Schedules the transport's asynchronous reader task for execution on the
   * station's stage.
   */
  void cueRead() {
    StationReader reader = this.reader;
    try {
      if (reader == null) {
        // Lazily instantiate the reader task, and bind it to the station's stage.
        reader = new StationReader(this);
        this.station.stage.task(reader);
        this.reader = reader;
      }
      // Schedule the reader task to run.
      reader.cue();
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        this.close();
      }
      throw cause;
    }
  }

  /**
   * I/O callback invoked by the station's selector thread when the transport
   * is ready to perform a <em>read</em> operation.
   *
   * @return Whether the operation has yielded control without completing.
   */
  boolean doRead() {
    final ByteBuffer readBuffer = this.transport.readBuffer();
    final ReadableByteChannel channel = (ReadableByteChannel) this.transport.channel();
    boolean yield = false;
    // Loop while reading is permitted.
    while (StationTransport.FLOW_CONTROL.get(this).isReadEnabled()) {
      final int count;
      try {
        // Try to read input bytes from the transport channel.
        count = channel.read(readBuffer);
      } catch (ClosedChannelException cause) {
        // Channel closed during the read operation; complete the close.
        this.didClose();
        break;
      } catch (IOException cause) {
        // Report the transport I/O exception.
        this.didFail(cause);
        break;
      } catch (Throwable cause) {
        if (!Cont.isNonFatal(cause)) {
          // Rethrow the fatal exception.
          throw cause;
        }
        // Report the non-fatal transport exception.
        this.didFail(cause);
        break;
      }
      if (count < 0) {
        // The transport channel has reached the end of the stream; close the
        // transport.
        this.close();
        break;
      } else if (readBuffer.position() > 0) {
        // The input buffer has available input data; prepare the input buffer
        // to be read by the transport binding.
        ((Buffer) readBuffer).flip();
        try {
          // Tell the transport binding to read input bytes from the input
          // buffer.
          this.transport.doRead();
        } catch (Throwable cause) {
          if (!Cont.isNonFatal(cause)) {
            // Rethrow the fatal exception.
            throw cause;
          }
          // Report the non-fatal transport exception.
          this.didFail(cause);
          break;
        }
        if (readBuffer.hasRemaining()) {
          final int currentPos = readBuffer.position();
          // The transport binding didn't read all the input bytes from the
          // input buffer; compact the input buffer to make room to read more
          // input data.
          readBuffer.compact();
          if (count == 0 && currentPos == 0) {
            //No progress was made in this iteration, however, the task is not
            //complete. It should yield to allow other pending IO tasks to run
            //that could potentially unblock this task.
            yield = true;
            break;
          }
        } else {
          // The transport binding read all bytes from the input buffer; reset
          // the input buffer.
          ((Buffer) readBuffer).clear();
        }
        // Continue trying to read from the transport channel.
        continue;
      } else {
        // The input buffer is empty; synchronize the transport's flow control
        // state with the station's selector to ensure that doRead gets called
        // again, when ready and permitted.
        this.reselect();
        break;
      }
    }
    return yield;
  }

  /**
   * Schedules the transport's asynchronous write task for execution on the
   * station's stage.
   */
  void cueWrite() {
    StationWriter writer = this.writer;
    try {
      if (writer == null) {
        // Lazily instantiate the writer task, and bind it to the station's stage.
        writer = new StationWriter(this);
        this.station.stage.task(writer);
        this.writer = writer;
      }
      // Schedule the writer task to run.
      writer.cue();
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        this.close();
      }
      throw cause;
    }
  }

  /**
   * I/O callback invoked by the station's selector thread when the transport
   * is ready to perform a <em>write</em> operation.
   */
  void doWrite() {
    final ByteBuffer writeBuffer = this.transport.writeBuffer();
    final WritableByteChannel channel = (WritableByteChannel) this.transport.channel();
    // Loop while the output buffer has bytes remaining to be written, and
    // writing is permitted.
    do {
      if (writeBuffer.hasRemaining()) {
        // The output buffer has bytes remaining to be written.
        final int count;
        try {
          // Try to write the remaining output bytes to the transport channel.
          count = channel.write(writeBuffer);
        } catch (ClosedChannelException cause) {
          // Channel closed during the write operation; complete the close.
          this.didClose();
          break;
        } catch (IOException cause) {
          // Report the transport I/O exception.
          this.didFail(cause);
          break;
        } catch (Throwable cause) {
          if (!Cont.isNonFatal(cause)) {
            // Rethrow the fatal exception.
            throw cause;
          }
          // Report the non-fatal transport exception.
          this.didFail(cause);
          break;
        }
        if (count > 0) {
          // Output bytes were successfully written to the transport channel.
          if (!writeBuffer.hasRemaining()) {
            // The output buffer has no more bytes to be written.
            continue;
          } else {
            // The output buffer still has bytes remaining to be written;
            // synchronize the transport's flow control state with the
            // station's selector to ensure that doWrite gets called again,
            // when ready and permitted.
            this.reselect();
            break;
          }
        } else {
          // No output bytes were written to the transport channel; synchronize
          // the transport's flow control state with the station's selector to
          // ensure that doWrite gets called again, when ready and permitted.
          this.reselect();
          break;
        }
      } else if (StationTransport.FLOW_CONTROL.get(this).isWriteEnabled()) {
        // The output buffer is empty, and writing is permitted.
        // Clear the output buffer to prepare it for new output data.
        ((Buffer) writeBuffer).clear();
        try {
          while (writeBuffer.hasRemaining() && StationTransport.FLOW_CONTROL.get(this).isWriteEnabled()) {
            final int oldPosition = writeBuffer.position();
            // Tell the transport binding to write more output bytes to the
            // output buffer.
            this.transport.doWrite();
            final int newPosition = writeBuffer.position();
            if (oldPosition != newPosition) {
              // Inform the transport binding that the write completed.
              this.transport.didWrite();
            } else {
              break;
            }
          }
        } catch (Throwable cause) {
          if (!Cont.isNonFatal(cause)) {
            // Rethrow the fatal exception.
            throw cause;
          }
          // Report the non-fatal transport exception.
          this.didFail(cause);
          break;
        }
        // Prepare the output buffer to be written to the transport channel.
        ((Buffer) writeBuffer).flip();
        if (writeBuffer.hasRemaining()) {
          // New output bytes were written by the transport binding to the
          // output buffer; continue writing the output buffer to the transport
          // channel.
          continue;
        } else {
          // No new output bytes were written by the transport binding to the
          // output buffer; synchronize the transport's flow control state with
          // the station's selector to ensure that doWrite gets called again,
          // when ready and permitted.
          this.reselect();
          break;
        }
      } else {
        // The output buffer is empty, and writing is not permitted;
        // synchronize the transport's flow control state with the station's
        // selector to ensure that doWrite gets called again, when ready and
        // permitted.
        this.reselect();
        break;
      }
    } while (true);
  }

  void didTimeout() {
    Throwable failure = null;
    try {
      // Inform the transport binding that the transport has timed out.
      this.transport.didTimeout();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    // Inform the station that the transport has timed out.
    this.station.transportDidTimeout(this.transport);
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  /**
   * Clean up the transport after it has closed.
   */
  void didClose() {
    Throwable failure = null;
    try {
      final StationReader reader = this.reader;
      if (reader != null) {
        // Best effort to prevent the reader task from running post-close.
        reader.cancel();
      }
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    try {
      final StationWriter writer = this.writer;
      if (writer != null) {
        // Best effort to prevent the writer task from running post-close.
        writer.cancel();
      }
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    try {
      // Inform the transport binding that the transport has closed.
      this.transport.didClose();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    try {
      // Inform the station that the transport has closed.
      this.station.transportDidClose(this.transport);
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  /**
   * Report a—possibly non-fatal—transport error.
   */
  void didFail(Throwable error) {
    Throwable failure = null;
    try {
      // Inform the transport binding that the transport failed.
      this.transport.didFail(error);
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    // Inform the station that the transport failed.
    this.station.transportDidFail(this.transport, error);
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  /**
   * Atomic {@link #flowControl} field updater, used to linearize transport
   * flow control modifications.
   */
  static final AtomicReferenceFieldUpdater<StationTransport, FlowControl> FLOW_CONTROL =
      AtomicReferenceFieldUpdater.newUpdater(StationTransport.class, FlowControl.class, "flowControl");

}

/**
 * Sequential task from which all transport read operations are performed.
 */
final class StationReader extends AbstractTask {

  final StationTransport context;

  StationReader(StationTransport context) {
    this.context = context;
  }

  @Override
  public void runTask() {
    try {
      final boolean didYield = this.context.doRead();
      if (didYield) {
        // The task yielded control but had not completed so needs to be rescheduled.
        this.cue();
      }
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        this.context.close();
      }
      throw cause;
    }
  }

}

/**
 * Sequential task from which all transport write operations are performed.
 */
final class StationWriter extends AbstractTask {

  final StationTransport context;

  StationWriter(StationTransport context) {
    this.context = context;
  }

  @Override
  public void runTask() {
    try {
      this.context.doWrite();
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        this.context.close();
      }
      throw cause;
    }
  }

}

/**
 * Thread of execution that waits on and dispatches I/O readiness events.
 */
final class StationThread extends Thread {

  /**
   * {@code Station} whose I/O transports this {@code StationThread} manages.
   */
  final Station station;
  /**
   * I/O selector used to wait on I/O readiness events.
   */
  final Selector selector;
  /**
   * Submission queue used to sequence transport flow control modifications;
   * needed because {@code SelectionKey}'s cannot be atomically mutated by
   * concurrent threads.
   */
  final ConcurrentLinkedQueue<StationTransport> reselectQueue;
  /**
   * Monotonic timestamp of most recent timeout check.
   */
  long lastIdleCheck;

  StationThread(Station station) {
    this.setName("SwimStation" + StationThread.THREAD_COUNT.getAndIncrement());
    this.station = station;
    try {
      this.selector = Selector.open();
    } catch (IOException cause) {
      throw new RuntimeException(cause);
    }
    this.reselectQueue = new ConcurrentLinkedQueue<StationTransport>();
    this.lastIdleCheck = System.currentTimeMillis();
  }

  @Override
  public void run() {
    final Station station = this.station;
    Throwable failure = null;

    try {
      // Linearization point for station start.
      station.startLatch.countDown();
      station.didStart();

      // Loop while the station has not been stopped.
      do {
        // Drain the reselect submission queue, synchronizing the flow
        // control state of all modified transports with their corresponding
        // selection keys.
        this.reflow();
        // Wait on and then dispatch I/O readines events.
        this.select();
        // Check for idle transport timeouts.
        this.checkIdle();
      } while ((Station.STATUS.get(station) & Station.STOPPED) == 0);

      station.willStop();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        // Rethrow fatal exception.
        throw cause;
      }
      failure = cause;
      // Report internal station error.
      station.didFail(cause);
    }

    // Close all registered transports.
    try {
      this.closeAll();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        // Rethrow fatal exception.
        throw cause;
      }
      failure = cause;
    }
    try {
      // Close the I/O selector.
      this.selector.close();
    } catch (IOException cause) {
      failure = cause;
      // Report I/O selector close failure.
      station.didFail(cause);
    }

    try {
      // Force the station into the stopped state.
      Station.STATUS.set(station, Station.STOPPED);
      // Linearization point for station stop.
      station.stopLatch.countDown();
      station.didStop();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        // Rethrow fatal exception.
        throw cause;
      }
      failure = cause;
    }

    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  /**
   * Enqueues the transport {@code context} to have its flow control state
   * synchronized with the I/O selector, and wakes up the selector thread to
   * have it account for the flow control change.
   */
  void reselect(StationTransport context) {
    this.reselectQueue.add(context);
    this.selector.wakeup();
  }

  /**
   * Synchronizes the flow control state of all transports in the reselect
   * queue with the I/O selector.
   */
  void reflow() {
    // Loop until the reselect queue is empty.
    do {
      // Dequeue the next transport from the reselect queue.
      final StationTransport context = this.reselectQueue.poll();
      if (context != null) {
        try {
          // Synchronize the transport's flow control state with the I/O selector.
          this.reflow(context);
        } catch (Throwable cause) {
          if (!Cont.isNonFatal(cause)) {
            // Rethrow fatal exception.
            throw cause;
          }
          // Inform station of non-fatal reflow exception.
          this.station.transportDidFail(context.transport, cause);
        }
      } else {
        // No more transports to reselect.
        break;
      }
    } while (true);
  }

  /**
   * Synchronizes the flow control state of the given transport {@code context}
   * with the I/O interest ops of the transport channel's selection key.
   */
  void reflow(StationTransport context) {
    final SelectionKey selectionKey = context.selectionKey;
    // Get the selection key interest ops corresponding to the transport's
    // current flow control state.
    final int interestOps = StationTransport.FLOW_CONTROL.get(context).toSelectorOps();
    if (selectionKey != null) {
      // Transport channel is registered with the I/O selector.
      try {
        // Update the selection key's permitted I/O operations.
        selectionKey.interestOps(interestOps);
      } catch (CancelledKeyException cause) {
        // Transport channel closed during the I/O operation update; complete
        // the close.
        context.didClose();
      }
    } else {
      // Transport channel not yet registered with the I/O selector.
      try {
        // Try to register the transport channel with the I/O selector.
        context.selectionKey = context.transport.channel().register(this.selector, interestOps, context);
      } catch (CancelledKeyException | ClosedChannelException cause) {
        // Transport channel closed during registration; complete the close.
        context.didClose();
      } catch (Throwable cause) {
        if (!Cont.isNonFatal(cause)) {
          // Rethrhrow fatal exception.
          throw cause;
        }
        // Report transport channel registration exception.
        context.didFail(cause);
      }
    }
  }

  /**
   * Waits on and dispatches I/O readiness events for all transports registered
   * with the I/O selector.
   */
  void select() {
    final int selectedCount;
    try {
      // Wait for I/O readiness events, or for timeout check time to elapse.
      selectedCount = this.selector.select(this.station.transportSettings.idleInterval);
    } catch (IOException cause) {
      // Report the selector I/O exception.
      this.station.didFail(cause);
      return;
    }
    if (selectedCount > 0) {
      final Iterator<SelectionKey> selectedKeys = this.selector.selectedKeys().iterator();
      while (selectedKeys.hasNext()) {
        // Get the next ready selection key.
        final SelectionKey selectionKey = selectedKeys.next();
        // Remove the key from the selected set.
        selectedKeys.remove();
        // Get the transport context attached to the selection key.
        final Object attachment = selectionKey.attachment();
        if (attachment instanceof StationTransport) {
          final StationTransport context = (StationTransport) attachment;
          try {
            // Dispatch I/O readiness events for the transport.
            this.select(selectionKey, context);
          } catch (Throwable cause) {
            if (!Cont.isNonFatal(cause)) {
              // Rethrow fatal exception.
              throw cause;
            }
            // Inform station of non-fatal reflow exception.
            this.station.transportDidFail(context.transport, cause);
          }
        }
      }
    }
  }

  /**
   * Dispatches I/O readiness events for the given transport {@code context}.
   */
  void select(SelectionKey selectionKey, StationTransport context) {
    try {
      // Get the set of ready I/O operations for the transport channel.
      final int readyOps = selectionKey.readyOps();
      if ((readyOps & SelectionKey.OP_ACCEPT) != 0) {
        // Dispatch the ready transport accept operation.
        this.doAccept(selectionKey, context);
      }
      if ((readyOps & SelectionKey.OP_CONNECT) != 0) {
        // Dispatch the ready transport connect operation.
        this.doConnect(selectionKey, context);
      }
      if ((readyOps & SelectionKey.OP_READ) != 0) {
        // Dispatch the ready transport read operation.
        this.doRead(selectionKey, context);
      }
      if ((readyOps & SelectionKey.OP_WRITE) != 0) {
        // Dispatch the ready transport write operation.
        this.doWrite(selectionKey, context);
      }
    } catch (CancelledKeyException cause) {
      // Transport closed during select operation; complete the close.
      context.didClose();
    }
  }

  /**
   * Checks all transports registered with the I/O selector for idle timeouts.
   */
  void checkIdle() {
    final TransportSettings transportSettings = this.station.transportSettings;
    final long now = System.currentTimeMillis();
    if (now - this.lastIdleCheck >= transportSettings.idleInterval) {
      // Idle interval has elapsed since last timeout check.
      final Iterator<SelectionKey> keys = this.selector.keys().iterator();
      // Loop over all selection keys registered with the I/O selector.
      while (keys.hasNext()) {
        final SelectionKey key = keys.next();
        final StationTransport context = (StationTransport) key.attachment();
        if (context != null) {
          // Ask the transport for its desired idle timeout.
          long idleTimeout = context.idleTimeout();
          if (idleTimeout < 0L) {
            // Negative idle timeout means use the default idle timeout.
            idleTimeout = transportSettings.idleTimeout;
          }
          // Zero indicates no idle timeout.
          if (idleTimeout > 0L && now - context.lastSelectTime > idleTimeout) {
            Throwable failure = null;
            // Idle timeout has elapsed.
            try {
              // Close the transport channel.
              key.channel().close();
            } catch (IOException cause) {
              failure = cause;
            }
            try {
              // Timeout the transport.
              context.didTimeout();
            } catch (Throwable cause) {
              if (!Cont.isNonFatal(cause)) {
                // Rethrhrow fatal exception.
                throw cause;
              }
              failure = cause;
            }
            try {
              // Close the transport.
              context.didClose();
            } catch (Throwable cause) {
              if (!Cont.isNonFatal(cause)) {
                // Rethrhrow fatal exception.
                throw cause;
              }
              failure = cause;
            }
            if (failure != null) {
              // Report the transport failure.
              this.station.transportDidFail(context.transport, failure);
            }
          }
        }
      }
      // Update last timeout check time.
      this.lastIdleCheck = now;
    }
  }

  /**
   * Dispatches a ready accept operation on the transport {@code context} in
   * response to a selection on its {@code selectionKey}.
   */
  void doAccept(SelectionKey selectionKey, StationTransport context) {
    context.lastSelectTime = System.currentTimeMillis();
    context.doAccept();
  }

  /**
   * Dispatches a ready connect operation on the transport {@code context} in
   * response to a selection on its {@code selectionKey}. Clears the {@code
   * selectionKey}'s {@code OP_CONNECT} interest op to prevent the connect
   * operation from being redispatched until reselected by the transport.
   */
  void doConnect(SelectionKey selectionKey, StationTransport context) {
    selectionKey.interestOps(selectionKey.interestOps() & ~SelectionKey.OP_CONNECT);
    context.lastSelectTime = System.currentTimeMillis();
    context.doConnect();
  }

  /**
   * Dispatches a ready read operation on the transport {@code context} in
   * response to a selection on its {@code selectionKey}. Clears the {@code
   * selectionKey}'s {@code OP_READ} interest op to prevent the read operation
   * operation from being redispatched until reselected by the transport.
   */
  void doRead(SelectionKey selectionKey, StationTransport context) {
    selectionKey.interestOps(selectionKey.interestOps() & ~SelectionKey.OP_READ);
    context.lastSelectTime = System.currentTimeMillis();
    context.cueRead();
  }

  /**
   * Dispatches a ready write operation on the transport {@code context} in
   * response to a selection on its {@code selectionKey}. Clears the {@code
   * selectionKey}'s {@code OP_WRITE} interest op to prevent the write
   * operation from being retriggered until reselected by the transport.
   */
  void doWrite(SelectionKey selectionKey, StationTransport context) {
    selectionKey.interestOps(selectionKey.interestOps() & ~SelectionKey.OP_WRITE);
    context.lastSelectTime = System.currentTimeMillis();
    context.cueWrite();
  }

  /**
   * Closes all transports registered with the I/O selector.
   */
  void closeAll() {
    for (SelectionKey selectionKey : this.selector.keys()) {
      final StationTransport context = (StationTransport) selectionKey.attachment();
      if (context != null) {
        try {
          context.close();
        } catch (Throwable cause) {
          if (!Cont.isNonFatal(cause)) {
            // Rethrow fatal exception.
            throw cause;
          }
          // Report transport close error.
          this.station.transportDidFail(context.transport, cause);
        }
      }
    }
  }

  /**
   * Total number of selector threads that have ever been instantiated. Used
   * to uniquely name selector threads.
   */
  static final AtomicInteger THREAD_COUNT = new AtomicInteger(0);

}
