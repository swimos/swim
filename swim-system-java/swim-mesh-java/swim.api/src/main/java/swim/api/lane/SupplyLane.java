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

package swim.api.lane;

import swim.api.function.DidCommand;
import swim.api.function.WillCommand;
import swim.api.http.function.DecodeRequestHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.api.lane.function.DidEnter;
import swim.api.lane.function.DidLeave;
import swim.api.lane.function.DidUplink;
import swim.api.lane.function.WillEnter;
import swim.api.lane.function.WillLeave;
import swim.api.lane.function.WillUplink;
import swim.structure.Form;

public interface SupplyLane<V> extends Lane {
  Form<V> valueForm();

  <V2> SupplyLane<V2> valueForm(Form<V2> valueForm);

  <V2> SupplyLane<V2> valueClass(Class<V2> valueClass);

  @Override
  SupplyLane<V> isSigned(boolean isSigned);

  @Override
  SupplyLane<V> observe(Object observer);

  @Override
  SupplyLane<V> unobserve(Object observer);

  @Override
  SupplyLane<V> willCommand(WillCommand willCommand);

  @Override
  SupplyLane<V> didCommand(DidCommand didCommand);

  @Override
  SupplyLane<V> willUplink(WillUplink willUplink);

  @Override
  SupplyLane<V> didUplink(DidUplink didUplink);

  @Override
  SupplyLane<V> willEnter(WillEnter willEnter);

  @Override
  SupplyLane<V> didEnter(DidEnter didEnter);

  @Override
  SupplyLane<V> willLeave(WillLeave willLeave);

  @Override
  SupplyLane<V> didLeave(DidLeave didLeave);

  @Override
  SupplyLane<V> decodeRequest(DecodeRequestHttp<Object> decodeRequest);

  @Override
  SupplyLane<V> willRequest(WillRequestHttp<?> willRequest);

  @Override
  SupplyLane<V> didRequest(DidRequestHttp<Object> didRequest);

  @Override
  SupplyLane<V> doRespond(DoRespondHttp<Object> doRespond);

  @Override
  SupplyLane<V> willRespond(WillRespondHttp<?> willRespond);

  @Override
  SupplyLane<V> didRespond(DidRespondHttp<?> didRespond);

  void push(V value);
}
