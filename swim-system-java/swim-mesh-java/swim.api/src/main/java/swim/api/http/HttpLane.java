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

import swim.api.Lane;
import swim.api.http.function.DecodeRequestHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;

public interface HttpLane<V> extends Lane {
  @Override
  HttpLane<V> observe(Object observer);

  @Override
  HttpLane<V> unobserve(Object observer);

  HttpLane<V> decodeRequest(DecodeRequestHttp<V> decodeRequest);

  HttpLane<V> willRequest(WillRequestHttp<?> willRequest);

  HttpLane<V> didRequest(DidRequestHttp<V> didRequest);

  HttpLane<V> doRespond(DoRespondHttp<V> doRespond);

  HttpLane<V> willRespond(WillRespondHttp<?> willRespond);

  HttpLane<V> didRespond(DidRespondHttp<?> didRespond);
}
