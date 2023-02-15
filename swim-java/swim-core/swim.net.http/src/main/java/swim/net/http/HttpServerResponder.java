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

package swim.net.http;

import java.io.IOException;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.net.InetSocketAddress;
import java.nio.channels.ClosedChannelException;
import javax.net.ssl.SSLSession;
import swim.annotations.Nullable;
import swim.codec.BinaryOutputBuffer;
import swim.codec.Decode;
import swim.codec.Encode;
import swim.codec.InputFuture;
import swim.codec.OutputFuture;
import swim.http.HttpBody;
import swim.http.HttpChunked;
import swim.http.HttpEmpty;
import swim.http.HttpPayload;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.log.LogScope;
import swim.net.NetSocket;
import swim.repr.Repr;
import swim.repr.TupleRepr;
import swim.util.Severity;

final class HttpServerResponder implements HttpResponderContext, InputFuture, OutputFuture {

  final HttpServerSocket socket;
  final HttpResponder responder;
  @Nullable Decode<? extends HttpRequest<?>> decodeMessage;
  @Nullable Decode<? extends HttpPayload<?>> decodePayload;
  @Nullable Encode<? extends HttpResponse<?>> encodeMessage;
  @Nullable Encode<? extends HttpPayload<?>> encodePayload;
  int status;

  HttpServerResponder(HttpServerSocket socket, HttpResponder responder) {
    // Initialize responder parameters.
    this.socket = socket;
    this.responder = responder;

    // Initialize responder transcoders.
    this.decodeMessage = null;
    this.decodePayload = null;
    this.encodeMessage = null;
    this.encodePayload = null;

    // Initialize responder status.
    this.status = 0;
  }

  @Override
  public HttpOptions httpOptions() {
    return this.socket.httpOptions();
  }

  @Override
  public boolean isClient() {
    return this.socket.isClient();
  }

  @Override
  public boolean isServer() {
    return this.socket.isServer();
  }

  @Override
  public boolean isOpening() {
    return this.socket.isOpening();
  }

  @Override
  public boolean isOpen() {
    return this.socket.isOpen();
  }

  @Override
  public @Nullable InetSocketAddress localAddress() {
    return this.socket.localAddress();
  }

  @Override
  public @Nullable InetSocketAddress remoteAddress() {
    return this.socket.remoteAddress();
  }

  @Override
  public @Nullable SSLSession sslSession() {
    return this.socket.sslSession();
  }

  @Override
  public boolean isReading() {
    final int readState = ((int) STATUS.getOpaque(this) & READ_MASK) >>> READ_SHIFT;
    return readState == READ_MESSAGE || readState == READ_PAYLOAD;
  }

  @Override
  public boolean isDoneReading() {
    final int readState = ((int) STATUS.getOpaque(this) & READ_MASK) >>> READ_SHIFT;
    return readState == READ_DONE;
  }

