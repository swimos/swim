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

final class HttpClientRequester implements HttpRequesterContext, InputFuture, OutputFuture {

  final HttpClientSocket socket;
  HttpRequester requester;
  @Nullable HttpRequest<?> request;
  Result<HttpRequest<?>> encoded;
  @Nullable Encode<?> encode;
  @Nullable Decode<?> decode;
  Result<HttpResponse<?>> decoded;
  int status;

  HttpClientRequester(HttpClientSocket socket, HttpRequester requester) {
    // Initialize parameters.
    this.socket = socket;
    this.requester = requester;

    // Initialize request state.
    this.request = null;
    this.encoded = REQUEST_PENDING;
    this.encode = null;

    // Initialize response state.
    this.decode = null;
    this.decoded = RESPONSE_PENDING;

    // Initialize status.
    this.status = 0;
  }

  @Override
  public HttpRequester requester() {
    return this.requester;
  }

  @Override
  public HttpClientContext clientContext() {
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
    final int writeState = ((int) STATUS.getOpaque(this) & ENCODE_MASK) >>> ENCODE_SHIFT;
    return writeState == ENCODE_MESSAGE || writeState == ENCODE_PAYLOAD;
  }

  @Override
  public boolean isDoneWriting() {
    final int writeState = ((int) STATUS.getOpaque(this) & ENCODE_MASK) >>> ENCODE_SHIFT;
    return writeState == ENCODE_DONE || writeState == ENCODE_ERROR;
  }

  @Override
  public boolean writeRequest(HttpRequest<?> request) {
    if (ENCODED.compareAndExchangeRelease(this, REQUEST_PENDING, Result.ok(request)) != REQUEST_PENDING) {
      return false;
    }
    // Trigger a write to begin writing the request.
    this.socket.triggerWrite();
    return true;
  }

  @Override
  public boolean requestOutput() {
    final int writeState = ((int) STATUS.getOpaque(this) & ENCODE_MASK) >>> ENCODE_SHIFT;
    if (writeState == ENCODE_PAYLOAD) {
      return this.socket.requestWrite();
    }
    return false;
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
    // Try to enqueue the response handler in the responder queue.
    // Don't initiate the request until enqueued in the responder queue.
    if (!this.socket.enqueueResponder(this)) {
      // The responder queue is full; discontinue writing requests
      // until a slot opens up in the responder queue.
      this.socket.log.debug("pipeline full");
      return status;
    }

    // Transition to the encode message state.
    do {
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_MESSAGE << ENCODE_SHIFT);
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      status = newStatus;
      // Initiate the request.
      this.willWriteRequest();
      // Initiate the request message.
      this.willWriteRequestMessage();
      // Re-check status to pick up any callback changes.
      status = (int) STATUS.getAcquire(this);
      break;
    } while (true);

