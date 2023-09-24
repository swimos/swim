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
public interface HttpRequester {

  @Nullable HttpRequesterContext requesterContext();

  void setRequesterContext(@Nullable HttpRequesterContext requesterContext);

  default void willWriteRequest() throws HttpException {
    // hook
  }

  default void willWriteRequestMessage() throws HttpException {
    // hook
  }

  default Encode<? extends HttpRequest<?>> encodeRequestMessage(OutputBuffer<?> output, HttpRequest<?> request) throws HttpException {
    return request.write(output);
  }

  default void didWriteRequestMessage(Result<HttpRequest<?>> requestResult) throws HttpException {
    // hook
  }

  default void willWriteRequestPayload(HttpRequest<?> request) throws HttpException {
    // hook
  }

  default Encode<? extends HttpPayload<?>> encodeRequestPayload(OutputBuffer<?> output, HttpRequest<?> request) throws HttpException {
    return request.payload().encode(output);
  }

  default void didWriteRequestPayload(Result<HttpRequest<?>> requestResult) throws HttpException {
    // hook
  }

  default void didWriteRequest(Result<HttpRequest<?>> requestResult) throws HttpException {
    // hook
  }

  default void willReadResponse() throws HttpException {
    final HttpRequesterContext context = this.requesterContext();
    if (context == null) {
      throw new IllegalStateException("unbound requester");
    }
    context.readResponse();
  }

  default void willReadResponseMessage() throws HttpException {
    // hook
  }

  default Decode<? extends HttpResponse<?>> decodeResponseMessage(InputBuffer input) throws HttpException {
    return HttpResponse.parse(input);
  }

  default void didReadResponseMessage(Result<HttpResponse<?>> responseResult) throws HttpException {
    // hook
  }

  default void willReadResponsePayload(HttpResponse<?> response) throws HttpException {
    // hook
  }

  default Decode<? extends HttpPayload<?>> decodeResponsePayload(InputBuffer input, HttpResponse<?> response) throws HttpException {
    final HttpRequesterContext context = this.requesterContext();
    if (context == null) {
      throw new IllegalStateException("unbound requester");
    }
    return response.decodePayload(input, context.request());
  }

  default void didReadResponsePayload(Result<HttpResponse<?>> responseResult) throws HttpException {
    // hook
  }

  default void didReadResponse(Result<HttpResponse<?>> responseResult) throws HttpException {
    // hook
  }

  default void willClose() {
    // hook
  }

  default void didClose() {
    // hook
  }

}