  @Override
  public boolean readRequestMessage(Decode<? extends HttpRequest<?>> decodeMessage) {
    if (DECODE_MESSAGE.compareAndExchangeRelease(this, null, decodeMessage) == null) {
      if (((int) STATUS.getAcquire(this) & READ_MASK) >>> READ_SHIFT == READ_MESSAGE) {
        this.socket.triggerRead();
      }
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean readRequestPayload(Decode<? extends HttpPayload<?>> decodePayload) {
    if (DECODE_PAYLOAD.compareAndExchangeRelease(this, null, decodePayload) == null) {
      if (((int) STATUS.getAcquire(this) & READ_MASK) >>> READ_SHIFT == READ_PAYLOAD) {
        this.socket.triggerRead();
      }
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean requestInput() {
    final int readState = ((int) STATUS.getOpaque(this) & READ_MASK) >>> READ_SHIFT;
    if (readState == READ_PAYLOAD) {
      return this.socket.requestRead();
    } else {
      return false;
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  void doRead() throws IOException {
    final LogScope scope = LogScope.swapCurrent("responder");
    LogScope.push("read");
    try {
      int status = (int) STATUS.getOpaque(this);

      if ((status & READ_MASK) >>> READ_SHIFT == READ_PENDING) {
        status = this.doReadInitial(status);
      }

      if ((status & READ_MASK) >>> READ_SHIFT == READ_MESSAGE) {
        status = this.doReadMessage(status);
      }

      if ((status & READ_MASK) >>> READ_SHIFT == READ_PAYLOAD) {
        status = this.doReadPayload(status);
      }
    } finally {
      LogScope.pop();
      LogScope.setCurrent(scope);
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int doReadInitial(int status) throws IOException {
    // Don't initiate the request until data is available.
    if (this.socket.readBuffer.position() == 0) {
      // Perform an initial read to check for socket closure.
      final int count = this.socket.read(this.socket.readBuffer);
      if (count == 0) {
        // No data is available yet.
        this.socket.requestRead();
        return status;
      } else if (count < 0) {
        // End of stream.
        this.socket.inputBuffer.asLast(true);
        // Close the read end of the socket.
        this.socket.doneReading();
        // Dequeue the responder from the requester queue.
        this.socket.dequeueRequester(this);
        return status;
      }
    }

    // Enqueue the responder in the responder queue.
    // Don't initiate the request until the response has been enqueue.
    if (!this.socket.enqueueResponder(this)) {
      // The responder queue is full; discontinue reading requests to propagate
      // response processing backpressure to the client until a slot opens up
      // in the responder queue.
      this.socket.log.debug("pipeline full");
      return status;
    }

    do {
      if ((status & READ_MASK) >>> READ_SHIFT != READ_PENDING) {
        throw new AssertionError();
      }
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~READ_MASK) | (READ_MESSAGE << READ_SHIFT);
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;

        this.willReadRequest();

        this.willReadRequestMessage();

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
  int doReadMessage(int status) throws IOException {
    Decode<? extends HttpRequest<?>> decodeMessage = (Decode<? extends HttpRequest<?>>) DECODE_MESSAGE.getOpaque(this);
    if (decodeMessage == null) {
      return status;
    }

    try {
      final int count = this.socket.read(this.socket.readBuffer);
      if (count < 0) {
        this.socket.inputBuffer.asLast(true);
      }
      this.socket.readBuffer.flip();
      decodeMessage = decodeMessage.consume(this.socket.inputBuffer);
    } finally {
      this.socket.readBuffer.compact();
      DECODE_MESSAGE.setOpaque(this, decodeMessage);
    }

    if (decodeMessage.isCont()) {
      this.socket.requestRead();
    } else if (decodeMessage.isDone()) {
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_PAYLOAD << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          final HttpRequest<?> request = decodeMessage.getNonNull();

          this.didReadRequestMessage(request);

          // Request a write to ensure that response processing begins.
          this.socket.requestWrite();

          this.willReadRequestPayload(request);

          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (decodeMessage.isError()) {
      decodeMessage.checkError(); // FIXME: Return error response.
    } else {
      throw new AssertionError(); // unreachable
    }

    return status;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int doReadPayload(int status) throws IOException {
    Decode<? extends HttpPayload<?>> decodePayload = (Decode<? extends HttpPayload<?>>) DECODE_PAYLOAD.getOpaque(this);
    if (decodePayload == null) {
      return status;
    }

    try {
      final int count = this.socket.read(this.socket.readBuffer);
      if (count < 0) {
        this.socket.inputBuffer.asLast(true);
      }
      this.socket.readBuffer.flip();
      decodePayload = decodePayload.consume(this.socket.inputBuffer);
    } finally {
      this.socket.readBuffer.compact();
      DECODE_PAYLOAD.setOpaque(this, decodePayload);
    }

    if (decodePayload.isCont()) {
      if (!decodePayload.backoff(this)) {
        this.socket.requestRead();
      }
    } else if (decodePayload.isDone()) {
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_DONE << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          final Decode<HttpRequest<?>> decodeMessage = (Decode<HttpRequest<?>>) DECODE_MESSAGE.getOpaque(this);
          final HttpPayload<?> payload = decodePayload.getNonNull();
          final HttpRequest<?> request = decodeMessage.getNonNull().withPayload(payload);
          DECODE_MESSAGE.setRelease(this, Decode.done(request));

          this.didReadRequestPayload(request);

          // Dequeue the responder from the requester queue.
          this.socket.dequeueRequester(this);

          this.didReadRequest(request);

          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (decodePayload.isError()) {
      decodePayload.checkError(); // FIXME: Return error response.
    } else {
      throw new AssertionError(); // unreachable
    }

    return status;
  }

  void willReadRequest() {
    this.socket.log.traceEntity("reading request", this.responder);

    this.socket.willReadRequest(this.responder);
    this.responder.willReadRequest();
  }

  void willReadRequestMessage() {
    this.socket.log.traceEntity("reading request message", this.responder);

    this.socket.willReadRequestMessage(this.responder);
    this.responder.willReadRequestMessage();
  }

  void didReadRequestMessage(HttpRequest<?> request) {
    this.responder.didReadRequestMessage(request);
    this.socket.didReadRequestMessage(request, this.responder);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read request message", this.toLogRequest(request));
    }
  }

  void willReadRequestPayload(HttpRequest<?> request) {
    this.socket.log.traceEntity("reading request payload", this.responder);

    this.socket.willReadRequestPayload(request, this.responder);
    this.responder.willReadRequestPayload(request);
  }

  void didReadRequestPayload(HttpRequest<?> request) {
    this.responder.didReadRequestPayload(request);
    this.socket.didReadRequestPayload(request, this.responder);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read request payload", this.toLogPayload(request.payload()));
    }
  }

  void didReadRequest(HttpRequest<?> request) {
    this.responder.didReadRequest(request);
    this.socket.didReadRequest(request, this.responder);

    if (this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("read request", this.toLogRequest(request));
    }
  }

  @Override
  public boolean isWriting() {
    final int writeState = ((int) STATUS.getOpaque(this) & WRITE_MASK) >>> WRITE_SHIFT;
    return writeState == WRITE_MESSAGE || writeState == WRITE_PAYLOAD;
  }

  @Override
  public boolean isDoneWriting() {
    final int writeState = ((int) STATUS.getOpaque(this) & WRITE_MASK) >>> WRITE_SHIFT;
    return writeState == WRITE_DONE;
  }

  @Override
  public boolean writeResponseMessage(Encode<? extends HttpResponse<?>> encodeMessage) {
    if (ENCODE_MESSAGE.compareAndExchangeRelease(this, null, encodeMessage) == null) {
      if (((int) STATUS.getAcquire(this) & WRITE_MASK) >>> WRITE_SHIFT == WRITE_MESSAGE) {
        this.socket.triggerWrite();
      }
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean writeResponsePayload(Encode<? extends HttpPayload<?>> encodePayload) {
    if (ENCODE_PAYLOAD.compareAndExchangeRelease(this, null, encodePayload) == null) {
      if (((int) STATUS.getAcquire(this) & WRITE_MASK) >>> WRITE_SHIFT == WRITE_PAYLOAD) {
        this.socket.triggerWrite();
      }
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean requestOutput() {
    final int writeState = ((int) STATUS.getOpaque(this) & WRITE_MASK) >>> WRITE_SHIFT;
    if (writeState == READ_PAYLOAD) {
      return this.socket.requestWrite();
    } else {
      return false;
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  void doWrite() throws IOException {
    final LogScope scope = LogScope.swapCurrent("responder");
    LogScope.push("write");
    try {
      int status = (int) STATUS.getOpaque(this);

      if ((status & WRITE_MASK) >>> WRITE_SHIFT == WRITE_PENDING) {
        status = this.doWriteInitial(status);
      }

      if ((status & WRITE_MASK) >>> WRITE_SHIFT == WRITE_MESSAGE) {
        status = this.doWriteMessage(status);
      }

      if ((status & WRITE_MASK) >>> WRITE_SHIFT == WRITE_PAYLOAD) {
        status = this.doWritePayload(status);
      }
    } finally {
      LogScope.pop();
      LogScope.setCurrent(scope);
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int doWriteInitial(int status) throws IOException {
    // Don't initiate the response until request message has been read.
    final Decode<HttpRequest<?>> decodeMessage = (Decode<HttpRequest<?>>) DECODE_MESSAGE.getOpaque(this);
    final HttpRequest<?> request = decodeMessage != null ? decodeMessage.get() : null;
    if (request == null) {
      return status;
    }

    do {
      if ((status & WRITE_MASK) >>> WRITE_SHIFT != WRITE_PENDING) {
        throw new AssertionError();
      }
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_MESSAGE << WRITE_SHIFT);
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;

        this.willWriteResponse(request);

        this.willWriteResponseMessage(request);

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
  int doWriteMessage(int status) throws IOException {
    Encode<? extends HttpResponse<?>> encodeMessage = (Encode<? extends HttpResponse<?>>) ENCODE_MESSAGE.getOpaque(this);
    if (encodeMessage == null) {
      return status;
    }

    try {
      encodeMessage = encodeMessage.produce(this.socket.outputBuffer);
      this.socket.writeBuffer.flip();
      try {
        this.socket.write(this.socket.writeBuffer);
      } catch (ClosedChannelException cause) {
        encodeMessage = encodeMessage.produce(BinaryOutputBuffer.done());
      }
    } finally {
      this.socket.writeBuffer.compact();
      ENCODE_MESSAGE.setOpaque(this, encodeMessage);
    }

    if (this.socket.writeBuffer.position() != 0 || encodeMessage.isCont()) {
      this.socket.requestWrite();
    } else if (encodeMessage.isDone()) {
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_PAYLOAD << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          final HttpRequest<?> request = ((Decode<HttpRequest<?>>) DECODE_MESSAGE.getOpaque(this)).getNonNull();
          final HttpResponse<?> response = encodeMessage.getNonNull();

          this.didWriteResponseMessage(request, response);

          this.willWriteResponsePayload(request, response);

          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (encodeMessage.isError()) {
      encodeMessage.checkError(); // FIXME: Handle response error.
    } else {
      throw new AssertionError(); // unreachable
    }

    return status;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int doWritePayload(int status) throws IOException {
    Encode<HttpPayload<?>> encodePayload = (Encode<HttpPayload<?>>) ENCODE_PAYLOAD.getOpaque(this);
    if (encodePayload == null) {
      return status;
    }

    try {
      encodePayload = encodePayload.produce(this.socket.outputBuffer);
      this.socket.writeBuffer.flip();
      try {
        this.socket.write(this.socket.writeBuffer);
      } catch (ClosedChannelException cause) {
        encodePayload = encodePayload.produce(BinaryOutputBuffer.done());
      }
    } finally {
      this.socket.writeBuffer.compact();
      ENCODE_PAYLOAD.setOpaque(this, encodePayload);
    }

    if (this.socket.writeBuffer.position() != 0) {
      this.socket.requestWrite();
    } else if (encodePayload.isCont()) {
      if (!encodePayload.backoff(this)) {
        this.socket.requestWrite();
      }
    } else if (encodePayload.isDone()) {
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_DONE << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          final HttpRequest<?> request = ((Decode<HttpRequest<?>>) DECODE_MESSAGE.getOpaque(this)).getNonNull();
          final Encode<HttpResponse<?>> encodeMessage = (Encode<HttpResponse<?>>) ENCODE_MESSAGE.getOpaque(this);
          final HttpPayload<?> payload = encodePayload.getNonNull();
          final HttpResponse<?> response = encodeMessage.getNonNull().withPayload(payload);
          ENCODE_MESSAGE.setRelease(this, Encode.done(response));

          this.didWriteResponsePayload(request, response);

          // Dequeue the responder from the responder queue.
          this.socket.dequeueResponder(this);

          this.didWriteResponse(request, response);

          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (encodePayload.isError()) {
      encodePayload.checkError(); // FIXME: Handle response error.
    } else {
      throw new AssertionError(); // unreachable
    }

    return status;
  }

  void willWriteResponse(HttpRequest<?> request) {
    this.socket.log.traceEntity("writing response", this.responder);

    this.socket.willWriteResponse(request, this.responder);
    this.responder.willWriteResponse(request);
  }

  void willWriteResponseMessage(HttpRequest<?> request) {
    this.socket.log.traceEntity("writing response message", this.responder);

    this.socket.willWriteResponseMessage(request, this.responder);
    this.responder.willWriteResponseMessage(request);
  }

  void didWriteResponseMessage(HttpRequest<?> request, HttpResponse<?> response) {
    this.responder.didWriteResponseMessage(request, response);
    this.socket.didWriteResponseMessage(request, response, this.responder);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote response message", this.toLogResponse(response));
    }
  }

  void willWriteResponsePayload(HttpRequest<?> request, HttpResponse<?> response) {
    this.socket.log.traceEntity("writing response payload", this.responder);

    this.socket.willWriteResponsePayload(request, response, this.responder);
    this.responder.willWriteResponsePayload(request, response);
  }

  void didWriteResponsePayload(HttpRequest<?> request, HttpResponse<?> response) {
    this.responder.didWriteResponsePayload(request, response);
    this.socket.didWriteResponsePayload(request, response, this.responder);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote response payload", this.toLogPayload(response.payload()));
    }
  }

  void didWriteResponse(HttpRequest<?> request, HttpResponse<?> response) {
    this.responder.didWriteResponse(request, response);
    this.socket.didWriteResponse(request, response, this.responder);

    if (this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("wrote response", this.toLogResponse(response));
    }
  }

  @Override
  public void become(NetSocket socket) {
    this.socket.become(socket);
  }

  @Override
  public void close() {
    this.socket.close();
  }

  void willClose() throws IOException {
    this.responder.willClose();
  }

  void didClose() throws IOException {
    this.responder.didClose();
  }

  @Nullable Object toLogRequest(HttpRequest<?> request) {
    final TupleRepr detail = TupleRepr.of();
    detail.put("method", Repr.of(request.method().name()));
    detail.put("target", Repr.of(request.target()));
    return detail;
  }

  @Nullable Object toLogResponse(HttpResponse<?> response) {
    final TupleRepr detail = TupleRepr.of();
    detail.put("status", Repr.of(response.status().toString()));
    return detail;
  }

  @Nullable Object toLogPayload(HttpPayload<?> payload) {
    if (payload instanceof HttpBody<?>) {
      final HttpBody<?> body = (HttpBody<?>) payload;
      final TupleRepr detail = TupleRepr.of();
      detail.put("type", Repr.of("body"));
      detail.put("length", Repr.of(body.contentLength()));
      return detail;
    } else if (payload instanceof HttpChunked<?>) {
      final TupleRepr detail = TupleRepr.of();
      detail.put("type", Repr.of("chunked"));
      return detail;
    } else if (payload instanceof HttpEmpty<?>) {
      final TupleRepr detail = TupleRepr.of();
      detail.put("type", Repr.of("empty"));
      return detail;
    } else {
      return null;
    }
  }

  static final int READ_PENDING = 0;
  static final int READ_MESSAGE = 1;
  static final int READ_PAYLOAD = 2;
  static final int READ_DONE = 3;

  static final int READ_SHIFT = 0;
  static final int READ_MASK = 0x3 << READ_SHIFT;

  static final int WRITE_PENDING = 0;
  static final int WRITE_MESSAGE = 1;
  static final int WRITE_PAYLOAD = 2;
  static final int WRITE_DONE = 3;

  static final int WRITE_SHIFT = 2;
  static final int WRITE_MASK = 0x3 << WRITE_SHIFT;

  /**
   * {@code VarHandle} for atomically accessing the {@link #decodeMessage} field.
   */
  static final VarHandle DECODE_MESSAGE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #decodePayload} field.
   */
  static final VarHandle DECODE_PAYLOAD;

  /**
   * {@code VarHandle} for atomically accessing the {@link #encodeMessage} field.
   */
  static final VarHandle ENCODE_MESSAGE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #encodePayload} field.
   */
  static final VarHandle ENCODE_PAYLOAD;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      DECODE_MESSAGE = lookup.findVarHandle(HttpServerResponder.class, "decodeMessage", Decode.class);
      DECODE_PAYLOAD = lookup.findVarHandle(HttpServerResponder.class, "decodePayload", Decode.class);
      ENCODE_MESSAGE = lookup.findVarHandle(HttpServerResponder.class, "encodeMessage", Encode.class);
      ENCODE_PAYLOAD = lookup.findVarHandle(HttpServerResponder.class, "encodePayload", Encode.class);
      STATUS = lookup.findVarHandle(HttpServerResponder.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