    return status;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int encodeMessage(int status) {
    Result<HttpRequest<?>> encoded = (Result<HttpRequest<?>>) ENCODED.getOpaque(this);
    if (encoded == (Object) REQUEST_PENDING) {
      // writeRequestMessage not yet called.
      return status;
    }
    final HttpRequest<?> request = encoded.getNonNull();

    // Encode the request message into the write buffer.
    Encode<? extends HttpRequest<?>> encode = (Encode<? extends HttpRequest<?>>) ENCODE.getOpaque(this);
    try {
      if (encode == null) {
        // Store the original request so that it can be accessed even after an encoding error.
        REQUEST.setOpaque(this, request);
        encode = this.requester.encodeRequestMessage(this.socket.writeBuffer, request);
      } else {
        encode = encode.produce(this.socket.writeBuffer);
      }
    } catch (HttpException cause) {
      encode = Encode.error(cause);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      encode = Encode.error(cause);
    }
    // Store the request message encode continuation.
    ENCODE.setOpaque(this, encode);

    if (encode.isCont()) {
      // The request message is still being encoded;
      // yield until the socket is ready to write more data.
      this.socket.requestWrite();
    } else if (encode.isDone()) {
      // Successfully wrote the request message.
      // Check the request requires closing the connection upon completion.
      final int flags = request.isClosing() ? REQUEST_CLOSE : 0;
      // Transition to the encode payload state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_PAYLOAD << ENCODE_SHIFT) | flags;
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status != oldStatus) {
          // CAS failed; try again.
          continue;
        }
        status = newStatus;
        // Reset the request encode state.
        ENCODE.setOpaque(this, null);
        // Complete the request message.
        this.didWriteRequestMessage(encoded);
        // Request a read to ensure that the response gets handled.
        this.socket.requestRead();
        // Initiate the request payload.
        this.willWriteRequestPayload(request);
        // Re-check status to pick up any callback changes.
        status = (int) STATUS.getAcquire(this);
        break;
      } while (true);
    } else if (encode.isError()) {
      // Failed to encode the request message;
      // transition to the encode error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_ERROR << ENCODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status != oldStatus) {
          // CAS failed; try again.
          continue;
        }
        status = newStatus;
        // Store the request message encode error.
        encoded = Result.error(encode.getError());
        ENCODED.setOpaque(this, encoded);
        // Close the socket for writing.
        this.socket.doneWriting();
        // Complete the request message with the encode error;
        // the requester can read an error response or close the connection.
        this.didWriteRequestMessage(encoded);
        // Request a read to ensure that the response gets handled.
        this.socket.requestRead();
        // Dequeue the request handler from the requester queue.
        this.socket.dequeueRequester(this);
        // Complete the request without encoding the request payload.
        this.didWriteRequest(encoded);
        // Re-check status to pick up any callback changes.
        status = (int) STATUS.getAcquire(this);
        break;
      } while (true);
    } else {
      throw new AssertionError("unreachable");
    }

    return status;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int encodePayload(int status) {
    Result<HttpRequest<?>> encoded = (Result<HttpRequest<?>>) ENCODED.getOpaque(this);
    final HttpRequest<?> request = encoded.getNonNull();

    // Encode the request payload into the write buffer.
    Encode<? extends HttpPayload<?>> encode = (Encode<? extends HttpPayload<?>>) ENCODE.getOpaque(this);
    try {
      if (encode == null) {
        encode = this.requester.encodeRequestPayload(this.socket.writeBuffer, request);
      } else {
        encode = encode.produce(this.socket.writeBuffer);
      }
    } catch (HttpException cause) {
      encode = Encode.error(cause);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      encode = Encode.error(cause);
    }
    // Store the request payload encode continuation.
    ENCODE.setOpaque(this, encode);

    if (encode.isCont()) {
      // The request payload is still being encoded; propagate backpressure.
      if (!encode.backoff(this)) {
        // No backpressure; yield until the socket is ready for more data.
        this.socket.requestWrite();
      } else {
        // Yield until the request encoder requests another write.
      }
    } else if (encode.isDone()) {
      // Successfully wrote the request payload;
      // transition to the encode done state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_DONE << ENCODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status != oldStatus) {
          // CAS failed; try again.
          continue;
        }
        status = newStatus;
        // Reset the request encode state.
        ENCODE.setOpaque(this, null);
        // Complete the request payload.
        this.didWriteRequestPayload(encoded);
        // Dequeue the request handler from the requester queue.
        this.socket.dequeueRequester(this);
        // Check if the request requires closing the connection.
        if ((status & REQUEST_CLOSE) != 0) {
          // Close the socket for writing.
          this.socket.doneWriting();
        }
        // Complete the request.
        this.didWriteRequest(encoded);
        // Re-check status to pick up any callback changes.
        status = (int) STATUS.getAcquire(this);
        break;
      } while (true);
    } else if (encode.isError()) {
      // Failed to encode the request payload;
      // transition to the encode error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~ENCODE_MASK) | (ENCODE_ERROR << ENCODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status != oldStatus) {
          // CAS failed; try again.
          continue;
        }
        status = newStatus;
        // Store the request payload encode error.
        encoded = Result.error(encode.getError());
        ENCODED.setOpaque(this, encoded);
        // Close the socket for writing.
        this.socket.doneWriting();
        // Complete the request payload with the encode error;
        // the requester can read an error response or close the connection.
        this.didWriteRequestPayload(encoded);
        // Dequeue the request handler from the requester queue.
        this.socket.dequeueRequester(this);
        // Complete the request.
        this.didWriteRequest(encoded);
        // Re-check status to pick up any callback changes.
        status = (int) STATUS.getAcquire(this);
        break;
      } while (true);
    } else {
      throw new AssertionError("unreachable");
    }

    return status;
  }

  void willWriteRequest() {
    this.socket.log.traceEntity("writing request", this.requester);

    // Invoke willWriteRequest socket callback.
    this.socket.willWriteRequest(this);
    try {
      // Invoke willWriteRequest requester callback.
      this.requester.willWriteRequest();
    } catch (HttpException cause) {
      this.socket.log.warningStatus("willWriteRequest callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneWriting();
      this.socket.doneReading();
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.socket.log.errorStatus("willWriteRequest callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneWriting();
      this.socket.doneReading();
    }
  }

  void willWriteRequestMessage() {
    this.socket.log.traceEntity("writing request message", this.requester);

    // Invoke willWriteRequestMessage socket callback.
    this.socket.willWriteRequestMessage(this);
    try {
      // Invoke willWriteRequestMessage requester callback.
      this.requester.willWriteRequestMessage();
    } catch (HttpException cause) {
      this.socket.log.warningStatus("willWriteRequestMessage callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneWriting();
      this.socket.doneReading();
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.socket.log.errorStatus("willWriteRequestMessage callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneWriting();
      this.socket.doneReading();
    }
  }

  void didWriteRequestMessage(Result<HttpRequest<?>> encoded) {
    if (encoded.isError()) {
      this.socket.log.warningStatus("failed to write request message", this.requester, encoded.getError());
    } else if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote request message", this.toLogRequest(encoded.getNonNull()));
    }

    try {
      // Invoke didWriteRequestMessage requester callback.
      this.requester.didWriteRequestMessage(encoded);
    } catch (HttpException cause) {
      this.socket.log.warningStatus("didWriteRequestMessage callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneWriting();
      this.socket.doneReading();
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.socket.log.errorStatus("didWriteRequestMessage callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneWriting();
      this.socket.doneReading();
    }
    // Invoke didWriteRequestMessage socket callback.
    this.socket.didWriteRequestMessage(encoded, this);
  }

  void willWriteRequestPayload(HttpRequest<?> request) {
    this.socket.log.traceEntity("writing request payload", this.requester);

    // Invoke willWriteRequestPayload socket callback.
    this.socket.willWriteRequestPayload(request, this);
    try {
      // Invoke willWriteRequestPayload requester callback.
      this.requester.willWriteRequestPayload(request);
    } catch (HttpException cause) {
      this.socket.log.warningStatus("willWriteRequestPayload callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneWriting();
      this.socket.doneReading();
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.socket.log.errorStatus("willWriteRequestPayload callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneWriting();
      this.socket.doneReading();
    }
  }

  void didWriteRequestPayload(Result<HttpRequest<?>> encoded) {
    if (encoded.isError()) {
      this.socket.log.warningStatus("failed to write request payload", this.requester, encoded.getError());
    } else if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote request payload", this.toLogPayload(encoded.getNonNull().payload()));
    }

    try {
      // Invoke didWriteRequestPayload requester callback.
      this.requester.didWriteRequestPayload(encoded);
    } catch (HttpException cause) {
      this.socket.log.warningStatus("didWriteRequestPayload callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneWriting();
      this.socket.doneReading();
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.socket.log.errorStatus("didWriteRequestPayload callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneWriting();
      this.socket.doneReading();
    }
    // Invoke didWriteRequestPayload socket callback.
    this.socket.didWriteRequestPayload(encoded, this);
  }

  void didWriteRequest(Result<HttpRequest<?>> encoded) {
    if (encoded.isOk() && this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("wrote request", this.toLogRequest(encoded.getNonNull()));
    }

    try {
      // Invoke didWriteRequest requester callback.
      this.requester.didWriteRequest(encoded);
    } catch (HttpException cause) {
      this.socket.log.warningStatus("didWriteRequest callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneWriting();
      this.socket.doneReading();
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.socket.log.errorStatus("didWriteRequest callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneWriting();
      this.socket.doneReading();
    }
    // Invoke didWriteRequest socket callback.
    this.socket.didWriteRequest(encoded, this);
  }

  @Override
  public HttpRequest<?> request() {
    final HttpRequest<?> request = (HttpRequest<?>) REQUEST.getOpaque(this);
    if (request == null) {
      throw new IllegalStateException("request pending");
    }
    return request;
  }

  @Override
  public Result<HttpRequest<?>> requestResult() {
    return (Result<HttpRequest<?>>) ENCODED.getOpaque(this);
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
  public boolean readResponse() {
    int status = (int) STATUS.getOpaque(this);
    do {
      final int oldStatus = status;
      final int newStatus = status | READ_RESPONSE;
      status = (int) STATUS.compareAndExchangeRelease(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      status = newStatus;
      if ((oldStatus & READ_RESPONSE) == 0) {
        // Trigger a read to begin reading the response.
        this.socket.triggerRead();
        return true;
      }
      return false;
    } while (true);
  }

  @Override
  public boolean requestInput() {
    final int readState = ((int) STATUS.getOpaque(this) & DECODE_MASK) >>> DECODE_SHIFT;
    if (readState == DECODE_PAYLOAD) {
      return this.socket.requestRead();
    }
    return false;
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
    // Don't initiate the response until the request message has been handled.
    if ((status & ENCODE_MASK) >>> ENCODE_SHIFT == ENCODE_INITIAL ||
        (status & ENCODE_MASK) >>> ENCODE_SHIFT == ENCODE_MESSAGE) {
      return status;
    }

    // Transition to the decode message state.
    do {
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_MESSAGE << DECODE_SHIFT);
      status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      status = newStatus;
      // Initiate the response.
      this.willReadResponse();
      // Initiate the response message.
      this.willReadResponseMessage();
      // Re-check status to pick up any callback changes.
      status = (int) STATUS.getAcquire(this);
      break;
    } while (true);

    return status;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int decodeMessage(int status) {
    // Decode the response message from the read buffer.
    Decode<? extends HttpResponse<?>> decode = (Decode<? extends HttpResponse<?>>) DECODE.getOpaque(this);
    try {
      if (decode == null) {
        if ((status & READ_RESPONSE) == 0) {
          // readResponse not yet called.
          return status;
        }
        decode = this.requester.decodeResponseMessage(this.socket.readBuffer);
      } else {
        decode = decode.consume(this.socket.readBuffer);
      }
    } catch (HttpException cause) {
      decode = Decode.error(cause);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      decode = Decode.error(cause);
    }
    // Store the response message decode continuation.
    DECODE.setOpaque(this, decode);

    if (decode.isCont()) {
      // The response message is still being decoded;
      // yield until the socket has more data.
      this.socket.requestRead();
    } else if (decode.isDone()) {
      // Successfully parsed the response message;
      // transition to the decode payload state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_PAYLOAD << DECODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status != oldStatus) {
          // CAS failed; try again.
          continue;
        }
        status = newStatus;
        // Reset the response decode state.
        DECODE.setOpaque(this, null);
        // Store the successfully decoded response message.
        final HttpResponse<?> response = decode.getNonNullUnchecked();
        final Result<HttpResponse<?>> decoded = Result.ok(response);
        DECODED.setOpaque(this, decoded);
        // Complete the response message.
        this.didReadResponseMessage(decoded);
        // Initiate the response payload.
        this.willReadResponsePayload(response);
        // Re-check status to pick up any callback changes.
        status = (int) STATUS.getAcquire(this);
        break;
      } while (true);
    } else if (decode.isError()) {
      // Failed to decode the response message;
      // transition to the decode error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_ERROR << DECODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status != oldStatus) {
          // CAS failed; try again.
          continue;
        }
        status = newStatus;
        // Store the response message decode error.
        final Result<HttpResponse<?>> decoded = Result.error(decode.getError());
        DECODED.setOpaque(this, decoded);
        // Close the socket for reading and writing.
        this.socket.doneReading();
        this.socket.doneWriting();
        // Complete the response message with the decode error.
        this.didReadResponseMessage(decoded);
        // Dequeue the response handler from the responder queue.
        this.socket.dequeueResponder(this);
        // Complete the response without decoding the response payload.
        this.didReadResponse(decoded);
        // Re-check status to pick up any callback changes.
        status = (int) STATUS.getAcquire(this);
        break;
      } while (true);
    } else {
      throw new AssertionError("unreachable");
    }

    return status;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int decodePayload(int status) {
    HttpResponse<?> response = ((Result<HttpResponse<?>>) DECODED.getOpaque(this)).getNonNull();

    // Decode the response payload from the read buffer.
    Decode<? extends HttpPayload<?>> decode = (Decode<? extends HttpPayload<?>>) DECODE.getOpaque(this);
    try {
      if (decode == null) {
        decode = this.requester.decodeResponsePayload(this.socket.readBuffer, response);
      } else {
        decode = decode.consume(this.socket.readBuffer);
      }
    } catch (HttpException cause) {
      decode = Decode.error(cause);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      decode = Decode.error(cause);
    }
    // Store the response payload decode continuation.
    DECODE.setOpaque(this, decode);

    if (decode.isCont()) {
      // The response payload is still being decoded; propagate backpressure.
      if (!decode.backoff(this)) {
        // No backpressure; yield until the socket has more data.
        this.socket.requestRead();
      } else {
        // Yield until the response decoder requests another read.
      }
    } else if (decode.isDone()) {
      // Successfully parsed the response payload;
      // transition to the decode done state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_DONE << DECODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status != oldStatus) {
          // CAS failed; try again.
          continue;
        }
        status = newStatus;
        // Reset the response decode state.
        DECODE.setOpaque(this, null);
        // Attach the response payload to the response message
        // and store the fully decoded response.
        response = response.withPayload(decode.getNonNullUnchecked());
        final Result<HttpResponse<?>> decoded = Result.ok(response);
        DECODED.setOpaque(this, decoded);
        // Complete the response payload.
        this.didReadResponsePayload(decoded);
        // Dequeue the response handler from the responder queue.
        this.socket.dequeueResponder(this);
        // Check if the request requires closing the connection.
        if ((status & REQUEST_CLOSE) != 0) {
          // Close the socket for reading.
          this.socket.doneReading();
        } else if (response.isClosing()) {
          // The response requires closing the connection;
          // close the socket for reading and writing.
          this.socket.doneReading();
          this.socket.doneWriting();
        }
        // Complete the response.
        this.didReadResponse(decoded);
        // Re-check status to pick up any callback changes.
        status = (int) STATUS.getAcquire(this);
        break;
      } while (true);
    } else if (decode.isError()) {
      // Failed to decode the response payload;
      // transition to the decode error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~DECODE_MASK) | (DECODE_ERROR << DECODE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status != oldStatus) {
          // CAS failed; try again.
          continue;
        }
        status = newStatus;
        // Store the response payload decode error.
        final Result<HttpResponse<?>> decoded = Result.error(decode.getError());
        DECODED.setOpaque(this, decoded);
        // Close the socket for reading and writing.
        this.socket.doneReading();
        this.socket.doneWriting();
        // Complete the response payload with the decode error.
        this.didReadResponsePayload(decoded);
        // Dequeue the response handler from the responder queue.
        this.socket.dequeueResponder(this);
        // Complete the response.
        this.didReadResponse(decoded);
        // Re-check status to pick up any callback changes.
        status = (int) STATUS.getAcquire(this);
        break;
      } while (true);
    } else {
      throw new AssertionError("unreachable");
    }

    return status;
  }

  void willReadResponse() {
    this.socket.log.traceEntity("reading response", this.requester);

    // Invoke willReadResponse socket callback.
    this.socket.willReadResponse(this);
    try {
      // Invoke willReadResponse requester callback.
      this.requester.willReadResponse();
    } catch (HttpException cause) {
      this.socket.log.warningStatus("willReadResponse callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneReading();
      this.socket.doneWriting();
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.socket.log.errorStatus("willReadResponse callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneReading();
      this.socket.doneWriting();
    }
  }

  void willReadResponseMessage() {
    this.socket.log.traceEntity("reading response message", this.requester);

    // Invoke willReadResponseMessage socket callback.
    this.socket.willReadResponseMessage(this);
    try {
      // Invoke willReadResponseMessage requester callback.
      this.requester.willReadResponseMessage();
    } catch (HttpException cause) {
      this.socket.log.warningStatus("willReadResponseMessage callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneReading();
      this.socket.doneWriting();
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.socket.log.errorStatus("willReadResponseMessage callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneReading();
      this.socket.doneWriting();
    }
  }

  void didReadResponseMessage(Result<HttpResponse<?>> decoded) {
    if (decoded.isError()) {
      this.socket.log.warningStatus("failed to read response message", this.requester, decoded.getError());
    } else if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read response message", this.toLogResponse(decoded.getNonNull()));
    }

    try {
      // Invoke didReadResponseMessage requester callback.
      this.requester.didReadResponseMessage(decoded);
    } catch (HttpException cause) {
      this.socket.log.warningStatus("didReadResponseMessage callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneReading();
      this.socket.doneWriting();
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.socket.log.errorStatus("didReadResponseMessage callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneReading();
      this.socket.doneWriting();
    }
    // Invoke didReadResponseMessage socket callback.
    this.socket.didReadResponseMessage(decoded, this);
  }

  void willReadResponsePayload(HttpResponse<?> response) {
    this.socket.log.traceEntity("reading response payload", this.requester);

    // Invoke willReadResponsePayload socket callback.
    this.socket.willReadResponsePayload(response, this);
    try {
      // Invoke willReadResponsePayload requester callback.
      this.requester.willReadResponsePayload(response);
    } catch (HttpException cause) {
      this.socket.log.warningStatus("willReadResponsePayload callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneReading();
      this.socket.doneWriting();
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.socket.log.errorStatus("willReadResponsePayload callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneReading();
      this.socket.doneWriting();
    }
  }

  void didReadResponsePayload(Result<HttpResponse<?>> decoded) {
    if (decoded.isError()) {
      this.socket.log.warningStatus("failed to read response payload", this.requester, decoded.getError());
    } else if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read response payload", this.toLogPayload(decoded.getNonNull().payload()));
    }

    try {
      // Invoke didReadResponsePayload requester callback.
      this.requester.didReadResponsePayload(decoded);
    } catch (HttpException cause) {
      this.socket.log.warningStatus("didReadResponsePayload callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneReading();
      this.socket.doneWriting();
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.socket.log.errorStatus("didReadResponsePayload callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneReading();
      this.socket.doneWriting();
    }
    // Invoke didReadResponsePayload socket callback.
    this.socket.didReadResponsePayload(decoded, this);
  }

  void didReadResponse(Result<HttpResponse<?>> decoded) {
    if (decoded.isOk() && this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("read response", this.toLogResponse(decoded.getNonNull()));
    }

    try {
      // Invoke didReadResponse requester callback.
      this.requester.didReadResponse(decoded);
    } catch (HttpException cause) {
      this.socket.log.warningStatus("didReadResponse callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneReading();
      this.socket.doneWriting();
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.socket.log.errorStatus("didReadResponse callback failed", this.requester, cause);
      // Cleanly close the connection.
      this.socket.doneReading();
      this.socket.doneWriting();
    }
    // Invoke didReadResponse socket callback.
    this.socket.didReadResponse(decoded, this);
  }

  @Override
  public Result<HttpResponse<?>> responseResult() {
    return (Result<HttpResponse<?>>) DECODED.getOpaque(this);
  }

  @Override
  public void become(HttpRequester requester) {
    requester.setRequesterContext(this);
    this.requester = requester;
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
    }
    return null;
  }

  static final int READ_RESPONSE = 1 << 0;
  static final int REQUEST_CLOSE = 1 << 1;

  static final int FLAG_BITS = 2;
  static final int FLAG_MASK = (1 << FLAG_BITS) - 1;

  static final int ENCODE_INITIAL = 0;
  static final int ENCODE_MESSAGE = 1;
  static final int ENCODE_PAYLOAD = 2;
  static final int ENCODE_DONE = 3;
  static final int ENCODE_ERROR = 4;

  static final int ENCODE_SHIFT = FLAG_BITS;
  static final int ENCODE_BITS = 3;
  static final int ENCODE_MASK = ((1 << ENCODE_BITS) - 1) << ENCODE_SHIFT;

  static final int DECODE_INITIAL = 0;
  static final int DECODE_MESSAGE = 1;
  static final int DECODE_PAYLOAD = 2;
  static final int DECODE_DONE = 3;
  static final int DECODE_ERROR = 4;

  static final int DECODE_SHIFT = ENCODE_SHIFT + ENCODE_BITS;
  static final int DECODE_BITS = 3;
  static final int DECODE_MASK = ((1 << DECODE_BITS) - 1) << DECODE_SHIFT;

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
   * {@code VarHandle} for atomically accessing the {@link #request} field.
   */
  static final VarHandle REQUEST;

  /**
   * {@code VarHandle} for atomically accessing the {@link #encoded} field.
   */
  static final VarHandle ENCODED;

  /**
   * {@code VarHandle} for atomically accessing the {@link #encode} field.
   */
  static final VarHandle ENCODE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #decode} field.
   */
  static final VarHandle DECODE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #decoded} field.
   */
  static final VarHandle DECODED;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      REQUEST = lookup.findVarHandle(HttpClientRequester.class, "request", HttpRequest.class);
      ENCODED = lookup.findVarHandle(HttpClientRequester.class, "encoded", Result.class);
      ENCODE = lookup.findVarHandle(HttpClientRequester.class, "encode", Encode.class);
      DECODE = lookup.findVarHandle(HttpClientRequester.class, "decode", Decode.class);
      DECODED = lookup.findVarHandle(HttpClientRequester.class, "decoded", Result.class);
      STATUS = lookup.findVarHandle(HttpClientRequester.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
