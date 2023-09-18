// Copyright 2015-2023 Nstream, inc.
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

import swim.args.Cmd;
import swim.client.ClientRuntime;

public final class Main {

  private Main() {
    // static
  }

  public static void main(String[] args) {
    final ClientRuntime swim = new ClientRuntime();
    final CliClient cli = new CliClient(swim);

    swim.start();
    final Cmd cmd = cli.mainCmd().parse(args, 0);
    cmd.run();
  }

}
