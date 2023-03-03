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
import swim.http.HttpPayload;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.util.Result;

@Public
@Since("5.0")
public interface HttpResponder {

  @Nullable HttpResponderContext responderContext();

  void setResponderContext(@Nullable HttpResponderContext responderContext);

  default void willReadRequest() {
    final HttpResponderContext context = this.responderContext();
    if (context == null) {
      throw new IllegalStateException("Unbound responder");
    }
    context.readRequest();
  }

  default void willReadRequestMessage() {
    // hook
  }

  default Decode<? extends HttpRequest<?>> decodeRequestMessage(InputBuffer input) {
    return HttpRequest.parse(input);
  }

  default void didReadRequestMessage(Result<HttpRequest<?>> request) {
    // hook
  }

  default void willReadRequestPayload(HttpRequest<?> request) {
    // hook
  }

  default Decode<? extends HttpPayload<?>> decodeRequestPayload(InputBuffer input, HttpRequest<?> request) {
    return request.decodePayload(input);
  }

  default void didReadRequestPayload(Result<HttpRequest<?>> request) {
    // hook
  }

  default void didReadRequest(Result<HttpRequest<?>> request) {
    // hook
  }

  default void willWriteResponse() {
    // hook
  }

  default void willWriteResponseMessage() {
    // hook
  }

  default Encode<? extends HttpResponse<?>> encodeResponseMessage(OutputBuffer<?> output, HttpResponse<?> response) {
    return response.write(output);
  }

  default void didWriteResponseMessage(Result<HttpResponse<?>> response) {
    // hook
  }

  default void willWriteResponsePayload(HttpResponse<?> response) {
    // hook
  }

  default Encode<? extends HttpPayload<?>> encodeResponsePayload(OutputBuffer<?> output, HttpResponse<?> response) {
    return response.payload().encode(output);
  }

  default void didWriteResponsePayload(Result<HttpResponse<?>> response) {
    // hook
  }

  default void didWriteResponse(Result<HttpResponse<?>> response) {
    // hook
  }

  default void willClose() {
    // hook
  }

  default void didClose() {
    // hook
  }

}
