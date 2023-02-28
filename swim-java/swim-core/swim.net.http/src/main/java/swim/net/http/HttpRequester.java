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

  default Encode<? extends HttpRequest<?>> encodeRequestMessage(OutputBuffer<?> output) {
    final HttpRequesterContext context = this.requesterContext();
    if (context == null) {
      throw new IllegalStateException("Unbound requester");
    }
    return context.request().write(output);
  }

  default void didWriteRequestMessage() {
    // hook
  }

  default void willWriteRequestPayload() {
    // hook
  }

  default Encode<? extends HttpPayload<?>> encodeRequestPayload(OutputBuffer<?> output) {
    final HttpRequesterContext context = this.requesterContext();
    if (context == null) {
      throw new IllegalStateException("Unbound requester");
    }
    return context.request().payload().encode(output);
  }

  default void didWriteRequestPayload() {
    // hook
  }

  default void didWriteRequest() {
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

  default void didReadResponseMessage() {
    // hook
  }

  default void willReadResponsePayload() {
    // hook
  }

  default Decode<? extends HttpPayload<?>> decodeResponsePayload(InputBuffer input) {
    final HttpRequesterContext context = this.requesterContext();
    if (context == null) {
      throw new IllegalStateException("Unbound requester");
    }
    return context.response().decodePayload(input);
  }

  default void didReadResponsePayload() {
    // hook
  }

  default void didReadResponse() {
    // hook
  }

  default void willClose() {
    // hook
  }

  default void didClose() {
    // hook
  }

}
