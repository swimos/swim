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

package swim.streamlet;

import org.testng.Assert;
import org.testng.annotations.Test;
import swim.util.Deferred;

public class MemoizingConduitSpec {

  @Test
  public void singleComputation() {
    final MemoizingConduit<String> conduit = new MemoizingConduit<>();
    final Receptacle<String> receptacle = value -> {
      Assert.assertEquals("I'm Expensive", value.get());
      Assert.assertEquals("I'm Expensive", value.get());
      Assert.assertEquals("I'm Expensive", value.get());
    };
    conduit.subscribe(receptacle);

    final CountingDeferred input = new CountingDeferred();

    conduit.notifyChange(input);

    Assert.assertEquals(input.getCount(), 1);
  }

  private static final class CountingDeferred implements Deferred<String> {

    private int count = 0;

    public int getCount() {
      return count;
    }

    @Override
    public String get() {
      ++count;
      return "I'm Expensive";
    }
  }

}
