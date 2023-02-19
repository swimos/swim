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
import swim.net.NetSocket;
import swim.repr.Repr;
import swim.repr.TupleRepr;
import swim.util.Result;
import swim.util.Severity;

final class HttpServerResponder implements HttpResponderContext, InputFuture, OutputFuture {

  final HttpServerSocket socket;
  HttpResponder responder;
  Decode<? extends HttpRequest<?>> requestMessage;
  Decode<? extends HttpPayload<?>> requestPayload;
  Encode<? extends HttpResponse<?>> responseMessage;
  Encode<? extends HttpPayload<?>> responsePayload;
  int status;

  HttpServerResponder(HttpServerSocket socket, HttpResponder responder) {
    // Initialize parameters.
    this.socket = socket;
    this.responder = responder;

    // Initialize transcoders.
    this.requestMessage = REQUEST_MESSAGE_PENDING;
    this.requestPayload = REQUEST_PAYLOAD_PENDING;
    this.responseMessage = RESPONSE_MESSAGE_PENDING;
    this.responsePayload = RESPONSE_PAYLOAD_PENDING;

    // Initialize status.
    this.status = 0;
  }

  @Override
  public HttpResponder responder() {
    return this.responder;
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
    return readState == READ_DONE || readState == READ_ERROR;
  }

