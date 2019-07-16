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
import swim.observable.ObservableValue;
import swim.observable.function.DidSet;
import swim.observable.function.WillSet;
import swim.streamlet.Inlet;
import swim.streamlet.Outlet;
import swim.structure.Form;

public interface ValueLane<V> extends Lane, ObservableValue<V>, Inlet<V>, Outlet<V> {
  Form<V> valueForm();

  <V2> ValueLane<V2> valueForm(Form<V2> valueForm);

  <V2> ValueLane<V2> valueClass(Class<V2> valueClass);

  boolean isResident();

  ValueLane<V> isResident(boolean isResident);

  boolean isTransient();

  ValueLane<V> isTransient(boolean isTransient);

  @Override
  ValueLane<V> isSigned(boolean isSigned);

  @Override
  ValueLane<V> observe(Object observer);

  @Override
  ValueLane<V> unobserve(Object observer);

  @Override
  ValueLane<V> willSet(WillSet<V> willSet);

  @Override
  ValueLane<V> didSet(DidSet<V> didSet);

  @Override
  ValueLane<V> willCommand(WillCommand willCommand);

  @Override
  ValueLane<V> didCommand(DidCommand didCommand);

  @Override
  ValueLane<V> willUplink(WillUplink willUplink);

  @Override
  ValueLane<V> didUplink(DidUplink didUplink);

  @Override
  ValueLane<V> willEnter(WillEnter willEnter);

  @Override
  ValueLane<V> didEnter(DidEnter didEnter);

  @Override
  ValueLane<V> willLeave(WillLeave willLeave);

  @Override
  ValueLane<V> didLeave(DidLeave didLeave);

  @Override
  ValueLane<V> decodeRequest(DecodeRequestHttp<Object> decodeRequest);

  @Override
  ValueLane<V> willRequest(WillRequestHttp<?> willRequest);

  @Override
  ValueLane<V> didRequest(DidRequestHttp<Object> didRequest);

  @Override
  ValueLane<V> doRespond(DoRespondHttp<Object> doRespond);

  @Override
  ValueLane<V> willRespond(WillRespondHttp<?> willRespond);

  @Override
  ValueLane<V> didRespond(DidRespondHttp<?> didRespond);

  @Override
  V get();

  @Override
  V set(V newValue);
}
