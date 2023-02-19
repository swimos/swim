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

final class HttpClientRequester implements HttpRequesterContext, InputFuture, OutputFuture {

  final HttpClientSocket socket;
  HttpRequester requester;
  Encode<? extends HttpRequest<?>> requestMessage;
  Encode<? extends HttpPayload<?>> requestPayload;
  Decode<? extends HttpResponse<?>> responseMessage;
  Decode<? extends HttpPayload<?>> responsePayload;
  int status;

  HttpClientRequester(HttpClientSocket socket, HttpRequester requester) {
    // Initialize parameters.
    this.socket = socket;
    this.requester = requester;

    // Initialize transcoders.
    this.requestMessage = REQUEST_MESSAGE_PENDING;
    this.requestPayload = REQUEST_PAYLOAD_PENDING;
    this.responseMessage = RESPONSE_MESSAGE_PENDING;
    this.responsePayload = RESPONSE_PAYLOAD_PENDING;

    // Initialize status.
    this.status = 0;
  }

  @Override
  public HttpRequester requester() {
    return this.requester;
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
    return writeState == WRITE_DONE || writeState == WRITE_ERROR;
  }

  @Override
  public boolean writeRequestMessage(Encode<? extends HttpRequest<?>> encodeMessage) {
    if (REQUEST_MESSAGE.compareAndExchangeRelease(this, REQUEST_MESSAGE_PENDING, encodeMessage) == REQUEST_MESSAGE_PENDING) {
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
    if (REQUEST_PAYLOAD.compareAndExchangeRelease(this, REQUEST_PAYLOAD_PENDING, encodePayload) == REQUEST_PAYLOAD_PENDING) {
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
    // Try to enqueue the response handler in the responder queue.
    // Don't initiate the request until enqueued in the responder queue.
    if (!this.socket.enqueueResponder(this)) {
      // The responder queue is full; discontinue writing requests
      // until a slot opens up in the responder queue.
      this.socket.log.debug("pipeline full");
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
        // Initiate the request.
        this.willWriteRequest();
        // Initiate the request message.
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
    Encode<HttpRequest<?>> requestMessage = (Encode<HttpRequest<?>>) REQUEST_MESSAGE.getOpaque(this);
    if (requestMessage == REQUEST_MESSAGE_PENDING) {
      // writeRequestMessage not yet called.
      return status;
    }

    try {
      // Encode the request message into the write buffer.
      requestMessage = requestMessage.produce(this.socket.outputBuffer);
      // Prepare to transfer data from the write buffer to the socket.
      this.socket.writeBuffer.flip();
      try {
        // Write data from the write buffer to the socket.
        this.socket.write(this.socket.writeBuffer);
      } catch (ClosedChannelException cause) {
        // Finalize the request message encode.
        requestMessage = requestMessage.produce(BinaryOutputBuffer.done());
      }
    } finally {
      // Prepare the write buffer for the next write.
      this.socket.writeBuffer.compact();
      // Store the request message encode state.
      REQUEST_MESSAGE.setOpaque(this, requestMessage);
    }

    if (this.socket.writeBuffer.position() != 0 || requestMessage.isCont()) {
      // The write buffer has not been fully written to the socket,
      // and/or the request message is still being encoded;
      // yield until the socket is ready for more data.
      this.socket.requestWrite();
    } else if (requestMessage.isDone()) {
      // Successfully wrote the request message;
      // transition to the write payload state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_PAYLOAD << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Complete the request message.
          this.didWriteRequestMessage();
          // Request a read to ensure that the response gets handled.
          this.socket.requestRead();
          // Initiate the request payload.
          this.willWriteRequestPayload();
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (requestMessage.isError()) {
      // Failed to write the request message;
      // transition to the write error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_ERROR << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Close the socket for writing.
          this.socket.doneWriting();
          // Complete the request message with the encode error;
          // the requester can read an error response or close the socket.
          this.didWriteRequestMessage();
          // Request a read to ensure that the response gets handled.
          this.socket.requestRead();
          // Dequeue the request handler from the requester queue.
          this.socket.dequeueRequester(this);
          // Complete the request without encoding the request payload.
          this.didWriteRequest();
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
    Encode<HttpPayload<?>> requestPayload = (Encode<HttpPayload<?>>) REQUEST_PAYLOAD.getOpaque(this);
    if (requestPayload == REQUEST_PAYLOAD_PENDING) {
      // writeRequestPayload not yet called.
      return status;
    }

    try {
      // Encode the request payload into the write buffer.
      requestPayload = requestPayload.produce(this.socket.outputBuffer);
      // Prepare to transfer data from the write buffer to the socket.
      this.socket.writeBuffer.flip();
      try {
        // Write data from the write buffer to the socket.
        this.socket.write(this.socket.writeBuffer);
      } catch (ClosedChannelException cause) {
        // Finalize the request payload encode.
        requestPayload = requestPayload.produce(BinaryOutputBuffer.done());
      }
    } finally {
      // Prepare the write buffer for the next write.
      this.socket.writeBuffer.compact();
      // Store the request payload encode state.
      REQUEST_PAYLOAD.setOpaque(this, requestPayload);
    }

    if (this.socket.writeBuffer.position() != 0) {
      // The write buffer has not been fully written to the socket;
      // yield until the socket is ready for more data.
      this.socket.requestWrite();
    } else if (requestPayload.isCont()) {
      // The request payload is still being encoded; propagate backpressure.
      if (!requestPayload.backoff(this)) {
        // No backpressure; yield until the socket is ready for more data.
        this.socket.requestWrite();
      } else {
        // Yield until the encoder requests another write.
      }
    } else if (requestPayload.isDone()) {
      // Successfully wrote the request payload;
      // transition to the write done state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_DONE << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          final Encode<HttpRequest<?>> requestMessage = (Encode<HttpRequest<?>>) REQUEST_MESSAGE.getOpaque(this);
          final HttpPayload<?> payload = requestPayload.getNonNull();
          final HttpRequest<?> request = requestMessage.getNonNull().withPayload(payload);
          REQUEST_MESSAGE.setOpaque(this, Encode.done(request));
          // Complete the request payload.
          this.didWriteRequestPayload();
          // Dequeue the request handler from the requester queue.
          this.socket.dequeueRequester(this);
          // Complete the request.
          this.didWriteRequest();
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (requestPayload.isError()) {
      // Failed to write the request payload;
      // transition to the write error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~WRITE_MASK) | (WRITE_ERROR << WRITE_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Close the socket for writing.
          this.socket.doneWriting();
          // Complete the request payload with the encode error;
          // the requester can read an error response or close the socket.
          this.didWriteRequestPayload();
          // Dequeue the request handler from the requester queue.
          this.socket.dequeueRequester(this);
          // Complete the request.
          this.didWriteRequest();
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

  void willWriteRequest() {
    this.socket.log.traceEntity("writing request", this.requester);

    this.socket.willWriteRequest(this);
    this.requester.willWriteRequest();
  }

  void willWriteRequestMessage() {
    this.socket.log.traceEntity("writing request message", this.requester);

    this.socket.willWriteRequestMessage(this);
    this.requester.willWriteRequestMessage();
  }

  void didWriteRequestMessage() {
    this.requester.didWriteRequestMessage();
    this.socket.didWriteRequestMessage(this);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote request message", this.toLogRequest(this.requestMessage()));
    }
  }

  void willWriteRequestPayload() {
    this.socket.log.traceEntity("writing request payload", this.requester);

    this.socket.willWriteRequestPayload(this);
    this.requester.willWriteRequestPayload();
  }

  void didWriteRequestPayload() {
    this.requester.didWriteRequestPayload();
    this.socket.didWriteRequestPayload(this);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("wrote request payload", this.toLogPayload(this.requestPayload().toResult()));
    }
  }

  void didWriteRequest() {
    this.requester.didWriteRequest();
    this.socket.didWriteRequest(this);

    if (this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("wrote request", this.toLogRequest(this.requestMessage()));
    }
  }

  @Override
  public Encode<? extends HttpRequest<?>> requestMessage() {
    return (Encode<? extends HttpRequest<?>>) REQUEST_MESSAGE.getOpaque(this);
  }

  @Override
  public Encode<? extends HttpPayload<?>> requestPayload() {
    return (Encode<? extends HttpPayload<?>>) REQUEST_PAYLOAD.getOpaque(this);
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
  public boolean readResponseMessage(Decode<? extends HttpResponse<?>> decodeMessage) {
    if (RESPONSE_MESSAGE.compareAndExchangeRelease(this, RESPONSE_MESSAGE_PENDING, decodeMessage) == RESPONSE_MESSAGE_PENDING) {
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
    if (RESPONSE_PAYLOAD.compareAndExchangeRelease(this, RESPONSE_PAYLOAD_PENDING, decodePayload) == RESPONSE_PAYLOAD_PENDING) {
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
    final Encode<HttpRequest<?>> requestMessage = (Encode<HttpRequest<?>>) REQUEST_MESSAGE.getOpaque(this);
    // Don't initiate the response until the request message is complete.
    if (requestMessage == REQUEST_MESSAGE_PENDING || requestMessage.isCont()) {
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
        // Initiate the response.
        this.willReadResponse();
        // Initiate the response message.
        this.willReadResponseMessage();
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
    Decode<HttpResponse<?>> responseMessage = (Decode<HttpResponse<?>>) RESPONSE_MESSAGE.getOpaque(this);
    if (responseMessage == RESPONSE_MESSAGE_PENDING) {
      // readResponseMessage not yet called.
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
      // Decode the response message from the read buffer.
      responseMessage = responseMessage.consume(this.socket.inputBuffer);
    } finally {
      // Prepare the read buffer for the next read.
      this.socket.readBuffer.compact();
      // Store the response message decode state.
      RESPONSE_MESSAGE.setOpaque(this, responseMessage);
    }

    if (responseMessage.isCont()) {
      // The response message is still being decoded;
      // yield until the socket has more data.
      this.socket.requestRead();
    } else if (responseMessage.isDone()) {
      // Successfully parsed the response message;
      // transition to the read payload state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_PAYLOAD << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Complete the response message.
          this.didReadResponseMessage();
          // Initiate the response payload.
          this.willReadResponsePayload();
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (responseMessage.isError()) {
      // Failed to parse the response message;
      // transition to the read error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_ERROR << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Close the socket for reading.
          this.socket.doneReading();
          // Complete the response message with the decode error;
          // the requester should close the socket.
          this.didReadResponseMessage();
          // Dequeue the response handler from the responder queue.
          this.socket.dequeueResponder(this);
          // Complete the response without decoding the response payload.
          this.didReadResponse();
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
    Decode<HttpPayload<?>> responsePayload = (Decode<HttpPayload<?>>) RESPONSE_PAYLOAD.getOpaque(this);
    if (responsePayload == RESPONSE_PAYLOAD_PENDING) {
      // readResponsePayload not yet called.
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
      // Decode the response payload from the read buffer.
      responsePayload = responsePayload.consume(this.socket.inputBuffer);
    } finally {
      // Prepare the read buffer for the next read.
      this.socket.readBuffer.compact();
      // Store the response payload decode state.
      RESPONSE_PAYLOAD.setOpaque(this, responsePayload);
    }

    if (responsePayload.isCont()) {
      // The response payload is still being decoded; propagate backpressure.
      if (!responsePayload.backoff(this)) {
        // No backpressure; yield until the socket has more data.
        this.socket.requestRead();
      } else {
        // Yield until the decoder requests another read.
      }
    } else if (responsePayload.isDone()) {
      // Successfully parsed the response payload;
      // transition to the read done state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_DONE << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          final Decode<HttpResponse<?>> responseMessage = (Decode<HttpResponse<?>>) RESPONSE_MESSAGE.getOpaque(this);
          final HttpPayload<?> payload = responsePayload.getNonNull();
          final HttpResponse<?> response = responseMessage.getNonNull().withPayload(payload);
          RESPONSE_MESSAGE.setOpaque(this, Decode.done(response));
          // Complete the response payload.
          this.didReadResponsePayload();
          // Dequeue the response handler from the responder queue.
          this.socket.dequeueResponder(this);
          // Complete the response.
          this.didReadResponse();
          // Re-check status to pick up any callback changes.
          status = (int) STATUS.getAcquire(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } while (true);
    } else if (responsePayload.isError()) {
      // Failed to parse the response payload;
      // transition to the read error state.
      do {
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~READ_MASK) | (READ_ERROR << READ_SHIFT);
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          // Close the socket for reading.
          this.socket.doneReading();
          // Complete the response payload with the decode error;
          // the requester should close the socket.
          this.didReadResponsePayload();
          // Dequeue the response handler from the responder queue.
          this.socket.dequeueResponder(this);
          // Complete the response.
          this.didReadResponse();
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

  void willReadResponse() {
    this.socket.log.traceEntity("reading response", this.requester);

    this.socket.willReadResponse(this);
    this.requester.willReadResponse();
  }

  void willReadResponseMessage() {
    this.socket.log.traceEntity("reading response message", this.requester);

    this.socket.willReadResponseMessage(this);
    this.requester.willReadResponseMessage();
  }

  void didReadResponseMessage() {
    this.requester.didReadResponseMessage();
    this.socket.didReadResponseMessage(this);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read response message", this.toLogResponse(this.responseMessage()));
    }
  }

  void willReadResponsePayload() {
    this.socket.log.traceEntity("reading response payload", this.requester);

    this.socket.willReadResponsePayload(this);
    this.requester.willReadResponsePayload();
  }

  void didReadResponsePayload() {
    this.requester.didReadResponsePayload();
    this.socket.didReadResponsePayload(this);

    if (this.socket.log.handles(Severity.DEBUG)) {
      this.socket.log.debug("read response payload", this.toLogPayload(this.responsePayload().toResult()));
    }
  }

  void didReadResponse() {
    this.requester.didReadResponse();
    this.socket.didReadResponse(this);

    if (this.socket.log.handles(Severity.INFO)) {
      this.socket.log.info("read response", this.toLogResponse(this.responseMessage()));
    }
  }

  @Override
  public Decode<? extends HttpResponse<?>> responseMessage() {
    return (Decode<? extends HttpResponse<?>>) RESPONSE_MESSAGE.getOpaque(this);
  }

  @Override
  public Decode<? extends HttpPayload<?>> responsePayload() {
    return (Decode<? extends HttpPayload<?>>) RESPONSE_PAYLOAD.getOpaque(this);
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

  @Nullable Object toLogRequest(Encode<? extends HttpRequest<?>> encodeRequest) {
    if (encodeRequest.isDone()) {
      final HttpRequest<?> request = encodeRequest.getNonNull();
      final TupleRepr detail = TupleRepr.of();
      detail.put("method", Repr.from(request.method().name()));
      detail.put("target", Repr.from(request.target()));
      return detail;
    }
    return null;
  }

  @Nullable Object toLogResponse(Decode<? extends HttpResponse<?>> decodeResponse) {
    if (decodeResponse.isDone()) {
      final HttpResponse<?> response = decodeResponse.getNonNull();
      final TupleRepr detail = TupleRepr.of();
      detail.put("status", Repr.from(response.status().toString()));
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

  static final int WRITE_PENDING = 0;
  static final int WRITE_MESSAGE = 1;
  static final int WRITE_PAYLOAD = 2;
  static final int WRITE_DONE = 3;
  static final int WRITE_ERROR = 4;

  static final int WRITE_BITS = 3;
  static final int WRITE_SHIFT = 0;
  static final int WRITE_MASK = ((1 << WRITE_BITS) - 1) << WRITE_SHIFT;

  static final int READ_PENDING = 0;
  static final int READ_MESSAGE = 1;
  static final int READ_PAYLOAD = 2;
  static final int READ_DONE = 3;
  static final int READ_ERROR = 4;

  static final int READ_BITS = 3;
  static final int READ_SHIFT = WRITE_BITS;
  static final int READ_MASK = ((1 << READ_BITS) - 1) << READ_SHIFT;

  static final Encode<HttpRequest<?>> REQUEST_MESSAGE_PENDING = Encode.error(new IllegalStateException("Request message unavailable"));
  static final Encode<HttpPayload<?>> REQUEST_PAYLOAD_PENDING = Encode.error(new IllegalStateException("Request payload unavailable"));
  static final Decode<HttpResponse<?>> RESPONSE_MESSAGE_PENDING = Decode.error(new IllegalStateException("Response message unavailable"));
  static final Decode<HttpPayload<?>> RESPONSE_PAYLOAD_PENDING = Decode.error(new IllegalStateException("Response payload unavailable"));

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
      REQUEST_MESSAGE = lookup.findVarHandle(HttpClientRequester.class, "requestMessage", Encode.class);
      REQUEST_PAYLOAD = lookup.findVarHandle(HttpClientRequester.class, "requestPayload", Encode.class);
      RESPONSE_MESSAGE = lookup.findVarHandle(HttpClientRequester.class, "responseMessage", Decode.class);
      RESPONSE_PAYLOAD = lookup.findVarHandle(HttpClientRequester.class, "responsePayload", Decode.class);
      STATUS = lookup.findVarHandle(HttpClientRequester.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
