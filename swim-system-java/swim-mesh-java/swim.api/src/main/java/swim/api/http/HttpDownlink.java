// Copyright 2015-2019 SWIM.AI inc.
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

package swim.api.http;

import swim.api.Downlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.http.function.DecodeResponseHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRequestHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.uri.Uri;

public interface HttpDownlink<V> extends Downlink, HttpLink {
  HttpDownlink<V> requestUri(Uri requestUri);

  @Override
  HttpDownlink<V> observe(Object observer);

  @Override
  HttpDownlink<V> unobserve(Object observer);

  HttpDownlink<V> doRequest(DoRequestHttp<?> doRequest);

  HttpDownlink<V> willRequest(WillRequestHttp<?> willRequest);

  HttpDownlink<V> didRequest(DidRequestHttp<?> didRequest);

  HttpDownlink<V> decodeResponse(DecodeResponseHttp<V> decodeResponse);

  HttpDownlink<V> willRespond(WillRespondHttp<V> willRespond);

  HttpDownlink<V> didRespond(DidRespondHttp<V> didRespond);

  @Override
  HttpDownlink<V> didConnect(DidConnect didConnect);

  @Override
  HttpDownlink<V> didDisconnect(DidDisconnect didDisconnect);

  @Override
  HttpDownlink<V> didClose(DidClose didClose);

  @Override
  HttpDownlink<V> didFail(DidFail didFail);

  @Override
  HttpDownlink<V> open();
}
