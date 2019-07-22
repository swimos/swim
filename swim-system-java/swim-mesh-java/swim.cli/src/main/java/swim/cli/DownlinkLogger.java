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

package swim.cli;

import swim.api.function.DidClose;
import swim.api.warp.WarpDownlink;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.OnEvent;
import swim.json.Json;
import swim.recon.Recon;
import swim.structure.Value;

public class DownlinkLogger implements OnEvent<Value>, DidSync, DidUnlink, DidClose {
  final WarpDownlink downlink;
  final String format;

  public DownlinkLogger(WarpDownlink downlink, String format) {
    this.downlink = downlink.observe(this);
    this.format = format;
  }

  public void open() {
    this.downlink.open();
  }

  public void close() {
    this.downlink.close();
  }

  protected void log(String string) {
    System.out.println(string);
  }

  @Override
  public void onEvent(Value value) {
    if ("json".equals(this.format)) {
      log(Json.toString(value));
    } else {
      log(Recon.toString(value));
    }
  }

  @Override
  public void didSync() {
    // stub
  }

  @Override
  public void didUnlink() {
    System.exit(1);
  }

  @Override
  public void didClose() {
    System.exit(0);
  }
}
