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
import javax.net.ssl.SSLSession;
import swim.annotations.Nullable;
import swim.codec.Decode;
import swim.codec.Encode;
import swim.codec.InputFuture;
import swim.codec.OutputFuture;
import swim.http.HttpBody;
import swim.http.HttpChunked;
import swim.http.HttpEmpty;
import swim.http.HttpException;
import swim.http.HttpPayload;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpUnsized;
import swim.net.NetSocket;
import swim.repr.Repr;
import swim.repr.TupleRepr;
import swim.util.Result;
import swim.util.Severity;

final class HttpServerResponder implements HttpResponderContext, InputFuture, OutputFuture {

  final HttpServerSocket socket;
  HttpResponder responder;
  @Nullable Decode<?> decode;
  Result<HttpRequest<?>> decoded;
  Result<HttpResponse<?>> encoded;
  @Nullable Encode<?> encode;
  int status;

  HttpServerResponder(HttpServerSocket socket, HttpResponder responder) {
    // Initialize parameters.
    this.socket = socket;
    this.responder = responder;

    // Initialize request state.
    this.decode = null;
    this.decoded = REQUEST_PENDING;

    // Initialize response state.
    this.encoded = RESPONSE_PENDING;
    this.encode = null;

    // Initialize status.
    this.status = 0;
  }

  @Override
  public HttpResponder responder() {
    return this.responder;
  }

  @Override
  public HttpServerContext serverContext() {
    return this.socket;
  }

  @Override
  public HttpOptions options() {
    return this.socket.options();
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
    final int readState = ((int) STATUS.getOpaque(this) & DECODE_MASK) >>> DECODE_SHIFT;
    return readState == DECODE_MESSAGE || readState == DECODE_PAYLOAD;
  }

  @Override
  public boolean isDoneReading() {
    final int readState = ((int) STATUS.getOpaque(this) & DECODE_MASK) >>> DECODE_SHIFT;
    return readState == DECODE_DONE || readState == DECODE_ERROR;
  }

