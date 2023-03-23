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

package swim.net.ws;

import java.io.IOException;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.util.Objects;
import javax.net.ssl.SSLSession;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.BinaryInputBuffer;
import swim.codec.BinaryOutputBuffer;
import swim.codec.Decode;
import swim.codec.Encode;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.log.Log;
import swim.log.LogScope;
import swim.net.FlowContext;
import swim.net.NetSocket;
import swim.net.NetSocketContext;
import swim.net.TcpEndpoint;
import swim.net.http.HttpSocketContext;
import swim.repr.Repr;
import swim.repr.TupleRepr;
import swim.util.Assume;
import swim.util.Result;
import swim.util.Severity;
import swim.ws.WsCloseFrame;
import swim.ws.WsContinuation;
import swim.ws.WsDataFrame;
import swim.ws.WsDecoder;
import swim.ws.WsEncoder;
import swim.ws.WsEngine;
import swim.ws.WsException;
import swim.ws.WsFragment;
import swim.ws.WsFrame;
import swim.ws.WsOptions;

@Public
@Since("5.0")
public class WebSocketStream implements NetSocket, FlowContext, WebSocketContext {

  protected final WebSocket webSocket;
  protected final HttpRequest<?> handshakeRequest;
  protected final HttpResponse<?> handshakeResponse;
  protected final WsOptions options;
  protected final WsDecoder decoder;
  protected final WsEncoder encoder;
  protected final BinaryInputBuffer readBuffer;
  protected final BinaryOutputBuffer writeBuffer;
  protected @Nullable NetSocketContext context;
  @Nullable Decode<? extends WsFrame<?>> decode;
  @Nullable WsFragment<?> fragment;
  @Nullable WsFrame<?> pending;
  @Nullable WsCloseFrame<?> failure;
  @Nullable Encode<? extends WsFrame<?>> encode;
  @Nullable WsContinuation<?> continuation;
  int status;
  Log log;

  public WebSocketStream(WebSocket webSocket,
                         HttpRequest<?> handshakeRequest,
                         HttpResponse<?> handshakeResponse,
                         WsOptions options,
                         WsDecoder decoder,
                         WsEncoder encoder,
                         BinaryInputBuffer readBuffer,
                         BinaryOutputBuffer writeBuffer) {
    // Initialize websocket parameters.
    this.webSocket = webSocket;
    this.handshakeRequest = handshakeRequest;
    this.handshakeResponse = handshakeResponse;
    this.options = options;
    this.decoder = decoder;
    this.encoder = encoder;

    // Initialize I/O buffers.
    this.readBuffer = readBuffer;
    this.writeBuffer = writeBuffer;

    // Initialize socket context.
    this.context = null;

    // Initialize decode state.
    this.decode = null;
    this.fragment = null;

    // Initialize encode state.
    this.pending = null;
    this.failure = null;
    this.encode = null;
    this.continuation = null;

    // Initialize status.
    this.status = 0;

    // Initialize the websocket log.
    this.log = this.initLog();
  }

  public WebSocketStream(WebSocket webSocket,
                         HttpRequest<?> handshakeRequest,
                         HttpResponse<?> handshakeResponse,
                         WsEngine engine,
                         HttpSocketContext socket) {
    this(webSocket, handshakeRequest, handshakeResponse,
         engine.options(), engine.decoder(), engine.encoder(),
         socket.readBuffer(), socket.writeBuffer());
  }

  public Log log() {
    return this.log;
  }

  protected String logFocus() {
    final NetSocketContext context = this.context;
    if (context != null) {
      final InetSocketAddress remoteAddress = context.remoteAddress();
      if (remoteAddress != null) {
        return TcpEndpoint.endpointAddress(remoteAddress);
      }
    }
    return "";
  }

  protected Log initLog() {
    return Log.forTopic("swim.net.ws").withFocus(this.logFocus());
  }

  public void setLog(Log log) {
    Objects.requireNonNull(log);
    this.log = log.withFocus(this.logFocus());
  }

  String protocol() {
    final NetSocketContext context = this.context;
    if (context != null && context.sslSession() != null) {
      return "wss";
    } else {
      return "ws";
    }
  }

  @Override
  public final WebSocket webSocket() {
    return this.webSocket;
  }

  @Override
  public final WsOptions options() {
    return this.options;
  }

