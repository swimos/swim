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

  default void didWriteRequestMessage(HttpRequest<?> request) {
    // hook
  }

  default void willWriteRequestPayload(HttpRequest<?> request) {
    // hook
  }

  default void didWriteRequestPayload(HttpRequest<?> request) {
    // hook
  }

  default void didWriteRequest(HttpRequest<?> request) {
    // hook
  }

  default void willReadResponse(HttpRequest<?> request) {
    // hook
  }

  default void willReadResponseMessage(HttpRequest<?> request) {
    // hook
  }

  default void didReadResponseMessage(HttpRequest<?> request, HttpResponse<?> response) {
    // hook
  }

  default void willReadResponsePayload(HttpRequest<?> request, HttpResponse<?> response) {
    // hook
  }

  default void didReadResponsePayload(HttpRequest<?> request, HttpResponse<?> response) {
    // hook
  }

  default void didReadResponse(HttpRequest<?> request, HttpResponse<?> response) {
    // hook
  }

  default void willClose() {
    // hook
  }

  default void didClose() {
    // hook
  }

}
