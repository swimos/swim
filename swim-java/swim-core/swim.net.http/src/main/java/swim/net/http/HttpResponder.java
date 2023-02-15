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
public interface HttpResponder {

  @Nullable HttpResponderContext responderContext();

  void setResponderContext(@Nullable HttpResponderContext responderContext);

  default void willReadRequest() {
    // hook
  }

  default void willReadRequestMessage() {
    // hook
  }

  default void didReadRequestMessage(HttpRequest<?> request) {
    // hook
  }

  default void willReadRequestPayload(HttpRequest<?> request) {
    // hook
  }

  default void didReadRequestPayload(HttpRequest<?> request) {
    // hook
  }

  default void didReadRequest(HttpRequest<?> request) {
    // hook
  }

  default void willWriteResponse(HttpRequest<?> request) {
    // hook
  }

  default void willWriteResponseMessage(HttpRequest<?> request) {
    // hook
  }

  default void didWriteResponseMessage(HttpRequest<?> request, HttpResponse<?> response) {
    // hook
  }

  default void willWriteResponsePayload(HttpRequest<?> request, HttpResponse<?> response) {
    // hook
  }

  default void didWriteResponsePayload(HttpRequest<?> request, HttpResponse<?> response) {
    // hook
  }

  default void didWriteResponse(HttpRequest<?> request, HttpResponse<?> response) {
    // hook
  }

  default void willClose() {
    // hook
  }

  default void didClose() {
    // hook
  }

}
