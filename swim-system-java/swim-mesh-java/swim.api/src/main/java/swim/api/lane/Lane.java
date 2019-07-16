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
import swim.api.http.HttpLane;
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
import swim.uri.Uri;
import swim.util.Log;

public interface Lane extends HttpLane<Object>, Log {
  Uri hostUri();

  Uri nodeUri();

  Uri laneUri();

  void close();

  boolean isSigned();

  Lane isSigned(boolean isSigned);

  @Override
  Lane observe(Object observer);

  @Override
  Lane unobserve(Object observer);

  Lane willCommand(WillCommand willCommand);

  Lane didCommand(DidCommand willCommand);

  Lane willUplink(WillUplink willUplink);

  Lane didUplink(DidUplink didUplink);

  Lane willEnter(WillEnter willEnter);

  Lane didEnter(DidEnter didEnter);

  Lane willLeave(WillLeave willLeave);

  Lane didLeave(DidLeave didLeave);

  @Override
  Lane decodeRequest(DecodeRequestHttp<Object> decodeRequest);

  @Override
  Lane willRequest(WillRequestHttp<?> willRequest);

  @Override
  Lane didRequest(DidRequestHttp<Object> didRequest);

  @Override
  Lane doRespond(DoRespondHttp<Object> doRespond);

  @Override
  Lane willRespond(WillRespondHttp<?> willRespond);

  @Override
  Lane didRespond(DidRespondHttp<?> didRespond);

  @Override
  void trace(Object message);

  @Override
  void debug(Object message);

  @Override
  void info(Object message);

  @Override
  void warn(Object message);

  @Override
  void error(Object message);
}