  @Override
  public boolean readRequestMessage(Decode<? extends HttpRequest<?>> decodeMessage) {
    if (REQUEST_MESSAGE.compareAndExchangeRelease(this, REQUEST_MESSAGE_PENDING, decodeMessage) == REQUEST_MESSAGE_PENDING) {
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
    if (REQUEST_PAYLOAD.compareAndExchangeRelease(this, REQUEST_PAYLOAD_PENDING, decodePayload) == REQUEST_PAYLOAD_PENDING) {
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
      // The responder queue is full; discontinue reading requests to
      // propagate processing backpressure to the client until a slot
      // opens up in the responder queue.
      this.socket.log.debug("pipeline full");
      return status;
    }

    // Transition to the read message state.
    do {
      if ((status & READ_MASK) >>> READ_SHIFT != READ_PENDING) {
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
    Decode<HttpRequest<?>> requestMessage = (Decode<HttpRequest<?>>) REQUEST_MESSAGE.getOpaque(this);
    if (requestMessage == REQUEST_MESSAGE_PENDING) {
      // readRequestMessage not yet called.
      return status;
    }

    try {
      // Read data from the socket into the read buffer.
      final int count = this.socket.read(this.socket.readBuffer);
      if (count < 0) {
        // Signal that the end of input.
        this.socket.inputBuffer.asLast(true);
      }
      // Prepare to consume data from the read buffer.
      this.socket.readBuffer.flip();
      // Decode the request message from the read buffer.
      requestMessage = requestMessage.consume(this.socket.inputBuffer);
    } finally {
      // Prepare the read buffer for the next read.
      this.socket.readBuffer.compact();
      // Store the request message decode state.
      REQUEST_MESSAGE.setOpaque(this, requestMessage);
    }

    if (requestMessage.isCont()) {
      // The request message is still being decoded;
      // yield until the socket has more data.
      this.socket.requestRead();
    } else if (requestMessage.isDone()) {
      // Successfully parsed the request message;
      // transition to the read payload state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_PAYLOAD << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Complete the request message.
          this.didReadRequestMessage();
          // Request a write to ensure that the response gets handled.
          this.socket.requestWrite();
          // Initiate the request payload.
          this.willReadRequestPayload();
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (requestMessage.isError()) {
      // Failed to parse the request message;
      // transition to the read error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_ERROR << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Close the socket for reading.
          this.socket.doneReading();
          // Complete the request message with the decode error;
          // the responder can write an error response or close the socket.
          this.didReadRequestMessage();
          // Request a write to ensure that the response gets handled.
          this.socket.requestWrite();
          // Dequeue the request handler from the requester queue.
          this.socket.dequeueRequester(this);
          // Complete the request without decoding the request payload.
          this.didReadRequest();
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
    Decode<HttpPayload<?>> requestPayload = (Decode<HttpPayload<?>>) REQUEST_PAYLOAD.getOpaque(this);
    if (requestPayload == REQUEST_PAYLOAD_PENDING) {
      // readRequestPayload not yet called.
      return status;
    }

    try {
      // Read data from the socket into the read buffer.
      final int count = this.socket.read(this.socket.readBuffer);
      if (count < 0) {
        // Signal that the end of input.
        this.socket.inputBuffer.asLast(true);
      }
      // Prepare to consume data from the read buffer.
      this.socket.readBuffer.flip();
      // Decode the request payload from the read buffer.
      requestPayload = requestPayload.consume(this.socket.inputBuffer);
    } finally {
      // Prepare the read buffer for the next read.
      this.socket.readBuffer.compact();
      // Store the request payload decode state.
      REQUEST_PAYLOAD.setOpaque(this, requestPayload);
    }

    if (requestPayload.isCont()) {
      // The request payload is still being decoded; propagate backpressure.
      if (!requestPayload.backoff(this)) {
        // No backpressure; yield until the socket has more data.
        this.socket.requestRead();
      } else {
        // Yield until the decoder requests another read.
      }
    } else if (requestPayload.isDone()) {
      // Successfully parsed the request payload;
      // transition to the read done state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_DONE << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          final Decode<HttpRequest<?>> requestMessage = (Decode<HttpRequest<?>>) REQUEST_MESSAGE.getOpaque(this);
          final HttpPayload<?> payload = requestPayload.getNonNull();
          final HttpRequest<?> request = requestMessage.getNonNull().withPayload(payload);
          REQUEST_MESSAGE.setOpaque(this, Decode.done(request));
          // Complete the request payload.
          this.didReadRequestPayload();
          // Dequeue the request handler from the requester queue.
          this.socket.dequeueRequester(this);
          // Complete the request.
          this.didReadRequest();
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (requestPayload.isError()) {
      // Failed to parse the request payload;
      // transition to the read error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_ERROR << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Close the socket for reading.
          this.socket.doneReading();
          // Complete the request payload with the decode error;
          // the responder can write an error response or close the socket.
          this.didReadRequestPayload();
          // Dequeue the request handler from the requester queue.
          this.socket.dequeueRequester(this);
          // Complete the request.
          this.didReadRequest();
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

  void didReadRequestMessage() {
    this.responder.didReadRequestMessage();
    this.socket.didReadRequestMessage(this);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read request message", this.toLogRequest(this.requestMessage()));
    }
  }

  void willReadRequestPayload() {
    this.socket.log.traceEntity("reading request payload", this.responder);

    this.socket.willReadRequestPayload(this);
    this.responder.willReadRequestPayload();
  }

  void didReadRequestPayload() {
    this.responder.didReadRequestPayload();
    this.socket.didReadRequestPayload(this);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read request payload", this.toLogPayload(this.requestPayload().toResult()));
    }
  }

  void didReadRequest() {
    this.responder.didReadRequest();
    this.socket.didReadRequest(this);

    if (this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("read request", this.toLogRequest(this.requestMessage()));
    }
  }

  @Override
  public Decode<? extends HttpRequest<?>> requestMessage() {
    return (Decode<? extends HttpRequest<?>>) REQUEST_MESSAGE.getOpaque(this);
  }

  @Override
  public Decode<? extends HttpPayload<?>> requestPayload() {
    return (Decode<? extends HttpPayload<?>>) REQUEST_PAYLOAD.getOpaque(this);
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
  public boolean writeResponseMessage(Encode<? extends HttpResponse<?>> encodeMessage) {
    if (RESPONSE_MESSAGE.compareAndExchangeRelease(this, RESPONSE_MESSAGE_PENDING, encodeMessage) == RESPONSE_MESSAGE_PENDING) {
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
    if (RESPONSE_PAYLOAD.compareAndExchangeRelease(this, RESPONSE_PAYLOAD_PENDING, encodePayload) == RESPONSE_PAYLOAD_PENDING) {
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
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  int doWriteInitial(int status) throws IOException {
    final Decode<HttpRequest<?>> requestMessage = (Decode<HttpRequest<?>>) REQUEST_MESSAGE.getOpaque(this);
    // Don't initiate the response until the request message is complete.
    if (requestMessage == REQUEST_MESSAGE_PENDING || requestMessage.isCont()) {
      return status;
    }

    // Transition to the write message state.
    do {
      if ((status & WRITE_MASK) >>> WRITE_SHIFT != WRITE_PENDING) {
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
    Encode<HttpResponse<?>> responseMessage = (Encode<HttpResponse<?>>) RESPONSE_MESSAGE.getOpaque(this);
    if (responseMessage == RESPONSE_MESSAGE_PENDING) {
      // writeResponseMessage not yet called.
      return status;
    }

    try {
      // Encode the response message into the write buffer.
      responseMessage = responseMessage.produce(this.socket.outputBuffer);
      // Prepare to transfer data from the write buffer to the socket.
      this.socket.writeBuffer.flip();
      try {
        // Write data from the write buffer to the socket.
        this.socket.write(this.socket.writeBuffer);
      } catch (ClosedChannelException cause) {
        // Finalize the response message encode.
        responseMessage = responseMessage.produce(BinaryOutputBuffer.done());
      }
    } finally {
      // Prepare the write buffer for the next write.
      this.socket.writeBuffer.compact();
      // Store the response message encode state.
      RESPONSE_MESSAGE.setOpaque(this, responseMessage);
    }

    if (this.socket.writeBuffer.position() != 0 || responseMessage.isCont()) {
      // The write buffer has not been fully written to the socket,
      // and/or the response message is still being encoded;
      // yield until the socket is ready for more data.
      this.socket.requestWrite();
    } else if (responseMessage.isDone()) {
      // Successfully wrote the response message;
      // transition to the write payload state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_PAYLOAD << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Complete the response message.
          this.didWriteResponseMessage();
          // Initiate the response payload.
          this.willWriteResponsePayload();
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (responseMessage.isError()) {
      // Failed to write the response message;
      // transition to the write error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_ERROR << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Close the socket for writing.
          this.socket.doneWriting();
          // Complete the response message with the encode error;
          // the responder should close the socket.
          this.didWriteResponseMessage();
          // Dequeue the response handler from the responder queue.
          this.socket.dequeueResponder(this);
          // Complete the response without encoding the response payload.
          this.didWriteResponse();
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
    Encode<HttpPayload<?>> responsePayload = (Encode<HttpPayload<?>>) RESPONSE_PAYLOAD.getOpaque(this);
    if (responsePayload == RESPONSE_PAYLOAD_PENDING) {
      // writeResponsePayload not yet called.
      return status;
    }

    try {
      // Encode the response payload into the write buffer.
      responsePayload = responsePayload.produce(this.socket.outputBuffer);
      // Prepare to transfer data from the write buffer to the socket.
      this.socket.writeBuffer.flip();
      try {
        // Write data from the write buffer to the socket.
        this.socket.write(this.socket.writeBuffer);
      } catch (ClosedChannelException cause) {
        // Finalize the response payload encode.
        responsePayload = responsePayload.produce(BinaryOutputBuffer.done());
      }
    } finally {
      // Prepare the write buffer for the next write.
      this.socket.writeBuffer.compact();
      // Store the response payload encode state.
      RESPONSE_PAYLOAD.setOpaque(this, responsePayload);
    }

    if (this.socket.writeBuffer.position() != 0) {
      // The write buffer has not been fully written to the socket;
      // yield until the socket is ready for more data.
      this.socket.requestWrite();
    } else if (responsePayload.isCont()) {
      // The response payload is still being encoded; propagate backpressure.
      if (!responsePayload.backoff(this)) {
        // No backpressure; yield until the socket is ready for more data.
        this.socket.requestWrite();
      } else {
        // Yield until the encoder requests another write.
      }
    } else if (responsePayload.isDone()) {
      // Successfully wrote the response payload;
      // transition to the write done state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_DONE << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          final Encode<HttpResponse<?>> responseMessage = (Encode<HttpResponse<?>>) RESPONSE_MESSAGE.getOpaque(this);
          final HttpPayload<?> payload = responsePayload.getNonNull();
          final HttpResponse<?> response = responseMessage.getNonNull().withPayload(payload);
          RESPONSE_MESSAGE.setOpaque(this, Encode.done(response));
          // Complete the response payload.
          this.didWriteResponsePayload();
          // Dequeue the response handler from the responder queue.
          this.socket.dequeueResponder(this);
          // Complete the response.
          this.didWriteResponse();
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (responsePayload.isError()) {
      // Failed to write the response payload;
      // transition to the write error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_ERROR << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Close the socket for writing.
          this.socket.doneWriting();
          // Complete the response payload with the encode error;
          // the requester should close the socket.
          this.didWriteResponsePayload();
          // Dequeue the response handler from the responder queue.
          this.socket.dequeueResponder(this);
          // Complete the response.
          this.didWriteResponse();
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

  void didWriteResponseMessage() {
    this.responder.didWriteResponseMessage();
    this.socket.didWriteResponseMessage(this);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote response message", this.toLogResponse(this.responseMessage()));
    }
  }

  void willWriteResponsePayload() {
    this.socket.log.traceEntity("writing response payload", this.responder);

    this.socket.willWriteResponsePayload(this);
    this.responder.willWriteResponsePayload();
  }

  void didWriteResponsePayload() {
    this.responder.didWriteResponsePayload();
    this.socket.didWriteResponsePayload(this);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote response payload", this.toLogPayload(this.responsePayload().toResult()));
    }
  }

  void didWriteResponse() {
    this.responder.didWriteResponse();
    this.socket.didWriteResponse(this);

    if (this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("wrote response", this.toLogResponse(this.responseMessage()));
    }
  }

  @Override
  public Encode<? extends HttpResponse<?>> responseMessage() {
    return (Encode<? extends HttpResponse<?>>) RESPONSE_MESSAGE.getOpaque(this);
  }

  @Override
  public Encode<? extends HttpPayload<?>> responsePayload() {
    return (Encode<? extends HttpPayload<?>>) RESPONSE_PAYLOAD.getOpaque(this);
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

  @Nullable Object toLogRequest(Decode<? extends HttpRequest<?>> decodeRequest) {
    if (decodeRequest.isDone()) {
      final HttpRequest<?> request = decodeRequest.getNonNull();
      final TupleRepr detail = TupleRepr.of();
      detail.put("method", Repr.of(request.method().name()));
      detail.put("target", Repr.of(request.target()));
      return detail;
    }
    return null;
  }

  @Nullable Object toLogResponse(Encode<? extends HttpResponse<?>> encodeResponse) {
    if (encodeResponse.isDone()) {
      final HttpResponse<?> response = encodeResponse.getNonNull();
      final TupleRepr detail = TupleRepr.of();
      detail.put("status", Repr.of(response.status().toString()));
      return detail;
    }
    return null;
  }

  @Nullable Object toLogPayload(Result<? extends HttpPayload<?>> payloadResult) {
    if (payloadResult.isSuccess()) {
      final HttpPayload<?> payload = payloadResult.get();
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

  static final int READ_PENDING = 0;
  static final int READ_MESSAGE = 1;
  static final int READ_PAYLOAD = 2;
  static final int READ_DONE = 3;
  static final int READ_ERROR = 4;

  static final int READ_BITS = 3;
  static final int READ_SHIFT = 0;
  static final int READ_MASK = ((1 << READ_BITS) - 1) << READ_SHIFT;

  static final int WRITE_PENDING = 0;
  static final int WRITE_MESSAGE = 1;
  static final int WRITE_PAYLOAD = 2;
  static final int WRITE_DONE = 3;
  static final int WRITE_ERROR = 4;

  static final int WRITE_BITS = 3;
  static final int WRITE_SHIFT = READ_BITS;
  static final int WRITE_MASK = ((1 << WRITE_BITS) - 1) << WRITE_SHIFT;

  static final Decode<HttpRequest<?>> REQUEST_MESSAGE_PENDING = Decode.error(new IllegalStateException("Request message unavailable"));
  static final Decode<HttpPayload<?>> REQUEST_PAYLOAD_PENDING = Decode.error(new IllegalStateException("Request payload unavailable"));
  static final Encode<HttpResponse<?>> RESPONSE_MESSAGE_PENDING = Encode.error(new IllegalStateException("Response message unavailable"));
  static final Encode<HttpPayload<?>> RESPONSE_PAYLOAD_PENDING = Encode.error(new IllegalStateException("Response payload unavailable"));

  /**
   * {@code VarHandle} for atomically accessing the {@link #requestMessage} field.
   */
  static final VarHandle REQUEST_MESSAGE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #requestPayload} field.
   */
  static final VarHandle REQUEST_PAYLOAD;

  /**
   * {@code VarHandle} for atomically accessing the {@link #responseMessage} field.
   */
  static final VarHandle RESPONSE_MESSAGE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #responsePayload} field.
   */
  static final VarHandle RESPONSE_PAYLOAD;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      REQUEST_MESSAGE = lookup.findVarHandle(HttpServerResponder.class, "requestMessage", Decode.class);
      REQUEST_PAYLOAD = lookup.findVarHandle(HttpServerResponder.class, "requestPayload", Decode.class);
      RESPONSE_MESSAGE = lookup.findVarHandle(HttpServerResponder.class, "responseMessage", Encode.class);
      RESPONSE_PAYLOAD = lookup.findVarHandle(HttpServerResponder.class, "responsePayload", Encode.class);
      STATUS = lookup.findVarHandle(HttpServerResponder.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
