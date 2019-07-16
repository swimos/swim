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

package swim.io;

import swim.concurrent.Stage;

/**
 * Network interface for binding and connecting IP sockets and modems.
 */
public class IpEndpoint implements IpStation {
  protected final Station station;
  protected IpSettings ipSettings;

  public IpEndpoint(Station station, IpSettings ipSettings) {
    this.station = station;
    this.ipSettings = ipSettings;
  }

  public IpEndpoint(Station station) {
    this(station, IpSettings.standard());
  }

  public IpEndpoint(Stage stage, IpSettings ipSettings) {
    this(new Station(stage), ipSettings);
  }

  public IpEndpoint(Stage stage) {
    this(new Station(stage), IpSettings.standard());
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
    return this.ipSettings;
  }

  public void start() {
    this.station.start();
  }

  public void stop() {
    this.station.stop();
  }
}
