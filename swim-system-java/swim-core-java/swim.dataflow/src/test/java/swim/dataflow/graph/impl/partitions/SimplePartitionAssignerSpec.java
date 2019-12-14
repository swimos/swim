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

package swim.dataflow.graph.impl.partitions;

import java.util.Collections;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.dataflow.graph.windows.PartitionAssigner;

public class SimplePartitionAssignerSpec {

  @Test
  public void initialStateEmpty() {
    final SimplePartitionAssigner<Integer, Integer, PartitionSet<Integer>> assigner =
        SimplePartitionAssigner.of(n -> n % 5);

    final PartitionSet<Integer> state = assigner.stateFactory().get();
    Assert.assertTrue(state.activePartitions().isEmpty());
  }

  @Test
  public void assignsPartitionsCorrectly() {
    final SimplePartitionAssigner<Integer, Integer, PartitionSet<Integer>> assigner =
        SimplePartitionAssigner.of(n -> n % 5);

    final PartitionSet<Integer> state = assigner.stateFactory().get();
    final PartitionAssigner.Assignment<Integer, PartitionSet<Integer>> assignment =
        assigner.partitionsFor(6, state);

    Assert.assertEquals(assignment.partitions(), Collections.singleton(1));
    final PartitionSet<Integer> newState = assignment.updatedState();

    Assert.assertEquals(newState.activePartitions(), Collections.singleton(1));
  }

}
