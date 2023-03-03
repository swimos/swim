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
import swim.http.HttpMessage;
import swim.http.HttpPayload;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.net.NetSocket;
import swim.repr.Repr;
import swim.repr.TupleRepr;
import swim.util.Result;
import swim.util.Severity;

final class HttpServerResponder implements HttpResponderContext, InputFuture, OutputFuture {

  final HttpServerSocket socket;
  HttpResponder responder;
  @Nullable Decode<?> decodeRequest;
  Result<HttpRequest<?>> request;
  Result<HttpResponse<?>> response;
  @Nullable Encode<?> encodeResponse;
  int status;

  HttpServerResponder(HttpServerSocket socket, HttpResponder responder) {
    // Initialize parameters.
    this.socket = socket;
    this.responder = responder;

    // Initialize request state.
    this.decodeRequest = null;
    this.request = REQUEST_PENDING;

    // Initialize response state.
    this.response = RESPONSE_PENDING;
    this.encodeResponse = null;

    // Initialize status.
    this.status = 0;
  }

  @Override
  public HttpResponder responder() {
    return this.responder;
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
    final int readState = ((int) STATUS.getOpaque(this) & READ_MASK) >>> READ_SHIFT;
    return readState == READ_MESSAGE || readState == READ_PAYLOAD;
  }

