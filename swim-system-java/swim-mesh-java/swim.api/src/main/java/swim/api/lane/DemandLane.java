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
import swim.api.lane.function.OnCue;
import swim.api.lane.function.WillEnter;
import swim.api.lane.function.WillLeave;
import swim.api.lane.function.WillUplink;
import swim.structure.Form;

public interface DemandLane<V> extends Lane {
  Form<V> valueForm();

  <V2> DemandLane<V2> valueForm(Form<V2> valueForm);

  <V2> DemandLane<V2> valueClass(Class<V2> valueClass);

  @Override
  DemandLane<V> isSigned(boolean isSigned);

  @Override
  DemandLane<V> observe(Object observer);

  @Override
  DemandLane<V> unobserve(Object observer);

  DemandLane<V> onCue(OnCue<V> onCue);

  @Override
  DemandLane<V> willCommand(WillCommand willCommand);

  @Override
  DemandLane<V> didCommand(DidCommand didCommand);

  @Override
  DemandLane<V> willUplink(WillUplink willUplink);

  @Override
  DemandLane<V> didUplink(DidUplink didUplink);

  @Override
  DemandLane<V> willEnter(WillEnter willEnter);

  @Override
  DemandLane<V> didEnter(DidEnter didEnter);

  @Override
  DemandLane<V> willLeave(WillLeave willLeave);

  @Override
  DemandLane<V> didLeave(DidLeave didLeave);

  @Override
  DemandLane<V> decodeRequest(DecodeRequestHttp<Object> decodeRequest);

  @Override
  DemandLane<V> willRequest(WillRequestHttp<?> willRequest);

  @Override
  DemandLane<V> didRequest(DidRequestHttp<Object> didRequest);

  @Override
  DemandLane<V> doRespond(DoRespondHttp<Object> doRespond);

  @Override
  DemandLane<V> willRespond(WillRespondHttp<?> willRespond);

  @Override
  DemandLane<V> didRespond(DidRespondHttp<?> didRespond);

  void cue();
}
