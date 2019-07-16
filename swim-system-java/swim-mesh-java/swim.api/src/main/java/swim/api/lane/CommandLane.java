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
import swim.api.lane.function.OnCommand;
import swim.api.lane.function.WillEnter;
import swim.api.lane.function.WillLeave;
import swim.api.lane.function.WillUplink;
import swim.structure.Form;

public interface CommandLane<V> extends Lane {
  Form<V> valueForm();

  <V2> CommandLane<V2> valueForm(Form<V2> valueForm);

  <V2> CommandLane<V2> valueClass(Class<V2> valueClass);

  @Override
  CommandLane<V> isSigned(boolean isSigned);

  @Override
  CommandLane<V> observe(Object observer);

  @Override
  CommandLane<V> unobserve(Object observer);

  CommandLane<V> onCommand(OnCommand<V> value);

  @Override
  CommandLane<V> willCommand(WillCommand willCommand);

  @Override
  CommandLane<V> didCommand(DidCommand didCommand);

  @Override
  CommandLane<V> willUplink(WillUplink willUplink);

  @Override
  CommandLane<V> didUplink(DidUplink didUplink);

  @Override
  CommandLane<V> willEnter(WillEnter willEnter);

  @Override
  CommandLane<V> didEnter(DidEnter didEnter);

  @Override
  CommandLane<V> willLeave(WillLeave willLeave);

  @Override
  CommandLane<V> didLeave(DidLeave didLeave);

  @Override
  CommandLane<V> decodeRequest(DecodeRequestHttp<Object> decodeRequest);

  @Override
  CommandLane<V> willRequest(WillRequestHttp<?> willRequest);

  @Override
  CommandLane<V> didRequest(DidRequestHttp<Object> didRequest);

  @Override
  CommandLane<V> doRespond(DoRespondHttp<Object> doRespond);

  @Override
  CommandLane<V> willRespond(WillRespondHttp<?> willRespond);

  @Override
  CommandLane<V> didRespond(DidRespondHttp<?> didRespond);
}
