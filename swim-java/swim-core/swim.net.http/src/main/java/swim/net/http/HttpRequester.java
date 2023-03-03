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
public interface HttpRequester {

  @Nullable HttpRequesterContext requesterContext();

  void setRequesterContext(@Nullable HttpRequesterContext requesterContext);

  default void willWriteRequest() {
    // hook
  }

  default void willWriteRequestMessage() {
    // hook
  }

  default Encode<? extends HttpRequest<?>> encodeRequestMessage(OutputBuffer<?> output, HttpRequest<?> request) {
    return request.write(output);
  }

  default void didWriteRequestMessage(Result<HttpRequest<?>> request) {
    // hook
  }

  default void willWriteRequestPayload(HttpRequest<?> request) {
    // hook
  }

  default Encode<? extends HttpPayload<?>> encodeRequestPayload(OutputBuffer<?> output, HttpRequest<?> request) {
    return request.payload().encode(output);
  }

  default void didWriteRequestPayload(Result<HttpRequest<?>> request) {
    // hook
  }

  default void didWriteRequest(Result<HttpRequest<?>> request) {
    // hook
  }

  default void willReadResponse() {
    final HttpRequesterContext context = this.requesterContext();
    if (context == null) {
      throw new IllegalStateException("Unbound requester");
    }
    context.readResponse();
  }

  default void willReadResponseMessage() {
    // hook
  }

  default Decode<? extends HttpResponse<?>> decodeResponseMessage(InputBuffer input) {
    return HttpResponse.parse(input);
  }

  default void didReadResponseMessage(Result<HttpResponse<?>> response) {
    // hook
  }

  default void willReadResponsePayload(HttpResponse<?> response) {
    // hook
  }

  default Decode<? extends HttpPayload<?>> decodeResponsePayload(InputBuffer input, HttpResponse<?> response) {
    return response.decodePayload(input);
  }

  default void didReadResponsePayload(Result<HttpResponse<?>> response) {
    // hook
  }

  default void didReadResponse(Result<HttpResponse<?>> response) {
    // hook
  }

  default void willClose() {
    // hook
  }

  default void didClose() {
    // hook
  }

}
