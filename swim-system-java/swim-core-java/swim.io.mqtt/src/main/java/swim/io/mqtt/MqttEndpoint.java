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

package swim.io.mqtt;

import swim.concurrent.Stage;
import swim.io.IpSettings;
import swim.io.IpStation;
import swim.io.Station;

public class MqttEndpoint implements IpStation, MqttInterface {
  protected final Station station;
  protected MqttSettings mqttSettings;

  public MqttEndpoint(Station station, MqttSettings mqttSettings) {
    this.station = station;
    this.mqttSettings = mqttSettings;
  }

  public MqttEndpoint(Station station) {
    this(station, MqttSettings.standard());
  }

  public MqttEndpoint(Stage stage, MqttSettings mqttSettings) {
    this(new Station(stage), mqttSettings);
  }

  public MqttEndpoint(Stage stage) {
    this(new Station(stage), MqttSettings.standard());
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
    return this.mqttSettings.ipSettings();
  }

  @Override
  public final MqttSettings mqttSettings() {
    return this.mqttSettings;
  }

  public void start() {
    this.station.start();
  }

  public void stop() {
    this.station.stop();
  }
}
