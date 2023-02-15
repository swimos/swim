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

final class HttpClientRequester implements HttpRequesterContext, InputFuture, OutputFuture {

  final HttpClientSocket socket;
  final HttpRequester requester;
  @Nullable Encode<? extends HttpRequest<?>> encodeMessage;
  @Nullable Encode<? extends HttpPayload<?>> encodePayload;
  @Nullable Decode<? extends HttpResponse<?>> decodeMessage;
  @Nullable Decode<? extends HttpPayload<?>> decodePayload;
  int status;

  HttpClientRequester(HttpClientSocket socket, HttpRequester requester) {
    // Initialize requester parameters.
    this.socket = socket;
    this.requester = requester;

    // Initialize requester transcoders.
    this.encodeMessage = null;
    this.encodePayload = null;
    this.decodeMessage = null;
    this.decodePayload = null;

    // Initialize requester status.
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
  public boolean isConnecting() {
    return this.socket.isConnecting();
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
  public boolean writeRequestMessage(Encode<? extends HttpRequest<?>> encodeMessage) {
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
  public boolean writeRequestPayload(Encode<? extends HttpPayload<?>> encodePayload) {
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
    final LogScope scope = LogScope.swapCurrent("requester");
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
    do {
      if ((status & WRITE_MASK) >>> WRITE_SHIFT != WRITE_PENDING) {
        throw new AssertionError();
      }
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_MESSAGE << WRITE_SHIFT);
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;

        this.willWriteRequest();

        this.willWriteRequestMessage();

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
    Encode<? extends HttpRequest<?>> encodeMessage = (Encode<? extends HttpRequest<?>>) ENCODE_MESSAGE.getOpaque(this);
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
          final HttpRequest<?> request = encodeMessage.getNonNull();

          this.didWriteRequestMessage(request);

          // Enqueue the requester in the responder queue.
          this.socket.enqueueResponder(this);

          this.willWriteRequestPayload(request);

          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (encodeMessage.isError()) {
      encodeMessage.checkError(); // FIXME: Handle request error.
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
          final Encode<HttpRequest<?>> encodeMessage = (Encode<HttpRequest<?>>) ENCODE_MESSAGE.getOpaque(this);
          final HttpPayload<?> payload = encodePayload.getNonNull();
          final HttpRequest<?> request = encodeMessage.getNonNull().withPayload(payload);
          ENCODE_MESSAGE.setRelease(this, Encode.done(request));

          this.didWriteRequestPayload(request);

          // Dequeue the requester from the requester queue.
          this.socket.dequeueRequester(this);

          this.didWriteRequest(request);

          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (encodePayload.isError()) {
      encodePayload.checkError(); // FIXME: Handle request error.
    } else {
      throw new AssertionError(); // unreachable
    }

    return status;
  }

  void willWriteRequest() {
    this.socket.log.traceEntity("writing request", this.requester);

    this.socket.willWriteRequest(this.requester);
    this.requester.willWriteRequest();
  }

  void willWriteRequestMessage() {
    this.socket.log.traceEntity("writing request message", this.requester);

    this.socket.willWriteRequestMessage(this.requester);
    this.requester.willWriteRequestMessage();
  }

  void didWriteRequestMessage(HttpRequest<?> request) {
    this.requester.didWriteRequestMessage(request);
    this.socket.didWriteRequestMessage(request, this.requester);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote request message", this.toLogRequest(request));
    }
  }

  void willWriteRequestPayload(HttpRequest<?> request) {
    this.socket.log.traceEntity("writing request payload", this.requester);

    this.socket.willWriteRequestPayload(request, this.requester);
    this.requester.willWriteRequestPayload(request);
  }

  void didWriteRequestPayload(HttpRequest<?> request) {
    this.requester.didWriteRequestPayload(request);
    this.socket.didWriteRequestPayload(request, this.requester);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote request payload", this.toLogPayload(request.payload()));
    }
  }

  void didWriteRequest(HttpRequest<?> request) {
    this.requester.didWriteRequest(request);
    this.socket.didWriteRequest(request, this.requester);

    if (this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("wrote request", this.toLogRequest(request));
    }
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
  public boolean readResponseMessage(Decode<? extends HttpResponse<?>> decodeMessage) {
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
  public boolean readResponsePayload(Decode<? extends HttpPayload<?>> decodePayload) {
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
    final LogScope scope = LogScope.swapCurrent("requester");
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
    do {
      if ((status & READ_MASK) >>> READ_SHIFT != READ_PENDING) {
        throw new AssertionError();
      }
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~READ_MASK) | (READ_MESSAGE << READ_SHIFT);
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;
        final HttpRequest<?> request = ((Encode<HttpRequest<?>>) ENCODE_MESSAGE.getOpaque(this)).getNonNull();

        this.willReadResponse(request);

        this.willReadResponseMessage(request);

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
    Decode<? extends HttpResponse<?>> decodeMessage = (Decode<? extends HttpResponse<?>>) DECODE_MESSAGE.getOpaque(this);
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
          final HttpRequest<?> request = ((Encode<HttpRequest<?>>) ENCODE_MESSAGE.getOpaque(this)).getNonNull();
          final HttpResponse<?> response = decodeMessage.getNonNull();

          this.didReadResponseMessage(request, response);

          this.willReadResponsePayload(request, response);

          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (decodeMessage.isError()) {
      decodeMessage.checkError(); // FIXME: Handle response error.
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
          final HttpRequest<?> request = ((Encode<HttpRequest<?>>) ENCODE_MESSAGE.getOpaque(this)).getNonNull();
          final Decode<HttpResponse<?>> decodeMessage = (Decode<HttpResponse<?>>) DECODE_MESSAGE.getOpaque(this);
          final HttpPayload<?> payload = decodePayload.getNonNull();
          final HttpResponse<?> response = decodeMessage.getNonNull().withPayload(payload);
          DECODE_MESSAGE.setRelease(this, Decode.done(response));

          this.didReadResponsePayload(request, response);

          // Dequeue the requester from the responder queue.
          this.socket.dequeueResponder(this);

          this.didReadResponse(request, response);

          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (decodePayload.isError()) {
      decodePayload.checkError(); // FIXME: Handle response error.
    } else {
      throw new AssertionError(); // unreachable
    }

    return status;
  }

  void willReadResponse(HttpRequest<?> request) {
    this.socket.log.traceEntity("reading response", this.requester);

    this.socket.willReadResponse(request, this.requester);
    this.requester.willReadResponse(request);
  }

  void willReadResponseMessage(HttpRequest<?> request) {
    this.socket.log.traceEntity("reading response message", this.requester);

    this.socket.willReadResponseMessage(request, this.requester);
    this.requester.willReadResponseMessage(request);
  }

  void didReadResponseMessage(HttpRequest<?> request, HttpResponse<?> response) {
    this.requester.didReadResponseMessage(request, response);
    this.socket.didReadResponseMessage(request, response, this.requester);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read response message", this.toLogResponse(response));
    }
  }

  void willReadResponsePayload(HttpRequest<?> request, HttpResponse<?> response) {
    this.socket.log.traceEntity("reading response payload", this.requester);

    this.socket.willReadResponsePayload(request, response, this.requester);
    this.requester.willReadResponsePayload(request, response);
  }

  void didReadResponsePayload(HttpRequest<?> request, HttpResponse<?> response) {
    this.requester.didReadResponsePayload(request, response);
    this.socket.didReadResponsePayload(request, response, this.requester);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read response payload", this.toLogPayload(response.payload()));
    }
  }

  void didReadResponse(HttpRequest<?> request, HttpResponse<?> response) {
    this.requester.didReadResponse(request, response);
    this.socket.didReadResponse(request, response, this.requester);

    if (this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("read response", this.toLogResponse(response));
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
    this.requester.willClose();
  }

  void didClose() throws IOException {
    this.requester.didClose();
  }

  @Nullable Object toLogRequest(HttpRequest<?> request) {
    final TupleRepr detail = TupleRepr.of();
    detail.put("method", Repr.from(request.method().name()));
    detail.put("target", Repr.from(request.target()));
    return detail;
  }

  @Nullable Object toLogResponse(HttpResponse<?> response) {
    final TupleRepr detail = TupleRepr.of();
    detail.put("status", Repr.from(response.status().toString()));
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

  static final int WRITE_PENDING = 0;
  static final int WRITE_MESSAGE = 1;
  static final int WRITE_PAYLOAD = 2;
  static final int WRITE_DONE = 3;

  static final int WRITE_SHIFT = 0;
  static final int WRITE_MASK = 0x3 << WRITE_SHIFT;

  static final int READ_PENDING = 0;
  static final int READ_MESSAGE = 1;
  static final int READ_PAYLOAD = 2;
  static final int READ_DONE = 3;

  static final int READ_SHIFT = 2;
  static final int READ_MASK = 0x3 << READ_SHIFT;

  /**
   * {@code VarHandle} for atomically accessing the {@link #encodeMessage} field.
   */
  static final VarHandle ENCODE_MESSAGE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #encodePayload} field.
   */
  static final VarHandle ENCODE_PAYLOAD;

  /**
   * {@code VarHandle} for atomically accessing the {@link #decodeMessage} field.
   */
  static final VarHandle DECODE_MESSAGE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #decodePayload} field.
   */
  static final VarHandle DECODE_PAYLOAD;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      ENCODE_MESSAGE = lookup.findVarHandle(HttpClientRequester.class, "encodeMessage", Encode.class);
      ENCODE_PAYLOAD = lookup.findVarHandle(HttpClientRequester.class, "encodePayload", Encode.class);
      DECODE_MESSAGE = lookup.findVarHandle(HttpClientRequester.class, "decodeMessage", Decode.class);
      DECODE_PAYLOAD = lookup.findVarHandle(HttpClientRequester.class, "decodePayload", Decode.class);
      STATUS = lookup.findVarHandle(HttpClientRequester.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
