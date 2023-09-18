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

package swim.system.router;

import swim.system.HttpBinding;
import swim.system.HttpProxy;

public class PartTableHttpUplink extends HttpProxy {

  protected final PartTable part;

  public PartTableHttpUplink(PartTable part, HttpBinding linkBinding) {
    super(linkBinding);
    this.part = part;
  }

  protected void didOpen() {
    this.part.didOpenUplink(this);
  }

  @Override
  public void didOpenDown() {
    super.didOpenDown();
    this.didOpen();
  }

  protected void didClose() {
    this.part.didCloseUplink(this);
  }

  @Override
  public void didCloseDown() {
    super.didCloseDown();
    this.didClose();
  }

  @Override
  public void didCloseUp() {
    super.didCloseUp();
    this.didClose();
  }

}