  @Override
  public boolean isDoneReading() {
    final int readState = ((int) STATUS.getOpaque(this) & READ_MASK) >>> READ_SHIFT;
    return readState == READ_DONE || readState == READ_ERROR;
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
    final int readState = ((int) STATUS.getOpaque(this) & READ_MASK) >>> READ_SHIFT;
    if (readState == READ_PAYLOAD) {
      return this.socket.requestRead();
    } else {
      return false;
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  void doRead() throws IOException {
    int status = (int) STATUS.getOpaque(this);

    if ((status & READ_MASK) >>> READ_SHIFT == READ_INITIAL) {
      status = this.doReadInitial(status);
    }

    if ((status & READ_MASK) >>> READ_SHIFT == READ_MESSAGE) {
      status = this.doReadMessage(status);
    }

    if ((status & READ_MASK) >>> READ_SHIFT == READ_PAYLOAD) {
      status = this.doReadPayload(status);
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int doReadInitial(int status) throws IOException {
    // Don't initiate the request until data is available.
    if (this.socket.requestBuffer.position() == 0) {
      // Perform an initial read to check for socket closure.
      final int count = this.socket.read(this.socket.requestBuffer.byteBuffer());
      if (count == 0) {
        // No data is available yet.
        this.socket.requestRead();
        return status;
      } else if (count < 0) {
        // End of stream.
        this.socket.requestBuffer.asLast(true);
        // Close the socket for reading.
        this.socket.doneReading();
        // Dequeue the request handler from the requester queue.
        this.socket.dequeueRequester(this);
        return status;
      }
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

    // Transition to the read message state.
    do {
      if ((status & READ_MASK) >>> READ_SHIFT != READ_INITIAL) {
        throw new AssertionError();
      }
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~READ_MASK) | (READ_MESSAGE << READ_SHIFT);
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
  int doReadMessage(int status) throws IOException {
    if ((status & READ_REQUEST) == 0) {
      // readRequest not yet called.
      return status;
    }

    // Read data from the socket into the request buffer.
    final int count = this.socket.read(this.socket.requestBuffer.byteBuffer());
    if (count < 0) {
      // Signal that the end of input.
      this.socket.requestBuffer.asLast(true);
    }
    // Prepare to consume data from the request buffer.
    this.socket.requestBuffer.flip();
    // Decode the request message from the request buffer.
    Decode<? extends HttpRequest<?>> decodeRequest = (Decode<? extends HttpRequest<?>>) DECODE_REQUEST.getOpaque(this);
    try {
      if (decodeRequest == null) {
        decodeRequest = this.responder.decodeRequestMessage(this.socket.requestBuffer);
      } else {
        decodeRequest = decodeRequest.consume(this.socket.requestBuffer);
      }
    } finally {
      // Prepare the request buffer for the next read.
      this.socket.requestBuffer.compact();
    }
    if (decodeRequest.isCont()) {
      // Store the request message decode continuation.
      DECODE_REQUEST.setOpaque(this, decodeRequest);
    } else {
      // Reset the stored request decode state.
      DECODE_REQUEST.setOpaque(this, null);
    }

    if (decodeRequest.isCont()) {
      // The request message is still being decoded;
      // yield until the socket has more data.
      this.socket.requestRead();
    } else if (decodeRequest.isDone()) {
      // Successfully parsed the request message;
      // transition to the read payload state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_PAYLOAD << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Store the successfully decoded request message.
          final HttpRequest<?> request = decodeRequest.getNonNull();
          final Result<HttpRequest<?>> result = Result.ok(request);
          REQUEST.setOpaque(this, result);
          // Complete the request message.
          this.didReadRequestMessage(result);
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
    } else if (decodeRequest.isError()) {
      // Failed to parse the request message;
      // transition to the read error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_ERROR << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Store the request message decode error.
          final Result<HttpRequest<?>> result = Result.error(decodeRequest.getError());
          REQUEST.setOpaque(this, result);
          // Close the socket for reading.
          this.socket.doneReading();
          // Complete the request message with the decode error;
          // the responder can write an error response or close the socket.
          this.didReadRequestMessage(result);
          // Request a write to ensure that the response gets handled,
          // even though we might not be the head of the responder pipeline.
          this.socket.requestWrite();
          // Dequeue the request handler from the requester queue.
          this.socket.dequeueRequester(this);
          // Complete the request without decoding the request payload.
          this.didReadRequest(result);
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

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int doReadPayload(int status) throws IOException {
    HttpRequest<?> request = ((Result<HttpRequest<?>>) REQUEST.getOpaque(this)).getNonNull();

    // Read data from the socket into the request buffer.
    final int count = this.socket.read(this.socket.requestBuffer.byteBuffer());
    if (count < 0) {
      // Signal that the end of input.
      this.socket.requestBuffer.asLast(true);
    }
    // Prepare to consume data from the request buffer.
    this.socket.requestBuffer.flip();
    // Decode the request payload from the request buffer.
    Decode<? extends HttpPayload<?>> decodeRequest = (Decode<? extends HttpPayload<?>>) DECODE_REQUEST.getOpaque(this);
    try {
      if (decodeRequest == null) {
        decodeRequest = this.responder.decodeRequestPayload(this.socket.requestBuffer, request);
      } else {
        decodeRequest = decodeRequest.consume(this.socket.requestBuffer);
      }
    } finally {
      // Prepare the request buffer for the next read.
      this.socket.requestBuffer.compact();
    }
    if (decodeRequest.isCont()) {
      // Store the request payload decode continuation.
      DECODE_REQUEST.setOpaque(this, decodeRequest);
    } else {
      // Reset the stored request decode state.
      DECODE_REQUEST.setOpaque(this, null);
    }

    if (decodeRequest.isCont()) {
      // The request payload is still being decoded; propagate backpressure.
      if (!decodeRequest.backoff(this)) {
        // No backpressure; yield until the socket has more data.
        this.socket.requestRead();
      } else {
        // Yield until the decoder requests another read.
      }
    } else if (decodeRequest.isDone()) {
      // Successfully parsed the request payload;
      // transition to the read done state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_DONE << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Attach the request payload to the request message
          // and store the fully decoded request.
          request = request.withPayload(decodeRequest.getNonNull());
          final Result<HttpRequest<?>> result = Result.ok(request);
          REQUEST.setOpaque(this, result);
          // Complete the request payload.
          this.didReadRequestPayload(result);
          // Dequeue the request handler from the requester queue.
          this.socket.dequeueRequester(this);
          // Complete the request.
          this.didReadRequest(result);
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (decodeRequest.isError()) {
      // Failed to parse the request payload;
      // transition to the read error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_ERROR << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Store the request payload decode error.
          final Result<HttpRequest<?>> result = Result.error(decodeRequest.getError());
          REQUEST.setOpaque(this, result);
          // Close the socket for reading.
          this.socket.doneReading();
          // Complete the request payload with the decode error;
          // the responder can write an error response or close the socket.
          this.didReadRequestPayload(result);
          // Dequeue the request handler from the requester queue.
          this.socket.dequeueRequester(this);
          // Complete the request.
          this.didReadRequest(result);
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

  void willReadRequest() {
    this.socket.log.traceEntity("reading request", this.responder);

    this.socket.willReadRequest(this);
    this.responder.willReadRequest();
  }

  void willReadRequestMessage() {
    this.socket.log.traceEntity("reading request message", this.responder);

    this.socket.willReadRequestMessage(this);
    this.responder.willReadRequestMessage();
  }

  void didReadRequestMessage(Result<HttpRequest<?>> request) {
    this.responder.didReadRequestMessage(request);
    this.socket.didReadRequestMessage(request, this);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read request message", this.toLogRequest(request));
    }
  }

  void willReadRequestPayload(HttpRequest<?> request) {
    this.socket.log.traceEntity("reading request payload", this.responder);

    this.socket.willReadRequestPayload(request, this);
    this.responder.willReadRequestPayload(request);
  }

  void didReadRequestPayload(Result<HttpRequest<?>> request) {
    this.responder.didReadRequestPayload(request);
    this.socket.didReadRequestPayload(request, this);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read request payload", this.toLogPayload(request));
    }
  }

  void didReadRequest(Result<HttpRequest<?>> request) {
    this.responder.didReadRequest(request);
    this.socket.didReadRequest(request, this);

    if (this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("read request", this.toLogRequest(request));
    }
  }

  @Override
  public Result<HttpRequest<?>> request() {
    return (Result<HttpRequest<?>>) REQUEST.getOpaque(this);
  }

  @Override
  public boolean isWriting() {
    final int writeState = ((int) STATUS.getOpaque(this) & WRITE_MASK) >>> WRITE_SHIFT;
    return writeState == WRITE_MESSAGE || writeState == WRITE_PAYLOAD;
  }

  @Override
  public boolean isDoneWriting() {
    final int writeState = ((int) STATUS.getOpaque(this) & WRITE_MASK) >>> WRITE_SHIFT;
    return writeState == WRITE_DONE || writeState == WRITE_ERROR;
  }

  @Override
  public boolean writeResponse(HttpResponse<?> response) {
    if (RESPONSE.compareAndExchangeRelease(this, RESPONSE_PENDING, Result.ok(response)) != null) {
      return false;
    }
    // Trigger a write to begin writing the response.
    this.socket.triggerWrite();
    return true;
  }

  @Override
  public boolean requestOutput() {
    final int writeState = ((int) STATUS.getOpaque(this) & WRITE_MASK) >>> WRITE_SHIFT;
    if (writeState == WRITE_PAYLOAD) {
      return this.socket.requestWrite();
    } else {
      return false;
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  void doWrite() throws IOException {
    int status = (int) STATUS.getOpaque(this);

    if ((status & WRITE_MASK) >>> WRITE_SHIFT == WRITE_INITIAL) {
      status = this.doWriteInitial(status);
    }

    if ((status & WRITE_MASK) >>> WRITE_SHIFT == WRITE_MESSAGE) {
      status = this.doWriteMessage(status);
    }

    if ((status & WRITE_MASK) >>> WRITE_SHIFT == WRITE_PAYLOAD) {
      status = this.doWritePayload(status);
    }
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int doWriteInitial(int status) throws IOException {
    // Don't initiate the response until the request message has been handled.
    if ((status & READ_MASK) >>> READ_SHIFT == READ_INITIAL ||
        (status & READ_MASK) >>> READ_SHIFT == READ_MESSAGE) {
      return status;
    }

    // Transition to the write message state.
    do {
      if ((status & WRITE_MASK) >>> WRITE_SHIFT != WRITE_INITIAL) {
        throw new AssertionError();
      }
      final int oldStatus = status;
      final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_MESSAGE << WRITE_SHIFT);
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
  int doWriteMessage(int status) throws IOException {
    Result<HttpResponse<?>> result = (Result<HttpResponse<?>>) RESPONSE.getOpaque(this);
    if (result == (Object) RESPONSE_PENDING) {
      // writeResponseMessage not yet called.
      return status;
    }
    final HttpResponse<?> response = result.getNonNull();

    // Encode the response message into the response buffer.
    Encode<? extends HttpResponse<?>> encodeResponse = (Encode<? extends HttpResponse<?>>) ENCODE_RESPONSE.getOpaque(this);
    if (encodeResponse == null) {
      encodeResponse = this.responder.encodeResponseMessage(this.socket.responseBuffer, response);
    } else {
      encodeResponse = encodeResponse.produce(this.socket.responseBuffer);
    }
    // Prepare to transfer data from the response buffer to the socket.
    this.socket.responseBuffer.flip();
    try {
      // Write data from the response buffer to the socket.
      this.socket.write(this.socket.responseBuffer.byteBuffer());
    } catch (ClosedChannelException cause) {
      // Finalize the response message encode.
      encodeResponse = encodeResponse.produce(BinaryOutputBuffer.done());
    } finally {
      // Prepare the response buffer for the next write.
      this.socket.responseBuffer.compact();
    }
    if (encodeResponse.isCont()) {
      // Store the response message encode continuation.
      ENCODE_RESPONSE.setOpaque(this, encodeResponse);
    } else {
      // Reset the stored response encode state.
      ENCODE_RESPONSE.setOpaque(this, null);
    }

    if (this.socket.responseBuffer.position() != 0 || encodeResponse.isCont()) {
      // The response buffer has not been fully written to the socket,
      // and/or the response message is still being encoded;
      // yield until the socket is ready for more data.
      this.socket.requestWrite();
    } else if (encodeResponse.isDone()) {
      // Successfully wrote the response message;
      // transition to the write payload state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_PAYLOAD << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Complete the response message.
          this.didWriteResponseMessage(result);
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
    } else if (encodeResponse.isError()) {
      // Failed to write the response message;
      // transition to the write error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_ERROR << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Store the response message encode error.
          result = Result.error(encodeResponse.getError());
          RESPONSE.setOpaque(this, result);
          // Close the socket for writing.
          this.socket.doneWriting();
          // Complete the response message with the encode error;
          // the responder should close the socket.
          this.didWriteResponseMessage(result);
          // Dequeue the response handler from the responder queue.
          this.socket.dequeueResponder(this);
          // Complete the response without encoding the response payload.
          this.didWriteResponse(result);
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

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int doWritePayload(int status) throws IOException {
    Result<HttpResponse<?>> result = (Result<HttpResponse<?>>) RESPONSE.getOpaque(this);
    final HttpResponse<?> response = result.getNonNull();

    // Encode the response payload into the response buffer.
    Encode<? extends HttpPayload<?>> encodeResponse = (Encode<? extends HttpPayload<?>>) ENCODE_RESPONSE.getOpaque(this);
    if (encodeResponse == null) {
      encodeResponse = this.responder.encodeResponsePayload(this.socket.responseBuffer, response);
    } else {
      encodeResponse = encodeResponse.produce(this.socket.responseBuffer);
    }
    // Prepare to transfer data from the response buffer to the socket.
    this.socket.responseBuffer.flip();
    try {
      // Write data from the response buffer to the socket.
      this.socket.write(this.socket.responseBuffer.byteBuffer());
    } catch (ClosedChannelException cause) {
      // Finalize the response payload encode.
      encodeResponse = encodeResponse.produce(BinaryOutputBuffer.done());
    } finally {
      // Prepare the response buffer for the next write.
      this.socket.responseBuffer.compact();
    }
    if (encodeResponse.isCont()) {
      // Store the response payload encode continuation.
      ENCODE_RESPONSE.setOpaque(this, encodeResponse);
    } else {
      // Reset the stored response encode state.
      ENCODE_RESPONSE.setOpaque(this, null);
    }

    if (this.socket.responseBuffer.position() != 0) {
      // The response buffer has not been fully written to the socket;
      // yield until the socket is ready for more data.
      this.socket.requestWrite();
    } else if (encodeResponse.isCont()) {
      // The response payload is still being encoded; propagate backpressure.
      if (!encodeResponse.backoff(this)) {
        // No backpressure; yield until the socket is ready for more data.
        this.socket.requestWrite();
      } else {
        // Yield until the encoder requests another write.
      }
    } else if (encodeResponse.isDone()) {
      // Successfully wrote the response payload;
      // transition to the write done state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_DONE << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Complete the response payload.
          this.didWriteResponsePayload(result);
          // Dequeue the response handler from the responder queue.
          this.socket.dequeueResponder(this);
          // Complete the response.
          this.didWriteResponse(result);
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (encodeResponse.isError()) {
      // Failed to write the response payload;
      // transition to the write error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_ERROR << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Store the response payload encode error.
          result = Result.error(encodeResponse.getError());
          RESPONSE.setOpaque(this, result);
          // Close the socket for writing.
          this.socket.doneWriting();
          // Complete the response payload with the encode error;
          // the requester should close the socket.
          this.didWriteResponsePayload(result);
          // Dequeue the response handler from the responder queue.
          this.socket.dequeueResponder(this);
          // Complete the response.
          this.didWriteResponse(result);
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

  void willWriteResponse() {
    this.socket.log.traceEntity("writing response", this.responder);

    this.socket.willWriteResponse(this);
    this.responder.willWriteResponse();
  }

  void willWriteResponseMessage() {
    this.socket.log.traceEntity("writing response message", this.responder);

    this.socket.willWriteResponseMessage(this);
    this.responder.willWriteResponseMessage();
  }

  void didWriteResponseMessage(Result<HttpResponse<?>> response) {
    this.responder.didWriteResponseMessage(response);
    this.socket.didWriteResponseMessage(response, this);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote response message", this.toLogResponse(response));
    }
  }

  void willWriteResponsePayload(HttpResponse<?> response) {
    this.socket.log.traceEntity("writing response payload", this.responder);

    this.socket.willWriteResponsePayload(response, this);
    this.responder.willWriteResponsePayload(response);
  }

  void didWriteResponsePayload(Result<HttpResponse<?>> response) {
    this.responder.didWriteResponsePayload(response);
    this.socket.didWriteResponsePayload(response, this);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote response payload", this.toLogPayload(response));
    }
  }

  void didWriteResponse(Result<HttpResponse<?>> response) {
    this.responder.didWriteResponse(response);
    this.socket.didWriteResponse(response, this);

    if (this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("wrote response", this.toLogResponse(response));
    }
  }

  @Override
  public Result<HttpResponse<?>> response() {
    return (Result<HttpResponse<?>>) RESPONSE.getOpaque(this);
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

  @Nullable Object toLogRequest(Result<HttpRequest<?>> result) {
    if (result.isOk()) {
      final HttpRequest<?> request = result.getNonNull();
      final TupleRepr detail = TupleRepr.of();
      detail.put("method", Repr.of(request.method().name()));
      detail.put("target", Repr.of(request.target()));
      return detail;
    }
    return null;
  }

  @Nullable Object toLogResponse(Result<HttpResponse<?>> result) {
    if (result.isOk()) {
      final HttpResponse<?> response = result.getNonNull();
      final TupleRepr detail = TupleRepr.of();
      detail.put("status", Repr.of(response.status().toString()));
      return detail;
    }
    return null;
  }

  @Nullable Object toLogPayload(Result<? extends HttpMessage<?>> result) {
    if (result.isOk()) {
      final HttpPayload<?> payload = result.getNonNull().payload();
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
      }
    }
    return null;
  }

  static final int READ_REQUEST = 1 << 0;

  static final int FLAG_BITS = 1;
  static final int FLAG_MASK = (1 << FLAG_BITS) - 1;

  static final int READ_INITIAL = 0;
  static final int READ_MESSAGE = 1;
  static final int READ_PAYLOAD = 2;
  static final int READ_DONE = 3;
  static final int READ_ERROR = 4;

  static final int READ_SHIFT = FLAG_BITS;
  static final int READ_BITS = 3;
  static final int READ_MASK = ((1 << READ_BITS) - 1) << READ_SHIFT;

  static final int WRITE_INITIAL = 0;
  static final int WRITE_MESSAGE = 1;
  static final int WRITE_PAYLOAD = 2;
  static final int WRITE_DONE = 3;
  static final int WRITE_ERROR = 4;

  static final int WRITE_SHIFT = READ_SHIFT + READ_BITS;
  static final int WRITE_BITS = 3;
  static final int WRITE_MASK = ((1 << WRITE_BITS) - 1) << WRITE_SHIFT;

  static final Result<HttpRequest<?>> REQUEST_PENDING;
  static final Result<HttpResponse<?>> RESPONSE_PENDING;

  static {
    final IllegalStateException requestPendingError = new IllegalStateException("Request pending");
    requestPendingError.setStackTrace(new StackTraceElement[0]);
    REQUEST_PENDING = Result.error(requestPendingError);

    final IllegalStateException responsePendingError = new IllegalStateException("Response pending");
    responsePendingError.setStackTrace(new StackTraceElement[0]);
    RESPONSE_PENDING = Result.error(responsePendingError);
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #request} field.
   */
  static final VarHandle REQUEST;

  /**
   * {@code VarHandle} for atomically accessing the {@link #decodeRequest} field.
   */
  static final VarHandle DECODE_REQUEST;

  /**
   * {@code VarHandle} for atomically accessing the {@link #response} field.
   */
  static final VarHandle RESPONSE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #encodeResponse} field.
   */
  static final VarHandle ENCODE_RESPONSE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      REQUEST = lookup.findVarHandle(HttpServerResponder.class, "request", Result.class);
      DECODE_REQUEST = lookup.findVarHandle(HttpServerResponder.class, "decodeRequest", Decode.class);
      RESPONSE = lookup.findVarHandle(HttpServerResponder.class, "response", Result.class);
      ENCODE_RESPONSE = lookup.findVarHandle(HttpServerResponder.class, "encodeResponse", Encode.class);
      STATUS = lookup.findVarHandle(HttpServerResponder.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