  @Override
  public final HttpRequest<?> handshakeRequest() {
    return this.handshakeRequest;
  }

  @Override
  public final HttpResponse<?> handshakeResponse() {
    return this.handshakeResponse;
  }

  @Override
  public final @Nullable NetSocketContext socketContext() {
    return this.context;
  }

  @Override
  public void setSocketContext(@Nullable NetSocketContext context) {
    this.context = context;
    this.webSocket.setWebSocketContext(this);
  }

  @Override
  public long idleTimeout() {
    return this.webSocket.idleTimeout();
  }

  @Override
  public final boolean isClient() {
    final NetSocketContext context = this.context;
    return context != null && context.isClient();
  }

  @Override
  public final boolean isServer() {
    final NetSocketContext context = this.context;
    return context != null && context.isServer();
  }

  @Override
  public final boolean isOpen() {
    final NetSocketContext context = this.context;
    return context != null && context.isOpen();
  }

  @Override
  public final @Nullable InetSocketAddress localAddress() {
    final NetSocketContext context = this.context;
    return context != null ? context.localAddress() : null;
  }

  @Override
  public final @Nullable InetSocketAddress remoteAddress() {
    final NetSocketContext context = this.context;
    return context != null ? context.remoteAddress() : null;
  }

  @Override
  public final @Nullable SSLSession sslSession() {
    final NetSocketContext context = this.context;
    return context != null ? context.sslSession() : null;
  }

  @Override
  public void didOpen() {
    this.log.infoEntity("upgraded websocket", this.webSocket);

    this.webSocket.didOpen();
  }

  @Override
  public boolean readFrame() {
    int status = (int) STATUS.getOpaque(this);
    do {
      final int oldStatus = status;
      final int newStatus = status | READ_REQUEST;
      status = (int) STATUS.compareAndExchangeRelease(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;
        if ((oldStatus & READ_REQUEST) == 0) {
          // Trigger a read to begin reading a websocket frame.
          this.triggerRead();
          return true;
        } else {
          return false;
        }
      } else {
        // CAS failed; try again.
        continue;
      }
    } while (true);
  }