  @Override
  public boolean readRequest() {
    int status = (int) STATUS.getOpaque(this);
    do {
      final int oldStatus = status;
      final int newStatus = status | READ_REQUEST;
      status = (int) STATUS.compareAndExchangeRelease(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;
        if ((oldStatus & READ_REQUEST) == 0) {
          // Trigger a read to begin reading the request.
          this.socket.triggerRead();
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
  public boolean requestInput() {
    final int readState = ((int) STATUS.getOpaque(this) & DECODE_MASK) >>> DECODE_SHIFT;
    if (readState == DECODE_PAYLOAD) {
      return this.socket.requestRead();
    } else {
      return false;
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  void doRead() {
    int status = (int) STATUS.getOpaque(this);
    if ((status & DECODE_MASK) >>> DECODE_SHIFT == DECODE_INITIAL) {
      status = this.decodeInitial(status);
    }
    if ((status & DECODE_MASK) >>> DECODE_SHIFT == DECODE_MESSAGE) {
      status = this.decodeMessage(status);
    }
    if ((status & DECODE_MASK) >>> DECODE_SHIFT == DECODE_PAYLOAD) {
      status = this.decodePayload(status);
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int decodeInitial(int status) {
    // Don't initiate the request until data is available.
    if (!this.socket.readBuffer.hasRemaining()) {
      if (!this.socket.readBuffer.isLast()) {
        // No data is available yet.
        this.socket.requestRead();
      } else {
        // The socket closed before the request was initiated;
        // dequeue the request handler from the requester queue.
        this.socket.dequeueRequester(this);
      }
      return status;
    }

    // Try to enqueue the response handler in the responder queue.
    // Don't initiate the request until enqueued in the responder queue.
    if (!this.socket.enqueueResponder(this)) {
      // The responder queue is full; discontinue reading requests
      // until a slot opens up in the responder queue to propagate
      // processing backpressure to the client.
      this.socket.log.debug("pipeline full");
      return status;
    }

    // Transition to the decode message state.
    do {
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_MESSAGE << DECODE_SHIFT);
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;
        // Initiate the request.
        this.willReadRequest();
        // Initiate the request message.
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
  int decodeMessage(int status) {
    // Decode the request message from the read buffer.
    Decode<? extends HttpRequest<?>> decode = (Decode<? extends HttpRequest<?>>) DECODE.getOpaque(this);
    try {
      if (decode == null) {
        if ((status & READ_REQUEST) == 0) {
          // readRequest not yet called.
          return status;
        }
        decode = this.responder.decodeRequestMessage(this.socket.readBuffer);
      } else {
        decode = decode.consume(this.socket.readBuffer);
      }
    } catch (HttpException cause) {
      decode = Decode.error(cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        decode = Decode.error(cause);
      } else {
        throw cause;
      }
    }
    // Store the request message decode continuation.
    DECODE.setOpaque(this, decode);

    if (decode.isCont()) {
      // The request message is still being decoded;
      // yield until the socket has more data.
      this.socket.requestRead();
    } else if (decode.isDone()) {
      // Successfully parsed the request message.
      final HttpRequest<?> request = decode.getNonNullUnchecked();
      // Check the request requires closing the connection upon completion.
      final int flags = request.isClosing() ? REQUEST_CLOSE : 0;
      // Transition to the decode payload state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_PAYLOAD << DECODE_SHIFT) | flags;
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Reset the request decode state.
          DECODE.setOpaque(this, null);
          // Store the successfully decoded request message.
          final Result<HttpRequest<?>> decoded = Result.ok(request);
          DECODED.setOpaque(this, decoded);
          // Complete the request message.
          this.didReadRequestMessage(decoded);
          // Request a write to ensure that the response gets handled,
          // even though we might not be the head of the responder pipeline.
          this.socket.requestWrite();
          // Initiate the request payload.
          this.willReadRequestPayload(request);
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (decode.isError()) {
      // Failed to decode the request message;
      // transition to the decode error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_ERROR << DECODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Store the request message decode error.
          final Result<HttpRequest<?>> decoded = Result.error(decode.getError());
          DECODED.setOpaque(this, decoded);
          // Close the socket for reading.
          this.socket.doneReading();
          // Complete the request message with the decode error;
          // the responder can write an error response or close the connection.
          this.didReadRequestMessage(decoded);
          // Request a write to ensure that the response gets handled,
          // even though we might not be the head of the responder pipeline.
          this.socket.requestWrite();
          // Dequeue the request handler from the requester queue.
          this.socket.dequeueRequester(this);
          // Complete the request without decoding the request payload.
          this.didReadRequest(decoded);
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else {
      throw new AssertionError("unreachable");
    }

    return status;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int decodePayload(int status) {
    HttpRequest<?> request = ((Result<HttpRequest<?>>) DECODED.getOpaque(this)).getNonNull();

    // Decode the request payload from the read buffer.
    Decode<? extends HttpPayload<?>> decode = (Decode<? extends HttpPayload<?>>) DECODE.getOpaque(this);
    try {
      if (decode == null) {
        decode = this.responder.decodeRequestPayload(this.socket.readBuffer, request);
      } else {
        decode = decode.consume(this.socket.readBuffer);
      }
    } catch (HttpException cause) {
      decode = Decode.error(cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        decode = Decode.error(cause);
      } else {
        throw cause;
      }
    }
    // Store the request payload decode continuation.
    DECODE.setOpaque(this, decode);

    if (decode.isCont()) {
      // The request payload is still being decoded; propagate backpressure.
      if (!decode.backoff(this)) {
        // No backpressure; yield until the socket has more data.
        this.socket.requestRead();
      } else {
        // Yield until request the decoder requests another read.
      }
    } else if (decode.isDone()) {
      // Successfully parsed the request payload;
      // transition to the decode done state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_DONE << DECODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Reset the request decode state.
          DECODE.setOpaque(this, null);
          // Attach the request payload to the request message
          // and store the fully decoded request.
          request = request.withPayload(decode.getNonNullUnchecked());
          final Result<HttpRequest<?>> decoded = Result.ok(request);
          DECODED.setOpaque(this, decoded);
          // Complete the request payload.
          this.didReadRequestPayload(decoded);
          // Dequeue the request handler from the requester queue.
          this.socket.dequeueRequester(this);
          // Check if the request requires closing the connection.
          if ((status & REQUEST_CLOSE) != 0) {
            // Close the socket for reading.
            this.socket.doneReading();
          }
          // Complete the request.
          this.didReadRequest(decoded);
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (decode.isError()) {
      // Failed to decode the request payload;
      // transition to the decode error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_ERROR << DECODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Store the request payload decode error.
          final Result<HttpRequest<?>> decoded = Result.error(decode.getError());
          DECODED.setOpaque(this, decoded);
          // Close the socket for reading.
          this.socket.doneReading();
          // Complete the request payload with the decode error;
          // the responder can write an error response or close the connection.
          this.didReadRequestPayload(decoded);
          // Dequeue the request handler from the requester queue.
          this.socket.dequeueRequester(this);
          // Complete the request.
          this.didReadRequest(decoded);
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else {
      throw new AssertionError("unreachable");
    }

    return status;
  }

  void willReadRequest() {
    this.socket.log.traceEntity("reading request", this.responder);

    // Invoke willReadRequest socket callback.
    this.socket.willReadRequest(this);
    try {
      // Invoke willReadRequest responder callback.
      this.responder.willReadRequest();
    } catch (HttpException cause) {
      // Report the exception.
      this.socket.log.warningStatus("willReadRequest callback failed", this.responder, cause);
      // Handle the internal server error.
      this.socket.handleServerError(cause, this);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.socket.log.errorStatus("willReadRequest callback failed", this.responder, cause);
        // Handle the internal server error.
        this.socket.handleServerError(cause, this);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  void willReadRequestMessage() {
    this.socket.log.traceEntity("reading request message", this.responder);

    // Invoke willReadRequestMessage socket callback.
    this.socket.willReadRequestMessage(this);
    try {
      // Invoke willReadRequestMessage responder callback.
      this.responder.willReadRequestMessage();
    } catch (HttpException cause) {
      // Report the exception.
      this.socket.log.warningStatus("willReadRequestMessage callback failed", this.responder, cause);
      // Handle the internal server error.
      this.socket.handleServerError(cause, this);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.socket.log.errorStatus("willReadRequestMessage callback failed", this.responder, cause);
        // Handle the internal server error.
        this.socket.handleServerError(cause, this);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  void didReadRequestMessage(Result<HttpRequest<?>> decoded) {
    if (decoded.isError()) {
      this.socket.log.warningStatus("failed to read request message", this.responder, decoded.getError());
    } else if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read request message", this.toLogRequest(decoded.getNonNull()));
    }

    try {
      // Invoke didReadRequestMessage responder callback.
      this.responder.didReadRequestMessage(decoded);
    } catch (HttpException cause) {
      // Report the exception.
      this.socket.log.warningStatus("didReadRequestMessage callback failed", this.responder, cause);
      // Handle the internal server error.
      this.socket.handleServerError(cause, this);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.socket.log.errorStatus("didReadRequestMessage callback failed", this.responder, cause);
        // Handle the internal server error.
        this.socket.handleServerError(cause, this);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
    // Invoke didReadRequestMessage socket callback.
    this.socket.didReadRequestMessage(decoded, this);
  }

  void willReadRequestPayload(HttpRequest<?> request) {
    this.socket.log.traceEntity("reading request payload", this.responder);

    // Invoke willReadRequestPayload socket callback.
    this.socket.willReadRequestPayload(request, this);
    try {
      // Invoke willReadRequestPayload responder callback.
      this.responder.willReadRequestPayload(request);
    } catch (HttpException cause) {
      // Report the exception.
      this.socket.log.warningStatus("willReadRequestPayload callback failed", this.responder, cause);
      // Handle the internal server error.
      this.socket.handleServerError(cause, this);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.socket.log.errorStatus("willReadRequestPayload callback failed", this.responder, cause);
        // Handle the internal server error.
        this.socket.handleServerError(cause, this);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  void didReadRequestPayload(Result<HttpRequest<?>> decoded) {
    if (decoded.isError()) {
      this.socket.log.warningStatus("failed to read request payload", this.responder, decoded.getError());
    } else if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read request payload", this.toLogPayload(decoded.getNonNull().payload()));
    }

    try {
      // Invoke didReadRequestPayload responder callback.
      this.responder.didReadRequestPayload(decoded);
    } catch (HttpException cause) {
      // Report the exception.
      this.socket.log.warningStatus("didReadRequestPayload callback failed", this.responder, cause);
      // Handle the internal server error.
      this.socket.handleServerError(cause, this);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.socket.log.errorStatus("didReadRequestPayload callback failed", this.responder, cause);
        // Handle the internal server error.
        this.socket.handleServerError(cause, this);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
    // Invoke didReadRequestPayload socket callback.
    this.socket.didReadRequestPayload(decoded, this);
  }

  void didReadRequest(Result<HttpRequest<?>> decoded) {
    if (decoded.isOk() && this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("read request", this.toLogRequest(decoded.getNonNull()));
    }

    try {
      // Invoke didReadRequest responder callback.
      this.responder.didReadRequest(decoded);
    } catch (HttpException cause) {
      // Report the exception.
      this.socket.log.warningStatus("didReadRequest callback failed", this.responder, cause);
      // Handle the internal server error.
      this.socket.handleServerError(cause, this);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.socket.log.errorStatus("didReadRequest callback failed", this.responder, cause);
        // Handle the internal server error.
        this.socket.handleServerError(cause, this);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
    // Invoke didReadRequest socket callback.
    this.socket.didReadRequest(decoded, this);
  }

  @Override
  public Result<HttpRequest<?>> requestResult() {
    return (Result<HttpRequest<?>>) DECODED.getOpaque(this);
  }

  @Override
  public boolean isWriting() {
    final int writeState = ((int) STATUS.getOpaque(this) & ENCODE_MASK) >>> ENCODE_SHIFT;
    return writeState == ENCODE_MESSAGE || writeState == ENCODE_PAYLOAD;
  }

  @Override
  public boolean isDoneWriting() {
    final int writeState = ((int) STATUS.getOpaque(this) & ENCODE_MASK) >>> ENCODE_SHIFT;
    return writeState == ENCODE_DONE || writeState == ENCODE_ERROR;
  }

  @Override
  public boolean writeResponse(HttpResponse<?> response) {
    if (ENCODED.compareAndExchangeRelease(this, RESPONSE_PENDING, Result.ok(response)) != RESPONSE_PENDING) {
      return false;
    }
    // Trigger a write to begin writing the response.
    this.socket.triggerWrite();
    return true;
  }

  @Override
  public boolean requestOutput() {
    final int writeState = ((int) STATUS.getOpaque(this) & ENCODE_MASK) >>> ENCODE_SHIFT;
    if (writeState == ENCODE_PAYLOAD) {
      return this.socket.requestWrite();
    } else {
      return false;
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  void doWrite() {
    int status = (int) STATUS.getOpaque(this);
    if ((status & ENCODE_MASK) >>> ENCODE_SHIFT == ENCODE_INITIAL) {
      status = this.encodeInitial(status);
    }
    if ((status & ENCODE_MASK) >>> ENCODE_SHIFT == ENCODE_MESSAGE) {
      status = this.encodeMessage(status);
    }
    if ((status & ENCODE_MASK) >>> ENCODE_SHIFT == ENCODE_PAYLOAD) {
      status = this.encodePayload(status);
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int encodeInitial(int status) {
    // Don't initiate the response until the request message has been handled.
    if ((status & DECODE_MASK) >>> DECODE_SHIFT == DECODE_INITIAL ||
        (status & DECODE_MASK) >>> DECODE_SHIFT == DECODE_MESSAGE) {
      return status;
    }

    // Transition to the encode message state.
    do {
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_MESSAGE << ENCODE_SHIFT);
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;
        // Initiate the response.
        this.willWriteResponse();
        // Initiate the response message.
        this.willWriteResponseMessage();
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
  int encodeMessage(int status) {
    Result<HttpResponse<?>> encoded = (Result<HttpResponse<?>>) ENCODED.getOpaque(this);
    if (encoded == (Object) RESPONSE_PENDING) {
      // writeResponseMessage not yet called.
      return status;
    }
    final HttpResponse<?> response = encoded.getNonNull();

    // Encode the response message into the write buffer.
    Encode<? extends HttpResponse<?>> encode = (Encode<? extends HttpResponse<?>>) ENCODE.getOpaque(this);
    try {
      if (encode == null) {
        encode = this.responder.encodeResponseMessage(this.socket.writeBuffer, response);
      } else {
        encode = encode.produce(this.socket.writeBuffer);
      }
    } catch (HttpException cause) {
      encode = Encode.error(cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        encode = Encode.error(cause);
      } else {
        throw cause;
      }
    }
    // Store the response message encode continuation.
    ENCODE.setOpaque(this, encode);

    if (encode.isCont()) {
      // The response message is still being encoded;
      // yield until the socket is ready to write more data.
      this.socket.requestWrite();
    } else if (encode.isDone()) {
      // Successfully wrote the response message;
      // transition to the encode payload state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_PAYLOAD << ENCODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Reset the response encode state.
          ENCODE.setOpaque(this, null);
          // Complete the response message.
          this.didWriteResponseMessage(encoded);
          // Initiate the response payload.
          this.willWriteResponsePayload(response);
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (encode.isError()) {
      // Failed to encode the response message;
      // transition to the encode error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_ERROR << ENCODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Store the response message encode error.
          encoded = Result.error(encode.getError());
          ENCODED.setOpaque(this, encoded);
          // Close the socket for writing and reading.
          this.socket.doneWriting();
          this.socket.doneReading();
          // Complete the response message with the encode error.
          this.didWriteResponseMessage(encoded);
          // Dequeue the response handler from the responder queue.
          this.socket.dequeueResponder(this);
          // Complete the response without encoding the response payload.
          this.didWriteResponse(encoded);
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else {
      throw new AssertionError("unreachable");
    }

    return status;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int encodePayload(int status) {
    Result<HttpResponse<?>> encoded = (Result<HttpResponse<?>>) ENCODED.getOpaque(this);
    final HttpResponse<?> response = encoded.getNonNull();

    // Encode the response payload into the write buffer.
    Encode<? extends HttpPayload<?>> encode = (Encode<? extends HttpPayload<?>>) ENCODE.getOpaque(this);
    try {
      if (encode == null) {
        encode = this.responder.encodeResponsePayload(this.socket.writeBuffer, response);
      } else {
        encode = encode.produce(this.socket.writeBuffer);
      }
    } catch (HttpException cause) {
      encode = Encode.error(cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        encode = Encode.error(cause);
      } else {
        throw cause;
      }
    }
    // Store the response payload encode continuation.
    ENCODE.setOpaque(this, encode);

    if (encode.isCont()) {
      // The response payload is still being encoded; propagate backpressure.
      if (!encode.backoff(this)) {
        // No backpressure; yield until the socket is ready for more data.
        this.socket.requestWrite();
      } else {
        // Yield until the response encoder requests another write.
      }
    } else if (encode.isDone()) {
      // Successfully wrote the response payload;
      // transition to the encode done state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_DONE << ENCODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Reset the response encode state.
          ENCODE.setOpaque(this, null);
          // Complete the response payload.
          this.didWriteResponsePayload(encoded);
          // Dequeue the response handler from the responder queue.
          this.socket.dequeueResponder(this);
          // Check if the request requires closing the connection.
          if ((status & REQUEST_CLOSE) != 0) {
            // Close the socket for writing.
            this.socket.doneWriting();
          } else if (response.isClosing()) {
            // The response requires closing the connection;
            // close the socket for writing and reading.
            this.socket.doneWriting();
            this.socket.doneReading();
          }
          // Complete the response.
          this.didWriteResponse(encoded);
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (encode.isError()) {
      // Failed to encode the response payload;
      // transition to the encode error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_ERROR << ENCODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Store the response payload encode error.
          encoded = Result.error(encode.getError());
          ENCODED.setOpaque(this, encoded);
          // Close the socket for writing and reading.
          this.socket.doneWriting();
          this.socket.doneReading();
          // Complete the response payload with the encode error.
          this.didWriteResponsePayload(encoded);
          // Dequeue the response handler from the responder queue.
          this.socket.dequeueResponder(this);
          // Complete the response.
          this.didWriteResponse(encoded);
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else {
      throw new AssertionError("unreachable");
    }

    return status;
  }

  void willWriteResponse() {
    this.socket.log.traceEntity("writing response", this.responder);

    // Invoke willWriteResponse socket callback.
    this.socket.willWriteResponse(this);
    try {
      // Invoke willWriteResponse responder callback.
      this.responder.willWriteResponse();
    } catch (HttpException cause) {
      // Report the exception.
      this.socket.log.warningStatus("willWriteResponse callback failed", this.responder, cause);
      // Handle the internal server error.
      this.socket.handleServerError(cause, this);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.socket.log.errorStatus("willWriteResponse callback failed", this.responder, cause);
        // Handle the internal server error.
        this.socket.handleServerError(cause, this);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  void willWriteResponseMessage() {
    this.socket.log.traceEntity("writing response message", this.responder);

    // Invoke willWriteResponseMessage socket callback.
    this.socket.willWriteResponseMessage(this);
    try {
      // Invoke willWriteResponseMessage responder callback.
      this.responder.willWriteResponseMessage();
    } catch (HttpException cause) {
      // Report the exception.
      this.socket.log.warningStatus("willWriteResponseMessage callback failed", this.responder, cause);
      // Handle the internal server error.
      this.socket.handleServerError(cause, this);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.socket.log.errorStatus("willWriteResponseMessage callback failed", this.responder, cause);
        // Handle the internal server error.
        this.socket.handleServerError(cause, this);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  void didWriteResponseMessage(Result<HttpResponse<?>> encoded) {
    if (encoded.isError()) {
      this.socket.log.warningStatus("failed to write response message", this.responder, encoded.getError());
    } else if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote response message", this.toLogResponse(encoded.getNonNull()));
    }

    try {
      // Invoke didWriteResponseMessage responder callback.
      this.responder.didWriteResponseMessage(encoded);
    } catch (HttpException cause) {
      // Report the exception.
      this.socket.log.warningStatus("didWriteResponseMessage callback failed", this.responder, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.socket.log.errorStatus("didWriteResponseMessage callback failed", this.responder, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
    // Invoke didWriteResponseMessage socket callback.
    this.socket.didWriteResponseMessage(encoded, this);
  }

  void willWriteResponsePayload(HttpResponse<?> response) {
    this.socket.log.traceEntity("writing response payload", this.responder);

    // Invoke willWriteResponsePayload socket callback.
    this.socket.willWriteResponsePayload(response, this);
    try {
      // Invoke willWriteResponsePayload responder callback.
      this.responder.willWriteResponsePayload(response);
    } catch (HttpException cause) {
      // Report the exception.
      this.socket.log.warningStatus("willWriteResponsePayload callback failed", this.responder, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.socket.log.errorStatus("willWriteResponsePayload callback failed", this.responder, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  void didWriteResponsePayload(Result<HttpResponse<?>> encoded) {
    if (encoded.isError()) {
      this.socket.log.warningStatus("failed to write response payload", this.responder, encoded.getError());
    } else if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote response payload", this.toLogPayload(encoded.getNonNull().payload()));
    }

    try {
      // Invoke didWriteResponsePayload responder callback.
      this.responder.didWriteResponsePayload(encoded);
    } catch (HttpException cause) {
      // Report the exception.
      this.socket.log.warningStatus("didWriteResponsePayload callback failed", this.responder, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.socket.log.errorStatus("didWriteResponsePayload callback failed", this.responder, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
    // Invoke didWriteResponsePayload socket callback.
    this.socket.didWriteResponsePayload(encoded, this);
  }

  void didWriteResponse(Result<HttpResponse<?>> encoded) {
    if (encoded.isOk() && this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("wrote response", this.toLogResponse(encoded.getNonNull()));
    }

    try {
      // Invoke didWriteResponse responder callback.
      this.responder.didWriteResponse(encoded);
    } catch (HttpException cause) {
      // Report the exception.
      this.socket.log.warningStatus("didWriteResponse callback failed", this.responder, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.socket.log.errorStatus("didWriteResponse callback failed", this.responder, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
    // Invoke didWriteResponse socket callback.
    this.socket.didWriteResponse(encoded, this);
  }

  @Override
  public Result<HttpResponse<?>> responseResult() {
    return (Result<HttpResponse<?>>) ENCODED.getOpaque(this);
  }

  @Override
  public void become(HttpResponder responder) {
    responder.setResponderContext(this);
    this.responder = responder;
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
    } else if (payload instanceof HttpUnsized<?>) {
      final TupleRepr detail = TupleRepr.of();
      detail.put("type", Repr.of("unsized"));
      return detail;
    } else if (payload instanceof HttpEmpty<?>) {
      final TupleRepr detail = TupleRepr.of();
      detail.put("type", Repr.of("empty"));
      return detail;
    } else {
      return null;
    }
  }

  static final int READ_REQUEST = 1 << 0;
  static final int REQUEST_CLOSE = 1 << 1;

  static final int FLAG_BITS = 2;
  static final int FLAG_MASK = (1 << FLAG_BITS) - 1;

  static final int DECODE_INITIAL = 0;
  static final int DECODE_MESSAGE = 1;
  static final int DECODE_PAYLOAD = 2;
  static final int DECODE_DONE = 3;
  static final int DECODE_ERROR = 4;

  static final int DECODE_SHIFT = FLAG_BITS;
  static final int DECODE_BITS = 3;
  static final int DECODE_MASK = ((1 << DECODE_BITS) - 1) << DECODE_SHIFT;

  static final int ENCODE_INITIAL = 0;
  static final int ENCODE_MESSAGE = 1;
  static final int ENCODE_PAYLOAD = 2;
  static final int ENCODE_DONE = 3;
  static final int ENCODE_ERROR = 4;

  static final int ENCODE_SHIFT = DECODE_SHIFT + DECODE_BITS;
  static final int ENCODE_BITS = 3;
  static final int ENCODE_MASK = ((1 << ENCODE_BITS) - 1) << ENCODE_SHIFT;

  static final Result<HttpRequest<?>> REQUEST_PENDING;
  static final Result<HttpResponse<?>> RESPONSE_PENDING;

  static {
    final IllegalStateException requestPending = new IllegalStateException("request pending");
    requestPending.setStackTrace(new StackTraceElement[0]);
    REQUEST_PENDING = Result.error(requestPending);

    final IllegalStateException responsePending = new IllegalStateException("response pending");
    responsePending.setStackTrace(new StackTraceElement[0]);
    RESPONSE_PENDING = Result.error(responsePending);
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #decode} field.
   */
  static final VarHandle DECODE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #decoded} field.
   */
  static final VarHandle DECODED;

  /**
   * {@code VarHandle} for atomically accessing the {@link #encoded} field.
   */
  static final VarHandle ENCODED;

  /**
   * {@code VarHandle} for atomically accessing the {@link #encode} field.
   */
  static final VarHandle ENCODE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      DECODE = lookup.findVarHandle(HttpServerResponder.class, "decode", Decode.class);
      DECODED = lookup.findVarHandle(HttpServerResponder.class, "decoded", Result.class);
      ENCODED = lookup.findVarHandle(HttpServerResponder.class, "encoded", Result.class);
      ENCODE = lookup.findVarHandle(HttpServerResponder.class, "encode", Encode.class);
      STATUS = lookup.findVarHandle(HttpServerResponder.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
