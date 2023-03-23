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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Decode;
import swim.codec.Encode;
import swim.codec.InputBuffer;
import swim.codec.OutputBuffer;
import swim.http.HttpException;
import swim.http.HttpPayload;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.util.Result;

@Public
@Since("5.0")
public interface HttpResponder {

  @Nullable HttpResponderContext responderContext();

  void setResponderContext(@Nullable HttpResponderContext responderContext);

  default void willReadRequest() throws HttpException {
    final HttpResponderContext context = this.responderContext();
    if (context == null) {
      throw new IllegalStateException("Unbound responder");
    }
    context.readRequest();
  }

  default void willReadRequestMessage() throws HttpException {
    // hook
  }

  default Decode<? extends HttpRequest<?>> decodeRequestMessage(InputBuffer input) throws HttpException {
    return HttpRequest.parse(input);
  }

  default void didReadRequestMessage(Result<HttpRequest<?>> requestResult) throws HttpException {
    if (requestResult.isError()) {
      final HttpResponderContext context = this.responderContext();
      if (context == null) {
        throw new IllegalStateException("Unbound responder");
      }
      context.writeResponse(HttpResponse.error(requestResult.getError()));
    }
  }

  default void willReadRequestPayload(HttpRequest<?> request) throws HttpException {
    // hook
  }

  default Decode<? extends HttpPayload<?>> decodeRequestPayload(InputBuffer input, HttpRequest<?> request) throws HttpException {
    return request.decodePayload(input);
  }

  default void didReadRequestPayload(Result<HttpRequest<?>> requestResult) throws HttpException {
    if (requestResult.isError()) {
      final HttpResponderContext context = this.responderContext();
      if (context == null) {
        throw new IllegalStateException("Unbound responder");
      }
      context.writeResponse(HttpResponse.error(requestResult.getError()));
    }
  }

  default void didReadRequest(Result<HttpRequest<?>> requestResult) throws HttpException {
    // hook
  }

  default void willWriteResponse() throws HttpException {
    // hook
  }

  default void willWriteResponseMessage() throws HttpException {
    // hook
  }

  default Encode<? extends HttpResponse<?>> encodeResponseMessage(OutputBuffer<?> output, HttpResponse<?> response) throws HttpException {
    return response.write(output);
  }

  default void didWriteResponseMessage(Result<HttpResponse<?>> responseResult) throws HttpException {
    // hook
  }

  default void willWriteResponsePayload(HttpResponse<?> response) throws HttpException {
    // hook
  }

  default Encode<? extends HttpPayload<?>> encodeResponsePayload(OutputBuffer<?> output, HttpResponse<?> response) throws HttpException {
    return response.payload().encode(output);
  }

  default void didWriteResponsePayload(Result<HttpResponse<?>> responseResult) throws HttpException {
    // hook
  }

  default void didWriteResponse(Result<HttpResponse<?>> responseResult) throws HttpException {
    // hook
  }

  default void willClose() {
    // hook
  }

  default void didClose() {
    // hook
  }

}