  @Override
  public boolean requestRead() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound websocket stream");
    }
    return context.requestRead();
  }

  @Override
  public boolean cancelRead() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound websocket stream");
    }
    return context.cancelRead();
  }

  @Override
  public boolean triggerRead() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound websocket stream");
    }
    return context.triggerRead();
  }

  @Override
  public boolean requestInput() {
    final int readState = ((int) STATUS.getOpaque(this) & DECODE_MASK) >>> DECODE_SHIFT;
    if (readState == DECODE_FRAME || FRAGMENT.getOpaque(this) != null) {
      return this.requestRead();
    } else {
      return false;
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  @Override
  public void doRead() throws IOException {
    final LogScope scope = LogScope.swapCurrent(this.protocol());
    LogScope.push("read");
    try {
      int status = (int) STATUS.getOpaque(this);

      // Read data from the socket into the read buffer.
      final int count = this.read(this.readBuffer.byteBuffer());
      if (count < 0) {
        // Signal the end of input.
        this.readBuffer.asLast(true);
      }
      // Prepare to consume data from the read buffer.
      this.readBuffer.flip();

      // Loop while frames continue to be successfully decoded from the read buffer.
      do {
        if ((status & DECODE_MASK) >>> DECODE_SHIFT == DECODE_READY) {
          status = this.decodeReady(status);
        }
        if ((status & DECODE_MASK) >>> DECODE_SHIFT == DECODE_FRAME) {
          status = this.decodeFrame(status);
          if ((status & DECODE_MASK) >>> DECODE_SHIFT == DECODE_READY) {
            // Try to decode another frame from the read buffer.
            continue;
          }
        }
        break;
      } while (true);

      if (this.isDoneReading()) {
        // Close the socket for reading.
        Assume.nonNull(this.context).doneReading();
      }
    } finally {
      // Prepare the read buffer for the next read.
      this.readBuffer.compact();
      LogScope.pop();
      LogScope.setCurrent(scope);
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int decodeReady(int status) {
    // Don't initiate the frame read until data is available.
    if (!this.readBuffer.hasRemaining()) {
      if (!this.readBuffer.isLast()) {
        // No data is available yet.
        this.requestRead();
      } else {
        // The socket closed before the frame was initiated;
        // close the socket for reading.
        this.doneReading();
      }
      return status;
    }

    // Transition to the decode frame state.
    do {
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_FRAME << DECODE_SHIFT);
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;
        // Initiate a frame read.
        this.willReadFrame();
        // Re-check status to pick up any callback changes.
        status = (int) STATUS.getAcquire(this);
        break;
      } else {
        // CAS failed; try again.
        continue;
      }
    } while (true);

    return status;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int decodeFrame(int status) {
    // Decode a frame from the read buffer.
    Decode<? extends WsFrame<?>> decode = (Decode<? extends WsFrame<?>>) DECODE.getOpaque(this);
    try {
      if (decode == null) {
        if ((status & READ_REQUEST) == 0) {
          // readFrame not yet called.
          return status;
        }
        final WsFragment<?> fragment = (WsFragment<?>) FRAGMENT.getOpaque(this);
        if (fragment == null) {
          decode = this.decoder.decodeMessage(this.readBuffer, this.webSocket);
        } else {
          decode = this.decoder.decodeContinuation(this.readBuffer, this.webSocket,
                                                   Assume.conforms(fragment));
        }
      } else {
        decode = decode.consume(this.readBuffer);
      }
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        decode = Decode.error(cause);
      } else {
        throw cause;
      }
    }
    // Store the frame decode continuation.
    DECODE.setOpaque(this, decode);

    if (decode.isCont()) {
      // The frame is still being decoded; propagate backpressure.
      if (!decode.backoff(this)) {
        // No backpressure; yield until the socket has more data.
        this.requestRead();
      } else {
        // Yield until the frame decoder requests another read.
      }
    } else if (decode.isDone()) {
      // Unwrap the successfully decoded frame.
      final WsFrame<?> frame = decode.getNonNull();
      // Transition to the decode ready or decode close state.
      do {
        final int oldStatus = status;
        final int newStatus;
        if (!(frame instanceof WsCloseFrame<?>)) {
          newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_READY << DECODE_SHIFT);
        } else {
          newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_CLOSE << DECODE_SHIFT);
        }
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Reset the frame decode state.
          DECODE.setOpaque(this, null);
          // Check if a fragment was decoded.
          if (frame instanceof WsFragment<?>) {
            // Store the fragment so that message decoding can be resumed.
            FRAGMENT.setOpaque(this, frame);
          } else if (frame instanceof WsDataFrame<?>) {
            // Finished reading a message; reset fragment state.
            FRAGMENT.setOpaque(this, null);
          } else if (frame instanceof WsCloseFrame<?>) {
            // A close frame was decoded; don't decode any more frames.
            this.doneReading();
          }
          // Complete the frame read.
          this.didReadFrame(Result.ok(frame));
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (decode.isError()) {
      // Failed to decode the frame;
      // transition to the decode error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_ERROR << DECODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Close the socket for reading.
          this.doneReading();
          // Complete the frame read with the decode error;
          // the websocket can write a close frame or close the socket.
          this.didReadFrame(Result.error(decode.getError()));
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else {
      throw new AssertionError(); // unreachable
    }

    return status;
  }

  int read(ByteBuffer readBuffer) throws IOException {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound websocket stream");
    }
    return context.read(readBuffer);
  }

  protected void willReadFrame() {
    this.log.traceEntity("reading frame", this.webSocket);

    try {
      // Invoke willReadFrame websocket callback.
      this.webSocket.willReadFrame();
    } catch (WsException cause) {
      // Report the exception.
      this.log.warningStatus("willReadFrame callback failed", this.webSocket, cause);
      // Fail the websocket with an error.
      this.writeClose(WsCloseFrame.error(cause));
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willReadFrame callback failed", this.webSocket, cause);
        // Fail the websocket with an error.
        this.writeClose(WsCloseFrame.error(cause));
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didReadFrame(Result<? extends WsFrame<?>> frame) {
    if (frame.isError()) {
      this.log.warningStatus("failed to read frame", this.webSocket, frame.getError());
    } else if (this.log.handles(Severity.DEBUG)) {
      this.log.debug("read frame", this.toLogFrame(frame.getNonNull()));
    }

    try {
      // Invoke didReadFrame websocket callback.
      this.webSocket.didReadFrame(frame);
    } catch (WsException cause) {
      // Report the exception.
      this.log.warningStatus("didReadFrame callback failed", this.webSocket, cause);
      // Fail the websocket with an error.
      this.writeClose(WsCloseFrame.error(cause));
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didReadFrame callback failed", this.webSocket, cause);
        // Fail the websocket with an error.
        this.writeClose(WsCloseFrame.error(cause));
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  @Override
  public boolean writeFrame(WsFrame<?> frame) {
    if (PENDING.compareAndExchangeRelease(this, null, frame) != null) {
      return false;
    }
    // Trigger a write to begin writing the websocket frame.
    this.triggerWrite();
    return true;
  }

  @Override
  public boolean writeContinuation() {
    final WsContinuation<?> continuation = (WsContinuation<?>) CONTINUATION.getOpaque(this);
    if (continuation == null) {
      throw new IllegalStateException("No continuation frame");
    }
    return this.writeFrame(continuation);
  }

  protected boolean writeClose(WsCloseFrame<?> frame) {
    if (FAILURE.compareAndExchangeRelease(this, null, frame) != null) {
      return false;
    }
    // Trigger a write to begin writing the websocket frame.
    this.triggerWrite();
    return true;
  }

  @Override
  public boolean requestWrite() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound websocket stream");
    }
    return context.requestWrite();
  }

  @Override
  public boolean cancelWrite() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound websocket stream");
    }
    return context.cancelWrite();
  }

  @Override
  public boolean triggerWrite() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound websocket stream");
    }
    return context.triggerWrite();
  }

  @Override
  public boolean requestOutput() {
    final int writeState = ((int) STATUS.getOpaque(this) & ENCODE_MASK) >>> ENCODE_SHIFT;
    if (writeState == ENCODE_FRAME || CONTINUATION.getOpaque(this) != null) {
      return this.requestWrite();
    } else {
      return false;
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  @Override
  public void doWrite() throws IOException {
    final LogScope scope = LogScope.swapCurrent(this.protocol());
    LogScope.push("write");
    try {
      // Loop while frames continue to be successfully encoded into the write buffer.
      int status = (int) STATUS.getOpaque(this);
      do {
        if ((status & ENCODE_MASK) >>> ENCODE_SHIFT == ENCODE_READY) {
          status = this.encodeReady(status);
        }
        if ((status & ENCODE_MASK) >>> ENCODE_SHIFT == ENCODE_FRAME) {
          status = this.encodeFrame(status);
          if ((status & ENCODE_MASK) >>> ENCODE_SHIFT == ENCODE_READY) {
            // Try to encode another frame into the write buffer.
            continue;
          }
        }
        break;
      } while (true);

      // Prepare to transfer data from the write buffer to the socket.
      this.writeBuffer.flip();
      if (this.writeBuffer.hasRemaining()) {
        // Write data from the write buffer to the socket.
        this.write(this.writeBuffer.byteBuffer());
      }
      if (this.writeBuffer.position() != 0) {
        // The write buffer has not been fully written to the socket;
        // yield until the socket is ready to write more data.
        this.requestWrite();
      } else if (this.isDoneWriting()) {
        // Close the socket for writing.
        Assume.nonNull(this.context).doneWriting();
      }
    } finally {
      // Prepare the write buffer for the next write.
      this.writeBuffer.compact();
      LogScope.pop();
      LogScope.setCurrent(scope);
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int encodeReady(int status) {
    // Transition to the encode frame state.
    do {
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_FRAME << ENCODE_SHIFT);
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;
        // Initiate the frame write.
        this.willWriteFrame();
        // Re-check status to pick up any callback changes.
        status = (int) STATUS.getAcquire(this);
        break;
      } else {
        // CAS failed; try again.
        continue;
      }
    } while (true);

    return status;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int encodeFrame(int status) {
    // Encode a frame into the write buffer.
    Encode<? extends WsFrame<?>> encode = (Encode<? extends WsFrame<?>>) ENCODE.getOpaque(this);
    try {
      if (encode == null) {
        // Check for a pending close frame.
        WsFrame<?> frame = (WsCloseFrame<?>) FAILURE.getOpaque(this);
        if (frame == null) {
          // Otherwise check for a pending frame.
          frame = (WsFrame<?>) PENDING.getAndSetAcquire(this, null);
        }
        if (frame == null) {
          // writeFrame not yet called.
          return status;
        }
        if (!(frame instanceof WsContinuation<?>)) {
          encode = this.encoder.encodeMessage(this.writeBuffer, frame);
        } else {
          encode = this.encoder.encodeContinuation(this.writeBuffer, (WsContinuation<?>) frame);
        }
      } else {
        encode = encode.produce(this.writeBuffer);
      }
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        encode = Encode.error(cause);
      } else {
        throw cause;
      }
    }
    // Store the frame encode continuation.
    ENCODE.setOpaque(this, encode);

    if (encode.isCont()) {
      // The frame is still being encoded; propagate backpressure.
      if (!encode.backoff(this)) {
        // No backpressure; yield until the socket is ready for more data.
        this.requestWrite();
      } else {
        // Yield until the frame encoder requests another write.
      }
    } else if (encode.isDone()) {
      // Unwrap the successfully encoded frame.
      final WsFrame<?> frame = encode.getNonNull();
      // Transition to the encode ready or encode close state.
      do {
        final int oldStatus = status;
        final int newStatus;
        if (!(frame instanceof WsCloseFrame<?>)) {
          newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_READY << ENCODE_SHIFT);
        } else {
          newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_CLOSE << ENCODE_SHIFT);
        }
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Reset the frame encode state.
          ENCODE.setOpaque(this, null);
          // Check if a fragment was encoded.
          if (frame instanceof WsFragment<?>) {
            // Store the continuation so that message encoding can be resumed.
            CONTINUATION.setOpaque(this, frame);
          } else if (frame instanceof WsDataFrame<?>) {
            // Finished writing a message; reset continuation state.
            CONTINUATION.setOpaque(this, null);
          } else if (frame instanceof WsCloseFrame<?>) {
            // A close frame was encoded; don't encode any more frames.
            this.doneWriting();
          }
          // Complete the frame write.
          this.didWriteFrame(Result.ok(frame));
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (encode.isError()) {
      // Failed to encode the frame;
      // transition to the encode error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_ERROR << ENCODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Close the socket for writing.
          this.doneWriting();
          // Complete the frame write with the encode error;
          // the websocket should close the socket.
          this.didWriteFrame(Result.error(encode.getError()));
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else {
      throw new AssertionError(); // unreachable
    }

    return status;
  }

  int write(ByteBuffer writeBuffer) throws IOException {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound websocket stream");
    }
    return context.write(writeBuffer);
  }

  protected void willWriteFrame() {
    this.log.traceEntity("writing frame", this.webSocket);

    try {
      // Invoke willWriteFrame websocket callback.
      this.webSocket.willWriteFrame();
    } catch (WsException cause) {
      // Report the exception.
      this.log.warningStatus("willWriteFrame callback failed", this.webSocket, cause);
      // Fail the websocket with an error.
      this.writeClose(WsCloseFrame.error(cause));
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willWriteFrame callback failed", this.webSocket, cause);
        // Fail the websocket with an error.
        this.writeClose(WsCloseFrame.error(cause));
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didWriteFrame(Result<? extends WsFrame<?>> frame) {
    if (frame.isError()) {
      this.log.warningStatus("failed to write frame", this.webSocket, frame.getError());
    } else if (this.log.handles(Severity.DEBUG)) {
      this.log.debug("wrote frame", this.toLogFrame(frame.getNonNull()));
    }

    try {
      // Invoke didWriteFrame websocket callback.
      this.webSocket.didWriteFrame(frame);
    } catch (WsException cause) {
      // Report the exception.
      this.log.warningStatus("didWriteFrame callback failed", this.webSocket, cause);
      // Fail the websocket with an error.
      this.writeClose(WsCloseFrame.error(cause));
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didWriteFrame callback failed", this.webSocket, cause);
        // Fail the websocket with an error.
        this.writeClose(WsCloseFrame.error(cause));
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  @Override
  public final boolean isClosing() {
    final NetSocketContext context = this.context;
    if (context == null || !context.isOpen()) {
      return false;
    }
    final int status = (int) STATUS.getOpaque(this);
    return (status & DECODE_MASK) >>> DECODE_SHIFT == DECODE_CLOSE
        || (status & ENCODE_MASK) >>> ENCODE_SHIFT == ENCODE_CLOSE;
  }

  @Override
  public final boolean isDoneReading() {
    return ((int) STATUS.getOpaque(this) & READ_DONE) != 0;
  }

  @Override
  public boolean doneReading() {
    int status = (int) STATUS.getOpaque(this);
    do {
      final int oldStatus = status;
      final int newStatus = status | READ_DONE;
      status = (int) STATUS.compareAndExchangeRelease(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;
        if ((oldStatus & READ_DONE) == 0) {
          // Trigger a read to close the socket for reading.
          this.triggerRead();
          return true;
        } else {
          return false;
        }
      } else {
        // CAS failed; try again.
        continue;
      }
    } while (true);
  }

  @Override
  public final boolean isDoneWriting() {
    return ((int) STATUS.getOpaque(this) & WRITE_DONE) != 0;
  }

  @Override
  public boolean doneWriting() {
    int status = (int) STATUS.getOpaque(this);
    do {
      final int oldStatus = status;
      final int newStatus = status | WRITE_DONE;
      status = (int) STATUS.compareAndExchangeRelease(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;
        if ((oldStatus & WRITE_DONE) == 0) {
          // Trigger a write to close the socket for writing.
          this.triggerWrite();
          return true;
        } else {
          return false;
        }
      } else {
        // CAS failed; try again.
        continue;
      }
    } while (true);
  }

  @Override
  public void doTimeout() throws IOException {
    this.webSocket.doTimeout();
  }

  @Override
  public void close() {
    final NetSocketContext context = this.context;
    if (context != null) {
      context.close();
    }
  }

  @Override
  public void willClose() throws IOException {
    this.log.debugEntity("closing websocket", this.webSocket);

    this.webSocket.willClose();
  }

  @Override
  public void didClose() throws IOException {
    this.log.info("closed websocket");

    this.webSocket.didClose();
  }

  @Nullable Object toLogFrame(WsFrame<?> frame) {
    final TupleRepr detail = TupleRepr.of();
    detail.put("type", Repr.of(frame.frameType().toString()));
    detail.put("fin", Repr.of(frame.fin()));
    return detail;
  }

  static final int READ_REQUEST = 1 << 0;
  static final int READ_DONE = 1 << 1;
  static final int WRITE_DONE = 1 << 2;

  static final int FLAG_BITS = 3;
  static final int FLAG_MASK = (1 << FLAG_BITS) - 1;

  static final int DECODE_READY = 0;
  static final int DECODE_FRAME = 1;
  static final int DECODE_CLOSE = 2;
  static final int DECODE_ERROR = 3;

  static final int DECODE_SHIFT = FLAG_BITS;
  static final int DECODE_BITS = 2;
  static final int DECODE_MASK = ((1 << DECODE_BITS) - 1) << DECODE_SHIFT;

  static final int ENCODE_READY = 0;
  static final int ENCODE_FRAME = 1;
  static final int ENCODE_CLOSE = 2;
  static final int ENCODE_ERROR = 3;

  static final int ENCODE_SHIFT = DECODE_SHIFT + DECODE_BITS;
  static final int ENCODE_BITS = 2;
  static final int ENCODE_MASK = ((1 << ENCODE_BITS) - 1) << ENCODE_SHIFT;

  /**
   * {@code VarHandle} for atomically accessing the {@link #decode} field.
   */
  static final VarHandle DECODE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #fragment} field.
   */
  static final VarHandle FRAGMENT;

  /**
   * {@code VarHandle} for atomically accessing the {@link #pending} field.
   */
  static final VarHandle PENDING;

  /**
   * {@code VarHandle} for atomically accessing the {@link #failure} field.
   */
  static final VarHandle FAILURE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #encode} field.
   */
  static final VarHandle ENCODE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #continuation} field.
   */
  static final VarHandle CONTINUATION;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      DECODE = lookup.findVarHandle(WebSocketStream.class, "decode", Decode.class);
      FRAGMENT = lookup.findVarHandle(WebSocketStream.class, "fragment", WsFragment.class);
      PENDING = lookup.findVarHandle(WebSocketStream.class, "pending", WsFrame.class);
      FAILURE = lookup.findVarHandle(WebSocketStream.class, "failure", WsCloseFrame.class);
      ENCODE = lookup.findVarHandle(WebSocketStream.class, "encode", Encode.class);
      CONTINUATION = lookup.findVarHandle(WebSocketStream.class, "continuation", WsContinuation.class);
      STATUS = lookup.findVarHandle(WebSocketStream.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
