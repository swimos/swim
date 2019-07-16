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

package swim.io.http;

import swim.concurrent.Stage;
import swim.io.IpSettings;
import swim.io.IpStation;
import swim.io.Station;

public class HttpEndpoint implements IpStation, HttpInterface {
  protected final Station station;
  protected HttpSettings httpSettings;

  public HttpEndpoint(Station station, HttpSettings httpSettings) {
    this.station = station;
    this.httpSettings = httpSettings;
  }

  public HttpEndpoint(Station station) {
    this(station, HttpSettings.standard());
  }

  public HttpEndpoint(Stage stage, HttpSettings httpSettings) {
    this(new Station(stage), httpSettings);
  }

  public HttpEndpoint(Stage stage) {
    this(new Station(stage), HttpSettings.standard());
  }

  public final Stage stage() {
    return this.station.stage();
  }

  @Override
  public final Station station() {
    return this.station;
  }

  @Override
  public final IpSettings ipSettings() {
    return this.httpSettings.ipSettings();
  }

  @Override
  public final HttpSettings httpSettings() {
    return this.httpSettings;
  }

  public void start() {
    this.station.start();
  }

  public void stop() {
    this.station.stop();
  }
}
